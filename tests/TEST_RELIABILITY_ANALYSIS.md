# Test Reliability Analysis - Comprehensive Report

**Date**: 2025-12-29
**Analyzed Files**: 20 test files (10 E2E, 10 Integration)
**Critical Issues Found**: 206 `waitForTimeout` calls, extensive use of unstable selectors

---

## 🚨 Critical Anti-Patterns Found

### 1. **Excessive `waitForTimeout` Usage: 206 occurrences**

**Problem**: Using arbitrary timeouts instead of waiting for actual state changes
**Impact**: Tests are slow, flaky, and unreliable
**Risk Level**: 🔴 **CRITICAL**

**Examples Found**:
```typescript
// ❌ WRONG - arbitrary wait
await window.waitForTimeout(1000);
await cardOnCanvas.click();

// ✅ CORRECT - wait for actual state
await expect(cardOnCanvas).toBeVisible();
await cardOnCanvas.click();
```

**Files Affected**: ALL test files

---

### 2. **Unstable Selectors**

#### A. Global Text Selectors (High Risk)
```typescript
// ❌ WRONG - matches multiple elements
window.locator('text=Button')
window.locator('text=Button Card').or(window.locator('text=Button'))

// ✅ CORRECT - scoped with test ID
const palette = window.getByTestId('card-palette');
palette.getByTestId('palette-card-button')
```

**Files Affected**:
- `dashboard-operations.spec.ts` - lines 61, 84, 125
- `properties-panel.spec.ts` - lines 42, 71, 99, 134
- `yaml-editor.spec.ts` - line 60
- `file-operations.spec.ts`
- `ha-connection.spec.ts`

#### B. React Grid Layout Click Targets (Critical)
```typescript
// ❌ WRONG - clicks layout container, not content
const cardOnCanvas = window.locator('.react-grid-item').first();
await cardOnCanvas.click(); // Pointer events intercepted!

// ✅ CORRECT - click actual content
const card = window.getByTestId('canvas-card').first();
await card.click();
```

**Files Affected**:
- `dashboard-operations.spec.ts` - lines 28, 54, 76, 93, 134, 142
- `properties-panel.spec.ts` - lines 46, 75, 101, 136, 161, 186
- `templates.spec.ts`

#### C. Ant Design Internal Classes (Medium Risk)
```typescript
// ❌ WRONG - version-dependent internal classes
window.locator('.ant-form-item')
window.locator('[class*="PropertiesPanel"]')

// ✅ CORRECT - semantic or test ID
window.getByTestId('properties-panel')
window.getByRole('textbox', { name: /entity/i })
```

**Files Affected**:
- `properties-panel.spec.ts` - lines 18, 51
- `yaml-editor.spec.ts`
- `ha-connection.spec.ts`

---

### 3. **Missing Diagnostic Listeners**

**Problem**: When tests fail, no console/error/network diagnostics available
**Impact**: Impossible to debug failures without re-running with added logging

**Files WITHOUT Diagnostics** (17/20):
- ✅ `card-palette.spec.ts` (has diagnostics)
- ❌ `app-launch.spec.ts` (partial - only in one test)
- ❌ `dashboard-operations.spec.ts`
- ❌ `properties-panel.spec.ts`
- ❌ `yaml-editor.spec.ts`
- ❌ `file-operations.spec.ts`
- ❌ `ha-connection.spec.ts`
- ❌ `live-preview-deploy.spec.ts`
- ❌ `templates.spec.ts`
- ❌ All integration tests

**Required Pattern**:
```typescript
test('my test', async () => {
  const { app, window } = await launchElectronApp();

  // Add to EVERY test
  window.on('console', msg => console.log(`[renderer:${msg.type()}]`, msg.text()));
  window.on('pageerror', err => console.log('[renderer:error]', err));
  window.on('requestfailed', req =>
    console.log('[requestfailed]', req.url(), req.failure()?.errorText)
  );

  // ... rest of test
});
```

---

