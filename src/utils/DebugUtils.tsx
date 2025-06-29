// src/utils/DebugUtils.tsx
import React, { Component, ReactNode, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../types';

// Navigation Debugger
export const NavigationDebugger = {
  log: (action: string, details?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🧭 [${timestamp}] NAV: ${action}`, details || '');
  },
  
  error: (action: string, error: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.error(`❌ [${timestamp}] NAV ERROR: ${action}`, error);
  },
  
  state: (state: any) => {
    console.log('📊 Navigation State:', JSON.stringify(state, null, 2));
  }
};

// Context Debugger
export const ContextDebugger = {
  log: (context: string, action: string, data?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🎯 [${timestamp}] ${context}: ${action}`, data || '');
  },
  
  warn: (context: string, warning: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.warn(`⚠️ [${timestamp}] ${context}: ${warning}`);
  },
  
  error: (context: string, error: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.error(`❌ [${timestamp}] ${context} ERROR:`, error);
  }
};

// Performance Monitor
export const PerformanceMonitor = {
  start: (label: string) => {
    if (__DEV__) {
      console.time(`⏱️ ${label}`);
    }
  },
  
  end: (label: string) => {
    if (__DEV__) {
      console.timeEnd(`⏱️ ${label}`);
    }
  },
  
  measure: async (label: string, fn: () => Promise<any>) => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      console.log(`⏱️ ${label}: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`⏱️ ${label}: ${duration}ms (failed)`, error);
      throw error;
    }
  }
};

// Error Boundary Component
interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class AppErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  AppErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 Error Boundary Caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Error Details:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>🚨 Something went wrong</Text>
          <ScrollView style={styles.errorScroll}>
            <Text style={styles.errorText}>
              {this.state.error?.toString()}
            </Text>
            {__DEV__ && (
              <>
                <Text style={styles.errorStack}>
                  {this.state.error?.stack}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.errorComponent}>
                    Component Stack:{'\n'}
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </>
            )}
          </ScrollView>
          <Pressable
            style={styles.reloadButton}
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            <Text style={styles.reloadText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook Debugger
export function useDebugEffect(
  effectName: string,
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  useEffect(() => {
    console.log(`🔄 [${effectName}] Running effect`);
    const cleanup = effect();
    return () => {
      console.log(`🧹 [${effectName}] Cleaning up effect`);
      cleanup?.();
    };
  }, deps);
}

// State Debugger
export function useDebugState<T>(
  stateName: string,
  initialState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(initialState);
  
  const debugSetState = React.useCallback(
    (newState: React.SetStateAction<T>) => {
      console.log(`📊 [${stateName}] State update:`, {
        from: state,
        to: typeof newState === 'function' ? 'function' : newState,
      });
      setState(newState);
    },
    [state, stateName]
  );
  
  return [state, debugSetState];
}

// Component Mount Debugger
export function useDebugMount(componentName: string) {
  useEffect(() => {
    console.log(`🎯 [${componentName}] Mounted`);
    return () => {
      console.log(`💥 [${componentName}] Unmounted`);
    };
  }, [componentName]);
}

// Render Debugger
export function useDebugRender(componentName: string, props?: any) {
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  
  console.log(`🎨 [${componentName}] Render #${renderCount.current}`, props || {});
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    padding: 20,
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorScroll: {
    maxHeight: 400,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#7F1D1D',
    marginBottom: 10,
  },
  errorStack: {
    fontSize: 12,
    color: '#991B1B',
    fontFamily: 'monospace',
    marginTop: 10,
  },
  errorComponent: {
    fontSize: 12,
    color: '#991B1B',
    fontFamily: 'monospace',
    marginTop: 10,
  },
  reloadButton: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  reloadText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});