**CLEAR-WITH-FINDINGS**

# F9a specification — second scoped follow-up, 2026-09-14

**Author:** OpenAI Codex / GPT-6 Astra — same independent specification-review seat as the two preceding reviews.
**Reviewer:** No cross-check of this review was commissioned or performed.
**Artifact author:** Claude Sonnet 5, specification and both repairs.
**Owner gate:** Owner disposition of findings and specification sign-off; implementation remains a later stage.
**Commissioned by:** Owner, through `prompts/codex/f9a-spec-review-followup2.md`.
**Scope:** `fd77973..74ddf35`, the specification/dispositions repair plus Round 2's declared radius. Reviewed head: `74ddf3541b2248025f7fec683aa589601e2d96f2` on `feature/f9a-spec`, matching the fetched remote branch.

## 1. Verdict first

The previous SEV 1 passing-control contradiction is resolved; no SEV 1 remains in this scoped review. P4 and P9 are resolved, while P2, P5 and P8 retain narrower SEV 2 remainders. The confirmation design still needs the owner's **continue / declare-residual / park** decision as a whole before another repair in that seam.

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                                         | Severity | Blocks | Fix complexity (1–5) | Recommendation         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | ---------------------- |
| P2  | Waiting for the latest edit can leave an older edit pending; that older edit can replace the dashboard after its warning has been prepared.             | SEV 2    | None   | 3                    | Owner judgement needed |
| P8  | The replacement test journey still omits connection and confirmation prerequisites, so it can stop before reaching the behavior it is supposed to test. | SEV 2    | None   | 2                    | Fix now                |
| P5  | The added refresh case is useful, but the plan still substitutes reading the old code for demonstrating that the eventual test detects its defect.      | SEV 2    | None   | 2                    | Fix now                |

**What this protects:** the warning the user approves must describe the dashboard ultimately deployed, and the acceptance tests must actually reach and distinguish that behavior.

**What is going wrong:** the pending-write repair remembers one operation, although multiple earlier edits can remain unfinished. The replacement route and hook proof also retain assumptions that their prescribed checks have not settled.

**Product affected? Unknown for the eventual F9a implementation.** No implementation exists. An offline probe reproduced the ordering counterexample using the current layout handler and a model of the specified wait. The browser prerequisites and old memo behavior were checked against current code. No live HA failure or failure frequency was measured.

**Options and costs:**

- **Continue:** Sonnet re-examines the whole confirmation snapshot design, including all unfinished writers through the eventual production read, and settles P8/P5's remaining test prerequisites in the same bounded continuation. Cost includes design, proof, dispositions and the required scoped follow-up; elapsed time and token cost are unknown. This is a decision about the mechanism, not authorization to keep repairing one newly found ordering at a time.
- **Declare residual:** the owner explicitly accepts the remaining risk and unverified criteria by Ref. This may save immediate repair work, but preserves the possibility of deploying bytes that disagree with the warning and accepting insufficient evidence. It does not turn the criteria into “met.”
- **Park:** pause this specification pending a different bounded design or priority decision. Further review/implementation effort stops; F9a's product outcome remains undelivered.

**Recommendation:** continue only after the author brings the owner this design-wide choice, with P8/P5 addressed alongside it. The evidence does not establish that a new provider, global, or off-path parameter threading is necessary; the locked cost stop-rule remains binding. If no decision is made, specification sign-off and implementation authorization remain pending.

## 2. Confidence, method and limits

Read the complete commission, complete dispositions file, repair diff, affected specification sections and their dependencies, the previous findings, and the applicable template/trial/governance requirements. Retrieved the practice index by its canonical ID and the relevant repair/evidence drawers; the owner-adopted F9a/F6/F10 trial controls precedence. The original and first follow-up remain historical inputs, not fresh reviews of unchanged areas.

Measured this round:

- Fetched `origin feature/f9a-spec`; the starting tree was clean at the specified repair.
- Round 1 of the dispositions is an unchanged byte prefix. `git diff --quiet fd77973..74ddf35 -- src tests CLAUDE.md ai_rules.md docs/governance docs/templates` returned 0.
- Read actual producers, readers, browser/connection paths, capability storage/context, and test helpers. The production `HADashboardIframe` consumer inventory is one App instance; its two layout-event bindings are drag-stop and resize-stop.
- Executed the embedded offline probe below. It extracts current handler bodies with TypeScript's AST, uses the existing exporter for the synthetic confirmation payload, and executes the old inline memo with React `renderHook`. All final assertions passed. No source file was altered and no network request or window was launched.
- Checked the report's formatting and diff before commit; command outcomes are recorded in the close-out.

**Evidence boundary:** the new ref/prop, DSL helpers, hook, and planned tests are unbuilt. The pending-write probe models D-5's proposed coordination; it is not execution of a repaired App. The browser probe exercises extracted handlers with stubbed dependencies, not an Electron UI journey. The hook probe demonstrates that the old expression can be exercised; it does not calibrate the unbuilt replacement test. These boundaries are why the remaining findings are SEV 2.

No Electron witness was re-run in this round. The earlier headless witness at repair `63982a4` remains applicable to the unchanged existing preview path, as recorded in `docs/reviews/f9a-spec-codex-followup.md` §2; it does not establish the newly planned download, failure or concurrency legs. New F9a tests, full unit/integration suites, repeatability runs, `./tools/checks`, a packaged release and live HA are **UNRUN**. This is a specification review, not a class-(d) implementation review to which §3.5's implementation gate applies.

The exact Electron store path and preview drag-DSL compatibility remain explicit implementation-time observations required by the specification. This review does not claim to have resolved either by a file search. No specification, dispositions, prompt, implementation, test source, board, UAT or `[STATE]` record was edited. No new process rule, checker, gate, template or ledger is proposed.

## 3. Closures, radius and acceptance contract

### Per-Ref disposition

| Ref | Result this round              | Verified closure and live remainder                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2  | **PARTIALLY RESOLVED — SEV 2** | D-5 `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md:447` now stops on a resolved failed rewrite; Leg 11 supplies the intended discriminator. Tracking only the most recently started invocation at `:482` does not drain older unfinished invocations. Leg 12 tests only one pending writer.                                                       |
| P4  | **RESOLVED**                   | Leg 5 at spec `:870` now separately observes export and the persisted file, asserting the seeded capture timestamp, version and card-mod fact. This closes the cached-context blind spot at specification level. The helper itself remains unbuilt.                                                                                                     |
| P5  | **PARTIALLY RESOLVED — SEV 2** | The independent never-captured → captured-absent case at spec `:779` and AC-16 close the missing-dependency discriminator. The explicit source-quotation substitute for executed defect-detection evidence remains at `:791-797`. It was part of the previous P5, not a new acceptance requirement.                                                     |
| P8  | **PARTIALLY RESOLVED — SEV 2** | Leg 10 at spec `:1033` separates the genuinely preserved warning text from a post-repair-only rewrite assertion: **the prior SEV 1 construction is RESOLVED**. A downloaded default dashboard really has a known target. Reaching that download and then App's warning confirmation still needs prerequisites missing from the described offline setup. |
| P9  | **RESOLVED**                   | D-2a `:330`, AC-15 and the normalization test now use `userOverrides` and distinguish readers from writers. The normalization expression is unchanged. The owner's accepted wording note was corrected in the repair; no further cleanup round is owed.                                                                                                 |

P1, P3, P6 and P7 were resolved in the first follow-up. Their settled claims were checked for consequences of this diff, not reopened as a new full review. No independent new behavior requires P10; the further sites below belong to the still-live P2/P8/P5 behaviors.

### Independent radius verification

