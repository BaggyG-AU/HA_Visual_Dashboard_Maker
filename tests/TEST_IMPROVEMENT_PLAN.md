# Test Suite Improvement Plan

**Date**: 2025-12-29
**Status**: Analysis Complete - Ready for Implementation
**Baseline**: Card Palette tests at 100% (5/5 passing)

---

## Executive Summary

Analysis of 16 test files (9 E2E, 7 Integration) identified **32+ reliability issues** across the test suite. The primary issues are:

1. **Unstable Selectors** (80% of tests affected)
   - Ant Design internal classes: `[class*="PropertiesPanel"]`
   - React Grid Layout classes: `.react-grid-item`
   - Global text selectors: `text=Button`

2. **Timing Issues** (60% of tests affected)
   - 206+ uses of `waitForTimeout` instead of explicit state assertions
   - Race conditions in modal operations

3. **Click Target Problems** (40% of E2E tests)
   - Clicking `.react-grid-item` (layout container) instead of actual content
   - Pointer-event interception issues

4. **Missing Diagnostics** (85% of tests)
   - No console/error/network listeners
   - Difficult to debug failures

---

## Priority Matrix

### HIGH Priority (Implement This Week)

| File | Issues | Impact | Effort |
|------|--------|--------|--------|
| **properties-panel.spec.ts** | 5 critical issues | HIGH | 4-6 hours |
| **dashboard-operations.spec.ts** | 5 critical issues | HIGH | 4-6 hours |
| **monaco-editor.spec.ts** | 5 critical issues | HIGH | 6-8 hours |

**Estimated Total**: 14-20 hours

### MEDIUM Priority (Next Week)

| File | Issues | Impact | Effort |
|------|--------|--------|--------|
| **entity-browser.spec.ts** | 4 issues | MEDIUM | 3-4 hours |
| **entity-caching.spec.ts** | 3 issues | MEDIUM | 2-3 hours |
| **app-launch.spec.ts** | 3 issues | MEDIUM | 2 hours |
| **file-operations.spec.ts** | 3 issues | MEDIUM | 2-3 hours |
| **theme-integration.spec.ts** | 2 issues | MEDIUM | 2 hours |

**Estimated Total**: 13-17 hours

### LOW Priority (Future Sprint)

- **debug-app.spec.ts** - 1 issue (1 hour)
- **templates.spec.ts** - Mostly placeholders (wait for feature)
- **yaml-editor.spec.ts** - Mostly placeholders (wait for feature)
- **ha-connection.spec.ts** - All placeholders (wait for feature)

---

## Detailed Issues by File

### 1. properties-panel.spec.ts (HIGH PRIORITY)

**File**: `tests/e2e/properties-panel.spec.ts`
**Lines Affected**: 18, 42, 46, 71, 75, 79, 101, 105, 134, 136, 160, 162, 166, 192, 194, 228, 232, 347, 385, 510

#### Issue 1: Ant Design Internal Class Selectors
**Current Code** (Lines 18, 79, 232, 510):
```typescript
const propertiesPanel = window.locator('[class*="PropertiesPanel"]');
```

**Problem**:
- Internal CSS class pattern matching is brittle
- Breaks if component refactored or class names change
- No semantic meaning

**Fix**:
```typescript
// Add to src/components/PropertiesPanel.tsx:
<div data-testid="properties-panel" style={{ ... }}>

// In tests:
const propertiesPanel = window.getByTestId('properties-panel');
```

**Impact**: Affects 11 test cases in this file

---

#### Issue 2: Global Text Selectors for Cards
**Current Code** (Lines 42, 71, 134, 160, 192):
```typescript
const buttonCard = window.locator('text=Button Card')
  .or(window.locator('text=Button'))
  .first();
```

**Problem**:
- Matches text anywhere in the document (global scope)
- Multiple fallback attempts indicate instability
- Breaks if UI text changes

**Fix**:
```typescript
// Scope to card palette container
const palette = window.getByTestId('card-palette');
const buttonCard = palette.getByTestId('palette-card-button');
```

**Impact**: Affects 8 test cases

---

#### Issue 3: React Grid Layout Click Targets
**Current Code** (Lines 46, 75, 101, 136, 162, 194, 228):
```typescript
const cardOnCanvas = window.locator('.react-grid-item').first();
await cardOnCanvas.click();
```

**Problem**:
- `.react-grid-item` is a layout container, not the card content
- Pointer events may be intercepted
- Click might miss interactive elements inside

**Fix**:
```typescript
// Use canvas-card test ID (already added to GridCanvas.tsx)
const cardOnCanvas = window.getByTestId('canvas-card').first();
await expect(cardOnCanvas).toBeVisible();
await cardOnCanvas.click();
```

