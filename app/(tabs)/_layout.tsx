import { Tabs } from 'expo-router';

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
    </Tabs>
  );
}