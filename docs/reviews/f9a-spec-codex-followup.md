**BLOCKED-ON: §9 site-4 test plan**

# F9a specification — scoped follow-up, 2026-09-13

**Author:** OpenAI Codex / GPT-6 Astra — independent specification reviewer, same model and seat as round 1. The session's `turn_context.model` records `gpt-6-astra`.
**Reviewer:** No cross-check of this review was commissioned or performed.
**Artifact author:** Claude Sonnet 5, specification and repair author.
**Owner gate:** Owner disposition of findings and specification sign-off; this review neither approves implementation nor lands the specification.
**Commissioned by:** Owner, through `prompts/codex/f9a-spec-review-followup.md`, unchanged.
**Scope:** `901e576..63982a4`, specifically the specification repair and its dispositions, plus independent verification of their declared radius. Reviewed head: `63982a4e8abd917cac61044a1987889c3dc19169`, `feature/f9a-spec`.

## 1. Verdict first

The missing-harness premise is withdrawn, but the replacement preview test plan requires a passing control over a write absent from the baseline and leaves the required deployment route unspecified. P2, P4 and P5 retain narrower design or verification gaps; P1, P3, P6 and P7 are resolved at specification level. I recommend a bundled, bounded continuation on the material findings below, with the owner's continue/residual/park decision before further same-seam repair.

## 1a. Owner Summary Table

Rows below are **live findings**, not repeated requests to decide the resolved findings. Recommendations are advisory; this review records no new owner ruling.

| Ref | What is wrong, in plain English                                                                                                                                       | Severity | Blocks              | Fix complexity (1–5) | Recommendation |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------- | -------------------- | -------------- |
| P8  | The new preview checks omit a required route setup, and the promised passing control requires an action the old app never performs.                                   | SEV 1    | §9 site-4 test plan | 2                    | Fix now        |
| P2  | Sending a fresh preview does not establish that it was saved successfully or prevent an older pending edit from replacing it before deployment.                       | SEV 2    | None                | 3                    | Fix now        |
| P4  | The disconnect check can pass using information still in memory even if the saved connection record has been reset.                                                   | SEV 2    | None                | 2                    | Fix now        |
| P5  | The new refresh test misses the transition from never connected to captured-but-absent, and substitutes reading the old code for proving the test detects the defect. | SEV 2    | None                | 2                    | Fix now        |
| P9  | The saved-profile notes name the wrong field for manual choices and list two write methods as readers. The proposed merge still preserves the real data.              | SEV 3    | None                | 1                    | Accept as-is   |

### Owner Decision Brief — one bundled decision, by Ref

**What this protects:** a warning that describes the dashboard actually deployed, retention of the last capture after disconnect, and tests that establish those outcomes before acceptance.

**What is going wrong:** P8 makes part of the replacement test plan unexecutable. P2 leaves the preview's asynchronous writes outside the claimed guarantee. P4 and P5 would allow relevant regressions to escape their prescribed checks. P9 is a record correction, not evidence of lost data.

**Product affected? Unknown for a completed F9a implementation:** none exists at this revision. The test-plan contradiction is measured now. The current handler/context probes establish the mechanisms behind P2/P4; their future F9a consequences remain inferred. No production failure frequency or live HA outcome was measured.

**Options and full cycle costs:**

- **Continue with P8, P2, P4 and P5 together:** Sonnet settles the remaining design/test requirements, checks their real dependencies and valid controls, updates the existing dispositions, and returns the repair diff and corrected radius for the same reviewer's scoped check. That includes repair, regression verification, reporting and follow-up; duration and token cost are **unknown**. P9 can be accepted without commissioning a cleanup round.
- **Declare residuals:** explicitly accept the particular unmet guarantees or evidence gaps by Ref and keep them visible. This saves repair and follow-up work where no safeguard changes, but does not make the criteria demonstrated or the impossible control executable. P8 requires an owner-recorded residual if it is left unresolved.
- **Park:** defer specification sign-off and implementation while the unresolved condition is considered; no product acceptance is implied.

**Recommendation and why:** continue on the material group, accept P9 as-is, and retain the existing architecture. The necessary dependencies are on the preview/profile paths already in scope; this review has not established that the cost stop-rule must be crossed. If the author finds that a solution requires crossing it, the locked stop-rule applies.

**If nothing changes:** the specification still asks the implementer to invent missing decisions and alter a supposed passing control, while overstating what disconnect and profile-refresh testing would establish. The adopted trial does not support ordinary acceptance of that contract as met.

## 2. Confidence, scope and evidence boundary

