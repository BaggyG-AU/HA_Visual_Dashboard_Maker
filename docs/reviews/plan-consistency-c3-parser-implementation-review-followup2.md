Author: Claude Sonnet 5
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU

CHANGES-REQUIRED

# Second follow-up implementation review — P16–P18 repair (PR #154)

Reviewed branch `feature/plan-consistency-checker` at
`1d68876f752fd7cbd1e43f0d8784ac26c9f7d469`, answering the prior review at
`e5d1874`. This document is the only repository change made by this review.

## Owner Summary Table

| Ref | Plain-English problem                                                                                                        | Severity | Blocks: scope                        | Fix complexity (1–5) | Recommendation |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | -------------------: | -------------- |
| P19 | The new warning check mistakes a valid reserved directive for an unsupported YAML version and blocks the whole totals block. | SEV-2    | The promised totals-document dialect |                    2 | Fix now        |

## Owner Decision Brief

**What this protects.** C3 promises to parse YAML 1.2 rather than a private
lookalike. YAML 1.2 deliberately reserves unknown directives for future use and
directs processors to ignore them with a warning.

**What is going wrong.** The P16 repair correctly catches unsupported `%YAML`
versions, but it treats every parser warning whose code is `BAD_DIRECTIVE` as an
unsupported `%YAML` directive. The same library code is also used for a reserved
directive such as `%FOO bar`. That document has no parse error, remains effective
YAML 1.2, and has a valid root mapping and counts, but C3 blocks it and falsely
says it declared `%YAML`.

**Is the product affected? No.** The changed module is test support and no live
plan currently contains a reserved directive. **Is the governance checker
affected? Yes, measured.** It rejects a construction that the named YAML 1.2
grammar explicitly tells processors to preserve by ignoring the unknown
directive with a warning.

**Options and costs.** The recommended fix is to distinguish the parser's
unsupported-`%YAML` warning from its reserved-directive warning using structured
parser output or directive tokens, not a list of version spellings and not the
human-readable warning message. Keep `%YAML 1.3` and `%YAML 2.0` blocking, while
adding clean controls for `%FOO bar` both alone and beside an explicit
`%YAML 1.2`; the paired case prevents `directives.yaml.explicit` from becoming a
false proxy. The alternative is to declare that C3 intentionally rejects all
reserved directives, but that creates a repository-private departure from §2.2's
“no declared departures” contract and should not happen accidentally through an
overloaded warning code.

**Recommendation.** Fix P19 now, update plan §2.3 and §2.11 with the repair's
true boundary, and run the same focused and complete gates. Leaving it unchanged
would preserve P16's fail-closed behavior but would make the parser delegation
strictly narrower than the grammar it claims to implement.

## Confidence and method

**Confidence: high on P19 and on the P16–P18 closure checks; medium on how likely
a future plan-producing tool is to emit a reserved directive.** The false blocker
and pre-fix contrast are deterministic. Reachability concerns a future document,
not current repository content.

### Material read

- The commission in full; `docs/governance/OPERATING_AGREEMENT.md` §§3.1,
  3.4–3.6; the complete current C3 plan; both earlier implementation reviews;
  and the current C3 source, grammar cases, and known-open controls.
- The complete `e5d1874..1d68876` repair diff and commit message. The commit
  changes exactly the plan, checker, and checker spec named by the commission.
- `yaml` 2.9.0's installed `errors.d.ts`, `doc/directives.js`, composer, scalar,
  alias, collection, and indentation warning paths. The directive implementation
  maps both unsupported numeric `%YAML` versions and unknown reserved directives
  to `BAD_DIRECTIVE`, while retaining different parser state.
