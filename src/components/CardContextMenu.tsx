import React from 'react';
import { Dropdown, MenuProps } from 'antd';
import { CopyOutlined, ScissorOutlined, SnippetsOutlined, DeleteOutlined } from '@ant-design/icons';

interface CardContextMenuProps {
  children: React.ReactElement;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  canPaste: boolean;
  /**
   * Called when the menu OPENS, before any item is chosen.
   *
   * ⚠⚠ This exists because selecting the card inside the item handlers does not
   * work. The canvases used to do `onCardSelect(index); onCardDelete();` in one
   * handler — but the action handlers in App.tsx read the selection from the
   * CURRENT render, and a selection set moments earlier in the same tick has not
   * been committed yet. So right-clicking a card that was not already selected
   * and choosing Delete either targeted the previously-selected card or bailed
   * with "No card selected".
   *
   * Selecting on OPEN gives React a render before any item can be clicked, and it
   * is the better behaviour anyway: UAT card CANVAS-06 expects "Delete removes
   * only the card you right-clicked", which means right-click has to target it
   * visibly.
   */
  onOpen?: () => void;
}

export const CardContextMenu: React.FC<CardContextMenuProps> = ({
  children,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  canPaste,
  onOpen,
}) => {
  const items: MenuProps['items'] = [
    {
      key: 'cut',
      label: 'Cut',
      icon: <ScissorOutlined />,
      onClick: onCut,
    },
    {
      key: 'copy',
      label: 'Copy',
      icon: <CopyOutlined />,
      onClick: onCopy,
    },
    {
      key: 'paste',
      label: 'Paste',
      icon: <SnippetsOutlined />,
      onClick: onPaste,
      disabled: !canPaste,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['contextMenu']}
      onOpenChange={(open) => {
        if (open) onOpen?.();
      }}
    >
      {children}
    </Dropdown>
  );
};
