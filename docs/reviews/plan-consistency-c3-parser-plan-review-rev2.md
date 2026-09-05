CHANGES-REQUIRED — Revision 2 resolves most of P1–P7, but its hand-written character-reference decoder still misses a plausible shadow heading, while three non-blocking repair and residual gaps remain.

| Ref | What is wrong, in plain English                                                                                                                                                 | Severity | Blocks                | Fix complexity | My recommendation      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------- | -------------- | ---------------------- |
| P8  | A standard alternate spelling for an encoded character can still hide the forbidden duplicate title; other encoded characters can wrongly block or crash the check.             | SEV-1    | C3 heading projection | 2              | Fix now                |
| P9  | Two earlier safety examples disappeared from the runnable model. One still behaves correctly, but the promised reuse of a valid number is now rejected.                         | SEV-2    | None                  | 2              | Fix now                |
| P10 | The test for an accidentally swallowed remainder stops at the block itself, so it does not pin the admitted case where later document content is actually swallowed and passes. | SEV-2    | None                  | 1              | Fix now                |
| P11 | Invisible comments and a fully visible top-level title are placed in the same ignored bucket; the visible-title boundary is absent from the accepted-limit list.                | SEV-2    | None                  | 2              | Owner judgement needed |

Author: BaggyG-AU with Claude Opus 5 (1M context)

Reviewer: OpenAI Codex (GPT-5.6 Sol)

Owner gate: micah / BaggyG-AU

Target: `docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md` revision 2 and `tools/c3-parser-harness.cjs` at `4954dba`

# C3 parser remediation plan review — revision 2

The parser-delegation architecture remains sound. Revision 2 correctly removes the unsupported closure departure, separates fenced from indented code blocks, rejects non-string keys, adds a numeric value contract, and makes the pre-code model reproducible. The remaining blocker is narrower: the new reader-visible projection delegates inline tokenisation to `marked` but then implements only a fragment of CommonMark character-reference semantics itself.

## Findings

### P8 — SEV-1 — The character-reference decoder is another partial parser

**Blocks: C3 heading projection**

**Decision or claim broken.** The contract says character references in heading text are decoded and all reader-visible marker headings block (`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:87`, `:160-162`, `:192-211`). It also says every property C3 asserts is decided by a reference parser (`:189-190`). The committed reference mechanism instead applies three local regular expressions and a six-name table (`tools/c3-parser-harness.cjs:39-44`). `marked` supplies the source spelling in a text token; the local function, not `marked`, decides the character-reference meaning.