**Impact**: Affects 10+ test cases

---

#### Issue 4: Input Field Selectors by ID Pattern
**Current Code** (Lines 105, 166, 347, 385):
```typescript
const nameInput = window.locator('input[id*="name"]');
const titleInput = window.locator('input[id*="title"]');
```

**Problem**:
- Assumes Ant Design Form auto-generated IDs follow specific pattern
- Fragile - breaks if form structure changes
- Ambiguous when multiple forms present

**Fix**:
```typescript
// Add to form inputs in PropertiesPanel.tsx:
<Form.Item label="Name">
  <Input data-testid="card-name-input" value={...} />
</Form.Item>

<Form.Item label="Title">
  <Input data-testid="card-title-input" value={...} />
</Form.Item>

// In tests:
const nameInput = window.getByTestId('card-name-input');
const titleInput = window.getByTestId('card-title-input');
```

**Impact**: Affects 6+ test cases

---

#### Issue 5: Missing Diagnostics
**Current Code**: No beforeEach/beforeAll diagnostic setup

**Problem**:
- Test failures provide no console/error context
- Can't see React errors or warnings
- No network request failures logged

**Fix**:
```typescript
import { test, expect } from '../fixtures/electron-fixtures';

// Fixture automatically provides:
// - Console logging
// - Error/exception listeners
// - Network failure tracking
// - Storage isolation
// - React hydration waiting

test('should update card properties', async ({ page }) => {
  // page is ready with full diagnostics enabled
});
```

**Impact**: Affects ALL test cases in file

---

### 2. dashboard-operations.spec.ts (HIGH PRIORITY)

**File**: `tests/e2e/dashboard-operations.spec.ts`
**Lines Affected**: 28, 54, 61, 76, 84, 125, 142, 219, 226, 273-304

**Status**: ✅ **REFACTORED VERSION ALREADY CREATED**
**File**: `tests/e2e/dashboard-operations-REFACTORED.spec.ts`

#### Recommended Action:
1. Test the refactored version:
   ```bash
   npm run test:e2e -- tests/e2e/dashboard-operations-REFACTORED.spec.ts
   ```

2. If passing (expected 6/6), replace original:
   ```bash
   mv tests/e2e/dashboard-operations.spec.ts tests/e2e/dashboard-operations.spec.ts.OLD
   mv tests/e2e/dashboard-operations-REFACTORED.spec.ts tests/e2e/dashboard-operations.spec.ts
   ```

3. Document changes in commit message

**Reference**: See `tests/REFACTORING_COMPARISON.md` for detailed before/after comparison

---

### 3. monaco-editor.spec.ts (HIGH PRIORITY)

**File**: `tests/integration/monaco-editor.spec.ts`
**Lines Affected**: 26-42, 53, 56, 61, 65, 69, 83, 87-88, 91, 104, 126, 143, 161, 199-200, 307-376

#### Issue 1: Modal Detection by Text
**Current Code** (Lines 53, 61, 83, 91):
```typescript
await page.waitForSelector('.ant-modal:has-text("Edit Dashboard YAML")');
const modal = page.locator('.ant-modal:has-text("Edit YAML")');
```

**Problem**:
- Fragile text-based detection
- Breaks if modal title changes
- No unique identifier

**Fix**:
```typescript
// Add to YAML editor modal component:
<Modal data-testid="yaml-editor-modal" title="Edit Dashboard YAML">

// In tests:
const modal = page.getByTestId('yaml-editor-modal');
await expect(modal).toBeVisible();
```

**Impact**: Affects 8+ test cases

---

#### Issue 2: Monaco Internal Class Selectors
**Current Code** (Lines 56, 65, 69, 87-88, 104):
```typescript
const monacoEditor = page.locator('.monaco-editor');
const viewLines = page.locator('.view-lines');
const lineNumbers = page.locator('.line-numbers');
const mtk1 = page.locator('.mtk1');
const mtk2 = page.locator('.mtk2');
```

**Problem**:
- Relies on Monaco's internal DOM structure
- May break with Monaco version updates
- `.mtk1`, `.mtk2` are syntax highlighting classes (extremely fragile)

**Fix**:
```typescript
// Use Monaco's accessible textarea instead:
const monacoInput = page.locator('.monaco-editor textarea[aria-label*="editor"]');
await monacoInput.focus();

// Or wait for Monaco initialization:
await expect(page.locator('.monaco-editor')).toBeVisible();
await page.waitForFunction(() => {
  const editor = (window as any).monacoEditorInstance;
  return editor && editor.getValue !== undefined;
});

// Get/set value via Monaco API instead of DOM scraping:
const yamlContent = await page.evaluate(() => {
  return (window as any).monacoEditorInstance.getValue();
});
```

