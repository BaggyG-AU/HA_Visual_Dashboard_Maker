import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  Typography,
  List,
  Select,
  Space,
  Flex,
  Button,
  Tag,
  Input,
  Divider,
  Alert,
  Tabs,
  Empty,
} from 'antd';
import type { EntityState } from '../services/haWebSocketService';
import {
  entityRemappingService,
  type EntityMapping,
  type EntitySuggestion,
} from '../services/entityRemapping';
import { loadPickerEntities } from '../services/entityPickerSource';
import {
  platformLabel,
  UNREGISTERED_PLATFORM,
  type EntityRegistryIndex,
} from '../utils/entityRegistry';
import { logger } from '../services/logger';
import type { DashboardConfig } from '../types/dashboard';

const { Text, Title } = Typography;
const isTestEnv = () =>
  (typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || process.env.E2E === '1')) ||
  (typeof window !== 'undefined' &&
    Boolean((window as any).E2E || (window as any).PLAYWRIGHT_TEST));

interface Props {
  visible: boolean;
  missingEntities: string[];
  availableEntities: EntityState[];
  dashboardConfig: DashboardConfig | null;
  onClose: () => void;
  onApply: (config: DashboardConfig, mappings: EntityMapping[]) => void;
}

type MappingState = Record<string, string | null>;

/**
 * What pressing "Auto-map All" actually did. HA-04: the button used to merge its
 * result into state and say nothing, so a run that matched nothing — and a run
 * whose matches the mount effect below had ALREADY applied — were both
 * indistinguishable from a dead button.
 */
