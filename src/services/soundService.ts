import type { Action } from '../types/dashboard';
import type { SoundCardConfig, SoundEffect, SoundSettings } from '../types/sounds';

type AudioContextLike = AudioContext;
type AudioBufferLike = AudioBuffer;
type AudioBufferSourceLike = AudioBufferSourceNode;

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: false,
  volume: 100,
};

const MAX_POOL_SIZE = 6;

const EFFECTS: Record<SoundEffect, { sequence: Array<{ frequency: number; durationMs: number }>; gain: number }> = {
  click: { sequence: [{ frequency: 880, durationMs: 60 }], gain: 0.2 },
  success: { sequence: [{ frequency: 660, durationMs: 120 }, { frequency: 880, durationMs: 120 }], gain: 0.25 },
  error: { sequence: [{ frequency: 220, durationMs: 120 }, { frequency: 180, durationMs: 120 }], gain: 0.3 },
  'toggle-on': { sequence: [{ frequency: 520, durationMs: 90 }], gain: 0.25 },
  'toggle-off': { sequence: [{ frequency: 380, durationMs: 90 }], gain: 0.25 },
  notification: { sequence: [{ frequency: 740, durationMs: 120 }, { frequency: 980, durationMs: 80 }], gain: 0.3 },
};

let currentSettings: SoundSettings = { ...DEFAULT_SETTINGS };
let audioContext: AudioContextLike | null = null;
const buffers = new Map<SoundEffect, AudioBufferLike>();
const activeSources: AudioBufferSourceLike[] = [];

const getAudioContext = (): AudioContextLike | null => {
  if (audioContext) return audioContext;
  const constructors = globalThis as typeof globalThis & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = constructors.AudioContext || constructors.webkitAudioContext;
  if (!Ctor) return null;
  audioContext = new Ctor();
  return audioContext;
};

const ensureContextRunning = async (ctx: AudioContextLike): Promise<void> => {
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

const createToneBuffer = (ctx: AudioContextLike, frequency: number, durationMs: number): AudioBufferLike => {
  const sampleRate = ctx.sampleRate || 44100;
  const length = Math.max(1, Math.floor(sampleRate * (durationMs / 1000)));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  const waveLength = sampleRate / frequency;
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.sin((2 * Math.PI * i) / waveLength);
  }
  return buffer;
};

const createSequenceBuffer = (ctx: AudioContextLike, sequence: Array<{ frequency: number; durationMs: number }>): AudioBufferLike => {
  const sampleRate = ctx.sampleRate || 44100;
  const totalLength = sequence.reduce((sum, item) => sum + Math.floor(sampleRate * (item.durationMs / 1000)), 0);
  const buffer = ctx.createBuffer(1, Math.max(1, totalLength), sampleRate);
  const data = buffer.getChannelData(0);
  let offset = 0;
  sequence.forEach((item) => {
    const tone = createToneBuffer(ctx, item.frequency, item.durationMs);
    data.set(tone.getChannelData(0), offset);
    offset += tone.length;
  });
  return buffer;
};

const ensureBuffer = (effect: SoundEffect): AudioBufferLike | null => {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (buffers.has(effect)) {
    return buffers.get(effect) ?? null;
  }
  const profile = EFFECTS[effect];
  const buffer = createSequenceBuffer(ctx, profile.sequence);
  buffers.set(effect, buffer);
  return buffer;
};

const resolveEffectForAction = (action?: Action): SoundEffect | null => {
  switch (action?.action) {
    case 'toggle':
      return 'toggle-on';
    case 'navigate':
    case 'url':
    case 'more-info':
      return 'click';
    case 'call-service':
      return 'success';
    case 'none':
    default:
      return null;
  }
};

const getEffectiveSettings = (override?: SoundCardConfig): SoundSettings => {
  const enabled = override?.enabled ?? currentSettings.enabled;
  const volume = override?.volume ?? currentSettings.volume;
  return {
    enabled,
    volume: clamp(volume, 0, 100),
  };
};

export const getSoundSettings = (): SoundSettings => ({ ...currentSettings });

export const setSoundSettings = (next: Partial<SoundSettings>): SoundSettings => {
  currentSettings = {
    ...currentSettings,
    ...next,
    volume: clamp(next.volume ?? currentSettings.volume, 0, 100),
  };
  return getSoundSettings();
};

export const preloadSounds = (): boolean => {
  const ctx = getAudioContext();
  if (!ctx) return false;
  (Object.keys(EFFECTS) as SoundEffect[]).forEach((effect) => ensureBuffer(effect));
  return true;
};

export const hasSoundSupport = (): boolean => {
  const constructors = globalThis as typeof globalThis & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return Boolean(constructors.AudioContext || constructors.webkitAudioContext);
};

const cleanupSource = (source: AudioBufferSourceLike) => {
  const index = activeSources.indexOf(source);
  if (index >= 0) {
    activeSources.splice(index, 1);
  }
};

export const playSound = async (effect: SoundEffect, override?: SoundCardConfig): Promise<boolean> => {
  const ctx = getAudioContext();
  if (!ctx) return false;
  const effective = getEffectiveSettings(override);
  if (!effective.enabled) return false;
  if (!ensureBuffer(effect)) return false;

  await ensureContextRunning(ctx);

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  const profile = EFFECTS[effect];
  const volume = clamp(effective.volume, 0, 100) / 100;
  gainNode.gain.value = volume * profile.gain;
  source.buffer = buffers.get(effect) ?? null;
  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.onended = () => cleanupSource(source);

  if (activeSources.length >= MAX_POOL_SIZE) {
    const oldest = activeSources.shift();
    try {
      oldest?.stop();
    } catch {
      // Ignore stop errors for already-ended sources.
    }
  }
  activeSources.push(source);
  source.start(0);
  return true;
};

export const playSoundForAction = async (action: Action | undefined, override?: SoundCardConfig): Promise<boolean> => {
  if (override?.enabled === false) return false;
  const effect = override?.effect ?? resolveEffectForAction(action);
  if (!effect) return false;
  return playSound(effect, override);
};

export const previewSoundEffect = async (effect: SoundEffect): Promise<boolean> => playSound(effect);

export const getSoundEffectProfile = (effect: SoundEffect) => ({ ...EFFECTS[effect], sequence: [...EFFECTS[effect].sequence] });
