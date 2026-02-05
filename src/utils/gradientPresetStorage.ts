import type { GradientPreset, GradientPresetCollection } from '../types/gradient';
import { logger } from '../services/logger';

export const GRADIENT_PRESET_STORAGE_KEY = 'havdm-gradient-presets';
export const GRADIENT_PRESET_STORAGE_VERSION = 1 as const;
const PRESET_KIND = 'havdm-gradient-presets';

export interface PresetLoadResult {
  presets: GradientPreset[];
  error?: string;
}

export interface PresetImportResult {
  presets: GradientPreset[];
  added: number;
  errors: string[];
}

export const createPresetId = (): string =>
  `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const isValidCategory = (value: unknown): value is GradientPreset['category'] =>
  value === 'Material' || value === 'Nature' || value === 'Tech' || value === 'Monochrome' || value === 'Custom';

const normalizePreset = (value: Record<string, unknown>): GradientPreset | null => {
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const css = typeof value.css === 'string' ? value.css.trim() : '';
  if (!name || !css) return null;

  const preset: GradientPreset = {
    id: typeof value.id === 'string' && value.id.trim() ? value.id.trim() : createPresetId(),
    name,
    css,
    category: isValidCategory(value.category) ? value.category : 'Custom',
  };

  if (typeof value.description === 'string' && value.description.trim()) {
    preset.description = value.description.trim();
  }

  if (typeof value.createdAt === 'number') {
    preset.createdAt = value.createdAt;
  }

  return preset;
};

export const buildPresetCollection = (presets: GradientPreset[]): GradientPresetCollection => ({
  kind: PRESET_KIND,
  version: GRADIENT_PRESET_STORAGE_VERSION,
  presets,
  lastUpdated: Date.now(),
});

export const serializePresetCollection = (presets: GradientPreset[]): string =>
  JSON.stringify(buildPresetCollection(presets), null, 2);

export const parsePresetCollection = (raw: unknown): PresetImportResult => {
  const errors: string[] = [];
  let presetItems: unknown[] = [];

  if (Array.isArray(raw)) {
    presetItems = raw;
  } else if (isRecord(raw)) {
    const version = raw.version;
    if (typeof version !== 'number' || version !== GRADIENT_PRESET_STORAGE_VERSION) {
      errors.push('Unsupported preset schema version.');
      return { presets: [], added: 0, errors };
    }

    if (raw.kind !== PRESET_KIND) {
      errors.push('Invalid preset collection type.');
      return { presets: [], added: 0, errors };
    }

    if (!Array.isArray(raw.presets)) {
      errors.push('Preset collection is missing presets array.');
      return { presets: [], added: 0, errors };
    }

    presetItems = raw.presets;
  } else {
    errors.push('Preset data must be an array or collection object.');
    return { presets: [], added: 0, errors };
  }

  const presets: GradientPreset[] = [];
  presetItems.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`Preset at index ${index} is not a valid object.`);
      return;
    }
    const normalized = normalizePreset(item);
    if (!normalized) {
      errors.push(`Preset at index ${index} is missing required fields.`);
      return;
    }
    presets.push(normalized);
  });

  return { presets, added: presets.length, errors };
};

export const loadPresetCollection = (storageKey = GRADIENT_PRESET_STORAGE_KEY): PresetLoadResult => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return { presets: [] };
    const raw = JSON.parse(stored) as unknown;
    const parsed = parsePresetCollection(raw);
    if (parsed.errors.length) {
      return { presets: parsed.presets, error: parsed.errors.join(' ') };
    }
    return { presets: parsed.presets };
  } catch (error) {
    logger.error('Failed to load gradient presets from localStorage', error);
    return { presets: [], error: 'Failed to load presets.' };
  }
};

export const savePresetCollection = (presets: GradientPreset[], storageKey = GRADIENT_PRESET_STORAGE_KEY): void => {
  try {
    localStorage.setItem(storageKey, serializePresetCollection(presets));
  } catch (error) {
    logger.error('Failed to save gradient presets to localStorage', error);
  }
};

export const mergePresets = (existing: GradientPreset[], incoming: GradientPreset[]): PresetImportResult => {
  const errors: string[] = [];
  const existingIds = new Set(existing.map((preset) => preset.id));
  const merged = [...existing];

  incoming.forEach((preset) => {
    let candidate = preset;
    if (existingIds.has(candidate.id)) {
      candidate = { ...candidate, id: createPresetId() };
    }
    existingIds.add(candidate.id);
    merged.push(candidate);
  });

  return { presets: merged, added: incoming.length, errors };
};
