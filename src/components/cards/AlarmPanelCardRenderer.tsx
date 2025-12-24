import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { SafetyOutlined, LockOutlined, UnlockOutlined, WarningOutlined } from '@ant-design/icons';
import { AlarmPanelCard } from '../../types/dashboard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface AlarmPanelCardRendererProps {
  card: AlarmPanelCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Alarm Panel card type
 * Displays alarm control panel with arm/disarm buttons
 */
export const AlarmPanelCardRenderer: React.FC<AlarmPanelCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract alarm panel properties
  const state = entity?.state || 'unknown';
  const attributes = entity?.attributes || {};
  const codeFormat = attributes.code_format;
  const supportedFeatures = attributes.supported_features || 0;

  const displayName = card.name || attributes.friendly_name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Alarm';

  // Get alarm states to display (default to common states)
  const alarmStates = card.states || ['armed_home', 'armed_away', 'armed_night', 'disarmed'];

  // Determine state color and icon
  const getStateInfo = () => {
    switch (state.toLowerCase()) {
      case 'disarmed':
        return { color: '#4caf50', icon: <UnlockOutlined />, label: 'Disarmed' };
      case 'armed_home':
        return { color: '#ff9800', icon: <SafetyOutlined />, label: 'Armed Home' };
      case 'armed_away':
        return { color: '#f44336', icon: <LockOutlined />, label: 'Armed Away' };
      case 'armed_night':
        return { color: '#9c27b0', icon: <SafetyOutlined />, label: 'Armed Night' };
      case 'armed_custom_bypass':
        return { color: '#03a9f4', icon: <SafetyOutlined />, label: 'Armed Custom' };
      case 'pending':
        return { color: '#ffc107', icon: <WarningOutlined />, label: 'Pending' };
      case 'arming':
        return { color: '#ffc107', icon: <WarningOutlined />, label: 'Arming' };
      case 'disarming':
        return { color: '#ffc107', icon: <WarningOutlined />, label: 'Disarming' };
      case 'triggered':
        return { color: '#f44336', icon: <WarningOutlined />, label: 'Triggered' };
      default:
        return { color: '#666', icon: <SafetyOutlined />, label: 'Unknown' };
    }
  };

  const stateInfo = getStateInfo();

  // Get button info for each state
  const getButtonInfo = (alarmState: string) => {
    switch (alarmState) {
      case 'disarmed':
        return { icon: <UnlockOutlined />, label: 'Disarm', color: '#4caf50' };
      case 'armed_home':
        return { icon: <SafetyOutlined />, label: 'Home', color: '#ff9800' };
      case 'armed_away':
        return { icon: <LockOutlined />, label: 'Away', color: '#f44336' };
      case 'armed_night':
        return { icon: <SafetyOutlined />, label: 'Night', color: '#9c27b0' };
      case 'armed_custom_bypass':
        return { icon: <SafetyOutlined />, label: 'Custom', color: '#03a9f4' };
      default:
        return { icon: <SafetyOutlined />, label: alarmState.replace('armed_', '').replace(/_/g, ' '), color: '#666' };
    }
  };

  return (
    <AntCard
      size="small"
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
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
      {/* Header with name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {displayName}
        </Text>
      </div>

      {/* Current state display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: `${stateInfo.color}11`,
        border: `2px solid ${stateInfo.color}`,
        borderRadius: '12px',
        gap: '12px',
      }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: `${stateInfo.color}22`,
            border: `3px solid ${stateInfo.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: stateInfo.color,
            boxShadow: `0 0 20px ${stateInfo.color}33`,
          }}
        >
          {stateInfo.icon}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Text
            strong
            style={{
              color: stateInfo.color,
              fontSize: '18px',
              textTransform: 'capitalize',
            }}
          >
            {stateInfo.label}
          </Text>
          {(state === 'pending' || state === 'arming' || state === 'disarming') && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Please wait...
            </Text>
          )}
        </div>
      </div>

      {/* Arm/Disarm buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        marginTop: 'auto',
      }}>
        {alarmStates.map((alarmState) => {
          const buttonInfo = getButtonInfo(alarmState);
          const isActive = state === alarmState;

          return (
            <div
              key={alarmState}
              style={{
                padding: '12px',
                backgroundColor: isActive ? `${buttonInfo.color}22` : 'rgba(255, 255, 255, 0.05)',
                border: `2px solid ${isActive ? buttonInfo.color : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'not-allowed',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{
                fontSize: '24px',
                color: isActive ? buttonInfo.color : '#999',
              }}>
                {buttonInfo.icon}
              </div>
              <Text
                style={{
                  fontSize: '11px',
                  color: isActive ? buttonInfo.color : '#999',
                  textTransform: 'capitalize',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {buttonInfo.label}
              </Text>
            </div>
          );
        })}
      </div>

      {/* Code format indicator */}
      {codeFormat && (
        <div style={{
          textAlign: 'center',
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '6px',
        }}>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            Code format: {codeFormat}
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
          <SafetyOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
