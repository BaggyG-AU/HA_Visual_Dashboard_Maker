import React, { useCallback, useEffect, useRef } from 'react';
import { Divider, InputNumber, Select, Space, Typography } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { Form } from 'antd';
import {
  SPACING_PRESET_VALUES,
  clampCardSpacing,
  getSpacingSideValues,
  isPerSideSpacing,
  resolveSpacingPreset,
  spacingValueToFormValue,
  updateSpacingSide,
} from '../services/cardSpacing';
import type { SpacingMode, SpacingPreset, SpacingSide } from '../types/spacing';

const { Text } = Typography;

interface SpacingControlsProps {
  form: FormInstance;
  onProgrammaticChange: () => void;
}

const sideLabels: Array<{ side: SpacingSide; label: string }> = [
  { side: 'top', label: 'Top' },
  { side: 'right', label: 'Right' },
  { side: 'bottom', label: 'Bottom' },
  { side: 'left', label: 'Left' },
];

const renderBoxModel = (label: string) => (
  <div
    style={{
      border: '1px solid #434343',
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
      background: '#101010',
    }}
  >
    <div style={{ border: '1px dashed #595959', borderRadius: 6, padding: 8 }}>
      <div
        style={{
          border: '1px solid #00d9ff55',
          borderRadius: 4,
          padding: 8,
          textAlign: 'center',
          color: '#c7f6ff',
          fontSize: 12,
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

export const SpacingControls: React.FC<SpacingControlsProps> = ({ form, onProgrammaticChange }) => {
  const marginValue = Form.useWatch('card_margin', { form, preserve: true });
  const paddingValue = Form.useWatch('card_padding', { form, preserve: true });
  const draftValuesRef = useRef<{ card_margin: unknown; card_padding: unknown }>({
    card_margin: marginValue,
    card_padding: paddingValue,
  });

  useEffect(() => {
    draftValuesRef.current.card_margin = marginValue;
  }, [marginValue]);

  useEffect(() => {
    draftValuesRef.current.card_padding = paddingValue;
  }, [paddingValue]);

  const updateField = useCallback((fieldName: 'card_margin' | 'card_padding', nextValue: unknown) => {
    draftValuesRef.current[fieldName] = nextValue;
    form.setFieldsValue({ [fieldName]: nextValue });
    setTimeout(() => {
      onProgrammaticChange();
    }, 0);
  }, [form, onProgrammaticChange]);

  const handleModeChange = useCallback((fieldName: 'card_margin' | 'card_padding', nextMode: SpacingMode) => {
    const currentValue = draftValuesRef.current[fieldName];
    const sides = getSpacingSideValues(currentValue);
    const nextValue = spacingValueToFormValue(nextMode, { ...sides, mode: nextMode });
    updateField(fieldName, nextValue);
  }, [updateField]);

  const handlePresetChange = useCallback((fieldName: 'card_margin' | 'card_padding', preset: SpacingPreset) => {
    if (preset === 'custom') {
      return;
    }

    updateField(fieldName, preset);
  }, [updateField]);

  const handleAllValueChange = useCallback((fieldName: 'card_margin' | 'card_padding', rawValue: unknown) => {
    updateField(fieldName, clampCardSpacing(rawValue, 0));
  }, [updateField]);

  const handleSideChange = useCallback((
    fieldName: 'card_margin' | 'card_padding',
    side: SpacingSide,
    rawValue: unknown,
  ) => {
    const currentValue = draftValuesRef.current[fieldName];
    updateField(fieldName, updateSpacingSide(currentValue, side, rawValue));
  }, [updateField]);

  const renderSection = (
    title: string,
    fieldName: 'card_margin' | 'card_padding',
    watchedValue: unknown,
    testIdPrefix: 'spacing-margin' | 'spacing-padding',
  ) => {
    const mode: SpacingMode = isPerSideSpacing(watchedValue) ? 'per-side' : 'all';
    const preset = resolveSpacingPreset(watchedValue);
    const sides = getSpacingSideValues(watchedValue);

    return (
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ color: 'white' }}>{title}</Text>
        {renderBoxModel(title)}

        <Form.Item
          label={<span style={{ color: 'white' }}>Mode</span>}
          help={<span style={{ color: '#666' }}>Apply one value to all sides or set each side independently</span>}
        >
          <Select
            value={mode}
            options={[
              { value: 'all', label: 'All Sides' },
              { value: 'per-side', label: 'Per Side' },
            ]}
            onChange={(nextMode: SpacingMode) => handleModeChange(fieldName, nextMode)}
            data-testid={`${testIdPrefix}-mode`}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: 'white' }}>Preset</span>}
          help={<span style={{ color: '#666' }}>Choose a preset token or switch to custom values</span>}
        >
          <Select
            value={preset}
            options={[
              { value: 'none', label: 'None (0px)' },
              { value: 'tight', label: 'Tight (4px)' },
              { value: 'normal', label: 'Normal (8px)' },
              { value: 'relaxed', label: 'Relaxed (16px)' },
              { value: 'spacious', label: 'Spacious (24px)' },
              { value: 'custom', label: 'Custom' },
            ]}
            onChange={(nextPreset: SpacingPreset) => handlePresetChange(fieldName, nextPreset)}
            data-testid={`${testIdPrefix}-preset`}
          />
        </Form.Item>

        {mode === 'all' ? (
          <Form.Item
            label={<span style={{ color: 'white' }}>All Sides (px)</span>}
            help={<span style={{ color: '#666' }}>Range: 0 to 64</span>}
          >
            <div data-testid={`${testIdPrefix}-all-field`}>
              <InputNumber
                min={0}
                max={64}
                style={{ width: '100%' }}
                value={sides.top}
                onChange={(next) => handleAllValueChange(fieldName, next)}
                data-testid={`${testIdPrefix}-all`}
              />
            </div>
          </Form.Item>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {sideLabels.map(({ side, label }) => (
              <Form.Item key={`${fieldName}-${side}`} label={<span style={{ color: 'white' }}>{label}</span>}>
                <div data-testid={`${testIdPrefix}-${side}-field`}>
                  <InputNumber
                    min={0}
                    max={64}
                    style={{ width: '100%' }}
                    value={sides[side]}
                    onChange={(next) => handleSideChange(fieldName, side, next)}
                    data-testid={`${testIdPrefix}-${side}`}
                  />
                </div>
              </Form.Item>
            ))}
          </Space>
        )}
      </div>
    );
  };

  return (
    <>
      <Divider />
      <Text strong style={{ color: 'white' }}>Card Spacing</Text>
      {renderSection('Margin', 'card_margin', marginValue, 'spacing-margin')}
      {renderSection('Padding', 'card_padding', paddingValue, 'spacing-padding')}
      <Text style={{ color: '#666', fontSize: 12 }}>
        Presets are stored as tokens in YAML. Custom values are exported as numbers or per-side objects.
      </Text>
    </>
  );
};

export type { SpacingControlsProps };
