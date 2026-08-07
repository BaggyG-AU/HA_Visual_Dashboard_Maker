# HAVDM — UAT Card Corrections Register

**Status:** standing document — append-only, carried across rounds
**Governed by:** `docs/testing/UAT_STRATEGY.md` §3.2, §5
**Read by:** the agent generating each round's plan and matrix
(`prompts/claude/uat-plan-and-matrix.md`, Step 3 "Prior-round defects")

---

## Purpose

A round's test plan is **the record of what was tested**. Once a round has run,
its plan is evidence and is never edited — rewriting it would falsify the round.

But a card can be _wrong_: it can ask the tester to perform a step whose expected
outcome cannot occur, or to observe something the product does not do. Such a
card produces a Fail that says nothing about the product, and it will keep
producing one every round until the **card** is fixed.

Those two facts pull in opposite directions. This register is what resolves them:
the defective wording is recorded **here**, against the card ID, and the
correction is applied when the card is **carried forward into the next round's
plan** — leaving the round that already ran untouched.

⭐ **The correction travels with the card ID, not with the round.**

---

## Scope — what belongs here, and what does not

**In scope:** the wording of a test card — its steps, its worked examples, its
expected results, its pre-conditions. Anything that makes a card unanswerable,
self-contradicting, or dependent on behaviour that does not exist.

**Out of scope — and explicitly forbidden here:**

- ⚠ **Verdicts.** Nothing in this file marks, re-marks or re-scores any test.
  `UAT_STRATEGY.md` §2 reserves that to the tester, and the project owner alone
  decides a re-score. An entry recording that a card's wording was impossible is
  **not** a statement that its Fail should be withdrawn.
- ⚠ **Severity.** Same reason.
- Product defects. Those are triaged per §3.5 and fixed in code.

⭐ A correction here changes what the **next** round asks. It never changes what a
**previous** round found.

---

## How to use this register

When generating a round's plan (`UAT_STRATEGY.md` §3.2):

1. Read every entry below whose **Status** is `OPEN`.
2. For each, if that card is being carried into the round you are generating,
   apply the correction to the new plan's card text.
3. Change the entry's Status to `APPLIED IN <round-id>` in the same PR.
4. Leave the entry in place. Superseded entries are kept, never deleted — the
   history of why a card reads as it does is worth more than a short file.

If a correction's premise has itself changed — for example the product gains the
behaviour the card originally assumed — add a **new** entry that cites and
overrides the old one rather than editing it.

---

## Entries

### HA-04 — step 1's worked example cannot map, by design

| Field         | Value                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| **Card**      | HA-04 — Detect and remap missing entities                                          |
| **Status**    | **APPLIED IN `v1.0.0-r3`** — 2026-08-03                                            |
| **Recorded**  | 2026-08-03                                                                         |
| **Origin**    | `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md` line 2236 (card at 2210) |
| **Round run** | v1.0.0-r2 — card was marked Fail, severity Medium                                  |

**The text as written:**

> 1. Open a dashboard, then edit one card's entity to something that does not
>    exist, e.g. `light.does_not_exist_uat`.

**What was measured:**

The auto-mapper is **correct**, and the example defeats it by construction. The
real service was bundled (`esbuild` → node) and run against the reference
instance's 725 live entities:

- A genuine rename — `sensor.sigen_plant_battery_state_of_charge_old` →
  `sensor.sigen_plant_battery_state_of_charge` — scores **1.00** and is
  auto-mapped.
- `light.does_not_exist_uat` tops out at **0.176** and maps nothing. Two
  independent reasons, either of which alone is fatal: the name is built to
  resemble nothing, **and `<HA_HOST>` has no `light` domain at all**, so even
  the domain component of the similarity score is unavailable.

A similarity matcher cannot map an identifier designed to resemble nothing. The
card manufactures its own failure and then reports it as a product defect.

**What the next round's card must say instead:**

Step 1 must direct the tester to create a **plausibly renamed** entity id — one
derived from an entity that **does** exist on the instance, in a domain that
**does** exist on the instance. The intended shape is "an entity that was renamed
in Home Assistant", which is the real-world condition remapping exists to handle:

