// Performance monitoring utilities for Chrome extension

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Mark the start of a performance measurement
  mark(name: string): void {
    if ('performance' in window && performance.mark) {
      performance.mark(`${name}-start`);
    }
    this.metrics.set(`${name}-start`, Date.now());
  }

  // Mark the end and calculate duration
  measure(name: string): number {
    const startTime = this.metrics.get(`${name}-start`);
    const endTime = Date.now();
    
    if (startTime) {
      const duration = endTime - startTime;
      this.metrics.set(name, duration);
      
      if ('performance' in window && performance.mark && performance.measure) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
      
      return duration;
    }
    
    return 0;
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.metrics) {
      if (!key.endsWith('-start')) {
        result[key] = value;
      }
    }
    return result;
  }

  // Log performance metrics (only in development)
  logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      console.table(this.getMetrics());
    }
  }
}

// Utility functions for common performance patterns
export const withPerformanceTracking = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.mark(name);
    
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        monitor.measure(name);
      });
    } else {
      monitor.measure(name);
      return result;
    }
  }) as T;
};

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

// Throttle function for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

// Memory usage monitoring (Chrome extension specific)
export const getMemoryUsage = (): Promise<any> => {
  return new Promise((resolve) => {
    if ('memory' in performance) {
      resolve({
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      });
    } else {
      resolve(null);
    }
  });
};
