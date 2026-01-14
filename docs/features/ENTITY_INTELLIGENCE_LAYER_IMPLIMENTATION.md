# Entity Intelligence Layer - Implementation Plan

**Branch**: `feature/entity-intelligence-layer`
**Version Target**: v0.6.0-beta.1
**Dependencies**: None (independent phase)
**Status**: 🚧 In Progress (Feature 3.1 complete)
**Planned Start**: 2026-01-14

---

## Overview

**IMPORTANT**: Before beginning any work on this phase, all developers must read [ai_rules.md](../../ai_rules.md) for immutable development rules and standards.

**Phase Goal**: Build intelligent entity handling and automation capabilities that enable smart default behaviors, context-aware variables, fuzzy entity matching, dynamic attribute display, conditional visibility, state-aware icons, and multi-entity support.

**Business Value**: This phase significantly improves dashboard intelligence by reducing manual configuration, enabling automatic entity remapping for imported dashboards, providing rich context variables for templating, and supporting advanced entity state visualization. These features make dashboards more dynamic, easier to configure, and more powerful for Home Assistant integration.

**Key Principles**:
- **Smart Defaults**: System intelligently determines appropriate actions based on entity domain
- **Context Awareness**: Entity state, attributes, and metadata available as template variables
- **Fuzzy Matching**: Intelligent entity remapping suggestions for dashboard imports
- **Conditional Logic**: Show/hide entities and apply styles based on state conditions
- **Multi-entity Support**: Single cards can control and aggregate multiple entities

---

## Feature Status Overview

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| 3.1: Smart Default Actions | High | 4-5 days | ✅ Complete |
| 3.2: Entity Context Variables | High | 5-6 days | ⏳ Ready to Begin |
| 3.3: Entity Remapping (Fuzzy Matching) | Medium | 6-7 days | ⏳ Ready to Begin |
| 3.4: Entity Attribute Display | Medium | 3-4 days | ⏳ Ready to Begin |
| 3.5: Conditional Entity Visibility | High | 4-5 days | ⏳ Ready to Begin |
| 3.6: Entity State Icons | Medium | 3-4 days | ⏳ Ready to Begin |
| 3.7: Multi-entity Support | High | 4-5 days | ⏳ Ready to Begin |

**Total Estimated Effort**: 29-35 days (3-4 weeks with parallel work on independent features)

---

## Feature 3.1: Smart Default Actions

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 4-5 days
**Status**: ✅ Complete (2026-01-14)

### Implementation Checklist

#### Phase 1: Core Domain Action Mapping (Days 1-2)

- [x] Create `src/services/smartActions.ts` service
- [x] Define domain-to-action mapping configuration
  - [x] `switch`: default to `toggle`
  - [x] `light`: default to `toggle`
  - [x] `climate`: default to `more-info`
  - [x] `sensor`: default to `more-info`
  - [x] `binary_sensor`: default to `more-info`
  - [x] `cover`: default to `toggle` (open/close)
  - [x] `lock`: default to `call-service` (lock.unlock via `service_data.entity_id`)
  - [x] `script`: default to `call-service` (script.turn_on via `service_data.entity_id`)
  - [x] `automation`: default to `toggle`
  - [x] `camera`: default to `more-info`
  - [x] `media_player`: default to `toggle`
  - [x] `fan`: default to `toggle`
  - [x] `vacuum`: default to `call-service` (vacuum.start via `service_data.entity_id`)
- [x] Implement `getSmartDefaultAction(entity_id: string): Action` function
- [x] Add precedence logic: user-defined actions override smart defaults
- [x] Unit tests for domain detection and action mapping

#### Phase 2: PropertiesPanel Integration (Day 2)

- [x] Add "Use Smart Defaults" checkbox to action configuration sections
- [x] Default checkbox to `checked` for new cards (button + custom:button-card)
- [x] Show computed smart default action (read-only preview)
- [x] Allow user to override by unchecking or defining custom action
- [x] UI shows distinction between smart default and user-defined action

#### Phase 3: YAML Storage & Serialization (Day 3)

- [x] Define `smart_defaults: boolean` property in card config schema
- [x] Serialize smart defaults setting to YAML
- [x] Deserialize and apply smart defaults on dashboard load
- [x] Migration/back-compat: preserve existing behavior when `smart_defaults` is absent (legacy behavior)
- [x] New cards default to `smart_defaults: true` (button + custom:button-card)

#### Phase 4: Runtime Action Resolution (Day 3)

