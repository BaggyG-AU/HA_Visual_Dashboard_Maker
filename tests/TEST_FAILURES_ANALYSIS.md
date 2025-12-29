# Test Failures Analysis - Post Phase 1

## Executive Summary

**Test Results**: 48.8% pass rate (142/291 tests passed)
**Status**: ❌ WORSE than before Phase 1 implementation
**Root Cause**: App was NOT rebuilt after adding hydration signal to App.tsx

## Critical Issue Found

### The Problem
1. Phase 1 hydration signal was added to [src/App.tsx](../src/App.tsx:102-106) at 06:39 AM on Dec 28
2. The built app in `.vite/build/main.js` is from Dec 27 20:01
3. Tests are running against the OLD build without the hydration signal
4. `waitForReactHydration()` times out waiting for `__REACT_HYDRATED__` that doesn't exist
5. All tests that call `waitForAppReady()` now wait an extra 10 seconds before timing out

### The Fix Applied
✅ Added fallback to `waitForReactHydration()` in [tests/helpers/electron-helper.ts](../tests/helpers/electron-helper.ts:53-66)
- If hydration signal not found, falls back to 1.5 second delay
- Makes tests backward compatible with builds that don't have the signal
- **BUT** you still need to rebuild the app for the hydration fix to work properly

## Required Actions

### 1. REBUILD THE APP ⚠️ CRITICAL

✅ **DONE AUTOMATICALLY** - I've deleted the `.vite` build cache

The next time you run tests, Electron Forge will automatically rebuild the app with the new hydration signal.

Alternatively, you can manually trigger a rebuild with:
```bash
npm run package
```

Or just run the tests - they will rebuild automatically:
```bash
npx playwright test
```

### 2. Re-run Tests

After rebuilding, run tests again to see the actual impact of Phase 1:

```bash
# From Windows Command Prompt
npx playwright test
```

## Test Failure Categories

### Category 1: Hydration Timeout Regressions (NEW - caused by Phase 1)

These tests NOW fail because they're waiting for a hydration signal that doesn't exist in the old build:

- `app-launch.spec.ts`: "should launch the application successfully"
- Multiple timeout failures across all test suites

**Status after fallback fix**: Should be resolved
**Status after rebuild**: Should pass with proper hydration waiting

### Category 2: Theme Integration Test Failures

**Root Cause**: Mismatch between IPC storage and localStorage mock approach

Failed tests:
- `theme-integration.spec.ts`: 6 tests failing
- `theme-integration-mocked.spec.ts`: 5 tests failing

**Issue**:
- Tests call `electronAPI.setSelectedTheme('noctis')` (stores via IPC)
- Tests then call `getCurrentTheme(page)` (reads from localStorage with 'mock' prefix)
- These two storage mechanisms don't talk to each other!

**Example**:
```typescript
// This stores via IPC to settings service
await page.evaluate(async () => {
  await (window as any).electronAPI.setSelectedTheme('noctis');
});

// This reads from localStorage.getItem('mockSelectedTheme')
const theme = await getCurrentTheme(page);
expect(theme.name).toBe('noctis'); // ❌ FAILS - returns null
```

**Fix Needed**:
Option A: Mock the IPC handlers to store in localStorage
Option B: Change `getCurrentTheme()` to call `electronAPI.getSelectedTheme()`
Option C: Update tests to use consistent storage approach

### Category 3: Entity Caching Test Failures

**Root Cause**: Refresh button is disabled when tests expect it to be enabled

Failed tests:
- `entity-caching.spec.ts`: 5 tests failing

**Issue**:
```typescript
// Test mocks connected state
await mockHAEntities(page, app, {
  entities: createMockEntities(4),
  isConnected: true, // ✅ Mocked as connected
});

// But refresh button is still disabled!
const refreshButton = page.locator('button:has-text("Refresh")');
await expect(refreshButton).toBeEnabled(); // ❌ FAILS
```

**Likely Cause**:
- The React component that controls the refresh button checks connection state
- It's reading from a different source than our IPC mock
- Possibly checking a Zustand store or React context that we're not mocking

**Fix Needed**:
-  Investigate EntityBrowser component to see how it determines if connected
- Ensure IPC mock updates the same state source the component reads from

### Category 4: Monaco Editor Test Failures

**Root Cause**: Monaco editor not rendering at all

