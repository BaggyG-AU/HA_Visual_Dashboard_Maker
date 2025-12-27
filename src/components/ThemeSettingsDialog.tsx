import React, { useState } from 'react';
import { Modal, Select, Radio, Checkbox, Button, Space, Alert, Tabs, Typography } from 'antd';
import { SettingOutlined, CodeOutlined, BgColorsOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';
import { themeService } from '../services/themeService';
import Editor from '@monaco-editor/react';

const { Text } = Typography;

interface ThemeSettingsDialogProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Theme Settings Dialog
 * Advanced theme configuration with YAML viewer
 */
export const ThemeSettingsDialog: React.FC<ThemeSettingsDialogProps> = ({
  visible,
  onClose,
}) => {
  const {
    currentThemeName,
    currentTheme,
    availableThemes,
    darkMode,
    syncWithHA,
    setTheme,
    toggleDarkMode,
    setSyncWithHA,
  } = useThemeStore();

  const [localThemeName, setLocalThemeName] = useState<string | null>(currentThemeName);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const [localSyncWithHA, setLocalSyncWithHA] = useState(syncWithHA);
  const [activeTab, setActiveTab] = useState('settings');

  // Reset local state when dialog opens
  React.useEffect(() => {
    if (visible) {
      setLocalThemeName(currentThemeName);
      setLocalDarkMode(darkMode);
      setLocalSyncWithHA(syncWithHA);
      setActiveTab('settings');
    }
  }, [visible, currentThemeName, darkMode, syncWithHA]);

  const handleApply = () => {
    if (localThemeName && localThemeName !== currentThemeName) {
      setTheme(localThemeName);
    }

    if (localDarkMode !== darkMode) {
      toggleDarkMode();
    }

    if (localSyncWithHA !== syncWithHA) {
      setSyncWithHA(localSyncWithHA);
    }

    onClose();
  };

  const handleCancel = () => {
    // Reset to current values
    setLocalThemeName(currentThemeName);
    setLocalDarkMode(darkMode);
    setLocalSyncWithHA(syncWithHA);
    onClose();
  };

  const themeOptions = Object.keys(availableThemes).map(name => ({
    label: name,
    value: name,
  }));

  // Generate YAML from current theme
  const themeYaml = currentTheme
    ? themeService.generateThemeCSS(currentTheme, localDarkMode)
    : '';

  // Generate JSON representation of theme
  const themeJson = currentTheme
    ? JSON.stringify(currentTheme, null, 2)
    : '';

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>Theme Settings</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="apply" type="primary" onClick={handleApply}>
          Apply
        </Button>,
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'settings',
            label: (
              <Space>
                <BgColorsOutlined />
                Settings
              </Space>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>Active Theme</Text>
                  <Select
                    value={localThemeName}
                    onChange={setLocalThemeName}
                    options={themeOptions}
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select theme"
                    disabled={Object.keys(availableThemes).length === 0}
                  />
                </div>

                <div>
                  <Text strong>Mode</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Radio.Group
                      value={localDarkMode ? 'dark' : 'light'}
                      onChange={(e) => setLocalDarkMode(e.target.value === 'dark')}
                    >
                      <Radio value="light">Light</Radio>
                      <Radio value="dark">Dark</Radio>
                    </Radio.Group>
                  </div>
                </div>

                <div>
                  <Text strong>Options</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Checkbox
                      checked={localSyncWithHA}
                      onChange={(e) => setLocalSyncWithHA(e.target.checked)}
                    >
                      Sync with Home Assistant theme
                    </Checkbox>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    When enabled, the app will automatically use the theme currently active in Home Assistant
                  </Text>
                </div>

                <Alert
                  message="Theme Preview"
                  description="Themes are applied to the dashboard canvas. Changes will be visible immediately when you click Apply."
                  type="info"
                  showIcon
                />
              </Space>
            ),
          },
          {
            key: 'css',
            label: (
              <Space>
                <CodeOutlined />
                CSS Variables
              </Space>
            ),
            children: (
              <div>
                <Alert
                  message="CSS Variables Preview"
                  description="These CSS custom properties are applied to the canvas container. Card renderers inherit these values."
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
                <div style={{ border: '1px solid #434343', borderRadius: '4px' }}>
                  <Editor
                    height="400px"
                    language="css"
                    theme="vs-dark"
                    value={themeYaml}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: 'json',
            label: (
              <Space>
                <CodeOutlined />
                Theme JSON
              </Space>
            ),
            children: (
              <div>
                <Alert
                  message="Theme Structure"
                  description="Raw theme data as received from Home Assistant. Includes base variables and mode-specific overrides."
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
                <div style={{ border: '1px solid #434343', borderRadius: '4px' }}>
                  <Editor
                    height="400px"
                    language="json"
                    theme="vs-dark"
                    value={themeJson}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};
