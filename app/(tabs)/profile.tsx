import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, Pressable, ScrollView, TextInput,
  ActivityIndicator, Alert, useColorScheme, Platform,
  KeyboardAvoidingView, Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { useAppStore } from '../../src/store/useAppStore';
import { useGamificationStore, TOTAL_ACHIEVEMENTS } from '../../src/store/gamificationStore';
import { getSolves } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';

const { width: SW } = Dimensions.get('window');
const CARD_SIZE = (SW - 48 - 12) / 3; // 3-column grid

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'zh', label: '中文',     flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी',  flag: '🇮🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

// ─── Auth Form ────────────────────────────────────────────────────────────────
function AuthForm({ isDark }: { isDark: boolean }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const accent   = isDark ? '#4dabf7' : '#228be6';
  const cardBg   = isDark ? '#1e1e2e' : '#fff';
  const inputBg  = isDark ? '#2a2a3e' : '#f1f3f5';
  const textCol  = isDark ? '#e9ecef' : '#212529';
  const mutedCol = isDark ? '#868e96' : '#6c757d';

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert('Login failed', error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) Alert.alert('Registration failed', error.message);
        else Alert.alert('✅ Account created', 'Check your email to confirm, then log in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.authCard, { backgroundColor: cardBg }]}>
        <View style={[styles.authIconBg, { backgroundColor: accent + '22' }]}>
          <Ionicons name="cube-outline" size={36} color={accent} />
        </View>
        <Text style={[styles.authTitle, { color: textCol }]}>
          {mode === 'login' ? 'Sign in to CubeTimer' : 'Create an account'}
        </Text>
        <Text style={[styles.authSubtitle, { color: mutedCol }]}>
          {mode === 'login' ? 'Sync records across devices' : 'Start tracking your cloud progress'}
        </Text>

        <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
          <Ionicons name="mail-outline" size={18} color={mutedCol} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: textCol }]} placeholder="Email"
            placeholderTextColor={mutedCol} value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        </View>

        <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
          <Ionicons name="lock-closed-outline" size={18} color={mutedCol} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: textCol }]} placeholder="Password"
            placeholderTextColor={mutedCol} value={password} onChangeText={setPassword}
            secureTextEntry autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.authButton, { backgroundColor: accent, opacity: pressed ? 0.85 : 1 }]}
          onPress={handleAuth} disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> :
            <Text style={styles.authButtonText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>}
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={[styles.toggleText, { color: accent }]}>
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Streak Header ────────────────────────────────────────────────────────────
function StreakHeader({ isDark }: { isDark: boolean }) {
  const { streak, achievements } = useGamificationStore();
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  const fireColor  = streak >= 7 ? '#ff4757' : streak >= 3 ? '#ffa502' : '#ff6b35';
  const cardBg     = isDark ? '#1e1e2e' : '#fff';
  const textCol    = isDark ? '#e9ecef' : '#212529';
  const mutedCol   = isDark ? '#868e96' : '#6c757d';

  return (
    <View style={[styles.streakCard, { backgroundColor: cardBg }]}>
      {/* Streak */}
      <View style={styles.streakMain}>
        <Text style={[styles.streakFire, { color: fireColor }]}>🔥</Text>
        <View>
          <Text style={[styles.streakCount, { color: fireColor }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: mutedCol }]}>
            {streak === 1 ? 'Day Streak' : 'Day Streak'}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.streakDivider, { backgroundColor: isDark ? '#2a2a3e' : '#f1f3f5' }]} />

      {/* Achievements count */}
      <View style={styles.streakAchCol}>
        <Text style={[styles.streakAchCount, { color: '#ffd700' }]}>
          {unlockedCount}/{TOTAL_ACHIEVEMENTS}
        </Text>
        <Text style={[styles.streakLabel, { color: mutedCol }]}>Achievements</Text>
      </View>
    </View>
  );
}

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
      Alert.alert('Invalid', 'Enter a valid time in seconds (e.g. 15)');
      return;
    }
    setGoal(activeCategoryId, Math.round(secs * 1000));
    setInputVal('');
  };

  // Progress: 0–1, how close avg is to goal (inverted: closer = higher bar)
  const progress = goalMs && currentAo5
    ? Math.min(1, Math.max(0, 1 - (currentAo5 - goalMs) / goalMs))
    : null;
  const progressColor = progress !== null
    ? progress >= 1 ? '#37b24d' : progress >= 0.7 ? '#ffd700' : accent
    : accent;

  return (
    <View style={[styles.card, { backgroundColor: cardBg }, styles.goalCard]}>
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="flag-outline" size={18} color={accent} />
        <Text style={[styles.sectionTitle, { color: textCol }]}>
          Personal Goal — {activeCategoryId}
        </Text>
      </View>

      {goalMs ? (
        <>
          <Text style={[styles.goalTarget, { color: accent }]}>
            🎯 Target: {(goalMs / 1000).toFixed(2)}s
          </Text>

          {currentAo5 !== null ? (
            <>
              <Text style={[styles.goalCurrent, { color: mutedCol }]}>
                Your Ao5: {formatTime(Math.round(currentAo5))}
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: isDark ? '#2a2a3e' : '#e9ecef' }]}>
                <View style={[styles.progressFill, {
                  width: `${(progress ?? 0) * 100}%`,
                  backgroundColor: progressColor,
                }]} />
              </View>
              {progress !== null && progress >= 1 && (
                <Text style={[styles.goalAchieved, { color: '#37b24d' }]}>✅ Goal achieved!</Text>
              )}
            </>
          ) : (
            <Text style={[styles.goalCurrent, { color: mutedCol }]}>
              Need 5+ solves for Ao5
            </Text>
          )}

          <Pressable onPress={() => setGoal(activeCategoryId, 0)} style={styles.changeGoalBtn}>
            <Text style={{ color: mutedCol, fontSize: 12 }}>Change goal</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.goalInputRow}>
          <View style={[styles.inputWrap, { backgroundColor: inputBg, flex: 1 }]}>
            <Ionicons name="timer-outline" size={16} color={mutedCol} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textCol }]}
              placeholder={`Target in seconds (e.g. 15)`}
              placeholderTextColor={mutedCol}
              value={inputVal}
              onChangeText={setInputVal}
              keyboardType="decimal-pad"
            />
          </View>
          <Pressable
            style={({ pressed }) => [styles.goalSetBtn, { backgroundColor: accent, opacity: pressed ? 0.8 : 1 }]}
            onPress={handleSetGoal}
          >
            <Text style={styles.goalSetBtnText}>Set</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Achievements Grid ────────────────────────────────────────────────────────
