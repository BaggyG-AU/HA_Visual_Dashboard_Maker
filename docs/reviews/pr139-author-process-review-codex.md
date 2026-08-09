Author: OpenAI Codex, 2026-08-09
Subject: the PR #139 author's process, not PR #139's artifact or merge readiness
Owner gate: BaggyG-AU decides whether to adopt this process change

# PR #139 author-process review

## Answer

**MEASURED — population.** I counted the rows in the supplied ledger: ten
rounds-1–5 blockers, two notes, three round-6 Codex items, and one author-found
item: **16 named defects total, comprising 15 reviewer findings and one
author-found defect**. The separately reported eight self-found fix-commit
defects are positive-control evidence about the method, not additional rows in
that 15-plus-one ledger.

**MEASURED — result.** A specific author-published check available by the
relevant handoff would have exposed **14 of the 16** named defects if executed
against the artifact it questioned. The two exceptions are R5-N1 and R6-N1;
neither commission named the missing falsification. “Would catch” below means
the check directly traverses or constructs the condition in the supplied
defect account, not merely that a generic request to “review carefully” might
have helped.

**MEASURED — source key.** “Round 1” below is
`prompts/codex/governance-review-invariant-implementation.md`; rounds 2–6 are
the correspondingly suffixed `governance-review-invariant-implementation-roundN.md`
files.

| Finding | Author's own published check that would catch it if run                                                                                                                                                                                               | Why it was not run                                                                                                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1      | **MEASURED:** Round 1 lines 82–84 asks whether permanent-looking class (d) is coherent with the F5/F8 pilot.                                                                                                                                          | **MEASURED:** no author-run disposition or trace was published before handoff. **INFERRED:** the question was delegated to the reviewer; motive is unverified.                                          |
| M2      | **MEASURED:** Round 1 lines 85–86 and 97–99 ask whether “narrow” is followable and whether one round is the right cut, explicitly offering “until no Major remains.” Walking one repair through those questions exposes the missing trigger and exit. | **MEASURED:** no worked lifecycle trace was published. **INFERRED:** the qualitative question was handed over without executing the scenario; motive is unverified.                                     |
| M3      | **MEASURED:** Round 1 lines 93–104 asks whether n=1 can support the binding rule and requires the claimed reruns to be checked against the prior review record.                                                                                       | **MEASURED:** no source-to-claim replay was published before handoff; the reviewer found the claimed round-1 rerun had not occurred.                                                                    |
| M4      | **MEASURED:** Round 1 lines 41–46 asks whether MP-LEASE matches the working convention; lines 113–116 require the complete stale-consequence sweep. Following the reviewer role through the governed instructions exposes both destinations.          | **MEASURED:** no end-to-end destination trace was published. **INFERRED:** the sweep followed changed wording rather than the reviewer's behavioural route; motive is unverified.                       |
| R2-M1   | **MEASURED:** Round 2 lines 88–91 asks whether the blocklist can be gamed; lines 135–140 require checking for a third surface after `tools/`.                                                                                                         | **MEASURED:** the author ran the named `tools/` instance and fixed it, but published no completed trace for the “third surface” sweep; the reviewer then found root files and workflows.                |
| R2-M2   | **MEASURED:** Round 2 lines 109–115 asks whether the contradiction survives for a no-MemPalace reader of `ai_rules.md`.                                                                                                                               | **MEASURED:** the author published the deviation for reviewer judgement instead of resolving it before handoff.                                                                                         |
| R3-M1   | **MEASURED:** Round 3 lines 163–166 says to construct a behaviour-bearing repair that still passes and run the shipped command on real ranges.                                                                                                        | **MEASURED:** the audit records that this construction was not run. **INFERRED:** the measured 11.4-minute fix cadence disfavoured a real-fixture pass; individual motive is unverified.                |
| R3-M2   | **MEASURED:** Round 3 lines 195–202 says to read §11 straight through and reconcile five named surfaces to one destination.                                                                                                                           | **MEASURED:** the author instead swept by grepping the already-known token `PR body`; the third destination used a different key.                                                                       |
| R3-N1   | **MEASURED:** Round 3 lines 256–263 asks whether the new history violates the document's pointer-only constitution.                                                                                                                                   | **MEASURED:** the author explicitly flagged the concern and did not act before handoff.                                                                                                                 |
| R4-M1   | **MEASURED:** Round 4 lines 175–181 names renames and deletions in `--name-only` output and asks whether any behaviour-bearing path still passes.                                                                                                     | **MEASURED:** the self-pass exercised hostile path strings, not real Git rename records; the named rename case was not run.                                                                             |
| R5-M1   | **MEASURED:** Round 5 lines 163–172 names a range that adds then removes a behaviour path and requires real change-record cases.                                                                                                                      | **MEASURED:** the published self-pass built other real commits but omitted that named transient-history case. **INFERRED:** its cost exceeded the 3.4–15.7-minute repair cadence; motive is unverified. |
| R5-N1   | **MEASURED:** **No contemporaneous author-published check would catch it.** The self-pass asserted the default-config observation; it did not vary `core.quotePath`. Testing both settings appeared only in round 6, after the note.                  | **MEASURED:** the needed configuration case was not yet written.                                                                                                                                        |
| R6-M1   | **MEASURED:** the author's audit extracted the command, proved it live on known-bad input, and exercised a combined merge record beyond the mandated list; Round 5 lines 171–172 had also named the `$2`/combined-record question.                    | **MEASURED:** this check **was run** in the audit and caught the defect before round 6; there is no missed-execution explanation for this row.                                                          |
| R6-M2   | **MEASURED:** Round 6 lines 239–257 expressly names untested `diff.*` variables and a path added via `git replace`.                                                                                                                                   | **MEASURED:** the author ran adjacent `GIT_CONFIG_*` and option-interaction cases but skipped those two named populations.                                                                              |
| R6-M3   | **MEASURED:** Round 6 lines 329–343 requires verifying that the command did not exist at the original commit and checking the audit's causal classification. Comparing that result with the new rationale exposes the contradiction.                  | **MEASURED:** the self-pass published extensive command-case traces but no audit-to-rationale reconciliation. **INFERRED:** execution stayed on the mechanism surface; motive is unverified.            |
| R6-N1   | **MEASURED:** **No specific author-published check would catch it.** Round 6 asks for several audit counts, but not recomputation of the terminal “twelfth defect” ordinal; treating conclusions as claims is counsel, not a defined count check.     | **MEASURED:** the needed derived-count reconciliation was not written.                                                                                                                                  |

