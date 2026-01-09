import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

type SoundCall = { effect?: string; volume?: number };

export class SoundsDSL {
  constructor(private window: Page) {}

  async installAudioMock(): Promise<void> {
    await this.window.evaluate(() => {
      (window as any).__soundCalls = [];

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
        connect() {}
      }

      class MockBufferSource {
        buffer: MockAudioBuffer | null = null;
        onended: (() => void) | null = null;
        connect() {}
        start() {
          (window as any).__soundCalls.push({ played: true });
          if (this.onended) {
            this.onended();
          }
        }
        stop() {}
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

      (window as any).AudioContext = MockAudioContext;
      (window as any).webkitAudioContext = MockAudioContext;
    });
  }

  async clearSoundCalls(): Promise<void> {
    await this.window.evaluate(() => {
      (window as any).__soundCalls = [];
    });
  }

  async getSoundCalls(): Promise<SoundCall[]> {
    return await this.window.evaluate(() => (window as any).__soundCalls ?? []);
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
