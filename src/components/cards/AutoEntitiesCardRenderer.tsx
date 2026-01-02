import React from 'react';
import { Card as AntCard, Typography, Tag } from 'antd';
import { ThunderboltOutlined, FilterOutlined } from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';

const { Text } = Typography;

interface AutoEntitiesCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Auto-entities (custom HACS card)
 * Repository: https://github.com/thomasloven/lovelace-auto-entities
 *
 * Auto-entities automatically populates entity lists based on filters.
 * Supports:
 * - `filter` property with include/exclude rules
 * - `card` property specifying the wrapped card type
 * - `sort` property for entity ordering
 * - `show_empty` property to control empty state
 *
 * Note: This renderer shows a preview of filter configuration.
 * Actual entity filtering happens in Home Assistant.
 */
export const AutoEntitiesCardRenderer: React.FC<AutoEntitiesCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  // Extract auto-entities configuration
  const filter = (card as any).filter || {};
  const wrappedCard = (card as any).card || { type: 'entities' };
  const sort = (card as any).sort;
  const showEmpty = (card as any).show_empty;

  // Count filter rules
  const includeRules = filter.include?.length || 0;
  const excludeRules = filter.exclude?.length || 0;
  const totalRules = includeRules + excludeRules;

  // Get filter preview
  const getFilterPreview = () => {
    const previews: string[] = [];

    if (filter.include && Array.isArray(filter.include)) {
      filter.include.slice(0, 2).forEach((rule: any) => {
        if (rule.domain) {
          previews.push(`Include: ${rule.domain}.*`);
        } else if (rule.entity_id) {
          previews.push(`Include: ${rule.entity_id}`);
        } else if (rule.state) {
          previews.push(`Include: state=${rule.state}`);
        }
      });
    }

    if (filter.exclude && Array.isArray(filter.exclude)) {
      filter.exclude.slice(0, 2).forEach((rule: any) => {
        if (rule.domain) {
          previews.push(`Exclude: ${rule.domain}.*`);
        } else if (rule.entity_id) {
          previews.push(`Exclude: ${rule.entity_id}`);
        } else if (rule.state) {
          previews.push(`Exclude: state=${rule.state}`);
        }
      });
    }

    return previews;
  };

  const filterPreviews = getFilterPreview();
  const hasFilters = totalRules > 0;

  return (
    <div
      style={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
    >
      <AntCard
        bordered
        style={{
          height: '100%',
          border: isSelected ? '2px solid #1890ff' : '1px solid #434343',
          backgroundColor: '#1a1a1a',
          boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.3)' : 'none',
        }}
        bodyStyle={{
          padding: '12px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ThunderboltOutlined style={{ fontSize: '20px', color: '#faad14' }} />
          <Text strong style={{ color: '#fff', fontSize: '14px' }}>
            Auto Entities
          </Text>
        </div>

        {/* Wrapped Card Info */}
        <div style={{ marginBottom: '12px' }}>
          <Text style={{ color: '#888', fontSize: '12px' }}>
            Card Type: <Text code style={{ fontSize: '11px' }}>{wrappedCard.type || 'entities'}</Text>
          </Text>
        </div>

        {/* Filter Summary */}
        {hasFilters ? (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FilterOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
              <Text style={{ color: '#fff', fontSize: '12px' }}>Filters ({totalRules} rules)</Text>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {includeRules > 0 && (
                <Tag color="green" style={{ fontSize: '11px', margin: 0 }}>
                  +{includeRules} include
                </Tag>
              )}
              {excludeRules > 0 && (
                <Tag color="red" style={{ fontSize: '11px', margin: 0 }}>
                  -{excludeRules} exclude
                </Tag>
              )}
              {sort && (
                <Tag color="blue" style={{ fontSize: '11px', margin: 0 }}>
                  sorted
                </Tag>
              )}
            </div>
          </div>
        ) : null}

        {/* Filter Preview */}
        {filterPreviews.length > 0 ? (
          <div
            style={{
              flex: 1,
              backgroundColor: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '8px',
              overflow: 'auto',
            }}
          >
            {filterPreviews.map((preview, idx) => (
              <div key={idx} style={{ marginBottom: '4px' }}>
                <Text code style={{ color: '#52c41a', fontSize: '11px' }}>
                  {preview}
                </Text>
              </div>
            ))}
            {totalRules > filterPreviews.length && (
              <Text style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>
                ... and {totalRules - filterPreviews.length} more rule{totalRules - filterPreviews.length > 1 ? 's' : ''}
              </Text>
            )}
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '12px',
              fontStyle: 'italic',
            }}
          >
            No filters configured
          </div>
        )}

        {/* Footer Note */}
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #333' }}>
          <Text style={{ color: '#666', fontSize: '10px' }}>
            Auto-populates entities based on filters {showEmpty !== false ? '• Shows when empty' : ''}
          </Text>
        </div>
      </AntCard>
    </div>
  );
};
