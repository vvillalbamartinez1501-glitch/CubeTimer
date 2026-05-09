import { useColorScheme } from 'react-native';
import { useAppStore, AccentColor } from '../store/useAppStore';

const ACCENT_PALETTES: Record<AccentColor, string> = {
  green: '#37b24d',
  blue: '#228be6',
  yellow: '#fab005',
  white: '#adb5bd', // Usamos un gris claro para "blanco" para mantener visibilidad
  red: '#fa5252',
  orange: '#fd7e14',
};

export const useThemeColors = () => {
  const systemColorScheme = useColorScheme();
  const { themeMode, accentColor } = useAppStore((state) => state.settings);

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  return {
    isDark,
    background: isDark ? '#121212' : '#f8f9fa',
    card: isDark ? '#1e1e2e' : '#ffffff',
    text: isDark ? '#e9ecef' : '#212529',
    muted: isDark ? '#868e96' : '#6c757d',
    primary: ACCENT_PALETTES[accentColor],
    border: isDark ? '#333333' : '#e9ecef',
    surface: isDark ? '#2c2c3e' : '#e9ecef',
  };
};
