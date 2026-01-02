import React, { useState, useEffect } from 'react';
import { Modal, Flex, Button, Alert, Space, Typography, Spin, Tag, Empty, Tooltip } from 'antd';
import { DownloadOutlined, FileTextOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { haConnectionService } from '../services/haConnectionService';
import * as yaml from 'js-yaml';

const { Text } = Typography;

interface Dashboard {
  id: string;
  title: string;
  icon?: string;
  url_path: string;
  require_admin: boolean;
  show_in_sidebar: boolean;
}

interface DashboardBrowserProps {
  visible: boolean;
  onClose: () => void;
  onDashboardDownload: (dashboardYaml: string, dashboardTitle: string, dashboardId: string) => void;
}

/**
 * Dashboard Browser - Browse and download dashboards from Home Assistant
 * Features:
 * - Lists all dashboards from connected HA instance
 * - Shows dashboard metadata (title, icon, URL path)
 * - Download dashboard YAML for editing
 * - Refresh dashboard list
 */
export const DashboardBrowser: React.FC<DashboardBrowserProps> = ({
  visible,
  onClose,
  onDashboardDownload,
}) => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Load dashboards when dialog opens
  useEffect(() => {
    if (visible) {
      loadDashboards();
    }
  }, [visible]);

  const loadDashboards = async () => {
    if (!haConnectionService.isConnected()) {
      setError('Not connected to Home Assistant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = haConnectionService.getConfig();
      if (!config) {
        throw new Error('No connection configuration found');
      }

      console.log('Connecting to Home Assistant WebSocket...');

      // Connect to WebSocket
      const connectResult = await window.electronAPI.haWsConnect(config.url, config.token);
      if (!connectResult.success) {
        throw new Error(connectResult.error || 'Failed to connect to WebSocket');
      }

      console.log('WebSocket connected! Listing dashboards...');

      // List dashboards via WebSocket
      const listResult = await window.electronAPI.haWsListDashboards();
      if (!listResult.success) {
        throw new Error(listResult.error || 'Failed to list dashboards');
      }

      const allDashboards: Dashboard[] = [
        // Always include the default dashboard
        {
          id: 'lovelace',
          title: 'Overview',
          icon: 'mdi:view-dashboard',
          url_path: 'lovelace',
          require_admin: false,
          show_in_sidebar: true,
        },
      ];

      // Add custom dashboards from the list
      if (listResult.dashboards) {
        for (const item of listResult.dashboards) {
          const dashboard: Dashboard = {
            id: item.id || item.url_path || 'unknown',
            title: item.title || item.id || 'Untitled',
            icon: item.icon || 'mdi:view-dashboard',
            url_path: item.url_path || item.id,
            require_admin: item.require_admin || false,
            show_in_sidebar: item.show_in_sidebar !== false,
          };
          allDashboards.push(dashboard);
        }
      }

      setDashboards(allDashboards);
      console.log(`✓ Found ${allDashboards.length} dashboards via WebSocket`);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to load dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDashboard = async (dashboard: Dashboard) => {
    setDownloading(dashboard.id);
    setError(null);

    try {
      console.log(`Downloading dashboard: ${dashboard.title} (id: ${dashboard.id}, url_path: ${dashboard.url_path})`);

      // For default dashboard, use null as urlPath
      // For custom dashboards, use the url_path field (NOT the id field)
      const urlPath = dashboard.id === 'lovelace' ? null : dashboard.url_path;

      // Get dashboard config via WebSocket
      const configResult = await window.electronAPI.haWsGetDashboardConfig(urlPath);
      if (!configResult.success) {
        throw new Error(configResult.error || 'Failed to get dashboard config');
      }

      console.log(`✓ Downloaded dashboard config for ${dashboard.title}`);

      // Convert to YAML
      const yamlString = yaml.dump(configResult.config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });

      // Pass to parent component
      onDashboardDownload(yamlString, dashboard.title, dashboard.id);
      onClose();

      console.log(`✓ Loaded dashboard into editor: ${dashboard.title}`);
    } catch (err) {
      setError(`Failed to download dashboard: ${(err as Error).message}`);
      console.error('Failed to download dashboard:', err);
    } finally {
      setDownloading(null);
    }
  };

  const renderDashboardItem = (dashboard: Dashboard) => {
    const isDownloading = downloading === dashboard.id;

    return (
      <div
        key={dashboard.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #434343',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* Avatar */}
          <div
            style={{
              width: '40px',
              height: '40px',
              background: dashboard.id === 'lovelace' ? '#1890ff' : '#00d9ff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {dashboard.icon ? (
              <span
                className={`mdi ${dashboard.icon.replace('mdi:', 'mdi-')}`}
                style={{ fontSize: '24px', color: 'white' }}
              />
            ) : (
              <FileTextOutlined style={{ fontSize: '24px', color: 'white' }} />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <Space>
              <Text strong style={{ fontSize: '15px' }}>
                {dashboard.title}
              </Text>
              {dashboard.id === 'lovelace' && (
                <Tag color="blue" icon={<HomeOutlined />}>
                  Default
                </Tag>
              )}
              {dashboard.require_admin && <Tag color="red">Admin Only</Tag>}
            </Space>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                URL: /lovelace/{dashboard.url_path}
              </Text>
            </div>
          </div>
        </div>

        {/* Actions */}
        <Tooltip title="Download this dashboard to edit it in the visual editor">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadDashboard(dashboard)}
            loading={isDownloading}
            disabled={downloading !== null && !isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        </Tooltip>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Browse Home Assistant Dashboards</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={loadDashboards} loading={loading} type="primary">
          Refresh Dashboards
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
      style={{ top: 20 }}
    >
      {!haConnectionService.isConnected() && (
        <Alert
          title="Not Connected"
          description="Please connect to Home Assistant first to browse dashboards."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Alert
        title="How to Load Your Dashboards"
        description={
          <div style={{ fontSize: '12px' }}>
            <p style={{ marginTop: '8px', marginBottom: '8px' }}>
              Click <strong>"Refresh Dashboards"</strong> to connect to your Home Assistant instance
              and automatically discover all available dashboards.
            </p>
            <p style={{ marginTop: '0', marginBottom: 0 }}>
              Once loaded, click <strong>"Download"</strong> next to any dashboard to load it into the editor.
              No manual file downloads needed!
            </p>
          </div>
        }
        type="info"
        showIcon
        closable
        style={{ marginBottom: '16px' }}
      />

      {error && (
        <Alert
          title="Error Loading Dashboards"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '16px' }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Loading dashboards from Home Assistant...</Text>
          </div>
        </div>
      ) : dashboards.length === 0 && !error ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space orientation="vertical">
              <Text type="secondary">No dashboards found</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Connect to Home Assistant and click Refresh
              </Text>
            </Space>
          }
        />
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary">
              Found {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''} in your Home
              Assistant instance
            </Text>
          </div>

          <Flex
            vertical
            gap="small"
            style={{
              maxHeight: '500px',
              overflowY: 'auto',
            }}
          >
            {dashboards.map(renderDashboardItem)}
          </Flex>
        </>
      )}

      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: '#1a1a1a',
          borderRadius: '4px',
        }}
      >
        <Text style={{ color: '#666', fontSize: '11px' }}>
          💡 <strong style={{ color: '#888' }}>Tip:</strong> Downloaded dashboards will be loaded
          into the editor. You can make changes and save them locally or deploy back to Home
          Assistant.
        </Text>
      </div>
    </Modal>
  );
};
