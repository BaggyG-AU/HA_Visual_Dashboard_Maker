# Independent artifact review — PR #136

**Author:** Codex (OpenAI), 2026-08-07
**Reviewer:** REQUIRED — a different model; not yet run
**Owner gate:** owner adjudication of this review and merge of PR #136

**Artifact reviewed:** PR #136, `feature/parameterise-host-refs` at
`a881ed651e07d83d3c55c2fe1e50f9f923deab55` against
`f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf`.

**Verdict: CHANGES-REQUIRED — HIGH confidence.**

The four source literals named in the PR body are gone from the 15 edited
Markdown files, and the replacements are locally accurate. The change is not
acceptable as committed for three independent reasons: it edits all three
completed UAT plans despite the binding rule that those evidence records are
never edited; it leaves the writable HA instance's LAN IP in one edited file;
and its Markdown-only sweep leaves 26 non-Markdown tracked files carrying the
same values, including the three tester-facing HTML matrices generated from the
now-edited plans. The five-file evidence exclusion is therefore principled in
what it excludes but inconsistent in what it admits.

## Findings

### F1 — BLOCKING: all completed UAT plans were edited contrary to the binding evidence rule

**MEASURED.** `docs/testing/UAT_STRATEGY.md:97-102` says:

> A previous round's plan is **the record of what was tested** and is never edited
> after the round has run — doing so would falsify the evidence.

The repository contains three completed UAT plans, and this PR changes all
three: 3 checked, 3 affected. Their headers identify completed rounds and the
builds under test at
`docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md:3-17`,
`docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md:3-23`, and
`docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md:3-27`. Examples of the
committed rewrites are at
`docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md:73-105`,
`docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md:118-150`, and
`docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md:155-187`.

This is the same evidence-preservation class invoked to justify the five
exclusions, not an unrelated concern. Revert the three historical-plan edits.
If their current-tree literals need contextualisation, use a prospective
convention document or an explicitly marked redaction record that does not
silently rewrite what the completed round asked the tester to run.

Reproduce the population and affected set:

```bash
git ls-tree -r --name-only a881ed651e07d83d3c55c2fe1e50f9f923deab55 |
  rg '^docs/testing/uat/plans/.*\.md$' | sort
git diff --name-only \
  f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf...a881ed651e07d83d3c55c2fe1e50f9f923deab55 \
  -- 'docs/testing/uat/plans/*.md' | sort
```

Both commands emit the same three paths.

### F2 — BLOCKING: the IP class remains open inside the edited set

