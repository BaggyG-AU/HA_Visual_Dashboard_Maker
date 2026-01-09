import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

type VibrationCall = number | number[];

export class HapticsDSL {
  constructor(private window: Page) {}

  async installVibrationMock(): Promise<void> {
    await this.window.evaluate(() => {
      (window as any).__hapticCalls = [];
      const handler = (pattern: number | number[]) => {
        (window as any).__hapticCalls.push(pattern);
        return true;
      };
      Object.defineProperty(navigator, 'vibrate', {
        value: handler,
        configurable: true,
        writable: true,
      });
    });
  }

  async clearVibrationCalls(): Promise<void> {
    await this.window.evaluate(() => {
      (window as any).__hapticCalls = [];
    });
  }

  async getVibrationCalls(): Promise<VibrationCall[]> {
    return await this.window.evaluate(() => (window as any).__hapticCalls ?? []);
  }

  async expectVibrationCalls(count: number, testInfo?: TestInfo): Promise<void> {
    try {
      await expect.poll(async () => {
        const calls = await this.getVibrationCalls();
        return calls.length;
      }).toBe(count);
    } catch (error) {
      if (testInfo) {
        const calls = await this.getVibrationCalls().catch(() => []);
        await attachDebugJson(testInfo, 'haptic-calls.json', { calls });
      }
      throw error;
    }
  }
}

export default HapticsDSL;
