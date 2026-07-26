/**
 * Version-control integration — the PURE half.
 *
 * WS3 Phase 7 slice E. Implements the contract in
 * `docs/governance/phases/phase-7-slice-e-command-contract.md`, which was
 * settled in review before any code because the Slice E prompt's Operator
 * Decision Tree says to stop and narrow the command contract when IPC scope is
 * unclear.
 *
 * ⚠ THIS MODULE MUST NEVER IMPORT `electron`, `node:child_process`, or
 * `node:fs`. Everything here is argv construction, validation predicates and
 * output parsing — deliberately side-effect free so the security-relevant logic
 * is unit-testable without an Electron host. The process spawning, path
 * realpath-resolution and repo-designation checks live in `src/main.ts`, which
 * calls into this module.
 *
 * SCOPE (contract §3): six READ operations. `commitFiles` is deliberately NOT
 * implemented in this slice — see the contract §5 and §11 question 1.
 * Everything touching a remote or rewriting history (push/pull/fetch/clone/
 * remote/checkout/reset/rebase/merge/stash/clean/config/hooks) is out of scope.
 */

/** The closed set of operations the renderer may request. Read-only in slice E. */
export type VcsOperation = 'isRepo' | 'status' | 'branch' | 'log' | 'diffFile' | 'showAtRev';

/** Execution envelope (contract §7). */
export const GIT_TIMEOUT_MS = 10_000;
export const GIT_MAX_OUTPUT_BYTES = 5 * 1024 * 1024;

/** Bounds for the `log` depth parameter (contract §4). */
export const LOG_DEPTH_MIN = 1;
export const LOG_DEPTH_MAX = 100;

/**
 * Environment variables stripped from the git child process (contract §7).
 *
 * An inherited environment can turn a read into an execution: GIT_EXTERNAL_DIFF
 * and GIT_PAGER name programs git will run, GIT_SSH_COMMAND names a shell
 * command, and GIT_DIR / GIT_WORK_TREE would redirect the operation away from
 * the directory we validated. Any `GIT_*` key is dropped wholesale rather than
 * denylisted individually, so a future git variable cannot leak through.
 */
export const GIT_ENV_FORCED: Readonly<Record<string, string>> = {
  GIT_TERMINAL_PROMPT: '0',
  GIT_OPTIONAL_LOCKS: '0',
};

/**
 * Build the child environment: drop every `GIT_*` key, then force the two we
 * want. `GIT_TERMINAL_PROMPT=0` stops git blocking on a credential prompt (no
 * TTY exists), `GIT_OPTIONAL_LOCKS=0` keeps read operations from taking the
 * index lock and fighting a concurrent git the user is running themselves.
 */
export const buildGitEnv = (
  baseEnv: Record<string, string | undefined>,
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(baseEnv)) {
    if (key.startsWith('GIT_')) continue;
    if (value !== undefined) out[key] = value;
  }
  return { ...out, ...GIT_ENV_FORCED };
};

// ---------------------------------------------------------------------------
// Validation predicates
// ---------------------------------------------------------------------------

/**
 * A revision must be a plain hex object id or the literal `HEAD`.
 *
 * ⚠ Deliberately NOT a general revision parser. Ref names, `HEAD~3`,
 * `@{upstream}`, ranges (`a..b`), `^`, and `:` are all rejected, because git's
 * own revision-expression parser is an attack surface this slice has no need
 * for — every rev we use comes from our own `log` output.
 */
export const isValidRev = (rev: unknown): rev is string =>
  typeof rev === 'string' && (rev === 'HEAD' || /^[0-9a-f]{7,40}$/.test(rev));

/** Log depth must be a bounded integer (contract §4). */
export const isValidLogDepth = (depth: unknown): depth is number =>
  typeof depth === 'number' &&
  Number.isInteger(depth) &&
  depth >= LOG_DEPTH_MIN &&
  depth <= LOG_DEPTH_MAX;

/**
 * Is this a repo-relative path we are willing to hand to git?
 *
 * Absolute paths, parent traversal, and anything reaching into `.git/` are
 * refused. This is a *syntactic* check — the authoritative containment check is
 * `isContainedPath` below, applied in main after both paths are realpath'd, so
 * a symlink cannot smuggle a path out of the tree.
 */
export const isSafeRepoRelativePath = (filePath: unknown): filePath is string => {
  if (typeof filePath !== 'string' || filePath.length === 0) return false;
  if (filePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(filePath)) return false;
  if (filePath.startsWith('\\\\')) return false;
  const segments = filePath.split(/[\\/]/);
  if (segments.some((segment) => segment === '..')) return false;
  if (segments[0] === '.git') return false;
  if (filePath.includes('\0')) return false;
  return true;
};

/**
 * Containment check over ALREADY-REALPATH'D absolute paths.
 *
 * Kept pure — main resolves the symlinks (I/O) and calls this with the results,
 * so the boundary rule itself is unit-testable. A path equal to the root is not
 * contained (the root is a directory, not a file).
 */