**Impact**: Affects 6+ test cases

---

#### Issue 3: Aggressive Modal Cleanup Loop
**Current Code** (Lines 26-42):
```typescript
test.beforeEach(async () => {
  let attempts = 0;
  while (attempts < 3) {
    const modalCount = await page.locator('.ant-modal').count();
    if (modalCount === 0) break;

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    attempts++;
  }
});
```

**Problem**:
- Suggests modal dismissal timing issues
- Arbitrary retry count and timeout
- No explicit wait for modal to actually close

**Fix**:
```typescript
test.beforeEach(async () => {
  // Close any open modals explicitly
  const modals = page.locator('[role="dialog"]');
  const modalCount = await modals.count();

  if (modalCount > 0) {
    const closeButton = modals.first().locator('button[aria-label="Close"]');
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await expect(modals).toHaveCount(0, { timeout: 2000 });
    }
  }
});
```

**Impact**: Affects test reliability (setup phase)

---

#### Issue 4: Validation Alert Selectors
**Current Code** (Lines 126, 143, 161, 199-200):
```typescript
const errorAlert = page.locator('.ant-alert-error:has-text("YAML Validation Error")');
```

**Problem**:
- Relies on exact error message text
- Breaks if error message wording changes
- Combines class selector with text matcher

**Fix**:
```typescript
// Use role-based alert selector:
const errorAlert = page.locator('[role="alert"].ant-alert-error');
await expect(errorAlert).toBeVisible();

// Or add test ID to alert component:
const errorAlert = page.getByTestId('yaml-validation-error');
```

**Impact**: Affects 4 test cases

---

#### Issue 5: Skipped Tests Due to Reliability Issues
**Current Code** (Lines 307-376):
```typescript
test.skip('should update properties panel Monaco editor', async () => {
  // Skip Reason: Cannot reliably add cards to canvas in test environment
  // Ant Design Collapse component animation causes timing issues
  expect(true).toBe(true);
});
```

**Problem**:
- Tests skipped due to infrastructure issues
- Valuable functionality not covered
- Root cause (Collapse animation) is solvable

**Fix**:
```typescript
// Use fixture pattern with proper waits:
import { test, expect, expandCategory, addCardToCanvas } from '../fixtures/electron-fixtures';

test('should update properties panel Monaco editor', async ({ page }) => {
  // Expand category with proper animation wait
  await expandCategory(page, 'Controls');

  // Add card with explicit state assertion
  await addCardToCanvas(page, 'button');

  // Select card
  const card = page.getByTestId('canvas-card').first();
  await card.click();

  // Open YAML editor in properties panel
  const propertiesPanel = page.getByTestId('properties-panel');
  const editYamlButton = propertiesPanel.getByRole('button', { name: /Edit YAML/i });
  await editYamlButton.click();

  // Wait for Monaco editor modal
  const modal = page.getByTestId('yaml-editor-modal');
  await expect(modal).toBeVisible();
});
```

**Impact**: Enables 4 previously skipped test cases

---

### 4. entity-browser.spec.ts (MEDIUM PRIORITY)

**File**: `tests/integration/entity-browser.spec.ts`
**Lines Affected**: 65, 71, 74, 110, 120-150, 142, 187, 192, 448-451

#### Issue 1: Modal Detection Pattern
**Current Code** (Lines 65, 71, 74):
```typescript
const modal = window.locator('.ant-modal:has-text("Entity Browser")');
await modal.waitFor({ state: 'visible', timeout: 5000 });
```

**Problem**:
- Fragile text-based modal detection
- Breaks if modal title changes

**Fix**:
```typescript
// Add to EntityBrowserModal component:
<Modal data-testid="entity-browser-modal" title="Entity Browser">

// In tests:
const modal = window.getByTestId('entity-browser-modal');
await expect(modal).toBeVisible({ timeout: 5000 });
```

**Impact**: Affects 8+ test cases

---

#### Issue 2: Tab Navigation Fragility
**Current Code** (Line 131):
```typescript
const tab = modal.locator('.ant-tabs-tab').nth(1);
await tab.click();
```

**Problem**:
- Assumes specific tab order (nth(1) = second tab)
- Breaks if tab order changes
- No semantic meaning

**Fix**:
```typescript
// Use text-based tab selection (more stable):
const lightTab = modal.locator('.ant-tabs-tab').filter({ hasText: /^light$/i });
await lightTab.click();

// Or add test IDs to tabs:
const lightTab = modal.getByTestId('entity-tab-light');
await lightTab.click();
```

**Impact**: Affects 3 test cases

