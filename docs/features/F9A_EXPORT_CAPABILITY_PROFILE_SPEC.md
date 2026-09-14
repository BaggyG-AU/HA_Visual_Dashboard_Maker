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

| Finding / Ruling / Deliverable                                                                                                                                                                                                         | Addressed in section                                                                                                                                                | Issue # | Status  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| #159 criterion 2 — absent-card-mod strips + warns; pre-deploy words agree with emitted bytes                                                                                                                                           | §7 D-1, D-3, D-5; §8 AC-1, AC-5; §9 Legs 1, 9, 11, 12                                                                                                               | #159    | Covered |
| #159 criterion 3 — present preserved; never-connected permissive; persisted profile authoritative after disconnect                                                                                                                     | §7 D-3; §8 AC-2, AC-3, AC-4; §9 Legs 2, 3, 4, 5, 8, 10                                                                                                              | #159    | Covered |
| #159 criterion 4 — one object for both facts; source/treatment of unknown layout-card                                                                                                                                                  | §7 D-2, D-4; §8 AC-6–AC-8                                                                                                                                           | #159    | Covered |
| #159 criterion 5 — evidence covers affected production paths and regression                                                                                                                                                            | §9 (full)                                                                                                                                                           | #159    | Covered |
| brief R1 — never-connected permissive; persisted profile wins after disconnect                                                                                                                                                         | §7 D-3; §8 AC-4; §9 Legs 4, 5                                                                                                                                       | #159    | Covered |
| brief item 9 — one capability object for both facts                                                                                                                                                                                    | §7 D-2, D-4; §8 AC-6                                                                                                                                                | #159    | Covered |
| brief N2 — strip-and-warn path is dead from production entry points                                                                                                                                                                    | §7 D-1; §8 AC-1, AC-9                                                                                                                                               | #159    | Covered |
| brief §9.2 option A — carry the layout-card fact, do not consume it                                                                                                                                                                    | §7 D-2; §8 AC-6–AC-8                                                                                                                                                | #159    | Covered |
| brief §9.3 controlling correction — site 4's words must agree with the bytes                                                                                                                                                           | §7 D-5; §8 AC-5; §9 Legs 9, 10, 11, 12                                                                                                                              | #159    | Covered |
| brief D-6 — the boot window                                                                                                                                                                                                            | §7 D-6; §8 AC-13; §9 Leg 6 (KNOWN-OPEN)                                                                                                                             | #159    | Covered |
| brief D-7 — coverage split (unit vs. e2e)                                                                                                                                                                                              | §9 (full)                                                                                                                                                           | #159    | Covered |
| F10 — export services stay React-free                                                                                                                                                                                                  | §7 D-1; §8 AC-10                                                                                                                                                    | #159    | Covered |
| Cost stop-rule (brief header)                                                                                                                                                                                                          | §7 closing note                                                                                                                                                     | #159    | Covered |
| Codex spec review, `docs/reviews/f9a-spec-codex-review.md`, P1–P7 (owner ruling: fix all seven now)                                                                                                                                    | §7 D-2a, D-5, D-5a; §8 AC-1, AC-2, AC-4, AC-5, AC-13, AC-15, AC-16; §9 (full)                                                                                       | #159    | Covered |
| Codex spec review, `docs/reviews/f9a-spec-codex-followup.md`, P2/P4/P5/P8 partial/new (owner ruling: continue; P9 accepted as-is)                                                                                                      | §7 D-2a, D-5; §8 AC-16; §9 Legs 5, 9–12                                                                                                                             | #159    | Covered |
| Codex spec review, `docs/reviews/f9a-spec-codex-followup2.md`, P2/P5/P8 partial (owner ruling: continue — button-disable redesign)                                                                                                     | §7 D-5; §8 AC-16; §9 Legs 9–12                                                                                                                                      | #159    | Covered |
| Codex spec review, `docs/reviews/f9a-spec-codex-followup3.md`, P2/P8 partial + new P10 (owner ruling, second same-seam occurrence: continue with an isolated test hook for P8, moot-by-construction for P10, declared residual for P2) | §7 D-5 (residual), "Establishing a KNOWN source dashboard" (isolated hook); §8 AC-17                                                                                | #159    | Covered |
| Codex spec review, `docs/reviews/f9a-spec-codex-followup4.md`, P11/P12 new SEV 1 (owner ruling, third same-seam occurrence: continue-and-fix for P11's test-setup bugs, declared residual for P12's un-pinnable Leg 13)                | §7 D-5 ("Establishing a KNOWN source dashboard" narrowed-revert + both-steps fix; residual left un-pinned); §8 AC-17; §9 Legs 9, 11, 12 (revised); Leg 13 withdrawn | #159    | Covered |

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

