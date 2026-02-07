## Bug Fix #1: `src/App.tsx` — Carousel Card Renders at Tiny Dimensions

### What was fixed

A state mutation bug in `src/App.tsx` caused newly added cards to render at tiny default dimensions (w=1, h=1) instead of their correct sizing-contract dimensions.

### Root cause

`handleCardAdd` used `currentView.cards.push(newCard)` which mutates the existing array in-place without changing its JavaScript reference. The `useMemo` in `GridCanvas.tsx` (which depends on `[view, cards]`) could not detect the change because both object references were unchanged. It returned a stale empty layout to react-grid-layout, which then assigned default tiny dimensions to the unmatched child element.

### Changes made (all in `src/App.tsx`)

1. **`ignoreNextLayoutChange`** changed from `useState` to `useRef` for synchronous flag updates (line 90)
2. **`handleLayoutChange`** (~line 423) — uses ref instead of state; creates new view objects immutably via `.map()` instead of mutating `currentView`
3. **`handleCardAdd`** (~line 533) — uses `[...(view.cards || []), newCard]` and `config.views.map()` instead of `push()` + shallow copy
4. **`handleCardUpdate`** (~line 555) — uses `.map()` for immutable card replacement instead of index assignment
5. **`handleCardCommit`** (~line 578) — same immutable pattern as `handleCardUpdate`
6. **`handleCardPaste`** (~line 666) — uses immutable `.map()` + spread instead of `push()`, and `.filter()` instead of `splice()` for cut operations
7. **`handleCardDelete`** (~line 713) — uses `.filter()` instead of `splice()`

---

## Bug Fix #2: White Screen Crash During YAML Editing

### What was fixed

After the immutable refactor (Fix #1), editing a card via the YAML editor caused the entire app to crash to a white screen. The `PropertiesPanel` had a `useEffect` dependency on the `card` prop reference, which created an infinite feedback loop with immutable state updates.

### Root cause

The `useEffect` at `PropertiesPanel.tsx:714` depended on `[card, cardIndex, form]`. This effect resets the form and YAML content when a card is selected. With immutable state updates, every call to `handleCardUpdate` creates a **new card object reference** (via `.map()` with spread). This caused the effect to fire on every edit — not just when switching cards — creating a feedback loop:

1. YAML change → `onChange(parsedCard)` → `handleCardUpdate` → `applyBatchedConfig` → new config with new card references
2. PropertiesPanel re-renders with new `card` prop (new reference, same index)
3. `useEffect` fires → `setYamlContent(cardToYaml(card))` → resets YAML content
4. Monaco `onDidChangeModelContent` fires → `handleYamlChange` debounce → back to step 1

This infinite loop overwhelmed React's render pipeline. With no error boundary, the entire React tree crashed, producing a white screen.

Additionally, `handleLayoutChange` called `updateConfig` during an active batch, prematurely ending the batch and polluting the undo stack with intermediate states.

### Changes made

1. **`PropertiesPanel.tsx`** (~line 714) — Changed `useEffect` dependency from `[card, cardIndex, form]` to `[cardIndex, form]`. The effect now only fires when the card **index** changes (selecting a different card), not on every card content update. Added ESLint disable comment with detailed explanation.

2. **`src/App.tsx`** (~line 483) — `handleLayoutChange` now checks `isBatching` before choosing update strategy:
   - During a batch → uses `applyBatchedConfig` (no undo push, doesn't end batch)
   - Outside a batch → uses `updateConfig` (pushes to undo stack)
   - Added `isBatching` to the destructured Zustand store state

### What to test

Run the carousel E2E tests:

```bash
npx playwright test tests/e2e/carousel.spec.ts --project=electron-e2e
```

All three carousel tests should now pass:

- `navigates via arrows, swipe, pagination, and keyboard`
- `autoplay advances slides when not selected`
- `property changes reflect in preview and YAML`

You should also run the full E2E suite to verify no regressions:

```bash
npx playwright test --project=electron-e2e
```

### Do NOT modify

- Do not change `tests/e2e/carousel.spec.ts` — the tests are correct
- Do not change `tests/support/dsl/carousel.ts` — the DSL is correct
- Do not change `src/components/GridCanvas.tsx` — the `useMemo` is correct
- Do not change `src/utils/cardSizingContract.ts` — the sizing contract is correct

The fixes are in `src/App.tsx` and `src/components/PropertiesPanel.tsx`. The tests were always correct; the product code had the bugs.
