**CLEAR-WITH-FINDINGS**

# F9a specification — third scoped follow-up, 2026-09-14

**Author:** OpenAI Codex / GPT-6 Astra — same independent specification reviewer as the three preceding rounds.
**Reviewer:** No cross-check of this review was commissioned or performed.
**Artifact author:** Claude Sonnet 5, specification and repairs.
**Owner gate:** Owner disposition of findings and specification sign-off.
**Commissioned by:** Owner through `prompts/codex/f9a-spec-review-followup3.md`.
**Scope:** `2b5f174..8d3b4fe`, specification/dispositions repair plus Round 3's declared radius. Reviewed head `8d3b4fecf352011d2d78099360a6f5fe9093f61c`, on `feature/f9a-spec`, matching the fetched remote.

## 1. Verdict first

P5 is resolved at specification level; P2 and P8 remain partially resolved at SEV 2, and new P10 records a SEV 2 risk introduced by widening the shared test shortcut. No SEV 1 remains in this scoped review. **This is the second occurrence of the same-seam trigger:** the author must flag the recurrence in the owner's design-wide continue / declare-residual / park brief before further repair.

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                                                                   | Severity | Blocks | Fix complexity (1–5) | Recommendation         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | ---------------------- |
| P2  | Disabling the preview button does not protect a confirmation already opened before an edit starts saving. That edit can still compete with the dashboard prepared for deployment. | SEV 2    | None   | 3                    | Owner judgement needed |
| P8  | The revised test setup can still stop before downloading its dashboard: its changed shortcut is overwritten, and a separate connection attempt remains uncontrolled.              | SEV 2    | None   | 2                    | Fix now                |
| P10 | Making the shared shortcut connect to a dummy server would also make unrelated offline tests bypass their saved entity data and attempt network requests.                         | SEV 2    | None   | 3                    | Owner judgement needed |

**What this protects:** agreement between the warning a user approves and the deployed dashboard, demonstrated through tests that reach the relevant behavior while preserving existing regression coverage.

**What is going wrong:** the new counter solves the previously demonstrated ordering of writes already counted, but the first confirmation retains a later action independent of the now-disabled preview button. The route repair also targets a registration that is overwritten and still omits a separate connection call. Making its intended shared behavior effective broadens the impact beyond the new tests.

**Product affected? Unknown for a completed F9a implementation.** No implementation exists. Controlled probes reproduce the callback, registration and data-source mechanisms. The complete keyboard/drag/dialog journey and existing suites with the proposed change are unrun; no live HA incident or failure frequency was measured.

**Owner choice — explicitly the second recurrence, not another routine instance patch:**

- **Renew continue:** authorize one coherent treatment of confirmation through deployment and an offline fixture setup with an accurate consumer radius. Cost includes author design, discriminating evidence, regression checks, dispositions and the required scoped follow-up; duration and financial cost are unknown.
- **Declare residual:** explicitly accept the remaining P2/P8/P10 risks and unverified criteria by Ref. This avoids immediate repair cost but leaves the warning guarantee and evidence incomplete; they must stay recorded as exceptions.
- **Park:** stop further F9a specification repair/implementation pending a different design or priority decision. This avoids another automatic cycle while leaving the product outcome undelivered.

**Recommendation:** do not recommend ordinary acceptance against criteria 2/5. If the owner renews continuation, settle the whole confirmation boundary and keep the new fixture's needs local or explicitly cover the shared change's consumers. The evidence does not establish a need to cross the locked provider/global/off-path-parameter cost stop-rule. Doing nothing leaves sign-off and implementation authorization pending.

## 2. Method and evidence boundary

Read the full commission, the complete dispositions, the repair diff, affected specification decisions/tests, the previous live findings, and relevant current source/consumer paths. The practice index was retrieved by its canonical ID; the relevant repair and evidence rules were applied with the adopted F9a/F6/F10 trial taking precedence. The template and governance read earlier in this session remain unchanged over this repair.

Measured this round:

