import pandas as pd

# Mapeamento dos cabeçalhos
mapeamento = {
    'Artist': 'artist',
    'Url_spotify': 'url_spotify', 
    'Track': 'track',
    'Album': 'album',
    'Album_type': 'album_type',
    'Uri': 'uri',
    'Danceability': 'danceability',
    'Energy': 'energy',
    'Key': 'key',
    'Loudness': 'loudness',
    'Speechiness': 'speechiness',
    'Acousticness': 'acousticness',
    'Instrumentalness': 'instrumentalness',
    'Liveness': 'liveness',
    'Valence': 'valence',
    'Tempo': 'tempo',
    'Duration_ms': 'duration_ms',
    'Url_youtube': 'url_youtube',
    'Title': 'title',
    'Channel': 'channel',
    'Views': 'views',
    'Likes': 'likes',
    'Comments': 'comments',
    'Description': 'description',
    'Licensed': 'licensed',
    'Stream': 'stream'
}

# Ler CSV original
df = pd.read_csv('analises/Spotify_Youtube.csv')

# Remover coluna vazia se existir
if '' in df.columns:
    df = df.drop(columns=[''])

# Renomear colunas
df = df.rename(columns=mapeamento)

# Salvar CSV corrigido
df.to_csv('musicas_corrigido.csv', index=False)
print("✅ CSV convertido com sucesso!")