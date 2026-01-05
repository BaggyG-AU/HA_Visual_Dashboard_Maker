import { describe, it, expect, beforeEach, vi } from 'vitest';
import { settingsService, LoggingLevel } from '../../src/services/settingsService';

// Mock electron-store
vi.mock('electron-store', () => {
  const mockData = new Map<string, any>();

  return {
    default: class MockStore {

      get(key: string, defaultValue?: any) {
        return mockData.has(key) ? mockData.get(key) : defaultValue;
      }

      set(key: string, value: any) {
        mockData.set(key, value);
      }

      delete(key: string) {
        mockData.delete(key);
      }

      clear() {
        mockData.clear();
      }
    }
  };
});

describe('settingsService', () => {
  beforeEach(() => {
    // Clear all settings before each test
    const store = (settingsService as any).store;
    store.clear();
  });

  describe('Window State', () => {
    it('returns default window state when not set', () => {
      const state = settingsService.getWindowState();
      expect(state.width).toBe(1400);
      expect(state.height).toBe(900);
      expect(state.isMaximized).toBe(false);
    });

    it('saves and retrieves window state', () => {
      const newState = {
        x: 100,
        y: 200,
        width: 1600,
        height: 1000,
        isMaximized: true,
      };

      settingsService.setWindowState(newState);
      const retrieved = settingsService.getWindowState();

      expect(retrieved.x).toBe(100);
      expect(retrieved.y).toBe(200);
      expect(retrieved.width).toBe(1600);
      expect(retrieved.height).toBe(1000);
      expect(retrieved.isMaximized).toBe(true);
    });

    it('updates window state', () => {
      settingsService.setWindowState({
        width: 1200,
        height: 800,
        isMaximized: false,
      });

      settingsService.setWindowState({
        width: 1800,
        height: 1200,
        isMaximized: true,
      });

      const state = settingsService.getWindowState();
      expect(state.width).toBe(1800);
      expect(state.height).toBe(1200);
      expect(state.isMaximized).toBe(true);
    });
  });

  describe('Theme', () => {
    it('returns default theme as dark', () => {
      const theme = settingsService.getTheme();
      expect(theme).toBe('dark');
    });

    it('saves and retrieves light theme', () => {
      settingsService.setTheme('light');
      const theme = settingsService.getTheme();
      expect(theme).toBe('light');
    });

    it('saves and retrieves dark theme', () => {
      settingsService.setTheme('dark');
      const theme = settingsService.getTheme();
      expect(theme).toBe('dark');
    });

    it('updates theme multiple times', () => {
      settingsService.setTheme('light');
      expect(settingsService.getTheme()).toBe('light');

      settingsService.setTheme('dark');
      expect(settingsService.getTheme()).toBe('dark');

      settingsService.setTheme('light');
      expect(settingsService.getTheme()).toBe('light');
    });
  });

  describe('Recent Files', () => {
    it('returns empty array when no recent files', () => {
      const files = settingsService.getRecentFiles();
      expect(files).toEqual([]);
    });

    it('adds a recent file', () => {
      settingsService.addRecentFile('/path/to/dashboard.yaml');
      const files = settingsService.getRecentFiles();
      expect(files).toEqual(['/path/to/dashboard.yaml']);
    });

    it('adds multiple recent files in order', () => {
      settingsService.addRecentFile('/path/to/dashboard1.yaml');
      settingsService.addRecentFile('/path/to/dashboard2.yaml');
      settingsService.addRecentFile('/path/to/dashboard3.yaml');

      const files = settingsService.getRecentFiles();
      expect(files).toEqual([
        '/path/to/dashboard3.yaml',
        '/path/to/dashboard2.yaml',
        '/path/to/dashboard1.yaml',
      ]);
    });

    it('moves duplicate file to front when re-added', () => {
      settingsService.addRecentFile('/path/to/dashboard1.yaml');
      settingsService.addRecentFile('/path/to/dashboard2.yaml');
      settingsService.addRecentFile('/path/to/dashboard3.yaml');
      settingsService.addRecentFile('/path/to/dashboard1.yaml'); // Re-add first file

      const files = settingsService.getRecentFiles();
      expect(files).toEqual([
        '/path/to/dashboard1.yaml',
        '/path/to/dashboard3.yaml',
        '/path/to/dashboard2.yaml',
      ]);
    });

    it('limits recent files to 10', () => {
      for (let i = 1; i <= 15; i++) {
        settingsService.addRecentFile(`/path/to/dashboard${i}.yaml`);
      }

      const files = settingsService.getRecentFiles();
      expect(files.length).toBe(10);
      expect(files[0]).toBe('/path/to/dashboard15.yaml');
      expect(files[9]).toBe('/path/to/dashboard6.yaml');
    });

    it('clears recent files', () => {
      settingsService.addRecentFile('/path/to/dashboard1.yaml');
      settingsService.addRecentFile('/path/to/dashboard2.yaml');

      settingsService.clearRecentFiles();

      const files = settingsService.getRecentFiles();
      expect(files).toEqual([]);
    });
  });

  describe('Home Assistant Connection', () => {
    it('returns undefined when no connection is set', () => {
      expect(settingsService.getHAUrl()).toBeUndefined();
      expect(settingsService.getHAToken()).toBeUndefined();
    });

    it('saves and retrieves HA connection', () => {
      settingsService.setHAConnection('http://homeassistant.local:8123', 'test-token-123');

      expect(settingsService.getHAUrl()).toBe('http://homeassistant.local:8123');
      expect(settingsService.getHAToken()).toBe('test-token-123');
    });

    it('updates HA connection', () => {
      settingsService.setHAConnection('http://old-url:8123', 'old-token');
      settingsService.setHAConnection('http://new-url:8123', 'new-token');

      expect(settingsService.getHAUrl()).toBe('http://new-url:8123');
      expect(settingsService.getHAToken()).toBe('new-token');
    });

    it('clears HA connection', () => {
      settingsService.setHAConnection('http://homeassistant.local:8123', 'test-token');
      settingsService.clearHAConnection();

      expect(settingsService.getHAUrl()).toBeUndefined();
      expect(settingsService.getHAToken()).toBeUndefined();
    });
  });

  describe('Entity Caching', () => {
    it('returns empty array when no entities cached', () => {
      const entities = settingsService.getCachedEntities();
      expect(entities).toEqual([]);
    });

    it('saves and retrieves cached entities', () => {
      const testEntities = [
        { entity_id: 'light.living_room', state: 'on' },
        { entity_id: 'sensor.temperature', state: '22.5' },
      ];

      settingsService.setCachedEntities(testEntities);
      const retrieved = settingsService.getCachedEntities();

      expect(retrieved).toEqual(testEntities);
    });

    it('updates cached entities', () => {
      const entities1 = [{ entity_id: 'light.bedroom', state: 'off' }];
      const entities2 = [{ entity_id: 'light.kitchen', state: 'on' }];

      settingsService.setCachedEntities(entities1);
      settingsService.setCachedEntities(entities2);

      const retrieved = settingsService.getCachedEntities();
      expect(retrieved).toEqual(entities2);
    });

    it('clears cached entities', () => {
      const testEntities = [
        { entity_id: 'light.living_room', state: 'on' },
      ];

      settingsService.setCachedEntities(testEntities);
      settingsService.clearCachedEntities();

      const retrieved = settingsService.getCachedEntities();
      expect(retrieved).toEqual([]);
    });
  });

  describe('Theme Preferences', () => {
    it('returns undefined when no theme is selected', () => {
      expect(settingsService.getSelectedTheme()).toBeUndefined();
    });

    it('saves and retrieves selected theme', () => {
      settingsService.setSelectedTheme('slate');
      expect(settingsService.getSelectedTheme()).toBe('slate');
    });

    it('returns true for dark mode by default', () => {
      expect(settingsService.getThemeDarkMode()).toBe(true);
    });

    it('saves and retrieves dark mode preference', () => {
      settingsService.setThemeDarkMode(false);
      expect(settingsService.getThemeDarkMode()).toBe(false);

      settingsService.setThemeDarkMode(true);
      expect(settingsService.getThemeDarkMode()).toBe(true);
    });

    it('returns true for theme sync with HA by default', () => {
      expect(settingsService.getThemeSyncWithHA()).toBe(true);
    });

    it('saves and retrieves theme sync preference', () => {
      settingsService.setThemeSyncWithHA(false);
      expect(settingsService.getThemeSyncWithHA()).toBe(false);

      settingsService.setThemeSyncWithHA(true);
      expect(settingsService.getThemeSyncWithHA()).toBe(true);
    });
  });

  describe('Logging Level', () => {
    it('returns default logging level as info', () => {
      const level = settingsService.getLoggingLevel();
      expect(level).toBe('info');
    });

    it('returns custom default when provided', () => {
      const level = settingsService.getLoggingLevel('debug');
      expect(level).toBe('debug');
    });

    it('saves and retrieves logging level', () => {
      settingsService.setLoggingLevel('trace');
      expect(settingsService.getLoggingLevel()).toBe('trace');
    });

    it('supports all logging levels', () => {
      const levels: LoggingLevel[] = ['off', 'error', 'warn', 'info', 'debug', 'trace'];

      levels.forEach(level => {
        settingsService.setLoggingLevel(level);
        expect(settingsService.getLoggingLevel()).toBe(level);
      });
    });

    it('updates logging level multiple times', () => {
      settingsService.setLoggingLevel('error');
      expect(settingsService.getLoggingLevel()).toBe('error');

      settingsService.setLoggingLevel('debug');
      expect(settingsService.getLoggingLevel()).toBe('debug');

      settingsService.setLoggingLevel('off');
      expect(settingsService.getLoggingLevel()).toBe('off');
    });
  });

  describe('Verbose UI Debug', () => {
    it('returns false by default', () => {
      expect(settingsService.getVerboseUIDebug()).toBe(false);
    });

    it('saves and retrieves verbose UI debug setting', () => {
      settingsService.setVerboseUIDebug(true);
      expect(settingsService.getVerboseUIDebug()).toBe(true);

      settingsService.setVerboseUIDebug(false);
      expect(settingsService.getVerboseUIDebug()).toBe(false);
    });
  });

  describe('Reset UI State', () => {
    it('clears recent files when resetting', () => {
      settingsService.addRecentFile('/path/to/dashboard.yaml');
      settingsService.resetUIState();

      expect(settingsService.getRecentFiles()).toEqual([]);
    });

    it('resets window state to defaults', () => {
      settingsService.setWindowState({
        x: 100,
        y: 200,
        width: 1600,
        height: 1000,
        isMaximized: true,
      });

      settingsService.resetUIState();

      const state = settingsService.getWindowState();
      expect(state.width).toBe(1400);
      expect(state.height).toBe(900);
      expect(state.isMaximized).toBe(false);
    });

    it('clears theme preferences', () => {
      settingsService.setSelectedTheme('slate');
      settingsService.setThemeDarkMode(false);
      settingsService.setThemeSyncWithHA(false);

      settingsService.resetUIState();

      expect(settingsService.getSelectedTheme()).toBeUndefined();
      expect(settingsService.getThemeDarkMode()).toBe(true); // Default value
      expect(settingsService.getThemeSyncWithHA()).toBe(true); // Default value
    });

    it('does not clear HA connection when resetting', () => {
      settingsService.setHAConnection('http://homeassistant.local:8123', 'test-token');
      settingsService.resetUIState();

      // HA connection should persist through UI reset
      expect(settingsService.getHAUrl()).toBe('http://homeassistant.local:8123');
      expect(settingsService.getHAToken()).toBe('test-token');
    });

    it('does not clear cached entities when resetting', () => {
      const testEntities = [{ entity_id: 'light.living_room', state: 'on' }];
      settingsService.setCachedEntities(testEntities);

      settingsService.resetUIState();

      // Cached entities should persist through UI reset
      expect(settingsService.getCachedEntities()).toEqual(testEntities);
    });

    it('does not clear logging level when resetting', () => {
      settingsService.setLoggingLevel('debug');
      settingsService.resetUIState();

      // Logging level should persist through UI reset
      expect(settingsService.getLoggingLevel()).toBe('debug');
    });
  });

  describe('Integration', () => {
    it('handles multiple settings at once', () => {
      settingsService.setTheme('light');
      settingsService.addRecentFile('/dashboard1.yaml');
      settingsService.addRecentFile('/dashboard2.yaml');
      settingsService.setHAConnection('http://ha.local:8123', 'token123');
      settingsService.setLoggingLevel('debug');
      settingsService.setVerboseUIDebug(true);

      expect(settingsService.getTheme()).toBe('light');
      expect(settingsService.getRecentFiles()).toEqual(['/dashboard2.yaml', '/dashboard1.yaml']);
      expect(settingsService.getHAUrl()).toBe('http://ha.local:8123');
      expect(settingsService.getHAToken()).toBe('token123');
      expect(settingsService.getLoggingLevel()).toBe('debug');
      expect(settingsService.getVerboseUIDebug()).toBe(true);
    });

    it('maintains independent settings after reset', () => {
      // Set various settings
      settingsService.setTheme('light');
      settingsService.addRecentFile('/dashboard.yaml');
      settingsService.setHAConnection('http://ha.local:8123', 'token');
      settingsService.setCachedEntities([{ entity_id: 'light.test', state: 'on' }]);
      settingsService.setLoggingLevel('trace');
      settingsService.setSelectedTheme('slate');
      settingsService.setVerboseUIDebug(true);

      // Reset UI state
      settingsService.resetUIState();

      // Check what persists and what doesn't
      expect(settingsService.getTheme()).toBe('light'); // Persists
      expect(settingsService.getRecentFiles()).toEqual([]); // Cleared
      expect(settingsService.getHAUrl()).toBe('http://ha.local:8123'); // Persists
      expect(settingsService.getCachedEntities().length).toBe(1); // Persists
      expect(settingsService.getLoggingLevel()).toBe('trace'); // Persists
      expect(settingsService.getSelectedTheme()).toBeUndefined(); // Cleared
      expect(settingsService.getVerboseUIDebug()).toBe(true); // Persists
    });
  });
});
