/**
 * WS3 Phase 7 slice E — the pure version-control layer.
 *
 * These are the tests the Slice E prompt's Required Tests calls "unit tests for
 * VCS command validation/parsing", and they are the security surface of the
 * slice: every one of them is a rule from
 * `docs/governance/phases/phase-7-slice-e-command-contract.md` §3, §4 and §7.
 *
 * ⚠ HONEST LABEL: `versionControlService.ts` is a NEW module, so these are new
 * coverage rather than red-before-green — there was nothing to fail on base.
 * They earn their place by pinning the rejection cases (the argv that must
 * NEVER be constructible), which is what a validation layer is for.
 */
import { describe, it, expect } from 'vitest';
import {
  buildBranchArgv,
  buildDiffFileArgv,
  buildGitEnv,
  buildIsRepoArgv,
  buildLogArgv,
  buildShowAtRevArgv,
  buildStatusArgv,
  GIT_MAX_OUTPUT_BYTES,
  GIT_TIMEOUT_MS,
  isContainedPath,
  isSafeRepoRelativePath,
  isValidLogDepth,
  isValidRev,
  LOG_FORMAT,
  parseBranchOutput,
  parseIsRepoOutput,
  parseLogOutput,
  parseStatusPorcelainZ,
} from '../../src/services/versionControlService';

describe('isValidRev — git revision EXPRESSIONS are refused, not just bad input', () => {
  it('accepts a short and a full hex object id, and the literal HEAD', () => {
    expect(isValidRev('a1b2c3d')).toBe(true);
    expect(isValidRev('0123456789abcdef0123456789abcdef01234567')).toBe(true);
    expect(isValidRev('HEAD')).toBe(true);
  });

  it.each([
    ['HEAD~1', 'ancestry'],
    ['HEAD^', 'parent'],
    ['@{upstream}', 'reflog/upstream syntax'],
    ['a1b2c3d..e4f5a6b', 'a range'],
    ['main', 'a ref name'],
    ['refs/heads/main', 'a full ref'],
    ['HEAD:file.yaml', 'a rev:path pair'],
    ['--upload-pack=evil', 'an option'],
    ['A1B2C3D', 'uppercase hex'],
    ['a1b2c3', 'too short (6)'],
    ['0123456789abcdef0123456789abcdef012345678', 'too long (41)'],
    ['', 'empty'],
    ['a1b2c3d\n', 'trailing newline'],
  ])('rejects %j (%s)', (rev) => {
    expect(isValidRev(rev)).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isValidRev(undefined)).toBe(false);
    expect(isValidRev(null)).toBe(false);
    expect(isValidRev(42)).toBe(false);
    expect(isValidRev({})).toBe(false);
  });
});

describe('isValidLogDepth', () => {
  it('accepts the inclusive bounds', () => {
    expect(isValidLogDepth(1)).toBe(true);
    expect(isValidLogDepth(100)).toBe(true);
    expect(isValidLogDepth(25)).toBe(true);
  });

  it.each([[0], [-1], [101], [1.5], [NaN], [Infinity]])('rejects %j', (depth) => {
    expect(isValidLogDepth(depth)).toBe(false);
  });

  it('rejects non-numbers', () => {
    expect(isValidLogDepth('10')).toBe(false);
    expect(isValidLogDepth(undefined)).toBe(false);
  });
});

