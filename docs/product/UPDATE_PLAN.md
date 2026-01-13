# Component Update Plan - January 2026

**Document Version**: 1.0
**Project Version**: v0.4.3-beta.1 → v0.5.0+ (target)
**Planning Date**: January 12, 2026
**Status**: Draft - Awaiting Research Completion

---

## Executive Summary

This document outlines the plan to update HA Visual Dashboard Maker to support the latest versions of all ecosystem components, including Home Assistant Core 2026.1, Bubble Card v3.1.0, and updated NPM dependencies. The plan is organized by risk level and priority, with clear testing requirements for each phase.

---

## Update Strategy

### Approach
1. **Risk-Based Prioritization**: Critical security updates first, then breaking changes, then enhancements
2. **Incremental Testing**: Update and test in small batches to isolate issues
3. **Backward Compatibility**: Maintain support for HA 2023.1+ where possible
4. **Rollback Planning**: Git branches for each phase with rollback capability

### Success Criteria
- All existing tests pass after updates
- No regression in core functionality
- New features from updated components documented
- Security vulnerabilities addressed

---

## Phase 1: Critical Security & Core Updates (Week 1)

**Objective**: Address critical security updates and core framework compatibility

### 1.1 Electron Update
**Priority**: 🔴 **CRITICAL**
**Risk Level**: Medium (requires extensive testing)

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **electron** | 39.2.7 | [Latest Stable] | Check for Chromium CVEs |
| **electron-forge** | 7.10.2 | [Latest] | Build toolchain |
| **electron-store** | 10.0.0 | [Latest] | Settings persistence |

**Reason**: Security patches in Chromium, Node.js, and V8

**Testing Requirements**:
- [ ] WebSocket connections to Home Assistant
- [ ] File system operations (open/save dashboard)
- [ ] IPC communication (main ↔ renderer)
- [ ] Settings persistence
- [ ] Window management
- [ ] Menu bar functionality
- [ ] All E2E tests pass

**Rollback Plan**: Git branch `update/electron-39-to-latest`

**Estimated Effort**: 2-3 days

---

### 1.2 Home Assistant WebSocket API
**Priority**: 🔴 **CRITICAL**
**Risk Level**: High (breaks connectivity if incompatible)

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **home-assistant-js-websocket** | ^9.6.0 | [Latest] | Core integration |
| **HA Core Compatibility** | 2023.1+ | 2026.1 | Verify WebSocket commands |

**Breaking Changes to Check**:
- [ ] `lovelace/resources` removal status (planned for 2025.1)
- [ ] WebSocket command signature changes
- [ ] Authentication flow changes
- [ ] Entity state format changes
- [ ] Service call format changes

**Testing Requirements**:
- [ ] Connection establishment with HA 2026.1
- [ ] Entity subscription and updates
- [ ] Dashboard list retrieval (`lovelace/dashboards/list`)
- [ ] Dashboard configuration retrieval (`lovelace/config`)
- [ ] Service calls (`call_service`)
- [ ] Theme retrieval
- [ ] Test with HA 2023.1, 2024.x, 2025.x, 2026.1

**Rollback Plan**: Git branch `update/ha-websocket-api`

**Estimated Effort**: 3-4 days

---

### 1.3 TypeScript & Build Tools
**Priority**: 🟡 **HIGH**
**Risk Level**: Low (build-time only)

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **typescript** | ^5.7.3 | [Latest 5.x] | Compiler |
| **vite** | ^5.4.11 | [Latest 5.x] | Build tool |
| **@playwright/test** | ^1.57.0 | [Latest] | E2E testing |

**Testing Requirements**:
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Build completes without errors
- [ ] No new TypeScript errors introduced

**Estimated Effort**: 1 day

---

## Phase 2: UI Component Library Updates (Week 2)

**Objective**: Update React and UI component libraries

### 2.1 React Ecosystem
**Priority**: 🟡 **HIGH**
**Risk Level**: Medium (affects all components)

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **react** | ^19.2.3 | [Latest 19.x] | Core framework |
| **react-dom** | ^19.2.3 | [Latest 19.x] | DOM renderer |

**Reason**: Bug fixes, performance improvements since 19.2.3

