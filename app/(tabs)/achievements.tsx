import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  Dimensions,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../src/components/Header';
import { useAppStore } from '../../src/store/useAppStore';
import { useGamificationStore, TOTAL_ACHIEVEMENTS } from '../../src/store/gamificationStore';
import { getSolves } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';

const { width: SW } = Dimensions.get('window');
const CARD_SIZE = (SW - 48 - 12) / 3;

// ─── Personal Goal Section ────────────────────────────────────────────────────
function GoalSection({ isDark }: { isDark: boolean }) {
  const { personalGoals, setGoal } = useGamificationStore();
  const { activeUserId, activeCategoryId } = useAppStore();
  const [inputVal, setInputVal] = useState('');
  const [currentAo5, setCurrentAo5] = useState<number | null>(null);

  const accent   = isDark ? '#4dabf7' : '#228be6';
  const cardBg   = isDark ? '#1e1e2e' : '#fff';
  const inputBg  = isDark ? '#2a2a3e' : '#f1f3f5';
  const textCol  = isDark ? '#e9ecef' : '#212529';
  const mutedCol = isDark ? '#868e96' : '#6c757d';

  const goalMs = personalGoals[activeCategoryId];

  useFocusEffect(useCallback(() => {
    getSolves(activeUserId, activeCategoryId).then(solves => {
      if (solves.length >= 5) {
        const recent = solves.slice(0, 5).map(s => s.time).sort((a, b) => a - b);
        const ao5 = (recent[1] + recent[2] + recent[3]) / 3;
        setCurrentAo5(ao5);
      } else {
        setCurrentAo5(null);
      }
    });
  }, [activeUserId, activeCategoryId]));

  const handleSetGoal = () => {
    const secs = parseFloat(inputVal.replace(',', '.'));
    if (isNaN(secs) || secs <= 0) {
      Alert.alert('Invalido', 'Introduce un tiempo válido en segundos (ej. 15)');
      return;
    }
    setGoal(activeCategoryId, Math.round(secs * 1000));
    setInputVal('');
  };

  const progress = goalMs && currentAo5
    ? Math.min(1, Math.max(0, 1 - (currentAo5 - goalMs) / goalMs))
    : null;
  const progressColor = progress !== null
    ? progress >= 1 ? '#37b24d' : progress >= 0.7 ? '#ffd700' : accent
    : accent;

  return (
    <View style={[styles.statsCard, { backgroundColor: cardBg, flexDirection: 'column', alignItems: 'stretch' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Ionicons name="flag-outline" size={18} color={accent} />
        <Text style={{ fontSize: 15, fontWeight: '700', color: textCol }}>
          Meta Personal — {activeCategoryId}
        </Text>
      </View>

      {goalMs ? (
        <>
          <Text style={{ fontSize: 22, fontWeight: '800', color: accent, marginBottom: 4 }}>
            🎯 Objetivo: {(goalMs / 1000).toFixed(2)}s
          </Text>

          {currentAo5 !== null ? (
            <>
              <Text style={{ fontSize: 13, color: mutedCol, marginBottom: 10 }}>
                Tu Ao5: {formatTime(Math.round(currentAo5))}
              </Text>
              <View style={{ height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6, backgroundColor: isDark ? '#2a2a3e' : '#e9ecef' }}>
                <View style={{
                  height: '100%',
                  borderRadius: 5,
                  width: `${(progress ?? 0) * 100}%`,
                  backgroundColor: progressColor,
                }} />
              </View>
              {progress !== null && progress >= 1 && (
                <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: '#37b24d' }}>✅ ¡Meta lograda!</Text>
              )}
            </>
          ) : (
            <Text style={{ fontSize: 13, color: mutedCol, marginBottom: 10 }}>
              Necesitas 5+ resoluciones para Ao5
            </Text>
          )}

          <Pressable onPress={() => setGoal(activeCategoryId, 0)} style={{ marginTop: 10, alignSelf: 'flex-end' }}>
            <Text style={{ color: mutedCol, fontSize: 12 }}>Cambiar meta</Text>
          </Pressable>
        </>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, backgroundColor: inputBg, flex: 1 }}>
            <Ionicons name="timer-outline" size={16} color={mutedCol} style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, fontSize: 15, paddingVertical: 10, color: textCol }}
              placeholder={`Segundos (ej. 15)`}
              placeholderTextColor={mutedCol}
              value={inputVal}
              onChangeText={setInputVal}
              keyboardType="decimal-pad"
            />
          </View>
          <Pressable
            style={({ pressed }) => [{ borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, backgroundColor: accent, opacity: pressed ? 0.8 : 1 }]}
            onPress={handleSetGoal}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Fijar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function AchievementsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { streak, achievements } = useGamificationStore();
  const router = useRouter();

  const unlockedCount = useMemo(() => achievements.filter(a => a.unlockedAt).length, [achievements]);
  
  const bg = isDark ? '#121212' : '#f0f4f8';
  const cardBg = isDark ? '#1e1e2e' : '#ffffff';
  const textPrimary = isDark ? '#e9ecef' : '#212529';
  const textSecondary = isDark ? '#868e96' : '#6c757d';
  const fireColor = streak >= 7 ? '#ff4757' : streak >= 3 ? '#ffa502' : '#ff6b35';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <Header titleKey="tabs.achievements" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >


        {/* Streak & Stats Header */}
        <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
          <View style={styles.statMain}>
            <Text style={styles.fireEmoji}>🔥</Text>
            <View>
              <Text style={[styles.statValue, { color: fireColor }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: textSecondary }]}>Días Seguidos</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: isDark ? '#2a2a3e' : '#f1f3f5' }]} />
          <View style={styles.statMain}>
            <Ionicons name="trophy" size={32} color="#ffd700" />
            <View>
              <Text style={[styles.statValue, { color: '#ffd700' }]}>{unlockedCount}/{TOTAL_ACHIEVEMENTS}</Text>
              <Text style={[styles.statLabel, { color: textSecondary }]}>Logros</Text>
            </View>
          </View>
        </View>

        {/* Personal Goal Section */}
        <GoalSection isDark={isDark} />

        {/* Achievements Grid */}
        <View style={styles.gridContainer}>
          {achievements.map((ach) => {
            const unlocked = !!ach.unlockedAt;
            return (
              <View
                key={ach.id}
                style={[
                  styles.achievementCard,
                  { width: CARD_SIZE, backgroundColor: cardBg },
                  unlocked && { borderColor: ach.color + '44', borderWidth: 2 },
                  !unlocked && { opacity: 0.6 }
                ]}
              >
                <View style={[
                  styles.iconCircle,
                  { backgroundColor: unlocked ? ach.color + '20' : (isDark ? '#2a2a3e' : '#f1f3f5') }
                ]}>
                  {unlocked ? (
                    <Ionicons name={ach.icon as any} size={28} color={ach.color} />
                  ) : (
                    <Ionicons name="lock-closed" size={20} color={textSecondary} />
                  )}
                </View>
                <Text 
                  style={[styles.achTitle, { color: unlocked ? textPrimary : textSecondary }]}
                  numberOfLines={1}
                >
                  {ach.title}
                </Text>
                <Text style={[styles.achDesc, { color: textSecondary }]} numberOfLines={2}>
                  {unlocked ? new Date(ach.unlockedAt!).toLocaleDateString() : ach.description}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  statMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  fireEmoji: { fontSize: 32 },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '600' },
  divider: { width: 1, height: 40, marginHorizontal: 15 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  achievementCard: {
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
      }
    }),
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achTitle: { fontSize: 11, fontWeight: '800', textAlign: 'center', marginBottom: 2 },
  achDesc: { fontSize: 9, textAlign: 'center', lineHeight: 12 },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      }
    }),
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