- [x] Implement action resolution service
- [x] Check if user has defined explicit `tap_action`
  - If yes: use user action (smart defaults don't apply)
  - If no and `smart_defaults: true`: use computed smart default
  - If no and `smart_defaults: false`: no action
  - If no and `smart_defaults` is missing: preserve legacy behavior (toggle for button/custom:button-card only)
- [x] Apply smart defaults to `tap_action` only (not hold/double-tap)
- [x] Ensure card preview reflects resolved behavior (user/smart/legacy/none)

#### Phase 5: Testing & Documentation (Days 4-5)

- [x] Unit tests for all domain mappings
- [x] Unit tests for precedence logic
- [x] E2E tests using SmartActionsDSL
  - [x] Card with `smart_defaults: true` uses correct action for each domain
  - [x] User-defined action overrides smart default
  - [x] Checkbox toggle updates YAML
  - [x] Smart defaults persist across dashboard load
- [x] Update documentation with smart defaults reference table
- [x] Add tooltips explaining smart defaults in UI

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [x] Smart default actions work for all common domains (switch, light, sensor, climate, etc.)
- [x] User-defined actions always take precedence over smart defaults
- [x] `smart_defaults` setting persists in YAML correctly
- [x] PropertiesPanel UI clearly indicates when smart defaults are active
- [x] Existing dashboards preserve current behavior (no breaking changes)
- [x] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [x] PropertiesPanel shows preview of what action will be used
- [x] Tooltips explain what smart default action will be applied
- [ ] Settings page allows customizing default actions per domain (global override)

**Won't Have (Out of Scope)**:
- [ ] Smart defaults for hold_action or double_tap_action (future)
- [ ] AI-learned action preferences based on user behavior
- [ ] Domain-specific action customization per dashboard

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Smart defaults conflict with user expectations | Medium | Medium | Clear UI indication, easy override, user testing |
| Domain detection fails for custom entities | Low | Low | Fallback to `more-info`, allow manual domain specification |
| Existing dashboards break on upgrade | High | Low | Migration strategy: default to `smart_defaults: false` for existing cards |
| Performance impact from action resolution | Low | Low | Cache computed actions, optimize lookup |

### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Read before implementation, centralized action resolution logic
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first E2E tests using SmartActionsDSL
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Service in `src/services/smartActions.ts`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - State-based waits, no arbitrary delays

### Delivered Implementation Notes (2026-01-14)

- Scope: Smart default action *resolution + UI + YAML round-trip* for `button` and `custom:button-card` only (as per Feature 3.1 acceptance and current app support).
- Back-compat:
  - If `smart_defaults` is **missing** and `tap_action` is not explicitly set, legacy behavior is preserved for `button` + `custom:button-card` (toggle).
  - New cards default to `smart_defaults: true` for `button` + `custom:button-card`.
- Runtime: Smart defaults are only applied to `tap_action` (hold/double-tap remain out-of-scope).

### Verification (2026-01-14)

Commands executed in this repo:
- `npm run lint` (0 errors; warnings only)
- `npm run test:unit` (all unit tests passing)
- `npx playwright test --project=electron-integration --shard 2/2 --reporter=list --workers=1 --trace=retain-on-failure` (passing)
- `npx playwright test --project=electron-e2e --reporter=list --workers=1 --trace=retain-on-failure` (passing; 2 skipped due to known Electron focus limitation)

Note: Additional full-suite verification was also run by the maintainer and reported passing.

---

## Feature 3.2: Entity Context Variables

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 5-6 days
**Status**: ⏳ Ready to Begin

### Implementation Checklist

#### Phase 1: Variable Syntax Design & Parser (Days 1-2)

- [ ] Create `src/services/entityContext.ts` service
- [ ] Define variable syntax: `[[entity.property]]` or `{{entity.property}}`
- [ ] Implement regex-based parser to detect context variables in strings
- [ ] Support nested properties: `[[entity.attributes.battery]]`
- [ ] Support entity reference: `[[entity_id]]` or `[[entity:domain.name]]`
- [ ] Unit tests for parser (valid/invalid syntax, edge cases)

#### Phase 2: Context Variable Resolution (Days 2-3)

- [ ] Implement `resolveEntityContext(template: string, entityId: string, entityState: HassEntity): string`
- [ ] Support basic properties:
  - [ ] `[[entity.state]]` → entity state value
  - [ ] `[[entity.friendly_name]]` → entity friendly name
  - [ ] `[[entity.entity_id]]` → entity ID
  - [ ] `[[entity.domain]]` → entity domain (e.g., "light", "switch")
  - [ ] `[[entity.last_changed]]` → last changed timestamp
  - [ ] `[[entity.last_updated]]` → last updated timestamp
- [ ] Support attribute access: `[[entity.attributes.X]]`
  - [ ] `[[entity.attributes.battery]]`
  - [ ] `[[entity.attributes.temperature]]`
  - [ ] `[[entity.attributes.friendly_name]]`
  - [ ] Any custom attribute
- [ ] Handle missing properties gracefully (return empty string or placeholder)
- [ ] Unit tests for all supported properties

#### Phase 3: Integration with Text Fields (Days 3-4)

- [ ] Integrate context resolution into card rendering
- [ ] Apply to all text fields:
  - [ ] Card title
  - [ ] Card content/labels
  - [ ] Entity names
  - [ ] Button labels
  - [ ] Tooltip text
- [ ] Real-time updates when entity state changes
- [ ] PropertiesPanel preview shows resolved variables (not raw template)

#### Phase 4: YAML Storage & Editor Support (Day 4)

- [ ] Context variables stored as raw template strings in YAML
- [ ] Example: `title: "Battery: [[entity.attributes.battery]]%"`
- [ ] YAML editor autocomplete for context variables (Monaco integration)
- [ ] Syntax highlighting for context variables
- [ ] Validation: warn if referenced entity doesn't exist

#### Phase 5: Advanced Features (Day 5)

- [ ] Support multiple entities in single template
  - [ ] `"Living Room: [[light.living_room.state]] | Bedroom: [[light.bedroom.state]]"`
- [ ] Support formatting hints (optional):
  - [ ] `[[entity.state|upper]]` → uppercase
  - [ ] `[[entity.state|lower]]` → lowercase
  - [ ] `[[entity.attributes.temperature|round(1)]]` → round to 1 decimal
  - [ ] `[[entity.state|default('Unknown')]]` → fallback value
- [ ] Unit tests for formatting

#### Phase 6: Testing & Documentation (Day 6)

- [ ] E2E tests using EntityContextDSL
  - [ ] Card title shows resolved entity state
  - [ ] Card updates when entity state changes
  - [ ] Attributes display correctly
  - [ ] Multiple entities in single template
  - [ ] Formatting functions work
- [ ] Documentation with examples
- [ ] PropertiesPanel help text with variable reference

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Context variables work in all text fields (title, content, labels)
- [ ] Basic properties supported: state, friendly_name, entity_id, domain
- [ ] Attribute access works: `[[entity.attributes.X]]`
- [ ] Variables update in real-time when entity state changes
- [ ] Missing properties handled gracefully (no crashes)
- [ ] YAML round-trip preserves template strings
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Monaco editor autocomplete for context variables
- [ ] Syntax highlighting for variables
- [ ] PropertiesPanel preview shows resolved values
- [ ] Formatting functions (upper, lower, round, default)

**Won't Have (Out of Scope)**:
- [ ] Full Jinja2 template support (Phase 6)
- [ ] Complex logic (if/else, loops) (Phase 6)
- [ ] Cross-entity calculations (Phase 6)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance impact from real-time resolution | Medium | Medium | Debounce updates, cache resolved values, optimize parser |
| Syntax conflicts with existing YAML | Low | Low | Choose unique delimiter (`[[...]]`), escape handling |
| Infinite loops with circular references | Low | Low | Detect circular refs, limit recursion depth |
| Entity state not available at render time | Medium | Low | Graceful fallback, loading state indication |

### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Read before implementation, centralized template resolution
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests using EntityContextDSL
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Service in `src/services/entityContext.ts`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Wait for entity state updates

---

## Feature 3.3: Entity Remapping (Fuzzy Matching)

**Priority**: Medium
**Dependencies**: None
**Estimated Effort**: 6-7 days
**Status**: ⏳ Ready to Begin

### Implementation Checklist

#### Phase 1: Entity Detection on Import (Days 1-2)

- [ ] Create `src/services/entityRemapping.ts` service
- [ ] Detect dashboard import event (YAML file loaded)
- [ ] Extract all entity IDs referenced in dashboard
- [ ] Query Home Assistant connection for available entities
- [ ] Identify missing entities (referenced but not available)
- [ ] Unit tests for entity extraction from YAML

#### Phase 2: Fuzzy Matching Algorithm (Days 2-3)

- [ ] Implement fuzzy matching algorithm (Levenshtein distance or similar)
- [ ] Calculate similarity score between entity IDs
- [ ] Weight similarity factors:
  - [ ] Domain match (highest priority: `light.*` matches `light.*`)
  - [ ] Name similarity (e.g., `light.living_room` ≈ `light.livingroom`)
  - [ ] Friendly name similarity
  - [ ] Entity type similarity (switch, light, etc.)
- [ ] Generate top 3-5 suggestions per missing entity
- [ ] Sort suggestions by confidence score
- [ ] Unit tests for fuzzy matching accuracy

#### Phase 3: Remapping UI - Modal Dialog (Days 3-4)

- [ ] Create `EntityRemappingModal.tsx` component
- [ ] Trigger modal on dashboard import if missing entities detected
- [ ] UI shows:
  - [ ] List of missing entities (original entity IDs)
  - [ ] For each missing entity:
    - [ ] Top suggestions with confidence scores
    - [ ] Dropdown to select replacement entity
    - [ ] "Skip" option (leave unmapped)
    - [ ] Manual entity ID input (override suggestions)
  - [ ] "Auto-map All" button (uses top suggestion for all)
  - [ ] "Review Mappings" summary before confirming
- [ ] Confirmation dialog shows mapping summary before applying

#### Phase 4: Automatic Remapping with Override (Days 4-5)

- [ ] Implement auto-mapping logic:
  - [ ] Automatically map entities with >80% confidence
  - [ ] Show summary modal with mappings for user review
  - [ ] User can edit/remove auto-mappings before confirming
- [ ] Apply mappings to dashboard YAML
- [ ] Replace all occurrences of old entity ID with new entity ID
- [ ] Preserve YAML structure and formatting

#### Phase 5: Mapping Persistence & Reuse (Day 5)

- [ ] Save mapping history: `old_entity_id → new_entity_id`
- [ ] Store in `localStorage` or app settings
- [ ] Reuse mappings for future imports (same entity → same mapping)
- [ ] UI to manage saved mappings:
  - [ ] View mapping history
  - [ ] Edit/delete mappings
  - [ ] Clear all mappings

#### Phase 6: Manual Remapping Tool (Day 6)

- [ ] Add "Remap Entities" button to dashboard menu
- [ ] User-triggered remapping (not just on import)
- [ ] Scan current dashboard for missing entities
- [ ] Show same remapping modal
- [ ] Use case: HA entity IDs changed, user wants to update dashboard

#### Phase 7: Testing & Documentation (Day 7)

- [ ] Unit tests for fuzzy matching algorithm
- [ ] Unit tests for entity extraction and replacement
- [ ] E2E tests using EntityRemappingDSL
  - [ ] Import dashboard with missing entities
  - [ ] Modal appears with suggestions
  - [ ] Auto-map all entities
  - [ ] Manual entity selection
  - [ ] Mapping persistence and reuse
- [ ] Documentation with examples
- [ ] Help text in modal explaining fuzzy matching

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Dashboard import detects missing entities
- [ ] Fuzzy matching provides relevant suggestions (>70% accuracy)
- [ ] Remapping modal allows manual entity selection
- [ ] Auto-mapping works for high-confidence matches
- [ ] Mappings persist and reuse on future imports
- [ ] Manual "Remap Entities" tool available
- [ ] All entity references in YAML updated correctly
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Confidence score displayed for each suggestion
- [ ] Preview of entity state/attributes before mapping
- [ ] Batch mapping (map multiple similar entities at once)
- [ ] Export/import mapping configurations

**Won't Have (Out of Scope)**:
- [ ] AI-powered mapping based on entity usage patterns
- [ ] Cloud-based mapping suggestions from community
- [ ] Automatic entity discovery from HA API (Phase 7)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Fuzzy matching accuracy too low | High | Medium | Multiple algorithms, user can override, confidence threshold |
| Large dashboards have many missing entities (UX) | Medium | Medium | Pagination in modal, batch operations, auto-map option |
| Entity replacement breaks templates | High | Low | Comprehensive YAML parsing, test with complex dashboards |
| Saved mappings become stale | Low | Medium | Allow user to clear/edit mappings, show mapping age |

### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Read before implementation, centralized entity resolution
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests using EntityRemappingDSL
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Service in `src/services/entityRemapping.ts`, modal in `src/components/`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Modal interaction tests, state-based waits

---

## Feature 3.4: Entity Attribute Display

**Priority**: Medium
**Dependencies**: None
**Estimated Effort**: 3-4 days
**Status**: ⏳ Ready to Begin

### Implementation Checklist

#### Phase 1: Attribute Selection UI (Days 1-2)

- [ ] Create `AttributeDisplayControls.tsx` component in PropertiesPanel
- [ ] UI to select which attributes to display:
  - [ ] Dropdown showing all available attributes for selected entity
  - [ ] Multi-select: user can choose multiple attributes
  - [ ] Reorder attributes (drag-and-drop)
  - [ ] Preview shows formatted attribute values
- [ ] Fetch entity attributes from HA state
- [ ] Group common attributes (battery, temperature, humidity, etc.)

#### Phase 2: Attribute Formatting (Day 2)

- [ ] Create `src/services/attributeFormatter.ts` service
- [ ] Format attribute values by type:
  - [ ] Numeric: precision control (decimal places)
  - [ ] Numeric: unit display (°C, %, kWh, etc.)
  - [ ] Boolean: custom labels ("On"/"Off", "Yes"/"No")
  - [ ] String: truncate long strings
  - [ ] Timestamp: relative time ("2 minutes ago") or absolute
  - [ ] Arrays/Objects: JSON pretty-print or custom display
- [ ] User-configurable formatting per attribute
- [ ] Unit tests for all formatters

#### Phase 3: YAML Storage (Day 3)

- [ ] Define `attribute_display` property in card config schema
- [ ] Store selected attributes and formatting config
- [ ] Example YAML:
  ```yaml
  entity: sensor.temperature
  attribute_display:
    - attribute: battery
      label: "Battery"
      format:
        type: number
        precision: 0
        unit: "%"
    - attribute: temperature
      label: "Temp"
      format:
        type: number
        precision: 1
        unit: "°C"
  ```
- [ ] Serialize/deserialize attribute config

#### Phase 4: Card Rendering Integration (Day 3)

- [ ] Integrate attribute display into card components
- [ ] Render attributes as secondary info or separate section
- [ ] Layout options:
  - [ ] Inline (next to entity name)
  - [ ] Below entity name (stacked)
  - [ ] Table format (attribute: value pairs)
- [ ] Real-time updates when attribute values change
- [ ] Handle missing attributes gracefully

#### Phase 5: Testing & Documentation (Day 4)

- [ ] Unit tests for attribute formatting
- [ ] E2E tests using AttributeDisplayDSL
  - [ ] Select attributes in PropertiesPanel
  - [ ] Attributes display correctly in card
  - [ ] Formatting applies correctly
  - [ ] Real-time updates work
  - [ ] Config persists in YAML
- [ ] Documentation with examples
- [ ] Help text explaining formatting options

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] User can select which attributes to display
- [ ] Attributes display in card with proper formatting
- [ ] Numeric formatting (precision, units) works
- [ ] Boolean formatting (custom labels) works
- [ ] Timestamp formatting (relative/absolute) works
- [ ] Real-time updates when attributes change
- [ ] Config persists in YAML
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Drag-and-drop to reorder attributes
- [ ] Attribute grouping (battery, climate, etc.)
- [ ] Preview in PropertiesPanel shows formatted values
- [ ] Layout options (inline, stacked, table)

