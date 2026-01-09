import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSoundEffectProfile,
  getSoundSettings,
  setSoundSettings,
  playSoundForAction,
  playSound,
} from '../../src/services/soundService';

describe('soundService', () => {
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
      if (this.onended) this.onended();
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

  beforeEach(() => {
    setSoundSettings({ enabled: false, volume: 100 });
    Object.defineProperty(globalThis, 'AudioContext', {
      value: MockAudioContext,
      configurable: true,
      writable: true,
    });
  });

  it('provides sound profiles', () => {
    const profile = getSoundEffectProfile('click');
    expect(profile.sequence.length).toBeGreaterThan(0);
    expect(profile.gain).toBeGreaterThan(0);
  });

  it('does not play when disabled', async () => {
    const result = await playSound('click');
    expect(result).toBe(false);
  });

  it('plays when enabled and respects volume', async () => {
    setSoundSettings({ enabled: true, volume: 50 });
    const result = await playSound('success');
    expect(result).toBe(true);
    expect(getSoundSettings().volume).toBe(50);
  });

  it('maps toggle action to toggle sound', async () => {
    setSoundSettings({ enabled: true, volume: 100 });
    const result = await playSoundForAction({ action: 'toggle' });
    expect(result).toBe(true);
  });
});
