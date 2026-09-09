# F9a brief — independent review, 2026-09-09

**Author:** OpenAI Codex / GPT-6 Astra — independent reviewer; author of none of the target brief.

**Reviewer:** n/a — first-pass review; no second-model cross-check commissioned or performed.

**Owner gate:** micah / BaggyG-AU decides the findings' dispositions and whether to lock the brief. Recommendations below are not owner decisions.

**Commission:** `prompts/codex/f9a-brief-review.md`, executed on `feature/f9a-brief`.

**Reviewed artifact:** `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md` at `00b9abf0258e597d6ae305100aa577b7e743044c`; base `main` = `691c8d17ecc19b44bfd5e4c44df09566667221a2`. Fetch confirmed that local HEAD and the remote branch matched. The prompt names `5edc997`; the additional commit `00b9abf` corrects the reviewer-seat record. This review includes that correction. `git diff --name-status main..HEAD` at the reviewed head listed the brief alone; production code and tests match the base.

**Restrictions acknowledged:** repository changes are confined to this review. No target, source-code, governance, Issue, board or `[STATE]` edit; no push or merge. Neither Home Assistant instance was contacted. No new governance mechanism is proposed. Electron execution, if required, would be headless and sequential with unit work; this docs-only review needs no e2e or integration suite.

## 1. Verdict

**BLOCKED-ON: §8 red-before-green requirement**

The brief's central export trace is sound, including the distinction between dashboard content and the separately generated live-preview warning. Its instruction to make every test leg fail on the existing code is unexecutable for the two control outcomes that already work. The other findings concern acceptance wording, the limits of the stored capability evidence, and record accuracy.

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                         | Severity | Blocks                          | Fix complexity (1–5) | Recommendation |
| --- | ----------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------- | -------------------- | -------------- |
| P1  | The brief requires tests of already-correct behaviour to fail before the change.                                        | SEV 1    | §8 red-before-green requirement | 1                    | Fix now        |
| P2  | The explanation of the minimum result makes agreed work and accurate warnings sound optional.                           | SEV 2    | None                            | 1                    | Fix now        |
| P3  | The brief overstates what the saved add-on inventory can prove.                                                         | SEV 2    | None                            | 1                    | Fix now        |
| P4  | The brief says an existing check is used only in the card picker, but placed cards use it too.                          | SEV 3    | None                            | 1                    | Fix later      |
| P5  | The decision record promises the original options for four questions, but does not preserve the push question that way. | SEV 3    | None                            | 1                    | Fix later      |

### Owner Decision Brief — P1

**Protects:** trustworthy tests without making the next author manufacture a failure. **Problem:** the absent-add-on case needs a fix; the present-add-on and never-connected cases already produce the desired result. **Product affected:** no new product defect from this document; the underlying missing export connection is confirmed at the service boundary. The defect here obstructs the spec's verification instructions. **Options and costs:** correct the instruction now with a small wording change; or explicitly accept that this part of the locked brief cannot be followed. **Recommendation:** fix now, retaining the control cases as evidence that the change preserves existing behaviour. **Do nothing:** the spec author must contradict the brief or produce a failure that tests something else.

### Owner Decision Brief — P2

**Protects:** completion of the work already selected, including an accurate explanation before deployment. **Problem:** the retained proposal describes part of that work as unnecessary for acceptance, alongside passages that require it. **Product affected:** unknown; no F9a implementation exists to inspect. The separate warning route exists in today's app. **Options and costs:** add a short clarification now outside the historical proposal; defer clarification to the spec and pay the interpretation cost there; or explicitly accept the ambiguity and rely on the settled scope elsewhere. **Recommendation:** fix now without rewriting the owner's original choices. **Do nothing:** a spec may satisfy the narrower paragraph while omitting an agreed part of the outcome.

### Owner Decision Brief — P3

**Protects:** a capability decision based on what was actually recorded. **Problem:** the saved inventory captures a particular kind of resource address; the brief presents that as a complete fact about installation. **Product affected:** unknown; this review did not measure any user's installation. **Options and costs:** qualify the statement now, leaving the existing detector and feature scope intact; defer the evidence boundary to the spec; or accept the broader wording as a known overstatement. **Recommendation:** fix now with a qualification. **Do nothing:** the spec can inherit confidence the measurement did not establish. This recommendation does not ask for broader add-on detection.

