import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, theme, Button, Space, message, Modal, Alert, Tree } from 'antd';
import { FolderOpenOutlined, SaveOutlined, FileOutlined, FolderOutlined } from '@ant-design/icons';
import { fileService } from './services/fileService';
import { useDashboardStore } from './store/dashboardStore';
import { yamlService } from './services/yamlService';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  // Dashboard store
  const {
    config,
    filePath,
    error,
    isDirty,
    loadDashboard,
    updateConfig,
    clearDashboard,
    markClean
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

  // Load theme preference on startup
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
    loadTheme();
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
      <Layout style={{ height: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
            HA Visual Dashboard Maker
          </div>
        </Header>
        <Layout>
          <Sider width={250} theme="dark">
            <div style={{ padding: '16px', color: 'white' }}>
              <h3 style={{ color: 'white', marginBottom: '16px' }}>Card Palette</h3>
              <p style={{ fontSize: '12px', color: '#888' }}>Coming Soon</p>
            </div>
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
                  <p>Phase 2: YAML Dashboard Loading - In Progress</p>

                  <div style={{ marginTop: '24px' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<FolderOpenOutlined />}
                      onClick={handleOpenFile}
                    >
                      Open Dashboard
                    </Button>
                  </div>

                  <div style={{ marginTop: '32px', color: '#888', fontSize: '14px' }}>
                    <p>Open a Home Assistant dashboard YAML file to begin editing.</p>
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
                    <Space>
                      <Button
                        icon={<FolderOpenOutlined />}
                        onClick={handleOpenFile}
                      >
                        Open
                      </Button>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        disabled={!isDirty}
                      >
                        Save
                      </Button>
                    </Space>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ color: '#00d9ff', marginBottom: '12px' }}>
                      Dashboard Structure ({config.views.length} views)
                    </h3>
                    {config.views.map((view, viewIndex) => (
                      <div
                        key={viewIndex}
                        style={{
                          background: '#1f1f1f',
                          padding: '12px',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <FolderOutlined style={{ marginRight: '8px', color: '#00d9ff' }} />
                          <strong>{view.title || view.path || `View ${viewIndex + 1}`}</strong>
                        </div>
                        {view.cards && view.cards.length > 0 && (
                          <div style={{ paddingLeft: '24px', fontSize: '12px', color: '#aaa' }}>
                            {view.cards.map((card, cardIndex) => (
                              <div key={cardIndex} style={{ padding: '4px 0' }}>
                                <FileOutlined style={{ marginRight: '8px' }} />
                                {card.type} {card.name ? `- ${card.name}` : ''}
                              </div>
                            ))}
                          </div>
                        )}
                        {(!view.cards || view.cards.length === 0) && (
                          <div style={{ paddingLeft: '24px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                            No cards
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Content>
          </Layout>
          <Sider width={300} theme="dark">
            <div style={{ padding: '16px', color: 'white' }}>
              <h3 style={{ color: 'white', marginBottom: '16px' }}>Properties Panel</h3>
              <p style={{ fontSize: '12px', color: '#888' }}>Coming Soon</p>
            </div>
          </Sider>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
