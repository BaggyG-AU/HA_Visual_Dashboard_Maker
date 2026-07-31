/**
 * Dashboard DSL
 *
 * Dashboard-level operations: creating, loading, saving.
 * Encapsulates all dashboard lifecycle interactions.
 */

import { Page, expect } from '@playwright/test';

type DashboardKind = 'blank' | 'template' | 'entityType';
interface CreateDashboardOptions {
  kind?: DashboardKind;
}

export class DashboardDSL {
  constructor(private window: Page) {}

  /**
   * The toolbar's Save button (UAT FILE-05 step 3/4).
   *
   * ⚠ Exposed as a locator rather than wrapped in a `save()` method on purpose:
   * FILE-05's Expected 1 is about the button's ENABLED STATE before it is
   * clicked, so callers need the element, not just the action.
   *
   * ⚠ This button is rendered INSIDE the `config` branch of src/App.tsx — it
   * does not exist at all when no dashboard is open — which is why it can never
   * be the control that produced FILE-05's reported "No dashboard loaded to
   * save". That message can only come from the menu.
   */
  get toolbarSave() {
    return this.window.getByTestId('toolbar-save');
  }

  /**
   * The unsaved-changes marker — the orange asterisk beside the dashboard title.
   *
   * ⚠ It lives in the DOM heading, NOT in the window title.
   * `tests/e2e/file-operations.spec.ts` watched `window.title()` for it and so
   * could never have observed it either appearing or clearing.
   */
  get dirtyIndicator() {
    return this.window.getByTestId('dashboard-dirty-indicator');
  }

  private async waitForCanvasOrEmpty(timeout = 10000): Promise<void> {
    const canvasOrEmpty = this.window
      .getByText(/No cards in this view/i)
      .or(this.window.locator('.react-grid-layout'))
      .first();

    await expect(async () => {
      const visible = await canvasOrEmpty.isVisible().catch(() => false);
      expect(visible).toBe(true);
    }).toPass({ timeout });
  }

  private async selectDashboardKind(kind: DashboardKind): Promise<void> {
    const optionTestIds: Record<DashboardKind, string> = {
      blank: 'new-dashboard-blank-option',
      template: 'new-dashboard-template-option',
      entityType: 'new-dashboard-entity-type-option',
    };

    const option = this.window.getByTestId(optionTestIds[kind]);
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
  }

  /**
   * Create a new blank dashboard
   */
  async createNew(options: CreateDashboardOptions = {}): Promise<void> {
    const kind = options.kind ?? 'blank';
    const dialog = this.window.getByTestId('new-dashboard-dialog');
    const newBtn = this.window.getByRole('button', { name: /New Dashboard/i });

    // If a dashboard is already active, nothing to do
    const existingGrid = await this.window.locator('.react-grid-layout').count();
    const existingEmpty = await this.window.getByText(/No cards in this view/i).count();
    if (existingGrid > 0 || existingEmpty > 0) {
      return;
    }

    // Ensure the dialog is open
    const dialogVisible = await dialog.isVisible().catch(() => false);
    if (!dialogVisible) {
      if ((await newBtn.count()) === 0) {
        throw new Error('New Dashboard button not found');
      }
      const button = newBtn.first();
      await expect(button).toBeVisible({ timeout: 5000 });
      await button.click();
    }

    // Wait for dialog content (target the option directly in case the root is hidden)
    await this.selectDashboardKind(kind);

    // Wait for dialog to close before checking canvas
    await expect(dialog)
      .toBeHidden({ timeout: 10000 })
      .catch(() => {
        // If the root stays "hidden" while content disappears, tolerate and continue
      });

    // Wait for the canvas/empty-state to render (CI-safe)
    await this.waitForCanvasOrEmpty();
  }

