# Testing Standards - Playwright Helper DSL

Last Updated: 2025-02-18 (update this when standards change)

This document defines mandatory testing standards for the Electron + React + TypeScript application.

All E2E tests **MUST** follow these rules.

---

## CORE PRINCIPLES

### 1. Use the DSL for ALL Tests

**NEVER** write raw Playwright selectors in spec files.

**BAD** ❌:
```typescript
const palette = window.locator('[data-testid="card-palette"]');
await palette.click();
await window.waitForTimeout(500);
```

**GOOD** ✅:
```typescript
await ctx.palette.waitUntilVisible();
```

### 2. Import from `../support`

**ALWAYS** use the DSL launcher:

```typescript
import { launchWithDSL, close } from '../support';

test('my test', async () => {
  const ctx = await launchWithDSL();
  try {
    // Test logic using ctx.app, ctx.dashboard, ctx.palette, etc.
  } finally {
    await close(ctx);
  }
});
```

### 3. Zero Direct Playwright API Calls

Spec files **MUST NOT** call:
- `.locator()`
- `.click()`
- `.dblclick()`
- `.fill()`
- `.waitForTimeout()` (except where absolutely necessary)
- `.getByRole()` / `.getByText()` / `.getByTestId()` (use DSL methods)

**BAD** ❌:
```typescript
const button = window.getByTestId('palette-card-button');
await button.dblclick();
```

**GOOD** ✅:
```typescript
await ctx.palette.addCard('button');
```

### 4. Tests Read Like User Workflows

Spec files should read like plain English workflows:

```typescript
test('should allow editing card properties', async () => {
  const ctx = await launchWithDSL();

  try {
    await ctx.app.waitUntilReady();
    await ctx.dashboard.createNew();

    await ctx.palette.expandCategory('Controls');
    await ctx.palette.addCard('button');

    await ctx.canvas.selectCard(0);
    await ctx.properties.setCardName('My Button');

    const name = await ctx.properties.getCardName();
    expect(name).toBe('My Button');
  } finally {
    await close(ctx);
  }
});
```

---

## MANDATORY RULES

### Rule 1: NEVER Use Raw Selectors in Specs

All selectors belong in DSL classes (`/tests/support/dsl/*.ts`).

**Violation**: Using `.locator()`, `.getByTestId()`, `.getByRole()` in a spec file.

**Fix**: Add a method to the appropriate DSL class.

**Window selection reminder**: Always use `launchWithDSL()` and its returned main window/page before any interactions; avoid DevTools or secondary windows.

---

### Rule 2: NEVER Use `waitForTimeout()` Unless No Alternative

Prefer explicit state checks:

**BAD** ❌:
```typescript
await window.waitForTimeout(1000); // Wait for card to appear
```

**GOOD** ✅:
```typescript
await ctx.canvas.expectCardCount(1); // Waits until card appears
```

**Exception**: Animation waits (e.g., 300ms for Ant Design collapse) are acceptable but should be encapsulated in DSL methods.

---

### Rule 3: NEVER Interact with `.react-grid-item`

react-grid-layout intercepts pointer events. Always click card content:

**BAD** ❌:
```typescript
await window.locator('.react-grid-item').first().click();
```

**GOOD** ✅:
```typescript
await ctx.canvas.selectCard(0); // Clicks data-testid="canvas-card"
```

---

### Rule 4: NEVER Use Text Selectors for Interaction

Text can change. Use `data-testid` attributes.

**BAD** ❌:
```typescript
await window.getByText('Add Card').click();
```

**GOOD** ✅:
```typescript
await ctx.palette.addCard('button');
```

**Exception**: Category names and role-based selectors are acceptable **within DSL classes** because they represent semantic UI structure.

---

### Rule 5: ALWAYS Use Isolated Storage

Every test gets a fresh `userDataDir` to prevent state leakage.

This is handled automatically by `launchWithDSL()`. **NEVER** call the old `launchElectronApp()`.

---

### Rule 6: Monaco Editor Detection Must Support Fallback

Monaco can render as `.monaco-editor` or fall back to `textarea`.

