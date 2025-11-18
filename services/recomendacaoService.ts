import { Album } from '../app/_types/Album';
import { supabase } from '../lib/supabase';

export const RecomendacaoService = {
  async getRecomendacoes(userId?: string | null): Promise<Album[]> {
    try {
      console.log('=== INICIANDO BUSCA DE RECOMENDAÇÕES ===');
      console.log('User ID recebido:', userId);
      
      let finalUserId: string | null = null;

      if (userId) {
        console.log('Usando user_id fornecido:', userId);
        finalUserId = userId;
      } else {
        console.log('Tentando detectar usuário automaticamente...');
        const { data: { session } } = await supabase.auth.getSession();
        finalUserId = session?.user?.id || null;
        console.log('User ID detectado:', finalUserId);
      }
      if (finalUserId) {
        console.log('Usando recomendações híbridas baseadas em avaliações');
        return await this.getRecomendacoesHibridas(finalUserId);
      } else {
        console.log('Nenhum user_id - mostrando álbuns populares');
        return await this.getRecomendacoesPopulares();
      }

    } catch (error) {
      console.error('Erro geral no serviço de recomendações:', error);
      return await this.getRecomendacoesPopulares();
    }
  },

  async getRecomendacoesHibridas(userId: string): Promise<Album[]> {
    try {
      console.log('Buscando recomendações híbridas para:', userId);

      // 1. Buscar últimas avaliações bem avaliadas do usuário
      const { data: avaliacoes, error: avaliacoesError } = await supabase
        .from('resenhas')
        .select('artist, rating, album_name')
        .eq('user_id', userId)
        .gte('rating', 3.5)
        .order('created_at', { ascending: false })
        .limit(10);

      if (avaliacoesError) {
        console.error('Erro ao buscar avaliações:', avaliacoesError);
        return await this.getRecomendacoesPopulares();
      }

      // 2. Extrair artistas favoritos
      const artistasFavoritos = [...new Set(avaliacoes?.map(a => a.artist) || [])].slice(0, 5);
      console.log('Artistas favoritos:', artistasFavoritos);

      // 3. Buscar álbuns já avaliados para excluir (garantir que ainda existem)
      const { data: albumsAvaliados, error: avaliadosError } = await supabase
        .from('resenhas')
        .select('album_name, artist, id')
        .eq('user_id', userId);

      if (avaliadosError) {
        console.error('Erro ao buscar álbuns avaliados:', avaliadosError);
      }

      const albumsAvaliadosSet = new Set(
        (albumsAvaliados || []).map(a => `${a.album_name}-${a.artist}`)
      );

      // 4. Buscar álbuns dos artistas favoritos que o usuário ainda não avaliou
      const { data: musicasArtistas } = await supabase
        .from('musicas')
        .select('id, album, artist, url_capa')
        .in('artist', artistasFavoritos)
        .not('url_capa', 'is', null)
        .not('album', 'is', null)
        .order('stream', { ascending: false })
        .limit(30);

      // 5. Buscar álbuns populares para complementar
      const { data: musicasPopulares } = await supabase
        .from('musicas')
        .select('id, album, artist, url_capa')
        .not('url_capa', 'is', null)
        .not('album', 'is', null)
        .order('stream', { ascending: false })
        .limit(20);

      // 6. Combinar e filtrar
      const todasMusicas = [...(musicasArtistas || []), ...(musicasPopulares || [])];
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
      console.log('Recomendações híbridas encontradas:', recomendacoes.length);
      
      // Se não houver recomendações suficientes, usar populares
      if (recomendacoes.length < 5) {
        console.log('Poucas recomendações, usando populares');
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
      console.log('Buscando álbuns populares...');
      
      // Usando fallback manual direto (mais rápido e confiável)
      const { data: musicasData, error: queryError } = await supabase
        .from('musicas')
        .select('id, album, artist, url_capa')
        .not('url_capa', 'is', null)
        .not('album', 'is', null)
        .not('artist', 'is', null)
        .order('stream', { ascending: false })
        .limit(20);

      if (queryError) {
        console.error('Erro ao buscar álbuns:', queryError);
        return [];
      }

      console.log('Dados recebidos do banco:', musicasData?.length || 0);
      console.log('Primeiras 3 músicas:', musicasData?.slice(0, 3));

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

      const albuns = Array.from(albumsMap.values()).slice(0, 10);
      console.log('Álbuns populares encontrados:', albuns.length);
      console.log('Primeiro álbum completo:', JSON.stringify(albuns[0], null, 2));
      return albuns;

    } catch (error) {
      console.error('Erro ao buscar álbuns populares:', error);
      return [];
    }
  }
};