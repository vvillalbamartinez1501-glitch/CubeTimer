import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle, Platform, Image } from 'react-native';
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
 * Optimized for React Native Web and Mobile SVG rendering.
 */
export const AlgorithmImage = React.memo(({ imageKey, size = 100, color, style }: AlgorithmImageProps) => {
  const isHydrated = useHydratedStore();

  const asset = useMemo(() => {
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
  // con las mismas dimensiones para evitar saltos visuales.
  if (!isHydrated) {
    return <View style={[{ width: size, height: size }, style]} />;
  }

  // Seguridad: Si el ID no existe, renderiza un placeholder elegante
  if (!asset) {
    return (
      <View style={[styles.placeholder, { width: size, height: size }, style]}>
        <View style={styles.placeholderInner} />
      </View>
    );
  }

  // Si el asset es un componente funcional (SVG detectado por el transformer)
  if (typeof asset === 'function') {
    const SvgComponent = asset;
    return (
      <View style={[{ width: size, height: size }, style]}>
        <SvgComponent 
          width={size} 
          height={size} 
          fill={color || '#000'} 
          viewBox="0 0 100 100" // Dimensionamiento explícito para evitar 0x0 en web
        />
      </View>
    );
  }

  // Manejo de assets que regresan como string (URLs) o objetos de require en Web
  const source = typeof asset === 'string' ? { uri: asset } : asset;

  return (
    <Image 
      source={source} 
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
