import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Modal, Tooltip } from 'antd';
import { EditOutlined, DeploymentUnitOutlined, CloseOutlined } from '@ant-design/icons';
import GridLayout, { Layout } from 'react-grid-layout';
import { View } from '../types/dashboard';
import { generateMasonryLayout, getCardSizeConstraints } from '../utils/cardSizingContract';
import { isLayoutCardGrid, convertLayoutCardToGridLayout } from '../utils/layoutCardParser';
import { logger } from '../services/logger';
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

    // Mode 1: Check if using layout-card grid system (view_layout)
    const usingLayoutCard = isLayoutCardGrid(view);

    if (usingLayoutCard) {
      // Use convertLayoutCardToGridLayout to parse view_layout
      const gridLayout = convertLayoutCardToGridLayout(view);
      setLayout(gridLayout);
      return;
    }

    // Mode 2: Check if cards have internal layout property (from user's manual resizing)
    const hasExistingLayout = cards.some(card => 'layout' in card && card.layout);

    if (hasExistingLayout) {
      // Use existing layout information from cards
      const existingLayout = cards.map((card, index) => {
        if ('layout' in card && card.layout) {
          const layout = card.layout as any;
          const constraints = getCardSizeConstraints(card);
          return {
            i: `card-${index}`,
            x: layout.x ?? 0,
            y: layout.y ?? 0,
            w: layout.w ?? constraints.w,
            h: layout.h ?? constraints.h,
            minW: constraints.minW,
            maxW: constraints.maxW,
            minH: constraints.minH,
            maxH: constraints.maxH,
          };
        }
        // Fallback for cards without layout
        const constraints = getCardSizeConstraints(card);
        return {
          i: `card-${index}`,
          x: 0,
          y: index * 4,
          w: constraints.w,
          h: constraints.h,
          minW: constraints.minW,
          maxW: constraints.maxW,
          minH: constraints.minH,
          maxH: constraints.maxH,
        };
      });
      setLayout(existingLayout);
    } else {
      // Mode 3: No existing layout, generate fresh masonry layout
      const generatedLayout = generateMasonryLayout(cards);
      setLayout(generatedLayout);
    }
  }, [view]);

  // Construct iframe URL with kiosk mode
  const iframeUrl = tempDashboardPath
    ? `${haUrl}/${tempDashboardPath}?kiosk`
    : `${haUrl}/lovelace/0?kiosk`;

  const handleLayoutChange = async (newLayout: Layout[]) => {
    setLayout(newLayout);
    onLayoutChange(newLayout);

    // Update temp dashboard in HA with new layout
    if (tempDashboardPath) {
      try {
        // Check WebSocket connection via IPC
        const wsStatus = await window.electronAPI.haWsIsConnected();
        if (!wsStatus.connected) {
          logger.warn('WebSocket not connected, skipping temp dashboard update');
          return;
        }

        // Convert layout back to view config
        // IMPORTANT: We need to preserve the internal layout property for persistence
        const updatedView = {
          ...view,
          cards: (view.cards || []).map((card, idx) => {
            const layoutItem = newLayout.find(l => l.i === `card-${idx}`);
            if (layoutItem) {
              return {
                ...card,
                layout: {
                  x: layoutItem.x,
                  y: layoutItem.y,
                  w: layoutItem.w,
                  h: layoutItem.h,
                },
                view_layout: {
                  grid_column: `${layoutItem.x + 1} / ${layoutItem.x + layoutItem.w + 1}`,
                  grid_row: `${layoutItem.y + 1} / ${layoutItem.y + layoutItem.h + 1}`,
                },
              } as any;
            }
            return card;
          }),
        };

        // Update temp dashboard via IPC
        const result = await window.electronAPI.haWsUpdateTempDashboard(tempDashboardPath, {
          title: view.title || 'Dashboard',
          views: [updatedView],
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to update temp dashboard');
        }

        // Reload iframe to show changes
        if (iframeRef.current && iframeRef.current.src) {
          const currentSrc = iframeRef.current.src;
          iframeRef.current.src = currentSrc;
        }
      } catch (error) {
        logger.error('Failed to update temp dashboard', error);
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
          <Tooltip title="Toggle between editing the layout and previewing the dashboard">
            <Button
              type={editMode ? 'primary' : 'default'}
              icon={<EditOutlined />}
              onClick={handleToggleMode}
            >
              {editMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
          </Tooltip>
          {editMode && (
            <div style={{ color: '#9e9e9e', fontSize: '12px', marginLeft: '8px' }}>
              Drag and resize cards to arrange your dashboard
            </div>
          )}
        </Space>
        <Space>
          <Tooltip title="Backup current dashboard and deploy your changes to production">
            <Button
              type="primary"
              icon={<DeploymentUnitOutlined />}
              onClick={handleDeploy}
              disabled={!tempDashboardPath}
            >
              Deploy to Production
            </Button>
          </Tooltip>
          <Tooltip title="Close live preview and return to dashboard editor">
            <Button
              icon={<CloseOutlined />}
              onClick={onClose}
            >
              Close
            </Button>
          </Tooltip>
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
        backgroundColor: '#0d0d0d',
      }}>
        {/* Background pattern to indicate preview mode */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        }} />

        {/* Info banner */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 500 }}>
            Live Preview Mode
          </div>
          <div>
            View live dashboard at:{' '}
            <a
              href={iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00d9ff', pointerEvents: 'auto' }}
            >
              {iframeUrl.replace('?kiosk', '')}
            </a>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px' }}>
            Drag and resize cards below to arrange your dashboard
          </div>
        </div>

        {/* Transparent overlay for drag-drop editing */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'auto',
            padding: '16px',
            pointerEvents: editMode ? 'auto' : 'none',
            zIndex: 2,
          }}
        >
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={56}
            width={1200}
            onDragStop={handleLayoutChange}
            onResizeStop={handleLayoutChange}
            isDraggable={editMode}
            isResizable={editMode}
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
                    border: editMode ? '2px dashed rgba(0, 217, 255, 0.6)' : '1px solid rgba(0, 217, 255, 0.3)',
                    backgroundColor: editMode ? 'rgba(0, 217, 255, 0.08)' : 'rgba(0, 217, 255, 0.03)',
                    borderRadius: '12px',
                    cursor: editMode ? 'move' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00d9ff',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '8px',
                    textAlign: 'center',
                    backdropFilter: editMode ? 'blur(2px)' : 'none',
                    transition: 'all 0.2s ease',
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
      </div>
    </div>
  );
};
