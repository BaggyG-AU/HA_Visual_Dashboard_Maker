import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Input, Table, Button, Space, Badge, message, Tabs, Empty, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { logger } from '../services/logger';

interface Entity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    device_class?: string;
    icon?: string;
    unit_of_measurement?: string;
    [key: string]: any;
  };
  last_changed?: string;
  last_updated?: string;
}

interface EntityBrowserProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (entityId: string) => void;
  isConnected: boolean;
  onRefresh?: () => Promise<void>;
}

export const EntityBrowser: React.FC<EntityBrowserProps> = ({
  visible,
  onClose,
  onSelect,
  isConnected,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Load cached entities on mount
  useEffect(() => {
    if (visible) {
      loadCachedEntities();
    }
  }, [visible]);

  const loadCachedEntities = async () => {
    try {
      const result = await window.electronAPI.getCachedEntities();
      if (result.success && result.entities) {
        setEntities(result.entities);
      }
    } catch (error) {
      logger.error('Failed to load cached entities', error);
    }
  };

  const handleRefresh = async () => {
    if (!isConnected) {
      message.warning('Not connected to Home Assistant');
      return;
    }

    setLoading(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      await loadCachedEntities();
      message.success('Entities refreshed successfully');
    } catch (error) {
      message.error('Failed to refresh entities');
    } finally {
      setLoading(false);
    }
  };

  // Group entities by domain (integration)
  const entitiesByDomain = useMemo(() => {
    const grouped: Record<string, Entity[]> = {};
    entities.forEach((entity) => {
      const domain = entity.entity_id.split('.')[0];
      if (!grouped[domain]) {
        grouped[domain] = [];
      }
      grouped[domain].push(entity);
    });
    return grouped;
  }, [entities]);

  // Get domain counts
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(entitiesByDomain).forEach(([domain, entities]) => {
      counts[domain] = entities.length;
    });
    return counts;
  }, [entitiesByDomain]);

  // Filter entities based on search and active tab
  const filteredEntities = useMemo(() => {
    const entitiesToFilter = activeTab === 'all'
      ? entities
      : entitiesByDomain[activeTab] || [];

    if (!searchTerm) return entitiesToFilter;

    const lowerSearch = searchTerm.toLowerCase();
    return entitiesToFilter.filter((entity) => {
      return (
        entity.entity_id.toLowerCase().includes(lowerSearch) ||
        entity.attributes.friendly_name?.toLowerCase().includes(lowerSearch) ||
        entity.state.toLowerCase().includes(lowerSearch) ||
        entity.attributes.device_class?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [entities, entitiesByDomain, activeTab, searchTerm]);

  const columns: ColumnsType<Entity> = [
    {
      title: 'Entity ID',
      dataIndex: 'entity_id',
      key: 'entity_id',
      sorter: (a, b) => a.entity_id.localeCompare(b.entity_id),
      width: '40%',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{text}</span>
      ),
    },
    {
      title: 'Friendly Name',
      key: 'friendly_name',
      width: '30%',
      render: (_, record) => record.attributes.friendly_name || '—',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: '15%',
      render: (text: string, record) => {
        const unit = record.attributes.unit_of_measurement;
        return unit ? `${text} ${unit}` : text;
      },
    },
    {
      title: 'Domain',
      key: 'domain',
      width: '15%',
      render: (_, record) => {
        const domain = record.entity_id.split('.')[0];
        return <Badge color="blue" text={domain} />;
      },
    },
  ];

  const handleSelect = () => {
    if (selectedEntity && onSelect) {
      onSelect(selectedEntity);
      setSelectedEntity(null);
      setSearchTerm('');
      onClose();
      message.success('Entity selected');
    }
  };

  // Create tabs for each domain
  const tabItems = [
    {
      key: 'all',
      label: `All (${entities.length})`,
    },
    ...Object.keys(entitiesByDomain)
      .sort()
      .map((domain) => ({
        key: domain,
        label: `${domain} (${domainCounts[domain]})`,
      })),
  ];

  return (
    <Modal
      data-testid="entity-browser-modal"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Entity Browser</span>
          <Badge
            status={isConnected ? 'success' : 'default'}
            text={isConnected ? 'Connected' : 'Offline (Cached)'}
            data-testid="entity-browser-status-badge"
          />
          <Tooltip title="Refresh entity list from Home Assistant">
            <Button
              size="small"
              data-testid="entity-browser-refresh-button"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              disabled={!isConnected}
            >
              Refresh
            </Button>
          </Tooltip>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" data-testid="entity-browser-cancel-button" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="select"
          data-testid="entity-browser-select-button"
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleSelect}
          disabled={!selectedEntity}
        >
          Select Entity
        </Button>,
      ]}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <Input
          data-testid="entity-browser-search-input"
          placeholder="Search entities by ID, name, state, or device class..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />

        {filteredEntities.length === 0 ? (
          <Empty
            description={
              entities.length === 0
                ? "No entities cached. Connect to Home Assistant and click Refresh."
                : "No entities match your search."
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredEntities}
            rowKey="entity_id"
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} entities`,
            }}
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedEntity ? [selectedEntity] : [],
              onChange: (selectedRowKeys) => {
                setSelectedEntity(selectedRowKeys[0] as string);
              },
            }}
            onRow={(record) => ({
              onClick: () => setSelectedEntity(record.entity_id),
              onDoubleClick: () => {
                setSelectedEntity(record.entity_id);
                setTimeout(handleSelect, 100);
              },
            })}
            scroll={{ y: 400 }}
          />
        )}
      </Space>
    </Modal>
  );
};
