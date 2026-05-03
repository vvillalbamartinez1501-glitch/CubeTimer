import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// react-native-url-polyfill only needed on native (web has URL built in)
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

// ─── Env vars ─────────────────────────────────────────────────────────────────
// Expo exposes EXPO_PUBLIC_* vars to the client bundle at build time.
// Set them in .env.local (dev) and in Vercel dashboard (production).
const supabaseUrl      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? '';
const supabaseAnonKey  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase env vars missing. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
    'in .env.local (dev) or Vercel environment variables (production). ' +
    'The app will run in offline-only mode.',
  );
}

// ─── Client ──────────────────────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // AsyncStorage persists the session on native; web falls back to localStorage
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
