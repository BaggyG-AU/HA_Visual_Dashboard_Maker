import React, { useState, useEffect, useMemo } from 'react';
import { Select, Tag, Typography, Space, Alert } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { haConnectionService } from '../services/haConnectionService';
import { HAEntity } from '../types/homeassistant';

const { Text } = Typography;

interface EntityMultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  filterDomains?: string[];  // e.g., ['light', 'switch']
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
  value = [],
  onChange,
  placeholder = 'Select entities',
  filterDomains,
  dataTestId,
}) => {
  const [entities, setEntities] = useState<HAEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationMap, setValidationMap] = useState<Map<string, HAEntity | null>>(new Map());

  // Check connection status (must be before any conditional returns)
  const isConnected = haConnectionService.isConnected();

  // Load entities from Home Assistant
  useEffect(() => {
    const loadEntities = async () => {
      if (!isConnected) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedEntities = await haConnectionService.fetchEntities();
        setEntities(fetchedEntities);
      } catch (err) {
        setError((err as Error).message);
        console.error('Failed to load entities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [isConnected]);

  // Validate all selected entities
  useEffect(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      setValidationMap(new Map());
      return;
    }

    const newValidationMap = new Map<string, HAEntity | null>();
    value.forEach(entityId => {
      const entity = entities.find(e => e.entity_id === entityId);
      newValidationMap.set(entityId, entity || null);
    });
    setValidationMap(newValidationMap);
  }, [value, entities]);

  // Filter entities by domain if specified
  const filteredEntities = useMemo(() => {
    if (!filterDomains || filterDomains.length === 0) {
      return entities;
    }

    return entities.filter(entity => {
      const domain = entity.entity_id.split('.')[0];
      return filterDomains.includes(domain);
    });
  }, [entities, filterDomains]);

  // Create options for the select component
  const options = useMemo(() => {
    return filteredEntities.map(entity => {
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
    });
  }, [filteredEntities]);

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  // Sort options to show selected entities first
  const sortedOptions = useMemo(() => {
    const selected: typeof options = [];
    const unselected: typeof options = [];

    options.forEach(option => {
      if (safeValue.includes(option.value)) {
        selected.push(option);
      } else {
        unselected.push(option);
      }
    });

    return [...selected, ...unselected];
  }, [options, safeValue]);

  // Handle entity selection
  const handleChange = (newValue: string[]) => {
    onChange?.(newValue);
  };

  // Render validation status for selected entities
  const renderValidation = () => {
    // Ensure value is an array
    if (!value || !Array.isArray(value) || value.length === 0) return null;
    if (loading) return null;

    const invalidEntities = value.filter(id => !validationMap.get(id));
    const validEntities = value.filter(id => validationMap.get(id));

    if (invalidEntities.length === 0) {
      return (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: '#1f3a1f',
          border: '1px solid #2a4a2a',
          borderRadius: '4px'
        }}>
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: '#52c41a', fontSize: '12px' }}>
              All {validEntities.length} {validEntities.length === 1 ? 'entity' : 'entities'} validated
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
              <Text style={{ fontSize: '12px', color: '#666' }}>
                The following entities do not exist:
              </Text>
              <div style={{ marginTop: '4px' }}>
                {invalidEntities.map(id => (
                  <div key={id} style={{ marginTop: '4px' }}>
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <Text style={{ fontSize: '11px', color: '#ccc' }}>{id}</Text>
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
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: '#1f3a1f',
            border: '1px solid #2a4a2a',
            borderRadius: '4px'
          }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                {validEntities.length} {validEntities.length === 1 ? 'entity' : 'entities'} validated
              </Text>
            </Space>
          </div>
        )}
      </div>
    );
  };

  // Show warning if not connected to HA
  if (!isConnected) {
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
          if (!option?.searchText) return false;
          return option.searchText.includes(input.toLowerCase());
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
              backgroundColor: '#1f1f1f',
            },
          },
        }}
      />
      {renderValidation()}
    </div>
  );
};
