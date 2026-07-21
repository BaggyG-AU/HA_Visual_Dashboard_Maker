import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Modal, Tooltip, Segmented } from 'antd';
import { EditOutlined, DeploymentUnitOutlined, CloseOutlined } from '@ant-design/icons';
import GridLayout, { getCompactor } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { DashboardConfig, View } from '../types/dashboard';
import { generateMasonryLayout, getCardSizeConstraints } from '../utils/cardSizingContract';
import { isLayoutCardGrid, convertLayoutCardToGridLayout } from '../utils/layoutCardParser';
import { mergeEditedView } from '../services/livePreviewDeploy';
import { yamlService } from '../services/yamlService';
import { logger } from '../services/logger';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// See GridCanvas: must go through getCompactor(), not the bare compactor export.
const HA_COMPACTOR = getCompactor('vertical', false, false);

interface HADashboardIframeProps {
  /** The full dashboard config. Live Preview edits one view at a time but always
   *  preserves every view in the temp/deploy config (Phase 0.2). */
  config: DashboardConfig;
  /** Index of the view currently being edited in the drag overlay. */
  activeViewIndex: number;
  /** Switch which view the overlay edits (drives the iframe + overlay). */
  onActiveViewChange: (index: number) => void;
  haUrl: string;
  tempDashboardPath: string | null;
  /** Plain-language name of the deploy destination for the confirm prompt;
   *  null when the design was not opened from HA (deploy routes to DeployDialog). */
  deployTargetLabel: string | null;
  onLayoutChange: (layout: Layout) => void;
  onDeploy: () => void;
  onClose: () => void;
}

/**
 * HADashboardIframe Component
 *
 * Renders an iframe showing the actual Home Assistant dashboard with a transparent
 * drag-drop overlay for editing. Supports toggling between Edit and Preview modes,
 * and switching between the dashboard's views (multi-view editing).
 */
export const HADashboardIframe: React.FC<HADashboardIframeProps> = ({
  config,
  activeViewIndex,
  onActiveViewChange,
  haUrl,
  tempDashboardPath,
  deployTargetLabel,
  onLayoutChange,
  onDeploy,
  onClose,
}) => {
  const [editMode, setEditMode] = useState(true);
  const [layout, setLayout] = useState<Layout>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const views = config.views || [];
  const activeView: View | undefined = views[activeViewIndex];

  // Generate layout from the active view's cards
  useEffect(() => {
    const cards = activeView?.cards || [];

    // Mode 1: Check if using layout-card grid system (view_layout)
    const usingLayoutCard = activeView ? isLayoutCardGrid(activeView) : false;

    if (activeView && usingLayoutCard) {
      // Use convertLayoutCardToGridLayout to parse view_layout
      const gridLayout = convertLayoutCardToGridLayout(activeView);
      setLayout(gridLayout);
      return;
    }

    // Mode 2: Check if cards have internal geometry (_havdm_layout, from manual resizing)
    const hasExistingLayout = cards.some((card) => '_havdm_layout' in card && card._havdm_layout);

    if (hasExistingLayout) {
      // Use existing layout information from cards
      const existingLayout = cards.map((card, index) => {
        if ('_havdm_layout' in card && card._havdm_layout) {
          const cardLayout = card._havdm_layout as any;
          const constraints = getCardSizeConstraints(card);
          return {
            i: `card-${index}`,
            x: cardLayout.x ?? 0,
            y: cardLayout.y ?? 0,
            w: cardLayout.w ?? constraints.w,
            h: cardLayout.h ?? constraints.h,
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
  }, [config, activeViewIndex, activeView]);

  // Construct iframe URL with kiosk mode, pointing at the active view. HA routes
  // a view by its `path` when defined, otherwise by index.
  const viewSegment = activeView?.path ?? activeViewIndex;
  const iframeUrl = tempDashboardPath
    ? `${haUrl}/${tempDashboardPath}/${viewSegment}?kiosk`
    : `${haUrl}/lovelace/0?kiosk`;

  const handleLayoutChange = async (newLayout: Layout) => {
    setLayout(newLayout);
    onLayoutChange(newLayout);

    // Update temp dashboard in HA with new layout
    if (tempDashboardPath && activeView) {
      try {
        // Check WebSocket connection via IPC
        const wsStatus = await window.electronAPI.haWsIsConnected();
        if (!wsStatus.connected) {
          logger.warn('WebSocket not connected, skipping temp dashboard update');
          return;
        }

        // Apply the new grid geometry to the ACTIVE view's cards.
        // IMPORTANT: We need to preserve the internal layout property for persistence
        const updatedView: View = {
          ...activeView,
          cards: (activeView.cards || []).map((card, idx) => {
            const layoutItem = newLayout.find((l) => l.i === `card-${idx}`);
            if (layoutItem) {
              return {
                ...card,
                _havdm_layout: {
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

        // Merge the edited view back into the FULL config so EVERY other view is
        // preserved — the historical bug wrote `views: [updatedView]`, truncating
        // a multi-view dashboard on the first drag. Sanitise so the temp shows
        // what HA will actually render (B4 boundary).
        const mergedConfig = mergeEditedView(config, activeViewIndex, updatedView);
        const sanitized = yamlService.sanitizeForHA(mergedConfig);

        // Update temp dashboard via IPC
        const result = await window.electronAPI.haWsUpdateTempDashboard(tempDashboardPath, {
          ...sanitized,
          title: config.title || 'Dashboard',
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
    if (deployTargetLabel) {
      Modal.confirm({
        title: 'Deploy Dashboard',
        content: `This will back up ${deployTargetLabel} in Home Assistant, then deploy all ${views.length} view${views.length === 1 ? '' : 's'} of your design to it. Continue?`,
        okText: 'Deploy',
        okType: 'primary',
        cancelText: 'Cancel',
        onOk: onDeploy,
      });
    } else {
      // No known HA target — onDeploy hands off to the explicit DeployDialog.
      Modal.confirm({
        title: 'Deploy Dashboard',
        content:
          'This design was not opened from Home Assistant, so there is no dashboard to deploy back to. You will choose or create a target next.',
        okText: 'Choose target…',
        okType: 'primary',
        cancelText: 'Cancel',
        onOk: onDeploy,
      });
    }
  };

  const cards = activeView?.cards || [];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#141414',
      }}
    >
      {/* Control Bar */}
      <div
        style={{
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
          gap: '12px',
        }}
      >
        <Space wrap>
          <Tooltip title="Toggle between editing the layout and previewing the dashboard">
            <Button
              type={editMode ? 'primary' : 'default'}
              icon={<EditOutlined />}
              onClick={handleToggleMode}
            >
              {editMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
          </Tooltip>
          {views.length > 1 && (
            <Tooltip title="Switch which view you are editing — all views are deployed together">
              <Segmented
                value={activeViewIndex}
                onChange={(value) => onActiveViewChange(Number(value))}
                options={views.map((v, i) => ({
                  label: v.title || `View ${i + 1}`,
                  value: i,
                }))}
                data-testid="live-preview-view-switcher"
              />
            </Tooltip>
          )}
          {editMode && (
            <div style={{ color: '#9e9e9e', fontSize: '12px' }}>
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
            <Button icon={<CloseOutlined />} onClick={onClose}>
              Close
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          backgroundColor: '#0d0d0d',
        }}
      >
        {/* Background pattern to indicate preview mode */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
          }}
        />

        {/* Info banner */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
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
            width={1200}
            // Must match GridCanvas's GRID_CONFIG — this overlay sits on top of
            // the same canvas geometry. See the note there before changing these.
            gridConfig={{ cols: 12, rowHeight: 150, margin: [10, 10], containerPadding: null }}
            onDragStop={handleLayoutChange}
            onResizeStop={handleLayoutChange}
            dragConfig={{ enabled: editMode, threshold: 0 }}
            resizeConfig={{ enabled: editMode }}
            compactor={HA_COMPACTOR}
            style={{
              minHeight: '100%',
            }}
          >
            {cards.map((card, index) => (
              <div
                key={`card-${index}`}
                style={{
                  border: editMode
                    ? '2px dashed rgba(0, 217, 255, 0.6)'
                    : '1px solid rgba(0, 217, 255, 0.3)',
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
