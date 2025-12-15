import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { MarkdownCard } from '../../types/dashboard';

const { Text, Paragraph } = Typography;

interface MarkdownCardRendererProps {
  card: MarkdownCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Markdown card type
 * Displays markdown content (basic preview only)
 */
export const MarkdownCardRenderer: React.FC<MarkdownCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const title = card.title || 'Markdown';
  const content = card.content || '';

  // Simple markdown preview - strip markdown syntax for preview
  const previewContent = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .substring(0, 200);

  return (
    <AntCard
      size="small"
      title={
        card.title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined style={{ color: '#00d9ff' }} />
            <span style={{ fontSize: '14px' }}>{title}</span>
          </div>
        )
      }
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{
        padding: '12px',
        maxHeight: card.title ? 'calc(100% - 46px)' : '100%',
        overflowY: 'auto',
      }}
      onClick={onClick}
      hoverable
    >
      <Paragraph
        style={{
          color: '#b0b0b0',
          fontSize: '12px',
          lineHeight: '1.6',
          marginBottom: 0,
          whiteSpace: 'pre-wrap',
        }}
        ellipsis={{ rows: 8, expandable: false }}
      >
        {previewContent}
      </Paragraph>
      {content.length > 200 && (
        <Text type="secondary" style={{ fontSize: '10px', fontStyle: 'italic' }}>
          ... (preview)
        </Text>
      )}
    </AntCard>
  );
};
