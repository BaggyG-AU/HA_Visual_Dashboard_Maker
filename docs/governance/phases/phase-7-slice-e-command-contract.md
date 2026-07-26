Phase Name: Phase 7 – Ecosystem & Future Growth
Document Type: Slice E pre-implementation command contract
Blueprint: docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md (§13, Slice E)
Date: 2026-07-26
Status: **DESIGN ONLY — not yet approved for implementation**

# Slice E — Version Control Integration: Command Contract

## 0) Why this document exists before any code

The Slice E prompt's Operator Decision Tree says, first item:

> "If any IPC command scope is unclear, stop and narrow command contract first."

It is unclear. The prompt asks for "status/diff/commit intent flows" with
"strict Electron boundary controls" and forbids "unrestricted renderer-to-shell
execution", but never says which git commands exist, what may parameterise them,
or where the trust boundary sits. That is the whole security surface of the
slice, and the blueprint's §19 Medium Gate lists "security boundary uncertainty
for … version-control slices" as an audit **stop condition**.

So the contract is settled here, in review, and slice E becomes implementation
against an approved boundary rather than design-while-coding.

**This document is not a licence to implement.** It requires its own sign-off.

---

## 1) What HAVDM is actually integrating with

HAVDM edits Home Assistant dashboard YAML files on disk. Many HA users keep
their whole `/config` directory in git — that is the real, concrete consumer for
this slice, and it is what separates E from the withdrawn G and H
(amendment-01): E has a user in front of it.

It is **not** integration with HAVDM's own development repository.
`tools/feature-start` and `tools/feature-finish` govern HAVDM's development
workflow and are untouched by this slice. The Slice E prompt lists them under
Evidence Scope only as the policy precedent for "safe git workflow", and its
Forbidden clause "no bypass of existing feature workflow policies" means exactly
that: this feature must not become a way to drive HAVDM's own release process.

---

## 2) The trust boundary

The renderer is treated as **untrusted input** for this slice. The threat model
is not a malicious user — it is a malicious or malformed _dashboard file_,
entity name, or path reaching a shell.

Three rules, in priority order:

1. **No command string is ever composed in, or passed through, the renderer.**
   The renderer names an _operation_ from a closed set. Main owns the argv.
2. **No shell.** All git invocation uses `execFile`-style spawning with an
   argument array and `shell: false`. There is no code path in which a string is
   handed to `/bin/sh`, `cmd.exe`, or PowerShell.
3. **Least privilege, read-mostly.** The default surface is read-only. Exactly
   one mutating operation is proposed, and it is gated (§5).

### 2.1 Precedent note (not a slice E deliverable)

The existing boundary is more permissive than this contract:
`fs:readFile` / `fs:writeFile` accept any absolute path with no validation, and
`shell:openExternal` passes any URL straight to `shell.openExternal`. Slice E
does **not** inherit that posture, and it does not fix it either — tightening
those is separate, pre-existing work and mixing it in would violate the slice's
"no opportunistic refactors" discipline. Recorded here so the gate does not
mistake the new stricter surface for the whole boundary's posture.

---

## 3) The closed operation set

Seven operations. The renderer may request nothing else. Adding an eighth is a
contract change requiring its own review.

| #   | Operation     | Kind      | git argv (fixed in main)                                       | Renderer-supplied input   |
| --- | ------------- | --------- | -------------------------------------------------------------- | ------------------------- |
| 1   | `isRepo`      | read      | `rev-parse --is-inside-work-tree`                              | repo root only            |
| 2   | `status`      | read      | `status --porcelain=v1 -z --untracked-files=normal`            | repo root only            |
| 3   | `branch`      | read      | `rev-parse --abbrev-ref HEAD`                                  | repo root only            |
| 4   | `log`         | read      | `log -n <N> --format=%H%x00%an%x00%aI%x00%s -- <tracked file>` | repo root, file, N        |
| 5   | `diffFile`    | read      | `diff --no-color --no-ext-diff -- <tracked file>`              | repo root, file           |
| 6   | `showAtRev`   | read      | `show <rev>:<tracked file>`                                    | repo root, file, rev      |
| 7   | `commitFiles` | **write** | `add -- <files…>` then `commit -m <message> -- <files…>`       | repo root, files, message |

