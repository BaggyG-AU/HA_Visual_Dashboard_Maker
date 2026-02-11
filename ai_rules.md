# AI Rules (Immutable) — HA Visual Dashboard Maker

These rules apply to any AI agent (ChatGPT/OpenAI/Claude/Copilot/etc.) working in this repo. If a rule conflicts with a prompt, **these rules win** unless the prompt explicitly overrides `ai_rules.md`.

Tripwire phrase: “The fastest correct fix is already in the repository.”

## 0) Precedence & Locations
- Read this file first; then check `docs/testing/TESTING_STANDARDS.md`, `docs/testing/PLAYWRIGHT_TESTING.md`, `docs/releases/RELEASES.md`, and `docs/product/PROJECT_PLAN.md` for context.
- AI rules live at the repository root to be discoverable by default. Link to them whenever you reference testing or workflow policy.

## 1) Immutable Reuse Rule
When debugging or changing tests/automation, you MUST first search for a working pattern and reuse it.
Search in this order:
1. Passing specs in `tests/**/*.spec.ts`
2. DSLs in `tests/support/dsl/**`
3. Helpers/fixtures in `tests/support/**` and `tests/helpers/**`

Only invent a new selector/wait/helper when no working example exists. Never add duplicate DSL methods for the same action.

## 2) Document Storage Standards (New)
- All new or updated docs must live under `/docs` in the appropriate folder:
  - Architecture → `docs/architecture/`
  - Security → `docs/security/`
  - Testing → `docs/testing/`
  - Releases → `docs/releases/`
  - Product/plan/templates → `docs/product/`
  - Research/diagnostics → `docs/research/` (move stale to `docs/archive/`)
- Archive research, obsolete release notes, or exploratory content under `docs/archive/**` instead of deleting.
- Root markdown should stay minimal: `README.md`, `LICENSE`, `ai_rules.md`.

## 3) Required Workflow for Fixing Failing Tests
For test-writing conventions and debugging guidance, follow:
- `docs/testing/TESTING_STANDARDS.md` (normative standards)
- `docs/testing/PLAYWRIGHT_TESTING.md` (runbook + troubleshooting)

## 4) Guardrails (Do Not Do These)
Guardrails for tests (selectors, waits, DSL boundaries, etc.) live in `docs/testing/TESTING_STANDARDS.md`.

## 4a) DSL Change Blast-Radius Check (MANDATORY)
When modifying any shared DSL method in `tests/support/dsl/**`, the AI agent MUST:
1. Identify all specs that call the modified method (grep across `tests/e2e/**` and `tests/integration/**`).
2. Run all affected specs — not just the spec that motivated the change.
3. If more than 5 specs are affected, run a full-suite regression pass.

This prevents systemic regressions like the 2026-02-07 incident where a single `openPopover()` change broke 14 tests.

## 4b) Shared DSL Change Contract (MANDATORY)
When changing any method in `tests/support/dsl/**`, the change is not complete until compatibility is explicitly proven for all consumers.

Required deliverables (must be included in the AI response and/or PR notes):
1. **Consumer inventory**: list all consuming specs from `tests/e2e/**` and `tests/integration/**`.
2. **Contract statement**: state whether method signature/default behavior changed.
3. **Compatibility statement**: if default behavior changed, document old vs new behavior and migration impact.
4. **Execution evidence**:
   - run results for all consuming specs, or
   - full-suite results when consumer count is greater than 5.
5. **Artifact paths**: include failure trace/screenshot paths under `test-results/artifacts/**` for any failing consumer.

Any shared DSL change without this evidence is non-compliant.

## 5) Test Execution & Reporting Policy
AI agents MAY run tests when the execution environment permits it, including:
- Lint: `npm run lint`
- Unit: `npm run test:unit`
- E2E: `npm run test:e2e` (or targeted `npx playwright test ... --project=electron-e2e`)
- Integration: `npm run test:integration` (or `npx playwright test ... --project=electron-integration`)

