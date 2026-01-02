import React, { useState } from 'react';
import { Modal, Card, Row, Col, Tooltip } from 'antd';
import { FileAddOutlined, AppstoreAddOutlined, DatabaseOutlined } from '@ant-design/icons';
import { EntityTypeDashboardWizard } from './EntityTypeDashboardWizard';

interface NewDashboardDialogProps {
  visible: boolean;
  onClose: () => void;
  onCreateBlank: () => void;
  onCreateFromTemplate: () => void;
  onCreateFromEntityType: (dashboardYaml: string, title: string) => void;
  isConnected: boolean;
}

export const NewDashboardDialog: React.FC<NewDashboardDialogProps> = ({
  visible,
  onClose,
  onCreateBlank,
  onCreateFromTemplate,
  onCreateFromEntityType,
  isConnected,
}) => {
  const [showEntityTypeWizard, setShowEntityTypeWizard] = useState(false);

  const handleBlankClick = () => {
    onCreateBlank();
    onClose();
  };

  const handleTemplateClick = () => {
    onCreateFromTemplate();
    onClose();
  };

  const handleEntityTypeClick = () => {
    setShowEntityTypeWizard(true);
  };

  const handleEntityTypeGenerate = (dashboardYaml: string, title: string) => {
    onCreateFromEntityType(dashboardYaml, title);
    setShowEntityTypeWizard(false);
    onClose();
  };

  return (
    <>
      <Modal
        title="New Dashboard"
        open={visible && !showEntityTypeWizard}
        onCancel={onClose}
        footer={null}
        width={800}
        data-testid="new-dashboard-dialog"
        rootClassName="new-dashboard-dialog"
      >
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: '#666' }}>
            Choose how you want to create your dashboard:
          </p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Tooltip title="Start from scratch with an empty dashboard. Add cards manually from the palette.">
              <Card
                hoverable
                onClick={handleBlankClick}
                style={{ textAlign: 'center', height: '100%', cursor: 'pointer' }}
                data-testid="new-dashboard-blank-option"
              >
                <div style={{ padding: '20px 0' }}>
                  <FileAddOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>
                    Blank Dashboard
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
                    Start with an empty canvas
                  </p>
                </div>
              </Card>
            </Tooltip>
          </Col>

          <Col xs={24} md={8}>
            <Tooltip title="Use a pre-built template as a starting point. Templates include common layouts and card configurations.">
              <Card
                hoverable
                onClick={handleTemplateClick}
                style={{ textAlign: 'center', height: '100%', cursor: 'pointer' }}
                data-testid="new-dashboard-template-option"
              >
                <div style={{ padding: '20px 0' }}>
                  <AppstoreAddOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>
                    From Template
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
                    Use a pre-built layout
                  </p>
                </div>
              </Card>
            </Tooltip>
          </Col>

          <Col xs={24} md={8}>
            <Tooltip title={
              isConnected
                ? "Auto-generate a dashboard based on your entity types (lights, cameras, sensors, etc.). Requires connection to Home Assistant."
                : "Auto-generate a dashboard based on entity types. Connect to Home Assistant first."
            }>
              <Card
                hoverable={isConnected}
                onClick={isConnected ? handleEntityTypeClick : undefined}
                style={{
                  textAlign: 'center',
                  height: '100%',
                  cursor: isConnected ? 'pointer' : 'not-allowed',
                  opacity: isConnected ? 1 : 0.6,
                }}
                data-testid="new-dashboard-entity-type-option"
              >
                <div style={{ padding: '20px 0' }}>
                  <DatabaseOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>
                    From Entity Type
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
                    Auto-generate from entities
                  </p>
                  {!isConnected && (
                    <p style={{ margin: '8px 0 0 0', color: '#ff4d4f', fontSize: 12, fontWeight: 500 }}>
                      Requires HA connection
                    </p>
                  )}
                </div>
              </Card>
            </Tooltip>
          </Col>
        </Row>

        <div style={{ marginTop: 24, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <small style={{ color: '#666' }}>
            <strong>Tip:</strong> All dashboard types can be edited after creation. You can always add, remove,
            or modify cards using the card palette and properties panel.
          </small>
        </div>
      </Modal>

      <EntityTypeDashboardWizard
        visible={showEntityTypeWizard}
        onClose={() => setShowEntityTypeWizard(false)}
        onGenerate={handleEntityTypeGenerate}
        isConnected={isConnected}
      />
    </>
  );
};
