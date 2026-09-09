# F9a brief — second scoped repair follow-up, 2026-09-09

**Author:** OpenAI Codex / GPT-6 Astra — same independent reviewer as the two prior rounds; author of neither the brief nor its repairs.

**Reviewer:** n/a — no second-model cross-check commissioned or performed.

**Owner gate:** micah / BaggyG-AU decides dispositions and whether to lock the brief. The recommendation to accept a residual below is not an owner decision.

**Commission:** `prompts/codex/f9a-brief-review-followup2.md`; repair diff `a27df25..489815c`, the Round 2 radius declarations, and the corrected account of all five Round 1 rows.

**Reviewed head:** `489815cc7976c051820617ee1af984c55ad297b7` on `feature/f9a-brief`, matching `origin/feature/f9a-brief` after fetch, checkout and fast-forward pull. “Brief” below means `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`; “dispositions” means `docs/reviews/f9a-brief-repair-dispositions.md`; “OA” means `docs/governance/OPERATING_AGREEMENT.md`. Source coordinates refer to this head.

**Restrictions acknowledged:** this review is the only repository edit. No target, source, test, governance, Issue, board or `[STATE]` change; no push or merge; no Home Assistant contact. No new governance mechanism is proposed.

## 1. Verdict

**CLEAR-WITH-FINDINGS**

P5 and P6 are resolved, including the exact historical-text restoration and both sets of dependency declarations. P3 remains partly resolved: the corrected extraction description is sound, but the surviving derivability claim still substitutes any marked resource for evidence matching the add-on being checked. This is one non-blocking SEV 2 remainder; I recommend accepting the documented residual and proceeding to the spec rather than another brief-only repair round.

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | -------------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | -------------- |
| P3  | The remaining promise does not require the saved resource to match the add-on whose presence is being checked. | SEV 2    | None   | 1                    | Accept as-is   |

### Owner Decision Brief — P3 and whether another brief round is worthwhile

**Protects:** an honest handoff without prolonging brief work after its main risks have been addressed. **Problem:** the wording still promises more than the saved information proves, although the brief now explicitly leaves unanswered captures for the spec to handle. **Product affected:** unknown; the evidence is a synthetic comparison of current modules, not a missed real installation or a defective F9a implementation. **Options and costs:** accept this documented residual and proceed to the already-required spec and its review; correct the remaining wording now, with another scoped follow-up because a repair would exist; or defer it with the uncertainty recorded. **Recommendation:** accept as-is at the brief stage. The layout fact has no consumer until F9b, and the spec already owns its evidenced derivation and treatment of uncertainty. **Do nothing without a disposition:** the author still has a claimed closure that this review does not confirm. Acceptance would acknowledge the limit, not certify the stronger sentence as true.

## 2. Confidence, method and limits

Read the repair diff and the complete Round 2 disposition section, including its five-row correction. Re-read the relevant source functions, their consumers, OA's red-leg and radius rules, the review template and the practice follow-up/evidence drawers. Fetched the September 8 decision drawer by ID and checked its actual correction; also read the filed round-2 review at `drawer_havdm_review_2d237df6e8548fde2202b234`, whose filing note records the owner's three fix-now decisions.

`git diff --name-status a27df25..489815c` listed the brief and dispositions only. `git diff --exit-code a27df25..489815c -- src tests docs/governance docs/templates` returned 0 with no output. This is a scoped follow-up, not another full source review. The previously reviewed §8 and F7 passages were compared programmatically and are unchanged.

Independent document comparisons returned exit 0:

- Extracted the complete historical cheapest-outcome bullet from `git show 0bfeb6c:docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`. Its **975 bytes** equal the restored passage before the dated correction, occur exactly once in the current brief, and are **absent at `a27df25`**. Thus the check detects the earlier false preservation claim.
- Compared the complete old disposition file with the current prefix: **all 10,268 prior bytes are unchanged**, with new content appended.
- Compared all three A/B/C option rows by cell, ignoring table-padding spaces. All option and consequence cells are unchanged. B/C costs are unchanged; A retains its old cost text followed by the explicitly dated qualification. This establishes preservation of the committed alternatives, not verbatim reconstruction of an unavailable interactive questionnaire.

