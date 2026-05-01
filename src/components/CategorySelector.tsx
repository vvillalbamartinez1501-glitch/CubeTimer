import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, FlatList, TextInput, useColorScheme, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { CATEGORIES, Category } from '../constants/categories';
import { useAppStore } from '../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';

export const CategorySelector = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
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
    <TouchableOpacity 
      style={[styles.item, activeCategoryId === item.id && styles.itemSelected, isDark && styles.itemDark]} 
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.itemText, isDark && styles.textDark, activeCategoryId === item.id && styles.textSelected]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.selectorButton, isDark && styles.selectorButtonDark]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, isDark && styles.textDark]}>
          {currentName}
        </Text>
        <Ionicons name="chevron-down" size={20} color={isDark ? '#fff' : '#000'} />
      </TouchableOpacity>

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
                Selecciona tu Cubo
              </Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setShowCustomInput(false); }}>
                <Ionicons name="close" size={28} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            {showCustomInput ? (
              <View style={styles.customContainer}>
                <Text style={[styles.customLabel, isDark && styles.textDark]}>
                  Nombre de categoría personalizada:
                </Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Ej. Cuboide 3x3x5"
                  placeholderTextColor={isDark ? "#888" : "#ccc"}
                  value={tempCustomName}
                  onChangeText={setTempCustomName}
                  autoFocus
                />
                <TouchableOpacity style={styles.confirmButton} onPress={confirmCustom}>
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
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
    marginBottom: 10,
    zIndex: 10,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  selectorButtonDark: {
    backgroundColor: '#343a40',
  },
  selectorText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