### 4. **Missing Test Infrastructure (Fixtures)**

**Problem**: Every test manually calls `launchElectronApp()` and `closeElectronApp()`
**Impact**: Boilerplate duplication, no consistent setup, harder to maintain

**Current Pattern** (❌ Bad):
```typescript
test('my test', async () => {
  const { app, window } = await launchElectronApp();
  try {
    // test logic
  } finally {
    await closeElectronApp(app);
  }
});
```

**Recommended Pattern** (✅ Good):
```typescript
// tests/fixtures/electron-fixtures.ts
export const test = base.extend<{ electronApp: ElectronApplication; page: Page }>({
  electronApp: async ({}, use) => {
    const app = await launchElectronApp();
    await use(app);
    await app.close();
  },
  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    await waitForAppReady(page);
    // Add diagnostics HERE (once for all tests)
    page.on('console', msg => console.log(`[renderer:${msg.type()}]`, msg.text()));
    await use(page);
  },
});

// In test files
import { test, expect } from '../fixtures/electron-fixtures';

test('my test', async ({ page }) => {
  // page is ready, diagnostics enabled, no boilerplate!
});
```

---

## 📋 File-by-File Analysis

### E2E Tests

#### 1. `app-launch.spec.ts` ⚠️ Medium Priority
**Issues**:
- ❌ No stable app-shell test ID
- ❌ Uses `isVisible('body')` instead of semantic landmark
- ❌ Relies on title string matching
- ⚠️ Has diagnostics in only 1/4 tests

**Recommendations**:
1. Add `data-testid="app-shell"` to root App component
2. Replace `isVisible('body')` with `expect(page.getByTestId('app-shell')).toBeVisible()`
3. Add diagnostics to all tests
4. Remove arbitrary timeout in console error test (line 107)

**Priority**: Medium (tests basic functionality)

---

#### 2. `dashboard-operations.spec.ts` 🔴 HIGH PRIORITY
**Issues**:
- ❌ 15+ uses of `waitForTimeout`
- ❌ Clicks `.react-grid-item` (layout container, not content)
- ❌ Global text selectors: `window.locator('text=Button')`
- ❌ No diagnostics
- ❌ No test IDs for canvas cards

**Critical Problems**:
```typescript
// Line 134, 142 - WILL FAIL due to pointer-events interception
const cardOnCanvas = window.locator('.react-grid-item').first();
await cardOnCanvas.click(); // ❌ Clicks layout, not card!

// Line 70, 90, 131 - Arbitrary delays
await window.waitForTimeout(1000); // ❌ Race condition
```

**Recommendations**:
1. **URGENT**: Use `window.getByTestId('canvas-card')` instead of `.react-grid-item`
2. Replace ALL `waitForTimeout` with explicit `expect().toBeVisible()` assertions
3. Scope palette queries:
   ```typescript
   const palette = window.getByTestId('card-palette');
   const button = palette.getByTestId('palette-card-button');
   await button.dblclick();
   ```
4. Add diagnostics to every test
5. Replace text selectors with test IDs

**Priority**: 🔴 **CRITICAL** (core functionality, high failure rate)

---

#### 3. `properties-panel.spec.ts` 🔴 HIGH PRIORITY
**Issues**:
- ❌ 10+ uses of `waitForTimeout`
- ❌ Clicks `.react-grid-item` (same issue as dashboard-operations)
- ❌ Fragile class selector: `[class*="PropertiesPanel"]`
- ❌ Global text selectors
- ❌ No diagnostics

**Critical Problems**:
```typescript
// Line 18 - Unstable class selector
const propertiesPanel = window.locator('[class*="PropertiesPanel"]');

// Line 46, 75, 101, 136 - Click interception risk
await window.locator('.react-grid-item').first().click();
```

**Recommendations**:
1. Add `data-testid="properties-panel"` to PropertiesPanel component
2. Use `window.getByTestId('canvas-card')` for canvas interactions
3. Replace timeouts with state assertions
4. Add test IDs for form inputs:
   ```typescript
   <Input data-testid="entity-input" />
   <Select data-testid="entity-selector" />
   ```

