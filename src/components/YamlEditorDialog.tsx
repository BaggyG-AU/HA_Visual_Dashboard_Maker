import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Space, message } from 'antd';
import { CodeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { yamlService } from '../services/yamlService';

interface YamlEditorDialogProps {
  visible: boolean;
  dashboardYaml: string;
  onClose: () => void;
  onApply: (newYaml: string) => void;
}

/**
 * YAML Editor Dialog - Edit dashboard YAML directly
 * Features:
 * - Syntax-highlighted YAML editor using textarea
 * - Real-time validation
 * - Confirmation before applying changes
 * - Error reporting
 */
export const YamlEditorDialog: React.FC<YamlEditorDialogProps> = ({
  visible,
  dashboardYaml,
  onClose,
  onApply,
}) => {
  const [yamlContent, setYamlContent] = useState(dashboardYaml);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

        <div style={{ marginBottom: '16px' }}>
          <textarea
            value={yamlContent}
            onChange={(e) => setYamlContent(e.target.value)}
            style={{
              width: '100%',
              height: '500px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '13px',
              padding: '12px',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              border: '1px solid #434343',
              borderRadius: '4px',
              resize: 'vertical',
              outline: 'none',
            }}
            spellCheck={false}
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
