import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle, Platform, Image, Text } from 'react-native';
import { CubeAssets } from '../../data/imageIndex';
import { useHydratedStore } from '../../hooks/useHydratedStore';

interface AlgorithmImageProps {
  imageKey: string; // ej: "resolution.3x3.full_fridrich.oll1"
  size?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * Universal Algorithm Image Component
 * Handles SVG rendering across Web and Native with a robust fallback system.
 */
export const AlgorithmImage = React.memo(({ imageKey, size = 100, color, style }: AlgorithmImageProps) => {
  const isHydrated = useHydratedStore();

  const asset = useMemo(() => {
    if (!imageKey) return null;
    const parts = imageKey.split('.');
    let current: any = CubeAssets;
    
    try {
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return null;
        }
      }
      return current;
    } catch (e) {
      return null;
    }
  }, [imageKey]);

  // Contenedor base para mantener el layout
  const containerStyle = [
    { width: size, height: size, aspectRatio: 1 as const },
    style
  ];

  // 1. Fallback de Hidratación: Evita parpadeos y errores de servidor en Web
  if (!isHydrated) {
    return <View style={containerStyle} />;
  }

  // 2. Placeholder Visual: Si el activo no existe o es nulo
  if (!asset) {
    return (
      <View style={[styles.placeholder, containerStyle]}>
        <View style={styles.placeholderInner} />
        {/* Opcional: Debug tag en desarrollo */}
        {__DEV__ && <Text style={styles.debugText}>Empty</Text>}
      </View>
    );
  }

  // 3. Renderizado Inteligente
  
  // Caso A: El activo es un componente funcional (Native SVG Transformer)
  if (typeof asset === 'function') {
    const SvgComponent = asset;
    return (
      <View style={containerStyle}>
        <SvgComponent 
          width={size} 
          height={size} 
          fill={color || '#000'} 
          viewBox="0 0 100 100" // Asegura escalado proporcional
        />
      </View>
    );
  }

  // Caso B: El activo es una referencia estática (Web require -> string o number ID)
  // En Web, a menudo el require devuelve la ruta del archivo.
  const isWeb = Platform.OS === 'web';
  const source = typeof asset === 'string' ? { uri: asset } : asset;

  return (
    <View style={containerStyle}>
      <Image 
        source={source} 
        style={styles.imageFull}
        resizeMode="contain"
        // En Web, forzamos dimensiones explícitas en el DOM
        {...(isWeb ? { width: size, height: size } : {})}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  imageFull: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  placeholderInner: {
    width: '40%',
    height: '40%',
    backgroundColor: '#adb5bd',
    borderRadius: 8,
    opacity: 0.2,
  },
  debugText: {
    fontSize: 8,
    color: '#ced4da',
    position: 'absolute',
    bottom: 4,
  }
});
