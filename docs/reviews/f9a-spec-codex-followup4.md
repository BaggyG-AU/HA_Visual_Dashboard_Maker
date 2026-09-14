**BLOCKED-ON: §9 known-source test setup, §9 Leg 13 residual pin**

# F9a specification — fourth scoped follow-up, 2026-09-14

**Author:** OpenAI Codex / GPT-6 Astra — same independent specification reviewer as the preceding rounds.
**Reviewer:** No cross-check of this review was commissioned or performed.
**Artifact author:** Claude Sonnet 5, specification and repairs.
**Owner gate:** Owner disposition and specification sign-off; this review does not decide the merge.
**Commissioned by:** Owner through `prompts/codex/f9a-spec-review-followup4.md`.
**Scope:** `120a516..57b232e`, the specification/dispositions repair and Round 4's declared radius. Reviewed head `57b232e96baadc273ea1383f9d8fd2120c72ccac`, matching fetched `origin/feature/f9a-spec`.

## 1. Verdict first

P10 is resolved; P8 and P2 are partially resolved because their new verification designs introduce P11 and P12 below. The isolated connection hook fixes the Browser's service/transport prerequisites, but its prescribed workflow cannot enter Live Preview; the residual test cannot deliver its promised passing characterization. **This is the THIRD occurrence of the same-seam trigger**, requiring the recurrence-framed owner decision before further repair.

## 1a. Owner Summary Table

The new defects are listed once, as P11/P12; their effects on P8/P2 are mapped in §3.

| Ref | What is wrong, in plain English                                                                                                                                                                | Severity | Blocks                     | Fix complexity (1–5) | Recommendation |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------- | -------------------- | -------------- |
| P11 | The replacement test setup can download a dashboard but leaves Live Preview disabled. It also requires a new shortcut that is missing when testing the old version.                            | SEV 1    | §9 known-source test setup | 3                    | Fix now        |
| P12 | The proposed test for the accepted limitation would not pass as promised: its old-version waiting point does not exist, and its chosen profile cannot produce the leftover styling it expects. | SEV 1    | §9 Leg 13 residual pin     | 3                    | Fix now        |

**What this protects:** dependable evidence that the warning agrees with the prepared dashboard, with the accepted exception accurately characterized and existing offline tests preserved.

**What is going wrong:** the replacement setup satisfies one connection check while explicitly removing the state required by the next screen. The new residual test copies a scheduling technique without supplying the different capability snapshots that make the styling mismatch possible, and promises a passing baseline around a write that baseline never performs.

**Product affected? Unknown for an implemented F9a.** These are demonstrated defects in the specification's evidence plan, which the implementer would inherit. No completed F9a implementation, real user incident, or frequency was measured. The owner's acceptance of the underlying P2 production risk stands; it does not establish that the new pin works.

**Third-occurrence decision brief:**

- **Continue:** repair the complete new-test setup and residual characterization together, including how the same meaningful assertions reach old and repaired behavior. Cost includes author design, discriminating probes, affected regression checks, dispositions and the required scoped follow-up. Duration and financial cost are unknown.
- **Declare residual:** explicitly accept P11/P12's incomplete evidence and the resulting specification-DoD exception, separately from the already accepted production risk. That saves the immediate cycle but does not demonstrate the missing coverage or provide a working pin.
- **Park:** stop further specification repair/implementation until this evidence design or its priority is reconsidered.

**Recommendation and mechanism judgement:** continue only with a coherent repair of the verification mechanism as a whole. **Yes, that mechanism needs to change:** its connection states, baseline availability, dialog lifetime and capability snapshots currently fail to form one executable journey. This evidence does **not** require a fourth redesign of the production write counter; its protection for writes already counted remains useful, and the owner has accepted the later-confirmation gap. Keep that production decision intact. Doing nothing leaves specification sign-off unsupported by its stated DoD.

## 2. Method and evidence boundary

Read the complete commission and dispositions, repair diff, specification, applicable template/trial/Operating Agreement text, prior findings and the source paths below. Retrieved the practice index by ID and the relevant review/evidence drawers; the adopted F9a/F6/F10 trial governs conflicts.

**Measured this round:**

- Fetched the commissioned branch and verified the clean starting checkout and exact reviewed head.
- `git diff --quiet 120a516..57b232e -- src tests CLAUDE.md ai_rules.md docs/governance docs/templates` returned **0**. Rounds 1–3 of the dispositions remain an unchanged byte prefix.
- Re-executed both embedded shell probes from `docs/reviews/f9a-spec-codex-followup3.md` §5, exit **0** each: overwrite, failed transport, picker source switch and retained-confirmation outputs matched that report. Its call inventory regenerated **41 expressions in 20 files**, including the shared DSL wrapper: **40 in 19 spec files**. Those source files are unchanged.
- Executed this review's §5 probe, exit **0**. It uses extracted current handlers, the actual connection/parser/export services, the exact proposed hook declaration, and explicitly identified in-memory models of the unbuilt option forwarding and confirmation rewrite. Positive controls distinguish failed setup from a dead probe and distinguish same-profile writes from conflicting-profile writes.

