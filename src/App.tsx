import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ConfigProvider,
  Layout,
  theme,
  Button,
  Space,
  message,
  Modal,
  Alert,
  Tabs,
  Badge,
  Tooltip,
  Segmented,
} from 'antd';
import {
  FolderOpenOutlined,
  SaveOutlined,
  ApiOutlined,
  CloudUploadOutlined,
  AppstoreOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileAddOutlined,
  CodeOutlined,
  UndoOutlined,
  RedoOutlined,
  DatabaseOutlined,
  SplitCellsOutlined,
  AppstoreAddOutlined,
  SettingOutlined,
  SwapOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Layout as GridLayoutType } from 'react-grid-layout';
import { fileService } from './services/fileService';
import { useDashboardStore } from './store/dashboardStore';
import { yamlService } from './services/yamlService';
import { GridCanvas } from './components/GridCanvas';
import { CardPalette } from './components/CardPalette';
import { PropertiesPanel } from './components/PropertiesPanel';
import { EntityBrowser } from './components/EntityBrowser';
import { DeployDialog } from './components/DeployDialog';
import { DashboardBrowser } from './components/DashboardBrowser';
import { YamlEditorDialog } from './components/YamlEditorDialog';
import { HADashboardIframe } from './components/HADashboardIframe';
import {
  resolveLivePreviewDeployTarget,
  describeLiveDeployTarget,
  type SourceDashboard,
} from './services/livePreviewDeploy';
import { SplitViewEditor } from './components/SplitViewEditor';
import { cardRegistry } from './services/cardRegistry';
import { haConnectionService } from './services/haConnectionService';
import { isLayoutCardGrid, convertGridLayoutToViewLayout } from './utils/layoutCardParser';
import { getCardSizeConstraints } from './utils/cardSizingContract';
import { shouldHandleGlobalShortcut } from './utils/keyboardShortcuts';
import { isContainerCard, appendCardToContainer } from './utils/containerCards';
import {
  cloneCardsForClipboard,
  prepareCardsForFlatPaste,
  prepareCardsForSectionPaste,
  type CardWithInternalLayout,
} from './utils/cardClipboard';
import {
  resolveViewCards,
  updateSectionCard,
  addCardToSection,
  removeSectionCards,
  insertCardsIntoSection,
  moveSectionCard,
  setSectionCardGridOptions,
  addSection,
  removeSection,
  moveSection,
  setSectionTitle,
  setViewMaxColumns,
  convertViewToSections,
  buildSectionsView,
  flattenSectionsView,
} from './utils/sectionsLayout';
import {
  addView,
  removeView,
  moveView,
  setViewProps,
  normalizeViewType,
  setViewType,
  setViewGrid,
  convertViewToLayoutCard,
  HAVDM_SCAFFOLD_VIEW_FIELDS,
  type ViewPropsPatch,
  type ViewGridPatch,
} from './utils/viewsLayout';
import { isLayoutCardViewType } from './services/haExportContract';
import { HAEntityProvider, useHAEntities } from './contexts/HAEntityContext';
import { ThemeSelector } from './components/ThemeSelector';
import { SettingsDialog } from './components/SettingsDialog';
import { ThemePreviewPanel } from './components/ThemePreviewPanel';
import { NewDashboardDialog } from './components/NewDashboardDialog';
import { ViewSettingsDialog } from './components/ViewSettingsDialog';
import { VersionControlDialog } from './components/VersionControlDialog';
import { useThemeStore } from './store/themeStore';
import { themeService } from './services/themeService';
import { useEditorModeStore, EditorMode } from './store/editorModeStore';
import { logger } from './services/logger';
import { setSoundSettings } from './services/soundService';
import { setHapticSettings } from './services/hapticService';
import { entityRemappingService, type EntityMapping } from './services/entityRemapping';
import { PopupHost } from './features/popup/PopupHost';
import type { Card, DashboardConfig } from './types/dashboard';
import type { Theme } from './types/homeassistant';
import type { LoggingLevel } from './services/settingsService';
import type { EntityState } from './services/haWebSocketService';
import { loadPickerEntities } from './services/entityPickerSource';
import EntityRemappingModal from './components/EntityRemappingModal';
import {
  applyBulkCardUpdate,
  removeCardsByIndices,
  resolveOperationSelection,
  type SelectionMode,
} from './utils/bulkSelection';

const { Header, Content, Sider } = Layout;
// `CardWithInternalLayout` now lives in src/utils/cardClipboard.ts alongside the
// clipboard transforms that consume it (WS3 slice C), and is re-exported into
// this module's scope by the import above.

type TestThemeData = {
  themes?: Record<string, unknown>;
  theme?: string;
  default_theme?: string;
  default_dark_theme?: string | null;
  darkMode?: boolean;
};

type TestThemeApi = {
  setConnected: (connected: boolean) => void;
  applyThemes: (themesData: TestThemeData) => void;
};

type DashboardTestApi = {
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  // Test-only: load a whole-dashboard YAML string (e.g. a `type: sections`
  // view) without driving the file-open dialog. Mirrors the real load path
  // (loadDashboard -> importDashboard), so it exercises production parsing.
  //
  // `filePath` is optional and defaults to null, which is the "never saved
  // anywhere" state. Passing one puts the app in the FILE-BACKED state, where
  // Save writes straight through `createBackup` + `writeFile` instead of opening
  // a native save dialog — the only way to assert the whole menu -> save path in
  // an automated test, since native dialogs are not automatable here.
  loadYaml: (yaml: string, filePath?: string | null) => void;
};

interface RemapWatcherProps {
  config: DashboardConfig | null;
  onAvailableEntities: (entities: EntityState[]) => void;
  onMissingDetected: (missing: string[]) => void;
}