**Won't Have (Out of Scope)**:
- [ ] Custom attribute icons (Phase 6)
- [ ] Attribute-based styling (Phase 6)
- [ ] Attribute history charts (Phase 5)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Attribute names differ across entity types | Low | High | Show all available attributes dynamically, allow custom labels |
| Formatting options too complex | Medium | Medium | Provide smart defaults, simple UI, advanced mode for power users |
| Performance with many attributes | Low | Low | Limit max attributes per card, optimize rendering |

### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Read before implementation, centralized formatting logic
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests using AttributeDisplayDSL
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Formatter in `src/services/attributeFormatter.ts`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Wait for attribute updates

---

## Feature 3.5: Conditional Entity Visibility

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 4-5 days
**Status**: ⏳ Ready to Begin

### Implementation Checklist

#### Phase 1: Condition Configuration UI (Days 1-2)

- [ ] Create `ConditionalVisibilityControls.tsx` component
- [ ] UI to configure visibility conditions:
  - [ ] Condition type dropdown:
    - [ ] State equals
    - [ ] State not equals
    - [ ] State in list
    - [ ] State not in list
    - [ ] Attribute equals
    - [ ] Attribute greater than
    - [ ] Attribute less than
    - [ ] Entity exists
  - [ ] Condition value input (text, number, or multi-select)
  - [ ] Add multiple conditions (AND/OR logic)
  - [ ] Condition groups for complex logic
