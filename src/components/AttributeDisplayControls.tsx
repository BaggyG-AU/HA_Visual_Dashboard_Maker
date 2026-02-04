import React, { useMemo, useCallback } from 'react';
import { Alert, Divider, Input, InputNumber, Select, Typography } from 'antd';
import type { AttributeDisplayItem, AttributeDisplayLayout, AttributeFormatType } from '../types/attributeDisplay';
import { detectFormatType, formatAttributeValue } from '../services/attributeFormatter';
import { useHAEntities } from '../contexts/HAEntityContext';

const { Text } = Typography;

interface AttributeDisplayControlsProps {
  value?: AttributeDisplayItem[];
  onChange?: (next: AttributeDisplayItem[]) => void;
  layout?: AttributeDisplayLayout;
  onLayoutChange?: (layout: AttributeDisplayLayout) => void;
  entityId?: string | null;
}

const COMMON_GROUPS: Array<{ label: string; keys: string[] }> = [
  { label: 'Battery & Power', keys: ['battery', 'battery_level', 'power', 'energy', 'voltage', 'current'] },
  { label: 'Climate', keys: ['temperature', 'current_temperature', 'humidity', 'pressure'] },
  { label: 'Device', keys: ['friendly_name', 'device_class', 'unit_of_measurement', 'icon'] },
  { label: 'Status', keys: ['last_changed', 'last_updated', 'state', 'availability'] },
];

const toTestId = (attribute: string) => attribute.replace(/[^a-zA-Z0-9_-]/g, '-');

