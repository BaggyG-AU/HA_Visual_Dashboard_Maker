# HAVDM — The Known-Good Dashboard (FR-04)

**Status:** standing document — regenerated when the fixtures are regenerated
**Governed by:** `docs/testing/UAT_STRATEGY.md`; requested as **FR-04** in `FEATURE_REQUESTS.md`
**Read by:** the tester before a round; the agent generating a round's plan

---

## Why this exists

Round 3 measured that **four of its eleven High defects — HA-03, HA-04, HA-07
and HA-09 — all ran against the tester's own dashboard files**. Those files
reference things the reference instance does not have:

- `custom:gauge-card-pro` — not among the instance's 11 installed Lovelace resources
- `sensor.example_temperature` — does not exist
- `input_boolean.toggle` — does not exist, and is not a plausible rename of any of
  the six real `input_boolean` entities

So four High defects were measured against an uncontrolled input, and none of
them could be cleanly attributed to HAVDM.

⚠ **Two of those three came from HAVDM itself, not from the tester.**
`custom:gauge-card-pro` is a card in HAVDM's own palette, and
`sensor.example_temperature` is the **default entity HAVDM fills in** for it
(`src/services/cardRegistry.ts:581`, and again at `:535` and `:561` for
`custom:apexcharts-card` and `custom:native-graph-card`). The tester dragged a
card off the palette and HAVDM supplied an entity that does not exist. That is
worth knowing before anyone reads round 3's confounds as tester error.

---

## What you are given

All four files live in `tests/fixtures/uat/`.

| File                              | What it is                                                                |
| --------------------------------- | ------------------------------------------------------------------------- |
| `known-good-dashboard.havdm.yaml` | **Open this one in HAVDM.** The HAVDM-format source.                      |
| `known-good-dashboard.ha.yaml`    | What HAVDM's **Export for Home Assistant** produces from it.              |
| `remap-probe.havdm.yaml`          | A small separate file for the entity-remapping card (HA-04).              |
| `instance-manifest.json`          | The read-only capture of the instance the other three were built against. |

⭐ **The dashboard was authored in HAVDM, not written by hand.**
`tests/e2e/uat-known-good-dashboard.spec.ts` drives the real application — card
palette, view-settings dialog, sections canvas, properties panel — and
`tests/unit/uat-known-good-dashboard.spec.ts` runs the result through the real
export path. Both assert against the committed files, so if HAVDM's output ever
drifts, the tests fail rather than the fixtures quietly becoming hand-maintained
files that only look like exports.

### What is in it

**View 1 "Home"** — a masonry view: a `tile` (garage door), a `button` (garage
lamp), a `weather-forecast`, a `custom:mushroom-person-card`, and **one
deliberate canvas-only card** so the "Card Not Available" placeholder path is
exercised on purpose.

**View 2 "Energy"** — a **sections** view with two sections, each led by a
`heading` card: battery gauge and solar tile in the first, EV battery tile and a
renewables gauge in the second.

Every entity was enumerated read-only from `<HA_HOST>` on **2026-08-04** and
had a real state at the time. Every card type is either Home Assistant native or
one of the 24 elements resolved in the capability profile. There are no
`custom:grid-layout` views — layout-card is not installed on the instance.

---

## ⚠ Three things that are wrong TODAY, and are not defects you need to find

These are already measured and recorded. They are noted here so you do not spend
a round rediscovering them, and so you are not surprised when you hit them.

1. **The "Energy" view will not deploy.** HAVDM refuses it with
   _`View "Energy" must have a "cards" array (can be empty).`_ — the same error
   round 3 reported as HA-07. A sections view legitimately has no top-level
   `cards`. This is fix **F1**, already queued.
2. **If you re-open the EXPORTED file in HAVDM, the Energy view will look
   empty.** The export drops its `type: sections`, and HAVDM's canvas only draws
   a sections view on a strict `type: sections` match — so it shows a flat view
   with nothing in it. The six cards are still in the file. ⭐ **Home Assistant is
   fine with it — this has now been deployed to a real instance and looked at**
   (`tests/live/ha-deploy-render.spec.ts`): the Energy view renders as a proper
   sections view with both sections and all six cards, because HA falls back to a
   sections layout whenever a `sections` key is present. **It is HAVDM, not Home
   Assistant, that cannot re-read its own output.** This is fix **F9**.
3. **The Home view's cards carry `view_layout` keys that Home Assistant
   ignores**, so the layout you saw on the HAVDM canvas will not be reproduced —
   the cards stack. Also **F9**. The dashboard still renders correctly; only the
   geometry is lost.

⭐ **Everything else is meant to work, and anything else that does not is a real
finding.** That is the entire point of a controlled fixture: it separates "HAVDM
is wrong" from "the input was wrong".

---

## How to use it in a round

1. Copy `known-good-dashboard.havdm.yaml` somewhere you can open it — the same
   place you keep your other UAT dashboards is fine.
2. In HAVDM: **File → Open**, and pick that file.
3. Work the round's cards against it as normal.
4. For the deploy and live-preview cards, use the **"Home"** view — see the note
   above about "Energy".
5. For the entity-remapping card, open `remap-probe.havdm.yaml` instead. It
   contains `sensor.sigen_plant_pv_power_old`, which does not exist, while
   `sensor.sigen_plant_pv_power` — the same id without `_old` — does. So the
   auto-mapper has something it **should** match at a high score. Round 3's
   missing entity resembled nothing real, which is why the mapper declining it
   was correct behaviour and the card measured nothing.

ⓘ The dashboard's title is `New Dashboard`, because **HAVDM has no in-app control
for the dashboard title** — it is display-only (`src/App.tsx:3055`). The deploy
dialog asks you for a title, so set it there.

---

## Regenerating the fixtures

Both files are generated, not edited. Never hand-edit them — the specs compare
byte-for-byte and a hand edit will fail them (which is the point).

```bash
# 1. Re-author in the app and rewrite the HAVDM source
HAVDM_WRITE_FIXTURES=1 bash tools/test-headless.sh \
  tests/e2e/uat-known-good-dashboard.spec.ts --project=electron-e2e --workers=1

# 2. Re-run the export and rewrite the HA artifact
HAVDM_WRITE_FIXTURES=1 npx vitest run tests/unit/uat-known-good-dashboard.spec.ts

# 3. Verify both without the flag — this is what CI runs
npx vitest run tests/unit/uat-known-good-dashboard.spec.ts
```

⚠ `instance-manifest.json` is a **read-only capture of a live instance** and is
regenerated separately, by enumerating `<HA_HOST>` again. The instance
drifts: between 2026-08-03 and 2026-08-04 it went from 725 entities across 29
domains to **877 across 30**, and gained the `select` and `text` domains. Re-enumerate
before trusting any count from a previous round.

---

## Change log

| Date       | Change                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------- |
| 2026-08-04 | Created for FR-04. Fixtures authored in HAVDM against the instance as measured that day. |
