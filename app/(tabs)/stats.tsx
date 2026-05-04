import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Pressable } from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { getSolves, SolveRecord } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';
import { Header } from '../../src/components/Header';
import {
  calculateMo3,
  calculateAo5,
  calculateAo12,
  calculateAo100,
  calculateBestSingle,
  calculateTotalSolves,
} from '../../src/utils/statistics';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const toSeconds = (ms: number) => parseFloat((ms / 1000).toFixed(2));

// Computes a moving Ao5 for the trend chart
const computeMovingAo5 = (times: number[]): (number | null)[] => {
  return times.map((_, i) => {
    if (i < 4) return null;
    const window = times.slice(i - 4, i + 1);
    const avg = calculateAo5(window);
    return avg ? toSeconds(avg) : null;
  });
};

const buildHistogram = (times: number[]) => {
  if (times.length === 0) return { labels: [], data: [] };
  const s = times.map(toSeconds);
  const minT = Math.floor(Math.min(...s));
  const maxT = Math.ceil(Math.max(...s));
  const range = maxT - minT || 1;
  const binCount = Math.min(6, Math.max(3, Math.ceil(range / 2)));
  const binSize = range / binCount;

  const labels: string[] = [];
  const data: number[] = [];

  for (let i = 0; i < binCount; i++) {
    const lo = minT + i * binSize;
    const hi = lo + binSize;
    const count = s.filter(t => t >= lo && (i === binCount - 1 ? t <= hi : t < hi)).length;
    labels.push(`${lo.toFixed(0)}s`);
    data.push(count);
  }

  return { labels, data };
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const { activeUserId, activeCategoryId, activeSessionId } = useAppStore();
  const [solves, setSolves] = useState<SolveRecord[]>([]);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 48);

  useFocusEffect(
    useCallback(() => {
      getSolves(activeUserId, activeCategoryId, activeSessionId).then(data => {
        setSolves(data ?? []);
      });
    }, [activeUserId, activeCategoryId, activeSessionId])
  );

  // ─── Math & Derived Data (Memoized) ────────────────────────────────────────
  const {
    chronologicalTimes,
    mo3,
    ao5,
    ao12,
    ao100,
    best,
    total,
    trendLabels,
    trendSingles,
    trendAo5,
    histogram,
  } = useMemo(() => {
    // For WCA stats, we use the most recent solves (descending order by date)
    // getSolves returns newest first.
    const timesDesc = solves.map(s => s.time);
    
    // For charts, we usually want chronological (oldest to newest)
    const chronoSolves = [...solves].reverse();
    const chronoTimes = chronoSolves.map(s => s.time);
    const chronoSecs = chronoTimes.map(toSeconds);

    const m3 = calculateMo3(timesDesc);
    const a5 = calculateAo5(timesDesc);
    const a12 = calculateAo12(timesDesc);
    const a100 = calculateAo100(timesDesc);
    const b = calculateBestSingle(timesDesc);
    const tCount = calculateTotalSolves(timesDesc);

    // Trend chart data
    const movingAo5 = computeMovingAo5(chronoTimes);
    
    // We limit points to prevent chart-kit from crashing on massive datasets
    const maxPoints = 50;
    const step = Math.ceil(chronoSecs.length / maxPoints);
    const sampledSecs = chronoSecs.filter((_, i) => i % step === 0);
    const sampledAo5 = movingAo5.filter((_, i) => i % step === 0);
    const sampledLabels = sampledSecs.map((_, i) => String(i * step + 1));

    // Handle missing Ao5 data point for chart-kit (it doesn't like nulls)
    // We will use the single value if Ao5 is null to keep the line continuous, 
    // or just don't show the second line if there are no Ao5s.
    const validAo5 = sampledAo5.map((v, i) => v !== null ? v : sampledSecs[i]);

    return {
      chronologicalTimes: chronoTimes,
      mo3: m3,
      ao5: a5,
      ao12: a12,
      ao100: a100,
      best: b,
      total: tCount,
      trendLabels: sampledLabels.length > 0 ? sampledLabels : ['1'],
      trendSingles: sampledSecs.length > 0 ? sampledSecs : [0],
      trendAo5: validAo5.length > 0 ? validAo5 : [0],
      histogram: buildHistogram(chronoTimes),
    };
  }, [solves]);

  // ─── Colors ───────────────────────────────────────────────────────────────
  const ACCENT   = isDark ? '#4dabf7' : '#228be6';
  const GREEN    = '#37b24d';
  const ORANGE   = '#f76707';
  const bg = isDark ? '#121212' : '#f0f4f8';
  const cardBg = isDark ? '#1e1e2e' : '#ffffff';
  const textPrimary = isDark ? '#e9ecef' : '#212529';
  const textSecondary = isDark ? '#868e96' : '#6c757d';

  const chartConfig = {
    backgroundGradientFrom: cardBg,
    backgroundGradientTo: cardBg,
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => textSecondary,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '3',
    },
    decimalPlaces: 2,
  };

  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(34, 139, 230, ${opacity})`,
    decimalPlaces: 0,
  };

  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <Header titleKey="tabs.stats" />
      <ScrollView
        style={[styles.container, { backgroundColor: bg }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >


        {solves.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>{t('stats.noData')}</Text>
            <Text style={styles.emptySubtitle}>{t('stats.noDataSub')}</Text>
          </View>
        ) : (
          <>
            {/* ── SECTION 1: SUMMARY CARDS ── */}
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="stats-chart" size={18} color={GREEN} />
                <Text style={[styles.sectionTitle, { color: textPrimary }]}>WCA Averages</Text>
              </View>
              
              <View style={styles.summaryGrid}>
                {[
                  { label: 'Best', value: best ? formatTime(best) : '-' },
                  { label: 'Mo3', value: mo3 ? formatTime(mo3) : '-' },
                  { label: 'Ao5', value: ao5 ? formatTime(ao5) : '-' },
                  { label: 'Ao12', value: ao12 ? formatTime(ao12) : '-' },
                  { label: 'Ao100', value: ao100 ? formatTime(ao100) : '-' },
                  { label: 'Total', value: String(total) },
                ].map((item, i) => (
                  <View key={i} style={styles.summaryBox}>
                    <Text style={[styles.summaryLabel, { color: textSecondary }]}>{item.label}</Text>
                    <Text style={[styles.summaryValue, { color: textPrimary }]}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── SECTION 2: TREND CHART ── */}
            {solves.length >= 2 && (
              <View 
                style={[styles.card, { backgroundColor: cardBg }]}
                onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - 40)}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons name="trending-up" size={18} color={ACCENT} />
                  <Text style={[styles.sectionTitle, { color: textPrimary }]}>Trend (Singles vs Ao5)</Text>
                </View>
                
                <LineChart
                  data={{
                    labels: trendLabels,
                    datasets: [
                      { data: trendSingles, color: (opacity = 1) => `rgba(34, 139, 230, ${opacity})` }, // Singles
                      { data: trendAo5, color: (opacity = 1) => `rgba(245, 159, 0, ${opacity})` } // Ao5
                    ],
                    legend: ['Singles', 'Ao5']
                  }}
                  width={chartWidth}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withDots={trendSingles.length < 30}
                />
              </View>
            )}

            {/* ── SECTION 3: DISTRIBUTION HISTOGRAM ── */}
            {solves.length >= 3 && histogram.labels.length > 0 && (
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bar-chart" size={18} color={ORANGE} />
                  <Text style={[styles.sectionTitle, { color: textPrimary }]}>Time Distribution</Text>
                </View>
                
                <BarChart
                  data={{
                    labels: histogram.labels,
                    datasets: [{ data: histogram.data }]
                  }}
                  width={chartWidth}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={barChartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 20, paddingTop: 10 },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  summaryBox: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
    marginLeft: -10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
    opacity: 0.7,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  syncBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  syncBannerSubtitle: {
    fontSize: 12,
  },
});
