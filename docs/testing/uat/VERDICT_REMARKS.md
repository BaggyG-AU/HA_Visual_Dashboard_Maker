# HAVDM — UAT Verdict Re-mark Ledger

**Status:** standing document — append-only, carried across rounds
**Governed by:** `docs/testing/UAT_STRATEGY.md` §2, §3.2, §8
**Read by:** the agent generating each round's matrix, when building `PREV`

---

## Purpose

A round's session JSON is **the tester's verbatim export**. It is the round's
evidence, and it is never edited — `.prettierignore` excludes it from formatting
for exactly this reason: _"rewriting it would rewrite the evidence a regression is
detected against."_

But a verdict can legitimately change **after** the round closes. The project
owner may re-mark a card — because the failure was misattributed, because the
severity did not match the rubric, or because triage established that what the
tester saw was not a defect of the card under test.

Those two facts pull in opposite directions. This ledger resolves them the same
way `CARD_CORRECTIONS.md` resolves the equivalent problem for card _wording_:
the re-mark is recorded **here**, against the card ID and the round, and applied
**on top of** the session JSON when the next round's `PREV` is built.

⭐ **The export records what the tester marked. This ledger records what the owner
later ruled. Neither overwrites the other.**

---

## Why this is not cosmetic

`UAT_STRATEGY.md` §8 defines a regression as **"green last round, fails this
round"**, and the matrix computes that from the previous-round dot.

So a stale dot does not merely look wrong — it **downgrades a real regression to
a repeat**. If the owner ruled a card Pass and the dot still shows red, a failure
in the next round reads as "failed again" instead of "capability lost", and the
highest-priority defect class is silently reclassified.

---

## Scope — what belongs here, and what does not

**In scope:** a change to a recorded verdict or severity, made by the **project
owner**, after the round's session JSON was exported.

**Out of scope — and explicitly forbidden here:**

- ⚠ **Anything the agent decided.** `UAT_STRATEGY.md` §2 reserves marking to the
  tester and re-scoring to the owner. The agent may triage, recommend and record
  — never rule. Every entry below must name the owner as the decider.
- ⚠ **Edits to the session JSON.** The export is immutable. If an entry here and
  the JSON disagree, that disagreement is the point.
- Card wording. That is `CARD_CORRECTIONS.md`.

---

## How the generator uses this

When building `PREV` for a new round (`UAT_STRATEGY.md` §3.2):

1. Load the most recent round's session JSON `current` map.
2. Apply every entry below whose **Round** matches that session, overriding the
   exported verdict.
3. Omit any id whose resulting value is not `pass` / `fail` / `skip` —
   `untested` is not a prior _result_, and must render as a grey dot rather than
   be invented into one.
4. State in the matrix's header comment which ids were overridden and why.

---

## Entries

### CLIP-02 — round 2 `fail` → `pass`

| Field           | Value                                                          |
| --------------- | -------------------------------------------------------------- |
| **Card**        | CLIP-02 — A pasted card is genuinely independent of its source |
| **Round**       | `v1.0.0-r2` (session `uat_session_v1.0.0-r2_2026-07-31.json`)  |
| **As exported** | `fail`, severity `high`                                        |
| **As ruled**    | **`pass`** — severity withdrawn with the Fail                  |
| **Decided by**  | Project owner (micah / BaggyG-AU), 2026-08-03                  |
| **Applied in**  | `v1.0.0-r3` — `PREV['CLIP-02'] = 'pass'`                       |

**The tester's note, in full:**

> "I changed the name of the copied card and got an alert from Acronis Active
> Protection. Affected file is
> `c:\Users\micah\AppData\Roaming\HA Visual Dashboard Maker\config.json`. I
> 'ignored' the notification"

**The reasoning:**

The card asks whether a pasted card is independent of its source. The note **never
says the copy was coupled to the original** — and renaming the copy _is_ the
independence check, so the check ran. CLIP-01 and CLIP-03 both passed clean, so
nothing in the clipboard family was blocked.

The alert also meets **none** of §6's six High criteria, checked one at a time: no
data loss or silent corruption; nothing blocked; no core workflow lost; no crash,
hang or blank render; no invalid YAML presented as valid; no unrequested write to
Home Assistant.

What actually happened is that Acronis Active Protection's ransomware heuristics
fired at an **unsigned binary** writing its own `%APPDATA%` config. That is a
packaging and code-signing concern, not a clipboard one.

⭐ **The general rule this established: a defect observed _during_ a test is not
automatically a defect _of_ that test.** Score the card on the question the card
asks; file the incidental finding separately, or it distorts a release gate it has
nothing to do with.

**Not discarded:** code signing is now tracked as an item in its own right. An
unsigned binary tripping ransomware protection on a user's machine is a real
1.0.0-class concern — it simply is not CLIP-02.

**Consequence for R3:** CLIP-02 carries a **green** prior-round dot. A CLIP-02
failure in round 3 is therefore correctly flagged as a **regression**, which a
stale red dot would have hidden.

---

### HA-08 — round 2 severity `medium` → `high`

| Field           | Value                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Card**        | HA-08 — Live Preview creates a temporary dashboard, and Close deletes it                                                                                |
| **Round**       | `v1.0.0-r2` (session `uat_session_v1.0.0-r2_2026-07-31.json`)                                                                                           |
| **As exported** | `fail`, severity `medium`                                                                                                                               |
| **As ruled**    | `fail`, severity **`high`**                                                                                                                             |
| **Decided by**  | Project owner (micah / BaggyG-AU), 2026-08-03                                                                                                           |
| **Applied in**  | ⓘ **No `PREV` change** — `PREV` carries pass/fail only, not severity. HA-08 remains a `fail` either way. Recorded here for the ledger, not for the dot. |

**The reasoning — three independent supports:**

1. §6's High rubric names it verbatim: _"A write reaches Home Assistant that the
   user did not ask for."_
2. The card **pre-committed** to it in its own expected results: _"One left behind
   is **High** — an unrequested persistent write to Home Assistant."_
3. The condition demonstrably occurred — `temp-dashboard-editor-1785488482593` and
   `…513912`, both from that round, 31 seconds apart.

⭐ **Why it was scored Medium: the severity was set on the symptom the tester
_saw_, not the defect that _occurred_.** The round-2 note is entirely about the
address ("hidden under cards… cannot be copied") and never mentions a leftover
dashboard. `teardownConfirmed: false` in the session confirms step 6's browser
teardown check was never completed — so the High condition was present but
unobserved, and was only found later by measurement.

⭐ **A teardown step the matrix cannot verify is a step that can silently not
happen** — and `teardownConfirmed: false` sat in the export the whole time,
unread.

**No practical cost:** HA-08 was already fixed by PR #117 (`9ea8609`, merged
`220cadf`), so it joins the fixed-Highs awaiting re-test rather than becoming a
new blocker.

---

## Related documents

- `docs/testing/UAT_STRATEGY.md` — §2 roles, §3.2 plan generation, §8
  previous-round indicators, §12 artifacts
- `docs/testing/uat/CARD_CORRECTIONS.md` — the sibling register, for card
  **wording** rather than verdicts
- `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md` — the
  §3.1 pass bar
