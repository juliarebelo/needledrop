import { supabase } from '../lib/supabase';

export const AvaliacaoService = {
  async salvarAvaliacao(avaliacao: {
    usuario_id: string;
    album_id: string; // ✅ DEVE SER string
    nota: number;
    comentario?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .insert([
          {
            ...avaliacao,
            data: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar avaliação:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro em salvarAvaliacao:', error);
      throw error;
    }
  }
};