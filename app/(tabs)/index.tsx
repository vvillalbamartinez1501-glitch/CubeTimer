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
import { CategorySelector } from '../../src/components/CategorySelector';
import { getCategorySolveCount, getTotalSolves, saveSolve } from '../../src/database/operations';
import { useSpeedTimer } from '../../src/hooks/useSpeedTimer';
import { useGamificationStore } from '../../src/store/gamificationStore';
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

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      
      {/* 1. SECCIÓN SUPERIOR: Category Selector y Scramble */}
      <View style={styles.topSection}>
        {timerState === 'idle' && (
          <View style={styles.selectorWrapper}>
            <CategorySelector />
          </View>
        )}
        {(timerState === 'idle' || isInspecting || timerState === 'finished') && (
          <View style={styles.scrambleContainer}>
            <Text style={[styles.scrambleText, isDark && styles.textDark]}>
              {currentScramble}
            </Text>
          </View>
        )}
      </View>

      {/* 2. ÁREA DEL CRONÓMETRO: Pressable gigante (Middle) */}
      <Pressable
        style={styles.timerContainer}
        onPressIn={onPressDown}
        onPressOut={onPressUp}
      >
        <Text style={[styles.timerText, { color: timerColor }]}>
          {displayText}
        </Text>
      </Pressable>

      {/* 3. SECCIÓN INFERIOR: Botones de acción y controles (Bottom) */}
      <View style={styles.bottomSection}>
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
                />
              </View>
            )}

            {/* Botón principal (Para dispositivos sin teclado) */}
            <Pressable
              onPressIn={onPressDown}
              onPressOut={onPressUp}
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
      </View>
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
    minHeight: 120,
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  selectorWrapper: {
    zIndex: 100,
    minHeight: 50,
  },
  scrambleContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
    width: '100%',
  },
  timerText: {
    fontSize: 90,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  bottomSection: {
    minHeight: 180,
    justifyContent: 'center',
  },
  instructionContainer: {
    paddingBottom: 40,
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
    marginBottom: 10,
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
    paddingBottom: 40,
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