# F9a brief — scoped repair follow-up, 2026-09-09

**Author:** OpenAI Codex / GPT-6 Astra — same independent reviewer as round 1; author of neither the brief nor its repairs.

**Reviewer:** n/a — no second-model cross-check commissioned or performed.

**Owner gate:** micah / BaggyG-AU decides the findings' dispositions and whether to lock the brief. Recommendations below are not owner decisions.

**Commission:** `prompts/codex/f9a-brief-review-followup.md`; STRAT-D7 follow-up to `docs/reviews/f9a-brief-codex-review.md` at `926c0a8`.

**Reviewed scope:** repair diff `926c0a8..c0c0125` plus the five declared radii in `docs/reviews/f9a-brief-repair-dispositions.md`, Round 1. After fetch, checkout and fast-forward pull, `feature/f9a-brief` and `origin/feature/f9a-brief` both resolved to `c0c01254df2ff4bcae90b06ab4c3c4a4038caff2`. References below use that head. “Brief” means `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`; “dispositions” means the repair-disposition file above; “OA” means `docs/governance/OPERATING_AGREEMENT.md`.

**Restrictions acknowledged:** this review is the only repository edit. No target, source, test, governance, Issue, board or `[STATE]` change; no push or merge; no Home Assistant access. No new governance mechanism is proposed.

## 1. Verdict

**CLEAR-WITH-FINDINGS**

P1's blocking verification instruction is resolved; P2's acceptance ambiguity and P4's consumer inventory are also resolved. P3 and P5 are partly resolved, with non-blocking remainders concerning the evidence behind the cost claim and the accuracy of the preserved decision record. P6 records inaccurate dependency declarations; there is no SEV 1.

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                     | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | -------------- |
| P3  | The explanation still promises that saved information makes the work cheap without carrying through the limits of that information. | SEV 2    | None   | 1                    | Fix now        |
| P5  | The record still overstates which original choices it preserves, and now calls a shortened proposal unedited.                       | SEV 3    | None   | 1                    | Fix now        |
| P6  | Four repair records say they have no upstream dependencies because those dependencies were not changed.                             | SEV 3    | None   | 1                    | Fix later      |

### Owner Decision Brief — P3

**Protects:** a realistic handoff and cost expectation for the next author. **Problem:** the new qualification improves the account of saved information, but the dependent cost explanation retains its old confidence. **Product affected:** unknown; synthetic module inputs establish the information limit, not a real installation failure or the eventual implementation cost. **Options and costs:** qualify the explanation now with a small documentation change; defer it with the uncertainty recorded for the spec author; or accept the remaining confidence claim as-is. **Recommendation:** fix now, stating the evidence condition without changing the chosen feature. **Do nothing:** the next author must discover which parts of the cost promise hold for the available capture.

### Owner Decision Brief — P5

**Protects:** an accurate record of what the owner was offered and what was subsequently corrected. **Problem:** the push decision is now described honestly, but the broader preservation claim remains too strong and the acceptance proposal was shortened while labelled unedited. **Product affected:** no behaviour changes; this is record accuracy. **Options and costs:** make a small correction now using the committed historical text; defer the record correction; or accept the documented discrepancy. **Recommendation:** fix now, consistent with the owner's earlier preference to finish this record before handoff. **Do nothing:** the current acceptance meaning remains usable, but the claimed historical fidelity remains wrong.

### Owner Decision Brief — P6

**Protects:** a repair record that tells the next reviewer which existing facts and decisions a repair relies on. **Problem:** unchanged dependencies were recorded as absent. **Product affected:** no behaviour changes; the dependencies have been checked in this follow-up. **Options and costs:** correct the existing rows' account in the next appended disposition round; defer the wording correction; or accept this review's explicit dependency account as the documented residual. **Recommendation:** fix later; the independent check below supplies the missing information, so this record defect does not justify delaying product work by itself. **Do nothing:** the original rows remain inaccurate, with the correction available in this review.

## 2. Confidence, method and limits

Read the full repair diff and all five disposition rows, then followed their affected passages through F5/F7, D-2/D-5/D-6, §§2/8/9/11 and the adopted header. Compared the historical record with `0bfeb6c` and the first-review target. Re-read OA's red-leg and repair-lifecycle rules, the review template, the practice follow-up/evidence rules, and the September 7/8 decision drawers by ID. The first review's filed candidate is present at `drawer_havdm_review_72a3f7483064c98140f17f11`; its author filing note records the owner's fix-now decisions.

