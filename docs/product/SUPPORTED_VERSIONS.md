# Currently Supported Versions

**Document Version**: 1.0
**Project Version**: v0.4.3-beta.1
**Last Updated**: January 12, 2026
**Status**: Current Baseline

---

## Purpose

This document lists all versions of components, integrations, and dependencies currently supported by HA Visual Dashboard Maker v0.4.3-beta.1. This serves as the baseline for version comparison and update planning.

---

## Home Assistant Core & APIs

### Home Assistant Core
- **Minimum Supported Version**: 2023.1+
- **Tested Version**: 2024.x
- **Target Version**: 2026.1
- **API Type**: WebSocket API + REST API
- **Connection Method**: Long-lived access token

### Home Assistant WebSocket API
- **Protocol Version**: Auto-negotiated
- **Commands Used**:
  - `lovelace/dashboards/list`
  - `lovelace/config`
  - `subscribe_events`
  - `get_states`
  - `call_service`
- **Authentication**: Token-based (auth_required → auth → auth_ok)

### home-assistant-js-websocket
- **NPM Package**: `home-assistant-js-websocket`
- **Current Version**: `^9.6.0`
- **Source**: https://www.npmjs.com/package/home-assistant-js-websocket
- **GitHub**: https://github.com/home-assistant/home-assistant-js-websocket

---

## Standard Home Assistant Cards (Built-in)

### Fully Implemented (14/22)
| Card Type | Status | Renderer | Notes |
|-----------|--------|----------|-------|
| `alarm-panel` | ✅ Implemented | AlarmPanelCardRenderer.tsx | 247 lines |
| `button` | ✅ Implemented | ButtonCardRenderer.tsx | 92 lines |
| `entities` | ✅ Implemented | EntitiesCardRenderer.tsx | 182 lines |
| `gauge` | ✅ Implemented | GaugeCardRenderer.tsx | 186 lines |
| `glance` | ✅ Implemented | GlanceCardRenderer.tsx | 118 lines |
| `history-graph` | ✅ Implemented | HistoryGraphCardRenderer.tsx | 215 lines |
| `light` | ✅ Implemented | LightCardRenderer.tsx | 200 lines |
| `markdown` | ✅ Implemented | MarkdownCardRenderer.tsx | 81 lines |
| `media-control` | ✅ Implemented | MediaPlayerCardRenderer.tsx | 346 lines |
| `plant-status` | ✅ Implemented | PlantStatusCardRenderer.tsx | 323 lines |
| `sensor` | ✅ Implemented | SensorCardRenderer.tsx | 178 lines |
| `thermostat` | ✅ Implemented | ThermostatCardRenderer.tsx | 193 lines |
| `weather-forecast` | ✅ Implemented | WeatherForecastCardRenderer.tsx | 240 lines |
| `spacer` | ✅ Implemented | Layout element | Part of layout system |

### Placeholder/Partial (8/22)
| Card Type | Status | Notes |
|-----------|--------|-------|
| `conditional` | ⚠️ Placeholder | Contains UnsupportedCard reference |
| `grid` | ⚠️ Placeholder | Layout card |
| `horizontal-stack` | ⚠️ Placeholder | Layout card |
| `vertical-stack` | ⚠️ Placeholder | Layout card |
| `map` | ⚠️ Placeholder | Location display |
| `picture` | ⚠️ Placeholder | Image display |
| `picture-entity` | ⚠️ Placeholder | Image with entity |
| `picture-glance` | ⚠️ Placeholder | Multi-entity image |

---

## Custom HACS Cards (Supported)

### Fully Implemented (6 renderers, 19+ card types)

