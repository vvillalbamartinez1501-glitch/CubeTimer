import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, useColorScheme } from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { CategorySelector } from '../../src/components/CategorySelector';
import { saveSolve } from '../../src/database/operations';
import { formatTime } from '../../src/utils/timeFormat';

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { currentScramble, generateNewScramble, activeUserId, activeCategoryId } = useAppStore();
  
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const handleSaveTime = async (timeInMillis: number) => {
    // Guardar en la base de datos local SQLite
    await saveSolve(activeUserId, activeCategoryId, timeInMillis, currentScramble);
  };

  const updateTime = () => {
    if (startTimeRef.current === 0) return;
    const now = Date.now();
    setTime(now - startTimeRef.current);
    requestRef.current = requestAnimationFrame(updateTime);
  };

  const handlePress = () => {
    if (isRunning) {
      setIsRunning(false);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      handleSaveTime(time);
      generateNewScramble(); 
    } else {
      setTime(0);
      startTimeRef.current = Date.now();
      setIsRunning(true);
      requestRef.current = requestAnimationFrame(updateTime);
    }
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
        {!isRunning && <CategorySelector />}
        <View style={styles.scrambleContainer}>
          <Text style={[styles.scrambleText, isDark && styles.textDark]}>
            {currentScramble}
          </Text>
        </View>
      </View>

      <Pressable 
        style={styles.timerPressableArea} 
        onPress={handlePress}
      >
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, isDark && styles.textDark]}>
            {formatTime(time)}
          </Text>
        </View>
        
        <View style={styles.instructionContainer}>
          <Text style={[styles.instructionText, isDark && styles.textLight]}>
            {isRunning ? 'Toca la pantalla para detener' : 'Toca la pantalla para iniciar'}
          </Text>
        </View>
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
});
