import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { CubeAssets } from '../../data/imageIndex';
import { useHydratedStore } from '../../hooks/useHydratedStore';

interface AlgorithmImageProps {
  imageKey: string; // ej: "notation.2x2.L"
  size?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * Component to render algorithm images/SVGs with hydration safety.
 * Optimized for React Native Web to prevent hydration mismatches.
 */
export const AlgorithmImage = React.memo(({ imageKey, size = 100, color, style }: AlgorithmImageProps) => {
  const isHydrated = useHydratedStore();

  const Asset = useMemo(() => {
    if (!imageKey) return null;
    const parts = imageKey.split('.');
    let current: any = CubeAssets;
    
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }
    return current;
  }, [imageKey]);

  // Fallback de Hidratación: Mientras no esté hidratado, devuelve un contenedor vacío 
  // con las mismas dimensiones para evitar saltos visuales (Layout Shift).
  if (!isHydrated) {
    return <View style={[{ width: size, height: size }, style]} />;
  }

  // Seguridad: Si el ID no existe, renderiza un placeholder elegante
  if (!Asset) {
    return (
      <View style={[styles.placeholder, { width: size, height: size }, style]}>
        <View style={styles.placeholderInner} />
      </View>
    );
  }

  // Si el asset es un componente funcional (SVG)
  if (typeof Asset === 'function') {
    const SvgComponent = Asset;
    return (
      <View style={[{ width: size, height: size }, style]}>
        <SvgComponent 
          width={size} 
          height={size} 
          fill={color || '#000'} 
        />
      </View>
    );
  }

  // Fallback para imágenes tradicionales (require)
  const { Image } = require('react-native');
  return (
    <Image 
      source={Asset} 
      style={[{ width: size, height: size }, style]} 
      resizeMode="contain" 
    />
  );
});

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderInner: {
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  }
});