The adopted F9a/F6/F10 trial governs over conflicting older/shared practice. Read the commission in full; the repair diff; the complete specification and dispositions; round 1's findings and reproduction details; the relevant locked-brief contract; the trial decision; Operating Agreement §§3.4–3.6; and the review template's verdict, owner-summary and severity rules. Retrieved the practice index by ID and the full finding-as-hypothesis, repair-follow-up and evidence-scope drawers. The role ruling and adopted-trial drawer independently confirm this seat and precedence.

`git fetch origin feature/f9a-spec` succeeded. The branch was clean at the commissioned repair before review work. `git diff --numstat 901e576..63982a4` enumerated the two changed documents; `git diff --quiet 901e576..63982a4 -- src tests` returned 0. The dispositions' historical owner ruling is taken from its committed record and the owner's commission; I did not authenticate a separate private conversation.

### Checks actually performed

| Check                                                                                                                                                                | Result and exact boundary                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bash tools/test-headless.sh tests/e2e/live-preview-deploy.spec.ts --project=electron-e2e --workers=1 --grep 'shows the preview address where no card can cover it'` | Exit 0; **1 passed, 15.6s**. Log `/tmp/f9a-followup-witness.log`. This re-establishes that the existing offline preview harness runs; it does not test F9a or authenticate the author's reported 15.1s. The existing launcher selected the local build; no fresh package-build certification is claimed.    |
| Round-1 “Existing-profile default probe,” executed verbatim from `docs/reviews/f9a-spec-codex-review.md`                                                             | Exit 0; existing object lacks the field (`undefined`), fresh object has `false`, matching the repair's reproduction claim. Uses installed `conf`, not an Electron upgrade.                                                                                                                                  |
| Round-1 “Current-handler interleaving probe,” executed verbatim from that review                                                                                     | Exit 0; `connected=true → capture pending → temp bytes written → preview active=true → profile refreshed`. Current handlers, controlled IPC, stubbed sanitizer/profile refresh.                                                                                                                             |
| Proposed D-2a spread expression, read from the spec and evaluated against installed `conf` in temporary stores                                                       | Missing field, existing `true`, existing `false`, and fresh-store cases passed equality assertions. Existing data, including the actual `userOverrides` field, survived. Evaluates the specified expression; the repaired service has not been built.                                                       |
| Current site-4 handler extracted with the TypeScript AST                                                                                                             | New-dashboard source: `exit preview → ordinary dialog`; known HA source: `summary dialog`, with no update call. Real target resolver and sanitizer; UI/IPC stubbed. See reproduction below.                                                                                                                 |
| Current site-5 handler extracted with the TypeScript AST                                                                                                             | It notified the parent, awaited connection status, then wrote after a separately placed review checkpoint when that response was released. Real merge/sanitizer, controlled IPC. Establishes the pending-writer mechanism, not a completed repaired F9a race.                                               |
| Actual capability provider plus extracted current disconnect handler                                                                                                 | With and without a reset of the stubbed persisted object, the mounted consumer retained the captured profile and made only its initial read. The injected case left that object uncaptured. This tests the instrument's blind spot; it does not assert the current disconnect contains the injected defect. |

The two original probes were run with this extraction command; it checks that the heading and fenced command exist and propagates any failure:

````bash
python3 - <<'PY'
from pathlib import Path
import re, subprocess
s = Path('docs/reviews/f9a-spec-codex-review.md').read_text()
for heading in ['Existing-profile default probe', 'Current-handler interleaving probe']:
    part = s.split('### ' + heading + '\n', 1)[1]
    command = re.search(r'```bash\n(.*?)\n```', part, re.S).group(1)
    subprocess.run(['bash', '-c', command], check=True)
PY
````

**Not established:** no F9a implementation or new planned test was written or run. Full unit/integration suites, `./tools/checks`, repeatability testing, a packaged release and live HA were **UNRUN** this round. This is a specification follow-up, not a class-(d) implementation review; §3.5's implementation gate/repeat mandate is not applicable. No new flaky mechanism was claimed or tested. The existing headless witness and the in-process probes are review evidence, not product acceptance. The actual Electron store filename and overlay-drag DSL reuse remain unverified. No claim is made that a file search proves runtime correctness.

Reviewer restrictions observed: proposed changes are confined to this document; no specification, dispositions, prompt, `src/`, test-source, `[STATE]`, UAT or board edits; no merge, PR/Issue creation or live HA request. No new rule, checker, gate, template or ledger is proposed.

## 3. Closure and independent radius verification

“Resolved” below means the **specified repair** closes the original defect; it never means that unbuilt code passed. New defects in the repair have separate Refs.

| Ref | Follow-up state                | Evidence and remaining boundary                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | **RESOLVED**                   | Spec `:830` expressly withdraws the false missing-harness premise, and §§3/7/9/11 replace its coverage decision. The helper and substantive test bodies exist and the headless witness passed. This resolves P1's factual basis; P8 is a new defect in the replacement legs, and P2 covers the still-unjustified “wiring only” radius. It is not blanket clearance of criterion 5. |
| P2  | **PARTIALLY RESOLVED — SEV 2** | D-5 `:424` pairs the freshly computed report with a requested write, addressing a capture completed before the click. Successful-write verification and competing pending writes remain unspecified; the “site 4 only” declaration is incomplete.                                                                                                                                  |
| P3  | **RESOLVED**                   | D-2a `:309`, AC-15 `:657` and the store tests `:709` cover legacy loading without recapture. The actual prescribed spread passed the four store-shaped checks above and preserves existing fields. P9 separately records naming/reader-inventory inaccuracies.                                                                                                                     |
| P4  | **PARTIALLY RESOLVED — SEV 2** | Leg 4 correctly disclaims transition proof; Leg 5 `:798` now invokes disconnect. Its immediate cached export still cannot establish that the persisted profile survived; the fresh-read boundary is missing.                                                                                                                                                                       |
| P5  | **PARTIALLY RESOLVED — SEV 2** | D-5a `:469` supplies both required primitive dependencies, preserves the lazy gate and routes App through the hook. The §9 test observes only one dependency's change and explicitly substitutes source quotation for an executed defect-detection check.                                                                                                                          |
| P6  | **RESOLVED**                   | §10.1 `:940` supplies a specification DoD and identifies review, owner sign-off and landing as pending steps. The coverage table uses `#159`. The remaining findings mean the assertion that items 1–3 are already met is not independently confirmed; the original omission of a DoD is repaired.                                                                                 |
| P7  | **RESOLVED**                   | AC-13 `:638` and Leg 6 `:813` explicitly limit their observation to context initialization and leave action behavior undemonstrated. Read D-6 and the coverage-table consumers with those qualifications; no extra boot-action requirement is inferred.                                                                                                                            |

### Radius — source-derived, not accepted from the declaration

Candidate searches included `rg -n 'getProfile\(|haWsUpdateTempDashboard|ha:ws:updateTempDashboard|deployReport|handleDeployFromLivePreview' src tests`. The table is a **hand trace of consumers at the reviewed head**, corroborated by reading the enclosing methods and provider lifecycle; the search is not a semantic completeness test.

| Changed part / Ref | Upstream reliance and downstream reach actually checked                                                                                                                                                                                                                                                                    | Assessment                                                                                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §9 / P1, P2, P4    | Locked-brief passing controls and word/byte contract → test setup and assertions → upcoming implementation and its reviewer. The live-preview stub, source-target resolver and both confirmation stages determine whether the new legs reach site 4.                                                                       | Declaration covers the deliverable recipients but misses the consequential route/baseline prerequisites (P8). A source read of the existing argument alone cannot settle site 5's interaction with D-5 (P2).                                                                 |
| D-2a / P3          | `defaultCapabilityProfile`, installed store semantics and existing persisted objects → `setOverride` (`capabilityProfileService.ts:50`), capture's retained overrides (`main.ts:599`) and profile-read IPC (`main.ts:615`) → context, palette and BaseCard availability reads. `withOverride` preserves the spread fields. | No absent-field assumption found in those consumers. `saveProfile` and `clearProfile` are writers, not callers of `getProfile`; the declaration is inaccurate there (P9). The normalization adds no field-based layout behavior to those UI consumers.                       |
| D-5 / P2           | Current App config/profile and source-target branch → update IPC's result contract (`main.ts:641`) → shared temp dashboard also written by `HADashboardIframe.tsx:200` → delayed temp read during production deploy (`haWebSocketService.ts:498`).                                                                         | **Radius incomplete:** reusing a channel does not isolate the state written through it. Site 5 and the eventual deployment read belong to the proof even if their code ultimately needs no edit.                                                                             |
| D-5a / P5          | Config, visibility and the two capability fields → extracted hook → App's report props (`App.tsx:3515`, `:3517`) → DeployDialog warning and saved object. Existing `useRecentColors`/`renderHook` convention checked.                                                                                                      | Extraction is on the existing site-1 path. The prop shape and lazy gate are preserved in the design. Site 1 is not literally the final consumer; existing dialog tests cover supplied props, not the App-to-hook wiring. That wiring remains an implementation-review check. |
| §10.1 / P6         | #159's quoted DoD and trial adoption → owner sign-off and this follow-up → implementation handoff.                                                                                                                                                                                                                         | Appropriate document DoD; no new process mechanism required. Its “met” assertions remain subject to this review's findings.                                                                                                                                                  |
| AC-13 / Leg 6 / P7 | Existing provider initialization and D-6 choice → the revised pin and coverage-table reference.                                                                                                                                                                                                                            | The two edited passages have wider cross-reference readers, but their explicit limitations remain coherent when those readers are included. No additional material radius defect found.                                                                                      |

