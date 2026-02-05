import React, { useMemo, useState } from 'react';
import { Button, Divider, Input, Select, Space, Tooltip, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined, UploadOutlined, DownloadOutlined, ScissorOutlined } from '@ant-design/icons';
import type { ColorPalette } from '../types/colorPalette';
import { logger } from '../services/logger';

const { Text } = Typography;

interface ColorPaletteManagerProps {
  palettes: ColorPalette[];
  activePaletteId?: string;
  currentColor: string;
  onSelectPalette: (id: string) => void;
  onApplyColor: (color: string) => void;
  onCreate: (name?: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddColor: (id: string, color: string) => boolean;
  onRemoveColor: (id: string, color: string) => void;
  onReorderColor: (id: string, from: number, to: number) => void;
  onExportJson: () => string;
  onExportCss: () => string;
  onImportJson: (json: string) => { added: number; errors: string[] };
  testId?: string;
}

export const ColorPaletteManager: React.FC<ColorPaletteManagerProps> = ({
  palettes,
  activePaletteId,
  currentColor,
  onSelectPalette,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
  onAddColor,
  onApplyColor,
  onRemoveColor,
  onReorderColor,
  onExportJson,
  onExportCss,
  onImportJson,
  testId = 'color-picker',
}) => {
  const [nameDraft, setNameDraft] = useState('');
  const [importing, setImporting] = useState(false);

  const activePalette = useMemo(() => palettes.find((p) => p.id === activePaletteId), [palettes, activePaletteId]);
  const paletteOptions = palettes.map((p) => ({ label: p.name, value: p.id, disabled: false }));

  const handleAddColor = () => {
    if (!activePalette) return;
    const success = onAddColor(activePalette.id, currentColor);
    if (!success) {
      message.warning('Invalid color or palette full (20 max).');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const result = onImportJson(text);
      if (result.errors.length) {
        message.error(result.errors.join(' | '));
      }
      if (result.added > 0) {
        message.success(`Imported ${result.added} palette(s).`);
      }
    } catch (error) {
      message.error((error as Error).message || 'Failed to import palettes.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExportJson = () => {
    const payload = onExportJson();
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'color-palettes.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCss = async () => {
    const css = onExportCss();
    try {
      await navigator.clipboard.writeText(css);
      message.success('CSS variables copied to clipboard.');
    } catch (error) {
      logger.error('Failed to copy CSS variables', error);
      message.error('Failed to copy CSS variables.');
    }
  };

  const handleNameChange = (value: string) => {
    setNameDraft(value);
    if (activePalette) {
      onRename(activePalette.id, value);
    }
  };

  const handleDelete = () => {
    if (activePalette && !activePalette.isDefault) {
      onDelete(activePalette.id);
    }
  };

  const handleDuplicate = () => {
    if (activePalette) {
      onDuplicate(activePalette.id);
    }
  };

  const moveColor = (index: number, direction: -1 | 1) => {
    if (!activePalette) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= activePalette.colors.length) return;
    onReorderColor(activePalette.id, index, nextIndex);
  };

  return (
    <div data-testid={`${testId}-favorites`}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Select
          value={activePaletteId}
          onChange={onSelectPalette}
          options={paletteOptions}
          style={{ flex: 1 }}
          placeholder="Select palette"
          data-testid={`${testId}-palette-select`}
        />
        <Tooltip title="New palette">
          <Button icon={<PlusOutlined />} onClick={() => onCreate()} data-testid={`${testId}-palette-new`} />
        </Tooltip>
        <Tooltip title="Duplicate palette">
          <Button icon={<CopyOutlined />} onClick={handleDuplicate} disabled={!activePalette} data-testid={`${testId}-palette-duplicate`} />
        </Tooltip>
        <Tooltip title="Delete palette">
          <Button
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            disabled={!activePalette || activePalette.isDefault}
            danger
            data-testid={`${testId}-palette-delete`}
          />
        </Tooltip>
      </div>

      {activePalette && (
        <div style={{ marginBottom: 12 }}>
          <Input
            value={nameDraft || activePalette.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => setNameDraft('')}
            disabled={activePalette.isDefault}
            placeholder="Palette name"
            data-testid={`${testId}-palette-name-input`}
          />
          {activePalette.description && (
            <Text style={{ color: '#888', display: 'block', marginTop: 4 }}>{activePalette.description}</Text>
          )}
        </div>
      )}

      <Divider style={{ margin: '8px 0', borderColor: '#333' }} />

      <Space wrap size="small" style={{ marginBottom: 8 }}>
        <Button icon={<PlusOutlined />} onClick={handleAddColor} data-testid={`${testId}-add-color`}>
          Add Current
        </Button>
        <Button icon={<UploadOutlined />} data-testid={`${testId}-palette-import`} onClick={() => document.getElementById(`${testId}-palette-file-input`)?.click()} loading={importing}>
          Import
        </Button>
        <Button icon={<DownloadOutlined />} onClick={handleExportJson} data-testid={`${testId}-palette-export`}>
          Export JSON
        </Button>
        <Button icon={<ScissorOutlined />} onClick={handleCopyCss} data-testid={`${testId}-palette-export-css`}>
          Copy CSS vars
        </Button>
      </Space>
      <input
        id={`${testId}-palette-file-input`}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImport}
        data-testid={`${testId}-palette-file-input`}
      />

      {activePalette && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: 8 }}>
            {activePalette.colors.map((color, index) => (
              <div key={`${color}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
                <button
                  type="button"
                  data-testid={`${testId}-favorite-${index}`}
                  aria-label={`Favorite color ${color}`}
                  onClick={() => onApplyColor(color)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!activePalette.isDefault) {
                      onRemoveColor(activePalette.id, color);
                    }
                  }}
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 6,
                    border: '1px solid #333',
                    background: color,
                    cursor: 'pointer',
                  }}
                />
                {!activePalette.isDefault && (
                  <Space size={4} style={{ justifyContent: 'center' }}>
                    <Button size="small" disabled={index === 0} onClick={() => moveColor(index, -1)} data-testid={`${testId}-favorite-move-up-${index}`}>
                      ↑
                    </Button>
                    <Button
                      size="small"
                      disabled={index === activePalette.colors.length - 1}
                      onClick={() => moveColor(index, 1)}
                      data-testid={`${testId}-favorite-move-down-${index}`}
                    >
                      ↓
                    </Button>
                  </Space>
                )}
              </div>
            ))}
          </div>
          {activePalette.colors.length === 0 && (
            <Text style={{ color: '#888' }} data-testid={`${testId}-favorites-empty`}>
              No colors yet. Add the current color to this palette.
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorPaletteManager;
