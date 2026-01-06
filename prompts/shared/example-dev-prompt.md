## Context
You’re working on `feature/foundation-color-picker` which grew out of the HAVDM Advanced Features roadmap. The Foundation Layer’s Feature 1.1 card (“Color Picker Component (react-colorful)”) lives in the Portable Kanban and defines the request: replace manual hex entry with a rich, reusable color picker that the PropertiesPanel can use everywhere.

## Goal
Ship Feature 1.1: implement a keyboard- and accessibility-friendly color picker that supports hue/saturation, alpha, format toggles (hex/RGB/HSL), recent colors, live preview binding, and YAML persistence for every color field in the PropertiesPanel.

## Allowed Scope
- Build a `ColorPicker` component (react-colorful or equivalent) with:
  - Hue/saturation plane + alpha slider
  - Format toggle (hex/RGB/HSL) and synced inputs
  - Recent color history (persisted between opens)
  - Full keyboard support (tab/arrow/enter/esc) and ARIA labels
- Integrate the picker into every PropertiesPanel color entry (corners, text, backgrounds, icons, etc.) so the picker replaces bare inputs.
- Keep preview/live updates in sync and serialize the chosen color into the dashboard YAML (same hex or rgba output as before).
- Add unit tests for conversions, format toggles, recent colors, and YAML round-trips.
- Add targeted integration tests (per TESTING_STANDARDS + PLAYWRIGHT guidelines) that open the picker, exercise color selection (click/keyboard), toggle formats, confirm persistence, and validate recent colors.
- Ensure documentation (README/docs/testing references) mentions the new picker and how testers should cover it.

## Forbidden
- Playwright E2E tactics that rely on timing hacks.
- Palette/theme editors beyond the foundational picker (those live in later features).
- Refactors outside the picker/PropertiesPanel scope.

## Stability & Compliance Rules (MANDETORY)
- Follow `ai_rules.md`: keep context hygiene, obey testing restrictions, and don’t run Electron/Playwright tests for me.
- Align with `docs/testing`: define what unit/integration/visual checks are required and call out how to verify them manually.
- Follow `docs/architecture`: place the picker in `src/components/ColorPicker.tsx` and use existing services/components for YAML serialization and state management.
- Follow PLAYWRIGHT testing guidance in your DSL (no arbitrary waits, use role-based locators).

## Acceptance Summary
- Hue/sat + alpha + format toggle picker renders with keyboard/ARIA support.
- Recent colors (up to 10) are tracked and selectable across opens.
- All color fields in the PropertiesPanel now open the picker.
- Selected colors update the visual preview and persist in YAML (round-trip).
- Tests (unit/integration/visual) cover rendering, selection, format switching, recent colors, YAML sync, and keyboard nav.
- Compliance docs (`ai_rules`, `docs/testing`, `docs/architecture`) are referenced in the README/testing notes.

## Testing Expectations
- Unit tests for color conversions, format toggles, YAML serialization, and recent color storage.
- Integration tests (Playwright DSL-based) that open a color field, click/keyboard select hue, toggle format, choose a recent color, and assert YAML persistence.
- Visual regression/QA checklist to verify picker UI and preview updates across themes.
- Manual verification steps for reviewers running `npm run lint`, `npm run test:unit`, and requested Playwright runs triggered via `tools/test-start`.

## Handoff
If E2E tests fail after the picker work, stop feature work and switch to `tools/test-start`, then use Codex with `prompts/codex/playwright-fix.md`.