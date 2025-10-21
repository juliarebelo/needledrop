import { supabase } from './supabase';

const LASTFM_API_KEY = '8b6ae954b532dde9a4567228240e5a68';

export class AlbumCoverService {
  
  async getAlbumCover(artist: string, album: string): Promise<string | null> {
    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`;
      
      console.log('🔍 Buscando capa para:', artist, '-', album);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log('❌ Erro na resposta:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.log('❌ Álbum não encontrado:', data.message);
        return null;
      }
      
      const coverUrl = data.album?.image[2]?.['#text'];
      
      if (coverUrl) {
        console.log('✅ Capa encontrada:', coverUrl);
        return coverUrl;
      } else {
        console.log('❌ Nenhuma capa encontrada');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Erro na API do Last.fm:', error);
      return null;
    }
  }
  
  async findAndSaveCover(musicaId: string, artist: string, albumTitle: string): Promise<boolean> {
    try {
      console.log(`💾 Tentando salvar capa para: ${artist} - ${albumTitle}`);
      
      const coverUrl = await this.getAlbumCover(artist, albumTitle);
      
      if (coverUrl) {
        const { error } = await supabase
          .from('musicas')
          .update({ url_capa: coverUrl })
          .eq('id', musicaId);
          
        if (error) {
          console.log('❌ Erro ao salvar no Supabase:', error);
          return false;
        } else {
          console.log('✅ Salvo no Supabase com sucesso!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro geral:', error);
      return false;
    }
  }

  async fillAllMissingCovers(): Promise<void> {
    try {
      console.log('🔄 Buscando músicas sem capa no Supabase...');
      
      const { data: musicas, error } = await supabase
        .from('musicas')
        .select('id, title, artist, album, url_capa')
        .is('url_capa', null)
        .limit(20000);

      if (error) {
        console.log('❌ Erro ao buscar músicas:', error);
        return;
      }

      if (!musicas || musicas.length === 0) {
        console.log('✅ Nenhuma música sem capa encontrada!');
        return;
      }

      console.log(`📊 Encontradas ${musicas.length} músicas sem capa`);

      let successCount = 0;
      
      for (const musica of musicas) {
        console.log(`\n🎵 Processando: ${musica.artist} - ${musica.album || musica.title}`);
        
        const albumName = musica.album || musica.title;
        const saved = await this.findAndSaveCover(musica.id, musica.artist, albumName);
        
        if (saved) {
          successCount++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`\n🎉 FINALIZADO! Sucessos: ${successCount}/${musicas.length}`);
      
    } catch (error) {
      console.error('❌ Erro no processo completo:', error);
    }
  }
}

export const albumCoverService = new AlbumCoverService();