- [ ] Visual condition builder (no-code)

#### Phase 2: Condition Evaluation Engine (Days 2-3)

- [ ] Create `src/services/conditionalVisibility.ts` service
- [ ] Implement condition evaluators:
  - [ ] `stateEquals(entity, value)` → boolean
  - [ ] `stateNotEquals(entity, value)` → boolean
  - [ ] `stateIn(entity, values[])` → boolean
  - [ ] `attributeEquals(entity, attr, value)` → boolean
  - [ ] `attributeGreaterThan(entity, attr, value)` → boolean
  - [ ] `attributeLessThan(entity, attr, value)` → boolean
  - [ ] `entityExists(entity_id)` → boolean
- [ ] Implement AND/OR logic for multiple conditions
- [ ] Support nested condition groups
- [ ] Unit tests for all evaluators

#### Phase 3: YAML Storage (Day 3)

- [ ] Define `visibility_conditions` property in card config
- [ ] Store condition configuration
- [ ] Example YAML:
  ```yaml
  entity: light.living_room
  visibility_conditions:
    - condition: state
      entity: input_boolean.show_lights
      state: "on"
    - condition: or
      conditions:
        - condition: state
          entity: sun.sun
          state: "below_horizon"
        - condition: numeric_state
          entity: sensor.lux
          below: 100
  ```
