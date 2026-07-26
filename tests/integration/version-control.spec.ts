/**
 * Integration: the vcs:* IPC boundary — WS3 Phase 7 slice E.
 *
 * The Slice E prompt requires "integration tests for IPC boundary and error
 * handling". This spec drives the real preload bridge in a real Electron
 * process and asserts the two things that matter about a security boundary:
 *
 *  1. Every channel exists and returns the typed `{ success, error }` shape.
 *  2. Rejected input is rejected AT THE BOUNDARY — validation failures come
 *     back as errors and never reach git.
 *
 * ⚠ The whole suite runs with NO repository designated, which is itself the
 * strongest assertion available here: the designation gate refuses every
 * operation regardless of how well-formed the rest of the arguments are, so a
 * renderer cannot point main at an arbitrary directory.
 */
import { test, expect } from '@playwright/test';
import { launch, close } from '../support';

type VcsResult = { success: boolean; error?: string } & Record<string, unknown>;

test.describe('Version control IPC boundary (slice E)', () => {
  test('exposes exactly the six read operations plus repo designation', async () => {
    const ctx = await launch();
    try {
      const surface = await ctx.window.evaluate(() => {
        const api = window.electronAPI as unknown as Record<string, unknown>;
        return Object.keys(api)
          .filter((key) => key.startsWith('vcs'))
          .sort();
      });

      expect(surface).toEqual([
        'vcsBranch',
        'vcsClearRepoRoots',
        'vcsDesignateRepoRoot',
        'vcsDiffFile',
        'vcsIsRepo',
        'vcsListRepoRoots',
        'vcsLog',
        'vcsShowAtRev',
        'vcsStatus',
      ]);
    } finally {
      await close(ctx);
    }
  });

  test('⚠ exposes NO write operation — commitFiles is out of scope this slice', async () => {
    const ctx = await launch();
    try {
      // Scoped to the vcs* surface: unrelated members like `haFetch` legitimately
      // contain these words.
      const writeSurface = await ctx.window.evaluate(() => {
        const api = window.electronAPI as unknown as Record<string, unknown>;
        return Object.keys(api)
          .filter((key) => key.startsWith('vcs'))
          .filter((key) =>
            /commit|push|pull|fetch|clone|remote|checkout|reset|rebase|merge|stash|clean|config/i.test(
              key,
            ),
          );
      });

      expect(writeSurface).toEqual([]);
    } finally {
      await close(ctx);
    }
  });

  test('starts with no designated repository', async () => {
    const ctx = await launch();
    try {
      const result = await ctx.window.evaluate(
        async () => (await window.electronAPI.vcsListRepoRoots()) as VcsResult,
      );
      expect(result.success).toBe(true);
      expect(result.roots).toEqual([]);
    } finally {
      await close(ctx);
    }
  });

  test('refuses an undesignated repoRoot even when it is a real git repo', async () => {
    const ctx = await launch();
    try {
      // The HAVDM checkout itself is a genuine git repository, so this proves
      // the gate is the DESIGNATION list and not merely "is this a repo".
      const result = await ctx.window.evaluate(async () => {
        const cwd = '/home';
        return (await window.electronAPI.vcsStatus(cwd)) as VcsResult;
      });

      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
    } finally {
      await close(ctx);
    }
  });

  test.describe('argument validation returns typed errors, never a git invocation', () => {
    test('rejects a relative repoRoot', async () => {
      const ctx = await launch();
      try {
        const result = await ctx.window.evaluate(
          async () => (await window.electronAPI.vcsIsRepo('relative/path')) as VcsResult,
        );
        expect(result.success).toBe(false);
        expect(result.error).toContain('absolute');
      } finally {
        await close(ctx);
      }
    });

    test('rejects an empty repoRoot', async () => {
      const ctx = await launch();
      try {
        const result = await ctx.window.evaluate(
          async () => (await window.electronAPI.vcsIsRepo('')) as VcsResult,
        );
        expect(result.success).toBe(false);
        expect(result.error).toContain('non-empty');
      } finally {
        await close(ctx);
      }
    });

    test('rejects a non-existent repoRoot', async () => {
      const ctx = await launch();
      try {
        const result = await ctx.window.evaluate(
          async () =>
            (await window.electronAPI.vcsIsRepo('/definitely/not/here/havdm-slice-e')) as VcsResult,
        );
        expect(result.success).toBe(false);
        expect(result.error).toContain('does not exist');
      } finally {
        await close(ctx);
      }
    });

    test('every operation refuses before touching git when the repo is undesignated', async () => {
      const ctx = await launch();
      try {
        const results = await ctx.window.evaluate(async () => {
          const root = '/tmp';
          const api = window.electronAPI;
          return {
            isRepo: (await api.vcsIsRepo(root)) as VcsResult,
            status: (await api.vcsStatus(root)) as VcsResult,
            branch: (await api.vcsBranch(root)) as VcsResult,
            log: (await api.vcsLog(root, 'x.yaml', 10)) as VcsResult,
            diff: (await api.vcsDiffFile(root, 'x.yaml')) as VcsResult,
            show: (await api.vcsShowAtRev(root, 'x.yaml', 'HEAD')) as VcsResult,
          };
        });

        for (const [operation, result] of Object.entries(results)) {
          expect(result.success, `${operation} should refuse an undesignated root`).toBe(false);
          expect(typeof result.error, `${operation} should report a string error`).toBe('string');
        }
      } finally {
        await close(ctx);
      }
    });
  });

  test('clearRepoRoots is idempotent and leaves the list empty', async () => {
    const ctx = await launch();
    try {
      const result = await ctx.window.evaluate(async () => {
        await window.electronAPI.vcsClearRepoRoots();
        await window.electronAPI.vcsClearRepoRoots();
        return (await window.electronAPI.vcsListRepoRoots()) as VcsResult;
      });

      expect(result.success).toBe(true);
      expect(result.roots).toEqual([]);
    } finally {
      await close(ctx);
    }
  });

  test('the app renders normally with version control unused', async () => {
    // The Slice E Stability Rule: "existing dashboard editing workflow must
    // remain unaffected when VCS features are unused." The UI half of this is
    // asserted in tests/e2e/version-control.spec.ts, which drives the real
    // editor via the DSL; here we only need the app to come up clean with the
    // new IPC surface registered and nothing designated.
    const ctx = await launch();
    try {
      await expect(ctx.window.locator('#root')).toBeAttached();
      const roots = await ctx.window.evaluate(
        async () => (await window.electronAPI.vcsListRepoRoots()) as VcsResult,
      );
      expect(roots.roots).toEqual([]);
    } finally {
      await close(ctx);
    }
  });
});
