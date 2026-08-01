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
   * The shared "Unsaved Changes" gate (`src/components/UnsavedChangesDialog.tsx`),
   * raised by File > Open, Open Recent and New Dashboard alike.
   *
   * ⚠⚠ THESE LOCATORS ARE TESTIDS ON PURPOSE. They used to key on
   * `.ant-modal-confirm` plus the button PROSE `/^Create New$/`, and FILE-04
   * replaced that two-way `Modal.confirm` with a three-way dialog — so every
   * prose-keyed locator here would have broken. PR #110 lost six tests to
   * exactly this (a locator matching a placeholder PREFIX while the grep
   * searched the full replaced sentence). A locator keyed on user-facing prose
   * makes every copy edit a test breakage; testids do not.
   *
   * ⚠ The testid sits on a div INSIDE the modal body — antd puts a Modal's
   * data-* on `.ant-modal-root`, which Playwright always reports hidden.
   */
  private get unsavedGuard() {
    return this.window.getByTestId('unsaved-changes-dialog');
  }

  /**
   * Click New Dashboard when the canvas is dirty and assert the gate appeared.
   *
   * ⚠ This drives behaviour that PRE-EXISTS FILE-03 (`handleNewDashboard`,
   * `src/App.tsx`) — it is the control leg proving the template path inherits
   * the guard, which is why FILE-03 adds no second confirm. FILE-04 widened the
   * same guard to Open/Open Recent and gave it a third answer; the route this
   * asserts is unchanged.
   */
  async clickNewDashboardExpectingUnsavedGuard(): Promise<void> {
    await this.clickNewDashboard();
    await expect(this.unsavedGuard).toBeVisible({ timeout: 10000 });
  }

  /**
   * Dismiss the gate with Cancel — the document is left exactly as it was.
   */
  async cancelUnsavedGuard(): Promise<void> {
    await this.window.getByTestId('unsaved-changes-cancel').click();
    await expect(this.unsavedGuard).toBeHidden({ timeout: 10000 });
  }

  /**
   * Answer the gate with "Don't Save" — discard the changes and continue, which
   * from New Dashboard opens the New Dashboard dialog.
   *
   * ⚠ Renamed from `acceptUnsavedGuard`. "Accept" was unambiguous while the
   * confirm had one affirmative button; with Save AND Don't Save both being
   * affirmative answers, a method called "accept" no longer says which.
   */
  async discardUnsavedGuard(): Promise<void> {
    await this.window.getByTestId('unsaved-changes-discard').click();
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
