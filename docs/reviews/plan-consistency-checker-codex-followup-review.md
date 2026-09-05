Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

Verdict: **SEV-1-BLOCKED** — F1, F3, F4, and F5 are repaired and F6 is honestly acknowledged, but F2's supposedly decidable half still certifies missing, duplicated, and unfenced canonical data as clean.

# Follow-up review — PR #154 plan-consistency-checker repair

Scope: repair commit `69f458cfde5947812a0df0b49daba1491c7920e7`, reviewed against the prior-review commit `94aee56` and the independently declared blast radius.

## Findings

### R1 — SEV-1 — C3 validates a marker occurrence, not a canonical totals block

The narrowed contract is valid in principle: prose interpretation may remain advisory while a finite canonical grammar blocks. The implementation does not enforce that finite grammar.

`tests/support/planConsistency.ts:281` starts its match at a `# plan-running-totals` line and ends it at any later closing fence; it never requires an opening YAML fence. When exactly one such match exists, lines 290–299 silently accept absent keys. The `seen` set also collapses duplicate occurrences before cardinality can be checked. Therefore “one site per subject, never per key” has accidentally become “zero or many occurrences of a key can still be one valid site.” Two distinct finding keys sharing one home must count as one site; two copies of the same key with conflicting values must not be accepted.

Two temporary, expected-red probes established the whole class:

- A minimal valid C1/C4 population tested a marker-only fenced shell, an unfenced marker, a duplicated governed key, a missing review-round key, and missing finding keys. `npx vitest run tests/unit/planConsistency.followup.probe.spec.ts --reporter=verbose` exited **1** with **5/5 failed**; every failure showed that `blockingFindings(...)` was `[]`.
- A matched-population probe read the real plan/history/DSL and mutated only the canonical home. Deleting `review_rounds_complete`, deleting both finding-total keys, duplicating `review_rounds_complete` with value `999`, or deleting the opening fence all returned zero blockers. `npx vitest run tests/unit/planConsistency.followup-live-mutation.probe.spec.ts --reporter=verbose` exited **1** with **4/4 failed**.

The committed tests at `tests/unit/planConsistency.spec.ts:314–327` cover zero markers, two blocks, and one valid key plus prose. They never corrupt the payload or delimiters, so they could not have detected this false accept. This is a relabelled fail-open in F2's decidable half, not a disagreement with the owner's advisory ruling.

Required correction:

1. Recognise a complete fenced YAML block and require the marker inside that block, rather than accepting a marker followed by an arbitrary later closing fence.
2. Validate the required canonical keys and their exact occurrence cardinality before treating the block as a site. Preserve one **site per subject** after validation, while rejecting a missing or duplicated exact key.
3. Commit fail-against-current controls for the four matched live-plan mutations above. The repaired tests must fail at `69f458c` before the next fix is credited.

### R2 — SEV-2 — Advisory findings are discarded, not reported

The new contract and disposition both say advisory findings are “reported but never block.” `blockingFindings` removes them at `tests/support/planConsistency.ts:46–48`, and the only consumer at `tests/unit/planConsistency.spec.ts:291–297` immediately asserts on that filtered list. It does not print, annotate, or otherwise publish the remaining advisory findings. Repository-wide TypeScript search found no second consumer.

In a disposable repaired worktree I appended the measured sentence `Across two review rounds, option A was rejected.` to the real plan and ran the focused spec. The canonical site plus that prose site produced the advisory condition, yet `npx vitest run tests/unit/planConsistency.spec.ts --reporter=verbose` exited **0** with **40/40 passed** and the captured output contained **0** occurrences of the diagnostic text (`looks asserted at` / `Heuristic: verify before acting`). The `KNOWN-OPEN:` control proves only that the finding object is filtered; it does not exercise delivery through the real gate.

Required correction: make the live gate surface every advisory on a passing run while continuing to fail only on `blockingFindings`, and add a gate-path control that proves both properties: exit 0 and a visible diagnostic.

### R3 — SEV-3 — The fail-against-old disposition miscounts its passing controls