| Path                                                | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/capability/resourceElementMap.ts`     | Add `LAYOUT_CARD_FOLDER = 'lovelace-layout-card'` constant and a `[LAYOUT_CARD_FOLDER]: []` entry in `RESOURCE_ELEMENT_MAP` (mirroring `CARD_MOD_FOLDER`'s own `[]` entry — presence matters, no card element), `[conventional]`-tagged per the file's own provenance convention (§7 D-2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `src/services/capability/capabilityResolver.ts`     | Add `layoutCardPresent: boolean` to `ResolvedCapability` and derive it in `resolveCapability` as `installedFolders.has(LAYOUT_CARD_FOLDER)`, mirroring `cardModPresent` (`:79`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/services/capability/capabilityProfile.ts`      | Add `layoutCardPresent: boolean` to `CapabilityProfile`; set `false` in `defaultCapabilityProfile()`; carry it through in `buildCapabilityProfile`. Add the new pure helper (§7 D-1/D-3) — proposed name `toExportCapabilityOptions(profile: CapabilityProfile): { cardModAvailable: boolean }`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/services/capabilityProfileService.ts`          | **(P3 repair, §7 D-2a)** `getProfile()` normalizes the stored object against the default on read: `{ ...defaultCapabilityProfile(), ...this.store.get('profile', defaultCapabilityProfile()) }`, so a profile persisted before `layoutCardPresent` existed gets the field's permissive default instead of `undefined`; every already-captured field (`capturedAt`, `haVersion`, `cardModPresent`, `userOverrides`) is preserved verbatim.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/hooks/useDeployReport.ts` (new)                | **(P5 repair, §7 D-5a)** Extracts the ordinary-DeployDialog report computation into a testable hook: `useDeployReport(deployDialogVisible: boolean, config: DashboardConfig \| null, profile: CapabilityProfile)`, wrapping `useMemo(() => (deployDialogVisible && config ? yamlService.sanitizeForHAWithReport(config, toExportCapabilityOptions(profile)) : null), [deployDialogVisible, config, profile.cardModPresent, profile.capturedAt])`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/services/yamlService.ts`                       | Add an optional second parameter to `sanitizeForHAWithReport`, `sanitizeForHA`, `serializeForHA` carrying `{ cardModAvailable?: boolean }`, forwarded into the existing `exportDashboard(sanitized, { warnings, cardModAvailable })` call. No import of React.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `src/App.tsx`                                       | Import and call `useCapabilityProfile()` (currently only `useRefreshCapabilityProfile()` is imported, `:45`). Replace the inline `deployReport` `useMemo` at `:425-428` with a call to `useDeployReport(deployDialogVisible, config, profile)` (P5 repair). At `:748` `handleExportForHA` and `:2481` `handleEnterLivePreview`, pass `toExportCapabilityOptions(profile)` as the new argument. At `:2580` `handleDeployFromLivePreview` (site 4, **P2 repair, §7 D-5**): re-derive `toExportCapabilityOptions(profile)` and re-run `sanitizeForHAWithReport(config, options)` at confirm-click time; `await window.electronAPI.haWsUpdateTempDashboard(tempDashboardPath, { ...sanitized, title })`; on `{ success: false }` show an error and return without opening the confirm dialog; otherwise compute the confirmation warning from that same call's `warnings` — never from a value read or derived earlier in the session. **No new prop or ref is added between `App` and `HADashboardIframe`** (round 2's `pendingLayoutWriteRef` is removed by round 3 — see that component's row). **(P8 round-4 repair, replacing round 3's withdrawn approach below.)** Add a new, isolated test-only hook in its own `useEffect`, gated behind the same `isTestEnv()` check as the existing `__testThemeApi` effects but registered as a **separate** object so neither of that object's two registrations (`:569-571`, `:2172-2187` — see the round-4 P8 finding) can ever overwrite it: `window.__testHAConnectionApi = { connect: (config) => haConnectionService.setConfig(config), disconnect: () => haConnectionService.disconnect() }`. `__testThemeApi.setConnected` itself is byte-unchanged from today (round 3's planned widening is withdrawn, since it both left the second effect's overwrite unaddressed and would have changed ~19 existing spec files' data-sourcing behaviour, review Ref P10). **(Round 5, repair for review Ref P11.)** No further `App.tsx` production code changes — P11's fixes are all in the test-support/DSL layer (below) and the reproduction technique, not in `App.tsx` itself. |
| `src/components/HADashboardIframe.tsx`              | Import and call `useCapabilityProfile()`; pass `toExportCapabilityOptions(profile)` into the `sanitizeForHA(mergedConfig)` call at `:197`. **(P2 repair, round 3, §7 D-5, replacing round 2's cross-component design.)** Add local state `const [pendingLayoutWrites, setPendingLayoutWrites] = useState(0)`; increment at the start of `handleLayoutChange`'s body, decrement in a `finally` wrapping its existing `try` (`:159-207`). Widen the existing "Deploy to Production" button's `disabled={!tempDashboardPath}` (`:314-319`) to `disabled={!tempDashboardPath \|\| pendingLayoutWrites > 0}`. No new prop is added — the state, the writes it counts, and the button it gates are all local to this component.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tests/unit/capabilityResolver.spec.ts`             | Extend `RESOURCE_ELEMENT_MAP`/`resolveCapability` describe blocks for `layoutCardPresent`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tests/unit/capabilityProfile.spec.ts`              | Extend `defaultCapabilityProfile`/`buildCapabilityProfile` fixtures for `layoutCardPresent`; add a `toExportCapabilityOptions` describe block.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/unit/capabilityProfileService.spec.ts` (new) | **(P3 repair)** Proves `getProfile()` normalization: a stored profile object missing `layoutCardPresent` reads back with `layoutCardPresent: false` and every other stored field unchanged; a stored profile already carrying the field is untouched; a never-written store still returns the full default.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/unit/useDeployReport.spec.ts` (new)          | **(P5 repair)** Using `@testing-library/react`'s `renderHook`, proves the hook recomputes when `profile.cardModPresent` changes AND, independently (round-2 repair), when only `profile.capturedAt` changes — each with `config`/`deployDialogVisible` held constant — and does not recompute on an unrelated re-render with every input unchanged. **(Round-3 addition.)** Also runs the same transition cases against a deliberately-wrong sibling hook built from the pre-repair dependency array, asserting it fails to recompute — an executed proof the cases catch the defect, not a citation of the old array.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tests/unit/yaml-service.spec.ts`                   | Extend `sanitizeForHA`/`serializeForHA`/`sanitizeForHAWithReport` describe blocks with the new second-argument legs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tests/support/dsl/capabilityProfile.ts` (new)      | `seedCapabilityProfile(userDataDir, profile)` — writes the persisted `ha-capability-profile` store file before Electron launch (§9). `readCapabilityProfile(userDataDir)` (round-2 repair for review Ref P4) — reads that same file back and returns the parsed `profile`, independent of the app's own in-memory cache.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/e2e/export-capability-profile.spec.ts` (new) | Legs 1–5 of §9 (site 2, `handleExportForHA`), including Leg 5 (P4 repair, an actual disconnect action). Leg 6 (KNOWN-OPEN, D-6) is unit-level, not e2e — see §9.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tests/e2e/live-preview-deploy.spec.ts`             | **(P1 repair)** Extend `stubLivePreviewIpc` to record the `config` argument each stubbed IPC channel receives (currently discarded); add Legs 7–10 (§9) covering sites 3 and 4 using the existing offline harness. Site 5's wiring is a required review-time check (§9), not a new e2e leg — see §9's note on why. **(Round 4.)** New `stubDashboardBrowser(ctx)` helper also stubs `ha:ws:connect` (repair for review Ref P8 construction B). **(Round 5, repair for review Ref P11.)** `establishKnownSourceDashboard(ctx)` calls the existing shared `appDSL.setConnected(true)` step in addition to the isolated hook, and clicks `welcome-browse-dashboards` instead of `toolbar-download`. Legs 9/11/12's red-before-green proof reverts only the specific site-4/site-5 mechanism each targets, not all of `src/`. **(Round 5, repair for review Ref P12.)** Leg 13 is withdrawn — see D-5's residual subsection and AC-17.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

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
_reader_ of it — `setOverride` (which calls `this.getProfile()` internally
before applying the override) and the `capability:*` IPC handlers in
`main.ts` — sees a complete object with no additional code, and a user who
never captures again still gets the field the moment they next read it.
**Correction, 2026-09-13 (repair for review Ref P9):** `saveProfile` and
`clearProfile` are _writers_, not callers of `getProfile()` — they only ever
call `this.store.set(...)`. The round-1 repair round's dispositions file
listed them alongside `getProfile()`'s actual callers in error; this
document and the dispositions file's Round 2 section correct it. This is a
record-accuracy correction; it changes no behaviour. `capturedAt`, `haVersion`,
`cardModPresent` and any `userOverrides` already on disk are preserved verbatim
by the spread order (`defaultCapabilityProfile()` first, stored object
second) — this is not a reset, it only fills what was never there.

**Must not change:** do not reset a captured profile's `capturedAt`,
`haVersion`, `cardModPresent` or `userOverrides` to their defaults; do not add a
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
4. **If that call resolves `{ success: false, error }`, stops here:** shows
   `message.error` naming the failure and returns — it does **not** show the
   confirmation dialog. Mirrors the existing failure contract already used
   at site 3 (`handleEnterLivePreview`, `:2483`) and site 5
   (`HADashboardIframe.tsx:205-207`). The dialog's warning is a promise about
   what the temp dashboard now contains; showing it after a failed write
   would repeat exactly the mismatch this decision exists to prevent.
5. Computes the confirmation summary (`summarizeExportWarnings`) from that
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

**Closing the pending-writer race — revised again, round 3 (repair for
review Ref P2, `docs/reviews/f9a-spec-codex-followup2.md`, confirmed
2026-09-14).** Codex's follow-up review demonstrated a second race this
decision's round-1 text did not address: site 5's `handleLayoutChange`
(`HADashboardIframe.tsx:153-207`) awaits `haWsIsConnected()` (`:161`)
**before** computing and sending its update — so a layout drag started just
before the user clicks deploy can still be pending, and can resolve
**after** step 3's write, silently overwriting it with bytes derived from an
earlier profile snapshot.

**Round 2's fix is itself disproven and withdrawn.** It tracked only the
**most recently started** write in a single ref, replaced on every new
invocation. Codex's second follow-up review found that this does not close
the race: if the user drags **twice** in quick succession, the ref is
overwritten by the second write's promise before the first one necessarily
settles — async I/O completion order is not guaranteed to match start
order. Independently reproduced 2026-09-14 by executing the follow-up
review's own embedded probe: two overlapping `handleLayoutChange`
invocations, where the connection-check gate is released **out of start
order** (the second-started write's gate is released first), produce
`['layout x=4 / 6', 'confirm stripped', 'layout x=1 / 3']` — the
confirmation's rewrite (correctly stripped) is followed by the **first**
write completing and overwriting it with unstripped content, because
awaiting only the ref's latest value never waited for that first write at
all.

**Revised decision — disable the trigger, not await it.** `HADashboardIframe`
tracks the **count** of layout writes currently in flight, not a single
reference to "the latest one": `const [pendingLayoutWrites, setPendingLayoutWrites] = useState(0)`,
incremented at the start of `handleLayoutChange`'s body (immediately after
the existing `if (tempDashboardPath && activeView)` guard) and decremented
in a `finally` block wrapping its existing `try` — so it decrements whether
the write succeeds, fails, or the function returns early. The existing
"Deploy to Production" button (`HADashboardIframe.tsx:314-319`, already
`disabled={!tempDashboardPath}`) becomes
`disabled={!tempDashboardPath || pendingLayoutWrites > 0}`. D-5's step 0
(the round-2 `await pendingLayoutWriteRef.current`) is **removed entirely** —
it is now unreachable code, because the button that would trigger
`handleDeployFromLivePreview` cannot be clicked at all while any write is
pending, regardless of how many are in flight or the order in which they
settle. This closes the race by construction rather than by racing it:
there is no "wait for the right thing" logic to get wrong, because nothing
downstream of the button ever runs while the count is above zero.

**Why this is a better fix, not just a different one.** (1) It is correct
for **any** number of concurrent writes settling in **any** order, because a
count reaching zero means every write that was ever started has settled —
round 2's single-slot design was only ever correct for exactly one write at
a time. (2) It needs no new prop or ref shared between `App` and
`HADashboardIframe` — the state, the writes it tracks, and the button it
gates are all already inside the same component, so this is strictly
**less** cross-component wiring than round 2's design, not more. (3) It
gives the user visible feedback (a greyed-out button while their edit is
still saving) instead of an invisible background wait with no on-screen
indication that anything is happening.

**Must not change:** no new provider/global; no prop added between `App`
and `HADashboardIframe` (round 2's `onLayoutWriteSettled` prop and `App`'s
`pendingLayoutWriteRef` are removed by this revision, not added to); the
existing `disabled={!tempDashboardPath}` condition is preserved, only
widened; no serialization queue or request cache; the re-send at site 4
still targets the existing `ha:ws:updateTempDashboard` channel already used
by site 5; the confirm dialog's existing copy/testids
(`live-preview-deploy-confirm`, `live-preview-deploy-summary`) are
unchanged; site 5's own existing success/failure handling (`:205-207`) is
untouched by the counter, which only wraps it.

**Original text, superseded above:** ~~`handleDeployFromLivePreview` calls
`toExportCapabilityOptions(profile)` with the same `profile` value obtained
from the same `useCapabilityProfile()` call already read at the top of `App`
for sites 1/3 — not a fresh read, not a different derivation. Because
`CapabilityProfileContext`'s `profile` state changes only via its `refresh()`
callback, and nothing in the live-preview flow itself calls `refresh()`, the
profile reference is stable across one live-preview session, so words and
bytes agree by construction.~~

**Declaring the residual — round 4 (owner ruling on review Ref P2,
`docs/reviews/f9a-spec-codex-followup3.md`, confirmed 2026-09-14).** The
button-disable mechanism above prevents a **new** confirmation from being
opened while a write is in flight; it cannot revoke a confirmation dialog
**already shown** before the gating write was ever counted.
`HADashboardIframe.handleLayoutChange` increments `pendingLayoutWrites` only
at the **start of its own body** — i.e., at drag/resize **stop**
(`onDragStop`/`onResizeStop`, `:449-450`), not at drag/resize **start**. A
gesture already physically in progress (mouse down, actively dragging) when
the user clicks "Deploy to Production" therefore leaves the count at zero:
the button is enabled, `handleDeploy` shows its first `Modal.confirm`, and
that dialog's `onOk: onDeploy` is bound before the in-progress gesture's own
write is ever counted. Nothing re-checks the count between that binding and
the user clicking "OK" — independently reproduced with a controlled
interleaving (`docs/reviews/f9a-spec-codex-followup3.md` §5): a drag begun
before the click and stopped after the first dialog opens produces
`['outer OK with pending=1', 'confirm stripped', 'older write']` — the
drag's own, later-settling write overwrites site 4's confirm-time rewrite.

**Owner ruling, 2026-09-14 (round 4): accepted as a documented residual, not
a further design iteration.** Three real design changes have already been
made to this exact mechanism (round 1's referential-stability fix, round 2's
since-withdrawn ref-based wait, round 3's disable-the-trigger redesign).
This remaining window is narrower than any of those — it requires a gesture
already physically under way at the moment the button is clicked, not
merely a write started afterward (round 3 already closes that, the common
case) — and closing it fully would need either revoking an already-open
native dialog's bound callback (no existing precedent in this codebase) or
gating the first dialog's own `onOk` on a live re-read of the count (a
fourth design change to a mechanism already revised three times). The owner
weighed the residual's narrow window and low likelihood against that cost
and chose to accept it now, pinned rather than left silent.

**Round 5 correction: left un-pinned by an executable test, deliberately
(repair for review Ref P12, `docs/reviews/f9a-spec-codex-followup4.md`,
confirmed 2026-09-14).** Round 4 specified a `KNOWN-OPEN:` leg (Leg 13) to
pin this residual per this project's own convention for a boundary written
in prose that nobody re-reads (`drawer_practice_claims_588b2f2df00141d8f19f9433`;
the same pattern D-6 uses for the boot window). Codex's fourth follow-up
found Leg 13 did not actually prove what it claimed: its wait-condition
targeted an event (a confirm-time write) that does not exist on the literal
reverted baseline its own text invoked, and its single, unchanging profile
snapshot could not produce the observable words/bytes mismatch the residual
is about once site 5 is capability-aware too (D-1). A correct pin would need
a new test-only mechanism to force a genuine mid-session capability-profile
change — nothing like it exists in this project's offline test suite, since
real HA capture is never exercised there. **The owner ruled to withdraw Leg
13 rather than build that mechanism**: this residual is accepted and
documented in prose (this subsection) but is **not** demonstrated by an
executable test. AC-17 (§8) states this plainly. If a future round wants an
executable pin, it needs the mid-session profile-change mechanism above as
a prerequisite — this is not merely a wording fix to Leg 13's existing
design.

**Must not change (round 4 addition):** the round-3 button-disable
mechanism itself is not weakened, replaced, or given new cross-component
wiring to chase this residual.

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
    `userOverrides`) is returned unchanged from what was stored — proven by
    `tests/unit/capabilityProfileService.spec.ts` against a fixture written
    without the field, not merely inferred from the default-merge code path.
16. **(Repair for review Ref P5.)** `useDeployReport(deployDialogVisible,
config, profile)` recomputes its returned report when `profile.cardModPresent`
    changes **and**, independently — tested as its own case, not inferred
    from the first (round-2 repair, review Ref P5) — when only
    `profile.capturedAt` changes, in both cases with `deployDialogVisible`
    and `config` held constant; it does not recompute when all four inputs
    are unchanged across a re-render — proven with `renderHook` in
    `tests/unit/useDeployReport.spec.ts`, not by inspection of the
    dependency array alone. **(Round-3 addition, review Ref P5.)** The same
    test also executes a deliberately-wrong sibling built from the
    pre-repair dependency array against the same transition cases, asserting
    it fails to recompute — an executed demonstration that the test cases
    actually catch the defect they are named for, not only a citation of
    what the old array excluded.
17. **(Round 4, owner-accepted residual for review Ref P2; revised round 5
    for review Ref P12.)** An already-shown live-preview deploy confirmation
    (`HADashboardIframe`'s first, generic `Modal.confirm`) is **not** revoked
    by a layout write that begins after the dialog opens, from a drag/resize
    gesture already in progress at the moment the "Deploy to Production"
    button was clicked. **This is an accepted limitation of D-5's
    button-disable mechanism, documented in prose (D-5's "Declaring the
    residual" subsection) but deliberately not demonstrated by an executable
    test** — round 4's attempted `KNOWN-OPEN:` pin (Leg 13) did not actually
    prove this behaviour (review Ref P12) and was withdrawn rather than
    replaced, since a correct pin needs a mid-session capability-profile-change
    mechanism this project's test suite does not have. This criterion is
    satisfied by the documentation existing and being accurate, not by any
    test passing.

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
  `haVersion`, `cardModPresent` and any `userOverrides` on the fixture are
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
  `profileA`. **A third case (round-2 repair for review Ref P5,
  `docs/reviews/f9a-spec-codex-followup.md`, confirmed 2026-09-14), testing
  the OTHER dependency independently:** render with `profileC = defaultCapabilityProfile()`
  (`capturedAt: null`, `cardModPresent: false` — never captured, permissive),
  then re-render with `profileD` identical except `capturedAt: '<iso>'`
  (`cardModPresent` held at `false` throughout) — assert the report now
  strips and warns. **Why this case is required, not redundant with the
  first:** the first case varies only `cardModPresent`; a hook whose
  dependency array included `cardModPresent` but omitted `capturedAt` would
  pass that case and the unchanged-input control below, yet would remain
  permissive for this never-connected-to-captured-absent transition — the
  exact class of bug this hook exists to prevent (D-3). A fourth re-render
  with every input byte-identical to the previous render asserts the
  returned report is the **same** reference (memoization is preserved, not
  defeated). **An executed negative control (round-3 repair for review Ref
  P5, `docs/reviews/f9a-spec-codex-followup2.md`, confirmed 2026-09-14),
  replacing round 2's citation-only claim:** the same test file also
  constructs a **deliberately wrong** sibling hook using the exact
  pre-repair dependency array, `useMemo(() => ..., [deployDialogVisible, config])`
  (the same computation body, only the array differs), and re-runs the
  `capturedAt`-only transition case (and the `cardModPresent`-only case)
  against it via `renderHook` — asserting this wrong version's result does
  **not** change, i.e. it stays memoized/stale across a transition the real
  hook must detect. This demonstrates, by executing it, that the new test
  cases actually distinguish the correct dependency array from the one they
  are meant to catch — not merely that the old array excludes the fields
  (round 2's claim), but that a hook built with it would visibly **fail**
  these specific test cases. Independently confirmed feasible 2026-09-14:
  the round-2 follow-up review's own reproduction executed exactly this
  technique against the actual pre-repair inline `deployReport` expression
  via `renderHook`, observing one sanitizer call across two independent
  profile changes — i.e., the wrong-dependency-array behavior this leg
  needs to demonstrate is directly reproducible, not hypothetical. Proves
  AC-16.

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
   IPC. **Two independent assertions (round-2 repair for review Ref P4,
   `docs/reviews/f9a-spec-codex-followup.md`, confirmed 2026-09-14):**
   (a) export via `handleExportForHA` (site 2) — assert the exported YAML is
   still stripped and still carries the warning; (b) **read the on-disk
   store file directly** with a new DSL helper,
   `readCapabilityProfile(userDataDir)` (symmetric to `seedCapabilityProfile`,
   §9's e2e preamble) — assert the persisted `capturedAt`, `haVersion` and
   `cardModPresent` are byte-identical to what was seeded, independent of
   whatever value the app's `CapabilityProfileContext` currently has cached
   in memory. **Why both are needed, with evidence:** `CapabilityProfileContext`
   reads the persisted profile once at mount and again only via its
   `refresh()` callback (`CapabilityProfileContext.tsx:51-64`); `handleDisconnect`
   never calls `refresh()` (confirmed: `grep -n "capabilityProfileService\|capability:"
