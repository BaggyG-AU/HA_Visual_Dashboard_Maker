import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Alert, Space, message } from 'antd';
import { CodeOutlined, CheckOutlined, DatabaseOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { yamlService } from '../services/yamlService';

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
  const monacoEditorRef = useRef<any>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (visible) {
      setYamlContent(dashboardYaml);
      setHasChanges(false);
      setValidationError(null);
      setShowConfirmation(false);
    }
  }, [visible, dashboardYaml]);

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
      yamlService.parseDashboard(yaml);
      setValidationError(null);
    } catch (error) {
      setValidationError((error as Error).message);
    }
  };

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
        title={
          <Space>
            <CodeOutlined />
            <span>Edit Dashboard YAML</span>
          </Space>
        }
        open={visible}
        onCancel={handleClose}
        width={1000}
        style={{ top: 20 }}
        footer={[
          <Button
            key="insertEntity"
            icon={<DatabaseOutlined />}
            onClick={handleOpenEntityBrowserClick}
            disabled={!onOpenEntityBrowser}
          >
            Insert Entity
          </Button>,
          <Button key="close" onClick={handleClose}>
            Cancel
          </Button>,
          <Button
            key="apply"
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleApply}
            disabled={!hasChanges || validationError !== null}
          >
            Apply Changes
          </Button>,
        ]}
      >
        <Alert
          message="Edit YAML Directly"
          description="Make changes to your dashboard YAML below. Changes will be validated in real-time. Click 'Apply Changes' to update the visual canvas."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        {validationError && (
          <Alert
            message="YAML Validation Error"
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
            message="Valid YAML"
            description="Your changes are valid and ready to apply."
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <div style={{ marginBottom: '16px', border: '1px solid #434343', borderRadius: '4px' }}>
          <Editor
            height="500px"
            language="yaml"
            theme="vs-dark"
            value={yamlContent}
            onChange={(value) => setYamlContent(value || '')}
            onMount={(editor) => {
              monacoEditorRef.current = editor;
            }}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
            }}
          />
        </div>

        <div style={{ color: '#888', fontSize: '12px' }}>
          <strong>Tip:</strong> Use proper YAML indentation (2 spaces). The editor will validate
          your changes in real-time.
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
