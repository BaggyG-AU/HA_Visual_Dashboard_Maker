import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert, Steps, Typography, Radio } from 'antd';
import { CloudUploadOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { haConnectionService } from '../services/haConnectionService';
import { yamlService } from '../services/yamlService';
import { logger } from '../services/logger';

const { Text } = Typography;
const { Step } = Steps;

interface DeployDialogProps {
  visible: boolean;
  onClose: () => void;
  dashboardYaml: string;
  dashboardTitle?: string;
}

interface DeployStatus {
  step: number;  // 0: config, 1: validate YAML, 2: validate connection, 3: deploy, 4: complete/error
  message: string;
  error?: string;
  success: boolean;
}

/**
 * Dialog for deploying dashboard to Home Assistant
 * Features:
 * - Deploy to existing dashboard (update)
 * - Create new dashboard
 * - Validation before deployment
 * - Step-by-step deployment progress
 */
export const DeployDialog: React.FC<DeployDialogProps> = ({
  visible,
  onClose,
  dashboardYaml,
  dashboardTitle,
}) => {
  const [form] = Form.useForm();
  const [deployStatus, setDeployStatus] = useState<DeployStatus>({
    step: 0,
    message: '',
    success: false,
  });
  const [deploying, setDeploying] = useState(false);
  const [deployMode, setDeployMode] = useState<'new' | 'update'>('new');

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (visible) {
      setDeployStatus({ step: 0, message: '', success: false });
      setDeploying(false);
      form.resetFields();
    }
  }, [visible, form]);

  const handleDeploy = async () => {
    try {
      // Validate form
      const values = await form.validateFields();
      setDeploying(true);

      // Step 1: Validate dashboard configuration FIRST (before any network calls)
      setDeployStatus({
        step: 1,
        message: 'Validating dashboard configuration...',
        success: false,
      });

      // Parse and validate YAML from editor
      const parseResult = yamlService.parseDashboard(dashboardYaml);
      if (!parseResult.success) {
        throw new Error(`Invalid dashboard YAML: ${parseResult.error || 'Unknown error'}`);
      }

      const dashboardConfig = parseResult.data;

      logger.debug('Preparing deploy dashboard config', {
        titleFromForm: values.title,
        titleInConfig: dashboardConfig?.title,
      });

      // Strict validation: ensure views array exists and is not empty
      if (!dashboardConfig?.views || dashboardConfig.views.length === 0) {
        throw new Error('Dashboard must contain at least one view. Your dashboard appears to be empty.');
      }

      // Validate each view has required properties
      for (let i = 0; i < dashboardConfig.views.length; i++) {
        const view = dashboardConfig.views[i];
        if (!view.title) {
          throw new Error(`View ${i + 1} is missing a required "title" property.`);
        }
        if (!view.cards || !Array.isArray(view.cards)) {
          throw new Error(`View "${view.title}" must have a "cards" array (can be empty).`);
        }
      }

      // Wait a bit for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Validate connection
      setDeployStatus({
        step: 2,
        message: 'Validating connection to Home Assistant...',
        success: false,
      });

      if (!haConnectionService.isConnected()) {
        throw new Error('Not connected to Home Assistant. Please connect first.');
      }

      const config = haConnectionService.getConfig();
      if (!config) {
        throw new Error('No connection configuration found.');
      }

      // Wait a bit for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Deploy dashboard via Home Assistant WebSocket API
      setDeployStatus({
        step: 3,
        message: deployMode === 'new'
          ? 'Creating new dashboard...'
          : 'Updating existing dashboard...',
        success: false,
      });

      const dashboardPath = values.urlKey;

      // Ensure WebSocket connected
      const wsConnect = await window.electronAPI.haWsConnect(config.url, config.token);
      if (!wsConnect.success) {
        throw new Error(wsConnect.error || 'Failed to connect to Home Assistant WebSocket');
      }

      if (deployMode === 'new') {
        const createResult = await window.electronAPI.haWsCreateDashboard(dashboardPath, values.title, values.icon);
        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create dashboard');
        }
      }

      // Update the dashboard config with the user's chosen title from the form
      // (The config might have a different title from editing)
      const deployConfig = {
        ...dashboardConfig,
        title: values.title  // Use the title from the deployment form
      };

      logger.debug('Final deploy config prepared', { title: deployConfig.title, viewCount: deployConfig.views?.length ?? 0 });

      const saveResult = await window.electronAPI.haWsSaveDashboardConfig(dashboardPath, deployConfig);
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save dashboard configuration');
      }

      // Wait a bit for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Complete
      setDeployStatus({
        step: 4,
        message: deployMode === 'new'
          ? `Dashboard "${values.title}" created successfully!`
          : `Dashboard "${values.title}" updated successfully!`,
        success: true,
      });

    } catch (error) {
      setDeployStatus({
        step: 4,
        message: 'Deployment failed',
        error: (error as Error).message,
        success: false,
      });
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      onClose();
    }
  };

  const renderStepContent = () => {
    if (deployStatus.step === 0) {
      // Configuration step
      return (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: dashboardTitle || 'New Dashboard',
            urlKey: 'new-dashboard',
            icon: 'mdi:view-dashboard',
          }}
        >
          <Form.Item label="Deploy Mode">
            <Radio.Group value={deployMode} onChange={(e) => setDeployMode(e.target.value)}>
              <Radio value="new">Create New Dashboard</Radio>
              <Radio value="update">Update Existing Dashboard</Radio>
            </Radio.Group>
          </Form.Item>

          <Alert
            message={
              deployMode === 'new'
                ? 'Create a new dashboard in Home Assistant'
                : 'Update an existing dashboard (will overwrite current configuration)'
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Form.Item
            label="Dashboard Title"
            name="title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input placeholder="My Dashboard" />
          </Form.Item>

          <Form.Item
            label="URL Key"
            name="urlKey"
            rules={[
              { required: true, message: 'URL key is required' },
              {
                pattern: /^[a-z0-9-_]+$/,
                message: 'Only lowercase letters, numbers, hyphens, and underscores allowed',
              },
            ]}
            help="This will be part of the dashboard URL (e.g., lovelace/your-key). Home Assistant requires at least one hyphen."
          >
            <Input placeholder="my-dashboard" />
          </Form.Item>

          <Form.Item
            label="Icon"
            name="icon"
            help="Material Design Icon (e.g., mdi:home, mdi:view-dashboard)"
          >
            <Input placeholder="mdi:view-dashboard" />
          </Form.Item>

          {deployMode === 'update' && (
            <Alert
              message="Warning"
              description="Updating will completely replace the existing dashboard configuration. This action cannot be undone."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
            />
          )}
        </Form>
      );
    }

    if (deployStatus.step > 0) {
      // Deployment progress
      return (
        <div>
          <Steps current={deployStatus.step - 1} style={{ marginBottom: '24px' }}>
            <Step title="Validate YAML" description="Checking dashboard config" />
            <Step title="Connection" description="Verifying HA connection" />
            <Step title="Deploy" description="Uploading dashboard" />
            <Step title="Complete" description="Finishing up" />
          </Steps>

          <div style={{
            padding: '16px',
            background: '#1f1f1f',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <Text style={{ color: '#fff' }}>{deployStatus.message}</Text>
          </div>

          {deployStatus.step === 4 && (
            <>
              {deployStatus.success ? (
                <Alert
                  message="Deployment Successful"
                  description={
                    <div>
                      <Text>Your dashboard has been deployed to Home Assistant.</Text>
                      <br />
                      <Text style={{ fontSize: '12px', color: '#888' }}>
                        You can access it from the Home Assistant sidebar.
                      </Text>
                    </div>
                  }
                  type="success"
                  icon={<CheckCircleOutlined />}
                  showIcon
                />
              ) : (
                <Alert
                  message="Deployment Failed"
                  description={
                    <div>
                      <Text>{deployStatus.error}</Text>
                      <br />
                      <Text style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        Please check your connection and try again.
                      </Text>
                    </div>
                  }
                  type="error"
                  icon={<CloseCircleOutlined />}
                  showIcon
                />
              )}
            </>
          )}
        </div>
      );
    }

    return null;
  };

  const renderFooter = () => {
    if (deployStatus.step === 4) {
      // Complete step - only show close button
      return [
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
      ];
    }

    if (deployStatus.step > 0) {
      // Deploying - no buttons (or cancel if you want to add that)
      return null;
    }

    // Configuration step
    return [
      <Button key="cancel" onClick={handleClose} disabled={deploying}>
        Cancel
      </Button>,
      <Button
        key="deploy"
        type="primary"
        icon={<CloudUploadOutlined />}
        onClick={handleDeploy}
        loading={deploying}
      >
        Deploy
      </Button>,
    ];
  };

  // Show warning if not connected
  if (visible && !haConnectionService.isConnected()) {
    return (
      <Modal
        title="Deploy to Home Assistant"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <Alert
          message="Not Connected"
          description="You must be connected to Home Assistant to deploy dashboards. Please connect first."
          type="warning"
          icon={<WarningOutlined />}
          showIcon
        />
      </Modal>
    );
  }

  return (
    <Modal
      title="Deploy to Home Assistant"
      open={visible}
      onCancel={handleClose}
      footer={renderFooter()}
      width={600}
      closable={!deploying}
      maskClosable={!deploying}
    >
      {renderStepContent()}

      {deployStatus.step === 0 && (
        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: '#1f1f1f',
          border: '1px solid #434343',
          borderRadius: '4px'
        }}>
          <Text style={{ color: '#888', fontSize: '12px' }}>
            <strong style={{ color: '#fff' }}>Note:</strong> This will deploy the dashboard configuration directly to your Home Assistant instance.
            Make sure to test your dashboard before deploying to production.
          </Text>
        </div>
      )}
    </Modal>
  );
};
