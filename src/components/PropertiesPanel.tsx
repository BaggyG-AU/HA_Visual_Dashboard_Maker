import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, Divider, Select, Alert } from 'antd';
import { Card } from '../types/dashboard';
import { cardRegistry } from '../services/cardRegistry';
import { EntitySelect } from './EntitySelect';
import { EntityMultiSelect } from './EntityMultiSelect';
import { IconSelect } from './IconSelect';
import { haConnectionService } from '../services/haConnectionService';

const { Title, Text } = Typography;

interface PropertiesPanelProps {
  card: Card | null;
  cardIndex: number | null;
  onSave: (updatedCard: Card) => void;
  onCancel: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  card,
  cardIndex,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);
  const [streamComponentEnabled, setStreamComponentEnabled] = useState<boolean | null>(null);

  // Helper function to normalize entities for form display
  const normalizeCardForForm = (card: Card): any => {
    const normalized = { ...card };

    // Handle entities field - can be array, object, or missing
    if (normalized.entities) {
      // Case 1: Array of entities (most common for simple cards)
      if (Array.isArray(normalized.entities)) {
        normalized.entities = normalized.entities.map((entity: any) => {
          // If it's an object with an entity property, extract the entity ID
          if (typeof entity === 'object' && entity?.entity) {
            return entity.entity;
          }
          // If it's already a string, keep it
          return entity;
        }).filter(e => typeof e === 'string'); // Remove any non-strings
      }
      // Case 2: Object (complex cards like power-flow-card-plus)
      // Don't try to normalize - leave as-is for YAML editor
      else if (typeof normalized.entities === 'object') {
        // Keep the complex object structure intact
        // The form won't show EntityMultiSelect for these
      }
    }

    return normalized;
  };

  // Check if stream component is enabled when component mounts
  useEffect(() => {
    const checkStreamComponent = async () => {
      if (haConnectionService.isConnected()) {
        const isEnabled = await haConnectionService.isStreamComponentEnabled();
        setStreamComponentEnabled(isEnabled);
      } else {
        setStreamComponentEnabled(null);
      }
    };

    checkStreamComponent();
  }, []);

  // Reset form when card changes
  useEffect(() => {
    if (card) {
      form.setFieldsValue(normalizeCardForForm(card));
      setHasChanges(false);
    }
  }, [card, cardIndex, form]);

  const handleValuesChange = () => {
    setHasChanges(true);
  };

  const handleSave = () => {
    const values = form.getFieldsValue();
    const updatedCard = { ...card, ...values };
    onSave(updatedCard as Card);
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (card) {
      form.setFieldsValue(normalizeCardForForm(card));
      setHasChanges(false);
    }
    onCancel();
  };

  if (!card) {
    return (
      <div style={{ padding: '16px', color: 'white', height: '100%' }}>
        <Title level={4} style={{ color: 'white', marginTop: 0 }}>
          Properties
        </Title>
        <Text style={{ color: '#888' }}>
          Select a card to edit its properties
        </Text>
      </div>
    );
  }

  const cardMetadata = cardRegistry.get(card.type);
  const cardName = cardMetadata?.name || card.type;

  return (
    <div style={{ padding: '16px', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Title level={4} style={{ color: 'white', marginTop: 0 }}>
        Properties
      </Title>

      <div style={{ marginBottom: '16px' }}>
        <Text strong style={{ color: '#00d9ff' }}>
          {cardName}
        </Text>
        <br />
        <Text style={{ color: '#888', fontSize: '12px' }}>
          {card.type}
        </Text>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: '#434343' }} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          {/* Common Properties */}
          {(card.type === 'entities' || card.type === 'glance') && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Card title" />
              </Form.Item>

              {/* Only show EntityMultiSelect if entities is an array */}
              {Array.isArray(card.entities) && (
                <Form.Item
                  label={<span style={{ color: 'white' }}>Entities</span>}
                  name="entities"
                  help={<span style={{ color: '#666' }}>Select entities from your Home Assistant instance</span>}
                >
                  <EntityMultiSelect placeholder="Select entities" />
                </Form.Item>
              )}

              {/* Show warning if entities is complex object */}
              {card.entities && typeof card.entities === 'object' && !Array.isArray(card.entities) && (
                <Alert
                  message="Complex Entity Configuration"
                  description="This card uses a complex entity structure. Use the YAML editor to modify entities."
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}
            </>
          )}

          {card.type === 'button' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select entity" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input placeholder="Button name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:lightbulb" />
              </Form.Item>
            </>
          )}

          {card.type === 'markdown' && (
            <Form.Item
              label={<span style={{ color: 'white' }}>Content</span>}
              name="content"
            >
              <Input.TextArea
                placeholder="# Markdown content&#10;&#10;Your text here..."
                rows={8}
              />
            </Form.Item>
          )}

          {(card.type === 'sensor' || card.type === 'gauge') && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select sensor" filterDomains={['sensor', 'binary_sensor']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:thermometer" />
              </Form.Item>

              {card.type === 'gauge' && (
                <>
                  <Form.Item
                    label={<span style={{ color: 'white' }}>Min</span>}
                    name="min"
                  >
                    <Input type="number" placeholder="0" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'white' }}>Max</span>}
                    name="max"
                  >
                    <Input type="number" placeholder="100" />
                  </Form.Item>
                </>
              )}
            </>
          )}

          {card.type === 'history-graph' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="History" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>Select entities to show history for</span>}
              >
                <EntityMultiSelect placeholder="Select entities" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Hours to Show</span>}
                name="hours_to_show"
              >
                <Input type="number" placeholder="24" />
              </Form.Item>
            </>
          )}

          {(card.type === 'picture' || card.type === 'picture-entity') && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Image URL</span>}
                name="image"
                rules={[{ required: true, message: 'Image URL is required' }]}
              >
                <Input placeholder="/local/images/dashboard.png" />
              </Form.Item>

              {card.type === 'picture-entity' && (
                <>
                  <Form.Item
                    label={<span style={{ color: 'white' }}>Entity</span>}
                    name="entity"
                    rules={[{ required: true, message: 'Entity is required' }]}
                  >
                    <EntitySelect placeholder="Select entity" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'white' }}>Camera Image</span>}
                    name="camera_image"
                    help={<span style={{ color: '#666' }}>Optional: Select a camera entity for live streaming</span>}
                  >
                    <EntitySelect placeholder="Select camera entity" filterDomains={['camera']} />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'white' }}>Camera View</span>}
                    name="camera_view"
                    help={<span style={{ color: '#666' }}>Choose between snapshot or live stream (requires camera_image)</span>}
                  >
                    <Select
                      placeholder="Select view mode"
                      options={[
                        { value: 'auto', label: 'Auto (Snapshot)' },
                        { value: 'live', label: 'Live (Stream)' },
                      ]}
                    />
                  </Form.Item>

                  {/* Stream component warning */}
                  {streamComponentEnabled === false && (
                    <Alert
                      message="Stream Component Not Enabled"
                      description={
                        <span style={{ fontSize: '12px' }}>
                          The <code>stream:</code> component is not enabled in your Home Assistant configuration.
                          Live camera streaming requires this component. Add <code>stream:</code> to your
                          configuration.yaml and restart Home Assistant to enable live streaming.
                        </span>
                      }
                      type="warning"
                      showIcon
                      style={{ marginBottom: '16px' }}
                    />
                  )}

                  {streamComponentEnabled === true && (
                    <Alert
                      message="Stream Component Enabled"
                      description="Live camera streaming is supported on your Home Assistant instance."
                      type="success"
                      showIcon
                      style={{ marginBottom: '16px' }}
                    />
                  )}

                  <Form.Item
                    label={<span style={{ color: 'white' }}>Name</span>}
                    name="name"
                  >
                    <Input placeholder="Display name" />
                  </Form.Item>
                </>
              )}
            </>
          )}

          {card.type === 'picture-glance' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Card title" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Image URL</span>}
                name="image"
                help={<span style={{ color: '#666' }}>Leave blank when using camera entity</span>}
              >
                <Input placeholder="/local/images/dashboard.png" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Camera Image</span>}
                name="camera_image"
                help={<span style={{ color: '#666' }}>Optional: Select a camera entity for live streaming</span>}
              >
                <EntitySelect placeholder="Select camera entity" filterDomains={['camera']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Camera View</span>}
                name="camera_view"
                help={<span style={{ color: '#666' }}>Choose between snapshot or live stream (requires camera_image)</span>}
              >
                <Select
                  placeholder="Select view mode"
                  options={[
                    { value: 'auto', label: 'Auto (Snapshot)' },
                    { value: 'live', label: 'Live (Stream)' },
                  ]}
                />
              </Form.Item>

              {/* Stream component warning */}
              {streamComponentEnabled === false && (
                <Alert
                  message="Stream Component Not Enabled"
                  description={
                    <span style={{ fontSize: '12px' }}>
                      The <code>stream:</code> component is not enabled in your Home Assistant configuration.
                      Live camera streaming requires this component. Add <code>stream:</code> to your
                      configuration.yaml and restart Home Assistant to enable live streaming.
                    </span>
                  }
                  type="warning"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              {streamComponentEnabled === true && (
                <Alert
                  message="Stream Component Enabled"
                  description="Live camera streaming is supported on your Home Assistant instance."
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>Select entities to display over image</span>}
              >
                <EntityMultiSelect placeholder="Select entities" />
              </Form.Item>
            </>
          )}

          {card.type === 'light' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select light" filterDomains={['light']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:lightbulb" />
              </Form.Item>
            </>
          )}

          {card.type === 'thermostat' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select climate entity" filterDomains={['climate']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input placeholder="Display name" />
              </Form.Item>
            </>
          )}

          {card.type === 'media-control' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select media player" filterDomains={['media_player']} />
              </Form.Item>
            </>
          )}

          {card.type === 'weather-forecast' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select weather entity" filterDomains={['weather']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input placeholder="Display name" />
              </Form.Item>
            </>
          )}

          {card.type === 'map' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Map" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>Select entities to track on map</span>}
              >
                <EntityMultiSelect
                  placeholder="Select entities"
                  filterDomains={['device_tracker', 'person', 'zone']}
                />
              </Form.Item>
            </>
          )}

          {/* Generic fallback for layout cards and other types */}
          {!['entities', 'glance', 'button', 'markdown', 'sensor', 'gauge', 'history-graph', 'picture', 'picture-entity', 'picture-glance', 'light', 'thermostat', 'media-control', 'weather-forecast', 'map'].includes(card.type) && (
            <div style={{ color: '#888', fontSize: '12px' }}>
              <Text style={{ color: '#888' }}>
                Property editor for {card.type} cards is not yet implemented.
              </Text>
              <br />
              <Text style={{ color: '#666' }}>
                {['horizontal-stack', 'vertical-stack', 'grid'].includes(card.type)
                  ? 'Layout cards contain other cards. Edit the YAML file directly to configure nested cards.'
                  : 'Edit the YAML file directly to modify this card.'}
              </Text>
            </div>
          )}
        </Form>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: '#434343' }} />

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={handleCancel} disabled={!hasChanges}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSave} disabled={!hasChanges}>
          Apply
        </Button>
      </Space>
    </div>
  );
};
