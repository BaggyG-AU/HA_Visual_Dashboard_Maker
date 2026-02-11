import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:accordion-card
expand_mode: single
style: bordered
header_background: '#1f1f1f'
content_padding: 12
sections:
  - title: "Lights"
    icon: mdi:lightbulb
    default_expanded: true
    cards:
      - type: button
        entity: light.living_room
  - title: "Climate"
    icon: mdi:thermometer
    cards:
      - type: thermostat
        entity: climate.living_room
  - title: "Security"
    icon: mdi:shield
    cards:
      - type: alarm-panel
        entity: alarm_control_panel.home
`;

test.describe('Accordion Card', () => {
  test('adds accordion card from palette and toggles section', async ({ page }, testInfo) => {
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

      await accordion.expectVisible(0);
      await accordion.expectSectionCount(3, 0);
      await accordion.expectSectionExpanded(0, 0);
      await accordion.clickSectionHeader(0, 0);
      await accordion.expectSectionCollapsed(0, 0);
    } finally {
      await close(ctx);
    }
  });

  test('single-expand allows only one open section', async ({ page }, testInfo) => {
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

      await accordion.expectSectionExpanded(0, 0);
      await accordion.clickSectionHeader(1, 0);
      await accordion.expectSectionExpanded(1, 0);
      await accordion.expectSectionCollapsed(0, 0);
    } finally {
      await close(ctx);
    }
  });

  test('multi-expand allows multiple sections', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, canvas, properties, yamlEditor, accordion } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await accordion.addAccordionCard(testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML.replace('expand_mode: single', 'expand_mode: multi'), 'properties');
      await properties.switchTab('Form');

      await accordion.clickSectionHeader(1, 0);
      await accordion.expectSectionExpanded(0, 0);
      await accordion.expectSectionExpanded(1, 0);
    } finally {
      await close(ctx);
    }
  });

  test('default expanded sections and properties update live preview', async ({ page }, testInfo) => {
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

      await accordion.expectSectionExpanded(0, 0);
      await accordion.setSectionTitle(0, 'Main Lights');
      await accordion.expectSectionTitle(0, 'Main Lights', 0);
      await accordion.collapseAll();
      await accordion.expectSectionCollapsed(0, 0);
      await accordion.expectSectionCollapsed(1, 0);
      await accordion.expectSectionCollapsed(2, 0);
      await accordion.expandAll();
      await accordion.expectSectionExpanded(0, 0);
    } finally {
      await close(ctx);
    }
  });

  test('yaml round-trip preserves accordion settings', async ({ page }, testInfo) => {
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
      await accordion.setExpandMode('multi');
      await accordion.setStyleMode('ghost');
      await properties.switchTab('YAML');

      const yamlText = await yamlEditor.getEditorContent();
      expect(yamlText).toContain('type: custom:accordion-card');
      expect(yamlText).toContain('expand_mode: multi');
      expect(yamlText).toContain('style: ghost');
      expect(yamlText).toContain('sections:');
    } finally {
      await close(ctx);
    }
  });

  test('keyboard navigation supports toggle and directional movement', async ({ page }, testInfo) => {
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

      await accordion.navigateToHeader(0, 0);
      await accordion.toggleViaKeyboard('Enter');
      await accordion.expectSectionCollapsed(0, 0);

      await accordion.pressHeaderKey('ArrowDown');
      await accordion.toggleViaKeyboard('Space');
      await accordion.expectSectionExpanded(1, 0);

      await accordion.pressHeaderKey('End');
      await accordion.toggleViaKeyboard('Enter');
      await accordion.expectSectionExpanded(2, 0);

      await accordion.pressHeaderKey('Home');
      await accordion.toggleViaKeyboard('Enter');
      await accordion.expectSectionExpanded(0, 0);
    } finally {
      await close(ctx);
    }
  });
});
