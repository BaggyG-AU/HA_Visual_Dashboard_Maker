import { PRESET_MARKETPLACE_SEED } from '../features/preset-marketplace/catalog';
import type {
  ParsedPresetCollection,
  PresetCollection,
  PresetImportPayload,
  PresetMetadata,
  PresetRecord,
} from '../features/preset-marketplace/types';
import { fileService } from './fileService';
import { yamlService } from './yamlService';

const PRESET_KIND = 'havdm-preset-marketplace';
const PRESET_SCHEMA_VERSION = 1;

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
};

const uniqueStrings = (values: string[]): string[] => Array.from(new Set(values));

const isValidRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const validatePresetRecord = (value: unknown, label: string): { preset: PresetRecord | null; errors: string[] } => {
  if (!isValidRecord(value)) {
    return { preset: null, errors: [`${label} must be an object.`] };
  }

  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const description = typeof value.description === 'string' ? value.description.trim() : '';
  const author = typeof value.author === 'string' ? value.author.trim() : '';
  const version = typeof value.version === 'string' ? value.version.trim() : '';
  const yaml = typeof value.yaml === 'string' ? value.yaml : '';

  const tags = uniqueStrings(asStringArray(value.tags));
  const entityIds = uniqueStrings(asStringArray(value.entityIds));
  const cardCount = typeof value.cardCount === 'number' && Number.isFinite(value.cardCount) ? value.cardCount : -1;

  const errors: string[] = [];

  if (!id) errors.push(`${label}.id is required.`);
  if (!title) errors.push(`${label}.title is required.`);
  if (!description) errors.push(`${label}.description is required.`);
  if (!author) errors.push(`${label}.author is required.`);
  if (!version) errors.push(`${label}.version is required.`);
  if (!yaml.trim()) errors.push(`${label}.yaml is required.`);
  if (cardCount < 0) errors.push(`${label}.cardCount must be a non-negative number.`);

  let isValidDashboardYaml = false;
  if (yaml.trim()) {
    const parseResult = yamlService.parseDashboard(yaml);
    isValidDashboardYaml = Boolean(parseResult.success && parseResult.data);
  }
  if (!isValidDashboardYaml) {
    errors.push(`${label}.yaml must contain a valid dashboard.`);
  }

  if (errors.length > 0) {
    return { preset: null, errors };
  }

  return {
    preset: {
      id,
      title,
      description,
      author,
      version,
      tags,
      entityIds,
      cardCount,
      yaml,
    },
    errors: [],
  };
};

export const parsePresetCollection = (rawContent: string): ParsedPresetCollection => {
  try {
    const parsed = JSON.parse(rawContent) as PresetCollection;
    const errors: string[] = [];

    if (!isValidRecord(parsed)) {
      return { presets: [], errors: ['Preset collection must be an object.'] };
    }

    if (parsed.kind !== PRESET_KIND) {
      errors.push(`Preset collection kind must be ${PRESET_KIND}.`);
    }

    if (parsed.version !== PRESET_SCHEMA_VERSION) {
      errors.push(`Preset collection version must be ${PRESET_SCHEMA_VERSION}.`);
    }

    if (!Array.isArray(parsed.presets)) {
      errors.push('Preset collection presets must be an array.');
      return { presets: [], errors };
    }

    const validPresets: PresetRecord[] = [];

    parsed.presets.forEach((entry, index) => {
      const result = validatePresetRecord(entry, `presets[${index}]`);
      if (result.preset) {
        validPresets.push(result.preset);
      }
      errors.push(...result.errors);
    });

    return {
      presets: validPresets,
      errors,
    };
  } catch {
    return { presets: [], errors: ['Preset collection must be valid JSON.'] };
  }
};

const toMetadata = (preset: PresetRecord): PresetMetadata => ({
  id: preset.id,
  title: preset.title,
  description: preset.description,
  author: preset.author,
  version: preset.version,
  tags: [...preset.tags],
  entityIds: [...preset.entityIds],
  cardCount: preset.cardCount,
});

export class PresetService {
  private readonly builtInPresets: PresetRecord[];

  constructor(seed: PresetRecord[] = PRESET_MARKETPLACE_SEED) {
    this.builtInPresets = seed.map((preset, index) => {
      const validation = validatePresetRecord(preset, `seed[${index}]`);
      if (!validation.preset) {
        throw new Error(`Invalid built-in preset seed: ${validation.errors.join(' ')}`);
      }
      return validation.preset;
    });
  }

  async listPresets(): Promise<PresetMetadata[]> {
    await Promise.resolve();
    return this.builtInPresets.map(toMetadata);
  }

  async getPresetById(id: string): Promise<PresetRecord | null> {
    await Promise.resolve();
    const found = this.builtInPresets.find((preset) => preset.id === id);
    return found
      ? {
          ...found,
          tags: [...found.tags],
          entityIds: [...found.entityIds],
        }
      : null;
  }

  async importPreset(id: string): Promise<PresetImportPayload | null> {
    const preset = await this.getPresetById(id);
    if (!preset) return null;

    const parsed = yamlService.parseDashboard(preset.yaml);
    if (!parsed.success || !parsed.data) {
      throw new Error(`Preset ${id} YAML is invalid and cannot be imported.`);
    }

    return {
      id: preset.id,
      title: preset.title,
      yaml: preset.yaml,
      config: parsed.data,
    };
  }

  async importPresetCollectionFromFile(): Promise<ParsedPresetCollection | null> {
    const selected = await fileService.openAndReadFile();
    if (!selected) return null;
    return parsePresetCollection(selected.content);
  }
}

export const presetService = new PresetService();
export { PRESET_KIND, PRESET_SCHEMA_VERSION };