- Fetched `origin feature/f9a-spec`; the starting branch/tree matched the commissioned repair and was clean.
- Rounds 1–2 of the dispositions remain an unchanged byte prefix. `git diff --quiet 2b5f174..8d3b4fe -- src tests CLAUDE.md ai_rules.md docs/governance docs/templates` returned 0.
- Enumerated the deployment callback references and both layout-event bindings, both registrations of the test backdoor, production readers of the connection service, and direct test call expressions. The latter inventory is **41 expressions in 20 files**, including the shared wrapper: **40 expressions in 19 test-spec files**, at this head. The reproduction below regenerates the inventory.
- Executed the embedded offline probes against extracted current handlers/effects, the actual connection/entity-source services, and the installed drag core. Proposed behavior is modeled explicitly in memory; no source/test file was edited.

**What was not established:** the new counter, widened shortcut, hook and test helpers remain unbuilt. The counter/confirmation result is a controlled callback interleaving, not a full Electron UI or keyboard-reachability test. The backdoor probe executes extracted effect bodies in their source order, not a mounted App. The entity-source probe changes the actual service state and stubs failed external calls; it does not run an existing e2e suite with the future repair. These limits cap the findings at SEV 2.

All new F9a tests, product unit/integration/e2e suites, repeatability runs, `./tools/checks`, packaged builds and live HA are **UNRUN** this round. No window was launched or HA request sent. This specification follow-up is not a class-(d) implementation review requiring §3.5's implementation runs. Earlier preview/memo evidence remains applicable to unchanged source, as recorded at `63982a4` / `74ddf35` in the preceding reviews; it is not fresh acceptance evidence for this design.

Proposed changes are confined to this review. No specification/dispositions/prompt, implementation, test source, board, UAT or `[STATE]` mutation, merge, PR/Issue creation, or new process rule/checker/gate/ledger was performed.

## 3. Closures, radius and criteria

### Per-Ref disposition

| Ref | Disposition                    | Result                                                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2  | **PARTIALLY RESOLVED — SEV 2** | Spec D-5 `:493-509` replaces latest-only tracking with a count and balanced cleanup. This addresses overlapping writes that start before the preview button is activated. The already-issued first confirmation is outside the button's later disabled state; §4 gives the remaining construction.                              |
| P8  | **PARTIALLY RESOLVED — SEV 2** | The two-dialog sequencing is now explicit at spec `:1076-1090` and Legs 9–11. The known default target and corrected Leg 10 baseline remain sound. The offline connection path remains incomplete, including the effective backdoor registration.                                                                               |
| P5  | **RESOLVED**                   | Spec `:822-840` replaces quotation-only proof with the same computation and old dependency array executed against both independent transition cases; the wrong sibling must stay stale while the real hook updates. AC-16 and the file table agree. This is an adequate test design, not a claim that its unbuilt tests passed. |

P1/P3/P4/P6/P7/P9 remain previously resolved; no regression in their settled claims was identified within this diff/radius. P10 is new because the repair introduces a shared-fixture side effect, distinct from P8's failure to reach the new browser journey.

### Independent radius verification

| Repair | Actual dependency/consumer chain                                                                                                                                  | Assessment                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2     | Layout drag/resize → local write counter → preview button → first modal's retained `onOk` → App → successful rewrite → warning modal → backend temp read/copy.    | The sole production App consumer is `src/App.tsx:3359`; the only reference passing `handleDeployFromLivePreview` is its `onDeploy` prop at `:3367`. No separate shortcut/backdoor/direct caller was found. Both source-target branches retain `onDeploy` in `HADashboardIframe.tsx:235` / `:245`. Removing the proposed prop/ref reduces edits, but does not make the verification radius local to the component. |
| P8(A)  | Two App effects assign the same global API → shared DSL/direct callers → connection service → Browser's connect/list/download path, plus other service consumers. | **Radius incomplete.** Spec `:1057` names the earlier effect; the later registration is consequential. Service configuration also does not replace `haWsConnect`. The widened contract's other consumers are P10.                                                                                                                                                                                                 |
| P8(B)  | Preview button → first generic modal → App handler → second warning modal or error/ordinary route.                                                                | **Resolved descriptive repair.** Legs 9/10 accept the first before inspecting the second; Leg 11 specifically forbids the second on rewrite failure. Leg 12 tests the preview button without requiring a click while disabled. No new dialog copy/testid or product-flow change is needed.                                                                                                                        |
| P5     | Same hook computation → real versus old dependency arrays → identical independent profile transitions → report identity/content and unchanged-input control.      | Test-plan-only change; D-5a's behavior, lazy gate, primitive dependencies and App wiring are unchanged in this repair. No additional consumer change found.                                                                                                                                                                                                                                                       |

