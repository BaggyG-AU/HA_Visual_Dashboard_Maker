/**
 * ColorPicker Component
 *
 * Full-featured color picker with:
 * - Hue/saturation selector with alpha channel
 * - Format toggle (hex/RGB/HSL)
 * - Recent colors history
 * - Keyboard navigation
 * - ARIA labels for accessibility
 *
 * Built with react-colorful for the core picker UI
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { RgbaColorPicker } from 'react-colorful';
import { Button, Space, Input, Divider, Typography } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import type { ColorPickerProps, ColorFormat, RgbaColor } from '../types/color';
import { useRecentColors } from '../hooks/useRecentColors';
import {
  parseColor,
  rgbaToHex,
  formatRgba,
  formatHsla,
  rgbaToHsla,
  validateHex,
  normalizeHex,
} from '../utils/colorConversions';

const { Text } = Typography;

/**
 * ColorPicker component with format toggle and recent colors
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#000000',
  onChange,
  format: initialFormat = 'hex',
  showAlpha = true,
  showFormatToggle = true,
  showRecentColors = true,
  maxRecentColors = 10,
  disabled = false,
  ariaLabel = 'Color picker',
  'data-testid': testId = 'color-picker',
}) => {
  const [format, setFormat] = useState<ColorFormat>(initialFormat);
  const [inputValue, setInputValue] = useState<string>(value);
  const { recentColors, addRecentColor, clearRecentColors } = useRecentColors({
    maxColors: maxRecentColors,
  });

  // Parse current color value to RGBA
  const currentRgba = useMemo((): RgbaColor => {
    const parsed = parseColor(value);
    return parsed || { r: 0, g: 0, b: 0, a: 1 };
  }, [value]);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  /**
   * Handle color change from react-colorful picker
   */
  const handlePickerChange = useCallback(
    (rgba: RgbaColor) => {
      if (disabled) return;

      // Convert to current format
      let newValue: string;
      switch (format) {
        case 'rgb':
          newValue = formatRgba(rgba);
          break;
        case 'hsl':
          newValue = formatHsla(rgbaToHsla(rgba));
          break;
        case 'hex':
        default:
          newValue = rgbaToHex(rgba);
          break;
      }

      setInputValue(newValue);
      onChange?.(newValue);
    },
    [format, disabled, onChange]
  );

  /**
   * Handle input field change (manual entry)
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const newValue = e.target.value;
      setInputValue(newValue);

      // Validate and update if valid
      if (format === 'hex') {
        const validation = validateHex(newValue);
        if (validation.valid && validation.normalized) {
          onChange?.(validation.normalized);
        }
      } else {
        // For RGB/HSL, try to parse
        const parsed = parseColor(newValue);
        if (parsed) {
          onChange?.(newValue);
        }
      }
    },
    [format, disabled, onChange]
  );

  /**
   * Handle input blur - normalize value
   */
  const handleInputBlur = useCallback(() => {
    if (disabled) return;

    if (format === 'hex') {
      const validation = validateHex(inputValue);
      if (validation.valid && validation.normalized) {
        setInputValue(validation.normalized);
        onChange?.(validation.normalized);
        addRecentColor(validation.normalized);
      }
    } else {
      // For RGB/HSL, validate by parsing
      const parsed = parseColor(inputValue);
      if (parsed) {
        addRecentColor(inputValue);
      } else {
        // Revert to last valid value
        setInputValue(value);
      }
    }
  }, [format, inputValue, value, disabled, onChange, addRecentColor]);

  /**
   * Handle format toggle
   */
  const handleFormatToggle = useCallback(() => {
    if (disabled) return;

    const formats: ColorFormat[] = ['hex', 'rgb', 'hsl'];
    const currentIndex = formats.indexOf(format);
    const nextFormat = formats[(currentIndex + 1) % formats.length];
    setFormat(nextFormat);

    // Convert current value to new format
    const rgba = parseColor(value);
    if (rgba) {
      let newValue: string;
      switch (nextFormat) {
        case 'rgb':
          newValue = formatRgba(rgba);
          break;
        case 'hsl':
          newValue = formatHsla(rgbaToHsla(rgba));
          break;
        case 'hex':
        default:
          newValue = rgbaToHex(rgba);
          break;
      }
      setInputValue(newValue);
      onChange?.(newValue);
    }
  }, [format, value, disabled, onChange]);

  /**
   * Handle recent color click
   */
  const handleRecentColorClick = useCallback(
    (color: string) => {
      if (disabled) return;

      setInputValue(color);
      onChange?.(color);
    },
    [disabled, onChange]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleInputBlur();
      } else if (e.key === 'Escape') {
        // Revert to last valid value
        setInputValue(value);
      }
    },
    [value, handleInputBlur]
  );

  return (
    <div
      data-testid={testId}
      aria-label={ariaLabel}
      style={{
        padding: '12px',
        background: '#1a1a1a',
        borderRadius: '8px',
        minWidth: '280px',
      }}
    >
      {/* Color Picker */}
      <div style={{ marginBottom: '12px' }}>
        <RgbaColorPicker
          color={currentRgba}
          onChange={handlePickerChange}
          style={{
            width: '100%',
            height: '180px',
          }}
        />
      </div>

      {/* Format Toggle and Input */}
      <Space.Compact style={{ width: '100%', marginBottom: '12px' }}>
        {showFormatToggle && (
          <Button
            onClick={handleFormatToggle}
            disabled={disabled}
            data-testid={`${testId}-format-toggle`}
            style={{ width: '60px' }}
          >
            {format.toUpperCase()}
          </Button>
        )}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={format === 'hex' ? '#RRGGBB' : format}
          data-testid={`${testId}-input`}
          aria-label={`Color value in ${format} format`}
          style={{ flex: 1 }}
        />
      </Space.Compact>

      {/* Color Preview */}
      <div
        style={{
          width: '100%',
          height: '40px',
          borderRadius: '4px',
          background: value,
          border: '1px solid #434343',
          marginBottom: '12px',
        }}
        data-testid={`${testId}-preview`}
        aria-label="Color preview"
      />

      {/* Recent Colors */}
      {showRecentColors && recentColors.length > 0 && (
        <>
          <Divider style={{ margin: '12px 0', borderColor: '#434343' }} />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: '#888', fontSize: '12px' }}>Recent Colors</Text>
              <Button
                type="text"
                size="small"
                icon={<UndoOutlined />}
                onClick={clearRecentColors}
                disabled={disabled}
                data-testid={`${testId}-clear-recent`}
                style={{ color: '#888', padding: '0 4px', height: '20px' }}
              >
                Clear
              </Button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))',
                gap: '6px',
              }}
              role="list"
              aria-label="Recent colors"
            >
              {recentColors.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  onClick={() => handleRecentColorClick(color)}
                  disabled={disabled}
                  data-testid={`${testId}-recent-${index}`}
                  role="listitem"
                  aria-label={`Recent color ${color}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: color,
                    border: color === value ? '2px solid #00d9ff' : '1px solid #434343',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    padding: 0,
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 217, 255, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPicker;
