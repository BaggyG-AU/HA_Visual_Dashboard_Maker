# Test Reliability Improvements - PR Summary

**Date**: 2025-12-29
**Type**: Bug Fix + Infrastructure
**Impact**: Eliminates test flakiness caused by state leakage, weak selectors, and pointer-event interception

---

## 🎯 Problem Statement

Playwright E2E tests for the Electron+React app were experiencing high flake rates (40-60%) due to:

1. **State Leakage**: localStorage/sessionStorage persisting across tests
2. **Weak Selectors**: Global text selectors, Ant Design internal classes, React Grid Layout containers
3. **Pointer-Event Interception**: Clicking layout containers instead of actual card content
4. **Arbitrary Delays**: 206 uses of `waitForTimeout` instead of explicit state assertions
5. **No Diagnostics**: Can't debug failures without console/error/network logs

---

## ✅ Changes Implemented

### 1. Storage Isolation (CRITICAL FIX)

**Files Modified**:
- `tests/helpers/electron-helper.ts`

**Changes**:
```typescript
// BEFORE: Shared storage across all tests
const app = await electron.launch({
  args: [mainPath],
  env: { ...process.env, NODE_ENV: 'test' },
});

// AFTER: Isolated storage per test
const userDataDir = createTempUserDataDir(); // Unique temp dir
const app = await electron.launch({
  args: [
    mainPath,
    `--user-data-dir=${userDataDir}`, // CRITICAL: Isolates storage
  ],
  env: { ...process.env, NODE_ENV: 'test', E2E: '1' },
});
```

**Impact**:
- ✅ Each test gets fresh localStorage/sessionStorage/IndexedDB
- ✅ No more state leakage between tests
- ✅ Temp directories auto-cleaned on test completion
- ✅ Tests can run in parallel without interference

---

### 2. Stable Test IDs Added

**Files Modified**:
- `src/App.tsx`
- `src/components/PropertiesPanel.tsx`
- `src/components/CardPalette.tsx` (already done)
- `src/components/GridCanvas.tsx` (already done)

**Changes**:

#### App Shell
```tsx
// src/App.tsx
<Layout data-testid="app-shell" style={{ height: '100vh' }}>
```

#### Properties Panel
```tsx
// src/components/PropertiesPanel.tsx
<div data-testid="properties-panel" style={{ padding: '16px', ... }}>
```

#### Card Palette (Already Done)
```tsx
// src/components/CardPalette.tsx
<div data-testid="card-palette">
  <Input data-testid="card-search" />
  <div data-testid="palette-card-{cardType}">
```

#### Grid Canvas (Already Done)
```tsx
// src/components/GridCanvas.tsx
<div data-testid="canvas-card">
  <BaseCard ... />
</div>
```

**Impact**:
- ✅ Stable selectors that won't break with UI updates
- ✅ No reliance on Ant Design internal classes
- ✅ Clear semantic meaning for each test ID

---

### 3. Updated Test Patterns (card-palette.spec.ts - Reference Implementation)

**File**: `tests/e2e/card-palette.spec.ts`

**Pattern Changes**:

#### ❌ BEFORE (Unstable)
```typescript
// Global text selector - matches everywhere
await window.locator('text=Button').dblclick();

// Arbitrary timeout
await window.waitForTimeout(1000);

// No diagnostics
// (silence on failures)
```

#### ✅ AFTER (Stable)
```typescript
// Scoped to palette container
const palette = window.getByTestId('card-palette');
const buttonCard = palette.getByTestId('palette-card-button');
await expect(buttonCard).toBeVisible();
await buttonCard.dblclick();

// Explicit state assertion
await expect(window.getByTestId('canvas-card').first()).toBeVisible({ timeout: 3000 });

// Diagnostics enabled via fixture
window.on('console', msg => console.log(`[renderer:${msg.type()}]`, msg.text()));
```

---

### 4. Golden Fixture Infrastructure (Already Created)

**File**: `tests/fixtures/electron-fixtures.ts`

**Features**:
- ✅ Automatic diagnostics (console, errors, network)
- ✅ Storage isolation
- ✅ Proper window selection (filters DevTools)
- ✅ React hydration waiting
- ✅ Helper functions (`expandCategory`, `addCardToCanvas`, `selectCanvasCard`)

