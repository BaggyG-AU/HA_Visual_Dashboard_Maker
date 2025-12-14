# MVP Backlog - HA Visual Dashboard Maker

## Overview
This document provides a prioritized backlog for the Minimum Viable Product (MVP) release.

**MVP Goal**: A functional desktop application that can load, visually edit, and save Home Assistant dashboards with standard cards and real-time YAML synchronization.

**MVP Scope**: Phases 1-6 from PROJECT_PLAN.md

---

## Phase 1: Core Application Setup

### Priority: CRITICAL (Must complete first)
### Estimated Tasks: 15-20

#### 1.1 Project Initialization
- [ ] Initialize Electron Forge project with React + TypeScript template
- [ ] Verify project runs with `npm start`
- [ ] Configure build for Windows and Linux
- [ ] Test packaging with `npm run make`

#### 1.2 Development Environment
- [ ] Configure ESLint with TypeScript rules
- [ ] Configure Prettier for code formatting
- [ ] Set up TypeScript strict mode
- [ ] Create tsconfig.json with path aliases
- [ ] Configure hot reload for development

#### 1.3 Basic Application Structure
- [ ] Create main process entry point
- [ ] Create IPC communication handlers
- [ ] Set up basic window management
- [ ] Implement application menu (File, Edit, View, Help)
- [ ] Add window state persistence (size, position)

#### 1.4 UI Framework Setup
- [ ] Install and configure Material-UI (MUI) or Ant Design
- [ ] Set up theme provider (light/dark mode support)
- [ ] Create basic layout components (Header, Sidebar, Canvas, Properties Panel)
- [ ] Implement theme switcher
- [ ] Test dark/light mode switching

#### 1.5 File System Integration
- [ ] Set up secure IPC for file operations
- [ ] Implement file dialog (open dashboard)
- [ ] Implement save dialog
- [ ] Add recent files tracking
- [ ] Create file system utilities

**Acceptance Criteria**:
- ✅ Application launches on Windows and Linux
- ✅ Can open file dialogs via menu
- ✅ Dark/light mode works
- ✅ Basic layout renders correctly
- ✅ Hot reload works in development

---

## Phase 2: YAML Dashboard Loading

### Priority: CRITICAL
### Estimated Tasks: 12-15

#### 2.1 YAML Parsing
- [ ] Install and configure `js-yaml` library
- [ ] Create YAML parsing service
- [ ] Implement error handling for invalid YAML
- [ ] Add YAML validation against HA schema
- [ ] Create TypeScript types for HA dashboard structure

#### 2.2 Dashboard State Management
- [ ] Set up Zustand or Redux store
- [ ] Create dashboard slice/store
- [ ] Implement dashboard loading action
- [ ] Add loading states and error states
- [ ] Create selectors for dashboard data

#### 2.3 Dashboard Structure Types
- [ ] Define `DashboardConfig` interface
- [ ] Define `View` interface
- [ ] Define `Card` base interface
- [ ] Define standard card type interfaces (entities, button, etc.)
- [ ] Create type guards for card types

#### 2.4 File Browser UI
- [ ] Create "Open Dashboard" dialog
- [ ] Add file type filter (.yaml, .yml)
- [ ] Implement file path validation
- [ ] Show file preview (first few lines)
- [ ] Add error display for failed loads

#### 2.5 Dashboard Tree View
- [ ] Create tree component for dashboard structure
- [ ] Display views and cards hierarchy
- [ ] Add expand/collapse functionality
- [ ] Show card count per view
- [ ] Highlight selected card

**Acceptance Criteria**:
- ✅ Can open and parse ui-lovelace.yaml files
- ✅ Invalid YAML shows clear error messages
- ✅ Dashboard structure displayed in tree view
- ✅ Type-safe dashboard objects in state
- ✅ No crashes on malformed YAML

---

## Phase 3: Visual Editor Canvas

### Priority: CRITICAL
### Estimated Tasks: 15-18

#### 3.1 Grid Layout System
- [ ] Install react-grid-layout or react-flow
- [ ] Configure grid to match HA's grid system (12 columns)
- [ ] Set up grid breakpoints
- [ ] Add grid visual guides (optional toggle)
- [ ] Implement grid snap behavior

#### 3.2 Card Rendering Foundation
- [ ] Create base Card component
- [ ] Implement card placeholder renderer
- [ ] Add card type detection
- [ ] Create card registry system
- [ ] Show card type badge on cards

#### 3.3 Drag and Drop
- [ ] Implement drag handles on cards
- [ ] Add drag preview
- [ ] Handle drop events and position updates
- [ ] Update state on position change
- [ ] Add collision detection

#### 3.4 Card Selection
- [ ] Implement click-to-select
- [ ] Add selection highlight/border
- [ ] Sync selection with properties panel
- [ ] Keyboard navigation (arrow keys)
- [ ] Show selection in tree view

#### 3.5 Multi-View Support
- [ ] Create view tabs/switcher
- [ ] Handle view switching
- [ ] Preserve scroll position per view
- [ ] Show active view indicator
- [ ] Add view navigation shortcuts

