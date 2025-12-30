import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Alert, Space, message, Tooltip } from 'antd';
import { CodeOutlined, CheckOutlined, DatabaseOutlined } from '@ant-design/icons';
import * as monaco from 'monaco-editor';
import { yamlService } from '../services/yamlService';

const isTestEnv =
  (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.E2E === '1')) ||
  (typeof window !== 'undefined' && (window as any).E2E);

interface YamlEditorDialogProps {
  visible: boolean;
  dashboardYaml: string;
  onClose: () => void;
  onApply: (newYaml: string) => void;
  onOpenEntityBrowser?: (insertCallback: (entityId: string) => void) => void;
}

/**
 * YAML Editor Dialog - Edit dashboard YAML directly
 * Features:
 * - Syntax-highlighted YAML editor using Monaco Editor
 * - Real-time validation
 * - Entity browser integration with cursor-aware insertion
 * - Confirmation before applying changes
 * - Error reporting
 */
export const YamlEditorDialog: React.FC<YamlEditorDialogProps> = ({
  visible,
  dashboardYaml,
  onClose,
  onApply,
  onOpenEntityBrowser,
}) => {
  const [yamlContent, setYamlContent] = useState(dashboardYaml);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  // Create Monaco editor when container is ready
  useEffect(() => {
    if (!editorContainerRef.current) return;

    // Create editor instance
    const editor = monaco.editor.create(editorContainerRef.current, {
      value: yamlContent,
      language: 'yaml',
      theme: 'vs-dark',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      lineNumbers: 'on',
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
    });

    monacoEditorRef.current = editor;

    // Expose Monaco handles for tests/E2E (and keep available in all builds for determinism)
    (window as any).monaco = monaco;
    (window as any).__monacoEditor = editor;
    (window as any).__monacoModel = editor.getModel();

    // Accessibility: add aria-label to Monaco textarea if present
    const domNode = editor.getDomNode();
    const textarea = domNode?.querySelector('textarea');
    if (textarea) {
      textarea.setAttribute('aria-label', 'YAML editor');
    }

    // Listen for content changes
    const disposable = editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      setYamlContent(value);
    });

    // Cleanup
    return () => {
      disposable.dispose();
      editor.dispose();
      monacoEditorRef.current = null;
      delete (window as any).__monacoEditor;
      delete (window as any).__monacoModel;
    };
  }, [visible]); // Re-create when dialog opens/closes

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (visible) {
      setYamlContent(dashboardYaml);
      setHasChanges(false);
      setValidationError(null);
      setShowConfirmation(false);
    }
  }, [visible, dashboardYaml]);

  // Update editor value when dashboardYaml prop changes
  useEffect(() => {
    if (monacoEditorRef.current && visible) {
      const currentValue = monacoEditorRef.current.getValue();
      if (currentValue !== dashboardYaml) {
        monacoEditorRef.current.setValue(dashboardYaml);
      }
    }
  }, [dashboardYaml, visible]);

  // Validate YAML whenever content changes
  useEffect(() => {
    if (yamlContent !== dashboardYaml) {
      setHasChanges(true);
      validateYaml(yamlContent);
    } else {
      setHasChanges(false);
      setValidationError(null);
    }
  }, [yamlContent, dashboardYaml]);

  const validateYaml = (yaml: string) => {
    try {
      // First check syntax
      const syntax = yamlService.validateYAMLSyntax(yaml);
      if (!syntax.valid) {
        setValidationError(syntax.error ?? 'Invalid YAML syntax');
        if (isTestEnv) {
          (window as any).__lastValidationError = syntax.error ?? 'Invalid YAML syntax';
        }
        return;
      }

      // Then check dashboard shape
      const result = yamlService.parseDashboard(yaml);
      if (!result.success) {
        setValidationError(result.error ?? 'Invalid YAML');
        if (isTestEnv) {
          (window as any).__lastValidationError = result.error ?? 'Invalid YAML';
        }
      } else {
        setValidationError(null);
        if (isTestEnv) {
          (window as any).__lastValidationError = null;
        }
      }
    } catch (error) {
      setValidationError((error as Error).message);
      if (isTestEnv) {
        (window as any).__lastValidationError = (error as Error).message;
      }
    }
  };

  // Test hook: allow Playwright to force validation of current editor value
  useEffect(() => {
    if (isTestEnv) {
      (window as any).__forceYamlValidation = () => {
        const value = monacoEditorRef.current?.getValue() ?? yamlContent;
        validateYaml(value);
      };

      return () => {
        delete (window as any).__forceYamlValidation;
      };
    }
  }, [yamlContent]);

  // Test hook: expose validation helpers (unconditionally for tests)
  useEffect(() => {
    (window as any).__forceYamlValidation = () => {
      const value = monacoEditorRef.current?.getValue() ?? yamlContent;
      validateYaml(value);
    };
    (window as any).__runYamlValidation = (yaml: string) => {
      validateYaml(yaml);
    };

    return () => {
      delete (window as any).__forceYamlValidation;
      delete (window as any).__runYamlValidation;
    };
  }, [yamlContent]);

  const handleApply = () => {
    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmApply = () => {
    if (validationError) {
      message.error('Cannot apply changes: YAML has validation errors');
      return;
    }

    onApply(yamlContent);
    setShowConfirmation(false);
    message.success('Dashboard updated from YAML!');
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleInsertEntity = (entityId: string) => {
    const editor = monacoEditorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const id = { major: 1, minor: 1 };
    const op = { identifier: id, range: selection, text: entityId, forceMoveMarkers: true };
    editor.executeEdits("insert-entity", [op]);
    editor.focus();

    message.success(`Inserted entity: ${entityId}`);
  };

  const handleOpenEntityBrowserClick = () => {
    if (onOpenEntityBrowser) {
      onOpenEntityBrowser(handleInsertEntity);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved YAML changes. Do you want to close without applying?',
        okText: 'Close Anyway',
        cancelText: 'Keep Editing',
        okButtonProps: { danger: true },
        onOk: () => onClose(),
      });
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal
        data-testid="yaml-editor-modal"
        title={
          <Space>
            <CodeOutlined />
            <span>Edit Dashboard YAML</span>
          </Space>
        }
        open={visible}
        forceRender
        onCancel={handleClose}
        width={1000}
        style={{ top: 20 }}
        footer={[
          <Tooltip key="insertEntity-tooltip" title="Open entity browser and insert selected entity ID at cursor position">
            <Button
              key="insertEntity"
              data-testid="yaml-insert-entity-button"
              icon={<DatabaseOutlined />}
              onClick={handleOpenEntityBrowserClick}
              disabled={!onOpenEntityBrowser}
            >
              Insert Entity
            </Button>
          </Tooltip>,
          <Button key="close" data-testid="yaml-cancel-button" onClick={handleClose}>
            Cancel
          </Button>,
          <Tooltip key="apply-tooltip" title="Apply YAML changes to update the dashboard">
            <Button
              key="apply"
              data-testid="yaml-apply-button"
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApply}
              disabled={!hasChanges || validationError !== null}
            >
              Apply Changes
            </Button>
          </Tooltip>,
        ]}
      >
        <div data-testid="yaml-editor-content">
          <Alert
            title="Edit YAML Directly"
            description="Make changes to your dashboard YAML below. Changes will be validated in real-time. Click 'Apply Changes' to update the visual canvas."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          {validationError && (
            <Alert
              data-testid="yaml-validation-error"
              title="YAML Validation Error"
              description={validationError}
              type="error"
              showIcon
              closable
              onClose={() => setValidationError(null)}
              style={{ marginBottom: '16px' }}
            />
          )}

          {hasChanges && !validationError && (
            <Alert
              data-testid="yaml-validation-success"
              title="Valid YAML"
              description="Your changes are valid and ready to apply."
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <div
            data-testid="yaml-editor-container"
            ref={editorContainerRef}
            style={{
              marginBottom: '16px',
              border: '1px solid #434343',
              borderRadius: '4px',
              height: '500px',
              overflow: 'hidden',
            }}
          />

          <div style={{ color: '#888', fontSize: '12px' }}>
            <strong>Tip:</strong> Use proper YAML indentation (2 spaces). The editor will validate
            your changes in real-time.
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        title="Apply YAML Changes?"
        open={showConfirmation}
        onOk={handleConfirmApply}
        onCancel={handleCancelConfirmation}
        okText="Apply & Reload Canvas"
        cancelText="Cancel"
        okButtonProps={{ type: 'primary', icon: <CheckOutlined /> }}
      >
        <Alert
          message="Confirm Changes"
          description="This will apply your YAML changes and reload the visual canvas. Any unsaved visual changes will be replaced by the YAML content."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <div style={{ color: '#888', fontSize: '13px' }}>
          <p>Make sure you've reviewed your YAML changes carefully.</p>
          <p style={{ marginBottom: 0 }}>
            The dashboard will be updated and you can continue editing visually or save to file.
          </p>
        </div>
      </Modal>
    </>
  );
};