**Not established:** no new F9a implementation or test exists to run. No full App/Electron mounting, real pointer/keyboard/dialog journey, React scheduling fidelity, live HA deployment, packaged build or failure frequency was tested. In particular, the profile-interleaving probe is a model, not proof of organic UI reachability. Product unit/integration/e2e suites, repeatability runs and `./tools/checks` are **UNRUN**; §3.5's class-(d) implementation mandate does not apply to this specification review. Earlier suite results remain earlier evidence, not this round's independent reruns.

The stale `ai_rules.md` pointer `docs/releases/RELEASES.md` is absent; no release-policy conclusion relies on it. No live Issue/board state was queried; the supplied #159 contract and recorded owner ruling were used.

Proposed repairs remain advisory in this document. The specification, dispositions, prompt, source, tests, UAT, board and `[STATE]` were not edited; no merge, PR/Issue creation or new governance mechanism was undertaken.

## 3. Closures, radius and acceptance criteria

### Per-Ref disposition

| Ref | Disposition            | Independent result                                                                                                                                                                                                                                                                                                                 |
| --- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2  | **PARTIALLY RESOLVED** | D-5 `:544` and AC-17 `:798` explicitly preserve an owner-accepted production limitation. Acceptance is not reopened. The new mitigation's claim to pin it is unfulfilled; its live specification defect is graded under **P12**, not counted again here.                                                                           |
| P8  | **PARTIALLY RESOLVED** | Prior constructions A/B are addressed: separate-object registration survives both old assignments; the added connect stub reaches list/download. The replacement setup introduces a different failure at preview entry and an unavailable baseline prerequisite, **P11**.                                                          |
| P10 | **RESOLVED**           | The specification explicitly preserves both shared shortcut registrations and the shared DSL behavior. The new service-setting hook is separate and opt-in; no existing consumer is specified to call it. This resolves the shared-fixture widening risk at specification level, not by a claim that future suites already passed. |

P1/P3/P4/P5/P6/P7/P9 have no new regression identified within this repair/radius. P5's executed wrong-dependency sibling, the stored-profile read, timestamp discriminator, legacy normalization, known/unknown target distinction and Leg 10's separation of old behavior from new-write verification remain specified. P11 affects the feasibility of executing Leg 10's retained control.

### Independent radius and regression sweep

The swept behavior is **establishing an isolated offline source, entering preview, and coordinating profile-sensitive writes with both confirmations through the eventual temp-to-production read**.

| Surface                               | Result                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hook registration and shared shortcut | **No issue found in separation.** Spec `:193,1125` requires a separate global object and test-environment guard. Executing its declaration between the two unchanged registration passes preserves its identity. The shared shortcut still sets React state without configuring the service. Merging the new API onto the old object would contradict the explicit contract.                                                                 |
| Callers and downstream legs           | **One direct intended caller:** `establishKnownSourceDashboard` at spec `:1142`. No other current/new test is instructed to call the hook directly. However, the “only Legs 9–12” radius is incomplete: **Leg 13 also inherits the same setup** at `:1265`. The actual declared-flow consumers are Legs 9–13, verified by reading the complete leg sequence. This extends the reach of P11, without reviving P10's unrelated-test risk.      |
| Browser transport/download            | **No further failure found for the prescribed valid fixture.** Real `loadDashboards` and download handlers succeed with the specified connect/list/config results: one default Overview entry, parseable one-view/button content and a known default target. Parent download handling does not set React connection state (`src/App.tsx:2273`). Its no-entity fixture introduces no remapping prerequisite.                                  |
| Preview entry and baseline            | **P11.** Reviewed service, React and IPC connection states independently, both UI and handler guards, isolated launch and retained tests. A successful Browser download is insufficient for preview. The new hook is absent from the unchanged source baseline.                                                                                                                                                                              |
| Retired setup references              | **No live instruction found to use the widened shared shortcut.** Remaining mentions explain its withdrawal. The defect is the over-removal of React setup, not a surviving instruction to widen the shortcut.                                                                                                                                                                                                                               |
| Confirmation/write boundary           | Both first-dialog branches bind `onOk: onDeploy` (`src/components/HADashboardIframe.tsx:235,245`). Drag and resize share `handleLayoutChange` at `:449,450`. The balanced counter and Leg 12 retain the two-writer/out-of-order design; Leg 11 retains write-failure handling; Legs 9–11 distinguish the second dialog. **P12** affects the new residual characterization.                                                                   |
| Final consumer and residual scope     | The backend reads temp content at `src/services/haWebSocketService.ts:498` and copies it at `:501`; a later overwrite therefore matters. The already-started gesture/later-counted write is a narrower scheduling window than a write already pending before initial activation. Its real input reachability/likelihood remains unverified. The residual is an exception to the stronger words/bytes guarantee, not proof of that guarantee. |

