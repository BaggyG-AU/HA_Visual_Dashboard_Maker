import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GradientPreset } from '../types/gradient';
import {
  GRADIENT_PRESET_STORAGE_KEY,
  loadPresetCollection,
  mergePresets,
  parsePresetCollection,
  savePresetCollection,
  serializePresetCollection,
  createPresetId,
} from '../utils/gradientPresetStorage';

interface UseGradientPresetsOptions {
  storageKey?: string;
}

interface SavePresetResult {
  preset?: GradientPreset;
  error?: string;
}

interface ImportPresetResult {
  presets: GradientPreset[];
  added: number;
  errors: string[];
}

export interface UseGradientPresetsReturn {
  userPresets: GradientPreset[];
  loadError: string | null;
  savePreset: (name: string, css: string) => SavePresetResult;
  deletePreset: (id: string) => void;
  importPresets: (json: string) => ImportPresetResult;
  exportPresets: () => string;
}

export const useGradientPresets = (options: UseGradientPresetsOptions = {}): UseGradientPresetsReturn => {
  const { storageKey = GRADIENT_PRESET_STORAGE_KEY } = options;
  const [userPresets, setUserPresets] = useState<GradientPreset[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const result = loadPresetCollection(storageKey);
    setUserPresets(result.presets.filter((preset) => preset.category === 'Custom'));
    setLoadError(result.error ?? null);
  }, [storageKey]);

  useEffect(() => {
    savePresetCollection(userPresets, storageKey);
  }, [userPresets, storageKey]);

  const savePreset = useCallback((name: string, css: string): SavePresetResult => {
    const trimmedName = name.trim();
    const trimmedCss = css.trim();
    if (!trimmedName || !trimmedCss) {
      return { error: 'Preset name and CSS are required.' };
    }

    const existingIndex = userPresets.findIndex((preset) => preset.name.toLowerCase() === trimmedName.toLowerCase());
    let savedPreset: GradientPreset;
    let next: GradientPreset[];

    if (existingIndex >= 0) {
      savedPreset = { ...userPresets[existingIndex], css: trimmedCss };
      next = [...userPresets];
      next[existingIndex] = savedPreset;
    } else {
      savedPreset = {
        id: createPresetId(),
        name: trimmedName,
        css: trimmedCss,
        category: 'Custom',
        createdAt: Date.now(),
      };
      next = [...userPresets, savedPreset];
    }

    setUserPresets(next);
    return { preset: savedPreset };
  }, [userPresets]);

  const deletePreset = useCallback((id: string) => {
    setUserPresets((prev) => prev.filter((preset) => preset.id !== id));
  }, []);

  const importPresets = useCallback((json: string): ImportPresetResult => {
    try {
      const raw = JSON.parse(json) as unknown;
      const parsed = parsePresetCollection(raw);
      if (parsed.errors.length) {
        return { presets: userPresets, added: 0, errors: parsed.errors };
      }

      const incoming = parsed.presets.map((preset) => ({
        ...preset,
        category: 'Custom',
        createdAt: preset.createdAt ?? Date.now(),
      }));
      const merged = mergePresets(userPresets, incoming);
      setUserPresets(merged.presets);
      return { presets: merged.presets, added: merged.added, errors: merged.errors };
    } catch (error) {
      return { presets: userPresets, added: 0, errors: ['Invalid JSON file.'] };
    }
  }, [userPresets]);

  const exportPresets = useCallback(() => serializePresetCollection(userPresets), [userPresets]);

  return useMemo(() => ({
    userPresets,
    loadError,
    savePreset,
    deletePreset,
    importPresets,
    exportPresets,
  }), [userPresets, loadError, savePreset, deletePreset, importPresets, exportPresets]);
};

export default useGradientPresets;
