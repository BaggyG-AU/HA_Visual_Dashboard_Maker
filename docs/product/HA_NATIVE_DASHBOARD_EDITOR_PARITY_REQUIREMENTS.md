# HAVDM Canvas Re-Architecture Requirements — Parity with Home Assistant Native Dashboard Editor

**Document status**: Draft for gap analysis and solution design  
**Date**: 2026-01-08  
**Product**: HA Visual Dashboard Maker (HAVDM)  
**Mission**: Re-architect HAVDM’s canvas/editor to replicate Home Assistant’s native dashboard editor (Lovelace UI) as closely as practical, while preserving HAVDM differentiators.

---

## 1. Executive Summary

### 1.1 What we’re changing and why
Home Assistant’s native dashboard editor has evolved materially since 2024, most notably with the “Sections” view becoming the default for new dashboards and introducing a grid-based, responsive, drag-and-drop editing model (Project Grace). https://www.home-assistant.io/blog/2024/11/06/release-202411/ https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support/

HAVDM currently provides an offline-capable, Electron-based visual editor with:
- A React canvas backed by `react-grid-layout` (`src/components/GridCanvas.tsx`).
- A split visual/YAML editor with explicit “Apply YAML” and rollback mechanics (`src/components/SplitViewEditor.tsx`).
- A card palette + property editing panel, with reduced toast/history churn (see `docs/releases/RELEASE_NOTES_v0.4.0-beta.1.md`).

However, HAVDM’s current internal representation is primarily **view → cards** and does not model Home Assistant’s Sections-first hierarchy as a first-class editing unit (`src/types/dashboard.ts`). This blocks parity with HA’s core mental model (views/subviews → sections → cards), including section-level drag/drop rules, section width (“wider sections”), dense placement, and native card grid sizing.

This document specifies Home Assistant’s current dashboard editor fundamentals + behaviors and defines requirements for HAVDM to replicate that editor canvas and workflow.

### 1.2 Goals and success criteria (measurable)

**G1 — Structural parity**  
HAVDM must represent and edit dashboard structure as HA does today:
- dashboards → views/subviews → (sections view) sections → cards, and (non-sections views) cards.  
Success: 95%+ of HA-produced dashboards (YAML exports) load into HAVDM with correct hierarchy visualization and no data loss on export (see “round-trip fidelity”).

**G2 — Editing parity (Sections view)**  
HAVDM must replicate the native Sections view editor interactions: creating sections, adding cards, resizing cards, reordering via drag-and-drop, and section visibility conditions.  
Success: A user can perform the same actions in HAVDM as in HA’s editor with comparable steps and outcomes (task-based usability benchmark; target ≤1.25× time-to-complete vs HA for core flows).

**G3 — YAML equivalence and safety**  
YAML is first-class. HAVDM must preserve configuration semantics and avoid data loss across parse → edit → export, while preventing invalid YAML from corrupting the visual model.  
Success: round-trip tests on representative dashboards show no loss of keys/values/order-critical constructs (to the extent YAML serialization allows), and invalid YAML is recoverable without losing last-known-good state.

**G4 — Offline-first UX without spam**  
Maintain HAVDM differentiators: improved discovery/insertion, improved property editing UX, split-screen YAML, offline design mode, and “no toast on every keystroke.”  
Success: no user-facing notification spam during typing/dragging; edits batch appropriately; UI remains responsive with large dashboards.

### 1.3 Definition of done: “replicate HA editor”

**Done (MVP parity)** means:
- HAVDM can create/edit/export dashboards in **Sections view** using the same structural model (sections + cards) and major editor affordances as HA.  
  - Sections are the primary placement unit and obey HA’s ordering/placement rules (Z-grid + optional dense placement). https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/
- HAVDM supports HA concepts: multiple dashboards, views and subviews, card picker flows (by card / by entity), and card resizing in Sections view. https://www.home-assistant.io/dashboards/dashboards/ https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/dashboards/views/ https://www.home-assistant.io/blog/2024/07/03/release-20247/
- HAVDM offers HA-consistent navigation and state cues (edit mode, hierarchy visibility, empty states, error states).
- YAML export is compatible with HA YAML mode dashboards (and storage-mode “raw configuration” style) and preserves unknown keys.

**Done (Full parity)** adds:
- View-type switching behavior parity (Sections ↔ Masonry ↔ Sidebar ↔ Panel), including what can/can’t be migrated and how HA surfaces that to users (where confirmable). https://www.home-assistant.io/dashboards/views/
- Undo/redo parity and edit-session semantics comparable to HA’s editor UX. https://www.home-assistant.io/dashboards/dashboards/
- Accessibility and keyboard behaviors comparable to HA where supported.

---

## 2. Source of Truth: HA Dashboard Fundamentals

### 2.1 Canonical concepts and nesting

**Dashboard**  
- HA supports multiple dashboards; dashboards can appear in the sidebar and be set as defaults (global/admin and per-user). https://www.home-assistant.io/dashboards/dashboards/

**View**  
- A dashboard contains a `views:` list; each view has `title`, optional `path`, `icon`, `badges`, and `cards`. https://www.home-assistant.io/dashboards/views/
- A view can be marked `subview: true`, which hides it from the top navigation bar and shows a back button; `back_path` can override navigation. https://www.home-assistant.io/dashboards/views/

**Sections view** (view layout type)  
- The “Sections” view organizes content into **sections** on a grid; you can add sections and cards, and rearrange sections/cards via drag-and-drop. https://www.home-assistant.io/dashboards/sections/
- As of HA 2024.11, Sections is no longer experimental and is the default view type when building a new dashboard. https://www.home-assistant.io/blog/2024/11/06/release-202411/ https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support/

**Section (in Sections view)**  
- In YAML exports from HA’s frontend, a Sections view uses `type: sections` on the view and a `sections:` list; a section often appears as `type: grid` and contains its own `cards:` list. (Example YAML captured from HA frontend issue with reproducible config.) https://github.com/home-assistant/frontend/issues/22970
- New sections created in the UI get an automatically-added Heading card at the top. https://www.home-assistant.io/dashboards/sections/

**Card**  
- Cards are the atomic content units. HA provides two add-card flows: “By card type” and “By entity,” and provides suggestions (e.g., Tile card suggested for Sections). https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/

### 2.2 View layout paradigms and YAML representation

HA supports different view layout types (including Sections and Masonry) and documents configuration for views, including a `type` field with default `masonry`. https://www.home-assistant.io/dashboards/views/

