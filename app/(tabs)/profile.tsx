import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language;

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, isDark && styles.avatarDark]}>
          <Ionicons name="person" size={48} color={isDark ? '#4dabf7' : '#007aff'} />
        </View>
        <Text style={[styles.userName, isDark && styles.textDark]}>Jugador 1</Text>
      </View>

      {/* Sección de idioma */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          🌐 {t('profile.selectLanguage')}
        </Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langRow,
                index < LANGUAGES.length - 1 && styles.langRowBorder,
                isDark && styles.langRowBorderDark,
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <View style={styles.langInfo}>
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, isDark && styles.textDark]}>{lang.label}</Text>
              </View>
              {currentLang === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color="#007aff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info de la app */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          ℹ️ {t('profile.appInfo')}
        </Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isDark && styles.textMuted]}>CubeTimer</Text>
            <Text style={[styles.infoValue, isDark && styles.textDark]}>v1.0.0</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarDark: {
    backgroundColor: '#2c2c2c',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  langRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e9ecef',
  },
  langRowBorderDark: {
    borderBottomColor: '#333',
  },
  langInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langFlag: {
    fontSize: 24,
  },
  langLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: '#868e96',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  textDark: {
    color: '#f8f9fa',
  },
  textMuted: {
    color: '#adb5bd',
  },
});
