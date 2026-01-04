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

#### 1. Dashboard Configuration Approach (UPDATED: Offline-First)

**Challenge**: No official API to read/write dashboards

**Solution - Offline-First with Explicit Deploy**:

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

---

## Code Organization Standards (Updated January 2026)

### Hybrid Organization Strategy

**Principle**: Organize code based on feature complexity, not arbitrary folder limits.

**Decision Matrix**:

| Feature Type | Criteria | Location | Example |
|-------------|----------|----------|---------|
| **Single Component** | 1 file, reusable, no complex state | `src/components/` | ColorPicker, FontSelector, GradientEditor |
| **Simple Service** | 1-2 files, utility functions | `src/services/` | smartActionService, fontService, animationService |
| **Complex Feature** | 3+ files, internal state, sub-components | `src/features/[name]/` | Entity Remapping, Carousel, Graphs |
| **Global Styles** | CSS/theming | `src/styles/` | animations.css |

### Updated Directory Structure

```
src/
├── components/          # Single-file reusable components
│   ├── ColorPicker.tsx          # react-colorful integration
│   ├── FontSelector.tsx          # Google Fonts selector
│   ├── GradientEditor.tsx        # Gradient configuration
│   ├── FavoriteColorsManager.tsx # Color palette manager
│   ├── ShadowControls.tsx        # Shadow configuration
│   ├── BorderControls.tsx        # Border configuration
│   ├── OpacityControls.tsx       # Opacity slider
│   ├── IconColorCustomizer.tsx   # Icon color overrides
│   ├── TypographyControls.tsx    # Full typography panel
│   └── ...
│
├── services/           # Utility services (1-2 files)
│   ├── smartActionService.ts     # Auto tap_action logic
│   ├── fontService.ts            # Google Fonts API, caching
│   ├── animationService.ts       # Animation CSS application
│   ├── styleService.ts           # CSS generation utilities
│   ├── contrastService.ts        # Accessibility contrast checks
│   ├── lenientValidationService.ts # Existing service
│   ├── yamlService.ts            # Existing service
│   └── ...
│
├── features/          # Complex multi-component features (NEW)
│   ├── entity-remapping/
│   │   ├── EntityRemappingDialog.tsx    # Main UI
│   │   ├── FuzzyEntityMatcher.ts        # Matching algorithm
│   │   ├── entityRemappingService.ts    # Business logic
│   │   ├── types.ts                     # Feature types
│   │   └── EntityRemappingDialog.test.tsx
│   │
│   ├── carousel/
│   │   ├── SwiperCarousel.tsx           # Swiper.js integration
│   │   ├── CarouselConfig.tsx           # Configuration UI
│   │   ├── carouselPresets.ts           # Default configs
│   │   ├── types.ts
│   │   └── SwiperCarousel.test.tsx
│   │
│   ├── graphs/
│   │   ├── NativeGraphsCard.tsx         # Recharts wrapper
│   │   ├── LineChart.tsx                # Chart variants
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── graphService.ts              # Data transformation
│   │   ├── types.ts
│   │   └── NativeGraphsCard.test.tsx
│   │
│   ├── logic-editor/
│   │   ├── VisualLogicEditor.tsx        # No-code builder
│   │   ├── ConditionBuilder.tsx         # Condition UI
│   │   ├── ActionBuilder.tsx            # Action UI
│   │   ├── FlowDiagram.tsx              # Visual flow
│   │   ├── logicService.ts              # Logic evaluation
│   │   ├── types.ts
│   │   └── VisualLogicEditor.test.tsx
│   │
│   ├── template-system/
│   │   ├── TemplateEditor.tsx           # Jinja2 editor
│   │   ├── TemplatePreview.tsx          # Live preview
│   │   ├── TemplateLibrary.tsx          # Snippets/templates
│   │   ├── templateService.ts           # Template engine
│   │   ├── types.ts
│   │   └── TemplateEditor.test.tsx
│   │
│   ├── preset-marketplace/
│   │   ├── PresetBrowser.tsx            # Marketplace UI
│   │   ├── PresetDetail.tsx             # Preset details
│   │   ├── PresetImporter.tsx           # Import logic
│   │   ├── presetService.ts             # API client
│   │   ├── types.ts
│   │   └── PresetBrowser.test.tsx
│   │
│   └── theme-manager/
│       ├── ThemeManager.tsx             # Theme UI
│       ├── ThemePreview.tsx             # Theme preview
│       ├── ThemeEditor.tsx              # Theme customization
│       ├── themeService.ts              # Theme application
│       ├── types.ts
│       └── ThemeManager.test.tsx
│
├── styles/             # Global CSS/theming
│   ├── animations.css              # Animation keyframes (NEW)
│   ├── theme.css                   # Existing theme
│   └── variables.css               # CSS variables
│
├── hooks/              # Reusable React hooks
│   ├── useRecentColors.ts          # Recent colors history (NEW)
│   ├── useGoogleFonts.ts           # Font loading hook (NEW)
│   ├── useEntityContext.ts         # Entity context variables (NEW)
│   ├── useSmartActions.ts          # Smart default actions (NEW)
│   └── ...
│
├── types/              # Shared TypeScript types
│   ├── animation.ts                # Animation config types (NEW)
│   ├── typography.ts               # Typography types (NEW)
│   ├── style.ts                    # Shadow/border types (NEW)
│   ├── entityContext.ts            # Entity context types (NEW)
│   └── ...
│
└── (existing structure)
    ├── main/           # Electron main process
    ├── preload/        # Electron preload scripts
    └── ...
```

