Author: Claude Opus 5 (`88e6f9a`, `380f05a`, and `dd92fe6`; round-6 fix, follow-up, and round-7 commission author)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; authored rounds 1–6 and did not author any fix
Owner gate: BaggyG-AU decides whether PR #142 proceeds and is the only person who merges it

# Independent review — F3 “no preview colours” badge, round 7

## Round-6 disposition

| Round-6 finding                                                     | Disposition                     | Round-7 ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R6-M1** — all four collapsed badges are skipped by sequential Tab | **RESOLVED — rejection upheld** | **The author is right and my round-6 product finding was false.** I started forward traversal at the combobox even though the badge precedes that input. That measurement correctly showed where focus went, but it could not decide whether the earlier badge was in the tab order. With each popup closed, I independently measured the exact badge node: `Shift+Tab` from the owning combobox and forward `Tab` from the badge's true predecessor both reached it at all four hosts. The settings modal focus trap and an RTL header also reached the exact node. Open popups retained focus in the combobox; Escape closed the popup, after which the measured collapsed path was available. That normal transient composite state does not make the badge keyboard-unreachable. The committed helper remains under-specific as evidence; that is new non-blocking finding R7-N1, not the rejected product defect. |
| **R6-M2** — option Tags omit the qualification                      | **RESOLVED**                    | The author's mechanism correction is right. The visible `optionRender` row is not the accessible option; antd's hidden 0×0 listbox is. Badged option data now supplies the short accessible name and long description at `src/features/theme-manager/themeOptions.ts:195-206`. The current Electron run resolves both through `toHaveAccessibleName` and `toHaveAccessibleDescription`; an unbadged option resolves to its plain name and an empty description. My round-6 statement that Chromium ignored the visible generic Tag's name was false as a browser claim, although the conclusion that the real option lost the qualification was correct. Physical-reader behavior remains **UNVERIFIED**, as bounded below.                                                                                                                                                                                            |
| **R6-N1** — contradictory red/control prose                         | **RESOLVED**                    | The two named comments and the third contradiction created during the fix are corrected. I swept every declaration of red/control/falsifier status in the changed badge-spec blocks and reconciled it with the recorded old-source result. I found no remaining contradiction in that class.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## Verdict

**APPROVE — medium-high confidence.**

My answer to “Is PR #142 done?” is **(a): ship it**. The two round-6 blocking
claims are now either fixed (R6-M2) or disproved (R6-M1), the required gate and
targeted Electron population pass, and I found no remaining product defect in
the commissioned slice. R7-N1 and R7-N2 are real but non-blocking test/prose
quality issues. Neither is worth a seventh product-fix round for this interim
badge; both can be cleaned up in a follow-up.

The owner should still decide whether the age of the full-suite record warrants
one final full integration/e2e run before merge. That is an evidence-scope
choice, not a defect I can infer from unrun tests.

## Findings

### R7-N1 — NON-BLOCKING: the Tab helper can certify the wrong same-testid node and races popup closure

`expectReachableByTab` scopes the combobox to the requested Select at
`tests/integration/theme-no-effect-badge.spec.ts:128-133`, but then discards
that scope: both destination assertions compare only the active element's
`data-testid` with `theme-no-effect-badge` at `:135-153`. That test id is
deliberately repeated across the eight render contexts. The four callers are at
`:280`, `:384`, `:510`, and `:516`.

I removed the intended override badge's `tabindex`, inserted a focusable
same-testid button immediately before its input, and ran the helper-shaped
assertion. It passed while the scoped override badge was not focused; the
impostor was. Therefore the red run against `6eb47d8` proves the helper can
detect the old absence of any intervening matching tab stop, but not the
stronger claim that it always identifies the intended badge.

The helper also does not establish that the just-used popup is closed. In
isolated runs, immediately traversing after selection sometimes retained focus
on the input; waiting for
`.ant-select-dropdown:not(.ant-select-dropdown-hidden)` to reach count zero
made exact traversal deterministic. This is consistent with the separate
open-popup measurement, where `Shift+Tab` intentionally stayed in the Select.

**Class sweep.** The behavior class was every committed assertion that claims a
particular collapsed badge received focus. I keyed the sweep on
`expectReachableByTab`, `activeElement`, the repeated
`theme-no-effect-badge` id, and every `labelRender` call. All four callers share
the same weakness; no second helper closes it. My independent exact-locator
probes reached the intended current node at all four hosts, so this is a test
evidence defect rather than a current product failure. A follow-up should pass
the scoped badge locator into the helper, assert `toBeFocused()`, and explicitly
wait for popup closure before measuring the collapsed state.

