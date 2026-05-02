import React from 'react';
import { StyleSheet, Text, View, ScrollView, useColorScheme } from 'react-native';
import { methodsGuide } from '../../constants/learningData';

export const MethodsGuide = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {methodsGuide.map((method, index) => (
        <View key={index} style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.headerRow}>
            <Text style={[styles.methodName, isDark && styles.textDark]}>{method.name}</Text>
            <Text style={styles.difficultyBadge}>{method.difficulty}</Text>
          </View>
          
          <View style={[styles.movesBox, isDark && styles.movesBoxDark]}>
            <Text style={styles.movesLabel}>Movimientos promedio:</Text>
            <Text style={[styles.movesValue, isDark && styles.textDark]}>{method.avgMoves}</Text>
          </View>

          <Text style={[styles.description, isDark && styles.textMuted]}>{method.description}</Text>

          <View style={styles.prosConsContainer}>
            <View style={styles.prosSection}>
              <Text style={styles.prosTitle}>✅ Ventajas</Text>
              {method.pros.map((pro, i) => (
                <Text key={i} style={[styles.bulletItem, isDark && styles.textMuted]}>• {pro}</Text>
              ))}
            </View>
            <View style={styles.consSection}>
              <Text style={styles.consTitle}>⚠️ Desventajas</Text>
              {method.cons.map((con, i) => (
                <Text key={i} style={[styles.bulletItem, isDark && styles.textMuted]}>• {con}</Text>
              ))}
            </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  methodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  difficultyBadge: {
    fontSize: 13,
    color: '#f39c12',
    fontWeight: '600',
  },
  movesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    gap: 6,
  },
  movesBoxDark: {
    backgroundColor: '#2c2c2c',
  },
  movesLabel: {
    fontSize: 13,
    color: '#868e96',
  },
  movesValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#495057',
    marginBottom: 12,
  },
  prosConsContainer: {
    gap: 10,
  },
  prosSection: {},
  consSection: {},
  prosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 4,
  },
  consTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 13,
    lineHeight: 20,
    color: '#495057',
    paddingLeft: 4,
  },
  textDark: {
    color: '#f8f9fa',
  },
  textMuted: {
    color: '#adb5bd',
  },
});
