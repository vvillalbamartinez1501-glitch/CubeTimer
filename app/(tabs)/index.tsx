import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, Pressable,
  useColorScheme, Switch, Platform, Alert,
} from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { CategorySelector } from '../../src/components/CategorySelector';
import { saveSolve, getTotalSolves, getCategorySolveCount } from '../../src/database/operations';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useGamificationStore } from '../../src/store/gamificationStore';

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

type TimerState = 'idle' | 'inspecting' | 'holding' | 'running' | 'finished';

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === 'dark';
  const { t }       = useTranslation();

  const { currentScramble, generateNewScramble, activeUserId, activeCategoryId } = useAppStore();
  const { updateStreak, checkAchievements } = useGamificationStore();

  // ─── Estados ─────────────────────────────────────────────────────────────────
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [isInspectionEnabled, setIsInspectionEnabled] = useState(false);
  const [inspectionTime, setInspectionTime] = useState(15);
  const [hasPenalty, setHasPenalty] = useState(false);
  const [runningTime, setRunningTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);

  // ─── Refs ───────────────────────────────────────────────────────────────────
  const timerStateRef = useRef<TimerState>('idle');
  const startTimeRef  = useRef<number>(0);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const inspectionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPenaltyRef = useRef(false);

  // Helper para sincronizar ref y estado
  const setTimerStateSync = useCallback((state: TimerState) => {
    console.log('[Timer] State transition:', timerStateRef.current, '->', state);
    timerStateRef.current = state;
    setTimerState(state);
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInspection = useCallback(() => {
    setTimerStateSync('inspecting');
    setInspectionTime(15);
    hasPenaltyRef.current = false;
    setHasPenalty(false);

    if (inspectionRef.current) clearInterval(inspectionRef.current);
    inspectionRef.current = setInterval(() => {
      setInspectionTime((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          hasPenaltyRef.current = true;
          setHasPenalty(true);
        }
        return next;
      });
    }, 1000);
  }, [setTimerStateSync]);

  // ─── Lógica Principal (Down/Up) ─────────────────────────────────────────────
  const handlePressDown = useCallback(() => {
    const state = timerStateRef.current;

    // Si está en 'finished', un nuevo toque reinicia a 'idle' o 'holding'
    if (state === 'finished') {
      setDisplayTime(0);
      setRunningTime(0);
      hasPenaltyRef.current = false;
      setHasPenalty(false);
      // No retornamos, dejamos que pase al bloque 'idle' más abajo
      timerStateRef.current = 'idle'; 
    }

    const currentState = timerStateRef.current;

    if (currentState === 'idle') {
      if (isInspectionEnabled) {
        startInspection();
      } else {
        hasPenaltyRef.current = false;
        setHasPenalty(false);
        setTimerStateSync('holding');
      }
    } else if (currentState === 'inspecting') {
      if (inspectionRef.current) clearInterval(inspectionRef.current);
      setTimerStateSync('holding');
    } else if (currentState === 'running') {
      stopInterval();
      const elapsed = Date.now() - startTimeRef.current;
      const finalTime = hasPenaltyRef.current ? elapsed + 2000 : elapsed;
      setDisplayTime(finalTime);
      setRunningTime(0);
      setTimerStateSync('finished');
    }
  }, [isInspectionEnabled, setTimerStateSync, startInspection, stopInterval]);

  const handlePressUp = useCallback(() => {
    if (timerStateRef.current !== 'holding') return;

    startTimeRef.current = Date.now();
    setRunningTime(0);
    setTimerStateSync('running');

    intervalRef.current = setInterval(() => {
      setRunningTime(Date.now() - startTimeRef.current);
    }, 30);
  }, [setTimerStateSync]);

  // ─── Listeners Web ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) handlePressDown();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePressUp();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handlePressDown, handlePressUp]);

  useEffect(() => {
    return () => {
      stopInterval();
      if (inspectionRef.current) clearInterval(inspectionRef.current);
    };
  }, [stopInterval]);

  // ─── Acciones Post-Solve ────────────────────────────────────────────────────
  const handleAddTwo = useCallback(() => setDisplayTime(prev => prev + 2000), []);

  const handleDiscard = useCallback(() => {
    setDisplayTime(0);
    hasPenaltyRef.current = false;
    setHasPenalty(false);
    setTimerStateSync('idle');
    generateNewScramble();
  }, [setTimerStateSync, generateNewScramble]);

  const handleSave = useCallback(() => {
    const timeToSave = displayTime;
    const scrambleToSave = currentScramble;
    handleDiscard(); // Reset UI inmediatamente

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
    if (timerState === 'inspecting' && hasPenalty) return '#ff4444';
    return isDark ? '#fff' : '#212529';
  }, [timerState, hasPenalty, isDark]);

  const displayText = useMemo(() => {
    if (timerState === 'inspecting') return hasPenalty ? '+2' : String(inspectionTime);
    if (timerState === 'running') return formatTimeLocal(runningTime);
    if (timerState === 'finished') return formatTimeLocal(displayTime);
    return formatTimeLocal(0);
  }, [timerState, hasPenalty, inspectionTime, runningTime, displayTime]);

  const instructionText = useMemo(() => {
    if (timerState === 'idle') return t('timer.holdToStart');
    if (timerState === 'inspecting') return t('timer.pressToReady');
    if (timerState === 'holding') return t('timer.releaseToStart');
    if (timerState === 'running') return t('timer.tapToStop');
    return '';
  }, [timerState, t]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* El Pressable ahora envuelve casi todo para que toda la pantalla responda */}
      <Pressable
        style={styles.mainPressable}
        onPressIn={handlePressDown}
        onPressOut={handlePressUp}
      >
        <View style={styles.topSection}>
          {timerState === 'idle' && <CategorySelector />}
          {(timerState === 'idle' || timerState === 'inspecting' || timerState === 'finished') && (
            <View style={styles.scrambleContainer}>
              <Text style={[styles.scrambleText, isDark && styles.textDark]}>
                {currentScramble}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {displayText}
          </Text>
        </View>

        {timerState === 'finished' ? (
          <View style={styles.actionRow}>
            {/* Los botones son Pressables internos, hay que evitar que el externo interfiera */}
            <Pressable onPress={(e) => { e.stopPropagation(); handleDiscard(); }} style={[styles.actionButton, styles.buttonDelete]}>
              <Ionicons name="trash" size={32} color="#fff" />
            </Pressable>
            <Pressable onPress={(e) => { e.stopPropagation(); handleAddTwo(); }} style={[styles.actionButton, styles.buttonPenalty]}>
              <Text style={styles.penaltyText}>+2s</Text>
            </Pressable>
            <Pressable onPress={(e) => { e.stopPropagation(); handleSave(); }} style={[styles.actionButton, styles.buttonSave]}>
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
                />
              </View>
            )}

            <Pressable
              onPressIn={(e) => { e.stopPropagation(); handlePressDown(); }}
              onPressOut={(e) => { e.stopPropagation(); handlePressUp(); }}
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
              <Text style={styles.timerActionButtonText}>
                {timerState === 'running' ? t('timer.stop') : t('timer.start')}
              </Text>
            </Pressable>

            <Text style={[styles.instructionText, isDark && styles.textLight]}>
              {instructionText}
            </Text>
          </View>
        )}
      </Pressable>
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
  mainPressable: {
    flex: 1,
  },
  topSection: {
    paddingTop: 40,
    zIndex: 10,
    minHeight: 180,
  },
  scrambleContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrambleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#343a40',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 90,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  instructionContainer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#868e96',
    marginTop: 10,
  },
  inspectionToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inspectionText: {
    fontSize: 16,
    color: '#212529',
  },
  textDark: { color: '#f8f9fa' },
  textLight: { color: '#adb5bd' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 60,
    gap: 30,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDelete: { backgroundColor: '#ff4444' },
  buttonPenalty: { backgroundColor: '#f39c12' },
  buttonSave: { backgroundColor: '#00C851' },
  penaltyText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  timerActionButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginVertical: 20,
  },
  timerActionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
