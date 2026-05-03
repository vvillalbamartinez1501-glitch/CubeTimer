import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Evitar errores de Polyfill en entornos Node (Server Side)
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// 2. Verificar si estamos en un entorno con acceso a Web APIs
const canUseDOM = typeof window !== 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Solo usamos AsyncStorage si estamos en el cliente (navegador/móvil)
    // En el servidor (build time), pasamos un almacenamiento vacío
    storage: canUseDOM ? AsyncStorage : undefined,
    autoRefreshToken: canUseDOM,
    persistSession: canUseDOM,
    detectSessionInUrl: canUseDOM,
  },
});