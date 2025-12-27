# Theme Integration Feature Specification

**Feature**: Home Assistant Theme Integration
**Version**: 1.0
**Date**: December 27, 2024
**Status**: Planned
**Priority**: Medium
**Target Release**: v0.4.0-beta (Q2 2025)

---

## Executive Summary

Enable the HA Visual Dashboard Maker to discover, preview, and apply Home Assistant themes from the connected HA instance. This feature will allow users to design dashboards with accurate theme styling, ensuring the visual editor matches the final appearance in Home Assistant.

### Key Benefits
- ✅ **Accurate Preview**: See exactly how dashboards will look with different themes
- ✅ **Theme Discovery**: Automatically detect all installed HA themes
- ✅ **Live Updates**: Theme changes sync in real-time
- ✅ **No Configuration**: Works with existing HA WebSocket connection
- ✅ **HACS Support**: Compatible with popular community themes

---

## Research Summary

### How HA Themes Work

**Theme Structure** (YAML):
```yaml
frontend:
  themes:
    my_theme:
      # Core colors
      primary-color: "#ff9800"
      accent-color: "#ff5722"

      # Text colors
      primary-text-color: "#ffffff"
      secondary-text-color: "rgba(255, 255, 255, 0.7)"

      # Backgrounds
      primary-background-color: "#37464f"
      card-background-color: "#263137"

      # Mode-specific overrides
      modes:
        light:
          primary-background-color: "#f9f9f9"
        dark:
          primary-background-color: "#303030"
```

**WebSocket API**:
- **Command**: `frontend/get_themes`
- **Returns**: All installed themes with their CSS variables
- **Event**: `themes_updated` fires when themes change

**CSS Variable Application**:
- Themes set CSS custom properties (`--primary-color`, etc.)
- Cards use `var(--primary-color)` in their styles
- Changes propagate instantly via CSS inheritance

### Popular Themes
1. **Mushroom Themes** - Minimalist, semi-transparent cards
2. **Noctis** - Dark blue with blur effects
3. **Slate** - Modern dark theme
4. **Catppuccin** - Soothing pastels
5. **Nordic** - Nord-inspired color palette

---

## Feature Design

### User Stories

**As a dashboard designer**, I want to:
1. See my dashboards with the same theme as my Home Assistant instance
2. Preview how my dashboard looks in different themes before deploying
3. Switch between light and dark modes while editing
4. Know which theme is currently active in my HA instance

**As a theme creator**, I want to:
1. Test my custom themes in the visual editor
2. See theme changes instantly when I reload themes in HA
3. Export dashboards that work well with specific themes

### User Interface

#### 1. Theme Selector (Header Toolbar)

**Location**: Main application header, next to connection status

```
┌─────────────────────────────────────────────────────────┐
│ HA Dashboard Maker    [🎨 Theme: Noctis ▾] [☀️/🌙]     │
│                                                         │
│ [Undo] [Redo] [Entities]    Connected ● [Disconnect]  │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- 🎨 **Theme Dropdown**: Select from available themes
- ☀️/🌙 **Mode Toggle**: Switch between light/dark mode
- **Current Theme Badge**: Shows active theme name

**Dropdown Contents**:
```
┌─────────────────────────────────┐
│ 🎨 Select Theme                 │
├─────────────────────────────────┤
│ ● Default                       │ ← Currently active in HA
│   Noctis                        │
│   Mushroom                      │
│   Slate                         │
│   Catppuccin                    │
│   Nordic                        │
├─────────────────────────────────┤
│ 🔄 Reload Themes from HA        │
│ 📥 Import Theme File...         │
└─────────────────────────────────┘
```

#### 2. Theme Preview Panel (Optional)

**Location**: Right sidebar, collapsible panel below Properties

```
┌─────────────────────────────┐
│ Properties                  │
│ ┌─────────────────────────┐ │
│ │ Card properties here... │ │
│ └─────────────────────────┘ │
│                             │
│ Theme Preview    [Collapse] │
│ ┌─────────────────────────┐ │
│ │ 🎨 Noctis (Dark Mode)   │ │
│ │ ───────────────────────  │ │
│ │ Primary: #5294E2 ████   │ │
│ │ Accent:  #E45E65 ████   │ │
│ │ Text:    #ffffff ████   │ │
│ │ Background: #303030 ████│ │
│ │ Card BG: #263137 ████   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### 3. Theme Settings Dialog

