import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseColor, rgbaToHex } from '../utils/colorConversions';
import { logger } from '../services/logger';
import type { ColorPalette, ColorPaletteStorage, PaletteImportResult } from '../types/colorPalette';

const STORAGE_KEY = 'havdm-color-palettes';
const STORAGE_VERSION = 1;
const MAX_COLORS = 20;

const materialPalette = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
  '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107',
  '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b',
];

const tailwindPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#f43f5e', '#737373', '#0f172a',
];

const haBrandPalette = [
  '#41bdf5', '#1a70c5', '#3d5afe', '#18bcf2', '#004d9e', '#00b3e6',
  '#fdd835', '#ffb300', '#00e676', '#66bb6a', '#26a69a', '#f06292',
];

const flatUiPalette = [
  '#2ecc71', '#27ae60', '#3498db', '#2980b9', '#9b59b6', '#8e44ad',
  '#34495e', '#2c3e50', '#f1c40f', '#f39c12', '#e67e22', '#d35400',
  '#e74c3c', '#c0392b', '#95a5a6', '#7f8c8d',
];

const defaultPalettes: Omit<ColorPalette, 'createdAt' | 'updatedAt'>[] = [
  { id: 'material', name: 'Material Design', description: 'Google Material core palette', colors: materialPalette, isDefault: true },
  { id: 'tailwind', name: 'Tailwind', description: 'Tailwind core palette', colors: tailwindPalette, isDefault: true },
  { id: 'ha-brand', name: 'Home Assistant', description: 'Home Assistant brand colors', colors: haBrandPalette, isDefault: true },
  { id: 'flat-ui', name: 'Flat UI', description: 'Flat UI palette', colors: flatUiPalette, isDefault: true },
];

const normalizeColor = (value: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.toLowerCase().startsWith('var(')) {
    return trimmed;
  }
  const parsed = parseColor(trimmed);
  if (parsed) {
    return rgbaToHex(parsed).toLowerCase();
  }
  // accept already-valid hex strings
  const hexMatch = trimmed.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) return `#${hexMatch[1].toLowerCase()}`;
  return null;
};

const clampColors = (colors: string[]): string[] => colors.slice(0, MAX_COLORS);

const makeId = (): string => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2));

const migrateStorage = (stored: ColorPaletteStorage | null): ColorPaletteStorage => {
  if (!stored) {
    const now = Date.now();
    const palettes = defaultPalettes.map((p) => ({
      ...p,
      createdAt: now,
      updatedAt: now,
    }));
    return { version: STORAGE_VERSION, palettes, activePaletteId: palettes[0]?.id };
  }
  // simple version check for future migrations
  return stored.version === STORAGE_VERSION ? stored : { ...stored, version: STORAGE_VERSION };
};

interface UseColorPalettesReturn {
  palettes: ColorPalette[];
  activePaletteId?: string;
  activePalette?: ColorPalette | undefined;
  createPalette: (name?: string) => ColorPalette;
  duplicatePalette: (id: string) => ColorPalette | null;
  renamePalette: (id: string, name: string) => void;
  deletePalette: (id: string) => void;
  setActivePalette: (id: string) => void;
  addColor: (id: string, color: string) => boolean;
  removeColor: (id: string, color: string) => void;
  reorderColors: (id: string, from: number, to: number) => void;
  importPalettes: (json: string) => PaletteImportResult;
  exportPalettes: () => string;
  exportCssVariables: () => string;
}

