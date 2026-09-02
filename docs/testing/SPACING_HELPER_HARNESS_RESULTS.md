# Spacing helper — harness legs 1–9, run under §10's binding constructions

Author: Claude Opus 5 (1M context)
Reviewer: Claude Sonnet 5 (implementation review, pending)
Owner gate: micah / BaggyG-AU

Acceptance evidence for the repair implemented at
`82c0e49282a1ae0eee743e666e9ecb8729a76a01`. The legs, their kinds and their
expected results are specified in §6 of
[`SPACING_HELPER_PRESET_PLAN.md`](SPACING_HELPER_PRESET_PLAN.md); their
constructions are fixed by §10 of that document, which is the reviewer's own text
and is binding. **This file records what was measured. It specifies nothing, and
it states no running total** — those live once, in the plan's §7.5
`plan-running-totals` block.

⭐ **Why this file exists at all.** The commit that landed the repair reported the
caller, visual and repeat gates green. By the plan's own rule (§6) those can
**veto** a repair and cannot **establish** one: acceptance comes only from
FAIL-OLD / PASS-NEW and GUARD-REMOVAL legs. Everything below is that missing half.

---

## 1. The harness, and the bounds it was run under

Run under the owner's narrow harness exception
(`drawer_havdm_decisions_12ca9d9672d4c827f60a4fcd`): temporary specs and variant
helpers under `tests/`, **untracked**, headless via
`bash tools/test-headless.sh <spec> --project=electron-e2e --workers=1 --retries=0`,
**deleted afterwards**. Verified after deletion: `git status --porcelain` **empty**;
`git diff HEAD -- src/` and `git diff HEAD -- tests/` both **empty**;
`sha256sum tests/support/dsl/spacing.ts` and `src/components/SpacingControls.tsx`
**identical** to `git show HEAD:` for both; `tests/baseline/expected-failures.json`
unchanged.

**`--retries=0` on every run.** The per-attempt result is the measurement; a retry
laundering a failure into a pass would destroy the thing being measured.

**The four variants, and how they were built.** REPAIRED is the shipped
`tests/support/dsl/spacing.ts`, imported unmodified. CURRENT is `main`'s helper,
copied verbatim with only its class renamed. SCOPE-ONLY and P4-ONLY were
**generated from the shipped file by a script making exact string substitutions,
each asserting it matched exactly once** — so neither variant can silently drift
from the helper it is supposed to weaken:

| Variant        | §10's definition                                                                                     | The substitutions actually applied                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **REPAIRED**   | the shipped helper                                                                                   | none                                                                                                                       |
| **CURRENT**    | today's helper                                                                                       | `git show main:tests/support/dsl/spacing.ts`, class renamed                                                                |
| **SCOPE-ONLY** | REPAIRED with `popupFor` replaced by the document-global visible popup locator, identity removed     | `popupFor` returns `.ant-select-dropdown:visible`; the `toHaveCount(1)` survives as a **document-global singleton guard**  |
| **P4-ONLY**    | SCOPE-ONLY with the document-global singleton/count guard removed, leaving the working global opener | `popupFor` returns `.ant-select-dropdown:visible` `.last()` — the pre-repair opener; the `toHaveCount(1)` block is deleted |

**Instruments, and the control each carries.** A page-side sampler counting
simultaneously visible popups every ~4 ms (rAF plus a timer); a capture-phase
`mousedown` listener on the requested Select's root that counts and suppresses,
with a `mouseup` counter beside it that does not suppress; a document-level
capture listener recording **which popup each option click landed in**. Every
listener and style override is removed in a `finally` and **proved gone** — for
the suppressor by dispatching a non-bubbling synthetic `mousedown` at the same
root and confirming the counter does not move.

### 1.1 Condition 2 — the four-control class smoke (2026-09-03)

§10 condition 2 requires this check to run headlessly against the real Electron
renderer before the helper is written, and marks it HALT-bearing: "Any missing,
duplicate, shared or swapped mapping HALTS the work... It is not
characterisation." The repair shipped in commit `82c0e49` and this check was
reported satisfied in that commit's message, but — per finding F1 of the
independent implementation review
([`docs/reviews/spacing-helper-implementation-sonnet-review.md`](../reviews/spacing-helper-implementation-sonnet-review.md))
— had no record in this document. This section is that record, re-measured
independently rather than copied from the commit message.

