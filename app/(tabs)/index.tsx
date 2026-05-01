import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, useColorScheme } from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';

const formatTime = (timeInMillis: number) => {
  const minutes = Math.floor(timeInMillis / 60000);
  const seconds = Math.floor((timeInMillis % 60000) / 1000);
  const centiseconds = Math.floor((timeInMillis % 1000) / 10);

  const minsStr = minutes > 0 ? `${minutes}:` : '';
  const secsStr = minutes > 0 ? seconds.toString().padStart(2, '0') : seconds.toString();
  const msStr = centiseconds.toString().padStart(2, '0');

  return `${minsStr}${secsStr}:${msStr}`; // Formato MM:SS:ms (centésimas)
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
    // TODO: En el próximo paso implementaremos la inserción en SQLite aquí
  };

  const updateTime = () => {
    if (startTimeRef.current === 0) return;
    const now = Date.now();
    setTime(now - startTimeRef.current);
    requestRef.current = requestAnimationFrame(updateTime);
  };

  const handlePress = () => {
    if (isRunning) {
      // Detener el cronómetro
      setIsRunning(false);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      handleSaveTime(time);
      generateNewScramble(); // Generamos un nuevo scramble automáticamente
    } else {
      // Iniciar el cronómetro
      setTime(0);
      startTimeRef.current = Date.now();
      setIsRunning(true);
      requestRef.current = requestAnimationFrame(updateTime);
    }
  };

  // Limpieza al desmontar el componente para evitar memory leaks
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <Pressable 
      style={[styles.container, isDark && styles.containerDark]} 
      onPress={handlePress}
    >
      <View style={styles.scrambleContainer}>
        <Text style={[styles.scrambleText, isDark && styles.textDark]}>
          {currentScramble}
        </Text>
      </View>
      
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, isDark && styles.textDark, isRunning && styles.timerRunning]}>
          {formatTime(time)}
        </Text>
      </View>
      
      <View style={styles.instructionContainer}>
        <Text style={[styles.instructionText, isDark && styles.textLight]}>
          {isRunning ? 'Toca la pantalla para detener' : 'Toca la pantalla para iniciar'}
        </Text>
      </View>
    </Pressable>
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
  scrambleContainer: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    minHeight: 150,
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
    fontVariant: ['tabular-nums'], // Evita que los números salten de ancho
    color: '#212529',
  },
  timerRunning: {
    // Podríamos cambiar el color mientras corre, o simplemente dejarlo igual.
    // Los speedcubers suelen preferir que no distraiga.
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
