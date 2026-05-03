import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  useColorScheme,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useAppStore } from '../../src/store/useAppStore';
import { getSolves, SolveRecord } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;

// ─── CATEGORY TABS ────────────────────────────────────────────────────────────
const CATEGORIES = ['3x3', '2x2', '4x4', '3x3 OH', 'Pyraminx'];

// ─── MOCK GLOBAL DATA (3x3 reference) ─────────────────────────────────────────
const GLOBAL_MOCK: Record<string, { wr: number; avg: number }> = {
  '3x3':     { wr: 3.13,  avg: 25.0  },
  '2x2':     { wr: 0.43,  avg: 8.0   },
  '4x4':     { wr: 16.79, avg: 90.0  },
  '3x3 OH':  { wr: 6.20,  avg: 45.0  },
  'Pyraminx':{ wr: 0.91,  avg: 10.0  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
/** Returns time in seconds (float) */
const toSeconds = (ms: number) => parseFloat((ms / 1000).toFixed(2));

/** Calculates Ao5 moving average on chronological solves */
const computeAo5 = (times: number[]): (number | null)[] => {
  return times.map((_, i) => {
    if (i < 4) return null;
    const window = times.slice(i - 4, i + 1).sort((a, b) => a - b);
    const trimmed = window.slice(1, 4); // drop best & worst
    return parseFloat((trimmed.reduce((s, v) => s + v, 0) / 3 / 1000).toFixed(2));
  });
};

/** Groups times into histogram bins */
const buildDistribution = (
  times: number[],
  wr: number,
  avg: number
): { label: string; value: number }[] => {
  // Build dynamic bins based on WR and global avg
  const s = times.map(t => t / 1000);
  const minT = Math.min(...s);
  const maxT = Math.max(...s);
  const range = maxT - minT || 1;
  const binCount = Math.min(8, Math.max(4, Math.ceil(range / 5)));
  const binSize = range / binCount;
  const bins: { label: string; value: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const lo = minT + i * binSize;
    const hi = lo + binSize;
    const count = s.filter(t => t >= lo && (i === binCount - 1 ? t <= hi : t < hi)).length;
    bins.push({
      label: `${lo.toFixed(0)}s`,
      value: count,
    });
  }
  return bins;
};

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
const SectionHeader = ({
  title,
  icon,
  color,
  isDark,
}: {
  title: string;
  icon: string;
  color: string;
  isDark: boolean;
}) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionIconBg, { backgroundColor: color + '22' }]}>
      <Ionicons name={icon as any} size={18} color={color} />
    </View>
    <Text style={[styles.sectionTitle, isDark && styles.textLight]}>{title}</Text>
  </View>
);

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
const EmptyState = ({ isDark, t }: { isDark: boolean; t: any }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>🏆</Text>
    <Text style={[styles.emptyTitle, isDark && styles.textLight]}>{t('stats.noData')}</Text>
    <Text style={styles.emptySubtitle}>{t('stats.noDataSub')}</Text>
  </View>
);

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const Tooltip = ({
  value,
  unit,
  isDark,
}: {
  value: string;
  unit: string;
  isDark: boolean;
}) => (
  <View style={[styles.tooltip, isDark && styles.tooltipDark]}>
    <Text style={styles.tooltipText}>
      {value}
      <Text style={styles.tooltipUnit}> {unit}</Text>
    </Text>
  </View>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
import { Header } from '../../src/components/Header';

export default function StatsScreen() {
  console.log('[StatsScreen] mounted');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const { activeUserId, activeCategoryId } = useAppStore();
  const [solves, setSolves] = useState<SolveRecord[]>([]);
  const [activeLinePoint, setActiveLinePoint] = useState<{ value: number; index: number } | null>(null);

  // Fetch solves when screen focused or category changes
  useFocusEffect(
    useCallback(() => {
      getSolves(activeUserId, activeCategoryId).then(data => {
        setSolves(data ?? []);
        setActiveLinePoint(null);
      });
    }, [activeUserId, activeCategoryId])
  );

  // ─── Derived data ──────────────────────────────────────────────────────────
  // Solves in chronological order (oldest first) for charts
  const chronological = [...solves].reverse();
  const timesMs = chronological.map(s => s.time);
  const timesSec = timesMs.map(toSeconds);
  const ao5Values = computeAo5(timesMs);
  const mockGlobal = GLOBAL_MOCK[activeCategoryId] ?? GLOBAL_MOCK['3x3'];
  const userAvgSec =
    timesMs.length > 0
      ? parseFloat((timesMs.reduce((s, v) => s + v, 0) / timesMs.length / 1000).toFixed(2))
      : null;

  // ─── Chart: Line (Progression) ───────────────────────────────────────────
  const lineData = timesSec.map((val, i) => ({
    value: val,
    dataPointText: '',
    onPress: () => setActiveLinePoint({ value: val, index: i }),
    hideDataPoint: false,
  }));

  const ao5LineData = ao5Values.map((val, i) => ({
    value: val ?? 0,
    hideDataPoint: val === null,
    opacity: val === null ? 0 : 1,
  }));

  // ─── Chart: Bar (Distribution Histogram) ─────────────────────────────────
  const ACCENT   = isDark ? '#4dabf7' : '#228be6';
  const GREEN    = '#37b24d';
  const ORANGE   = '#f76707';
  const YELLOW   = '#f59f00';
  const RED      = '#e03131';

  const distributionBars =
    timesMs.length >= 3
      ? buildDistribution(timesMs, mockGlobal.wr, mockGlobal.avg).map((b, i) => ({
          value: b.value,
          label: b.label,
          frontColor: ACCENT,
          topLabelComponent: b.value > 0
            ? () => (
                <Text style={{ color: isDark ? '#fff' : '#333', fontSize: 10, marginBottom: 2 }}>
                  {b.value}
                </Text>
              )
            : undefined,
        }))
      : [];

  // ─── Chart: Bar Horizontal (Global Comparison) ───────────────────────────
  const compData = [
    {
      label: t('stats.worldRecord'),
      value: mockGlobal.wr,
      color: GREEN,
      isUser: false,
    },
    {
      label: t('stats.yourAverage'),
      value: userAvgSec ?? 0,
      color: ACCENT,
      isUser: true,
    },
    {
      label: t('stats.globalAverage'),
      value: mockGlobal.avg,
      color: ORANGE,
      isUser: false,
    },
  ];

  const maxCompValue = Math.max(...compData.map(d => d.value), 1);

  // ─── Colors ───────────────────────────────────────────────────────────────
  const bg = isDark ? '#121212' : '#f0f4f8';
  const cardBg = isDark ? '#1e1e2e' : '#ffffff';
  const textPrimary = isDark ? '#e9ecef' : '#212529';
  const textSecondary = isDark ? '#868e96' : '#6c757d';
  const gridColor = isDark ? '#2a2a3e' : '#e9ecef';
  const axisColor = isDark ? '#444' : '#ced4da';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#f0f4f8' }}>
      <Header titleKey="tabs.stats" />
      <ScrollView
        style={[styles.container, { backgroundColor: bg }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Empty State ───────────────────────────────────────── */}
        {solves.length === 0 && (
          <EmptyState isDark={isDark} t={t} />
        )}

      {/* ══════════════════════════════════════════════════════════
          CHART A — Personal Progression (Line Chart)
         ══════════════════════════════════════════════════════════ */}
      {solves.length >= 2 && (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SectionHeader
            title={t('stats.progressionChart')}
            icon="trending-up-outline"
            color={ACCENT}
            isDark={isDark}
          />

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: ACCENT }]} />
              <Text style={[styles.legendLabel, { color: textSecondary }]}>
                {t('stats.individualTime')}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: YELLOW }]} />
              <Text style={[styles.legendLabel, { color: textSecondary }]}>
                {t('stats.movingAverage')}
              </Text>
            </View>
          </View>

          {/* Active point tooltip */}
          {activeLinePoint && (
            <Tooltip
              value={activeLinePoint.value.toFixed(2)}
              unit={t('stats.seconds')}
              isDark={isDark}
            />
          )}

          <LineChart
            data={lineData}
            data2={ao5LineData}
            width={CHART_WIDTH}
            height={200}
            spacing={Math.max(20, Math.min(60, CHART_WIDTH / Math.max(lineData.length, 5)))}
            color1={ACCENT}
            color2={YELLOW}
            thickness1={2}
            thickness2={2.5}
            dataPointsColor1={ACCENT}
            dataPointsColor2={YELLOW}
            dataPointsRadius={4}
            startFillColor1={ACCENT}
            startFillColor2={YELLOW}
            endFillColor1={ACCENT + '00'}
            endFillColor2={YELLOW + '00'}
            startOpacity1={0.25}
            startOpacity2={0.15}
            endOpacity1={0}
            endOpacity2={0}
            areaChart
            curved
            rulesColor={gridColor}
            rulesType="solid"
            yAxisColor={axisColor}
            xAxisColor={axisColor}
            yAxisTextStyle={{ color: textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: textSecondary, fontSize: 9 }}
            hideOrigin
            yAxisSide="left"
            noOfSections={4}
            maxValue={Math.ceil(Math.max(...timesSec) * 1.15)}
            initialSpacing={16}
            endSpacing={16}
            showReferenceLine1
            referenceLine1Position={userAvgSec ?? 0}
            referenceLine1Config={{
              color: ACCENT + '66',
              dashWidth: 4,
              dashGap: 4,
              thickness: 1,
            }}
          />

          {solves.length > 0 && (
            <View style={styles.chartFootnote}>
              <Text style={{ color: textSecondary, fontSize: 11 }}>
                {t('stats.solveNumber')}1 → {solves.length}
              </Text>
              {userAvgSec && (
                <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '600' }}>
                  avg {userAvgSec.toFixed(2)}s
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════
          CHART B — Time Distribution (Histogram)
         ══════════════════════════════════════════════════════════ */}
      {solves.length >= 3 && (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SectionHeader
            title={t('stats.distributionChart')}
            icon="bar-chart-outline"
            color={ORANGE}
            isDark={isDark}
          />

          <BarChart
            data={distributionBars}
            width={CHART_WIDTH}
            height={180}
            barWidth={Math.max(24, Math.min(48, (CHART_WIDTH / distributionBars.length) - 16))}
            spacing={Math.max(8, Math.min(20, 16))}
            frontColor={ACCENT}
            gradientColor={ACCENT + '55'}
            isAnimated
            animationDuration={600}
            rulesColor={gridColor}
            rulesType="solid"
            yAxisColor={axisColor}
            xAxisColor={axisColor}
            yAxisTextStyle={{ color: textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: textSecondary, fontSize: 9 }}
            noOfSections={4}
            initialSpacing={16}
            endSpacing={16}
            roundedTop
            showReferenceLine1
            referenceLine1Position={0}
            referenceLine1Config={{ color: 'transparent' }}
          />

          <Text style={[styles.chartSubLabel, { color: textSecondary }]}>
            {t('stats.count')} ({t('stats.seconds')})
          </Text>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════
          CHART C — Global Comparison (Horizontal bars / table)
         ══════════════════════════════════════════════════════════ */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <SectionHeader
          title={t('stats.comparisonChart')}
          icon="earth-outline"
          color={GREEN}
          isDark={isDark}
        />

        {compData.map((item, idx) => {
          const pct = item.value > 0 ? item.value / maxCompValue : 0;
          return (
            <View key={idx} style={styles.compRow}>
              <Text
                style={[
                  styles.compLabel,
                  { color: item.isUser ? item.color : textSecondary },
                  item.isUser && styles.compLabelUser,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>

              <View style={styles.compBarContainer}>
                <View
                  style={[
                    styles.compBarTrack,
                    { backgroundColor: isDark ? '#2a2a3e' : '#e9ecef' },
                  ]}
                >
                  <View
                    style={[
                      styles.compBarFill,
                      {
                        width: `${Math.min(100, pct * 100)}%`,
                        backgroundColor: item.color,
                        opacity: item.isUser ? 1 : 0.65,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.compValue,
                    { color: item.isUser ? item.color : textSecondary },
                    item.isUser && { fontWeight: '700' },
                  ]}
                >
                  {item.value > 0 ? `${item.value.toFixed(2)}s` : '—'}
                </Text>
              </View>

              {item.isUser && userAvgSec && (
                <View style={[styles.userBadge, { borderColor: item.color }]}>
                  <Ionicons name="person" size={10} color={item.color} />
                  <Text style={[styles.userBadgeText, { color: item.color }]}>YOU</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Context note */}
        <View style={[styles.contextNote, { backgroundColor: isDark ? '#2a2a3e' : '#f1f3f5' }]}>
          <Ionicons name="information-circle-outline" size={14} color={textSecondary} />
          <Text style={[styles.contextNoteText, { color: textSecondary }]}>
            WR: Max Park {mockGlobal.wr}s · Global avg {mockGlobal.avg}s · Data: WCA 2024
          </Text>
        </View>
      </View>

      {/* ── Summary stats strip ───────────────────────────────── */}
      {solves.length > 0 && (
        <View style={[styles.summaryStrip, { backgroundColor: cardBg }]}>
          {[
            {
              label: 'Best',
              value: formatTime(Math.min(...timesMs)),
              color: GREEN,
            },
            {
              label: 'Avg',
              value: userAvgSec ? `${userAvgSec.toFixed(2)}s` : '—',
              color: ACCENT,
            },
            {
              label: 'Solves',
              value: String(solves.length),
              color: ORANGE,
            },
          ].map((stat, i) => (
            <View key={i} style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.summaryLabel, { color: textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },

  // ── Category bar ──
  categoryBar: {
    marginVertical: 12,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ced4da',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#228be6',
    borderColor: '#228be6',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868e96',
  },
  categoryChipTextActive: {
    color: '#fff',
  },

  // ── Cards ──
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },

  // ── Legend ──
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },

  // ── Tooltip ──
  tooltip: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipDark: {
    backgroundColor: '#2a2a3e',
    borderColor: '#444',
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#228be6',
  },
  tooltipUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#868e96',
  },

  // ── Chart labels ──
  chartFootnote: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartSubLabel: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 8,
  },

  // ── Global comparison ──
  compRow: {
    marginBottom: 14,
  },
  compLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#6c757d',
  },
  compLabelUser: {
    fontWeight: '700',
    fontSize: 13,
  },
  compBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  compBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  compValue: {
    fontSize: 12,
    width: 52,
    textAlign: 'right',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  userBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contextNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  contextNoteText: {
    fontSize: 10,
    flex: 1,
    lineHeight: 14,
  },

  // ── Summary strip ──
  summaryStrip: {
    marginHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },

  // ── Empty state ──
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
    fontSize: 17,
    fontWeight: '700',
    color: '#343a40',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#868e96',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Misc ──
  textLight: {
    color: '#e9ecef',
  },
});
