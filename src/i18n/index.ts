import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '../locales/en.json';
import es from '../locales/es.json';
import zh from '../locales/zh.json';
import hi from '../locales/hi.json';
import fr from '../locales/fr.json';

const SUPPORTED_LANGUAGES = ['en', 'es', 'zh', 'hi', 'fr'];

// Detectar idioma del dispositivo
const getDeviceLanguage = (): string => {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const deviceLang = locales[0].languageCode ?? 'en';
      // Si el idioma del dispositivo está soportado, úsalo
      if (SUPPORTED_LANGUAGES.includes(deviceLang)) {
        return deviceLang;
      }
    }
  } catch (e) {
    console.warn('Could not detect device language:', e);
  }
  return 'en'; // Fallback
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh },
      hi: { translation: hi },
      fr: { translation: fr },
    },
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React Native ya escapa por defecto
    },
    compatibilityJSON: 'v4', // Recomendado para React Native
  });

export default i18n;
