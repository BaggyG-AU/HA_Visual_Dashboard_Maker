export type ConditionComparable = string | number | boolean;

export type VisibilityConditionType =
  | 'state_equals'
  | 'state_not_equals'
  | 'state_in'
  | 'state_not_in'
  | 'attribute_equals'
  | 'attribute_greater_than'
  | 'attribute_less_than'
  | 'entity_exists';

export interface VisibilityConditionRule {
  condition: VisibilityConditionType;
  entity: string;
  attribute?: string;
  value?: ConditionComparable;
  values?: ConditionComparable[];
}

export interface VisibilityConditionGroup {
  condition: 'and' | 'or';
  conditions: VisibilityCondition[];
}

export type VisibilityCondition = VisibilityConditionRule | VisibilityConditionGroup;

export type VisualLogicRootOperator = 'and' | 'or';

export interface VisualLogicContract {
  visibility_conditions?: VisibilityCondition[];
  visibility_operator?: VisualLogicRootOperator;
}

export interface StateStyleRule {
  id?: string;
  condition: VisibilityCondition;
  style: Record<string, string | number | boolean>;
  priority?: number;
}

export interface TriggerAnimationConfig {
  id?: string;
  trigger: 'state-change' | 'action' | 'manual';
  target?: string;
  animation: string;
  duration_ms?: number;
  iterations?: number | 'infinite';
  easing?: string;
}
