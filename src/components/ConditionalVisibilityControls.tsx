import React, { useMemo } from 'react';
import { Alert, Button, Divider, Input, Select, Space, Tag, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { VisibilityCondition, VisibilityConditionRule, VisibilityConditionType } from '../types/dashboard';
import { evaluateVisibilityConditions } from '../services/conditionalVisibility';
import { useHAEntities } from '../contexts/HAEntityContext';

const { Text } = Typography;

interface ConditionalVisibilityControlsProps {
  value?: VisibilityCondition[];
  onChange?: (next: VisibilityCondition[]) => void;
}

const CONDITION_TYPE_OPTIONS: Array<{ value: VisibilityConditionType; label: string }> = [
  { value: 'state_equals', label: 'State equals' },
  { value: 'state_not_equals', label: 'State not equals' },
  { value: 'state_in', label: 'State in list' },
  { value: 'state_not_in', label: 'State not in list' },
  { value: 'attribute_equals', label: 'Attribute equals' },
  { value: 'attribute_greater_than', label: 'Attribute greater than' },
  { value: 'attribute_less_than', label: 'Attribute less than' },
  { value: 'entity_exists', label: 'Entity exists' },
];

const parseListValue = (value: string): Array<string | number | boolean> => {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      if (item === 'true') return true;
      if (item === 'false') return false;
      const asNumber = Number(item);
      return Number.isNaN(asNumber) ? item : asNumber;
    });
};

const toScalarValue = (value: string): string | number | boolean => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  const asNumber = Number(value);
  return Number.isNaN(asNumber) ? value : asNumber;
};

const createDefaultRule = (entityId?: string): VisibilityConditionRule => ({
  condition: 'state_equals',
  entity: entityId ?? '',
  value: 'on',
});

const createDefaultGroup = (entityId?: string): VisibilityCondition => ({
  condition: 'and',
  conditions: [createDefaultRule(entityId)],
});

const isGroup = (condition: VisibilityCondition): condition is Extract<VisibilityCondition, { condition: 'and' | 'or' }> => {
  return condition.condition === 'and' || condition.condition === 'or';
};

const testIdForPath = (path: number[]) => path.join('-');

const updateAtPath = (
  conditions: VisibilityCondition[],
  path: number[],
  updater: (existing: VisibilityCondition) => VisibilityCondition,
): VisibilityCondition[] => {
  const [head, ...rest] = path;
  if (head === undefined) return conditions;

  return conditions.map((condition, index) => {
    if (index !== head) return condition;
    if (rest.length === 0) {
      return updater(condition);
    }
    if (!isGroup(condition)) return condition;
    return {
      ...condition,
      conditions: updateAtPath(condition.conditions ?? [], rest, updater),
    };
  });
};

const removeAtPath = (conditions: VisibilityCondition[], path: number[]): VisibilityCondition[] => {
  const [head, ...rest] = path;
  if (head === undefined) return conditions;

  if (rest.length === 0) {
    return conditions.filter((_, index) => index !== head);
  }

  return conditions.map((condition, index) => {
    if (index !== head || !isGroup(condition)) return condition;
    return {
      ...condition,
      conditions: removeAtPath(condition.conditions ?? [], rest),
    };
  });
};

const appendToPath = (
  conditions: VisibilityCondition[],
  path: number[],
  entry: VisibilityCondition,
): VisibilityCondition[] => {
  if (path.length === 0) {
    return [...conditions, entry];
  }

  return updateAtPath(conditions, path, (condition) => {
    if (!isGroup(condition)) return condition;
    return {
      ...condition,
      conditions: [...(condition.conditions ?? []), entry],
    };
  });
};

