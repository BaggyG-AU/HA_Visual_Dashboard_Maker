import React, { useState, useEffect, useMemo } from 'react';
import { Select, Input, Tag, Typography, Space, Alert, theme } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { loadPickerEntities, type EntitySourceKind } from '../services/entityPickerSource';
import { logger } from '../services/logger';
import { HAEntity } from '../types/homeassistant';
import { filterEntitiesForCard, matchesEntityQuery } from '../utils/entityCriteria';
import {
  filterEntitiesByRegistry,
  groupEntitiesByPlatform,
  type EntityRegistryIndex,
} from '../utils/entityRegistry';

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

  // Narrow to what this card can actually render, then apply any explicit
  // domain filter the call site asked for.
  //
  // Card-aware filtering is the primary axis of the picker re-engineering: a
  // gauge can only show a number, so offering it ~725 entities of which a few
  // dozen qualify is the whole findability problem. `filterEntitiesForCard`
  // returns the SAME array when the card type is unconstrained, so an
  // unrecognised or genuinely permissive card costs nothing here.
  const filteredEntities = useMemo(() => {
    const forCard = cardType ? filterEntitiesForCard(entities, cardType) : entities;

    // Home Assistant's own diagnostic/config marking, on top of the card-aware
    // cut. ⭐ The entity this field is ALREADY set to always survives — hiding
    // it would leave the picker unable to show its own current value.
    const forRegistry = filterEntitiesByRegistry(forCard, registry, {
      keepEntityIds: value ? [value] : undefined,
    });

    if (!filterDomains || filterDomains.length === 0) {
      return forRegistry;
    }

    return forRegistry.filter((entity) => {
      const domain = entity.entity_id.split('.')[0];
      return filterDomains.includes(domain);
    });
  }, [entities, filterDomains, cardType, registry, value]);

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
          // A group heading has no entity of its own; antd filters its children
          // and drops it when none survive. Returning false here would hide
          // every group and with it every option under one.
          if (candidate?.options) return true;
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