**Trigger**: Click gear icon next to theme selector

```
┌───────────────────────────────────────────┐
│ Theme Settings                        [×] │
├───────────────────────────────────────────┤
│                                           │
│ Active Theme                              │
│ ┌───────────────────────────────────────┐ │
│ │ Noctis                           [▾]  │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ Mode                                      │
│ ○ Light   ● Dark   ○ Auto (follow HA)    │
│                                           │
│ Preview Options                           │
│ ☑ Apply theme to card previews           │
│ ☑ Sync with Home Assistant theme         │
│ ☐ Show theme variables panel              │
│                                           │
│ Advanced                                  │
│ [ View Theme YAML ]                       │
│ [ Export Current Theme ]                  │
│                                           │
│ ┌─────────────────────────────────────┐   │
│ │ ⓘ Themes are fetched from your     │   │
│ │   connected Home Assistant instance │   │
│ └─────────────────────────────────────┘   │
│                                           │
│               [Cancel]  [Apply]  [OK]     │
└───────────────────────────────────────────┘
```

---

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Electron App (Renderer)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  App.tsx                                                │
│  ├─ Theme Selector Component                           │
│  │  └─ Dropdown with theme list                        │
│  │                                                      │
│  ├─ Theme Preview Panel                                │
│  │  └─ Color swatches and variables                    │
│  │                                                      │
│  └─ GridCanvas (with theme applied)                    │
│     └─ Card Renderers (inherit CSS variables)          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                   Theme Service                         │
│  ├─ fetchThemes() → WebSocket API                      │
│  ├─ applyTheme(element, theme, mode)                   │
│  ├─ subscribeToThemeUpdates(callback)                  │
│  └─ generateThemeCSS(theme, mode)                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│              WebSocket Service (IPC)                    │
│  └─ frontend/get_themes                                │
│     └─ subscribe_events: themes_updated                │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         ↕ WebSocket
┌─────────────────────────────────────────────────────────┐
│              Home Assistant Instance                    │
│  ├─ themes/                                            │
│  │  ├─ noctis.yaml                                     │
│  │  ├─ mushroom.yaml                                   │
│  │  └─ ...                                             │
│  └─ Frontend Service                                   │
│     └─ frontend/get_themes API                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Theme Discovery**:
   - User connects to Home Assistant
   - App calls `frontend/get_themes` via WebSocket
   - Receives list of all installed themes
   - Populates theme selector dropdown

2. **Theme Application**:
   - User selects theme from dropdown
   - ThemeService applies CSS variables to GridCanvas container
   - Card renderers inherit theme via CSS custom properties
   - Preview updates instantly

3. **Theme Updates**:
   - App subscribes to `themes_updated` events
   - When user reloads themes in HA, event fires
   - App re-fetches themes and updates selector
   - If current theme changed, re-applies it

### File Structure

```
src/
├── types/
│   └── homeassistant.ts
│       ├─ interface Theme { ... }
│       ├─ interface Themes { ... }
│       └─ interface ThemeVars { ... }
│
├── services/
│   ├── haWebSocketService.ts
│   │   ├─ async getThemes(): Promise<Themes>
│   │   └─ subscribeToThemes(callback): Promise<UnsubscribeFn>
│   │
│   └── themeService.ts  ← NEW
│       ├─ applyThemeToElement(element, theme, mode)
│       ├─ generateThemeCSS(theme, mode): string
│       ├─ clearThemeFromElement(element)
│       └─ getThemeColors(theme, mode): ColorPalette
│
├── components/
│   ├── ThemeSelector.tsx  ← NEW
│   │   ├─ Dropdown component
│   │   ├─ Mode toggle (light/dark)
│   │   └─ Reload themes button
│   │
│   ├── ThemePreviewPanel.tsx  ← NEW
│   │   ├─ Color swatches
│   │   ├─ Variable list
│   │   └─ Theme info
│   │
│   └── ThemeSettingsDialog.tsx  ← NEW
│       ├─ Theme selection
│       ├─ Mode selection
│       ├─ Preview options
│       └─ YAML viewer
│
└── store/
    └── themeStore.ts  ← NEW
        ├─ currentTheme: Theme | null
        ├─ availableThemes: Record<string, Theme>
        ├─ darkMode: boolean
        ├─ setTheme(themeName, mode)
        └─ refreshThemes()
```

