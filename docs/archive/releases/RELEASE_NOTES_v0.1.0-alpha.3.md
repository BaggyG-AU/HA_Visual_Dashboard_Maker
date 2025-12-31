# Release Notes - v0.1.0-alpha.3

**Release Date**: December 24, 2025

## Overview

Alpha 3 release introduces **Camera Streaming Support**, **Dashboard Templates**, and **Advanced YAML Editing** to accelerate dashboard creation and provide better camera integration with Home Assistant.

## New Features

### Camera Streaming Integration
- **Stream component detection** - Automatically checks if Home Assistant's `stream:` component is enabled
- **Live camera support** - Configure cameras with live streaming or snapshot modes
- **Visual status indicators** - Success/warning alerts show stream component availability
- **Enhanced camera cards** - Added support for HACS camera cards:
  - `custom:frigate-card` - Advanced Frigate NVR integration
  - `custom:camera-card` - Enhanced camera card with PTZ controls
- **Camera configuration UI** - Picture Entity and Picture Glance cards now support:
  - `camera_image` - Select camera entity for live streaming
  - `camera_view` - Choose between Auto (snapshot) or Live (stream)
  - Camera icon placeholders showing camera name and view mode

### Dashboard Template System
- **7 professional templates** ready to use out of the box:
  - **Home Overview** - Central hub with weather, presence, quick actions, and status summaries
  - **Energy Management** - Power flow visualization, solar tracking, consumption analytics
  - **Security & Surveillance** - Alarm panel, cameras, locks, motion sensors, event history
  - **Climate & HVAC** - Multi-zone thermostats, temperature/humidity monitoring, automation controls
  - **Lighting Control** - Room-based controls, scenes, brightness/color control, energy monitoring
  - **Living Room** - Comprehensive room control (lights, climate, media, blinds, scenes)
  - **Media & Entertainment** - Media players, whole home audio, streaming services, activity scenes
- **Smart template recommendations** - Templates suggested based on your Home Assistant entities
- **Template metadata system** with:
  - Categories (Overview, Utilities, Security, Climate, Lighting, Rooms, Media)
  - Difficulty levels (Beginner, Intermediate, Advanced)
  - Required entities checking
  - Feature lists and tags for easy discovery
  - Template search by name, description, tags, or features
- **Template service** (`templateService.ts`) - Manages template discovery, loading, and entity validation

### YAML Editor
- **Direct YAML editing** - Edit raw YAML for advanced configurations
- **Syntax highlighting** - Color-coded YAML syntax for readability
- **Bidirectional sync** - Changes between visual editor and YAML stay in sync
- **Validation** - YAML parsing with error detection
- **Monaco Editor integration** - Professional code editor experience

### Enhanced Card Renderers
- **26 additional card renderers** implemented:
  - **HACS Custom Cards**: Bubble Card, Mushroom Card, Mini Graph Card
  - **Stack Cards**: Horizontal Stack, Vertical Stack (with nested card rendering)
  - **Conditional Cards**: Show/hide cards based on conditions
  - **Media**: Media Control card with playback controls
  - **Climate**: Thermostat, Better Thermostat (HACS)
  - **Lighting**: Light Card with brightness/color controls
  - **Security**: Alarm Panel Card
  - **Sensors**: Sensor Card, Gauge Card, History Graph
  - **Pictures**: Picture Card, Picture Entity, Picture Glance
  - **Utility**: Map Card, Plant Status, Weather Forecast
- **Improved card sizing** - All renderers follow the card sizing contract for consistent heights
- **Visual polish** - Better rendering to match Home Assistant's UI styling

### Service Layer Enhancements
- **`haConnectionService.ts`** improvements:
  - `fetchConfig()` - Retrieve Home Assistant configuration
  - `isComponentEnabled()` - Check if any component is enabled
  - `isStreamComponentEnabled()` - Specific check for camera streaming support
- **Card Registry** - Now includes 50+ card types (standard + HACS custom cards)
- **IPC Communication** - Template file path resolution via Electron main process

## Technical Improvements

### New Files Added
- **`src/services/templateService.ts`** - Template management service
- **`templates/templates.json`** - Template metadata and categories
- **`templates/*.yaml`** - 7 pre-built dashboard templates
- **26+ card renderer components** in `src/components/cards/`

### Updated Components
- **`PropertiesPanel.tsx`** - Added camera fields and stream component warnings
- **`PictureEntityCardRenderer.tsx`** - Camera icon display with entity name and view mode
- **`PictureGlanceCardRenderer.tsx`** - Camera icon display
- **`src/services/cardRegistry.ts`** - Expanded with HACS custom cards
- **`src/preload.ts`** - Added `getTemplatePath` API
- **`src/main.ts`** - Added template path IPC handler

