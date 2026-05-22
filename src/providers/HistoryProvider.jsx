/**
 * NutriVision AI — History Provider
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getData, setData } from '../services/storageService';
import { STORAGE_KEYS, DUPLICATE_WINDOW_MS } from '../utils/constants';
import { generateId } from '../utils/helpers';

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getData(STORAGE_KEYS.HISTORY);
      if (saved && Array.isArray(saved)) setHistory(saved);
      setLoaded(true);
    })();
  }, []);

  const addEntry = useCallback(async (entry) => {
    setHistory((prev) => {
      // Duplicate detection
      const isDuplicate = prev.some(
        (h) =>
          h.item === entry.item &&
          Date.now() - h.timestamp < DUPLICATE_WINDOW_MS
      );
      if (isDuplicate) return prev;

      const newEntry = {
        id: generateId(),
        timestamp: Date.now(),
        ...entry,
      };
      const next = [newEntry, ...prev].slice(0, 200); // Keep max 200
      setData(STORAGE_KEYS.HISTORY, next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback(async (id) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      setData(STORAGE_KEYS.HISTORY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await setData(STORAGE_KEYS.HISTORY, []);
  }, []);

  const searchHistory = useCallback(
    (query) => {
      if (!query) return history;
      const q = query.toLowerCase();
      return history.filter(
        (h) =>
          h.item?.toLowerCase().includes(q) ||
          h.summary?.toLowerCase().includes(q)
      );
    },
    [history]
  );

  return (
    <HistoryContext.Provider
      value={{ history, addEntry, deleteEntry, clearHistory, searchHistory, loaded }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