src/App.tsx` inside its body returns nothing). Assertion (a) alone
   therefore only proves the app's **already-loaded, cached** profile value
   survived disconnect — a defect that reset the persisted **file** itself
   without touching the live context's already-cached state would pass (a)
   and still be a real regression. Assertion (b) closes that gap by reading
   the actual file, not the cache. **Red on base** for the same reason as
   Leg 1 (nothing reads the profile pre-repair for (a); (b) is unaffected by
   the repair either way, since disconnect never wrote to the store before
   or after — (b) is included as an always-passing discriminator that would
   fail only against a disconnect regression, not against the base/repaired
   feature difference). Proves AC-4 directly, at both the export boundary
   and the persisted-record boundary.
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

**Establishing a KNOWN source dashboard, for Legs 9–12 (round-2 repair for
review Ref P8, `docs/reviews/f9a-spec-codex-followup.md`, confirmed
2026-09-14).** Round 1's Legs 9–10 reused Leg 7's "create a new dashboard"
setup. **This is a confirmed defect, not a simplification:** a new dashboard
has `sourceDashboard === null`, and `resolveLivePreviewDeployTarget(null)`
returns `{ kind: 'unknown' }` (`livePreviewDeploy.ts:49`) — `App.tsx:2553`'s
`if (target.kind === 'unknown')` branch then exits live preview and opens
the **ordinary** DeployDialog instead of ever reaching site 4's confirmation
flow at all. Independently reproduced 2026-09-14 with an extracted-handler
probe against the actual `handleDeployFromLivePreview` body: a `null`
`sourceDashboard` produces `['exit preview', 'ordinary dialog']`; only a
non-null `sourceDashboard` reaches the confirmation (`['summary dialog']`).
Legs 9–12 therefore need their **own** setup, establishing a real HA source
via the app's actual download path rather than "create new":

- Extend the offline harness with a new helper,
  `stubDashboardBrowser(ctx)`, alongside `stubLivePreviewIpc`: replaces
  `ha:ws:connect` (→ `{ success: true }` — **round-4 addition, repair for
  review Ref P8 construction B**: neither the existing four
  `stubLivePreviewIpc` channels nor the two channels below cover this call,
  and `DashboardBrowser.loadDashboards` (`DashboardBrowser.tsx:97-123`)
  calls it before listing — independently confirmed by reading that
  handler directly, and by executing it against a controlled rejection
  standing in for the real, unstubbed handler: `['connect', 'controlled
connection failure']`, with no `list` call ever reached), `ha:ws:listDashboards`
  (→ `{ success: true, dashboards: [] }` — no custom
  dashboards needed) and `ha:ws:getDashboardConfig` (→
  `{ success: true, config: <plain object: one view, one button card
carrying style: 'color: red;'> }`, matching the card content Legs 7–12
  already use).
- **Prerequisite fixed, round 4 (repair for review Ref P8 construction A,
  `docs/reviews/f9a-spec-codex-followup3.md`, confirmed 2026-09-14,
  replacing round 3's now-withdrawn approach).** Round 3 planned to widen
  the shared `__testThemeApi.setConnected` backdoor (`App.tsx:569-571`) to
  also configure `haConnectionService`. Codex's third follow-up found this
  incomplete on its own terms and risky beyond it: (1) a **second**, ungated
  effect at `App.tsx:2172-2187` re-assigns `window.__testThemeApi` (with the
  original, React-state-only callback) after the first, edited effect runs,
  discarding the widening in source order — independently confirmed by
  reading both effects directly and executing them in sequence:
  `reactConnected=true; serviceConnected=false; registrations=2`; and (2)
  independently, widening the shared backdoor at all would change
  data-sourcing behaviour for roughly 19 existing spec files that combine
  it with a seeded offline entity cache and currently rely on it staying
  React-state-only (review Ref P10 — see `loadPickerEntities`,
  `src/services/entityPickerSource.ts:55-75`, which switches from the
  persisted cache to a live `haConnectionService.fetchEntities()` REST call
  once `haConnectionService.isConnected()` is true). **Round-4 fix:
  withdraw the shared-backdoor widening entirely** — `__testThemeApi.setConnected`
  stays byte-unchanged by this specification, exactly `setConnected:
(connected: boolean) => setIsConnected(connected)` — **and add a new,
  isolated test-only hook instead.** A third `useEffect` in `App.tsx`,
  gated behind the same `isTestEnv()` check, registers
  `window.__testHAConnectionApi = { connect: (config: { url: string; token: string }) => haConnectionService.setConfig(config), disconnect: () => haConnectionService.disconnect() }`.
  This hook is a **separate object** from `__testThemeApi`, so neither of
  that object's two registrations can ever overwrite it — P8 construction A
  does not apply to it by construction, not by ordering — and it has
  exactly one caller (below), so **no existing spec file's behaviour
  changes and P10 does not apply**: `setConnected(true)` and the DSL's
  shared `setConnected` step are byte-identical to today for every one of
  the 19 files P10 named, and every other current consumer of
  `haConnectionService` and `__testThemeApi` is unaffected.

**Round 5 correction (repair for review Ref P11, `docs/reviews/f9a-spec-codex-followup4.md`,
confirmed 2026-09-14): round 4's claim above — that nothing in Legs 9–12's
own flow needs React `isConnected` true — is false, and the round-4 design
built on it does not reach Live Preview at all.** `App.tsx:2469`'s
`handleEnterLivePreview` (site 3) hard-gates on `if (!isConnected ||
!wsStatus.connected)` — `isConnected` is the **React** state
(`App.tsx:337`), never touched by the isolated hook, which configures only
`haConnectionService`. Independently reproduced 2026-09-14 by executing the
actual `handleEnterLivePreview` body with the service configured but React
state left at its default `false`: `'Please connect to Home Assistant
first'`, no temp dashboard created. Checking only the Download button and
`handleOpenDashboardBrowser` (round 4's verification) missed the **later**
gate every Leg 9–13 setup must also pass to do anything useful with a
downloaded dashboard. **Fix: `establishKnownSourceDashboard(ctx)` calls
both** the existing, unchanged, shared `appDSL.setConnected(true)` step
(sets React `isConnected`, exactly as Legs 1–8 and the 19 files P10 named
already use it — its contract and every existing caller are untouched) **and**
the isolated hook (configures `haConnectionService`, needed only by the
Dashboard Browser's own check) — not one or the other. This does not reopen
P10: the shared step's behaviour is unchanged, merely called by more tests,
exactly as it always has been.

- A new DSL step, `establishKnownSourceDashboard(ctx)`: calls
  `appDSL.setConnected(true)` (the existing shared step — round-5 fix,
  restoring what round 4 wrongly removed) then
  `window.__testHAConnectionApi.connect({ url: 'http://example.invalid', token: 'test-token' })`
  (the isolated hook — round-4 addition, still needed for the Dashboard
  Browser's separate check), then clicks **`welcome-browse-dashboards`**
  (`data-testid="welcome-browse-dashboards"`, `App.tsx:3192` —
  **round-5 correction, repair for review Ref P11 construction C**: the
  round-4 text named `toolbar-download` (`App.tsx:3290`), but that control
  renders only inside `{config && (...)}` — `App.tsx:3216` — i.e. only once
  a dashboard is already loaded; at the point Legs 9–13 begin, immediately
  after `waitUntilReady()`, `config` is still `null`
  (`src/store/dashboardStore.ts:103`) and no such button exists yet.
  `welcome-browse-dashboards` calls the **identical** `handleOpenDashboardBrowser`
  handler and is present from launch, needing no dashboard preloaded —
  independently confirmed by reading both buttons' `onClick` props
  directly), waits for the Dashboard Browser dialog, clicks "Download" on
  the always-present default **Overview** entry (`DashboardBrowser.tsx:126-135`,
  `DEFAULT_DASHBOARD_ID`), and waits for the dialog to close. This drives
  `handleDashboardDownload` (`App.tsx:2273`) through its real production
  path: `loadDashboard(...)` then `setSourceDashboard({ urlPath: null, title: 'Overview' })`
  (`:2299`, `:2305`) — `urlPath: null` here means the genuine default
  dashboard, a `{ kind: 'known' }` target, not "no source" (see
  `livePreviewDeploy.ts:16-22`'s documented distinction). No custom
  dashboard list, no second dashboard row, and no change to
  `stubLivePreviewIpc`'s existing four channels are needed.
- **Red-before-green proof, scoped narrowly (round 5, repair for review
  Ref P11 construction B).** This project's established RED technique —
  `git stash push -u -- src/` before the implementation lands
  (`drawer_havdm_testing_cd71883212b81299c3bbef76`) — reverts the **whole**
  uncommitted `src/` diff, which would also remove the isolated hook itself
  (new, uncommitted, living in `App.tsx`) along with whichever site-4/site-5
  mechanism a given leg targets. Independently confirmed: executing the two
  `__testThemeApi` registration effects with the isolated hook's own
  `useEffect` omitted (i.e., as it would be under a whole-`src/` revert)
  leaves `window.__testHAConnectionApi` `undefined`, and calling
  `establishKnownSourceDashboard`'s own required first step throws a
  `TypeError` before any download is attempted — an infrastructure crash,
  not a meaningful demonstration that D-5's mechanism is absent. **Fix:**
  for Legs 9, 11 and 12 (the RED-BEFORE-GREEN legs that need their own
  setup to survive a red run), the red proof reverts **only** the specific
  mechanism each leg targets, not all of `src/`: Leg 9/11 revert
  `handleDeployFromLivePreview`'s D-5 re-derive-and-rewrite body (`App.tsx`,
  site 4) to its pre-repair form (no confirm-time read/write at all); Leg 12
  reverts `HADashboardIframe`'s `pendingLayoutWrites` counter and the
  button's widened `disabled` condition to their pre-repair form. The
  isolated hook, `establishKnownSourceDashboard`, `stubDashboardBrowser` and
  every other Legs 9–13 setup step are **never** part of either revert —
  they are test-setup infrastructure, not the mechanism under test, and
  must be present for a leg's own setup to succeed regardless of which
  specific behaviour that leg is proving red. This is a narrower, justified
  departure from the wholesale-stash default, for the same reason site 5's
  review-time check and Leg 10(b)'s "not claimed to pass on base" note are
  each a narrower, justified departure from their own defaults: the naive
  default technique does not fit a leg whose own setup depends on new
  test-only infrastructure introduced by the same diff being tested.
- **Two confirmation dialogs, named precisely (repair for review Ref P8,
  round 3).** Clicking "Deploy to Production" (`HADashboardIframe.tsx:315-319`)
  calls `handleDeploy`, which shows its **own** `Modal.confirm` first
  ("Deploy Dashboard… Continue?", `:226-235`) — independently confirmed by
  reading that handler directly. Only that dialog's `onOk` calls
  `onDeploy`, i.e. `App`'s `handleDeployFromLivePreview` (site 4) — the
  dialog this specification has been calling "the confirmation"
  throughout (`live-preview-deploy-confirm`, `App.tsx:2591`) is the
  **second**, later one. Every leg below that clicks "Deploy to
  Production" therefore also accepts this first, generic dialog (its own
  "Deploy" button) before App's handler runs at all, and every assertion
  about "the confirmation dialog" or "no confirmation dialog is shown"
  means specifically the **second**, `live-preview-deploy-confirm` one —
  the first dialog appearing is expected and unconditional, independent of
  capability state or the repair under test.

9. **Leg 9 (RED-BEFORE-GREEN — site 4, words agree with the freshly-written
   bytes; proves the D-5 repair for Ref P2 at the production path, not only
   at the source-reading level).** Seed the absent-card-mod profile as Leg 7.
   Call `establishKnownSourceDashboard(ctx)` (not "create new") — **round 5:**
   this one step configures both React `isConnected` (via the existing
   shared `setConnected(true)` step) and `haConnectionService` (via the new
   isolated hook, repair for review Ref P8) and drives the download. Enter
   live preview (site 3 writes stripped bytes, using
   the downloaded dashboard's card, as Leg 7 proved for the mechanism).
   Click "Deploy to Production", accept the first, generic confirmation
   ("Deploy Dashboard… Continue?") — with a known source this reaches
   App's own confirmation next, not the ordinary DeployDialog. Assert
   **both**, on the **second** dialog (`live-preview-deploy-confirm`): (a) it shows the adjusted-styling summary
   (`live-preview-deploy-summary`, not "Nothing had to be adjusted"), and (b)
   the `updateTempDashboard` call recorded **at confirm time** (D-5's
   re-derive-and-rewrite step) is also stripped. **Red, proved by reverting
   only `handleDeployFromLivePreview`'s D-5 body** (round-5 repair for
   review Ref P11 construction B — see the "Establishing a KNOWN source
   dashboard" note above; the setup itself is never reverted) — with that
   body reverted, site 4 computes no capability-aware warning and never
   re-sends the temp payload at confirm time at all, so assertion (a) fails
   and assertion (b) fails because no such call is ever recorded to
   inspect. This is the leg
   that would fail against a plausible but wrong repair that re-derives the
   warning text without also re-sending the bytes (D-5's "words and bytes
   from one call" requirement), closing the gap at the production path that
   the source-level D-5 argument alone cannot. Proves AC-1, AC-2 and AC-5 for
   site 4.
10. **Leg 10 (CONTROL — site 4, present case — two assertions with
    DIFFERENT before/after status, stated honestly).** Same known-source
    setup as Leg 9, with `cardModPresent: true`. Click "Deploy to
    Production" and accept the first, generic confirmation, as Leg 9 does.
    **Assertion (a), a genuine regression control, on the second dialog:**
    it shows "Nothing had to be adjusted for Home Assistant" —
    **confirmed passing before and after**, because `sanitizeForHAWithReport(config)`
    with no second argument (today's base behaviour) already produces no
    warnings regardless of `cardModPresent`, so this text is identical
    either way. **Assertion (b), new-mechanism verification, evaluated only
    after the repair:** the confirm-time `updateTempDashboard` call
    (D-5's new re-derive-and-rewrite step) preserves the `card_mod` block.
    **This assertion is NOT claimed to pass on base** — round 1 wrongly
    called it a "before and after" control, but no confirm-time update call
    of any kind exists on base for it to inspect (the same fact that makes
    Leg 9 red). Assertion (b) is this leg's own correctness proof for the
    "present" branch of the brand-new mechanism, paired with Leg 9's
    red-before-green proof for the "absent" branch — together they cover
    both values of `cardModAvailable` at the one new call site. Proves AC-2
    for site 4.
11. **Leg 11 (RED-BEFORE-GREEN — site 4, a failed confirm-time write must
    not show a stale-implying warning — round-2 repair for review Ref P2).**
    Same known-source setup as Leg 9. Stub the confirm-time
    `updateTempDashboard` call specifically (distinguished from site 3's
    earlier call by invocation order, or by a stub option set after
    `enterLivePreview` completes) to resolve `{ success: false, error: 'stub failure' }`.
    Click "Deploy to Production" and accept the first, generic confirmation,
    as Leg 9 does. Assert: the **second** (`live-preview-deploy-confirm`)
    dialog is never shown; an error message naming the failure is shown
    instead. **Red, proved by reverting only `handleDeployFromLivePreview`'s
    D-5 body** (round-5 repair for review Ref P11 construction B, same
    narrowed-revert technique as Leg 9) — with that body reverted there is
    no confirm-time write and no
    corresponding failure handling to trigger this path at all, so the
    error-message assertion fails (nothing is shown). Proves D-5 step 4 (the
    failure-stops-here contract) and closes the "no failure outcome is
    specified" gap the round-1 follow-up review named.
12. **Leg 12 (site 5, the Deploy button — round 3 repair for review Ref P2,
    `docs/reviews/f9a-spec-codex-followup2.md`, replacing round 2's
    IPC-ordering leg, confirmed 2026-09-14).** Round 2's leg asserted IPC
    call _ordering_, which matched the round-2 design (a single tracked
    "latest" promise). That design is withdrawn (see D-5's "Closing the
    pending-writer race" for why — it does not hold under two overlapping
    writes settling out of start order). This leg instead directly proves
    the round-3 replacement: the trigger is disabled while a write is
    pending, for **any** number of overlapping writes in **any** settlement
    order — so there is no ordering left to assert. Same known-source setup
    as Leg 9. Using the same releasable-gate technique as the round-1
    follow-up review's own reproduction (a controllable promise gating
    `haWsIsConnected` inside the stubbed IPC), start **two** overlapping
    layout-drag updates (site 5) and hold **both** connection checks
    pending. Assert the "Deploy to Production" button is disabled while
    either is pending. Release the **second-started** gate first (the
    out-of-order case Codex's counterexample used) and assert the button
    remains disabled — one write is still pending. Release the
    first-started gate and assert the button becomes enabled only once both
    have settled. **Red, proved by reverting only `HADashboardIframe`'s
    `pendingLayoutWrites` counter and the button's widened `disabled`
    condition** (round-5 repair for review Ref P11 construction B, same
    narrowed-revert technique as Leg 9) — with those reverted, the button's
    `disabled` condition never reflects a pending
    write, so it stays enabled throughout and the "disabled while either is
    pending" assertion fails immediately. Proves the round-3 D-5 mechanism
    directly, for the specific out-of-order case that falsified round 2's
    design, not merely the single-writer case round 2's leg covered.
    **Leg 13 — withdrawn, round 5 (declared residual on review Ref P12,
    `docs/reviews/f9a-spec-codex-followup4.md`, confirmed 2026-09-14).** Round
    4 specified a `KNOWN-OPEN:` leg here attempting to pin D-5's declared P2
    residual with an executable test. Codex's fourth follow-up found it does
    not prove what it claimed, on two independent grounds: **(construction A)**
    its own text said the leg should pass "on base," but this project's "base"
    means the state a whole-`src/` revert produces (see the narrowed-revert note
    above) — on that literal base there is no confirm-time `haWsUpdateTempDashboard`
    call at all for the leg's release-condition to ever fire on, so the wait
    never resolves; independently confirmed by executing the actual, unrepaired
    `handleDeployFromLivePreview` body, which reaches its summary dialog with
    zero confirm-time writes. **(construction B)** the leg reused Leg 9's single,
    unchanging absent-card-mod profile for both the confirm-time write and the
    later, delayed drag write — but D-1 requires site 5 to be capability-aware
    too (same `toExportCapabilityOptions(profile)` derivation as every other
    site), so once implemented, both writes derive from the _same_ profile and
    produce _identical_ stripped output; the residual's harmful effect (a
    words/bytes mismatch) is only observable when the two writes see
    **different** capability snapshots, which nothing in Leg 13's design
    arranges. **Owner ruling, 2026-09-14 (round 5): declare this residual
    un-pinned rather than build the new test-only mechanism a correct fix would
    require** (a way to force a genuine mid-session capability-profile change,
    distinct from the isolated connection hook — nothing like it exists in this
    project's offline/headless test suite today, since real HA capture is never
    exercised there). The underlying P2 production risk stays exactly as
    accepted in round 4 (D-5's "Declaring the residual" subsection, above) —
    this withdrawal concerns only whether a test also demonstrates that
    residual, not whether the residual itself is accepted. See AC-17 (§8),
    revised accordingly, and the round 5 dispositions.

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
   Rev 1, Rev 2 and Rev 3.
4. The review's scoped follow-up (Operating Agreement §3.4) confirms the
   claimed closures and its declared radius. **Updated 2026-09-14 (round 3):**
   the round-1 follow-up (`docs/reviews/f9a-spec-codex-followup.md`) ran,
   confirmed four of seven Refs (P1, P3, P6, P7) and found three partially
   resolved (P2, P4, P5) plus two new Refs (P8 SEV 1, P9 SEV 3). The owner
   ruled "continue" (P8/P2/P4/P5) and "accept as-is" (P9); Rev 2 was that
   continuation. **The second follow-up (`docs/reviews/f9a-spec-codex-followup2.md`)
   then reached this section's own recorded trigger below: it found a
   further live defect in the same seam** — round 2's pending-writer fix
   tracked only the most-recently-started write, which Codex's own
   counterexample showed is wrong under two writes settling out of start
   order — plus two test-setup gaps (an unconfigured connection-check
   dependency, and an undistinguished second confirmation dialog) and a
   standing evidence-rigor gap on the P5 unit test. Per this section's own
   trigger, the author brought the owner a **continue / declare-residual /
   park** decision about the seam's design as a whole, not another
   instance patch. **The owner ruled "continue," with a design change:**
   replace the pending-write coordination with disabling the trigger while
   a write is pending, rather than awaiting it. Rev 3 is that continuation.
   **The third follow-up (`docs/reviews/f9a-spec-codex-followup3.md`) then
   fired this section's recorded trigger a SECOND time** — the recorded
   condition for a recurrence, not merely another live finding — confirming
   P5 resolved but finding P2 and P8 still live (SEV 2 each) and a new P10
   (SEV 2): the round-3 button-disable design closes the common case but
   does not revoke a confirmation already shown before an in-progress
   gesture's write is counted (P2); and round 3's own test-only widening of
   the shared `__testThemeApi.setConnected` backdoor was itself incomplete
   (a second, unguarded effect overwrote it) and, if made effective, would
   have changed data-sourcing behaviour for ~19 unrelated existing spec
   files (P8/P10). Per the same trigger, the author brought the owner an
   explicitly recurrence-flagged continue/declare-residual/park brief about
   the seam as a whole. **The owner ruled, on the seam: continue, with a
   narrower repair shape** — fix P8 with a new, isolated test-only
   connection hook used only by the new Dashboard-Browser legs (Legs 9–12),
   touching zero existing tests and making P10 moot by construction (see
   "Establishing a KNOWN source dashboard," round 4) — **and declare P2 a
   documented residual** rather than fund a fourth design iteration on this
   exact mechanism (see D-5's "Declaring the residual — round 4," pinned by
   the new Leg 13, `KNOWN-OPEN:`). The owner also ruled to keep Legs 9–12 as
   e2e coverage rather than descoping them to a review-time check like
   site 5's. Rev 4 is that ruling. **The fourth follow-up
   (`docs/reviews/f9a-spec-codex-followup4.md`) then fired this section's
   recorded trigger a THIRD time** — with two new SEV 1 findings, both in
   the **test infrastructure** rather than the production mechanism: (P11)
   Rev 4's own claim that Legs 9–12 need no React `isConnected` state was
   false — `handleEnterLivePreview` hard-gates on it, so the redesigned
   setup could download a dashboard but never actually enter Live Preview;
   separately, the isolated hook (living in `src/App.tsx`) does not survive
   this project's standard whole-`src/`-revert technique for proving a leg
   red, and the setup's own entry point (`toolbar-download`) does not exist
   before a dashboard is loaded. (P12) Rev 4's own `KNOWN-OPEN:` leg (Leg 13) did not actually pin the P2 residual it was written for: its
   wait-condition targeted an event absent from the literal reverted
   baseline, and its single unchanging profile snapshot could not produce
   the residual's defining words/bytes mismatch once site 5 becomes
   capability-aware. Codex's own verdict: the verification mechanism needs
   a coherent repair; the production write-counter and the owner's accepted
   P2 residual remain sound and are not reopened. **The owner ruled: continue
   and fix P11's setup bugs** (all three constructions are bounded,
   well-understood corrections, none requiring new test machinery) **and
   declare P12's Leg 13 a withdrawn, un-pinned residual** rather than build
   the new mid-session profile-change mechanism a correct pin would need.
   The owner also declined, again, to descope sites 3/4 to a review-time
   check — the third time this question has been asked, given the mounting
   evidence, and answered the same way. Rev 5 is that ruling. Whether this
   fifth pass fully closes what remains live in this seam is for the
   **next** scoped follow-up to confirm — item 4 remains **pending** until
   that round returns with no further live finding in this seam.
5. The owner signs off on this specification and it is landed on `main` —
   pending as of this revision.

Items 1–3 are met by this revision; items 4–5 are the remaining steps before
the specification itself is Done. This is a criterion for the **document**;
the **product's** DoD (#159's own, unchanged) is met only once the
implementation built from this specification is reviewed and accepted.
⚠ **This same-seam trigger (`OPERATING_AGREEMENT.md` §3.4's same-seam rule)
has now fired THREE TIMES on one mechanism (site 4's confirm-time flow and
its Dashboard-Browser test setup) across five external review rounds.**
First firing (Rev 3): round 1 fixed the referential-stability race but did
not sweep its own new mechanism's failure path, the pending-writer race, or
the route it actually reaches (three gaps, closed in Rev 2); Rev 2's OWN
pending-writer fix then proved wrong under out-of-order completion, closed
in Rev 3 with a design change (disable, don't await). Second firing (Rev
4): Rev 3's own design left the already-issued-confirmation window open
(P2, declared residual) and Rev 3's own test-only fix was both incomplete
and over-reaching (P8/P10, closed with a narrower, isolated hook). Third
firing (this Rev 5): Rev 4's own verification of its own narrower hook was
itself incomplete (P11 — a missing React-state step, an untested
red-before-green interaction with the new hook, and a wrong entry-point
button) and Rev 4's own residual pin did not pin what it claimed (P12,
withdrawn). **Note the shift across these three firings: the first two each
required a change to the PRODUCTION mechanism's design; this third one
required no change to production code at all — every defect was in the
TEST SETUP surrounding an already-accepted production design.** This is
itself useful information: it suggests the underlying site-4/site-5
production mechanism (the pending-write counter, the button-disable gate,
D-5's re-derive-and-rewrite) has stabilised, and the residual difficulty has
moved to reliably exercising it from outside. **If a further scoped
follow-up finds a further live defect in this same seam, that is a FOURTH
occurrence of this trigger**, and the author will say plainly whether, given
that the last occurrence was purely a test-infrastructure problem, continued
investment in e2e coverage for sites 3/4 (as opposed to the review-time
verification site 5 already uses) is still proportionate — a question this
round's brief asked and the owner declined for the third time, but which a
fourth occurrence would put to the owner with a materially different cost
argument than any of the first three askings carried.

## 11. Revision History & Amendments

| Date       | Rev | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | By              |
| ---------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 2026-09-12 | 0   | Draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Claude Sonnet 5 |
| 2026-09-13 | 1   | Bundled repair for all seven findings in Codex's independent specification review (`docs/reviews/f9a-spec-codex-review.md`), per owner ruling to fix all seven now (`docs/reviews/f9a-spec-repair-dispositions.md`): replaced the disproven "no existing harness" premise and added real e2e coverage for sites 3/4, with site 5 narrowed to a justified review-time check (P1); replaced D-5's disproven referential-stability guarantee with an active re-derive-and-rewrite mechanism at site 4 (P2); added legacy-profile normalization on read (D-2a, P3); corrected Leg 4's claim and added an actual-disconnect Leg 5 (P4); extracted the site-1 memo into a testable, profile-aware hook (D-5a, P5); added this specification's own Definition of Done (§10.1, P6); narrowed AC-13/Leg 6's claim to the context-initialization property it actually tests (P7). No requirement was added beyond closing these seven findings; the locked brief and the cost stop-rule are unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Claude Sonnet 5 |
| 2026-09-14 | 2   | Scoped follow-up (`docs/reviews/f9a-spec-codex-followup.md`) confirmed P1/P3/P6/P7, found P2/P4/P5 partially resolved and two new findings (P8 SEV 1, P9 SEV 3). Per owner ruling to continue on P8/P2/P4/P5 and accept P9 as-is (`docs/reviews/f9a-spec-repair-dispositions.md` Round 2): redesigned Legs 9–10 and added Legs 11–12 to reach site 4's actual confirmation route via a known (HA-downloaded) source dashboard rather than a new one, and to honestly separate a genuine before/after control from new-mechanism-only verification (P8); extended D-5 with a confirm-time write-failure stop and a `pendingLayoutWriteRef` coordination step closing the site-5 pending-writer race, with new Legs 11–12 proving both (P2); added an independent on-disk read assertion to Leg 5 via a new `readCapabilityProfile` helper, closing the cached-context blind spot (P4); added an independent `capturedAt`-only transition case to the `useDeployReport` unit test plan (P5); corrected `overrides` to `userOverrides` and the `getProfile()` caller inventory throughout (P9, accepted as-is per the owner, correction bundled in since the area was already being edited). No requirement was added beyond closing these five findings; the locked brief and the cost stop-rule are unchanged — the new `pendingLayoutWriteRef`/`onLayoutWriteSettled` mechanism is ordinary callback threading between the two components already on the five call sites' path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Claude Sonnet 5 |
| 2026-09-14 | 3   | Second scoped follow-up (`docs/reviews/f9a-spec-codex-followup2.md`) confirmed P4/P9, found P2/P5/P8 partially resolved, and confirmed the round-1 SEV 1 stays resolved. This reached §10.1's own recorded same-seam trigger — a further live defect in site 4's confirm-time seam — so the author brought the owner a continue/declare-residual/park brief about the seam's design as a whole, per `OPERATING_AGREEMENT.md` §3.4. Owner ruled **continue, with a design change**: replace round 2's `pendingLayoutWriteRef` (tracks only the most-recently-started write; disproven by an out-of-order-completion counterexample) with disabling the "Deploy to Production" button while any layout write is pending, tracked by a local count in `HADashboardIframe` — correct for any number of overlapping writes in any settlement order, and simpler (no cross-component prop) than what it replaces (P2). Fixed two test-setup gaps in the replacement site-4 legs: widened the existing `__testThemeApi.setConnected` test backdoor to also configure `haConnectionService`, which the Dashboard Browser's own connection check requires and the backdoor previously left unset; and named the two stacked confirmation dialogs precisely so every leg's assertions target the correct one (P8). Replaced the P5 unit test's citation-only "old array excludes these fields" claim with an executed negative control — a deliberately-wrong sibling hook, built from the pre-repair dependency array, run against the same transition cases and asserted to fail them (P5). Redesigned Leg 12 to prove the button-disable mechanism directly, for two overlapping writes settling out of order, replacing round 2's now-superseded IPC-ordering leg. No requirement was added beyond closing these three findings; the locked brief and the cost stop-rule are unchanged — the replacement mechanism removes cross-component wiring rather than adding it.                                                                                                                                                                                       | Claude Sonnet 5 |
| 2026-09-14 | 4   | Third scoped follow-up (`docs/reviews/f9a-spec-codex-followup3.md`) confirmed P5 resolved, found P2/P8 still partially resolved, and raised new P10 — round 3's own test-only widening was itself incomplete (a second, unguarded `App.tsx` effect overwrote it) and, if made effective, would have changed data-sourcing behaviour for ~19 unrelated existing spec files. This fired §10.1's same-seam trigger a **second** time, so the author brought the owner an explicitly recurrence-flagged continue/declare-residual/park brief about the seam as a whole, per `OPERATING_AGREEMENT.md` §3.4. **Owner ruled, on the seam: continue with a narrower repair shape, and declare a residual.** For P8: withdrew round 3's plan to widen the shared `__testThemeApi.setConnected` backdoor; added instead a new, isolated test-only hook (`window.__testHAConnectionApi`), registered in its own `useEffect` and used only by the new Dashboard-Browser legs (Legs 9–12) — touching zero existing tests, resolving both P8 constructions (the hook cannot be overwritten by `__testThemeApi`'s two registrations, and the new `stubDashboardBrowser` helper now also stubs `ha:ws:connect`), and making P10 moot by construction since nothing shared changes. For P2: declared the already-issued-confirmation window a documented residual rather than a fourth design iteration on this mechanism — pinned by new Leg 13 (`KNOWN-OPEN:`, §9) and AC-17 (§8), per D-5's new "Declaring the residual" subsection. Owner also ruled to keep Legs 9–12 as e2e coverage rather than switching sites 3/4 to a review-time check like site 5's. No requirement was added beyond dispositioning these three findings; the locked brief and the cost stop-rule are unchanged — the isolated hook is strictly narrower-scoped than round 3's shared-backdoor widening, not an addition to it.                                                                                                                                                                                                                                                               | Claude Sonnet 5 |
| 2026-09-14 | 5   | Fourth scoped follow-up (`docs/reviews/f9a-spec-codex-followup4.md`) found round 4's own verification incomplete on both fronts it touched: new P11 (SEV 1) — Rev 4's claim that Legs 9–12 need no React `isConnected` state was false (`handleEnterLivePreview` hard-gates on it), the isolated hook does not survive this project's whole-`src/`-revert red-before-green technique, and the setup's entry-point button does not exist before a dashboard loads; new P12 (SEV 1) — Rev 4's `KNOWN-OPEN:` Leg 13 did not pin the P2 residual it was written for (its wait-condition targeted a nonexistent baseline event, and its single-profile design could not produce an observable words/bytes mismatch). This fired §10.1's same-seam trigger a **third** time; unlike the first two firings, both findings were in the test infrastructure, not the production mechanism, which Codex's own review confirmed remains sound. Per the same trigger, the author brought the owner an explicitly third-occurrence-flagged brief. **Owner ruled: continue and fix P11's setup bugs, and declare P12's Leg 13 a withdrawn, un-pinned residual.** For P11: `establishKnownSourceDashboard` now calls both the existing shared `appDSL.setConnected(true)` step (restoring React state, wrongly dropped in round 4) and the isolated hook; switched its entry point from `toolbar-download` (config-gated, absent at launch) to the always-available `welcome-browse-dashboards`; narrowed Legs 9/11/12's red-before-green proof to revert only the specific site-4/site-5 mechanism each targets, never the isolated hook or setup infrastructure. For P12: withdrew Leg 13 rather than build the new mid-session capability-profile-change mechanism a correct pin would require; the underlying P2 residual stays accepted exactly as in Rev 4, now documented in prose only (D-5, AC-17). Owner declined, for the third time, to descope sites 3/4 to a review-time check. No requirement was added beyond dispositioning these two findings; no production code changed — every fix is in the test-support/DSL layer or the reproduction technique. | Claude Sonnet 5 |
