# COMMISSION — STRAT-D7 scoped follow-up 2: revision 3, and a REPLACED mechanism

Author: Claude Opus 5 (1M context) — plan author and repair author; interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol — **the same reviewer** (OA §3.4)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

⚠⚠ **THIS IS NOT AN ORDINARY REPAIR ROUND.** Besides repairing SP-7…SP-10, this
revision **replaces the ownership mechanism you cleared in round 1 and did not
reopen in round 2** — because a harness run falsified it. **§4.2, §4.3 and §4.4
are new work no review has seen.** Treat them as a first review, not a follow-up.

**NO CODE HAS BEEN WRITTEN AND NONE MAY BE UNTIL A ROUND RETURNS
ACCEPTS-REVISION.** That is the tripwire, and it still holds.

---

## What changed since you last looked, and why

**The harness ran.** After round 2 the owner granted a **narrow exception to the
spec-before-code tripwire, for harness code only** — a temporary probe, untracked,
deleted afterwards, with `git status --porcelain` empty and `src/` + `tests/`
verified byte-identical to `HEAD`. That exception was granted because all four of
your round-2 findings were defects in round-1's repairs and none was in a
previously-clean area, which the project's fix-round rule calls **"each fix
generating the next finding"** and says needs a different remedy from patching.

**Leg 0 falsified the design on its first run.** Revisions 1–2 identified the
owning popup via the requested Select's `aria-controls="<id>_list"`. **Measured:
the padding and margin Selects both report `aria-controls="test-id_list"` — the
same id** — because `@rc-component/util/lib/hooks/useId.js` returns the constant
`'test-id'` when `NODE_ENV === 'test'`, and both popups retain the node when
closed. The revision-2 resolver would have failed on the ordinary path.

⚠⚠ **You cleared that row.** Round 1's Q2 answered "no issue found in the seven
source claims" and round 2 did not reopen it. **So did the author.** Both checked
that the identifier EXISTS; neither asked whether it is UNIQUE. That is not a
reproach — it is the reason this round should not lean on either of us having
looked before.

**The owner re-ruled**, selecting **option D**: P1 = the requested Select's own
`aria-expanded="true"`; P2 = assert exactly ONE visible popup, then search inside
it. §4.2 records the four measurements (M1–M4) it rests on.

---

## Expected state — STOP and tell the owner if untrue