**DSL implementation** handles this:

```typescript
await expect(
  editorContainer.locator('.monaco-editor')
    .or(editorContainer.locator('textarea'))
    .first()
).toBeVisible({ timeout });
```

---

### Rule 7: Properties Panel is Conditionally Rendered

When no card is selected, the properties panel **does not exist** (it's not hidden).

**GOOD** ✅:
```typescript
await ctx.properties.expectHidden(); // Checks count === 0
```

**BAD** ❌:
```typescript
await expect(propertiesPanel).not.toBeVisible(); // Fails if element doesn't exist
```

---

## DSL STRUCTURE

### Available DSL Classes

Import from `../support`:

```typescript
import { launchWithDSL, close, yamlAssertions, propertiesAssertions } from '../support';

const ctx = await launchWithDSL();
// ctx.app          - AppDSL
// ctx.dashboard    - DashboardDSL
// ctx.palette      - CardPaletteDSL
// ctx.canvas       - CanvasDSL
// ctx.properties   - PropertiesPanelDSL
```

### AppDSL Methods

```typescript
await ctx.app.waitUntilReady();
await ctx.app.expectTitle('HA Visual Dashboard Maker');
await ctx.app.screenshot('my-screenshot');
const title = await ctx.app.getTitle();
```

### DashboardDSL Methods

```typescript
await ctx.dashboard.createNew();
await ctx.dashboard.expectEmpty();
await ctx.dashboard.expectCardCount(2);
const isActive = await ctx.dashboard.isActive();
```

### CardPaletteDSL Methods

```typescript
await ctx.palette.waitUntilVisible();
await ctx.palette.search('entities');
await ctx.palette.clearSearch();
await ctx.palette.expandCategory('Controls');
await ctx.palette.collapseCategory('Layout');
await ctx.palette.addCard('button'); // Double-clicks palette card
await ctx.palette.expectCardVisible('entities');
await ctx.palette.expectHasCategories();
const isExpanded = await ctx.palette.isCategoryExpanded('Controls');
```

### CanvasDSL Methods

```typescript
await ctx.canvas.selectCard(0); // Clicks canvas-card, waits for properties panel
await ctx.canvas.deselectCard();
await ctx.canvas.expectCardCount(2);
await ctx.canvas.expectEmpty();
await ctx.canvas.expectCardSelected();
await ctx.canvas.expectNoSelection();
const isEmpty = await ctx.canvas.isEmpty();
```

### PropertiesPanelDSL Methods

```typescript
await ctx.properties.expectVisible();
await ctx.properties.expectHidden(); // Panel not rendered
await ctx.properties.switchTab('YAML');
await ctx.properties.expectActiveTab('Form');
await ctx.properties.expectYamlEditor();
await ctx.properties.setCardName('My Card');
const name = await ctx.properties.getCardName();
await ctx.properties.expectCardType('button');
await ctx.properties.expectFormFields();
const isVisible = await ctx.properties.isVisible();
```

### Assertion Helpers

```typescript
import { yamlAssertions, propertiesAssertions } from '../support';

await yamlAssertions.expectYamlEditorModalVisible(ctx.window);
await yamlAssertions.expectMonacoEditor(ctx.window);
await yamlAssertions.expectYamlValidationSuccess(ctx.window);
await yamlAssertions.clickYamlApplyButton(ctx.window);

await propertiesAssertions.expectPropertiesPanelVisible(ctx.window);
await propertiesAssertions.expectCardType(ctx.window, 'button');
await propertiesAssertions.expectFormFields(ctx.window);
```

---

## ADDING NEW DSL METHODS

When you need a new interaction:

1. **Identify the correct DSL class** (app, dashboard, palette, canvas, properties)
2. **Add the method to `/tests/support/dsl/<class>.ts`**
3. **Use ONLY data-testid selectors** (or role-based for semantic structure)
4. **Return promises** for async operations
5. **Include explicit state waits** instead of arbitrary timeouts

**Example**:

```typescript
// /tests/support/dsl/canvas.ts

/**
 * Delete the selected card
 */
async deleteSelectedCard(): Promise<void> {
  // Press Delete key
  await this.window.keyboard.press('Delete');

  // Wait for properties panel to disappear (card deselected)
  await expect(this.window.getByTestId('properties-panel')).toHaveCount(0, { timeout: 2000 });
}
```

Then use it in your spec:

```typescript
await ctx.canvas.selectCard(0);
await ctx.canvas.deleteSelectedCard();
await ctx.canvas.expectEmpty();
```

---

## COMMON VIOLATIONS & FIXES

### Violation: Using `.locator()` in Spec

**BAD** ❌:
```typescript
const palette = window.locator('[data-testid="card-palette"]');
const cards = palette.locator('[data-testid^="palette-card"]');
```

**GOOD** ✅:
```typescript
await ctx.palette.expectCardVisible('button');
```

---

### Violation: Arbitrary Timeouts

**BAD** ❌:
```typescript
await window.waitForTimeout(2000); // Hope card appears
```

**GOOD** ✅:
```typescript
await ctx.canvas.expectCardCount(1); // Waits until state is true
```

---

### Violation: Clicking Layout Containers

**BAD** ❌:
```typescript
await window.locator('.react-grid-item').first().click();
```

**GOOD** ✅:
```typescript
await ctx.canvas.selectCard(0);
```

---

### Violation: Text-Based Selectors

**BAD** ❌:
```typescript
await window.getByText('New Dashboard').click();
```

**GOOD** ✅:
```typescript
await ctx.dashboard.createNew(); // Uses role-based selector internally
```

---

## SUCCESS CRITERIA

Your test passes the standard if:

1. ✅ No raw Playwright selectors in the spec file
2. ✅ No `.click()`, `.fill()`, `.locator()` calls in the spec
3. ✅ Test reads like a user workflow
4. ✅ All waits are explicit state checks
5. ✅ Uses `launchWithDSL()` and `close()`
6. ✅ No direct reference to CSS classes or DOM structure

**Example of a perfect test**:

```typescript
test('should allow adding and editing cards', async () => {
  const ctx = await launchWithDSL();

  try {
    await ctx.app.waitUntilReady();
    await ctx.dashboard.createNew();

    await ctx.palette.expandCategory('Controls');
    await ctx.palette.addCard('button');

    await ctx.canvas.expectCardCount(1);
    await ctx.canvas.selectCard(0);

    await ctx.properties.setCardName('Power Button');
    await ctx.properties.switchTab('YAML');
    await ctx.properties.expectYamlEditor();

    await ctx.app.screenshot('final-state');
  } finally {
    await close(ctx);
  }
});
```

---

## MIGRATION CHECKLIST

When migrating an old test:

- [ ] Replace `launchElectronApp()` with `launchWithDSL()`
- [ ] Replace `closeElectronApp(app, userDataDir)` with `close(ctx)`
- [ ] Remove all `.locator()` / `.getByTestId()` calls
- [ ] Replace with DSL methods (e.g., `ctx.palette.addCard()`)
- [ ] Remove `window.waitForTimeout()` with explicit waits
- [ ] Remove direct `.click()` / `.dblclick()` calls
- [ ] Verify test reads like a user workflow
- [ ] Run test to ensure it passes

---

## ENFORCEMENT

Pull requests that violate these standards **MUST** be rejected.

Use this checklist during code review:

1. Does the spec file import from `../support`?
2. Does it use `launchWithDSL()` and `close()`?
3. Are there any raw selectors in the spec?
4. Are there any direct Playwright API calls?
5. Does the test read like a user workflow?

If any answer is "no" or "yes" (for questions 3-4), **reject the PR**.

---

## BENEFITS

This architecture provides:

- **Reusability**: DSL can be extracted into a template repo for future Electron apps
- **Maintainability**: Selector changes only affect DSL classes, not 100+ spec files
- **Readability**: Tests document user workflows, not implementation details
- **Reliability**: Eliminates flaky timing issues with explicit state waits
- **Scalability**: Adding new tests is trivial - just compose DSL methods

---

**Last Updated**: 2025-12-29