| Repair | Actual dependency chain and result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P2     | App's profile/config and each drag/resize invocation → `HADashboardIframe.handleLayoutChange` → update IPC → shared temporary dashboard → App's confirmation → backend's delayed temporary-dashboard read. One optional prop reaches the sole consumer at `src/App.tsx:3359`; no other component consumer needs adapting. **The declared verification radius is incomplete:** one ref/prop is a change-site count, not the lifetime of all writes to the shared object. The backend read at `src/services/haWebSocketService.ts:498` remains consequential even if no backend code ultimately changes.                                                                                                                         |
| P8     | Test connection state/configuration → Browser's own connection check → list → download → parse → source metadata → first confirmation → App's warning confirmation. The proposed list/config response shapes match `src/preload.ts:71`, `src/components/DashboardBrowser.tsx:123` and `:180`; downloading Overview produces `{ urlPath: null, title: 'Overview' }`, a known target. **No production routing change is needed.** However, “upstream: none” omits service configuration, the connect IPC and the first confirmation as test dependencies.                                                                                                                                                                        |
| P4     | Isolated `userDataDir` → the same observed store path used by seed → actual disconnect → raw file read, separately from context-based export. The plan explicitly ties reader and seeder to one file; it does not specify an IPC/cache read. The equal-to-seed timestamp assertion would also reject an unrelated fresh capture, whose production writer generates a new timestamp at `src/main.ts:602`. `src/App.tsx:2106` can start that capture on a real connect, so offline setup must control it; byte equality cannot silently be replaced with “a profile exists.” No persistence/provider behavior change is required. Actual helper/path execution remains unverified, not disguised as a closure of implementation. |
| P5     | Only AC-16 and the test-plan/file-table description change; D-5a's hook and App wiring are unchanged in this repair. No new behavior change. The remaining proof issue is within the claimed test-plan radius.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| P9     | Direct production `getProfile()` reads enumerate as `src/main.ts:599` (capture), `:615` (read IPC), and `src/services/capabilityProfileService.ts:50` (override). The override IPC delegates to that last reader. `saveProfile`/`clearProfile` write at `:45`/`:57`. The corrected inventory covers these routes and the spread still preserves stored fields. No behavior change or additional consumer issue found.                                                                                                                                                                                                                                                                                                          |

### #159 criteria and DoD

| Criterion                                                                                   | Result for the specification's design/test plan                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — no unresolved SEV 1; explicit acceptance of other material defects                      | **SEV 1 condition satisfied in this scope.** P2/P5/P8 remain live SEV 2 risks/evidence gaps; this round's owner disposition is pending. The earlier “continue” authorized this repair, not acceptance of these remainders.                  |
| 2 — absent styling stripped/warned; pre-deploy words agree with emitted result              | Strip-and-warn derivation retained. **Not adequately established for confirmation through deployment:** P2 and P8.                                                                                                                          |
| 3 — present and never-connected preserved; persisted capture authoritative after disconnect | Passing controls are no longer asked to observe an absent baseline write. P4's storage-boundary plan and P5's independent first-capture case are now adequate in shape. Full confidence still depends on P5/P8's executable evidence.       |
| 4 — shared capability object, layout-card source/unknown policy, F9b consumer               | **Adequate within this scope; no introduced issue found.** D-2/D-2a retain the existing source/unknown treatment and legacy normalization; F9a carries the fact and F9b remains the deferred consumer. No live installation claim is added. |
| 5 — affected paths/regressions; valid red and stable controls                               | **Not yet adequate:** Leg 10's old contradiction is fixed, but Leg 12 samples only one pending write, the replacement route's setup remains incomplete, and the hook's negative proof remains waived.                                       |

The specification appropriately leaves its own scoped confirmation, owner sign-off and landing pending in §10.1. This review does not complete those items. The product DoD is undemonstrated because implementation and its required evidence/reviews do not yet exist; that is the expected stage boundary, not a new finding.

## 4. Findings — severity-ranked, class-swept

### P2 — PARTIALLY RESOLVED, SEV 2: the latest invocation is not all unfinished writes

**Evidence:** spec `:436-495` promises that an already-started layout write finishes first, but explicitly replaces the tracked promise on every invocation. The current layout handler at `src/components/HADashboardIframe.tsx:153` accepts concurrent calls, suspends at the connection check (`:161`), then writes (`:200`). Its two event sources are drag-stop and resize-stop (`:449-450`). Neither the handler nor `src/services/haWebSocketService.ts:529` serializes those operations.

