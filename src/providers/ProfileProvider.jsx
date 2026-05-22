/**
 * NutriVision AI — Profile Provider
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getData, setData } from '../services/storageService';
import { STORAGE_KEYS, DEFAULT_PROFILE } from '../utils/constants';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getData(STORAGE_KEYS.PROFILE);
      if (saved) setProfile({ ...DEFAULT_PROFILE, ...saved });
      setLoaded(true);
    })();
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      setData(STORAGE_KEYS.PROFILE, next);
      return next;
    });
  }, []);

  const resetProfile = useCallback(async () => {
    setProfile(DEFAULT_PROFILE);
    await setData(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, resetProfile, loaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
