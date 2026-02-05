import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Alert, Space, Select, Checkbox, Divider, Popconfirm, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { haConnectionService } from '../services/haConnectionService';
import { logger } from '../services/logger';
import { HAConnectionStatus } from '../types/homeassistant';

interface ConnectionDialogProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (url: string, token: string) => void;
  renderInline?: boolean;
}

export const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  visible,
  onClose,
  onConnect,
  renderInline = false,
}) => {
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<HAConnectionStatus | null>(null);
  const [savedCredentials, setSavedCredentials] = useState<any[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [saveCredential, setSaveCredential] = useState(false);
  const [credentialName, setCredentialName] = useState('');

  // Load saved credentials when dialog opens
  useEffect(() => {
    if (visible) {
      loadSavedCredentials();
    }
  }, [visible]);

  const loadSavedCredentials = async () => {
    try {
      const result = await window.electronAPI.credentialsGetAll();
      if (result.success && result.credentials) {
        setSavedCredentials(result.credentials);

        // Try to load last used credential
        const lastUsedResult = await window.electronAPI.credentialsGetLastUsed();
        if (lastUsedResult.success && lastUsedResult.credential) {
          const { id, url, token } = lastUsedResult.credential;
          setSelectedCredentialId(id);
          form.setFieldsValue({ url, token });
        }
      }
    } catch (error) {
      logger.error('Failed to load saved credentials', error);
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
      logger.error('Validation failed', error);
    } finally {
      setTesting(false);
    }
  };

  const handleCredentialSelect = async (id: string) => {
    setSelectedCredentialId(id);
    try {
      const result = await window.electronAPI.credentialsGet(id);
      if (result.success && result.credential) {
        const { url, token, name } = result.credential;
        form.setFieldsValue({ url, token });
        setCredentialName(name);
        setTestResult(null); // Clear test result when switching credentials
      }
    } catch (error) {
      logger.error('Failed to load credential', error);
    }
  };

  const handleCredentialDelete = async (id: string) => {
    try {
      const result = await window.electronAPI.credentialsDelete(id);
      if (result.success) {
        // Reload credentials list
        await loadSavedCredentials();
        // Clear form if deleted credential was selected
        if (selectedCredentialId === id) {
          setSelectedCredentialId(null);
          form.resetFields();
        }
      }
    } catch (error) {
      logger.error('Failed to delete credential', error);
    }
  };

  const handleConnect = async () => {
    try {
      const values = await form.validateFields();

      // Save credential if checkbox is checked
      if (saveCredential && credentialName) {
        await window.electronAPI.credentialsSave(
          credentialName,
          values.url,
          values.token,
          selectedCredentialId || undefined
        );
      }

      // Also save to settings for backward compatibility
      await window.electronAPI.setHAConnection(values.url, values.token);

      // Set in service
      haConnectionService.setConfig({
        url: values.url,
        token: values.token,
      });

      onConnect(values.url, values.token);
      onClose?.();
    } catch (error) {
      logger.error('Failed to connect', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setTestResult(null);
    onClose();
  };

  const formContent = (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          url: 'http://192.168.50.102:8123',
          token: '',
        }}
      >
        {savedCredentials.length > 0 && (
          <>
            <Form.Item label="Saved Connections">
              <Select
                placeholder="Select a saved connection"
                value={selectedCredentialId}
                onChange={handleCredentialSelect}
                allowClear
                onClear={() => {
                  setSelectedCredentialId(null);
                  setCredentialName('');
                  form.resetFields();
                }}
                options={savedCredentials.map(cred => ({
                  value: cred.id,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div>{cred.name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{cred.url}</div>
                      </div>
                      <Popconfirm
                        title="Delete this connection?"
                        description="This action cannot be undone."
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleCredentialDelete(cred.id);
                        }}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Tooltip title="Delete this saved connection">
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  ),
                }))}
              />
            </Form.Item>
            <Divider style={{ margin: '16px 0' }}>Or enter new connection</Divider>
          </>
        )}

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

        <div style={{ marginBottom: '16px' }}>
          <Checkbox
            checked={saveCredential}
            onChange={(e) => setSaveCredential(e.target.checked)}
          >
            <Space>
              <SaveOutlined />
              Save this connection
            </Space>
          </Checkbox>
          {saveCredential && (
            <Input
              placeholder="Connection name (e.g., 'Home HA', 'Remote HA')"
              value={credentialName}
              onChange={(e) => setCredentialName(e.target.value)}
              style={{ marginTop: '8px' }}
            />
          )}
        </div>

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
    </>
  );

  if (renderInline) {
    return formContent;
  }

  return (
    <Modal
      title="Home Assistant Connection"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      {formContent}
    </Modal>
  );
};
