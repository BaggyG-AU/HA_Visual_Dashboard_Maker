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

  return (
    <Space size="small">
      <Tooltip title="Select theme for preview">
        <Select
          value={currentThemeName}
          onChange={setTheme}
          options={themeOptions}
          style={{ width: 150 }}
          placeholder="Select theme"
          suffixIcon={<BgColorsOutlined />}
          disabled={Object.keys(availableThemes).length === 0}
          dropdownRender={menu => (
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
          checked={darkMode}
          onChange={toggleDarkMode}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
        />
      </Tooltip>

      {syncWithHA && (
        <Tooltip title="Theme is synced with Home Assistant">
          <Badge status="processing" text="Synced" />
        </Tooltip>
      )}

      <Tooltip title="Open theme settings">
        <Button
          size="small"
          icon={<SettingOutlined />}
          onClick={onOpenSettings}
          disabled={Object.keys(availableThemes).length === 0}
        />
      </Tooltip>
    </Space>
  );
};
