/**
 * NutriVision AI — Auth Provider
 * Local auth using AsyncStorage (no backend).
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getData, setData } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await getData(STORAGE_KEYS.AUTH);
        if (saved && saved.isLoggedIn) {
          setUser(saved);
        }
      } catch (e) {
        console.warn('Auth load error:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    // Save user locally
    const userData = {
      name,
      email,
      password, // In production, this would be hashed
      isLoggedIn: true,
      createdAt: new Date().toISOString(),
    };
    await setData(STORAGE_KEYS.AUTH, userData);
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const saved = await getData(STORAGE_KEYS.AUTH);
    if (!saved) {
      throw new Error('No account found. Please sign up first.');
    }
    if (saved.email !== email) {
      throw new Error('Email not found. Please check and try again.');
    }
    if (saved.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }
    const userData = { ...saved, isLoggedIn: true };
    await setData(STORAGE_KEYS.AUTH, userData);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    const saved = await getData(STORAGE_KEYS.AUTH);
    if (saved) {
      await setData(STORAGE_KEYS.AUTH, { ...saved, isLoggedIn: false });
    }
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      setData(STORAGE_KEYS.AUTH, next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
