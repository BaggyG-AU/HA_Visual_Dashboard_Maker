import React from 'react';
import { Modal, Button, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * What the user chose when told they had unsaved work.
 *
 * ⭐ THREE outcomes, not two. `handleNewDashboard`'s original `Modal.confirm`
 * offered only "Create New" and "Cancel" — i.e. DISCARD or ABORT. It never
 * offered to SAVE, so the only way to keep your work was to notice the warning,
 * cancel, save by hand and start again. The round-2 FILE-04 report asked for the
 * third option explicitly: "a 'Do you want to save' dialogue should be displayed
 * to allow users to save. If user answers no, existing dashboard is discarded.
 * If yes then save or save as process is activated."
 */
export type UnsavedChangesOutcome = 'save' | 'discard' | 'cancel';

interface UnsavedChangesDialogProps {
  open: boolean;
  /**
   * What the user is about to do, phrased to follow "before" — e.g.
   * "opening another dashboard". Naming the action matters: this prompt can be
   * raised from File > Open, Open Recent and New Dashboard, and "your changes
   * will be lost" reads very differently depending on which.
   */
  actionLabel: string;
  /** True while a save raised from this dialog is still in flight. */
  saving: boolean;
  onRespond: (outcome: UnsavedChangesOutcome) => void;
}

/**
 * The shared "you have unsaved changes" gate for every path that REPLACES the
 * document on the canvas.
 *
 * ⚠ Deliberately a real `<Modal>` rather than `Modal.confirm`. A confirm renders
 * an ok/cancel PAIR, and bolting a third button onto its footer fights the
 * component; it also renders its title THREE times in the DOM
 * (`.ant-modal-title`, `.ant-modal-confirm-title`, and inside the content),
 * which has already cost this suite a strict-mode failure on a working feature.
 * Three explicit buttons with stable testids are both honest markup and a
 * locator that survives copy edits.
 */
export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  actionLabel,
  saving,
  onRespond,
}) => (
  <Modal
    open={open}
    title={
      <Space>
        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
        Unsaved Changes
      </Space>
    }
    // ⚠ Closing by mask or Esc must mean CANCEL, never "discard". An accidental
    // click outside a dialog is not consent to throw work away.
    onCancel={() => onRespond('cancel')}
    maskClosable={false}
    closable={!saving}
    footer={
      <Space>
        <Button
          data-testid="unsaved-changes-cancel"
          disabled={saving}
          onClick={() => onRespond('cancel')}
        >
          Cancel
        </Button>
        <Button
          data-testid="unsaved-changes-discard"
          danger
          disabled={saving}
          onClick={() => onRespond('discard')}
        >
          Don&apos;t Save
        </Button>
        <Button
          data-testid="unsaved-changes-save"
          type="primary"
          loading={saving}
          onClick={() => onRespond('save')}
        >
          Save
        </Button>
      </Space>
    }
  >
    {/*
      ⚠ The testid sits on this inner div, NOT on <Modal>. antd puts a Modal's
      data-* on `.ant-modal-root`, which Playwright always reports as hidden —
      a trap this repo has hit before.
    */}
    <div data-testid="unsaved-changes-dialog">
      You have unsaved changes to this dashboard. Do you want to save them before {actionLabel}?
    </div>
  </Modal>
);
