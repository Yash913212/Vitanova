/**
 * NutriVision AI — Settings Provider
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getData, setData } from '../services/storageService';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getData(STORAGE_KEYS.SETTINGS);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });
      setLoaded(true);
    })();
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setData(STORAGE_KEYS.SETTINGS, next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await setData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
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