export const isContainedPath = (realRepoRoot: string, realFilePath: string): boolean => {
  const normalize = (p: string) => p.replace(/[\\/]+$/, '');
  const root = normalize(realRepoRoot);
  const file = normalize(realFilePath);
  if (root.length === 0 || file.length === 0) return false;
  if (file === root) return false;
  return file.startsWith(`${root}/`) || file.startsWith(`${root}\\`);
};

// ---------------------------------------------------------------------------
// argv construction — main owns the argv; the renderer never composes one
// ---------------------------------------------------------------------------

/**
 * The `--` separator goes before every user-supplied path so that a file
 * literally named `--upload-pack=x` is read as a pathspec and not an option.
 * Nothing after `--` can be interpreted as a flag by git.
 */
export const buildIsRepoArgv = (): string[] => ['rev-parse', '--is-inside-work-tree'];

export const buildStatusArgv = (): string[] => [
  'status',
  '--porcelain=v1',
  '-z',
  '--untracked-files=normal',
];

export const buildBranchArgv = (): string[] => ['rev-parse', '--abbrev-ref', 'HEAD'];

/** NUL-delimited fields keep author names and subjects containing tabs safe. */
export const LOG_FORMAT = '%H%x00%an%x00%aI%x00%s';

export const buildLogArgv = (filePath: string, depth: number): string[] => {
  if (!isSafeRepoRelativePath(filePath)) {
    throw new Error(`versionControlService: unsafe path for log: ${filePath}`);
  }
  if (!isValidLogDepth(depth)) {
    throw new Error(`versionControlService: log depth out of range: ${depth}`);
  }
  return ['log', '-n', String(depth), `--format=${LOG_FORMAT}`, '--', filePath];
};

export const buildDiffFileArgv = (filePath: string): string[] => {
  if (!isSafeRepoRelativePath(filePath)) {
    throw new Error(`versionControlService: unsafe path for diff: ${filePath}`);
  }
  return ['diff', '--no-color', '--no-ext-diff', '--', filePath];
};

export const buildShowAtRevArgv = (filePath: string, rev: string): string[] => {
  if (!isSafeRepoRelativePath(filePath)) {
    throw new Error(`versionControlService: unsafe path for show: ${filePath}`);
  }
  if (!isValidRev(rev)) {
    throw new Error(`versionControlService: invalid rev for show: ${rev}`);
  }
  // `<rev>:<path>` always starts with a hex digit or `H`, so it can never be
  // read as an option — no `--` separator is possible for this form.
  return ['show', `${rev}:${filePath}`];
};

// ---------------------------------------------------------------------------
// Output parsing
// ---------------------------------------------------------------------------

export interface VcsStatusEntry {
  /** Two-character porcelain-v1 status code, e.g. ` M`, `??`, `R `. */
  code: string;
  /** Repo-relative path. For a rename/copy this is the NEW path. */
  path: string;
  /** Present only for rename/copy entries. */
  originalPath?: string;
}

/**
 * Parse `git status --porcelain=v1 -z`.
 *
 * Each record is `XY<space>PATH` terminated by NUL. A rename or copy (`R`/`C`
 * in either column) is followed by a SECOND NUL-terminated field holding the
 * original path — which is exactly why `-z` matters: with newline framing, a
 * filename containing a newline would be indistinguishable from a record
 * boundary. Filenames with spaces and non-ASCII bytes come through verbatim.
 */
export const parseStatusPorcelainZ = (stdout: string): VcsStatusEntry[] => {
  const fields = stdout.split('\0').filter((field) => field.length > 0);
  const entries: VcsStatusEntry[] = [];

  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    // `XY ` — two status characters then a single space.
    if (field.length < 4) continue;
    const code = field.slice(0, 2);
    const path = field.slice(3);
    if (path.length === 0) continue;

    const isRenameOrCopy = code.includes('R') || code.includes('C');
    if (isRenameOrCopy && i + 1 < fields.length) {
      entries.push({ code, path, originalPath: fields[i + 1] });
      i += 1;
      continue;
    }
    entries.push({ code, path });
  }

  return entries;
};

export interface VcsCommit {
  hash: string;
  author: string;
  /** ISO-8601 author date, as produced by `%aI`. */
  date: string;
  subject: string;
}

/** Parse the NUL-delimited `LOG_FORMAT` output, one commit per line. */
export const parseLogOutput = (stdout: string): VcsCommit[] =>
  stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [hash = '', author = '', date = '', ...subjectParts] = line.split('\0');
      return { hash, author, date, subject: subjectParts.join('\0') };
    })
    .filter((commit) => commit.hash.length > 0);

/** `git rev-parse --is-inside-work-tree` prints exactly `true` or `false`. */
export const parseIsRepoOutput = (stdout: string): boolean => stdout.trim() === 'true';

/** `--abbrev-ref HEAD` prints `HEAD` verbatim when detached. */
export const parseBranchOutput = (stdout: string): { branch: string; detached: boolean } => {
  const branch = stdout.trim();
  return { branch, detached: branch === 'HEAD' };
};
