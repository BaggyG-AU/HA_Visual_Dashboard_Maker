import { describe, expect, it } from 'vitest';
import {
  resolveCapability,
  resourceFolderFromUrl,
} from '../../src/services/capability/capabilityResolver';
import { RESOURCE_ELEMENT_MAP } from '../../src/services/capability/resourceElementMap';
import type { LovelaceResource } from '../../src/services/haWebSocketService';
import type { InstalledHacsRepository } from '../../src/services/capability/hacsRepositories';

// The exact 11 resources returned by the READ-ONLY probe of ha.home.local
// (HA 2026.7.2, 2026-07-22). Note `Bubble-Card` is served mixed-case.
const REF_RESOURCES: LovelaceResource[] = [
  { id: '1', type: 'module', url: '/hacsfiles/button-card/button-card.js?hacstag=146194325701' },
  {
    id: '2',
    type: 'module',
    url: '/hacsfiles/power-flow-card-plus/power-flow-card-plus.js?hacstag=618081815037',
  },
  {
    id: '3',
    type: 'module',
    url: '/hacsfiles/apexcharts-card/apexcharts-card.js?hacstag=331701152223',
  },
  {
    id: '4',
    type: 'module',
    url: '/hacsfiles/better-thermostat-ui-card/better-thermostat-ui-card.js?hacstag=439367892322',
  },
  {
    id: '5',
    type: 'module',
    url: '/hacsfiles/lovelace-template-entity-row/template-entity-row.js?hacstag=231674882141',
  },
  { id: '6', type: 'module', url: '/hacsfiles/lovelace-card-mod/card-mod.js?hacstag=190927524421' },
  {
    id: '7',
    type: 'module',
    url: '/hacsfiles/platinum-weather-card/platinum-weather-card.js?hacstag=488086721105',
  },
  { id: '8', type: 'module', url: '/hacsfiles/lovelace-mushroom/mushroom.js?hacstag=444350375511' },
  { id: '9', type: 'module', url: '/hacsfiles/Bubble-Card/bubble-card.js?hacstag=680112919325' },
  {
    id: '10',
    type: 'module',
    url: '/hacsfiles/mini-graph-card/mini-graph-card-bundle.js?hacstag=1512800620130',
  },
  {
    id: '11',
    type: 'module',
    url: '/hacsfiles/modern-circular-gauge/modern-circular-gauge.js?hacstag=8717303430141',
  },
];

const REF_HACS: InstalledHacsRepository[] = [
  {
    fullName: 'piitaya/lovelace-mushroom',
    folder: 'lovelace-mushroom',
    version: '5.1.1',
    category: 'plugin',
  },
  { fullName: 'Clooos/Bubble-Card', folder: 'bubble-card', version: '3.2.5', category: 'plugin' },
];

describe('resourceFolderFromUrl', () => {
  it('extracts the /hacsfiles/<folder>/ segment, lower-cased, without query/hash', () => {
    expect(resourceFolderFromUrl('/hacsfiles/lovelace-mushroom/mushroom.js?hacstag=1')).toBe(
      'lovelace-mushroom',
    );
    expect(resourceFolderFromUrl('/hacsfiles/Bubble-Card/bubble-card.js?hacstag=9')).toBe(
      'bubble-card',
    );
    expect(resourceFolderFromUrl('/hacsfiles/button-card/button-card.js#x')).toBe('button-card');
  });

  it('returns "" for non-HACS resources and empty input', () => {
    expect(resourceFolderFromUrl('/local/my-card.js')).toBe('');
    expect(resourceFolderFromUrl('https://cdn.example.com/x.js')).toBe('');
    expect(resourceFolderFromUrl(undefined)).toBe('');
  });
});

describe('RESOURCE_ELEMENT_MAP', () => {
  it('maps mushroom to its many card elements and simple cards to one', () => {
    expect(RESOURCE_ELEMENT_MAP['lovelace-mushroom']).toContain('custom:mushroom-entity-card');
    expect(RESOURCE_ELEMENT_MAP['button-card']).toEqual(['custom:button-card']);
  });

  it('maps card-mod to no card element (it is a styling key)', () => {
    expect(RESOURCE_ELEMENT_MAP['lovelace-card-mod']).toEqual([]);
  });

  it('keys are all lower-case (matches the resolver lookup)', () => {
    for (const key of Object.keys(RESOURCE_ELEMENT_MAP)) {
      expect(key).toBe(key.toLowerCase());
    }
  });
});

describe('resolveCapability', () => {
  it('resolves the reference instance resources to the installed elements', () => {
    const cap = resolveCapability(REF_RESOURCES, REF_HACS);

    // Installed → Available
    for (const el of [
      'custom:mushroom-entity-card',
      'custom:button-card',
      'custom:apexcharts-card',
      'custom:bubble-card',
      'custom:mini-graph-card',
      'custom:modern-circular-gauge',
      'custom:power-flow-card-plus',
      'custom:better-thermostat-ui-card',
    ]) {
      expect(cap.installedElements.has(el)).toBe(true);
    }
    // Not installed on the reference instance → absent
    expect(cap.installedElements.has('custom:swipe-card')).toBe(false);
    expect(cap.installedElements.has('custom:gauge-card-pro')).toBe(false);
  });

  it('detects the mixed-case Bubble-Card folder case-insensitively', () => {
    const cap = resolveCapability(REF_RESOURCES);
    expect(cap.installedFolders.has('bubble-card')).toBe(true);
    expect(cap.installedElements.has('custom:bubble-card')).toBe(true);
  });

  it('flags card-mod as present (load-bearing) from lovelace-card-mod', () => {
    expect(resolveCapability(REF_RESOURCES).cardModPresent).toBe(true);
    expect(resolveCapability([]).cardModPresent).toBe(false);
  });

  it('carries HACS versions keyed by folder', () => {
    const cap = resolveCapability(REF_RESOURCES, REF_HACS);
    expect(cap.versions['lovelace-mushroom']).toBe('5.1.1');
    expect(cap.versions['bubble-card']).toBe('3.2.5');
  });

  it('tolerates null/empty resources and unknown folders without throwing', () => {
    expect(resolveCapability(null).installedElements.size).toBe(0);
    const unknown = resolveCapability([
      { id: 'x', type: 'module', url: '/hacsfiles/some-unpublished-card/foo.js' },
      { id: 'y', type: 'module', url: '/local/manual.js' },
    ]);
    expect(unknown.installedElements.size).toBe(0);
    expect(unknown.installedFolders.has('some-unpublished-card')).toBe(true);
  });
});
