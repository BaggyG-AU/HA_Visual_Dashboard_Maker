# F9a brief — sixth scoped repair follow-up, 2026-09-10

**Author:** OpenAI Codex / GPT-6 Astra — independent reviewer; author of neither the brief nor these repairs.

**Reviewer:** n/a — no second-model cross-check commissioned or performed.

**Owner gate:** micah / BaggyG-AU decides dispositions and whether to lock the brief. Recommendations here are advisory.

**Commissioned by:** owner, through `prompts/codex/f9a-brief-review-followup6.md`.

**Scope:** `23c91c7..b39a6cf`, including `980d90a`, the self-review repair `b39a6cf`, Round 6 and its addendum, and their declared dependencies. Reviewed head `b39a6cf9b7921001a7ace4efedbf0dd02aa1f150` matched `origin/feature/f9a-brief` after fetch. `main` and `origin/main` remained `691c8d17ecc19b44bfd5e4c44df09566667221a2`. “Brief” below means `docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`; “dispositions” means `docs/reviews/f9a-brief-repair-dispositions.md`. Their coordinates refer to the reviewed head.

**Restrictions acknowledged:** this report is the repository deliverable. No target, source, test, governance, Issue, board or `[STATE]` edit; no push, merge or HA contact. No new governance mechanism proposed.

## 1. Verdict

**CLEAR-WITH-FINDINGS**

**P10, P11, P13 and P14 are RESOLVED; P12 is PARTIALLY RESOLVED, SEV 3.** New findings P15–P17 are also SEV 3 and concern the latest record, not a remaining defect in the repaired brief. **The brief is ready to lock with owner disposition of these record findings; no SEV 1 or SEV 2 remains.**

## 1a. Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                                      | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | -------------- |
| P12 | The corrected history still confuses original wording with errors caused by later repairs, and leaves one historical claim without an end date.      | SEV 3    | None   | 1                    | Fix now        |
| P15 | The self-check says the section uses no ranges, although its own claims use ranges.                                                                  | SEV 3    | None   | 1                    | Fix now        |
| P16 | The addendum calls every check a failing-to-passing proof, although two published measurements do not test whether the recorded claim was corrected. | SEV 3    | None   | 1                    | Fix now        |
| P17 | The new account calls an older counting discrepancy a result of this session and overlooks the review that already recorded it.                      | SEV 3    | None   | 1                    | Fix now        |

**Owner Decision Brief:** These findings protect the accuracy of the review history and the evidence used to assess it. **Product affected: No by these record discrepancies**; no product behavior changed, and this review does not establish that F9a works. Correcting the existing record through an append and appropriate memory corrections is small work with no code or test change. Accepting the documented residuals costs no correction; deferral leaves a recorded obligation for later. **Recommendation: lock the brief and correct the records under the existing record-only path**, subject to the owner's decisions by Ref. Doing nothing leaves misleading verification and attribution claims, but none changes the spec's agreed work. A record correction that changes no reviewed target or safeguard does not itself create another brief follow-up under `OPERATING_AGREEMENT.md:297–308`.

## 2. Method and verification

Read both repair diffs, the complete new Round 6 and addendum, the affected brief section and its introductory promises, the cited earlier disposition rows and the previous review. Reused the governing template and instructions read for the preceding review after confirming they were unchanged. Refreshed MemPalace status and the practice index by ID; applied the already-read class-sweep and verification rules and fetched the full self-check rule `drawer_practice_review_d73e10b60b5f38111c7049e3`. Read the current State and round-6 review drawer by ID. MemPalace reads were available despite the commission's assumption otherwise.

For provenance, compared the original brief, the pre-repair review head and both repair heads. For S1, independently read the recommendation tables in the six review files and the owner's disposition rows, then compared that enumeration with the published row-matching detector. For S2/S4, ran the literal `grep -c` patterns against the named blobs. For S3, applied its published match pattern to the §11 row. S1 and S3 are described detectors rather than complete shell commands; the reconstruction supplies their stated row scope, not a different property.

**Preservation:** the **71,771 bytes** of dispositions at `35fcf5a` are an identical prefix of the reviewed file: Rounds 1–5 are byte-for-byte intact. The **89,704 bytes** at `980d90a` are also an identical prefix, confirming that the Round 6 body was preserved when the addendum landed. The previous review is unchanged. Brief §§0–10 are byte-identical to `23c91c7`; the repair diff names the brief and dispositions. Source, tests, tooling, package files and governing documents did not change in this range.