### Type System Updates
- **`HAConfig` interface** - Home Assistant configuration structure with components array
- **Template interfaces** - DashboardTemplate, TemplateCategory, TemplateMetadata

## Template Details

### Template Categories

#### Overview
- **Home Overview** - Main dashboard showing overall home status
  - Weather forecast, person tracking, quick action scenes, status summaries

#### Utilities
- **Energy Management** - Energy consumption and solar monitoring
  - Power flow visualization, real-time consumption, solar tracking, cost monitoring

#### Security
- **Security & Surveillance** - Complete security monitoring
  - Alarm panel control, live camera feeds, door locks, motion detection

#### Climate
- **Climate & HVAC** - Temperature and HVAC control
  - Multi-zone thermostats, temperature/humidity monitoring, HVAC status

#### Lighting
- **Lighting Control** - Master light control panel
  - Room-based controls, scene buttons, brightness/color control, energy monitoring

#### Rooms
- **Living Room** - Comprehensive room control
  - All room lights, thermostat, media controls, window blinds, room scenes

#### Media
- **Media & Entertainment** - Media player control
  - Media players, whole home audio, streaming services, activity scenes, remote controls

### Using Templates

1. **Browse templates** - View all available templates by category
2. **Check compatibility** - See which required entities you have vs. need
3. **Load template** - One-click to load template YAML
4. **Customize** - Modify template to match your entity names and preferences
5. **Save** - Export as new dashboard or replace existing one

## Bug Fixes

- **Fixed: Card sizing inconsistencies** - All card renderers now follow sizing contract
- **Fixed: Stack card rendering** - Horizontal and vertical stacks properly render nested cards
- **Fixed: Properties panel** - Camera fields only show for picture-entity and picture-glance cards

## Known Limitations

### Camera Streaming
- **Live Preview limitations** - Camera live preview only shows in Home Assistant, not in the editor
  - Editor shows camera icon placeholder with entity name and view mode
  - Full camera feed visible when dashboard is loaded in Home Assistant
- **Stream component required** - Live streaming requires `stream:` in Home Assistant configuration
  - App automatically detects and warns if not enabled

### Templates
- **Entity name matching** - Templates use example entity names (e.g., `light.living_room_ceiling`)
  - You must update entity names to match your Home Assistant setup
  - Future releases will include entity mapping UI
- **Custom card dependencies** - Some templates use HACS custom cards
  - Install required HACS cards in Home Assistant before using templates
  - Cards show as placeholders in editor until installed in HA

### YAML Editor
- **No auto-completion** - YAML editor doesn't have entity or card type auto-completion yet
- **Limited validation** - Basic YAML syntax checking, no schema validation

## Migration Notes

### From Alpha 2 to Alpha 3

1. **No breaking changes** - All Alpha 2 dashboards continue to work
2. **New camera properties** - Picture Entity and Picture Glance cards can now use:
   - `camera_image: camera.entity_name`
   - `camera_view: live` or `camera_view: auto`
3. **Templates available** - Start new dashboards from templates or continue editing existing ones

## System Requirements

- **OS:** Windows 10 or later (64-bit)
- **RAM:** 512 MB minimum, 1 GB recommended
- **Disk Space:** 350 MB for installation
- **Display:** 1280x720 minimum resolution
- **Home Assistant:** 2023.1 or later for full compatibility

## What's Next (Alpha 4+)

Future releases will focus on:

- **Template Wizard** - Guided template selection with entity mapping
- **Entity Browser** - Browse and select entities from your Home Assistant instance
- **Custom Card Rendering** - Actual rendering for ApexCharts, Mini Graph, Bubble Card, etc.
- **Card Deletion** - Remove cards from canvas with keyboard shortcut
- **Undo/Redo** - Comprehensive undo/redo functionality
- **Live Preview** - Real-time preview using Home Assistant's frontend components
- **Icon Picker** - Visual icon selection for button and entity cards
- **Dashboard Backup** - Automatic backup before saving changes

## Contributors

- BaggyG-AU
- Claude Sonnet 4.5

## Resources

- **GitHub Repository**: https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker
- **Issue Tracker**: https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues
- **Home Assistant Docs**: https://www.home-assistant.io/dashboards/
- **Layout-Card (HACS)**: https://github.com/thomasloven/lovelace-layout-card
- **Stream Component Docs**: https://www.home-assistant.io/integrations/stream/

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [Ant Design](https://ant.design/)
- Grid layout by [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- YAML parsing by [js-yaml](https://github.com/nodeca/js-yaml)
- Code editing by [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

**Full Changelog**: [v0.1.0-alpha.2...v0.1.0-alpha.3](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/compare/v0.1.0-alpha.2...v0.1.0-alpha.3)

**Note:** This is an alpha release intended for early testing and feedback. Please backup your dashboard YAML files before editing them with this tool.
