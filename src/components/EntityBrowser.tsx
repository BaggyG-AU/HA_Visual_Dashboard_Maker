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

/**
 * Sentinel for the State facet's "anything that is actually reporting" option.
 *
 * ⚠ It cannot be a real state value, because it means "NOT unavailable and NOT
 * unknown" — a predicate, not a value. Named rather than inlined so the facet
 * definition and its `onFilter` cannot drift apart.
 */
const STATE_FACET_AVAILABLE = '__available__';

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
  /**
   * ⭐ UAT HA-02: the page size is STATE, not a literal.
   *
   * ⚠ It was `pagination={{ pageSize: 10, showSizeChanger: true }}` — a
   * CONTROLLED value with no `onShowSizeChange` behind it, so antd re-applied 10
   * on every render and the "10 / page" control the flag renders was inert.
   * Measured: choosing "50 / page" left the rendered row count at 10. A control
   * that is drawn but cannot act is worse than one that is absent.
   */
  const [pageSize, setPageSize] = useState(10);

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

  /**
   * ⭐⭐⭐ UAT HA-02: how many entities each group would hold if NOTHING were
   * hidden, so a tab can say "Kia Uvo (3 of 41)" rather than "Kia Uvo (3)".
   *
   * ⚠ THE DEFECT THIS CLOSES IS A READING, NOT A COUNT. "Kia Uvo (3)" is
   * arithmetically true and still misleads — a user reads it as "I own three",
   * not "three of my forty-one are being shown". `hiddenCount` below already
   * disclosed the cut GLOBALLY; what was missing was the disclosure at the
   * place the user is actually looking.
   *
   * Computed over `entities` (the raw list) rather than `visibleEntities`, and
   * only when the cut is active — with `showDiagnostic` on, the two counts are
   * equal by construction and the suffix would be noise.
   */
  const groupTotals = useMemo(() => {
    const totals = new Map<string, number>();
    if (showDiagnostic) return totals;

    if (groupBy === 'integration') {
      groupEntitiesByPlatform(entities as unknown as HAEntity[], registry).forEach((group) =>
        totals.set(group.platform, group.entities.length),
      );
      return totals;
    }

    entities.forEach((entity) => {
      const domain = entity.entity_id.split('.')[0];
      totals.set(domain, (totals.get(domain) ?? 0) + 1);
    });
    return totals;
  }, [entities, registry, groupBy, showDiagnostic]);

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
    //
    // ⭐⭐⭐ HA-02: the entity's OWNING INTEGRATION is passed as the third
    // argument. Without it, "kia" found 1 of 41 `kia_uvo` entities because the
    // other 40 are named after the car ("EV6 …") and never mention the brand.
    return entitiesToFilter.filter((entity) =>
      matchesEntityQuery(
        entity as unknown as HAEntity,
        searchTerm,
        registry?.get(entity.entity_id)?.platform,
      ),
    );
  }, [visibleEntities, groups, resolvedTab, searchTerm, registry]);

  const hiddenCount = entities.length - visibleEntities.length;

  /**
   * Distinct values for a column's Excel-style filter list.
   *
   * ⚠ Derived from `visibleEntities`, not `filteredEntities` — a facet computed
   * from the already-facetted set collapses to whatever is on screen, so
   * unticking a value could never bring anything back.
   */
  const domainFilters = useMemo(() => {
    const domains = new Set(visibleEntities.map((e) => e.entity_id.split('.')[0]));
    return [...domains].sort().map((d) => ({ text: d, value: d }));
  }, [visibleEntities]);

  const integrationFilters = useMemo(() => {
    if (!registry) return [];
    const platforms = new Set<string>();
    visibleEntities.forEach((e) => {
      const platform = registry.get(e.entity_id)?.platform;
      if (platform) platforms.add(platform);
    });
    return [...platforms].sort().map((p) => ({ text: platformLabel(p), value: p }));
  }, [visibleEntities, registry]);

  /**
   * ⭐⭐ Spreadsheet-style column controls: sort both directions on every column,
   * and a searchable tick-list facet where the column has a SMALL set of
   * distinct values.
   *
   * ⚠⚠ WHICH COLUMNS GET A FACET IS A DELIBERATE JUDGEMENT, NOT AN OVERSIGHT.
   * `Domain` (~20 values) and `Integration` (~24 on the reference instance) are
   * exactly what a tick-list is for. `Entity ID` and `Friendly Name` have ONE
   * DISTINCT VALUE PER ROW — 725 of them — so a tick-list there is a strictly
   * worse duplicate of the free-text box above the table, which already matches
   * across both fields. They get sorters only.
   *
   * ⚠⚠⚠ `State` IS FACETTED ON AVAILABILITY, NOT ON RAW VALUES. Every numeric
   * sensor reading is its own state, so a raw list reads
   * "22.5 · 22.6 · 41 · 42 · on · off · unavailable…" — hundreds of entries that
   * bury the only question anyone asks of this column, which is "what is
   * broken?". Three curated options answer it; a faithful list would not.
   */
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
      sorter: (a, b) =>
        (a.attributes.friendly_name ?? '').localeCompare(b.attributes.friendly_name ?? ''),
      render: (_, record) => record.attributes.friendly_name || '—',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: '15%',
      sorter: (a, b) => String(a.state ?? '').localeCompare(String(b.state ?? '')),
      filters: [
        { text: 'Available', value: STATE_FACET_AVAILABLE },
        { text: 'Unavailable', value: 'unavailable' },
        { text: 'Unknown', value: 'unknown' },
      ],
      onFilter: (value, record) => {
        const state = String(record.state ?? '').toLowerCase();
        return value === STATE_FACET_AVAILABLE
          ? state !== 'unavailable' && state !== 'unknown'
          : state === value;
      },
      render: (text: string, record) => {
        const unit = record.attributes.unit_of_measurement;
        return unit ? `${text} ${unit}` : text;
      },
    },
    {
      title: 'Domain',
      key: 'domain',
      dataIndex: 'entity_id',
      width: '15%',
      sorter: (a, b) =>
        a.entity_id.split('.')[0].localeCompare(b.entity_id.split('.')[0]) ||
        a.entity_id.localeCompare(b.entity_id),
      filters: domainFilters,
      filterSearch: true,
      onFilter: (value, record) => record.entity_id.split('.')[0] === value,
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
            // ⚠ The tab strip's "Group by: Integration" is NOT made redundant by
            // this facet, and both are kept on purpose. The tabs are exclusive —
            // "show me ONE integration" — while the facet is multi-select —
            // "show me THESE THREE together". Different questions, same data.
            sorter: (a: Entity, b: Entity) =>
              (registry.get(a.entity_id)?.platform ?? '').localeCompare(
                registry.get(b.entity_id)?.platform ?? '',
              ),
            filters: integrationFilters,
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record: Entity) =>
              registry.get(record.entity_id)?.platform === value,
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

  // Create a tab per group on whichever axis is active.
  //
  // ⭐⭐⭐ UAT HA-02: a tab whose group has been thinned by the diagnostic cut
  // reads "Kia Uvo (3 of 41)", not "Kia Uvo (3)". The bare count is
  // arithmetically correct and still misleads — the tester read it as "I own
  // three of these" when they owned forty-one. The "of N" suffix appears ONLY
  // where the two numbers differ, so a tab that is showing everything stays
  // clean.
  const labelWithTotal = (label: string, shown: number, key: string): string => {
    const total = groupTotals.get(key);
    return total !== undefined && total > shown
      ? `${label} (${shown} of ${total})`
      : `${label} (${shown})`;
  };

  const tabItems = [
    {
      key: 'all',
      label:
        hiddenCount > 0
          ? `All (${visibleEntities.length} of ${entities.length})`
          : `All (${visibleEntities.length})`,
    },
    ...groups.map((group) => ({
      key: group.key,
      label: labelWithTotal(group.label, group.entities.length, group.key),
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
          /* ⚠⚠ THIS TEXT USED TO PROMISE `state` AND THE SEARCH NEVER LOOKED AT
             IT — measured: entities whose state was "42" were not found by
             typing "42". It also failed to mention `integration`, which the
             Group-by control right below treats as a first-class axis. Both
             halves are now true: integration IS searched (UAT HA-02), and
             availability is filtered on the State column's own facet rather
             than through free text. */
          placeholder="Search by entity ID, name, integration, device class or unit..."
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
              pageSize,
              showSizeChanger: true,
              // ⚠ BOTH handlers, deliberately. `onShowSizeChange` fires for the
              // "N / page" select, but antd ALSO reports a size change through
              // `onChange`'s second argument — and a user who changes the size
              // while on page 3 goes through that path. Wiring only the first
              // leaves the control working in one direction.
              onShowSizeChange: (_current, size) => setPageSize(size),
              onChange: (_page, size) => {
                if (size && size !== pageSize) setPageSize(size);
              },
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
