/**
 * templateService — the first tests this service has ever had.
 *
 * ⚠⚠ UAT card FILE-03 cites `tests/e2e/templates.spec.ts` as proving "a template
 * loads and produces cards". It did not: before this slice `templateService` had
 * ZERO importers anywhere in `src/` or `tests/` and had never been executed, and
 * the cited spec filtered a hand-rolled copy of `searchTemplates` written inline
 * in the test body — asserting its own reimplementation while the product's copy
 * was never called. These tests drive the REAL service.
 *
 * The metadata fed in is the REAL `templates/templates.json` read off disk, so a
 * malformed or renamed shipped template fails here rather than in front of a
 * tester. (Slice 2's registry spec used real captured rows for the same reason.)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { templateService } from '../../src/services/templateService';

const REPO_ROOT = path.join(__dirname, '../..');
const TEMPLATES_DIR = path.join(REPO_ROOT, 'templates');
const realMetadataJson = fs.readFileSync(path.join(TEMPLATES_DIR, 'templates.json'), 'utf-8');

interface ReadFileResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Stub the two electronAPI members templateService uses. `getTemplatePath`
 * mirrors the main-process handler's join so the service is exercised against
 * realistic absolute paths rather than bare filenames.
 */
function stubApi(readFile: (p: string) => ReadFileResult) {
  const getTemplatePath = vi.fn(async (filename: string) => path.join(TEMPLATES_DIR, filename));
  const readFileMock = vi.fn(async (p: string) => readFile(p));
  (window as unknown as { electronAPI: Record<string, unknown> }).electronAPI = {
    getTemplatePath,
    readFile: readFileMock,
  };
  return { getTemplatePath, readFile: readFileMock };
}

