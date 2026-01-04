import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Space, Tooltip, message } from 'antd';
import { CheckOutlined, RollbackOutlined, SyncOutlined } from '@ant-design/icons';
// eslint-disable-next-line import/namespace
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { GridCanvas } from './GridCanvas';
import { YamlEditor } from './YamlEditor';
import { yamlService } from '../services/yamlService';
import { useEditorModeStore } from '../store/editorModeStore';
import { useDashboardStore } from '../store/dashboardStore';

interface SplitViewEditorProps {
  /** Current selected view index */
  selectedViewIndex: number | null;

  /** Current selected card index */
  selectedCardIndex: number | null;

  /** Card selection callback */
  onCardSelect: (cardIndex: number) => void;

  /** Layout change callback (from visual canvas) */
  onLayoutChange: (layout: unknown[]) => void;

  /** Card drop callback */
  onCardDrop: (cardType: string, x: number, y: number) => void;

  /** Card operations */
  onCardCut: () => void;
  onCardCopy: () => void;
  onCardPaste: () => void;
  onCardDelete: () => void;

  /** Whether paste is available */
  canPaste: boolean;
}

/**
 * Split View Editor Component
 *
 * Provides a side-by-side view with:
 * - Left pane: Visual canvas (GridCanvas)
 * - Right pane: YAML code editor
 * - Two-way sync with validation
 * - Card selection → YAML jump
 * - Hybrid sync: real-time validation, explicit apply
 */
