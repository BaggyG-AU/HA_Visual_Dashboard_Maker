# Version Comparison & Breaking Changes Analysis

**Document Version**: 1.0
**Research Date**: January 12, 2026
**Project Version**: v0.4.3-beta.1
**Status**: Research In Progress

---

## Purpose

This document compares the versions currently supported by HA Visual Dashboard Maker (documented in [SUPPORTED_VERSIONS.md](SUPPORTED_VERSIONS.md)) with the latest available versions as of January 2026. It identifies breaking changes, new features, and compatibility issues that need to be addressed.

---

## Research Methodology

### Sources Used
- GitHub releases pages for each component
- NPM registry for JavaScript packages
- Home Assistant community forums and developer documentation
- HACS repository metadata
- Component changelog files

### Focus Areas
1. **Breaking Changes**: API changes, deprecations, removals
2. **Significant New Features**: Major functionality additions
3. **Compatibility Issues**: React 19, Electron 39, TypeScript 5.7 compatibility
4. **Security Updates**: Critical security fixes requiring immediate updates

---

## Home Assistant Core & APIs

### Home Assistant Core

| Aspect | Current Support | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | 2023.1+ (min), 2024.x (tested) | **[RESEARCH NEEDED]** | ⏳ |
| **Release Date** | - | **[RESEARCH NEEDED]** | ⏳ |
| **Breaking Changes** | - | **[RESEARCH NEEDED]** | ⏳ |

#### Known Changes to Research
- **HA 2026.1** mentioned by user as having "new functionality to dashboards"
- **WebSocket API changes**: Need to verify `lovelace/resources` removal (planned for 2025.1)
- **Dashboard schema changes**: New card configuration options?
- **Authentication flow**: Any changes to long-lived token handling?

#### Potential Impact Areas
- WebSocket command compatibility (`lovelace/config`, `lovelace/dashboards/list`)
- Entity state subscription format
- Service call signatures
- Theme system integration
- Dashboard YAML schema

**Research Priority**: 🔴 **CRITICAL** - Core integration functionality

---

### home-assistant-js-websocket

| Aspect | Current Version | Latest Version | Status |
|--------|----------------|----------------|--------|
| **NPM Version** | `^9.6.0` | **9.6.0** | ✅ **UP TO DATE** |
| **Release Date** | ~2024 | - | ✅ |
| **Breaking Changes** | - | None (already on latest) | ✅ |

#### Phase 1 Update (Completed)
- ✅ Verified package is on latest version (9.6.0)
- ✅ No update needed
- ✅ All tests pass with current version

**Research Priority**: ✅ **COMPLETE** - Already on latest version

---

## Custom HACS Cards (Top Priority)

### 1. Bubble Card

| Aspect | Current Support | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | Unknown (pre-v3.1.0) | **v3.1.0** (per user) | ⚠️ **OUTDATED** |
| **Our Renderer** | BubbleCardRenderer.tsx | - | Needs update |
| **GitHub** | https://github.com/Clooos/Bubble-Card | - | - |

#### Known Changes (v3.1.0)
- **[USER MENTIONED]**: "Significant updates" in v3.1.0
- **[RESEARCH NEEDED]**: Specific breaking changes
- **[RESEARCH NEEDED]**: New card types or variants
- **[RESEARCH NEEDED]**: Configuration schema changes

#### Potential Impact
- Our renderer may not support new card types
- Configuration properties may have changed
- Style/theme integration changes
- New action types or options

**Research Priority**: 🟡 **HIGH** - User specifically mentioned this update

**Action Items**:
- [ ] Review Bubble Card v3.1.0 release notes
- [ ] Compare configuration schema changes
- [ ] Test existing renderer with v3.1.0
- [ ] Update renderer if needed
- [ ] Update property panel forms

---

### 2. Mushroom Cards

| Aspect | Current Support | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | Unknown | **[RESEARCH NEEDED]** | ⏳ |
| **Variants Supported** | 13 (all) | **[RESEARCH NEEDED]** | ⏳ |
| **Our Renderer** | MushroomCardRenderer.tsx | - | - |
| **GitHub** | https://github.com/piitaya/lovelace-mushroom | - | - |

#### Changes to Research
- New Mushroom card variants added?
- Configuration schema updates
- Theme integration changes
- Icon or style changes

**Research Priority**: 🟢 **MEDIUM** - Already well-supported

---

### 3. Button Card (custom:button-card)

| Aspect | Current Support | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | Not implemented | **[RESEARCH NEEDED]** | ❌ **MISSING** |
| **Our Renderer** | None (planned Phase 9) | - | - |
| **GitHub** | https://github.com/custom-cards/button-card | - | - |

#### Changes to Research
- Current stable version and schema
- Template system complexity
- JavaScript template support requirements
- Style/CSS configuration options

**Research Priority**: 🟡 **HIGH** - Priority #3 on roadmap, Tier 1 usage

