/**
 * resolveTemplatePath — the packaging half of UAT card FILE-03.
 *
 * ⚠⚠ MEASURED ON `7866251`, BEFORE THIS SLICE: the templates did not ship at all.
 * Against the UAT round-1 Win64 build on disk
 * (`out/HA Visual Dashboard Maker-win32-x64/`), whose `resources/` contained ONLY
 * `app.asar`:
 *     grep -c -a -F "templates.json" resources/app.asar  ->  0
 *     grep -c -a -F "home-overview"  resources/app.asar  ->  0
 * and `forge.config.ts`'s `packagerConfig` had no `extraResource` and no reference
 * to `templates/`. The old handler joined `__dirname/../../templates`, which in dev
 * is the repo folder and in a packaged app is `resources/app.asar/templates` — a
 * path that does not exist.
 *
 * ⭐ So a fix that only wired the dialog would have worked perfectly in dev, passed
 * every gate including the full e2e suite, and still failed FILE-03 in round 2,
 * because the tester runs the installer. This is the branch that stops that, and
 * it is a pure function precisely so it can be asserted without packaging.
 */

import { describe, expect, it } from 'vitest';
import * as path from 'path';
import { resolveTemplatePath, TEMPLATES_DIR_NAME } from '../../src/utils/templatePaths';

// Realistic values. In dev the main bundle runs from `.vite/build`; in a packaged
// app Electron sets `process.resourcesPath` to the `resources/` directory beside
// the executable, which is where `extraResource` copies `templates/`.
const DEV_DIRNAME = '/repo/.vite/build';
const PACKAGED_DIRNAME = '/opt/app/resources/app.asar/.vite/build';
const PACKAGED_RESOURCES = '/opt/app/resources';

describe('resolveTemplatePath', () => {
  it('dev: resolves relative to the repo folder, two levels above the main bundle', () => {
    const p = resolveTemplatePath('templates.json', {
      isPackaged: false,
      dirname: DEV_DIRNAME,
      resourcesPath: PACKAGED_RESOURCES,
    });

    expect(p).toBe(path.join('/repo', TEMPLATES_DIR_NAME, 'templates.json'));
  });

  it('⭐ packaged: resolves under process.resourcesPath, NOT inside the asar', () => {
    const p = resolveTemplatePath('templates.json', {
      isPackaged: true,
      dirname: PACKAGED_DIRNAME,
      resourcesPath: PACKAGED_RESOURCES,
    });

    expect(p).toBe(path.join(PACKAGED_RESOURCES, TEMPLATES_DIR_NAME, 'templates.json'));
    // The regression this exists to prevent: the round-1 build looked here and
    // found nothing, because the path pointed inside app.asar.
    expect(p).not.toContain('app.asar');
  });

  it('packaged: ignores __dirname entirely — the asar location cannot leak in', () => {
    const a = resolveTemplatePath('home-overview.yaml', {
      isPackaged: true,
      dirname: PACKAGED_DIRNAME,
      resourcesPath: PACKAGED_RESOURCES,
    });
    const b = resolveTemplatePath('home-overview.yaml', {
      isPackaged: true,
      dirname: '/somewhere/else/entirely',
      resourcesPath: PACKAGED_RESOURCES,
    });

    expect(a).toBe(b);
  });

  it('dev: ignores resourcesPath entirely', () => {
    const a = resolveTemplatePath('home-overview.yaml', {
      isPackaged: false,
      dirname: DEV_DIRNAME,
      resourcesPath: PACKAGED_RESOURCES,
    });
    const b = resolveTemplatePath('home-overview.yaml', {
      isPackaged: false,
      dirname: DEV_DIRNAME,
      resourcesPath: '/quite/different',
    });

    expect(a).toBe(b);
  });

  it('resolves each shipped template filename into the same directory', () => {
    const ctx = {
      isPackaged: true,
      dirname: PACKAGED_DIRNAME,
      resourcesPath: PACKAGED_RESOURCES,
    };
    const files = ['templates.json', 'home-overview.yaml', 'media-entertainment.yaml'];
    const dirs = new Set(files.map((f) => path.dirname(resolveTemplatePath(f, ctx))));

    expect(dirs.size).toBe(1);
    expect([...dirs][0]).toBe(path.join(PACKAGED_RESOURCES, TEMPLATES_DIR_NAME));
  });

  it('⚠ refuses a filename that would escape the templates directory', () => {
    const ctx = {
      isPackaged: true,
      dirname: PACKAGED_DIRNAME,
      resourcesPath: PACKAGED_RESOURCES,
    };

    // `fs:readFile` accepts ANY absolute path unvalidated, so the template path
    // handler is the only place a traversal can be stopped. The metadata's `file`
    // field is the untrusted input here — it comes from a JSON file on disk that
    // a preset or a hand-edited install could supply.
    expect(() => resolveTemplatePath('../../../etc/passwd', ctx)).toThrow(/templates directory/i);
    expect(() => resolveTemplatePath('nested/../../escape.yaml', ctx)).toThrow(
      /templates directory/i,
    );
  });

  it('rejects an empty or non-string filename rather than returning the directory', () => {
    const ctx = {
      isPackaged: false,
      dirname: DEV_DIRNAME,
      resourcesPath: PACKAGED_RESOURCES,
    };

    expect(() => resolveTemplatePath('', ctx)).toThrow();
    expect(() => resolveTemplatePath('   ', ctx)).toThrow();
  });

  it('allows a plain nested filename that stays inside the directory', () => {
    const p = resolveTemplatePath('extra/custom.yaml', {
      isPackaged: false,
      dirname: DEV_DIRNAME,
      resourcesPath: PACKAGED_RESOURCES,
    });

    expect(p).toBe(path.join('/repo', TEMPLATES_DIR_NAME, 'extra', 'custom.yaml'));
  });
});
