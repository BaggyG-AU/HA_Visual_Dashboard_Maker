import React, { useMemo } from 'react';
import { Alert, Card as AntCard, Empty } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useEntityContextResolver } from '../../hooks/useEntityContext';
import {
  buildDeterministicSeriesData,
  normalizeApexChartsCardConfig,
} from '../../features/apexcharts/apexchartsService';
import { ApexChartsCardConfig } from '../../features/apexcharts/types';

interface ApexChartsCardRendererProps {
  card: ApexChartsCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const DEFAULT_COLORS = [
  '#00d9ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#1890ff',
];

const buildFallback = (message: string): React.ReactElement => (
  <div
    data-testid="apexcharts-fallback"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 220,
      borderRadius: 8,
      border: '1px dashed #5c5c5c',
      background: '#161616',
      padding: 16,
    }}
  >
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={<span style={{ color: '#bfbfbf' }}>{message}</span>}
    />
  </div>
);

/**
 * Visual renderer for ApexCharts card type with deterministic preview behavior.
 * Keeps unsupported advanced options as YAML pass-through while hardening common fields.
 */
export const ApexChartsCardRenderer: React.FC<ApexChartsCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const resolveContext = useEntityContextResolver();
  const normalized = useMemo(() => normalizeApexChartsCardConfig(card), [card]);
  const defaultEntityId = normalized.series[0]?.entity;
  const resolvedTitle = normalized.header?.title
    ? resolveContext(normalized.header.title, defaultEntityId ?? null)
    : '';
  const title = (normalized.header?.title ? resolvedTitle : '') || 'Apex Chart';
  const showHeader = normalized.header?.show !== false;
  const chartHeight = normalized.apex_config.chart.height;

  const backgroundStyle = getCardBackgroundStyle(
    (card as { style?: string }).style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

  const computedChart = useMemo(() => {
    if (normalized.series.length === 0) {
      return {
        ok: false,
        fallback: 'No valid Apex series configured. Add at least one series entity in Form or YAML.',
      } as const;
    }

    try {
      const series = normalized.series.map((entry) => ({
        name: entry.name ? resolveContext(entry.name, entry.entity) : entry.name,
        data: buildDeterministicSeriesData(entry, normalized.graph_span_seconds),
      }));

      // `chart` and `stroke` are composed explicitly below (each already folds in
      // the user's apex_config values), so they are held out of the passthrough
      // spread — otherwise that trailing spread overwrote both blocks wholesale
      // and the preview guardrails (transparent background, hidden toolbar,
      // disabled animations) were silently discarded.
      const { chart: _chart, stroke: _stroke, ...apexPassthrough } = normalized.apex_config;
      void _chart;
      void _stroke;

      const options: ApexOptions = {
        chart: {
          // `type` and `height` come from the spread below — normalizeApexChartsCardConfig
          // already resolves both onto apex_config.chart.
          background: 'transparent',
          toolbar: {
            show: false,
          },
          animations: {
            enabled: false,
          },
          ...normalized.apex_config.chart,
        },
        theme: {
          mode: 'dark',
        },
        colors: normalized.series.map((entry, idx) => entry.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]),
        stroke: {
          ...normalized.apex_config.stroke,
        },
        xaxis: {
          type: 'datetime',
          labels: {
            style: {
              colors: '#999',
              fontSize: '10px',
            },
            datetimeFormatter: {
              hour: 'HH:mm',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#999',
              fontSize: '10px',
            },
            formatter: (value: number) => value.toFixed(1),
          },
          ...(normalized.yaxis?.[0] || {}),
        },
        grid: {
          borderColor: '#434343',
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: true,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        tooltip: {
          theme: 'dark',
          x: {
            format: 'HH:mm',
          },
        },
        legend: {
          show: true,
          position: 'bottom',
          fontSize: '11px',
          labels: {
            colors: '#e6e6e6',
          },
          markers: {
            // ApexCharts v4 replaced legend marker `width`/`height` with `size`.
            size: 8,
          },
        },
        dataLabels: {
          enabled: false,
        },
        ...apexPassthrough,
      };

      return {
        ok: true,
        series,
        options,
      } as const;
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown ApexCharts preview error';
      return {
        ok: false,
        fallback: `ApexCharts preview unavailable: ${reason}`,
      } as const;
    }
  }, [normalized, chartHeight, resolveContext]);

  return (
    <AntCard
      size="small"
      data-testid="apexcharts-card"
      title={
        showHeader ? (
          <div
            style={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#e1e1e1',
              padding: '0',
            }}
          >
            {title}
          </div>
        ) : undefined
      }
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
        borderRadius: '12px',
      }}
      styles={{
        header: {
          padding: showHeader ? '16px 16px 12px 16px' : '0',
          minHeight: showHeader ? '48px' : '0',
          borderBottom: 'none',
        },
        body: {
          padding: '16px',
          paddingTop: showHeader ? '0' : '16px',
          height: showHeader ? 'calc(100% - 48px)' : '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        },
      }}
      onClick={onClick}
      hoverable
    >
      {normalized.warnings.length > 0 && (
        <Alert
          data-testid="apexcharts-warning"
          type="warning"
          showIcon
          message="Preview guardrails applied"
          description={normalized.warnings[0]}
        />
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {!computedChart.ok ? (
          buildFallback(computedChart.fallback)
        ) : (
          <div data-testid="apexcharts-chart">
            <ReactApexChart
              options={computedChart.options}
              series={computedChart.series}
              type={normalized.apex_config.chart.type}
              height="100%"
            />
          </div>
        )}
      </div>
    </AntCard>
  );
};