**MEASURED.** The base version of the 15 edited files contained 11 occurrences
of `192.168.1.70` and 3 of `192.168.1.190`. The head removes all 11 occurrences
of `.70` but retains all 3 occurrences of `.190`, all in
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-04.md:39`,
`:67`, and `:205`.

That contradicts the new repo-wide convention, which says the maintainer's
network details “are not recorded” and that real values live outside committed
documents (`docs/testing/LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md:10-25`). It also
means the claim that host/IP references were parameterised is incomplete within
the edited set. Checked every RFC1918 `192.168.*.*` literal in all 15 edited
files; 1 file and 3 occurrences remain affected.

Reproduce the before/after value population:

```bash
base=f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf
artifact=a881ed651e07d83d3c55c2fe1e50f9f923deab55
changed=( $(git diff --name-only "$base...$artifact") )
git grep -hEo '192\.168\.[0-9]{1,3}\.[0-9]{1,3}' "$base" -- "${changed[@]}" | sort | uniq -c
git grep -hEo '192\.168\.[0-9]{1,3}\.[0-9]{1,3}' "$artifact" -- "${changed[@]}" | sort | uniq -c
```

The first command reports `3 192.168.1.190` and `11 192.168.1.70`; the second
reports `3 192.168.1.190`. Either parameterise the test-instance IP too (with a
distinct placeholder) or narrow and justify the privacy rule so it does not
claim real network values are absent.

### F3 — BLOCKING to the stated current-tree claim: the Markdown-only boundary leaves 26 non-Markdown files affected

**MEASURED.** The disclosed `*.md` boundary was real, but it does not close the
class claimed by “cleans the current tree” or “stops the growth.” The same host,
IP, and user-path values occur in 26 tracked non-Markdown files:

- 20 TypeScript files, 3 HTML files, 2 JSON files, and 1 shell file;
- 4 files under `src/`, 16 under `tests/`, 5 generated/archival UAT files under
  `docs/`, plus `playwright.config.ts`;
- active values as well as provenance text: the writable test host is hardcoded
  at `tests/support/liveHa.ts:24`, the reference IP is entered by an integration
  test at `tests/integration/entity-caching.spec.ts:219`, and a fixture records
  the hostname at `tests/fixtures/uat/instance-manifest.json:5`;
- generated/evidence artifacts: the tester remark remains in
  `docs/testing/uat/archives/uat_issues_v1.0.0-r2_2026-07-31.sh:62` and
  `docs/testing/uat/sessions/uat_session_v1.0.0-r2_2026-07-31.json:82,206`;
- all three HTML matrices still carry the old hostname/IP at
  `docs/testing/uat/matrices/uat_matrix_v1.0.0_2026-07-27.html:16,1959`,
  `docs/testing/uat/matrices/uat_matrix_v1.0.0-r2_2026-07-31.html:16,2001`, and
  `docs/testing/uat/matrices/uat_matrix_v1.0.0-r3_2026-08-03.html:16,1961`.

The matrix residue matters operationally. The plans call themselves the source
of truth and say a disagreeing matrix is a bug
(`docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md:21-26`,
`docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md:27-32`, and
`docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md:31-36`). The binding
workflow likewise calls each HTML matrix the tester's working tool generated
from its plan (`docs/testing/UAT_STRATEGY.md:78-88`). The PR therefore changes
the sources while leaving all 3 generated consumers inconsistent.

The matrix self-check passed 63/63 on each file, but that check derives its
expectations from the matrix itself and explicitly does not judge whether the
questions are right (`docs/testing/UAT_STRATEGY.md:139-152`). It cannot detect
this source/output drift.

Reproduce the complete non-Markdown match set and counts:

```bash
artifact=a881ed651e07d83d3c55c2fe1e50f9f923deab55
pattern='ha-test\.home\.local|ha\.home\.local|192\.168\.1\.70|([A-Za-z]:)?[/\\]+Users[/\\]+micah([/\\]|$)|/home/micah(/|$)'
git grep -nI -E "$pattern" "$artifact" -- ':!*.md'
git grep -lI -E "$pattern" "$artifact" -- ':!*.md' |
  sed 's/^[^:]*://' | sort -u

# Reproduce the suffix and top-level category counts.
git grep -lI -E "$pattern" "$artifact" -- ':!*.md' |
  sed 's/^[^:]*://' | sed -E 's/.*\.//' | sort | uniq -c
git grep -lI -E "$pattern" "$artifact" -- ':!*.md' |
  sed 's/^[^:]*://' |
  awk -F/ '{print ($1=="src"||$1=="tests"||$1=="docs")?$1:"root-config"}' |
  sort | uniq -c
```

The second command emits 26 paths. Grouping that output by suffix yields the
20/3/2/1 count above. The same pattern returns no tracked YAML files. Searching
the tracked filename list itself returns no matching filename:

```bash
git ls-tree -r --name-only a881ed651e07d83d3c55c2fe1e50f9f923deab55 | rg -n \
  -e 'ha-test\.home\.local|ha\.home\.local|192\.168\.1\.70|Users[\\/]micah|/home/micah|(^|[._/-])micah([._/-]|$)'
