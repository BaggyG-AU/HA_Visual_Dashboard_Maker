Author: Claude Sonnet 5
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU

CHANGES-REQUIRED

# Third follow-up implementation review — P19 repair (PR #154)

Reviewed branch `feature/plan-consistency-checker` at
`b817a42d23b6f84f09599f5f6c830f7786f0bd65`, answering the prior review at
`c9f12b0`. This document is the only repository change made by this review.

## Owner Summary Table

| Ref | Plain-English problem                                                                                                               | Severity | Blocks: scope                                 | Fix complexity (1–5) | Recommendation                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------- | -------------------: | ------------------------------- |
| P20 | A second `%YAML 1.2` directive can erase an earlier `%YAML 1.1` from the parser's final state, so C3 accepts the forbidden version. | SEV-2    | The promised totals-document dialect          |                    2 | Fix now                         |
| P21 | Repeated `%TAG` handles are specification errors, but the selected parser and C3 silently accept them without a declared residual.  | SEV-3    | Accuracy of the YAML-validity contract        |                    3 | Decide and make explicit now    |
| P22 | The repair calls UTF-16 code-unit offsets a “byte range” and implements its half-open span with a closed upper bound.               | SEV-3    | Accuracy of the normative recipe and comments |                    1 | Correct with the behavioral fix |

## Owner Decision Brief

**What this protects.** C3 promises one valid YAML 1.2 totals document. The P19
repair correctly stops an unrelated reserved directive warning from being
misreported as an unsupported `%YAML` version, but the directive sweep shows
that final parser state is still lossy when the same directive is declared more
than once.

**What is going wrong.** Installed `yaml@2.9.0` processes each directive by
overwriting its stored state. It does not report the YAML 1.2 error for a repeated
`%YAML` directive. Consequently `%YAML 1.1` followed by `%YAML 1.2` leaves no
error or warning and exposes only final version 1.2; C3 accepts the block even
though the first declaration is one that C3 blocks when it appears alone. The
same implementation silently overwrites a repeated `%TAG` handle. Separately,
the new plan and source comments describe JavaScript code-unit offsets as byte
offsets, while the predicate expresses a half-open source span with a closed
upper bound.

**Is the product affected? No.** This remains test-support code, and the live
plan is clean. **Is the governance checker affected? Yes, measured.** A future
canonical block can hide a forbidden 1.1 declaration behind a later 1.2
declaration and pass C3.

**Options and costs.** The direct P20 repair is small: retain the parser-token
correlation, reject more than one CST `%YAML` directive, and keep the existing
warning and effective-version checks. Add red-against-current controls for
`1.1 → 1.2` and duplicate `1.2`, plus opposite-order and unsupported-version
conformance controls. P21 requires an explicit boundary decision. If “valid
YAML 1.2” includes directive uniqueness, use parser-backed validation that
reports duplicate `%TAG` handles; do not grow a private directive parser. If the
locked library's behavior is the intended authority, declare and pin that
residual instead of continuing to say “no declared departures.” Correct the
offset terminology in the same pass.

**Recommendation.** Fix P20 before approval, make the P21 boundary deliberate,
and correct P22. P19 itself is closed for the attacked warning-correlation class;
the blocking defect is the separate normalisation channel that the required
multiple-directive sweep exposed.

## Confidence and method

**Confidence: high on P20, the P19 closure, and P22; high on P21's measured
parser behavior, medium on which contract boundary the owner wants.** Every
reported behavior is deterministic under the installed lockfile. P21's required
disposition depends on whether “as implemented by `yaml` 2.x” is intended to
override the adjacent “valid YAML” and “no declared departures” wording.

### Material read

- The commission in full; `docs/governance/OPERATING_AGREEMENT.md` §§3.1 and
  3.4–3.6; `ai_rules.md` §§11–12; the complete current C3 plan; the prior
  follow-up review; and the changed checker and grammar controls.
- The complete `c9f12b0..b817a42` diff and commit message. The repair changes
  exactly the plan, checker, and checker spec named by the commission.
- Installed `yaml@2.9.0`'s parser, composer, CST declarations, node-range
  declarations, and `Directives.add()` implementation. The composer derives
  warning positions from the same directive token before adding the local
  `0`/`6` offset.
