import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Typography, List, Select, Space, Button, Tag, Input, Divider, Alert, Tabs, Empty } from 'antd';
import type { EntityState } from '../services/haWebSocketService';
import { entityRemappingService, type EntityMapping, type EntitySuggestion } from '../services/entityRemapping';
import type { DashboardConfig } from '../types/dashboard';

const { Text, Title } = Typography;
const isTestEnv = () =>
  (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.E2E === '1')) ||
  (typeof window !== 'undefined' && Boolean((window as any).E2E || (window as any).PLAYWRIGHT_TEST));

interface Props {
  visible: boolean;
  missingEntities: string[];
  availableEntities: EntityState[];
  dashboardConfig: DashboardConfig | null;
  onClose: () => void;
  onApply: (config: DashboardConfig, mappings: EntityMapping[]) => void;
}

type MappingState = Record<string, string | null>;

export const EntityRemappingModal: React.FC<Props> = ({
  visible,
  missingEntities,
  availableEntities,
  dashboardConfig,
  onClose,
  onApply,
}) => {
  const [mappingState, setMappingState] = useState<MappingState>({});
  const [activeTab, setActiveTab] = useState<'remap' | 'history'>('remap');
  const [historyVersion, setHistoryVersion] = useState(0);

  const suggestionsMap = useMemo<Record<string, EntitySuggestion[]>>(() => {
    const entries = missingEntities.map((id) => [id, entityRemappingService.buildSuggestions(id, availableEntities)] as const);
    return Object.fromEntries(entries);
  }, [missingEntities, availableEntities]);

  useEffect(() => {
    const initial = entityRemappingService.autoMapSuggestions(missingEntities, availableEntities);
    if (initial.length === 0) return;
    const initialState: MappingState = {};
    initial.forEach(({ from, to }) => {
      initialState[from] = to;
    });
    setMappingState((prev) => ({ ...initialState, ...prev }));
  }, [missingEntities, availableEntities]);

  const savedMappings = useMemo(
    () => entityRemappingService.getEntityMappings(),
    [historyVersion]
  );

  const handleChange = (source: string, target: string | null) => {
    setMappingState((prev) => ({ ...prev, [source]: target }));
  };

  const handleAutoMapAll = () => {
    const auto = entityRemappingService.autoMapSuggestions(missingEntities, availableEntities);
    const next: MappingState = { ...mappingState };
    auto.forEach(({ from, to }) => {
      next[from] = to;
    });
    setMappingState(next);
  };

  const handleApply = () => {
    if (isTestEnv() && typeof window !== 'undefined') {
      const testWindow = window as Window & { __remapDebug?: Record<string, unknown> };
      const existing = (testWindow.__remapDebug && typeof testWindow.__remapDebug === 'object')
        ? (testWindow.__remapDebug as Record<string, unknown>)
        : {};
      testWindow.__remapDebug = {
        ...existing,
        remapApplyClicked: true,
        remapApplyHasConfig: Boolean(dashboardConfig),
        remapApplyMappingCount: Object.values(mappingState).filter(Boolean).length,
      };
    }
    if (!dashboardConfig) {
      if (isTestEnv() && typeof window !== 'undefined') {
        const testWindow = window as Window & { __remapDebug?: Record<string, unknown> };
        const existing = (testWindow.__remapDebug && typeof testWindow.__remapDebug === 'object')
          ? (testWindow.__remapDebug as Record<string, unknown>)
          : {};
        testWindow.__remapDebug = {
          ...existing,
          remapApplyError: 'missing-dashboard-config',
        };
      }
      onClose();
      return;
    }
    const mappings: EntityMapping[] = Object.entries(mappingState)
      .filter(([, to]) => Boolean(to))
      .map(([from, to]) => ({ from, to: to as string }));

    const mergedConfig = entityRemappingService.applyMappings(dashboardConfig, mappings);
    entityRemappingService.persistMappings(mappings);
    onApply(mergedConfig, mappings);
  };

  const handleUseSaved = (mapping: EntityMapping) => {
    setMappingState((prev) => ({ ...prev, [mapping.from]: mapping.to }));
  };

  const handleClearSaved = () => {
    entityRemappingService.clearEntityMappings();
    setMappingState((prev) => ({ ...prev }));
    setHistoryVersion((v) => v + 1);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      open={visible}
      title="Entity Remapping"
      onCancel={onClose}
      width={900}
      footer={null}
      destroyOnClose
      transitionName=""
      maskTransitionName=""
      rootClassName="remap-modal-root"
      wrapClassName="remap-modal-wrap-force"
      mask={!isTestEnv()}
      getContainer={isTestEnv() ? false : undefined}
      data-has-config={dashboardConfig ? '1' : '0'}
      data-mapping-count={Object.values(mappingState).filter(Boolean).length}
      data-testid="entity-remapping-modal"
    >
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as any)} items={[
        { key: 'remap', label: 'Remap' },
        { key: 'history', label: 'History' },
      ]} />

      {activeTab === 'remap' && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            message={missingEntities.length ? 'Missing entities detected. Map them to available Home Assistant entities.' : 'No missing entities detected. You can still override mappings or reuse history.'}
            showIcon
          />

          <Space align="center" justify="space-between" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>Missing Entities ({missingEntities.length})</Title>
            <Space>
              <Button onClick={handleAutoMapAll} data-testid="remap-auto-map">Auto-map All</Button>
              <Button type="primary" onClick={handleApply} disabled={!Object.values(mappingState).some(Boolean)} data-testid="remap-apply">Apply Mappings</Button>
            </Space>
          </Space>

          <List
            dataSource={missingEntities}
            renderItem={(missing) => {
              const suggestions = suggestionsMap[missing] ?? [];
              const selected = mappingState[missing] ?? null;

              return (
                <List.Item key={missing}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space align="baseline" wrap>
                      <Text strong>{missing}</Text>
                      <Tag color="red">missing</Tag>
                    </Space>
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select replacement entity"
                      style={{ width: '100%' }}
                      value={selected ?? undefined}
                      onChange={(val) => handleChange(missing, val ?? null)}
                      data-testid={`remap-select-${missing}`}
                      optionFilterProp="label"
                    >
                      {suggestions.map((s) => (
                        <Select.Option key={s.entityId} value={s.entityId} label={s.entityId}>
                          <Space direction="vertical" size={0}>
                            <Space>
                              <Text strong>{s.entityId}</Text>
                              <Tag color={s.score >= 0.8 ? 'green' : s.score >= 0.6 ? 'blue' : 'default'}>
                                {Math.round(s.score * 100)}%
                              </Tag>
                            </Space>
                            {s.friendlyName && <Text type="secondary">{s.friendlyName}</Text>}
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                    <Input
                      placeholder="Manual entity ID"
                      value={selected && !suggestions.find((s) => s.entityId === selected) ? selected : ''}
                      onChange={(e) => handleChange(missing, e.target.value || null)}
                      data-testid={`remap-manual-${missing}`}
                    />
                  </Space>
                </List.Item>
              );
            }}
          />
        </Space>
      )}

      {activeTab === 'history' && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space align="center" justify="space-between" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>Saved Mappings</Title>
            <Button danger onClick={handleClearSaved} disabled={!savedMappings.length} data-testid="remap-clear-history">Clear All</Button>
          </Space>
          {savedMappings.length === 0 && <Empty description="No saved mappings" />}
          {savedMappings.length > 0 && (
            <List
              dataSource={savedMappings}
              renderItem={(mapping) => (
                <List.Item key={mapping.from}
                  actions={[
                    <Button type="link" onClick={() => handleUseSaved(mapping)} data-testid={`remap-use-saved-${mapping.from}`}>Use</Button>,
                    <Button
                      type="link"
                      danger
                      onClick={() => {
                        entityRemappingService.deleteMapping(mapping.from);
                        setHistoryVersion((v) => v + 1);
                      }}
                      data-testid={`remap-delete-saved-${mapping.from}`}
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <Space direction="vertical">
                    <Text strong>{mapping.from}</Text>
                    <Text type="secondary">→ {mapping.to}</Text>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Space>
      )}

      <Divider style={{ marginTop: 16 }} />
      <Space direction="vertical" size={4}>
        <Text type="secondary">Mappings are stored locally and reused on future imports. Confidence scores are derived from domain and name similarity.</Text>
      </Space>
    </Modal>
  );
};

export default EntityRemappingModal;
