import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:tabs-card
tab_position: top
tab_size: default
default_tab: 1
animation: none
lazy_render: true
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

test.describe('Tabs Card', () => {
  test('adds tabs card from palette and switches tabs by click', async ({ page }, testInfo) => {
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

      await tabs.expectVisible(0);
      await tabs.expectTabCount(3, 0);
      await tabs.expectTabActive(1, 0);

      await tabs.clickTab(0, 0);
      await tabs.expectTabActive(0, 0);

      await tabs.clickTab(2, 0);
      await tabs.expectTabActive(2, 0);
    } finally {
      await close(ctx);
    }
  });

  test('tab position changes support horizontal and vertical orientations', async ({ page }, testInfo) => {
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

      await tabs.setTabPosition('left');
      await tabs.expectOrientation('vertical', 0);

      await tabs.setTabPosition('right');
      await tabs.expectOrientation('vertical', 0);

      await tabs.setTabPosition('bottom');
      await tabs.expectOrientation('horizontal', 0);

      await tabs.setTabPosition('top');
      await tabs.expectOrientation('horizontal', 0);
    } finally {
      await close(ctx);
    }
  });

  test('default active tab is restored from yaml config', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, canvas, properties, yamlEditor, tabs } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await tabs.addTabsCard(testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML.replace('default_tab: 1', 'default_tab: 2'), 'properties');
      await properties.switchTab('Form');

      await tabs.expectTabActive(2, 0);
    } finally {
      await close(ctx);
    }
  });

  test('yaml round-trip preserves tabs settings', async ({ page }, testInfo) => {
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

      await tabs.setAnimation('fade');
      await tabs.setDefaultTab(2);
      await tabs.setTabPosition('left');
      await properties.switchTab('YAML');

      const yamlText = await yamlEditor.getEditorContent();
      expect(yamlText).toContain('type: custom:tabs-card');
      expect(yamlText).toContain('animation: fade');
      expect(yamlText).toContain('default_tab: 2');
      expect(yamlText).toContain('tab_position: left');
      expect(yamlText).toContain('tabs:');
    } finally {
      await close(ctx);
    }
  });

  test('keyboard navigation supports arrows Home End and activation keys', async ({ page }, testInfo) => {
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

      await tabs.navigateToTab(1, 0);
      await tabs.pressTabKey('ArrowRight');
      await tabs.activateFocusedTab('Enter');
      await tabs.expectTabActive(2, 0);

      await tabs.pressTabKey('Home');
      await tabs.activateFocusedTab('Space');
      await tabs.expectTabActive(0, 0);

      await tabs.pressTabKey('End');
      await tabs.activateFocusedTab('Enter');
      await tabs.expectTabActive(2, 0);
    } finally {
      await close(ctx);
    }
  });

  test('properties controls update tab labels in live preview', async ({ page }, testInfo) => {
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

      await tabs.setTabTitle(0, 'Main Lights');
      await tabs.expectTabTitle(0, 'Main Lights', 0);
    } finally {
      await close(ctx);
    }
  });
});
