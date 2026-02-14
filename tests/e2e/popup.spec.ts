import { expect, test } from '@playwright/test';
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
    - type: button
      entity: light.living_room
`;

const BUTTON_POPUP_ACTION_YAML = `type: button
entity: light.living_room
name: "Living Room Light"
tap_action:
  action: popup
  popup_title: "Light Controls"
  popup_size: small
  popup_close_on_backdrop: true
  popup_cards:
    - type: markdown
      content: "### Popup from tap_action"
`;

test.describe('Popup Card', () => {
  test('opens and closes popup from popup trigger card', async ({ page }, testInfo) => {
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
      await popup.expectPopupTitle('Living Room Details', 0);
      await popup.closePopupWithButton(0);
    } finally {
      await close(ctx);
    }
  });

  test('closes popup with backdrop click and ESC', async ({ page }, testInfo) => {
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
      await popup.closePopupWithBackdrop(0);

      await popup.openPopupFromTriggerCard(0);
      await popup.expectPopupOpen(0);
      await popup.closePopupWithEsc();
      await expect(page.locator('.ant-modal-wrap:visible')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('opens popup via tap_action popup on existing card', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, popup } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('button', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUTTON_POPUP_ACTION_YAML, 'properties');
      await properties.switchTab('Form');

      await popup.openPopupFromTapAction(0);
      await popup.expectPopupOpen(0);
      await popup.expectPopupTitle('Light Controls', 0);
      await popup.closePopupWithButton(0);
    } finally {
      await close(ctx);
    }
  });

  test('properties panel size and close-on-backdrop update behavior', async ({ page }, testInfo) => {
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

      await popup.setPopupSize('fullscreen');
      await popup.setCloseOnBackdrop(false);
      await properties.switchTab('YAML');
      const yamlText = await yamlEditor.getEditorContent('properties');
      expect(yamlText).toContain('type: custom:popup-card');
      expect(yamlText).toContain('size: fullscreen');
      expect(yamlText).toContain('close_on_backdrop: false');
    } finally {
      await close(ctx);
    }
  });

  test('keyboard focus is trapped and restored to trigger', async ({ page }, testInfo) => {
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
      await popup.focusFirstElementInPopup(0);
      await popup.expectFocusTrapped();
      await popup.closePopupWithButton(0);
      await popup.expectFocusReturnedToTrigger();
    } finally {
      await close(ctx);
    }
  });
});
