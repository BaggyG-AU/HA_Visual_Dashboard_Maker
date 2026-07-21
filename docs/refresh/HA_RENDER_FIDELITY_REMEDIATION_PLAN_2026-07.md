# HA Render-Fidelity Remediation Plan — July 2026

> **Status:** Draft for review. Produced 2026-07-21. Derives from a four-part
> read-only audit; **no product code changed in producing this plan.**
> Authoritative source for the audit findings is MemPalace wing `havdm`
> (drawer IDs listed in §7). This document is the in-repo mirror.

---

## 1. Why this plan exists

The governing design principle (user-stated, 2026-07-21):

> **The app must render a dashboard exactly — or as close as possible — to how
> Home Assistant will render it after deploy.**

A four-part audit measured the gap between what HAVDM emits and what Home
Assistant actually accepts. The finding is not a list of card bugs; it is
**structural**: HAVDM has no export boundary.

- No card-level allowlist — unknown keys pass through on every card type.
- No schema validation before deploy — the schema exists but only Monaco reads it.
- Sanitization does not recurse — nested cards keep HAVDM-internal keys.
- Two of three outbound routes (Save, Live Preview) do **no** sanitization.
- The Deploy path **re-imports its own exported YAML**, undoing the one
  transform that does run.

### What the harm actually is (verified against `home-assistant/frontend`)

Extra keys do **not** break rendering — HA stores them and card `setConfig`
ignores them. They **fail the strict `baseLovelaceCardConfig` superstruct in
HA's visual editor**. `baseLovelaceCardConfig` permits only `view_layout`,
`layout_options`, `grid_options`, `visibility`, `disabled` as extras — so
HAVDM's internal `layout: {x,y,w,h}` key alone is enough.

> **Net user harm: every card HAVDM deploys becomes YAML-only in Home
> Assistant's UI.** The dashboard renders, but those cards can never again be
> edited in HA's visual editor.

Three things are genuine render breaks, not just editor breaks:
`style`/backgrounds (card-mod needs `card_mod: {style:}`, HAVDM emits a bare
top-level `style:`), swipe-card (re-import re-injects keys upstream ignores, so
the carousel uses default settings), and the card types that do not exist.

> ⚠ **HA version note:** the frontend-behaviour findings were verified against
> tag `20260304.0` (HA 2026.3). A live `lovelace/resources` probe on
> 2026-07-21 reported the reference instance is actually **HA 2026.7.2**. The
> `baseLovelaceCardConfig` claim should be re-verified against 2026.7 before
> Phase 1 lands. (Memory/`[STATE]` previously recorded 2026.3.0 — corrected.)

---

## 2. Vision & decisions (2026-07-21)

Ratified via interview; full record in
`drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`.

**Product vision — HAVDM is a _superset design tool_.** A richer canvas than HA;
export **translates the design into working HA config wherever a translation
exists**, and honestly marks what cannot be translated. Primary user is **both,
visual-first** (canvas primary, YAML available; warnings must be plain-language).

The translate-vs-mark line: features with a real HA target are **translated**
(layout/style keys → card-mod; `visibility_conditions` → HA-native
`visibility`); design-time concepts with no clean HA equivalent (the popup and
native-graph card _types_) stay **canvas-only** and, on deploy, are replaced by a
native "Card Not Available" placeholder that holds the slot (WYSIWYG).

Decisions:

- **D-FID-1 — Invented card types: KEEP AND FIX, do not delete.** Re-implement
  correctly rather than removing; new cards are added as the app matures.
- **D-FID-2 — Capability from a live inventory** of the user's HA, persisted as
  an **offline-editable profile** (never a live query — preserves standalone).
  `lovelace/resources` feasibility **proven** (11 resources on the reference
  instance). Never-connected default is **permissive**.
- **D-FID-3 — Export is a three-way classification**, not a denylist:
  TRANSLATE / STRIP / CANVAS-ONLY (see the export-boundary design §3).
- **D-FID-4 — Two-schema split**: permissive editor schema (Monaco) + strict
  fidelity schema (deploy gate).
- **D-FID-5 — "Not Available" cards are authorable** with a "won't render on your
  instance" banner (not hard-disabled).
- **card-mod is load-bearing** under this vision — its inventory detection gates
  the whole TRANSLATE→card-mod path.

---

## 3. The plan — phased

Dependency-ordered. **Phase 0 must precede Phase 1**: any export fix built
before the Deploy re-import is removed will be silently undone.

### Phase 0 — Stop the bleeding _(small, independent, shippable now)_

0.1 Remove the export-then-reimport in `DeployDialog.tsx:75`.
0.2 Fix Live Preview → Deploy: correct the target dashboard (currently always
the default `lovelace`) and stop truncating a multi-view dashboard to one
view. _(Backed up before overwrite, but wrong target + wrong view count.)_
0.3 Gate/flag the non-rendering card types in the palette; fix the "HAVDM-only"
badge, which today matches only `custom:popup-card`.

