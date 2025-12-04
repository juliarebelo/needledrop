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

      if (error) {
        throw error;
      }

      return (data || []).map((fav: any) => ({
        id: fav.resenhas.id,
        album_name: fav.resenhas.album_name,
        artist: fav.resenhas.artist,
        album_cover: fav.resenhas.album_cover
      }));
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return [];
    }
  }

  static async addFavorite(userId: string, reviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          review_id: reviewId
        });

      if (error) {
        if (error.code === '23505') {
          return true;
        }
        throw error;
      }

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
