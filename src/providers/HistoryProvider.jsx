/**
 * NutriVision AI — History Provider
 * User-scoped: each account gets its own isolated scan history.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getData, setData, getUserKey } from '../services/storageService';
import { STORAGE_KEYS, DUPLICATE_WINDOW_MS } from '../utils/constants';
import { generateId } from '../utils/helpers';
import { useAuth } from './AuthProvider';

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const { user } = useAuth();
  const userEmail = user?.email || '';
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Reload history whenever the user changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoaded(false);
      const key = getUserKey(STORAGE_KEYS.HISTORY, userEmail);
      const saved = await getData(key);
      if (!cancelled) {
        setHistory(saved && Array.isArray(saved) ? saved : []);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [userEmail]);

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
      const key = getUserKey(STORAGE_KEYS.HISTORY, userEmail);
      setData(key, next);
      return next;
    });
  }, [userEmail]);

  const deleteEntry = useCallback(async (id) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      const key = getUserKey(STORAGE_KEYS.HISTORY, userEmail);
      setData(key, next);
      return next;
    });
  }, [userEmail]);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    const key = getUserKey(STORAGE_KEYS.HISTORY, userEmail);
    await setData(key, []);
  }, [userEmail]);

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