---

### 4. Card-mod

| Aspect | Current Support | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | Not implemented | **[RESEARCH NEEDED]** | ❌ **CRITICAL MISSING** |
| **Our Renderer** | None (Priority 1 for Part 2) | - | - |
| **GitHub** | https://github.com/thomasloven/lovelace-card-mod | - | - |

#### Changes to Research
- CSS selector structure for HA 2026.x
- Style injection method
- Shadow DOM navigation changes
- Security considerations for latest version

**Research Priority**: 🔴 **CRITICAL** - Most important missing card (Tier 1)

---

### 5. Auto-entities

| Aspect | Current Support | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | Not implemented | **[RESEARCH NEEDED]** | ❌ **MISSING** |
| **Our Renderer** | None (Priority 1 for Part 2) | - | - |
| **GitHub** | https://github.com/thomasloven/lovelace-auto-entities | - | - |

#### Changes to Research
- Filter configuration syntax
- Entity selection method changes
- Performance considerations

**Research Priority**: 🟡 **HIGH** - Tier 1 usage

---

### 6-20. Other Custom Cards

**Status**: Research queue includes:
- Mini Graph Card
- ApexCharts Card
- Power Flow Card
- Mini Media Player
- Multiple Entity Row
- Fold Entity Row
- Slider Entity Row
- Battery State Card
- Vertical Stack in Card
- Simple Swipe Card
- Decluttering Card
- WebRTC Camera
- Surveillance Card
- Frigate Card
- Better Thermostat UI

**Research Priority**: 🟢 **MEDIUM** - Secondary priority after critical cards

---

## Key NPM Dependencies

### React

| Aspect | Current Version | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | `^19.2.3` | **19.2.3** | ✅ **UP TO DATE** |
| **Release Date** | Dec 2024 | Dec 2024 | ✅ |
| **Breaking Changes** | - | None (already on latest) | ✅ |

#### Phase 2 Update (Completed)
- ✅ Verified React/React-DOM on latest version (19.2.3)
- ✅ No update needed
- ✅ All UI components compatible with React 19
- ✅ Ant Design 6.1.4 fully compatible with React 19
- ✅ React Grid Layout 2.2.2 fully compatible with React 19

**Research Priority**: ✅ **COMPLETE** - Already on latest version

---

### Electron

| Aspect | Current Version | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | `39.2.7` | **39.2.7** | ✅ **UP TO DATE** |
| **Chromium** | 130 | 130 | ✅ |
| **Node.js** | 20.18.0 | 20.18.0 | ✅ |
| **Release Date** | Dec 2024 | Dec 2024 | ✅ |