#### 3.6 Canvas Controls
- [ ] Add zoom controls (fit, zoom in/out)
- [ ] Implement pan/scroll
- [ ] Add canvas toolbar
- [ ] Keyboard shortcuts for controls
- [ ] Canvas minimap (optional)

**Acceptance Criteria**:
- ✅ Cards render in correct grid positions
- ✅ Can drag cards to new positions
- ✅ Grid matches HA behavior
- ✅ View switching works
- ✅ Selection syncs across components

---

## Phase 4: Standard Card Support

### Priority: HIGH
### Estimated Tasks: 18-22

#### 4.1 Card Type Registry
- [ ] Create card type registration system
- [ ] Define card type interface
- [ ] Build registry of standard HA cards
- [ ] Add card metadata (icon, description, category)
- [ ] Implement card type lookup

#### 4.2 Card Palette
- [ ] Create card palette component (left sidebar)
- [ ] Group cards by category
- [ ] Add search/filter for cards
- [ ] Implement drag from palette to canvas
- [ ] Show card previews in palette

#### 4.3 Standard Card Renderers (Priority Order)
1. [ ] **Entities Card** - Most common
   - Basic list rendering
   - Entity rows display
   - Header/title
2. [ ] **Button Card (Standard)** - Not custom button-card
   - Icon display
   - Name and state
   - Tap action indicator
3. [ ] **Picture Card**
   - Image placeholder
   - Overlay text
4. [ ] **Markdown Card**
   - Markdown preview
   - Content display
5. [ ] **Horizontal Stack**
   - Container for nested cards
   - Layout children horizontally
6. [ ] **Vertical Stack**
   - Container for nested cards
   - Layout children vertically
7. [ ] **Grid Card**
   - Grid container
   - Variable columns

#### 4.4 Properties Panel
- [ ] Create properties panel component (right sidebar)
- [ ] Implement card-specific property forms
- [ ] Add form fields (text input, number, select, toggle)
- [ ] Create color picker component
- [ ] Add icon selector
- [ ] Implement property validation

#### 4.5 Property Editors per Card Type
- [ ] Entities card property editor
- [ ] Button card property editor
- [ ] Picture card property editor
- [ ] Markdown card property editor
- [ ] Stack cards property editor
- [ ] Grid card property editor

#### 4.6 Real-Time Preview
- [ ] Connect properties panel to state
- [ ] Update canvas on property change
- [ ] Debounce rapid changes
- [ ] Show unsaved changes indicator
- [ ] Handle validation errors

**Acceptance Criteria**:
- ✅ Can add standard cards from palette
- ✅ Each card type renders appropriately
- ✅ Property editor shows card-specific options
- ✅ Changes reflect immediately on canvas
- ✅ At least 6-7 standard card types supported

---

## Phase 5: YAML Code Editor

### Priority: HIGH
### Estimated Tasks: 12-15

#### 5.1 Monaco Editor Integration
- [ ] Install @monaco-editor/react
- [ ] Create YAML editor component
- [ ] Configure Monaco for YAML language
- [ ] Set up editor theme (light/dark)
- [ ] Add editor toolbar

#### 5.2 YAML Configuration
- [ ] Configure YAML syntax highlighting
- [ ] Add YAML schema validation
- [ ] Implement autocomplete for HA config
- [ ] Add error markers/squiggles
- [ ] Create validation service

#### 5.3 Split View Layout
- [ ] Create split pane component
- [ ] Implement visual | code view switcher
- [ ] Add resizable split
- [ ] Persist split position
- [ ] Handle view mode preference

#### 5.4 Bidirectional Sync (CRITICAL)
- [ ] Connect editor to dashboard state
- [ ] Visual → YAML: Update editor on visual changes
- [ ] YAML → Visual: Parse on YAML changes
- [ ] Implement debounced parsing (500ms)
- [ ] Preserve cursor position on updates
- [ ] Handle parse errors gracefully

#### 5.5 Editor Features
- [ ] Line highlighting for selected card
- [ ] Jump to card definition from canvas
- [ ] Format YAML on command
- [ ] Find/replace in YAML
- [ ] Keyboard shortcuts

#### 5.6 Error Handling
- [ ] Show inline errors for invalid YAML
- [ ] Prevent visual update if YAML invalid
- [ ] Display error panel with details
- [ ] Suggest fixes for common errors
- [ ] Add "Help" links for errors

**Acceptance Criteria**:
- ✅ Can switch between visual and code views
- ✅ Changes in visual view update YAML immediately
- ✅ Changes in YAML update visual view (after valid parse)
- ✅ Invalid YAML shows clear errors
- ✅ Cursor position preserved
- ✅ Autocomplete works for HA config

---

## Phase 6: Save Functionality

### Priority: HIGH
### Estimated Tasks: 10-12

#### 6.1 Local Workspace System
- [ ] Create workspace storage (IndexedDB or local files)
- [ ] Implement auto-save to workspace
- [ ] Add workspace recovery on crash
- [ ] Track workspace dirty state
- [ ] Show "Modified (not deployed)" indicator