---

## Implementation Plan

### Phase 1: Core Theme Support (Sprint 7)
**Estimated Effort**: 1-2 weeks
**Priority**: High

**Tasks**:
1. ✅ Research HA themes (completed)
2. [ ] Add theme types to `homeassistant.ts`
3. [ ] Extend WebSocket service with theme API
4. [ ] Create `ThemeService` class
5. [ ] Create Zustand theme store
6. [ ] Add basic theme selector to header
7. [ ] Apply theme to GridCanvas preview
8. [ ] Test with popular themes

**Acceptance Criteria**:
- ✅ Can fetch themes from connected HA instance
- ✅ Theme selector shows all available themes
- ✅ Selecting theme applies CSS variables to preview
- ✅ Light/dark mode toggle works
- ✅ Cards inherit theme colors correctly

**Files to Create**:
- `src/types/homeassistant.ts` (extend existing)
- `src/services/themeService.ts`
- `src/store/themeStore.ts`
- `src/components/ThemeSelector.tsx`

**Files to Modify**:
- `src/services/haWebSocketService.ts`
- `src/App.tsx`
- `src/components/GridCanvas.tsx`

---

### Phase 2: Theme Preview & UI Polish (Sprint 8)
**Estimated Effort**: 1 week
**Priority**: Medium

**Tasks**:
1. [ ] Create ThemePreviewPanel component
2. [ ] Add theme color swatches
3. [ ] Show theme variable list
4. [ ] Create ThemeSettingsDialog
5. [ ] Add theme YAML viewer
6. [ ] Implement theme export feature
7. [ ] Add tooltips and help text

**Acceptance Criteria**:
- ✅ Theme preview panel shows current theme colors
- ✅ Can view theme YAML
- ✅ Settings dialog provides theme options
- ✅ User can export themes

**Files to Create**:
- `src/components/ThemePreviewPanel.tsx`
- `src/components/ThemeSettingsDialog.tsx`

---

### Phase 3: Live Updates & Advanced Features (Sprint 9)
**Estimated Effort**: 1 week
**Priority**: Low

**Tasks**:
1. [ ] Subscribe to `themes_updated` events
2. [ ] Auto-reload themes when HA reloads
3. [ ] Implement theme import from YAML file
4. [ ] Add "Sync with HA" option
5. [ ] Persist theme preference to settings
6. [ ] Add theme recommendations based on dashboard
7. [ ] Documentation and user guide

**Acceptance Criteria**:
- ✅ Themes auto-refresh when HA reloads
- ✅ Can import custom theme files
- ✅ Theme preference saved between sessions
- ✅ Documentation complete

---

## Code Examples

### 1. Theme Types

```typescript
// src/types/homeassistant.ts

export interface ThemeVars {
  "primary-color": string;
  "text-primary-color": string;
  "accent-color": string;
  "primary-background-color": string;
  "card-background-color": string;
  "secondary-text-color": string;
  [key: string]: string; // Additional custom variables
}

export interface ThemeMode {
  light?: ThemeVars;
  dark?: ThemeVars;
}

export interface Theme {
  [key: string]: string | ThemeMode;
  modes?: ThemeMode;
}

export interface Themes {
  default_theme: string;
  default_dark_theme: string | null;
  themes: Record<string, Theme>;
  darkMode: boolean;
  theme: string;
}
```

---

### 2. WebSocket Service Extension

```typescript
// src/services/haWebSocketService.ts

/**
 * Fetch all installed themes from Home Assistant
 */
async getThemes(): Promise<Themes> {
  if (!this.connection) {
    throw new Error('Not connected to Home Assistant');
  }

  const result = await this.sendAndWait<Themes>({
    type: 'frontend/get_themes',
  });

  console.log('Fetched themes from HA:', Object.keys(result.themes));
  return result;
}

/**
 * Subscribe to theme updates
 */
async subscribeToThemes(
  callback: (themes: Themes) => void
): Promise<() => void> {
  if (!this.connection) {
    throw new Error('Not connected to Home Assistant');
  }

  // Initial fetch
  const themes = await this.getThemes();
  callback(themes);

  // Subscribe to updates
  const id = this.messageId++;
  this.send({
    id,
    type: 'subscribe_events',
    event_type: 'themes_updated',
  });

  // Handle theme update events
  const handler = (msg: any) => {
    if (msg.id === id && msg.event) {
      // Refresh themes when updated
      this.getThemes().then(callback);
    }
  };

  this.eventHandlers.set(id, handler);

  // Return unsubscribe function
  return () => {
    this.send({
      id,
      type: 'unsubscribe_events',
      subscription: id,
    });
    this.eventHandlers.delete(id);
  };
}
```