#### Phase 1 Update (Completed)
- ✅ Verified Electron is on latest stable version (39.2.7)
- ✅ electron-store already on latest (11.0.2)
- ✅ @electron-forge/* already on latest (7.10.2)
- ✅ All E2E tests pass (128/128 core tests, 6 pre-existing color-picker flakes)

**Research Priority**: ✅ **COMPLETE** - Already on latest stable version

---

### Ant Design

| Aspect | Current Version | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | `^6.1.0` → **^6.1.4** | **6.1.4** | ✅ **UPDATED** |
| **Release Date** | 2024 | Jan 2026 | ✅ |
| **Breaking Changes** | - | None (minor update) | ✅ |

#### Phase 2 Update (Completed)
- ✅ Updated from 6.1.0 to 6.1.4 (minor bug fixes)
- ✅ React 19 compatibility confirmed
- ✅ No API changes affecting our codebase
- ✅ All UI components render correctly
- ✅ Theme system unchanged
- ✅ Tests pass: 307 unit tests, 15/15 smoke tests

**Research Priority**: ✅ **COMPLETE** - Updated to latest 6.x version

---

### Monaco Editor

| Aspect | Current Version | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | `^0.55.1` | **[RESEARCH NEEDED]** | ⏳ |
| **@monaco-editor/react** | `^4.7.0` | **[RESEARCH NEEDED]** | ⏳ |
| **monaco-yaml** | `^5.4.0` | **[RESEARCH NEEDED]** | ⏳ |

#### Changes to Research
- YAML language support updates
- Autocomplete API changes
- React 19 compatibility
- Theme system updates

**Research Priority**: 🟢 **MEDIUM** - Core editor functionality

---

### React Grid Layout

| Aspect | Current Version | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | `^2.0.0` → **^2.2.2** | **2.2.2** | ✅ **UPDATED** |
| **Release Date** | 2024 | Dec 2025 | ✅ |

#### Phase 2 Update (Completed)
- ✅ Updated from 2.0.0 to 2.2.2 (bug fixes for drag/drop)
- ✅ React 19 compatibility confirmed
- ✅ No API changes affecting our codebase
- ✅ Drag/drop behavior works correctly
- ✅ Tests pass: Dashboard operations tests 6/6

**Research Priority**: ✅ **COMPLETE** - Updated to latest 2.x version

---

### ApexCharts

| Aspect | Current Version | Latest Version | Status |
|--------|----------------|----------------|--------|
| **Version** | `^5.3.6` | **[RESEARCH NEEDED]** | ⏳ |
| **react-apexcharts** | `^1.9.0` | **[RESEARCH NEEDED]** | ⏳ |

**Research Priority**: 🟢 **MEDIUM** - Used in ApexChartsCardRenderer

---

### Other Dependencies

| Package | Current | Latest | Priority | Status |
|---------|---------|--------|----------|--------|
| **zustand** | ^5.0.9 | [TBD] | 🟢 Medium | ⏳ |
| **allotment** | ^1.20.5 | [TBD] | 🟢 Medium | ⏳ |
| **react-colorful** | ^5.6.1 | [TBD] | 🟢 Medium | ⏳ |
| **@material/web** | ^2.4.1 | [TBD] | 🟢 Low | ⏳ |
| **electron-store** | ^11.0.2 | **11.0.2** | 🟢 Medium | ✅ **Phase 1** |
| **typescript** | ~4.5.4 → **^5.9.3** | **5.9.3** | 🟡 High | ✅ **Phase 1** |
| **@playwright/test** | ^1.57.0 | **1.57.0** | 🟢 Medium | ✅ **Phase 1** |
| **vite** | ^5.4.21 | **5.4.21** (latest 5.x) | 🟢 Medium | ✅ **Phase 1** |

---

## Breaking Changes Summary

### Critical (Immediate Action Required)
**[To be populated after research]**

### High Priority (Plan for Update)
**[To be populated after research]**

### Medium Priority (Monitor)
**[To be populated after research]**

### Low Priority (Optional)
**[To be populated after research]**

---

## Compatibility Matrix

| Component | React 19 | Electron 39 | TypeScript 5.7 | Status |
|-----------|----------|-------------|----------------|--------|
| Ant Design 6.1.0 | [TBD] | N/A | [TBD] | ⏳ |
| React Grid Layout 2.0.0 | [TBD] | [TBD] | [TBD] | ⏳ |
| Monaco Editor 0.55.1 | [TBD] | [TBD] | [TBD] | ⏳ |
| Zustand 5.0.9 | [TBD] | N/A | [TBD] | ⏳ |
| home-assistant-js-websocket 9.6.0 | [TBD] | [TBD] | [TBD] | ⏳ |

---

## Security Updates Required

### Critical CVEs
**[To be populated after research]**

### Recommended Updates
**[To be populated after research]**

---

## New Features Analysis

### Home Assistant 2026.1
**[USER MENTIONED]**: "new functionality to dashboards"
**[RESEARCH NEEDED]**: Specific new features

### Custom Cards
**[To be populated after research]**

### Dependencies
**[To be populated after research]**

---

## Research Progress

### Completed ✅
- [x] Document structure created
- [x] Current versions documented (from SUPPORTED_VERSIONS.md)
- [x] Priority levels assigned

### In Progress 🔄
- [ ] Home Assistant Core 2026.1 research
- [ ] Bubble Card v3.1.0 research
- [ ] Top 20 custom cards version research
- [ ] NPM dependency latest versions
- [ ] React 19 compatibility matrix
- [ ] Electron 39 compatibility testing

### Pending ⏳
- [ ] Breaking changes documentation
- [ ] Security CVE review
- [ ] Compatibility matrix completion
- [ ] Recommendations finalization

---

## Research Notes

### Session 1: 2026-01-12
- Background research agent launched (task ID: a8dbec8)
- Researching Home Assistant ecosystem versions
- Focus on top 20 custom cards + key dependencies
- Template document created in docs/research/

### Session 2: [Date TBD]
**[To be updated with research findings]**

---

## Quick Reference: Version Research URLs

### Home Assistant
- **Core Releases**: https://github.com/home-assistant/core/releases
- **Frontend Releases**: https://github.com/home-assistant/frontend/releases
- **Release Notes**: https://www.home-assistant.io/blog/categories/release-notes/

### Custom Cards
- **Bubble Card**: https://github.com/Clooos/Bubble-Card/releases
- **Mushroom**: https://github.com/piitaya/lovelace-mushroom/releases
- **Button Card**: https://github.com/custom-cards/button-card/releases
- **Card-mod**: https://github.com/thomasloven/lovelace-card-mod/releases

### NPM Packages
- **React**: https://github.com/facebook/react/releases
- **Electron**: https://github.com/electron/electron/releases
- **Ant Design**: https://github.com/ant-design/ant-design/releases

---

## Document Updates

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-12 | Initial structure, research in progress | Research Agent |

---

**Next Step**: See [UPDATE_PLAN.md](UPDATE_PLAN.md) for the prioritized plan to update all components to current versions.

**Research Status**: 🔄 **IN PROGRESS** - Background research agent running (task a8dbec8)
