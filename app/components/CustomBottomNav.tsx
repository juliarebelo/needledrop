
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const CustomBottomNav = () => {
  const router = useRouter(); 

  return (
    <View style={styles.navContainer}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/homepage')}>
        <Image source={require('../../assets/images/home.png')} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/busca')}>
        <Image source={require('../../assets/images/search.png')} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
        <Image source={require('../../assets/images/user.png')} style={styles.navIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2a0c0c',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
});

export default CustomBottomNav;