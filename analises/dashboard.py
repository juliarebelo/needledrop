import dash
from dash import dcc, html, Input, Output, callback
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import plotly.subplots as sp
from plotly.subplots import make_subplots
import dash_bootstrap_components as dbc


app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
app.title = "Análise Exploratória Spotify & YouTube"


df = pd.read_csv('Spotify_Youtube.csv')

def clean_text(text):
    if isinstance(text, str):
        return text.replace('$', 'S').replace('\\', '/').replace('_', ' ')
    return text

text_columns = ['Artist', 'Track', 'Album', 'Title', 'Channel']
for col in text_columns:
    if col in df.columns:
        df[col] = df[col].apply(clean_text)


if 'Duration_ms' in df.columns:
    df['Duration_min'] = df['Duration_ms'] / 60000


app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.H1("Análise Exploratória - Spotify & YouTube", 
                       className="text-center mb-4"), width=12)
    ]),
    
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Informações do Dataset"),
                dbc.CardBody([
                    html.P(f"Shape: {df.shape}"),
                    html.P(f"Total de músicas: {len(df)}"),
                    html.P(f"Total de artistas: {df['Artist'].nunique()}"),
                    html.P(f"Colunas: {len(df.columns)}")
                ])
            ])
        ], width=4),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Estatísticas Numéricas"),
                dbc.CardBody([
                    html.P(f"Média de visualizações: {df['Views'].mean():,.0f}"),
                    html.P(f"Média de streams: {df['Stream'].mean():,.0f}"),
                    html.P(f"Média de duração: {df['Duration_min'].mean():.2f} min")
                ])
            ])
        ], width=4),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Top Artista"),
                dbc.CardBody([
                    html.P(f"Artista com mais músicas: {df['Artist'].value_counts().index[0]}"),
                    html.P(f"Total: {df['Artist'].value_counts().iloc[0]} músicas")
                ])
            ])
        ], width=4)
    ], className="mb-4"),
    
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Top 10 Artistas com Mais Músicas"),
                dbc.CardBody([
                    dcc.Graph(id='top-artists-chart')
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Distribuição de Características Musicais"),
                dbc.CardBody([
                    dcc.Dropdown(
                        id='feature-selector',
                        options=[
                            {'label': 'Danceability', 'value': 'Danceability'},
                            {'label': 'Energy', 'value': 'Energy'},
                            {'label': 'Loudness', 'value': 'Loudness'},
                            {'label': 'Speechiness', 'value': 'Speechiness'},
                            {'label': 'Acousticness', 'value': 'Acousticness'},
                            {'label': 'Instrumentalness', 'value': 'Instrumentalness'},
                            {'label': 'Liveness', 'value': 'Liveness'},
                            {'label': 'Valence', 'value': 'Valence'},
                            {'label': 'Tempo', 'value': 'Tempo'}
                        ],
                        value='Danceability',
                        clearable=False
                    ),
                    dcc.Graph(id='feature-distribution')
                ])
            ])
        ], width=6)
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Relação entre Variáveis Musicais"),
                dbc.CardBody([
                    dbc.Row([
                        dbc.Col([
                            dcc.Dropdown(
                                id='x-axis-selector',
                                options=[
                                    {'label': 'Danceability', 'value': 'Danceability'},
                                    {'label': 'Energy', 'value': 'Energy'},
                                    {'label': 'Loudness', 'value': 'Loudness'},
                                    {'label': 'Valence', 'value': 'Valence'}
                                ],
                                value='Danceability',
                                clearable=False
                            )
                        ], width=6),
                        dbc.Col([
                            dcc.Dropdown(
                                id='y-axis-selector',
                                options=[
                                    {'label': 'Energy', 'value': 'Energy'},
                                    {'label': 'Danceability', 'value': 'Danceability'},
                                    {'label': 'Loudness', 'value': 'Loudness'},
                                    {'label': 'Valence', 'value': 'Valence'}
                                ],
                                value='Energy',
                                clearable=False
                            )
                        ], width=6)
                    ]),
                    dcc.Graph(id='scatter-plot')
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Correlação entre Engajamento no YouTube"),
                dbc.CardBody([
                    dcc.Graph(id='engagement-heatmap')
                ])
            ])
        ], width=6)
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Top Músicas por Engajamento"),
                dbc.CardBody([
                    dcc.Dropdown(
                        id='metric-selector',
                        options=[
                            {'label': 'Visualizações no YouTube', 'value': 'Views'},
                            {'label': 'Likes no YouTube', 'value': 'Likes'},
                            {'label': 'Streams no Spotify', 'value': 'Stream'}
                        ],
                        value='Views',
                        clearable=False
                    ),
                    dcc.Graph(id='top-songs-chart')
                ])
            ])
        ], width=12)
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Distribuição de Chaves Musicais"),
                dbc.CardBody([
                    dcc.Graph(id='key-distribution')
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Relação Views vs Streams"),
                dbc.CardBody([
                    dcc.Graph(id='views-vs-streams')
                ])
            ])
        ], width=6)
    ], className="mb-4")
], fluid=True)