---

### 3. Theme Service

```typescript
// src/services/themeService.ts

import { Theme } from '../types/homeassistant';

export class ThemeService {
  /**
   * Apply theme CSS variables to an element
   */
  applyThemeToElement(
    element: HTMLElement,
    theme: Theme,
    darkMode: boolean
  ): void {
    console.log('Applying theme to element:', { darkMode });

    // Merge base theme with mode-specific overrides
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode
      ? theme.modes?.dark || {}
      : theme.modes?.light || {};

    const finalVars = { ...baseVars, ...modeVars };

    // Apply CSS variables
    Object.entries(finalVars).forEach(([key, value]) => {
      if (typeof value === 'string') {
        element.style.setProperty(`--${key}`, value);
      }
    });

    console.log(`Applied ${Object.keys(finalVars).length} CSS variables`);
  }

  /**
   * Generate CSS stylesheet from theme
   */
  generateThemeCSS(theme: Theme, darkMode: boolean): string {
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode
      ? theme.modes?.dark || {}
      : theme.modes?.light || {};

    const finalVars = { ...baseVars, ...modeVars };

    const cssVars = Object.entries(finalVars)
      .filter(([_, value]) => typeof value === 'string')
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');

    return `:root {\n${cssVars}\n}`;
  }

  /**
   * Clear all theme CSS variables from element
   */
  clearThemeFromElement(element: HTMLElement): void {
    // Get all custom properties
    const styles = element.style;
    const propsToRemove: string[] = [];

    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        propsToRemove.push(prop);
      }
    }

    // Remove them
    propsToRemove.forEach(prop => {
      element.style.removeProperty(prop);
    });
  }

  /**
   * Extract color palette from theme for preview
   */
  getThemeColors(
    theme: Theme,
    darkMode: boolean
  ): Record<string, string> {
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode
      ? theme.modes?.dark || {}
      : theme.modes?.light || {};

    const finalVars = { ...baseVars, ...modeVars };

    // Extract commonly used colors
    return {
      primary: finalVars['primary-color'] as string,
      accent: finalVars['accent-color'] as string,
      primaryText: finalVars['primary-text-color'] as string,
      secondaryText: finalVars['secondary-text-color'] as string,
      primaryBackground: finalVars['primary-background-color'] as string,
      cardBackground: finalVars['card-background-color'] as string,
    };
  }
}

export const themeService = new ThemeService();
```

---

### 4. Theme Store

```typescript
// src/store/themeStore.ts

import { create } from 'zustand';
import { Theme, Themes } from '../types/homeassistant';

interface ThemeStore {
  // State
  currentThemeName: string | null;
  currentTheme: Theme | null;
  availableThemes: Record<string, Theme>;
  darkMode: boolean;
  syncWithHA: boolean;

  // Actions
  setAvailableThemes: (themes: Themes) => void;
  setTheme: (themeName: string) => void;
  toggleDarkMode: () => void;
  setSyncWithHA: (sync: boolean) => void;
  refreshThemes: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Initial state
  currentThemeName: null,
  currentTheme: null,
  availableThemes: {},
  darkMode: true,
  syncWithHA: true,

  // Set available themes from HA
  setAvailableThemes: (themes: Themes) => {
    set({
      availableThemes: themes.themes,
      darkMode: themes.darkMode,
    });

    // If syncing with HA, apply HA's current theme
    if (get().syncWithHA) {
      const haTheme = themes.themes[themes.theme];
      if (haTheme) {
        set({
          currentThemeName: themes.theme,
          currentTheme: haTheme,
        });
      }
    }
  },

  // Set current theme
  setTheme: (themeName: string) => {
    const theme = get().availableThemes[themeName];
    if (theme) {
      set({
        currentThemeName: themeName,
        currentTheme: theme,
        syncWithHA: false, // Manual selection disables sync
      });
    }
  },

  // Toggle dark/light mode
  toggleDarkMode: () => {
    set({ darkMode: !get().darkMode });
  },

  // Enable/disable sync with HA
  setSyncWithHA: (sync: boolean) => {
    set({ syncWithHA: sync });
  },

  // Refresh themes from HA
  refreshThemes: async () => {
    // This will be called by the component
    // that has access to haWebSocketService
  },
}));
```