**Counterexample:** start edit A; start edit B, replacing A's tracked promise; B finishes; confirmation waits only for B and successfully writes the new stripped result; A resumes and overwrites that result before the backend reads the temporary dashboard. The probe prints:

`layout x=4 / 6 → confirm stripped → layout x=1 / 3`

Its final temporary dashboard again contains styling. The two current layout invocations use the current permissive sanitizer, representing the older, never-captured profile; the confirmation model uses the existing lower-level exporter with captured-absent options. The new feature's actual handler is not under test.

**Mitigation checked:** failed confirm-time writes now stop correctly in the design. The modal can block new user gestures; it does not cancel two invocations already suspended before it opened. Waiting on the latest settled promise also misses an older pending invocation. The backend performs backup work before reading the temp (`haWebSocketService.ts:485-498`), so completion of the confirmation write is not the final observation boundary. Leg 12 (`spec:1064`) holds one invocation and therefore misses this counterexample.

**Severity:** SEV 2 for the concurrent-writer construction and its overclaimed radius. Ordering is reproduced with controlled promises; the eventual F9a behavior and an end-user occurrence have not been produced. No SEV 1 reachability exemption is claimed.

**Repair shape, advisory:** establish that every earlier writer capable of changing the selected temporary dashboard has settled, and that the successfully written payload remains the payload consumed for deployment. The proof must discriminate multiple pending writes completing out of start order, including “latest settled, older pending,” alongside the single-writer, no-writer and failure controls. Sonnet chooses the mechanism; this review does not prescribe a queue or rewrite the specification. Complexity 3 assumes coordination remains within the two existing components and their tests.

**Must not change:** the successful-write stop, shared warning/payload derivation, permissive/present controls, source target, existing site-5 error treatment, and the locked cost boundary.

**Same seam, explicitly:** “the warning approved at preview confirmation describes the successfully saved temporary dashboard later consumed for production.” This is a further live defect site in P2/P8's confirmation seam. **The author must put a continue / declare-residual / park brief about that design as a whole to the owner before committing a third repair in this seam.**

**Class swept:** enumerated the existing App/iframe producer and consumer boundary: preview creation; drag and resize; pending connection versus pending update; no writer, one writer, multiple writers; latest pending versus latest already settled; connected, disconnected, successful and failed update exits; profile/config snapshots; both confirmation stages and cancellation; and the later backend read/copy. The direct-ref wait cannot imply a fresh hook value after an await; snapshot selection must remain part of implementation checking. No separate word/byte defect is asserted merely because a newer profile arrives after selection. Sites 1/2 remain single-report comparison paths. External HA writers and arbitrary future implementation details are **not sweepable from this unbuilt design**; they are outside the claimed clearance. The current writer inventory and ordering failure are established; future implementation and real UI timing are not.

**Classification: both deliverable and reporting record.** The coordination design and its “closed” account share the same unresolved behavior.

### P8 — PARTIALLY RESOLVED, SEV 2: the replacement route has unprovided prerequisites

**Resolved construction:** spec `:1033-1051` no longer calls the new confirm-time write a passing baseline control. Current App computes a summary without a rewrite (`src/App.tsx:2580-2585`); Leg 10(a)'s warning text can be preserved and 10(b) is explicitly post-repair only. The prior SEV 1 is closed.

**Live construction A — offline connection setup, SEV 2:** spec `:992-1016` adds list/get-config stubs and says “Connect,” while the reused preview helper (`tests/support/dsl/app.ts:111`) only toggles App state through `src/App.tsx:571`. Browser loading depends on a different state: `haConnectionService.isConnected()` means a configured service (`src/services/haConnectionService.ts:74`), and Browser then invokes `haWsConnect` before listing (`src/components/DashboardBrowser.tsx:92`, `:107-123`). Neither the four existing preview stubs nor the two newly specified stubs handles that connect call. The actual-handler probe with an unconfigured service cannot load the list; with explicit configuration it records `connect → list` before download. Downloading the supplied Overview object then produces the correct known-source metadata.