> 1. Open a dashboard, then edit one card's entity to a **plausible rename of an
>    entity that really exists** — take an id from the entity list and alter it,
>    e.g. append `_old` to it. Do **not** invent an id in a domain the instance
>    does not have; the matcher scores on domain and name similarity, so an id
>    that resembles nothing cannot map and the test would measure nothing.

⭐ Keep an **unmappable** id as a _separate, deliberate_ check if one is wanted —
that the dialog says plainly it found no candidate, rather than silently offering
nothing. That is a different question from "does auto-map work", and conflating
the two is what round 2's card did.

**Evidence:** PR #116 (`1be4d12`, merged `ec8e4b9`) ·
`drawer_havdm_investigations_20af152af9b52acaa4b99c2c` (the five round-2 Mediums)
· `drawer_havdm_state_a15b0af78e0814cfd19cf627` (live [STATE], HA reference
instance section: 725 entities across 29 domains, no `light`/`fan`/`vacuum`/
`plant` domain).

---

### HA-08 — the expected result promises an embedded render that does not exist

| Field         | Value                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------- |
| **Card**      | HA-08 — Live Preview creates a temporary dashboard, and Close deletes it                 |
| **Status**    | **APPLIED IN `v1.0.0-r3`** — 2026-08-03                                                  |
| **Recorded**  | 2026-08-03                                                                               |
| **Origin**    | `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md` lines 2390–2406 (card at 2369) |
| **Round run** | v1.0.0-r2 — card was marked Fail, severity Medium                                        |

**The text as written** — step 3, step 4's expected result, and the starred
expected result:

> 3. Look at the embedded Home Assistant view — compare it to the HAVDM canvas.

> - ⭐ The embedded Home Assistant render is recognisably the dashboard you
>   designed — this is the single most valuable observation in the round. Note any
>   card that renders differently from the HAVDM canvas.
> - The view switcher moves between views, and the Edit Mode / Preview Mode
>   toggle switches between arranging cards and previewing — neither state
>   leaves the embedded view blank.

**What was measured:**

**Live Preview renders no iframe, and has not since `c2f77c3` (2025-12-24).**
That commit — "Fix Live Preview layout persistence issue" — removed the element
without mentioning it in its message. `iframeRef` was left unattached, so the
"reload iframe" block became unreachable dead code, and the component's JSDoc
went on claiming "Renders an iframe showing the actual Home Assistant dashboard"
for seven months. `HADashboardIframe.tsx` contains **zero** `<iframe>` tags.

Restoring embedding is not a small fix. `<HA_HOST>` serves
`X-Frame-Options: SAMEORIGIN` — measured with `curl -sS -D -` — so Chromium
refuses the frame. Embedding would require stripping that header from the
Electron session or moving to `<webview>`, which is a **security** decision
(`drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f`) and is **owner-deferred to
post-1.0**.

⚠ **This expected result can therefore never be met.** A card whose single most
valuable observation is impossible spends the tester's evening measuring nothing.

**What the next round's card must say instead:**

The card must describe what Live Preview **is**: it creates a temporary dashboard
on the Home Assistant instance, shows its **address**, and deletes it on Close.
The valuable observation moves from "the embedded render matches" to "the
temporary dashboard is created, is reachable at the address shown, and is gone
afterwards" — which the tester confirms **in a browser**, not inside HAVDM.

- Step 3 should read the **address row** and use its one-click copy (the address
  now has its own header row — `HADashboardIframe.tsx`, `live-preview-address-bar`).
- The comparison against the HAVDM canvas still has real value, but it is
  performed by **opening that address in a browser**, not by looking inside the
  app.
- Drop the "neither state leaves the embedded view blank" clause — there is no
  embedded view to leave blank.

⭐ Do **not** simply delete the fidelity observation. "Does the dashboard I
designed actually look right in Home Assistant?" is the question amendment-03 §1
names as the reason UAT exists at all. Re-point it at the browser; do not lose it.

⚠⚠ **Do NOT alter the card's final expected result** — the one reading "One left
behind is **High** — it is an unrequested persistent write to Home Assistant."
That line is the subject of an **open severity question reserved to the project
owner** (the card was scored Medium on the address symptom while its own text
rates the leftover-dashboard condition High, and three leftover temp dashboards
prove that condition occurred). Changing it would pre-empt a decision §2 reserves
to the owner.

