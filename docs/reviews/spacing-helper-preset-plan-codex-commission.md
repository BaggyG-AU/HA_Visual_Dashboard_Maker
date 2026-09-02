# COMMISSION — Independent review of the spacing-helper preset plan (round 1)

Author: Claude Opus 5 (1M context) — the plan's author, and therefore an
interested party
Reviewer: OpenAI Codex / GPT-5.6 Sol
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

This is the **SPEC-BEFORE-CODE** review required by `CLAUDE.md` (owner's ruling
2026-08-16, in force). The plan under review proposes a change to a **shared test
DSL**, which `docs/governance/OPERATING_AGREEMENT.md` §3.7 names explicitly as
capability-class shared machinery. **The review happens BEFORE any code is
written, and no code will be written until this review returns
ACCEPTS-REVISION.** That is the tripwire.

---

## The owner's profile — write for the reader who actually rules

**The owner gate is held by a NON-DEVELOPER.** Never require the owner to
classify a diff or apply developer instinct. Anything routed to the owner uses
the **Owner Decision Brief** form, in six fields:

1. what this protects in product terms;
2. what is going wrong, plainly;
3. is the product affected — Yes / No / Unknown, with honest evidence status;
4. options with costs;
5. recommendation and why;
6. what happens if you do nothing.

---

## Reviewer write-restrictions (please acknowledge)

No `[STATE]` drawer update; no UAT card marked or re-scored; no `src/` change;
no merge; `ha.home.local` is READ-ONLY (`ha-test.home.local` is the writable
one). **Proposed changes go in your review document, nowhere else** — never by
amending the plan and never by amending an existing commit.

**Where your MemPalace notes go (ruling MP-LEASE).** If MemPalace is absent, or
present with the **write** refused by the per-palace writer lease — the normal
case when author and reviewer run concurrently — record them in a
`MemPalace drawer candidates` section at the end of **your review document**,
not in the PR body; the write-enabled author files them with
`added_by="codex"`. ⚠ Never kill a process to free the lease and never set
`MEMPALACE_MCP_ALLOW_PEER_WRITER`.

**Execution rules — EVERYTHING HEADLESS.** Quoted verbatim from the project's
standing-rules record:

> 1. ⚠⚠ **EVERYTHING HEADLESS:** `bash tools/test-headless.sh <spec…>
--project=electron-e2e|electron-integration --workers=1`. MULTIPLE SPECS IN
>    ONE INVOCATION WORK. 2. **INTEGRATION IS A SEPARATE PROJECT — run
>    SEQUENTIALLY.** 3. **DO NOT RUN THE UNIT SUITE WHILE AN ELECTRON SUITE IS
>    LIVE.** 4. **TO SEE THE APP: `npm run start:wsl`.**

A suite you cannot run headless is declared **UNRUN**; it is never launched
headed.

⚠ **You are not required to run any suite for this round.** The plan proposes no
code. Reading, and reading the installed dependency source, is the method. If you
do choose to run a probe, it is headless or it is UNRUN.

---

## 0. Working practice this review is held to

These are the cross-project `practice` rules that bear on a reviewer. They are
**quoted here rather than cited**, because a reviewer judges against exactly what
the prompt supplies and a cited rule reaches nothing.

1. **A finding is a sample, not the population.** When you find a defect,
   identify the CLASS it belongs to — all rows of that table, all call sites, all
   specs of that kind — and sweep every member before reporting. Say which you
   did: "X is wrong" and "I checked all 9 call sites; only X is wrong" are
   different reports, and only the second lets the author stop. **And a mechanical
   sweep is only as good as the key it is keyed on** — grepping the token the
   first instance used is not a sweep of a class defined by what its members DO.
   State the class as a behaviour before choosing a search key.
2. **No unverified universals.** "Only", "every", "all", "none" or any count is a
   measurement and needs the enumeration that backs it, attached to the claim.
   **And first ask whether the property is mechanically decidable at all** — if no
   command can decide it, publish a labelled hand trace rather than a script that
   approximates one. Mechanical trigger: **source-text search + runtime-behaviour
   claim = STOP.**