- The official [YAML 1.2.2 §6.8 directive
  grammar](https://yaml.org/spec/1.2.2/#68-directives), including its reserved
  directive production and `%FOO` example, and the `yaml` 2.x documentation for
  errors, warnings, and parse options.

### Required reruns

1. `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 0**: 1 file,
   **119/119 tests passed**, including the live-plan control.
2. Deeper repeat — **N/A, not invented**. The load-bearing checker is a
   deterministic pure unit mechanism over static strings; there is no timing,
   process, or intermittent surface for a higher repeat count to attack.
3. `./tools/checks` — **exit 0 on the first run**: all four commands completed;
   formatting and type-check passed; Vitest **1532/1532 tests in 105 files**. A
   separate exit-0 JSON-format ESLint run measured **0 errors / 145 warnings**.

### Independent evidence runs

- Fail-against-`60f191e`: a disposable detached worktree, the new 119-test spec
  copied in, and `node_modules` symlinked from the reviewed checkout, exactly as
  commissioned. Focused Vitest returned **exit 1 as expected: 2 failed / 117
  passed**, with the failures exactly the new `%YAML 1.3` and `%YAML 2.0`
  controls. All 119 tests ran; worktree cleanup returned exit 0.
- A 27-case exit-0 Vite-SSR/parser probe covered no directive; supported 1.1 and
  1.2; unsupported 1.0, 1.3, 2.0, 1.20 and `01.2`; malformed or non-numeric
  `next`, empty, `1.2.0`, `v1.2`, `1`, `-1.2`, `.2`, `1.`, and extra-part
  forms; a reserved directive with one and two parameters; explicit 1.2 plus a
  reserved directive; a warning-plus-error document; and representative
  `BAD_ALIAS` and `TAG_RESOLVE_FAILED` paths.
- Every unsupported numeric version in that matrix produced `BAD_DIRECTIVE` as
  a warning and was blocked. Every malformed/non-numeric version produced a
  parser error and was blocked. No spelling in the commissioned version class
  bypassed C3.
- `%YAML 1.3` plus a malformed mapping produced both a `BAD_DIRECTIVE` warning
  and a `BAD_INDENT` error. C3 reported the parse error, confirming that the
  errors-first branch order preserves the more specific failure while still
  blocking.
- `%FOO bar` produced **no errors**, one `BAD_DIRECTIVE` warning whose parser
  message identifies an unknown directive, effective version 1.2, a valid root
  mapping, and valid governed counts. Current C3 nevertheless emitted
  `C3-NOCANONICAL` and said that a `%YAML` directive was unsupported. The same
  probe in a disposable `60f191e` worktree emitted no C3 finding, proving the
  false blocker was introduced by the P16 repair.
- `%YAML 1.2` followed by `%FOO bar` followed the same false-blocking path. This
  rules out `doc.directives.yaml.explicit` as a sufficient discriminator: it is
  true for that valid paired construction as well as for unsupported `%YAML`
  versions.
- A direct probe of `yaml`'s public `Parser` API returned separate `directive`
  tokens with exact `source` and `offset` fields for `%YAML 1.3`, `%FOO bar`, and
  their paired form. This establishes a structured signal exists; it does not
  pre-approve a particular repair.
- The installed source sweep found other warning-producing paths for
  `BAD_ALIAS`, `TAG_RESOLVE_FAILED`, `BAD_COLLECTION_TYPE`, and compatibility
  `BAD_INDENT`. The targeted probes found no second actionable bypass: an
  unresolved tag on a governed value becomes a string or collection and is
  rejected by the value check; the same warning on an ungoverned value remains
  outside the explicitly governed set; numeric aliases with colon-ending anchor
  names remain numeric. Rejecting every warning would therefore add false
  blockers rather than safely close the class.
- Plan §2.3 item 5 and source lines 445–484 have the same order: parser errors,
  `BAD_DIRECTIVE`, effective version, root mapping, then key/value checks. The
  recipe accurately describes the implementation, although P19 shows that both
  now encode the same overbroad predicate.
- A case-insensitive plan search for “production code”, “code exists”, and
  “checker implementation” found no remaining P18 category error. The earlier
  uses are historical statements or quotations explicitly labelled as
  corrected; the live closing note now accurately names checker implementation.
- The P16 repair contains no hand-written version table. It delegates to a
  parser warning code. P19 is not a table regression; it is the distinct problem
  that the chosen structured code combines two contract-different meanings.

### What I did not check

- **UNVERIFIED:** Electron e2e, Electron integration, live Home Assistant, and a
  packaged application. This remains a unit-only test-support change and no
  Electron process was started.
- **UNVERIFIED:** every YAML construction outside the 27-case directive/warning
  probe and the committed 119-test population. The warning-source read was
  complete for installed `yaml@2.9.0`; the dynamic population was deliberately
  bounded.
- **UNVERIFIED:** behavior under dependency versions other than the installed
  lockfile's `yaml@2.9.0`.
- The fail-against-old run used the commissioned `node_modules` symlink. I did
  not repeat an exact-lock `npm ci` comparison this round; no dependency file is
  changed by `1d68876`.
- No snapshots or baselines were re-recorded. No PR, board, product, plan,
  implementation, or MemPalace state was changed.

## Claim ledger

| Claim                                                                                                                | Tag           | Evidence                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed head is `1d68876`, and its repair diff is confined to the three commissioned paths.                     | **MEASURED**  | `git rev-parse HEAD`; `git diff-tree`; complete `e5d1874..1d68876` diff inspection.                                                                           |
| The focused spec and complete repository gate pass at the reviewed tree.                                             | **MEASURED**  | Required reruns: 119/119 focused and 1532/1532 full gate, both exit 0; separate ESLint count 0/145.                                                           |
| Both new controls discriminate against `60f191e`, with every prior control unchanged.                                | **MEASURED**  | Detached-worktree run: exactly 2 failed / 117 passed, all 119 executed.                                                                                       |
| P16's tested unsupported and malformed version forms no longer bypass C3.                                            | **MEASURED**  | 27-case parser/checker probe over numeric, non-numeric, empty, precision, leading-zero, missing-component, and extra-part forms.                              |
| Errors before warnings is the useful branch order when both channels are populated.                                  | **MEASURED**  | Mixed `%YAML 1.3` plus malformed-map case reported the concrete `BAD_INDENT` error and blocked.                                                               |
| `BAD_DIRECTIVE` does not mean only “unsupported `%YAML` version” in `yaml@2.9.0`.                                    | **MEASURED**  | Installed `Directives.add()` source plus `%FOO` probe: same code, no error, effective 1.2.                                                                    |
| A reserved `%FOO` directive is part of YAML 1.2's directive grammar and should be ignored with a warning.            | **MEASURED**  | YAML 1.2.2 §6.8 normative text and Example 6.13; `yaml@2.9.0` follows it by warning and preserving the document.                                              |
| Current C3 falsely blocks `%FOO`, while `60f191e` remained clean for the same valid totals document.                 | **MEASURED**  | Current and detached-old Vite-SSR probes over byte-identical YAML payloads.                                                                                   |
| Rejecting all parser warnings is not a safe repair.                                                                  | **MEASURED**  | Warning-source sweep and representative probes show permitted numeric aliases and ungoverned tagged content can warn while satisfying the stated C3 contract. |
| Structured directive-token discrimination is preferable to matching warning text or enumerating bad version strings. | **JUDGEMENT** | The warning code is overloaded and the message is human-facing; parser tokens retain directive identity without recreating a version grammar.                 |
| A reserved directive is plausible future tool output but is not present in the current governed plan.                | **JUDGEMENT** | YAML reserves the syntax for future use; repository search/current live-plan control contains none.                                                           |
| P17's implementation recipe and P18's scope wording are now accurate.                                                | **MEASURED**  | Line-by-line source/plan comparison and case-insensitive terminology search.                                                                                  |

### Weakest claims

- P19's semantics are high-confidence, but its future frequency is judgement. A
  repository rule explicitly forbidding reserved directives could reduce its
  practical urgency; no such rule exists, and the current plan instead says
  there are no YAML departures.
- The recommended structured-token fix is architectural guidance, not a tested
  patch. The author should verify the smallest stable public `yaml` API that
  preserves directive identity before committing to an implementation.
- The warning-source sweep is complete for installed `yaml@2.9.0`, but the
  dynamic warning matrix is representative. It does not prove that no custom-tag
  combination outside the attacked cases could expose a separate contract issue.

## Findings

### P19 — SEV-2 — `BAD_DIRECTIVE` conflates an invalid version with a valid reserved directive

**Claim.** The P16 repair blocks valid YAML 1.2 reserved directives because it
uses the parser's broad warning code as if it uniquely meant “unsupported
`%YAML` version.”

**Evidence.** At `tests/support/planConsistency.ts:460-471`, any warning whose
code is `BAD_DIRECTIVE` takes a branch whose message says the payload declared an
unsupported `%YAML` directive. In installed `yaml@2.9.0`,
`dist/doc/directives.js` uses that same warning path for both an unsupported
numeric `%YAML` version and an unknown directive. YAML 1.2.2 §6.8 defines unknown
directives as reserved syntax and instructs processors to ignore them with a
warning; Example 6.13 uses `%FOO bar baz`.

Concrete input:

```yaml
# plan-running-totals
%FOO bar
---
review_rounds_complete: 7
reviewer_findings: 30
findings_after_round_one: 24
```

`parseDocument` returns no errors, a `BAD_DIRECTIVE` warning reading “Unknown
directive %FOO,” effective YAML version 1.2, and the expected mapping. Current
`checkPlan` emits `C3-NOCANONICAL` and incorrectly reports an unsupported `%YAML`
directive. The identical payload is clean at `60f191e`. Pairing `%FOO` with an
explicit valid `%YAML 1.2` also blocks.

**Mitigation gap.** The `%YAML 1.3` and `%YAML 2.0` controls prove the new branch
catches the demonstrated P16 bypass, but they cannot detect that its predicate
also captures a contract-valid producer of the same warning code. Checking
`doc.directives.yaml.explicit` is insufficient because it is also true when a
valid `%YAML 1.2` and a reserved directive occur together. Rejecting every
warning would be broader still and would conflict with other parser-supported
warning cases.

**Reachability and impact.** No reserved directive exists in the live plan, so
today's artifact and Electron product are unaffected. Reserved directives exist
specifically for future extensions and can plausibly arrive in generated or
copied YAML. Such a document would be unable to pass the repository gate despite
conforming to the grammar C3 names. This future, non-current reachability caps
the finding at SEV-2.

**Fix.** Keep delegating directive syntax to `yaml`, but distinguish the warning
attached to an unsupported `%YAML` token from the warning attached to a reserved
directive through structured parser output. Do not match the human-readable
warning string and do not enumerate version spellings. Add a passing `%FOO bar`
control and a passing `%YAML 1.2` plus `%FOO bar` control; prove both fail against
`1d68876`. Retain the 1.3/2.0 blockers, and amend plan §2.3 so its recipe states
the narrower predicate rather than “any `BAD_DIRECTIVE`.”

**Class swept.** Every installed warning producer was inspected. Dynamic probes
covered the unsupported/malformed `%YAML` partitions, standalone and paired
reserved directives, mixed error-plus-warning ordering, ambiguous anchors and
aliases, and unresolved tags on governed and ungoverned values. I found no
second actionable defect in that bounded population.

## Disagreements and closures

- **P16 — REGRESSED at one boundary.** Its original fail-open is closed for the
  attacked version matrix and the two controls discriminate honestly. The new
  branch introduces P19 because `BAD_DIRECTIVE` has a second, valid producer.
- **P17 — CLOSED for fidelity, implicated by P19.** The normative recipe now
  matches the code's exact order. It must change again only because it faithfully
  records the same overbroad warning predicate.
- **P18 — CLOSED.** The closing note and remaining terminology accurately
  distinguish checker implementation from product source.
- **Commission weakest claim 1 — upheld.** The independent old-head run returned
  exactly 2 failures / 117 passes.
- **Commission weakest claim 2 — rejected as stated.** `BAD_DIRECTIVE` is
  sufficient to find all attacked unsupported-version warnings, but it is not a
  safe acceptance predicate because reserved directives share the code.
- **Commission weakest claim 3 — partly upheld.** The branch order is correct for
  mixed errors and warnings; the incompleteness is in the warning predicate, not
  the order.
- **No hand-written version table — upheld.** The repair uses one parser code and
  no literal bad-version list. P19 asks for a more precise parser-derived signal,
  not such a table.
- **Other warning codes — clean in the attacked population.** The governed
  key/value and root-shape checks reject their relevant effects, while warnings
  confined to deliberately ungoverned values do not silently alter a governed
  total.
- **Gate claim — reproduced.** Focused and complete gates both passed on their
  first runs; the unrelated `DeployDialog` timeout seen in the prior review did
  not recur.

## MemPalace drawer candidates

No MemPalace write was made because the server transport is unavailable. Under
MP-LEASE these candidates are routed to the write-enabled author with
`added_by="codex"`.

1. **Wing:** `practice` · **Type:** verification rule · **Candidate:** “A parser
   warning code may conflate contract-invalid input with specification-valid
   recovery. Before making the code blocking, enumerate every producer and
   discriminate through structured parser state or tokens — never warning text
   or a literal table.” Add its one-line entry to the `practice` index in the
   same write.
2. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “At PR #154
   commit `1d68876`, C3's new blanket `BAD_DIRECTIVE` check blocks `%FOO bar`
   even though YAML 1.2.2 §6.8 says reserved directives are ignored with a
   warning; `yaml@2.9.0` returns no errors and effective version 1.2, while the
   same payload is clean at `60f191e` (review finding P19).”