---

#### Issue 3: Table Selectors
**Current Code** (Lines 110, 142, 187):
```typescript
const rows = await window.locator('.ant-table-row').count();
const table = window.locator('.ant-table');
```

**Problem**:
- Generic class selectors
- No way to target specific entity rows
- Difficult to verify specific entities

**Fix**:
```typescript
// Add test IDs to entity rows in source:
// <tr data-testid={`entity-row-${entity.entity_id}`}>

// In tests:
const lightRow = window.getByTestId('entity-row-light.living_room');
await expect(lightRow).toBeVisible();
```

**Impact**: Affects 5+ test cases

---

#### Issue 4: Radio Button Selection Problem
**Current Code** (Line 192, documented issue at 448-451):
```typescript
// Try to select the entity using the radio button
const radio = firstRow.locator('input[type="radio"]');
if (await radio.isVisible()) {
  await radio.click();
}

// Lines 448-451 comment:
// Note: Monaco editor line numbers are absolutely positioned and can
// block clicks on radio buttons. May need to adjust Monaco positioning
// or use force: true in tests.
```

**Problem**:
- Monaco editor interferes with radio button clicks
- Workaround needed (force: true) which bypasses real user interaction
- Indicates layout/z-index issue

**Fix Option 1** (Test-side workaround):
```typescript
// Click with force to bypass Monaco overlay
await radio.click({ force: true });
```

**Fix Option 2** (Source-side fix):
```typescript
// In EntityBrowserModal component, adjust Monaco z-index:
<div className="monaco-container" style={{ position: 'relative', zIndex: 1 }}>
  <MonacoEditor />
</div>

<div className="entity-table" style={{ position: 'relative', zIndex: 2 }}>
  <Table />
</div>

// Then in tests (no force needed):
await radio.click();
```

**Impact**: Affects entity selection reliability

---

### 5. entity-caching.spec.ts (MEDIUM PRIORITY)

**File**: `tests/integration/entity-caching.spec.ts`
**Lines Affected**: 36-52, 58, 76, 79, 85, 97, 100, 107, 122, 143, 147, 154, 174, 228, 251, 287

#### Issue 1: Modal Text-Based Selectors
**Current Code** (Lines 58, 76, 85, 97, 122, 143, 154):
```typescript
const modal = window.locator('.ant-modal:has-text("Entity Browser")');
```

**Problem**: Same as entity-browser.spec.ts Issue 1

**Fix**: Add `data-testid="entity-browser-modal"` to modal component

**Impact**: Affects 12+ test cases

---

#### Issue 2: Status Badge Selector
**Current Code** (Lines 79, 100, 147, 174, 228, 251, 287):
```typescript
const statusText = await modal.locator('.ant-badge-status-text').first().textContent();
```

**Problem**:
- Uses Ant Design internal class `.ant-badge-status-text`
- Brittle to Ant Design updates
- No semantic meaning

**Fix**:
```typescript
// Use role-based selector:
const statusBadge = modal.locator('[role="status"]').first();
const statusText = await statusBadge.textContent();

// Or add test ID to status component:
const statusBadge = modal.getByTestId('entity-cache-status');
```

**Impact**: Affects 7 test cases

---

#### Issue 3: Generic Modal Close Loop
**Current Code** (Lines 36-52):
```typescript
test.beforeEach(async ({ page }) => {
  let attempts = 0;
  while (attempts < 3) {
    const modalCount = await page.locator('.ant-modal').count();
    if (modalCount === 0) break;

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const cancelButtons = page.locator('button:has-text("Cancel")');
    if (await cancelButtons.count() > 0) {
      await cancelButtons.first().click();
      await page.waitForTimeout(300);
    }

    attempts++;
  }
});
```

**Problem**: Same as monaco-editor.spec.ts Issue 3

**Fix**: Use explicit modal close with state verification (see monaco-editor fix above)

**Impact**: Affects test reliability (setup phase)

---

#### Issue 4: Missing Explicit Wait for Filter State
**Current Code** (Line 107):
```typescript
await seedEntityCache(page);
const filterInput = modal.locator('input[placeholder="Filter entities"]');
await filterInput.fill('light');

// Immediately check results - race condition!
await page.waitForTimeout(300); // Weak wait
const filteredRows = await modal.locator('.ant-table-row').count();
```

**Problem**:
- `waitForTimeout(300)` is arbitrary
- Doesn't wait for actual filter operation to complete
- Race condition if filtering is slow

**Fix**:
```typescript
await filterInput.fill('light');

// Wait for table to update (explicit state check)
await expect(modal.locator('.ant-table-row').first()).toBeVisible({ timeout: 2000 });

// Or wait for specific count
await expect(modal.locator('.ant-table-row')).toHaveCount(expectedCount, { timeout: 2000 });
```