### R7-N2 — NON-BLOCKING: the fix-round documentation overstates two populations and leaves one source pointer stale

The new copy module says the feature layer “must not depend on
`src/components/`” at
`src/features/theme-manager/themeBadgeCopy.ts:4-10`; the component repeats it
at `src/components/ThemeNoEffectBadge.tsx:76-81`. That is not a repository
boundary: `src/features/tabs/TabsPanel.tsx:3-4`,
`src/features/popup/PopupCardModal.tsx:3`,
`src/features/accordion/ExpanderPanel.tsx:3-4`, and
`src/features/carousel/SwiperCarousel.tsx:31` all import components. The move to
a dependency-neutral leaf is sensible and creates no cycle, but the stated
repository rule is invented.

Two adjacent claims in `src/features/theme-manager/themeOptions.ts` also need
narrowing:

- `:40-46` still directs readers to the tooltip and its binding docblock in
  `src/components/ThemeNoEffectBadge.tsx`; the definition and governing
  docblock moved to `src/features/theme-manager/themeBadgeCopy.ts:17-91`, while
  the component now only re-exports it.
- `:99-109` says every theme selector in the suite uses `title` and commands
  “never” to locate a theme option by role name. The new accessibility-tree leg
  deliberately and correctly uses `getByRole('option')` at
  `tests/integration/theme-no-effect-badge.spec.ts:452,476`. The true rule is
  that selection/action locators use the stable `title`; accessibility
  assertions must use the actual option role.

**Class sweep.** I defined the class as every new or invalidated explanation of
the string move, canonical source, dependency direction, and changed option
identity. I normalized whitespace and Markdown markers across the changed
source, test, and review corpus before searching for `must not depend`, the
tooltip identifier, `Every theme selector`, `title`, `never`, and
`getByRole('option')`. I then enumerated all `src/features` imports of
`src/components` and all theme-option role locators. The three statements above
are the complete false/stale set in that class. None changes runtime behavior.

## Commission hypotheses

| Hypothesis                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — R6-M1 rejection is wrong**                                      | **Rejected; R6-M1 rejection upheld.** Closed-state exact-node traversal passed in both directions at header, settings, saved-theme, and override hosts. The settings focus trap and closed RTL header passed. With the popup visibly open, `Shift+Tab` retained the input at all four hosts (and at the header in both LTR and RTL), which is the Select's composite state rather than proof that the collapsed badge is outside sequential order. Escape closed the popup; the closed-state route then applies. My round-6 probe omitted direction and supported a false conclusion.                                                                                                                                                                                                                                                                                                                                               |
| **H2 — `aria-description` is the wrong mechanism**                     | **No current blocking defect; support boundary recorded.** Electron's Chromium exposes the long sentence as the computed accessible description and the committed matcher passes. `aria-description` is nevertheless a proposed ARIA 1.3 attribute rather than part of the completed ARIA 1.2 Recommendation; the 1.3 draft also prefers `aria-describedby` when a short description already exists in the DOM. See the [WAI-ARIA overview](https://www.w3.org/WAI/standards-guidelines/aria/) and [ARIA 1.3 `aria-description`](https://www.w3.org/TR/wai-aria-1.3/#aria-description). No NVDA, JAWS, or Orca session was run, so reader announcement is **UNVERIFIED**. That uncertainty does not prove a failure in this controlled Electron target, and the short accessible name itself still carries the visible warning. A physical-reader smoke test is the useful next evidence, not another speculative mechanism change. |
| **H3 — virtualized options lose fields away from the sampled indices** | **Disproved.** A reviewer probe injected 12 long-list themes alternating badged and rich, arrowed 28 times, observed every theme at an active index, and found the hidden listbox held at most three zero-width options. Every badged active option had the expected name and description; every rich option retained its plain name and no description. The individual probe passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **H4 — accessible name diverges from visible label / duplicates**      | **No WCAG 2.5.3 defect found.** The visible row contains the theme name followed by “no preview colours”; the accessible name contains the same two visible strings in the same order. The hidden accessible option and visible generic row are separate antd representations, not two names on one option. Whether a particular physical reader voices redundant nearby content is **UNVERIFIED**, not a demonstrated defect.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **H5 — changed option names break a missed role-name consumer**        | **No runtime consumer missed; documentation issue R7-N2.** I swept theme test ids, theme DSL calls, `getByRole('option')`, `title`, option builders, and all changed-source test consumers. Theme selection actions use the title-based locator. The only theme-option role lookups are the intentional computed-accessibility assertions at badge-spec `:452,476`; those contradict the prose's universal, not the product.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **H6 — feature-to-component boundary is real**                         | **It is not a repository rule; R7-N2.** Five imports across four existing feature components disprove it. The new module is still a coherent leaf: it imports neither React nor antd, `themeOptions` imports it, and the badge component imports/re-exports it. I found no reverse edge or cycle. The refactor is small and directly supports option-data accessibility, so the false rationale is non-blocking prose overreach.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **H7 — sentinel/unbadged options accidentally gain ARIA fields**       | **Disproved.** `themeOption` returns before adding either field for an unbadged theme (`src/features/theme-manager/themeOptions.ts:195-206`). The no-override sentinel is a literal field-free object with `definesNoCanvasColors: false` (`src/components/ThemeSettingsDialog.tsx:269-280`). Real themes—including a supported theme named `__none__`—are namespaced to `theme:<name>` by spreading the source option, so a real badged theme correctly retains its fields while the sentinel cannot acquire them. The gate's 24 themeBadge unit legs and current collision/control integration legs pass, including mode-sensitive inputs.                                                                                                                                                                                                                                                                                        |
| **H8 — Tab helper is live on the right known-bad input**               | **Partly: it detects `6eb47d8`, but does not prove exact identity.** Removing `tabIndex` is a legitimate known-bad for “some matching badge intervenes.” It does not distinguish the intended badge from another same-testid node; the impostor mutation passed, producing R7-N1. Exact scoped probes supply the missing current-product evidence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **H9 — reach outside the commissioned eight**                          | **No required ninth spec found.** Source-to-consumer tracing closed on the badge spec, the two commissioned integration specs, the five e2e specs, and the gate's unit coverage. If the owner wants an additional low-cost modal smoke, `tests/e2e/settings.spec.ts` is the only plausible extra because `ThemeSettingsDialog` changed; it opens and switches to Appearance but does not exercise theme option semantics, so the dedicated badge test is stronger. I did not run it or any full suite.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **H10 — remaining unmeasured visual/reader cases are blocking**        | **No demonstrated blocker.** Dark-mode predicate behavior is unit-tested, but dark visual rendering, tooltip clipping, long-name truncation, and a physical screen reader remain **UNVERIFIED**. None is implicated by a source path or rendered-DOM failure found here. Physical-reader behavior is the most valuable follow-up because of H2; the other cases remain deferrable visual hardening.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