@app.callback(
    Output('top-artists-chart', 'figure'),
    Input('top-artists-chart', 'id')
)
def update_top_artists(_):
    artist_counts = df['Artist'].value_counts().head(10)
    fig = px.bar(x=artist_counts.index, y=artist_counts.values,
                 labels={'x': 'Artista', 'y': 'Número de Músicas'},
                 title='Top 10 Artistas com Mais Músicas')
    fig.update_layout(xaxis_tickangle=-45)
    return fig

@app.callback(
    Output('feature-distribution', 'figure'),
    Input('feature-selector', 'value')
)
def update_feature_distribution(feature):
    fig = px.histogram(df, x=feature, nbins=30, 
                      title=f'Distribuição de {feature}')
    return fig

@app.callback(
    Output('scatter-plot', 'figure'),
    [Input('x-axis-selector', 'value'),
     Input('y-axis-selector', 'value')]
)
def update_scatter_plot(x_axis, y_axis):
    fig = px.scatter(df, x=x_axis, y=y_axis, hover_data=['Artist', 'Track'],
                    title=f'Relação entre {x_axis} e {y_axis}')
    return fig

@app.callback(
    Output('engagement-heatmap', 'figure'),
    Input('engagement-heatmap', 'id')
)
def update_engagement_heatmap(_):
    engagement_metrics = ['Views', 'Likes', 'Comments']
    engagement_metrics = [m for m in engagement_metrics if m in df.columns]
    
    if engagement_metrics:
        correlation_matrix = df[engagement_metrics].corr()
        fig = px.imshow(correlation_matrix, text_auto=True, 
                       title='Correlação entre Métricas de Engajamento no YouTube')
        return fig
    return {}

@app.callback(
    Output('top-songs-chart', 'figure'),
    Input('metric-selector', 'value')
)
def update_top_songs(metric):
    top_songs = df.nlargest(10, metric)[['Artist', 'Track', metric]]
    fig = px.bar(top_songs, x='Track', y=metric, hover_data=['Artist'],
                title=f'Top 10 Músicas por {metric}')
    fig.update_layout(xaxis_tickangle=-45)
    return fig

@app.callback(
    Output('key-distribution', 'figure'),
    Input('key-distribution', 'id')
)
def update_key_distribution(_):
    if 'Key' in df.columns:
        key_data = df['Key'].dropna()
        if not key_data.empty:
            key_order = sorted(key_data.unique())
            key_counts = df['Key'].value_counts().reindex(key_order).fillna(0)
            
            key_labels = {
                0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
                6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
            }
            
            labels = [key_labels.get(k, str(k)) for k in key_counts.index]
            
            fig = px.bar(x=labels, y=key_counts.values,
                        labels={'x': 'Key', 'y': 'Contagem'},
                        title='Distribuição de Chaves Musicais')
            return fig
    return {}

@app.callback(
    Output('views-vs-streams', 'figure'),
    Input('views-vs-streams', 'id')
)
def update_views_vs_streams(_):
    if 'Views' in df.columns and 'Stream' in df.columns:
        fig = px.scatter(df, x='Views', y='Stream', hover_data=['Artist', 'Track'],
                        title='Relação entre Visualizações no YouTube e Streams no Spotify')
        return fig
    return {}

if __name__ == '__main__':
    app.run(debug=True)