# HA Visual Dashboard Maker - Technical Architecture

## Executive Summary

This document outlines the technical architecture for a cross-platform desktop application that provides a visual WYSIWYG editor for Home Assistant dashboards with support for popular custom cards.

**Key Architecture Decisions (Based on User Requirements)**:
1. **Offline-First Workflow**: Work on local dashboard copies with explicit "Deploy to Production" action
2. **Real-Time Bidirectional Sync**: Changes in YAML immediately reflect in visual editor and vice versa
3. **Full Card Rendering**: Actual card previews with dummy entity data (not simplified mockups)
4. **Entity Validation**: Visual warnings (exclamation icons) for missing/invalid entities
5. **Framework**: Electron + React + TypeScript (prioritizing development speed)
6. **Custom Card Priority**: ApexCharts → Bubble → Button → Card-mod → Power-flow-plus → Mushroom/Mini-graph

**Implementation Note (Current vs Target)**:
- The target architecture is **offline-first local workspace + explicit deploy**.
- The current implementation also supports **in-Home Assistant temporary dashboards** for editing and deployment.
- A full offline-first workspace model is tracked for a later release (see `havdm.kanban`).

## Research Findings

### Home Assistant Dashboard System

**Dashboard Modes:**
1. **UI Mode (Storage)**: Default mode where dashboards are stored in Home Assistant's internal storage and edited through the web UI
2. **YAML Mode**: Dashboards defined in YAML files (ui-lovelace.yaml) with version control capabilities
3. **Multiple Dashboards**: Support for multiple dashboard configurations with individual YAML files

**Key Insight**: As of 2025, Home Assistant introduced Sections and drag-and-drop functionality, making dashboards more flexible.

### Home Assistant API Architecture

**Important Discovery**:
- **REST API**: Not receiving new features but still supported. Used for basic CRUD operations.
- **WebSocket API**: Recommended for new integrations. Provides real-time updates and state streaming.
- **Lovelace Dashboards via WebSocket**: Home Assistant exposes WebSocket commands for Lovelace dashboard operations (e.g. list/read/write configs and create/delete dashboards). This project uses those commands via a main-process WebSocket client (`src/services/haWebSocketService.ts`) and renderer IPC (`src/preload.ts`, `src/main.ts`).
- **Compatibility Caveat**: Treat Lovelace WebSocket commands as an integration surface that can vary across Home Assistant versions. Keep compatibility testing and robust error handling for API changes.

**Authentication**: Long-lived access tokens via Bearer Authorization header

### Supported Custom Cards Research

#### 1. Bubble Card
- **Repository**: https://github.com/Clooos/Bubble-Card
- **Type**: Minimalist card collection with pop-up touch interface
- **Features**: Pop-ups, buttons, media players, covers, climate controls, separators
- **Installation**: Available via HACS
- **Complexity**: Medium - well-structured configuration options
- **Min HA Version**: 2023.9.0

#### 2. ApexCharts Card
- **Repository**: https://github.com/RomRider/apexcharts-card
- **Type**: Advanced graphs and charts based on ApexChartsJS
- **Features**: Highly customizable data visualization with extensive options
- **Installation**: Available via HACS
- **Complexity**: High - extensive configuration with many chart types and options
- **Special Considerations**: Requires understanding of data series, time ranges, and chart layouts

#### 3. Button Card
- **Repository**: https://github.com/custom-cards/button-card
- **Type**: Highly customizable button card
- **Features**: 6 action types (tap, hold, double-click), extensive templating, custom styling
- **Installation**: Available via HACS
- **Complexity**: High - extremely flexible with templating system
- **Special Considerations**: Template support makes visual editing challenging

#### 4. Card-mod
- **Repository**: https://github.com/thomasloven/lovelace-card-mod
- **Type**: Plugin (not a card) that adds CSS styling to any card
- **Features**: CSS injection for styling any Lovelace card
- **Installation**: Available via HACS, can be installed as frontend module
- **Complexity**: Very High - requires CSS knowledge
- **Special Considerations**: This is a meta-plugin that modifies other cards - requires special handling in visual editor

### Technical Challenges Identified

1. **Dashboard API Compatibility**: Lovelace dashboard WebSocket commands may change across HA versions; must handle failures and test compatibility
2. **Custom Card Detection**: No API to detect installed HACS cards
3. **Card-mod Complexity**: CSS styling system requires visual CSS editor
4. **Template Support**: Button-card and others use Jinja2 templates - difficult to visualize

## Proposed Technology Stack

### Recommended: Electron + React + TypeScript

**Rationale:**
- **Cross-platform**: Single codebase for Windows and Linux
- **Visual Editor Libraries**: Excellent ecosystem for drag-and-drop and visual editing
- **Development Speed**: Fastest path to MVP
- **Home Assistant Integration**: Node.js libraries available for YAML parsing
- **Future Extensibility**: Easy to add plugins and extensions

**Alternative Considered**: Tauri + React
- **Pros**: Smaller binary, better performance, more secure
- **Cons**: Smaller ecosystem, more complex setup, newer framework
- **Recommendation**: Consider for v2.0 after MVP validation

### Frontend Stack

#### Core Framework
- **React** with **TypeScript**
- **Strict type safety** for Home Assistant configuration schemas
- **Planned Remediation**: Upgrade TypeScript to v5+ in a later release (tracked in `havdm.kanban`).

#### UI Component Library
- **Ant Design v6**
  - Professional components
  - Theme support (light/dark modes)
  - Comprehensive form controls

#### Visual Editor Components
- **React Flow** or **React Grid Layout**
  - Drag-and-drop card positioning
  - Visual canvas for dashboard layout
  - Grid system matching Home Assistant's layout

