import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { BlockOutlined } from '@ant-design/icons';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';

const { Text } = Typography;

export interface DeclutteringCardConfig {
  type: string;
  template?: string;
  /** HA accepts a list of single-key maps OR one map. Both are handled. */
  variables?: Array<Record<string, unknown>> | Record<string, unknown>;
  style?: string;
  [key: string]: unknown;
}

interface DeclutteringCardRendererProps {
  card: DeclutteringCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

/** Flatten `variables` into ordered name/value pairs, whichever form was used. */
const readVariables = (
  variables: DeclutteringCardConfig['variables'],
): Array<{ name: string; value: string }> => {
  const pairs: Array<{ name: string; value: string }> = [];
  const push = (source: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(source)) {
      pairs.push({
        name,
        value:
          value === null || value === undefined
            ? ''
            : typeof value === 'object'
              ? JSON.stringify(value)
              : String(value),
      });
    }
  };

  if (Array.isArray(variables)) {
    for (const entry of variables) {
      if (entry && typeof entry === 'object') push(entry as Record<string, unknown>);
    }
  } else if (variables && typeof variables === 'object') {
    push(variables as Record<string, unknown>);
  }
  return pairs;
};

/**
 * Visual renderer for `custom:decluttering-card` (HACS).
 *
 * ⚠⚠ WHAT THIS DELIBERATELY DOES NOT DO: expand the template. A decluttering
 * card is a REFERENCE — its real content lives in a `decluttering_templates:`
 * block at the top of the dashboard, and the card only supplies a name plus
 * variables to substitute. HAVDM does not resolve that block, so drawing a
 * guess at the expanded card would be inventing content the user never wrote.
 *
 * ⭐ So this shows exactly what the config actually says — which template, and
 * which variables with which values — following the precedent
 * `AutoEntitiesCardRenderer` already set for a card whose contents cannot be
 * resolved at design time. Naming the template is genuinely useful; a plausible
 * fake rendering of it would not be.
 *
 * ⓘ Resolving `decluttering_templates:` is a real future feature (the dashboard
 * model would have to carry the block through import), NOT a tweak here.
 */
export const DeclutteringCardRenderer: React.FC<DeclutteringCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const variables = readVariables(card.variables);
  const template = typeof card.template === 'string' ? card.template.trim() : '';

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

  return (
    <AntCard
      size="small"
      data-testid="ha-decluttering-card"
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 8,
          overflow: 'hidden',
        },
      }}
      onClick={onClick}
      hoverable
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BlockOutlined style={{ fontSize: 16, color: '#00d9ff' }} />
        <Text strong style={{ color: '#e6e6e6', fontSize: 13 }}>
          Decluttering template
        </Text>
      </div>

      <div
        data-testid="decluttering-template-name"
        style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: template ? '#00d9ff' : '#c8a93a',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 6,
          padding: '4px 8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {template || 'no template set'}
      </div>

      {variables.length > 0 && (
        <div
          data-testid="decluttering-variables"
          style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}
        >
          {variables.slice(0, 6).map((variable) => (
            <div
              key={variable.name}
              style={{ display: 'flex', gap: 6, fontSize: 11, minWidth: 0 }}
              data-testid={`decluttering-variable-${variable.name}`}
            >
              <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
                {variable.name}:
              </Text>
              <Text ellipsis style={{ color: '#d9d9d9', fontSize: 11, minWidth: 0 }}>
                {variable.value}
              </Text>
            </div>
          ))}
          {variables.length > 6 && (
            <Text type="secondary" style={{ fontSize: 10 }}>
              {`+${variables.length - 6} more`}
            </Text>
          )}
        </div>
      )}

      <Text type="secondary" style={{ fontSize: 10, marginTop: 'auto' }}>
        Template contents are defined on the dashboard, not on this card
      </Text>
    </AntCard>
  );
};
