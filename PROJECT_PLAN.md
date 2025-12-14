# Project Plan - HA Visual Dashboard Maker

## Overview

This document outlines the phased development plan for the HA Visual Dashboard Maker, based on confirmed user requirements.

## Key Design Principles (from Requirements)

1. **Offline-first workflow**: Work on local dashboard copy, explicit deployment to "production" HA instance
2. **Full validation**: Entity existence validation with visual indicators for missing entities
3. **Real-time sync**: YAML ↔ Visual editor changes reflected immediately
4. **Actual card rendering**: Full card previews with dummy entity data (not simplified representations)
5. **Framework**: Electron + React + TypeScript (prioritizing development speed)

## Development Phases

### Phase 0: Foundation ✅ COMPLETE
**Status**: Complete
**Goal**: Establish project requirements, architecture, and initial structure

**Tasks**:
- [x] Requirements gathering questionnaire
- [x] Architecture design and documentation
- [x] Technology stack selection (Electron + React + TypeScript)
- [x] Initial project structure
- [x] User requirements collected and analyzed
- [x] MVP scope finalized
- [x] Git repository created and pushed to GitHub

**Deliverables**:
- REQUIREMENTS_QUESTIONNAIRE.md (completed with user answers)
- ARCHITECTURE.md
- README.md
- Git repository: https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker

**Key Decisions Made**:
- Framework: Electron + React + TypeScript
- Offline-first workflow with explicit deploy
- Entity validation with visual warnings
- Custom card priority: ApexCharts → Bubble → Button → Card-mod → Power-flow-plus

---

### Phase 1: Core Application Setup
**Timeline**: TBD based on user requirements
**Goal**: Working Electron application with basic UI

**Tasks**:
1. Initialize Electron Forge project with React + TypeScript
2. Set up development environment (ESLint, Prettier, TypeScript configs)
3. Create basic application shell
   - Main window
   - Menu bar
   - Application settings
4. Implement file system access via IPC
5. Set up basic UI layout (Material-UI or Ant Design)
6. Configure build pipeline for Windows and Linux

**Deliverables**:
- Runnable Electron application
- Basic UI framework
- Build configuration

**Acceptance Criteria**:
- Application launches on Windows and Linux
- Can open file dialogs
- Basic menu works
- Dark/light theme support

---

### Phase 2: YAML Dashboard Loading (MVP Core)
**Timeline**: TBD
**Goal**: Load and parse Home Assistant YAML dashboards

**Tasks**:
1. Implement YAML parser (js-yaml integration)
2. Create HA dashboard schema definitions (TypeScript types)
3. Implement dashboard validation
4. Create file browser for opening dashboard YAML files
5. Parse dashboard into internal state representation
6. Display basic dashboard structure (tree view)
7. Error handling for invalid YAML

**Deliverables**:
- YAML loading functionality
- Dashboard state management
- Validation system

**Acceptance Criteria**:
- Can open and parse ui-lovelace.yaml files
- Validates against HA schema
- Shows clear error messages for invalid files
- Displays dashboard structure in UI

---

### Phase 3: Visual Editor Canvas
**Timeline**: TBD
**Goal**: Visual representation of dashboard with grid layout