---

### 5. Theme Selector Component

```typescript
// src/components/ThemeSelector.tsx

import React from 'react';
import { Select, Button, Tooltip, Space, Switch } from 'antd';
import { BgColorsOutlined, SunOutlined, MoonOutlined, ReloadOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';

interface ThemeSelectorProps {
  onRefreshThemes: () => Promise<void>;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onRefreshThemes
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
          prefix={<BgColorsOutlined />}
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
    </Space>
  );
};
```

---

### 6. Usage in App.tsx

```typescript
// src/App.tsx

import { ThemeSelector } from './components/ThemeSelector';
import { useThemeStore } from './store/themeStore';
import { themeService } from './services/themeService';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    currentTheme,
    darkMode,
    setAvailableThemes
  } = useThemeStore();

  // Fetch themes when connected to HA
  const fetchThemes = async () => {
    if (!isConnected) return;

    try {
      const themes = await window.electronAPI.haWsGetThemes();
      setAvailableThemes(themes);
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      message.error('Failed to load themes from Home Assistant');
    }
  };

  // Apply theme to canvas when theme or mode changes
  useEffect(() => {
    if (canvasRef.current && currentTheme) {
      themeService.applyThemeToElement(
        canvasRef.current,
        currentTheme,
        darkMode
      );
    }

    return () => {
      if (canvasRef.current) {
        themeService.clearThemeFromElement(canvasRef.current);
      }
    };
  }, [currentTheme, darkMode]);

  // Subscribe to theme updates
  useEffect(() => {
    if (!isConnected) return;

    let unsubscribe: (() => void) | null = null;

    const subscribe = async () => {
      unsubscribe = await window.electronAPI.haWsSubscribeToThemes(
        (themes) => {
          setAvailableThemes(themes);
          message.info('Themes updated from Home Assistant');
        }
      );
    };

    subscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  return (
    <Layout>
      <Header>
        <Space>
          {/* Existing header content */}

          {isConnected && (
            <ThemeSelector onRefreshThemes={fetchThemes} />
          )}
        </Space>
      </Header>

      <Content>
        <div ref={canvasRef} className="canvas-container">
          <GridCanvas />
        </div>
      </Content>
    </Layout>
  );
};
```

---

## Testing Strategy

### Unit Tests
- [ ] ThemeService.applyThemeToElement()
- [ ] ThemeService.generateThemeCSS()
- [ ] ThemeService.getThemeColors()
- [ ] Theme store actions

### Integration Tests
- [ ] Fetch themes from HA
- [ ] Apply theme to canvas
- [ ] Switch between themes
- [ ] Toggle light/dark mode
- [ ] Subscribe to theme updates

### Manual Testing
- [ ] Test with Default theme
- [ ] Test with Noctis theme
- [ ] Test with Mushroom theme
- [ ] Test light/dark mode switching
- [ ] Test theme reload
- [ ] Test with disconnected HA
- [ ] Test with custom themes

---

## Security Considerations

**✅ Safe**:
- CSS variables only (no JavaScript execution)
- No HTML injection risk
- WebSocket connection already secured

**⚠️ Potential Issues**:
1. **Large theme objects** - Some themes may be very large (100+ variables)
   - **Mitigation**: Implement pagination or lazy loading

2. **Background image URLs** - May reference local HA files
   - **Mitigation**: Validate URLs, handle 404s gracefully

3. **Custom fonts** - External font URLs
   - **Mitigation**: Load fonts asynchronously, fallback to system fonts

4. **Malicious theme variables** - CSS injection attacks
   - **Mitigation**: Validate CSS values, sanitize inputs

---

## Performance Considerations

