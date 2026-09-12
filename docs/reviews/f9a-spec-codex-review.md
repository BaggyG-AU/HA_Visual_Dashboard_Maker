**BLOCKED-ON: §9 deployment-path coverage decision**

# F9a specification — independent review, 2026-09-12

**Author:** OpenAI Codex / GPT-6 Astra — independent specification reviewer, Sol/Codex seat.
**Reviewer:** A cross-check of this review has not been commissioned or performed.
**Owner gate:** Owner disposition of the findings and specification approval before implementation; this review does not approve or merge the specification.
**Commissioned by:** Owner, through `prompts/codex/f9a-spec-review.md`.
**Artifact author:** Claude Sonnet 5. This session authored neither the specification nor its commission. The review seat was checked against Operating Agreement §3.6; the exact running model was read from this session's `turn_context.model` (`gpt-6-astra`).

## 1. Verdict first

The decision to omit deployment-path execution evidence rests on a false factual premise: the named Live Preview test file already contains an offline harness and substantive tests. I recommend one bundled specification repair, with the owner disposing of the non-blocking risks separately by Ref. The simple capability-parameter approach remains viable; the locked brief does not need reopening.

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                                   | Severity | Blocks                               | Fix complexity (1–5) | Recommendation |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | -------------------- | -------------- |
| P1  | The plan leaves deployment checks out because it says the existing test equipment does not exist. It does.                                        | SEV 1    | §9 deployment-path coverage decision | 3                    | Fix now        |
| P2  | A connection check can finish after preview starts, so the deployment warning can describe a different result from the saved preview.             | SEV 2    | None                                 | 3                    | Fix now        |
| P3  | Existing users' saved connection records can remain without the new layout information after upgrading.                                           | SEV 2    | None                                 | 2                    | Fix now        |
| P4  | The proposed disconnect test never disconnects. It cannot detect a mistake in what disconnect does.                                               | SEV 2    | None                                 | 2                    | Fix now        |
| P5  | An open deployment dialog can retain its old result after the connection information changes. The plan omits the required refresh of that result. | SEV 2    | None                                 | 2                    | Fix now        |
| P6  | The plan does not state when the specification itself is finished, despite the agreed requirement to do so.                                       | SEV 2    | None                                 | 1                    | Fix now        |
| P7  | The proposed startup test checks the initial connection information, but claims to prove what an export does.                                     | SEV 3    | None                                 | 1                    | Fix now        |

### Owner Decision Briefs

These are recommendations, not owner dispositions. Complexity describes the bounded repair; the costs below include author repair, checking, reporting and the required scoped follow-up. No measured duration estimate is available.

**P1. Protects:** confidence that deployment removes unsupported styling and tells the user what changed. **Problem:** the cost argument excludes checks using equipment already in the repository. **Product affected? Unknown:** the implementation is not written; the acceptance-evidence decision is affected now. **Options and costs:** revise the matrix using the existing offline harness, then have its coverage independently checked; or explicitly accept unverified deployment behavior, saving that work while retaining the gap. **Recommendation:** fix now; this restores an agreed criterion without requiring a new live-HA test system. **If unchanged:** passing file export can still be presented alongside unexercised deployment wiring.

**P2. Protects:** agreement between the confirmation and the dashboard actually deployed. **Problem:** reading the same shared state at different times does not give the same snapshot. **Product affected? Unknown in deployed use:** a controlled execution of the current handlers admits the timing sequence; the future F9a warning/bytes mismatch is inferred. **Options and costs:** specify how successful preview writes and their reports stay paired, and add an offline timing case; or accept the timing risk explicitly and qualify the claimed guarantee. **Recommendation:** fix now within the existing preview paths. **If unchanged:** an owner can approve a guarantee that the design does not establish.

**P3. Protects:** continuity for users upgrading with a saved profile. **Problem:** a new default field does not fill that field inside an existing stored object. **Product affected? Unknown today:** the new field has no F9a consumer, but a storage-library probe reproduces its absence on upgrade-shaped input. **Options and costs:** specify a small normalization of older profiles and test it; or declare the field absent until recapture and explicitly accept that exception to the intended profile contract. **Recommendation:** normalize on the existing profile read path while preserving captured card-mod data and overrides. **If unchanged:** F9b inherits a third, undocumented state in addition to the advertised booleans.

**P4. Protects:** the owner's rule that disconnect preserves the last capture. **Problem:** a disk fixture is labelled as evidence of a transition it never performs. **Product affected? No current disconnect defect found by source trace; future regression coverage is incomplete.** **Options and costs:** retain the useful unusual-version fixture and add a bounded, mocked disconnect action followed by export; or retain source inspection as an explicit evidence limitation. **Recommendation:** add the action leg using the existing IPC seam. **If unchanged:** a regression that clears the profile during disconnect need not fail the proposed test.

