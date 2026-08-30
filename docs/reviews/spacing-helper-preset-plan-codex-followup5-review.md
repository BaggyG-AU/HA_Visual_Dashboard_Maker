# SEV-1-BLOCKED — scoped follow-up 5 review of the spacing-helper preset plan

Author and repair author: Claude Opus 5 (interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer as rounds 1–5)
Owner gate: micah / BaggyG-AU; this review decides nothing on its own
Reviewed head: `e65bb461d181ed364afa0c099a01e6891c45cb85`

## Verdict

**SEV-1-BLOCKED.** Revision 6 repairs SP-20, SP-23 and SP-24. It partially
repairs SP-21: snapshotting the other half makes a wrong-control _mutation_ loud,
but a wrong-control operation still passes when both requested and foreign
controls already show the selected value (SP-25). When the new snapshot does
detect a mutation, its bare array comparison names neither the requested control
nor the control that moved, contradicting the plan's mandatory “loud, named”
failure and leg 5 oracle (SP-26). No implementation may begin from this revision.

SP-22 has regressed rather than resolved. The plan says the live totals are
stated once and that the history states no counts; the history repeats those
totals while asserting that it contains none, and the owner-facing section still
calls this the fourth review round. The author-reported C3 count-drift check also
passed this revision, so its green cannot clear the count class it is named for.

The physical split did not lose or rewrite the two moved sections. I compared
both extracted pre-split blocks byte for byte and obtained identical hashes. The
failure is semantic: putting the record in another file does not make it
incapable of contradicting the specification, and it already does.

Option B is not reopened. Its current source mapping still prevents a foreign
popup from carrying the requested class when implemented as proposed. SP-25 and
SP-26 concern the residual P4 guarantee and its diagnostic, not the owner-selected
identity mechanism.

## SP-20…SP-24 disposition

| Finding   | Disposition            | Follow-up result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SP-20** | **RESOLVED**           | Step 2 is now a one-sided class smoke census that needs only the two product class hooks. The helper and all three callers are built at step 3 before repaired leg 1 runs first among legs 1–9 (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1498-1519`). The REPAIRED variant still means the complete §4.4 helper (`:1372-1385`), so the dependency order is now executable.                                                                                                                                |
| **SP-21** | **PARTIALLY RESOLVED** | `selectOptionByText` snapshots both controls in the other half before the gesture, and `expectSelectShows` compares them afterwards (`:892-979`). That closes the prior counterexample when the foreign operation changes either value. It does not close the double-pre-satisfied case, where the wrong option click changes no value at all (SP-25), and the new failing assertion does not name a control (SP-26). M8b measured only value movement, so it cannot decide an operation that produces none. |
| **SP-22** | **REGRESSED**          | §7.5 says the figures occur once and the history states none (`:1621-1634`). The history states the current totals at `docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md:6-8`, repeats them at `:148-152`, then claims at `:161` that it states no counts. The live owner section also still says this is the fourth review round (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:167-170`) while §7.5 says five are complete and a sixth is owed. The split has reproduced the same class across two files.   |
| **SP-23** | **RESOLVED**           | The weak-claim entry now distinguishes a still-closed Select, which receives a second gesture, from an already-open Select whose popup resolution alone expired, which receives no gesture. The latter is explicitly UNMEASURED (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1872-1881`). This matches the `isOpen` gate at `:873-886`.                                                                                                                                                                      |
| **SP-24** | **RESOLVED**           | The background CSS is now described as a second surface consistent with the general leave-remnant mechanism, not an incident or second M5 measurement. The plan expressly limits M5 to the three recorded spacing runs (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:396-408`), matching what `src/index.css:26-40` actually establishes.                                                                                                                                                                     |

## Confidence and method

**Confidence: high on SP-20, SP-22, SP-25 and SP-26; high on the split's
byte-exactness; high on the textual SP-23/SP-24 repairs; medium on M8's runtime
record because I did not repeat it.**

The pinned-tree gate passed before review: branch
`feature/spacing-helper-preset-plan`, head
`e65bb461d181ed364afa0c099a01e6891c45cb85`, `main` =
`08a9544643ef01aed843fa9babf1892291ed3e7f`, clean worktree, and every branch
change under `docs/`. `HEAD` and
`origin/feature/spacing-helper-preset-plan` also agreed before I created this
review.