## Previously clean areas rechecked

### Six-field boundary and mode selection

No regression found. `definesNoCanvasColors` still delegates to the shipped
mapper and requires every returned value to be absent
(`src/features/theme-manager/themeOptions.ts:115-134`). Both available and
saved themes pass through the same mode-sensitive helper at `:195-225`; Theme
Settings supplies `localDarkMode` at
`src/components/ThemeSettingsDialog.tsx:221-239`. The production mapper is
unchanged from `baa5313`, and the 24 themeBadge unit legs pass.

### Fixture fidelity and built-ins

No repository regression found. `tests/fixtures/realHaThemes.ts`,
`tests/unit/builtInThemes.spec.ts`, `src/services/themeService.ts`, `src/App.tsx`,
`src/components/ThemePreviewPanel.tsx`, and `src/types/homeassistant.ts` have no
diff in `baa5313..dd92fe6`. I did not contact or mutate the reference Home
Assistant instance, so remote fixture freshness is **UNVERIFIED**.

### Option identity and collisions

No issue found. Available/saved ordering and deduplication remain in
`buildThemeOptions`; the override list preserves every option field while
namespacing only its value. The `__none__` collision and quoted-name DSL controls
pass in the badge spec. The sentinel remains distinct from a real saved theme
named `__none__`.

### Import graph

No cycle or runtime-heavy import was introduced. `themeBadgeCopy.ts` is a pure
leaf, `themeOptions.ts` imports that leaf, and `ThemeNoEffectBadge.tsx`
imports/re-exports it. Typecheck passes. The stronger claimed architecture rule
is false and is reported separately as R7-N2.

### Render guards and eight-context population

No missing or extra product context found. A JSX sweep found exactly four
`optionRender` and four `labelRender` uses of `ThemeNoEffectBadge`:
`ThemeSelector` contributes two and `ThemeSettingsDialog` contributes six. All
four option rows are guarded by `option.data?.definesNoCanvasColors`; all four
collapsed values resolve the same flag, pass `focusable`, and leave option rows
out of the Tab order.

### Affected-spec population and fix scope

The changed source's importers, four theme test ids, DSL consumers, and option
locators re-derived the commissioned eight Electron specs plus the unit specs
already inside the gate. `tests/e2e/settings.spec.ts` is an optional weak modal
smoke, not missing semantic coverage. The fix does not alter the canvas fidelity
contract, HA-06 UAT, ThemeVars, snapshot assets, built-in definitions, `[STATE]`,
or the reference HA instance.