interface AutoMapOutcome {
  /** Confident matches the service returned (score >= its threshold). */
  matched: number;
  /** Of those, how many were not already selected. */
  changed: number;
  /** Missing entities considered. */
  total: number;
}

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
  const [autoMapOutcome, setAutoMapOutcome] = useState<AutoMapOutcome | null>(null);
  const [registry, setRegistry] = useState<EntityRegistryIndex | null>(null);

  /**
   * HA-04: the owner asked for "the integration that the entity belongs to" when
   * choosing a replacement. That lives in Home Assistant's entity registry, so
   * load it the same way every other picker does.
   *
   * ⚠⚠ DISPLAY ONLY — never filter `availableEntities` by this. That list is
   * "WHAT EXISTS" and feeds `detectMissing`; cutting diagnostic/config entities
   * out of it would make HAVDM report a dashboard's diagnostic entity as
   * vanished from the user's Home Assistant. See the same warning on the effect
   * that builds the list in `App.tsx`.
   */
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    loadPickerEntities()
      .then(({ registry: loaded }) => {
        if (!cancelled) setRegistry(loaded);
      })
      .catch((err) => {
        // A missing registry costs labels, never candidates — the picker still
        // lists every entity, just without its integration name.
        logger.warn('Entity registry unavailable for remap labels', err);
      });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const integrationOf = React.useCallback(
    (entityId: string): string =>
      platformLabel(registry?.get(entityId)?.platform ?? UNREGISTERED_PLATFORM),
    [registry],
  );

  const suggestionsMap = useMemo<Record<string, EntitySuggestion[]>>(() => {
    const entries = missingEntities.map(
      (id) => [id, entityRemappingService.buildSuggestions(id, availableEntities)] as const,
    );
    return Object.fromEntries(entries);
  }, [missingEntities, availableEntities]);

  /**
   * Replacement candidates for one missing entity: the scored suggestions first,
   * then EVERY other entity on the instance, alphabetically.
   *
   * ⭐ HA-04: `buildSuggestions` ends `.slice(0, 5)`, and the dropdown used to
   * render exactly those five — so `showSearch` filtered *within five options*.
   * On an instance with hundreds of entities that is the "not enough information
   * to be able to map the missing entities" report: if the entity you wanted was
   * not one of the five, no amount of typing could reach it. The five stay on
   * top because the ranking is genuinely useful; they are no longer the whole
   * list.
   *
   * `title` is what the search box matches, and it carries the integration name
   * so "kia" finds every Kia Uvo entity even when the id says "ev6".
   */
  const optionsMap = useMemo(() => {
    const build = (missing: string) => {
      const suggestions = suggestionsMap[missing] ?? [];
      const suggested = new Set(suggestions.map((s) => s.entityId));

      const toOption = (
        entityId: string,
        friendlyName: string | undefined,
        score: number | null,
      ) => {
        const integration = integrationOf(entityId);
        return {
          value: entityId,
          title: [entityId, friendlyName ?? '', integration].join(' '),
          label: (
            <Space direction="vertical" size={0}>
              <Space size={4} wrap>
                <Text strong>{entityId}</Text>
                {score !== null && (
                  <Tag color={score >= 0.8 ? 'green' : score >= 0.6 ? 'blue' : 'default'}>
                    {Math.round(score * 100)}%
                  </Tag>
                )}
                <Tag>{integration}</Tag>
              </Space>
              {friendlyName && <Text type="secondary">{friendlyName}</Text>}
            </Space>
          ),
        };
      };

      const rest = availableEntities
        .filter((entity) => !suggested.has(entity.entity_id))
        .sort((a, b) => a.entity_id.localeCompare(b.entity_id))
        .map((entity) =>
          toOption(entity.entity_id, entity.attributes?.friendly_name as string | undefined, null),
        );

      return [...suggestions.map((s) => toOption(s.entityId, s.friendlyName, s.score)), ...rest];
    };

    return Object.fromEntries(missingEntities.map((id) => [id, build(id)] as const));
  }, [missingEntities, availableEntities, suggestionsMap, integrationOf]);

  // A stale outcome would describe a run against a different set of entities.
  useEffect(() => {
    setAutoMapOutcome(null);
  }, [visible, missingEntities, availableEntities]);

  useEffect(() => {
    const initial = entityRemappingService.autoMapSuggestions(missingEntities, availableEntities);
    if (initial.length === 0) return;
    const initialState: MappingState = {};
    initial.forEach(({ from, to }) => {
      initialState[from] = to;
    });
    setMappingState((prev) => ({ ...initialState, ...prev }));
  }, [missingEntities, availableEntities]);

  const savedMappings = useMemo(() => entityRemappingService.getEntityMappings(), [historyVersion]);

  const handleChange = (source: string, target: string | null) => {
    setMappingState((prev) => ({ ...prev, [source]: target }));
  };

  const handleAutoMapAll = () => {
    const auto = entityRemappingService.autoMapSuggestions(missingEntities, availableEntities);
    const next: MappingState = { ...mappingState };
    let changed = 0;
    auto.forEach(({ from, to }) => {
      if (next[from] !== to) changed += 1;
      next[from] = to;
    });
    setMappingState(next);
    setAutoMapOutcome({ matched: auto.length, changed, total: missingEntities.length });
  };

  // Expose handleApply to window for test automation
  useEffect(() => {
    if (!isTestEnv() || typeof window === 'undefined') return;
    const testWindow = window as Window & { __remapTestApply?: () => void };
    testWindow.__remapTestApply = () => {
      // Call handleApply indirectly to ensure latest state is used
      const btn = document.querySelector('[data-testid="remap-apply"]') as HTMLButtonElement | null;
      if (btn && !btn.disabled) {
        // Simulate what handleApply does with current state
        if (!dashboardConfig) {
          onClose();
          return;
        }
        const mappings = Object.entries(mappingState)
          .filter(([, to]) => Boolean(to))
          .map(([from, to]) => ({ from, to: to as string }));
        if (mappings.length === 0) return;
        const mergedConfig = entityRemappingService.applyMappings(dashboardConfig, mappings);
        entityRemappingService.persistMappings(mappings);
        onApply(mergedConfig, mappings);
      }
    };
    return () => {
      delete testWindow.__remapTestApply;
    };
  }, [visible, dashboardConfig, mappingState, onApply, onClose]);

  const handleApply = () => {
    if (isTestEnv() && typeof window !== 'undefined') {
      const testWindow = window as Window & { __remapDebug?: Record<string, unknown> };
      const existing =
        testWindow.__remapDebug && typeof testWindow.__remapDebug === 'object'
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
        const existing =
          testWindow.__remapDebug && typeof testWindow.__remapDebug === 'object'
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
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as any)}
        items={[
          { key: 'remap', label: 'Remap' },
          { key: 'history', label: 'History' },
        ]}
      />

      {activeTab === 'remap' && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            message={
              missingEntities.length
                ? 'Missing entities detected. Map them to available Home Assistant entities.'
                : 'No missing entities detected. You can still override mappings or reuse history.'
            }
            showIcon
          />

          <Flex align="center" justify="space-between" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>
              Missing Entities ({missingEntities.length})
            </Title>
            <Space>
              <Button onClick={handleAutoMapAll} data-testid="remap-auto-map">
                Auto-map All
              </Button>
              <Button
                type="primary"
                onClick={handleApply}
                disabled={!Object.values(mappingState).some(Boolean)}
                data-testid="remap-apply"
              >
                Apply Mappings
              </Button>
            </Space>
          </Flex>

          {/* ⭐ HA-04: "Auto-map doesn't work". Measured against the reference
              instance, the matcher is correct — it scores a genuinely renamed
              entity at 100% and maps it. What was broken is that the button
              never said so. Worse, the effect above already runs the SAME call
              with the SAME arguments on mount, so in the ordinary case pressing
              the button cannot change anything and silently changed nothing.
              A control that cannot report its own outcome is indistinguishable
              from a dead one. */}
          {autoMapOutcome && (
            <Alert
              type={autoMapOutcome.matched > 0 ? 'success' : 'warning'}
              showIcon
              data-testid="remap-auto-map-outcome"
              title={
                autoMapOutcome.total === 0
                  ? 'There are no missing entities to map.'
                  : autoMapOutcome.matched === 0
                    ? `No replacement scored high enough to map automatically for any of the ${autoMapOutcome.total} missing ${autoMapOutcome.total === 1 ? 'entity' : 'entities'}. Choose one below — the closest candidates are listed first, and you can search every entity by id, name or integration.`
                    : autoMapOutcome.changed === 0
                      ? `Auto-map had already filled in ${autoMapOutcome.matched === autoMapOutcome.total ? 'every' : `${autoMapOutcome.matched} of the ${autoMapOutcome.total}`} confident ${autoMapOutcome.matched === 1 ? 'match' : 'matches'} when this dialog opened, so nothing changed. Review the selections below.`
                      : `Auto-mapped ${autoMapOutcome.changed} of ${autoMapOutcome.total} missing ${autoMapOutcome.total === 1 ? 'entity' : 'entities'}. Review the selections below before applying.`
              }
            />
          )}

          <List
            dataSource={missingEntities}
            renderItem={(missing) => {
              const options = optionsMap[missing] ?? [];
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
                      placeholder="Search by entity id, name or integration"
                      style={{ width: '100%' }}
                      value={selected ?? undefined}
                      onChange={(val) => handleChange(missing, val ?? null)}
                      data-testid={`remap-select-${missing}`}
                      options={options}
                      // Explicit rather than `optionFilterProp`, because `label`
                      // is a node here and only `title` is a searchable string.
                      filterOption={(input, option) =>
                        String(option?.title ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                    <Input
                      placeholder="Manual entity ID"
                      // Holds only an id typed by hand. The dropdown now lists
                      // every entity on the instance, so "not in the options" is
                      // the honest test for "the user invented this one".
                      value={
                        selected && !options.some((option) => option.value === selected)
                          ? selected
                          : ''
                      }
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
          <Flex align="center" justify="space-between" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>
              Saved Mappings
            </Title>
            <Button
              danger
              onClick={handleClearSaved}
              disabled={!savedMappings.length}
              data-testid="remap-clear-history"
            >
              Clear All
            </Button>
          </Flex>
          {savedMappings.length === 0 && <Empty description="No saved mappings" />}
          {savedMappings.length > 0 && (
            <List
              dataSource={savedMappings}
              renderItem={(mapping) => (
                <List.Item
                  key={mapping.from}
                  actions={[
                    <Button
                      type="link"
                      onClick={() => handleUseSaved(mapping)}
                      data-testid={`remap-use-saved-${mapping.from}`}
                    >
                      Use
                    </Button>,
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
        <Text type="secondary">
          Mappings are stored locally and reused on future imports. Confidence scores are derived
          from domain and name similarity.
        </Text>
      </Space>
    </Modal>
  );
};

export default EntityRemappingModal;
