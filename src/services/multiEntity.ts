import type { Card } from '../types/dashboard';
import type { EntityStates } from './haWebSocketService';
import type {
  AggregateFunction,
  AggregateSnapshot,
  BatchActionConfig,
  BatchExecutionResult,
  BatchOperation,
  BatchActionType,
} from '../types/multiEntity';

const ON_STATES = new Set([
  'on',
  'open',
  'playing',
  'home',
  'locked',
  'active',
  'heat',
  'cool',
]);

const OFF_STATES = new Set([
  'off',
  'closed',
  'idle',
  'not_home',
  'unlocked',
  'standby',
]);

const numericState = (state: unknown): number | null => {
  if (typeof state === 'number') {
    return Number.isFinite(state) ? state : null;
  }
  if (typeof state === 'string' && state.trim().length > 0) {
    const parsed = Number(state);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const normalizeEntityIdList = (entities: unknown[] | undefined): string[] => {
  if (!Array.isArray(entities)) return [];

  return entities
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object' && 'entity' in entry) {
        const entity = (entry as { entity?: unknown }).entity;
        return typeof entity === 'string' ? entity : undefined;
      }
      return undefined;
    })
    .filter((entityId): entityId is string => typeof entityId === 'string' && entityId.trim().length > 0);
};

export const resolveMultiEntityIds = (card: Pick<Card, 'entity' | 'entities'>): string[] => {
  const ids = normalizeEntityIdList(card.entities as unknown[] | undefined);

  if (ids.length > 0) {
    return ids;
  }

  if (typeof card.entity === 'string' && card.entity.trim().length > 0) {
    return [card.entity];
  }

  return [];
};

export const isOnState = (state: unknown): boolean => {
  if (typeof state !== 'string') return false;
  const normalized = state.trim().toLowerCase();
  if (!normalized) return false;
  if (ON_STATES.has(normalized)) return true;
  if (OFF_STATES.has(normalized)) return false;

  const maybeNumber = Number(normalized);
  if (!Number.isNaN(maybeNumber)) {
    return maybeNumber > 0;
  }

  return false;
};

const entityStateValue = (entityId: string, states: EntityStates): string | null => {
  return states[entityId]?.state ?? null;
};

export const buildAggregateSnapshot = (entityIds: string[], states: EntityStates): AggregateSnapshot => {
  const total = entityIds.length;
  let available = 0;
  let onCount = 0;
  let offCount = 0;
  let unknownCount = 0;

  entityIds.forEach((entityId) => {
    const state = entityStateValue(entityId, states);
    if (state === null) {
      unknownCount += 1;
      return;
    }

    available += 1;

    const normalized = state.trim().toLowerCase();
    if (ON_STATES.has(normalized) || (!OFF_STATES.has(normalized) && isOnState(normalized))) {
      onCount += 1;
      return;
    }

    if (OFF_STATES.has(normalized)) {
      offCount += 1;
      return;
    }

    if (normalized === 'unknown' || normalized === 'unavailable') {
      unknownCount += 1;
      return;
    }

    offCount += 1;
  });

  return {
    total,
    available,
    onCount,
    offCount,
    unknownCount,
  };
};

export const allOn = (entityIds: string[], states: EntityStates): boolean => {
  if (entityIds.length === 0) return false;
  return entityIds.every((entityId) => isOnState(entityStateValue(entityId, states)));
};

export const anyOn = (entityIds: string[], states: EntityStates): boolean => {
  return entityIds.some((entityId) => isOnState(entityStateValue(entityId, states)));
};

export const allOff = (entityIds: string[], states: EntityStates): boolean => {
  if (entityIds.length === 0) return false;
  return entityIds.every((entityId) => !isOnState(entityStateValue(entityId, states)));
};

export const anyOff = (entityIds: string[], states: EntityStates): boolean => {
  return entityIds.some((entityId) => !isOnState(entityStateValue(entityId, states)));
};

export const countOn = (entityIds: string[], states: EntityStates): number => {
  return entityIds.reduce((count, entityId) => {
    return count + (isOnState(entityStateValue(entityId, states)) ? 1 : 0);
  }, 0);
};

const numericStates = (entityIds: string[], states: EntityStates): number[] => {
  return entityIds
    .map((entityId) => numericState(entityStateValue(entityId, states)))
    .filter((value): value is number => value !== null);
};