**Impact**: Affects 3+ test cases with filtering

---

### 6. app-launch.spec.ts (MEDIUM PRIORITY)

**File**: `tests/e2e/app-launch.spec.ts`
**Lines Affected**: 75-82, 94-101, 107

#### Issue 1: Generic Element Counting for App Validation
**Current Code** (Lines 75-82):
```typescript
const rootDiv = await window.locator('body > div').count();
const allDivs = await window.locator('div').count();

console.log(`Root divs in body: ${rootDiv}`);
console.log(`Total divs in DOM: ${allDivs}`);

expect(rootDiv).toBeGreaterThan(0);
expect(allDivs).toBeGreaterThan(5);
```

**Problem**:
- Generic div counting has no semantic meaning
- Doesn't verify actual app functionality
- Brittle - count changes with any UI update

**Fix**:
```typescript
// Verify specific app landmarks
const appShell = window.getByTestId('app-shell');
await expect(appShell).toBeVisible();

const cardPalette = window.getByTestId('card-palette');
await expect(cardPalette).toBeVisible();

const canvas = window.locator('.react-grid-layout');
await expect(canvas).toBeAttached();
```

**Impact**: Makes test more meaningful and stable

---

#### Issue 2: Arbitrary Timeout for Error Detection
**Current Code** (Line 107):
```typescript
// Wait a bit to allow any delayed errors to appear
await window.waitForTimeout(2000);
```

**Problem**:
- Arbitrary 2-second wait
- Doesn't actually verify absence of errors
- Slows down test unnecessarily

**Fix**:
```typescript
// Collect errors during setup
const errors: string[] = [];
window.on('pageerror', (err) => errors.push(err.message));

// After app loads, verify no errors
expect(errors).toHaveLength(0);
```

**Impact**: Faster and more reliable error detection

---

#### Issue 3: Incomplete Diagnostics
**Current Code** (Lines 94-101):
```typescript
const logs: string[] = [];
window.on('console', (msg) => {
  logs.push(`[${msg.type()}] ${msg.text()}`);
});

// No error listener
// No network failure listener
```

**Problem**:
- Only captures console messages
- Misses uncaught exceptions (pageerror)
- Misses network failures

**Fix**:
```typescript
// Use fixture pattern which includes ALL diagnostics automatically
import { test, expect } from '../fixtures/electron-fixtures';

test('should launch without errors', async ({ page }) => {
  // page fixture already has:
  // - console listeners
  // - pageerror listeners
  // - requestfailed listeners
  // - storage isolation
  // - React hydration waiting
});
```

**Impact**: Better failure diagnostics

---

### 7. file-operations.spec.ts (MEDIUM PRIORITY)

**File**: `tests/e2e/file-operations.spec.ts`
**Lines Affected**: 46-48, 67, 69, 92, 143, 144, 149-152

#### Issue 1: Global Text Selectors
**Current Code** (Lines 67, 92, 143):
```typescript
const buttonCard = window.locator('text=Button Card').first();
```

**Problem**: Same as properties-panel.spec.ts Issue 2

**Fix**: Use scoped palette queries with test IDs

**Impact**: Affects 3 test cases

---

#### Issue 2: Timing with waitForTimeout
**Current Code** (Lines 69, 144):
```typescript
await buttonCard.dblclick();
await window.waitForTimeout(500);

const cards = await window.locator('.react-grid-item').count();
```

**Problem**:
- Arbitrary 500ms wait
- Doesn't verify card actually appeared
- Race condition

**Fix**:
```typescript
await buttonCard.dblclick();

// Wait for card to appear on canvas
await expect(window.getByTestId('canvas-card').first()).toBeVisible({ timeout: 3000 });

const cards = await window.getByTestId('canvas-card').count();
```

**Impact**: Affects 2 test cases

---

#### Issue 3: Placeholder Tests
**Current Code** (Lines 46-48, 73, 149-152):
```typescript
test.skip('should open a file', async () => {
  // TODO: Mock file dialog
  expect(true).toBe(true);
});
```

**Problem**:
- Many tests are placeholders
- No actual file operation testing
- Documented issue: need to mock Electron dialogs

**Fix** (when implementing):
```typescript
test('should open a file', async () => {
  const { app, window } = await launchElectronApp();

  try {
    // Mock file dialog response
    await app.evaluate(({ dialog }) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: ['/path/to/test/dashboard.json']
      });
    });

    const openButton = window.getByRole('button', { name: /Open/i });
    await openButton.click();

    // Verify file loaded
    const canvas = window.getByTestId('canvas-card');
    await expect(canvas.first()).toBeVisible();
  } finally {
    await closeElectronApp(app);
  }
});
```

