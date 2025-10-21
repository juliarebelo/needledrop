import { supabase } from '../lib/supabase';

export const MusicaService = {
  async buscarTodasMusicas() {
    try {
      const { data, error } = await supabase
        .from('musicas')
        .select('*')
        .limit(50);

      if (error) {
        console.error('❌ Erro ao buscar músicas:', error);
        return [];
      }

      console.log(`✅ ${data?.length} músicas carregadas`);
      return data || [];
    } catch (error) {
      console.error('❌ Erro geral:', error);
      return [];
    }
  },

  async buscarPorArtista(artista: string) {
    const { data, error } = await supabase
      .from('musicas')
      .select('*')
      .ilike('artist', `%${artista}%`);

    if (error) throw error;
    return data;
  },

  async buscarPorAlbum(album: string) {
    const { data, error } = await supabase
      .from('musicas')
      .select('*')
      .ilike('album', `%${album}%`);

    if (error) throw error;
    return data;
  }
};