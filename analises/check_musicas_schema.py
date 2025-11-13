import os
from supabase import create_client

# Configuração
SUPABASE_URL = "https://qxkfkthihhlajmbiahqq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ZrdGhpaGhsYWptYmlhaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAwNjcsImV4cCI6MjA3NjU1NjA2N30.Uv573OkhjVTAl0kniltycnF1uQtqW32G4KTXX2nYnBU"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    # Tentar selecionar todas as colunas de uma linha
    response = supabase.table('musicas').select('*').limit(1).execute()
    
    if response.data:
        print("✅ Colunas da tabela 'musicas':")
        for col in response.data[0].keys():
            print(f"  - {col}")
    else:
        print("⚠️ Tabela vazia, tentando inserir um registro de teste...")
        # Tentar inserir um registro de teste para ver quais colunas são esperadas
        test_data = {
            "titulo": "Teste",
            "artista_id": "00000000-0000-0000-0000-000000000000"
        }
        try:
            response = supabase.table('musicas').insert(test_data).execute()
            print("✅ Inserção de teste bem-sucedida!")
        except Exception as e:
            print(f"❌ Erro na inserção de teste: {e}")
            
except Exception as e:
    print(f"❌ Erro: {e}")