- The official [YAML 1.2.2 §6.8 directive
  grammar](https://yaml.org/spec/1.2.2/#68-directives), including its explicit
  errors for repeated `%YAML` declarations and repeated `%TAG` handles.

### Required reruns

1. `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 0 on the first
   run**: 1 file, **122/122 tests passed**, including the live-plan control.
2. Deeper repeat — **N/A, still not invented**. The checker is a deterministic
   pure unit mechanism over static strings; this repair adds no timing, process,
   or intermittent surface for repetition to test.
3. `./tools/checks` — **exit 0 on the first run**: 4/4 commands completed;
   Prettier and type-check passed; ESLint reported **0 errors / 145 warnings**;
   Vitest reported **1535/1535 tests passed in 105 files**.

### Independent evidence runs

- Fail-against-`c9f12b0`: a disposable detached worktree, the current 122-test
  spec copied in, and `node_modules` symlinked from the reviewed checkout,
  exactly as commissioned. Focused Vitest returned **exit 1 as expected: 2
  failed / 120 passed**. The failures were exactly standalone `%FOO` and
  `%YAML 1.2` plus `%FOO`; `%YAML 1.3` plus `%FOO` and the other 119 tests
  passed. The disposable worktree was removed.
- A 24-construction Vite-SSR/parser probe covered adjacent reserved, supported,
  and unsupported directives in both orders; two reserved directives around a
  supported directive; blank, comment, CRLF, astral-character, and BOM prefixes;
  malformed and valid `%TAG`; repeated `%YAML` and `%TAG`; missing and
  unsupported YAML versions; and malformed `%TAG` handles/prefixes.
- Adjacent directive tokens did not overlap or abut. For `%YAML 1.3` followed
  immediately on the next line by `%FOO bar`, the first token span was
  `[22,31)` and the second began at 32; warning starts 28 and 32 correlated to
  their own tokens. Reversing the order produced the corresponding 22 and 37
  warning starts. C3 blocked only because the `%YAML` warning was present.
- Blank lines, a comment containing an astral character, CRLF, and a BOM did not
  disturb correlation. The unsupported version remained blocked in every
  canonical-home shape. A BOM at absolute YAML-document start was also handled
  by the parser, but cannot itself precede the required exact first content line
  of a canonical home; that variant was therefore parser-only evidence.
- `%TAG` with zero, one, or three arguments produced `BAD_DIRECTIVE` as an
  **error**, not a warning, and C3 blocked through `doc.errors` before consulting
  `unsupportedYamlVersionWarned`. A valid two-part `%TAG` produced no diagnostic
  and stayed clean. There is no warning-producing `%TAG` branch in the installed
  `Directives.add()` implementation.
- `%YAML` with no version produced a `BAD_DIRECTIVE` error beginning at the CST
  token's offset and was blocked by the errors-first branch. `%YAML 1.3`
  produced a `BAD_DIRECTIVE` warning beginning six character positions into its
  token and was blocked by the new helper. If supplied to the same range test,
  both positions are inside their `%YAML` token; in the real flow only warnings
  are passed to the helper.
- Unsupported `1.3` followed by supported `1.2`, and the reverse order, both
  stayed blocked because the unsupported declaration retains its warning.
  Supported `1.2` followed by `1.1` stayed blocked because final effective state
  is 1.1. **The opposite `1.1` followed by `1.2` returned no errors, no warnings,
  final effective version 1.2, and no C3 blocker.** Duplicate `1.2` was likewise
  accepted without diagnostics.
- Repeating the same `%TAG !e!` handle, with either the same or a different
  prefix, also returned no diagnostics and no C3 blocker. Two distinct handles
  were clean as expected. Unused arity-two forms whose handle lacks the required
  exclamation mark or whose prefix contains a malformed percent escape were
  likewise accepted by `yaml@2.9.0`; this confirms the parser-library boundary
  is broader than the exact redeclaration case.
- The helper contains no warning-message match and no version table. Its only
  semantic discriminator is the CST token-name test
  `/^%YAML(?:\s|$)/`; version validity remains delegated to the parser's
  diagnostics and effective state.
- The astral-prefix case placed the directive at JavaScript offset 37 while its
  UTF-8 byte offset was 39. The helper correctly used the former, proving the
  mechanism is character-offset based rather than byte based.

### What I did not check

- **UNVERIFIED:** Electron e2e, Electron integration, live Home Assistant, and a
  packaged application. This is a static unit-only test-support repair and no
  Electron process was started.
- **UNVERIFIED:** every YAML construction outside the bounded directive matrix
  and the committed 122-test population. The relevant installed
  `Directives.add()` branches were read completely; this is not a proof over a
  future parser version.
- **UNVERIFIED:** behavior under dependency versions other than the installed
  lockfile's `yaml@2.9.0`.
- The fail-against-old run used the commissioned `node_modules` symlink. I did
  not run `npm ci` at `c9f12b0`; the repair changes no dependency file.
- No snapshots or baselines were re-recorded. No PR, board, product, plan,
  implementation, or MemPalace state was changed.

## Claim ledger

| Claim                                                                                                        | Tag           | Evidence                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed head is `b817a42`, and its diff is confined to the three commissioned paths.                    | **MEASURED**  | `git rev-parse HEAD`; `git diff --name-status c9f12b0..HEAD`; complete diff and commit-message inspection.                                                  |
| The focused spec and complete repository gate pass at the reviewed tree.                                     | **MEASURED**  | Required reruns: 122/122 focused and 1535/1535 full gate, both first-run exit 0; full gate lint count 0/145.                                                |
| Exactly two new controls fail against `c9f12b0`, while the mixed-invalid control and prior 119 stay green.   | **MEASURED**  | Detached-worktree focused run: exactly 2 failed / 120 passed, all 122 executed.                                                                             |
| P19 now distinguishes reserved-directive warnings from unsupported-version warnings in the attacked matrix.  | **MEASURED**  | Adjacent/mixed directive probes in both orders plus the three committed controls.                                                                           |
| Current warning starts correlate to the correct CST directive token under the attacked prefixes and offsets. | **MEASURED**  | 24-construction parser/checker matrix; composer source at `dist/compose/composer.js:142-147`.                                                               |
| A second `%YAML 1.2` can hide an earlier `%YAML 1.1` from every current C3 decision channel.                 | **MEASURED**  | Current probe: zero diagnostics, final version 1.2, no `C3-NOCANONICAL`; `Directives.add()` overwrites state at `dist/doc/directives.js:76-85`.             |
| Repeated `%YAML` declarations are invalid even when both name 1.2.                                           | **NORMATIVE** | YAML 1.2.2 §6.8.1 and Example 6.15.                                                                                                                         |
| Repeated `%TAG` handles are invalid, but `yaml@2.9.0` and C3 accept them.                                    | **MEASURED**  | YAML 1.2.2 §6.8.2 and Example 6.17; current parser/checker probes; assignment without a redeclaration guard at `dist/doc/directives.js:66-74`.              |
| P21 requires an explicit owner boundary rather than silently growing a private directive parser.             | **JUDGEMENT** | §2.1 requires valid YAML, §2.2 says both “as implemented by `yaml` 2.x” and “no declared departures”; the installed library does not enforce the full rule. |
| The helper uses JavaScript code-unit offsets and half-open source spans, not closed byte ranges.             | **MEASURED**  | Astral-prefix offset comparison; installed source uses `offset + source.length`; installed node declarations call parser ranges character offsets.          |
| P20 is reachable in a future canonical block but absent from the live plan.                                  | **JUDGEMENT** | Constructed accepted block plus current live-plan control and repository search.                                                                            |

### Weakest claims

- P21's parser behavior is high-confidence; its classification is the weakest
  judgement. The phrase “as implemented by `yaml` 2.x” can be read as accepting
  library quirks, while “valid YAML” and “no declared departures” point the
  other way. The gap is that no text makes this choice deliberate.
- The 24-construction correlation matrix and installed source establish the
  current producers, not a mathematical proof over every future CST grammar or
  dependency release. That is why P22 asks for accurate invariants, not a claim
  that all future positions are safe.
- P20 has no current live-plan occurrence. Its impact is a future governance
  false accept, not an application runtime defect; this caps it at SEV-2.

## Findings

### P20 — SEV-2 — A later `%YAML 1.2` masks an earlier forbidden `%YAML 1.1`

**Claim.** C3 accepts a canonical block containing a `%YAML 1.1` declaration
when a second `%YAML 1.2` declaration follows it, because the parser overwrites
its effective-version state and emits no diagnostic for redeclaration.

**Evidence.** `node_modules/yaml/dist/doc/directives.js:76-85` sets
`yaml.explicit` and assigns `yaml.version` on every supported directive without
checking whether one was already seen. The composer calls that method for every
CST directive token. YAML 1.2.2 §6.8.1 says more than one `%YAML` directive in
one document is an error even when both occurrences have the same version.

Concrete input:

```yaml
# plan-running-totals
%YAML 1.1
%YAML 1.2
---
review_rounds_complete: 7
reviewer_findings: 30
findings_after_round_one: 24
```

At `b817a42`, `parseDocument` returns zero errors and zero warnings, exposes
effective version 1.2, and `checkPlan` emits no `C3-NOCANONICAL`. Reversing the
versions blocks through final state, while replacing the first directive with
unsupported `1.3` blocks through its retained warning. Duplicate `%YAML 1.2`
also passes, despite the specification's explicit same-version example.

**Mitigation gap.** The three new P19 controls prove that warning-to-token
correlation distinguishes `%FOO` from `%YAML 1.3`. They cannot detect a
declaration that produces no warning or error and is later erased from
`doc.directives.yaml.version`. The existing single-`%YAML 1.1` control also
cannot detect the overwrite because no second declaration is present.

**Reachability and impact.** The live plan has no directive redeclaration and
the application does not execute this test-support code. A generated or edited
canonical block can nevertheless contain the concrete input above and pass the
governance check while declaring the explicitly forbidden dialect. This is a
reachable false accept in the promised checker contract, capped at SEV-2 because
it is absent from current governed content and has no product-runtime effect.

**Fix.** Use the already-collected CST directive tokens to enforce at most one
`%YAML` directive before accepting final effective state. Do not infer
multiplicity from the lossy `doc.directives` object and do not parse version
strings. Add failing-current controls for `1.1 → 1.2` and duplicate `1.2`, with
`1.2 → 1.1` and both placements of unsupported `1.3` as conformance controls.
Update §2.3 and the disposition history to state this additional parser-library
gap and its structured-token repair.

**Class swept.** Supported, unsupported, missing, and repeated YAML directives
were tested in both relevant orders, alone and adjacent to reserved directives,
under ordinary, blank/comment, CRLF, astral-character, and BOM prefixes. P21 is
the neighboring repeated-`%TAG` result from that same sweep.

### P21 — SEV-3 — `%TAG` validity is neither enforced nor declared residual

**Claim.** The contract requires a valid YAML document and declares no YAML
departures, but neither the selected parser nor C3 reports a repeated `%TAG`
handle; the plan does not say this is an accepted implementation residual.

**Evidence.** YAML 1.2.2 §6.8.2 states that repeating a `%TAG` directive for the
same handle in one document is an error. In installed
`node_modules/yaml/dist/doc/directives.js:66-74`, a two-part `%TAG` simply
assigns `this.tags[handle] = prefix`; there is no redeclaration check. Two
identical declarations and two declarations with the same handle but different
prefixes both produced zero errors, zero warnings, and no C3 blocker. Arity zero,
one, and three were correctly emitted as parser errors and blocked, so this is
not P19's warning discriminator mistaking `%TAG` for `%YAML`.

**Mitigation gap.** Plan §2.1 says the content must parse as one valid YAML
document; §2.2 selects YAML 1.2 as implemented by `yaml` 2.x and says there are
no declared departures. No control or residual states whether library-accepted
but specification-invalid directive forms are deliberately in or out. The
generic `doc.errors` branch cannot enforce a rule the selected parser does not
report.

**Reachability and impact.** No `%TAG` directive exists in the live plan, and a
redeclared handle need not change any governed total. The immediate risk is
contract and future-maintainer ambiguity, not product behavior or a demonstrated
count corruption. That narrower impact makes this SEV-3.

**Fix.** Decide the boundary explicitly. If YAML directive validity is promised,
use a parser-backed mechanism or dependency behavior that reports duplicate
handles and add a failing-current control. Do not build a partial `%TAG` grammar
from string splitting. If `yaml@2.9.0` behavior is intentionally authoritative,
declare and pin the residual and reconcile “no declared departures.”

### P22 — SEV-3 — The repair misstates code-unit offsets as a closed byte range

**Claim.** The normative plan and checker comments describe the correlation as a
byte range even though the code and parser operate on JavaScript code-unit
offsets; the predicate also gives a half-open source span a closed upper bound.

**Evidence.** Plan §2.3 item 5 and comments at
`tests/support/planConsistency.ts:399-402` and `:513-515` say “byte range.” The
predicate uses `t.offset + t.source.length`; those are JavaScript string offsets.
With an astral character in a preceding comment, the measured directive offset
was 37 code units but 39 UTF-8 bytes, and correlation correctly used 37.
Installed `yaml` node declarations describe parser ranges as character offsets
whose end positions are excluded. The implementation nevertheless writes
`w.pos[0] <= t.offset + t.source.length`, spelling a closed upper bound.

**Mitigation gap.** ASCII-only committed controls make byte and character counts
numerically identical, and every current `Directives.add()` warning start is
strictly inside its token, so they cannot expose the inaccurate invariant or the
closed-bound spelling. The astral-prefix probe confirms behavior remains correct
only because both producer and consumer use the same character-offset system.

**Reachability and impact.** No wrong attribution was reproduced: directive
tokens are separated by newline tokens, and all attacked current warning starts
fall strictly inside their own directive. This is an explanation/maintenance
defect rather than a current false accept or blocker, hence SEV-3. It could
mislead a future port or repair into converting one side to bytes.

**Fix.** Replace “byte range” with “half-open code-unit-offset span” in the plan
and source comments, spell it `[t.offset, t.offset + t.source.length)`, and use
`<` for the upper-bound comparison so the implementation expresses the same
invariant. An astral-prefix correlation control would pin the coordinate unit.

## Disagreements and closures

- **P19 — CLOSED in its tested warning class.** Standalone and paired reserved
  directives remain clean, unsupported YAML versions remain blocked, and every
  attacked warning start maps to the correct CST token.
- **P16 — CLOSED for unsupported numeric versions.** Unsupported versions in
  either repeated-directive order retain their warning. P20 is the separate
  supported-1.1 normalisation path, not a reopened warning path.
- **Commission weakest claim 1 — upheld exactly.** The independent old-head run
  returned 2 failures / 120 passes with the named two failures and conformance
  control.
- **Commission weakest claim 2 — partly upheld.** Correlation is correct for
  every installed `Directives.add()` warning producer and attacked prefix. The
  claim is rejected as worded because the positions are not bytes, the source
  span is not closed, and a bounded current-version sweep is not a proof over
  every future CST construction.
- **Commission weakest claim 3 — not broad enough.** The P19 predicate correctly
  ignores `%TAG`: malformed arity forms are errors and are blocked earlier, not
  warnings left open. But `%TAG` correctness is not wholly outside the declared
  document-validity contract; P21 records the unacknowledged parser residual.
- **Missing-version offset — closed.** `%YAML` at local offset 0 is a parser
  error and blocks before the warning helper; unsupported numeric versions at
  local offset 6 correlate and block through the helper.
- **No warning-message parsing or version table — upheld.** The helper reads
  warning code, position, and CST directive name only.
- **Gate and fail-against-old claims — reproduced.** Both required current-tree
  gates passed on their first runs, and the exact old-tree discrimination was
  observed.

## MemPalace drawer candidates

No MemPalace write was made because the server transport is unavailable. Under
MP-LEASE these candidates are routed to the write-enabled author with
`added_by="codex"`.

1. **Wing:** `practice` · **Type:** verification rule · **Candidate:** “When a
   parser exposes only final normalised state, sweep repeated declarations: a
   later valid declaration may erase an earlier invalid one without populating
   error or warning channels. Preserve or count structured source tokens before
   trusting final state.” Add its one-line entry to the `practice` index in the
   same write.
2. **Wing:** `practice` · **Type:** evidence hygiene · **Candidate:** “Name source
   coordinate units and interval boundaries exactly. Byte offsets, Unicode
   character/code-unit offsets, and closed versus half-open spans are different
   invariants even when ASCII fixtures make their values coincide.” Add its
   one-line entry to the `practice` index in the same write.
3. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “At PR #154
   commit `b817a42`, C3 accepts `%YAML 1.1` followed by `%YAML 1.2` because
   `yaml@2.9.0` overwrites final directive state without a redeclaration
   diagnostic (P20); repeated `%TAG` handles are likewise silently accepted and
   not declared as a residual (P21); the P19 correlation itself works in the
   attacked warning matrix.”