## 2. Confidence and method

Read the target end to end, including its historical proposal passages; compared its settled/open decisions with the owner records fetched by ID. Read `ai_rules.md`, the applicable sections of `docs/governance/OPERATING_AGREEMENT.md`, and `docs/templates/ADVERSARIAL_REVIEW.md`. Loaded the MemPalace practice index by ID and the full finding-verification, claim-evidence and evidence-boundary drawers. Checked the testing/release instructions relevant to a docs-only review; the stale release pointer resolves to `docs/RELEASES.md`.

Re-ran the brief's printed searches. Read the enclosing export functions and followed their consumers through the preload bridge, main-process handlers and WebSocket service. A scratch Node/esbuild probe executed the unchanged export/profile modules; it did not replace a text search with a claim of UI execution. The probe body and its evidence boundary appear in §3b.

Fetched [GitHub Issue #159](https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues/159) with `gh issue view 159 --json number,title,body,createdAt,updatedAt,url`: its code-anchor paragraph still says three App callers. The historical source command in §3a returns four App callers plus the iframe component caller at the Issue's named revision. This corroborates the brief's correction.

**Gate:** `./tools/checks` returned **REAL_EXIT=0** at reviewed head `00b9abf`: all four steps completed (lint, format, typecheck, unit); **0 lint errors / 145 warnings; 1559 tests passed / 105 files**. Log: `/tmp/havdm-f9a-brief-review-checks.log`. The gate checked the reviewed tree before this new review's final text existed; `./node_modules/.bin/prettier --check docs/reviews/f9a-brief-codex-review.md` separately passed for this review file. No target, production or test change intervened.

**Evidence boundary:** no Electron/e2e/integration, packaged-app, browser or live-HA run was performed or required for this docs-only branch. The hand traces establish the source's data flow, not successful deployment, a user's observed warning, or rendered HA fidelity. The null-version capture case is conditional on a non-string/missing version in an authentication frame; no such real-instance frame was observed. The on-disk profile filename was checked against installed dependency source, not by booting Electron or reading the owner's profile. The exact original multiple-choice transcript was unavailable; the committed proposal and MemPalace decision record were available. Live board state, user usage rates and the actual upstream layout-card folder name were not independently verified. Historical author gate runs remain author-reported; the independent run above is separately identified.

## 3. Claim ledger and coverage

`MEASURED` means source or output observed in this review; `INFERRED` identifies a hand trace or consequence. Severity and acceptance assessments are `JUDGEMENT`.

| Surface                                  | Result and load-bearing claim                                                                                                                                                                                                                                                                                 | Tag                                            | Evidence                                                                                                                                                                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header / §0 / classification             | No issue found with the reviewer correction or capability classification: the intended slice changes shared export machinery. A brief is the correct upstream artifact. No AC matrix, implementation file list or full test plan is owed here. P1 is an authored test obligation that exceeds the cited rule. | MEASURED / JUDGEMENT                           | Brief:11, :23, :46, :57; Operating Agreement:424, :438, :460; owner seat correction `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc`; withdrawal `drawer_havdm_decisions_6cee661a86b707ac149e207d`.                                                                         |
| §1 / §2 / §3 scope                       | No issue found with the product problem, F9a/F9b split, first-story order, or carrying an unconsumed layout-card fact. The pause counts a later product implementation, not this docs-only brief.                                                                                                             | MEASURED / INFERRED                            | Brief:99, :122, :132; owner split `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`; follow-up ruling `drawer_havdm_decisions_cf0c188aaf75f2cd622faadc`; pause `drawer_havdm_decisions_89b5f20cc75d3f70a7e0491b`; seeding `drawer_havdm_decisions_d30f5f85e1c5237c664ca26f`. |
| F1                                       | No issue found: the option search returns the five printed references and the two default expressions.                                                                                                                                                                                                        | MEASURED                                       | §3a search; `yamlConversionService.ts:979`, :1035; `cardModTranslator.ts:62`, :108, :181.                                                                                                                                                                                    |
| F2                                       | No issue found for the existing HAVDM translation-key branch: direct `false` strips the claimed styling keys and produces the existing summary sentence. This is not a claim that arbitrary imported `card_mod` payloads are stripped; that code deliberately preserves unclaimed keys.                       | MEASURED                                       | `cardModTranslator.ts:110`, :164, :174, :181; `exportWarningSummary.ts:51`; §3b probe; vision answer 4 in `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`.                                                                                                                 |
| F3                                       | No issue found: the production options literal provides warnings alone; the closure passes those options to each card; both defaults resolve to true. The unavailable branch therefore is not entered from the traced production callers.                                                                     | INFERRED; public-output corroboration MEASURED | `yamlService.ts:289`; `yamlConversionService.ts:1132`, :1147, :1162, :1034; `cardModTranslator.ts:108`, :181; §3a/§3b.                                                                                                                                                       |
| F4                                       | No issue found with the caller population, historical correction, or four-content/one-warning distinction. One content producer writes a file; the other three produce HA configuration.                                                                                                                      | MEASURED / INFERRED                            | §3a enumeration and consumer trace below.                                                                                                                                                                                                                                    |
| F5                                       | Generic retention of HACS resource folders is confirmed, including unmapped folders. No named layout-card field appears in the profile interface. The broader installation inference is overstated: P3.                                                                                                       | MEASURED / JUDGEMENT                           | `capabilityProfile.ts:24`; `capabilityResolver.ts:35`, :56, :79; `resourceElementMap.ts:37`; §3b.                                                                                                                                                                            |
| F6                                       | No issue found: the default contains `cardModPresent: false` with no capture; the hook fallback and initial provider state use that default. Reading the boolean alone would select the stripping branch for a fresh user, contrary to the permissive outcome. The asynchronous boot window also exists.      | MEASURED / INFERRED                            | `capabilityProfile.ts:46`; `CapabilityProfileContext.tsx:49`, :51, :62, :79; §3b; R1 in `drawer_havdm_decisions_6e8d4788d9513ccce593c378`.                                                                                                                                   |
| F7                                       | The export has no equivalent profile read, but the signal is not palette-only: P4.                                                                                                                                                                                                                            | MEASURED / INFERRED                            | `cardAvailability.ts:40`; `BaseCard.tsx:300`; `CardPalette.tsx:269`.                                                                                                                                                                                                         |
| F8                                       | No issue found with the conditional capture distinction: authentication accepts the frame after assigning a nullable version, and capture supplies a timestamp separately. The brief leaves the export signal to the spec.                                                                                    | MEASURED / INFERRED                            | `haWebSocketService.ts:154`; `main.ts:588`, :600; `capabilityProfile.ts:63`; §3b.                                                                                                                                                                                            |
| F9                                       | No issue found with the boot-read chain or the explicit filename hedge. The store reads the persisted profile; the provider mounts outside App. Seeding is plausible, not independently exercised here.                                                                                                       | MEASURED / INFERRED                            | `renderer.tsx:34`; `CapabilityProfileContext.tsx:55`; `preload.ts:82`; `main.ts:614`; `capabilityProfileService.ts:30`, :39; installed `electron-store/index.js:60` and `conf/dist/source/index.js:580`.                                                                     |
| F10                                      | No issue found with the service/component boundary: the inspected export service imports are React-free and the callers are within components under the provider. The transport design remains the spec's work within the adopted cost stop-rule.                                                             | MEASURED / INFERRED                            | Service imports; `yamlService.ts:323`; `renderer.tsx:34`; F4 trace.                                                                                                                                                                                                          |
| §5 settled decisions / §6 open decisions | No additional issue found in R1, R3, item 9, N2, split and vision against their cited authorities. D-1 through D-7 leave implementation choices open while D-2 explicitly retains the ruled layout-card fact. The acceptance explanation weakens that clarity: P2.                                            | MEASURED / JUDGEMENT                           | Brief:371–409, :563–570; the R1/R3/item-9, vision, split and September 8 decision drawers above; N2 reference `drawer_havdm_testing_ad358a7d31912bba2419205d`.                                                                                                               |
| §7 quotes                                | No issue found: the S01.1 outcome matches the frozen backlog row, and the F9a quotation retains the split ruling's outcome with marked omissions. The later carry-only ruling is explicitly explained in §2.                                                                                                  | MEASURED                                       | `docs/strategy/2026-09-07-product-backlog-seeding.md:177`; split ruling 1; brief:413–430, :122.                                                                                                                                                                              |
| §8                                       | P1: the named outcomes match the ruling; the added universal demand for a red result does not match the existing control behaviour or the qualified red-leg rule.                                                                                                                                             | MEASURED / INFERRED / JUDGEMENT                | Brief:439–455; Operating Agreement:66–73; §3b; testing drawer `drawer_havdm_testing_cd71883212b81299c3bbef76`.                                                                                                                                                               |
| §9 rulings / weakest cost claim          | The selected outcomes agree with the September 8 record. File-only work would leave other export routes untouched, as F4 says. P2 concerns the extra exclusions; P5 concerns the claimed completeness of the retained options.                                                                                | MEASURED / INFERRED / JUDGEMENT                | Brief:465–590; September 8 ruling drawer; F4 trace.                                                                                                                                                                                                                          |
| §10 / §11                                | No additional issue found with scope/safety restrictions or the declaration that the author's behaviour evidence is source tracing. P5 also affects §11's completeness claim. The review does not independently certify the author's historical gates or live board claims.                                   | MEASURED / JUDGEMENT                           | Brief:596–630; independent gate and evidence boundary in §2.                                                                                                                                                                                                                 |

Path key for the table and findings: export, WebSocket and persistence services live in `src/services/`; `capabilityProfile.ts`, `capabilityResolver.ts`, `cardAvailability.ts` and `resourceElementMap.ts` live in `src/services/capability/`; components live in `src/components/`; `CapabilityProfileContext.tsx` lives in `src/contexts/`; `main.ts`, `preload.ts` and `renderer.tsx` live directly in `src/`. “Brief” and “Operating Agreement” denote the reviewed brief and `docs/governance/OPERATING_AGREEMENT.md`. Dependency paths are under `node_modules/`. Ranges identify passages read, not executable coverage.

**Weakest claims:** P2 is an interpretation risk, mitigated by the explicit settled scope elsewhere and the passage's historical-proposal label; it is not graded as an unmitigated contradiction. P3 does not demonstrate a real layout-card installation missed by the detector. F3/F4 and the authentication-to-capture chain remain hand traces, despite the pure-module corroboration. The original questionnaire cannot be reconstructed from the records I read.

### 3a. Enumerations and the consumer trace

Commands re-run at the reviewed head (unchanged source relative to `691c8d1`):

```bash
grep -rn "cardModAvailable" src --include=*.ts --include=*.tsx
grep -rn "exportDashboard(" src --include=*.ts --include=*.tsx
grep -rn "exportCard(" src --include=*.ts --include=*.tsx
grep -rn "translateToCardMod" src --include=*.ts --include=*.tsx
grep -rl "cardModAvailable" tests/
git grep -n "sanitizeForHA\b\|serializeForHA\b\|sanitizeForHAWithReport\b" eb5c918 -- src/App.tsx src/components/HADashboardIframe.tsx
grep -rn "sanitizeForHA\b\|serializeForHA\b\|sanitizeForHAWithReport\b" src --include=*.ts --include=*.tsx
grep -rn "layoutCardPresent\|layoutCardAvailable" src --include=*.ts --include=*.tsx
grep -n "layout" src/services/capability/resourceElementMap.ts
grep -ln "from 'react'" src/services/yamlService.ts src/services/yamlConversionService.ts src/services/cardModTranslator.ts
rg -n 'resolveCardState|haVersion === null|capturedAt === null|clearProfile\(' src
rg -n '^### 9\.|push|PUSH|four|as they were put' docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md
```

The absent-name searches return no matches (grep exit 1); that is not a test failure. Import/symbol references were also inspected beyond the parenthesis-shaped searches to check for aliases or alternate consumers. The no-profile conclusion comes from reading the option construction and forwarding, not from these searches alone.

**Traced by hand, row by row:**

| Caller                      | Consumer chain and conclusion                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `App.tsx:426`               | Memo result → App props at :3515/:3517 → `DeployDialog.tsx:173` spreads the configuration and changes its title → :183 sends it to `haWsSaveDashboardConfig`. This call produces deploy content and its warning report.                                                                                                                                                                                                             |
| `App.tsx:748`               | `serializeForHA` → `yamlService.ts:314` gets the sanitized content/report → :318 builds the warning comment → `App.tsx:757` passes the YAML to `fileService.saveFileAs`. This call produces file content.                                                                                                                                                                                                                           |
| `App.tsx:2481`              | `sanitizeForHA` → preload `ha:ws:createTempDashboard` → `main.ts:628` → `haWebSocketService.ts:449`, which changes the title and saves the supplied content at :463. This call produces the initial temp-dashboard content.                                                                                                                                                                                                         |
| `App.tsx:2580`              | Destructures only `warnings` → :2581 summary → :2596 displays adjustments, or :2610 says nothing was adjusted. Confirm → :2625 sends two paths, not the exported configuration → `main.ts:654` → `haWebSocketService.ts:498` reads the temp dashboard and :501 saves it to the target. This export call produces words, not deployed content. The unknown-source branch at App:2553 exits to the normal DeployDialog route instead. |
| `HADashboardIframe.tsx:197` | Merges the edited view into the full config → sanitizes → :200 passes that configuration with a title to `haWsUpdateTempDashboard` → `main.ts:641` → `haWebSocketService.ts:529` saves it. This call replaces temp-dashboard content after a layout change.                                                                                                                                                                         |

The normal-deploy bridge continues through `preload.ts:94` and `main.ts:506` to `haWebSocketService.ts:378`, which sends the supplied config as `lovelace/config/save`; the temp-dashboard methods use that same service. The file producer continues through `fileService.ts:97–104` to the file-write bridge. The trace reaches these outbound service calls. No live response or server-side rendering was observed, and this is not a concurrency/staleness certification for the temporary dashboard.

### 3b. Pure-module probe

Executed `node /tmp/havdm-f9a-review-probe.cjs` at the reviewed head, exit 0. It bundled the repository modules with the installed esbuild; no production file or test was edited. The public API has no profile argument, so the mapping from its common output to §8's three profile cases uses the F3 trace. This was not an app launched with three injected profiles.

Observed:

- Public `sanitizeForHAWithReport` and `serializeForHA` preserve `color: red;` as generated `card_mod` CSS and emit no unavailable warning. That violates leg 1's desired outcome but already satisfies the styling/permissiveness outcomes of legs 2 and 3.
- Direct `exportDashboard(..., { cardModAvailable: false, warnings })` removes the generated styling and produces: “1 card had custom styling removed because the card-mod add-on isn't installed on your Home Assistant.”
- The default profile supplies `cardModPresent: false` and `capturedAt: null`. The builder can produce a non-null timestamp alongside a null version.
- The generic fixture `/hacsfiles/review-fixture/x.js` retains `review-fixture`; `/local/review-fixture/x.js` and an unrelated CDN URL retain no folder. These are resolver probes, not evidence of an installed layout-card.

The exact scratch program is reproduced at the end of this review before the memory candidate so the evidence can be rerun without the temporary file.

## 4. Findings

### P1 — SEV 1 — §8 demands a failing baseline for outcomes already correct

Blocks: §8 red-before-green requirement

**Broken claim:** brief:447–450 says “Each leg must be shown RED against today's code first” and dismisses a leg that is green before the change. The next bullet calls legs 2 and 3 controls.

**Violated fact/text:** the unchanged public export preserves the example's CSS without an unavailable warning (§3b), because `yamlService.ts:289` supplies no capability option and `yamlConversionService.ts:1035` defaults to true. That is already the desired present-card-mod and never-connected behaviour at brief:441–442. The standing rule at `OPERATING_AGREEMENT.md:66–73` requires a red leg **where a valid red leg exists**, and otherwise an explicit explanation and alternative evidence. The cited testing drawer does not authorise discarding that qualification.

**No recorded mitigation:** labelling the cases “control legs” does not exempt them from the preceding “Each leg must” instruction. F6's plausible future incorrect boolean wiring would turn the never-connected control red after a bad change; it cannot turn today's correct output red. No owner ruling in the split or September 8 records explicitly supersedes the qualified red-leg rule.

**REACHABILITY:** this contradiction exists in the current brief handed to the spec author. It is reached by carrying out its named present-card-mod and never-connected control cases against the unchanged public export. The probe observed the output on this checkout; the argument does not depend on a hypothetical future input to a safety gate. The profile-to-output mapping is the labelled F3 trace, not a claimed UI run.

**Fix:** correct the added universal instruction, retaining a behavioural red-before-green demonstration for the absent-card-mod defect and honest passing-baseline control evidence for the preserved outcomes. Let the spec choose the concrete tests and describe the evidence where no valid failing baseline exists.

**Must not change:** the owner's three outcomes, never-connected permissiveness, the absent-card-mod red leg, or the brief/spec seat boundary. Do not manufacture failures by asserting a new API exists or by reverting older translation work unrelated to F9a.

**Class swept:** the three named outcome legs and both explanatory bullets in §8, cross-checked against F2/F3/F6 and the cited ruling/testing records. Leg 1 has the defect to expose; legs 2 and 3 are the affected controls. **Complexity 1:** a contained wording correction; no code change. This is a fix, not a pivot.

### P2 — SEV 2 — the retained acceptance explanation weakens settled obligations

**Evidence/problem:** brief:567–570 says the layout-card fact and site 4's warning/content consistency are “worth doing” but do not make the story acceptable. Yet :127–128, :391–393 and :533–534 explicitly require the layout-card fact under option A. The adopted outcome at :32–35 requires the absent-card-mod warning, while the brief's own F4 explains why the separate warning call must agree with the content producers.

For the current known-source live-preview journey, `App.tsx:2580` generates the warning independently and :2610 displays “Nothing had to be adjusted for Home Assistant.” Updating content producers while leaving that call on the default would preserve the wrong message. That is the hand-traced risk; no partial F9a implementation was constructed or observed.

**Severity per construction:** the layout-fact exclusion and warning-consistency exclusion are each SEV 2 here. The settled scope, D-2/D-5 and the historical “proposal” label provide mitigation: the text can be followed correctly by treating those settled obligations as controlling. Consequently this is an ambiguous stopping point, not an unmitigated SEV 1 or a challenge to the owner's authority to choose a smaller outcome. The third exclusion, boot-window handling, remains an expressly open spec decision; no separate defect is asserted for leaving its mechanism undecided.

**Fix:** preserve the historical proposal and the adopted header wording, and clarify in the current interpretation that the minimum outcome does not waive option A or accurate warnings for the known-source deployment journey. The spec may choose how to achieve consistency, including an approach other than reading the same object twice.

**Must not change:** the F9a/F9b split, the unconsumed layout fact, the cost stop-rule, or ownership of the open transport/boot decisions. **Class swept:** the three items described as beyond acceptance in :567–570, traced back to §2, §5, D-2/D-5/D-6 and the September 8 rulings. **Complexity 1:** a short clarification outside the historical quotation. Fix now is advisory pending the owner's ruling.

### P3 — SEV 2 — F5 promotes conditional folder evidence into an installation universal

**Evidence/problem:** brief:277–285 correctly says the resolver retains every `/hacsfiles/<folder>/` segment it receives, then concludes that an installed layout-card's folder is in “every captured profile.” `capabilityResolver.ts:35–42` retains nothing from URLs lacking that marker; :56–60 skips them. The same boundary is explicit in the existing tests at `tests/unit/capabilityResolver.spec.ts:75–78` and confirmed by §3b's paired HACS/non-HACS inputs. `capabilityProfile.ts:71–72` serializes those derived sets; it does not recover the omitted resource information.

The evidence establishes that a captured matching resource can be interpreted later even if its folder was absent from the curated map. It does not establish that every installation is represented that way. The qualification about a still-unverified folder name addresses which folder to look up, not whether the capture contains it. The cost argument repeats the broader confidence at brief:529 and :536–539.

**Severity boundary:** SEV 2 for an overstated inference. This review observed generic resolver exclusions, not a real user's layout-card installation, and does not claim a demonstrated production miss. No blocker is inferred from those synthetic URLs.

**Fix:** bound F5 and the derived cost explanation to matching resources in the saved capture. Retain the useful no-migration derivation for that evidence, and leave the upstream name/provenance work with the spec author.

**Must not change:** the ruled one-object scope; do not add manual-resource detection, new capture machinery or a profile migration merely to repair this sentence. **Class swept:** the resource-to-resolver-to-profile retention chain and the F5-based cost/decision passages in D-2 and §9.2. **Complexity 1:** qualify the claim and its dependants. Fix now is advisory pending the owner.

### P4 — SEV 3 — F7's palette-only inventory omits placed-card marking

**Evidence/problem:** brief:312–317 calls the signal palette-only. `BaseCard.tsx:300–306` calls `resolveCardState` with the captured profile to decide placed-card marking, alongside the palette consumer at `CardPalette.tsx:269–273`. With no override and a real non-spacer card, the null-version branch in `cardAvailability.ts:40` returns `available`, preventing unavailable marking in that consumer too. The brief also cites line 41; the condition is at line 40 on the pinned source.

**Fix:** describe the shared availability resolver's palette and placed-card consumers and correct the source line. **Must not change:** the export-scope observation, the existing permissive resolver or any consumer behaviour. **Class swept:** resolver references and direct null-version checks in `src/`, then the executable palette and BaseCard consumers read by hand (§3a). **Complexity 1:** wording/source-coordinate correction. No product change or review round-trip is owed for this record correction alone.

### P5 — SEV 3 — the four-question options-completeness claim is not supported

**Evidence/problem:** brief:465–469 promises the options as put for four questions; :627 repeats that claim. The section contains §9.1 review, §9.2 layout scope and §9.3 header fields. Push appears as an outcome in the introduction, with no corresponding options record. The authoritative September 8 drawer records ruling 4 separately: push yes, no PR opened, owner opens and merges PRs. The committed original at `0bfeb6c` also has no push-question passage.

The outcome itself agrees with the available record; the defect is the completeness assertion. The original multiple-choice transcript was not available, so I do not certify that the other options are verbatim reproductions or invent missing alternatives. In particular, §9.1 explains the reviewer-seat correction but is not the full original multiple-choice instrument.

**Fix:** narrow the completeness claim to what is actually preserved and point to the authoritative push ruling; reproduce original options only if their original source is available. **Must not change:** the selected reviewer, option A, adopted header fields, push outcome or the candid seat-error correction. **Class swept:** the four decisions named in §9's introduction against its subsections, the original brief and the September 8 ruling drawer; also §11's repeated claim. **Complexity 1:** record qualification. No new questionnaire, template section or procedure is proposed. No round-trip is owed for this record correction alone.

## 5. Directions

Correct P1 before locking the affected verification instruction. Put P2/P3 and the record corrections to the owner by Ref for disposition; the recommendations here do not authorise repairs. The target remains unchanged by this review.

No product or architectural pivot is indicated. The proof of the P1 wording repair is a reread against the qualified rule and the demonstrated baseline/control distinction, not an invented failing test. P2/P3 can be checked against the existing cited passages and evidence boundary; P4/P5 against their source/record enumerations. No Electron suite is needed to verify these brief corrections.

## 6. Disagreements

This review agrees with the brief's corrections to Issue #159 and with its F3/F4 data-flow analysis. It disagrees with §8's universal red demand, qualifies F5's derivation, and records the acceptance ambiguity and inaccurate inventories above. It does not revisit the owner's carry-only decision or the capability classification. No second-model cross-check has been performed, and no owner disposition is implied.

## Reproducible scratch probe

Run from the repository root at the reviewed source revision. This is evidence for this review, not a new project gate or committed test requirement.

```bash
node <<'NODE'
const { buildSync } = require(process.cwd() + '/node_modules/esbuild');
const source = `
import { yamlService } from './src/services/yamlService';
import { exportDashboard } from './src/services/yamlConversionService';
import { summarizeExportWarnings } from './src/services/exportWarningSummary';
import { defaultCapabilityProfile, buildCapabilityProfile } from './src/services/capability/capabilityProfile';
import { resolveCapability } from './src/services/capability/capabilityResolver';
export { yamlService, exportDashboard, summarizeExportWarnings, defaultCapabilityProfile, buildCapabilityProfile, resolveCapability };
`;
const built = buildSync({stdin:{contents:source, resolveDir:process.cwd(), loader:'ts'}, bundle:true, write:false, platform:'node', format:'cjs', packages:'external'});
const captured = {exports:{}};
const {createRequire} = require('node:module');
new Function('require','module','exports',built.outputFiles[0].text)(createRequire(process.cwd() + '/package.json'),captured,captured.exports);
const {yamlService,exportDashboard,summarizeExportWarnings,defaultCapabilityProfile,buildCapabilityProfile,resolveCapability} = captured.exports;
const assert = require('node:assert/strict');
const config = {title:'Review',views:[{title:'Main',path:'main',cards:[{type:'markdown',content:'x',style:'color: red;'}]}]};
const report = yamlService.sanitizeForHAWithReport(config);
const yaml = yamlService.serializeForHA(config);
assert.match(report.config.views[0].cards[0].card_mod.style,/color: red/);
assert.equal(report.warnings.some(w=>w.reason==='card-mod-unavailable'),false);
assert.match(yaml,/card_mod:/);
assert.equal(yaml.includes("card-mod add-on isn't installed"),false);
console.log('Base public export: CSS preserved in card_mod; absent warning not emitted.');
console.log('Against section 8 outcomes: leg 1 RED; leg 2 GREEN; leg 3 GREEN.');
console.log('Boundary: public API has no profile input; profile-state mapping is the F3 hand trace, not an app injection.');
const warnings=[];
const stripped = exportDashboard(config,{cardModAvailable:false,warnings});
assert.equal(stripped.views[0].cards[0].card_mod,undefined);
assert.equal(stripped.views[0].cards[0].style,undefined);
assert.equal(warnings.filter(w=>w.reason==='card-mod-unavailable').length,1);
console.log('Direct false option:',summarizeExportWarnings(warnings).lines);
const fresh=defaultCapabilityProfile();
assert.equal(fresh.cardModPresent,false);
assert.equal(fresh.capturedAt,null);
console.log('F6 bare default flag would select the stripping branch:',fresh.cardModPresent===false);
const generated = buildCapabilityProfile(resolveCapability([]), {haVersion:null,capturedAt:'2026-09-09T00:00:00.000Z'});
assert.equal(generated.haVersion,null);
assert.equal(generated.capturedAt,'2026-09-09T00:00:00.000Z');
console.log('F8 builder admits captured profile with null version:',JSON.stringify(generated));
for (const url of ['/hacsfiles/review-fixture/x.js','/local/review-fixture/x.js','https://cdn.example.com/review-fixture/x.js']) {
 console.log('F5 folder retention:',url,JSON.stringify([...resolveCapability([{id:'review',type:'module',url}]).installedFolders]));
}
NODE
```

## MemPalace drawer candidates

The single attempted `mempalace_add_drawer` write was refused with “Peer MCP writer active; this server is read-only for mutating tools.” No retry, lease override, process termination or alternate memory write was attempted. Under MP-LEASE, the write-enabled author may file the following in wing `havdm`, room `review`, with `added_by="codex"` and this review as `source_file`.

> [INVESTIGATION] HAVDM F9a brief independent review, 2026-09-09 — OpenAI Codex / GPT-6 Astra reviewed docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md on feature/f9a-brief at 00b9abf0258e597d6ae305100aa577b7e743044c (base 691c8d17ecc19b44bfd5e4c44df09566667221a2). Review deliverable: docs/reviews/f9a-brief-codex-review.md. Verdict BLOCKED-ON: §8 red-before-green requirement. P1 SEV 1: §8 requires each leg RED on today's code although the present-card-mod and never-connected control outcomes already pass; OA §2 qualifies red evidence by whether a valid red leg exists. P2 SEV 2: §9.3 calls the owner-required layout-card fact and live-preview warning/content consistency extras outside acceptance, creating an ambiguous acceptance boundary alongside §9.2 option A and the adopted strip-and-warn outcome; those stronger settled statements mitigate it, so it is non-blocking. P3 SEV 2: F5 turns generic retention of /hacsfiles/ folder URLs into an unqualified claim about installed layout-card in every captured profile; the resolver omits non-HACS URLs. P4 SEV 3: F7 says the never-connected signal is only in the palette although BaseCard consumes the same resolver. P5 SEV 3: §9/§11 claim the four decisions retain the options as put, but push has only an outcome in §9's introduction and no option record; original multiple-choice transcript not available, so no reconstruction claimed. Re-ran the brief's lexical searches and traced the five export consumers through IPC/main/HA WebSocket service: four output producers (one file, three HA config producers), one warning-only caller. F3 option-default chain and F6 default-profile trap confirmed; F8 null-version capture is a conditional source trace, not observed live HA traffic. Pure-module scratch probe confirmed public export keeps generated CSS and omits unavailable warning, direct false option strips and warns, and generic folder retention excludes /local/ and unrelated CDN URLs. No source, target, governance, board, Issue or [STATE] change; no HA access. Findings are reviewer assessments, not owner dispositions. Full evidence, limitations and validation belong to the committed review.