describe('isSafeRepoRelativePath', () => {
  it('accepts ordinary nested repo-relative paths', () => {
    expect(isSafeRepoRelativePath('ui-lovelace.yaml')).toBe(true);
    expect(isSafeRepoRelativePath('dashboards/home.yaml')).toBe(true);
    expect(isSafeRepoRelativePath('a/b/c/deep file with spaces.yaml')).toBe(true);
  });

  it.each([
    ['../outside.yaml', 'parent traversal'],
    ['dashboards/../../outside.yaml', 'traversal mid-path'],
    ['/etc/passwd', 'absolute posix'],
    ['C:/Windows/system.ini', 'absolute windows'],
    ['C:\\Windows\\system.ini', 'absolute windows backslash'],
    ['\\\\server\\share\\file', 'UNC path'],
    ['.git/config', 'reaching into .git'],
    ['.git/hooks/pre-commit', 'reaching into .git hooks'],
    ['', 'empty'],
  ])('rejects %j (%s)', (filePath) => {
    expect(isSafeRepoRelativePath(filePath)).toBe(false);
  });

  it('rejects an embedded NUL, which would truncate the argv element', () => {
    expect(isSafeRepoRelativePath('ok.yaml\0../../etc/passwd')).toBe(false);
  });

  it('allows a file whose name merely CONTAINS .git', () => {
    expect(isSafeRepoRelativePath('my.gitignore')).toBe(true);
    expect(isSafeRepoRelativePath('notes/.gitkeep')).toBe(true);
  });
});

describe('isContainedPath — the authoritative post-realpath containment rule', () => {
  it('accepts a file nested inside the root', () => {
    expect(isContainedPath('/home/u/config', '/home/u/config/ui-lovelace.yaml')).toBe(true);
    expect(isContainedPath('/home/u/config', '/home/u/config/a/b/c.yaml')).toBe(true);
  });

  it('tolerates a trailing slash on the root', () => {
    expect(isContainedPath('/home/u/config/', '/home/u/config/x.yaml')).toBe(true);
  });

  it('rejects the root itself — the root is a directory, not a file', () => {
    expect(isContainedPath('/home/u/config', '/home/u/config')).toBe(false);
  });

  it('rejects a path outside the root', () => {
    expect(isContainedPath('/home/u/config', '/home/u/other/x.yaml')).toBe(false);
    expect(isContainedPath('/home/u/config', '/etc/passwd')).toBe(false);
  });

  it('⚠ rejects a SIBLING whose name merely shares the root prefix', () => {
    // The classic off-by-one: startsWith(root) alone would accept this.
    expect(isContainedPath('/home/u/config', '/home/u/config-evil/x.yaml')).toBe(false);
    expect(isContainedPath('/home/u/config', '/home/u/configx')).toBe(false);
  });

  it('rejects empty inputs', () => {
    expect(isContainedPath('', '/home/u/config/x.yaml')).toBe(false);
    expect(isContainedPath('/home/u/config', '')).toBe(false);
  });
});

describe('argv construction — byte-exact, and paths always after `--`', () => {
  it('isRepo', () => {
    expect(buildIsRepoArgv()).toEqual(['rev-parse', '--is-inside-work-tree']);
  });

  it('status uses -z framing so newlines in filenames cannot break records', () => {
    expect(buildStatusArgv()).toEqual([
      'status',
      '--porcelain=v1',
      '-z',
      '--untracked-files=normal',
    ]);
  });

  it('branch', () => {
    expect(buildBranchArgv()).toEqual(['rev-parse', '--abbrev-ref', 'HEAD']);
  });

  it('log', () => {
    expect(buildLogArgv('dashboards/home.yaml', 20)).toEqual([
      'log',
      '-n',
      '20',
      `--format=${LOG_FORMAT}`,
      '--',
      'dashboards/home.yaml',
    ]);
  });

  it('diffFile disables external diff drivers and colour', () => {
    expect(buildDiffFileArgv('ui-lovelace.yaml')).toEqual([
      'diff',
      '--no-color',
      '--no-ext-diff',
      '--',
      'ui-lovelace.yaml',
    ]);
  });

  it('showAtRev builds the rev:path form', () => {
    expect(buildShowAtRevArgv('ui-lovelace.yaml', 'a1b2c3d')).toEqual([
      'show',
      'a1b2c3d:ui-lovelace.yaml',
    ]);
    expect(buildShowAtRevArgv('ui-lovelace.yaml', 'HEAD')).toEqual([
      'show',
      'HEAD:ui-lovelace.yaml',
    ]);
  });

  it('⚠ a file named like an option lands AFTER `--` and is inert', () => {
    const argv = buildDiffFileArgv('--upload-pack=evil');
    expect(argv.indexOf('--')).toBeLessThan(argv.indexOf('--upload-pack=evil'));
    expect(argv[argv.length - 1]).toBe('--upload-pack=evil');
  });

  it('⚠ every builder REFUSES an unsafe path rather than sanitising it', () => {
    expect(() => buildLogArgv('../../etc/passwd', 10)).toThrow(/unsafe path/);
    expect(() => buildDiffFileArgv('/etc/passwd')).toThrow(/unsafe path/);
    expect(() => buildShowAtRevArgv('.git/config', 'HEAD')).toThrow(/unsafe path/);
  });

  it('⚠ log refuses an out-of-range depth, so `-n` can never carry junk', () => {
    expect(() => buildLogArgv('ok.yaml', 0)).toThrow(/depth out of range/);
    expect(() => buildLogArgv('ok.yaml', 1000)).toThrow(/depth out of range/);
  });

  it('⚠ showAtRev refuses a revision EXPRESSION', () => {
    expect(() => buildShowAtRevArgv('ok.yaml', 'HEAD~3')).toThrow(/invalid rev/);
    expect(() => buildShowAtRevArgv('ok.yaml', '@{upstream}')).toThrow(/invalid rev/);
  });
});