### When to Use Feature Folders

Create a feature folder when:
1. **3+ related files** are needed for the feature
2. **Complex internal state** that doesn't belong in global store
3. **Sub-components** specific to the feature
4. **Feature-specific types** that aren't used elsewhere
5. **Feature-specific services/utilities**

Examples:
- ✅ Entity Remapping (dialog + matcher + service + types)
- ✅ Visual Logic Editor (multiple builders + flow diagram + service)
- ✅ Carousel (Swiper integration + config + presets)
- ❌ Color Picker (single component, no sub-components)
- ❌ Animation Service (utility service, no UI components)

### Co-location Benefits

Feature folders enable:
- **Easier refactoring** (all related code in one place)
- **Better testability** (tests co-located with implementation)
- **Clear boundaries** (feature doesn't leak into global state)
- **Independent evolution** (features can be updated/removed without affecting others)

### Migration Path for Existing Code

**Do NOT** migrate existing code to feature folders unless:
1. Actively working on that feature
2. Feature meets criteria for folder (3+ files, complexity)
3. Migration improves maintainability

**Existing code stays in current structure** (`src/components/`, `src/services/`) until there's a reason to move it.

---

## HAVDM Advanced Features

### Technology Choices

| Component | Selected Technology | Location | Rationale |
|-----------|-------------------|----------|-----------|
| **Color Picker** | react-colorful | `src/components/ColorPicker.tsx` | 2KB, modern, accessible |
| **Animations** | Custom CSS library | `src/styles/animations.css` + `src/services/animationService.ts` | Maximum flexibility, YAML storage |
| **Carousel/Slider** | Swiper.js v12+ | `src/features/carousel/` | Feature-rich, battle-tested |
| **Charts** | Recharts | `src/features/graphs/` | React-native, composable, SVG |
| **Fonts** | Google Fonts (CDN + cache) | `src/services/fontService.ts` + `src/assets/fonts/` | Best of both: speed online, works offline |

### Quality Standards for New Features

All new features MUST comply with:

1. **Testing Requirements**:
   - Unit tests for all services/utilities (95%+ coverage)
   - E2E tests using DSL (comprehensive scenarios)
   - Visual regression tests for UI components
   - Performance benchmarks for critical paths
   - Accessibility tests (WCAG 2.1 AA)

2. **Documentation Requirements**:
   - User-facing help text/tooltips in UI
   - Developer documentation in feature README
   - Feature documentation in `docs/features/`
   - Architecture decision records (if applicable)

3. **Accessibility Requirements**:
   - WCAG 2.1 AA compliance
   - Keyboard navigation fully functional
   - Screen reader compatible
   - Proper ARIA labels
   - Respect `prefers-reduced-motion`

4. **Internationalization**:
   - All user-facing strings translatable
   - Phase-based i18n rollout
   - English only in Phase 1, translations in later phases

5. **Backward Compatibility**:
   - Progressive enhancement (new features don't break old dashboards)
   - Auto-mapping for configuration changes
   - Graceful degradation for missing features

### Feature Development Workflow

For each new feature:

1. **Planning**:
   - Review feature user story in `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`
   - Check dependency requirements
   - Create technical design doc (if complex)

2. **Implementation**:
   - Follow code organization standards (component vs feature folder)
   - Write unit tests first (TDD approach)
   - Implement feature with compliance to standards
   - Add E2E tests using DSL pattern

3. **Quality Assurance**:
   - All tests passing (unit + E2E + visual + accessibility)
   - Performance benchmarks met
   - Code review completed
   - Documentation complete

4. **Integration**:
   - Merge to feature branch
   - Phase-based release testing
   - User acceptance testing (beta program)

---

## Performance Standards (Updated)

### Rendering Performance

- **60fps target**: All animations and interactions must maintain 60fps (16ms frame time)
- **Initial load**: < 2s to interactive for typical dashboard (10-20 cards)
- **Card rendering**: < 100ms per card initial render
- **YAML sync**: < 50ms bidirectional sync for typical changes

### Memory Constraints

- **Dashboard size**: Support dashboards with 100+ cards without degradation
- **Memory usage**: < 500MB for typical dashboard editing session
- **Memory leaks**: No detectable leaks over 1-hour editing session

### Bundle Size Targets

- **Main bundle**: < 2MB gzipped (current baseline)
- **Per-feature overhead**: < 50KB gzipped per major feature
- **Lazy loading**: Code split features that aren't always used
- **Font cache**: < 500KB total for pre-cached fonts

### Network Performance

- **Google Fonts loading**: < 200ms cached, < 2s uncached (with timeout fallback)
- **Entity fetching**: < 1s for typical HA instance (100-500 entities)
- **Preset marketplace**: < 3s to load preset list

---

## Security Considerations (Updated)

### New Security Requirements

1. **Font Loading**:
   - Google Fonts loaded over HTTPS only
   - CSP policy allows Google Fonts CDN
   - Local fallback prevents tracking concerns

2. **Preset Marketplace**:
   - Presets sandboxed during import
   - Entity remapping required (no hardcoded entity IDs executed blindly)
   - User review before import
   - Digital signatures for official presets (future)

3. **Template System**:
   - Jinja2 templates run in sandboxed environment
   - No code execution outside sandbox
   - Template validation before execution
   - Timeout protection for infinite loops

4. **Plugin System** (Phase 7):
   - Plugins run in isolated context
   - Strict CSP for plugin code
   - Permission model for API access
   - Code signing for official plugins (future)

---

## Accessibility Standards (Updated)

### WCAG 2.1 AA Compliance (Mandatory)

All new features must meet WCAG 2.1 Level AA:

1. **Perceivable**:
   - Color is not the only visual means of conveying information
   - Minimum contrast ratio 4.5:1 for normal text, 3:1 for large text
   - All non-text content has text alternatives
   - Visual information has non-visual alternatives (e.g., screen reader announcements)

2. **Operable**:
   - All functionality available via keyboard
   - No keyboard traps
   - Sufficient time for interactions (no aggressive timeouts)
   - No content that causes seizures (flashing < 3 times per second)
   - Respect `prefers-reduced-motion`

3. **Understandable**:
   - UI text is readable and understandable
   - Pages operate in predictable ways
   - Input errors are identified and described
   - Labels and instructions provided

4. **Robust**:
   - Compatible with current and future assistive technologies
   - Valid HTML/ARIA markup
   - Proper semantic structure

### Specific Requirements

- **Color Picker**: Keyboard navigation (tab, arrows), ARIA labels, screen reader value announcements
- **Animations**: Disabled when `prefers-reduced-motion: reduce`, never essential
- **Typography**: Respects user font size preferences, minimum 12px
- **Contrast**: Warnings when custom colors/opacity violate contrast ratios
- **Forms**: All inputs labeled, errors associated with inputs, validation messages clear

---

## References (Updated)

### New Dependencies

- [react-colorful](https://github.com/omgovich/react-colorful) - Color picker component
- [Swiper.js](https://swiperjs.com/) - Carousel/slider component
- [Recharts](https://recharts.org/) - React charting library
- [Google Fonts API](https://developers.google.com/fonts/docs/developer_api) - Font browsing and loading

### Existing References

- [Home Assistant Documentation](https://www.home-assistant.io/dashboards/)
- [REST API Documentation](https://developers.home-assistant.io/docs/api/rest/)
- [WebSocket API Documentation](https://developers.home-assistant.io/docs/api/websocket/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: January 4, 2026
**Next Review**: After Phase 1 completion (v0.4.0)
