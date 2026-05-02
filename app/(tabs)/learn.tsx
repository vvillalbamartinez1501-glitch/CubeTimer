import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
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
      >
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.menuButton,
              isDark && styles.menuButtonDark,
              activeSection === section.key && styles.menuButtonActive,
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
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  menuContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
