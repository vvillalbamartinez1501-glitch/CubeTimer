import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { CFOPCase } from '../../data/cfopFull';
import { useAppStore } from '../../store/useAppStore';

interface CFOPCardProps {
  item: CFOPCase;
}

const CFOPCardComponent = ({ item }: CFOPCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { highlightedAlgs, toggleHighlight } = useAppStore();

  const isHighlighted = highlightedAlgs.includes(item.id);

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      {/* Left: Square placeholder for cube */}
      <View style={[styles.placeholder, isDark && styles.placeholderDark]}>
        <Text style={[styles.placeholderText, isDark && styles.textDark]}>3x3</Text>
      </View>

      {/* Center: Case name and algorithm */}
      <View style={styles.content}>
        <Text style={[styles.name, isDark && styles.textDark]}>{item.name}</Text>
        <View style={[styles.algBox, isDark && styles.algBoxDark]}>
          <Text style={styles.algorithm} numberOfLines={2}>
            {item.algorithm}
          </Text>
        </View>
      </View>

      {/* Right: Star highlight button */}
      <Pressable
        style={({ pressed }) => [
          styles.starButton,
          pressed && styles.starButtonPressed
        ]}
        onPress={() => toggleHighlight(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.starIcon}>{isHighlighted ? '⭐' : '☆'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  placeholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderDark: {
    backgroundColor: '#2c2c2c',
  },
  placeholderText: {
    fontSize: 12,
    color: '#adb5bd',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 6,
  },
  algBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  algBoxDark: {
    backgroundColor: '#252525',
  },
  algorithm: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  starButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButtonPressed: {
    opacity: 0.5,
  },
  starIcon: {
    fontSize: 22,
    color: '#f39c12',
  },
  textDark: {
    color: '#f8f9fa',
  },
});

// React.memo to prevent unnecessary re-renders when other cards are highlighted
export const CFOPCard = memo(CFOPCardComponent);
