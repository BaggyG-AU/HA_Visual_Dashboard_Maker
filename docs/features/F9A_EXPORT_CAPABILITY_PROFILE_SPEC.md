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

| Finding / Ruling / Deliverable                                                                                     | Addressed in section                                                          | Issue # | Status  |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------- | ------- |
| #159 criterion 2 — absent-card-mod strips + warns; pre-deploy words agree with emitted bytes                       | §7 D-1, D-3, D-5; §8 AC-1, AC-5; §9 Legs 1, 7, 9                              | #159    | Covered |
| #159 criterion 3 — present preserved; never-connected permissive; persisted profile authoritative after disconnect | §7 D-3; §8 AC-2, AC-3, AC-4; §9 Legs 2, 3, 4, 5, 8, 10                        | #159    | Covered |
| #159 criterion 4 — one object for both facts; source/treatment of unknown layout-card                              | §7 D-2, D-4; §8 AC-6–AC-8                                                     | #159    | Covered |
| #159 criterion 5 — evidence covers affected production paths and regression                                        | §9 (full)                                                                     | #159    | Covered |
| brief R1 — never-connected permissive; persisted profile wins after disconnect                                     | §7 D-3; §8 AC-4; §9 Legs 4, 5                                                 | #159    | Covered |
| brief item 9 — one capability object for both facts                                                                | §7 D-2, D-4; §8 AC-6                                                          | #159    | Covered |
| brief N2 — strip-and-warn path is dead from production entry points                                                | §7 D-1; §8 AC-1, AC-9                                                         | #159    | Covered |
| brief §9.2 option A — carry the layout-card fact, do not consume it                                                | §7 D-2; §8 AC-6–AC-8                                                          | #159    | Covered |
| brief §9.3 controlling correction — site 4's words must agree with the bytes                                       | §7 D-5; §8 AC-5; §9 Legs 9, 10                                                | #159    | Covered |
| brief D-6 — the boot window                                                                                        | §7 D-6; §8 AC-13; §9 Leg 6 (KNOWN-OPEN)                                       | #159    | Covered |
| brief D-7 — coverage split (unit vs. e2e)                                                                          | §9 (full)                                                                     | #159    | Covered |
| F10 — export services stay React-free                                                                              | §7 D-1; §8 AC-10                                                              | #159    | Covered |
| Cost stop-rule (brief header)                                                                                      | §7 closing note                                                               | #159    | Covered |
| Codex spec review, `docs/reviews/f9a-spec-codex-review.md`, P1–P7 (owner ruling: fix all seven now)                | §7 D-2a, D-5, D-5a; §8 AC-1, AC-2, AC-4, AC-5, AC-13, AC-15, AC-16; §9 (full) | #159    | Covered |

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

