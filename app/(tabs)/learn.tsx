import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BasicTutorial } from '../../src/components/learning/BasicTutorial';
import { CfopSection } from '../../src/components/learning/CfopSection';
import { MethodsGuide } from '../../src/components/learning/MethodsGuide';
import { AdvancedTips } from '../../src/components/learning/AdvancedTips';

type Section = 'basic' | 'cfop' | 'methods' | 'advanced';

const SECTIONS: { key: Section; i18nKey: string; emoji: string }[] = [
  { key: 'basic', i18nKey: 'learn.basic', emoji: '📖' },
  { key: 'cfop', i18nKey: 'learn.cfop', emoji: '⚡' },
  { key: 'methods', i18nKey: 'learn.methods', emoji: '🧩' },
  { key: 'advanced', i18nKey: 'learn.advanced', emoji: '🚀' },
];

export default function LearnScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<Section>('basic');

  const renderSection = () => {
    switch (activeSection) {
      case 'basic': return <BasicTutorial />;
      case 'cfop': return <CfopSection />;
      case 'methods': return <MethodsGuide />;
      case 'advanced': return <AdvancedTips />;
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.menuContent}
        style={styles.menuBar}
        bounces={false}
      >
        {SECTIONS.map((section) => (
          <Pressable
            key={section.key}
            style={({ hovered, pressed }) => [
              styles.menuButton,
              isDark && styles.menuButtonDark,
              activeSection === section.key && styles.menuButtonActive,
              hovered && Platform.OS === 'web' && styles.menuButtonHover,
              pressed && styles.menuButtonPressed,
            ]}
            onPress={() => setActiveSection(section.key)}
          >
            <Text style={styles.menuEmoji}>{section.emoji}</Text>
            <Text style={[
              styles.menuLabel,
              isDark && styles.menuLabelDark,
              activeSection === section.key && styles.menuLabelActive,
            ]}>
              {t(section.i18nKey)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionContent}>
        {renderSection()}
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
  menuBar: {
    flexGrow: 0,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  menuContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    gap: 6,
  },
  menuButtonDark: {
    backgroundColor: '#2c2c2c',
  },
  menuButtonActive: {
    backgroundColor: '#007aff',
  },
  menuButtonHover: {
    backgroundColor: '#dee2e6',
    transform: [{ scale: 1.03 }],
  },
  menuButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  menuEmoji: {
    fontSize: 16,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
  },
  menuLabelDark: {
    color: '#adb5bd',
  },
  menuLabelActive: {
    color: '#fff',
  },
  sectionContent: {
    flex: 1,
  },
});
