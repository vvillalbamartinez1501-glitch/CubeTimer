import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme, Platform } from 'react-native';
import { basicTutorials, TutorialStep } from '../../constants/learningData';

const CUBE_TABS = [
  { key: '3x3', label: '3x3' },
  { key: '2x2', label: '2x2' },
  { key: '4x4+', label: '4x4+' },
  { key: 'Megaminx', label: 'Megaminx' },
];

export const BasicTutorial = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeCube, setActiveCube] = useState('3x3');

  const steps: TutorialStep[] = basicTutorials[activeCube] || [];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subMenu} contentContainerStyle={styles.subMenuContent}>
        {CUBE_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={({ hovered, pressed }) => [
              styles.subTab, 
              activeCube === tab.key && styles.subTabActive,
              hovered && Platform.OS === 'web' && styles.subTabHovered,
              pressed && styles.subTabPressed,
            ]}
            onPress={() => setActiveCube(tab.key)}
          >
            <Text style={[styles.subTabText, activeCube === tab.key && styles.subTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {steps.map((step) => (
          <View key={step.step} style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{step.step}</Text>
            </View>
            <Text style={[styles.cardTitle, isDark && styles.textDark]}>{step.title}</Text>
            <Text style={[styles.cardDescription, isDark && styles.textMuted]}>{step.description}</Text>
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
    backgroundColor: '#007aff',
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
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#495057',
  },
  textDark: {
    color: '#f8f9fa',
  },
  textMuted: {
    color: '#adb5bd',
  },
});
