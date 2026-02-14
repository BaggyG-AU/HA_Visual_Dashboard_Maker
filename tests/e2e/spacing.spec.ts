import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BUTTON_BASE_YAML = `type: button
entity: light.living_room
name: "Living Room"
`;

test.describe('Card Spacing Controls', () => {
  test('sets card margin from PropertiesPanel and applies live preview', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, spacing } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('button', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUTTON_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await spacing.setCardMargin(12);
      await spacing.expectCardMarginApplied(12, 0);
    } finally {
      await close(ctx);
    }
  });

  test('sets card padding from PropertiesPanel and applies live preview', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, spacing } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('button', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUTTON_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await spacing.setCardPadding(16);
      await spacing.expectCardPaddingApplied(16, 0);
    } finally {
      await close(ctx);
    }
  });

  test('toggles all-sides and per-side modes for margin and padding', async ({ page }, testInfo) => {
    test.setTimeout(120000);
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, spacing } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('button', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUTTON_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await spacing.setMarginMode('per-side');
      await spacing.setMarginSide('top', 4);
      await spacing.setMarginSide('right', 12);
      await spacing.setMarginSide('bottom', 20);
      await spacing.setMarginSide('left', 8);
      await spacing.expectCardMarginApplied({ top: 4, right: 12, bottom: 20, left: 8 }, 0);

      await spacing.setPaddingMode('per-side');
      await spacing.setPaddingSide('top', 10);
      await spacing.setPaddingSide('right', 14);
      await spacing.setPaddingSide('bottom', 18);
      await spacing.setPaddingSide('left', 6);
      await spacing.expectCardPaddingApplied({ top: 10, right: 14, bottom: 18, left: 6 }, 0);
    } finally {
      await close(ctx);
    }
  });

  test('applies spacing presets', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, spacing } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('button', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUTTON_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await spacing.setCardMargin('relaxed');
      await spacing.expectCardMarginApplied(16, 0);

      await spacing.setCardPadding('normal');
      await spacing.expectCardPaddingApplied(8, 0);
    } finally {
      await close(ctx);
    }
  });

  test('yaml round-trip preserves spacing config', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, spacing, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('button', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUTTON_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await spacing.setCardMargin('relaxed');
      await spacing.setPaddingMode('per-side');
      await spacing.setPaddingSide('top', 12);
      await spacing.setPaddingSide('right', 16);
      await spacing.setPaddingSide('bottom', 12);
      await spacing.setPaddingSide('left', 16);

      await properties.switchTab('YAML');
      const yamlText = await yamlEditor.getEditorContent();

      expect(yamlText).toContain('card_margin: relaxed');
      expect(yamlText).toContain('card_padding:');
      expect(yamlText).toContain('top: 12');
      expect(yamlText).toContain('right: 16');
      expect(yamlText).toContain('bottom: 12');
      expect(yamlText).toContain('left: 16');
    } finally {
      await close(ctx);
    }
  });

  test('cards without spacing fields remain backward compatible', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('button', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUTTON_BASE_YAML, 'properties');
      const yamlText = await yamlEditor.getEditorContent();
      expect(yamlText).not.toContain('card_margin');
      expect(yamlText).not.toContain('card_padding');
    } finally {
      await close(ctx);
    }
  });
});
