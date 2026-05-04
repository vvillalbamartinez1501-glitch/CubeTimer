import React, { useMemo, useCallback } from 'react';
import { SectionList, Text, View, StyleSheet, useColorScheme, useWindowDimensions } from 'react-native';
import { CFOPCase } from '../../data/cfopFull';
import { CFOPCard } from './CFOPCard';

interface CFOPListProps {
  data: CFOPCase[];
  type: string;
}

export const CFOPList = ({ data, type }: CFOPListProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  // Determine number of columns based on screen width
  const numColumns = width > 600 ? 3 : 2;
  
  // Calculate card width taking into account padding and gaps
  const paddingHorizontal = 16;
  const gap = 12;
  const availableWidth = width - (paddingHorizontal * 2) - (gap * (numColumns - 1));
  const cardWidth = availableWidth / numColumns;

  // Group data by 'group' property and then chunk into rows
  const sections = useMemo(() => {
    const groupedData: { [key: string]: CFOPCase[] } = {};
    data.forEach((item) => {
      if (!groupedData[item.group]) {
        groupedData[item.group] = [];
      }
      groupedData[item.group].push(item);
    });

    return Object.keys(groupedData).map((groupName) => {
      const groupItems = groupedData[groupName];
      const chunkedRows: CFOPCase[][] = [];
      
      for (let i = 0; i < groupItems.length; i += numColumns) {
        chunkedRows.push(groupItems.slice(i, i + numColumns));
      }

      return {
        title: groupName,
        data: chunkedRows,
      };
    });
  }, [data, numColumns]);

  const renderRow = useCallback(({ item: row }: { item: CFOPCase[] }) => (
    <View style={styles.row}>
      {row.map((item) => (
        <CFOPCard key={item.id} item={item} type={type} cardWidth={cardWidth} />
      ))}
      {/* Add empty placeholder views to keep layout aligned if row is not full */}
      {Array.from({ length: numColumns - row.length }).map((_, i) => (
        <View key={`empty-${i}`} style={{ width: cardWidth }} />
      ))}
    </View>
  ), [cardWidth, numColumns, type]);

  const renderSectionHeader = useCallback(({ section: { title } }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{title}</Text>
    </View>
  ), [isDark]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => `row-${index}`}
      renderItem={renderRow}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      initialNumToRender={5}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews={true}
      stickySectionHeadersEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    paddingVertical: 8,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionHeaderDark: {
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    letterSpacing: 0.5,
  },
  sectionTitleDark: {
    color: '#ced4da',
  },
});