**Harness.** A temporary, untracked spec
(`tests/e2e/_class_smoke_probe.spec.ts`, same harness exception as the legs
above, headless via `bash tools/test-headless.sh
tests/e2e/_class_smoke_probe.spec.ts --project=electron-e2e --workers=1
--retries=0`, deleted after use) opened each of the four spacing Selects in
turn — `spacing-margin-mode`, `spacing-margin-preset`, `spacing-padding-mode`,
`spacing-padding-preset` — from the same pre-satisfied starting state as the
legs below, and for each: asserted its own `.<testid>-popup` class matched
**exactly one** `.ant-select-dropdown` node, asserted that class was not also
present on any other visible popup, then closed it. After all four had been
opened once each — leaving all four popups mounted, since rc-trigger does not
remove a closed popup from the DOM (`spacing.ts:73-74`) — it counted DOM nodes
matching each class independently and the union of all four classes.

**Result.**

```
CLASS_SMOKE_RESULT {"spacing-margin-mode":1,"spacing-margin-preset":1,"spacing-padding-mode":1,"spacing-padding-preset":1}
CLASS_SMOKE_TOTAL_DISTINCT_NODES 4
```

Each of the four classes matched exactly one node (**no missing and no
duplicate** mapping), and the four per-class node sets were pairwise disjoint — the union
across all four selectors has exactly 4 members, not fewer, so no two classes
resolved to the same node (**no shared** mapping).

⚠ **Counting cannot decide the fourth failure mode condition 2 names.** Four
classes landing on four distinct nodes is equally true of a **swapped** mapping —
`spacing-margin-preset`'s Select rendering the popup that carries
`spacing-padding-preset-popup`, and vice versa. Every count in this subsection is
unchanged under that swap, so the evidence here establishes **missing, duplicate
and shared — not swapped**. Swap is decided functionally in §1.2 below. (This
sentence originally read "no shared or swapped mapping"; the correction is
recorded in
[`docs/reviews/spacing-helper-preset-plan-repair-dispositions.md`](../reviews/spacing-helper-preset-plan-repair-dispositions.md).)

**Verified after deletion:** `git status --porcelain` empty; `git diff HEAD --
src/ tests/` empty; `sha256sum` of both changed files identical to
`git show HEAD:` for each.

### 1.2 Condition 2 — the swap check, and an independent re-measurement (2026-09-03)

⭐ **Why this subsection exists.** §1.1 was written during the Round 1 repair, and
that round was executed under an incorrect model invocation — the session ran as
Claude Sonnet 5, the model that also holds the mandatory §3.4 scoped-follow-up
review seat. A genuinely fresh Claude Opus 5 session therefore re-derived §1.1
from scratch rather than adopting it on trust. The re-derivation **reproduced
§1.1's counts exactly** and found **one over-reach**, corrected above: counting
cannot decide a swap. Full record:
[`docs/reviews/spacing-helper-preset-plan-repair-dispositions.md`](../reviews/spacing-helper-preset-plan-repair-dispositions.md).

**Harness.** A second temporary, untracked spec
(`tests/e2e/_opus_class_smoke_probe.spec.ts`, same harness exception as the legs
above, headless via `bash tools/test-headless.sh
tests/e2e/_opus_class_smoke_probe.spec.ts --project=electron-e2e --workers=1
--retries=0`, deleted after use), written independently and run from the same
pre-satisfied starting state. **Part A** repeats §1.1's counting. **Part B**
decides the swap functionally: for each Select in turn it opens the control,
clicks an option located **only** through `.ant-select-dropdown.<testid>-popup` —
the class under test is the sole route to that option — and then reads back
**which control actually moved**.

**Part A — counting, independently reproduced.**

```
CLASS_SMOKE_RESULT {"spacing-margin-mode":1,"spacing-margin-preset":1,"spacing-padding-mode":1,"spacing-padding-preset":1}
CLASS_SMOKE_TOTAL_DISTINCT_NODES 4
CLASS_SMOKE_NEG1_BOGUS_CLASS_COUNT 0
CLASS_SMOKE_ALL_SPACING_POPUP_NODES 4
```

Identical to §1.1's figures. `CLASS_SMOKE_NEG1_BOGUS_CLASS_COUNT` is a **negative
control**: the same counting expression applied to a class that does not exist
(`spacing-nonexistent-control-popup`) returns **0**, so the four 1s above are the
instrument discriminating rather than the instrument stuck.

**Part B — the swap check.** Targets differ per half, so a margin↔padding swap
cannot hide behind a coincidentally matching value.