This is a complete **hand trace of the specified paths in this radius**, corroborated by source searches and the probes. It is not an exhaustive enumeration of browser scheduling, real input devices, external HA writers or future implementation behavior.

Reproduce the source/caller inventory with the second embedded probe in the preceding review and:

```bash
rg -n '__testHAConnectionApi|establishKnownSourceDashboard|setConnected\(true\)' docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md
rg -n '__testThemeApi|setIsConnected|handleEnterLivePreview|onDeploy=' src/App.tsx
rg -n 'handleLayoutChange|onDragStop|onResizeStop|onOk:|disabled=' src/components/HADashboardIframe.tsx
```

### #159's criteria and DoD

| Criterion                                                                     | Result for this specification                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — no unresolved SEV 1; explicit material-defect disposition                 | **Not met without a new owner exception:** P11/P12 are live specification SEV 1s. The prior P2 acceptance does not accept defective evidence added afterward.                                                                                                                                                                    |
| 2 — absence strips/warns; words agree with emitted result                     | The stable-profile design still pairs report and successful rewrite, and Leg 11 specifies failure handling. **Adequate design for that bounded case; evidence plan incomplete** because P11 prevents reaching it and P12 does not pin the accepted exception. No universal safety claim or product demonstration is established. |
| 3 — present/never-connected controls and persisted capture after disconnect   | **No new product-rule defect found.** Existing derivation/storage/control requirements survive, and P10's shared-test risk is removed. The site-4 present control is still obstructed by P11.                                                                                                                                    |
| 4 — one capability object, layout-card source/unknown treatment, F9b consumer | **No issue found in scope.** Source/default/legacy handling and the disclosed conventional-folder uncertainty remain unchanged; no F9a consumer of layout-card is added.                                                                                                                                                         |
| 5 — affected paths/regressions, valid red and passing controls                | **Not adequate as written:** P11 invalidates setup/baseline applicability; P12 invalidates the new characterization. The preserved older unit/export plan does not establish these changed legs.                                                                                                                                 |

Specification DoD `:1323` (implementable/testable without further design judgement) and `:1333` (confirmed repairs/radius) cannot be confirmed. Owner sign-off/landing remains pending. The product DoD remains undemonstrated at this specification stage. The ordinary recommendation that the acceptance contract is met is therefore withheld for these specific defects, not for preferences about an already accepted residual.

### Load-bearing claims

| Claim                                                                                                                                  | Tag                                | Evidence                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| The isolated hook survives the old registrations and leaves the shared shortcut React-only.                                            | MEASURED                           | Exact declaration and current effects executed in §5; specification requires separate-object registration. |
| The specified service-only setup cannot enter preview; the required direct hook call is absent on base.                                | MEASURED                           | Current initialization/guards and §5's negative/positive route controls; no full Electron run claimed.     |
| Base has no confirm-time rewrite for Leg 13's wait.                                                                                    | MEASURED                           | Extracted current handler plus the specification's own Leg 9/10 baseline statements.                       |
| Same-profile repaired writes cannot supply Leg 13's demanded unstripped overwrite.                                                     | INFERRED for future implementation | MEASURED in the explicitly modeled option-forwarding probe, paired with a differing-profile control.       |
| The verification mechanism needs a coherent redesign; the production counter need not be redesigned to honor the current owner ruling. | JUDGEMENT                          | P11/P12, preserved pending-write protection and recorded acceptance of the production residual.            |

## 4. Findings

### P11 — NEW, SEV 1: the replacement known-source setup cannot run its promised preview/baseline journeys

**Blocks: §9 known-source test setup**

**Behavior/classification:** reach the production route under the specified offline setup, both before and after the feature change. **Both deliverable and reporting record**: the new instructions and Round 4's closure/radius claims are affected.

**Construction A — removed React prerequisite, SEV 1.**

1. **Broken contract:** spec `:1136` says nothing in Legs 9–12 needs React `isConnected` true; `:1157` removes the shared step, and `:1179` explicitly says no separate connection step is needed before entering preview.
2. **Violated fact:** `src/App.tsx:337` initializes that state to false; `:3349` disables Live Preview while false; `:2469` independently refuses entry while false even with a successful IPC connection check. The new hook calls only `haConnectionService.setConfig`, which writes service configuration/cache (`src/services/haConnectionService.ts:53`), not React state. Browser download never supplies that state transition.
3. **No recorded mitigation:** isolation is intentional, but no local React-state setup replaces the expressly removed step. A connection-success result from the new IPC stub has no effect on this React boolean. The Browser IPC call does not invoke App's connection handler.
4. **Reachability:** this is the clean offline launch and valid dashboard specified by the plan, not an invented adversarial input. The probe observes `connect → list → get default → Please connect to Home Assistant first`, with no temp creation. Setting the existing React shortcut as a diagnostic control reaches temp creation immediately.

