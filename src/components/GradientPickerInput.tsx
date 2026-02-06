import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Input, Popover, Space, Typography } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { GradientEditor } from './GradientEditor';
import { gradientToCss, parseGradient } from '../utils/gradientConversions';
import type { GradientDefinition } from '../types/gradient';

const { Text } = Typography;

export interface GradientPickerInputProps {
  value?: string;
  onChange?: (css: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  'data-testid'?: string;
}

export const GradientPickerInput: React.FC<GradientPickerInputProps> = ({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  'data-testid': testId = 'gradient-picker-input',
}) => {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<string | undefined>(value);
  const gradient: GradientDefinition = useMemo(() => parseGradient(localValue), [localValue]);
  const css = useMemo(() => gradientToCss(gradient), [gradient]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((cssValue: string) => {
    setLocalValue(cssValue);
    onChange?.(cssValue);
  }, [onChange]);

  const handlePopoverChange = (next: boolean) => {
    if (disabled || readOnly) return;
    setOpen(next);
  };

  const swatch = (
    <div
      data-testid={`${testId}-swatch`}
      role="button"
      tabIndex={disabled || readOnly ? -1 : 0}
      aria-label="Open gradient editor"
      onClick={() => handlePopoverChange(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePopoverChange(true);
        }
      }}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid #434343',
        background: css,
        cursor: disabled || readOnly ? 'not-allowed' : 'pointer',
      }}
    />
  );

  return (
    <Popover
      open={open}
      onOpenChange={handlePopoverChange}
      trigger="click"
      placement="bottomLeft"
      overlayStyle={{ zIndex: 1050 }}
      destroyTooltipOnHide
      content={
        <GradientEditor
          value={localValue}
          onChange={handleChange}
          data-testid={`${testId}-editor`}
        />
      }
      // Render in body so the editor is not clipped by the PropertiesPanel or canvas overflow
      getPopupContainer={() => document.body}
    >
      <div style={{ width: '100%' }}>
        <Input
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          prefix={swatch}
          suffix={<BgColorsOutlined style={{ color: '#888' }} />}
          placeholder="linear-gradient(90deg, #F00 0%, #00F 100%)"
          disabled={disabled}
          readOnly={readOnly}
          data-testid={testId}
          onFocus={() => handlePopoverChange(true)}
          aria-label="Gradient CSS input"
        />
        <Space size="small" style={{ display: 'block', marginTop: 6 }}>
          <Text style={{ color: '#888' }}>Preview:</Text>
          <div
            style={{
              width: '100%',
              height: 60,
              borderRadius: 6,
              border: '1px solid #333',
              background: css,
              transition: 'background 120ms linear',
            }}
            aria-label="Gradient inline preview"
            data-testid={`${testId}-preview`}
          />
        </Space>
      </div>
    </Popover>
  );
};

export default GradientPickerInput;
