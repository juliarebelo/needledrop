import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Use sem Database types por enquanto
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUserId = async (): Promise<string> => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Erro ao buscar usuário:', error.message);
    throw new Error('Usuário não autenticado');
  }

  if (!user) {
    throw new Error('Nenhum usuário logado encontrado.');
  }

  return user.id;
};