| Path                                                | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/capability/resourceElementMap.ts`     | Add `LAYOUT_CARD_FOLDER = 'lovelace-layout-card'` constant and a `[LAYOUT_CARD_FOLDER]: []` entry in `RESOURCE_ELEMENT_MAP` (mirroring `CARD_MOD_FOLDER`'s own `[]` entry — presence matters, no card element), `[conventional]`-tagged per the file's own provenance convention (§7 D-2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `src/services/capability/capabilityResolver.ts`     | Add `layoutCardPresent: boolean` to `ResolvedCapability` and derive it in `resolveCapability` as `installedFolders.has(LAYOUT_CARD_FOLDER)`, mirroring `cardModPresent` (`:79`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/services/capability/capabilityProfile.ts`      | Add `layoutCardPresent: boolean` to `CapabilityProfile`; set `false` in `defaultCapabilityProfile()`; carry it through in `buildCapabilityProfile`. Add the new pure helper (§7 D-1/D-3) — proposed name `toExportCapabilityOptions(profile: CapabilityProfile): { cardModAvailable: boolean }`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/services/capabilityProfileService.ts`          | **(P3 repair, §7 D-2a)** `getProfile()` normalizes the stored object against the default on read: `{ ...defaultCapabilityProfile(), ...this.store.get('profile', defaultCapabilityProfile()) }`, so a profile persisted before `layoutCardPresent` existed gets the field's permissive default instead of `undefined`; every already-captured field (`capturedAt`, `haVersion`, `cardModPresent`, `overrides`) is preserved verbatim.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `src/hooks/useDeployReport.ts` (new)                | **(P5 repair, §7 D-5a)** Extracts the ordinary-DeployDialog report computation into a testable hook: `useDeployReport(deployDialogVisible: boolean, config: DashboardConfig \| null, profile: CapabilityProfile)`, wrapping `useMemo(() => (deployDialogVisible && config ? yamlService.sanitizeForHAWithReport(config, toExportCapabilityOptions(profile)) : null), [deployDialogVisible, config, profile.cardModPresent, profile.capturedAt])`.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/services/yamlService.ts`                       | Add an optional second parameter to `sanitizeForHAWithReport`, `sanitizeForHA`, `serializeForHA` carrying `{ cardModAvailable?: boolean }`, forwarded into the existing `exportDashboard(sanitized, { warnings, cardModAvailable })` call. No import of React.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `src/App.tsx`                                       | Import and call `useCapabilityProfile()` (currently only `useRefreshCapabilityProfile()` is imported, `:45`). Replace the inline `deployReport` `useMemo` at `:425-428` with a call to `useDeployReport(deployDialogVisible, config, profile)` (P5 repair). At `:748` `handleExportForHA` and `:2481` `handleEnterLivePreview`, pass `toExportCapabilityOptions(profile)` as the new argument. At `:2580` `handleDeployFromLivePreview` (site 4, **P2 repair, §7 D-5a**), re-derive `toExportCapabilityOptions(profile)` and re-run `sanitizeForHAWithReport(config, options)` at confirm-click time, `await window.electronAPI.haWsUpdateTempDashboard(tempDashboardPath, { ...sanitized, title })` to bring the temp dashboard current, and compute the confirmation warning from that same call's `warnings` — never from a value read or derived earlier in the session. |
| `src/components/HADashboardIframe.tsx`              | Import and call `useCapabilityProfile()`; pass `toExportCapabilityOptions(profile)` into the `sanitizeForHA(mergedConfig)` call at `:197`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tests/unit/capabilityResolver.spec.ts`             | Extend `RESOURCE_ELEMENT_MAP`/`resolveCapability` describe blocks for `layoutCardPresent`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tests/unit/capabilityProfile.spec.ts`              | Extend `defaultCapabilityProfile`/`buildCapabilityProfile` fixtures for `layoutCardPresent`; add a `toExportCapabilityOptions` describe block.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/unit/capabilityProfileService.spec.ts` (new) | **(P3 repair)** Proves `getProfile()` normalization: a stored profile object missing `layoutCardPresent` reads back with `layoutCardPresent: false` and every other stored field unchanged; a stored profile already carrying the field is untouched; a never-written store still returns the full default.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/unit/useDeployReport.spec.ts` (new)          | **(P5 repair)** Using `@testing-library/react`'s `renderHook`, proves the hook recomputes when `profile.cardModPresent` changes with `config`/`deployDialogVisible` held constant (red on the pre-repair inline-memo dependency array, which lacks `profile`), and does not recompute on an unrelated re-render with all three inputs unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tests/unit/yaml-service.spec.ts`                   | Extend `sanitizeForHA`/`serializeForHA`/`sanitizeForHAWithReport` describe blocks with the new second-argument legs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tests/support/dsl/capabilityProfile.ts` (new)      | `seedCapabilityProfile(userDataDir, profile)` — writes the persisted `ha-capability-profile` store file before Electron launch (§9).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tests/e2e/export-capability-profile.spec.ts` (new) | Legs 1–5 of §9 (site 2, `handleExportForHA`), including Leg 5 (P4 repair, an actual disconnect action). Leg 6 (KNOWN-OPEN, D-6) is unit-level, not e2e — see §9.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tests/e2e/live-preview-deploy.spec.ts`             | **(P1 repair)** Extend `stubLivePreviewIpc` to record the `config` argument each stubbed IPC channel receives (currently discarded); add Legs 7–10 (§9) covering sites 3 and 4 using the existing offline harness. Site 5's wiring is a required review-time check (§9), not a new e2e leg — see §9's note on why.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

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

### D-2a — Legacy stored profiles that predate a field (repair for review Ref P3, `docs/reviews/f9a-spec-codex-review.md`, confirmed 2026-09-13)

**Decision:** `capabilityProfileService.getProfile()` normalizes the stored
object against `defaultCapabilityProfile()` before returning it:
`{ ...defaultCapabilityProfile(), ...this.store.get('profile', defaultCapabilityProfile()) }`.

**Why this is needed, with evidence.** `electron-store` delegates to `conf`,
whose `#initializeStore` merges the file's stored object over the constructor
`defaults` with a single, **top-level, shallow** `Object.assign`
(`conf/dist/source/index.js:591`:
`Object.assign(createPlainObject(), options.defaults ?? {}, fileStore)`).
Because this service's store has exactly one top-level key, `profile`, that
assign either takes the WHOLE default `profile` object (nothing on disk yet)
or the WHOLE stored `profile` object (anything on disk at all) — it does not
merge fields **inside** `profile`. A profile persisted before this slice
therefore comes back with `layoutCardPresent === undefined`, not `false`.
Independently confirmed 2026-09-13: constructing a `Conf` store with a
pre-existing `profile` lacking the field, and a default profile that has it,
returns `{ existingHasField: false, valueType: 'undefined' }`; a fresh store
with the same default returns `{ freshHasField: true, value: false }` — the
exact reproduction in the review's "Reproduction details".

