Author: Claude Sonnet 5
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU

CHANGES-REQUIRED

# Follow-up implementation review — P12–P15 repair (PR #154)

Reviewed branch `feature/plan-consistency-checker` at
`60f191e120020ff8da932d39cf1445b760cc20aa`, answering the prior review at
`016cd03`. This document is the only repository change made by this review.

## Owner Summary Table

| Ref | Plain-English problem                                                                                                              | Severity | Blocks: scope                        | Fix complexity (1–5) | Recommendation |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | -------------------: | -------------- |
| P16 | Some unsupported version headers are still accepted because they are treated as warnings while the default rules are quietly used. | SEV-2    | The promised totals-document dialect |                    2 | Fix now        |
| P17 | The written repair instructions still omit the new safeguards for document versions.                                               | SEV-3    | None                                 |                    1 | Fix now        |
| P18 | The closing note says product code now exists, although the implementation is confined to test support.                            | SEV-3    | None                                 |                    1 | Fix now        |

## Owner Decision Brief

**What this protects.** The C3 document gate promises one YAML dialect so that a
written total has one meaning. The follow-up should also leave an accurate recipe
and an accurate statement of whether product code changed.

**What is going wrong.** The repair blocks `%YAML 1.1`, but the same library
reports numeric unsupported versions such as `%YAML 1.3` only as warnings and
keeps its effective version at 1.2. The implementation checks errors and that
effective value, ignores the warning, and therefore accepts the document. The
plan's main implementation step still shows the pre-repair parser call, and its
new closing note calls test-support code “production code.”

**Is the product affected? No.** No `src/`, Electron, integration, snapshot, or
baseline file changed. **Is the governance checker affected? Yes, measured.** An
unsupported explicit version header passes. The live governed plan has no such
header and remains clean.

**Options and costs.** Fixing P16 means consuming the parser's `BAD_DIRECTIVE`
warning (or another parser-supplied representation of the literal directive) and
adding higher/lower-version controls. P17 and P18 are one-line documentation
repairs. Merging unchanged saves little work but leaves the P12 disposition
broader than the mechanism and preserves two misleading plan statements.

**Recommendation.** Fix all three now. Do nothing and ordinary current documents
still pass, but a future copied or tool-produced version header can violate the
stated rule without a finding.

## Confidence and method

**Confidence: high on the deterministic defect and the P13–P15 closures; medium
on future reachability of an unsupported version header.** The current plan does
not contain one. `%YAML 1.3` is nevertheless a plausible future hand edit or
tool-produced header, not an input claimed to exist today.

### Material read

- The follow-up commission, prior implementation review, full `60f191e` commit
  message and diff, and all three files changed by that commit.
- The relevant current plan sections (§§1.4, 2.3, 2.7, 2.9, 2.11c and the closing
  note), the complete current C3 implementation and its new controls.
- `yaml` 2.9.0's installed directive implementation and types:
  `node_modules/yaml/dist/doc/directives.{js,d.ts}` and
  `node_modules/yaml/dist/options.d.ts`. The parser retains effective version
  1.2 and emits `BAD_DIRECTIVE` as a warning for numeric unsupported versions.

### Required reruns and targeted evidence

1. `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 0**, 1 file,
   **117/117 passed**, live-plan control included.
2. Deeper repeat — **N/A, not invented**. The load-bearing mechanism remains a
   deterministic pure unit checker over static strings, with no timing or
   external-process surface to repeat.
3. `./tools/checks` — first run **exit 1**: lint 0 errors / 145 warnings,
   formatting and type-check passed, then an unrelated
   `DeployDialog.spec.tsx` test timed out at 5000 ms; **1529/1530 passed in 105
   files**. `npx vitest run tests/unit/DeployDialog.spec.tsx` then returned
   **exit 0, 11/11**. One complete `./tools/checks` repeat returned **exit 0,
   4/4 steps, 0 errors / 145 warnings, 1530/1530 in 105 files**. Both full-gate
   results are retained here; the first failure is not relabelled as green.

- Exact-lock fail-against-`f1d51da`: detached temporary worktree, new 117-test
  spec copied in, then
  `npm ci --ignore-scripts --prefer-offline --no-audit --no-fund` — **exit 0** —
  and `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 1 as expected:
  2 failed / 115 passed**. The two failures were exactly P12's 1.1 case and
  P13's invalid-payload case; all 117 tests executed. Cleanup returned exit 0.
  This matches the author's symlinked-dependency count without using the symlink.
