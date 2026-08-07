# Independent artifact review — PR #135

**Author:** Codex (OpenAI), 2026-08-07
**Reviewer:** REQUIRED — a different model; not yet run
**Owner gate:** owner adjudication of this review and merge of PR #135

**Artifact reviewed:** PR #135, `feature/contributor-fallback` at
`cc5577c8489beaa70ae38e3de0517942f9be1d6a` against
`f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf`.

**Verdict: CHANGES-REQUIRED — HIGH confidence.**

The `ai_rules.md` change gives the ordinary fresh-clone/no-tool reader the clean
exit the PR claims, and the wing and quotation duties are correctly qualified.
The matching `CLAUDE.md` text does not: its absence branch says the cadence is
both “not owed” and “has not lapsed.” The two-case diagnostic also equates repo
config presence with a transient load delay and repo config absence with
permanent unavailability, leaving permanent failures, external/global config,
and partial config misclassified or uncovered. Both changed governance
artifacts also lack their mandatory independence headers.

## Findings

### F1 — BLOCKING: the absence branch retains the exact “has not lapsed” defect

**MEASURED.** `ai_rules.md:319` says that when all project config and tools are
absent, every MemPalace-dependent duty “is simply not owed,” and then says not
to retry or work around it. That is the claimed clean exit.

The supposedly matching `CLAUDE.md` branch says:

> the sequence below is **not** owed, has not lapsed, and must not be retried

at `CLAUDE.md:58-63`.

“Not owed” extinguishes the obligation; “has not lapsed” says the obligation
remains pending. They cannot both govern the same absent-MemPalace state. This
is also a direct contradiction between the new `ai_rules.md:319` authority and
the new `CLAUDE.md:61` operational wording. Delete the lapse clause from the
absence branch or explicitly say that lapse is inapplicable because there is no
duty.

I swept every use of the disputed phrase in both changed artifacts: the two
delay uses at `CLAUDE.md:50-53` and `ai_rules.md:317` are correctly scoped to a
server still connecting; the absence use at `CLAUDE.md:61` is the affected
member.

Reproduce the complete phrase population:

```bash
git grep -n 'has not lapsed' \
  cc5577c8489beaa70ae38e3de0517942f9be1d6a -- CLAUDE.md ai_rules.md
```

### F2 — MAJOR: config-file presence does not distinguish delay from absence in both directions

**MEASURED text + JUDGEMENT over the state boundary.** `CLAUDE.md:22-36` asks a
tool-less reader to choose between two cases:

- “the maintainer and the config exists” means MCP “simply hasn't loaded” and
  requires reload; or
- no `.mcp.json` / `mempalace.yaml` means no project memory, so skip and carry
  on.

`ai_rules.md:317-323` similarly distinguishes “still connecting” from total
absence, but observes only the present tool/config state. The ordinary cases
are covered: project config plus a genuinely connecting server waits; no config,
no tools, and no other registration exits. The boundary fails in both other
directions:

- **Under-inclusive clean exit:** repo config may exist while the executable is
  missing, startup has failed permanently, the client does not support MCP, or
  the config is invalid. Those readers are told the state is a transient load
  delay and to reload, with no terminal fallback.
- **Over-inclusive absence:** repo config may be absent while MemPalace is
  registered globally or by the host client and is still connecting. Those
  readers are told the whole section is not owed even though the delayed tool
  may appear.
- **No branch:** exactly one of `.mcp.json` and `mempalace.yaml` may exist after
  an incomplete setup or cleanup. The two bullets do not say which case governs.

The identity labels are also not entailed: a contributor can create/copy config,
and a maintainer can work from a new machine without it. The observable and
enforceable distinction is capability state (configured and connecting, live,
permanently unavailable), not maintainer identity. The PR therefore solves the
named typical contributor state but does not actually make delay versus absence
the exhaustive boundary it claims.

The repository facts supporting the typical case are correct:
`.gitignore:116-122` ignores both project config files, neither is present in
the reviewed Git tree, and `docs/governance/MEMPALACE_PROTOCOL.md:13-14` says
the palace/config are machine-local.

