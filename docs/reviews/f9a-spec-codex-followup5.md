**CLEAR-WITH-FINDINGS**

# F9a specification — fifth scoped follow-up, 2026-09-14

**Author:** OpenAI Codex / GPT-6 Astra — same independent specification reviewer as the preceding rounds.
**Reviewer:** No cross-check of this review was commissioned or performed.
**Artifact author:** Claude Sonnet 5.
**Owner gate:** Owner disposition, specification sign-off and landing.
**Commissioned by:** Owner through `prompts/codex/f9a-spec-review-followup5.md`.
**Scope:** `57b232e..cbf754f`, specification/dispositions repair plus Round 5's declared radius. Reviewed head `cbf754f02ba509532916b97ab964320678b83680`, matching fetched `origin/feature/f9a-spec`.

## 1. Verdict first

**P11 is RESOLVED at specification level. P12 is PARTIALLY RESOLVED only because three operative setup references still include the withdrawn leg; its SEV 1 test obligation is gone.** The withdrawal honestly leaves P2 accepted and untested. No new production-design or executable-test-plan defect was demonstrated.

Three nonblocking findings remain: P13's stale references, P14's erroneous follow-up exemption, and P15's overstated review history. **P13 is a FOURTH occurrence of the commissioned same-seam trigger, at SEV 3.** It does not supply evidence of a fourth failed test mechanism. Before another repair in that seam, the author owes the existing recurrence-framed owner brief.

**Recommendation:** accept the document with the already declared P2 exception and this review's corrections to the evidence record, subject to the owner's explicit dispositions below. Do not commission another repair solely to clean up these records. This is a recommendation for specification sign-off with visible exceptions, not a declaration that the product or the literal no-live-finding specification DoD is already complete.

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                     | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | -------------- |
| P13 | Three setup instructions still include the withdrawn test in their scope. The remaining tests do not need it.                       | SEV 3    | None   | 1                    | Accept as-is   |
| P14 | The record says removing the failed test needs no review. The governing rule includes that change; this review has covered it.      | SEV 3    | None   | 1                    | Accept as-is   |
| P15 | The cost argument treats three earlier reviews as proof that the production design was sound. Those reviews did not establish that. | SEV 2    | None   | 1                    | Accept as-is   |

“Accept as-is” means retaining these text defects with this report as correcting evidence; it does not endorse their claims or silently mark them fixed. Owner disposition of P13–P15 is **pending**.

**What this protects:** evidence that export warnings agree with the prepared payload, and an accurate basis for deciding how much verification to fund.

**Product affected?** No product regression was demonstrated. P13/P14 change no behavior in this commission: the withdrawn leg has no remaining assertion, and its removal was reviewed. P15 affects a consequential future coverage/cost decision, so it is more than a harmless historical miscount.

**One decision brief, including the fourth recurrence:** continue with a record-only correction, accept the discrepancies using this review's qualified evidence, or park the specification. A correction costs author editing, cross-reference verification, reporting and the required scoped follow-up; duration and financial cost are unknown. Acceptance avoids that cycle without weakening Legs 9–12. Parking leaves F9a undelivered without addressing an additional demonstrated product defect. I recommend acceptance of these record discrepancies and retaining the planned e2e coverage. If no ruling is made, the findings and specification sign-off remain pending.

## 2. Method and evidence boundary

Read the full commission, the repair diff and current affected sections, and the dispositions file. Rounds 1–4, read in the preceding review, remain an unchanged byte prefix. Reused the already-read repository rules, adopted trial, template and prior reviews only after checking applicability. The practice index was fetched by ID; the deletion-review drawer was also read in full. The adopted F9a/F6/F10 trial governs conflicts.

**MEASURED:** the starting checkout was clean; the branch/head matched the commission. `git diff --quiet 57b232e..cbf754f -- src tests ai_rules.md CLAUDE.md docs/governance docs/templates` returned 0. The source and previous source observations therefore still apply; that does not count as rerunning earlier suites or probes.

**MEASURED:** §5's offline Node probe completed with exit 0. It extracts current source handlers, runs the actual connection/parser/export services, executes the exact isolated-hook declaration from the specification, checks both button bindings, and renders the actual second-dialog JSX. It models only the proposed sanitizer-option forwarding, D-5 rewrite/error handling and local write counter in memory. Reverted variants retain the fixture support and use the real pre-repair handler or remove the modeled counter/disabled widening.

