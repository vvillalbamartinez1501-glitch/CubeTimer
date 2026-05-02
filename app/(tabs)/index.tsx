import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, useColorScheme, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { CategorySelector } from '../../src/components/CategorySelector';
import { saveSolve } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';
import { Ionicons } from '@expo/vector-icons';

type TimerState = 'idle' | 'running' | 'finished';

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { currentScramble, generateNewScramble, activeUserId, activeCategoryId } = useAppStore();
  
  const [time, setTime] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const updateTime = () => {
    if (startTimeRef.current === 0) return;
    const now = Date.now();
    setTime(now - startTimeRef.current);
    requestRef.current = requestAnimationFrame(updateTime);
  };

  const handlePressArea = () => {
    if (timerState === 'finished') return; // Bloquear iniciar de nuevo si está en modo decisión

    if (timerState === 'running') {
      // Detener
      setTimerState('finished');
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    } else if (timerState === 'idle') {
      // Iniciar
      setTime(0);
      startTimeRef.current = Date.now();
      setTimerState('running');
      requestRef.current = requestAnimationFrame(updateTime);
    }
  };

  const handleAddTwo = () => {
    setTime(prevTime => prevTime + 2000);
  };

  const handleDiscard = () => {
    setTime(0);
    setTimerState('idle');
    generateNewScramble();
  };

  const handleSave = async () => {
    await saveSolve(activeUserId, activeCategoryId, time, currentScramble);
    setTime(0);
    setTimerState('idle');
    generateNewScramble();
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.topSection}>
        {timerState !== 'running' && <CategorySelector />}
        <View style={styles.scrambleContainer}>
          <Text style={[styles.scrambleText, isDark && styles.textDark]}>
            {currentScramble}
          </Text>
        </View>
      </View>

      <Pressable 
        style={styles.timerPressableArea} 
        onPress={handlePressArea}
      >
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, isDark && styles.textDark]}>
            {formatTime(time)}
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
            <Text style={[styles.instructionText, isDark && styles.textLight]}>
              {timerState === 'running' ? 'Toca la pantalla para detener' : 'Toca la pantalla para iniciar'}
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
    color: '#212529',
  },
  instructionContainer: {
    paddingBottom: 80,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#868e96',
    fontWeight: '500',
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