Reproduce the committed config-file check:

```bash
git ls-tree -r --name-only cc5577c8489beaa70ae38e3de0517942f9be1d6a |
  rg '(^|/)(mempalace\.yaml|\.mcp\.json)$'
git show cc5577c8489beaa70ae38e3de0517942f9be1d6a:.gitignore |
  nl -ba | sed -n '116,122p'
```

The first command emits no path; the second shows both ignore rules.

### F3 — MAJOR: the fresh-clone fallback names no usable local store

**MEASURED + JUDGEMENT.** The new clean-exit branch directs the reader to “use
local memory files” (`CLAUDE.md:31-36`; `ai_rules.md:323-325`). `CLAUDE.md:19-20`
names `MEMORY.md` as the bootstrap fallback. But the reviewed Git tree contains
no `MEMORY.md` or other identified local-memory file, and `.gitignore:109-122`
does not ignore one. No binding document found by the command below says where
an arbitrary agent should create the fallback, what format it uses, or how to
keep it local rather than accidentally committing it.

```bash
git ls-tree -r --name-only cc5577c8489beaa70ae38e3de0517942f9be1d6a |
  rg '(^|/)(MEMORY\.md|memory/|memories/)'
git grep -n -i -E 'local memory|MEMORY\.md|memory files|bootstrap-only' \
  cc5577c8489beaa70ae38e3de0517942f9be1d6a -- \
  '*.md' ':!docs/reviews/**'
```

The first command emits no path; the second returns only the high-level policy
and refresh-plan references, not a storage contract. A reader can still perform
the project task, so this is not a task blocker. The persistence fallback that
the new text says “governs” is nevertheless ambiguous and can create an
unignored file. Define a gitignored local path/format, name a tool-native memory
facility, or state that no persistent fallback is owed when none exists.

### F4 — MAJOR: both changed governed artifacts lack the required header

**MEASURED.** The PR body classifies this as a substantive governance change.
The binding rule says every governance change opens with separate `Author:`,
`Reviewer:`, and `Owner gate:` lines
(`docs/governance/OPERATING_AGREEMENT.md:94-125`). `CLAUDE.md:1-14` and
`ai_rules.md:1-25` contain none of those keys. Checked both changed files; both
are affected. The PR body carries the metadata, but it is not either committed
governed artifact.

Reproduce the header scan at the reviewed commit:

```bash
artifact=cc5577c8489beaa70ae38e3de0517942f9be1d6a
for f in CLAUDE.md ai_rules.md; do
  printf '%s\t' "$f"
  git show "$artifact:$f" | sed -n '1,25p' |
    rg -o 'Author:|Reviewer:|Owner gate:' |
    sort -u | paste -sd, -
done
```

Both rows have an empty key set. This review file carries all three lines.

## Answers to the commissioned questions

### 1. Does the committed change do what it claims?

**PARTIAL / CHANGES-REQUIRED.** `ai_rules.md:317-331` separates the named
still-connecting and completely absent cases, grants the complete-absence case
a real no-retry exit, scopes wing selection to a live palace, and makes verbatim
quotation conditional on the briefing agent being able to read the rules. Those
claims pass for the stated typical cases. `CLAUDE.md:58-63` retains “has not
lapsed” in the absence branch (F1), and the two-case diagnostic is not exhaustive
(F2).

### 2. Does the wording contradict binding repository text?

**YES.** The direct conflict is between “everything ... is simply not owed” at
`ai_rules.md:319` and “not owed, has not lapsed” at `CLAUDE.md:61`. The header
conflict is between `OPERATING_AGREEMENT.md:118-125` and the headerless openings
at `CLAUDE.md:1-14` and `ai_rules.md:1-25`.

