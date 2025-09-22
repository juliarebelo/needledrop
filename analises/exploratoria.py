import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings


plt.rcParams['text.usetex'] = False
plt.rcParams['mathtext.default'] = 'regular' 
plt.style.use('default')
sns.set_palette("husl")
warnings.filterwarnings('ignore') 


df = pd.read_csv('Spotify_Youtube.csv')


def clean_text(text):
    if isinstance(text, str):
        return text.replace('$', 'S').replace('\\', '/').replace('_', ' ')
    return text


text_columns = ['Artist', 'Track', 'Album', 'Title', 'Channel']
for col in text_columns:
    if col in df.columns:
        df[col] = df[col].apply(clean_text)


print("Primeiras 5 linhas do dataset:")
print(df.head())


print("\nInformações do dataset:")
print(f"Shape: {df.shape}")
print(f"Colunas: {df.columns.tolist()}")
print("\nTipos de dados e valores nulos:")
print(df.info())


print("\nEstatísticas descritivas das variáveis numéricas:")
print(df.describe())


print("\nNúmero de músicas por artista:")
artist_counts = df['Artist'].value_counts()
print(artist_counts)


plt.figure(figsize=(12, 6))
artist_counts.head(10).plot(kind='bar', color='skyblue')
plt.title('Top 10 Artistas com Mais Músicas no Dataset')
plt.xlabel('Artista')
plt.ylabel('Número de Músicas')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('artistas_top10.png') 
plt.close()


music_features = ['Danceability', 'Energy', 'Loudness', 'Speechiness', 
                 'Acousticness', 'Instrumentalness', 'Liveness', 'Valence', 'Tempo']

print("\nEstatísticas das características musicais:")
print(df[music_features].describe())


fig, axes = plt.subplots(3, 3, figsize=(15, 12))
axes = axes.flatten()

for i, feature in enumerate(music_features):
    if feature in df.columns:
        sns.histplot(df[feature].dropna(), kde=True, ax=axes[i], bins=30)
        axes[i].set_title(f'Distribuição de {feature}')
        axes[i].set_xlabel(feature)
    else:
        axes[i].set_visible(False)

plt.tight_layout()
plt.savefig('distribuicao_caracteristicas.png')
plt.close()


print("\nTop 5 músicas com mais visualizações no YouTube:")
if 'Views' in df.columns:
    top_views = df.nlargest(5, 'Views')[['Artist', 'Track', 'Views', 'Likes', 'Comments']]
    print(top_views)


print("\nTop 5 músicas com mais streams no Spotify:")
if 'Stream' in df.columns:
    top_streams = df.nlargest(5, 'Stream')[['Artist', 'Track', 'Stream']]
    print(top_streams)


engagement_metrics = ['Views', 'Likes', 'Comments']
engagement_metrics = [m for m in engagement_metrics if m in df.columns]

if engagement_metrics:
    print("\nCorrelação entre engajamento no YouTube:")
    correlation_matrix = df[engagement_metrics].corr()
    print(correlation_matrix)

   
    plt.figure(figsize=(8, 6))
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
    plt.title('Correlação entre Métricas de Engajamento no YouTube')
    plt.savefig('correlacao_engajamento.png')
    plt.close()


if 'Danceability' in df.columns and 'Energy' in df.columns:
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df, x='Danceability', y='Energy', alpha=0.6)
    plt.title('Relação entre Danceability e Energy')
    plt.savefig('danceability_energy.png')
    plt.close()


if 'Loudness' in df.columns and 'Energy' in df.columns:
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df, x='Loudness', y='Energy', alpha=0.6)
    plt.title('Relação entre Loudness e Energy')
    plt.savefig('loudness_energy.png')
    plt.close()


if 'Key' in df.columns:
    plt.figure(figsize=(12, 6))
    key_data = df['Key'].dropna()
    if not key_data.empty:
        key_order = sorted(key_data.unique())
        sns.countplot(data=df, x='Key', order=key_order)
        plt.title('Distribuição de Chaves Musicais (Key)')
        plt.xlabel('Key (0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B)')
        plt.ylabel('Contagem')
        plt.savefig('distribuicao_keys.png')
        plt.close()


if 'official_video' in df.columns:
    official_stats = df.groupby('official_video')[['Views', 'Likes', 'Comments']].mean()
    print("\nEstatísticas médias por tipo de vídeo (oficial vs não oficial):")
    print(official_stats)


if 'Duration_ms' in df.columns:
    df['Duration_min'] = df['Duration_ms'] / 60000
    print("\nEstatísticas de duração das músicas (em minutos):")
    print(df['Duration_min'].describe())


if 'Artist' in df.columns and 'Duration_min' in df.columns:
    artists_multiple_songs = artist_counts[artist_counts > 1].index
    df_filtered = df[df['Artist'].isin(artists_multiple_songs)]
    
    if not df_filtered.empty:
        plt.figure(figsize=(12, 8))
        top_artists = df_filtered['Artist'].value_counts().head(20).index
        df_top = df_filtered[df_filtered['Artist'].isin(top_artists)]
        
        sns.boxplot(data=df_top, x='Duration_min', y='Artist')
        plt.title('Duração das Músicas por Artista (Top 20)')
        plt.xlabel('Duração (minutos)')
        plt.ylabel('Artista')
        plt.tight_layout()
        plt.savefig('duracao_por_artista.png')
        plt.close()


if 'Valence' in df.columns:
    print("\nDistribuição de Valence (tom emocional):")
    plt.figure(figsize=(10, 6))
    sns.histplot(df['Valence'].dropna(), kde=True, bins=30)
    plt.title('Distribuição de Valence (Tom Emocional)')
    plt.xlabel('Valence (0=triste/negativo, 1=feliz/positivo)')
    plt.axvline(df['Valence'].mean(), color='red', linestyle='--', label=f'Média: {df["Valence"].mean():.2f}')
    plt.legend()
    plt.savefig('distribuicao_valence.png')
    plt.close()


if 'Danceability' in df.columns:
    print("\nTop 5 músicas mais dançáveis:")
    top_danceable = df.nlargest(5, 'Danceability')[['Artist', 'Track', 'Danceability', 'Energy']]
    print(top_danceable)


if 'Energy' in df.columns:
    print("\nTop 5 músicas mais energéticas:")
    top_energetic = df.nlargest(5, 'Energy')[['Artist', 'Track', 'Energy', 'Danceability']]
    print(top_energetic)


print("\nMatriz de correlação completa:")
numeric_columns = df.select_dtypes(include=[np.number]).columns
if len(numeric_columns) > 0:
    correlation_matrix_full = df[numeric_columns].corr()
    plt.figure(figsize=(12, 10))
    sns.heatmap(correlation_matrix_full, annot=True, cmap='coolwarm', center=0, fmt='.2f')
    plt.title('Matriz de Correlação Completa')
    plt.tight_layout()
    plt.savefig('matriz_correlacao_completa.png')
    plt.close()


if 'Views' in df.columns and 'Stream' in df.columns:
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df, x='Views', y='Stream', alpha=0.6)
    plt.title('Relação entre Visualizações no YouTube e Streams no Spotify')
    plt.xlabel('Visualizações no YouTube')
    plt.ylabel('Streams no Spotify')
    plt.savefig('views_vs_streams.png')
    plt.close()

print("\nAnálise concluída!")