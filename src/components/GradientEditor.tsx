import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Button, Input, InputNumber, Radio, Slider, Space, Typography, Row, Col, Divider, Tag, Tooltip, message } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { ColorPickerInput } from './ColorPickerInput';
import { gradientPresets } from '../data/gradientPresets';
import { addStop, gradientToCss, isGradientString, parseGradient, removeStop, updateStop } from '../utils/gradientConversions';
import type { GradientDefinition, GradientPreset, GradientType } from '../types/gradient';
import { useGradientPresets } from '../hooks/useGradientPresets';
import { adjustAngleForArrow, adjustStopPositionForArrow } from '../utils/gradientKeyboard';
import { fileService } from '../services/fileService';

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
  const [presetName, setPresetName] = useState('');
  const [focusedStopId, setFocusedStopId] = useState<string | null>(() => parseGradient(value).stops[0]?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { userPresets, savePreset, deletePreset, importPresets, exportPresets, loadError } = useGradientPresets();
  const currentCss = useMemo(() => gradientToCss(gradient), [gradient]);

  useEffect(() => {
    const parsed = parseGradient(value);
    setGradient(parsed);
    setFocusedStopId(parsed.stops[0]?.id ?? null);
  }, [value]);

  useEffect(() => {
    if (loadError) {
      message.warning(loadError);
    }
  }, [loadError]);

  useEffect(() => {
    if (!focusedStopId || !gradient.stops.some((stop) => stop.id === focusedStopId)) {
      setFocusedStopId(gradient.stops[0]?.id ?? null);
    }
  }, [gradient.stops, focusedStopId]);

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
    const next = { ...gradient, angle: Math.min(Math.max(angle, 0), 360) };
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
    setFocusedStopId(nextStops[nextStops.length - 1]?.id ?? null);
    emitChange(next);
  };

  const handleRemoveStop = (stopId: string) => {
    const nextStops = removeStop(gradient.stops, stopId);
    const next = { ...gradient, stops: nextStops };
    setGradient(next);
    const nextFocus = nextStops.find((stop) => stop.id !== stopId)?.id ?? nextStops[0]?.id ?? null;
    setFocusedStopId(nextFocus);
    emitChange(next);
  };

  const handleAngleKeyDown = (event: React.KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    handleAngleChange(adjustAngleForArrow(gradient.angle || 0, event.key as 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown', event.shiftKey));
  };

  const handleRadialPositionKeyDown = (event: React.KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const directionMap: Record<string, string> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'top',
      ArrowDown: 'bottom',
    };
    const nextPosition = directionMap[event.key] || 'center';
    handlePositionChange(nextPosition);
  };

  const handleStopKeyDown = (event: React.KeyboardEvent, stopId: string) => {
    if (event.currentTarget !== event.target) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      if (gradient.stops.length > 1) {
        handleRemoveStop(stopId);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddStop();
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const stop = gradient.stops.find((item) => item.id === stopId);
      if (!stop) return;
      handleStopPosition(stopId, adjustStopPositionForArrow(stop.position, event.key, event.shiftKey));
    }
  };

  const handleSavePreset = () => {
    if (!isGradientString(currentCss)) {
      message.error('Only gradients can be saved as presets.');
      return;
    }
    const result = savePreset(presetName, currentCss);
    if (result.error) {
      message.error(result.error);
      return;
    }
    message.success('Preset saved.');
    setPresetName('');
  };

  const handleImportClick = async () => {
    if (window.electronAPI?.openFileDialog && window.electronAPI?.readFile) {
      // Electron path: reuse native file dialog + fileService for consistent IPC/error handling.
      try {
        const filePath = await fileService.openFile();
        if (!filePath) return;
        const result = await fileService.readFile(filePath);
        if (!result.success || !result.content) {
          message.error(result.error || 'Failed to read preset file.');
          return;
        }
        const parsed = importPresets(result.content);
        if (parsed.errors.length) {
          message.error(parsed.errors.join(' '));
        } else {
          message.success(`Imported ${parsed.added} preset(s).`);
        }
      } catch (error) {
        message.error((error as Error).message || 'Failed to import presets.');
      }
      return;
    }

    // Browser fallback: hidden file input triggers standard file picker.
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const result = importPresets(text);
      if (result.errors.length) {
        message.error(result.errors.join(' '));
      } else {
        message.success(`Imported ${result.added} preset(s).`);
      }
    };
    reader.onerror = () => message.error('Failed to read preset file.');
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportPresets = async () => {
    const payload = exportPresets();
    if (window.electronAPI?.saveFileDialog && window.electronAPI?.writeFile) {
      // Electron path: save via native dialog for correct user location + permissions.
      try {
        const saved = await fileService.saveFileAs(payload, 'gradient-presets.json');
        if (saved) {
          message.success('Presets exported.');
        }
      } catch (error) {
        message.error((error as Error).message || 'Failed to export presets.');
      }
      return;
    }

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gradient-presets.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyPreset = (preset: GradientPreset) => {
    const parsed = parseGradient(preset.css);
    setGradient(parsed);
    onChange?.(preset.css);
  };

  const searchQuery = search.trim().toLowerCase();

  const filteredPresets = useMemo(
    () => gradientPresets.filter((preset) =>
      (!searchQuery || preset.name.toLowerCase().includes(searchQuery) || preset.category.toLowerCase().includes(searchQuery))
    ),
    [searchQuery]
  );

  const filteredUserPresets = useMemo(
    () => userPresets.filter((preset) =>
      (!searchQuery || preset.name.toLowerCase().includes(searchQuery) || preset.category.toLowerCase().includes(searchQuery))
    ),
    [userPresets, searchQuery]
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
              onKeyDown={handleAngleKeyDown}
              min={0}
              max={360}
              style={{ width: 160 }}
              data-testid={`${testId}-angle-slider`}
            />
            <div data-testid={`${testId}-angle-input`} style={{ display: 'inline-flex' }}>
              <InputNumber
                value={gradient.angle}
                onChange={(val) => handleAngleChange(Number(val || 0))}
                onKeyDown={handleAngleKeyDown}
                min={0}
                max={360}
                aria-label="Gradient angle"
              />
            </div>
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
            <SelectPosition
              value={gradient.position}
              onChange={handlePositionChange}
              onKeyDown={handleRadialPositionKeyDown}
              testId={testId}
            />
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

      <Space direction="vertical" style={{ width: '100%' }} data-testid={`${testId}-stops`} role="listbox" aria-label="Gradient color stops">
        {gradientStops.map((stop) => (
          <Row
            key={stop.id}
            gutter={8}
            align="middle"
            role="option"
            aria-selected={focusedStopId === stop.id}
            tabIndex={focusedStopId === stop.id ? 0 : -1}
            onFocusCapture={() => setFocusedStopId(stop.id)}
            onClick={() => setFocusedStopId(stop.id)}
            onKeyDown={(event) => handleStopKeyDown(event, stop.id)}
            data-testid={`${testId}-stop-${stop.id}`}
          >
            <Col span={10}>
              <ColorPickerInput
                value={stop.color}
                onChange={(color) => handleStopColor(stop.id, color)}
                data-testid={`${testId}-stop-color-${stop.id}`}
                ariaLabel={`Color stop ${stop.id} color`}
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
                aria-label={`Color stop ${stop.id} position`}
              />
            </Col>
            <Col span={3}>
              <div data-testid={`${testId}-stop-input-${stop.id}`} style={{ width: '100%' }}>
                <InputNumber
                  value={stop.position}
                  min={0}
                  max={100}
                  onChange={(val) => handleStopPosition(stop.id, Number(val || 0))}
                  size="small"
                  aria-label={`Color stop ${stop.id} position input`}
                />
              </div>
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
        <Text style={{ color: '#ddd' }}>Your Presets</Text>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
        <Input
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Preset name"
          data-testid={`${testId}-preset-name`}
          aria-label="Preset name"
        />
        <Button
          icon={<SaveOutlined />}
          onClick={handleSavePreset}
          disabled={!presetName.trim()}
          data-testid={`${testId}-preset-save`}
        >
          Save
        </Button>
        <Button
          icon={<UploadOutlined />}
          onClick={handleImportClick}
          data-testid={`${testId}-preset-import`}
        >
          Import
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExportPresets}
          disabled={userPresets.length === 0}
          data-testid={`${testId}-preset-export`}
        >
          Export
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
          style={{ display: 'none' }}
          data-testid={`${testId}-preset-file-input`}
        />
      </div>

      {filteredUserPresets.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
          {filteredUserPresets.map((preset) => (
            <div
              key={preset.id}
              role="button"
              tabIndex={0}
              onClick={() => applyPreset(preset)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  applyPreset(preset);
                }
              }}
              data-testid={`${testId}-user-preset-${preset.id}`}
              style={{
                border: '1px solid #333',
                borderRadius: 6,
                padding: 8,
                textAlign: 'left',
                cursor: 'pointer',
                background: '#111',
                position: 'relative',
              }}
              aria-label={`Apply preset ${preset.name}`}
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={(event) => {
                  event.stopPropagation();
                  deletePreset(preset.id);
                }}
                data-testid={`${testId}-user-preset-delete-${preset.id}`}
                aria-label={`Delete preset ${preset.name}`}
                style={{ position: 'absolute', top: 6, right: 6 }}
              />
              <div
                style={{
                  height: 60,
                  borderRadius: 4,
                  background: preset.css,
                  marginBottom: 8,
                }}
              />
              <div style={{ color: '#eee', fontWeight: 600 }}>{preset.name}</div>
              <Tag color="gold" style={{ marginTop: 4 }}>
                Custom
              </Tag>
            </div>
          ))}
        </div>
      ) : (
        <Text style={{ color: '#888', display: 'block', marginBottom: 16 }}>No saved presets yet.</Text>
      )}

      <div style={{ marginBottom: 8 }}>
        <Text style={{ color: '#ddd' }}>Built-in Presets</Text>
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
  onKeyDown?: (event: React.KeyboardEvent) => void;
  testId: string;
}

const SelectPosition: React.FC<SelectPositionProps> = ({ value, onChange, onKeyDown, testId }) => (
  <Radio.Group
    value={value}
    onChange={(e) => onChange(e.target.value)}
    data-testid={`${testId}-position-toggle`}
    onKeyDown={onKeyDown}
    aria-label="Gradient position"
  >
    <Radio.Button value="center">Center</Radio.Button>
    <Radio.Button value="top">Top</Radio.Button>
    <Radio.Button value="bottom">Bottom</Radio.Button>
    <Radio.Button value="left">Left</Radio.Button>
    <Radio.Button value="right">Right</Radio.Button>
  </Radio.Group>
);

export default GradientEditor;
