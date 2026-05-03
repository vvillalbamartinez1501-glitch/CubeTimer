import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Switch,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [inspectionSound, setInspectionSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const bg = isDark ? '#121212' : '#f0f4f8';
  const cardBg = isDark ? '#1e1e2e' : '#ffffff';
  const textPrimary = isDark ? '#e9ecef' : '#212529';
  const textSecondary = isDark ? '#868e96' : '#6c757d';
  const accent = isDark ? '#4dabf7' : '#228be6';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#e9ecef' }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>{t('settings.title') || 'Ajustes'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Language Section */}
        <Text style={[styles.sectionTitle, { color: textSecondary }]}>{t('settings.language') || 'Idioma'}</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {LANGUAGES.map((lang, index) => (
            <Pressable
              key={lang.code}
              style={[
                styles.itemRow,
                index < LANGUAGES.length - 1 && [styles.borderBottom, { borderBottomColor: isDark ? '#2a2a3e' : '#f1f3f5' }]
              ]}
              onPress={() => i18n.changeLanguage(lang.code)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={[styles.itemLabel, { color: textPrimary }]}>{lang.label}</Text>
              </View>
              {i18n.language === lang.code && (
                <Ionicons name="checkmark-circle" size={22} color={accent} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Theme Section (Simplified for now as forcing theme requires more logic) */}
        <Text style={[styles.sectionTitle, { color: textSecondary }]}>{t('settings.appearance') || 'Apariencia'}</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={22} color={accent} />
              <Text style={[styles.itemLabel, { color: textPrimary }]}>
                {isDark ? (t('settings.darkMode') || 'Modo Oscuro') : (t('settings.lightMode') || 'Modo Claro')}
              </Text>
            </View>
            <Text style={{ color: textSecondary, fontSize: 12 }}>{t('settings.systemDefault') || 'Sistema'}</Text>
          </View>
        </View>

        {/* Placeholders for future settings */}
        <Text style={[styles.sectionTitle, { color: textSecondary }]}>{t('settings.timer') || 'Cronómetro'}</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={[styles.itemRow, styles.borderBottom, { borderBottomColor: isDark ? '#2a2a3e' : '#f1f3f5' }]}>
            <View style={styles.itemLeft}>
              <Ionicons name="volume-medium-outline" size={22} color={accent} />
              <Text style={[styles.itemLabel, { color: textPrimary }]}>{t('settings.inspectionSound') || 'Sonido de Inspección'}</Text>
            </View>
            <Switch value={inspectionSound} onValueChange={setInspectionSound} trackColor={{ true: accent }} />
          </View>
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Ionicons name="notifications-outline" size={22} color={accent} />
              <Text style={[styles.itemLabel, { color: textPrimary }]}>{t('settings.vibration') || 'Vibración'}</Text>
            </View>
            <Switch value={vibration} onValueChange={setVibration} trackColor={{ true: accent }} />
          </View>
        </View>

        {/* App Info Placeholder */}
        <Text style={[styles.sectionTitle, { color: textSecondary }]}>{t('settings.about') || 'Acerca de'}</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.itemRow}>
            <Text style={[styles.itemLabel, { color: textPrimary }]}>CubeTimer</Text>
            <Text style={{ color: textSecondary }}>v1.2.0</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({ ios: { paddingTop: 50 }, android: { paddingTop: 20 } }),
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backButton: { padding: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemLabel: { fontSize: 16, fontWeight: '500' },
  flag: { fontSize: 20 },
  borderBottom: { borderBottomWidth: StyleSheet.hairlineWidth },
});
