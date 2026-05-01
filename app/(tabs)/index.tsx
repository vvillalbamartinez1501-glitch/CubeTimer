import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, useColorScheme } from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { CategorySelector } from '../../src/components/CategorySelector';

const formatTime = (timeInMillis: number) => {
  const minutes = Math.floor(timeInMillis / 60000);
  const seconds = Math.floor((timeInMillis % 60000) / 1000);
  const centiseconds = Math.floor((timeInMillis % 1000) / 10);

  const minsStr = minutes > 0 ? `${minutes}:` : '';
  const secsStr = minutes > 0 ? seconds.toString().padStart(2, '0') : seconds.toString();
  const msStr = centiseconds.toString().padStart(2, '0');

  return `${minsStr}${secsStr}:${msStr}`; 
};

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { currentScramble, generateNewScramble } = useAppStore();
  
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const handleSaveTime = (timeInMillis: number) => {
    console.log('Tiempo a guardar:', formatTime(timeInMillis), '(', timeInMillis, 'ms)');
    // TODO: SQLite
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
      {/* Al separar el área interactiva del selector del Pressable del timer, evitamos clics accidentales */}
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
