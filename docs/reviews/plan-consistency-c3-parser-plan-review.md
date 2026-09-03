CHANGES-REQUIRED — Delegating to real parsers is the right approach, but the plan still leaves three plausible safety-gate inputs incorrectly classified and must define those boundaries before implementation.

| Ref | What is wrong, in plain English                                                                                                                                        | Severity | Blocks                               | Fix complexity | My recommendation      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | -------------- | ---------------------- |
| P1  | The planned check for whether a block was properly ended has no complete rule, so a common editing mistake can look like a valid ending.                               | SEV-1    | Blocks: unterminated-fence departure | 3              | Fix now                |
| P2  | The planned scanner groups two different kinds of code block together, so adding an indented example can make a legitimate plan fail.                                  | SEV-1    | Blocks: canonical-block token walk   | 2              | Fix now                |
| P3  | A duplicate totals heading can escape detection when its words are bold, linked, or styled as code, even though a reader sees the same heading.                        | SEV-1    | Blocks: shadow-home token walk       | 3              | Fix now                |
| P4  | A rarely used reuse feature can repeat a required field without the planned duplicate check noticing; the later value silently wins.                                   | SEV-2    | None                                 | 2              | Fix now                |
| P5  | The claimed 30-case safety result cannot be independently reproduced because the exact inputs, instrument, and output were discarded.                                  | SEV-2    | None                                 | 2              | Fix now                |
| P6  | The evidence rules simultaneously require every new check to fail on the old version and require listing new checks that do not. Both instructions cannot be followed. | SEV-3    | None                                 | 1              | Fix now                |
| P7  | Required totals can still contain words or impossible values, and the plan neither rejects that nor lists it as a known limitation.                                    | SEV-2    | None                                 | 2              | Owner judgement needed |

Author: BaggyG-AU with Claude Opus 5 (1M context)

Reviewer: OpenAI Codex (GPT-5.6 Sol)

Owner gate: micah / BaggyG-AU

Target: `docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md` at `207aa04`

# C3 parser remediation plan review

The architectural decision is sound: use `marked` to decide Markdown block structure and `yaml` to decide YAML structure. The plan is not rejected. The remaining problems are boundary errors in how it proposes to consume those parsers, plus two evidence defects. They are smaller than another redesign and should be repaired in the plan before code begins.

## Findings

### P1 — SEV-1 — “Ends in a closing fence” reintroduces an undefined delimiter parser

**Blocks: unterminated-fence departure**

**Decision or claim broken.** The plan says both host grammars are delegated to their reference parsers, while deliberately retaining the rule that a fence must have an explicit closer. The proposed implementation says a `code` token will record “whether `token.raw` ends in a closing fence” (`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md:145`, `:154-157`). `marked` does not expose a closed/open flag; its `Code` token exposes `raw`, `text`, optional `lang`, and optional `codeBlockStyle`. The missing decision is how raw source becomes the claimed closure fact.

**Construction.** With a four-backtick opener and only three backticks at the end, `marked` returns one code token whose `raw` ends in three backticks, but whose `text` includes those backticks as content. The same happens when a backtick opener ends with tildes. Both are unclosed under the named grammar. A longer same-character closer is closed. CommonMark requires the closer to use the same character and at least the opener's width; it also defines EOF without a closer as a code block, which is exactly the behavior from which this plan departs ([CommonMark §4.5](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)). A suffix test that does not recover the opener character and width cannot distinguish these cases.