**Testing Requirements**:
- [ ] All components render correctly
- [ ] State management works (Zustand)
- [ ] useEffect hooks behave correctly
- [ ] No React warnings in console
- [ ] All E2E tests pass

**Estimated Effort**: 1-2 days

---

### 2.2 Ant Design
**Priority**: 🟡 **HIGH**
**Risk Level**: Medium (primary UI library)

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **antd** | ^6.1.0 | [Latest 6.x] | UI components |

**Breaking Changes to Check**:
- [ ] Component API changes
- [ ] Theme customization changes
- [ ] Form component changes (used in PropertiesPanel)
- [ ] Modal/Dialog changes
- [ ] React 19 compatibility

**Testing Requirements**:
- [ ] All Ant Design components render correctly
- [ ] PropertiesPanel forms work
- [ ] Modals and dialogs work (connection dialog, etc.)
- [ ] Theme customization works
- [ ] Buttons, inputs, selects all functional
- [ ] Visual regression tests pass

**Estimated Effort**: 2-3 days

---

### 2.3 React Grid Layout
**Priority**: 🔴 **CRITICAL**
**Risk Level**: High (core layout engine)

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **react-grid-layout** | ^2.0.0 | [Latest] | Dashboard layout |

**Breaking Changes to Check**:
- [ ] Drag/drop behavior
- [ ] Grid snapping logic
- [ ] Resize handle behavior
- [ ] React 19 compatibility issues
- [ ] TypeScript type changes

**Testing Requirements**:
- [ ] Drag cards on canvas
- [ ] Resize cards (where supported)
- [ ] Grid snapping works correctly
- [ ] Card positioning persists in YAML
- [ ] Multi-card selection (if implemented)
- [ ] E2E drag/drop tests pass

**Estimated Effort**: 3-4 days

---

## Phase 3: Editor & Visualization Updates (Week 3)

### 3.1 Monaco Editor
**Priority**: 🟢 **MEDIUM**
**Risk Level**: Medium (core YAML editing)

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **monaco-editor** | ^0.55.1 | [Latest] | Editor core |
| **@monaco-editor/react** | ^4.7.0 | [Latest] | React wrapper |
| **monaco-yaml** | ^5.4.0 | [Latest] | YAML support |

**Breaking Changes to Check**:
- [ ] YAML language support API
- [ ] Autocomplete provider changes
- [ ] Theme system changes
- [ ] React 19 compatibility

**Testing Requirements**:
- [ ] YAML editor loads correctly
- [ ] Syntax highlighting works
- [ ] Autocomplete works
- [ ] Error validation works
- [ ] Theme switching works
- [ ] Split view (visual + YAML) works

**Estimated Effort**: 2 days

---

### 3.2 Color & Visualization
**Priority**: 🟢 **MEDIUM**
**Risk Level**: Low

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **react-colorful** | ^5.6.1 | [Latest] | Color picker |
| **apexcharts** | ^5.3.6 | [Latest] | Charts |
| **react-apexcharts** | ^1.9.0 | [Latest] | React wrapper |

**Testing Requirements**:
- [ ] ColorPickerInput works
- [ ] Gradient editor works
- [ ] Recent colors tracking works
- [ ] ApexChartsCardRenderer displays charts
- [ ] Icon color customization works
- [ ] Card background colors work

**Estimated Effort**: 1-2 days

---

## Phase 4: Custom Card Updates (Week 4)

**Objective**: Update custom card renderers for latest versions

### 4.1 Bubble Card v3.1.0
**Priority**: 🟡 **HIGH**
**Risk Level**: Medium

**Current Status**: Renderer exists (BubbleCardRenderer.tsx), version unknown
**Target**: v3.1.0 (user mentioned "significant updates")

**Tasks**:
1. **Research Phase**:
   - [ ] Review Bubble Card v3.1.0 release notes
   - [ ] Identify configuration schema changes
   - [ ] Identify new card types/variants
   - [ ] Test current renderer with v3.1.0

2. **Update Phase**:
   - [ ] Update BubbleCardRenderer.tsx for new schema
   - [ ] Add support for new card types (if any)
   - [ ] Update property panel form definitions
   - [ ] Update card registry metadata

