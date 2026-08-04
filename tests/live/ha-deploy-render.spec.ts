import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { load as parseYaml } from 'js-yaml';
import {
  KEEP_DEPLOYED,
  LIVE_DASHBOARD_URL_PATH,
  LIVE_HA_BASE,
  LIVE_HA_TOKEN_PATH,
  connectLiveHa,
  deployLiveDashboard,
  haAuthPayload,
  liveHaAvailable,
  readLiveToken,
  removeLiveDashboards,
  type HaSocket,
} from '../support/liveHa';

/**
 * FR-04's round trip, COMPLETED — deploy HAVDM's own export to a real Home
 * Assistant and look at what renders.
 *
 * ⭐ WHY THIS EXISTS, AND IT IS NOT AN ABSTRACT GAP. HAVDM's whole value
 * proposition is that what comes out of Export renders in Home Assistant the way
 * the canvas promised. Until this spec, the project had never once measured
 * that: `tests/` contained no test that connected to a live instance, and the
 * `ha.home.local` references in fixtures were provenance COMMENTS.
 *
 * The cost of that gap was paid on 2026-08-04. An agent measured — correctly —
 * that HAVDM's export drops `type: sections` from a sections view, then ASSUMED
 * what Home Assistant does with a typeless view, concluded "silent data loss,
 * every card invisible", and wrote it into a commit message, a PR body, a spec
 * comment, a tester-facing document and a memory drawer. It was wrong. Home
 * Assistant resolves a view's layout with a fallback chain
 * (`type ?? (panel ? 'panel' : sections ? 'sections' : cards ? 'masonry' : 'sections')`)
 * and renders it correctly. **Reading our own code proves what we EMIT; it never
 * proves what the CONSUMER does with it.** This spec is the instrument that
 * makes that class of claim measurable instead of assumable.
 *
 * ⚠ SCOPE — WHAT THIS DOES NOT DO. It deploys the exported ARTIFACT over the
 * WebSocket API; it does not drive HAVDM's own Deploy dialog. It cannot yet:
 * `DeployDialog.tsx:118-120` demands a `cards` array on every view and so
 * refuses this dashboard outright (round-3 HA-07, fix F1). **Once F1 lands, the
 * better test is to drive the product's own deploy path, and this spec should be
 * revisited rather than left as the final word.**
 *
 * ⚠ MECHANICAL ASSERTIONS ONLY, BY DESIGN (amendment-04 §3.2). "Did N cards
 * render, and is this a sections view" is a DOM question and belongs here.
 * "Does this look right" is a human judgement and belongs in UAT. A screenshot
 * an agent takes is not a person looking at it.
 *
 * Run: `HAVDM_LIVE=1 npx playwright test --project=live-ha`
 * Keep the dashboard for inspection: add `HAVDM_LIVE_KEEP=1`.
 */

const ARTIFACT_PATH = resolve(__dirname, '../fixtures/uat/known-good-dashboard.ha.yaml');

const token = readLiveToken();

/**
 * Count elements by tag name across the WHOLE tree, piercing shadow roots.
 *
 * ⚠ Home Assistant's frontend is nested custom elements, so `document.querySelectorAll`
 * alone sees almost nothing — and `document.body.innerText` returns EMPTY, which
 * is why the first probe's text assertions silently passed on nothing. Walking
 * `shadowRoot` explicitly is the only way to get a true count.
 */
const DEEP_COUNT = `(() => {
  const tags = [];
  const walk = (root) => {
    for (const el of root.querySelectorAll('*')) {
      tags.push(el.tagName.toLowerCase());
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document);
  return tags;
})()`;

/** Text content across the whole tree, shadow roots included. */
const DEEP_TEXT = `(() => {
  let text = '';
  const walk = (root) => {
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) walk(el.shadowRoot);
      else if (el.children.length === 0 && el.textContent) text += el.textContent + ' ';
    }
  };
  walk(document);
  return text;
})()`;

