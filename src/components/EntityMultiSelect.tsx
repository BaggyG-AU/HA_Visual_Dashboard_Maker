import React, { useState, useEffect, useMemo } from 'react';
import { Select, Tag, Typography, Space, Alert, theme } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { loadPickerEntities, type EntitySourceKind } from '../services/entityPickerSource';
import { logger } from '../services/logger';
import { HAEntity } from '../types/homeassistant';
import {
  filterEntitiesByRegistry,
  groupEntitiesByPlatform,
  type EntityRegistryIndex,
} from '../utils/entityRegistry';

const { Text } = Typography;

// Stable empty default so omitting `value` does not create a new array each
// render (which, with the value-dependent validation effect, would re-render
// without end).
const EMPTY_VALUE: string[] = [];

interface EntityMultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  filterDomains?: string[]; // e.g., ['light', 'switch']
  dataTestId?: string;
}

/**
 * Multi-entity selector with autocomplete and validation
 * Features:
 * - Autocomplete from Home Assistant entities
 * - Real-time entity validation for each selected entity
 * - Domain filtering
 * - Friendly name display
 * - Visual feedback for invalid entities
 */
export const EntityMultiSelect: React.FC<EntityMultiSelectProps> = ({
  value = EMPTY_VALUE,
  onChange,
  placeholder = 'Select entities',
  filterDomains,
  dataTestId,
}) => {
  const { token } = theme.useToken();
  const [entities, setEntities] = useState<HAEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationMap, setValidationMap] = useState<Map<string, HAEntity | null>>(new Map());
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

  // Validate all selected entities
  useEffect(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      setValidationMap(new Map());
      return;
    }

    const newValidationMap = new Map<string, HAEntity | null>();
    value.forEach((entityId) => {
      const entity = entities.find((e) => e.entity_id === entityId);
      newValidationMap.set(entityId, entity || null);
    });
    setValidationMap(newValidationMap);
  }, [value, entities]);

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  // Filter entities by domain if specified
  const filteredEntities = useMemo(() => {
    // Home Assistant's diagnostic/config marking. ⭐ Everything ALREADY chosen
    // survives the cut — a multi-select that hid one of its own selections
    // would show a tag the user could not find again in the list.
    const forRegistry = filterEntitiesByRegistry(entities, registry, {
      keepEntityIds: safeValue,
    });

    if (!filterDomains || filterDomains.length === 0) {
      return forRegistry;
    }

    return forRegistry.filter((entity) => {
      const domain = entity.entity_id.split('.')[0];
      return filterDomains.includes(domain);
    });
    // `safeValue` is derived from `value`, which is the stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities, filterDomains, registry, value]);

  /** A leaf option. `searchText` is what `filterOption` matches against. */
  type EntityOption = { value: string; label: React.ReactNode; searchText: string };
  /** A heading — "Selected", or an integration — with its entities nested underneath. */
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
      searchText: `${entity.entity_id} ${friendlyName}`.toLowerCase(),
    };
  };

  /**
   * Options for the select, selected entries first.
   *
   * ⭐ Selected-first ordering and integration grouping are two different
   * orderings of the same list, and the selected-first behaviour predates this
   * slice and is genuinely useful in a multi-select. Rather than drop one for
   * the other, the selection becomes its own leading group and the remainder is
   * grouped by integration underneath it.
   */
  const sortedOptions = useMemo<(EntityOption | EntityOptionGroup)[]>(() => {
    const selected = filteredEntities.filter((e) => safeValue.includes(e.entity_id));
    const unselected = filteredEntities.filter((e) => !safeValue.includes(e.entity_id));

    if (!registry) {
      return [...selected, ...unselected].map(renderOption);
    }

    const groups = groupEntitiesByPlatform(unselected, registry).map((group) => ({
      label: group.label,
      title: group.platform,
      options: group.entities.map(renderOption),
    }));

    return selected.length > 0
      ? [{ label: 'Selected', title: 'Selected', options: selected.map(renderOption) }, ...groups]
      : groups;
    // `safeValue` is derived from `value`, which is the stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEntities, value, registry]);

  // Handle entity selection
  const handleChange = (newValue: string[]) => {
    onChange?.(newValue);
  };

  // Render validation status for selected entities
  const renderValidation = () => {
    // Ensure value is an array
    if (!value || !Array.isArray(value) || value.length === 0) return null;
    if (loading) return null;

    const invalidEntities = value.filter((id) => !validationMap.get(id));
    const validEntities = value.filter((id) => validationMap.get(id));

    if (invalidEntities.length === 0) {
      return (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: '#1f3a1f',
            border: '1px solid #2a4a2a',
            borderRadius: '4px',
          }}
        >
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: '#52c41a', fontSize: '12px' }}>
              All {validEntities.length} {validEntities.length === 1 ? 'entity' : 'entities'}{' '}
              validated
            </Text>
          </Space>
        </div>
      );
    }

    return (
      <div style={{ marginTop: '8px' }}>
        <Alert
          message={`${invalidEntities.length} Invalid ${invalidEntities.length === 1 ? 'Entity' : 'Entities'}`}
          description={
            <div style={{ marginTop: '8px' }}>
              <Text style={{ fontSize: '12px', color: token.colorTextTertiary }}>
                The following entities do not exist:
              </Text>
              <div style={{ marginTop: '4px' }}>
                {invalidEntities.map((id) => (
                  <div key={id} style={{ marginTop: '4px' }}>
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <Text style={{ fontSize: '11px', color: token.colorTextSecondary }}>
                        {id}
                      </Text>
                    </Space>
                  </div>
                ))}
              </div>
            </div>
          }
          type="error"
          showIcon={false}
          style={{ fontSize: '12px' }}
        />

        {validEntities.length > 0 && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px 12px',
              background: '#1f3a1f',
              border: '1px solid #2a4a2a',
              borderRadius: '4px',
            }}
          >
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                {validEntities.length} {validEntities.length === 1 ? 'entity' : 'entities'}{' '}
                validated
              </Text>
            </Space>
          </div>
        )}
      </div>
    );
  };

  // Show error if failed to load entities
  if (error) {
    return (
      <div data-testid={dataTestId}>
        <Select
          mode="multiple"
          value={safeValue}
          onChange={handleChange}
          placeholder={placeholder}
          style={{ width: '100%' }}
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

  // No live connection AND no cached entities → prompt to connect. (When a cache
  // exists we fall through and offer it, so cards can be configured offline.)
  if (!loading && source === 'none') {
    return (
      <div data-testid={dataTestId}>
        <Select
          mode="multiple"
          value={safeValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled
          style={{ width: '100%' }}
        />
        <Alert
          message="Not Connected"
          description="Connect to Home Assistant to enable entity autocomplete and validation."
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginTop: '8px', fontSize: '12px' }}
        />
      </div>
    );
  }

  // Custom tag render to show friendly names
  const tagRender = (props: any) => {
    const { label, closable, onClose } = props;
    return (
      <Tag
        closable={closable}
        onClose={onClose}
        style={{
          marginRight: 3,
          backgroundColor: '#1a3a1a',
          borderColor: '#2a4a2a',
          color: '#52c41a',
        }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <div data-testid={dataTestId}>
      <Select
        mode="multiple"
        value={safeValue}
        onChange={handleChange}
        placeholder={placeholder}
        loading={loading}
        showSearch
        filterOption={(input, option) => {
          const candidate = option as { searchText?: string; options?: unknown[] } | undefined;
          // A group heading carries no searchText; antd filters its children and
          // drops it when none survive. Returning false would hide every group.
          if (candidate?.options) return true;
          if (!candidate?.searchText) return false;
          return candidate.searchText.includes(input.toLowerCase());
        }}
        options={sortedOptions}
        tagRender={tagRender}
        maxTagCount="responsive"
        style={{ width: '100%' }}
        classNames={{
          popup: {
            root: 'entity-select-dropdown',
          },
        }}
        styles={{
          popup: {
            root: {
              backgroundColor: token.colorBgElevated,
            },
          },
        }}
      />
      {source === 'cached' && (
        <Alert
          message="Offline — showing cached entities from your last connection"
          type="info"
          showIcon
          style={{ marginTop: '8px', fontSize: '12px' }}
        />
      )}
      {renderValidation()}
    </div>
  );
};
