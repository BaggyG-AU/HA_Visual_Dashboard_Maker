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

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Input, Popover } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import type { ColorPickerInputProps } from '../types/color';
import { ColorPicker } from './ColorPicker';

/**
 * Module-level cache that persists popover open state across unmount/remount cycles.
 * When the parent (PropertiesPanel Tabs) re-renders after an onChange and causes this
 * component to unmount and remount, the cached state is restored if within the TTL.
 */
const popoverStateCache = new Map<string, { open: boolean; timestamp: number }>();
const POPOVER_STATE_TTL = 1000;

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
  const [popoverOpen, setPopoverOpenRaw] = useState(() => {
    const cached = popoverStateCache.get(testId);
    if (cached && Date.now() - cached.timestamp < POPOVER_STATE_TTL) {
      return cached.open;
    }
    return false;
  });

  const setPopoverOpen = useCallback((open: boolean) => {
    popoverStateCache.set(testId, { open, timestamp: Date.now() });
    setPopoverOpenRaw(open);
  }, [testId]);

  // Allow keyboard users to dismiss the popover with Escape
  // Ant Design Popover content renders in a portal; we attach a document-level handler
  // so Escape works consistently even when focus is inside the popover content.
  useEffect(() => {
    if (!popoverOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPopoverOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [popoverOpen, setPopoverOpen]);

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
  }, [disabled, readOnly, setPopoverOpen]);

  /**
   * Handle swatch click - open popover
   */
  const handleSwatchClick = useCallback(() => {
    if (!disabled && !readOnly) {
      setPopoverOpen(true);
    }
  }, [disabled, readOnly, setPopoverOpen]);

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
   * ColorPicker popover content — memoized to prevent Popover portal re-mount on unrelated re-renders
   */
  const pickerContent = useMemo(
    () => (
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
    ),
    [value, handleColorChange, format, showAlpha, showFormatToggle, showRecentColors, maxRecentColors, disabled, testId]
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
      // Render in body so the picker is not clipped and stays above the canvas/panel stacking contexts
      getPopupContainer={() => document.body}
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
        onKeyDown={(e) => {
          if (readOnly || disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePopoverOpenChange(true);
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            handlePopoverOpenChange(false);
          }
        }}
      />
    </Popover>
  );
};

export default ColorPickerInput;
