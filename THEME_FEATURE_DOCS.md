# Home Assistant Theme Integration - User Guide

**Version**: 1.0
**Feature Release**: v0.2.0-beta
**Last Updated**: December 27, 2024

---

## Overview

The Home Assistant Theme Integration feature allows you to preview your dashboards with the exact same themes used in your Home Assistant instance. This ensures your visual designs match the final appearance when deployed to production.

### Key Features

✅ **Automatic Theme Discovery** - Detects all installed themes from your HA instance
✅ **Live Preview** - See exactly how dashboards look with different themes
✅ **Light/Dark Mode Toggle** - Switch between theme modes while designing
✅ **Theme Sync** - Automatically use your HA's currently active theme
✅ **Color Preview** - View theme color swatches in the properties panel
✅ **Advanced Settings** - Access theme YAML and CSS variables
✅ **Persistent Preferences** - Theme selections saved between sessions
✅ **Live Updates** - Themes auto-refresh when changed in HA

---

## Getting Started

### Prerequisites

- Connected to Home Assistant instance (WebSocket connection required)
- One or more themes installed in Home Assistant

### Accessing Theme Features

1. **Connect to Home Assistant**
   - Click "Connect to HA" button in the header
   - Enter your HA URL and access token
   - Wait for connection confirmation

2. **Theme Selector Appears**
   - Once connected, theme controls appear in the header
   - Located between the entity browser and connection status

---

## User Interface

### Header Controls

```
[Theme: Default ▾] [🌙/☀️] [Synced] Connected ● [⚙️]
```

**Components**:
- **Theme Dropdown**: Select from available themes
- **Mode Toggle**: Switch between light (☀️) and dark (🌙) modes
- **Sync Badge**: Shows "Synced" when using HA's active theme
- **Settings Button**: Opens advanced theme settings dialog

### Theme Preview Panel

Located in the right sidebar (Properties Panel area):

```
┌─────────────────────────────┐
│ 🎨 Theme Preview            │
├─────────────────────────────┤
│ Noctis                      │
│ [Dark Mode]                 │
├─────────────────────────────┤
│ Colors                      │
│ ████ Primary: #5294E2       │
│ ████ Accent: #E45E65        │
│ ████ Primary Text: #FFFFFF  │
│ ████ Secondary Text: ...    │
│ ████ Background: #252932    │
│ ████ Card Background: ...   │
└─────────────────────────────┘
```

---

## Using Themes

### Selecting a Theme

1. Click the **theme dropdown** in the header
2. Choose a theme from the list
3. Theme is applied immediately to the canvas
4. Dashboard cards inherit theme colors

**Note**: Manual theme selection disables "Sync with HA"

### Switching Light/Dark Mode

1. Click the **mode toggle** (☀️/🌙) in the header
2. Theme CSS variables update for the selected mode
3. Cards re-render with new mode colors

### Reloading Themes

1. Click the **theme dropdown**
2. Scroll to bottom and click **"Reload Themes from HA"**
3. Wait for themes to refresh
4. Updated theme list appears in dropdown

---

## Theme Settings Dialog

### Opening Settings

Click the **settings button (⚙️)** next to the theme selector

### Settings Tab

**Active Theme**: Dropdown to select theme
**Mode**: Radio buttons (Light / Dark)
**Options**:
- ☑ Sync with Home Assistant theme

**Info**: Explains how theme changes are applied

### CSS Variables Tab

View theme as CSS custom properties:

```css
:root {
  --primary-color: #5294E2;
  --accent-color: #E45E65;
  --primary-text-color: #FFFFFF;
  /* ... more variables ... */
}
```

**Features**:
- Syntax-highlighted Monaco editor
- Read-only view
- Copy-friendly format

### Theme JSON Tab

View raw theme data structure:

```json
{
  "primary-color": "#5294E2",
  "accent-color": "#E45E65",
  "modes": {
    "dark": { /* dark mode overrides */ },
    "light": { /* light mode overrides */ }
  }
}
```

**Use Cases**:
- Understanding theme structure
- Debugging theme issues
- Learning HA theme format

---

## How It Works

### Theme Discovery

1. App connects to Home Assistant via WebSocket
2. Sends `frontend/get_themes` command
3. Receives all installed themes and active theme
4. Populates theme selector dropdown