export const SplitViewEditor: React.FC<SplitViewEditorProps> = ({
  selectedViewIndex,
  selectedCardIndex,
  onCardSelect,
  onLayoutChange,
  onCardDrop,
  onCardCut,
  onCardCopy,
  onCardPaste,
  onCardDelete,
  canPaste,
}) => {
  const {
    config,
    updateConfig,
  } = useDashboardStore();

  const {
    syncStatus,
    setSyncStatus,
    pendingYaml,
    setPendingYaml,
    validationError,
    setValidationError,
    lastValidYaml,
    setLastValidYaml,
    setLastValidConfig,
    selectedCardForYamlJump,
    setSelectedCardForYamlJump,
    rollbackToLastValid,
    clearPending,
  } = useEditorModeStore();

  const [yamlContent, setYamlContent] = useState('');
  const [isYamlValid, setIsYamlValid] = useState(true);

  // Initialize YAML content from config
  useEffect(() => {
    if (config) {
      const yaml = yamlService.serializeDashboard(config);
      setYamlContent(yaml);
      setLastValidYaml(yaml);
      setLastValidConfig(config);
      setSyncStatus('synced');
    }
  }, []); // Only on mount

  // Visual → YAML sync (immediate when config changes)
  useEffect(() => {
    if (!config) return;

    // Skip if we're waiting for YAML → Visual apply
    if (syncStatus === 'pending-code') return;

    const newYaml = yamlService.serializeDashboard(config);

    // Only update if actually different
    if (newYaml !== yamlContent) {
      setYamlContent(newYaml);
      setLastValidYaml(newYaml);
      setLastValidConfig(config);
      setSyncStatus('synced');
    }
  }, [config]);

  // Handle YAML changes from editor
  const handleYamlChange = useCallback((newYaml: string) => {
    setYamlContent(newYaml);
    setPendingYaml(newYaml);

    // Mark as pending until applied
    if (newYaml !== lastValidYaml) {
      setSyncStatus('pending-code');
    } else {
      setSyncStatus('synced');
      setPendingYaml(null);
    }
  }, [lastValidYaml, setPendingYaml, setSyncStatus]);

  // Handle validation changes
  const handleValidationChange = useCallback((isValid: boolean, error: string | null) => {
    setIsYamlValid(isValid);
    setValidationError(error);

    if (!isValid) {
      setSyncStatus('error');
    } else if (pendingYaml && pendingYaml !== lastValidYaml) {
      setSyncStatus('pending-code');
    }
  }, [pendingYaml, lastValidYaml, setValidationError, setSyncStatus]);

  // Apply YAML changes to visual view
  const handleApplyYaml = useCallback(() => {
    if (!isYamlValid || validationError) {
      message.error('Cannot apply: YAML has validation errors');
      return;
    }

    if (!pendingYaml) {
      message.info('No pending changes to apply');
      return;
    }

    try {
      const result = yamlService.parseDashboard(pendingYaml);

      if (!result.success || !result.data) {
        message.error(`Failed to parse YAML: ${result.error}`);
        return;
      }

      // Update dashboard config
      updateConfig(result.data);

      // Update last valid state
      setLastValidYaml(pendingYaml);
      setLastValidConfig(result.data);

      // Clear pending
      clearPending();

      message.success('YAML changes applied to visual view!');
    } catch (error) {
      message.error(`Failed to apply YAML: ${(error as Error).message}`);
    }
  }, [isYamlValid, validationError, pendingYaml, updateConfig, setLastValidYaml, setLastValidConfig, clearPending]);

  // Rollback YAML to last valid state
  const handleRollback = useCallback(() => {
    const { yaml } = rollbackToLastValid();

    if (yaml) {
      setYamlContent(yaml);
      message.info('Rolled back to last valid YAML');
    }
  }, [rollbackToLastValid]);

  // Sync YAML from visual (manual)
  const handleSyncFromVisual = useCallback(() => {
    if (!config) return;

    const newYaml = yamlService.serializeDashboard(config);
    setYamlContent(newYaml);
    setLastValidYaml(newYaml);
    setLastValidConfig(config);
    clearPending();

    message.success('YAML synced from visual view!');
  }, [config, setLastValidYaml, setLastValidConfig, clearPending]);

  // Card selection → YAML jump
  useEffect(() => {
    if (selectedViewIndex !== null && selectedCardIndex !== null) {
      setSelectedCardForYamlJump({ viewIndex: selectedViewIndex, cardIndex: selectedCardIndex });
    } else {
      setSelectedCardForYamlJump(null);
    }
  }, [selectedViewIndex, selectedCardIndex, setSelectedCardForYamlJump]);

  if (!config || selectedViewIndex === null) {
    return (
      <div style={{ padding: '24px', color: '#888' }}>
        <Alert
          title="No Dashboard Loaded"
          description="Please load or create a dashboard to use split view mode."
          type="info"
          showIcon
        />
      </div>
    );
  }

  const currentView = config.views[selectedViewIndex];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sync Status Bar */}
      <div style={{
        padding: '8px 16px',
        background: '#1f1f1f',
        borderBottom: '1px solid #434343',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Space>
          {syncStatus === 'synced' && (
            <span style={{ color: '#52c41a', fontSize: '12px' }}>
              <CheckOutlined /> Synced
            </span>
          )}
          {syncStatus === 'pending-code' && (
            <span style={{ color: '#faad14', fontSize: '12px' }}>
              <SyncOutlined spin /> Pending YAML Changes
            </span>
          )}
          {syncStatus === 'pending-visual' && (
            <span style={{ color: '#faad14', fontSize: '12px' }}>
              <SyncOutlined spin /> Pending Visual Changes
            </span>
          )}
          {syncStatus === 'error' && (
            <span style={{ color: '#ff4d4f', fontSize: '12px' }}>
              ⚠️ Validation Error
            </span>
          )}
        </Space>

        <Space>
          <Tooltip title="Apply YAML changes to visual view">
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApplyYaml}
              disabled={syncStatus !== 'pending-code' || !isYamlValid}
            >
              Apply YAML
            </Button>
          </Tooltip>

          <Tooltip title="Revert YAML to last valid state">
            <Button
              size="small"
              icon={<RollbackOutlined />}
              onClick={handleRollback}
              disabled={syncStatus === 'synced'}
            >
              Rollback
            </Button>
          </Tooltip>

          <Tooltip title="Sync YAML from current visual state">
            <Button
              size="small"
              icon={<SyncOutlined />}
              onClick={handleSyncFromVisual}
            >
              Sync from Visual
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Error Banner */}
      {validationError && (
        <Alert
          title="YAML Validation Error"
          description={`${validationError}. Visual view showing last known good state.`}
          type="error"
          showIcon
          closable
          onClose={() => setValidationError(null)}
          style={{ margin: '8px 16px 0' }}
        />
      )}

      {/* Split View */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Allotment defaultSizes={[60, 40]}>
          {/* Left Pane: Visual Canvas */}
          <Allotment.Pane minSize={400}>
            <div style={{ height: '100%', overflow: 'auto', padding: '16px', background: '#141414' }}>
              <GridCanvas
                view={currentView}
                selectedCardIndex={selectedCardIndex}
                onCardSelect={onCardSelect}
                onLayoutChange={onLayoutChange}
                onCardDrop={onCardDrop}
                onCardCut={onCardCut}
                onCardCopy={onCardCopy}
                onCardPaste={onCardPaste}
                onCardDelete={onCardDelete}
                canPaste={canPaste}
              />
            </div>
          </Allotment.Pane>

          {/* Right Pane: YAML Editor */}
          <Allotment.Pane minSize={400}>
            <div style={{ height: '100%', overflow: 'auto', padding: '16px', background: '#0d0d0d' }}>
              <YamlEditor
                value={yamlContent}
                onChange={handleYamlChange}
                onValidationChange={handleValidationChange}
                height="calc(100vh - 250px)"
                showValidationAlerts={true}
                showFormattingControls={true}
                debounceDelay={300}
                jumpToCard={selectedCardForYamlJump}
              />
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};
