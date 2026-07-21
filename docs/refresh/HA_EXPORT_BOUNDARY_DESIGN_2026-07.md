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

## 3. Core decision: a three-way key/card classification

> **Revised after the vision interview (2026-07-21,
> `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`).** HAVDM is a **superset
> design tool**: it offers more than HA, and export's job is to **translate the
> design into working HA config wherever a translation exists**, and to honestly
> mark what cannot be translated. So the boundary is **not** a simple denylist —
> it is a classification with three actions.

A full **allowlist** (emit only keys we know a card supports) is still rejected:
it fights the "type any valid YAML" freedom and is a maintenance treadmill. But a
plain denylist is too blunt for a superset tool — it would _strip_ features that
actually have a real HA target. Every HAVDM-only key/card gets one of three
export actions:

| Class           | Members                                                                                                                                                                                                                                    | Export action                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TRANSLATE**   | `gap`, `align_items`, `justify_content`, `justify_items`, `wrap`, `row_gap`, `column_gap`, `card_margin`, `card_padding`, `style`; `visibility_conditions`/`visibility_operator`                                                           | → **card-mod CSS** (layout/style); → HA-native **`visibility`** (conditions). Emit when the instance supports the adapter; **strip + warn** when not. |
| **STRIP**       | `_havdm_layout`, `_isSpacer`, `_expanderDepth`, `icon_color_mode` (derived HAVDM state)                                                                                                                                                    | pure internal bookkeeping, no HA meaning — remove silently                                                                                            |
| **CANVAS-ONLY** | phantom card **types** (popup, native-graph, …); behavioural features with no HA mechanism: `attribute_display*`, `multi_entity_mode`, `aggregate_function`, `batch_actions`, `trigger_animations`, `state_styles`, `state_icons`, `sound` | design-time only. Card types → **placeholder-on-deploy** (§6a). Behavioural keys → strip (per-key confirm in Phase 4).                                |

The members are still **finite and enumerable from the type system** — precisely
the fields `BaseCard` (`types/dashboard.ts:34-72`) and `Phase6CardContracts`
(`types/phase6.ts:19-24`) add beyond HA's card config.

### 3.1 The classification registry

```
// src/services/haExportContract.ts  (new)
export const KEY_ACTION = {
  // TRANSLATE — a real HA target exists
  gap: 'card-mod', align_items: 'card-mod', justify_content: 'card-mod',
  justify_items: 'card-mod', wrap: 'card-mod', row_gap: 'card-mod',
  column_gap: 'card-mod', card_margin: 'card-mod', card_padding: 'card-mod',
  style: 'card-mod',
  visibility_conditions: 'ha-visibility', visibility_operator: 'ha-visibility',
  // STRIP — internal bookkeeping
  _havdm_layout: 'strip', _isSpacer: 'strip', _expanderDepth: 'strip',
  icon_color_mode: 'strip',
  // CANVAS-ONLY behavioural keys
  attribute_display: 'canvas', attribute_display_layout: 'canvas',
  multi_entity_mode: 'canvas', aggregate_function: 'canvas',
  batch_actions: 'canvas', trigger_animations: 'canvas',
  state_styles: 'canvas', state_icons: 'canvas', sound: 'canvas',
} as const;
```

> A `satisfies` guard ties this map to the interfaces so a new `BaseCard` field
> **fails the build until it is classified** TRANSLATE / STRIP / CANVAS-ONLY.
> That is the "complete by construction" property, now over three actions.

Kept **out** of the map deliberately (HA-real extras `baseLovelaceCardConfig`
accepts): `view_layout`, `visibility`, `grid_options`, `layout_options`.

> **card-mod is now load-bearing.** Under the superset+compile vision the
> TRANSLATE→card-mod path is central, so the capability inventory's card-mod
> detection gates it, and HAVDM should consider prompting users to install
> card-mod. (card-mod is installed on the reference instance.) The exact
> card-mod CSS mapping for each layout key is a Phase-1 sub-design.

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

## 6. `style` / backgrounds — TRANSLATE to card-mod

`style` is emitted as a bare top-level key on every card but expander; card-mod
reads only `card_mod: { style: … }` (audit parts 1 & 3, verified against
card-mod v4.2.1). So today every background/CSS a user paints is dropped by HA.

**Decision (ratified):** `style` (and the layout keys) are **TRANSLATE**-class —
emit `card_mod: { style }` when card-mod is available; **strip + warn** when it is
not. Gated on the capability profile
([`HA_CAPABILITY_INVENTORY_DESIGN`](./HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md)).
card-mod **is installed** on the reference instance (`lovelace/resources` probe,
2026-07-21). The layout keys (`gap`/`align_items`/…) translate to the equivalent
flex/grid CSS in the same `card_mod` block; the per-key CSS mapping is a Phase-1
sub-design.

### 6.1 Per-key CSS mapping — ratified & implemented (B6, 2026-07-21)