| Select                   | before     | option clicked via its own class | after           | other half moved |
| ------------------------ | ---------- | -------------------------------- | --------------- | ---------------- |
| `spacing-margin-preset`  | None (0px) | Relaxed                          | Relaxed (16px)  | none             |
| `spacing-padding-preset` | None (0px) | Spacious                         | Spacious (24px) | none             |
| `spacing-margin-mode`    | All Sides  | Per Side                         | Per Side        | none             |
| `spacing-padding-mode`   | All Sides  | Per Side                         | Per Side        | none             |

Every click reached the control that **owns** the class it was routed through, and
in no case did the other spacing half move. A swapped mapping would have surfaced
twice over — the operated Select would have kept its old value, and the other half
would have moved.

⭐ **POS-1 control.** Each target differed from that control's value beforehand
(the `before` and `after` columns differ on every row), so none of these four
assertions could pass vacuously. This matters here specifically: P4 is a mutation
alarm, not an identity proof, and a wrong-control click on a control **already
holding** the target value changes nothing and passes silently
(`tests/support/dsl/spacing.ts:192-200`).

**Condition 2 is satisfied on all four of the failure modes it names** — missing,
duplicate and shared (§1.1), and swapped (this subsection).

⚠⚠ **A trap worth recording: `aria-controls` is NOT an identity link in this
suite.** The obvious way to tie a popup to its owning Select _without_ reading the
class under test is the open combobox's `aria-controls`, which `@rc-component/select`
sets to `` `${id}_list` `` and renders inside the owning popup
(`node_modules/@rc-component/select/es/SelectInput/Input.js:179`,
`node_modules/@rc-component/select/es/OptionList.js:280`). It does not work here.
`@rc-component/util`'s `useId` returns the **literal string `'test-id'`** whenever
`NODE_ENV === 'test'` (`node_modules/@rc-component/util/es/hooks/useId.js:30`), so
all four Selects emit `aria-controls="test-id_list"` and `getElementById` resolves
to whichever popup mounted first. **MEASURED:** an earlier version of this probe
used it and reported a **false swap** on Selects 2, 3 and 4 while passing Select 1
— the first red came from the instrument, not the app. The functional check above
replaced it because it reads the app's own behaviour rather than an identifier the
test environment deliberately collapses.

**Verified after deletion:** `git status --porcelain` empty; `git diff HEAD --
src/ tests/` empty; `sha256sum tests/support/dsl/spacing.ts
src/components/SpacingControls.tsx` identical to `git show HEAD:` for each
(`9756c68c…` and `c52db0bc…`).

---

## 2. Results

Every leg established and recorded its own starting state. In every leg the
starting state was the pre-satisfied one M9a records — all four Selects at
"All Sides" / "None (0px)" — except where a line below says otherwise.

