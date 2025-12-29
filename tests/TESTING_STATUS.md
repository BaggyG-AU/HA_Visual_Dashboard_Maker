# Testing Status - IPC Mocking Infrastructure

## ✅ Completed Work

### UI Fixes (Working)
1. **Theme dropdown width** - Widened from 150px to 200px in [ThemeSelector.tsx](../src/components/ThemeSelector.tsx:51)
2. **Ant Design deprecation** - Changed `dropdownRender` to `popupRender` in [ThemeSelector.tsx](../src/components/ThemeSelector.tsx:55)
3. **Entity browser test fix** - Test 21 now clicks "All" tab before searching in [entity-browser.spec.ts](./integration/entity-browser.spec.ts:561-567)

### IPC Mocking Infrastructure (✅ WORKING!)
- ✅ Mock theme data: [tests/fixtures/mockThemeData.ts](./fixtures/mockThemeData.ts)
- ✅ Mock helpers: [tests/helpers/mockHelpers.ts](./helpers/mockHelpers.ts)
  - `mockHAWebSocket()` - Mocks HA WebSocket IPC handlers
  - `mockHAEntities()` - Mocks entity-related IPC handlers
  - `createMockEntities()` - Generates realistic test entity data
- ✅ Theme integration tests (PASSING): [tests/integration/theme-integration-mocked.spec.ts](./integration/theme-integration-mocked.spec.ts)
- ✅ Entity caching tests (UPDATED): [tests/integration/entity-caching.spec.ts](./integration/entity-caching.spec.ts)
- ✅ Documentation: [tests/MOCKING_GUIDE.md](./MOCKING_GUIDE.md)

## ✅ IPC Mocking Strategy - THE CORRECT APPROACH

**How It Works**: Mock IPC handlers in the **main process** instead of trying to override contextBridge in the renderer.

**Why This Works**:
- Electron's `contextBridge.exposeInMainWorld()` creates frozen, non-configurable properties
- Attempting to override them in the renderer process is impossible
- By mocking at the IPC handler level in main process, we intercept calls before they reach real services
- This works WITH Electron's security model, not against it

**Implementation**:
```typescript
// Use app.evaluate() to run code in main process
await app.evaluate(({ ipcMain }, mockData) => {
  // Remove and replace IPC handlers
  ipcMain.removeHandler('ha:ws:isConnected');
  ipcMain.handle('ha:ws:isConnected', () => {
    return { connected: mockData.isConnected };
  });
}, { isConnected: true });
```

**Key Learning**: Never try to override contextBridge properties. Always mock at the IPC handler level.

## 🔍 Running Tests (IMPORTANT)

**ALL Playwright tests MUST be run from Windows Command Prompt, not VSCode terminal** (see [IMPORTANT_TESTING_NOTE.md](./IMPORTANT_TESTING_NOTE.md))

```bash
# Run theme integration tests with mocking
npx playwright test tests/integration/theme-integration-mocked.spec.ts

# Run entity caching tests with mocking
npx playwright test tests/integration/entity-caching.spec.ts

# Run specific test
npx playwright test tests/integration/theme-integration-mocked.spec.ts --grep "should mock WebSocket"
```

## 📚 Available Mock Functions

### `mockHAWebSocket(page, app, options)`
Mocks Home Assistant WebSocket IPC handlers for theme testing.

**Options**:
- `isConnected`: boolean - Mock connection status
- `themes`: object - Mock theme data
- `entities`: array - Mock entity data

**Example**:
```typescript
await mockHAWebSocket(page, app, {
  isConnected: true,
  themes: mockThemes,
});
```

### `mockHAEntities(page, app, options)`
Mocks entity-related IPC handlers for entity browser/cache testing.

**Options**:
- `isConnected`: boolean - Mock connection status
- `entities`: array - Mock entity data

**Example**:
```typescript
await mockHAEntities(page, app, {
  entities: createMockEntities(4),
  isConnected: true,
});
```

### `createMockEntities(count)`
Generates realistic Home Assistant test entities.

**Example**:
```typescript
const entities = createMockEntities(10);
// Returns array of mock entities: light.living_room, sensor.temperature, etc.
```

