Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

Verdict: **SEV-1-BLOCKED** — R2 and R3 are repaired, but R1's new line scanner still certifies text inside YAML scalars as governed keys, accepts non-fences as canonical fences, and misses shadow homes nested in Markdown containers.

# Second follow-up review — PR #154 plan-consistency-checker repair

Scope: repair commit `6420bb4e1a2a4af8c9e7d987c3313ce35c02fd51`, reviewed against follow-up commit `7909c6f` and the independently declared blast radius.

## Findings

### S1 — SEV-1 — Key cardinality counts key-shaped text, not YAML keys

The scanner at `tests/support/planConsistency.ts:394–405` counts every body line matching `^\s*<key>\s*:`. It does not know whether that line is a mapping key, nested data, or scalar content.

An expected-red probe supplied this valid YAML body:

```yaml
notes: |
  review_rounds_complete: 7
  reviewer_findings: 30
  findings_after_round_one: 24
```

The YAML document has one top-level key, `notes`, whose value is a string. It has **zero governed keys**. `checkPlan` nevertheless returned no `C3-NOCANONICAL`. The reverse also fails: one real copy of every governed key plus `review_rounds_complete: 6` inside a `notes: |` scalar was rejected as a duplicate. The repository's `yaml` parser confirmed both documents parse without error and that the apparent inner “keys” are string content.

A second false accept used one plain `review_rounds_complete` plus a quoted duplicate, `"review_rounds_complete": 999`. The YAML parser reports a duplicate-map-key error, while C3 counts only the plain spelling and certifies the block. Thus missing, duplicated, and legitimate cardinality can all be misclassified despite the new exact-once claim.

Required correction: parse the canonical body as YAML with duplicate-key errors enabled, require a top-level mapping, and inspect its own keys rather than matching lines. Reject malformed YAML and semantic duplicates; ignore key-shaped text inside scalar values or nested structures. Add fail-against-`6420bb4` controls for all three cases above.

### S2 — SEV-1 — The fence state machine does not parse Markdown containers or valid fence openers

Both scans apply the same whitespace-and-delimiter regex against raw lines (`tests/support/planConsistency.ts:337–373`). That accepted language differs materially from the fenced-code-block contract:

- A backtick opener whose info string contains another backtick was accepted as the canonical fence. It is not a Markdown fence; the repository-resolved `marked` parser reads the line as a paragraph and the marker as a heading. [CommonMark §4.5](https://spec.commonmark.org/0.31.2/#fenced-code-blocks) likewise forbids a backtick in a backtick fence's info string.
- A top-level fence preceded by a tab was accepted because `\s` counts the tab as one character. Markdown block indentation expands that tab to four columns, so `marked` does not parse it as a fenced block. CommonMark permits at most three **spaces** before a fence.
- With one valid top-level canonical block present, a second fenced canonical block inside a Markdown block quote was ignored. `marked` produced a `blockquote` containing a `code` token whose first content line is the exact marker, yet C3 returned clean.
- Blockquoted and list-item forms of an unfenced marker plus conflicting governed values also evaded `strayMarkers`, because raw `line.trim()` retains the `>` or list marker. This directly violates the claimed “any unfenced marker outside a fence invalidates” rule.
- An unindented fence whose marker line had four leading spaces was accepted because `body[0].trim()` erases the content indentation, despite the contract saying the first content line is exactly the marker.

These are five independent false-accept constructions generated from delimiter, indentation, container, and marker-position rules. They are not variants of R1's previous examples. The owner-accepted behavior that a second example block blocks is also inconsistent: a top-level example blocks, while the same fenced example inside a block quote disappears.

Required correction: define the Markdown dialect explicitly and parse its block/container structure, or narrow the contract to a literal top-level syntax that does not call non-fences “fenced code blocks.” Whichever boundary is chosen must reject invalid backtick/tab openers, apply marker position after the fence's defined indentation normalization, and treat container-nested fenced or unfenced shadow homes consistently. Commit fail-against-`6420bb4` controls for each construction.

### S3 — SEV-2 — A legitimate marker reference inside an HTML comment blocks the gate

The stray-marker scan treats any raw outside-fence line whose trim equals the marker as a shadow home. Consequently this documentation-only reference beside a valid block emits `C3-NOCANONICAL`:

```html
<!--
# plan-running-totals
This is documentation, not a home.
-->
```

`marked` classifies the whole construction as one HTML comment block. It cannot declare a visible or machine-readable totals home. The live one-line inline-code reference is safe, but the claim is not safe across legitimate ways the plan can refer to its own marker. This is the same disable-the-noisy-gate risk as the earlier prose false positive.

Required correction: make stray-marker detection token-aware so comments and other non-content references are exempt, and add negative controls for the live inline form plus multiline HTML comments. The owner's explicitly accepted nuisance red for a real example code block does not imply accepting comments as homes.

### S4 — SEV-3 — The published 12/45 old-code transcript requires an undisclosed backport

The useful claim is valid: 12 of the 16 new R1 grammar controls discriminate against `69f458c`, and the four non-discriminators are honestly identified. The exact transcript is not a run of the repaired spec against the unmodified old implementation.

In a disposable `69f458c` worktree, restoring the `6420bb4` spec and changing nothing else produced **14 failed / 43 passed**, exit 1: the 12 R1 failures plus two `TypeError: reportAdvisories is not a function` failures in the live and R2 tests. Backporting the complete new `advisoryFindings` and `reportAdvisories` implementation into the old support module produced the published **12 failed / 45 passed**. That substitution supplies R2's repair and is precisely why the two structural failures disappear.

Required correction: retain the honest 12/16 R1 statement, but replace “the repaired spec was run against `69f458c`: 12/45” with the actual unmodified result, or explicitly label the hybrid/backport used to isolate R1. R2's missing export is valid structural fail-against-old evidence; it must not be silently removed from the population total.

## R1–R3 resolution / regression table

| ID  | State                      | Confidence | Follow-up conclusion                                                                                                                                                                                                                                                                         |
| --- | -------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **REGRESSED / STILL OPEN** | High       | The independently reconstructed 23-case floor passes, but 8 new false accepts and 2 new false blockers expose Markdown and YAML semantic gaps. S1 and S2 are independently sufficient blockers.                                                                                              |
| R2  | **RESOLVED**               | High       | The real live gate calls `reportAdvisories`. With an advisory injected into the real plan in a disposable worktree, the suite passed 57/57 and emitted one visible `C3-COUNTDRIFT` warning. The injected logger makes the delivery control testable without suppressing production delivery. |
| R3  | **RESOLVED**               | High       | Round 1 now says seven and names the omitted missing-leg control. The explanation and enumeration agree.                                                                                                                                                                                     |

## Claims attacked by name

- **“23 ok, 0 FAIL” — reproduced, then exceeded.** I independently reconstructed 23 cases from the declared categories: 7 accepted fence/reference forms and 16 rejected absence, multiplicity, payload, marker-position, and termination forms. All **23/23 passed**. Ten further grammar-derived cases failed against the claimed behavior after one invalid exploratory expectation was discarded using `marked`'s parse result.
- **“12 of 16 new controls fail against `69f458c`” — the R1 subset is confirmed; the full transcript is not.** Exactly 12 R1 controls discriminate and four do not. Unmodified old code yields 14/43 for the full 57-test spec; 12/45 requires backporting R2. See S4.
- **“Neither plan document was edited” — confirmed.** `git diff --quiet 7909c6f..6420bb4 -- docs/testing/SPACING_HELPER_PRESET_PLAN.md docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md` exited 0.
- **“One site per subject, never per key” — confirmed only after valid structure.** The current live block contributes one finding site despite two distinct finding keys. S1 shows the prerequisite key validation is not semantic, so site grouping cannot rescue malformed payloads.
- **“1453/105 → 1470/105, gate REAL_EXIT=0, 4/4” — confirmed.** The final clean-state local gate passed with the reported population and warning count.
- **The `KNOWN-OPEN:` tests — honest local pins, but some fixtures are no longer gate-clean.** Their assertions still break if the named behavior changes. The shared `CANON` fixtures omit two now-required keys, so they also emit `C3-NOCANONICAL`; the valid live-plan R2 control, not those fixtures, is the reliable proof that advisory drift can coexist with zero blockers. This is test hygiene, not an additional blocker.

## Advisory delivery and plan/history asymmetry

`reportAdvisories` is a real delivery path, not a renamed filter. The live consumer calls it before checking blockers, the function invokes an injectable sink once per advisory, and the matched live-plan run visibly wrote the warning while exiting 0. R2 is closed.

Scanning canonical structure only in the plan is defensible under the expressly narrowed contract: the active authoritative home is required in the plan, while history is archival and its existing marker references are prose. Moving the only block to history still leaves the plan invalid. This boundary must remain explicit; extending structural scanning to history would require the same Markdown-aware reference handling identified above.

## Method and results

Everything executed headlessly. No Electron, integration, e2e, or live-HA process was launched.

| Check                                                                  | Result                                                                                                                                             |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git diff 7909c6f..6420bb4` and `git log -1 --format=%B 6420bb4`       | Exit 0; inspected the complete three-file repair and reasoning.                                                                                    |
| `npx vitest run tests/unit/planConsistency.spec.ts --reporter=verbose` | Exit 0; **57/57 passed**.                                                                                                                          |
| Independent 23-case floor plus 10-case extension probe                 | Expected-red exit 1; floor **23/23 passed**, extensions **10/10 failed** against their claimed outcomes. Probe deleted before the repository gate. |
| Local `marked` and `yaml` semantic checks                              | Exit 0; confirmed blockquote code nesting, invalid fence forms, scalar contents, and quoted duplicate-key behavior.                                |
| Full current spec against unmodified `69f458c` support                 | Expected-red exit 1; **14 failed / 43 passed**.                                                                                                    |
| Same run after backporting the complete R2 delivery helpers            | Expected-red exit 1; **12 failed / 45 passed**.                                                                                                    |
| Actual live gate with one advisory-producing sentence                  | Exit 0; **57/57 passed**, one visible `[planConsistency ADVISORY] C3-COUNTDRIFT` message.                                                          |
| Plan-document diff check                                               | Exit 0; neither plan nor history changed in the repair.                                                                                            |
| Final `./tools/checks` after deleting all temporary probes             | **REAL_EXIT=0**; lint 0 errors / 145 warnings, Prettier pass, typecheck pass, **1470/1470 tests across 105 files**.                                |

The load-bearing suite and final repository gate ran once in their final clean state. Exploratory runs are not counted as a deeper repeat.

## Blast radius

The declared radius is materially accurate. `git diff --name-status 7909c6f..6420bb4` contains only the disposition table, `tests/support/planConsistency.ts`, and `tests/unit/planConsistency.spec.ts`. After probe deletion, repository-wide TypeScript search found only the support module and its one importing unit spec. `npm run test:unit` is the immediate runner; `./tools/checks` and CI's `ci` job invoke it. No production, Electron, e2e/integration, snapshot, baseline, plan, or governance source changed.

S1–S3 are inside the declared consumer and input radius; they do not reveal an omitted downstream consumer.

## Disagreement with the commission

- The commission's final note says the last two reviews found “three SEV-1s each.” Round 1 found three SEV-1s; the first follow-up found one SEV-1, one SEV-2, and one SEV-3. This does not affect the rollback-trigger conclusion.
- I applied standard Markdown/CommonMark semantics to the phrase “fenced code block.” If the owner intended a repository-private raw-line syntax, it must be named as such. S1's YAML scalar/duplicate failures remain under either interpretation because the contract calls the matched items keys.
- I accept the deliberate missing-leg and plan/history boundaries and do not reopen them.

## UNVERIFIED

- A deeper repeat remains **N/A**, unchanged: this is a deterministic pure-string checker with no timing, retry, or external-state dimension.
- Electron e2e/integration, live HA, and external CI were **UNRUN** because no production or browser path is in the repair radius. Every ad-hoc probe was headless.
- The extended population is evidence, not a proof of complete Markdown/YAML coverage. Governed value types were not assessed because the commissioned contract claims key occurrence, not numeric-value validation.
- C1 semantic reachability and semantic interpretation of prose remain intentionally unverified and pinned as `KNOWN-OPEN:` behavior.
- No merge, push, PR-body edit, state update, snapshot/baseline change, or `ha.home.local` write was performed.

## MemPalace drawer candidates

The write-enabled author should file these with `added_by="codex"` and update the relevant index in the same pass:

- **Practice:** A line-state scanner is not automatically a parser. When a contract names semantic units from nested host grammars, generate cases where token-shaped text appears in a different semantic role and where container syntax changes the raw prefix.
- **Practice:** A fail-against-old population total must name every compatibility substitution. If the new test imports a function absent from old code, report the unmodified structural failure separately from any hybrid run used to isolate another finding.
- **HAVDM project:** C3 currently confuses governed keys with key-shaped YAML scalar text, ignores Markdown-container shadow homes, accepts invalid backtick/tab fence openers, and treats standalone marker text inside HTML comments as a home.