Notes:
- The precise list of view types and their YAML keys may evolve over time; HAVDM must not hardcode assumptions without versioning (see Data Model requirements).
- HAVDM currently includes a schema enum with `"masonry"`, `"sidebar"`, `"panel"`, `"sections"`, and `"custom:grid-layout"` (`src/schemas/ha-dashboard-schema.json`), but this schema is not a source of truth for HA itself.

### 2.3 Grid sizing and responsiveness (Sections view)

For Sections view, HA uses a 12-column grid per section and a grid cell definition (approx. `30px` width = section width / 12, `56px` height, `8px` gap). https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view

Cards can declare sizing constraints via `getGridOptions()` (default columns/rows, min/max columns/rows), and `columns: full` enforces full-width in a section. https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view

HA provides an end-user “Layout” tab in the card editor (Sections view only) to resize cards with sliders, including “Precise mode” for finer control and a revert capability. https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/blog/2024/07/03/release-20247/

### 2.4 Constraints and invariants (confirmed)

- `views` is required at the dashboard root in YAML mode. https://www.home-assistant.io/dashboards/views/ https://www.home-assistant.io/dashboards/dashboards/
- In Sections view:
  - Drag-and-drop rearrangement of sections and cards is supported; “not yet possible in other views.” https://www.home-assistant.io/dashboards/sections/
  - Section and card visibility conditions exist and use the same conditions as the Conditional card. https://www.home-assistant.io/dashboards/sections/ https://www.home-assistant.io/dashboards/cards/
- Subviews:
  - When in a subview, HA shows a back button and a simplified header; `back_path` can customize where it goes. https://www.home-assistant.io/dashboards/views/

---

## 3. HA Native Dashboard Editor: Feature Inventory

This inventory focuses on features relevant to canvas parity. Each item lists: **Description**, **Why it matters**, and **Evidence**.

### 3.1 Dashboard and edit-mode entry

**F-HA-001 Edit dashboard entry + “take control”**  
- **Description**: Editing a dashboard (especially a newly created, pre-populated one) prompts the user to “take control,” after which the dashboard is no longer automatically updated by HA’s auto-generated mechanisms. https://www.home-assistant.io/dashboards/dashboards/  
- **Why it matters**: HAVDM must model the difference between auto-generated dashboards vs user-controlled dashboards in its UX and import/export expectations.  
- **Evidence**: https://www.home-assistant.io/dashboards/dashboards/

**F-HA-002 Undo/redo buttons (dashboard editor)**  
- **Description**: HA exposes undo/redo buttons “on top of the dashboard” while editing. https://www.home-assistant.io/dashboards/dashboards/  
- **Why it matters**: Users expect non-destructive iteration and recovery in a visual editor.  
- **Evidence**: https://www.home-assistant.io/dashboards/dashboards/

### 3.2 View creation and management

**F-HA-003 Add view and choose view type**  
- **Description**: Users can add a view and choose a view type (Sections vs other types). https://www.home-assistant.io/dashboards/sections/ https://www.home-assistant.io/dashboards/views/  
- **Why it matters**: HAVDM must support multiple view types (at least represent them) and their editing affordances.  
- **Evidence**: https://www.home-assistant.io/dashboards/sections/ https://www.home-assistant.io/dashboards/views/

**F-HA-004 Subviews and navigation model**  
- **Description**: Views can be marked as subviews; subviews are hidden from the tab bar and show a back button; `back_path` can override behavior. https://www.home-assistant.io/dashboards/views/  
- **Why it matters**: Hierarchy and navigation are core to understanding dashboard structure.  
- **Evidence**: https://www.home-assistant.io/dashboards/views/

### 3.3 Sections view: creation, hierarchy, placement

**F-HA-005 Sections view creation**  
- **Description**: Create a Sections view, choose max number of sections wide, and configure header settings. https://www.home-assistant.io/dashboards/sections/  
- **Why it matters**: This is HA’s primary modern dashboard layout and must be first-class in HAVDM.  
- **Evidence**: https://www.home-assistant.io/dashboards/sections/

**F-HA-006 Add section + auto heading**  
- **Description**: Creating a section adds a Heading card automatically at the top; users can edit or delete it. https://www.home-assistant.io/dashboards/sections/ https://www.home-assistant.io/dashboards/heading/  
- **Why it matters**: This is a key structural/visual cue in HA and must be replicated for parity.  
- **Evidence**: https://www.home-assistant.io/dashboards/sections/ https://www.home-assistant.io/dashboards/heading/

**F-HA-007 Drag-and-drop sections and cards (Sections view only)**  
- **Description**: In Sections view, sections and cards can be rearranged by dragging; this is not yet possible in other view types. https://www.home-assistant.io/dashboards/sections/  
- **Why it matters**: HAVDM’s canvas behavior must align to this constraint; drag/drop in other views should be considered a deliberate divergence.  
- **Evidence**: https://www.home-assistant.io/dashboards/sections/

**F-HA-008 Z-Grid placement model + responsive section reflow**  
- **Description**: HA’s design rationale for Sections includes a grid system and “Z-Grid” approach for arranging sections left-to-right with row breaks, preserving relative layout across screen sizes. https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/  
- **Why it matters**: HAVDM must replicate the same placement mental model and responsive behavior cues.  
- **Evidence**: https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/

**F-HA-009 Wider sections + dense placement option**  
- **Description**: HA added “wider sections” (sections spanning multiple columns) and an optional dense section placement mode to fill blank spaces, with tradeoffs in predictability. https://www.home-assistant.io/blog/2024/09/04/release-20249/  
- **Why it matters**: This impacts the canvas layout algorithm and user expectations around order vs packing.  
- **Evidence**: https://www.home-assistant.io/blog/2024/09/04/release-20249/

**F-HA-010 Sections YAML fields in the wild (max_columns, dense, column spans)**  
- **Description**: A real-world Sections view config includes view-level `max_columns`, `dense_section_placement`, and per-section `column_span`, plus per-card `grid_options`. https://github.com/home-assistant/frontend/issues/22970  
- **Why it matters**: HAVDM must support reading/writing these fields to be compatible with HA-produced YAML.  
- **Evidence**: https://github.com/home-assistant/frontend/issues/22970

### 3.4 Card creation, picker UX, and suggestions

**F-HA-011 Add card from view; different entry points for Sections vs other views**  
- **Description**: In Sections view, users click into the section to add a card; in other view types, “Add card” exists at the bottom right of the view. https://www.home-assistant.io/dashboards/cards/  
- **Why it matters**: The add-card affordance reinforces hierarchy (section → cards). HAVDM should match this.  
- **Evidence**: https://www.home-assistant.io/dashboards/cards/