**Why the read boundary, not the write boundary.** Normalizing on **read**
(`getProfile()`) rather than migrating the file on write means every existing
caller — `saveProfile`, `setOverride`, `clearProfile`, and the `capability:*`
IPC handlers in `main.ts` that call `getProfile()` — sees a complete object
with no additional code, and a user who never captures again still gets the
field the moment they next read it. `capturedAt`, `haVersion`,
`cardModPresent` and any `overrides` already on disk are preserved verbatim
by the spread order (`defaultCapabilityProfile()` first, stored object
second) — this is not a reset, it only fills what was never there.

**Must not change:** do not reset a captured profile's `capturedAt`,
`haVersion`, `cardModPresent` or `overrides` to their defaults; do not add a
migration step, a schema version field, or any new persistence mechanism —
this is a one-line change to an existing read method.

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

### D-5 — Site 4's treatment: keeping words and bytes consistent (revised — repair for review Ref P2, `docs/reviews/f9a-spec-codex-review.md`, confirmed 2026-09-13)

**This decision's original text (below the line) is disproven and withdrawn,
not merely amended — the reasoning is kept, struck through in spirit, so the
withdrawal is legible rather than silently rewritten.** ⚠ The claim that
nothing in the live-preview flow calls `refresh()` is true taken literally,
but incomplete: a capture started **earlier**, at the connect that preceded
entering live preview, can still be in flight when preview starts and can
resolve — calling `refresh()` — **after** the temp-dashboard write (site 3)
but **before** the deploy confirmation (site 4). Independently reproduced
2026-09-13 with the review's controlled-interleaving probe against the actual
`handleConnect`/`captureCapabilityProfile`/`handleEnterLivePreview` bodies:
observed order `connected=true → capture pending → temp bytes written →
preview active=true → profile refreshed` — the temp dashboard write completes
**before** the capture that started at connect resolves. A user who connects
and enters live preview quickly enough sees exactly this window; the
`profile` reference is therefore **not** guaranteed stable across the
session, and the original "by construction, not by coincidence" claim does
not hold.

**Revised decision:** site 4 (`handleDeployFromLivePreview`, `App.tsx:2533`,
the warning computation currently at `:2580`) does not read a capability
value derived earlier in the session. At the moment the user clicks "Deploy
to Production", it:

1. Reads the **current** `profile` via `useCapabilityProfile()` and derives
   `toExportCapabilityOptions(profile)` **at that instant**.
2. Calls `sanitizeForHAWithReport(config, options)` with that derivation,
   obtaining `{ config: sanitized, warnings }` in the **same call**.
3. Sends `sanitized` to `window.electronAPI.haWsUpdateTempDashboard(tempDashboardPath, { ...sanitized, title })`
   — the same IPC channel site 5 already uses — bringing the temp dashboard
   current with whatever HAVDM knows **right now**, before showing the
   confirmation.
4. Computes the confirmation summary (`summarizeExportWarnings`) from that
   same call's `warnings`, and only then shows the confirm dialog.

**Why this restores the guarantee honestly.** The words and the bytes are
now produced by one function call at one instant, immediately before the
user sees them — there is no earlier-derived value for a background refresh
to invalidate, because nothing is cached or read ahead of time. This also
resolves the P2/D-5 "no window" claim without freezing anything: a genuinely
newer, more authoritative capture that completed **before** the click is
picked up (nothing is discarded), and the temp dashboard is left in a state
that actually matches what the user is told. The one-line-edit cost estimate
in the original file table for site 4 changes accordingly (§6): site 4 now
also performs the write step site 5 already performs, using code already
present.

**Must not change:** no new provider/global, and no parameter threaded
through code outside site 4's own handler body; the re-send targets the
existing `ha:ws:updateTempDashboard` channel already used by site 5, not a
new one; the confirm dialog's existing copy/testids (`live-preview-deploy-confirm`,
`live-preview-deploy-summary`) are unchanged.

**Original text, superseded above:** ~~`handleDeployFromLivePreview` calls
`toExportCapabilityOptions(profile)` with the same `profile` value obtained
from the same `useCapabilityProfile()` call already read at the top of `App`
for sites 1/3 — not a fresh read, not a different derivation. Because
`CapabilityProfileContext`'s `profile` state changes only via its `refresh()`
callback, and nothing in the live-preview flow itself calls `refresh()`, the
profile reference is stable across one live-preview session, so words and
bytes agree by construction.~~

### D-5a — Site 1's memo must track the profile too (repair for review Ref P5, `docs/reviews/f9a-spec-codex-review.md`, confirmed 2026-09-13)

**Decision:** the ordinary (non-live-preview) deploy path's report — today an
inline `useMemo` at `App.tsx:425-428`, `() => (deployDialogVisible && config ?
yamlService.sanitizeForHAWithReport(config) : null)`, dependencies
`[deployDialogVisible, config]` — is extracted into a hook,
`useDeployReport(deployDialogVisible, config, profile)` (`src/hooks/useDeployReport.ts`,
new file), whose dependency array is `[deployDialogVisible, config,
profile.cardModPresent, profile.capturedAt]`. `App.tsx:425` calls this hook
in place of the inline memo. Every other caller of `deployReport` is
unaffected — the hook returns the identical shape.