**Tasks**:
1. Implement grid layout system (matching HA's grid)
2. Render cards as visual placeholders
3. Implement drag-and-drop functionality (react-grid-layout)
4. Card selection and highlighting
5. View switching (if dashboard has multiple views)
6. Zoom and pan controls
7. Responsive canvas sizing

**Deliverables**:
- Visual dashboard canvas
- Drag-and-drop system
- Grid layout engine

**Acceptance Criteria**:
- Dashboard displays visually with cards in correct positions
- Can drag cards to reposition them
- Grid system matches HA behavior
- Multiple views supported

---

### Phase 4: Standard Card Support
**Timeline**: TBD
**Goal**: Support for Home Assistant's built-in card types

**Tasks**:
1. Implement card type registry
2. Create visual renderers for standard cards:
   - Entities card
   - Button card (standard)
   - Picture card
   - Markdown card
   - Horizontal/Vertical stack
   - Grid card
3. Property editor panel (right sidebar)
4. Form-based property editing for each card type
5. Real-time preview updates

**Deliverables**:
- 6-8 standard card type implementations
- Property editor UI
- Card palette/library

**Acceptance Criteria**:
- Can add standard HA cards from palette
- Property editor shows card-specific options
- Changes reflect immediately in canvas
- Card properties validated

---

### Phase 5: YAML Code Editor
**Timeline**: TBD
**Goal**: Dual view with visual and code editing

**Tasks**:
1. Integrate Monaco Editor
2. Configure YAML syntax highlighting
3. Implement YAML schema-based autocomplete
4. Create split view (visual | code)
5. Two-way sync between visual and code views
6. YAML formatting and validation in editor
7. Line highlighting for selected card

**Deliverables**:
- Monaco-based YAML editor
- Split view functionality
- Bidirectional sync

**Acceptance Criteria**:
- Can edit YAML directly
- Changes in code reflect in visual view
- Changes in visual reflect in code
- Autocomplete works for HA config
- YAML validation shows errors inline

---

### Phase 6: Save Functionality
**Timeline**: TBD
**Goal**: Save dashboard changes to YAML files

**Tasks**:
1. Implement YAML serialization
2. Create backup system (auto-backup before save)
3. Save dialog with options
4. Dirty state tracking (unsaved changes indicator)
5. Format preservation (comments, ordering)
6. Save validation (ensure valid YAML)
7. User notifications and confirmation

**Deliverables**:
- Save functionality
- Backup system
- Change tracking

**Acceptance Criteria**:
- Can save dashboard to YAML file
- Creates backup of original
- Preserves YAML formatting where possible
- Warns on unsaved changes
- Validates before saving

---

### Phase 7: ApexCharts Card Support (Priority #1)
**Timeline**: TBD
**Goal**: Data visualization with ApexCharts (User Priority: First)

**Tasks**:
1. Analyze ApexCharts card schema
2. TypeScript types for ApexCharts
3. Visual renderer with dummy data preview
4. Property editor for:
   - Chart type selection
   - Series configuration
   - Time ranges
   - Options
5. Series editor UI
6. Chart preview (mock data)

**Deliverables**:
- ApexCharts card implementation
- Chart configuration UI

**Acceptance Criteria**:
- Can create ApexCharts cards
- Configure multiple series
- Select chart types
- Visual preview shows chart with dummy data

---

### Phase 8: Bubble Card Support (Priority #2)
**Timeline**: TBD
**Goal**: Full support for Bubble Card custom card (User Priority: Second)

**Tasks**:
1. Analyze Bubble Card configuration schema
2. Create TypeScript types for Bubble Card
3. Implement visual renderer for Bubble Card types:
   - Button
   - Pop-up
   - Media player
   - Cover
   - Climate
   - Separator
4. Create property editors for Bubble Card
5. Add Bubble Card to palette
6. Documentation for Bubble Card features

**Deliverables**:
- Bubble Card implementation
- Bubble Card-specific UI

**Acceptance Criteria**:
- Can add all Bubble Card types
- Property editors for all Bubble options
- Visual preview approximates actual card
- Configuration exports correctly

---

### Phase 9: Button Card Support (Priority #3)
**Timeline**: TBD
**Goal**: Basic Button Card support without templates (User Priority: Third)

**Tasks**:
1. Analyze Button Card schema
2. TypeScript types for Button Card
3. Visual renderer for Button Card
4. Property editor for basic options:
   - Entity
   - Name, icon
   - Tap/hold/double-click actions
   - Styles (basic)
5. Template editor (placeholder for Phase 11)

**Deliverables**:
- Basic Button Card support
- Action editors

**Acceptance Criteria**:
- Can create Button Cards with basic config
- Action configuration works
- Basic styling options available
- Templates shown as YAML (no visual editor yet)

---

### Phase 10: Card-mod Support (Priority #4)
**Timeline**: TBD
**Goal**: CSS styling layer for all cards (User Priority: Fourth)

**Tasks**:
1. Analyze card-mod structure
2. CSS editor integration (Monaco CSS mode)
3. Style injection visualization
4. Card-mod property panel (separate tab)
5. CSS autocomplete for HA selectors
6. Live CSS preview
7. Common style templates

**Deliverables**:
- Card-mod CSS editor
- Style templates

**Acceptance Criteria**:
- Can add card_mod to any card
- CSS editor with syntax highlighting
- Style changes preview in visual editor
- Autocomplete for common selectors

---

### Phase 11: Power Flow Card Plus Support (Priority #5)
**Timeline**: TBD
**Goal**: Power flow visualization (User Priority: Sixth)

**Tasks**:
1. Analyze power-flow-card-plus schema
2. TypeScript types
3. Visual renderer with dummy energy data
4. Property editor for power flows
5. Entity mapping for solar/grid/battery

**Deliverables**:
- Power Flow Card Plus implementation

**Acceptance Criteria**:
- Can create power flow cards
- Configure energy entities
- Visual preview shows flow diagram

---

### Phase 12: Mushroom & Mini-Graph Cards (Priority #6)
**Timeline**: TBD
**Goal**: Support for Mushroom cards and mini-graph-card (User Priority: Seventh)

**Tasks**:
1. Mushroom card family support
2. Mini-graph-card support
3. Property editors for both
4. Visual renderers

**Deliverables**:
- Mushroom cards support
- Mini-graph-card support

---

### Phase 13: Home Assistant Connection
**Timeline**: TBD
**Goal**: Connect to live HA instance

**Tasks**:
1. Connection settings UI
2. HA REST API client
3. Authentication with long-lived tokens
4. Secure credential storage (keytar)
5. WebSocket connection
6. Entity fetching and caching
7. Entity browser/picker
8. Connection status indicator

**Deliverables**:
- HA connection system
- Entity browser
- Credential management

**Acceptance Criteria**:
- Can connect to HA instance
- Credentials stored securely
- Fetches available entities
- Entity picker for card configuration

---

### Phase 14: Deploy to Production Feature
**Timeline**: TBD
**Goal**: Implement offline-first workflow with explicit deploy

**Tasks**:
1. Local dashboard cache/workspace system
2. "Deploy to Production" button and workflow
3. Backup creation before deployment
4. Deployment validation and preview
5. Connection test and error handling
6. Deployment confirmation dialogs
7. Rollback capability

**Deliverables**:
- Offline workspace system
- Deploy to production feature
- Backup and rollback

**Acceptance Criteria**:
- Can work on dashboards offline
- Explicit user action required to deploy
- Creates backup before deployment
- Clear deployment status and errors
- Can rollback failed deployments

---

### Phase 15: Entity Validation & Warnings
**Timeline**: TBD
**Goal**: Validate entities exist and show visual warnings

**Tasks**:
1. Entity existence validation against HA instance
2. Visual warning indicators (exclamation icons) on cards
3. Entity validation panel/report
4. Missing entity highlighting in properties
5. Batch entity validation
6. Entity suggestions for typos

**Deliverables**:
- Entity validation system
- Visual warning indicators
- Validation report UI

**Acceptance Criteria**:
- Missing entities shown with exclamation icon
- Validation runs on entity changes
- Clear indication of which entities are missing
- Works with or without HA connection

---

### Phase 16: Advanced Features
**Timeline**: TBD
**Goal**: Polish and advanced functionality

**Tasks**:
1. Undo/redo system
2. Multi-select and bulk operations
3. Copy/paste cards
4. Dashboard templates
5. Import/export dashboards
6. Keyboard shortcuts
7. Search/filter entities and cards
8. Recent files
9. Settings/preferences panel

**Deliverables**:
- Undo/redo
- Templates
- Enhanced UX

**Acceptance Criteria**:
- Undo/redo works for all operations
- Can save/load templates
- Keyboard shortcuts documented
- Professional UX polish

---

### Phase 17: Template & Sharing System
**Timeline**: TBD
**Goal**: Dashboard templates and community sharing

**Tasks**:
1. Template export/import system
2. Template library UI
3. Community template repository integration
4. Template preview
5. Template metadata (author, description, tags)
6. Template version management

**Deliverables**:
- Template system
- Template library
- Community integration

**Acceptance Criteria**:
- Can save dashboards as templates
- Can browse and import templates
- Templates include metadata
- Community repository accessible

---

### Phase 18: Beta Release
**Timeline**: TBD
**Goal**: Public beta release

**Tasks**:
1. Comprehensive testing
2. Bug fixes
3. Documentation:
   - User manual
   - Installation guide
   - Tutorial videos
4. Build portable executables (Windows, Linux)
5. Update notification system (notify only, no auto-update)
6. Beta program setup
7. Feedback collection system

**Deliverables**:
- Beta release build
- Documentation
- Feedback mechanism

**Acceptance Criteria**:
- Stable on Windows and Linux
- All MVP features working
- Clear documentation
- Portable executables

---

## Success Metrics

### MVP Success (Phases 1-6)
- Load and display HA dashboard visually with real-time YAML sync
- Edit card positions and properties
- Save changes to YAML and JSON
- Support 5+ standard card types
- Offline-first editing workflow

### Custom Card Success (Phases 7-12)
- ApexCharts (Priority 1)
- Bubble Card (Priority 2)
- Button Card (Priority 3)
- Card-mod (Priority 4)
- Power Flow Card Plus (Priority 5)
- Mushroom & Mini-Graph (Priority 6)
- Full visual property editors with dummy data previews

### Integration Success (Phase 13-15)
- Connect to HA instance (local/remote/cloud)
- Entity browser with validation
- Entity existence warnings with visual indicators
- Deploy to production with backup/rollback
- Secure credential storage

### Production Ready (Phases 16-18)
- Professional UX matching HA theme
- Template system with community sharing
- Undo/redo functionality
- Stable and tested
- Complete documentation
- Portable executables for Windows/Linux

## Dependencies & Prioritization

### Critical Path (Must Complete in Order):
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 (MVP)

### After MVP - Custom Cards (Can parallelize by priority):
1. Phase 7: ApexCharts (PRIORITY 1)
2. Phase 8: Bubble Card (PRIORITY 2)
3. Phase 9: Button Card (PRIORITY 3)
4. Phase 10: Card-mod (PRIORITY 4)
5. Phase 11: Power Flow Card Plus (PRIORITY 5)
6. Phase 12: Mushroom & Mini-Graph (PRIORITY 6)

### After MVP - Integration Features (Sequential):
Phase 13 (HA Connection) → Phase 14 (Deploy to Production) → Phase 15 (Entity Validation)

### Polish Phase (After core features):
Phase 16 (Advanced Features) → Phase 17 (Templates) → Phase 18 (Beta Release)

## Risk Management

### Technical Risks
1. **No Dashboard API**: Mitigated by YAML file approach
2. **Custom Card Complexity**: Start with simpler cards (Bubble), defer complex ones
3. **Cross-platform Issues**: Test early and often on both platforms

### Scope Risks
1. **Feature Creep**: Stick to MVP scope first
2. **Custom Card Support**: Limit to 4 cards initially

### User Adoption Risks
1. **HA Compatibility**: Target HA 2025.12+ (per user requirements)
2. **Learning Curve**: Create tutorials and documentation
3. **Card Rendering Complexity**: Full card previews with dummy data is complex - may need iterative approach

### Scope Risks
1. **Offline-First + Deploy**: Complex workflow requiring careful state management
2. **Entity Validation**: Requires connection to HA, handle gracefully when offline
3. **Real-time YAML Sync**: Bidirectional sync is technically challenging

## Next Steps - READY TO START

✅ **Phase 0 Complete** - Requirements gathered and documented

### Immediate Next Actions:
1. **Initialize Electron Project** (Phase 1 start)
   - Set up Electron Forge with React + TypeScript
   - Configure development environment
   - Create basic application shell

2. **Set up project structure** matching architecture
3. **Begin Phase 1 development**

## Notes

- Each phase should include testing
- Documentation should be updated continuously
- User feedback should be incorporated after MVP
- Timeline estimates will be added after user requirements are finalized