| #      | Kind                | Variant    | Starting state observed?                                                                                    | Result                                                                                                               |
| ------ | ------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **0**  | CENSUS              | —          | 4 Selects pre-satisfied, **0** popup nodes in the DOM, 0 visible                                            | M9a re-confirmed                                                                                                     |
| **1**  | FAIL-OLD / PASS-NEW | CURRENT    | max simultaneous visible popups **2**; window **14 ms**                                                     | ⚠ **FAIL-OLD did NOT reproduce** — CURRENT set Padding correctly. See §3.                                            |
| **1**  | FAIL-OLD / PASS-NEW | REPAIRED   | max **2**; window **10 ms**                                                                                 | PASS — Padding → Normal (8px), Margin untouched                                                                      |
| **1b** | FAIL-OLD / PASS-NEW | CURRENT    | max **2**; window **1249 ms**; popup DOM order `[margin, padding]`                                          | ⭐ **FAIL-OLD** — the click landed in the **Margin** popup; Margin moved Relaxed (16px) → Normal (8px); **no error** |
| **1b** | FAIL-OLD / PASS-NEW | REPAIRED   | max **2**; window **318 ms**; same DOM order                                                                | ⭐ **PASS-NEW** — click landed in `spacing-padding-preset-popup`; Padding → Normal; Margin stayed Relaxed (16px)     |
| **2**  | FAIL-OLD / PASS-NEW | CURRENT    | foreign popup open, 1 visible; 1 mousedown suppressed, 1 mouseup seen                                       | ⭐ **Silently succeeded on the WRONG control** — Margin None → Normal (8px), Padding unchanged, **no error**         |
| **2**  | FAIL-OLD / PASS-NEW | REPAIRED   | **2** suppressed mousedowns, **2** mouseups, requested `aria-expanded="false"`, foreign popup still visible | ⭐ **PASS-NEW** — refused in `resolveOwnedDropdown` naming the control; **zero option clicks**                       |
| **3**  | GUARD-REMOVAL       | SCOPE-ONLY | same construction as leg 2; 1 mousedown suppressed                                                          | ⭐ **The scope guard was SILENT** — click landed in the Margin popup, Margin moved. See §4.                          |
| **4**  | FAIL-OLD / PASS-NEW | CURRENT    | clean panel                                                                                                 | PASS, 2731 ms                                                                                                        |
| **4**  | FAIL-OLD / PASS-NEW | REPAIRED   | clean panel                                                                                                 | PASS, 2390 ms                                                                                                        |
| **5**  | GUARD-REMOVAL       | P4-ONLY    | Margin preset pre-set to Relaxed (16px) so the foreign half is NOT pre-satisfied                            | ⭐ **P4 fired, naming both controls; exit code 1.** See §2.1                                                         |
| **5b** | KNOWN-OPEN          | REPAIRED   | all four pre-satisfied; the requested class **held on the foreign popup** through the whole leg             | ⚠ **PASSES — and that is the correct recorded result.** See §2.2                                                     |
| **5c** | KNOWN-BAD           | REPAIRED   | (i) guarded value node removed for **1201 ms**; (ii) a duplicate value node                                 | (i) waited and proceeded, **no false "moved" failure**; (ii) failed **at capture, before any click**                 |
| **6**  | KNOWN-BAD           | REPAIRED   | clean panel                                                                                                 | ⭐ **Failed on `toHaveCount(1)` naming the pattern; exit code 1.** See §2.1                                          |
| **7**  | FAIL-OLD / PASS-NEW | CURRENT    | an unrelated Select's popup held visible for the whole call                                                 | ⭐ **FAIL-OLD** — burnt its budget and failed on `toHaveCount(0)`, 4076 ms                                           |
| **7**  | FAIL-OLD / PASS-NEW | REPAIRED   | same                                                                                                        | ⭐ **PASS-NEW** — passed promptly, 2619 ms                                                                           |
| **8**  | CHARACTERISATION    | REPAIRED   | requested `aria-expanded="false"` **while** its own popup was visible and mid-leave                         | Re-opened and selected, 1587 ms. Not acceptance evidence.                                                            |
| **9**  | CHARACTERISATION    | REPAIRED   | one-shot suppression fired **once** and removed itself                                                      | Succeeded only after the second gesture, 2063 ms. Not acceptance evidence.                                           |

### 2.0 The two messages the acceptance claim rests on

§10 requires the exact message only for legs 5 and 6, which are in §2.1. These two
are quoted as well because the acceptance claim is a claim about **what the helper
did**, and the summary row above is a paraphrase of it.

**Leg 2, REPAIRED — the refusal, before any click:**

```
expected exactly one popup carrying .spacing-padding-preset-popup — more than one
means the class is rendered by more than one Select and is no longer an identity

expect(locator).toHaveCount(expected) failed
Locator:  locator('.ant-select-dropdown.spacing-padding-preset-popup')
Expected: 1   Received: 0
```

Recorded alongside it: two suppressed `mousedown` events and two `mouseup` events on
the requested Select's root — **both pointer actions completed** — the requested
Select reading `aria-expanded="false"`, the foreign popup still visible, and **zero
option clicks anywhere**.

**Leg 3, SCOPE-ONLY — the same state, the scope guard silent, the alarm firing after
the fact:**

```
spacing-padding-preset did not end up showing the value that was selected — the
click may have landed on another control

expect(locator).toHaveText(expected) failed
Locator: getByTestId('spacing-padding-preset').locator('.ant-select-content-value')
Expected pattern: /^Normal/i
Received string:  "None (0px)"
```

The document-global singleton guard raised nothing, and the option click was
recorded landing in `spacing-margin-preset-popup`. **The failure is a report that
the wrong thing already happened, not a refusal to do it.**

### 2.1 The two recorded failure messages and exit codes

§10 requires the exact message **and** the runner's process exit code for legs 5
and 6. A leg whose failure is caught by the harness cannot produce an exit code, so
both were repeated in a spec with no `try`/`catch` and run **one at a time**.

**Leg 5 — P4-ONLY, `bash tools/test-headless.sh … --grep "leg5-uncaught"`, exit code `1`:**

