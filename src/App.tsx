import React from 'react';
import { ConfigProvider, Layout, theme } from 'antd';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
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
              <ul style={{ marginTop: '16px' }}>
                <li>✅ Electron Forge initialized</li>
                <li>✅ React + TypeScript configured</li>
                <li>✅ Ant Design UI library added</li>
                <li>✅ Basic application layout created</li>
                <li>⏳ Next: File system integration</li>
              </ul>
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
