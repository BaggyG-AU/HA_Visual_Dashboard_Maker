# HA Export Boundary — Design

> **Status:** Design for review, 2026-07-21. Companion to
> [`HA_RENDER_FIDELITY_REMEDIATION_PLAN_2026-07.md`](./HA_RENDER_FIDELITY_REMEDIATION_PLAN_2026-07.md)
> (Phases 0–1). No product code changed in producing this document. Grounded in
> the four-part audit (MemPalace wing `havdm`; drawer IDs in the plan §7).

---

## 1. The problem, restated as an architecture gap

HAVDM has three outbound routes and no single boundary that turns an internal
editor config into an HA-ready config:

| Route                 | Entry                                   | Sanitizes?                           |
| --------------------- | --------------------------------------- | ------------------------------------ |
| Deploy dialog         | `App.tsx:1937` `serializeForHA`         | Yes — **but re-imported**, see below |
| Save / Save As        | `App.tsx:419,444` `serializeDashboard`  | **No**                               |
| Live Preview → Deploy | `App.tsx:1260`, `HADashboardIframe.tsx` | **No**                               |

And the one route that sanitizes undoes itself: `DeployDialog.tsx:75` calls
`parseDashboard()` (→ `importDashboard`, the inverse transform) on the exported
YAML string before sending it, re-inflating the HAVDM-internal keys
`exportDashboard` had just canonicalised.

Three structural defects follow:

1. **No card-level boundary.** `exportCard` (`yamlConversionService.ts:629`)
   special-cases four card types and returns `{ ...card }` for everything else.
2. **No recursion for the strip.** `sanitizeForHA` (`yamlService.ts:115`) cleans
   only top-level `view.cards`; nested cards keep `layout`, `_isSpacer`, etc.
3. **No validation.** `ha-dashboard-schema.json` is consumed only by Monaco
   (`monaco-setup.ts`); nothing validates before deploy.

---

## 2. Design goals

- **One boundary.** Exactly one function converts internal config → HA config;
  every outbound route calls it. It returns a plain object, never a re-parsed
  string.
- **Complete by construction.** The set of HAVDM-only keys is derivable from the
  type system, not maintained by hand against each card.
- **Non-destructive to legitimate keys.** A user may type any valid YAML in the
  editor; the boundary must not strip keys just because HAVDM doesn't model them.
- **Reversible for round-trip.** Internal keys survive Save-for-editing; they are
  removed only on the HA-bound path. (Save-to-file gets a mode switch — see §7.)

---

## 3. Core decision: hybrid denylist, not full allowlist

Two candidate philosophies:

- **Allowlist** (emit only keys we know a card supports). Rejected: it fights the
  "type any valid YAML" freedom, and it is a maintenance treadmill — every
  upstream schema addition requires a HAVDM change, and any key we don't yet
  model is wrongly dropped.
- **Denylist** (remove a known set of HAVDM-invented keys). Chosen, because the
  HAVDM-only keys are **finite and enumerable from the type system** — they are
  precisely the fields `BaseCard` (`types/dashboard.ts:34-72`) and
  `Phase6CardContracts` (`types/phase6.ts:19-24`) add beyond Home Assistant's
  card config.

### 3.1 The HAVDM-only key registry

A single exported constant, derived to stay in lock-step with the types:

```
// src/services/haExportContract.ts  (new)
export const HAVDM_ONLY_KEYS = [
  // visual/behaviour extensions (BaseCard)
  'style',                    // → card_mod on capable instances; see §6
  'card_margin', 'card_padding',
  'haptic', 'sound',
  'attribute_display', 'attribute_display_layout',
  'state_icons',
  'icon_color_mode', 'icon_color_states', 'icon_color_attribute',
  'multi_entity_mode', 'aggregate_function', 'batch_actions',
  // Phase6CardContracts
  'smart_defaults', 'state_styles', 'trigger_animations',
  'visibility_conditions', 'visibility_operator',
  // internal bookkeeping (namespaced target — see §5)
  '_havdm_layout', '_isSpacer', '_expanderDepth',
] as const;
```

> A type-level guard (`satisfies`) ties this list to the interfaces so a new
> `BaseCard` field fails the build until it is classified as HA-real or
> HAVDM-only. That is the "complete by construction" property.

Kept **out** of the denylist deliberately (they are HA-real extras that
`baseLovelaceCardConfig` accepts): `view_layout`, `visibility`, `grid_options`,
`layout_options`.

### 3.2 The single boundary function

```
serializeForHA(config) → HA-ready object        // the ONLY HA-bound transform
```

Composition, reusing what exists:

- The global strip is folded **into `exportCard`** (`yamlConversionService.ts:629`).
  Because `processCardRecursively` already applies `exportCard` to every card at
  every depth, recursion is then free — this closes defect (2) at the same site
  as defect (1).
- Per-card canonical exporters (swipe/expander/tabbed/calendar) keep running,
  then the global strip runs last so nothing they pass through leaks.
- **Extend the recursion set.** `processCardRecursively`
  (`yamlConversionService.ts:515-578`) only recurses into a hard-coded container
  list; it misses `custom:vertical-stack-in-card`, `custom:auto-entities`, and
  others (audit part 2). Replace the type check with a generic "recurse into any
  `cards[]` array and any `card` object" rule.

### 3.3 Killing the re-import

`DeployDialog` must deploy the **object** `serializeForHA` returns, not a YAML
string it re-parses. The YAML string remains for **display only**.

```
// DeployDialog — before
const parsed = yamlService.parseDashboard(dashboardYaml);   // re-import: DELETE
haWsSaveDashboardConfig(path, parsed.data);

// after
haWsSaveDashboardConfig(path, haReadyConfig);               // the object, untouched
```