**Why the current memo is wrong, with evidence.** `App.tsx:425-428`'s
dependency array does not include `profile` or anything derived from it.
Confirmed by direct read 2026-09-13: the array is exactly
`[deployDialogVisible, config]`. A background capability capture
(`captureCapabilityProfile`, fired from `handleConnect`) can complete and
call `refreshCapabilityProfile()` while the ordinary Deploy dialog is already
open (`deployDialogVisible === true`) and `config` is unchanged — under
React's memoization contract this does **not** recompute `deployReport`, so
the dialog can go on showing a payload and warning derived from the
capability value that was current when the dialog opened, not the value now
current. Depending on `profile.cardModPresent`/`profile.capturedAt` (not the
whole `profile` object, whose reference already changes on every `refresh()`
regardless of whether the two fields the export actually reads changed) makes
the recomputation exact rather than over-eager.

**Why a hook, not just a wider dependency array inline.** The bug is
invisible without exercising React's own memoization, and `App.tsx`'s inline
memo cannot be exercised in isolation from the rest of the ~3000-line
component. Extracting the same `useMemo` verbatim into its own hook makes it
directly testable with `@testing-library/react`'s `renderHook` (§9) without
rendering `App` — this is a testability extraction, not a behaviour change
beyond adding the two dependencies, and it touches only site 1's own call
site, inside the cost stop-rule.

**Must not change:** the returned shape (`{ config, warnings } | null`); the
`deployDialogVisible && config` gate that keeps the report `null` while the
dialog is closed (lazy computation, per D-5's original "must not change");
no new provider or context — the hook takes its three inputs as plain
arguments from the same call site that already has them.

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
function, `yamlService`'s new parameter, the `useDeployReport` hook and the
`capabilityProfileService` normalization) is unit-tested exhaustively. The
owner's three named legs plus an actual-disconnect leg are e2e against the
cheapest production call site that needs no live/test HA connection
(`handleExportForHA`, site 2), seeded via a new persisted-store-seeding
helper. **Revised 2026-09-13 (repair for review Ref P1):** call sites 3 and
4 (live preview entry and its deploy confirmation) also get e2e legs, using
the existing offline harness in `tests/e2e/live-preview-deploy.spec.ts`
(§9); call site 1 (the ordinary Deploy dialog) is unit-covered by
`DeployDialog.spec.tsx` and the new `useDeployReport.spec.ts`, needing no
live/temp-HA interaction. Call site 5 (the live-preview layout-drag update)
calls the identical, now e2e-proven `yamlService` pattern as site 3, so it
keeps a required review-time `path:line` wiring check rather than gaining a
new e2e leg — building live-preview drag-simulation infrastructure that does
not exist today, to prove a fact a source read already settles with
certainty, is disproportionate to this repair (§9 states the reasoning). Of
the five call sites, only site 5 still relies on review-time verification,
down from all four in the original design.

---

**Cost stop-rule check.** This design adds one new pure function, one new
optional parameter on three existing `yamlService` methods (each already
accepting an options-shaped argument in spirit — `sanitizeForHA`/
`serializeForHA` did not, `sanitizeForHAWithReport` already threads `options`
internally to `exportDashboard`), one new field on an existing type derived by
one new line in an existing resolver function, and one new hook call at each
of the five call sites. **This round's repairs (Rev 1, §11) add: a
normalization line inside an existing read method (`capabilityProfileService.getProfile()`,
D-2a); one small extracted hook wrapping an existing inline `useMemo` with
two more primitive dependencies (`useDeployReport`, D-5a); and, at site 4
only, a re-derivation and one already-existing IPC call
(`haWsUpdateTempDashboard`, already used by site 5) moved earlier in that
handler's own body (D-5).** No new provider, no module-level global, no
parameter threaded through code outside the five call sites' own bodies. The
stop-rule is not tripped by the original design or by this round's repairs.

## 8. Acceptance Criteria

1. When `useCapabilityProfile()` resolves a profile with `capturedAt !== null`
   and `cardModPresent === false`, every byte-producing call site
   (`App.tsx:426` `deployReport`/`useDeployReport`, `:748` `handleExportForHA`,
   `:2481` `handleEnterLivePreview`, `:2580` `handleDeployFromLivePreview`,
   `HADashboardIframe.tsx:197`) strips TRANSLATE-class card-mod keys from
   every card carrying them and records the existing `card-mod-unavailable`
   warning (`cardModTranslator.ts:181-198`, `exportWarningSummary.ts:51-52`),
   unchanged in wording. **Revised 2026-09-13 (repair for review Ref P2):**
   `:2580` is now also byte-producing — it re-sanitizes and re-sends the temp
   dashboard at confirm-click time (D-5) — so it is added to this list.