“Connect” could be implemented using the real connection dialog and a wider offline stub setup, so this is an omitted prerequisite, not proof that no implementation could work. That dialog sets the service config (`src/components/ConnectionDialog.tsx:137`); it also has settings/credential/test-connection dependencies, and App connection can start a new capability capture. Those are reasons to settle the actual bounded setup rather than assume the boolean preview hook covers it.

**Live construction B — confirmation-stage targeting, SEV 2:** the preview button calls `HADashboardIframe.handleDeploy`, which first opens its own confirmation (`:226-235`); only its `onOk` calls App. The probe confirms that first click does not invoke App's handler. Legs 9–12 do not describe this intervening confirmation, and `live-preview-deploy-confirm` names the later dialog's content (`src/App.tsx:2591`), not the preview button. Leg 11's “no confirmation” assertion must identify that later warning dialog; the first confirmation is already part of reaching the failure. This is a route/observation ambiguity, not a claim that the underlying two-stage product flow needs redesign.

**Repair shape, advisory:** complete the offline path to a parsed, known source and explicitly target the confirmation stage each assertion observes. Demonstrate that the setup reaches the intended warning/failure boundary on the applicable base/repaired versions, with all external calls controlled and the intended seeded profile intact. No production routing change is needed. Complexity 2: bounded test setup and observation changes.

**Must not change:** genuine default-target metadata, the unknown-source route, production UI behavior, existing stub return shapes/delete behavior, or Leg 10's corrected distinction between baseline and new-mechanism assertions.

**Class swept:** connection flag versus service configuration; browser connection/list/config result shapes; default versus custom source versus no source; parser gate and source assignment; preview entry; outer confirmation; App warning/failure/cancellation; and each of Legs 9–12's claimed observation and baseline applicability. Leg 9 and Leg 11 can meaningfully fail on the old behavior once reached; Leg 10's split is valid; Leg 12's coverage limitation is P2. The remaining gap is shared setup/stage targeting, not four separate findings. This belongs to the same confirmation seam and the owner choice stated under P2.

**Classification: both.** The incomplete test journey and the closure/radius claim are consequential together.

### P5 — PARTIALLY RESOLVED, SEV 2: the independent case is added, but the proof substitute remains

**Resolved construction:** spec `:779-790` now changes only `capturedAt` from null to a capture timestamp while `cardModPresent` remains false, then checks unchanged-input memoization. AC-16 independently requires both profile transitions. A hook missing only the timestamp dependency would be distinguishable by that planned case.

**Live construction — evidence calibration, SEV 2:** spec `:791-797` still says “Proven RED,” then explicitly defines its demonstration as a direct quotation of the old dependencies rather than an executed check. The previous review's P5 at `docs/reviews/f9a-spec-codex-followup.md:176-180` included this remainder and requested defect-detection evidence; Round 2's summary/repair only addresses the transition half. No owner acceptance of the proof substitute is recorded.

This is not a demand to run an unbuilt hook today. It is a test-plan requirement to exercise the defect and demonstrate that the eventual measuring instrument can detect it. The embedded probe executes the current inline expression with actual React memoization: two independent profile changes cause **one** sanitizer call and retain the same report. That establishes a feasible old-behavior observation, not calibration of the future hook test.

**Repair shape, advisory:** retain the new cases and require an executable check against the old dependency behavior at the extracted memo boundary when the test exists; distinguish that future acceptance evidence from present source reasoning. Sonnet selects the concrete technique. Complexity 2: bounded test evidence, with no product-design change.

**Must not change:** primitive dependencies, lazy computation, stable unchanged-input memoization, report shape or App-to-hook wiring.

**Class swept:** each profile input independently, unchanged inputs, visibility/config gates, the seam helper, hook-to-App report props, supplied-prop DeployDialog tests, and §9's red/control classifications relevant to this repair. The other revised legs call for executable observations; the hook paragraph uniquely retains the explicit quotation substitute. No additional missing profile discriminator found.

**Classification: both.** The remaining defect concerns acceptance evidence and its “proven/resolved” record, not the corrected hook design.