The previous P8 wording left room to edit the effective registration; this revision expressly says the state is unnecessary and removes the step. That demonstrably false prerequisite claim makes the document unexecutable as written. The grade concerns the test-plan contract; it is not a claim to have run a future Electron suite.

**Construction B — new source hook missing on base, SEV 1.**

1. **Broken contract:** Legs 9/11/12 require meaningful red-on-base runs and Leg 10(a) requires a passing baseline (`:1190,1203,1228,1252`), using the new direct hook call at `:1143`.
2. **Violated fact:** that hook exists in the proposed `src/App.tsx` edit, not the reviewed source. Current source/test search finds no registration. Executing today's registration effects then making the prescribed call throws `TypeError` before downloading anything.
3. **No recorded mitigation:** the specification gives no baseline-compatible setup or stated arrangement retaining equivalent fixture infrastructure on the behavioral base. Its source-reversion technique (`:920`) would remove a new App hook too. A missing-hook error cannot count as the absent-card-mod red leg, and cannot pass the present control.
4. **Reachability:** the promised baseline run itself reaches this failure, using the required direct call; no hostile mutation is needed.

**Construction C — initial screen prerequisite omitted, SEV 2.** The same helper specifically clicks `toolbar-download` (spec `:1145`), but that control is inside App's `config &&` branch (`src/App.tsx:3216,3290`). The clean store starts with `config: null` (`src/store/dashboardStore.ts:103`); `waitUntilReady` only waits for the shell/palette (`tests/support/dsl/app.ts:20`), and the launcher does not load a dashboard. On that screen the existing Browser trigger is `welcome-browse-dashboards` (`src/App.tsx:3192`). No initial dashboard or initial-screen alternative is specified. This is a source-traced, incomplete UI prerequisite, not a measured Electron timeout; it is SEV 2. It predates Round 4 but is inside the declared helper radius, and previous review sweeps missed it. Granting this prerequisite does not cure A or B.

**Repair shape, advisory:** settle the complete initial-screen and per-test connection setup and identify how it is available on the actual behavioral baseline before crediting red/control results. Keep fixture-only prerequisites distinguishable from the behavior under test. Demonstrate Browser → preview → intended confirmation on both revisions before comparing the relevant outcome. The author chooses the implementation and wording.

**Must not change:** the shared shortcut's React-only contract, isolation of the new service hook, production connection guards, seeded capability independence, existing IPC response/delete semantics and the known-source target distinction. Do not make a passing control into a failure or weaken the assertions to accept setup errors.

**Complexity 3:** contained fixture design plus baseline/repaired route verification and affected regression checks.

**Class swept:** both old registrations, the new separate object, service/React/IPC prerequisites, download/parse/source assignment, preview UI/handler, both confirmations, and the baseline arrangements of Legs 9–13. Leg 13's inherited use also makes the dispositions' `:405` radius too narrow. No additional direct hook caller or shared-consumer change was found.

### P12 — NEW, SEV 1: Leg 13 does not provide its claimed passing residual pin

**Blocks: §9 Leg 13 residual pin**

**Behavior/classification:** characterize the accepted confirmation/write race with a test that passes while the gap is open and detects its closure. **Both deliverable and reporting record**: Leg 13/AC-17/D-5's pin assertion and the P2 disposition's safeguard claim depend on it.

**Construction A — nonexistent baseline waiting point, SEV 1.**

1. **Broken contract:** spec `:1273` releases the drag only after site 4's confirm-time rewrite completes, then `:1278` requires this leg to pass on base and after the repairs.
2. **Violated fact:** base `src/App.tsx:2580` computes warnings and opens its second dialog without a confirm-time `haWsUpdateTempDashboard` call. This review's extracted actual handler reaches `summary dialog` with zero confirm writes. The specification itself acknowledges this at `:1191` and `:1211`.
3. **No recorded mitigation:** Leg 13 has no separate baseline sequencing. Unlike Leg 10(b), it does not limit its new-write-dependent assertion to repaired code. Calling it `KNOWN-OPEN:` cannot create a missing synchronization event. P2's risk acceptance does not waive the new promised pin.
4. **Reachability:** even granting P11's setup repaired, the literal mandated baseline execution has no event on which its release condition can complete. This is a contradiction about the existing source and prescribed control, not a speculative race.

