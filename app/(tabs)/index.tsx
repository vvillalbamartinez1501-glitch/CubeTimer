import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, useColorScheme, Switch, Platform, Alert } from 'react-native';
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
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const { currentScramble, generateNewScramble, activeUserId, activeCategoryId } = useAppStore();
  const { updateStreak, checkAchievements } = useGamificationStore();

  // ── Solo re-renders necesarios ──────────────────────────────────────────────
  // timerState controla qué sección del UI se muestra (no el número del cronómetro)
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [isInspectionEnabled, setIsInspectionEnabled] = useState(false);
  const [inspectionTime, setInspectionTime] = useState(15);
  const [hasPenalty, setHasPenalty] = useState(false);
  // displayTime solo se usa para mostrar el tiempo final (en 'finished')
  const [displayTime, setDisplayTime] = useState(0);

  // ── Refs: no producen re-renders ────────────────────────────────────────────
  const timerStateRef    = useRef<TimerState>('idle');
  const startTimeRef     = useRef<number>(0);
  const elapsedRef       = useRef<number>(0);        // tiempo acumulado sin setState
  const rafRef           = useRef<number | null>(null);
  const inspectionRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPenaltyRef    = useRef(false);             // versión ref de hasPenalty para closures
  const textRef          = useRef<Text>(null);        // nodo del texto del cronómetro

  // ── Setter sincronizado estado + ref ────────────────────────────────────────
  // useCallback con [] garantiza identidad estable → las deps de los demás callbacks son estables
  const setTimerStateSync = useCallback((state: TimerState) => {
    timerStateRef.current = state;
    setTimerState(state);
  }, []);

  // ── Bucle rAF: actualiza SOLO el nodo de texto, sin tocar el estado React ──
  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    elapsedRef.current = elapsed;
    if (textRef.current) {
      (textRef.current as any).setNativeProps({ text: formatTime(elapsed) });
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []); // sin deps → identidad estable

  // ── Inspección WCA ──────────────────────────────────────────────────────────
  const startInspection = useCallback(() => {
    setTimerStateSync('inspecting');
    setInspectionTime(15);
    hasPenaltyRef.current = false;
    setHasPenalty(false);

    if (inspectionRef.current) clearInterval(inspectionRef.current);

    inspectionRef.current = setInterval(() => {
      setInspectionTime((prev) => {
        if (prev <= 1) {
          hasPenaltyRef.current = true;
          setHasPenalty(true);
        }
        return prev - 1;
      });
    }, 1000);
  }, [setTimerStateSync]);

  // ── Press DOWN: transiciones de estado ──────────────────────────────────────
  const handlePressDown = useCallback(() => {
    const state = timerStateRef.current;

    if (state === 'finished') return;

    if (state === 'idle') {
      if (isInspectionEnabled) {
        startInspection();
      } else {
        setTimerStateSync('holding');
      }
    } else if (state === 'inspecting') {
      if (inspectionRef.current) clearInterval(inspectionRef.current);
      setTimerStateSync('holding');
    } else if (state === 'running') {
      // Parar cronómetro
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      const finalTime = hasPenaltyRef.current
        ? elapsedRef.current + 2000
        : elapsedRef.current;

      setDisplayTime(finalTime);    // un único re-render al parar
      setTimerStateSync('finished');
    }
  }, [isInspectionEnabled, setTimerStateSync, startInspection]);

  // ── Press UP: lanzar cronómetro ─────────────────────────────────────────────
  const handlePressUp = useCallback(() => {
    if (timerStateRef.current !== 'holding') return;

    elapsedRef.current   = 0;
    startTimeRef.current = Date.now();
    setTimerStateSync('running');

    // Inicializar el texto antes de que empiece el primer tick
    if (textRef.current) {
      (textRef.current as any).setNativeProps({ text: '0.00' });
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [tick, setTimerStateSync]);

  // ── Barra espaciadora (Web) ─────────────────────────────────────────────────
  // Los listeners se re-registran solo cuando cambia handlePressDown o handlePressUp,
  // que a su vez son estables gracias a que sus deps son refs o callbacks con [] estables.
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();           // evita scroll de página
      if (e.repeat) return;         // ignora autorepeat del sistema
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

  // ── Limpieza al desmontar ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current)        cancelAnimationFrame(rafRef.current);
      if (inspectionRef.current) clearInterval(inspectionRef.current);
    };
  }, []);

  // ── Botones Post-Solve ──────────────────────────────────────────────────────
  const handleAddTwo = useCallback(() => {
    setDisplayTime(prev => prev + 2000);
  }, []);

  const handleDiscard = useCallback(() => {
    setDisplayTime(0);
    setTimerStateSync('idle');
    hasPenaltyRef.current = false;
    setHasPenalty(false);
    generateNewScramble();
  }, [setTimerStateSync, generateNewScramble]);

  // 🔥 Fire-and-forget: guarda en background sin bloquear la UI
  const handleSave = useCallback(() => {
    const timeToSave = displayTime;
    const scrambleToSave = currentScramble;

    // Reset inmediato → la UI responde al instante
    setDisplayTime(0);
    setTimerStateSync('idle');
    hasPenaltyRef.current = false;
    setHasPenalty(false);
    generateNewScramble();

    // Guardado + logros en background (no-await en el flujo principal)
    const persist = async () => {
      try {
        await saveSolve(activeUserId, activeCategoryId, timeToSave, scrambleToSave);
        updateStreak();

        const [total, catTotal] = await Promise.all([
          getTotalSolves(activeUserId),
          getCategorySolveCount(activeUserId, activeCategoryId),
        ]);
        const newAchievements = checkAchievements(timeToSave, activeCategoryId, total, catTotal);

        for (const ach of newAchievements) {
          Alert.alert('🏆 Achievement Unlocked!', `${ach.title}\n${ach.description}`);
        }
      } catch (err) {
        console.warn('[Timer] Error al guardar solve (no crítico):', err);
      }
    };

    persist(); // sin await → fire-and-forget
  }, [
    displayTime, currentScramble, activeUserId, activeCategoryId,
    setTimerStateSync, generateNewScramble, updateStreak, checkAchievements,
  ]);

  // ── Render helpers (useMemo para no recrear en cada render) ─────────────────
  const timerColor = useMemo(() => {
    if (timerState === 'holding') return '#00C851';
    if (timerState === 'inspecting' && hasPenalty) return '#ff4444';
    return isDark ? '#fff' : '#212529';
  }, [timerState, hasPenalty, isDark]);

  const instructionText = useMemo(() => {
    if (timerState === 'idle')       return t('timer.holdToStart');
    if (timerState === 'inspecting') return t('timer.pressToReady');
    if (timerState === 'holding')    return t('timer.releaseToStart');
    if (timerState === 'running')    return t('timer.tapToStop');
    return '';
  }, [timerState, t]);

  // El texto del display durante 'running' lo maneja setNativeProps directamente.
  // Solo necesitamos calcular el texto inicial para los demás estados.
  const staticTimerText = useMemo(() => {
    if (timerState === 'inspecting') return hasPenalty ? '+2' : inspectionTime.toString();
    if (timerState === 'running')    return ''; // lo controla el ref → no importa
    return formatTime(timerState === 'finished' ? displayTime : 0);
  }, [timerState, hasPenalty, inspectionTime, displayTime]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
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

      <Pressable
        style={styles.timerPressableArea}
        onPressIn={handlePressDown}
        onPressOut={handlePressUp}
      >
        <View style={styles.timerContainer}>
          <Text
            ref={textRef}
            style={[styles.timerText, { color: timerColor }]}
          >
            {staticTimerText}
          </Text>
        </View>

        {timerState === 'finished' ? (
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleDiscard}
              style={({ hovered, pressed }) => [
                styles.actionButton,
                styles.buttonDelete,
                hovered && Platform.OS === 'web' && styles.buttonHovered,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="trash" size={32} color="#fff" />
            </Pressable>

            <Pressable
              onPress={handleAddTwo}
              style={({ hovered, pressed }) => [
                styles.actionButton,
                styles.buttonPenalty,
                hovered && Platform.OS === 'web' && styles.buttonHovered,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.penaltyText}>+2s</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={({ hovered, pressed }) => [
                styles.actionButton,
                styles.buttonSave,
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