Implemented in `src/services/cardModTranslator.ts` (`translateToCardMod`), plugged
into `exportCard` (before the STRIP step) so it applies at every depth via
`processCardRecursively`. The sub-design decisions:

- **Split-selector strategy.** Everything compiles into one
  `card_mod: { style: <css> }` block across **two** rules — box keys target
  `ha-card { … }` (the card's own box); layout keys target `#root { … }` (HA's
  stack/grid internal flex/grid container).

  | Key                              | Rule      | CSS emitted                                                           |
  | -------------------------------- | --------- | --------------------------------------------------------------------- |
  | `style`                          | `ha-card` | the raw CSS declarations, verbatim                                    |
  | `card_margin` / `card_padding`   | `ha-card` | `margin:` / `padding:` 4-value px shorthand (`toSpacingCssShorthand`) |
  | `gap` / `row_gap` / `column_gap` | `#root`   | `gap:` / `row-gap:` / `column-gap:` `<clampLayoutGap>px`              |
  | `align_items`                    | `#root`   | `align-items:` (`ALIGN_ITEMS_TO_CSS`: `start`→`flex-start`, …)        |
  | `justify_content`                | `#root`   | `justify-content:` (`JUSTIFY_CONTENT_TO_CSS`)                         |
  | `justify_items`                  | `#root`   | `justify-items:` (`JUSTIFY_ITEMS_TO_CSS`)                             |
  | `wrap`                           | `#root`   | `flex-wrap:` (verbatim: `nowrap`/`wrap`/`wrap-reverse`)               |

  The CSS is produced with the **same normalizers the canvas renderers use**
  (`layoutConfig.ts`, `cardSpacing.ts`), so exported CSS mirrors the HAVDM canvas.

