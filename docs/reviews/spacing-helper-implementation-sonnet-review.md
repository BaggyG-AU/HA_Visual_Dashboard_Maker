# Independent implementation review — spacing DSL Select-targeting repair

Author: Claude Sonnet 5
Reviewer: OpenAI Codex (GPT-5.6 Sol) — §3.6 watch cross-check
Owner gate: micah / BaggyG-AU
**Commissioned by:** owner · **Scope:** `feature/spacing-helper-preset-plan` at
`1aa8b5f5c60b6bc7a87693841d0e95c970e3f75b` (base `main` at
`08a9544643ef01aed843fa9babf1892291ed3e7f`), PR #155 — the ONE FULL INDEPENDENT
REVIEW BEFORE MERGE required by
[`docs/governance/OPERATING_AGREEMENT.md`](../governance/OPERATING_AGREEMENT.md)
§3 class (d).

**The owner's profile (standing line — STRAT-D15 / strategy correction C6):** the
owner gate is held by a **non-developer** — write for the reader who actually
rules. Anything routed to the owner uses the **Owner Decision Brief**: what this
protects in product terms / what is going wrong plainly / is the product affected
Yes-No-Unknown with honest evidence status / options with costs / recommendation
and why / what happens if you do nothing. Never require the owner to classify a
diff or apply developer instinct.

**Reviewer write-restrictions (acknowledged):** no `[STATE]` drawer update; no UAT
card marked or re-scored; no `src/` change; no merge; `ha.home.local` read-only.
Proposed changes go in this document, nowhere else.

**Where this review's MemPalace notes went (ruling MP-LEASE).** `mempalace_status`
returned live at the start of this review and a write test succeeded (the palace
writer lease was free — no author session held it concurrently), so this review's
`[INVESTIGATION]`/`[DECISION]` drawers are filed directly to the `havdm` wing under
`added_by="claude-sonnet"`, not routed through a candidates section. §11 below
records the drawer IDs.

**Execution rules — EVERYTHING HEADLESS, including any probe of my own.** Every
suite and every ad-hoc probe in this review ran via `bash tools/test-headless.sh`
(Xvfb, `env -u WAYLAND_DISPLAY`) or was declared UNRUN. No Electron window was
launched headed at any point in this review.

---

## 1. Verdict first

**No SEV-1 finding. The implementation matches §10's binding contract clause by
clause, and every "MEASURED" citation I independently re-derived against the
installed library source (antd 6.1.4, `@rc-component/select`, `@rc-component/trigger`,
Playwright 1.57.0) held up exactly as claimed.** Two SEV-2 findings, both about the
**acceptance-evidence surface** rather than the fix's correctness: (F1) the one
HALT-bearing precondition in §10 — the four-control Electron class smoke — has no
record anywhere in the reviewed evidence document, only in a commit message from
the disqualified author; (F2) leg 1b's own description overstates how closely it
mirrors the real failing spec — I measured, with my own headless probe, that the
literal DSL-mediated call sequence (which includes a settling wait leg 1b omits)
does **not** reproduce the two-popup overlap in a clean run. Neither finding casts
doubt on the repair itself: P1's class-based identity defends unconditionally
regardless of how the overlap arises, and legs 2 and 7 — which do not depend on
the disputed naturalism claim — independently carry the FAIL-OLD/PASS-NEW
acceptance burden on their own. One SEV-3 labelling nit (F3). Recommend: **approve
for merge**, with F1/F2 as cheap, non-blocking evidence-hygiene fixes the owner can
take or leave.

---

## 2. Confidence and method

**Documents read in full:** the commission
(`docs/reviews/spacing-helper-implementation-sonnet-commission.md`),
`docs/testing/SPACING_HELPER_PRESET_PLAN.md` (all of §0–§10),
`docs/testing/SPACING_HELPER_HARNESS_RESULTS.md`,
`docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md` (all nine round records),
`docs/templates/ADVERSARIAL_REVIEW.md`,
`docs/governance/OPERATING_AGREEMENT.md` §§1–3.7, and the live PR #155 body (191
lines, fetched via `gh pr view 155 --json body`, not a local copy).

**Source read at path\:line, not taken on the plan's word:**
`src/components/SpacingControls.tsx` (full file), `tests/support/dsl/spacing.ts`
(full file, HEAD and `main`), `node_modules/antd/es/select/index.js` and
`index.d.ts`, `node_modules/@rc-component/select/es/{Select,OptionList,SelectTrigger}.js`,
`node_modules/@rc-component/trigger/es/{index,Popup/index,UniqueProvider/index}.js`,
`node_modules/playwright-core/lib/server/{dom,progress}.js`, `playwright.config.ts`,
`src/index.css`, `package-lock.json` / `node_modules/antd/package.json` for the
resolved antd version.

**Commands run (all headless via `tools/test-headless.sh` where Electron was
involved; none launched headed):**

- `git fetch origin && git checkout feature/spacing-helper-preset-plan` — head
  verified `1aa8b5f5c60b6bc7a87693841d0e95c970e3f75b`, `git status --porcelain`
  empty, both before and after every run below.
- `git diff --name-only main..HEAD` and the same piped through
  `grep -vE '^docs/.*\.md$'` — regenerated the file list myself rather than
  trusting the commission or the PR body; confirmed exactly two implementation
  files.
- `./tools/checks > checks.log 2>&1; echo REAL_EXIT=$?` (detached, polled
  separately) — **REAL_EXIT=0**, 4/4 steps
  (`grep -cE "^> (eslint|prettier --check|tsc --noEmit|vitest run)"` → 4), lint
  **0 errors / 145 warnings**, unit **1413 passed / 104 files** — reproducing the
  PR body's and commit `82c0e49`'s claimed gate figures exactly, independently.
