import React from 'react';
import { Card as AntCard, Typography, Tag } from 'antd';
import {
  ThunderboltOutlined,
  SunOutlined,
  HomeOutlined,
  ThunderboltFilled,
  ApiOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface PowerFlowEntity {
  entity: string;
  name?: string;
  icon?: string;
  state_of_charge?: string;
  invert_state?: boolean;
  display_zero?: boolean;
  display_zero_state?: boolean;
  secondary_info?: any;
  [key: string]: any;
}

interface PowerFlowCardConfig {
  type: 'custom:power-flow-card-plus' | 'custom:power-flow-card';
  entities: {
    battery?: PowerFlowEntity;
    grid?: PowerFlowEntity;
    solar?: PowerFlowEntity;
    home?: PowerFlowEntity;
    individual?: PowerFlowEntity[];
  };
  clickable_entities?: boolean;
  display_zero_lines?: boolean;
  use_new_flow_rate_model?: boolean;
  w_decimals?: number;
  kw_decimals?: number;
  min_flow_rate?: number;
  max_flow_rate?: number;
  max_expected_power?: number;
  min_expected_power?: number;
  watt_threshold?: number;
  transparency_zero_lines?: number;
  [key: string]: any;
}

interface PowerFlowCardRendererProps {
  card: PowerFlowCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Power Flow Card
 * Displays energy flow diagram between solar, battery, grid, and home
 */
export const PowerFlowCardRenderer: React.FC<PowerFlowCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const entities = card.entities || {};
  const individualCount = entities.individual?.length || 0;

  // Generate mock power values for demonstration
  const mockValues = {
    solar: 1250, // W
    battery: -450, // W (negative = charging)
    grid: 125, // W (positive = importing)
    home: 925, // W
  };

  const formatPower = (watts: number): string => {
    const kw_decimals = card.kw_decimals ?? 1;
    const w_decimals = card.w_decimals ?? 0;
    const threshold = card.watt_threshold ?? 1000;

    if (Math.abs(watts) >= threshold) {
      return `${(watts / 1000).toFixed(kw_decimals)} kW`;
    }
    return `${watts.toFixed(w_decimals)} W`;
  };

  const PowerNode: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    entity?: PowerFlowEntity;
  }> = ({ icon, label, value, color, entity }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#fff',
          boxShadow: `0 0 8px ${color}`,
        }}
      >
        {icon}
      </div>
      <Text style={{ fontSize: '10px', fontWeight: 500, color: '#e6e6e6' }}>{label}</Text>
      <Text style={{ fontSize: '11px', fontWeight: 600, color: color }}>{formatPower(value)}</Text>
    </div>
  );

  const FlowLine: React.FC<{ active: boolean; vertical?: boolean }> = ({ active, vertical }) => (
    <div
      style={{
        width: vertical ? '2px' : '100%',
        height: vertical ? '100%' : '2px',
        backgroundColor: active ? '#00d9ff' : '#434343',
        position: 'relative',
        minWidth: vertical ? '2px' : '30px',
        minHeight: vertical ? '30px' : '2px',
      }}
    >
      {active && (
        <div
          style={{
            position: 'absolute',
            width: vertical ? '100%' : '8px',
            height: vertical ? '8px' : '100%',
            backgroundColor: '#00d9ff',
            boxShadow: '0 0 8px #00d9ff',
            borderRadius: '50%',
            animation: vertical ? 'flowVertical 2s linear infinite' : 'flowHorizontal 2s linear infinite',
          }}
        />
      )}
    </div>
  );

  return (
    <AntCard
      size="small"
      title={
        <div style={{
          fontSize: '16px',
          fontWeight: 500,
          color: '#e1e1e1',
          padding: '0',
        }}>
          Energy Flow
        </div>
      }
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        transition: 'all 0.3s ease',
        borderRadius: '12px',
      }}
      styles={{
        header: {
          padding: '16px 16px 12px 16px',
          minHeight: '48px',
          borderBottom: 'none',
        },
        body: {
          padding: '16px',
          paddingTop: '0',
          height: 'calc(100% - 48px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Energy Flow Diagram */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Top Row: Solar */}
        {entities.solar && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <PowerNode
              icon={<SunOutlined />}
              label="Solar"
              value={mockValues.solar}
              color="#faad14"
              entity={entities.solar}
            />
            <FlowLine active={mockValues.solar > 0} vertical />
          </div>
        )}

        {/* Middle Row: Grid - Home - Battery */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            justifyContent: 'space-evenly',
          }}
        >
          {/* Grid */}
          {entities.grid && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PowerNode
                icon={<ApiOutlined />}
                label="Grid"
                value={mockValues.grid}
                color={mockValues.grid > 0 ? '#f5222d' : '#52c41a'}
                entity={entities.grid}
              />
              <FlowLine active={Math.abs(mockValues.grid) > 0} />
            </div>
          )}

          {/* Home */}
          {entities.home && (
            <PowerNode
              icon={<HomeOutlined />}
              label="Home"
              value={mockValues.home}
              color="#00d9ff"
              entity={entities.home}
            />
          )}

          {/* Battery */}
          {entities.battery && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlowLine active={Math.abs(mockValues.battery) > 0} />
              <PowerNode
                icon={<ThunderboltFilled />}
                label="Battery"
                value={mockValues.battery}
                color={mockValues.battery < 0 ? '#52c41a' : '#722ed1'}
                entity={entities.battery}
              />
            </div>
          )}
        </div>

        {/* Individual Devices */}
        {individualCount > 0 && (
          <div style={{ marginTop: '8px', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
              }}
            >
              {entities.individual?.map((device, idx) => (
                <Tag key={idx} color="blue" style={{ fontSize: '10px', margin: 0 }}>
                  {device.name || device.entity.split('.')[1]?.replace(/_/g, ' ')}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes flowHorizontal {
          0% { left: 0; }
          100% { left: calc(100% - 8px); }
        }
        @keyframes flowVertical {
          0% { top: 0; }
          100% { top: calc(100% - 8px); }
        }
      `}</style>

      {/* Configuration Info */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid #434343',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Text type="secondary" style={{ fontSize: '9px' }}>
          Max: {card.max_expected_power || 2000}W
        </Text>
        <Text type="secondary" style={{ fontSize: '9px' }}>
          •
        </Text>
        <Text type="secondary" style={{ fontSize: '9px' }}>
          Threshold: {card.watt_threshold || 1000}W
        </Text>
        {card.use_new_flow_rate_model && (
          <>
            <Text type="secondary" style={{ fontSize: '9px' }}>
              •
            </Text>
            <Text type="secondary" style={{ fontSize: '9px' }}>
              New Flow Model
            </Text>
          </>
        )}
      </div>
    </AntCard>
  );
};
