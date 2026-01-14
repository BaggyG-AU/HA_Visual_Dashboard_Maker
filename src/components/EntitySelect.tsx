import React, { useState, useEffect, useMemo } from 'react';
import { Select, Tag, Typography, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { haConnectionService } from '../services/haConnectionService';
import { HAEntity } from '../types/homeassistant';

const { Text } = Typography;

interface EntitySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  filterDomains?: string[];  // e.g., ['light', 'switch']
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
  'data-testid': dataTestId,
}) => {
  const [entities, setEntities] = useState<HAEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<HAEntity | null>(null);

  // Load entities from Home Assistant
  useEffect(() => {
    const loadEntities = async () => {
      if (!haConnectionService.isConnected()) {
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
  }, []);

  // Validate selected entity and get full entity data
  useEffect(() => {
    if (!value) {
      setSelectedEntity(null);
      return;
    }

    const entity = entities.find(e => e.entity_id === value);
    setSelectedEntity(entity || null);
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
        <div style={{ marginTop: '8px', padding: '8px', background: '#1f1f1f', borderRadius: '4px' }}>
          <Text style={{ color: '#888', fontSize: '12px' }}>Loading entities...</Text>
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
        <div style={{
          marginTop: '8px',
          padding: '12px',
          background: '#1f1f1f',
          border: '1px solid #2a2a2a',
          borderRadius: '4px'
        }}>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>Valid Entity</Text>
            </Space>

            <div>
              <Text style={{ color: '#888', fontSize: '11px' }}>Friendly Name:</Text>
              <br />
              <Text style={{ color: '#fff', fontSize: '12px' }}>{friendlyName}</Text>
            </div>

            <div>
              <Text style={{ color: '#888', fontSize: '11px' }}>Domain:</Text>
              <br />
              <Tag color="blue" style={{ fontSize: '10px' }}>{domain}</Tag>
            </div>

            <div>
              <Text style={{ color: '#888', fontSize: '11px' }}>Current State:</Text>
              <br />
              <Tag color="green" style={{ fontSize: '11px' }}>{selectedEntity.state}</Tag>
            </div>

            {selectedEntity.attributes.unit_of_measurement && (
              <div>
                <Text style={{ color: '#888', fontSize: '11px' }}>Unit:</Text>
                <br />
                <Text style={{ color: '#fff', fontSize: '12px' }}>
                  {selectedEntity.attributes.unit_of_measurement}
                </Text>
              </div>
            )}

            <div>
              <Text style={{ color: '#666', fontSize: '10px' }}>
                Last updated: {new Date(selectedEntity.last_updated).toLocaleString()}
              </Text>
            </div>
          </Space>
        </div>
      );
    }

    return null;
  };

  // Show warning if not connected to HA
  if (!haConnectionService.isConnected()) {
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
          if (!option?.searchText) return false;
          return option.searchText.includes(input.toLowerCase());
        }}
        options={options}
        style={{ width: '100%' }}
        popupClassName="entity-select-dropdown"
        styles={{
          dropdown: {
            backgroundColor: '#1f1f1f',
          },
        }}
        data-testid={dataTestId}
      />
      {renderEntityPreview()}
    </div>
  );
};
