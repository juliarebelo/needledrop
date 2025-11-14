import pandas as pd

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

df = pd.read_csv('analises/Spotify_Youtube.csv')

if '' in df.columns:
    df = df.drop(columns=[''])

df = df.rename(columns=mapeamento)

df.to_csv('musicas_corrigido.csv', index=False)
print("✅ CSV convertido com sucesso!")