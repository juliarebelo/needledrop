import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CustomBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.navContainer}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/(tabs)/homepage')}
      >
        <Feather 
          name="home" 
          size={24} 
          color={pathname === '/(tabs)/homepage' ? '#8b0000' : '#999'} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/(tabs)/busca')}
      >
        <Feather 
          name="search" 
          size={24} 
          color={pathname === '/(tabs)/busca' ? '#8b0000' : '#999'} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/(tabs)/perfil')}
      >
        <Feather 
          name="user" 
          size={24} 
          color={pathname === '/(tabs)/perfil' ? '#8b0000' : '#999'} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5e5',
  },
  navItem: {
    padding: 10,
  },
});