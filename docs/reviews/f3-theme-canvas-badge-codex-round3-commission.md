Author: Claude Opus 5 — authored the slice (`c1acb52`), the round-1 fix (`354d107`) AND the round-2 fix (`667ef5d`, `59e055b`) now under review; this commission is mine and is therefore not independent evidence of anything
Reviewer: Codex — you. Your verdict lands as `docs/reviews/f3-theme-canvas-badge-codex-round3-review.md`, a committed document on this branch and not a chat reply. You authored rounds 1 and 2 and did not author any fix
Owner gate: BaggyG-AU commissioned this round on 2026-08-11 and merges PR #142; this document and your review decide nothing on their own

# Independent review commission — F3 "no preview colours" badge, ROUND 3

## Scope

Branch `feature/f3-theme-canvas-badge`, PR #142. **Review `667ef5d` and
`59e055b` — the round-2 fix — against `d786d28`, the commit carrying your
round-2 review.**

```
c1acb52  Claude Opus 5  the slice                          <- you reviewed in round 1
fcbd264  Codex          your round-1 review
354d107  Claude Opus 5  the round-1 fix                    <- you reviewed in round 2
3918b3b  Claude Opus 5  two self-found corrections + the round-2 commission
d786d28  Codex          your round-2 review
667ef5d  Claude Opus 5  the round-2 fix                    <- REVIEW THIS
59e055b  Claude Opus 5  an anchor defect my own reading pass found in 667ef5d   <- AND THIS
```

Round 2's verdict was **CHANGES-REQUIRED** with three blocking findings, and its
round-1 disposition was **M1 PARTIALLY RESOLVED · M2 REGRESSED · N1 PARTIALLY
RESOLVED · N2 RESOLVED**. **All five round-2 findings were classified CONFIRMED;
none was rejected as false, conceded or out of scope.** The round-2 fix is
**UNREVIEWED NEW WORK**, which is the entire reason this round exists.

⚠ **REV-IMPL class (d) grants ONE mandatory review and no automatic follow-up.
This round is not automatic — the owner ordered it explicitly on 2026-08-11
after reading the round-2 fixes.** Governed by
`docs/governance/OPERATING_AGREEMENT.md` §3.

⚠⚠ **THIS IS THE THIRD AUTHOR ROUND, AND THE ROUND COUNT IS ITSELF EVIDENCE YOU
ARE ASKED TO WEIGH.** See §8 — I have made a diagnosis of _why_ there was a
round 3, and you should treat that diagnosis as one of my claims rather than as
background.

**Reviewer write-restrictions (acknowledged):** no `[STATE]` drawer update; no
UAT card marked or re-scored; no `src/` change; no merge; the reference Home
Assistant instance (`ha.home.local`) is **read-only**. Proposed changes go in
your review document, nowhere else.

---

## 0. Working practice this review is held to

Quoted verbatim rather than cited, because you have no MemPalace access and a
cited rule reaches you not at all.

### 0.1 The rule that governs a round-N+1 review specifically

> **THE FIX ROUND IS UNREVIEWED NEW WORK — SCOPE IT TO THE FINDING, CHECK IT
> AGAINST THE AUTHORITY IT CITES, AND REVIEW ROUND N+1 AS A CHANGE IN ITS OWN
> RIGHT.** A commit that closes review findings is not a settling-up, it is
> fresh unreviewed code or prose written under pressure to satisfy a critic. It
> fails in two opposite directions — UNDER-reaching (fixing the named instance
> but not its class) and OVER-reaching (asserting more than the finding
> required, and contradicting a rule the artifact already obeyed). **A follow-up
> review must therefore do THREE things: dispose of each prior finding by name,
> sweep for regressions in areas that were previously clean, and check that each
> fix stayed inside its own scope.** A round that only re-reads the findings
> list will certify a fix that broke something else.
>
> - **Open with a disposition table** keyed to the claimed resolutions:
>   RESOLVED / PARTIALLY RESOLVED / REGRESSED / OPEN.
> - **Re-check the previously-clean areas, by name and location.**
> - ⚠ **A RISING ROUND COUNT IS DIAGNOSTIC.** If round N+1 keeps producing
>   findings, distinguish the two causes: the same class being patched one
>   instance at a time (an author sweep failure), or each fix generating the
>   next finding (a scope-control failure). They need different remedies.

