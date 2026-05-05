import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/useAppStore';
import { Header } from '../../src/components/Header';
import { getTotalSolves, getCategorySolveCount } from '../../src/database/operations';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { activeUserId } = useAppStore();
  
  const [totalSolves, setTotalSolves] = useState(0);
  const [solves3x3, setSolves3x3] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const total = await getTotalSolves(activeUserId);
      const s3x3 = await getCategorySolveCount(activeUserId, '3x3');
      setTotalSolves(total);
      setSolves3x3(s3x3);
    };
    loadStats();
  }, [activeUserId]);

  const bg = isDark ? '#121212' : '#f0f4f8';
  const cardBg = isDark ? '#1e1e2e' : '#fff';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol = isDark ? '#868e96' : '#6c757d';
  const accent = isDark ? '#4dabf7' : '#228be6';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <Header titleKey="tabs.profile" />
      <ScrollView
        style={[styles.container, { backgroundColor: bg }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Info */}
        <View style={[styles.profileCard, { backgroundColor: cardBg }]}>
          <View style={[styles.iconBg, { backgroundColor: accent + '22' }]}>
            <Ionicons name="person" size={40} color={accent} />
          </View>
          <Text style={[styles.title, { color: textCol }]}>Cuber Local</Text>
          <Text style={[styles.subtitle, { color: mutedCol }]}>Progreso guardado en el dispositivo</Text>
        </View>

        {/* Local Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            📊 Estadísticas Generales
          </Text>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: mutedCol }]}>Total Resoluciones</Text>
              <Text style={[styles.infoValue, { color: textCol }]}>{totalSolves}</Text>
            </View>
            <View style={[styles.infoRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: isDark ? '#333' : '#e9ecef' }]}>
              <Text style={[styles.infoLabel, { color: mutedCol }]}>Resoluciones 3x3</Text>
              <Text style={[styles.infoValue, { color: textCol }]}>{solves3x3}</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            ℹ️ Información de la App
          </Text>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: mutedCol }]}>CubeTimer</Text>
              <Text style={[styles.infoValue, { color: textCol }]}>v1.2.0 (Local First)</Text>
            </View>
            <View style={[styles.infoRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: isDark ? '#333' : '#e9ecef' }]}>
              <Text style={[styles.infoLabel, { color: mutedCol }]}>Almacenamiento</Text>
              <Text style={[{ fontSize: 15, fontWeight: '600' }, { color: '#37b24d' }]}>
                📱 Memoria Local
              </Text>
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
    borderRadius: 20, padding: 24, marginBottom: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  iconBg: { 
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', 
    alignItems: 'center', marginBottom: 16 
  },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 8 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingLeft: 4, marginBottom: 10 },
  card: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15, fontWeight: '600' },
});