### #159 acceptance criteria and DoD

| Criterion                                                                               | Result for the specification's design/test plan                                                                                                                                                                   |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — no unresolved SEV 1; explicit acceptance of another material defect                 | **No SEV 1 in this scope.** P2/P8/P10 require owner disposition; the previous “one more bounded fix” ruling does not accept these newly reported remainders/risks.                                                |
| 2 — captured absence strips/warns; pre-deploy words agree with result                   | Strip-and-warn design retained. **Not fully established:** the confirmation lifetime remains P2, and its test route remains P8.                                                                                   |
| 3 — present/never-connected preserved; persisted capture authoritative after disconnect | The derivation, independent storage read, timestamp discriminator and valid product controls remain specified. **No new product-rule defect found.** P10 leaves relevant regression-test behavior unverified.     |
| 4 — shared capability object; layout-card source/unknown treatment; F9b consumer        | **Adequate within this scope.** The source, default/legacy normalization and deferred F9b consumer are unchanged. No new live installation evidence is claimed.                                                   |
| 5 — affected paths/regressions; valid red and passing controls                          | P5's negative control and Leg 12's two-writer case improve the plan. **Still incomplete:** P2's later continuation, P8's executable route and P10's shared-test radius. Leg 10's previous SEV 1 remains resolved. |

The specification's §10.1 correctly retains scoped confirmation, owner sign-off and landing as pending. Its claim that the decisions/evidence plan are settled cannot be confirmed while these findings remain. The product DoD is still undemonstrated at this specification stage; no implementation acceptance is inferred.

### Load-bearing claims

| Claim                                                                                                                                | Evidence status                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| The later App registration overwrites the earlier one; Browser still calls connect; service configuration changes the picker source. | **MEASURED** in current source and the extracted-handler/service probes below.                                                               |
| A first-modal callback can run with a subsequently positive counter.                                                                 | **MEASURED in a controlled current-callback/design-model interleaving.** Full UI reachability and eventual F9a behavior remain **INFERRED**. |
| The widened fixture threatens existing test isolation/data assumptions.                                                              | Service effect **MEASURED**; future suite failures **INFERRED**, not reported as observed failures.                                          |
| P5 is adequately repaired in the specification; remaining risks are SEV 2.                                                           | **JUDGEMENT** against the specified test contract and template's evidence/reachability rules.                                                |

**Weakest claims:** P2's real user sequence, particularly keyboard activation during an unfinished drag, has not been demonstrated in Electron. P10 does not establish which existing assertions fail after implementation. Neither uncertainty supports a blocking finding or blanket clearance.

## 4. Findings — severity-ranked and class-swept

### P2 — PARTIALLY RESOLVED, SEV 2: an issued confirmation outlives the button check

**Resolved:** a correctly maintained count addresses multiple already-started writes completing in either order. D-5 places the increment inside the write guard and the decrement in `finally`, covering successful, failed and disconnected early-return outcomes. Leg 12 at spec `:1148` observes the two-writer, reverse-settlement case rather than the previous single slot. The no-temp disabled condition and rewrite-failure stop remain.

**Remaining behavior:** the preview button only gates creation of the first confirmation. That confirmation stores `onOk: onDeploy` (`src/components/HADashboardIframe.tsx:226-245`) and is not updated by the local pending count. Disabling the underlying button later does not revoke its already-issued continuation.

An edit gesture also exists before its write is counted: the component connects writes only to `onDragStop` and `onResizeStop` (`:449-450`). The installed drag core registers stop listeners on the document (`node_modules/react-draggable/build/cjs/DraggableCore.js:144-145`) and calls `onStop` after an active drag (`:186-205`). The grid forwards that stop into its consumer (`node_modules/react-grid-layout/dist/chunk-KEM2G3LX.js:819`). Opening a modal does not remove that document listener. Ant Design also schedules modal rendering asynchronously (`node_modules/antd/lib/modal/confirm.js:91`); its mask is not a synchronous cancellation of a gesture already under way.

