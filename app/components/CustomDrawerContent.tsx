import { Feather } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../constants/theme';
import { supabase } from '../../services/supabase';

export const CustomDrawerContent = (props: any) => {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/login');
            } catch (error) {
              console.error('Erro ao sair:', error);
              Alert.alert('Erro', 'Não foi possível sair da conta');
            }
          }
        }
      ]
    );
  };

  const navigateTo = (path: Parameters<ReturnType<typeof useRouter>['push']>[0]) => {
    try {
      props?.navigation?.closeDrawer?.();
    } catch {}
    router.push(path);
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        <View style={styles.drawerHeader}>
          <Feather name="music" size={40} color={theme.colors.primary} />
          <Text style={styles.drawerTitle}>NeedleDrop</Text>
        </View>

        <View style={styles.drawerLinks}>
          <TouchableOpacity
            style={styles.drawerLink}
            onPress={() => navigateTo('/(tabs)/homepage')}
          >
            <Feather name="home" size={24} color={theme.colors.text} />
            <Text style={styles.drawerLinkText}>Homepage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerLink}
            onPress={() => navigateTo('/mapa_lojas')}
          >
            <Feather name="map-pin" size={24} color={theme.colors.text} />
            <Text style={styles.drawerLinkText}>Mapa de Lojas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerLink}
            onPress={() => navigateTo('/(tabs)/perfil')}
          >
            <Feather name="user" size={24} color={theme.colors.text} />
            <Text style={styles.drawerLinkText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerLink}
            onPress={() => navigateTo('/(tabs)/busca')}
          >
            <Feather name="search" size={24} color={theme.colors.text} />
            <Text style={styles.drawerLinkText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      <View style={styles.drawerFooter}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={24} color={theme.colors.primary} />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  drawerContent: {
    paddingTop: 20,
  },
  drawerHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 20,
  },
  drawerTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    marginTop: 10,
  },
  drawerLinks: {
    paddingHorizontal: 10,
  },
  drawerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  drawerLinkText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    marginLeft: 15,
    fontWeight: '500',
  },
  drawerFooter: {
    paddingHorizontal: 10,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginTop: 10,
  },
  logoutButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.lg,
    marginLeft: 15,
    fontWeight: '600',
  },
});