I read the commission first, revision 6 in full, reviews 4, 3, 2 and 1 in the
commissioned order, then round 5 and every named source range. I also read the
installed rc-select path needed to decide whether clicking an already-selected
option remains an operation: its option is clickable and closes the single-mode
popup (`node_modules/@rc-component/select/lib/OptionList.js:161-170,371-374`),
while `onChange` is emitted only if the value changes
(`node_modules/@rc-component/select/lib/Select.js:314-333`).

### Direct split audit

The pre-split revision-5 headings begin at lines 1760 and 1875. I compared:

- revision-5 lines 1760–1874 with history lines 25–139; both hash to
  `0aa3774974bfdaec85561af4c0bf8c403b3af8e022e58a8316fd1318b73333ea`;
- revision-5 lines 1875–2152 with history lines 165–442; both hash to
  `dc1e99b618c50f34ac9ba439d6666c72a35c50c4aec1fdc2e34820366f13c29f`.

Regenerate those comparisons:

```bash
sha256sum <(git show c707cd8b:docs/testing/SPACING_HELPER_PRESET_PLAN.md | sed -n '1760,1874p') <(sed -n '25,139p' docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md)
sha256sum <(git show c707cd8b:docs/testing/SPACING_HELPER_PRESET_PLAN.md | sed -n '1875,$p') <(sed -n '165,$p' docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md)
```

The new round-5 record occupies history lines 140–163. The current plan replaces
the old sections with a link at `docs/testing/SPACING_HELPER_PRESET_PLAN.md:1899-1908`.
The 34 non-history lines removed from the live plan are all direct revision-6
replacements: one header line; eight SP-24 lines; nine P4 signature/caller lines;
five sequencing lines; six count/cost lines; and five SP-23 lines. I found no
unaccounted semantic deletion.

The commissioned independent revision-4-to-5 audit also reproduces the prior
result. A zero-context diff yields 19 deletion blocks and 52 removed lines:

```text
7; 11-13; 125-126; 340-343; 618; 638-642; 712-717; 726; 731;
736; 740; 883-885; 889; 1023-1024; 1058-1060; 1114-1124;
1225-1227; 1311; 1512-1513
```

Each has the replacement, narrowing, relocation or deliberate reformat recorded
in the round-5 review. No load-bearing revision-4 line disappeared silently.

Regenerating commands for the finite populations:

```bash
git diff --unified=0 6f839ec c707cd8b -- docs/testing/SPACING_HELPER_PRESET_PLAN.md
rg -l '\bspacing\.(setCardMargin|setCardPadding|setMarginMode|setPaddingMode|setMarginSide|setPaddingSide|expectCardMarginApplied|expectCardPaddingApplied|expectSpacingScreenshot)\b' tests src tools | sort
rg -n '\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*[^;\n]*\.spacing\b|\{[^}\n]*\bspacing\s*:' tests src tools
rg -n 'renderSection\(' src/components/SpacingControls.tsx
rg -n '<SpacingControls\b|SpacingControls\(' src tests tools
rg -n 'spacing-margin-mode-popup|spacing-margin-preset-popup|spacing-padding-mode-popup|spacing-padding-preset-popup' src tests tools
rg -n 'review rounds?|rounds? complete|findings?|fourth|sixth|twenty-four|seventeen|eighteen' docs/testing/SPACING_HELPER_PRESET_PLAN.md docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md
```

The direct spacing population remains two spec files; no assigned or destructured
alias was found; `renderSection` is called twice; `SpacingControls` has one product
consumer; and the four proposed popup class tokens have no current collision.
The manifest regenerates as 7 expected failures, 10 expected flaky, and 21
expected skips, with the spacing identity absent.

## Evidence boundary

- I did **not** run Electron, recreate M8a/M8b, execute harness legs 0–12, run the
  e2e/unit/integration suites, or run CI. M8 remains author-recorded runtime
  evidence. Current product and rc-select source supports the deterministic
  state/control-flow parts of SP-25, but I did not reproduce its hostile class
  misattachment in the app.
- The consistency checker is deliberately absent from this docs-only branch. I
  could not inspect its parser, run C1–C5, or independently reproduce its
  revision-4/revision-5 known-bad results. I can only compare the claimed
  revision-6 pass with contradictions present in the reviewed files.
- The split audit proves byte identity for the two relocated sections and
  accounts for the live-plan deletion blocks. It does not prove that statements
  in separate files are mutually consistent; SP-22 demonstrates they are not.
- I did no live Home Assistant work and changed no plan, source, test, snapshot,
  manifest or CI file. This review adds only its own document.

