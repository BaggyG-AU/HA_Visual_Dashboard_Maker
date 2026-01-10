import Store from 'electron-store';

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

interface AppSettings {
  windowState: WindowState;
  theme: 'light' | 'dark';
  recentFiles: string[];
  haUrl?: string;
  haToken?: string;
  cachedEntities?: any[];
  selectedTheme?: string;
  themeDarkMode?: boolean;
  themeSyncWithHA?: boolean;
  loggingLevel?: LoggingLevel;
  verboseUIDebug?: boolean;
  hapticsEnabled?: boolean;
  hapticsIntensity?: number;
  soundsEnabled?: boolean;
  soundsVolume?: number;
}

export type LoggingLevel = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const schema = {
  windowState: {
    type: 'object',
    properties: {
      x: { type: 'number' },
      y: { type: 'number' },
      width: { type: 'number', default: 1400 },
      height: { type: 'number', default: 900 },
      isMaximized: { type: 'boolean', default: false }
    }
  },
  theme: {
    type: 'string',
    enum: ['light', 'dark'],
    default: 'dark'
  },
  recentFiles: {
    type: 'array',
    items: { type: 'string' },
    default: []
  },
  loggingLevel: {
    type: 'string',
    enum: ['off', 'error', 'warn', 'info', 'debug', 'trace'],
    default: 'info'
  },
  verboseUIDebug: {
    type: 'boolean',
    default: false
  },
  hapticsEnabled: {
    type: 'boolean',
    default: false
  },
  hapticsIntensity: {
    type: 'number',
    default: 100
  },
  soundsEnabled: {
    type: 'boolean',
    default: false
  },
  soundsVolume: {
    type: 'number',
    default: 100
  }
};

class SettingsService {
  private store: Store<AppSettings>;

  constructor() {
    this.store = new Store<AppSettings>({
      projectName: 'ha-visual-dashboard-maker',
      schema: schema as any,
      defaults: {
        windowState: {
          width: 1400,
          height: 900,
          isMaximized: false
        },
        theme: 'dark',
        recentFiles: []
      }
    });
  }

  // Window state methods
  getWindowState(): WindowState {
    return this.store.get('windowState', {
      width: 1400,
      height: 900,
      isMaximized: false
    });
  }

  setWindowState(state: WindowState): void {
    this.store.set('windowState', state);
  }

  // Theme methods
  getTheme(): 'light' | 'dark' {
    return this.store.get('theme', 'dark');
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.store.set('theme', theme);
  }

  // Recent files methods
  getRecentFiles(): string[] {
    return this.store.get('recentFiles', []);
  }

  addRecentFile(filePath: string): void {
    const recentFiles = this.getRecentFiles();

    // Remove if already exists
    const filtered = recentFiles.filter(f => f !== filePath);

    // Add to front
    filtered.unshift(filePath);

    // Keep only last 10
    const limited = filtered.slice(0, 10);

    this.store.set('recentFiles', limited);
  }

  clearRecentFiles(): void {
    this.store.set('recentFiles', []);
  }

  // Home Assistant connection methods
  getHAUrl(): string | undefined {
    return this.store.get('haUrl');
  }

  getHAToken(): string | undefined {
    return this.store.get('haToken');
  }

  setHAConnection(url: string, token: string): void {
    this.store.set('haUrl', url);
    this.store.set('haToken', token);
  }

  clearHAConnection(): void {
    this.store.delete('haUrl');
    this.store.delete('haToken');
  }

  // Entity caching methods
  getCachedEntities(): any[] {
    return this.store.get('cachedEntities', []);
  }

  setCachedEntities(entities: any[]): void {
    this.store.set('cachedEntities', entities);
  }

  clearCachedEntities(): void {
    this.store.set('cachedEntities', []);
  }

  // Theme preference methods
  getSelectedTheme(): string | undefined {
    return this.store.get('selectedTheme');
  }

  setSelectedTheme(themeName: string): void {
    this.store.set('selectedTheme', themeName);
  }

  getThemeDarkMode(): boolean {
    return this.store.get('themeDarkMode', true);
  }

  setThemeDarkMode(darkMode: boolean): void {
    this.store.set('themeDarkMode', darkMode);
  }

  getThemeSyncWithHA(): boolean {
    return this.store.get('themeSyncWithHA', true);
  }

  setThemeSyncWithHA(sync: boolean): void {
    this.store.set('themeSyncWithHA', sync);
  }

  // Logging methods
  getLoggingLevel(defaultLevel: LoggingLevel = 'info'): LoggingLevel {
    return this.store.get('loggingLevel', defaultLevel);
  }

  setLoggingLevel(level: LoggingLevel): void {
    this.store.set('loggingLevel', level);
  }

  // Verbose UI debug overlay
  getVerboseUIDebug(): boolean {
    return this.store.get('verboseUIDebug', false);
  }

  setVerboseUIDebug(enabled: boolean): void {
    this.store.set('verboseUIDebug', enabled);
  }

  // Haptic feedback settings
  getHapticsEnabled(): boolean {
    return this.store.get('hapticsEnabled', false);
  }

  setHapticsEnabled(enabled: boolean): void {
    this.store.set('hapticsEnabled', enabled);
  }

  getHapticsIntensity(): number {
    return this.store.get('hapticsIntensity', 100);
  }

  setHapticsIntensity(intensity: number): void {
    this.store.set('hapticsIntensity', intensity);
  }

  // UI sounds settings
  getSoundsEnabled(): boolean {
    return this.store.get('soundsEnabled', false);
  }

  setSoundsEnabled(enabled: boolean): void {
    this.store.set('soundsEnabled', enabled);
  }

  getSoundsVolume(): number {
    return this.store.get('soundsVolume', 100);
  }

  setSoundsVolume(volume: number): void {
    this.store.set('soundsVolume', volume);
  }

  // Reset UI state (non-destructive to dashboards)
  resetUIState(): void {
    this.clearRecentFiles();
    this.store.set('windowState', {
      width: 1400,
      height: 900,
      isMaximized: false
    });
    this.store.delete('selectedTheme');
    this.store.delete('themeDarkMode');
    this.store.delete('themeSyncWithHA');
    this.store.delete('hapticsEnabled');
    this.store.delete('hapticsIntensity');
    this.store.delete('soundsEnabled');
    this.store.delete('soundsVolume');
  }
}

export const settingsService = new SettingsService();
