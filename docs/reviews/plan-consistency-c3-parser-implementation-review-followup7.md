Author: Claude Sonnet 5
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU

PARTIALLY-CONFIRMS — P29–P31 are resolved; P32 is one non-blocking SEV-3
documentation finding, with no repair round-trip required under STRAT-D18.

# Seventh follow-up implementation review — P29–P31 repair (PR #154)

Reviewed branch `feature/plan-consistency-checker` at
`8ea929a9fddcf7a8f9cda04f811577d8fb4a6dd7`, treating `b03cd94` and `8ea929a`
as the single repair unit answering the prior review at `345cb2c`. This document
is the only repository change made by this review. No merge or push was
performed.

## Owner Summary Table

| Ref | Follow-up result   | Severity | Plain-English result                                                                                                                                      | Owner action                                            |
| --- | ------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| P29 | **RESOLVED**       | SEV-2    | The new range check blocks all three invalid reachable trim code points and accepts all 18 legal members of that complete codepoint population.           | None                                                    |
| P30 | **RESOLVED**       | SEV-3    | Code, test, and plan now consistently say the CST token preserves trailing NBSP while the composer's separate line normalization removes it.              | None                                                    |
| P31 | **RESOLVED**       | SEV-3    | Both live statements now correctly say five flow indicators; the sole surviving “four” occurrence is explicitly quoted as the old wording being repaired. | None                                                    |
| P32 | **RECORDED — NEW** | SEV-3    | The range arithmetic is correct, but three new citations put `b-char`/`s-white` in the wrong YAML specification sections.                                 | No round-trip; correct the references opportunistically |

## Owner Decision Brief

**What this protects.** The checker now distinguishes legal future-use YAML
directive names from invalid control/BOM names without weakening the earlier
recognized-name or error-ownership safeguards. That prevents the governance
gate from either rejecting permitted documents or silently accepting the three
invalid documents this repair targets.

**What is going wrong.** Only the supporting section references are wrong.
The new code comment labels `b-char` as §5.2, although it is in §5.4. The plan's
normative recipe and P29 disposition summarize the four source productions as
“§5.1–§5.4,” although `s-white` is in §5.5. The copied productions and the
implemented ranges themselves are correct.

**Is the product affected? No.** The repair is test-support code and the live
plan remains clean. P32 changes neither classification nor runtime behavior; it
only sends a maintainer to the wrong specification location.

**Options and costs.** The low-cost option is to change the code comment's
`b-char` locator to §5.4 and both plan ranges to include §5.5 or cite each
production individually. Doing nothing leaves correct behavior with an
avoidable audit/navigation defect.

**Recommendation.** Treat P29–P31 as closed and do not commission another
round for P32: STRAT-D18 records SEV-3 findings without a round-trip. Correct
the three locators in a later authorized documentation pass. This review does
not block the owner's merge gate.

## Confidence and method

**Confidence: high on P29–P31 closure, P32, and the declared blast radius;
medium-high on “no fourth layer” within this exact composer-trim mechanism.**
The complete reachable trim-codepoint population and all specified arithmetic
boundaries were exercised. The weaker boundary is deliberate: this was not a
general YAML conformance audit, and the 63 acknowledged parser warning-only
gaps remain outside the repaired error-suppression path.

### Scope and material read

- The commission in full; `docs/governance/OPERATING_AGREEMENT.md` §§3.4–3.6;
  `ai_rules.md` §§11–12; the complete combined repair diff; both commit
  messages; the current checker, unit spec, plan §2.3/§2.7/§2.9/§2.11h/§2.11i;
  and the previous review.