⚠ **Your round 2 proved this rule on this very branch**: the round-1 fix's new
sentinel flag created R2-M2, a live user-visible defect that did not exist
before the fix. **Round 3 must assume the round-2 fix did the same until it has
checked.**

### 0.2 The rules carried over from rounds 1 and 2

1. **A finding is a sample, not the population.** When you find a defect,
   identify the CLASS it belongs to — all rows of that table, all call sites,
   all specs of that kind — and sweep every member before reporting. Say which
   you did: "L12 is misclassified" and "I checked all 15 legs; only L12 is
   misclassified" are different reports, and only the second lets the author
   stop. **AND THE HALF THAT BITES: a mechanical sweep is only as good as the
   key it is keyed on. Grepping for the token the first instance happened to use
   finds the things that share that token — which is not the class, whenever the
   class is defined by what its members DO.** State the class as a ROLE or
   BEHAVIOUR before choosing a search key; where it is behavioural, read the
   whole surface and say that you did.
   ⚠⚠ **This rule bit BOTH of us in round 2 and it bit me again after the fix** —
   see §2 G6, where my own R2-N1 class turned out to be keyed on your
   vocabulary rather than on the behaviour, and 44 further members exist.
2. **No unverified universals.** "Only", "every", "all", "none" or any count is
   a measurement and needs the enumeration that backs it, attached to the claim.
   A count of containers is not a count of contents — the command you ran must
   measure the property you are asserting.
3. **A check is evidence only for the property it exercises.** Before writing
   "verified", ask: if this claim were false, would what I ran have failed? A
   green suite proves nothing if the tests were written to agree with the code;
   confirming the wiring is not confirming that a value flows through it.
4. **Verify each finding against the source before reporting it.** Quote
   `path:line`. A finding you cannot locate is a question, and should be written
   as one. Check whether the thing you are calling an inconsistency is a
   DELIBERATE decision recorded somewhere you were not shown — say so if you
   suspect it rather than asserting a defect.
5. **Silence is not a result.** State "no issue found" explicitly for every
   heading below. Zero findings on a mature artifact is a PASS, not a failed
   review — never manufacture a finding to justify the pass.
6. **Declare your evidence boundary:** what you could not run, could not reach,
   or could not verify. `UNVERIFIABLE` is a result; a quietly dropped claim is
   not.
7. **A changed-file list is a FLOOR for a reading pass, not the POPULATION of a
   semantic universal.** Git names what the author changed; it cannot name what
   he should have changed, nor a member of the claim's class that is not a file
   in this repository at all — **a pull-request body, a memory store, a wiki,
   another repository.** Before any "all"/"every"/"none"/count: NAME THE
   POPULATION SOURCE ("from memory" is not one) and ASK THE EXTERNAL QUESTION
   EXPLICITLY.
8. **A search run to VALIDATE known members cannot ENUMERATE the population, and
   its output looks identical either way.**
9. ⚠ **NEW, AND THIS ROUND PAID FOR IT TWICE — A MEASUREMENT THAT FAILS FOR THE
   WRONG REASON, OR THAT NEVER RAN ITS OWN PRECONDITION, IS INDISTINGUISHABLE
   FROM ONE THAT WORKED.** A red leg that fails on a selector error, an import
   error or a missing element has proved _nothing_ and reads exactly like a red
   leg that discriminated. A guard-deletion run whose deletion silently did not
   apply reports "passed", which reads exactly like a test that cannot detect
   the deletion. **Both happened in the round-2 fix and both are disclosed in
   §2. When you reproduce my measurements, check the FAILURE REASON, not just
   the exit code.**

⚠ **Rule 7 has teeth on this branch specifically.** The PR #142 body is a live
member of several claim classes here and **no `git diff` will show it to you** —
read it with `gh pr view 142`. The MemPalace drawers are another such member and
you cannot reach them at all; say so rather than assuming they are consistent.

---

## 1. What the round-2 fix claims

Full triage, with every `path:line`, all five class sweeps and the evidence
table: **`docs/reviews/f3-theme-canvas-badge-author-response-round2.md`.** Read
it as a claim to be checked, not as a report of what happened.

