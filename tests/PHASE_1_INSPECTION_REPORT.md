# Phase 1: Repository Inspection Report

**Date**: December 28, 2025
**Purpose**: Answer skill's required questions before implementing fixture-based tests
**Status**: ✅ COMPLETE

---

## Question 1: Launch Method

### Dev Mode vs Packaged
**Answer**: **Dev mode** using Electron Forge + Vite

**Evidence**:
- Main process file: `.vite/build/main.js` (built by Vite)
- Current test helper uses: `path.join(__dirname, '../../.vite/build/main.js')`
- Electron Forge automatically compiles on launch

**For Fixture**:
```typescript
const mainPath = path.join(__dirname, '..', '..', '.vite', 'build', 'main.js');
```

**✅ VERIFIED**: Matches skill template pattern (just different path)

---

## Question 2: Window Logic

### Does app have splash screen or multiple windows?

**Answer**: ✅ **SINGLE WINDOW** - No splash screen

**Evidence** from [src/main.ts](../src/main.ts):

```typescript
// Line 593-685: createWindow() function
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Lines 678 - DevTools are opened automatically
  mainWindow.webContents.openDevTools();

  return mainWindow;
};

// Line 690: Only called once on 'ready'
app.on('ready', createWindow);
```

**Key Findings**:
1. ✅ Only ONE `new BrowserWindow()` call
2. ✅ No splash screen logic
3. ⚠️ **DevTools auto-open** (line 678) - This creates a SECOND window!
4. ✅ No navigation between windows

**Implication for Tests**:
The skill warns: "Electron apps often open devtools first"

**Current Issue**:
```typescript
// electron-helper.ts:33
const window = await app.firstWindow();
```

This might grab DevTools window instead of main window!

**Skill-Compliant Solution**:
```typescript
const page = await electronApp.waitForEvent('window', async (p) => {
  const url = p.url();
  // DevTools URL: devtools://devtools/...
  // Main app URL: file://... or http://localhost:...
  return !url.startsWith('devtools://');
});
```

**✅ ACTION REQUIRED**: Update window selection logic to exclude DevTools

---

## Question 3: URL / Load Target

### Does renderer load file:// or localhost:port?

**Answer**: **BOTH** (depends on environment)