## 5. Reproduction

Run from the repository root at the reviewed revision. Dependencies are already installed. The probe writes no source/test file, uses no Electron process, and stubs every external call it invokes. Passing assertions mean the stated counterexamples and boundaries were reproduced, not that F9a passed acceptance.

```bash
node <<'JS'
const fs = require('node:fs'), assert = require('node:assert/strict');
const ts = require('typescript'), yaml = require('js-yaml');
const compile = s => ts.transpileModule(s, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  esModuleInterop: true, jsx: ts.JsxEmit.React,
} }).outputText;
for (const ext of ['.ts', '.tsx'])
  require.extensions[ext] = (m, f) => m._compile(compile(fs.readFileSync(f, 'utf8')), f);
function handler(file, name, deps) {
  const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const matches = [];
  function visit(n) {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name) matches.push(n);
    ts.forEachChild(n, visit);
  }
  visit(tree);
  assert.equal(matches.length, 1, name);
  return new Function('deps', 'with(deps){' +
    compile('const ' + matches[0].getText(tree) + ';') + ';return ' + name + ';}')(deps);
}
const { yamlService } = require('./src/services/yamlService.ts');
const { exportDashboard } = require('./src/services/yamlConversionService.ts');
const { mergeEditedView, resolveLivePreviewDeployTarget } = require('./src/services/livePreviewDeploy.ts');
const { haConnectionService } = require('./src/services/haConnectionService.ts');
const config = { title: 'Probe', views: [{ cards: [{ type: 'button', style: 'color: red;' }] }] };
const logger = { info() {}, debug() {}, warn() {}, error() {} };
const message = { error() {}, success() {} };
const tick = () => new Promise(r => setImmediate(r));
function gate() { let release; const promise = new Promise(r => { release = r; }); return { promise, release }; }
(async () => {
  // Current site 5, plus the specification's latest-promise waiting rule.
  // The current sanitizer default models an invocation with a pre-capture,
  // permissive profile; the confirmation uses the later captured-absent value.
  const events = [], first = gate(), second = gate();
  let check = 0, temp;
  const write = handler('src/components/HADashboardIframe.tsx', 'handleLayoutChange', {
    config, activeView: config.views[0], activeViewIndex: 0, tempDashboardPath: 'probe-temp',
    setLayout() {}, onLayoutChange() {}, yamlService, mergeEditedView, logger, message,
    window: { electronAPI: {
      haWsIsConnected: () => (++check === 1 ? first.promise : second.promise),
      haWsUpdateTempDashboard: async (_, c) => {
        temp = c; events.push('layout x=' + c.views[0].cards[0].view_layout.grid_column);
        return { success: true };
      },
    } },
  });
  const pendingLayoutWriteRef = { current: Promise.resolve() };
  const older = write([{ i: 'card-0', x: 0, y: 0, w: 2, h: 2 }]);
  pendingLayoutWriteRef.current = older;
  const newer = write([{ i: 'card-0', x: 3, y: 0, w: 2, h: 2 }]);
  pendingLayoutWriteRef.current = newer;
  const confirmation = (async () => {
    await pendingLayoutWriteRef.current;
    const warnings = [];
    temp = exportDashboard(config, { cardModAvailable: false, warnings });
    assert.ok(warnings.length);
    assert.equal(temp.views[0].cards[0].card_mod, undefined);
    events.push('confirm stripped');
  })();
  second.release({ connected: true });
  await confirmation;
  first.release({ connected: true });
  await older;
  assert.ok(temp.views[0].cards[0].card_mod);
  assert.deepEqual(events, ['layout x=4 / 6', 'confirm stripped', 'layout x=1 / 3']);
  console.log('latest-only wait:', events, '; final styling preserved despite strip warning');

  // Existing browser prerequisites, with all external traffic stubbed.
  haConnectionService.disconnect();
  const browserEvents = [];
  const deps = {
    haConnectionService, logger, setLoading() {}, setDashboards() {},
    setError: e => { if (e) browserEvents.push(e); },
    DEFAULT_DASHBOARD_ID: 'lovelace',
    window: { electronAPI: {
      haWsConnect: async () => { browserEvents.push('connect'); return { success: true }; },
      haWsListDashboards: async () => { browserEvents.push('list'); return { success: true, dashboards: [] }; },
    } },
  };
  const load = handler('src/components/DashboardBrowser.tsx', 'loadDashboards', deps);
  await load();
  assert.deepEqual(browserEvents, ['Not connected to Home Assistant']);
  haConnectionService.setConfig({ url: 'http://example.invalid', token: 'offline-probe' });
  await load();
  assert.deepEqual(browserEvents, ['Not connected to Home Assistant', 'connect', 'list']);
  console.log('browser prerequisites:', browserEvents);
  let source;
  const download = handler('src/components/DashboardBrowser.tsx', 'handleDownloadDashboard', {
    logger, yaml, setDownloading() {}, setError() {}, onClose() {},
    DEFAULT_DASHBOARD_ID: 'lovelace',
    onDashboardDownload: (text, title, id, s) => {
      assert.equal(yamlService.parseDashboard(text).success, true); source = s;
    },
    window: { electronAPI: { haWsGetDashboardConfig: async url => {
      assert.equal(url, null); return { success: true, config };
    } } },
  });
  await download({ id: 'lovelace', title: 'Overview', url_path: 'lovelace' });
  assert.deepEqual(source, { urlPath: null, title: 'Overview' });
  assert.equal(resolveLivePreviewDeployTarget(source).kind, 'known');
  assert.equal(resolveLivePreviewDeployTarget(null).kind, 'unknown');
  console.log('default source:', source, '=> known');

  const confirmations = [];
  let deployCalled = false;
  handler('src/components/HADashboardIframe.tsx', 'handleDeploy', {
    deployTargetLabel: 'Overview', views: config.views,
    Modal: { confirm: d => confirmations.push(d) },
    onDeploy: () => { deployCalled = true; },
  })();
  assert.equal(deployCalled, false);
  confirmations[0].onOk();
  assert.equal(deployCalled, true);
  console.log('preview deploy button: first confirmation must be accepted before App handler');

  // Actual React memo / actual inline expression; no F9a hook is implemented.
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<html><body></body></html>', { url: 'http://example.invalid' });
  global.window = dom.window; global.document = dom.window.document;
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const React = require('react');
  const { renderHook, cleanup } = require('@testing-library/react');
  let calls = 0;
  const { result, rerender } = renderHook(({ profile }) =>
    handler('src/App.tsx', 'deployReport', {
      deployDialogVisible: true, config, profile, useMemo: React.useMemo,
      yamlService: { sanitizeForHAWithReport: c => { calls++; return yamlService.sanitizeForHAWithReport(c); } },
    }), { initialProps: { profile: { cardModPresent: false, capturedAt: null } } });
  const initial = result.current;
  rerender({ profile: { cardModPresent: false, capturedAt: '2026-09-14T00:00:00Z' } });
  assert.equal(result.current, initial);
  rerender({ profile: { cardModPresent: true, capturedAt: '2026-09-14T00:00:00Z' } });
  assert.equal(result.current, initial);
  assert.equal(calls, 1);
  console.log('actual inline memo: two independent profile changes, sanitizer calls =', calls);
  cleanup(); dom.window.close();
  haConnectionService.disconnect();
})().catch(e => { console.error(e); process.exitCode = 1; });

JS
```

