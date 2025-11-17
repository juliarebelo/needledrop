import { supabase } from './supabase';

export interface FavoriteAlbum {
  id: string;
  album_name: string;
  artist: string;
  album_cover: string;
}

export class FavoritesService {
  static async getUserFavorites(userId: string): Promise<FavoriteAlbum[]> {
    try {
      console.log('FavoritesService.getUserFavorites for userId:', userId);
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          review_id,
          resenhas (
            id,
            album_name,
            artist,
            album_cover
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('Query result:', { data, error });

      if (error) {
        console.error('Erro na query:', error);
        throw error;
      }

      const favorites = (data || []).map((fav: any) => ({
        id: fav.resenhas.id,
        album_name: fav.resenhas.album_name,
        artist: fav.resenhas.artist,
        album_cover: fav.resenhas.album_cover
      }));

      console.log('Favoritos processados:', favorites);
      return favorites;
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return [];
    }
  }

  static async addFavorite(userId: string, reviewId: string): Promise<boolean> {
    try {
      console.log('FavoritesService.addFavorite:', { userId, reviewId });
      
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          review_id: reviewId
        })
        .select();

      console.log('Insert result:', { data, error });

      if (error) {
        if (error.code === '23505') {
          console.log('Favorito já existe');
          return true;
        }
        console.error('Erro ao inserir favorito:', error);
        throw error;
      }

      console.log('Favorito adicionado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return false;
    }
  }

  static async removeFavorite(userId: string, reviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('review_id', reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return false;
    }
  }

  static async isFavorite(userId: string, reviewId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('review_id', reviewId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  }

  static async getFavoriteIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('review_id')
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map((fav: any) => fav.review_id);
    } catch (error) {
      console.error('Erro ao buscar IDs de favoritos:', error);
      return [];
    }
  }
}
