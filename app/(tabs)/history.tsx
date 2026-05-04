import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, useColorScheme, Platform, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../src/store/useAppStore';
import { getSolves, deleteSolve, clearSessionSolves } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';
import { CategorySelector } from '../../src/components/CategorySelector';
import { Header } from '../../src/components/Header';

interface SolveRecord {
  id: number;
  time: number;
  scramble: string;
  date: string;
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  
  const { activeUserId, activeCategoryId, activeSessionId } = useAppStore();
  const [solves, setSolves] = useState<SolveRecord[]>([]);

  const fetchSolves = async () => {
    const data = await getSolves(activeUserId, activeCategoryId, activeSessionId);
    if (data) {
      setSolves(data as SolveRecord[]);
    }
  };


  // Se ejecuta cada vez que la pantalla gana el foco o cambia el usuario/categoría
  useFocusEffect(
    useCallback(() => {
      fetchSolves();
    }, [activeUserId, activeCategoryId, activeSessionId])
  );

  const handleDelete = useCallback(async (id: number) => {
    const title = t('history.deleteConfirmTitle') || '¿Eliminar registro?';
    const msg = t('history.deleteConfirmMsg') || 'Esta acción no se puede deshacer.';

    const performDelete = async () => {
      try {
        await deleteSolve(id);
        setSolves(prev => prev.filter(s => s.id !== id));
        if (Platform.OS !== 'web') {
          Alert.alert(t('actions.success') || 'Éxito', t('history.deletedSuccess') || 'Eliminado correctamente');
        }
      } catch (e) {
        if (Platform.OS !== 'web') Alert.alert('Error', 'No se pudo eliminar el registro');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${msg}`)) {
        performDelete();
      }
      return;
    }

    Alert.alert(title, msg, [
      { text: t('actions.cancel') || 'Cancelar', style: 'cancel' },
      { text: t('actions.delete') || 'Eliminar', style: 'destructive', onPress: performDelete },
    ]);
  }, [t]);

  const handleClearSession = useCallback(() => {
    if (solves.length === 0) return;

    const title = t('history.clearSessionTitle') || '¿Vaciar sesión?';
    const msg = t('history.clearSessionMsg') || '¿Estás seguro de que quieres eliminar TODOS los tiempos de esta sesión? Esta acción no se puede deshacer.';

    const performClear = async () => {
      try {
        await clearSessionSolves(activeUserId, activeCategoryId, activeSessionId);
        setSolves([]);
        if (Platform.OS !== 'web') {
          Alert.alert(t('actions.success') || 'Éxito', t('history.sessionCleared') || 'Sesión vaciada correctamente');
        }
      } catch (e) {
        if (Platform.OS !== 'web') Alert.alert('Error', 'No se pudo vaciar la sesión');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${msg}`)) {
        performClear();
      }
      return;
    }

    Alert.alert(title, msg, [
      { text: t('actions.cancel') || 'Cancelar', style: 'cancel' },
      { text: t('actions.delete') || 'Eliminar', style: 'destructive', onPress: performClear },
    ]);
  }, [t, solves, activeUserId, activeCategoryId, activeSessionId]);

  // ── useMemo: solo se recalcula cuando cambia la lista de solves ───────────
  const bestTime = useMemo(() => {
    if (solves.length === 0) return '--';
    const best = Math.min(...solves.map(s => s.time));
    return formatTime(best);
  }, [solves]);

  const ao5 = useMemo(() => {
    if (solves.length < 5) return '--';
    const recent5 = solves.slice(0, 5).map(s => s.time).sort((a, b) => a - b);
    const sum = recent5[1] + recent5[2] + recent5[3];
    return formatTime(Math.floor(sum / 3));
  }, [solves]);

  const renderItem = useCallback(({ item }: { item: SolveRecord }) => {
    const dateObj = new Date(item.date);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.solveItem, isDark && styles.solveItemDark]}>
        <View style={styles.solveInfo}>
          <Text style={[styles.solveTime, isDark && styles.textDark]}>{formatTime(item.time)}</Text>
          <Text style={styles.solveDate}>{dateStr} {timeStr}</Text>
        </View>
        <Pressable 
          onPress={() => handleDelete(item.id)} 
          style={({ hovered, pressed }) => [
            styles.deleteButton,
            hovered && Platform.OS === 'web' && { opacity: 0.7, transform: [{ scale: 1.2 }] },
            pressed && { opacity: 0.5, transform: [{ scale: 0.9 }] }
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="#ff3b30" />
        </Pressable>
      </View>
    );
  }, [isDark, handleDelete]);

  const router = useRouter();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header titleKey="tabs.history" />

      <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Stats de Sesión</Text>
          <Pressable onPress={handleClearSession} style={styles.clearButton}>
            <Ionicons name="trash-bin-outline" size={20} color="#ff3b30" />
          </Pressable>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{t('history.bestTime')}</Text>
            <Text style={[styles.statValue, isDark && styles.textDark]}>{bestTime}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{t('history.ao5')}</Text>
            <Text style={[styles.statValue, isDark && styles.textDark]}>{ao5}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={solves}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, isDark && styles.textLight]}>
            {t('history.empty')}
          </Text>
        }
      />
    </View>
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
  header: {
    paddingTop: 20,
    zIndex: 10,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  statsContainerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8e8e93',
    textTransform: 'uppercase',
  },
  clearButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#868e96',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  solveItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  solveItemDark: {
    backgroundColor: '#1e1e1e',
  },
  solveInfo: {
    flex: 1,
  },
  solveTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  solveDate: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 4,
  },
  deleteButton: {
    padding: 10,
  },
  textDark: {
    color: '#f8f9fa',
  },
  textLight: {
    color: '#adb5bd',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#868e96',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  syncBannerDark: {
    backgroundColor: '#1e1e2e',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  syncBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  syncBannerSubtitle: {
    fontSize: 12,
    color: '#868e96',
    fontWeight: '500',
  },
});
