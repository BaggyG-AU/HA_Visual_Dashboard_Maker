# Analysis: Current Tests vs Playwright-Electron-Testing Skill

**Date**: December 28, 2025

## Current State Analysis

### What We're Doing WRONG (Per Skill Guidelines)

#### ❌ Violation #1: Using `app.firstWindow()` Blindly
**Current Code** ([electron-helper.ts:33](../tests/helpers/electron-helper.ts#L33)):
```typescript
const window = await app.firstWindow();
```

**Skill Says**:
> "Do not use electronApp.firstWindow() blindly. Electron apps often open a generic window, or a splash screen, or devtools first."

**Impact**: This could be grabbing the wrong window, especially if Electron opens multiple windows.

#### ❌ Violation #2: Using Manual Timeouts
**Current Code** ([electron-helper.ts:77,85](../tests/helpers/electron-helper.ts#L77)):
```typescript
await window.waitForTimeout(1000);  // Line 77
await window.waitForTimeout(500);   // Line 85
```

**Skill Says**:
> "Never use `waitForTimeout(5000)`. Use `expect(locator).toBeVisible()` or `page.waitForFunction()`."

**Impact**: These arbitrary waits make tests slow and flaky. Sometimes 1000ms isn't enough, sometimes it's too much.

#### ❌ Violation #3: No Trace Configuration
**Current Code**: No trace configuration found in playwright.config.ts

**Skill Says**:
> "Trace on Failure is Mandatory: Configure `trace: 'on-first-retry'` or `'retain-on-failure'`."

**Impact**: When tests fail, we have no debugging information about what went wrong.

#### ❌ Violation #4: Helper-Based Instead of Fixture-Based
**Current Pattern**: Tests import helpers and call functions manually
```typescript
const testApp = await launchElectronApp();
app = testApp.app;
page = testApp.window;
await waitForAppReady(page);
```

**Skill Recommends**: Use `test.extend()` to create fixtures
```typescript
export const test = base.extend<TestFixtures>({
  electronApp: async ({}, use) => { ... },
  firstWindow: async ({ electronApp }, use) => { ... }
});
```

**Impact**: Current approach is more brittle and error-prone.

---

### What We're Doing RIGHT

#### ✅ Using @playwright/test
Current tests use the standard Playwright test runner - matches skill guideline #1.

#### ✅ Context Awareness
We correctly use:
- `page.evaluate()` for renderer context (IPC calls via `electronAPI`)
- `app.evaluate()` would be for main process (not needed yet)

#### ✅ Proper Main Path
We correctly identify the built main process file at `.vite/build/main.js`

---

## Critical Question: Does the Skill Solve Our Actual Problems?

Let me map our 5 failure categories against the skill's solutions:

### Category 1: Ant Design Strict Mode Violations (5 tests)
**Problem**: `.ant-badge-status-text` resolves to 6 elements

**Skill Solution**: ❌ **NOT ADDRESSED**
The skill focuses on window/timing issues, not selector specificity.

**Actual Fix Needed**: Scope selectors properly (no skill changes needed)
```typescript
// More specific selector
page.locator('.ant-modal-header .ant-badge-status-text')
```

---

### Category 2: Monaco Editor Not Rendering (24 tests)
**Problem**: `.monaco-editor` never becomes visible

**Skill Solution**: ⚠️ **PARTIALLY ADDRESSED**
The skill says "wait for a known testID" but doesn't specifically address Monaco.

**Current Code Issue**: Tests wait for selector but Monaco never loads
**Potential Skill Help**: Better waiting strategy using `page.waitForFunction()`

**Actual Fix Needed**:
1. Add proper wait for Monaco initialization
2. OR use playwright-monaco library
3. OR fix AMD/require conflict

---

### Category 3: Double-Click Timing Issues (14+ tests)
**Problem**: `dblclick()` times out despite element being visible

**Skill Solution**: ✅ **DIRECTLY ADDRESSED**
The skill's React hydration wait would help:
```typescript
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('[data-testid="app-shell"]', { timeout: 10000 });
```

**Current Code Issue**:
- We wait for `domcontentloaded` in `launchElectronApp()` (line 36)
- But then `waitForAppReady()` uses arbitrary timeouts instead of proper waits

**Skill Would Help**: YES - fixture pattern would enforce better waiting

---

### Category 4: Theme Storage Mismatch (11 tests)
**Problem**: Tests write to IPC but read from localStorage

**Skill Solution**: ❌ **NOT ADDRESSED**
This is a test logic issue, not a Playwright pattern issue.

**Actual Fix Needed**: Consistent storage approach (no skill changes needed)

---

### Category 5: Other E2E Timing Issues (11+ tests)
**Problem**: Various timeout issues in E2E tests

**Skill Solution**: ✅ **PARTIALLY ADDRESSED**
- Removing manual timeouts would help
- Using proper `expect(locator).toBeVisible()` would help
- Fixture-based approach would standardize waiting

---

## Risk Assessment: Should We Adopt the Skill Pattern?

### The Dangerous Truth

Looking at our failure data:
- **results-1.json**: 143/291 passed (49.1%) - baseline
- **My Phase 1 changes**: 142/291 passed (48.8%) - only broke 1 test
- **After reversion**: 131/279 passed (47.0%) - worse

**Pattern**: Big changes = big risk of making things worse

### The Skill Pattern Changes Required

1. **Create fixture file** (`tests/fixtures/electron-fixtures.ts`)
2. **Refactor ALL 279 tests** to use `test` from fixtures instead of `@playwright/test`
3. **Replace `launchElectronApp()` calls** with fixture usage
4. **Remove all `waitForTimeout()` calls** (there are many)
5. **Add proper selectors** for app-ready state

**Scope of Change**: MASSIVE - touches every single test file

**Risk Level**: 🔴 **EXTREMELY HIGH**

---

## Recommended Approach: Hybrid Strategy

### ❌ DO NOT: Full Skill Adoption (Too Risky)
- Don't refactor all tests to use fixtures yet
- Don't remove all timeouts at once
- Don't change the window acquisition pattern

### ✅ DO: Cherry-Pick Safe Improvements

#### Safe Change #1: Add Trace Configuration
**Risk**: ⚠️ LOW - just config change
**Benefit**: ✅ Better debugging when tests fail
**Files**: `playwright.config.ts`

#### Safe Change #2: Add Better Window Verification
**Risk**: ⚠️ LOW - additional check, doesn't remove existing logic
**Benefit**: ✅ Verify we have the right window
**Files**: `electron-helper.ts` - enhance `launchElectronApp()`

```typescript
const window = await app.firstWindow();
// Add verification
await window.waitForLoadState('domcontentloaded');
const url = window.url();
console.log('[TEST] Got window with URL:', url);
// Verify it's not blank or devtools
if (url === 'about:blank') {
  console.warn('[TEST] Warning: firstWindow is about:blank');
}
```

#### Safe Change #3: Enhance `waitForAppReady()` Without Timeouts
**Risk**: ⚠️ MEDIUM - changes existing logic
**Benefit**: ✅ More reliable waits
**Files**: `electron-helper.ts`

```typescript
export async function waitForAppReady(window: Page, timeout = 10000): Promise<void> {
  // Wait for body
  await window.waitForSelector('body', { timeout: 5000 });

  // Wait for React root to have children (proper wait)
  await window.waitForSelector('body > div', { state: 'attached', timeout: 3000 });

  // Wait for any loading indicators to disappear
  await window.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 2000 }).catch(() => {
    console.log('[TEST] No loading spinner found (app may not have one)');
  });

  // Optional: Check for specific app element
  const hasCardPalette = await window.locator('.ant-collapse-header').count();
  if (hasCardPalette > 0) {
    console.log('[TEST] Card palette detected - app ready');
  }
}
```

---

## The Actual Fix Plan (Skill-Informed, Risk-Aware)

### Phase 0: Backup & Safety ✅
1. ✅ Create backup of test files
2. ✅ Document current pass rate (143/291 = 49.1%)
3. ✅ Run tests to establish baseline

### Phase 1: Safe Skill Improvements (Target: Same or +1-2 tests)
**Changes**:
1. Add trace configuration to playwright.config.ts
2. Add window URL logging to electron-helper.ts
3. NO other changes

**Risk**: 🟢 Very Low
**Run tests**: Verify 143/291 still passing

### Phase 2: Fix Category 1 - Strict Mode (Target: +5 tests)
**Changes**: Scope selectors in entity-caching.spec.ts
**Risk**: 🟢 Low - targeted selector fixes
**Run tests**: Verify 148/291 passing

### Phase 3: Fix Category 4 - Theme Storage (Target: +11 tests)
**Changes**: Make theme test storage consistent
**Risk**: 🟡 Medium - logic changes in theme tests
**Run tests**: Verify 159/291 passing

### Phase 4: Evaluate Full Skill Adoption
**Only proceed if**:
- Phases 1-3 succeeded without regressions
- We understand why previous attempts failed
- We have clear evidence skill pattern would help remaining failures

---

## Conclusion: Don't Enhance the Skill Yet

**Recommendation**: ❌ **DO NOT** create an enhanced skill incorporating my analysis

**Reasoning**:
1. The skill addresses window/timing patterns, not our specific failures
2. Only 1-2 of our 5 failure categories would benefit from skill adoption
3. Full skill adoption = massive refactor = high risk of making things worse
4. My track record shows incremental > wholesale changes

**What TO Do**:
1. ✅ Use skill as **reference** for understanding best practices
2. ✅ Cherry-pick **safe improvements** (trace config, logging)
3. ✅ Fix actual bugs (selectors, storage) without changing test infrastructure
4. ✅ Reserve fixture-based refactor for AFTER we reach 70%+ pass rate

**The Skill Is Valuable**: But it's a "best practices" guide for green-field projects, not a magic fix for our specific legacy test issues.