| Round-2 finding                                              | Claimed disposition                                                                                                                                                                                                                                         |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R2-M1** — the tooltip repeats M1's canvas-wide claim       | CONFIRMED. Tooltip rewritten to name the canvas background/text pair and the Preview swatches and to concede "Cards, editors and other styling on the canvas may still change". Owner-signed-off. Rendered tooltip assertion added. Predicate **unchanged** |
| **R2-M2** — the `__none__` collision                         | CONFIRMED. Remedy is **structural, not a better lookup**: every real theme's option value in the per-view Select is namespaced `theme:<name>`. Also claimed to close the pre-existing "a real `__none__` can never be selected as an override" defect       |
| **R2-M3** — the new legs never exercise either `labelRender` | CONFIRMED, **and the population is THREE, not two** — `theme-settings-select`'s `labelRender` shipped in the slice `c1acb52`, so round 1 missed it too. Three independent selected-state legs added, each proven to fail when **its own** guard is deleted  |
| **R2-N1** — the DSL splices names into raw CSS               | CONFIRMED. **Five** members fixed, round 2 named three. ⚠ **And a correction to my own class statement, made before this commission: the behavioural class is wider and has 44 further members — reported, not fixed. See §2 G6**                           |
| **R2-N2** — current-head prose states false populations      | CONFIRMED, **and the population is SIX, not four**. Corrected: `getThemeColors` has THREE callers of which two are preview surfaces; **four is the population of theme option SELECTS, not of theme-application actions**                                   |

**And a claim about your round-2 findings, which you should attack first:** I
say **two of your five findings were samples of a larger class** — R2-M3's is
four renderers with three uncovered rather than two, and R2-N2's is six prose
sites rather than four — plus R2-N1's five rather than three. **If any of those
"extra members" is not actually a member, say so loudly**: it is the evidence I
use in §8 to argue that both author and reviewer sampled where the class was
behavioural, and if it is wrong my whole diagnosis of the round count is wrong.

---

## 2. My weakest claims in the ROUND-2 fix — attack these by name

**This list is a FLOOR, not a ceiling.** A defect I did not think to name is
exactly what an independent round is for.

**G1. The tooltip is now on its THIRD wording, and I am the wrong person to
judge whether any clause is still false.** It reads:

> This theme defines none of the colours HAVDM reads, so the canvas background
> and text stay as they are and the Theme Preview panel stays empty. Cards,
> editors and other styling on the canvas may still change. Your Home Assistant
> dashboard is unaffected either way.

Attack every clause independently:

- **"the canvas background and text stay as they are"** — is that true on a
  THEME SWITCH? `App.tsx` computes `canvasThemeBackground` / the text colour
  from `getThemeColors` and normalises with `|| undefined`. If the user is on a
  rich theme and switches to a badged one, do those properties revert to the
  antd token, or does something retain the previous value? **"Stay as they are"
  is a claim about a TRANSITION, and I only reasoned about the steady state.**
  Construct the switch and measure the computed style.
- **"the Theme Preview panel stays empty"** — `ThemePreviewPanel` returns `null`
  per unset swatch, but does the panel render a card, heading, border or
  placeholder around them? **If the user sees a titled card with no swatches,
  "empty" may be the wrong word for what they see.**
- **"Cards, editors and other styling on the canvas may still change"** — is
  "cards and editors" the right user-facing name for the Swiper / Allotment /
  Monaco class you established in round 1, or does it now UNDER-state it?
- Is the whole thing simply too long to read in a tooltip?

**G2. The namespacing remedy is the part most likely to have created the next
R2-M2.** Every real option value in `theme-manager-view-override` becomes
`theme:<name>`; the sentinel stays `__none__`; `themeNameFromOverrideValue`
returns `null` for anything not carrying the prefix. **Attack the encoding
itself:**

- A theme named `theme:x` namespaces to `theme:theme:x` and decodes to
  `theme:x`. **Verify that round-trip against the real store rather than
  believing my arithmetic**, and find a name where it does not hold.
- `themeNameFromOverrideValue` returns `null` — i.e. **CLEAR THE OVERRIDE** —
  for _any_ value lacking the prefix. The sentinel is the only such value today.
  **Is a silent "clear" the right failure mode if that ever stops being true?**
- Does anything else consume that option value — persistence, export, the
  `Clear` button's disabled state, `viewOverrides` in `localStorage`? I claim
  the namespacing is confined to the Select. **Verify it never reaches disk.**
