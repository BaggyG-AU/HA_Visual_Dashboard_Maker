/**
 * Rendering a file path into a menu label (remediation item F7, ruling R5).
 *
 * UAT defect FILE-06's second half: the tester reported that hovering a recent
 * file shows no tooltip with its full path. `menu.ts` sets Electron's `sublabel`
 * for exactly that purpose — and **`sublabel` and `toolTip` are macOS-ONLY**, so
 * on the Windows build the tester runs, nothing renders at all. Ruling R5
 * therefore puts the path in the LABEL itself, where every platform draws it,
 * and keeps `sublabel` as the macOS nicety it already is.
 *
 * ⚠⚠ WHY THIS FILE DOES NOT USE `node:path`, AND WHY THAT IS NOT AN OVERSIGHT.
 *
 * The paths being rendered come from the machine the app RUNS on, but the tests
 * run here. HAVDM is tested on Linux (WSL2) and the UAT round that raised
 * FILE-06 ran a packaged **Win64** build. `path.dirname('C:\\dev\\x\\y.yaml')`
 * on Linux returns the WHOLE STRING — POSIX `path` does not treat `\` as a
 * separator — so a `node:path` implementation would render Windows paths
 * correctly on Windows, wrongly on Linux, and would be untestable for the only
 * platform whose defect we are fixing. **A green test on the wrong separator is
 * worse than no test.** So the separator is derived from the string itself and
 * every function here is pure, deterministic and platform-independent.
 */

/** Longest directory portion rendered before the middle is elided. */
export const DEFAULT_MAX_DIRECTORY_LENGTH = 42;

const ELLIPSIS = '…';

/**
 * Which separator this path uses. A path containing a backslash is treated as
 * Windows-style; everything else as POSIX. ⚠ Checked in that order on purpose:
 * a Windows path may contain forward slashes (`C:/dev\x`), but a POSIX path
 * essentially never contains a backslash — a backslash in a POSIX filename is a
 * legal but vanishingly rare escape, and mis-rendering that is a cosmetic
 * label issue, whereas mis-rendering every Windows path is the defect.
 */
export const detectSeparator = (filePath: string): '\\' | '/' =>
  filePath.includes('\\') ? '\\' : '/';

/** The file name, without any directory. Separator-agnostic. */
export const basenameOf = (filePath: string): string => {
  const normalised = filePath.replace(/[\\/]+$/, '');
  const lastSeparator = Math.max(normalised.lastIndexOf('\\'), normalised.lastIndexOf('/'));
  return lastSeparator === -1 ? normalised : normalised.slice(lastSeparator + 1);
};

/** The directory containing the file, or '' when the path has no directory. */
export const directoryOf = (filePath: string): string => {
  const normalised = filePath.replace(/[\\/]+$/, '');
  const lastSeparator = Math.max(normalised.lastIndexOf('\\'), normalised.lastIndexOf('/'));
  if (lastSeparator === -1) return '';
  // A root-level file ('/x.yaml') keeps its root rather than becoming ''.
  if (lastSeparator === 0) return normalised.slice(0, 1);
  return normalised.slice(0, lastSeparator);
};

/**
 * Middle-elide a directory so it fits `maxLength`, keeping the ROOT and the
 * DEEPEST folder — the two parts that actually tell two same-named files apart.
 *
 * `C:\dev\projects\havdm\testing\round4\dashboards` -> `C:\dev\…\dashboards`
 *
 * ⭐ The root is kept deliberately. Eliding from the left alone is shorter but
 * drops the drive letter, and on Windows the drive is frequently the ONLY thing
 * distinguishing two recent files with the same name.
 */
export const elideDirectoryMiddle = (
  directory: string,
  maxLength: number = DEFAULT_MAX_DIRECTORY_LENGTH,
): string => {
  if (directory.length <= maxLength) return directory;

  const separator = detectSeparator(directory);
  const segments = directory.split(/[\\/]/).filter((segment) => segment.length > 0);

  // Nothing to elide between — a single enormous segment cannot be shortened
  // without lying about it, so it is returned whole. Better a wide menu item
  // than a path the user cannot identify.
  if (segments.length <= 2) return directory;

  // A UNC path ('\\server\share\…') or a POSIX absolute path ('/home/…') begins
  // with a separator that `split` drops; preserve it so the root still reads as
  // a root rather than as a relative folder.
  const leading = /^[\\/]/.test(directory)
    ? directory.startsWith('\\\\')
      ? '\\\\'
      : separator
    : '';

  const first = segments[0];
  const last = segments[segments.length - 1];
  const elided = `${leading}${first}${separator}${ELLIPSIS}${separator}${last}`;

  // Grow the head back out while it still fits — an elision that keeps more
  // context for free is strictly more useful.
  let bestSegmentCount = 1;
  for (let count = 2; count < segments.length - 1; count++) {
    const candidate = `${leading}${segments.slice(0, count).join(separator)}${separator}${ELLIPSIS}${separator}${last}`;
    if (candidate.length > maxLength) break;
    bestSegmentCount = count;
  }

  return bestSegmentCount === 1
    ? elided
    : `${leading}${segments.slice(0, bestSegmentCount).join(separator)}${separator}${ELLIPSIS}${separator}${last}`;
};

/**
 * The label for one Recent Files entry (ruling R5's format):
 *
 *   `1. uat_dashboard4.yaml — C:\dev\…\dashboards`
 *
 * The ordinal keeps the existing numbering; the file name stays first because
 * it is what the user scans for; the elided directory disambiguates.
 * A file with no directory renders as just `1. dashboard.yaml`, because
 * `name — ` with nothing after it reads as a rendering bug.
 */
export const recentFileMenuLabel = (
  filePath: string,
  index: number,
  maxDirectoryLength: number = DEFAULT_MAX_DIRECTORY_LENGTH,
): string => {
  const name = basenameOf(filePath);
  const directory = directoryOf(filePath);
  const ordinal = `${index + 1}. `;

  if (!directory) return `${ordinal}${name}`;
  return `${ordinal}${name} — ${elideDirectoryMiddle(directory, maxDirectoryLength)}`;
};