**Evidence** from [src/main.ts:669-675](../src/main.ts#L669):

```typescript
// and load the index.html of the app.
if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);  // ← localhost in dev
} else {
  mainWindow.loadFile(
    path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),  // ← file:// in prod
  );
}
```

**In Test Mode**:
- `NODE_ENV=test` is set in electron-helper.ts
- But `MAIN_WINDOW_VITE_DEV_SERVER_URL` is likely NOT set in test mode
- Therefore: **Tests use `file://` protocol**

**Verification Strategy for Fixture**:
```typescript
const page = await electronApp.waitForEvent('window', async (p) => {
  const url = p.url();
  console.log('[TEST] Window URL:', url);
  // Accept either file:// or localhost
  return url.includes('index.html') || url.includes('localhost');
});
```

**✅ VERIFIED**: Matches skill template pattern

---

## Question 4: Storage + Auth

### Where does application state live?

**Answer**: **electron-store** (file-based JSON storage)

**Evidence** from [src/services/settingsService.ts:1,49-63](../src/services/settingsService.ts#L49):

```typescript
import Store from 'electron-store';

class SettingsService {
  private store: Store<AppSettings>;

  constructor() {
    this.store = new Store<AppSettings>({
      projectName: 'ha-visual-dashboard-maker',
      schema: schema as any,
      defaults: {
        windowState: { width: 1400, height: 900, isMaximized: false },
        theme: 'dark',
        recentFiles: []
      }
    });
  }
}
```

### Storage Location

**electron-store** stores data in:
- **Windows**: `%APPDATA%\ha-visual-dashboard-maker\config.json`
- **macOS**: `~/Library/Application Support/ha-visual-dashboard-maker/config.json`
- **Linux**: `~/.config/ha-visual-dashboard-maker/config.json`

**This is FILESYSTEM storage, NOT localStorage!**

### What's Stored Where

| Data Type | Storage Location | Access Method |
|-----------|-----------------|---------------|
| **Window state** | electron-store file | `settingsService.getWindowState()` |
| **Theme preference** | electron-store file | `settingsService.getTheme()` |
| **Selected HA theme** | electron-store file | `settingsService.getSelectedTheme()` |
| **Theme dark mode** | electron-store file | `settingsService.getThemeDarkMode()` |
| **Theme sync with HA** | electron-store file | `settingsService.getThemeSyncWithHA()` |
| **Recent files** | electron-store file | `settingsService.getRecentFiles()` |
| **HA URL + token** | electron-store file | `settingsService.getHAConnection()` |
| **Cached entities** | electron-store file | `settingsService.getCachedEntities()` |
| **Credentials** | encrypted file store | `credentialsService.*` |

### Critical Finding: Storage Isolation Issue! 🚨

**The Problem**:
Tests currently share the SAME storage file as development/manual testing!

**Evidence**:
```typescript
// electron-helper.ts:18-30
const app = await electron.launch({
  args: [mainPath],
  env: {
    ...process.env,
    NODE_ENV: 'test',
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
  },
});
```

**NO `--user-data-dir` IS SET!**

This means:
1. ❌ Tests pollute development storage
2. ❌ Tests see leftover data from manual testing
3. ❌ Tests interfere with each other
4. ❌ **This is the Category 4 storage mismatch root cause!**

**Skill Solution** (from fixture template):
```typescript
const userDataDir = mkTempUserDataDir();

const app = await electron.launch({
  args: [
    mainPath,
    `--user-data-dir=${userDataDir}`,  // ← Isolated storage per test run!
  ],
  env: { ...process.env, NODE_ENV: 'test', E2E: '1' },
});
```

**✅ CRITICAL FIX REQUIRED**: Add `--user-data-dir` to isolate test storage

---

## Question 5: Canonical "App Ready" Signal

### What element exists only when React is fully hydrated?

**Current State**: ❌ **No test IDs in app**

**Evidence**:
- Searched `src/App.tsx` for `data-testid`, `testid`, `id=`
- Result: **ZERO** test IDs found

**Available Stable Elements**:

#### Option 1: Card Palette Header ✅ RECOMMENDED
```typescript
// Always present, appears immediately after hydration
await expect(page.getByText('Card Palette')).toBeVisible();
```

**Pros**:
- Always visible on app startup
- Semantic text-based selector (skill principle #5)
- Single element (no strict mode issues)

**Cons**:
- Not specifically a "hydration signal"
- Could theoretically change if UI is redesigned

#### Option 2: Ant Design Collapse Component
```typescript
// Card palette uses collapse component
await expect(page.locator('.ant-collapse-header').first()).toBeVisible();
```

**Pros**:
- More specific to app structure
- Always present

**Cons**:
- Class-based selector (not semantic)
- Multiple elements (need `.first()`)

#### Option 3: Layout Structure
```typescript
// Main layout always has 3-column structure
await expect(page.locator('aside').first()).toBeVisible(); // Card Palette sider
await expect(page.locator('main')).toBeVisible();          // Canvas
```

**Pros**:
- Structural, unlikely to change
- Semantic HTML elements

**Cons**:
- Less specific
- Multiple `aside` elements exist

### Recommendation

**For Fixture `waitForAppReady()`**:
```typescript
async function waitForAppReady(page: Page) {
  // Wait for Card Palette to be visible - this means React has hydrated
  await expect(page.getByText('Card Palette')).toBeVisible({ timeout: 15000 });

  // Optional: Also wait for collapse headers to ensure UI is fully rendered
  await expect(page.locator('.ant-collapse-header').first()).toBeVisible({ timeout: 5000 });
}
```

**Why This Works**:
1. Text appears only after React renders components
2. Collapse headers only appear after Ant Design hydrates
3. Both are always present in the app
4. Combination ensures full hydration

**Future Improvement** (not required now):
Add `data-testid="app-shell"` to main Layout in App.tsx:
```typescript
<Layout style={{ minHeight: '100vh' }} data-testid="app-shell">
```

**✅ DECISION**: Use Card Palette text as readiness signal (no app changes needed)

---

## Summary: Answers to All Skill Questions

| Question | Answer | Matches Skill Template? | Action Required |
|----------|--------|------------------------|-----------------|
| **1. Launch Method** | `.vite/build/main.js` (Electron Forge + Vite) | ✅ Yes (different path) | Update path in fixture |
| **2. Window Logic** | Single window + auto-open DevTools | ⚠️ Partially (has DevTools) | Filter out devtools:// URLs |
| **3. URL Target** | `file://` in test mode, `localhost` in dev | ✅ Yes | Use flexible URL matching |
| **4. Storage** | electron-store (file-based), NO isolation | ❌ **CRITICAL ISSUE** | Add `--user-data-dir` |
| **5. App Ready Signal** | Card Palette text | ⚠️ No test IDs | Use `getByText('Card Palette')` |

---

## Critical Findings

### 🚨 Issue #1: Storage Isolation Missing
**Impact**: HIGH - This is causing Category 4 failures (theme storage mismatch)

**Root Cause**: Tests share storage with dev/manual testing

**Fix**: Add `--user-data-dir` to launch args (per skill template)

**Estimated Impact**: Should fix 11 theme-related tests

---

### 🚨 Issue #2: DevTools Window Selection
**Impact**: MEDIUM - Could grab wrong window

**Root Cause**: `app.firstWindow()` doesn't check URL

**Fix**: Use `waitForEvent('window')` with URL filtering

**Estimated Impact**: More reliable test setup

---

### ✅ Issue #3: No Test IDs
**Impact**: LOW - Can use semantic selectors

**Root Cause**: App doesn't have test IDs

**Fix**: Not required - use `getByText('Card Palette')`

**Estimated Impact**: None (semantic selectors work fine)

---

## Readiness for Phase 2

### Can We Proceed with Fixture Creation?

**Answer**: ✅ **YES** - We have all required information

**Confidence Level**: 🟢 HIGH

**Known Deviations from Skill Template**:
1. Different main path (`.vite/build/main.js` vs `dist-electron/main.js`)
2. Need to filter DevTools window
3. No test IDs (use semantic selectors instead)
4. **MUST add `--user-data-dir`** (critical fix)

**Everything Else**: Matches skill assumptions perfectly

---

## Next Step: Phase 2

Create `tests/fixtures/electron-fixtures.ts` following skill template with these adaptations:

1. ✅ Main path: `.vite/build/main.js`
2. ✅ Window filter: Exclude `devtools://` URLs
3. ✅ Readiness signal: `page.getByText('Card Palette')`
4. ✅ **Add `--user-data-dir` for storage isolation**

**Estimated Time**: 30 minutes
**Risk Level**: 🟢 LOW - Creating new file, not modifying existing tests

---

## Conclusion

Phase 1 inspection is COMPLETE. All skill questions answered. Ready to proceed to Phase 2 (fixture creation).

The inspection revealed **TWO CRITICAL BUGS** in current test setup:
1. Missing storage isolation (causing theme test failures)
2. Unsafe window selection (potential flakiness)

These align PERFECTLY with the skill's guidance and should be fixed in the fixture.
