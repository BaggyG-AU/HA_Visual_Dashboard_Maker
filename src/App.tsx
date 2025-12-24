import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, theme, Button, Space, message, Modal, Alert, Tabs, Badge } from 'antd';
import { FolderOpenOutlined, SaveOutlined, ApiOutlined, CloudUploadOutlined, AppstoreOutlined, DownloadOutlined, EyeOutlined, FileAddOutlined, CodeOutlined } from '@ant-design/icons';
import { Layout as GridLayoutType } from 'react-grid-layout';
import { fileService } from './services/fileService';
import { useDashboardStore } from './store/dashboardStore';
import { yamlService } from './services/yamlService';
import { GridCanvas } from './components/GridCanvas';
import { CardPalette } from './components/CardPalette';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ConnectionDialog } from './components/ConnectionDialog';
import { DeployDialog } from './components/DeployDialog';
import { DashboardBrowser } from './components/DashboardBrowser';
import { YamlEditorDialog } from './components/YamlEditorDialog';
import { HADashboardIframe } from './components/HADashboardIframe';
import { cardRegistry } from './services/cardRegistry';
import { haConnectionService } from './services/haConnectionService';
import { haWebSocketService } from './services/haWebSocketService';
import { isLayoutCardGrid, convertGridLayoutToViewLayout } from './utils/layoutCardParser';
import { HAEntityProvider } from './contexts/HAEntityContext';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [ignoreNextLayoutChange, setIgnoreNextLayoutChange] = useState<boolean>(false);
  const [connectionDialogVisible, setConnectionDialogVisible] = useState<boolean>(false);
  const [deployDialogVisible, setDeployDialogVisible] = useState<boolean>(false);
  const [dashboardBrowserVisible, setDashboardBrowserVisible] = useState<boolean>(false);
  const [yamlEditorVisible, setYamlEditorVisible] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [livePreviewMode, setLivePreviewMode] = useState<boolean>(false);
  const [tempDashboardPath, setTempDashboardPath] = useState<string | null>(null);
  const [haUrl, setHaUrl] = useState<string>('');

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
    clearDashboard,
    markClean,
    setSelectedView,
    setSelectedCard,
    markDirty
  } = useDashboardStore();

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
        }
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
            const { layout: _, ...cardWithoutLayout } = card as any;
            return {
              ...cardWithoutLayout,
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
            } as any;
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
    const newCard: any = {
      type: cardType,
      ...cardMetadata.defaultProps,
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

  const handleCardUpdate = (updatedCard: any) => {
    if (!config || selectedViewIndex === null || selectedCardIndex === null) return;

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
      updateConfig({ ...config, views: updatedViews });

      message.success('Card properties updated');
    }
  };

  const handlePropertiesCancel = () => {
    // Deselect card
    if (selectedViewIndex !== null) {
      setSelectedCard(selectedViewIndex, null);
    }
  };

  const handleOpenConnectionDialog = () => {
    setConnectionDialogVisible(true);
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
    } catch (error) {
      message.error(`Failed to connect: ${(error as Error).message}`);
      throw error;
    }
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
        onOk: () => createNewDashboard(),
      });
    } else {
      createNewDashboard();
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

  // Set up menu event listeners
  useEffect(() => {
    const handleMenuOpenFile = () => handleOpenFile();
    const handleMenuSave = () => handleSave();
    const handleMenuSaveFileAs = () => handleSaveFile();
    const handleMenuToggleTheme = () => handleToggleTheme();
    const handleMenuShowAbout = () => handleShowAbout();

    const unsubOpenFile = window.electronAPI.onMenuOpenFile(handleMenuOpenFile);
    const unsubSaveFile = window.electronAPI.onMenuSaveFile(handleMenuSave);
    const unsubSaveFileAs = window.electronAPI.onMenuSaveFileAs(handleMenuSaveFileAs);
    const unsubToggleTheme = window.electronAPI.onMenuToggleTheme(handleMenuToggleTheme);
    const unsubShowAbout = window.electronAPI.onMenuShowAbout(handleMenuShowAbout);

    // Cleanup listeners when component unmounts
    return () => {
      unsubOpenFile();
      unsubSaveFile();
      unsubSaveFileAs();
      unsubToggleTheme();
      unsubShowAbout();
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <HAEntityProvider enabled={isConnected}>
      <Layout style={{ height: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
            HA Visual Dashboard Maker
          </div>
          <Space>
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
          </Space>
        </Header>
        <Layout>
          <Sider width={280} theme="dark" style={{ height: '100vh', overflow: 'hidden' }}>
            <CardPalette onCardAdd={handleCardAdd} />
          </Sider>
          <Layout style={{ padding: '24px' }}>
            <Content
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
                      <Button
                        type="primary"
                        size="large"
                        icon={<FileAddOutlined />}
                        onClick={handleNewDashboard}
                      >
                        New Dashboard
                      </Button>
                      <Button
                        size="large"
                        icon={<FolderOpenOutlined />}
                        onClick={handleOpenFile}
                      >
                        Open Local File
                      </Button>
                      <Button
                        size="large"
                        icon={<AppstoreOutlined />}
                        onClick={handleOpenDashboardBrowser}
                        disabled={!isConnected}
                      >
                        Browse HA Dashboards
                      </Button>
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
                      <Button
                        icon={<FileAddOutlined />}
                        onClick={handleNewDashboard}
                      >
                        New
                      </Button>
                      <Button
                        icon={<FolderOpenOutlined />}
                        onClick={handleOpenFile}
                      >
                        Open
                      </Button>
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={handleOpenDashboardBrowser}
                        disabled={!isConnected}
                      >
                        Download
                      </Button>
                      <Button
                        icon={<CodeOutlined />}
                        onClick={handleOpenYamlEditor}
                      >
                        Edit YAML
                      </Button>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        disabled={!isDirty}
                      >
                        Save
                      </Button>
                      <Button
                        icon={<CloudUploadOutlined />}
                        onClick={handleOpenDeployDialog}
                        disabled={!isConnected}
                      >
                        Deploy
                      </Button>
                      <Button
                        type={livePreviewMode ? 'primary' : 'default'}
                        icon={<EyeOutlined />}
                        onClick={handleEnterLivePreview}
                        disabled={!isConnected || livePreviewMode}
                      >
                        Live Preview
                      </Button>
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
          <Sider width={300} theme="dark">
            <PropertiesPanel
              card={
                config && selectedViewIndex !== null && selectedCardIndex !== null
                  ? config.views[selectedViewIndex]?.cards?.[selectedCardIndex] || null
                  : null
              }
              cardIndex={selectedCardIndex}
              onSave={handleCardUpdate}
              onCancel={handlePropertiesCancel}
            />
          </Sider>
        </Layout>
      </Layout>
      <ConnectionDialog
        visible={connectionDialogVisible}
        onClose={() => setConnectionDialogVisible(false)}
        onConnect={handleConnect}
      />
      <DeployDialog
        visible={deployDialogVisible}
        onClose={handleCloseDeployDialog}
        dashboardYaml={config ? yamlService.serializeDashboard(config) : ''}
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
      />
      </HAEntityProvider>
    </ConfigProvider>
  );
};

export default App;