The Node probe below returned exit 0. It checks extraction and builds persistable profiles from synthetic resource lists; no file persistence or live installation was exercised. The main-process capture/save chain was **traced by hand**: resources and optional repository metadata enter `resolveCapability` at `src/main.ts:598`, its result enters `buildCapabilityProfile` at :600, and the profile is passed to `saveProfile` at :605; `src/services/capabilityProfileService.ts:44–45` writes that argument to the store. The probe measures the builder's output; this trace identifies its intended persistence consumer.

**Validation:** `./tools/checks` returned **REAL_EXIT=0**, completing lint, format check, typecheck and unit tests: **0 errors / 145 warnings; 1559 tests passed across 105 files**. Gate log: `/tmp/havdm-f9a-followup2-checks.log`. Both probe blocks reproduced below were also executed directly from this review document, exit 0. The review document's separate `prettier --check` passed. These checks establish repository health and the probes' specific properties, not the truth of every prose claim.

**Not established:** no Electron, e2e, integration, packaged-app or live-HA run; none is needed for this docs-only task. No real layout-card installation, canonical folder name, installation survey, capture freshness or on-disk Electron store was observed. No new spec or implementation was reviewed. The original questionnaire was not available in the records inspected; this review does not certify its absence from every artifact or drawer, or independently reconstruct the number or wording of missing choices. Historical author gate runs and live board state are not certified.

## 3. Claim ledger and independent radius check

| Claim                                                                                                                     | Tag                 | Evidence                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The restoration is exact and Round 1 is untouched.                                                                        | MEASURED            | Git-derived byte comparisons described in §2 and reproduced below; brief:628–640; dispositions:64–100.                                                                                      |
| Only §9.2 presents the committed A/B/C alternatives; its original cells survive with a dated A-cost qualification.        | MEASURED            | Brief:517–537, :592–596, :709; all three option rows compared with `0bfeb6c`. No missing options were added by this repair.                                                                 |
| The extractor uses the first marker occurrence, lowercases the segment, and excludes an empty result from the folder set. | MEASURED            | `src/services/capability/capabilityResolver.ts:35–42`, :56–60; eleven asserted extraction cases.                                                                                            |
| A marker in another resource does not recover an omitted target resource.                                                 | MEASURED / INFERRED | Two different resource lists produce identical complete builder outputs in the probe. Resource information lost before persistence cannot be recovered from those identical profiles alone. |
| D-2 and the A-cost cell were directly qualified; the drawer's original universal was expressly withdrawn.                 | MEASURED            | Brief:420–425, :594; repair diff; `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc`, ruling 2, read this round. The replacement condition retains the P3 remainder.                         |
| The corrected and new radius accounts identify the material reliances and consumers of these documentation repairs.       | INFERRED            | Row-by-row trace below against source, historical commits and owner authorities; no reliance-to-edit conflation remains.                                                                    |
| Another brief-only round is not proportionate to the remaining risk.                                                      | JUDGEMENT           | D-2 already delegates unanswered captures; option A carries an unconsumed layout fact; the spec and its review remain required. This is advice to the owner, not a waiver.                  |

**Weakest claims:** the P3 wording may have intended the relevant add-on's resource implicitly; the bold surviving condition does not say that. No real-user impact or additional implementation cost was measured. The original questionnaire remains unavailable, so preservation is verified against the committed source. Radius completeness is a labelled dependency trace, not a claim that a text search proves semantic completeness.

### Radius traced by hand — corrected Round 1 account

The corrected table supplements the unchanged historical rows; it need not duplicate their still-valid downstream cells. All five were checked.

