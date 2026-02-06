export type MultiEntityMode = 'individual' | 'aggregate' | 'batch';

export type AggregateFunction =
  | 'all_on'
  | 'any_on'
  | 'all_off'
  | 'any_off'
  | 'count_on'
  | 'average_state'
  | 'min_state'
  | 'max_state';

export type BatchActionType = 'turn_on' | 'turn_off' | 'toggle' | 'set_state' | 'call_service';

export interface BatchActionConfig {
  type: BatchActionType;
  value?: string | number | boolean;
  service?: string;
  service_data?: Record<string, unknown>;
}

export interface BatchOperation {
  entityId: string;
  service: string;
  serviceData: Record<string, unknown>;
}

export interface BatchExecutionResult {
  action: BatchActionConfig;
  operations: BatchOperation[];
  failures: Array<{ entityId: string; reason: string }>;
}

export interface AggregateSnapshot {
  total: number;
  available: number;
  onCount: number;
  offCount: number;
  unknownCount: number;
}