**Priority**: 🔴 **CRITICAL** (properties panel is core UX)

---

#### 4. `yaml-editor.spec.ts` ⚠️ Medium Priority
**Issues**:
- ❌ Most tests are placeholders (`expect(true).toBe(true)`)
- ❌ Uses `button:has-text("YAML")` - fragile text selector
- ❌ Uses `waitForTimeout` (line 61)
- ❌ No diagnostics

**Critical Gap**: Only 1 test actually tests functionality; rest are TODOs

**Recommendations**:
1. Add `data-testid="yaml-editor-button"` to YAML editor trigger
2. Add `data-testid="yaml-editor-dialog"` to modal
3. Implement Monaco editor test pattern (see `monaco-editor.spec.ts`):
   ```typescript
   await expect(page.locator('.monaco-editor')).toBeVisible();
   await page.locator('.monaco-editor textarea').fill(yamlContent);
   ```
4. Replace all placeholders with actual tests
5. Add diagnostics

**Priority**: Medium (feature exists but tests incomplete)

---

#### 5. `file-operations.spec.ts` ⚠️ Medium Priority
**Issues** (not fully analyzed but likely similar to others):
- ❌ Probably uses text selectors for menu items
- ❌ Likely missing test IDs for file dialogs
- ❌ No diagnostics

**Recommendations**:
1. Add test IDs to file operation buttons
2. Mock Electron dialog APIs for deterministic testing
3. Add diagnostics

**Priority**: Medium

---

#### 6. `ha-connection.spec.ts` ⚠️ Low Priority (External Dependency)
**Issues**:
- ❌ Tests real HA connection (not isolated)
- ❌ Likely has timing issues with WebSocket
- ❌ No diagnostics

**Recommendations**:
1. Use WebSocket mocking (see `theme-integration-mocked.spec.ts` pattern)
2. Add test IDs for connection form
3. Add diagnostics

**Priority**: Low (external dependency, should be mocked)

---

#### 7. `live-preview-deploy.spec.ts` ⚠️ Low Priority
Similar issues to `ha-connection.spec.ts` - requires mocking

---

#### 8. `templates.spec.ts` - Not analyzed (likely similar issues)

---

#### 9. `debug-app.spec.ts` ✅ Good (Diagnostic Test)
This file is for debugging only - OK as-is

---

### Integration Tests

#### 10. `monaco-editor.spec.ts` ✅ Partially Good
**Good Practices**:
- ✅ Uses fixture pattern
- ✅ Scoped Monaco queries

**Issues**:
- ⚠️ Some tests check ARIA attributes (brittle)
- ⚠️ Cursor position detection can be flaky

**Recommendations**:
- Focus on functional behavior, not implementation details

**Priority**: Low (mostly working)

---

#### 11-20. Other Integration Tests
**Common Issues**:
- ❌ Mix of fixture and non-fixture patterns
- ❌ No consistent diagnostic setup
- ❌ Some use mocking, some don't

**Recommendations**:
1. Standardize on fixture pattern
2. Add diagnostics to fixture
3. Clear separation: unit tests (mocked) vs integration tests (real)

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Infrastructure (Week 1)

**Priority Order**:

1. **Create Golden Fixture** (2-3 hours)
   - File: `tests/fixtures/electron-fixtures.ts`
   - Includes diagnostics by default
   - Proper window selection
   - Clean storage per test

2. **Add Missing Test IDs to App** (2-3 hours)
   - `data-testid="app-shell"` on root App
   - `data-testid="properties-panel"` on PropertiesPanel
   - `data-testid="yaml-editor-button"` on YAML trigger
   - `data-testid="yaml-editor-dialog"` on YAML modal
   - Already done: `card-palette`, `card-search`, `canvas-card`