### Theme Application

1. User selects theme from dropdown
2. Theme Service applies CSS custom properties to canvas container:
   ```javascript
   element.style.setProperty('--primary-color', '#5294E2');
   ```
3. Card renderers inherit variables via CSS:
   ```css
   background-color: var(--card-background-color);
   ```
4. Preview updates instantly

### Live Updates

1. App subscribes to `themes_updated` WebSocket events
2. When themes change in HA (reload, new theme installed), event fires
3. App re-fetches themes automatically
4. Theme list updates in dropdown
5. If current theme changed, canvas re-renders

---

## Theme Persistence

### What's Saved

The app remembers your theme preferences:

- **Selected Theme**: Last chosen theme name
- **Dark Mode**: Light or dark mode preference
- **Sync Setting**: Whether to sync with HA

### Where It's Saved

Preferences stored in Electron Store:
- **Windows**: `%APPDATA%\ha-visual-dashboard-maker\config.json`
- **macOS**: `~/Library/Application Support/ha-visual-dashboard-maker/config.json`
- **Linux**: `~/.config/ha-visual-dashboard-maker/config.json`

### Behavior on Restart

1. App loads saved preferences on startup
2. If "Sync with HA" enabled:
   - Uses HA's currently active theme
3. If "Sync with HA" disabled:
   - Restores last manually selected theme

---

## Supported Themes

### Official HA Themes

- **Default** - Standard Home Assistant theme
- **iOS Light/Dark** - iOS-inspired theme
- All built-in HA themes

### HACS Themes

Compatible with popular community themes:

- **Noctis** - Dark blue with blur effects
- **Mushroom Themes** - Minimalist, semi-transparent cards
- **Slate** - Modern dark theme
- **Catppuccin** - Soothing pastel colors
- **Nordic** - Nord-inspired palette
- **Any other HACS theme** - Full compatibility

### Custom Themes

Works with any theme installed in Home Assistant:

```yaml
# configuration.yaml
frontend:
  themes:
    my_custom_theme:
      primary-color: "#ff9800"
      accent-color: "#ff5722"
      # ... more variables ...
```

---

## Troubleshooting

### Theme Selector Not Showing

**Problem**: Theme controls don't appear in header
**Solutions**:
1. Verify connected to Home Assistant (see connection badge)
2. Check WebSocket connection is active
3. Restart app if connection issues

### Themes Not Loading

**Problem**: Dropdown shows "No themes available"
**Solutions**:
1. Click "Reload Themes from HA" in dropdown
2. Verify themes installed in HA (`/config/themes/`)
3. Check browser console for errors (View → Developer → Toggle Developer Tools)

### Theme Not Applying to Cards

**Problem**: Cards don't match selected theme
**Solutions**:
1. Verify theme selected in dropdown (not showing placeholder)
2. Check canvas container has CSS variables (inspect element)
3. Ensure cards use CSS custom properties (not hard-coded colors)
4. Some custom cards may not support theming

### Colors Look Wrong

**Problem**: Theme colors different from HA frontend
**Solutions**:
1. Verify correct mode selected (light vs dark)
2. Check if theme has mode-specific overrides
3. Compare CSS variables in settings dialog with HA
4. Try reloading themes from HA

### Theme Preference Not Saving

**Problem**: Theme selection resets on app restart
**Solutions**:
1. Check Electron Store file permissions
2. Verify no errors in console when changing themes
3. Try manually selecting theme again
4. Check disk space available

---

## Advanced Usage

### Designing for Multiple Themes

**Best Practices**:
1. Test dashboard with multiple popular themes
2. Avoid hard-coded colors in custom cards
3. Use semantic CSS variables (`--primary-color`, not `#ff0000`)
4. Check both light and dark modes
5. Consider contrast ratios for accessibility

### Theme-Specific Design

1. Select target theme from dropdown
2. Design dashboard cards to complement theme
3. Use theme preview panel to verify colors
4. Test mode toggle for consistency

### Custom Card Theming

Ensure custom cards support theming:

```yaml
# Card YAML
type: custom:my-card
styles: |
  ha-card {
    background-color: var(--card-background-color);
    color: var(--primary-text-color);
    border: 1px solid var(--primary-color);
  }
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| (none yet) | Future: Quick theme switch |
| (none yet) | Future: Toggle light/dark |

---

## Technical Details

### WebSocket API

**Get Themes**:
```javascript
{
  type: 'frontend/get_themes'
}
```

**Response**:
```javascript
{
  default_theme: 'default',
  theme: 'noctis',           // Currently active theme
  darkMode: true,
  themes: {
    noctis: { /* theme variables */ },
    mushroom: { /* theme variables */ }
  }
}
```

**Subscribe to Updates**:
```javascript
{
  type: 'subscribe_events',
  event_type: 'themes_updated'
}
```

### CSS Variable Application

Theme Service sets CSS custom properties on canvas container:

```javascript
element.style.setProperty('--primary-color', '#5294E2');
element.style.setProperty('--accent-color', '#E45E65');
// ... more variables ...
```

Cards inherit via CSS:

```css
.card {
  background-color: var(--card-background-color);
  color: var(--primary-text-color);
}
```

### Theme Structure

**Base Theme** (no modes):
```typescript
{
  'primary-color': '#5294E2',
  'accent-color': '#E45E65',
  // ... more variables ...
}
```

**Theme with Modes**:
```typescript
{
  'primary-color': '#5294E2',  // Base color
  modes: {
    dark: {
      'primary-background-color': '#252932'
    },
    light: {
      'primary-background-color': '#f9f9f9'
    }
  }
}
```

**Resolution Order**:
1. Base variables applied
2. Mode-specific overrides applied on top
3. Result: merged variable set

---

## Future Enhancements

Planned features for future releases:

### v0.3.0-beta (Q1 2025)
- ☐ Keyboard shortcuts for theme switching
- ☐ Theme search in dropdown
- ☐ Recently used themes section

### v0.4.0-beta (Q2 2025)
- ☐ Import custom theme from YAML file
- ☐ Export theme as YAML
- ☐ Theme recommendations based on dashboard

### v1.0.0 (Q3 2025)
- ☐ Visual theme editor
- ☐ Theme A/B testing
- ☐ Theme accessibility checker

---

## FAQ

**Q: Do I need to install themes in the app?**
A: No, themes are fetched from your Home Assistant instance automatically.

**Q: Can I use themes without connecting to HA?**
A: No, theme integration requires active WebSocket connection to HA.

**Q: Will my theme selection affect my actual HA instance?**
A: No, theme selection in the app is for preview only. It doesn't change your HA configuration.

**Q: Can I preview multiple themes side-by-side?**
A: Not currently. You can switch between themes using the dropdown.

**Q: Do themes work with all card types?**
A: Themes work with any card that uses CSS custom properties. Some custom cards may have hard-coded colors.

**Q: Can I create themes in the app?**
A: Not in the current version. You must create themes in Home Assistant first.

**Q: How often do themes sync from HA?**
A: Themes are fetched:
- On initial connection
- When "Reload Themes" is clicked
- Automatically when HA themes are updated (via WebSocket event)

---

## Support

### Getting Help

- **Documentation**: This file and THEME_INTEGRATION_FEATURE.md
- **GitHub Issues**: https://github.com/anthropics/claude-code/issues
- **Home Assistant Themes**: https://www.home-assistant.io/integrations/frontend/#themes

### Reporting Issues

When reporting theme-related issues, include:
1. HA Visual Dashboard Maker version
2. Home Assistant version
3. Theme name and source (built-in, HACS, custom)
4. Steps to reproduce
5. Screenshots (theme dropdown, preview panel, console errors)
6. Console logs (View → Developer → Toggle Developer Tools)

---

## Changelog

### v0.2.0-beta (Current)
- ✅ Phase 1: Core theme support
- ✅ Phase 2: Theme preview & UI polish
- ✅ Phase 3: Live updates & persistence
- ✅ Theme selector with dropdown and mode toggle
- ✅ Theme preview panel with color swatches
- ✅ Theme settings dialog with CSS/JSON viewers
- ✅ Theme persistence across sessions
- ✅ Live theme update subscriptions

### Future
- ⏳ Phase 4: Theme editing
- ⏳ Phase 5: Advanced features

---

**End of User Guide**
For technical implementation details, see [THEME_INTEGRATION_FEATURE.md](THEME_INTEGRATION_FEATURE.md)
