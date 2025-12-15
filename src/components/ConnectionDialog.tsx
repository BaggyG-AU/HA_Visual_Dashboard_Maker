import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Alert, Space, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { haConnectionService } from '../services/haConnectionService';
import { HAConnectionStatus } from '../types/homeassistant';

interface ConnectionDialogProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (url: string, token: string) => void;
}

export const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  visible,
  onClose,
  onConnect,
}) => {
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<HAConnectionStatus | null>(null);

  // Load saved connection when dialog opens
  useEffect(() => {
    if (visible) {
      loadSavedConnection();
    }
  }, [visible]);

  const loadSavedConnection = async () => {
    try {
      const saved = await window.electronAPI.getHAConnection();
      if (saved.url) {
        form.setFieldsValue({
          url: saved.url,
          token: saved.token || '',
        });
      }
    } catch (error) {
      console.error('Failed to load saved connection:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields();
      setTesting(true);
      setTestResult(null);

      const result = await haConnectionService.testConnection(values.url, values.token);
      setTestResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    try {
      const values = await form.validateFields();

      // Save connection settings
      await window.electronAPI.setHAConnection(values.url, values.token);

      // Set in service
      haConnectionService.setConfig({
        url: values.url,
        token: values.token,
      });

      onConnect(values.url, values.token);
      onClose();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setTestResult(null);
    onClose();
  };

  return (
    <Modal
      title="Home Assistant Connection"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          url: 'http://192.168.50.102:8123',
          token: '',
        }}
      >
        <Form.Item
          label="Home Assistant URL"
          name="url"
          rules={[
            { required: true, message: 'Please enter Home Assistant URL' },
            {
              pattern: /^(https?:\/\/)?.+/,
              message: 'Please enter a valid URL',
            },
          ]}
          help="Example: http://192.168.1.100:8123 or https://homeassistant.local:8123"
        >
          <Input placeholder="http://homeassistant.local:8123" />
        </Form.Item>

        <Form.Item
          label="Long-Lived Access Token"
          name="token"
          rules={[
            { required: true, message: 'Please enter access token' },
            { min: 20, message: 'Token seems too short' },
          ]}
          help={
            <span>
              Create a token in Home Assistant: Profile → Long-Lived Access Tokens
            </span>
          }
        >
          <Input.Password placeholder="Enter your long-lived access token" />
        </Form.Item>

        {testResult && (
          <Alert
            message={
              testResult.connected ? 'Connection Successful' : 'Connection Failed'
            }
            description={
              testResult.connected ? (
                <div>
                  <div>✓ Connected to Home Assistant</div>
                  {testResult.version && <div>✓ Version: {testResult.version}</div>}
                  <div>✓ URL: {testResult.url}</div>
                </div>
              ) : (
                <div>
                  <div>✗ Failed to connect</div>
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    {testResult.error}
                  </div>
                </div>
              )
            }
            type={testResult.connected ? 'success' : 'error'}
            icon={
              testResult.connected ? (
                <CheckCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )
            }
            style={{ marginBottom: '16px' }}
          />
        )}

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleTestConnection} loading={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            type="primary"
            onClick={handleConnect}
            disabled={!testResult?.connected}
          >
            Connect
          </Button>
        </Space>
      </Form>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#1f1f1f',
        border: '1px solid #434343',
        borderRadius: '4px'
      }}>
        <h4 style={{ marginTop: 0, color: '#fff' }}>How to get a Long-Lived Access Token:</h4>
        <ol style={{ paddingLeft: '20px', margin: 0, color: '#ccc' }}>
          <li>Open your Home Assistant web interface</li>
          <li>Click on your username in the bottom left corner</li>
          <li>Scroll down to "Long-Lived Access Tokens"</li>
          <li>Click "Create Token"</li>
          <li>Give it a name (e.g., "Dashboard Maker")</li>
          <li>Copy the token and paste it above</li>
        </ol>
      </div>
    </Modal>
  );
};
