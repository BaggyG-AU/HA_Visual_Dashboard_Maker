import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const POPUP_CARD_YAML = `type: custom:popup-card
title: "Room Details"
trigger_label: "View Details"
trigger_icon: mdi:information
popup:
  title: "Living Room Details"
  size: medium
  close_on_backdrop: true
  backdrop_opacity: 0.45
  show_header: true
  cards:
    - type: markdown
      content: "## Room Info"
`;

test.describe('Popup Visual Regression', () => {
  test('captures popup open states and sizes', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, canvas, properties, yamlEditor, popup } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await popup.addPopupCard(testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(POPUP_CARD_YAML, 'properties');
      await properties.switchTab('Form');

      await popup.openPopupFromTriggerCard(0);
      await popup.expectPopupOpen(0);
      await popup.expectPopupScreenshot('popup-medium.png', 0);
      await popup.closePopupWithButton(0);

      await popup.setPopupSize('small');
      await popup.openPopupFromTriggerCard(0);
      await popup.expectPopupOpen(0);
      await popup.expectPopupScreenshot('popup-small.png', 0);
      await popup.closePopupWithButton(0);
    } finally {
      await close(ctx);
    }
  });
});
