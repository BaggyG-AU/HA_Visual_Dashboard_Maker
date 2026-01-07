import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Button, InputNumber, Radio, Slider, Space, Typography, Row, Col, Divider, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColorPickerInput } from './ColorPickerInput';
import { gradientPresets } from '../data/gradientPresets';
import { addStop, defaultGradient, gradientToCss, parseGradient, removeStop, updateStop } from '../utils/gradientConversions';
import type { GradientDefinition, GradientPreset, GradientStop, GradientType } from '../types/gradient';

const { Text } = Typography;

export interface GradientEditorProps {
  value?: string;
  onChange?: (css: string) => void;
  'data-testid'?: string;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({
  value,
  onChange,
  'data-testid': testId = 'gradient-editor',
}) => {
  const [gradient, setGradient] = useState<GradientDefinition>(() => parseGradient(value));
  const [search, setSearch] = useState('');
  const currentCss = useMemo(() => gradientToCss(gradient), [gradient]);

  useEffect(() => {
    const parsed = parseGradient(value);
    setGradient(parsed);
  }, [value]);

  const emitChange = useCallback((next: GradientDefinition) => {
    const css = gradientToCss(next);
    onChange?.(css);
  }, [onChange]);

  const handleTypeChange = (type: GradientType) => {
    const next: GradientDefinition = type === 'radial'
      ? { ...gradient, type, angle: 0, shape: 'ellipse', position: 'center' }
      : { ...gradient, type, angle: gradient.angle || 90 };
    setGradient(next);
    emitChange(next);
  };

  const handleAngleChange = (angle: number) => {
    const next = { ...gradient, angle };
    setGradient(next);
    emitChange(next);
  };

  const handlePositionChange = (position: string) => {
    const next = { ...gradient, position };
    setGradient(next);
    emitChange(next);
  };

  const handleShapeChange = (shape: 'circle' | 'ellipse') => {
    const next = { ...gradient, shape };
    setGradient(next);
    emitChange(next);
  };

  const handleStopColor = (stopId: string, color: string) => {
    const nextStops = updateStop(gradient.stops, stopId, { color });
    const next = { ...gradient, stops: nextStops };
    setGradient(next);
    emitChange(next);
  };

  const handleStopPosition = (stopId: string, position: number) => {
    const nextStops = updateStop(gradient.stops, stopId, { position });
    const next = { ...gradient, stops: nextStops };
    setGradient(next);
    emitChange(next);
  };

  const handleAddStop = () => {
    const nextStops = addStop(gradient.stops, '#ffffff');
    const next = { ...gradient, stops: nextStops };
    setGradient(next);
    emitChange(next);
  };

  const handleRemoveStop = (stopId: string) => {
    const nextStops = removeStop(gradient.stops, stopId);
    const next = { ...gradient, stops: nextStops };
    setGradient(next);
    emitChange(next);
  };

  const applyPreset = (preset: GradientPreset) => {
    const parsed = parseGradient(preset.css);
    setGradient(parsed);
    onChange?.(preset.css);
  };

  const filteredPresets = useMemo(
    () => gradientPresets.filter((preset) =>
      (!search || preset.name.toLowerCase().includes(search.toLowerCase()) || preset.category.toLowerCase().includes(search.toLowerCase()))
    ),
    [search]
  );

  const gradientStops = [...gradient.stops].sort((a, b) => a.position - b.position);

  return (
    <div data-testid={testId} style={{ color: 'white', minWidth: 420 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <Radio.Group
          value={gradient.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          buttonStyle="solid"
          data-testid={`${testId}-type-toggle`}
        >
          <Radio.Button value="linear">Linear</Radio.Button>
          <Radio.Button value="radial">Radial</Radio.Button>
        </Radio.Group>
        {gradient.type === 'linear' && (
          <Space align="center">
            <Text style={{ color: '#ddd' }}>Angle</Text>
            <Slider
              value={gradient.angle}
              onChange={handleAngleChange}
              min={0}
              max={360}
              style={{ width: 160 }}
              data-testid={`${testId}-angle-slider`}
            />
            <InputNumber
              value={gradient.angle}
              onChange={(val) => handleAngleChange(Number(val || 0))}
              min={0}
              max={360}
              data-testid={`${testId}-angle-input`}
            />
          </Space>
        )}
        {gradient.type === 'radial' && (
          <Space align="center">
            <Text style={{ color: '#ddd' }}>Shape</Text>
            <Radio.Group
              value={gradient.shape}
              onChange={(e) => handleShapeChange(e.target.value)}
              data-testid={`${testId}-shape-toggle`}
            >
              <Radio.Button value="ellipse">Ellipse</Radio.Button>
              <Radio.Button value="circle">Circle</Radio.Button>
            </Radio.Group>
            <SelectPosition value={gradient.position} onChange={handlePositionChange} testId={testId} />
          </Space>
        )}
      </div>

      <div
        data-testid={`${testId}-preview`}
        style={{
          height: 140,
          borderRadius: 8,
          border: '1px solid #333',
          background: currentCss,
          marginBottom: 12,
          transition: 'background 120ms linear',
        }}
        aria-label="Gradient preview"
      />

      <Divider style={{ borderColor: '#333' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#ddd' }}>Color Stops</Text>
        <Button icon={<PlusOutlined />} size="small" onClick={handleAddStop} data-testid={`${testId}-add-stop`}>
          Add stop
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        {gradientStops.map((stop) => (
          <Row key={stop.id} gutter={8} align="middle" data-testid={`${testId}-stop-${stop.id}`}>
            <Col span={10}>
              <ColorPickerInput
                value={stop.color}
                onChange={(color) => handleStopColor(stop.id, color)}
                data-testid={`${testId}-stop-color-${stop.id}`}
              />
            </Col>
            <Col span={10}>
              <Slider
                value={stop.position}
                min={0}
                max={100}
                onChange={(val) => handleStopPosition(stop.id, Number(val))}
                tooltip={{ formatter: (val) => `${val}%` }}
                data-testid={`${testId}-stop-position-${stop.id}`}
              />
            </Col>
            <Col span={3}>
              <InputNumber
                value={stop.position}
                min={0}
                max={100}
                onChange={(val) => handleStopPosition(stop.id, Number(val || 0))}
                size="small"
                data-testid={`${testId}-stop-input-${stop.id}`}
              />
            </Col>
            <Col span={1} style={{ textAlign: 'right' }}>
              <Tooltip title="Remove stop">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  aria-label="Remove stop"
                  onClick={() => handleRemoveStop(stop.id)}
                  data-testid={`${testId}-remove-stop-${stop.id}`}
                />
              </Tooltip>
            </Col>
          </Row>
        ))}
      </Space>

      <Divider style={{ borderColor: '#333', marginTop: 16, marginBottom: 12 }} />

      <div style={{ marginBottom: 8 }}>
        <Text style={{ color: '#ddd' }}>Presets</Text>
      </div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search presets"
        data-testid={`${testId}-preset-search`}
        style={{
          width: '100%',
          marginBottom: 12,
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #333',
          background: '#1c1c1c',
          color: '#eee',
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            data-testid={`${testId}-preset-${preset.id}`}
            style={{
              border: '1px solid #333',
              borderRadius: 6,
              padding: 8,
              textAlign: 'left',
              cursor: 'pointer',
              background: '#111',
            }}
          >
            <div
              style={{
                height: 60,
                borderRadius: 4,
                background: preset.css,
                marginBottom: 8,
              }}
            />
            <div style={{ color: '#eee', fontWeight: 600 }}>{preset.name}</div>
            <Tag color="blue" style={{ marginTop: 4 }}>
              {preset.category}
            </Tag>
          </button>
        ))}
        {filteredPresets.length === 0 && (
          <Text style={{ color: '#888' }}>No presets match your search.</Text>
        )}
      </div>

      <Divider style={{ borderColor: '#333', marginTop: 16, marginBottom: 12 }} />

      <div>
        <Text style={{ color: '#aaa' }}>CSS Output</Text>
        <div
          data-testid={`${testId}-css-output`}
          style={{
            marginTop: 8,
            padding: 12,
            background: '#111',
            border: '1px solid #333',
            borderRadius: 6,
            fontFamily: 'monospace',
            color: '#00d9ff',
            wordBreak: 'break-all',
          }}
        >
          {currentCss}
        </div>
      </div>
    </div>
  );
};

interface SelectPositionProps {
  value: string;
  onChange: (value: string) => void;
  testId: string;
}

const SelectPosition: React.FC<SelectPositionProps> = ({ value, onChange, testId }) => (
  <Radio.Group
    value={value}
    onChange={(e) => onChange(e.target.value)}
    data-testid={`${testId}-position-toggle`}
  >
    <Radio.Button value="center">Center</Radio.Button>
    <Radio.Button value="top">Top</Radio.Button>
    <Radio.Button value="bottom">Bottom</Radio.Button>
    <Radio.Button value="left">Left</Radio.Button>
    <Radio.Button value="right">Right</Radio.Button>
  </Radio.Group>
);

export default GradientEditor;
