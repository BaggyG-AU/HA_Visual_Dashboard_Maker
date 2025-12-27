import React from 'react';
import { Card, Space, Typography, Tag, Divider, Empty } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';
import { themeService } from '../services/themeService';

const { Text, Title } = Typography;

/**
 * Theme Preview Panel
 * Displays color swatches and variable preview for the current theme
 */
export const ThemePreviewPanel: React.FC = () => {
  const { currentTheme, currentThemeName, darkMode } = useThemeStore();

  if (!currentTheme || !currentThemeName) {
    return (
      <Card
        title={
          <Space>
            <BgColorsOutlined />
            <span>Theme Preview</span>
          </Space>
        }
        size="small"
        style={{ marginTop: '16px' }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No theme selected"
          style={{ padding: '24px 0' }}
        />
      </Card>
    );
  }

  const colors = themeService.getThemeColors(currentTheme, darkMode);

  const ColorSwatch: React.FC<{ label: string; color: string | undefined }> = ({ label, color }) => {
    if (!color) return null;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: color,
            border: '1px solid #434343',
            borderRadius: '4px',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: '12px', color: '#888' }}>{label}</Text>
          <div>
            <Text code style={{ fontSize: '11px' }}>{color}</Text>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <BgColorsOutlined />
          <span>Theme Preview</span>
        </Space>
      }
      size="small"
      style={{ marginTop: '16px' }}
    >
      <div style={{ marginBottom: '12px' }}>
        <Text strong>{currentThemeName}</Text>
        <div style={{ marginTop: '4px' }}>
          <Tag color={darkMode ? 'blue' : 'gold'}>
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </Tag>
        </div>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <Title level={5} style={{ fontSize: '13px', marginTop: 0 }}>Colors</Title>

      <ColorSwatch label="Primary" color={colors.primary} />
      <ColorSwatch label="Accent" color={colors.accent} />
      <ColorSwatch label="Primary Text" color={colors.primaryText} />
      <ColorSwatch label="Secondary Text" color={colors.secondaryText} />
      <ColorSwatch label="Background" color={colors.primaryBackground} />
      <ColorSwatch label="Card Background" color={colors.cardBackground} />
    </Card>
  );
};