`git diff --name-status 926c0a8..c0c0125` lists exactly the repaired brief and the new dispositions. `git diff --exit-code 00b9abf..c0c0125 -- src tests docs/governance docs/templates` returned 0 with no output. The earlier full source review therefore remains applicable within its stated limits; this round rechecked the specific source dependencies below rather than claiming a new full review.

Re-ran the exact pure-module probe reproduced in the first review: `node /tmp/havdm-f9a-review-probe.cjs`, exit 0. Public export still generates the example's styling and no unavailable warning; direct export with the false capability option strips and warns. This demonstrates the service baseline. Mapping that common public result to the three named profile cases remains a labelled source trace: the public API has no profile parameter, and no app was launched with three injected profiles.

Ran the additional resolver-to-profile probe reproduced below, exit 0. Re-enumerated resolver consumers across `src/` and read their calls. Checked there was no running Electron/Playwright suite before starting the normal gate.

**Gate:** `./tools/checks` on the repaired head returned **REAL_EXIT=0**, completing lint, format check, typecheck and unit tests: **0 errors / 145 warnings; 1559 tests passed across 105 files**. Log: `/tmp/havdm-f9a-followup-checks.log`. The review file was added after that run's format step; its separate `prettier --check` passed. The gate checks repository health; it does not prove the prose claims above.

**Not established:** no Electron, e2e, integration, packaged-app or live-HA run; none is needed for this docs-only repair. No actual layout-card installation, user installation survey, canonical layout-card folder name, persisted Electron file or capture freshness was observed. The original interactive questionnaire remains unavailable; committed prose and ruling records do not establish a verbatim transcript. No new spec or implementation was reviewed: the F9a/F9b-named document inventory contains this brief and its review records, and downstream spec work is future work. Historical author gate runs and live board status were not independently certified. The source traces are not proof of runtime behaviour across the UI, IPC or server.

## 3. Claim ledger and radius verification

| Claim                                                                                                                                                                    | Tag                  | Evidence                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The repair changes two documentation files and no production, test, governance or template files.                                                                        | MEASURED             | The two git diffs in §2.                                                                                                                                                                           |
| The standing rule permits an explicitly justified no-valid-red case; a before/after passing control baseline is a reasonable alternative for the two preserved outcomes. | MEASURED / JUDGEMENT | OA:66–73; brief:460–481; public-module probe and the unchanged default-option trace. The rule requires alternative evidence to be named; it does not itself prescribe this particular alternative. |
| The new acceptance note makes the carried layout fact and accurate deployment warning obligatory without adding a layout consumer.                                       | MEASURED / JUDGEMENT | Brief:603–615, :127–128, :404–409 and :644–646; September 8 rulings 2/3; `src/App.tsx:2580`, :2610, :2625.                                                                                         |
| Folder retention tests the occurrence of a URL marker, not installation method, URL origin or an installed-repository flag.                                              | MEASURED             | `src/services/capability/capabilityResolver.ts:35–42`, :56–72; `src/services/capability/capabilityProfile.ts:71–73`; probe below.                                                                  |
| The direct cost passages were not updated, and the cited decision record repeats the original universal.                                                                 | MEASURED             | Brief:407–409, :563, :570–574; repair diff; `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc`, ruling 2's explanatory cost paragraph.                                                              |
| Two executable production consumers use the availability resolver, and the null-version condition is at line 40.                                                         | MEASURED             | `rg -n 'resolveCardState                                                                                                                                                                           | cardAvailability' src`, with every returned reference inspected; `src/components/CardPalette.tsx:269`, `src/components/BaseCard.tsx:302`, `src/services/capability/cardAvailability.ts:40`. |
| The proposal was shortened, despite two explicit claims that it was preserved unedited.                                                                                  | MEASURED             | Repair diff's §9.3 deletion; brief:597–605; dispositions:37.                                                                                                                                       |
| Four “Upstream: none” declarations describe unchanged inputs rather than absent reliances.                                                                               | MEASURED / JUDGEMENT | Dispositions:36, :38–40 versus OA:270–272 and the row-by-row dependency trace below.                                                                                                               |