- **Collision guard (mirrors B5's `layout` disambiguation).**
  `custom:expander-card` has its own real `gap` option which is a **string**
  (e.g. `'0.5em'`); HAVDM's stack `gap` is a **number**. So `gap`/`row_gap`/
  `column_gap` are only claimed for translation when the value is a finite
  **number** — a string gap passes through untouched.

- **Capability gate.** An optional `cardModAvailable` flag threads through the
  boundary, **default `true`** (assume present — the reference instance has it).
  When `false`, the keys are **stripped + a plain-language warning is recorded**
  (collected via an optional accumulator; surfaced to the user in **B8**). The
  full capability-inventory gate remains **Phase 3**.

- **Merge, don't clobber.** If a card already carries a `card_mod` with a string
  `style`, the generated CSS is **appended**; with an object-form `style`, the
  existing block is left untouched and a warning is recorded.

- **Two accepted imperfections** (honest translation, per the vision): a _stack_
  that also carries box keys — stacks render `#root` with no `ha-card`, so the
  `ha-card{}` rule is a no-op there; and HA's horizontal-stack sets child margins
  for spacing, so an injected `gap` adds to them rather than replacing.

## 6a. Canvas-only card types — placeholder-on-deploy

Phantom card **types** (popup, native-graph, and the other non-existent types)
are CANVAS-ONLY: they render on the HAVDM canvas but must not deploy as a card of
that type. On deploy each is **substituted with a placeholder that holds its
slot** (WYSIWYG geometry preserved) and displays **"Card Not Available"**.

> ⚠ The placeholder **must be an HA-native, renderable card** — a `markdown` card
> is the clean choice — **NOT `type: spacer`.** `spacer` is itself a phantom
> type; HA renders it as _"Unknown type encountered: spacer"_, the exact error
> tile this avoids (audit part 4). The substitution copies the original card's
> `view_layout`/`grid_options`/size so the slot is preserved.

Applies on every HA-bound route. The pre-deploy summary lists which cards were
substituted (consistent with the "author-with-banner" palette policy).

---

## 6b. `visibility_conditions` — TRANSLATE to native `visibility` (implemented)

Implemented in `src/services/visibilityTranslator.ts` (`translateVisibility`),
plugged into `exportCard` beside the card-mod translate and the STRIP step, so it
runs at every depth. HAVDM's own `visibility_conditions` + `visibility_operator`
(`types/logic.ts`) compile into Home Assistant's **native card-level `visibility`**
array (HA 2024.6+; reference instance 2026.7.2). **No capability gate** — native
`visibility` is a core HA feature, not an add-on.

The per-rule mapping mirrors HAVDM's own evaluator (`conditionalVisibility.ts`) so
a card behaves in HA exactly as it did on the canvas:

- **Root operator** (`visibility_operator`, default `and`): `and` → the translated
  conditions as the array (HA ANDs it implicitly); `or` → a single
  `{ condition: 'or', conditions: [...] }` wrapper.

  | HAVDM rule                                        | HA condition                                                                  |
  | ------------------------------------------------- | ----------------------------------------------------------------------------- |
  | `state_equals {entity,value}`                     | `{condition:'state', entity, state:<value>}`                                  |
  | `state_not_equals {entity,value}`                 | `{condition:'state', entity, state_not:<value>}`                              |
  | `state_in {entity,values}`                        | `{condition:'state', entity, state:[…]}`                                      |
  | `state_not_in {entity,values}`                    | `{condition:'state', entity, state_not:[…]}`                                  |
  | `attribute_equals {entity,attribute,value}`       | `{condition:'state', entity, attribute, state:<value>}`                       |
  | `attribute_greater_than {entity,attribute,value}` | `{condition:'numeric_state', entity, attribute, above:<n>}`                   |
  | `attribute_less_than {entity,attribute,value}`    | `{condition:'numeric_state', entity, attribute, below:<n>}`                   |
  | `and`/`or` group                                  | `{condition:'and'\|'or', conditions:[…recursive]}`                            |
  | `entity_exists {entity}`                          | `{condition:'state', entity, state_not:['unavailable','unknown']}` **+ warn** |

- **`entity_exists`** has no native HA `visibility` condition. Per the ratified
  decision (2026-07-21) it is **approximated** to "the entity is available" and a
  plain-language `ExportWarning` (`category: 'visibility'`, reason
  `visibility-approximated`) is recorded.
- Scalar `state`/`state_not` values are **stringified** (mirrors the evaluator's
  `String(value)` compare); `numeric_state` bounds are coerced to `Number`.
- If a card already carries a native `visibility`, the translated conditions are
  **appended** (both are top-level AND).
- Warnings share the B6 accumulator — `CardModWarning` was generalised to
  **`ExportWarning`** (`src/services/exportWarnings.ts`, `category: 'card-mod' |
'visibility'`) so B8 consumes one unified list.

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

**Decision (ratified 2026-07-21):** **two-schema split** — a permissive _editor_
schema (drives Monaco) and a strict _fidelity_ schema (drives the deploy gate).
The fidelity schema is derived from the capability inventory + per-card known-key
sets + the TRANSLATE/STRIP/CANVAS classification (§3).

---

## 9. Test strategy

- **Unit** (extend the EXISTING specs — `tests/unit/yaml-service.spec.ts` and
  `tests/unit/yaml-conversion-service.spec.ts` both exist; the audit part 2 §5
  claim that "there is no `yamlService`/`yamlConversionService` unit spec today"
  was **wrong**, corrected here): `sanitizeForHA`/`serializeForHA` applies each
  `KEY_ACTION` class correctly at top level **and nested** — STRIP keys gone
  (B1/B2, `tests/unit/haExportContract.spec.ts` + the `export boundary (B2/B3)`
  block in `yaml-service.spec.ts`); TRANSLATE keys emitted as
  `card_mod`/`visibility` (card-mod present) or stripped + flagged (absent);
  CANVAS keys/types handled per §6a. Migrates bare `layout` by value shape;
  leaves Mushroom `layout: 'horizontal'`.
- **Classification invariant:** no STRIP-class or raw TRANSLATE-class key
  survives `serializeForHA(x)` at any depth — assert recursively.
- **Placeholder invariant:** a canvas-only card type in the input yields a
  native `markdown` "Card Not Available" card at the same slot in the output —
  and **never** `type: spacer`.
- **Regression, red-before-green in the same checkout:** a spacer nested in a
  stack must not appear in the boundary output (fails on `main` today).
- **Full electron-e2e** for any `PropertiesPanel` / deploy-path change — the
  integration suite is insufficient (it once missed a change that blanked the
  app; `calendar.visual` is the canary).

---

## 10. Sequenced slices (maps to plan Phase 0–1)

| Slice | Change                                                                        | Depends on |
| ----- | ----------------------------------------------------------------------------- | ---------- |
| B0    | Remove `DeployDialog` re-import; deploy the object — **DONE (PR #39)**        | —          |
| B1    | `haExportContract.ts` + `KEY_ACTION` map + type guard — **DONE (PR #40)**     | —          |
| B2    | Fold STRIP into `exportCard`; generic recursion — **DONE**                    | B1         |
| B3    | Move spacer filter into the recursive pass — **DONE (folded into B2)**        | B2         |
| B4    | Route Save/Live-Preview through `serializeForHA` — **DONE (PR #43)**          | B2         |
| B5    | Rename `layout` → `_havdm_layout` + import migration shim — **DONE (PR #44)** | B2         |
| B6    | TRANSLATE→card-mod: layout keys + `style` → `card_mod` (§6.1) — **DONE**      | B2         |
| B6b   | TRANSLATE→native: `visibility_conditions` → HA `visibility` (§6b) — **DONE**  | B2         |
| B7    | CANVAS-ONLY card types → native "Card Not Available" placeholder (§6a)        | B2         |
| B8    | Warn-only validation self-check                                               | B2         |

B0 is independently shippable and unblocks everything else. B6/B6b/B7 are the
"superset translation" layer; they are what makes this a translating boundary
rather than a stripping one.
