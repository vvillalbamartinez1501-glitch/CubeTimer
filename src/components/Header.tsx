import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, useColorScheme, Modal, TextInput, FlatList, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router'; // Added import
import { CategorySelector } from './CategorySelector';
import { useAppStore } from '../store/useAppStore';

interface HeaderProps {
  titleKey: string;
}

export const Header: React.FC<HeaderProps> = ({ titleKey }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter(); // Added hook
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { 
    sessions, activeSessionId, activeCategoryId,
    createSession, renameSession, deleteSession, setActiveSession 
  } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions.find(s => s.categoryId === activeCategoryId);
  const categorySessions = sessions.filter(s => s.categoryId === activeCategoryId);

  let displaySessionName = currentSession?.name || 'Sesión 1';
  if (activeSessionId === 'ALL_SESSIONS') {
    displaySessionName = 'Todas las sesiones';
  }

  const handleCreate = () => {
    if (!newSessionName.trim()) return;
    createSession(newSessionName.trim());
    setNewSessionName('');
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    renameSession(id, editName.trim());
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (categorySessions.length <= 1) {
      Alert.alert('Error', 'No puedes eliminar la última sesión de esta categoría.');
      return;
    }
    Alert.alert(
      'Eliminar sesión',
      '¿Estás seguro? Todos los tiempos de esta sesión se ocultarán del historial actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteSession(id) }
      ]
    );
  };

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }, isMobile && { flexWrap: 'wrap', justifyContent: 'space-between' }]}>
      {/* Izquierda: Logo, App Name y Tab Name */}
      <View style={styles.headerLeft}>
        <View style={styles.logoTitleGroup}>
          <Ionicons name="cube-outline" size={28} color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>CubeTimer</Text>
        </View>
        <View style={styles.tabNameBadge}>
          <Text style={[styles.tabNameText, isDark && styles.textDark]}>
            {t(titleKey) || 'Timer'}
          </Text>
        </View>
      </View>

      {/* Centro: Selectores (Desktop) */}
      {!isMobile && (
        <View style={styles.headerCenter}>
          <Pressable 
            style={[styles.sessionPill, isDark && styles.sessionPillDark]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.sessionPillText, isDark && styles.textDark]}>
              {displaySessionName}
            </Text>
            <Ionicons name="chevron-down" size={14} color={isDark ? '#aaa' : '#666'} />
          </Pressable>
          <View style={{ zIndex: 100 }}>
            <CategorySelector />
          </View>
        </View>
      )}

      {/* Derecha: Iconos */}
      <View style={styles.headerRight}>
        <Pressable style={styles.iconButton} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-outline" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
      </View>

      {/* Centro: Selectores (Mobile) */}
      {isMobile && (
        <View style={[styles.headerCenter, { width: '100%', justifyContent: 'center', marginTop: 15 }]}>
          <Pressable 
            style={[styles.sessionPill, isDark && styles.sessionPillDark]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.sessionPillText, isDark && styles.textDark]}>
              {displaySessionName}
            </Text>
            <Ionicons name="chevron-down" size={14} color={isDark ? '#aaa' : '#666'} />
          </Pressable>
          <View style={{ zIndex: 100 }}>
            <CategorySelector />
          </View>
        </View>
      )}
    </View>

      {/* Modal de Sesiones */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable 
            style={[styles.modalContent, isDark && styles.modalContentDark]}
            onPress={() => {}} // Intercepta el toque para que no se cierre
          >
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>Gestionar Sesiones ({activeCategoryId})</Text>
            
            <Pressable 
              style={[styles.sessionItem, styles.allSessionsItem]} 
              onPress={() => { setActiveSession('ALL_SESSIONS'); setModalVisible(false); }}
            >
              <View style={styles.sessionSelect}>
                <Text style={[
                  styles.sessionName, 
                  isDark && styles.textDark,
                  activeSessionId === 'ALL_SESSIONS' && styles.activeSessionText
                ]}>
                  Todas las sesiones
                </Text>
              </View>
              <Ionicons name="layers-outline" size={18} color={activeSessionId === 'ALL_SESSIONS' ? '#007aff' : (isDark ? '#fff' : '#000')} />
            </Pressable>

            <FlatList
              data={categorySessions}
              keyExtractor={item => item.id}
              style={{ maxHeight: 300, width: '100%' }}
              renderItem={({ item }) => (
                <View style={styles.sessionItem}>
                  {editingId === item.id ? (
                    <TextInput
                      style={[styles.editInput, isDark && styles.textDark]}
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                      onBlur={() => handleRename(item.id)}
                      onSubmitEditing={() => handleRename(item.id)}
                    />
                  ) : (
                    <Pressable 
                      style={styles.sessionSelect} 
                      onPress={() => { setActiveSession(item.id); setModalVisible(false); }}
                    >
                      <Text style={[
                        styles.sessionName, 
                        isDark && styles.textDark,
                        activeSessionId === item.id && styles.activeSessionText
                      ]}>
                        {item.name}
                      </Text>
                    </Pressable>
                  )}
                  
                  <View style={styles.sessionActions}>
                    <Pressable onPress={() => { setEditingId(item.id); setEditName(item.name); }}>
                      <Ionicons name="pencil-outline" size={18} color="#007aff" />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#ff3b30" />
                    </Pressable>
                  </View>
                </View>
              )}
            />

            <View style={styles.addSessionRow}>
              <TextInput
                style={[styles.addInput, isDark && styles.addInputDark, isDark && styles.textDark]}
                placeholder="Nueva Sesión..."
                placeholderTextColor="#999"
                value={newSessionName}
                onChangeText={setNewSessionName}
              />
              <Pressable style={styles.addButton} onPress={handleCreate}>
                <Ionicons name="add" size={24} color="#fff" />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabNameBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#007aff',
  },
  tabNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  sessionPillDark: {
    backgroundColor: '#343a40',
  },
  sessionPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 4,
  },
  textDark: {
    color: '#f8f9fa',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalContentDark: {
    backgroundColor: '#1e1e2e',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    width: '100%',
  },
  allSessionsItem: {
    backgroundColor: 'rgba(0,122,255,0.05)',
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
    borderBottomWidth: 0,
  },
  sessionSelect: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeSessionText: {
    color: '#007aff',
    fontWeight: '800',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    fontWeight: '600',
  },
  addSessionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
    width: '100%',
  },
  addInput: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
  },
  addInputDark: {
    backgroundColor: '#2a2a3e',
  },
  addButton: {
    backgroundColor: '#007aff',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