**Not established:** no F9a implementation or new Electron test exists. No actual partial Git revert/build, mounted App, React scheduling, Playwright drag/dialog journey, live HA deployment, packaged build or defect frequency was measured. The probe's Browser download callback substitutes parsing/source assignment for App's full parent handler, which was source-read. Shared DSL behavior was source-read; its underlying hooks were executed. Product unit/integration/e2e suites, repeatability runs and `./tools/checks` are **UNRUN**. This is a specification review, not §3.5's implementation-review class. No live Issue/board query was needed; #159's supplied contract and the recorded owner rulings govern.

The report is the sole repository change. Source, tests, specification, dispositions, prompt, UAT and STATE were not edited; no implementation, merge, PR/Issue creation, board action or new governance mechanism was undertaken.

## 3. Closures, radius and acceptance

### Per-Ref results

| Ref | Status                                                  | Independent result                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P11 | **RESOLVED**                                            | A: both React and service states are now established. B: selective behavioral reverts retain the new fixture hook and produce the intended missing-warning/write, missing-error, and enabled-button failures. C: the welcome control exists on the prescribed fresh launch and opens the same Browser. These are specification/design results, not a claim that unbuilt tests passed. |
| P12 | **PARTIALLY RESOLVED — SEV 3 remainder under P13 only** | The impossible baseline wait and fixed-profile mismatch assertion are withdrawn. D-5 and AC-17 accurately say there is no executable residual pin. Three setup references prevent the commission's literal “nothing still references” closure, but impose no surviving test dependency. The former SEV 1 does not remain live.                                                        |
| P8  | **RESOLVED**                                            | Its remaining setup defects were P11. The repaired two-state setup, known-source route and selective comparison now form a coherent design.                                                                                                                                                                                                                                           |
| P2  | **ACCEPTED-RESIDUAL**                                   | Preserve the owner's production-risk acceptance and this round's explicit acceptance of having no executable pin. It is not a repaired or demonstrated-closed race.                                                                                                                                                                                                                   |
| P10 | **RESOLVED, no regression found**                       | Both shared registrations and the shared DSL method retain their original behavior; only the new local workflow opts into service configuration.                                                                                                                                                                                                                                      |

P1/P3/P4/P5/P6/P7/P9 have no regression identified within this diff/radius. The legacy-profile normalization, persisted-profile read, timestamp-only memo discriminator and wrong-dependency sibling remain unchanged; earlier closure evidence is applicable, not freshly rerun.

### Independent radius and class sweep

In this section, **Spec** means `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_SPEC.md`; **Dispositions** means `docs/reviews/f9a-spec-repair-dispositions.md`. All line references refer to the reviewed head.

The swept behavior is **reaching the known-source confirmation with isolated fixture support, distinguishing repaired and old behavior, and withdrawing the residual test without leaving obligations that depend on it**.

| Surface                                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared step and separate hook              | **No issue found.** Spec :1150,1173,1181 retains the shared method at `tests/support/dsl/app.ts:111` and both App registrations (:566,:2172). The probe observes that the shared hook changes React state without configuring the service, while the isolated hook then configures the service and survives both old registrations. P10 is not reopened.                                                                                                                                                                                                          |
| Initial screen, Browser state and download | **No issue found for the specified fresh launch.** Both `src/App.tsx:3191` and :3292 bind `handleOpenDashboardBrowser` (:2257), whose sole action sets the common visibility state. There is one Browser instance (:3519). Its default tab is dashboards (`src/components/DashboardBrowser.tsx:83`), with the same load effect (:91), irrespective of trigger. The welcome branch requires no config and no error (:3144); both hold for the clean fixture. The probe reaches connect → list → default download → temp creation with both connection states true. |
| Known target and two dialogs               | **No new issue found.** Download supplies the default target, as source-read at App :2299,:2305 and exercised through the actual resolver. Iframe :226 binds the first dialog's OK to App's handler; App :2584 owns the later summary dialog. The repaired assertions consistently distinguish them.                                                                                                                                                                                                                                                              |
| Selective reverts, including controls      | **No issue found in the specified behavioral comparison.** Results below show on-topic red failures, with actual base handlers executing. Spec :1227 says fixture support is never reverted. Leg 10(a) inherits Leg 9's setup and checks the same old site-4 behavior, so it can and should accompany that same comparison; the probe confirms it passes. Leg 10(b) explicitly runs only after repair. A wholesale source revert for this control would violate the retained-setup instruction read as a whole.                                                   |
| Other baseline legs                        | **No further missing-hook dependency found.** Legs 1/4/5/7 use their earlier setup, not the new Browser helper; their unchanged wholesale-source comparison does not delete a newly required hook. Legs 2/3/8 retain their controls. No other red leg inherits the removed Leg 13 wait.                                                                                                                                                                                                                                                                           |
| Withdrawal, D-5, AC-17, helpers and tables | **Substantive withdrawal confirmed; P13 records the reference residue.** D-5 :578, AC-17 :814 and the withdrawn-leg notice :1346 agree. The former release condition, conflicting-output assertion and pass-on-base requirement are no longer executable obligations. No surviving helper or leg requires the proposed mid-session profile-change machinery. Historical descriptions at :576,:1460,:1537 are followed by explicit later withdrawal; the other live KNOWN-OPEN pin is D-6/Leg 6, not P2.                                                           |
| Declared radius and follow-up              | P11's mechanism-revert list is correct, but its helper consumers also include Leg 10, checked here. P12's “downstream none” is too absolute for a document: D-5, AC-17, setup ranges, coverage mapping and DoD are consumers of its removal. No production-code consumer was found. P13/P14 cover the record discrepancies. This review covers both repairs regardless of the exemption claim.                                                                                                                                                                    |

