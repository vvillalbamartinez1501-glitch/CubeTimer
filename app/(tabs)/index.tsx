import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, useColorScheme, TouchableOpacity, Switch, Platform } from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { CategorySelector } from '../../src/components/CategorySelector';
import { saveSolve } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

type TimerState = 'idle' | 'inspecting' | 'holding' | 'running' | 'finished';

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  
  const { currentScramble, generateNewScramble, activeUserId, activeCategoryId } = useAppStore();
  
  const [time, setTime] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  
  const [isInspectionEnabled, setIsInspectionEnabled] = useState(false);
  const [inspectionTime, setInspectionTime] = useState(15);
  const [hasPenalty, setHasPenalty] = useState(false);

  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const timerStateRef = useRef<TimerState>('idle');
  const inspectionRef = useRef<NodeJS.Timeout | null>(null);

  // Sincroniza el estado local con la referencia para poder usarlo de forma segura en los listeners de teclado web
  const setTimerStateSync = (state: TimerState) => {
    timerStateRef.current = state;
    setTimerState(state);
  };

  const startInspection = () => {
    setTimerStateSync('inspecting');
    setInspectionTime(15);
    setHasPenalty(false);
    
    if (inspectionRef.current) clearInterval(inspectionRef.current);
    
    inspectionRef.current = setInterval(() => {
      setInspectionTime((prev) => {
        if (prev <= 1) {
          setHasPenalty(true);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const updateTime = () => {
    if (startTimeRef.current === 0) return;
    const now = Date.now();
    setTime(now - startTimeRef.current);
    requestRef.current = requestAnimationFrame(updateTime);
  };

  const handlePressDown = useCallback(() => {
    const currentState = timerStateRef.current;
    
    if (currentState === 'finished') return;

    if (currentState === 'idle') {
      if (isInspectionEnabled) {
        startInspection();
      } else {
        setTimerStateSync('holding');
      }
    } else if (currentState === 'inspecting') {
      if (inspectionRef.current) clearInterval(inspectionRef.current);
      setTimerStateSync('holding');
    } else if (currentState === 'running') {
      setTimerStateSync('finished');
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      
      // Aplicar penalización si la inspección llegó a 0
      if (hasPenalty) {
        setTime(prev => prev + 2000);
      }
    }
  }, [isInspectionEnabled, hasPenalty]);

  const handlePressUp = useCallback(() => {
    const currentState = timerStateRef.current;
    if (currentState === 'holding') {
      setTime(0);
      startTimeRef.current = Date.now();
      setTimerStateSync('running');
      requestRef.current = requestAnimationFrame(updateTime);
    }
  }, []);

  // Soporte de barra espaciadora para Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Evita que la web haga scroll hacia abajo
        if (e.repeat) return; // Evita llamadas continuas mientras se mantiene pulsado
        handlePressDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePressUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePressDown, handlePressUp]);

  // Limpieza general de intervalos
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (inspectionRef.current) clearInterval(inspectionRef.current);
    };
  }, []);

  // Botones Post-Solve
  const handleAddTwo = () => setTime(prevTime => prevTime + 2000);
  
  const handleDiscard = () => {
    setTime(0);
    setTimerStateSync('idle');
    setHasPenalty(false);
    generateNewScramble();
  };

  const handleSave = async () => {
    await saveSolve(activeUserId, activeCategoryId, time, currentScramble);
    setTime(0);
    setTimerStateSync('idle');
    setHasPenalty(false);
    generateNewScramble();
  };

  // Render helpers
  const getTimerDisplayColor = () => {
    if (timerState === 'holding') return '#00C851'; // Verde indicando "listo para soltar"
    if (timerState === 'inspecting' && hasPenalty) return '#ff4444'; // Rojo por penalización
    return isDark ? '#fff' : '#212529';
  };

  const renderTimerText = () => {
    if (timerState === 'inspecting') {
      if (hasPenalty) return '+2';
      return inspectionTime.toString();
    }
    if (timerState === 'idle' || timerState === 'holding') {
      return formatTime(0);
    }
    return formatTime(time);
  };

  const renderInstructionText = () => {
    if (timerState === 'idle') return t('timer.holdToStart');
    if (timerState === 'inspecting') return t('timer.pressToReady');
    if (timerState === 'holding') return t('timer.releaseToStart');
    if (timerState === 'running') return t('timer.tapToStop');
    return '';
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.topSection}>
        {timerState === 'idle' && <CategorySelector />}
        
        {/* El Scramble se oculta en holding/running para mayor concentración */}
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
          <Text style={[styles.timerText, { color: getTimerDisplayColor() }]}>
            {renderTimerText()}
          </Text>
        </View>
        
        {timerState === 'finished' ? (
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleDiscard} style={[styles.actionButton, styles.buttonDelete]}>
              <Ionicons name="trash" size={32} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleAddTwo} style={[styles.actionButton, styles.buttonPenalty]}>
              <Text style={styles.penaltyText}>+2s</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleSave} style={[styles.actionButton, styles.buttonSave]}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.instructionContainer}>
            {timerState === 'idle' && (
              <View style={styles.inspectionToggleContainer}>
                <Text style={[styles.inspectionText, isDark && styles.textDark]}>{t('timer.inspectionWCA')}</Text>
                <Switch 
                  value={isInspectionEnabled} 
                  onValueChange={setIsInspectionEnabled} 
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isInspectionEnabled ? '#007aff' : '#f4f3f4'}
                />
              </View>
            )}
            <Text style={[styles.instructionText, isDark && styles.textLight]}>
              {renderInstructionText()}
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
  penaltyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
