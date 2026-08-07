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

Nine call sites, from section 1 of the script. `src/App.tsx:2203` is the test
backdoor (`__dashboardTestApi.loadYaml`); the other eight are user-reachable.

⚠⚠ **THE "DRIVER" COLUMN IS THE ONE THAT MATTERS, AND THE FIRST VERSION OF THIS
TABLE GOT IT WRONG.** Round 2 of the independent review found that it named
consumers that merely _mention_ a control's testid, not ones that _act_ on it —
`recent-files.spec.ts` was credited with the Open Recent path it never invokes,
and `templates.spec.ts` was credited with the entity-type path where it only
asserts a sibling tile is visible. **That is the round-1 finding repeated one
level up: searching test-file spelling instead of behaviour.** Section 3 of the
script now reports only lines that ACT on a control (`.click()`, `.fill()`,
`.press()`, `.dispatchEvent()`, `webContents.send()`, …), and this table is
regenerated from that output.

| #   | Call site          | Handler                       | User flow                             | Control that reaches it                      | Driver — a line that ACTS on that control                                                                                            |
| --- | ------------------ | ----------------------------- | ------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `src/App.tsx:620`  | `handleOpenFile`              | File > Open                           | `toolbar-open-file`                          | `tests/integration/file-open-unsaved-guard.spec.ts:106`                                                                              |
| 2   | `src/App.tsx:665`  | `handleOpenRecentFile`        | File > Open Recent                    | `menu:open-recent-file`                      | `tests/e2e/sections-canvas.spec.ts` leg **L17** — **added this round; nothing drove it before**                                      |
| 3   | `src/App.tsx:1943` | `createNewSectionsDashboard`  | New Dashboard > Sections              | `new-dashboard-sections-option`              | `tests/e2e/view-authoring.spec.ts:75`                                                                                                |
| 4   | `src/App.tsx:2203` | `__dashboardTestApi.loadYaml` | test backdoor                         | n/a (test API)                               | `tests/e2e/sections-canvas.spec.ts` and many others                                                                                  |
| 5   | `src/App.tsx:2299` | `handleDashboardDownload`     | Preset import / HA dashboard download | `preset-marketplace-import`                  | `tests/support/dsl/presetMarketplace.ts:44` → `tests/e2e/preset-marketplace.spec.ts`, `tests/integration/preset-marketplace.spec.ts` |
| 6   | `src/App.tsx:2346` | `createNewDashboard`          | New Dashboard > Blank                 | `new-dashboard-blank-option`                 | `tests/e2e/entity-type-dashboard.spec.ts:60`, and `dashboardDSL.createNew()` — see below                                             |
| 7   | `src/App.tsx:2377` | `handleTemplateSelected`      | New Dashboard > Template              | `new-dashboard-template-option`              | `tests/support/dsl/templates.ts:29` → `tests/e2e/templates.spec.ts`                                                                  |
| 8   | `src/App.tsx:2412` | `handleCreateFromEntityType`  | New Dashboard > Entity type           | `new-dashboard-entity-type-option`           | `tests/e2e/entity-type-dashboard.spec.ts:196` (and nine further cases)                                                               |
| 9   | `src/App.tsx:2445` | `handleApplyYamlChanges`      | Dashboard YAML Apply (`mode: 'edit'`) | `yaml-apply-button` + the Apply confirmation | `tests/e2e/sections-canvas.spec.ts` leg **L16** — **added this round; nothing crossed the confirm before**                           |

⚠ The `tests/` paths above are the sole inventory. There is deliberately **no
summary count** of consumers or files added: a count that summarises a table is a
second source of truth about the table and drifts the moment a row changes. This
document has already paid for that lesson twice — see "the blank path" below.

### Two routes that are mentioned but never driven

Regenerate with `bash tools/f5-load-path-sweep.sh` and read section 3:

- **`menu:open-file`** — the File menu's Open item. The same handler is reached by
  `toolbar-open-file`, which **is** driven (row 1), so the call site is covered;
  the menu route specifically is not. Not a gap in `loadDashboard` coverage.
- **The HA-download route into row 5.** `handleDashboardDownload` is reached both
  by importing a marketplace preset (driven, row 5) and by downloading a real
  dashboard from a live Home Assistant instance (**not driven** — it needs a live
  instance, which F5 does not require and this sweep does not use).

Naming these explicitly is the point: an honest mapping says which route was
exercised, not merely which handler.

### The `mode: 'edit'` path had no consumer at all

`handleApplyYamlChanges` is reached only from the OK handler of the Apply
confirmation dialog (`YamlEditorDialog.handleConfirmApply`). Measured:

```bash
grep -rn "Apply & Reload" tests/          # before this PR: no match anywhere
```

Every existing Apply test stops at the confirmation boundary — including
`tests/integration/monaco-editor.spec.ts:182-200`, which asserts the dialog
appears and goes no further — so the one branch of `loadDashboard` whose `set` is
_partly conditional on mode_ was never exercised end to end by any test in the
repository. Leg **L16** now crosses it.

### Open Recent had no consumer either

Measured before leg L17 was written:

```bash
grep -rln "open-recent\|openRecentFile" tests/e2e tests/integration   # -> no match
```

`tests/e2e/recent-files.spec.ts` tests Save As registration, retargeting,
cancellation and export exclusion — it never opens a recent file, and crediting
it with this path was the round-2 finding. `tests/unit/menu.spec.ts` proves the
main process _emits_ the path, not that the renderer receives it and loads.
**Leg L17 drives `menu:open-recent-file` into the real renderer subscription
(`src/App.tsx:2838-2847`), so everything after the OS menu itself is production
code.**

### The blank path, and what is honestly claimed about it

`createNewDashboard` (`src/App.tsx:2346`) is reached by `dashboardDSL.createNew()`,
whose default kind is `blank` (`tests/support/dsl/dashboard.ts:73`):

```bash
grep -rl "\.createNew(" tests/e2e tests/integration --include=*.spec.ts | sort | wc -l
```

So the population for this one call site is, in practice, most of the suite —
exactly what §9.7 predicted, and what makes a bounded "Medium" sweep a judgement
rather than an enumeration.

⚠⚠ **THIS PARAGRAPH HAS NOW BEEN WRONG TWICE, AND THE FIX IS TO STOP WRITING THE
NUMBER.** It first said 83, read off a listing rather than counted. It was then
corrected to 80 in one place while a stale "all 83" survived in another — a
second source of truth about the same command, drifting exactly as predicted.
**Run the command; do not quote its output here.** Which specs inside the sweep
exercise the blank path is likewise a question for the command, not for a
maintained list:

```bash
comm -12 \
  <(grep -rl "\.createNew(" tests/e2e tests/integration --include=*.spec.ts | sort) \
  <(printf '%s\n' <the 26 swept spec paths> | sort)
```

**What is claimed:** the blank path is exercised by specs inside the executed
sweep, enumerable with the command above. **What is not claimed:** that every
spec reaching it was run. The full e2e and integration suites remain unverified
since PR #128, and this PR does not change that.

## What is actually claimed, and what is not

- **Claimed:** every one of the nine production call sites has at least one named
  consumer spec, and each named consumer was executed. Results are recorded in
  the PR body against the command that produced them.
- **Not claimed:** "every load path" or "zero under-inclusion". Those words are
  withdrawn. The honest statement is the table above plus the run results.
- **Not claimed:** that the omitted flows were ever broken. The review did not
  assert that either; the defect was in the evidence, not in the product.
