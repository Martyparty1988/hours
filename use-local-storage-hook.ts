// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

/**
 * Hook pro ukládání a čtení dat z localStorage s typovou bezpečností
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // State pro uchování hodnoty
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Zkusíme získat hodnotu z localStorage
      const item = window.localStorage.getItem(key);
      // Pokud hodnota existuje, parsujeme ji, jinak vrátíme initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Pokud dojde k chybě, vrátíme initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Funkce pro nastavení nové hodnoty
  const setValue: SetValue<T> = (value) => {
    try {
      // Pokud je value funkce, zavoláme ji s předchozí hodnotou
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Nastavíme state
      setStoredValue(valueToStore);
      
      // Uložíme do localStorage, pokud jsme v prohlížeči
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  // Synchronizace s ostatními tab/okny
  useEffect(() => {
    // Funkce pro obsluhu storage eventu
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          // Aktualizace state když se změní localStorage v jiném okně/tabu
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value:`, error);
        }
      }
    };
    
    // Naslouchání na storage event
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      // Cleanup
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key]);
  
  return [storedValue, setValue];
}

export default useLocalStorage;