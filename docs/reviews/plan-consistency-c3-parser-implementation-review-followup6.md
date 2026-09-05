Author: Claude Sonnet 5
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU

CHANGES-REQUIRED

# Sixth follow-up implementation review — P26–P28 repair (PR #154)

Reviewed branch `feature/plan-consistency-checker` at
`24fbc4552933a55ac61213043d8507e5a2f41d48`, treating `b6f84e7` and `24fbc45`
as the single repair delta answering the prior review at `f4574b7`. This
document is the only repository change made by this review.

## Owner Summary Table

| Ref | Plain-English problem                                                                                                                                                      | Severity | Blocks: scope                                           | Fix complexity (1–5) | Recommendation                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- | -------------------: | ----------------------------------------------------- |
| P29 | The new error filter calls every non-`YAML`/`TAG` substring a reserved name without first proving it is a legal directive name, so invalid VT/FF input now passes.         | SEV-2    | The promised totals-document YAML validity check        |                    4 | Resolve at the parser boundary or declare the gap     |
| P30 | Code and test comments say the CST tokenizer drops the trailing NBSP, but direct token inspection shows it preserves that character—the fact the repair itself relies on.  | SEV-3    | Accuracy and maintainability of the parser-boundary fix |                    1 | Correct the comments to match measured token behavior |
| P31 | The plan and test comment call comma, both brackets, and both braces “four flow indicators,” although that enumeration contains five and the YAML production defines five. | SEV-3    | Accuracy of the governed residual and its control       |                    1 | Change “four” to “five” in both places                |

## Owner Decision Brief

**What the repair closes.** The exact ASCII separator logic, the complete
recognized-name set, the `%TAG` arity self-correction, the broadened `%TAG`
residual, and the P23 rendered table row all withstand their commissioned
attacks. The seven controls discriminate against `cbae9e1` exactly as claimed;
the two self-correction controls discriminate against `b6f84e7` exactly as
claimed.

**What remains wrong.** `directiveName` extracts a substring but labels it the
grammar-defined “TRUE name.” That is only sound after the substring is known to
match `ns-directive-name ::= ns-char+`. U+000B VERTICAL TAB and U+000C FORM FEED
are ECMAScript-trimmable but are not YAML `c-printable`/`ns-char`. Installed
`yaml@2.9.0` reports each as a `BAD_DIRECTIVE` error. The new filter derives
`YAML<U+000B>` or `YAML<U+000C>`, mistakes it for a valid unrecognized name, and
suppresses the only blocking diagnostic. Both invalid documents now pass C3;
both blocked at `cbae9e1`. Two smaller documentation defects also remain: the
CST token actually retains trailing NBSP, contrary to the new code/test
comments, and the new P27 prose miscounts five flow indicators as four.

**Is the product affected? No.** The changed code is test support and none of
the constructions appears in the live plan. **Is the governance checker
affected? Yes, measured.** The repair regresses two specification-invalid
documents from blocked to accepted while claiming it excludes only valid
reserved directives.

**Options and costs.** Prefer a dependency version or parser-backed route that
can distinguish a valid `ns-directive-name` from an invalid character before
suppressing a diagnostic. If the chosen parser cannot expose that boundary,
the owner may explicitly declare and pin the upstream character-validation
limitation. A local solution must implement the complete applicable production,
not blacklist VT/FF or grow a table of observed strings. P30 and P31 are direct
wording repairs.

**Recommendation.** Do not approve yet. Close or explicitly disposition P29,
then correct P30 and P31. P26's intended printable trailing-name cases, P27's
implementation-boundary residual, and P28's rendered table repair are otherwise
closed.

## Confidence and method

**Confidence: high on all three findings and on the closure claims below;
medium on the best P29 remediation.** The defects are deterministic under the
locked dependencies. The remediation judgment is weaker because this review
did not install a newer YAML dependency, and a checker-local character
classifier could recreate the hand-parser class this project is avoiding.

### Material read

- The commission in full; `docs/governance/OPERATING_AGREEMENT.md` §§3.4–3.6;
  `ai_rules.md` §§11–12; the complete current C3 plan; the previous follow-up
  review; and the changed checker and test population.
