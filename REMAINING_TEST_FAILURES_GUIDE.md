# Remaining Test Failures - Complete Guide

## 🎉 Current Status: 93/118 Passing (79%)

You've made excellent progress! Here's what's left and how to fix it.

---

## 📊 Failure Breakdown

### Category 1: **Can't Find Card Names** (20 tests) ⚠️ **PRIORITY**

**Tests Affected**:
- `file-operations.spec.ts` (3 tests) - Lines 54, 73, 118
- `properties-panel.spec.ts` (15 tests) - Most tests
- `templates.spec.ts` (1 test) - Line 201
- `yaml-editor.spec.ts` (1 test) - Line 43

**Problem**: Tests look for `text=Button Card`, `text=Entities Card`, etc. but can't find them.

**Root Cause**: Your card palette doesn't show cards as clickable text with those exact names.

**Evidence from your test output**:
```
Button card found in palette: false
Entities card found for properties test: false
```

But categories DO exist:
```
Collapse items found: 6
Category matches: { layoutCategory: 1, controlCategory: 1, sensorCategory: 1 }
```

### Category 2: **Search Doesn't Find Results** (1 test)

**Test**: `card-palette.spec.ts:41` - "should search cards by name"

**Problem**:
```
Search input found: true      ✓ Search exists
Button-related items found: 0 ✗ But searching for "button" finds nothing
```

**Root Cause**: Either:
1. Search functionality not implemented yet
2. Cards aren't rendered as text that matches `/button/i`
3. Search filters out all results

### Category 3: **Invalid Selectors** (3 tests) ✅ **JUST FIXED**

**Tests**: Fixed in properties-panel, templates, yaml-editor

**Status**: Should pass on next run!

### Category 4: **File Dialog Issues** (1 test)

**Test**: `file-operations.spec.ts:98` - Ctrl+O keyboard shortcut

**Problem**: Window closes instead of opening file dialog

**Root Cause**: Ctrl+O might not be bound, or file dialog can't be tested this way in Electron

---

## 🔍 Step 1: Discover Your Actual UI

Run this command and **check the screenshot**:

```bash
npx playwright test tests/debug-app.spec.ts --headed
```

### What to Check:

1. **Open this file**: `test-results/screenshots/debug-full-page.png`

2. **Look at the card palette area** and answer:
   - How are cards displayed? (icons, buttons, list items?)
   - What text is visible? ("Button", "Entities", or something else?)
   - Are cards clickable directly, or do you need to expand categories first?

3. **Open this file**: `test-results/debug-page.html`
   - Search for "button" (Ctrl+F)
   - See what HTML structure contains card elements
   - Note the class names and text content

4. **Check console output** for class names found

---

## 🛠️ Step 2: Fix Based on What You Find

### Scenario A: Cards Show Different Text

**Example**: You see "button" instead of "Button Card"

**Fix in React**:
```tsx
// If your CardPalette.tsx shows:
<div>button</div>

// Change to:
<div>Button Card</div>

// OR add data-testid:
<div data-testid="card-button">button</div>
```

**OR Fix in Tests**:
```typescript
// Change from:
const buttonCard = window.locator('text=Button Card');

// To what you actually have:
const buttonCard = window.locator('text=button').or(window.locator('[data-testid="card-button"]'));
```

### Scenario B: Cards Are Inside Collapsed Categories

**Fix**: Expand category before clicking card

```typescript
// Add before clicking card:
const controlCategory = window.locator('.ant-collapse-header:has-text("Control")');
await controlCategory.click(); // Expand category
await window.waitForTimeout(300);

// Then find and click card:
const buttonCard = window.locator('text=Button Card');
await buttonCard.click();
```

### Scenario C: Cards Are Icons/Images, Not Text

**Fix**: Use different selectors

```typescript
// If cards have icons with titles:
const buttonCard = window.locator('[title="Button Card"]');

// Or aria-labels:
const buttonCard = window.locator('[aria-label="Button Card"]');

// Or by class + position:
const buttonCard = window.locator('.card-item').filter({ hasText: /button/i });
```

---

## 📝 Step 3: Recommended Fixes (Based on Common Patterns)

### Option A: Quick Fix - Add data-testid (RECOMMENDED)

In your `CardPalette.tsx` (or wherever cards are rendered):

```tsx
// Before:
{cards.map((card) => (
  <div className="card-item" onClick={() => onCardClick(card)}>
    {card.name}
  </div>
))}

// After:
{cards.map((card) => (
  <div
    className="card-item"
    data-testid={`card-${card.type}`}  // Add this!
    onClick={() => onCardClick(card)}
  >
    {card.name}
  </div>
))}
```

