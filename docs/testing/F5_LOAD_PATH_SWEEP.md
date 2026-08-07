Author: Claude Opus
Reviewer: OpenAI Codex (GPT-5) — this document exists to answer finding M4 of
`docs/reviews/f5-sections-palette-drop-codex-review.md`
Owner gate: BaggyG-AU reads it with PR #137

# F5 — the `loadDashboard` load-path sweep, enumerated from the source side

## Why this document exists

F5's spec warns, at §9.7, that the one-line store change —
`selectedSectionIndex: null` in `loadDashboard`'s success `set`
(`src/store/dashboardStore.ts:160`) — **touches every load path**, so its
regression sweep is not confined to the sections specs.

PR #137's first evidence package answered that warning with this command:

```bash
grep -rlE "loadDashboard|loadYaml|openFile|dashboard-generator|handleCardDropIntoContainer|onCardDropIntoContainer" \
  tests/e2e tests/integration --include=*.spec.ts | sort
```

It returns 20 files, and the PR reported them as covering "every load path" with
"zero under-inclusion".

**That claim is retracted.** The command enumerates specs that _mention_ those
tokens. It cannot enumerate specs that _reach_ a production `loadDashboard` call
site, because a spec that clicks a template tile never spells the word
`loadDashboard`. Cross-checking it against a _broader spelling_ — which is what
the original "diffed both ways for under-inclusion" check did — cannot find the
gap either, because both sides of that diff are searches of the same test text.

> ⭐ **The rule this cost us: a population claim needs an enumeration of the
> population.** Start at the thing the change touches — the production call
> sites — and walk outward to the controls that reach them and the specs that
> drive those controls. A count of files containing a token is not a count of
> files exercising a behaviour.

## The regenerating command

```bash
bash tools/f5-load-path-sweep.sh
```

Section 1 of its output is the source-side population and is fully mechanical.
Sections 2–3 walk outward to entry controls and their consumers, reporting both
direct spec references **and** DSL modules, because a spec often reaches a
control through a DSL method; every hop the script cannot make itself is printed
rather than silently skipped. Section 5 reproduces the original token-spelling
list for contrast.

## The population — every production `loadDashboard` call site

Section 1 of the script is **fully mechanical** and has been correct in every
review round — **run it; the population is its output, not a number quoted
here.** `src/App.tsx:2203` is the test backdoor (`__dashboardTestApi.loadYaml`);
the rest are user-reachable.

## The consumer mapping is a HAND TRACE, not a generated result

⚠⚠⚠ **THIS DOCUMENT SPENT THREE REVIEW ROUNDS TRYING TO GENERATE THIS TABLE, AND
FAILED THREE TIMES IN THE SAME WAY.**

| Round | What was published as the mapping                    | Why it was wrong                                                                                               |
| ----- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1     | files containing a `loadDashboard`-ish **token**     | a spec that clicks a template tile never spells the word                                                       |
| 2     | files containing a control **testid**                | **a mention is not a drive** — asserting a tile is _visible_ was credited as driving the path behind it        |
| 3     | an action within **three lines** of a control testid | dropped a real driver whose `.click()` sat four lines away; credited entry-tile clicks that only open a wizard |

⭐⭐⭐ **EACH FIX REPLACED ONE TEXTUAL PROXY FOR REACHABILITY WITH A SLIGHTLY
BETTER TEXTUAL PROXY.** Whether executing a spec causes a particular line of
production code to run is a **control-flow property**. It is not lexical, no
grep can decide it, and widening the window only moves the proxy. The generator
of the defect was not any one command — it was **the attempt to derive a
judgement mechanically and publish it wearing mechanical authority.**

**So the table below is traced by hand, row by row, and labelled as such.** Each
row names the **terminal** action — the one that actually reaches the call site —
and, where the chain passes through intermediate steps, says so. The script lists
_candidates_ and stops; it no longer answers this question.