Deletion sweep searches included `Leg 13|Legs? 9–13`, `KNOWN-OPEN|pinned|pin `, and obligation terms independent of the deleted mechanism's name (`await|baseline|passing before|stash|withdrawn`). Read the governing D-5 residual, AC-17, complete setup/Legs 9–12/withdrawal, §10.1 and Round 5 end to end. What Leg 13 uniquely carried was its delayed-write schedule, observable mismatch assertion and passing-baseline claim; all three are retired. The production limitation remains in D-5/AC-17. Nothing requires rehoming those withdrawn assertions.

### Measured behavioral comparisons

“Repaired” below means the explicitly modeled, unbuilt design; “reverted” means the selective variant with identical supporting dependencies.

| Check                                 | Repaired                                               | Reverted                                             | Meaning                                                              |
| ------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------- |
| Leg 9, captured absent                | Adjusted summary; one stripped confirm write           | Ordinary no-adjustment dialog; zero confirm writes   | Both targeted assertions fail for the intended missing mechanism.    |
| Leg 11, confirm write returns failure | Error includes stub failure; zero second dialogs       | No error; second dialog opens                        | Red is the missing stop/error contract, not broken setup.            |
| Leg 10, captured present              | No-adjustment dialog; one styled confirm write         | Same no-adjustment dialog; zero confirm writes       | (a) passes both; (b) remains new-behavior-only.                      |
| Leg 12, second write settles first    | Pending 2 → 1 → 0; disabled true → true → false        | Disabled false throughout; both writes still execute | Counter/gate removal directly falsifies the pending-write assertion. |
| Counter exit controls                 | Early disconnect and failed updates both drain to zero | Not required for the leg's red comparison            | The modeled finally covers early return and failure as specified.    |

**Production judgement — INFERRED:** the count plus disabled trigger is sound for writes already counted, including out-of-order settlement, when implemented with updates that preserve every increment/decrement. The rewrite derives payload and warning together and stops on a failed write. No new design defect was found in the reviewed repair/radius. This supports the bounded design with the accepted outstanding-dialog exception; it does not prove a universal words/bytes guarantee or actual React/UI behavior.

**Proportionality judgement — JUDGEMENT:** retaining sites 3/4 e2e coverage remains proportionate. Site-4 payload dispatch, failure suppression and the known-source confirmation route are consequential behavior that a call-site reading alone does not demonstrate. The current setup uses existing states, entry point and IPC support, and the selective comparisons now discriminate correctly. P13's stale ranges are not evidence that a further test mechanism must be built. The cost/benefit conclusion is qualitative; runtime, maintenance cost and future implementation effort are unknown. The owner may still choose a different coverage boundary, but P15's claimed three clean reviews cannot justify it.

### #159 and specification DoD