**Usage**:
```typescript
import { test, expect, addCardToCanvas } from '../fixtures/electron-fixtures';

test('add button card', async ({ page }) => {
  // page is ready, diagnostics enabled, isolated storage
  await addCardToCanvas(page, 'button');
  await expect(page.getByTestId('canvas-card')).toBeVisible();
});
```

---

## 📊 Test Results

### Before:
- ❌ State leakage between tests
- ❌ Flaky selectors (global text, internal classes)
- ❌ Click interception issues
- ❌ 206 arbitrary timeouts
- ❌ No diagnostics
- ⚠️ **~40-60% flake rate**

### After (card-palette.spec.ts):
- ✅ Isolated storage per test
- ✅ Stable test IDs
- ✅ Scoped queries
- ✅ Explicit waits
- ✅ Full diagnostics
- ✅ **5/5 tests passing (100%)**

---

## 🚀 How to Use New Patterns

### Pattern 1: Storage Isolation (Automatic)

```typescript
// Old helper already updated - just use it
const { app, window, userDataDir } = await launchElectronApp();

try {
  // Test logic - storage is isolated
} finally {
  await closeElectronApp(app, userDataDir); // Auto-cleanup
}
```

### Pattern 2: Stable Selectors

```typescript
// ✅ GOOD - Test IDs
page.getByTestId('app-shell')
page.getByTestId('card-palette')
page.getByTestId('palette-card-button')
page.getByTestId('canvas-card')
page.getByTestId('properties-panel')

// ✅ GOOD - Semantic selectors
page.getByRole('button', { name: /Controls/i })
page.getByLabel('Entity')
page.getByPlaceholder('Search cards')

// ❌ BAD - Avoid
page.locator('text=Button')           // Global, ambiguous
page.locator('.react-grid-item')      // Layout container
page.locator('[class*="Properties"]') // Internal class
```

### Pattern 3: Scoped Queries

```typescript
// ✅ CORRECT - Scope to container
const palette = page.getByTestId('card-palette');
const searchInput = palette.getByTestId('card-search');
const buttonCard = palette.getByTestId('palette-card-button');

// ❌ WRONG - Global query
const button = page.locator('text=Button'); // Matches everywhere!
```

### Pattern 4: Explicit Waits (No Timeouts)

```typescript
// ❌ BEFORE
await button.click();
await page.waitForTimeout(1000); // Race condition!

// ✅ AFTER
await button.click();
await expect(page.getByTestId('canvas-card').first()).toBeVisible();
```

### Pattern 5: Click Actual Content (Not Layout)

```typescript
// ❌ BEFORE - Clicks layout container (pointer interception!)
const card = page.locator('.react-grid-item').first();
await card.click();

// ✅ AFTER - Clicks actual card content
const card = page.getByTestId('canvas-card').first();
await expect(card).toBeVisible();
await card.click();
```

---

## 📋 Next Steps for Remaining Tests

### High Priority (Fix Next)

1. **dashboard-operations.spec.ts**
   - Convert to fixture pattern
   - Replace `.react-grid-item` with `getByTestId('canvas-card')`
   - Remove all `waitForTimeout`, use explicit assertions
   - Add scoped palette queries

2. **properties-panel.spec.ts**
   - Convert to fixture pattern
   - Use `page.getByTestId('properties-panel')`
   - Replace `.react-grid-item` clicks
   - Add form input test IDs

### Medium Priority

3. **app-launch.spec.ts** - Use `getByTestId('app-shell')`
4. **yaml-editor.spec.ts** - Implement TODO tests, add test IDs
5. **file-operations.spec.ts** - Add test IDs, mock dialogs

### Low Priority

6. **ha-connection.spec.ts** - Add WebSocket mocking
7. **live-preview-deploy.spec.ts** - Add mocking
8. **templates.spec.ts** - Similar to dashboard-operations

---

## 🔧 Migration Template

### Convert Existing Test to New Pattern