**P5. Protects:** use of the latest captured information in the deployment dialog. **Problem:** the cached export result currently does not depend on the profile. **Product affected? Unknown:** the future stale-result failure is inferred from the unchanged dependency list, not observed in an F9a implementation. **Options and costs:** specify the dependency update and an open-dialog refresh test; or rely on implementation judgment and accept the unverified edge. **Recommendation:** make this small requirement explicit. **If unchanged:** the prescribed argument-only edit can leave the dialog using an older capability decision.

**P6. Protects:** a clear owner decision about whether the specification is ready to build. **Problem:** implementation acceptance criteria are supplied, but the specification's own completion criterion is omitted. **Product affected? No runtime effect demonstrated; the approval boundary is incomplete.** **Options and costs:** add a short completion statement to an existing section and correct its cross-reference; or explicitly accept the omission. **Recommendation:** fix in the same document pass, with no new process section or mechanism. **If unchanged:** the missing criterion remains missing rather than becoming satisfied by this review.

## 0. Working practice and restrictions

Applied the template's finding-class sweep, source verification, claim tagging and evidence-boundary requirements. Retrieved the practice index by ID, then the full seat-authority, claim-hygiene and artifact-chain drawers: `drawer_practice_review_16154bed9f1fe37d44b7c2a4`, `drawer_practice_claims_1fcfbf72537d81a3cdb9bc69`, and `drawer_practice_artifacts_e97ba558f9f3709f49f4cfcf`.

Reviewer restrictions acknowledged and observed: no specification or `src/` edit, no `[STATE]` update, UAT marking, merge, PR creation, Issue creation/conversion or board movement. No live HA request was made. The Electron check ran under the prescribed headless helper. Proposed repairs are confined to this review. The governance pause and the dated F9a/F6/F10 exception remain in force; no new checker, gate, template section or ledger is proposed.

## 2. Confidence and method

### Revision and authority

Reviewed `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md` at **`dee6f63a07a7855257d71db5e2a2a2831369d90f`**, on `feature/f9a-spec`. After `git fetch origin feature/f9a-spec main`, local and remote-tracking branch heads both matched that SHA. `origin/main` was **`5173c835e5b8fb9cd9d729facec5ba4ef73cdb2a`**. The working tree was clean before review work.

Commands executed, with results:

```bash
git log -1 --format=%H feature/f9a-spec
git log -1 --format=%H origin/feature/f9a-spec
git merge-base --is-ancestor 5173c835e5b8fb9cd9d729facec5ba4ef73cdb2a origin/main
git diff --name-only 691c8d1 HEAD -- src tests
git diff --quiet 123ccfe HEAD -- docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md
git diff --name-only 5173c835e5b8fb9cd9d729facec5ba4ef73cdb2a HEAD
```

The ancestry and locked-brief checks exited 0; the source/test diff was empty. The final command named the specification alone. Line references below are to that reviewed revision, not to a future repaired spec.

Opened the locked brief, both required templates, Operating Agreement §§3–3.7, `CLAUDE.md`, `ai_rules.md`, the full trial decision/adoption records, and `gh issue view 159`. The issue's current contract matched the commissioned criteria. Read the cited capability/profile/context/storage files and the export/confirmation handlers, their IPC and WebSocket destinations, and the relevant unit and e2e test bodies. Fetched the reference-instance census and pause/exception records by ID. The census supports the historical statement that layout-card was absent there; it is not a new census.

### Required re-runs and additional evidence

| Check                                  | Result and applicability                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OA §3.5(1), load-bearing specification | Re-derived D-1 through D-7 from the source and contract. The decision/AC trace below is the result; no separate implementation exists to execute.                                                                                                                                                                                           |
| OA §3.5(2), deeper flaky repeat        | **Not applicable.** The spec publishes no flaky-mechanism repeat and this docs-only change introduces no repeatable flaky mechanism. P2 is a controlled asynchronous-ordering case, not a measured flake rate. The existing DeployDialog timing comments were read; its current unit tests ran in the gate, without a stability claim.      |
| OA §3.5(3), `./tools/checks`           | **REAL_EXIT=0**, four steps: lint, formatting, typecheck, unit. Lint: **0 errors / 145 warnings**. Unit: **1559 passed / 105 files**. Run on the commissioned branch head before this review file was added. Log: `/tmp/f9a-spec-review-checks-dee6f63.log`.                                                                                |
| Existing offline Live Preview witness  | `bash tools/test-headless.sh tests/e2e/live-preview-deploy.spec.ts --project=electron-e2e --workers=1 --grep 'shows the preview address where no card can cover it'` → **REAL_EXIT=0, 1 passed**, 17.9 seconds. Run after the unit gate ended. Log: `/tmp/f9a-spec-review-live-preview.log`.                                                |
| Profile upgrade probe                  | Installed `conf`, used by `electron-store`, retained a pre-field profile despite a default containing `layoutCardPresent: false`: property absent, type `undefined`. Fresh-store control had the field with value `false`. Reproducer below.                                                                                                |
| Current handler ordering probe         | Extracted the actual `handleConnect`, `captureCapabilityProfile` and `handleEnterLivePreview` function declarations from `App.tsx` using the TypeScript AST, then executed them with controlled IPC promises. Observed `connected=true → capture pending → temp bytes written → preview active=true → profile refreshed`. Reproducer below. |

