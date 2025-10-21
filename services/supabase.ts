import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qxkfkthihhlajmbiahqq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ZrdGhpaGhsYWptYmlhaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAwNjcsImV4cCI6MjA3NjU1NjA2N30.Uv573OkhjVTAl0kniltycnF1uQtqW32G4KTXX2nYnBU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)