describe('buildGitEnv — an inherited environment must not turn a read into an execution', () => {
  it('drops every GIT_* variable', () => {
    const env = buildGitEnv({
      PATH: '/usr/bin',
      HOME: '/home/u',
      GIT_EXTERNAL_DIFF: '/tmp/evil.sh',
      GIT_SSH_COMMAND: 'sh -c evil',
      GIT_PAGER: 'evil',
      GIT_EDITOR: 'evil',
      GIT_DIR: '/somewhere/else/.git',
      GIT_WORK_TREE: '/somewhere/else',
    });

    expect(env.GIT_EXTERNAL_DIFF).toBeUndefined();
    expect(env.GIT_SSH_COMMAND).toBeUndefined();
    expect(env.GIT_PAGER).toBeUndefined();
    expect(env.GIT_EDITOR).toBeUndefined();
    expect(env.GIT_DIR).toBeUndefined();
    expect(env.GIT_WORK_TREE).toBeUndefined();
  });

  it('drops a GIT_* variable it has never heard of', () => {
    const env = buildGitEnv({ PATH: '/usr/bin', GIT_SOME_FUTURE_HOOK: 'evil' });
    expect(env.GIT_SOME_FUTURE_HOOK).toBeUndefined();
  });

  it('keeps non-git variables', () => {
    const env = buildGitEnv({ PATH: '/usr/bin', HOME: '/home/u', LANG: 'en_AU.UTF-8' });
    expect(env.PATH).toBe('/usr/bin');
    expect(env.HOME).toBe('/home/u');
    expect(env.LANG).toBe('en_AU.UTF-8');
  });

  it('forces the two variables we require', () => {
    const env = buildGitEnv({ GIT_TERMINAL_PROMPT: '1', GIT_OPTIONAL_LOCKS: '1' });
    expect(env.GIT_TERMINAL_PROMPT).toBe('0');
    expect(env.GIT_OPTIONAL_LOCKS).toBe('0');
  });

  it('omits keys whose value is undefined', () => {
    const env = buildGitEnv({ PATH: '/usr/bin', NOPE: undefined });
    expect('NOPE' in env).toBe(false);
  });
});

