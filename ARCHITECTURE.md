# Home Assistant Visual Dashboard Editor - Technical Architecture

## Executive Summary

This document outlines the technical architecture for a cross-platform desktop application that provides a visual WYSIWYG editor for Home Assistant dashboards with support for popular custom cards.

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
- **Dashboard API Limitation**: There is currently **NO official API endpoint** to retrieve or update Lovelace dashboard configurations via REST or WebSocket (as of January 2025). This is a known gap with open feature requests.

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

1. **No Official Dashboard API**: Must work with YAML files or explore undocumented endpoints
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
- **React 18+** with **TypeScript 5+**
- **Strict type safety** for Home Assistant configuration schemas

#### UI Component Library
- **Material-UI (MUI) v6** or **Ant Design v5**
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
- **HTTP Client**: `axios` for REST API calls
- **WebSocket Client**: Native WebSocket or `ws` library
- **Authentication**: Secure storage of long-lived access tokens
  - Windows: Windows Credential Manager via `keytar`
  - Linux: libsecret via `keytar`

### Data Architecture

#### Local Data Storage
- **Electron Store** for application settings
- **IndexedDB** for dashboard cache (offline editing)
- **File System** for YAML export/import

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

### Architecture Pattern: Feature-Based Modular Structure

```
src/
├── main/                      # Electron main process
│   ├── index.ts              # Main entry point
│   ├── ipc-handlers.ts       # IPC communication handlers
│   └── menu.ts               # Application menu
│
├── renderer/                  # Electron renderer process (React app)
│   ├── features/
│   │   ├── connection/       # HA connection management
│   │   ├── dashboard/        # Dashboard CRUD operations
│   │   ├── editor/           # Visual editor components
│   │   │   ├── Canvas.tsx
│   │   │   ├── CardPalette.tsx
│   │   │   ├── PropertyPanel.tsx
│   │   │   └── GridLayout.tsx
│   │   ├── cards/            # Card type implementations
│   │   │   ├── base/
│   │   │   ├── bubble-card/
│   │   │   ├── apexcharts/
│   │   │   ├── button-card/
│   │   │   └── card-mod/
│   │   ├── yaml-editor/      # Code view
│   │   └── preview/          # Live preview
│   │
│   ├── shared/
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # React hooks
│   │   ├── services/         # API services
│   │   │   ├── ha-api.ts
│   │   │   ├── yaml-service.ts
│   │   │   └── file-service.ts
│   │   ├── store/            # State management
│   │   └── types/            # TypeScript types
│   │
│   ├── App.tsx
│   └── index.tsx
│
├── shared/                    # Code shared between main and renderer
│   └── types/
│
└── package.json
```

### Key Design Decisions

#### 1. Dashboard Configuration Approach

**Challenge**: No official API to read/write dashboards

**Solutions** (in priority order):
1. **YAML File Mode** (Primary for MVP):
   - User provides path to HA config directory
   - Direct read/write to ui-lovelace.yaml files
   - Requires HA restart or manual refresh
   - **Pros**: Reliable, no API limitations
   - **Cons**: Not real-time, requires file system access

2. **WebSocket Exploration** (Post-MVP):
   - Investigate undocumented WebSocket commands
   - May use `lovelace/config` subscription (if exists)
   - **Risk**: Undocumented, may break with HA updates

3. **HTTP REST API** (Post-MVP):
   - Explore `/api/lovelace/config` endpoints
   - May require authentication escalation
   - **Risk**: Undocumented

**MVP Decision**: Focus on YAML file editing with clear user instructions for setup.

#### 2. Custom Card Detection

**Challenge**: No API to detect installed HACS cards

**Solution**:
- Manual selection: User indicates which custom cards are installed
- File system scanning (if user provides www/ directory path):
  - Scan for `custom-cards/` directory
  - Detect `.js` files matching known card patterns
- Future: Parse `ui-lovelace.yaml` resources section

#### 3. Card Rendering for Preview

**Options**:
1. **Embedded HA Instance** (Future): Embed actual HA frontend - complex but accurate
2. **Mock Rendering** (MVP): Simplified visual representations
3. **Screenshot/Iframe** (Post-MVP): Connect to live HA for real preview

**MVP Decision**: Mock rendering with clear visual indicators. Real preview requires embedding HA frontend (complex).

#### 4. Undo/Redo System

**Implementation**:
- Command pattern for all edit operations
- History stack in state management
- Support for complex operations (multi-card moves, property changes)

#### 5. Card-mod Handling

**Challenge**: CSS styling layer on top of other cards

**Solution**:
- Visual CSS editor with live preview
- Property panel shows both card config and card-mod styles
- Separate "Styles" tab in property editor
- CSS autocompletion for HA card selectors

## Data Flow

### Dashboard Loading Flow
```
User Action: Open Dashboard
  ↓
[File Service] Read YAML file
  ↓
[YAML Service] Parse YAML → JS Object
  ↓
[Validation Service] Validate schema
  ↓
[Dashboard Store] Load into state
  ↓
[Editor Canvas] Render visual representation
```

### Dashboard Saving Flow
```
User Action: Save Dashboard
  ↓
[Dashboard Store] Serialize current state
  ↓
[Validation Service] Validate configuration
  ↓
[Backup Service] Create backup of original
  ↓
[YAML Service] Convert to YAML
  ↓
[File Service] Write to file
  ↓
[Notification] Inform user to refresh HA
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
   - Use OS keychain (keytar library)
   - Never store in plaintext
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
5. **Jest** + **React Testing Library** for testing

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

These questions are detailed in REQUIREMENTS_QUESTIONNAIRE.md, but the critical ones are:

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