**F-HA-012 Add cards: By card type vs By entity**  
- **Description**: HA supports adding a card by choosing a card type or by selecting one/multiple entities; it can show suggestions and previews. https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/  
- **Why it matters**: This is core to HA’s editor productivity and should be mirrored; HAVDM can extend it.  
- **Evidence**: https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/

**F-HA-013 Add to dashboard from device pages**  
- **Description**: HA supports “Add to dashboard” from device pages and prompts for target dashboard/view; in Sections views, it may create a new section with tile cards. https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/ https://www.home-assistant.io/dashboards/cards/  
- **Why it matters**: Users expect multi-entity insertion flows and auto-structuring behaviors.  
- **Evidence**: https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/ https://www.home-assistant.io/dashboards/cards/

### 3.5 Card editing: layout, actions, visibility

**F-HA-014 Layout tab: resize + precise mode + revert**  
- **Description**: In Sections view, the card editor has a Layout tab for resizing with sliders, a “Precise mode,” and a revert mechanism. https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/blog/2024/07/03/release-20247/  
- **Why it matters**: HAVDM needs the same “layout” editing conceptual UI, even if implementation differs.  
- **Evidence**: https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/blog/2024/07/03/release-20247/

**F-HA-015 Visibility tab for cards/badges and constraint: not inside nested cards**  
- **Description**: Users can show/hide cards or badges via Visibility conditions; Visibility tab is not available inside nested cards like vertical stack/horizontal stack/grid card. https://www.home-assistant.io/dashboards/cards/  
- **Why it matters**: HAVDM must surface equivalent constraints and not mislead users about what HA will support in UI.  
- **Evidence**: https://www.home-assistant.io/dashboards/cards/

**F-HA-016 Actions model**  
- **Description**: Cards can define tap/hold/double tap actions; action types include `more-info`, `toggle`, `perform-action`, `navigate`, `url`, `assist`, `none`. https://www.home-assistant.io/dashboards/actions/  
- **Why it matters**: HAVDM’s property editing should align with HA’s action taxonomy and YAML fields.  
- **Evidence**: https://www.home-assistant.io/dashboards/actions/

### 3.6 Heading card (new native structuring primitive)

**F-HA-017 Heading card capabilities**  
- **Description**: Heading card provides title/subtitle structure, icons, navigation/actions, and “heading badges” with entity state display and actions. https://www.home-assistant.io/dashboards/heading/ https://www.home-assistant.io/blog/2024/10/02/release-202410/  
- **Why it matters**: Headings are central to Sections view information hierarchy; HAVDM must support them as first-class card type (not as section metadata).  
- **Evidence**: https://www.home-assistant.io/dashboards/heading/ https://www.home-assistant.io/blog/2024/10/02/release-202410/

### 3.7 YAML and editor parity (what can be confirmed)

**F-HA-018 YAML mode for dashboards + refresh behavior**  
- **Description**: HA supports YAML dashboards (`lovelace: mode: yaml`) and allows refreshing the UI via a refresh control without restarting HA. https://www.home-assistant.io/dashboards/dashboards/  
- **Why it matters**: HAVDM export/import should align with YAML-mode dashboards and enable iterative workflows.  
- **Evidence**: https://www.home-assistant.io/dashboards/dashboards/

**F-HA-019 Unknown / not confirmed in this doc (explicit)**
- HA’s exact UI↔YAML synchronization rules (e.g., whether HA offers true split-screen) are not described in the official docs pages consulted here. HAVDM can preserve its split-screen differentiator, but must clearly label differences from HA where they exist.

---

## 4. HA Native Editor Information Architecture + Interaction Model

### 4.1 How HA communicates structure and hierarchy

**Hierarchy cues**
- **Dashboard-level**: dashboard selection in sidebar; dashboard list and settings exist under Settings > Dashboards. https://www.home-assistant.io/dashboards/dashboards/
- **View-level**: views appear as top navigation (tabs); subviews are hidden and have a back button and title-only header. https://www.home-assistant.io/dashboards/views/
- **Sections view**:
  - Sections are visually grouped and act as the “base unit” for layout; the add-card entry point is scoped to a section. https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/
  - A heading card commonly acts as the first card in a section and provides the section title/subtitle and optional badge-style metadata. https://www.home-assistant.io/dashboards/sections/ https://www.home-assistant.io/dashboards/heading/

### 4.2 Navigation and “where am I?”
- View paths form URLs under `/lovelace/` and users can navigate via actions (navigate action). https://www.home-assistant.io/dashboards/views/ https://www.home-assistant.io/dashboards/actions/
- Subviews change the top bar to a back button + title-only. https://www.home-assistant.io/dashboards/views/

### 4.3 Change propagation and reflow behavior
- Sections view is designed to be responsive: as screen width changes, sections reflow across rows while preserving within-section card column structure for muscle memory. https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/
- Wider sections revert to one section wide on smaller screens. https://www.home-assistant.io/blog/2024/09/04/release-20249/

### 4.4 States: empty, loading, error, conflict, invalid YAML
What is confirmable from sources used:
- **Empty**: HA supports adding cards/views/sections and provides “Add card” affordances in the relevant contexts. https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/dashboards/sections/
- **Invalid config**: HA docs describe YAML dashboards and raw configuration editing, but do not fully specify recovery UX; HAVDM must provide safer recovery mechanisms (explicit requirement below).

---

## 5. HAVDM Target Capability Model

### 5.1 Minimum parity set (MVP parity)

MVP parity is **Sections view parity**, because it is the modern default and enables drag-and-drop editing and grid-resizing workflows.

MVP parity includes:
- Multiple dashboards workspace in HAVDM (local + connected workflows) with the ability to choose a target dashboard/view context (mirroring HA’s multi-dashboard concept). https://www.home-assistant.io/dashboards/dashboards/
- Views + subviews (create/edit, navigation metadata, and YAML fields `subview`/`back_path`). https://www.home-assistant.io/dashboards/views/
- Sections view:
  - Create/edit view of type `sections`. https://www.home-assistant.io/dashboards/sections/
  - Create/delete/reorder sections; add cards to sections; auto-add heading card on new section (or emulate). https://www.home-assistant.io/dashboards/sections/
  - Drag-and-drop sections and cards (sections view only), with placement model aligned to HA’s Z-grid. https://www.home-assistant.io/dashboards/sections/ https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/
  - Card resize UI aligned to HA’s Layout tab affordances (sliders + precise mode + revert). https://www.home-assistant.io/dashboards/cards/ https://www.home-assistant.io/blog/2024/07/03/release-20247/
  - Visibility conditions for sections and cards, matching HA’s condition model and constraints around nested cards. https://www.home-assistant.io/dashboards/sections/ https://www.home-assistant.io/dashboards/cards/