| Ref | Reliances and consumers checked                                                                                                                                                                                                                       | Result                                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | OA:66–73, September 7 ruling 3 in `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`, and F2/F3/F6's baseline. §8 still feeds D-7 and future test design/review.                                                                                       | No issue found in dispositions:96. The qualified rule and named outcomes agree; unchanged §8 retains passing controls. No new baseline runtime run is claimed.                                                    |
| P2  | Adopted header at brief:32–40, option A, and F4's separate warning route. `src/App.tsx:2580` builds the summary, :2610 displays the empty-summary message, and :2625 deploys by paths. The spec must keep the words and content consistent.           | No issue found in dispositions:97's reference to the already-correct row. Brief:642–656 remains the explicit controlling interpretation after the historical text.                                                |
| P3  | Extractor → collection → builder → capture/save, plus option A and its explanatory cost argument. Consumers are F5, D-2, §9.2 and future value derivation.                                                                                            | No radius omission found in dispositions:98. The complete chain is named. Its evidence condition is still overstated in the target: P3, rather than a second radius finding.                                      |
| P4  | Resolver precedence at `src/services/capability/cardAvailability.ts:29–44`, palette call at `src/components/CardPalette.tsx:269`, and placed-card call at `src/components/BaseCard.tsx:302`. F7 informs the future spec's account of existing UI use. | No issue found in dispositions:99. Re-enumerated `resolveCardState`/`cardAvailability` references throughout `src/` and inspected them: two executable production consumers; null-version branch remains line 40. |
| P5  | `0bfeb6c`, the September 8 ruling record and the later correction context; consumers are §9/§11 and readers treating them as decision history.                                                                                                        | No issue found in dispositions:100. Exact restoration and cell comparisons verify the historical sources, while the current reviewer-seat correction remains explicit.                                            |

### Radius traced by hand — new Round 2 repairs

| Ref | Declaration checked                                                                                                                                                                                                   | Result                                                                                                                                                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3  | Dispositions:86 names extraction, collection, metadata handling, builder, test limits and option A; downstream D-2, the A cost/recommendation and future derivation; the same drawer's explanatory copy also changes. | No issue found in the radius. Read with the corrected chain at :98, capture/save is included. The drawer legitimately has two roles: its owner ruling is authority; its copied cost explanation is a dependent claim. The correction exists in the live drawer, but shares P3's remaining condition. |
| P5  | Dispositions:87 names original text, push authority, deletion diff, §11 and historical readers.                                                                                                                       | No issue found. The compared original also supplies §9.2's A/B/C source; the September 8 record supplies the selected outcomes. No questionnaire alternatives were invented in the diff.                                                                                                             |
| P6  | Dispositions:88 names OA's definition and the five historical rows; its replacement account at :94–100 names their concrete source/ruling dependencies. Future scoped reviewers consume the corrected declarations.   | No issue found. Reading the row together with the table it explicitly introduces covers the source reliances without requiring duplicate lists. The historical rows remain byte-for-byte intact.                                                                                                     |

**Introduced defects and unrelated changes:** no additional issue found in the restoration, preservation-scope note, dated cost qualification or disposition append. The repair does not add a layout consumer, change option A, alter the adopted header fields, remove the accurate-warning obligation or prescribe a concrete implementation. D-2's unanswered-capture choice stays subject to carrying the fact without consuming it until F9b. The surviving P3 condition is reported below; no separate issue is manufactured from the unchanged historical cost recommendation, now locally qualified by its A-cost cell.

## 4. Closures and remaining finding

| Ref | Disposition            | Remaining severity | Basis                                                                                                                                                    |
| --- | ---------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | **RESOLVED**           | None               | Prior closure retained; §8 is unchanged and its authority still agrees.                                                                                  |
| P2  | **RESOLVED**           | None               | Historical restoration does not displace the explicitly controlling acceptance correction.                                                               |
| P3  | **PARTIALLY RESOLVED** | **SEV 2**          | Extraction, metadata and absolute-URL corrections are sound; cost dependants are now qualified. The replacement condition still needs matching evidence. |
| P4  | **RESOLVED**           | None               | Prior closure retained; unchanged F7 and both source consumers rechecked.                                                                                |
| P5  | **RESOLVED**           | None               | Historical passage restored exactly; preserved alternatives described at the fidelity of the committed source; §11 agrees.                               |
| P6  | **RESOLVED**           | None               | Corrected historical and new radius accounts checked; no material missing reliance found; append-only history preserved.                                 |