| Criterion                                                       | Assessment of the design/test plan                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — no unresolved SEV 1; owner disposition of material findings | **No live SEV 1 in scope.** P15 needs explicit disposition as consequential reporting evidence; P13/P14 remain recorded. P2 and the absent pin already have owner acceptance.                                                                                                                                                               |
| 2 — absent strips/warns; words agree with emitted result        | **Adequate for the bounded cases Legs 9–12 cover; explicit exception remains.** Leg 13's withdrawal removes no valid demonstrated protection: its proposed proof never worked. It does remove the promise of future executable characterization. The already-issued-confirmation gap is now accepted without a pin, not relabelled covered. |
| 3 — present, never-connected and persisted-disconnect controls  | **No regression in the plan.** Present site-4 control independently exercised above; other controls and their prior verified design are unchanged. Future product runs remain owed.                                                                                                                                                         |
| 4 — common capability object and unknown layout-card treatment  | **Unaffected; no new issue found.** The repaired helper does not change resolver/profile contracts or F9b's boundary.                                                                                                                                                                                                                       |
| 5 — affected paths, valid red evidence and stable controls      | **Adequate specification plan, with the disclosed residual and site-5 review-time coverage limit.** The selective comparisons have meaningful discriminators; their eventual implementation/build and actual headless tests remain unrun.                                                                                                   |

Spec :1488 literally leaves its follow-up item pending until there is no further live same-seam finding. P13 therefore prevents claiming that literal condition met today. The owner can accept this nonfunctional remainder explicitly under the adopted trial; I recommend that exception rather than another cleanup cycle. Sign-off/landing (:1490) also remain pending. Product DoD is **not met by this specification review**.

## 4. New findings

### P13 — SEV 3: withdrawn leg remains in operative setup ranges

**Classification: both deliverable and reporting record. Blocks: None.**

**MEASURED:** Spec :1171 says every “Leg 9–13 setup” must pass the connection gate; :1191 describes where “Legs 9–13 begin”; :1228 preserves “every other Legs 9–13 setup step.” These are present-tense instructions in the repaired helper, not solely the dated withdrawal history. Dispositions :537 says there is no downstream radius, overlooking these consumers.

The commission specifically asks that no setup/DSL reference remain. That literal closure fails. However, Spec :1346 expressly withdraws Leg 13, D-5/AC-17 remove its test promise, and none of the remaining legs awaits its event or asserts its mismatch. **Correction changes no behavior**, so the remaining grade is SEV 3, not another unexecutable-test SEV 1.

The class sweep is recorded in §3, including retained historical mentions and the separate boot-window pin. Advisory repair shape, if elected: reconcile the operative consumer ranges/radius with the withdrawal; keep the accepted limitation and actual remaining coverage intact. Complexity 1: local references only. **Recommendation: Accept as-is**, with this report documenting their nonoperative significance. This is the **FOURTH same-seam occurrence**, requiring the existing brief before any further repair, not requiring a production redesign.

### P14 — SEV 3: safeguard deletion is incorrectly exempted from follow-up

**Classification: reporting record. Blocks: None.**

**MEASURED:** Dispositions :563–575 treats P12 as a bare decision because it adds no safeguard. `docs/governance/OPERATING_AGREEMENT.md:301` defines a repair as a change to the reviewed artifact or a safeguard, made to resolve/mitigate a finding, regardless of its label. The definition does not require an addition. P12 changed the specification's D-5, AC-17 and test plan to resolve the invalid-pin finding; those edits are a repair. The bare owner decision itself remains exempt.

No review has actually been skipped: this commission expressly requests the withdrawal check, and this report performs it. That mitigation makes this a **record correction that changes no behavior in this round**, not a blocking governance contradiction or a newly imposed review gate. The claim must not be relied on to narrow a future repair review.

Class swept: the commission's exemption claim, Round 5's table/follow-up section, actual target diff, and §3.4's decision/repair distinction. No other exempted unreviewed repair was identified in scope. Advisory shape: align the recorded applicability with the actual diff; no rule change is needed. Complexity 1: a record correction. **Recommendation: Accept as-is** using this report's explicit scope correction.

### P15 — SEV 2: prior review evidence is overstated in the coverage-cost argument

**Classification: both deliverable and reporting record. Blocks: None.**

**MEASURED:** Dispositions :550–559 argues a prospective fourth recurrence should reconsider e2e investment because the production mechanism has been “independently reviewed as sound three times running.” Spec :1477–1479 and :1538 likewise attribute production soundness to the fourth follow-up.

The cited reports establish less:

- `docs/reviews/f9a-spec-codex-followup2.md:62` retained P2 as SEV 2 because the pending-writer design could miss an older write.
- `docs/reviews/f9a-spec-codex-followup3.md:81` said criterion 2 was not fully established; :97 explicitly rejected blanket clearance.
- `docs/reviews/f9a-spec-codex-followup4.md:37` said the evidence did not require another production-counter redesign, its protection remained useful, and the accepted gap should stay accepted. Its evidence boundary disclosed no completed F9a implementation or full UI reachability. That is a bounded conclusion, not universal soundness.

**Why consequential:** this is offered as evidence for reducing coverage of the very path whose behavior must satisfy criterion 2. The problem is the strength/applicability of the evidence, not the owner's authority or a cosmetic count. The extrapolation is **overstated, SEV 2**. No coverage reduction has yet been made; the recorded owner decision retains e2e coverage, and this review supplies the qualified assessment. There is no demonstrated product regression or justification for a SEV 1.

Class swept: the Round 5 recurrence/cost paragraphs, Spec §10.1/revision row, supplied commission and the three cited reviews. The related claim that both preceding recurrence rulings changed production design also overstates Round 4: it accepted P2's existing gap and narrowed fixture support. Neither wording supports an inference that unbuilt production behavior has repeatedly passed independent execution.

Advisory shape: base the owner's coverage decision on the bounded evidence and explicit unknowns in §3; a historical cleanup is optional. Preserve owner authority and the existing accepted residual. Complexity 1 for correcting the record; the cost of changing coverage is a separate owner choice. **Recommendation: Accept as-is with this review as the correcting evidence**, not acceptance of the unsupported premise. The combined decision brief is in §1a.

**Weakest claims:** modeled code is not the eventual implementation; React/pointer/dialog reachability remains unmeasured; e2e proportionality is judgement without measured maintenance cost. These limits prevent blanket clearance and do not establish a new product defect.

## 5. Reproduction

