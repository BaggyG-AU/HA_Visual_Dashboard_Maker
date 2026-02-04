import type { EntityStates } from './haWebSocketService';
import type { EntityConfig, VisibilityCondition, VisibilityConditionGroup, VisibilityConditionRule } from '../types/dashboard';

const toComparableValue = (value: unknown): string | number | boolean | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;

  if (typeof value === 'object') {
    return null;
  }

  return String(value);
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeState = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  return '';
};

export const stateEquals = (entityId: string, value: string | number | boolean, entities: EntityStates): boolean => {
  const entity = entities[entityId];
  if (!entity) return false;
  return normalizeState(entity.state) === String(value);
};

export const stateNotEquals = (entityId: string, value: string | number | boolean, entities: EntityStates): boolean => {
  const entity = entities[entityId];
  if (!entity) return false;
  return normalizeState(entity.state) !== String(value);
};

export const stateIn = (
  entityId: string,
  values: Array<string | number | boolean>,
  entities: EntityStates,
): boolean => {
  const entity = entities[entityId];
  if (!entity) return false;
  const current = normalizeState(entity.state);
  return values.map((item) => String(item)).includes(current);
};

export const stateNotIn = (
  entityId: string,
  values: Array<string | number | boolean>,
  entities: EntityStates,
): boolean => {
  const entity = entities[entityId];
  if (!entity) return false;
  const current = normalizeState(entity.state);
  return !values.map((item) => String(item)).includes(current);
};

export const attributeEquals = (
  entityId: string,
  attribute: string,
  value: string | number | boolean,
  entities: EntityStates,
): boolean => {
  const entity = entities[entityId];
  if (!entity || !attribute) return false;
  const current = toComparableValue(entity.attributes?.[attribute]);
  if (current === null) return false;
  return String(current) === String(value);
};

export const attributeGreaterThan = (
  entityId: string,
  attribute: string,
  value: string | number | boolean,
  entities: EntityStates,
): boolean => {
  const entity = entities[entityId];
  if (!entity || !attribute) return false;
  const current = asNumber(entity.attributes?.[attribute]);
  const expected = asNumber(value);
  if (current === null || expected === null) return false;
  return current > expected;
};

export const attributeLessThan = (
  entityId: string,
  attribute: string,
  value: string | number | boolean,
  entities: EntityStates,
): boolean => {
  const entity = entities[entityId];
  if (!entity || !attribute) return false;
  const current = asNumber(entity.attributes?.[attribute]);
  const expected = asNumber(value);
  if (current === null || expected === null) return false;
  return current < expected;
};

export const entityExists = (entityId: string, entities: EntityStates): boolean => {
  return Boolean(entityId && entities[entityId]);
};

const isGroup = (condition: VisibilityCondition): condition is VisibilityConditionGroup => {
  return condition.condition === 'and' || condition.condition === 'or';
};

const evaluateRule = (rule: VisibilityConditionRule, entities: EntityStates): boolean => {
  switch (rule.condition) {
    case 'state_equals':
      return rule.value !== undefined ? stateEquals(rule.entity, rule.value, entities) : false;
    case 'state_not_equals':
      return rule.value !== undefined ? stateNotEquals(rule.entity, rule.value, entities) : false;
    case 'state_in':
      return Array.isArray(rule.values) && rule.values.length > 0 ? stateIn(rule.entity, rule.values, entities) : false;
    case 'state_not_in':
      return Array.isArray(rule.values) && rule.values.length > 0 ? stateNotIn(rule.entity, rule.values, entities) : false;
    case 'attribute_equals':
      return rule.attribute !== undefined && rule.value !== undefined
        ? attributeEquals(rule.entity, rule.attribute, rule.value, entities)
        : false;
    case 'attribute_greater_than':
      return rule.attribute !== undefined && rule.value !== undefined
        ? attributeGreaterThan(rule.entity, rule.attribute, rule.value, entities)
        : false;
    case 'attribute_less_than':
      return rule.attribute !== undefined && rule.value !== undefined
        ? attributeLessThan(rule.entity, rule.attribute, rule.value, entities)
        : false;
    case 'entity_exists':
      return entityExists(rule.entity, entities);
    default:
      return false;
  }
};

export const evaluateVisibilityCondition = (condition: VisibilityCondition, entities: EntityStates): boolean => {
  if (isGroup(condition)) {
    const nested = condition.conditions ?? [];
    if (nested.length === 0) return true;

    if (condition.condition === 'and') {
      return nested.every((item) => evaluateVisibilityCondition(item, entities));
    }

    return nested.some((item) => evaluateVisibilityCondition(item, entities));
  }

  return evaluateRule(condition, entities);
};

export const evaluateVisibilityConditions = (
  conditions: VisibilityCondition[] | undefined,
  entities: EntityStates,
  rootOperator: 'and' | 'or' = 'and',
): boolean => {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return true;
  }

  if (rootOperator === 'or') {
    return conditions.some((condition) => evaluateVisibilityCondition(condition, entities));
  }

  return conditions.every((condition) => evaluateVisibilityCondition(condition, entities));
};

export const evaluateEntityVisibility = (entity: string | EntityConfig, entities: EntityStates): boolean => {
  if (typeof entity === 'string') return true;
  if (!entity || typeof entity !== 'object') return true;
  return evaluateVisibilityConditions(entity.visibility_conditions, entities);
};
