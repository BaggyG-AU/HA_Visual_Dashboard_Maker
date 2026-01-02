import React, { useState, useEffect } from 'react';
import { Modal, Card, Row, Col, Empty, Spin, Alert, Badge, Button } from 'antd';
import { ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import {
  dashboardGeneratorService,
  DashboardCategory,
  Entity,
} from '../services/dashboardGeneratorService';

interface EntityTypeDashboardWizardProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (dashboardYaml: string, title: string) => void;
  isConnected: boolean;
}

export const EntityTypeDashboardWizard: React.FC<EntityTypeDashboardWizardProps> = ({
  visible,
  onClose,
  onGenerate,
  isConnected,
}) => {
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [availableCategories, setAvailableCategories] = useState<DashboardCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load entities when dialog opens
  useEffect(() => {
    if (visible) {
      loadEntities();
    } else {
      // Reset state when dialog closes
      setSelectedCategory(null);
      setError(null);
    }
  }, [visible]);

  const loadEntities = async () => {
    if (!isConnected) {
      setError('Not connected to Home Assistant. Please connect first.');
      setEntities([]);
      setAvailableCategories([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.getCachedEntities();
      if (result.success && result.entities) {
        const entityList = result.entities as Entity[];
        setEntities(entityList);

        const categories = dashboardGeneratorService.getAvailableCategories(entityList);
        setAvailableCategories(categories);

        if (categories.length === 0) {
          setError('No entity categories available. Make sure you have entities in your Home Assistant instance.');
        }
      } else {
        setError('Failed to load entities. Try refreshing the entity cache.');
        setEntities([]);
        setAvailableCategories([]);
      }
    } catch (err) {
      setError(`Failed to load entities: ${(err as Error).message}`);
      setEntities([]);
      setAvailableCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadEntities();
  };

  const handleGenerate = () => {
    if (!selectedCategory) return;

    try {
      const dashboardConfig = dashboardGeneratorService.generateDashboard(selectedCategory, entities);

      if (!dashboardConfig) {
        setError('Failed to generate dashboard. No entities found for this category.');
        return;
      }

      // Serialize to YAML (using yamlService indirectly through parent)
      import('../services/yamlService').then(({ yamlService }) => {
        const yamlContent = yamlService.serializeDashboard(dashboardConfig);
        onGenerate(yamlContent, dashboardConfig.title || 'Generated Dashboard');
        onClose();
      });
    } catch (err) {
      setError(`Failed to generate dashboard: ${(err as Error).message}`);
    }
  };

  const getCategoryEntityCount = (categoryId: string): number => {
    return dashboardGeneratorService.getCategoryEntityCount(categoryId, entities);
  };

  // Show offline error if not connected
  if (!isConnected && visible) {
    return (
      <Modal
        title="Create Dashboard from Entity Type"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
        width={700}
        data-testid="entity-type-wizard-modal"
      >
        <Alert
          message="Not Connected"
          description="You must be connected to Home Assistant to use this feature. Please connect and try again."
          type="error"
          showIcon
          data-testid="entity-type-wizard-offline-error"
        />
      </Modal>
    );
  }

  return (
    <Modal
      title="Create Dashboard from Entity Type"
      open={visible}
      onCancel={onClose}
      onOk={handleGenerate}
      okText={
        <>
          <CheckOutlined /> Create Dashboard
        </>
      }
      okButtonProps={{ disabled: !selectedCategory }}
      cancelText="Cancel"
      width={900}
      data-testid="entity-type-wizard-modal"
    >
      <div style={{ marginBottom: 16 }}>
        <p>
          Select an entity category to automatically generate a dashboard pre-configured with relevant cards
          for that category.
        </p>
        {!isConnected && (
          <Alert
            message="Offline Mode"
            description="Connect to Home Assistant to access this feature."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
            data-testid="entity-type-wizard-warning"
          />
        )}
      </div>

      {error && (
        <Alert
          message="Error"
          description={
            <div>
              {error}
              <div style={{ marginTop: 8 }}>
                <Button size="small" icon={<ReloadOutlined />} onClick={handleRetry}>
                  Retry
                </Button>
              </div>
            </div>
          }
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
          data-testid="entity-type-wizard-error"
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#888' }}>Loading entity categories...</p>
        </div>
      ) : availableCategories.length === 0 && !error ? (
        <Empty
          description="No entity categories available"
          data-testid="entity-type-wizard-empty"
        >
          <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetry}>
            Refresh
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {availableCategories.map((category) => {
            const entityCount = getCategoryEntityCount(category.id);
            const isSelected = selectedCategory === category.id;

            return (
              <Col key={category.id} xs={24} sm={12} md={12}>
                <Card
                  hoverable
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    backgroundColor: isSelected ? '#e6f7ff' : 'white',
                    cursor: 'pointer',
                  }}
                  data-testid={`entity-category-card-${category.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ fontSize: 32 }}>{category.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                          {category.name}
                        </h3>
                        <Badge count={entityCount} showZero style={{ backgroundColor: '#52c41a' }} />
                      </div>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: 13 }}>
                        {category.description}
                      </p>
                      <p style={{ margin: 0, color: '#999', fontSize: 12, fontStyle: 'italic' }}>
                        {category.helpText}
                      </p>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {availableCategories.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <small style={{ color: '#666' }}>
            <strong>Note:</strong> Generated dashboards include up to 6 entities per category, sorted
            alphabetically. You can edit, add, or remove cards after creation.
          </small>
        </div>
      )}
    </Modal>
  );
};
