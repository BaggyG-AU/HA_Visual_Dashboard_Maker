import React, { useState, useRef, useEffect } from 'react';
import { Modal, Select, Radio, Checkbox, Button, Space, Alert, Tabs, Typography } from 'antd';
import { CodeOutlined, BgColorsOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';
import { themeService } from '../services/themeService';
import * as monaco from 'monaco-editor';

const { Text } = Typography;

interface ThemeSettingsDialogProps {
  visible: boolean;
  onClose: () => void;
  renderInline?: boolean;
}

/**
 * Theme Settings Dialog
 * Advanced theme configuration with YAML viewer
 */
export const ThemeSettingsDialog: React.FC<ThemeSettingsDialogProps> = ({
  visible,
  onClose,
  renderInline = false,
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
  const cssEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const jsonEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const cssContainerRef = useRef<HTMLDivElement | null>(null);
  const jsonContainerRef = useRef<HTMLDivElement | null>(null);

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

  // Create CSS Monaco editor when container is ready and CSS tab is active
  useEffect(() => {
    if (!cssContainerRef.current || activeTab !== 'css' || !visible) return;

    const editor = monaco.editor.create(cssContainerRef.current, {
      value: themeYaml,
      language: 'css',
      theme: 'vs-dark',
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 12,
      lineNumbers: 'on',
      wordWrap: 'on',
    });

    cssEditorRef.current = editor;

    return () => {
      editor.dispose();
      cssEditorRef.current = null;
    };
  }, [activeTab, visible, themeYaml]);

  // Create JSON Monaco editor when container is ready and JSON tab is active
  useEffect(() => {
    if (!jsonContainerRef.current || activeTab !== 'json' || !visible) return;

    const editor = monaco.editor.create(jsonContainerRef.current, {
      value: themeJson,
      language: 'json',
      theme: 'vs-dark',
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 12,
      lineNumbers: 'on',
      wordWrap: 'on',
    });

    jsonEditorRef.current = editor;

    return () => {
      editor.dispose();
      jsonEditorRef.current = null;
    };
  }, [activeTab, visible, themeJson]);

  const tabs = (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        {
          key: 'settings',
          label: (
            <Space>
              <BgColorsOutlined />
              Theme
            </Space>
          ),
          children: (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Active Theme</Text>
                <Select
                  data-testid="theme-settings-select"
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
                    data-testid="theme-settings-mode"
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
                    data-testid="theme-settings-sync"
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
              <div
                ref={cssContainerRef}
                data-testid="theme-settings-css"
                style={{
                  border: '1px solid #434343',
                  borderRadius: '4px',
                  height: '400px',
                  overflow: 'hidden',
                }}
              />
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
              <div
                ref={jsonContainerRef}
                data-testid="theme-settings-json"
                style={{
                  border: '1px solid #434343',
                  borderRadius: '4px',
                  height: '400px',
                  overflow: 'hidden',
                }}
              />
            </div>
          ),
        },
      ]}
    />
  );

  if (renderInline) {
    return (
      <div data-testid="theme-settings-inline">
        {tabs}
        <Space style={{ marginTop: 16 }}>
          <Button data-testid="theme-settings-apply" type="primary" onClick={handleApply}>
            Apply
          </Button>
          <Button data-testid="theme-settings-cancel" onClick={handleCancel}>
            Cancel
          </Button>
        </Space>
      </div>
    );
  }

  return (
    <Modal
      data-testid="theme-settings-modal"
      title={
        <Space>
          <BgColorsOutlined />
          <span>Theme Settings</span>
        </Space>
      }
      open={visible}
      destroyOnHidden
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" data-testid="theme-settings-cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="apply" data-testid="theme-settings-apply" type="primary" onClick={handleApply}>
          Apply
        </Button>,
      ]}
    >
      {tabs}
    </Modal>
  );
};