**Controlled construction:** begin a drag while the count is zero; invoke the enabled preview action, which issues the first confirmation; finish the drag, starting a held layout write and making the count positive; accept the retained first-modal callback. The probe observes:

`outer OK with pending=1 → confirm stripped → older write`

The callback/drag behavior is current code; the counter and confirmation rewrite are models of the proposed design. The payload example supplies differing capability snapshots to expose a warning/byte mismatch. Background capture can refresh profile state, and the first modal retains an earlier-render callback; the full correlation of those snapshots and a user's keyboard/pointer sequence is **not demonstrated** here. The narrower measured conclusion is that the disabled-button condition does not guard this continuation.

**Mitigation/test gap:** a modal prevents starting ordinary new canvas interaction once active, but does not establish that an existing gesture's stop cannot start a write. Leg 12 begins both writes before examining the button; it does not exercise a continuation already issued at count zero. The backend still reads the temporary dashboard after backup work (`src/services/haWebSocketService.ts:485-501`).

**Severity:** SEV 2 — an unclosed lifetime boundary and overstated guarantee at spec `:509`, supported by a controlled interleaving, without a demonstrated completed-feature/UI occurrence. No SEV 1 exemption is claimed.

**Repair shape, advisory:** settle the interval from gesture/write start through all already-issued confirmations and the eventual temp read; prevent or safely handle writers that become pending after the first gate. Exercise the retained-modal case alongside no-writer, pre-existing writer, reverse completion, failure/cancel and re-enable controls. Sonnet chooses the mechanism. Complexity 3 assumes a contained interaction change and its tests.

**Must not change:** successful rewrite before warning, single report/payload derivation, source-target behavior, never-connected/present controls, balanced failure cleanup, or the locked cost boundary. This does not recommend reinstating latest-only tracking.

**Class/seam sweep:** traced both layout producers; guard/success/failure/early return; zero/one/multiple pending writes; writes started before the first click versus from an already-active gesture afterward; both known/unknown first-modal callbacks; second confirmation/cancel; profile/config snapshots; close/unmount and new-preview identity; and the backend read. No separate direct handler entry was found. **An exhaustive runtime sweep is not possible against an unbuilt counter and unrun Electron gestures**; no universal UI clearance is claimed.

**Same seam and recurrence:** the approved warning must describe the temporary dashboard later consumed for deployment. This is a further live site in that same behavior. Together with P8, it is **the second occurrence of the commission's same-seam trigger**, requiring an explicitly recurrence-flagged owner decision about the design as a whole before further repair.

**Classification: both deliverable and reporting record.**

### P8 — PARTIALLY RESOLVED, SEV 2: the route fix still does not provide a working offline connection

**Resolved:** the two confirmations are named and sequenced correctly; known default-source metadata and the corrected before/after control remain valid. No issue found in P8(B)'s descriptive repair.

**Construction A — effective registration, SEV 2:** spec `:1057-1063` and the App file-table row direct the change at `src/App.tsx:569-571`. A later effect assigns the same `window.__testThemeApi` again at `:2175-2176`, with the original state-only callback; it is not protected by the earlier `isTestEnv()` condition. Executing the earlier effect with the specified widening, then the unchanged later effect, yields:

`reactConnected=true; serviceConnected=false; registrations=2`

Thus editing the named registration alone does not deliver the claimed fixture behavior. “Widen the backdoor” could be interpreted to include its effective registration too, so this is an incomplete instruction/verification radius rather than an assertion that no implementation can work. The existing duplicate/ungated registration is not independently commissioned for general cleanup.

**Construction B — missing transport stub, SEV 2:** even if service configuration is made effective, Browser invokes `haWsConnect(config.url, config.token)` before listing (`src/components/DashboardBrowser.tsx:115-123`). The existing four preview stubs (`tests/e2e/live-preview-deploy.spec.ts:28-38`) and the two proposed Browser stubs (spec `:1037-1043`) still omit that call. The new dummy service URL is not a successful connection. A controlled failed connect reproduces `connect → controlled connection failure`, with no list call. This dependency was explicitly included in the previous P8 at `docs/reviews/f9a-spec-codex-followup2.md:122-124`; configuring the service resolves only its first half.