## The one process change

**JUDGEMENT — adopt a zero-`UNRUN` commission handoff gate.** Add a mandatory
`Author execution ledger` section to
`docs/templates/ADVERSARIAL_REVIEW.md`, instantiated at the end of each
commission under `prompts/codex/` before `Delivery`. Before handing the
commission to a reviewer, split each commissioned question, named hostile case,
and weakest claim into one atomic row—R6's `diff.*` and `git replace`, for
example, must be separate rows—and record: `ID`, exact probe or worked scenario,
expected result declared before execution, actual result or output pointer,
disposition (`PASS`, `FIXED`, `OWNER-ACCEPTED`, or `UNRUN`), and target commit
SHA. The author cannot self-award `OWNER-ACCEPTED`. Handoff is permitted only
with `OPEN=0`; an amend invalidates the declaration until the affected rows are
rerun.

**JUDGEMENT — visible trace and skip signal.** A performed pass leaves the
ledger and a one-line header—`AUTHOR SELF-PASS: COMPLETE; target=<SHA>;
OPEN=0`—inside the same commission the owner and reviewer receive. A missing
ledger, any `UNRUN`/blank result, `OPEN>0`, or a target SHA different from the
commissioned head is the at-a-glance signal that handoff was skipped or became
stale. This is the cheapest change because it adds no new runner and targets
the measured four-round failure directly: named checks existed but lacked
execution traces.

**MEASURED — limit shown by PR #140.** This gate would have exposed the
published weakest claim M2 and the stale target behind N1, but not M1: the
author examined that winning surface and omitted it from the commission.
**JUDGEMENT:** that limit does not displace the cheapest change for the measured
14-of-16 population; it defines the first runner-up.

**JUDGEMENT — runner-up 1:** keep an append-only `Self-pass observations` block
in the commission while working; a suspicion described as “arguable”, “in
scope”, or “flag for review” may be dispositioned but not deleted, making PR
#140's omitted M1 decision visible.

**JUDGEMENT — runner-up 2:** move executable governance examples into a tracked
fixture suite run by `./tools/checks`; it permanently covers the mechanism
lineage but does not reach prose, instruction-route, PR-body, or arithmetic
defects.

## What should not change

**MEASURED:** the author self-found eight fix-commit defects, the round-5/6
real-commit technique caught genuine harness and command problems, and the audit
found R6-M1; the supplied audit also reports that the five author-filed review
drawers preserved the reviewer's strongest criticism without softening.
**JUDGEMENT:** keep the candid weakest-claim sections, behaviour-keyed throwaway
fixtures, disclosure of self-found mistakes, and faithful filing of independent
reviews. Do not make “no disclosed suspicion” or “zero defects found” the
handoff target: that would reward omission and damage the parts that produced
useful evidence. The gate should require a disposition and trace for a
published suspicion, not require that the disposition be favourable.

## Verification boundary

**MEASURED:** I read the supplied process-review prompt, all six local PR #139
commissions, the committed six-round review, the defect-pattern audit at
`bd1ea06`, and the local PR #140 round-1 review. I did not rerun the historical
Git fixtures, inspect the live PR #139 body, or read the five MemPalace review
drawers; claims that depend on those sources are attributed to the supplied
ledger/audit rather than independently remeasured here.