## G2 — the split

**No moved content was lost, altered or orphaned.** Both historical sections are
byte-identical, the plan links to the history, and the history links back. I found
no dangling file link introduced by the move.

**The claimed consistency property is false.** The history says separation means
an edit to the record “can no longer contradict the specification”
(`docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md:6-14`). File boundaries do
not enforce that property. The same file immediately restates the live totals,
and its SP-22 row contradicts both those totals' presence and the plan's claim
that they occur once. SP-22 therefore regresses despite the mechanically sound
move.

The literal statement that every pre-split line “appears” exactly once is also
stronger than the performed operation: revision 6 deliberately replaces 34 live
lines, and repeated blank/separator lines cannot be uniquely assigned by text.
The defensible claim is that every pre-split line was **accounted for**, with the
two moved blocks preserved verbatim. That narrower claim passed my differently
keyed audit.

## G3 — the checker

C1 and C4 have valuable author-reported known-bad controls: revisions 4 and 5
should fail for SP-15 and SP-20. They are evidence for those two parser paths,
not for C2, C3 or C5. The checker is off branch, so none of its implementation or
negative controls is reviewable here.

C3's claimed revision-6 pass is already weaker than its name suggests. Current
count drift survives within the plan and between plan/history. If the reported
pass is accurate, C3 either does not enumerate the owner section and history or
does not compare their assertions. This is the same SP-22 class, not independent
clearance of it.

**A defect class none of C1–C5 catches:** executable event/control-flow semantics
that contradict a prose construction. SP-3 bound suppression to `click` while
rc-select opened on `mousedown`; SP-8 made that repaired suppression one-shot
while the helper retained two attempts. Those defects can have complete
definitions, dispositions, counts, sequencing and no resurrected phrase. The
five checks can all pass while the harness remains unbuildable. SP-25 is another
member of the broader semantic-oracle class: all named pieces are present and
ordered, but an idempotent transition defeats the detector.

## G4 — previously clean areas

- **§5.1/§5.1a:** PASS at the declared lexical boundary. Two direct spec
  consumers, two `renderSection` calls, one product consumer, and no current
  collision for the four proposed classes.
- **§5.2:** PASS. The sibling class remains behavioural-first and is not promoted
  to a shared diagnosis.
- **P1–P3:** PRESENT and unchanged. Identity is class-by-construction, lookup is
  scoped and singular, and the option uses an ordinary Playwright click.
- **Guard rails:** PASS in the proposed path. No global pre-wait, forced click,
  DOM `evaluate(...click())`, or `Escape` is restored.
- **Harness outside SP-20/SP-21:** no new textual defect found in legs 1–4 and
  6–12. Leg 5 is not clear because its “naming the control” oracle is contradicted
  by SP-26. The legs-2/3 Playwright-interceptor interaction and leg-8 construction
  remain explicitly unrun, not silently cleared.

## G5 — scope and over-reach

I found no redesign or owner-decision re-opening. SP-20 changes ordering only;
SP-23 and SP-24 narrow prose only; SP-22 performs the owner-ruled structural
split. SP-21 is the largest repair, but its widened private return type is
contained: the complete three-caller proposal captures the returned snapshot and
passes it to P4, and no external method can call the private helpers. It changes
no public signature.

The other-half boundary is proportionate. `handleModeChange` and
`handlePresetChange` write only the named `card_margin` or `card_padding` field
(`src/components/SpacingControls.tsx:75-104`), while same-half mode/preset
coupling makes an every-other-Select invariant invalid. The problem is not its
scope; it is claiming a value-delta guard proves which control received an
idempotent operation.

## G6 — the fifth interaction and the app-level claim

SP-25 is the fifth interaction: **the other-half snapshot and valid idempotent
Select behavior are each coherent, but together they make a wrong operation
indistinguishable from no operation when both halves are pre-satisfied.** M8a
supplies exactly that initial state; M8b exercised changes and therefore could
not expose it.