**Weakest claims:** the practical cost effect in P3 is unmeasured; cross-references to the improved F5 mitigate the unchanged cost prose. “Installed through HACS” may have been intended as shorthand for a matching resource already captured, but the code establishes the latter condition only. P5 cannot establish what all original questionnaire options said. P6 is a record defect, not evidence that an unreviewed runtime dependency was changed. The choice of a passing control baseline is a review judgement about the quoted rule and observed outcomes, not a newly mandated project procedure.

### Declared radius, checked by hand, row by row

This traces **reliances and consumers**, as OA §3.4 requires; absence of edits to a dependency does not remove the reliance.

| Repair | Upstream reliance checked                                                                                                                                                                                                            | Downstream consumer checked                                                                                                                                       | Result                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1     | OA:66–73; September 7 ruling 3 in `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`; F2/F3/F6's export baseline and permissive default.                                                                                              | §8 feeds D-7 and the future spec's tests, its review, and implementation verification. Brief:483–485 still leaves the matrix and concrete coverage with the spec. | Behavioural repair sound. “Upstream: none” is inaccurate: the row itself names the unchanged owner ruling but also relies on the qualified standing rule and baseline. P6.                       |
| P2     | Adopted header at brief:32–35, option A at :127–128/:567, D-2, and F4's independent warning route. `App.tsx:2580` builds the summary, :2610 displays the empty-summary message, and :2625 sends dashboard paths.                     | Future spec's scope and D-5's choice of how to keep the warning consistent with the deployed content. D-6 remains open; §§2/10 retain the F9b exclusion.          | No additional dependency-scope issue found. Acceptance repair closes P2; historical-preservation issue is grouped under P5.                                                                      |
| P3     | Resource extraction → generic resolver set → profile builder → capture/save chain (`capabilityResolver.ts:35–79`, `capabilityProfile.ts:63–75`, `src/main.ts:590–605`); option A and its cost explanation in the September 8 drawer. | D-2, §9.2's A cost cell and recommendation, then the future spec's value derivation.                                                                              | Radius is incomplete and the dependent claim is still too strong: P3/P6. The repair neither adds detection machinery nor changes the ruled carry-only scope.                                     |
| P4     | The shared resolver's precedence and its two caller bodies; null-version branch at `cardAvailability.ts:40`.                                                                                                                         | F7 informs the future spec's account of existing UI consumption; F3's export gap remains unchanged.                                                               | No issue found in the repaired heading, count, paths or line number. The source reliance makes “Upstream: none” inaccurate: P6. No third production consumer found in the enumerated references. |
| P5     | Original brief `0bfeb6c`; reviewer-seat correction retained in §9.1; September 8 ruling drawer, particularly push ruling 4; the current §9.3 edit itself.                                                                            | §11's repeated assertion and the owner/reviewer reading §9 as the history behind the locked brief.                                                                | §9/§11 now agree about push, but still overclaim preservation: P5. “Upstream: none” omits the records needed to establish that claim: P6.                                                        |

**Other repairs or scope drift:** no unrelated feature, governance or source edit found in the two-file repair diff. The §9.3 deletion is an introduced record defect, covered under P5 rather than silently treated as preservation. P1's extra explanation stays within clarification of the named outcomes; it does not prescribe a concrete test framework, injection seam or acceptance matrix. The title “Two properties” now precedes four bullets, but those bullets develop the red/control distinction; no substantive finding is warranted for that wording.

## 4. Closures and live findings

| Prior Ref | Follow-up disposition  | Remaining severity | Assessment                                                                                                                                                         |
| --------- | ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1        | **RESOLVED**           | None               | Leg 1 retains the behavioural red requirement; legs 2/3 are explicitly expected-pass controls with named alternative evidence. The blocking instruction is gone.   |
| P2        | **RESOLVED**           | None               | The controlling interpretation now requires both the carried layout fact and accurate warnings. The introduced historical-record defect is reported once under P5. |
| P3        | **PARTIALLY RESOLVED** | **SEV 2**          | The manual-resource limit is acknowledged, but the exact evidence condition and the dependent cost confidence are not fully corrected.                             |
| P4        | **RESOLVED**           | None               | Both UI consumers and the condition's source line are correct.                                                                                                     |
| P5        | **PARTIALLY RESOLVED** | **SEV 3**          | Push is correctly outcome-only and §11 matches; the surviving original-options claim and the new unedited-proposal claim remain inaccurate.                        |

### P3 — SEV 2 — the derivation claim and its cost dependants still exceed the measured condition

