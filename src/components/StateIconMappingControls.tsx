import React, { useMemo } from 'react';
import { Alert, Button, Card, Input, Select, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { StateIconsMap } from '../types/stateIcons';
import { IconSelect } from './IconSelect';
import { ColorPickerInput } from './ColorPickerInput';
import { useHAEntities } from '../contexts/HAEntityContext';
import { getStateIcon } from '../services/stateIcons';
import { MdiIcon } from './MdiIcon';

const { Text } = Typography;

interface StateIconMappingControlsProps {
  value?: StateIconsMap;
  onChange?: (next: StateIconsMap) => void;
  entityId?: string | null;
}

interface MappingRow {
  key: string;
  state: string;
  icon?: string;
  color?: string;
}

const sanitizeStateKey = (value: string): string => value.trim().toLowerCase();
const DEFAULT_STATE_SUGGESTIONS = ['on', 'off', 'unavailable', 'unknown'];

const parseRows = (value?: StateIconsMap): MappingRow[] => {
  if (!value) return [];
  return Object.entries(value)
    .filter(([state]) => state !== 'default')
    .map(([state, config], index) => {
      if (typeof config === 'string') {
        return { key: `${state}-${index}`, state, icon: config };
      }
      return {
        key: `${state}-${index}`,
        state,
        icon: config?.icon,
        color: config?.color,
      };
    });
};

const parseDefault = (value?: StateIconsMap): { icon?: string; color?: string } => {
  if (!value?.default) return {};
  if (typeof value.default === 'string') {
    return { icon: value.default };
  }
  return {
    icon: value.default.icon,
    color: value.default.color,
  };
};

const buildValue = (rows: MappingRow[], defaults: { icon?: string; color?: string }): StateIconsMap => {
  const next: StateIconsMap = {};

  rows.forEach((row) => {
    const state = sanitizeStateKey(row.state);
    const icon = row.icon?.trim();
    if (!state || !icon) return;

    if (row.color?.trim()) {
      next[state] = { icon, color: row.color.trim() };
      return;
    }

    next[state] = { icon };
  });

  if (defaults.icon?.trim()) {
    if (defaults.color?.trim()) {
      next.default = { icon: defaults.icon.trim(), color: defaults.color.trim() };
    } else {
      next.default = { icon: defaults.icon.trim() };
    }
  }

  return next;
};

export const StateIconMappingControls: React.FC<StateIconMappingControlsProps> = ({
  value,
  onChange,
  entityId,
}) => {
  const { getEntity } = useHAEntities();
  const rows = useMemo(() => parseRows(value), [value]);
  const defaults = useMemo(() => parseDefault(value), [value]);

  const entity = entityId ? getEntity(entityId) : null;
  const currentState = entity?.state ?? 'unknown';

  const preview = useMemo(() => getStateIcon({
    entityId: entityId ?? undefined,
    state: currentState,
    stateIcons: value,
    entityAttributes: entity?.attributes,
  }), [entity?.attributes, entityId, currentState, value]);

  const previewStates = useMemo(() => {
    const rowStates = rows.map((row) => sanitizeStateKey(row.state)).filter(Boolean);
    const stateSet = new Set<string>([currentState, ...rowStates, 'on', 'off', 'unavailable', 'unknown']);
    return Array.from(stateSet);
  }, [currentState, rows]);

  const emitRows = (nextRows: MappingRow[], nextDefaults = defaults) => {
    onChange?.(buildValue(nextRows, nextDefaults));
  };

  const updateRow = (key: string, patch: Partial<MappingRow>) => {
    emitRows(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key: string) => {
    emitRows(rows.filter((row) => row.key !== key));
  };

  const getSuggestedState = (): string => {
    const used = new Set(rows.map((row) => sanitizeStateKey(row.state)).filter(Boolean));
    const suggested = DEFAULT_STATE_SUGGESTIONS.find((candidate) => !used.has(candidate));
    if (suggested) return suggested;
    return `state_${rows.length + 1}`;
  };

  const addRow = () => {
    emitRows([
      ...rows,
      {
        key: `${Date.now()}-${rows.length}`,
        state: getSuggestedState(),
        icon: 'mdi:help-circle-outline',
        color: '#9e9e9e',
      },
    ]);
  };

  const updateDefault = (patch: Partial<{ icon?: string; color?: string }>) => {
    const nextDefaults = { ...defaults, ...patch };
    emitRows(rows, nextDefaults);
  };

  return (
    <div data-testid="state-icon-mapping-controls" style={{ marginTop: 16 }}>
      <Text strong style={{ color: 'white' }}>State Icons</Text>
      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
        Map entity states to icon and color overrides. User mappings take precedence over domain defaults.
      </Text>

      {!entityId && (
        <Alert
          type="info"
          showIcon
          message="Set an entity first to preview live state icon resolution."
          style={{ marginTop: 12 }}
        />
      )}

      <Card size="small" style={{ marginTop: 12, background: '#111', borderColor: '#303030' }}>
        <Space align="center" size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="center" size="small">
            <MdiIcon
              icon={preview.icon}
              color={preview.color || '#d9d9d9'}
              size={26}
              testId="state-icon-preview-icon"
            />
            <div>
              <Text style={{ color: '#f0f0f0', display: 'block' }} data-testid="state-icon-preview-state">
                State: {currentState}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }} data-testid="state-icon-preview-source">
                Resolved from: {preview.source}
              </Text>
            </div>
          </Space>
          <Select
            style={{ minWidth: 180 }}
            value={currentState}
            options={previewStates.map((state) => ({ value: state, label: state }))}
            disabled
            data-testid="state-icon-preview-state-select"
          />
        </Space>
      </Card>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((row, index) => (
          <Card key={row.key} size="small" style={{ background: '#161616', borderColor: '#2f2f2f' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
                <Text style={{ color: '#ddd' }}>Mapping #{index + 1}</Text>
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => removeRow(row.key)}
                  aria-label={`Remove state icon mapping ${index + 1}`}
                  data-testid={`state-icon-remove-${index}`}
                />
              </Space>

              <Input
                value={row.state}
                onChange={(event) => updateRow(row.key, { state: event.target.value })}
                placeholder="State value (e.g., heat, cool, on)"
                data-testid={`state-icon-state-${index}`}
              />

              <IconSelect
                value={row.icon}
                onChange={(icon) => updateRow(row.key, { icon })}
                placeholder="mdi:fire"
                allowClear={false}
                data-testid={`state-icon-icon-${index}`}
              />

              <ColorPickerInput
                value={row.color}
                onChange={(color) => updateRow(row.key, { color })}
                placeholder="Pick icon color (optional)"
                data-testid={`state-icon-color-${index}`}
              />
            </Space>
          </Card>
        ))}
      </div>

      <Button
        icon={<PlusOutlined />}
        onClick={addRow}
        style={{ marginTop: 12 }}
        data-testid="state-icon-add-mapping"
      >
        Add state mapping
      </Button>

      <Card size="small" style={{ marginTop: 16, background: '#121212', borderColor: '#2f2f2f' }}>
        <Text strong style={{ color: '#f0f0f0', display: 'block', marginBottom: 8 }}>
          Default fallback icon
        </Text>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <IconSelect
            value={defaults.icon}
            onChange={(icon) => updateDefault({ icon })}
            placeholder="mdi:help-circle-outline"
            data-testid="state-icon-default-icon"
          />
          <ColorPickerInput
            value={defaults.color}
            onChange={(color) => updateDefault({ color })}
            placeholder="Default icon color (optional)"
            data-testid="state-icon-default-color"
          />
        </Space>
      </Card>
    </div>
  );
};

export default StateIconMappingControls;
