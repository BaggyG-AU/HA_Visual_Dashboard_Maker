import React from 'react';
import { Form, Input, Select, Slider, InputNumber, Space, Typography, Divider } from 'antd';
import { ColorPickerInput } from './ColorPickerInput';
import { GradientPickerInput } from './GradientPickerInput';
import type {
  BackgroundConfig,
  BackgroundType,
  BackgroundBlendMode,
  BackgroundImagePosition,
  BackgroundImageRepeat,
  BackgroundImageSize,
} from '../utils/backgroundStyle';

const { Text } = Typography;

interface BackgroundCustomizerProps {
  value: BackgroundConfig;
  onChange: (next: BackgroundConfig) => void;
}

const TYPE_OPTIONS: Array<{ value: BackgroundType; label: string }> = [
  { value: 'none', label: 'None (transparent)' },
  { value: 'solid', label: 'Solid color' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
  { value: 'blur', label: 'Frosted glass' },
];

const POSITION_OPTIONS: Array<{ value: BackgroundImagePosition; label: string }> = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top left', label: 'Top left' },
  { value: 'top right', label: 'Top right' },
  { value: 'bottom left', label: 'Bottom left' },
  { value: 'bottom right', label: 'Bottom right' },
];

const SIZE_OPTIONS: Array<{ value: BackgroundImageSize; label: string }> = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'auto', label: 'Auto' },
  { value: 'custom', label: 'Custom' },
];

const REPEAT_OPTIONS: Array<{ value: BackgroundImageRepeat; label: string }> = [
  { value: 'no-repeat', label: 'No repeat' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'repeat-x', label: 'Repeat X' },
  { value: 'repeat-y', label: 'Repeat Y' },
];

const BLEND_MODE_OPTIONS: Array<{ value: BackgroundBlendMode; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
];

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const parseImageSizeCustom = (raw: string): { width: string; height: string } => {
  const parts = (raw || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return { width: parts[0], height: parts[1] };
  }
  if (parts.length === 1) {
    return { width: parts[0], height: parts[0] };
  }
  return { width: '100%', height: '100%' };
};

const composeImageSizeCustom = (width: string, height: string): string => {
  const normalizedWidth = width.trim() || '100%';
  const normalizedHeight = height.trim() || '100%';
  return `${normalizedWidth} ${normalizedHeight}`;
};