**Evidence/problem:** brief:284–288 now distinguishes HACS installation from a manual resource, which addresses the original obvious overbreadth. But the condition actually established by `capabilityResolver.ts:35–42` and :56–60 is that a resource supplied to the capture contains `/hacsfiles/` followed by a nonempty extracted segment. The builder saves that set at `capabilityProfile.ts:72`. HACS repository metadata only fills `versions` at `capabilityResolver.ts:68–72`; it does not populate `installedFolders`. Installation through HACS alone is therefore not the measured sufficient condition asserted at brief:285. The probe exercises that distinction without claiming a real installation miss.

The new docblock/test citation at brief:282–283 also needs that precise boundary. The existing test covers a `/local/` URL and an unrelated absolute CDN URL (`tests/unit/capabilityResolver.spec.ts:75–78`), not exclusion of absolute URLs as a class. An absolute URL containing the marker is retained; a marker in a query is also retained. These probe results establish lexical extraction, not resource hosting or installation provenance. The inherited docblock is not stronger evidence than the implementation. This is part of the same evidence-boundary remainder, not a demand to fix the resolver.

The follow-up commission specifically asks whether the cost argument was updated. **It was not:** the repair diff leaves brief:563's “derived from data already stored (F5); no new capture”, :570–574's small-cost justification, and D-2 at :407–409 unchanged. Their F5 cross-reference now supplies some mitigation, but none states that the confidence applies to matching resources present in the saved capture. The September 8 decision drawer's ruling 2 explanation still says the datum is persisted in “every captured profile”. That explanatory fact is another member of this same claim class; the owner's carry-only decision is unaffected.

**Severity per construction:** the installation-to-capture inference and the dependent cost-confidence assertion are each SEV 2; no real user's missed installation or unexpected implementation cost was demonstrated. The URL-class wording is at most SEV 3 as a record of what the test pins. The explicit manual-resource caveat and F5 cross-references prevent treating the old unqualified claim as wholly unrepaired.

**Concrete fix:** finish bounding the claim to matching resources actually present in the saved capture, and carry that confidence limit into the current reading of D-2 and §9.2. A dated qualification can preserve the historical options and cost reasoning. Identify the same stale explanatory claim in the cited decision record for its authorised filer rather than continuing to treat it as corroboration. No replacement implementation is prescribed.

**Must not change:** option A, one object carrying both facts, the unconsumed layout fact until F9b, or the spec author's ownership of the folder name and value derivation. Do not narrow the feature to HACS-only support, add resource detection or migration, or infer a requirement to contact HA merely to correct this evidence claim.

**Class/same seam swept:** behaviour = promoting captured resource evidence into installation coverage and guaranteed low cost. Checked the extractor's branches, generic collection, HACS metadata handling, builder and capture/save caller; every F5-derived passage found in the brief (F5, D-2, §9.2 A/recommendation), the P3 disposition, and the cited September 8 cost explanation. The broader population of real installations is **unsweepable here** without installation evidence; no universal about that population is certified. **Complexity 1:** bounded wording and existing-record qualifications. A fix, not a product pivot.

### P5 — SEV 3 — the record still overclaims preservation, including a newly shortened proposal

**Evidence/problem:** the new scope note at brief:500–506 correctly excludes push from the original-options claim and points to the matching ruling. The repeated statement at :673 agrees. However, both now certify “options as they were put” for §§9.1–9.3. §9.1 supplies pros, cons and a recommendation, plus a narrative correction of the different-vendor offer; it does not preserve the original model-choice options it says were offered (:512–534). Neither `0bfeb6c`'s §9.1 nor the ruling drawer supplies that full questionnaire. This was already a declared limit in the first review's P5; reducing the count from four to three does not establish the remaining claim.

There is also direct evidence of a new preservation error. The repair diff deletes the original §9.3 sentence beginning “Anything beyond it” and ending “what makes the story acceptable”, and places the remainder about file-only work after the new note. Yet brief:603–605 calls the paragraph above the proposal “AS PUT” and “preserved unedited”; dispositions:37 repeats that assertion. The adopted italicised outcome itself is unchanged, but the **paragraph** is not. The added note even says the paragraph “went on” to say something it no longer contains.

**Severity per construction:** the unsupported three-decision completeness claim and the false unedited-paragraph claim are each SEV 3. They concern historical accuracy; the explicit current acceptance interpretation resolves P2's behavioural ambiguity. This is not a new SEV 1 merely because a statement about the record can be disproved.

