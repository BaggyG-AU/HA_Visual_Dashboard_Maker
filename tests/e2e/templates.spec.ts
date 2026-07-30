/**
 * E2E Test: Dashboard Templates (DSL-Based) — UAT card FILE-03.
 *
 * ⚠⚠ WHAT THIS FILE USED TO BE, AND WHY IT WAS REPLACED. UAT card FILE-03's
 * `auto_note` claimed this spec "proves a template loads and produces cards". It
 * did not. It was 70 lines of three tests, every name containing "pending", and
 * its own header said "Templates UI is not fully implemented; tests are scoped to
 * smoke checks and placeholders":
 *   - test 1 asserted only that `window.title()` contained the app name;
 *   - test 2, named "should warn before replacing current dashboard", added a
 *     button card by hand and asserted a card count of 1 — it never loaded a
 *     template and never checked any warning;
 *   - test 3 read `templates/templates.json` with Node `fs` and filtered it with a
 *     JS expression written inline in the test body, then asserted that filter had
 *     returned something. It reimplemented the feature inside the test file and
 *     asserted its own reimplementation; `templateService.searchTemplates()` — the
 *     product's copy of that logic — was never called, and the app was never asked
 *     anything.
 * NO test anywhere loaded a template into the app.
 *
 * ⭐ The spec was HONEST — it said "placeholder" in its own header and in every
 * test name. It was the CARD'S CITATION that overstated it. Every previously
 * catalogued form of the `auto_covered` problem was a property of the spec; this
 * one was a property of the citation.
 *
 * The four tests below assert FILE-03's four Expected outcomes directly, and the
 * two after them are control legs over behaviour that already existed.
 *
 * ⚠ Reading `templates/templates.json` and the template YAML here is deliberate
 * and is NOT the old mistake: it derives what the canvas SHOULD contain and then
 * asserts the APP against it. The old test filtered the JSON and asserted the
 * filter.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const TEMPLATES_DIR = path.join(__dirname, '../../templates');

interface TemplateMeta {
  templates: Array<{ id: string; name: string; file: string; category: string }>;
  categories: Array<{ id: string; name: string }>;
}

const metadata = JSON.parse(
  fs.readFileSync(path.join(TEMPLATES_DIR, 'templates.json'), 'utf-8'),
) as TemplateMeta;

/** How many cards a template's first view declares. */
function declaredCardCount(file: string): number {
  const doc = yaml.load(fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf-8')) as {
    views?: Array<{ cards?: unknown[] }>;
  };
  return doc.views?.[0]?.cards?.length ?? 0;
}

const PRIMARY = metadata.templates[0]; // home-overview
const PRIMARY_CARDS = declaredCardCount(PRIMARY.file);