### P3 — SEV 2 — a marker somewhere in the capture is not matching evidence for the layout fact

Blocks: None

**Evidence/problem:** brief:299–302 now limits derivability to an instance whose captured resource list contained **a URL bearing the marker**. That still does not require a nonempty segment matching the add-on whose fact is being derived. `src/services/capability/capabilityResolver.ts:58–60` stores each extracted nonempty folder; `src/services/capability/capabilityProfile.ts:71–75` saves the derived sets and metadata, not the original resource list.

The probe constructs two captures: one containing `/hacsfiles/review-other/x.js`, and the other adding `/local/review-target/x.js`. Both satisfy the stated marker condition, yet produce identical complete profiles. The stored data cannot distinguish the target resource being present from absent in those inputs. A bare `/hacsfiles/` also satisfies the marker predicate but yields no folder at all. Conversely, a captured URL with the matching nonempty target segment does retain that evidence. These are synthetic resource examples, not claims about layout-card's canonical folder or a real installation.

**Extent of the repair:** the lexical extractor description at brief:282–297 is now accurate, including absolute and query-string occurrences. HACS metadata populating only versions is correctly described. D-2 (:420–425) and the option A cost cell (:594) are genuinely changed, not merely old statements pointing to a revised F5. The September 8 drawer expressly withdraws its old universal. Those parts close the earlier complaints. The remainder is the **replacement inference** in F5, repeated in the cost cell and the drawer's “SURVIVING CLAIM”. D-2's explicit instruction to decide what happens when the capture cannot answer is material mitigation.

**Severity:** SEV 2 for overstated evidence; there is no demonstrated real installation failure. The mixed-resource and empty-segment examples are two constructions of the same insufficient condition, each non-blocking. The explicit unknown-capture choice and unconsumed F9a layout fact substantially limit the practical risk. This is neither a new blocker nor evidence that the cost of implementation must increase.

**Concrete fix if the owner elects repair:** qualify the evidence as the matching nonempty folder retained from the relevant captured resource. Distinguish presence of that evidence from proof of absence when the capture cannot answer. Carry the same qualification through F5, the A-cost explanation and its drawer copy, with D-2 retaining the spec's choice of representation and fallback. No replacement implementation is prescribed.

**Must not change:** option A, one object carrying both facts, the F9a/F9b split, or the spec author's ownership of folder-name evidence and unanswered-capture behaviour. Do not add a detector, migration or live-instance survey merely to repair this sentence. Accepting a documentation residual does not authorise treating an arbitrary resource marker as proof of layout-card presence in the eventual spec.

**Class/same seam swept:** behaviour = treating retained resource information as sufficient evidence of the target add-on and the cost of deriving its fact. Checked the extractor's missing/empty/first-occurrence cases, lowercasing and delimiters, generic collection, metadata-only path, profile fields, capture/save consumer, F5, D-2, both §9.2 cost passages, the P3 disposition and the corrected ruling-2 explanation. The wider population of actual installations is **unsweepable here** without installation evidence, so no universal about it is certified. This is the same retained P3 seam, not a newly numbered finding. **Complexity 1:** a bounded wording qualification in existing records; no product pivot.

## 5. Directions and proportionality judgement

**In my judgement, the remaining risk does not justify another brief-only repair/review round.** I recommend that the owner accept the P3 residual described above and proceed to lock the brief for Sonnet's spec. The spec already has to evidence the folder name, define the carried value and its unknown case, and undergo Codex review. Those concrete decisions are the useful next place to test this boundary. This recommendation does not mark P3 accepted on the owner's behalf or weaken any implementation acceptance criterion.

