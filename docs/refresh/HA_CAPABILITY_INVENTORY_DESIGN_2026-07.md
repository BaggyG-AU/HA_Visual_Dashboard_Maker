# HA Capability Inventory — Design

> **Status:** Design for review, 2026-07-21. Companion to
> [`HA_RENDER_FIDELITY_REMEDIATION_PLAN_2026-07.md`](./HA_RENDER_FIDELITY_REMEDIATION_PLAN_2026-07.md)
> (Phase 3). Implements decision **D-FID-2**. No product code changed in
> producing this document.

---

## 1. Goal

HAVDM should offer a card only when the user's Home Assistant instance can
actually render it. A card whose backing resource is not installed is shown
**"Not Available"** and its editor is disabled. A card that exists nowhere
upstream is shown **"HAVDM-only"** (never deployable). Everything else is
**"Available"**.

This replaces _assertion_ (a static registry claiming what exists) with
_observation_ (what the instance reports).

---

## 2. Feasibility — proven

A read-only WebSocket probe on 2026-07-21 (reference instance, HA 2026.7.2):

```
→ { type: "lovelace/resources" }
← 11 resources, e.g.
  /hacsfiles/lovelace-mushroom/mushroom.js
  /hacsfiles/button-card/button-card.js
  /hacsfiles/lovelace-card-mod/card-mod.js
  /hacsfiles/modern-circular-gauge/modern-circular-gauge.js
  …
```

`haWebSocketService.ts` does not issue this command yet; it is a small addition
alongside the existing `lovelace/*` calls.

---

## 3. The three hard parts (feedback folded in from the plan review)

### 3.1 Resource URL ≠ element name — a curated map is required

`lovelace/resources` returns **files**, not custom-element tag names. One file
defines many elements (`mushroom.js` → ~15). And names drift: on the reference
instance `better-thermostat-ui-card.js` **is** installed, but at v3.2.2 the
element is `better-thermostat-normal-climate-card` — a naive "file present ⇒
available" check would show green while the card still fails.

**Design:** an in-repo curated map keyed by the stable HACS repo/folder segment
of the URL, value = the element type strings that file provides.

```
// src/services/capability/resourceElementMap.ts (new)
export const RESOURCE_ELEMENT_MAP: Record<string, string[]> = {
  'lovelace-mushroom': [
    'custom:mushroom-entity-card', 'custom:mushroom-light-card', /* …all */
  ],
  'button-card': ['custom:button-card'],
  'lovelace-card-mod': [],   // provides a STYLING key, not a card element
  'modern-circular-gauge': ['custom:modern-circular-gauge'],
  // …
};
```

Keying on the folder segment (`lovelace-mushroom`, `button-card`) is version-
independent for element **presence**. Version-specific element **renames** are a
per-entry concern handled in §3.3.

### 3.2 No version in `lovelace/resources`

The `hacstag` query param is opaque, not semver, so the resource list cannot
tell expander-card v6 (Alia5 `gap` semantics) from v7 (MelleD, inverted `gap`).
Two mitigations, both flagged **open**:

- Query the **HACS integration** for installed versions if its WS/REST surface
  exposes them (the instance runs HACS). **UNVERIFIED** that it does — a probe is
  the first inventory task.
- Fall back to fetching the resource file and reading a version banner. Fragile;
  last resort.

Until version is available, the inventory answers _presence_, not _version
correctness_. Per-card schema fixes (Phase 4) target the **current** upstream and
document the assumed version.

### 3.3 Built-in cards are not in `resources`

Built-ins (logbook→Activity, alarm-panel `arm_*`, calendar `initial_view`) vary
by **HA version**, not by installed resources. Key these off the HA version from
the WS `auth_ok` frame (`ha_version: "2026.7.2"` observed).

**Design:** a small version-gated matrix of built-in quirks, e.g.

```
{ card: 'logbook', since: '2024.11', note: 'renamed Activity; requires target:' }
```

---