- Exit-0 Vite-SSR directive probe over the current checker:
  no directive clean; `%YAML 1.1` blocked; `%YAML 1.2` clean; `%YAML 1.0`, `1.3`
  and `2.0` **clean**; `%YAML next` blocked; `%TAG` alias to the standard integer
  tag clean; an unresolved tagged governed value blocked; a tagged duplicate
  string key blocked; a later-document 1.1 directive blocked by the existing
  multi-document rejection. Direct `parseDocument` inspection for 1.0, 1.3 and
  2.0 returned `explicit: true`, effective version `1.2`, no errors, and one
  `BAD_DIRECTIVE` warning in each case.
- Exit-0 P13 ordering probe: invalid `reviewer_findings` followed by valid
  `findings_after_round_one` plus finding prose emitted only
  `C3-NOCANONICAL`; no same-subject site leaked.
- Exit-0 old/new valid-payload comparison: nine fully valid fixtures (all six
  direct-key orders, flow mapping, integer alias, extra ungoverned key) were run
  against both `f1d51da` and `60f191e`; their complete C3 outputs were identical.
  Each produced the expected two drift advisories when paired with one prose
  restatement of each subject.
- `git diff-tree --no-commit-id --name-status -r 60f191e` and focused diff
  inspection — exit 0: exactly the plan, checker, and checker spec changed. The
  duplicate-header cleanup removed comments only; the closing-note cleanup
  changed plan prose only.
- A focused search of the live checker, spec, and plan found no remaining
  unqualified swallow universal. Historical quotations of the false claim are
  explicitly labelled as corrected. P15 now names both dependencies.

### What I did not check

- **UNVERIFIED:** Electron e2e, Electron integration, live Home Assistant, and a
  packaged build. This remains a unit-only test-support change; no Electron
  process was started.
- **UNVERIFIED:** every YAML tag and directive form outside the enumerated probe.
  The `%TAG` result is bounded to standard-integer, unresolved-value, and
  tagged-duplicate cases; it is not a universal claim over custom schemas.
- **UNVERIFIED:** statistical flake rate of the unrelated `DeployDialog` timeout.
  One isolated pass and one green full repeat show the initial failure was not
  deterministic; they do not prove it can never recur.
- Dependency versions other than the installed lockfile versions were not tested.
  The exact-lock old run warned that the current Node 20.19.6 is below the
  package's declared Node >=22 engine, but installation and all 117 tests ran.

## Claim ledger

| Claim                                                                                                               | Tag           | Evidence                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| The repair commit changes exactly the three declared files.                                                         | **MEASURED**  | `git diff-tree` at `60f191e`; line-by-line diff inspection.                                                                                    |
| The demonstrated `%YAML 1.1` bypass is closed.                                                                      | **MEASURED**  | Current directive probe blocks 1.1; paired committed control passes; old exact-lock run fails that control.                                    |
| P12 is not closed for numeric unsupported directives.                                                               | **MEASURED**  | `%YAML 1.0`, `1.3`, and `2.0` all return no C3 blocker; parser metadata shows effective 1.2 plus `BAD_DIRECTIVE` warning.                      |
| `%YAML next` and a directive in a later document do not bypass the gate.                                            | **MEASURED**  | Targeted probe: the former has a parser error; the latter has `MULTIPLE_DOCS`; both block.                                                     |
| The tested `%TAG` forms do not bypass value, duplicate-key, or string-key enforcement.                              | **MEASURED**  | Targeted standard-tag, unresolved-tag, and tagged-duplicate cases.                                                                             |
| `uniqueKeys` and `stringKeys` are direct parser controls, not dialect defaults overridden by the tested directives. | **INFERRED**  | Installed parser source plus the tagged-duplicate/alias controls and P12 probe. No second instance of the same fallback antipattern was found. |
| P13 is closed for both shared-subject orderings and every fully valid direct-key order.                             | **MEASURED**  | Same-subject invalid-first probe; six valid permutations; exact old/new nine-fixture comparison.                                               |
| P13 does not change final sites for the tested fully valid population.                                              | **MEASURED**  | Byte-identical serialized C3 outputs from `f1d51da` and `60f191e` for nine valid fixtures.                                                     |
| P14's wording is now qualified and its caught/residual contrast is executable.                                      | **MEASURED**  | Current source/plan search and the new disproof plus existing known-open controls.                                                             |
| P15's dependency count is corrected.                                                                                | **MEASURED**  | Plan §2.9 now says two and names `marked` and `entities`.                                                                                      |
| The population rose by exactly five tests, from 112 to 117.                                                         | **MEASURED**  | Focused runs at the two commits and diff enumeration: P12 pair, P13 pair, P14 disproof.                                                        |
| The first full-gate failure is unrelated to this repair.                                                            | **INFERRED**  | Failure was a timeout in unchanged `DeployDialog.spec.tsx`; it passed alone and in the complete repeat. No repair path imports that spec.      |
| `%YAML 1.3` is a plausible future edit but not a present input.                                                     | **JUDGEMENT** | It is a valid-looking version header in a hand-maintained YAML block; repository/current-plan inspection finds no explicit directive.          |