**Published §11 command:** extracted and executed the fenced block verbatim. It remains unchanged across `23c91c7`, `980d90a` and `b39a6cf`. Output:

```text
Files /tmp/0bfeb6c/F5 and /tmp/de0736c/F5 differ
Files /tmp/0bfeb6c/F7 and /tmp/de0736c/F7 differ
exit: 1
```

Exit 1 is the expected `diff` result for different files. The removed sentence no longer asserts an overlapping unchanged range. Its quotation in the dated withdrawal note is explicitly historical.

**S1–S4 reproduction:**

| Detector and actual property                                                           | `980d90a`                | `b39a6cf`                | What this establishes                                                                                                                |
| -------------------------------------------------------------------------------------- | ------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| S1: disposition rows matching the stated recommendation alternatives, grouped by round | 5 rounds / 8 Ref-rulings | 5 rounds / 8 Ref-rulings | The historical override population. It does not inspect a separate record's claim about that population.                             |
| S2: lines matching `2026-09-0[0-9]\|September` in the brief                            | 33                       | 33                       | The date-pattern hit count.                                                                                                          |
| S2: lines matching `measured\|re-measur` in the brief                                  | 13                       | 13                       | The measurement-pattern hit count. Neither S2 count detects an appended withdrawal of an old count.                                  |
| S3: `F5 and F7[^.—\|]*` matches in the §11 fact row                                    | 2                        | 1                        | The specified repeated wording was removed. Read the row as well: the surviving named facts still satisfy the introductory promises. |
| S4: lines matching `reports \*\*F5 and F7 differ and nothing else\*\*` in the brief    | 1                        | 0                        | The remaining output restatement was removed. The old blob supplies the positive control.                                            |

S2 also returns **33/13 at both `35fcf5a` and `23c91c7`**, before either current repair. Those are measurements of these fixed blobs, not a live inventory intended to survive future edits.

**Gate:** `./tools/checks` returned **REAL_EXIT=0** in this review: lint, formatting, typecheck and unit tests passed; **0 errors / 145 warnings; 1559 tests / 105 files**. Log: `/tmp/havdm-f9a-followup6-checks.log`. The gate ran on the reviewed tree before this report was added; the report's separate Prettier check passed. Its published reproduction block was also extracted and executed successfully. No e2e or integration suite is needed for this docs-only branch, per [ai_rules.md](../../ai_rules.md) and brief §10.

**Evidence boundary:** no Electron, e2e, integration, live-HA, packaged-app or persisted-store execution. No new capability probe or repeat of the unchanged five-caller source trace was needed. I did not observe the author's original questionnaires, intermediate edits, command sessions or every historical gate execution. Retained logs corroborate recorded outcomes but do not authenticate each intermediate source tree. No palace-wide or GitHub Issue/board audit was performed. Claims about why the author missed a defect remain author explanations unless the record independently decides them.

## 3. Claim ledger and commissioned checks

Memory aliases: **R6 drawer** = `drawer_havdm_review_53615c455dca95133ee00239`; **State** = `drawer_havdm_state_a15b0af78e0814cfd19cf627`, item 11. Both were fetched by ID. The R6 drawer's author filing note explicitly supersedes the P12/P13 statements in `drawer_havdm_review_eb65d29b7371f18bb458c623`; the reviewer's original candidate remains separately delimited.

| Check                                                           | Tag                  | Result and evidence                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P10 deletion and §0/§4 promises                                 | MEASURED / JUDGEMENT | **No issue found.** Brief:758 still names the facts re-measured in F5/F7 and retains the F4 disclosure; :769–775 retains the command; :778–784 explains the deletion. The added duplicate in the row was removed by `b39a6cf`. The surviving historical provenance clause answers “§11 names which”; it does not reinstate the deleted unchanged-range assertion.                                                                                            |
| P11 appended correction                                         | MEASURED             | **No issue found.** Dispositions:457 identifies three P8 brief passages, of which the handoff omitted two. The earlier incorrect heading remains historical under the append-only correction. The distinct incomplete-sweep episode count is not being silently changed.                                                                                                                                                                                     |
| P12 per-finding provenance                                      | MEASURED / JUDGEMENT | The P7 date wording and the three P8 passages are present in `0bfeb6c`; P9's lesson heading belongs to State. Those facts are sound. The new claims about repair-caused defects and an unlimited absence of edits remain inaccurate: P12 below.                                                                                                                                                                                                              |
| P9 “not in the brief” scope                                     | MEASURED             | **No issue found with that location claim.** The reviewed finding concerns State's lesson heading/list. The original and current brief contain no such list; the token grep is corroboration, not the sole basis. This does not claim P9 never appears in a review or another record.                                                                                                                                                                        |
| P13 exit statement                                              | MEASURED             | **No issue found.** Dispositions:459, the R6 supersession and State now include DEFERRED alongside ACCEPTED-RESIDUAL. OA:297–308 supports the distinction between a decision/record and an actual target or safeguard repair. It does not permit evading a follow-up merely by labelling a repair a decision.                                                                                                                                                |
| P14 corrected gate account                                      | MEASURED / INFERRED  | **No remaining count defect found.** The four named prior logs show one red then three greens, with the first green on the second run. The author's explanation that later runs followed further edits is not independently pinned to intermediate trees by those logs.                                                                                                                                                                                      |
| Round 6's own gate statement                                    | MEASURED / JUDGEMENT | Retained `checks-r6.log`, `checks-r6-pinned.log`, `checks-r6-final.log`, `checks-selfrev.log` and `checks-final2.log` each report 1559 tests / 105 files passing. No contradictory retained run found. Dispositions:493–500 is supportable as a historical account of Round 6; removing a count does not make “every run returned zero” a guarantee about future runs. Today's independent gate is separately recorded above.                                |
| S1 override enumeration                                         | MEASURED             | **No issue found in the corrected population.** R1: P4/P5; R2: P6; R3: P3; R4: P3; R5: P7/P8/P9; R6: no categorical fix/defer/accept reversal. This is five of the six reviewed rounds and eight Ref-rulings. The original review recommendation tables and disposition rows agree. Choosing one of the offered P10 remedies is not a reversal of the “Fix now” recommendation.                                                                              |
| S1 record correction                                            | MEASURED / JUDGEMENT | State now points to the enumeration instead of asserting its own override total. The retained v225 intended snapshot carries the old claim; later snapshots and live State remove it as a current assertion. That content comparison corroborates correction; the S1 population counter alone does not prove it. Historical commissions and disposition text are preserved.                                                                                  |
| S2 withdrawal and provenance                                    | MEASURED             | The old hit-count claims are explicitly withdrawn at dispositions:559. The claim about which session caused the discrepancy and the declaration of no other citation are wrong: P17. The corrected claim that the two locators identify the two relevant introductory passages remains supported by reading them and the earlier full sweep.                                                                                                                 |
| S3/S4 closure                                                   | MEASURED / JUDGEMENT | **No issue found with the final edits.** §2's positive controls and current results confirm the named removals; reading §11 confirms that the retained fact names, pinned heads and disclosure remain coherent.                                                                                                                                                                                                                                              |
| Round 6 self-check: counts, universals, attributions and ranges | MEASURED / JUDGEMENT | The named P10–P14 row count, P8 passage count, P14 log count and three provenance rows agree with their lists. The “no only” claim is explicitly withdrawn, not active. The current universal cell still relies on P12's overstatement; the separate range clearance is false (P15). The all-detectors clearance overstates what the published instruments establish (P16). The P10 remedy attribution and P8-is-older citation agree with the review files. |
| Earlier substantive closures and preservation                   | MEASURED / JUDGEMENT | **No regression found within this diff.** P1–P9's brief repairs remain intact; the present P12 finding concerns the later history, not reopening P7/P8/P9. The required byte prefixes and unchanged brief §§0–10 were checked directly.                                                                                                                                                                                                                      |

**Weakest claims:** whether a further independent record review would pay for itself is a judgement. The author's “never swept the record” diagnosis at dispositions:444–450 is not independently proved: Round 5:374 had claimed to check both the brief and dispositions. The available evidence establishes an unsuccessful reported check; it cannot distinguish an omitted execution from an incomplete execution. The exact intermediate source that allegedly produced 30/12, and complete historical gate-to-tree attribution, remain unverified. None is promoted to proof by the current green gate.

## 4. Findings and prior dispositions

| Prior Ref | Disposition                | Basis                                                                                                    |
| --------- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| P10       | RESOLVED                   | Deletion plus the S3/S4 cleanup removes the false output summaries; the command and needed facts remain. |
| P11       | RESOLVED                   | Appended correction supplies the right passage population.                                               |
| P12       | PARTIALLY RESOLVED — SEV 3 | Original textual provenance is corrected, but the new causal and unbounded historical claims exceed it.  |
| P13       | RESOLVED                   | DEFERRED is restored to the account of existing owner choices.                                           |
| P14       | RESOLVED                   | The corrected recorded sequence agrees with the retained prior logs.                                     |

