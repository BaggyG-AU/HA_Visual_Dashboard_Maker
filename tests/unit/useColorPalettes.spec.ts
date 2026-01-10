import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColorPalettes } from '../../src/hooks/useColorPalettes';

const STORAGE_KEY = 'test-palettes';

describe('useColorPalettes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default palettes and sets active', () => {
    const { result } = renderHook(() => useColorPalettes(STORAGE_KEY));
    expect(result.current.palettes.length).toBeGreaterThan(0);
    expect(result.current.activePaletteId).toBeTruthy();
    expect(result.current.activePalette?.isDefault).toBe(true);
  });

  it('creates palette and sets active', () => {
    const { result } = renderHook(() => useColorPalettes(STORAGE_KEY));
    act(() => {
      result.current.createPalette('My Palette');
    });
    expect(result.current.palettes.some((p) => p.name === 'My Palette')).toBe(true);
    expect(result.current.activePalette?.name).toBe('My Palette');
  });

  it('adds normalized colors up to max 20 and dedupes', () => {
    const { result } = renderHook(() => useColorPalettes(STORAGE_KEY));
    act(() => {
      const paletteId = result.current.createPalette('Limited').id;
      for (let i = 0; i < 25; i++) {
        result.current.addColor(paletteId, `#${(i % 16).toString(16)}00${(i % 16).toString(16)}0${(i % 16).toString(16)}0`);
      }
      result.current.addColor(paletteId, '#FF00FF');
      result.current.addColor(paletteId, '#ff00ff'); // duplicate
    });
    const palette = result.current.palettes.find((p) => p.name === 'Limited');
    expect(palette?.colors.length).toBeLessThanOrEqual(20);
    expect(new Set(palette?.colors || []).size).toBe(palette?.colors.length);
    expect(palette?.colors.some((c) => c === '#ff00ff')).toBe(true);
  });

  it('prevents deleting default palette', () => {
    const { result } = renderHook(() => useColorPalettes(STORAGE_KEY));
    const defaultId = result.current.palettes.find((p) => p.isDefault)?.id;
    expect(defaultId).toBeDefined();
    act(() => {
      if (defaultId) result.current.deletePalette(defaultId);
    });
    expect(result.current.palettes.find((p) => p.id === defaultId)).toBeDefined();
  });

  it('imports and exports palettes', () => {
    const { result } = renderHook(() => useColorPalettes(STORAGE_KEY));
    const payload = JSON.stringify([{ name: 'Imported', colors: ['#112233', '#445566'] }]);
    act(() => {
      const res = result.current.importPalettes(payload);
      expect(res.added).toBe(1);
      expect(res.errors.length).toBe(0);
    });
    const exported = result.current.exportPalettes();
    expect(exported).toContain('Imported');
  });
});