- [ ] Serialize/deserialize conditions

#### Phase 4: Runtime Visibility Control (Days 3-4)

- [ ] Integrate visibility logic into card rendering
- [ ] Evaluate conditions on:
  - [ ] Dashboard load
  - [ ] Entity state change
  - [ ] Attribute change
- [ ] Show/hide entity in card based on conditions
- [ ] Animate visibility changes (fade in/out)
- [ ] Handle entire card visibility vs individual entity visibility

#### Phase 5: Advanced Features (Day 4)

- [ ] Support time-based conditions (Phase 6 preview):
  - [ ] Time between (e.g., 8:00 AM - 10:00 PM)
  - [ ] Weekday/weekend
- [ ] Support user conditions (Phase 6 preview):
  - [ ] User is home
  - [ ] User is specific person
- [ ] Condition preview in PropertiesPanel (shows current evaluation)

#### Phase 6: Testing & Documentation (Day 5)

- [ ] Unit tests for all condition evaluators
- [ ] Unit tests for AND/OR logic
- [ ] E2E tests using ConditionalVisibilityDSL
  - [ ] Entity shown when condition met
  - [ ] Entity hidden when condition not met
  - [ ] Multiple conditions with AND logic
  - [ ] Multiple conditions with OR logic
  - [ ] Real-time visibility updates on state change
