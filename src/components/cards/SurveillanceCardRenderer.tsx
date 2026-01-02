import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface SurveillanceCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Surveillance/Camera custom cards
 * Supports multiple card types:
 * - custom:surveillance-card - Multi-camera surveillance view
 * - custom:frigate-card - Frigate NVR integration
 * - custom:camera-card - Enhanced camera with PTZ controls
 * - custom:webrtc-camera - Low-latency WebRTC streaming
 *
 * Note: This is a placeholder renderer. Actual camera streams
 * are only visible in Home Assistant.
 */
export const SurveillanceCardRenderer: React.FC<SurveillanceCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();

  // Extract configuration based on card type
  const cardType = card.type;
  const cameras = (card as any).cameras || [];
  const entity = card.entity ? getEntity(card.entity) : null;
  const url = (card as any).url;

  // Determine card-specific properties
  const getCardName = () => {
    switch (cardType) {
      case 'custom:surveillance-card':
        return 'Surveillance Card';
      case 'custom:frigate-card':
        return 'Frigate Card';
      case 'custom:camera-card':
        return 'Camera Card';
      case 'custom:webrtc-camera':
        return 'WebRTC Camera';
      default:
        return 'Camera Card';
    }
  };

  const getDescription = () => {
    switch (cardType) {
      case 'custom:surveillance-card':
        return `Multi-camera view • ${cameras.length || 0} camera${cameras.length !== 1 ? 's' : ''}`;
      case 'custom:frigate-card':
        return `Frigate NVR integration${cameras.length > 0 ? ` • ${cameras.length} camera${cameras.length !== 1 ? 's' : ''}` : ''}`;
      case 'custom:camera-card':
        return entity ? `Camera: ${entity.entity_id}` : 'Camera with PTZ controls';
      case 'custom:webrtc-camera':
        return url ? 'WebRTC stream (low latency)' : 'WebRTC camera';
      default:
        return 'Camera feed';
    }
  };

  const cardName = getCardName();
  const description = getDescription();

  // Get camera entity or first camera from array
  const cameraEntity = entity || (cameras.length > 0 ? getEntity(cameras[0].entity || cameras[0]) : null);
  const cameraName = cameraEntity?.attributes?.friendly_name || card.entity || cameras[0]?.name || 'Camera';

  return (
    <div
      style={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
    >
      <AntCard
        bordered
        style={{
          height: '100%',
          border: isSelected ? '2px solid #1890ff' : '1px solid #434343',
          backgroundColor: '#1a1a1a',
          boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.3)' : 'none',
        }}
        bodyStyle={{
          padding: '12px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <VideoCameraOutlined style={{ fontSize: '20px', color: '#f5222d' }} />
          <Text strong style={{ color: '#fff', fontSize: '14px' }}>
            {cardName}
          </Text>
        </div>

        {/* Camera Preview Placeholder */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            position: 'relative',
            minHeight: '100px',
          }}
        >
          {/* Camera Icon */}
          <VideoCameraOutlined
            style={{
              fontSize: '48px',
              color: '#333',
              marginBottom: '12px',
            }}
          />

          {/* Camera Name */}
          <Text strong style={{ color: '#fff', fontSize: '13px', marginBottom: '4px', textAlign: 'center' }}>
            {cameraName}
          </Text>

          {/* Live Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#52c41a',
                animation: 'pulse 2s infinite',
              }}
            />
            <Text style={{ color: '#52c41a', fontSize: '11px' }}>
              LIVE PREVIEW (in HA)
            </Text>
          </div>

          {/* WebRTC URL indicator */}
          {url && (
            <div style={{ marginTop: '8px' }}>
              <Text code style={{ fontSize: '10px', color: '#666' }}>
                {url.substring(0, 30)}{url.length > 30 ? '...' : ''}
              </Text>
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ marginTop: '12px' }}>
          <Text style={{ color: '#888', fontSize: '11px' }}>
            {description}
          </Text>
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
          <Text style={{ color: '#666', fontSize: '10px' }}>
            Camera stream visible only in Home Assistant
          </Text>
        </div>
      </AntCard>

      {/* Add pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  );
};
