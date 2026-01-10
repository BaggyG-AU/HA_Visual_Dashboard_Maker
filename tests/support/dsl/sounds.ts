import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

type SoundCall = { effect?: string; volume?: number };

export class SoundsDSL {
  constructor(private window: Page) {}

  async installAudioMock(): Promise<void> {
    await this.window.evaluate(() => {
      const testWindow = window as Window & { __soundCalls?: Array<{ played?: boolean }> };
      testWindow.__soundCalls = [];

      class MockAudioBuffer {
        length: number;
        sampleRate: number;
        constructor(length: number, sampleRate: number) {
          this.length = length;
          this.sampleRate = sampleRate;
        }
        getChannelData() {
          return new Float32Array(this.length);
        }
      }

      class MockGainNode {
        gain = { value: 1 };
        connect() {
          return this;
        }
      }

      class MockBufferSource {
        buffer: MockAudioBuffer | null = null;
        onended: (() => void) | null = null;
        connect() {
          return this;
        }
        start() {
          testWindow.__soundCalls?.push({ played: true });
          if (this.onended) {
            this.onended();
          }
        }
        stop() {
          this.onended = null;
        }
      }

      class MockAudioContext {
        state = 'running';
        sampleRate = 44100;
        destination = {};
        createBuffer(_channels: number, length: number, sampleRate: number) {
          return new MockAudioBuffer(length, sampleRate);
        }
        createGain() {
          return new MockGainNode();
        }
        createBufferSource() {
          return new MockBufferSource();
        }
        resume() {
          return Promise.resolve();
        }
      }

      (testWindow as Window & { AudioContext?: typeof AudioContext }).AudioContext = MockAudioContext;
      (testWindow as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext = MockAudioContext;
    });
  }

  async clearSoundCalls(): Promise<void> {
    await this.window.evaluate(() => {
      const testWindow = window as Window & { __soundCalls?: SoundCall[] };
      testWindow.__soundCalls = [];
    });
  }

  async getSoundCalls(): Promise<SoundCall[]> {
    return await this.window.evaluate(() => {
      const testWindow = window as Window & { __soundCalls?: SoundCall[] };
      return testWindow.__soundCalls ?? [];
    });
  }

  async expectSoundCalls(count: number, testInfo?: TestInfo): Promise<void> {
    try {
      await expect.poll(async () => {
        const calls = await this.getSoundCalls();
        return calls.length;
      }).toBe(count);
    } catch (error) {
      if (testInfo) {
        const calls = await this.getSoundCalls().catch(() => []);
        await attachDebugJson(testInfo, 'sound-calls.json', { calls });
      }
      throw error;
    }
  }
}

export default SoundsDSL;
