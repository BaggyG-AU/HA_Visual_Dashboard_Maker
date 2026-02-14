import React from 'react';
import { Alert, Card as AntCard } from 'antd';
import { NativeGraphsCard } from '../../features/graphs/NativeGraphsCard';
import type { NativeGraphCardConfig } from '../../features/graphs/types';

interface NativeGraphsCardRendererProps {
  card: NativeGraphCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

interface RendererState {
  hasError: boolean;
  errorMessage?: string;
  componentStack?: string;
}

class NativeGraphsErrorBoundary extends React.Component<
  React.PropsWithChildren<{ card: NativeGraphCardConfig; onClick?: () => void; isSelected?: boolean }>,
  RendererState
> {
  state: RendererState = { hasError: false, errorMessage: undefined, componentStack: undefined };

  static getDerivedStateFromError(): RendererState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      errorMessage: error.message,
      componentStack: errorInfo.componentStack,
    });
    // Keep explicit logging so Playwright traces capture renderer exceptions.
    // eslint-disable-next-line no-console
    console.error('[NativeGraphsCardRenderer] render error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  override render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <AntCard
        size="small"
        title={this.props.card.title || 'Native Graph'}
        onClick={this.props.onClick}
        style={{
          height: '100%',
          border: this.props.isSelected ? '2px solid #4fa3ff' : '1px solid #434343',
        }}
        data-testid="native-graph-card"
      >
        <div data-testid="native-graph-chart">
          <Alert
            type="warning"
            showIcon
            message="Graph preview unavailable"
            description={(
              <>
                <div>{this.state.errorMessage || 'Rendering fallback shown because chart preview encountered an error.'}</div>
                {this.state.componentStack && (
                  <pre
                    style={{
                      marginTop: '8px',
                      whiteSpace: 'pre-wrap',
                      fontSize: '11px',
                      color: '#d9d9d9',
                    }}
                    data-testid="native-graph-error-stack"
                  >
                    {this.state.componentStack.trim()}
                  </pre>
                )}
              </>
            )}
          />
        </div>
      </AntCard>
    );
  }
}

export const NativeGraphsCardRenderer: React.FC<NativeGraphsCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => (
  <NativeGraphsErrorBoundary card={card} isSelected={isSelected} onClick={onClick}>
    <NativeGraphsCard card={card} isSelected={isSelected} onClick={onClick} />
  </NativeGraphsErrorBoundary>
);
