import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Tabs, Space, Select, Button, Typography, Divider, Alert, Switch, message, Popconfirm } from 'antd';
import { BgColorsOutlined, LinkOutlined, ToolOutlined, BugOutlined, CopyOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { ThemeSettingsDialog } from './ThemeSettingsDialog';
import { ConnectionDialog } from './ConnectionDialog';
import { logger } from '../services/logger';

const { Text } = Typography;

type LoggingLevel = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface SettingsDialogProps {
  visible: boolean;
  onClose: () => void;
  onVerboseChange?: (enabled: boolean) => void;
  activeTab?: 'appearance' | 'connection' | 'diagnostics';
  onTabChange?: (key: 'appearance' | 'connection' | 'diagnostics') => void;
  onConnect?: (url: string, token: string) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ visible, onClose, onVerboseChange, activeTab = 'appearance', onTabChange, onConnect }) => {
  const [loggingLevel, setLoggingLevel] = useState<LoggingLevel>('info');
  const [loadingLevel, setLoadingLevel] = useState(false);
  const [copying, setCopying] = useState(false);
  const [verboseUI, setVerboseUI] = useState(false);

  const loadSettings = async () => {
    try {
      const [{ level }, { verbose }] = await Promise.all([
        window.electronAPI.getLoggingLevel(),
        window.electronAPI.getVerboseUIDebug(),
      ]);
      setLoggingLevel(level as LoggingLevel);
      setVerboseUI(verbose);
      logger.setLevel(level as LoggingLevel);
    } catch (error) {
      console.error('Failed to load logging settings', error);
    }
  };

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loggingOptions = useMemo(
    () => [
      { label: 'Off', value: 'off' },
      { label: 'Error', value: 'error' },
      { label: 'Warn', value: 'warn' },
      { label: 'Info', value: 'info' },
      { label: 'Debug', value: 'debug' },
      { label: 'Trace', value: 'trace' },
    ],
    []
  );

  const handleLoggingChange = async (value: LoggingLevel) => {
    setLoadingLevel(true);
    try {
      await window.electronAPI.setLoggingLevel(value);
      setLoggingLevel(value);
      logger.setLevel(value);
      message.success(`Logging level set to ${value.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to set logging level', error);
      message.error('Failed to update logging level');
    } finally {
      setLoadingLevel(false);
    }
  };

  const handleCopyDiagnostics = async () => {
    setCopying(true);
    try {
      const versionResult = await window.electronAPI.getAppVersion();
      const haConnection = await window.electronAPI.getHAConnection();
      const diag = [
        `App Version: ${versionResult.version}`,
        `Platform: ${navigator.userAgent}`,
        `Logging Level: ${loggingLevel.toUpperCase()}`,
        `HA Connected: ${haConnection?.url ? 'Yes' : 'No'}`,
      ].join('\n');

      await navigator.clipboard.writeText(diag);
      message.success('Diagnostics copied (tokens redacted)');
    } catch (error) {
      console.error('Failed to copy diagnostics', error);
      message.error('Failed to copy diagnostics');
    } finally {
      setCopying(false);
    }
  };

  const handleVerboseToggle = async (checked: boolean) => {
    setVerboseUI(checked);
    await window.electronAPI.setVerboseUIDebug(checked);
    onVerboseChange?.(checked);
  };

  const handleClearEntityCache = async () => {
    await window.electronAPI.clearCachedEntities();
    message.success('Entity cache cleared');
  };

  const handleResetUI = async () => {
    await window.electronAPI.resetUIState();
    message.success('UI state reset');
  };

  return (
    <Modal
      title="Settings"
      open={visible}
      onCancel={onClose}
      destroyOnHidden
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={900}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => onTabChange?.(key as 'appearance' | 'connection' | 'diagnostics')}
        items={[
          {
            key: 'appearance',
            label: (
              <Space>
                <BgColorsOutlined />
                Appearance
              </Space>
            ),
            children: <ThemeSettingsDialog visible={visible} onClose={() => undefined} renderInline />,
          },
          {
            key: 'connection',
            label: (
              <Space>
                <LinkOutlined />
                Connection
              </Space>
            ),
            children: (
              <ConnectionDialog
                visible={visible}
                onClose={() => undefined}
                onConnect={(url, token) => onConnect?.(url, token)}
                renderInline
              />
            ),
          },
          {
            key: 'diagnostics',
            label: (
              <Space>
                <ToolOutlined />
                Diagnostics
              </Space>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>Logging Level</Text>
                  <Select
                    aria-label="Logging level"
                    data-testid="logging-level-select"
                    style={{ width: 240, marginTop: 8 }}
                    value={loggingLevel}
                    options={loggingOptions}
                    onChange={(value) => handleLoggingChange(value as LoggingLevel)}
                    loading={loadingLevel}
                  />
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                    Default: DEBUG (dev) / INFO (packaged)
                  </Text>
                </div>

                <div>
                  <Text strong>Copy Diagnostics</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button icon={<CopyOutlined />} onClick={handleCopyDiagnostics} loading={copying}>
                      Copy diagnostic info
                    </Button>
                  </div>
                </div>

                <Divider />

                <div>
                  <Space align="center">
                    <BugOutlined />
                    <Text strong>Verbose UI debug overlay</Text>
                  </Space>
                  <div style={{ marginTop: 8 }}>
                    <Switch checked={verboseUI} onChange={handleVerboseToggle} />
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                    Shows a minimal overlay for UI debugging. Safe to disable anytime.
                  </Text>
                </div>

                <Divider />

                <div>
                  <Text strong>Maintenance</Text>
                  <Space style={{ marginTop: 8 }} wrap>
                    <Popconfirm
                      title="Clear cached entities?"
                      description="This will remove cached entity data."
                      okText="Clear"
                      cancelText="Cancel"
                      onConfirm={handleClearEntityCache}
                      okButtonProps={{ danger: true }}
                    >
                      <Button icon={<DeleteOutlined />} danger>
                        Clear entity cache
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="Reset UI state?"
                      description="This resets window/layout/theme preferences."
                      okText="Reset"
                      cancelText="Cancel"
                      onConfirm={handleResetUI}
                    >
                      <Button icon={<ReloadOutlined />}>Reset UI state</Button>
                    </Popconfirm>
                  </Space>
                </div>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
};
