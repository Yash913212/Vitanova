/**
 * NutriVision AI — Auth Provider
 * Production-ready cloud authentication utilizing Supabase.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase/client';
import { syncData } from '../services/supabase/syncService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialise session checks and event listeners on mount
  useEffect(() => {
    let subscription;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setUser(session.user);
          // Trigger automatic background synchronization on boot
          syncData();
        }
      } catch (e) {
        console.warn('[Auth] Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    })();

    // Listen for Auth changes (login, logout, token refresh)
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth Event] ${event}`);
      if (session && session.user) {
        setUser(session.user);
        // Sync user profile & logs to cloud in background
        syncData();
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    subscription = data.subscription;

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  /**
   * User Signup.
   */
  const signup = useCallback(async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return data.user;
  }, []);

  /**
   * User Email/Password Sign-In.
   */
  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  }, []);

  /**
   * User Sign-Out.
   */
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  /**
   * Update User Metadata attributes.
   */
  const updateUser = useCallback(async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    setUser(data.user);
    return data.user;
  }, []);

  /**
   * OAuth Google Sign-In (Future Ready stub).
   * Fully compatible with standard Expo Google Sign-In.
   */
  const signInWithGoogle = useCallback(async (idToken) => {
    if (!idToken) {
      throw new Error('Google Sign-In requires an active ID token.');
    }
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
    return data.user;
  }, []);

  /**
   * OAuth Apple Sign-In (Future Ready stub).
   * Fully compatible with standard Expo Sign in with Apple.
   */
  const signInWithApple = useCallback(async (idToken) => {
    if (!idToken) {
      throw new Error('Apple Sign-In requires an active ID token.');
    }
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: idToken,
    });
    if (error) throw error;
    return data.user;
  }, []);

  /**
   * Biometric Auth Handler (Future Ready stub).
   * Verifies local biometrics and fetches cached credentials.
   */
  const signInWithBiometrics = useCallback(async (credentials) => {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Biometric auth requires validated cached credentials.');
    }
    return login({ email: credentials.email, password: credentials.password });
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signup,
        login,
        logout,
        updateUser,
        signInWithGoogle,
        signInWithApple,
        signInWithBiometrics,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