test.describe("FR-04 — HAVDM's export deployed to a real Home Assistant", () => {
  test.skip(!token, `No token at ${LIVE_HA_TOKEN_PATH} — see Phase 7 amendment 04.`);
  test.describe.configure({ mode: 'serial' });

  let ha: HaSocket | null = null;

  test.beforeAll(async () => {
    test.skip(!(await liveHaAvailable(token as string)), `${LIVE_HA_BASE} is not reachable.`);
    ha = await connectLiveHa(token as string);
  });

  test.afterAll(async () => {
    // Amendment-04 §4: teardown by DEFAULT, in a teardown hook so a failing
    // assertion cannot leak a dashboard onto the instance.
    if (ha) {
      if (!KEEP_DEPLOYED) await removeLiveDashboards(ha);
      ha.close();
    }
  });

  test('renders both views correctly, with the sections view intact', async ({ page }) => {
    test.setTimeout(180_000);
    const socket = ha as HaSocket;

    const config = parseYaml(readFileSync(ARTIFACT_PATH, 'utf8')) as {
      views: Array<{ title?: string; type?: string }>;
    };

    // The artifact really is the shape under test: neither view declares a
    // `type`, because the export strips it (F9). Home Assistant is expected to
    // infer masonry for the first and SECTIONS for the second.
    expect(config.views).toHaveLength(2);
    expect(config.views[0].type).toBeUndefined();
    expect(config.views[1].type).toBeUndefined();

    await deployLiveDashboard(socket, config);

    // Read it back from Home Assistant, not from our own memory — this is the
    // first point at which HA, rather than HAVDM, is the source of truth.
    const stored = await socket.send<{
      views: Array<{ title?: string; sections?: unknown[]; cards?: unknown[] }>;
    }>('lovelace/config', { url_path: LIVE_DASHBOARD_URL_PATH });
    expect(stored.views).toHaveLength(2);
    expect(stored.views[1].sections).toHaveLength(2);

    await page.context().addInitScript(
      ({ payload }) => {
        window.localStorage.setItem('hassTokens', JSON.stringify(payload));
      },
      { payload: haAuthPayload(token as string) },
    );

    const cardCount = async () => {
      const tags = (await page.evaluate(DEEP_COUNT)) as string[];
      return tags.filter((t) => t === 'hui-card').length;
    };

    const inspect = async (viewIndex: number) => {
      await page.goto(`${LIVE_HA_BASE}/${LIVE_DASHBOARD_URL_PATH}/${viewIndex}`, {
        waitUntil: 'domcontentloaded',
      });

      // ⚠⚠ WAIT FOR THE DOM TO SETTLE, NOT FOR THE ANSWER WE WANT. Home
      // Assistant lazy-loads its Lovelace chunks and then each HACS resource, so
      // cards appear in waves — the first version of this spec polled for
      // `hui-card > 0` and sampled at 2 of 5, mid-wave.
      //
      // ⭐ The fix must NOT be "poll until the count equals 5": that folds the
      // assertion into the wait, leaving a test that can only pass or time out
      // and can never report a WRONG count. So settle on STABILITY instead —
      // the same non-zero count twice in succession — and let the assertion
      // afterwards be the thing that judges it.
      let previous = -1;
      await expect
        .poll(
          async () => {
            const current = await cardCount();
            const stable = current > 0 && current === previous;
            previous = current;
            return stable;
          },
          { timeout: 60_000, intervals: [1000] },
        )
        .toBe(true);

      const tags = (await page.evaluate(DEEP_COUNT)) as string[];
      const text = (await page.evaluate(DEEP_TEXT)) as string;
      const count = (tag: string) => tags.filter((t) => t === tag).length;
      return { count, text };
    };

    // ---- View 0: "Home", a masonry view ------------------------------------
    const home = await inspect(0);
    expect(home.count('hui-masonry-view')).toBe(1);
    expect(home.count('hui-sections-view')).toBe(0);
    expect(home.count('hui-card')).toBe(5);

    // Every authored card type reached Home Assistant and rendered as itself.
    expect(home.count('hui-tile-card')).toBe(1);
    expect(home.count('hui-button-card')).toBe(1);
    expect(home.count('hui-weather-forecast-card')).toBe(1);
    expect(home.count('mushroom-person-card')).toBe(1);

    // ⭐ THE HONEST-MARKING PATH, OBSERVED END TO END FOR THE FIRST TIME. The
    // canvas-only `custom:popup-card` was substituted with a NATIVE markdown
    // placeholder (vision answer 9), and Home Assistant renders it. Had the
    // export emitted `type: spacer` — itself a phantom type — HA would show
    // "Unknown type encountered" here, which is the exact tile being avoided.
    expect(home.count('hui-markdown-card')).toBe(1);
    expect(home.text).toContain('Card Not Available');
    expect(home.count('hui-error-card')).toBe(0);
    expect(home.text).not.toContain('Unknown type encountered');

    // ---- View 1: "Energy", a sections view ---------------------------------
    const energy = await inspect(1);

    // ⭐⭐ THE ASSERTION THIS WHOLE SPEC EXISTS FOR. The exported view carries no
    // `type`, yet Home Assistant renders it as SECTIONS — because a `sections`
    // key is present. All six cards appear. This is the measurement that
    // refutes the "silent data loss" claim of 2026-08-04 by OBSERVATION rather
    // than by reading HA's source.
    expect(energy.count('hui-sections-view')).toBe(1);
    expect(energy.count('hui-masonry-view')).toBe(0);
    expect(energy.count('hui-grid-section')).toBe(2);
    expect(energy.count('hui-card')).toBe(6);

    expect(energy.count('hui-heading-card')).toBe(2);
    expect(energy.count('hui-gauge-card')).toBe(2);
    expect(energy.count('hui-tile-card')).toBe(2);
    expect(energy.count('hui-error-card')).toBe(0);
    expect(energy.text).not.toContain('Unknown type encountered');

    // Both section headings survived the round trip as real heading cards.
    expect(energy.text).toContain('Solar & Battery');
    expect(energy.text).toContain('Vehicle & Grid');
  });

  test('teardown removes the deployed dashboard', async () => {
    const socket = ha as HaSocket;
    test.skip(KEEP_DEPLOYED, 'HAVDM_LIVE_KEEP=1 — deployment deliberately retained.');

    // ⚠ Asserting teardown rather than trusting the hook. Amendment-04 §4 makes
    // teardown mandatory, and round 3 left three orphan dashboards on the
    // reference instance precisely because nothing verified it happened. A
    // teardown step nothing checks is one that can silently not happen.
    await removeLiveDashboards(socket);
    const dashboards = await socket.send<Array<{ url_path: string }>>('lovelace/dashboards/list');
    expect(dashboards.filter((d) => d.url_path === LIVE_DASHBOARD_URL_PATH)).toEqual([]);
  });
});
