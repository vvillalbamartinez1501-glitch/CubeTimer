import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme, Platform } from 'react-native';
import { AlgorithmImage } from './AlgorithmImage';

import { res2x2Data } from '../../data/learning/res2x2Data';
import { res3x3Data } from '../../data/learning/res3x3Data';
import { res4x4Data } from '../../data/learning/res4x4Data';

export function ResolutionGuide({ cubeSize, method }: { cubeSize: string, method: string }) {
  const isDark = useColorScheme() === 'dark';
  
  const getDataSource = () => {
    switch(cubeSize) {
      case '2x2': return res2x2Data[method] || [];
      case '3x3': return res3x3Data[method] || [];
      case '4x4': return res4x4Data[method] || [];
      default: return [];
    }
  };

  const data = getDataSource();

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <AlgorithmImage imageKey={item.imagePath} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.label, isDark && styles.labelDark]} numberOfLines={1}>{item.name}</Text>
        {item.algorithm && (
          <Text style={[styles.algorithm, isDark && styles.textDark]} numberOfLines={2}>{item.algorithm}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
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
    gap: 12,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
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
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  info: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  labelDark: {
    color: '#f8f9fa',
  },
  algorithm: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
    color: '#495057',
  },
  textDark: {
    color: '#adb5bd',
  }
});
