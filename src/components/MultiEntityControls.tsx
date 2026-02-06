import React, { useMemo, useCallback } from 'react';
import { Alert, Button, Card, Select, Space, Tag, Typography } from 'antd';
import { DeleteOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useHAEntities } from '../contexts/HAEntityContext';
import {
  buildAggregateSnapshot,
  evaluateAggregateFunction,
  summarizeAggregateState,
} from '../services/multiEntity';
import type { AggregateFunction, BatchActionType, MultiEntityMode } from '../types/multiEntity';

const { Text } = Typography;

interface MultiEntityControlsProps {
  value?: string[];
  onChange?: (next: string[]) => void;
  mode?: MultiEntityMode;
  onModeChange?: (mode: MultiEntityMode) => void;
  aggregateFunction?: AggregateFunction;
  onAggregateFunctionChange?: (next: AggregateFunction) => void;
  batchActions?: BatchActionType[];
  onBatchActionsChange?: (next: BatchActionType[]) => void;
}

const AGGREGATE_OPTIONS: Array<{ value: AggregateFunction; label: string }> = [
  { value: 'count_on', label: 'Count On (3/5 on)' },
  { value: 'all_on', label: 'All On' },
  { value: 'any_on', label: 'Any On' },
  { value: 'all_off', label: 'All Off' },
  { value: 'any_off', label: 'Any Off' },
  { value: 'average_state', label: 'Average State (numeric)' },
  { value: 'min_state', label: 'Minimum State (numeric)' },
  { value: 'max_state', label: 'Maximum State (numeric)' },
];

const BATCH_OPTIONS: Array<{ value: BatchActionType; label: string }> = [
  { value: 'turn_on', label: 'Turn all on' },
  { value: 'turn_off', label: 'Turn all off' },
  { value: 'toggle', label: 'Toggle all' },
];