**Evidence:** PR #117 (`9ea8609`, merged `220cadf`) ·
`drawer_havdm_investigations_20af152af9b52acaa4b99c2c` (the five round-2 Mediums)
· `drawer_havdm_decisions_0f9619ea3f92e3bcf04a531f` (security — no third-party JS
in the renderer; why live-preview embedding is deferred).

---

### VIEWS-04 — the `Auto covered` citation overstates what the cited spec proves

| Field         | Value                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| **Card**      | VIEWS-04 — Author a sections view (add, rename, reorder, delete)                   |
| **Status**    | **OPEN** — apply at `v1.0.0-r4` plan generation                                    |
| **Recorded**  | 2026-08-07                                                                         |
| **Origin**    | `docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md` line 1272 (card at 1267) |
| **Round run** | v1.0.0-r3 — card was marked Fail, severity High                                    |

⚠ **This entry corrects a COVERAGE CITATION, not a step, an expected result or a
verdict.** The card's own text is sound: step 3 asks the tester to "Add a card
into that section from the palette", and its Expected — "A card added while a
section is selected lands **in that section**, not elsewhere" — described a real
product defect, correctly reported. Nothing here withdraws or re-scores that
Fail, and nothing here touches the r3 plan.

**The text as written:**

> Auto covered: Y (`tests/e2e/sections-canvas.spec.ts`)

and the card's "Automated coverage confirms" paragraph, which claims the spec
proves "… adding palette cards into the selected section".

**What was measured** (audited per the standing recipe — open the cited spec,
follow the DSL method, check which control it drives and which step that is):

- `tests/e2e/sections-canvas.spec.ts` "adds a palette card into the selected
  section" does drive the real double-click, but it **selects a card first**, then
  asserts `data-selected-section = '1'` before adding. It therefore only ever
  exercised the branch where `selectedSectionIndex` is non-null — the branch that
  already worked. **The `?? 0` fallback was never reached, so that assertion
  could not have failed on it.**
- **No spec anywhere drove a palette DRAG onto any canvas in a sections view** —
  the half of step 3 the tester actually reported.
- The fixture had **no empty section**, so no existing leg touched the tester's
  "Cannot drag cards into any section if the section is empty" case at all.

This is a 21st form of the `auto_covered` problem: _a spec that covers the
working half of the step the card describes, and is counted as covering the
step._

**What the next round's card must say instead:**

The `Auto covered` line stays `Y` — the coverage now genuinely exists — but the
"Automated coverage confirms" paragraph must name what is actually proved, and
must not imply the drag path was ever covered before F5. The legs added by F5
(PR for `feature/f5-sections-palette-drop`) in the same spec file are:

- palette **drag** onto a populated section body, an **empty** section, an
  existing card, and a section toolbar;
- a drop on the canvas background adding nothing, and a drop into a view with
  zero sections warning rather than silently doing nothing;
- selection after a drop, one-Ctrl+Z undo granularity, and the card shape a
  dropped card carries;
- the **target marker** that names the add target before the gesture, including
  after "Add section", and that it does not displace the section toolbar's
  controls;
- an internal card drag into an **empty** section, kept as a control.

⭐ The wording should also drop any suggestion that the double-click leg proves
the no-selection case: after F5 the no-selection target is **displayed**, and it
is the marker legs — not the double-click leg — that prove it.

**Evidence:** `docs/features/F5_SECTIONS_PALETTE_DROP_SPEC.md` §9.1, §9.4
(merged PR #132, `d76878d`) · `drawer_havdm_decisions_6e8d4788d9513ccce593c378`
(ruling ARB-R7 and the 13-item remediation order, F5 is item 6) ·
`drawer_havdm_decisions_a2b1346037d4f731d4e37ba7` (the owner's Q1/Q2 rulings).

---

## Related documents

- `docs/testing/UAT_STRATEGY.md` — §2 roles, §3.2 plan generation, §5 writing
  test cards, §12 artifacts
- `prompts/claude/uat-plan-and-matrix.md` — the round generator (local-only;
  `prompts/` is gitignored)
- `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md` — the
  pass bar and the live-HA exception
