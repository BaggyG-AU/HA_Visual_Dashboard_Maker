import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const VERTICAL_BASE_YAML = `type: vertical-stack
title: "Vertical Layout"
cards:
  - type: button
    entity: light.living_room
  - type: button
    entity: light.kitchen
`;

const HORIZONTAL_BASE_YAML = `type: horizontal-stack
title: "Horizontal Layout"
cards:
  - type: button
    entity: light.living_room
  - type: button
    entity: light.kitchen
  - type: button
    entity: light.bedroom
`;

const GRID_BASE_YAML = `type: grid
title: "Grid Layout"
columns: 3
cards:
  - type: sensor
    entity: sensor.temperature
  - type: sensor
    entity: sensor.humidity
  - type: sensor
    entity: sensor.pressure
`;

test.describe('Layout Visual Regression', () => {
  test('captures vertical stack gap presets and alignment variants', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, canvas, properties, yamlEditor, layout } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await layout.addVerticalStackCard(testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(VERTICAL_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await layout.expectLayoutScreenshot('layout-vertical-default.png', 0);

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(
        `${VERTICAL_BASE_YAML.trim()}\ngap: 24\nalign_items: center\n`,
        'properties',
      );
      await properties.switchTab('Form');
      await layout.expectLayoutScreenshot('layout-vertical-relaxed-center.png', 0);
    } finally {
      await close(ctx);
    }
  });

  test('captures horizontal stack wrap and justify variants', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, canvas, properties, yamlEditor, layout } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await layout.addHorizontalStackCard(testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(HORIZONTAL_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await layout.expectLayoutScreenshot('layout-horizontal-default.png', 0);

      await layout.setGap(4);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(
        `${HORIZONTAL_BASE_YAML.trim()}\ngap: 4\njustify_content: space-between\nwrap: wrap\n`,
        'properties',
      );
      await properties.switchTab('Form');
      await layout.expectLayoutScreenshot('layout-horizontal-wrap-space-between.png', 0);

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(
        `${HORIZONTAL_BASE_YAML.trim()}\ngap: 4\njustify_content: space-between\nwrap: wrap-reverse\n`,
        'properties',
      );
      await properties.switchTab('Form');
      await layout.expectLayoutScreenshot('layout-horizontal-wrap-reverse.png', 0);
    } finally {
      await close(ctx);
    }
  });

  test('captures grid row and column spacing with item alignment variants', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, canvas, properties, yamlEditor, layout } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await layout.addGridCard(testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(GRID_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await layout.expectLayoutScreenshot('layout-grid-default.png', 0);

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(
        `${GRID_BASE_YAML.trim()}\nrow_gap: 24\ncolumn_gap: 4\nalign_items: stretch\njustify_items: center\n`,
        'properties',
      );
      await properties.switchTab('Form');
      await layout.expectLayoutScreenshot('layout-grid-relaxed-tight-center.png', 0);
    } finally {
      await close(ctx);
    }
  });
});
