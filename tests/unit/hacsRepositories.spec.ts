import { describe, expect, it } from 'vitest';
import {
  hacsFolderFromLocalPath,
  normalizeHacsVersion,
  selectInstalledHacsRepositories,
  type HacsRepositoryRaw,
} from '../../src/services/capability/hacsRepositories';

// Fixtures modelled on the live READ-ONLY probe of ha.home.local (HA 2026.7.2,
// 2026-07-22): `hacs/repositories/list` returns the whole store; only a few
// entries are `installed`, and version/casing conventions are inconsistent.
const RAW: HacsRepositoryRaw[] = [
  {
    full_name: 'piitaya/lovelace-mushroom',
    category: 'plugin',
    installed: true,
    installed_version: 'v5.1.1',
    available_version: 'v5.1.1',
    local_path: '/config/www/community/lovelace-mushroom',
  },
  {
    full_name: 'Clooos/Bubble-Card',
    category: 'plugin',
    installed: true,
    installed_version: 'v3.2.5',
    local_path: '/config/www/community/Bubble-Card', // mixed-case folder
  },
  {
    full_name: 'KartoffelToby/better-thermostat-ui-card',
    category: 'plugin',
    installed: true,
    installed_version: '3.2.2', // bare, no leading v
    local_path: '/config/www/community/better-thermostat-ui-card',
  },
  {
    full_name: 'hacs/integration',
    category: 'integration',
    installed: true,
    installed_version: '2.0.5',
    local_path: '/config/custom_components/hacs',
  },
  // Not installed — must be dropped (this is the bulk of the ~3300-item store).
  {
    full_name: 'mattieha/select-list-card',
    category: 'plugin',
    installed: false,
    installed_version: '',
    local_path: '',
  },
  // Installed but nameless — cannot be joined, must be dropped.
  {
    full_name: '',
    category: 'plugin',
    installed: true,
    local_path: '/config/www/community/orphan',
  },
];

describe('hacsFolderFromLocalPath', () => {
  it('extracts and lower-cases the basename (case-insensitive join key)', () => {
    expect(hacsFolderFromLocalPath('/config/www/community/lovelace-mushroom')).toBe(
      'lovelace-mushroom',
    );
    expect(hacsFolderFromLocalPath('/config/www/community/Bubble-Card')).toBe('bubble-card');
  });

  it('tolerates trailing slash and empty input', () => {
    expect(hacsFolderFromLocalPath('/config/www/community/button-card/')).toBe('button-card');
    expect(hacsFolderFromLocalPath('')).toBe('');
    expect(hacsFolderFromLocalPath(undefined)).toBe('');
  });
});

describe('normalizeHacsVersion', () => {
  it('strips a single leading v and trims, leaving bare versions intact', () => {
    expect(normalizeHacsVersion('v5.1.1')).toBe('5.1.1');
    expect(normalizeHacsVersion('3.2.2')).toBe('3.2.2');
    expect(normalizeHacsVersion('  v0.3.7 ')).toBe('0.3.7');
    expect(normalizeHacsVersion(undefined)).toBe('');
  });
});

describe('selectInstalledHacsRepositories', () => {
  it('keeps only installed, named repositories and normalises them', () => {
    const result = selectInstalledHacsRepositories(RAW);
    expect(result.map((r) => r.fullName)).toEqual([
      'piitaya/lovelace-mushroom',
      'Clooos/Bubble-Card',
      'KartoffelToby/better-thermostat-ui-card',
      'hacs/integration',
    ]);
  });

  it('normalises folder (lower-case) and version (leading v stripped)', () => {
    const bubble = selectInstalledHacsRepositories(RAW).find(
      (r) => r.fullName === 'Clooos/Bubble-Card',
    );
    expect(bubble).toEqual({
      fullName: 'Clooos/Bubble-Card',
      folder: 'bubble-card',
      version: '3.2.5',
      category: 'plugin',
    });
  });

  it('preserves category so callers can filter to frontend plugins themselves', () => {
    const plugins = selectInstalledHacsRepositories(RAW).filter((r) => r.category === 'plugin');
    expect(plugins).toHaveLength(3);
    expect(plugins.every((r) => r.category === 'plugin')).toBe(true);
  });

  it('returns [] for null/undefined/non-array input', () => {
    expect(selectInstalledHacsRepositories(null)).toEqual([]);
    expect(selectInstalledHacsRepositories(undefined)).toEqual([]);
    // @ts-expect-error — defensive against a non-array upstream payload
    expect(selectInstalledHacsRepositories({})).toEqual([]);
  });
});