Run at the reviewed head from the repository root with installed dependencies. This disposable review instrument writes no source/test file, contacts no HA instance and opens no window. Every source extraction/replacement has an assertion. Counter state is synchronous in the model; actual React scheduling is outside the measurement. The first missing-hook check is a negative control explaining why fixture support must survive the comparison.

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
  isolated.connect({ url: 'http://example.invalid', token: 'test-token' });
  assert.equal(reactConnected, true); assert.equal(service.isConnected(), true);
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
  assert.equal(events.includes('create temp'), true);
  console.log('specified setup:', JSON.stringify({ reactConnected, serviceConnected: service.isConnected(), events }));

  isolated.disconnect(); assert.equal(service.isConnected(), false);


  const React = require('react'), render = require('react-dom/server').renderToStaticMarkup;
  // Both actual buttons invoke the same handler; their surrounding JSX has been read separately.
  for (const id of ['welcome-browse-dashboards', 'toolbar-download']) {
    const button = nodes('src/App.tsx', n => ts.isJsxOpeningElement(n) &&
      n.attributes.properties.some(p => p.name?.getText() === 'data-testid' && p.initializer?.text === id));
    assert.equal(button.length, 1); assert.ok(button[0].includes('onClick={handleOpenDashboardBrowser}'));
  }
  const d5 = String.raw`
const { config: sanitized, warnings } = yamlService.sanitizeForHAWithReport(config, toExportCapabilityOptions(profile));
try {
  const result = await window.electronAPI.haWsUpdateTempDashboard(tempDashboardPath, { ...sanitized, title: config.title || 'Dashboard' });
  if (!result.success) throw new Error(result.error || 'Failed to update temp dashboard');
} catch (error) {
  message.error('Failed to update dashboard preview: ' + error.message);
  return;
}`;
  async function site4(repaired, profile, success) {
    const writes = [], errors = [], dialogs = [];
    await handler('src/App.tsx', 'handleDeployFromLivePreview', {
      config, profile, tempDashboardPath: 'probe-temp', sourceDashboard,
      resolveLivePreviewDeployTarget, yamlService: repairedYaml, toExportCapabilityOptions, React,
      summarizeExportWarnings: require('./src/services/exportWarningSummary.ts').summarizeExportWarnings,
      Modal: { confirm: o => { dialogs.push(render(o.content)); o.onCancel(); } },
      message: { error: e => errors.push(e) },
      window: { electronAPI: { haWsUpdateTempDashboard: async (_, v) => { writes.push(v); return { success, error: 'stub failure' }; } } },
    }, s => repaired ? replaceOnce(s, 'const { warnings } = yamlService.sanitizeForHAWithReport(config);', d5) : s)();
    return { writes: writes.map(hasStyle), errors, dialogCount: dialogs.length,
      adjusted: dialogs.some(s => s.includes('live-preview-deploy-summary')),
      unchanged: dialogs.some(s => s.includes('Nothing had to be adjusted')) };
  }
  const a = await site4(true, absent, true), b = await site4(false, absent, true);
  assert.equal(a.adjusted, true); assert.deepEqual(a.writes, [false]);
  assert.equal(b.adjusted, false); assert.deepEqual(b.writes, []); assert.equal(b.dialogCount, 1);
  const c = await site4(true, absent, false), d = await site4(false, absent, false);
  assert.equal(c.dialogCount, 0); assert.ok(c.errors[0].includes('stub failure'));
  assert.equal(d.dialogCount, 1); assert.deepEqual(d.errors, []);
  const e = await site4(true, present, true), f = await site4(false, present, true);
  assert.equal(e.unchanged, true); assert.equal(f.unchanged, true);
  assert.deepEqual(e.writes, [true]); assert.deepEqual(f.writes, []);
  console.log('Leg 9 repaired/reverted:', a, b);
  console.log('Leg 11 repaired/reverted:', c, d);
  console.log('Leg 10 present control repaired/reverted:', e, f);
  async function site5(repaired, connected = true, success = true) {
    let pending = 0, next = 0;
    const gates = [gate(), gate()], errors = [], writes = [];
    const drag = handler('src/components/HADashboardIframe.tsx', 'handleLayoutChange', {
      config, profile: absent, activeView: config.views[0], activeViewIndex: 0, tempDashboardPath: 'probe-temp',
      toExportCapabilityOptions, yamlService: repairedYaml, mergeEditedView, logger,
      setLayout() {}, onLayoutChange() {}, setPendingLayoutWrites: fn => { pending = fn(pending); },
      message: { error: e => errors.push(e) },
      window: { electronAPI: {
        haWsIsConnected: () => gates[next++].promise,
        haWsUpdateTempDashboard: async (_, v) => { writes.push(v); return { success }; },
      } },
    }, s => {
      s = replaceOnce(s, 'yamlService.sanitizeForHA(mergedConfig)', 'yamlService.sanitizeForHA(mergedConfig, toExportCapabilityOptions(profile))');
      if (!repaired) return s;
      s = replaceOnce(s, 'if (tempDashboardPath && activeView) {', 'if (tempDashboardPath && activeView) { setPendingLayoutWrites(n => n + 1);');
      return replaceOnce(s, "message.error('Failed to update dashboard preview');\n      }", "message.error('Failed to update dashboard preview');\n      } finally { setPendingLayoutWrites(n => n - 1); }");
    });
    const disabled = () => repaired ? pending > 0 : false; // tempPath held truthy; exact specified condition.
    const first = drag([{ i: 'card-0', x: 1, y: 0, w: 2, h: 2 }]);
    const second = drag([{ i: 'card-0', x: 4, y: 0, w: 2, h: 2 }]);
    const trace = [{ pending, disabled: disabled() }];
    gates[1].release({ connected }); await second; trace.push({ pending, disabled: disabled() });
    gates[0].release({ connected }); await first; trace.push({ pending, disabled: disabled() });
    return { trace, errors: errors.length, writes: writes.length };
  }
  const good = await site5(true), reverted = await site5(false);
  assert.deepEqual(good.trace, [{ pending: 2, disabled: true }, { pending: 1, disabled: true }, { pending: 0, disabled: false }]);
  assert.deepEqual(reverted.trace.map(x => x.disabled), [false, false, false]);
  const early = await site5(true, false), failure = await site5(true, true, false);
  assert.equal(early.trace.at(-1).pending, 0); assert.equal(early.writes, 0);
  assert.equal(failure.trace.at(-1).pending, 0); assert.equal(failure.errors, 2);
  console.log('Leg 12 repaired/reverted:', good, reverted);
  console.log('counter early-return/failure controls:', early, failure);
})().catch(e => { console.error(e); process.exitCode = 1; });

