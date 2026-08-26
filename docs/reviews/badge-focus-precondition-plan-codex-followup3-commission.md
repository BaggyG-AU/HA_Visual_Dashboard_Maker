# COMMISSION — Third scoped follow-up (minimal): the BF-G1 prose repair

Author: Claude Opus 5 (1M context) — plan author and repair author; an
interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol (the same reviewer, per
`docs/governance/OPERATING_AGREEMENT.md` §3.4's same-reviewer rule)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

This is the scoped follow-up STRAT-D7 requires for the repair of **BF-G1**
(SEV 1) from
`docs/reviews/badge-focus-precondition-plan-codex-followup2-review.md`
(`feb0cfa`, verdict SEV-1-BLOCKED). D7 is universal — a follow-up exists because
a repair exists — but **depth is proportional and you decide it inside this
round**. This is the case D7 explicitly describes as naturally minimal: **the
diff changes no behaviour, no technical decision and no governed rule text.**
Read the diff, confirm that, confirm the disposition table, and be done. Minutes,
not hours.

## What is already settled and is NOT in scope

Your round-3 review disposed **BF-F1, BF-F2 and BF-P2 all RESOLVED** and ruled
the technical plan **ready for implementation**. BF-P1, BF-P3 and BF-P4 were
closed a round earlier. **None of that is reopened here.** Nor is the diagnosis,
the four-call-site population, the test-only decision, or the manifest-retirement
rule.

**BF-G1 was the only thing blocking.** If the prose repair holds, this plan is
finished and implementation can begin.

## Expected state — STOP and tell the owner if untrue

- Branch `feature/badge-focus-precondition-plan`, **PR #153**, head `565eb6c`;
  `main` = `2b9a7ca`. Opened for reading, not for merge.
- Clean worktree, **no commit amended**, **still plan only — no code written**.
- ⚠ **The branch diff vs `main` is Markdown only** — every path under `docs/`,
  no `src/`, test or manifest file. **Regenerate; do not match a count:**

  ```bash
  git log --oneline main..HEAD
  git diff --name-status main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

  ⓘ This block states no file or commit count by design — round 3's version did,
  and you rightly stopped on it, because the commission asserting the count was
  itself committed to the branch and became the file that falsified it.

- Manifest unchanged: 9 `expectedFailures` / 10 `expectedFlaky` /
  21 `expectedSkips`; both badge rows still baselined.

## What you review

**The repair diff `feb0cfa..565eb6c`**, two commits, one file
(`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md`):

1. `9d69be0` — the BF-G1 repair: §7 steps 3–5 rewritten, a standing re-sweep
   warning added to §7, §9.2 added with the round-3 dispositions, header bumped
   to revision 5.
2. `565eb6c` — §10 records that the round-3 self-check missed BF-G1.

## The questions

**Q1 — BF-G1. RESOLVED or REGRESSED?**
Does §7 now state the settled position — the owner ruled option A on 2026-08-26,
option B is closed, no owner decision is outstanding, and the remaining gate is
this follow-up rather than a second owner ruling? Is any live statement of that
ruling's status still stale? Your own round-3 sweep enumerated the class — plan
status, case 4's premise, §7, §9.1, §10 — so re-run it against `565eb6c`.

**Q2 — Did the repair stay inside its scope?**
The claim is that **nothing technical moved**: no change to §4, §5, §6 or §8, and
no change to any decision you approved in round 3. Verify that rather than take
it. The fix round is unreviewed new work, and this repair touched a section that
sits next to the technical ones.

**Q3 — Is §9.2 accurate?**
It records your dispositions, that the technical plan was ruled ready, and that
the published setup-versus-authority defence held. Does it represent your review
faithfully, or does it overstate any clearance?

**Q4 — Is §10's new admission accurate?**
It says BF-G1 entered at `52b8834`, before the round-3 commission was written,
so it was already on the branch when that self-check ran — and that the check
exercised the plan's arguments but never re-read its current-state statements.
Is that the correct account, or does it under- or over-state?

**Q5 — Anything the author could not predict.**

## What the author already ran

The four questions above were run against `9d69be0` before this commission was
written. They caught one thing, fixed in `565eb6c`: **§10 tracked the author's
self-check history and did not admit that the round-3 pass missed BF-G1.** The
class sweep was also independently re-run and agreed with yours: §7 step 4 was
the only stale member.

⚠ **Treat that as a claim, not clearance.** On three consecutive rounds the
self-check found real defects and still missed the one that blocked.

## Deliverable

A committed document on this branch:
**`docs/reviews/badge-focus-precondition-plan-codex-followup3-review.md`** —
never a chat reply, never an amendment to an existing commit or to the plan.

Verdict first: **ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED**. It is a
hard gate — implementation begins only on ACCEPTS-REVISION. Then a one-row
disposition for BF-G1, a short scope-and-regression note for Q2, what you ran,
and any new finding numbered BF-H1 onward with severity and, at SEV 1 or SEV 2,
an Owner Decision Brief in the six fields. A `MemPalace drawer candidates`
section or an explicit "none".

**Severity:** STRAT-D18. SEV 1 needs the three-part proof — the decision or claim
broken, the violated fact at `path:line`, why no recorded mitigation covers it.

**Execution:** everything headless; nothing here requires a suite run and none is
owed. `ha.home.local` read-only. No `src/`, test, manifest, merge, `[STATE]` or
UAT change. ⓘ Ignore any local unit-suite redness: `DeployDialog.spec.tsx` and
`CardPalette.canvasOnly.spec.tsx` time out at 5000 ms under load, it reproduces
on the unmodified base, and both specs make zero filesystem calls, so nothing on
this branch can reach them.

**MemPalace (MP-LEASE):** if the writer lease refuses your write, drawer
candidates go at the end of your committed review file and the author files them
with `added_by="codex"`. Never kill a process to free the lease, never set
`MEMPALACE_MCP_ALLOW_PEER_WRITER`.

⚠ **This plan has taken three blocking rounds and every technical finding is now
closed. If the prose repair is sound, say ACCEPTS-REVISION plainly and let the
code be written.** Equally, if §7 still misdirects an implementer, block it
again — a plan that contradicts itself is worse than one that is merely late.