3. **A check is evidence only for the property it exercises.** Before writing
   "verified", ask: **if this claim were false, would what I ran have failed?**
   Confirming the wiring is not confirming that a value flows through it. **Apply
   this to every clearance you GIVE, not only to every verification you write** —
   "RESOLVED" on a narrower check reads as clearance of the wider claim.
4. **Verify each finding against the source before reporting it.** Quote
   `path:line`. A finding you cannot locate is a question and should be written as
   one. Check whether what you are calling an inconsistency is a deliberate
   decision recorded somewhere you were not shown.
5. **Silence is not a result.** State "no issue found" explicitly for every
   question you were asked, so the reader can trust the question was checked. Zero
   findings on a mature artifact is a PASS, not a failed review — never
   manufacture a finding to justify the pass.
6. **Declare your evidence boundary.** What you could not run, reach or verify.
   `UNVERIFIABLE` is a result; a quietly dropped claim is not.
7. **An attack that FAILED is not a proof of safety, and the attack most likely
   to fail is the one whose MAGNITUDE is wrong.** When a hostile construction does
   not break the mechanism, ask which parameter you chose and whether the opposite
   value would have been crueller. The defeating case sits just **under** a
   guard's own resolution, not at an extreme.

---

## Expected state — STOP and tell the owner if any of this is untrue