3. **Testing Phase**:
   - [ ] Create Bubble Card of each type
   - [ ] Configure all properties
   - [ ] Verify YAML export/import
   - [ ] Test in Live Preview
   - [ ] Deploy to HA 2026.1 and verify

**Estimated Effort**: 3-4 days

---

### 4.2 Other Implemented Custom Cards
**Priority**: 🟢 **MEDIUM**
**Risk Level**: Low-Medium

Update renderers for:
- [ ] **Mushroom Cards** (13 variants)
- [ ] **Mini Graph Card**
- [ ] **ApexCharts Card**
- [ ] **Power Flow Card**
- [ ] **Better Thermostat UI Card**

**Approach**: Same as Bubble Card (research → update → test)

**Estimated Effort**: 2-3 days per card (10-15 days total)

---

### 4.3 Missing Critical Cards (Implement New)
**Priority**: 🔴 **CRITICAL**
**Risk Level**: Medium

These cards are not yet implemented but are Tier 1 usage:

1. **Card-mod** (CSS styling)
   - Research current version
   - Implement renderer with security controls
   - No `<style>` injection in preview
   - Monaco CSS editor integration

2. **Auto-entities** (auto-populate)
   - Research current filter syntax
   - Implement preview (limited to 10 entities)
   - Don't actually query in editor

3. **Button Card** (custom:button-card)
   - Research current template system
   - Implement basic renderer (Phase 9 priority)
   - Template support deferred to Phase 11

4. **Vertical Stack in Card**
   - Research current schema
   - Implement renderer

5. **Mini Media Player**
   - Research current configuration
   - Implement renderer

6. **Multiple Entity Row**
   - Research current schema
   - Implement renderer

**Estimated Effort**: 5-7 days per card (30-42 days total)
**Note**: These should be separate from version updates - consider Phase 5

---

## Phase 5: Other Dependency Updates (Week 5)

**Objective**: Update remaining dependencies

### 5.1 State & Layout
**Priority**: 🟢 **MEDIUM**
**Risk Level**: Low

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **zustand** | ^5.0.9 | [Latest 5.x] | State management |
| **allotment** | ^1.20.5 | [Latest] | Split panes |

**Testing**: Dashboard state, undo/redo, split view behavior

**Estimated Effort**: 1 day

---

### 5.2 Material Design
**Priority**: 🟢 **LOW**
**Risk Level**: Low

| Item | Current | Target | Notes |
|------|---------|--------|-------|
| **@material/web** | ^2.4.1 | [Latest 2.x] | MD3 components |

**Testing**: Material components render correctly

**Estimated Effort**: 1 day

---

## Testing Strategy

### Automated Testing
- **Unit Tests**: Must pass before merge (95%+ coverage maintained)
- **E2E Tests**: All Playwright tests must pass
- **Visual Regression**: Update baselines where necessary

### Manual Testing Checklist
- [ ] Connect to Home Assistant 2023.1
- [ ] Connect to Home Assistant 2024.x
- [ ] Connect to Home Assistant 2025.x
- [ ] Connect to Home Assistant 2026.1
- [ ] Create new dashboard
- [ ] Add cards of each type
- [ ] Configure card properties
- [ ] Use color picker
- [ ] Use gradient editor
- [ ] Edit YAML directly
- [ ] Save dashboard to file
- [ ] Load dashboard from file
- [ ] Deploy dashboard to HA
- [ ] Verify deployed dashboard works in HA
- [ ] Test live preview
- [ ] Test theme integration
- [ ] Test entity type wizard
- [ ] Test undo/redo
- [ ] Test copy/paste
- [ ] Test keyboard shortcuts

---

## Risk Assessment

### High Risk Updates
1. **React Grid Layout**: Core layout engine
   - **Mitigation**: Extensive drag/drop testing, fallback to current version
2. **home-assistant-js-websocket**: Breaks HA connectivity
   - **Mitigation**: Test with multiple HA versions, maintain backward compatibility
3. **Electron**: Platform foundation
   - **Mitigation**: Thorough E2E testing, check Electron release notes carefully

### Medium Risk Updates
1. **Ant Design**: UI components throughout app
   - **Mitigation**: Visual regression testing, component-by-component verification
