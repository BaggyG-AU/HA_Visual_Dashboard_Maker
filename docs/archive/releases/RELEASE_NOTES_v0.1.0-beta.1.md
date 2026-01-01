# Release Notes - v0.1.0-beta.1

**Release Date:** December 26, 2024
**Release Type:** Beta 1 (Production Release)

This is the first beta release of HA Visual Dashboard Maker, featuring comprehensive entity browsing capabilities and advanced YAML editing with syntax highlighting.

---

## 🎉 Major Features

### Entity Browser
- **Comprehensive Entity Browser** with search, filtering, and grouping
  - Browse all Home Assistant entities in a searchable modal
  - Group entities by domain/integration (light, switch, sensor, etc.)
  - Advanced filtering similar to Home Assistant's entity browser
  - Tabbed interface showing entity counts per domain
  - Real-time entity validation with visual feedback

### Entity Caching & Offline Support
- **Persistent Entity Caching** for offline use
  - Entities cached locally using electron-store
  - Browse entities when not connected to Home Assistant
  - Auto-refresh entities on HA connection
  - Manual refresh button when connected

### Monaco Editor Integration
- **Syntax-Highlighted YAML Editing** with Monaco Editor
  - Replaced plain textarea with VS Code's Monaco editor
  - Full syntax highlighting for YAML
  - Line numbers and dark theme matching HA style
  - Consistent editing experience in both YAML editors:
    - Dashboard YAML Editor
    - Properties Panel YAML Editor

### Cursor-Aware Entity Insertion
- **Smart Entity Insertion** from Entity Browser
  - Click "Insert Entity" button in either YAML editor
  - Select entity from browser
  - Entity ID inserted at current cursor position
  - Works in both Monaco editors with proper focus management

---

## 🔧 Technical Improvements

### Architecture Enhancements
- Added entity caching infrastructure in `settingsService.ts`
- Created `EntityBrowser` component with full filtering capabilities
- Added IPC handlers for entity operations (main.ts)
- Extended Home Assistant WebSocket service with `fetchAllEntities()`
- Integrated entity browser with both YAML editors

### Code Quality
- **Fixed Critical React Hooks Error** in EntityMultiSelect
  - Resolved "Rendered fewer hooks than expected" error
  - Moved all hooks execution before conditional returns
  - Ensures proper Rules of Hooks compliance

### UI/UX Improvements
- Entity browser shows connection status (Connected/Offline)
- Color-coded entity domains with badges
- Friendly name display alongside entity IDs
- Double-click to quickly select entities
- Responsive table with pagination
- Real-time search across entity ID, friendly name, state, and device class

---

## 📦 Installation

### Windows
Download and run: `HA Visual Dashboard Maker-0.1.0-beta.1 Setup.exe`

The installer will:
- Install the application to your system
- Create desktop shortcut
- Add to Start Menu
- Support automatic updates

---

## 🐛 Bug Fixes

- Fixed React hooks violation causing application crashes in EntityMultiSelect component
- Fixed linting error in EntityBrowser (let → const)
- Removed unused imports in YamlEditorDialog

---

## 🔄 Changes from v0.1.0-alpha.3

### New Components
- `EntityBrowser.tsx` - Full entity browsing modal (278 lines)
- Entity insertion callbacks in both YAML editors

### Modified Components
- `YamlEditorDialog.tsx` - Monaco editor integration
- `PropertiesPanel.tsx` - Monaco editor with entity insertion
- `EntityMultiSelect.tsx` - Fixed hooks error
- `App.tsx` - Entity browser state and integration
- `settingsService.ts` - Entity caching methods
- `haWebSocketService.ts` - Entity fetching
- `main.ts` - Entity IPC handlers
- `preload.ts` - Entity APIs

---

## 📝 Known Issues

- Antd deprecation warnings for `dropdownStyle`, `popupClassName`, and `direction` props (non-breaking)
- TypeScript lib check errors in node_modules (does not affect build)

---

## 🚀 What's Next

Future releases will focus on:
- Additional card types and renderers
- Template system improvements
- Enhanced camera streaming support
- More HACS card integrations
- Performance optimizations

---

## 🙏 Credits

Built with:
- Electron Forge
- React 19
- TypeScript
- Ant Design
- Monaco Editor
- Zustand state management
- Home Assistant WebSocket API

---

## 📋 Full Changelog

See the [commit history](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/compare/v0.1.0-alpha.3...v0.1.0-beta.1) for detailed changes.

### Commits in this release:
- Replace textarea with Monaco editor in Dashboard YAML Editor
- Fix React hooks error in EntityMultiSelect component
- Bump version to 0.1.0-beta.1

---

**Download:** [Releases Page](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/releases/tag/v0.1.0-beta.1)
**Issues:** [Report a Bug](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues)
**Documentation:** [README](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker#readme)
