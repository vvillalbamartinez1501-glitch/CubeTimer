import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// URL polyfill — native only (web has URL built-in)
if (Platform.OS !== 'web') {
  try { require('react-native-url-polyfill/auto'); } catch (_) {}
}

const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL     ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const canUseDOM = typeof window !== 'undefined';

// ─── Safe client factory ──────────────────────────────────────────────────────
// createClient throws if the URL is empty/invalid, which crashes the whole app.
// We return a real client only when credentials are present.
function buildClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[Supabase] Missing env vars — running in offline mode.\n' +
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
    // Return a do-nothing stub so callers never throw
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: {}, error: { message: 'Offline mode' } }),
        signUp: async () => ({ data: {}, error: { message: 'Offline mode' } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        insert: async () => ({ error: null }),
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: async () => ({ data: [], error: null }),
            }),
          }),
        }),
        delete: () => ({
          eq: () => ({
            eq: async () => ({ error: null }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: canUseDOM ? AsyncStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = buildClient();