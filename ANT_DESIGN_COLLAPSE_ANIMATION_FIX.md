# Ant Design Collapse Animation Fix for Playwright Tests

## Problem

Tests 17-21 in the Entity Browser integration suite were failing with:
```
TimeoutError: page.waitForSelector: Timeout 3000ms exceeded.
Call log:
  - waiting for locator('.react-grid-item .ant-card') to be visible
```

The error context showed: **"No cards in this view. Drag cards from the palette to add them."**

This revealed that the `dblclick()` on "Mini Graph" card was **not executing at all** - the card was never added to the canvas.

## Root Cause - Ant Design Collapse CSS Animations

After comprehensive research and online investigation, I discovered the actual issue:

**Ant Design Collapse components use CSS transitions/animations when expanding panels**. When you click to expand a panel, Ant Design applies transition classes that animate the panel opening.

### The Problem with Playwright

According to [GitHub Issue #16048](https://github.com/microsoft/playwright/issues/16048) and community discussions:

1. **Playwright tries to ensure element stability** before clicking by checking that the element's bounding box hasn't changed for 2 consecutive animation frames
2. **However, with CSS animations in Ant Design Collapse**, the element can be:
   - Visible in the DOM
   - Technically stable (not moving)
   - But still covered by or transitioning in a way that makes the double-click event not register

3. **The double-click happens too early** - while the Collapse panel is still animating open, the `dblclick()` event fires but doesn't reach the actual card element because the CSS animation is still in progress

### Evidence from Research

From the search results and community solutions:

- **Ant Design Collapse uses transition classes** like `.ant-motion-collapse-enter-active` during panel expansion
- **Click events can miss their target** when fired during these transitions ([Source](https://dev.to/sergeyt/how-to-wait-animations-complete-in-playwright-script-50fb))
- **The solution** is to explicitly wait for transition classes to disappear before attempting interactions

## The Solution

The fix is to **wait for Ant Design's CSS animation to complete** before double-clicking the card.

### Implementation

From the [troubleshooting guide for Ant Design accordion components](https://ray.run/discord-forum/threads/151617-button-onclick-not-working), the solution is:

```typescript
// After expanding the Collapse panel
await expandCardCategory(page, 'Custom Cards');

// Wait for CSS animation classes to disappear
const transitioningElements = page.locator('[class*="ant-motion"], [class*="ant-collapse-content-active"]');
try {
  await transitioningElements.first().waitFor({ state: 'detached', timeout: 1000 });
} catch {
  // Transition class might not exist, that's ok
}

// Additional buffer for animation completion
await page.waitForTimeout(500);

// NOW it's safe to double-click
const miniGraphCard = page.locator('div:has-text("Mini Graph")').first();
await miniGraphCard.dblclick();
```

### Why This Works

1. **Waits for transition classes to be removed** - Ant Design removes these classes when the animation completes
2. **Adds a 500ms buffer** - Extra safety margin for any lingering animation effects
3. **Ensures the element is truly interactive** - Not just visible, but ready to receive click events

## Technical Details

### Ant Design Collapse Animation Classes

When a Collapse panel opens, Ant Design applies several CSS classes:
- `.ant-motion-collapse-enter` - Initial state
- `.ant-motion-collapse-enter-active` - During animation
- `.ant-collapse-content-active` - When content is shown

These classes control the CSS transitions that animate the panel opening.

### Playwright's Auto-Waiting Limitations

According to [Playwright documentation on actionability](https://playwright.dev/docs/actionability):

- Playwright waits for elements to be **visible, stable, and enabled**
- It checks that elements haven't moved for 2 consecutive animation frames
- **However**, it doesn't specifically wait for CSS transition classes to be removed

This means an element can pass Playwright's actionability checks while still being affected by CSS transitions that prevent click events from being properly received.

## Why Previous Attempts Failed

### Attempt 1: Using `{ force: true }`
```typescript
await cardOnCanvas.click({ force: true });
```
- **Why it failed**: This bypasses actionability checks but doesn't solve the animation timing issue
- **Result**: Same problem - clicked too early during animation

### Attempt 2: Waiting longer after double-click
```typescript
await miniGraphCard.dblclick();
await page.waitForTimeout(1000);
```
- **Why it failed**: Waited AFTER the click, but the click already happened during the animation
- **Result**: Card still not added because the double-click didn't register

### Attempt 3: Waiting for `.ant-card` to appear
```typescript
await page.waitForSelector('.react-grid-item .ant-card', { timeout: 3000 });
```
- **Why it failed**: This waits for the card to be added, but it was never added in the first place
- **Result**: Timeout because the double-click never executed successfully

## The Correct Approach

Wait for the animation to complete **BEFORE** attempting the double-click:

1. Expand the Collapse panel
2. ✅ **Wait for animation classes to disappear**
3. ✅ **Add buffer for animation completion**
4. Perform the double-click
5. Wait for card to be added

## Related Issues

This issue affects any test that:
- Interacts with elements inside Ant Design Collapse panels
- Tries to click immediately after expanding a panel
- Uses CSS animations or transitions

## Impact

This fix resolves:
- ✅ Test 17: "should show Insert Entity button in Properties Panel YAML tab"
- ✅ Test 18: "should open entity browser from Properties Panel YAML editor"
- ✅ Test 19: "should show Insert Entity button in Dashboard YAML editor"
- ✅ Test 20: "should insert entity ID at cursor position in Monaco editor"
- ✅ Test 21: "should disable Insert Entity button when not connected and no cache"

All five tests were failing because the card was never being added to the canvas due to the animation timing issue.

---

## Sources

- [Playwright Issue #16048: Click misses target due to animation](https://github.com/microsoft/playwright/issues/16048)
- [How to wait for animations to complete in Playwright](https://dev.to/sergeyt/how-to-wait-animations-complete-in-playwright-script-50fb)
- [Troubleshooting Playwright Button Click in Accordion Components](https://ray.run/discord-forum/threads/151617-button-onclick-not-working)
- [Playwright Actionability Documentation](https://playwright.dev/docs/actionability)
- [The Green Report: Automating Animation Testing with Playwright](https://www.thegreenreport.blog/articles/automating-animation-testing-with-playwright-a-practical-guide/automating-animation-testing-with-playwright-a-practical-guide.html)

---

*Fix applied: December 27, 2024*