#### 6.2 YAML Serialization
- [ ] Create dashboard → YAML converter
- [ ] Preserve YAML formatting where possible
- [ ] Handle comments preservation (best effort)
- [ ] Add YAML formatting options
- [ ] Validate YAML before serialization

#### 6.3 Save to File
- [ ] Implement "Save" (overwrite current file)
- [ ] Implement "Save As" (new file)
- [ ] Add save dialog
- [ ] Create backup before overwrite
- [ ] Handle save errors

#### 6.4 Export Functionality
- [ ] Export to YAML
- [ ] Export to JSON
- [ ] Add export options dialog
- [ ] Format exported files
- [ ] Add metadata comments (optional)

#### 6.5 Dirty State Tracking
- [ ] Track unsaved changes
- [ ] Show unsaved indicator (asterisk in title)
- [ ] Warn on close with unsaved changes
- [ ] Implement Ctrl+S shortcut
- [ ] Add "Save All" for multiple dashboards

#### 6.6 Backup System
- [ ] Create backup directory
- [ ] Auto-backup on save (configurable)
- [ ] Timestamp backups
- [ ] List available backups
- [ ] Restore from backup

**Acceptance Criteria**:
- ✅ Can save dashboard to YAML file
- ✅ Auto-saves to local workspace
- ✅ Creates backup before overwriting
- ✅ Warns on unsaved changes
- ✅ Preserves YAML formatting
- ✅ Can export to both YAML and JSON

---

## MVP Feature Summary

### What the MVP Can Do:
1. ✅ Load Home Assistant dashboard YAML files
2. ✅ Display dashboard visually with drag-and-drop cards
3. ✅ Edit card positions via drag-and-drop
4. ✅ Edit card properties via visual property panel
5. ✅ Real-time sync between visual and YAML views
6. ✅ Support 6-7 standard HA card types
7. ✅ Validate YAML syntax
8. ✅ Save changes to YAML files
9. ✅ Export to YAML and JSON
10. ✅ Auto-save to local workspace
11. ✅ Create backups
12. ✅ Dark/light theme support
13. ✅ Multi-view dashboard support
14. ✅ Undo/redo (if time permits in Phase 6)

### What the MVP Does NOT Include:
- ❌ Custom cards (ApexCharts, Bubble, etc.) - Phase 7+
- ❌ Home Assistant connection - Phase 13
- ❌ Entity validation - Phase 15
- ❌ Deploy to production - Phase 14
- ❌ Entity browser - Phase 13
- ❌ Live entity states - Phase 13
- ❌ Templates - Phase 17
- ❌ Community sharing - Phase 17

---

## Technical Debt & Future Improvements

### Items to Revisit After MVP:
1. Card rendering - Currently placeholder, need full rendering (Phase 7+)
2. Performance optimization for large dashboards
3. Comprehensive testing suite
4. Accessibility improvements
5. Internationalization (i18n)
6. Plugin system for custom cards

---

## Success Criteria for MVP Release

### Functional Requirements:
- [ ] Can load standard HA dashboard YAML files without errors
- [ ] Can visually edit and save changes
- [ ] Real-time YAML ↔ Visual sync works reliably
- [ ] Supports at least 6 standard card types
- [ ] No data loss (auto-save, backups)
- [ ] Runs on Windows 10/11 and Linux (Ubuntu/Debian/Fedora)

### Quality Requirements:
- [ ] No crashes on valid HA YAML files
- [ ] Clear error messages for invalid YAML
- [ ] Responsive UI (no lag on card drag)
- [ ] Professional appearance matching HA theme
- [ ] Keyboard shortcuts documented and working

### Documentation Requirements:
- [ ] User guide for basic workflow
- [ ] Installation instructions
- [ ] Keyboard shortcuts reference
- [ ] Known limitations documented
- [ ] Troubleshooting guide

---

## Next Steps After MVP

1. **User Testing**: Get feedback from HA community
2. **Bug Fixes**: Address issues found in MVP
3. **Custom Card Priority**: Start Phase 7 (ApexCharts)
4. **HA Connection**: Phase 13 (Deploy to production workflow)
5. **Entity Validation**: Phase 15 (Missing entity warnings)

---

## Estimated Timeline

**Note**: Timelines depend on development resources and complexity

- Phase 1: 1-2 weeks
- Phase 2: 1 week
- Phase 3: 2 weeks
- Phase 4: 2-3 weeks (most complex)
- Phase 5: 1-2 weeks
- Phase 6: 1 week

**Total MVP Estimate**: 8-11 weeks for single developer

---

## Risk Mitigation

### High-Risk Items:
1. **Real-time YAML sync** - Complex, needs careful state management
   - Mitigation: Prototype early, use proven patterns
2. **Card rendering accuracy** - Matching HA cards is difficult
   - Mitigation: Start with simple approximations, iterate
3. **Cross-platform issues** - Windows/Linux differences
   - Mitigation: Test on both platforms frequently

### Medium-Risk Items:
1. **Performance with large dashboards** - Many cards could slow down
   - Mitigation: Use virtualization, React.memo, lazy loading
2. **YAML formatting preservation** - Hard to maintain original formatting
   - Mitigation: Document limitations, provide manual formatting option
