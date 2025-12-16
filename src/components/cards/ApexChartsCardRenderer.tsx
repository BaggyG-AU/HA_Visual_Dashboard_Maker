import React, { useMemo } from 'react';
import { Card as AntCard, Typography, Tag } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const { Text } = Typography;

interface ApexChartsSeries {
  entity: string;
  name?: string;
  type?: 'line' | 'area' | 'column' | 'bar';
  stroke_width?: number;
  color?: string;
  group_by?: {
    func?: string;
    duration?: string;
  };
  [key: string]: any;
}

interface ApexChartsCardConfig {
  type: 'custom:apexcharts-card';
  header?: {
    title?: string;
    show?: boolean;
    show_states?: boolean;
    colorize_states?: boolean;
  };
  graph_span?: string;
  update_interval?: string;
  series: ApexChartsSeries[];
  apex_config?: {
    chart?: {
      height?: number;
      type?: string;
      [key: string]: any;
    };
    stroke?: {
      width?: number;
      curve?: string;
    };
    [key: string]: any;
  };
  yaxis?: any[];
  experimental?: {
    color_threshold?: boolean;
  };
  [key: string]: any;
}

interface ApexChartsCardRendererProps {
  card: ApexChartsCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

// Default colors for chart series
const DEFAULT_COLORS = [
  '#00d9ff', // Cyan
  '#52c41a', // Green
  '#faad14', // Orange
  '#f5222d', // Red
  '#722ed1', // Purple
  '#13c2c2', // Teal
  '#eb2f96', // Magenta
  '#1890ff', // Blue
];

/**
 * Visual renderer for ApexCharts card type
 * Displays interactive charts using ApexCharts library
 */
export const ApexChartsCardRenderer: React.FC<ApexChartsCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const title = card.header?.title || 'Chart';
  const showHeader = card.header?.show !== false;
  const seriesCount = card.series?.length || 0;
  const chartHeight = card.apex_config?.chart?.height || 280;

  // Generate mock data for demonstration
  const { series, options } = useMemo(() => {
    const seriesData = (card.series || []).map((s, idx) => ({
      name: s.name || s.entity.split('.')[1]?.replace(/_/g, ' ') || `Series ${idx + 1}`,
      data: generateMockData(30), // Generate 30 data points
    }));

    const apexOptions: ApexOptions = {
      chart: {
        type: card.apex_config?.chart?.type || 'line',
        height: chartHeight,
        background: 'transparent',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: false, // Disable for better performance in editor
        },
        ...card.apex_config?.chart,
      },
      theme: {
        mode: 'dark',
      },
      colors: card.series?.map((s, idx) => s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]),
      stroke: {
        width: card.apex_config?.stroke?.width || 2,
        curve: (card.apex_config?.stroke?.curve as any) || 'smooth',
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
        ...card.yaxis?.[0],
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
          width: 8,
          height: 8,
        },
      },
      dataLabels: {
        enabled: false,
      },
    };

    return { series: seriesData, options: apexOptions };
  }, [card, chartHeight]);

  return (
    <AntCard
      size="small"
      title={
        showHeader ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChartOutlined style={{ color: '#00d9ff' }} />
            <span style={{ fontSize: '14px' }}>{title}</span>
            <Tag color="purple" style={{ fontSize: '10px', marginLeft: 'auto' }}>
              {seriesCount} {seriesCount === 1 ? 'series' : 'series'}
            </Tag>
          </div>
        ) : undefined
      }
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{
        padding: showHeader ? '12px' : '16px',
        height: showHeader ? 'calc(100% - 46px)' : '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClick}
      hoverable
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <ReactApexChart
          options={options}
          series={series}
          type={(card.apex_config?.chart?.type as any) || 'line'}
          height="100%"
        />
      </div>

      {/* Show series info */}
      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #434343' }}>
        <Text type="secondary" style={{ fontSize: '10px' }}>
          Entities: {card.series?.map(s => s.entity.split('.')[1]).join(', ')}
        </Text>
      </div>
    </AntCard>
  );
};

/**
 * Generate mock data points for chart demonstration
 * In a real implementation, this would fetch actual historical data from Home Assistant
 */
function generateMockData(points: number): Array<{ x: number; y: number }> {
  const now = Date.now();
  const interval = 300000; // 5 minutes in milliseconds
  const data: Array<{ x: number; y: number }> = [];

  let value = Math.random() * 100 + 50; // Start with random value

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - i * interval;
    // Random walk with some variance
    const change = (Math.random() - 0.5) * 20;
    value = Math.max(0, value + change);

    data.push({
      x: timestamp,
      y: parseFloat(value.toFixed(2)),
    });
  }

  return data;
}