```

No filename hit was found.

### F4 — MAJOR: 3 of 4 clearly governed edited artifacts lack the required header

**MEASURED + JUDGEMENT.** The binding rule says every governance change and
every triage document opens with separate `Author:`, `Reviewer:`, and
`Owner gate:` lines (`docs/governance/OPERATING_AGREEMENT.md:94-125`). Four
edited files clearly belong to those named classes:

- `docs/governance/OPERATING_AGREEMENT.md` is a governance change and carries
  all three at `:5-10`;
- `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md`
  is a governance amendment and opens with other metadata at `:1-17`, but none
  of the required three lines;
- `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-04.md`
  is a governance amendment and likewise lacks them at `:1-19`;
- `docs/testing/uat/reports/uat_triage_v1.0.0-r3_2026-08-03.md` identifies
  itself as triage at `:1-17` and lacks them.

Checked all 15 edited files for the three literal header keys: 2 contain all
three (the Operating Agreement and the adversarial-review template), 13 contain
none. I classified only the 4 unambiguous governed artifacts above; 3 are
affected. The rule states no grandfathering or “only when first created”
exception. The independent review file containing this finding carries the
three required lines.

Reproduce the literal header scan:

```bash
changed=( $(git diff --name-only f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf...a881ed651e07d83d3c55c2fe1e50f9f923deab55) )
for f in "${changed[@]}"; do
  printf '%s\t' "$f"
  sed -n '1,25p' "$f" |
    rg -o 'Author:|Reviewer:|Owner gate:' |
    sort -u | paste -sd, -
done
```

## Answers to the commissioned questions

### 1. Does the committed change do what it claims?

**PARTIAL / CHANGES-REQUIRED.** It makes the claimed substitutions for the four
named source literals in 15 Markdown files, but it does not clean the current
tree, does not close the IP class inside the edited set, and violates the
completed-plan evidence rule. Findings F1-F3 are the measured exceptions.

### 2. Does it contradict binding repository text?

**YES.** F1 quotes the direct conflict between the prohibition at
`docs/testing/UAT_STRATEGY.md:97-102` and all 3 edited completed plans. F2 quotes
the conflict between the new “real values ... never in a committed document”
rule at `docs/testing/LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md:10-25` and the
three retained test-instance IPs in amendment-04. F4 records the artifact-header
conflict with `docs/governance/OPERATING_AGREEMENT.md:118-125`.

No additional contradiction was found in `ai_rules.md`, `CLAUDE.md`, the global
`AGENTS.md` pointer supplied to this review, `OPERATING_AGREEMENT.md`, or the
rest of `docs/governance/**` after searches for the four source literals,
placeholder names, UAT evidence rules, and governed-header rules. There is no
repository-local `AGENTS.md` in the tracked tree (`rg --files -g AGENTS.md`
returned no path).

### 3. Does the exemption/scope boundary hold in both directions?

**NO.** The five residual Markdown files are exactly the five disclosed files:
3 independent reviews and 2 verbatim tester-record files. That inward boundary
is mechanically complete. The outward boundary fails because all 3 completed
plans are also protected evidence under `UAT_STRATEGY.md:97-102`, yet all 3 were
edited. The Markdown-only boundary also admits 26 same-value non-Markdown files,
including 3 direct generated consumers of edited plans.

Reproduce the five-file Markdown residual set:

```bash
artifact=a881ed651e07d83d3c55c2fe1e50f9f923deab55
pattern='ha-test\.home\.local|ha\.home\.local|192\.168\.1\.70|([A-Za-z]:)?[/\\]+Users[/\\]+micah([/\\]|$)|/home/micah(/|$)'
git grep -lI -E "$pattern" "$artifact" -- '*.md' |
  sed 's/^[^:]*://' | sort -u
```

### 4. Is anything ambiguous, unenforceable, or impossible for a reader?

**AMBIGUOUS, not impossible.** The placeholder legend defines all four tokens
and tells a reader to substitute environment values
(`docs/testing/LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md:10-23`). The owner who
runs UAT supplies the HA connection details, so the changed instructions remain
executable for that intended reader. A fresh clone cannot independently audit
which concrete hostname is the writable versus read-only target from the docs,
because the legend points only to “the app's own connection settings” and an
unnamed gitignored local config (`:22-23`). That weakens the enforceability of a
safety boundary described as “scoped by HOSTNAME” in
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-04.md:64-78`.
The remaining hardcoded test hostname at `tests/support/liveHa.ts:24` happens to
remove the ambiguity on this checkout, but contradicts the claimed cleanup.

### 5. Is replacement complete and correct within the edited set?

**The four named literal substitutions: YES. The broader IP class: NO.**

Reproduce the zero-hit named-literal check:

```bash
base=f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf
artifact=a881ed651e07d83d3c55c2fe1e50f9f923deab55
changed=( $(git diff --name-only "$base...$artifact") )
git grep -nI -E \
  'ha-test\.home\.local|ha\.home\.local|192\.168\.1\.70|([A-Za-z]:)?[/\\]+Users[/\\]+micah([/\\]|$)|/home/micah(/|$)' \
  "$artifact" -- "${changed[@]}"
```

It emits no match. Manual diff review found no incorrect mapping among those
substitutions. F2 records the unclosed `.190` IP class.

### 6. Was the class swept beyond Markdown?

**NO.** F3 gives the complete command, 26-file population, category counts,
representative active values, JSON/session/script/generated-artifact hits, and
the clean YAML and filename results. This review examined every tracked file,
not untracked/ignored files or git history.

### 7. Are the edited documents still actionable?

**Operationally yes for the intended owner, evidentially no.** The legend makes
the placeholders interpretable, and the owner supplies the connection values.
All 3 HTML matrices still pass their 63-assertion structural self-check. But the
3 completed plan records are no longer faithful historical evidence and now
disagree with the tester-facing matrices (F1/F3); that is a correctness defect,
not merely reduced convenience.

### 8. Is the five-file exclusion principled or convenient?

**JUDGEMENT: principled in selection, but conveniently and inconsistently
bounded.** The residual Markdown set exactly matches the disclosed set, and the
review/tester contexts support preserving those words. However, the PR body
overstates the cited authority: the Operating Agreement says review commits are
never squashed or amended in a way that erases reviewer authorship
(`docs/governance/OPERATING_AGREEMENT.md:52-59`); it does not make all later
redaction categorically forbidden. More importantly, the same evidence rationale
was not applied to the 3 plans that `UAT_STRATEGY.md` explicitly calls immutable.

### 9. “Docs only, no gate impact”

**PASS for the committed diff's file/gate surface.** GitHub and local enumeration
both report 15 changed files, all tracked Markdown under `docs/`; no `src/`,
test, fixture, tool, workflow, package, or gate-configuration file changed.

```bash
git diff --name-only \
  f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf...a881ed651e07d83d3c55c2fe1e50f9f923deab55
git diff --name-only \
  f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf...a881ed651e07d83d3c55c2fe1e50f9f923deab55 \
  -- . ':(exclude,glob)docs/**/*.md'