**Construction B — no conflicting capability snapshot, SEV 2.** Independently of baseline availability, `:1265` inherits Leg 9's captured-absent profile, but `:1275` expects the delayed drag to restore unstripped styling. No profile refresh or differing callback snapshot is specified. D-1 and the site-5 row (`:194`) instead require both paths to use the profile-aware sanitizer. Delaying `haWsIsConnected` changes timing, not the captured capability decision.

The probe grants the intended retained-dialog interleaving and executes the actual drag handler/exporter with only the specified option forwarding modeled in memory. Its results are:

- **Specified fixed-absent fixture:** confirm `card_mod=false`, later drag `card_mod=false`.
- **Diagnostic differing-profile control:** confirm `card_mod=false`, later drag `card_mod=true`.

The latter confirms the discriminator is live; it is not a production repro or a claim that the specification already supplies that snapshot transition. Geometry may still differ, but the leg expressly requires **unstripped** stale bytes. The previous review's witness used the unmodified, permissive site-5 sanitizer versus a modeled absent-capability confirm write; rerunning it unchanged cannot prove the new profile-aware leg passes. This construction is SEV 2 because the repaired behavior is modeled rather than implemented; Construction A independently supplies the finding's SEV 1 proof.

**Sequencing boundary:** a connection-check gate begins only after drag/resize stop, when the counter is already positive. It does not itself establish an in-progress gesture when the first dialog opens. The prior witness orders first dialog → drag stop/pending write → first OK/rewrite → delayed write. Leg 13 says to accept the first dialog while the drag is still unreleased and does not explain how pointer activation preserves that gesture or how an old profile reaches the later stop callback. Full UI reachability is **UNVERIFIED**, not declared impossible. Even granting it, Construction B remains.

**Repair shape, advisory:** make the characterization's revision applicability, capability snapshots, gesture/dialog ordering and observed final payload explicit and mutually compatible; prove its passing open-gap case and a discriminator that would fail if the covered gap closes. Keep the already accepted production residual unless the owner separately changes that ruling. No specification wording or synchronization architecture is prescribed.

**Must not change:** the counter's existing protection, current-profile export behavior, existing warning text, known-source safety, owner acceptance authority or the evidence distinction between a modeled callback schedule and real UI input.

**Complexity 3:** bounded characterization design and discriminating verification; a production redesign is not included.

**Class swept:** both `KNOWN-OPEN:` legs (6 and 13), the baseline status of Legs 9–13, both shared drag/resize stop bindings, the first/second modal boundary, sanitizer snapshot inputs and the backend temp read. Leg 6's narrower context-only claim is unchanged and is not a new finding. Legs 9–12's outcome distinctions remain coherent apart from P11; the new internally inconsistent pin is Leg 13.

**Same-seam conclusion for P11/P12:** these both sit in the site-4/site-5 confirm-and-test-setup mechanism. Together they constitute this follow-up's **THIRD occurrence**, not two additional recurrence rounds. The author must bring the explicitly recurrence-framed continue / declare-residual / park brief before another repair.

## 5. Reproduction

Run from the repository root at the reviewed head with installed dependencies. This is a disposable review instrument, executed through stdin: it writes no source/test file and makes no network/HA call. It is not an implementation, an Electron test or a new project gate. Every extraction and in-memory replacement has a liveness assertion.