**Why no mitigation covers it.** The §2.10 population has a valid four-backtick fence and a fence with no delimiter-like final line, but no shorter closer, opposite-character closer, longer valid closer, or four-space-indented false closer (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:297-302`). The dialect-default assertion does not test the new hand-parsed property.

**Reachability.** No such input exists in the live plan today. The safety-gate exemption applies: changing an opener from three to four characters to quote embedded backticks, then forgetting to widen its closer, is a plausible typo in a hand-maintained governance plan. Detecting future malformed edits is the component's purpose; this is not merely a constructible string.

**Required correction.** My recommendation is to drop the departure and follow the named parser: EOF closes the block under CommonMark. That removes the only delimiter property `marked` has already consumed but does not expose. If the owner keeps the stricter rule, the plan must specify the exact source algorithm: recover the opener's character and width, require a final delimiter of the same character with width greater than or equal to the opener, permit only the dialect's indentation and trailing whitespace, and reject delimiter-like content. Add all four constructions above plus equal-width and permitted-indentation controls.

**Fix complexity: 3.** Dropping the departure is small; retaining it requires a contained delimiter parser and a bidirectional test matrix.

**Class swept.** I enumerated the closure axes named by CommonMark: character match, width relation, indentation, trailing content, and EOF. I executed representatives for shorter, opposite-character, longer, and over-indented endings. The gap is the whole closer-relation class, not only the shorter example.

### P2 — SEV-1 — A `code` token is not necessarily a fenced code block

**Blocks: canonical-block token walk**

**Decision or claim broken.** The contract requires exactly one **fenced** block (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:125-128`), but the walk collects every `code` token whose first content line is the marker (`:154-157`). `marked` uses the same token type for fenced and four-space-indented blocks, distinguishing the latter with `codeBlockStyle: 'indented'`. CommonMark also defines indented and fenced code blocks as different leaf-block classes ([CommonMark §4.4](https://spec.commonmark.org/0.31.2/#indented-code-blocks), [§4.5](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)).

**Construction.** The installed `marked` 14.0.0 lexer turns this into a `code` token with `codeBlockStyle: 'indented'` and `text` beginning with the exact marker:

```markdown
    # plan-running-totals
    review_rounds_complete: 7
    reviewer_findings: 30
    findings_after_round_one: 24
```

Beside the real canonical fence, that indented example is collected as another candidate, or rejected as a supposedly unclosed fence, even though the stated contract counts fenced blocks only.

**Why no mitigation covers it.** The TAB-before-opener case tests an invalid attempted fence, not a genuine indented code block. No §2.10 case varies the leaf-block subtype, and the plan never tests `codeBlockStyle` (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:284-315`).

**Reachability.** The live plan has no marker-first indented block today. The safety-gate exemption applies because pasting a totals example using Markdown's ordinary four-space code style is a plausible future documentation edit. The plan expressly discusses examples as ambiguity sources at `:87-89`; whether indented examples count must therefore be intentional, not an accidental property of a broad token tag.

**Required correction.** Either filter out `codeBlockStyle === 'indented'` and add both lone/second-indented-block controls, or amend §2.1 to say **code block** rather than **fenced code block** and explicitly owner-approve the wider behavior. I recommend preserving the currently stated fenced-only contract and filtering the subtype.

**Fix complexity: 2.** This is one token predicate plus two regression controls.

**Class swept.** I inspected the installed token union and the child-bearing block shapes. Block quotes and list items are the block containers that need recursion; tables contain inline cell tokens, while link definitions are not block containers. The affected leaf-token class is `code`, where fenced and indented forms share a type.

### P3 — SEV-1 — `heading.text` is source markup, not the reader-visible text

**Blocks: shadow-home token walk**

**Decision or claim broken.** The contract prohibits a level-1 heading whose text is `plan-running-totals` (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:131-132`), and §1.4 says that boundary represents what a reader sees (`:84-85`). The walk compares the `heading` token's `text` (`:158-160`). Under CommonMark, a heading's raw contents are parsed as inline content; formatting syntax is not itself the rendered text ([CommonMark ATX headings](https://spec.commonmark.org/0.31.2/#atx-headings)). `marked` preserves that inline source in `heading.text` and provides parsed child tokens separately.

**Construction.** Installed `marked` 14.0.0 produced these depth-1 tokens:

| Source heading                                 | `heading.text`              | Reader-visible text   |
| ---------------------------------------------- | --------------------------- | --------------------- |
| `# **plan-running-totals**`                    | `**plan-running-totals**`   | `plan-running-totals` |
| ``# `plan-running-totals` ``                   | `` `plan-running-totals` `` | `plan-running-totals` |
| `# [plan-running-totals][t]` plus a definition | `[plan-running-totals][t]`  | `plan-running-totals` |
| `# plan&#x2D;running-totals`                   | `plan&#x2D;running-totals`  | `plan-running-totals` |

All evade the proposed equality check while presenting the prohibited heading to a reader. The same issue applies to formatted Setext headings. Conversely, `# plan-running-totals #` is normalized by `marked` to the plain text and works, but the plan promises that behavior at `:60-62` and `:84` without including it in §2.10.

**Why no mitigation covers it.** §2.10 has plain Setext and plain inline-code-in-a-paragraph cases, but no inline formatting inside a heading, link-reference heading, character-reference heading, or the plan's own closing-`#` claim (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:303-305`). Skipping block HTML does not normalize heading inline children.

**Reachability.** None exists in the live plan. The safety-gate exemption applies: bolding or linking a duplicate section title is a plausible future edit by a human maintaining a long governance plan, and duplicate future headings are exactly what this guard exists to reject.

**Required correction.** Define “heading text” as either literal inline source or a precisely specified semantic text projection. The reader-visible rationale points toward the latter, but that projection must explicitly decide how text, emphasis/deletion, code spans, links/references, escapes, character references, inline HTML, images, and breaks contribute. Add the four constructions above, formatted Setext, the promised closing-`#` case, a nonmatching formatted heading, and the live paragraph inline-code control. If the owner instead chooses literal source, record formatted reader-equivalent headings as a deliberate residual with passing `KNOWN-OPEN:` tests.

**Fix complexity: 3.** The token walk is contained, but the normalization contract and positive/negative inline matrix must be explicit.

**Class swept.** I enumerated the installed lexer's inline token roles and executed representatives for text, emphasis/strong/deletion, code span, inline/reference link, escape, character reference, inline HTML, image, and break, across ATX and Setext block forms. Text-carrying wrappers preserve source syntax in `heading.text`; images and breaks demonstrate why “reader-visible text” itself needs an explicit boundary. The defect is comparison before defining inline interpretation, not any one formatting delimiter.

### P4 — SEV-2 — `uniqueKeys: true` does not reject an alias used as a duplicate key

The YAML contract requires each governed root key exactly once (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:128-131`). The plan relies on `parseDocument(..., { uniqueKeys: true })` for duplicates and then counts `doc.contents.items` key nodes (`:162-167`). The [library's own option documentation](https://eemeli.org/yaml/#options) says its default equality checks scalar values and does not deeply compare aliases or collections. YAML itself permits aliases to refer to previously anchored nodes and requires mapping keys to be unique ([YAML 1.2.2 §7.1](https://yaml.org/spec/1.2.2/#71-alias-nodes), [§3.2.1.3](https://yaml.org/spec/1.2.2/#3213-node-comparison)).

This valid serialization produced no parser errors under the proposed options:

```yaml
&k review_rounds_complete: 7
*k : 8
reviewer_findings: 30
findings_after_round_one: 24
```

The root items contain one scalar key with value `review_rounds_complete` and one alias key with no `.value`; the proposed count sees exactly one. `doc.toJS()` silently yields `review_rounds_complete: 8`, demonstrating that the alias denotes the same effective key. Adding `stringKeys: true` produced `NON_STRING_KEY` in the local probe while preserving aliases in values.

This is capped at SEV-2 under the reachability ruling: no such input exists today, and aliasing a totals **key** is constructible but not a plausible ordinary edit to this hand-maintained block. No safety-gate exemption is claimed.

**Owner Decision Brief.** This protects the promise that a required total cannot silently have two values. The product is not affected today; the risk is latent and synthetic. Option A is to add `stringKeys: true`, define governed keys as scalar strings, and reject key aliases or collection keys; option B is to resolve all key nodes and supply a custom equality comparator. I recommend A because this block has no need for non-string keys. Doing nothing leaves a rare but real false accept. Add an alias-as-key rejection control and retain the value-alias acceptance control.

**Fix complexity: 2.** One parser option and contract sentence, plus bidirectional controls.

**Class swept.** I checked plain, quoted, explicitly written, tagged, anchored scalar, alias, and collection-capable key roles. The affected role is a non-scalar/alias key; ordinary quoted and explicit scalar keys behave as planned.

### P5 — SEV-2 — The 30/30 prototype result is not reviewable evidence

The plan says the exact mechanism passed a 30-case pre-code harness and the live plan (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:276-282`, `:317`), but also says the prototype was discarded and never committed (`:350-351`). The table contains labels, not literal inputs, implementation, command, or output. I could independently reconstruct several categories, and that reconstruction found P1-P4, but I cannot verify that the author's exact prototype ran those exact cases or produced the stated result. The current 57/57 focused run exercises `6420bb4`, not the prototype.

**Owner Decision Brief.** This protects the difference between a measured pre-code result and an author recollection. No product code is affected; the evidence status is **unverified**. Option A is to include the literal fixtures, exact scratch mechanism or pseudocode, command, and captured output as a reviewable appendix/artifact; option B is to relabel 30/30 as author-reported and remove it as support for the plan. I recommend A. Doing nothing makes the plan's strongest assurance impossible for this review or a later audit to reproduce.

**Fix complexity: 2.** Preserve or reconstruct one small headless harness and its transcript; no production change is needed.

**Class swept.** I checked the plan's author measurements: the ten prior constructions and S4 have committed evidence, the dependency claim is reproducible, the `CANON` defect is source-visible, and the scratch-only 30/30 result is the inaccessible member.

### P6 — SEV-3 — §2.11 gives incompatible fail-against-old instructions

`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:325` says every new control must fail against `6420bb4`. Lines `:327-330` then require the generated cases that do **not** discriminate to be named. Conformance controls such as already-supported valid fence forms can be useful without failing old code, so the first universal is neither necessary nor compatible with the second instruction.

**Required correction.** Say that every control credited as proof of a repair must fail against old code; conformance/population controls may pass old code, and their per-case outcomes must still be reported. Retain the requirement to run the complete new spec unmodified and name every compatibility substitution.

**Fix complexity: 1.** This is a wording correction. **Class swept:** I read all fail-against-old commitments in §2.6, §2.10, and §2.11; the contradiction is confined to the opening sentence of §2.11.

### P7 — SEV-2 — Governed value validity disappeared from the residual list

The contract requires the three key names but imposes no constraint on their values (`PLAN_CONSISTENCY_C3_PARSER_PLAN.md:128-134`), and §2.7 does not declare that limit (`:237-249`). The prior review explicitly left governed value types unverified because the then-current contract claimed key occurrence only (`docs/reviews/plan-consistency-checker-codex-followup2-review.md:126`). That boundary should not disappear when §2.7 purports to name the residuals.

The proposed parser accepts all of these as valid YAML root values with exactly one copy of each key: `bananas`, `-1`, `null`, and `[7]`. The planned key-node count therefore certifies each as a running total. This is not a parser failure; it is an unresolved product contract.

**Owner Decision Brief.** This protects whether the canonical totals are actual counts rather than merely three labels. The live block contains ordinary non-negative integers, so the product is not affected today. Option A is to require finite non-negative integer scalar values and add string, negative, null, sequence, and alias-value controls; option B is to keep values outside C3 and declare/pin that residual. I recommend **Owner judgement needed** because Option A strengthens the owner-approved contract, while Option B preserves its historical narrowness. Doing nothing leaves the plan claiming a complete residual list while silently dropping a known boundary.

**Fix complexity: 2.** Either choice is a short contract change plus a small value-shape matrix.

**Class swept.** I exercised numeric, negative, string, null, and sequence value roles; §2.10 separately names alias-valued reuse. All are syntactically valid under the proposed YAML parse; only an explicit value contract can distinguish them.

## Answers to §2.12

1. **Not yet fully decidable as written.** “Fenced code block” and YAML root keys now have named authorities, but “closed” is a deliberate non-dialect property with no algorithm, and heading “text” is ambiguous between source markup and rendered text. P1 and P3 close those two remaining borrowed/undefined terms.
2. **Yes, `marked` 14.x is an acceptable declared authority, conditionally.** It is appropriate because the plan names the implementation rather than claiming perfect GitHub equivalence. The block quote/list recursion reaches the nested construction I probed; comments remain one HTML token; headings inside blank-separated `<details>` content remain visible top-level tokens; table cells do not become block headings. The walk must still distinguish indented from fenced `code` tokens (P2) and interpret heading inline children (P3). Link-reference definitions expose P3 rather than a missing block container.
3. **Drop the unterminated-fence departure.** CommonMark intentionally treats EOF as ending the code block. Keeping the stricter safety rule is defensible in product terms, but `marked` supplies no closure flag, so it recreates a hand-written delimiter parser at the exact boundary this remediation is meant to remove. If the owner values the swallowed-document protection more, P1 states the minimum complete alternative.
4. **Yes.** The missing verdict-flipping population includes indented code blocks; shorter, opposite-character, longer, and over-indented closer relations; formatted/link-reference/entity headings; alias keys; and the promised closing-`#` heading. These come from the host grammars and parser token model, not the prior finding list.
5. **No.** P7 covers the already-declared boundary that governed **value types and ranges are not validated**. Either add non-negative-integer validation to the contract or name and pin this as `KNOWN-OPEN:`. If literal-source heading semantics or key aliases are deliberately accepted instead of fixed, those also become residuals and need current-behavior tests.

## Claims attacked by name

| Claim                                                                       | Result                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All ten S1/S2/S3 constructions reproduce: 8 false accepts, 2 false blockers | **CONFIRMED by the committed round-3 review evidence; not re-run wholesale per this commission.** Current parser probes re-confirmed the grammar facts underlying the repair.                                                                                                |
| S4 is 14 failed / 43 passed on unmodified `69f458c`, not 12/45              | **CONFIRMED by the committed prior run at `5d71027`; not repeated this round.**                                                                                                                                                                                              |
| Shared `CANON` contains only one governed key                               | **CONFIRMED** at `tests/unit/planConsistency.spec.ts:340` and `:496`; it can satisfy older contains-only assertions for the wrong reason.                                                                                                                                    |
| Prototype 30 ok / 0 FAIL, live plan clean                                   | **UNVERIFIED** as an execution claim because the harness and output were discarded. Its stated population is incomplete; P1-P4 add grammar-derived cases.                                                                                                                    |
| §2.7 names the parser move's residuals                                      | **REFUTED**; governed value types/ranges were explicitly left unverified in the prior review and are absent here (P7).                                                                                                                                                       |
| `marked` as `^14.0.0` remains deduplicated                                  | **CONFIRMED for the planned manifest-first, committed-lockfile workflow:** a disposable `207aa04` worktree resolved one `marked@14.0.0`, shared with `monaco-editor`. CI runs `npm ci` without omitting development dependencies, so devDependency is the correct placement. |
| The current focused suite is 57/57 and the live plan is blocker-clean       | **CONFIRMED** against the current `6420bb4` checker. This does not verify the discarded prototype.                                                                                                                                                                           |
| Exactly one TypeScript consumer and declared downstream gate path           | **CONFIRMED** by repository search and the CI/workflow reads. The support module and its importing unit spec are the only TypeScript matches; `npm run test:unit`, `./tools/checks`, and CI consume it.                                                                      |
| Neither governed plan document changed at `207aa04`                         | **CONFIRMED**; the target commit adds only the parser plan.                                                                                                                                                                                                                  |

## Prior-commitment sweep

I read the three prior reviews and the current plan end to end rather than searching only their finding labels. The plan retains R2's real advisory consumer and passing consumer control, R3's count correction, S4's honest unmodified-old-run correction, the `CANON` fixture repair, one site per subject after structural validation, the plan/history boundary, the owner-accepted example-block rule, and the prohibition on editing the governed subject documents. The only prior boundary dropped from the residual account is governed value validity (P7). P1-P4 are new work introduced by the proposed parser consumption, not re-litigation of S1-S4.

## Claim ledger

| Claim                                                                  | Tag                 | Evidence                                                                        |
| ---------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| `marked` conflates fenced and indented blocks at the `code` token type | MEASURED            | Local lexer output and installed `marked` token declarations/source             |
| Raw heading text preserves inline source syntax                        | MEASURED            | Local lexer output for emphasis, code, links, references, entities, and Setext  |
| The closure departure needs information absent from a `Code` token     | MEASURED / INFERRED | Token fields plus mismatched-closer lexer outputs; P1 reasoning                 |
| `yaml` accepts an alias duplicate under `uniqueKeys: true`             | MEASURED            | Local `parseDocument` probe: zero errors; `toJS()` retained the later value     |
| P1-P3 inputs are plausible future governance edits                     | JUDGEMENT           | Reachability arguments in each finding; none exists today                       |
| Parser delegation remains the correct architecture                     | JUDGEMENT           | It removes the demonstrated line-scanner substitution while keeping scope local |

**Weakest claims.** The reachability judgements for formatted shadow headings and indented examples are necessarily prospective. They are plausible in hand-edited Markdown, but neither appears in the governed plan today. The alias-key construction is deliberately not granted that exemption and remains SEV-2.

## Disagreements

- I agree with the owner-selected parser-delegation approach and do not recommend returning to a raw-line syntax or demoting C3.
- I disagree with retaining the unterminated-fence departure as currently planned. My recommendation is to follow CommonMark at EOF; the owner may instead retain the protection only after P1 specifies and tests the additional delimiter parser.
- I do not treat the discarded 30/30 result as verified. This disputes its evidence status, not the author's statement that a scratch run occurred.
- I accept the plan/history asymmetry, advisory heuristic boundary, and one-site-per-subject behavior. I do not reopen them.

## Method and results

Everything was headless. No Electron, integration, e2e, live-HA, or browser process was launched.

| Command / check                                                                                                                                                              |  Exit | Result                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git show --stat --name-status --format=fuller 207aa04` plus numbered reads of the plan, `CLAUDE.md`, OA §3.4/§4, prior review, support, spec, package lock, and CI workflow |     0 | Target and authority read; target commit adds only the plan.                                                                                                                                                            |
| `npm ls marked yaml monaco-editor --all`                                                                                                                                     |     0 | Current tree has `marked@14.0.0` through `monaco-editor@0.55.1` and direct `yaml@2.9.0`.                                                                                                                                |
| Inline `node --input-type=module` lexer probes for leaf blocks, nested containers, HTML, tables, headings, and links                                                         |     0 | Established P2/P3 and found no additional block-container omission.                                                                                                                                                     |
| Inline `node --input-type=module` closer-relation probe                                                                                                                      |     0 | Shorter and opposite-character endings remain token content; longer same-character ending closes.                                                                                                                       |
| Inline `node --input-type=module` YAML probes for multiple documents, explicit/tagged keys, aliases, and value shapes                                                        |     0 | Multiple documents error; ordinary key forms work; alias duplicate bypasses default uniqueness; string, negative, null, and sequence values all parse.                                                                  |
| Alias-key probe repeated with `stringKeys: true`                                                                                                                             |     0 | Produced `NON_STRING_KEY`, validating the contained P4 remedy.                                                                                                                                                          |
| Disposable-worktree manifest-first dependency simulation: add `^14.0.0`, `npm install --package-lock-only --ignore-scripts`, `npm ls --package-lock-only marked --all`       |     0 | One deduplicated `marked@14.0.0`; worktree removed.                                                                                                                                                                     |
| Earlier discarded dependency simulation with a mistaken trailing `git diff` argument                                                                                         |   128 | Operator error only; no evidence credited. The two package-file edits were immediately removed with `apply_patch`, the worktree was removed, and `git status --porcelain` returned empty before either repository gate. |
| `npx vitest run tests/unit/planConsistency.spec.ts --reporter=verbose`                                                                                                       |     0 | 57/57 passed.                                                                                                                                                                                                           |
| `./tools/checks`                                                                                                                                                             | **0** | Lint 0 errors / 145 warnings; Prettier pass; typecheck pass; 1470/1470 tests across 105 files.                                                                                                                          |
| Repository-wide TypeScript consumer search and `git diff --quiet 207aa04^..207aa04 -- <plan> <history>`                                                                      |     0 | Declared consumer radius confirmed; neither governed subject changed.                                                                                                                                                   |

The local parser probes were review instruments, not committed tests. They created no files. All disposable worktrees were removed before the focused and repository gates.

## UNVERIFIED

- The discarded 30-case prototype, its exact inputs, and its output remain unverified (P5).
- No implementation exists, so no proposed `checkPlan` behavior, fail-against-`6420bb4` population, post-repair test count, or post-repair live-plan verdict could be run.
- A deeper repeat is **N/A** for this plan-only review and deterministic string parser. The focused suite and full repository gate were each run once.
- External CI was not inspected as a run. The local gate passed at `207aa04`; GitHub Actions status is unverified.
- Governed value types/ranges remain unverified and absent from §2.7, as answered above.
- No merge, push, PR-body edit, state update, snapshot/baseline change, governed-plan edit, or `ha.home.local` write was performed.

## MemPalace drawer candidates

The project-drawer write was attempted and refused because another MCP writer holds the per-palace lease. Under MP-LEASE, the write-enabled author should file the following with `added_by="codex"`; no process was stopped and no override was set.

- **HAVDM / investigations:** The C3 parser plan at `207aa04` has three blocking token-boundary gaps before implementation: `marked` code tokens include indented blocks, heading `text` preserves inline source rather than reader-visible text, and the strict EOF departure requires a delimiter relation that `marked` does not expose. It also has a non-blocking YAML alias-key duplicate bypass and an inaccessible 30/30 prototype transcript. Source: `docs/reviews/plan-consistency-c3-parser-plan-review.md`.
- **Practice / verification candidate:** When delegating validation to a parser, enumerate what each returned token category contains and which contract properties the parser does **not** expose. A broad AST tag can still combine semantically distinct forms, while an extra dialect departure can silently reintroduce the hand parser the dependency was meant to replace. Evidence: HAVDM PR #154 C3 pre-code plan review; keep the full case study in the HAVDM wing.