| #   | Call site          | Handler                       | Terminal driver (traced)                                                                                                                                                                        |
| --- | ------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/App.tsx:620`  | `handleOpenFile`              | `tests/integration/dashboard-load-honesty.spec.ts:85` — `button.click()` on `welcome-open-local-file` / `toolbar-open-file` after a stubbed chooser; also `file-open-unsaved-guard.spec.ts:106` |
| 2   | `src/App.tsx:665`  | `handleOpenRecentFile`        | `tests/e2e/sections-canvas.spec.ts` leg **L17** — sends `menu:open-recent-file` into the production renderer subscription (`src/App.tsx:2838-2847`)                                             |
| 3   | `src/App.tsx:1943` | `createNewSectionsDashboard`  | `tests/e2e/view-authoring.spec.ts:75` — clicks `new-dashboard-sections-option`, which is wired directly to the handler (single step)                                                            |
| 4   | `src/App.tsx:2203` | `__dashboardTestApi.loadYaml` | the `loadYaml` helper throughout `tests/e2e/sections-canvas.spec.ts` — direct test-API call (single step)                                                                                       |
| 5   | `src/App.tsx:2299` | `handleDashboardDownload`     | `presetMarketplace.importSelected()` (`tests/support/dsl/presetMarketplace.ts:44`) → `onPresetImport` → `onDashboardDownload`. **Two hops**; the preset-import route, not the HA-download route |
| 6   | `src/App.tsx:2346` | `createNewDashboard`          | `tests/e2e/entity-type-dashboard.spec.ts:60` clicks `new-dashboard-blank-option`; also every `dashboardDSL.createNew()` default-kind call                                                       |
| 7   | `src/App.tsx:2377` | `handleTemplateSelected`      | `tests/e2e/templates.spec.ts:107` → `chooseTemplate()` → `tile.click()` (`tests/support/dsl/templates.ts:155`). ⚠ **NOT** `templates.ts:29` — that click only opens the chooser                 |
| 8   | `src/App.tsx:2412` | `handleCreateFromEntityType`  | `tests/e2e/entity-type-dashboard.spec.ts:246-264` — category tile **then** the _Create Dashboard_ button. ⚠ **NOT** `:196`, which clicks the entry tile and only asserts the wizard rendered    |
| 9   | `src/App.tsx:2445` | `handleApplyYamlChanges`      | `tests/e2e/sections-canvas.spec.ts` leg **L16** — Apply **and** its confirmation                                                                                                                |

⚠ Rows 7 and 8 are the ones the generated mappings got wrong, in both prior
rounds and in opposite directions. They are the reason this table is hand-traced.

### Two routes deliberately not exercised

- **`menu:open-file`** — the File menu's Open item. The same handler is driven
  via the toolbar (row 1), so this is a **route** gap, not a call-site gap.
- **The live-HA download route into row 5.** It shares `handleDashboardDownload`
  with the exercised preset-import route and needs a live Home Assistant
  instance, which F5 does not require.

### `mode: 'edit'` and Open Recent each had no consumer at all

Measured before legs L16 and L17 were written:

```bash
grep -rn "Apply & Reload" tests/                                     # -> no match
grep -rln "open-recent\|openRecentFile" tests/e2e tests/integration   # -> no match
```

Every existing Apply test stopped at the confirmation boundary, and
`tests/e2e/recent-files.spec.ts` tests Save As registration, retargeting,
cancellation and export exclusion — it never opens a recent file.

### The blank path

`createNewDashboard` (`src/App.tsx:2346`) is reached by `dashboardDSL.createNew()`,
whose default kind is `blank` (`tests/support/dsl/dashboard.ts:73`). Which specs
call it, and how many, is a question for the command — **not for a number quoted
here**, which is how this document published a stale count twice:

```bash
grep -rl "\.createNew(" tests/e2e tests/integration --include=*.spec.ts | sort
```

**What is claimed:** specs inside the executed sweep exercise the blank path.
**What is not claimed:** that every spec reaching it was run. The full e2e and
integration suites remain unverified since PR #128.

## What is actually claimed, and what is not

- **Claimed:** every row of the traced table above names a terminal driver, and
  each was executed. **The table is the inventory** — there is no separate count
  of rows to drift against it. Results are recorded in the PR body against the
  command that produced them.
- **Not claimed:** "every load path" or "zero under-inclusion". Those words are
  withdrawn. The honest statement is the table above plus the run results.
- **Not claimed:** that the omitted flows were ever broken. The review did not
  assert that either; the defect was in the evidence, not in the product.