This is the single highest-leverage change and **must land before any strip
work**, or the strip is silently undone (audit part 4).

---

## 4. Recursion + the two nested leaks

Once the strip lives in `exportCard` and recursion is generic:

- Nested `layout` / `_havdm_layout` → stripped at every depth.
- Nested `type: 'spacer'` → filter must also move into the recursive walk (today
  it is a top-level `.filter()` in `sanitizeForHA:131`). Spacer removal becomes
  part of the same recursive pass so a spacer inside a stack no longer ships as
  an error card.

---

## 5. Namespacing internals + the migration

**Why:** HAVDM's internal `layout: {x,y,w,h}` collides with Mushroom's **real**
`layout: 'horizontal'|'vertical'` option. Today `yamlService.ts:135` deletes
`layout` unconditionally, destroying Mushroom's real setting (audit part 3, X5).

**Decision:** rename the internal key `layout` → `_havdm_layout`. The strip then
removes `_havdm_layout` and **leaves** Mushroom's `layout` intact.

**Migration (persisted files + imported dashboards carry bare `layout`):** a
read-side shim in `importCard`, disambiguating by value shape —

```
if (isObject(card.layout) && hasAny(card.layout, ['x','y','w','h'])) {
  card._havdm_layout = card.layout;   // HAVDM grid geometry
  delete card.layout;
}
// else: leave `layout` (Mushroom string value, or a real HA key) untouched
```

> Alternative considered: skip the rename, and make the strip value-type-aware
> ("delete `layout` only when it is an `{x,y,w,h}` object"). Rejected as the
> primary mechanism — it is implicit type-sniffing at the export site and the
> next internal key we add could collide again. The rename makes internal keys
> unambiguous; the value-shape check is used **only** in the one-time migration
> shim. **Open for review.**

---

## 6. `style` / backgrounds — the one genuine feature at stake

`style` is emitted as a bare top-level key on every card but expander; card-mod
reads only `card_mod: { style: … }` (audit parts 1 & 3, verified against
card-mod v4.2.1). So today every background/CSS a user paints is dropped by HA.

card-mod **is installed** on the reference instance (`lovelace/resources` probe,
2026-07-21), so a real fix is viable. Options, gated by the capability inventory:

- **A — emit `card_mod: { style }` when card-mod is available**, strip `style`
  when it is not (with a UI warning that background won't render).
- **B — canvas-only**, always strip, label the control "preview-only in HA".

**Recommendation: A, gated on the inventory** — honours the fidelity principle
where the user's instance can honour it, degrades to B with a clear warning where
it can't. Requires the capability profile
([`HA_CAPABILITY_INVENTORY_DESIGN`](./HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md)).

---

## 7. Save-to-file: two intents, one switch

Save/Save As currently emits raw internal config (not HA-loadable). But a saved
file has two legitimate uses: **re-open in HAVDM** (keep internal keys) vs
**hand to HA** (stripped). Design: Save keeps internal keys (round-trips); add an
explicit **"Export for Home Assistant"** action that runs `serializeForHA`. This
preserves editing fidelity without shipping `_havdm_*` to a file the user then
pastes into HA.

---

## 8. Schema validation — deliberately staged, and why it's hard

`ha-dashboard-schema.json` is **HAVDM's own** schema and it _blesses the invented
keys as first-class_ (it declares `gap`/`align_items`/etc. as normal stack
properties). So it cannot be the fidelity gate as-is — validating against it
would approve exactly the keys HA rejects.

Staged approach:

1. **Now:** a warn-only structural gate (the hand-rolled checks in
   `DeployDialog.tsx:88-103`, plus "no `_havdm_*` / no bare `layout` survived the
   boundary" as a self-check assertion).
2. **Later:** a strict HA-fidelity schema, most credibly **derived from the
   capability inventory + per-card known-key sets** (Phase 4), since HA does not
   publish machine-readable per-card schemas.

> **Open question for decision:** do we split into two schemas — a permissive
> _editor_ schema (drives Monaco) and a strict _fidelity_ schema (drives the
> deploy gate) — or correct the single schema and add a separate deploy-time
> allow-check? Recommend the two-schema split; flagged for sign-off.

---

## 9. Test strategy

- **Unit** (new — there is no `yamlService`/`yamlConversionService` unit spec
  today, audit part 2 §5): `serializeForHA` strips every `HAVDM_ONLY_KEYS` entry
  at top level **and nested**; preserves HA-real extras; migrates bare `layout`
  by value shape; leaves Mushroom `layout: 'horizontal'`.
- **Round-trip invariant:** `serializeForHA(x)` contains no key in
  `HAVDM_ONLY_KEYS` at any depth — assert recursively.
- **Regression, red-before-green in the same checkout:** a spacer nested in a
  stack must not appear in the boundary output (fails on `main` today).
- **Full electron-e2e** for any `PropertiesPanel` / deploy-path change — the
  integration suite is insufficient (it once missed a change that blanked the
  app; `calendar.visual` is the canary).

---

## 10. Sequenced slices (maps to plan Phase 0–1)

| Slice | Change                                                    | Depends on    |
| ----- | --------------------------------------------------------- | ------------- |
| B0    | Remove `DeployDialog` re-import; deploy the object        | —             |
| B1    | `haExportContract.ts` + `HAVDM_ONLY_KEYS` + type guard    | —             |
| B2    | Fold global strip into `exportCard`; generic recursion    | B1            |
| B3    | Move spacer filter into the recursive pass                | B2            |
| B4    | Route Save/Live-Preview through `serializeForHA`          | B2            |
| B5    | Rename `layout` → `_havdm_layout` + import migration shim | B2            |
| B6    | `style` → `card_mod` gating                               | inventory, B2 |
| B7    | Warn-only validation self-check                           | B2            |

B0 is independently shippable and unblocks everything else.