export function useColorPalettes(storageKey = STORAGE_KEY): UseColorPalettesReturn {
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [activePaletteId, setActivePaletteId] = useState<string | undefined>();

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed: ColorPaletteStorage | null = raw ? JSON.parse(raw) : null;
      const migrated = migrateStorage(parsed);
      setPalettes(migrated.palettes);
      setActivePaletteId(migrated.activePaletteId || migrated.palettes[0]?.id);
    } catch (error) {
      logger.error('Failed to load color palettes', error);
      const migrated = migrateStorage(null);
      setPalettes(migrated.palettes);
      setActivePaletteId(migrated.activePaletteId);
    }
  }, [storageKey]);

  // Persist
  useEffect(() => {
    try {
      const payload: ColorPaletteStorage = {
        version: STORAGE_VERSION,
        palettes,
        activePaletteId,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (error) {
      logger.error('Failed to save color palettes', error);
    }
  }, [palettes, activePaletteId, storageKey]);

  const activePalette = useMemo(() => palettes.find((p) => p.id === activePaletteId), [palettes, activePaletteId]);

  const createPalette = useCallback((name = 'New Palette'): ColorPalette => {
    const now = Date.now();
    const next: ColorPalette = {
      id: makeId(),
      name,
      description: '',
      colors: [],
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };
    setPalettes((prev) => [...prev, next]);
    setActivePaletteId(next.id);
    return next;
  }, []);

  const duplicatePalette = useCallback((id: string): ColorPalette | null => {
    const source = palettes.find((p) => p.id === id);
    if (!source) return null;
    const now = Date.now();
    const baseName = source.name.endsWith(' (copy)') ? source.name : `${source.name} (copy)`;
    const existingNames = new Set(palettes.map((p) => p.name));
    let name = baseName;
    let counter = 2;
    while (existingNames.has(name)) {
      name = `${baseName} ${counter}`;
      counter += 1;
    }
    const copy: ColorPalette = {
      ...source,
      id: makeId(),
      name,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };
    setPalettes((prev) => [...prev, copy]);
    setActivePaletteId(copy.id);
    return copy;
  }, [palettes]);

  const renamePalette = useCallback((id: string, name: string) => {
    setPalettes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: Date.now() } : p))
    );
  }, []);

  const deletePalette = useCallback((id: string) => {
    setPalettes((prev) => {
      const palette = prev.find((p) => p.id === id);
      if (!palette || palette.isDefault) return prev;
      const next = prev.filter((p) => p.id !== id);
      if (activePaletteId === id) {
        const fallback = next.find((p) => !p.isDefault) || next[0];
        setActivePaletteId(fallback?.id);
      }
      return next;
    });
  }, [activePaletteId]);

  const addColor = useCallback((id: string, color: string): boolean => {
    const normalized = normalizeColor(color);
    if (!normalized) return false;
    setPalettes((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.isDefault) return p;
        if (p.colors.some((c) => c === normalized) || p.colors.length >= MAX_COLORS) return p;
        return {
          ...p,
          colors: clampColors([...p.colors, normalized]),
          updatedAt: Date.now(),
        };
      })
    );
    return true;
  }, []);

  const removeColor = useCallback((id: string, color: string) => {
    const normalized = normalizeColor(color);
    if (!normalized) return;
    setPalettes((prev) =>
      prev.map((p) =>
        p.id === id && !p.isDefault
          ? { ...p, colors: p.colors.filter((c) => c !== normalized), updatedAt: Date.now() }
          : p
      )
    );
  }, []);

  const reorderColors = useCallback((id: string, from: number, to: number) => {
    setPalettes((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.isDefault) return p;
        const next = [...p.colors];
        if (from < 0 || from >= next.length || to < 0 || to >= next.length) return p;
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...p, colors: next, updatedAt: Date.now() };
      })
    );
  }, []);

  const importPalettes = useCallback(
    (json: string): PaletteImportResult => {
      const result: PaletteImportResult = { added: 0, errors: [] };
      try {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) throw new Error('Invalid format: expected array of palettes');
        const incoming: ColorPalette[] = [];
        parsed.forEach((p, index) => {
          if (!p?.name || !Array.isArray(p?.colors)) {
            result.errors.push(`Palette at index ${index} missing name or colors`);
            return;
          }
          const now = Date.now();
          const colors = clampColors(
            p.colors
              .map((c: string) => normalizeColor(c))
              .filter((c: string | null): c is string => Boolean(c))
          );
          incoming.push({
            id: makeId(),
            name: String(p.name),
            description: p.description ? String(p.description) : '',
            colors,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          });
        });
        if (incoming.length) {
          setPalettes((prev) => [...prev, ...incoming]);
          result.added = incoming.length;
        }
      } catch (error) {
        result.errors.push((error as Error).message);
      }
      return result;
    },
    []
  );

  const exportPalettes = useCallback((): string => {
    const payload = palettes.map((p) => ({
      name: p.name,
      description: p.description,
      colors: p.colors,
      isDefault: p.isDefault,
    }));
    return JSON.stringify(payload, null, 2);
  }, [palettes]);

  const exportCssVariables = useCallback((): string => {
    const lines: string[] = [];
    palettes.forEach((palette) => {
      const slug = palette.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      palette.colors.forEach((color, index) => {
        lines.push(`  --palette-${slug}-${index + 1}: ${color};`);
      });
    });
    return `:root {\n${lines.join('\n')}\n}`;
  }, [palettes]);

  return {
    palettes,
    activePaletteId,
    activePalette,
    createPalette,
    duplicatePalette,
    renamePalette,
    deletePalette,
    setActivePalette: setActivePaletteId,
    addColor,
    removeColor,
    reorderColors,
    importPalettes,
    exportPalettes,
    exportCssVariables,
  };
}
