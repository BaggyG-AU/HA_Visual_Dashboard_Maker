import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:expander-card
title: "Lights"
expanded: true
gap: 1em
padding: 8px
expanded-icon: mdi:chevron-up
collapsed-icon: mdi:chevron-down
overlay-margin: 2em
child-padding: 0
cards:
  - type: button
    entity: light.living_room
`;

test.describe('Accordion Card', () => {
  test('adds expander card from palette and toggles section', async ({ page }, testInfo) => {
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
      await accordion.expectExpanded(0);
      await accordion.toggleExpanded(0);
      await accordion.expectCollapsed(0);
    } finally {
      await close(ctx);
    }
  });

  test('properties update title and expanded state', async ({ page }, testInfo) => {
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

      await accordion.setTitle('Main Lights');
      await expect(canvas.getCard(0).getByTestId('expander-section-header-0')).toContainText('Main Lights');
      await accordion.toggleExpanded(0);
      await accordion.expectCollapsed(0);
    } finally {
      await close(ctx);
    }
  });

  test('yaml round-trip preserves expander settings', async ({ page }, testInfo) => {
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
      await accordion.setTitle('Kitchen Controls');
      await properties.switchTab('YAML');

      const yamlText = await yamlEditor.getEditorContent();
      expect(yamlText).toContain('type: custom:expander-card');
      expect(yamlText).toContain('title: Kitchen Controls');
      expect(yamlText).toContain('expanded-icon: mdi:chevron-up');
      expect(yamlText).toContain('collapsed-icon: mdi:chevron-down');
    } finally {
      await close(ctx);
    }
  });

  test('keyboard toggle supports Enter and Space', async ({ page }, testInfo) => {
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

      const header = canvas.getCard(0).getByTestId('expander-section-header-0');
      await header.focus();
      await expect(header).toBeFocused();
      await header.press('Enter');
      await accordion.expectCollapsed(0);
      await header.press(' ');
      await accordion.expectExpanded(0);
    } finally {
      await close(ctx);
    }
  });
});
