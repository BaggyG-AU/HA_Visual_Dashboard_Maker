import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { PictureGlanceCard, EntityConfig } from '../../types/dashboard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface PictureGlanceCardRendererProps {
  card: PictureGlanceCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Picture Glance card type
 * Displays an image with entity icons overlaid at the bottom
 */
export const PictureGlanceCardRenderer: React.FC<PictureGlanceCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();

  // Extract card properties
  const entities = card.entities || [];
  const title = card.title;
  const showState = card.show_state !== false;
  const hasImage = card.image && card.image.length > 0;
  const hasCameraImage = card.camera_image && card.camera_image.length > 0;
  const cameraView = card.camera_view || 'auto';

  // Get entity data
  const entityData = entities.map(entityConfig => {
    const entityId = typeof entityConfig === 'string' ? entityConfig : entityConfig.entity;
    const entity = getEntity(entityId);
    const attributes = entity?.attributes || {};

    const name = typeof entityConfig === 'object' && (entityConfig as EntityConfig).name
      ? (entityConfig as EntityConfig).name
      : attributes.friendly_name || entityId.split('.')[1]?.replace(/_/g, ' ') || entityId;

    const icon = typeof entityConfig === 'object' && (entityConfig as EntityConfig).icon
      ? (entityConfig as EntityConfig).icon
      : attributes.icon || getDefaultIcon(entityId);

    return {
      entityId,
      name,
      state: entity?.state || 'unknown',
      icon,
      isOn: entity?.state === 'on' || entity?.state === 'open' || entity?.state === 'active',
    };
  });

  // Get default icon based on entity domain
  function getDefaultIcon(entityId: string): string {
    const domain = entityId.split('.')[0];
    switch (domain) {
      case 'light':
        return '💡';
      case 'switch':
        return '🔌';
      case 'lock':
        return '🔒';
      case 'climate':
        return '🌡️';
      case 'fan':
        return '💨';
      case 'cover':
        return '🪟';
      default:
        return '📍';
    }
  }

  // Convert mdi icon to emoji (simple mapping)
  function getIconDisplay(icon: string): string {
    if (icon.startsWith('mdi:')) {
      // Simple mdi icon mapping to emoji
      const iconName = icon.replace('mdi:', '');
      const iconMap: Record<string, string> = {
        'lightbulb': '💡',
        'power': '🔌',
        'lock': '🔒',
        'thermometer': '🌡️',
        'fan': '💨',
        'window-closed': '🪟',
        'window-open': '🪟',
        'door-closed': '🚪',
        'door-open': '🚪',
      };
      return iconMap[iconName] || '📍';
    }
    return icon;
  }

  return (
    <AntCard
      size="small"
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        transition: 'all 0.3s ease',
        padding: 0,
      }}
      styles={{
        body: {
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Background image */}
      {hasImage ? (
        <div style={{
          width: '100%',
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <img
            src={card.image}
            alt={title || 'Picture glance'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
          {/* Error placeholder */}
          <div style={{
            display: 'none',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#666',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <PictureOutlined style={{ fontSize: '48px' }} />
            <div style={{ fontSize: '12px' }}>Image not found</div>
          </div>
        </div>
      ) : (
        // No image placeholder - show camera icon if camera is configured
        <div style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: hasCameraImage ? '#1890ff' : '#666',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {hasCameraImage ? (
            <>
              <VideoCameraOutlined style={{ fontSize: '48px' }} />
              <div style={{ fontSize: '12px' }}>
                Camera: {card.camera_image?.split('.')[1]?.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                View: {cameraView === 'live' ? 'Live Stream' : 'Auto (Snapshot)'}
              </div>
            </>
          ) : (
            <>
              <PictureOutlined style={{ fontSize: '48px' }} />
              <div style={{ fontSize: '12px' }}>No image configured</div>
            </>
          )}
        </div>
      )}

      {/* Title overlay (top) */}
      {title && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
          padding: '12px 16px',
        }}>
          <Text strong style={{ color: '#fff', fontSize: '16px' }}>
            {title}
          </Text>
        </div>
      )}

      {/* Entity icons overlay (bottom) */}
      {entities.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)',
          padding: '12px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {entityData.map((entity) => (
            <div
              key={entity.entityId}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: '50px',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: entity.isOn ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: entity.isOn ? '2px solid #ffc107' : '2px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  transition: 'all 0.3s ease',
                }}
              >
                {getIconDisplay(entity.icon)}
              </div>

              {/* State */}
              {showState && (
                <Text
                  style={{
                    fontSize: '10px',
                    color: entity.isOn ? '#ffc107' : '#999',
                    textAlign: 'center',
                    textTransform: 'capitalize',
                  }}
                >
                  {entity.state}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No entities warning */}
      {entities.length === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 152, 0, 0.9)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '11px',
        }}>
          No entities configured
        </div>
      )}
    </AntCard>
  );
};
