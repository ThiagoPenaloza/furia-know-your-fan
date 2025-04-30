import { useState, useEffect } from 'react';

export function usePersistedState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}