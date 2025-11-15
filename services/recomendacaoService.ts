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
        console.log('Chamando RPC com ID:', finalUserId);
        const { data, error } = await supabase.rpc('recomendar_albuns', {
          p_user_id: finalUserId
        });

        if (error) {
          console.error('Erro na RPC recomendar_albuns:', error);
          console.log('Fazendo fallback para álbuns populares...');
          return await this.getRecomendacoesPopulares();
        }

        console.log('Recomendações personalizadas recebidas:', data?.length || 0);
        return data as Album[] || [];
      } else {
        console.log('Nenhum user_id - mostrando álbuns populares');
        return await this.getRecomendacoesPopulares();
      }

    } catch (error) {
      console.error('Erro geral no serviço de recomendações:', error);
      return await this.getRecomendacoesPopulares();
    }
  },

  async getRecomendacoesPopulares(): Promise<Album[]> {
    try {
      console.log('Buscando álbuns populares...');
      
      const { data, error } = await supabase.rpc('recomendar_albuns_populares');
      
      if (!error && data) {
        console.log('Álbuns populares via RPC:', data.length);
        return data as Album[];
      }
      
      // Fallback manual se a RPC falhar
      console.log('Usando fallback manual para álbuns populares');
      const { data: musicasData, error: queryError } = await supabase
        .from('musicas')
        .select('id, album, artist, url_capa')
        .not('url_capa', 'is', null)
        .not('album', 'is', null)
        .not('artist', 'is', null)
        .order('stream', { ascending: false })
        .limit(10);

      if (queryError) {
        console.error('Erro no fallback manual:', queryError);
        return [];
      }

      const albuns = (musicasData || []).map(musica => ({
        id: musica.id,
        titulo: musica.album,
        artista: musica.artist,
        capaUrl: musica.url_capa
      } as Album));

      console.log('Álbuns populares via fallback:', albuns.length);
      return albuns;


    } catch (error) {
      console.error('Erro ao buscar álbuns populares:', error);
      return [];
    }
  }
};