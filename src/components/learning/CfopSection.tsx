import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme, Platform } from 'react-native';
import { f2lCases, ollCases, pllCases } from '../../data/cfopFull';
import { CFOPList } from './CFOPList';

type Phase = 'F2L' | 'OLL' | 'PLL';

const CFOP_TABS: { key: Phase; label: string }[] = [
  { key: 'F2L', label: 'F2L' },
  { key: 'OLL', label: 'OLL' },
  { key: 'PLL', label: 'PLL' },
];

export const CfopSection = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activePhase, setActivePhase] = useState<Phase>('F2L');

  const activeData = useMemo(() => {
    switch (activePhase) {
      case 'F2L': return f2lCases;
      case 'OLL': return ollCases;
      case 'PLL': return pllCases;
      default: return f2lCases;
    }
  }, [activePhase]);

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

      <View style={styles.listContainer}>
        <CFOPList data={activeData} />
      </View>
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
  listContainer: {
    flex: 1,
  },
});
