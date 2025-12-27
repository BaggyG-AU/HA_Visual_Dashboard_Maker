# Ant Design Deprecation Fixes

**Date**: December 27, 2024
**Ant Design Version**: 6.1.0

## Summary

Fixed deprecation warnings from Ant Design 6.x components to use the new API naming conventions.

## Fixes Applied

### 1. Space Component - `direction` → `orientation`

**Deprecation**: The `direction` prop is deprecated in Ant Design 6.0 and replaced by `orientation`.

**Files Fixed**:
- [src/components/EntityBrowser.tsx:220](src/components/EntityBrowser.tsx#L220)
- [src/components/EntitySelect.tsx:158](src/components/EntitySelect.tsx#L158)
- [src/components/cards/ThermostatCardRenderer.tsx:158](src/components/cards/ThermostatCardRenderer.tsx#L158)
- [src/components/cards/UnsupportedCard.tsx:57](src/components/cards/UnsupportedCard.tsx#L57)

**Change**:
```tsx
// Before
<Space direction="vertical" style={{ width: '100%' }} size="middle">

// After
<Space orientation="vertical" style={{ width: '100%' }} size="middle">
```

### 2. Select Component - `popupClassName` → `classNames.popup.root`

**Deprecation**: The `popupClassName` prop is deprecated in favor of the new `classNames` API structure.

**Files Fixed**:
- [src/components/EntityMultiSelect.tsx:294-298](src/components/EntityMultiSelect.tsx#L294)

**Change**:
```tsx
// Before
<Select
  popupClassName="entity-select-dropdown"
  // ...
/>

// After
<Select
  classNames={{
    popup: {
      root: 'entity-select-dropdown',
    },
  }}
  // ...
/>
```

### 3. Select Component - `dropdownStyle` → `styles.popup.root`

**Deprecation**: The `dropdownStyle` prop is deprecated in favor of the new `styles` API structure.

**Files Fixed**:
- [src/components/EntityMultiSelect.tsx:299-305](src/components/EntityMultiSelect.tsx#L299)

**Change**:
```tsx
// Before
<Select
  dropdownStyle={{
    backgroundColor: '#1f1f1f',
  }}
  // ...
/>

// After
<Select
  styles={{
    popup: {
      root: {
        backgroundColor: '#1f1f1f',
      },
    },
  }}
  // ...
/>
```

---

## Known Remaining Warnings

### Static `message` Function Warning

**Warning**: `[antd: message] Static function can not consume context like dynamic theme. Please use 'App' component instead.`

**Affected Files** (6 files):
- src/components/EntityBrowser.tsx
- src/App.tsx
- src/components/YamlEditorDialog.tsx
- src/components/PropertiesPanel.tsx
- src/services/haWebSocketService.ts
- src/components/HADashboardIframe.tsx

**Explanation**: The static `message.success()`, `message.error()`, etc. functions cannot access React context for dynamic theming.

**Recommended Fix** (Future):
Wrap the entire app with Ant Design's `App` component to provide message context:

```tsx
import { App as AntApp } from 'antd';

function App() {
  const { message } = AntApp.useApp();

  // Use message.success() instead of static message.success()
}

// In root:
<AntApp>
  <App />
</AntApp>
```

**Reason Not Fixed Now**: This requires significant refactoring to:
1. Wrap the app with `<App>` component
2. Update all components to use `useApp()` hook instead of static calls
3. Pass message instance down via props or context

**Impact**: Low - static functions still work, just can't consume dynamic theme context. Since we're using a static dark theme, this doesn't affect functionality.

---

## Electron CSP Warning

**Warning**: `Electron Security Warning (Insecure Content-Security-Policy)`

**Status**: ✅ **FIXED** - Proper CSP implemented for production builds

**Implementation**: See [CSP_IMPLEMENTATION.md](CSP_IMPLEMENTATION.md) for details

**Behavior**:
- **Development** (`npm start`): CSP disabled (Vite needs `unsafe-eval` for HMR)
- **Production** (`npm run make`): Strict CSP enforced via `webRequest.onHeadersReceived`

---

## Benefits

- ✅ Eliminated 4 deprecation warnings for Space component
- ✅ Eliminated 2 deprecation warnings for Select component
- ✅ Future-proofed code for Ant Design 7.0 (deprecated APIs will be removed)
- ✅ Improved code maintainability

---

## References

- [Ant Design 6.0 Migration Guide](https://ant-design.antgroup.com/docs/react/migration-v6)
- [Space Component Documentation](https://ant.design/components/space/)
- [Select Component Documentation](https://ant.design/components/select/)

---

**Generated**: December 27, 2024
