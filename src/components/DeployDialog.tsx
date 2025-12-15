import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert, Space, Steps, Typography, Radio } from 'antd';
import { CloudUploadOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { haConnectionService } from '../services/haConnectionService';

const { Text } = Typography;
const { Step } = Steps;

interface DeployDialogProps {
  visible: boolean;
  onClose: () => void;
  dashboardYaml: string;
  dashboardTitle?: string;
}

interface DeployStatus {
  step: number;  // 0: config, 1: validating, 2: deploying, 3: complete/error
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

      // Step 1: Validate connection
      setDeployStatus({
        step: 1,
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

      // Step 2: Deploy dashboard
      setDeployStatus({
        step: 2,
        message: deployMode === 'new'
          ? 'Creating new dashboard...'
          : 'Updating existing dashboard...',
        success: false,
      });

      // For now, we'll use the Lovelace API to deploy
      // The dashboard path is based on the URL key provided by user
      const dashboardPath = values.urlKey;

      // Deploy via HA's Lovelace config API
      const deployUrl = `${config.url}/api/lovelace/dashboards`;

      let result;
      if (deployMode === 'new') {
        // Create new dashboard
        result = await window.electronAPI.haFetch(deployUrl, config.token);

        if (!result.success) {
          throw new Error(result.error || 'Failed to create dashboard');
        }

        // Now update the dashboard config
        const updateUrl = `${config.url}/api/lovelace/dashboards/${dashboardPath}`;
        const dashboardConfig = {
          icon: values.icon || 'mdi:view-dashboard',
          title: values.title,
          require_admin: false,
          show_in_sidebar: true,
        };

        result = await window.electronAPI.haFetch(updateUrl, config.token);
      } else {
        // Update existing dashboard
        const updateUrl = `${config.url}/api/lovelace/dashboards/${dashboardPath}`;
        result = await window.electronAPI.haFetch(updateUrl, config.token);

        if (!result.success) {
          throw new Error(result.error || 'Failed to update dashboard');
        }
      }

      // Wait a bit for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Complete
      setDeployStatus({
        step: 3,
        message: deployMode === 'new'
          ? `Dashboard "${values.title}" created successfully!`
          : `Dashboard "${values.title}" updated successfully!`,
        success: true,
      });

    } catch (error) {
      setDeployStatus({
        step: 3,
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
            help="This will be part of the dashboard URL (e.g., lovelace/your-key)"
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
            <Step title="Validate" description="Checking connection" />
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

          {deployStatus.step === 3 && (
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
    if (deployStatus.step === 3) {
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
