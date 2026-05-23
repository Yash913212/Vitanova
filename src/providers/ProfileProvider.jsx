/**
 * NutriVision AI — Profile Provider
 * User-scoped: each account gets its own isolated profile data.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getData, setData, getUserKey } from '../services/storageService';
import { STORAGE_KEYS, DEFAULT_PROFILE } from '../utils/constants';
import { useAuth } from './AuthProvider';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const userEmail = user?.email || '';
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  // Reload profile whenever the user changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoaded(false);
      const key = getUserKey(STORAGE_KEYS.PROFILE, userEmail);
      const saved = await getData(key);
      if (!cancelled) {
        setProfile(saved ? { ...DEFAULT_PROFILE, ...saved } : DEFAULT_PROFILE);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [userEmail]);

  const updateProfile = useCallback(async (updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      const key = getUserKey(STORAGE_KEYS.PROFILE, userEmail);
      setData(key, next);
      return next;
    });
  }, [userEmail]);

  const resetProfile = useCallback(async () => {
    setProfile(DEFAULT_PROFILE);
    const key = getUserKey(STORAGE_KEYS.PROFILE, userEmail);
    await setData(key, DEFAULT_PROFILE);
  }, [userEmail]);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, resetProfile, loaded, profileUserEmail: userEmail }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
