import { expect, test, type Page } from '@playwright/test';
import { close, launchWithDSL } from '../support';

// Phase 4 PR-5 — bubble-card pop-up `hash`. HAVDM lets the user pick
// card_type: 'pop-up' but never collected the `hash` Home Assistant needs to open
// the pop-up, so every HAVDM pop-up bubble deployed broken. This spec pins the
// form wiring: the Hash field is required and shown only for pop-up, it
// auto-prefixes '#', and it is dropped from non-pop-up bubbles.
//
// RED-BEFORE-GREEN: with the PropertiesPanel change git-stashed in the same
// checkout, the base build has no Hash field at all, so the "reveals" and
// "auto-prefixes" assertions fail. Proven before landing.

const POPUP_SEED_YAML = `type: custom:bubble-card
card_type: pop-up
name: Kitchen
`;

/** Drive the bubble-card "Card Type" Ant Select to the given option label. */
async function selectCardType(window: Page, label: string): Promise<void> {
  const select = window.getByTestId('bubble-card-type-select');
  await expect(select).toBeVisible();
  await select.click();

  const dropdown = window.locator('.ant-select-dropdown:visible').last();
  await expect(dropdown).toBeVisible({ timeout: 5000 });

  const option = dropdown
    .locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') })
    .first();
  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click();
  await expect(dropdown).toBeHidden({ timeout: 5000 });
}

test.describe('Bubble Card pop-up hash', () => {
  test('reveals a required hash field for pop-up and auto-prefixes #', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('custom:bubble-card');
      await canvas.selectCard(0);

      // Seed a pop-up bubble with NO hash through the YAML editor, then return to
      // the form — the conditional Hash field must appear.
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(POPUP_SEED_YAML, 'properties');
      await properties.switchTab('Form');

      const hashInput = window.getByTestId('bubble-hash-input');
      await expect(hashInput).toBeVisible();

      // Type a hash WITHOUT the leading '#'; the form must normalize it.
      await hashInput.fill('kitchen');
      await hashInput.blur();

      await properties.switchTab('YAML');
      // ⚠ 250 ms YAML serialisation debounce — anchor on the LAST edit.
      const yaml = await yamlEditor.waitForEditorContent(/hash:\s*['"]?#kitchen['"]?/);
      expect(yaml).toContain('card_type: pop-up');
      expect(yaml).toMatch(/hash:\s*['"]?#kitchen['"]?/);
    } finally {
      await close(ctx);
    }
  });

  test('hides the hash field for a non-pop-up bubble card', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Registry default card_type is 'button' — no hash field should render.
      await palette.addCard('custom:bubble-card');
      await canvas.selectCard(0);
      await properties.switchTab('Form');

      await expect(window.getByTestId('bubble-card-type-select')).toBeVisible();
      await expect(window.getByTestId('bubble-hash-input')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('adds the hash field when switching to pop-up and drops it when switching away', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('custom:bubble-card');
      await canvas.selectCard(0);
      await properties.switchTab('Form');

      // button -> no hash field
      await expect(window.getByTestId('bubble-hash-input')).toHaveCount(0);

      // switch to pop-up via the real Select -> hash field appears
      await selectCardType(window, 'Pop-up');
      const hashInput = window.getByTestId('bubble-hash-input');
      await expect(hashInput).toBeVisible();
      await hashInput.fill('living_room');
      await hashInput.blur();

      await properties.switchTab('YAML');
      // ⚠⚠ THE CI FLAKE THIS COMMENT EXISTS FOR. The YAML pane is serialised on a
      // 250 ms debounce, so a single sample taken straight after the hash was
      // typed showed the document as it stood BEFORE it — `card_type: pop-up`
      // present (its own flush had already run) and `hash` absent. That is the
      // exact received string in GitHub Actions run 31802864528.
      expect(await yamlEditor.waitForEditorContent(/hash:\s*['"]?#living_room['"]?/)).toMatch(
        /hash:\s*['"]?#living_room['"]?/,
      );

      // switch back to button -> hash is dropped from the config
      await properties.switchTab('Form');
      await selectCardType(window, 'Button');
      await expect(window.getByTestId('bubble-hash-input')).toHaveCount(0);

      await properties.switchTab('YAML');
      // ⚠⚠ AN ABSENCE CANNOT BE WAITED FOR DIRECTLY — "not there yet" and "gone"
      // are the same reading. Wait for the LAST edit's POSITIVE trace
      // (`card_type: button`), which is written by the same flush that drops the
      // hash, and only then assert the absence.
      expect(await yamlEditor.waitForEditorContent('card_type: button')).not.toContain('hash:');
    } finally {
      await close(ctx);
    }
  });
});
