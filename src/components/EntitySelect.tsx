import React, { useState, useEffect, useMemo } from 'react';
import { Select, Input, Tag, Typography, Space, Alert, Checkbox, theme } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { loadPickerEntities, type EntitySourceKind } from '../services/entityPickerSource';
import { logger } from '../services/logger';
import { cardRegistry } from '../services/cardRegistry';
import { HAEntity } from '../types/homeassistant';
import { filterEntitiesForCard, matchesEntityQuery } from '../utils/entityCriteria';
import {
  filterEntitiesByRegistry,
  groupEntitiesByPlatform,
  type EntityRegistryIndex,
} from '../utils/entityRegistry';
import {
  SHOW_DIAGNOSTIC_LABEL,
  describePickerEmpty,
  describeVisibleCount,
} from '../utils/entityDisclosure';

const { Text } = Typography;

interface EntitySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  filterDomains?: string[]; // e.g., ['light', 'switch']
  /**
   * The card type this field belongs to. Narrows the offered entities to what
   * the card can actually render (a gauge to numeric measurements, a light card
   * to lights). Omit for a general-purpose picker.
   */
  cardType?: string;
  'data-testid'?: string;
}

/**
 * Entity selector with autocomplete, validation, and state preview
 * Features:
 * - Autocomplete from Home Assistant entities
 * - Real-time entity validation
 * - Entity state preview
 * - Domain filtering
 * - Friendly name display
 */