### Live PR state

At final inspection PR #142 was open, non-draft, and unmerged; GitHub reported
`mergeStateStatus=CLEAN`, successful completed CI, base
`6bf5f62919b23ea3733859b261e71a5a41b42d06`, and head
`dd92fe6019e6dce661270485605d2a3af5b6aa25`. The requested fix head is
`380f05a`; I also reviewed the current `dd92fe6` follow-up because it changes the
same explanatory option-locator prose and supplies this commission.

## Verification evidence and boundary

All commands below ran from `feature/f3-theme-canvas-badge`. “Exit” is the real
process exit, including reviewer-probe development runs; an assertion that
passed before a later setup/cleanup failure is reported only for that narrow
property.

| Command                                                                                                                                                                                                                                 | Exit and result                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `./tools/checks` (first run)                                                                                                                                                                                                            | **1.** Lint: 0 errors / 145 warnings; formatting and typecheck passed. Unit: 103 files passed / 1 failed, 1,412 tests passed / 1 failed of 1,413. `DeployDialog.spec.tsx` timed out at 5,049 ms on the 5,000 ms “no config” leg.                                          |
| `npx vitest run tests/unit/DeployDialog.spec.tsx`                                                                                                                                                                                       | **0.** 11/11 passed; the previously timed-out leg completed in 1,275 ms.                                                                                                                                                                                                  |
| `./tools/checks` (clean-tree rerun)                                                                                                                                                                                                     | **0.** Lint: 0 errors / 145 warnings; format and typecheck passed; 104/104 unit files and 1,413/1,413 tests passed. `themeBadge.spec.ts` contributed 24 passing legs.                                                                                                     |
| `bash tools/test-headless.sh tests/integration/theme-no-effect-badge.spec.ts --project=electron-integration --workers=1`                                                                                                                | **0.** 20 passed in 3.6 minutes.                                                                                                                                                                                                                                          |
| `bash tools/test-headless.sh tests/integration/theme-integration.spec.ts tests/integration/theme-integration-mocked.spec.ts --project=electron-integration --workers=1`                                                                 | **0.** 7 passed in 51.9 seconds.                                                                                                                                                                                                                                          |
| `bash tools/test-headless.sh tests/e2e/theme-manager.spec.ts tests/e2e/theme-restore.spec.ts tests/e2e/theme-chrome.spec.ts tests/e2e/offline-local-content.spec.ts tests/e2e/smart-actions.spec.ts --project=electron-e2e --workers=1` | **0.** 12 passed in 3.4 minutes.                                                                                                                                                                                                                                          |
| `ps -ef \| grep playwright` before every Electron invocation                                                                                                                                                                            | **0 each.** Only that invocation's shell and grep appeared; no prior Playwright run was active.                                                                                                                                                                           |
| Badge-spec reviewer probes, `--grep "ROUND7 REVIEW PROBE"` (two development runs)                                                                                                                                                       | **1, 1.** First: 3 probe failures (one expected open-popup falsifier, two probe-construction errors). Second: virtualization and impostor legs passed; the navigation leg failed in probe modal cleanup. No committed test failed.                                        |
| Badge-spec open-state probe, `--grep "open dropdown, RTL"` (seven development runs)                                                                                                                                                     | **1 each.** The useful observations were stable—open header LTR/RTL, settings, saved, and override Selects retained the input on `Shift+Tab`—while the evolving multi-host probe failed later setup/transition cleanup. These exits are not reported as product failures. |
| Badge-spec final open-state selection, `--grep "ROUND7 REVIEW PROBE — open dropdown\|ROUND7 REVIEW PROBE — Theme Manager"`                                                                                                              | **0.** 2/2 passed; it reproduced open-state input retention, confirmed the settings popup closed on Escape without closing the modal, and confirmed closed RTL header focus reached the exact badge.                                                                      |
| Badge-spec exact-node traversal probe, `--grep "ROUND7 REVIEW PROBE — both traversal directions"` (three development runs)                                                                                                              | **1, 1, 1.** The last run logged exact reverse/forward success for header and settings before later Theme Manager setup failed. Earlier exits exposed the need to await popup closure rather than contradicting the closed-state result.                                  |
| Badge-spec manager exact-node probes, `--grep "ROUND7 REVIEW PROBE — both manager hosts"` (four development/final runs)                                                                                                                 | **1, 1, 1, 0.** Override exact reverse/forward traversal passed before a later saved-selector setup failure. The final isolated saved-host run, with popup closure awaited, passed exact reverse and forward traversal.                                                   |
| Virtualized 12-theme probe (individual test within the second grouped probe command)                                                                                                                                                    | **Passed inside parent exit 1.** All 12 themes observed across 28 ArrowDown steps; hidden option population at most 3; badged fields present and rich-theme fields absent.                                                                                                |
| Same-testid impostor probe (individual test within the second grouped probe command)                                                                                                                                                    | **Passed inside parent exit 1.** It demonstrated the committed helper's false-positive input described in R7-N1.                                                                                                                                                          |
| `git diff --exit-code baa5313..HEAD -- tests/fixtures/realHaThemes.ts tests/unit/builtInThemes.spec.ts src/services/themeService.ts src/App.tsx src/components/ThemePreviewPanel.tsx src/types/homeassistant.ts`                        | **0.** Previously clean fixtures, built-ins, mapper, and consumers remain unchanged.                                                                                                                                                                                      |
| Source/test population sweeps with `rg` over `buildThemeOptions`, `ThemeNoEffectBadge`, `labelRender`, `optionRender`, the four theme test ids, `getByRole('option')`, `title`, `aria-description`, and feature-to-component imports    | **0.** Produced the populations reported above.                                                                                                                                                                                                                           |
| Wrap-proof `perl -0777` whitespace/Markdown normalization followed by `rg` for the move, boundary, canonical-source, and locator claims                                                                                                 | **0.** Produced the complete R7-N2 set after source verification.                                                                                                                                                                                                         |
| `git diff --exit-code -- tests/integration/theme-no-effect-badge.spec.ts` plus working-file/`HEAD` SHA-256 comparison after probes                                                                                                      | **0, 0.** The test is restored byte-for-byte; no source or test change remains.                                                                                                                                                                                           |
| `gh pr view 142 --json number,state,isDraft,mergeStateStatus,headRefOid,baseRefOid,title,url,statusCheckRollup`                                                                                                                         | **0.** Returned the live PR state recorded above.                                                                                                                                                                                                                         |

