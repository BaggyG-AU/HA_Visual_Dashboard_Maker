# R5: Popup Alignment — Document `custom:popup-card` as HAVDM-Only

## Mandatory Pre-Reading

1. `ai_rules.md` (highest priority; immutable)
2. `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md`

**Tripwire phrase (quote exactly):** "The fastest correct fix is already in the repository."

---

## Objective

`custom:popup-card` does not exist as an upstream HACS card. It is a HAVDM invention. The closest upstream equivalent is Bubble Card's `card_type: pop-up`, which has fundamentally different architecture (bottom sheet, URL hash routing, HA subviews).

**Decision**: Keep `custom:popup-card` as a HAVDM-only feature. Document it clearly so users understand it only works within the HAVDM editor and will not render in Home Assistant without the HAVDM runtime.

This phase has no code restructuring — it's a documentation and UI labeling task.

---

## Changes Required

### 1. Card Registry
**File**: `src/services/cardRegistry.ts` (line ~363)

Update the metadata to clearly mark this as HAVDM-only:

```typescript
// BEFORE:
{
  type: 'custom:popup-card',
  name: 'Popup Card',
  source: 'custom',
  ...
}

// AFTER:
{
  type: 'custom:popup-card',
  name: 'Popup Card (HAVDM-only)',
  category: 'layout',
  icon: 'ExpandOutlined',
  description: 'Trigger a modal popup containing cards. HAVDM editor feature — not a standard HACS card.',
  isCustom: true,
  source: 'custom',  // Keep as 'custom', NOT 'hacs'
  ...
}
```

### 2. Card Palette UI
If there is a palette/picker component that shows card categories, ensure `custom:popup-card` appears with a visual indicator (e.g., a badge or tooltip) that says "HAVDM-only — not available as a standalone HACS card".

### 3. YAML Export Warning
When exporting a dashboard that contains `custom:popup-card`, add a comment in the YAML output:

```yaml
# WARNING: custom:popup-card is a HAVDM editor feature.
# This card will not render in Home Assistant without the HAVDM runtime.
# Consider using browser_mod popup or Bubble Card pop-up for HA-native popups.
type: custom:popup-card
trigger_label: Open Popup
popup:
  title: Details
  cards:
    - type: markdown
      content: Popup content
```

### 4. Documentation
**File**: `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md`

Update the popup section to document the final decision:
- Keep as HAVDM-only
- No upstream HACS equivalent
- Export includes warning comment
- Future consideration: optional export conversion to Bubble Card pop-up format

---

## Validation

The executing agent must run all three test levels after implementing changes. Follow `ai_rules.md` §5 for test execution and reporting policy.

1. **Lint**: `npm run lint`
2. **Unit tests**: `npm run test:unit` (no popup-specific unit tests, but run full to catch import breakage)
3. **Targeted E2E tests**: `npx playwright test tests/e2e/popup.spec.ts tests/e2e/popup.visual.spec.ts --project=electron-e2e`

After one test run, pause → diagnose any failures → report results to the user before proceeding (per ai_rules §5).

Full regression and CI testing are handled separately and are not part of this phase.

---

## No Type String Changes

Unlike R2/R3/R4, this phase does NOT rename the card type string. `custom:popup-card` stays as `custom:popup-card`.

## Files Touched (minimal)

- `src/services/cardRegistry.ts` — Update name/description metadata
- YAML export logic (wherever dashboard YAML serialization happens) — Add warning comment for popup cards
- `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md` — Update with final decision