The trajectory now contains both useful progress and diminishing returns: the original verification blocker is gone; the false preservation claim is mechanically disproved on the prior repair and confirmed fixed here; the dependency record is corrected. The surviving issue is another narrowing of P3's same evidence condition. It should be visible, but another prose-only round is less valuable than evaluating the actual derivation in the already-required spec. No new rule, gate, checklist or procedure is proposed. If the owner instead chooses another target repair, STRAT-D7 still applies to it; this review does not grant an exemption.

No repair of P5/P6 is requested. If P3 is repaired, the proof is a reread of the affected condition and its copies against the source and paired probe, not a new Electron suite.

## 6. Disagreements

I agree with the author's P6 fix-now reasoning and withdraw my earlier fix-later preference for that record correction: the author was already appending Round 2, so supplying the corrected account there was a proportionate choice. Its content is now sound. No inference of literally zero time or review cost is needed to accept that marginal-cost argument.

I disagree with the P3 **RESOLVED** row only to the extent identified above. P5 and P6 closures are confirmed. The recommendation to accept P3's residual is a change from my previous fix-now recommendation, based on the added explicit treatment of unanswered captures and the narrower remaining risk; it is not a clean verdict issued to end the review cycle.

## Reproducible document comparisons

Run from the repository root at the reviewed head. These are review measurements, not new project checks. The historical-text comparison includes a failing prior-repair control.

```bash
python3 - <<'PY'
import subprocess
from pathlib import Path
brief = 'docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md'
dispositions = 'docs/reviews/f9a-brief-repair-dispositions.md'
def at(rev, path):
    return subprocess.check_output(['git', 'show', f'{rev}:{path}'])
original, previous, current = at('0bfeb6c', brief), at('a27df25', brief), Path(brief).read_bytes()
start, end = b'- **Cheapest acceptable outcome', b'- **Cost stop-rule'
historical = start + original.split(start, 1)[1].split(end, 1)[0].rstrip()
restored = start + current.split(start, 1)[1].split('  ⚠⚠ **CORRECTION'.encode(), 1)[0].rstrip()
assert len(historical) > 500
assert restored == historical and current.count(historical) == 1
assert historical not in previous
prior = at('a27df25', dispositions)
now = Path(dispositions).read_bytes()
assert now.startswith(prior) and len(now) > len(prior)
def options(data):
    return [[c.strip() for c in row.split('|')[1:-1]] for row in data.decode().splitlines()
            if row.startswith(('| **A —', '| **B —', '| **C —'))]
before, after = options(original), options(current)
assert len(before) == len(after) == 3
for i, (a, b) in enumerate(zip(before, after)):
    assert a[0] == b[0] and a[2] == b[2]
    assert a[1] == b[1] if i else b[1].startswith(a[1] + '. ⚠ **Qualified 2026-09-09:**')
print('PASS:', len(historical), 'historical bytes;', len(prior), 'unchanged disposition bytes; A/B/C compared.')
PY
```

## Reproducible module probe

Synthetic names below deliberately avoid asserting a canonical layout-card identifier. No URL is fetched.

