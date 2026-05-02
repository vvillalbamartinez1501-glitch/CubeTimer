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
    // Hydrate session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
    });

    // Listen to all auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSupabaseUser(session?.user ?? null);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
