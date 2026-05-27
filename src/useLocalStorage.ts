import { useState, useEffect, useCallback } from 'react';

const PREFIX = 'ieadpe_escala_';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storageKey = PREFIX + key;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const nextValue = value instanceof Function ? value(prev) : value;
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextValue));
      } catch { /* quota exceeded, ignore */ }
      return nextValue;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch { /* ignore */ }
    setStoredValue(initialValue);
  }, [storageKey, initialValue]);

  return [storedValue, setValue, reset];
}
