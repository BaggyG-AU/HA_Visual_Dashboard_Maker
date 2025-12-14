import React, { useState } from 'react';
import { ConfigProvider, Layout, theme, Button, Space, message } from 'antd';
import { FolderOpenOutlined, SaveOutlined } from '@ant-design/icons';
import { fileService } from './services/fileService';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>('');
  const [currentFilePath, setCurrentFilePath] = useState<string>('');

  const handleOpenFile = async () => {
    try {
      const result = await fileService.openAndReadFile();
      if (result) {
        setFileContent(result.content);
        setCurrentFilePath(result.filePath);
        message.success(`File opened: ${result.filePath}`);
      }
    } catch (error) {
      message.error(`Failed to open file: ${(error as Error).message}`);
    }
  };

  const handleSaveFile = async () => {
    try {
      const testContent = `# Test Dashboard
title: My Dashboard
views:
  - title: Home
    cards: []`;

      const success = await fileService.saveFileAs(testContent, 'dashboard.yaml');
      if (success) {
        message.success('File saved successfully!');
      }
    } catch (error) {
      message.error(`Failed to save file: ${(error as Error).message}`);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
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
              <h1 style={{ color: '#00d9ff' }}>Welcome to HA Visual Dashboard Maker</h1>
              <p>Phase 1: Core Application Setup - In Progress</p>
              <ul style={{ marginTop: '16px', marginBottom: '24px' }}>
                <li>✅ Electron Forge initialized</li>
                <li>✅ React + TypeScript configured</li>
                <li>✅ Ant Design UI library added</li>
                <li>✅ Basic application layout created</li>
                <li>✅ File system integration via IPC</li>
                <li>⏳ Next: Application menu</li>
              </ul>

              <h3 style={{ color: '#00d9ff', marginBottom: '16px' }}>Test File Operations:</h3>
              <Space style={{ marginBottom: '16px' }}>
                <Button
                  type="primary"
                  icon={<FolderOpenOutlined />}
                  onClick={handleOpenFile}
                >
                  Open File
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveFile}
                >
                  Save Test File
                </Button>
              </Space>

              {currentFilePath && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ color: '#888' }}>Current File: {currentFilePath}</p>
                  <pre style={{
                    background: '#0a0a0a',
                    padding: '12px',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    fontSize: '12px'
                  }}>
                    {fileContent}
                  </pre>
                </div>
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
