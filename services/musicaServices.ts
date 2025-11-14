import { supabase } from '../lib/supabase';

interface Album {
  id: string;
  titulo: string;
  artista: string;
  ano_lancamento: string;
  foto_capa?: string;
}

export const MusicaService = {
  async buscarTodasMusicas() {
    try {
      const { data, error } = await supabase
        .from('musicas')
        .select('*')
        .limit(100);

      if (error) {
        console.error('❌ Erro ao buscar músicas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro geral:', error);
      return [];
    }
  },

  async buscarAlbunsDasMusicas(): Promise<Album[]> {
    try {
      const { data, error } = await supabase
        .from('musicas')
        .select('album, artist, url_capa')
        .not('album', 'is', null);

      if (error) throw error;

      const albunsUnicos: Album[] = [];
      const albunsVistos = new Set<string>();

      data?.forEach(musica => {
        const chave = `${musica.album}-${musica.artist}`;
        
        if (!albunsVistos.has(chave)) {
          albunsVistos.add(chave);
          albunsUnicos.push({
            id: chave,
            titulo: musica.album || 'Álbum Desconhecido',
            artista: musica.artist || 'Artista Desconhecido',
            ano_lancamento: '2020',
            foto_capa: musica.url_capa || undefined
          });
        }
      });

      console.log(`✅ ${albunsUnicos.length} álbuns únicos carregados`);
      return albunsUnicos;
    } catch (error) {
      console.error('❌ Erro ao buscar álbuns:', error);
      return [];
    }
  },

  async buscarAlbuns(): Promise<Album[]> {
    try {
      return await this.buscarAlbunsDasMusicas();
    } catch (error) {
      console.error('❌ Erro em buscarAlbuns:', error);
      return [];
    }
  }
};