**Optimizations**:
1. **Cache themes locally** - Store in Electron Store for offline use
2. **Debounce theme changes** - Wait 300ms before applying theme
3. **Lazy load theme preview** - Only render when panel is visible
4. **Throttle theme updates** - Batch WebSocket events

**Performance Targets**:
- Theme fetch: < 500ms
- Theme application: < 100ms
- Theme switching: < 200ms
- Memory overhead: < 5MB for all themes

---

## Documentation Requirements

### User Documentation
- [ ] How to select themes
- [ ] How to switch light/dark mode
- [ ] How to reload themes from HA
- [ ] Troubleshooting theme issues
- [ ] Supported theme features

### Developer Documentation
- [ ] Theme service API reference
- [ ] WebSocket theme commands
- [ ] Theme store usage
- [ ] How to extend theme support
- [ ] CSS variable reference

---

## Future Enhancements (Post-v1.0)

### Phase 4: Theme Editing (Future)
- [ ] Visual theme editor
- [ ] Color picker for theme variables
- [ ] Live theme preview while editing
- [ ] Export custom themes to YAML
- [ ] Share themes with community

### Phase 5: Advanced Features (Future)
- [ ] Theme recommendations based on dashboard
- [ ] Theme A/B testing
- [ ] Theme accessibility checker
- [ ] Theme performance analyzer
- [ ] Theme version control

---

## Dependencies

**New Dependencies**: None required
- Uses existing WebSocket connection
- Uses existing Ant Design components
- Uses existing Zustand store pattern

**Optional Dependencies** (for future enhancements):
- `color` - For color manipulation
- `chroma-js` - For color palette generation
- `react-color` - For color picker

---

## Success Metrics

### User Adoption
- **Target**: 80% of users enable theme preview
- **Measurement**: Feature usage analytics

### Accuracy
- **Target**: 95% visual match with HA frontend
- **Measurement**: Visual regression testing

### Performance
- **Target**: < 200ms theme switching
- **Measurement**: Performance profiling

### User Satisfaction
- **Target**: 4.5/5 rating for theme feature
- **Measurement**: User surveys

---

## Rollout Plan

### Beta Release (v0.4.0-beta)
- Core theme support (Phase 1)
- Basic theme selector
- Light/dark mode toggle
- Limited to connected users

### Stable Release (v0.5.0)
- Theme preview panel (Phase 2)
- Theme settings dialog
- Theme export feature
- Documentation complete

### Future Releases (v0.6.0+)
- Live theme updates (Phase 3)
- Theme editing (Phase 4)
- Advanced features (Phase 5)

---

## Related Issues

- Integrates with UX_IMPROVEMENT_BACKLOG.md (design tokens)
- Complements responsive design (Sprint 6)
- Enhances card preview accuracy

---

## Appendices

### A. Supported Theme Variables

See [Home Assistant Frontend Wiki - Supported Theming Variables](https://github.com/home-assistant/frontend/wiki/%5BWIP%5D-Supported-Theming-Variables) for complete list of 200+ variables.

### B. Popular Theme Examples

**Noctis Theme:**
```yaml
Noctis:
  primary-color: "#5294E2"
  accent-color: "#E45E65"
  dark-primary-color: "#1F5592"
  light-primary-color: "#5294E2"
  text-primary-color: "#FFFFFF"
  primary-background-color: "#252932"
  sidebar-icon-color: "#6FA8DC"
  ...
```

**Mushroom Theme:**
```yaml
Mushroom:
  mush-rgb-blue: 33, 150, 243
  mush-spacing: 10px
  mush-chip-border-radius: 19px
  mush-icon-size: 36px
  card-background-color: "rgba(255, 255, 255, 0.1)"
  ...
```

### C. WebSocket API Examples

**Get Themes:**
```json
// Request
{
  "id": 1,
  "type": "frontend/get_themes"
}

// Response
{
  "id": 1,
  "type": "result",
  "success": true,
  "result": {
    "default_theme": "default",
    "theme": "Noctis",
    "darkMode": true,
    "themes": {
      "Noctis": {
        "primary-color": "#5294E2",
        ...
      }
    }
  }
}
```

---

**Document Version**: 1.0
**Last Updated**: December 27, 2024
**Next Review**: After Phase 1 implementation