- Heading card support (native card) including badges and action types. https://www.home-assistant.io/dashboards/heading/ https://www.home-assistant.io/dashboards/actions/
- YAML editing as first-class: load/render/edit/export with safe recovery on invalid YAML.

### 5.2 Full parity set (later milestone)
- Parity for non-Sections view types (Masonry/Sidebar/Panel), including view-type switching semantics and migration prompts (to the extent confirmable / testable). https://www.home-assistant.io/dashboards/views/
- Parity-level undo/redo across editor operations, comparable to HA’s dashboard editor. https://www.home-assistant.io/dashboards/dashboards/
- Deeper parity for add-card suggestions and device “Add to Dashboard” flows, including auto-section creation behavior for Sections view. https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/

### 5.3 Offline-first considerations
HAVDM must work without HA connectivity while remaining HA-compatible:
- Provide a “design-time entity catalog” abstraction (local stub) to allow entity selection and validation in offline mode (see Data Model requirements).
- Ensure exports are valid HA YAML even when entities are placeholders.
- Avoid HA API assumptions in the core canvas/editor logic; connectivity augments, not defines, core behavior.

### 5.4 Compatibility goals (HA versions)
- Target baseline: **Home Assistant 2024.11+** for Sections as default and non-experimental, plus Heading card era. https://www.home-assistant.io/blog/2024/11/06/release-202411/ https://www.home-assistant.io/dashboards/heading/
- HAVDM must support importing older dashboards (pre-sections) by rendering them as their view type and preserving YAML (even if not fully editable in parity mode).

### 5.5 YAML round-trip fidelity requirements
HAVDM must support:
- **Read → Render → Edit → Export** with **no data loss** for supported schema elements.
- **Unknown-key preservation**: fields not understood by HAVDM (including custom cards, experimental keys, future HA keys) must be retained and round-tripped.
- **Stable diff mode** (best-effort): exports should avoid unnecessary churn (ordering stability where possible), while acknowledging YAML serialization limitations.

---

## 6. Functional Requirements (numbered, testable)

### 6.1 Structure and navigation