Then update tests:

```typescript
// Change all instances of:
window.locator('text=Button Card')

// To:
window.locator('[data-testid="card-button"]')
```

### Option B: Make Tests Match Your UI

1. **Run debug test** to see actual structure
2. **Update test selectors** to match

For example, if you find cards are in a list:

```typescript
// Original (doesn't work):
const buttonCard = window.locator('text=Button Card');

// Updated (based on your HTML):
const buttonCard = window.locator('.card-palette .ant-list-item:has-text("Button")');
```

### Option C: Skip Tests Until Features Are Ready

Temporarily skip failing tests:

```typescript
// Add .skip to any test:
test.skip('should show properties when card is selected', async () => {
  // This test won't run
});
```

Or skip entire file by renaming:
```bash
# Windows:
ren tests\e2e\properties-panel.spec.ts properties-panel.spec.ts.skip
```

---

## 🎯 Immediate Action Plan

### 1. **Debug (5 minutes)**
```bash
npx playwright test tests/debug-app.spec.ts --headed
```
Review screenshot and HTML output.

### 2. **Fix One Test (15 minutes)**

Pick the simplest test:
```bash
# Edit card-palette.spec.ts:41 (search test)
# Based on debug output, update the selector
```

Test it:
```bash
npx playwright test tests/e2e/card-palette.spec.ts -g "search" --headed
```

### 3. **Apply Pattern to Others (30 minutes)**

Once one test passes, apply same fix to similar tests:
- Update all "Button Card" references
- Update all "Entities Card" references
- etc.

### 4. **Skip Unready Tests (5 minutes)**

For tests where features aren't implemented:
```typescript
// properties-panel.spec.ts - if properties panel doesn't exist yet
test.skip('should be hidden when no card is selected', async () => {
  //...
});
```

---

## 📋 Test-by-Test Quick Reference

### ✅ Should Pass After Selector Fixes (3 tests)

- `properties-panel.spec.ts:401` - Fixed invalid `text*=` selector ✓
- `templates.spec.ts:11` - Fixed invalid `text*=` selector ✓
- `yaml-editor.spec.ts:11` - Fixed invalid `text*=` selector ✓

**Next run**: These should pass!

### ⚠️ Need Card Selector Updates (20 tests)

**All look for**: `text=Button Card`, `text=Entities Card`, `text=Markdown Card`, etc.

**Fix once, apply everywhere**:
1. Find out actual card structure (debug test)
2. Update one test
3. Copy pattern to all 20 tests

**Files to update**:
- `file-operations.spec.ts` - Lines 62, 80, 125
- `properties-panel.spec.ts` - Lines 36, 59, 81, 110, 130, 156, 184, 206, 229, 252, 275, 307, 341, 376
- `templates.spec.ts` - Line 208
- `yaml-editor.spec.ts` - Line 51

### 🔍 Need Investigation (2 tests)

**Card Search** (`card-palette.spec.ts:41`):
- Search input works
- But finds 0 results for "button"
- Check if search is implemented or how cards are filtered

**File Dialog** (`file-operations.spec.ts:98`):
- Ctrl+O closes window instead of opening dialog
- May need to mock file dialogs in Electron tests
- Consider skipping or using IPC to test file operations

---

## 💡 Pro Tips

1. **Start Small**: Fix 1 test, confirm it passes, then scale
2. **Use Screenshots**: Every test takes screenshots on failure - check them!
3. **Console Logs**: Tests log what they find - read the output
4. **Be Patient**: 93/118 (79%) passing is excellent for a complex app!

---

## 🚀 Expected After Next Run

After fixing the 3 invalid selectors:

**Before**: 93 passing, 25 failing
**After**: 96 passing, 22 failing

Then after adding card selectors or data-testid attributes:

**Goal**: 100+ passing, <15 failing (85%+)

---

## ❓ Questions to Answer

Before proceeding, figure out:

1. **How are cards rendered in your card palette?**
   - As list items?
   - As buttons?
   - As clickable divs?
   - With what text?

2. **Do you want to add data-testid attributes or update test selectors?**
   - data-testid = more stable tests (recommended)
   - Update selectors = quicker but more brittle

3. **Which features aren't implemented yet?**
   - Properties panel?
   - File operations?
   - YAML editor?
   - Templates?

**Mark those tests as `.skip` for now!**

---

## 📞 Next Steps

1. Run debug test
2. Review this guide
3. Choose your approach (data-testid vs selector updates)
4. Fix one test as proof-of-concept
5. Apply pattern to others
6. Skip tests for unimplemented features

You're doing great! 🎉
