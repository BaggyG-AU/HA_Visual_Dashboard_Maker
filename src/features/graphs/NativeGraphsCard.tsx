import React, { useEffect, useMemo, useState } from 'react';
import { Card as AntCard, Empty, Typography } from 'antd';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { buildGraphData, normalizeGraphConfig } from './graphService';
import type { NativeGraphCardConfig } from './types';

const { Text } = Typography;

interface NativeGraphsCardProps {
  card: NativeGraphCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const toTickLabel = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const CHART_MARGIN = Object.freeze({ top: 8, right: 16, left: 0, bottom: 8 });
const TOOLTIP_STYLE = Object.freeze({ backgroundColor: '#1b1b1b', border: '1px solid #333' });

const getYAxisDomain = (
  axis: { min: number | 'auto'; max: number | 'auto' },
): [number | 'auto', number | 'auto'] | undefined => {
  const min = axis.min;
  const max = axis.max;
  if (min === 'auto' && max === 'auto') return undefined;
  return [min, max];
};

export const NativeGraphsCard: React.FC<NativeGraphsCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const normalized = useMemo(() => normalizeGraphConfig(card), [card]);
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const intervalMs = Math.max(5, normalized.refresh_interval_seconds) * 1000;
    const interval = window.setInterval(() => {
      setTick(Date.now());
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [normalized.refresh_interval_seconds]);

  const chartData = useMemo(() => buildGraphData(normalized, tick), [normalized, tick]);
  const chartWidth = 640;
  const chartHeight = 240;
  const yAxisDomain = useMemo(() => getYAxisDomain(normalized.y_axis), [normalized.y_axis]);
  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(79, 163, 255, 0.12)' : '#1f1f1f',
  );

  const title = normalized.title?.trim() ? normalized.title : 'Native Graph';

  const hasSeries = normalized.series.length > 0;
  const legendEntries = normalized.chart_type === 'pie'
    ? chartData.pie.map((entry) => ({ label: entry.name, color: entry.color }))
    : normalized.series.map((series) => ({ label: series.label, color: series.color }));
  const pieTotal = chartData.pie.reduce((acc, item) => acc + item.value, 0);

  return (
    <AntCard
      size="small"
      title={title}
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #4fa3ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        header: {
          borderBottom: '1px solid #303030',
          color: '#e6e6e6',
          fontSize: '14px',
          fontWeight: 600,
        },
        body: {
          padding: '12px 12px 8px',
          height: 'calc(100% - 48px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        },
      }}
      onClick={onClick}
      hoverable
      data-testid="native-graph-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#9f9f9f', fontSize: '11px' }}>
          {normalized.chart_type.toUpperCase()} | {normalized.time_range} | refresh {normalized.refresh_interval}
        </Text>
      </div>

      {!hasSeries && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No graph series configured"
          style={{ margin: 'auto 0' }}
        />
      )}

      {hasSeries && (
        <div
          style={{ flex: 1, minHeight: 0 }}
          data-testid="native-graph-chart"
          role="img"
          aria-label="Native graph chart preview"
        >
          {normalized.chart_type === 'line' && (
            <LineChart width={chartWidth} height={chartHeight} data={chartData.points} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={toTickLabel}
                  stroke="#9f9f9f"
                  minTickGap={20}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#9f9f9f"
                  domain={yAxisDomain}
                />
                <Tooltip
                  labelFormatter={(value) => toTickLabel(Number(value))}
                  contentStyle={TOOLTIP_STYLE}
                />
                {normalized.series.some((series) => series.axis === 'right') && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#9f9f9f"
                    domain={yAxisDomain}
                  />
                )}
                {normalized.series.map((series, index) => (
                  <Line
                    key={series.entity}
                    type={series.smooth ? 'monotone' : 'linear'}
                    dataKey={`series_${index}`}
                    name={series.label}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={false}
                    yAxisId={series.axis}
                    isAnimationActive={false}
                  />
                ))}
            </LineChart>
          )}

          {normalized.chart_type === 'area' && (
            <AreaChart width={chartWidth} height={chartHeight} data={chartData.points} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestamp" tickFormatter={toTickLabel} stroke="#9f9f9f" minTickGap={20} />
                <YAxis
                  yAxisId="left"
                  stroke="#9f9f9f"
                  domain={yAxisDomain}
                />
                <Tooltip
                  labelFormatter={(value) => toTickLabel(Number(value))}
                  contentStyle={TOOLTIP_STYLE}
                />
                {normalized.series.some((series) => series.axis === 'right') && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#9f9f9f"
                    domain={yAxisDomain}
                  />
                )}
                {normalized.series.map((series, index) => (
                  <Area
                    key={series.entity}
                    type={series.smooth ? 'monotone' : 'linear'}
                    dataKey={`series_${index}`}
                    name={series.label}
                    stroke={series.color}
                    fill={series.color}
                    fillOpacity={0.2}
                    yAxisId={series.axis}
                    stackId={series.stack ? 'stack' : undefined}
                    isAnimationActive={false}
                  />
                ))}
            </AreaChart>
          )}

          {normalized.chart_type === 'bar' && (
            <BarChart width={chartWidth} height={chartHeight} data={chartData.points} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestamp" tickFormatter={toTickLabel} stroke="#9f9f9f" minTickGap={20} />
                <YAxis
                  yAxisId="left"
                  stroke="#9f9f9f"
                  domain={yAxisDomain}
                />
                <Tooltip
                  labelFormatter={(value) => toTickLabel(Number(value))}
                  contentStyle={TOOLTIP_STYLE}
                />
                {normalized.series.some((series) => series.axis === 'right') && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#9f9f9f"
                    domain={yAxisDomain}
                  />
                )}
                {normalized.series.map((series, index) => (
                  <Bar
                    key={series.entity}
                    dataKey={`series_${index}`}
                    name={series.label}
                    fill={series.color}
                    yAxisId={series.axis}
                    stackId={series.stack ? 'stack' : undefined}
                    isAnimationActive={false}
                  />
                ))}
            </BarChart>
          )}

          {normalized.chart_type === 'pie' && (
            <div
              data-testid="native-graph-pie-fallback"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '10px 12px',
                border: '1px solid #303030',
                borderRadius: '8px',
                background: '#151515',
              }}
            >
              {chartData.pie.map((entry) => {
                const ratio = pieTotal > 0 ? Math.max(0.01, entry.value / pieTotal) : 0.01;
                const widthPercent = Math.max(4, Math.round(ratio * 100));
                return (
                  <div key={entry.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cfcfcf' }}>
                      <span>{entry.name}</span>
                      <span>{Math.round(ratio * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '99px', background: '#262626', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${widthPercent}%`,
                          background: entry.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {hasSeries && (
        <div
          data-testid="native-graph-legend"
          aria-label="Graph legend"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            paddingTop: '6px',
          }}
        >
          {legendEntries.map((entry) => (
            <div
              key={entry.label}
              data-testid="native-graph-legend-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#cfcfcf',
                fontSize: '11px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  backgroundColor: entry.color,
                }}
              />
              <span>{entry.label}</span>
            </div>
          ))}
        </div>
      )}
    </AntCard>
  );
};
