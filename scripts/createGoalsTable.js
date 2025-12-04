const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qxkfkthihhlajmbiahqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ZrdGhpaGhsYWptYmlhaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAwNjcsImV4cCI6MjA3NjU1NjA2N30.Uv573OkhjVTAl0kniltycnF1uQtqW32G4KTXX2nYnBU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAndCreateTable() {
  try {
    console.log('🔍 Verificando se a tabela user_goals existe...');
    
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ Tabela user_goals não existe.');
      console.log('\n📋 Execute este SQL no Supabase SQL Editor:\n');
      console.log(`
-- Criar tabela user_goals
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_count INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias metas
CREATE POLICY "Users can view their own goals"
  ON user_goals FOR SELECT
  USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias metas
CREATE POLICY "Users can create their own goals"
  ON user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias metas
CREATE POLICY "Users can update their own goals"
  ON user_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias metas
CREATE POLICY "Users can delete their own goals"
  ON user_goals FOR DELETE
  USING (auth.uid() = user_id);
      `);
      console.log('\n✅ Após executar o SQL, suas metas serão salvas corretamente!');
    } else if (error) {
      console.error('❌ Erro ao verificar tabela:', error);
    } else {
      console.log('✅ Tabela user_goals existe e está funcionando!');
      console.log(`📊 Registros encontrados: ${data?.length || 0}`);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkAndCreateTable();