  /**
   * Open the New Dashboard dialog and leave it open, without choosing a kind.
   *
   * Unlike createNew(), this does NOT return early when a dashboard is already
   * active — the template and unsaved-changes paths both need the dialog reached
   * from a populated canvas.
   */
  async openNewDashboardDialog(): Promise<void> {
    await this.clickNewDashboard();
    await expect(this.window.getByTestId('new-dashboard-blank-option')).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Click whichever "new dashboard" control the app is currently showing.
   *
   * ⚠ THERE ARE TWO, WITH DIFFERENT LABELS, AND THIS BIT ONCE. The welcome screen
   * (`!config`) shows a button reading "New Dashboard"; a loaded dashboard shows a
   * toolbar button reading just "New". Because every antd icon renders
   * `role="img" aria-label="<icon>"`, their accessible names are "file-add New
   * Dashboard" and "file-add New" — so `getByRole('button', {name:/New
   * Dashboard/i})` silently matches only the first, and looking for it from a
   * populated canvas fails with "element(s) not found".
   */
  private async clickNewDashboard(): Promise<void> {
    const toolbar = this.window.getByTestId('toolbar-new-dashboard');
    if ((await toolbar.count()) > 0) {
      await expect(toolbar).toBeVisible({ timeout: 10000 });
      await toolbar.click();
      return;
    }

    const welcome = this.window.getByRole('button', { name: /New Dashboard/i }).first();
    await expect(welcome).toBeVisible({ timeout: 10000 });
    await welcome.click();
  }

  /**
   * The "Unsaved Changes" confirm raised by `handleNewDashboard`.
   *
   * ⚠ Scoped to `.ant-modal-confirm`, and to the TITLE node specifically. A plain
   * `getByText('Unsaved Changes')` is a strict-mode violation here: antd renders
   * the phrase three times — `.ant-modal-title`, `.ant-modal-confirm-title`, and
   * inside `.ant-modal-confirm-content` ("You have unsaved changes…"). That
   * ambiguity failed this leg once while the feature was working perfectly, which
   * is the familiar shape — a probe that addresses the wrong object is a probe bug,
   * and the failure output naming all three nodes is what revealed it.
   */
  private get unsavedGuard() {
    return this.window.locator('.ant-modal-confirm');
  }

  private get unsavedGuardTitle() {
    return this.unsavedGuard.locator('.ant-modal-confirm-title');
  }

  /**
   * Click New Dashboard when the canvas is dirty and assert the confirm appeared.
   *
   * ⚠ This drives PRE-EXISTING behaviour (`handleNewDashboard`, `src/App.tsx`),
   * not anything added for FILE-03 — it is the control leg proving the template
   * path already inherits the guard, which is why FILE-03 adds no second confirm.
   */
  async clickNewDashboardExpectingUnsavedGuard(): Promise<void> {
    await this.clickNewDashboard();
    await expect(this.unsavedGuardTitle).toHaveText('Unsaved Changes', { timeout: 10000 });
  }

  /**
   * Dismiss the "Unsaved Changes" confirm with Cancel.
   */
  async cancelUnsavedGuard(): Promise<void> {
    await this.unsavedGuard.getByRole('button', { name: /^Cancel$/ }).click();
    await expect(this.unsavedGuardTitle).toHaveCount(0, { timeout: 10000 });
  }

  /**
   * Accept the "Unsaved Changes" confirm, which opens the New Dashboard dialog.
   */
  async acceptUnsavedGuard(): Promise<void> {
    await this.unsavedGuard.getByRole('button', { name: /^Create New$/ }).click();
    await expect(this.window.getByTestId('new-dashboard-blank-option')).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Check if a dashboard is currently active
   */
  async isActive(): Promise<boolean> {
    const gridExists = await this.window.locator('.react-grid-layout').count();
    const emptyMsg = await this.window.getByText(/No cards in this view/i).count();
    return gridExists > 0 || emptyMsg > 0;
  }

  /**
   * Get count of cards on canvas
   */
  async getCardCount(): Promise<number> {
    return await this.window.getByTestId('canvas-card').count();
  }

  /**
   * Verify dashboard has no cards
   */
  async expectEmpty(): Promise<void> {
    await expect(this.window.getByTestId('canvas-card')).toHaveCount(0);
  }

  /**
   * Verify dashboard has specific number of cards
   */
  async expectCardCount(count: number, timeout = 3000): Promise<void> {
    await expect(this.window.getByTestId('canvas-card')).toHaveCount(count, { timeout });
  }
}