function AchievementsGrid({ isDark }: { isDark: boolean }) {
  const { achievements } = useGamificationStore();
  const cardBg  = isDark ? '#1e1e2e' : '#fff';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol= isDark ? '#868e96' : '#6c757d';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, padding: 16 }]}>
      <View style={[styles.sectionHeaderRow, { marginBottom: 16 }]}>
        <Ionicons name="trophy-outline" size={18} color="#ffd700" />
        <Text style={[styles.sectionTitle, { color: textCol }]}>Achievements</Text>
      </View>

      <View style={styles.achieveGrid}>
        {achievements.map(ach => {
          const unlocked = !!ach.unlockedAt;
          const dateStr = unlocked
            ? new Date(ach.unlockedAt!).toLocaleDateString()
            : null;

          return (
            <View
              key={ach.id}
              style={[
                styles.achieveCard,
                { width: CARD_SIZE, backgroundColor: isDark ? '#2a2a3e' : '#f8f9fa' },
                unlocked && styles.achieveCardUnlocked,
                unlocked && { borderColor: ach.color + '66' },
              ]}
            >
              {/* Medal icon */}
              <View style={[
                styles.achieveIconBg,
                { backgroundColor: unlocked ? ach.color + '25' : (isDark ? '#1e1e2e' : '#e9ecef') },
              ]}>
                {unlocked ? (
                  <Ionicons name={ach.icon as any} size={26} color={ach.color} />
                ) : (
                  <Ionicons name="lock-closed-outline" size={22} color={mutedCol} />
                )}
              </View>

              {/* Title */}
              <Text
                numberOfLines={2}
                style={[
                  styles.achieveTitle,
                  { color: unlocked ? textCol : mutedCol },
                  unlocked && { fontWeight: '700' },
                ]}
              >
                {ach.title}
              </Text>

              {/* Date or lock */}
              {unlocked && dateStr ? (
                <Text style={[styles.achieveDate, { color: ach.color }]}>{dateStr}</Text>
              ) : (
                <Text style={[styles.achieveDate, { color: mutedCol, opacity: 0.6 }]} numberOfLines={2}>
                  {ach.description}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Logged-in Profile Card ───────────────────────────────────────────────────
function ProfileCard({ isDark }: { isDark: boolean }) {
  const user = useAppStore(s => s.supabaseUser);
  const [loading, setLoading] = useState(false);
  const accent  = isDark ? '#4dabf7' : '#228be6';
  const cardBg  = isDark ? '#1e1e2e' : '#fff';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol= isDark ? '#868e96' : '#6c757d';

  return (
    <View style={[styles.authCard, { backgroundColor: cardBg }]}>
      <View style={[styles.authIconBg, { backgroundColor: accent + '22' }]}>
        <Ionicons name="person" size={36} color={accent} />
      </View>
      <Text style={[styles.authTitle, { color: textCol }]}>
        {user?.email?.split('@')[0] ?? 'Cuber'}
      </Text>
      <Text style={[styles.authSubtitle, { color: mutedCol }]}>{user?.email}</Text>
      <View style={[styles.badgeRow, { borderColor: isDark ? '#2a2a3e' : '#e9ecef' }]}>
        <View style={[styles.badge, { backgroundColor: accent + '18' }]}>
          <Ionicons name="cloud-done-outline" size={14} color={accent} />
          <Text style={[styles.badgeText, { color: accent }]}>Cloud Sync Active</Text>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.signOutButton, { borderColor: '#e03131', opacity: pressed ? 0.7 : 1 }]}
        onPress={async () => { setLoading(true); await supabase.auth.signOut(); setLoading(false); }}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#e03131" size="small" /> : <>
          <Ionicons name="log-out-outline" size={18} color="#e03131" />
          <Text style={[styles.signOutText, { color: '#e03131' }]}>Sign Out</Text>
        </>}
      </Pressable>
    </View>
  );
}

import { Header } from '../../src/components/Header';

export default function ProfileScreen() {
  console.log('[ProfileScreen] mounted');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t, i18n } = useTranslation();
  const supabaseUser = useAppStore(s => s.supabaseUser);
  const accent  = isDark ? '#4dabf7' : '#228be6';
  const bg      = isDark ? '#121212' : '#f0f4f8';
  const cardBg  = isDark ? '#1e1e2e' : '#fff';
  const textCol = isDark ? '#e9ecef' : '#212529';
  const mutedCol= isDark ? '#868e96' : '#6c757d';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <Header titleKey="tabs.profile" />
      <ScrollView
        style={[styles.container, { backgroundColor: bg }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Streak Banner ──────────────────────────────── */}
      <StreakHeader isDark={isDark} />

      {/* ── Auth / Profile ────────────────────────────── */}
      {supabaseUser ? <ProfileCard isDark={isDark} /> : <AuthForm isDark={isDark} />}

      {/* ── Personal Goal ─────────────────────────────── */}
      <GoalSection isDark={isDark} />

      {/* ── Achievements Grid ─────────────────────────── */}
      <AchievementsGrid isDark={isDark} />

      {/* ── Language Selector ─────────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textCol, paddingLeft: 4 }]}>
          🌐 {t('profile.selectLanguage')}
        </Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {LANGUAGES.map((lang, index) => (
            <Pressable
              key={lang.code}
              style={({ hovered, pressed }) => [
                styles.langRow,
                index < LANGUAGES.length - 1 && [styles.langRowBorder, { borderBottomColor: isDark ? '#333' : '#e9ecef' }],
                hovered && Platform.OS === 'web' && { backgroundColor: isDark ? '#2a2a3e' : '#f1f3f5' },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => i18n.changeLanguage(lang.code)}
            >
              <View style={styles.langInfo}>
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, { color: textCol }]}>{lang.label}</Text>
              </View>
              {i18n.language === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color={accent} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── App Info ──────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textCol, paddingLeft: 4 }]}>
          ℹ️ {t('profile.appInfo')}
        </Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: mutedCol }]}>CubeTimer</Text>
            <Text style={[styles.infoValue, { color: textCol }]}>v1.1.0</Text>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: isDark ? '#333' : '#e9ecef' }]}>
            <Text style={[styles.infoLabel, { color: mutedCol }]}>Backend</Text>
            <Text style={[{ fontSize: 15, fontWeight: '600' }, { color: supabaseUser ? '#37b24d' : mutedCol }]}>
              {supabaseUser ? '☁️ Supabase' : '📱 Local'}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },

  // Streak
  streakCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20,
    padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  streakMain: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  streakFire: { fontSize: 44 },
  streakCount: { fontSize: 40, fontWeight: '900', lineHeight: 44 },
  streakLabel: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  streakDivider: { width: 1, height: 50, marginHorizontal: 16 },
  streakAchCol: { alignItems: 'center' },
  streakAchCount: { fontSize: 24, fontWeight: '900' },

  // Auth card
  authCard: {
    borderRadius: 20, padding: 24, marginBottom: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  authIconBg: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  authTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  authSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 18 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginBottom: 12, paddingHorizontal: 14, width: '100%' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 14 },
  authButton: { width: '100%', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  authButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  toggleText: { fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, paddingTop: 16, marginTop: 8, marginBottom: 20, width: '100%', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 24 },
  signOutText: { fontSize: 14, fontWeight: '700' },

  // Goal
  goalCard: { marginBottom: 16, padding: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  goalTarget: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  goalCurrent: { fontSize: 13, marginBottom: 10 },
  progressTrack: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 5 },
  goalAchieved: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  changeGoalBtn: { marginTop: 10, alignSelf: 'flex-end' },
  goalInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  goalSetBtn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 18 },
  goalSetBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Achievements grid
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achieveCard: {
    borderRadius: 14, padding: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  achieveCardUnlocked: {
    shadowOpacity: 0.14, shadowRadius: 10, elevation: 4,
  },
  achieveIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  achieveTitle: { fontSize: 11, textAlign: 'center', lineHeight: 14, marginBottom: 4 },
  achieveDate: { fontSize: 9, textAlign: 'center', lineHeight: 12 },

  // Language
  section: { marginBottom: 20 },
  card: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  langRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  langInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langFlag: { fontSize: 24 },
  langLabel: { fontSize: 16, fontWeight: '500' },

  // Info
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15, fontWeight: '600' },
});