export const EntitySelect: React.FC<EntitySelectProps> = ({
  value,
  onChange,
  placeholder = 'Select entity',
  allowClear = true,
  filterDomains,
  cardType,
  'data-testid': dataTestId,
}) => {
  const { token } = theme.useToken();
  const [entities, setEntities] = useState<HAEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<HAEntity | null>(null);
  const [source, setSource] = useState<EntitySourceKind>('none');
  const [registry, setRegistry] = useState<EntityRegistryIndex | null>(null);

  // Load entities: live when connected, else the persisted offline cache so
  // cards can be configured without a live HA connection.
  useEffect(() => {
    const loadEntities = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          entities: loaded,
          source: loadedSource,
          registry: loadedRegistry,
        } = await loadPickerEntities();
        setEntities(loaded);
        setSource(loadedSource);
        setRegistry(loadedRegistry);
      } catch (err) {
        setError((err as Error).message);
        logger.error('Failed to load entities', err);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, []);

  // Validate selected entity and get full entity data
  useEffect(() => {
    if (!value) {
      setSelectedEntity(null);
      return;
    }

    const entity = entities.find((e) => e.entity_id === value);
    setSelectedEntity(entity || null);
  }, [value, entities]);

  // PROPS-03: the diagnostic/config escape hatch, and the query it applies to.
  // `searchText` is tracked because antd owns the search box — without it the
  // picker cannot say how many HIDDEN entities the user's query would match.
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Narrow to what this card can actually render, then apply any explicit
  // domain filter the call site asked for.
  //
  // Card-aware filtering is the primary axis of the picker re-engineering: a
  // gauge can only show a number, so offering it ~725 entities of which a few
  // dozen qualify is the whole findability problem. `filterEntitiesForCard`
  // returns the SAME array when the card type is unconstrained, so an
  // unrecognised or genuinely permissive card costs nothing here.
  // ⭐⭐⭐ PROPS-03. This was ONE memo returning ONE array, which is precisely why
  // the picker could not say anything: by the time it had an answer it had
  // forgotten what it discarded on the way. Measured on the reference instance,
  // the two stages do very different amounts of work for an unconstrained card —
  // `filterEntitiesForCard` removed 0 and `filterEntitiesByRegistry` removed 287
  // of 725 — so collapsing them also made the two causes indistinguishable.
  // Staged, each stage's survivors are addressable and the counts are real.
  const forCard = useMemo(
    () => (cardType ? filterEntitiesForCard(entities, cardType) : entities),
    [entities, cardType],
  );

  // Home Assistant's own diagnostic/config marking, on top of the card-aware
  // cut. ⭐ The entity this field is ALREADY set to always survives — hiding
  // it would leave the picker unable to show its own current value.
  //
  // ⚠⚠ `showDiagnostic` was NEVER PASSED, so this defaulted to false and the cut
  // was unconditional AND undisclosed. The default is deliberately unchanged —
  // 287 of 725 really is noise — but it is now the user's to overrule.
  const forRegistry = useMemo(
    () =>
      filterEntitiesByRegistry(forCard, registry, {
        showDiagnostic,
        keepEntityIds: value ? [value] : undefined,
      }),
    [forCard, registry, showDiagnostic, value],
  );

  const applyDomains = useMemo(() => {
    if (!filterDomains || filterDomains.length === 0) return (list: HAEntity[]) => list;
    return (list: HAEntity[]) =>
      list.filter((entity) => filterDomains.includes(entity.entity_id.split('.')[0]));
  }, [filterDomains]);

  /**
   * Everything this field could offer if the diagnostic cut were off.
   *
   * ⭐ This is the baseline the disclosure measures against — NOT `forCard`.
   * Several fields (the Light card at `PropertiesPanel.tsx:2303` among them)
   * narrow by `filterDomains` and pass no `cardType` at all, so measuring
   * against the card stage alone would credit the cut with removals it never
   * made and tell the user to tick a box that cannot help them.
   */
  const eligibleEntities = useMemo(() => applyDomains(forCard), [applyDomains, forCard]);

  const filteredEntities = useMemo(() => applyDomains(forRegistry), [applyDomains, forRegistry]);

  /**
   * What the diagnostic/config cut takes away — computed with the cut ALWAYS on,
   * independent of the toggle.
   *
   * ⚠⚠ Deliberately not derived from `forRegistry`. That would make the set empty
   * the moment the user ticks the box, the disclosure row would unmount, and
   * they would have no way to UNTICK it — a toggle you can turn on but not off.
   * Caught before it shipped; the fix is to ask "what WOULD be cut", which is a
   * property of the data, not of the current toggle state.
   */
  const cutByRegistry = useMemo(() => {
    const kept = new Set(
      filterEntitiesByRegistry(eligibleEntities, registry, {
        keepEntityIds: value ? [value] : undefined,
      }).map((entity) => entity.entity_id),
    );
    return eligibleEntities.filter((entity) => !kept.has(entity.entity_id));
  }, [eligibleEntities, registry, value]);

  /** Of those, the ones currently out of reach (i.e. the toggle is off). */
  const hiddenByRegistry = useMemo(
    () => (showDiagnostic ? [] : cutByRegistry),
    [showDiagnostic, cutByRegistry],
  );

  /**
   * How many HIDDEN entities the current query would have matched.
   *
   * ⭐⭐⭐ This is the number that answers the owner's report. On the reference
   * instance "light" matches exactly three entities and all three are
   * `entity_category: diagnostic`, so the picker returned nothing while holding
   * the answer. Saying "3 matching entities are hidden" turns a dead end into a
   * next step. Kept in its own memo so it recomputes per keystroke without
   * re-running the whole pipeline above.
   */
  const hiddenMatchingSearch = useMemo(() => {
    const query = searchText.trim();
    if (!query || hiddenByRegistry.length === 0) return 0;
    return hiddenByRegistry.filter((entity) =>
      matchesEntityQuery(entity, query, registry?.get(entity.entity_id)?.platform),
    ).length;
  }, [hiddenByRegistry, searchText, registry]);

  /** A leaf option. `entity` rides along so `filterOption` can match the whole entity. */
  type EntityOption = { value: string; label: React.ReactNode; entity: HAEntity };
  /** An integration heading with its entities nested underneath. */
  type EntityOptionGroup = { label: string; title: string; options: EntityOption[] };

  const renderOption = (entity: HAEntity): EntityOption => {
    const domain = entity.entity_id.split('.')[0];
    const friendlyName = entity.attributes.friendly_name || entity.entity_id;

    return {
      value: entity.entity_id,
      label: (
        <Space>
          <Tag color="blue" style={{ fontSize: '10px', padding: '0 4px' }}>
            {domain}
          </Tag>
          <span>{friendlyName}</span>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            ({entity.entity_id})
          </Text>
        </Space>
      ),
      // Carried so `filterOption` can do multi-token matching against the
      // whole entity rather than one pre-concatenated string.
      entity,
    };
  };

  // Create options for the select component.
  //
  // ⭐ With a registry, options are nested under an integration heading — the
  // "group header" form the owner chose over a flat `<integration>: <entity>`
  // row prefix, which repeats the same slug down dozens of rows without
  // discriminating within a group. Without a registry, the flat list is
  // returned exactly as before.
  const options = useMemo<(EntityOption | EntityOptionGroup)[]>(() => {
    if (!registry) {
      return filteredEntities.map(renderOption);
    }

    return groupEntitiesByPlatform(filteredEntities, registry).map((group) => ({
      label: group.label,
      title: group.platform,
      options: group.entities.map(renderOption),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEntities, registry]);

  // Handle entity selection
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  // Show entity state preview if entity is selected and validated
  const renderEntityPreview = () => {
    if (!value) return null;

    // Entity is being validated
    if (loading) {
      return (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: token.colorBgElevated,
            borderRadius: '4px',
          }}
        >
          <Text style={{ color: token.colorTextSecondary, fontSize: '12px' }}>
            Loading entities...
          </Text>
        </div>
      );
    }

    // Entity is not found (invalid)
    if (value && !selectedEntity) {
      return (
        <Alert
          message="Entity Not Found"
          description={
            <Text style={{ fontSize: '12px' }}>
              Entity "{value}" does not exist in your Home Assistant instance.
            </Text>
          }
          type="error"
          icon={<CloseCircleOutlined />}
          showIcon
          style={{ marginTop: '8px', fontSize: '12px' }}
        />
      );
    }

    // Entity is found and valid - show preview
    if (selectedEntity) {
      const domain = selectedEntity.entity_id.split('.')[0];
      const friendlyName = selectedEntity.attributes.friendly_name || selectedEntity.entity_id;

      return (
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            background: token.colorBgElevated,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: '4px',
          }}
        >
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                Valid Entity
              </Text>
            </Space>

            <div>
              <Text style={{ color: token.colorTextSecondary, fontSize: '11px' }}>
                Friendly Name:
              </Text>
              <br />
              <Text style={{ color: token.colorText, fontSize: '12px' }}>{friendlyName}</Text>
            </div>

            <div>
              <Text style={{ color: token.colorTextSecondary, fontSize: '11px' }}>Domain:</Text>
              <br />
              <Tag color="blue" style={{ fontSize: '10px' }}>
                {domain}
              </Tag>
            </div>

            <div>
              <Text style={{ color: token.colorTextSecondary, fontSize: '11px' }}>
                Current State:
              </Text>
              <br />
              <Tag color="green" style={{ fontSize: '11px' }}>
                {selectedEntity.state}
              </Tag>
            </div>

            {selectedEntity.attributes.unit_of_measurement && (
              <div>
                <Text style={{ color: token.colorTextSecondary, fontSize: '11px' }}>Unit:</Text>
                <br />
                <Text style={{ color: token.colorText, fontSize: '12px' }}>
                  {selectedEntity.attributes.unit_of_measurement}
                </Text>
              </div>
            )}

            <div>
              <Text style={{ color: token.colorTextTertiary, fontSize: '10px' }}>
                Last updated: {new Date(selectedEntity.last_updated).toLocaleString()}
              </Text>
            </div>
          </Space>
        </div>
      );
    }

    return null;
  };

  // Show error if failed to load entities
  if (error) {
    return (
      <div>
        <Select
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          allowClear={allowClear}
          style={{ width: '100%' }}
          data-testid={dataTestId}
        />
        <Alert
          message="Failed to Load Entities"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: '8px', fontSize: '12px' }}
        />
      </div>
    );
  }

  // No live connection AND no cached entities → there is nothing to autocomplete
  // FROM, but the user may well know the id they want.
  //
  // PROPS-03. This branch used to render an EMPTY `<Select>` with no options and
  // no search, which is a read-only dead end: a never-connected user could not
  // enter an entity id at all. That contradicted the card's own pre-condition
  // ("Works both connected and not") and THE VISION's ruling that the
  // never-connected default is PERMISSIVE. A plain text field cannot validate
  // the id, but it lets the work proceed and says plainly why it cannot help.
  if (!loading && source === 'none') {
    return (
      <div>
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. sensor.living_room_temperature"
          allowClear={allowClear}
          style={{ width: '100%' }}
          data-testid={dataTestId}
        />
        <Alert
          title="Not connected — type an entity id manually"
          description="Connect to Home Assistant, or open a dashboard while connected, to browse and validate entities. Ids typed here are used as-is."
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginTop: '8px', fontSize: '12px' }}
        />
      </div>
    );
  }

  return (
    <div>
      <Select
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        allowClear={allowClear}
        loading={loading}
        showSearch
        filterOption={(input, option) => {
          // Multi-token, order-independent. The previous single `includes()`
          // over one concatenated string forced the user to remember the stored
          // word order — "battery kia" found nothing for "Kia EV6 Battery Level".
          const candidate = option as { entity?: HAEntity; options?: unknown[] } | undefined;
          // ⚠⚠⚠ PROPS-03: THIS RETURNED `true` AND THAT MADE THE SEARCH INERT.
          //
          // The comment here used to read "antd filters its children and drops
          // it when none survive. Returning false here would hide every group
          // and with it every option under one." That is BACKWARDS, and
          // `@rc-component/select/lib/hooks/useFilterOptions.js` says so plainly:
          //
          //     if (item[fieldOptions]) {                  // a group
          //       const matchGroup = filterFunc(search, item);
          //       if (matchGroup) { filteredOptions.push(item); }   // ALL children kept
          //       else { ...filter the children... }
          //     }
          //
          // So `true` keeps the WHOLE GROUP WITH EVERY CHILD UNFILTERED, and
          // `false` is what makes rc-select filter the children and keep the
          // group only if any survive. Measured: with a registry present — i.e.
          // whenever connected, because that is when options are grouped by
          // integration — typing a query filtered NOTHING. Five seeded entities,
          // a query matching three, five rows rendered.
          //
          // ⚠ That also means HA-02's integration-search fix (PR #110) reached
          // this picker's matcher but could never have changed what it showed.
          if (candidate?.options) return false;
          if (!candidate?.entity) return false;
          // ⭐⭐ UAT HA-02 was reported against the Entity BROWSER, but the fix
          // belongs to the shared matcher — so this picker gains integration
          // search in the same change. ⚠ ENUMERATE BY DEPENDENCY, NOT BY NAME:
          // `grep -rn "matchesEntityQuery" src/` is what found this second call
          // site, exactly as PROPS-05's "fifth picker" was found by grepping
          // `useHAEntities` rather than by looking for things called "picker".
          return matchesEntityQuery(
            candidate.entity,
            input,
            registry?.get(candidate.entity.entity_id)?.platform,
          );
        }}
        onSearch={setSearchText}
        // ⭐⭐⭐ PROPS-03. antd's default here is the bare word "No data", which is
        // the same answer for four different situations — nothing cached, the
        // card admits nothing, the cut hid everything, or the match is behind
        // the cut. `describePickerEmpty` names which one, so the user can act.
        notFoundContent={
          <div
            data-testid="entity-select-empty"
            style={{ padding: '8px 12px', fontSize: '12px', color: token.colorTextSecondary }}
          >
            {describePickerEmpty({
              totalEntities: entities.length,
              eligible: eligibleEntities.length,
              offered: filteredEntities.length,
              hiddenMatchingSearch,
              searchText,
              cardLabel: cardType ? (cardRegistry.get(cardType)?.name ?? null) : null,
              domains: filterDomains,
            })}
          </div>
        }
        options={options}
        style={{ width: '100%' }}
        popupClassName="entity-select-dropdown"
        styles={{
          popup: {
            root: {
              backgroundColor: token.colorBgElevated,
            },
          },
        }}
        data-testid={dataTestId}
      />
      {/*
        ⭐⭐⭐ PROPS-03: the hidden set is never invisible, and there is always a
        way back to it — the same contract the Entity Browser has honoured all
        along, on the surface that applied the same cut in silence.

        ⚠ Rendered ONLY when something is actually hidden. This picker appears at
        eight-plus sites in the Properties panel, and a permanent row of chrome
        under every entity field would be a real cost for a message that is
        usually "nothing was hidden". A safety notice that fires when nothing is
        at risk spends attention.
      */}
      {cutByRegistry.length > 0 && (
        <Space size="small" style={{ marginTop: '4px' }}>
          <div data-testid="entity-select-show-diagnostic">
            <Checkbox
              checked={showDiagnostic}
              onChange={(e) => setShowDiagnostic(e.target.checked)}
            >
              <span style={{ fontSize: '11px' }}>{SHOW_DIAGNOSTIC_LABEL}</span>
            </Checkbox>
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }} data-testid="entity-select-count">
            {describeVisibleCount(filteredEntities.length, eligibleEntities.length)}
          </Text>
        </Space>
      )}
      {source === 'cached' && (
        <Alert
          message="Offline — showing cached entities from your last connection"
          type="info"
          showIcon
          style={{ marginTop: '8px', fontSize: '12px' }}
        />
      )}
      {renderEntityPreview()}
    </div>
  );
};
