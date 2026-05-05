import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NotationGuide } from '../../src/components/learning/NotationGuide';
import { ResolutionGuide } from '../../src/components/learning/ResolutionGuide';
import { Header } from '../../src/components/Header';

type MainSection = 'notation' | 'resolution';

export default function LearnScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  
  const [activeMain, setActiveMain] = useState<MainSection>('notation');
  const [activeCube, setActiveCube] = useState<string>('3x3');
  const [activeMethod, setActiveMethod] = useState<string>('full_fridrich');

  const CUBES = ['2x2', '3x3', '4x4'];
  
  const METHODS: Record<string, {id: string, name: string}[]> = {
    '2x2': [
      { id: 'basic', name: 'Básico' },
      { id: 'advanced', name: 'Avanzado' }
    ],
    '3x3': [
      { id: 'beginner', name: 'Principiante' },
      { id: 'reduced_fridrich', name: 'Fridrich Reducido' },
      { id: 'full_fridrich', name: 'Fridrich Completo' }
    ],
    '4x4': [
      { id: 'yau', name: 'Método Yau / Reducción' }
    ]
  };

  const handleCubeChange = (cube: string) => {
    setActiveCube(cube);
    const firstMethod = METHODS[cube]?.[0]?.id;
    if (firstMethod) {
      setActiveMethod(firstMethod);
    }
  };

  const currentMethods = METHODS[activeCube] || [];

  const renderContent = () => {
    if (activeMain === 'notation') {
      return <NotationGuide cubeSize={activeCube} />;
    } else {
      return <ResolutionGuide cubeSize={activeCube} method={activeMethod} />;
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header titleKey="tabs.learn" />
      
      {/* 1. Categoría Principal (Notación / Resolución) */}
      <View style={[styles.segmentedContainer, isDark && styles.segmentedContainerDark]}>
        <Pressable 
          style={[styles.segment, activeMain === 'notation' && styles.segmentActive]}
          onPress={() => setActiveMain('notation')}
        >
          <Text style={[styles.segmentText, isDark && styles.textDark, activeMain === 'notation' && styles.segmentTextActive]}>
            Notación
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.segment, activeMain === 'resolution' && styles.segmentActive]}
          onPress={() => setActiveMain('resolution')}
        >
          <Text style={[styles.segmentText, isDark && styles.textDark, activeMain === 'resolution' && styles.segmentTextActive]}>
            Resolución
          </Text>
        </Pressable>
      </View>

      {/* 2. Selector de Cubo (2x2 | 3x3 | 4x4) */}
      <View style={styles.selectorWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabs} style={styles.subTabsContainer}>
          {CUBES.map(cube => (
            <Pressable 
              key={cube}
              style={[styles.subTab, activeCube === cube && styles.subTabActive, isDark && styles.subTabDark]}
              onPress={() => handleCubeChange(cube)}
            >
              <Text style={[styles.subTabText, isDark && styles.textDark, activeCube === cube && styles.subTabTextActive]}>{cube}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 3. Selector de Método (Solo para Resolución) */}
      {activeMain === 'resolution' && currentMethods.length > 0 && (
        <View style={styles.selectorWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabs} style={styles.subTabsContainer}>
            {currentMethods.map(method => (
              <Pressable 
                key={method.id}
                style={[styles.subTab, activeMethod === method.id && styles.subTabActive, isDark && styles.subTabDark]}
                onPress={() => setActiveMethod(method.id)}
              >
                <Text style={[styles.subTabText, isDark && styles.textDark, activeMethod === method.id && styles.subTabTextActive]}>{method.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.sectionContent}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    margin: 16,
    padding: 4,
    height: 48,
  },
  segmentedContainerDark: {
    backgroundColor: '#1e1e2e',
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#495057',
  },
  segmentTextActive: {
    color: '#007aff',
  },
  selectorWrapper: {
    marginBottom: 8,
  },
  subTabsContainer: {
    flexGrow: 0,
    minHeight: 40,
  },
  subTabs: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  subTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subTabDark: {
    backgroundColor: '#2c2c2c',
  },
  subTabActive: {
    backgroundColor: '#007aff22',
    borderColor: '#007aff',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  subTabTextActive: {
    color: '#007aff',
    fontWeight: '700',
  },
  textDark: {
    color: '#adb5bd',
  },
  sectionContent: {
    flex: 1,
  },
});
