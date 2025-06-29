import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Temporarily Disabled Error Boundary for Development
 * TODO: Re-enable once core issues are resolved
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // For now, just log the error and continue
    console.warn('Error boundary caught error (disabled for development):', error);
    return { hasError: false }; // Don't trigger error UI
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.warn('Error Boundary (disabled):', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    // For now, don't set error state - just continue rendering
    // TODO: Re-enable error boundary once core issues are fixed
  }

  render() {
    // Always render children, ignore errors for now
    return this.props.children;
  }
}

export default ErrorBoundary;
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>
  ) => {
    return (props: P) => (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };