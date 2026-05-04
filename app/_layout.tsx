import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Head, Stack } from 'expo-router';
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
      <Head>
        <title>CubeTimer Pro | WCA Speedcubing Timer</title>
        <meta name="description" content="Cronómetro profesional para speedcubing. Entrena algoritmos OLL/PLL, guarda tus estadísticas y mejora tus tiempos WCA." />
        <meta name="keywords" content="rubik, speedcubing, timer, cronómetro rubik, wca, algoritmos, oll, pll" />
        <meta property="og:title" content="CubeTimer Pro | WCA Speedcubing Timer" />
        <meta property="og:description" content="Cronómetro profesional para speedcubing. Entrena algoritmos OLL/PLL, guarda tus estadísticas y mejora tus tiempos WCA." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#121212" />
      </Head>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