#### 1. ApexCharts Card
- **Card Type**: `custom:apexcharts-card`
- **Renderer**: ApexChartsCardRenderer.tsx (246 lines)
- **Version Supported**: Unknown (current as of implementation)
- **Priority**: Very High (Phase 7 - Priority #1)
- **GitHub**: https://github.com/RomRider/apexcharts-card
- **HACS**: ✅ Available

#### 2. Bubble Card
- **Card Type**: `custom:bubble-card`
- **Renderer**: BubbleCardRenderer.tsx (533 lines)
- **Version Supported**: **v3.1.0** (updated January 12, 2026)
- **Priority**: High (Phase 8)
- **Variants**: Button, Pop-up, Media player, Cover, Climate, Separator, **Sub-button** (new in v3.1.0)
- **GitHub**: https://github.com/Clooos/Bubble-Card
- **HACS**: ✅ Available
- **v3.1.0 Features Implemented**:
  - ✅ Sub-button rendering with entity state display
  - ✅ Sub-button types: button, slider, select
  - ✅ Icon positioning (top, bottom, left, right)
  - ✅ Custom sizing (width, height)
  - ✅ Entity picture support
  - ✅ Timer countdown display
  - ✅ Text scrolling animation
  - ✅ Sub-button-only card type (`card_type: 'sub_button'`)

#### 3. Better Thermostat UI Card
- **Card Type**: `custom:better-thermostat-ui-card`
- **Renderer**: BetterThermostatCardRenderer.tsx (220 lines)
- **Version Supported**: Unknown
- **Priority**: Medium
- **GitHub**: Unknown (to be verified)
- **HACS**: ✅ Available

#### 4. Mini Graph Card
- **Card Type**: `custom:mini-graph-card`
- **Renderer**: MiniGraphCardRenderer.tsx (199 lines)
- **Version Supported**: Unknown
- **Priority**: Medium (Phase 12)
- **GitHub**: https://github.com/kalkih/mini-graph-card
- **HACS**: ✅ Available

#### 5. Mushroom Cards (13 variants)
- **Card Types**: `custom:mushroom-*`
- **Renderer**: MushroomCardRenderer.tsx (257 lines, handles all variants)
- **Version Supported**: Unknown
- **Priority**: Medium (Phase 12)
- **Variants**:
  - Entity, Light, Person, Template, Cover
  - Climate, Fan, Humidifier, Lock
  - Media Player, Number, Select, Update, Vacuum
- **GitHub**: https://github.com/piitaya/lovelace-mushroom
- **HACS**: ✅ Available

#### 6. Power Flow Card
- **Card Type**: `custom:power-flow-card`
- **Renderer**: PowerFlowCardRenderer.tsx (333 lines)
- **Version Supported**: Unknown
- **Priority**: High (Phase 11 - Priority #5)
- **GitHub**: https://github.com/ulic75/power-flow-card
- **HACS**: ✅ Available

### Missing Renderers (38 card types)

**Priority 1 (Tier 1 - High Usage)**:
- ❌ `custom:card-mod` - CSS styling layer (CRITICAL)
- ❌ `custom:auto-entities` - Auto-populate entities
- ❌ `custom:vertical-stack-in-card` - Stack in bordered container
- ❌ `custom:mini-media-player` - Minimalistic media player
- ❌ `custom:multiple-entity-row` - Multiple entities per row
- ❌ `custom:button-card` - Advanced button (distinct from standard)

**Priority 2 (Tier 2 - Medium Usage)**:
- ❌ `custom:fold-entity-row` - Collapsible rows
- ❌ `custom:slider-entity-row` - Slider controls
- ❌ `custom:battery-state-card` - Battery tracking
- ❌ `custom:simple-swipe-card` - Swipe gestures
- ❌ `custom:decluttering-card` - Reusable templates

**Priority 3 (Surveillance/Camera)**:
- ❌ `custom:webrtc-camera` - Low-latency streaming
- ❌ `custom:surveillance-card` - Multi-camera view
- ❌ `custom:frigate-card` - Frigate NVR integration
- ❌ `custom:camera-card` - Enhanced camera with PTZ

---

## Key NPM Dependencies

### Core Framework

#### React
- **Package**: `react`
- **Current Version**: `^19.2.3`
- **Release Date**: December 2024
- **Source**: https://www.npmjs.com/package/react
- **Notes**: React 19 with Server Components, Suspense improvements

#### React DOM
- **Package**: `react-dom`
- **Current Version**: `^19.2.3`
- **Source**: https://www.npmjs.com/package/react-dom

---

### UI Components & Layout

#### Ant Design
- **Package**: `antd`
- **Current Version**: `^6.1.0`
- **Release Date**: 2024
- **Source**: https://www.npmjs.com/package/antd
- **GitHub**: https://github.com/ant-design/ant-design
- **Notes**: v6.x with new theme system

#### React Grid Layout
- **Package**: `react-grid-layout`
- **Current Version**: `^2.0.0`
- **Source**: https://www.npmjs.com/package/react-grid-layout
- **GitHub**: https://github.com/react-grid-layout/react-grid-layout
- **Notes**: Drag-and-drop grid system for dashboard layout

#### Allotment
- **Package**: `allotment`
- **Current Version**: `^1.20.5`
- **Source**: https://www.npmjs.com/package/allotment
- **Notes**: Split pane layouts (visual/YAML editor)

---

### Editor & Code

#### Monaco Editor
- **Package**: `monaco-editor`
- **Current Version**: `^0.55.1`
- **Source**: https://www.npmjs.com/package/monaco-editor
- **GitHub**: https://github.com/microsoft/monaco-editor
- **Notes**: VS Code editor component

#### @monaco-editor/react
- **Package**: `@monaco-editor/react`
- **Current Version**: `^4.7.0`
- **Source**: https://www.npmjs.com/package/@monaco-editor/react
- **Notes**: React wrapper for Monaco

#### monaco-yaml
- **Package**: `monaco-yaml`
- **Current Version**: `^5.4.0`
- **Source**: https://www.npmjs.com/package/monaco-yaml
- **GitHub**: https://github.com/remcohaszing/monaco-yaml
- **Notes**: YAML language support for Monaco

---

### Color & Visualization

#### react-colorful
- **Package**: `react-colorful`
- **Current Version**: `^5.6.1`
- **Source**: https://www.npmjs.com/package/react-colorful
- **GitHub**: https://github.com/omgovich/react-colorful
- **Notes**: Color picker component

#### ApexCharts
- **Package**: `apexcharts`
- **Current Version**: `^5.3.6`
- **Source**: https://www.npmjs.com/package/apexcharts
- **GitHub**: https://github.com/apexcharts/apexcharts.js
- **Notes**: Chart library

#### react-apexcharts
- **Package**: `react-apexcharts`
- **Current Version**: `^1.9.0`
- **Source**: https://www.npmjs.com/package/react-apexcharts
- **Notes**: React wrapper for ApexCharts

---

### State Management

#### Zustand
- **Package**: `zustand`
- **Current Version**: `^5.0.9`
- **Source**: https://www.npmjs.com/package/zustand
- **Notes**: Lightweight state management

---

### Electron & Desktop

#### Electron
- **Package**: `electron`
- **Current Version**: `39.2.7`
- **Release Date**: December 2024
- **Source**: https://www.npmjs.com/package/electron
- **GitHub**: https://github.com/electron/electron
- **Notes**: Chromium 130, Node.js 20.18.0, V8 13.0

#### Electron Forge
- **Package**: `@electron-forge/*`
- **Current Version**: `^7.10.2`
- **Source**: https://www.electronforge.io/
- **Notes**: Build and packaging toolchain

#### electron-store
- **Package**: `electron-store`
- **Current Version**: `^10.0.0`
- **Source**: https://www.npmjs.com/package/electron-store
- **Notes**: Settings persistence

---

### Material Design

#### @material/web
- **Package**: `@material/web`
- **Current Version**: `^2.4.1`
- **Source**: https://www.npmjs.com/package/@material/web
- **Notes**: Material Design 3 components

---

### Development Dependencies

#### TypeScript
- **Package**: `typescript`
- **Current Version**: `^5.7.3`
- **Source**: https://www.npmjs.com/package/typescript

#### Playwright
- **Package**: `@playwright/test`
- **Current Version**: `^1.57.0`
- **Source**: https://www.npmjs.com/package/@playwright/test
- **Notes**: E2E testing framework

#### Vite
- **Package**: `vite`
- **Current Version**: `^5.4.11`
- **Source**: https://www.npmjs.com/package/vite
- **Notes**: Build tool

---

## Integration Support

### Home Assistant Domains (Entity Types)
The application supports entity selection and smart defaults for:
- `switch` (toggle)
- `light` (toggle)
- `binary_sensor` (more-info)
- `sensor` (more-info)
- `climate` (more-info)
- `lock` (lock/unlock)
- `cover` (call-service open_cover/close_cover)
- `script` (turn_on)
- `automation` (toggle)
- `camera` (more-info)
- `media_player` (more-info)
- `fan` (toggle)
- `vacuum` (call-service start/return_to_base)

### Theme System
- **Integration**: Home Assistant theme API
- **Support**: Apply HA themes to dashboard preview
- **Feature Status**: Phase 2 Complete (v0.4.x)

### Dashboard Deployment
- **Method**: WebSocket API upload to Home Assistant
- **Format**: Lovelace YAML configuration
- **Target Dashboards**: New or existing dashboard paths

---

## Summary Statistics

### Card Support
- **Standard HA Cards**: 14/22 fully implemented (64%)
- **Custom HACS Cards**: 6 renderers (19+ card types)
- **Total Card Types Supported**: 33+
- **Missing High-Priority Cards**: 6 (Tier 1)

### Dependencies
- **Total NPM Packages**: 150+ (including dev dependencies)
- **Key Dependencies Tracked**: 15
- **Electron Version**: 39.2.7 (latest stable)
- **React Version**: 19.2.3 (latest)
- **Node.js Version**: 20.18.0 (via Electron)

### Home Assistant Compatibility
- **Minimum HA Version**: 2023.1+
- **WebSocket API**: Fully supported
- **REST API**: Limited use (token validation)
- **Domains Supported**: 13+ entity types

---

## Version Control

| Document Version | Date | Changes |
|-----------------|------|---------|
| 1.0 | 2026-01-12 | Initial baseline from v0.4.3-beta.1 |
| 1.1 | 2026-01-12 | Updated Bubble Card to v3.1.0 with all features implemented |

---

## Notes

- Version numbers marked "Unknown" require research to determine exact versions supported
- Card renderers were implemented without explicit version targeting
- HACS cards tested with versions available as of mid-2024
- Dependency versions use caret ranges (^) for automatic minor/patch updates
- Exact supported versions will be documented in VERSION_COMPARISON.md after research

---

**Next Step**: See [VERSION_COMPARISON.md](VERSION_COMPARISON.md) for comparison with latest versions and breaking changes analysis.
