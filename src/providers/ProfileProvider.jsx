/**
 * NutriVision AI — Profile Provider (SQLite Powered)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from '../database/queries/profile.js';
import { DEFAULT_PROFILE } from '../utils/constants';
import { syncData } from '../services/supabase/syncService.js';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  // Sync profile state with SQLite on startup
  useEffect(() => {
    (async () => {
      const saved = await getUserProfile();
      if (saved) setProfile(saved);
      setLoaded(true);
    })();
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const success = await updateUserProfile(updates, 0);
    if (success) {
      const next = await getUserProfile();
      setProfile(next);
      // Run background sync
      syncData();
      return true;
    }
    return false;
  }, []);

  const resetProfile = useCallback(async () => {
    const success = await updateUserProfile(DEFAULT_PROFILE, 0);
    if (success) {
      setProfile({ id: 1, ...DEFAULT_PROFILE, synced: 0 });
      syncData();
      return true;
    }
    return false;
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
