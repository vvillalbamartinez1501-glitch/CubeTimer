import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { useAppStore } from '../../src/store/useAppStore';

// ─── Language options ─────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'zh', label: '中文',     flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी',  flag: '🇮🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

// ─── Auth form ────────────────────────────────────────────────────────────────
function AuthForm({ isDark }: { isDark: boolean }) {
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const accent = isDark ? '#4dabf7' : '#228be6';
  const cardBg = isDark ? '#1e1e2e' : '#fff';
  const inputBg = isDark ? '#2a2a3e' : '#f1f3f5';
  const textColor = isDark ? '#e9ecef' : '#212529';
  const mutedColor = isDark ? '#868e96' : '#6c757d';

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
        else
          Alert.alert(
            '✅ Account created',
            'Check your email to confirm your account, then log in.',
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[styles.authCard, { backgroundColor: cardBg }]}>
        {/* Icon */}
        <View style={[styles.authIconBg, { backgroundColor: accent + '22' }]}>
          <Ionicons name="cube-outline" size={36} color={accent} />
        </View>

        <Text style={[styles.authTitle, { color: textColor }]}>
          {mode === 'login' ? 'Sign in to CubeTimer' : 'Create an account'}
        </Text>
        <Text style={[styles.authSubtitle, { color: mutedColor }]}>
          {mode === 'login'
            ? 'Sync your records across devices'
            : 'Start tracking your progress in the cloud'}
        </Text>

        {/* Email */}
        <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
          <Ionicons name="mail-outline" size={18} color={mutedColor} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Email"
            placeholderTextColor={mutedColor}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        {/* Password */}
        <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
          <Ionicons name="lock-closed-outline" size={18} color={mutedColor} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Password"
            placeholderTextColor={mutedColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.authButton,
            { backgroundColor: accent, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.authButtonText}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </Pressable>

        {/* Toggle mode */}
        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={[styles.toggleText, { color: accent }]}>
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Profile card (logged in) ─────────────────────────────────────────────────
function ProfileCard({ isDark }: { isDark: boolean }) {
  const user = useAppStore(s => s.supabaseUser);
  const [loading, setLoading] = useState(false);

  const accent = isDark ? '#4dabf7' : '#228be6';
  const cardBg = isDark ? '#1e1e2e' : '#fff';
  const textColor = isDark ? '#e9ecef' : '#212529';
  const mutedColor = isDark ? '#868e96' : '#6c757d';
  const dangerColor = '#e03131';

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return (
    <View style={[styles.authCard, { backgroundColor: cardBg }]}>
      {/* Avatar */}
      <View style={[styles.authIconBg, { backgroundColor: accent + '22' }]}>
        <Ionicons name="person" size={36} color={accent} />
      </View>

      <Text style={[styles.authTitle, { color: textColor }]}>
        {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Cuber'}
      </Text>
      <Text style={[styles.authSubtitle, { color: mutedColor }]}>{user?.email}</Text>

      {/* Stats badges */}
      <View style={[styles.badgeRow, { borderColor: isDark ? '#2a2a3e' : '#e9ecef' }]}>
        <View style={[styles.badge, { backgroundColor: accent + '18' }]}>
          <Ionicons name="cloud-done-outline" size={14} color={accent} />
          <Text style={[styles.badgeText, { color: accent }]}>Cloud Sync Active</Text>
        </View>
      </View>

      {/* Sign out */}
      <Pressable
        style={({ pressed }) => [
          styles.signOutButton,
          { borderColor: dangerColor, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={dangerColor} size="small" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={18} color={dangerColor} />
            <Text style={[styles.signOutText, { color: dangerColor }]}>Sign Out</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t, i18n } = useTranslation();
  const supabaseUser = useAppStore(s => s.supabaseUser);

  const accent = isDark ? '#4dabf7' : '#228be6';
  const bg = isDark ? '#121212' : '#f0f4f8';
  const cardBg = isDark ? '#1e1e2e' : '#fff';
  const textColor = isDark ? '#e9ecef' : '#212529';
  const textMuted = isDark ? '#868e96' : '#6c757d';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Auth section ─────────────────────────── */}
      {supabaseUser ? (
        <ProfileCard isDark={isDark} />
      ) : (
        <AuthForm isDark={isDark} />
      )}

      {/* ── Language selector ────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          🌐 {t('profile.selectLanguage')}
        </Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {LANGUAGES.map((lang, index) => (
            <Pressable
              key={lang.code}
              style={({ hovered, pressed }) => [
                styles.langRow,
                index < LANGUAGES.length - 1 && [
                  styles.langRowBorder,
                  { borderBottomColor: isDark ? '#333' : '#e9ecef' },
                ],
                hovered && Platform.OS === 'web' && { backgroundColor: isDark ? '#2a2a3e' : '#f1f3f5' },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => i18n.changeLanguage(lang.code)}
            >
              <View style={styles.langInfo}>
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, { color: textColor }]}>{lang.label}</Text>
              </View>
              {i18n.language === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color={accent} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── App info ─────────────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          ℹ️ {t('profile.appInfo')}
        </Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textMuted }]}>CubeTimer</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>v1.1.0</Text>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: isDark ? '#333' : '#e9ecef' }]}>
            <Text style={[styles.infoLabel, { color: textMuted }]}>Backend</Text>
            <Text style={[styles.infoValue, { color: supabaseUser ? '#37b24d' : textMuted }]}>
              {supabaseUser ? '☁️ Supabase' : '📱 Local'}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },

  // ── Auth card ──
  authCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  authIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },

  // ── Inputs ──
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    width: '100%',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },

  // ── Auth buttons ──
  authButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // ── Profile card ──
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 24,
  },
  signOutText: { fontSize: 14, fontWeight: '700' },

  // ── Language section ──
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  langRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  langInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langFlag: { fontSize: 24 },
  langLabel: { fontSize: 16, fontWeight: '500' },

  // ── Info section ──
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15, fontWeight: '600' },
});
