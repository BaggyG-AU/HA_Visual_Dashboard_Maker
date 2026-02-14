import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:expander-card
title: "Lights"
expanded: true
gap: 0.6em
padding: 0
overlay-margin: 2em
cards:
  - type: markdown
    content: "## Lights"
`;

test.describe('Accordion Visual Regression', () => {
  test('captures collapsed and expanded states', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, canvas, properties, yamlEditor, accordion } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await accordion.addAccordionCard(testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await accordion.expectCardScreenshot('accordion-bordered-expanded.png', 0);
      await accordion.toggleExpanded(0);
      await accordion.expectCardScreenshot('accordion-bordered-collapsed.png', 0);
    } finally {
      await close(ctx);
    }
  });
});
