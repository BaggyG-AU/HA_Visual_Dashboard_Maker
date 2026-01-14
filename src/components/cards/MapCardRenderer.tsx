import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { EnvironmentOutlined, AimOutlined } from '@ant-design/icons';
import { MapCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextResolver } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface MapCardRendererProps {
  card: MapCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Map card type
 * Displays device tracker entities on a map
 */
export const MapCardRenderer: React.FC<MapCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const resolveContext = useEntityContextResolver();

  // Extract map properties
  const entities = card.entities || [];
  const defaultEntityId = entities.length > 0 ? (typeof entities[0] === 'string' ? entities[0] : entities[0].entity) : null;
  const resolvedTitle = card.title ? resolveContext(card.title, defaultEntityId ?? null) : '';
  const title = (card.title ? resolvedTitle : '') || 'Map';
  const defaultZoom = card.default_zoom || 15;
  const darkMode = card.dark_mode !== false;
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // Get entity data for device trackers
  const trackerData = entities.map(entityConfig => {
    const entityId = typeof entityConfig === 'string' ? entityConfig : entityConfig.entity;
    const entity = getEntity(entityId);
    const attributes = entity?.attributes || {};

    const nameTemplate = typeof entityConfig === 'object' && entityConfig.name ? entityConfig.name : '';
    const name = nameTemplate
      ? resolveContext(nameTemplate, entityId)
      : attributes.friendly_name || entityId.split('.')[1]?.replace(/_/g, ' ') || entityId;

    return {
      entityId,
      name,
      state: entity?.state || 'unknown',
      latitude: attributes.latitude,
      longitude: attributes.longitude,
      gps_accuracy: attributes.gps_accuracy || 0,
      source_type: attributes.source_type || 'gps',
      color: getTrackerColor(entityId, entities.indexOf(entityConfig)),
    };
  });

  // Generate colors for trackers
  function getTrackerColor(entityId: string, index: number): string {
    const colors = [
      '#03a9f4', // Blue
      '#4caf50', // Green
      '#ff9800', // Orange
      '#e91e63', // Pink
      '#9c27b0', // Purple
      '#00bcd4', // Cyan
    ];
    return colors[index % colors.length];
  }

  // Filter trackers with valid coordinates
  const validTrackers = trackerData.filter(
    tracker => tracker.latitude !== undefined && tracker.longitude !== undefined
  );

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
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '12px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {title}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AimOutlined style={{ fontSize: '14px', color: '#999' }} />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Zoom: {defaultZoom}
          </Text>
        </div>
      </div>

      {/* Map visualization area */}
      <div style={{
        flex: 1,
        position: 'relative',
        backgroundColor: darkMode ? '#1a1a1a' : '#e5e3df',
        borderRadius: '8px',
        overflow: 'hidden',
        minHeight: '200px',
        backgroundImage: darkMode
          ? 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a), linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a)'
          : 'linear-gradient(45deg, #e5e3df 25%, transparent 25%, transparent 75%, #e5e3df 75%, #e5e3df), linear-gradient(45deg, #e5e3df 25%, transparent 25%, transparent 75%, #e5e3df 75%, #e5e3df)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
      }}>
        {/* Map placeholder with grid pattern */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: darkMode ? '#666' : '#999',
        }}>
          <EnvironmentOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
            Map Preview
          </Text>
        </div>

        {/* Device tracker markers */}
        {validTrackers.map((tracker, index) => {
          // Position markers in a visually appealing pattern
          const x = 30 + (index % 3) * 20;
          const y = 30 + Math.floor(index / 3) * 25;

          return (
            <div
              key={tracker.entityId}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -100%)',
                zIndex: 10,
              }}
            >
              {/* Marker pin */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: tracker.color,
                  border: '3px solid white',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EnvironmentOutlined
                  style={{
                    fontSize: '16px',
                    color: 'white',
                    transform: 'rotate(45deg)',
                  }}
                />
              </div>

              {/* Accuracy circle */}
              {tracker.gps_accuracy > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${Math.min(tracker.gps_accuracy / 10, 60)}px`,
                    height: `${Math.min(tracker.gps_accuracy / 10, 60)}px`,
                    transform: 'translate(-50%, -50%)',
                    border: `2px dashed ${tracker.color}`,
                    borderRadius: '50%',
                    opacity: 0.3,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Tracker list/legend */}
      {validTrackers.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: 'auto',
        }}>
          {validTrackers.map((tracker) => (
            <div
              key={tracker.entityId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '6px',
                borderLeft: `3px solid ${tracker.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EnvironmentOutlined style={{ fontSize: '14px', color: tracker.color }} />
                <Text style={{ fontSize: '12px', color: '#e6e6e6' }}>
                  {tracker.name}
                </Text>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: '11px',
                    color: tracker.state === 'home' ? '#4caf50' : '#999',
                    textTransform: 'capitalize',
                  }}
                >
                  {tracker.state}
                </Text>
                {tracker.gps_accuracy > 0 && (
                  <Text type="secondary" style={{ fontSize: '10px' }}>
                    ±{tracker.gps_accuracy}m
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No entities warning */}
      {entities.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
        }}>
          <EnvironmentOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
            No device trackers configured
          </Text>
        </div>
      )}

      {/* No valid coordinates warning */}
      {entities.length > 0 && validTrackers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
        }}>
          <EnvironmentOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
            No location data available
          </Text>
        </div>
      )}
    </AntCard>
  );
};
