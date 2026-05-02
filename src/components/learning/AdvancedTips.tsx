import React from 'react';
import { StyleSheet, Text, View, ScrollView, useColorScheme } from 'react-native';
import { advancedTips } from '../../constants/learningData';

export const AdvancedTips = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {advancedTips.map((tip, index) => (
        <View key={index} style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.tipTitle, isDark && styles.textDark]}>{tip.title}</Text>
          <Text style={[styles.tipDescription, isDark && styles.textMuted]}>{tip.description}</Text>
          
          <View style={[styles.tipsContainer, isDark && styles.tipsContainerDark]}>
            {tip.tips.map((t, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>💡</Text>
                <Text style={[styles.tipText, isDark && styles.textMuted]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#495057',
    marginBottom: 14,
  },
  tipsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  tipsContainerDark: {
    backgroundColor: '#2c2c2c',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 14,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#495057',
  },
  textDark: {
    color: '#f8f9fa',
  },
  textMuted: {
    color: '#adb5bd',
  },
});
