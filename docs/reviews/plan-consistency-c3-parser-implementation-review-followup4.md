Author: Claude Sonnet 5
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU

CHANGES-REQUIRED

# Fourth follow-up implementation review — P20–P22 repair (PR #154)

Reviewed branch `feature/plan-consistency-checker` at
`2142111843fd6bc3fad3493fa9fc89751eaa0884`, answering the prior review at
`8b0ed9f`. This document is the only repository change made by this review.

## Owner Summary Table

| Ref | Plain-English problem                                                                                                                        | Severity | Blocks: scope                                     | Fix complexity (1–5) | Recommendation                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- | -------------------: | ---------------------------------- |
| P23 | The helper uses JavaScript's broad `\s` as a YAML name separator, so valid reserved names beginning `YAML` plus NBSP/EM SPACE falsely block. | SEV-2    | The promised totals-document dialect              |                    2 | Fix now                            |
| P24 | The declared `%TAG` departure covers repeated handles only, while the parser also silently accepts invalid handle and prefix syntax.         | SEV-3    | Completeness of the owner-declared YAML departure |                    2 | Broaden and pin the ruling         |
| P25 | Plan §2.11e still calls the P19 token span a “byte range,” contradicting P22's correction elsewhere in the same plan.                        | SEV-3    | Accuracy and internal consistency of the plan     |                    1 | Correct with the behavioral repair |

## Owner Decision Brief

**What this protects.** The P20 repair correctly blocks any cardinality above
one and does so before trusting lossy final parser state. The remaining blocking
issue is one lexical boundary earlier: deciding which CST tokens are actually
the parser's `%YAML` directive rather than reserved directive names that happen
to begin with those four letters.

**What is going wrong.** `yamlDirectiveTokens` uses
`/^%YAML(?:\s|$)/`. JavaScript `\s` includes non-breaking space U+00A0 and EM
SPACE U+2003, while YAML's structural whitespace and the installed parser's
directive splitter use only ordinary space and tab. Under YAML 1.2 these
non-ASCII characters may belong to the directive name itself. The parser
therefore correctly treats `%YAML<U+00A0>1.3` as an unknown reserved directive,
emits one warning, and keeps the valid document. C3 reclassifies the CST token
as `%YAML` and falsely blocks it. P21's new residual also names only repeated
`%TAG` handles, although `yaml@2.9.0` silently accepts other invalid `%TAG`
grammar, and one stale “byte range” remains in the P19 disposition row.

**Is the product affected? No.** This is test-support code and none of the
attacked forms occurs in the live plan. **Is the governance checker affected?
Yes, measured.** A specification-valid reserved directive is rejected through
the same false-blocking class P19 was intended to close.

**Options and costs.** P23 can be repaired without parsing versions or warning
messages: use YAML/the installed parser's actual separation boundary—space or
tab—when selecting `%YAML` CST tokens. Add clean NBSP and EM SPACE reserved-name
controls, retain a blocking tab-separated `%YAML 1.3` control, and include a
real `%YAML 1.2` beside the reserved-name case so P20 cardinality cannot mask the
regression. For P24, the existing owner rationale points toward broadening the
declared residual to the `%TAG` syntax that the selected parser does not report,
with representative invalid-handle and invalid-prefix pins; if that broader
departure is not intended, enforcement needs a parser-backed design and a new
owner decision. P25 is a wording-only sweep fix.

**Recommendation.** Fix P23 before approval, broaden or explicitly delimit P21's
owner ruling for P24, and remove P25's stale terminology. P20's mechanism and
P22's `<` predicate are otherwise closed by the requested attacks.

## Confidence and method

**Confidence: high on P23, P20's closure, P22's behavioral inertness, and P25;
high on P24's measurements, medium on the intended breadth of the owner's P21
ruling.** The current and historical results are deterministic under the locked
`yaml@2.9.0`. P24 is a contract-scope finding: the literal text is narrow, but
the owner may choose to apply the same rationale to the larger parser gap.

