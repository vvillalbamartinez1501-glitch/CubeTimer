import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  useColorScheme, useWindowDimensions, FlatList, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTime } from '../../src/utils/timeFormat';
import {
  PLL_ALGORITHMS, OLL_ALGORITHMS, Algorithm,
} from '../../src/constants/algorithms';
import { useAppStore } from '../../src/store/useAppStore';
import { AlgorithmImage } from '../../src/components/learning/AlgorithmImage';
import { Header } from '../../src/components/Header';

const DRILL_KEY = '@drill_times';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DrillTime { algorithmId: string; time: number; date: string; }
type TimerState = 'idle' | 'holding' | 'running' | 'finished';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const loadDrillTimes = async (): Promise<DrillTime[]> => {
  try {
    const raw = await AsyncStorage.getItem(DRILL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
const saveDrillTime = async (entry: DrillTime) => {
  const all = await loadDrillTimes();
  all.push(entry);
  await AsyncStorage.setItem(DRILL_KEY, JSON.stringify(all));
};
const getStatsForAlg = (times: DrillTime[], id: string) => {
  const t = times.filter(x => x.algorithmId === id).map(x => x.time);
  if (t.length === 0) return null;
  const best = Math.min(...t);
  const avg = t.reduce((a, b) => a + b, 0) / t.length;
  return { best, avg, count: t.length };
};

// ─── Algorithm Card ───────────────────────────────────────────────────────────
interface AlgCardProps {
  alg: Algorithm;
  stats: { best: number; avg: number; count: number } | null;
  isDark: boolean;
  isHighlighted: boolean;
  onToggleFavorite: (id: string) => void;
  onPress: (alg: Algorithm) => void;
  cardWidth: number;
}

const AlgCard = React.memo(({ alg, stats, isDark, isHighlighted, onToggleFavorite, onPress, cardWidth }: AlgCardProps) => {
  const cardBg = isDark ? '#1e1e2e' : '#ffffff';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol = isDark ? '#868e96' : '#6c757d';
  const accent = alg.group === 'PLL' ? '#e74c3c' : '#3498db';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.algCard,
        { backgroundColor: cardBg, width: cardWidth, opacity: pressed ? 0.8 : 1 }
      ]}
      onPress={() => onPress(alg)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.algBadge, { backgroundColor: accent + '22' }]}>
          <Text style={[styles.algBadgeText, { color: accent }]}>{alg.group}</Text>
        </View>
        <Pressable 
          style={styles.starButton}
          onPress={(e) => { e.stopPropagation(); onToggleFavorite(alg.id); }}
          hitSlop={8}
        >
          <Ionicons 
            name={isHighlighted ? "heart" : "heart-outline"} 
            size={22} 
            color={isHighlighted ? "#ff4757" : mutedCol} 
          />
        </Pressable>
      </View>
      
      <Text style={[styles.algName, { color: textCol }]} numberOfLines={1}>{alg.name}</Text>
      
      <AlgorithmImage imageKey={alg.id} style={styles.algImage} />
      
      <Text style={[styles.algNotation, { color: textCol }]} numberOfLines={2}>
        {alg.algorithm}
      </Text>

      {stats ? (
        <View style={styles.algStats}>
          <Text style={[styles.algStatText, { color: '#37b24d' }]}>
            🏅 {formatTime(stats.best)}
          </Text>
        </View>
      ) : (
        <Text style={[styles.algStatText, { color: mutedCol, marginTop: 4 }]}>Sin datos</Text>
      )}
    </Pressable>
  );
});