### Weakest claims

- P16's output is measured; its reachability is judgement. A repository rule
  forbidding directives would reduce urgency, but no such rule appears in the
  contract and the checker claims to enforce the dialect itself.
- The `%TAG` sweep is representative, not exhaustive. It establishes no observed
  second fallback bug in the three attacked forms, not completeness over all
  application-defined tags.
- The `DeployDialog` attribution is based on path independence, one isolated
  pass, and one green full repeat. It is enough not to assign that timeout to
  this three-file repair, but it is not a flake-rate measurement.

## Findings

### P16 — SEV-2 — Unsupported numeric YAML directives bypass P12's repair

**Claim.** The repair says any explicit YAML version other than 1.2 blocks, but
the implementation accepts numeric unsupported versions.

**Evidence.** At `tests/support/planConsistency.ts:445-465`, the checker first
rejects `yamlDoc.errors`, then rejects an effective directive version other than
`'1.2'`; it never reads `yamlDoc.warnings`. The installed parser's directive
implementation treats a syntactically numeric unsupported version as a
`BAD_DIRECTIVE` warning and retains fallback version 1.2.

Concrete input:

```yaml
# plan-running-totals
%YAML 1.3
---
review_rounds_complete: 7
reviewer_findings: 30
findings_after_round_one: 24
```

`parseDocument` reports `directives.yaml = { explicit: true, version: '1.2' }`,
no errors, and one `BAD_DIRECTIVE` warning. `checkPlan` therefore emits no C3
blocker. `%YAML 1.0` and `%YAML 2.0` follow the same path. `%YAML next` does not:
it is a parser error and already blocks.

**Mitigation gap.** `version: '1.2'` is a fallback, while checking the effective
version loses the unsupported literal after the parser has rejected it into the
warning channel. The paired committed test covers only the one alternate version
whose effective value remains 1.1. It cannot fail for the warning-and-fallback
path.

**Reachability.** No explicit version directive exists in the live plan. A 1.3
header is plausible in a future hand edit or copied/tool-produced YAML fragment,
but is not the ordinary current path; this caps the finding at SEV-2.

**Fix.** Let the parser decide the syntax: reject its `BAD_DIRECTIVE` warning
before crediting the payload, while retaining the effective-version check for
supported 1.1. Add controls for at least a higher minor (`1.3`) and incompatible
major (`2.0`), and prove the new control fails against `60f191e`. Do not add a
hand-written version table.

**Class swept.** Supported 1.1/1.2, lower/higher numeric versions, the literal
word `next`, `%TAG` interaction, and later-document directives. No claim is made
for every reserved directive or custom schema.

### P17 — SEV-3 — The plan's normative parser step still describes the pre-P12 mechanism

**Claim.** The disposition says P12 is fixed, but the implementation recipe a
future maintainer would follow omits both parts of the fix.

