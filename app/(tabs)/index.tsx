import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, Pressable,
  useColorScheme, Switch, Platform, Alert,
} from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { CategorySelector } from '../../src/components/CategorySelector';
import { saveSolve, getTotalSolves, getCategorySolveCount } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useGamificationStore } from '../../src/store/gamificationStore';

type TimerState = 'idle' | 'inspecting' | 'holding' | 'running' | 'finished';

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === 'dark';
  const { t }       = useTranslation();

  const { currentScramble, generateNewScramble, activeUserId, activeCategoryId } = useAppStore();
  const { updateStreak, checkAchievements } = useGamificationStore();

  // ─── State que sí necesita React ─────────────────────────────────────────────
  const [timerState,        setTimerState]        = useState<TimerState>('idle');
  const [isInspectionEnabled, setIsInspectionEnabled] = useState(false);
  const [inspectionTime,    setInspectionTime]    = useState(15);
  const [hasPenalty,        setHasPenalty]        = useState(false);
  const [runningTime,       setRunningTime]        = useState(0);   // ms mientras corre
  const [displayTime,       setDisplayTime]        = useState(0);   // ms al finalizar

  // ─── Refs (nunca provocan re-render) ─────────────────────────────────────────
  const timerStateRef  = useRef<TimerState>('idle');
  const startTimeRef   = useRef<number>(0);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const inspectionRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPenaltyRef  = useRef(false);

  // ─── Helper: actualiza estado + ref al mismo tiempo ──────────────────────────
  const setTimerStateSync = useCallback((state: TimerState) => {
    timerStateRef.current = state;
    setTimerState(state);
  }, []);

  // ─── Limpiar el intervalo del cronómetro ─────────────────────────────────────
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ─── Inspección WCA ──────────────────────────────────────────────────────────
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

  // ─── PRESS DOWN ──────────────────────────────────────────────────────────────
  const handlePressDown = useCallback(() => {
    const state = timerStateRef.current;

    // En 'finished' los toques del Pressable están desactivados por los botones de acción
    if (state === 'finished') return;

    if (state === 'idle') {
      if (isInspectionEnabled) {
        startInspection();
      } else {
        setTimerStateSync('holding');
      }
      return;
    }

    if (state === 'inspecting') {
      if (inspectionRef.current) clearInterval(inspectionRef.current);
      setTimerStateSync('holding');
      return;
    }

    if (state === 'running') {
      // ── PARAR ──
      stopInterval();
      const elapsed   = Date.now() - startTimeRef.current;
      const finalTime = hasPenaltyRef.current ? elapsed + 2000 : elapsed;

      setDisplayTime(finalTime);
      setRunningTime(0);
      setTimerStateSync('finished');
    }
  }, [isInspectionEnabled, setTimerStateSync, startInspection, stopInterval]);

  // ─── PRESS UP ────────────────────────────────────────────────────────────────
  const handlePressUp = useCallback(() => {
    if (timerStateRef.current !== 'holding') return;

    // ── ARRANCAR ──
    startTimeRef.current = Date.now();
    setRunningTime(0);
    setTimerStateSync('running');

    // setInterval a 30 ms (~33 fps) — suficiente para ver centésimas, sin saturar
    intervalRef.current = setInterval(() => {
      setRunningTime(Date.now() - startTimeRef.current);
    }, 30);
  }, [setTimerStateSync]);

  // ─── Barra espaciadora (Web) ─────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (e.repeat)   return;   // ignorar autorepeat del SO
      handlePressDown();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      handlePressUp();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, [handlePressDown, handlePressUp]);

  // ─── Limpieza al desmontar ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopInterval();
      if (inspectionRef.current) clearInterval(inspectionRef.current);
    };
  }, [stopInterval]);

  // ─── Botones post-solve ───────────────────────────────────────────────────────
  const handleAddTwo = useCallback(() => {
    setDisplayTime(prev => prev + 2000);
  }, []);

  const handleDiscard = useCallback(() => {
    setDisplayTime(0);
    hasPenaltyRef.current = false;
    setHasPenalty(false);
    setTimerStateSync('idle');
    generateNewScramble();
  }, [setTimerStateSync, generateNewScramble]);

  // 🔥 Fire-and-forget: la UI resetea al instante, el guardado ocurre en background
  const handleSave = useCallback(() => {
    const timeToSave    = displayTime;
    const scrambleToSave = currentScramble;

    // Reset inmediato
    setDisplayTime(0);
    hasPenaltyRef.current = false;
    setHasPenalty(false);
    setTimerStateSync('idle');
    generateNewScramble();

    const persist = async () => {
      try {
        await saveSolve(activeUserId, activeCategoryId, timeToSave, scrambleToSave);
        updateStreak();

        const [total, catTotal] = await Promise.all([
          getTotalSolves(activeUserId),
          getCategorySolveCount(activeUserId, activeCategoryId),
        ]);
        const unlocked = checkAchievements(timeToSave, activeCategoryId, total, catTotal);
        for (const ach of unlocked) {
          Alert.alert('🏆 Achievement Unlocked!', `${ach.title}\n${ach.description}`);
        }
      } catch (err) {
        console.warn('[Timer] Error al guardar (no crítico):', err);
      }
    };

    persist(); // sin await → no bloquea
  }, [
    displayTime, currentScramble,
    activeUserId, activeCategoryId,
    setTimerStateSync, generateNewScramble,
    updateStreak, checkAchievements,
  ]);

  // ─── Derivados visuales ───────────────────────────────────────────────────────
  const timerColor = useMemo(() => {
    if (timerState === 'holding')                       return '#00C851';
    if (timerState === 'inspecting' && hasPenalty)      return '#ff4444';
    return isDark ? '#fff' : '#212529';
  }, [timerState, hasPenalty, isDark]);

  const displayText = useMemo(() => {
    if (timerState === 'inspecting') return hasPenalty ? '+2' : String(inspectionTime);
    if (timerState === 'running')    return formatTime(runningTime);
    if (timerState === 'finished')   return formatTime(displayTime);
    return formatTime(0); // idle / holding
  }, [timerState, hasPenalty, inspectionTime, runningTime, displayTime]);

  const instructionText = useMemo(() => {
    if (timerState === 'idle')       return t('timer.holdToStart');
    if (timerState === 'inspecting') return t('timer.pressToReady');
    if (timerState === 'holding')    return t('timer.releaseToStart');
    if (timerState === 'running')    return t('timer.tapToStop');
    return '';
  }, [timerState, t]);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Zona superior: scramble + selector de categoría */}
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

      {/* Zona central táctil */}
      <Pressable
        style={styles.timerPressableArea}
        onPressIn={handlePressDown}
        onPressOut={handlePressUp}
      >
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {displayText}
          </Text>
        </View>

        {timerState === 'finished' ? (
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleDiscard}
              style={({ hovered, pressed }) => [
                styles.actionButton, styles.buttonDelete,
                hovered && Platform.OS === 'web' && styles.buttonHovered,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="trash" size={32} color="#fff" />
            </Pressable>

            <Pressable
              onPress={handleAddTwo}
              style={({ hovered, pressed }) => [
                styles.actionButton, styles.buttonPenalty,
                hovered && Platform.OS === 'web' && styles.buttonHovered,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.penaltyText}>+2s</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={({ hovered, pressed }) => [
                styles.actionButton, styles.buttonSave,
                hovered && Platform.OS === 'web' && styles.buttonHovered,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="checkmark" size={36} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.instructionContainer}>
            {timerState === 'idle' && (
              <View style={styles.inspectionToggleContainer}>
                <Text style={[styles.inspectionText, isDark && styles.textDark]}>
                  {t('timer.inspectionWCA')}
                </Text>
                <Switch
                  value={isInspectionEnabled}
                  onValueChange={setIsInspectionEnabled}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isInspectionEnabled ? '#007aff' : '#f4f3f4'}
                />
              </View>
            )}
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
  topSection: {
    paddingTop: 40,
    zIndex: 10,
  },
  timerPressableArea: {
    flex: 1,
  },
  scrambleContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  scrambleText: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 38,
    color: '#343a40',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 85,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  instructionContainer: {
    paddingBottom: 80,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#868e96',
    fontWeight: '500',
    marginTop: 10,
  },
  inspectionToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  inspectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  textDark: {
    color: '#f8f9fa',
  },
  textLight: {
    color: '#adb5bd',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
    gap: 30,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDelete: {
    backgroundColor: '#ff4444',
  },
  buttonPenalty: {
    backgroundColor: '#f39c12',
  },
  buttonSave: {
    backgroundColor: '#00C851',
  },
  buttonHovered: {
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.9 }],
    opacity: 0.8,
  },
  penaltyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
