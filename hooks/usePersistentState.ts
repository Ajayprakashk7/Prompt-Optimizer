
import { useState, useEffect } from 'react';
import { storage } from '../services/storageService';

export function usePersistentState<T>(storageKey: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load initial state from storage
  useEffect(() => {
    let isMounted = true;
    storage.get<T>(storageKey).then(savedValue => {
      if (isMounted) {
        if (savedValue !== null) {
          setValue(savedValue);
        }
        setIsHydrated(true);
      }
    });
    return () => { isMounted = false; };
  }, [storageKey]);

  // Save state to storage on change.
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    // This effect runs whenever 'value' changes. We use a timeout to debounce the write operation.
    // This is a critical performance optimization, especially for the 'userInput' field, as it
    // prevents synchronous, blocking localStorage writes on every single keystroke, which would cause UI jank.
    const isDebounced = storageKey === 'userInput';
    
    const handler = setTimeout(() => {
      if (value === undefined || value === null) {
        storage.remove(storageKey);
      } else {
        storage.set(storageKey, value);
      }
    }, isDebounced ? 300 : 0); // 300ms debounce for user input, immediate for others.

    return () => {
      clearTimeout(handler);
    };
  }, [storageKey, value, isHydrated]);

  return [value, setValue];
}
