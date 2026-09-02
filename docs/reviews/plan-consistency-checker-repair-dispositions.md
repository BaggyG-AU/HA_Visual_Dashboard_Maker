Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

# Repair dispositions — PR #154 plan-consistency checker

One dated section per round, appended and never rewritten (OA §3.4).

---

## Round 1 — 2026-09-03, answering `plan-consistency-checker-codex-review.md` (SEV-1-BLOCKED, `94aee56`)

**Owner ruling, 2026-09-03: option B, with C3's heuristic half demoted to
ADVISORY.** The review's own Owner Decision Brief offered (A) merge as-is,
(B) repair and narrow C3, (C) demote C3 to advisory. The owner took **B for the
decidable half and C for the heuristic half**, after a measurement showed pure B
neither fully cleared F2 nor left F4 where it found it — see the pre-decision
evidence below.

### ⚠ Why pure B was not taken — measured before any code was written

Option B was built in a throwaway worktree and exercised against the real
documents. Two results decided the owner's split:

| Case (repaired-under-pure-B code)                           | Result          | Meaning                              |
| ----------------------------------------------------------- | --------------- | ------------------------------------ |
| canonical block + QUOTED `"six review rounds complete"`     | **CLEAN**       | F2's fail-open **survives** pure B   |
| canonical block + `the eleventh review round` / `the 11th`  | **CLEAN**       | F2's fail-open **survives** pure B   |
| canonical block + ONE historical `Across two review rounds` | `C3-COUNTDRIFT` | F4 gets **worse**: 1 sentence blocks |

**F2 and F4 are the same root cause.** C3 tries to decide semantically what a
number is _about_; every repair in one direction opens the other. Counting the
canonical block as a site necessarily lowers the false-positive threshold on the
same counter. So the claim was narrowed rather than the regex grown.

### Dispositions

| ID     | Sev | Disposition             | What was done                                                                                                                                                                                                                                           |
| ------ | --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1** | 1   | **RESOLVED**            | The live gate is an ordinary `it` with unconditional reads of all three inputs; a missing input throws naming the path and telling the reader to update the test in the same commit.                                                                    |
| **F2** | 1   | **RESOLVED (narrowed)** | The marked `plan-running-totals` block is parsed, required to exist **exactly once** (`C3-NOCANONICAL`, blocking), and counted as site #1. The prose-frame half is now **advisory** and its two measured blind spots are pinned as `KNOWN-OPEN:` tests. |
| **F3** | 1   | **RESOLVED**            | C4 fails closed on a missing section, zero parsed steps, no helper step, or **duplicated** helper/leg anchors, via the **distinct** code `C4-UNVERIFIABLE`.                                                                                             |
| **F4** | 2   | **RESOLVED**            | Prose-derived `C3-COUNTDRIFT` is advisory, so the measured false positive is reported and **cannot block**. Pinned by a control asserting both halves.                                                                                                  |
| **F5** | 3   | **RESOLVED**            | The disposition-row regex accepts optional `**`/`_` emphasis. Two controls prove the bold form still disposes and a genuinely undispositioned finding still fires.                                                                                      |
| **F6** | 3   | **ACKNOWLEDGED**        | The **claim** was narrowed, not the code. C1 measures textual incoming calls; the message now says "has NO TEXTUAL CALLER" and the comment states that reachability needs a call graph this deliberately is not. Pinned by a `KNOWN-OPEN:` test.        |

### Fail-against-old evidence — every new blocking control proved live

The repaired spec was run against the **pre-repair implementation** at `94aee56`
(with a one-line `blockingFindings` shim so it could import). **9 of the 16 new
tests failed against old**, and they are exactly the 9 that must:

```
× F2: FIRES when the canonical totals block is MISSING
× F2: FIRES when the canonical totals block is DUPLICATED
× F2: the canonical block counts as a SITE — block + ONE prose restatement is drift
× F3: FIRES when the implementation section is ABSENT
× F3: FIRES when the section exists but no HELPER step does
× F3: FIRES when the nested list is FLATTENED to zero parsed steps
× F3: FIRES when the helper anchor is DUPLICATED — the order is then ambiguous
× F5: a disposition row disposes WITHOUT bold emphasis
× KNOWN-OPEN: C3 prose matches are ADVISORY, so a false positive cannot block
   (9 failed | 31 passed)
```

The six that **passed** against old are correct to pass: the two F5
sanity-controls and the `CONTROL: exactly ONE canonical block` prove the new
controls are not vacuous in the other direction, and the three `KNOWN-OPEN:` pins
assert **unchanged** behaviour by design.

**F1 was proved separately**, because its discriminator is a missing file rather
than an input: with `SPACING_HELPER_PRESET_PLAN.md` renamed, the **old** spec
reported `23 passed | 1 skipped` and **exited 0**; the repaired spec fails with
`the live plan gate requires docs/testing/SPACING_HELPER_PRESET_PLAN.md, which is
missing`.

### Blast-radius statement (OA §3.4)

**Upstream reliances.** `tests/support/planConsistency.ts` is imported by exactly
one consumer — its own spec. Regenerate:
`grep -rn "planConsistency" --include=*.ts . | grep -v node_modules`.
It reads three files: `docs/testing/SPACING_HELPER_PRESET_PLAN.md`, its
`_HISTORY` companion, and `tests/support/dsl/spacing.ts`.

**Downstream consumers.** `./tools/checks` (via Vitest) and CI's `ci` job. No
`src/`, no Electron, no e2e/integration spec, no snapshot, no baseline manifest
and no governance text is touched. `git diff --name-only 94aee56..HEAD`.

**Measured non-regression.**

- Neither plan document was edited. The live plan already carries exactly one
  canonical block (`SPACING_HELPER_PRESET_PLAN.md:521`) and C4's anchors are
  present (helper at step 3, leg 1 at step 4), so **no new code fires on the live
  documents** — verified with the real `checkPlan` before writing the repair.
- All **24** pre-existing tests still pass, unchanged. Two would-be regressions
  were caught before writing: counting the canonical block **per key** would have
  fired on the live plan on day one, because it declares both
  `reviewer_findings` and `findings_after_round_one` — it counts **one site per
  subject**; and reusing `C4-SEQUENCE` for fail-closed structure would have broken
  the committed `NOT leg 1` negative fixture, so `C4-UNVERIFIABLE` is a distinct
  code.
- Unit population **1437/105 → 1453/105** (+16 controls, no new file).
- Gate at the repair commit: `REAL_EXIT=0`, 4/4 steps, lint 0 errors / 145
  warnings, **1453 passed / 105 files**.

**Accepted operational cost, stated rather than buried.**
`SPACING_HELPER_PRESET_PLAN.md` is now **permanently load-bearing**: retiring or
renaming it fails `./tools/checks` until the same commit updates this spec. That
is the intended consequence of a lifecycle-bound input, and the thrown message
says so to whoever hits it.

### What this repair does NOT establish

- **C3 no longer claims to detect prose restatements.** It blocks only on the
  canonical block's existence and uniqueness. A second home stated inside quotes,
  or written in a number form `numberFrom` cannot parse, is **not detected** —
  both are pinned as `KNOWN-OPEN:` tests rather than described in prose.
- **C1 does not decide reachability**, and no longer implies it.
- The `KNOWN-OPEN:` tests assert **current** behaviour. Anyone who closes one of
  those holes breaks the test and must correct the claim in the same commit.
- **A MISSING leg 1 is deliberately not treated as unverifiable**, though the
  review's required correction named it. A plan may legitimately schedule no
  leg 1, and the committed `NOT leg 1` negative fixture asserts exactly that;
  firing there would have broken it. Absence of the **helper** is the
  unverifiable case, because C4's whole question is whether the helper came
  first. Both halves are pinned by controls. **This is a deliberate narrowing of
  the required correction, not an oversight — reopen it if you disagree.**
