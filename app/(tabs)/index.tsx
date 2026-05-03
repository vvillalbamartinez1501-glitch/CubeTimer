import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategorySelector } from '../../src/components/CategorySelector';
import { getCategorySolveCount, getTotalSolves, saveSolve } from '../../src/database/operations';
import { useSpeedTimer } from '../../src/hooks/useSpeedTimer';
import { useGamificationStore } from '../../src/store/gamificationStore';
import { useAppStore } from '../../src/store/useAppStore';
import { ScrambleImage } from '../../src/components/ScrambleImage';

// ─── Formateador Local (Garantiza . para centésimas) ─────────────────────────
const formatTimeLocal = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mStr = minutes > 0 ? `${minutes}:` : '';
  const sStr = minutes > 0 ? seconds.toString().padStart(2, '0') : seconds.toString();
  const cStr = centiseconds.toString().padStart(2, '0');

  return `${mStr}${sStr}.${cStr}`;
};

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === 'dark';
  const { t }       = useTranslation();
  const insets      = useSafeAreaInsets();

  const { currentScramble, generateNewScramble, activeUserId, activeCategoryId } = useAppStore();
  const { updateStreak, checkAchievements } = useGamificationStore();

  const [isInspectionEnabled, setIsInspectionEnabled] = useState(false);

  // ─── Custom Hook para el Cronómetro (Lógica centralizada) ──────────────────
  const {
    timerState,
    displayTime,
    isInspecting,
    hasPenalty,
    onPressDown,
    onPressUp,
    resetTimer,
    addPenalty,
  } = useSpeedTimer({
    isInspectionEnabled,
  });

  console.log('[TimerScreen] State:', timerState, 'DisplayTime:', displayTime);

  // ─── Acciones Post-Solve ────────────────────────────────────────────────────
  const handleDiscard = useCallback(() => {
    resetTimer();
    generateNewScramble();
  }, [resetTimer, generateNewScramble]);

  const handleSave = useCallback(() => {
    const timeToSave = displayTime;
    const scrambleToSave = currentScramble;
    
    // Reset UI inmediatamente (Interfaz Optimista)
    handleDiscard();

    const persist = async () => {
      try {
        await saveSolve(activeUserId, activeCategoryId, timeToSave, scrambleToSave);
        updateStreak();
        const [total, catTotal] = await Promise.all([
          getTotalSolves(activeUserId),
          getCategorySolveCount(activeUserId, activeCategoryId),
        ]);
        const unlocked = checkAchievements(timeToSave, activeCategoryId, total, catTotal);
        unlocked.forEach(ach => Alert.alert('🏆 Achievement!', `${ach.title}\n${ach.description}`));
      } catch (e) {
        console.warn('[Timer] Save error:', e);
      }
    };
    persist();
  }, [displayTime, currentScramble, activeUserId, activeCategoryId, handleDiscard, updateStreak, checkAchievements]);

  // ─── Visuales ───────────────────────────────────────────────────────────────
  const timerColor = useMemo(() => {
    if (timerState === 'holding') return '#00C851';
    if (isInspecting && hasPenalty) return '#ff4444';
    return isDark ? '#fff' : '#212529';
  }, [timerState, isInspecting, hasPenalty, isDark]);

  const displayText = useMemo(() => {
    if (isInspecting) return hasPenalty ? '+2' : String(displayTime);
    return formatTimeLocal(displayTime);
  }, [isInspecting, hasPenalty, displayTime]);

  const instructionText = useMemo(() => {
    if (timerState === 'idle') return t('timer.holdToStart');
    if (timerState === 'inspecting') return t('timer.pressToReady');
    if (timerState === 'holding') return t('timer.releaseToStart');
    if (timerState === 'running') return t('timer.tapToStop');
    return '';
  }, [timerState, t]);

  const showUI = timerState === 'idle' || isInspecting || timerState === 'finished';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      
      {/* 1. HEADER (Top Bar) - OUTSIDE the main Pressable */}
      {timerState === 'idle' && (
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          {/* Izquierda: Logo, App Name y Tab Name */}
          <View style={styles.headerLeft}>
            <View style={styles.logoTitleGroup}>
              <Ionicons name="cube-outline" size={28} color={isDark ? '#fff' : '#000'} />
              <Text style={[styles.headerTitle, isDark && styles.textDark]}>CubeTimer</Text>
            </View>
            <View style={styles.tabNameBadge}>
              <Text style={[styles.tabNameText, isDark && styles.textDark]}>
                {t('tabs.timer') || 'Timer'}
              </Text>
            </View>
          </View>

          {/* Centro: Selectores */}
          <View style={styles.headerCenter}>
            <Pressable style={[styles.sessionPill, isDark && styles.sessionPillDark]}>
              <Text style={[styles.sessionPillText, isDark && styles.textDark]}>Sesión 1</Text>
              <Ionicons name="chevron-down" size={14} color={isDark ? '#aaa' : '#666'} />
            </Pressable>
            <View style={{ zIndex: 100 }}>
              <CategorySelector />
            </View>
          </View>

          {/* Derecha: Iconos */}
          <View style={styles.headerRight}>
            <Pressable style={styles.iconButton}>
              <Ionicons name="settings-outline" size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Ionicons name="person-outline" size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
          </View>
        </View>
      )}

      {/* 2. ÁREA DEL SCRAMBLE (Sub-header) - OUTSIDE the main Pressable */}
      {showUI && (
        <View style={styles.scrambleArea}>
          <Text style={[styles.scrambleText, isDark && styles.textDark]}>
            {currentScramble}
          </Text>
          <ScrambleImage 
            scramble={currentScramble} 
            puzzle={activeCategoryId} 
            visible={timerState === 'idle'} 
          />
        </View>
      )}

      {/* 3. ÁREA DEL CRONÓMETRO (Centro) - THIS IS THE ONLY PRESSABLE ZONE */}
      <Pressable
        style={styles.timerArea}
        onPressIn={onPressDown}
        onPressOut={onPressUp}
      >
        <Text style={[styles.timerText, { color: timerColor }]}>
          {displayText}
        </Text>
      </Pressable>

      {/* 4. FOOTER (Botones de acción) - OUTSIDE the main Pressable */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {timerState === 'finished' ? (
          <View style={styles.actionRow}>
            <Pressable onPress={handleDiscard} style={[styles.actionButton, styles.buttonDelete]}>
              <Ionicons name="trash" size={32} color="#fff" />
            </Pressable>
            <Pressable onPress={addPenalty} style={[styles.actionButton, styles.buttonPenalty]}>
              <Text style={styles.penaltyText}>+2s</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.actionButton, styles.buttonSave]}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.instructionContainer}>
            {timerState === 'idle' && (
              <View style={styles.inspectionToggleContainer}>
                <Text style={[styles.inspectionText, isDark && styles.textDark]}>{t('timer.inspectionWCA')}</Text>
                <Switch 
                  value={isInspectionEnabled} 
                  onValueChange={setIsInspectionEnabled}
                  trackColor={{ false: '#767577', true: '#00C851' }}
                  thumbColor={isInspectionEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            )}

            {/* Main Toggle Button - Simplified for emergency touches if needed, but the main screen is the trigger */}
            {timerState !== 'running' && timerState !== 'holding' && (
              <Pressable
                onPress={() => {
                  if (timerState === 'idle' || timerState === 'finished' || timerState === 'inspecting') {
                    onPressDown();
                    if (!isInspectionEnabled) {
                      setTimeout(onPressUp, 10);
                    }
                  } else if (timerState === 'holding') {
                    onPressUp();
                  } else if (timerState === 'running') {
                    onPressDown();
                  }
                }}
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
                  size={36} 
                  color="#fff" 
                />
              </Pressable>
            )}

            <Text style={[styles.instructionText, isDark && styles.textLight]}>
              {instructionText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#121212' },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 100, // Important for modals/dropdowns in CategorySelector
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabNameBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#007aff',
  },
  tabNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  sessionPillDark: {
    backgroundColor: '#343a40',
  },
  sessionPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 4,
  },

  // Scramble Area
  scrambleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  scrambleText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#343a40',
    lineHeight: 30,
  },

  // Timer Area
  timerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  timerText: {
    fontSize: 100,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },

  // Footer
  footer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  instructionText: {
    fontSize: 18,
    color: '#868e96',
    marginTop: 15,
    fontWeight: '500',
  },
  inspectionToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 12,
    marginBottom: 10,
  },
  inspectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  textDark: { color: '#f8f9fa' },
  textLight: { color: '#adb5bd' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  actionButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  buttonDelete: { backgroundColor: '#ff4444' },
  buttonPenalty: { backgroundColor: '#f39c12' },
  buttonSave: { backgroundColor: '#00C851', width: 80, height: 80, borderRadius: 40 },
  penaltyText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  
  // Timer Action Button
  timerActionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginVertical: 10,
  },
});