import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Env vars (replace or set in .env / Vercel dashboard) ────────────────────
// In Expo, prefix with EXPO_PUBLIC_ to expose to the client bundle.
const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL  ?? 'https://YOUR_PROJECT.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'YOUR_ANON_KEY';

// ─── Client ──────────────────────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage so the session persists between app restarts and page reloads
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // set true only for OAuth redirect flows
  },
});