### #159 criteria and specification DoD

| Criterion                                                                               | Specification-stage result                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 — no unresolved SEV 1; explicit acceptance for another material defect                | **Not met:** P1 is resolved, but new P8 is SEV 1. P2/P4/P5 also need repair or explicit disposition. No owner acceptance of this round's residuals is recorded.                                                                                        |
| 2 — absent styling stripped/warned; pre-deploy words agree with emitted result          | Strip-and-warn design retained; **partially established** because D-5's remaining cases are P2 and its planned production-path proof is P8.                                                                                                            |
| 3 — present/never-connected preserved; persisted capture authoritative after disconnect | Derivation and existing passing behaviors retained in the design. **Evidence plan incomplete:** P4's saved-state boundary, P5's first-capture transition and P8's invalid control.                                                                     |
| 4 — one capability object; layout source/unknown treatment established                  | **Adequate specification design:** legacy objects are normalized, the conventional folder evidence and unknown-as-false limitation remain explicit, and F9a adds no layout consumer. This does not empirically validate an installation's folder name. |
| 5 — affected paths/regressions; valid red and passing controls                          | **Not yet adequate:** existing infrastructure is acknowledged, but P8 is unexecutable and P2/P4/P5 leave consequential coverage gaps.                                                                                                                  |

The specification now has an appropriate DoD, but its completion is **pending**. I cannot confirm its design/test-plan settlement or its claimed complete repair closures. Owner disposition, sign-off and landing remain future steps. Product DoD is not assessed as achieved by this document review.

## 4. Findings — severity-ranked, class-swept

### P8 — NEW, SEV 1: the replacement site-4 plan requires an impossible passing baseline and omits a route prerequisite

Blocks: §9 site-4 test plan

**Four-part proof, with severity per construction:**

1. **Broken decision:** Legs 9–10 are the replacement production-path evidence for D-5/AC-5 and criterion 5 (spec `:896`); Leg 10 explicitly requires a passing pre-change control (`:913`).
2. **Contradicting facts:** **SEV 1, control:** even when a known HA source is supplied, the current handler goes from sanitization (`App.tsx:2580`) to confirmation with no update call. Leg 9 itself acknowledges this at spec `:904`, while Leg 10 requires inspecting that nonexistent confirm-time update's card-mod block and calls the control passing before and after. The known-source probe returned a summary with zero writes. **SEV 2, route prerequisite:** Leg 7 supplies a create-new setup (`:864`); Legs 9–10 do not establish an HA source. Reusing that setup yields `sourceDashboard === null`, so `App.tsx:2553` exits preview, opens the ordinary DeployDialog and returns before the site-4 summary. `livePreviewDeploy.ts:49` supplies that discriminator; it is not the same as a known default HA dashboard with a null URL path. The actual-handler probe returned `exit preview → ordinary dialog`. An implementer could supply a known-source fixture, but the plan leaves that necessary step unstated; this construction is graded as an omission, not proof that every possible fixture takes the wrong branch.
3. **No recorded mitigation:** the declarations require unchanged existing return shapes and confirmation UI, but supply neither a source-bearing setup nor a different baseline observation. Calling the same impossible write a “control” does not make it preserve a passing baseline. The owner approved repairing the original findings, not accepting this new contradiction.
4. **Reachability:** the absent confirmation-time write is a property of the existing handler at `63982a4`, not an invented future product input. The stipulated passing baseline cannot be recorded even after supplying the right route. The blocked component is that test-plan decision, not the entire branch.

The button is also distinct from `live-preview-deploy-confirm`: the latter is the content div of App's second confirmation (`App.tsx:2591`), while `HADashboardIframe.tsx:226` opens an earlier prompt. The plan must distinguish the action from its observation surface. This is supporting route evidence, not another SEV-1 construction.

**Required repair shape:** establish the actual known-source journey and its confirmation stages; distinguish preserved product outcomes that can pass on base from the newly introduced rewrite event. Keep the present and never-connected controls genuinely passing. Sonnet chooses the final test design and wording. Complexity 2: bounded setup/assertion changes using existing boundaries, followed by baseline and scoped repair checking.

**Must not change:** source-target safety, existing confirmation copy/testids, the locked controls or the headless requirement. Do not remove the unknown-source safeguard merely to reach the test branch.

