Author: Claude Sonnet 5
Reviewer: (none — §3.4 scoped follow-up)
Owner gate: micah / BaggyG-AU

# §3.4 scoped follow-up — spacing-helper repair rounds (PR #155)

**Commissioned by:**
[`docs/reviews/spacing-helper-repair-followup-sonnet-commission.md`](spacing-helper-repair-followup-sonnet-commission.md).
**Scope:** `1aa8b5f5c60b6bc7a87693841d0e95c970e3f75b..HEAD` on
`feature/spacing-helper-preset-plan`, verified at commit
`5ce0d5f1d1a7aa3e069b2bfed046d029edf8370e` (`git status --porcelain` empty,
matching PR #155's live `headRefOid`, re-fetched via `gh pr view 155`). Base
`main` confirmed at `08a9544643ef01aed843fa9babf1892291ed3e7f`. The range holds
four commits: `0e96aae` (implementation review), `86b897e` (Round 1 repair),
`d2829a0` (attribution correction and independent ratification), `5ce0d5f`
(this commission plus two weakest-claims bullets).

**Execution rules — EVERYTHING HEADLESS.** No Electron probe of my own was
built this round (none was needed — see method below); the one long-running
check (`./tools/checks`) was run detached and polled, never in the foreground
past two minutes.

---

## 1. Verdict first

**PARTIALLY-CONFIRMS.** F2 and F3 are RESOLVED — both narrowed sentences are
word-for-word faithful to this review's own "Concrete fix" text, independently
re-verified against `tests/e2e/spacing.spec.ts:109,112`, `main`'s
`waitForAllSelectDropdownsToClose`, and the plan's §6 kind table. F1 is
**PARTIALLY RESOLVED**: the underlying _property_ (the four CSS classes map
1:1 onto their own controls, with no missing, duplicate, shared, or swapped
mapping) is now robustly evidenced by two independent constructions plus my
own scrutiny of the swap-check's mechanics — but condition 2's specific
_sequencing_ requirement (hooks added alone, smoke run **before** the helper
exists) is still evidenced only by the disqualified author's commit message. I
independently confirmed via `git log` that no artifact on this branch could
show that ordering: commit `82c0e49` shipped the class hooks and the helper
rewrite together, in one commit — there was never a separate "hooks-only"
state to test after the fact. No regression found anywhere in the
previously-clean population; scope held exactly to what was declared (verified
independently, not taken on the commission's word). One non-blocking process
finding (F4, SEV 3) on the seat question the commission explicitly asked me to
judge for myself.

---

## 2. Disposition table

| Finding                                                                                   | Prior severity | This round's disposition | Basis                                                                                                                                  |
| ----------------------------------------------------------------------------------------- | -------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| F1 — condition 2's HALT-bearing class-smoke check had no record in the results document   | SEV 2          | **PARTIALLY RESOLVED**   | §1.1+§1.2 independently evidence the _property_; the _sequencing_ claim remains evidenced only by commit `82c0e49`'s message — see Q1. |
| F2 — leg 1b's sentence overstated how closely it mirrors the real spec's call sequence    | SEV 2          | **RESOLVED**             | Word-for-word match to this review's own concrete-fix text — see Q4.                                                                   |
| F3 — leg 4 never differentiates CURRENT from REPAIRED despite its FAIL-OLD/PASS-NEW label | SEV 3          | **RESOLVED**             | Word-for-word match to this review's own concrete-fix text — see Q4.                                                                   |

---

## 3. Regression and scope-control sweep

**Method.** `git diff 1aa8b5f..HEAD -- docs/testing/SPACING_HELPER_HARNESS_RESULTS.md`
shows exactly **three** hunks: (1) the §1.1/§1.2 insertion before §2's Results
table, (2) the leg 1b/leg 4 sentence rewrites inside §3, (3) a 21-line
insertion in §6 (the two new weakest-claims bullets). No table row, no leg's
recorded result, and no text outside those three hunks changed.

**Previously-clean population re-checked** (per the commission's instruction
to re-check the original review's "no issue found" list): Q1's clause-by-clause
match, Q7's product-safety conclusion, Q8's P4-narrowed-promise sweep, and legs
5/5c/6/8/9 plus the §5 self-corrections all sit entirely outside the three
hunks above — confirmed unchanged, no regression. Q7's product-safety
conclusion additionally rests on `src/components/SpacingControls.tsx` being
unchanged, independently reverified below.

**Blast radius, independently verified (not taken from the disposition file):**

```
sha256sum src/components/SpacingControls.tsx tests/support/dsl/spacing.ts   # at HEAD
git show 1aa8b5f:src/components/SpacingControls.tsx | sha256sum
git show 1aa8b5f:tests/support/dsl/spacing.ts | sha256sum
```

HEAD: `c52db0bc…` / `9756c68c…`. `1aa8b5f`: **identical**, both files — matching
the exact hashes the disposition file itself cites. `git diff --stat 1aa8b5f..HEAD -- tests/baseline/expected-failures.json tests/support/dsl/tabs.ts tests/support/dsl/popup.ts`:
empty. `git diff --name-only 1aa8b5f..HEAD | grep -i BackgroundCustomizer`: no
match (exit 1) — none of `src/components/BackgroundCustomizer.tsx`,
`tests/unit/BackgroundCustomizer.spec.tsx`, or
`tests/support/dsl/backgroundCustomizer.ts` is in the range. No `.png`/`.snap`
file in the range. `docs/testing/SPACING_HELPER_PRESET_PLAN.md`: not in the
range. **Radius declaration confirmed accurate — no finding.**

**Files touched, regenerated myself:** `git diff --name-only 1aa8b5f..HEAD` →
exactly the three review documents plus
`docs/testing/SPACING_HELPER_HARNESS_RESULTS.md`. `git diff --stat`: 1329
insertions, 7 deletions across those four files. Matches the commission's own
prediction exactly.

---

## 4. Answers to the commission's Q1–Q8

**Q1 — Is F1 actually resolved?** No — PARTIALLY. Applying "if this claim were
false, would what was run have failed?" to each: §1.1's counting would fail on
missing/duplicate/shared, and does not claim swap (corrected). §1.2 Part B's
functional check — open one Select, locate its option **only** through
`.ant-select-dropdown.<own-testid>-popup`, read back which control moved —
would, under any swap, either fail to locate the option at all (if the
swapped-in class isn't on the popup that actually opened) or record the wrong
control moving; neither is what the four passing rows show. I scrutinized this
mechanism myself (§ below, Q2) and found no route by which a swap produces the
table's recorded output. So the _property_ clears the "would this have failed"
test. **But condition 2 as written is a sequencing requirement** — "Add ONLY
the two option-B class hooks first, **then** run the four-control Electron
class smoke" — and neither §1.1 nor §1.2 was run in that tree state; both were
run at the shipped head, with the whole repair present, exactly as the
document's own §6 already discloses. I independently checked whether any
artifact on this branch **could** attest the original ordering:

```
git log --oneline 08a9544..1aa8b5f -- src/components/SpacingControls.tsx tests/support/dsl/spacing.ts
```

returns exactly one commit, `82c0e49`, which touches both files **together**.
There is no separate commit that added the class hooks alone. F1's original
complaint — "the only record is the disqualified author's commit message" —
therefore still holds for the sequencing claim specifically, even though the
property it protects is now unusually well-evidenced. **Disposition: PARTIALLY
RESOLVED**, not RESOLVED.

What would close it: reconstruct the pre-helper tree state in a temporary,
untracked worktree (`git show 82c0e49^:tests/support/dsl/spacing.ts` restores
the old helper; the class hooks are already in `src/` at any commit from
`82c0e49` onward) and re-run the four-control smoke against that
reconstruction. This is mechanically available — both endpoints are known,
named commits — but doing it would require temporarily dirtying
`tests/support/dsl/spacing.ts`, one of the two files this follow-up is
explicitly barred from editing or touching ("no edit to any file under
review"). I did not attempt it for that reason and leave it as the concrete
path for a future round if the owner wants full closure; it is cheap (the same
few minutes of harness work every leg in this document already costs).

**Q2 — Was the over-reach correctly identified, and correctly closed?** Yes on
both. The argument that counting cannot decide a swap is correct: the
four-element union is invariant under any permutation of the class→node
assignment, so "4 distinct nodes" is exactly as true under a swap as without
one. §1.2's swap check is a genuine detector, not another instance of
substitution 6 (a narrower check reported in the wider claim's words): I
traced its mechanics rather than trusting the prose. Each row opens **one**
Select and locates its option exclusively through
`.ant-select-dropdown.<that Select's own testid>-popup`. Under a swap, that
locator either resolves to zero elements (the class the row is scoped to isn't
on the popup that actually opened) or, if it does resolve, the resulting click
lands in a popup that is not the one the operator intended — either way the
recorded "before/after, other-half-moved" columns cannot reproduce the four
passing rows in the table (each shows the _operated_ control moving to the
_target_ value and the _other_ half staying put). I found no construction
under which a swap produces that exact output. POS-1's per-row differing
before/after values additionally rule out a vacuous pass. **No issue found.**

**Q3 — Is the `aria-controls`/`useId` trap true, including the "why" Opus left
unverified?** True, and I closed the gap. `@rc-component/util`'s `useId`
(`node_modules/@rc-component/util/es/hooks/useId.js:29-30`) does read
`if (process.env.NODE_ENV === 'test') { return 'test-id'; }` — confirmed by
direct read, both branches (native `React.useId` present or not) carry this
check. The harder half — **which build step makes that true in the built
renderer bundle** — was not verified by the Opus round and I traced it fully:

1. `tests/support/electron.ts:186-195` — the function whose own comment at
   `:171` calls it **"the ONLY way to launch Electron in tests"** — passes
   `env: { ...baseEnv, NODE_ENV: 'test', ... }` to `electron.launch`. This is
   the launch path `launchWithDSL` (imported by `tests/e2e/spacing.spec.ts`)
   actually uses (`tests/support/index.ts:55,119`).
2. That alone sets the **main process's** `process.env.NODE_ENV`, but the
   renderer's React/rc-component code runs from a **pre-built** bundle
   (`.vite/build/main.js`, `.vite/renderer/...`), not a live dev server whose
   `process.env` a browser context could read at runtime. The decisive
   mechanism is the **build** step: `tests/setup/global-setup.ts:58-73`
   rebuilds that bundle via `execSync('npm run package', { env: { ...process.env, NODE_ENV: 'test' } })`
   whenever `src/`, the vite configs, or `package(-lock).json` are newer than
   the existing build output. `npm run package` → `electron-forge package`
   (`package.json:11`, `forge.config.ts:7,31` — `@electron-forge/plugin-vite`)
   → a `vite build` of the renderer under that same ambient environment.
3. Vite's own build-time `define` step reads the **ambient** `process.env.NODE_ENV`
   in preference to its internal `mode`:
   `node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:47283-47290` —
   `const nodeEnv = process.env.NODE_ENV || config.mode; ... define['process.env.NODE_ENV'] = JSON.stringify(nodeEnv);`.
   Because `global-setup.ts` sets `NODE_ENV=test` in the process that invokes
   this build, Vite bakes the literal string `'test'` into every
   `process.env.NODE_ENV` reference in the compiled renderer bundle —
   including inside `useId.js`.

That is the full chain from the OS environment variable to the literal
`'test'` comparison inside the shipped renderer, and it matches the
empirically observed symptom (`aria-controls="test-id_list"` on all four
Selects) exactly. **No issue found** — and Q3's answer moves from INFERRED (an
argument that it's "probably true") to MEASURED (a traced, verified mechanism)
as a result of this round.

**Q4 — Are F2's and F3's narrowed sentences faithful?** Yes, both. F2's
review-recommended text: _"mirrors the control order of the real failing
spec; the overlap itself is manufactured by omitting the settling wait the
DSL's own call sequence performs between calls. How CI's seven recorded
sightings reach a two-popup state remains unestablished, as is already
disclosed for legs 2/3/5/5b for a different reason."_ Shipped text
(`SPACING_HELPER_HARNESS_RESULTS.md:344-365`) matches this near-verbatim,
correctly cites `tests/e2e/spacing.spec.ts:109,112` and `main`'s settling wait,
and adds nothing the review didn't ask for. F3's review-recommended text: _"add
leg 4 to the results document's exclusion sentence alongside leg 1 ('rests on
leg 1b, leg 2 and leg 7 — not on leg 1 or leg 4')."_ Shipped text
(`:367-368`) is that exact clause. **No issue found**, no under-reach, no
over-reach.

**Q5 — Did the repair rounds stay inside their declared blast radius?** Yes —
see §3 above; independently re-verified by hash and by diff, not taken from
the disposition file's own claim. **No issue found.**

**Q6 — Is the results document still internally coherent after the
insertions?** Yes. The diff is exactly the three hunks described in §3; no
table row or measured result outside them changed. I checked for
self-referential line-number citations inside
`SPACING_HELPER_HARNESS_RESULTS.md` that ~182 inserted lines could have
shifted — found none (the file cites the plan file and the review file by
name, never itself, by line number). The one cross-file citation made **after**
all insertions — the disposition file's `SPACING_HELPER_HARNESS_RESULTS.md:212-213`
for leg 4's PASS/PASS rows — I checked against the current file and it is
exactly right. **No issue found.**

**Q7 — Does an Opus re-derivation cure the conflict, for the purpose of me
reviewing it?** Judgement, as invited: **partially, not completely.** It is
real for the _facts_: Opus built its own probe from scratch, reproduced
Round 1's counts independently, and caught a genuine over-reach Round 1 missed
in its own writing — that is substantive, not a relabel, and I've now added a
third independent layer on top of it in this round (the swap-check mechanics,
the git-history sequencing check, the NODE_ENV chain). But it is not complete
for the _prose_: by the dispositions file's own account
(`spacing-helper-preset-plan-repair-dispositions.md:206`), "the prose of
Round 1 and of §1.1 was physically composed by the Sonnet session" and Opus
**adopted** rather than rewrote most of it. HAVDM's Stage-8 eligibility rule
disqualifies on **model identity**, not session freshness, because a model can
carry a characteristic blind spot into a review of content sharing its own
"voice" — and this branch already has a concrete instance of exactly that: a
Sonnet session wrote a claim ("no shared **or swapped** mapping") its own
instrument could not support, and did not catch it in its own writing. A
different model (Opus) caught it. For any part of the adopted prose Opus chose
not to rewrite, I am — as a Sonnet session — reading Sonnet-authored wording
with a Sonnet reader, which is the same pairing that let the original
over-reach through once already. See F4 below; not blocking, because I
independently re-verified the substance myself rather than relying on the
prose being trustworthy.

**Q8 — Does the PR body describe what actually landed?** Yes. Re-fetched fresh
(`gh pr view 155 --json body`, not a cached copy); `headRefOid` returned
`5ce0d5f1d1a7aa3e069b2bfed046d029edf8370e`, matching this review's own head
exactly. The body's F1/F2/F3 summary, the attribution-correction paragraph,
and the "do not merge until the follow-up has run" halt text all match what
I've independently verified above. **No issue found — no fix needed.**

---

## 5. Findings

### F4 — SEV 3. The seat-conflict cure is substantiated for facts, not fully for prose

**Evidence:** `docs/reviews/spacing-helper-preset-plan-repair-dispositions.md:206`
("the prose of Round 1 and of §1.1 was physically composed by the Sonnet
session"); the swap over-reach at the same file's lines 163-179, which that
same Sonnet-authored prose introduced and did not itself catch.

**Problem:** the Stage-8 reviewer-eligibility rule that disqualified Codex/Sol
from PR #155's original review turns on model identity specifically because a
model can carry systematic blind spots into a review of its own "voice." This
branch already demonstrates the mechanism concretely: a Sonnet session wrote a
claim its own instrument could not support, and a _different_ model, not
another Sonnet pass, caught it. Wherever Opus adopted rather than rewrote that
Sonnet-authored prose, a Sonnet follow-up reviewer (this seat) is not the
instrument best positioned to catch a recurrence of that same class of error,
even in a genuinely fresh session with no memory of writing it.

**Is the product affected?** No. I did not rely on the prose being
trustworthy — I independently re-derived the swap-check's soundness (Q2), the
sequencing gap (Q1), and the NODE_ENV mechanism (Q3) from source and from git
history myself in this round, so nothing in this branch currently rests on
unverified Sonnet-authored prose.

**Concrete fix:** none needed on this branch — already mitigated by this
round's independent re-verification. For the general pattern: when a repair's
authorship is corrected this way in the future, have the re-deriving model
rewrite the adopted prose in its own words rather than adopting it verbatim,
or route the mandatory §3.4 follow-up to a third model when the repair session
and the follow-up reviewer still share a model identity even after a
correction.

**What must NOT change:** nothing on this branch — this is a process
observation about how the _next_ occurrence of this scenario should be
handled, not a defect requiring an edit here.

**Class swept:** checked the rest of the adopted (non-rewritten) prose — §1.1's
full text, the Round 1 disposition table rows, and the blast-radius statement —
for the same "wider claim reported by a narrower instrument" pattern beyond
the already-caught swap over-reach. Found none; the swap claim appears to be
the sole instance, already caught and closed.

---

## 6. Owner Decision Briefs

**F1 — the very first safety check's timing is still unproven, though what it
protects is not in doubt.**

- **What this protects:** confidence that a specific early-warning check — did
  the four new labels land on the right dropdown, checked _before_ the real
  fix code was written, so a mistake would be caught early rather than
  papered over later — actually happened in the right order.
- **What's going wrong, plainly:** two different sessions have now checked,
  independently, that the four labels currently work correctly. But nobody has
  been able to go back and prove the _original_ check — the one meant to catch
  a mistake early — was actually run at the right moment. The only account of
  that is a sentence in a commit message from the same person whose other
  writing in this exact spot already needed one correction.
- **Is the product affected? No.** I independently confirmed the current code
  is correct by reading the source and by scrutinizing two independently-built
  tests. This is a question about _when_ a check ran, not evidence of anything
  wrong in the app.
- **Options:** (a) leave it — no functional risk, and it's already honestly
  written down as an open gap in three places on this branch; (b) reconstruct
  the original state from git history (the exact commits already exist) and
  re-run the check against it, closing the question for good.
- **Recommendation:** (a) for this PR — don't hold up a working fix over
  paperwork that is already disclosed; (b) as a small follow-up whenever
  convenient, so the record stops carrying an open question.
- **If nothing is done:** no risk to what ships. The one remaining question —
  was the very first safety check run in the right order? — stays open and
  answerable only by trusting a commit message, exactly as before this round.

**F4 — the reviewer-independence question, asked and partly answered.**

- **What this protects:** confidence that the person double-checking a repair
  isn't, even unintentionally, more likely to wave through the kind of mistake
  its own AI model tends to make.
- **What's going wrong, plainly:** part of this repair's paperwork was
  originally written by the same AI model that is now double-checking it (an
  accidental mix-up on your end, already caught and fixed). A different model
  re-did the underlying checks from scratch and found one real mistake in that
  original wording — good evidence the fix genuinely works. But most of the
  original wording was kept rather than rewritten, so when I check that
  wording for precision, I am partly checking my own model's writing with my
  own model's eyes.
- **Is the product affected? No.** I personally re-checked the substance
  myself this round rather than trusting the existing wording.
- **Options:** (a) accept this round's verdict as-is — the underlying facts
  were independently verified twice over; (b) have a third model take one more
  pass at the wording alone, for full peace of mind.
- **Recommendation:** (a) — the facts are solid, and a third pass on wording
  alone isn't proportional to what's actually at stake.
- **If nothing is done:** no risk to what ships. Worth remembering next time
  this mix-up happens: have the correcting session rewrite the adopted text in
  its own words, not just check it and keep it as-is.

---

## 7. Gate re-run — independent, this round

`./tools/checks > /tmp/sonnet_followup_checks.log 2>&1; echo REAL_EXIT=$?`, run
detached and polled (`grep -cE "^> (eslint|prettier --check|tsc --noEmit|vitest run)"`
→ **4**): **REAL_EXIT=0**, lint **0 errors / 145 warnings**, unit **1413
passed / 104 files** — identical to every prior figure on this branch,
reproduced fresh, independently, this round.

---

## 8. MemPalace filing

`mempalace_status` returned live with the `havdm` wing present and a write
test succeeded (writer lease free). Filed directly:

- `[DECISION]` drawer recording this round's verdict, disposition table, the
  new NODE_ENV/Vite mechanism trace, the regression/scope sweep, and F4 —
  `drawer_havdm_review_6fa17afeedaf18b83fd33c96`, `havdm`/`review`.
- A diary entry summarising this session for the next agent —
  `diary_havdm_20260903_033027542845_24963cccc4a4`.
