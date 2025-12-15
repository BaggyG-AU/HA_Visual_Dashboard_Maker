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
}

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
  }
};

class SettingsService {
  private store: Store<AppSettings>;

  constructor() {
    this.store = new Store<AppSettings>({
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
}

export const settingsService = new SettingsService();