**Concrete fix:** describe the preserved record at the fidelity the available sources support. For the shortened proposal, either restore the committed historical paragraph with the dated controlling correction outside it, or accurately label it as an excerpt/edited historical account with a reference to the original. Correct the repeated preservation assertions together. No missing questionnaire options need to be invented.

**Must not change:** selected reviewer, option A, adopted header fields, push outcome, candid reviewer-seat correction, or the now-explicit requirement for accurate warnings. Do not restore the old exclusion as current acceptance guidance.

**Class/same seam swept:** behaviour = claiming historical options or proposal wording survived unchanged. Compared the four decisions named in §9 with all three subsections, §11, original commit `0bfeb6c`, the repair diff, the authoritative four-ruling drawer and the P2/P5 disposition claims. The original interactive transcript remains **unverifiable**; this review certifies no missing alternatives. §9.2's A/B/C options survive the repair; §9.3's adopted outcome and cost-stop field survive; push's outcome-only account is correct. **Complexity 1:** correct the existing record descriptions or restore known historical text. A record fix, not a scope pivot.

### P6 — SEV 3 — unchanged upstream reliances are recorded as absent

**Evidence/problem:** OA:270–272 defines the radius as “upstream reliances and downstream consumers”. Dispositions:36 and :38–40 say “Upstream: none”; P1/P3/P5 justify that by saying the owner outcomes or ruled scope did not change. P4 offers no qualification. Those facts establish no upstream **edit**, not no upstream **reliance**. The dependency table in §3 identifies and checks the counterexamples for each row. P2's row correctly names unchanged authorities as upstream, making the inconsistent interpretation visible within the table itself.

**Severity:** SEV 3. The declarations are inaccurate documentation. The sources are available and were checked here; no product behaviour changes, missing code migration or unreviewed executable consumer is asserted. The repeated unqualified cost explanation discovered through P3's upstream reliance is reported under P3, not counted again here.

**Concrete fix:** in the next appended disposition round, distinguish unchanged dependencies from absent ones and identify the actual source/ruling reliances. The existing five rows and this review provide the material; no new inventory mechanism or procedure is needed.

**Must not change:** the historical owner rulings, source behaviour, original review file or append-only disposition history. A dependency declaration does not require editing that dependency when its facts remain valid.

**Class/same seam swept:** behaviour = describing repair dependencies. Checked **all five** radius rows against their relied-on facts and downstream passages, not just the literal “none” occurrences. Four have the upstream defect; P2 does not. Downstream target descriptions are broadly sound, subject to P3's unchanged dependants and P5's record remainder already reported. **Complexity 1:** corrections within the existing disposition record. No product or governance pivot.

## 5. Directions and disagreements

There is no remaining blocker from the original review. The owner can disposition P3, P5 and P6 by Ref; this review does not authorise their repairs or decide whether to lock the brief. Evidence for any wording repair is comparison with the cited source, historical diff and dependent passages. No new test suite or governance mechanism is called for.

**P1 interpretation:** no issue found in the quoted standing rule. “The documented case” at OA:69 introduces an example; the controlling condition at :67–68 is whether a valid red leg exists, not whether the module is new. The rule requires the spec or docblock to explain the absence and name alternative evidence. The repair's before/after passing baseline reasonably meets that requirement for preserved outcomes; it is not a verbatim alternative mandated by OA. No need to manufacture a failure or drop the controls.

**P2 interpretation:** no competing current acceptance bar remains. The prominent correction explicitly controls, identifies the two required obligations, and leaves how to satisfy them with the spec. It requires carrying the layout fact and accurate words, not the F9b layout consumer. The historical labelling error is separately and fully captured in P5.

**P4/P5 timing disagreement:** the author's P4 fix-now recommendation was reasonable: two direct source references make a small factual correction useful before spec handoff, and the resulting repair is accurate. I withdraw the earlier preference to defer that correction. P5's fix-now objective was also reasonable and owner-authorised; its incomplete execution does not make the timing choice a defect. The §9.3 historical deletion overreached the stated preservation approach, but neither that deletion nor the remaining completeness claim requires reversing the owner's selected outcomes. All record-only issues retain SEV 3.

The claimed P3/P5 closures and four upstream declarations are where this follow-up disagrees with the author's assessment. No product or architectural pivot is indicated, and no second-model cross-check is claimed.

## Reproducible additional probe

