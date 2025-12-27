# Entity Browser Test Fixes - Round 2 (December 26, 2024)

## Summary
Applied additional fixes to address the remaining 12 failing tests after the initial round of fixes. Focus areas:
1. More robust modal cleanup (6 tests affected)
2. Card palette category expansion (5 tests affected)
3. Double-click modal close timing (1 test affected)

## Test Progress
**Round 1 Results:** 12 passed, 12 failed (50% pass rate)
**Expected After Round 2:** Significantly higher pass rate with all major issues addressed

---

## Issues Fixed in Round 2

### 1. **Improved Modal Cleanup Robustness** (6 tests affected)

**Problem:** Single Escape key press wasn't reliably closing all modals, causing subsequent tests to fail when trying to click blocked buttons.

**Error Pattern:**
```
TimeoutError: page.click: Timeout 30000ms exceeded.
<div class="ant-modal-wrap"> from <div>…</div> subtree intercepts pointer events
```

**Previous Approach:**
```typescript
// Single attempt to close modal
const openModals = page.locator('.ant-modal-wrap');
const modalCount = await openModals.count();
if (modalCount > 0) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}
```

**New Approach:**
```typescript
// Try up to 3 times to close any lingering modals
for (let i = 0; i < 3; i++) {
  const openModals = page.locator('.ant-modal-wrap');
  const modalCount = await openModals.count();
  if (modalCount > 0) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);  // Increased from 300ms
  } else {
    break;  // No more modals, exit loop early
  }
}
```

**Why This Works:**
- Multiple Escape presses handle stacked or slow-closing modals
- Longer timeout (400ms vs 300ms) allows full animation completion
- Early exit when no modals remain prevents unnecessary waiting

**Affected Tests:**
- All tests in "Entity Browser" describe block
- All tests in "Entity Browser Integration with YAML Editors" describe block

---

### 2. **Card Palette Category Expansion** (5 tests affected)

**Problem:** Tests couldn't find "Mini Graph Card" because card palette categories are collapsed by default (Ant Design Collapse component).

**Error:**
```
TimeoutError: locator.dblclick: Timeout 30000ms exceeded.
waiting for locator('div:has-text("Mini Graph Card")').first()
```

**Root Cause:** The card palette uses collapsible categories. Mini Graph Card is in the "Graph & History" category which starts collapsed.

**Fix:** Import and use the existing `expandCardCategory()` helper function before attempting to find cards.

```typescript
// Import the helper
import {
  launchElectronApp,
  closeElectronApp,
  waitForAppReady,
  createNewDashboard,
  seedEntityCache,
  clearEntityCache,
  expandCardCategory  // <-- Added
} from '../helpers/electron-helper';

// In beforeEach for YAML Editors tests:
await createNewDashboard(page);

// Expand card palette category to make Mini Graph Card visible
await expandCardCategory(page, 'Graph & History');

// Now the card is visible and can be found
const miniGraphCard = page.locator('div:has-text("Mini Graph Card")').first();
await miniGraphCard.dblclick();
```

