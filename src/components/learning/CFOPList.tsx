import React, { useMemo, useCallback } from 'react';
import { SectionList, Text, View, StyleSheet, useColorScheme } from 'react-native';
import { CFOPCase } from '../../data/cfopFull';
import { CFOPCard } from './CFOPCard';

interface CFOPListProps {
  data: CFOPCase[];
}

export const CFOPList = ({ data }: CFOPListProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Group data by 'group' property
  const sections = useMemo(() => {
    const groupedData: { [key: string]: CFOPCase[] } = {};
    data.forEach((item) => {
      if (!groupedData[item.group]) {
        groupedData[item.group] = [];
      }
      groupedData[item.group].push(item);
    });

    return Object.keys(groupedData).map((groupName) => ({
      title: groupName,
      data: groupedData[groupName],
    }));
  }, [data]);

  // useCallback to keep reference stable for SectionList
  const renderItem = useCallback(({ item }: { item: CFOPCase }) => (
    <CFOPCard item={item} />
  ), []);

  const renderSectionHeader = useCallback(({ section: { title } }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{title}</Text>
    </View>
  ), [isDark]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      // Performance optimizations for large lists
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionHeaderDark: {
    backgroundColor: '#121212',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitleDark: {
    color: '#adb5bd',
  },
});
