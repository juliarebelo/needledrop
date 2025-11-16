import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export interface Resenha {
  id: string;
  album_name: string;
  artist: string;
  year: number;
  track_count: number;
  album_cover: string | null; // coluna correta no banco
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

export const useUserReviews = () => {
  const [reviews, setReviews] = useState<Resenha[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserAndReviews();
  }, []);

  const fetchUserAndReviews = async () => {
    try {
      // Busca a sessão atual do usuário
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        // Busca as resenhas do usuário
        const { data, error } = await supabase
          .from('resenhas')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const normalized = (data || []).map(r => ({
          ...r,
          rating: typeof r.rating === 'string' ? parseFloat(r.rating) : r.rating
        }));
        setReviews(normalized);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Erro ao buscar resenhas:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshReviews = () => {
    setLoading(true);
    fetchUserAndReviews();
  };

  const addReview = async (newReview: Omit<Resenha, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('resenhas')
        .insert({
          ...newReview,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setReviews(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Erro ao adicionar resenha:', error);
      throw error;
    }
  };

  const updateReview = async (id: string, updates: Partial<Resenha>) => {
    try {
      const { data, error } = await supabase
        .from('resenhas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setReviews(prev => prev.map(review => 
        review.id === id ? data : review
      ));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar resenha:', error);
      throw error;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resenhas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReviews(prev => prev.filter(review => review.id !== id));
    } catch (error) {
      console.error('Erro ao excluir resenha:', error);
      throw error;
    }
  };

  return { 
    reviews, 
    loading, 
    user,
    refreshReviews, 
    addReview, 
    updateReview, 
    deleteReview 
  };
};