/** The happy path: every file under templates/ resolves off disk. */
function stubRealDisk() {
  return stubApi((p) => {
    try {
      return { success: true, content: fs.readFileSync(p, 'utf-8') };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  });
}

beforeEach(() => {
  templateService.clearCache();
});

afterEach(() => {
  vi.clearAllMocks();
  templateService.clearCache();
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

describe('templateService.loadMetadata', () => {
  it('reads templates.json through the IPC surface and parses it', async () => {
    const api = stubRealDisk();
    const metadata = await templateService.loadMetadata();

    expect(api.getTemplatePath).toHaveBeenCalledWith('templates.json');
    expect(metadata).toEqual(JSON.parse(realMetadataJson));
  });

  it('caches — a second call does not re-read the file', async () => {
    const api = stubRealDisk();
    await templateService.loadMetadata();
    await templateService.loadMetadata();

    expect(api.readFile).toHaveBeenCalledTimes(1);
  });

  it('clearCache() forces a re-read', async () => {
    const api = stubRealDisk();
    await templateService.loadMetadata();
    templateService.clearCache();
    await templateService.loadMetadata();

    expect(api.readFile).toHaveBeenCalledTimes(2);
  });

  it('⚠ returns EMPTY metadata when the file cannot be read, it does not throw', async () => {
    // This is the behaviour the selection dialog has to interpret: a packaging
    // failure surfaces here as an empty list, NOT as an error. The dialog treats
    // an empty list as "could not load templates" precisely because seven
    // templates always ship, so [] can only mean the read failed.
    stubApi(() => ({ success: false, error: 'ENOENT' }));
    const metadata = await templateService.loadMetadata();

    expect(metadata).toEqual({ templates: [], categories: [] });
  });

  it('returns EMPTY metadata when the file is present but unparseable', async () => {
    stubApi(() => ({ success: true, content: 'not json {{{' }));
    const metadata = await templateService.loadMetadata();

    expect(metadata).toEqual({ templates: [], categories: [] });
  });
});

describe('templateService — the shipped template set', () => {
  it('offers seven templates, each with a readable name and a real category', async () => {
    stubRealDisk();
    const templates = await templateService.getTemplates();
    const categories = await templateService.getCategories();
    const categoryIds = new Set(categories.map((c) => c.id));

    expect(templates).toHaveLength(7);
    for (const t of templates) {
      expect(t.name.trim().length).toBeGreaterThan(0);
      expect(t.name).not.toBe(t.id); // a readable name, not the slug
      expect(categoryIds.has(t.category)).toBe(true);
    }
  });

  it('every template names a YAML file that actually exists on disk', async () => {
    stubRealDisk();
    const templates = await templateService.getTemplates();

    for (const t of templates) {
      expect(fs.existsSync(path.join(TEMPLATES_DIR, t.file)), `${t.id} → ${t.file}`).toBe(true);
    }
  });

  it('getTemplate() resolves by id and returns null for an unknown id', async () => {
    stubRealDisk();

    await expect(templateService.getTemplate('home-overview')).resolves.toMatchObject({
      id: 'home-overview',
      name: 'Home Overview',
    });
    await expect(templateService.getTemplate('no-such-template')).resolves.toBeNull();
  });

  it('getTemplatesByCategory() and getTemplatesByDifficulty() partition the set', async () => {
    stubRealDisk();

    await expect(templateService.getTemplatesByCategory('overview')).resolves.toHaveLength(1);
    await expect(templateService.getTemplatesByCategory('nope')).resolves.toEqual([]);
    const beginner = await templateService.getTemplatesByDifficulty('beginner');
    expect(beginner.length).toBeGreaterThan(0);
    expect(beginner.every((t) => t.difficulty === 'beginner')).toBe(true);
  });
});

describe('templateService.searchTemplates — the product code the old spec bypassed', () => {
  it('matches on name', async () => {
    stubRealDisk();
    const hits = await templateService.searchTemplates('home');

    expect(hits.map((t) => t.id)).toContain('home-overview');
  });

  it('is case-insensitive', async () => {
    stubRealDisk();
    const lower = await templateService.searchTemplates('lighting');
    const upper = await templateService.searchTemplates('LIGHTING');

    expect(upper.map((t) => t.id)).toEqual(lower.map((t) => t.id));
    expect(lower.length).toBeGreaterThan(0);
  });

  it('matches on description, tags and features, not just the name', async () => {
    stubRealDisk();
    const templates = await templateService.getTemplates();
    const target = templates[0];

    // A tag that does NOT appear in the name, so a name-only implementation
    // would fail this — which is the whole point of asserting the real service.
    const tagNotInName = target.tags.find(
      (tag) => !target.name.toLowerCase().includes(tag.toLowerCase()),
    );
    expect(tagNotInName, `${target.id} needs a tag absent from its name`).toBeTruthy();

    const hits = await templateService.searchTemplates(tagNotInName as string);
    expect(hits.map((t) => t.id)).toContain(target.id);
  });

  it('returns nothing for a query that matches no template', async () => {
    stubRealDisk();

    await expect(templateService.searchTemplates('zzzznotathing')).resolves.toEqual([]);
  });

  it('an empty query matches everything', async () => {
    stubRealDisk();

    await expect(templateService.searchTemplates('')).resolves.toHaveLength(7);
  });
});

describe('templateService.loadTemplate', () => {
  it('returns the YAML content of the named template', async () => {
    stubRealDisk();
    const yaml = await templateService.loadTemplate('home-overview');

    expect(yaml).toBe(fs.readFileSync(path.join(TEMPLATES_DIR, 'home-overview.yaml'), 'utf-8'));
    expect(yaml).toContain('views:');
  });

  it('loads all seven shipped templates without error', async () => {
    stubRealDisk();
    const templates = await templateService.getTemplates();

    for (const t of templates) {
      const yaml = await templateService.loadTemplate(t.id);
      expect(yaml.length, t.id).toBeGreaterThan(0);
    }
  });

  it('throws a named error for an unknown template id', async () => {
    stubRealDisk();

    await expect(templateService.loadTemplate('no-such-template')).rejects.toThrow(
      /'no-such-template' not found/,
    );
  });

  it('throws — rather than returning empty content — when the YAML cannot be read', async () => {
    // Distinct from loadMetadata's swallow-and-return-empty: a template the user
    // explicitly chose must fail loudly, or the canvas would be replaced with
    // nothing while the app reported success.
    stubApi((p) =>
      p.endsWith('templates.json')
        ? { success: true, content: realMetadataJson }
        : { success: false, error: 'EACCES' },
    );

    await expect(templateService.loadTemplate('home-overview')).rejects.toThrow(/EACCES/);
  });
});