**Class/seam swept:** executable setup → actual operation → claimed observation → baseline applicability, across §9's unit bullets and Legs 1–10. Legs 1–3 and 7–8 have meaningful export/create observations and baseline outcome distinctions; Leg 4 retains its discriminator role; Leg 6 is explicitly limited. Leg 5's persistence blind spot is P4, hook dependency proof is P5, and asynchronous agreement is P2. No new tests have been executed, so this is an executability/measurement review of the plan, not a green matrix. **Classification: deliverable and reporting record.**

### P2 — PARTIALLY RESOLVED, SEV 2: a requested rewrite is not an established deployment snapshot

**Evidence:** D-5's new steps (spec `:429`, `:433`, `:437`) compute a report, send its payload and show its summary. The file table adds an `await` (`:190`) but no requirement to validate the result or coordinate other writes. The actual update IPC catches errors and resolves `{ success: false, error }` (`main.ts:645`); site 5 checks that result (`HADashboardIframe.tsx:205`). Site 5 also waits before sanitizing/writing (`:161`, `:197`, `:200`). Production deployment reads the temp config later, after asynchronous backup operations (`haWebSocketService.ts:485`, `:498`).

**Remainder, each SEV 2:**

- A refused rewrite can leave earlier bytes in HA while D-5 displays the newly computed warning. Awaiting this API is insufficient to establish success. No failure outcome is specified.
- A layout handler already suspended on connection status can outlive the new rewrite, then replace it using its earlier render's capability decision. A modal blocks new gestures, not that pending operation. A completed rewrite therefore does not prove which bytes the later backend read will obtain. The actual site-5 probe demonstrates the delayed-writer mechanism; applying it to the proposed capability threading is an inference, not an executed repaired implementation.
- Legs 9–10 seed one stable profile and inspect a requested update argument. They specify no capture transition, failed response, delayed competing write, or observation of the eventual deployed content. They can certify a report/request pair while missing both cases above.

This is the **same seam** as round-1 P2, whose remedy explicitly required considering successful, failed and in-flight layout updates. The radius declaration's “site 4 only” and “site 5 unaffected” do not close that seam. This is not a request to add a new deployment feature.

**Required repair shape:** specify what constitutes a successful, authoritative payload paired with the user's confirmation through the eventual deployment read, including failure and pending-writer cases; specify an instrument that distinguishes those cases from successful stable-profile controls. Complexity 3: coordination on existing preview paths plus its verification. I do not prescribe serialization, caching, or a new abstraction.

**Must not change:** current-profile authority, other views, source-target safety, the warning wording or the locked cost boundary. An older captured value cannot be frozen silently as the solution.

**Class/seam swept:** profile refresh, preview creation, layout-update suspension/success/failure, both confirmations, and backend temp-to-production read, with sites 1/2 as single-report controls. This is a hand trace; external HA writers and unrelated product routes were not reviewed. **Classification: both.**

### P4 — PARTIALLY RESOLVED, SEV 2: Leg 5 does not observe the saved record after disconnect

**Evidence:** spec `:805` now calls the real disconnect action, but `:808` only exports and asserts stripped styling/warning before claiming the persisted profile survived. The provider reads at mount or explicit refresh (`CapabilityProfileContext.tsx:51`, `:62`); `App.tsx:2232` does not refresh it on disconnect.

**Measured instrument counterexample:** execute the actual provider and current disconnect handler, injecting a reset in the stubbed external clear-connection operation. The stubbed persisted object (held in memory for this probe) becomes `capturedAt: null`, while the mounted consumer still holds the old timestamp and `cardModPresent: false`; `profileReads` remains 1. With no reset injected, the consumer has those same values. Under D-3, both therefore yield the same immediate export decision. A cleared saved HA version alone would also be invisible to the specified export assertions; the non-null fixture does not by itself assert its preservation.

The injection is a constructible regression, **not a current product defect**. It demonstrates why Leg 5's stronger durability claim is still unsupported. The earlier missing action is repaired; this residual is narrower.

**Required repair shape:** observe retention through the real profile-read boundary after the action, including the retained captured fields, and demonstrate that a disconnect reset would fail that observation. Keep the immediate export assertion as the user-facing check. Complexity 2: additional observation and a discriminating regression case at existing boundaries.

**Must not change:** disconnect behavior, the seeded pre-action capture, the never-connected control, or Leg 4's independent timestamp discriminator. Do not replace the action with another post-action seed.

**Class/seam swept:** tests claiming persisted state from an already-mounted consumer, across seed → provider mount → connect/capture → disconnect → immediate export and a subsequent profile read. Legs 1–4 establish chosen initial states; only Leg 5 makes the new post-transition persistence claim. **Classification: both.**

### P5 — PARTIALLY RESOLVED, SEV 2: the hook's design closes the memo gap, but its prescribed proof does not cover both dependencies