**Violated authority and construction.** CommonMark defines hexadecimal references with either uppercase `X` or lowercase `x`, accepts the complete HTML5 named-entity set case-sensitively, limits decimal and hexadecimal digit counts, and replaces invalid Unicode code points with U+FFFD ([CommonMark §2.5](https://spec.commonmark.org/0.31.2/#entity-and-numeric-character-references)). The model accepts only lowercase `x`, recognises only six named entities after lowercasing their names, imposes no digit bounds, and passes numeric values directly to `String.fromCodePoint`.

Measured against the exact committed `c3` function:

| Heading beside a valid canonical block | Contract result                                     | Model result                                    |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| `# plan&#X2D;running-totals`           | shadow home: uppercase `X` decodes to `-`           | clean                                           |
| `# &Tab;plan-running-totals`           | shadow home after decode, whitespace collapse, trim | clean                                           |
| `# &Nbsp;plan-running-totals`          | clean: this invalidly-cased name remains literal    | one shadow home                                 |
| `# unrelated&#x110000;heading`         | clean: invalid code point becomes U+FFFD            | throws `RangeError: Invalid code point 1114112` |

The installed standards-complete entity decoder independently returned `-`, a tab, the literal `&Nbsp;`, and U+FFFD for those four source fragments. `marked` 14.0.0 preserved each spelling in `heading.tokens[].text`, confirming that its lexer does not supply the semantic value the plan assumes.

**Why no recorded mitigation covers it.** The 54-case population has one lowercase-`x` numeric reference (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:423`) and no uppercase hexadecimal, named-entity, invalid-name, digit-bound, NUL, surrogate, or out-of-range controls. The dialect-default assertion tests only `gfm` and `pedantic`; it cannot make a separate decoder standards-complete. The image and raw-HTML residuals do not apply because each construction is an ordinary `text` token.

**Reachability.** None of these spellings exists in the live plan. The safety-gate exemption applies to the uppercase-`X` construction: revision 2 expressly treats a character-reference spelling of the marker as a plausible future shadow home, and uppercase `X` is a standard spelling shown by CommonMark itself, not an invented malformed input. A maintainer copying that equally valid form into the hand-maintained governance plan reaches the false accept. The invalid-name and out-of-range cases establish the over-reach/crash sides of the same decoder class; they do not carry the exemption by themselves.

**Required correction.** Do not maintain a partial entity table. Use a standards-complete character-reference decoder as an explicit direct dependency, or specify and implement the complete CommonMark §2.5 rules: both `x` cases, exact digit bounds, the case-sensitive HTML5 entity inventory, and replacement of invalid code points. Add at least the four bidirectional constructions above, decimal/NUL/surrogate controls, a nonentity with too many digits, and a code-span control proving references remain literal there.

**What must not change.** Preserve the owner-selected image and inline-HTML contribution rules, recursive inline-role projection, whitespace collapse, and the plain/bold/code/link/Setext controls.

**Fix complexity: 2.** The correction is local, but it needs a real decoder plus a generated boundary matrix rather than another regular-expression patch.

**Class swept.** I exercised decimal, lowercase and uppercase hexadecimal, valid named whitespace, invalidly-cased named input, NUL, surrogate, out-of-range numeric input, and the existing code-span exception. Only the uppercase/named/invalid boundaries fail; the previously named formatting wrappers remain correct.

### P9 — SEV-2 — Revision 2 dropped two old cases and regressed alias values

Revision 1's population included both “marker indented four spaces as first content line” and “anchor/alias reuse of a governed value” (`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md` at `207aa04`, lines 295 and 314). Neither appears in the 54-case harness. Thus 30 → 54 is a net increase of 24, not 24 literal additions: 26 case labels are new and two old commitments were removed.

The first omitted case still behaves correctly in my probe: a fenced block whose first content line has four leading spaces produces `found 0 canonical blocks`. The second has regressed. Revision 2 explicitly says an alias used as a value must pass (`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:286-287`) and its P4 disposition says that control is retained (`:491`). The model reads only `pair.value.value` (`tools/c3-parser-harness.cjs:127-137`); a YAML `Alias` node has no direct scalar `.value`, so this valid input is rejected:

```yaml
base: &n 7
review_rounds_complete: *n
reviewer_findings: 30
findings_after_round_one: 24
```

The parser reported zero errors with `uniqueKeys: true, stringKeys: true`; the value node was an alias, `alias.resolve(doc)` returned a scalar with value `7`, and `doc.toJS()` returned `review_rounds_complete: 7`. The library documents `Alias.resolve(doc)` as its dereference API ([yaml Alias nodes](https://eemeli.org/yaml/#alias-nodes)). Direct anchored integer values pass. Aliases resolving to a string, negative number, sequence, or mapping are also rejected, but only because all alias nodes currently look like `null` to the check.

**Owner Decision Brief.**

- **What this protects.** The runnable model and future tests must preserve every previously accepted grammar case, especially controls that prevent nuisance failures.
- **What is going wrong plainly.** The plan promises reused integer values are valid, but its own model rejects them and removed the example that would expose the contradiction.
- **Is the product affected?** No. The live totals use direct integers, and no alias-valued governed total exists today. This is capped at SEV-2 because such reuse is valid but not a plausible ordinary edit to this simple block.
- **Options and costs.** Option A dereferences an alias with the document API, then accepts it only when the resolved node is an integer scalar; restore both removed cases. Option B explicitly prohibits aliases for governed values, changes the promised result, and restores the row as an invalid control. Both are contained.
- **Recommendation.** Choose A. It preserves the already-approved revision-1 behavior and uses the parser's own alias semantics.
- **If nothing changes.** A promised valid block false-blocks, and the committed population continues to conceal the regression.

**Required correction.** Implement the selected alias-value rule in §2.3 and the harness, restore both removed revision-1 rows, rerun the population, and describe the revision as 26 additions/two replacements or otherwise distinguish net growth from literal additions.

**Fix complexity: 2. Class swept:** I checked alias keys, direct anchored scalars, and aliases resolving to integer, string, negative, sequence, and mapping nodes. Key aliases are correctly rejected; only the intended integer-value alias needs acceptance.

### P10 — SEV-2 — The known-open fence control does not exercise swallowing

Section 2.7 names the residual precisely: an unclosed fence may swallow later document content yet still parse as one valid mapping with the three governed integer values (`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:326-340`). The planned control is only “unclosed fence at end of file” (`:278-282`), and the harness fixture ends immediately after the last governed value (`tools/c3-parser-harness.cjs:199-204`). Nothing follows it to be swallowed.

The adjacent hostile case does contain later content, but deliberately makes that content ordinary prose so YAML rejects it (`tools/c3-parser-harness.cjs:205-210`). It proves one swallowed document blocks, not that the admitted clean subset stays visible. I constructed the actual residual by following the valid governed mapping with `## Later section` and `### Last section` inside the unclosed fence. YAML treats both lines as comments; the exact model returned clean. Removing the real plan's closer still returned `MULTILINE_IMPLICIT_KEY,MULTIPLE_DOCS`, so the author's live-plan measurement is correct but does not pin the residual.

**Owner Decision Brief.**

- **What this protects.** A declared blind spot must remain tied to an executable example of that blind spot, so later behavior changes force the prose to change too.
- **What is going wrong plainly.** The current passing example contains no later document content, so it can stay green even if the real swallowed-content boundary changes.
- **Is the product affected?** No today. The live mutation blocks, and accepting the synthetic construction is the declared owner boundary.
- **Options and costs.** Add one passing `KNOWN-OPEN:` case with later YAML-compatible Markdown content, or remove the residual by adopting a complete closure mechanism. The latter would reopen P1's rejected hand-parser cost.
- **Recommendation.** Keep the CommonMark boundary and add the exact passing swallowed-document fixture.
- **If nothing changes.** The residual remains prose-only and can drift independently of the gate.

**Required correction.** Replace or supplement the EOF-only pin with the measured headings-after-the-block construction. Keep the hostile ordinary-prose case as the inverse control.

**Fix complexity: 1. Class swept:** I varied no trailing content, ordinary prose, Markdown headings/YAML comments, and explicit YAML comments. The clean swallowed subset is the missing member.

### P11 — SEV-2 — Skipping every HTML block also skips a visible level-1 heading

The token walk skips every block token of type `html` with the comment “comments and raw blocks declare nothing” (`tools/c3-parser-harness.cjs:96`). That token category combines invisible comments with visible elements. Installed `marked` 14.0.0 lexed `<h1>plan-running-totals</h1>` as one `html` token, rendered it unchanged as a visible level-1 heading, and the model returned clean beside the canonical block.

The literal §2.1 contract says “level-1 Markdown heading” (`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:160-162`), so excluding an HTML heading can be a legitimate product boundary. The problem is that the owner-facing behavior says reader-visible heading (`:87`), the harness claims raw blocks declare nothing, and the supposedly complete residual list mentions inline HTML but not a raw HTML heading (`:326-348`). This is therefore an undeclared boundary, not a claim that an HTML parser is already required.

**Owner Decision Brief.**

- **What this protects.** The owner needs to know whether a visibly identical top-level title is a second home when it is written in raw web markup.
- **What is going wrong plainly.** The parser bucket chosen to ignore invisible comments also contains a fully visible title, and the plan does not disclose that distinction.
- **Is the product affected?** No. No such heading exists in the live plan. Raw HTML headings are plausible in Markdown documents, but the written contract can legitimately limit C3 to Markdown-native headings; this is non-blocking owner judgement.
- **Options and costs.** Option A recognises raw `<h1>` elements, which introduces an HTML parsing boundary. Option B keeps the Markdown-only contract, corrects “raw blocks declare nothing,” and pins raw HTML headings as `KNOWN-OPEN:`. Option C forbids raw HTML headings in the governed document with a separately decidable rule.
- **Recommendation.** Choose B unless the owner intends “reader-visible” to include every HTML-rendered heading. It preserves the parser boundary without hiding the consequence.
- **If nothing changes.** A future raw HTML duplicate title remains clean while the residual inventory continues to imply completeness.

**Required correction.** Record the selected boundary explicitly in §1.4, §2.2a/§2.7, and a passing or blocking control. Do not inspect arbitrary HTML with another partial regular expression.

**Fix complexity: 2. Class swept:** I checked an HTML comment, a raw `<h1>`, a raw `<div>` containing marker-like source, inline tags surrounding ordinary text, and raw image markup. Inline child text remains separate and is projected correctly; the affected subtype is a block HTML element that itself renders a heading.

## P1–P7 resolution table

| Ref | State    | Evidence                                                                                                                                                                                                                                  |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | RESOLVED | The closure departure and suffix logic are gone. Shorter, wrong-character, wider, over-indented, EOF-only, and swallowed-prose cases ran; deleting the real closer still blocks via `MULTILINE_IMPLICIT_KEY,MULTIPLE_DOCS`.               |
| P2  | RESOLVED | The walk excludes `codeBlockStyle === 'indented'`; the lone-indented and indented-beside-fence cases pass. A fenced block whose marker content is indented four spaces also independently remains invalid, though restore its row per P9. |
| P3  | PARTIAL  | Recursive projection repairs bold, code span, deletion, link, reference, lowercase numeric entity, closing-`#`, and formatted Setext forms. Character-reference semantics remain incomplete and verdict-flipping (P8).                    |
| P4  | PARTIAL  | `stringKeys: true` correctly rejects the alias key with `NON_STRING_KEY`, but the required value-alias control was dropped and the reference model rejects the behavior it promises to preserve (P9).                                     |
| P5  | RESOLVED | The mechanism, literal fixtures, expectations, and transcript are committed. `node tools/c3-parser-harness.cjs` independently reproduced 54/54 and the clean live-plan result with exit 0.                                                |
| P6  | RESOLVED | Section 2.11 now limits fail-against-old to controls credited as repair proof and explicitly permits reported conformance/non-discriminator outcomes.                                                                                     |
| P7  | RESOLVED | Direct string, negative, null, sequence, and fractional values reject; zero, tagged integer, integer-valued float, and arbitrary ungoverned values pass. The alias-node issue is the P4/P9 boundary rather than a lost numeric rule.      |

## Answers to §2.12

1. **Yes.** The `text` role's “character references decoded” contribution is not implemented completely: uppercase hexadecimal and named references evade, invalid name casing can false-block, and an out-of-range numeric reference can throw (P8). The image-alt exclusion is an accessibility tradeoff—a screen reader or failed image may expose alt text—but it is an explicit, pinnable owner boundary. Ignoring inline markup itself is defensible because visible child text is emitted as separate text tokens and remains caught. Raw block HTML is the undeclared adjacent boundary in P11.
2. **No legitimate current need was found.** `stringKeys: true` preserves the live block and ordinary, quoted, explicit, tagged, and anchored string-key forms while rejecting alias and collection keys, as the revised contract requires. P9 is not caused by `stringKeys`; it comes from reading an alias **value** without resolving it.
3. **Yes.** An unclosed canonical fence followed only by Markdown headings stays a single valid YAML mapping because the later `#` lines are YAML comments. The model certifies it clean. This is the declared residual, not a reason to restore closure parsing, but P10 shows it is not the case currently pinned.
4. **Yes.** Excluding indented blocks is coherent with the explicit fenced-only contract and prevents an ordinary indented example from becoming a nuisance second home. If the owner instead wants every visually code-like totals example treated as ambiguous, that is a contract change, not a parser correction.
5. **Yes, there are verdict-flipping holes.** Uppercase-`X` character references false-accept and integer aliases false-block; the invalid character-reference class can false-block or throw. The harness faithfully embodies the concrete §2.3 mechanism, which is why these probes refute the plan rather than merely a surrogate. It is not faithful to the behavior §2.3/§2.5 promise for complete entity decoding and alias values, and it omits the exact swallowed-document pin.

## Claims attacked by name

| Claim                                                                                           | Result                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| All seven P1–P7 defects were reproduced before repair                                           | **Technical defects CONFIRMED; author's historical act UNVERIFIED.** The prior review and current regression probes establish the mechanics, but this review cannot observe an uncommitted past reproduction run.                                      |
| Deleting the real plan's closing fence still blocks                                             | **CONFIRMED.** Exact in-memory mutation returned `YAML: MULTILINE_IMPLICIT_KEY,MULTIPLE_DOCS`; unmodified live plan was clean.                                                                                                                         |
| `tools/c3-parser-harness.cjs`: 54 ok / 0 FAIL, live plan clean, exit 0                          | **CONFIRMED AS SELF-POPULATION.** The command printed 54/54 and `LIVE PLAN -> VALID (clean)`, exit 0. P8–P10 show properties/cases outside that population.                                                                                            |
| Revision 2 adds 24 new cases while retaining the ten round-3 and prior controls                 | **REFUTED LITERALLY.** It adds 26 new labels and removes two old rows, for net +24. One removed row still behaves correctly; the removed alias-value row now exposes P9.                                                                               |
| Eleven cases are false-blocker controls                                                         | **CONFIRMED under the harness's labels.** Ten valid rows are named `CONTROL`/`KNOWN-OPEN`, and the well-formed baseline has provenance `control`. Other valid grammar-conformance rows also protect against false blocking but are not so labelled.    |
| Every property C3 asserts is now decided by a reference parser                                  | **REFUTED.** `marked` returns source entity spellings; the local incomplete decoder decides their meaning (P8).                                                                                                                                        |
| Every §2.7 residual is pinned by a passing current-behavior test                                | **REFUTED.** The swallowed-document pin has no swallowed remainder (P10), raw block HTML is absent (P11), and the runnable 54-case evidence also omits the promised inline-HTML and ungoverned-value pins.                                             |
| `stringKeys: true` rejects the alias key without harming legitimate string-key forms            | **CONFIRMED.** The alias-key case raises `NON_STRING_KEY`; ordinary string-key forms and the live block remain valid.                                                                                                                                  |
| Governed values enforce finite non-negative integers; zero is valid; ungoverned values are free | **CONFIRMED for direct nodes.** String, negative, null, sequence, fraction, and infinity reject; zero and integer-valued forms pass; arbitrary ungoverned values remain clean. Alias semantics are separately contradicted by P9.                      |
| Indented code blocks are excluded while nested fenced blocks remain visible                     | **CONFIRMED.** Both committed cases passed, and blockquote/list recursion remained correct in the harness run.                                                                                                                                         |
| `marked` remains one resolved 14.0.0 copy and a devDependency is the correct placement          | **CONFIRMED / carried forward.** `npm ls marked yaml monaco-editor --all` reports one deduplicated `marked@14.0.0`; CI runs `npm ci` then the unit suite. The manifest-first lock simulation was already measured in revision 1 and not repeated here. |
| No production code exists and the governed plan/history were untouched                          | **CONFIRMED.** Diff checks against `6420bb4` and `207aa04` respectively exited 0.                                                                                                                                                                      |
| Gate at `4954dba`: 4/4, lint 0 errors/145 warnings, 1470/105                                    | **CONFIRMED.** Clean-state `./tools/checks` exited 0 with those exact results.                                                                                                                                                                         |

## Regression and prior-commitment sweep

I read the three implementation reviews, the revision-1 plan review, the append-only repair dispositions, both plan revisions, the production support/spec, and the revision-2 diff end to end. F1's lifecycle-bound reads, F3's fail-closed sequencing, F4/R2's advisory delivery, F5's disposition syntax, F6's textual-caller limit, R3/S4's evidence corrections, one-site-per-subject grouping, plan/history asymmetry, and the governed-document prohibition remain recorded and untouched. Production source and its 57-test spec are byte-identical to `6420bb4`.

The two silent losses from revision 1 are the marker-content-indentation and alias-value rows described in P9. The former still behaves correctly in an independent probe; the latter regressed under P7's new value-node inspection. P8 is under-reach within P3's character-reference class. P10/P11 are residual-accounting gaps rather than regressions of P1's removal decision.

## Claim ledger

| Claim                                                                    | Tag                 | Evidence                                                                                                   |
| ------------------------------------------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Uppercase hexadecimal reference evades the proposed shadow-heading check | MEASURED            | Exact committed `c3` via an in-memory VM probe returned clean for `&#X2D;`                                 |
| The entity decoder can false-block and throw                             | MEASURED            | `&Nbsp;` produced a shadow; `&#x110000;` raised `RangeError`                                               |
| Uppercase `X` is a plausible future governance-plan edit                 | JUDGEMENT           | It is a standard alternative in the same character-reference class the plan explicitly tests               |
| An alias resolving to integer 7 is rejected by the model                 | MEASURED            | `parseDocument` had zero errors and resolved/toJS to 7; exact `c3` reported a non-integer                  |
| The 54 rows are 26 new labels minus two removed revision-1 rows          | MEASURED            | Immutable revision-1 table compared with current `CASES` enumeration                                       |
| Headings after an unclosed fence can be swallowed while C3 stays clean   | MEASURED            | Exact `c3` returned `[]`; the heading lines are YAML comments                                              |
| A raw HTML `<h1>` is visible but skipped                                 | MEASURED / INFERRED | `marked.lexer` returned `html`, `marked.parse` returned the `<h1>` unchanged, and exact `c3` returned `[]` |
| Parser delegation remains the right architecture after these findings    | JUDGEMENT           | All defects are bounded consumption/projection issues; no finding requires returning to line parsing       |

**Weakest claims.** P8's SEV-1 reachability rests on treating uppercase `X` as a plausible future spelling because the plan already admits and tests numeric-reference shadow headings; no such source exists today. P11 depends on whether the owner intends “reader-visible” to include raw HTML headings despite §2.1's narrower “Markdown heading” phrase, so it is deliberately non-blocking and routed as a choice.

## Disagreements

- I agree with dropping the closure departure. P10 asks for an honest pin of the retained residual, not restoration of delimiter parsing.
- I agree with the fenced-only decision and do not treat an indented example as a shadow home under the chosen contract.
- I accept image alt and inline HTML as explicit owner boundaries, while noting the accessibility consequence and requiring their promised current-behavior controls.
- I disagree that P3 and P4 are fully fixed. P8 leaves P3 partial; P9 leaves P4 partial and shows that the value-contract repair created the alias regression.
- I disagree with the claim that the residual list is complete until P10 and P11 are recorded precisely.

## Method and results

Everything was headless. No Electron, integration, e2e, live-HA, or browser process was launched. All adversarial probes ran in-process and created no files; `git status --porcelain` was empty immediately before both repository gates.

| Command / check                                                                                                                     | Exit | Result                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `git log -1 --format='%H%n%B' 4954dba`, `git diff 207aa04..4954dba`, and full numbered reads of all governing/changed files         |    0 | Correct target and three-file revision surface established; both plan revisions and all prior review/disposition commitments read. |
| `node tools/c3-parser-harness.cjs`                                                                                                  |    0 | 54 ok / 0 FAIL; live plan valid.                                                                                                   |
| Exact-harness in-memory probes for character references, aliases, swallowed content, HTML roles, indentation, and values            |    0 | Established P8–P11 and confirmed the clean sides stated above; no probe files created.                                             |
| `node -e` using the installed standards-complete entity decoder                                                                     |    0 | Confirmed uppercase hex, named whitespace, invalid name casing, invalid-code-point replacement, and NUL semantics.                 |
| `parseDocument` AST/alias-resolution probe                                                                                          |    0 | Zero errors; governed value node was an alias; `.resolve(doc)` and `toJS()` both yielded integer 7.                                |
| Real-plan closing-fence in-memory mutation                                                                                          |    0 | Unmodified live plan clean; mutation produced `MULTILINE_IMPLICIT_KEY,MULTIPLE_DOCS`.                                              |
| `npm ls marked yaml monaco-editor --all`                                                                                            |    0 | One `marked@14.0.0`, deduplicated through `monaco-editor@0.55.1`; direct `yaml@2.9.0`.                                             |
| Repository TypeScript consumer search                                                                                               |    0 | Only `tests/support/planConsistency.ts` and its importing unit spec matched.                                                       |
| `git diff --quiet 6420bb4 4954dba -- tests/support/planConsistency.ts tests/unit/planConsistency.spec.ts`                           |    0 | No production-support or focused-spec implementation yet.                                                                          |
| `git diff --quiet 207aa04 4954dba -- docs/testing/SPACING_HELPER_PRESET_PLAN.md docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md` |    0 | Neither governed subject document changed.                                                                                         |
| `npx vitest run tests/unit/planConsistency.spec.ts --reporter=verbose`                                                              |    0 | 57/57 passed. This is the unchanged current implementation, not the proposed repair.                                               |
| `./tools/checks`                                                                                                                    |    0 | 4/4: lint 0 errors/145 warnings; Prettier pass; typecheck pass; 1470/1470 tests across 105 files.                                  |

The authoritative external grammar checks used [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/#entity-and-numeric-character-references) and the [`yaml` document/alias API](https://eemeli.org/yaml/#alias-nodes).

## UNVERIFIED

- No production repair exists, so its TypeScript port, generated committed controls, fail-against-`6420bb4` result, post-repair test count, and post-repair live-plan verdict could not be run.
- The author's historical act of reproducing all P1–P7 inputs before repair is not independently observable. Their technical premises and the current dispositions were checked; the act itself remains author-reported.
- The exact manifest-first package-lock update was not repeated in this round because revision 2 did not change the dependency plan. Current topology and CI devDependency consumption were rechecked; revision 1's disposable-worktree result remains the evidence for the future lockfile shape.
- The adversarial population is not a proof over every CommonMark/YAML document. The inline token roles, block containers, entity boundaries, key roles, alias/value shapes, and closure residual were sampled as recorded.
- A deeper repeat is N/A for this deterministic string parser. The focused suite and full repository gate were each run once from a clean target tree.
- External CI and GitHub's own renderer were not run. The plan deliberately names `marked` 14.x as its Markdown authority; local `marked` lexer/render output was measured.
- Electron, e2e, integration, live Home Assistant, and the packaged application were unrun by commission and are outside this plan-only radius.
- No merge, push, PR-body edit, governed-document edit, snapshot/baseline change, or Home Assistant write was performed.

## MemPalace drawer candidates

The project-drawer write was attempted and refused because another MCP writer holds the per-palace lease. Under MP-LEASE, the write-enabled author should file this with `added_by="codex"`; no retry, process termination, or override was attempted.

- **HAVDM / investigations:** Revision-2 pre-code review at target `4954dba` remains `CHANGES-REQUIRED`. The committed C3 model hand-decodes only a fragment of CommonMark character references: uppercase-`X` hexadecimal references evade the reader-visible shadow-heading check, invalidly-cased named references can false-block, and out-of-range numeric references can throw. New integer-value validation rejects an alias that resolves to an integer despite the plan promising alias values pass, and that old control was silently dropped. The known-open swallowed-document test has no swallowed remainder, while raw block HTML headings are absent from the residual inventory. Source: `docs/reviews/plan-consistency-c3-parser-plan-review-rev2.md`.