Read-only `git status`, `git log`, `git diff`, `git rev-parse`, `sed`, `nl`, and
`rg --files` inspection commands also returned **0**. The temporary reviewer
probes were applied only to the commissioned badge spec and removed after each
evidence cycle; the final restoration checks above are the authority for the
delivered tree.

Full integration and e2e suites were **NOT MEASURED** at this head, per the
commission. The standing record remains round 5 at `0e8ca23`: integration exit
0, 231 passed / 19 skipped of 250; e2e exit 1, 316 passed / 7 canonical failures
/ 2 skipped of 325. The badge spec has since grown to 20 tests, so a present full
integration run would enumerate 254; nobody measured it.

Also **UNVERIFIED**: a physical NVDA/JAWS/Orca announcement; dark-mode visual
rendering; tooltip clipping; long-name truncation; remote reference-HA freshness;
and production behavior outside the tested Electron renderer. I made no `src/`,
test, PR-body, `[STATE]`, UAT, merge, push, or reference-HA mutation.

## Answer to §7 for the owner

**(a) Ship it.** No specific product defect remains in this slice. R7-N1 is an
under-specific test helper and R7-N2 is false/stale maintenance prose; neither
warrants a seventh fix round for the interim badge. If the owner wants more
evidence before merge, the meaningful choices are a physical-reader smoke test
for `aria-description` and/or refreshed full suites—not another product change
without a reproduced failure.

## MemPalace drawer candidates

- **HAVDM decision/outcome — supersede the round-6 accessibility disposition:** R6-M1 was false because the reviewer traversed forward from an element after the badge; exact reverse traversal from the combobox and forward traversal from the true predecessor reach all four collapsed badges. R6-M2 is resolved through option data on antd's hidden accessible options. File with `added_by="codex"`.
- **Practice — focus evidence needs direction, state, and exact identity:** name the starting node and direction, establish whether a composite popup is open or closed, and compare the intended locator/node rather than a repeated test id. A same-testid impostor can satisfy a lossy active-element projection. File with `added_by="codex"`.
- **Practice — computed accessibility support is not physical-reader support:** a browser-computed accessible description proves the browser algorithm and platform-tree input, not NVDA/JAWS/Orca announcement. Record the latter as **UNVERIFIED** until a reader is run, especially for a proposed ARIA 1.3 attribute. File with `added_by="codex"`.
- **HAVDM architecture — do not promote local dependency hygiene into a repository rule:** `src/features` already imports `src/components` in tabs, popup, accordion, and carousel. The badge copy leaf is useful, but “features must not depend on components” is not the current architecture. File with `added_by="codex"`.
