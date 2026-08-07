# HAVDM — UAT Feature Request Register

**Status:** standing document — append-only, carried across rounds
**Governed by:** `docs/testing/UAT_STRATEGY.md` §3.5, §12
**Read by:** the agent triaging each round; the owner when sequencing work

---

## Purpose

A UAT round surfaces two different kinds of finding, and they must not be filed
in the same place.

A **defect** is the product failing to do what a card says it should. It gets a
severity, it counts against the §3.1 pass bar, and it is tracked in the round's
triage document.

A **feature request** is the tester asking for something the product was never
claimed to do. It has **no severity**, it does **not** count against the pass
bar, and no card failed because of it.

⚠ **The failure mode this register exists to prevent is silent loss.** Requests
arrive in the notes of cards that **passed** — so they appear nowhere in the
failure tables, the severity tallies, or the issue payload. Round 2's "File →
Close" request was made in exactly that way and had to be raised a second time in
round 3 before it was recorded. **A request made on a passing card is the easiest
thing in a UAT round to lose.**

⭐ Same principle as its two sibling ledgers: `CARD_CORRECTIONS.md` keeps card
_wording_ corrections beside the immutable plan, `VERDICT_REMARKS.md` keeps owner
_re-marks_ beside the immutable export, and this keeps _requests_ beside a round
that had nowhere else to put them. **Never edit the evidence — record beside it,
keyed by id.**

---

## Scope — what belongs here

**In scope:** a capability the tester asked for that no card promised.

**Out of scope:**

- ⚠ **Anything that failed a card.** That is a defect and belongs in the round's
  triage document with a severity. Filing a defect here would remove it from the
  pass bar.
- ⚠ **Anything the agent thought of.** Every entry names the person who asked and
  the round they asked in. This is a record of what the tester wanted, not a
  backlog of our own ideas.
- Card wording (`CARD_CORRECTIONS.md`) and verdict changes (`VERDICT_REMARKS.md`).

⚠ **Recording a request here is not a commitment to build it.** Sequencing is the
owner's.

---

## How to read an entry

| Field      | Meaning                                                              |
| ---------- | -------------------------------------------------------------------- |
| **Card**   | The card whose notes carried the request — usually a **passing** one |
| **Round**  | The round it was raised in; repeated if raised again                 |
| **Asked**  | The tester's own words, verbatim                                     |
| **Status** | `OPEN` · `PLANNED` · `DONE IN <PR>` · `DECLINED — <reason>`          |

---

## FR-01 — File → "Close" to return to the Welcome screen

| Field  | Value                                              |
| ------ | -------------------------------------------------- |
| Card   | **SHELL-02** (**passed** in round 3)               |
| Round  | Raised in **round 2**, raised **again** in round 3 |
| Status | **OPEN**                                           |

**Asked, verbatim (round 3):**

> "I mentioned last round that under file we should have a 'Close' option so we
> can close a dashboard and come back to the Welcome screen without exiting the
> app. Make a note of it as a new feature."

**What it means.** There is currently no way to leave the open dashboard without
quitting HAVDM. The Welcome screen is reachable only at launch.

⚠ **This was raised in round 2 and not recorded, which is why the tester had to
raise it twice.** That is the specific loss this register was created to stop.

ⓘ **A dirty-state interaction to design for, not discover later.** PR #111 gave
File → Open an unsaved-changes guard (round-2 defect FILE-04). Close discards the
open document just as completely and will need the same guard. Note also the
standing item that undo/redo do not restore `filePath` — Close and re-open must
not leave a stale path behind.

---

## FR-02 — Search in the YAML editor

| Field  | Value                                |
| ------ | ------------------------------------ |
| Card   | **VIEWS-07** (**passed** in round 3) |
| Round  | Round 3                              |
| Status | **OPEN**                             |

**Asked, verbatim:**

> "Passes. Need to add a search feature to the yaml editor (make a note of this
> new new feature request)."

**What it means.** The YAML editor offers no find (or find-and-replace) affordance.

ⓘ The editor is Monaco, which ships its own find widget (`Ctrl+F`) — so this may
be a matter of enabling and surfacing an existing capability rather than building
one. Worth measuring before estimating.

---

## FR-03 — Document that Ctrl+Z in the YAML editor needs editor focus

| Field  | Value                               |
| ------ | ----------------------------------- |
| Card   | **YAML-05** (**passed** in round 3) |
| Round  | Round 3                             |
| Status | **OPEN**                            |

**Asked, verbatim:**

> "Confirmed all worked. NOTE that CTRL-Z only works in the yaml editor if the
> editor is selected (focus). Need to ensure this is documented"

**What it means.** A **documentation** request, not a behaviour change. Undo
inside the YAML pane is the editor's own, so it applies only while the editor
holds focus — correct behaviour that is not written down anywhere.