2. With the same profile shape but `cardModPresent === true`, the same call
   sites (including `:2580`, per AC-1's revision) preserve TRANSLATE-class
   styling as a `card_mod` block exactly as `cardModTranslator.ts:200-243`
   already produces it — no behaviour change from today.
3. With `profile.capturedAt === null` (never captured), every call site
   behaves exactly as today: styling preserved, no warning — permissive.
4. After a disconnect following a real capture, export/deploy continues to
   use the persisted profile's last-captured `cardModPresent` value; a
   disconnect alone never resets it to permissive (R1). **Proven by an actual
   disconnect action (§9 Leg 5), not only by seeding the on-disk shape a
   disconnect leaves — repair for review Ref P4.**
5. `handleDeployFromLivePreview`'s pre-deploy warning summary
   (`App.tsx:2580`) is derived from `toExportCapabilityOptions(profile)` and
   `sanitizeForHAWithReport` called **at confirm-click time**, and that same
   call's `sanitized` output is what is (re-)sent to
   `haWsUpdateTempDashboard` before the dialog is shown — so the words and
   the bytes the temp dashboard actually holds come from one call, one
   instant, and "Nothing had to be adjusted for Home Assistant" is never
   shown over content that was, in fact, adjusted. **Revised 2026-09-13
   (repair for review Ref P2) — see D-5; the original wording relied on
   `profile` being referentially stable across a live-preview session, which
   a controlled reproduction disproved.**
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
13. `useCapabilityProfile()` returns `defaultCapabilityProfile()` (permissive)
    when read before `CapabilityProfileContext`'s async mount-effect resolves
    — the existing, accepted boot-window behaviour — pinned by a
    `KNOWN-OPEN:` test that renders a hook consumer before the provider's
    effect settles. **Revised 2026-09-13 (repair for review Ref P7): this
    criterion, and the test that pins it, are about the context's own
    initialization state, not about an export/deploy action's behaviour
    during the boot window.** Whether an export/deploy action invoked in
    that window behaves correctly remains the D-6 `KNOWN-OPEN` limitation —
    accepted, not demonstrated by this criterion or its test.
14. Every existing test in `tests/unit/yaml-service.spec.ts`,
    `tests/unit/yaml-conversion-service.spec.ts`,
    `tests/unit/capabilityProfile.spec.ts`,
    `tests/unit/capabilityResolver.spec.ts` and
    `tests/unit/DeployDialog.spec.tsx` still passes; the literal object
    fixtures in `capabilityProfile.spec.ts` that assert full-object equality
    (`defaultCapabilityProfile`, `buildCapabilityProfile`) are updated to
    include `layoutCardPresent` as a mechanical fixture change, not a
    behaviour change.
15. **(Repair for review Ref P3.)** `capabilityProfileService.getProfile()`
    returns `layoutCardPresent: false` for a stored profile persisted before
    this slice (missing the field entirely), while every other field already
    on that stored object (`capturedAt`, `haVersion`, `cardModPresent`,
    `overrides`) is returned unchanged from what was stored — proven by
    `tests/unit/capabilityProfileService.spec.ts` against a fixture written
    without the field, not merely inferred from the default-merge code path.
16. **(Repair for review Ref P5.)** `useDeployReport(deployDialogVisible,
config, profile)` recomputes its returned report when
    `profile.cardModPresent` or `profile.capturedAt` changes while
    `deployDialogVisible` and `config` are held constant, and does not
    recompute when all three of `deployDialogVisible`, `config` and those two
    profile fields are unchanged across a re-render — proven with
    `renderHook` in `tests/unit/useDeployReport.spec.ts`, not by inspection
    of the dependency array alone.

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
- **`tests/unit/capabilityProfileService.spec.ts` (new — repair for review
  Ref P3).** Write a fixture profile object to the store's backing file
  **without** `layoutCardPresent` (simulating a profile persisted before this
  slice), construct the service against that fixture, and assert
  `getProfile()` returns `layoutCardPresent: false` while `capturedAt`,
  `haVersion`, `cardModPresent` and any `overrides` on the fixture are
  returned unchanged. A second case with the field already present (`true`
  and `false`) confirms normalization does not overwrite a real captured
  value. A third case with no store file at all confirms the untouched
  default path still returns the full default object. Proves AC-15.
- **`tests/unit/useDeployReport.spec.ts` (new — repair for review Ref P5).**
  Using `@testing-library/react`'s `renderHook`, render
  `useDeployReport(true, config, profileA)` where `profileA.cardModPresent
=== false`, capture the result, then re-render with `profileB` identical
  except `cardModPresent === true` and `config`/`deployDialogVisible`
  unchanged — assert the hook's returned report changes (no `card-mod`
  warning, styling preserved) rather than returning the memoized result from
  `profileA`. A second re-render with every input byte-identical to the
  previous render asserts the returned report is the **same** reference
  (memoization is preserved, not defeated). **Proven RED against the
  pre-repair inline `App.tsx` memo** by the same technique used for the e2e
  red legs (`git stash push -u src/hooks/useDeployReport.ts` is not
  applicable pre-repair since the file does not yet exist; the red
  demonstration is instead that the ORIGINAL inline memo's dependency array,
  `[deployDialogVisible, config]`, provably excludes `profile` — direct
  quotation, not an executed red run, since the hook this test targets is
  itself the repair). Proves AC-16.

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

