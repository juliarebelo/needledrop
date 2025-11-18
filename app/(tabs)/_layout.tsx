import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen name="homepage" />
      <Tabs.Screen name="busca" />
      <Tabs.Screen name="perfil" />
      
      <Tabs.Screen
        name="minhas-resenhas"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="Playlist/[id]"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
        name="Playlist/metas"
        options={{
          href: null,
        }}
      />
      
    </Tabs>
  );
}