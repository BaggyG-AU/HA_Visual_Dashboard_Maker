# F9a specification — repair dispositions

**Author:** Claude Sonnet 5 — spec authoring from a locked brief
(`docs/governance/OPERATING_AGREEMENT.md` §3.6). Author of the reviewed
specification, `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md`.
**Reviewer:** OpenAI Codex / GPT-6 Astra — author of the review these rows
answer, `docs/reviews/f9a-spec-codex-review.md` (commit `901e576`).
**Owner gate:** micah / BaggyG-AU ruled on all seven findings on 2026-09-13
before any repair was committed (`OPERATING_AGREEMENT.md` §3.4, the
fix-or-defer decision). The row below records that ruling; it is not the
author's choice.

Governed by `docs/governance/OPERATING_AGREEMENT.md` §3.4. One dated section
per round, appended, never rewritten.

---

## Round 1 — 2026-09-13

Review: `docs/reviews/f9a-spec-codex-review.md` (commit `901e576`), verdict
**BLOCKED-ON: §9 deployment-path coverage decision**. Seven findings: P1 SEV
1, P2–P6 SEV 2, P7 SEV 3. Codex recommended "Fix now" for all seven and "No
architectural pivot".

**Every finding was independently verified against source before it was
dispositioned** (`drawer_practice_review_a3322e04df1dd99086c18336`: "a
finding is a HYPOTHESIS, not a defect report"). All seven were confirmed
correct — none were false alarms. Verification performed:

- **P1:** read `tests/e2e/live-preview-deploy.spec.ts:21-49` (`stubLivePreviewIpc`)
  and `:243-289`, `:362-391`, `:393-413` directly — the harness and the three
  substantive tests the spec's premise denied exist do exist. Independently
  re-ran `grep -n "TODO" tests/e2e/live-preview-deploy.spec.ts` → 79 lines
  (the spec's own cited command claimed 12). Independently re-ran the
  review's headless witness: `bash tools/test-headless.sh tests/e2e/live-preview-deploy.spec.ts --project=electron-e2e --workers=1 --grep 'shows the preview address where no card can cover it'`
  → **1 passed, 15.1s** (log: this session's tool output, 2026-09-13).
- **P2:** read `App.tsx:2089-2149` (`handleConnect`, `captureCapabilityProfile`)
  and `:2461-2488` (`handleEnterLivePreview`) directly — the fire-and-forget
  capture and the connection-only preview-entry check are as the review
  describes. Independently re-ran the review's controlled-interleaving probe
  against the actual `handleConnect`/`captureCapabilityProfile`/`handleEnterLivePreview`
  bodies → observed `connected=true, capture pending, temp bytes written,
preview active=true, profile refreshed` (same order the review reported).
- **P3:** read `capabilityProfileService.ts:29-41` and
  `CapabilityProfileContext.tsx:51-60` directly. Read
  `node_modules/conf/dist/source/index.js:591` directly — confirmed the
  single top-level shallow `Object.assign(createPlainObject(), options.defaults ?? {}, fileStore)`.
  Independently re-ran the review's profile-upgrade probe →
  `{ existingHasField: false, valueType: 'undefined' }` /
  `{ freshHasField: true, value: false }` (same result the review reported).
- **P4:** read `App.tsx:2232-2239` (`handleDisconnect`) and
  `haWebSocketService.ts:338-344` (`close()`) directly — disconnect does not
  touch the persisted profile; only the live WebSocket service's own
  `haVersion` is cleared. Confirmed the spec's Leg 4 never calls
  `handleDisconnect`.
- **P5:** read `App.tsx:425-428` directly — the `deployReport` `useMemo`
  dependency array is exactly `[deployDialogVisible, config]`, confirmed to
  exclude `profile`.
- **P6:** read spec `:100-104` (§3) and the whole of §10 directly — §10
  contained only the e2e proportionality note, no specification-level
  completion statement.
- **P7:** read spec `:487-491` (AC-13) and `:597-606` (the KNOWN-OPEN leg
  description) directly — the leg asserts only the context's default state,
  not export/deploy-action behaviour, while claiming to prove AC-13 without
  qualification.

**Owner ruling, 2026-09-13, by decision brief covering all seven Refs at
once** (`OPERATING_AGREEMENT.md` §3.4's per-finding requirement satisfied by
one bundled brief and one bundled ruling, consistent with the review-loop
trial's "keep it simple" step 4 and the owner's 2026-09-12 instruction to do
so): the owner selected **"Fix all seven now"** — the option recommended
first, matching Codex's own recommendation and the author's independent
agreement stated in the same brief. P1 is SEV 1 and was never a
fix-or-defer choice (§3.4: a SEV 1 leaves OPEN only as RESOLVED or by a
recorded owner acceptance of the residual); the owner's ruling resolves it.
No finding was deferred or accepted as residual.

| Ref | Severity | Owner ruling                       | Disposition  | Repair                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Blast radius                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | -------- | ---------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | SEV 1    | Not a choice — SEV 1 must resolve  | **RESOLVED** | §9's false "no existing harness" premise is withdrawn (verified: the harness and three passing tests exist and one was independently re-run). §3's Finding Coverage table, §9 and §11 are corrected. Sites 3 and 4 gain real e2e Legs 7–10 in `tests/e2e/live-preview-deploy.spec.ts`, reusing and extending `stubLivePreviewIpc`. Site 1 is unit-covered (`DeployDialog.spec.tsx` + new `useDeployReport.spec.ts`, P5's repair). Site 5 keeps a narrower, explicitly justified review-time `path:line` check (no live-preview drag-simulation harness exists to build one proportionately) — see spec §9's note. #159 criterion 5 moves from "Partial" to "Covered".                                                                                                                      | **Upstream:** none — the locked brief and the five call sites are unchanged; this closes a documentation/test-plan defect, not a design change. **Downstream:** Codex's implementation (which now has real e2e legs to build against instead of none) and the scoped follow-up review, which must independently verify the radius declaration above (§3.4). No `src/` change; the cost stop-rule is not touched (no new provider, global, or off-path parameter).                                                                                                 |
| P2  | SEV 2    | **Fix now** (agreed with reviewer) | **RESOLVED** | D-5 is revised (not merely amended — the original "profile is referentially stable across a live-preview session" claim is withdrawn as disproven, with the original text kept, struck through, for a legible record). Site 4 (`handleDeployFromLivePreview`) now re-derives `toExportCapabilityOptions(profile)` and re-runs `sanitizeForHAWithReport` at confirm-click time, re-sends the result to the existing `haWsUpdateTempDashboard` channel, and computes the confirmation warning from that same call — words and bytes now come from one call at one instant, never a value read earlier in the session. AC-1, AC-2 and AC-5 are revised to match; new e2e Leg 9 (red-before-green) and Leg 10 (control) prove it at the production path, not only at the source-reading level. | **Upstream:** none — reuses the existing `ha:ws:updateTempDashboard` IPC channel already used by site 5; no new channel, provider or global. **Downstream:** site 4's handler body only (`App.tsx:2580` area); the confirm dialog's existing testids/copy are explicitly preserved (must-not-change). Codex's implementation and the scoped follow-up, which must confirm the re-derive-and-rewrite mechanism is what was actually built, not a narrower fix that only changes the displayed text.                                                                |
| P3  | SEV 2    | **Fix now** (agreed with reviewer) | **RESOLVED** | New D-2a: `capabilityProfileService.getProfile()` normalizes the stored object against `defaultCapabilityProfile()` on read (`{ ...defaultCapabilityProfile(), ...stored }`), so a profile persisted before `layoutCardPresent` existed gets the field's permissive default while every already-captured field is preserved verbatim. New unit test file `tests/unit/capabilityProfileService.spec.ts` (AC-15) proves it against a fixture missing the field, a fixture with it already present, and no store file at all.                                                                                                                                                                                                                                                                 | **Upstream:** none — the fix is confined to the existing `getProfile()` read method; no migration step, schema version, or new persistence mechanism is added (explicit must-not-change). **Downstream:** every existing caller of `getProfile()` (`saveProfile`, `setOverride`, `clearProfile`, the `capability:*` IPC handlers in `main.ts`) now sees a complete object with no code change of their own required. Codex's implementation and the scoped follow-up, which should confirm no caller assumed the previously-missing field would be absent.        |
| P4  | SEV 2    | **Fix now** (agreed with reviewer) | **RESOLVED** | Leg 4's claim is corrected — it proves D-3's `capturedAt`-based discriminator only, and explicitly does **not** prove AC-4 since it never invokes `handleDisconnect`. New Leg 5 (red-before-green) performs an actual disconnect through `handleDisconnect` against stubbed external IPC, using a non-null captured `haVersion` (to also catch conflation of the live WebSocket version with the persisted profile's), then exports and asserts the persisted profile survived the real disconnect call. AC-4 now cites Leg 5, not Leg 4, as its proof.                                                                                                                                                                                                                                    | **Upstream:** none — `handleDisconnect`'s existing behaviour (verified unchanged: it does not touch `capabilityProfileService`) is exercised, not altered. **Downstream:** the e2e file's leg numbering (renumbered 1–10, consistently updated throughout the document) and the Finding Coverage table's citations for #159 criterion 3 and brief R1. Codex's implementation and the scoped follow-up, which should confirm Leg 5 actually invokes the disconnect UI action, not a re-seeded approximation of its result.                                         |
| P5  | SEV 2    | **Fix now** (agreed with reviewer) | **RESOLVED** | New D-5a: the ordinary (non-live-preview) Deploy dialog's report, previously an inline `useMemo` at `App.tsx:425-428` with dependencies `[deployDialogVisible, config]` (confirmed to exclude `profile`), is extracted into a new hook `useDeployReport(deployDialogVisible, config, profile)` (`src/hooks/useDeployReport.ts`) with dependencies `[deployDialogVisible, config, profile.cardModPresent, profile.capturedAt]`. `App.tsx:425` calls the hook in place of the inline memo. New unit test `tests/unit/useDeployReport.spec.ts` uses the project's existing `renderHook` pattern (already used by `tests/unit/useRecentColors.spec.ts`) to prove recomputation on profile change and memoization preservation otherwise (AC-16).                                               | **Upstream:** none — the extraction is behaviour-preserving except for the two added dependencies; the returned shape and the `deployDialogVisible && config` lazy-computation gate are explicit must-not-changes. **Downstream:** site 1's own call site only; `src/hooks/` is an established existing convention (`useRecentColors.ts`), so no new directory or pattern is introduced. Codex's implementation and the scoped follow-up, which should confirm the hook is actually called at `App.tsx:425` and not left dead alongside the original inline memo. |
| P6  | SEV 2    | **Fix now** (agreed with reviewer) | **RESOLVED** | New §10.1 states this specification's own Definition of Done: design decisions settled (met), acceptance criteria and test matrix specific enough to implement without further judgement calls (met), independent review run and findings ruled (met — this file), scoped follow-up confirming closures (pending), owner sign-off and landing (pending). §3's Finding Coverage table's placeholder "— until §11 maps" pointer (repeated on all thirteen rows) is corrected to `#159` throughout, since §11 is a plain changelog and never "mapped" anything.                                                                                                                                                                                                                               | **Upstream:** none — restates existing, unchanged facts (#159's DoD, the trial adoption record) rather than creating a new process requirement; the governance pause is not touched (no new rule, gate, checker, template section or ledger). **Downstream:** the owner's sign-off step, which now has an explicit checklist to close against; the scoped follow-up commission, which quotes this section.                                                                                                                                                        |
| P7  | SEV 3    | **Fix now** (agreed with reviewer) | **RESOLVED** | AC-13 and the KNOWN-OPEN leg (renumbered Leg 6) are both reworded to claim only what they test: that `useCapabilityProfile()` itself returns the permissive default before the provider's mount effect resolves. Both now state explicitly that an export/deploy action's behaviour in that window is not demonstrated by this criterion or leg, and remains the D-6 accepted, undemonstrated limitation.                                                                                                                                                                                                                                                                                                                                                                                  | **Upstream:** none — D-6's decision (no special boot-window handling) is unchanged; this is a wording-accuracy repair with no behaviour change, per Codex's own classification. **Downstream:** none beyond the two passages corrected — the review's own P6 note states this correction "does not raise this finding's grade" and needs no further reach.                                                                                                                                                                                                        |

### What this round did NOT establish

- No `src/` or test code was written or executed by this repair. The
  specification describes the mechanism and the tests Codex is to build; the
  probes and the headless test re-run above are **verification of the
  review's own findings against the current source**, not an implementation
  of the repair.
- The re-derive-and-rewrite mechanism for P2/site 4, the `getProfile()`
  normalization for P3, and the `useDeployReport` extraction for P5 are
  design decisions this specification now mandates precisely enough to
  implement and test — they have not themselves been built or run.
- Whether the existing `.react-grid-layout` drag DSL (`tests/support/dsl/canvas.ts`)
  is directly reusable against the live-preview overlay (relevant to site
  5's residual review-time check) remains **unconfirmed** — the spec says so
  explicitly rather than assuming it.

### Follow-up owed

Seven repairs exist across two design decisions revised (D-5, D-5a new) and
one new (D-2a), so **§3.4 applies: a scoped follow-up by the same reviewer**
(OpenAI Codex / GPT-6 Astra), scope = this repair diff **plus the declared
blast radius above**, confirming the claimed closures, sweeping the repair
for introduced defects, and independently verifying the radius declaration —
a wrong or missing radius is itself a finding. Commissioned separately in
`prompts/codex/f9a-spec-review-followup.md`.

---

## Round 2 — 2026-09-14

Follow-up: `docs/reviews/f9a-spec-codex-followup.md` (commit `fd77973`),
verdict **BLOCKED-ON: §9 site-4 test plan**. Closures confirmed by the
reviewer: **P1, P3, P6, P7 RESOLVED**. Live: **P2 PARTIALLY RESOLVED (SEV 2)**,
**P4 PARTIALLY RESOLVED (SEV 2)**, **P5 PARTIALLY RESOLVED (SEV 2)**, and two
new findings: **P8 (SEV 1)** — the replacement site-4 test plan requires an
impossible passing control and omits a route prerequisite — and **P9 (SEV 3)**
— the repair's field names and reader inventory for legacy-profile
normalization do not match the source.

**Every live and new finding was independently verified against source
before it was dispositioned.** All five were confirmed correct.
Verification performed:

- **P8:** read `App.tsx:2533-2561` directly — confirmed
  `resolveLivePreviewDeployTarget(null)` returns `{ kind: 'unknown' }` and
  the `if (target.kind === 'unknown')` branch exits live preview and opens
  the ordinary DeployDialog, never reaching site 4's confirmation. Read
  `livePreviewDeploy.ts:33-50` directly, confirming this routing logic and
  the `null → 'unknown'` mapping. Confirmed round 1's Legs 9–10 reused Leg
  7's "create new dashboard" setup, which yields `sourceDashboard === null`.
  Confirmed via direct code inspection that the pre-repair
  `handleDeployFromLivePreview` performs no `updateTempDashboard` call at
  all between sanitizing (`:2580`) and showing the confirmation, so Leg 10's
  claim that inspecting such a call "passes on base" cannot be evaluated,
  let alone pass.
- **P2 (remainder):** read `src/main.ts:641-651` directly — confirmed
  `ha:ws:updateTempDashboard`'s handler can resolve `{ success: false, error }`
  on failure, and the round-1 repair's D-5 steps did not specify checking
  this result before proceeding. Read `HADashboardIframe.tsx:153-207`
  directly — confirmed site 5 `await`s a connection check (`:161`) before
  computing and sending its own update, and checks its own IPC result
  (`:205-207`) — confirming a write already in flight when the user clicks
  deploy can resolve after site 4's confirm-time rewrite, with no
  coordination between the two in round 1's design.
- **P4 (remainder):** read `CapabilityProfileContext.tsx:51-64` directly
  (already read in round 1) — confirmed the context reads the persisted
  profile once at mount and again only via an explicit `refresh()` call,
  which `handleDisconnect` never makes. Confirmed Leg 5's export-based
  assertion (round 1) reads the app's cached context value, not the
  on-disk file, so a hypothetical regression that reset only the on-disk
  file without touching the already-mounted context's cached state would
  pass Leg 5 undetected.
- **P5 (remainder):** read the round-1 spec text for
  `tests/unit/useDeployReport.spec.ts` directly — confirmed it varies only
  `cardModPresent` across its two profiles and never independently varies
  `capturedAt`, so a hook dependency array missing `capturedAt` (but keeping
  `cardModPresent`) would pass every case in the round-1 plan while missing
  the default-to-captured-absent transition D-3 exists to catch.
- **P9:** read `capabilityProfile.ts:37-38` directly — confirmed the actual
  field name is `userOverrides`, not `overrides` as used throughout the
  round-1 repair. Read `capabilityProfileService.ts:44,56` directly —
  confirmed `saveProfile` and `clearProfile` only call `this.store.set(...)`
  and never call `getProfile()`, so round 1's dispositions row and the
  spec's D-2a text mischaracterized them as `getProfile()` callers.

**Owner ruling, 2026-09-14, by decision brief covering the live and new
Refs at once:** the owner selected **"Continue — fix P8, P2, P4, P5 now;
accept P9's wording note"** — the option recommended first, matching
Codex's own recommendation and the author's independent agreement stated in
the same brief.

| Ref | Severity | Owner ruling                          | Disposition  | Repair                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Blast radius                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | -------- | ------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P8  | SEV 1    | **Continue** (fix now)                | **RESOLVED** | Legs 9–10 are redesigned to reach site 4 via a real HA-downloaded ("known") source dashboard, using a new `establishKnownSourceDashboard(ctx)` DSL step and a new `stubDashboardBrowser(ctx)` IPC stub (both test-only additions; no `src/` change). Leg 10's two assertions are honestly separated: the existing-behaviour warning-text check is a genuine before/after control; the new-mechanism byte-preservation check is stated as evaluated only after the repair, not claimed to pass on base. New Legs 11–12 (below) cover the failure and pending-writer cases the route fix exposed as also needing evidence. | **Upstream:** none — `resolveLivePreviewDeployTarget` and the existing Dashboard Browser download path are unchanged; the fix uses them as they already exist. **Downstream:** Legs 9–12 collectively, which now share one setup helper; Codex's implementation and the next scoped follow-up, which should confirm the known-source setup actually reaches the confirmation route (not just that it compiles). |
| P2  | SEV 2    | **Continue** (fix now)                | **RESOLVED** | D-5 gains two more steps: (0) `await pendingLayoutWriteRef.current` before doing anything else, closing the pending-writer race; (4) on a failed confirm-time write, show an error and stop before opening the confirmation dialog. New prop `onLayoutWriteSettled` on `HADashboardIframe`, new ref `pendingLayoutWriteRef` in `App`. New Leg 11 (write-failure) and Leg 12 (pending-writer ordering) prove both directly.                                                                                                                                                                                               | **Upstream:** none — reuses site 5's existing success/failure contract (`HADashboardIframe.tsx:205-207`) unchanged; no new provider/global. **Downstream:** site 4's handler body and the one new prop on `HADashboardIframe`; Codex's implementation and the next scoped follow-up, which should confirm the ref is updated on _every_ layout write, not only the first.                                       |
| P4  | SEV 2    | **Continue** (fix now)                | **RESOLVED** | Leg 5 gains a second, independent assertion: a new DSL helper `readCapabilityProfile(userDataDir)` reads the on-disk store file directly after the real disconnect action, asserting the persisted `capturedAt`/`haVersion`/`cardModPresent` survived — independent of whatever the app's `CapabilityProfileContext` has cached in memory.                                                                                                                                                                                                                                                                               | **Upstream:** none — reads the same file `seedCapabilityProfile` already writes; no change to `capabilityProfileService.ts` or `CapabilityProfileContext.tsx`. **Downstream:** Leg 5 only; the next scoped follow-up should confirm the new read genuinely bypasses the app's cache rather than incidentally reading a value the app itself just wrote.                                                         |
| P5  | SEV 2    | **Continue** (fix now)                | **RESOLVED** | The `useDeployReport.spec.ts` unit-test plan gains a third case, independently varying `capturedAt` (default → captured-absent) with `cardModPresent` held at `false` throughout, proving the hook would fail this case if its dependency array were missing `capturedAt` alone. AC-16 reworded to require both fields tested independently, not just named in the dependency array.                                                                                                                                                                                                                                     | **Upstream:** none — the `useDeployReport` design (D-5a) itself is unchanged; only its test plan gains a case. **Downstream:** the unit-test file table row and AC-16 only.                                                                                                                                                                                                                                     |
| P9  | SEV 3    | **Accept as-is** (correction bundled) | **RESOLVED** | `overrides` corrected to `userOverrides` throughout the spec (D-2a, AC-15, the unit-test bullet). D-2a's claim that `saveProfile`/`clearProfile` call `getProfile()` is corrected — they are writers; `setOverride` and the `capability:*` IPC handlers are the actual readers. No behaviour changes; this is wording accuracy only, bundled into this round since the same area was already being edited for P2/P4/P5.                                                                                                                                                                                                  | **Upstream:** none. **Downstream:** none beyond the corrected passages — the normalization expression itself (already verified to preserve `userOverrides`, round 1) is unchanged.                                                                                                                                                                                                                              |

### What this round did NOT establish

- No `src/` or test code was written or executed. The new
  `pendingLayoutWriteRef`/`onLayoutWriteSettled` mechanism, the
  `establishKnownSourceDashboard`/`stubDashboardBrowser` test helpers, and
  the on-disk `readCapabilityProfile` helper are design decisions this
  specification now mandates — they have not themselves been built or run.
- Whether this round's redesign of Legs 9–12 is itself free of the same
  class of defect (an untested assumption about what a "before/after"
  control can validly claim, or about which route a test setup actually
  reaches) is exactly what the next scoped follow-up must independently
  verify, not assume from this round's own account.
- **Round count note, stated plainly for the owner:** this is the **second**
  round of findings on the same seam (site 4's confirm-time mechanism —
  P2 and now P8 both concern it). Per `OPERATING_AGREEMENT.md` §3.4's
  same-seam rule, a third round finding a **new** defect in this same seam
  — as opposed to confirming this round's closures — would be the signal to
  bring the owner a continue/residual/park choice about the seam's design
  as a whole, not to keep patching instance by instance. This is recorded
  here so the trigger is explicit before it is reached, not decided after.

### Follow-up owed

Five repairs exist this round (P8, P2, P4, P5, P9), so **§3.4 applies again:
a scoped follow-up by the same reviewer** (OpenAI Codex / GPT-6 Astra),
scope = this round's repair diff **plus its declared blast radius above**,
confirming the claimed closures, sweeping for introduced defects, and
independently verifying the radius declaration.

---

## Round 3 — 2026-09-14

Second follow-up: `docs/reviews/f9a-spec-codex-followup2.md` (commit
`2b5f174`), verdict **CLEAR-WITH-FINDINGS** (no SEV 1 — round 2's SEV 1
closure of P8 holds). Closures confirmed by the reviewer: **P4, P9
RESOLVED**. Live: **P2, P5, P8 PARTIALLY RESOLVED (SEV 2 each)**. No new Ref
this round.

**Every live finding was independently verified against source before it
was dispositioned.** All three were confirmed correct.

- **P2 (the "latest-only wait" counterexample):** confirmed by re-reading
  the round-2 design (`pendingLayoutWriteRef`, a single ref replaced on
  every new invocation) and reasoning through it directly: if two writes
  are started close together and the **first**-started one resolves
  **after** the second (async I/O completion order is not guaranteed to
  match start order), the ref has already been overwritten by the second
  write's promise, so `await pendingLayoutWriteRef.current` never waits for
  the first at all. Independently executed the follow-up review's own
  embedded reproduction, observing the exact reported sequence:
  `['layout x=4 / 6', 'confirm stripped', 'layout x=1 / 3']` — the
  confirm-time rewrite is followed by an older write overwriting it.
- **P8, construction A (connection prerequisite):** read
  `haConnectionService.ts:73-75` directly — `isConnected()` returns
  `this.config !== null`, set only via `setConfig(...)`. Read
  `App.tsx:569-571` directly — the existing `__testThemeApi.setConnected`
  test backdoor calls only `setIsConnected(connected)` (React state), never
  `haConnectionService.setConfig(...)`. Read `DashboardBrowser.tsx:97-100`
  directly — `loadDashboards()` checks `haConnectionService.isConnected()`
  first and returns immediately if false. Confirmed: the existing "connect"
  step used throughout Legs 1–12 does not configure the piece of state the
  Dashboard Browser actually checks, so the round-2 Legs 9–12 would never
  reach the dashboard list at all.
- **P8, construction B (two confirmation dialogs):** read
  `HADashboardIframe.tsx:226-235` directly — clicking "Deploy to
  Production" calls `handleDeploy`, which shows its **own** `Modal.confirm`
  ("Deploy Dashboard… Continue?") first; only that dialog's `onOk` calls
  `onDeploy` (App's `handleDeployFromLivePreview`, site 4). Confirmed the
  round-2 legs' "Click 'Deploy to Production'" step was ambiguous about
  which of the two stacked dialogs each assertion targeted.
- **P5 (evidence rigor):** re-read the round-2 spec text — confirmed it
  still said "Proven RED" while explicitly defining that as "direct
  quotation, not an executed red run." Confirmed the technique needed to
  close this gap is feasible: the follow-up review's own reproduction
  executed the actual pre-repair inline `deployReport` expression via
  `renderHook`, observing exactly one sanitizer call across two independent
  profile changes — i.e., a wrong-dependency-array sibling hook's failure
  to recompute is directly reproducible, not hypothetical.

**This round reached §10.1's own recorded trigger.** Per
`OPERATING_AGREEMENT.md` §3.4's same-seam rule and Round 2's own recorded
note (a third round finding a _new_ defect in the site-4 confirm-time seam
is the signal to bring the owner a continue/declare-residual/park choice
about the seam's design as a whole), the author put exactly that choice to
the owner — not a per-Ref fix-now list — before making any further repair
in this seam. Codex's own review independently arrived at the identical
requirement ("The author must put a continue / declare-residual / park
brief about that design as a whole to the owner before committing a third
repair in this seam").

**Owner ruling, 2026-09-14, on the seam as a whole:** the owner selected
**"Continue — one more bounded fix,"** with a specific design change: replace
the pending-writer coordination with **disabling the trigger while a write
is pending**, rather than awaiting a tracked promise — the option the
author recommended as a genuine design improvement (correct for any number
of concurrent writes regardless of settlement order, and simpler — no
cross-component wiring — than what it replaces), not merely another patch
to the same mechanism.

| Ref | Severity | Owner ruling                                                        | Disposition  | Repair                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Blast radius                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | -------- | ------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2  | SEV 2    | **Continue, seam-wide** (design change, not another instance patch) | **RESOLVED** | Round 2's `pendingLayoutWriteRef`/`onLayoutWriteSettled` mechanism is withdrawn. Replaced with a local `pendingLayoutWrites` count in `HADashboardIframe`, incremented at the start of `handleLayoutChange` and decremented in a `finally`; the existing "Deploy to Production" button's `disabled={!tempDashboardPath}` is widened to also require `pendingLayoutWrites === 0`. D-5's step 0 (`await pendingLayoutWriteRef.current`) is removed as unreachable — the button cannot be clicked while any write is pending, for any number of writes in any settlement order. Leg 12 redesigned to prove this directly for the out-of-order case that falsified round 2's design. | **Upstream:** none — reuses the button's existing `disabled` prop and site 5's existing try/finally-shaped error handling. **Downstream:** _less_ than round 2 — the cross-component prop and `App`-level ref are removed, not added to; `HADashboardIframe` is self-contained. The next scoped follow-up should confirm no other trigger into `handleDeployFromLivePreview` exists that bypasses this button. |
| P8  | SEV 2    | **Continue** (fix now, within the same seam-wide decision)          | **RESOLVED** | Construction A: the existing `__testThemeApi.setConnected` backdoor is widened to also call `haConnectionService.setConfig(...)` / `.disconnect()`. Construction B: Legs 9–12 and the "Establishing a KNOWN source dashboard" preamble now explicitly name both confirmation dialogs and state that every assertion targets the second, `live-preview-deploy-confirm` one.                                                                                                                                                                                                                                                                                                       | **Upstream:** none — reuses the existing backdoor and existing dialog testids. **Downstream:** Legs 9–12's own setup steps only; the next scoped follow-up should confirm the widened backdoor does not affect any other existing test relying on `setConnected`.                                                                                                                                              |
| P5  | SEV 2    | **Continue** (fix now, within the same seam-wide decision)          | **RESOLVED** | The unit-test plan gains an executed negative control: a deliberately-wrong sibling hook built from the pre-repair dependency array, run against the same transition cases via `renderHook`, asserted to fail them — replacing the citation-only "the old array excludes these fields" claim.                                                                                                                                                                                                                                                                                                                                                                                    | **Upstream:** none — the real `useDeployReport` design (D-5a) is unchanged; only its test plan gains a control. **Downstream:** the unit-test file table row and AC-16 only.                                                                                                                                                                                                                                   |

### What this round did NOT establish

- No `src/` or test code was written or executed. The redesigned
  `pendingLayoutWrites` counter, the widened test backdoor, and the
  negative-control unit test are design decisions this specification now
  mandates — they have not themselves been built or run.
- Whether disabling the button is itself free of a further edge case (for
  example, a write that starts _after_ the button is clicked but before the
  click handler runs) is exactly what the next scoped follow-up must
  independently verify, not assume from this round's own account.
- **Recurrence note, stated plainly for the owner:** this round reached the
  same-seam trigger Round 2 itself recorded, and the owner's decision was
  "continue, with a design change" rather than "patch the same mechanism
  again." If the **next** scoped follow-up finds a further live defect in
  this same seam, that is a **second** occurrence of this trigger firing —
  the author will flag that explicitly as a recurrence when bringing the
  owner the next brief, so the owner can weigh whether the seam's design is
  the right one at all, independently of whether the specific instance is
  fixable.

### Follow-up owed

Three repairs exist this round (P2, P8, P5), so **§3.4 applies again: a
scoped follow-up by the same reviewer** (OpenAI Codex / GPT-6 Astra), scope
= this round's repair diff **plus its declared blast radius above**,
confirming the claimed closures, sweeping for introduced defects, and
independently verifying the radius declaration.

## Round 4 — 2026-09-14

Third scoped follow-up: `docs/reviews/f9a-spec-codex-followup3.md` (commit
`120a516`), verdict **CLEAR-WITH-FINDINGS** (no SEV 1). Closures confirmed
by the reviewer: **P5 RESOLVED**. Live: **P2, P8 PARTIALLY RESOLVED (SEV 2
each)**. New: **P10 (SEV 2)** — round 3's own P8(A) fix, if made effective,
would change data-sourcing behaviour for existing, unrelated tests.

**Every live and new finding was independently verified against source
before it was dispositioned.** All four (P2, P8 construction A, P8
construction B, P10) were confirmed correct.

- **P2 (an issued confirmation outlives the button check):** read
  `HADashboardIframe.tsx:153-220` (`handleLayoutChange`) and `:226-248`
  (`handleDeploy`) directly. Confirmed `pendingLayoutWrites` increments only
  at the **start of `handleLayoutChange`'s own body** — i.e., at drag/resize
  **stop** (`onDragStop`/`onResizeStop`, `:449-450`), never at drag/resize
  **start** — and confirmed `handleDeploy`'s first `Modal.confirm` binds
  `onOk: onDeploy` once, at call time, with nothing between that binding and
  a click re-checking the count. A gesture already physically in progress
  when the button is clicked (count still zero) can therefore finish and
  start a write after the dialog is already showing, with no further gate
  before `onDeploy` runs. Independently re-ran the follow-up review's own
  embedded reproduction (`docs/reviews/f9a-spec-codex-followup3.md` §5),
  observing the exact reported sequence: `['outer OK with pending=1',
'confirm stripped', 'older write']`.
- **P8, construction A (effective registration):** read `App.tsx:566-587`
  and `App.tsx:2172-2187` directly — confirmed there are genuinely **two**
  effects assigning `window.__testThemeApi`, the second (ungated by
  `isTestEnv()`, deps `[setAvailableThemes]`) running after the first
  (gated, deps `[]`) in source order and reassigning the same global with
  the original, React-state-only callback. Round 3's spec named only the
  first (`:569-571`) for editing. Confirmed by executing both effects in
  sequence per the follow-up review's probe: `reactConnected=true;
serviceConnected=false; registrations=2` — the second overwrites the
  first's widening every time.
- **P8, construction B (missing transport stub):** read
  `DashboardBrowser.tsx:97-123` directly — `loadDashboards()` checks
  `haConnectionService.isConnected()` first, then calls
  `window.electronAPI.haWsConnect(...)` (`ha:ws:connect`) **before**
  `haWsListDashboards()`. Read `tests/e2e/live-preview-deploy.spec.ts:21-49`
  directly — the existing `stubLivePreviewIpc` stubs four channels
  (`ha:ws:isConnected`, `ha:ws:createTempDashboard`,
  `ha:ws:updateTempDashboard`, `ha:ws:deleteTempDashboard`), none of them
  `ha:ws:connect`; round 3's planned `stubDashboardBrowser` addition
  (`ha:ws:listDashboards`, `ha:ws:getDashboardConfig`) also omitted it.
  Confirmed `src/preload.ts:70` and `src/main.ts:460` map `haWsConnect` to
  the real, unstubbed `ha:ws:connect` IPC handler.
- **P10 (shared shortcut widening changes unrelated fixtures):** read
  `src/services/entityPickerSource.ts:54-87` directly — `loadPickerEntities`
  branches on `haConnectionService.isConnected()`: connected calls the live
  `haConnectionService.fetchEntities()` (a REST call), disconnected reads
  the persisted offline cache. Spot-checked three of the four named existing
  spec files directly: `tests/e2e/multi-entity.spec.ts:165-166`,
  `tests/e2e/attribute-display.spec.ts:117-118` and
  `tests/e2e/preset-marketplace.spec.ts:29-30` (plus its DSL helper,
  `tests/support/dsl/presetMarketplace.ts:6-24`) all call the shared
  `appDSL.setConnected(true)` step and then seed an offline entity cache (or,
  for the preset test, open the same Dashboard Browser modal the round-3
  widening would newly enable to auto-connect-and-list on open) — confirming
  each currently relies on the shared backdoor staying React-state-only.

**This round reached the same-seam trigger a SECOND time.** Round 3's
dispositions (above) recorded that a further live defect in this seam would
be a recurrence, not another routine instance patch. Per
`OPERATING_AGREEMENT.md` §3.4's same-seam rule, the author put an explicitly
recurrence-flagged continue/declare-residual/park brief to the owner about
the seam as a whole — the fourth external review round on one
specification, three of which have now touched this one mechanism — rather
than a fourth reflexive "continue." Codex's own review independently
required the same framing ("the author must flag the recurrence... before
further repair").

**Owner ruling, 2026-09-14, on the seam as a whole:** the owner selected
**"Continue, narrower fix"** — fix P8 now with a new, isolated test-only
connection hook used only by the new Dashboard-Browser legs (Legs 9–12),
making P10 moot by construction — **and declare P2 a documented residual**
rather than fund a fourth design iteration on this exact mechanism. The
owner separately ruled to keep Legs 9–12 as e2e coverage rather than
descoping them to a review-time check like site 5's.

| Ref | Severity | Owner ruling                                                                            | Disposition           | Repair / reasoning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Blast radius                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | -------- | --------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2  | SEV 2    | **Declare residual, seam-wide** (accepted rather than a fourth design iteration)        | **ACCEPTED-RESIDUAL** | An already-shown confirmation dialog is not revoked by a write that begins after it opens, from a gesture already in progress when the button was clicked. D-5 gained a "Declaring the residual — round 4" subsection naming the gap, why it is narrower than what round 3 already closed, and why a fourth iteration is not funded now. Pinned by new Leg 13 (`KNOWN-OPEN:`, §9) and new AC-17 (§8), per `drawer_practice_claims_588b2f2df00141d8f19f9433`'s convention (the same one D-6/Leg 6 already uses).                                                    | **Upstream:** none. **Downstream:** none in `src/` — no production code changes. The specification and test plan DO change (new D-5 subsection, AC-17, Leg 13), so per `OPERATING_AGREEMENT.md` §3.4's own definition ("a change to the artifact under review, or to a safeguard for it... is a repair whatever its disposition row calls it") this counts as a repair for follow-up purposes despite its ACCEPTED-RESIDUAL label — see "Follow-up owed" below. Any future repair that closes this gap must update Leg 13 (it will start failing) and D-5's residual section together. |
| P8  | SEV 2    | **Continue, narrower shape** (isolated hook, not widening the shared backdoor)          | **RESOLVED**          | Withdrew round 3's plan to widen `__testThemeApi.setConnected`. Added a new, isolated test-only hook, `window.__testHAConnectionApi` (`connect`/`disconnect`), registered in its own `useEffect`, gated by `isTestEnv()`, as a **separate object** from `__testThemeApi` — immune to that object's two-registration overwrite by construction. New `stubDashboardBrowser(ctx)` helper also stubs `ha:ws:connect`. `establishKnownSourceDashboard(ctx)` now calls the isolated hook directly; Legs 9–12 no longer call the shared `setConnected(true)` step at all. | **Upstream:** none — `__testThemeApi.setConnected` is byte-unchanged from today. **Downstream:** none beyond Legs 9–12's own new setup — the isolated hook has exactly one caller, so no existing spec file's behaviour changes. This is what makes P10 moot (below), not a separate mitigation.                                                                                                                                                                                                                                                                                       |
| P10 | SEV 2    | **Resolved by construction** (consequence of the P8 ruling, not a separate disposition) | **RESOLVED**          | P10's root cause — round 3's plan to widen the shared `__testThemeApi.setConnected` backdoor — no longer exists in the specification; the P8 repair above uses an isolated hook with a single caller instead. The ~19 existing spec files P10 named are therefore unaffected: their reliance on the shared backdoor staying React-state-only is undisturbed.                                                                                                                                                                                                       | **Upstream:** none. **Downstream:** none — this Ref requires no independent change of its own; it is closed as a direct consequence of P8's repair shape, not a parallel fix.                                                                                                                                                                                                                                                                                                                                                                                                          |

### What this round did NOT establish

- No `src/` or test code was written or executed. The isolated
  `__testHAConnectionApi` hook, the `stubDashboardBrowser` `ha:ws:connect`
  stub, and the new Leg 13 are design decisions this specification now
  mandates — they have not themselves been built or run.
- Whether the isolated hook's single-caller property survives contact with
  an actual implementation (i.e., that no other test or production code
  path is later wired to call it) is exactly what the next scoped follow-up
  must independently verify, not assume from this round's own account.
- P2's residual is declared, not measured against real Electron
  keyboard/pointer input — the controlled interleaving used to verify it
  (and Leg 13's design) models the drag core and IPC layer directly, the
  same evidence boundary Codex's own review already declared.
- **Recurrence note, stated plainly for the owner and carried forward:**
  this round was the **second** firing of the same-seam trigger on this one
  mechanism (site 4's confirm-time flow and its Dashboard-Browser test
  setup) across four external review rounds. If the **next** scoped
  follow-up finds a further live defect in this same seam, that is a
  **third** occurrence — the author will name it as such explicitly, not as
  a fifth instance patch, and will state plainly whether the mechanism
  itself, not merely its latest instance, is what needs to change.

### Follow-up owed

**Two repairs exist this round, not one.** P8 is an ordinary RESOLVED
repair. P2 is labelled ACCEPTED-RESIDUAL, but `OPERATING_AGREEMENT.md` §3.4
draws a sharper line than "residual = no follow-up": _"DEFERRED and
ACCEPTED-RESIDUAL are owner decisions, not repairs: the decision, its
disposition row and its board pointer create no follow-up under
STRAT-D7... A REPAIR is a change to the artifact under review, or to a
safeguard for it — a test, a `KNOWN-OPEN:` pin, a governed residual — made
to resolve or mitigate a finding; it is a repair whatever its disposition
row calls it, and it receives its follow-up."_ The bare ruling ("accept
this residual") would owe nothing; what was actually done — a new D-5
subsection, a new AC-17, and a new `KNOWN-OPEN:` leg (Leg 13) added to the
specification and test plan — is a change to the artifact made to mitigate
P2, i.e. a repair under this definition regardless of its disposition
label. **So §3.4 applies to both P8 and P2: a scoped follow-up by the same
reviewer** (OpenAI Codex / GPT-6 Astra), scope = this round's full repair
diff (the isolated hook, the `ha:ws:connect` stub, Leg 13, AC-17, the D-5
residual subsection, and the updated Legs 9–12 setup text) **plus its
declared blast radius above**, confirming P8's claimed closure,
independently verifying that P10 is genuinely moot (not merely asserted
so), and independently verifying that Leg 13 actually pins the residual it
claims to (i.e., that it is a correct, passing characterisation of the gap,
not merely a plausible-sounding one) — a wrong `KNOWN-OPEN:` pin is itself a
finding, the same as a wrong radius declaration. Commissioned to
`prompts/codex/f9a-spec-review-followup4.md` (gitignored, not committed —
the owner pastes it).

## Round 5 — 2026-09-14

Fourth scoped follow-up: `docs/reviews/f9a-spec-codex-followup4.md` (commit
`c038b87`), verdict **BLOCKED-ON: §9 known-source test setup, §9 Leg 13
residual pin**. Closures confirmed by the reviewer: **P10 RESOLVED**. Live:
**P2, P8 PARTIALLY RESOLVED** (their round-4 repairs are sound as far as
they go, but two new findings block them from being demonstrated). New:
**P11 (SEV 1)** — the round-4 known-source test setup cannot actually enter
Live Preview, and its own reproduction technique would delete the new test
hook it depends on. **P12 (SEV 1)** — round 4's `KNOWN-OPEN:` Leg 13 does
not pin the residual it was written for.

**Both new findings were independently verified against source before they
were dispositioned.**

- **P11 construction A (removed React prerequisite):** read
  `App.tsx:2461-2472` (`handleEnterLivePreview`) directly — confirmed
  `if (!isConnected || !wsStatus.connected)` gates entry on **React** state
  (`isConnected`, `App.tsx:337`), which the round-4 isolated hook never
  touches (it configures only `haConnectionService`). Round 4's own
  verification checked only the Download button and
  `handleOpenDashboardBrowser`, neither of which gates on `isConnected`, and
  missed this later, harder gate entirely.
- **P11 construction B (hook missing on a reverted base):** confirmed this
  project's established red-before-green technique (`git stash push -u --
src/`, cited at spec `:920` for Leg 1) reverts the **whole** uncommitted
  `src/` diff. Since the isolated hook is itself new, uncommitted `src/`
  content, a wholesale revert removes it along with whichever site-4/site-5
  mechanism a given leg targets — independently confirmed by executing the
  `__testThemeApi` registration effects with the isolated hook's own
  registration omitted: `window.__testHAConnectionApi` is `undefined`, and
  the setup's required first call throws `TypeError` before any download is
  attempted.
- **P11 construction C (wrong entry-point button):** read `App.tsx:3216`
  and `:3290` directly — `toolbar-download` renders only inside
  `{config && (...)}`; read `src/store/dashboardStore.ts:103` — a clean
  launch starts with `config: null`. Read `App.tsx:3192` directly —
  `welcome-browse-dashboards` calls the identical `handleOpenDashboardBrowser`
  handler and is present from launch.
- **P12 construction A (nonexistent baseline wait event):** re-read Leg
  13's own text — it claimed to pass "on base," but confirmed by executing
  the actual, unrepaired `handleDeployFromLivePreview` body that base has
  no confirm-time `haWsUpdateTempDashboard` call at all, so the leg's
  release-condition (release the drag's write only after that call
  completes) has no event to wait for on that literal baseline.
- **P12 construction B (no observable snapshot difference):** confirmed
  D-1 requires site 5 to use the same `toExportCapabilityOptions(profile)`
  derivation as every other call site; re-read Leg 13's own text — it
  inherited Leg 9's single, unchanging absent-card-mod profile for both the
  confirm-time write and the delayed drag write, so once site 5 is
  capability-aware, both writes would produce identical stripped output,
  making the residual's defining words/bytes mismatch unobservable through
  this leg's assertions.

**This round reached the same-seam trigger a THIRD time.** Per
`OPERATING_AGREEMENT.md` §3.4's same-seam rule and the recorded recurrence
warning in Round 4's dispositions, the author put an explicitly
third-occurrence-flagged continue/declare-residual/park brief to the owner
about the seam as a whole — the fifth external review round on one
specification, four of which have now touched the same mechanism. Unlike
the first two firings (Rounds 3 and 4, each of which changed the
**production** mechanism's design), this firing's two findings are both in
the **test infrastructure** surrounding an already-accepted production
design; Codex's own review states the production write-counter and the
owner's accepted P2 residual remain sound and are not reopened by either
finding.

**Owner ruling, 2026-09-14, on the seam as a whole:** the owner selected
**"Continue, fix now"** for P11 (all three constructions are bounded,
well-understood corrections that invent no new test machinery) and
**"Declare residual"** for P12 (withdraw Leg 13 rather than build the new
mid-session capability-profile-change mechanism a correct pin would
require). The owner also declined, for the third time, to descope sites 3/4
to the review-time check site 5 already uses.

| Ref | Severity | Owner ruling                                                          | Disposition           | Repair / reasoning                                                                                                                                                                                                                                                                                                                                                                                                        | Blast radius                                                                                                                                                                                                                                                                                                        |
| --- | -------- | --------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P11 | SEV 1    | **Continue, fix now** (bounded corrections, no new test machinery)    | **RESOLVED**          | `establishKnownSourceDashboard` now calls both the existing shared `appDSL.setConnected(true)` step and the isolated hook (construction A); switched its entry point from `toolbar-download` to `welcome-browse-dashboards` (construction C); Legs 9/11/12's red-before-green proof now reverts only the specific site-4/site-5 mechanism each targets, never the isolated hook or setup infrastructure (construction B). | **Upstream:** none — the shared `setConnected` step's contract is unchanged, merely called by more tests as it always could be. **Downstream:** the narrowed-revert technique applies to Legs 9, 11, 12 only; the next scoped follow-up should confirm no other leg's red proof still assumes a whole-`src/` stash. |
| P12 | SEV 1    | **Declare residual** (would need new test machinery to pin correctly) | **ACCEPTED-RESIDUAL** | Leg 13 withdrawn from the test plan. D-5's "Declaring the residual" subsection revised to state the residual is documented in prose only, not demonstrated by a test; AC-17 revised accordingly. The underlying P2 production risk is unchanged from Round 4's acceptance — this disposition concerns only whether a test also proves it.                                                                                 | **Upstream:** none. **Downstream:** none — Leg 13's removal touches no other leg or production code. A future round wanting an executable pin needs the mid-session profile-change mechanism named in D-5 as a prerequisite.                                                                                        |

### What this round did NOT establish

- No `src/` or test code was written or executed. The corrected
  `establishKnownSourceDashboard` step, the narrowed red-before-green
  reproduction technique, and Leg 13's removal are design decisions this
  specification now mandates — they have not themselves been built or run.
- Whether the narrowed-revert technique (reverting only a named function's
  body rather than all of `src/`) is itself mechanically reliable when an
  implementer actually attempts it is exactly what the next scoped
  follow-up must independently verify, not assume from this round's own
  account.
- **Recurrence note, stated plainly for the owner and carried forward:**
  this round was the **third** firing of the same-seam trigger on this one
  mechanism, and — unlike the first two — it found no defect in the
  production design at all, only in the test infrastructure around it. If a
  **fourth** occurrence surfaces, the author will name it as such and put
  to the owner, with a materially different cost argument than any prior
  round carried, whether continued e2e investment in sites 3/4 is still
  proportionate given that the production mechanism has now been
  independently reviewed as sound three times running while its test
  harness keeps generating SEV 1/2 findings.

### Follow-up owed

**One repair exists this round requiring follow-up: P11.** P12's
disposition (ACCEPTED-RESIDUAL, Leg 13 withdrawn) is, this time, a genuine
bare decision with no accompanying safeguard added — nothing is added to
mitigate or characterise the residual (the opposite of Round 4's P2
disposition, which added a pin); per `OPERATING_AGREEMENT.md` §3.4 this
creates no follow-up obligation on its own. **§3.4 applies to P11: a scoped
follow-up by the same reviewer** (OpenAI Codex / GPT-6 Astra), scope = this
round's repair diff (the `establishKnownSourceDashboard` fix, the
welcome-screen entry point, and the narrowed red-before-green technique for
Legs 9/11/12) **plus its declared blast radius above**, confirming P11's
claimed closure and independently verifying that the narrowed-revert
technique actually produces a meaningful red run (not another
infrastructure crash) for each of Legs 9, 11 and 12. Commissioned to
`prompts/codex/f9a-spec-review-followup5.md` (gitignored, not committed —
the owner pastes it).

## Round 6 — 2026-09-14

Fifth scoped follow-up: `docs/reviews/f9a-spec-codex-followup5.md` (commit
`eb165cf`), verdict **CLEAR-WITH-FINDINGS — no SEV 1**. Closures confirmed
by the reviewer: **P11 RESOLVED**; **P8 RESOLVED** (its remaining defects
were P11, now closed); **P10 RESOLVED, no regression found**. **P12
PARTIALLY RESOLVED** — its former SEV 1 test obligation is gone (the
withdrawal is honest and complete in substance), with only a SEV 3
reference remainder graded separately as P13. Three new findings, all
non-blocking: **P13 (SEV 3)** — three present-tense "Legs 9–13" references
in the spec's "Establishing a KNOWN source dashboard" section were not
updated when Leg 13 was withdrawn; **P14 (SEV 3)** — this file's Round 5
"Follow-up owed" reasoning incorrectly said P12's disposition needed no
follow-up because it "added no safeguard," when `OPERATING_AGREEMENT.md`
§3.4's actual definition of a repair does not require an addition (removing
Leg 13 and revising D-5/AC-17 to match IS a change to the artifact made to
resolve a finding, hence a repair by that definition) — though no review
was actually skipped, since this round's own commission explicitly
requested and performed exactly that check; **P15 (SEV 2)** — this file's
Round 5 recurrence note overstated prior reviews, claiming the production
mechanism had been "independently reviewed as sound three times running,"
when the cited reviews (`f9a-spec-codex-followup2.md`, `f9a-spec-codex-followup3.md`,
`f9a-spec-codex-followup4.md`) each state something narrower and more
qualified (a live SEV 2 gap at the time, an explicit rejection of blanket
clearance, and "does not require a fourth redesign" respectively — none of
which supports "reviewed as sound").

**All three new findings were independently verified before disposition.**
Re-read the spec at the reviewer's cited locations and confirmed all three
"Legs 9–13" references are present-tense, operative text (not historical
narrative) that should read "Legs 9–12." Re-read this file's own Round 5
"Follow-up owed" paragraph and confirmed it argued from "no safeguard
added" rather than from `OPERATING_AGREEMENT.md`'s actual text (`docs/governance/OPERATING_AGREEMENT.md:301`,
"a change to the artifact under review, or to a safeguard for it... is a
repair whatever its disposition row calls it"). Re-read the three cited
prior reviews at the reviewer's line numbers and confirmed each states a
narrower claim than "reviewed as sound" (quoted above).

**Codex's own recommendation:** accept all three as-is, with its review
report standing as the corrective record, rather than editing the
specification or this file's prior text and thereby committing a repair
that would owe a sixth scoped follow-up under `OPERATING_AGREEMENT.md`
§3.4 — for three findings that change no behaviour and block nothing. **P13
is the commission's FOURTH same-seam occurrence, but Codex's own review
explicitly distinguishes it from the first three: no defect in the
production mechanism, no evidence a further test mechanism must be built,
and its own explicit proportionality judgement is that "retaining sites 3/4
e2e coverage remains proportionate."** Codex's review also directly
addressed the recurrence note's own standing question (whether a fourth
occurrence should prompt reconsidering e2e scope for sites 3/4): it did
not need to, since P13 supplied no such evidence, and Codex's own
proportionality judgement answers the question in the negative.

**Owner ruling, 2026-09-14: "Accept as-is (Codex's own pick)."** No edit is
made to `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md` or to this
file's prior rounds' text for P13, P14 or P15. This Round 6 entry is the
sole record of their disposition.

| Ref | Severity | Owner ruling     | Disposition           | Reasoning                                                                                                                                                                                                                                                                            |
| --- | -------- | ---------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P13 | SEV 3    | **Accept as-is** | **ACCEPTED-RESIDUAL** | Three stale "Legs 9–13" references remain in spec `:1171`, `:1191`, `:1228`. No leg still depends on Leg 13; the withdrawal's substance is complete. This is the commission's fourth same-seam occurrence, but a purely cosmetic one — Codex's own review is the corrective record.  |
| P14 | SEV 3    | **Accept as-is** | **ACCEPTED-RESIDUAL** | This file's Round 5 reasoning about why P12 needed no follow-up was wrong (see above); the follow-up happened regardless because this round's commission requested it. No governance rule was actually violated in practice — only the written justification was incorrect.          |
| P15 | SEV 2    | **Accept as-is** | **ACCEPTED-RESIDUAL** | This file's Round 5 recurrence note overstated three prior reviews' conclusions about production-mechanism soundness. This Round 6 entry, and the reviewer's own quotations in `docs/reviews/f9a-spec-codex-followup5.md` §4 (P15), are the corrective record for any future reader. |

### What this round did NOT establish

- No `src/`, test, or specification-document edit was made or is owed for
  P13, P14 or P15 — this is a deliberate, recorded exception to a literal
  "no further live finding" reading of `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md`
  §10.1 item 4, not a claim that the specification's text is now
  self-consistent on every point.
- Per `OPERATING_AGREEMENT.md` §3.4 ("DEFERRED and ACCEPTED-RESIDUAL are
  owner decisions, not repairs... creates no follow-up under STRAT-D7"),
  **no further scoped follow-up is owed for this round** — none of the
  three dispositions changes the artifact or a safeguard for it; each is a
  bare acceptance.
- Product unit/integration/e2e suites, `./tools/checks` on production
  behaviour, and any Electron/UI run remain **UNRUN** and unaffected by
  this round, which touched only this dispositions file.

### Specification status

Per `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md` §10.1: items 1–3
were already met; **item 4 (the scoped follow-up confirms no further live
finding in this seam) is now satisfied via this explicit, recorded owner
exception** for P13's nonfunctional remainder, rather than a literal
zero-further-finding state — matching Codex's own recommendation that the
owner "accept this nonfunctional remainder explicitly under the adopted
trial" rather than fund a sixth round. **Item 5 — owner sign-off and
landing on `main` — is the sole remaining step.** No further Codex
follow-up is commissioned by this round.
