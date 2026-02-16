import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Empty, List, Space, Tag, Typography } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import type { PresetMetadata } from './types';
import { presetService } from '../../services/presetService';

const { Text, Title } = Typography;

interface PresetMarketplacePanelProps {
  onPresetImport: (dashboardYaml: string, dashboardTitle: string, dashboardId: string) => void;
}

export const PresetMarketplacePanel: React.FC<PresetMarketplacePanelProps> = ({ onPresetImport }) => {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<PresetMetadata[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? null,
    [presets, selectedPresetId]
  );

  const loadPresets = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await presetService.listPresets();
      setPresets(next);
      if (next.length > 0) {
        setSelectedPresetId((prev) => prev ?? next[0].id);
      } else {
        setSelectedPresetId(null);
      }
    } catch (loadError) {
      setError((loadError as Error).message || 'Failed to load presets.');
      setPresets([]);
      setSelectedPresetId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPresets();
  }, []);

  const handleImport = async () => {
    if (!selectedPresetId) return;

    setImporting(true);
    setError(null);
    try {
      const imported = await presetService.importPreset(selectedPresetId);
      if (!imported) {
        throw new Error('Selected preset was not found.');
      }

      onPresetImport(imported.yaml, imported.title, imported.id);
    } catch (importError) {
      setError((importError as Error).message || 'Failed to import preset.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }} data-testid="preset-marketplace-panel">
      <Alert
        type="info"
        showIcon
        message="Preview curated preset metadata and import directly into the editor."
      />

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          message={error}
        />
      )}

      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            void loadPresets();
          }}
          loading={loading}
          data-testid="preset-marketplace-refresh"
        >
          Refresh Presets
        </Button>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => {
            void handleImport();
          }}
          loading={importing}
          disabled={!selectedPresetId}
          data-testid="preset-marketplace-import"
        >
          Import Preset
        </Button>
      </Space>

      {presets.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={loading ? 'Loading presets...' : 'No presets available.'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <List
            dataSource={presets}
            bordered
            style={{ maxHeight: 340, overflow: 'auto' }}
            data-testid="preset-marketplace-list"
            renderItem={(preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <List.Item
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(24, 144, 255, 0.12)' : undefined,
                    borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent',
                  }}
                  data-testid={`preset-marketplace-item-${preset.id}`}
                >
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Text strong>{preset.title}</Text>
                    <Text type="secondary">{preset.description}</Text>
                    <Space wrap size={4}>
                      {preset.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </Space>
                </List.Item>
              );
            }}
          />

          <div
            style={{
              border: '1px solid #303030',
              borderRadius: 8,
              padding: 16,
              minHeight: 220,
            }}
            data-testid="preset-marketplace-preview"
          >
            {!selectedPreset ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Select a preset" />
            ) : (
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Title level={4} style={{ margin: 0 }} data-testid="preset-marketplace-preview-title">
                  {selectedPreset.title}
                </Title>
                <Text>{selectedPreset.description}</Text>
                <Text type="secondary">Author: {selectedPreset.author}</Text>
                <Text type="secondary">Version: {selectedPreset.version}</Text>
                <Text type="secondary">Cards: {selectedPreset.cardCount}</Text>
                <Text type="secondary">Referenced entities: {selectedPreset.entityIds.length}</Text>
                <Space size={4} wrap>
                  {selectedPreset.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Space>
            )}
          </div>
        </div>
      )}
    </Space>
  );
};

export default PresetMarketplacePanel;