**Evidence.** Plan §2.3 item 5 at
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:353-363` still prescribes
`parseDocument(text, { uniqueKeys: true, stringKeys: true })` followed by error,
mapping, key, and value checks. It does not include `version: '1.2'`, an effective
version check, or warning treatment. Plan §2.11c at `:693-698` simultaneously
declares P12 fixed by the first two mechanisms.

**Mitigation gap.** A later disposition records history but does not repair the
plan's line-by-line implementation contract; copying item 5 recreates P12. The
same commit updated §2.3 for P14, so this is not an intentionally frozen historical
section.

**Reachability.** This affects a future repair, audit, or port that treats §2.3
as the plan's canonical recipe. It does not change today's checker output.

**Fix.** Update §2.3 item 5 to name the complete post-P16 parser flow, including
the 1.2 fallback, parser-decided directive warning rejection, and effective
version check.

### P18 — SEV-3 — The stale-note cleanup now mislabels test-support implementation as production code

**Claim.** The unrelated cleanup replaces a stale statement with a new scope
inaccuracy.

**Evidence.** The plan's closing note at
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:727-732` says that no production
code existed when revision 3 was written and “It now does — the repair landed as
commit `f1d51da`.” That implementation changed
`tests/support/planConsistency.ts` and `tests/unit/planConsistency.spec.ts`; no
`src/` file changed. The plan's own §2.9 correctly says the surface is test
support only.

**Mitigation gap.** Labelling the paragraph “stale below this line” does not
resolve the new present-tense claim that product code now exists. For the
non-developer owner, that wording conflicts with the stated product-impact and
blast-radius boundary.

**Reachability.** Any owner or later reviewer reading the closing status note can
infer that shipped application code changed when it did not. There is no runtime
effect.

**Fix.** Replace “production code” with “checker implementation” or “planned
implementation”: at revision 3 only the plan and reference harness existed; the
test-support checker implementation later landed at `f1d51da`.

## Disagreements and closures

- **P12 — PARTIAL.** The original 1.1 sexagesimal bypass is fixed and
  fail-against-old evidence is valid, but “any explicit non-1.2 version blocks”
  is refuted by P16.
- **P13 — CLOSED.** No invalid ordering leaks a site in the attacked matrix, and
  fully valid old/new outputs are identical. The fix is a narrow bug repair.
- **P14 — CLOSED.** The source, plan, and tests now distinguish ordinary invalid
  swallowed prose from YAML-compatible swallowed content. No stale live
  universal remains; historical quotations are labelled as false/corrected.
- **P15 — CLOSED.** The blast-radius section now says two and names both
  dependencies.
- **Unrelated duplicate header cleanup — clean.** It deletes only the duplicated
  old R1 comment block and changes no test behavior.
- **Unrelated closing-note cleanup — text-only but not accurate.** P18 asks for a
  terminology correction; there is no hidden code change beneath it.
- **P12 class sweep.** `%TAG` did not alter ordinary scalar resolution, bypass
  value checking, or bypass tagged duplicate detection in the tested forms.
  `uniqueKeys` and `stringKeys` are direct parser controls rather than dialect
  fallbacks; I found no second instance of P12's option/directive override
  pattern in this module.
- **Gate claim — reproduced only on repeat.** The first full run failed one
  unrelated timeout; the isolated spec and one complete repeat passed. The
  repair's focused 117-test suite was green on its first run.

## MemPalace drawer candidates

No MemPalace write was made. Under MP-LEASE these candidates are routed to the
write-enabled author with `added_by="codex"`.

1. **Wing:** `practice` · **Type:** verification rule · **Candidate:** “When a
   parser rejects syntax into a warning channel and retains a fallback effective
   value, checking only errors plus effective state can falsely accept the input;
   sweep error, warning, and normalization channels before claiming a dialect is
   enforced.” Add its one-line entry to the `practice` index in the same write.
2. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “At PR #154
   commit `60f191e`, `%YAML 1.0`, `1.3`, and `2.0` each produce a
   `BAD_DIRECTIVE` warning plus effective version 1.2 and pass C3; follow-up
   finding P16 asks the checker to consume the parser warning rather than build a
   version table.”