## 6. Trial close-out and disagreements

This is **specification external review round 3**, comprising the original full review plus two scoped follow-ups. This round performed no repair of the specification and no internal repair/recheck cycle on that target. The author's Round 2 repair is `74ddf35`; its internal cycle count and active effort are **unknown**.

This report had **one substantive internal self-check/revision/recheck cycle**: distinguished correct known-source metadata from incomplete offline setup; retained the prior SEV 1 construction as resolved; and bounded the concurrency claim to a current-handler/design-model probe. Probe construction initially failed because it passed future F9a options to the current sanitizer, which ignores that extra argument. The corrected probe used the existing lower-level exporter for the explicitly modeled confirmation. The final probe was re-run after adding the actual first-confirmation check. These were review-instrument iterations, not product repairs or extra external rounds. A few initial source lookups used nonexistent paths and were corrected by file discovery; no result relies on those failed lookups.

**Owner interventions:** this follow-up commission; no additional intervention during execution. The recorded prior ruling was “Continue — fix P8, P2, P4, P5 now; accept P9's wording note.” **This round's residual disposition is pending/unknown.** I disagree with Round 2's blanket RESOLVED states for P2/P5/P8 for the narrower reasons above, and agree with the actual P4/P9 repairs. No author response to this review exists yet.

**Regressions/escapes:** the latest-only wait is an incomplete repair of P2's pending-writer class; the browser prerequisite is in P8's replacement journey; P5's proof waiver was retained. No new independent Ref or demonstrated production escape is claimed. P4/P9 introduced no identified defect within the checked radius. Implementation regression frequency is unknown.

