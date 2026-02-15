import type { Action, Card } from '../types/dashboard';
import type { ActionTrigger, CardActionField, ResolvedAction } from '../types/actions';

export type SupportedDomain =
  | 'switch'
  | 'light'
  | 'climate'
  | 'sensor'
  | 'binary_sensor'
  | 'cover'
  | 'lock'
  | 'script'
  | 'automation'
  | 'camera'
  | 'media_player'
  | 'fan'
  | 'vacuum';

const getDomainFromEntityId = (entityId?: string): string | null => {
  if (!entityId || typeof entityId !== 'string') return null;
  const trimmed = entityId.trim();
  const dot = trimmed.indexOf('.');
  if (dot <= 0) return null;
  return trimmed.slice(0, dot);
};

export const getSmartDefaultAction = (entityId: string | undefined): Action | undefined => {
  const domain = getDomainFromEntityId(entityId) as SupportedDomain | null;
  if (!domain) return { action: 'more-info' };

  switch (domain) {
    case 'switch':
    case 'light':
    case 'cover':
    case 'automation':
    case 'media_player':
    case 'fan':
      return { action: 'toggle' };
    case 'climate':
    case 'sensor':
    case 'binary_sensor':
    case 'camera':
      return { action: 'more-info' };
    case 'lock':
      return {
        action: 'call-service',
        service: 'lock.unlock',
        service_data: entityId ? { entity_id: entityId } : undefined,
      };
    case 'script':
      return {
        action: 'call-service',
        service: 'script.turn_on',
        service_data: entityId ? { entity_id: entityId } : undefined,
      };
    case 'vacuum':
      return {
        action: 'call-service',
        service: 'vacuum.start',
        service_data: entityId ? { entity_id: entityId } : undefined,
      };
    default:
      return { action: 'more-info' };
  }
};

export const formatActionLabel = (action?: Action): string => {
  if (!action) return 'None';
  switch (action.action) {
    case 'toggle':
    case 'more-info':
    case 'navigate':
    case 'url':
    case 'none':
    case 'popup':
      return action.action;
    case 'call-service':
      return action.service ? `call-service: ${action.service}` : 'call-service';
    default:
      return 'None';
  }
};

const actionFieldByTrigger: Record<ActionTrigger, CardActionField> = {
  tap: 'tap_action',
  hold: 'hold_action',
  double_tap: 'double_tap_action',
};

const getActionForTrigger = (card: Card, trigger: ActionTrigger): Action | undefined => {
  const field = actionFieldByTrigger[trigger];
  return card[field];
};

export const resolveCardAction = (card: Card, trigger: ActionTrigger): ResolvedAction => {
  // Precedence: explicit user action always wins.
  const explicitAction = getActionForTrigger(card, trigger);
  if (explicitAction) {
    return { action: explicitAction, source: 'user' };
  }

  // Smart defaults apply only when explicitly enabled.
  if (card.smart_defaults === true) {
    return { action: getSmartDefaultAction(card.entity), source: 'smart' };
  }

  // Legacy behavior preservation is tap-only.
  const isLegacyTap = trigger === 'tap'
    && card.smart_defaults === undefined
    && (card.type === 'button' || card.type === 'custom:button-card');
  if (isLegacyTap) {
    return { action: { action: 'toggle' }, source: 'legacy' };
  }

  return { action: undefined, source: 'none' };
};

export const resolveAllCardActions = (card: Card): Record<ActionTrigger, ResolvedAction> => ({
  tap: resolveCardAction(card, 'tap'),
  hold: resolveCardAction(card, 'hold'),
  double_tap: resolveCardAction(card, 'double_tap'),
});

export const resolveTapAction = (card: Card): ResolvedAction => resolveCardAction(card, 'tap');
