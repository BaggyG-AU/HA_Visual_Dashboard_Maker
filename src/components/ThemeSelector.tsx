import React from 'react';
import { Select, Button, Tooltip, Space, Switch, Badge } from 'antd';
import { BgColorsOutlined, SunOutlined, MoonOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';

interface ThemeSelectorProps {
  onRefreshThemes: () => Promise<void>;
  onOpenSettings: () => void;
}

/**
 * Theme Selector Component
 * Allows users to select and preview HA themes
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onRefreshThemes,
  onOpenSettings
}) => {
  const {
    currentThemeName,
    availableThemes,
    darkMode,
    syncWithHA,
    setTheme,
    toggleDarkMode,
  } = useThemeStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshThemes();
    } finally {
      setRefreshing(false);
    }
  };

  const themeOptions = Object.keys(availableThemes).map(name => ({
    label: name,
    value: name,
  }));

  const hasThemes = themeOptions.length > 0;

  return (
    <Space size="small" data-testid="theme-selector">
      <Tooltip title="Select theme for preview">
        <Select
          data-testid="theme-select"
          value={currentThemeName}
          onChange={setTheme}
          options={themeOptions}
          style={{ width: 200 }}
          placeholder="Select theme"
          suffixIcon={<BgColorsOutlined />}
          disabled={!hasThemes}
          popupRender={menu => (
            <>
              {menu}
              <div style={{ padding: '8px', borderTop: '1px solid #434343' }}>
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={refreshing}
                  size="small"
                  block
                >
                  Reload Themes from HA
                </Button>
              </div>
            </>
          )}
        />
      </Tooltip>

      <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
        <Switch
          data-testid="theme-dark-toggle"
          checked={darkMode}
          onChange={toggleDarkMode}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          disabled={!hasThemes}
        />
      </Tooltip>

      {syncWithHA && (
        <Tooltip title="Theme is synced with Home Assistant">
          <Badge status="processing" text="Synced" data-testid="theme-sync-badge" />
        </Tooltip>
      )}

      <Tooltip title="Open theme settings">
        <Button
          data-testid="theme-settings-button"
          size="small"
          icon={<SettingOutlined />}
          onClick={onOpenSettings}
          disabled={!hasThemes}
        />
      </Tooltip>
    </Space>
  );
};
