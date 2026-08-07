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

| #   | Call site          | Handler                       | User flow                             | Consumer spec(s) driving it                                                                             | Run?                     |
| --- | ------------------ | ----------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1   | `src/App.tsx:620`  | `handleOpenFile`              | File > Open                           | `tests/integration/file-open-unsaved-guard.spec.ts`, `tests/integration/dashboard-load-honesty.spec.ts` | ✅ in the original 20    |
| 2   | `src/App.tsx:665`  | `handleOpenRecentFile`        | File > Open Recent                    | `tests/e2e/recent-files.spec.ts`                                                                        | ✅ in the original 20    |
| 3   | `src/App.tsx:1943` | `createNewSectionsDashboard`  | New Dashboard > Sections              | `tests/e2e/view-authoring.spec.ts`, `tests/e2e/templates.spec.ts`                                       | ⚠ one of two was missing |
| 4   | `src/App.tsx:2203` | `__dashboardTestApi.loadYaml` | test backdoor                         | `tests/e2e/sections-canvas.spec.ts` and many others                                                     | ✅ in the original 20    |
| 5   | `src/App.tsx:2299` | `handleDashboardDownload`     | HA dashboard browser download         | `tests/e2e/preset-marketplace.spec.ts`, `tests/integration/preset-marketplace.spec.ts`                  | ❌ **both were missing** |
| 6   | `src/App.tsx:2346` | `createNewDashboard`          | New Dashboard > Blank                 | `dashboardDSL.createNew()` — 80 spec files (command below), incl. 6 already in the 20                   | ⚠ see "the blank path"   |
| 7   | `src/App.tsx:2377` | `handleTemplateSelected`      | New Dashboard > Template              | `tests/e2e/templates.spec.ts`, `tests/e2e/entity-type-dashboard.spec.ts`                                | ❌ **both were missing** |
| 8   | `src/App.tsx:2412` | `handleCreateFromEntityType`  | New Dashboard > Entity type           | `tests/e2e/entity-type-dashboard.spec.ts`, `tests/e2e/templates.spec.ts`                                | ❌ **both were missing** |
| 9   | `src/App.tsx:2445` | `handleApplyYamlChanges`      | Dashboard YAML Apply (`mode: 'edit'`) | **no consumer existed** — see below                                                                     | ❌ **new leg L16 added** |

⚠ The `tests/` paths above are the sole inventory. There is deliberately no
summary count of "files added", because a count that summarises a table is a
second source of truth about the table and drifts the moment a row changes.

### The six consumers the published list omitted

Re-runnable check — every one of these is absent from the token-spelling list:

```bash
bash tools/f5-load-path-sweep.sh > /tmp/sweep.txt
for f in tests/e2e/templates.spec.ts tests/e2e/entity-type-dashboard.spec.ts \
         tests/integration/monaco-editor.spec.ts tests/e2e/preset-marketplace.spec.ts \
         tests/integration/preset-marketplace.spec.ts tests/e2e/entity-remapping.spec.ts; do
  grep -rlE "loadDashboard|loadYaml|openFile|dashboard-generator|handleCardDropIntoContainer|onCardDropIntoContainer" \
    tests/e2e tests/integration --include=*.spec.ts | grep -qx "$f" \
    && echo "IN LIST  $f" || echo "MISSING  $f"
done
```

The review named three (`templates`, `entity-type-dashboard`, `monaco-editor`).
The source-side enumeration finds three more — `preset-marketplace` (e2e and
integration, both reaching the HA-download call site) and `entity-remapping`.
That difference is itself the point: **a finding is a sample of a class, and the
class was larger than the sample.**

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
repository. `tests/e2e/sections-canvas.spec.ts` leg **L16** now crosses it.

### The blank path, and what is honestly claimed about it

`createNewDashboard` (`src/App.tsx:2346`) is reached by `dashboardDSL.createNew()`,
whose default kind is `blank` (`tests/support/dsl/dashboard.ts:73`). That DSL
method is called by **80** spec files — a measured count, not an impression:

```bash
grep -rl "\.createNew(" tests/e2e tests/integration --include=*.spec.ts | sort | wc -l   # -> 80
```

⚠ That number was first written here as 83, from reading a listing rather than
counting it. It is corrected above and the command is published beside it
precisely so the next reader can falsify it in one keystroke — a hand-built list
is still a manual enumeration, and this is the second time on this PR that the
difference has mattered.

So the population for this one call site is, in practice, most of the suite —
which is exactly what §9.7 predicted and what makes a bounded "Medium" sweep a
judgement rather than an enumeration.

**What is claimed:** the blank path is exercised by six specs already inside the
sweep (`file-operations`, `menu-actions`, `round1-final-honesty`,
`core-card-coverage`, `bulk-operations`, `palette-card-coverage`), all of which
were run. **What is not claimed:** that all 83 were run. They were not. The full
e2e and integration suites remain unverified since PR #128, and this PR does not
change that.

## What is actually claimed, and what is not

- **Claimed:** every one of the nine production call sites has at least one named
  consumer spec, and each named consumer was executed. Results are recorded in
  the PR body against the command that produced them.
- **Not claimed:** "every load path" or "zero under-inclusion". Those words are
  withdrawn. The honest statement is the table above plus the run results.
- **Not claimed:** that the omitted flows were ever broken. The review did not
  assert that either; the defect was in the evidence, not in the product.
