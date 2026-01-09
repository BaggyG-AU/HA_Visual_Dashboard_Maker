import React, { useState, useEffect, useRef } from 'react';
import { ConfigProvider, Layout, theme, Button, Space, message, Modal, Alert, Tabs, Badge, Tooltip, Segmented } from 'antd';
import { FolderOpenOutlined, SaveOutlined, ApiOutlined, CloudUploadOutlined, AppstoreOutlined, DownloadOutlined, EyeOutlined, FileAddOutlined, CodeOutlined, UndoOutlined, RedoOutlined, DatabaseOutlined, SplitCellsOutlined, AppstoreAddOutlined, SettingOutlined } from '@ant-design/icons';
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
import { SplitViewEditor } from './components/SplitViewEditor';
import { cardRegistry } from './services/cardRegistry';
import { haConnectionService } from './services/haConnectionService';
import { isLayoutCardGrid, convertGridLayoutToViewLayout } from './utils/layoutCardParser';
import { HAEntityProvider } from './contexts/HAEntityContext';
import { ThemeSelector } from './components/ThemeSelector';
import { SettingsDialog } from './components/SettingsDialog';
import { ThemePreviewPanel } from './components/ThemePreviewPanel';
import { NewDashboardDialog } from './components/NewDashboardDialog';
import { useThemeStore } from './store/themeStore';
import { themeService } from './services/themeService';
import { useEditorModeStore, EditorMode } from './store/editorModeStore';
import { logger } from './services/logger';
import { setHapticSettings } from './services/hapticService';
import type { Card } from './types/dashboard';
import type { LoggingLevel } from './services/settingsService';

const { Header, Content, Sider } = Layout;
type CardWithInternalLayout = Card & {
  layout?: { x: number; y: number; w: number; h: number };
};

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

