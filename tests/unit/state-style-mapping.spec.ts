import { describe, expect, it } from 'vitest';
import { normalizeStateStyleMap, resolveStateStyleValue } from '../../src/services/stateStyleMapping';

describe('stateStyleMapping', () => {
  it('normalizes keys immutably and case-insensitively', () => {
    const source = { ON: '#00ff00', ' off ': '#ff0000' };
    const normalized = normalizeStateStyleMap(source);

    expect(normalized).toEqual({
      on: '#00ff00',
      off: '#ff0000',
    });
    expect(source).toEqual({ ON: '#00ff00', ' off ': '#ff0000' });
  });

  it('resolves state value deterministically with fallback order', () => {
    const styles = {
      on: '#00ff00',
      unknown: '#777777',
      default: '#333333',
    };

    expect(resolveStateStyleValue({ state: 'ON', styles })).toBe('#00ff00');
    expect(resolveStateStyleValue({ state: '', styles })).toBe('#777777');
    expect(resolveStateStyleValue({ state: 'missing', styles })).toBe('#777777');
  });
});
