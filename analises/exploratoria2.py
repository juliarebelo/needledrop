import pandas as pd
import numpy as np
import warnings

warnings.filterwarnings('ignore')

def clean_text(text):
    if isinstance(text, str):
        return text.replace('$', 'S').replace('\\', '/').replace('_', ' ')
    return text

df = pd.read_csv('Spotify_Youtube.csv')
if 'Unnamed: 0' in df.columns:
    df = df.drop(columns=['Unnamed: 0'])


text_columns = ['Artist', 'Track', 'Album', 'Title', 'Channel']
for col in text_columns:
    if col in df.columns:
        df[col] = df[col].apply(clean_text)

separator = "\n" + "*" * 80 + "\n"

print(separator)
print("1. Visão Geral do Dataset")
print(f"Shape: {df.shape}")
print(f"Colunas: {df.columns.tolist()}")
print("\nTipos de dados e valores nulos:")
print(df.info())
print("\nValores Ausentes por Coluna:")
print(df.isnull().sum())

print(separator)
print("2. Estatísticas Descritivas")
print("\nEstatísticas Descritivas das Variáveis Numéricas:")
print(df.describe())

music_features = ['Danceability', 'Energy', 'Loudness', 'Speechiness', 
                  'Acousticness', 'Instrumentalness', 'Liveness', 'Valence', 'Tempo']
print("\nEstatísticas das Características Musicais:")
print(df[music_features].describe())

if 'Duration_ms' in df.columns:
    df['Duration_min'] = df['Duration_ms'] / 60000
    print("\nEstatísticas de Duração das Músicas (em minutos):")
    print(df['Duration_min'].describe())


if 'Valence' in df.columns:
    print("\nDistribuição de Valence (Tom Emocional):")
    print(f"Média: {df['Valence'].mean():.2f}")


print(separator)
print("3. Análise por Artista e Álbum")
print("\nNúmero de Músicas por Artista:")
artist_counts = df['Artist'].value_counts()
print(artist_counts)


if 'Album_type' in df.columns:
    print("\nDistribuição por Tipo de Álbum:")
    print(df['Album_type'].value_counts(normalize=True) * 100)


print(separator)
print("4. Métricas de Popularidade e Engajamento")
print("\nTop 5 Músicas com Mais Visualizações no YouTube:")
if 'Views' in df.columns:
    top_views = df.nlargest(5, 'Views')[['Artist', 'Track', 'Views', 'Likes', 'Comments']]
    print(top_views)

print("\nTop 5 Músicas com Mais Streams no Spotify:")
if 'Stream' in df.columns:
    top_streams = df.nlargest(5, 'Stream')[['Artist', 'Track', 'Stream']]
    print(top_streams)


if 'Channel' in df.columns and 'Views' in df.columns:
    channel_views = df.groupby('Channel')['Views'].sum().sort_values(ascending=False)
    print("\nTop 10 Canais com Mais Visualizações Totais:")
    print(channel_views.head(10))


engagement_metrics = ['Views', 'Likes', 'Comments']
if all(m in df.columns for m in engagement_metrics):
    print("\nCorrelação entre Engajamento no YouTube:")
    correlation_matrix = df[engagement_metrics].corr()
    print(correlation_matrix)


if 'official_video' in df.columns:
    official_stats = df.groupby('official_video')[['Views', 'Likes', 'Comments']].mean()
    print("\nEstatísticas Médias por Tipo de Vídeo (Oficial vs Não Oficial):")
    print(official_stats)


if 'Licensed' in df.columns:
    licensed_stats = df.groupby('Licensed')[['Views', 'Likes', 'Stream']].mean()
    print("\nEstatísticas Médias por Licenciamento:")
    print(licensed_stats)


print(separator)
print("5. Características Musicais e Relações")
print("\nTop 5 Músicas Mais Dançáveis:")
top_danceable = df.nlargest(5, 'Danceability')[['Artist', 'Track', 'Danceability', 'Energy']]
print(top_danceable)

print("\nTop 5 Músicas Mais Energéticas:")
top_energetic = df.nlargest(5, 'Energy')[['Artist', 'Track', 'Energy', 'Danceability']]
print(top_energetic)

print("\nTop 5 com Mais Speechiness (Mais Faladas):")
top_speechiness = df.nlargest(5, 'Speechiness')[['Artist', 'Track', 'Speechiness']]
print(top_speechiness)

print("\nTop 5 Mais Instrumentais:")
top_instrumental = df.nlargest(5, 'Instrumentalness')[['Artist', 'Track', 'Instrumentalness']]
print(top_instrumental)


if 'Stream' in df.columns:
    corr_stream = df[music_features + ['Stream']].corr()['Stream'].drop('Stream').sort_values(ascending=False)
    print("\nCorrelação entre Features Musicais e Streams:")
    print(corr_stream)


numeric_columns = df.select_dtypes(include=[np.number]).columns
if len(numeric_columns) > 0:
    correlation_matrix_full = df[numeric_columns].corr()
    print("\nMatriz de Correlação Completa (Top Correlações):")
    print(correlation_matrix_full)

print(separator)
print("Análise Concluída!")