Run from the repository root at the reviewed head. This is a scratch measurement of current modules, not a new project gate or committed-test requirement. The examples are synthetic; `review-fixture` is not a claim about layout-card's canonical folder. No URL is fetched.

```bash
node <<'NODE'
const { buildSync } = require('./node_modules/esbuild');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const code = buildSync({stdin: {contents: "export { resourceFolderFromUrl, resolveCapability } from './src/services/capability/capabilityResolver'; export { buildCapabilityProfile } from './src/services/capability/capabilityProfile';", resolveDir: process.cwd(), loader: 'ts'}, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external'}).outputFiles[0].text;
const result = {exports: {}};
new Function('require', 'module', 'exports', code)(createRequire(process.cwd() + '/package.json'), result, result.exports);
const { resourceFolderFromUrl, resolveCapability, buildCapabilityProfile } = result.exports;
const cases = [
  [undefined, ''],
  ['', ''],
  ['/hacsfiles/', ''],
  ['/hacsfiles/Review-Fixture/x.js?q=1#x', 'review-fixture'],
  ['https://example.invalid/hacsfiles/review-fixture/x.js', 'review-fixture'],
  ['/local/review-fixture/x.js', ''],
  ['https://example.invalid/review-fixture/x.js', ''],
  ['/local/x.js?next=/hacsfiles/review-fixture/x.js', 'review-fixture'],
];
for (const [url, expected] of cases) {
  assert.equal(resourceFolderFromUrl(url), expected);
  const profile = buildCapabilityProfile(resolveCapability([{id:'probe', type:'module', url}]), {haVersion:null, capturedAt:'2026-09-09T00:00:00.000Z'});
  assert.deepEqual(profile.installedFolders, expected ? [expected] : []);
  console.log(JSON.stringify({url:url ?? null, folder:expected, persisted:profile.installedFolders}));
}
const repos = [{fullName:'review/fixture', folder:'review-fixture', version:'1.0.0', category:'plugin'}];
const profile = buildCapabilityProfile(resolveCapability([], repos), {haVersion:null, capturedAt:'2026-09-09T00:00:00.000Z'});
assert.deepEqual(profile.installedFolders, []);
assert.equal(profile.versions['review-fixture'], '1.0.0');
console.log('HACS repository metadata alone:', JSON.stringify({folders:profile.installedFolders, versions:profile.versions}));
NODE
```

## MemPalace drawer candidates

The first round's candidate has been filed by the author at `drawer_havdm_review_72a3f7483064c98140f17f11`, and was read back this round. This round's single `mempalace_add_drawer` attempt was refused: “Peer MCP writer active; this server is read-only for mutating tools.” No retry, lease override, process kill or separate local memory file. Under MP-LEASE, the write-enabled author may file the following text verbatim: wing `havdm`, room `review`, `added_by="codex"`, source `docs/reviews/f9a-brief-codex-review-followup.md`.

> [INVESTIGATION] HAVDM F9a brief scoped repair follow-up, 2026-09-09 — OpenAI Codex / GPT-6 Astra reviewed repair diff 926c0a8..c0c0125 plus all five declared radii on feature/f9a-brief. Deliverable: docs/reviews/f9a-brief-codex-review-followup.md. Verdict CLEAR-WITH-FINDINGS; no SEV 1. P1 RESOLVED: the qualified red-leg rule permits the named passing control baseline. P2 RESOLVED: the explicit controlling note requires the carried layout fact and accurate deployment warnings without adding F9b work. P4 RESOLVED: two UI consumers and source line 40 verified. P3 PARTIALLY RESOLVED, remaining SEV 2: the capture condition is matching resource evidence, not installation method alone; D-2 and section 9.2's cost confidence were not directly qualified, and the cited September 8 cost explanation still repeats the universal. P5 PARTIALLY RESOLVED, remaining SEV 3: push is correctly outcome-only, but the record still overclaims original options for the other three decisions, and the proposal paragraph was shortened while called preserved unedited. New P6 SEV 3: four upstream-none declarations confuse unchanged dependencies with absent reliances; all five radius rows independently traced. Re-ran the prior pure-module baseline probe and a synthetic resolver-to-profile probe; no app or HA run and no real installation coverage certified. No source, target, governance, Issue, board or state edit. Owner-authorised fix-now timing for P4/P5 was reasonable; P4 repair is accurate, P5 execution remains incomplete. Findings are reviewer assessments, not owner dispositions. Full evidence, validation and limits are in the committed follow-up.
