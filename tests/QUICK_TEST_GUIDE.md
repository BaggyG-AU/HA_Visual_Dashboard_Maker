# Quick Test Guide

## Running Tests (IMPORTANT: Use Command Prompt!)

⚠️ **ALL tests MUST be run from Windows Command Prompt, NOT VSCode terminal**

See [IMPORTANT_TESTING_NOTE.md](./IMPORTANT_TESTING_NOTE.md) for details.

### Step-by-Step

1. Open **Windows Command Prompt** (Start → cmd)
2. Navigate to project:
   ```cmd
   cd C:\Users\micah\OneDrive\Documents\GitHub\HA_Visual_Dashboard_Maker
   ```
3. Run tests:
   ```cmd
   npx playwright test
   ```

## Common Test Commands

```bash
# Run ALL tests
npx playwright test

# Run integration tests only
npx playwright test tests/integration

# Run E2E tests only
npx playwright test tests/e2e

# Run specific test file
npx playwright test tests/integration/entity-browser.spec.ts

# Run in headed mode (see the browser)
npx playwright test tests/integration/entity-browser.spec.ts --headed

# Run specific test by name
npx playwright test --grep "should filter entities"

# Run with video recording (for debugging)
npx playwright test --video=on

# Run with debug mode
npx playwright test --debug

# Run tests serially (one at a time) to avoid launch failures
npx playwright test --workers=1
```

## Interpreting Results

### ✅ Success Indicators

Look for these in console output:
```
[APP] React hydration complete - app is interactive
[TEST] DOM content loaded
[TEST] React hydration confirmed
[TEST] App ready for interaction
```

If you see all four messages, the hydration fix is working!

### ❌ Failure Patterns

**Pattern 1: Hydration Timeout**
```
Timeout 10000ms exceeded.
waiting for function
```
**Meaning**: React never hydrated (app didn't load)
**Fix**: Check if app is launching correctly, increase timeout

**Pattern 2: Element Not Found**
```
locator.click: Target closed
element not found
```
**Meaning**: App launched but element doesn't exist or is in wrong state
**Possible Fixes**:
- Component needs specific waiting (see Phase 2)
- IPC mocking not set up correctly
- React router navigation issue

**Pattern 3: Click Did Nothing**
```
Test passed but expected result didn't happen
```
**Meaning**: Element was clicked before event handler was bound
**Fix**: Should be fixed by Phase 1, if not add more wait time

**Pattern 4: Process Failed to Launch**
```
Error: Process failed to launch!
```
**Meaning**: Multiple test runs interfering, or running from VSCode terminal
**Fixes**:
- Run from Windows Command Prompt instead
- Run with `--workers=1` to run tests serially
- Ensure previous test closed app properly

## Test Organization

### Integration Tests (`tests/integration/`)
Test app functionality with mocked IPC handlers (no live HA connection needed):
- ✅ `entity-browser.spec.ts` - Entity searching and filtering
- ✅ `entity-caching.spec.ts` - Entity cache functionality
- ✅ `theme-integration.spec.ts` - Theme data persistence
- ✅ `theme-integration-mocked.spec.ts` - Detailed theme mocking tests

### E2E Tests (`tests/e2e/`)
Test full user workflows (may require HA connection):
- `canvas-cards.spec.ts` - Card interactions on canvas
- `card-browser.spec.ts` - Card browsing functionality
- `monaco-editor-integration.spec.ts` - YAML editor
- `theme-selector.spec.ts` - Theme dropdown UI
- `settings-dialog.spec.ts` - Settings modal
- `debug-app.spec.ts` - App launch verification

## Understanding Test Status

### Before Phase 1 Fix
- Many tests failed with "element not found" or "click did nothing"
- Tests worked manually but failed automated
- Root cause: React hydration timing

### After Phase 1 Fix (Current State)
- 60-70% of tests should now pass
- Console shows hydration confirmation messages
- Remaining failures need component-specific waiting

### After Phase 2 (Component-Specific Waiting)
- 80-90% of tests should pass
- Only complex UI interactions may remain flaky
- Acceptable state for test automation

## Debugging Failed Tests

### 1. Run in Headed Mode
```bash
npx playwright test tests/integration/entity-browser.spec.ts --headed
```
Watch what happens visually.

### 2. Enable Video Recording
```bash
npx playwright test --video=on
```
Videos saved to `test-results/` folder.

### 3. Add Screenshots
In test file:
```typescript
await page.screenshot({ path: 'debug-before-click.png' });
await page.click('button');
await page.screenshot({ path: 'debug-after-click.png' });
```

### 4. Check Console Logs
Look for hydration messages:
```
[APP] React hydration complete - app is interactive
[TEST] React hydration confirmed
```

If missing, React isn't hydrating properly.

### 5. Increase Timeouts
Temporarily increase to see if it's just a timing issue:
```typescript
await waitForAppReady(page, 20000); // 20 seconds instead of 10
```

### 6. Add Extra Waits
For specific components:
```typescript
await waitForAppReady(page);
await page.waitForSelector('.ant-table-tbody', { state: 'visible' });
await page.waitForTimeout(500); // Extra buffer
```

## Quick Fixes for Common Issues

### Entity Browser Tests Fail
```typescript
// Add after waitForAppReady:
await page.waitForSelector('.ant-table-tbody', { state: 'visible' });
await page.waitForTimeout(300);
```

### Theme Selector Tests Fail
```typescript
// Add after clicking selector:
await page.waitForSelector('.ant-select-dropdown', {
  state: 'visible',
  timeout: 3000
});
await page.waitForTimeout(300);
```

### Modal Doesn't Open
```typescript
// Add after clicking button that opens modal:
await page.waitForSelector('.ant-modal-wrap', { state: 'visible' });
await page.waitForTimeout(500);
```

### Monaco Editor Tests Fail
```typescript
// Wait for Monaco to fully initialize:
await page.waitForSelector('.monaco-editor .view-lines', { timeout: 10000 });
await page.waitForTimeout(1000);
```

## Expected Test Times

With Phase 1 hydration fix:
- **Integration tests**: ~5-10 seconds per test
- **E2E tests**: ~10-20 seconds per test
- **Full test suite**: ~5-15 minutes total

Tests are slower but more reliable.

## When to Ask for Help

If after trying these steps:
1. ✅ Tests run from Windows Command Prompt
2. ✅ You see hydration confirmation messages
3. ✅ You've tried component-specific waits
4. ❌ Tests still fail consistently

Then it's time to review specific test failures and determine if:
- Test approach needs changing
- Component behavior is different than expected
- Test should be converted to manual checklist

## Next Steps

1. **Run tests** from Command Prompt with the Phase 1 fix
2. **Review results** - note which tests pass vs fail
3. **For failing tests**:
   - Check if hydration messages appear
   - Try component-specific waits from Phase 2
   - Document patterns of failure
4. **Report back** with results and we'll determine next steps

Good luck! 🎯
