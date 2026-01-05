/**
 * ColorPickerInput Component
 *
 * Wrapper for ColorPicker that integrates with Ant Design forms
 * Displays as an input field with color preview swatch
 * Opens ColorPicker in a popover on click
 *
 * Usage in PropertiesPanel:
 * <Form.Item label="Color" name="color">
 *   <ColorPickerInput />
 * </Form.Item>
 */

import React, { useState, useCallback } from 'react';
import { Input, Popover } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import type { ColorPickerInputProps } from '../types/color';
import { ColorPicker } from './ColorPicker';

/**
 * ColorPickerInput - Form-friendly color input with popover picker
 */
export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  value,
  onChange,
  format = 'hex',
  showAlpha = true,
  showFormatToggle = true,
  showRecentColors = true,
  maxRecentColors = 10,
  disabled = false,
  placeholder = '#RRGGBB',
  readOnly = false,
  size = 'middle',
  className,
  style,
  ariaLabel = 'Color input',
  'data-testid': testId = 'color-picker-input',
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  /**
   * Handle color change from picker
   */
  const handleColorChange = useCallback(
    (newColor: string) => {
      onChange?.(newColor);
    },
    [onChange]
  );

  /**
   * Handle input field change (manual entry)
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  /**
   * Handle popover visibility change
   */
  const handlePopoverOpenChange = useCallback((open: boolean) => {
    if (!disabled && !readOnly) {
      setPopoverOpen(open);
    }
  }, [disabled, readOnly]);

  /**
   * Handle swatch click - open popover
   */
  const handleSwatchClick = useCallback(() => {
    if (!disabled && !readOnly) {
      setPopoverOpen(true);
    }
  }, [disabled, readOnly]);

  /**
   * Color preview swatch (prefix icon)
   */
  const colorSwatch = (
    <div
      onClick={handleSwatchClick}
      data-testid={`${testId}-swatch`}
      role="button"
      tabIndex={disabled || readOnly ? -1 : 0}
      aria-label="Open color picker"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSwatchClick();
        }
      }}
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        background: value || '#000000',
        border: '1px solid #434343',
        cursor: disabled || readOnly ? 'not-allowed' : 'pointer',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );

  /**
   * ColorPicker popover content
   */
  const pickerContent = (
    <ColorPicker
      value={value}
      onChange={handleColorChange}
      format={format}
      showAlpha={showAlpha}
      showFormatToggle={showFormatToggle}
      showRecentColors={showRecentColors}
      maxRecentColors={maxRecentColors}
      disabled={disabled}
      data-testid={`${testId}-picker`}
    />
  );

  return (
    <Popover
      content={pickerContent}
      trigger="click"
      open={popoverOpen}
      onOpenChange={handlePopoverOpenChange}
      placement="bottomLeft"
      overlayStyle={{ zIndex: 1050 }}
      data-testid={`${testId}-popover`}
    >
      <Input
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        size={size}
        className={className}
        style={style}
        prefix={colorSwatch}
        suffix={<BgColorsOutlined style={{ color: '#888' }} />}
        data-testid={testId}
        aria-label={ariaLabel}
        onClick={() => !readOnly && handlePopoverOpenChange(true)}
        onFocus={() => !readOnly && handlePopoverOpenChange(true)}
      />
    </Popover>
  );
};

export default ColorPickerInput;