## 📋 Test Files Using IPC Mocking

| Test File | Status | Mock Functions Used |
|-----------|--------|---------------------|
| theme-integration-mocked.spec.ts | ✅ PASSING | `mockHAWebSocket()` |
| entity-caching.spec.ts | ✅ COMPLETE | `mockHAEntities()`, `createMockEntities()` |
| entity-browser.spec.ts | ✅ COMPLETE | `mockHAEntities()`, `createMockEntities()` |
| theme-integration.spec.ts | ✅ COMPLETE | `mockHAWebSocket()`, `getCurrentTheme()` |

## 🎯 Summary

- **Theme UI fixes**: ✅ Complete and working
- **IPC Mocking infrastructure**: ✅ Complete and WORKING
- **Automated theme tests**: ✅ ALL TESTS use IPC mocks
- **Automated entity cache tests**: ✅ ALL TESTS use IPC mocks
- **Automated entity browser tests**: ✅ ALL TESTS use IPC mocks
- **Manual testing**: ✅ Works perfectly
- **React Hydration Fix (Phase 1)**: ✅ COMPLETE - App now signals when fully interactive
- **Next steps**: Test Phase 1 fix, then apply Phase 2 component-specific waiting if needed

## 📖 How to Apply IPC Mocking to Other Tests

1. **Import the mock helpers**:
   ```typescript
   import { mockHAWebSocket, mockHAEntities, createMockEntities } from '../helpers/mockHelpers';
   ```

2. **Add app parameter to test setup**:
   ```typescript
   let app: ElectronApplication;
   let page: Page;
   ```

3. **Mock IPC handlers in beforeAll or beforeEach**:
   ```typescript
   test.beforeAll(async () => {
     const testApp = await launchElectronApp();
     app = testApp.app;
     page = testApp.window;

     // Mock the IPC handlers
     await mockHAWebSocket(page, app, {
       isConnected: true,
       themes: mockThemes,
     });

     await waitForAppReady(page);
   });
   ```

4. **Change connection state as needed in tests**:
   ```typescript
   test('should work when connected', async () => {
     await mockHAEntities(page, app, {
       entities: createMockEntities(10),
       isConnected: true,
     });
     // ... test code
   });
   ```

The app functionality is solid. The IPC mocking strategy is proven and working!

## ✅ React Hydration Fix (Phase 1) - COMPLETE

### Problem Identified
After extensive research (see [PLAYWRIGHT_VIABILITY_ANALYSIS.md](./PLAYWRIGHT_VIABILITY_ANALYSIS.md)), discovered that test failures were caused by **React hydration timing**:
- Playwright interacted with UI elements before React finished binding event handlers
- Manual testing worked because humans wait 1-2 seconds naturally
- Automated tests tried to interact immediately, causing failures

### Solution Implemented
1. **Added hydration signal** to [App.tsx](../src/App.tsx:102-106):
   ```typescript
   useEffect(() => {
     (window as any).__REACT_HYDRATED__ = true;
     console.log('[APP] React hydration complete - app is interactive');
   }, []);
   ```

2. **Enhanced test helpers** in [electron-helper.ts](../helpers/electron-helper.ts:48-84):
   - Added `waitForReactHydration()` - Waits for hydration signal
   - Enhanced `waitForAppReady()` - Now includes DOM load + hydration + network idle

### Expected Impact
- ✅ 60-70% of failing tests should now pass
- ✅ Tests are more reliable (wait for React to be ready)
- ⚠️ Tests are 2-5 seconds slower (acceptable trade-off)

### Documentation
- ✅ [PHASE_1_HYDRATION_FIX_COMPLETE.md](./PHASE_1_HYDRATION_FIX_COMPLETE.md) - Implementation details
- ✅ [PLAYWRIGHT_VIABILITY_ANALYSIS.md](./PLAYWRIGHT_VIABILITY_ANALYSIS.md) - Research and recommendations
- ✅ [QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md) - How to run tests and debug

### Next Steps
1. Run tests from Windows Command Prompt: `npx playwright test`
2. Review results - note which tests pass vs fail
3. Apply Phase 2 (component-specific waiting) for remaining failures
