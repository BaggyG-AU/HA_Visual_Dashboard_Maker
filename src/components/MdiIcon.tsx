import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface MdiIconProps {
  icon?: string;
  color?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

export const MdiIcon: React.FC<MdiIconProps> = ({
  icon,
  color,
  size = 20,
  className,
  style,
  testId,
}) => {
  if (typeof icon === 'string' && icon.startsWith('mdi:')) {
    const mdiClass = icon.replace('mdi:', 'mdi-');
    return (
      <span
        className={`mdi ${mdiClass}${className ? ` ${className}` : ''}`}
        style={{ fontSize: size, color, lineHeight: 1, ...style }}
        data-testid={testId}
        aria-hidden="true"
      />
    );
  }

  return (
    <QuestionCircleOutlined
      style={{ fontSize: size, color: color || '#888', ...style }}
      data-testid={testId}
    />
  );
};

export default MdiIcon;
