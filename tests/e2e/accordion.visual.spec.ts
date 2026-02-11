import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:accordion-card
expand_mode: single
style: bordered
sections:
  - title: "Lights"
    icon: mdi:lightbulb
    default_expanded: true
    cards:
      - type: markdown
        content: "## Lights"
  - title: "Climate"
    icon: mdi:thermometer
    cards:
      - type: markdown
        content: "## Climate"
`;

test.describe('Accordion Visual Regression', () => {
  test('captures collapsed/expanded and style variants', async ({ page }, testInfo) => {
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

      await accordion.clickSectionHeader(0, 0);
      await accordion.expectCardScreenshot('accordion-bordered-collapsed.png', 0);

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML.replace('style: bordered', 'style: borderless'), 'properties');
      await properties.switchTab('Form');
      await accordion.expectCardScreenshot('accordion-borderless.png', 0);

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML.replace('style: bordered', 'style: ghost'), 'properties');
      await properties.switchTab('Form');
      await accordion.expectCardScreenshot('accordion-ghost.png', 0);
    } finally {
      await close(ctx);
    }
  });
});