- **Monaco Editor** (VS Code's editor)
  - YAML editing with syntax highlighting
  - Split view: Visual + Code
  - IntelliSense for HA configuration

#### State Management
- **Zustand** or **Redux Toolkit**
  - Application state
  - Dashboard configuration state
  - Undo/redo history

#### CSS Editor (for card-mod)
- **Monaco Editor CSS mode** or **React CSS Editor**
  - Live preview of CSS changes
  - Syntax highlighting

### Backend/Integration Layer

#### File System Access
- **Electron IPC** for secure file system operations
- **YAML Parser**: `js-yaml` library
- **YAML Schema Validation**: Custom schemas for HA dashboard config

#### Home Assistant Integration
- **HTTP Client**: Renderer uses `window.electronAPI.haFetch` (IPC wrapper over main-process fetch) to bypass CORS (`src/preload.ts`, `src/main.ts`, `src/services/haConnectionService.ts`)
- **WebSocket Client**: `ws` in the Electron main process (`src/services/haWebSocketService.ts`)
- **Authentication**: Secure storage of long-lived access tokens
  - Stored in `electron-store` with encryption via Electron `safeStorage` where available (`src/services/credentialsService.ts`)
  - If `safeStorage` encryption is unavailable, tokens may fall back to plaintext with warnings (see `safeStorage.isEncryptionAvailable()` checks)

### Data Architecture

#### Local Data Storage
- **Electron Store** for application settings and cached data
- **File System** (via Electron IPC) for YAML import/export and related assets
- **LocalStorage** (targeted, renderer-only) for small UX state like recent colors (where applicable)

#### Dashboard Configuration Schema
```typescript
interface DashboardConfig {
  title: string;
  views: View[];
  // ... HA Lovelace schema
}

interface View {
  title?: string;
  path?: string;
  type?: 'sections' | 'panel' | 'sidebar';
  cards: Card[];
  sections?: Section[];
}

interface Card {
  type: string; // 'entities', 'custom:button-card', etc.
  config: Record<string, any>;
  layout?: GridLayout;
}
```

## Application Architecture

### Architecture Pattern: Current Project Structure (Repository)

```
src/
├── main.ts                 # Electron main process entry + IPC handlers
├── preload.ts              # Electron preload (contextBridge APIs)
├── renderer.tsx            # React renderer entry
├── menu.ts                 # Application menu
├── components/             # React components (UI)
├── services/               # Services (IPC clients, HA integration, etc.)
├── store/                  # Zustand stores and state management
├── schemas/                # JSON schemas (e.g. HA dashboard schema)
├── utils/                  # Shared helpers/utilities
└── types/                  # TypeScript types
```

### Key Design Decisions

#### 1. Dashboard Configuration Approach (UPDATED: Offline-First)

**Challenge**: Dashboard operations need to be safe and compatible across Home Assistant versions

**Solution - Offline-First with Explicit Deploy**:

**Current Implementation Note**:
- In addition to local file import/export, the app can create/update a temporary dashboard in Home Assistant for editing and then deploy it to production via Lovelace WebSocket commands.
- A full offline-first local workspace model (local dashboard cache/workspace as the primary edit target) is tracked for a later release (see `havdm.kanban`).

**Local Workspace (Primary)**:
- All editing happens on local copy of dashboard
- User explicitly loads dashboard from:
  - YAML file
  - JSON file
  - HA instance (download to local)
- Changes saved to local workspace automatically
- Visual indicator shows "local" vs "synced with HA"

**Deploy to Production**:
- Explicit "Deploy to Production" button
- Deployment workflow:
  1. Validate configuration
  2. Connect to HA instance
  3. Create backup of current production dashboard
  4. Preview changes (diff view)
  5. User confirms deployment
  6. Upload to HA instance
  7. Verify deployment success
  8. Option to rollback if issues detected

**Import/Export**:
- Export to YAML (for YAML mode dashboards)
- Export to JSON (for storage mode dashboards)
- Import from both formats
- Support for dashboard cloning

**MVP Decision**: Offline-first editing with explicit deploy workflow. No real-time sync to prevent accidental production changes.

#### 2. Custom Card Detection & Unsupported Cards

**Challenge**: No API to detect installed HACS cards

**Solution**:
- **Auto-detection from HA**: Fetch installed custom cards from HA instance
- **Manual selection**: User can manually enable/disable card support in editor
- **Unsupported card handling** (per user requirement):
  - Display message with card type details
  - Provide link to GitHub Issues to request support
  - Track what cards users want
  - Allow basic YAML editing for unsupported cards
  - Show visual placeholder with card type name

#### 3. Card Rendering for Preview (UPDATED: Full Rendering)

**User Requirement**: Render full card previews with dummy data for entities (not simplified representations)

**Implementation Strategy**:
1. **Card Component Library**: Build React components that mimic actual HA card rendering
2. **Dummy Data System**: Generate realistic dummy data for entity types:
   - sensor.temperature → "21.5°C"
   - light.living_room → {state: "on", brightness: 80}
   - switch.fan → {state: "off"}
3. **Entity Type Detection**: Infer entity type from entity_id pattern
4. **Style Replication**: Match HA card styles as closely as possible
5. **Card-Specific Renderers**: Custom renderer for each supported card type

**Challenges**:
- Maintaining visual parity with actual HA cards
- Handling card-mod CSS styling in preview
- ApexCharts rendering without real historical data

**Solution**:
- Start with best-effort visual approximation
- Iterate based on user feedback
- Document differences between preview and actual HA rendering

#### 4. Entity Validation System (NEW)

**User Requirement**: Validate entities exist and show exclamation icon for missing entities

**Implementation**:
1. **Entity Registry Cache**: Fetch and cache available entities from HA
2. **Validation Service**:
   - Check each entity_id in dashboard config
   - Compare against registry cache
   - Track validation state per card
3. **Visual Indicators**:
   - Exclamation icon overlay on cards with missing entities
   - Tooltip showing which entities are missing
   - Color-coded warnings (yellow for missing, red for invalid format)
4. **Validation Panel**:
   - List all validation issues
   - Click to navigate to problematic card
   - Suggestions for fixing (typos, similar entities)
5. **Offline Handling**:
   - If no HA connection, show "Unable to validate" status
   - Don't block editing for missing entities
   - Warn on deploy if entities can't be validated

**Validation Triggers**:
- On dashboard load
- On entity property change
- On explicit "Validate" button click
- Before deployment to production

#### 5. Real-Time YAML ↔ Visual Sync (NEW)

**User Requirement**: Changes in YAML immediately reflected in visual editor

**Implementation Strategy**:
1. **Single Source of Truth**: Dashboard config object in state
2. **Bidirectional Watchers**:
   - Visual changes → Update state → Update YAML view
   - YAML changes → Parse → Update state → Update visual view
3. **Change Detection**: Debounce YAML parsing (500ms) to avoid excessive re-renders
4. **Error Handling**:
   - Invalid YAML → Show inline errors, don't update visual
   - Visual changes → Always valid, safe to update YAML
5. **Cursor Preservation**: Maintain YAML cursor position on updates

**Technical Approach**:
- Use React state management (Zustand/Redux)
- YAML parser with validation
- Monaco Editor change events
- Optimized re-rendering with React.memo

#### 6. Undo/Redo System

**User Requirement**: Full undo/redo support

**Implementation**:
- Command pattern for all edit operations
- History stack in state management
- Support for complex operations (multi-card moves, property changes)
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

#### 7. Card-mod Handling

**Challenge**: CSS styling layer on top of other cards

**Solution**:
- Visual CSS editor with live preview
- Property panel shows both card config and card-mod styles
- Separate "Styles" tab in property editor
- CSS autocompletion for HA card selectors

## Data Flow

### Dashboard Loading Flow (Offline-First)
```
User Action: Open Dashboard (from file/HA/new)
  ↓
[Import Service] Fetch from source (YAML/JSON/HA API)
  ↓
[YAML/JSON Parser] Parse → JS Object
  ↓
[Validation Service] Validate schema
  ↓
[Local Workspace] Save to local workspace
  ↓
[Dashboard Store] Load into state
  ↓
[Entity Validation] Check entities (if HA connected)
  ↓
[Editor Canvas] Render visual representation with warnings
  ↓
[YAML View] Display synchronized YAML
```

### Real-Time Edit Flow
```
User Action: Edit in Visual Editor OR Edit YAML
  ↓
[Change Handler] Detect change
  ↓
[Dashboard Store] Update state (single source of truth)
  ↓
[Bidirectional Sync]
  ├─→ [Visual View] Re-render cards (if YAML changed)
  └─→ [YAML View] Update Monaco editor (if visual changed)
  ↓
[Entity Validation] Re-validate affected entities
  ↓
[Auto-Save] Save to local workspace
  ↓
[Status Indicator] Mark as "Modified (not deployed)"
```

### Deploy to Production Flow
```
User Action: Click "Deploy to Production"
  ↓
[Pre-Deploy Validation]
  ├─→ Validate YAML syntax
  ├─→ Validate entities exist
  └─→ Check HA connection
  ↓
[Deploy Service] Connect to HA instance
  ↓
[Backup Service] Download current production dashboard
  ↓
[Diff View] Show changes to user
  ↓
[User Confirmation] Approve deployment
  ↓
[Upload] Send to HA instance (REST/WebSocket)
  ↓
[Verification] Confirm deployment successful
  ↓
[Status Update] Mark workspace as "Synced with HA"
  ↓
[Notification] "Deployment successful" (or show rollback option)
```

### Home Assistant Connection Flow (Future)
```
User: Enter HA URL + Token
  ↓
[Connection Service] Test connection (GET /api/)
  ↓
[WebSocket Service] Establish WS connection
  ↓
[Entity Service] Fetch available entities
  ↓
[Store] Cache entities for autocomplete
  ↓
[UI] Show connection status
```

## Security Considerations

1. **Credential Storage**:
   - Store credentials in `electron-store` with access tokens encrypted via Electron `safeStorage` when available (`safeStorage.isEncryptionAvailable()`)
   - If `safeStorage` encryption is unavailable, tokens may fall back to plaintext with warnings (see `src/services/credentialsService.ts`)
   - Clear credentials on logout

2. **File System Access**:
   - Sandbox file operations via Electron IPC
   - Validate file paths
   - User confirmation before overwrites

3. **YAML Parsing**:
   - Use safe YAML parsing (avoid code execution)
   - Validate against schemas

4. **Remote Connections**:
   - Enforce HTTPS for remote HA instances
   - Certificate validation
   - Token transmission only over secure channels

## MVP Feature Scope

### Phase 1: Core Editor (MVP)
1. YAML file loading and parsing
2. Visual grid-based canvas
3. Standard HA cards (entities, button, picture, markdown)
4. Drag-and-drop card positioning
5. Basic property editing
6. YAML code view (split view)
7. Save to YAML file
8. Basic validation

### Phase 2: Custom Cards
1. Bubble Card support
2. Button Card support (basic config, no templates)
3. Card detection from user input
4. Enhanced property editors

### Phase 3: Advanced Features
1. ApexCharts Card support
2. Card-mod CSS styling
3. Template editor for button-card
4. Entity browser (requires HA connection)
5. Undo/redo
6. Dashboard templates

### Phase 4: HA Integration
1. WebSocket connection to HA
2. Live entity states in preview
3. Direct dashboard read/write (if API available)
4. Entity autocomplete
5. Real-time preview

## Development Approach

### Technology Setup
1. **Electron Forge** for project scaffolding and building
2. **Vite** for fast React development
3. **TypeScript** strict mode
4. **ESLint** + **Prettier** for code quality
5. **Vitest** + **React Testing Library** for unit tests; **Playwright** for E2E/integration tests (see `docs/testing/TESTING_STANDARDS.md` and `docs/testing/PLAYWRIGHT_TESTING.md`)

### Project Initialization
```bash
npm create @quick-start/electron electron-app
# Choose: React + TypeScript + Vite
```

### Build & Distribution
- **Windows**: NSIS installer (.exe)
- **Linux**: AppImage, .deb, .rpm
- **Auto-updater**: electron-updater (post-MVP)

## Open Questions for User

These questions are detailed in `docs/research/REQUIREMENTS_QUESTIONNAIRE.md`, but the critical ones are:

1. **Authentication**: Should the app store HA credentials or ask each time?
2. **Primary Use Case**: Edit existing dashboards or create new ones from scratch?
3. **File Access**: Can you provide the app access to your HA config directory?
4. **HA Version**: What version of Home Assistant do you run?
5. **Custom Cards**: Which custom cards do you currently use?
6. **Priority**: Which custom card support is most important to you?

## Success Criteria

### MVP Success
- Load a YAML dashboard and display it visually
- Move cards via drag-and-drop
- Edit card properties via visual forms
- Save changes back to YAML
- Support at least 5 standard HA card types

### Full Success
- Support all 4 target custom cards (bubble, apexcharts, button, card-mod)
- Real-time preview with HA connection
- Template editor
- Professional UX matching modern design tools

## References

### Home Assistant Documentation
- [Multiple Dashboards](https://www.home-assistant.io/dashboards/dashboards/)
- [REST API Documentation](https://developers.home-assistant.io/docs/api/rest/)
- [WebSocket API Documentation](https://developers.home-assistant.io/docs/api/websocket/)
- [WebSocket API Integration](https://www.home-assistant.io/integrations/websocket_api/)

### Custom Cards
- [Bubble Card GitHub](https://github.com/Clooos/Bubble-Card)
- [ApexCharts Card GitHub](https://github.com/RomRider/apexcharts-card)
- [Button Card GitHub](https://github.com/custom-cards/button-card)
- [Card-mod GitHub](https://github.com/thomasloven/lovelace-card-mod)

### Community Resources
- [Bubble Card Community Thread](https://community.home-assistant.io/t/bubble-card-a-minimalist-card-collection-for-home-assistant-with-a-nice-pop-up-touch/609678)
- [ApexCharts Community Thread](https://community.home-assistant.io/t/apexcharts-card-a-highly-customizable-graph-card/272877)
- [Card-mod Community Thread](https://community.home-assistant.io/t/card-mod-add-css-styles-to-any-lovelace-card/120744)

### Tools
- [Card-mod Helper Tool](https://matt8707.github.io/card-mod-helper/)

---

## Roadmap & Standards (Planned)

Longer-term architecture standards, performance targets, and roadmap items are maintained separately in `docs/architecture/ARCHITECTURE_ROADMAP.md`.

Planned remediation items (post `v0.4.0`):
- Offline-first local workspace model (tracked in `havdm.kanban`)
- TypeScript upgrade to v5+ (tracked in `havdm.kanban`)

---

**Last Updated**: January 9, 2026
