# HA Visual Dashboard Maker - v0.1.0-alpha.1

**Release Date:** December 15, 2025
**Status:** Alpha - Early Testing

## Overview

First alpha release of HA Visual Dashboard Maker - a visual WYSIWYG editor for Home Assistant dashboards. This release includes core functionality for loading, editing, and saving dashboard YAML files with a visual grid-based interface.

## ✨ Features

### Dashboard Management
- ✅ Load existing Home Assistant dashboard YAML files
- ✅ Save modified dashboards back to YAML format
- ✅ Visual indication of unsaved changes (asterisk in title)
- ✅ File path display showing current dashboard location

### Card Palette
- ✅ **22 Standard Home Assistant card types** organized by category:
  - **Layout Cards:** Horizontal Stack, Vertical Stack, Grid, Spacer
  - **Sensor/Display Cards:** Entities, Glance, Sensor, Gauge, History Graph
  - **Control Cards:** Button, Light, Thermostat
  - **Information Cards:** Markdown, Picture, Picture Entity, Picture Glance, Map, Weather Forecast
  - **Media Cards:** Media Control
- ✅ Searchable card browser with real-time filtering
- ✅ Category-based organization with collapsible sections
- ✅ Visual icons and descriptions for each card type
- ✅ Badge showing number of cards in each category

### Grid Canvas
- ✅ Visual grid layout powered by react-grid-layout
- ✅ **Drag and drop** cards from palette to canvas
- ✅ **Resize cards** by dragging corners
- ✅ **Reposition cards** by dragging anywhere on the card
- ✅ Automatic vertical compaction (cards stack without gaps)
- ✅ 12-column responsive grid system
- ✅ Visual selection highlighting (cyan border)
- ✅ Special rendering for spacer cards (transparent with dashed border)

### Application Features
- ✅ Dark theme matching Home Assistant aesthetics
- ✅ Application menu with keyboard shortcuts:
  - `Ctrl+O` - Open dashboard
  - `Ctrl+S` - Save dashboard
  - `Ctrl+Shift+S` - Save As
  - `Ctrl+T` - Toggle theme
- ✅ Window state persistence (size, position, maximized state)
- ✅ Theme preference persistence
- ✅ Multi-view support with tab interface
- ✅ About dialog with version info and GitHub link

## 📦 Installation

### Windows
1. Download `HA Visual Dashboard Maker-0.1.0-alpha.1 Setup.exe`
2. Run the installer
3. The application will be installed and a desktop shortcut created
4. Launch from Start Menu or desktop shortcut

### File Size
- Installer: ~127 MB (includes Electron runtime and all dependencies)

## 🚀 Usage

### Getting Started
1. Launch HA Visual Dashboard Maker
2. Click "Open Dashboard" or press `Ctrl+O`
3. Select your Home Assistant dashboard YAML file
4. The dashboard will load with all views as tabs

### Adding Cards
**Method 1: Drag and Drop**
1. Browse the card palette on the left
2. Drag a card type onto the canvas
3. Card appears at the bottom of the layout
4. Drag the card to reposition it

**Method 2: Click to Add**
1. Click any card in the palette
2. Card is added to the current view at the bottom

### Editing Layout
- **Move Cards:** Click and drag any card to a new position
- **Resize Cards:** Drag the resize handle in the bottom-right corner
- **Select Cards:** Click on any card to select it (cyan border)
- **Switch Views:** Click view tabs at the top of the canvas

### Saving Changes
- Press `Ctrl+S` to save to the current file
- Press `Ctrl+Shift+S` to save to a new file
- Unsaved changes are indicated with an asterisk (*) in the title

## ⚠️ Known Limitations

This is an **alpha release** with the following known limitations:

### Not Yet Implemented
- ❌ **Properties Panel** - Cannot edit card properties (entities, titles, etc.) in the UI
  - Workaround: Edit the YAML file directly in a text editor
- ❌ **Real-time drag repositioning** - When dragging from palette, existing cards don't move aside automatically
  - Current: Cards appear at bottom, then manually reposition
  - This feature is in the backlog for a future release
- ❌ **Card deletion** - No UI to delete cards
  - Workaround: Edit YAML directly
- ❌ **Undo/Redo** - No undo/redo functionality
- ❌ **Custom card support** - Only standard HA cards supported
  - HACS and custom cards planned for Phase 13

### Limitations
- YAML file must be valid Home Assistant dashboard format
- Card properties cannot be edited visually (only layout)
- Some card types may not have accurate preview icons
- No validation of entity IDs or card configurations

## 🐛 Known Issues

- None reported yet (first release)

## 📝 Phase Status

This release completes Phases 1-4 of the development roadmap:

- ✅ **Phase 1:** Core Application Setup with React + Ant Design
- ✅ **Phase 2:** YAML Dashboard Loading
- ✅ **Phase 3:** Settings & Persistence
- ✅ **Phase 4:** Standard Card Support with Drag-and-Drop
- ⏳ **Phase 5:** Properties Panel (next priority)

## 🔮 Coming Soon (Phase 5)

The next release will focus on the **Properties Panel**:
- Edit card properties visually (entities, titles, icons, etc.)
- Entity browser with autocomplete
- Icon picker for cards
- Validation of entity IDs
- Real-time preview of changes

## 📋 System Requirements

- **OS:** Windows 10 or later (64-bit)
- **RAM:** 512 MB minimum, 1 GB recommended
- **Disk Space:** 300 MB for installation
- **Display:** 1280x720 minimum resolution

## 🤝 Contributing

This is an early alpha release. Feedback and bug reports are welcome!

- **GitHub:** https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker
- **Issues:** https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [Ant Design](https://ant.design/)
- Grid layout by [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- YAML parsing by [js-yaml](https://github.com/nodeca/js-yaml)

---

**Note:** This is an alpha release intended for early testing and feedback. Please backup your dashboard YAML files before editing them with this tool.