export const ConditionalVisibilityControls: React.FC<ConditionalVisibilityControlsProps> = ({
  value = [],
  onChange,
}) => {
  const { entities } = useHAEntities();

  const entityOptions = useMemo(() => {
    return Object.keys(entities)
      .sort((a, b) => a.localeCompare(b))
      .map((entityId) => ({ value: entityId, label: entityId }));
  }, [entities]);

  const fallbackEntityId = entityOptions[0]?.value;
  const currentEvaluation = evaluateVisibilityConditions(value, entities);

  const handleRuleTypeChange = (path: number[], nextType: VisibilityConditionType) => {
    onChange?.(
      updateAtPath(value, path, (existing) => {
        if (isGroup(existing)) return existing;
        const nextBase: VisibilityConditionRule = {
          condition: nextType,
          entity: existing.entity || fallbackEntityId || '',
        };

        if (nextType === 'state_in' || nextType === 'state_not_in') {
          return { ...nextBase, values: Array.isArray(existing.values) && existing.values.length > 0 ? existing.values : ['on'] };
        }

        if (nextType === 'attribute_equals' || nextType === 'attribute_greater_than' || nextType === 'attribute_less_than') {
          return {
            ...nextBase,
            attribute: existing.attribute || 'battery',
            value: existing.value ?? 0,
          };
        }

        if (nextType === 'entity_exists') {
          return nextBase;
        }

        return { ...nextBase, value: existing.value ?? 'on' };
      }),
    );
  };

  const renderCondition = (condition: VisibilityCondition, path: number[], nested = false): React.ReactNode => {
    const testSuffix = testIdForPath(path);

    if (isGroup(condition)) {
      return (
        <div
          key={testSuffix}
          style={{
            marginTop: '8px',
            padding: '10px',
            border: '1px solid #2f2f2f',
            borderRadius: '8px',
            background: '#121212',
          }}
          data-testid={`visibility-group-${testSuffix}`}
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
            <div>
              <Text style={{ color: '#fff' }}>Group</Text>
              <Select
                size="small"
                style={{ width: '120px', marginLeft: '8px' }}
                value={condition.condition}
                options={[
                  { value: 'and', label: 'AND' },
                  { value: 'or', label: 'OR' },
                ]}
                onChange={(nextValue: 'and' | 'or') => {
                  onChange?.(
                    updateAtPath(value, path, (existing) => {
                      if (!isGroup(existing)) return existing;
                      return { ...existing, condition: nextValue };
                    }),
                  );
                }}
                data-testid={`visibility-group-operator-${testSuffix}`}
              />
            </div>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onChange?.(removeAtPath(value, path))}
              data-testid={`visibility-remove-${testSuffix}`}
            >
              Remove
            </Button>
          </Space>

          <div style={{ marginTop: '10px' }}>
            {(condition.conditions ?? []).map((child, childIndex) =>
              renderCondition(child, [...path, childIndex], true),
            )}
          </div>

          <Space style={{ marginTop: '10px' }}>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onChange?.(appendToPath(value, path, createDefaultRule(fallbackEntityId)))}
              data-testid={`visibility-add-condition-${testSuffix}`}
            >
              Add Condition
            </Button>
            <Button
              size="small"
              icon={<ApartmentOutlined />}
              onClick={() => onChange?.(appendToPath(value, path, createDefaultGroup(fallbackEntityId)))}
              data-testid={`visibility-add-group-${testSuffix}`}
            >
              Add Group
            </Button>
          </Space>
        </div>
      );
    }

    const rule = condition;
    const isListCondition = rule.condition === 'state_in' || rule.condition === 'state_not_in';
    const isAttributeCondition = rule.condition === 'attribute_equals' || rule.condition === 'attribute_greater_than' || rule.condition === 'attribute_less_than';
    const requiresValue = rule.condition !== 'entity_exists';

    return (
      <div
        key={testSuffix}
        style={{
          marginTop: '8px',
          padding: '10px',
          border: '1px solid #2f2f2f',
          borderRadius: '8px',
          background: nested ? '#151515' : '#111',
        }}
        data-testid={`visibility-condition-${testSuffix}`}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          <Select
            value={rule.condition}
            options={CONDITION_TYPE_OPTIONS}
            onChange={(next) => handleRuleTypeChange(path, next)}
            data-testid={`visibility-condition-type-${testSuffix}`}
          />

          <Select
            showSearch
            optionFilterProp="label"
            value={rule.entity || undefined}
            placeholder="Select entity"
            options={entityOptions}
            onChange={(nextEntity) => {
              onChange?.(
                updateAtPath(value, path, (existing) => {
                  if (isGroup(existing)) return existing;
                  return { ...existing, entity: nextEntity };
                }),
              );
            }}
            data-testid={`visibility-condition-entity-${testSuffix}`}
          />

          {isAttributeCondition && (
            <Input
              value={rule.attribute ?? ''}
              placeholder="Attribute name (e.g. battery)"
              onChange={(event) => {
                const nextAttribute = event.target.value;
                onChange?.(
                  updateAtPath(value, path, (existing) => {
                    if (isGroup(existing)) return existing;
                    return { ...existing, attribute: nextAttribute };
                  }),
                );
              }}
              data-testid={`visibility-condition-attribute-${testSuffix}`}
            />
          )}

          {requiresValue && (
            <Input
              value={
                isListCondition
                  ? (rule.values ?? []).join(', ')
                  : rule.value !== undefined
                    ? String(rule.value)
                    : ''
              }
              placeholder={isListCondition ? 'Comma-separated values (on, idle)' : 'Value'}
              onChange={(event) => {
                const nextRaw = event.target.value;
                onChange?.(
                  updateAtPath(value, path, (existing) => {
                    if (isGroup(existing)) return existing;
                    if (isListCondition) {
                      return { ...existing, values: parseListValue(nextRaw), value: undefined };
                    }
                    return { ...existing, value: toScalarValue(nextRaw), values: undefined };
                  }),
                );
              }}
              data-testid={`visibility-condition-value-${testSuffix}`}
            />
          )}

          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onChange?.(removeAtPath(value, path))}
            data-testid={`visibility-remove-${testSuffix}`}
          >
            Remove
          </Button>
        </Space>
      </div>
    );
  };

  return (
    <div data-testid="conditional-visibility-controls">
      <Divider />
      <Text strong style={{ color: 'white' }}>Conditional Visibility</Text>
      <Text style={{ display: 'block', color: '#888', fontSize: '12px', marginTop: '4px' }}>
        Configure when this card or entity should be visible.
      </Text>

      <div style={{ marginTop: '10px', marginBottom: '10px' }} data-testid="conditional-visibility-preview">
        <Tag color={currentEvaluation ? 'success' : 'error'}>
          Current state: {currentEvaluation ? 'Visible' : 'Hidden'}
        </Tag>
      </div>

      {value.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="No conditions configured. This item is always visible."
        />
      )}

      <div style={{ marginTop: '8px' }}>
        {value.map((condition, index) => renderCondition(condition, [index]))}
      </div>

      <Space style={{ marginTop: '12px' }}>
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onChange?.([...value, createDefaultRule(fallbackEntityId)])}
          data-testid="visibility-add-root-condition"
        >
          Add Condition
        </Button>
        <Button
          size="small"
          icon={<ApartmentOutlined />}
          onClick={() => onChange?.([...value, createDefaultGroup(fallbackEntityId)])}
          data-testid="visibility-add-root-group"
        >
          Add Group
        </Button>
      </Space>
    </div>
  );
};

export default ConditionalVisibilityControls;
