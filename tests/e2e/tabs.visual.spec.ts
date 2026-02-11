import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:tabs-card
tab_position: top
tab_size: default
default_tab: 0
animation: none
lazy_render: false
tabs:
  - title: "Lights"
    icon: mdi:lightbulb
    cards:
      - type: markdown
        content: "## Lights"
  - title: "Climate"
    icon: mdi:thermometer
    cards:
      - type: markdown
        content: "## Climate"
  - title: "Media"
    icon: mdi:play-circle
    cards:
      - type: markdown
        content: "## Media"
`;

test.describe('Tabs Visual Regression', () => {
  test('captures tab positions and active states', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, canvas, properties, yamlEditor, tabs } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await tabs.addTabsCard(testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await tabs.expectCardScreenshot('tabs-top-active-0.png', 0);

      await tabs.clickTab(2, 0);
      await tabs.expectCardScreenshot('tabs-top-active-2.png', 0);

      await tabs.setTabPosition('left');
      await tabs.expectCardScreenshot('tabs-left.png', 0);

      await tabs.setTabPosition('bottom');
      await tabs.expectCardScreenshot('tabs-bottom.png', 0);
    } finally {
      await close(ctx);
    }
  });
});