- [ ] Documentation with examples
- [ ] Help text in UI

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] All basic condition types work (state equals, in list, attribute comparisons)
- [ ] AND/OR logic works for multiple conditions
- [ ] Conditions evaluate on state/attribute changes
- [ ] Entities show/hide correctly based on conditions
- [ ] Config persists in YAML
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Visual condition builder (no-code UI)
- [ ] Condition groups for complex logic
- [ ] Fade in/out animations for visibility changes
- [ ] PropertiesPanel preview shows current condition state

**Won't Have (Out of Scope)**:
- [ ] Full visual logic editor (Phase 6)
- [ ] Time-based and user-based conditions (Phase 6)
- [ ] Condition templates/presets (Phase 6)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex condition logic confuses users | Medium | Medium | Visual builder, simple defaults, examples in docs |
| Performance impact from frequent evaluations | Low | Low | Debounce evaluations, cache results, optimize logic |
| Condition syntax conflicts with HA automations | Low | Low | Match HA condition format where possible, clear docs |

### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Read before implementation, centralized condition evaluation
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests using ConditionalVisibilityDSL
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Service in `src/services/conditionalVisibility.ts`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Wait for visibility state changes

---

## Feature 3.6: Entity State Icons

**Priority**: Medium
**Dependencies**: None
**Estimated Effort**: 3-4 days
**Status**: ⏳ Ready to Begin

### Implementation Checklist

#### Phase 1: State-to-Icon Mapping UI (Days 1-2)

- [ ] Create `StateIconMappingControls.tsx` component
- [ ] UI to configure state-to-icon mappings:
  - [ ] Add mapping: state value → icon
  - [ ] Icon picker (MDI icons)
  - [ ] Color picker for each state icon
  - [ ] Default icon for unmapped states
  - [ ] Preview showing current state icon
- [ ] Load MDI icon library (material-design-icons)
- [ ] Icon search/filter functionality

#### Phase 2: Icon Resolution Service (Day 2)

- [ ] Create `src/services/stateIcons.ts` service
- [ ] Implement `getStateIcon(entity_id, state): IconConfig`
- [ ] Fallback hierarchy:
  - [ ] User-defined state mapping (highest priority)
  - [ ] Entity domain default icons (medium priority)
  - [ ] Generic fallback icon (lowest priority)
- [ ] Icon config includes: icon name, color, size
- [ ] Unit tests for icon resolution

#### Phase 3: YAML Storage (Day 2)

- [ ] Define `state_icons` property in card config
- [ ] Store icon mappings
- [ ] Example YAML:
  ```yaml
  entity: climate.living_room
  state_icons:
    "heat":
      icon: mdi:fire
      color: "#FF5722"
    "cool":
      icon: mdi:snowflake
      color: "#2196F3"
    "off":
      icon: mdi:power
      color: "#9E9E9E"
    default:
      icon: mdi:thermostat
      color: "#607D8B"
  ```
- [ ] Serialize/deserialize icon mappings

#### Phase 4: Runtime Icon Rendering (Day 3)

- [ ] Integrate state icon logic into card components
- [ ] Evaluate state and apply correct icon
- [ ] Update icon in real-time when state changes
- [ ] Support icon animations on state change (optional)
  - [ ] Fade between icons
  - [ ] Scale/pulse animation on change
- [ ] Handle missing icons gracefully

#### Phase 5: Domain-Specific Defaults (Day 3)

- [ ] Define default icon mappings for common domains:
  - [ ] `light`: on → mdi:lightbulb, off → mdi:lightbulb-outline
  - [ ] `switch`: on → mdi:toggle-switch, off → mdi:toggle-switch-off
  - [ ] `binary_sensor.door`: on → mdi:door-open, off → mdi:door-closed
  - [ ] `binary_sensor.window`: on → mdi:window-open, off → mdi:window-closed
  - [ ] `lock`: locked → mdi:lock, unlocked → mdi:lock-open
  - [ ] `cover`: open → mdi:window-shutter-open, closed → mdi:window-shutter
  - [ ] `climate`: heat → mdi:fire, cool → mdi:snowflake, auto → mdi:thermostat-auto
- [ ] User can override domain defaults

#### Phase 6: Testing & Documentation (Day 4)

- [ ] Unit tests for icon resolution
- [ ] Unit tests for domain defaults
- [ ] E2E tests using StateIconDSL
  - [ ] Icon changes when state changes
  - [ ] User-defined mappings override defaults
  - [ ] Icon color applies correctly
  - [ ] Config persists in YAML
