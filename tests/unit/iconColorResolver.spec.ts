import { describe, it, expect } from 'vitest';
import { resolveIconColor } from '../../src/utils/iconColorResolver';

describe('iconColorResolver', () => {
  it('uses custom color when mode is custom', () => {
    const result = resolveIconColor({ mode: 'custom', customColor: '#112233', defaultColor: '#000' });
    expect(result).toBe('#112233');
  });

  it('uses state-based color when available', () => {
    const result = resolveIconColor({
      mode: 'state',
      stateColors: { on: '#00ff00', off: '#ff0000' },
      entityState: 'on',
      defaultColor: '#000',
    });
    expect(result).toBe('#00ff00');
  });

  it('falls back to default when state color missing', () => {
    const result = resolveIconColor({
      mode: 'state',
      stateColors: { off: '#ff0000' },
      entityState: 'on',
      defaultColor: '#123456',
    });
    expect(result).toBe('#123456');
  });

  it('matches state colors case-insensitively', () => {
    const result = resolveIconColor({
      mode: 'state',
      stateColors: { on: '#00ff00' },
      entityState: 'ON',
      defaultColor: '#123456',
    });
    expect(result).toBe('#00ff00');
  });

  it('uses unknown state color before default fallback', () => {
    const result = resolveIconColor({
      mode: 'state',
      stateColors: { unknown: '#777777', default: '#222222' },
      entityState: '',
      defaultColor: '#123456',
    });
    expect(result).toBe('#777777');
  });

  it('uses attribute value when mode is attribute', () => {
    const result = resolveIconColor({
      mode: 'attribute',
      attribute: 'icon_color',
      entityAttributes: { icon_color: '#abcdef' },
      defaultColor: '#000',
    });
    expect(result).toBe('#abcdef');
  });

  it('accepts gradient strings', () => {
    const result = resolveIconColor({
      mode: 'custom',
      customColor: 'linear-gradient(90deg, #f00 0%, #00f 100%)',
      defaultColor: '#000',
    });
    expect(result).toContain('linear-gradient');
  });
});
