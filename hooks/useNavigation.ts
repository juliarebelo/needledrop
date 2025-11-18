import { useRouter, useSegments } from 'expo-router';

export const useAppNavigation = () => {
  const router = useRouter();
  const segments = useSegments();

  const goBack = () => {
    // Se estiver em uma tela de tabs, volta para homepage
    if (segments.includes('(tabs)')) {
      router.push('/(tabs)/homepage');
    } else {
      // Para outras telas, vai para homepage também
      router.push('/(tabs)/homepage');
    }
  };

  return { goBack, router };
};
