import React from 'react';
import { Image, ImageStyle, StyleSheet, View } from 'react-native';
import { CubeImages } from '../../data/imageIndex';

interface AlgorithmImageProps {
  path: string; // ej: "resolution.3x3.full_fridrich.oll1"
  style?: ImageStyle;
}

export function AlgorithmImage({ path, style }: AlgorithmImageProps) {
  const parts = path.split('.');
  let current: any = CubeImages;
  
  for (const part of parts) {
    if (current && current[part]) {
      current = current[part];
    } else {
      current = null;
      break;
    }
  }

  if (!current) {
    return <View style={[styles.placeholder, style]} />;
  }

  return (
    <Image source={current} style={[styles.image, style]} resizeMode="contain" />
  );
}

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  },
  placeholder: {
    width: 100,
    height: 100,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  }
});
