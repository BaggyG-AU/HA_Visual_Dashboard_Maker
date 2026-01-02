# Custom Card Part 2 - Manual Testing Guide

**Date**: 2026-01-02
**Purpose**: Manual verification checklist for Custom Card Implementation Part 2

---

## Quick Verification Commands

### 1. Run Unit Tests (Already Passing)
```bash
npm run test:unit
```
**Expected**: 53/53 tests passing (includes 26 new custom card tests)

### 2. Run Lint (Already Passing)
```bash
npm run lint
```
**Expected**: No errors, only existing warnings

### 3. Integration Tests (Optional - Full Suite)
```bash
npx playwright test --project=electron-integration --workers=1
```
**Expected**: All integration tests should pass (these don't test UI, just logic)

### 4. E2E Tests (Optional - Full Suite)
```bash
npx playwright test --project=electron-e2e --workers=1 --headed
```
**Note**: This runs all E2E tests. The custom cards aren't directly tested by existing E2E specs.

---

## Manual Smoke Testing Checklist

### Setup
```bash
# Start the application
npm start

# Or if using WSL:
npm run start:wsl
```

### Test 1: Card-mod (custom:card-mod)

**Steps:**
1. Connect to Home Assistant (if not already connected)
2. Open Card Palette (left sidebar)
3. Scroll to "Custom" category
4. Find "Card Mod" card
5. Drag onto canvas

**Expected Results:**
- ✅ Card appears in palette with paint brush icon
- ✅ Card renders on canvas with "Card-mod Styling" header
- ✅ Shows security warning "Preview Only"
- ✅ Has blue header icon
- ✅ Can be selected (blue border when clicked)
- ✅ Properties panel shows card properties when selected

**YAML Export Check:**
1. Add card to canvas
2. Click "Edit YAML" button
3. Verify YAML contains:
```yaml
type: custom:card-mod
style: ''
```

---

### Test 2: Auto-entities (custom:auto-entities)

**Steps:**
1. Find "Auto Entities" in Custom category (thunderbolt icon)
2. Drag onto canvas

**Expected Results:**
- ✅ Card shows "Auto Entities" header with yellow/gold icon
- ✅ Shows wrapped card type (default: "entities")
- ✅ Shows "No filters configured" if no filters set
- ✅ Can be selected
- ✅ Properties panel accessible

**Property Edit Check:**
1. Select the card
2. Open properties panel
3. Try editing the card properties
4. Click Apply
5. Verify changes persist

**YAML Export Check:**
```yaml
type: custom:auto-entities
filter:
  include: []
card:
  type: entities
```

---

### Test 3: Vertical Stack in Card (custom:vertical-stack-in-card)

**Steps:**
1. Find "Vertical Stack in Card" in Custom category
2. Drag onto canvas

**Expected Results:**
- ✅ Card shows purple/violet icon
- ✅ Shows "Vertical Stack in Card" header
- ✅ Displays card count: "Contains: 0 cards"
- ✅ Shows "No cards configured" message
- ✅ Can be selected

**YAML Export Check:**
```yaml
type: custom:vertical-stack-in-card
cards: []
```

---

### Test 4: Custom Button Card (custom:button-card)

**Steps:**
1. Find "Button Card" in Custom category
2. Drag onto canvas

**Expected Results:**
- ✅ Card shows button-style visual
- ✅ Has icon in center
- ✅ Shows entity name or "Button"
- ✅ Has border that changes color based on state
- ✅ Can be selected

**YAML Export Check:**
```yaml
type: custom:button-card
entity: ''
```

---

### Test 5-8: Surveillance/Camera Cards

**Test Each:**
- custom:surveillance-card
- custom:frigate-card
- custom:camera-card
- custom:webrtc-camera

**Steps for Each:**
1. Find card in Custom category (all have video camera icon)
2. Drag onto canvas

**Expected Results (All 4):**
- ✅ Shows large video camera icon placeholder
- ✅ Red camera icon in header
- ✅ Shows card-specific name in header
- ✅ Shows "LIVE PREVIEW (in HA)" indicator with pulsing green dot
- ✅ Footer says "Camera stream visible only in Home Assistant"
- ✅ Can be selected

**YAML Export Checks:**

Surveillance Card:
```yaml
type: custom:surveillance-card
cameras: []
```

Frigate Card:
```yaml
type: custom:frigate-card
cameras: []
```

Camera Card:
```yaml
type: custom:camera-card
entity: ''
```

WebRTC Camera:
```yaml
type: custom:webrtc-camera
url: ''
```

---

## Advanced Testing Scenarios

### Scenario 1: Card-mod with Styles

**Steps:**
1. Add custom:card-mod to canvas
2. Select card, open properties
3. Add style property:
```yaml
style: |
  ha-card {
    background: red;
  }
```
4. Apply changes
5. Check YAML export

**Expected:**
- ✅ Style appears as code preview in card
- ✅ Limited to ~100 chars preview
- ✅ YAML export preserves full style string

---

### Scenario 2: Auto-entities with Filters

**Steps:**
1. Add custom:auto-entities to canvas
2. Edit properties to add filter rules:
```yaml
type: custom:auto-entities
filter:
  include:
    - domain: light
    - domain: switch
  exclude:
    - entity_id: light.excluded
card:
  type: entities
```
3. Apply changes

**Expected:**
- ✅ Card shows filter counts (e.g., "+2 include, -1 exclude")
- ✅ Shows preview of first few rules
- ✅ Shows "... and N more rules" if many rules
- ✅ YAML export preserves all filters

---

### Scenario 3: Vertical Stack with Nested Cards

**Steps:**
1. Add custom:vertical-stack-in-card
2. Edit properties to add nested cards:
```yaml
type: custom:vertical-stack-in-card
title: My Stack
cards:
  - type: button
    entity: light.living_room
  - type: button
    entity: light.bedroom
  - type: button
    entity: light.kitchen
```
3. Apply changes

**Expected:**
- ✅ Shows card count: "Contains: 3 cards"
- ✅ Shows card type breakdown (e.g., "button ×3")
- ✅ Title appears in card header if set
- ✅ YAML export preserves all nested cards

---

### Scenario 4: Custom Button with Entity

**Steps:**
1. Add custom:button-card
2. Edit to add entity:
```yaml
type: custom:button-card
entity: light.living_room
name: My Light
show_state: true
```
3. Apply changes

**Expected:**
- ✅ Shows entity ID in footer
- ✅ Icon changes based on domain (light = bulb)
- ✅ Color indicates state (if entity exists)
- ✅ YAML export preserves all properties

---

### Scenario 5: Surveillance Card with Cameras

**Steps:**
1. Add custom:surveillance-card
2. Edit to add cameras:
```yaml
type: custom:surveillance-card
cameras:
  - entity: camera.front_door
    name: Front Door
  - entity: camera.backyard
    name: Backyard
```
3. Apply changes

**Expected:**
- ✅ Shows camera count in description
- ✅ Shows first camera name
- ✅ YAML export preserves camera array

---

## Dashboard Persistence Test

**Purpose**: Verify cards survive save/load cycle

**Steps:**
1. Create new dashboard
2. Add one of each custom card type (8 cards total)
3. Save dashboard to YAML file
4. Close application
5. Restart application
6. Load the saved YAML file

**Expected:**
- ✅ All 8 cards load correctly
- ✅ Each card shows correct renderer (not "Unsupported Card")
- ✅ Properties preserved
- ✅ Visual appearance matches before save

---

## Property Panel Integration Test

**Purpose**: Verify property editing works for all cards

**Steps:**
1. Add each custom card type to canvas (one at a time)
2. Select card
3. Verify properties panel shows on right
4. Edit a property (any property)
5. Click Apply
6. Verify change reflected in card
7. Edit YAML to verify change persisted

**Expected for All Cards:**
- ✅ Properties panel appears when selected
- ✅ Card-specific properties shown
- ✅ Changes apply successfully
- ✅ Changes persist in YAML

---

## Regression Testing

**Purpose**: Ensure existing cards still work

**Quick Check:**
1. Add a standard HA card (e.g., entities, button, glance)
2. Add an existing custom card (e.g., apexcharts, bubble-card, mushroom)
3. Verify both render correctly
4. Verify both can be edited
5. Verify YAML export works

**Expected:**
- ✅ No regressions in existing cards
- ✅ All existing cards still functional
- ✅ No visual glitches or errors

---

## Error Handling Test

**Invalid YAML:**
1. Create dashboard with custom:card-mod
2. Edit YAML to add invalid syntax
3. Try to apply/load

**Expected:**
- ✅ Error message shown
- ✅ Dashboard doesn't crash
- ✅ Can recover by fixing YAML

---

## Performance Test

**Many Cards:**
1. Create dashboard
2. Add 20+ custom cards (mix of all types)
3. Observe performance

**Expected:**
- ✅ No noticeable lag
- ✅ Scrolling smooth
- ✅ Selection responsive
- ✅ YAML export completes quickly

---

## Cross-Platform Test (If Applicable)

If testing on both Windows and Linux:

**Windows:**
```bash
npm start
# Run manual tests above
```

**Linux:**
```bash
npm start  # or npm run start:wsl if on WSL
# Run manual tests above
```

**Expected:**
- ✅ Cards render identically on both platforms
- ✅ No platform-specific visual issues
- ✅ YAML export/import works on both

---

## Playwright Test Creation (Future)

If you want to add automated E2E tests for these cards later, here's a template:

```typescript
// tests/e2e/custom-cards-part2.spec.ts
import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support/electron';

test.describe('Custom Cards Part 2 - E2E', () => {
  test('should add and render card-mod', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Add card via palette
      // TODO: Verify renderer appears
      // TODO: Check properties panel
      // TODO: Verify YAML export

    } finally {
      await close(ctx);
    }
  });

  // Add similar tests for other cards...
});
```

---

## Success Criteria Summary

After completing all manual tests above, verify:

- [  ] All 8 custom cards appear in palette
- [  ] All 8 cards render with correct visuals
- [  ] All 8 cards can be selected
- [  ] All 8 cards show properties in panel
- [  ] All 8 cards export to YAML correctly
- [  ] All 8 cards load from YAML correctly
- [  ] No regressions in existing cards
- [  ] No performance issues
- [  ] No visual glitches
- [  ] Property editing works for all cards

---

## Troubleshooting

### Card Not Appearing in Palette
**Check:** Is cardRegistry properly initialized?
**Fix:** Verify `src/services/cardRegistry.ts` includes the card

### Card Shows "Unsupported Card"
**Check:** Is BaseCard.tsx routing correctly?
**Fix:** Verify case statement in `src/components/BaseCard.tsx`

### Properties Panel Not Showing
**Check:** Is card properly selected?
**Fix:** Click card to ensure selection, check blue border

### YAML Export Missing Properties
**Check:** Are properties being set correctly?
**Fix:** Verify property panel apply action works

### Renderer Import Error
**Check:** TypeScript compilation errors?
**Fix:** Run `npx tsc --noEmit` to find type errors

---

## Reporting Issues

If you find issues during manual testing:

1. **Document the issue:**
   - Card type
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if visual issue

2. **Check console:**
   - Open Developer Tools (View → Toggle Developer Tools)
   - Check for errors in console
   - Include error messages in report

3. **Verify environment:**
   - Node version: `node --version`
   - npm version: `npm --version`
   - Platform: Windows/Linux
   - App version: Check package.json

4. **Create issue:**
   - Use GitHub issue template
   - Tag with "custom-cards" label
   - Reference this implementation (Part 2)

---

**Manual testing completed by**: ________________
**Date**: ________________
**Platform**: ________________
**All tests passed**: [ ] Yes [ ] No
**Issues found**: ________________