```bash
node <<'JS'
const fs = require('node:fs'), assert = require('node:assert/strict'), ts = require('typescript');
const Module = require('node:module'), path = require('node:path');
const compile = s => ts.transpileModule(s, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  esModuleInterop: true, jsx: ts.JsxEmit.React,
} }).outputText;
for (const ext of ['.ts', '.tsx'])
  require.extensions[ext] = (m, f) => m._compile(compile(fs.readFileSync(f, 'utf8')), f);
function nodes(file, predicate) {
  const t = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const result = [];
  function visit(n) { if (predicate(n)) result.push(n.getText(t)); ts.forEachChild(n, visit); }
  visit(t); return result;
}
function evaluate(code, deps) { return new Function('deps', 'with(deps){' + compile(code) + '}')(deps); }
function handler(file, name, deps, change = s => s) {
  const matches = nodes(file, n => ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name);
  assert.equal(matches.length, 1, name);
  return evaluate('const ' + change(matches[0]) + '; return ' + name + ';', deps);
}
function replaceOnce(s, old, next) { assert.equal(s.split(old).length, 2, old); return s.replace(old, next); }
function gate() { let release; const promise = new Promise(r => { release = r; }); return { promise, release }; }
const { haConnectionService: service } = require('./src/services/haConnectionService.ts');
const { yamlService: baseYaml } = require('./src/services/yamlService.ts');
const { mergeEditedView, resolveLivePreviewDeployTarget } = require('./src/services/livePreviewDeploy.ts');
const logger = { info() {}, debug() {}, warn() {}, error() {} };
const config = { title: 'Probe', views: [{ cards: [{ type: 'button', style: 'color: red;' }] }] };

// Model only the specified options forwarding, in memory, using the real sanitizer/exporter.
const filename = path.resolve('src/services/yamlService.ts');
let source = fs.readFileSync(filename, 'utf8');
source = replaceOnce(source, 'sanitizeForHAWithReport(config: DashboardConfig)', 'sanitizeForHAWithReport(config: DashboardConfig, options: { cardModAvailable?: boolean } = {})');
source = replaceOnce(source, '      warnings,\n    }) as unknown as DashboardConfig;', '      warnings, cardModAvailable: options.cardModAvailable,\n    }) as unknown as DashboardConfig;');
source = replaceOnce(source, 'sanitizeForHA(config: DashboardConfig)', 'sanitizeForHA(config: DashboardConfig, options: { cardModAvailable?: boolean } = {})');
source = replaceOnce(source, 'return this.sanitizeForHAWithReport(config).config;', 'return this.sanitizeForHAWithReport(config, options).config;');
const modeledModule = new Module(filename, module);
modeledModule.filename = filename; modeledModule.paths = Module._nodeModulePaths(path.dirname(filename));
modeledModule._compile(compile(source), filename);
const repairedYaml = modeledModule.exports.yamlService;
const toExportCapabilityOptions = profile => ({ cardModAvailable: profile.capturedAt === null || profile.cardModPresent });
const absent = { capturedAt: '2026-09-14T00:00:00Z', cardModPresent: false };
const present = { ...absent, cardModPresent: true };
const hasStyle = value => !!value.views[0].cards[0].card_mod;
assert.equal(hasStyle(baseYaml.sanitizeForHA(config)), true);
assert.equal(hasStyle(repairedYaml.sanitizeForHA(config, toExportCapabilityOptions(absent))), false);
assert.equal(hasStyle(repairedYaml.sanitizeForHA(config, toExportCapabilityOptions(present))), true);

(async () => {
  const testWindow = {};
  let reactConnected = false;
  const effects = nodes('src/App.tsx', n => ts.isCallExpression(n) &&
    ts.isIdentifier(n.expression) && n.expression.text === 'useEffect' &&
    n.arguments[0]?.getText().includes('testWindow.__testThemeApi ='));
  assert.equal(effects.length, 2);
  const deps = { window: testWindow, useEffect: fn => fn(), isTestEnv: () => true,
    setIsConnected: value => { reactConnected = value; }, setAvailableThemes() {}, haConnectionService: service };
  service.disconnect();
  effects.forEach(e => evaluate(e, deps));
  assert.equal(testWindow.__testHAConnectionApi, undefined);
  assert.throws(() => testWindow.__testHAConnectionApi.connect({ url: 'http://example.invalid', token: 'test-token' }), TypeError);
  console.log('base setup: isolated hook absent; required direct call throws TypeError');

  // Execute the exact new hook declaration from the spec, not a hand-transcribed substitute.
  const spec = fs.readFileSync('docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md', 'utf8');
  const hook = spec.match(/\x60(window\.__testHAConnectionApi = \{ connect: \(config: \{ url: string; token: string \}\).*?)\x60/);
  assert.ok(hook);
  evaluate(hook[1], deps);
  const isolated = testWindow.__testHAConnectionApi;
  effects.forEach(e => evaluate(e, deps));
  assert.equal(testWindow.__testHAConnectionApi, isolated);
  testWindow.__testThemeApi.setConnected(true);
  assert.equal(service.isConnected(), false);
  testWindow.__testThemeApi.setConnected(false);
  isolated.connect({ url: 'http://example.invalid', token: 'test-token' });
  assert.equal(reactConnected, false); assert.equal(service.isConnected(), true);
  let dashboards, sourceDashboard, downloaded;
  const events = [], errors = [];
  const api = {
    haWsConnect: async () => { events.push('connect'); return { success: true }; },
    haWsListDashboards: async () => { events.push('list'); return { success: true, dashboards: [] }; },
    haWsGetDashboardConfig: async target => {
      assert.equal(target, null); events.push('get default'); return { success: true, config };
    },
    haWsIsConnected: async () => ({ connected: true }),
    haWsCreateTempDashboard: async () => { events.push('create temp'); return { success: true, tempPath: 'probe-temp' }; },
  };
  const defaults = nodes('src/components/DashboardBrowser.tsx', n => ts.isVariableDeclaration(n) && n.name.getText() === 'DEFAULT_DASHBOARD_ID');
  assert.equal(defaults.length, 1);
  const DEFAULT_DASHBOARD_ID = evaluate('const ' + defaults[0] + '; return DEFAULT_DASHBOARD_ID;', {});
  const common = { haConnectionService: service, logger, DEFAULT_DASHBOARD_ID,
    window: { electronAPI: api }, setLoading() {}, setError: e => { if (e) errors.push(e); } };
  await handler('src/components/DashboardBrowser.tsx', 'loadDashboards', {
    ...common, setDashboards: d => { dashboards = d; },
  })();
  assert.equal(dashboards.length, 1);
  await handler('src/components/DashboardBrowser.tsx', 'handleDownloadDashboard', {
    ...common, yaml: require('js-yaml'), setDownloading() {}, onClose() {},
    onDashboardDownload: (text, title, id, src) => { downloaded = baseYaml.parseDashboard(text); sourceDashboard = src; },
  })(dashboards[0]);
  assert.equal(downloaded.success, true); assert.equal(resolveLivePreviewDeployTarget(sourceDashboard).kind, 'known');
  assert.deepEqual(errors, []);
  const runEntry = () => handler('src/App.tsx', 'handleEnterLivePreview', {
    config: downloaded.data, isConnected: reactConnected, window: { electronAPI: api }, yamlService: baseYaml,
    message: { warning: s => events.push(s), loading() {}, success() {}, error: s => errors.push(s) },
    setTempDashboardPath() {}, setLivePreviewMode() {},
  })();
  await runEntry();
  assert.equal(events.includes('create temp'), false);
  console.log('specified setup:', JSON.stringify({ reactConnected, serviceConnected: service.isConnected(), events }));
  testWindow.__testThemeApi.setConnected(true); await runEntry();
  assert.equal(events.at(-1), 'create temp');
  console.log('diagnostic positive control: React connection state true reaches create temp');
  isolated.disconnect(); assert.equal(service.isConnected(), false);

  const baseEvents = [];
  await handler('src/App.tsx', 'handleDeployFromLivePreview', {
    tempDashboardPath: 'probe-temp', config, sourceDashboard, resolveLivePreviewDeployTarget, yamlService: baseYaml,
    summarizeExportWarnings: require('./src/services/exportWarningSummary.ts').summarizeExportWarnings,
    React: require('react'), Modal: { confirm: options => { baseEvents.push('summary dialog'); options.onCancel(); } },
    window: { electronAPI: { haWsUpdateTempDashboard: async () => { baseEvents.push('confirm write'); return { success: true }; } } },
  })();
  assert.deepEqual(baseEvents, ['summary dialog']);
  console.log('base site 4:', baseEvents, '; no confirm-write completion for Leg 13 to await');

  async function race(dragProfile) {
    const delayed = gate(), writes = [];
    const drag = handler('src/components/HADashboardIframe.tsx', 'handleLayoutChange', {
      config, activeView: config.views[0], activeViewIndex: 0, tempDashboardPath: 'probe-temp',
      profile: dragProfile, toExportCapabilityOptions, yamlService: repairedYaml, mergeEditedView, logger,
      setLayout() {}, onLayoutChange() {}, message: { error: s => { throw new Error(s); } },
      window: { electronAPI: {
        haWsIsConnected: () => delayed.promise,
        haWsUpdateTempDashboard: async (_, value) => { writes.push({ who: 'drag', value }); return { success: true }; },
      } },
    }, s => replaceOnce(s, 'yamlService.sanitizeForHA(mergedConfig)', 'yamlService.sanitizeForHA(mergedConfig, toExportCapabilityOptions(profile))'));
    let pending = 0, outer;
    handler('src/components/HADashboardIframe.tsx', 'handleDeploy', {
      deployTargetLabel: 'Overview', views: config.views, Modal: { confirm: c => { outer = c; } },
      onDeploy: () => {
        const report = repairedYaml.sanitizeForHAWithReport(config, toExportCapabilityOptions(absent));
        assert.ok(report.warnings.some(w => w.reason === 'card-mod-unavailable'));
        writes.push({ who: 'confirm', value: report.config });
      },
    })();
    pending++;
    const work = drag([{ i: 'card-0', x: 1, y: 0, w: 2, h: 2 }]).finally(() => pending--);
    outer.onOk(); delayed.release({ connected: true }); await work;
    assert.equal(pending, 0);
    return writes.map(w => ({ who: w.who, cardMod: hasStyle(w.value) }));
  }
  const specified = await race(absent);
  assert.deepEqual(specified, [{ who: 'confirm', cardMod: false }, { who: 'drag', cardMod: false }]);
  const discriminator = await race(present);
  assert.deepEqual(discriminator, [{ who: 'confirm', cardMod: false }, { who: 'drag', cardMod: true }]);
  console.log('Leg 13 fixed-absent fixture:', specified);
  console.log('different-profile diagnostic control:', discriminator);
})().catch(e => { console.error(e); process.exitCode = 1; });
JS
```

