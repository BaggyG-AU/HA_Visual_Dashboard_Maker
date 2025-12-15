import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, Divider } from 'antd';
import { Card } from '../types/dashboard';
import { cardRegistry } from '../services/cardRegistry';

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

  // Reset form when card changes
  useEffect(() => {
    if (card) {
      form.setFieldsValue(card);
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
      form.setFieldsValue(card);
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

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>One entity per line</span>}
              >
                <Input.TextArea
                  placeholder="light.living_room&#10;sensor.temperature&#10;climate.thermostat"
                  rows={4}
                  onChange={(e) => {
                    // Convert text area to array
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    form.setFieldValue('entities', lines);
                  }}
                  value={
                    Array.isArray(form.getFieldValue('entities'))
                      ? form.getFieldValue('entities').join('\n')
                      : ''
                  }
                />
              </Form.Item>
            </>
          )}

          {card.type === 'button' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <Input placeholder="light.living_room" />
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
                <Input placeholder="mdi:lightbulb" />
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
                <Input placeholder="sensor.temperature" />
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
                <Input placeholder="mdi:thermometer" />
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
                help={<span style={{ color: '#666' }}>One entity per line</span>}
              >
                <Input.TextArea
                  placeholder="sensor.temperature&#10;sensor.humidity"
                  rows={4}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    form.setFieldValue('entities', lines);
                  }}
                  value={
                    Array.isArray(form.getFieldValue('entities'))
                      ? form.getFieldValue('entities').join('\n')
                      : ''
                  }
                />
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
                    <Input placeholder="light.living_room" />
                  </Form.Item>

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
                rules={[{ required: true, message: 'Image URL is required' }]}
              >
                <Input placeholder="/local/images/dashboard.png" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>One entity per line</span>}
              >
                <Input.TextArea
                  placeholder="light.living_room&#10;sensor.temperature"
                  rows={4}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    form.setFieldValue('entities', lines);
                  }}
                  value={
                    Array.isArray(form.getFieldValue('entities'))
                      ? form.getFieldValue('entities').join('\n')
                      : ''
                  }
                />
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
                <Input placeholder="light.living_room" />
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
                <Input placeholder="mdi:lightbulb" />
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
                <Input placeholder="climate.thermostat" />
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
                <Input placeholder="media_player.living_room" />
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
                <Input placeholder="weather.home" />
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
                help={<span style={{ color: '#666' }}>One entity per line (device_tracker, person, zone)</span>}
              >
                <Input.TextArea
                  placeholder="person.john&#10;device_tracker.phone"
                  rows={4}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    form.setFieldValue('entities', lines);
                  }}
                  value={
                    Array.isArray(form.getFieldValue('entities'))
                      ? form.getFieldValue('entities').join('\n')
                      : ''
                  }
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
