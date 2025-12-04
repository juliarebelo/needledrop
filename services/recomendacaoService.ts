import { Album } from '../app/_types/Album';
import { supabase } from '../lib/supabase';

export const RecomendacaoService = {
  async getRecomendacoes(userId?: string | null): Promise<Album[]> {
    try {
      let finalUserId: string | null = null;

      if (userId) {
        finalUserId = userId;
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        finalUserId = session?.user?.id || null;
      }
      
      if (finalUserId) {
        return await this.getRecomendacoesHibridas(finalUserId);
      } else {
        return await this.getRecomendacoesPopulares();
      }

    } catch (error) {
      console.error('Erro geral no serviço de recomendações:', error);
      return await this.getRecomendacoesPopulares();
    }
  },

  async getRecomendacoesHibridas(userId: string): Promise<Album[]> {
    try {
      // 1. Buscar últimas avaliações bem avaliadas do usuário
      const { data: avaliacoes, error: avaliacoesError } = await supabase
        .from('resenhas')
        .select('artist, rating, album_name')
        .eq('user_id', userId)
        .gte('rating', 3.5)
        .order('created_at', { ascending: false })
        .limit(10);

      if (avaliacoesError) {
        return await this.getRecomendacoesPopulares();
      }

      // 2. Extrair artistas favoritos
      const artistasFavoritos = [...new Set(avaliacoes?.map(a => a.artist) || [])].slice(0, 5);

      // 3. Buscar álbuns já avaliados para excluir
      const { data: albumsAvaliados } = await supabase
        .from('resenhas')
        .select('album_name, artist')
        .eq('user_id', userId);

      const albumsAvaliadosSet = new Set(
        (albumsAvaliados || []).map(a => `${a.album_name}-${a.artist}`)
      );

      // 4. Buscar álbuns dos artistas favoritos e populares em paralelo
      const [musicasArtistasResult, musicasPopularesResult] = await Promise.all([
        supabase
          .from('musicas')
          .select('id, album, artist, url_capa')
          .in('artist', artistasFavoritos.length > 0 ? artistasFavoritos : [''])
          .not('url_capa', 'is', null)
          .not('album', 'is', null)
          .order('stream', { ascending: false })
          .limit(30),
        supabase
          .from('musicas')
          .select('id, album, artist, url_capa')
          .not('url_capa', 'is', null)
          .not('album', 'is', null)
          .order('stream', { ascending: false })
          .limit(20)
      ]);

      // 5. Combinar e filtrar
      const todasMusicas = [...(musicasArtistasResult.data || []), ...(musicasPopularesResult.data || [])];
      const albumsMap = new Map<string, Album>();

      todasMusicas.forEach(musica => {
        const key = `${musica.album}-${musica.artist}`;
        if (!albumsMap.has(key) && !albumsAvaliadosSet.has(key) && musica.url_capa) {
          albumsMap.set(key, {
            id: musica.id,
            titulo: musica.album,
            artista: musica.artist,
            capaUrl: musica.url_capa
          } as Album);
        }
      });

      const recomendacoes = Array.from(albumsMap.values()).slice(0, 10);
      
      if (recomendacoes.length < 5) {
        return await this.getRecomendacoesPopulares();
      }

      return recomendacoes;

    } catch (error) {
      console.error('Erro nas recomendações híbridas:', error);
      return await this.getRecomendacoesPopulares();
    }
  },

  async getRecomendacoesPopulares(): Promise<Album[]> {
    try {
      const { data: musicasData, error: queryError } = await supabase
        .from('musicas')
        .select('id, album, artist, url_capa')
        .not('url_capa', 'is', null)
        .not('album', 'is', null)
        .not('artist', 'is', null)
        .order('stream', { ascending: false })
        .limit(20);

      if (queryError) {
        return [];
      }

      // Agrupar por álbum para evitar duplicatas
      const albumsMap = new Map<string, Album>();
      (musicasData || []).forEach(musica => {
        const key = `${musica.album}-${musica.artist}`;
        if (!albumsMap.has(key) && musica.url_capa) {
          albumsMap.set(key, {
            id: musica.id,
            titulo: musica.album,
            artista: musica.artist,
            capaUrl: musica.url_capa
          } as Album);
        }
      });

      return Array.from(albumsMap.values()).slice(0, 10);

    } catch (error) {
      console.error('Erro ao buscar álbuns populares:', error);
      return [];
    }
  }
};