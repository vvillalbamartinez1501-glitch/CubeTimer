import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { initDB } from '../../src/database/db';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDB();
        console.log('Database initialized successfully');
      } catch (e) {
        console.error("Error initializing DB:", e);
      }
    };
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
          title: t('tabs.timer'),
          tabBarIcon: ({ color }) => <Ionicons name="timer-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tabs.stats'),
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t('tabs.learn'),
          tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}