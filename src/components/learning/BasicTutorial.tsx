import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { basicTutorials, TutorialStep } from '../../constants/learningData';
import { beginnerSteps } from '../../data/beginnerMethod';

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

      {activeCube === '3x3' ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {beginnerSteps.map((step, index) => (
            <View key={step.id} style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.cardHeader}>
                <Text style={styles.stepNumber}>Paso {index + 1} de {beginnerSteps.length}</Text>
                <Text style={[styles.cardTitle, isDark && styles.textDark]}>{step.title}</Text>
              </View>

              <View style={[styles.imagePlaceholder, isDark && styles.imagePlaceholderDark]}>
                <Ionicons name={step.imagePlaceholder as any} size={48} color={isDark ? '#555' : '#ccc'} />
              </View>

              <Text style={[styles.cardDescription, isDark && styles.textMuted]}>{step.description}</Text>

              {step.algorithms && step.algorithms.length > 0 && (
                <View style={styles.algorithmsContainer}>
                  {step.algorithms.map((alg, algIndex) => (
                    <View key={algIndex} style={[styles.algorithmBox, isDark && styles.algorithmBoxDark]}>
                      <Text style={[styles.algorithmText, isDark && styles.algorithmTextDark]}>{alg}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
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
      )}
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  cardHeader: {
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007aff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212529',
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  imagePlaceholderDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
    marginBottom: 16,
  },
  algorithmsContainer: {
    gap: 8,
  },
  algorithmBox: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007aff',
  },
  algorithmBoxDark: {
    backgroundColor: '#2c2c2c',
    borderLeftColor: '#0a84ff',
  },
  algorithmText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 16,
    color: '#212529',
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  algorithmTextDark: {
    color: '#e9ecef',
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
  textDark: {
    color: '#f8f9fa',
  },
  textMuted: {
    color: '#adb5bd',
  },
});

