import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  Input,
  Table,
  Button,
  Space,
  Badge,
  message,
  Tabs,
  Empty,
  Tooltip,
  Segmented,
  Checkbox,
  Typography,
} from 'antd';
import { SearchOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { logger } from '../services/logger';
import { loadPickerEntities } from '../services/entityPickerSource';
import { matchesEntityQuery } from '../utils/entityCriteria';
import {
  filterEntitiesByRegistry,
  groupEntitiesByPlatform,
  platformLabel,
  type EntityRegistryIndex,
} from '../utils/entityRegistry';
import type { HAEntity } from '../types/homeassistant';

const { Text } = Typography;

/** How the tab strip carves up the list. */
type GroupBy = 'domain' | 'integration';

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
  const [registry, setRegistry] = useState<EntityRegistryIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('domain');
  // Default OFF: Home Assistant marks 287 of the reference instance's 725 live
  // entities `diagnostic` or `config` (39.6%), and almost none of them belong
  // on a dashboard. ⚠ A TOGGLE, NEVER AN ABSOLUTE — a picker that silently
  // omits what you were looking for is indistinguishable from that entity not
  // existing, so the cut has to be both reversible and visible.
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Load cached entities on mount
  useEffect(() => {
    if (visible) {
      loadCachedEntities();
    }
  }, [visible]);

  // Prefer the live connection, fall back to the persisted offline cache.
  //
  // This used to call `getCachedEntities()` directly, making the browser
  // CACHE-ONLY: freshly-added entities were invisible until a refresh had
  // written them to disk, even with a live connection sitting right there. It
  // was the third of four different ways HAVDM read the same dataset;
  // `entityPickerSource` is now the single source of truth for all of them.
  const loadCachedEntities = async () => {
    try {
      const { entities: loaded, registry: loadedRegistry } = await loadPickerEntities();
      setEntities(loaded as unknown as Entity[]);
      setRegistry(loadedRegistry);
    } catch (error) {
      logger.error('Failed to load entities', error);
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

  // Apply Home Assistant's own "this is plumbing" marking before anything else.
  //
  // ⚠ `filterEntitiesByRegistry` returns the SAME array when there is nothing to
  // cut — including when there is no registry at all, which is the
  // never-connected case. Absence of metadata never hides anything.
  const visibleEntities = useMemo(
    () =>
      filterEntitiesByRegistry(entities as unknown as HAEntity[], registry, {
        showDiagnostic,
        // Keep a chosen row visible even if the user then hides diagnostics,
        // so the selection and the table can never disagree.
        keepEntityIds: selectedEntity ? [selectedEntity] : undefined,
      }) as unknown as Entity[],
    [entities, registry, showDiagnostic, selectedEntity],
  );

  // The tab strip, carved either by domain (`sensor`, `light`) or by the
  // integration that owns the entity (`sigen`, `unifiprotect`).
  //
  // ⭐ Integration grouping is the point of this slice: on the reference
  // instance the `sensor` domain tab holds 311 rows, while grouping the same
  // list by integration gives 24 groups whose largest is 101.
  const groups = useMemo(() => {
    if (groupBy === 'integration') {
      return groupEntitiesByPlatform(visibleEntities as unknown as HAEntity[], registry).map(
        (group) => ({
          key: group.platform,
          label: group.label,
          entities: group.entities as unknown as Entity[],
        }),
      );
    }

    const byDomain = new Map<string, Entity[]>();
    visibleEntities.forEach((entity) => {
      const domain = entity.entity_id.split('.')[0];
      const bucket = byDomain.get(domain);
      if (bucket) bucket.push(entity);
      else byDomain.set(domain, [entity]);
    });

    return [...byDomain.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([domain, group]) => ({ key: domain, label: domain, entities: group }));
  }, [groupBy, visibleEntities, registry]);

  // A tab key from the other axis cannot match, and would silently show an
  // empty table. Fall back to "All" instead of showing nothing.
  const resolvedTab = useMemo(
    () => (activeTab === 'all' || groups.some((g) => g.key === activeTab) ? activeTab : 'all'),
    [activeTab, groups],
  );

  // Filter entities based on search and active tab
  const filteredEntities = useMemo(() => {
    const entitiesToFilter =
      resolvedTab === 'all'
        ? visibleEntities
        : (groups.find((g) => g.key === resolvedTab)?.entities ?? []);

    if (!searchTerm) return entitiesToFilter;

    // Multi-token and order-independent. Each of these fields used to be tested
    // with its own single `includes()`, so every token had to appear
    // contiguously inside ONE field — "kia battery" matched nothing whose
    // friendly name was "Kia EV6 Battery Level".
    return entitiesToFilter.filter((entity) =>
      matchesEntityQuery(entity as unknown as HAEntity, searchTerm),
    );
  }, [visibleEntities, groups, resolvedTab, searchTerm]);

  const hiddenCount = entities.length - visibleEntities.length;

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
    // The badge half of "group header + badge + facet". Omitted entirely rather
    // than rendered as a column of dashes when there is no registry to read.
    ...(registry
      ? ([
          {
            title: 'Integration',
            key: 'integration',
            width: '18%',
            render: (_: unknown, record: Entity) => {
              const platform = registry.get(record.entity_id)?.platform;
              if (!platform) {
                return (
                  <Tooltip title="Home Assistant's entity registry has no entry for this entity">
                    <Text type="secondary">—</Text>
                  </Tooltip>
                );
              }
              // The humanised name reads better; the raw slug is the honest
              // identifier, so it stays one hover away.
              return (
                <Tooltip title={platform}>
                  <Badge color="geekblue" text={platformLabel(platform)} />
                </Tooltip>
              );
            },
          },
        ] as ColumnsType<Entity>)
      : []),
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

  // Create a tab per group on whichever axis is active
  const tabItems = [
    {
      key: 'all',
      label: `All (${visibleEntities.length})`,
    },
    ...groups.map((group) => ({
      key: group.key,
      label: `${group.label} (${group.entities.length})`,
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

        <Space wrap size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          {/* ⚠ antd v6 does not forward an unknown DOM prop to Segmented's root,
              so the testid goes on a wrapper that genuinely contains it. */}
          <Space size="small">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Group by:
            </Text>
            <div data-testid="entity-browser-group-by">
              <Segmented
                size="small"
                value={groupBy}
                onChange={(value) => {
                  setGroupBy(value as GroupBy);
                  // The two axes share no keys, so carrying the old tab over
                  // would land on nothing.
                  setActiveTab('all');
                }}
                options={[
                  { label: 'Domain', value: 'domain' },
                  {
                    label: 'Integration',
                    value: 'integration',
                    // Nothing to group by without the registry.
                    disabled: !registry,
                  },
                ]}
              />
            </div>
            {!registry && (
              <Tooltip title="Connect to Home Assistant to load the entity registry, which is what supplies each entity's integration.">
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  (integration data unavailable)
                </Text>
              </Tooltip>
            )}
          </Space>

          <Space size="small">
            <div data-testid="entity-browser-show-diagnostic">
              <Checkbox
                checked={showDiagnostic}
                disabled={!registry}
                onChange={(e) => setShowDiagnostic(e.target.checked)}
              >
                <span style={{ fontSize: '12px' }}>Show diagnostic &amp; config</span>
              </Checkbox>
            </div>
            {/* ⭐ The hidden set is never invisible. A count the user can read is
                what separates "HAVDM filtered this" from "it does not exist". */}
            <Text
              type="secondary"
              style={{ fontSize: '12px' }}
              data-testid="entity-browser-visible-count"
            >
              {hiddenCount > 0
                ? `Showing ${visibleEntities.length} of ${entities.length} (${hiddenCount} hidden)`
                : `Showing ${visibleEntities.length}`}
            </Text>
          </Space>
        </Space>

        <Tabs activeKey={resolvedTab} onChange={setActiveTab} items={tabItems} size="small" />

        {filteredEntities.length === 0 ? (
          <Empty
            description={
              entities.length === 0
                ? 'No entities cached. Connect to Home Assistant and click Refresh.'
                : // ⭐ Never let the diagnostic cut masquerade as "nothing here".
                  // If the only reason the table is empty is that we hid rows,
                  // say so and name the control that brings them back.
                  hiddenCount > 0 && visibleEntities.length === 0
                  ? `All ${hiddenCount} entities here are marked diagnostic or config by Home Assistant. Tick "Show diagnostic & config" to see them.`
                  : 'No entities match your search.'
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
