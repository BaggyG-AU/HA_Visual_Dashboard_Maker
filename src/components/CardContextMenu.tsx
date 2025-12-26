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
}

export const CardContextMenu: React.FC<CardContextMenuProps> = ({
  children,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  canPaste,
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
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
      {children}
    </Dropdown>
  );
};