**Evidence:** D-5a's dependency list at spec `:474` and AC-16 at `:665` correctly name `cardModPresent` and `capturedAt`. The unit plan at `:719` changes only `cardModPresent` and then repeats identical inputs. It omits the separate `capturedAt` change. At `:728` it labels the old dependency list “Proven RED,” then expressly defines this as direct quotation rather than an executed failing check.

**Consequence:** the important default → captured-absent transition leaves `cardModPresent === false` unchanged and changes only `capturedAt`. A hook missing that dependency would remain permissive for this capture while passing the described false → true card-mod test and unchanged-input memoization control. The callback must be exercised on capture-shaped profiles, and quotation cannot demonstrate that the new instrument detects the old omission. This is an evidence-plan defect; the proposed two-dependency implementation itself is sound.

**Required repair shape:** make each load-bearing profile transition independently observable, preserve the unchanged/closed-dialog controls, and provide executed defect-detection evidence at the extracted memo boundary. The nonexistent pre-repair hook file does not prevent exercising the old dependency behavior in a controlled probe. No pre-implementation F9a acceptance run is demanded. Complexity 2: bounded hook tests and evidence correction.

**Must not change:** primitive dependencies, the lazy gate, the returned report shape or the App call to the hook. Do not defeat memoization to make the refresh test pass.

**Class/seam swept:** each input read by the seam helper, visibility/config changes, profile-field changes and unchanged values, plus hook → App props → existing DeployDialog tests. The supplied-prop dialog tests do not independently exercise App wiring; that remains an explicit source check for implementation review. **Classification: both.**

### P9 — NEW, SEV 3: D-2a's field names and reader inventory do not match the source

**Evidence:** spec `:187`, `:335`, `:340`, AC-15 `:661`, unit plan `:714` and the dispositions' P3 row use `overrides`. The field is `userOverrides` (`capabilityProfile.ts:38`), consumed by capture (`main.ts:603`) and availability resolution (`cardAvailability.ts:36`). Spec `:331` and the same disposition row name `saveProfile` and `clearProfile` as `getProfile` callers; their complete bodies only write (`capabilityProfileService.ts:44`, `:56`). The actual reads are listed in the radius table above.

**Consequence and grade:** the implementer has inaccurate fixture vocabulary and the owner receives an inaccurate radius record. The prescribed spread nevertheless preserves `userOverrides`, as the normalization probe confirmed; no data loss is established. This is SEV 3 record accuracy, not a reason for another standalone repair cycle.

**Repair shape if elected:** align the existing descriptions/fixtures and reader inventory with the source identifiers. Complexity 1. **Must not change:** the normalized-read expression or actual saved data. **Recommendation:** accept as-is with this correction visible; this recommendation is not an owner disposition.

**Class swept:** repaired legacy-profile field-preservation passages, API caller assertions and their disposition row; the complete profile interface and service methods were read. No extra missing-field assumption was found in the downstream UI readers. **Classification: reporting record.**

### Reproduction — current handlers and provider, without editing source

Run from the repository root at the reviewed head. This probe uses actual extracted handlers, the actual provider and real pure services; React UI and HA/persistence IPC are stubbed. The injected persistence reset is deliberately hypothetical. It creates no Electron window and makes no HA request. The normalization check evaluates the spec's exact expression against temporary `conf` stores, then removes only its own temporary directory.

