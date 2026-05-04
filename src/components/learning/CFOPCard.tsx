import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { CFOPCase } from '../../data/cfopFull';
import { useAppStore } from '../../store/useAppStore';
import { AlgorithmImage } from './AlgorithmImage';

interface CFOPCardProps {
  item: CFOPCase;
  type: string;
  cardWidth: number;
}

const CFOPCardComponent = ({ item, type, cardWidth }: CFOPCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { highlightedAlgs, toggleHighlight } = useAppStore();

  const isHighlighted = highlightedAlgs.includes(item.id);

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card, 
        { width: cardWidth },
        isDark && styles.cardDark,
        pressed && styles.cardPressed
      ]}
    >
      {/* Top Right: Star highlight button */}
      <Pressable
        style={styles.starButton}
        onPress={() => toggleHighlight(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.starIcon}>{isHighlighted ? '⭐' : '☆'}</Text>
      </Pressable>

      {/* Top: Image */}
      <View style={styles.imageContainer}>
        <AlgorithmImage alg={item.algorithm} type={type} size={cardWidth * 0.55} />
      </View>

      {/* Center: Case name */}
      <Text style={[styles.name, isDark && styles.textDark]} numberOfLines={1}>
        {item.name}
      </Text>

      {/* Bottom: Algorithm */}
      <Text style={[styles.algorithm, isDark && styles.algorithmDark]} numberOfLines={2}>
        {item.algorithm}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Android shadow
    position: 'relative',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    marginBottom: 8,
    marginTop: 4,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
    textAlign: 'center',
  },
  algorithm: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 16,
  },
  algorithmDark: {
    color: '#adb5bd',
  },
  starButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  starIcon: {
    fontSize: 18,
    color: '#f39c12',
  },
  textDark: {
    color: '#f8f9fa',
  },
});

export const CFOPCard = memo(CFOPCardComponent);
