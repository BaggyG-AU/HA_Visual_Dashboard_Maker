import { describe, it, expect } from 'vitest';
import { parsePresetCollection, PresetService, PRESET_KIND, PRESET_SCHEMA_VERSION } from '../../src/services/presetService';

const validPresetYaml = `title: Sample\nviews:\n  - title: Home\n    path: home\n    cards:\n      - type: button\n        entity: light.sample\n`;

describe('presetService', () => {
  it('parses a valid preset collection payload', () => {
    const payload = JSON.stringify({
      kind: PRESET_KIND,
      version: PRESET_SCHEMA_VERSION,
      presets: [
        {
          id: 'sample',
          title: 'Sample Preset',
          description: 'Preset description',
          author: 'HAVDM',
          version: '1.0.0',
          tags: ['starter', 'sample'],
          entityIds: ['light.sample'],
          cardCount: 1,
          yaml: validPresetYaml,
        },
      ],
    });

    const result = parsePresetCollection(payload);

    expect(result.errors).toHaveLength(0);
    expect(result.presets).toHaveLength(1);
    expect(result.presets[0].id).toBe('sample');
    expect(result.presets[0].tags).toEqual(['starter', 'sample']);
  });

  it('returns deterministic errors for invalid payloads', () => {
    const malformed = parsePresetCollection('{nope');
    const wrongSchema = parsePresetCollection(JSON.stringify({ kind: 'invalid', version: 999, presets: [] }));

    expect(malformed.errors).toContain('Preset collection must be valid JSON.');
    expect(wrongSchema.errors).toEqual(
      expect.arrayContaining([
        `Preset collection kind must be ${PRESET_KIND}.`,
        `Preset collection version must be ${PRESET_SCHEMA_VERSION}.`,
      ])
    );
  });

  it('imports preset and returns parsed dashboard config', async () => {
    const service = new PresetService([
      {
        id: 'sample',
        title: 'Sample Preset',
        description: 'Preset description',
        author: 'HAVDM',
        version: '1.0.0',
        tags: ['starter'],
        entityIds: ['light.sample'],
        cardCount: 1,
        yaml: validPresetYaml,
      },
    ]);

    const imported = await service.importPreset('sample');

    expect(imported).not.toBeNull();
    expect(imported?.title).toBe('Sample Preset');
    expect(imported?.config.views[0].cards).toHaveLength(1);
    expect((imported?.config.views[0].cards[0] as { entity?: string }).entity).toBe('light.sample');
  });
});
