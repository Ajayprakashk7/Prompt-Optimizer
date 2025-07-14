// Advanced lazy loading hook with Intersection Observer
import { useState, useEffect, useRef } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If Intersection Observer is not supported, load immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      setIsLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Load the component after a small delay for better UX
          setTimeout(() => {
            setIsLoaded(true);
          }, 50);

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    elementRef,
    isVisible,
    isLoaded
  };
};

// Hook for preloading components when they're about to be needed
export const usePreloadComponent = (
  importFn: () => Promise<any>,
  shouldPreload: boolean = false
) => {
  const [component, setComponent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (shouldPreload && !component && !isLoading) {
      setIsLoading(true);
      setError(null);

      importFn()
        .then((module) => {
          setComponent(() => module.default || module);
        })
        .catch((err) => {
          setError(err);
          console.error('Failed to preload component:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [shouldPreload, component, isLoading, importFn]);

  return {
    component,
    isLoading,
    error
  };
};

// Hook for intelligent component preloading based on user behavior
export const useSmartPreload = () => {
  const [shouldPreloadPanels, setShouldPreloadPanels] = useState(false);
  const [shouldPreloadSettings, setShouldPreloadSettings] = useState(false);

  useEffect(() => {
    // Preload panels after user starts typing (indicates engagement)
    const handleUserActivity = () => {
      setShouldPreloadPanels(true);
    };

    // Preload settings after a delay (user might need it)
    const settingsTimer = setTimeout(() => {
      setShouldPreloadSettings(true);
    }, 3000);

    // Listen for user activity
    document.addEventListener('input', handleUserActivity, { once: true });
    document.addEventListener('click', handleUserActivity, { once: true });

    return () => {
      clearTimeout(settingsTimer);
      document.removeEventListener('input', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
    };
  }, []);

  return {
    shouldPreloadPanels,
    shouldPreloadSettings
  };
};