The gate command saved `$?` immediately and exited with it; the log summary did not determine the exit status. The four command headings were independently counted with `rg -c '^> (eslint|prettier --check|tsc --noEmit|vitest run)' /tmp/f9a-spec-review-checks-dee6f63.log` → `4`.

**Evidence boundary:** no F9a implementation, absent-card-mod production pass-after run, full Electron suite, Electron integration suite, live-HA capture/deploy, or release-binary validation was performed. The single Electron witness used the existing `.vite` build accepted by the harness's mtime check (`tests/setup/global-setup.ts`); it was not freshly rebuilt or certified by content hash. It establishes a working offline test route, not F9a acceptance. The storage probe exercised the installed underlying library, not a launched Electron upgrade. The timing probe exercised extracted production handlers with mocked dependencies, not human timing against HA. These limits cap P2–P5 at SEV 2; source existence and the missing spec completion statement are separately measured document facts.

### Decision and acceptance trace — read by hand

The population is the spec's D-1–D-7 and AC-1–AC-14, plus #159's DoD and criteria 1–5; this table is a labelled hand trace, not a source-search proof of runtime coverage.

| Surface                                        | Assessment                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1 / D-4; AC-9–AC-11                          | No issue found with the narrow plain-data seam, optional service arguments, unchanged defaults or React-free service boundary. Site 1's memo invalidation needs P5. Storing both facts together while forwarding the consumed fact is permitted by brief D-4 and option A.                                |
| D-2; AC-6–AC-8; #159 criterion 4               | The resolver can inspect the named folder and the no-consumer boundary is explicit. Unknown evidence is deliberately represented as false for this unconsumed field. The real installed folder remains unverified; existing stored profiles are not covered by that two-state treatment (P3).             |
| D-3; AC-2–AC-4 / AC-11–AC-12; #159 criterion 3 | No issue found with `capturedAt === null` as the export signal or leaving the palette resolver unchanged. The file-export present/never-connected controls are appropriate passing baselines. The claimed disconnect evidence needs P4.                                                                   |
| D-5; AC-1 / AC-5; #159 criterion 2             | No issue found with reusing the existing warning text. Same helper at different times does not establish same successful output (P2).                                                                                                                                                                     |
| D-6; AC-13                                     | The brief expressly leaves boot-window handling outside the acceptance bar. No demand for a new guard. The proposed pin's claim is broader than its observation (P7).                                                                                                                                     |
| D-7; AC-1–AC-5 / AC-14; #159 criterion 5       | File export is a useful red-before-green path; existing service tests preserve lower-level behavior. Deployment exclusion has a false premise (P1); disconnect evidence needs P4.                                                                                                                         |
| Specification DoD / #159 criterion 1           | A spec-specific completion criterion is not supplied (P6). Owner disposition of this review remains pending; no claim of product acceptance is made.                                                                                                                                                      |
| Scope, cost and structure                      | The document follows the feature-template sections and preserves the F9a/F9b split. No service-construction change is needed by the proposed seam. The stop-rule is not triggered by this review's bounded repair directions; any author-discovered need to exceed it still requires the prescribed stop. |

### Production-path sweep — read by hand

Candidate enumeration was `rg -n 'sanitizeForHA\b|serializeForHA\b|sanitizeForHAWithReport\b' src --glob '*.ts' --glob '*.tsx'`; comments and service definitions were distinguished by reading their enclosing code. The joining of producers to consumers below is a source trace.

| Site | Source and consumer                                                                                      | Evidence limitation / result                                                                                                                                                      |
| ---- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `App.tsx:425` memo → `App.tsx:3515` DeployDialog props → `DeployDialog.tsx:173` config → `:183` save IPC | Payload and warning share a report; the memo omits the new profile dependency (P5). Existing dialog units supply already-sanitized props and cannot detect an App wiring failure. |
| 2    | `App.tsx:748` → `yamlService.ts:313` serialization/report → `App.tsx:757` file save                      | Proposed fixture legs exercise a real output boundary. Menu callbacks use the refreshed ref at `App.tsx:2820`; no additional stale-menu issue found.                              |
| 3    | `App.tsx:2481` sanitization → `haWsCreateTempDashboard`                                                  | Offline entry already exists in the e2e test. This site's bytes can predate a capture refresh (P2).                                                                               |
| 4    | `App.tsx:2580` fresh warning calculation → confirmation → `App.tsx:2625` deploy temp path                | No corresponding payload is sent by this calculation. `haWebSocketService.ts:498` fetches the previously written temp config for deployment.                                      |
| 5    | `HADashboardIframe.tsx:153` layout handler → `:197` sanitization → `:200` temp-update IPC                | Separate async write; the spec supplies no shared record of which report accompanied a successful update. This is included in P2's repair boundary.                               |

