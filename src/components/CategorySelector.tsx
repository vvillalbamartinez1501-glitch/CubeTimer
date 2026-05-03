import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, FlatList, TextInput, useColorScheme, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, Category } from '../constants/categories';
import { useAppStore } from '../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';

export const CategorySelector = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  
  const { activeCategoryId, customCategoryName, setActiveCategory } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [tempCustomName, setTempCustomName] = useState('');

  // Encontrar el nombre a mostrar actualmente
  let currentName = CATEGORIES.find(c => c.id === activeCategoryId)?.name || '3x3';
  if (activeCategoryId === 'custom') {
    currentName = customCategoryName ? customCategoryName : 'Personalizado';
  }

  const handleSelect = (item: Category) => {
    if (item.id === 'custom') {
      setShowCustomInput(true);
    } else {
      setActiveCategory(item.id);
      setModalVisible(false);
    }
  };

  const confirmCustom = () => {
    if (tempCustomName.trim()) {
      setActiveCategory('custom', tempCustomName.trim());
      setShowCustomInput(false);
      setModalVisible(false);
      setTempCustomName('');
    }
  };

  const renderItem = ({ item }: { item: Category }) => (
    <Pressable 
      style={({ hovered, pressed }) => [
        styles.item, 
        activeCategoryId === item.id && styles.itemSelected, 
        isDark && styles.itemDark,
        hovered && Platform.OS === 'web' && styles.itemHovered,
        pressed && styles.itemPressed,
      ]} 
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.itemText, isDark && styles.textDark, activeCategoryId === item.id && styles.textSelected]}>
        {item.name}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Pressable 
        style={({ hovered, pressed }) => [
          styles.selectorButton, 
          isDark && styles.selectorButtonDark,
          hovered && Platform.OS === 'web' && styles.selectorButtonHovered,
          pressed && styles.selectorButtonPressed,
        ]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, isDark && styles.textDark]}>
          {currentName}
        </Text>
        <Ionicons name="chevron-down" size={20} color={isDark ? '#fff' : '#000'} />
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setShowCustomInput(false);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>
                {t('categories.selectCube')}
              </Text>
              <Pressable 
                onPress={() => { setModalVisible(false); setShowCustomInput(false); }}
                style={({ hovered, pressed }) => [
                  hovered && Platform.OS === 'web' && { opacity: 0.7, transform: [{ scale: 1.1 }] },
                  pressed && { opacity: 0.5, transform: [{ scale: 0.9 }] }
                ]}
              >
                <Ionicons name="close" size={28} color={isDark ? '#fff' : '#000'} />
              </Pressable>
            </View>

            {showCustomInput ? (
              <View style={styles.customContainer}>
                <Text style={[styles.customLabel, isDark && styles.textDark]}>
                  {t('categories.customLabel')}
                </Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder={t('categories.customPlaceholder')}
                  placeholderTextColor={isDark ? "#888" : "#ccc"}
                  value={tempCustomName}
                  onChangeText={setTempCustomName}
                  autoFocus
                />
                <Pressable 
                  style={({ hovered, pressed }) => [
                    styles.confirmButton,
                    hovered && Platform.OS === 'web' && styles.confirmButtonHovered,
                    pressed && styles.confirmButtonPressed,
                  ]} 
                  onPress={confirmCustom}
                >
                  <Text style={styles.confirmButtonText}>{t('actions.confirm')}</Text>
                </Pressable>
              </View>
            ) : (
              <FlatList
                data={CATEGORIES}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    zIndex: 10,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  selectorButtonDark: {
    backgroundColor: '#343a40',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectorButtonHovered: {
    backgroundColor: '#dee2e6',
    transform: [{ scale: 1.05 }],
  },
  selectorButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    padding: 20,
  },
  modalContentDark: {
    backgroundColor: '#1e1e1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  itemDark: {
    borderBottomColor: '#444',
  },
  itemSelected: {
    backgroundColor: '#e6f2ff',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  textSelected: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  itemHovered: {
    backgroundColor: '#f1f3f5',
  },
  itemPressed: {
    opacity: 0.7,
  },
  customContainer: {
    flex: 1,
    paddingTop: 20,
  },
  customLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  inputDark: {
    borderColor: '#555',
    color: '#fff',
    backgroundColor: '#2c2c2c',
  },
  confirmButton: {
    backgroundColor: '#007aff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonHovered: {
    backgroundColor: '#0062cc',
    transform: [{ scale: 1.02 }],
  },
  confirmButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
