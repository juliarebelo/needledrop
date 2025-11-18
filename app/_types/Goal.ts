export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_count: number;
  current_count: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  target_count: number;
  deadline?: string;
}

export interface UpdateGoalData {
  current_count?: number;
  target_count?: number;
  title?: string;
  description?: string;
  deadline?: string;
}