test.describe('Dashboard Templates (FILE-03)', () => {
  test('offers every shipped template with a readable name and category', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.openNewDashboardDialog();
      await ctx.templates.openFromNewDashboardDialog();

      // Expected 1: "A list of templates is offered with readable names."
      //
      // ⚠ Wait for the COMPLETE list with an auto-retrying count before taking a
      // snapshot read. The metadata arrives over IPC, so a read taken as soon as
      // the modal body appeared saw zero tiles.
      await ctx.templates.expectOfferedCount(metadata.templates.length);
      const ids = await ctx.templates.getTemplateIds();
      expect(ids.sort()).toEqual(metadata.templates.map((t) => t.id).sort());

      const names = await ctx.templates.getTemplateNames();
      for (const t of metadata.templates) {
        expect(names, `template ${t.id} must show its readable name`).toContain(t.name);
      }
      // A name, not a slug — the round-1 stub offered nothing at all, and an id
      // like "media-entertainment" would satisfy a laxer assertion.
      expect(names).not.toContain(PRIMARY.id);

      // Categories are shown too, so a tester can tell the seven apart.
      const shownCategories = metadata.categories
        .filter((c) => metadata.templates.some((t) => t.category === c.id))
        .map((c) => c.name);
      const body = await ctx.window.getByTestId('template-selection-content').textContent();
      for (const name of shownCategories) {
        expect(body, `category ${name} must be visible`).toContain(name);
      }
    } finally {
      await close(ctx);
    }
  });

  test('loading a template produces a populated canvas whose cards do not overlap', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.openNewDashboardDialog();
      await ctx.templates.openFromNewDashboardDialog();
      await ctx.templates.chooseTemplate(PRIMARY.id);

      // Expected 2: "Selecting one produces a populated canvas, not an empty one."
      // Asserted against the count the template DECLARES, not a magic number, so
      // editing the template cannot silently weaken the test. This is also what
      // catches `importDashboard`'s silent card drop if a template ever gains a
      // card shape it discards.
      expect(PRIMARY_CARDS).toBeGreaterThan(0);
      await ctx.canvas.expectCardCount(PRIMARY_CARDS, 15000);

      // Expected 3: "Cards are laid out without overlapping each other."
      await ctx.canvas.expectNoOverlappingCards();
    } finally {
      await close(ctx);
    }
  });

  test('a card on a template canvas selects, and the Properties panel targets it', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.openNewDashboardDialog();
      await ctx.templates.openFromNewDashboardDialog();
      await ctx.templates.chooseTemplate(PRIMARY.id);
      await ctx.canvas.expectCardCount(PRIMARY_CARDS, 15000);

      // Expected 4: "Clicking a card selects it and the Properties panel targets
      // that card." Card types come from the template itself, and TWO different
      // cards are clicked — a panel that always showed card 0 would pass a
      // single-click assertion, so one click cannot distinguish "targets the
      // clicked card" from "is open".
      const doc = yaml.load(fs.readFileSync(path.join(TEMPLATES_DIR, PRIMARY.file), 'utf-8')) as {
        views: Array<{ cards: Array<{ type: string }> }>;
      };
      const types = doc.views[0].cards.map((c) => c.type);
      const second = types.findIndex((t, i) => i > 0 && t !== types[0]);
      expect(second, 'template needs two cards of differing type').toBeGreaterThan(0);

      await ctx.canvas.selectCard(0);
      await ctx.canvas.expectCardSelected();
      await ctx.canvas.expectSelectedCardOfType(0, types[0]);
      await ctx.properties.expectCardType(new RegExp(types[0], 'i'));

      await ctx.canvas.selectCard(second);
      await ctx.canvas.expectSelectedCardOfType(second, types[second]);
      await ctx.properties.expectCardType(new RegExp(types[second], 'i'));
    } finally {
      await close(ctx);
    }
  });

  test('search filters the offered templates through the real templateService', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.openNewDashboardDialog();
      await ctx.templates.openFromNewDashboardDialog();

      // ⚠ Every assertion here is auto-retrying and keyed on template ids known
      // from the metadata. An earlier version read `getTemplateIds()` and compared
      // lengths, which raced the async `searchTemplates` call and was flaky 2 in 5.
      // Naming the ids also avoids the old spec's mistake: the expectation comes
      // from the shipped metadata, never from a filter reimplemented in the test.
      await ctx.templates.expectOfferedCount(metadata.templates.length);

      await ctx.templates.search('lighting');
      await ctx.templates.expectTemplateOffered('lighting-control');
      await ctx.templates.expectTemplateNotOffered('media-entertainment');

      // A query matching nothing must say so, distinctly from a load failure.
      await ctx.templates.search('zzzznotathing');
      await ctx.templates.expectNoMatchesNotice();

      // Clearing restores the full set — a filter that cannot be reversed is a
      // picker that has silently lost content.
      await ctx.templates.clearSearch();
      await ctx.templates.expectOfferedCount(metadata.templates.length);
      await ctx.templates.expectTemplateOffered('media-entertainment');
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⭐ CONTROL LEG — pre-existing behaviour, expected to pass before this slice too.
   *
   * The replaced test 2 was named "should warn before replacing current dashboard"
   * and never checked a warning. The warning DOES exist, and it is not in the
   * template path at all: `handleNewDashboard` guards on `isDirty && config`, and
   * the New Dashboard dialog has no other opener. So the template path inherits
   * the confirm exactly as Blank and Sections do, and FILE-03 deliberately adds no
   * second one — a template-specific confirm would double-prompt this case.
   */
  test('the unsaved-changes guard already protects the route to From Template', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);

      // Dirty canvas: New Dashboard must confirm BEFORE offering any tile.
      //
      // ⚠ HIDDEN, not ABSENT. `createNew()` above already opened the New Dashboard
      // dialog once, and antd keeps a closed Modal's DOM (there is no
      // `destroyOnHidden` here), so the tile is still in the document — just not
      // visible. `toHaveCount(0)` failed here while the guard was working
      // correctly. Asserting an absence is the most dangerous assertion available;
      // the property that actually matters is that the user cannot reach the tile.
      await ctx.dashboard.clickNewDashboardExpectingUnsavedGuard();
      await expect(ctx.window.getByTestId('new-dashboard-template-option')).toBeHidden();

      // Cancelling leaves the work intact — "never silently destroy user data".
      await ctx.dashboard.cancelUnsavedGuard();
      await ctx.canvas.expectCardCount(1);

      // Accepting reaches the dialog, and From Template is offered there.
      await ctx.dashboard.clickNewDashboardExpectingUnsavedGuard();
      await ctx.dashboard.acceptUnsavedGuard();
      await expect(ctx.window.getByTestId('new-dashboard-template-option')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⭐ CONTROL LEG — proves adding the template dialog did not disturb the sibling
   * tiles or the dialog's own dismissal, both of which other specs depend on.
   */
  test('the New Dashboard dialog still offers its other options, and cancels cleanly', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.openNewDashboardDialog();

      await expect(ctx.window.getByTestId('new-dashboard-blank-option')).toBeVisible();
      await expect(ctx.window.getByTestId('new-dashboard-sections-option')).toBeVisible();
      await expect(ctx.window.getByTestId('new-dashboard-template-option')).toBeVisible();
      await expect(ctx.window.getByTestId('new-dashboard-entity-type-option')).toBeVisible();

      // Opening then cancelling the template dialog must return to a usable app
      // with nothing loaded — not a half-open modal stack.
      await ctx.templates.openFromNewDashboardDialog();
      await ctx.templates.cancel();
      await ctx.canvas.expectCardCount(0);
    } finally {
      await close(ctx);
    }
  });
});