```bash
node <<'JS'
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const assert = require('node:assert/strict'), ts = require('typescript');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<html><body></body></html>', { url: 'http://example.invalid' });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.IS_REACT_ACT_ENVIRONMENT = true;
const compile = s => ts.transpileModule(s, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  esModuleInterop: true, jsx: ts.JsxEmit.React,
} }).outputText;
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (m, f) => m._compile(compile(fs.readFileSync(f, 'utf8')), f);
}
const React = require('react');
const { renderHook, act, cleanup } = require('@testing-library/react');
const { yamlService } = require('./src/services/yamlService.ts');
const { mergeEditedView, resolveLivePreviewDeployTarget } = require('./src/services/livePreviewDeploy.ts');
const { summarizeExportWarnings } = require('./src/services/exportWarningSummary.ts');
const { defaultCapabilityProfile } = require('./src/services/capability/capabilityProfile.ts');
const { CapabilityProfileProvider, useCapabilityProfile } = require('./src/contexts/CapabilityProfileContext.tsx');
function handler(file, name, deps) {
  const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const matches = [];
  function visit(n) {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name) matches.push(n);
    ts.forEachChild(n, visit);
  }
  visit(tree);
  assert.equal(matches.length, 1, name + ' extraction must be live and unique');
  return new Function('deps', 'with(deps){' + compile('const ' + matches[0].getText(tree) + ';') + ';return ' + name + ';}')(deps);
}
const tick = () => new Promise(r => setImmediate(r));
const config = { title: 'Probe', views: [{ cards: [{ type: 'button', style: 'color: red;' }] }] };
const message = { info() {}, error() {}, success() {}, loading() {} };
(async () => {
  for (const sourceDashboard of [null, { urlPath: 'probe-source', title: 'Probe' }]) {
    const events = [];
    const fn = handler('src/App.tsx', 'handleDeployFromLivePreview', {
      sourceDashboard, config, tempDashboardPath: 'probe-temp', yamlService,
      resolveLivePreviewDeployTarget, summarizeExportWarnings, message,
      React: { createElement() { return null; } },
      Modal: { confirm() { events.push('summary dialog'); } },
      handleExitLivePreview: async () => events.push('exit preview'),
      setDeployDialogVisible: () => events.push('ordinary dialog'),
      window: { electronAPI: { haWsUpdateTempDashboard: async () => {
        events.push('update'); return { success: true };
      } } },
    });
    void fn();
    await tick();
    assert.deepEqual(events, sourceDashboard ? ['summary dialog'] : ['exit preview', 'ordinary dialog']);
    console.log('route', sourceDashboard ? 'known' : 'new', events);
  }
  {
    const events = [];
    let release;
    const waiting = new Promise(r => { release = r; });
    const fn = handler('src/components/HADashboardIframe.tsx', 'handleLayoutChange', {
      config, activeView: config.views[0], activeViewIndex: 0, tempDashboardPath: 'probe-temp',
      setLayout() {}, onLayoutChange() { events.push('parent notified'); },
      yamlService, mergeEditedView, logger: { warn() {}, error() {} }, message,
      window: { electronAPI: {
        haWsIsConnected: () => { events.push('waiting'); return waiting; },
        haWsUpdateTempDashboard: async (_, c) => {
          assert.ok(c.views[0].cards[0].card_mod);
          events.push('write'); return { success: true };
        },
      } },
    });
    const work = fn([{ i: 'card-0', x: 0, y: 0, w: 2, h: 2 }]);
    await tick();
    events.push('checkpoint');
    release({ connected: true });
    await work;
    assert.deepEqual(events, ['parent notified', 'waiting', 'checkpoint', 'write']);
    console.log('pending layout writer', events);
  }
  for (const injectReset of [false, true]) {
    let stored = { ...defaultCapabilityProfile(), capturedAt: '2026-09-12T00:00:00Z', haVersion: '2026.7.4' };
    let reads = 0;
    window.electronAPI = {
      capabilityGetProfile: async () => { reads++; return { profile: structuredClone(stored) }; },
      clearHAConnection: async () => { if (injectReset) stored = defaultCapabilityProfile(); },
      haWsClose: async () => {},
    };
    const { result } = renderHook(() => useCapabilityProfile(), {
      wrapper: ({ children }) => React.createElement(CapabilityProfileProvider, null, children),
    });
    await act(async () => {});
    const fn = handler('src/App.tsx', 'handleDisconnect', {
      window, haConnectionService: { disconnect() {} }, setIsConnected() {}, setHaUrl() {}, message,
    });
    await act(async () => { await fn(); });
    assert.equal(reads, 1);
    assert.equal(result.current.capturedAt, '2026-09-12T00:00:00Z');
    assert.equal(result.current.cardModPresent, false);
    assert.equal(stored.capturedAt, injectReset ? null : result.current.capturedAt);
    console.log('disconnect', { injectReset, reads, storedCapture: stored.capturedAt, cachedCapture: result.current.capturedAt });
    cleanup();
  }
  const { default: Conf } = await import('conf');
  const expression = "{ ...defaultCapabilityProfile(), ...this.store.get('profile', defaultCapabilityProfile()) }";
  assert.ok(fs.readFileSync('docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md', 'utf8').includes(expression));
  const read = new Function('defaultCapabilityProfile', 'return ' + expression + ';');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f9a-followup-profile-'));
  try {
    for (const field of ['missing', true, false, 'fresh']) {
      const dir = path.join(root, String(field)); fs.mkdirSync(dir);
      const previous = { ...defaultCapabilityProfile(), capturedAt: '2026-09-12T00:00:00Z',
        haVersion: '2026.7.4', cardModPresent: true, userOverrides: { 'custom:button-card': 'force-unavailable' } };
      if (typeof field === 'boolean') previous.layoutCardPresent = field;
      if (field !== 'fresh') fs.writeFileSync(path.join(dir, 'ha-capability-profile.json'), JSON.stringify({ profile: previous }));
      const defaults = () => ({ ...defaultCapabilityProfile(), layoutCardPresent: false });
      const store = new Conf({ cwd: dir, configName: 'ha-capability-profile', defaults: { profile: defaults() } });
      const actual = read.call({ store }, defaults);
      assert.deepEqual(actual, field === 'fresh' ? defaults() : { layoutCardPresent: false, ...previous });
      console.log('normalization', field, 'PASS');
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
  dom.window.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
JS
```

