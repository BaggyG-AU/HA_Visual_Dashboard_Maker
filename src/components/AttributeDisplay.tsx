import React from 'react';
import { Typography } from 'antd';
import type { AttributeDisplayItem, AttributeDisplayLayout } from '../types/attributeDisplay';
import { formatAttributeValue } from '../services/attributeFormatter';

const { Text } = Typography;

interface AttributeDisplayProps {
  attributes: Record<string, unknown>;
  items?: AttributeDisplayItem[];
  layout?: AttributeDisplayLayout;
  testIdPrefix?: string;
  emptyLabel?: string;
}

const renderInline = (
  entries: Array<{ key: string; label: string; value: string }>,
  testIdPrefix: string,
) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }} data-testid={`${testIdPrefix}-inline`}>
    {entries.map((entry) => (
      <Text
        key={entry.key}
        style={{ color: '#9e9e9e', fontSize: '12px' }}
        data-testid={`${testIdPrefix}-item-${entry.key}`}
      >
        {entry.label}: {entry.value}
      </Text>
    ))}
  </div>
);

const renderStacked = (
  entries: Array<{ key: string; label: string; value: string }>,
  testIdPrefix: string,
) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} data-testid={`${testIdPrefix}-stacked`}>
    {entries.map((entry) => (
      <div key={entry.key} data-testid={`${testIdPrefix}-item-${entry.key}`}>
        <Text style={{ color: '#9e9e9e', fontSize: '12px' }}>{entry.label}:</Text>{' '}
        <Text style={{ color: '#cfcfcf', fontSize: '12px' }}>{entry.value}</Text>
      </div>
    ))}
  </div>
);

const renderTable = (
  entries: Array<{ key: string; label: string; value: string }>,
  testIdPrefix: string,
) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }} data-testid={`${testIdPrefix}-table`}>
    <tbody>
      {entries.map((entry) => (
        <tr key={entry.key} data-testid={`${testIdPrefix}-item-${entry.key}`}>
          <td style={{ paddingRight: '8px', color: '#9e9e9e', fontSize: '12px', whiteSpace: 'nowrap' }}>
            {entry.label}
          </td>
          <td style={{ color: '#cfcfcf', fontSize: '12px', textAlign: 'right' }}>
            {entry.value}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const AttributeDisplay: React.FC<AttributeDisplayProps> = ({
  attributes,
  items,
  layout = 'stacked',
  testIdPrefix = 'attribute-display',
  emptyLabel = 'N/A',
}) => {
  if (!items || items.length === 0) return null;

  const entries = items.map((item) => {
    const rawValue = attributes?.[item.attribute];
    const value = formatAttributeValue(rawValue, item.format);
    return {
      key: item.attribute,
      label: item.label || item.attribute,
      value: value.length > 0 ? value : emptyLabel,
    };
  });

  if (layout === 'inline') {
    return renderInline(entries, testIdPrefix);
  }
  if (layout === 'table') {
    return renderTable(entries, testIdPrefix);
  }
  return renderStacked(entries, testIdPrefix);
};