Revision 6's load-bearing app-behavior claim is M8b: a legitimate operation on
one half leaves the other half unchanged. The author records that it was run in
both directions in a temporary headless probe
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:567-586`). I did not repeat it.
Source supports the field-isolation mechanism, but the runtime result remains
author-recorded. The older option-B class placement in Electron is still unrun;
the repaired sequence correctly keeps a separate class smoke step for it.

## Claim ledger

| Load-bearing claim                                                                                    | Tag                                            | Evidence and result                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed tree matches the pinned branch/head/base and is clean/docs-only.                         | **MEASURED**                                   | Branch, head, base, status, log and diff regenerated; confirmed.                                                                                                              |
| Every revision-4 line removed by revision 5 is accounted for.                                         | **MEASURED**                                   | Direct zero-context audit reproduced 19 blocks / 52 lines; no silent loss.                                                                                                    |
| The two sections moved from revision 5 are unchanged.                                                 | **MEASURED**                                   | Two byte comparisons and SHA-256 pairs match exactly.                                                                                                                         |
| Separating history means it cannot contradict the specification.                                      | **MEASURED — CONTRADICTED**                    | The files disagree about whether history contains counts, and the live round counts disagree; SP-22.                                                                          |
| SP-20's sequence now builds the repaired helper before repaired leg 1.                                | **MEASURED**                                   | Plan `:1498-1519` against variant definition `:1372-1385`; resolved.                                                                                                          |
| The other-half snapshot catches a wrong-control mutation when the requested value is pre-satisfied.   | **INFERRED from code/source**                  | A changed other-half label makes the array differ. M8b is author-recorded, not repeated.                                                                                      |
| The other-half snapshot catches every wrong-control operation.                                        | **MEASURED-from-source — CONTRADICTED**        | An already-selected foreign option is clickable and closes, but changes no value; both P4 assertions pass; SP-25.                                                             |
| A new P4 failure is loud and names the implicated control.                                            | **MEASURED-from-plan — CONTRADICTED**          | The own-value assertion is named; the new other-half `expect.poll(...).toEqual(...)` has no message and returns only values; SP-26.                                           |
| SP-23 now states both retry branches and the evidence boundary.                                       | **MEASURED**                                   | Plan `:1872-1881` matches the `isOpen`-gated retry.                                                                                                                           |
| SP-24 limits the CSS comment to intent consistent with a general mechanism.                           | **MEASURED**                                   | Plan `:396-408` against `src/index.css:26-40`; resolved.                                                                                                                      |
| C1–C5 pass revision 6 and catch the named consistency classes.                                        | **INFERRED / PARTLY CONTRADICTED**             | Author-reported only; checker absent. C3's pass did not catch current count drift.                                                                                            |
| The direct spacing consumer population remains two files and the new class population collision-free. | **MEASURED with lexical boundary**             | Published searches reproduced; alias searches found no renamed caller.                                                                                                        |
| A legitimate operation never changes the other half.                                                  | **INFERRED from author runtime record/source** | M8b records both directions for presets; field-specific handlers support the mechanism. I did not run Electron, and modes were not separately runtime-measured in the record. |

**Weakest claims in this review:** SP-25 uses the plan's deliberately hostile
misattached-class state rather than a current source defect, and I did not run it
in Electron; M8's values and behavior remain author-recorded; the checker is
unavailable here, so its parser weakness is inferred from the claimed green
against contradictory output rather than inspected directly; and “exactly once”
has no literal raw-line meaning for repeated blank/separator lines, so my split
clearance is based on byte-exact section blocks plus deletion accounting.

## Findings

### SP-25 — SEV 1 — the other-half guard still passes a double-pre-satisfied wrong-control operation

**Three-part blocking proof.** (1) The broken claim is that any wrong target
becomes a loud DSL failure, P4 catches everything surviving P1–P3, and the new
other-half assertion closes SP-21's pre-satisfied hole
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:93-97`, `:450-492`, `:948-979`,
`:1026-1032`). (2) M8a records a fresh card with **both** mode Selects already
showing `All Sides` (`:567-579`), and the current passing test immediately calls
`setCardMargin(12)`, which routes through `setMarginMode('all')`
(`tests/e2e/spacing.spec.ts:20-28`; `tests/support/dsl/spacing.ts:137-140`). In the
plan's unique-but-misattached hostile state, put `.spacing-margin-mode-popup` on
the open Padding mode popup while suppressing the requested Margin open, then
call `setMarginMode('all')`. rc-select permits the click and closes a single-mode
popup, but emits no `onChange` when the selected value is unchanged
(`node_modules/@rc-component/select/lib/OptionList.js:161-170,371-374`;
`node_modules/@rc-component/select/lib/Select.js:314-333`). Margin still reads
`All Sides`; Padding still reads `All Sides`; Padding's preset is also unchanged.
Both assertions at plan `:968-979` pass after the helper operated the wrong
control. (3) No recorded mitigation exercises this state. M8b measures which
values move during a changing preset operation; a no-delta operation is outside
that property. Leg 5 uses a state where the foreign value changes, P1 is removed
or stipulated misattached in the hostile construction, and P2/P3 cannot identify
which control owned an option with the same label.