```
Error: spacing-padding-preset was the control this call asked for, but the OTHER
spacing half moved while it was being operated. Guarded controls:
spacing-margin-mode, spacing-margin-preset. Each key is a test id — compare
expected (before) with received (after).

  Object {
    "spacing-margin-mode": "All Sides",
-   "spacing-margin-preset": "Relaxed (16px)",
+   "spacing-margin-preset": "None (0px)",
  }
```

It names the control that was **asked for** and the control that **moved**, which
is what §10 requires of it. The wrong-control click was recorded landing in
`spacing-margin-preset-popup`.

**Leg 6 — REPAIRED, `--grep "leg6-uncaught"`, exit code `1`:**

```
Error: expected exactly one option matching /^Nonexistent/i in
spacing-padding-preset's own popup
Locator: locator('.ant-select-dropdown.spacing-padding-preset-popup')
         .locator('.ant-select-item-option').filter({ hasText: /^Nonexistent/i })
Expected: 1   Received: 0
```

Driven through the real wired caller — `setPreset` capitalises its argument, so
`setCardPadding('nonexistent')` produces the pattern with no call to a private
member.

### 2.2 Leg 5b — the SP-25 limit, pinned

The leg puts the **requested** class on the **foreign** popup, which is what a
misattached mapping would produce, in the state M9a measures to be a fresh card's:
all four Selects already showing the value being asked for. Measured: the click
landed in the foreign popup, **nothing moved anywhere**, and the call **passed**.

That is the correct recorded result. It pins the hole §8 already publishes — P1
prevents by construction and has no defence against a popup that carries the
requested class, and P4 cannot see a click that moves nothing. **Anyone who later
closes that hole breaks leg 5b and must correct §3, §4.1 and §8 of the plan in the
same commit.**

### 2.3 Leg 5c — the fail-closed sensor, which had never been run

`snapshotOtherHalf`'s fail-closed design was listed in §8 as new and unrun. Both
halves of leg 5c now have a result. In (ii) the helper failed **131 ms** in, with
**zero option clicks and zero mousedowns**, naming the id it could not read:

```
Error: spacing-margin-preset's value node never became visible — the other-half
guard cannot be captured
… strict mode violation: getByTestId('spacing-margin-preset')
  .locator('.ant-select-content-value') resolved to 2 elements
```

---

## 3. Leg 1 ran, and its FAIL-OLD half did not reproduce — reported, not buried

§10 fixes leg 1's construction: open Margin preset, wait for its popup, invoke
Padding preset immediately with no settling wait, record the simultaneous visible
popup count continuously, and treat `max < 2` as UNRUN. **Max was 2, so by §10's
own criterion the leg ran** — and the sampler's control leg reported 2 on a
force-unhidden popup in the same run, so a 2 is the instrument working rather than
a coincidence.

But the window was **10–14 ms**, an order of magnitude below the ~350 ms M3
recorded, and CURRENT selected the correct control. The cause is measurable and
mundane: leg 1 as written mounts the Padding popup for the **first time** inside
the leg, and the mount cost consumes the overlap. CURRENT's option query runs well
after 14 ms, so it never sees the foreign popup.

**Leg 1b is the same §10 construction with that state established rather than hoped
for**: both popups pre-mounted in the order the real failing spec produces — the
Margin preset driven first, matching the **control order** of
`tests/e2e/spacing.spec.ts` › `applies spacing presets` — recorded as its starting
state, with the popup DOM order published (`[spacing-margin-preset-popup,
spacing-padding-preset-popup]`). The window opened to 1249 ms and the defect
reproduced in full: CURRENT clicked the option in the **Margin** popup and moved
the Margin preset, silently. REPAIRED, in the identical starting state, clicked in
its own popup and left the Margin alone.

⚠ **The overlap itself is manufactured by omitting the settling wait
(`waitForAllSelectDropdownsToClose`) that the real spec's own pre-repair helper
call sequence performs between the two DSL calls** — leg 1b matches the real
spec's control order, not its full call sequence. The independent implementation
review (F2,
[`docs/reviews/spacing-helper-implementation-sonnet-review.md`](../reviews/spacing-helper-implementation-sonnet-review.md))
measured, with its own headless probe driving the literal DSL-mediated sequence
including that wait, that the two-popup overlap did **not** occur in that one run
(n=1; `settleMs=1491`, `maxVisiblePopups=1`). How CI's seven recorded sightings of
`applies spacing presets` actually reach a two-popup state remains unestablished,
as is already disclosed below for legs 2/3/5/5b for a different reason (they reach
their state by suppression, not by timing).

