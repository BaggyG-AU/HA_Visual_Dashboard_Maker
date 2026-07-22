import { describe, expect, it } from 'vitest';
import { resolveCardState } from '../../src/services/capability/cardAvailability';
import {
  defaultCapabilityProfile,
  type CapabilityProfile,
} from '../../src/services/capability/capabilityProfile';
import { CANVAS_ONLY_CARD_TYPES } from '../../src/services/haExportContract';

// A "connected" profile: HA 2026.7.2, mushroom + button-card installed.
const connected: CapabilityProfile = {
  ...defaultCapabilityProfile(),
  haVersion: '2026.7.2',
  capturedAt: '2026-07-22T00:00:00.000Z',
  installedElements: ['custom:button-card', 'custom:mushroom-entity-card'],
};

describe('resolveCardState', () => {
  it('flags the profile-independent HAVDM-only set regardless of connection', () => {
    for (const type of CANVAS_ONLY_CARD_TYPES) {
      expect(resolveCardState(type, { isCustom: true }, connected)).toBe('havdm-only');
      expect(resolveCardState(type, { isCustom: true }, defaultCapabilityProfile())).toBe(
        'havdm-only',
      );
    }
  });

  it('never-connected default is permissive — real cards are Available', () => {
    const def = defaultCapabilityProfile();
    expect(resolveCardState('custom:some-uninstalled-card', { isCustom: true }, def)).toBe(
      'available',
    );
    expect(resolveCardState('gauge', { isCustom: false }, def)).toBe('available');
  });

  it('connected: built-in cards are Available', () => {
    expect(resolveCardState('gauge', { isCustom: false }, connected)).toBe('available');
  });

  it('connected: a custom card is Available iff its element is installed', () => {
    expect(resolveCardState('custom:button-card', { isCustom: true }, connected)).toBe('available');
    expect(resolveCardState('custom:gauge-card-pro', { isCustom: true }, connected)).toBe(
      'not-available',
    );
  });

  it('user overrides win over the installed-element check', () => {
    const forced: CapabilityProfile = {
      ...connected,
      userOverrides: {
        'custom:gauge-card-pro': 'force-available',
        'custom:button-card': 'force-unavailable',
      },
    };
    expect(resolveCardState('custom:gauge-card-pro', { isCustom: true }, forced)).toBe('available');
    expect(resolveCardState('custom:button-card', { isCustom: true }, forced)).toBe(
      'not-available',
    );
  });

  it('a HAVDM-only type cannot be force-available (it can never deploy)', () => {
    const canvasOnly = CANVAS_ONLY_CARD_TYPES[0];
    const forced: CapabilityProfile = {
      ...connected,
      userOverrides: { [canvasOnly]: 'force-available' },
    };
    expect(resolveCardState(canvasOnly, { isCustom: true }, forced)).toBe('havdm-only');
  });
});