The service trace was also read through `yamlService.ts:289`, `yamlConversionService.ts:1034`, `:1129`, `:1147` and `:1162`: the current option propagation reaches recursive cards and sections. Existing direct lower-layer tests at `tests/unit/yaml-conversion-service.spec.ts:878` exercise stripping, the permissive default and nested warnings. No new per-card translator algorithm is needed for the scoped TRANSLATE keys.

## 3. Claim ledger

| #   | Load-bearing claim                                                                                                                               | Tag       | Evidence                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | The reviewed source/test baseline and locked brief match the commissioned inputs.                                                                | MEASURED  | Git commands and exact SHA in §2.                                                                                                                                                                              |
| C2  | The alleged absent Live Preview harness is present, and an existing offline entry test runs.                                                     | MEASURED  | `tests/e2e/live-preview-deploy.spec.ts:21`, `:243`, `:362`, `:393`; the recorded headless run, with its build-provenance limit.                                                                                |
| C3  | Current handlers permit preview to become active before a pending capability capture refreshes the profile.                                      | MEASURED  | AST-extracted handler probe; `App.tsx:2097`, `:2106`, `:2142`, `:2480`. IPC completion order was controlled.                                                                                                   |
| C4  | That sequence can make the proposed F9a warning disagree with previously written bytes; the argument-only site-1 edit can retain a stale report. | INFERRED  | Spec D-3/D-5 applied to C3; `App.tsx:427` and the separate temp read at `haWebSocketService.ts:498`. No completed F9a runtime observed.                                                                        |
| C5  | Nested defaults do not add the proposed field to an existing stored profile; the fresh-store control differs.                                    | MEASURED  | Storage probe; `capabilityProfileService.ts:29`, `:40`; installed `conf/dist/source/index.js:591`.                                                                                                             |
| C6  | A deployed upgrade implementing just the listed profile/default/builder edits lacks an established legacy-profile contract.                      | INFERRED  | C5; spec `:183–188`, `:280–299`, `:455–469`. No Electron upgrade was run.                                                                                                                                      |
| C7  | Ordinary disconnect preserves the persisted HA version; seeding a null version does not exercise disconnect.                                     | INFERRED  | Source facts: `App.tsx:2232`; `main.ts:392`, `:539`; `settingsService.ts:159`; `haConnectionService.ts:271`; `haWebSocketService.ts:338`. The coverage consequence follows from §9 leg 4 performing no action. |
| C8  | The specification excludes its own DoD and does not supply the promised process-compliance statement in §10.                                     | MEASURED  | Spec `:100–104`, full §10 `:630–641`; issue DoD and adoption record `:18`.                                                                                                                                     |
| C9  | The proposed startup probe observes context state, not the export/deploy action whose behavior AC-13 asserts.                                    | MEASURED  | Spec `:487–491`, `:597–606`; inference about a future guard is limited to the instrument's observation boundary.                                                                                               |
| C10 | A bundled bounded repair is preferable to accepting these evidence gaps.                                                                         | JUDGEMENT | Existing reusable seams, P1's disproved cost premise, and #159 criteria 2–5. Repair effort has not been measured.                                                                                              |
| C11 | Baseline checks passed; they do not demonstrate the unimplemented feature.                                                                       | MEASURED  | Gate and headless witness results in §2.                                                                                                                                                                       |

**Weakest claims:** C4's future word/byte and memo effects were not reproduced in a completed F9a build. C6 extrapolates the installed storage library's behavior through the unchanged service read path. C10 is a cost judgment, not a benchmark. The layout-card folder convention was not verified against an installed instance. A cross-check should attack these limits first rather than treat the passing baseline as feature clearance.

## 4. Findings, ranked by severity

### P1 — SEV 1: the deployment-coverage exclusion rests on nonexistent absence

Blocks: §9 deployment-path coverage decision

**Four-part proof.**

1. **Broken decision:** spec `:608–625` excludes new execution legs for sites 1/3/4/5 because `tests/e2e/live-preview-deploy.spec.ts` allegedly contains “only `TODO`-commented placeholders” and “there is no existing live-preview e2e harness to extend.” This is the premise for leaving #159 criterion 5 partial (`:111`).
2. **Contradicting fact:** that file's `stubLivePreviewIpc` at `:21–49` already replaces connection/create/update/delete channels. The substantive test at `:243–289` enters preview using it; `:362–413` tests failed and successful deletion. The `:243` test passed headlessly in this review. These bodies exist at the commissioned SHA; no hypothetical future input is involved.
3. **No recorded mitigation:** the disclosure of partial coverage at spec `:619–628` does not correct the false infrastructure premise, and no owner decision accepting this evidence gap was supplied. Review-time argument inspection is not the same observation as warning/payload behavior, particularly across P2 and P5.
4. **Reachability:** the decision is being used now to approve this specification's test plan. Its witness is an existing callable helper and executable test in the named repository file. The defect is in the current document, independently of whether F9a code has been written.

