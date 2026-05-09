import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, Pressable, 
  useWindowDimensions, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, ThemeMode, AccentColor } from '../../src/store/useAppStore';
import { Header } from '../../src/components/Header';
import { getTotalSolves, getCategorySolveCount } from '../../src/database/operations';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { useHydratedStore } from '../../src/hooks/useHydratedStore';

const ACCENT_COLORS: AccentColor[] = ['green', 'blue', 'yellow', 'white', 'red', 'orange'];
const ACCENT_VALUES: Record<AccentColor, string> = {
  green: '#37b24d',
  blue: '#228be6',
  yellow: '#fab005',
  white: '#ffffff',
  red: '#fa5252',
  orange: '#fd7e14',
};

export default function ProfileScreen() {
  const isHydrated = useHydratedStore();
  const { isDark, background, card, text, muted, primary, border, surface } = useThemeColors();
  const { width } = useWindowDimensions();
  const { 
    activeUserId, 
    settings, 
    setProfileName, 
    setThemeMode, 
    setAccentColor 
  } = useAppStore();
  
  const [localName, setLocalName] = useState('');
  const [totalSolves, setTotalSolves] = useState(0);
  const [solves3x3, setSolves3x3] = useState(0);

  useEffect(() => {
    if (isHydrated) {
      setLocalName(settings.profileName);
    }
  }, [isHydrated, settings.profileName]);

  useEffect(() => {
    if (!isHydrated) return;
    const loadStats = async () => {
      const total = await getTotalSolves(activeUserId);
      const s3x3 = await getCategorySolveCount(activeUserId, '3x3');
      setTotalSolves(total);
      setSolves3x3(s3x3);
    };
    loadStats();
  }, [activeUserId, isHydrated]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  const handleNameBlur = () => {
    if (localName.trim() !== '') {
      setProfileName(localName.trim());
    } else {
      setLocalName(settings.profileName);
    }
  };

  const renderThemeOption = (mode: ThemeMode, icon: keyof typeof Ionicons.glyphMap, label: string) => {
    const isActive = settings.themeMode === mode;
    return (
      <Pressable
        style={[
          styles.themeOption,
          { backgroundColor: isActive ? primary + '22' : surface },
          isActive && { borderColor: primary, borderWidth: 2 }
        ]}
        onPress={() => setThemeMode(mode)}
      >
        <Ionicons name={icon} size={24} color={isActive ? primary : muted} />
        <Text style={[styles.themeLabel, { color: isActive ? primary : text }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Header titleKey="tabs.profile" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: card }]}>
          <View style={[styles.iconBg, { backgroundColor: primary + '22' }]}>
            <Ionicons name="person" size={40} color={primary} />
          </View>
          <TextInput
            style={[styles.nameInput, { color: text }]}
            value={localName}
            onChangeText={setLocalName}
            onBlur={handleNameBlur}
            placeholder="Tu nombre"
            placeholderTextColor={muted}
          />
          <Text style={[styles.subtitle, { color: muted }]}>Progreso guardado localmente</Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>🎨 Personalización</Text>
          
          <View style={[styles.card, { backgroundColor: card }]}>
            {/* Theme Mode */}
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: text }]}>Modo de Aplicación</Text>
              <View style={styles.themeContainer}>
                {renderThemeOption('light', 'sunny', 'Claro')}
                {renderThemeOption('dark', 'moon', 'Oscuro')}
                {renderThemeOption('system', 'settings-outline', 'Sistema')}
              </View>
            </View>

            {/* Accent Color */}
            <View style={[styles.settingRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: border }]}>
              <Text style={[styles.settingLabel, { color: text }]}>Color de Acento</Text>
              <View style={styles.colorGrid}>
                {ACCENT_COLORS.map((color) => {
                  const isSelected = settings.accentColor === color;
                  return (
                    <Pressable
                      key={color}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: ACCENT_VALUES[color] },
                        isSelected && { borderColor: text, borderWidth: 3 }
                      ]}
                      onPress={() => setAccentColor(color)}
                    >
                      {isSelected && (
                        <Ionicons 
                          name="checkmark" 
                          size={18} 
                          color={color === 'white' || color === 'yellow' ? '#000' : '#fff'} 
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>📊 Estadísticas</Text>
          <View style={[styles.card, { backgroundColor: card }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: muted }]}>Total Resoluciones</Text>
              <Text style={[styles.infoValue, { color: text }]}>{totalSolves}</Text>
            </View>
            <View style={[styles.infoRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: border }]}>
              <Text style={[styles.infoLabel, { color: muted }]}>Resoluciones 3x3</Text>
              <Text style={[styles.infoValue, { color: text }]}>{solves3x3}</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>ℹ️ Información</Text>
          <View style={[styles.card, { backgroundColor: card }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: muted }]}>Versión</Text>
              <Text style={[styles.infoValue, { color: text }]}>v1.2.0 (Local First)</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  
  profileCard: {
    borderRadius: 24, padding: 24, marginBottom: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  iconBg: { 
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', 
    alignItems: 'center', marginBottom: 16 
  },
  nameInput: { 
    fontSize: 24, fontWeight: '800', marginBottom: 6, textAlign: 'center',
    paddingHorizontal: 16, width: '100%'
  },
  subtitle: { fontSize: 14, textAlign: 'center' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', paddingLeft: 4, marginBottom: 12 },
  card: {
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  settingRow: { padding: 16 },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  
  themeContainer: { flexDirection: 'row', gap: 8 },
  themeOption: {
    flex: 1, height: 80, borderRadius: 12, justifyContent: 'center', 
    alignItems: 'center', gap: 4, borderWidth: 2, borderColor: 'transparent'
  },
  themeLabel: { fontSize: 12, fontWeight: '700' },

  colorGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  colorCircle: {
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', 
    alignItems: 'center', borderWidth: 2, borderColor: 'transparent'
  },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15, fontWeight: '600' },
});
