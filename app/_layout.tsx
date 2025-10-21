import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="senhas" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="album-review" />
        <Stack.Screen name="minhas-resenhas" />
        {/* Adicione outras screens aqui */}
      </Stack>
    </>
  );
}