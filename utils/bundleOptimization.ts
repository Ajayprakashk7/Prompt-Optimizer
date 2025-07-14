// Advanced bundle optimization utilities for Chrome extension

export interface BundleAnalysis {
  totalSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzipSize: number;
    modules: string[];
  }>;
  recommendations: string[];
}

// Analyze bundle composition and provide optimization recommendations
export function analyzeBundleComposition(buildOutput: string): BundleAnalysis {
  const lines = buildOutput.split('\n');
  const chunks: BundleAnalysis['chunks'] = [];
  let totalSize = 0;
  
  for (const line of lines) {
    const match = line.match(/dist\/assets\/(.+?)\s+(\d+(?:\.\d+)?)\s*kB(?:\s*│\s*gzip:\s*(\d+(?:\.\d+)?)\s*kB)?/);
    if (match) {
      const [, name, sizeStr, gzipSizeStr] = match;
      const size = parseFloat(sizeStr);
      const gzipSize = gzipSizeStr ? parseFloat(gzipSizeStr) : size * 0.3; // Estimate if not provided
      
      chunks.push({
        name,
        size,
        gzipSize,
        modules: [] // Would need build analysis for detailed module info
      });
      
      totalSize += size;
    }
  }
  
  const recommendations = generateOptimizationRecommendations(chunks);
  
  return {
    totalSize,
    chunks: chunks.sort((a, b) => b.size - a.size),
    recommendations
  };
}

function generateOptimizationRecommendations(chunks: BundleAnalysis['chunks']): string[] {
  const recommendations: string[] = [];
  
  // Check for oversized chunks
  const largeChunks = chunks.filter(chunk => chunk.size > 500);
  if (largeChunks.length > 0) {
    recommendations.push(
      `Large chunks detected (${largeChunks.map(c => c.name).join(', ')}). Consider further code splitting.`
    );
  }
  
  // Check for main bundle size
  const mainChunk = chunks.find(chunk => chunk.name.includes('popup.js') || chunk.name.includes('main'));
  if (mainChunk && mainChunk.size > 100) {
    recommendations.push(
      `Main bundle is ${mainChunk.size}kB. Consider lazy loading more components.`
    );
  }
  
  // Check for vendor chunk optimization
  const vendorChunks = chunks.filter(chunk => chunk.name.includes('vendor'));
  if (vendorChunks.length === 0) {
    recommendations.push('Consider creating vendor chunks for better caching.');
  }
  
  // Check for lazy loading opportunities
  const lazyChunks = chunks.filter(chunk => chunk.name.includes('lazy'));
  if (lazyChunks.length < 3) {
    recommendations.push('Consider lazy loading more components to reduce initial bundle size.');
  }
  
  return recommendations;
}

// Performance monitoring for runtime optimization
export class RuntimePerformanceMonitor {
  private static instance: RuntimePerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];
  
  static getInstance(): RuntimePerformanceMonitor {
    if (!RuntimePerformanceMonitor.instance) {
      RuntimePerformanceMonitor.instance = new RuntimePerformanceMonitor();
    }
    return RuntimePerformanceMonitor.instance;
  }
  
  constructor() {
    this.initializeObservers();
  }
  
  private initializeObservers(): void {
    if ('PerformanceObserver' in window) {
      // Monitor Long Tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('longTask', entry.duration);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
      
      // Monitor Layout Shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ('value' in entry) {
              this.recordMetric('cumulativeLayoutShift', entry.value as number);
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('Layout shift monitoring not supported');
      }
    }
  }
  
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
    
    // Keep only last 100 measurements
    const values = this.metrics.get(name)!;
    if (values.length > 100) {
      values.shift();
    }
  }
  
  getMetricSummary(name: string): { avg: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    
    return { avg, max, count: values.length };
  }
  
  getAllMetrics(): Record<string, { avg: number; max: number; count: number }> {
    const result: Record<string, { avg: number; max: number; count: number }> = {};
    
    for (const [name] of this.metrics) {
      const summary = this.getMetricSummary(name);
      if (summary) {
        result[name] = summary;
      }
    }
    
    return result;
  }
  
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Lazy loading utility with preloading
export class LazyLoader {
  private static preloadCache = new Set<string>();
  
  static async loadComponent<T>(
    importFn: () => Promise<{ default: T }>,
    preload = false
  ): Promise<T> {
    const monitor = RuntimePerformanceMonitor.getInstance();
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      monitor.recordMetric('componentLoadTime', loadTime);
      
      return module.default;
    } catch (error) {
      monitor.recordMetric('componentLoadError', 1);
      throw error;
    }
  }
  
  static preloadComponent(importFn: () => Promise<any>, key: string): void {
    if (this.preloadCache.has(key)) return;
    
    this.preloadCache.add(key);
    
    // Use requestIdleCallback for non-critical preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn().catch(() => {
          // Ignore preload errors
          this.preloadCache.delete(key);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importFn().catch(() => {
          this.preloadCache.delete(key);
        });
      }, 100);
    }
  }
}

// Memory optimization utilities
export class MemoryOptimizer {
  private static cleanupTasks: (() => void)[] = [];
  
  static addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }
  
  static cleanup(): void {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }
  
  static getMemoryUsage(): Promise<any> {
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
  }
}