const RemapWatcher: React.FC<RemapWatcherProps> = ({
  config,
  onAvailableEntities,
  onMissingDetected,
}) => {
  const { entities } = useHAEntities();

  // HA-04. `useHAEntities` is fed by <HAEntityProvider enabled={isConnected}>, so
  // it yields NOTHING unless there is a live connection — this was the fourth
  // and last data path for the same dataset, and the only one that never read
  // the persisted offline cache. `entityPickerSource` exists precisely to bridge
  // that (the inline pickers have used it for some time); the remap path never
  // got it, which is why the remap dialog saw zero entities and then reported
  // every referenced entity as missing.
  //
  // ⚠ Re-read on every `config` change, NOT once on mount. Mounting happens
  // before any dashboard exists — and, in tests, before the cache is seeded — so
  // a mount-only load reliably captured an empty list and the fallback silently
  // did nothing. A dashboard being loaded is precisely when we need to know what
  // entities exist, and `config` identity changes only on a real change, so this
  // stays stable.
  //
  // ⚠ Deliberately NOT dependent on anything reference-unstable. See the note on
  // the callbacks below — an unstable dependency here re-runs this effect on
  // every render and spins forever.
  const [cachedEntities, setCachedEntities] = useState<EntityState[]>([]);

  // ⚠⚠ DELIBERATELY IGNORES `registry`, AND MUST KEEP DOING SO. Slice 2 added
  // Home Assistant's entity registry to `loadPickerEntities()` so the pickers
  // can hide `diagnostic`/`config` entities, and applying that cut HERE looks
  // like the obvious next improvement. It is a defect.
  //
  // This list is "WHAT EXISTS", not "what to offer". It feeds
  // `entityRemappingService.detectMissing`, which reports every referenced id
  // absent from it as MISSING — so filtering out diagnostic entities would make
  // HAVDM tell the user that a dashboard's diagnostic entity has vanished from
  // their Home Assistant. That is HA-04's false missing-report exactly, and the
  // HA-03 dishonest-failure family with it.
  useEffect(() => {
    let cancelled = false;
    loadPickerEntities()
      .then(({ entities: loaded }) => {
        if (!cancelled) setCachedEntities(loaded);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [config]);

  useEffect(() => {
    const live = Object.values(entities);
    const availableList = live.length > 0 ? live : cachedEntities;
    onAvailableEntities(availableList);
    if (!config || availableList.length === 0) return;
    const referenced = entityRemappingService.extractEntityIds(config);
    const missing = entityRemappingService.detectMissing(referenced, availableList);
    onMissingDetected(missing);
  }, [entities, cachedEntities, config, onAvailableEntities, onMissingDetected]);

  return null;
};

const isTestEnv = (): boolean => {
  if (
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || process.env.E2E === '1')
  ) {
    return true;
  }
  if (typeof window !== 'undefined') {
    const testWindow = window as Window & {
      E2E?: string | boolean;
      PLAYWRIGHT_TEST?: string | boolean;
    };
    return Boolean(testWindow.E2E || testWindow.PLAYWRIGHT_TEST);
  }
  return false;
};

// Row immediately below all existing cards, in grid units. Used to place cards
// added from the palette, which arrive without coordinates.
const nextFreeRow = (cards: Card[]): number =>
  cards.reduce((bottom, card) => {
    const layout = (card as CardWithInternalLayout)._havdm_layout;
    if (layout) {
      return Math.max(bottom, layout.y + layout.h);
    }
    const gridRowEnd = card.view_layout?.grid_row?.split('/')[1];
    const end = gridRowEnd ? Number.parseInt(gridRowEnd.trim(), 10) : Number.NaN;
    return Number.isFinite(end) ? Math.max(bottom, end - 1) : bottom;
  }, 0);

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  // The algorithm handed to ConfigProvider below. Derived once so the shell's
  // own hand-styled surfaces can read the SAME tokens antd is about to apply.
  const themeAlgorithm = isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm;

  // ⚠ theme.useToken() would be wrong HERE: this component renders the
  // ConfigProvider, so the hook would read the OUTER (default) context and the
  // shell would stay light while everything inside it went dark. Children of the
  // provider — CardPalette, PropertiesPanel, the dialogs — use useToken() and are
  // correct. getDesignToken resolves the same tokens without that ordering trap.
  const token = useMemo(
    () => theme.getDesignToken({ algorithm: themeAlgorithm }),
    [themeAlgorithm],
  );

  // HAVDM's cyan is product identity, not an antd token, so it is kept rather
  // than flattened into colorPrimary — but #00d9ff on white is unreadable, so
  // the light theme gets a darkened cyan of the same hue.
  const accentColor = isDarkTheme ? '#00d9ff' : '#006d8f';

  // ⭐ Reflect the theme onto the DOM. Before this, `isDarkTheme` fed exactly one
  // consumer — antd's ConfigProvider — which restyles antd components and nothing
  // else. Every hand-styled surface was blind to the theme, which is why the
  // canvas stayed black when you switched to light (UAT SHELL-03, HA-06). This
  // attribute is what non-antd CSS and the e2e suite key off.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    return () => root.removeAttribute('data-theme');
  }, [isDarkTheme]);
  const ignoreNextLayoutChangeRef = useRef<boolean>(false);
  const [deployDialogVisible, setDeployDialogVisible] = useState<boolean>(false);
  const [dashboardBrowserVisible, setDashboardBrowserVisible] = useState<boolean>(false);
  const [yamlEditorVisible, setYamlEditorVisible] = useState<boolean>(false);
  const [entityBrowserVisible, setEntityBrowserVisible] = useState<boolean>(false);
  const [entityInsertCallback, setEntityInsertCallback] = useState<
    ((entityId: string) => void) | null
  >(null);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'appearance' | 'connection' | 'diagnostics'>(
    'appearance',
  );
  const [verboseUIDebug, setVerboseUIDebug] = useState<boolean>(false);
  const [newDashboardDialogVisible, setNewDashboardDialogVisible] = useState<boolean>(false);
  const [viewSettingsOpen, setViewSettingsOpen] = useState<boolean>(false);
  // WS3 slice E. Opened from the File > Version Control... menu item — a menu,
  // not a toolbar button, so nothing is added to the in-flow layout above the
  // canvas (which would shift layout.visual's boundingBox clip).
  const [versionControlOpen, setVersionControlOpen] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [livePreviewMode, setLivePreviewMode] = useState<boolean>(false);
  const [tempDashboardPath, setTempDashboardPath] = useState<string | null>(null);
  // Which HA dashboard the current design was downloaded from, so a Live-Preview
  // deploy targets THAT dashboard instead of always overwriting the default
  // 'lovelace' (Phase 0.2). null = not sourced from HA (opened from file / new)
  // -> deploy must not guess a target; it routes to the explicit DeployDialog.
  const [sourceDashboard, setSourceDashboard] = useState<SourceDashboard | null>(null);
  const [haUrl, setHaUrl] = useState<string>('');
  const [remapModalVisible, setRemapModalVisible] = useState<boolean>(false);
  const [missingEntities, setMissingEntities] = useState<string[]>([]);
  const [availableEntities, setAvailableEntities] = useState<EntityState[]>([]);
  const [autoRemapPending, setAutoRemapPending] = useState<boolean>(false);
  const buildRemapDebugState = () => ({
    remapModalVisible,
    missingEntities,
    availableEntitiesCount: availableEntities.length,
    autoRemapPending,
    isConnected,
  });
  const logRemapDebug = (label: string, extra: Record<string, unknown> = {}) => {
    if (!isTestEnv()) return;
    logger.debug('[remap-debug]', label, { ...buildRemapDebugState(), ...extra });
  };

  // Clipboard state for cut/copy/paste operations.
  // Tier 4 slice 4.3a: `sourceSectionIndex` is null for a flat-canvas cut and a
  // number when the cut came from a Sections view, so the paste knows which
  // section to remove the originals from.
  const [clipboard, setClipboard] = useState<{
    cards: CardWithInternalLayout[] | null;
    isCut: boolean;
    sourceViewIndex: number | null;
    sourceCardIndices: number[];
    sourceSectionIndex: number | null;
  }>({
    cards: null,
    isCut: false,
    sourceViewIndex: null,
    sourceCardIndices: [],
    sourceSectionIndex: null,
  });

  // Dashboard store
  const {
    config,
    filePath,
    // ⚠ HA-03: `error` is a RENDER-scope subscription and is correct for the
    // JSX below (the banner re-renders when it changes). It is NOT valid inside
    // an event handler that has just called loadDashboard(): the snapshot React
    // captured before the handler ran can never observe a failure the handler
    // itself causes. Handlers must read useDashboardStore.getState().error.
    error,
    isDirty,
    selectedViewIndex,
    selectedCardIndex,
    selectedCardIndices,
    selectedSectionIndex,
    historyNavigationVersion,
    past,
    future,
    loadDashboard,
    updateConfig,
    beginBatchUpdate,
    applyBatchedConfig,
    endBatchUpdate,
    markClean,
    setSelectedView,
    setSelectedCard,
    setSelectedSectionCard,
    setSelectedSectionCards,
    setSelectedCards,
    selectCardWithMode,
    selectSectionCardWithMode,
    undo,
    redo,
    isBatching,
    canUndo,
    canRedo,
  } = useDashboardStore();

  // Slice B8: run the export boundary (sanitise + collect translation/self-check
  // warnings) only while the deploy dialog is open, so the DeployDialog gets both
  // the HA-ready object and a plain-language summary of what was adjusted.
  const deployReport = useMemo(
    () => (deployDialogVisible && config ? yamlService.sanitizeForHAWithReport(config) : null),
    [deployDialogVisible, config],
  );

  // RemapWatcher callbacks MUST be reference-stable.
  //
  // They are dependencies of RemapWatcher's effect, and that effect calls
  // onAvailableEntities(Object.values(entities)) — a fresh array every time, so
  // setAvailableEntities can never bail out. Inline arrows here therefore made
  // the effect re-run on every App render and re-render App forever. The loop is
  // silent until a subtree with layout effects mounts (the properties panel's
  // antd Select), at which point the updates become synchronously nested, React
  // throws error #185 ("Maximum update depth exceeded") and unmounts the root —
  // leaving a blank white window. Read pending state via a ref to keep identity
  // stable, matching the stable-closure idiom used in PropertiesPanel.
  const autoRemapPendingRef = useRef(autoRemapPending);
  autoRemapPendingRef.current = autoRemapPending;

  const handleAvailableEntities = useCallback((entities: EntityState[]) => {
    setAvailableEntities(entities);
  }, []);

  const handleMissingDetected = useCallback((missing: string[]) => {
    setMissingEntities(missing);
    if (missing.length > 0 && autoRemapPendingRef.current) {
      setRemapModalVisible(true);
      setAutoRemapPending(false);
    }
  }, []);

  // Theme store
  const { currentTheme, darkMode, setAvailableThemes } = useThemeStore();

  // Editor mode store
  const { mode: editorMode, setMode: setEditorMode } = useEditorModeStore();

  // Expose remap debug state in test environments
  useEffect(() => {
    if (!isTestEnv() || typeof window === 'undefined') return;
    const testWindow = window as Window & { __remapDebug?: unknown };
    const existing =
      testWindow.__remapDebug && typeof testWindow.__remapDebug === 'object'
        ? (testWindow.__remapDebug as Record<string, unknown>)
        : {};
    testWindow.__remapDebug = { ...existing, ...buildRemapDebugState() };
    return () => {
      delete testWindow.__remapDebug;
    };
  }, [remapModalVisible, missingEntities, availableEntities, autoRemapPending, isConnected]);

  // Ref for canvas container to apply theme
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  /**
   * ⭐⭐ RC5: the canvas surface colours for the SELECTED Home Assistant theme.
   *
   * `applyThemeToElement` below publishes the theme as ~30 CSS custom properties
   * on the canvas element, but HAVDM has no `var(--…)` consumers anywhere in
   * `src/` — so selecting a theme was invisible. These two values are read
   * directly by the canvas `<Content>` style, giving the theme a real outcome.
   *
   * ⚠ `undefined` whenever no theme is selected (the default, and the state
   * every visual baseline is captured in), so the canvas falls back to RC4's
   * antd tokens and no snapshot can move.
   */
  const { canvasThemeBackground, canvasThemeText } = useMemo(() => {
    if (!currentTheme) {
      return { canvasThemeBackground: undefined, canvasThemeText: undefined };
    }

    const colors = themeService.getThemeColors(currentTheme, darkMode);
    return {
      canvasThemeBackground: colors.primaryBackground || undefined,
      canvasThemeText: colors.primaryText || undefined,
    };
  }, [currentTheme, darkMode]);

  // Apply theme to canvas when theme or mode changes
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (container && currentTheme) {
      themeService.applyThemeToElement(container, currentTheme, darkMode);
    }

    return () => {
      if (container) {
        themeService.clearThemeFromElement(container);
      }
    };
  }, [currentTheme, darkMode]);

  // Load theme preferences on startup
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const darkModeResult = await window.electronAPI.getThemeDarkMode();
        const syncResult = await window.electronAPI.getThemeSyncWithHA();

        useThemeStore.setState({
          darkMode: darkModeResult.darkMode,
          syncWithHA: syncResult.sync,
        });

        logger.debug('Loaded theme preferences', darkModeResult, syncResult);
      } catch (error) {
        logger.error('Failed to load theme preferences', error);
      }
    };

    loadThemePreferences();
  }, []);

  // Expose lightweight test hooks for Playwright to inject themes/connection state
  useEffect(() => {
    if (isTestEnv()) {
      const testWindow = window as Window & { __testThemeApi?: TestThemeApi };
      testWindow.__testThemeApi = {
        setConnected: (connected: boolean) => setIsConnected(connected),
        applyThemes: (themesData: TestThemeData) => {
          const firstTheme = Object.keys(themesData?.themes ?? {})[0] ?? null;
          const themeName = themesData?.theme ?? firstTheme;

          // Reuse store setter to keep logic consistent
          useThemeStore.getState().setAvailableThemes({
            default_theme: themesData?.default_theme ?? themeName ?? 'default',
            default_dark_theme: themesData?.default_dark_theme ?? null,
            themes: (themesData?.themes ?? {}) as unknown as Record<string, Theme>,
            darkMode: typeof themesData?.darkMode === 'boolean' ? themesData.darkMode : true,
            theme: themeName ?? 'default',
          });
        },
      };
    }
  }, []);

  // Subscribe to live theme updates from HA
  useEffect(() => {
    if (!isConnected) return;

    let unsubscribe: (() => void) | null = null;

    const subscribe = () => {
      unsubscribe = window.electronAPI.haWsSubscribeToThemes((themes) => {
        setAvailableThemes(themes);
        logger.debug('Themes updated from Home Assistant');
      });
    };

    subscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isConnected, setAvailableThemes]);

  const handleOpenFile = async () => {
    try {
      const result = await fileService.openAndReadFile();
      if (result) {
        // Load dashboard into store
        loadDashboard(result.content, result.filePath);
        // Opened from a file, not from HA — no known deploy target (Phase 0.2).
        setSourceDashboard(null);

        // ⚠ HA-03: read the store's error FRESH, not the render-scope `error`.
        // `error` here is the snapshot React captured BEFORE loadDashboard ran,
        // so it could never see the failure it was testing for: the first bad
        // file reported "Dashboard loaded", and the NEXT good file reported the
        // previous file's stale failure. Same stale-closure family as RC2.
        const loadError = useDashboardStore.getState().error;
        if (loadError) {
          message.error({
            content: `Could not load ${result.filePath} — ${loadError}`,
            duration: 8,
          });
        } else {
          message.success(`Dashboard loaded: ${result.filePath}`);
          // Add to recent files
          await window.electronAPI.addRecentFile(result.filePath);
          setAutoRemapPending(true);
          setTimeout(triggerMissingEntityScan, 0);
        }
      }
    } catch (error) {
      message.error(`Failed to open file: ${(error as Error).message}`);
    }
  };

  const handleOpenRecentFile = async (filePath: string) => {
    try {
      // Check if file exists
      const fileExists = await window.electronAPI.fileExists(filePath);
      if (!fileExists.exists) {
        message.error(`File not found: ${filePath}`);
        return;
      }

      // Read file content
      const result = await window.electronAPI.readFile(filePath);
      if (result.success && result.content) {
        // Load dashboard into store
        loadDashboard(result.content, filePath);
        // Opened from a file, not from HA — no known deploy target (Phase 0.2).
        setSourceDashboard(null);

        // ⚠ HA-03: read the store's error FRESH — see handleOpenFile above.
        const loadError = useDashboardStore.getState().error;
        if (loadError) {
          message.error({
            content: `Could not load ${filePath} — ${loadError}`,
            duration: 8,
          });
        } else {
          message.success(`Dashboard loaded: ${filePath}`);
          // Add to recent files (moves it to top)
          await window.electronAPI.addRecentFile(filePath);
          setAutoRemapPending(true);
          setTimeout(triggerMissingEntityScan, 0);
        }
      } else {
        message.error(`Failed to read file: ${result.error}`);
      }
    } catch (error) {
      message.error(`Failed to open file: ${(error as Error).message}`);
    }
  };

  const handleSaveFile = async () => {
    if (!config) {
      message.warning('No dashboard loaded to save');
      return;
    }

    try {
      const yamlContent = yamlService.serializeDashboard(config);
      const success = await fileService.saveFileAs(yamlContent, 'dashboard.yaml');
      if (success) {
        markClean();
        message.success('Dashboard saved successfully!');
      }
    } catch (error) {
      message.error(`Failed to save file: ${(error as Error).message}`);
    }
  };

  // Export for Home Assistant: writes the HA-ready (sanitised) YAML to a file.
  // Distinct from Save, which keeps HAVDM-internal keys so the file round-trips
  // back into the editor (design §7). Does NOT mark the document clean — the
  // canonical save target is still the raw file.
  const handleExportForHA = async () => {
    if (!config) {
      message.warning('No dashboard loaded to export');
      return;
    }

    try {
      const yamlContent = yamlService.serializeForHA(config);
      const success = await fileService.saveFileAs(yamlContent, 'dashboard-ha.yaml');
      if (success) {
        message.success('Exported for Home Assistant successfully!');
      }
    } catch (error) {
      message.error(`Failed to export for Home Assistant: ${(error as Error).message}`);
    }
  };

  const handleSave = async () => {
    if (!config) {
      message.warning('No dashboard loaded to save');
      return;
    }

    if (filePath) {
      try {
        // Create backup before saving
        const backupResult = await window.electronAPI.createBackup(filePath);
        if (backupResult.success && backupResult.backupPath) {
          logger.info('Created backup', backupResult.backupPath);
        }

        const yamlContent = yamlService.serializeDashboard(config);
        const result = await window.electronAPI.writeFile(filePath, yamlContent);
        if (result.success) {
          markClean();
          message.success('Dashboard saved successfully!');
        } else {
          message.error(`Failed to save file: ${result.error}`);
        }
      } catch (error) {
        message.error(`Failed to save file: ${(error as Error).message}`);
      }
    } else {
      handleSaveFile();
    }
  };

  const handleToggleTheme = async () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    await window.electronAPI.setTheme(newTheme ? 'dark' : 'light');
    message.info(`Switched to ${newTheme ? 'dark' : 'light'} theme`);
  };

  const triggerMissingEntityScan = () => {
    if (!config) return;
    const referenced = entityRemappingService.extractEntityIds(config);
    const missing = entityRemappingService.detectMissing(referenced, availableEntities);
    setMissingEntities(missing);
    logRemapDebug('triggerMissingEntityScan', {
      referencedCount: referenced.length,
      missingCount: missing.length,
    });
    setRemapModalVisible(true);
    setAutoRemapPending(false);
  };

  const handleManualRemapOpen = () => {
    if (!config) {
      message.warning('Load a dashboard first');
      return;
    }
    const referenced = entityRemappingService.extractEntityIds(config);
    const missing = entityRemappingService.detectMissing(referenced, availableEntities);
    logRemapDebug('handleManualRemapOpen', {
      referencedCount: referenced.length,
      missingCount: missing.length,
    });
    setMissingEntities(missing);
    setRemapModalVisible(true);
    setAutoRemapPending(false);
  };

  const handleShowAbout = () => {
    Modal.info({
      title: 'About HA Visual Dashboard Maker',
      content: (
        <div>
          <p>
            <strong>Version:</strong> 0.1.0
          </p>
          <p>
            <strong>Author:</strong> BaggyG-AU
          </p>
          <p>
            A visual WYSIWYG editor for Home Assistant dashboards with support for custom cards.
          </p>
          <p style={{ marginTop: '16px' }}>
            <a
              href="https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker"
              onClick={(e) => {
                e.preventDefault();
                window.electronAPI.openExternal?.(
                  'https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker',
                );
              }}
            >
              View on GitHub
            </a>
          </p>
        </div>
      ),
      okText: 'Close',
    });
  };

  const resolveSelectedIndices = (cardsLength: number): number[] =>
    resolveOperationSelection(selectedCardIndex, selectedCardIndices, cardsLength);

  const handleCardSelect = (
    cardIndex: number | null,
    options?: { mode?: SelectionMode; sectionIndex?: number | null },
  ) => {
    if (selectedViewIndex === null) return;

    // Tier 4: a section-view card carries its sectionIndex. Route to the
    // section-addressed setter, which supports ctrl/shift multi-select WITHIN
    // one section (4.3a). A null sectionIndex/cardIndex falls through to the
    // flat path below, which also resets selectedSectionIndex.
    if (options?.sectionIndex != null && cardIndex !== null) {
      const sectionCards = resolveViewCards(
        config?.views?.[selectedViewIndex],
        options.sectionIndex,
      );
      selectSectionCardWithMode(
        selectedViewIndex,
        options.sectionIndex,
        cardIndex,
        options.mode ?? 'replace',
        sectionCards.length,
      );
      return;
    }

    const currentCards = config?.views?.[selectedViewIndex]?.cards ?? [];
    if (cardIndex === null) {
      setSelectedCards(selectedViewIndex, [], null);
      return;
    }

    selectCardWithMode(
      selectedViewIndex,
      cardIndex,
      options?.mode ?? 'replace',
      currentCards.length,
    );
  };

  const handleLayoutChange = (layout: GridLayoutType) => {
    if (!config || selectedViewIndex === null) return;

    // Skip this layout change if we just added a card
    if (ignoreNextLayoutChangeRef.current) {
      ignoreNextLayoutChangeRef.current = false;
      return;
    }

    // Update the layout information in the config
    const currentView = config.views[selectedViewIndex];
    const currentCards = currentView.cards || [];

    // Ignore transient stale layout events that can occur during rapid
    // state transitions (e.g., undo/redo) before the grid fully rebinds.
    if (layout.length !== currentCards.length) {
      return;
    }

    // Check if using layout-card grid system
    const usingLayoutCard = isLayoutCardGrid(currentView);

    const hasLayoutDelta = (() => {
      if (!currentView.cards || currentView.cards.length === 0) {
        return false;
      }

      if (usingLayoutCard) {
        const nextViewLayouts = convertGridLayoutToViewLayout(layout);
        return currentView.cards.some((card, index) => {
          const next = nextViewLayouts[index];
          const current = card.view_layout;
          if (!next || !current) return true;
          return current.grid_column !== next.grid_column || current.grid_row !== next.grid_row;
        });
      }

      return currentView.cards.some((card, index) => {
        const next = layout.find((item) => item.i === `card-${index}`);
        const current = card._havdm_layout;
        if (!next || !current) return true;
        return (
          current.x !== next.x ||
          current.y !== next.y ||
          current.w !== next.w ||
          current.h !== next.h
        );
      });
    })();

    if (!hasLayoutDelta) {
      return;
    }

    if (currentView.cards) {
      // The layout-card branch spreads through Record<string, unknown>, which
      // drops the discriminating `type` from the Card union — annotate so both
      // branches land back on Card[].
      let updatedCards: Card[];
      if (usingLayoutCard) {
        // Convert to view_layout format
        const viewLayouts = convertGridLayoutToViewLayout(layout);

        updatedCards = currentView.cards.map((card, index) => {
          const viewLayout = viewLayouts[index];
          if (viewLayout) {
            // Remove internal geometry and add view_layout
            const { _havdm_layout: _layout, ...cardWithoutLayout } = card as unknown as Record<
              string,
              unknown
            > & { _havdm_layout?: unknown };
            void _layout;
            return {
              ...(cardWithoutLayout as Record<string, unknown>),
              view_layout: {
                grid_column: viewLayout.grid_column,
                grid_row: viewLayout.grid_row,
              },
            } as unknown as Card;
          }
          return card;
        });
      } else {
        // Use internal layout property
        updatedCards = currentView.cards.map((card, index) => {
          const layoutItem = layout.find((item) => item.i === `card-${index}`);
          if (layoutItem) {
            return {
              ...card,
              _havdm_layout: {
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              },
            } as CardWithInternalLayout;
          }
          return card;
        });
      }

      const updatedViews = config.views.map((view, i) =>
        i === selectedViewIndex ? { ...view, cards: updatedCards } : view,
      );
      // During a batch (e.g., card property editing), use applyBatchedConfig to
      // avoid pushing intermediate states to the undo stack and prematurely
      // ending the batch. Use updateConfig only for standalone layout changes.
      if (isBatching) {
        applyBatchedConfig({ ...config, views: updatedViews });
      } else {
        updateConfig({ ...config, views: updatedViews });
      }
    }
  };

  const handleCardAdd = (cardType: string, gridX?: number, gridY?: number) => {
    if (!config) {
      message.warning('Please load a dashboard first');
      return;
    }

    if (selectedViewIndex === null) {
      message.warning('Please select a view first');
      return;
    }

    // Get card metadata from registry
    const cardMetadata = cardRegistry.get(cardType);
    if (!cardMetadata) {
      message.error(`Unknown card type: ${cardType}`);
      return;
    }

    const baseCard = {
      type: cardType,
      ...(cardMetadata.defaultProps as Record<string, unknown>),
    } as CardWithInternalLayout;
    const constraints = getCardSizeConstraints(baseCard);
    const currentView = config.views[selectedViewIndex];
    const usingLayoutCard = isLayoutCardGrid(currentView);

    // Tier 4 slice 4.3a: in a sections view, cards live in an ORDERED LIST under
    // `section.cards` with no {x,y,w,h} geometry, so the card is appended to the
    // target section and carries no `_havdm_layout`. Target = the section the
    // user last selected in; default to the first section otherwise.
    if (currentView.type === 'sections') {
      const sections = Array.isArray(currentView.sections) ? currentView.sections : [];
      if (sections.length === 0) {
        message.warning('This sections view has no sections to add a card to');
        return;
      }
      const targetSection =
        selectedSectionIndex !== null && sections[selectedSectionIndex] ? selectedSectionIndex : 0;

      const sectionCard = { ...baseCard } as Card;
      if (['entities', 'glance'].includes(cardType)) {
        (sectionCard as Record<string, unknown>).title = `New ${cardMetadata.name}`;
      }

      const nextView = addCardToSection(currentView, targetSection, sectionCard);
      const nextViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
      updateConfig({ ...config, views: nextViews });

      const appendedIndex = resolveViewCards(nextView, targetSection).length - 1;
      setSelectedSectionCard(selectedViewIndex, targetSection, appendedIndex);

      message.success(`Added ${cardMetadata.name} card to section ${targetSection + 1}`);
      return;
    }

    // Palette adds arrive without coordinates. Defaulting them to (0, 0) stacks
    // every card at the origin, so the stored layout disagrees with what the
    // vertical compactor actually renders — and the next drag stop then persists
    // that difference as an undoable edit. Place the card where the compactor
    // would put it instead.
    const x = gridX ?? 0;
    const y = gridY ?? nextFreeRow(currentView.cards || []);

    // Create new card with default properties and size it to constraints
    const newCard: CardWithInternalLayout = {
      ...baseCard,
      _havdm_layout: {
        x,
        y,
        w: constraints.w,
        h: constraints.h,
      },
    };
    if (usingLayoutCard) {
      newCard.view_layout = {
        grid_column: `${x + 1} / ${x + constraints.w + 1}`,
        grid_row: `${y + 1} / ${y + constraints.h + 1}`,
      };
    }

    // Add title for certain card types
    if (['entities', 'glance'].includes(cardType)) {
      newCard.title = `New ${cardMetadata.name}`;
    }

    // Update the config — immutable view/cards to ensure useMemo detects the change
    const updatedCards = [...(currentView.cards || []), newCard];
    const updatedViews = config.views.map((view, i) =>
      i === selectedViewIndex ? { ...view, cards: updatedCards } : view,
    );

    // Set flag to ignore the next layout change event (ref for synchronous update)
    ignoreNextLayoutChangeRef.current = true;

    updateConfig({ ...config, views: updatedViews });

    // Select the newly added card
    setSelectedCard(selectedViewIndex, updatedCards.length - 1);

    message.success(`Added ${cardMetadata.name} card at (${x}, ${y})`);
  };

  const handleCardDrop = (cardType: string, x?: number, y?: number) => {
    handleCardAdd(cardType, x, y);
  };

  // PROPS-06: a palette card dropped ON a container card nests INTO it.
  //
  // Before this, `GridCanvas.handleDrop` had no notion of a container, so a card
  // dragged onto a Vertical Stack was appended to the view's flat `cards` and
  // rendered BESIDE the stack — the round-1 tester's exact report. The Properties
  // panel compounded it by telling the user to "add or edit cards using the
  // canvas", i.e. documenting the one route that did not work.
  //
  // Sections views never reach here: GridCanvas delegates them to SectionsCanvas,
  // which has had its own nested drop targets since Tier 4 slice 4.3.
  const handleCardDropIntoContainer = (cardType: string, containerIndex: number) => {
    if (!config || selectedViewIndex === null) return;

    const cardMetadata = cardRegistry.get(cardType);
    if (!cardMetadata) {
      message.error(`Unknown card type: ${cardType}`);
      return;
    }

    const currentView = config.views[selectedViewIndex];
    const container = (currentView.cards || [])[containerIndex];
    if (!isContainerCard(container)) return;

    const child = {
      type: cardType,
      ...(cardMetadata.defaultProps as Record<string, unknown>),
    } as Card;

    const nextContainer = appendCardToContainer(container, child);
    if (nextContainer === container) return;

    const nextCards = (currentView.cards || []).map((card, i) =>
      i === containerIndex ? nextContainer : card,
    );
    const updatedViews = config.views.map((view, i) =>
      i === selectedViewIndex ? { ...view, cards: nextCards } : view,
    );
    updateConfig({ ...config, views: updatedViews });
    message.success(`${cardMetadata.name} added inside the ${container.type} card`);
  };

  const handleCardUpdate = (updatedCard: Card) => {
    if (!config || selectedViewIndex === null || selectedCardIndex === null) return;
    beginBatchUpdate();

    const currentView = config.views[selectedViewIndex];

    // Tier 4: write a single card back into its section (sections are
    // single-select this slice, so no bulk apply).
    if (selectedSectionIndex !== null) {
      const nextView = updateSectionCard(
        currentView,
        selectedSectionIndex,
        selectedCardIndex,
        updatedCard,
      );
      if (nextView !== currentView) {
        const updatedViews = config.views.map((view, i) =>
          i === selectedViewIndex ? nextView : view,
        );
        applyBatchedConfig({ ...config, views: updatedViews });
      }
      return;
    }

    if (currentView.cards && currentView.cards[selectedCardIndex]) {
      const targetIndices = resolveSelectedIndices(currentView.cards.length);
      const { cards: updatedCards } = applyBulkCardUpdate(
        currentView.cards,
        targetIndices,
        updatedCard,
      );

      const updatedViews = config.views.map((view, i) =>
        i === selectedViewIndex ? { ...view, cards: updatedCards } : view,
      );
      applyBatchedConfig({ ...config, views: updatedViews });
    }
  };

  const handleCardCommit = (updatedCard: Card) => {
    if (!config || selectedViewIndex === null || selectedCardIndex === null) return;

    const currentView = config.views[selectedViewIndex];

    // Tier 4: commit a single card back into its section, then re-select it so
    // the Properties panel refreshes (mirrors the flat re-select dance below).
    if (selectedSectionIndex !== null) {
      const nextView = updateSectionCard(
        currentView,
        selectedSectionIndex,
        selectedCardIndex,
        updatedCard,
      );
      if (nextView !== currentView) {
        const updatedViews = config.views.map((view, i) =>
          i === selectedViewIndex ? nextView : view,
        );
        applyBatchedConfig({ ...config, views: updatedViews });
        endBatchUpdate();
        message.success({ content: 'Card updated', key: 'card-updated', duration: 1.5 });
        const viewIndex = selectedViewIndex;
        const sectionIndex = selectedSectionIndex;
        const cardIndex = selectedCardIndex;
        setSelectedSectionCard(viewIndex, sectionIndex, null);
        setTimeout(() => setSelectedSectionCard(viewIndex, sectionIndex, cardIndex), 0);
      }
      return;
    }

    if (currentView.cards && currentView.cards[selectedCardIndex]) {
      const targetIndices = resolveSelectedIndices(currentView.cards.length);
      const { cards: updatedCards, updatedCount } = applyBulkCardUpdate(
        currentView.cards,
        targetIndices,
        updatedCard,
      );

      const updatedViews = config.views.map((view, i) =>
        i === selectedViewIndex ? { ...view, cards: updatedCards } : view,
      );
      applyBatchedConfig({ ...config, views: updatedViews });
      endBatchUpdate();

      message.success({
        content: updatedCount > 1 ? `Updated ${updatedCount} cards` : 'Card updated',
        key: 'card-updated',
        duration: 1.5,
      });
      const viewIndex = selectedViewIndex;
      const cardIndex = selectedCardIndex;
      setSelectedCard(viewIndex, null);
      setTimeout(() => setSelectedCard(viewIndex, cardIndex), 0);
    }
  };

  const handlePropertiesCancel = () => {
    endBatchUpdate();
    // Deselect card
    if (selectedViewIndex !== null) {
      setSelectedCards(selectedViewIndex, [], null);
    }
  };

  // Clipboard operations
  // Tier 4 slice 4.3a: shared cut/copy for a Sections view. Reads the selected
  // section's cards, so it is correct for both single- and multi-select (which
  // is confined to one section by selectSectionCardWithMode).
  const copySectionCards = ({ isCut }: { isCut: boolean }) => {
    if (!config || selectedViewIndex === null || selectedSectionIndex === null) return;

    const currentView = config.views[selectedViewIndex];
    const sectionCards = resolveViewCards(currentView, selectedSectionIndex);
    const selectedIndices = resolveSelectedIndices(sectionCards.length);
    if (selectedIndices.length === 0) {
      message.warning('No card selected');
      return;
    }

    const picked = cloneCardsForClipboard(
      selectedIndices
        .map((index) => sectionCards[index])
        .filter((card): card is CardWithInternalLayout => Boolean(card)),
    );

    setClipboard({
      cards: picked,
      isCut,
      sourceViewIndex: selectedViewIndex,
      sourceCardIndices: selectedIndices,
      sourceSectionIndex: selectedSectionIndex,
    });

    const verb = isCut ? 'cut' : 'copied';
    message.info(
      picked.length > 1
        ? `${picked.length} cards ${verb} to clipboard`
        : `Card ${verb} to clipboard`,
    );
  };

  const handleCardCut = () => {
    // Tier 4 slice 4.3a: inside a Sections view, cut/copy operate on the
    // selected section's cards. The clipboard payload is section-agnostic — a
    // paste lands in whichever section is selected then, which is what makes
    // cut+paste a move between sections.
    if (selectedSectionIndex !== null) {
      copySectionCards({ isCut: true });
      return;
    }
    if (!config || selectedViewIndex === null) {
      message.warning('No card selected');
      return;
    }

    const currentView = config.views[selectedViewIndex];
    if (!currentView.cards || currentView.cards.length === 0) {
      return;
    }

    const selectedIndices = resolveSelectedIndices(currentView.cards.length);
    if (selectedIndices.length === 0) {
      message.warning('No card selected');
      return;
    }

    const cardsToCut = selectedIndices
      .map((index) => currentView.cards?.[index])
      .filter((card): card is CardWithInternalLayout => Boolean(card))
      .map((card) => ({ ...card }));

    setClipboard({
      cards: cardsToCut,
      isCut: true,
      sourceViewIndex: selectedViewIndex,
      sourceCardIndices: selectedIndices,
      sourceSectionIndex: null,
    });

    message.info(
      cardsToCut.length > 1
        ? `${cardsToCut.length} cards cut to clipboard`
        : 'Card cut to clipboard',
    );
  };

  const handleCardCopy = () => {
    if (selectedSectionIndex !== null) {
      copySectionCards({ isCut: false });
      return;
    }
    if (!config || selectedViewIndex === null) {
      message.warning('No card selected');
      return;
    }

    const currentView = config.views[selectedViewIndex];
    if (!currentView.cards || currentView.cards.length === 0) {
      return;
    }

    const selectedIndices = resolveSelectedIndices(currentView.cards.length);
    if (selectedIndices.length === 0) {
      message.warning('No card selected');
      return;
    }

    const cardsToCopy = cloneCardsForClipboard(
      selectedIndices
        .map((index) => currentView.cards?.[index])
        .filter((card): card is CardWithInternalLayout => Boolean(card)),
    );

    setClipboard({
      cards: cardsToCopy,
      isCut: false,
      sourceViewIndex: selectedViewIndex,
      sourceCardIndices: selectedIndices,
      sourceSectionIndex: null,
    });

    message.info(
      cardsToCopy.length > 1
        ? `${cardsToCopy.length} cards copied to clipboard`
        : 'Card copied to clipboard',
    );
  };

  const handleCardPaste = () => {
    // Tier 4 slice 4.3a: paste into the selected section. Geometry is dropped —
    // sections are an ordered list — and a cut's originals are removed from
    // their source section, which is what makes cut+paste a move.
    if (selectedSectionIndex !== null) {
      if (!clipboard.cards || clipboard.cards.length === 0) {
        message.warning('Clipboard is empty');
        return;
      }
      if (!config || selectedViewIndex === null) {
        message.warning('Please select a view first');
        return;
      }

      const targetSection = selectedSectionIndex;
      const pasted = prepareCardsForSectionPaste(clipboard.cards);

      const currentView = config.views[selectedViewIndex];
      let nextView = insertCardsIntoSection(currentView, targetSection, pasted);

      const isMoveWithinThisView =
        clipboard.isCut &&
        clipboard.sourceViewIndex === selectedViewIndex &&
        clipboard.sourceSectionIndex !== null;
      if (isMoveWithinThisView) {
        nextView = removeSectionCards(
          nextView,
          clipboard.sourceSectionIndex as number,
          clipboard.sourceCardIndices,
        );
      }

      const nextViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
      updateConfig({ ...config, views: nextViews });

      if (clipboard.isCut) {
        setClipboard({
          cards: null,
          isCut: false,
          sourceViewIndex: null,
          sourceCardIndices: [],
          sourceSectionIndex: null,
        });
      }

      // Select what landed: it sits at the end of the target section, after any
      // cut originals were removed.
      const landedCards = resolveViewCards(nextView, targetSection);
      const startIndex = landedCards.length - pasted.length;
      setSelectedSectionCards(
        selectedViewIndex,
        targetSection,
        Array.from({ length: pasted.length }, (_, offset) => startIndex + offset),
      );

      message.success(
        clipboard.isCut
          ? pasted.length > 1
            ? `${pasted.length} cards moved`
            : 'Card moved'
          : pasted.length > 1
            ? `${pasted.length} cards pasted`
            : 'Card pasted',
      );
      return;
    }
    if (!clipboard.cards || clipboard.cards.length === 0) {
      message.warning('Clipboard is empty');
      return;
    }

    if (!config || selectedViewIndex === null) {
      message.warning('Please select a view first');
      return;
    }

    const currentView = config.views[selectedViewIndex];

    // Create new cards from clipboard (remove old geometry, will get new position)
    const pastedCards = prepareCardsForFlatPaste(clipboard.cards);

    // Build updated views immutably
    let updatedViews = config.views.map((view, i) => {
      if (i === selectedViewIndex) {
        return { ...view, cards: [...(view.cards || []), ...pastedCards] };
      }
      return view;
    });

    // If it was a cut operation, remove source cards
    if (
      clipboard.isCut &&
      clipboard.sourceViewIndex !== null &&
      clipboard.sourceCardIndices.length > 0
    ) {
      updatedViews = updatedViews.map((view, i) => {
        if (i === clipboard.sourceViewIndex && view.cards) {
          return { ...view, cards: removeCardsByIndices(view.cards, clipboard.sourceCardIndices) };
        }
        return view;
      });
    }

    updateConfig({ ...config, views: updatedViews });

    // Clear clipboard if it was a cut operation
    if (clipboard.isCut) {
      setClipboard({
        cards: null,
        isCut: false,
        sourceViewIndex: null,
        sourceCardIndices: [],
        sourceSectionIndex: null,
      });
      message.success(pastedCards.length > 1 ? `${pastedCards.length} cards moved` : 'Card moved');
    } else {
      message.success(
        pastedCards.length > 1 ? `${pastedCards.length} cards pasted` : 'Card pasted',
      );
    }

    // Select newly pasted cards
    const pastedViewCards = updatedViews[selectedViewIndex].cards || [];
    const startIndex = pastedViewCards.length - pastedCards.length;
    const nextSelection = Array.from(
      { length: pastedCards.length },
      (_, offset) => startIndex + offset,
    );
    setSelectedCards(
      selectedViewIndex,
      nextSelection,
      nextSelection[nextSelection.length - 1] ?? null,
    );
  };

  const handleCardDelete = () => {
    // Tier 4 slice 4.3a: delete the selected card(s) from the selected section.
    if (selectedSectionIndex !== null) {
      if (!config || selectedViewIndex === null) {
        message.warning('No card selected');
        return;
      }

      const currentView = config.views[selectedViewIndex];
      const sectionCards = resolveViewCards(currentView, selectedSectionIndex);
      const selectedIndices = resolveSelectedIndices(sectionCards.length);
      if (selectedIndices.length === 0) {
        message.warning('No card selected');
        return;
      }

      const nextView = removeSectionCards(currentView, selectedSectionIndex, selectedIndices);
      if (nextView === currentView) return;

      const nextViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
      updateConfig({ ...config, views: nextViews });

      // Keep the section context, drop the card selection.
      setSelectedSectionCard(selectedViewIndex, selectedSectionIndex, null);

      message.success(
        selectedIndices.length > 1 ? `${selectedIndices.length} cards deleted` : 'Card deleted',
      );
      return;
    }
    if (!config || selectedViewIndex === null) {
      message.warning('No card selected');
      return;
    }

    const currentView = config.views[selectedViewIndex];

    if (!currentView.cards || currentView.cards.length === 0) {
      return;
    }

    const selectedIndices = resolveSelectedIndices(currentView.cards.length);
    if (selectedIndices.length === 0) {
      message.warning('No card selected');
      return;
    }

    // Remove the card immutably
    const updatedCards = removeCardsByIndices(currentView.cards, selectedIndices);
    const updatedViews = config.views.map((view, i) =>
      i === selectedViewIndex ? { ...view, cards: updatedCards } : view,
    );

    updateConfig({ ...config, views: updatedViews });

    // Deselect card
    setSelectedCards(selectedViewIndex, [], null);

    message.success(
      selectedIndices.length > 1 ? `${selectedIndices.length} cards deleted` : 'Card deleted',
    );
  };

  // Tier 4 slice 4.3b: drag a card to reorder within a section or move it to
  // another section. Selection follows the card to its new (section, index).
  const handleSectionCardMove = (
    from: { sectionIndex: number; cardIndex: number },
    to: { sectionIndex: number; cardIndex: number },
  ) => {
    if (!config || selectedViewIndex === null) return;
    const currentView = config.views[selectedViewIndex];
    const nextView = moveSectionCard(currentView, from, to);
    if (nextView === currentView) return;

    const updatedViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
    updateConfig({ ...config, views: updatedViews });

    // Where the card landed: within a section it shifts left when moved past its
    // old slot; across sections it inserts at (clamped) target index.
    const landed = resolveViewCards(nextView, to.sectionIndex);
    let landedIndex = Math.min(Math.max(0, to.cardIndex), Math.max(0, landed.length - 1));
    if (from.sectionIndex === to.sectionIndex && from.cardIndex < to.cardIndex) {
      landedIndex = Math.min(to.cardIndex, landed.length - 1);
    }
    setSelectedSectionCard(selectedViewIndex, to.sectionIndex, landedIndex);
  };

  // Tier 4 slice 4.3b: commit a drag-resize (grid_options columns/rows) for one
  // section card. SectionsCanvas live-previews during the drag and calls this
  // once on mouseup, so this is a single, undoable edit.
  const handleSectionCardResize = (
    address: { sectionIndex: number; cardIndex: number },
    gridOptions: { columns?: number; rows?: number },
  ) => {
    if (!config || selectedViewIndex === null) return;
    const currentView = config.views[selectedViewIndex];
    const nextView = setSectionCardGridOptions(
      currentView,
      address.sectionIndex,
      address.cardIndex,
      gridOptions,
    );
    if (nextView === currentView) return;

    const updatedViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
    updateConfig({ ...config, views: updatedViews });
  };

  // --- Tier 4 slice 4.4: SECTION-level authoring ------------------------------
  // Each mirrors the card handlers: guard -> pure helper -> ref-equal skip ->
  // updateConfig (ONE undo entry). Structural ops (add/remove/move) reindex the
  // sections, so they reset the card selection to avoid a stale
  // (sectionIndex, cardIndex); title/max_columns don't reindex and leave it.
  const handleSectionAdd = (atIndex?: number) => {
    if (!config || selectedViewIndex === null) return;
    const currentView = config.views[selectedViewIndex];
    const nextView = addSection(currentView, atIndex);
    if (nextView === currentView) return;

    const updatedViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
    updateConfig({ ...config, views: updatedViews });

    // Select the new section (no card) so a subsequent Add-card targets it.
    const sections = Array.isArray(nextView.sections) ? nextView.sections : [];
    const newIndex =
      atIndex === undefined
        ? sections.length - 1
        : Math.min(Math.max(0, atIndex), sections.length - 1);
    setSelectedSectionCard(selectedViewIndex, newIndex, null);
    message.success('Section added');
  };

  const handleSectionRemove = (sectionIndex: number) => {
    if (!config || selectedViewIndex === null) return;
    const currentView = config.views[selectedViewIndex];
    const nextView = removeSection(currentView, sectionIndex);
    if (nextView === currentView) return;

    const updatedViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
    updateConfig({ ...config, views: updatedViews });

    // Removing reindexes the rest — drop the card selection. Undo restores the
    // whole section (cards included) in one step.
    setSelectedSectionCard(selectedViewIndex, null, null);
    message.success('Section deleted — press Ctrl+Z to undo');
  };

  const handleSectionMove = (fromIndex: number, toIndex: number) => {
    if (!config || selectedViewIndex === null) return;
    const currentView = config.views[selectedViewIndex];
    const nextView = moveSection(currentView, fromIndex, toIndex);
    if (nextView === currentView) return;

    const updatedViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
    updateConfig({ ...config, views: updatedViews });

    // Reordering reindexes sections — clear the card selection.
    setSelectedSectionCard(selectedViewIndex, null, null);
  };

  const handleSectionTitleChange = (sectionIndex: number, title: string) => {
    if (!config || selectedViewIndex === null) return;
    const currentView = config.views[selectedViewIndex];
    const nextView = setSectionTitle(currentView, sectionIndex, title);
    if (nextView === currentView) return;

    const updatedViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
    updateConfig({ ...config, views: updatedViews });
    // Renaming does not reindex — leave the selection untouched.
  };

  const handleViewMaxColumnsChange = (maxColumns: number) => {
    if (!config || selectedViewIndex === null) return;
    const currentView = config.views[selectedViewIndex];
    const nextView = setViewMaxColumns(currentView, maxColumns);
    if (nextView === currentView) return;

    const updatedViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
    updateConfig({ ...config, views: updatedViews });
  };

  // Tier 4 slice 4.5: convert the current non-sections view into a Sections view.
  // Flat cards are MIGRATED into one starter section (never destroyed), then the
  // canvas flips to SectionsCanvas. Card indices don't survive the flat->section
  // move, so reset the selection.
  const handleConvertToSections = () => {
    if (!config || selectedViewIndex === null) return;
    const currentView = config.views[selectedViewIndex];
    const nextView = convertViewToSections(currentView);
    if (nextView === currentView) return;

    const updatedViews = config.views.map((view, i) => (i === selectedViewIndex ? nextView : view));
    updateConfig({ ...config, views: updatedViews });
    setSelectedSectionCard(selectedViewIndex, null, null);
    message.success('View converted to a Sections view');
  };

  // Tier 4 slice 4.5: start a brand-new dashboard whose single view is a blank
  // Sections view (the "Sections" starter template in the New Dashboard dialog).
  const createNewSectionsDashboard = () => {
    const dashboard = { title: 'New Dashboard', views: [buildSectionsView()] };
    const yamlContent = yamlService.serializeDashboard(dashboard);
    loadDashboard(yamlContent, null);
    setSourceDashboard(null);
    message.success('New Sections dashboard created!');
  };

  // --- Tier 4 slice 4.6a: VIEW-level authoring ------------------------------
  // Add / remove / reorder VIEWS and edit a view's identity properties. Same
  // guard -> pure helper -> ref-equal skip -> updateConfig (one undo) ->
  // selection fix-up shape as the section handlers. View mutations route through
  // setSelectedView, which resets card/section selection.

  const handleAddView = () => {
    if (!config) return;
    const nextConfig = addView(config);
    if (nextConfig === config) return;
    updateConfig(nextConfig);
    setSelectedView(nextConfig.views.length - 1); // select + focus the new view
    message.success('View added');
  };

  const handleOpenViewSettings = () => {
    if (!config || selectedViewIndex === null) return;
    setViewSettingsOpen(true);
  };

  // Slice 4.6b: commit the view-settings form — identity props AND (if changed)
  // the view TYPE, in ONE undo step. Type changes to/from `sections` are
  // structural conversions that PRESERVE cards (convert-to / convert-away);
  // flat<->flat is a metadata change. The type control never offers HAVDM's
  // internal custom:grid-layout (Tier 3) — it is normalised to masonry.
  const handleViewSettingsSave = (change: {
    patch: ViewPropsPatch;
    type: string;
    grid?: ViewGridPatch;
  }) => {
    if (!config || selectedViewIndex === null) {
      setViewSettingsOpen(false);
      return;
    }
    const index = selectedViewIndex;
    const currentView = config.views[index];
    const curType = normalizeViewType(currentView);

    // 1) identity props, then 2) the type change (if any).
    let nextView = setViewProps(currentView, change.patch);
    if (change.type !== curType) {
      if (change.type === 'sections') {
        nextView = convertViewToSections(nextView);
      } else if (curType === 'sections') {
        nextView = flattenSectionsView(nextView, change.type);
      } else if (isLayoutCardViewType(change.type) && !isLayoutCardViewType(curType)) {
        // Slice 4.7b: converting INTO a real layout-card view. This clears the
        // HAVDM scaffold marker — without that the export boundary would still
        // treat the view as internal and destroy the grid the user just asked
        // for, reintroducing the 4.7a data-loss bug.
        nextView = convertViewToLayoutCard(nextView);
      } else {
        nextView = setViewType(nextView, change.type);
      }
    }

    // 3) the grid patch, applied AFTER any conversion so it edits the view's
    // final layout rather than one that is about to be replaced.
    if (change.grid) {
      nextView = setViewGrid(nextView, change.grid);
    }

    if (nextView === currentView) {
      setViewSettingsOpen(false);
      return;
    }

    const updatedViews = config.views.map((view, i) => (i === index ? nextView : view));
    updateConfig({ ...config, views: updatedViews });

    // A change in "sections-ness" reindexes card addressing (flat <-> section) —
    // reset the selection so a stale (sectionIndex, cardIndex) can't linger.
    const wasSections = curType === 'sections';
    const isSections = normalizeViewType(nextView) === 'sections';
    if (wasSections !== isSections) {
      setSelectedSectionCard(index, null, null);
    }
    message.success('View updated');
    setViewSettingsOpen(false);
  };

  const handleRemoveView = () => {
    if (!config || selectedViewIndex === null) return;
    if (config.views.length <= 1) {
      message.warning('A dashboard must have at least one view');
      return;
    }
    const index = selectedViewIndex;
    const view = config.views[index];
    const hasContent =
      (view.cards?.length ?? 0) > 0 ||
      (Array.isArray(view.sections) &&
        view.sections.some((section) => (section.cards?.length ?? 0) > 0));

    const doRemove = () => {
      const nextConfig = removeView(config, index);
      if (nextConfig === config) return;
      updateConfig(nextConfig);
      // The removed index is gone — clamp selection to a surviving view.
      setSelectedView(Math.min(index, nextConfig.views.length - 1));
      setViewSettingsOpen(false);
      message.success('View deleted — press Ctrl+Z to undo');
    };

    if (hasContent) {
      Modal.confirm({
        title: 'Delete this view?',
        content:
          'This view contains cards. Deleting it removes them from the dashboard. You can undo with Ctrl+Z.',
        okText: 'Delete',
        cancelText: 'Cancel',
        okButtonProps: { danger: true },
        onOk: doRemove,
      });
    } else {
      doRemove();
    }
  };

  const handleMoveView = (direction: -1 | 1) => {
    if (!config || selectedViewIndex === null) return;
    const from = selectedViewIndex;
    const to = from + direction;
    if (to < 0 || to >= config.views.length) return;
    const nextConfig = moveView(config, from, to);
    if (nextConfig === config) return;
    updateConfig(nextConfig);
    setSelectedView(to); // follow the moved view
  };

  const handleOpenConnectionDialog = () => {
    setSettingsTab('connection');
    setSettingsVisible(true);
  };

  const handleConnect = async (url: string, token: string) => {
    try {
      // Connect to WebSocket via IPC (runs in main process)
      const result = await window.electronAPI.haWsConnect(url, token);
      if (!result.success) {
        throw new Error(result.error || 'Failed to connect');
      }

      setIsConnected(true);
      setHaUrl(url);
      message.success(`Connected to Home Assistant at ${url}`);

      // Fetch and cache entities in the background
      fetchAndCacheEntities();

      // Capture the capability inventory in the background (Phase 3) so the
      // palette can resolve card availability offline. Fire-and-forget.
      captureCapabilityProfile();

      // Fetch themes in the background
      fetchThemes();
    } catch (error) {
      message.error(`Failed to connect: ${(error as Error).message}`);
      throw error;
    }
  };

  const fetchAndCacheEntities = async () => {
    try {
      logger.debug('Fetching entities from Home Assistant');
      const result = await window.electronAPI.haWsFetchEntities();
      if (result.success) {
        logger.info(`Cached ${result.entities?.length || 0} entities`);
      }
    } catch (error) {
      logger.error('Failed to fetch entities', error);
      // Don't show error to user - this is a background operation
    }
  };

  const captureCapabilityProfile = async () => {
    try {
      const result = await window.electronAPI.capabilityCapture();
      if (result.success) {
        logger.info(
          `Captured capability profile: ${result.profile?.installedElements.length ?? 0} custom elements`,
        );
      }
    } catch (error) {
      // Background operation — don't surface to the user.
      logger.error('Failed to capture capability profile', error);
    }
  };

  const fetchThemes = async () => {
    if (!isConnected) return;

    try {
      logger.debug('Fetching themes from Home Assistant');
      const result = await window.electronAPI.haWsGetThemes();
      if (result.success && result.themes) {
        setAvailableThemes(result.themes);
        logger.info(`Loaded ${Object.keys(result.themes.themes || {}).length} themes from HA`);
      }
    } catch (error) {
      logger.error('Failed to fetch themes', error);
      // Don't show error to user - this is a background operation
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchThemes();
    }
  }, [isConnected]);

  useEffect(() => {
    // Expose a tiny test-only hook for Playwright to drive connection/theme state
    const testWindow = window as Window & { __testThemeApi?: TestThemeApi };
    testWindow.__testThemeApi = {
      setConnected: (connected: boolean) => setIsConnected(connected),
      applyThemes: (themes: TestThemeData) => {
        // Ensure connected state for UI that depends on it
        setIsConnected(true);
        setAvailableThemes(themes as unknown as Parameters<typeof setAvailableThemes>[0]);
      },
    };

    return () => {
      delete testWindow.__testThemeApi;
    };
  }, [setAvailableThemes]);

  useEffect(() => {
    const testWindow = window as Window & { __dashboardTestApi?: DashboardTestApi };
    testWindow.__dashboardTestApi = {
      canUndo: () => useDashboardStore.getState().canUndo(),
      canRedo: () => useDashboardStore.getState().canRedo(),
      undo: () => {
        ignoreNextLayoutChangeRef.current = true;
        useDashboardStore.getState().undo();
      },
      redo: () => {
        ignoreNextLayoutChangeRef.current = true;
        useDashboardStore.getState().redo();
      },
      loadYaml: (yaml: string, filePath: string | null = null) => {
        useDashboardStore.getState().loadDashboard(yaml, filePath);
      },
    };

    return () => {
      delete testWindow.__dashboardTestApi;
    };
  }, []);

  useEffect(() => {
    // Disable Ant motion in automated tests to avoid hidden/animating portals
    if (isTestEnv()) {
      document.body.classList.add('ant-motion-disabled');
    }
  }, []);

  const handleOpenEntityBrowser = (insertCallback: (entityId: string) => void) => {
    setEntityInsertCallback(() => insertCallback);
    setEntityBrowserVisible(true);
  };

  const handleEntitySelected = (entityId: string) => {
    if (entityInsertCallback) {
      entityInsertCallback(entityId);
      setEntityInsertCallback(null);
    }
    setEntityBrowserVisible(false);
  };

  const handleDisconnect = async () => {
    await window.electronAPI.clearHAConnection();
    haConnectionService.disconnect();
    await window.electronAPI.haWsClose();
    setIsConnected(false);
    setHaUrl('');
    message.info('Disconnected from Home Assistant');
  };

  const handleOpenDeployDialog = () => {
    if (!config) {
      message.warning('No dashboard loaded to deploy');
      return;
    }
    if (!isConnected) {
      message.warning('Please connect to Home Assistant first');
      return;
    }
    setDeployDialogVisible(true);
  };

  const handleCloseDeployDialog = () => {
    setDeployDialogVisible(false);
  };

  const handleOpenDashboardBrowser = () => {
    // ⚠ RC5: the `if (!isConnected) { warn; return; }` guard that used to live
    // here was a THIRD gate, behind the two `disabled={!isConnected}` props on
    // the buttons that call this. Removing only the props left the dialog still
    // refusing to open — the browser hosts the Preset Marketplace, which is
    // entirely LOCAL content. The HA Dashboards tab inside handles the
    // disconnected case on its own with a "Not Connected" alert.
    // ⭐ A handler reachable from more than one control is separate wiring from
    // those controls, and needs its own evidence.
    setDashboardBrowserVisible(true);
  };

  const handleCloseDashboardBrowser = () => {
    setDashboardBrowserVisible(false);
  };

  const handleDashboardDownload = (
    dashboardYaml: string,
    dashboardTitle: string,
    dashboardId: string,
    source: SourceDashboard | null,
  ) => {
    // ⭐ HA-03: parse BEFORE loading, and report what actually happened.
    //
    // This used to call loadDashboard(), then setSourceDashboard(), then parse a
    // SECOND time for the remap scan, and then announce success UNCONDITIONALLY.
    // So a dashboard the parser rejected — a Home Assistant strategy dashboard
    // has no `views` at all — produced a green "loaded successfully!" toast over
    // an empty canvas, while still arming the Live-Preview deploy target at the
    // real HA dashboard. That silent failure IS the HA-03 defect: per THE VISION
    // a dashboard HAVDM cannot parse must degrade honestly, naming what it could
    // not handle. One parse now decides everything.
    const parsed = yamlService.parseDashboard(dashboardYaml);
    if (!parsed.success || !parsed.data) {
      message.error({
        content: `Could not load "${dashboardTitle}" — ${parsed.error ?? 'HAVDM could not read this dashboard.'}`,
        duration: 8,
      });
      return;
    }

    // Load the downloaded dashboard into the editor
    loadDashboard(dashboardYaml, `${dashboardTitle} (${dashboardId})`);
    // Remember the HA source so a later Live-Preview deploy writes back to THIS
    // dashboard. `source` is null for imports with no HA origin (e.g. presets),
    // and source.urlPath is null only for the default 'lovelace' (Phase 0.2).
    // ⚠ Deliberately AFTER the parse gate — a failed download must never leave a
    // deploy target armed at a dashboard whose content we could not read.
    setSourceDashboard(source);

    const referenced = entityRemappingService.extractEntityIds(parsed.data);
    const missing = entityRemappingService.detectMissing(referenced, availableEntities);
    setMissingEntities(missing);
    setAutoRemapPending(false);
    if (missing.length > 0) {
      setRemapModalVisible(true);
    }

    message.success(`Dashboard "${dashboardTitle}" loaded successfully!`);
  };

  const handleNewDashboard = () => {
    // Check if there are unsaved changes
    if (isDirty && config) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content:
          'You have unsaved changes. Do you want to create a new dashboard anyway? Your current changes will be lost.',
        okText: 'Create New',
        cancelText: 'Cancel',
        okButtonProps: { danger: true },
        onOk: () => setNewDashboardDialogVisible(true),
      });
    } else {
      setNewDashboardDialogVisible(true);
    }
  };

  const createNewDashboard = () => {
    // Create a blank dashboard with one empty view
    const blankDashboard = {
      title: 'New Dashboard',
      views: [
        {
          title: 'Home',
          path: 'home',
          // HAVDM's flat-canvas scaffold, including the `_havdm_scaffold` marker
          // the export boundary uses to tell it apart from a user's real
          // layout-card grid view (slice 4.7a).
          ...HAVDM_SCAFFOLD_VIEW_FIELDS,
          cards: [],
        },
      ],
    };

    const yamlContent = yamlService.serializeDashboard(blankDashboard);
    loadDashboard(yamlContent, null); // null filePath means it's unsaved
    setSourceDashboard(null); // brand-new dashboard — no HA deploy target (Phase 0.2)
    message.success('New blank dashboard created!');
  };

  const handleCreateFromTemplate = () => {
    // TODO: Implement template selection dialog
    message.info('Template selection coming soon! For now, creating a blank dashboard.');
    createNewDashboard();
  };

  const handleCreateFromEntityType = (dashboardYaml: string, title: string) => {
    loadDashboard(dashboardYaml, null); // null filePath means it's unsaved
    setSourceDashboard(null); // generated dashboard — no HA deploy target (Phase 0.2)

    // Parse to get card count for success message
    const result = yamlService.parseDashboard(dashboardYaml);
    const cardCount = (result.success && result.data?.views[0]?.cards?.length) || 0;

    message.success({
      content: `${title} created successfully! ${cardCount} cards added.`,
      duration: 3,
    });
  };

  const handleOpenYamlEditor = () => {
    if (!config) {
      message.warning('No dashboard loaded to edit');
      return;
    }
    setYamlEditorVisible(true);
  };

  const handleCloseYamlEditor = () => {
    setYamlEditorVisible(false);
  };

  const handleApplyYamlChanges = (newYaml: string) => {
    // Reload the dashboard with the new YAML
    loadDashboard(newYaml, filePath);
    setYamlEditorVisible(false);

    // ⚠ HA-03: read the store's error FRESH — the third instance of the same
    // stale-snapshot read. Applying unparseable YAML from the Monaco editor
    // reported nothing at all, because `error` here was the value from before
    // loadDashboard() ran.
    const applyError = useDashboardStore.getState().error;
    if (applyError) {
      message.error({
        content: `Could not apply the YAML changes — ${applyError}`,
        duration: 8,
      });
    }
  };

  const handleEnterLivePreview = async () => {
    if (!config) {
      message.warning('No dashboard loaded');
      return;
    }

    // Check WebSocket connection via IPC
    const wsStatus = await window.electronAPI.haWsIsConnected();
    if (!isConnected || !wsStatus.connected) {
      message.warning('Please connect to Home Assistant first');
      return;
    }

    try {
      message.loading({ content: 'Creating temporary dashboard...', key: 'livepreview' });

      // Create temporary dashboard in HA via IPC. Live Preview is an HA-bound
      // route, so send the sanitised config (HAVDM-internal keys removed) — the
      // preview then shows what HA will actually render (B4).
      const result = await window.electronAPI.haWsCreateTempDashboard(
        yamlService.sanitizeForHA(config),
      );
      if (!result.success || !result.tempPath) {
        throw new Error(result.error || 'Failed to create temp dashboard');
      }

      setTempDashboardPath(result.tempPath);
      setLivePreviewMode(true);

      message.success({ content: 'Live preview mode activated!', key: 'livepreview', duration: 2 });
    } catch (error) {
      message.error({
        content: `Failed to create temp dashboard: ${(error as Error).message}`,
        key: 'livepreview',
      });
    }
  };

  const handleExitLivePreview = async () => {
    if (tempDashboardPath) {
      try {
        // Delete temp dashboard via IPC
        const result = await window.electronAPI.haWsDeleteTempDashboard(tempDashboardPath);
        if (result.success) {
          message.info('Temporary dashboard deleted');
        }
      } catch (error) {
        logger.error('Failed to delete temp dashboard', error);
      }
    }

    setLivePreviewMode(false);
    setTempDashboardPath(null);
  };

  const handleDeployFromLivePreview = async () => {
    if (!tempDashboardPath) {
      message.error('No temporary dashboard to deploy');
      return;
    }

    const target = resolveLivePreviewDeployTarget(sourceDashboard);

    // Not sourced from HA (opened from a file / newly created): there is no
    // dashboard to deploy back to. Rather than silently overwrite the default
    // 'lovelace' (the historical destructive bug), hand off to the explicit
    // DeployDialog where the user creates or picks a target (Phase 0.2).
    if (target.kind === 'unknown') {
      message.info({
        content: 'This design was not opened from Home Assistant — choose where to deploy it.',
        key: 'deploy',
        duration: 4,
      });
      await handleExitLivePreview();
      setDeployDialogVisible(true);
      return;
    }

    try {
      message.loading({ content: 'Deploying to production...', key: 'deploy' });

      // Deploy temp dashboard to the SOURCE dashboard it was loaded from.
      // target.urlPath is null ONLY for the genuine default dashboard.
      const result = await window.electronAPI.haWsDeployDashboard(
        tempDashboardPath,
        target.urlPath,
      );

      if (result.success) {
        message.success({
          content: `Dashboard deployed successfully! Backup saved to: ${result.backupPath}`,
          key: 'deploy',
          duration: 5,
        });

        // Exit live preview mode
        setLivePreviewMode(false);
        setTempDashboardPath(null);

        // Mark as clean since we just deployed
        markClean();
      } else {
        message.error({ content: `Deployment failed: ${result.error}`, key: 'deploy' });
      }
    } catch (error) {
      message.error({ content: `Deployment failed: ${(error as Error).message}`, key: 'deploy' });
    }
  };

  // Load theme preference and HA connection on startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { theme } = await window.electronAPI.getTheme();
        setIsDarkTheme(theme === 'dark');
      } catch (error) {
        logger.error('Failed to load theme preference', error);
        // Default to dark theme if settings service is not available
        setIsDarkTheme(true);
      }
    };

    const loadHAConnection = async () => {
      try {
        // Try to load last used credential from secure storage
        const lastUsedResult = await window.electronAPI.credentialsGetLastUsed();
        if (lastUsedResult.success && lastUsedResult.credential) {
          const { url, token, name } = lastUsedResult.credential;
          logger.info(`Auto-reconnecting to: ${name} (${url})`);

          haConnectionService.setConfig({ url, token });

          // Also connect WebSocket for live preview functionality (via IPC)
          try {
            const wsResult = await window.electronAPI.haWsConnect(url, token);
            if (wsResult.success) {
              setHaUrl(url);
              setIsConnected(true);
              logger.info('Successfully restored HA connection from saved credentials');

              // Fetch and cache entities on startup (with small delay to ensure WS is stable)
              setTimeout(async () => {
                try {
                  await fetchAndCacheEntities();
                  logger.debug('Entity cache updated on startup');
                  await fetchThemes();
                  logger.debug('Themes loaded on startup');
                } catch (err) {
                  logger.error('Failed to fetch entities on startup', err);
                }
              }, 500);
            } else {
              logger.error('Failed to reconnect WebSocket', wsResult.error);
            }
          } catch (wsError) {
            logger.error('Failed to reconnect WebSocket', wsError);
          }
        } else {
          // Fallback to old settings method for backward compatibility
          const saved = await window.electronAPI.getHAConnection();
          if (saved.url && saved.token) {
            haConnectionService.setConfig({ url: saved.url, token: saved.token });
            // Also connect WebSocket for live preview functionality (via IPC)
            try {
              const wsResult = await window.electronAPI.haWsConnect(saved.url, saved.token);
              if (wsResult.success) {
                setHaUrl(saved.url);
                setIsConnected(true);
                logger.info('Restored HA connection from old settings', saved.url);

                // Fetch and cache entities on startup (with small delay to ensure WS is stable)
                setTimeout(async () => {
                  try {
                    await fetchAndCacheEntities();
                    logger.debug('Entity cache updated on startup');
                    await fetchThemes();
                    logger.debug('Themes loaded on startup');
                  } catch (err) {
                    logger.error('Failed to fetch entities on startup', err);
                  }
                }, 500);
              } else {
                logger.error('Failed to reconnect WebSocket', wsResult.error);
              }
            } catch (wsError) {
              logger.error('Failed to reconnect WebSocket', wsError);
            }
          }
        }
      } catch (error) {
        logger.error('Failed to load HA connection', error);
      }
    };

    loadTheme();
    loadHAConnection();
  }, []);

  // Load verbose debug flag
  useEffect(() => {
    const loadVerbose = async () => {
      try {
        const result = await window.electronAPI.getVerboseUIDebug();
        setVerboseUIDebug(result.verbose);
      } catch (error) {
        logger.error('Failed to load verbose UI flag', error);
      }
    };
    loadVerbose();
  }, []);

  // Load logging level and apply to renderer logger
  useEffect(() => {
    const loadLogging = async () => {
      try {
        const result = await window.electronAPI.getLoggingLevel();
        logger.setLevel(result.level as LoggingLevel);
      } catch (error) {
        logger.error('Failed to load logging level', error);
      }
    };
    loadLogging();
  }, []);

  // Load haptic settings for renderer usage
  useEffect(() => {
    const loadHaptics = async () => {
      try {
        const result = await window.electronAPI.getHapticSettings();
        setHapticSettings({ enabled: result.enabled, intensity: result.intensity });
      } catch (error) {
        logger.error('Failed to load haptic settings', error);
      }
    };
    loadHaptics();
  }, []);

  // Load sound settings for renderer usage
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const result = await window.electronAPI.getSoundSettings();
        setSoundSettings({ enabled: result.enabled, volume: result.volume });
      } catch (error) {
        logger.error('Failed to load sound settings', error);
      }
    };
    loadSounds();
  }, []);

  // ⚠⚠ The menu listeners below subscribe ONCE, deliberately — re-subscribing on
  // every render would churn IPC listeners. The cost is that anything those
  // callbacks close over is frozen at FIRST render, and at first render the app
  // is on the welcome screen with `config === null` and `isDarkTheme` at its
  // startup value.
  //
  // That cost was being paid: File > Save As... and File > Export for Home
  // Assistant... hit the `if (!config)` guard forever and reported "No dashboard
  // loaded" no matter what was on the canvas (UAT v1.0.0 FILE-06, EXPORT-01 —
  // and EXPORT-01 cascaded into four more cards being skipped "Can't export").
  // View > Toggle Theme computed `!isDarkTheme` from the frozen value, so every
  // press produced the same result and the theme never toggled back (SHELL-03).
  // The toolbar buttons and the Ctrl+S shortcut were unaffected, because those
  // rebind every render — which is exactly why the same operation appeared to
  // work or fail depending on how it was invoked.
  //
  // Route through a ref refreshed on every render so the one-time subscription
  // always calls the CURRENT handler. Same idiom as PropertiesPanel's cardRef /
  // onChangeRef (src/components/PropertiesPanel.tsx).
  const menuHandlersRef = useRef({
    handleOpenFile,
    handleSave,
    handleSaveFile,
    handleExportForHA,
    handleToggleTheme,
    handleShowAbout,
    handleOpenRecentFile,
  });
  menuHandlersRef.current = {
    handleOpenFile,
    handleSave,
    handleSaveFile,
    handleExportForHA,
    handleToggleTheme,
    handleShowAbout,
    handleOpenRecentFile,
  };

  // Set up menu event listeners
  useEffect(() => {
    const handleMenuOpenFile = () => menuHandlersRef.current.handleOpenFile();
    const handleMenuSave = () => menuHandlersRef.current.handleSave();
    const handleMenuSaveFileAs = () => menuHandlersRef.current.handleSaveFile();
    const handleMenuExportForHA = () => menuHandlersRef.current.handleExportForHA();
    const handleMenuToggleTheme = () => menuHandlersRef.current.handleToggleTheme();
    const handleMenuShowAbout = () => menuHandlersRef.current.handleShowAbout();
    const handleMenuOpenRecentFile = (filePath: string) =>
      menuHandlersRef.current.handleOpenRecentFile(filePath);

    const unsubOpenFile = window.electronAPI.onMenuOpenFile(handleMenuOpenFile);
    const unsubSaveFile = window.electronAPI.onMenuSaveFile(handleMenuSave);
    const unsubSaveFileAs = window.electronAPI.onMenuSaveFileAs(handleMenuSaveFileAs);
    const unsubExportForHA = window.electronAPI.onMenuExportForHA(handleMenuExportForHA);
    const unsubToggleTheme = window.electronAPI.onMenuToggleTheme(handleMenuToggleTheme);
    const unsubShowAbout = window.electronAPI.onMenuShowAbout(handleMenuShowAbout);
    const unsubOpenRecentFile = window.electronAPI.onMenuOpenRecentFile(handleMenuOpenRecentFile);
    const unsubVersionControl = window.electronAPI.onMenuVersionControl(() =>
      setVersionControlOpen(true),
    );

    // Cleanup listeners when component unmounts
    return () => {
      unsubOpenFile();
      unsubSaveFile();
      unsubSaveFileAs();
      unsubExportForHA();
      unsubToggleTheme();
      unsubShowAbout();
      unsubOpenRecentFile();
      unsubVersionControl();
    };
  }, []);

  // Keyboard shortcuts for card operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // CANVAS-07: this used to bail out of EVERY shortcut whenever focus was in
      // any input, which meant Ctrl+Z from the Card Palette search box undid a
      // character of the search term instead of the card the user had just
      // deleted — while the header's Undo button, which has no such guard,
      // restored it correctly from the same focus state.
      //
      // Undo/redo are application-level history commands and now pass through
      // from fields that opt in with `data-shortcut-passthrough` (a transient
      // filter, not an edited document). Ctrl+S, Ctrl+C/X/V and Delete remain
      // guarded in ALL text fields. See src/utils/keyboardShortcuts.ts.
      const target = event.target as HTMLElement;

      if (!shouldHandleGlobalShortcut(event, target)) {
        return;
      }

      // Ctrl+S: Save
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
      // Ctrl+Z: Undo
      else if (event.ctrlKey && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        if (canUndo()) {
          ignoreNextLayoutChangeRef.current = true;
          undo();
          message.info('Undo');
        }
      }
      // Ctrl+Y or Ctrl+Shift+Z: Redo
      else if (
        (event.ctrlKey && event.key === 'y') ||
        (event.ctrlKey && event.shiftKey && event.key === 'z')
      ) {
        event.preventDefault();
        if (canRedo()) {
          ignoreNextLayoutChangeRef.current = true;
          redo();
          message.info('Redo');
        }
      }
      // Ctrl+C: Copy
      else if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        handleCardCopy();
      }
      // Ctrl+X: Cut
      else if (event.ctrlKey && event.key === 'x') {
        event.preventDefault();
        handleCardCut();
      }
      // Ctrl+V: Paste
      else if (event.ctrlKey && event.key === 'v') {
        event.preventDefault();
        handleCardPaste();
      }
      // Delete: Delete card
      else if (event.key === 'Delete') {
        event.preventDefault();
        handleCardDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedViewIndex,
    selectedCardIndex,
    selectedCardIndices,
    clipboard,
    config,
    handleSave,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <HAEntityProvider enabled={isConnected}>
        <RemapWatcher
          config={config}
          onAvailableEntities={handleAvailableEntities}
          onMissingDetected={handleMissingDetected}
        />
        <Layout data-testid="app-shell" className="app-container" style={{ height: '100vh' }}>
          <Header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: token.colorText, fontSize: '20px', fontWeight: 'bold' }}>
                HA Visual Dashboard Maker
              </div>
              <Space>
                <Tooltip title="Undo last action (Ctrl+Z)">
                  <Button
                    size="small"
                    icon={<UndoOutlined />}
                    onClick={() => {
                      ignoreNextLayoutChangeRef.current = true;
                      undo();
                      message.info('Undo');
                    }}
                    disabled={!canUndo()}
                  />
                </Tooltip>
                <Tooltip title="Redo last undone action (Ctrl+Y)">
                  <Button
                    size="small"
                    icon={<RedoOutlined />}
                    onClick={() => {
                      ignoreNextLayoutChangeRef.current = true;
                      redo();
                      message.info('Redo');
                    }}
                    disabled={!canRedo()}
                  />
                </Tooltip>
                <Tooltip title="Browse and search Home Assistant entities">
                  <Button
                    size="small"
                    icon={<DatabaseOutlined />}
                    onClick={() => setEntityBrowserVisible(true)}
                  >
                    Entities
                  </Button>
                </Tooltip>
              </Space>
            </div>
            <Space>
              {/* ⭐ RC5: NOT gated on isConnected. Themes are local content —
                  HAVDM ships built-in themes, so the selector is useful with no
                  Home Assistant at all. Connecting merely ADDS that instance's
                  themes (see BUILT_IN_THEMES in src/features/theme-manager). */}
              <ThemeSelector onRefreshThemes={fetchThemes} isConnected={isConnected} />
              <Badge
                status={isConnected ? 'success' : 'default'}
                text={isConnected ? 'Connected' : 'Not Connected'}
                style={{ color: token.colorTextSecondary }}
              />
              {isConnected ? (
                <Button size="small" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="small"
                  icon={<ApiOutlined />}
                  onClick={handleOpenConnectionDialog}
                >
                  Connect to HA
                </Button>
              )}
              <Tooltip title="Settings">
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  aria-label="Settings"
                  onClick={() => {
                    setSettingsTab('appearance');
                    setSettingsVisible(true);
                  }}
                />
              </Tooltip>
            </Space>
          </Header>
          <Layout>
            <Sider
              width={280}
              theme={isDarkTheme ? 'dark' : 'light'}
              style={{ height: '100vh', overflow: 'hidden' }}
            >
              <CardPalette onCardAdd={handleCardAdd} />
            </Sider>
            <Layout style={{ padding: '24px' }}>
              <Content
                ref={canvasContainerRef}
                data-testid="canvas-surface"
                style={{
                  padding: 24,
                  margin: 0,
                  minHeight: 280,
                  // ⭐ Was hardcoded '#141414' / 'white', which never consulted
                  // isDarkTheme — the canvas stayed black in light mode (UAT
                  // SHELL-03, HA-06). antd's dark colorBgContainer IS #141414, so
                  // the dark theme renders identically; only light changes.
                  // ⭐⭐ RC5: a SELECTED theme now wins over the antd token, so
                  // picking a theme has a visible outcome (UAT THEME-01/THEME-03
                  // both Expect "the canvas visibly reflects it"). Before this,
                  // themeService.applyThemeToElement set ~30 CSS custom
                  // properties on this very element and NOTHING in src/ read a
                  // single one — `grep -rn "var(--" src/` returned 0. The picker
                  // worked; the pipeline dead-ended here.
                  // ⚠ SCOPE: the canvas SURFACE only. Card renderers stay on
                  // their own colours by design — per THE VISION a renderer that
                  // mimics HA is being faithful, and re-theming them would move
                  // the visual baselines RC4 deliberately kept still.
                  // ⚠ Both fall back to the RC4 token when no theme is selected,
                  // which is every snapshot run (currentTheme === null), so the
                  // 51 visual baselines cannot move.
                  background: canvasThemeBackground ?? token.colorBgContainer,
                  borderRadius: 8,
                  color: canvasThemeText ?? token.colorText,
                }}
              >
                {error && (
                  <Alert
                    message="Error Loading Dashboard"
                    description={error}
                    type="error"
                    closable
                    style={{ marginBottom: '16px' }}
                  />
                )}

                {!config && !error && (
                  <>
                    <h1 style={{ color: accentColor }}>Welcome to HA Visual Dashboard Maker</h1>
                    <p>Phase 4: Standard Card Support - In Progress</p>

                    <div style={{ marginTop: '24px' }}>
                      <Space size="large">
                        <Tooltip title="Create a new blank dashboard from scratch">
                          <Button
                            type="primary"
                            size="large"
                            icon={<FileAddOutlined />}
                            onClick={handleNewDashboard}
                          >
                            New Dashboard
                          </Button>
                        </Tooltip>
                        <Tooltip title="Open an existing dashboard YAML file from your computer">
                          {/* ⚠ testid, not the accessible name: every antd icon
                              renders role="img" aria-label="<icon>", so this
                              button's accessible name is "folder-open Open
                              Local File" and an anchored /^Open/ never matches. */}
                          <Button
                            size="large"
                            icon={<FolderOpenOutlined />}
                            onClick={handleOpenFile}
                            data-testid="welcome-open-local-file"
                          >
                            Open Local File
                          </Button>
                        </Tooltip>
                        <Tooltip
                          title={
                            isConnected
                              ? 'Browse Home Assistant dashboards and the built-in preset marketplace'
                              : 'Browse the built-in preset marketplace — connect to Home Assistant to also list its dashboards'
                          }
                        >
                          {/* ⭐ RC5: NOT gated on isConnected. This opens the
                              DashboardBrowser, whose Preset Marketplace tab is
                              entirely LOCAL (PRESET_MARKETPLACE_SEED). Gating it
                              made all four THEME UAT cards unrunnable. The HA
                              Dashboards tab inside degrades on its own with a
                              "Not Connected" alert. */}
                          <Button
                            size="large"
                            icon={<AppstoreOutlined />}
                            onClick={handleOpenDashboardBrowser}
                            data-testid="welcome-browse-dashboards"
                          >
                            Browse HA Dashboards
                          </Button>
                        </Tooltip>
                      </Space>
                    </div>

                    <div
                      style={{
                        marginTop: '32px',
                        color: token.colorTextSecondary,
                        fontSize: '14px',
                      }}
                    >
                      <p>
                        Create a new blank dashboard, open a local YAML file, or browse dashboards
                        from your Home Assistant instance.
                      </p>
                      <p style={{ marginTop: '8px' }}>Supported file types: .yaml, .yml</p>
                    </div>
                  </>
                )}

                {config && (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <div>
                        <h2 style={{ color: accentColor, margin: 0 }}>
                          {config.title || 'Dashboard'}
                          {isDirty && (
                            <span style={{ color: token.colorWarning, marginLeft: '8px' }}>*</span>
                          )}
                        </h2>
                        <p
                          style={{
                            color: token.colorTextSecondary,
                            fontSize: '12px',
                            margin: '4px 0 0 0',
                          }}
                        >
                          {filePath}
                        </p>
                      </div>
                      <Space wrap>
                        <Tooltip title="Create a new blank dashboard">
                          <Button icon={<FileAddOutlined />} onClick={handleNewDashboard}>
                            New
                          </Button>
                        </Tooltip>
                        <Tooltip title="Open an existing dashboard YAML file from your computer">
                          <Button
                            icon={<FolderOpenOutlined />}
                            onClick={handleOpenFile}
                            data-testid="toolbar-open-file"
                          >
                            Open
                          </Button>
                        </Tooltip>
                        <Tooltip
                          title={
                            isConnected
                              ? 'Download a dashboard from Home Assistant, or import a built-in preset'
                              : 'Import a built-in preset — connect to Home Assistant to also download its dashboards'
                          }
                        >
                          {/* ⭐ RC5: NOT gated on isConnected — same reason as the
                              welcome-screen button above. ⚠ Deploy below IS still
                              gated and must stay that way. */}
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={handleOpenDashboardBrowser}
                            data-testid="toolbar-download"
                          >
                            Download
                          </Button>
                        </Tooltip>
                        <Tooltip title="Edit dashboard YAML directly with syntax highlighting">
                          <Button icon={<CodeOutlined />} onClick={handleOpenYamlEditor}>
                            Edit YAML
                          </Button>
                        </Tooltip>
                        <Tooltip title="Toggle between Visual, Code, and Split view modes">
                          <Segmented
                            size="middle"
                            value={editorMode}
                            onChange={(value) => setEditorMode(value as EditorMode)}
                            options={[
                              { label: 'Visual', value: 'visual', icon: <AppstoreAddOutlined /> },
                              { label: 'Split', value: 'split', icon: <SplitCellsOutlined /> },
                            ]}
                          />
                        </Tooltip>
                        <Tooltip title="Save dashboard to local YAML file">
                          <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            disabled={!isDirty}
                          >
                            Save
                          </Button>
                        </Tooltip>
                        <Tooltip title="Deploy dashboard to your Home Assistant instance">
                          <Button
                            icon={<CloudUploadOutlined />}
                            onClick={handleOpenDeployDialog}
                            disabled={!isConnected}
                            data-testid="toolbar-deploy"
                          >
                            Deploy
                          </Button>
                        </Tooltip>
                        <Tooltip title="Remap missing entities">
                          <Button
                            icon={<SwapOutlined />}
                            onClick={handleManualRemapOpen}
                            data-testid="remap-open-manual"
                          >
                            Remap
                          </Button>
                        </Tooltip>
                        <Tooltip title="Preview dashboard live in Home Assistant with drag-and-drop editing">
                          <Button
                            type={livePreviewMode ? 'primary' : 'default'}
                            icon={<EyeOutlined />}
                            onClick={handleEnterLivePreview}
                            disabled={!isConnected || livePreviewMode}
                          >
                            Live Preview
                          </Button>
                        </Tooltip>
                      </Space>
                    </div>

                    <div style={{ height: 'calc(100vh - 250px)' }}>
                      {livePreviewMode && selectedViewIndex !== null ? (
                        <HADashboardIframe
                          config={config}
                          activeViewIndex={selectedViewIndex}
                          onActiveViewChange={setSelectedView}
                          haUrl={haUrl}
                          tempDashboardPath={tempDashboardPath}
                          deployTargetLabel={describeLiveDeployTarget(sourceDashboard)}
                          onLayoutChange={handleLayoutChange}
                          onDeploy={handleDeployFromLivePreview}
                          onClose={handleExitLivePreview}
                        />
                      ) : editorMode === 'split' ? (
                        <SplitViewEditor
                          selectedViewIndex={selectedViewIndex}
                          selectedCardIndex={selectedCardIndex}
                          selectedCardIndices={selectedCardIndices}
                          selectedSectionIndex={selectedSectionIndex}
                          onSectionCardMove={handleSectionCardMove}
                          onSectionCardResize={handleSectionCardResize}
                          onSectionAdd={handleSectionAdd}
                          onSectionRemove={handleSectionRemove}
                          onSectionMove={handleSectionMove}
                          onSectionTitleChange={handleSectionTitleChange}
                          onViewMaxColumnsChange={handleViewMaxColumnsChange}
                          onConvertToSections={handleConvertToSections}
                          onAddView={handleAddView}
                          onOpenViewSettings={handleOpenViewSettings}
                          onCardSelect={handleCardSelect}
                          onLayoutChange={handleLayoutChange}
                          onCardDrop={handleCardDrop}
                          onCardDropIntoContainer={handleCardDropIntoContainer}
                          onCardCut={handleCardCut}
                          onCardCopy={handleCardCopy}
                          onCardPaste={handleCardPaste}
                          onCardDelete={handleCardDelete}
                          canPaste={clipboard.cards !== null}
                          onOpenEntityBrowser={handleOpenEntityBrowser}
                        />
                      ) : (
                        <Tabs
                          activeKey={selectedViewIndex?.toString() || '0'}
                          onChange={(key) => setSelectedView(parseInt(key))}
                          tabBarExtraContent={{
                            right: (
                              <Space size="small">
                                <Tooltip title="Add a new view to this dashboard">
                                  <Button
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddView}
                                    data-testid="view-add-button"
                                  >
                                    Add view
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Edit this view's title, path, type and layout">
                                  <Button
                                    size="small"
                                    icon={<SettingOutlined />}
                                    onClick={handleOpenViewSettings}
                                    disabled={selectedViewIndex === null}
                                    data-testid="view-settings-button"
                                  >
                                    Edit view
                                  </Button>
                                </Tooltip>
                              </Space>
                            ),
                          }}
                          items={config.views.map((view, index) => ({
                            key: index.toString(),
                            label: view.title || view.path || `View ${index + 1}`,
                            children: (
                              <div style={{ height: 'calc(100vh - 310px)' }}>
                                <GridCanvas
                                  view={view}
                                  selectedCardIndex={selectedCardIndex}
                                  selectedCardIndices={selectedCardIndices}
                                  selectedSectionIndex={selectedSectionIndex}
                                  onCardSelect={handleCardSelect}
                                  onLayoutChange={handleLayoutChange}
                                  onCardDrop={handleCardDrop}
                                  onCardDropIntoContainer={handleCardDropIntoContainer}
                                  onCardCut={handleCardCut}
                                  onCardCopy={handleCardCopy}
                                  onCardPaste={handleCardPaste}
                                  onCardDelete={handleCardDelete}
                                  onSectionCardMove={handleSectionCardMove}
                                  onSectionCardResize={handleSectionCardResize}
                                  onSectionAdd={handleSectionAdd}
                                  onSectionRemove={handleSectionRemove}
                                  onSectionMove={handleSectionMove}
                                  onSectionTitleChange={handleSectionTitleChange}
                                  onViewMaxColumnsChange={handleViewMaxColumnsChange}
                                  onConvertToSections={handleConvertToSections}
                                  canPaste={clipboard.cards !== null}
                                />
                              </div>
                            ),
                          }))}
                          style={{ height: '100%' }}
                        />
                      )}
                    </div>
                  </>
                )}
              </Content>
            </Layout>
            <Sider
              width={450}
              theme="dark"
              style={{ overflow: 'auto', height: 'calc(100vh - 64px)' }}
            >
              <PropertiesPanel
                card={
                  config && selectedViewIndex !== null && selectedCardIndex !== null
                    ? resolveViewCards(config.views[selectedViewIndex], selectedSectionIndex)[
                        selectedCardIndex
                      ] || null
                    : null
                }
                cardIndex={selectedCardIndex}
                historyNavigationVersion={historyNavigationVersion}
                onChange={handleCardUpdate}
                onCommit={handleCardCommit}
                onCancel={handlePropertiesCancel}
                onOpenEntityBrowser={handleOpenEntityBrowser}
              />
              {/* ⭐ RC5: gated on a SELECTED THEME, not on isConnected — a
                  built-in theme previews perfectly well offline.
                  ⚠ It must NOT render unconditionally: its no-theme branch is an
                  antd <Empty>, and rendering that permanently put a second
                  `.ant-empty` in the DOM, breaking three integration tests that
                  locate `.ant-empty` globally (entity-browser.spec.ts:295,
                  entity-caching.spec.ts:72 and :348) with a strict-mode
                  violation. Showing an empty "Theme Preview" card forever was
                  also just clutter. */}
              {currentTheme && <ThemePreviewPanel />}
            </Sider>
          </Layout>
        </Layout>
        <SettingsDialog
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          activeTab={settingsTab}
          onTabChange={setSettingsTab}
          onVerboseChange={setVerboseUIDebug}
          onConnect={handleConnect}
        />
        <DeployDialog
          visible={deployDialogVisible}
          onClose={handleCloseDeployDialog}
          dashboardConfig={deployReport?.config ?? null}
          dashboardTitle={config?.title}
          warnings={deployReport?.warnings}
        />
        <DashboardBrowser
          visible={dashboardBrowserVisible}
          onClose={handleCloseDashboardBrowser}
          onDashboardDownload={handleDashboardDownload}
        />
        <YamlEditorDialog
          visible={yamlEditorVisible}
          dashboardYaml={config ? yamlService.serializeDashboard(config) : ''}
          onClose={handleCloseYamlEditor}
          onApply={handleApplyYamlChanges}
          onOpenEntityBrowser={handleOpenEntityBrowser}
        />
        <EntityBrowser
          visible={entityBrowserVisible}
          onClose={() => {
            setEntityBrowserVisible(false);
            setEntityInsertCallback(null);
          }}
          onSelect={handleEntitySelected}
          isConnected={isConnected}
          onRefresh={fetchAndCacheEntities}
        />
        <NewDashboardDialog
          visible={newDashboardDialogVisible}
          onClose={() => setNewDashboardDialogVisible(false)}
          onCreateBlank={createNewDashboard}
          onCreateSections={createNewSectionsDashboard}
          onCreateFromTemplate={handleCreateFromTemplate}
          onCreateFromEntityType={handleCreateFromEntityType}
          isConnected={isConnected}
        />
        {/* Mounted only while open (slice 4.7b). `destroyOnHidden` destroys the
            Modal's DOM but NOT this component, so the antd form instance created
            by `Form.useForm()` inside it survived every close — and a field
            re-registering on the next open reads the retained store value in
            preference to `initialValues`. The dialog therefore reopened showing
            whatever was typed the FIRST time it was opened, and saving again
            wrote those stale values back over the user's edit. Mounting per open
            gives a fresh form instance and is the root-cause fix. */}
        {viewSettingsOpen && (
          <ViewSettingsDialog
            open={viewSettingsOpen}
            view={
              config && selectedViewIndex !== null
                ? (config.views[selectedViewIndex] ?? null)
                : null
            }
            viewIndex={selectedViewIndex}
            viewCount={config?.views.length ?? 0}
            onClose={() => setViewSettingsOpen(false)}
            onSubmit={handleViewSettingsSave}
            onDelete={handleRemoveView}
            onMove={handleMoveView}
          />
        )}
        {/* WS3 slice E. Same mount-only-while-open rule as ViewSettingsDialog
            above: this dialog holds per-open state (repo, branch, status, diff)
            and `destroyOnHidden` alone would keep the component — and that
            state — alive across closes. */}
        {versionControlOpen && (
          <VersionControlDialog
            open={versionControlOpen}
            onClose={() => setVersionControlOpen(false)}
            currentFilePath={filePath}
          />
        )}
        <EntityRemappingModal
          visible={remapModalVisible}
          missingEntities={missingEntities}
          availableEntities={availableEntities}
          dashboardConfig={config}
          onClose={() => {
            setRemapModalVisible(false);
          }}
          onApply={(updatedConfig, mappings) => {
            if (isTestEnv() && typeof window !== 'undefined') {
              const testWindow = window as Window & { __remapDebug?: Record<string, unknown> };
              const existing =
                testWindow.__remapDebug && typeof testWindow.__remapDebug === 'object'
                  ? (testWindow.__remapDebug as Record<string, unknown>)
                  : {};
              testWindow.__remapDebug = { ...existing, remapOnApplyInvoked: true };
            }
            setRemapModalVisible(false);
            updateConfig(updatedConfig);
            if (selectedViewIndex !== null && selectedCardIndex !== null) {
              const viewIndex = selectedViewIndex;
              const cardIndex = selectedCardIndex;
              setSelectedCard(viewIndex, null);
              setTimeout(() => setSelectedCard(viewIndex, cardIndex), 0);
            }
            message.success(
              `Mapped ${mappings.length} entit${mappings.length === 1 ? 'y' : 'ies'}`,
            );
          }}
        />
        {verboseUIDebug && (
          <div
            data-testid="verbose-ui-overlay"
            style={{
              position: 'fixed',
              bottom: 8,
              right: 8,
              zIndex: 2000,
              background: token.colorBgElevated,
              color: token.colorText,
              padding: '8px 12px',
              border: '1px solid #434343',
              borderRadius: 4,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <div>
              <strong>Verbose UI Debug</strong>
            </div>
            <div>Status: {isConnected ? 'Connected' : 'Offline'}</div>
            <div>File: {filePath || 'Untitled'}</div>
          </div>
        )}
        {isTestEnv() && (
          <div
            data-testid="remap-debug-state"
            data-visible={remapModalVisible ? '1' : '0'}
            data-missing-count={missingEntities.length}
            data-available-count={availableEntities.length}
            data-auto-remap-pending={autoRemapPending ? '1' : '0'}
            style={{ display: 'none' }}
          />
        )}
        {isTestEnv() && (
          <div
            data-testid="selection-debug-state"
            data-selected-view={selectedViewIndex === null ? 'null' : String(selectedViewIndex)}
            data-selected-section={
              selectedSectionIndex === null ? 'null' : String(selectedSectionIndex)
            }
            data-selected-card={selectedCardIndex === null ? 'null' : String(selectedCardIndex)}
            data-selected-cards={selectedCardIndices.join(',')}
            data-selected-cards-count={String(selectedCardIndices.length)}
            data-selected-card-type={
              selectedViewIndex !== null && selectedCardIndex !== null
                ? (config?.views?.[selectedViewIndex]?.cards?.[selectedCardIndex]?.type ??
                  'unknown')
                : 'none'
            }
            data-selected-card-count={
              selectedViewIndex !== null
                ? String(config?.views?.[selectedViewIndex]?.cards?.length ?? 0)
                : '0'
            }
            style={{ display: 'none' }}
          />
        )}
        {isTestEnv() && (
          <div
            data-testid="history-debug-state"
            data-past-length={String(past.length)}
            data-future-length={String(future.length)}
            data-can-undo={canUndo() ? '1' : '0'}
            data-can-redo={canRedo() ? '1' : '0'}
            style={{ display: 'none' }}
          />
        )}
        <PopupHost />
      </HAEntityProvider>
    </ConfigProvider>
  );
};

export default App;
