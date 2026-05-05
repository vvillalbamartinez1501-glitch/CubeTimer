import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// i18n must be imported before any screen renders
import '../src/i18n';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '../src/store/useAppStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
