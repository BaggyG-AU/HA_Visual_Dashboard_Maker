# Prompt: Create Phase 4 - Layout Infrastructure Layer Artifacts

Use this prompt to create the implementation plan and user stories for Phase 4 of the HAVDM Advanced Features.

---

## Context

You are an AI assistant helping to implement Phase 4 (Layout Infrastructure Layer) of the HA Visual Dashboard Maker (HAVDM) project. This is an Electron + React + TypeScript desktop application for creating Home Assistant dashboards.

**Phase 3 (Entity Intelligence Layer) has been completed** and merged to main. You are now creating the artifacts for Phase 4.

---

## Mandatory Pre-Reading

Before creating any artifacts, you MUST read and understand the following documents in order:

1. **[ai_rules.md](../../ai_rules.md)** - Immutable AI development rules (HIGHEST PRIORITY)
2. **[TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)** - DSL-first testing approach, coverage requirements
3. **[PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)** - E2E testing guidelines for Electron
4. **[ARCHITECTURE.md](../architecture/ARCHITECTURE.md)** - Application architecture patterns, code organization
5. **[HAVDM_ADVANCED_FEATURES_PLANNING.md](./HAVDM_ADVANCED_FEATURES_PLANNING.md)** - Approved technology decisions and user preferences
6. **[HAVDM_ADVANCED_FEATURES_USER_STORIES.md](./HAVDM_ADVANCED_FEATURES_USER_STORIES.md)** - User story format and Phase 4 overview
7. **[HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md](./HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md)** - Phase summaries and timeline
8. **[ENTITY_INTELLIGENCE_LAYER_IMPLIMENTATION.md](./ENTITY_INTELLIGENCE_LAYER_IMPLIMENTATION.md)** - Template for implementation document format

---

## Phase 4: Layout Infrastructure Layer - Overview

**Branch Name**: `feature/layout-infrastructure-layer`
**Version Target**: v0.7.4-beta.3
**Dependencies**: None (independent phase - can run parallel to other phases)
**Estimated Duration**: 2-3 weeks
**Total Features**: 6

**Versioning Convention**:
- `v0.7.<phase>-beta.<feature>`
- Example: `v0.7.4-beta.3` = Phase 4, Feature 3

### Features to Implement

| Feature | Priority | Estimated Effort | Description |
|---------|----------|------------------|-------------|
| 4.1: Swiper.js Integration | High | 5-6 days | Carousel/slider foundation using Swiper.js v12+ |
| 4.2: Accordion Card Module | Medium | 3-4 days | Collapsible sections with expand/collapse animations |
| 4.3: Tabs Card Module | Medium | 3-4 days | Tabbed interface for organizing card content |
| 4.4: Popup/Modal Card System | High | 5-6 days | Cards that open in modal overlays |
| 4.5: Horizontal/Vertical Layout Enhancements | Medium | 2-3 days | Improvements to stack card layouts |
| 4.6: Card Spacing Controls | Medium | 2-3 days | Margin and padding controls for cards |

### Technology Decisions (from Approved Planning Document)

- **Carousel/Slider**: Swiper.js v12+ (feature-rich, battle-tested)
- **Code Organization**: Hybrid approach - complex features in `src/features/`, simple components in `src/components/`
- **Testing**: Comprehensive E2E coverage with DSL-first approach + visual regression for visual features
- **Accessibility**: WCAG 2.1 AA compliance required
- **Documentation**: User-facing tooltips + developer docs + feature documentation (moderate detail)

---

## Deliverables Required

### 1. Implementation Plan Document

Create `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md` following the exact format of `ENTITY_INTELLIGENCE_LAYER_IMPLIMENTATION.md`:

**Required Sections**:
- Header with branch name, version target, dependencies, status, planned start
- Overview with phase goal, business value, key principles
- Feature Status Overview table
- For EACH feature (4.1 through 4.6):
  - Priority, Dependencies, Estimated Effort, Status
  - Implementation Checklist broken into phases (e.g., Phase 1: Core Component, Phase 2: PropertiesPanel Integration, etc.)
  - Detailed checkbox items for each task
  - Acceptance Criteria (Must Have, Should Have, Won't Have)
  - Risk Register table
  - Compliance section referencing ai_rules.md, TESTING_STANDARDS.md, ARCHITECTURE.md, PLAYWRIGHT_TESTING.md
- Phase Completion Checklist
- Risk Management section
- Success Metrics

**Implementation Details to Include**:

For **Feature 4.1 (Swiper.js Integration)**:
- Swiper.js v12+ installation and configuration
- Carousel/slider React component with pagination, navigation, autoplay
- Touch/mouse swipe gestures
- Per-slide configuration (background, content, navigation behavior)
- Carousel DSL for testing
- YAML schema for carousel configuration

For **Feature 4.2 (Accordion Card Module)**:
- Collapsible section component
- Expand/collapse animations (CSS transitions)
- Single or multiple sections open mode
- Nested accordion support
- Accordion DSL for testing
- YAML schema for accordion configuration

For **Feature 4.3 (Tabs Card Module)**:
- Tabbed interface component
- Horizontal and vertical tab orientations
- Tab icons and labels
- Tab switching animations
- Active tab persistence
- Tabs DSL for testing
- YAML schema for tabs configuration

For **Feature 4.4 (Popup/Modal Card System)**:
- Modal overlay component
- Full-screen or custom size modes
- Close mechanisms (button, backdrop click, ESC key)
- Nested popup support
- Modal trigger configuration (tap_action integration)
- Popup DSL for testing
- YAML schema for popup configuration

For **Feature 4.5 (Horizontal/Vertical Layout Enhancements)**:
- Gap/spacing control for stack cards
- Alignment options (start, center, end, stretch, space-between)
- Wrap behavior for horizontal layouts
- Integration with existing stack card renderers

For **Feature 4.6 (Card Spacing Controls)**:
- Margin controls (per-side or all sides)
- Padding controls (per-side or all sides)
- Spacing presets (none, tight, normal, relaxed, custom)
- Integration with PropertiesPanel
- YAML schema updates

### 2. Kanban User Stories

Update or create user stories in GitHub Projects format following the structure in `HAVDM_ADVANCED_FEATURES_USER_STORIES.md`. Each story should include:

- **Title**: Clear, action-oriented title
- **User Story**: "As a [user], I want [feature] so that [benefit]"
- **Context**: Why this feature matters, use cases
- **Scope**: What's included and explicitly excluded
- **Acceptance Criteria**: Testable requirements
- **Technical Notes**: Implementation guidance
- **Dependencies**: Other features this depends on
- **Effort Estimate**: T-shirt size (S/M/L/XL) or story points
- **Labels**: `phase-4`, `layout`, `ui`, `testing`, etc.
- **Compliance Statement**: Reference to ai_rules.md, testing standards, architecture

---

## Standards Compliance Requirements

All artifacts MUST include explicit compliance statements for:

1. **ai_rules.md** - All code changes follow immutable AI development rules
2. **TESTING_STANDARDS.md** - DSL-first testing, 95%+ coverage for services, 90%+ for components
3. **ARCHITECTURE.md** - Hybrid code organization, service patterns
4. **PLAYWRIGHT_TESTING.md** - State-based waits, no arbitrary delays, proper Electron handling

---

## UI/UX Best Practices

Ensure all features follow these UI/UX principles:

1. **Progressive Disclosure**: Simple options visible by default, advanced options expandable
2. **Consistent Patterns**: Match existing Ant Design component patterns
3. **Keyboard Accessibility**: Full keyboard navigation for all interactive elements
4. **Visual Feedback**: Clear indication of selected/active states
5. **Error Prevention**: Validation before destructive actions
6. **Responsive Design**: Components work at various panel widths
7. **Animation Guidelines**: Respect `prefers-reduced-motion`, smooth 60fps animations
8. **Touch-Friendly**: Adequate touch targets for mobile preview

---

## Testing Requirements

For each feature, define:

1. **Unit Tests**:
   - Service logic tests
   - Component render tests
   - Configuration validation tests

2. **E2E Tests** (DSL-first):
   - Create dedicated DSL classes: `CarouselDSL`, `AccordionDSL`, `TabsDSL`, `PopupDSL`, `LayoutDSL`, `SpacingDSL`
   - Test user workflows end-to-end
   - Test YAML round-trip serialization
   - Test keyboard navigation

3. **Visual Regression Tests**:
   - Baseline snapshots for each component state
   - Animation frame captures where applicable

4. **Accessibility Tests**:
   - ARIA attributes verification
   - Keyboard navigation testing
   - Screen reader compatibility

---

## Clarifying Questions

Before proceeding with artifact creation, please ask any clarifying questions about:

1. **Swiper.js Configuration**: Any specific carousel behaviors needed beyond standard pagination/navigation?
2. **Modal Sizing**: Should modals support responsive sizing based on content?
3. **Tab Persistence**: Should active tab state persist across dashboard reloads?
4. **Accordion State**: Should accordion open/closed state persist?
5. **Layout Presets**: Should spacing presets be globally configurable in settings?
6. **Animation Preferences**: Specific animation durations/easings to standardize on?
7. **Mobile Preview**: How should these layouts behave in the mobile preview mode?
8. **Existing Card Integration**: Which existing cards should support these new layout features?

**Please ask your clarifying questions before creating the artifacts.**

---

## Output Format

After clarifying questions are resolved, deliver:

1. **File**: `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`
   - Complete implementation plan following the template format
   - All 6 features detailed with checklists
   - Risk registers and compliance sections

2. **User Stories**: Ready to add to kanban/project board
   - One story per feature (6 total minimum)
   - Additional stories for cross-cutting concerns (testing infrastructure, documentation)

3. **Summary**: Brief overview of what was created and next steps

---

## Reference: Previous Phase Success

Phase 3 (Entity Intelligence Layer) was successfully completed with:
- 7 features delivered (3.1-3.7)
- 126 files changed, 9,280 insertions
- All unit and E2E tests passing
- Comprehensive DSL coverage
- Full documentation

Use the same quality bar and thoroughness for Phase 4 artifacts.

---

**Document Created**: 2026-02-06
**Purpose**: Prompt for AI to create Phase 4 implementation artifacts
**Owner**: Development Team