export const BackgroundCustomizer: React.FC<BackgroundCustomizerProps> = ({ value, onChange }) => {
  const [openSelect, setOpenSelect] = React.useState<string | null>(null);

  const update = (patch: Partial<BackgroundConfig>) => {
    onChange({ ...value, ...patch });
  };

  const closeSelect = () => setOpenSelect(null);
  const bindSelectOpen = (key: string) => ({
    open: openSelect === key,
    onOpenChange: (open: boolean) => setOpenSelect(open ? key : null),
  });
  const popupContainer = (triggerNode: HTMLElement) => triggerNode.parentElement ?? triggerNode;
  const customSize = parseImageSizeCustom(value.imageSizeCustom);

  const renderOpacityControl = (label: string, testId: string, inputTestId: string, opacityValue: number, onUpdate: (val: number) => void) => (
    <Form.Item label={<span style={{ color: 'white' }}>{label}</span>} colon={false}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Slider
          min={0}
          max={100}
          value={opacityValue}
          onChange={(val) => onUpdate(typeof val === 'number' ? clamp(val) : opacityValue)}
          data-testid={testId}
        />
        <InputNumber
          min={0}
          max={100}
          value={opacityValue}
          onChange={(val) => onUpdate(clamp(Number(val ?? opacityValue)))}
          style={{ width: '100%' }}
          data-testid={inputTestId}
        />
      </Space>
    </Form.Item>
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Form.Item label={<span style={{ color: 'white' }}>Background Type</span>} colon={false}>
        <Select
          options={TYPE_OPTIONS}
          value={value.type}
          onChange={(next) => {
            update({ type: next as BackgroundType });
            closeSelect();
          }}
          {...bindSelectOpen('background-type')}
          popupClassName="bg-type-dropdown"
          transitionName=""
          getPopupContainer={popupContainer}
          data-testid="advanced-style-background-type"
        />
      </Form.Item>

      {value.type === 'none' && (
        <Text style={{ color: '#888', fontSize: '12px' }}>
          No background styles will be applied to this card.
        </Text>
      )}

      {value.type === 'solid' && (
        <>
          <Form.Item label={<span style={{ color: 'white' }}>Solid Color</span>} colon={false}>
            <ColorPickerInput
              value={value.solidColor}
              onChange={(color) => update({ solidColor: color })}
              data-testid="advanced-style-solid-background-input"
            />
          </Form.Item>
          {renderOpacityControl(
            'Background Opacity',
            'background-opacity-slider',
            'background-opacity-input',
            value.backgroundOpacity,
            (val) => update({ backgroundOpacity: val })
          )}
        </>
      )}

      {value.type === 'gradient' && (
        <>
          <Form.Item label={<span style={{ color: 'white' }}>Gradient</span>} colon={false}>
            <GradientPickerInput
              value={value.gradient}
              onChange={(next) => update({ gradient: next })}
              data-testid="advanced-style-gradient-input"
            />
          </Form.Item>
          {renderOpacityControl(
            'Background Opacity',
            'background-opacity-slider',
            'background-opacity-input',
            value.backgroundOpacity,
            (val) => update({ backgroundOpacity: val })
          )}
        </>
      )}

      {value.type === 'image' && (
        <>
          <Form.Item label={<span style={{ color: 'white' }}>Image URL</span>} colon={false}>
            <Input
              placeholder="https://example.com/background.jpg"
              value={value.imageUrl}
              onChange={(event) => update({ imageUrl: event.target.value })}
              data-testid="background-image-url-input"
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: 'white' }}>Image Position</span>} colon={false}>
            <Select
              options={POSITION_OPTIONS}
              value={value.imagePosition}
              onChange={(next) => {
                update({ imagePosition: next as BackgroundImagePosition });
                closeSelect();
              }}
              {...bindSelectOpen('background-image-position')}
              popupClassName="bg-image-position-dropdown"
              transitionName=""
              getPopupContainer={popupContainer}
              data-testid="background-image-position-select"
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: 'white' }}>Image Size</span>} colon={false}>
            <Select
              options={SIZE_OPTIONS}
              value={value.imageSize}
              onChange={(next) => {
                update({ imageSize: next as BackgroundImageSize });
                closeSelect();
              }}
              {...bindSelectOpen('background-image-size')}
              popupClassName="bg-image-size-dropdown"
              transitionName=""
              getPopupContainer={popupContainer}
              data-testid="background-image-size-select"
            />
          </Form.Item>

          {value.imageSize === 'custom' && (
            <Form.Item label={<span style={{ color: 'white' }}>Custom Size</span>} colon={false}>
              <Space style={{ width: '100%' }} size="small">
                <Input
                  placeholder="Width (e.g. 100%, 320px, auto)"
                  value={customSize.width}
                  onChange={(event) =>
                    update({ imageSizeCustom: composeImageSizeCustom(event.target.value, customSize.height) })
                  }
                  data-testid="background-image-size-custom-width-input"
                />
                <Input
                  placeholder="Height (e.g. 100%, 200px, auto)"
                  value={customSize.height}
                  onChange={(event) =>
                    update({ imageSizeCustom: composeImageSizeCustom(customSize.width, event.target.value) })
                  }
                  data-testid="background-image-size-custom-height-input"
                />
              </Space>
            </Form.Item>
          )}

          <Form.Item label={<span style={{ color: 'white' }}>Image Repeat</span>} colon={false}>
            <Select
              options={REPEAT_OPTIONS}
              value={value.imageRepeat}
              onChange={(next) => {
                update({ imageRepeat: next as BackgroundImageRepeat });
                closeSelect();
              }}
              {...bindSelectOpen('background-image-repeat')}
              popupClassName="bg-image-repeat-dropdown"
              transitionName=""
              getPopupContainer={popupContainer}
              data-testid="background-image-repeat-select"
            />
          </Form.Item>

          {renderOpacityControl(
            'Image Opacity',
            'background-image-opacity-slider',
            'background-image-opacity-input',
            value.imageOpacity,
            (val) => update({ imageOpacity: val })
          )}

          <Form.Item label={<span style={{ color: 'white' }}>Image Blur (px)</span>} colon={false}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Slider
                min={0}
                max={30}
                value={value.imageBlur}
                onChange={(val) => update({ imageBlur: typeof val === 'number' ? val : value.imageBlur })}
                data-testid="background-image-blur-slider"
              />
              <InputNumber
                min={0}
                max={30}
                value={value.imageBlur}
                onChange={(val) => update({ imageBlur: Number(val ?? value.imageBlur) })}
                style={{ width: '100%' }}
                data-testid="background-image-blur-input"
              />
            </Space>
          </Form.Item>

          <Divider style={{ borderColor: '#2a2a2a' }} />
          <Text style={{ color: '#888', fontSize: '12px' }}>Advanced Effects</Text>

          <Form.Item label={<span style={{ color: 'white' }}>Blend Mode</span>} colon={false}>
            <Select
              options={BLEND_MODE_OPTIONS}
              value={value.blendMode}
              onChange={(next) => {
                update({ blendMode: next as BackgroundBlendMode });
                closeSelect();
              }}
              {...bindSelectOpen('background-blend-mode')}
              popupClassName="bg-blend-dropdown"
              transitionName=""
              getPopupContainer={popupContainer}
              data-testid="background-blend-mode-select"
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: 'white' }}>Overlay Tint</span>} colon={false}>
            <ColorPickerInput
              value={value.overlayColor}
              onChange={(color) => update({ overlayColor: color })}
              data-testid="background-overlay-color-input"
            />
          </Form.Item>

          {renderOpacityControl(
            'Overlay Opacity',
            'background-overlay-opacity-slider',
            'background-overlay-opacity-input',
            value.overlayOpacity,
            (val) => update({ overlayOpacity: val })
          )}
        </>
      )}

      {value.type === 'blur' && (
        <>
          <Form.Item label={<span style={{ color: 'white' }}>Backdrop Blur (px)</span>} colon={false}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Slider
                min={0}
                max={30}
                value={value.blurAmount}
                onChange={(val) => update({ blurAmount: typeof val === 'number' ? val : value.blurAmount })}
                data-testid="background-blur-slider"
              />
              <InputNumber
                min={0}
                max={30}
                value={value.blurAmount}
                onChange={(val) => update({ blurAmount: Number(val ?? value.blurAmount) })}
                style={{ width: '100%' }}
                data-testid="background-blur-input"
              />
            </Space>
          </Form.Item>

          <Form.Item label={<span style={{ color: 'white' }}>Tint Color</span>} colon={false}>
            <ColorPickerInput
              value={value.overlayColor}
              onChange={(color) => update({ overlayColor: color })}
              data-testid="background-tint-color-input"
            />
          </Form.Item>

          {renderOpacityControl(
            'Tint Opacity',
            'background-tint-opacity-slider',
            'background-tint-opacity-input',
            value.backgroundOpacity,
            (val) => update({ backgroundOpacity: val })
          )}
        </>
      )}
    </Space>
  );
};

export default BackgroundCustomizer;