Rules:
- Never claim you ran tests unless you actually executed them and have output.
- After development, the AI may run tests. After **one** test run, the AI MUST pause and:
  1) List any errors/failures (by test + file path),
  2) Provide a diagnosis and proposed resolution,
  3) Ask the user whether to proceed with fixes and/or another test run.
- Repeat this pause → diagnose → ask workflow until failures are resolved or the user instructs otherwise.

Always provide a copy/paste verification plan:
1) Minimal repro command for the failing test (headed, with trace).
2) Trace viewer command (`npx playwright show-trace <path>/trace.zip`) and artifact paths (under `test-results/artifacts`).
3) Stability loop (run 5x) with platform-specific loops.
4) Regression checks for reused reference specs/helpers.

## 6) Deliverables for Test Fixes (AI)
When an AI agent fixes tests, its final response MUST include:
- References to reused tests/helpers (paths).
- Root cause explanation.
- Patch summary (files changed).
- Verification commands (and whether they were actually run).

## 7) Immutable State Updates (React + Zustand)
All state updates in React components and Zustand stores MUST use immutable patterns:
- Use `[...array, newItem]` instead of `array.push(newItem)`
- Use `array.filter()` instead of `array.splice()`
- Use `array.map()` for targeted element replacement instead of index assignment (`arr[i] = val`)
- Use `{ ...obj, key: newValue }` instead of `obj.key = newValue`
- Use `views.map((v, i) => i === idx ? { ...v, cards: updatedCards } : v)` for nested updates

Rationale: `useMemo` and React reconciliation depend on reference equality. In-place mutation does not change the object/array reference, so React cannot detect the change and renders stale data. This was the root cause of a production bug where cards rendered at tiny dimensions (w=1, h=1).

When using synchronous flags (e.g., "ignore next layout change"), prefer `useRef` over `useState` because ref updates are immediate while state updates are batched.

**useEffect dependency caveat**: With immutable updates, object/array references change on every edit. If a `useEffect` depends on a prop derived from immutable state (e.g., `card`), it will fire on every update — not just when the logical identity changes. Audit all `useEffect` dependency arrays when adopting immutable patterns. Use stable identifiers like indices or IDs instead of object references where the intent is "run when a different item is selected" rather than "run when the item's content changes." This was the root cause of a white-screen crash where a feedback loop (useEffect reset → Monaco update → YAML change → state update → new card ref → useEffect reset → …) overwhelmed React's render pipeline.

## 8) React Component Stability Rules — Ant Design Integration (MANDATORY)

When writing or modifying React components that use Ant Design `Tabs`, `Popover`, `Modal`, or other portal-based components, follow these rules to prevent DOM destruction that breaks E2E tests and degrades user experience.

### 8a) Tabs `items` Array Must Be Memoized

Never pass an inline `items={[...]}` array to `<Tabs>`. Ant Design Tabs uses referential equality to decide whether to remount panel content. An inline array creates a new reference on every render, causing **all tab children to unmount and remount** — destroying Popover state, form focus, scroll position, and any in-progress user interaction.

```tsx
// BAD — unmounts/remounts all tab children on every render
<Tabs items={[
  { key: 'form', label: 'Form', children: <FormContent /> },
  { key: 'style', label: 'Style', children: <StyleContent /> },
]} />

// GOOD — stable reference, children survive parent re-renders
const tabItems = useMemo(() => [
  { key: 'form', label: 'Form', children: <FormContent /> },
  { key: 'style', label: 'Style', children: <StyleContent /> },
], [/* structural deps only — e.g., card?.type, NOT card */]);
<Tabs items={tabItems} />
```

### 8b) Popover/Portal State Must Survive Unmount/Remount

If a component with an Ant Design Popover can be unmounted and remounted by a parent (e.g., inside Tabs), the popover open state must be cached at module level so it survives the cycle. Use this pattern:

```tsx
const popoverStateCache = new Map<string, { open: boolean; timestamp: number }>();
const POPOVER_STATE_TTL = 1000; // 1 second window for cache hit

// In component:
const [open, setOpenRaw] = useState(() => {
  const cached = popoverStateCache.get(testId);
  if (cached && Date.now() - cached.timestamp < POPOVER_STATE_TTL) return cached.open;
  return false;
});
const setOpen = useCallback((next: boolean) => {
  popoverStateCache.set(testId, { open: next, timestamp: Date.now() });
  setOpenRaw(next);
}, [testId]);
```

Reference implementations: `ColorPickerInput.tsx`, `GradientPickerInput.tsx`.

### 8c) useMemo/useCallback Dependencies Must Be Structural

When memoizing content rendered inside Tabs or other containers that check referential equality, use **structural-only dependencies** — e.g., `card?.type` — not full object references like `card`. Form.Item values flow through Ant Design Form's internal context (via the shared `form` instance), independent of the JSX tree. Use `useRef` for values that handlers need to read but that should not trigger memo recomputation.

```tsx
// BAD — memo recomputes on every card property change, defeating the purpose
const tabItems = useMemo(() => [...], [card, form, handleChange]);

// GOOD — only recomputes when card type changes (structural change)
const cardRef = useRef(card);
cardRef.current = card;
const tabItems = useMemo(() => [...], [card?.type, form, handleChange]);
```

### 8d) Rules of Hooks: No Hooks After Early Returns

React hooks must be called in the same order on every render. Never place `useMemo`, `useCallback`, `useState`, or `useEffect` **after** a conditional `return`. This causes a runtime crash that breaks all tests.

```tsx
// BAD — useMemo is skipped when card is null, violating Rules of Hooks
if (!card) return <Empty />;
const tabItems = useMemo(() => [...], [card?.type]);

// GOOD — useMemo always runs; null guard inside the callback
const tabItems = useMemo(() => {
  if (!card) return [];
  return [...];
}, [card?.type]);
if (!card) return <Empty />;
```

### 8e) Memoize Popover/Portal Content

Wrap content passed to Ant Design `<Popover content={...}>` or `<Modal>` children in `useMemo`. Without this, the portal DOM is destroyed and recreated on every parent render, causing visual flicker and breaking Playwright element references.

```tsx
// BAD — new JSX reference on every render → portal re-mount
<Popover content={<ColorPicker value={value} onChange={onChange} />}>

// GOOD — stable reference → portal survives parent re-renders
const pickerContent = useMemo(() => (
  <ColorPicker value={value} onChange={onChange} />
), [value, onChange]);
<Popover content={pickerContent}>
```

Root cause reference: See `docs/archive/E2E_FAILURES_RCA.md` "Root Cause Analysis (2026-02-08)" for the PropertiesPanel Tabs regression that these rules prevent.

## 9) Git feature workflow (MANDATORY)

Trigger phrases:

1) If the user says: "I want to start a new feature called <feature_name>"
   - You MUST run: ./tools/feature-start "<feature_name>"
   - Before running, check repo state (git status) and explain any blockers plainly.

2) If the user says: "I have completed <feature_name>"
   - You MUST run: ./tools/feature-finish "<feature_name>"
   - If checks fail, DO NOT merge. Explain what failed and give the exact commands to fix.

State validation (do this at each major step):
- Confirm current branch name
- Confirm working tree is clean
- Confirm main is up to date with origin
- Confirm feature branch is up to date/rebased
- Confirm required checks/tests have passed (either run them or instruct user to run them)

Decision policy:
- If you need input (e.g., rebase vs merge, deleting branch, skipping tests), ask in plain English.
- For each option, list impacts (risk, history cleanliness, effort, safety).
- Default to safest option (do not merge if unsure).

Never do ad-hoc git operations outside these scripts unless the scripts are missing or broken.