export const AttributeDisplayControls: React.FC<AttributeDisplayControlsProps> = ({
  value = [],
  onChange,
  layout = 'stacked',
  onLayoutChange,
  entityId,
}) => {
  const { getEntity, isLoading } = useHAEntities();
  const entity = entityId ? getEntity(entityId) : null;
  const attributes = entity?.attributes || {};

  const attributeOptions = useMemo(() => {
    const keys = Object.keys(attributes).sort((a, b) => a.localeCompare(b));
    return keys.map((key) => ({
      value: key,
      label: key,
      group: COMMON_GROUPS.find((group) => group.keys.includes(key))?.label,
    }));
  }, [attributes]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, Array<{ value: string; label: string }>>();
    attributeOptions.forEach((option) => {
      const groupLabel = option.group ?? 'Other';
      if (!groups.has(groupLabel)) {
        groups.set(groupLabel, []);
      }
      groups.get(groupLabel)?.push({ value: option.value, label: option.label });
    });
    return Array.from(groups.entries()).map(([label, options]) => ({
      label,
      options,
    }));
  }, [attributeOptions]);

  const handleSelectChange = useCallback((selected: string[]) => {
    const existingMap = new Map(value.map((item) => [item.attribute, item]));
    const next = selected.map((attribute) => {
      const existing = existingMap.get(attribute);
      if (existing) return existing;
      const rawValue = attributes[attribute];
      const type = detectFormatType(rawValue);
      return {
        attribute,
        format: { type },
      } as AttributeDisplayItem;
    });
    onChange?.(next);
  }, [attributes, onChange, value]);

  const updateItem = useCallback((index: number, nextItem: AttributeDisplayItem) => {
    const next = [...value];
    next[index] = nextItem;
    onChange?.(next);
  }, [onChange, value]);

  const removeItem = useCallback((index: number) => {
    const next = value.filter((_, idx) => idx !== index);
    onChange?.(next);
  }, [onChange, value]);

  const reorderItems = useCallback((from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= value.length || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange?.(next);
  }, [onChange, value]);

  if (!entityId) {
    return (
      <Alert
        type="info"
        showIcon
        message="Select an entity to configure attribute display."
      />
    );
  }

  if (isLoading && !entity) {
    return (
      <Alert
        type="info"
        showIcon
        message="Loading entity attributes..."
      />
    );
  }

  if (!entity) {
    return (
      <Alert
        type="warning"
        showIcon
        message={`Entity ${entityId} not found. Attribute display is disabled.`}
      />
    );
  }

  return (
    <div data-testid="attribute-display-controls">
      <Divider />
      <Text strong style={{ color: 'white' }}>Attribute Display</Text>

      <div style={{ marginTop: '8px' }}>
        <Text style={{ color: '#888', fontSize: '12px' }}>Select attributes to display</Text>
      </div>

      <Select
        mode="multiple"
        allowClear
        placeholder="Select attributes"
        value={value.map((item) => item.attribute)}
        options={groupedOptions}
        onChange={handleSelectChange}
        style={{ width: '100%', marginTop: '8px' }}
        data-testid="attribute-display-attribute-select"
      />

      <div style={{ marginTop: '12px' }}>
        <Text style={{ color: '#888', fontSize: '12px' }}>Layout</Text>
        <Select
          value={layout}
          onChange={(next) => onLayoutChange?.(next)}
          options={[
            { value: 'inline', label: 'Inline' },
            { value: 'stacked', label: 'Stacked' },
            { value: 'table', label: 'Table' },
          ]}
          style={{ width: '100%', marginTop: '4px' }}
          data-testid="attribute-display-layout-select"
        />
      </div>

      <div style={{ marginTop: '12px' }} data-testid="attribute-display-selected-list">
        {value.length === 0 && (
          <Text style={{ color: '#666', fontSize: '12px' }}>No attributes selected.</Text>
        )}

        {value.map((item, index) => {
          const testId = toTestId(item.attribute);
          const rawValue = attributes[item.attribute];
          const formatType = item.format?.type ?? detectFormatType(rawValue);
          const preview = formatAttributeValue(rawValue, { ...item.format, type: formatType });

          return (
            <div
              key={`${item.attribute}-${index}`}
              style={{
                marginTop: '12px',
                padding: '12px',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                background: '#111',
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                const from = Number(event.dataTransfer.getData('text/plain'));
                reorderItems(from, index);
              }}
              data-testid={`attribute-display-item-${testId}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <Text strong style={{ color: '#e6e6e6' }}>{item.attribute}</Text>
                <div>
                  <Text
                    style={{ color: '#666', cursor: 'grab', fontSize: '12px', marginRight: '12px' }}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', String(index));
                    }}
                    data-testid={`attribute-display-drag-handle-${testId}`}
                  >
                    Drag
                  </Text>
                  <Text
                    style={{ color: '#ff7875', cursor: 'pointer', fontSize: '12px' }}
                    onClick={() => removeItem(index)}
                    data-testid={`attribute-display-remove-${testId}`}
                  >
                    Remove
                  </Text>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <Text style={{ color: '#888', fontSize: '11px' }}>Label</Text>
                <Input
                  value={item.label ?? ''}
                  placeholder="Optional label"
                  onChange={(event) => updateItem(index, { ...item, label: event.target.value })}
                  data-testid={`attribute-display-label-${testId}`}
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <Text style={{ color: '#888', fontSize: '11px' }}>Format</Text>
                <Select
                  value={formatType}
                  onChange={(nextType: AttributeFormatType) => {
                    updateItem(index, {
                      ...item,
                      format: {
                        ...item.format,
                        type: nextType,
                      },
                    });
                  }}
                  options={[
                    { value: 'number', label: 'Number' },
                    { value: 'boolean', label: 'Boolean' },
                    { value: 'string', label: 'String' },
                    { value: 'timestamp', label: 'Timestamp' },
                    { value: 'json', label: 'JSON' },
                  ]}
                  style={{ width: '100%', marginTop: '4px' }}
                  data-testid={`attribute-display-format-type-${testId}`}
                />
              </div>

              {formatType === 'number' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: '#888', fontSize: '11px' }}>Precision</Text>
                    <InputNumber
                      min={0}
                      max={6}
                      value={typeof item.format?.precision === 'number' ? item.format.precision : null}
                      placeholder="Auto"
                      onChange={(next) => updateItem(index, {
                        ...item,
                        format: { ...item.format, precision: typeof next === 'number' ? next : 0, type: 'number' },
                      })}
                      style={{ width: '100%' }}
                      data-testid={`attribute-display-format-precision-${testId}`}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: '#888', fontSize: '11px' }}>Unit</Text>
                    <Input
                      value={item.format?.unit ?? ''}
                      placeholder="e.g. %"
                      onChange={(event) => updateItem(index, {
                        ...item,
                        format: { ...item.format, unit: event.target.value, type: 'number' },
                      })}
                      data-testid={`attribute-display-format-unit-${testId}`}
                    />
                  </div>
                </div>
              )}

              {formatType === 'boolean' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: '#888', fontSize: '11px' }}>True label</Text>
                    <Input
                      value={item.format?.trueLabel ?? ''}
                      placeholder="On"
                      onChange={(event) => updateItem(index, {
                        ...item,
                        format: { ...item.format, trueLabel: event.target.value, type: 'boolean' },
                      })}
                      data-testid={`attribute-display-format-trueLabel-${testId}`}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: '#888', fontSize: '11px' }}>False label</Text>
                    <Input
                      value={item.format?.falseLabel ?? ''}
                      placeholder="Off"
                      onChange={(event) => updateItem(index, {
                        ...item,
                        format: { ...item.format, falseLabel: event.target.value, type: 'boolean' },
                      })}
                      data-testid={`attribute-display-format-falseLabel-${testId}`}
                    />
                  </div>
                </div>
              )}

              {formatType === 'string' && (
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ color: '#888', fontSize: '11px' }}>Max length</Text>
                  <InputNumber
                    min={5}
                    max={120}
                    value={item.format?.maxLength ?? 32}
                    onChange={(next) => updateItem(index, {
                      ...item,
                      format: { ...item.format, maxLength: typeof next === 'number' ? next : 32, type: 'string' },
                    })}
                    style={{ width: '100%' }}
                    data-testid={`attribute-display-format-maxLength-${testId}`}
                  />
                </div>
              )}

              {formatType === 'timestamp' && (
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ color: '#888', fontSize: '11px' }}>Mode</Text>
                  <Select
                    value={item.format?.timestampMode ?? 'relative'}
                    onChange={(next) => updateItem(index, {
                      ...item,
                      format: { ...item.format, timestampMode: next, type: 'timestamp' },
                    })}
                    options={[
                      { value: 'relative', label: 'Relative' },
                      { value: 'absolute', label: 'Absolute' },
                    ]}
                    style={{ width: '100%', marginTop: '4px' }}
                    data-testid={`attribute-display-format-timestampMode-${testId}`}
                  />
                </div>
              )}

              <div style={{ marginTop: '10px' }}>
                <Text style={{ color: '#888', fontSize: '11px' }}>Preview</Text>
                <div style={{ marginTop: '4px', padding: '6px 8px', background: '#0d0d0d', borderRadius: '6px' }}>
                  <Text style={{ color: '#b7eb8f', fontSize: '12px' }} data-testid={`attribute-display-preview-${testId}`}>
                    {preview || 'N/A'}
                  </Text>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
