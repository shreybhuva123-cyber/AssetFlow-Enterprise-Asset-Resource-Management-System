'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { createLogger } from '@/lib/logger/index';

const logger = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('React error boundary caught error', { error: error.message, stack: info.componentStack?.slice(0, 500) });
    this.props.onError?.(error, info);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        role="alert"
        aria-live="assertive"
      >
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>

        <h2 className="text-base font-semibold text-foreground">Something went wrong</h2>

        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          An unexpected error occurred. Our team has been notified.
        </p>

        {process.env.NODE_ENV === 'development' && this.state.error && (
          <pre className="mt-4 max-w-lg text-left text-xs bg-muted rounded-lg p-3 overflow-auto text-muted-foreground">
            {this.state.error.message}
          </pre>
        )}

        <button
          onClick={this.handleReset}
          className="mt-6 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }
}
