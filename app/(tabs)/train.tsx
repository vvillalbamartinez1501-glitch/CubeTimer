import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  useColorScheme, Dimensions, Alert, FlatList, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTime } from '../../src/utils/timeFormat';
import {
  PLL_ALGORITHMS, OLL_ALGORITHMS, Algorithm, groupBySubgroup,
} from '../../src/constants/algorithms';

const { width: SW } = Dimensions.get('window');
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

// ─── Mini top-face diagram (SVG-like with Views) ──────────────────────────────
// Colors represent: U=yellow solved, X=not-oriented (white/grey), S=sticker
const FACE_COLORS: Record<string, string> = {
  U: '#ffd700', X: '#aaa', G: '#009b48', R: '#b71234',
  B: '#0046ad', O: '#ff5800', W: '#fff',
};
function TopFaceDiagram({ size = 60, isDark }: { size?: number; isDark: boolean }) {
  const cell = size / 3;
  // All-yellow placeholder (solved top face) — could be customized per alg
  const grid = Array(9).fill('U');
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap' }}>
      {grid.map((c, i) => (
        <View key={i} style={{
          width: cell, height: cell,
          backgroundColor: FACE_COLORS[c],
          borderWidth: 0.5, borderColor: isDark ? '#333' : '#999',
        }} />
      ))}
    </View>
  );
}