**Consequence:** the owner is asked to accept weaker evidence on an overstated implementation cost. This is not a demand to run a live HA instance, nor a claim the existing test already proves F9a.

**Concrete FIX:** replace the premise and re-cost the matrix from the existing IPC harness. Specify observations of create/update payloads and the warning shown on the known-source deployment route; include the App→DeployDialog route using a bounded component/IPC or Electron test. Choose the minimum cases that distinguish missing argument propagation, a profile refresh and an inconsistent warning from the correct implementation. State valid red legs and passing controls. Fix complexity 3: reuse exists, but new assertions and bounded stubs still require implementation, checking and follow-up.

**Must not change:** the locked brief, warning wording, the required present/never-connected controls, or the separation from F9b. Do not equate the remaining placeholder tests with coverage.

**Class swept:** the five production paths and the spec's unit/e2e exclusions were read against their actual consumers (table in §2); the complete named Live Preview test file was read. The existing DeployDialog tests at `:81–169` were checked for their input boundary. This closes the infrastructure premise, not runtime coverage of future F9a edits.

### P2 — SEV 2: D-5 does not establish warning/payload snapshot agreement

**Evidence:** spec `:369–384` claims no window can expose different capability data during preview. `App.tsx:2097` marks the app connected before `:2106` starts fire-and-forget capture; `:2142` refreshes after that capture. Preview entry at `:2468–2488` checks connection, not capture completion. The controlled current-handler trace in §2 reaches preview before the refresh. HA requests can remain pending until the timeout at `haWebSocketService.ts:242–247`; this is not merely the startup IPC window in D-6.

**Problem:** take a previously captured absent profile, start a new connection whose capture reports present, and enter preview while that capture is pending. Under the proposed edits, site 3 strips using the earlier profile; site 4 can later compute no card-mod warning using the refreshed profile, while the deployment service reads the existing temp dashboard. The reverse capability change produces the reverse disagreement. These are **SEV 2 constructions**: their completion order was controlled, and the future F9a mismatch was not measured in a finished product. Shared hook identity does not make reads on different renders the same snapshot.

**Concrete FIX:** specify how the confirmation report is tied to the successfully written temp payload and its capability decision. Address entry, successful/failed/in-flight layout updates and a capture completing between write and confirmation. A bounded solution may refresh the temp payload before confirmation or retain paired successful-write evidence; the author must show how it preserves the current-profile requirement and prevents pending writes invalidating the confirmation. Add the controlled IPC regression and stable-profile controls. Complexity 3: contained coordination on the existing preview call paths.

**Must not change:** no new provider/global or unrelated parameter threading; no blanket freeze that silently discards a newer authoritative capture. If the repair actually requires crossing the cost stop-rule, stop at that fact.

**Class swept:** the context mount/read/refresh lifecycle, `handleConnect`, capture completion, preview entry, layout update, confirmation and backend temp-to-production read were traced. Site 1 uses a single report but has P5; site 2 serializes a single invocation. No live HA timing frequency was measured.

### P3 — SEV 2: D-2 leaves older saved profiles outside its declared shape

**Evidence:** spec `:183–188`, `:224–228`, `:280–299` and AC-6 prescribe a required boolean through the resolver, default and builder. The current service returns the stored `profile` wholesale at `capabilityProfileService.ts:40`; the context adopts it wholesale at `CapabilityProfileContext.tsx:56`. Installed `electron-store` delegates to `conf`, whose defaults are merged at the top level (`conf/dist/source/index.js:591`), not into an existing nested `profile`.

The probe returned `hasLayoutCardPresent=false`, `valueType="undefined"` for an old-format capture with the proposed extended default. A fresh store returned the expected `false` field. A recapture would run the changed builder; an offline restart need not recapture.

**Problem:** the documented “unknown is false” treatment does not cover a persisted object lacking the field. The claimed one-object contract is therefore unverified for existing users. No immediate layout rendering failure is asserted: F9a deliberately has no consumer, which keeps this SEV 2.

**Concrete FIX:** state normalization on the existing profile-load path, deriving a missing value from retained folder evidence under D-2's disclosed convention, or explicitly represent and obtain disposition of the missing-field case. Add old-profile, fresh-default and new-capture controls, preserving `capturedAt`, `haVersion`, card-mod data and overrides. Reconcile AC-8's allowed locations with any normalization added. Complexity 2: a bounded read/transform and fixture checks; no storage-service reconstruction is needed.