Expected key outputs: isolated hook absent on base; Browser succeeds but preview warns while React state remains false; setting that state reaches creation; base site 4 has no confirm write; fixed-absent interleaving is stripped/stripped, and differing-profile control is stripped/preserved.

## 6. Disagreements and trial close-out

**Disagreement with Round 4:** P8's two named old constructions are addressed, but the complete replacement setup is not resolved. P10's narrow shared-consumer closure is sound. P2's acceptance remains valid as an owner decision; the assertion that Leg 13 pins it is not supported. `57b232e` correctly recognizes the pin as a reviewable repair; no new defect was found in that correction's follow-up reasoning.

**#159 facts for this review:**

- **Criteria/evidence and owner disposition:** §3 records each criterion. The prior continue/narrower-hook and P2-residual ruling is recorded at dispositions `:394`. No owner decision on P11/P12 has been received.
- **Cycles:** one external scoped review delivered here, the fourth specification follow-up after the full first review, as identified by the commission's five review paths. No target repair or self-review → target repair → renewed-check cycle was performed by this reviewer. A final report/source consistency pass is verification of this report, not an additional independent round.
- **Owner interventions this turn:** the commission; no further clarification or approval interruption requested.
- **Repair regressions/escaped defects:** P11 A/B are introduced by the isolated-hook replacement/setup removal; P11 C is an inherited initial-screen prerequisite missed by earlier specification reviews, including Codex's. P12 is introduced by the new residual pin. No consequential defect in a shipped F9a implementation was observed. Both findings concern deliverable and reporting record.
- **What helped/repeated:** executing the complete dependency chain found the difference between Browser-ready and preview-ready; paired sanitizer controls exposed the copied witness's missing profile distinction. The recurring problem is verification designed around a local repair rather than its full route and baseline.
- **Failed/parked attempts:** the first inspection command used unavailable `python`; it was rerun with `python3`. Initial oversized reads were truncated and relevant text was reread in bounded sections. The first tool submission for the new probe had a JavaScript quoting error and executed nothing; the corrected submission ran successfully. No product implementation was attempted; no experiment was parked.
- **Elapsed/active effort and usage:** session metadata starts at `2026-09-14T00:06:38.083Z`; the `00:20:48 UTC` report-verification checkpoint is approximately **14 minutes 10 seconds** later, not final completion time. Active effort, monetary cost and usage attributable solely to individual findings are **unknown**. The session's `00:20:27.755Z` usage checkpoint records **3,294,158 input tokens**, including **3,114,112 cached input tokens**, **21,165 output tokens**, **4,665 reasoning output tokens**, and **3,315,323 total tokens**. Reasoning is reported as its own counter, not added again to the total. These cumulative counters include repeated/cached context and are not unique-text counts or final-turn totals. Session identifier `01a09d3c-bad4-7f00-a8a8-734d3cb93568`; session file `/home/micah/.codex/sessions/2026/09/14/rollout-2026-09-14T10-06-38-01a09d3c-bad4-7f00-a8a8-734d3cb93568.jsonl`.

