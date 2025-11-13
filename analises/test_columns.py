from supabase import create_client

SUPABASE_URL = "https://qxkfkthihhlajmbiahqq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ZrdGhpaGhsYWptYmlhaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAwNjcsImV4cCI6MjA3NjU1NjA2N30.Uv573OkhjVTAl0kniltycnF1uQtqW32G4KTXX2nYnBU"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    print("Testando inserção na tabela artistas...")
    test_artist = {
        'nome_artistico': 'Teste Artista',
        'created_at': '2025-11-13T00:00:00'
    }
    response = supabase.table('artistas').insert(test_artist).execute()
    print("✅ Inserção bem-sucedida!")
    print(f"Artista criado com ID: {response.data[0]['id']}")
except Exception as e:
    print(f"❌ Erro: {e}")