- [ ] Documentation with icon mapping examples
- [ ] Help text showing available icons

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] User can define state-to-icon mappings
- [ ] Icons update in real-time when state changes
- [ ] Domain-specific default icons work
- [ ] Icon color customization works
- [ ] Default fallback icon for unmapped states
- [ ] Config persists in YAML
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Icon picker with search functionality
- [ ] Icon preview in PropertiesPanel
- [ ] Icon animations on state change
- [ ] Batch icon mapping for multiple states

**Won't Have (Out of Scope)**:
- [ ] Custom icon upload (SVG) (future)
- [ ] Icon animations based on attribute values (Phase 6)
- [ ] Icon gradients (Phase 6)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| MDI icon library size impacts bundle | Medium | Low | Tree-shaking, lazy load icons, optimize bundle |
| Icon picker UX complexity | Low | Medium | Simple search, categorized icons, recent/favorites |
| State values vary across domains | Low | High | Flexible mapping, show current state in UI, examples |

### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Read before implementation, centralized icon resolution
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests using StateIconDSL
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Service in `src/services/stateIcons.ts`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Wait for icon state updates

---

## Feature 3.7: Multi-entity Support

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 4-5 days
**Status**: ⏳ Ready to Begin

### Implementation Checklist

#### Phase 1: Multi-Entity Configuration UI (Days 1-2)

- [ ] Create `MultiEntityControls.tsx` component
- [ ] UI to add multiple entities to single card:
  - [ ] Entity picker (multi-select or add multiple)
  - [ ] Reorder entities (drag-and-drop)
  - [ ] Remove entities
  - [ ] Preview showing all entity states
- [ ] Configure behavior mode:
  - [ ] Individual control (separate buttons for each entity)
  - [ ] Aggregate state (show combined state)
  - [ ] Batch actions (single button controls all)

#### Phase 2: Aggregate State Logic (Days 2-3)

- [ ] Create `src/services/multiEntity.ts` service
- [ ] Implement aggregate state functions:
  - [ ] `allOn(entities[])` → boolean (all entities are "on")
  - [ ] `anyOn(entities[])` → boolean (any entity is "on")
  - [ ] `allOff(entities[])` → boolean (all entities are "off")
  - [ ] `anyOff(entities[])` → boolean (any entity is "off")
  - [ ] `countOn(entities[])` → number (count of entities "on")
  - [ ] `averageState(entities[])` → number (for numeric states)
  - [ ] `minState(entities[])` → number
  - [ ] `maxState(entities[])` → number
- [ ] Display aggregate state in card
- [ ] Unit tests for all aggregate functions

#### Phase 3: Batch Actions (Day 3)

- [ ] Implement batch action service
- [ ] Actions apply to all entities:
  - [ ] Turn all on
  - [ ] Turn all off
  - [ ] Toggle all
  - [ ] Set all to specific state/value
  - [ ] Call service on all entities
- [ ] UI shows batch action buttons
- [ ] Confirmation dialog for destructive batch actions

#### Phase 4: YAML Storage (Day 3)

- [ ] Define `entities` property in card config (array)
- [ ] Store multi-entity configuration
- [ ] Example YAML:
  ```yaml
  entities:
    - light.living_room
    - light.kitchen
    - light.bedroom
  multi_entity_mode: batch  # or "individual" or "aggregate"
  aggregate_function: any_on  # for aggregate mode
  batch_actions:
    - turn_on
    - turn_off
    - toggle
  ```
- [ ] Serialize/deserialize multi-entity config

#### Phase 5: Card Rendering Integration (Days 4)

- [ ] Support multi-entity in card components
- [ ] Individual mode: show each entity separately (list)
- [ ] Aggregate mode: show combined state as single value
- [ ] Batch mode: show single control that affects all entities
- [ ] Real-time updates when any entity state changes
- [ ] Handle mixed entity types gracefully (e.g., light + switch)

#### Phase 6: Testing & Documentation (Day 5)

- [ ] Unit tests for aggregate state functions
- [ ] Unit tests for batch actions
- [ ] E2E tests using MultiEntityDSL
  - [ ] Add multiple entities to card
  - [ ] Aggregate state shows correctly
  - [ ] Batch action controls all entities
  - [ ] Individual mode shows separate controls
  - [ ] Real-time updates work for all entities
  - [ ] Config persists in YAML
- [ ] Documentation with examples
- [ ] Help text explaining modes

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] User can add multiple entities to single card
- [ ] Aggregate state functions work (all on, any on, count, etc.)
- [ ] Batch actions work (turn all on/off, toggle all)
- [ ] Individual mode shows separate entity controls
- [ ] Config persists in YAML
- [ ] Real-time updates for all entities
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Drag-and-drop to reorder entities
- [ ] Confirmation dialog for batch actions
- [ ] Custom aggregate function (user-defined formula)
- [ ] Visual indicator of aggregate state (e.g., "3/5 on")