// ─── Drill Timer Modal ────────────────────────────────────────────────────────
function DrillTimerModal({
  alg, visible, onClose, onSaved,
}: {
  alg: Algorithm;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [time, setTime] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const stateRef = useRef<TimerState>('idle');
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>();

  const bg = isDark ? '#0d0d1a' : '#f0f4f8';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol = isDark ? '#868e96' : '#6c757d';
  const accent = alg.group === 'PLL' ? '#e74c3c' : '#3498db';

  const setState = (s: TimerState) => { stateRef.current = s; setTimerState(s); };

  const tick = () => {
    setTime(Date.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const handlePress = () => {
    const s = stateRef.current;
    if (s === 'idle') {
      setState('holding');
    } else if (s === 'holding') {
      startRef.current = Date.now();
      setState('running');
      rafRef.current = requestAnimationFrame(tick);
    } else if (s === 'running') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const elapsed = Date.now() - startRef.current;
      setTime(elapsed);
      setState('finished');
    } else if (s === 'finished') {
      setState('idle');
      setTime(0);
    }
  };

  const handleSave = async () => {
    const entry: DrillTime = {
      algorithmId: alg.id,
      time,
      date: new Date().toISOString(),
    };
    await saveDrillTime(entry);
    setTimes(prev => [...prev, time]);
    setState('idle');
    setTime(0);
    onSaved();
  };

  const handleDiscard = () => {
    setState('idle');
    setTime(0);
  };

  const localBest = times.length > 0 ? Math.min(...times) : null;
  const localAvg = times.length > 0
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : null;

  const timerColor = timerState === 'holding' ? '#37b24d'
    : timerState === 'running' ? (isDark ? '#fff' : '#212529')
    : (isDark ? '#fff' : '#212529');

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: bg }]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="chevron-down" size={28} color={mutedCol} />
          </Pressable>
          <Text style={[styles.modalTitle, { color: textCol }]}>{alg.name}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={[styles.algInfoBox, { backgroundColor: isDark ? '#1e1e2e' : '#fff' }]}>
          <AlgorithmImage imageKey={alg.id} style={{ width: 72, height: 72 }} />
          <View style={styles.algInfoText}>
            <Text style={[styles.setupLabel, { color: mutedCol }]}>Setup Move</Text>
            <Text style={[styles.setupAlg, { color: accent }]} selectable>{alg.setup}</Text>
            <Text style={[styles.setupLabel, { color: mutedCol, marginTop: 6 }]}>Algoritmo</Text>
            <Text style={[styles.mainAlg, { color: textCol }]} selectable>{alg.algorithm}</Text>
          </View>
        </View>

        <Pressable style={styles.timerArea} onPress={handlePress}>
          <Text style={[styles.drillTimer, { color: timerColor }]}>
            {formatTime(time)}
          </Text>

          {timerState !== 'finished' && (
            <Pressable
              onPress={(e) => { e.stopPropagation(); handlePress(); }}
              style={({ pressed }) => [
                styles.timerActionButton,
                {
                  backgroundColor: timerState === 'running' ? '#ff4444' : '#00C851',
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                  shadowColor: timerState === 'running' ? '#ff4444' : '#00C851',
                }
              ]}
            >
              <Ionicons 
                name={timerState === 'running' ? "stop" : "play"} 
                size={42} 
                color="#fff" 
              />
            </Pressable>
          )}

          <Text style={[styles.drillInstruction, { color: mutedCol }]}>
            {timerState === 'idle' && 'Toca para preparar'}
            {timerState === 'holding' && '🟢 Suelta para iniciar'}
            {timerState === 'running' && 'Toca para detener'}
            {timerState === 'finished' && ''}
          </Text>

          {timerState === 'finished' && (
            <View style={styles.postSolveRow}>
              <Pressable
                style={[styles.drillActionBtn, { backgroundColor: '#e03131' }]}
                onPress={handleDiscard}
              >
                <Ionicons name="trash" size={24} color="#fff" />
              </Pressable>
              <Pressable
                style={[styles.drillActionBtn, { backgroundColor: '#37b24d' }]}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={28} color="#fff" />
              </Pressable>
            </View>
          )}
        </Pressable>

        {times.length > 0 && (
          <View style={[styles.sessionStats, { backgroundColor: isDark ? '#1e1e2e' : '#fff' }]}>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionStatVal, { color: '#ffd700' }]}>
                {formatTime(localBest!)}
              </Text>
              <Text style={[styles.sessionStatLabel, { color: mutedCol }]}>Mejor</Text>
            </View>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionStatVal, { color: accent }]}>
                {formatTime(localAvg!)}
              </Text>
              <Text style={[styles.sessionStatLabel, { color: mutedCol }]}>Media</Text>
            </View>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionStatVal, { color: textCol }]}>{times.length}</Text>
              <Text style={[styles.sessionStatLabel, { color: mutedCol }]}>Intentos</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TrainScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  const [tab, setTab] = useState<'OLL' | 'PLL'>('OLL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlg, setSelectedAlg] = useState<Algorithm | null>(null);
  const [drillTimes, setDrillTimes] = useState<DrillTime[]>([]);

  const { highlightedAlgs, toggleHighlight } = useAppStore();

  const numColumns = width >= 768 ? (width >= 1024 ? 4 : 3) : 2;
  const cardWidth = (width - 32 - (numColumns - 1) * 12) / numColumns;

  const handleToggleFavorite = useCallback((id: string) => {
    toggleHighlight(id);
  }, [toggleHighlight]);

  const algorithms = tab === 'PLL' ? PLL_ALGORITHMS : OLL_ALGORITHMS;

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return algorithms;
    return algorithms.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.algorithm.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [algorithms, searchQuery]);

  const reloadTimes = useCallback(async () => {
    setDrillTimes(await loadDrillTimes());
  }, []);

  useEffect(() => { reloadTimes(); }, []);

  const bg = isDark ? '#121212' : '#f8f9fa';
  const cardBg = isDark ? '#1e1e2e' : '#fff';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol = isDark ? '#868e96' : '#6c757d';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Header titleKey="tabs.train" />

      {/* ── OLL / PLL Tabs ── */}
      <View style={[styles.mainTabBar, { backgroundColor: cardBg }]}>
        <Pressable
          style={[styles.mainTab, tab === 'OLL' && { borderBottomColor: '#3498db', borderBottomWidth: 3 }]}
          onPress={() => setTab('OLL')}
        >
          <Text style={[styles.mainTabText, { color: tab === 'OLL' ? '#3498db' : mutedCol }]}>OLL</Text>
        </Pressable>
        <Pressable
          style={[styles.mainTab, tab === 'PLL' && { borderBottomColor: '#e74c3c', borderBottomWidth: 3 }]}
          onPress={() => setTab('PLL')}
        >
          <Text style={[styles.mainTabText, { color: tab === 'PLL' ? '#e74c3c' : mutedCol }]}>PLL</Text>
        </Pressable>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#2c2c3e' : '#e9ecef' }]}>
          <Ionicons name="search" size={20} color={mutedCol} />
          <TextInput
            style={[styles.searchInput, { color: textCol }]}
            placeholder="Buscar algoritmo..."
            placeholderTextColor={mutedCol}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={mutedCol} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Algorithm Grid ── */}
      <FlatList
        key={`grid-${numColumns}`} // Force re-render on column change
        data={filteredData}
        keyExtractor={a => a.id}
        numColumns={numColumns}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AlgCard
            alg={item}
            stats={getStatsForAlg(drillTimes, item.id)}
            isDark={isDark}
            isHighlighted={highlightedAlgs.includes(item.id)}
            onToggleFavorite={handleToggleFavorite}
            onPress={setSelectedAlg}
            cardWidth={cardWidth}
          />
        )}
      />

      {/* ── Drill Timer Modal ── */}
      {selectedAlg && (
        <DrillTimerModal
          alg={selectedAlg}
          visible={!!selectedAlg}
          onClose={() => setSelectedAlg(null)}
          onSaved={reloadTimes}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  mainTabBar: {
    flexDirection: 'row',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    zIndex: 10,
  },
  mainTab: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  mainTabText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },

  grid: { padding: 16, gap: 12, paddingBottom: 40 },
  
  algCard: {
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  algBadge: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  algBadgeText: { fontSize: 10, fontWeight: '800' },
  starButton: {
    padding: 4,
  },
  algName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  algImage: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  algNotation: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  algStats: {
    marginTop: 4,
    alignItems: 'center',
  },
  algStatText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
  },
  closeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800' },

  algInfoBox: {
    flexDirection: 'row', margin: 16, borderRadius: 16, padding: 16, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  algInfoText: { flex: 1, justifyContent: 'center' },
  setupLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  setupAlg: { fontSize: 15, fontWeight: '700', marginTop: 2, lineHeight: 22 },
  mainAlg: { fontSize: 13, lineHeight: 20, marginTop: 2 },

  timerArea: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  drillTimer: { fontSize: 72, fontWeight: '200', fontVariant: ['tabular-nums'] },
  drillInstruction: { fontSize: 16, marginTop: 8, fontWeight: '500' },

  postSolveRow: {
    flexDirection: 'row', gap: 32, marginTop: 32,
  },
  drillActionBtn: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },

  sessionStats: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: 16, borderRadius: 16, paddingVertical: 16,
    marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sessionStat: { alignItems: 'center' },
  sessionStatVal: { fontSize: 20, fontWeight: '800' },
  sessionStatLabel: { fontSize: 11, marginTop: 2 },
  
  timerActionButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginVertical: 20,
  },
});