Legs 1–5 use a dashboard containing one card carrying `style: 'color:
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
4. **Leg 4 (RED-BEFORE-GREEN — D-3 discriminator; does not exercise
   disconnect — repair for review Ref P4, `docs/reviews/f9a-spec-codex-review.md`).**
   Seed `{ capturedAt: '<iso>', haVersion: null, cardModPresent: false }` —
   the on-disk shape a real disconnect-after-capture leaves, since
   `handleDisconnect` never touches the persisted profile (D-3). Same
   assertions as Leg 1 (strip + warn). This leg seeds the persisted state a
   disconnect leaves; it does **not** invoke `handleDisconnect` and does
   **not** by itself prove that disconnecting preserves the profile — a test
   that never calls the handler cannot detect a regression **inside** it.
   **Red on base for the identical reason as Leg 1** — on base nothing reads
   the profile at all, so `haVersion: null` makes no difference to today's
   `?? true` default. Its value is as a **discriminator**
   (`drawer_havdm_testing_cd71883212b81299c3bbef76`, discriminator lesson
   (a)): a plausible but wrong implementation of D-3 that used
   `profile.haVersion === null` instead of `profile.capturedAt === null` as
   the never-looked signal would treat this exact state as never-connected
   and stay permissive — passing Leg 3's assertions instead of Leg 1's on a
   state that is actually "disconnected after a real capture," not "never
   connected." Leg 4 is the leg that tells the two implementations apart.
   **Proves D-3's `capturedAt`-based derivation only — not AC-4, which Leg
   5 below proves.**
5. **Leg 5 (RED-BEFORE-GREEN — AC-4/R1, an actual disconnect action — repair
   for review Ref P4).** Seed
   `{ capturedAt: '<iso>', haVersion: '<v>', cardModPresent: false }` — a
   normal, non-null captured version (deliberately unlike Leg 4's
   `haVersion: null`, so this leg also catches an implementation that
   conflates the live WebSocket connection's own version, cleared by
   `haWebSocketService.close()` at disconnect, with the separately persisted
   profile's `haVersion`). Connect (the existing stubbed connection), then
   perform an actual disconnect through the app's own disconnect action
   (`handleDisconnect`, `App.tsx:2232-2239`) against the stubbed external
   IPC. Export via `handleExportForHA` (site 2). Assert the exported YAML is
   still stripped and still carries the warning — the persisted profile
   survived the real disconnect call, not merely a seeded approximation of
   its result. **Red on base** for the same reason as Leg 1 (nothing reads
   the profile pre-repair). Proves AC-4 directly.
6. **Leg 6 — KNOWN-OPEN leg (D-6, boot window).** A focused unit-level test
   (not e2e — the race is at React-context-seed time, not IPC-timing-dependent
   in a way e2e can control deterministically) renders a component consuming
   `useCapabilityProfile()` **before** the provider's effect has resolved
   (i.e., synchronously, in the same tick as mount, before `await` yields)
   and asserts it observes `defaultCapabilityProfile()` — pinning today's
   accepted permissive-during-boot behaviour per
   `drawer_practice_claims_588b2f2df00141d8f19f9433`'s guidance ("pin a
   KNOWN-OPEN limitation with a test that asserts the CURRENT, passing
   behaviour"). **Revised 2026-09-13 (repair for review Ref P7): proves the
   AC-13 context-initialization claim only** — it pins what
   `useCapabilityProfile()` itself returns before mount resolves, not the
   behaviour of an export/deploy action invoked in that window, which D-6
   leaves an accepted, undemonstrated limitation.

### e2e — sites 3 and 4 (deploy dialog and live preview) (repair for review Ref P1, `docs/reviews/f9a-spec-codex-review.md`, confirmed 2026-09-13)

**The original scope note above this heading is withdrawn — its premise was
false, not merely conservative.** It claimed `tests/e2e/live-preview-deploy.spec.ts`
"contains only `TODO`-commented placeholders" and "there is no existing
live-preview e2e harness to extend," citing a `grep -n "TODO"` count of 12
lines. Independently re-counted 2026-09-13: `grep -n "TODO" tests/e2e/live-preview-deploy.spec.ts`
returns **79** lines, and the file already contains a working offline
harness — `stubLivePreviewIpc` (`:21-49`) replaces the `ha:ws:isConnected`,
`ha:ws:createTempDashboard`, `ha:ws:updateTempDashboard` and
`ha:ws:deleteTempDashboard` IPC channels — used by three substantive,
already-passing tests (`:243-289`, `:362-391`, `:393-413`), one of which was
independently re-run headlessly 2026-09-13
(`bash tools/test-headless.sh tests/e2e/live-preview-deploy.spec.ts --project=electron-e2e --workers=1 --grep 'shows the preview address where no card can cover it'`
→ 1 passed, 15.1s). There is no infrastructure gap here to avoid building.

**Revised scope: sites 3 and 4 get real e2e coverage in this file; site 1 is
unit-covered; site 5 keeps a narrower, justified review-time check (below).**
Site 1 (`deployReport`/`useDeployReport`, the ordinary,
non-live-preview Deploy dialog) needs no live or temp-HA interaction at
all — it is already exercised by `tests/unit/DeployDialog.spec.tsx` given
supplied props, and its profile-dependency behaviour is now proven directly
by `tests/unit/useDeployReport.spec.ts` (§9 Unit, repair for Ref P5); an e2e
leg would add an Electron round-trip to prove what a hook-level test already
proves more directly. Sites 3, 4 and 5 all involve the temp-dashboard IPC
channels `stubLivePreviewIpc` already replaces, so they get the following
new legs in `tests/e2e/live-preview-deploy.spec.ts`, extending
`stubLivePreviewIpc` to also **record** the `config` argument each stubbed
channel receives (today the stub reads its `{ deleteSucceeds }` option but
discards the dashboard-config argument to `createTempDashboard`/
`updateTempDashboard` entirely — recording it is additive, no existing
assertion changes):

7. **Leg 7 (RED-BEFORE-GREEN — site 3, temp-dashboard bytes reflect the
   captured profile).** Seed
   `{ capturedAt: '<iso>', haVersion: '<v>', cardModPresent: false }` via
   `seedCapabilityProfile`. Create a dashboard with one card carrying
   `style: 'color: red;'`. Enter live preview (`enterLivePreview` —
   site 3's `handleEnterLivePreview` calls `haWsCreateTempDashboard`).
   Assert the recorded `createTempDashboard` argument has no `style` key and
   no `card_mod` block. **Red on base** — today the call site passes no
   capability option, so the recorded argument preserves `style`. Proves
   AC-1 for site 3.
8. **Leg 8 (CONTROL — site 3).** Same actions with `cardModPresent: true`.
   Assert the recorded argument preserves the `card_mod` block. Confirmed
   passing before and after. Proves AC-2 for site 3.

**Site 5 (`HADashboardIframe.handleLayoutChange`, the layout-drag update)
is not given its own new e2e leg here.** `tests/support/dsl/canvas.ts`
already drives a real `.react-grid-layout` drag against the main editing
canvas, and `HADashboardIframe`'s live-preview overlay renders the same
library (`handleLayoutChange` takes a `Layout` object, `:153`) — but whether
that same drag DSL is reusable, unmodified, against the preview overlay's
own grid instance is **unconfirmed** (the placeholder test
`'should synchronize layout changes with grid canvas'`, `:309-326`, was
never implemented, so no prior test answers this) and must be checked before
writing a Leg for it, the same way this spec already declines to assume the
persisted store's on-disk filename above. Site 5 calls the identical,
already-proven `yamlService.sanitizeForHA(mergedConfig, toExportCapabilityOptions(profile))`
pattern Leg 7 proves for site 3 (same function, same second argument, same
profile source) — the residual, site-5-specific risk is wiring only: does
`HADashboardIframe.tsx:197` actually call `useCapabilityProfile()` and pass
`toExportCapabilityOptions(profile)`. Per D-1's existing review-time
check for exactly this kind of one-line wiring, **the follow-up review reads
`HADashboardIframe.tsx:197` directly to confirm this**, rather than this
repair inventing new live-preview drag-simulation infrastructure to prove a
wiring fact a `path:line` read already settles with certainty.

9. **Leg 9 (RED-BEFORE-GREEN — site 4, words agree with the freshly-written
   bytes; proves the D-5 repair for Ref P2 at the production path, not only
   at the source-reading level).** Seed the absent-card-mod profile as Leg 7.
   Enter live preview (site 3 writes stripped bytes, as Leg 7 proved). Click
   "Deploy to Production" (`live-preview-deploy-confirm`). Assert **both**:
   (a) the confirmation dialog shows the adjusted-styling summary
   (`live-preview-deploy-summary`, not "Nothing had to be adjusted"), and (b)
   the `updateTempDashboard` call recorded **at confirm time** (D-5's
   re-derive-and-rewrite step) is also stripped. **Red on base** — today site
   4 computes no capability-aware warning and never re-sends the temp
   payload at confirm time, so assertion (a) fails and no re-send exists for
   (b) to inspect. This is the leg that would fail against a plausible but
   wrong repair that re-derives the warning text without also re-sending the
   bytes (D-5's "words and bytes from one call" requirement), closing the gap
   at the production path that the source-level D-5 argument alone cannot.
   Proves AC-1, AC-2 and AC-5 for site 4.

10. **Leg 10 (CONTROL — site 4).** Same as Leg 9 with `cardModPresent: true`.
    Assert "Nothing had to be adjusted for Home Assistant" and a preserved
    `card_mod` block in the recorded confirm-time `updateTempDashboard` call.
    Confirmed passing before and after. Proves AC-2 for site 4.

**Must not change:** the existing `stubLivePreviewIpc` return shapes and the
`deleteSucceeds` behaviour Legs prior to this repair already rely on; the
existing three passing tests at `:243-289`, `:362-391` and `:393-413`, which
this repair does not touch.

## 10. Open Questions

None block implementation. The proportionality judgement originally recorded
here — whether sites 1/3/4/5 needed review-time verification instead of a
new e2e harness against #159 criterion 5 — is **substantially resolved by
the Rev 1 repair (§11):** Codex's independent spec review
(`docs/reviews/f9a-spec-codex-review.md`, Ref P1) found the harness the
original note said did not exist, and §9 now gives sites 3 and 4 real e2e
coverage using it, with site 1 unit-covered. Only site 5 still relies on a
review-time `path:line` check, narrowly and for a stated reason (§9: it
calls the identical, now e2e-proven pattern as site 3, and no
live-preview drag-simulation harness exists to justify building one for this
repair) rather than as an unexamined default. If the reviewer or the owner
judges even that narrower residual insufficient against #159 criterion 5,
that is a legitimate disagreement for the scoped follow-up to raise, not a
gap this spec has left silent.

### 10.1 Specification Definition of Done (repair for review Ref P6, `docs/reviews/f9a-spec-codex-review.md`, confirmed 2026-09-13)

Issue #159's Definition of Done ("The agreed product outcome is
demonstrated; relevant existing behavior is preserved; required reviews and
checks are complete; acceptance evidence, remaining risks and the owner's
disposition are recorded... Each intermediate brief/specification has its
own appropriate DoD") governs the chain, not this document's content (§3)
— but per the adopted trial adoption record
(`docs/reviews/2026-09-11-review-loop-trial-adoption.md:18`) and #159 itself,
this specification owes its own completion statement, which was missing.
**This specification is Done when:**

1. Every design decision D-1 through D-7 (and this round's D-2a, D-5, D-5a)
   is settled against the locked brief, with the evidence cited inline —
   demonstrated in §7.
2. The acceptance criteria (§8) and test matrix (§9) are specific enough
   for an independent implementer to build and test without further design
   judgement calls — demonstrated in §8–§9.
3. The required independent specification review (Codex, per the chain in
   this document's header and #159) has run at least one full round, every
   finding has been verified against source and ruled by the owner, and
   every approved repair is reflected in this document — demonstrated:
   `docs/reviews/f9a-spec-codex-review.md` (round 1), owner rulings and
   repair record in `docs/reviews/f9a-spec-repair-dispositions.md`, this
   Rev 1.
4. The review's scoped follow-up (Operating Agreement §3.4) confirms the
   claimed closures and its declared radius — pending as of this revision;
   tracked in `docs/reviews/f9a-spec-codex-followup.md` once filed.
5. The owner signs off on this specification and it is landed on `main` —
   pending as of this revision.

Items 1–3 are met by this revision; items 4–5 are the remaining steps before
the specification itself is Done. This is a criterion for the **document**;
the **product's** DoD (#159's own, unchanged) is met only once the
implementation built from this specification is reviewed and accepted.

## 11. Revision History & Amendments

| Date       | Rev | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | By              |
| ---------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 2026-09-12 | 0   | Draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Claude Sonnet 5 |
| 2026-09-13 | 1   | Bundled repair for all seven findings in Codex's independent specification review (`docs/reviews/f9a-spec-codex-review.md`), per owner ruling to fix all seven now (`docs/reviews/f9a-spec-repair-dispositions.md`): replaced the disproven "no existing harness" premise and added real e2e coverage for sites 3/4, with site 5 narrowed to a justified review-time check (P1); replaced D-5's disproven referential-stability guarantee with an active re-derive-and-rewrite mechanism at site 4 (P2); added legacy-profile normalization on read (D-2a, P3); corrected Leg 4's claim and added an actual-disconnect Leg 5 (P4); extracted the site-1 memo into a testable, profile-aware hook (D-5a, P5); added this specification's own Definition of Done (§10.1, P6); narrowed AC-13/Leg 6's claim to the context-initialization property it actually tests (P7). No requirement was added beyond closing these seven findings; the locked brief and the cost stop-rule are unchanged. | Claude Sonnet 5 |
