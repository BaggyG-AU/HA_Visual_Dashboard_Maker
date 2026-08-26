# COMMISSION — Second scoped follow-up of the badge-focus plan repair (STRAT-D7)

Author: Claude Opus 5 (1M context) — plan author and repair author; an
interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol (the same reviewer, per
`docs/governance/OPERATING_AGREEMENT.md` §3.4's same-reviewer rule)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

This is the **second scoped follow-up** under STRAT-D7, for the repair of your
findings **BF-F1** (SEV 2) and **BF-F2** (SEV 3) from
`docs/reviews/badge-focus-precondition-plan-codex-followup-review.md`
(`a18d784`, verdict CHANGES-REQUIRED). Under D7 every post-review repair gets a
follow-up — no exemption for a small diff — so this round exists because a
repair exists, and its depth is yours to decide inside it.

**Scope: the repair diff `9fcc774..HEAD` plus the declared radius.** You are
**not** re-opening BF-P1, BF-P3 or BF-P4, which you disposed RESOLVED, nor the
diagnosis, the four-call-site population, the test-only decision, or the
manifest-retirement rule.

**The gating question this round:** BF-P2 was left **PARTIALLY RESOLVED** solely
because case 4 was mis-specified. If the case-4 repair holds, BF-P2 moves to
RESOLVED and nothing blocks implementation.

## Owner rulings you should know about

- **BF-F1 → option A**, ruled 2026-08-26: add the isolation. Option B (drop the
  runtime global-vs-scoped claim) is **closed**. §6a's five-step sequence is
  therefore binding on the eventual harness and case 4 is a required leg.
- Earlier, BF-P1/BF-P2/BF-P3 all took option A on 2026-08-25.

**The owner's profile (STRAT-D15).** The owner gate is held by a
**non-developer** — write for the reader who actually rules. Anything routed to
the owner uses the **Owner Decision Brief**: what this protects in product terms
/ what is going wrong plainly / is the product affected Yes-No-Unknown with
honest evidence status / options with costs / recommendation and why / what
happens if you do nothing. **Never require the owner to classify a diff.**

**Severity:** STRAT-D18 per `docs/templates/ADVERSARIAL_REVIEW.md` §4. SEV 1
needs the three-part proof — the decision or claim broken; the violated fact at
`path:line`; why no recorded mitigation covers it. Missing any part → at most
SEV 2.

**MemPalace (MP-LEASE).** If your write is refused by the per-palace writer
lease, put drawer candidates in a `MemPalace drawer candidates` section at the
end of your committed review file; the write-enabled author files them with
`added_by="codex"`. ⚠ Never kill a process to free the lease and never set
`MEMPALACE_MCP_ALLOW_PEER_WRITER`.

**Execution — EVERYTHING HEADLESS.** `bash tools/test-headless.sh <spec…>
--project=electron-e2e|electron-integration --workers=1`; integration is a
separate project, run sequentially; never run the unit suite while an Electron
suite is live. A suite you cannot run headless is **UNRUN** and is never
launched headed. `ha.home.local` is read-only. **No `src/` change, no test
change, no manifest change, no merge, no `[STATE]` update, no UAT card touched.**

## 1. Expected state — STOP and tell the owner if untrue

- Branch `feature/badge-focus-precondition-plan`, base `main` = `2b9a7ca`,
  **open as PR #153** (opened for reading, not for merge).
- Commits over `main`: `90760cd`, `a81fb78`, `014ac1c`, `9fcc774`, `a18d784`
  (your follow-up), `97f67cb` (revision 4), `52b8834` (the option-A ruling),
  plus one commit carrying the §8 revision-4 weaknesses and this commission.
- Clean worktree, **no commit amended**, **still plan only — no code written**.
- ⚠ **The branch diff vs `main` is Markdown only** — every path is under
  `docs/`, and there is **no `src/` file, no test file and no manifest file** in
  it. **Regenerate the list; do not match it against a number:**

  ```bash
  git diff --name-status main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

  ⓘ **Do not expect a fixed file count, and this block will never state one
  again.** An earlier version said "four markdown files" and was already false
  when it was pasted: **the commission stating that count was itself committed
  to the branch and became the fifth file.** The reviewer stopped on it, which
  is the precondition block working exactly as intended. The load-bearing
  property is the **kind** of file on this branch, not how many — the kind is
  stable as further review documents land, a count is not.

- Manifest unchanged: 9 `expectedFailures` / 10 `expectedFlaky` /
  21 `expectedSkips`; both badge rows still baselined.

## 2. The questions — answer every one, including those that come back clean

**Q1 — BF-F1. RESOLVED or REGRESSED?**
§6a case 4 now specifies five steps, the second being a wait for
`.ant-select-dropdown:not(.ant-select-dropdown-hidden)` at `toHaveCount(0)`
before the unrelated Select is opened.

- Does that isolation actually remove the confound you measured
  (`visiblePopupCount: 2`)? Is `toHaveCount(0)` the right predicate, and is
  step 2 in the right position?
- ⚠⚠ **The attack the author cannot dismiss and has published in §8: the
  isolation step is itself a document-global wait on the very selector BF-P3
  rejected as an authority.** The defence is that setup isolation and assertion
  authority are different roles. **Test that defence.** If it does not hold,
  case 4 needs a different isolation and this is not resolved.
- Is the withdrawal of the "two popups open at once" caveat complete, with no
  residue anywhere that would let an implementer void the case?
- Does the plan correctly distinguish "the reviewer ran an equivalent
  construction" from "this five-step sequence is proved"?

**Q2 — BF-F2. RESOLVED or REGRESSED?**
§9's sweep narration now splits the hits into code-behaviour hits and raw text
hits, names `tests/baseline/expected-failures.json:91,178-201,476-484` with
their dispositions, and states the published-versus-run root cause.

- Is the corrected sentence now **literally true** when the shipped command is
  run verbatim? Run it.
- Are the three baseline entries' dispositions right, and is the claim that the
  manifest consumes test identities rather than the helper signature correct?
- Does the radius **population** claim still hold after the correction?

**Q3 — Does BF-P2 now move from PARTIALLY RESOLVED to RESOLVED?**
This is the gate. Cases 1–3 you already ruled executable and causal. If case 4 is
now sound, say so explicitly, because implementation turns on it.

**Q4 — Over-reach in the fix round.**
Revision 4 added text no finding asked for — principally the **§4.1 temporal
trap** (that `OptionList` closes the Select inside the handler that prevented the
key, so `aria-expanded` already reads `"false"` after a failed traversal, which
is aftermath rather than refutation). Is it **accurate**, and is it **over-reach**?
The fix round is unreviewed new work and this is the part of it nobody
commissioned.

**Q5 — Regression sweep over the structural edits.**
§7 was rewritten wholesale, §9.1 was added, §10's S4 and "every dimension"
claims were narrowed, and §8 gained a revision-4 block. Did any of that drop
content, break an internal reference, or contradict §4, §5, §6 or §9?
Specifically: is §10's narrowing now **accurate** — neither over- nor
under-stating what the author's self-checks actually covered?

**Q6 — The declared radius, re-verified.**
Unchanged in substance since your last pass, but confirm the correction did not
disturb it, and that nothing else in the repo consumes `expectReachableByTab`,
`activeElement`, or the repeated badge id in a way the radius does not name.

**Q7 — Anything the author could not predict.**
Your case list is a floor, not a ceiling.

## 3. What the author already ran, and what it does not buy

Before handing this over, the author ran every question above against revision 4.
It caught one thing, now fixed: **§8 offered none of revision 4's new text for
attack** — not the temporal trap, not the five-step sequence, and not the
global-wait-in-setup objection at Q1. All three are now published as weaknesses,
including the one most likely to become your finding.

⚠ **Treat that as a claim, not clearance.** The author is an interested party,
and on the last two rounds the self-check found real defects and still missed
the one that mattered most. **This plan's running score is three findings in one
defect class — a check that cannot fail for only the reason it names — so the
prior on a fourth is not low.**

## 4. Deliverable

A committed document on this branch:
**`docs/reviews/badge-focus-precondition-plan-codex-followup2-review.md`** —
never a chat reply, never an amendment to an existing commit or to the plan.

1. **Verdict first**, three sentences or fewer:
   **ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED.** It is a hard gate —
   **implementation begins only on ACCEPTS-REVISION.**
2. **Disposition table** — BF-F1, BF-F2, and **BF-P2's move or non-move to
   RESOLVED**, each RESOLVED / PARTIALLY RESOLVED / REGRESSED / OPEN.
3. **Regression and contradiction sweep** over Q5.
4. **Method and evidence boundary** — what you read, what you ran with real
   output, what you did not.
5. **Claim ledger** tagged MEASURED / INFERRED / JUDGEMENT, closing with your
   weakest claims.
6. **New findings** numbered BF-G1, BF-G2, …, with severity, and an Owner
   Decision Brief for anything SEV 1 or SEV 2.
7. **Disagreements stated as disagreements.**
8. **MemPalace drawer candidates**, or an explicit "none".

This is a small docs-only diff and the designed cost is minutes for the
records-only parts. Q1's global-wait-in-setup objection is the one place where
real thought is owed — say plainly if it cost more.

⚠ **Do not approve to be agreeable.** If the case-4 repair is sound, say so
plainly and let the code be written — three rounds of blocking is enough when the
work is actually right. Equally, if the isolation still cannot fail for only its
named reason, block it again.