JS
```

## 6. Trial close-out facts for the owner's record

- **Deliverable and external rounds:** this is specification external round **6**: one full review and five scoped follow-ups. This turn performed one commissioned follow-up over the author's fifth repair, `cbf754f`. No cross-review of this report was commissioned.
- **Internal cycles:** zero reviewer repairs to the target specification. One report drafting/self-check pass, including citation and formatting corrections; no substantive target repair/recheck cycle. Author internal cycle count and effort are **unknown**.
- **Criteria and disposition:** §3 records all five #159 criteria and both document/product DoD boundaries. The supplied preceding owner ruling authorized P11's repair and accepted P12's unpinned withdrawal. The owner's decisions on P13–P15 and specification sign-off remain **pending/unknown**. This review recommends acceptance with explicit exceptions and corrected evidence, not that all criteria have been demonstrated by implemented software.
- **Owner interventions:** one commission during this review; no clarification, permission request or mid-review owner decision. Earlier rulings were inputs, not newly obtained interventions.
- **Elapsed versus active effort:** user message `2026-09-14T04:05:31.345Z`; report/checkpoint `2026-09-14T04:21:29.537Z`, **15m 58s elapsed to that checkpoint**. Final formatting, embedded-probe replay and commit occur afterward; this is not a claimed final wall duration. Active effort, author elapsed time, financial cost and future implementation effort are **unknown**.
- **Usage available at that checkpoint:** turn delta **1,629,670 input tokens**, including **1,330,176 cached input tokens**, plus **13,338 output tokens**, of which **2,877 reasoning output tokens**; total **1,643,008**. These are session-accounting deltas from the immediately preceding turn boundary, including repeated context, not unique source text or a monetary estimate. Final usage after this checkpoint is **unknown**.
- **Session:** `01a09d3c-bad4-7f00-a8a8-734d3cb93568`; `/home/micah/.codex/sessions/2026/09/14/rollout-2026-09-14T10-06-38-01a09d3c-bad4-7f00-a8a8-734d3cb93568.jsonl`.
- **Regressions/escaped defects and classification:** P11's demonstrated setup failures are repaired in the plan. P12's invalid test promise is removed, with P13's nonfunctional reference remainder. P13/P15 affect the deliverable and reporting record; P14 is reporting only. No consequential implemented-product escape was observed; actual implementation/regression results are **unknown**.
- **Failed/parked attempts:** two initial probe runs failed because the review instrument extracted site 4's function but omitted invoking it; its liveness assertion caught the dead measurement. After invoking it, the comparisons passed. This was an instrument defect, not a finding against the specification. Padded tables repeatedly truncated read output; bounded/normalized rereads supplied the affected text. No target repair was parked by this reviewer. The owner-withdrawn residual pin remains withdrawn.
- **What helped/repeated:** source-extracted handlers, positive controls and selective mechanism removal distinguish behavior failures from fixture failures. The two-state setup is now coherent. Stale ranges, overly narrow review applicability and strengthening bounded evidence into broad assurance are the remaining recurrence, not another demonstrated broken test journey.
- **Verification:** the §5 probe passed, including old/repaired comparisons and exit controls. The final embedded copy, Markdown formatting and diff whitespace are checked before commit. Product suites remain **UNRUN** for the disclosed specification-only scope.

## MemPalace drawer candidates

MemPalace reads worked. The preceding review in this same session encountered the per-palace writer-lease refusal; no retry, process termination, lease override or STATE write was attempted. Per MP-LEASE, the write-enabled author may file this project-specific candidate with `added_by="OpenAI Codex / GPT-6 Astra"` and this report as `source_file`:

**HAVDM / reviews — F9a fifth scoped follow-up at `cbf754f`:** P11 resolved at specification level; P12's invalid pin obligation withdrawn and its production residual accepted without an executable test. P12 retains only P13's SEV 3 setup-range residue. P14 records that deleting the reviewed test plan still falls under the existing repair-follow-up definition; the current review covered that deletion. P15 SEV 2 rejects the claim that three prior reviews established production soundness. Selective modeled baseline comparisons for Legs 9/11/12 fail on topic and Leg 10(a) passes both. Verdict CLEAR-WITH-FINDINGS; fourth same-seam occurrence is nonfunctional reference residue. Recommend explicit owner acceptance of record discrepancies with this review as correcting evidence, retaining e2e coverage and the existing unpinned P2 exception. Full implementation and Electron/UI verification remain unrun. Owner disposition/sign-off pending.