- `bash tools/test-headless.sh tests/e2e/spacing.spec.ts tests/e2e/spacing.visual.spec.ts --project=electron-e2e --workers=1 --retries=0`
  — **the single load-bearing spec pair, §3.5 item 1** — 7/7 passed including
  `applies spacing presets`, no snapshot moved (`git status --porcelain` empty
  after).
- `bash tools/test-headless.sh tests/e2e/spacing.spec.ts --project=electron-e2e --workers=1 --retries=0 --repeat-each=8 --grep "applies spacing presets"`
  — **a deeper repeat than the author published, §3.5 item 2** (author published
  `--repeat-each=5`; I ran 8) — **8/8 passed**, each on its first attempt.
- `bash tools/check-pr-evidence.sh 155` — the repository's own advisory grep over
  the live PR body and every changed `.md`/`.sh` file; 31 textual candidates, none
  of which is itself a defect (the script decides nothing but commit-SHA
  presence, of which the PR body has none). I spot-verified the load-bearing
  candidates by hand (§9 below) rather than dispositioning all 31; the rest are
  noted as an evidence boundary, not silently dropped.
- **My own headless probe** (§4, F2): an untracked, self-cleaning
  `tests/e2e/_review_probe.spec.ts` driving the exact `spacing.spec.ts`
  `applies spacing presets` call sequence through the literal `main` (CURRENT)
  helper's click/close mechanics with a page-side rAF sampler, run once via
  `tools/test-headless.sh`, then deleted. Verified afterwards: `git status
--porcelain` empty, and `sha256sum` of both changed files identical to
  `git show HEAD:` for each (matching the discipline the author's own harness
  used).
- Static verification of the popup-class collision question (Q7): grepped
  `src/`, `src/index.css` and `node_modules/antd`/`@rc-component/*` source for
  every mechanism that could make one Select's class land on another popup, and
  confirmed antd's Select never passes the `unique` prop that would engage
  `@rc-component/trigger`'s shared-portal path.

**Constraints — what this review did NOT establish.**

