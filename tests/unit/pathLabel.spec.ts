/**
 * The Recent Files menu-label helper (F7 / UAT defect FILE-06, ruling R5).
 *
 * ⚠⚠ THE POINT OF THIS FILE IS THE WINDOWS CASES, AND THEY ARE THE ONES A
 * `node:path` IMPLEMENTATION WOULD HAVE GOT WRONG *HERE WHILE PASSING*.
 *
 * FILE-06 was raised against a packaged **Win64** build. This suite runs on
 * Linux. `path.dirname('C:\\dev\\x\\y.yaml')` under POSIX returns the entire
 * string — `\` is an ordinary filename character there — so a `node:path`
 * helper would render Windows paths correctly on Windows and wrongly here, and
 * every Windows assertion below would have to be skipped or faked. That is why
 * `pathLabel.ts` derives the separator from the string instead. These tests
 * would be impossible to write honestly otherwise.
 *
 * ⚠ RED-LEG HONESTY: this spec CANNOT be red-legged — its module does not exist
 * on base, so `git stash push -u src/` makes it fail at import rather than at an
 * assertion. The leg that measures the defect is in `tests/unit/menu.spec.ts`,
 * which exercises a menu builder that DOES exist on base and fails there with a
 * basename-only label.
 */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MAX_DIRECTORY_LENGTH,
  basenameOf,
  detectSeparator,
  directoryOf,
  elideDirectoryMiddle,
  recentFileMenuLabel,
} from '../../src/utils/pathLabel';

describe('detectSeparator', () => {
  it('treats a path containing a backslash as Windows-style', () => {
    expect(detectSeparator('C:\\dev\\dashboards\\a.yaml')).toBe('\\');
  });

  it('treats everything else as POSIX', () => {
    expect(detectSeparator('/home/micah/a.yaml')).toBe('/');
    expect(detectSeparator('a.yaml')).toBe('/');
  });
});

describe('basenameOf / directoryOf — separator-agnostic', () => {
  it('splits a WINDOWS path (the platform FILE-06 was raised on)', () => {
    // ⚠ `path.basename` would return the WHOLE string for this input on Linux.
    expect(basenameOf('C:\\dev\\dashboards\\uat_dashboard4.yaml')).toBe('uat_dashboard4.yaml');
    expect(directoryOf('C:\\dev\\dashboards\\uat_dashboard4.yaml')).toBe('C:\\dev\\dashboards');
  });

  it('splits a POSIX path', () => {
    expect(basenameOf('/home/micah/dashboards/a.yaml')).toBe('a.yaml');
    expect(directoryOf('/home/micah/dashboards/a.yaml')).toBe('/home/micah/dashboards');
  });

  it('handles a bare file name with no directory', () => {
    expect(basenameOf('a.yaml')).toBe('a.yaml');
    expect(directoryOf('a.yaml')).toBe('');
  });

  it('keeps the root for a file sitting at the root', () => {
    expect(directoryOf('/a.yaml')).toBe('/');
    expect(basenameOf('/a.yaml')).toBe('a.yaml');
  });

  it('ignores a trailing separator', () => {
    expect(basenameOf('C:\\dev\\dashboards\\')).toBe('dashboards');
  });
});

describe('elideDirectoryMiddle', () => {
  it('leaves a short directory alone', () => {
    expect(elideDirectoryMiddle('C:\\temp')).toBe('C:\\temp');
    expect(elideDirectoryMiddle('/home/micah')).toBe('/home/micah');
  });

  it('middle-elides a long WINDOWS directory, keeping the drive and deepest folder', () => {
    const elided = elideDirectoryMiddle(
      'C:\\dev\\projects\\havdm\\testing\\round4\\uat\\dashboards',
      24,
    );
    expect(elided).toBe('C:\\dev\\…\\dashboards');
    // ⭐ The drive survives. Eliding from the left alone would drop it, and on
    // Windows the drive is often the only thing telling two same-named files
    // apart — which is the entire job of this label.
    expect(elided.startsWith('C:')).toBe(true);
    expect(elided.endsWith('dashboards')).toBe(true);
    expect(elided).toContain('…');
  });

  it('middle-elides a long POSIX directory and keeps the leading slash', () => {
    const elided = elideDirectoryMiddle('/home/micah/projects/havdm/tests/fixtures/uat', 24);
    expect(elided.startsWith('/home')).toBe(true);
    expect(elided.endsWith('uat')).toBe(true);
    expect(elided).toContain('…');
  });

  it('grows the head back out while it still fits', () => {
    // An elision that keeps more context for the same budget is strictly better.
    const generous = elideDirectoryMiddle('/a/bb/ccc/dddd/eeeee/ffffff/target', 34);
    const stingy = elideDirectoryMiddle('/a/bb/ccc/dddd/eeeee/ffffff/target', 18);
    expect(generous.length).toBeGreaterThan(stingy.length);
    expect(generous.length).toBeLessThanOrEqual(34);
    expect(generous.endsWith('target')).toBe(true);
    expect(stingy.endsWith('target')).toBe(true);
  });

  it('returns a single enormous segment whole rather than lying about it', () => {
    // Nothing can be elided BETWEEN here. A wide menu item beats a path the
    // user cannot identify.
    const monster = 'C:\\' + 'x'.repeat(80);
    expect(elideDirectoryMiddle(monster, 20)).toBe(monster);
  });

  it('respects the default budget', () => {
    const elided = elideDirectoryMiddle(
      'C:\\dev\\projects\\havdm\\testing\\round4\\uat\\dashboards',
    );
    expect(elided.length).toBeLessThanOrEqual(DEFAULT_MAX_DIRECTORY_LENGTH);
  });
});

describe("recentFileMenuLabel — ruling R5's format", () => {
  it('renders `N. name — directory`, the format the ruling specifies', () => {
    // R5's own worked example.
    expect(recentFileMenuLabel('C:\\dev\\dashboards\\uat_dashboard4.yaml', 0)).toBe(
      '1. uat_dashboard4.yaml — C:\\dev\\dashboards',
    );
  });

  it('numbers from 1', () => {
    expect(recentFileMenuLabel('/home/micah/b.yaml', 2)).toBe('3. b.yaml — /home/micah');
  });

  it('elides the directory of a deep path but never the file name', () => {
    const label = recentFileMenuLabel(
      'C:\\Users\\micah\\projects\\HA_Visual_Dashboard_Maker\\tests\\fixtures\\known-good.yaml',
      1,
    );
    expect(label.startsWith('2. known-good.yaml — ')).toBe(true);
    expect(label).toContain('…');
    // ⚠ The NAME is what the user scans for; it must never be shortened.
    expect(label).toContain('known-good.yaml');
  });

  it('omits the separator entirely when there is no directory', () => {
    // `name — ` with nothing after it reads as a rendering bug.
    expect(recentFileMenuLabel('dashboard.yaml', 0)).toBe('1. dashboard.yaml');
  });

  it('distinguishes two same-named files in different folders — the whole point', () => {
    // Exact labels rather than `toContain`, for the reason recorded in
    // `menu.spec.ts`: a substring assertion over a Windows path can be satisfied
    // by an implementation that simply failed to split the path at all.
    expect(recentFileMenuLabel('C:\\dev\\alpha\\dashboard.yaml', 0)).toBe(
      '1. dashboard.yaml — C:\\dev\\alpha',
    );
    expect(recentFileMenuLabel('D:\\work\\beta\\dashboard.yaml', 1)).toBe(
      '2. dashboard.yaml — D:\\work\\beta',
    );
  });
});
