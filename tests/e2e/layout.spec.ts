import { expect, test } from '@playwright/test';
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

test.describe('Layout Enhancements', () => {
  test('vertical stack applies gap preset and alignment updates', async ({ page }, testInfo) => {
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

      await layout.setGap('tight');
      await layout.expectGapApplied('vertical-stack', 4, 0);

      await layout.setAlignItems('center');
      await layout.expectAlignmentApplied('vertical-stack', { alignItems: 'center' }, 0);
    } finally {
      await close(ctx);
    }
  });

  test('horizontal stack applies gap, alignment, justify, and wrap updates', async ({ page }, testInfo) => {
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

      await layout.setGap(8);
      await layout.expectGapApplied('horizontal-stack', 8, 0);

      await layout.setAlignItems('stretch');
      await layout.setJustifyContent('space-between');
      await layout.expectAlignmentApplied('horizontal-stack', {
        alignItems: 'stretch',
        justifyContent: 'space-between',
      }, 0);

      await layout.setWrap('wrap');
      await layout.expectWrapApplied('wrap', 0);
    } finally {
      await close(ctx);
    }
  });

  test('grid applies independent row and column gaps with alignment controls', async ({ page }, testInfo) => {
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

      await layout.setGridRowGap(12);
      await layout.setGridColumnGap(8);
      await layout.expectGapApplied('grid-row', 12, 0);
      await layout.expectGapApplied('grid-column', 8, 0);

      await layout.setAlignItems('stretch');
      await layout.setJustifyItems('center');
      await layout.expectAlignmentApplied('grid', {
        alignItems: 'stretch',
        justifyItems: 'center',
      }, 0);
    } finally {
      await close(ctx);
    }
  });

  test('backward compatibility keeps defaults when layout properties are omitted', async ({ page }, testInfo) => {
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

      await layout.expectGapApplied('horizontal-stack', 12, 0);
      await layout.expectWrapApplied('nowrap', 0);
      await layout.expectAlignmentApplied('horizontal-stack', {
        alignItems: 'stretch',
        justifyContent: 'flex-start',
      }, 0);
    } finally {
      await close(ctx);
    }
  });

  test('yaml round trip preserves enhanced layout settings', async ({ page }, testInfo) => {
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

      await layout.setGap(8);
      await layout.setAlignItems('stretch');
      await layout.setJustifyContent('space-between');
      await layout.setWrap('wrap');

      await properties.switchTab('YAML');
      const yamlText = await yamlEditor.getEditorContent();

      expect(yamlText).toContain('type: horizontal-stack');
      expect(yamlText).toContain('gap: 8');
      expect(yamlText).toContain('align_items: stretch');
      expect(yamlText).toContain('justify_content: space-between');
      expect(yamlText).toContain('wrap: wrap');
    } finally {
      await close(ctx);
    }
  });
});
