import type { Action, Card } from '../types/dashboard';

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
      return action.action;
    case 'call-service':
      return action.service ? `call-service: ${action.service}` : 'call-service';
    default:
      return 'None';
  }
};

type ResolveTapActionResult = {
  action?: Action;
  source: 'user' | 'smart' | 'legacy' | 'none';
};

export const resolveTapAction = (card: Card): ResolveTapActionResult => {
  // Precedence: explicit user tap_action always wins.
  if (card.tap_action) {
    return { action: card.tap_action, source: 'user' };
  }

  // Smart defaults apply only when explicitly enabled.
  if (card.smart_defaults === true) {
    return { action: getSmartDefaultAction(card.entity), source: 'smart' };
  }

  // Legacy behavior preservation (pre-Feature 3.1):
  // Button cards historically defaulted to toggle when no tap_action was set.
  // To avoid breaking existing dashboards, we keep this fallback when the YAML
  // does not explicitly opt in/out via `smart_defaults`.
  const isLegacyEligible = card.smart_defaults === undefined && (card.type === 'button' || card.type === 'custom:button-card');
  if (isLegacyEligible) {
    return { action: { action: 'toggle' }, source: 'legacy' };
  }

  return { action: undefined, source: 'none' };
};