```bash
node <<'NODE'
const { buildSync } = require('./node_modules/esbuild');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const built = buildSync({stdin:{contents:"export { resourceFolderFromUrl, resolveCapability } from './src/services/capability/capabilityResolver'; export { buildCapabilityProfile } from './src/services/capability/capabilityProfile';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external'});
const result = {exports:{}};
new Function('require','module','exports',built.outputFiles[0].text)(createRequire(process.cwd()+'/package.json'),result,result.exports);
const {resourceFolderFromUrl,resolveCapability,buildCapabilityProfile} = result.exports;
const urls = [
  [undefined,''], ['', ''], ['/local/review-target/x.js',''],
  ['https://example.invalid/x.js',''],
  ['/hacsfiles/Review-Target/x.js?x=1#x','review-target'],
  ['https://example.invalid/hacsfiles/review-target/x.js','review-target'],
  ['/local/x.js?next=/hacsfiles/review-target/x.js','review-target'],
  ['/hacsfiles/first/x.js?next=/hacsfiles/second/x.js','first'],
  ['/hacsfiles/',''], ['/hacsfiles/?x=1',''], ['/hacsfiles/#x',''],
];
for (const [url, expected] of urls) assert.equal(resourceFolderFromUrl(url), expected);
const meta={haVersion:null,capturedAt:'2026-09-09T00:00:00.000Z'};
const capture=(urls,repos=[])=>buildCapabilityProfile(resolveCapability(urls.map((url,i)=>({id:String(i),type:'module',url})),repos),meta);
const withoutTarget=['/hacsfiles/review-other/x.js'];
const withLocalTarget=[...withoutTarget,'/local/review-target/x.js'];
const a=capture(withoutTarget), b=capture(withLocalTarget);
assert.deepEqual(a,b);
assert.equal(a.installedFolders.includes('review-target'),false);
assert.equal(withoutTarget.some(x=>x.includes('/hacsfiles/')),true);
assert.equal(withLocalTarget.some(x=>x.includes('/hacsfiles/')),true);
assert.deepEqual(capture(['/hacsfiles/review-target/x.js']).installedFolders,['review-target']);
assert.deepEqual(capture(['/hacsfiles/']).installedFolders,[]);
const repoOnly=capture([],[{fullName:'review/fixture',folder:'review-target',version:'1.0.0',category:'plugin'}]);
assert.deepEqual(repoOnly.installedFolders,[]);
assert.equal(repoOnly.versions['review-target'],'1.0.0');
console.log('Extractor: 11 asserted cases passed.');
console.log('Different resource lists, identical complete profiles:',JSON.stringify(a));
console.log('Matching target survives; bare marker does not; metadata alone fills versions only.');
NODE
```

## MemPalace drawer candidates

The prior round's candidate was read back at `drawer_havdm_review_2d237df6e8548fde2202b234`. This round's single `mempalace_add_drawer` attempt was refused: “Peer MCP writer active; this server is read-only for mutating tools.” No retry, lease override, process kill or separate local memory file. Under MP-LEASE, the write-enabled author may file the following text verbatim: wing `havdm`, room `review`, `added_by="codex"`, source `docs/reviews/f9a-brief-codex-review-followup2.md`.

> [INVESTIGATION] HAVDM F9a brief second scoped follow-up, 2026-09-09 — OpenAI Codex / GPT-6 Astra reviewed a27df25..489815c plus the Round 2 radius declarations and all five corrected Round 1 rows. Deliverable: docs/reviews/f9a-brief-codex-review-followup2.md. Verdict CLEAR-WITH-FINDINGS: one non-blocking P3 remainder, SEV 2. P5 RESOLVED: the 975-byte historical bullet matches 0bfeb6c exactly and occurs once; the same containment check fails against a27df25. A/B/C alternatives and consequences match the original, with A's cost explicitly qualified. P6 RESOLVED: all 10268 prior disposition bytes are unchanged, and both the corrected historical account and three new radius rows were traced against their sources and consumers. P1/P2/P4 remain resolved. P3 PARTIALLY RESOLVED: the extractor description and direct cost qualifications are repaired, but the surviving condition still requires only any marked resource URL, not matching nonempty target evidence. A synthetic paired capture with an unrelated marked resource, with and without a local target resource, produces identical complete profiles; no real installation failure is claimed. The authorised drawer correction was read and verified present, with the same residual condition. Reviewer recommends owner acceptance of the documented P3 residual and progression to the already-required Sonnet spec and Codex review; another brief-only round is not proportionate in the reviewer's judgement. This is advice, not an owner acceptance or rule waiver. P6 fix-now timing was reasonable and the prior deferral preference is withdrawn. No target, source, test, governance, Issue, board or state edit; no HA access. Full validation, probes and limitations are in the committed review.
