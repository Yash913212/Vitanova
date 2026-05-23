/**
 * NutriVision AI — Settings Provider
 * User-scoped: each account gets its own isolated settings.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getData, setData, getUserKey } from '../services/storageService';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';
import { useAuth } from './AuthProvider';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const userEmail = user?.email || '';
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Reload settings whenever the user changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoaded(false);
      const key = getUserKey(STORAGE_KEYS.SETTINGS, userEmail);
      const saved = await getData(key);
      if (!cancelled) {
        setSettings((prev) => {
          const currentTheme = prev.theme;
          
          // Determine the next theme.
          // 1. If the current active theme (guest theme state) is non-default (i.e. 'dark'), it means the user explicitly toggled it.
          //    We should prioritize this explicit user choice.
          // 2. Otherwise, if there is a saved setting, load it.
          // 3. Otherwise, use the current active theme (or default).
          let nextTheme = DEFAULT_SETTINGS.theme;
          if (currentTheme && currentTheme !== DEFAULT_SETTINGS.theme) {
            nextTheme = currentTheme;
          } else if (saved && saved.theme) {
            nextTheme = saved.theme;
          } else {
            nextTheme = currentTheme || DEFAULT_SETTINGS.theme;
          }

          const next = {
            ...DEFAULT_SETTINGS,
            ...(saved || {}),
            theme: nextTheme,
          };

          // If this is a real user, save their settings so the carried-over theme preference is persisted immediately
          if (userEmail) {
            setData(key, next);
          }
          return next;
        });
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [userEmail]);

  const updateSetting = useCallback(async (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      const storageKey = getUserKey(STORAGE_KEYS.SETTINGS, userEmail);
      setData(storageKey, next);
      return next;
    });
  }, [userEmail]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    const key = getUserKey(STORAGE_KEYS.SETTINGS, userEmail);
    await setData(key, DEFAULT_SETTINGS);
  }, [userEmail]);

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
