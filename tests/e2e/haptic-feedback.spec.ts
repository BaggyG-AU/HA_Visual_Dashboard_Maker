import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Haptic Feedback System', () => {
  test('settings enable haptics and preview pattern', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, settings, haptics } = ctx;

    try {
      await appDSL.waitUntilReady();
      await haptics.installVibrationMock();
      await haptics.clearVibrationCalls();

      await settings.open();
      await settings.setHapticsEnabled(true);
      await settings.setHapticsIntensity(70);
      await settings.selectHapticsPattern('Light');
      await settings.clickHapticsTest();

      await haptics.expectVibrationCalls(1, testInfo);
      const calls = await haptics.getVibrationCalls();
      expect(calls[0]).toEqual([7]);
    } finally {
      await close(ctx);
    }
  });

  test('button card triggers haptic on tap action', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, settings, haptics } = ctx;

    try {
      await appDSL.waitUntilReady();
      await haptics.installVibrationMock();
      await haptics.clearVibrationCalls();

      await settings.open();
      await settings.setHapticsEnabled(true);
      await settings.setHapticsIntensity(100);
      await settings.close();
      await appDSL.ensureNoBlockingOverlays();

      await dashboard.createNew();
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);

      await haptics.expectVibrationCalls(1, testInfo);
    } finally {
      await close(ctx);
    }
  });
});
