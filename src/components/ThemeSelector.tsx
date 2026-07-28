import React from 'react';
import { Select, Tooltip, Space, Switch, Badge, Button, theme } from 'antd';
import { BgColorsOutlined, SunOutlined, MoonOutlined, ReloadOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';
import { buildThemeOptions } from '../features/theme-manager';

interface ThemeSelectorProps {
  onRefreshThemes: () => Promise<void>;
  /**
   * ⚠ RC5: the selector is no longer gated on the HA connection, so its
   * "Reload Themes from HA" action can now be reached offline — where
   * `fetchThemes` early-returns and the click is a silent no-op. Pass the
   * connection state so the control can say so instead of doing nothing.
   */
  isConnected?: boolean;
}

/**
 * Theme Selector Component
 * Allows users to select and preview HA themes
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onRefreshThemes,
  isConnected = false,
}) => {
  const {
    currentThemeName,
    availableThemes,
    savedThemes,
    darkMode,
    syncWithHA,
    setTheme,
    toggleDarkMode,
  } = useThemeStore();

  // Child of the ConfigProvider, so useToken() is correct here (App.tsx must use
  // getDesignToken instead — it RENDERS the provider and would read the outer context).
  const { token } = theme.useToken();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshThemes();
    } finally {
      setRefreshing(false);
    }
  };

  const themeOptions = buildThemeOptions(availableThemes, savedThemes);

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
          popupRender={(menu) => (
            <>
              {menu}
              <div style={{ padding: '8px', borderTop: `1px solid ${token.colorBorder}` }}>
                <Tooltip
                  title={
                    isConnected
                      ? 'Re-fetch the themes defined on your Home Assistant instance'
                      : 'Connect to Home Assistant to load its themes. The built-in themes above are always available.'
                  }
                >
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={refreshing}
                    size="small"
                    block
                    disabled={!isConnected}
                    data-testid="theme-reload-from-ha"
                  >
                    Reload Themes from HA
                  </Button>
                </Tooltip>
              </div>
            </>
          )}
        />
      </Tooltip>

      <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
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
    </Space>
  );
};
