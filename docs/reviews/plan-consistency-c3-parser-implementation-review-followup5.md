Author: Claude Sonnet 5
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU

CHANGES-REQUIRED

# Fifth follow-up implementation review — P23–P25 repair (PR #154)

Reviewed branch `feature/plan-consistency-checker` at
`cbae9e1144f08a4cf61068619e6dbd6ef4df08d2`, answering the prior review at
`80e18a0`. This document is the only repository change made by this review.

## Owner Summary Table

| Ref | Plain-English problem                                                                                                                                                       | Severity | Blocks: scope                                           | Fix complexity (1–5) | Recommendation                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- | -------------------: | -------------------------------------------- |
| P26 | `yaml@2.9.0` trims non-ASCII characters from a directive's end, so legal reserved names such as `%YAML` plus trailing NBSP become malformed bare `%YAML` and falsely block. | SEV-2    | The promised totals-document dialect                    |                    4 | Resolve at the parser boundary or declare it |
| P27 | The broadened `%TAG` residual still pins only one prefix defect; other independently reachable invalid prefixes remain outside its concrete rule list and controls.         | SEV-3    | Completeness of the owner-declared YAML departure       |                    2 | Broaden the boundary and its pins            |
| P28 | Literal regex alternation pipes split the new P23 disposition table row, so its rendered disposition ends halfway through the old regex.                                    | SEV-3    | Accuracy and auditability of the governed repair record |                    1 | Escape the pipes or move the regex           |

## Owner Decision Brief

**What this protects.** The P23 repair correctly narrows the checker's own
directive-name separator to YAML's ASCII space/tab boundary. P24 also makes the
declared `%TAG` departure materially more honest, and P25 removes the stale span
terminology. The remaining problems are at the next dependency boundary and in
the durability of those two dispositions.

**What is going wrong.** Installed `yaml@2.9.0` does not merely split directive
parts on space/tab: it first calls ECMAScript `trim()`. YAML classifies NBSP, EM
SPACE, and several other printable non-break characters as `ns-char`, so a
trailing one is part of a reserved directive name. JavaScript removes it,
however, and the dependency misreads the token as a bare `%YAML` directive with
no version. C3 then sees the dependency error and blocks a document the plan's
named YAML dialect permits. Separately, P24's prose still reduces prefix
validity to malformed percent escapes even though the same unvalidated prefix
branch also accepts forbidden literal braces and invalid first characters. The
new P23 disposition is present in source but not in rendered form because its
unescaped regex pipes delimit Markdown table cells.

**Is the product affected? No.** These forms are absent from the live plan and
the code is test support, not application runtime. **Is the governance checker
affected? Yes, measured.** A legal reserved directive can still be rejected,
and the governed plan overstates both its `%TAG` residual controls and the
content readers can see in its P23 disposition.

**Options and costs.** For P26, prefer a dependency version or parser-backed
route that preserves YAML's directive-name grammar, proven by a focused
fail-before/pass-after control. If the chosen parser cannot provide that
boundary safely, the owner may instead declare the upstream parser limitation
as a residual and pin it; a private partial directive parser would repeat the
class this project has deliberately retired. P27 needs only a complete
grammar-derived description and representative pins for independently
reachable prefix classes. P28 is a source-format correction, but it needs a
render-aware check rather than formatter success alone.

**Recommendation.** Do not approve this repair yet. Resolve or explicitly rule
P26, broaden and pin P27, and repair P28's rendered table row. The stated P23
interior-separator cases, P24's three existing examples, and P25's terminology
sweep are otherwise closed by the requested attacks.

## Confidence and method

**Confidence: high on all three findings and on the closure claims below;
medium on the best P26 remediation.** Each defect is deterministic under the
locked dependencies. The remediation judgement is weaker because this review
did not evaluate an upgraded YAML dependency, and filtering selected parser
errors without reconstructing the grammar risks another partial parser.

### Material read