Explicitly **out of scope** — not in this slice, not behind a flag:
`push`, `pull`, `fetch`, `clone`, `remote`, `checkout`, `reset`, `rebase`,
`merge`, `stash`, `clean`, `config`, `submodule`, hooks, credential helpers, and
anything that touches a remote or rewrites history. Slice E is a local,
working-tree-scoped feature. Anything reaching the network is a separate,
separately-designed slice.

---

## 4) Argument validation (main process, before any spawn)

Every operation validates before spawning. A validation failure returns a typed
error and **never** falls through to git.

**`repoRoot`**

- Must be an absolute path that resolves (`fs.realpath`) to an existing
  directory.
- Must be a git work tree root — verified by operation 1, not by string matching.
- **Must be one the user has explicitly designated in-app** (see §6). The
  renderer cannot pass an arbitrary directory and have main act on it.

**`file`**

- Resolved with `path.resolve(repoRoot, file)`, then `fs.realpath`, then
  asserted to be **inside** `repoRoot` after symlink resolution. This is the
  containment check; a `..` traversal or a symlink pointing out of the tree
  fails it.
- Must be a regular file, not a directory, socket, or device.
- Rejected if it begins with `.git/` after resolution.

**`rev`**

- Must match `/^[0-9a-f]{7,40}$/` (a hex object id) or be the literal `HEAD`.
  No ref names, no `HEAD~3`, no `@{upstream}`, no ranges, no `..`, no `:` or
  `^`. Revision _expressions_ are where git's own parser becomes an attack
  surface; this slice does not need them.
- Sourced from operation 4's output in practice, so a plain object id suffices.

**`N`** (log depth)

- Integer, `1 <= N <= 100`.

**`message`** (commit)

- Non-empty after trim; max 4096 characters; control characters other than `\n`
  stripped.
- Passed as a single `-m` argv element. Never interpolated, never shell-quoted —
  because there is no shell to quote for.

**Every argv element** is additionally asserted not to begin with `-` unless it
is one of the fixed literal flags above, and all user-supplied paths appear
after a `--` separator, so a file named `--upload-pack=…` cannot be read as an
option.

---

## 5) The one mutating operation

`commitFiles` is the only write, and it is the one place this slice can damage a
user's repository. Constraints:

- **Explicitly user-initiated only.** No polling path, no autosave path, and no
  other operation may call it.
- **Staged set is explicit and bounded.** `git add -- <files…>` with an explicit
  file list drawn from the operation-2 status output. Never `add -A`, never
  `add .`, never a pathspec the user did not see.
- **Confirmation surface shows exactly what will be committed** — the file list
  and the message — before the call is made.
- **No amend, no signing, no hooks bypass, no author override.**
- Returns the new commit's object id, or a typed error. A non-zero git exit is
  an error, never a silent success.

If `commitFiles` cannot be delivered with a confirmation surface inside slice E's
budget, ship operations 1–6 (read-only) and defer the write. A read-only version
of this feature is still useful and carries a fraction of the risk. That is the
recommended fallback, not a failure.

---

## 6) Repository designation

The user picks the repository once, through the existing native directory
dialog (the `dialog:openFile` pattern in `src/main.ts`), and it is persisted
through `settingsService`. Main keeps the designated root(s) and validates every
incoming `repoRoot` against that list.

This is what makes §4's containment check meaningful: without it, "is the path
inside `repoRoot`?" is trivially satisfied by a renderer that supplies both
halves.

---

## 7) Execution envelope

- `execFile('git', argv, { cwd: repoRoot, shell: false, ... })` — argument
  array, never a command string.
- **Timeout:** 10 s per invocation, process killed on expiry.
- **Output cap:** 5 MB stdout; exceeding it is a typed error, not a truncated
  success. (`diffFile` on a large generated file is the realistic trigger.)
- **Environment scrubbed:** `GIT_*` variables removed from the child env, plus
  `GIT_SSH_COMMAND`, `GIT_EXTERNAL_DIFF`, `GIT_PAGER`, `GIT_EDITOR`.
  `GIT_TERMINAL_PROMPT=0` and `GIT_OPTIONAL_LOCKS=0` set. This prevents an
  inherited environment from turning a read into an execution.