// ─── Algorithm Card ───────────────────────────────────────────────────────────
function AlgCard({
  alg, stats, onSelect, isDark,
}: {
  alg: Algorithm;
  stats: { best: number; avg: number; count: number } | null;
  onSelect: (a: Algorithm) => void;
  isDark: boolean;
}) {
  const cardBg  = isDark ? '#1e1e2e' : '#fff';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol= isDark ? '#868e96' : '#6c757d';
  const accent  = alg.group === 'PLL' ? '#e74c3c' : '#3498db';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.algCard, { backgroundColor: cardBg, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() => onSelect(alg)}
    >
      <View style={[styles.algBadge, { backgroundColor: accent + '22' }]}>
        <Text style={[styles.algBadgeText, { color: accent }]}>{alg.group}</Text>
      </View>
      <Text style={[styles.algName, { color: textCol }]} numberOfLines={1}>{alg.name}</Text>
      <TopFaceDiagram size={48} isDark={isDark} />
      {stats ? (
        <View style={styles.algStats}>
          <Text style={[styles.algStatText, { color: '#37b24d' }]}>
            🏅 {formatTime(stats.best)}
          </Text>
          <Text style={[styles.algStatText, { color: mutedCol }]}>
            ⌀ {formatTime(Math.round(stats.avg))}
          </Text>
        </View>
      ) : (
        <Text style={[styles.algStatText, { color: mutedCol, marginTop: 4 }]}>No data</Text>
      )}
    </Pressable>
  );
}

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
  const [time, setTime]           = useState(0);
  const [times, setTimes]         = useState<number[]>([]);
  const stateRef   = useRef<TimerState>('idle');
  const startRef   = useRef<number>(0);
  const rafRef     = useRef<number>();

  const bg      = isDark ? '#0d0d1a' : '#f0f4f8';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol= isDark ? '#868e96' : '#6c757d';
  const accent  = alg.group === 'PLL' ? '#e74c3c' : '#3498db';

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
      cancelAnimationFrame(rafRef.current!);
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
  const localAvg  = times.length > 0
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
        {/* Header */}
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="chevron-down" size={28} color={mutedCol} />
          </Pressable>
          <Text style={[styles.modalTitle, { color: textCol }]}>{alg.name}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Algorithm + Setup */}
        <View style={[styles.algInfoBox, { backgroundColor: isDark ? '#1e1e2e' : '#fff' }]}>
          <TopFaceDiagram size={72} isDark={isDark} />
          <View style={styles.algInfoText}>
            <Text style={[styles.setupLabel, { color: mutedCol }]}>Setup Move</Text>
            <Text style={[styles.setupAlg, { color: accent }]} selectable>{alg.setup}</Text>
            <Text style={[styles.setupLabel, { color: mutedCol, marginTop: 6 }]}>Algorithm</Text>
            <Text style={[styles.mainAlg, { color: textCol }]} selectable>{alg.algorithm}</Text>
          </View>
        </View>

        {/* Timer area */}
        <Pressable style={styles.timerArea} onPress={handlePress}>
          <Text style={[styles.drillTimer, { color: timerColor }]}>
            {formatTime(time)}
          </Text>
          <Text style={[styles.drillInstruction, { color: mutedCol }]}>
            {timerState === 'idle'   && 'Tap to get ready'}
            {timerState === 'holding'&& '🟢 Release to start'}
            {timerState === 'running'&& 'Tap to stop'}
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

        {/* Session stats */}
        {times.length > 0 && (
          <View style={[styles.sessionStats, { backgroundColor: isDark ? '#1e1e2e' : '#fff' }]}>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionStatVal, { color: '#ffd700' }]}>
                {formatTime(localBest!)}
              </Text>
              <Text style={[styles.sessionStatLabel, { color: mutedCol }]}>Best</Text>
            </View>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionStatVal, { color: accent }]}>
                {formatTime(localAvg!)}
              </Text>
              <Text style={[styles.sessionStatLabel, { color: mutedCol }]}>Avg</Text>
            </View>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionStatVal, { color: textCol }]}>{times.length}</Text>
              <Text style={[styles.sessionStatLabel, { color: mutedCol }]}>Solves</Text>
            </View>
          </View>
        )}

        {/* Recent times */}
        {times.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentTimesRow}>
            {[...times].reverse().slice(0, 10).map((t, i) => (
              <View key={i} style={[styles.recentChip, {
                backgroundColor: t === localBest ? '#ffd700' + '33' : isDark ? '#2a2a3e' : '#f1f3f5',
                borderColor: t === localBest ? '#ffd700' : 'transparent',
              }]}>
                <Text style={{ color: t === localBest ? '#ffd700' : mutedCol, fontSize: 12 }}>
                  {formatTime(t)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function TrainScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [tab, setTab]             = useState<'PLL' | 'OLL'>('PLL');
  const [selectedAlg, setSelectedAlg] = useState<Algorithm | null>(null);
  const [drillTimes, setDrillTimes]   = useState<DrillTime[]>([]);
  const [filterGroup, setFilterGroup] = useState<string | null>(null);

  const algorithms = tab === 'PLL' ? PLL_ALGORITHMS : OLL_ALGORITHMS;
  const grouped    = groupBySubgroup(algorithms);
  const subgroups  = Object.keys(grouped);

  const filtered = filterGroup
    ? algorithms.filter(a => a.subgroup === filterGroup)
    : algorithms;

  const reloadTimes = useCallback(async () => {
    setDrillTimes(await loadDrillTimes());
  }, []);

  useEffect(() => { reloadTimes(); }, []);

  const bg      = isDark ? '#121212' : '#f0f4f8';
  const cardBg  = isDark ? '#1e1e2e' : '#fff';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol= isDark ? '#868e96' : '#6c757d';
  const pllColor= '#e74c3c';
  const ollColor= '#3498db';
  const accent  = tab === 'PLL' ? pllColor : ollColor;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* ── PLL / OLL tabs ── */}
      <View style={[styles.mainTabBar, { backgroundColor: cardBg }]}>
        {(['PLL', 'OLL'] as const).map(t => (
          <Pressable
            key={t}
            style={[styles.mainTab, tab === t && { borderBottomColor: t === 'PLL' ? pllColor : ollColor, borderBottomWidth: 3 }]}
            onPress={() => { setTab(t); setFilterGroup(null); }}
          >
            <Text style={[styles.mainTabText, { color: tab === t ? (t === 'PLL' ? pllColor : ollColor) : mutedCol }]}>
              {t}
            </Text>
            <Text style={[styles.mainTabCount, { color: mutedCol }]}>
              {t === 'PLL' ? 21 : 57} cases
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Subgroup filter chips ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
        <Pressable
          style={[styles.filterChip, !filterGroup && { backgroundColor: accent }]}
          onPress={() => setFilterGroup(null)}
        >
          <Text style={[styles.filterChipText, { color: !filterGroup ? '#fff' : mutedCol }]}>
            All
          </Text>
        </Pressable>
        {subgroups.map(sg => (
          <Pressable
            key={sg}
            style={[styles.filterChip, filterGroup === sg && { backgroundColor: accent }]}
            onPress={() => setFilterGroup(sg === filterGroup ? null : sg)}
          >
            <Text style={[styles.filterChipText, { color: filterGroup === sg ? '#fff' : mutedCol }]}>
              {sg}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Algorithm grid ── */}
      <FlatList
        data={filtered}
        keyExtractor={a => a.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <AlgCard
            alg={item}
            stats={getStatsForAlg(drillTimes, item.id)}
            onSelect={setSelectedAlg}
            isDark={isDark}
          />
        )}
      />

      {/* ── Drill timer modal ── */}
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
const CARD_W = (SW - 48 - 16) / 3;

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Main tabs
  mainTabBar: {
    flexDirection: 'row',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  mainTab: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  mainTabText: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  mainTabCount: { fontSize: 11, marginTop: 2 },

  // Filters
  filterScroll: { maxHeight: 52 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16,
    borderWidth: 1, borderColor: '#ced4da',
  },
  filterChipText: { fontSize: 12, fontWeight: '600' },

  // Grid
  grid: { padding: 16 },
  gridRow: { gap: 8, marginBottom: 8 },

  // Alg card
  algCard: {
    width: CARD_W, borderRadius: 14, padding: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  algBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6 },
  algBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  algName: { fontSize: 11, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  algStats: { marginTop: 6, alignItems: 'center', gap: 2 },
  algStatText: { fontSize: 10, fontWeight: '600' },

  // Modal
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
  algInfoText: { flex: 1 },
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
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sessionStat: { alignItems: 'center' },
  sessionStatVal: { fontSize: 20, fontWeight: '800' },
  sessionStatLabel: { fontSize: 11, marginTop: 2 },

  recentTimesRow: {
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
  },
  recentChip: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
});