- The complete combined `f4574b7..24fbc45` repair diff and both repair commits.
  The delta changes exactly the commissioned plan, checker, and checker spec:
  430 insertions and 102 deletions across three files. The broader
  `cbae9e1..24fbc45` history also contains the prior review document, as
  expected.
- Installed `yaml@2.9.0`'s complete `Directives.add()` switch and its only
  composer call site. Its full case list is `%TAG`, `%YAML`, then `default:`;
  there is no third recognized directive.
- Installed `marked@14.0.0`'s lexer output for plan §2.7 and all 13 plan tables.
- The official [YAML 1.2.2 specification](https://yaml.org/spec/1.2.2/),
  especially `c-printable`, white-space, flow-indicator, `ns-char`, and
  directive-name productions. Space and tab cannot occur inside one
  `ns-directive-name`; VT/FF are not `c-printable`; and the flow-indicator
  production has five alternatives.

### Required reruns

1. `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 0 on the first
   run**: 1 file, **143/143 tests passed**, including the live-plan control.
2. Deeper repeat — **N/A, still not invented**. The checker is deterministic
   pure unit logic over static strings; this repair introduces no timing,
   process, or intermittent mechanism for a repetition count to test.
3. `./tools/checks` — the first run reached the unit suite and returned **exit
   1** because the previously observed `DeployDialog.spec.tsx` “errors clearly
   when there is no config to deploy” test timed out at 5000 ms: **104/105
   files, 1555 passed / 1 failed**. ESLint was **0 errors / 145 warnings**;
   formatting and type-check were clean. The one permitted retry returned
   **exit 0**: all 4 commands passed, **105/105 files and 1556/1556 tests**;
   the same test passed in 3901 ms. No second retry was used.

### Independent evidence runs

- Fail-against-`cbae9e1`: a disposable detached worktree, the `b6f84e7`
  141-test spec copied in, and current `node_modules` symlinked, exactly as
  commissioned. Focused Vitest returned **exit 1 as expected: exactly 3 failed
  / 138 passed**. The failures were the trailing-NBSP and trailing-EM-SPACE
  cases plus real `%YAML 1.2` beside trailing NBSP. The other four new controls
  and all 134 older tests passed.
- Fail-against-`b6f84e7`: a disposable detached worktree with the current
  143-test spec and current `node_modules`. Focused Vitest returned **exit 1 as
  expected: exactly 1 failed / 142 passed**. The malformed real `%TAG e` case
  failed; the trailing-NBSP `%TAG` mirror passed on both sides.
- As a combined non-overlap cross-check, all 143 current tests at `cbae9e1`
  produced exactly **4 failed / 139 passed**: the three first-repair
  discriminators plus the malformed-`%TAG` self-correction discriminator.
  Every disposable worktree was removed.
- `directiveName`'s ASCII-space/tab “inside one name” concern is vacuous under
  the named grammar. `ns-directive-name` is `ns-char+`, while space and tab are
  excluded from `ns-char` and begin the parameter separator. Direct `%FOO BAR`
  and `%FOO<TAB>BAR` probes therefore produce name `FOO` plus a parameter, not
  a single name containing the separator.
- The full installed `Directives.add()` switch at
  `node_modules/yaml/dist/doc/directives.js:65-95` has only `%TAG` and `%YAML`
  cases. A package-source search found its composer call as the only producer
  of this directive diagnostic path. The literal `{YAML, TAG}` comparison is
  therefore complete for `yaml@2.9.0`.
- A trimmable character immediately after `%` does not expose a symmetric
  leading-edge bug. `%<NBSP>YAML 1.3` and `%<EM-SPACE>TAG e` are tokenized as
  directives with unrecognized names and remain clean with a warning. The
  composer's leading `trim()` stops at the initial `%` and cannot reach the
  inner character.
- In a three-directive document—trailing-NBSP `%YAML`, malformed real `%TAG e`,
  then valid `%YAML 1.2`—the checker derives exactly one true `%YAML` token and
  blocks through the malformed real `%TAG` error alone. Replacing `%TAG e` with
  trailing-NBSP `%TAG` makes the same document clean, isolating both error
  ownership and YAML cardinality.
- `marked` renders the P27 residual as a nested list of exactly five items:
  repeated handle, malformed handle, malformed percent escape, forbidden raw
  brace, and invalid global-prefix first character. The preceding
  “representative sample” text and the emphasized “not a claim that no sixth
  form exists” disclaimer both survive in rendered HTML.
- All 13 plan tables lex with every row matching its header width. The P23 row
  has exactly three cells; its disposition cell is 1669 characters and retains
  both the NBSP cause and “Four controls added.” P28 is closed.
- The implementation adds no known-good/known-bad directive-shape or version
  table. It continues to use YAML CST tokens and diagnostic positions; the only
  closed-set literal is the exact two-case switch mirror scrutinized above.
- The new P29 discriminator used the shipped `checkPlan`, not only the parser.
  `%YAML<U+000B>` and `%YAML<U+000C>` each retain the final code point in the
  CST token and produce a parser `BAD_DIRECTIVE` error, yet current C3 returns
  no blocker. The same probes at `cbae9e1` block. NBSP and EM SPACE are valid
  inverse controls and remain clean at the repaired head.
- A targeted invalid-character sweep covered every YAML-excluded C0/C1 code
  point, representative lone surrogates, and U+FFFE/U+FFFF as a suffix to
  `%YAML`. Current C3 accepted all 65 probes. Sixty-three were pre-existing
  `yaml@2.9.0` warning-only gaps; VT and FF are the two behavior regressions
  introduced by the new error suppression. The finding is scoped to those two
  regressions while making the wider dependency limitation explicit.
- Direct CST inspection returns `%YAML<U+00A0>` as six code points and
  `%TAG<U+00A0>` as five; the final NBSP is present. The composer trims its
  separate line string. This directly contradicts the new tokenizer comments
  but explains why `directiveName(token)` can recover the printable name.
- A wording sweep found exactly two current “four flow indicators” claims: the
  plan line split across 628–629 and the test comment split across 1124–1125.
  Each immediately enumerates comma, `[`, `]`, `{`, and `}`—five characters.

### What I did not check

- **UNVERIFIED:** Electron e2e, Electron integration, live Home Assistant, and
  a packaged application. This is a static unit-only test-support repair and no
  Electron process was started.
- **UNVERIFIED:** every possible YAML scalar, directive, or Unicode string
  outside the grammar-derived classes and committed 143-test population. The
  targeted 65-character sweep is evidence for the named boundary, not a
  replacement YAML conformance suite.
- **UNVERIFIED:** whether a newer `yaml` release fixes P29 or the broader
  character-validation limitation without other behavioral changes. No
  dependency was updated or installed.
- **UNVERIFIED:** GitHub's production renderer directly. P27/P28 were verified
  with this repository's installed GFM lexer, the same lexer used by C3.
- Historical runs used the commissioned/current `node_modules` symlink. I did
  not run `npm ci` at either old commit; neither repair changes a dependency
  file.
- No snapshots or baselines were re-recorded. No PR, issue, board, product,
  plan, implementation, dependency, or MemPalace state was changed.

## Claim ledger

| Claim                                                                                                    | Tag           | Evidence                                                                                           |
| -------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| The reviewed head is `24fbc45`; the two-commit repair changes only the three commissioned paths.         | **MEASURED**  | Full SHA, log, and complete `f4574b7..24fbc45` diff/name/stat inspection.                          |
| Focused tests pass; the full gate passes on its single allowed retry after one known timeout.            | **MEASURED**  | 143/143 focused; first gate 1555/1556, retry exit 0 with 1556/1556 in 105 files and lint 0/145.    |
| Exactly 3/141 new-at-`b6f84e7` controls fail at `cbae9e1`.                                               | **MEASURED**  | Detached-worktree focused run: 3 failed / 138 passed.                                              |
| Exactly 1/143 current control fails at `b6f84e7`; the combined old-head result is exactly four failures. | **MEASURED**  | Detached-worktree runs: 1/142 and cross-check 4/139.                                               |
| ASCII space/tab cannot occur inside one grammar-valid reserved directive name.                           | **NORMATIVE** | YAML 1.2.2 `ns-directive-name ::= ns-char+`; white-space and `ns-char` productions; direct probes. |
| `{YAML, TAG}` is the complete recognized-name set in installed `yaml@2.9.0`.                             | **MEASURED**  | Full `Directives.add()` switch and package call-site search.                                       |
| A trimmable character immediately after `%` is not reached by the composer's leading trim.               | **MEASURED**  | NBSP/EM-SPACE leading-position parser/checker probes.                                              |
| Mixed trim-mangled, malformed `%TAG`, and valid `%YAML 1.2` directives preserve ownership/cardinality.   | **MEASURED**  | Three-directive blocking probe plus reserved-`%TAG` inverse.                                       |
| P27's five-item list and non-exhaustiveness disclaimer survive GFM rendering.                            | **MEASURED**  | Recursive `marked.lexer` inspection and rendered-HTML text check.                                  |
| P28's repaired P23 row and every plan table retain the expected cell count and content.                  | **MEASURED**  | 13-table `marked` sweep; P23 three cells, full cause and controls present.                         |
| The repair does not introduce a hand-parsed directive-shape table.                                       | **MEASURED**  | Complete checker diff/source search and the installed dependency branch.                           |
| VT/FF are not legal directive-name characters, yet current C3 suppresses their parser errors.            | **MEASURED**  | YAML `c-printable`/`ns-char` productions; current and `cbae9e1` shipped-checker probes.            |
| The CST tokenizer preserves, rather than drops, a trailing NBSP.                                         | **MEASURED**  | Direct `Parser().parse()` source/code-point inspection for both `%YAML` and `%TAG`.                |
| The P27 plan/test prose miscounts the complete five-member flow-indicator production as four.            | **NORMATIVE** | YAML flow-indicator production and exhaustive source search of the two new claims.                 |

### Weakest claims

- P29's regression and reachability are high-confidence; the weakest claim is
  the safest repair. The installed dependency does not enforce the entire
  character grammar, so a local exception risks becoming another partial
  parser. This review therefore prefers a dependency/parser-backed resolution
  and leaves explicit residual declaration as the honest alternative.
- The targeted 65-character sweep is not claimed as a complete Unicode proof.
  Its purpose is to separate the two newly regressed ECMAScript-trim members
  from 63 pre-existing warning-only parser gaps. VT and FF alone are sufficient
  to disprove the repair's “unknown reserved directive” inference.
- GitHub rendering was not observed directly. The installed GFM lexer retains
  the five nested items, disclaimer, and corrected P23 cells; those checks are
  strong evidence for the Markdown claims but not a production-render capture.

## Findings

### P29 — SEV-2 — The error filter accepts invalid directive-name characters

**Claim.** `blockingDirectiveErrors` suppresses a parser error whenever its
owning token's extracted substring is not exactly `YAML` or `TAG`, but that
substring is not necessarily a valid `ns-directive-name`. The repair therefore
turns two invalid documents from blocked to accepted.

**Evidence.** `directiveName` at
`tests/support/planConsistency.ts:423-462` returns every character after `%` up
to ASCII space/tab and calls the result the grammar-defined “TRUE name.”
`blockingDirectiveErrors` at lines 504–546 suppresses the `BAD_DIRECTIVE` error
for every other returned string. YAML 1.2.2's `ns-directive-name` requires one
or more `ns-char` characters, ultimately constrained by `c-printable`. U+000B
VERTICAL TAB and U+000C FORM FEED are not in that production, even though
ECMAScript `trim()` removes both.

For each of these two concrete payload prefixes, the CST token retains the
final control character and `parseDocument` reports a `BAD_DIRECTIVE` error:

```text
%YAML<U+000B>
---

%YAML<U+000C>
---
```

The filter derives `YAML<U+000B>`/`YAML<U+000C>`, treats the parser error as
collateral to a valid reserved name, and returns no C3 blocker. Running the same
shipped-checker probes at `cbae9e1` blocks both through that parser error. Valid
NBSP and EM SPACE suffixes pass at the repaired head, isolating the missing
name-validity precondition rather than disputing P26's intended case.

**Mitigation gap.** The seven committed P26 controls partition recognized
versus unrecognized strings and malformed arity, but every unrecognized suffix
they expect to pass is itself a legal printable `ns-char`. They do not ask
whether the extracted candidate is a legal name before granting it
reserved-directive treatment. The source comments at lines 523–528 make the
same unsupported leap: “anything else” is called collateral and required to be
accepted.

**Reachability and impact.** A governed Markdown file can contain VT or FF in
its fenced YAML payload. The actual parser emits the blocking error and the
actual filter removes it; no hypothetical downstream is involved. The live
plan does not contain either character, but C3 now accepts specification-invalid
YAML it rejected before this repair. That is a checker behavior regression in
the promised dialect, SEV-2.

**Fix.** Establish that the complete candidate conforms to
`ns-directive-name` before treating a nonrecognized name as reserved. Prefer a
dependency/parser-backed boundary; otherwise explicitly disposition and pin
the upstream parser gap. Add VT and FF blocking controls plus a printable NBSP
passing inverse, and prove the blocking controls fail at `24fbc45`. Do not
special-case only the two observed code points or infer validity solely from
`name !== 'YAML' && name !== 'TAG'`.

**Class swept.** Every ECMAScript-trimmable suffix was partitioned against YAML
name validity: ASCII space/tab remain recognized separators and block; the
non-ASCII printable trim members remain valid reserved-name characters and
pass; VT/FF are the invalid intersection and regress. A wider targeted invalid
C0/C1/surrogate/noncharacter sweep identified the parser's pre-existing
warning-only limitation separately rather than misattributing it to this fix.

### P30 — SEV-3 — The repair falsely says the CST token drops trailing NBSP

**Claim.** The implementation and mirror test explain P26 using a CST
normalization that does not happen and that would make the implemented repair
impossible.

**Evidence.** The checker comment at
`tests/support/planConsistency.ts:438-456` says the CST tokenizer drops a final
NBSP/EM SPACE from `token.source`, says the token source “cannot be trusted,”
and says it was “already trimmed identically.” The `%TAG` mirror comment at
`tests/unit/planConsistency.spec.ts:893-900` repeats the drop claim. Direct
inspection with the installed `Parser` returns a six-code-point source for
`%YAML<U+00A0>` and a five-code-point source for `%TAG<U+00A0>`, including
U+00A0 in each. It is the composer line passed to
`Directives.add()`—not the CST token source—that is trimmed at
`node_modules/yaml/dist/doc/directives.js:63`.

**Mitigation gap.** The plan's P26 disposition at
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:994-996` correctly says the
raw token source contains no ASCII separator after `YAML`. The new code/test
comments contradict that governed account and were not checked against raw
token code points. More importantly, `directiveName(token)` can close P26 only
because the CST source retains the character; if the comment were true, it
would derive bare `YAML`/`TAG` and keep the error.

**Reachability and impact.** This does not change runtime behavior, but it is
the load-bearing explanation future maintainers will use when changing the
exception. It describes the trusted evidence source as lossy when it is the
preserved source that makes the repair work. That is a durable code/test
accuracy defect, SEV-3.

**Fix.** State that the CST token preserves the trailing character while the
composer independently trims the directive line before its switch. Remove the
“neither source can be trusted,” “tokenizer drops,” and “already trimmed
identically” claims from the checker and mirror test comments. Keep the plan's
existing raw-source account.

**Class swept.** Both repaired directive families were inspected. `%YAML` and
`%TAG` retain NBSP; `%YAML` also retains EM SPACE, VT, and FF. The false claim
is confined to the two new comments identified above.

### P31 — SEV-3 — The P27 repair counts five flow indicators as four

**Claim.** The broadened residual and its new control contain the same factual
miscount of the grammar production they cite.

**Evidence.** Plan §2.7 at
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:625-631` describes
`ns-tag-char` as `ns-uri-char` minus `!` and “the four flow indicators,” then
enumerates comma, `[`, `]`, `{`, and `}`. The mirror test comment at
`tests/unit/planConsistency.spec.ts:1121-1128` repeats the wording and the same
five characters. YAML 1.2.2's `c-flow-indicator` production has exactly those
five alternatives.

**Mitigation gap.** The rendered-list check proves that P27's five residual
examples survive Markdown, not that each example's normative explanation is
arithmetically correct. Prettier and the tests cannot detect this prose error.

**Reachability and impact.** The behavior control still uses comma and remains
a valid residual pin, so there is no checker regression. The governed plan and
the test's specification rationale both state a false grammar fact, which is
SEV-3 documentation accuracy.

**Fix.** Change “four” to “five” in the plan and test comment. No behavior or
test expectation needs to change.

**Class swept.** The complete new P27 plan section, its five controls, and all
current occurrences of the phrase were checked. Only these two matching claims
miscount the set; the actual enumerations are complete.

## Disagreements and closures

- **P26 — PARTLY CLOSED.** Its intended printable trailing-NBSP/EM-SPACE forms,
  malformed real `%YAML`, malformed real `%TAG`, mixed-document ownership, and
  cardinality controls all behave correctly. P29 rejects only the stronger
  inference that every other extracted substring is a grammar-valid reserved
  name.
- **P27 — CLOSED for residual scope and rendering; P31 remains as a wording
  correction.** The plan now states the implementation boundary, expressly
  disclaims exhaustiveness, renders five examples, and has five corresponding
  `KNOWN-OPEN:` controls. No private `%TAG` parser is requested.
- **P28 — CLOSED.** The P23 disposition renders as a complete three-cell row,
  and all 13 plan tables have consistent row widths.
- **Recognized-name-set weakest claim — upheld.** The full installed switch has
  exactly `%TAG` and `%YAML`; no third case exists.
- **“No third gap remains” weakest claim — disagreed.** VT/FF show that
  recognized-set membership is not the only precondition for safely
  suppressing the error; the extracted name must first be grammar-valid.
- **Two fail-against-old claims — upheld exactly and cross-checked.** The
  `cbae9e1` repair controls split 3/138, the `b6f84e7` self-correction controls
  split 1/142, and the combined old-head run produces exactly the union: 4/139.
- **ASCII separator inside one name — vacuous.** Space/tab ends the
  grammar-defined name, so it cannot simultaneously be inside that name.
- **Leading trim attack — clean.** The initial `%` prevents `trim()` from
  reaching a trimmable character immediately after it.
- **Three-directive attack — upheld.** The malformed real `%TAG` alone blocks;
  the trim-mangled reserved token does not inflate the one true `%YAML` count.
- **No hand-parser table — upheld.** The repair consumes dependency tokens and
  diagnostic positions and mirrors only the dependency's closed two-name
  switch. P29 arises from omitting a grammar-validity precondition, not from a
  table of known directive shapes.
- **Gate claim — upheld after one permitted retry, not on the first run.** The
  first full gate hit the known `DeployDialog` timeout; the retry passed all
  1556 tests and the complete 4-command gate.

## MemPalace drawer candidates

No reviewer write was made: under OA §3.5's reviewer-specific MP-LEASE workflow,
these candidates are routed to the write-enabled author with
`added_by="codex"`.

1. **Wing:** `practice` · **Type:** diagnostic-suppression rule · **Candidate:**
   “Before suppressing a parser diagnostic because a token appears to belong to
   an allowed fallback class, prove the token satisfies that class's complete
   grammar. A substring not in the recognized-name set is not automatically a
   valid reserved name.” Add its one-line entry to the `practice` index in the
   same write.
2. **Wing:** `practice` · **Type:** evidence-description rule · **Candidate:**
   “When a repair relies on raw token content to recover from later
   normalization, inspect and record the raw token directly. Do not describe
   the token as normalized away when the fix depends on it being preserved.”
   Add its one-line entry to the `practice` index in the same write.
3. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “At PR #154
   commit `24fbc45`, P26's intended cases and both fail-against-old claims pass,
   but its error filter newly accepts invalid trailing VT/FF because the
   extracted candidate is never validated as `ns-directive-name` (P29). CST
   source actually preserves trailing NBSP despite two comments saying it is
   dropped (P30), and P27's plan/test prose counts five flow indicators as four
   (P31). Focused 143/143; full gate 1556/1556 on the one permitted retry after
   the known `DeployDialog` timeout.”
