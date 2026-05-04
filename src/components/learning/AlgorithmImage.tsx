import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlgorithmImageProps {
  alg: string;
  type: string; // 'F2L' | 'OLL' | 'PLL'
  size?: number;
}

export const AlgorithmImage = ({ alg, type, size = 100 }: AlgorithmImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Construct VisualCube URL
  // Base format
  let url = `http://cube.crider.co.uk/visualcube.php?fmt=svg&size=${size}&bg=t&case=${encodeURIComponent(alg)}`;

  // Apply styling based on phase
  if (type === 'OLL' || type === 'PLL') {
    url += '&view=plan&sch=grey,grey,grey,grey,grey,yellow';
  } else if (type === 'F2L') {
    // For F2L, we want a standard 3D view, perhaps focusing on the U, R, F faces
    url += '&stage=f2l';
  }

  if (error || !alg) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Ionicons name="cube-outline" size={size * 0.5} color="#adb5bd" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#e74c3c" />
        </View>
      )}
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, opacity: loading ? 0 : 1 }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