- I claim `label` is untouched so the antd-derived `title` is unchanged and no
  spec or DSL selector is affected. **Verify by measurement, not by reading.**

**G3. I asserted a value-uniqueness INVARIANT in a docblock and pinned it with
nothing.** `marksNoEffect`'s comment now says all three lists it is called with
are value-unique by construction. **There is no test that fails if a future
Select breaks that.** Is a docblock the right instrument, or does this need an
executable guard? And **is the invariant even true** for `themeOptions` and
`savedThemeOptions` — re-derive it rather than checking my reasoning.

**G4. The three new selected-state legs may not be as independent as I claim.**
I say each is independent of the dropdown badge assertion because it selects by
`title`, which does not depend on the badge. But:

- The Theme Settings leg makes **two** selections in one test; if the first
  assertion fails the second never runs. **Is that one leg or two?**
- The guard-deletion proof deleted **all three guards at once** and ran all
  three legs. That shows each leg fails when _some_ guard is missing. **Does it
  show each leg detects ITS OWN guard?** I argue yes, because each leg touches
  exactly one Select — **check that argument, and if it is insufficient, say
  the proof needs to be run one guard at a time.**

**G5. The `__none__` regression leg asserts a second thing the finding did not
ask for** — that a real theme named `__none__` is now selectable as an override.
You asked for "displayed identity and badge state" on the no-override case. I
added the positive half to pin the remedy against a lookup-only revert.
**Judge whether that is legitimate pinning or scope creep into a pre-existing
defect neither round asked me to fix.**

**G6. ⚠⚠ MY R2-N1 CLASS STATEMENT WAS KEYED ON YOUR VOCABULARY, NOT ON THE
BEHAVIOUR — I FOUND THIS AFTER THE FIX AND BEFORE COMMISSIONING THIS ROUND.**
R2-N1 arrived as a `[title="…"]` CSS defect, so I swept for _CSS-selector
construction_ and closed a five-member class. Stated behaviourally the class is
_a matcher that splices an unescaped caller-supplied value into matcher syntax —
CSS **or regex**_, and under that statement there are **44 further unescaped
sites across 23 files** (e.g. `attributeDisplay.ts:74`,
`getByRole('option', { name: new RegExp(\`^${value}$\`, 'i') })`), against **5**
that do escape (`weatherViz.ts:129`, `colorPicker.ts:403`, `iconColor.ts:112`,
`authorLedger.ts:98-99`). **Every one of the 44 is in a file this branch never
touched**, so I reported rather than fixed them. **Judge that call.** Is
"unrelated files, over-reach to fix here" right, or is a class you have now
opened twice something this PR should close? And **re-derive the 44/5 split —
do not check my arithmetic, check my population.**

**G7. R2-N2's population claim, and the anchors defect underneath it.** I claim
six false prose sites and that all are corrected. **Re-derive the population.**
Then: my own reading pass found that the fix for R2-N2 **invalidated eight
`path:line` anchors** because namespacing added ~57 lines above them — corrected
in `59e055b` by restating them as symbols. **Check that I did not miss any, and
that the "historical" anchors I chose to keep are genuinely historical rather
than a convenient exemption.** I swept 52 anchors and claim 33 current-head ones
all resolve correctly.

**G8. Two things are REPORTED, NOT FIXED, and both are my judgement calls.**
(a) `ThemeSettingsDialog.tsx`'s **"Theme Preview" Alert** — _"Themes are applied
to the dashboard canvas. Changes will be visible immediately when you click
Apply"_ — overclaims in the **opposite** direction for a badged theme. It is
pre-existing and you did not report it. (b) The 44 regex sites from G6.
**Judge each: right restraint, or a defect I hid behind the word "scope"?**

**G9. My re-run coverage claim.** I did not run the full suites. I claim the
spec-level re-runs cover "every spec these changes touch", enumerated from the
changed files: I re-ran the badge spec, both other theme integration specs, and
e2e `theme-manager` / `theme-restore` / `theme-chrome` / `smart-actions`. My
enumeration was `grep` for consumers of `ThemeManagerDSL` and `SmartActionsDSL`.
**Re-derive it. Is there a spec that reaches the changed DSL methods or the
changed component by a route my grep did not see?**

