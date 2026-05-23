/**
 * NutriVision AI — Auth Provider
 * Uses Supabase Auth for real authentication.
 * Local user-scoped storage for profile/history/settings remains separate.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes on mount
  useEffect(() => {
    // Check current session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || '',
            isLoggedIn: true,
          });
        }
      } catch (e) {
        console.warn('Auth init error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || '',
            isLoggedIn: true,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { name }, // stored in user_metadata
      },
    });

    if (error) throw new Error(error.message);

    // Supabase may require email confirmation depending on project settings.
    // If the user is returned immediately, set them.
    if (data?.user) {
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: name,
        isLoggedIn: true,
      };
      setUser(userData);
      return userData;
    }

    // If email confirmation is required, user won't be immediately authenticated
    return { confirmationRequired: true };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) throw new Error(error.message);

    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || '',
      isLoggedIn: true,
    };
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('Logout error:', error.message);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates) => {
    // Update Supabase user metadata if name changed
    if (updates.name) {
      await supabase.auth.updateUser({
        data: { name: updates.name },
      });
    }
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
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
