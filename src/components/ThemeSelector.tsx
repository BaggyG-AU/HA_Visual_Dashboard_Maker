import React from 'react';
import { Select, Tooltip, Space, Switch, Badge, Button, theme } from 'antd';
import { BgColorsOutlined, SunOutlined, MoonOutlined, ReloadOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';
import { buildThemeOptions } from '../features/theme-manager';
import { ThemeNoEffectBadge } from './ThemeNoEffectBadge';

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

  const themeOptions = buildThemeOptions(availableThemes, savedThemes, darkMode);

  const hasThemes = themeOptions.length > 0;

  // ⚠ `labelRender` receives only `{ label, value }` — antd does not thread the
  // option's own fields through it — so the badge state is looked up by value.
  const marksNoEffect = (value: unknown) =>
    themeOptions.some((option) => option.value === value && option.definesNoCanvasColors);

  return (
    <Space size="small" data-testid="theme-selector">
      {/*
       * ⚠⚠ NO `<Tooltip>` AROUND THIS SELECT — Codex round-5 finding R5-N1.
       * It used to be wrapped in one reading "Select theme for preview", and
       * `labelRender` below renders the badge — WITH ITS OWN TOOLTIP — inside
       * that same Select. One hover over the badge therefore opened BOTH: two
       * fully opaque overlapping overlays, measured at ~170×34 and ~250×122.
       * The hint now rides on the Select's accessible name, which costs a
       * sighted mouse user a hover affordance and gains every keyboard and
       * screen-reader user a name they previously had to hover to discover.
       * ⚠ Do not "restore" the Tooltip: the badge tooltip is the one carrying
       * the qualification, and a parent tooltip will obscure it again.
       */}
      <Select
        aria-label="Select theme for preview"
        data-testid="theme-select"
        value={currentThemeName}
        onChange={setTheme}
        options={themeOptions}
        style={{ width: 200 }}
        placeholder="Select theme"
        suffixIcon={<BgColorsOutlined />}
        disabled={!hasThemes}
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
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {label}
            </span>
            {marksNoEffect(value) && <ThemeNoEffectBadge compact focusable />}
          </Space>
        )}
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