The claimed discriminator is real: the repaired 40-test spec against the old implementation produced **9 failed / 31 passed**. Because the old spec had 24 tests and the repair added 16, **seven** new tests passed against old, not six as stated at `docs/reviews/plan-consistency-checker-repair-dispositions.md:66–69`. The omitted seventh is `F3: CONTROL — a MISSING leg 1 is deliberately NOT unverifiable`.

Required correction: change “six” to “seven” and include the missing-leg control in the explanation. The `9 of 16` claim itself remains correct.

## Prior-finding resolution / regression table

| ID  | State                         | Confidence | Follow-up conclusion                                                                                                                                                                                                                         |
| --- | ----------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **RESOLVED**                  | High       | Reproduced the old `23 passed / 1 skipped`, exit 0 result after renaming the plan. The repaired spec exited 1, named the missing path, and did not skip.                                                                                     |
| F2  | **REGRESSED / STILL OPEN**    | High       | Zero/two markers are now blocked and a valid canonical site is counted, but nine structural corruptions across synthetic and real-plan populations returned zero blockers. See R1.                                                           |
| F3  | **RESOLVED**                  | High       | Missing section, zero steps, missing helper, and duplicate helper are covered by committed controls; source review plus an independent duplicate-leg probe confirmed the other duplicated-anchor branch. I accept the missing-leg narrowing. |
| F4  | **RESOLVED**                  | High       | The historical-prose false positive no longer blocks. R2 is a new delivery defect in the promised advisory path, not persistence of F4's blocking behavior.                                                                                  |
| F5  | **RESOLVED**                  | High       | Plain and bold rows are committed controls; an independent underscore-emphasis probe also passed. The genuinely undispositioned control still fires.                                                                                         |
| F6  | **ACKNOWLEDGED — SUFFICIENT** | High       | Code, message, and comments now claim textual incoming callers rather than reachability. The disconnected-cycle `KNOWN-OPEN:` test honestly pins current behavior.                                                                           |

## Claims attacked by name

- **“No new code fires on the live documents” — confirmed.** A temporary probe asserted on the complete, unfiltered `checkPlan` result for the real plan/history/DSL and passed **1/1**, exit 0. The focused committed spec also passed 40/40. This says only that today's documents are clean; R1 shows corrupt future forms can still be falsely certified.
- **“9 of the 16 new tests fail against `94aee56`” — confirmed.** In a disposable `94aee56` worktree I restored the repaired spec and added the stated one-line identity shim: `blockingFindings(f) => [...f]`. The run exited 1 with **9 failed / 31 passed**. The shim does not weaken the discriminator: old `PlanFinding` objects have no advisory state and old semantics block on every finding, so identity is the faithful compatibility behavior. The prose-advisory test correctly fails old because old C3 blocks.
- **“F1 proved fail-against-old” — confirmed.** With the plan renamed, the untouched old spec exited 0 with **23 passed / 1 skipped**. The repaired spec exited 1 with **2 failed / 38 passed**; its primary failure names `docs/testing/SPACING_HELPER_PRESET_PLAN.md`. The second control also fails by unconditional read.
- **“One site per subject, never per key” — principle confirmed, implementation incomplete.** The two distinct finding keys in the real canonical block must contribute one finding-subject site. That does not permit zero required keys or duplicate occurrences of the same key; R1 demonstrates both false accepts.
- **“The `KNOWN-OPEN:` tests assert current behavior deliberately” — mostly confirmed.** The C1 cycle, quoted total, and unsupported-number tests honestly pin current behavior. The advisory test honestly pins object creation and filtering, but does not prove that the gate reports the object; see R2.

## Method and results

Everything executed headlessly. No Electron, integration, e2e, or live-HA process was launched.