⚠ **Both leg 1 results are recorded. The FAIL-OLD/PASS-NEW claim rests on leg 1b,
leg 2 and leg 7 — not on leg 1 or leg 4.** Leg 4 (§2 above) is labelled
FAIL-OLD/PASS-NEW in the plan's §6 kind table but PASSES on both CURRENT and
REPAIRED from a clean panel — CURRENT never fails, so leg 4 never establishes
"the defect is real"; it demonstrates the happy path is undisturbed, which is
regression-sanity evidence, not acceptance evidence (finding F3 of the
independent implementation review,
[`docs/reviews/spacing-helper-implementation-sonnet-review.md`](../reviews/spacing-helper-implementation-sonnet-review.md)).

⚠ **This is a difference in construction, not a contradiction of M3.** M3 measured
the ordinary path, where both popups are already mounted; leg 1b measured 1249 ms
and 318 ms on that same path. Nothing in M1–M9 was contradicted by any leg.

---

## 4. Leg 3 — the disposition, and the tension in §10 that produced it

**Measured.** The straw man's document-global singleton guard **passed silently** —
in the foreign-only state there genuinely is exactly one visible popup, and it is
the wrong one. The click reached the foreign popup, the Margin preset moved from
None (0px) to Normal (8px), and the Padding preset — the control that was asked for
— did not move. The call then threw at P4's first assertion.

**§10's two clauses pull against each other.** It says leg 3 "must **silently
succeed**", and it also defines SCOPE-ONLY as retaining "wired P4" — and P4 fires
whenever the requested control did not end up showing the requested value. Under
that definition a literally silent leg 3 is unreachable in this state.

**Owner ruling, 2026-08-31: recorded as PASS on the guard reading.** What leg 3
exists to prove is that the ownership guard does work scope alone does not, and
that is exactly what was measured — SCOPE-ONLY did not **prevent** the wrong-control
operation, while REPAIRED in the identical state refused before any click, with
zero option clicks recorded. The P4 alarm that followed is **detection**, which is
leg 5's subject and is measured there separately. Nothing in §10 was reworded.

---

## 5. What the harness itself got wrong, and how it was caught

Three legs were built wrong first. All three were caught by the leg failing to
observe the state it claimed to test — not by reading the code — and all three are
recorded here because a harness that is trusted unexamined is the failure this
project has already paid for.

- **Leg 5b came back UNRUN.** The injected class was gone by the time the helper
  looked: rc-motion **rewrites `className`** as each motion phase ends. Repaired by
  settling first and holding the class with a `MutationObserver`, then recording
  that it was still present at the end of the leg. Had this not been checked, the
  leg would have been recorded as a pass on a state it never reached.
- **Leg 8 measured its own override.** The first construction widened _every_
  motion on the popup and its descendants, so the re-open animated for three
  seconds too and the option never became stable — a 30 s click timeout. §10 asks
  for the **leave** motion; targeting only `.ant-slide-up-leave` produced the state
  it names.
- **Leg 1's sampler control contaminated leg 1.** Running the control first
  pre-created the Padding popup's portal, which reversed document order and
  silently decided which popup CURRENT's `.first()` selected. Moved to run after
  the leg.

---

## 6. The weakest claims here, for the reviewer to attack

- ⚠⚠ **Legs 2, 3, 5 and 5b reach their state by suppressing the requested Select's
  own opening from the page.** That produces the foreign-only state reliably; it
  does **not** show how CI reaches it. The plan deliberately declines to explain
  that route, and this harness does not close it either.
- ⚠⚠ **Leg 5b's misattached class is simulated.** It shows what happens _if_ a
  foreign popup carries the requested class. It is not evidence about how likely
  that is.
- ⚠ **Leg 1b establishes its state by pre-mounting both popups.** That mirrors the
  real spec's order and the order is published, but it is still the harness
  choosing the condition under which the defect appears.
- ⚠ **Leg 7's unrelated popup is held visible test-side.** It is one of the app's
  own popup nodes, opened for real and then held, not a synthetic element — but
  nothing measures how long a genuinely-open unrelated popup persists in practice.
- ⚠ **Wall times are characterisation only.** Nothing here measures that 1500 ms
  and 5000 ms are the right budgets.
- ⚠ **The `_hitTargetInterceptor` question is answered only for these
  constructions.** A capture-phase listener on the Select's own root suppressed the
  opening in every leg that used it, with both pointer actions still completing —
  but that is an observation over these legs, not a general claim about Playwright.
