# COMMISSION — STRAT-D7 scoped follow-up 7: revision 8, and a stop rule

Author: Claude Opus 5 (1M context) — plan author and repair author; interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol — **the same reviewer** (OA §3.4)
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

⚠ **THE OWNER IS NOT A DEVELOPER.** Anything routed to them must be judgable by a
non-developer: what it protects, what goes wrong in plain words, options with costs,
a recommendation with its reason.

---

## ⚠⚠⚠ THE STOP RULE — READ THIS FIRST, IT CHANGES WHAT THIS ROUND IS FOR

**The owner has ruled that any SEV-1 in this round ends the review track.** There is
no round 9. If you return SEV-1-BLOCKED, the work proceeds to implementation on your
own conditional clearance — with the Electron class smoke as the gate — or it is
parked. **That is the owner's decision and it is not yours to weigh; it is stated so
you can calibrate what a SEV-1 costs, not so you will avoid raising one.**

⚠⚠ **DO NOT SOFTEN A GENUINE SEV-1 BECAUSE OF THIS RULE.** A finding you believe
meets the three-part blocking bar must be filed at SEV 1. Suppressing one to keep
the process alive would be the single worst outcome available here — it would hand
the owner a green verdict over a real defect, which is the exact failure mode this
seven-round arc exists to prevent. **If it blocks, block it.**

---

## Why this revision is a DELETION

Seven rounds produced thirty findings. **Seventeen were the plan contradicting or
overclaiming itself**, against an executable specification of 144 lines inside a
document that had grown to 2,698. Every revision added 200–450 lines to close 2–5
findings, at roughly **one new finding per 60 lines added**.

The owner ruled: **delete rather than check harder**. Plan + history are now **766
lines, down from 2,698** — a 72% cut with the specification intact. The route
archaeology, superseded option comparisons, per-round narrative and running-cost
essay are gone. They survive in your own review documents and in MemPalace, neither
of which this plan can contradict.

⚠ **The previous structural fix — the 2026-08-31 split — MOVED content and the total
grew, which is how SP-22 regressed through its own repair.** This one deletes.

## What changed, and where your own text was used

All four findings were verified at source and repaired **using the specification
text you supplied**, under the owner's non-binding-design-appendix ruling.

- **SP-27** — the three surviving passages are gone with the archaeology that
  carried them; §3 now carries your paragraph verbatim (P1 closes by construction,
  P4 is a mutation-only alarm, leg 5b pins the limit).
- **SP-28** — M9c is relabelled a **detector-liveness control** and the causal
  sentence narrowed.
- **SP-29** — `snapshotOtherHalf` returns `Record<string, string>`, owns one absolute
  budget, throws naming the id; `readSelectValue` is deleted; **leg 5c** is your
  unreadable-sensor control, both halves.
- **SP-30** — §7.5 carries a single marked `plan-running-totals` block and the claim
  about C3 is reduced to a regression alarm for known phrasings.

## What the author ran, before sending this

- **Every code line and method diffed against revision 7.** The only losses are the
  illustrative excerpt of the current broken helper, the failing-test excerpt, and
  `readSelectValue`.
- ⚠⚠ **All four checks proved LIVE against this document by mutation** — and that
  caught a real one: the first draft rewrote §7's implementation order as a flat
  list, which C4's parser does not match, so **C4 was silently dead until the
  known-bad mutation proved it could not fail.** The nested form is restored and
  marked load-bearing. C1/C2/C3/C4 each fire on a mutation; the document reports
  clean.
- **SP-30's hostile sentence re-executed** — still returns 0, which is why the claim
  about C3 was reduced rather than defended.
- ⚠ **The 400-line target was missed: the result is 554.** The code blocks alone are
  218 lines, so 400 was never reachable without cutting the specification. The number
  was set before it was measured, and it is reported rather than quietly dropped.

⚠⚠ **Treat all of that as a claim, not clearance.** The same self-check, run seven
times before, missed blockers every time — including twice in the extra pass the
owner specifically requested last round.

## Expected state — STOP and tell the owner if untrue

```bash
git log --oneline main..HEAD
git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
git status --porcelain    # must be empty
```

`main` = `08a9544`. Manifest: 7 `expectedFailures`, 10 `expectedFlaky`, 21
`expectedSkips`; the spacing identity is on none. **No code exists on this branch.**
The checker is at `feature/plan-consistency-checker` commit `1f6650a` (PR #154);
**take its check set from the module, not from this document.**

## ⚠⚠ EVERYTHING HEADLESS — QUOTED VERBATIM, YOU INHERIT NONE OF THIS PROJECT'S RULES

**`bash tools/test-headless.sh <spec…> --project=electron-e2e|electron-integration
--workers=1`.** ⚠⚠ **THIS APPLIES TO AN AD-HOC PROBE, NOT ONLY TO THE SUITES.** A
previous round launched `electron.launch` head-ful and put app windows on the
owner's desktop mid-session.

## Settled and NOT in scope

Owner rulings — no pre-wait; a bounded ownership-gated retry; fix lane; **option B**;
the **SP-25 option (a) narrowing**; the **non-binding design appendix**; and the
**delete-don't-split ruling** — are owner judgment calls, **not reviewable above
SEV 4**. Attack the facts they rest on, never the authority.

## The questions

**G1 — dispose of SP-27…SP-30 by name.** Verify against the finding, not the plan's
summary of it. Your own supplied text was used; **judge whether it was integrated
faithfully or bent in transit.**

**G2 — ⭐⭐ WHAT DID THE DELETION LOSE?** This is the round's centre and it is the
operation that caused SP-15. 1,932 lines were removed. **Key differently from the
author:** he diffed methods and code lines. Ask instead what CONSTRAINT, EVIDENCE
BOUNDARY or OWNER RULING existed in revision 7 and has no home now. A deletion
leaves no token to grep for.

**G3 — is the specification still self-sufficient?** Could an implementer build this
from §3–§7 alone, without the deleted material? Name anything that now assumes
context that no longer exists.

**G4 — the checks.** All four are claimed live by mutation. **Reproduce that**, and
say whether a mutation-proved check on THIS document generalises to the next edit.

**G5 — over-reach.** Did the deletion remove anything a finding did not ask about
and that was doing work? Did the SP-29 repair change more than SP-29 required?

**G6 — the interaction.** Every round has produced one between two individually
correct pieces (SP-8, SP-12, SP-15, SP-20, SP-25, SP-29). **The fail-closed
`snapshotOtherHalf` is new, unrun, and now throws where it used to swallow** — it is
the most likely home for the next one.

## Deliverable

**`docs/reviews/spacing-helper-preset-plan-codex-followup7-review.md`**, committed
and **pushed**, **prettier-clean**, adding only your own document.

Verdict first — ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED. Then a
disposition table; confidence and method; your evidence boundary; a claim ledger
tagged MEASURED / INFERRED / JUDGEMENT closing with your own weakest claims; new
findings numbered **SP-31 onward**, class swept per finding; optional design
appendix per finding.

**Severity (STRAT-D18, binding):** SEV 1 blocks and needs the three-part proof;
missing any part → at most SEV 2. SEV 2 goes to the owner as a six-field brief.

Close with a `MemPalace drawer candidates` section, or an explicit "none".
