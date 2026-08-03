# Release Notes — v1.0.0

> ⚠ **DRAFT — accumulating during UAT remediation.** The `0.7.5-beta.10` → `1.0.0`
> version bump is **not** applied by this document and must not be inferred from
> it. Per
> [`phase-7-ecosystem-future-growth-amendment-03.md`](../governance/phases/phase-7-ecosystem-future-growth-amendment-03.md)
> §3.1 the bump happens only on an **accepted** UAT round.
>
> This file exists now because amendment-03 §3.1 criterion 2 requires every
> Medium-severity UAT defect to be either fixed **or explicitly accepted in
> writing here, under Known Issues** — and states that _silent acceptance is not
> acceptance_. Accepted Mediums are recorded as they are decided, not in a batch
> at the end.

## Known Issues

Each entry below is a defect found during User Acceptance Testing that the
project owner has decided to **ship as a documented limitation** rather than fix
before v1.0.0, together with the reasoning for that decision.

### THEME-02 — Themes can be saved and loaded, but not authored, and they colour only the canvas

**Severity:** Medium · **Found in:** UAT round 2 (`v1.0.0-r2`, 2026-07-31) ·
**Decision:** accepted in writing, 2026-08-03

**What works.** Saving the active theme under a name, loading a saved theme back,
and deleting a saved theme all work as described in the UAT card, and the Saved
Themes list is correct.

**Limitation 1 — there is no theme editor.** HAVDM can save the _currently
selected_ theme under a new name, but it has no way to change a theme's values
first. In practice this means "Save" can only ever store a copy of a built-in
theme under a different name, which is rarely useful on its own. There is no
custom theme creator in v1.0.0.

**Limitation 2 — a theme colours the canvas background and text only.** Selecting
a theme changes the canvas surface colour and its text colour. It does not
restyle cards, the application chrome, or anything else. HAVDM publishes roughly
thirty theme values as CSS custom properties on the canvas element, but nothing
in the application reads them yet, so those values currently have no visible
effect.

**Why this is accepted rather than fixed.** Closing either limitation is a
feature, not a repair. A theme editor needs a full value-editing surface with
validation and preview; making a theme actually _reach_ the interface means
threading those thirty-odd values through every card renderer and the
application chrome, and re-capturing every full-page visual baseline in the test
suite. That is a substantially larger body of work than the other round-2
Mediums combined, and it changes the appearance of the entire product — which is
not a change to make immediately before a first stable release. The mechanism
the UAT card actually tests (save, load, delete) is sound, so nothing here is at
risk of losing user data.

**Workaround.** Use the light/dark mode toggle for overall appearance, and the
per-card background and colour controls in the Properties panel for individual
cards. Both are unaffected by this limitation.

**Planned.** A theme editor and full theme application are candidates for a
post-1.0 release. No date is committed here.
