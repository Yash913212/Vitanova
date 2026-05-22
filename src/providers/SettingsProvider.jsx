/**
 * NutriVision AI — Settings Provider (SQLite Powered)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings } from '../database/queries/settings.js';
import { DEFAULT_SETTINGS } from '../utils/constants';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Sync settings state with SQLite on startup
  useEffect(() => {
    (async () => {
      const saved = await getSettings();
      if (saved) setSettings(saved);
      setLoaded(true);
    })();
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    const success = await updateSettings({ [key]: value });
    if (success) {
      const next = await getSettings();
      setSettings(next);
      return true;
    }
    return false;
  }, []);

  const resetSettings = useCallback(async () => {
    const success = await updateSettings(DEFAULT_SETTINGS);
    if (success) {
      setSettings(DEFAULT_SETTINGS);
      return true;
    }
    return false;
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
