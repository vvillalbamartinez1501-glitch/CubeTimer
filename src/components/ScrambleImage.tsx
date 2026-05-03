import React from 'react';
import { StyleSheet, View, Image, ActivityIndicator, useColorScheme } from 'react-native';

interface ScrambleImageProps {
  scramble: string;
  puzzle: string;
  visible: boolean;
}

const getPzlParam = (puzzle: string): string => {
  if (puzzle === '2x2') return '2';
  if (puzzle === '3x3' || puzzle === '3x3oh' || puzzle === '3x3bld' || puzzle === 'mirror-3x3') return '3';
  if (puzzle === '4x4') return '4';
  if (puzzle === '5x5') return '5';
  if (puzzle === '6x6') return '6';
  if (puzzle === '7x7') return '7';
  return '3';
};

export const ScrambleImage: React.FC<ScrambleImageProps> = ({ scramble, puzzle, visible }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible) return null;

  // Solo mostramos imagen para cubos NxN (VisualCube soporta principalmente NxN)
  const isNxN = ['2x2', '3x3', '4x4', '5x5', '6x6', '7x7', '3x3oh', '3x3bld', 'mirror-3x3'].includes(puzzle);
  
  if (!isNxN) return null;

  const pzl = getPzlParam(puzzle);
  const encodedScramble = encodeURIComponent(scramble);
  const url = `http://cube.crider.co.uk/visualcube.php?fmt=svg&pzl=${pzl}&size=150&alg=${encodedScramble}`;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      }
    ]}>
      <Image 
        source={{ uri: url }} 
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 160,
    width: '90%',
    alignSelf: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 3,
  },
  image: {
    width: 150,
    height: 150,
  },
});