- Branch `feature/spacing-helper-preset-plan`, off `main` = `08a9544`.
- **PLAN ONLY.** No `src/`, no `tests/`, no manifest change. **Regenerate:**

  ```bash
  git log --oneline main..HEAD
  git diff --name-status main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

- ⚠ This tracked record pins **no head and no counts** — a document committed to a
  branch cannot pin that branch's head from inside itself. The reviewed commit is
  in the untracked paste prompt
  `prompts/codex/spacing-helper-preset-plan-followup2.md`.
- Manifest on `main`: 7 `expectedFailures`, 10 `expectedFlaky`, 21 `expectedSkips`;
  the spacing identity is on none.

## Settled and NOT in scope

Your round-1 Q4 (the two-file consumer population; the
`canvas-resize-and-nesting.spec.ts:23` docblock correction) and your round-2
clearances of the `Escape` removal, the blast radius and P1–P4's presence stand.
The three owner rulings — remove the pre-wait; retain a bounded ownership-gated
retry; **fix lane** — are owner judgment calls and are **not reviewable above
SEV 4**; attack the facts they rest on, never the authority. The 2026-08-26
fix-don't-allowlist ruling is likewise settled.

⚠ **Your round-1 Q2 clearance of the DOM chain is EXPLICITLY REOPENED**, because
its central row proved false. Re-derive rather than re-affirm.

## Working practice you are held to

Unchanged and quoted: (1) a finding is a sample, not the population — name the
class and sweep it; (2) no unverified universals; (3) **a check is evidence only
for the property it exercises** — and this round is the clearest instance this
project has produced, so apply it to every clearance you GIVE; (4) verify each
finding against source, quote `path:line`; (5) silence is not a result — answer
each question explicitly; (6) declare your evidence boundary; (7) **an attack that
FAILED is not a proof of safety** — the attack most likely to fail is the one
whose magnitude is wrong; (8) **the fix round is unreviewed new work** — check each
repair against the finding it cites for under-reach AND over-reach.

---

## The questions

**G1 — dispose of SP-7…SP-10 by name: RESOLVED / PARTIALLY RESOLVED / REGRESSED.**
§9 claims all four resolved. Verify against the finding, not the plan's summary.
**SP-7** is claimed resolved **by deletion** — route (b)'s mechanism is gone and no
third is offered. Is the deletion complete across every site you swept in round 2
(§2.3, §6's honesty limit, §8, §9, §10's SR-5)? **SP-8**: does a whole-call
capture listener with a suppression count of 2 actually hold the foreign-only
state across both attempts? **SP-9**: are legs 8 and 9 now constructible with ONE
oracle each? **SP-10**: is `remaining()` threaded through **every** wait in
`resolveOwnedDropdown`?

**G2 — ⭐ THE NEW MECHANISM (§4.2/§4.3/§4.4). This is the round's centre.**

- **Verify M1–M4 against the recorded measurements**, and say plainly which you can
  and cannot check without running the app yourself.
- **P2's inference is the softest joint:** _requested Select open + exactly one
  visible popup ⇒ that popup is the requested Select's._ Is it sound? Is asserting
  the singleton sufficient to make a break loud rather than silent? **Find a state
  with two visible popups** — leg 7 is where it would surface.
- **M3 (route (a) not constructible) rests on ONE observed sequence**, and P2
  depends on it, and it is the premise for deleting leg 1. Is that enough?
- **`isOpen` cannot fail loudly.** You cleared the equivalent `ownsOpenPopup` in
  round 2 for the _previous_ helper shape. Re-ask it of this one.
- **Is option D actually better than option B here**, or did the author trade a
  construction for an inference to avoid a `src/` change? The owner ruled D with
  B's advantage stated; say if you think the trade is wrong.

**G3 — scope and regression.** Did any repair reach further than its finding? The
mechanism replacement is the obvious over-reach candidate — but it was
owner-ruled, so the question is whether §4.2/§4.4 changed anything _beyond_ what
the new mechanism requires.

**G4 — did the previously-clean areas stay clean?** §5.1's blast radius, §5.2's
class statement, P1–P4's four properties, and the `.ant-select-content-value`
read-back.

**G5 — the deleted route (b).** The plan now asserts a state and declines to
explain how CI reaches it. **Is the repair still justified with the "how"
absent?** The argument is that routes (b) and (c) present the helper with the same
measured state. Attack it.

**G6 — anything the author could not predict.** Your case list is a floor. ⭐ Round
2's most valuable finding (SP-8) was an interaction between two repairs that
neither the author nor the commission anticipated; look for the equivalent here.

## What the author already ran

G1–G5 were executed against revision 3 before handover, and the round-1 lesson was
applied as a standing rule: **every control flow and library binding a
load-bearing claim rests on was RE-TRACED, not re-argued.** That caught the
`aria-expanded` citation (it is `Input.js:184`, not the `:175` carried over from
PR #153's record) and confirmed both resolver waits receive `remaining()`.

⚠⚠ **Treat that as a claim, not clearance.** The same self-check, run twice
before, missed three blockers the first time and four the second.

## Deliverable

A committed document on this branch:
**`docs/reviews/spacing-helper-preset-plan-codex-followup2-review.md`**.

**Verdict first:** **ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED** — a hard
gate; implementation begins only on ACCEPTS-REVISION. Then a **RESOLVED /
PARTIALLY RESOLVED / REGRESSED table for SP-7…SP-10**; confidence and method; your
evidence boundary; a claim ledger tagged MEASURED / INFERRED / JUDGEMENT closing
with your own weakest claims; and new findings numbered **SP-11 onward**, with
**class swept** per finding.

**Severity (STRAT-D18, binding):** SEV 1 blocks and needs the three-part proof —
the decision or claim broken, the violated fact at `path:line`, why no recorded
mitigation covers it; missing any part → at most SEV 2. SEV 2 does not block and
goes to the owner as a six-field brief. SEV 3/4 recorded. Owner judgment calls are
not reviewable above SEV 4. The model governs what **blocks**, never what may be
**reported**.

Close with a `MemPalace drawer candidates` section, or an explicit "none". ⓘ Your
round-1 and round-2 candidates were filed on your behalf under MP-LEASE as
`drawer_havdm_review_ba8a734f85f6e6cf2deceb33` and
`drawer_havdm_review_446c3aa851fad9f6e0ebcfe3` — the mechanism works, so use it.
