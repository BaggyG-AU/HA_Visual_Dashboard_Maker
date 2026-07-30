/**
 * Where the dashboard templates live, in dev and in a packaged app.
 *
 * ⚠⚠ THIS EXISTS BECAUSE THE TEMPLATES DID NOT SHIP AT ALL. UAT card FILE-03 is a
 * packaged-app card, and measured against the round-1 Win64 build
 * (`out/HA Visual Dashboard Maker-win32-x64/`, whose `resources/` held ONLY
 * `app.asar`):
 *     grep -c -a -F "templates.json" resources/app.asar  ->  0
 *     grep -c -a -F "home-overview"  resources/app.asar  ->  0
 * `forge.config.ts` had no `extraResource`, and the `fs:getTemplatePath` handler
 * joined `__dirname/../../templates` unconditionally — which in dev is the repo
 * folder, and in a packaged app is `resources/app.asar/templates`, a path that
 * does not exist. So the templates were reachable in development and absent from
 * every installer.
 *
 * ⭐ The fix has two halves and NEITHER works alone: `extraResource: ['templates']`
 * in `forge.config.ts` puts the folder in `resources/`, and this module points at
 * it. Kept as a pure function taking its environment as an argument so the
 * packaged branch can be asserted in a unit test rather than only by building an
 * installer — see `tests/unit/templatePaths.spec.ts`.
 */
import * as path from 'path';

export const TEMPLATES_DIR_NAME = 'templates';

export interface TemplatePathContext {
  /** `app.isPackaged` — false under `electron-forge start` and in the test harness. */
  isPackaged: boolean;
  /** The main bundle's `__dirname`, i.e. `<root>/.vite/build`. */
  dirname: string;
  /** `process.resourcesPath` — the `resources/` folder beside the executable. */
  resourcesPath: string;
}

/**
 * The directory holding `templates.json` and the template YAML files.
 *
 * Packaged: `<resources>/templates`, placed there by `extraResource`. Deliberately
 * NOT derived from `__dirname`, which points inside `app.asar`.
 * Dev: two levels above the main bundle, i.e. the repo's own `templates/`.
 */
export function templatesDirectory(ctx: TemplatePathContext): string {
  return ctx.isPackaged
    ? path.join(ctx.resourcesPath, TEMPLATES_DIR_NAME)
    : path.join(ctx.dirname, '..', '..', TEMPLATES_DIR_NAME);
}

/**
 * Resolve one template file to an absolute path, refusing anything that escapes
 * the templates directory.
 *
 * ⚠ The containment check is not decoration. `fs:readFile` accepts ANY absolute
 * path unvalidated (a standing security item), and the filename reaching here is
 * the `file` field out of `templates.json` — a JSON file on disk that a
 * hand-edited install or an imported preset could supply. This handler is the only
 * place that traversal can be stopped.
 */
export function resolveTemplatePath(filename: string, ctx: TemplatePathContext): string {
  if (typeof filename !== 'string' || filename.trim().length === 0) {
    throw new Error('A template filename is required');
  }

  const directory = path.resolve(templatesDirectory(ctx));
  const resolved = path.resolve(directory, filename);

  if (!resolved.startsWith(directory + path.sep)) {
    throw new Error(`Template "${filename}" resolves outside the templates directory`);
  }

  return resolved;
}