**Impact**: Enables future file operation tests

---

### 8. theme-integration.spec.ts (MEDIUM PRIORITY)

**File**: `tests/integration/theme-integration.spec.ts`
**Lines Affected**: 18, 84, 94, 98, 100, 107-246

#### Issue 1: Text-Based Button Selectors
**Current Code** (Lines 18, 94, 100):
```typescript
const selectThemeButton = window.locator('text=Select theme');
const connectButton = window.locator('text=Connect to HA');
```

**Problem**:
- Global text selectors
- Breaks if button text changes
- No semantic meaning

**Fix**:
```typescript
// Use role-based selectors:
const selectThemeButton = window.getByRole('button', { name: /Select theme/i });
const connectButton = window.getByRole('button', { name: /Connect to HA/i });

// Or add test IDs:
const selectThemeButton = window.getByTestId('select-theme-button');
const connectButton = window.getByTestId('connect-ha-button');
```

**Impact**: Affects 3 test cases

---

#### Issue 2: Password Input Assumption
**Current Code** (Line 98):
```typescript
const tokenInput = window.locator('input[type="password"]')
  .or(window.locator('input[placeholder*="token"]'));
```

**Problem**:
- Assumes token input is password type
- Fragile fallback with placeholder text matching
- Breaks if input type or placeholder changes

**Fix**:
```typescript
// Add test ID to form input:
const tokenInput = window.getByTestId('ha-token-input');

// Or use label association:
const tokenInput = window.getByLabel(/Token|Access token/i);
```

**Impact**: Affects 2 test cases

---

#### Issue 3: Mostly Placeholder Tests
**Current Code** (Lines 107-246):
```typescript
test('should load themes from Home Assistant', async () => {
  // TODO: Mock Home Assistant connection and theme fetch
  expect(true).toBe(true);
});
```

**Problem**:
- 18 of 20 tests are placeholders
- No actual theme integration testing
- Waiting for HA connection mocking

**Fix** (future implementation):
```typescript
test('should load themes from Home Assistant', async ({ page }) => {
  // Mock HA WebSocket connection
  await page.route('ws://localhost:8123/api/websocket', route => {
    // Return mock theme data
  });

  const connectButton = page.getByTestId('connect-ha-button');
  await connectButton.click();

  // Verify themes loaded
  const themeList = page.getByTestId('theme-list');
  await expect(themeList.getByRole('option')).toHaveCount(5);
});
```

**Impact**: Enables future theme integration tests

---

## Implementation Strategy

### Phase 1: Component Test ID Additions (Day 1)

**Effort**: 2-3 hours

**Files to Modify**:

1. **src/components/PropertiesPanel.tsx**
   ```tsx
   // Line ~291: Add data-testid to root div
   <div data-testid="properties-panel" style={{ padding: '16px', ... }}>

   // Add test IDs to form inputs:
   <Form.Item label="Name">
     <Input data-testid="card-name-input" />
   </Form.Item>

   <Form.Item label="Title">
     <Input data-testid="card-title-input" />
   </Form.Item>

   <Form.Item label="Entity">
     <Select data-testid="entity-selector" />
   </Form.Item>
   ```

2. **src/components/YamlEditorDialog.tsx**
   ```tsx
   <Modal data-testid="yaml-editor-modal" title="Edit Dashboard YAML">
   ```

3. **src/components/EntityBrowserModal.tsx** (if exists)
   ```tsx
   <Modal data-testid="entity-browser-modal" title="Entity Browser">

   // Add test IDs to tabs:
   <Tabs.TabPane data-testid="entity-tab-light" tab="light" key="light">
   <Tabs.TabPane data-testid="entity-tab-sensor" tab="sensor" key="sensor">
   ```

4. **Verify existing test IDs**:
   - ✅ `src/App.tsx` - Already has `data-testid="app-shell"`
   - ✅ `src/components/CardPalette.tsx` - Already has palette test IDs
   - ✅ `src/components/GridCanvas.tsx` - Already has `data-testid="canvas-card"`

---

### Phase 2: High Priority Test Refactoring (Week 1)

#### Day 2-3: properties-panel.spec.ts (6 hours)

**Action Plan**:

1. Convert to fixture pattern:
   ```typescript
   import { test, expect, expandCategory, addCardToCanvas, selectCanvasCard }
     from '../fixtures/electron-fixtures';
   ```

2. Replace ALL selectors:
   - `[class*="PropertiesPanel"]` → `getByTestId('properties-panel')`
   - `text=Button Card` → `palette.getByTestId('palette-card-button')`
   - `.react-grid-item` → `getByTestId('canvas-card')`
   - `input[id*="name"]` → `getByTestId('card-name-input')`