const moveItem = (items: string[], from: number, to: number): string[] => {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const formatAggregateValue = (value: boolean | number | null): string => {
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return 'N/A';
};

export const MultiEntityControls: React.FC<MultiEntityControlsProps> = ({
  value = [],
  onChange,
  mode = 'individual',
  onModeChange,
  aggregateFunction = 'count_on',
  onAggregateFunctionChange,
  batchActions = ['turn_on', 'turn_off', 'toggle'],
  onBatchActionsChange,
}) => {
  const { entities } = useHAEntities();
  const entityOptions = useMemo(() => {
    return Object.values(entities)
      .map((entity) => ({
        value: entity.entity_id,
        label: `${entity.attributes?.friendly_name || entity.entity_id} (${entity.entity_id})`,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [entities]);

  const uniqueEntities = useMemo(() => {
    const seen = new Set<string>();
    return value.filter((entityId) => {
      if (seen.has(entityId)) return false;
      seen.add(entityId);
      return true;
    });
  }, [value]);

  const snapshot = useMemo(() => buildAggregateSnapshot(uniqueEntities, entities), [entities, uniqueEntities]);
  const aggregateValue = useMemo(
    () => evaluateAggregateFunction(aggregateFunction, uniqueEntities, entities),
    [aggregateFunction, entities, uniqueEntities],
  );

  const removeEntity = useCallback((entityId: string) => {
    onChange?.(uniqueEntities.filter((entry) => entry !== entityId));
  }, [onChange, uniqueEntities]);

  const reorder = useCallback((from: number, to: number) => {
    onChange?.(moveItem(uniqueEntities, from, to));
  }, [onChange, uniqueEntities]);

  return (
    <div data-testid="multi-entity-controls" style={{ marginTop: 16 }}>
      <Text strong style={{ color: 'white' }}>Multi-entity Support</Text>
      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
        Configure this card to control multiple entities in individual, aggregate, or batch mode.
      </Text>

      <div style={{ marginTop: 12 }}>
        <Text style={{ color: '#d9d9d9', fontSize: 12 }}>Entities</Text>
        <Select
          mode="multiple"
          value={uniqueEntities}
          onChange={(next) => onChange?.(next)}
          options={entityOptions}
          showSearch
          filterOption={(input, option) => {
            const label = typeof option?.label === 'string' ? option.label : '';
            const value = typeof option?.value === 'string' ? option.value : '';
            return label.toLowerCase().includes(input.toLowerCase()) || value.toLowerCase().includes(input.toLowerCase());
          }}
          placeholder="Select entities"
          style={{ width: '100%', marginTop: 4 }}
          data-testid="multi-entity-select"
        />
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }} data-testid="multi-entity-list">
        {uniqueEntities.length === 0 && (
          <Text style={{ color: '#666', fontSize: 12 }} data-testid="multi-entity-empty">
            Add entities to enable multi-entity behavior.
          </Text>
        )}

        {uniqueEntities.map((entityId, index) => {
          const state = entities[entityId]?.state ?? 'unavailable';
          const testIdEntity = entityId.replace(/[^a-zA-Z0-9_-]/g, '-');

          return (
            <Card
              key={`${entityId}-${index}`}
              size="small"
              style={{ background: '#141414', borderColor: '#2a2a2a' }}
              data-testid={`multi-entity-item-${testIdEntity}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const fromIndex = Number(event.dataTransfer.getData('text/plain'));
                reorder(fromIndex, index);
              }}
            >
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small" align="center">
                  <Text
                    draggable
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.altKey && event.key === 'ArrowUp') {
                        event.preventDefault();
                        reorder(index, index - 1);
                      }
                      if (event.altKey && event.key === 'ArrowDown') {
                        event.preventDefault();
                        reorder(index, index + 1);
                      }
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', String(index));
                    }}
                    style={{ color: '#888', cursor: 'grab', fontSize: 12 }}
                    aria-label={`Drag to reorder ${entityId}`}
                    data-testid={`multi-entity-drag-${testIdEntity}`}
                  >
                    Drag
                  </Text>
                  <Text style={{ color: '#e6e6e6' }} data-testid={`multi-entity-label-${testIdEntity}`}>{entityId}</Text>
                  <Tag color={state === 'on' ? 'green' : 'default'} data-testid={`multi-entity-state-${testIdEntity}`}>{state}</Tag>
                </Space>
                <Space size="small">
                  <Button
                    size="small"
                    icon={<UpOutlined />}
                    disabled={index === 0}
                    onClick={() => reorder(index, index - 1)}
                    aria-label={`Move ${entityId} up`}
                    data-testid={`multi-entity-move-up-${testIdEntity}`}
                  />
                  <Button
                    size="small"
                    icon={<DownOutlined />}
                    disabled={index === uniqueEntities.length - 1}
                    onClick={() => reorder(index, index + 1)}
                    aria-label={`Move ${entityId} down`}
                    data-testid={`multi-entity-move-down-${testIdEntity}`}
                  />
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeEntity(entityId)}
                    aria-label={`Remove ${entityId}`}
                    data-testid={`multi-entity-remove-${testIdEntity}`}
                  />
                </Space>
              </Space>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <Text style={{ color: '#d9d9d9', fontSize: 12 }}>Behavior mode</Text>
        <Select
          value={mode}
          onChange={(next) => onModeChange?.(next)}
          options={[
            { value: 'individual', label: 'Individual controls' },
            { value: 'aggregate', label: 'Aggregate state' },
            { value: 'batch', label: 'Batch actions' },
          ]}
          style={{ width: '100%', marginTop: 4 }}
          data-testid="multi-entity-mode-select"
        />
      </div>

      {mode === 'aggregate' && (
        <div style={{ marginTop: 12 }} data-testid="multi-entity-aggregate-config">
          <Text style={{ color: '#d9d9d9', fontSize: 12 }}>Aggregate function</Text>
          <Select
            value={aggregateFunction}
            onChange={(next) => onAggregateFunctionChange?.(next)}
            options={AGGREGATE_OPTIONS}
            style={{ width: '100%', marginTop: 4 }}
            data-testid="multi-entity-aggregate-function-select"
          />
        </div>
      )}

      {mode === 'batch' && (
        <div style={{ marginTop: 12 }} data-testid="multi-entity-batch-config">
          <Text style={{ color: '#d9d9d9', fontSize: 12 }}>Batch actions</Text>
          <Select
            mode="multiple"
            value={batchActions}
            onChange={(next) => onBatchActionsChange?.(next as BatchActionType[])}
            options={BATCH_OPTIONS}
            style={{ width: '100%', marginTop: 4 }}
            data-testid="multi-entity-batch-actions-select"
          />
        </div>
      )}

      <Alert
        type="info"
        showIcon
        style={{ marginTop: 12 }}
        message={(
          <span data-testid="multi-entity-aggregate-indicator">
            {`Aggregate indicator: ${summarizeAggregateState(uniqueEntities, entities)}`}
          </span>
        )}
        description={
          <span data-testid="multi-entity-aggregate-preview">
            {`Function result (${aggregateFunction}): ${formatAggregateValue(aggregateValue)} | `}
            {`${snapshot.available}/${snapshot.total} available`}
          </span>
        }
      />
    </div>
  );
};

export default MultiEntityControls;
