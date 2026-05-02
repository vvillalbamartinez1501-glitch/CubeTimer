import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme, Platform } from 'react-native';
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subMenu} contentContainerStyle={styles.subMenuContent}>
        {CFOP_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={({ hovered, pressed }) => [
              styles.subTab, 
              activePhase === tab.key && styles.subTabActive,
              hovered && Platform.OS === 'web' && styles.subTabHovered,
              pressed && styles.subTabPressed,
            ]}
            onPress={() => setActivePhase(tab.key)}
          >
            <Text style={[styles.subTabText, activePhase === tab.key && styles.subTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 4,
  },
  subMenuContent: {
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  subTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabActive: {
    backgroundColor: '#e74c3c',
  },
  subTabHovered: {
    backgroundColor: '#dee2e6',
    transform: [{ scale: 1.05 }],
  },
  subTabPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
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
