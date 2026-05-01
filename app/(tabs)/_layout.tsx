import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { initDB } from '../../src/database/db';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Declaramos una función asíncrona dentro del useEffect
    const setupDatabase = async () => {
      try {
        await initDB();
        console.log('Database initialized successfully');
      } catch (e) {
        console.error("Error initializing DB:", e);
      }
    };

    // La ejecutamos
    setupDatabase();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#4dabf7' : '#007aff',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => <Ionicons name="timer-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}