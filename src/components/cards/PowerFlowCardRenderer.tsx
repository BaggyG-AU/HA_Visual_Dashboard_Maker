import React from 'react';
import { Card as AntCard, Typography, Tag } from 'antd';
import { SunOutlined, HomeOutlined, ThunderboltFilled, ApiOutlined, FireOutlined, CloudOutlined } from '@ant-design/icons';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useEntityContextResolver } from '../../hooks/useEntityContext';

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
    gas?: PowerFlowEntity;     // v2.6.0: Gas entity support
    water?: PowerFlowEntity;   // v2.6.0: Water entity support
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
  dashboard_link?: string;   // v2.4.0: Link to detailed dashboard
  [key: string]: any;
}

interface PowerFlowCardRendererProps {
  card: PowerFlowCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Power Flow Card
 * Repository: https://github.com/ulic75/power-flow-card
 * Version Support: v2.6.2+
 *
 * Displays energy flow diagram between solar, battery, grid, and home
 * v2.6.0+: Gas and water entity support
 * v2.4.0+: Dashboard link, bidirectional grid-to-battery flows
 */
export const PowerFlowCardRenderer: React.FC<PowerFlowCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const entities = card.entities || {};
  const individual = entities.individual || [];
  const individualCount = individual.length;
  const resolveContext = useEntityContextResolver();

  // Generate mock power values for demonstration
  const mockValues = {
    solar: 1250, // W
    battery: -450, // W (negative = charging)
    grid: 125, // W (positive = importing)
    home: 925, // W
    gas: 15.5, // m³/h
    water: 8.2, // L/min
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
  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );
  const solarLabel = entities.solar?.name ? resolveContext(entities.solar.name, entities.solar.entity) : 'Solar';
  const gridLabel = entities.grid?.name ? resolveContext(entities.grid.name, entities.grid.entity) : 'Grid';
  const homeLabel = entities.home?.name ? resolveContext(entities.home.name, entities.home.entity) : 'Home';
  const batteryLabel = entities.battery?.name ? resolveContext(entities.battery.name, entities.battery.entity) : 'Battery';

  const PowerNode: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
  }> = ({ icon, label, value, color }) => (
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
        ...backgroundStyle,
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
              label={solarLabel}
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
                label={gridLabel}
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
              label={homeLabel}
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
                label={batteryLabel}
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
            <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
              Individual Devices
            </Text>
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
              {individual.map((device, idx) => (
                <Tag key={idx} color="blue" style={{ fontSize: '10px', margin: 0 }}>
                  {device.name || device.entity?.split('.')[1]?.replace(/_/g, ' ') || `Device ${idx + 1}`}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Gas and Water Entities (v2.6.0+) */}
        {(entities.gas || entities.water) && (
          <div style={{ marginTop: '12px', width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
              Utilities
            </Text>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
              }}
            >
              {/* Gas */}
              {entities.gas && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#ff7a45',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: '#fff',
                      boxShadow: '0 0 6px #ff7a45',
                    }}
                  >
                    <FireOutlined />
                  </div>
                  <Text style={{ fontSize: '9px', fontWeight: 500, color: '#e6e6e6' }}>
                    {entities.gas.name || 'Gas'}
                  </Text>
                  <Text style={{ fontSize: '10px', fontWeight: 600, color: '#ff7a45' }}>
                    {mockValues.gas.toFixed(1)} m³/h
                  </Text>
                </div>
              )}

              {/* Water */}
              {entities.water && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#1890ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: '#fff',
                      boxShadow: '0 0 6px #1890ff',
                    }}
                  >
                    <CloudOutlined />
                  </div>
                  <Text style={{ fontSize: '9px', fontWeight: 500, color: '#e6e6e6' }}>
                    {entities.water.name || 'Water'}
                  </Text>
                  <Text style={{ fontSize: '10px', fontWeight: 600, color: '#1890ff' }}>
                    {mockValues.water.toFixed(1)} L/min
                  </Text>
                </div>
              )}
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
