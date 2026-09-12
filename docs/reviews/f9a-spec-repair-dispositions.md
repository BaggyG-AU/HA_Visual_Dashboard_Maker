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