**Repair shape, advisory:** make the intended offline configuration effective at the actual API registration, and supply controlled successful/failed connection behavior through the complete browser chain before asserting download/confirmation outcomes. Preserve the intended seeded capability profile. Avoid expanding shared fixture behavior without addressing P10. Complexity 2 covers local fixture ownership and missing IPC coverage.

**Must not change:** production routing/dialog behavior, known-versus-unknown target distinction, genuinely passing controls, preserved stub result/delete semantics, or the intended test-only boundary.

**Class swept:** both API registrations and cleanup; DSL and direct callers; renderer/service/WebSocket connection distinctions; Browser connect/list/config/parse/source steps; preview creation; first/second dialog, rewrite failure and button-only Leg 12; seeded profile/capture independence. The remaining route dependencies are bundled here, not reported one leg at a time. The shared-consumer regression risk is separately P10.

This is within the confirmation-test seam and independently activates the **second recurrence** even without accepting P2's unrun UI sequence as demonstrated product behavior.

**Classification: both.**

### P10 — NEW, SEV 2: widening the shared connection shortcut changes unrelated fixtures

**Evidence:** the new behavior at spec `:1059` unconditionally configures the service with a dummy URL for existing `setConnected(true)` callers. Round 3's P8 radius says downstream is “Legs 9–12's own setup steps only” (`docs/reviews/f9a-spec-repair-dispositions.md:290`). The call inventory contains 19 existing spec files, including direct callers that bypass the DSL wrapper.

The distinction matters to current behavior. `loadPickerEntities` chooses its source using this service (`src/services/entityPickerSource.ts:55-75`): disconnected reads the persisted cache, while connected calls `haConnectionService.fetchEntities()`. The latter calls REST at the configured URL and throws on failure (`src/services/haConnectionService.ts:97-116`); it does not fall back to the persisted entity list. The probe provides the same cached entity in both cases and observes:

`cache → http://example.invalid/api/states`, with the second read rejecting.

Current fixtures deliberately combine the React-only shortcut with seeded caches: e.g. `tests/e2e/multi-entity.spec.ts:166-176`, `tests/e2e/attribute-display.spec.ts:118-120`, and `tests/integration/core-card-coverage.spec.ts:118-122`. Setting the live entity-context map is not a substitute for either the persisted cache or a REST stub. The actual picker error state is observable in `src/components/EntityMultiSelect.tsx:69-72`.

There is also a concrete extra connection path in the existing preset tests: `tests/e2e/preset-marketplace.spec.ts:30-33` and its integration twin call the shortcut, then the Browser-based helper `tests/support/dsl/presetMarketplace.ts:7-28`. Configuring the service enables Browser's previously skipped connect/list effect before the helper switches to the local preset tab. The new F9a stubs are not installed by those tests.

**Consequence/grade:** SEV 2. The source-selection/request change is measured with controlled failures; specific future e2e assertion failures are **not** measured. This is an unmitigated shared-fixture regression risk and a wrong radius, not evidence of a current shipped-product regression. It applies if the intended widening is made effective despite P8's overwrite.

**Repair shape, advisory:** isolate the new Browser fixture's configuration/transport needs, or explicitly account for and verify the wider shared contract across its current consumers. Preserve existing cache-based tests' data sources or supply equivalent controlled data where their contract intentionally changes. Complexity 3 reflects shared setup plus affected regression coverage; no production behavior expansion is requested.

**Must not change:** unrelated tests' valid offline/cached assumptions, test-environment isolation, false/disconnect controls, or product behavior merely to accommodate a fixture.

**Class swept:** all 41 direct call expressions were enumerated and their setup contexts checked. They group into preview, preset, entity/card/property, theme and offline-control consumers. Production service readers were traced across Browser, DeployDialog, PropertiesPanel's stream check, and the shared entity loader's five consumers: EntitySelect, EntityMultiSelect, EntityBrowser, EntityRemappingModal and ConditionalVisibilityControls. The entity-type wizard independently reads the cache; the theme path uses React state/IPC; false controls still disconnect. These distinctions prevent claiming that all 19 specs necessarily fail. No changed-suite run or all-consumer behavioral clearance is claimed.

This is **repair-generated overreach**, not another missing Browser connection step. It sits in the known-source test-setup part of the commission's same seam and reinforces the recurrence briefing.

**Classification: both.**