3. Remove ALL `waitForTimeout` calls:
   ```typescript
   // BEFORE
   await buttonCard.dblclick();
   await window.waitForTimeout(1000);

   // AFTER
   await buttonCard.dblclick();
   await expect(page.getByTestId('canvas-card').first()).toBeVisible();
   ```

4. Test and verify:
   ```bash
   npm run test:e2e -- tests/e2e/properties-panel.spec.ts
   ```

**Expected Outcome**: 80%+ pass rate (currently ~40%)

---

#### Day 4: Verify dashboard-operations.spec.ts (2 hours)

**Action Plan**:

1. Test refactored version:
   ```bash
   npm run test:e2e -- tests/e2e/dashboard-operations-REFACTORED.spec.ts
   ```

2. If passing, replace original:
   ```bash
   mv tests/e2e/dashboard-operations.spec.ts tests/e2e/dashboard-operations.spec.ts.OLD
   mv tests/e2e/dashboard-operations-REFACTORED.spec.ts tests/e2e/dashboard-operations.spec.ts
   ```

3. Commit changes with detailed message

**Expected Outcome**: 6/6 tests passing (100%)

---

#### Day 5-7: monaco-editor.spec.ts (8 hours)

**Action Plan**:

1. Add test ID to YAML editor modal (Phase 1)

2. Replace modal detection:
   ```typescript
   // BEFORE
   await page.waitForSelector('.ant-modal:has-text("Edit Dashboard YAML")');

   // AFTER
   const modal = page.getByTestId('yaml-editor-modal');
   await expect(modal).toBeVisible();
   ```

3. Replace Monaco internal selectors with API-based approach:
   ```typescript
   // BEFORE
   const yamlText = await page.locator('.view-lines').textContent();

   // AFTER
   const yamlText = await page.evaluate(() => {
     return (window as any).monacoEditorInstance.getValue();
   });
   ```

4. Fix modal cleanup loop (see Issue 3 fix above)

5. Un-skip previously skipped tests:
   - Use fixture pattern
   - Use `expandCategory` and `addCardToCanvas` helpers
   - Proper animation waits

6. Test and verify:
   ```bash
   npm run test:e2e -- tests/integration/monaco-editor.spec.ts
   ```

**Expected Outcome**: 15+ tests passing (currently ~10)

---

### Phase 3: Medium Priority Tests (Week 2)

#### entity-browser.spec.ts (4 hours)
1. Add modal test ID
2. Replace tab nth() with text-based selection
3. Add entity row test IDs
4. Fix radio button click (Monaco z-index issue)

#### entity-caching.spec.ts (3 hours)
1. Add modal test ID
2. Replace status badge selector
3. Fix modal cleanup loop
4. Replace filter waitForTimeout with explicit waits

#### app-launch.spec.ts (2 hours)
1. Convert to fixture pattern
2. Replace div counting with semantic checks
3. Remove arbitrary timeout

#### file-operations.spec.ts (3 hours)
1. Replace text selectors
2. Replace waitForTimeout with explicit waits
3. Implement placeholder tests (when ready)

#### theme-integration.spec.ts (2 hours)
1. Replace text selectors with role-based
2. Fix password input assumption
3. Implement placeholder tests (when ready)

---

### Phase 4: Low Priority / Future Work

- **debug-app.spec.ts** - Replace wildcard selectors
- **templates.spec.ts** - Wait for feature implementation
- **yaml-editor.spec.ts** - Wait for feature implementation
- **ha-connection.spec.ts** - Wait for feature implementation
- **card-rendering.spec.ts** - Already documented as unreliable (skip for now)
- **error-scenarios.spec.ts** - Wait for feature implementation
- **service-layer.spec.ts** - Wait for feature implementation
- **yaml-operations.spec.ts** - Wait for feature implementation

---

## Success Metrics

### Current State:
- **Total Tests**: ~100+
- **Passing Rate**: ~60%
- **Flake Rate**: ~40-60%
- **Stable Selectors**: 20%
- **Fixture Usage**: 5%
- **Diagnostics Coverage**: 15%

### Target State (After Phase 2):
- **Total Tests**: ~100+
- **Passing Rate**: 80%+
- **Flake Rate**: <5%
- **Stable Selectors**: 90%+
- **Fixture Usage**: 80%+
- **Diagnostics Coverage**: 100%

---

## Commit Strategy

