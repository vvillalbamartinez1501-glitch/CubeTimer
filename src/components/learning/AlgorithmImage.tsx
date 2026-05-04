import React from 'react';
import { Image, ImageStyle, StyleSheet, View } from 'react-native';
import { CubeImages } from '../../data/imageIndex';

interface AlgorithmImageProps {
  imageKey: string; // ej: "notation.3x3.R"
  style?: ImageStyle;
}

export function AlgorithmImage({ imageKey, style }: AlgorithmImageProps) {
  const parts = imageKey.split('.');
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