**Must not change:** do not reset a captured profile to the permissive default or require reconnection to recover card-mod behavior; do not start consuming layout-card in F9a.

**Class swept:** default construction, capture/build/save, getProfile, override copy/save, explicit clear and renderer adoption were read. The gap is the legacy stored-object route; default and recapture routes are already specified. The Electron persistence wrapper itself remains unrun in the upgrade probe.

### P4 — SEV 2: leg 4 proves a signal discriminator, not persistence across disconnect

**Evidence:** spec `:579–596` calls `{ capturedAt: '<iso>', haVersion: null, cardModPresent: false }` the shape a real disconnect leaves and says the leg “Proves AC-4.” Its instructions seed a file and export without invoking disconnect. D-3 correctly says disconnect does not alter the profile (`:330–337`).

**Problem:** disconnect leaves a non-null persisted version non-null. Only the WebSocket service's own version is cleared (`haWebSocketService.ts:343`); that field is not the saved profile. Following the real calls from `App.tsx:2232` through `main.ts:392`/`:539`, settings clearing and connection-cache clearing finds no persisted-profile reset. The null-version fixture is valuable for the F8 capture edge, but cannot detect a new reset in the disconnect handler. A test that never invokes that handler still passes if the handler is broken. The runtime regression is hypothetical; the evidence overclaim is current, hence SEV 2.

**Concrete FIX:** keep and rename this leg as the captured-with-unknown-version discriminator. Add an actual disconnect action against stubbed external IPC, then export and inspect the result and retained profile. Use a normal non-null captured version so the test also detects conflating the live connection version with the stored one. Establish the baseline and repeat after implementation. Complexity 2: extend a journey at existing boundaries, without a live HA round-trip.

**Must not change:** preserve D-3's `capturedAt` choice and the never-connected passing control. Do not manufacture a failing present/never-connected baseline.

**Class swept:** proposed legs 1–4 were traced to their action and asserted output. Legs 1–3 match their file-export observations; leg 4 adds a useful profile-value discriminator but no disconnect transition. The separate startup-pin overclaim is P7.

### P5 — SEV 2: the site-1 edit needs profile-driven memo invalidation

**Evidence:** the file-change instruction at spec `:187` and D-1 prescribe passing `toExportCapabilityOptions(profile)`; `:618–623` describes argument-level review of one-line edits. The actual producer is `useMemo(..., [deployDialogVisible, config])` at `App.tsx:425–428`. Neither the design nor test plan specifies adding the new dependency.

**Problem:** a background capture can finish while the dialog stays open and `config` is unchanged. Merely adding the argument inside the memo does not recompute its report on that profile update. The dialog's payload and warning remain mutually consistent but can use the wrong capability value, contrary to AC-1/AC-2. This is an unmitigated implementation risk, SEV 2; this review has not built the prescribed incomplete edit and observed it at runtime.

**Concrete FIX:** explicitly require the memo to depend on the profile or the derived capability value it actually reads. Specify an open-dialog profile-refresh case with unchanged config and visibility, asserting both the displayed warning and supplied deploy payload. Complexity 2: a dependency change and a bounded propagation test. The existing rules already require attention to React dependency arrays; making this load-bearing instance explicit avoids relying on an argument-only inspection.

**Must not change:** preserve lazy computation while the dialog is closed and avoid an unstable options-object dependency that recomputes on unrelated renders.

**Class swept:** memoization and retained handlers on the production-path table were read. Site 2's menu dispatch uses a ref refreshed each render; sites 3/4/5 use ordinary render closures, with their asynchronous lifetime covered separately by P2. No additional memo omission was identified in those paths.

### P6 — SEV 2: the specification's own DoD has been excluded

**Evidence:** spec `:100–104` says the issue's DoD governs the chain “not spec content” and promises that §10 records compliance. §10 (`:630–641`) discusses the test-scope question alone. [Issue #159](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues/159) requires “Each intermediate brief/specification has its own appropriate DoD”; the adopted record repeats that obligation at `docs/reviews/2026-09-11-review-loop-trial-adoption.md:18`.

**Problem:** the implementation ACs are useful, but do not establish when the specification deliverable is complete. The owner gate in the header identifies who approves it, rather than the deliverable's completion conditions. The claim that compliance is recorded is unverified. This is SEV 2, not a demand for implementation evidence before specification approval.

**Concrete FIX:** add a short statement within existing §10: design decisions and the acceptance/test matrix are settled against the locked contract, required review/check results and residual dispositions are recorded, and the owner approves the spec before code. Correct §3's pointer and the §9 phrase “implementation's independent review (Codex, then Opus)” (`:620`): the recorded chain assigns implementation to Codex and its independent review to Opus. The adjacent review-seat wording is a SEV 3 record-accuracy construction; it does not raise this finding's grade. Keep the trial outcome link in the existing story close-out. Complexity 1: wording and cross-reference repair; no new mechanism or template section.

