import React from 'react';
import { Card as AntCard, Typography, Progress } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { PlantStatusCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface PlantStatusCardRendererProps {
  card: PlantStatusCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Plant Status card type
 * Displays plant health metrics and sensor readings
 */
export const PlantStatusCardRenderer: React.FC<PlantStatusCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract plant properties
  const state = entity?.state || 'unknown';
  const attributes = entity?.attributes || {};

  // Plant sensor readings
  const moisture = attributes.moisture || 0;
  const temperature = attributes.temperature || 0;
  const conductivity = attributes.conductivity || 0;
  const brightness = attributes.brightness || 0;
  const battery = attributes.battery || 0;

  // Plant thresholds
  const moistureMin = attributes.min_moisture || 15;
  const moistureMax = attributes.max_moisture || 60;
  const conductivityMin = attributes.min_conductivity || 350;
  const conductivityMax = attributes.max_conductivity || 2000;
  const brightnessMin = attributes.min_brightness || 500;
  const brightnessMax = attributes.max_brightness || 30000;
  const temperatureMin = attributes.min_temperature || 8;
  const temperatureMax = attributes.max_temperature || 35;

  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    attributes.friendly_name ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Plant';
  const species = attributes.species || '';

  // Determine overall plant health
  const getPlantHealth = () => {
    if (state === 'ok') return { status: 'Healthy', color: '#4caf50', emoji: '🌿' };
    if (state === 'problem') return { status: 'Problem', color: '#ff9800', emoji: '⚠️' };
    return { status: 'Unknown', color: '#666', emoji: '🪴' };
  };

  const health = getPlantHealth();
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // Check if value is in acceptable range
  const isInRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
  };

  // Get status color for metric
  const getMetricColor = (value: number, min: number, max: number) => {
    if (isInRange(value, min, max)) return '#4caf50';
    if (value < min * 0.8 || value > max * 1.2) return '#f44336';
    return '#ff9800';
  };

  return (
    <AntCard
      size="small"
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '16px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Header with plant info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ fontSize: '48px', lineHeight: 1 }}>
          {health.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <Text strong style={{ color: '#e6e6e6', fontSize: '16px', display: 'block' }}>
            {displayName}
          </Text>
          {species && (
            <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
              {species}
            </Text>
          )}
        </div>
      </div>

      {/* Health status */}
      <div style={{
        padding: '12px',
        backgroundColor: `${health.color}11`,
        border: `2px solid ${health.color}`,
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <Text
          strong
          style={{
            color: health.color,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {health.status}
        </Text>
      </div>

      {/* Sensor metrics */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flex: 1,
      }}>
        {/* Moisture */}
        {moisture > 0 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}>
              <Text style={{ fontSize: '12px', color: '#999' }}>
                💧 Moisture
              </Text>
              <Text
                style={{
                  fontSize: '12px',
                  color: getMetricColor(moisture, moistureMin, moistureMax),
                  fontWeight: 600,
                }}
              >
                {moisture}%
              </Text>
            </div>
            <Progress
              percent={(moisture / 100) * 100}
              showInfo={false}
              strokeColor={getMetricColor(moisture, moistureMin, moistureMax)}
              trailColor="rgba(255, 255, 255, 0.1)"
              size="small"
            />
          </div>
        )}

        {/* Temperature */}
        {temperature > 0 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}>
              <Text style={{ fontSize: '12px', color: '#999' }}>
                🌡️ Temperature
              </Text>
              <Text
                style={{
                  fontSize: '12px',
                  color: getMetricColor(temperature, temperatureMin, temperatureMax),
                  fontWeight: 600,
                }}
              >
                {temperature}°C
              </Text>
            </div>
            <Progress
              percent={(temperature / temperatureMax) * 100}
              showInfo={false}
              strokeColor={getMetricColor(temperature, temperatureMin, temperatureMax)}
              trailColor="rgba(255, 255, 255, 0.1)"
              size="small"
            />
          </div>
        )}

        {/* Conductivity (soil nutrients) */}
        {conductivity > 0 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}>
              <Text style={{ fontSize: '12px', color: '#999' }}>
                🧪 Conductivity
              </Text>
              <Text
                style={{
                  fontSize: '12px',
                  color: getMetricColor(conductivity, conductivityMin, conductivityMax),
                  fontWeight: 600,
                }}
              >
                {conductivity} µS/cm
              </Text>
            </div>
            <Progress
              percent={(conductivity / conductivityMax) * 100}
              showInfo={false}
              strokeColor={getMetricColor(conductivity, conductivityMin, conductivityMax)}
              trailColor="rgba(255, 255, 255, 0.1)"
              size="small"
            />
          </div>
        )}

        {/* Brightness (light) */}
        {brightness > 0 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}>
              <Text style={{ fontSize: '12px', color: '#999' }}>
                ☀️ Brightness
              </Text>
              <Text
                style={{
                  fontSize: '12px',
                  color: getMetricColor(brightness, brightnessMin, brightnessMax),
                  fontWeight: 600,
                }}
              >
                {brightness} lx
              </Text>
            </div>
            <Progress
              percent={Math.min(100, (brightness / brightnessMax) * 100)}
              showInfo={false}
              strokeColor={getMetricColor(brightness, brightnessMin, brightnessMax)}
              trailColor="rgba(255, 255, 255, 0.1)"
              size="small"
            />
          </div>
        )}
      </div>

      {/* Battery level (if available) */}
      {battery > 0 && (
        <div style={{
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: 'auto',
        }}>
          <Text style={{ fontSize: '12px', color: '#999' }}>
            🔋 Battery
          </Text>
          <Progress
            percent={battery}
            size="small"
            strokeColor={battery > 20 ? '#4caf50' : '#f44336'}
            trailColor="rgba(255, 255, 255, 0.1)"
            style={{ flex: 1 }}
          />
          <Text style={{ fontSize: '12px', color: '#999' }}>
            {battery}%
          </Text>
        </div>
      )}

      {/* No entity warning */}
      {!entity && card.entity && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
        }}>
          <ExperimentOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
            {card.entity}
          </Text>
        </div>
      )}

      {/* No sensors warning */}
      {entity && moisture === 0 && temperature === 0 && conductivity === 0 && brightness === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            No sensor data available
          </Text>
        </div>
      )}
    </AntCard>
  );
};
