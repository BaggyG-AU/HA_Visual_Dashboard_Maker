/**
 * useRecentColors Hook
 *
 * Manages recent color history with localStorage persistence
 * Automatically handles:
 * - Adding new colors to history
 * - Limiting to maxColors (default 10)
 * - Duplicate detection (most recent kept)
 * - localStorage persistence
 * - Error handling for storage failures
 */

import { useState, useEffect, useCallback } from 'react';
import type { RecentColorsStorage } from '../types/color';

const STORAGE_KEY = 'havdm-recent-colors';
const DEFAULT_MAX_COLORS = 10;

interface UseRecentColorsOptions {
  /** Maximum number of recent colors to store */
  maxColors?: number;
  /** Storage key (for testing with different keys) */
  storageKey?: string;
}

interface UseRecentColorsReturn {
  /** Array of recent colors */
  recentColors: string[];
  /** Add a color to recent colors */
  addRecentColor: (color: string) => void;
  /** Clear all recent colors */
  clearRecentColors: () => void;
  /** Remove a specific color from history */
  removeRecentColor: (color: string) => void;
}

/**
 * Custom hook for managing recent colors with localStorage
 */
export function useRecentColors(
  options: UseRecentColorsOptions = {}
): UseRecentColorsReturn {
  const { maxColors = DEFAULT_MAX_COLORS, storageKey = STORAGE_KEY } = options;

  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Load recent colors from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data: RecentColorsStorage = JSON.parse(stored);
        if (Array.isArray(data.colors)) {
          setRecentColors(data.colors.slice(0, maxColors));
        }
      }
    } catch (error) {
      console.error('Failed to load recent colors from localStorage:', error);
      // Continue with empty array on error
    }
  }, [storageKey, maxColors]);

  // Save to localStorage whenever recentColors changes
  useEffect(() => {
    try {
      const data: RecentColorsStorage = {
        colors: recentColors,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save recent colors to localStorage:', error);
      // Continue without persisting on error
    }
  }, [recentColors, storageKey]);

  /**
   * Add a color to recent colors
   * - Removes duplicate if exists (keeps most recent)
   * - Adds to beginning of array
   * - Limits to maxColors
   */
  const addRecentColor = useCallback(
    (color: string) => {
      if (!color) return;

      // Normalize color string (uppercase hex, trim whitespace)
      const normalized = color.trim().toUpperCase();

      setRecentColors((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter((c) => c.toUpperCase() !== normalized);

        // Add to beginning and limit to maxColors
        return [normalized, ...filtered].slice(0, maxColors);
      });
    },
    [maxColors]
  );

  /**
   * Clear all recent colors
   */
  const clearRecentColors = useCallback(() => {
    setRecentColors([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear recent colors from localStorage:', error);
    }
  }, [storageKey]);

  /**
   * Remove a specific color from history
   */
  const removeRecentColor = useCallback((color: string) => {
    if (!color) return;

    const normalized = color.trim().toUpperCase();

    setRecentColors((prev) => prev.filter((c) => c.toUpperCase() !== normalized));
  }, []);

  return {
    recentColors,
    addRecentColor,
    clearRecentColors,
    removeRecentColor,
  };
}