Failed tests:
- `monaco-editor.spec.ts`: ALL 24 tests failing
- `integration/monaco-editor.spec.ts`: ALL tests timing out

**Issue**:
```typescript
await page.waitForSelector('.monaco-editor', {
  state: 'visible',
  timeout: 30000
});
// ❌ TIMEOUT - Monaco never renders
```

**Possible Causes**:
1. Modal containing Monaco editor isn't opening
2. Monaco initialization is failing silently
3. Import/bundle issue with Monaco in test environment
4. React component conditional rendering preventing Monaco from loading

**Fix Needed**:
- Add screenshots before waiting for Monaco to see what's actually rendered
- Check if "Edit YAML" button click is working
- Verify modal opens before expecting Monaco
- May need Monaco-specific waiting strategy (it has complex async initialization)

### Category 5: Properties Panel Timeouts

**Root Cause**: Properties panel not appearing or interactions timing out

Failed tests:
- `properties-panel.spec.ts`: ALL 14 tests timing out

**Common Pattern**:
```typescript
// Click button to open panel
await page.click('button:has-text("Properties")');

// Wait for panel - but it never appears
await page.waitForSelector('.properties-panel', {
  state: 'visible',
  timeout: 30000
});
// ❌ TIMEOUT
```

**Likely Cause**:
- Properties panel requires a card to be selected first
- Card selection not working in tests
- Event handlers not bound (hydration issue)

**Fix Needed** (Priority: After rebuild):
- Verify card selection works first
- Add intermediate waits after card selection
- Check if panel uses animation that needs time to complete

### Category 6: Entity Browser Integration Failure

**Root Cause**: Entity browser tabs not interactive

Failed test:
- `entity-browser.spec.ts`: "should filter entities in Dashboard YAML editor Insert Entity"

**Error**:
```
Timeout waiting for locator('.ant-modal:has-text("Entity Browser")')
  .locator('.ant-tabs-tab')
  .filter({ hasText: /All/ })
```

**Issue**: The "All" tab in the entity browser modal isn't clickable or doesn't exist

**Fix Needed**:
- Ensure modal fully opens before clicking tabs
- Add wait for tabs to be interactive
- Possible Ant Design tab animation timing issue

## Comparison with Previous Test Run

**Need**: We don't have the previous test results documented in code

**Should have**:
- Previous pass rate
- Which tests were passing before
- Which tests are NEW failures

**Recommendation**: Create a baseline test results file after fixing current issues

## Recommended Fix Priority

### IMMEDIATE (Do Now)
1. ✅ **Fixed**: Added fallback to `waitForReactHydration()`
2. ⚠️ **USER ACTION REQUIRED**: Rebuild app with `npm run build`
3. **Re-run tests** to see actual impact

### HIGH PRIORITY (After Rebuild)
1. Fix theme storage mismatch (Category 2) - affects 11 tests
2. Fix entity caching connection state (Category 3) - affects 5 tests
3. Investigate Monaco editor (Category 4) - affects 24 tests

### MEDIUM PRIORITY
4. Fix properties panel timeouts (Category 5) - affects 14 tests
5. Fix entity browser tab clicking (Category 6) - affects 1 test

### LOW PRIORITY
6. Remaining E2E tests that require live HA connection or are feature-incomplete

## Success Metrics

**After Rebuild + Theme Fix + Entity Cache Fix**:
- Expected pass rate: ~70-75% (200+/291 tests)
- Would demonstrate Phase 1 effectiveness

**After All Fixes**:
- Target pass rate: 85-90% (250+/291 tests)
- Remaining failures should be legitimate test design issues or features requiring manual testing

## Files Modified in This Analysis

1. ✅ [tests/helpers/electron-helper.ts](../tests/helpers/electron-helper.ts) - Added hydration fallback
2. 📝 [tests/TEST_FAILURES_ANALYSIS.md](./TEST_FAILURES_ANALYSIS.md) - This file

## Next Steps

1. **User**: Run `npm run build` to rebuild app
2. **User**: Run `npx playwright test` from Command Prompt
3. **User**: Share results
4. **Me**: Fix theme storage mismatch
5. **Me**: Fix entity cache connection state detection
6. **Me**: Investigate Monaco editor issue
7. **Iterate** until 85%+ pass rate achieved