### P12 — SEV 3 — original wording does not establish absence of repair-caused defects

**Blocks: None.** Two constructions remain in the same provenance seam:

1. Dispositions:458, :473 and :486 say no repair introduced any of P7/P8/P9. Yet :469 correctly states that P7's originally true date declarations became false through subsequent repairs. The text's original authorship establishes that a repair did not **write the sentence**; it does not establish that a repair did not **introduce the discrepancy**. The explicit “repair-caused falsity” qualification is useful mitigation, but the new “none introduced” conclusion does not preserve that distinction. The R6 drawer's superseding claim (1) and State's P12 correction repeat the same conclusion.
2. Dispositions:470 says “no repair diff ever touched” the P8 passages. `git log -G 'following what it hands to Home|What reaches Home Assistant|Sites 1, 2, 3 and 5 decide' 0bfeb6c..b39a6cf -- docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md` identifies `35fcf5a`, whose diff repairs them. The valid historical comparison is through `de0736c`, before that repair. The R6 drawer repeats the unlimited phrase but supplies precisely that narrower comparison in parentheses. The original provenance is correct; the missing cutoff is the defect.

**Class/same seam swept:** statements assigning P7/P8/P9's origin and later changes, throughout the full brief, Round 6, the addendum, R6 drawer, State and the cited review. Checked the three provenance rows against the original and subsequent blobs. P9's State location is sound. The two constructions above are each SEV 3; no different product behavior or acceptance requirement follows from them.

**Bounded remedy:** keep the original-wording attribution separate from repair-caused falsity, and give the untouched-P8 claim its actual historical endpoint. **Reliances:** original brief, the dated repairs, and the already-correct per-finding detail. **Consumers:** the owner evaluating why the chain accumulated findings and the next record reader. **Must not change:** P7/P8/P9 closures, owner rulings, original text, or historical reviews/dispositions. Use an append and appropriate memory supersession. **Complexity 1:** record wording; the cited blob comparisons supply the proof.

### P15 — SEV 3 — the range self-check is contradicted by its own section

**Blocks: None.** Dispositions:488 states “No range expression is used in this section” and says ranges were avoided rather than re-checked. The section uses **P10–P14** at :427, :476 and in the self-check's own count cell at :485, **rounds 2–4** at :469, **rounds 1–4** at :506 and **P11–P14** at :510. These are active prose, not merely the quoted withdrawn F1/F7 range or a source-line citation.

**Class swept:** range expressions in the Round 6 body before its separately labelled addendum, including active claims, quoted historical claims and citations. The active examples above suffice even if quotations and citations are excluded. I found no incorrect membership in these active ranges; the defect is the claim that they do not exist and therefore needed no check.

**Bounded remedy:** correct the self-check account to the property actually verified. **Reliance/consumer:** Round 6's own range expressions / the reader relying on its self-check. **Must not change:** correct ranges, findings' identities, earlier bytes or the brief. **Severity/complexity:** SEV 3, complexity 1; a record-accuracy correction, not a reason to ban ranges or add a checker.

### P16 — SEV 3 — the four-detector clearance claims more than its instruments decide

**Blocks: None.** Dispositions:525–526 says every clearance is a measured before/after state change; :589–591 says each detector fired before its fix and not after. The detector population is S1–S4, reproduced in §2:

- **S3/S4:** the named source conditions change 2→1 and 1→0. Their stated removal evidence holds.
- **S1:** grouping the disposition rows returns 5 rounds / 8 Ref-rulings on both heads. That independently establishes the correct historical count. It does not examine whether State or another record still asserts three. The separate content comparison supports the correction, but it is a different check from the published counter.
- **S2:** the two greps return 33/13 on both heads and before this session. Withdrawing the old 30/12 claim changes the disposition record, while these greps read the brief. Their output cannot demonstrate that withdrawal. An unchanged measurement can refute an old claim; that is different evidence from a detector changing from firing to not firing.

**Class/same seam swept:** the before/after claim above the table, each of the four detector definitions, the closure narrative and the final four-detector clearance. The same blanket assurance appears in State's author-self-review paragraph and the `b39a6cf` commit message. The actual remedies can be checked by inspecting their content; I do not infer that the author ran no additional check. The finding concerns what the published evidence establishes, not an accusation about an unobserved session.