## 5. Reproduction

Run from the repository root at the reviewed head. Installed dependencies are used. All invoked external calls are stubbed; no Electron process, network request, source edit or test-source edit is involved. The models below are review instruments, not an F9a implementation.

```bash
node <<'JS'
const fs = require('node:fs'), assert = require('node:assert/strict'), ts = require('typescript');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<html><body><div id="drag"></div></body></html>', { url: 'http://example.invalid' });
global.window = dom.window; global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
const compile = s => ts.transpileModule(s, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  esModuleInterop: true, jsx: ts.JsxEmit.React,
} }).outputText;
for (const ext of ['.ts', '.tsx'])
  require.extensions[ext] = (m, f) => m._compile(compile(fs.readFileSync(f, 'utf8')), f);
function tree(file) { return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX); }
function nodes(file, predicate) {
  const t = tree(file), result = [];
  function visit(n) { if (predicate(n)) result.push(n.getText(t)); ts.forEachChild(n, visit); }
  visit(t); return result;
}
function evaluate(code, deps) { return new Function('deps', 'with(deps){' + compile(code) + '}')(deps); }
function handler(file, name, deps) {
  const matches = nodes(file, n => ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name);
  assert.equal(matches.length, 1, name);
  return evaluate('const ' + matches[0] + '; return ' + name + ';', deps);
}
function gate() { let release; const promise = new Promise(r => { release = r; }); return { promise, release }; }
const { haConnectionService: service } = require('./src/services/haConnectionService.ts');
const { loadPickerEntities } = require('./src/services/entityPickerSource.ts');
const { yamlService } = require('./src/services/yamlService.ts');
const { exportDashboard } = require('./src/services/yamlConversionService.ts');
const { mergeEditedView } = require('./src/services/livePreviewDeploy.ts');
const logger = { info() {}, debug() {}, warn() {}, error() {} };
(async () => {
  // Probe the specified edit location, with the later registration unchanged.
  const effects = nodes('src/App.tsx', n => ts.isCallExpression(n) &&
    ts.isIdentifier(n.expression) && n.expression.text === 'useEffect' &&
    n.arguments[0]?.getText().includes('testWindow.__testThemeApi ='));
  assert.equal(effects.length, 2);
  let reactConnected = false;
  const deps = { window, useEffect: fn => fn(), isTestEnv: () => true,
    setIsConnected: value => { reactConnected = value; },
    setAvailableThemes() {}, haConnectionService: service };
  const proposedFirst = effects[0].replace(
    'setConnected: (connected: boolean) => setIsConnected(connected)',
    "setConnected: (connected: boolean) => { setIsConnected(connected); if (connected) haConnectionService.setConfig({ url: 'http://example.invalid', token: 'test-token' }); else haConnectionService.disconnect(); }");
  assert.notEqual(proposedFirst, effects[0]);
  service.disconnect();
  evaluate(proposedFirst, deps); evaluate(effects[1], deps);
  window.__testThemeApi.setConnected(true);
  assert.equal(reactConnected, true); assert.equal(service.isConnected(), false);
  console.log('backdoor overwrite:', { reactConnected, serviceConnected: service.isConnected(), registrations: effects.length });

  // Assume both registrations are made effective; the browser still connects.
  service.setConfig({ url: 'http://example.invalid', token: 'test-token' });
  const events = [];
  const load = handler('src/components/DashboardBrowser.tsx', 'loadDashboards', {
    haConnectionService: service, logger, setLoading() {}, setDashboards() {},
    setError: error => { if (error) events.push(error); },
    DEFAULT_DASHBOARD_ID: 'lovelace',
    window: { electronAPI: {
      haWsConnect: async () => { events.push('connect'); return { success: false, error: 'controlled connection failure' }; },
      haWsListDashboards: async () => { events.push('list'); return { success: true, dashboards: [] }; },
    } },
  });
  await load();
  assert.deepEqual(events, ['connect', 'controlled connection failure']);
  console.log('browser after service configuration:', events);

  // Real picker source before/after the proposed shared service-state change.
  const calls = [];
  const cached = [{ entity_id: 'light.alpha', state: 'on', attributes: {} }];
  window.electronAPI = {
    getCachedEntities: async () => { calls.push('cache'); return { success: true, entities: cached }; },
    getCachedEntityRegistry: async () => ({ success: true, entries: [] }),
    haWsFetchEntityRegistry: async () => ({ success: false }),
    haFetch: async url => { calls.push(url); return { success: false, error: 'controlled offline failure' }; },
  };
  service.disconnect();
  assert.equal((await loadPickerEntities()).source, 'cached');
  service.setConfig({ url: 'http://example.invalid', token: 'test-token' });
  await assert.rejects(loadPickerEntities(), /controlled offline failure/);
  assert.deepEqual(calls, ['cache', 'http://example.invalid/api/states']);
  console.log('shared-backdoor effect on picker:', calls, '; second read rejects despite cached entities');
  service.disconnect();

  // Current drag core + current iframe handlers; the counter/rewrite are models
  // of the proposed design. This is not an Electron or keyboard-reachability test.
  const config = { title: 'Probe', views: [{ cards: [{ type: 'button', style: 'color: red;' }] }] };
  const waiting = gate(), race = [];
  let pending = 0, temp, work, outer;
  const write = handler('src/components/HADashboardIframe.tsx', 'handleLayoutChange', {
    config, activeView: config.views[0], activeViewIndex: 0, tempDashboardPath: 'probe-temp',
    setLayout() {}, onLayoutChange() {}, yamlService, mergeEditedView, logger,
    message: { error() {} },
    window: { electronAPI: {
      haWsIsConnected: () => waiting.promise,
      haWsUpdateTempDashboard: async (_, value) => { temp = value; race.push('older write'); return { success: true }; },
    } },
  });
  const { DraggableCore } = require('react-draggable');
  const core = new DraggableCore({
    ...DraggableCore.defaultProps, nodeRef: { current: document.getElementById('drag') },
    onStop: () => {
      pending++;
      work = write([{ i: 'card-0', x: 0, y: 0, w: 2, h: 2 }]).finally(() => { pending--; });
    },
  });
  core.componentDidMount();
  document.getElementById('drag').addEventListener('mousedown', core.onMouseDown);
  document.getElementById('drag').dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
  assert.equal(core.dragging, true);
  assert.equal(pending, 0); // D-5 counts writes, which only start at drag stop.
  handler('src/components/HADashboardIframe.tsx', 'handleDeploy', {
    deployTargetLabel: 'Overview', views: config.views,
    Modal: { confirm: c => { outer = c; } },
    onDeploy: () => {
      race.push('outer OK with pending=' + pending);
      const warnings = [];
      temp = exportDashboard(config, { cardModAvailable: false, warnings });
      assert.ok(warnings.length); race.push('confirm stripped');
    },
  })();
  document.dispatchEvent(new window.MouseEvent('mouseup', { bubbles: true, clientX: 12, clientY: 12 }));
  assert.equal(pending, 1);
  outer.onOk();
  waiting.release({ connected: true }); await work;
  assert.equal(pending, 0);
  assert.ok(temp.views[0].cards[0].card_mod);
  assert.deepEqual(race, ['outer OK with pending=1', 'confirm stripped', 'older write']);
  console.log('already-issued confirmation:', race);
  core.componentWillUnmount(); dom.window.close();
})().catch(e => { console.error(e); process.exitCode = 1; });

JS
```