- The commission in full; `docs/governance/OPERATING_AGREEMENT.md` §§3.4–3.6;
  `ai_rules.md` §§11–12; the complete current C3 plan; the previous follow-up
  review; and the changed checker and unit population.
- The complete `80e18a0..cbae9e1` diff and repair commit. It changes exactly the
  plan, checker, and checker spec named by the commission: 179 insertions and
  35 deletions across three files.
- Installed `yaml@2.9.0`'s complete `Directives.add()` implementation, including
  its `line.trim().split(/[ \t]+/)` normalization and its arity-only `%TAG`
  branch.
- Installed `marked@14.0.0`'s lexer result for the P23 disposition table.
- The official [YAML 1.2.2 whitespace and directive
  grammar](https://yaml.org/spec/1.2.2/), especially productions 31–34, 39,
  82–95. Only ASCII space/tab are YAML white space; reserved directive names are
  `ns-char+`; tag prefixes constrain percent escapes, literal characters, and
  the first character of a global prefix.

### Required reruns

1. `npx vitest run tests/unit/planConsistency.spec.ts` — **exit 0 on the first
   run**: 1 file, **134/134 tests passed**, including the live-plan control.
2. Deeper repeat — **N/A, still not invented**. The checker is deterministic
   pure unit logic over static strings; this repair introduces no timing,
   process, or intermittent mechanism for a repetition count to test.
3. `./tools/checks` — **exit 0 on the first run**: 4/4 commands; ESLint **0
   errors / 145 warnings**; formatting and type-check clean; **105/105 test
   files and 1547/1547 tests passed**. No retry was used.

### Independent evidence runs

- Fail-against-`80e18a0`: a disposable detached worktree, the current 134-test
  spec copied in, and `node_modules` symlinked from the reviewed checkout,
  exactly as commissioned. Focused Vitest returned **exit 1 as expected: exactly
  3 failed / 131 passed**. The failures were exactly NBSP-reserved alone,
  EM-SPACE-reserved alone, and real `%YAML 1.2` beside the NBSP-reserved
  directive. The tab conformance control and both new P24 `KNOWN-OPEN:` controls
  passed, as did all 128 older tests. The disposable worktree was removed.
- Mixed real YAML separators remained correct: `%YAML` followed by tab-space,
  space-tab, three spaces, three tabs, and tab-space-tab before `1.3` each
  selected one `%YAML` CST token and blocked. The `[ \t]` repair therefore did
  not narrow valid separator runs incorrectly.
- Reserved-name probes with NBSP or EM SPACE before `1.3` selected zero `%YAML`
  tokens and stayed clean, including a real `%YAML 1.2` beside both reserved
  forms. Two reserved forms alone also stayed clean. P20's multiplicity count is
  therefore not inflated by the repaired classifier.
- The requested Unicode sweep covered U+200B ZERO WIDTH SPACE, U+2028 LINE
  SEPARATOR, U+2029 PARAGRAPH SEPARATOR, U+202F NARROW NO-BREAK SPACE, U+2007
  FIGURE SPACE, U+1680 OGHAM SPACE MARK, U+0085 NEXT LINE, and a real carriage
  return. With following name text, each non-line-break construction was handled
  as a reserved directive and remained clean. Carriage return is a YAML line
  break, not an `ns-char`, and correctly produced a parser error rather than a
  clean unknown directive.
- The attack one boundary farther found the P26 discriminator. `%YAML` followed
  by a trailing NBSP and then newline yielded one CST directive token and zero
  selected `%YAML` tokens, but `parseDocument` returned `BAD_DIRECTIVE` as an
  **error**, saying `%YAML` lacked its required part; C3 emitted
  `C3-NOCANONICAL`. EM SPACE, LINE SEPARATOR, PARAGRAPH SEPARATOR, NARROW NBSP,
  FIGURE SPACE, and OGHAM SPACE MARK reproduced the false block. U+200B and
  U+0085, which ECMAScript `trim()` does not remove, remained accepted as
  unknown directives. This split exactly follows the dependency's `trim()`
  boundary rather than YAML's `ns-char` grammar.
- Installed `Directives.add()` checks `%TAG` only for exactly two split parts,
  then unconditionally assigns `this.tags[handle] = prefix`. The three committed
  residual examples—repeated handle, malformed handle `e`, and prefix `%ZZ`—all
  remained silent, as documented.
- Additional unused directives with literal `{` or `}` in a prefix, and global
  prefixes beginning with `,` or `[`, each returned no parser error, no warning,
  and no C3 blocker. YAML 1.2.2's `ns-uri-char` excludes braces everywhere; its
  global-prefix first production uses `ns-tag-char`, which also excludes flow
  indicators. These are distinct, independently reachable prefix-validity
  members not represented by the percent-escape control.
- `marked.lexer` parsed the §2.11g P23 row as three cells, but the disposition
  cell contained only the first 79 source characters and ended at
  `/^%YAML(?:\s`. The unescaped alternation pipe opened a new table cell;
  everything after it, including the fix and controls, disappeared from the
  rendered disposition. Prettier's clean result does not detect this structural
  Markdown error.
- A plan/test sweep found no private `%TAG` enforcement, directive grammar
  table, version table, or warning-message match added by the repair. The
  checker still delegates syntax to `yaml` and adds only the exact `[ \t]`
  token-name boundary.
- The no-backlog rationale is consistent with the same plan's existing
  image-heading, raw-HTML, and swallowed-document residuals: each is declared
  and pinned in the plan without a separate story card. P27 challenges the
  completeness of the pin population, not that owner choice.

### What I did not check

- **UNVERIFIED:** Electron e2e, Electron integration, live Home Assistant, and a
  packaged application. This is a static unit-only test-support repair and no
  Electron process was started.
- **UNVERIFIED:** every YAML or `%TAG` string outside the grammar-derived classes
  and committed 134-test population. The relevant installed directive branch
  was read completely; this is not a proof over a future parser version.
- **UNVERIFIED:** whether a newer `yaml` release fixes P26/P27 without other
  behavioral changes. No dependency update or alternate parser was installed.
- **UNVERIFIED:** GitHub's production renderer directly. The P28 source error was
  reproduced with the repository's installed GFM lexer, and literal unescaped
  pipes are table delimiters in that dialect.
- The historical run used the commissioned/current `node_modules` symlink. I
  did not run `npm ci` at `80e18a0`; the repair changes no dependency file.
- No snapshots or baselines were re-recorded. No PR, issue, board, product,
  plan, implementation, dependency, or MemPalace state was changed.

## Claim ledger

| Claim                                                                                                        | Tag           | Evidence                                                                                                            |
| ------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| The reviewed head is `cbae9e1`, and its repair diff is confined to the three commissioned paths.             | **MEASURED**  | `git rev-parse HEAD`; complete `git diff --name-status 80e18a0..cbae9e1` and diff inspection.                       |
| The focused suite and full gate pass on their first runs with the claimed totals.                            | **MEASURED**  | 134/134 focused; full gate exit 0, 4/4, 1547/1547 in 105 files, lint 0/145.                                         |
| Exactly three of the six new controls fail against `80e18a0`; the other 131 tests pass.                      | **MEASURED**  | Detached-worktree focused run, all 134 tests executed.                                                              |
| The repaired classifier handles arbitrary runs of real YAML space/tab separators correctly.                  | **MEASURED**  | Five mixed/repeated ASCII-separator probes, each selecting one token and blocking unsupported 1.3.                  |
| Non-ASCII printable characters followed by name text remain reserved-name characters rather than separators. | **NORMATIVE** | YAML 1.2.2 productions 31–34 and 82–85; direct parser/checker matrix.                                               |
| The dependency's leading/trailing `trim()` removes legal trailing reserved-name characters.                  | **MEASURED**  | `directives.js:63`; seven trimmable-character probes versus the U+200B/U+0085 inverse controls.                     |
| C3 falsely blocks those trailing-name forms through the parser-error branch.                                 | **MEASURED**  | Each selected zero `%YAML` tokens but produced a dependency error and `C3-NOCANONICAL`.                             |
| `%TAG` prefix validity includes independent character-membership and first-character rules.                  | **NORMATIVE** | YAML 1.2.2 productions 39 and 93–95.                                                                                |
| The parser/checker silently accepts invalid brace and global-first-flow-indicator prefixes.                  | **MEASURED**  | Five direct parser/checker constructions, all with no errors, warnings, or C3 blocker.                              |
| The P23 disposition is truncated in GFM tokenization despite a clean formatter result.                       | **MEASURED**  | `marked.lexer` returned a 79-character disposition cell ending inside the old regex; Prettier passed.               |
| No separate backlog card for the declared residual is consistent with this plan's other pinned residuals.    | **JUDGEMENT** | Plan-wide comparison of the `%TAG`, image-heading, raw-HTML, and swallowed-document residual sections and controls. |
| The repair introduces no hand-decided directive/version table or private `%TAG` parser.                      | **MEASURED**  | Complete checker diff, source search, and installed dependency branch read.                                         |

### Weakest claims

- P26's defect and reachability are high-confidence; the weakest part is the
  safest repair. The parser itself normalizes away the distinguishing character,
  so a checker-side exception must not infer validity from an ambiguous error.
  This review therefore recommends a parser-backed/dependency solution first
  and leaves explicit residual declaration as the honest alternative.
- P27 does not claim an exhaustive enumeration of every bad `%TAG` string. It
  claims the plan's supposedly complete three-rule population omits at least
  two grammar-derived, independently reachable prefix classes. Those concrete
  witnesses are sufficient to disprove completeness.
- P28 was reproduced with this repository's GFM lexer, not GitHub's deployed
  renderer. The source nevertheless contains literal table delimiters, and the
  lexer drops the same content a GitHub reader relies on.

## Findings

### P26 — SEV-2 — Parser `trim()` turns trailing reserved-name characters into bare `%YAML`

**Claim.** The repaired exact separator does not close the reserved-directive
false-blocking class because installed `yaml@2.9.0` applies ECMAScript `trim()`
before it splits and identifies a directive.

**Evidence.** The plan at
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:373-381` and checker comments at
`tests/support/planConsistency.ts:401-413` say `[ \t]` mirrors the parser's own
separator and “nothing wider.” The selector at line 418 does use that exact
boundary. But `node_modules/yaml/dist/doc/directives.js:63` actually performs
`line.trim().split(/[ \t]+/)`. YAML 1.2.2 makes NBSP and EM SPACE printable
`ns-char`, so each may be the final character of the reserved directive name
`YAML<character>`. ECMAScript removes it; the parser then enters its `%YAML`
branch with zero parts and raises an error. `checkPlan` unconditionally blocks
parser errors at `tests/support/planConsistency.ts:554-555`.

Concrete discriminator, where the visible marker denotes U+00A0 and the next
character is newline:

```yaml
# plan-running-totals
%YAML<NBSP>
---
review_rounds_complete: 7
reviewer_findings: 30
findings_after_round_one: 24
```

At `cbae9e1`, the CST selector correctly returns zero `%YAML` tokens, yet the
composed document has `BAD_DIRECTIVE` in `errors` and C3 blocks. Six other
ECMAScript-trimmable YAML `ns-char` witnesses reproduce; U+200B and U+0085 do
not trim and remain clean, isolating the cause.

**Mitigation gap.** The four new P23 controls all place `1.3` after the attacked
character or use a real tab. They prove the checker's regex boundary but never
exercise the parser's leading/trailing normalization. The prose cites only the
split regex and therefore describes an incomplete dependency boundary.

**Reachability and impact.** The live plan contains no reserved directive, but
the named YAML 1.2 dialect permits this future-use directive and requires it to
remain an ignorable warning. The selected parser instead produces an error,
which necessarily reaches C3's parser-error branch. This is a real false blocker
in the promised document dialect, so it is SEV-2 despite zero current product
impact.

**Fix.** First investigate an upgraded dependency or another parser-exposed
boundary that preserves the directive source without broad trimming. Add a
passing trailing-NBSP discriminator and U+200B inverse control, and prove the
former fails at `cbae9e1`. If no parser-backed correction is viable, explicitly
declare and pin this upstream parser departure. Do not suppress generic
`BAD_DIRECTIVE` errors or build a partial hand parser from one character list;
both would reopen earlier classes.

**Class swept.** The attack covered characters inside the name, at its trailing
edge, real YAML separators, repeated/mixed separators, two reserved directives,
and real `%YAML` beside reserved directives. The failure partitions exactly on
ECMAScript's trailing trim behavior.

### P27 — SEV-3 — The broadened `%TAG` residual still under-pins prefix validity

**Claim.** P24 broadens P21 in its heading, but its supposedly complete
three-rule list and “one per rule” control claim still reduce malformed prefix
syntax to one invalid percent escape.

**Evidence.** Plan §2.7 at
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:562-594` accurately observes
that `Directives.add()` has “no prefix grammar check,” then says **three**
distinct rules are unenforced and lists only repeated handle, malformed handle,
and malformed prefix percent-escape. The tests at
`tests/unit/planConsistency.spec.ts:978-1021` pin exactly those examples. The
dependency branch at `node_modules/yaml/dist/doc/directives.js:66-74` checks
only arity. YAML 1.2.2's tag-prefix grammar also excludes literal braces from
`ns-uri-char`, and a global prefix's first character must be `ns-tag-char`,
which excludes flow indicators.

Unused `%TAG` directives with prefixes `tag:example.com,{x`,
`tag:example.com,}x`, `,tag:example`, and `[tag:example` each produced no parser
diagnostic and no C3 blocker. These do not depend on the already-pinned percent
escape and are accepted by the same missing-validation branch.

**Mitigation gap.** The bold heading is broad enough to encompass these cases,
but the normative rule enumeration, owner note, and three controls jointly
claim a complete boundary. A future parser change that fixes brace membership
or global-prefix first-character validation would not break any current
`KNOWN-OPEN:` control and therefore would not force the plan's boundary to be
revisited as promised.

**Reachability and impact.** `%TAG` remains absent from the live plan, and the
owner's no-private-parser rationale applies equally to these witnesses. The
checker has not regressed; the defect is that the declared residual and its
self-enforcing evidence are incomplete. This is SEV-3.

**Fix.** Describe `%TAG` prefix grammar as the residual rather than equating it
with percent-escape validity. Add at least one forbidden-character pin and one
invalid-global-first-character pin beside `%ZZ`, or explicitly state a smaller
representative sampling claim instead of “one per rule.” Retain parser
delegation; no private `%TAG` implementation is requested.

**Class swept.** Prefix percent escapes, character membership, global first
character, local-prefix form, handle form, redeclaration, and arity were
attacked independently. Arity remains enforced by the dependency; the other
listed grammar classes remain silent.

### P28 — SEV-3 — Regex pipes truncate the rendered P23 disposition

**Claim.** The P23 disposition added at plan §2.11g is not a complete rendered
table row because literal `|` characters inside its two regexes are interpreted
as Markdown cell delimiters.

**Evidence.** At
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:906`, the row includes the old
and new alternations without escaping their pipes. The installed GFM lexer
returns only three cells and truncates the disposition after 79 characters,
ending at the old regex's `\s`; the remainder containing the cause, fix, and
four controls is not part of the rendered disposition cell. Prettier reports
the file clean because formatting does not validate rendered table structure.

**Mitigation gap.** The repair self-check considered the source prose and the
format gate, but not the rendered table. Inline-code backticks do not neutralize
a pipe in a Markdown table.

**Reachability and impact.** This does not affect checker execution. It does
affect every GitHub reader of the governed plan and hides the very disposition
this follow-up must audit. That is an accuracy and maintainability defect,
SEV-3.

**Fix.** Escape each pipe as `\|` inside the table source, or move both regexes
and the detailed explanation outside the table. Verify the row through a GFM
lexer/render inspection in addition to Prettier.

**Class swept.** All three new disposition rows were tokenized. P24 and P25
retain their complete third cell; only P23 contains unescaped alternation pipes
and truncates.

## Disagreements and closures

- **P23 — PARTLY CLOSED.** The exact `[ \t]` selector fixes the demonstrated
  NBSP/EM SPACE plus following-text cases and all mixed ASCII separator probes.
  P26 rejects only the stronger claim that this closes the dependency's complete
  directive-name boundary.
- **P24 — PARTLY DISPOSITIONED.** Repeated handles, malformed handles, and bad
  percent escapes are honestly named and pinned. P27 rejects the “three rules /
  one per rule” completeness claim, not the owner's choice to declare the
  dependency limitation.
- **P25 — CLOSED.** The former live “byte range” statement now says half-open
  code-unit-offset span. Remaining appearances are explicit historical
  descriptions of superseded wording.
- **Commission fail-against-old claim — upheld exactly.** Three and only three
  of the six new controls fail against `80e18a0`; all 131 others pass.
- **P20 multiplicity interaction — upheld.** Two reserved directives do not
  count as `%YAML`; adding a real `%YAML 1.2` still yields cardinality one and a
  clean result.
- **P23 self-check item 2 — disagreed only for carriage return.** A real CR is a
  YAML line break, so `%YAML<CR>1.3` is not an unknown/reserved directive-name
  case and correctly blocks. Treating all eight named characters as clean
  reserved names would be a specification error; this creates no new finding.
- **P24 backlog reasoning — upheld.** The plan-plus-`KNOWN-OPEN:` mechanism is
  consistent with other same-plan residuals. P27 requires the mechanism to pin
  what its prose claims, not a duplicate story card.
- **No hand parser table — upheld.** The implementation adds only the exact
  token-name boundary and does not interpret `%TAG` grammar or version strings.
- **Gate claim — upheld.** Focused tests and the complete repository gate passed
  on their first runs with the commissioned totals.

## MemPalace drawer candidates

No reviewer write was made: under OA §3.5's reviewer-specific MP-LEASE workflow,
these candidates are routed to the write-enabled author with
`added_by="codex"`.

1. **Wing:** `practice` · **Type:** parser-boundary rule · **Candidate:** “When
   claiming that a dependency uses an exact lexical separator, sweep every
   normalization before the split too. Leading/trailing `trim()` can erase
   grammar-significant characters even when the later separator regex is
   exact.” Add its one-line entry to the `practice` index in the same write.
2. **Wing:** `practice` · **Type:** artifact-verification rule · **Candidate:**
   “A formatter-clean Markdown table can still render incorrectly. Inline-code
   backticks do not escape table pipes; render or lex rows containing syntax
   with alternation before claiming a disposition is reader-visible.” Add its
   one-line entry to the `practice` index in the same write.
3. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “At PR #154
   commit `cbae9e1`, P23's `[ \t]` selector passes its intended controls but
   `yaml@2.9.0`'s preceding `trim()` falsely blocks reserved names ending in
   NBSP-like characters (P26); P24's `%TAG` residual omits forbidden prefix
   characters and global-first-character rules (P27); and unescaped regex pipes
   truncate the rendered P23 disposition (P28). Focused 134/134 and full
   1547/1547 gates pass; exactly 3/6 new controls fail at `80e18a0`.”