**Concrete fix.** Add a known-bad control in which requested and foreign values
are both pre-satisfied and prove the wired hostile path can detect the wrong
operation. If P4 remains value-based, narrow its guarantee to wrong-control
**mutation** and keep prevention assigned to P1; do not claim it proves an
idempotent operation's identity. If the stronger operation guarantee remains
mandatory, add an independent association/event oracle that can observe which
Select received the click. Keep option B, valid idempotent setters, the
other-half mutation guard, ordinary clicks and all three wired callers.

**Class swept.** I crossed all four valid requested controls (margin/padding ×
mode/preset) with the two state classes SP-21 created: requested pre-satisfied,
and requested plus foreign pre-satisfied. Mode provides a current first-action
instance (`All Sides`/`All Sides`); presets provide the same fresh-card instance
(`None (0px)`/`None (0px)`). A foreign value change is caught; a foreign no-op is
not. Same-half misattachment does not silently pass because mode and preset label
populations differ, so the option-count assertion fails first.

### SP-26 — SEV 1 — the new P4 failure is loud but does not name a control

**Three-part blocking proof.** (1) The cheapest acceptable outcome and desired
outcome require a wrong target to fail **loudly and by name**; P4's table row says
it names the control, and leg 5 requires that exact oracle
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:93-97`, `:450-492`, `:1387-1394`).
(2) When the requested value is pre-satisfied and a foreign value changes, the
first assertion at `:968-972` passes. The assertion that actually detects the
defect is the second one at `:974-979`: it supplies no custom message and polls an
array of nullable text values. Its failure can show an array-position/value diff,
but the value contains neither `testId`, neither sibling id, nor which control
moved. (3) No recorded mitigation supplies that identity. The call stack names
`expectSelectShows`, not the requested or changed Select; stable array ordering is
knowledge in the implementation rather than output in the failure; and leg 5
asserts that the control is named without requiring the exact message, unlike leg
6's explicit message-and-exit-code record.

**Concrete fix.** Poll a keyed record rather than a bare array and provide a
custom assertion message that includes the requested test id and both guarded
ids. Make leg 5 record the exact failure message and exit code, and require the
message to identify the changed control. Update §4.1's P4 row to include the
other-half invariant rather than describing only own-value read-back.

**Class swept.** I enumerated both assertions in `expectSelectShows`, all three
callers and every P1/P2/P4 diagnostic in the proposed helper. P1's count and
visibility failures name `testId`; P2's option-count failure names the pattern and
`testId`; P4's original own-value failure names `testId`. The new other-half
assertion is the sole proposed guard failure that carries only anonymous values.

## MemPalace drawer candidates

No drawer was written, as commissioned.

**Candidate — wing `havdm`, room `review`, `added_by="codex"`:**

> [REVIEW] The same-reviewer STRAT-D7 scoped follow-up 5 of
> `docs/testing/SPACING_HELPER_PRESET_PLAN.md` revision 6 at reviewed head
> `e65bb461d181ed364afa0c099a01e6891c45cb85` returned SEV-1-BLOCKED. SP-20,
> SP-23 and SP-24 are resolved; SP-21 is partially resolved; SP-22 regressed.
> Both moved history sections are byte-identical and the older 52-line deletion
> audit reproduced, but the history repeats the live counts while claiming it
> states none, and the owner section still says fourth round. SP-25: when both
> requested and foreign controls already show the selected value, a
> unique-but-misattached wrong-control click changes no value and passes both P4
> assertions. SP-26: when the other-half guard does catch a mutation, its bare
> array comparison names neither control, contradicting the mandatory diagnostic
> and leg 5. The off-branch checker was not inspectable; its claimed C3 pass did
> not clear current count drift. No app, probe, suite or CI run was performed.
> Review artifact:
> `docs/reviews/spacing-helper-preset-plan-codex-followup5-review.md`.

**Candidate — wing `practice`, room `verification`, `added_by="codex"`:**

> A value-delta guard cannot prove operation identity when the wrong target is
> already in the requested state. Cross the pre-satisfied case with a
> pre-satisfied foreign target, and separately verify that the failing oracle
> emits the identities it claims to name; detection and diagnostics are distinct
> properties.
