import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// i18n must be imported before any screen renders
import '../src/i18n';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '../src/lib/supabase';
import { useAppStore } from '../src/store/useAppStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setSupabaseUser = useAppStore(s => s.setSupabaseUser);

  useEffect(() => {
    // Hydrate session — wrapped in try/catch so any Supabase error never blocks render
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSupabaseUser(session?.user ?? null);
      } catch (e) {
        console.warn('[RootLayout] getSession error (app continues):', e);
        setSupabaseUser(null);
      }
    };

    init();

    // Listen to auth state changes
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSupabaseUser(session?.user ?? null);
      });
      subscription = data.subscription;
    } catch (e) {
      console.warn('[RootLayout] onAuthStateChange error (app continues):', e);
    }

    return () => {
      try { subscription?.unsubscribe(); } catch (_) {}
    };
  }, []);

  // NEVER return null — routes must always be available
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
