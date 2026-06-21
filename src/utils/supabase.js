import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Custom fetch wrapper to handle connection/DNS errors (e.g. when offline or when a project is paused)
const supabaseFetch = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error.message && error.message.toLowerCase().includes('network request failed'))
    ) {
      console.warn(`[Supabase Offline] Graceful fallback activated. Unreachable endpoint: ${url}`);
      
      // If it's a token refresh request, mock a successful refresh with the current stored session
      // to prevent GoTrue from spamming console.errors and throwing unhandled rejections.
      if (url.includes('/auth/v1/token') && url.includes('grant_type=refresh_token')) {
        try {
          const storageKey = 'supabase.auth.token';
          const storedSessionStr = await AsyncStorage.getItem(storageKey);
          if (storedSessionStr) {
            const session = JSON.parse(storedSessionStr);
            if (session && session.access_token) {
              console.log('[Supabase Offline] Mocking successful token refresh using cached session.');
              // Reset the expires_in timer so the client stops attempting to refresh for a while
              const mockSession = {
                ...session,
                expires_in: 3600, // 1 hour
              };
              return new Response(
                JSON.stringify(mockSession),
                {
                  status: 200,
                  statusText: 'OK',
                  headers: new Headers({
                    'Content-Type': 'application/json',
                  }),
                }
              );
            }
          }
        } catch (storageErr) {
          console.warn('[Supabase Offline] Failed to read cached session:', storageErr);
        }
      }
      
      // Return a simulated 503 Service Unavailable response so the client handles it cleanly
      return new Response(
        JSON.stringify({
          error: 'offline_mode',
          message: 'Network connection failed. The Supabase project may be paused, deleted, or offline.',
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        }
      );
    }
    throw error;
  }
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: supabaseFetch,
    },
  }
);

