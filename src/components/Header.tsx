import React from 'react';
import { StyleSheet, Text, View, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CategorySelector } from './CategorySelector';

interface HeaderProps {
  titleKey: string;
}

export const Header: React.FC<HeaderProps> = ({ titleKey }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Izquierda: Logo, App Name y Tab Name */}
      <View style={styles.headerLeft}>
        <View style={styles.logoTitleGroup}>
          <Ionicons name="cube-outline" size={28} color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>CubeTimer</Text>
        </View>
        <View style={styles.tabNameBadge}>
          <Text style={[styles.tabNameText, isDark && styles.textDark]}>
            {t(titleKey) || 'Timer'}
          </Text>
        </View>
      </View>

      {/* Centro: Selectores */}
      <View style={styles.headerCenter}>
        <Pressable style={[styles.sessionPill, isDark && styles.sessionPillDark]}>
          <Text style={[styles.sessionPillText, isDark && styles.textDark]}>Sesión 1</Text>
          <Ionicons name="chevron-down" size={14} color={isDark ? '#aaa' : '#666'} />
        </Pressable>
        <View style={{ zIndex: 100 }}>
          <CategorySelector />
        </View>
      </View>

      {/* Derecha: Iconos */}
      <View style={styles.headerRight}>
        <Pressable style={styles.iconButton}>
          <Ionicons name="settings-outline" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Pressable style={styles.iconButton}>
          <Ionicons name="person-outline" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabNameBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#007aff',
  },
  tabNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  sessionPillDark: {
    backgroundColor: '#343a40',
  },
  sessionPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 4,
  },
  textDark: {
    color: '#f8f9fa',
  },
});