## 4. The capability profile — and the standalone contract

**The hard constraint (from the standalone principle,
`drawer_havdm_decisions_0a5220b0b581800521a959f6`):** capability must never come
from a _live_ query at palette-render time, or a disconnected user has no usable
app. It comes from a **persisted profile**.

Lifecycle:

1. **On connect:** fetch `lovelace/resources` + `ha_version`, resolve through the
   maps in §3, persist a `CapabilityProfile` to app storage.
2. **Offline:** the palette reads the persisted profile. The profile is
   **user-editable** (manually toggle a card available/unavailable).
3. **Never connected:** a **permissive default** — show every _real_ card as
   Available. Only the known-nonexistent types are ever forced to HAVDM-only
   (§5). Blocking a fresh user from cards would be hostile and violate
   standalone-first.
4. **On reconnect:** re-fetch, diff against the stored profile, notify the user
   of additions/removals.

```
interface CapabilityProfile {
  haVersion: string | null;         // null = never connected
  capturedAt: string | null;
  installedElements: Set<string>;   // resolved custom:* element types
  userOverrides: Record<string, 'force-available' | 'force-unavailable'>;
}
```

---

## 5. Three-state resolution

For a given card type, in priority order:

1. **HAVDM-only** (profile-independent, always): the known-nonexistent set —
   `custom:popup-card`, `custom:native-graph-card`, `spacer`,
   `custom:card-mod` (a styling key, not a card), and the entity-rows offered as
   cards (`custom:multiple-entity-row`, `custom:fold-entity-row`,
   `custom:slider-entity-row`). These can never deploy as top-level cards; the
   palette says so and offers canvas-preview only. _(D-FID-1: keep and fix — the
   "fix" for these is a correct re-implementation, not deletion.)_
2. **Not Available**: `isCustom` card whose element is absent from
   `installedElements` (and not force-available). Editor disabled; a one-click
   "how to install" pointer to the HACS repo.
3. **Available**: HA built-in (subject to the §3.3 version matrix), or a custom
   element present in the profile, or `force-available`.

Fixes the current badge bug: `CardPalette.tsx:235` flags only
`custom:popup-card`, so `native-graph-card` masquerades as real. The resolver
replaces that single-string check.

---

## 6. Slices (maps to plan Phase 3)

| Slice | Change                                                          | Depends on |
| ----- | --------------------------------------------------------------- | ---------- |
| I0    | `lovelace/resources` client in `haWebSocketService`             | —          |
| I1    | Probe whether HACS exposes installed versions (§3.2)            | I0         |
| I2    | `RESOURCE_ELEMENT_MAP` + resolver → element set                 | I0         |
| I3    | `CapabilityProfile` persistence + offline read + defaults       | I2         |
| I4    | Three-state resolver; replace `CardPalette.tsx:235` badge check | I3         |
| I5    | HA-version built-in matrix (§3.3)                               | I3         |
| I6    | Reconnect diff + notification                                   | I3         |

---

## 7. Interaction with the export boundary

The inventory and the boundary are **complementary, not substitutes**:

- The **inventory** decides _whether to offer_ a card and _whether `style` can
  become `card_mod`_ (export boundary §6).
- The **boundary** decides _whether an offered card deploys correctly_.

A perfect inventory still leaves HAVDM leaking `_havdm_*`/`layout` and making
every deployed card YAML-only in HA — so Phases 0–1 stand regardless of Phase 3.

---

## 8. Open questions for sign-off

1. **Never-connected default** — permissive (recommended) vs restrictive?
2. **Version source** — is HACS's installed-version data reachable over WS/REST?
   (First inventory probe.)
3. **Profile storage** — reuse the existing app storage (electron-store, per
   `credentialsService` precedent) or a dedicated file?
4. **How aggressive is "Not Available"** — hard-disable the editor, or allow
   authoring with a "won't render on your instance" banner? (The latter is
   friendlier to users mid-migration who are about to install a card.)