**Weakest claims:** real-user reachability and likelihood of P2's accepted input sequence; fidelity of the in-memory future sanitizer/counter model; cost of another author repair cycle. None is presented as a measured production result.

## MemPalace drawer candidates

MemPalace reads succeeded; the attempted review-drawer write was refused with **Peer MCP writer active; this server is read-only for mutating tools**. No drawer or diary entry was filed. Under MP-LEASE, the write-enabled author should file the following with `added_by="OpenAI Codex / GPT-6 Astra"`; no lease override, process termination or retry was attempted.

**[REVIEW]** Fourth F9a specification follow-up reviewed `120a516..57b232e` on `feature/f9a-spec`. P2/P8 partially resolved; P10 resolved. New P11 blocks the known-source test setup: service-only configuration leaves Live Preview disabled, and its new source hook is missing on the promised baseline. New P12 blocks Leg 13's pin: its baseline wait targets a nonexistent rewrite; its fixed-absent fixture also cannot produce the claimed unstripped overwrite under the modeled repaired sanitizer. Both are defects of the deliverable and consequential reporting record. This is the THIRD confirm-and-test-setup recurrence. Repair the verification mechanism coherently if the owner continues; do not infer authorization to redesign the accepted production residual. Source-extracted and in-memory probes passed their diagnostic assertions; no Electron UI/product acceptance run or shipped F9a defect was established. Owner disposition of P11/P12 is pending. Full grade proofs, radius, evidence limits and trial facts: `docs/reviews/f9a-spec-codex-followup4.md`. No source, tests, specification, dispositions, board, UAT or `[STATE]` change.
