import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { cfopAlgs, AlgorithmCase } from '../../constants/learningData';

const CFOP_TABS = [
  { key: 'Cross', label: 'Cross' },
  { key: 'F2L', label: 'F2L' },
  { key: 'OLL', label: 'OLL' },
  { key: 'PLL', label: 'PLL' },
];

export const CfopSection = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activePhase, setActivePhase] = useState('Cross');

  const cases: AlgorithmCase[] = cfopAlgs[activePhase] || [];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subMenu}>
        {CFOP_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.subTab, activePhase === tab.key && styles.subTabActive]}
            onPress={() => setActivePhase(tab.key)}
          >
            <Text style={[styles.subTabText, activePhase === tab.key && styles.subTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {cases.map((item, index) => (
          <View key={index} style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.caseName, isDark && styles.textDark]}>{item.name}</Text>
            {item.algorithm !== '—' && (
              <View style={[styles.algBox, isDark && styles.algBoxDark]}>
                <Text style={styles.algText}>{item.algorithm}</Text>
              </View>
            )}
            {item.description && (
              <Text style={[styles.description, isDark && styles.textMuted]}>{item.description}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subMenu: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
  },
  subTabActive: {
    backgroundColor: '#e74c3c',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  subTabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  caseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  algBox: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  algBoxDark: {
    backgroundColor: '#2c2c2c',
  },
  algText: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e74c3c',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6c757d',
  },
  textDark: {
    color: '#f8f9fa',
  },
  textMuted: {
    color: '#adb5bd',
  },
});
