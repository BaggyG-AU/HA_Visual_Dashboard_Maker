/**
 * Unit tests for useRecentColors hook
 *
 * Tests localStorage persistence, duplicate handling, and history management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentColors } from '../../src/hooks/useRecentColors';

describe('useRecentColors', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorageMock = {};

    // Mock localStorage methods
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty array when no stored colors', () => {
      const { result } = renderHook(() => useRecentColors());
      expect(result.current.recentColors).toEqual([]);
    });

    it('should load colors from localStorage on mount', () => {
      // Pre-populate localStorage
      const storedData = {
        colors: ['#FF0000', '#00FF00', '#0000FF'],
        lastUpdated: Date.now(),
      };
      localStorageMock['havdm-recent-colors'] = JSON.stringify(storedData);

      const { result } = renderHook(() => useRecentColors());
      expect(result.current.recentColors).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Store invalid JSON
      localStorageMock['havdm-recent-colors'] = 'invalid json{';

      const { result } = renderHook(() => useRecentColors());
      expect(result.current.recentColors).toEqual([]);
    });

    it('should respect maxColors option on load', () => {
      const storedData = {
        colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
        lastUpdated: Date.now(),
      };
      localStorageMock['havdm-recent-colors'] = JSON.stringify(storedData);

      const { result } = renderHook(() => useRecentColors({ maxColors: 3 }));
      expect(result.current.recentColors).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });

    it('should use custom storage key when provided', () => {
      const customKey = 'test-colors';
      const storedData = {
        colors: ['#FF0000'],
        lastUpdated: Date.now(),
      };
      localStorageMock[customKey] = JSON.stringify(storedData);

      const { result } = renderHook(() => useRecentColors({ storageKey: customKey }));
      expect(result.current.recentColors).toEqual(['#FF0000']);
    });
  });

  describe('addRecentColor', () => {
    it('should add a new color to the beginning of the array', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
      });

      expect(result.current.recentColors).toEqual(['#FF0000']);
    });

    it('should add multiple colors in order', () => {
      const { result} = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.addRecentColor('#00FF00');
        result.current.addRecentColor('#0000FF');
      });

      expect(result.current.recentColors).toEqual(['#0000FF', '#00FF00', '#FF0000']);
    });

    it('should remove duplicate and add to beginning', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.addRecentColor('#00FF00');
        result.current.addRecentColor('#FF0000'); // Duplicate
      });

      expect(result.current.recentColors).toEqual(['#FF0000', '#00FF00']);
    });

    it('should handle case-insensitive duplicates', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#ff0000');
        result.current.addRecentColor('#FF0000'); // Same color, different case
      });

      expect(result.current.recentColors).toEqual(['#FF0000']);
      expect(result.current.recentColors.length).toBe(1);
    });

    it('should limit colors to maxColors', () => {
      const { result } = renderHook(() => useRecentColors({ maxColors: 3 }));

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.addRecentColor('#00FF00');
        result.current.addRecentColor('#0000FF');
        result.current.addRecentColor('#FFFF00'); // Should remove oldest
      });

      expect(result.current.recentColors).toEqual(['#FFFF00', '#0000FF', '#00FF00']);
      expect(result.current.recentColors.length).toBe(3);
    });

    it('should normalize color string (uppercase, trim)', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('  #ff0000  ');
      });

      expect(result.current.recentColors).toEqual(['#FF0000']);
    });

    it('should ignore empty strings', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('');
      });

      expect(result.current.recentColors).toEqual([]);
    });

    it('should persist to localStorage after adding', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
      });

      expect(localStorage.setItem).toHaveBeenCalled();
      const stored = JSON.parse(localStorageMock['havdm-recent-colors']);
      expect(stored.colors).toEqual(['#FF0000']);
      expect(stored.lastUpdated).toBeDefined();
    });
  });

  describe('clearRecentColors', () => {
    it('should clear all colors', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.addRecentColor('#00FF00');
        result.current.clearRecentColors();
      });

      expect(result.current.recentColors).toEqual([]);
    });

    it('should remove localStorage data', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.clearRecentColors();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('havdm-recent-colors');
    });

    it('should handle localStorage errors gracefully', () => {
      const { result } = renderHook(() => useRecentColors());

      // Mock localStorage.removeItem to throw error
      (global.localStorage.removeItem as any).mockImplementation(() => {
        throw new Error('Storage error');
      });

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.clearRecentColors();
      });

      // Should still clear the state even if localStorage fails
      expect(result.current.recentColors).toEqual([]);
    });
  });

  describe('removeRecentColor', () => {
    it('should remove a specific color', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.addRecentColor('#00FF00');
        result.current.addRecentColor('#0000FF');
        result.current.removeRecentColor('#00FF00');
      });

      expect(result.current.recentColors).toEqual(['#0000FF', '#FF0000']);
    });

    it('should handle case-insensitive removal', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.removeRecentColor('#ff0000'); // lowercase
      });

      expect(result.current.recentColors).toEqual([]);
    });

    it('should ignore empty strings', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.removeRecentColor('');
      });

      expect(result.current.recentColors).toEqual(['#FF0000']);
    });

    it('should ignore non-existent colors', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.removeRecentColor('#00FF00'); // Not in list
      });

      expect(result.current.recentColors).toEqual(['#FF0000']);
    });

    it('should persist to localStorage after removal', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.addRecentColor('#00FF00');
        result.current.removeRecentColor('#FF0000');
      });

      const stored = JSON.parse(localStorageMock['havdm-recent-colors']);
      expect(stored.colors).toEqual(['#00FF00']);
    });
  });

  describe('localStorage persistence', () => {
    it('should save to localStorage whenever colors change', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('#FF0000');
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'havdm-recent-colors',
        expect.stringContaining('#FF0000')
      );
    });

    it('should handle localStorage write errors gracefully', () => {
      const { result } = renderHook(() => useRecentColors());

      // Mock localStorage.setItem to throw error
      (global.localStorage.setItem as any).mockImplementation(() => {
        throw new Error('Storage error');
      });

      act(() => {
        result.current.addRecentColor('#FF0000');
      });

      // Should still update state even if localStorage fails
      expect(result.current.recentColors).toEqual(['#FF0000']);
    });

    it('should handle localStorage read errors gracefully', () => {
      // Mock localStorage.getItem to throw error
      (global.localStorage.getItem as any).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useRecentColors());

      // Should initialize with empty array on error
      expect(result.current.recentColors).toEqual([]);
    });

    it('should include timestamp in stored data', () => {
      const { result } = renderHook(() => useRecentColors());
      const beforeTime = Date.now();

      act(() => {
        result.current.addRecentColor('#FF0000');
      });

      const afterTime = Date.now();
      const stored = JSON.parse(localStorageMock['havdm-recent-colors']);
      expect(stored.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
      expect(stored.lastUpdated).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid consecutive adds', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.addRecentColor(`#FF${i.toString(16).padStart(4, '0')}`);
        }
      });

      expect(result.current.recentColors.length).toBeLessThanOrEqual(10);
    });

    it('should handle special characters in colors', () => {
      const { result } = renderHook(() => useRecentColors());

      act(() => {
        result.current.addRecentColor('rgba(255, 0, 0, 0.5)');
      });

      expect(result.current.recentColors).toEqual(['RGBA(255, 0, 0, 0.5)']);
    });

    it('should maintain order across multiple operations', () => {
      const { result } = renderHook(() => useRecentColors({ maxColors: 5 }));

      act(() => {
        result.current.addRecentColor('#FF0000');
        result.current.addRecentColor('#00FF00');
        result.current.addRecentColor('#0000FF');
        result.current.removeRecentColor('#00FF00');
        result.current.addRecentColor('#FFFF00');
      });

      expect(result.current.recentColors).toEqual(['#FFFF00', '#0000FF', '#FF0000']);
    });
  });
});