2. **Monaco Editor**: YAML editing core functionality
   - **Mitigation**: Test all editor features, syntax highlighting, autocomplete
3. **Custom Card Renderers**: User-facing features
   - **Mitigation**: Test each card type individually, compare with live HA rendering

### Low Risk Updates
- TypeScript, Vite, Playwright (build/test tools only)
- react-colorful, ApexCharts (isolated components)
- Zustand, allotment (limited scope)

---

## Rollback Strategy

### Branch Strategy
```
main (v0.4.3-beta.1)
  ↓
update/phase-1-security
  ↓
update/phase-2-ui-components
  ↓
update/phase-3-editor
  ↓
update/phase-4-custom-cards
  ↓
update/phase-5-other-deps
  ↓
v0.5.0-beta.1 (all updates complete)
```

### Rollback Plan
- Each phase has its own branch
- If critical issue found, revert to previous phase branch
- Git tags at each phase completion
- Ability to cherry-pick individual updates if needed

---

## Resource Requirements

### Timeline Estimate
- **Phase 1 (Critical)**: 1 week (5-7 days)
- **Phase 2 (UI Components)**: 1 week (5-7 days)
- **Phase 3 (Editor)**: 3-4 days
- **Phase 4 (Custom Cards)**: 1-2 weeks (existing cards only)
- **Phase 5 (Other)**: 2-3 days
- **Buffer for Issues**: 1 week

**Total Estimated Timeline**: 5-6 weeks for version updates only

**Note**: Phase 4.3 (implementing missing critical cards) would add 6-8 weeks

---

## Success Metrics

### Functional Metrics
- [ ] All 150+ unit tests pass
- [ ] All 40+ E2E tests pass
- [ ] Zero console errors in normal operation
- [ ] Zero TypeScript compilation errors
- [ ] Zero Playwright test failures

### Compatibility Metrics
- [ ] Works with HA 2023.1+ (backward compatible)
- [ ] Works with HA 2026.1 (forward compatible)
- [ ] All custom card renderers support latest card versions
- [ ] No regressions in existing features

### Security Metrics
- [ ] All known CVEs addressed
- [ ] Security audit passes (npm audit, Snyk)
- [ ] CSP policy still enforced
- [ ] No new security warnings

---

## Communication Plan

### User Communication
- **Before Update**: Announce planned updates, expected timeline
- **During Update**: Weekly status updates on progress
- **After Update**: Release notes with breaking changes, new features

### Documentation Updates
- Update SUPPORTED_VERSIONS.md with new versions
- Update VERSION_COMPARISON.md with findings
- Update user documentation with new features
- Update CHANGELOG.md

---

## Open Questions (Awaiting Research)

1. **Home Assistant 2026.1**: What specific dashboard functionality was added?
2. **Bubble Card v3.1.0**: What are the "significant updates"?
3. **React Grid Layout**: Are there known React 19 compatibility issues?
4. **Card-mod**: Has the CSS selector structure changed for HA 2026.x?
5. **WebSocket API**: Was `lovelace/resources` actually removed in 2025.1?

**Status**: Background research agent (task a8dbec8) addressing these questions

---

## Next Steps

### Immediate Actions
1. ✅ Create SUPPORTED_VERSIONS.md (baseline)
2. ✅ Create VERSION_COMPARISON.md (research template)
3. ✅ Create UPDATE_PLAN.md (this document)
4. ⏳ Complete background research (task a8dbec8)
5. ⏳ Update VERSION_COMPARISON.md with research findings
6. ⏳ Finalize UPDATE_PLAN.md based on research

### Decision Points
- **Go/No-Go**: Review research findings before starting Phase 1
- **Scope Decision**: Include Phase 4.3 (missing cards) or defer to v0.6.0?
- **Timeline Approval**: Confirm 5-6 week timeline is acceptable

---

## Document Updates

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0 | 2026-01-12 | Initial draft, awaiting research | 🔄 Draft |

---

**Status**: 🔄 **DRAFT** - Awaiting research completion to finalize priorities and timeline

**Research Agent**: Task a8dbec8 (running in background)

**Next Document**: See [VERSION_COMPARISON.md](VERSION_COMPARISON.md) for research findings (in progress)