const isTestEnv =
  (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.E2E === '1')) ||
  (typeof window !== 'undefined' && Boolean((window as unknown as { E2E?: boolean }).E2E));

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [ignoreNextLayoutChange, setIgnoreNextLayoutChange] = useState<boolean>(false);
  const [deployDialogVisible, setDeployDialogVisible] = useState<boolean>(false);
  const [dashboardBrowserVisible, setDashboardBrowserVisible] = useState<boolean>(false);
  const [yamlEditorVisible, setYamlEditorVisible] = useState<boolean>(false);
  const [entityBrowserVisible, setEntityBrowserVisible] = useState<boolean>(false);
  const [entityInsertCallback, setEntityInsertCallback] = useState<((entityId: string) => void) | null>(null);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'appearance' | 'connection' | 'diagnostics'>('appearance');
  const [verboseUIDebug, setVerboseUIDebug] = useState<boolean>(false);
  const [newDashboardDialogVisible, setNewDashboardDialogVisible] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [livePreviewMode, setLivePreviewMode] = useState<boolean>(false);
  const [tempDashboardPath, setTempDashboardPath] = useState<string | null>(null);
  const [haUrl, setHaUrl] = useState<string>('');

  // Clipboard state for cut/copy/paste operations
  const [clipboard, setClipboard] = useState<{
    card: CardWithInternalLayout | null;
    isCut: boolean;
    sourceViewIndex: number | null;
    sourceCardIndex: number | null;
  }>({ card: null, isCut: false, sourceViewIndex: null, sourceCardIndex: null });

  // Dashboard store
  const {
    config,
    filePath,
    error,
    isDirty,
    selectedViewIndex,
    selectedCardIndex,
    loadDashboard,
    updateConfig,
    beginBatchUpdate,
    applyBatchedConfig,
    endBatchUpdate,
    markClean,
    setSelectedView,
    setSelectedCard,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDashboardStore();

  // Theme store
  const {
    currentTheme,
    darkMode,
    setAvailableThemes
  } = useThemeStore();

  // Editor mode store
  const {
    mode: editorMode,
    setMode: setEditorMode,
  } = useEditorModeStore();

  // Ref for canvas container to apply theme
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Apply theme to canvas when theme or mode changes
  useEffect(() => {
    if (canvasContainerRef.current && currentTheme) {
      themeService.applyThemeToElement(
        canvasContainerRef.current,
        currentTheme,
        darkMode
      );
      console.log('Applied theme to canvas container');
    }

    return () => {
      if (canvasContainerRef.current) {
        themeService.clearThemeFromElement(canvasContainerRef.current);
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

        console.log('Loaded theme preferences:', darkModeResult, syncResult);
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
      }
    };

    loadThemePreferences();
  }, []);

  // Expose lightweight test hooks for Playwright to inject themes/connection state
  useEffect(() => {
    if (isTestEnv) {
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
            themes: (themesData?.themes ?? {}) as Record<string, unknown>,
            darkMode:
              typeof themesData?.darkMode === 'boolean'
                ? themesData.darkMode
            : true,
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
        console.log('Themes updated from Home Assistant');
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

        if (error) {
          message.error(`Failed to parse dashboard: ${error}`);
        } else {
          message.success(`Dashboard loaded: ${result.filePath}`);
          // Add to recent files
          await window.electronAPI.addRecentFile(result.filePath);
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

        if (error) {
          message.error(`Failed to parse dashboard: ${error}`);
        } else {
          message.success(`Dashboard loaded: ${filePath}`);
          // Add to recent files (moves it to top)
          await window.electronAPI.addRecentFile(filePath);
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
          console.log('Created backup:', backupResult.backupPath);
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

  const handleShowAbout = () => {
    Modal.info({
      title: 'About HA Visual Dashboard Maker',
      content: (
        <div>
          <p><strong>Version:</strong> 0.1.0</p>
          <p><strong>Author:</strong> BaggyG-AU</p>
          <p>A visual WYSIWYG editor for Home Assistant dashboards with support for custom cards.</p>
          <p style={{ marginTop: '16px' }}>
            <a href="https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker"
               onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal?.('https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker'); }}>
              View on GitHub
            </a>
          </p>
        </div>
      ),
      okText: 'Close'
    });
  };

  const handleCardSelect = (cardIndex: number) => {
    if (selectedViewIndex !== null) {
      setSelectedCard(selectedViewIndex, cardIndex);
    }
  };

  const handleLayoutChange = (layout: GridLayoutType[]) => {
    if (!config || selectedViewIndex === null) return;

    console.log('=== LAYOUT CHANGE ===');
    console.log('Live Preview Mode:', livePreviewMode);
    console.log('New layout from grid:', layout);
    console.log('ignoreNextLayoutChange:', ignoreNextLayoutChange);

    // Skip this layout change if we just added a card
    if (ignoreNextLayoutChange) {
      console.log('IGNORING layout change (just added a card)');
      setIgnoreNextLayoutChange(false);
      return;
    }

    // Update the layout information in the config
    const updatedViews = [...config.views];
    const currentView = updatedViews[selectedViewIndex];

    // Check if using layout-card grid system
    const usingLayoutCard = isLayoutCardGrid(currentView);

    if (currentView.cards) {
      if (usingLayoutCard) {
        // Convert to view_layout format
        const viewLayouts = convertGridLayoutToViewLayout(layout, 12);

        currentView.cards = currentView.cards.map((card, index) => {
          const viewLayout = viewLayouts[index];
          if (viewLayout) {
            // Remove internal layout property and add view_layout
          const { layout: _layout, ...cardWithoutLayout } = card as unknown as Record<string, unknown> & { layout?: unknown };
          void _layout;
            return {
              ...(cardWithoutLayout as Record<string, unknown>),
              view_layout: {
                grid_column: viewLayout.grid_column,
                grid_row: viewLayout.grid_row,
              },
            };
          }
          return card;
        });
        console.log('Updated cards with view_layout:', currentView.cards);
      } else {
        // Use internal layout property
        currentView.cards = currentView.cards.map((card, index) => {
          const layoutItem = layout.find((item) => item.i === `card-${index}`);
          if (layoutItem) {
            return {
              ...card,
              layout: {
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              },
            } as CardWithInternalLayout;
          }
          return card;
        });
        console.log('Updated cards with internal layout:', currentView.cards);
      }
    }

    updatedViews[selectedViewIndex] = currentView;
    updateConfig({ ...config, views: updatedViews });
  };

  const handleCardAdd = (cardType: string, gridX = 0, gridY = 0) => {
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

    console.log('=== ADDING CARD ===');
    console.log('Card type:', cardType);
    console.log('Drop position:', { gridX, gridY });

    // Create new card with default properties
    const newCard: CardWithInternalLayout = {
      type: cardType,
      ...(cardMetadata.defaultProps as Record<string, unknown>),
      layout: {
        x: gridX,
        y: gridY,
        w: 6,
        h: 4,
      },
    };

    console.log('New card object:', newCard);

    // Add title for certain card types
    if (['entities', 'glance'].includes(cardType)) {
      newCard.title = `New ${cardMetadata.name}`;
    }

    // Update the config
    const updatedViews = [...config.views];
    const currentView = updatedViews[selectedViewIndex];

    if (!currentView.cards) {
      currentView.cards = [];
    }

    currentView.cards.push(newCard);
    updatedViews[selectedViewIndex] = currentView;

    console.log('Updated cards array:', currentView.cards);

    // Set flag to ignore the next layout change event
    setIgnoreNextLayoutChange(true);

    updateConfig({ ...config, views: updatedViews });

    // Select the newly added card
    setSelectedCard(selectedViewIndex, currentView.cards.length - 1);

    message.success(`Added ${cardMetadata.name} card at (${gridX}, ${gridY})`);
  };

  const handleCardDrop = (cardType: string, x: number, y: number) => {
    handleCardAdd(cardType, x, y);
  };

  const handleCardUpdate = (updatedCard: Card) => {
    if (!config || selectedViewIndex === null || selectedCardIndex === null) return;
    beginBatchUpdate();

    console.log('=== UPDATING CARD ===');
    console.log('Updated card:', updatedCard);

    const updatedViews = [...config.views];
    const currentView = updatedViews[selectedViewIndex];

    if (currentView.cards && currentView.cards[selectedCardIndex]) {
      // Preserve layout information
      const existingLayout = currentView.cards[selectedCardIndex].layout;
      currentView.cards[selectedCardIndex] = {
        ...updatedCard,
        layout: existingLayout,
      };

      updatedViews[selectedViewIndex] = currentView;
      applyBatchedConfig({ ...config, views: updatedViews });
    }
  };

  const handleCardCommit = (updatedCard: Card) => {
    if (!config || selectedViewIndex === null || selectedCardIndex === null) return;

    const updatedViews = [...config.views];
    const currentView = updatedViews[selectedViewIndex];

    if (currentView.cards && currentView.cards[selectedCardIndex]) {
      const existingLayout = currentView.cards[selectedCardIndex].layout;
      currentView.cards[selectedCardIndex] = {
        ...updatedCard,
        layout: existingLayout,
      };

      updatedViews[selectedViewIndex] = currentView;
      applyBatchedConfig({ ...config, views: updatedViews });
      endBatchUpdate();

      message.success({ content: 'Card updated', key: 'card-updated', duration: 1.5 });
    }
  };

  const handlePropertiesCancel = () => {
    endBatchUpdate();
    // Deselect card
    if (selectedViewIndex !== null) {
      setSelectedCard(selectedViewIndex, null);
    }
  };

  // Clipboard operations
  const handleCardCut = () => {
    if (!config || selectedViewIndex === null || selectedCardIndex === null) {
      message.warning('No card selected');
      return;
    }

    const currentView = config.views[selectedViewIndex];
    if (!currentView.cards || !currentView.cards[selectedCardIndex]) {
      return;
    }

    const cardToCut = currentView.cards[selectedCardIndex];
    setClipboard({
      card: { ...cardToCut },
      isCut: true,
      sourceViewIndex: selectedViewIndex,
      sourceCardIndex: selectedCardIndex,
    });

    message.info('Card cut to clipboard');
  };

  const handleCardCopy = () => {
    if (!config || selectedViewIndex === null || selectedCardIndex === null) {
      message.warning('No card selected');
      return;
    }

    const currentView = config.views[selectedViewIndex];
    if (!currentView.cards || !currentView.cards[selectedCardIndex]) {
      return;
    }

    const cardToCopy = currentView.cards[selectedCardIndex];
    setClipboard({
      card: { ...cardToCopy },
      isCut: false,
      sourceViewIndex: selectedViewIndex,
      sourceCardIndex: selectedCardIndex,
    });

    message.info('Card copied to clipboard');
  };

  const handleCardPaste = () => {
    if (!clipboard.card) {
      message.warning('Clipboard is empty');
      return;
    }

    if (!config || selectedViewIndex === null) {
      message.warning('Please select a view first');
      return;
    }

    const updatedViews = [...config.views];
    const currentView = updatedViews[selectedViewIndex];

    if (!currentView.cards) {
      currentView.cards = [];
    }

    // Create new card from clipboard (remove old layout, will get new position)
    const { layout: _layout, ...cardWithoutLayout } = clipboard.card;
    void _layout;
    const pastedCard = {
      ...cardWithoutLayout,
      layout: {
        x: 0,
        y: Infinity, // Place at bottom
        w: clipboard.card.layout?.w || 6,
        h: clipboard.card.layout?.h || 4,
      },
    };

    // If it was a cut operation, remove the source card
    if (clipboard.isCut && clipboard.sourceViewIndex !== null && clipboard.sourceCardIndex !== null) {
      const sourceView = updatedViews[clipboard.sourceViewIndex];
      if (sourceView.cards) {
        sourceView.cards.splice(clipboard.sourceCardIndex, 1);
        updatedViews[clipboard.sourceViewIndex] = sourceView;
      }
    }

    // Add pasted card to current view
    currentView.cards.push(pastedCard);
    updatedViews[selectedViewIndex] = currentView;

    updateConfig({ ...config, views: updatedViews });

    // Clear clipboard if it was a cut operation
    if (clipboard.isCut) {
      setClipboard({ card: null, isCut: false, sourceViewIndex: null, sourceCardIndex: null });
      message.success('Card moved');
    } else {
      message.success('Card pasted');
    }

    // Select the newly pasted card
    setSelectedCard(selectedViewIndex, currentView.cards.length - 1);
  };

  const handleCardDelete = () => {
    if (!config || selectedViewIndex === null || selectedCardIndex === null) {
      message.warning('No card selected');
      return;
    }

    const updatedViews = [...config.views];
    const currentView = updatedViews[selectedViewIndex];

    if (!currentView.cards || !currentView.cards[selectedCardIndex]) {
      return;
    }

    // Remove the card
    currentView.cards.splice(selectedCardIndex, 1);
    updatedViews[selectedViewIndex] = currentView;

    updateConfig({ ...config, views: updatedViews });

    // Deselect card
    setSelectedCard(selectedViewIndex, null);

    message.success('Card deleted');
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

      // Fetch themes in the background
      fetchThemes();
    } catch (error) {
      message.error(`Failed to connect: ${(error as Error).message}`);
      throw error;
    }
  };

  const fetchAndCacheEntities = async () => {
    try {
      console.log('Fetching entities from Home Assistant...');
      const result = await window.electronAPI.haWsFetchEntities();
      if (result.success) {
        console.log(`Cached ${result.entities?.length || 0} entities`);
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error);
      // Don't show error to user - this is a background operation
    }
  };

  const fetchThemes = async () => {
    if (!isConnected) return;

    try {
      console.log('Fetching themes from Home Assistant...');
      const result = await window.electronAPI.haWsGetThemes();
      if (result.success && result.themes) {
        setAvailableThemes(result.themes);
        console.log(`Loaded ${Object.keys(result.themes.themes || {}).length} themes from HA`);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
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
    // Disable Ant motion in automated tests to avoid hidden/animating portals
    if (isTestEnv) {
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
    if (!isConnected) {
      message.warning('Please connect to Home Assistant first');
      return;
    }
    setDashboardBrowserVisible(true);
  };

  const handleCloseDashboardBrowser = () => {
    setDashboardBrowserVisible(false);
  };

  const handleDashboardDownload = (dashboardYaml: string, dashboardTitle: string, dashboardId: string) => {
    // Load the downloaded dashboard into the editor
    loadDashboard(dashboardYaml, `${dashboardTitle} (${dashboardId})`);
    message.success(`Dashboard "${dashboardTitle}" loaded successfully!`);
  };

  const handleNewDashboard = () => {
    // Check if there are unsaved changes
    if (isDirty && config) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Do you want to create a new dashboard anyway? Your current changes will be lost.',
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
          type: 'custom:grid-layout',
          layout: {
            grid_template_columns: 'repeat(12, 1fr)',
            grid_template_rows: 'repeat(auto-fill, 56px)',
            grid_gap: '8px',
          },
          cards: [],
        },
      ],
    };

    const yamlContent = yamlService.serializeDashboard(blankDashboard);
    loadDashboard(yamlContent, null); // null filePath means it's unsaved
    message.success('New blank dashboard created!');
  };

  const handleCreateFromTemplate = () => {
    // TODO: Implement template selection dialog
    message.info('Template selection coming soon! For now, creating a blank dashboard.');
    createNewDashboard();
  };

  const handleCreateFromEntityType = (dashboardYaml: string, title: string) => {
    loadDashboard(dashboardYaml, null); // null filePath means it's unsaved

    // Parse to get card count for success message
    const result = yamlService.parseDashboard(dashboardYaml);
    const cardCount = result.success && result.data?.views[0]?.cards?.length || 0;

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

    // The dashboard will be marked as dirty since it was modified
    if (error) {
      message.error(`Failed to apply YAML changes: ${error}`);
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

      // Debug: Log current config to see if layout is preserved
      console.log('=== ENTERING LIVE PREVIEW ===');
      console.log('Current config before creating temp dashboard:', JSON.stringify(config, null, 2));

      // Create temporary dashboard in HA via IPC
      const result = await window.electronAPI.haWsCreateTempDashboard(config);
      if (!result.success || !result.tempPath) {
        throw new Error(result.error || 'Failed to create temp dashboard');
      }

      setTempDashboardPath(result.tempPath);
      setLivePreviewMode(true);

      message.success({ content: 'Live preview mode activated!', key: 'livepreview', duration: 2 });
    } catch (error) {
      message.error({ content: `Failed to create temp dashboard: ${(error as Error).message}`, key: 'livepreview' });
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
        console.error('Failed to delete temp dashboard:', error);
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

    try {
      message.loading({ content: 'Deploying to production...', key: 'deploy' });

      // Deploy temp dashboard to production via IPC (null for default dashboard)
      const result = await window.electronAPI.haWsDeployDashboard(tempDashboardPath, null);

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
        console.error('Failed to load theme preference:', error);
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
          console.log(`Auto-reconnecting to: ${name} (${url})`);

          haConnectionService.setConfig({ url, token });

          // Also connect WebSocket for live preview functionality (via IPC)
          try {
            const wsResult = await window.electronAPI.haWsConnect(url, token);
            if (wsResult.success) {
              setHaUrl(url);
              setIsConnected(true);
              console.log('Successfully restored HA connection from saved credentials');

              // Fetch and cache entities on startup (with small delay to ensure WS is stable)
              setTimeout(async () => {
                try {
                  await fetchAndCacheEntities();
                  console.log('Entity cache updated on startup');
                  await fetchThemes();
                  console.log('Themes loaded on startup');
                } catch (err) {
                  console.error('Failed to fetch entities on startup:', err);
                }
              }, 500);
            } else {
              console.error('Failed to reconnect WebSocket:', wsResult.error);
            }
          } catch (wsError) {
            console.error('Failed to reconnect WebSocket:', wsError);
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
                console.log('Restored HA connection from old settings:', saved.url);

                // Fetch and cache entities on startup (with small delay to ensure WS is stable)
                setTimeout(async () => {
                  try {
                    await fetchAndCacheEntities();
                    console.log('Entity cache updated on startup');
                    await fetchThemes();
                    console.log('Themes loaded on startup');
                  } catch (err) {
                    console.error('Failed to fetch entities on startup:', err);
                  }
                }, 500);
              } else {
                console.error('Failed to reconnect WebSocket:', wsResult.error);
              }
            } catch (wsError) {
              console.error('Failed to reconnect WebSocket:', wsError);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load HA connection:', error);
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
        console.error('Failed to load verbose UI flag', error);
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
        console.error('Failed to load logging level', error);
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
        console.error('Failed to load haptic settings', error);
      }
    };
    loadHaptics();
  }, []);

  // Set up menu event listeners
  useEffect(() => {
    const handleMenuOpenFile = () => handleOpenFile();
    const handleMenuSave = () => handleSave();
    const handleMenuSaveFileAs = () => handleSaveFile();
    const handleMenuToggleTheme = () => handleToggleTheme();
    const handleMenuShowAbout = () => handleShowAbout();
    const handleMenuOpenRecentFile = (filePath: string) => handleOpenRecentFile(filePath);

    const unsubOpenFile = window.electronAPI.onMenuOpenFile(handleMenuOpenFile);
    const unsubSaveFile = window.electronAPI.onMenuSaveFile(handleMenuSave);
    const unsubSaveFileAs = window.electronAPI.onMenuSaveFileAs(handleMenuSaveFileAs);
    const unsubToggleTheme = window.electronAPI.onMenuToggleTheme(handleMenuToggleTheme);
    const unsubShowAbout = window.electronAPI.onMenuShowAbout(handleMenuShowAbout);
    const unsubOpenRecentFile = window.electronAPI.onMenuOpenRecentFile(handleMenuOpenRecentFile);

    // Cleanup listeners when component unmounts
    return () => {
      unsubOpenFile();
      unsubSaveFile();
      unsubSaveFileAs();
      unsubToggleTheme();
      unsubShowAbout();
      unsubOpenRecentFile();
    };
  }, []);

  // Keyboard shortcuts for card operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when a card is selected and not in an input field
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInputField) {
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
          undo();
          message.info('Undo');
        }
      }
      // Ctrl+Y or Ctrl+Shift+Z: Redo
      else if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
        event.preventDefault();
        if (canRedo()) {
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
  }, [selectedViewIndex, selectedCardIndex, clipboard, config, handleSave, undo, redo, canUndo, canRedo]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <HAEntityProvider enabled={isConnected}>
      <Layout
        data-testid="app-shell"
        className="app-container"
        style={{ height: '100vh' }}
      >
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
              HA Visual Dashboard Maker
            </div>
            <Space>
              <Tooltip title="Undo last action (Ctrl+Z)">
                <Button
                  size="small"
                  icon={<UndoOutlined />}
                  onClick={() => {
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
            {isConnected && (
              <ThemeSelector
                onRefreshThemes={fetchThemes}
              />
            )}
            <Badge status={isConnected ? 'success' : 'default'} text={isConnected ? 'Connected' : 'Not Connected'} style={{ color: '#888' }} />
            {isConnected ? (
              <Button size="small" onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button type="primary" size="small" icon={<ApiOutlined />} onClick={handleOpenConnectionDialog}>
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
          <Sider width={280} theme="dark" style={{ height: '100vh', overflow: 'hidden' }}>
            <CardPalette onCardAdd={handleCardAdd} />
          </Sider>
          <Layout style={{ padding: '24px' }}>
            <Content
              ref={canvasContainerRef}
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                background: '#141414',
                borderRadius: 8,
                color: 'white',
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
                  <h1 style={{ color: '#00d9ff' }}>Welcome to HA Visual Dashboard Maker</h1>
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
                        <Button
                          size="large"
                          icon={<FolderOpenOutlined />}
                          onClick={handleOpenFile}
                        >
                          Open Local File
                        </Button>
                      </Tooltip>
                      <Tooltip title={isConnected ? "Browse and download dashboards from Home Assistant" : "Connect to Home Assistant to browse dashboards"}>
                        <Button
                          size="large"
                          icon={<AppstoreOutlined />}
                          onClick={handleOpenDashboardBrowser}
                          disabled={!isConnected}
                        >
                          Browse HA Dashboards
                        </Button>
                      </Tooltip>
                    </Space>
                  </div>

                  <div style={{ marginTop: '32px', color: '#888', fontSize: '14px' }}>
                    <p>Create a new blank dashboard, open a local YAML file, or browse dashboards from your Home Assistant instance.</p>
                    <p style={{ marginTop: '8px' }}>Supported file types: .yaml, .yml</p>
                  </div>
                </>
              )}

              {config && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ color: '#00d9ff', margin: 0 }}>
                        {config.title || 'Dashboard'}
                        {isDirty && <span style={{ color: '#ff9800', marginLeft: '8px' }}>*</span>}
                      </h2>
                      <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 0' }}>
                        {filePath}
                      </p>
                    </div>
                    <Space wrap>
                      <Tooltip title="Create a new blank dashboard">
                        <Button
                          icon={<FileAddOutlined />}
                          onClick={handleNewDashboard}
                        >
                          New
                        </Button>
                      </Tooltip>
                      <Tooltip title="Open an existing dashboard YAML file from your computer">
                        <Button
                          icon={<FolderOpenOutlined />}
                          onClick={handleOpenFile}
                        >
                          Open
                        </Button>
                      </Tooltip>
                      <Tooltip title="Download a dashboard from your Home Assistant instance">
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={handleOpenDashboardBrowser}
                          disabled={!isConnected}
                        >
                          Download
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit dashboard YAML directly with syntax highlighting">
                        <Button
                          icon={<CodeOutlined />}
                          onClick={handleOpenYamlEditor}
                        >
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
                        >
                          Deploy
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
                        view={config.views[selectedViewIndex]}
                        haUrl={haUrl}
                        tempDashboardPath={tempDashboardPath}
                        onLayoutChange={handleLayoutChange}
                        onDeploy={handleDeployFromLivePreview}
                        onClose={handleExitLivePreview}
                      />
                    ) : editorMode === 'split' ? (
                      <SplitViewEditor
                        selectedViewIndex={selectedViewIndex}
                        selectedCardIndex={selectedCardIndex}
                        onCardSelect={handleCardSelect}
                        onLayoutChange={handleLayoutChange}
                        onCardDrop={handleCardDrop}
                        onCardCut={handleCardCut}
                        onCardCopy={handleCardCopy}
                        onCardPaste={handleCardPaste}
                        onCardDelete={handleCardDelete}
                        canPaste={clipboard.card !== null}
                      />
                    ) : (
                    <Tabs
                      activeKey={selectedViewIndex?.toString() || '0'}
                      onChange={(key) => setSelectedView(parseInt(key))}
                      items={config.views.map((view, index) => ({
                        key: index.toString(),
                        label: view.title || view.path || `View ${index + 1}`,
                        children: (
                          <div style={{ height: 'calc(100vh - 310px)' }}>
                            <GridCanvas
                              view={view}
                              selectedCardIndex={selectedCardIndex}
                              onCardSelect={handleCardSelect}
                              onLayoutChange={handleLayoutChange}
                              onCardDrop={handleCardDrop}
                              onCardCut={handleCardCut}
                              onCardCopy={handleCardCopy}
                              onCardPaste={handleCardPaste}
                              onCardDelete={handleCardDelete}
                              canPaste={clipboard.card !== null}
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
          <Sider width={450} theme="dark" style={{ overflow: 'auto', height: 'calc(100vh - 64px)' }}>
            <PropertiesPanel
              card={
                config && selectedViewIndex !== null && selectedCardIndex !== null
                  ? config.views[selectedViewIndex]?.cards?.[selectedCardIndex] || null
                  : null
              }
              cardIndex={selectedCardIndex}
              onChange={handleCardUpdate}
              onCommit={handleCardCommit}
              onCancel={handlePropertiesCancel}
              onOpenEntityBrowser={handleOpenEntityBrowser}
            />
            {isConnected && <ThemePreviewPanel />}
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
        dashboardYaml={config ? yamlService.serializeForHA(config) : ''}
        dashboardTitle={config?.title}
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
        onCreateFromTemplate={handleCreateFromTemplate}
        onCreateFromEntityType={handleCreateFromEntityType}
        isConnected={isConnected}
      />
      {verboseUIDebug && (
        <div
          data-testid="verbose-ui-overlay"
          style={{
            position: 'fixed',
            bottom: 8,
            right: 8,
            zIndex: 2000,
            background: '#1f1f1f',
            color: '#fff',
            padding: '8px 12px',
            border: '1px solid #434343',
            borderRadius: 4,
            fontSize: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <div><strong>Verbose UI Debug</strong></div>
          <div>Status: {isConnected ? 'Connected' : 'Offline'}</div>
          <div>File: {filePath || 'Untitled'}</div>
        </div>
      )}
      </HAEntityProvider>
    </ConfigProvider>
  );
};

export default App;
