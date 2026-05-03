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
import { getCategorySolveCount, getSolves, getTotalSolves, saveSolve, deleteSolve, clearSessionSolves } from '../../src/database/operations';
import { useSpeedTimer } from '../../src/hooks/useSpeedTimer';
import { useGamificationStore } from '../../src/store/gamificationStore';
import { Header } from '../../src/components/Header';

import { useAppStore } from '../../src/store/useAppStore';

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

  const { 
    currentScramble, generateNewScramble, activeUserId, activeCategoryId, 
    activeSessionId, previousSessionId, setActiveSession 
  } = useAppStore();
  const { updateStreak, checkAchievements } = useGamificationStore();

  const [isInspectionEnabled, setIsInspectionEnabled] = useState(false);
  const [solves, setSolves] = useState<any[]>([]);

  // ─── Fetch Solves ───────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const data = await getSolves(activeUserId, activeCategoryId, activeSessionId);
      setSolves(data);
    } catch (e) {
      console.warn('[Timer] Fetch history error:', e);
    }
  }, [activeUserId, activeCategoryId, activeSessionId]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory, activeSessionId]);

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

  // ─── Auto-revert 'All Sessions' to previous session when starting a solve ──
  React.useEffect(() => {
    if ((timerState === 'holding' || timerState === 'running' || isInspecting) && activeSessionId === 'ALL_SESSIONS') {
      setActiveSession(previousSessionId || `default-${activeCategoryId}`);
    }
  }, [timerState, isInspecting, activeSessionId, previousSessionId, activeCategoryId, setActiveSession]);

  // ─── Acciones Post-Solve ────────────────────────────────────────────────────
  const handleDiscard = useCallback(() => {
    resetTimer();
    generateNewScramble();
  }, [resetTimer, generateNewScramble]);

  const handleSave = useCallback(() => {
    const timeToSave = displayTime;
    const scrambleToSave = currentScramble;
    
    handleDiscard();

    const persist = async () => {
      try {
        await saveSolve(activeUserId, activeCategoryId, timeToSave, scrambleToSave, activeSessionId);
        updateStreak();
        fetchHistory();
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
  }, [displayTime, currentScramble, activeUserId, activeCategoryId, activeSessionId, handleDiscard, updateStreak, checkAchievements, fetchHistory]);

  const handleDelete = useCallback(async (id: number) => {
    Alert.alert(
      t('history.deleteConfirmTitle'),
      t('history.deleteConfirmMsg'),
      [
        { text: t('actions.cancel'), style: 'cancel' },
        { 
          text: t('actions.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSolve(id);
              fetchHistory();
              Alert.alert(t('actions.success'), t('history.deletedSuccess'));
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        },
      ]
    );
  }, [t, fetchHistory]);

  const handleClearSession = useCallback(() => {
    if (solves.length === 0) return;
    
    Alert.alert(
      t('history.clearSessionTitle') || '¿Vaciar sesión?',
      t('history.clearSessionMsg') || '¿Estás seguro de que quieres eliminar TODOS los tiempos de esta sesión? Esta acción no se puede deshacer.',
      [
        { text: t('actions.cancel'), style: 'cancel' },
        { 
          text: t('actions.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearSessionSolves(activeUserId, activeCategoryId, activeSessionId);
              fetchHistory();
              Alert.alert(t('actions.success'), t('history.sessionCleared') || 'Sesión vaciada correctamente');
            } catch (e) {
              Alert.alert('Error', 'No se pudo vaciar la sesión');
            }
          }
        },
      ]
    );
  }, [t, solves, activeUserId, activeCategoryId, activeSessionId, fetchHistory]);

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
      
      {/* 1. HEADER (Top Bar) */}
      {timerState === 'idle' && (
        <Header titleKey="tabs.timer" />
      )}

      {/* Main Content Area (Sidebar + Timer) */}
      <View style={styles.mainContent}>
        
        {/* SIDEBAR: History */}
        {timerState === 'idle' && (
          <View style={[styles.sidebar, isDark && styles.sidebarDark]}>
            <View style={styles.sidebarHeader}>
              <Text style={[styles.sidebarTitle, isDark && styles.textDark]}>Historial</Text>
              <Pressable onPress={handleClearSession} style={styles.clearSessionBtn}>
                <Ionicons name="trash" size={16} color="#ff3b30" />
              </Pressable>
            </View>
            <View style={styles.solvesList}>
              {solves.slice(0, 20).map((solve, index) => (
                <View key={solve.id} style={styles.solveItem}>
                  <Text style={styles.solveIndex}>{solves.length - index}</Text>
                  <Text style={[styles.solveTime, isDark && styles.textDark]}>
                    {formatTimeLocal(solve.time)}
                  </Text>
                  <Pressable onPress={() => handleDelete(solve.id)} style={styles.sidebarDeleteBtn}>
                    <Ionicons name="trash-outline" size={14} color="#ff3b30" />
                  </Pressable>
                </View>
              ))}
              {solves.length === 0 && (
                <Text style={styles.noSolvesText}>Sin tiempos</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.timerWrapper}>
          {/* 2. ÁREA DEL SCRAMBLE */}
          {showUI && (
            <View style={styles.scrambleArea}>
              <Text style={[styles.scrambleText, isDark && styles.textDark]}>
                {currentScramble}
              </Text>
            </View>
          )}

          {/* 3. ÁREA DEL CRONÓMETRO */}
          <Pressable
            style={styles.timerArea}
            onPressIn={onPressDown}
            onPressOut={onPressUp}
          >
            <Text style={[styles.timerText, { color: timerColor }]}>
              {displayText}
            </Text>
          </Pressable>

          {/* 4. FOOTER */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#121212' },

  // Main Content
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 180,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  sidebarDark: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRightColor: 'rgba(255,255,255,0.05)',
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#868e96',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  clearSessionBtn: {
    padding: 4,
  },
  solvesList: {
    flex: 1,
  },
  solveItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  solveIndex: {
    fontSize: 12,
    color: '#adb5bd',
    fontWeight: '600',
  },
  solveTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
  },
  sidebarDeleteBtn: {
    padding: 4,
  },
  noSolvesText: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  timerWrapper: {
    flex: 1,
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