import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:tabbed-card
options:
  defaultTabIndex: 0
_havdm_tab_position: top
_havdm_tab_size: default
_havdm_animation: none
_havdm_lazy_render: false
tabs:
  - attributes:
      label: "Lights"
      icon: mdi:lightbulb
    card:
      type: markdown
      content: "## Lights"
  - attributes:
      label: "Climate"
      icon: mdi:thermometer
    card:
      type: markdown
      content: "## Climate"
  - attributes:
      label: "Media"
      icon: mdi:play-circle
    card:
      type: markdown
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