**G10. The commit-splitting decision.** `59e055b` corrects `667ef5d` rather than
amending it, on the same reasoning round 2 upheld for `354d107`'s wrong figure
(F7: "amending would erase rather than clarify the trail"). **Is that still the
right call when the corrected commit was the immediately preceding one, pushed
minutes earlier, and not yet reviewed by anyone?**

**G11. Nothing in the new or rewritten docblocks has been read by anyone but
me.** The fix rewrote long explanatory comments in `ThemeNoEffectBadge.tsx`,
`ThemeSettingsDialog.tsx`, `themeOptions.ts`, `themeBadge.spec.ts`,
`theme-no-effect-badge.spec.ts` and `themeManager.ts`. **Prose that explains a
defect is where an over-reach hides** — and on this branch it is also where the
last two rounds' findings lived. Check each against what the code actually does.

---

## 3. Negative cases to invent — my list is a floor

Starting points, none exhaustive: a saved theme named `theme:Mushroom`, and one
named `theme:theme:Mushroom`; a theme named `__none__` that is NOT inert (does
the collapsed control show it correctly, and stay unbadged?); importing a view
override whose `themeName` is `__none__`, which bypasses the Select entirely;
switching from a rich theme to a badged one and reading the canvas computed
background (G1); a theme whose name is only whitespace after trimming; a theme
name containing `(`, `[` or `\` driven through the DSL matchers I just changed
AND through one of the 44 unescaped regex sites; opening the Theme Manager with
no active view (the override Select is `disabled` — does `labelRender` still
run?); toggling light/dark with a `__none__` theme selected as an override.

---

## 4. Required re-runs — §3.5 REV-RERUN

**Do not accept my numbers. Re-run and report your own, with real exit codes.**

1. **`./tools/checks`** — report the REAL exit code and confirm
   `grep -cE "^> (eslint|prettier --check|tsc --noEmit|vitest run)" <log>`
   returns **4**. I measured exit 0, 4/4, 0 errors / 145 warnings, **1413 tests
   across 104 files**, run after committing at **both** `667ef5d` and
   `59e055b`.
2. **Reproduce the round-2 red leg.** `git checkout d786d28 -- src/ tests/support/dsl/themeManager.ts`,
   then `bash tools/test-headless.sh tests/integration/theme-no-effect-badge.spec.ts --project=electron-integration --workers=1`.
   Expect **3 failed / 9 passed**, the three failures being the tooltip wording,
   `Received string: "__none__"`, and
   `Unexpected token "" while parsing css selector`. Restore and confirm
   `git status --porcelain` is empty.
   ⚠⚠ **CHECK THE FAILURE REASONS, NOT THE COUNT** — per §0.2 rule 9, my first
   attempt at the tooltip leg failed with "element(s) not found" because antd
   6.1.4 renders tooltip text into `.ant-tooltip-container`, **not**
   `.ant-tooltip-inner`. A red leg that fails on a bad selector proves nothing
   and looks identical to one that worked.
   ⚠ **The three new selected-state legs are among the 9 PASSED and are CONTROL
   legs.** If they FAIL on `d786d28`'s source, my labelling is wrong.
3. **Reproduce the guard-deletion proof, and consider doing it one guard at a
   time** (G4). Delete the three collapsed-Select badge guards in
   `ThemeSettingsDialog.tsx` and run the three legs; expect 3 failed, each on
   its own `toBeVisible` badge assertion.
   ⚠⚠ **ASSERT THE DELETION ACTUALLY APPLIED.** My first attempt's edit script
   aborted before writing and the run measured the **unmodified** tree,
   reporting "3 passed" — which is indistinguishable from tests that cannot
   detect the deletion. Verify the file changed before you trust the run, and
   verify it is byte-restored after.
4. **Both full suites**, or state which you did not run.
   `--project=electron-integration` then `--project=electron-e2e`, sequentially,
   `--workers=1`. ⚠ **I did NOT run them at this head — "NOT MEASURED" is my
   position, not "held".** The documented baseline is **seven** expected e2e
   failures and a clean integration suite; your round 2 measured one
   integration failure (`yaml-entity-insert.spec.ts:151`) that passed three
   isolated reruns.
5. **Confirm `tests/unit/builtInThemes.spec.ts` is still byte-unchanged from
   `6bf5f62`** — `git diff --stat 6bf5f62 -- tests/unit/builtInThemes.spec.ts`
   must be empty.
6. **Re-derive the 44/5 unescaped-regex split of G6 yourself**, and confirm or
   refute that none of the 44 is in a file this branch changed.

---

## 5. Deliberately out of scope — do not report as omissions

- **The canvas fidelity contract deep fix.** Owner-ruled out of this PR on
  2026-08-10 and still an unwritten obligation. It remains the only mechanism
  that could support a wider claim than the tooltip now makes.
- **The HA-06 UAT card correction** — queued for r4 generation. The agent never
  marks, re-marks or re-scores a UAT test.
- **THEME-01's contrast audit** — its own item.
- **The `ThemeVars` relaxation** — reported not fixed; you agreed in round 1.
- **`tests/unit/builtInThemes.spec.ts`** — must not change, and has not.
- **The component name `ThemeNoEffectBadge` and the `data-testid`
  `theme-no-effect-badge`**, which still say "no effect". You found no issue in
  round 2; unchanged since.
- **The 44 unescaped regex matchers and the "Theme Preview" Alert are NOT in
  this list** — they are live questions in §2 G6 and G8, and I want your
  judgement on the scope call rather than silence.

---

## 6. Where your MemPalace notes go — ruling MP-LEASE

Record them in a `MemPalace drawer candidates` section at the **end of your
review document**, not in the PR body, and the write-enabled author files them
with `added_by="codex"`. ⚠ **Never kill a process to free the lease and never
set `MEMPALACE_MCP_ALLOW_PEER_WRITER`.**

ⓘ **Your round-2 candidates are NOT YET FILED.** The `__none__` sentinel
collision and the `yaml-entity-insert.spec.ts:151` one-fire flake are both
outstanding — the flake because whether a one-fire entry is accepted at all is
the owner's call, and both because they were listed as owed _after_ the fix task
and I did not start them unbidden. Your "Practice wing: none" was concurred
with. **This is disclosed so you do not report it as a dropped obligation.**

---

## 7. What I did NOT do, so you do not have to find it

- I did not commission this round; the owner did, after reading the fixes.
- I did not amend or squash any commit. All seven are intact and separately
  attributable; both your review commits are untouched.
- I did not rebaseline any snapshot, and did not diagnose `apexcharts.visual:26`'s
  3,341 px vs the drawer's 3,126.
- I did not run the full e2e or integration suites at this head.
- I did not touch `[STATE]`, any UAT card, the reference HA instance, or the
  merge state. ⚠ **`[STATE]` is knowingly stale** — it still names head
  `3918b3b` — because it is ~19,660 of ~20,000 chars and must be SPLIT before
  any bump, which is its own operation.
- I ran `edit-freeze` and a `reading-pass` over my own fix round before
  publishing. **It found the eight-anchor defect (`59e055b`), and a follow-up
  check found G6.** Both are disclosed rather than quietly repaired, because a
  self-check that reports zero findings is the one you should trust least.

---

## 8. My diagnosis of the round count — treat this as a claim, not context

Round 2 diagnosed **scope-control**. I claim round 3 is a **third** thing, and
the claim is falsifiable:

> **Round 1's original class never recurred.** No further `buildThemeOptions`
> caller was found unbadged; the four-Select population held. What recurred is
> that every artifact the FIX ROUND ITSELF CREATED — the tooltip string, the
> sentinel flag, the new legs, the rewritten docblocks — was written as
> settling-up rather than as new work owing its own class sweep. R2-M2 is
> scope-control inside that; R2-M1, R2-M3 and R2-N2 are unswept new work.

My evidence is that sweeping those classes found **four members round 2 did not
name**, and that the pattern then repeated twice more inside the round-2 fix
itself (the eight stale anchors, and G6's 44 sites).

**Attack it three ways.** (a) Is the claim that round 1's class never recurred
actually true — find a `buildThemeOptions` consumer or a theme-application Select
that is still unbadged, and it is false. (b) Are the "extra members" I found
real members, or did I inflate the population to support the diagnosis? (c) Is
"unswept new work" a distinction that changes the remedy, or a rebranding of the
author sweep failure your rule already names? **If it is the latter, say so —
the remedy I would take from it is different, and I would rather be corrected
than agreed with.**