⭐ Worth recording for its own sake: **YAML-05 was Untested in round 2**, and its
round-3 pass is half of what closed that round's §3.1 criterion-5 gap. The
request rides on a card that mattered.

---

## FR-04 — ⭐⭐ A known-good dashboard YAML, authored by us, for the tester to use

| Field  | Value                                                        |
| ------ | ------------------------------------------------------------ |
| Card   | **HA-09** (**failed** — High)                                |
| Round  | Round 3                                                      |
| Status | **DONE IN PR #123** — fixtures + round-trip specs; see below |

**Asked, verbatim:**

> "Does not render properly. However, it could be because I have not created a
> proper dashboard. I want you to create a dashboard yaml with properly
> configured cards that should render in HA. I will then use it in HAVDM next
> round (a known good dashboard to test deployment and live preview functions)."

⚠ **HA-09's failure is a defect and is triaged as one.** Only the **request** is
recorded here. The two must not be conflated.

**Why this is load-bearing rather than a convenience.** Round 3 measured that
**four of the eleven Highs — HA-03, HA-04, HA-07 and HA-09 — all ran against the
tester's own dashboard files**, which reference things the reference instance does
not have:

- `custom:gauge-card-pro` — not among the instance's 11 installed Lovelace resources
- `sensor.example_temperature` — does not exist
- `input_boolean.toggle` — does not exist, and is not a plausible rename of any
  of the six real `input_boolean` entities (this is what HA-04's auto-map
  correctly declined to map)

⭐⭐ **It also fixes a card correction that could not bind.** HA-04's round-3
correction told the **tester** to use a plausible rename of a real entity — but
the entity came from **their own file**, not from a step they performed. A
correction addressed to the tester cannot fix an input the tester does not supply.
**A controlled fixture is the only thing that closes that loop.**

**What it must contain, derived from the reference instance rather than invented:**

- Only entities that **exist** on `<HA_HOST>` (725 across 29 domains), with
  ⚠ **no `light`, `fan`, `vacuum` or `plant` entities — the instance has none of
  those domains**
- Only HACS cards **actually installed** there — `apexcharts-card`, `button-card`,
  `power-flow-card-plus`, `mushroom`, `card-mod`, `bubble-card`,
  `mini-graph-card`, `modern-circular-gauge`, `better-thermostat-ui-card`,
  `platinum-weather-card`, `template-entity-row`
- ⭐ **At least one `sections` view** — that is what exposed HA-07, and HAVDM
  could not deploy it
- ⭐ **One deliberate canvas-only card**, so EXPORT-03 and HA-07's honest-marking
  path is exercised on purpose rather than by accident
- ⭐ **One deliberately missing entity that _is_ a plausible rename of a real
  one** (a real id with `_old` appended), so HA-04's auto-map has something it
  should map at a high score

⚠ **A fixture built to make tests pass is worthless.** It must be built to
render correctly in Home Assistant, and then be allowed to fail HAVDM if HAVDM is
wrong.

### What was delivered

Tester-facing guide: **`KNOWN_GOOD_DASHBOARD.md`**. Fixtures in
`tests/fixtures/uat/`: the HAVDM source, HAVDM's own export of it, the HA-04
remap probe, and the read-only instance capture they were built against.

⭐ **The owner's ruling extended this request in one decisive way: the dashboard
is authored IN HAVDM and its deployable artifact is produced BY HAVDM's export**,
rather than written by hand. `tests/e2e/uat-known-good-dashboard.spec.ts` drives
the real application and `tests/unit/uat-known-good-dashboard.spec.ts` runs the
result through the real export path; both compare byte-for-byte against the
committed files.

**That ruling paid for itself.** A hand-written file would have deployed cleanly
and left the export path broken. Instead the round trip measured three defects,
all recorded as assertions rather than prose:

1. ⚠⚠ **The exported sections view loses `type: sections`, and HAVDM cannot
   re-open its own artifact** — its canvas delegates only on a strict
   `type: sections` match, so the view draws blank while its six cards sit in the
   file. ⭐ Home Assistant renders it correctly: HA falls back to a sections
   layout whenever a `sections` key is present (verified in the instance's own
   frontend bundle). **HA is more forgiving of HAVDM's output than HAVDM is.**
2. **The exported masonry view carries dead `view_layout` keys**, so the designed
   geometry collapses — and there is no in-app way to avoid it, because the
   view-type editor already displays a HAVDM view as "Masonry".
3. **The deploy validator rejects the dashboard** with HA-07's exact message.

⚠ **Two of the three confounds this register blamed on the tester's own file were
HAVDM's**: `custom:gauge-card-pro` is a HAVDM palette card, and
`sensor.example_temperature` is the default entity HAVDM fills in for it
(`cardRegistry.ts:535`, `:561`, `:581`).

---

## Change log

| Date       | Change                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 2026-08-03 | Register opened during round-3 triage. FR-01 … FR-04 recorded. FR-01 was first raised in round 2 and lost. |