## 5. Hand-back and trial facts

This is **specification external round 2**, one scoped repair follow-up to the first full review. This session performed no specification repair and no internal self-review → artifact-repair → renewed-check cycle on the target. This review report had **one substantive internal self-check/repair/recheck cycle**: the route construction was narrowed from a definite wrong-route claim to an omitted prerequisite, while the independently established impossible baseline retained SEV 1; the persistence probe's stub boundary was made explicit. Formatting was also corrected. These are not additional external rounds or target repairs. The author's repair is one bundled commit, `63982a4`; its internal cycle count and active effort are **unknown**, not inferred from the number of findings or commits.

Owner interventions this round: the opening commission; no additional owner intervention during execution. New owner dispositions are **pending/unknown**. Criteria results and the recommendation are above. P8 is a repair-introduced test-plan defect; P9 is repair-introduced record drift; P2/P4/P5 are incomplete same-seam closures. No implementation regression or consequential production escape was observed because the implementation does not yet exist. Prior author attempts outside the supplied repair record were not reconstructed.

What helped: the explicit revision/radius commission, direct handler/consumer tracing, reuse of the existing headless witness, and distinguishing storage from the provider's cached snapshot. What repeated: closures based on narrower observations than their claims; the repair moved the boundary without checking the remaining consumers. The same-seam requirement is activated by P2/P4/P5 and the replacement coverage defect P8; it calls for the existing owner continue/residual/park brief, not an automatic further cycle.

Execution difficulties: early combined reads exceeded the output budget and were re-read in bounded sections; the state search required fetching the known live-state drawer by ID. These were review overhead, not failed product tests. The initial review-file formatting check failed; formatting was corrected and the check passed. No product test run failed. No implementation or repair attempt was parked. The memory write failed as recorded below.

Session file: `/home/micah/.codex/sessions/2026/09/13/rollout-2026-09-13T02-48-16-01a09685-0c05-7c13-9a6b-daea91d23488.jsonl`, session ID `01a09685-0c05-7c13-9a6b-daea91d23488`. Session metadata starts at `2026-09-12T16:48:16.949Z` (2026-09-13 in Australia/Sydney). At the `2026-09-12 17:05:40 UTC` checkpoint, elapsed session time was **17m 23s**. The latest available usage event then, `2026-09-12T17:05:09.964Z`, recorded **3,661,331 input tokens**, including **3,317,248 cached input tokens**, and **26,744 output tokens**, including **8,528 reasoning output tokens**; total **3,688,075**. These are a **pre-commit snapshot**, not final usage. **Active effort, final billed usage and complete post-response usage are unknown.** Input usage is cumulative and includes repeated/cached context, not unique words or a measured wasted-token bill.

Final review-file verification: the embedded reproduction was extracted and executed successfully (exit 0, `/tmp/f9a-followup-probes.log`); the original storage/connection probes and headless witness are recorded in §2. `npx prettier --check docs/reviews/f9a-spec-codex-followup.md` passed after formatting. These checks validate this review's reproducibility and presentation, not the unbuilt feature.

**Next action:** owner rules on the material continuation and the P9 recommendation; Sonnet authors any further approved specification repair. No architectural pivot is recommended. This reviewer stops after committing this document and handing back the result.

## MemPalace drawer candidates

Reads succeeded. The diary write was refused: `Peer MCP writer active; this server is read-only for mutating tools`. No retry, lease override, process termination or `[STATE]` update was attempted. Under MP-LEASE the write-enabled author may file the following with `added_by="OpenAI Codex / GPT-6 Astra"`:

> F9a specification scoped follow-up at repair `63982a4e8abd917cac61044a1987889c3dc19169`, base `901e576`, delivered in `docs/reviews/f9a-spec-codex-followup.md`. Verdict BLOCKED-ON §9 site-4 test plan. P1/P3/P6/P7 resolved at specification level; P2/P4/P5 partially resolved, SEV 2. New P8 SEV 1: the alleged passing control expects a confirmation-time update absent on base; a SEV-2 route prerequisite is also omitted, since a new dashboard reaches the ordinary dialog. New P9 SEV 3: legacy-profile vocabulary/reader inventory inaccurate, without demonstrated data loss. Existing preview witness passed headlessly; original storage/interleaving probes reproduced; current handler/provider probes expose pending-writer and cached-read boundaries. No source/specification/board/state changes or HA requests. Recommendation: one owner-authorized bounded continuation on material findings, accept P9 as-is; owner disposition pending. No new practice rule proposed.