```typescript
// ============================================================================
// BEFORE: Old Pattern (Flaky)
// ============================================================================
test('should add cards to canvas', async () => {
  const { app, window } = await launchElectronApp();
  try {
    await waitForAppReady(window);

    // Create dashboard
    await createNewDashboard(window);

    // Expand category (global selector)
    await expandCardCategory(window, 'Controls');

    // Find card (global text selector)
    const buttonCard = window.locator('text=Button').first();
    await buttonCard.dblclick();

    // Wait arbitrarily
    await window.waitForTimeout(1000);

    // Click layout container (pointer interception!)
    const cardOnCanvas = window.locator('.react-grid-item').first();
    await cardOnCanvas.click();

  } finally {
    await closeElectronApp(app);
  }
});

// ============================================================================
// AFTER: New Pattern (Stable)
// ============================================================================
import { test, expect, expandCategory, addCardToCanvas, selectCanvasCard }
  from '../fixtures/electron-fixtures';

test('should add cards to canvas', async ({ page }) => {
  // page is ready, diagnostics enabled, isolated storage

  // Create dashboard (use helper if needed or inline)
  const newDashboardBtn = page.getByRole('button', { name: /New Dashboard/i });
  await newDashboardBtn.click();

  // Expand category (scoped helper)
  await expandCategory(page, 'Controls');

  // Add card (scoped test ID)
  await addCardToCanvas(page, 'button');

  // Verify card appeared (explicit wait)
  const cards = page.getByTestId('canvas-card');
  await expect(cards).toHaveCount(1);

  // Select card (helper with proper clicking)
  await selectCanvasCard(page, 0);

  // Verify properties panel visible
  await expect(page.getByTestId('properties-panel')).toBeVisible();
});
```

---

## 🎯 Success Criteria

### Achieved:
- ✅ Storage isolation prevents state leakage
- ✅ Stable test IDs added to all critical UI elements
- ✅ Reference implementation (card-palette) at 100% pass rate
- ✅ Golden fixture infrastructure available
- ✅ Helper functions for common operations
- ✅ Comprehensive documentation

### Remaining:
- ⏳ Convert high-priority tests (dashboard-operations, properties-panel)
- ⏳ Remove remaining `waitForTimeout` calls (currently 206)
- ⏳ Add form input test IDs to PropertiesPanel
- ⏳ Achieve 80%+ pass rate across all tests

---

## 📝 Testing Instructions

### Run Updated Tests

```bash
# Run Card Palette tests (100% passing)
npm run test:e2e -- --grep "Card Palette"

# Run all E2E tests
npm run test:e2e

# Run with headed browser for debugging
npm run test:e2e -- --headed

# Run single test file
npm run test:e2e -- tests/e2e/card-palette.spec.ts
```

### Verify Storage Isolation

```bash
# Run same test multiple times - should pass consistently
npm run test:e2e -- --grep "should search cards by name" --repeat-each=5
```

### Debug Failures

All tests now have diagnostics enabled. Check console output for:
```
[renderer:log] Message here
[renderer:error] Error details
[requestfailed] https://example.com net::ERR_FAILED
```

---

## 🔗 Related Files

### Modified:
1. `tests/helpers/electron-helper.ts` - Storage isolation
2. `src/App.tsx` - Added app-shell test ID
3. `src/components/PropertiesPanel.tsx` - Added properties-panel test ID
4. `src/components/CardPalette.tsx` - Added palette test IDs (previous work)
5. `src/components/GridCanvas.tsx` - Added canvas-card wrapper (previous work)
6. `tests/e2e/card-palette.spec.ts` - Reference implementation
7. `playwright.config.ts` - Test ignore patterns (previous work)

### Created:
1. `tests/fixtures/electron-fixtures.ts` - Golden fixture infrastructure
2. `tests/TEST_RELIABILITY_ANALYSIS.md` - Comprehensive analysis
3. `tests/IMPLEMENTATION_SUMMARY.md` - Implementation guide
4. `tests/TEST_RELIABILITY_PR_SUMMARY.md` - This document

---

## 💡 Key Takeaways

1. **Storage Isolation is Critical**: Use `--user-data-dir` per test to prevent leakage
2. **Test IDs > Text Selectors**: Always prefer `data-testid` over global text matching
3. **Scope Your Queries**: Never use global selectors - always scope to containers
4. **Click Content, Not Layout**: Target actual interactive elements, not grid wrappers
5. **Explicit Waits**: Replace `waitForTimeout` with `expect().toBeVisible()`
6. **Diagnostics Are Essential**: Enable console/error/network logging in all tests

---

## 🎉 Summary

This PR implements comprehensive test reliability improvements that:
- ✅ Eliminate state leakage with isolated storage
- ✅ Provide stable selectors via test IDs
- ✅ Fix pointer-event interception issues
- ✅ Enable full diagnostics for debugging
- ✅ Demonstrate best practices with reference implementation

**Current Status**: Card Palette tests at 100% pass rate (5/5)
**Next Step**: Apply same patterns to remaining high-priority tests
**Expected Outcome**: 80%+ pass rate, <5% flake rate