**What helped:** exact repair/disposition history, direct tracing across producer/consumer boundaries, controlled promise ordering, and separating the old blocking construction from its remaining route risk. **What repeated:** a closure based on one member of a wider class; a narrowed summary dropping part of an existing finding; and test setup assumed from a neighboring helper. Same-seam recurrence now requires the existing owner design-wide decision, not another automatic repair.

**Checks:** the probe extracted back from this report passed. `npx prettier --check docs/reviews/f9a-spec-codex-followup2.md` passed; `git diff --cached --check` passed for the staged review. No product suite or implementation gate is claimed.

**Time and usage:** the commission event is `2026-09-13T17:23:20.031Z` (03:23:20 on 14 September in Australia/Sydney). At the pre-commit checkpoint `17:36:49 UTC`, elapsed time was **13 minutes 29 seconds**; active effort is **unknown**. The session log is `/home/micah/.codex/sessions/2026/09/13/rollout-2026-09-13T02-48-16-01a09685-0c05-7c13-9a6b-daea91d23488.jsonl`, session ID `01a09685-0c05-7c13-9a6b-daea91d23488`, model `gpt-6-astra`. At its `17:36:23.954Z` usage event, the counter increase from the last event before this commission was **2,416,298 input tokens** (including **2,116,864 cached input**), **16,991 output tokens** (including **4,065 reasoning output**), and **2,433,289 total tokens**. Cached/reasoning counts are subsets, not additional tokens. This is an available session-counter snapshot, not billed usage or a final total; final verification, commit and hand-back add work after it. Financial cost is **unknown**.

**Parked/failed attempts:** the first probe construction failure is recorded above. No product implementation was attempted or parked by this reviewer; attempts outside the supplied repair history are unknown. The MemPalace diary write was refused as described below.

## MemPalace drawer candidates

Reads succeeded. The note write returned `Peer MCP writer active; this server is read-only for mutating tools`. No retry, writer override, process termination or `[STATE]` mutation followed. Under MP-LEASE, the write-enabled author may file this in the HAVDM project wing with `added_by="OpenAI Codex / GPT-6 Astra"`:

> F9a second specification follow-up at repair 74ddf3541b2248025f7fec683aa589601e2d96f2, base fd77973, delivered in docs/reviews/f9a-spec-codex-followup2.md. Verdict CLEAR-WITH-FINDINGS. P4/P9 RESOLVED; P2/P5/P8 PARTIALLY RESOLVED, SEV 2. P8's prior SEV 1 control contradiction is resolved. Latest-only pending-write tracking can lose an older unfinished writer; the replacement browser journey omits offline connection/confirmation prerequisites; the hook plan adds the missing timestamp-only case but retains the old source-quotation proof waiver. Current-handler/design-model probes reproduce the ordering counterexample, browser prerequisites, known default-source metadata, first-confirmation boundary and old memo invalidation behavior. No implementation or product acceptance run. Before another confirmation-seam repair, author brings owner a continue/declare-residual/park brief about the design as a whole. Owner disposition pending. Criteria and measured costs are in the committed review; no board/state changes.
