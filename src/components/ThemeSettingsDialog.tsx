import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Select, Radio, Checkbox, Button, Space, Alert, Tabs, Typography, Input, message } from 'antd';
import { CodeOutlined, BgColorsOutlined, SaveOutlined, UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
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
 * Advanced theme configuration with YAML viewer and theme manager workflows
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
    savedThemes,
    viewOverrides,
    activeViewKey,
    setTheme,
    toggleDarkMode,
    setSyncWithHA,
    saveCurrentTheme,
    loadSavedTheme,
    deleteSavedTheme,
    exportThemeManager,
    importThemeManager,
    setViewOverride,
  } = useThemeStore();

  const [localThemeName, setLocalThemeName] = useState<string | null>(currentThemeName);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const [localSyncWithHA, setLocalSyncWithHA] = useState(syncWithHA);
  const [activeTab, setActiveTab] = useState('settings');
  const [savedThemeName, setSavedThemeName] = useState('');
  const [selectedSavedTheme, setSelectedSavedTheme] = useState<string | null>(null);
  const [importExportJson, setImportExportJson] = useState('');

  const cssEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const jsonEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const cssContainerRef = useRef<HTMLDivElement | null>(null);
  const jsonContainerRef = useRef<HTMLDivElement | null>(null);

  const wasVisibleRef = useRef(false);

  // Reset local state only when the dialog transitions from closed -> open.
  React.useEffect(() => {
    const opening = visible && !wasVisibleRef.current;

    if (opening) {
      setLocalThemeName(currentThemeName);
      setLocalDarkMode(darkMode);
      setLocalSyncWithHA(syncWithHA);
      setSavedThemeName(currentThemeName ?? '');
      setSelectedSavedTheme(null);
      setImportExportJson('');
      setActiveTab('settings');
    }

    wasVisibleRef.current = visible;
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

  const handleSaveTheme = useCallback(() => {
    const result = saveCurrentTheme(savedThemeName);
    if (!result.success) {
      message.error(result.error ?? 'Failed to save theme');
      return;
    }

    message.success(`Saved theme: ${savedThemeName.trim()}`);
    setSelectedSavedTheme(savedThemeName.trim());
  }, [saveCurrentTheme, savedThemeName]);

  const handleLoadSavedTheme = useCallback(() => {
    if (!selectedSavedTheme) {
      message.warning('Select a saved theme to load');
      return;
    }

    const result = loadSavedTheme(selectedSavedTheme);
    if (!result.success) {
      message.error(result.error ?? 'Failed to load saved theme');
      return;
    }

    setLocalThemeName(selectedSavedTheme);
    setLocalSyncWithHA(false);
    message.success(`Loaded saved theme: ${selectedSavedTheme}`);
  }, [loadSavedTheme, selectedSavedTheme]);

  const handleDeleteSavedTheme = useCallback(() => {
    if (!selectedSavedTheme) {
      message.warning('Select a saved theme to delete');
      return;
    }

    deleteSavedTheme(selectedSavedTheme);
    message.success(`Deleted saved theme: ${selectedSavedTheme}`);
    setSelectedSavedTheme(null);
  }, [deleteSavedTheme, selectedSavedTheme]);

  const handleExportThemes = useCallback(() => {
    const payload = exportThemeManager();
    setImportExportJson(payload);
    message.success('Theme manager export generated');
  }, [exportThemeManager]);

  const handleImportThemes = useCallback(() => {
    try {
      const result = importThemeManager(importExportJson);
      message.success(
        `Imported ${result.importedThemeCount} theme(s) and ${result.importedOverrideCount} override(s)`
      );
    } catch (error) {
      message.error(`Import failed: ${(error as Error).message}`);
    }
  }, [importThemeManager, importExportJson]);

  const currentOverrideThemeName = activeViewKey ? viewOverrides[activeViewKey]?.themeName ?? null : null;

  const handleViewOverrideChange = useCallback((value: string | null) => {
    if (!activeViewKey) {
      message.warning('No active view selected');
      return;
    }

    setViewOverride(activeViewKey, value);
    if (value) {
      message.success(`Applied view override to ${activeViewKey}`);
    } else {
      message.success(`Cleared view override for ${activeViewKey}`);
    }
  }, [activeViewKey, setViewOverride]);

  const themeOptions = useMemo(() => {
    return Object.keys(availableThemes).map(name => ({
      label: name,
      value: name,
    }));
  }, [availableThemes]);

  const savedThemeOptions = useMemo(() => {
    return Object.keys(savedThemes).map(name => ({
      label: name,
      value: name,
    }));
  }, [savedThemes]);

  const overrideThemeOptions = useMemo(() => {
    return [
      { label: 'No override (use global theme)', value: '__none__' },
      ...themeOptions,
      ...savedThemeOptions.filter(option => !availableThemes[option.value]),
    ];
  }, [availableThemes, savedThemeOptions, themeOptions]);

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

  const tabItems = useMemo(() => [
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
      key: 'manager',
      label: (
        <Space>
          <SaveOutlined />
          Theme Manager
        </Space>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Save Current Theme</Text>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input
                data-testid="theme-manager-save-name"
                value={savedThemeName}
                onChange={(e) => setSavedThemeName(e.target.value)}
                placeholder="Enter a saved theme name"
              />
              <Button
                data-testid="theme-manager-save"
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveTheme}
              >
                Save
              </Button>
            </Space.Compact>
          </div>

          <div>
            <Text strong>Saved Themes</Text>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Select
                data-testid="theme-manager-saved-select"
                value={selectedSavedTheme}
                onChange={(value) => setSelectedSavedTheme(value)}
                options={savedThemeOptions}
                style={{ width: '100%' }}
                placeholder="Select saved theme"
              />
              <Button
                data-testid="theme-manager-load"
                icon={<DownloadOutlined />}
                onClick={handleLoadSavedTheme}
              >
                Load
              </Button>
              <Button
                data-testid="theme-manager-delete"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteSavedTheme}
              >
                Delete
              </Button>
            </Space.Compact>
          </div>

          <div>
            <Text strong>Per-View Override</Text>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" data-testid="theme-manager-active-view">
                Active view: {activeViewKey ?? 'None'}
              </Text>
            </div>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Select
                data-testid="theme-manager-view-override"
                value={currentOverrideThemeName ?? '__none__'}
                options={overrideThemeOptions}
                onChange={(value) => handleViewOverrideChange(value === '__none__' ? null : value)}
                style={{ width: '100%' }}
                disabled={!activeViewKey}
              />
              <Button
                data-testid="theme-manager-view-clear"
                onClick={() => handleViewOverrideChange(null)}
                disabled={!activeViewKey || !currentOverrideThemeName}
              >
                Clear
              </Button>
            </Space.Compact>
          </div>

          <div>
            <Text strong>Import / Export</Text>
            <Space style={{ marginTop: 8 }}>
              <Button
                data-testid="theme-manager-export"
                icon={<DownloadOutlined />}
                onClick={handleExportThemes}
              >
                Export JSON
              </Button>
              <Button
                data-testid="theme-manager-import"
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleImportThemes}
              >
                Import JSON
              </Button>
            </Space>
            <Input.TextArea
              data-testid="theme-manager-json"
              value={importExportJson}
              onChange={(e) => setImportExportJson(e.target.value)}
              rows={10}
              style={{ marginTop: 8, fontFamily: 'monospace' }}
              placeholder="Exported theme manager JSON appears here. Paste JSON here to import."
            />
          </div>
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
  ], [
    activeViewKey,
    availableThemes,
    currentOverrideThemeName,
    handleDeleteSavedTheme,
    handleExportThemes,
    handleImportThemes,
    handleLoadSavedTheme,
    handleSaveTheme,
    handleViewOverrideChange,
    importExportJson,
    localDarkMode,
    localSyncWithHA,
    localThemeName,
    overrideThemeOptions,
    savedThemeName,
    savedThemeOptions,
    selectedSavedTheme,
    themeOptions,
  ]);

  const tabs = (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
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