**Bounded remedy:** distinguish stable population measurements from correction/deletion checks; describe the separate content evidence where that is what proves the change. **Reliances:** the named blobs, detector input surfaces and actual edits. **Consumers:** the reviewer and owner assessing the claimed self-review proof. **Must not change:** correct S1 enumeration, S2 withdrawal, S3/S4 removals, immutable commits or the brief. **Severity/complexity:** SEV 3, complexity 1 for each unsupported S1/S2 clearance; correct the record and memory account, with no new test or verification mechanism.

### P17 — SEV 3 — S2's account misstates both its timing and its known reader

**Blocks: None.** Dispositions:521 says S1–S4 sit in text this session wrote, with an inherited-source qualification for S1. S2 at :531 says this session's repair added the date strings and measurement verbs that falsified the old counts. But the **30/12 assertion is already in `35fcf5a` dispositions:372**, unchanged at `23c91c7`, `980d90a` and `b39a6cf`; the brief returns **33/13 at all four heads**. The discrepancy therefore predates both repairs reviewed here. It did not arise from their additions. No source snapshot supplied here establishes the further assertion that 30/12 was true when originally measured.

Its radius declaration at dispositions:576–578 also says “nothing — no other artifact cites those figures.” The already-committed `docs/reviews/f9a-brief-codex-review-followup5.md:105` cites **30/12 and 33/13** and explicitly leaves the historical source snapshot unverified. That review is a known reader of the old claim. Its historical evidence remains correct and must not be edited; absence of an edit obligation does not mean absence of a reader.

**Class/same seam swept:** the origin, evidence and downstream declarations for S1–S4, checked against the pre-session head, both repair heads, the prior review and the named State/R6 accounts. S1's inherited-figure account is corroborated by the saved State versions; S3/S4's extra restatement exists at `980d90a` and is removed by `b39a6cf`. S2 is the member whose timing and declared reader are wrong. The blanket “all four in this session's output” also appears in State and the `b39a6cf` commit account. The new provenance error is distinct from the valid decision to withdraw the old counts.

**Bounded remedy:** record S2 as an inherited discrepancy already documented by the reviewer, preserve the uncertainty about its original measurement, and acknowledge that prior review in the radius without changing it. **Reliances:** fixed blobs and the prior review's measured result. **Consumers:** the owner assessing newly introduced versus inherited defects and the next reviewer using the radius. **Must not change:** S2's withdrawal, earlier disposition/review bytes, source, tests or the brief. **Severity/complexity:** SEV 3, complexity 1 for the timing and radius constructions; an appended record correction is sufficient.

## 5. Directions and proportionality

**The brief is ready to lock. I do not judge another full round on this brief likely to pay for itself.** P10's target repair is complete, and this follow-up has checked it. The live findings concern the explanatory record and its evidence, not the scope Sonnet must implement or an unresolved contradiction in the repaired brief.

I recommend that the owner disposition P12/P15/P16/P17, lock the brief and have the author correct these records in one append, with the corresponding current-memory corrections. OA:305–308 already distinguishes those records from target or safeguard repairs, so record-only corrections do not require another brief round. If a later change actually repairs the brief or a safeguard, its existing follow-up requirement remains. This is application of the current rule, not a new exemption.

The useful next product work is the spec's evidence and design: the layout-card fact, its unknown case, the capability seam and consistent warnings. The present findings should remain visible, but none warrants a new gate, checker, ledger, template section, product suite or architectural pivot.

## 6. Disagreements

I agree with the P10 deletion and S3/S4 cleanup, P11/P13/P14 corrections, S1's five-round/eight-ruling enumeration and the preservation of historical artifacts. I disagree with P12's complete closure, the no-range clearance, the all-detectors before/after claim and S2's causal/radius account. The detailed evidence limits those conclusions without reversing the valid corrections.

The author's “never checked the record” diagnosis is not independently established by this review. A reported check that missed an error and a check never performed are different explanations; either could be relevant to cost, and the retained output alone does not choose between them. The recommendation to lock rests on the repaired brief and the location of the remaining defects, not on proving that explanation.

## Verification commands

The repository gate is `./tools/checks`. Check this report with `npx --no-install prettier --ignore-path /dev/null --check docs/reviews/f9a-brief-codex-review-followup6.md`. The following reproduces the pinned count comparisons and preservation results:

```bash
python3 - <<'PY'
import re, subprocess

B = 'docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md'
D = 'docs/reviews/f9a-brief-repair-dispositions.md'
def blob(ref, path):
    return subprocess.check_output(['git', 'show', f'{ref}:{path}'])
for ref in ('35fcf5a', '23c91c7', '980d90a', 'b39a6cf'):
    lines = blob(ref, B).decode().splitlines()
    counts = [sum(bool(re.search(p, line)) for line in lines)
              for p in (r'2026-09-0[0-9]|September', r'measured|re-measur')]
    assert counts == [33, 13], (ref, counts)
    print(ref, 'S2:', counts)
for ref in ('980d90a', 'b39a6cf'):
    text = blob(ref, B).decode()
    row = next(line for line in text.splitlines() if line.startswith('| Every §4 fact'))
    s3 = len(re.findall(r'F5 and F7[^.—\|]*', row))
    s4 = len(re.findall(r'reports \*\*F5 and F7 differ and nothing else\*\*', text))
    assert (s3, s4) == ((2, 1) if ref == '980d90a' else (1, 0))
    print(ref, 'S3:', s3, 'S4:', s4)
    round_no, overrides = None, []
    for line in blob(ref, D).decode().splitlines():
        match = re.match(r'## Round (\d+)', line)
        if match:
            round_no = int(match[1])
        if line.startswith('| P') and re.search(r'reviewer recommended (fix-later|accept-as-residual)', line):
            overrides.append((round_no, line.split('|')[1].strip()))
    assert overrides == [(1,'P4'),(1,'P5'),(2,'P6'),(3,'P3'),(4,'P3'),(5,'P7'),(5,'P8'),(5,'P9')]
    print(ref, 'S1:', overrides)
for ref, size in (('35fcf5a', 71771), ('980d90a', 89704)):
    old = blob(ref, D)
    assert len(old) == size and blob('b39a6cf', D).startswith(old)
    print('PASS:', ref, size, 'prior disposition bytes intact')
PY
```

## MemPalace drawer candidates

MemPalace reads worked. The preceding `mempalace_checkpoint` in this conversation was refused: “Peer MCP writer active; this server is read-only for mutating tools.” I did not retry that writer, override the lease, kill a process or create a local memory file. This is not a claim of a seventh observed refusal. Under MP-LEASE, the write-enabled author may file the following verbatim with wing `havdm`, room `review`, `added_by="codex"`, source `docs/reviews/f9a-brief-codex-review-followup6.md`.

> [INVESTIGATION] HAVDM F9a brief sixth scoped follow-up, 2026-09-10 — OpenAI Codex / GPT-6 Astra reviewed 23c91c7..b39a6cf, both repair commits, Round 6 and its addendum, and the declared record dependencies. Deliverable: docs/reviews/f9a-brief-codex-review-followup6.md. Verdict CLEAR-WITH-FINDINGS. P10/P11/P13/P14 RESOLVED. P12 PARTIALLY RESOLVED, SEV 3: original sentence authorship does not establish absence of repair-caused falsity; P8's untouched-history claim needs its pre-repair cutoff. New P15/P16/P17, each SEV 3, complexity 1, Blocks None: P15 the self-check's no-range assertion is false; P16 the blanket four-detector before/after clearance exceeds the instruments, with S1/S2 returning unchanged measurements while S3/S4 show the specified 2-to-1 and 1-to-0 removals; P17 S2's 30/12-versus-33/13 discrepancy predates both repairs, and its no-other-citation declaration misses the prior review at followup5.md:105. The S1 enumeration is independently confirmed: five of the six reviewed rounds, eight Ref-rulings, with round 2 P6 rather than P5. The command in brief section 11 is unchanged and runs; the false output summary is removed, the F5/F7 fact names and F4 disclosure remain, and brief sections 0–10 are unchanged. All 71771 prior disposition bytes at 35fcf5a and all 89704 bytes at 980d90a remain exact prefixes. Prior substantive closures retained within the regression scope. Gate independently REAL_EXIT=0, 0 errors/145 warnings, 1559 tests/105 files; report formatting and published reproduction passed. Reviewer recommends owner lock with disposition of the remaining record findings, and bounded appended record corrections. Another full brief round is not judged likely to pay for itself; an actual target/safeguard repair still receives its existing follow-up. No source, test, brief, dispositions, governance, Issue, board or State edit; no push, merge or HA contact. No Electron/e2e/integration suite needed or run. Historical intermediate measurements and log-to-tree identity remain unverified. No new memory write was attempted after the earlier writer-lease refusal; this candidate is the MP-LEASE fallback.