- **UNVERIFIABLE: the SCOPE-ONLY and P4-ONLY variant source.** Per the owner's
  narrow harness exception, the author's variant helpers were untracked and
  deleted after use; I have only the results document's prose description of the
  string substitutions (§1 of that document), not the code. I could not
  independently confirm "nothing else was removed with it" (Q3's harder half) by
  reading a diff — only by checking that the _described_ substitutions are
  internally consistent with §10's own definitions, which they are (see §9, Q3).
  This is the same evidence boundary the plan's own harness-exception ruling
  already accepts as the cost of not leaving temporary weakening code on a
  shipped branch; I am not proposing to change that ruling.
- **legs 0, 1, 2, 3, 5, 5b, 5c, 6, 8, 9 were not re-run by me** — they depend on
  the same deleted variant/suppression harness. I evaluated them from the
  documented evidence (§9 below applies rule 1 of the commission's §5 — "if this
  claim were false, would what was run have failed?" — to each) plus one targeted
  probe of my own for the leg 1/1b naturalism question (F2), not by re-executing
  the originals.
- **My own probe is a single run (n=1).** It shows the literal call sequence did
  not overlap _this once_; it does not establish a population claim about every
  run, and I say so explicitly in F2 rather than asserting a universal.
- **No live-HA testing** — not applicable; this change touches no HA
  integration surface.
- **Dev build only**, via the standard Playwright/Electron harness — not the
  packaged production binary.

---

## 3. Claim ledger

| #   | Claim                                                                                                                                                                                                                                                                                                                                                                                                                                       | Tag                                       | Evidence                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1  | The implementation touches exactly two non-doc files.                                                                                                                                                                                                                                                                                                                                                                                       | MEASURED                                  | `git diff --name-only main..HEAD \| grep -vE '^docs/.*\.md$'` → `src/components/SpacingControls.tsx`, `tests/support/dsl/spacing.ts`.                                                                                                                                                                                    |
| C2  | The `src/` change is exactly two added lines, additive only, no behaviour/markup-structure change.                                                                                                                                                                                                                                                                                                                                          | MEASURED                                  | `git diff main..HEAD -- src/components/SpacingControls.tsx`: two `+classNames={{ popup: { root: ... } }}` lines only.                                                                                                                                                                                                    |
| C3  | The shipped helper (`tests/support/dsl/spacing.ts`) implements P1–P4 exactly as specified in plan §4.4, comment provenance trimmed but logic unchanged.                                                                                                                                                                                                                                                                                     | MEASURED                                  | Line-by-line diff of plan §4.4's code block against `tests/support/dsl/spacing.ts:25–284`; every method (`popupFor`, `isOpen`, `resolveOwnedDropdown`, `openSelectDropdown`, `selectOptionByText`, `otherHalf`, `snapshotOtherHalf`, `expectSelectShows`, the three callers) is structurally identical.                  |
| C4  | `main`'s (pre-repair) helper exhibits D1 (document-wide popup lookup), D2 (document-wide, unscoped option search) and D3 (`evaluate(...click())` plus `force:true` fallback) exactly as the plan characterises.                                                                                                                                                                                                                             | MEASURED                                  | `git show main:tests/support/dsl/spacing.ts:25-49`.                                                                                                                                                                                                                                                                      |
| C5  | antd resolves to **6.1.4** in this repository, and `classNames.popup.root` is the current (non-deprecated) API for that version; `popupClassName`/`dropdownClassName` are marked `@deprecated` in favour of it.                                                                                                                                                                                                                             | MEASURED                                  | `package-lock.json` / `node_modules/antd/package.json` → `"version": "6.1.4"`; `node_modules/antd/es/select/index.d.ts:56-58`.                                                                                                                                                                                           |
| C6  | The injected class lands on the `.ant-select-dropdown` **root** DOM node itself, not a wrapper — M7's claim, corroborated in the compiled library source, not just measured behaviourally.                                                                                                                                                                                                                                                  | MEASURED                                  | `node_modules/antd/es/select/index.js:171,242` (→ `popupClassName`) → `@rc-component/select/es/SelectTrigger.js:79,129` (`popupPrefixCls = ant-select-dropdown`) → `@rc-component/trigger/es/index.js:494` → `.../Popup/index.js:156` (`clsx(prefixCls, motionClassName, className, ...)`, the actual root `className`). |
| C7  | No other component or stylesheet in `src/` selects on `.ant-select-dropdown` by class, and none of the four new class names (`spacing-{margin,padding}-{mode,preset}-popup`) collides with anything else in the codebase.                                                                                                                                                                                                                   | MEASURED                                  | `grep -rn "ant-select-dropdown" src/` → no hits; `grep -rn "spacing-.*-popup" src/` → no hits outside the two changed lines; `src/index.css:26-40` only selects `bg-*-dropdown` (BackgroundCustomizer's five classes, unrelated).                                                                                        |
| C8  | antd's `Select` never engages `@rc-component/trigger`'s shared/"unique" popup-portal optimisation, so there is no library-level mechanism by which one Select's popup DOM node could be reused for another's, carrying a stale class.                                                                                                                                                                                                       | MEASURED                                  | `grep -rn "unique" node_modules/antd/es/select node_modules/@rc-component/select/{es,lib}` → no hits; the `unique` prop `@rc-component/trigger/es/index.js:70,187` is only ever engaged if a caller passes it, which antd's `Select` does not.                                                                           |
| C9  | rc-select fires `onChange` only when the value actually changes, and clicking an already-selected option still closes a single-mode Select — the exact mechanism behind M9b/SP-25 ("P1 stands alone in the double-pre-satisfied state").                                                                                                                                                                                                    | MEASURED                                  | `@rc-component/select/es/Select.js:307-327` (`triggerChange`, "Trigger event only when value changed"); `@rc-component/select/es/OptionList.js:153-164` (`onSelectValue` always calls `toggleOpen(false)` in single mode, `onSelect` is still invoked regardless of whether the value changed).                          |
| C10 | Playwright installs a real hit-target interceptor for non-`force` clicks (retried/blocked on mismatch), and passing a `0` timeout to Playwright's internal progress tracker installs **no** deadline at all (not immediate expiry) — the two library-behaviour claims the plan's comments cite by path\:line.                                                                                                                               | MEASURED                                  | `node_modules/playwright-core/lib/server/dom.js:360-401` (hit-target interceptor, retried); `node_modules/playwright-core/lib/server/progress.js:66-74` (`if (timeout) { ... }` — no timer installed otherwise). Playwright version confirmed **1.57.0** (`node_modules/playwright/package.json`).                       |
| C11 | `playwright.config.ts`'s `actionTimeout` is 30 000 ms, matching the comment in `snapshotOtherHalf` explaining why an un-timed `textContent()` call would silently borrow that fallback instead of the intended 5000 ms budget (SP-32).                                                                                                                                                                                                      | MEASURED                                  | `playwright.config.ts:53`.                                                                                                                                                                                                                                                                                               |
| C12 | The shipped `resolveOwnedDropdown`/`snapshotOtherHalf` budget guards (`budgetFor`, `remainingFor`) always throw before returning a non-positive remainder, so the SP-16/SP-32 "zero-timeout-means-no-deadline" hazard cannot reach Playwright in the shipped code.                                                                                                                                                                          | MEASURED                                  | `tests/support/dsl/spacing.ts:52-61,162-170` — both guard functions `throw` on `remaining <= 0` and only ever return a positive value.                                                                                                                                                                                   |
| C13 | `snapshotOtherHalf` reads values via bare `getByTestId(id)` with no `.first()`, so a duplicated `data-testid` fails the whole capture loudly (strict-mode violation) rather than silently degrading — the fail-closed design SP-29/leg 5c(ii) claims.                                                                                                                                                                                       | MEASURED                                  | `tests/support/dsl/spacing.ts:172-186` — no `.first()`/`.or()` anywhere in the loop, unlike `getInputNumberInput` (`:224-232`), which deliberately does use them.                                                                                                                                                        |
| C14 | The four gate figures in the PR body and in commit `82c0e49`'s message (`REAL_EXIT=0`, 4/4 steps, 0 errors/145 warnings, 1413 passed/104 files) reproduce exactly on a fresh, independent run at the same head.                                                                                                                                                                                                                             | MEASURED                                  | This review's own `./tools/checks` run (§2 above).                                                                                                                                                                                                                                                                       |
| C15 | The PR body's blast-radius claims — diff stat (199 insertions/38 deletions over the two files), the caller-population enumeration (three disjoint-key `grep`s), "only one commit touches non-Markdown" — all reproduce exactly.                                                                                                                                                                                                             | MEASURED                                  | This review's own re-run of the PR body's own published commands (§9, Q9).                                                                                                                                                                                                                                               |
| C16 | Leg 1b's own claim ("the Margin preset driven first, exactly as `spacing.spec.ts` › `applies spacing presets` does") is true of the **control order** but the leg's construction **omits** the settling wait (`waitForAllSelectDropdownsToClose`) the real spec's helper performs between the two DSL calls — and, so omitted, in a single run the literal DSL-mediated sequence never produced more than one simultaneously-visible popup. | MEASURED (my own probe, n=1)              | `docs/testing/SPACING_HELPER_HARNESS_RESULTS.md:211-218`; `tests/e2e/spacing.spec.ts:109,112`; `main`'s `waitForAllSelectDropdownsToClose` (`git show main:tests/support/dsl/spacing.ts:27-30`); my probe: `settleMs=1491 maxVisiblePopups=1 samples=85 margin="Relaxed (16px)" padding="Normal (8px)"`.                 |
| C17 | Condition 2's class-smoke check (§10, HALT-bearing) has no record in `SPACING_HELPER_HARNESS_RESULTS.md`; its only record is prose in commit `82c0e49`'s message, authored by the disqualified author.                                                                                                                                                                                                                                      | MEASURED                                  | Full read of `SPACING_HELPER_HARNESS_RESULTS.md` (no class-smoke leg; leg 0/CENSUS is a different, non-opening check); `git show -s 82c0e49` message body.                                                                                                                                                               |
| C18 | The SCOPE-ONLY/P4-ONLY variant _descriptions_ in the results document (§1's table) are internally consistent with §10's own definitions of those variants — on the reading that "the class-identity check removed" describes the `toHaveCount(1)` assertion's changed _meaning_ (class-identity → document-global singleton) rather than its deletion as a line of code.                                                                    | JUDGEMENT (I cannot see the deleted code) | `docs/testing/SPACING_HELPER_PRESET_PLAN.md:585-589` vs `docs/testing/SPACING_HELPER_HARNESS_RESULTS.md:38-50`.                                                                                                                                                                                                          |
| C19 | The owner's "PASS on the guard reading" disposition of leg 3 (§4 of the results doc) is a defensible reading of what was actually measured (SCOPE-ONLY's guard did not refuse pre-emptively; REPAIRED's did, with zero option clicks), even though §10's "must silently succeed" and "retain wired P4" clauses are in genuine tension.                                                                                                      | JUDGEMENT                                 | `docs/testing/SPACING_HELPER_HARNESS_RESULTS.md:229-247`; plan §10 (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:585-586,617-628`).                                                                                                                                                                                       |

**Weakest claims, handed to the cross-checker unweakened:**

- **C16/F2 rests on a single probe run of my own.** I did not repeat it, and I did
  not attempt to reconstruct _why_ CI's seven recorded sightings occur if not via
  this route — I only showed that the one route leg 1b's description invites a
  reader to assume (the literal DSL call order) did not produce the overlap this
  once. A second run could show intermittent overlap even through the settling
  wait; I would not be surprised either way, and the practice rule against
  unverified universals applies to my own claim here as much as to the author's.
- **C18 is a reading, not a verification.** I could not see the deleted
  SCOPE-ONLY/P4-ONLY code. If the actual string substitution removed something
  beyond what I infer from the prose, I would not have caught it — this is
  exactly the "harder question" Q3 asks and I am reporting an evidence boundary,
  not a clean bill of health.
- **F1's severity rests on my own static argument that the class-smoke claim is
  probably true (C7, C8), not on having independently re-run it in the Electron
  renderer.** I am confident in the _source-level_ argument; I did not open the
  real app and inspect four live popup classes myself, because doing so would
  not change the actual finding (that the acceptance-evidence document doesn't
  carry this record) — but a cross-checker who _does_ run that smoke test and
  finds a collision would overturn my "no functional risk" read of F1, not the
  finding itself.
- **I did not sweep all 31 `check-pr-evidence.sh` candidates by hand** — I
  spot-verified the ones that looked load-bearing (gate figures, blast radius,
  single-commit claim) and treated the rest as an evidence boundary. A
  cross-checker with more budget could find something in the remainder I did
  not.

---

## 4. Findings (ranked, most severe first)

### F1 — SEV 2. Condition 2's HALT-bearing class-smoke check has no record in the acceptance-evidence document

**Evidence:** `docs/testing/SPACING_HELPER_PRESET_PLAN.md:620-625` (§10 condition
2 — "Add ONLY the two option-B class hooks first, then run the four-control
Electron class smoke headlessly... Any missing, duplicate, shared or swapped
mapping HALTS the work... It is not characterisation."); the entire file
`docs/testing/SPACING_HELPER_HARNESS_RESULTS.md` contains no leg or section
recording this measurement (leg 0/CENSUS, at `:71`, is a _different_ check — it
observes the pre-satisfied DOM state without opening any Select, so it cannot
report per-Select popup-class assignment). The only place this HALT-bearing
precondition is claimed satisfied is commit `82c0e49`'s message: "CONDITION 2
SATISFIED... Measured in the real renderer: each of the four
`.<testid>-popup` classes matched EXACTLY ONE popup, no popup carried another
Select's class, 4 popup nodes in the DOM." That commit's author is Claude Opus 5
— the same model disqualified from this review seat for having authored the
plan, and whose claims are exactly the ones this review exists to check
independently.

**Problem:** the one condition in §10 explicitly marked "not characterisation" —
i.e., load-bearing enough to halt the whole implementation if it failed — is
attested nowhere in the document titled to hold acceptance evidence
(`SPACING_HELPER_HARNESS_RESULTS.md`), only in commit prose from the plan's own
author. This is exactly the failure mode Q2 asks about: a claim that reads as
settled because it appears in confident, specific prose, without a corresponding
entry in the evidence surface that's actually been reviewed.

**Is the product affected?** I checked independently and found no reason to
doubt the underlying claim (C7, C8 above): the four class-name strings are
syntactically guaranteed distinct by construction (two literal `testIdPrefix`
values × two literal suffixes), nothing else in the codebase selects on them, and
antd's `Select` never engages the one library mechanism
(`@rc-component/trigger`'s `unique` shared-portal path) that could make one
popup's class bleed onto another. So this reads as a paperwork gap, not a
functional risk — but that conclusion is _mine_, reached by reading library
source, not something the acceptance-evidence document itself supports.

**Concrete fix:** add a short section (or an additional numbered leg) to
`SPACING_HELPER_HARNESS_RESULTS.md` recording the class-smoke measurement with
the same rigor as legs 0–9: what was checked, in what starting state, and the
result, quoting the four class names and their observed uniqueness. This can be
done by re-running the same headless class-smoke check the commit message
describes and writing down what comes back — a few minutes' work.

**What must NOT change:** the two-line `src/` change itself; nothing here
suggests re-doing the class mechanism, only documenting the one check that
already validated it.

**Class swept:** all five "accepted conditions" in §10. Conditions 1
(scope/S1), 3 (helper + callers + SP-32's bounded read), 4 (legs 1–9 + gates) and
5 (no snapshot/manifest/tabs/popup/BackgroundCustomizer changes) all have direct
evidence in reviewed, committed documents or in my own re-runs. Only condition 2
has its evidence exclusively outside any committed, reviewed artifact.

---

### F2 — SEV 2. Leg 1b's "mirrors the real failing spec" claim overstates what it actually reproduces

**Evidence:** `docs/testing/SPACING_HELPER_HARNESS_RESULTS.md:211-218` — "Leg 1b
is the same §10 construction with that state established rather than hoped for:
both popups pre-mounted in the order the real failing spec produces — the Margin
preset driven first, exactly as `tests/e2e/spacing.spec.ts` › `applies spacing
presets` does." `tests/e2e/spacing.spec.ts:109,112` shows the real spec's exact
two calls: `spacing.setCardMargin('relaxed')` then, after an assertion,
`spacing.setCardPadding('normal')`. Both calls, under the pre-repair (`main`)
helper, complete via `waitForAllSelectDropdownsToClose()` (`git show
main:tests/support/dsl/spacing.ts:27-30`) — an explicit wait for **zero**
visible popups — before the DSL call returns control to the spec. Leg 1's own
§10 construction (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:590-592`) is
explicit that it omits exactly this: "open Margin preset, wait for its popup,
invoke Padding preset immediately **with no settling wait**." Leg 1b inherits
that same omission — it "pre-mounts" both popups directly rather than driving
them through the real helper's own call sequence.

I tested this directly with my own headless, untracked, self-cleaning probe
(deleted after use, tree verified clean and byte-identical to `HEAD` afterwards):
drove the identical real-spec sequence — click Margin preset, select "Relaxed",
Escape, wait for zero visible popups (**1491 ms** to resolve), then immediately
click Padding preset, select "Normal" — while continuously sampling visible
`.ant-select-dropdown` nodes at animation-frame rate (85 samples over the run).
**Result: `maxVisiblePopups=1`, never 2**, and both controls ended up with the
correct values (`margin="Relaxed (16px)"`, `padding="Normal (8px)"`). In this one
run, the literal DSL-mediated call path — including the settling wait leg 1b
omits — did not produce the two-popup overlap leg 1b is built to demonstrate.

**Problem:** a reader of the results document (the owner, or a future engineer)
could reasonably take "exactly as `applies spacing presets` does" to mean leg 1b
shows _how the real spec fails in CI_. What I measured suggests it does not: the
real spec's own settling wait appears to close the window leg 1b manufactures by
skipping it. This sharpens — rather than contradicts — the results document's own
disclosed weakest claim ("Legs 2, 3, 5 and 5b reach their state by suppressing
the requested Select's own opening... it does not show how CI reaches it",
`SPACING_HELPER_HARNESS_RESULTS.md:277-280`): that sentence names legs 2/3/5/5b
for a _suppression_-based gap but does not name leg 1b for this _settling-wait_
-based one, even though leg 1b shares the same underlying property — a
harness-chosen condition that the literal, unmodified call path does not appear
to reach.

**Does this affect the repair's correctness?** No. P1 (class-based identity)
refuses a foreign popup unconditionally, regardless of what mechanism produces
the overlap — it does not need to know _how_ CI reaches a two-popup state to
defend against one. And the acceptance claim does not rest on leg 1b alone: leg 2
(explicitly synthetic/suppression-based, already disclosed as such) and leg 7 (a
genuinely different, non-synthetic scenario — a real, stably-open unrelated
Select) both independently satisfy rule 1 of the commission's §5 ("if the repair
were not what fixed this, would this leg have failed?") without depending on the
disputed naturalism claim.

**Concrete fix:** narrow leg 1b's sentence in
`SPACING_HELPER_HARNESS_RESULTS.md` to state plainly what matches and what
doesn't — e.g. "mirrors the _control order_ of the real failing spec; the
overlap itself is manufactured by omitting the settling wait the DSL's own call
sequence performs between calls. How CI's seven recorded sightings reach a
two-popup state remains unestablished, as is already disclosed for legs 2/3/5/5b
for a different reason." This is a documentation change to the results file, not
a change to the plan (the plan-review track is closed and I am not proposing to
revise it).

**What must NOT change:** leg 1b's value as a clean CURRENT-vs-REPAIRED A/B
comparison _once an overlap exists_ stands on its own and should not be deleted;
legs 2 and 7 need no change.

**Class swept:** I applied rule 1 ("if this claim were false, would what ran have
failed?") to every leg the plan's §6 table credits under FAIL-OLD/PASS-NEW or
GUARD-REMOVAL kinds (1, 1b, 2, 3, 4, 5, 7) — the population the acceptance claim
draws from. Only leg 1b carries this specific naturalism gap: leg 1's own
non-reproduction is already disclosed by name; legs 2/3/5 are already disclosed
as suppression-based; leg 4 never differentiates at all (see F3); leg 7 is a
distinct, non-synthetic scenario that does not depend on this question.

---

### F3 — SEV 3. Leg 4 is labelled FAIL-OLD/PASS-NEW but never differentiates CURRENT from REPAIRED

**Evidence:** plan §6's kind table
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:463`) lists leg 4 under
FAIL-OLD/PASS-NEW ("The defect is real AND the repair removes it. Runs on both
variants."). The measured result
(`docs/testing/SPACING_HELPER_HARNESS_RESULTS.md:79-80`) is PASS for **both**
CURRENT (2731 ms) and REPAIRED (2390 ms) on a clean panel — CURRENT never fails,
so this leg never demonstrates "the defect is real." The results document's own
summary sentence at `:220-221` — "The FAIL-OLD/PASS-NEW claim rests on leg 1b,
leg 2 and leg 7 — not on leg 1" — correctly excludes leg 1 by name for its known
non-reproduction, but does not mention leg 4, leaving its non-differentiation to
be inferred from the raw table rather than stated.

**Problem:** a reader scanning the plan's kind labels alone would credit leg 4 as
one of the legs proving the repair fixes a real defect; it doesn't — it only
shows the happy path is undisturbed, which is a regression-sanity property, not a
FAIL-OLD/PASS-NEW one.

**Concrete fix:** add leg 4 to the results document's exclusion sentence
alongside leg 1 ("rests on leg 1b, leg 2 and leg 7 — not on leg 1 or leg 4"), or
relabel leg 4 as a regression-sanity check rather than FAIL-OLD/PASS-NEW if the
plan is ever revised for an unrelated reason (the plan-review track itself is
closed; I am not asking for it to be reopened for this alone).

**What must NOT change:** leg 4's actual result (PASS/PASS) is fine as
regression evidence and needs no re-run.

**Class swept:** all rows under the FAIL-OLD/PASS-NEW kind (1, 2, 4, 7) checked
against their own measured results; only leg 4 fails to differentiate.

---

**No issue found (stated explicitly, per practice rule 8):**

- **Q1 — clause-by-clause match against §10.** No unimplemented, partially
  implemented, or differently implemented clause found, across all five
  "accepted conditions" and every named construction detail (leg 1, legs 2/3,
  leg 5, leg 8, leg 9, isolation, halts). See C3, C4 and §9 below.
- **Q7 — product safety of the two added lines.** No CSS/JS collision, no
  shared-portal risk, correct (non-deprecated) API for the resolved antd
  version. See C5–C8.
- **Q8 — P4's narrowed promise, swept by role.** Every occurrence of a sentence
  describing what P4/the outcome-detector guarantees — in the helper's own
  comments, the plan, the results document and the PR body — is consistent with
  "mutation alarm, not identity proof." No surviving overclaim found. See §9,
  Q8.
- **Legs 5, 5c, 6, 8, 9, and the three "harness got it wrong first" self-corrections in `SPACING_HELPER_HARNESS_RESULTS.md` §5** — read against source and found internally consistent; no defect found in their described constructions or results.

---

## 5. Directions

1. **F1 (cheap, non-blocking):** add the class-smoke record to
   `SPACING_HELPER_HARNESS_RESULTS.md`. Cost: minutes (re-run the same headless
   check the commit message already describes, write down the result). Priority:
   low — do before the next artifact in this family needs the same kind of
   evidence, not before this merge.
2. **F2 (cheap, non-blocking):** narrow leg 1b's sentence in the same document.
   Cost: one sentence. Priority: low, same reasoning.
3. **F3 (trivial, non-blocking):** add leg 4 to the exclusion sentence at
   `SPACING_HELPER_HARNESS_RESULTS.md:220-221`. Cost: one clause.
4. **No pivot needed.** Nothing here calls the repair's mechanism, the §10
   contract, or the owner's leg-3 ruling into question. I looked for a reason to
   block and did not find one that survives the "would this have failed"
   question.

---

## 6. Disagreements

None. I reviewed the owner's leg-3 "PASS on the guard reading" disposition
skeptically (Q4 explicitly invites attacking the facts it rests on) and found it
defensible on the actual measurement: SCOPE-ONLY's guard did not refuse
pre-emptively (the click landed and moved a value before any alarm fired), while
REPAIRED's did (zero option clicks, refused in `resolveOwnedDropdown` before
touching anything) — which is the real distinction leg 3 exists to demonstrate,
independent of whether "silently succeed" is the most precise possible phrase for
it in §10. I am not asking for that ruling to be revisited.

---

## 7. Cross-check (second model)

Not yet run. Per §3.6's watch instrumentation, this is the first (or second) of
the first two Sonnet implementation reviews and receives a Sol cross-check of
this review as a separate document or clearly-delimited section — not by
amending this file. Pending.

---

## 8. Gate re-runs — summary table

| Check                                               | Author published                           | This review, independently                                       |
| --------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| `./tools/checks`                                    | REAL_EXIT=0, 4/4, 0 err/145 warn, 1413/104 | **Reproduced exactly**, fresh run, this review's own session     |
| `spacing.spec.ts` + `spacing.visual.spec.ts`        | 6/6 + 1/1, `--retries=0`                   | **7/7 passed**, `--retries=0`, single combined run               |
| `--repeat-each` on `applies spacing presets`        | 5/5                                        | **8/8 passed** (deeper than published, §3.5 item 2)              |
| Snapshot / working-tree cleanliness after every run | `git status --porcelain` empty             | **Empty after every run in this review**, including my own probe |

---

## 9. Answers to the ten commissioned questions

**Q1 — Does the implementation match §10's binding contract, clause by clause?**
Yes, with no unimplemented, partial, or differently-implemented clause found. I
diffed the plan's §4.4 code block against the shipped
`tests/support/dsl/spacing.ts` method-by-method (C3): every method is
structurally identical; only internal comments were trimmed of some SP-/M-number
citations (not of substance — the warnings themselves survive, e.g. "P4 IS A
MUTATION ALARM AND NOT AN IDENTITY PROOF" is present verbatim). All five
"accepted conditions" are satisfied in the reviewed artifacts except that
condition 2's evidence lives outside them (F1). The nested nine-method private
surface matches the plan's own regenerating command
(`grep -nE '^\s*private( async)? [a-z]\w*\(' ...`) applied to the shipped file.

**Q2 — Is the acceptance evidence actually acceptance evidence?** Mostly yes.
Applying rule 1 ("if the repair were NOT what fixed this, would this leg have
failed?") to every leg the results document credits: leg 1b, leg 2 and leg 7 all
pass this test cleanly — each is a same-construction A/B comparison where only
the helper code differs, and CURRENT genuinely fails where REPAIRED genuinely
passes. Leg 5 (GUARD-REMOVAL) likewise passes it: P4-ONLY with the foreign half
deliberately not pre-satisfied lets the mutation alarm fire, demonstrating P4
does real work once scope/identity are stripped. The two real gaps are F1
(condition 2's evidence lives in a commit message, not this document) and F2
(leg 1b's naturalism claim is overstated, though its A/B comparison value is not
undermined). Leg 4 never actually establishes FAIL-OLD (F3, minor).

**Q3 — Were SCOPE-ONLY and P4-ONLY really the weakenings §10 specifies?** I can
confirm the results document's _description_ of the substitutions is internally
consistent with §10's own definitions (C18): §10 says SCOPE-ONLY removes "the
class-identity check", and the results document's `toHaveCount(1)` "surviving as
a document-global singleton guard" is a coherent reading of that — the assertion
line is not necessarily deleted, but once `popupFor` no longer filters by class,
that same assertion stops checking _identity_ and starts checking a _document-
global count_, which is what "removed" plausibly means here. **The harder
question — whether anything else was removed with it — I cannot answer.** The
variant code was untracked and deleted per the owner's accepted harness
exception; I have no diff to read. This is a genuine evidence boundary
(UNVERIFIABLE), not a finding against the plan's harness-exception ruling itself,
which I am not proposing to revisit.

**Q4 — Attack the leg-3 disposition by name.** I read the owner's "PASS on the
guard reading" against the actual measurement rather than against §10's prose
alone. What was measured: SCOPE-ONLY's document-global singleton guard did not
refuse before the click (the click landed in the foreign popup and moved a
value; the guard was "silent" in the sense of not _blocking_), while REPAIRED in
the identical state refused in `resolveOwnedDropdown` with **zero option
clicks** before anything happened. That is a real, load-bearing distinction —
"ownership prevents; scope alone only detects after the fact" — and it is what
leg 3 exists to prove. §10's "must silently succeed" and "retain wired P4" _are_
in tension as literal text (a truly silent leg 3, with the alarm never firing,
is unreachable once P4 is wired and the click lands wrong), but the owner's
reading resolves that tension by treating "silently" as being about the _absence
of a pre-emptive refusal_, not the absence of any error at all — which is
defensible given what was actually measured. See §6 (Disagreements): none.

**Q5 — Attack leg 1 and leg 1b. What would falsify leg 1b?** Leg 1 is already
honestly reported as non-reproducing (`max` popups reached 2 but the window was
10–14 ms, an order of magnitude below M3/M5, because the leg mounts Padding's
popup for the first time inside itself). Leg 1b is what I attacked directly
(F2): it establishes its "foreign" state by pre-mounting both popups directly,
explicitly omitting the settling wait the real spec's own helper call performs.
**What would falsify leg 1b as a faithful reproduction of the real failing
spec:** exactly the test I ran — drive the identical real-spec call sequence
_through the real helper, including its settling wait_, and check whether the
overlap still occurs. It didn't, once, in my probe (C16). That doesn't prove it
_never_ does (n=1; see weakest claims), but it does mean leg 1b's own framing
("exactly as ... does") should be read as being about **control order**, not
about faithfully reproducing the CI-observed race's actual timing.

**Q6 — Is anything the harness measured a property of the harness rather than
of the app? Look for a fourth.** The three self-corrections the results document
already discloses in its own §5 (leg 5b's class erased by rc-motion, leg 8
measuring its own CSS override, leg 1's sampler contaminating leg 1) are each
internally coherent — caught by the leg failing to observe its own claimed
state, then fixed and re-measured, which is exactly the discipline this class of
harness needs. **I looked for a fourth and found one, but of a different kind
than the first three**: not "the probe was broken and then fixed," but "the
probe's own framing (leg 1b) invites more confidence in its naturalism than the
construction actually earns" — that is F2, not a new instance of the same
"harness measured itself" bug class as the other three. Legs 2/3/5/5b's
suppression-based construction is already disclosed by the author as not showing
how CI reaches that state; I found nothing further there beyond what's already
on the record.

**Q7 — Is the product change safe?** Yes. No collision with any existing
selector (C7); the correct, non-deprecated API for the resolved antd version,
6.1.4, read from the lockfile rather than assumed (C5); and — going one level
deeper than the plan's own M7 measurement — no library mechanism by which one
Select's popup DOM node could be reused for another's, since antd's `Select`
never opts into `@rc-component/trigger`'s shared-portal `unique` path (C8). The
two added lines are additive, change no behaviour, and their only effect is a
CSS class attribute that nothing else in the app reads.

**Q8 — Is P4's narrowed promise stated consistently everywhere?** Yes, swept by
role (every sentence describing what P4/the read-back/the mutation alarm
guarantees, not just the token "P4") across the helper's comments, the plan, the
results document, and the PR body. No surviving overclaim found; every
occurrence states or is consistent with "mutation alarm, not identity proof."
See the claim ledger's C-series and §4's "no issue found" list.

**Q9 — The pull request body.** Checked every load-bearing claim against the
branch: diff stat (199/38, exact), the caller-population enumeration (three
disjoint-key `grep`s, all three reproduce, including the third file matching via
a comment rather than a call, exactly as claimed), "only one commit touches
non-Markdown" (exact), the gate figures (exact, C14), and the precedent claim
about `BackgroundCustomizer`'s deprecated `popupClassName` usage (confirmed, five
occurrences, C5). I additionally ran `tools/check-pr-evidence.sh 155`, the
repository's own advisory evidence-surface checker; it returned 31 textual
candidates (counts and universals it cannot itself adjudicate). I did not
disposition all 31 by hand — I spot-verified the load-bearing ones above and
treat the remainder as an evidence boundary rather than a clean sweep. No
running total appears in the PR body that isn't already covered by the plan's
§7.5 block (the gate/test counts in the body are results, not review-arc
figures, and §7.5 doesn't claim to cover those).

**Q10 — Anything else?** F1, F2 and F3 above are what I found beyond the
named nine questions. I looked specifically for a fourth harness-construction
defect (Q6) and for anything in §10's isolation/halt requirements without direct
evidence (Q1) and found nothing further in either case worth a separate
finding.

---

## 10. Owner Decision Briefs (F1, F2)

**F1 — the class-smoke check's evidence lives in a commit message, not the
results document.**

- **What this protects:** confidence that the four new CSS class names actually
  land on the right dropdown in the real app — the one thing the plan itself
  says would halt the work if it failed.
- **What's going wrong, plainly:** the commit that shipped the fix says this was
  checked and passed, but that sentence lives only in the commit's own message,
  not in the document meant to hold the evidence for a reviewer (or the owner)
  to check later.
- **Is the product affected? No** — I checked it a different way (reading the
  actual code and the underlying library's source) and found no way the four
  class names could ever collide or land on the wrong dropdown. This is a
  paperwork gap, not a working-app risk.
- **Options:** (a) leave it — no functional risk, but the one document titled to
  hold this evidence doesn't; (b) add a short paragraph recording the
  measurement properly (a few minutes).
- **Recommendation:** (b) — cheap, and this project has paid real cost before
  for evidence that lived in the wrong place.
- **If nothing is done:** no risk to what ships today; a future reviewer asking
  "was this ever actually checked?" won't find the answer where they'd look
  first.

**F2 — leg 1b's write-up slightly overstates how closely it matches the real
bug.**

- **What this protects:** an honest account of why the "applies spacing
  presets" test used to fail sometimes, so nobody is surprised if a similar bug
  shows up again through a route this document doesn't actually explain.
- **What's going wrong, plainly:** one sentence in the results document could be
  read as "this is how the bug happened in real testing." I tested that
  literally and, once, it didn't happen that way — the real test's own built-in
  pause seems to prevent the exact scenario leg 1b constructs.
- **Is the product affected? No** — the fix works regardless of how the
  two-popup situation arises, and two other legs already prove the fix works
  without needing this explanation.
- **Options:** (a) leave it — the document already admits elsewhere that some of
  its constructed states don't explain how the real system reaches them; (b) add
  one clarifying sentence to leg 1b specifically.
- **Recommendation:** (b) — one sentence, and it's exactly the kind of precision
  this project has rewarded before.
- **If nothing is done:** no risk to what ships; a reader may give leg 1b more
  credit than it's actually earned for explaining the original bug.

---

## 11. MemPalace filing

`mempalace_status` returned live with the `havdm` wing present; a write test
succeeded (writer lease free). Filed directly, `added_by="claude-sonnet"`:

- `[INVESTIGATION]` drawer recording F1 and F2 (evidence-surface gaps in the
  spacing-helper acceptance record) —
  `drawer_havdm_investigations_40863abaa3b46e56094f4de1`, `havdm`/`investigations`.
- `[DECISION]` drawer recording this review's verdict (approve, no SEV-1, two
  SEV-2 non-blocking evidence-hygiene findings) —
  `drawer_havdm_decisions_cd85a1711e01824c7f5e23cd`, `havdm`/`decisions`.
- A diary entry summarising this session for the next agent —
  `diary_havdm_20260903_020129226130_c0a5630042d4`.