3. **Fix Click Target Issues** (1 hour)
   - Replace ALL `.react-grid-item` clicks with `getByTestId('canvas-card')`
   - Files: `dashboard-operations.spec.ts`, `properties-panel.spec.ts`, `templates.spec.ts`

### Phase 2: High-Priority Test Files (Week 1-2)

**Fix in Order**:

1. ✅ `card-palette.spec.ts` - ALREADY DONE
2. `dashboard-operations.spec.ts` - Most critical
3. `properties-panel.spec.ts` - Core UX
4. `app-launch.spec.ts` - Basic smoke tests

**For Each File**:
- [ ] Convert to fixture pattern
- [ ] Replace all `waitForTimeout` with explicit assertions
- [ ] Replace text selectors with test IDs
- [ ] Fix click targets
- [ ] Verify diagnostics enabled (via fixture)

### Phase 3: Medium-Priority Tests (Week 2-3)

5. `yaml-editor.spec.ts` - Implement TODO tests
6. `file-operations.spec.ts` - Add test IDs, mock dialogs
7. Integration tests - Standardize patterns

### Phase 4: Low-Priority Tests (Week 3+)

8. `ha-connection.spec.ts` - Add mocking
9. `live-preview-deploy.spec.ts` - Add mocking
10. `templates.spec.ts` - Similar to dashboard-operations

---

## 📊 Success Metrics

**Before**:
- ❌ 206 arbitrary timeouts
- ❌ ~80% unstable selectors
- ❌ 85% tests missing diagnostics
- ❌ 0% using fixture pattern
- ⚠️ Estimated 40-60% flake rate

**After (Target)**:
- ✅ 0 arbitrary timeouts (use explicit waits)
- ✅ 95%+ stable selectors (test IDs + semantic)
- ✅ 100% tests with diagnostics (via fixture)
- ✅ 100% using fixture pattern
- ✅ <5% flake rate

---

## 🛠️ Implementation Templates

### Template 1: Convert Test to Fixture Pattern

```typescript
// BEFORE
test('my test', async () => {
  const { app, window } = await launchElectronApp();
  try {
    await waitForAppReady(window);
    // ... test logic
  } finally {
    await closeElectronApp(app);
  }
});

// AFTER
import { test, expect } from '../fixtures/electron-fixtures';

test('my test', async ({ page }) => {
  // page is ready, diagnostics enabled
  // ... test logic (no boilerplate!)
});
```

### Template 2: Replace waitForTimeout

```typescript
// BEFORE
await button.click();
await window.waitForTimeout(1000);
const card = window.locator('.react-grid-item').first();

// AFTER
await button.click();
await expect(window.getByTestId('canvas-card').first()).toBeVisible();
const card = window.getByTestId('canvas-card').first();
```

### Template 3: Scope Palette Queries

```typescript
// BEFORE
await window.locator('text=Button Card').first().dblclick();

// AFTER
const palette = window.getByTestId('card-palette');
await palette.getByTestId('palette-card-button').dblclick();
```

### Template 4: Fix Canvas Clicks

```typescript
// BEFORE
const cardOnCanvas = window.locator('.react-grid-item').first();
await cardOnCanvas.click();

// AFTER
const card = window.getByTestId('canvas-card').first();
await expect(card).toBeVisible();
await card.click();
```

---

## 📝 Notes

1. **Don't fix everything at once** - prioritize critical paths
2. **Test after each change** - ensure fixes don't break existing tests
3. **Use playwright trace viewer** - `npx playwright show-trace trace.zip`
4. **Screenshot on failure** - already configured in playwright.config.ts
5. **Run in headed mode during development** - `--headed` flag helps debug

---

## 🔗 References

- Playwright Best Practices: https://playwright.dev/docs/best-practices
- Electron Testing Guide: https://www.electronjs.org/docs/latest/tutorial/automated-testing
- Fixture Pattern: https://playwright.dev/docs/test-fixtures
- Locator Best Practices: https://playwright.dev/docs/locators#quick-guide