**Must not change:** do not make unperformed product tests a prerequisite for declaring a specification finished.

**Class swept:** the header, coverage preamble/table, §8, §9 review handoff, complete §10 and §11 were checked for a spec-specific completion statement. The upstream DoD/adoption/chain are explicit; the target lacks that completion statement.

### P7 — SEV 3: the startup pin names a wider observation than it makes

**Evidence:** AC-13 at spec `:487–491` is about an export/deploy action before profile loading completes. The test at `:597–606` only renders a hook consumer and checks the default profile, then says “Proves AC-13.”

**Problem:** a future export-action guard could close the known limitation while this context-state assertion still passes. It pins provider initialization, not the export boundary. This changes no current behavior and the brief permits leaving the boot window untreated, so it is SEV 3.

**Concrete FIX:** either narrow the test's documented claim to provider initialization and label action behavior unverified, or, if retaining the stronger pin, drive the real export action while a deferred profile read remains pending. Prefer the wording correction in this repair; no extra boot-handling work is required. Complexity 1 for that correction.

**Must not change:** do not turn optional boot-window handling into a new acceptance gate.

**Class swept:** the spec's D-6, AC-13 and test pin were read together; the other action/coverage claims are accounted for in P1, P4 and §2's trace.

## 5. Directions

**No architectural pivot is recommended.** Ask Sonnet to bundle the bounded specification repairs, preserving the pure seam and locked scope. P1 is the narrow blocking decision; P2–P6 require the owner's per-Ref fix/defer/accept-residual decision, and P7 is a record correction. This review does not make those dispositions for the owner.

Use the existing `stubLivePreviewIpc` and launcher (`tests/support/electron.ts:156`, `tests/support/index.ts:119`) when specifying proof. The launcher's `reuseUserDataDir` already permits prelaunch seeding without redesigning the launcher. Preserve the required observation of the Electron store's actual path before implementing the new helper; this review's `conf` probe is not that observation.

The repair follow-up should verify the revised coverage against the actual tests, the snapshot policy against P2's interleaving, the saved-profile compatibility policy, the disconnect action, the memo dependency and the corrected completion/pin statements. Follow-up depth is decided from the real repair and its reach, as OA §3.4 requires. No implementation is authorized by this review.

## 6. Disagreements