- The official [YAML 1.2.2 specification](https://yaml.org/spec/1.2.2/)
  productions for `c-printable` (§5.1), `c-byte-order-mark` (§5.2), `b-char`
  (§5.4), `s-white` (§5.5), `ns-char` (§5.4), `c-flow-indicator`, and
  `ns-directive-name`.
- Installed `yaml@2.9.0`'s complete `Directives.add()` switch and its
  `line.trim().split(/[ \t]+/)` preprocessing.

### Repair-scope verification

- `git diff --stat 345cb2c..8ea929a` reports exactly three files, 251
  insertions and 47 deletions: the plan, checker, and checker spec. No other
  file is in the repair range.
- `8ea929a^..8ea929a` reports exactly one file,
  `tests/unit/planConsistency.spec.ts`, with 10 insertions and 10 deletions.
  A zero-context diff parser found 20 changed content lines and verified all 20
  begin, after indentation, with `//`. No executable or expectation text
  changed.
- The ten repaired comment lines were read directly from `8ea929a`'s tree and
  decoded by code point: seven U+2014 positions, two U+00A7 positions, and
  three U+26A0 positions across the ten named lines. The three touched files
  contain no raw disallowed C0 control or U+FEFF character.
- The checker and plan blob IDs are byte-identical at `b03cd94` and `8ea929a`.
  Focused Vitest passed **146/146** at both commits, so the before/after
  pass/fail set is identical. Runtime output bytes were not compared because
  durations and timestamps are expected to differ; the commission defines the
  claimed property as the identical pass/fail set.

### Required reruns

1. `npx vitest run tests/unit/planConsistency.spec.ts` at `8ea929a` — **exit
   0 on the first run**, 1 file and **146/146 tests passed**, including the
   live-plan control.
2. Deeper repeat — **N/A, unchanged from the prior two reviews**. This is
   deterministic pure-string logic with no timing, process, or intermittent
   mechanism against which a greater repeat count would add evidence. No
   repeat was invented.
3. `./tools/checks` at `8ea929a` — **real exit 0 on the first run**, all 4
   commands passed: ESLint **0 errors / 145 warnings**, formatting and
   type-check clean, **105/105 files and 1559/1559 tests passed**. No retry was
   used.

### Historical and adversarial evidence

- Disposable `cbae9e1` worktree with the current 146-test spec and current
  `node_modules`: **exit 1, exactly 4 failed / 142 passed**. The failures were
  the four pre-existing P26-class accepting controls; VT, FF, and BOM already
  blocked there.
- Disposable `24fbc45` worktree with the current spec and current
  `node_modules`: **exit 1, exactly 3 failed / 143 passed**. The failures were
  exactly trailing VT, trailing FF, and trailing BOM. This independently
  establishes the claimed P29 fail-before/pass-after set.
- Disposable `b03cd94` worktree with its own spec: **exit 0, 146/146 passed**.
  All worktrees and generated probe artifacts were deleted before
  `./tools/checks`; `git worktree list` then contained only the main checkout.
- The exact `isNsChar` return expression was extracted from current source and
  evaluated at every transition and adjacent value: TAB/LF/CR/space, 0x21,
  0x7E/0x7F, 0x84/0x85/0x86, 0x9F/0xA0, 0xD7FF/0xD800, 0xDFFF/0xE000,
  0xFEFE/0xFEFF/0xFF00, 0xFFFD/0xFFFE/0xFFFF, 0x10000, U+1F600,
  0x10FFFF/0x110000. **Zero implementation/spec mismatches** were found.
- `Array.from` returned one element with code point U+D800 for a lone high
  surrogate and one with U+DFFF for a lone low surrogate; both fall in the
  excluded gap. It returned one element for U+10000 and for emoji U+1F600;
  both fall in the astral range. The claimed code-point iteration is correct.
- The accepting-side checker sweep passed every printable non-space ASCII
  suffix U+0021–U+007E (**94/94**) and representatives/boundaries U+0085,
  U+00A0, U+1680, U+2003, U+D7FF, U+E000, U+FDD0, U+FEFE, U+FF00, U+FFFD,
  U+10000, U+1F600, and U+10FFFF. Each constructed character was checked via
  `charCodeAt(0)`/`codePointAt(0)` before its result was trusted.
- An exhaustive `0..0x10FFFF` scan found exactly **25** code points removed
  from the trailing edge by this Node runtime's `String.prototype.trim()`.
  Removing TAB/space (real separators) and LF/CR (line breaks) leaves 21
  candidates that can reach this mechanism: **18 legal `ns-char` members and
  3 invalid members, VT/FF/BOM**. Current `checkPlan` accepted all 18 legal
  members and blocked all three invalid members.
- The prior review's 65-character invalid set contains 63 acknowledged
  pre-existing warning-only gaps after VT/FF are removed. The exhaustive trim
  set has an empty intersection with those 63; none is altered by this
  composer-trim repair. Bare `%` remains warning-only and clean, as declared.
- All **441 ordered pairs** of the 21 reachable trim candidates classified as
  expected: pass if and only if both suffix code points are legal `ns-char`.
  This attacks stacked/mixed normalization rather than testing only single
  characters.
- Twelve mixed-document cases combined each of VT/FF/BOM with each of
  NBSP/EM SPACE, with invalid `%YAML` and valid trim-mangled `%TAG` in both
  orders. Every case blocked and every parser error position mapped to its own
  token; valid NBSP/EM SPACE directives alone remained clean. No ownership or
  ordering defect was found.
- Direct `Parser().parse()` inspection, using a numerically constructed and
  codepoint-checked NBSP, returned `%YAML` plus NBSP as six code points and
  `%TAG` plus NBSP as five. The final code point was U+00A0 in both. The CST
  preservation claim is independently confirmed.
- The full installed `Directives.add()` switch still has exactly `%TAG` and
  `%YAML` cases followed by `default:`. The repair does not touch the
  dependency or introduce another recognized-name assumption.
- `isNsChar` consists of the five specification-derived boolean alternatives;
  there is no list of observed rejected characters or known directive shapes.
  `blockingDirectiveErrors` adds only the complete-name predicate to the
  existing recognized-name and ownership checks.

### Evidence boundary

- **UNVERIFIED:** Electron e2e, Electron integration, a packaged application,
  UAT, and live Home Assistant. The repair changes unit-test support and plan
  records only; no Electron process or HA endpoint was started.
- **UNVERIFIED:** future Node/ECMAScript trim tables and future `yaml` package
  behavior. The exhaustive scan applies to the current runtime and installed
  `yaml@2.9.0`.
- **UNVERIFIED:** general YAML conformance outside the directive-name and
  composer-trim classes attacked here. The 63 pre-existing warning-only name
  gaps are acknowledged evidence boundaries, not silently recast as fixed.
- No snapshot, baseline, product file, PR body, board item, plan subject,
  MemPalace state, merge state, or remote branch was changed.

## Claim ledger

| Claim                                                                                                    | Tag           | Evidence                                                                                               |
| -------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| The reviewed head is `8ea929a`; the combined repair touches exactly the plan, checker, and checker spec. | **MEASURED**  | Full SHA and complete `345cb2c..8ea929a` name/stat/diff inspection.                                    |
| `8ea929a` changes exactly ten comment lines and no executable text.                                      | **MEASURED**  | 10/10 diff; all 20 changed sides begin with `//`; direct tree/codepoint inspection.                    |
| `b03cd94` and `8ea929a` have the identical 146-test pass/fail set.                                       | **MEASURED**  | Focused Vitest at both commits: 146/146 each; comment-only diff.                                       |
| P29's current controls discriminate exactly against both historical heads.                               | **MEASURED**  | `cbae9e1`: 4/142 split; `24fbc45`: 3/143 split; current: 146/146.                                      |
| `isNsChar` matches every specified arithmetic boundary.                                                  | **MEASURED**  | Extracted implementation expression versus specification predicate at all range transitions.           |
| Lone surrogates reject and real astral code points accept.                                               | **MEASURED**  | Direct `Array.from`, `charCodeAt`, and `codePointAt` probes.                                           |
| No accepting-side false blocker was found in the commissioned population.                                | **MEASURED**  | 94 ASCII cases, named range representatives/boundaries, and all 18 reachable legal trim members.       |
| The current runtime has 25 trim-removable code points; 21 reach this seam, partitioned 18 legal / 3 bad. | **MEASURED**  | Exhaustive `0..0x10FFFF` enumeration and YAML-production classifier.                                   |
| None of the 63 pre-existing warning-only gaps is trim-removable.                                         | **MEASURED**  | Set intersection of the exhaustive trim population with the prior review's enumerated 63.              |
| Error ownership remains correct for mixed valid/invalid trim-mangled directives.                         | **MEASURED**  | 12 checker/parser cases, both orders, no ownership failure; 441 stacked pairs also classified cleanly. |
| P30's corrected CST-token/composer distinction is accurate everywhere it is live.                        | **MEASURED**  | Direct token inspection plus code, spec, §2.11h, and §2.11i wording sweep.                             |
| P31's live “five flow indicators” correction is complete.                                                | **MEASURED**  | Multiline search of all touched files; one remaining “four” is a quoted historical statement.          |
| `{YAML, TAG}` remains the complete installed recognized-name set.                                        | **MEASURED**  | Complete `Directives.add()` switch at `node_modules/yaml/dist/doc/directives.js:65-95`.                |
| The repair adds a range predicate, not a disguised rejected-character table.                             | **MEASURED**  | Complete checker diff and `isNsChar` source at `tests/support/planConsistency.ts:479-527`.             |
| The §2.9 one-consumer/no-product/Electron/e2e/snapshot/baseline radius is accurate.                      | **MEASURED**  | Repository-wide import/use search and repair-range path enumeration.                                   |
| Focused and full gates pass with the claimed population and lint count.                                  | **MEASURED**  | Focused exit 0, 146/146; `./tools/checks` real exit 0, 4/4, 1559/1559, lint 0/145.                     |
| Three new production-section locators are inaccurate even though their copied arithmetic is correct.     | **MEASURED**  | Official production anchors versus checker line 489 and plan lines 407/1059.                           |
| P32 is non-blocking and needs no dedicated repair round-trip.                                            | **JUDGEMENT** | STRAT-D18's SEV-3 disposition rule; no behavior or normative range changes.                            |

### Weakest claims

- “No fourth layer” is scoped to the new general name predicate as it is
  reached through composer-trimmed `BAD_DIRECTIVE` errors. It is not a claim
  that installed `yaml@2.9.0` validates every illegal directive-name string;
  the 63 acknowledged warning-only gaps show that broader universal is false.
- The exhaustive trim count is current-runtime evidence, not a future
  ECMAScript guarantee. The implementation also runs in this current Node test
  environment, so it is the right population for this review.
- P32's facts are directly measured; its SEV-3 classification is judgment. The
  incorrect locators impair auditability but do not alter the correct copied
  grammar or executable range.

## Answers to the commissioned questions

### Q1 — Is the `c-printable`/`ns-char` arithmetic exactly correct?

**No issue found in behavior.** The five implementation alternatives match the
specification after subtracting TAB, LF, CR, space, and U+FEFF. Every lower and
upper boundary, both sides of the surrogate gap, the BOM hole, the
FFFD/FFFE boundary, and the astral endpoints matched. P32 concerns only the
nearby section locators, not the arithmetic.

### Q2 — Do lone surrogates reject and astral values accept?

**No issue found.** `Array.from` leaves a lone high or low surrogate as one
element whose numeric value falls in the excluded D800–DFFF gap. It combines a
valid surrogate pair into one code point; U+10000, U+1F600, and U+10FFFF are
accepted.

### Q3 — Is there a fourth layer under this seam?

**No new issue found within the repair mechanism.** The complete 21-member
reachable trim population, its 441 ordered pairs, recognized-name siblings,
empty name, and error ownership across sibling tokens were attacked. The known
warning-only invalid-name population remains outside this error filter and is
not presented as closed.

### Q4 — Does the fix falsely reject a legitimate reserved directive?

**No issue found.** All 94 ASCII `ns-char` suffixes, each remaining range's
representatives and endpoints, a real emoji, and all 18 reachable legal trim
members passed. No tested grammar-valid nonrecognized name was blocked.

### Q5 — Is P30's CST-token/composer account now accurate everywhere?

**No issue found.** Direct token inspection matches the rewritten checker and
test comments. Plan §2.11h already gives the raw-source account; §2.11i quotes
and rejects the old “cannot be trusted” and “already trimmed identically”
language rather than asserting it live.

### Q6 — Is P31's five-member correction complete?

**No issue found.** The plan §2.7 and test comment both say five. The sole
multiline match for “four flow indicators” is plan §2.11i's explicitly quoted
old wording immediately followed by “while listing five” and “changed to
five.” It is a genuine historical quotation, the same convention used in the
P30 row, not a live claim.

### Q7 — Did the repair introduce an unrelated defect?

**One documentation issue found: P32.** The code behavior, controls, comment-
only cleanup, and all other reviewed repair prose are clean. The production
section locators are the sole introduced defect found by the diff-wide sweep.

### Q8 — Is the declared blast radius accurate?

**No issue found.** Repository-wide use search finds exactly one consumer of
`tests/support/planConsistency.ts`: its own unit spec. The combined repair has
no `src/`, Electron, e2e/integration, snapshot, baseline, spacing plan, or
spacing-history path. Its downstream execution remains unit suite →
`./tools/checks` → CI.

## Finding

### P32 — SEV-3 — The new grammar comments cite the wrong YAML sections

**Evidence.** The copied block at
`tests/support/planConsistency.ts:486-495` labels `b-char` as §5.2 at line 489. YAML 1.2.2 defines `b-char` as production 26 under §5.4; §5.2 is where
`c-byte-order-mark` appears. The plan's normative recipe at
`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:405-409` and P29 disposition
at line 1059 both describe `c-printable`/`b-char`/`c-byte-order-mark`/
`s-white` as “§5.1–§5.4.” `s-white` is production 33 under §5.5. The official
anchors independently fetched during this review establish each location.

**Problem.** The range implementation and copied production bodies are
correct, but the repair twice claims it was checked against a section span that
does not contain one of its inputs, and the code sends a reader to the wrong
section for another. This is a documentation/auditability defect in newly
written repair text, not a classifier defect.

**Concrete fix.** Change the code's `b-char` suffix from `§5.2` to `§5.4`.
Change both plan occurrences of `§5.1–§5.4` to explicit locators such as
`§§5.1, 5.2, 5.4, 5.5`, or otherwise include §5.5 without implying every
production occupies a continuous range.

**What must not change.** Do not alter `isNsChar`,
`isLegalDirectiveName`, `blockingDirectiveErrors`, test expectations, or the
correctly copied character ranges to repair citation text. Do not touch the
spacing plan/history, product, Electron, e2e/integration, snapshot, or baseline
surfaces.

**Class swept.** Every YAML §5.x locator in the three touched files and the
immediate P29/P30/P31 neighborhoods was checked against the official
production anchors. Three new locators are affected: checker line 489 and plan
lines 407 and 1059. The P23, P29 test, BOM, `ns-char`, `s-white`, and
`c-byte-order-mark` individual references elsewhere are accurate.

## Disagreements

- **Commission §2a's trim-population arithmetic is incorrect.** After the four
  non-reaching members (TAB, LF, CR, space) are removed from 25, 21 remain.
  Three are the committed invalid controls VT/FF/BOM, so the “other 17” count
  should be **18**. Those same three are not legal `ns-char`, so the claim that
  there are “20 legal `ns-char` members” should also be **18**. The exhaustive
  codepoint scan and explicit enumeration agree on 18 legal / 3 invalid. This
  is a disagreement with the commission's report, not a repository finding;
  the repair code, tests, plan, and commit messages do not rely on the two bad
  commission counts.
- **No disagreement with the “all 63 pre-existing gaps unaffected” claim.**
  The 63-member set has no overlap with the complete current-runtime trim set.
- **No disagreement with the 8ea929a historical-quote judgment.** The sole
  surviving “four flow indicators” occurrence is grammatically and visually a
  quotation of discarded wording, not a live rule.

## MemPalace drawer candidates

MemPalace calls returned `Transport closed`; no reviewer write was made. Under
OA §3.5's reviewer-specific MP-LEASE workflow, these candidates are routed to
the write-enabled author with `added_by="codex"`. The two already-filed
recognized-set and codepoint-verification rules named in the commission are not
re-filed.

1. **Wing:** `practice` · **Type:** source-citation verification ·
   **Candidate:** “When transcribing a specification production into code or a
   governed plan, verify the production body and its section anchor as separate
   claims. Correct range arithmetic does not validate the locator attached to
   it.” Add its one-line entry to the `practice` index in the same write.
2. **Wing:** `havdm` · **Type:** investigation · **Candidate:** “PR #154 at
   `8ea929a`: P29–P31 are resolved. Exhaustive current-runtime trim scan found
   25 members, 21 reaching the mechanism, partitioned 18 legal/3 invalid; all
   classified correctly, 441 pairs and 12 mixed-ownership cases clean. Focused
   146/146 and full gate 1559/1559, lint 0/145. One non-blocking SEV-3 remains:
   checker `b-char` points to §5.2 instead of §5.4, and two plan references omit
   §5.5 (P32). Verdict PARTIALLY-CONFIRMS; no repair round-trip required.”
