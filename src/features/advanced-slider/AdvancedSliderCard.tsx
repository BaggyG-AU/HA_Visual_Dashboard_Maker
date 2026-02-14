import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card as AntCard, Empty, Slider, Typography } from 'antd';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { triggerHapticPattern } from '../../services/hapticService';
import { playSound } from '../../services/soundService';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import {
  normalizeAdvancedSliderConfig,
  resolveSliderUpdate,
  snapSliderValue,
} from './advancedSliderService';
import type { AdvancedSliderCardConfig } from './types';

const { Text } = Typography;

interface AdvancedSliderCardProps {
  card: AdvancedSliderCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const toSliderValue = (next: number | number[]): number => Array.isArray(next) ? next[0] : next;

export const AdvancedSliderCard: React.FC<AdvancedSliderCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;
  const rawState = entity?.state;
  const numericValue = typeof rawState === 'string' ? Number(rawState) : Number.NaN;
  const hasEntityValue = Number.isFinite(numericValue);

  const normalized = useMemo(
    () => normalizeAdvancedSliderConfig(card, hasEntityValue ? numericValue : null),
    [card, hasEntityValue, numericValue],
  );

  const [draftValue, setDraftValue] = useState<number>(normalized.value);
  const [committedValue, setCommittedValue] = useState<number>(normalized.value);
  const lastFeedbackValueRef = useRef<number>(normalized.value);

  useEffect(() => {
    setDraftValue(normalized.value);
    setCommittedValue(normalized.value);
    lastFeedbackValueRef.current = normalized.value;
  }, [normalized.value]);

  const emitFeedback = useCallback((value: number) => {
    if (value === lastFeedbackValueRef.current) return;
    lastFeedbackValueRef.current = value;

    if (card.haptic?.enabled) {
      const pattern = card.haptic.pattern || 'light';
      triggerHapticPattern(pattern, card.haptic);
    }

    if (card.sound?.enabled) {
      const effect = card.sound.effect || 'click';
      void playSound(effect, card.sound);
    }
  }, [card.haptic, card.sound]);

  const applyUpdate = useCallback((nextRaw: number, isRelease: boolean) => {
    const snapped = snapSliderValue(
      nextRaw,
      normalized.min,
      normalized.max,
      normalized.step,
      normalized.precision,
    );

    const resolved = resolveSliderUpdate(
      committedValue,
      snapped,
      normalized.commitOnRelease,
      isRelease,
    );

    setDraftValue(resolved.draftValue);

    if (resolved.shouldCommit) {
      setCommittedValue(resolved.committedValue);
      emitFeedback(resolved.committedValue);
    }
  }, [committedValue, emitFeedback, normalized.commitOnRelease, normalized.max, normalized.min, normalized.precision, normalized.step]);

  const handleSliderChange = useCallback((next: number | number[]) => {
    applyUpdate(toSliderValue(next), false);
  }, [applyUpdate]);

  const handleSliderChangeComplete = useCallback((next: number | number[]) => {
    applyUpdate(toSliderValue(next), true);
  }, [applyUpdate]);

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(79, 163, 255, 0.12)' : '#1f1f1f',
  );

  const title = card.name || entity?.attributes?.friendly_name || 'Advanced Slider';
  const activeColor = normalized.activeColor;
  const marks = useMemo(() => {
    return normalized.markers.reduce<Record<number, React.ReactNode>>((acc, marker) => {
      acc[marker.value] = (
        <span style={{ color: marker.color || '#9f9f9f', fontSize: 10 }}>
          {marker.label}
        </span>
      );
      return acc;
    }, {});
  }, [normalized.markers]);

  const sliderValue = normalized.commitOnRelease ? draftValue : committedValue;

  return (
    <AntCard
      size="small"
      title={title}
      data-testid="advanced-slider-card"
      onClick={onClick}
      hoverable
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #4fa3ff' : '1px solid #434343',
        transition: 'all 0.3s ease',
        ...backgroundStyle,
      }}
      styles={{
        header: {
          borderBottom: '1px solid #303030',
          color: '#e6e6e6',
        },
        body: {
          height: 'calc(100% - 48px)',
          display: 'flex',
          flexDirection: normalized.orientation === 'vertical' ? 'row' : 'column',
          gap: '12px',
          padding: '12px',
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
        <Text type="secondary" data-testid="advanced-slider-meta">
          {normalized.orientation} | range {normalized.min}..{normalized.max} | step {normalized.step}
        </Text>
        {normalized.showValue && (
          <Text strong style={{ color: activeColor }} data-testid="advanced-slider-value">
            {committedValue.toFixed(normalized.precision)}
            {normalized.commitOnRelease && draftValue !== committedValue && (
              <span style={{ color: '#9f9f9f', marginLeft: 6, fontWeight: 400 }}>
                (pending {draftValue.toFixed(normalized.precision)})
              </span>
            )}
          </Text>
        )}
      </div>

      {normalized.unavailable && !card.entity ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span data-testid="advanced-slider-empty">Set an entity to enable runtime value binding</span>}
          style={{ margin: 'auto 0' }}
        />
      ) : (
        <div
          data-testid="advanced-slider-control"
          style={{
            flex: 1,
            minHeight: normalized.orientation === 'vertical' ? 180 : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: normalized.orientation === 'vertical' ? 'center' : 'stretch',
          }}
        >
          <Slider
            min={normalized.min}
            max={normalized.max}
            step={normalized.step}
            value={sliderValue}
            vertical={normalized.orientation === 'vertical'}
            marks={normalized.showMarkers ? marks : undefined}
            onChange={handleSliderChange}
            onChangeComplete={handleSliderChangeComplete}
            aria-label="Advanced slider control"
            style={{
              width: normalized.orientation === 'vertical' ? undefined : '100%',
              height: normalized.orientation === 'vertical' ? 180 : undefined,
            }}
            trackStyle={{
              background: normalized.animateFill
                ? `linear-gradient(90deg, ${activeColor}AA 0%, ${activeColor} 100%)`
                : activeColor,
              transition: normalized.animateFill ? 'all 180ms ease-out' : 'none',
            }}
            railStyle={{ backgroundColor: '#2f2f2f' }}
            handleStyle={{ borderColor: activeColor }}
          />
        </div>
      )}

      {normalized.zones.length > 0 && (
        <div
          data-testid="advanced-slider-zones"
          style={{
            display: 'grid',
            gap: '4px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
            width: normalized.orientation === 'vertical' ? 160 : '100%',
          }}
        >
          {normalized.zones.map((zone) => (
            <div
              key={`${zone.from}-${zone.to}-${zone.color}`}
              style={{
                border: `1px solid ${zone.color}`,
                borderRadius: 6,
                padding: '2px 6px',
                fontSize: 10,
                color: '#d9d9d9',
                background: `${zone.color}22`,
              }}
            >
              {zone.label}
            </div>
          ))}
        </div>
      )}
    </AntCard>
  );
};