describe('parseStatusPorcelainZ', () => {
  it('parses modified, staged and untracked entries', () => {
    const entries = parseStatusPorcelainZ(' M ui-lovelace.yaml\0M  staged.yaml\0?? new.yaml\0');
    expect(entries).toEqual([
      { code: ' M', path: 'ui-lovelace.yaml' },
      { code: 'M ', path: 'staged.yaml' },
      { code: '??', path: 'new.yaml' },
    ]);
  });

  it('keeps filenames containing spaces and non-ASCII intact', () => {
    const entries = parseStatusPorcelainZ(' M dashboards/my café dashboard.yaml\0');
    expect(entries).toEqual([{ code: ' M', path: 'dashboards/my café dashboard.yaml' }]);
  });

  it('⚠ keeps a filename containing a NEWLINE intact — the reason for -z', () => {
    const entries = parseStatusPorcelainZ(' M weird\nname.yaml\0');
    expect(entries).toEqual([{ code: ' M', path: 'weird\nname.yaml' }]);
  });

  it('pairs a rename with its original path instead of emitting two entries', () => {
    const entries = parseStatusPorcelainZ('R  new.yaml\0old.yaml\0 M other.yaml\0');
    expect(entries).toEqual([
      { code: 'R ', path: 'new.yaml', originalPath: 'old.yaml' },
      { code: ' M', path: 'other.yaml' },
    ]);
  });

  it('pairs a copy the same way', () => {
    const entries = parseStatusPorcelainZ('C  copy.yaml\0source.yaml\0');
    expect(entries).toEqual([{ code: 'C ', path: 'copy.yaml', originalPath: 'source.yaml' }]);
  });

  it('returns an empty list for a clean tree', () => {
    expect(parseStatusPorcelainZ('')).toEqual([]);
  });
});

// `\0` immediately followed by a digit is a legacy octal escape, illegal in
// an ES module — and every log record below is `hash NUL author NUL 2026-...`.
const NUL = '\u0000';

describe('parseLogOutput', () => {
  it('parses NUL-delimited commit records', () => {
    const stdout = [
      `a1b2c3d${NUL}Micah${NUL}2026-07-26T10:00:00+10:00${NUL}Add kitchen view`,
      `e4f5a6b${NUL}Micah${NUL}2026-07-25T09:30:00+10:00${NUL}Initial dashboard`,
    ].join('\n');

    expect(parseLogOutput(stdout)).toEqual([
      {
        hash: 'a1b2c3d',
        author: 'Micah',
        date: '2026-07-26T10:00:00+10:00',
        subject: 'Add kitchen view',
      },
      {
        hash: 'e4f5a6b',
        author: 'Micah',
        date: '2026-07-25T09:30:00+10:00',
        subject: 'Initial dashboard',
      },
    ]);
  });

  it('keeps a subject containing a tab or a colon intact', () => {
    const stdout = `a1b2c3d\0Micah${NUL}2026-07-26T10:00:00+10:00\0fix:\tthe thing`;
    expect(parseLogOutput(stdout)[0].subject).toBe('fix:\tthe thing');
  });

  it('tolerates an empty subject', () => {
    const stdout = `a1b2c3d\0Micah${NUL}2026-07-26T10:00:00+10:00\0`;
    expect(parseLogOutput(stdout)[0]).toMatchObject({ hash: 'a1b2c3d', subject: '' });
  });

  it('returns an empty list for no history', () => {
    expect(parseLogOutput('')).toEqual([]);
    expect(parseLogOutput('\n\n')).toEqual([]);
  });
});

describe('parseIsRepoOutput / parseBranchOutput', () => {
  it('reads the is-inside-work-tree boolean', () => {
    expect(parseIsRepoOutput('true\n')).toBe(true);
    expect(parseIsRepoOutput('false\n')).toBe(false);
    expect(parseIsRepoOutput('')).toBe(false);
  });

  it('reads a branch name', () => {
    expect(parseBranchOutput('main\n')).toEqual({ branch: 'main', detached: false });
  });

  it('reports a detached HEAD — git prints the literal HEAD', () => {
    expect(parseBranchOutput('HEAD\n')).toEqual({ branch: 'HEAD', detached: true });
  });
});

describe('execution envelope constants', () => {
  it('bounds runtime and output so one operation cannot hang or flood the app', () => {
    expect(GIT_TIMEOUT_MS).toBe(10_000);
    expect(GIT_MAX_OUTPUT_BYTES).toBe(5 * 1024 * 1024);
  });
});
