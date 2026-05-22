import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  addScanHistoryEntry, 
  getScanHistory, 
  deleteHistoryItem, 
  clearScanHistory 
} from '../database/queries/history.js';
import { DUPLICATE_WINDOW_MS } from '../utils/constants';
import { syncData } from '../services/supabase/syncService.js';
import { supabase } from '../services/supabase/client.js';

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load history from SQLite on startup
  useEffect(() => {
    (async () => {
      const saved = await getScanHistory();
      setHistory(saved || []);
      setLoaded(true);
    })();
  }, []);

  const addEntry = useCallback(async (entry) => {
    // Determine names and fields for compatibility
    const foodName = entry.food_name || entry.item || 'Unknown Food';
    const imageUri = entry.image_uri || entry.imageUri || '';
    const nutritionSnapshot = entry.nutrition_snapshot || entry.nutritionFacts || {};
    const aiResponse = entry.ai_response || entry.response || '';
    const confidence = entry.confidence || 0.9;

    // Duplicate detection in local state to avoid rapid-click insertions
    const isDuplicate = history.some(
      (h) =>
        h.food_name === foodName &&
        Date.now() - new Date(h.timestamp).getTime() < DUPLICATE_WINDOW_MS
    );
    if (isDuplicate) return null;

    const id = await addScanHistoryEntry(
      foodName,
      imageUri,
      nutritionSnapshot,
      aiResponse,
      confidence,
      0 // Unsynced locally
    );

    if (id !== null) {
      const next = await getScanHistory();
      setHistory(next);
      // Run background sync
      syncData();
      return id;
    }
    return null;
  }, [history]);

  const deleteEntry = useCallback(async (id) => {
    const item = history.find(h => h.id === id);
    const success = await deleteHistoryItem(id);
    if (success) {
      const next = await getScanHistory();
      setHistory(next);
      
      // Cascade delete on Supabase cloud if online and item matches
      if (item && item.timestamp) {
        (async () => {
          try {
            await supabase.from('scan_history').delete().eq('timestamp', item.timestamp);
          } catch (e) {
            console.warn('[HistoryProvider] Remote deletion failed:', e.message);
          }
        })();
      }
      return true;
    }
    return false;
  }, [history]);

  const clearHistory = useCallback(async () => {
    const success = await clearScanHistory();
    if (success) {
      setHistory([]);
      
      // Remote deletion on Supabase cloud
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            await supabase.from('scan_history').delete().eq('user_id', session.user.id);
          }
        } catch (e) {
          console.warn('[HistoryProvider] Remote clear history failed:', e.message);
        }
      })();
      return true;
    }
    return false;
  }, []);


  const searchHistory = useCallback(
    (query) => {
      if (!query) return history;
      const q = query.toLowerCase();
      return history.filter(
        (h) =>
          h.food_name?.toLowerCase().includes(q) ||
          h.ai_response?.toLowerCase().includes(q)
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