**Won't Have (Out of Scope)**:
- [ ] Entity groups (HA native groups) (future)
- [ ] Conditional entity inclusion (based on state) (Phase 6)
- [ ] Cross-entity calculations (Phase 6)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| UI complexity with many entities | Medium | Medium | Pagination, collapse/expand, limit max entities |
| Performance with many entities | Medium | Low | Optimize rendering, debounce updates, lazy load |
| Batch actions fail partially | Medium | Medium | Show partial success/failure, retry logic, error handling |

### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Read before implementation, centralized multi-entity logic
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests using MultiEntityDSL
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Service in `src/services/multiEntity.ts`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Wait for all entity state updates

---

## Phase Completion Checklist

### Implementation Complete

- [ ] All 7 features implemented with full functionality
- [ ] All unit tests passing (95%+ coverage target)
- [ ] All E2E tests passing with DSL-first approach
- [ ] Visual regression tests updated (if applicable)
- [ ] Performance benchmarks met (60fps, <2s load)
- [ ] YAML round-trip serialization verified for all features
- [ ] Home Assistant integration tested (real HA instance)

### Quality Assurance

- [ ] Accessibility audit passed (WCAG 2.1 AA compliance)
- [ ] Keyboard navigation works for all features
- [ ] Screen reader compatibility verified
- [ ] All error cases handled gracefully
- [ ] Loading states and empty states implemented
- [ ] No console errors or warnings
- [ ] Memory leaks tested (long-running sessions)

### Documentation

- [ ] User documentation complete for all features
- [ ] Developer documentation updated
- [ ] API documentation generated
- [ ] Code comments added for complex logic
- [ ] Examples and tutorials created
- [ ] Release notes drafted

### Compliance Verification

- [ ] [ai_rules.md](../../ai_rules.md) compliance verified
- [ ] [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) compliance verified
- [ ] [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) compliance verified
- [ ] [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) compliance verified
- [ ] Code review completed
- [ ] Security review completed (entity access, XSS, injection)

### Release Preparation

- [ ] Branch merged to main (via PR)
- [ ] Version bumped to v0.6.0-beta.1
- [ ] Changelog updated
- [ ] Beta release created
- [ ] Stakeholders notified
- [ ] User acceptance testing scheduled

---

## Risk Management

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Entity state not available at render time | High | Medium | Graceful fallback, loading states, retry logic |
| Fuzzy matching accuracy too low | Medium | Medium | Multiple algorithms, user override, confidence threshold |
| Complex condition logic performance | Low | Low | Optimize evaluators, cache results, debounce |
| Template variable parsing conflicts | Low | Low | Unique delimiter syntax, escape handling |

### Integration Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| HA API changes break entity access | High | Low | Version compatibility checks, graceful degradation |
| Entity ID format variations | Medium | Medium | Flexible parsing, validation, user feedback |
| Attribute names differ across integrations | Low | High | Dynamic attribute discovery, custom labels |

### UX Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Features too complex for users | Medium | Medium | Simple defaults, progressive disclosure, examples |
| Smart defaults conflict with expectations | Medium | Medium | Clear UI indication, easy override, documentation |
| Remapping suggestions incorrect | Medium | Medium | Show confidence scores, allow manual override |

---

## Success Metrics

### Functional Metrics

- [ ] All 7 features deployed and functional
- [ ] Zero critical (P0) bugs
- [ ] <5 high-priority (P1) bugs at release
- [ ] 95%+ unit test coverage for new code
- [ ] 100% E2E test pass rate
- [ ] WCAG 2.1 AA compliance achieved

### Performance Metrics

- [ ] Entity context variable resolution <10ms
- [ ] Fuzzy matching <100ms for 100 entities
- [ ] Condition evaluation <5ms per condition
- [ ] No frame drops (60fps maintained)
- [ ] Memory usage <100MB increase for phase

### User Experience Metrics

- [ ] Smart defaults accuracy >80% (measured by override rate)
- [ ] Fuzzy matching accuracy >70% (user accepts top suggestion)
- [ ] Entity remapping success rate >90% (no manual fallback)
- [ ] Positive user feedback from beta testing
- [ ] <5% regression in existing features

---

## Dependencies for Future Phases

This phase provides foundation for:

### Phase 6: Template & Logic Enhancement

- **Universal Action System** depends on Smart Default Actions (3.1)
- **Visual Logic Editor** depends on Entity Context Variables (3.2) and Conditional Visibility (3.5)
- **Unified Template System** depends on Entity Context Variables (3.2)
- **State-based Styling** depends on Conditional Visibility (3.5)

### Phase 7: Ecosystem & Future Growth

- **Preset Marketplace** depends on Entity Remapping (3.3)

---

**Document Status**: ✅ Ready for Implementation
**Last Updated**: January 10, 2026
**Next Review**: After feature branch creation
**Owner**: Development Team