- **Concurrency:** one git invocation in flight per repo root; further requests
  queue. Satisfies the prompt's "VCS status polling must be bounded and
  non-blocking".
- **git absence is a first-class state**, not an error dialog: if `git` is not
  on PATH, the feature reports unavailable and the rest of the app is unaffected.

---

## 8) IPC surface

Additive, namespaced `vcs:`, following the house `ipcMain.handle` +
`contextBridge` pattern and the existing `{ success, error }` result shape.
Seven channels, one per operation, rather than one generic `vcs:exec` taking a
command name — a generic channel would put operation dispatch on the renderer's
side of the boundary, which is exactly what §2 rule 1 forbids.

```
vcs:isRepo         vcs:status      vcs:branch       vcs:log
vcs:diffFile       vcs:showAtRev   vcs:commitFiles
```

No existing channel changes. No existing `electronAPI` member changes shape.

`src/services/versionControlService.ts` (new) holds the **pure** half: argv
construction, porcelain/log output parsing, validation predicates. It must not
import `electron` — that is what makes the validation logic unit-testable
without an Electron host, and it is where the bulk of slice E's unit coverage
lives.

---

## 9) Stability and state safety

- With no repository designated, the feature is inert and every existing
  workflow behaves exactly as it does today. This is the prompt's Stability Rule
  and should be asserted by a test, not assumed.
- VCS state lives in its own store slice. It must not participate in
  `dashboardStore` history — a git status refresh is not an undoable dashboard
  edit. (Compare the selection-pushes-history defect class this project has
  already fixed once.)
- No VCS state may gate, delay, or reorder a dashboard save.

---

## 10) Required tests (from the slice prompt, made concrete)

**Unit** — `tests/unit/version-control-service.spec.ts`, against the pure module:

- argv construction for all 7 operations is byte-exact, `--` separator present.
- `rev` validator rejects `HEAD~1`, `@{upstream}`, `a..b`, `x^`, `--foo`, empty,
  and a 41-char hex string; accepts a 7- and a 40-char hex id and `HEAD`.
- path containment rejects `../outside`, an absolute path outside the root, and
  a symlink resolving outside the root; accepts a nested tracked file.
- a file named `--upload-pack=x` lands after `--` and is never read as a flag.
- `message` validator rejects empty/whitespace-only and over-length input.
- porcelain `-z` and log `%x00` parsers handle filenames containing spaces,
  newlines, and non-ASCII.

**Integration** — `tests/integration/version-control.spec.ts`:

- IPC channel presence and typed error shapes.
- validation failures return errors and demonstrably do not spawn git.
- git-absent and not-a-repo paths both degrade gracefully.

**E2E** — `tests/e2e/version-control.spec.ts`:

- smoke: designate a repo, see status, view a file diff, with the feature
  inert beforehand.

Red-before-green in the same checkout per the project's standing rule; any new
test that passes on base gets reported honestly as a regression guard.

---

## 11) Open questions for sign-off

1. **Ship `commitFiles`, or read-only first?** §5 recommends read-only
   (operations 1–6) for slice E, with commit as a follow-on once the read
   surface has been used in anger. Committing from a dashboard editor is a
   meaningful escalation of blast radius.
2. **Where does the UI live?** A panel, a modal, or a status-bar affordance.
   `PropertiesPanel.tsx` is 6700+ lines and blank-app-prone, so it is not a
   candidate; the separate-portal-modal pattern used for `ViewSettingsDialog`
   is the safer precedent. ⚠ Any new dialog must be mounted only while open
   (`{open && <Dialog/>}`) — `destroyOnHidden` alone leaves the
   `Form.useForm()` instance alive and re-shows stale values.
3. **One repo or several?** §6 assumes a list; a single designated root is
   simpler and probably sufficient for v1.
4. **Does `diffFile` need to cover the dashboard file HAVDM currently has open,
   specifically** — i.e. "show me what I've changed since my last commit" as the
   headline flow — or is it a general file browser over the repo? The former is
   a much smaller, more useful slice.
