import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme } from 'react-native';
import { AlgorithmImage } from './AlgorithmImage';

import { notationData } from '../../data/learning/notationData';

export function NotationGuide({ cubeSize }: { cubeSize: string }) {
  const isDark = useColorScheme() === 'dark';
  const numColumns = 4; // Recomendación de arquitectura: 4 columnas

  const data = notationData[cubeSize] || [];

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <AlgorithmImage imageKey={item.imagePath} style={styles.image} />
      <Text style={[styles.label, isDark && styles.labelDark]}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  row: {
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e1e2e',
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
  },
  labelDark: {
    color: '#f8f9fa',
  }
});