```

The second command emits nothing. This establishes no gate-logic change; it does
not establish semantic correctness. A fresh `./tools/checks` run on this branch
plus this review returned real exit 0: lint 0 errors / 145 warnings, format check
passed, typecheck passed, and 1,316 unit tests in 100 files passed. The three
matrix self-checks passed 63/63, but, per `UAT_STRATEGY.md:145-152`, those checks
cannot detect plan/matrix text drift.

### 10. Required governed-artifact headers

**FAIL.** F4 records the 4 clearly governed edited artifacts checked and the 3
without the required header. This review file itself has all three lines.

## Evidence boundary and weakest claims

**MEASURED this session:** PR body and GitHub changed-file metadata; local
base/head SHAs and full diff; the 15-file named-literal sweep; the complete
tracked Markdown and non-Markdown sweeps; all tracked filenames; RFC1918 IPs in
the edited set; all completed UAT plans; literal header keys in all 15 files;
63/63 self-checks for each of the 3 HTML matrices; and `./tools/checks` at real
exit 0 (0 lint errors / 145 warnings, format and typecheck passed, 1,316 unit
tests in 100 files passed).

**Not verified:** ignored/untracked files, git-history cleanup (the PR explicitly
disclaims it), actual DNS resolution, Home Assistant connectivity, secret/local
config contents, the historical truth of tester/reviewer quotations, or the
author's claimed earlier `./tools/checks` invocation. No e2e or integration suite
was run; this is a documentation/governance review.

**Weakest claims, in order:**

1. **JUDGEMENT:** treating a touched pre-existing amendment/triage file as a
   governed artifact that must now carry the §3.1 header. The rule says “Every”
   and states no grandfathering exception, but it does not explicitly state a
   retrofit-on-touch cadence.
2. **JUDGEMENT:** the placeholders weaken safety enforceability for a fresh
   reader. The owner can still act because they possess the local values.
3. **INFERRED:** the five-file selection was convenient as well as principled.
   The inconsistency with the explicitly immutable plans is measured; motive is
   not knowable from the artifact.