### Material read

- The commission in full; `docs/governance/OPERATING_AGREEMENT.md` §§3.1 and
  3.4–3.6; `ai_rules.md` §§11–12; the complete current C3 plan; the prior
  follow-up review; and the changed checker and unit population.
- The complete `8b0ed9f..2142111` diff and commit message. The repair changes
  exactly the plan, checker, and checker spec named by the commission.
- Installed `yaml@2.9.0`'s parser, composer, CST declarations, tag resolution,
  and complete `Directives.add()` implementation. Its directive-name split is
  `line.trim().split(/[ \t]+/)`; only its unsupported numeric `%YAML` and unknown
  directive branches can produce `BAD_DIRECTIVE` warnings.
- The official [YAML 1.2.2 character and whitespace
  grammar](https://yaml.org/spec/1.2.2/#55-white-space-characters) and
  [directive grammar](https://yaml.org/spec/1.2.2/#68-directives), including
  reserved names, `%TAG` handle/prefix productions, and redeclaration rules.

### Required reruns

1. `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 0 on the first
   run**: 1 file, **128/128 tests passed**, including the live-plan control.
2. Deeper repeat — **N/A, still not invented**. The checker is deterministic
   pure unit logic over static strings; this repair adds no timing, process, or
   intermittent surface for a deeper repetition count to test.
3. `./tools/checks` — the **first run returned exit 1**, honestly retained: lint
   was 0 errors / 145 warnings, formatting and type-check passed, and Vitest
   reached **1540 passed / 1 failed in 105 files**. The one failure was the
   commissioned, previously documented `DeployDialog.spec.tsx` timeout in
   “errors clearly when there is no config to deploy.” The allowed single retry
   returned **exit 0**: 4/4 commands, the same 0/145 lint result, formatting and
   type-check clean, and **1541/1541 tests passed in 105 files**.

### Independent evidence runs

- Fail-against-`8b0ed9f`: a disposable detached worktree, the current 128-test
  spec copied in, and `node_modules` symlinked from the reviewed checkout,
  exactly as commissioned. Focused Vitest returned **exit 1 as expected: 2
  failed / 126 passed**. The failures were exactly `%YAML 1.1 → 1.2` and
  duplicate `%YAML 1.2`; all four conformance/residual controls and the prior
  122 tests passed. The disposable worktree was removed.
- A 26-construction Vite-SSR/parser probe covered two, three, and four `%YAML`
  directives; supported, unsupported, malformed, and mixed-order forms; the
  complete P16/P19 control set; ASCII and non-ASCII name separators; every
  installed `BAD_DIRECTIVE` warning offset class; valid, repeated, and malformed
  `%TAG` forms; undefined handles; and valid/malformed prefixes both unused and
  used.
- Three directives (`1.1 → 1.2 → 1.1`) and four duplicate `1.2` directives
  reported through the multiplicity branch with accurate counts of 3 and 4.
  Two unsupported `1.3` directives and `1.1 → 1.3` also reported through that
  branch, which is accurate and more fundamental than either version warning.
  A malformed `%YAML` followed by valid 1.2 reported the parser error first,
  also accurately.
- The P16/P19 population retained its outcomes after token parsing moved into
  `yamlDirectiveTokens`: `%YAML 1.3` blocked; `%FOO bar` and `%YAML 1.2` plus
  `%FOO` stayed clean; `%YAML 1.3` plus `%FOO` blocked. These are also among the
  122 old controls that passed on both sides of the detached-old run.
- `%YAML<U+00A0>1.3` and `%YAML<U+2003>1.3` each produced one CST directive
  token, no parse error, one unknown-directive `BAD_DIRECTIVE` warning at the
  token start, and effective version 1.2. JavaScript `\s` matched both, so
  `yamlDirectiveTokens` returned one false `%YAML` token and C3 emitted the
  unsupported-version blocker. A real tab separator remained correctly blocked.
  The same over-classification occurred for other JavaScript-only whitespace;
  NBSP and EM SPACE are the normative proof because YAML classifies them as
  printable non-space characters usable in a reserved directive name.
- The P22 `<` change is behaviorally inert for installed `yaml@2.9.0`.
  `Directives.add()` has exactly two warning forms: unknown directives report at
  local offset 0, and unsupported numeric YAML versions report at local offset 6. Both starts are strictly inside every non-empty directive token. No
  `BAD_DIRECTIVE` warning producer can place `pos[0]` at the token end. The probe
  confirmed `exactlyAtEnd: false` throughout.
- `%TAG` arity zero, one, and three remains a parser error and blocks. An
  undefined handle used on either governed or ungoverned content produced
  `TAG_RESOLVE_FAILED` as an error and blocked, so those cases do not expand the
  residual. By contrast, unused `%TAG e tag:example.com,2026:` (invalid handle)
  and `%TAG !e! tag:example.com,%ZZ:` (invalid percent escape in the prefix)
  produced no error, no warning, and no C3 blocker. Handles `!e` and `!!!` were
  likewise silently accepted.
- Using either a valid custom prefix or the malformed prefix on an ungoverned
  tagged value produced the same non-blocking `TAG_RESOLVE_FAILED` warning in
  this parser configuration. That overloaded result does not make a safe syntax
  discriminator; P24 rests on the unambiguous silent unused-directive cases.
- A plan-wide case-insensitive search found the new P21 exception at §2.2, its
  detailed repeated-handle residual at §2.7, the `KNOWN-OPEN:` control, and its
  §2.11f disposition. No second “no declared departures” universal remains.
  The same sweep found the uncorrected “byte range” in §2.11e's P19 row while
  §2.3 and §2.11f now state the correct code-unit/half-open invariant.
- A disposable probe at `60f191e`, before P19, returned no C3 blocker for both
  `%YAML 1.1 → 1.2` and a repeated `%TAG` handle. This independently confirms
  that P20 and P21 predate the P19 repair rather than being regressions from it.
- The P20 multiplicity branch compares `yamlDirectives.length > 1` only. It
  contains no version-string comparison, warning-message match, or version
  table. Version validity remains in parser diagnostics and final state.

### What I did not check

- **UNVERIFIED:** Electron e2e, Electron integration, live Home Assistant, and a
  packaged application. This is a static unit-only test-support repair and no
  Electron process was started.
- **UNVERIFIED:** every YAML construction outside the bounded directive matrix
  and committed 128-test population. The relevant installed directive and
  `BAD_DIRECTIVE` paths were read completely; this is not a proof over a future
  parser version.
- **UNVERIFIED:** behavior under dependency versions other than the installed
  lockfile's `yaml@2.9.0`.
- The fail-against-old runs used the commissioned/current `node_modules`
  symlink. I did not run `npm ci` at either historical revision; the repair
  changes no dependency file.
- No snapshots or baselines were re-recorded. No PR, board, product, plan,
  implementation, or MemPalace state was changed.

## Claim ledger

| Claim                                                                                                              | Tag           | Evidence                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed head is `2142111`, and its repair diff is confined to the three commissioned paths.                   | **MEASURED**  | `git rev-parse HEAD`; `git diff --name-status 8b0ed9f..2142111`; complete diff and commit-message inspection.                                                 |
| The focused suite passes; the first full gate flaked once and the single allowed retry passes.                     | **MEASURED**  | 128/128 focused; first full run 1540/1541 with the named timeout; retry exit 0, 4/4 and 1541/1541; lint 0/145.                                                |
| Exactly two new controls fail against `8b0ed9f`, while the four non-discriminators and prior 122 stay green.       | **MEASURED**  | Detached-worktree focused run: exactly 2 failed / 126 passed, all 128 executed.                                                                               |
| P20 catches cardinalities above two and reports mixed unsupported forms accurately through the earlier branch.     | **MEASURED**  | Three-, four-, double-unsupported, mixed-supported, and malformed-plus-supported probes.                                                                      |
| Refactoring P19 to consume shared CST tokens preserves the earlier P16/P19 outcomes.                               | **MEASURED**  | Current 128-test run, old-head 122-control parity, and direct four-case P16/P19 probe.                                                                        |
| JavaScript `\s` is broader than YAML/the parser's space-or-tab directive separator.                                | **MEASURED**  | ECMAScript regex probes; `Directives.add()` split at `dist/doc/directives.js:63`; NBSP/EM SPACE parser/checker cases.                                         |
| NBSP and EM SPACE may form part of a YAML reserved directive name rather than separating `%YAML` from a parameter. | **NORMATIVE** | YAML 1.2.2 §§5.1, 5.5, and 6.8 productions 1, 33–34, and 83–85.                                                                                               |
| C3 falsely blocks those reserved directives as unsupported `%YAML` versions.                                       | **MEASURED**  | Both probes: no errors, one unknown-directive warning, effective 1.2, and `C3-NOCANONICAL` from the bad-version branch.                                       |
| The chosen P21 residual does not name other silently accepted invalid `%TAG` handles and prefixes.                 | **MEASURED**  | Literal §2.2/§2.7/§2.11f search; parser/checker probes; YAML 1.2.2 productions 88–95.                                                                         |
| No installed `BAD_DIRECTIVE` warning can begin exactly at its CST token's end.                                     | **MEASURED**  | Complete `Directives.add()` warning-source read plus boundary matrix: local starts 0 or 6, always strictly inside.                                            |
| P20 and P21 existed at `60f191e`, before P19.                                                                      | **MEASURED**  | Disposable historical Vite-SSR probe over both concrete inputs.                                                                                               |
| P25 is an inaccurate live statement, not merely the corrected phrase quoted as history.                            | **JUDGEMENT** | §2.11e describes the P19 mechanism in the present tense as using a byte range; §2.11f says that wording was corrected, but the earlier row remains unchanged. |

### Weakest claims

- P24's measurements and the narrower literal text are high-confidence. The
  judgement is whether the owner intended “repeated `%TAG` handle” as one example
  of all parser-unreported `%TAG` syntax, despite repeatedly calling that exact
  case the plan's “one departure.” The current artifact does not say so.
- P25 is documentation-only and its stale phrase is inside a chronological
  disposition row. I still treat it as actionable because it describes the
  mechanism as a fact rather than quoting the old wording, and it directly
  contradicts the later P22 row.
- The installed warning-source proof is exhaustive for `yaml@2.9.0`, not future
  releases. A dependency change must revalidate P22's positional invariant.

## Findings

### P23 — SEV-2 — Broad `\s` turns reserved directive names into `%YAML`

**Claim.** `yamlDirectiveTokens` falsely classifies specification-valid reserved
directives whose name begins with `YAML` followed by non-ASCII whitespace that
JavaScript recognizes but YAML does not use as a structural separator.

**Evidence.** At `tests/support/planConsistency.ts:401-405`, CST directive
tokens are selected with `/^%YAML(?:\s|$)/`. Installed
`node_modules/yaml/dist/doc/directives.js:63-65` instead trims the line and
splits its directive name from parameters with `/[ \t]+/`. YAML 1.2.2 defines
only space U+0020 and tab U+0009 as white space, while printable non-break
characters other than those are `ns-char` and may appear in a reserved
directive name.

Concrete input, with U+00A0 between `L` and `1`:

```yaml
# plan-running-totals
%YAML 1.3
---
review_rounds_complete: 7
reviewer_findings: 30
findings_after_round_one: 24
```

At `2142111`, `parseDocument` returns no errors, one `BAD_DIRECTIVE` warning for
an unknown directive, effective version 1.2, and the valid totals mapping. That
is the accepted reserved-directive path P19 protects. JavaScript `\s` matches
U+00A0, however, so C3 emits the unsupported-`%YAML` blocker. U+2003 reproduces
the same result; a real tab correctly reaches the parser's `%YAML` branch and
blocks as unsupported 1.3.

**Mitigation gap.** The three P19 controls use `%FOO` and ASCII separators, so
they prove only that a completely different directive name is excluded. P20's
token-count controls also use ordinary spaces. Neither distinguishes “token
source starts with these letters” from “the parser extracted exactly this
directive name.” Beside a real `%YAML 1.2`, the false token also inflates
`yamlDirectives.length` and reports a misleading multiplicity error.

**Reachability and impact.** The live plan contains no such directive and this
code has no application-runtime path. The input is nevertheless legal reserved
directive syntax under the named YAML grammar and is accepted by the selected
parser with the required warning, yet it cannot pass the governance gate. This
is the same future false-blocking impact as P19 and is therefore SEV-2.

**Fix.** Select `%YAML` CST tokens using the parser/YAML separator boundary of
ASCII space or tab, not ECMAScript `\s`; do not parse the version or warning
message. Add passing U+00A0 and U+2003 reserved-name controls, a passing case
beside real `%YAML 1.2`, and retain blocking ordinary-space/tab `%YAML 1.3`
controls. Prove the new passing cases fail against `2142111`, and update §2.3
and the disposition history with the exact lexical boundary.

**Class swept.** The probe covered every JavaScript-whitespace category relevant
to the mismatch, plus empty/ordinary reserved names and real space/tab YAML
separators. P20 multiplicity, P19 warning correlation, and P22 boundaries were
exercised in the same population.

### P24 — SEV-3 — The `%TAG` residual names only one of several silent syntax gaps

**Claim.** P21 declares repeated `%TAG` handles as the plan's one YAML departure,
but installed `yaml@2.9.0` silently accepts other specification-invalid `%TAG`
handle and prefix forms that C3 also accepts.

**Evidence.** Plan §2.2 says there is one departure and §2.7 defines it as a
repeated handle caused by the missing redeclaration guard. YAML 1.2.2 §§6.8.2.1
and 6.8.2.2 constrain handles to `!`, `!!`, or `!word!` and constrain percent
escapes in tag prefixes to two hexadecimal digits. Installed
`Directives.add()` checks only that `%TAG` has two parts, then assigns
`this.tags[handle] = prefix`. Each of these canonical blocks returned no parser
diagnostic and no C3 blocker when the directive was unused:

```yaml
%TAG e tag:example.com,2026:
```

```yaml
%TAG !e! tag:example.com,%ZZ:
```

The same silent result occurred for handles `!e` and `!!!`.

**Mitigation gap.** The new `KNOWN-OPEN:` control pins only duplicate `!e!`
handles. Its surrounding explanation repeatedly scopes the owner decision to
redeclaration and uniqueness, so it cannot notify a maintainer who closes or
changes the distinct handle/prefix validation gaps. The exact commissioned
inverse control is sound: an undefined handle used later produces
`TAG_RESOLVE_FAILED` as an error and already blocks.

**Reachability and impact.** None of these directives appears in the live plan,
and an unused malformed directive does not change a governed total. This is an
undeclared boundary and maintenance-evidence defect, not a product or current
count failure, so it is SEV-3.

**Fix.** Obtain or record the owner's intended scope. If P21's rationale applies
to every `%TAG` syntax property the chosen parser fails to report, broaden §2.2,
§2.7, and §2.11f and add representative invalid-handle and invalid-prefix
`KNOWN-OPEN:` controls. If not, enforce the excluded forms through a real parser
boundary, not a partial string grammar.

### P25 — SEV-3 — P22 left one live “byte range” claim behind

**Claim.** The plan says P22 corrected the P19 span terminology, but §2.11e's P19
disposition still describes the mechanism as correlating through a token's byte
range.

**Evidence.** `docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:812` says
`unsupportedYamlVersionWarned` finds the token whose “byte range” contains the
warning. The current §2.3 recipe correctly says half-open code-unit-offset span,
and §2.11f's P22 row says the old byte-range wording was corrected. A full-plan
search found no other unqualified occurrence.

**Mitigation gap.** The P22 repair swept the normative §2.3 recipe and both code
comments but not the earlier disposition table. Because §2.11e describes the
mechanism in the present tense rather than quoting a superseded claim, the later
correction leaves the plan internally inconsistent.

**Reachability and impact.** The predicate now uses `<`, and no runtime
misattribution was found. This affects only the governed plan's accuracy for a
future maintainer, so it remains SEV-3.

**Fix.** Replace the §2.11e phrase with “half-open code-unit-offset span,” or
explicitly mark the byte-range wording as the inaccurate description that P22
later corrected. No mechanism or test change is required.

## Disagreements and closures

- **P20 — CLOSED in the attacked class.** Counts 2, 3, and 4 all block before
  final state; mixed unsupported declarations use the accurate multiplicity
  branch, while malformed syntax remains errors-first.
- **P21 — PARTLY DISPOSITIONED.** The owner-declared repeated-handle residual is
  explicit and honestly pinned. P24 rejects only the claim that it is the one
  complete `%TAG` departure.
- **P22 — mechanism CLOSED, documentation PARTLY OPEN.** The predicate is
  half-open and the installed library cannot produce an end-position warning.
  P25 is the single stale plan statement, not a behavioral regression.
- **P19 — PARTLY CLOSED.** The committed `%FOO` controls and their paired forms
  are correct, but P23 exposes another reserved-name producer that the helper's
  broader lexical rule still captures.
- **Commission weakest claim 1 — upheld exactly.** The detached-old run returned
  2 failures / 126 passes with only the named discriminators failing.
- **Commission weakest claim 2 — upheld.** Both concrete gaps were already
  accepted at `60f191e`, before P19; they are not regressions from `b817a42`.
- **Commission weakest claim 3 — upheld for the installed dependency.** The
  complete warning-source read and probe found no `pos[0]` at a directive end;
  `<` and `<=` therefore produce the same current outcomes.
- **P16 and the P19 refactor parity — upheld.** All earlier version/reserved
  controls retained their intended outcomes.
- **No hand-decided version table — upheld.** P20 uses CST token count only.
- **Gate claim — reproduced with the disclosed flake.** The first full gate hit
  the named unrelated timeout; the one permitted retry passed all four steps.

## MemPalace drawer candidates

No MemPalace write was made because the server transport is unavailable. Under
MP-LEASE these candidates are routed to the write-enabled author with
`added_by="codex"`.

1. **Wing:** `practice` · **Type:** verification rule · **Candidate:** “When
   correlating parser tokens by a recognized name, use the host grammar's exact
   lexical separator class. A language runtime's broad `\s` may classify
   characters that the parser treats as part of an unknown name, recreating the
   false-blocker the structured-token repair was meant to remove.” Add its
   one-line entry to the `practice` index in the same write.
2. **Wing:** `practice` · **Type:** contract rule · **Candidate:** “A declared
   residual must name the root boundary and pin representative members, not only
   the first observed example; otherwise neighboring defects in the same parser
   omission remain silently outside the contract.” Add its one-line entry to
   the `practice` index in the same write.
3. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “At PR #154
   commit `2142111`, `yamlDirectiveTokens` uses ECMAScript `\s` and falsely
   blocks valid reserved directive names `%YAML<U+00A0>1.3` and
   `%YAML<U+2003>1.3` (P23); P21's repeated-`%TAG` residual omits silently
   accepted invalid handles/prefixes (P24); plan §2.11e retains P22's corrected
   byte-range term (P25). P20 itself generalized through four directives, and
   the P22 predicate is behaviorally inert under installed `yaml@2.9.0`.”