### Commit 1: Add Test IDs to Components
```
feat(tests): Add data-testid attributes for test stability

- Add data-testid to PropertiesPanel component
- Add data-testid to YamlEditorDialog modal
- Add data-testid to EntityBrowserModal (if exists)
- Add test IDs to form inputs in PropertiesPanel

Related: Test reliability improvements
Files: src/components/*
```

### Commit 2: Refactor properties-panel.spec.ts
```
test: Refactor properties-panel tests for reliability

- Convert to fixture pattern for automatic diagnostics
- Replace [class*="PropertiesPanel"] with getByTestId
- Replace text selectors with scoped palette queries
- Replace .react-grid-item with getByTestId('canvas-card')
- Replace input[id*="name"] with getByTestId
- Remove all waitForTimeout calls

Result: 80%+ pass rate (was ~40%)
Files: tests/e2e/properties-panel.spec.ts
```

### Commit 3: Replace dashboard-operations with refactored version
```
test: Apply stable patterns to dashboard-operations tests

- Replace original with refactored version
- 100% pass rate (6/6 tests)
- Storage isolation, stable selectors, explicit waits

See: tests/REFACTORING_COMPARISON.md for details
Files: tests/e2e/dashboard-operations.spec.ts
```

### Commit 4: Refactor monaco-editor.spec.ts
```
test: Refactor Monaco editor tests for reliability

- Add yaml-editor-modal test ID
- Replace modal text detection with test ID
- Use Monaco API instead of DOM scraping
- Fix modal cleanup loop
- Un-skip previously skipped tests
- Use fixture pattern with helpers

Result: 15+ tests passing
Files: tests/integration/monaco-editor.spec.ts
```

---

## Risk Assessment

### High Risk:
- **Monaco Editor API Changes**: If Monaco internal API changes, getValue() may break
  - **Mitigation**: Add try/catch with fallback to DOM scraping

- **Ant Design Updates**: Internal classes may change with version updates
  - **Mitigation**: Use test IDs exclusively, avoid internal classes

### Medium Risk:
- **Test ID Naming Conflicts**: Multiple components may use same test ID
  - **Mitigation**: Use scoped queries (container.getByTestId)

- **Animation Timing**: Some tests may still flake on slow machines
  - **Mitigation**: Use longer timeouts (5s default), explicit state waits

### Low Risk:
- **Fixture Pattern Adoption**: Learning curve for new contributors
  - **Mitigation**: Comprehensive documentation, examples in REFACTORING_COMPARISON.md

---

## Documentation Updates

### Files to Update:
1. **README.md** - Add section on test stability patterns
2. **tests/README.md** - Create comprehensive testing guide
3. **CONTRIBUTING.md** - Add test writing guidelines

### Documentation Content:

```markdown
## Testing Guidelines

### Selector Priority

1. **Test IDs** (Preferred):
   ```typescript
   page.getByTestId('properties-panel')
   page.getByTestId('canvas-card')
   ```

2. **Role-based** (Semantic):
   ```typescript
   page.getByRole('button', { name: /Controls/i })
   page.getByLabel('Entity name')
   ```

3. **Scoped Queries**:
   ```typescript
   const palette = page.getByTestId('card-palette');
   const button = palette.getByTestId('palette-card-button');
   ```

4. **AVOID** (Fragile):
   ```typescript
   page.locator('text=Button')            // Global, ambiguous
   page.locator('[class*="Properties"]')  // Internal class
   page.locator('.react-grid-item')       // Layout container
   ```

### Timing Best Practices

```typescript
// ❌ NEVER: Arbitrary timeouts
await button.click();
await page.waitForTimeout(1000);

// ✅ ALWAYS: Explicit state assertions
await button.click();
await expect(page.getByTestId('modal')).toBeVisible();
```

### Fixture Usage

```typescript
// ✅ Use fixture pattern for automatic setup
import { test, expect } from '../fixtures/electron-fixtures';

test('my test', async ({ page }) => {
  // page is ready with:
  // - React hydration complete
  // - Diagnostics enabled
  // - Storage isolated
  // - Window maximized
});
```

---

## Next Steps

1. **Review this plan** with team
2. **Prioritize Phase 1** (component test IDs)
3. **Execute Phase 2** (high priority tests)
4. **Monitor pass rates** after each commit
5. **Iterate** based on results

---

## Questions / Clarifications Needed

1. **EntityBrowserModal component location** - Need to verify file path for adding test IDs
2. **Monaco editor instance access** - Confirm if `window.monacoEditorInstance` is already exposed
3. **Test execution environment** - Confirm if tests run in CI/CD (affects timeout values)
4. **Team availability** - Estimated timeline for code review and merging

---

**Document Status**: Ready for Implementation
**Next Action**: Add component test IDs (Phase 1)
**Estimated Completion**: 2 weeks for Phases 1-2
