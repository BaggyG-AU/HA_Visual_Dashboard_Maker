/**
 * Templates DSL
 *
 * Drives the template selection dialog reached from New Dashboard → From Template.
 *
 * ⚠ antd v6 note: `getByTestId('<modal>')` is always reported hidden, because antd
 * puts the testid on `.ant-modal-root` while the visible node is `.ant-modal-wrap`.
 * Every visibility assertion here therefore targets `template-selection-content`,
 * a plain `<div>` INSIDE the modal body, never the modal root.
 *
 * ⚠ Setters assert their own effect before returning — a DSL setter that can
 * silently no-op turns every downstream assertion into a test of the wrong thing.
 */

import { Page, expect } from '@playwright/test';

export class TemplatesDSL {
  constructor(private window: Page) {}

  /**
   * Open the template selection dialog from the New Dashboard dialog.
   *
   * Assumes the New Dashboard dialog is already open; `new-dashboard-template-option`
   * is a PRE-EXISTING testid, so this leg needs no new instrumentation.
   */
  async openFromNewDashboardDialog(): Promise<void> {
    const option = this.window.getByTestId('new-dashboard-template-option');
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await this.expectOpen();
  }

  /**
   * Wait until the dialog is open AND its metadata load has SETTLED.
   *
   * ⚠⚠ WAITING FOR THE MODAL BODY ALONE IS NOT ENOUGH, AND THIS CAUSED A REAL
   * FLAKE. `template-selection-content` renders immediately while the templates
   * are still being read over IPC (a `Spin` is showing), so a read taken right
   * after it appeared returned ZERO tiles about 2 times in 5. The settled state
   * has its own marker already: `template-selection-count` renders only when
   * loading has finished and the metadata loaded, and
   * `template-selection-load-error` renders when it failed. Waiting for EITHER is
   * deterministic and covers both outcomes — waiting only for the happy one would
   * hang for the full timeout on a load failure instead of reporting it.
   */
  async expectOpen(timeout = 10000): Promise<void> {
    await expect(this.window.getByTestId('template-selection-content')).toBeVisible({ timeout });
    const settled = this.window
      .getByTestId('template-selection-count')
      .or(this.window.getByTestId('template-selection-load-error'));
    await expect(settled.first()).toBeVisible({ timeout });
  }

  /**
   * Assert how many template tiles are offered.
   *
   * ⭐ An auto-retrying assertion, unlike reading `getTemplateIds()` and checking
   * `.length`: the search runs through an async service call, so a snapshot read
   * taken immediately after typing can catch the pre-filter list. Playwright's
   * `toHaveCount` polls, which is what makes this stable without the test having
   * to know how long the filter takes.
   */
  async expectOfferedCount(count: number, timeout = 10000): Promise<void> {
    await expect(this.window.locator('[data-template-id]')).toHaveCount(count, { timeout });
  }

  /** Assert a template is NOT among those offered (its tile is removed, not hidden). */
  async expectTemplateNotOffered(id: string, timeout = 10000): Promise<void> {
    await expect(this.getTemplateTile(id)).toHaveCount(0, { timeout });
  }

  async expectClosed(timeout = 10000): Promise<void> {
    await expect(this.window.getByTestId('template-selection-content')).toHaveCount(0, { timeout });
  }

  /**
   * The readable names of every template tile currently offered, in display order.
   */
  async getTemplateNames(): Promise<string[]> {
    await this.expectOpen();
    const names = this.window.getByTestId('template-option-name');
    const count = await names.count();
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      out.push(((await names.nth(i).textContent()) ?? '').trim());
    }
    return out;
  }

  /**
   * The template ids currently offered, read off each tile's own testid-bearing
   * wrapper via `data-template-id` (the tile testid is per-id, so a single
   * locator needs the attribute rather than the testid to enumerate).
   */
  async getTemplateIds(): Promise<string[]> {
    await this.expectOpen();
    return await this.window
      .locator('[data-template-id]')
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute('data-template-id') ?? '').filter(Boolean),
      );
  }

  getTemplateTile(id: string) {
    return this.window.getByTestId(`template-option-${id}`);
  }

  async expectTemplateOffered(id: string): Promise<void> {
    await expect(this.getTemplateTile(id)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Type into the search box. Asserts the input actually holds the query before
   * returning, so a swallowed keystroke cannot masquerade as a filter result.
   *
   * ⚠⚠ `fill()`, NOT `pressSequentially()`. This is a plain antd `Input` bound to
   * React state whose `onChange` kicks off an async `searchTemplates` call, so
   * per-character typing races the re-render: in the full suite on a hot machine
   * `pressSequentially('zzzznotathing')` landed **"zzzznotat"** — the last four
   * keystrokes were dropped — while the same call passed twice in isolation.
   * `fill()` sets the value and dispatches ONE input event, which is all a
   * controlled input needs.
   *
   * ⭐ The standing repo note "use `pressSequentially()`, not `keyboard.type()`"
   * is about antd **Select** comboboxes, where `fill()` does not trigger the
   * search. It does not apply to an `Input`, and applying it here created a
   * load-sensitive flake in a test that was otherwise green.
   */
  async search(query: string): Promise<void> {
    const input = this.window.getByTestId('template-selection-search').locator('input');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill(query);
    await expect(input).toHaveValue(query);
  }

  async clearSearch(): Promise<void> {
    const input = this.window.getByTestId('template-selection-search').locator('input');
    await input.fill('');
    await expect(input).toHaveValue('');
  }

  /**
   * The "Showing N of M" disclosure text.
   */
  async getVisibleCountText(): Promise<string> {
    return ((await this.window.getByTestId('template-selection-count').textContent()) ?? '').trim();
  }

  /**
   * Choose a template and wait for the dialog to close.
   */
  async chooseTemplate(id: string): Promise<void> {
    const tile = this.getTemplateTile(id);
    await expect(tile).toBeVisible({ timeout: 10000 });
    await tile.click();
    await this.expectClosed();
  }

  /**
   * The honest "we could not load the templates" state — distinct from
   * "your search matched nothing", which is `template-selection-no-matches`.
   */
  async expectLoadFailureNotice(): Promise<void> {
    await expect(this.window.getByTestId('template-selection-load-error')).toBeVisible({
      timeout: 10000,
    });
  }

  async expectNoMatchesNotice(): Promise<void> {
    await expect(this.window.getByTestId('template-selection-no-matches')).toBeVisible({
      timeout: 10000,
    });
  }

  async cancel(): Promise<void> {
    await this.window.getByTestId('template-selection-cancel').click();
    await this.expectClosed();
  }
}