| Check                                                                                            | Result                                                                                                              |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `git diff 94aee56..69f458c` and `git log -1 --format=%B 69f458c`                                 | Exit 0; inspected the complete repair and reasoning.                                                                |
| `git diff --name-only 94aee56..69f458c`                                                          | Exit 0; exactly the commissioned three files.                                                                       |
| `rg -n "planConsistency\|checkPlan\|blockingFindings" --glob '*.ts' --glob '!node_modules/**' .` | Exit 0; the support module has exactly one importing consumer, its unit spec.                                       |
| `npx vitest run tests/unit/planConsistency.spec.ts --reporter=verbose` at `69f458c`              | Exit 0; **40/40 passed**.                                                                                           |
| Unfiltered live-population probe                                                                 | Exit 0; **1/1 passed**, proving no current blocking or advisory finding.                                            |
| C3 minimal structural probe                                                                      | Expected-red exit 1; **5/5 failed**, all with an empty blocker list.                                                |
| C3 matched real-plan mutation probe                                                              | Expected-red exit 1; **4/4 failed**, all with an empty blocker list.                                                |
| Repaired spec against old implementation plus identity shim                                      | Expected-red exit 1; **9 failed / 31 passed**.                                                                      |
| Old spec with live plan renamed                                                                  | Exit 0; **23 passed / 1 skipped**.                                                                                  |
| Repaired spec with live plan renamed                                                             | Expected-red exit 1; **2 failed / 38 passed** and the required path was named.                                      |
| Repaired gate with one live historical `Across…` sentence                                        | Exit 0; **40/40 passed**, **0 visible advisory messages**.                                                          |
| Independent duplicate-leg and underscore-emphasis controls                                       | Exit 0; **2/2 passed**.                                                                                             |
| Final clean-state `./tools/checks` after deleting every temporary probe                          | **REAL_EXIT=0**; lint 0 errors / 145 warnings, Prettier pass, typecheck pass, **1453/1453 tests across 105 files**. |

The load-bearing suite and repository gate both ran once in their final clean state. The earlier exploratory runs are not counted as a deeper repeat.

## Blast radius

The declared radius is materially accurate. The repair diff contains only:

- `tests/support/planConsistency.ts`
- `tests/unit/planConsistency.spec.ts`
- `docs/reviews/plan-consistency-checker-repair-dispositions.md`

The support module is imported only by its own unit spec. The live consumer reads the two spacing-plan documents and `tests/support/dsl/spacing.ts`. `npm run test:unit` is the immediate downstream runner; `./tools/checks` and `.github/workflows/ci.yml` invoke it. No `src/`, Electron path, e2e/integration spec, snapshot, baseline manifest, plan document, or governance source was changed by the repair. R2 concerns what that one declared consumer does with advisory output, not an undisclosed consumer.

## Disagreement and narrowed rulings

I withdraw the initial review's demand that a missing leg-1 anchor must itself make C4 unverifiable. C4's narrowed question is conditional: if a dependent leg exists, it cannot precede the helper. A plan may schedule no such leg, while the helper remains the prerequisite anchor whose absence makes the check undecidable. The committed negative control and the repaired duplicate/ordering branches support that boundary.

I also accept the owner's blocking/advisory split for C3. R1 does not ask a regex to decide what prose is about; it asks the blocking half to validate the finite block syntax and payload it claims to own. R2 asks the advisory half to reach a human, as its claim already says.

## UNVERIFIED

- A deeper repeat remains **N/A**, unchanged from the first review: this is a deterministic pure-string checker with no timing, retry, or external-state dimension.
- Electron e2e/integration and live HA were **UNRUN** because no production or browser path is in the repair radius. The commission's headless rule was observed for every ad-hoc probe.
- No external CI execution or PR status was inspected. The local CI-equivalent gate passed.
- C1 semantic reachability and semantic classification of C3 prose remain deliberately unverified, explicitly narrowed, and pinned as `KNOWN-OPEN:` behavior.
- No merge, push, PR-body edit, state update, snapshot change, baseline edit, or `ha.home.local` write was performed.

## MemPalace drawer candidates

The write-enabled author should file these with `added_by="codex"`:

- **Practice:** A non-blocking finding is not a delivered advisory merely because a helper returns it. At least one real gate consumer must surface it on a passing run, and the test must exercise that consumer path.
- **Practice:** When a repair narrows a checker to a finite grammar, adversarially validate the grammar's payload cardinality and delimiters, not only the presence of its marker token.
- **HAVDM project:** `planConsistency` C3's blocking contract needs one properly fenced `plan-running-totals` block with each governed key at its exact cardinality; distinct keys may still collapse to one site per subject only after structural validation.
