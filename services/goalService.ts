import { CreateGoalData, Goal, UpdateGoalData } from '../app/_types/Goal';
import { supabase } from './supabase';

export const GoalService = {
  async createGoal(goalData: CreateGoalData): Promise<Goal | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('=== DEBUG CREATE GOAL ===');
      console.log('Session:', session ? 'EXISTS' : 'NULL');
      console.log('User ID:', session?.user?.id);
      
      if (!session?.user) {
        console.error('❌ Usuário não autenticado ao criar meta');
        throw new Error('Usuário não autenticado');
      }

      const goalToInsert = {
        ...goalData,
        user_id: session.user.id,
        current_count: 0
      };
      
      console.log('Inserindo meta:', goalToInsert);

      const { data, error } = await supabase
        .from('user_goals')
        .insert(goalToInsert)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Meta criada com sucesso:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao criar meta:', error);
      
      // Retornar um erro mais informativo
      if (error.message === 'Usuário não autenticado') {
        throw error; // Propagar erro de autenticação
      }
      
      return null;
    }
  },


  async getUserGoals(): Promise<Goal[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      return [];
    }
  },

  async updateGoal(goalId: string, updates: UpdateGoalData): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      return null;
    }
  },
  async incrementProgress(goalId: string): Promise<Goal | null> {
    try {
      const { data: goal } = await supabase
        .from('user_goals')
        .select('current_count, target_count')
        .eq('id', goalId)
        .single();

      if (!goal || goal.current_count >= goal.target_count) {
        return null;
      }

      return await this.updateGoal(goalId, {
        current_count: goal.current_count + 1
      });
    } catch (error) {
      console.error('Erro ao incrementar progresso:', error);
      return null;
    }
  },
  async deleteGoal(goalId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      return false;
    }
  },
  calculateProgress(goal: Goal): number {
    return Math.round((goal.current_count / goal.target_count) * 100);
  },
  isGoalOverdue(goal: Goal): boolean {
    if (!goal.deadline) return false;
    return new Date(goal.deadline) < new Date();
  }
};