**FR-001 Dashboard Hierarchy Model**
- **Description**: HAVDM shall represent dashboards using a canonical tree: `Dashboard → View → (optional) Section → Card`, with support for non-sections views that use `View → Card`.
- **User value**: Matches HA’s mental model and enables a parity canvas for Sections view.
- **Acceptance criteria**:
  - Given a YAML dashboard with `views`, when loaded, then HAVDM shows a view list and can select a view to edit. (https://www.home-assistant.io/dashboards/views/)
  - Given a view with `type: sections` and `sections:`, when loaded, then HAVDM shows sections as first-class containers and cards nested within them. (https://github.com/home-assistant/frontend/issues/22970)
- **Notes / constraints**: Must preserve unknown fields on views/sections/cards.
- **Traceability**: F-HA-005, F-HA-010.

**FR-002 View and Subview Support**
- **Description**: HAVDM shall support editing view metadata, including `title`, `path`, `icon`, `subview`, and `back_path`.
- **User value**: Enables HA-like navigation structures and deep-linking.
- **Acceptance criteria**:
  - Given a view marked `subview: true`, when rendered in the structure panel, then HAVDM indicates it is a subview and exposes `back_path` editing. (https://www.home-assistant.io/dashboards/views/)
  - Given a view `path`, when edited, then HAVDM validates allowed characters and warns about invalid/unsafe paths (best-effort).
- **Notes / constraints**: HA has path parsing constraints and URL behaviors; HAVDM should validate but also allow raw YAML editing for edge cases. (https://www.home-assistant.io/dashboards/views/)
- **Traceability**: F-HA-004.

**FR-003 Multiple Dashboards Workspace**
- **Description**: HAVDM shall support managing multiple dashboards (open, create, switch context) consistent with HA’s concept of multiple dashboards.
- **User value**: Mirrors HA and supports larger organizations and role-based dashboards.
- **Acceptance criteria**:
  - Given multiple dashboards loaded into HAVDM, when the user switches dashboards, then the editor context (views/sections/cards selection) updates accordingly and preserves unsaved work warnings.
- **Traceability**: HA multi-dashboard concept. (https://www.home-assistant.io/dashboards/dashboards/)

### 6.2 Sections view creation and editing

**FR-004 Create and Edit Sections View**
- **Description**: HAVDM shall allow creating a view of type `sections` and editing its Sections-specific settings.
- **User value**: Enables parity with HA’s modern default dashboard layout.
- **Acceptance criteria**:
  - Given a dashboard, when the user creates a new view and selects “Sections” type, then the view is created as `type: sections` and is editable in the Sections canvas. (https://www.home-assistant.io/dashboards/sections/)
  - Given a Sections view, when the user configures header settings, then HAVDM can edit the header configuration fields exposed in HA docs (`layout`, `badges_position`, and title `card`). (https://www.home-assistant.io/dashboards/sections/)
- **Notes / constraints**: HA docs list only `type` and header fields explicitly; other keys may exist in real configs and must be preserved. (https://www.home-assistant.io/dashboards/sections/)
- **Traceability**: F-HA-005.

**FR-005 Create Section**
- **Description**: HAVDM shall create a new section in a Sections view and automatically insert a Heading card at the top by default, matching HA’s behavior.
- **User value**: Matches HA’s hierarchy cues and speeds organization.
- **Acceptance criteria**:
  - Given a Sections view, when the user clicks “Create section,” then a new section appears and contains a heading card as the first card. (https://www.home-assistant.io/dashboards/sections/)
  - Given the new section, when the user deletes the heading card, then the section remains and can contain other cards. (https://www.home-assistant.io/dashboards/sections/)
- **Traceability**: F-HA-006.

**FR-006 Delete Section**
- **Description**: HAVDM shall allow deleting a section from a Sections view.
- **User value**: Enables iterative layout design.
- **Acceptance criteria**:
  - Given a Sections view with ≥1 section, when the user selects delete on a section, then that section and its cards are removed (with confirmation).
- **Traceability**: Sections delete flow. (https://www.home-assistant.io/dashboards/sections/)

**FR-007 Reorder Sections (Drag-and-Drop)**
- **Description**: HAVDM shall support dragging sections to reorder them in the view.
- **User value**: Matches HA’s core Sections editing experience.
- **Acceptance criteria**:
  - Given a Sections view with multiple sections, when the user drags a section to a new location, then other sections reflow and the dropped section lands in the expected Z-grid position. (https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/ https://www.home-assistant.io/dashboards/sections/)
- **Notes / constraints**: Must support optional “dense placement” mode where enabled and reflect its tradeoffs. (https://www.home-assistant.io/blog/2024/09/04/release-20249/)
- **Traceability**: F-HA-007, F-HA-008, F-HA-009.

**FR-008 Reorder Cards within and across Sections (Drag-and-Drop)**
- **Description**: HAVDM shall support dragging cards to reorder within a section and moving across sections.
- **User value**: Core workflow for dashboard refinement.
- **Acceptance criteria**:
  - Given a section with multiple cards, when the user drags a card, then the card can be repositioned with a predictable target preview and final placement.
  - Given multiple sections, when the user drags a card from section A to section B, then the card is removed from A and inserted into B at the chosen location.
- **Notes / constraints**: HA states drag-and-drop rearrangement is not yet available in other view types; HAVDM should match this restriction for parity mode. (https://www.home-assistant.io/dashboards/sections/)
- **Traceability**: F-HA-007.

### 6.3 Section width, responsive behavior, and layout algorithm

**FR-009 Section Column Span (Wider Sections)**
- **Description**: HAVDM shall support sections spanning multiple “section columns” (wider sections), including editing the width/span.
- **User value**: Enables layouts like wide maps/cameras and dense dashboards.
- **Acceptance criteria**:
  - Given a section, when the user sets it to span N columns, then the canvas reflects the new width and reflows other sections accordingly.
  - Given a small screen breakpoint simulation, when a section is wider than 1 column, then HAVDM indicates/implements the “revert to one section wide” behavior for smaller screens (at least as a preview mode). (https://www.home-assistant.io/blog/2024/09/04/release-20249/)
- **Traceability**: F-HA-009, F-HA-010.

**FR-010 Dense Section Placement Mode**
- **Description**: HAVDM shall support a toggle equivalent to HA’s “dense section layout,” filling blank spaces where possible.
- **User value**: Gives users control over predictability vs space efficiency.
- **Acceptance criteria**:
  - Given dense placement disabled, when sections are reordered, then layout preserves Z-grid order even if gaps result. (https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/)
  - Given dense placement enabled, when gaps exist, then the algorithm attempts to fill them while warning that order/predictability may change. (https://www.home-assistant.io/blog/2024/09/04/release-20249/)
- **Traceability**: F-HA-009, F-HA-010.

### 6.4 Card insertion (picker, entity discovery) and targeting

**FR-011 Add Card Entry Points (Sections vs non-Sections)**
- **Description**: HAVDM shall replicate HA’s add-card entry points: scoped to a section in Sections view, and a floating “Add card” action in other view types.
- **User value**: Reinforces hierarchy and reduces placement errors.
- **Acceptance criteria**:
  - Given Sections view, when user selects a section, then “Add card” applies to that section. (https://www.home-assistant.io/dashboards/cards/)
  - Given a Masonry/Panel/Sidebar view, when user selects “Add card,” then the card is added to the view-level cards list. (https://www.home-assistant.io/dashboards/cards/)
- **Traceability**: F-HA-011.

**FR-012 Card Picker: By Card Type and By Entity**
- **Description**: HAVDM shall provide both HA-style add flows and preserve HAVDM enhancements.
- **User value**: Matches HA familiarity while leveraging HAVDM’s productivity features.
- **Acceptance criteria**:
  - Given the user chooses “By card type,” when they search/browse and select a card type, then HAVDM creates the appropriate card config and inserts it at the target location. (https://www.home-assistant.io/dashboards/cards/)
  - Given the user chooses “By entity,” when they select multiple entities, then HAVDM proposes a set of cards and inserts them on confirmation. (https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/)
- **Notes / constraints**: HAVDM may exceed HA here (better discovery), but must still be able to emulate HA’s baseline flows.
- **Traceability**: F-HA-012.

**FR-013 Auto-Section Creation for Multi-Entity Insertion (Optional / Full parity)**
- **Description**: When inserting multiple entities into a Sections view, HAVDM shall optionally create a new section and populate it with tile cards (or HA-equivalent defaults) as HA does for “Add to Dashboard” flows.
- **Acceptance criteria**:
  - Given a Sections view, when user adds multiple entities via a “device add” style flow, then HAVDM offers to create a new section and populates it. (https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/)
- **Traceability**: F-HA-013.

### 6.5 Card editing: GUI, layout sizing, actions, visibility

**FR-014 Layout Tab Parity for Card Resizing**
- **Description**: In Sections view, HAVDM shall expose a “Layout” editing surface for card sizing, including a simple mode, a “precise mode,” and a revert-to-default action.
- **User value**: Matches HA’s sizing UX and supports grid-aligned dashboards.
- **Acceptance criteria**:
  - Given a card in Sections view, when user opens card editor, then a Layout tab exists and uses slider-like controls for width/height. (https://www.home-assistant.io/dashboards/cards/)
  - Given precise mode enabled, when adjusting size, then finer increments are available (even if implemented differently). (https://www.home-assistant.io/dashboards/cards/)
  - Given a resized card, when user selects revert, then the card returns to its default size. (https://www.home-assistant.io/blog/2024/07/03/release-20247/)
- **Traceability**: F-HA-014.

**FR-015 Actions Editing Parity**
- **Description**: HAVDM shall support configuring actions consistent with HA’s actions taxonomy and YAML structure.
- **User value**: Ensures portability and reduces surprises when deploying to HA.
- **Acceptance criteria**:
  - Given a card supporting actions, when the user configures a tap action, then YAML uses HA action keys/values (`action: navigate`, etc.) and validations align to HA docs. (https://www.home-assistant.io/dashboards/actions/)
- **Traceability**: F-HA-016.

**FR-016 Visibility Conditions for Cards and Badges**
- **Description**: HAVDM shall support card/badge visibility conditions equivalent to HA’s Visibility tab and reflect HA constraints.
- **User value**: Enables context-aware dashboards without custom conditional wrappers.
- **Acceptance criteria**:
  - Given a card, when user adds visibility conditions, then YAML uses the `visibility:` list and applies AND semantics by default. (HA docs describe “all conditions must be met.”) https://www.home-assistant.io/dashboards/cards/
  - Given a card is nested inside a stack/grid card, when user attempts to add visibility via GUI, then HAVDM warns that HA does not expose Visibility tab for nested cards and offers YAML-only editing (or a parity-preserving alternative). https://www.home-assistant.io/dashboards/cards/
- **Traceability**: F-HA-015.

**FR-017 Section Visibility Conditions**
- **Description**: HAVDM shall support visibility conditions at section level in Sections view.
- **User value**: Enables role-based and state-based grouping.
- **Acceptance criteria**:
  - Given a section, when user adds visibility conditions, then those conditions are stored on the section and affect rendering in the canvas preview. https://www.home-assistant.io/dashboards/sections/
- **Traceability**: F-HA-007.

**FR-018 Heading Card Support (Native)**
- **Description**: HAVDM shall support editing the Heading card’s core fields, including `heading`, `heading_style`, `icon`, `tap_action`, and heading `badges`.
- **User value**: Required to match HA’s native structuring approach.
- **Acceptance criteria**:
  - Given a heading card, when user edits it, then YAML matches documented fields and validations. https://www.home-assistant.io/dashboards/heading/
  - Given a heading card with actions, when configured, then a chevron indicator (or equivalent) is shown to reflect clickability. https://www.home-assistant.io/dashboards/heading/
- **Traceability**: F-HA-017.

### 6.6 YAML editing, validation, and recovery

**FR-019 YAML as First-Class View with Safe Apply**
- **Description**: HAVDM shall provide YAML editing as a first-class mode, with validation and a safe apply mechanism that prevents corrupting the visual model.
- **User value**: Supports advanced users and aligns with HA’s YAML mode ecosystem.
- **Acceptance criteria**:
  - Given YAML contains syntax errors, when the user edits YAML, then HAVDM shows inline errors and does not apply the changes to the visual model until valid and confirmed.
  - Given YAML was last valid, when YAML becomes invalid, then HAVDM preserves and allows rollback to last-known-good.
- **Notes / constraints**: HAVDM already implements an explicit apply/rollback pattern; parity requires mapping edits to new sections model as well.
- **Traceability**: HAVDM differentiator; HA supports YAML mode and raw editor. https://www.home-assistant.io/dashboards/dashboards/

**FR-020 YAML Round-Trip Unknown-Key Preservation**
- **Description**: HAVDM shall preserve and re-emit unknown keys for dashboard/view/section/card objects.
- **User value**: Prevents breaking custom cards, experimental settings, and future HA fields.
- **Acceptance criteria**:
  - Given an imported dashboard contains unrecognized keys at any level, when user edits unrelated fields and exports, then the unknown keys remain unchanged in export.
- **Traceability**: HA schema is extensible and evolves; HA supports many custom resources. (General requirement derived from observed ecosystem; implementation must be conservative.)

### 6.7 Undo/redo and history model

**FR-021 Undo/Redo Across Canvas Operations**
- **Description**: HAVDM shall support undo/redo for structural edits (add/move/delete sections; add/move/delete cards; resize; property edits) in a way comparable to HA’s editor affordance.
- **User value**: Reduces fear and increases iteration speed.
- **Acceptance criteria**:
  - Given a user performs a sequence of edits, when they invoke undo repeatedly, then the visual model and YAML representation revert stepwise to previous states.
  - Given undo, when redo is invoked, then the states reapply in order.
- **Traceability**: HA dashboard editor exposes undo/redo buttons. https://www.home-assistant.io/dashboards/dashboards/

### 6.8 Import/export and compatibility

**FR-022 Import HA YAML Dashboards**
- **Description**: HAVDM shall import HA dashboard YAML (YAML mode files and “raw configuration” exports) and render them.
- **User value**: Enables real workflows and prevents lock-in.
- **Acceptance criteria**:
  - Given a YAML file with `lovelace: mode: yaml` dashboard structure and `views`, when imported, then HAVDM loads successfully and identifies view types. https://www.home-assistant.io/dashboards/dashboards/
- **Traceability**: HA YAML dashboards documentation. https://www.home-assistant.io/dashboards/dashboards/

**FR-023 Export HA-Compatible YAML**
- **Description**: HAVDM shall export HA-compatible YAML that HA can load without manual fixes (within supported feature set).
- **User value**: Enables deployment back to HA and sharing.
- **Acceptance criteria**:
  - Given a HAVDM-edited dashboard, when exported, then it preserves required keys and produces YAML that matches HA’s expected structure for the used view types. https://www.home-assistant.io/dashboards/views/ https://www.home-assistant.io/dashboards/sections/
- **Notes / constraints**: Some HA behaviors may be storage-mode-only or UI-only; HAVDM must document limitations.

### 6.9 Search and navigation within large dashboards

**FR-024 Structure Navigation and Search**
- **Description**: HAVDM shall provide a structure panel with search to locate views/subviews/sections/cards by title/type/entity references.
- **User value**: Essential for large dashboards and faster editing.
- **Acceptance criteria**:
  - Given a dashboard with ≥100 cards, when searching for an entity id, then HAVDM lists matching cards and can focus/select them in the canvas.

### 6.10 Parity fidelity rules

**FR-025 Parity Fidelity Classification**
- **Description**: HAVDM shall classify editor behaviors into:
  - **Exact match** (must behave like HA),
  - **Compatible divergence** (different UX but same resulting YAML/structure),
  - **HAVDM extension** (optional, off by default in “HA parity mode”).
- **User value**: Prevents confusion and simplifies gap analysis and QA.
- **Acceptance criteria**:
  - Given “HA parity mode” enabled, when the user performs placement/resizing actions, then results match HA’s model for the same inputs.
  - Given “HAVDM extensions” enabled, the UI clearly labels non-HA behaviors.

**FR-026 View Type Switching and Migration Guardrails (Full parity)**
- **Description**: HAVDM shall allow changing a view’s layout type (e.g., Masonry ↔ Sections) with explicit guardrails for what can/can’t be converted without loss.
- **User value**: Enables iterative layout exploration without breaking dashboards.
- **Acceptance criteria**:
  - Given a view in Masonry, when the user switches to Sections, then HAVDM either (a) offers a guided migration (creating sections and placing cards) or (b) blocks conversion and explains why, without data loss.
  - Given a view in Sections with sections-specific keys, when the user switches away from Sections, then HAVDM preserves sections config in YAML (or stores it in a reversible way) and warns the user about HA compatibility implications.
- **Notes / constraints**: HA documents that view types exist but does not specify conversion semantics in the docs referenced here; HAVDM must treat conversion as potentially lossy and require explicit user confirmation. https://www.home-assistant.io/dashboards/views/
- **Traceability**: F-HA-003.

**FR-027 Offline Mode and Later Sync (HAVDM differentiator)**
- **Description**: HAVDM shall support offline editing (no HA connection) with a clear “design-time” state and optional later sync/deploy workflows.
- **User value**: Enables portable, fast iteration and professional workflows (e.g., designing on a laptop).
- **Acceptance criteria**:
  - Given offline mode, when the user adds a card requiring entity selection, then HAVDM allows placeholder entity ids and marks them as unresolved until an entity catalog is provided.
  - Given the user later connects to HA, when an entity catalog is fetched, then HAVDM resolves placeholders where possible and surfaces conflicts without blocking editing.
- **Traceability**: HAVDM differentiator; aligns with HA’s multi-dashboard ecosystem but extends it offline. https://www.home-assistant.io/dashboards/dashboards/

**FR-028 Split-Screen Editor Mode (HAVDM differentiator; parity-compatible)**
- **Description**: HAVDM shall provide a split-screen mode (visual + YAML) with deterministic sync semantics and clear status.
- **User value**: Preserves advanced workflows and reduces context switching compared to single-mode editors.
- **Acceptance criteria**:
  - Given split-screen mode, when the user edits visually, then YAML updates automatically and remains valid.
  - Given split-screen mode, when the user edits YAML, then HAVDM validates in real-time and requires explicit apply before mutating the visual model.
  - Given a selected card/section, when the user requests “jump to YAML,” then the YAML view scrolls to and highlights the corresponding node.
- **Notes / constraints**: HA docs do not confirm an equivalent split-screen; HAVDM must label this as an enhancement and ensure exported YAML remains HA-compatible. https://www.home-assistant.io/dashboards/dashboards/

**FR-029 Empty-State Parity for Sections and Views**
- **Description**: HAVDM shall present HA-like empty states and affordances for adding content at the correct hierarchy level.
- **User value**: Reduces onboarding friction and prevents “where do I add this?” confusion.
- **Acceptance criteria**:
  - Given an empty Sections view (no sections), when opened, then HAVDM prompts to create a section and explains the hierarchy (section → cards). https://www.home-assistant.io/dashboards/sections/
  - Given a section with only a heading card, when opened, then HAVDM highlights the “add card to this section” affordance. https://www.home-assistant.io/dashboards/cards/

---

## 7. Non-Functional Requirements (NFR-###)

**NFR-001 Performance (Large Dashboards)**
- The editor shall remain interactive (no noticeable input lag) for dashboards with:
  - 20 views,
  - 200+ cards total,
  - 50+ cards in a single Sections view,
  - frequent drag/resize operations.

**NFR-002 Reliability / Data Integrity**
- HAVDM shall never silently drop configuration fields when importing/exporting YAML.
- Invalid YAML shall never overwrite last-known-good visual state without explicit user confirmation.

**NFR-003 Usability (Noisy feedback)**
- No “toast on every keystroke” or equivalent spam during typing/resizing/dragging; feedback should batch and/or be inline (HAVDM already targets this behavior).

**NFR-004 Accessibility**
- Canvas operations (selection, open editor, delete) shall be keyboard-accessible where feasible; focus order must be deterministic; interactive controls must have accessible names.

**NFR-005 Cross-Platform (Electron)**
- The editor shall behave consistently on Windows and Linux.
- Drag-and-drop and resizing interactions shall work on trackpads and mice.

**NFR-006 Testability**
- Requirements-critical behaviors shall have unit/integration/e2e test coverage (where tests exist in repo) for:
  - YAML parse/serialize round-trip,
  - drag-and-drop placement outcomes,
  - resize behavior and revert,
  - undo/redo correctness,
  - unknown-key preservation.

**NFR-007 Maintainability**
- The editor architecture shall have clear separation between:
  - canonical data model,
  - layout/placement engine,
  - rendering layer,
  - YAML mapping/serialization.

**NFR-008 Observability / Diagnostics**
- Provide structured logs for: import failures, validation errors, YAML apply/rollback actions, and layout engine exceptions (without leaking secrets).

---

## 8. Data Model + State Model Requirements (conceptual)

### 8.1 Canonical internal model

**DMR-001 Normalized Dashboard Tree**
- HAVDM shall maintain a canonical normalized model with stable IDs for dashboard/view/section/card nodes (IDs may be synthetic for YAML that lacks IDs).
- The model must represent:
  - View types (at minimum: Sections vs non-Sections),
  - Section properties (visibility, span/width, ordering),
  - Card properties (including grid sizing and unknown fields).

**DMR-002 Dual Representation: AST-like YAML + Canonical Model**
- HAVDM shall maintain:
  1) a canonical model for editing and rendering, and
  2) a YAML mapping layer that can preserve unknown fields and produce stable exports.
- Rationale: HA configs evolve; preserving unknowns requires more than strict typed parsing.

### 8.2 Mapping to/from HA YAML

**DMR-003 View Mapping**
- For each view:
  - Preserve known keys per HA docs (`title`, `path`, `icon`, `badges`, `cards`, `subview`, `back_path`, `visible`, `type`). https://www.home-assistant.io/dashboards/views/
  - Preserve unknown keys for forward compatibility.

**DMR-004 Sections View Mapping**
- For `type: sections` views:
  - Preserve view-level keys used by HA (example: `max_columns`, `dense_section_placement`). https://github.com/home-assistant/frontend/issues/22970
  - Preserve `sections:` list and per-section properties (example: `column_span`, `cards`, visibility). https://github.com/home-assistant/frontend/issues/22970 https://www.home-assistant.io/dashboards/sections/
  - Preserve per-card grid sizing configuration (commonly represented as `grid_options` in HA configs in the wild). https://github.com/home-assistant/frontend/issues/22970
  - Align sizing semantics to HA’s 12-column section grid and row/column cell sizing. https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view

**DMR-005 Migration and Versioning Strategy**
- HAVDM shall version its internal schema mappings by HA version bands (e.g., pre-2024.11 vs 2024.11+), because the default layout/editor behaviors changed. https://www.home-assistant.io/blog/2024/11/06/release-202411/
- HAVDM shall include a migration layer that can:
  - load older dashboards,
  - represent them without data loss,
  - optionally offer guided migration into Sections view (feature flagged; product decision).

### 8.3 Validation and error model

**DMR-006 Multi-Stage Validation**
- HAVDM shall validate at:
  - YAML syntax level,
  - structural level (required `views`, list types),
  - semantic level (best-effort: e.g., invalid action types).
- Validation must produce an error object that includes:
  - severity,
  - location (node id + YAML path),
  - user-facing message,
  - recovery suggestion.

---

## 9. UX Guidelines + Editor Ergonomics

### 9.1 Core UX rules
- **No toast spam**: Avoid notifications per keystroke; use inline indicators and batch commit notifications.
- **Clear hierarchy visualization**:
  - Always show whether you are editing a **dashboard**, **view**, **section**, or **card**.
  - In Sections view, selection state must clearly indicate the active section and active card.
- **Predictable drag/drop**:
  - Always show drop previews.
  - Prefer “snap to grid” behaviors aligned to HA’s grid and Z-grid logic. https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/
- **Resizing ergonomics**:
  - Provide the same mental model as HA’s Layout tab (sliders + precise mode + revert). https://www.home-assistant.io/dashboards/cards/
- **Safe YAML editing**:
  - Explicit apply for structural edits from YAML is acceptable (and preferred for safety).
  - Always provide rollback to last valid state.

### 9.2 Split-screen behavior expectations (HAVDM differentiator)
- Split-screen must maintain:
  - deterministic sync directionality (visual→YAML immediate; YAML→visual safe apply),
  - clear status indicators (“synced/pending/error”),
  - navigation aids (select card → jump to YAML).
- HAVDM must label this as a HAVDM enhancement if HA does not offer equivalent split-screen.

### 9.3 Keyboard/mouse interactions
- Keyboard:
  - Selection traversal across cards and sections.
  - Delete with confirmation.
  - Undo/redo shortcuts consistent with platform conventions.
- Mouse:
  - Drag section handle vs drag card body (or close equivalent).
  - Resize via editor UI (not only direct-resize handles) to match HA’s slider paradigm.

---

## 10. Out of Scope (for this phase)

- Implementing a full Solution Architecture Document (SAD), Detailed Design Document (DDD), or user stories (this document enables those).
- Re-implementing HA’s full frontend rendering engine inside HAVDM.
- Full fidelity preview of every custom card without an HA runtime (offline mode will rely on placeholders or partial renderers).
- Real-time collaboration.
- Automated migration of arbitrary Masonry dashboards into Sections layout (may be a later product feature; not required for MVP parity).

---

## 11. Open Questions / Risks / Assumptions

### 11.1 Open questions (requires confirmation/prototyping)
1. **Exact YAML field names for card sizing in Sections**: HA documentation for end-user card resizing does not explicitly name YAML keys for the stored sizing; configs in the wild show `grid_options` and/or `layout_options`. HAVDM must preserve both when present and avoid destructive normalization. https://github.com/home-assistant/frontend/issues/22970 https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view
2. **View-type migration UX**: HA’s exact behavior when converting existing views to Sections (and whether it migrates cards automatically) is not fully specified in the official docs referenced here.
3. **Undo/redo granularity**: HA has undo/redo controls, but the exact granularity and what operations are undoable is not specified in docs. https://www.home-assistant.io/dashboards/dashboards/

### 11.2 Risks
- **Schema drift**: HA dashboard schema evolves; hardcoded schemas will become stale.
- **Custom cards**: Many custom cards have bespoke sizing and editor support; HAVDM must avoid breaking them via export or forced transformations.
- **Layout correctness**: Replicating Z-grid + dense placement while maintaining a responsive preview requires careful algorithm design and testing.

### 11.3 Assumptions (explicit)
- HAVDM will target HA 2024.11+ semantics as the “modern baseline” while still importing older dashboards without data loss. https://www.home-assistant.io/blog/2024/11/06/release-202411/
- HAVDM will maintain its safer YAML apply/rollback approach even if HA’s UI applies changes differently; parity is defined primarily by resulting structure and user-perceived workflow.

---

## 12. Appendix

### 12.1 Glossary (HA terms)
- **Dashboard**: A Lovelace UI configuration with one or more views; HA supports multiple dashboards. https://www.home-assistant.io/dashboards/dashboards/
- **View**: A tab/page in a dashboard; has layout type and contains cards (and/or sections). https://www.home-assistant.io/dashboards/views/
- **Subview**: A view hidden from the main tab bar that shows a back button; configured with `subview: true`. https://www.home-assistant.io/dashboards/views/
- **Sections view**: A view type that organizes cards into sections on a grid and supports drag-and-drop and resizing. https://www.home-assistant.io/dashboards/sections/
- **Section**: A grouping unit in Sections view, typically containing a heading card and other cards. https://www.home-assistant.io/dashboards/sections/
- **Heading card**: A native card used for titles/subtitles and metadata badges. https://www.home-assistant.io/dashboards/heading/
- **Z-Grid**: HA’s described placement approach for arranging sections left-to-right with row breaks. https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/

### 12.2 Links / citations list (grouped)

**Official HA documentation**
- https://www.home-assistant.io/dashboards/dashboards/
- https://www.home-assistant.io/dashboards/views/
- https://www.home-assistant.io/dashboards/sections/
- https://www.home-assistant.io/dashboards/cards/
- https://www.home-assistant.io/dashboards/actions/
- https://www.home-assistant.io/dashboards/heading/

**Official HA blog / release notes**
- https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/
- https://www.home-assistant.io/blog/2024/07/03/release-20247/
- https://www.home-assistant.io/blog/2024/09/04/release-20249/
- https://www.home-assistant.io/blog/2024/10/02/release-202410/
- https://www.home-assistant.io/blog/2024/11/06/release-202411/

**Home Assistant Developer Docs**
- https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card
- https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support/
- https://developers.home-assistant.io/docs/frontend/custom-ui/custom-view/

**HA frontend repo evidence (YAML fields in practice)**
- https://github.com/home-assistant/frontend/issues/22970

### 12.3 Example YAML snippets (illustrative, small)

**A) Basic dashboard skeleton**
```yaml
title: My Dashboard
views:
  - title: Home
    path: home
    cards:
      - type: entities
        entities:
          - light.living_room
```
Docs: https://www.home-assistant.io/dashboards/views/

**B) Subview with custom back path**
```yaml
views:
  - title: Details
    subview: true
    back_path: /lovelace/home
    cards:
      - type: markdown
        content: "Details here"
```
Docs: https://www.home-assistant.io/dashboards/views/

**C) Sections view (keys shown from real-world config)**
```yaml
views:
  - title: Test
    type: sections
    max_columns: 4
    dense_section_placement: false
    sections:
      - type: grid
        column_span: 2
        cards:
          - type: heading
            heading: Top
          - type: markdown
            content: "**TOP**"
            grid_options:
              columns: full
              rows: auto
```
Evidence: https://github.com/home-assistant/frontend/issues/22970  
Grid sizing model: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view
