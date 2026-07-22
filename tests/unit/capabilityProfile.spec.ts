import { describe, expect, it } from 'vitest';
import {
  buildCapabilityProfile,
  defaultCapabilityProfile,
  withOverride,
  type CapabilityProfile,
  type CardOverride,
} from '../../src/services/capability/capabilityProfile';
import type { ResolvedCapability } from '../../src/services/capability/capabilityResolver';

const resolved: ResolvedCapability = {
  installedElements: new Set(['custom:button-card', 'custom:mushroom-entity-card']),
  installedFolders: new Set(['button-card', 'lovelace-mushroom', 'lovelace-card-mod']),
  versions: { 'lovelace-mushroom': '5.1.1', 'button-card': '7.0.1' },
  cardModPresent: true,
};

describe('defaultCapabilityProfile', () => {
  it('is the permissive never-connected default (haVersion null, nothing inventoried)', () => {
    expect(defaultCapabilityProfile()).toEqual({
      haVersion: null,
      capturedAt: null,
      installedElements: [],
      installedFolders: [],
      versions: {},
      cardModPresent: false,
      userOverrides: {},
    });
  });
});

describe('buildCapabilityProfile', () => {
  it('serialises the resolved sets to sorted arrays and copies version/card-mod data', () => {
    const profile = buildCapabilityProfile(resolved, {
      haVersion: '2026.7.2',
      capturedAt: '2026-07-22T00:00:00.000Z',
    });

    expect(profile.haVersion).toBe('2026.7.2');
    expect(profile.capturedAt).toBe('2026-07-22T00:00:00.000Z');
    expect(profile.installedElements).toEqual([
      'custom:button-card',
      'custom:mushroom-entity-card',
    ]);
    expect(profile.installedFolders).toEqual([
      'button-card',
      'lovelace-card-mod',
      'lovelace-mushroom',
    ]);
    expect(profile.versions).toEqual({ 'lovelace-mushroom': '5.1.1', 'button-card': '7.0.1' });
    expect(profile.cardModPresent).toBe(true);
  });

  it('carries existing user overrides across a re-capture (they are a user decision)', () => {
    const overrides: Record<string, CardOverride> = { 'custom:foo-card': 'force-available' };
    const profile = buildCapabilityProfile(
      resolved,
      { haVersion: '2026.7.2', capturedAt: '2026-07-22T00:00:00.000Z' },
      overrides,
    );
    expect(profile.userOverrides).toEqual({ 'custom:foo-card': 'force-available' });
    // Defensive copy — mutating the source must not affect the profile.
    overrides['custom:foo-card'] = 'force-unavailable';
    expect(profile.userOverrides['custom:foo-card']).toBe('force-available');
  });
});

describe('withOverride', () => {
  const base: CapabilityProfile = {
    ...defaultCapabilityProfile(),
    userOverrides: { 'custom:keep-card': 'force-unavailable' },
  };

  it('sets an override without mutating the input', () => {
    const next = withOverride(base, 'custom:foo-card', 'force-available');
    expect(next.userOverrides).toEqual({
      'custom:keep-card': 'force-unavailable',
      'custom:foo-card': 'force-available',
    });
    expect(base.userOverrides).toEqual({ 'custom:keep-card': 'force-unavailable' }); // unchanged
  });

  it('removes an override when passed null', () => {
    const next = withOverride(base, 'custom:keep-card', null);
    expect(next.userOverrides).toEqual({});
    expect(base.userOverrides).toEqual({ 'custom:keep-card': 'force-unavailable' }); // unchanged
  });
});
