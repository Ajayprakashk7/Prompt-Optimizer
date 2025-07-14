// Startup performance optimizer for Chrome extension
// Ensures the extension opens as fast as possible

export class StartupOptimizer {
    private static instance: StartupOptimizer;
    private startTime: number;
    private milestones: Map<string, number> = new Map();

    private constructor() {
        this.startTime = performance.now();
        this.recordMilestone('constructor');
    }

    static getInstance(): StartupOptimizer {
        if (!StartupOptimizer.instance) {
            StartupOptimizer.instance = new StartupOptimizer();
        }
        return StartupOptimizer.instance;
    }

    recordMilestone(name: string): void {
        const time = performance.now() - this.startTime;
        this.milestones.set(name, time);
        
        // Log critical milestones in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 Startup milestone "${name}": ${time.toFixed(2)}ms`);
        }
    }

    getStartupTime(): number {
        return performance.now() - this.startTime;
    }

    getMilestones(): Record<string, number> {
        const result: Record<string, number> = {};
        for (const [key, value] of this.milestones) {
            result[key] = value;
        }
        return result;
    }

    // Ensure critical performance targets are met
    validatePerformance(): boolean {
        const totalTime = this.getStartupTime();
        const targets = {
            'First Paint': 200,      // UI should appear within 200ms
            'Interactive': 500,      // App should be interactive within 500ms
            'Data Loaded': 1000      // Data should load within 1s
        };

        let allTargetsMet = true;
        for (const [milestone, target] of Object.entries(targets)) {
            const actualTime = this.milestones.get(milestone) || totalTime;
            if (actualTime > target) {
                console.warn(`⚠️ Performance target missed: ${milestone} took ${actualTime.toFixed(2)}ms (target: ${target}ms)`);
                allTargetsMet = false;
            }
        }

        if (allTargetsMet && process.env.NODE_ENV === 'development') {
            console.log(`✅ All performance targets met! Total startup: ${totalTime.toFixed(2)}ms`);
        }

        return allTargetsMet;
    }
}

// Utility functions for startup optimization
export const optimizeStartup = {
    // Defer non-critical operations
    defer: (fn: () => void, delay = 0): void => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(fn, { timeout: delay + 1000 });
        } else {
            setTimeout(fn, delay);
        }
    },

    // Preload critical resources with duplicate prevention and cleanup
    preloadResource: (url: string, type: 'script' | 'style' | 'font' = 'script'): void => {
        try {
            // Check if resource is already preloaded to prevent duplicates
            const existingLink = document.querySelector(`link[rel="preload"][href="${url}"]`);
            if (existingLink) {
                return; // Resource already preloaded
            }

            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = type;

            // Add error handling and cleanup
            link.onerror = () => {
                console.warn(`Failed to preload resource: ${url}`);
                // Remove failed preload link to prevent memory leak
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            };

            // Clean up preload link after it's no longer needed (5 seconds)
            link.onload = () => {
                setTimeout(() => {
                    if (link.parentNode) {
                        link.parentNode.removeChild(link);
                    }
                }, 5000);
            };

            document.head.appendChild(link);
        } catch (error) {
            console.error('Error preloading resource:', error);
        }
    },

    // Batch DOM updates to prevent layout thrashing
    batchDOMUpdates: (updates: (() => void)[]): void => {
        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
    },

    // Optimize images for faster loading
    optimizeImage: (img: HTMLImageElement): void => {
        img.loading = 'lazy';
        img.decoding = 'async';
    }
};

// Initialize startup tracking
export const startupTracker = StartupOptimizer.getInstance();