- Branch `feature/spacing-helper-preset-plan`, off `main` = `08a9544` (Merge
  pull request #153).
- **PLAN ONLY. No code has been written.** No `src/`, no `tests/`, no
  `tests/baseline/expected-failures.json` change.
- ⚠ **This tracked record deliberately pins NO head and states no file or commit
  count.** A document committed to a branch cannot pin that branch's head from
  inside itself — committing it moves the head. The exact reviewed commit is in
  the untracked paste prompt at `prompts/codex/spacing-helper-preset-plan.md`,
  which sits outside the population it describes. **Regenerate, do not match a
  count:**

  ```bash
  git log --oneline main..HEAD
  git diff --name-status main..HEAD
  git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$' || echo "docs-only: CONFIRMED"
  ```

- `tests/baseline/expected-failures.json` on `main`: **7 `expectedFailures`** (one
  behavioural — calendar), **10 `expectedFlaky`**, **21 `expectedSkips`**. The
  identity under discussion is on **none** of them.
- Gate on `main`: `REAL_EXIT=0`, 4/4 steps, lint 0 errors / 145 warnings, unit
  1413 passed / 104 files.

---

## What you are reviewing

**`docs/testing/SPACING_HELPER_PRESET_PLAN.md`** — the whole document.

### Required reading, in this order

1. The plan itself.
2. `tests/support/dsl/spacing.ts` — the file the plan proposes to change.
3. `tests/e2e/spacing.spec.ts:94-117` — the failing test.
4. `src/components/SpacingControls.tsx:122-229` — the product-side controls the
   helper drives.
5. `tests/support/dsl/tabs.ts:1-40` and `tests/support/dsl/popup.ts:1-40` — the
   sibling instances the plan names but does not propose to fix.
6. The installed dependency source the plan cites:
   `node_modules/@rc-component/select/lib/SelectInput/Input.js`,
   `lib/Select.js`, `lib/OptionList.js`, `lib/BaseSelect/index.js`,
   `lib/SelectInput/index.js`, `lib/SelectInput/Content/SingleContent.js`;
   `node_modules/@rc-component/trigger/lib/Popup/index.js`.
7. `CLAUDE.md` — the SPEC-BEFORE-CODE ruling and its MANDATORY COMPANION clause.
8. `docs/governance/OPERATING_AGREEMENT.md` §3, §3.4, §3.7.
9. `docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md` — the plan this one is modelled
   on, if you want the precedent for §5/§6/§8's shape.

### Background you need, quoted so you do not have to hunt it

**The defect.** `e2e/spacing.spec.ts` › `Card Spacing Controls` › `applies
spacing presets` has **SEVEN sightings**, all with byte-identical signatures
(`Expected: "8px" / Received: "0px"` at `tests/support/dsl/spacing.ts:223`), over
the complete artifact population (every downloadable `merged-report-*` artifact
of the `Regression Suites` workflow): runs 178, 188, 190, 200, 201, 209, 228 —
`31870375328`, `31880748615`, `31883429764`, `31928526052`, `31929619479`,
`31943622937`, `32403080633`. Every sighting has attempts `failed, passed`. It is
on no allowlist, so it reddens a gate run on its own.

**The diagnosis (2026-08-23).** The failure screenshot from run 228 shows the
panel reading `Margin: Normal (8px)` / `Padding: None (0px)` when the test had
asked for margin 16 px and padding 8 px. **The padding preset click landed on the
MARGIN control.** The product did exactly what it was told. It is a test defect.

**The owner's ruling (2026-08-26): fix the shared helper, do NOT allowlist it.**

**⚠ The plan disagrees with one sentence of the recorded diagnosis**, and that
disagreement is the plan's spine. The diagnosis says two candidate routes exist
and _"BOTH ROUTES PRODUCE EXACTLY THE OBSERVED END STATE, AND BOTH ARE REPAIRED
BY THE SAME CHANGE"_ — the change it recommends being _"scope the option search to
`getVisibleSelectDropdown()`'s own subtree"_. **The plan argues that is false for
the second route**, and adds a third. See plan §2.3. **Attack that first.**

---

## The questions

Answer every one explicitly, including "no issue found".

**Q1 — §2.3's three-route correction. Is it right?**
The load-bearing claim: if `openSelectDropdown` opened the **wrong** select
(route b) or the click was **swallowed** and a stale popup satisfied the
visibility check (route c — swallowed, or toggling an open popup shut), then only
one popup is open, `.last()` **is** that popup, and scoping the option search to
it clicks the wrong option **exactly as before**. Therefore scope alone is
insufficient and the repair must prove **ownership**. Is that sound? Is there a
reading of the existing helper under which routes (b)/(c) cannot occur at all —
in which case the plan is heavier than it needs to be and should say so?
Conversely, is there a **fourth** route the plan has not named? ⚠ Attack §2.3's
sub-claim that route (b) is reachable essentially only through the `force: true`
fallback at `:49`, which the retry loop's `catch` at `:43-45` delivers control
to; the author flags the Playwright half of that as INFERRED.

**Q2 — §4.2's DOM authority chain. Verify every row against the installed
dependency, not against the plan.**
Seven claims are tabulated with `path:line` citations. Each is MEASURED-from-source
and **none has been observed in the running Electron app**. Check each citation
says what the plan says it says. In particular:

- Is `aria-controls` really `undefined` when closed (`Input.js:188`), which is
  what makes it double as the open-state proof?
- Is the `id="${id}_list"` node really the **hidden 0×0** listbox when virtual
  (`OptionList.js:288-296`), and is `virtual` really true for these Selects
  (`Select.js:456`, and `SpacingControls.tsx` setting neither `virtual` nor
  `popupMatchSelectWidth`)?
- Does `data-testid` land on **exactly one** node
  (`BaseSelect/index.js:448` → `SelectInput/index.js:154`, `:178`, with the
  `RootComponent` branch at `:166-175` not taken)? **If it lands on two, the plan's
  `select.locator('input[role="combobox"]')` is a strict-mode violation and P1
  cannot work as written.**
- Is `.ant-select-content-value` the right node for P4, and is
  `.ant-select-content` really the wrong one because it also holds the placeholder
  (`SingleContent.js:53`, `:89`; `Placeholder.js:31`)?

**Q3 — The setup-isolation defence. The author names this as the strongest
counter-attack; take it.**
§4.4's `openSelectDropdown` opens with `waitForAllSelectDropdownsToClose()` — a
**document-global** wait, which is the very authority §4.2 rejects. The defence is
that setup isolation and assertion authority are different roles. Does that
distinction hold? ⓘ The author already attacked it on the strongest ground he
found — that an `opacity: 0` popup would make the wait unsatisfiable, which is
`tabs.visual:33`'s recorded signature — and the attack **refuted**
(`node_modules/antd/lib/select/style/dropdown.js:81-82` sets `display: none`).
**Rule 7 applies: an attack that failed is not a proof of safety.** Find the
crueller one. And separately: with the retry loop removed, this five-second
global wait is now on the critical path of every mode and preset change and is
coupled to the `slide-up` leave animation — what does that cost, and what happens
on a page where an unrelated Select's popup is legitimately open?

**Q4 — The blast radius. Is §5.1 correct AND complete?**
The plan asserts **exactly two** consumer files and publishes the command that
produces them. It also **corrects the project's own record**, which named
`tests/e2e/canvas-resize-and-nesting.spec.ts` as a third consumer; the plan says
that file's only `spacing` occurrence is a docblock comment at `:23`. Verify both.
⚠ The published command is a **lexical** enumeration and would miss an aliased
caller (`const s = ctx.spacing`). Look for one. Finding a third caller is a real
defect in that section.

**Q5 — The §6 harness. Is it genuinely bidirectional, and can every leg fail?**
This is the MANDATORY COMPANION and the plan will be implemented against it, so a
defect here is expensive. Specifically:

- **Legs 2 and 3 together are the discriminator, and leg 3 is the half that does
  the work**: it runs the _narrower_ scope-only repair against leg 2's state and
  asserts it **also** silently succeeds. If leg 3 refutes, §2.3 is wrong and the
  plan goes back to the owner. Does leg 3 actually decide that?
- **Legs 2/3's construction** is a page-side `stopPropagation` capture listener,
  chosen so the state is not reached by the very bypass under test. Is it honest?
  The author flags as a JUDGEMENT that a swallowed click and a toggled-shut popup
  are equivalent from `resolveOwnedDropdown`'s point of view — attack it.
- ⚠ **The gap the author named and did not close:** both popups open _and_ the
  owned one mid-leave, where `aria-controls` may already be unset while the popup
  is still `:visible`. No leg covers it. Is it reachable, and does it need one?
- **Leg 5** claims to prove P4 detects independently of P1/P2. Does it?
- **Leg 6** is the known-bad-input control. Is it enough? A probe that cannot fail
  on known-bad input proves nothing about a pass — and an empty extraction and an
  erroring command both print nothing.
- **Leg ordering.** PR #153's harness recorded a repaired leg passing when it
  should have failed, because a previous leg had already closed the popup. Is the
  plan's re-establish-and-assert rule sufficient to prevent that here, or is there
  a specific ordering that still defeats it?
- Are legs 1 and 3's page-side constructions honest — do they reproduce the state
  under test without changing what is being measured?
- ⭐ **Rule 7 applies here.** Where the plan proposes a hostile construction, ask
  whether its magnitude is the cruel one or the comfortable one.

**Q6 — Scope (§5.2). Is S1 the right call, and is the class stated correctly?**
The plan sweeps the class and finds `tabs.ts` and `popup.ts` carrying the same
construct near-verbatim, then recommends **not** fixing them now. Is the class
stated as a _behaviour_ or merely as a _token_? Is the recommendation defensible,
or is this the "expensive linter" failure in reverse — knowingly leaving members
of a swept class? ⚠ Note the plan explicitly does **not** claim `tabs.visual:33`
and the `popup.spec.ts` sighting share this root cause; check it has not smuggled
that claim in elsewhere.

**Q7 — Over-reach. Does the fix round add scope nobody asked for?**
§4.4 removes the retry loop, the `Escape` presses and the `force: true` fallback.
Removing `force: true` is squarely in scope. The plan argues the retry loop is
**the defect's delivery path** — its `catch` swallows the hit-target error, and
its only exit after two failures is the `force: true` click — and therefore in
scope too. Is that argument sound, or is it a rationalisation? Should it be an
owner decision?

**Q8 — The governance question at §7.4.**
Is this fix-lane or slice-lane work under
`docs/governance/OPERATING_AGREEMENT.md` §3.7? The subject is a test DSL, named
in §3.7 under the slice lane's capability class; §3.7's hybrid ban says fix-lane
work discovered to be capability-shaped halts and re-enters as its own slice. The
plan recommends treating it as fix-lane and gives its reason. ⚠ **This is an owner
call, not yours to make** — but say whether the plan has framed the options
fairly, and whether its reading of §3.7 is defensible on the text.

**Q9 — Owner-facing quality.**
§0 is the plain-English section the SPEC-BEFORE-CODE ruling requires. §4.3 and
§5.2 are Owner Decision Briefs. Do they meet the six-field form, and can a
non-developer actually rule on them? Is any of them secretly asking the owner to
apply developer instinct?

**Q10 — Anything the author could not predict.**
The nine questions above are the author's prediction of the findings. Your own
case list is a **floor, never a ceiling**. The most valuable finding is the one
not on it.

---

## What the author already ran

Per the practice rule _"the review commission you write is the checklist you owe
yourself — and writing it down is not running it"_: Q1–Q9 were executed against
this plan before this commission was handed over, and what they caught is
recorded in the plan's **§10** — fourteen items, of which one (SR-8) added a
whole harness leg that measures the plan's central claim and that the draft did
not have, and one (SR-14) is a repair this table reported as done before it had
actually been applied, caught by a separate reading pass over the finished file.
The commission was **not** weakened afterwards; four items were added to the
plan's §8 as new attack surface rather than closed.

⚠ **Treat that as a claim, not clearance.** On PR #139 an author wrote each
round's winning test case into his own commission three rounds running and ran
none of them; on PR #153 the self-check found real defects on three consecutive
rounds and still missed the one that blocked.

---

## Deliverable

A committed document on this branch:
**`docs/reviews/spacing-helper-preset-plan-codex-review.md`** — never a chat
reply, never an amendment to the plan or to an existing commit.

**Verdict first**, in three sentences or fewer:
**ACCEPTS-REVISION / CHANGES-REQUIRED / SEV-1-BLOCKED**. It is a hard gate —
implementation begins only on ACCEPTS-REVISION.

Then: confidence and method (what you actually read and ran — never claim a run
that did not happen), your evidence boundary, a claim ledger tagging every
load-bearing claim **MEASURED / INFERRED / JUDGEMENT** and closing with your own
weakest claims, and the findings ranked most severe first.

**Findings** are numbered **SP-1** onward. Per finding: evidence at `path:line`,
the problem, a concrete fix, **what must NOT change**, and **class swept** — the
class the instance belongs to and whether every member was checked.

**Severity contract (STRAT-D18, binding):**

- **SEV 1 — blocks.** The target is internally contradictory, contradicts a
  binding ruling it does not explicitly supersede, rests on a demonstrably false
  factual claim, or is unexecutable as written — **and** carries the three-part
  proof: (1) the decision or claim broken, (2) the violated fact or text at
  `path:line`, (3) why no recorded mitigation covers it. Missing any part → at
  most SEV 2.
- **SEV 2 — does not block.** Rests on an unverified or overstated claim, or an
  unmitigated risk. Each goes to the owner as an Owner Decision Brief in the six
  fields.
- **SEV 3/4 — recorded, no round-trip.**
- **Authority boundary:** owner judgment calls are not reviewable defects above
  SEV 4 — attack the facts a choice rests on, never the authority to make it.
- The severity model governs what **blocks**, never what may be **reported**:
  report full signal, tagged.

Close with a `MemPalace drawer candidates` section, or an explicit "none".

⚠ **Under STRAT-D7, every post-review repair receives a same-reviewer scoped
follow-up — no exemptions, no classification boundary. Depth is proportional and
you decide it inside that round.** Expect to be asked back.
