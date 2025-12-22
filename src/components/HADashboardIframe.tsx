import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { EditOutlined, DeploymentUnitOutlined, CloseOutlined } from '@ant-design/icons';
import GridLayout, { Layout } from 'react-grid-layout';
import { View } from '../types/dashboard';
import { generateMasonryLayout, getCardSizeConstraints } from '../utils/cardSizingContract';
import { haWebSocketService } from '../services/haWebSocketService';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface HADashboardIframeProps {
  view: View;
  haUrl: string;
  tempDashboardPath: string | null;
  onLayoutChange: (layout: Layout[]) => void;
  onDeploy: () => void;
  onClose: () => void;
}

/**
 * HADashboardIframe Component
 *
 * Renders an iframe showing the actual Home Assistant dashboard with a transparent
 * drag-drop overlay for editing. Supports toggling between Edit and Preview modes.
 */
export const HADashboardIframe: React.FC<HADashboardIframeProps> = ({
  view,
  haUrl,
  tempDashboardPath,
  onLayoutChange,
  onDeploy,
  onClose,
}) => {
  const [editMode, setEditMode] = useState(true);
  const [layout, setLayout] = useState<Layout[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate layout from cards
  useEffect(() => {
    const cards = view.cards || [];
    const generatedLayout = generateMasonryLayout(cards);
    setLayout(generatedLayout);
  }, [view]);

  // Construct iframe URL with kiosk mode
  const iframeUrl = tempDashboardPath
    ? `${haUrl}/${tempDashboardPath}?kiosk`
    : `${haUrl}/lovelace/0?kiosk`;

  const handleLayoutChange = async (newLayout: Layout[]) => {
    setLayout(newLayout);
    onLayoutChange(newLayout);

    // Update temp dashboard in HA with new layout
    if (tempDashboardPath && haWebSocketService.isConnected()) {
      try {
        // Convert layout back to view config
        const updatedView = {
          ...view,
          cards: (view.cards || []).map((card, idx) => {
            const layoutItem = newLayout.find(l => l.i === `card-${idx}`);
            if (layoutItem) {
              return {
                ...card,
                view_layout: {
                  grid_column: `${layoutItem.x + 1} / ${layoutItem.x + layoutItem.w + 1}`,
                  grid_row: `${layoutItem.y + 1} / ${layoutItem.y + layoutItem.h + 1}`,
                },
              };
            }
            return card;
          }),
        };

        // Update temp dashboard
        await haWebSocketService.updateTempDashboard(tempDashboardPath, {
          title: view.title || 'Dashboard',
          views: [updatedView],
        });

        // Reload iframe to show changes
        if (iframeRef.current && iframeRef.current.src) {
          const currentSrc = iframeRef.current.src;
          iframeRef.current.src = currentSrc;
        }
      } catch (error) {
        console.error('Failed to update temp dashboard:', error);
        message.error('Failed to update dashboard preview');
      }
    }
  };

  const handleToggleMode = () => {
    setEditMode(!editMode);
  };

  const handleDeploy = () => {
    Modal.confirm({
      title: 'Deploy Dashboard',
      content: 'This will backup the current production dashboard and deploy your changes. Continue?',
      okText: 'Deploy',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: onDeploy,
    });
  };

  const cards = view.cards || [];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#141414',
    }}>
      {/* Control Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        padding: '12px 16px',
        borderBottom: '1px solid #434343',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Space>
          <Button
            type={editMode ? 'primary' : 'default'}
            icon={<EditOutlined />}
            onClick={handleToggleMode}
          >
            {editMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          {editMode && (
            <div style={{ color: '#9e9e9e', fontSize: '12px', marginLeft: '8px' }}>
              Drag and resize cards to arrange your dashboard
            </div>
          )}
        </Space>
        <Space>
          <Button
            type="primary"
            icon={<DeploymentUnitOutlined />}
            onClick={handleDeploy}
            disabled={!tempDashboardPath}
          >
            Deploy to Production
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={onClose}
          >
            Close
          </Button>
        </Space>
      </div>

      {/* Main Content Area */}
      <div style={{
        position: 'absolute',
        top: '60px',
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}>
        {/* Home Assistant iframe */}
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: editMode ? 'none' : 'auto',
          }}
          title="Home Assistant Dashboard"
        />

        {/* Transparent overlay for drag-drop editing */}
        {editMode && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'auto',
              padding: '16px',
              pointerEvents: 'auto',
            }}
          >
            <GridLayout
              className="layout"
              layout={layout}
              cols={12}
              rowHeight={56}
              width={1200}
              onLayoutChange={handleLayoutChange}
              onDragStop={handleLayoutChange}
              onResizeStop={handleLayoutChange}
              isDraggable={true}
              isResizable={true}
              compactType="vertical"
              preventCollision={false}
              allowOverlap={false}
              useCSSTransforms={true}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              style={{
                minHeight: '100%',
              }}
            >
              {cards.map((card, index) => (
                  <div
                    key={`card-${index}`}
                    style={{
                      border: '2px dashed rgba(0, 217, 255, 0.5)',
                      backgroundColor: 'rgba(0, 217, 255, 0.05)',
                      borderRadius: '12px',
                      cursor: 'move',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00d9ff',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '8px',
                      textAlign: 'center',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <div>
                      <div>{card.type}</div>
                      {card.title && (
                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                          {card.title}
                        </div>
                      )}
                    </div>
                  </div>
              ))}
            </GridLayout>
          </div>
        )}
      </div>

      {/* Loading indicator when no temp dashboard */}
      {!tempDashboardPath && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#9e9e9e',
          fontSize: '16px',
          textAlign: 'center',
        }}>
          <div>Loading dashboard...</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Creating temporary dashboard for editing
          </div>
        </div>
      )}
    </div>
  );
};
