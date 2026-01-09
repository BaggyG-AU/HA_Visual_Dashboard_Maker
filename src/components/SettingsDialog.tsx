import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Tabs, Space, Select, Button, Typography, Divider, Alert, Switch, message, Popconfirm, Slider, InputNumber } from 'antd';
import { BgColorsOutlined, LinkOutlined, ToolOutlined, BugOutlined, CopyOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { ThemeSettingsDialog } from './ThemeSettingsDialog';
import { ConnectionDialog } from './ConnectionDialog';
import { logger } from '../services/logger';
import { hasHapticSupport, previewHapticPattern, setHapticSettings } from '../services/hapticService';
import type { HapticPattern } from '../types/haptics';

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
  const [hapticsEnabled, setHapticsEnabled] = useState(false);
  const [hapticsIntensity, setHapticsIntensity] = useState(100);
  const [hapticsPattern, setHapticsPattern] = useState<HapticPattern>('medium');

  const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

  const loadSettings = async () => {
    try {
      const [{ level }, { verbose }, { enabled, intensity }] = await Promise.all([
        window.electronAPI.getLoggingLevel(),
        window.electronAPI.getVerboseUIDebug(),
        window.electronAPI.getHapticSettings(),
      ]);
      setLoggingLevel(level as LoggingLevel);
      setVerboseUI(verbose);
      logger.setLevel(level as LoggingLevel);
      setHapticsEnabled(enabled);
      setHapticsIntensity(intensity);
      setHapticSettings({ enabled, intensity });
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

  const handleHapticsEnabledChange = async (checked: boolean) => {
    setHapticsEnabled(checked);
    await window.electronAPI.setHapticSettings({ enabled: checked, intensity: hapticsIntensity });
    setHapticSettings({ enabled: checked });
  };

  const handleHapticsIntensityChange = async (value: number) => {
    const next = clamp(value);
    setHapticsIntensity(next);
    await window.electronAPI.setHapticSettings({ enabled: hapticsEnabled, intensity: next });
    setHapticSettings({ intensity: next });
  };

  const handleHapticsTest = () => {
    if (!hapticsEnabled) {
      message.info('Enable haptic feedback to test patterns');
      return;
    }
    if (!hasHapticSupport()) {
      message.warning('Haptic feedback not supported on this device');
      return;
    }
    previewHapticPattern(hapticsPattern);
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
                  <Space align="center">
                    <ToolOutlined />
                    <Text strong>Haptic Feedback</Text>
                  </Space>
                  <div style={{ marginTop: 8 }}>
                    <Switch
                      checked={hapticsEnabled}
                      onChange={handleHapticsEnabledChange}
                      data-testid="haptic-feedback-toggle"
                    />
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                    Disabled by default for accessibility. Enable to allow haptic feedback.
                  </Text>
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Intensity</Text>
                    <Space direction="vertical" style={{ width: '100%', marginTop: 8 }} size="small">
                      <Slider
                        min={0}
                        max={100}
                        value={hapticsIntensity}
                        onChange={(value) => handleHapticsIntensityChange(Number(value))}
                        disabled={!hapticsEnabled}
                        data-testid="haptic-feedback-intensity-slider"
                      />
                      <InputNumber
                        min={0}
                        max={100}
                        value={hapticsIntensity}
                        onChange={(value) => handleHapticsIntensityChange(Number(value))}
                        disabled={!hapticsEnabled}
                        style={{ width: '100%' }}
                        data-testid="haptic-feedback-intensity-input"
                      />
                    </Space>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Test Pattern</Text>
                    <Space style={{ marginTop: 8 }} wrap>
                      <Select
                        value={hapticsPattern}
                        onChange={(value) => setHapticsPattern(value as HapticPattern)}
                        style={{ width: 200 }}
                        options={[
                          { value: 'light', label: 'Light' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'heavy', label: 'Heavy' },
                          { value: 'double', label: 'Double' },
                          { value: 'success', label: 'Success' },
                          { value: 'error', label: 'Error' },
                        ]}
                        data-testid="haptic-feedback-pattern-select"
                        disabled={!hapticsEnabled}
                      />
                      <Button
                        onClick={handleHapticsTest}
                        disabled={!hapticsEnabled}
                        data-testid="haptic-feedback-test-button"
                      >
                        Test haptic
                      </Button>
                    </Space>
                  </div>
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
