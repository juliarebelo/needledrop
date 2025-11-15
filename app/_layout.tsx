import { Feather } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '../constants/theme';
import { CustomDrawerContent } from './components/CustomDrawerContent';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerPosition: 'left',
          drawerActiveBackgroundColor: theme.colors.primary,
          drawerActiveTintColor: theme.colors.text,
          drawerInactiveTintColor: theme.colors.textSecondary,
          drawerStyle: {
            backgroundColor: theme.colors.background,
            width: 280,
          },
          drawerLabelStyle: {
            fontSize: theme.fontSizes.md,
            fontWeight: '500',
          },
        }}
      >
        <Drawer.Screen 
          name="(tabs)" 
          options={{ 
            title: 'Início',
            drawerLabel: 'Início',
            drawerIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            )
          }} 
        />
        <Drawer.Screen 
          name="mapa_lojas" 
          options={{ 
            title: 'Lojas de Disco',
            drawerLabel: 'Lojas de Disco',
            drawerIcon: ({ color, size }) => (
              <Feather name="map-pin" size={size} color={color} />
            )
          }} 
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}