import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  Select,
  Radio,
  Checkbox,
  Button,
  Space,
  Alert,
  Tabs,
  Typography,
  Input,
  message,
  theme as antdTheme,
} from 'antd';
import {
  CodeOutlined,
  BgColorsOutlined,
  SaveOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';
import { themeService } from '../services/themeService';
import { buildThemeOptions, type ThemeOption } from '../features/theme-manager';
import { ThemeNoEffectBadge } from './ThemeNoEffectBadge';
import * as monaco from 'monaco-editor';

const { Text } = Typography;

interface ThemeSettingsDialogProps {
  visible: boolean;
  onClose: () => void;
  renderInline?: boolean;
}

/**
 * The per-view override Select's "no override" sentinel, and the prefix that
 * keeps every real theme's option value out of its way.
 *
 * ⚠⚠ See the comment on `overrideThemeOptions` below for why these exist — in
 * short, `__none__` is a saved-theme name a user can actually import, and an
 * option list holding two options with the same `value` is one antd cannot
 * disambiguate for either its label or its badge.
 */
const OVERRIDE_NONE_VALUE = '__none__';
const OVERRIDE_THEME_PREFIX = 'theme:';

const overrideValueForTheme = (themeName: string) => `${OVERRIDE_THEME_PREFIX}${themeName}`;

/** `null` for the sentinel, otherwise the real theme name the value encodes. */
const themeNameFromOverrideValue = (value: string): string | null =>
  value.startsWith(OVERRIDE_THEME_PREFIX) ? value.slice(OVERRIDE_THEME_PREFIX.length) : null;

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

  // Child of the ConfigProvider, so useToken() is correct here.
  const { token } = antdTheme.useToken();

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
        `Imported ${result.importedThemeCount} theme(s) and ${result.importedOverrideCount} override(s)`,
      );
    } catch (error) {
      message.error(`Import failed: ${(error as Error).message}`);
    }
  }, [importThemeManager, importExportJson]);

  const currentOverrideThemeName = activeViewKey
    ? (viewOverrides[activeViewKey]?.themeName ?? null)
    : null;

  const handleViewOverrideChange = useCallback(
    (value: string | null) => {
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
    },
    [activeViewKey, setViewOverride],
  );

  // ⭐ RC5: available (built-ins + any HA themes) UNION saved. Previously read
  // `availableThemes` alone, which disagreed with `resolveThemeByName` — a saved
  // theme resolved but could not be selected.
  // ⚠ Keyed to `localDarkMode`, not the store's `darkMode`: this dialog edits
  // the mode, and the badge must describe the theme as it will apply once the
  // dialog is saved rather than as it applies right now.
  const themeOptions = useMemo(() => {
    return buildThemeOptions(availableThemes, savedThemes, localDarkMode);
  }, [availableThemes, savedThemes, localDarkMode]);

  // ⚠⚠ CODEX ROUND-1 FINDING M2. This used to build a SECOND option shape by
  // hand — `{label, value}` only — which silently discarded the badge flag, so
  // loading a saved theme applied it with no warning while the same theme was
  // badged in the header picker. It now goes through `buildThemeOptions` like
  // every other theme option list. Passing `{}` as the available themes yields
  // exactly the saved ones, in the same order `Object.keys(savedThemes)` gave.
  const savedThemeOptions = useMemo(() => {
    return buildThemeOptions({}, savedThemes, localDarkMode);
  }, [savedThemes, localDarkMode]);

  // ⚠ `themeOptions` ALREADY unions the saved themes, so the previous extra
  // `savedThemeOptions.filter(...)` spread here would now duplicate every one of
  // them in this list. Do not reinstate it.
  // ⚠ The sentinel carries `definesNoCanvasColors: false` explicitly rather
  // than omitting the field: it keeps the array a homogeneous `ThemeOption[]`,
  // and "no override" is not a theme, so it has no predicate to evaluate and
  // must never be badged.
  //
  // ⚠⚠⚠ CODEX ROUND-2 FINDING R2-M2 — AND THE DEFECT THE ROUND-1 FIX CREATED.
  // `__none__` is a SUPPORTED saved-theme name: `storage.ts` only trims the name
  // and rejects the empty string, so a user can import a theme called exactly
  // that. The round-1 fix gave the sentinel an explicit `false` flag and then
  // decided the collapsed badge with `options.some(value matches && flag)` —
  // which walks straight past the false sentinel to a LATER option sharing the
  // value. A no-override state then rendered the warning, and antd resolved the
  // collapsed LABEL from the colliding theme too, displaying `__none__` where it
  // held no override at all. Round 1 had ruled the collision out of scope
  // because nothing had touched this path; the fix is what made it live.
  //
  // ⭐ THE REMEDY IS STRUCTURAL, NOT A BETTER LOOKUP. Every REAL theme's option
  // value is namespaced `theme:<name>`, so the sentinel cannot collide with any
  // name the user can produce — including `theme:` prefixed ones, which simply
  // namespace to `theme:theme:…`. That makes the option list VALUE-UNIQUE, which
  // is what makes `marksNoEffect`'s `.some` exact rather than merely lucky, and
  // it closes the pre-existing defect that a real theme named `__none__` could
  // never be selected as an override at all.
  // ⚠ `label` is untouched, so the antd-derived `title` — which every spec and
  // the Theme Manager DSL select by — is unchanged by this.
  const overrideThemeOptions = useMemo<ThemeOption[]>(() => {
    return [
      {
        label: 'No override (use global theme)',
        value: OVERRIDE_NONE_VALUE,
        definesNoCanvasColors: false,
      },
      ...themeOptions.map((option) => ({
        ...option,
        value: overrideValueForTheme(option.value),
      })),
    ];
  }, [themeOptions]);

  /**
   * ⚠ antd threads the option's own fields through `optionRender` (as
   * `option.data`) but NOT through `labelRender`, which receives only
   * `{ label, value }`. Both renderers therefore resolve the flag by value
   * against the list the Select was given — one helper per list, so a Select
   * can never read another Select's population.
   *
   * ⚠⚠ THIS IS EXACT ONLY BECAUSE EVERY LIST IT IS CALLED WITH IS VALUE-UNIQUE,
   * and that is an invariant to preserve, not an accident. `savedThemeOptions`
   * is keyed by `Object.entries(savedThemes)`; `themeOptions` unions saved onto
   * available and skips any name already present; `overrideThemeOptions`
   * namespaces its real entries so they cannot collide with its sentinel. Feed
   * this a list containing two options with the same `value` and `.some` will
   * return the flag of whichever one it reaches first — which is precisely
   * Codex round-2 finding R2-M2, and it produced a false warning on a
   * no-override state. If you add a Select here, make its option values unique
   * BY CONSTRUCTION.
   */
  const marksNoEffect = useCallback(
    (options: ThemeOption[], value: unknown) =>
      options.some((option) => option.value === value && option.definesNoCanvasColors),
    [],
  );

  // Generate YAML from current theme
  const themeYaml = currentTheme ? themeService.generateThemeCSS(currentTheme, localDarkMode) : '';

  // Generate JSON representation of theme
  const themeJson = currentTheme ? JSON.stringify(currentTheme, null, 2) : '';

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

  const tabItems = useMemo(
    () => [
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
                disabled={themeOptions.length === 0}
                optionRender={(option) => (
                  <Space
                    size={4}
                    style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                  >
                    <span>{option.label}</span>
                    {option.data?.definesNoCanvasColors && <ThemeNoEffectBadge />}
                  </Space>
                )}
                labelRender={({ label, value }) => (
                  <Space size={4} style={{ display: 'flex' }}>
                    <span>{label}</span>
                    {themeOptions.some(
                      (option) => option.value === value && option.definesNoCanvasColors,
                    ) && <ThemeNoEffectBadge focusable />}
                  </Space>
                )}
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
              <Text
                type="secondary"
                style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}
              >
                When enabled, the app will automatically use the theme currently active in Home
                Assistant
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
                  optionRender={(option) => (
                    <Space
                      size={4}
                      style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                    >
                      <span>{option.label}</span>
                      {option.data?.definesNoCanvasColors && <ThemeNoEffectBadge />}
                    </Space>
                  )}
                  labelRender={({ label, value }) => (
                    <Space size={4} style={{ display: 'flex' }}>
                      <span>{label}</span>
                      {marksNoEffect(savedThemeOptions, value) && (
                        <ThemeNoEffectBadge compact focusable />
                      )}
                    </Space>
                  )}
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
                  value={
                    currentOverrideThemeName
                      ? overrideValueForTheme(currentOverrideThemeName)
                      : OVERRIDE_NONE_VALUE
                  }
                  options={overrideThemeOptions}
                  onChange={(value) => handleViewOverrideChange(themeNameFromOverrideValue(value))}
                  style={{ width: '100%' }}
                  disabled={!activeViewKey}
                  optionRender={(option) => (
                    <Space
                      size={4}
                      style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                    >
                      <span>{option.label}</span>
                      {option.data?.definesNoCanvasColors && <ThemeNoEffectBadge />}
                    </Space>
                  )}
                  labelRender={({ label, value }) => (
                    <Space size={4} style={{ display: 'flex' }}>
                      <span>{label}</span>
                      {marksNoEffect(overrideThemeOptions, value) && (
                        <ThemeNoEffectBadge compact focusable />
                      )}
                    </Space>
                  )}
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
                border: `1px solid ${token.colorBorder}`,
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
                border: `1px solid ${token.colorBorder}`,
                borderRadius: '4px',
                height: '400px',
                overflow: 'hidden',
              }}
            />
          </div>
        ),
      },
    ],
    [
      activeViewKey,
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
      marksNoEffect,
      overrideThemeOptions,
      savedThemeName,
      savedThemeOptions,
      selectedSavedTheme,
      themeOptions,
      token,
    ],
  );

  const tabs = <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />;

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