- **With D-7/§9's scope recommendation:** the claimed missing harness is factually wrong. Partial coverage may still be an explicit owner choice, but its cost case must be re-derived from the existing infrastructure.
- **With D-5's guarantee:** the shared hook does not freeze a profile between asynchronous operations. The observed ordering defeats the reasoning; actual F9a output under that order remains to be demonstrated.
- **With leg 4's AC-4 claim:** unknown captured HA version and disconnect are different conditions. Retain the discriminator, withdraw the transition-proof claim until an action leg supplies it.
- **No disagreement with D-3's choice:** the brief explicitly delegates the signal decision to the spec, and using the capture timestamp avoids permissiveness for an actual capture lacking a string version. Retrofitting palette behavior would expand the slice.
- **No separate finding against the conventional layout-card name or option A:** the uncertainty and non-consumption are disclosed. The [upstream layout-card repository](https://github.com/thomasloven/lovelace-layout-card) independently confirms the project identity and view-layout role, not the resource URL in a particular saved capture. No claim of an observed installation is made; P3 concerns a different boundary, loading existing records.
- **No disagreement with deferring special boot handling:** that choice belongs to the spec under the locked brief's correction. P7 concerns evidence wording, not the authority to choose it.

## Reproduction details

These are review probes, not new repository checkers or acceptance tests. Run from the repository root at the reviewed revision. They write no source files, contact no HA instance and launch no windows.

### Existing-profile default probe

```bash
node --input-type=module <<'JS'
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import Conf from 'conf';
const source = fs.readFileSync('src/services/capability/capabilityProfile.ts', 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022 },
}).outputText;
const { defaultCapabilityProfile } = await import(
  'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f9a-profile-proof-'));
try {
  const oldProfile = {
    ...defaultCapabilityProfile(),
    capturedAt: '2026-09-12T00:00:00.000Z', haVersion: '2026.7.4',
  };
  fs.writeFileSync(path.join(dir, 'ha-capability-profile.json'),
    JSON.stringify({ profile: oldProfile }));
  const newDefault = { ...defaultCapabilityProfile(), layoutCardPresent: false };
  const store = new Conf({ cwd: dir, configName: 'ha-capability-profile',
    defaults: { profile: newDefault } });
  const loaded = store.get('profile', newDefault);
  console.log({ existingHasField: Object.hasOwn(loaded, 'layoutCardPresent'),
    valueType: typeof loaded.layoutCardPresent });
  const fresh = new Conf({ cwd: path.join(dir, 'fresh'),
    configName: 'ha-capability-profile', defaults: { profile: newDefault } });
  console.log({ freshHasField: Object.hasOwn(fresh.get('profile'), 'layoutCardPresent'),
    value: fresh.get('profile').layoutCardPresent });
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
JS
```

Observed: existing field absent / `undefined`; fresh field present / `false`.

### Current-handler interleaving probe

```bash
node <<'JS'
const fs = require('node:fs');
const ts = require('typescript');
const source = fs.readFileSync('src/App.tsx', 'utf8');
const tree = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest,
  true, ts.ScriptKind.TSX);
const names = ['handleConnect', 'captureCapabilityProfile', 'handleEnterLivePreview'];
const picked = {};
function visit(n) {
  if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && names.includes(n.name.text))
    picked[n.name.text] = 'const ' + n.getText(tree) + ';';
  ts.forEachChild(n, visit);
}
visit(tree);
for (const name of names) if (!picked[name]) throw Error('Missing handler ' + name);
const code = ts.transpileModule(Object.values(picked).join('\n'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
let finishCapture;
const pending = new Promise(resolve => { finishCapture = resolve; });
const events = [];
const deps = {
  config: { views: [] }, isConnected: false,
  message: { success() {}, loading() {}, error() {}, warning() {} },
  logger: { info() {}, error() {}, debug() {} },
  setIsConnected(v) { deps.isConnected = v; events.push('connected=' + v); },
  setHaUrl() {}, fetchAndCacheEntities() {}, fetchThemes() {},
  refreshCapabilityProfile: async () => { events.push('profile refreshed'); },
  yamlService: { sanitizeForHA: x => x }, setTempDashboardPath() {},
  setLivePreviewMode(v) { events.push('preview active=' + v); },
  window: { electronAPI: {
    haWsConnect: async () => ({ success: true }),
    capabilityCapture: () => { events.push('capture pending'); return pending; },
    haWsIsConnected: async () => ({ connected: true }),
    haWsCreateTempDashboard: async () => {
      events.push('temp bytes written'); return { success: true, tempPath: 'probe-temp' };
    },
  } },
};
const handlers = new Function('deps', 'with (deps) {' + code + '; return {' +
  names.join(',') + '};}')(deps);
(async () => {
  await handlers.handleConnect('http://example.invalid', 'probe');
  await handlers.handleEnterLivePreview();
  finishCapture({ success: true, profile: { installedElements: [] } });
  await new Promise(resolve => setImmediate(resolve));
  console.log(events);
})().catch(e => { console.error(e); process.exitCode = 1; });
JS
```

Observed: `connected=true`, `capture pending`, `temp bytes written`, `preview active=true`, `profile refreshed`. The probe asserts ordering through the current handlers; the sanitized content and profile-refresh implementation are stubbed, so it does not claim a measured F9a word/byte failure. The initial executed probe also extracted `handleDisconnect`; its stubbed persistence result is not used as runtime proof of real disconnect behavior.

## Cross-check (second model)

Not commissioned or performed. The ledger and weakest claims are supplied for a future independent cross-check; no per-claim confirmation or owner arbitration outcome is inferred.

## Trial record

This is the first full review of this specification in this session. No spec repair was performed. Findings P1–P6 concern the deliverable and its acceptance evidence; P7 concerns reporting accuracy. The author's self-check disclosures were compared with the source-derived coverage: the principal independent additions are the actual existing harness, the saved-profile load boundary, memo invalidation and the disconnect instrument's missing action. The commission's runtime model was checked from session metadata rather than inherited from the brief's header.

Session: `/home/micah/.codex/sessions/2026/09/12/rollout-2026-09-12T14-30-43-01a093e1-cb4b-7ba2-a23b-9fd4861e0842.jsonl`. Active effort and final usage are not independently measured here. Owner intervention during review: none beyond the commission. Owner disposition and any repair cycle remain pending.

## MemPalace drawer candidates

Reads succeeded. The session diary write was refused with `Peer MCP writer active; this server is read-only for mutating tools`. No lease override, process termination, retry or `[STATE]` update was attempted. Under MP-LEASE, the write-enabled author may file this handoff with `added_by="OpenAI Codex / GPT-6 Astra"`:

> Independent F9a specification review at `dee6f63a07a7855257d71db5e2a2a2831369d90f`, delivered in `docs/reviews/f9a-spec-codex-review.md`. Verdict: BLOCKED-ON the §9 deployment-path coverage decision, because the allegedly absent offline Live Preview harness exists. Other findings concern profile snapshot agreement, older saved-profile shape, actual disconnect coverage, deployment memo invalidation, the specification DoD and startup-test claim scope. The required gate returned 0 with 1559 passing tests/105 files and 145 lint warnings; an existing offline Live Preview witness passed headlessly. Controlled storage/handler probes have explicitly limited scope. No source/spec/board/state change or live HA operation occurred. Owner per-Ref disposition precedes any Sonnet repair and scoped follow-up.