No further conflict was found against `ai_rules.md`, the rest of `CLAUDE.md`,
`docs/governance/OPERATING_AGREEMENT.md`, or the remaining
`docs/governance/**` MemPalace references. In particular, the fallback still
satisfies the Operating Agreement's requirement that agents without write
access surface drawer candidates (`docs/governance/OPERATING_AGREEMENT.md:89-92`),
and the read-only retry advice remains consistent with the permanent latch
described at `docs/governance/MEMPALACE_PROTOCOL.md:97-116`.

There is no repository-local `AGENTS.md`
(`git ls-tree -r --name-only cc5577c8489beaa70ae38e3de0517942f9be1d6a |
rg '(^|/)AGENTS\.md$'` returns no path). The supplied global `AGENTS.md` says
project instructions win, so the repo-specific no-MemPalace exception can
legitimately narrow its global still-connecting rule.

### 3. Does the exemption/scope boundary hold in both directions?

**NO.** F2 records under-inclusion (permanent failure despite present config),
over-inclusion (global/host registration despite absent repo config), and the
unclassified partial-config state. F1 also shows that the absence exemption
itself carries mutually incompatible obligation states. The normal no-config,
no-tool contributor is covered correctly; the boundary is not exhaustive.

### 4. Is anything ambiguous, unenforceable, or impossible for a reader?

**YES, but the ordinary contributor can continue.** The two bullets do not
classify partial config or permanently broken configured servers (F2). The
absence branch's lapse status is internally ambiguous (F1). The named local
memory fallback has no committed location or format and is not gitignored (F3).
None of those prevents source work, but they prevent some readers from
deterministically satisfying the memory policy without guessing.

### 9. “Docs only, no gate impact”

**PASS.** GitHub and local enumeration both identify exactly `CLAUDE.md` and
`ai_rules.md`. Both are Markdown governance/instruction documents; no source,
test, fixture, package, workflow, tool, or gate-configuration file changed.

```bash
git diff --name-only \
  f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf...cc5577c8489beaa70ae38e3de0517942f9be1d6a
git diff --name-only \
  f44b1bb3d9c6ab1ac848dd2d1a66b2e9e1a2e9cf...cc5577c8489beaa70ae38e3de0517942f9be1d6a \
  -- . ':(exclude,glob)**/*.md'
```

The first command emits the two named files; the second emits nothing. This
establishes no gate-logic change, not semantic correctness. A fresh
`./tools/checks` run on this branch plus this review returned real exit 0: lint
0 errors / 145 warnings, format check passed, typecheck passed, and 1,316 unit
tests in 100 files passed.

### 10. Required governed-artifact headers

**FAIL.** F4 records the complete two-file changed set and the two affected
files. This independent review carries its own three required lines.

## Evidence boundary and weakest claims

**MEASURED this session:** PR body and GitHub metadata; local base/head SHAs and
full two-file diff; every lapse phrase in both changed files; MemPalace-related
binding text in `ai_rules.md`, `CLAUDE.md`, `OPERATING_AGREEMENT.md`, and all of
`docs/governance/**`; tracked config/memory filenames; ignore rules; the header
keys in both changed artifacts; the changed/gate file surface; and
`./tools/checks` at real exit 0 (0 lint errors / 145 warnings, format and
typecheck passed, 1,316 unit tests in 100 files passed).

**Not verified:** behaviour in every MCP-capable client; an actually failing,
partial, or globally configured MemPalace setup; ignored/untracked local config
contents; the machine-local palace; the historical sibling-project experiment;
or the author's claimed earlier `./tools/checks` invocation. No e2e or
integration suite was run; this is a documentation/governance review.

**Weakest claims, in order:**

1. **JUDGEMENT:** repo-config absence can coexist with a globally registered,
   connecting MemPalace. This is supported by common MCP configuration models
   and the supplied global setup, but was not reproduced by deleting this
   checkout's ignored config.
2. **JUDGEMENT:** the undefined local-memory file is a material fallback defect
   rather than merely tool-specific knowledge the agent is expected to have.
3. **INFERRED:** a permanently broken configured server can induce reload loops.
   The text supplies no exit, but this review did not deliberately break the
   maintainer's MCP server to demonstrate the loop.
