import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Select, Space, Tooltip, message, theme } from 'antd';
import {
  CheckOutlined,
  DatabaseOutlined,
  PlusOutlined,
  RollbackOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type * as monaco from 'monaco-editor';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { GridCanvas } from './GridCanvas';
import type { Layout } from 'react-grid-layout';
import { YamlEditor } from './YamlEditor';
import { yamlService } from '../services/yamlService';
import { decideEntityInsertion, NO_CURSOR_REFUSAL } from '../utils/entityInsertion';
import { useEditorModeStore } from '../store/editorModeStore';
import { useDashboardStore } from '../store/dashboardStore';

interface SplitViewEditorProps {
  /** Current selected view index */
  selectedViewIndex: number | null;

  /** Current selected card index */
  selectedCardIndex: number | null;
  selectedCardIndices?: number[];

  /** Tier 4: section index for a sections-view card selection (null = flat) */
  selectedSectionIndex?: number | null;

  /** Card selection callback */
  onCardSelect: (
    cardIndex: number | null,
    options?: { mode?: 'replace' | 'toggle' | 'range'; sectionIndex?: number | null },
  ) => void;

  /** Layout change callback (from visual canvas) */
  onLayoutChange: (layout: Layout) => void;

  /** Card drop callback */
  onCardDrop: (cardType: string, x: number, y: number) => void;
  /** PROPS-06: forwarded to GridCanvas so a drop onto a container nests. */
  onCardDropIntoContainer?: (cardType: string, containerIndex: number) => void;

  /** Card operations */
  onCardCut: () => void;
  onCardCopy: () => void;
  onCardPaste: () => void;
  onCardDelete: () => void;

  /** Tier 4 slice 4.3b: sections-view drag-move + drag-resize */
  onSectionCardMove?: (
    from: { sectionIndex: number; cardIndex: number },
    to: { sectionIndex: number; cardIndex: number },
  ) => void;
  onSectionCardResize?: (
    address: { sectionIndex: number; cardIndex: number },
    gridOptions: { columns?: number; rows?: number },
  ) => void;

  /** Tier 4 slice 4.4: sections-view section-level authoring */
  onSectionAdd?: (atIndex?: number) => void;
  onSectionRemove?: (sectionIndex: number) => void;
  onSectionMove?: (fromIndex: number, toIndex: number) => void;
  onSectionTitleChange?: (sectionIndex: number, title: string) => void;
  onViewMaxColumnsChange?: (maxColumns: number) => void;

  /** Tier 4 slice 4.5: convert the current non-sections view to a sections view */
  onConvertToSections?: () => void;

  /** Tier 4 slice 4.6a: view-level authoring (split mode has no view tabs) */
  onAddView?: () => void;
  onOpenViewSettings?: () => void;

  /** Whether paste is available */
  canPaste: boolean;

  /**
   * YAML-05: open the entity browser and insert the chosen id at the cursor.
   *
   * Split view is a YAML-authoring surface exactly like the Edit YAML dialog and
   * the Properties panel's YAML tab, but it was the only one never wired to the
   * entity browser — so "Insert Entity" simply did not exist here. That is what
   * failed UAT card YAML-05: the tester was in Split view, and the control they
   * were told to press was on a different surface.
   */
  onOpenEntityBrowser?: (insertCallback: (entityId: string) => void) => void;
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
  selectedCardIndices = [],
  selectedSectionIndex = null,
  onCardSelect,
  onLayoutChange,
  onCardDrop,
  onCardDropIntoContainer,
  onCardCut,
  onCardCopy,
  onCardPaste,
  onCardDelete,
  onSectionCardMove,
  onSectionCardResize,
  onSectionAdd,
  onSectionRemove,
  onSectionMove,
  onSectionTitleChange,
  onViewMaxColumnsChange,
  onConvertToSections,
  onAddView,
  onOpenViewSettings,
  canPaste,
  onOpenEntityBrowser,
}) => {
  const { token } = theme.useToken();
  const { config, updateConfig, setSelectedView } = useDashboardStore();

  /** YAML-05: this pane's Monaco, for cursor-aware entity insertion. */
  const yamlEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  /** See `decideEntityInsertion` — a never-focused editor reports a phantom caret at (1,1). */
  const userPlacedCursorRef = useRef(false);
  const cursorFocusDisposableRef = useRef<monaco.IDisposable | null>(null);

  useEffect(() => {
    return () => {
      cursorFocusDisposableRef.current?.dispose();
      cursorFocusDisposableRef.current = null;
    };
  }, []);

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
  const handleYamlChange = useCallback(
    (newYaml: string) => {
      setYamlContent(newYaml);
      setPendingYaml(newYaml);

      // Mark as pending until applied
      if (newYaml !== lastValidYaml) {
        setSyncStatus('pending-code');
      } else {
        setSyncStatus('synced');
        setPendingYaml(null);
      }
    },
    [lastValidYaml, setPendingYaml, setSyncStatus],
  );

  // Handle validation changes
  const handleValidationChange = useCallback(
    (isValid: boolean, error: string | null) => {
      setIsYamlValid(isValid);
      setValidationError(error);

      if (!isValid) {
        setSyncStatus('error');
      } else if (pendingYaml && pendingYaml !== lastValidYaml) {
        setSyncStatus('pending-code');
      }
    },
    [pendingYaml, lastValidYaml, setValidationError, setSyncStatus],
  );

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
  }, [
    isYamlValid,
    validationError,
    pendingYaml,
    updateConfig,
    setLastValidYaml,
    setLastValidConfig,
    clearPending,
  ]);

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

  /**
   * YAML-05. Insert the browser's chosen entity id at the cursor in this pane.
   *
   * Deliberately identical in behaviour to the Edit YAML dialog and the
   * Properties panel: the shared `decideEntityInsertion` refuses when the user
   * has not placed a cursor, rather than falling back to Monaco's phantom (1,1)
   * caret and silently overwriting the first line.
   *
   * The edit goes through `executeEdits`, so `onDidChangeModelContent` fires and
   * `handleYamlChange` moves `syncStatus` to 'pending-code' — the insert behaves
   * like any other user edit and Apply YAML lights up. (YAML-04's echo guard
   * only suppresses writes this component makes from the `value` prop, so it
   * does not swallow this one.)
   */
  const handleInsertEntity = useCallback((entityId: string) => {
    const editor = yamlEditorRef.current;
    if (!editor) return;

    const decision = decideEntityInsertion(userPlacedCursorRef.current, editor.getSelection());
    if (!decision.allowed || !decision.range) {
      message.warning(decision.refusalReason ?? NO_CURSOR_REFUSAL);
      return;
    }

    const id = { major: 1, minor: 1 };
    const op = { identifier: id, range: decision.range, text: entityId, forceMoveMarkers: true };
    editor.executeEdits('insert-entity', [op]);
    editor.focus();

    message.success(`Inserted entity: ${entityId}`);
  }, []);

  const handleOpenEntityBrowserClick = useCallback(() => {
    if (onOpenEntityBrowser) {
      onOpenEntityBrowser(handleInsertEntity);
    }
  }, [onOpenEntityBrowser, handleInsertEntity]);

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
      <div style={{ padding: '24px', color: token.colorTextSecondary }}>
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
      <div
        style={{
          padding: '8px 16px',
          background: token.colorBgElevated,
          borderBottom: `1px solid ${token.colorBorder}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          {/* Split mode has no view tabs — a compact view switcher + manage
              controls (Tier 4 slice 4.6a). */}
          {config.views.length > 0 && (
            <Select
              size="small"
              value={selectedViewIndex ?? 0}
              onChange={(index) => setSelectedView(index)}
              style={{ minWidth: 140 }}
              data-testid="split-view-selector"
              options={config.views.map((view, index) => ({
                value: index,
                label: view.title || view.path || `View ${index + 1}`,
              }))}
            />
          )}
          <Tooltip title="Add a new view to this dashboard">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={onAddView}
              aria-label="Add view"
              data-testid="split-view-add-button"
            />
          </Tooltip>
          <Tooltip title="Edit this view's title, path, type and layout">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={onOpenViewSettings}
              disabled={selectedViewIndex === null}
              aria-label="Edit view"
              data-testid="split-view-settings-button"
            />
          </Tooltip>
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
            <span style={{ color: '#ff4d4f', fontSize: '12px' }}>⚠️ Validation Error</span>
          )}
        </Space>

        <Space>
          <Tooltip title="Open entity browser and insert the selected entity ID at the cursor">
            <Button
              size="small"
              data-testid="split-view-insert-entity-button"
              icon={<DatabaseOutlined />}
              onClick={handleOpenEntityBrowserClick}
              disabled={!onOpenEntityBrowser}
            >
              Insert Entity
            </Button>
          </Tooltip>

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
            <Button size="small" icon={<SyncOutlined />} onClick={handleSyncFromVisual}>
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
            <div
              style={{
                height: '100%',
                overflow: 'auto',
                padding: '16px',
                background: token.colorBgContainer,
              }}
            >
              <GridCanvas
                view={currentView}
                selectedCardIndex={selectedCardIndex}
                selectedCardIndices={selectedCardIndices}
                selectedSectionIndex={selectedSectionIndex}
                onCardSelect={onCardSelect}
                onLayoutChange={onLayoutChange}
                onCardDrop={onCardDrop}
                onCardDropIntoContainer={onCardDropIntoContainer}
                onCardCut={onCardCut}
                onCardCopy={onCardCopy}
                onCardPaste={onCardPaste}
                onCardDelete={onCardDelete}
                onSectionCardMove={onSectionCardMove}
                onSectionCardResize={onSectionCardResize}
                onSectionAdd={onSectionAdd}
                onSectionRemove={onSectionRemove}
                onSectionMove={onSectionMove}
                onSectionTitleChange={onSectionTitleChange}
                onViewMaxColumnsChange={onViewMaxColumnsChange}
                onConvertToSections={onConvertToSections}
                canPaste={canPaste}
              />
            </div>
          </Allotment.Pane>

          {/* Right Pane: YAML Editor */}
          <Allotment.Pane minSize={400}>
            <div
              style={{ height: '100%', overflow: 'auto', padding: '16px', background: '#0d0d0d' }}
            >
              <YamlEditor
                value={yamlContent}
                onChange={handleYamlChange}
                onValidationChange={handleValidationChange}
                onEditorReady={(editor) => {
                  yamlEditorRef.current = editor;
                  // A fresh editor has no cursor the user chose, even though
                  // Monaco will happily report one at (1,1).
                  userPlacedCursorRef.current = false;
                  cursorFocusDisposableRef.current?.dispose();
                  cursorFocusDisposableRef.current = editor.onDidFocusEditorText(() => {
                    userPlacedCursorRef.current = true;
                  });
                }}
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
