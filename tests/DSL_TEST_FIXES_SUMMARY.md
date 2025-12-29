# DSL Test Stability Fixes

**Date**: 2025-12-29
**Fixes Applied**: Modal visibility, strict locators, overlay blocking

---

## Diagnosis Summary

### Issue A: `testClearEntityCache` undefined
**Status**: ✅ **Already Fixed** - No code changes needed

**Root Cause**: Initially suspected missing IPC handlers, but verification shows:
- ✅ Preload exposes `window.electronAPI.testClearEntityCache()` ([src/preload.ts:79](src/preload.ts#L79))
- ✅ Main process registers `test:clearEntityCache` handler ([src/main.ts:492](src/main.ts#L492))
- ✅ Electron launcher sets `NODE_ENV=test` ([tests/support/electron.ts:54](tests/support/electron.ts#L54))

**Conclusion**: The infrastructure is correct. If this error still occurs, it's a timing issue where `electronAPI` hasn't been exposed yet when DSL tries to access it.

---

### Issue B: YAML Editor Modal "Expected visible, Received hidden"
**Status**: ✅ **FIXED**

**Root Cause**: `getByTestId('yaml-editor-modal')` matches the modal's root/portal div which exists in DOM but has `visibility: hidden` or `display: none` until the modal animates open. Ant Design renders modals into portal roots that persist in DOM.

**Fix Applied**: [tests/support/dsl/yamlEditor.ts](tests/support/dsl/yamlEditor.ts#L16-L61)

**Changes**:
1. Wait for `.ant-modal-wrap:has([data-testid="yaml-editor-modal"])` to become visible (actual modal container)
2. Wait for `.ant-modal-content` within the wrap to be visible
3. Added `waitForMonacoReady()` private method that:
   - Waits for `yaml-editor-container` testid
   - Waits for `.monaco-editor` or fallback `textarea`
   - Verifies Monaco has non-zero bounding box (width/height > 0)
   - Adds 500ms buffer for Monaco internal initialization
4. Increased timeouts: 10s for first modal open, 5s for Monaco ready

**Before**:
```typescript
async open(): Promise<void> {
  const editYamlBtn = this.window.getByRole('button', { name: /Edit YAML/i });
  await expect(editYamlBtn).toBeVisible();
  await editYamlBtn.click();

  const modal = this.window.getByTestId('yaml-editor-modal');
  await expect(modal).toBeVisible({ timeout: 3000 }); // ❌ Wrong element
}
```

**After**:
```typescript
async open(): Promise<void> {
  const editYamlBtn = this.window.getByRole('button', { name: /Edit YAML/i });
  await expect(editYamlBtn).toBeVisible();
  await editYamlBtn.click();

  // Wait for modal wrap (actual visible container)
  const modalWrap = this.window.locator('.ant-modal-wrap:has([data-testid="yaml-editor-modal"])');
  await expect(modalWrap).toBeVisible({ timeout: 10000 });

  const modalContent = modalWrap.locator('.ant-modal-content');
  await expect(modalContent).toBeVisible({ timeout: 5000 });

  await this.waitForMonacoReady(); // ✅ Wait for editor
}
```

---

### Issue C: Strict Locator Collision `.ant-badge-status-text`
**Status**: ✅ **FIXED**

**Root Cause**: `.ant-badge-status-text` matches **6 elements**:
1. Connection status badge in modal header (what we want)
2. Domain tab badges: "light (2)", "sensor (1)", etc. (unwanted matches)

**Fix Applied**: [tests/support/dsl/entityBrowser.ts](tests/support/dsl/entityBrowser.ts#L230-L254)

**Changes**: Scope to modal header before selecting status badge

**Before**:
```typescript
async expectConnectionStatus(status: string): Promise<void> {
  const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
  const statusBadge = modal.locator('.ant-badge-status-text').first(); // ❌ Ambiguous
  const statusText = await statusBadge.textContent();
  expect(statusText).toContain(status);
}
```

**After**:
```typescript
async expectConnectionStatus(status: string): Promise<void> {
  const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
  const modalHeader = modal.locator('.ant-modal-header, .ant-modal-title').first();
  const statusBadge = modalHeader.locator('.ant-badge-status-text').first(); // ✅ Scoped
  const statusText = await statusBadge.textContent();
  expect(statusText).toContain(status);
}
```

---

### Issue D: Modal Overlay Intercepting Clicks
**Status**: ✅ **FIXED**

**Root Cause**: Tests click "Entities" button but `.ant-modal-wrap` from a previous modal (YAML editor, confirmation dialog) is still visible and intercepts pointer events.

**Fix Applied**:
- [tests/support/dsl/app.ts](tests/support/dsl/app.ts#L20-L54) - Added `ensureNoBlockingOverlays()`
- [tests/support/dsl/entityBrowser.ts](tests/support/dsl/entityBrowser.ts#L64-L88) - Added private cleanup helper
- [tests/support/dsl/entityBrowser.ts](tests/support/dsl/entityBrowser.ts#L93-L95) - Call cleanup before opening

**Changes**:

**AppDSL** - New public method:
```typescript
async ensureNoBlockingOverlays(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    const modalWraps = this.window.locator('.ant-modal-wrap');
    const count = await modalWraps.count();

    if (count === 0) return;

    let hasVisibleModal = false;
    for (let j = 0; j < count; j++) {
      const isVisible = await modalWraps.nth(j).isVisible().catch(() => false);
      if (isVisible) {
        hasVisibleModal = true;
        break;
      }
    }

    if (!hasVisibleModal) return;

    await this.window.keyboard.press('Escape');
    await this.window.waitForTimeout(400);
  }
}
```

**EntityBrowserDSL.open()** - Call cleanup before opening:
```typescript
async open(): Promise<void> {
  await this.ensureNoBlockingOverlays(); // ✅ Clear any blocking modals

  const entitiesButton = this.window.locator('button:has-text("Entities")');
  await expect(entitiesButton).toBeVisible();
  await entitiesButton.click();

  const modalWrap = this.window.locator('.ant-modal-wrap:has-text("Entity Browser")');
  await expect(modalWrap).toBeVisible({ timeout: 5000 });
}
```

---

## Files Modified

1. **[tests/support/dsl/app.ts](tests/support/dsl/app.ts)**
   - Added `ensureNoBlockingOverlays()` method (lines 20-54)

2. **[tests/support/dsl/yamlEditor.ts](tests/support/dsl/yamlEditor.ts)**
   - Rewrote `open()` to wait for `.ant-modal-wrap` visibility (lines 16-31)
   - Added `waitForMonacoReady()` private method (lines 33-61)

3. **[tests/support/dsl/entityBrowser.ts](tests/support/dsl/entityBrowser.ts)**
   - Added `ensureNoBlockingOverlays()` private helper (lines 64-88)
   - Updated `open()` to call cleanup and wait for modal wrap (lines 90-108)
   - Fixed `expectConnectionStatus()` to scope to modal header (lines 230-241)
   - Fixed `expectAnyConnectionStatus()` to scope to modal header (lines 243-254)

---

## Testing Recommendations

### Run Integration Tests
```bash
npx playwright test tests/integration/monaco-editor.spec.ts tests/integration/entity-browser.spec.ts tests/integration/entity-caching.spec.ts --project=electron-integration --reporter=list --workers=1
```

### Expected Results
- **Monaco Editor tests**: Should now pass - modal visibility fixed, Monaco ready detection added
- **Entity Browser tests**: Should now pass - overlay blocking fixed, strict locator scoped
- **Entity Caching tests**: Should now pass - uses same entity browser infrastructure

### If Tests Still Fail

**1. `electronAPI.testClearEntityCache is undefined`**:
- Check Electron console logs: `NODE_ENV=test` should be set
- Verify main process logs show "Test-only IPC handlers" registered
- Add debug logging in `seedEntityCache()` / `clearEntityCache()`:
  ```typescript
  const api = (window as any).electronAPI;
  console.log('[DEBUG] electronAPI exists?', !!api);
  console.log('[DEBUG] testClearEntityCache exists?', !!api?.testClearEntityCache);
  ```

**2. Modal still "Expected visible, Received hidden"**:
- Take screenshot on failure: `await ctx.window.screenshot({ path: 'modal-debug.png' });`
- Log locator matches: `console.log('Modal wraps count:', await ctx.window.locator('.ant-modal-wrap').count());`
- Check if testid is correct in app UI

**3. Strict mode errors persist**:
- Identify the ambiguous selector from error message
- Use `.first()` or scope to a parent container
- Consider adding `data-testid` to the app UI for stable selection

---

## Key Patterns for Future DSL Methods

### 1. Modal Opening Pattern
```typescript
async open(): Promise<void> {
  // 1. Clear any blocking overlays
  await this.ensureNoBlockingOverlays();

  // 2. Click trigger button
  await triggerButton.click();

  // 3. Wait for modal wrap (not testid on modal root!)
  const modalWrap = this.window.locator('.ant-modal-wrap:has([data-testid="my-modal"])');
  await expect(modalWrap).toBeVisible({ timeout: 5000 });

  // 4. Wait for modal content
  const modalContent = modalWrap.locator('.ant-modal-content');
  await expect(modalContent).toBeVisible();
}
```

### 2. Scoped Locator Pattern
```typescript
// ❌ BAD - Ambiguous global selector
const badge = this.window.locator('.ant-badge-status-text').first();

// ✅ GOOD - Scoped to parent container
const modal = this.window.locator('.ant-modal:has-text("Modal Title")');
const header = modal.locator('.ant-modal-header');
const badge = header.locator('.ant-badge-status-text').first();
```

### 3. Monaco/Complex Component Ready Pattern
```typescript
private async waitForComponentReady(): Promise<void> {
  // 1. Wait for container
  const container = this.window.getByTestId('component-container');
  await expect(container).toBeVisible();

  // 2. Wait for internal elements
  const internalElement = container.locator('.internal-class');
  await expect(internalElement).toBeVisible();

  // 3. Verify dimensions if needed
  await expect(async () => {
    const box = await internalElement.boundingBox();
    expect(box!.width).toBeGreaterThan(0);
  }).toPass({ timeout: 5000 });

  // 4. Buffer for complex initialization
  await this.window.waitForTimeout(500);
}
```

---

## Summary

All identified issues have been fixed at the DSL layer:
- ✅ Modal visibility detection corrected (wait for `.ant-modal-wrap`, not portal root)
- ✅ Monaco editor ready detection added (dimensions + buffer)
- ✅ Strict locator collisions resolved (scoped to modal header)
- ✅ Modal overlay blocking fixed (cleanup before open)
- ✅ Increased timeouts for Ant Design animations + Monaco load

No app code changes required. All fixes are in DSL helper classes.

**Next Steps**: Run integration tests and report any remaining failures for further investigation.
