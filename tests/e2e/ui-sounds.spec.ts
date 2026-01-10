import { test } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('UI Sounds System', () => {
  test('settings enable sounds and preview effect', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, settings, sounds } = ctx;

    try {
      await appDSL.waitUntilReady();
      await sounds.installAudioMock();
      await sounds.clearSoundCalls();

      await settings.open();
      await settings.setSoundsEnabled(true);
      await settings.setSoundsVolume(60);
      await settings.selectSoundEffect('Click/Tap');
      await settings.clickSoundTest();
      await settings.close();

      await sounds.expectSoundCalls(1, testInfo);
    } finally {
      await close(ctx);
    }
  });

  test('button card triggers sound on tap action', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, settings, sounds } = ctx;

    try {
      await appDSL.waitUntilReady();
      await sounds.installAudioMock();
      await sounds.clearSoundCalls();

      await settings.open();
      await settings.setSoundsEnabled(true);
      await settings.setSoundsVolume(100);
      await settings.close();

      await dashboard.createNew();
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);

      await sounds.expectSoundCalls(1, testInfo);
    } finally {
      await close(ctx);
    }
  });
});