export const averageState = (entityIds: string[], states: EntityStates): number | null => {
  const values = numericStates(entityIds, states);
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
};

export const minState = (entityIds: string[], states: EntityStates): number | null => {
  const values = numericStates(entityIds, states);
  if (values.length === 0) return null;
  return Math.min(...values);
};

export const maxState = (entityIds: string[], states: EntityStates): number | null => {
  const values = numericStates(entityIds, states);
  if (values.length === 0) return null;
  return Math.max(...values);
};

export const evaluateAggregateFunction = (
  aggregateFunction: AggregateFunction,
  entityIds: string[],
  states: EntityStates,
): boolean | number | null => {
  switch (aggregateFunction) {
    case 'all_on':
      return allOn(entityIds, states);
    case 'any_on':
      return anyOn(entityIds, states);
    case 'all_off':
      return allOff(entityIds, states);
    case 'any_off':
      return anyOff(entityIds, states);
    case 'count_on':
      return countOn(entityIds, states);
    case 'average_state':
      return averageState(entityIds, states);
    case 'min_state':
      return minState(entityIds, states);
    case 'max_state':
      return maxState(entityIds, states);
    default:
      return countOn(entityIds, states);
  }
};

const domainFor = (entityId: string): string => {
  if (!entityId.includes('.')) return 'homeassistant';
  return entityId.split('.')[0];
};

const buildOperation = (entityId: string, service: string, serviceData: Record<string, unknown> = {}): BatchOperation => ({
  entityId,
  service,
  serviceData: {
    entity_id: entityId,
    ...serviceData,
  },
});

const normalizeBatchAction = (action: BatchActionConfig | BatchActionType): BatchActionConfig => {
  if (typeof action === 'string') {
    return { type: action };
  }
  return action;
};

export const planBatchAction = (
  actionInput: BatchActionConfig | BatchActionType,
  entityIds: string[],
  states: EntityStates,
): BatchOperation[] => {
  const action = normalizeBatchAction(actionInput);
  switch (action.type) {
    case 'turn_on':
      return entityIds.map((entityId) => buildOperation(entityId, `${domainFor(entityId)}.turn_on`));
    case 'turn_off':
      return entityIds.map((entityId) => buildOperation(entityId, `${domainFor(entityId)}.turn_off`));
    case 'toggle':
      return entityIds.map((entityId) => {
        const nextService = isOnState(entityStateValue(entityId, states))
          ? `${domainFor(entityId)}.turn_off`
          : `${domainFor(entityId)}.turn_on`;
        return buildOperation(entityId, nextService);
      });
    case 'set_state':
      return entityIds.map((entityId) => {
        if (action.value === true || action.value === 'on') {
          return buildOperation(entityId, `${domainFor(entityId)}.turn_on`);
        }
        if (action.value === false || action.value === 'off') {
          return buildOperation(entityId, `${domainFor(entityId)}.turn_off`);
        }
        return buildOperation(entityId, `${domainFor(entityId)}.set_value`, {
          value: action.value,
        });
      });
    case 'call_service':
      return entityIds.map((entityId) => buildOperation(entityId, action.service || `${domainFor(entityId)}.toggle`, action.service_data));
    default:
      return [];
  }
};

export const isDestructiveBatchAction = (actionInput: BatchActionConfig | BatchActionType): boolean => {
  const action = normalizeBatchAction(actionInput);
  if (action.type === 'turn_off') return true;
  if (action.type === 'set_state') {
    return action.value === false || action.value === 'off';
  }
  return false;
};

export const executeBatchAction = (
  actionInput: BatchActionConfig | BatchActionType,
  entityIds: string[],
  states: EntityStates,
): BatchExecutionResult => {
  const action = normalizeBatchAction(actionInput);
  const operations = planBatchAction(action, entityIds, states);
  const failures: Array<{ entityId: string; reason: string }> = [];

  operations.forEach((operation) => {
    if (!operation.entityId) {
      failures.push({ entityId: operation.entityId, reason: 'Missing entity id' });
    }
  });

  return {
    action,
    operations,
    failures,
  };
};

export const summarizeAggregateState = (entityIds: string[], states: EntityStates): string => {
  const snapshot = buildAggregateSnapshot(entityIds, states);
  if (snapshot.total === 0) return 'No entities';
  return `${snapshot.onCount}/${snapshot.total} on`;
};
