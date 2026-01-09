import { describe, it, expect, beforeEach } from 'vitest';
import {
  GRADIENT_PRESET_STORAGE_KEY,
  loadPresetCollection,
  savePresetCollection,
  parsePresetCollection,
  serializePresetCollection,
  mergePresets,
} from '../../src/utils/gradientPresetStorage';
import type { GradientPreset } from '../../src/types/gradient';

describe('gradientPresetStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads presets from localStorage', () => {
    const preset: GradientPreset = {
      id: 'custom-1',
      name: 'My Preset',
      css: 'linear-gradient(90deg, #111 0%, #222 100%)',
      category: 'Custom',
    };
    savePresetCollection([preset], GRADIENT_PRESET_STORAGE_KEY);
    const result = loadPresetCollection(GRADIENT_PRESET_STORAGE_KEY);
    expect(result.presets).toHaveLength(1);
    expect(result.presets[0].name).toBe('My Preset');
  });

  it('rejects unsupported versions', () => {
    const raw = {
      kind: 'havdm-gradient-presets',
      version: 2,
      presets: [],
    };
    const result = parsePresetCollection(raw);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.presets).toHaveLength(0);
  });

  it('accepts legacy preset arrays', () => {
    const legacy = [
      { name: 'Legacy', css: 'linear-gradient(90deg, #000 0%, #fff 100%)' },
    ];
    const result = parsePresetCollection(legacy);
    expect(result.errors).toHaveLength(0);
    expect(result.presets[0].category).toBe('Custom');
  });

  it('serializes presets with schema metadata', () => {
    const preset: GradientPreset = {
      id: 'custom-2',
      name: 'Exported',
      css: 'linear-gradient(180deg, #123 0%, #456 100%)',
      category: 'Custom',
    };
    const json = serializePresetCollection([preset]);
    const parsed = JSON.parse(json);
    expect(parsed.kind).toBe('havdm-gradient-presets');
    expect(parsed.version).toBe(1);
    expect(parsed.presets).toHaveLength(1);
  });

  it('merges presets and de-duplicates ids', () => {
    const preset: GradientPreset = {
      id: 'dup-id',
      name: 'A',
      css: 'linear-gradient(90deg, #000 0%, #fff 100%)',
      category: 'Custom',
    };
    const incoming: GradientPreset = {
      id: 'dup-id',
      name: 'B',
      css: 'linear-gradient(90deg, #111 0%, #222 100%)',
      category: 'Custom',
    };
    const merged = mergePresets([preset], [incoming]);
    expect(merged.presets).toHaveLength(2);
    expect(merged.presets[1].id).not.toBe('dup-id');
  });
});