Regenerate the shared-call inventory (AST call expressions, excluding comment matches):

```bash
node <<'JS'
const ts = require('typescript'), fs = require('fs'), cp = require('child_process');
const rows = [];
for (const file of cp.execFileSync('rg', ['--files', 'tests'], { encoding: 'utf8' }).trim().split('\n').filter(f => /\.tsx?$/.test(f))) {
  const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  function visit(n) {
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'setConnected')
      rows.push({ file, line: tree.getLineAndCharacterOfPosition(n.getStart(tree)).line + 1, args: n.arguments.map(a => a.getText(tree)) });
    ts.forEachChild(n, visit);
  }
  visit(tree);
}
console.log(JSON.stringify({ calls: rows.length, files: new Set(rows.map(r => r.file)).size, rows }, null, 2));
JS
```

## 6. Trial close-out and disagreements

This is **specification external round 4**: one full review and three scoped follow-ups. The reviewer made no specification repair this round. The author's third repair is `8d3b4fe`; its internal cycle count and active effort are **unknown**. This review report had **zero substantive artifact repair/recheck cycles**: P2's evidence boundary and P10's distinction from P8 were settled during drafting. The probe was simplified and re-run, and formatting/citations were checked; these are instrument/drafting iterations, not extra target repairs or external rounds.

