import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          display: 'none' // ⬅️ Isso esconde a tab bar nativa
        },
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="busca"
        options={{
          title: 'Busca',
          tabBarIcon: ({ color }) => <Feather name="search" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Feather name="user" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}