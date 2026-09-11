# F9A — The export honours the captured capability profile (Spec)

**Status:** Draft
**Author:** Claude Sonnet 5 — spec authoring from a locked brief
(`docs/governance/OPERATING_AGREEMENT.md` §3.6: "Sonnet: Spec authoring from
locked briefs"). Seat confirmed against §3.6 and the chain recorded on GitHub
Issue #159 before authoring.
**Reviewer:** OpenAI Codex — exact model named by the owner at commissioning
(`docs/governance/OPERATING_AGREEMENT.md` §3.6, the Sol/Codex seat: "plan and
spec review"). Do not infer a specific model (e.g. "GPT-6 Astra") from the
brief's reviewer without the owner naming it for this artifact.
**Owner gate:** spec approval before any code (ruling ARB-R7 /
`docs/governance/OPERATING_AGREEMENT.md` §1, §3).
**Branch:** `feature/f9a-spec` · **Created:** 2026-09-11
**Classification:** **capability** — the slice touches shared export services
(`src/services/yamlService.ts`, `src/services/yamlConversionService.ts`,
`src/services/cardModTranslator.ts`) and the capability layer under
`src/services/capability/`. Capability-class takes the full chain
(`docs/governance/OPERATING_AGREEMENT.md` §3.7, STRAT-D6). Carried unchanged
from the locked brief's header.
**Parent objective:** board epic **E01 — "the export tells the truth about
what Home Assistant will render"** (`PVTI_lAHOBFbZhs4BgtcWzg53c5g`; story
**S01.1** = GitHub Issue #159). (Brief header, inherited as written.)
**Cheapest acceptable outcome:** the card-mod decision is read from the
captured profile at every export path that sends bytes to Home Assistant or to
a file, the existing warning is shown when card-mod is absent, and a
never-connected user is unaffected. (Owner-adopted 2026-09-08, brief §9.3;
inherited as written and held to.)
**Cost stop-rule:** if the spec, its review, or the implementation reaches a
point where making this work requires changing how the export services are
constructed — a new provider, a module-level global, or threading a parameter
through code that is not on the five call sites' path — work halts and
re-asks. (Owner-adopted 2026-09-08, brief §9.3; inherited as written and held
to.)

**Locked input:** `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`,
locked at `123ccfe` (PR #162, `4dc0423`; owner lock ruling
`drawer_havdm_decisions_f5f8ff6c4e6638d3fcc07c93`). Byte-identical on this
spec's base (`main` = `5173c835e5b8fb9cd9d729facec5ba4ef73cdb2a`,
`git diff --quiet 123ccfe HEAD -- docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`
→ no diff, verified 2026-09-12). The brief is not reopened; every §4 fact this
spec relies on is re-measured below at this base, not inherited.
**Base re-measurement:** `git diff --name-only 691c8d1 HEAD -- src tests | wc -l`
→ `0` (verified 2026-09-12) — no `src/`/`tests/` change between the brief's
measurement commit and this spec's base, so every brief §4 fact and every
additional measurement below applies unchanged to `5173c83`.

---

## 1. Objective

Thread the persisted capability profile into the five production export/deploy
call sites so the card-mod decision is read from what HAVDM actually knows
about the user's Home Assistant instead of being silently assumed present. A
user without the card-mod add-on gets card-mod-only styling stripped from
their exported/deployed dashboard and sees the existing plain-language
warning; a user with card-mod installed is unaffected; a user who has never
connected is unaffected (permissive). The capability object also starts
carrying a layout-card fact, unconsumed, so a single object satisfies
remediation-order item 9 ahead of F9b.

## 2. Background

HAVDM already builds and persists a `CapabilityProfile`
(`src/services/capability/capabilityProfile.ts`) recording whether card-mod is
installed (`cardModPresent`), and already contains a complete strip-and-warn
implementation for card-mod-only styling
(`src/services/cardModTranslator.ts:181-198`). Neither is connected to the
export path: every production call passes no capability option, and the two
`?? true` defaults (`cardModTranslator.ts:108`,
`yamlConversionService.ts:1035`) resolve to "card-mod installed" on every real
export, so the strip-and-warn branch is dead code from every production entry
point (reviewer finding N2, `drawer_havdm_testing_ad358a7d31912bba2419205d`;
remediation-order item 9, `drawer_havdm_decisions_6e8d4788d9513ccce593c378`).
The consequence: a user without card-mod gets a dashboard that renders wrong
on their Home Assistant, and HAVDM says nothing — a truthfulness failure under
E01 and the project's translate-or-honestly-mark vision
(`drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`).

The owner split the original F9 story on 2026-09-07
(`drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`) into **F9a** (this slice —
capability threading) and **F9b** (sections-first view translation under
ruling R3, out of scope here). The brief
(`docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`) was independently
reviewed by OpenAI Codex / GPT-6 Astra over seven rounds and locked by the
owner on 2026-09-10 (`drawer_havdm_decisions_f5f8ff6c4e6638d3fcc07c93`). It
supplies the facts (§4, F1–F10), the decisions already made (§5), the
decisions left to this spec (§6, D-1–D-7), the acceptance bar (§7) and the
red-before-green legs (§8). This spec is written under the F9a/F6/F10
review-loop trial
(`docs/reviews/2026-09-11-review-loop-trial-owner-decision.md`,
`docs/reviews/2026-09-11-review-loop-trial-adoption.md`, adopted 2026-09-11) —
a dated, prospective exception to the standing governance pause
(`drawer_havdm_decisions_89b5f20cc75d3f70a7e0491b`) that changes process depth
only; it introduces no new checker, gate, template or ledger, and does not
reopen the locked brief.

## 3. Finding Coverage

Issue #159's Definition of Done and acceptance-contract process are
process-level (they govern the review/sign-off chain, not spec content) and
are not given rows below; §10 of this document records the process
compliance. Every criterion, ruling and brief decision that this spec's
_content_ must satisfy is mapped here.

| Finding / Ruling / Deliverable                                                                                     | Addressed in section                      | Issue #          | Status                                         |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------- | ---------------------------------------------- |
| #159 criterion 2 — absent-card-mod strips + warns; pre-deploy words agree with emitted bytes                       | §7 D-1, D-3, D-5; §8 AC-1, AC-5; §9 Leg 1 | — until §11 maps | Covered                                        |
| #159 criterion 3 — present preserved; never-connected permissive; persisted profile authoritative after disconnect | §7 D-3; §8 AC-2, AC-3, AC-4; §9 Legs 2–4  | — until §11 maps | Covered                                        |
| #159 criterion 4 — one object for both facts; source/treatment of unknown layout-card                              | §7 D-2, D-4; §8 AC-6–AC-8                 | — until §11 maps | Covered                                        |
| #159 criterion 5 — evidence covers affected production paths and regression                                        | §9 (full)                                 | — until §11 maps | Partial — see §9's scope note on sites 1/3/4/5 |
| brief R1 — never-connected permissive; persisted profile wins after disconnect                                     | §7 D-3; §8 AC-3, AC-4; §9 Leg 4           | — until §11 maps | Covered                                        |
| brief item 9 — one capability object for both facts                                                                | §7 D-2, D-4; §8 AC-6                      | — until §11 maps | Covered                                        |
| brief N2 — strip-and-warn path is dead from production entry points                                                | §7 D-1; §8 AC-1, AC-9                     | — until §11 maps | Covered                                        |
| brief §9.2 option A — carry the layout-card fact, do not consume it                                                | §7 D-2; §8 AC-6–AC-8                      | — until §11 maps | Covered                                        |
| brief §9.3 controlling correction — site 4's words must agree with the bytes                                       | §7 D-5; §8 AC-5                           | — until §11 maps | Covered                                        |
| brief D-6 — the boot window                                                                                        | §7 D-6; §8 AC-13; §9 KNOWN-OPEN leg       | — until §11 maps | Covered                                        |
| brief D-7 — coverage split (unit vs. e2e)                                                                          | §9 (full)                                 | — until §11 maps | Covered                                        |
| F10 — export services stay React-free                                                                              | §7 D-1; §8 AC-10                          | — until §11 maps | Covered                                        |
| Cost stop-rule (brief header)                                                                                      | §7 closing note                           | — until §11 maps | Covered                                        |

## 4. In Scope

- Adding an optional capability-derived parameter to
  `yamlService.sanitizeForHAWithReport`, `sanitizeForHA` and `serializeForHA`,
  threaded down to the existing `cardModAvailable` option on
  `exportDashboard`/`exportCard`/`translateToCardMod`.
- Reading the persisted `CapabilityProfile` (via `useCapabilityProfile()`) at
  each of the five production call sites named in brief §F4 and passing a
  derived capability value into the corresponding `yamlService` call.
- A new pure helper that derives `{ cardModAvailable: boolean }` from a
  `CapabilityProfile`, encoding the "never looked" signal once (D-3).
- Adding a `layoutCardPresent: boolean` field to `CapabilityProfile`, derived
  in `capabilityResolver.ts` from a new `LAYOUT_CARD_FOLDER` constant in
  `resourceElementMap.ts`, carried through `buildCapabilityProfile` and
  `defaultCapabilityProfile` — unconsumed by any production code path (option
  A, brief §9.2).
- Unit and e2e tests proving the above, including the owner's three named
  red-before-green legs (brief §8) plus a fourth control leg for R1
  (persisted-profile-wins-after-disconnect) and a `KNOWN-OPEN:` pin for the
  boot-window limitation (D-6).

## 5. Out of Scope

- **F9b** — sections-first view translation, `custom:grid-layout` emission
  rules keyed on `layoutCardPresent`, lossy-geometry warnings, dead
  `view_layout` sanitisation (ruling R3, finding N6). Story S01.2, its own
  spec.
- Any change to `src/services/capability/cardAvailability.ts`'s
  `resolveCardState` or its `haVersion === null` never-connected signal — the
  palette/`BaseCard` UI resolver is untouched (§7 D-3 explains the deliberate
  divergence rather than a retrofit).
- Any change to how the export services (`yamlService`, `yamlConversionService`,
  `cardModTranslator`) are constructed, instantiated or provided — no new
  provider, no module-level global (the cost stop-rule).
- Any new governance mechanism, checker, gate, template section or ledger (the
  governance pause, brief §10).
- Any write to `ha.home.local` (read-only) or any live-HA capture of a
  real layout-card installation (none exists on the read-only reference
  instance — §7 D-2).
- Consuming `layoutCardPresent` anywhere in production code.

**MUST NOT** (guard rails the reviewer verifies):

- MUST NOT change `cardAvailability.ts`'s existing never-connected signal or
  any of its two UI consumers (`CardPalette.tsx`, `BaseCard.tsx`).
- MUST NOT change the wording, category, or `reason` of the existing
  `card-mod-unavailable` warning (`cardModTranslator.ts:181-198`,
  `exportWarningSummary.ts:51-52`).
- MUST NOT change `ExportCardOptions` or `TranslateCardModOptions`'s existing
  shape — both already declare `cardModAvailable?: boolean`; this slice adds
  no new field there.
- MUST NOT change any view-level export logic (`isLayoutCardViewType`,
  `isLayoutCardGrid`, `viewsLayout.ts`, `layoutCardParser.ts`,
  `ViewSettingsDialog.tsx`) — those are F9b's surface.
- MUST NOT alter the default behaviour of any `yamlService` caller that omits
  the new parameter (backward-compatible signature, AC-9).

## 6. Files to Create / Modify

| Path                                                | Change                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/capability/resourceElementMap.ts`     | Add `LAYOUT_CARD_FOLDER = 'lovelace-layout-card'` constant and a `[LAYOUT_CARD_FOLDER]: []` entry in `RESOURCE_ELEMENT_MAP` (mirroring `CARD_MOD_FOLDER`'s own `[]` entry — presence matters, no card element), `[conventional]`-tagged per the file's own provenance convention (§7 D-2).                                                |
| `src/services/capability/capabilityResolver.ts`     | Add `layoutCardPresent: boolean` to `ResolvedCapability` and derive it in `resolveCapability` as `installedFolders.has(LAYOUT_CARD_FOLDER)`, mirroring `cardModPresent` (`:79`).                                                                                                                                                          |
| `src/services/capability/capabilityProfile.ts`      | Add `layoutCardPresent: boolean` to `CapabilityProfile`; set `false` in `defaultCapabilityProfile()`; carry it through in `buildCapabilityProfile`. Add the new pure helper (§7 D-1/D-3) — proposed name `toExportCapabilityOptions(profile: CapabilityProfile): { cardModAvailable: boolean }`.                                          |
| `src/services/yamlService.ts`                       | Add an optional second parameter to `sanitizeForHAWithReport`, `sanitizeForHA`, `serializeForHA` carrying `{ cardModAvailable?: boolean }`, forwarded into the existing `exportDashboard(sanitized, { warnings, cardModAvailable })` call. No import of React.                                                                            |
| `src/App.tsx`                                       | Import and call `useCapabilityProfile()` (currently only `useRefreshCapabilityProfile()` is imported, `:45`). At each of the four call sites (`:426` `deployReport`, `:748` `handleExportForHA`, `:2481` `handleEnterLivePreview`, `:2580` `handleDeployFromLivePreview`), pass `toExportCapabilityOptions(profile)` as the new argument. |
| `src/components/HADashboardIframe.tsx`              | Import and call `useCapabilityProfile()`; pass `toExportCapabilityOptions(profile)` into the `sanitizeForHA(mergedConfig)` call at `:197`.                                                                                                                                                                                                |
| `tests/unit/capabilityResolver.spec.ts`             | Extend `RESOURCE_ELEMENT_MAP`/`resolveCapability` describe blocks for `layoutCardPresent`.                                                                                                                                                                                                                                                |
| `tests/unit/capabilityProfile.spec.ts`              | Extend `defaultCapabilityProfile`/`buildCapabilityProfile` fixtures for `layoutCardPresent`; add a `toExportCapabilityOptions` describe block.                                                                                                                                                                                            |
| `tests/unit/yaml-service.spec.ts`                   | Extend `sanitizeForHA`/`serializeForHA`/`sanitizeForHAWithReport` describe blocks with the new second-argument legs.                                                                                                                                                                                                                      |
| `tests/support/dsl/capabilityProfile.ts` (new)      | `seedCapabilityProfile(userDataDir, profile)` — writes the persisted `ha-capability-profile` store file before Electron launch (§9).                                                                                                                                                                                                      |
| `tests/e2e/export-capability-profile.spec.ts` (new) | The four e2e legs of §9.                                                                                                                                                                                                                                                                                                                  |

## 7. Design / Contract

### D-1 — The seam: how the capability object reaches the React-free export services

**Decision:** a new pure function in `capabilityProfile.ts` —
`toExportCapabilityOptions(profile: CapabilityProfile): { cardModAvailable: boolean }`
— is the sole seam. Each of the five call sites, all inside React components,
obtains the profile via the existing `useCapabilityProfile()` hook
(`src/contexts/CapabilityProfileContext.tsx:78-80`) and calls this pure
function to produce a plain data object, which is passed as a second argument
into the relevant `yamlService` method. `yamlService.ts`,
`yamlConversionService.ts` and `cardModTranslator.ts` gain **no new import**
and receive only plain data — F10's constraint that the export services stay
React-free is preserved by construction, because `capabilityProfile.ts`
already imports no React (verified:
`grep -ln "from 'react'" src/services/capability/capabilityProfile.ts` →
no match) and the new helper does not change that.

This keeps `yamlService`'s existing `ExportCardOptions`/
`TranslateCardModOptions` shapes untouched (`yamlConversionService.ts:972-986`,
`cardModTranslator.ts:55-63`) — only `yamlService.ts`'s three public methods
gain a new optional parameter that forwards `cardModAvailable` into the
`exportDashboard`/`exportCard` call it already makes. No new provider, no
module-level global, and the only code touched outside the five call sites is
this one pure function and the resolver/profile changes for D-2 — inside the
cost stop-rule.

### D-2 — The layout-card field: name, evidence, and treatment when unknown

**Decision:** add `layoutCardPresent: boolean` to `CapabilityProfile`, derived
in `capabilityResolver.resolveCapability` the same way `cardModPresent` is —
`installedFolders.has(LAYOUT_CARD_FOLDER)` — where
`LAYOUT_CARD_FOLDER = 'lovelace-layout-card'` is a new constant in
`resourceElementMap.ts`, given a `[LAYOUT_CARD_FOLDER]: []` entry in
`RESOURCE_ELEMENT_MAP` itself (empty
array — mirroring `CARD_MOD_FOLDER`'s own entry at `resourceElementMap.ts:72`,
"styling key, provides no card element (presence still matters)"). This is
not strictly required for `layoutCardPresent` to populate — `installedFolders`
is populated generically regardless of map membership (below) — but keeps the
new constant documented in the same place and the same way as every other
provenance-tagged folder in the file, rather than as a floating export the
file's own header comment does not account for.

**Why this folder name, and its evidence status.** `resourceElementMap.ts`
already has an established, disclosed convention for exactly this situation
(`resourceElementMap.ts:16-22`): folder names for cards **not** installed on
the reference instance are recorded `[conventional]` — "the card's usual HACS
repo folder... UNVERIFIED. Correct it if a user's instance reports a
different segment." `CARD_MOD_FOLDER = 'lovelace-card-mod'`
(`resourceElementMap.ts:37`) is itself derived this way for the repository
`thomasloven/lovelace-card-mod`. Layout-card's upstream repository is
`thomasloven/lovelace-layout-card` — same author, same naming convention
(`lovelace-<name>`) — recorded in this project's own documentation
(`docs/archive/releases/RELEASE_NOTES_v0.1.0-alpha.3.md`: "Layout-Card
(HACS): https://github.com/thomasloven/lovelace-layout-card"). `'lovelace-layout-card'`
is therefore the evidenced convention-based guess, tagged `[conventional]`
exactly as the file's own header requires, not a measurement. ⚠ **Applied by
extension, not literally**: the `[conventional]` tag's own wording says "the
card is in HAVDM's registry" — layout-card is not a `custom:*` card in
`cardRegistry.ts` at all, it is a view-level layout engine HAVDM already
models separately (`isLayoutCardViewType`, `isLayoutCardGrid`,
`layoutCardParser.ts`). The evidence status the tag communicates (not
verified on the reference instance; folder guessed from the usual HACS repo
name) applies identically; the tag's literal "card" wording does not, and
this document says so rather than silently stretching an existing category.

**Whether a given capture actually carries this evidence — UNVERIFIED, and
why it cannot be verified today.** `resolveCapability`'s `installedFolders`
set is populated **generically** for any `/hacsfiles/<folder>/` segment
(`capabilityResolver.ts:56-65`), independent of `RESOURCE_ELEMENT_MAP`
membership — so no new map entry is even required for the folder to be
captured, only the resolver's own `.has(LAYOUT_CARD_FOLDER)` check. But no
capture has ever been observed with layout-card actually installed: the
project's own reference-instance census
(`drawer_havdm_testing_d74a5c9655998faabb981188`) records "11 HACS Lovelace
resources: button-card, power-flow-card-plus, apexcharts-card,
better-thermostat-ui-card, lovelace-template-entity-row, lovelace-card-mod,
platinum-weather-card, lovelace-mushroom, Bubble-Card, mini-graph-card,
modern-circular-gauge" and explicitly "⚠ NO layout-card, NO gauge-card-pro, NO
battery-state-card." `ha.home.local` is read-only (brief §10) so this cannot
be corrected by a fresh capture in this slice. **The folder-name guess is
therefore carried forward exactly as unverified as every other
`[conventional]` entry in this file, no more and no less** — this is not a
new category of risk this slice introduces.

**Treatment when the capture cannot answer.** `layoutCardPresent` resolves
`false` whenever the guessed folder segment is absent from
`installedFolders` — indistinguishable from "genuinely not installed." This
has **no production consequence in F9a**, because option A (brief §9.2,
ruled 2026-09-08) requires the fact be carried and nothing consume it until
F9b. It is an explicit, disclosed limitation that **F9b's spec inherits and
must resolve before consuming the field** — either by empirically observing a
real layout-card capture (on a writable instance, `ha-test.home.local`, once
one can be provisioned with layout-card installed) or by another evidenced
means. This document and the `[conventional]` tag on the new constant are the
disclosure; there is nothing for a test to assert differently on today's
code, because the resolver's `.has()` check behaves identically whether the
guessed folder name is eventually right or wrong — the open question is
about the real world, not about this function's logic, so it is recorded here
and left for F9b to close with a real capture, not pinned as a `KNOWN-OPEN:`
test in this slice (contrast D-6 in §9, which pins a genuine current-behaviour
boundary).

`defaultCapabilityProfile()` sets `layoutCardPresent: false` — permissive
default, consistent with `cardModPresent: false` there.

### D-3 — The never-connected signal the export uses

**Decision:** the export's derivation (`toExportCapabilityOptions`, D-1) uses
`profile.capturedAt === null` as "we have never looked," **not**
`profile.haVersion === null`, which is the signal the existing UI resolver
uses (`cardAvailability.ts:40`). When `capturedAt === null`,
`cardModAvailable` resolves `true` (permissive); otherwise it resolves
`profile.cardModPresent` verbatim.

**Why this diverges from the UI's signal, with evidence (brief F8).**
`capturedAt` is set **exactly once**, from `meta.capturedAt`, at the single
production call site of `buildCapabilityProfile`
(`main.ts:600-604`, inside the `capability:capture` IPC handler,
`main.ts:588-606`) — `capturedAt: new Date().toISOString()` is always a
non-null string there. `capturedAt === null` therefore occurs **only** in
`defaultCapabilityProfile()` — a mechanically decidable, single-call-site
fact (`grep -rn "buildCapabilityProfile(" src --include=*.ts` → one
declaration, one call). `haVersion`, by contrast, is set from the `auth_ok`
frame (`haWebSocketService.ts:154-158`): `this.haVersion = typeof
message.ha_version === 'string' ? message.ha_version : null;` — so a
**genuine, successful capture** can still leave `haVersion === null` if that
frame carries no string `ha_version` field. Using `haVersion === null` for
the export would re-create exactly the class of failure F6 names (treating "a
real result of `false`/absent" the same as "we have never looked") for a user
who has, in fact, connected and been captured: their real `cardModPresent`
value would be silently overridden to permissive. `capturedAt` has no such
failure mode, because it is set unconditionally by the one call site that
ever calls `buildCapabilityProfile`, never from a value HA itself supplies.

**Disconnect (R1).** `handleDisconnect` (`App.tsx:2232-2239`) calls
`clearHAConnection`, `haConnectionService.disconnect()` and `haWsClose()` —
it does not touch `capabilityProfileService` or the persisted profile at all
(verified: `grep -n "capabilityProfileService\|capability:" src/App.tsx`
inside `handleDisconnect`'s body returns nothing). So after a disconnect,
`capturedAt` and `cardModPresent` are exactly as they were at the last
capture — the persisted profile is authoritative by construction, satisfying
R1 without any disconnect-specific code in this slice.

**The divergence is deliberate and scoped.** `cardAvailability.ts`'s
`resolveCardState` (the palette/`BaseCard` UI signal) is unchanged — it is
out of scope (§5) and this spec makes no claim that it should also switch to
`capturedAt`. The two signals agree in the true never-connected case (both
`null` in `defaultCapabilityProfile()`) and diverge only in the F8 edge case,
where `capturedAt` is the more correct choice for a component (the export)
whose whole job is to reflect what was actually captured.

### D-4 — The shape of the object crossing the seam

**Decision:** the seam function (D-1) returns the narrow derived shape
`{ cardModAvailable: boolean }`, not the whole `CapabilityProfile`. Item 9's
"ONE capability object for both facts" is satisfied at the **storage** layer —
`CapabilityProfile` carries both `cardModPresent` and `layoutCardPresent` on
the same object (D-2) — not at the seam, which the brief explicitly leaves
free (§6 D-4: "subject to item 9's 'one object for both'"). Since F9a does
not consume `layoutCardPresent` anywhere (option A), the export services have
no present use for it; passing it across the seam today would be dead
parameter-threading with no consumer, which the cost stop-rule's spirit
(don't thread parameters beyond what is used) counsels against. F9b's spec is
free to widen the seam's return shape when it adds a real consumer.

### D-5 — Site 4's treatment: keeping words and bytes consistent

**Decision:** `handleDeployFromLivePreview` (`App.tsx:2533`, the warning
computation at `:2580`) calls `toExportCapabilityOptions(profile)` with the
**same** `profile` value obtained from the **same** `useCapabilityProfile()`
call already read at the top of `App` for sites 1/3 — not a fresh read, not a
different derivation.

**Why this is sufficient to guarantee agreement, not merely likely.**
`CapabilityProfileContext`'s `profile` state
(`CapabilityProfileContext.tsx:48-71`) changes **only** via its `refresh()`
callback, which is called from exactly one place in the whole codebase today
(`App.tsx`'s `useRefreshCapabilityProfile()` usage after a capture,
`App.tsx:340` and its call site — `captureCapabilityProfile`). Nothing in the
live-preview flow (`handleEnterLivePreview` at `App.tsx:2461`, the drag
handler in `HADashboardIframe.tsx:175-200`, or `handleDeployFromLivePreview`
itself) calls `refresh()`. So within one live-preview session, the `profile`
value React hands back from `useCapabilityProfile()` is referentially the
same object across every render between the temp-dashboard write (sites 3/5)
and the deploy confirmation (site 4) — there is no window in which they could
observe different capability data. This is the architectural guarantee the
brief's §9.3 controlling correction requires: "the warning shown before a
deploy must agree with what was actually stripped" holds by construction, not
by coincidence.

### D-6 — The boot window

**Decision:** no special handling is added. An export/deploy action invoked
before `CapabilityProfileContext`'s async mount-effect resolves
(`CapabilityProfileContext.tsx:62-64`) reads `profile` at its
React-state-seeded value, `defaultCapabilityProfile()` — permissive — exactly
as every other consumer of this context does today.

**Why this is an accepted, not a silently-assumed, limitation.** The
identical race already exists for `CardPalette` and `BaseCard`'s availability
marking, built and shipped in F4 (#129) without a guard — a precedent the
project has already accepted for this exact context. The window is bounded by
a single IPC round-trip at process start (`capability:getProfile`,
`main.ts:614-616`); reaching it requires a user to load a dashboard and
invoke an export/deploy action within that window, which is not a realistic
organic sequence (loading a dashboard is itself an action that takes longer
than one IPC round-trip). Adding a guard (e.g., disabling export/deploy menu
items until the profile loads) would touch UI code outside the five call
sites' own bodies, in tension with the cost stop-rule's "not on the five call
sites' path." This is pinned with a `KNOWN-OPEN:` test (§9) rather than left
undocumented, per the project's own practice for a boundary written in prose
that nobody re-reads.

### D-7 — Coverage split

See §9 in full. Summary: the mechanism (resolver/profile fields, the seam
function, `yamlService`'s new parameter) is unit-tested exhaustively. The
owner's three named legs plus a fourth R1 control leg are e2e, seeded via a
new persisted-store-seeding helper, run against the cheapest production call
site that needs no live/test HA connection (`handleExportForHA`, site 2). The
remaining four call sites (1, 3, 4, 5 — deploy dialog and live preview) are
not given a new e2e leg in this slice; §9 states the reasoning and the
residual risk explicitly rather than leaving it unstated.

---

**Cost stop-rule check.** This design adds one new pure function, one new
optional parameter on three existing `yamlService` methods (each already
accepting an options-shaped argument in spirit — `sanitizeForHA`/
`serializeForHA` did not, `sanitizeForHAWithReport` already threads `options`
internally to `exportDashboard`), one new field on an existing type derived by
one new line in an existing resolver function, and one new hook call at each
of the five call sites. No new provider, no module-level global, no
parameter threaded through code outside the five call sites' own bodies. The
stop-rule is not tripped.

## 8. Acceptance Criteria

1. When `useCapabilityProfile()` resolves a profile with `capturedAt !== null`
   and `cardModPresent === false`, every byte-producing call site
   (`App.tsx:426` `deployReport`, `:748` `handleExportForHA`, `:2481`
   `handleEnterLivePreview`, `HADashboardIframe.tsx:197`) strips
   TRANSLATE-class card-mod keys from every card carrying them and records the
   existing `card-mod-unavailable` warning (`cardModTranslator.ts:181-198`,
   `exportWarningSummary.ts:51-52`), unchanged in wording.
2. With the same profile shape but `cardModPresent === true`, the same call
   sites preserve TRANSLATE-class styling as a `card_mod` block exactly as
   `cardModTranslator.ts:200-243` already produces it — no behaviour change
   from today.
3. With `profile.capturedAt === null` (never captured), every call site
   behaves exactly as today: styling preserved, no warning — permissive.
4. After a disconnect following a real capture, export/deploy continues to
   use the persisted profile's last-captured `cardModPresent` value; a
   disconnect alone never resets it to permissive (R1).
5. `handleDeployFromLivePreview`'s pre-deploy warning summary
   (`App.tsx:2580`) is derived from the same capability value as the
   temp-dashboard bytes most recently written by sites 3/5 in the same
   live-preview session, so "Nothing had to be adjusted for Home Assistant"
   is never shown over content that was, in fact, adjusted.
6. `CapabilityProfile` carries a `layoutCardPresent: boolean` field;
   `defaultCapabilityProfile()` sets it `false`; `buildCapabilityProfile`
   derives it from `ResolvedCapability.layoutCardPresent`.
7. `capabilityResolver.resolveCapability` derives `layoutCardPresent` as
   `installedFolders.has(LAYOUT_CARD_FOLDER)`, where
   `LAYOUT_CARD_FOLDER = 'lovelace-layout-card'` is declared in
   `resourceElementMap.ts`.
8. No production code path reads `layoutCardPresent`: every match of
   `grep -rn "layoutCardPresent" src` is confined to
   `src/services/capability/capabilityProfile.ts` (the field declaration, its
   `false` default, and its pass-through in `buildCapabilityProfile`) and
   `src/services/capability/capabilityResolver.ts` (the `ResolvedCapability`
   field and its derivation) — never in `App.tsx`, `HADashboardIframe.tsx`,
   `yamlService.ts`, `yamlConversionService.ts`, `cardModTranslator.ts`, or
   inside any `if`, ternary, or call argument anywhere in `src/`.
9. `yamlService.sanitizeForHAWithReport`, `.sanitizeForHA` and
   `.serializeForHA` accept a new optional second parameter shaped
   `{ cardModAvailable?: boolean }`; every existing call that omits it keeps
   today's `?? true` behaviour exactly (no default changes).
10. `src/services/yamlService.ts`, `src/services/yamlConversionService.ts`
    and `src/services/cardModTranslator.ts` import no React after this
    change: `grep -ln "from 'react'" <the three files>` returns nothing (F10
    preserved).
11. A pure function
    `toExportCapabilityOptions(profile: CapabilityProfile): { cardModAvailable: boolean }`
    in `capabilityProfile.ts` returns `{ cardModAvailable: true }` when
    `profile.capturedAt === null`, and
    `{ cardModAvailable: profile.cardModPresent }` otherwise.
12. `cardAvailability.ts`'s `resolveCardState` and its `haVersion === null`
    never-connected check are byte-unchanged by this slice
    (`git diff --stat -- src/services/capability/cardAvailability.ts` on the
    implementation branch returns nothing).
13. An export/deploy action performed before
    `CapabilityProfileContext`'s async mount-effect resolves uses
    `defaultCapabilityProfile()` (permissive) — the existing, accepted
    boot-window behaviour, pinned by a `KNOWN-OPEN:` test rather than left
    undocumented.
14. Every existing test in `tests/unit/yaml-service.spec.ts`,
    `tests/unit/yaml-conversion-service.spec.ts`,
    `tests/unit/capabilityProfile.spec.ts`,
    `tests/unit/capabilityResolver.spec.ts` and
    `tests/unit/DeployDialog.spec.tsx` still passes; the literal object
    fixtures in `capabilityProfile.spec.ts` that assert full-object equality
    (`defaultCapabilityProfile`, `buildCapabilityProfile`) are updated to
    include `layoutCardPresent` as a mechanical fixture change, not a
    behaviour change.

## 9. Test Plan

### Unit

- **`tests/unit/capabilityResolver.spec.ts`** — extend the
  `RESOURCE_ELEMENT_MAP` describe block with a case mirroring
  `'maps card-mod to no card element (it is a styling key)'` (`:88`) for
  `LAYOUT_CARD_FOLDER` — maps to no card element either; extend
  `resolveCapability` with cases mirroring the existing card-mod cases
  (`:127-129`): `layoutCardPresent` `true` when a resource URL's folder
  segment is `lovelace-layout-card`, `false` for `[]` and for resources
  containing neither `lovelace-card-mod` nor `lovelace-layout-card`. Proves
  AC-7.
- **`tests/unit/capabilityProfile.spec.ts`** — update the
  `defaultCapabilityProfile` and `buildCapabilityProfile` `toEqual` fixtures
  to include `layoutCardPresent` (AC-6, AC-14). Add a new
  `toExportCapabilityOptions` describe block: never-captured (default) →
  `{ cardModAvailable: true }`; captured, `cardModPresent: false` →
  `{ cardModAvailable: false }`; captured, `cardModPresent: true` →
  `{ cardModAvailable: true }`; captured with `haVersion: null` (the F8 edge
  case and the disconnected-after-capture case) but `capturedAt` set →
  `cardModAvailable` follows `cardModPresent`, not `haVersion`. Proves AC-11
  and the D-3 divergence directly.
- **`tests/unit/yaml-service.spec.ts`** — extend `sanitizeForHA`,
  `serializeForHA` and add a `sanitizeForHAWithReport` case: a card carrying
  `style`/`card_margin` with `{ cardModAvailable: false }` passed as the new
  second argument strips the keys and the returned `warnings` contains the
  `card-mod-unavailable` reason (mirroring the existing pattern at
  `yaml-conversion-service.spec.ts:878-904` but through the higher-level
  entry point); the same input with the parameter **omitted** keeps today's
  default (`card_mod` emitted, no warning) — proves AC-9's backward
  compatibility explicitly, not by absence of a failing test.
- No change needed to `tests/unit/yaml-conversion-service.spec.ts` —
  `ExportCardOptions`/`TranslateCardModOptions` are unchanged (§5 MUST NOT),
  so its existing card-mod-translate coverage (`:878-958`) continues to prove
  the mechanism unmodified.

### e2e (headless — `bash tools/test-headless.sh tests/e2e/export-capability-profile.spec.ts --project=electron-e2e --workers=1`, per the project's standing EVERYTHING-HEADLESS rule)

A new support helper, `tests/support/dsl/capabilityProfile.ts` →
`seedCapabilityProfile(userDataDir, profile)`, writes
`{ profile }` (matching `capabilityProfileService.ts`'s `CapabilityProfileStore`
shape) to the persisted store file inside the test's isolated `userDataDir`
**before** Electron launches, so the app boots with a chosen profile already
on disk — the mechanism brief §F9 names as available (`capabilityProfileService.ts:29-35`,
`main.ts:614-616`, `CapabilityProfileContext.tsx:62-64`). The on-disk filename
`electron-store` uses for a store named `ha-capability-profile` with no `cwd`
override must be confirmed by observation (launch the app once, seed nothing,
inspect `userDataDir`) before the helper is written — the brief flags this as
unconfirmed and this spec does not assume it.

All four legs use a dashboard containing one card carrying `style: 'color:
red;'` (a TRANSLATE-class key) and drive `File > Export for HA`
(`handleExportForHA`, `App.tsx:748`) — the only byte-producing call site that
needs no live or test Home Assistant connection, since it writes a local
file.

1. **Leg 1 (RED-BEFORE-GREEN).** Seed
   `{ capturedAt: '<iso>', haVersion: '<v>', cardModPresent: false }`.
   Export. Assert the saved YAML's card has no `style` key and no `card_mod`
   block, and the file's leading comment contains "had custom styling
   removed because the card-mod add-on isn't installed." **Proven RED on
   base** via `git stash push -u src/` before the implementation lands (the
   established technique, `drawer_havdm_testing_cd71883212b81299c3bbef76`):
   on base, `App.tsx` calls `serializeForHA(config)` with no second argument
   and the `?? true` default resolves `cardModAvailable: true`, so the
   styling is preserved and no warning comment appears — the assertions
   above fail. This is the brief's named red leg (§8, leg 1) and proves
   AC-1, AC-9.
2. **Leg 2 (CONTROL — must stay green throughout).** Seed the same shape with
   `cardModPresent: true`. Assert the card_mod block IS emitted (styling
   preserved) and no warning comment appears. Confirmed passing on base
   (today's default already produces this outcome) and re-confirmed passing
   after the fix, per the brief's instruction not to try to make a control
   leg fail. Proves AC-2.
3. **Leg 3 (CONTROL — never-connected).** No profile file seeded at all
   (the app boots with `defaultCapabilityProfile()`). Same assertions as Leg 2. Confirmed passing before and after. Proves AC-3.
4. **Leg 4 (RED-BEFORE-GREEN — R1, persisted profile wins after disconnect).**
   Seed `{ capturedAt: '<iso>', haVersion: null, cardModPresent: false }` —
   the on-disk shape a real disconnect-after-capture leaves, since
   `handleDisconnect` never touches the persisted profile (D-3). Same
   assertions as Leg 1 (strip + warn). This is not a live disconnect action —
   it directly seeds the persisted state disconnect actually produces, which
   is the faithful way to test it without requiring a live/test HA
   round-trip. **Red on base for the identical reason as Leg 1** — on base
   nothing reads the profile at all, so `haVersion: null` makes no difference
   to today's `?? true` default. Its value beyond Leg 1 is as a
   **discriminator** (`drawer_havdm_testing_cd71883212b81299c3bbef76`,
   discriminator lesson (a)): a plausible but wrong implementation of D-3 that
   used `profile.haVersion === null` instead of `profile.capturedAt === null`
   as the never-looked signal would treat this exact state as never-connected
   and stay permissive — passing Leg 3's assertions instead of Leg 1's on a
   state that is actually "disconnected after a real capture," not
   "never connected." Leg 4 is the leg that tells the two implementations
   apart. Proves AC-4 and D-3's `capturedAt`-based derivation together.
5. **KNOWN-OPEN leg (D-6, boot window).** A focused unit-level test (not
   e2e — the race is at React-context-seed time, not IPC-timing-dependent in
   a way e2e can control deterministically) renders a component consuming
   `useCapabilityProfile()` **before** the provider's effect has resolved
   (i.e., synchronously, in the same tick as mount, before `await` yields)
   and asserts it observes `defaultCapabilityProfile()` — pinning today's
   accepted permissive-during-boot behaviour per
   `drawer_practice_claims_588b2f2df00141d8f19f9433`'s guidance ("pin a
   KNOWN-OPEN limitation with a test that asserts the CURRENT, passing
   behaviour"). Proves AC-13.

**Scope note — sites 1, 3, 4, 5 (deploy dialog and live preview) get no new
e2e leg in this slice.** `tests/e2e/live-preview-deploy.spec.ts` today
contains only `TODO`-commented placeholders (verified:
`grep -n "TODO" tests/e2e/live-preview-deploy.spec.ts` → 12 lines, no
executable body) — there is no existing live-preview e2e harness to extend,
and building one (live/test-HA temp-dashboard round-trips, or a WS mock) is
materially larger new test infrastructure than this slice's wiring change.
All four sites call the identical, already unit-proven `yamlService` entry
points via the identical `toExportCapabilityOptions` helper (D-1), and D-5
gives an architectural (not merely tested) guarantee that site 4 agrees with
sites 3/5. Each of the four call-site edits is a one-line, directly-reviewable
diff. This is a considered proportionality call, not a silent gap: **the
implementation's independent review (Codex, then Opus per the chain) is
asked to re-derive, by reading `path:line`, that each of the four sites
passes `toExportCapabilityOptions(profile)` with the profile from the same
`useCapabilityProfile()` call** — recorded here as a required review-time
check rather than an automated one, consistent with `OPERATING_AGREEMENT.md`
§3.5's re-run obligations. If the reviewer or the owner judges this
insufficient against #159 criterion 5's "affected production paths," that is
a legitimate disagreement this spec surfaces rather than forecloses — see the
process note in §10.

## 10. Open Questions

None block implementation. One proportionality judgement from §9 is
recorded here for visibility rather than as a blocking question, per the
process's routing rule that a design question this spec can settle with
evidence is settled, not deferred: **whether the e2e scope-note in §9
(sites 1/3/4/5 get review-time verification instead of a new e2e harness) is
the right balance against #159 criterion 5.** This spec's recommendation is
the one given in §9; the reviewer's critique (per
`drawer_havdm_decisions_7f4bc8b0658b617f17aa8b45`, "the reviewer's critique
comes before the owner's choice, not alongside it") should reach the owner
before this is treated as settled.

## 11. Revision History & Amendments

| Date       | Rev | Change | By              |
| ---------- | --- | ------ | --------------- |
| 2026-09-12 | 0   | Draft  | Claude Sonnet 5 |