**Owner interventions:** this commission only during execution. The preceding ruling was **“Continue — one more bounded fix,”** specifically changing pending-write coordination to button disabling. That authorization was recorded before this repair. **This round's owner disposition is pending/unknown.** I agree with the P5 and dialog-sequencing closures and disagree with blanket closure of P2/P8 and the shared-fixture radius.

**Regressions/escapes:** P2 is another incomplete lifetime guarantee after a mechanism change; P8 retains the unstubbed connect dependency and exposes an overlooked API assignment; P10 is a risk generated by the widened fixture contract. No consequential production escape or completed-implementation regression was observed. No claim is made that all existing tests are broken.

**What helped:** tracing the retained modal callback, finding both global assignments, inspecting actual service consumers, and separating a data-source probe from an e2e pass/fail claim. **What repeated:** closure of one precondition while another remains; treating fewer changed fields as a smaller behavioral radius; and a repair expanding shared setup without its consumers. The negative-control change did close P5.

**Checks:** The executable probe extracted back from this report passed; the extracted inventory reported 41 calls in 20 files. `npx prettier --check docs/reviews/f9a-spec-codex-followup3.md` and `git diff --cached --check` passed for the final review. No product-suite pass is claimed.

**Time and usage:** Commission event: `2026-09-13T22:38:50.975Z` (08:38:50 on 14 September in Australia/Sydney). At the pre-commit checkpoint `22:55:22 UTC`, elapsed time was **16 minutes 31 seconds**; active effort is **unknown**. Session ID `01a09685-0c05-7c13-9a6b-daea91d23488`, model `gpt-6-astra`, log `/home/micah/.codex/sessions/2026/09/13/rollout-2026-09-13T02-48-16-01a09685-0c05-7c13-9a6b-daea91d23488.jsonl`. At its `22:54:29.107Z` usage event, the counter increase from the last event before this commission was **2,754,384 input tokens** (including **2,508,544 cached input**), **22,866 output tokens** (including **10,704 reasoning output**), and **2,777,250 total tokens**. Cached/reasoning counts are subsets, not additional tokens. This is a session-counter snapshot, not billed usage or the final total; subsequent verification, commit and hand-back add work. Financial cost is **unknown**.

**Parked/failed attempts:** no F9a implementation attempt was made or parked by this reviewer, and no executed probe assertion failed. An initial lookup for a guessed test-mode path was corrected by locating its declaration in App. Earlier author attempts beyond the supplied record and their costs are unknown. MemPalace's writer refusal was already established in this same session; no new retry or override was attempted.

## MemPalace drawer candidates

Reads worked. The server had already refused this reviewer's write with `Peer MCP writer active; this server is read-only for mutating tools`. Under MP-LEASE, the note remains here for the write-enabled author, with `added_by="OpenAI Codex / GPT-6 Astra"`; no retry, process termination, override or `[STATE]` mutation was attempted.

> F9a third scoped specification follow-up at 8d3b4fecf352011d2d78099360a6f5fe9093f61c, base 2b5f174, delivered in docs/reviews/f9a-spec-codex-followup3.md. Verdict CLEAR-WITH-FINDINGS. P5 RESOLVED; P2/P8 PARTIALLY RESOLVED, SEV 2; new P10 SEV 2 for the widened shared fixture's data-source/request effects and incomplete radius. P2's existing-button gate does not guard an already-issued first confirmation if an active gesture starts a write afterward; controlled callback/drag-core probe, full UI reachability unrun. P8's two-dialog sequence is repaired, but the named API registration is overwritten and Browser connect remains unstubbed. Effective widening switches cached entity consumers toward dummy-server requests; 41 call expressions in 20 files include the wrapper and 19 existing spec files. Second occurrence of the same-seam trigger: author explicitly flags recurrence in a design-wide continue/declare-residual/park brief before further repair. Owner disposition pending. No product/source/test implementation or product-suite acceptance. Criteria, evidence limits and trial costs are in the review.