**Helper Function Details** ([tests/helpers/electron-helper.ts:195-236](tests/helpers/electron-helper.ts#L195-L236)):
- Locates category header by name
- Checks if already expanded (avoids unnecessary clicks)
- Clicks header to expand if needed
- Waits for animation (300ms)
- Verifies successful expansion

**Affected Tests:**
- should show Insert Entity button in Properties Panel YAML tab
- should open entity browser from Properties Panel YAML editor
- should show Insert Entity button in Dashboard YAML editor
- should insert entity ID at cursor position in Monaco editor
- should disable Insert Entity button when not connected and no cache

---

### 3. **Double-Click Modal Close Timing** (1 test)

**Problem:** Test expected Entity Browser to close after double-clicking a row, but modal remained visible.

**Error:**
```
Error: expect(received).toBeFalsy()
Received: true
```

**Investigation:** Checked [src/components/EntityBrowser.tsx:266-269](src/components/EntityBrowser.tsx#L266-L269) and confirmed double-click IS implemented:

```typescript
onRow={(record) => ({
  onClick: () => setSelectedEntity(record.entity_id),
  onDoubleClick: () => {
    setSelectedEntity(record.entity_id);
    setTimeout(handleSelect, 100);  // <-- Modal closes via handleSelect
  },
})}
```

**Root Cause:** Test timeout (300ms) was too short. The code has a 100ms setTimeout, plus Ant Design modal close animation takes ~300ms, totaling ~400ms+.

**Fix:** Increased wait time from 300ms to 600ms:

```typescript
test('should support double-click to select entity', async () => {
  // ... setup code ...

  // Double-click first row
  await rows.first().dblclick();

  // Wait for modal close animation (needs more time than single action)
  await page.waitForTimeout(600);  // Increased from 300ms

  // Modal should close after double-click selection
  const isVisible = await modal.isVisible().catch(() => false);
  expect(isVisible).toBeFalsy();
});
```

**Affected Tests:**
- should support double-click to select entity

---

## Key Improvements

### 1. **Retry Pattern for Modal Cleanup**
Use loop-based retries instead of single attempts:
```typescript
for (let i = 0; i < 3; i++) {
  const modalCount = await page.locator('.ant-modal-wrap').count();
  if (modalCount > 0) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  } else {
    break;
  }
}
```

### 2. **Category Expansion Before Card Interaction**
Always expand categories when testing cards:
```typescript
await expandCardCategory(page, 'Graph & History');
const card = page.locator('div:has-text("Mini Graph Card")').first();
await card.dblclick();
```

### 3. **Generous Timeouts for Animations**
Account for setTimeout delays + modal animations:
```typescript
// Code has 100ms setTimeout + 300ms animation = 400ms minimum
await page.waitForTimeout(600);  // 50% buffer
```

---

## Running Tests

```bash
# Rebuild app with fixes
npm run package

# Run all entity-browser tests
npx playwright test tests/integration/entity-browser.spec.ts

# Run in headed mode to see execution
npx playwright test tests/integration/entity-browser.spec.ts --headed

# Run specific test
npx playwright test tests/integration/entity-browser.spec.ts -g "should support double-click"
```

---

## Expected Results

After Round 2 fixes, expect:
- **Modal blocking issues**: Resolved (retry pattern handles lingering modals)
- **Card palette tests**: All passing (category expansion implemented)
- **Double-click test**: Passing (sufficient timeout for animation)

**Overall Expected Pass Rate:** ~80-90% or higher

---

## Files Modified

### [tests/integration/entity-browser.spec.ts](tests/integration/entity-browser.spec.ts)

**Line 3** - Added `expandCardCategory` import:
```typescript
import {
  launchElectronApp,
  closeElectronApp,
  waitForAppReady,
  createNewDashboard,
  seedEntityCache,
  clearEntityCache,
  expandCardCategory  // <-- Added
} from '../helpers/electron-helper';
```

**Lines 34-49** - Improved modal cleanup with retry loop:
```typescript
test.beforeEach(async () => {
  // Close any open modals from previous tests - try multiple times
  for (let i = 0; i < 3; i++) {
    const openModals = page.locator('.ant-modal-wrap');
    const modalCount = await openModals.count();
    if (modalCount > 0) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } else {
      break;
    }
  }

  await createNewDashboard(page);
});
```

**Lines 371-394** - Added category expansion and improved modal cleanup in YAML Editors suite:
```typescript
test.beforeEach(async () => {
  // Close any open modals - try multiple times
  for (let i = 0; i < 3; i++) {
    const openModals = page.locator('.ant-modal-wrap');
    const modalCount = await openModals.count();
    if (modalCount > 0) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } else {
      break;
    }
  }

  await createNewDashboard(page);

  // Expand card palette category to make Mini Graph Card visible
  await expandCardCategory(page, 'Graph & History');

  await miniGraphCard.dblclick();
  await page.waitForTimeout(500);
});
```

**Lines 288-309** - Increased double-click timeout:
```typescript
test('should support double-click to select entity', async () => {
  // ... setup ...

  await rows.first().dblclick();

  // Wait for modal close animation (needs more time than single action)
  await page.waitForTimeout(600);  // Increased from 300ms

  const isVisible = await modal.isVisible().catch(() => false);
  expect(isVisible).toBeFalsy();
});
```

---

## Related Documentation

- [TEST_FIXES_ENTITY_BROWSER.md](TEST_FIXES_ENTITY_BROWSER.md) - Round 1 fixes (17 initial failures)
- [TEST_CACHE_SEEDING.md](TEST_CACHE_SEEDING.md) - Entity cache seeding infrastructure
- [tests/helpers/electron-helper.ts](tests/helpers/electron-helper.ts) - Test helper functions

---

*Fixes applied: December 26, 2024*
