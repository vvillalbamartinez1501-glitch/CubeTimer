import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../src/store/useAppStore';
import { getSolves, deleteSolve } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';
import { CategorySelector } from '../../src/components/CategorySelector';

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
  
  const { activeUserId, activeCategoryId } = useAppStore();
  const [solves, setSolves] = useState<SolveRecord[]>([]);

  const fetchSolves = async () => {
    if (Platform.OS === 'web') return; // En web no tenemos SQLite activo aún
    const data = await getSolves(activeUserId, activeCategoryId);
    if (data) {
      setSolves(data as SolveRecord[]);
    }
  };

  // Se ejecuta cada vez que la pantalla gana el foco o cambia el usuario/categoría
  useFocusEffect(
    useCallback(() => {
      fetchSolves();
    }, [activeUserId, activeCategoryId])
  );

  const handleDelete = async (id: number) => {
    await deleteSolve(id);
    setSolves(solves.filter(s => s.id !== id));
  };

  const calculateBest = () => {
    if (solves.length === 0) return '--';
    const best = Math.min(...solves.map(s => s.time));
    return formatTime(best);
  };

  const calculateAo5 = () => {
    if (solves.length < 5) return '--';
    // Tomamos los 5 más recientes (están ordenados de más nuevo a más viejo)
    const recent5 = solves.slice(0, 5).map(s => s.time);
    // Ordenamos de menor a mayor
    recent5.sort((a, b) => a - b);
    // Excluimos el mejor (index 0) y el peor (index 4)
    const sum = recent5[1] + recent5[2] + recent5[3];
    return formatTime(Math.floor(sum / 3));
  };

  const renderItem = ({ item }: { item: SolveRecord }) => {
    const dateObj = new Date(item.date);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.solveItem, isDark && styles.solveItemDark]}>
        <View style={styles.solveInfo}>
          <Text style={[styles.solveTime, isDark && styles.textDark]}>{formatTime(item.time)}</Text>
          <Text style={styles.solveDate}>{dateStr} {timeStr}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <CategorySelector />
      </View>
      
      <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('history.bestTime')}</Text>
          <Text style={[styles.statValue, isDark && styles.textDark]}>{calculateBest()}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('history.ao5')}</Text>
          <Text style={[styles.statValue, isDark && styles.textDark]}>{calculateAo5()}</Text>
        </View>
      </View>

      {Platform.OS === 'web' ? (
        <Text style={[styles.emptyText, isDark && styles.textLight]}>
          {t('history.webNotAvailable')}
        </Text>
      ) : (
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
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-around',
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
});