### Phase 1 — Build the export boundary

**Detailed design:**
[`HA_EXPORT_BOUNDARY_DESIGN_2026-07.md`](./HA_EXPORT_BOUNDARY_DESIGN_2026-07.md).

1.1 Global HAVDM-only strip-set applied to **every** card on export (hybrid
denylist derived from `BaseCard`/`Phase6CardContracts`, not a full allowlist).
1.2 Make the strip recurse — fold it into `exportCard`, which
`processCardRecursively` already applies at every depth; extend the recursion
set to the containers it currently misses.
1.3 Route Save/Save As and Live Preview through the same boundary.
1.4 Namespace HAVDM internals (`layout` → `_havdm_layout`) + a value-shape
import migration — also fixes Mushroom's real `layout` option being destroyed by
the name collision.
1.5 Warn-only validation self-check now; strict HA-fidelity schema deferred (the
current schema blesses the invented keys, so it can't be the gate as-is).

### Phase 2 — Type correctness

2.1 Replace 13 `<Input type="number">` in `PropertiesPanel.tsx` with
`InputNumber`; add a lint rule to prevent recurrence.
2.2 Fix `sparkline.spec.ts:76`, whose regex tolerates the string-drift bug.

### Phase 3 — Capability inventory (WS-FID-INV)

**Detailed design:**
[`HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md`](./HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md).

3.1 Add a `lovelace/resources` client; build the resource-file → element-name
map (a file defines many elements; the list gives files, not elements).
3.2 Persist the inventory as an offline-editable **capability profile** (never a
live query — preserves standalone operation).
3.3 Three-state palette: **Available / Not Available / HAVDM-only**.
3.4 Built-in cards keyed by **HA version**, not resources (logbook→Activity,
alarm-panel `arm_*`, etc.).

### Phase 4 — Per-card schema fixes

Ranked by the audit severity table, using `custom:tabbed-card` (correct) as the
reference implementation. Highest first: modern-circular-gauge, mushroom-switch,
card-mod, slider-button-card, bubble-card, power-flow-card-plus, expander-card,
then the medium tier.

---

## 4. Sequencing against the existing refresh plan

This work is inserted **ahead of WS3/WS4**, not after: WS4-A (the 2026 ecosystem
catch-up) leads with the Sections grid, and Sections views currently deploy as
an **empty** view (`sanitizeForHA` drops `sections`, substitutes `cards: []`,
and validation passes). Building on top of a broken export boundary would
compound the problem.

Recommended order: **Phase 0 → Phase 1 → Phase 3 (inventory) → Phase 2 → Phase 4.**
The inventory precedes the per-card fixes because it tells us which cards the
user actually has, and therefore which per-card fixes matter first.

---

## 5. Risk / discipline notes

- **Every deploy-path change is user-data-affecting.** Phase 0.2 currently
  writes to the user's live default dashboard. Test read-only against the
  reference instance (VPP-enrolled — no Modbus/write side effects), and prove
  each fix against the same-checkout baseline.
- **PropertiesPanel changes require the full electron-e2e run**, not just
  integration — it is the file that has historically blanked the app.
- **A regression test not seen to fail on the base commit is decoration** —
  prove each behavioural fix red-before-green in the same checkout.

---

## 6. Status ledger

| Item                                                         | State                               |
| ------------------------------------------------------------ | ----------------------------------- |
| `gap: '8'` string bug (one instance of the type-drift class) | **Fixed — PR #37 merged** (8833f3e) |
| Four-part fidelity audit                                     | **Complete, filed to MemPalace**    |
| This plan + two design docs                                  | **Draft — this PR**                 |
| Phase 0–4                                                    | **Not started**                     |

---

## 7. Sources (MemPalace wing `havdm`)

- `drawer_havdm_investigations_53a176311652f8d7b1aaeef9` — the originating
  horizontal-stack `gap` fidelity finding.
- `drawer_havdm_investigations_c494abd68f0f165519926631` — audit part 1: the 24
  built-in HA card types.
- `drawer_havdm_investigations_b7af8f1d2740b59a6463c815` — audit part 2: the
  export/deploy pipeline (+ two corrections to part 1).
- `drawer_havdm_investigations_77e0bd4e7845e3a2e4fb3725` — audit part 3: the
  HACS custom cards and the `<Input type="number">` root cause.
- `drawer_havdm_investigations_509529d1116c60549d1f424e` — audit part 4:
  HAVDM's own inventions + verified HA behaviour.
- `drawer_havdm_investigations_62a3797a68e35260180d301d` — the e2e triage that
  led here.
