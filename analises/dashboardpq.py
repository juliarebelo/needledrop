import dash
from dash import dcc, html, Input, Output, callback, State
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import dash_bootstrap_components as dbc
import joblib
import shap
import base64
import io
import matplotlib.pyplot as plt

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
app.title = "Dashboard Analítico - Spotify & YouTube"

try:
    model_package = joblib.load('music_classifier_model.pkl')
    MODEL_LOADED = True
    print("✓ Modelo carregado com sucesso!")
except Exception as e:
    print(f"⚠ Modelo não encontrado: {e}")
    print("Execute 'python train_model.py' primeiro para treinar o modelo")
    MODEL_LOADED = False
    model_package = None

try:
    shap_package = joblib.load('shap_analysis.pkl')
    SHAP_LOADED = True
    print("✓ Análise SHAP carregada!")
except Exception as e:
    print(f"⚠ Análise SHAP não encontrada: {e}")
    SHAP_LOADED = False
    shap_package = None

try:
  
    df = pd.read_parquet('Spotify_Youtube.parquet')
    
    if df.empty:
        raise ValueError("Dataset está vazio")
        
except Exception as e:
    print(f"Erro ao carregar dataset: {e}")
    
    try:
        df = pd.read_csv('Spotify_Youtube.csv')
        print("CSV carregado como fallback")
    except:
        print("Não foi possível carregar nem Parquet nem CSV")
        df = pd.DataFrame()

def safe_clean_text(text):
    try:
        if isinstance(text, str):
            return text.replace('$', 'S').replace('\\', '/').replace('_', ' ')
        return text
    except:
        return text

if not df.empty:
    text_columns = ['Artist', 'Track', 'Album', 'Title', 'Channel']
    for col in text_columns:
        if col in df.columns:
            df[col] = df[col].apply(safe_clean_text)
    
    if 'Duration_ms' in df.columns:
        df['Duration_min'] = df['Duration_ms'] / 60000

def safe_value_counts(series, top_n=10):
    try:
        if series is not None and not series.empty:
            return series.value_counts().head(top_n)
        return pd.Series()
    except:
        return pd.Series()

def safe_mean(series):
    try:
        if series is not None and not series.empty:
            return series.mean()
        return 0
    except:
        return 0

def safe_nunique(series):
    try:
        if series is not None and not series.empty:
            return series.nunique()
        return 0
    except:
        return 0

def safe_isnull_sum(series):
    try:
        if series is not None:
            return series.isnull().sum()
        return 0
    except:
        return 0

COLOR_PALETTE = {
    'technical_primary': "#6A4C93",
    'technical_secondary': "#8B5FBF",
    'technical_tertiary': "#A67FCC",
    'technical_sequential': 'Purples',
    
    'musical_primary': "#2E758B",
    'musical_secondary': "#3A8CA8",
    'musical_tertiary': "#4ECDC4",
    'musical_sequential': 'Teal',
    
    'diverging': 'RdBu',
    'categorical': 'Viridis',
    'heatmap': 'Blues',
    
    'neutral_light': "#F8F9FA",
    'neutral_medium': "#E9ECEF",
    'neutral_dark': "#6C757D"
}

app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.H1("Dashboard Analítico - Spotify & YouTube", 
                       className="text-center mb-4"), width=12)
    ]),
    
    dbc.Row([
        dbc.Col([
            dbc.Tabs([
                dbc.Tab([
                    html.Div([
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Metadados do Dataset", 
                                                 style={'backgroundColor': COLOR_PALETTE['technical_primary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        html.P(f"Shape: {df.shape if not df.empty else 'N/A'}"),
                                        html.P(f"Total de registros: {len(df) if not df.empty else 0}"),
                                        html.P(f"Total de colunas: {len(df.columns) if not df.empty else 0}"),
                                        html.P(f"Memória utilizada: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB" if not df.empty else "N/A")
                                    ])
                                ], className="rounded-3")
                            ], width=4),
                            
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Tipos de Dados", 
                                                 style={'backgroundColor': COLOR_PALETTE['technical_secondary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        html.Div([
                                            html.P(f"Numéricas: {len(df.select_dtypes(include=[np.number]).columns)}"),
                                            html.P(f"Texto: {len(df.select_dtypes(include=['object']).columns)}"),
                                            html.P(f"Booleanas: {len(df.select_dtypes(include=['bool']).columns)}"),
                                            html.P(f"Datas: {len(df.select_dtypes(include=['datetime']).columns)}")
                                        ])
                                    ])
                                ], className="rounded-3")
                            ], width=4),
                            
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Qualidade dos Dados", 
                                                 style={'backgroundColor': COLOR_PALETTE['technical_tertiary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        html.P(f"Valores nulos totais: {df.isnull().sum().sum() if not df.empty else 0}"),
                                        html.P(f"Colunas com valores nulos: {(df.isnull().sum() > 0).sum() if not df.empty else 0}"),
                                        html.P(f"Valores duplicados: {df.duplicated().sum() if not df.empty else 0}"),
                                        html.P(f"Completude média: {(1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100:.1f}%" if not df.empty else "N/A")
                                    ])
                                ], className="rounded-3")
                            ], width=4)
                        ], className="mb-4"),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Distribuição de Valores Nulos por Coluna", 
                                                 style={'backgroundColor': COLOR_PALETTE['technical_primary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        dcc.Graph(id='null-values-chart')
                                    ])
                                ], className="rounded-3")
                            ], width=12)
                        ], className="mb-4"),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Detalhamento das Colunas - Guia de Interpretação", 
                                                 style={'backgroundColor': COLOR_PALETTE['technical_secondary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        dbc.Alert([
                                            html.H5("Como interpretar esta tabela:", className="alert-heading"),
                                            html.P("• COLUNA: Nome da característica analisada"),
                                            html.P("• TIPO: Formato dos dados (número, texto, etc)"),
                                            html.P("• VALORES ÚNICOS: Quantidade de valores diferentes"),
                                            html.P("• PREENCHIMENTO: Porcentagem de dados preenchidos"),
                                            html.P("• QUALIDADE: Avaliação da completude dos dados")
                                        ], color="info", className="mb-3 rounded-3"),
                                        
                                        html.Div(id='columns-details', style={'maxHeight': '400px', 'overflowY': 'auto'})
                                    ])
                                ], className="rounded-3")
                            ], width=12)
                        ])
                    ])
                ], label="INFORMAÇÕES TÉCNICAS",
                tab_style={
                    'margin': '5px', 
                    'border': '2px solid #6A4C93',
                    'borderRadius': '15px',
                    'fontWeight': 'bold', 
                    'fontSize': '14px', 
                    'padding': '10px'
                },
                active_tab_style={
                    'margin': '5px', 
                    'border': '2px solid #6A4C93', 
                    'borderRadius': '15px',
                    'backgroundColor': '#6A4C93', 
                    'color': 'white',
                    'fontWeight': 'bold', 
                    'fontSize': '14px', 
                    'padding': '10px'
                }),
                
                dbc.Tab([
                    html.Div([
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Resumo Artístico", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_primary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        html.P(f"Total de artistas: {safe_nunique(df.get('Artist')) if not df.empty else 0}"),
                                        html.P(f"Total de álbuns: {safe_nunique(df.get('Album')) if not df.empty else 0}"),
                                        html.P(f"Músicas únicas: {safe_nunique(df.get('Track')) if not df.empty else 0}"),
                                        html.P(f"Músicas por artista (média): {len(df)/safe_nunique(df.get('Artist')):.1f}" if not df.empty and 'Artist' in df.columns and safe_nunique(df.get('Artist')) > 0 else "N/A")
                                    ])
                                ], className="rounded-3")
                            ], width=4),
                            
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Estatísticas de Engajamento", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_secondary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        html.P(f"Média de visualizações: {safe_mean(df.get('Views')):,.0f}" if not df.empty and 'Views' in df.columns else "N/A"),
                                        html.P(f"Média de streams: {safe_mean(df.get('Stream')):,.0f}" if not df.empty and 'Stream' in df.columns else "N/A"),
                                        html.P(f"Média de likes: {safe_mean(df.get('Likes')):,.0f}" if not df.empty and 'Likes' in df.columns else "N/A"),
                                        html.P(f"Média de comentários: {safe_mean(df.get('Comments')):,.0f}" if not df.empty and 'Comments' in df.columns else "N/A")
                                    ])
                                ], className="rounded-3")
                            ], width=4),
                            
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Características Musicais", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_tertiary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        html.P(f"Duração média: {safe_mean(df.get('Duration_min')):.2f} min" if not df.empty and 'Duration_min' in df.columns else "N/A"),
                                        html.P(f"Energia média: {safe_mean(df.get('Energy')):.2f}" if not df.empty and 'Energy' in df.columns else "N/A"),
                                        html.P(f"Dançabilidade média: {safe_mean(df.get('Danceability')):.2f}" if not df.empty and 'Danceability' in df.columns else "N/A"),
                                        html.P(f"Tom emocional médio: {safe_mean(df.get('Valence')):.2f}" if not df.empty and 'Valence' in df.columns else "N/A")
                                    ])
                                ], className="rounded-3")
                            ], width=4)
                        ], className="mb-4"),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Top 10 Artistas com Mais Músicas", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_primary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        dcc.Graph(id='top-artists-chart', style={'height': '400px'})
                                    ])
                                ], className="rounded-3 h-100")
                            ], width=6),
                            
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Distribuição de Características Musicais", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_secondary'], 'color': 'white'}),
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
                                            clearable=False,
                                            className="rounded-3 mb-3"
                                        ),
                                        dcc.Graph(id='feature-distribution', style={'height': '350px'})
                                    ])
                                ], className="rounded-3 h-100")
                            ], width=6)
                        ], className="mb-4"),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Relação entre Variáveis Musicais", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_tertiary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        dbc.Row([
                                            dbc.Col([
                                                dcc.Dropdown(
                                                    id='x-axis-selector',
                                                    options=[
                                                        {'label': 'Danceability', 'value': 'Danceability'},
                                                        {'label': 'Energy', 'value': 'Energy'},
                                                        {'label': 'Loudness', 'value': 'Loudness'},
                                                        {'label': 'Valence', 'value': 'Valence'},
                                                        {'label': 'Speechiness', 'value': 'Speechiness'},
                                                        {'label': 'Acousticness', 'value': 'Acousticness'}
                                                    ],
                                                    value='Danceability',
                                                    clearable=False,
                                                    className="rounded-3"
                                                )
                                            ], width=6),
                                            dbc.Col([
                                                dcc.Dropdown(
                                                    id='y-axis-selector',
                                                    options=[
                                                        {'label': 'Energy', 'value': 'Energy'},
                                                        {'label': 'Danceability', 'value': 'Danceability'},
                                                        {'label': 'Loudness', 'value': 'Loudness'},
                                                        {'label': 'Valence', 'value': 'Valence'},
                                                        {'label': 'Speechiness', 'value': 'Speechiness'},
                                                        {'label': 'Acousticness', 'value': 'Acousticness'}
                                                    ],
                                                    value='Energy',
                                                    clearable=False,
                                                    className="rounded-3"
                                                )
                                            ], width=6)
                                        ]),
                                        dcc.Graph(id='variables-heatmap', style={'height': '350px'})
                                    ])
                                ], className="rounded-3 h-100")
                            ], width=6),
                            
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Correlação entre Métricas de Engajamento", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_primary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        dcc.Graph(id='engagement-heatmap', style={'height': '400px'})
                                    ])
                                ], className="rounded-3 h-100")
                            ], width=6)
                        ], className="mb-4"),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Top Músicas por Engajamento", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_secondary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        dcc.Dropdown(
                                            id='metric-selector',
                                            options=[
                                                {'label': 'Visualizações no YouTube', 'value': 'Views'},
                                                {'label': 'Likes no YouTube', 'value': 'Likes'},
                                                {'label': 'Streams no Spotify', 'value': 'Stream'},
                                                {'label': 'Comentários no YouTube', 'value': 'Comments'}
                                            ],
                                            value='Views',
                                            clearable=False,
                                            className="rounded-3 mb-3"
                                        ),
                                        dcc.Graph(id='top-songs-chart-horizontal', style={'height': '400px'})
                                    ])
                                ], className="rounded-3")
                            ], width=12)
                        ], className="mb-4"),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Distribuição de Chaves Musicais", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_tertiary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        dcc.Graph(id='key-distribution-horizontal', style={'height': '400px'})
                                    ])
                                ], className="rounded-3 h-100")
                            ], width=6),
                            
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Correlação entre Características Musicais", 
                                                 style={'backgroundColor': COLOR_PALETTE['musical_primary'], 'color': 'white'}),
                                    dbc.CardBody([
                                        dcc.Graph(id='music-features-heatmap', style={'height': '400px'})
                                    ])
                                ], className="rounded-3 h-100")
                            ], width=6)
                        ], className="mb-4")
                    ])
                ], label="ANÁLISE MUSICAL",
                tab_style={
                    'margin': '5px', 
                    'border': '2px solid #2E758B',
                    'borderRadius': '15px',
                    'fontWeight': 'bold', 
                    'fontSize': '14px', 
                    'padding': '10px'
                },
                active_tab_style={
                    'margin': '5px', 
                    'border': '2px solid #2E758B', 
                    'borderRadius': '15px',
                    'backgroundColor': '#2E758B', 
                    'color': 'white',
                    'fontWeight': 'bold', 
                    'fontSize': '14px', 
                    'padding': '10px'
                }),
                
                # NOVA ABA: CLASSIFICAÇÃO E SHAP
                dbc.Tab([
                    html.Div([
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Status do Modelo", 
                                                 style={'backgroundColor': '#1F618D', 'color': 'white'}),
                                    dbc.CardBody([
                                        html.Div(id='model-status-info')
                                    ])
                                ], className="rounded-3 mb-4")
                            ], width=12)
                        ]),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Classificador de Popularidade de Músicas", 
                                                 style={'backgroundColor': '#1F618D', 'color': 'white'}),
                                    dbc.CardBody([
                                        html.P("Insira os valores das características musicais para prever a popularidade:"),
                                        
                                        dbc.Row([
                                            dbc.Col([
                                                html.Label("Danceability (0-1):"),
                                                dcc.Input(id='input-danceability', type='number', 
                                                         min=0, max=1, step=0.01, value=0.5, 
                                                         className='form-control mb-2')
                                            ], width=3),
                                            dbc.Col([
                                                html.Label("Energy (0-1):"),
                                                dcc.Input(id='input-energy', type='number', 
                                                         min=0, max=1, step=0.01, value=0.5, 
                                                         className='form-control mb-2')
                                            ], width=3),
                                            dbc.Col([
                                                html.Label("Valence (0-1):"),
                                                dcc.Input(id='input-valence', type='number', 
                                                         min=0, max=1, step=0.01, value=0.5, 
                                                         className='form-control mb-2')
                                            ], width=3),
                                            dbc.Col([
                                                html.Label("Tempo (BPM):"),
                                                dcc.Input(id='input-tempo', type='number', 
                                                         min=40, max=200, step=1, value=120, 
                                                         className='form-control mb-2')
                                            ], width=3)
                                        ]),
                                        
                                        dbc.Row([
                                            dbc.Col([
                                                html.Label("Loudness (dB):"),
                                                dcc.Input(id='input-loudness', type='number', 
                                                         min=-60, max=0, step=0.1, value=-5, 
                                                         className='form-control mb-2')
                                            ], width=3),
                                            dbc.Col([
                                                html.Label("Speechiness (0-1):"),
                                                dcc.Input(id='input-speechiness', type='number', 
                                                         min=0, max=1, step=0.01, value=0.1, 
                                                         className='form-control mb-2')
                                            ], width=3),
                                            dbc.Col([
                                                html.Label("Acousticness (0-1):"),
                                                dcc.Input(id='input-acousticness', type='number', 
                                                         min=0, max=1, step=0.01, value=0.3, 
                                                         className='form-control mb-2')
                                            ], width=3),
                                            dbc.Col([
                                                html.Label("Instrumentalness (0-1):"),
                                                dcc.Input(id='input-instrumentalness', type='number', 
                                                         min=0, max=1, step=0.01, value=0, 
                                                         className='form-control mb-2')
                                            ], width=3)
                                        ]),
                                        
                                        dbc.Row([
                                            dbc.Col([
                                                html.Label("Liveness (0-1):"),
                                                dcc.Input(id='input-liveness', type='number', 
                                                         min=0, max=1, step=0.01, value=0.1, 
                                                         className='form-control mb-2')
                                            ], width=3),
                                            dbc.Col([
                                                html.Label("Duration (ms):"),
                                                dcc.Input(id='input-duration', type='number', 
                                                         min=30000, max=600000, step=1000, value=200000, 
                                                         className='form-control mb-2')
                                            ], width=3),
                                            dbc.Col([
                                                dbc.Button("Classificar Música", id='classify-button', 
                                                          color="primary", className="mt-4", 
                                                          style={'width': '100%'})
                                            ], width=6)
                                        ])
                                    ])
                                ], className="rounded-3 mb-4")
                            ], width=12)
                        ]),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Resultado da Classificação", 
                                                 style={'backgroundColor': '#27AE60', 'color': 'white'}),
                                    dbc.CardBody([
                                        html.Div(id='classification-result')
                                    ])
                                ], className="rounded-3 mb-4")
                            ], width=12)
                        ]),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Explicação Local (SHAP Force Plot)", 
                                                 style={'backgroundColor': '#E67E22', 'color': 'white'}),
                                    dbc.CardBody([
                                        html.Div(id='shap-force-plot')
                                    ])
                                ], className="rounded-3 mb-4")
                            ], width=12)
                        ]),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Explicabilidade Global - Feature Importance", 
                                                 style={'backgroundColor': '#8E44AD', 'color': 'white'}),
                                    dbc.CardBody([
                                        html.Img(id='shap-global-importance', style={'width': '100%'})
                                    ])
                                ], className="rounded-3 mb-4")
                            ], width=6),
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Beeswarm Plot - Distribuição de Impacto", 
                                                 style={'backgroundColor': '#8E44AD', 'color': 'white'}),
                                    dbc.CardBody([
                                        html.Img(id='shap-beeswarm', style={'width': '100%'})
                                    ])
                                ], className="rounded-3 mb-4")
                            ], width=6)
                        ]),
                        
                        dbc.Row([
                            dbc.Col([
                                dbc.Card([
                                    dbc.CardHeader("Gráfico Multiclasse - Importância por Classe", 
                                                 style={'backgroundColor': '#8E44AD', 'color': 'white'}),
                                    dbc.CardBody([
                                        html.Img(id='shap-multiclass', style={'width': '100%'})
                                    ])
                                ], className="rounded-3 mb-4")
                            ], width=12)
                        ])
                    ])
                ], label="CLASSIFICAÇÃO & SHAP",
                tab_style={
                    'margin': '5px', 
                    'border': '2px solid #1F618D',
                    'borderRadius': '15px',
                    'fontWeight': 'bold', 
                    'fontSize': '14px', 
                    'padding': '10px'
                },
                active_tab_style={
                    'margin': '5px', 
                    'border': '2px solid #1F618D', 
                    'borderRadius': '15px',
                    'backgroundColor': '#1F618D', 
                    'color': 'white',
                    'fontWeight': 'bold', 
                    'fontSize': '14px', 
                    'padding': '10px'
                })
            ])
        ], width=12)
])], fluid=True, style={'backgroundColor': COLOR_PALETTE['neutral_light']})

@app.callback(
    Output('null-values-chart', 'figure'),
    Input('null-values-chart', 'id')
)
def update_null_values_chart(_):
    try:
        if not df.empty:
            null_counts = df.isnull().sum()
            null_counts = null_counts[null_counts > 0].sort_values(ascending=True)
            
            if not null_counts.empty:
                fig = px.bar(x=null_counts.values, y=null_counts.index, 
                           orientation='h',
                           labels={'x': 'Quantidade de Valores Nulos', 'y': 'Coluna'},
                           title='Distribuição de Valores Nulos por Coluna',
                           color=null_counts.values,
                           color_continuous_scale=COLOR_PALETTE['technical_sequential'])
                return fig
    except Exception as e:
        print(f"Erro em update_null_values_chart: {e}")
    
    return go.Figure().add_annotation(text="Nenhum valor nulo encontrado!", x=0.5, y=0.5, showarrow=False)

@app.callback(
    Output('columns-details', 'children'),
    Input('columns-details', 'id')
)
def update_columns_details(_):
    try:
        if not df.empty:
            details = []
            for col in df.columns:
                if col.startswith('Unnamed'):
                    continue
                    
                null_count = safe_isnull_sum(df[col])
                null_percentage = (null_count / len(df)) * 100
                data_type = df[col].dtype
                unique_count = safe_nunique(df[col])
                completeness = 100 - null_percentage
                
                if completeness == 100:
                    quality_badge = dbc.Badge("Excelente", color="success", className="ms-2")
                elif completeness >= 90:
                    quality_badge = dbc.Badge("Boa", color="primary", className="ms-2")
                elif completeness >= 70:
                    quality_badge = dbc.Badge("Regular", color="warning", className="ms-2")
                else:
                    quality_badge = dbc.Badge("Crítica", color="danger", className="ms-2")
                
                example_value = "N/A"
                if not df[col].empty and not pd.isna(df[col].iloc[0]):
                    example_str = str(df[col].iloc[0])
                    example_value = example_str[:20] + "..." if len(example_str) > 20 else example_str
                
                details.append(
                    dbc.Row([
                        dbc.Col([
                            html.Strong(col),
                            html.Br(),
                            html.Small(f"Tipo: {data_type}", className="text-muted")
                        ], width=3),
                        dbc.Col(f"{unique_count:,}", width=2),
                        dbc.Col([
                            f"{completeness:.1f}%",
                            html.Br(),
                            html.Small(f"({null_count} nulos)", className="text-muted")
                        ], width=3),
                        dbc.Col(quality_badge, width=2),
                        dbc.Col(html.Small(example_value, className="text-muted"), width=2)
                    ], className="mb-2 border-bottom p-2")
                )
            
            header = dbc.Row([
                dbc.Col(html.Strong("COLUNA"), width=3),
                dbc.Col(html.Strong("VALORES ÚNICOS"), width=2),
                dbc.Col(html.Strong("PREENCHIMENTO"), width=3),
                dbc.Col(html.Strong("QUALIDADE"), width=2),
                dbc.Col(html.Strong("EXEMPLO"), width=2)
            ], className="mb-3 border-bottom p-2", style={'backgroundColor': COLOR_PALETTE['neutral_medium']})
            
            return [header] + details
    except Exception as e:
        print(f"Erro em update_columns_details: {e}")
    
    return html.P("Detalhes das colunas não disponíveis")

@app.callback(
    Output('top-artists-chart', 'figure'),
    Input('top-artists-chart', 'id')
)
def update_top_artists(_):
    try:
        if 'Artist' in df.columns and not df['Artist'].empty:
            artist_counts = safe_value_counts(df['Artist'], 10)
            if not artist_counts.empty:
                fig = px.bar(x=artist_counts.values, y=artist_counts.index, 
                           orientation='h',
                           labels={'x': 'Número de Músicas', 'y': 'Artista'},
                           title='Top 10 Artistas com Mais Músicas',
                           color=artist_counts.values,
                           color_continuous_scale=COLOR_PALETTE['musical_sequential'])
                fig.update_layout(yaxis={'categoryorder':'total ascending'})
                return fig
    except Exception as e:
        print(f"Erro em update_top_artists: {e}")
    
    return go.Figure().add_annotation(text="Dados não disponíveis", x=0.5, y=0.5, showarrow=False)

@app.callback(
    Output('feature-distribution', 'figure'),
    Input('feature-selector', 'value')
)
def update_feature_distribution(feature):
    try:
        if df.empty:
            return go.Figure().add_annotation(text="Dataset vazio", x=0.5, y=0.5, showarrow=False)

        # Tentar correspondência exata ou case-insensitive
        actual_col = feature if feature in df.columns else next((c for c in df.columns if c.lower() == str(feature).lower()), None)
        if not actual_col:
            return go.Figure().add_annotation(text=f"Coluna '{feature}' não encontrada", x=0.5, y=0.5, showarrow=False)

        series = pd.to_numeric(df[actual_col], errors='coerce')
        series = series.replace([np.inf, -np.inf], np.nan).dropna()
        if series.empty:
            return go.Figure().add_annotation(text=f"Sem valores válidos em '{actual_col}'", x=0.5, y=0.5, showarrow=False)

        fig = px.histogram(series, x=series, nbins=30,
                           title=f'Distribuição de {actual_col}',
                           color_discrete_sequence=[COLOR_PALETTE['musical_primary']])
        fig.update_layout(xaxis_title=actual_col, yaxis_title='Frequência')
        return fig
    except Exception as e:
        print(f"Erro em update_feature_distribution: {e}")
        return go.Figure().add_annotation(text="Erro ao gerar distribuição", x=0.5, y=0.5, showarrow=False)

@app.callback(
    Output('variables-heatmap', 'figure'),
    [Input('x-axis-selector', 'value'),
     Input('y-axis-selector', 'value')]
)
def update_variables_heatmap(x_axis, y_axis):
    try:
        if not df.empty and x_axis in df.columns and y_axis in df.columns:
            fig = px.density_heatmap(df, x=x_axis, y=y_axis,
                                    title=f'Densidade: {x_axis} vs {y_axis}',
                                    nbinsx=20, nbinsy=20,
                                    color_continuous_scale='Blues')
            return fig
    except Exception as e:
        print(f"Erro em update_variables_heatmap: {e}")
    
    return go.Figure().add_annotation(text="Dados não disponíveis", x=0.5, y=0.5, showarrow=False)

@app.callback(
    Output('engagement-heatmap', 'figure'),
    Input('engagement-heatmap', 'id')
)
def update_engagement_heatmap(_):
    try:
        if not df.empty:
            engagement_metrics = ['Views', 'Likes', 'Comments', 'Stream']
            engagement_metrics = [m for m in engagement_metrics if m in df.columns]
            
            if engagement_metrics:
                corr_data = df[engagement_metrics].replace([np.inf, -np.inf], np.nan).dropna()
                if not corr_data.empty:
                    correlation_matrix = corr_data.corr()
                    fig = px.imshow(correlation_matrix, 
                                   text_auto=True, 
                                   title='Correlação entre Métricas de Engajamento',
                                   aspect="auto",
                                   color_continuous_scale='Blues',
                                   zmin=-1, zmax=1)
                    return fig
    except Exception as e:
        print(f"Erro em update_engagement_heatmap: {e}")
    
    return go.Figure().add_annotation(text="Dados não disponíveis", x=0.5, y=0.5, showarrow=False)

@app.callback(
    Output('top-songs-chart-horizontal', 'figure'),
    Input('metric-selector', 'value')
)
def update_top_songs_horizontal(metric):
    try:
        if not df.empty and metric in df.columns:
            top_songs = df.nlargest(10, metric)[['Artist', 'Track', metric]].dropna()
            if not top_songs.empty:
                fig = px.bar(top_songs, x=metric, y='Track', orientation='h',
                            hover_data=['Artist'],
                            title=f'Top 10 Músicas por {metric}',
                            color=metric,
                            color_continuous_scale=COLOR_PALETTE['musical_sequential'])
                fig.update_layout(yaxis={'categoryorder':'total ascending'})
                return fig
    except Exception as e:
        print(f"Erro em update_top_songs_horizontal: {e}")
    
    return go.Figure().add_annotation(text="Dados não disponíveis", x=0.5, y=0.5, showarrow=False)

@app.callback(
    Output('key-distribution-horizontal', 'figure'),
    Input('key-distribution-horizontal', 'id')
)
def update_key_distribution_horizontal(_):
    try:
        if 'Key' in df.columns and not df.empty:
            key_data = df['Key'].dropna()
            if not key_data.empty:
                key_counts = key_data.value_counts()
                
                key_labels = {
                    0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
                    6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
                }
                
                labels = [key_labels.get(k, str(k)) for k in key_counts.index]
                
                fig = px.bar(x=key_counts.values, y=labels, orientation='h',
                            labels={'x': 'Contagem', 'y': 'Key'},
                            title='Distribuição de Chaves Musicais',
                            color=key_counts.values,
                            color_continuous_scale=COLOR_PALETTE['musical_sequential'])
                fig.update_layout(yaxis={'categoryorder':'total ascending'})
                return fig
    except Exception as e:
        print(f"Erro em update_key_distribution_horizontal: {e}")
    
    return go.Figure().add_annotation(text="Dados não disponíveis", x=0.5, y=0.5, showarrow=False)

@app.callback(
    Output('music-features-heatmap', 'figure'),
    Input('music-features-heatmap', 'id')
)
def update_music_features_heatmap(_):
    try:
        if not df.empty:
            music_features = ['Danceability', 'Energy', 'Loudness', 'Speechiness', 
                            'Acousticness', 'Instrumentalness', 'Liveness', 'Valence', 'Tempo']
            music_features = [m for m in music_features if m in df.columns]
            
            if music_features:
                corr_data = df[music_features].replace([np.inf, -np.inf], np.nan).dropna()
                if not corr_data.empty:
                    correlation_matrix = corr_data.corr()
                    fig = px.imshow(correlation_matrix, 
                                   text_auto=True, 
                                   title='Correlação entre Características Musicais',
                                   aspect="auto",
                                   color_continuous_scale='Blues',
                                   zmin=-1, zmax=1)
                    return fig
    except Exception as e:
        print(f"Erro em update_music_features_heatmap: {e}")
    
    return go.Figure().add_annotation(text="Dados não disponíveis", x=0.5, y=0.5, showarrow=False)

# ===== CALLBACKS PARA ABA DE CLASSIFICAÇÃO E SHAP =====

@app.callback(
    Output('model-status-info', 'children'),
    Input('model-status-info', 'id')
)
def update_model_status(_):
    if MODEL_LOADED and model_package:
        return html.Div([
            dbc.Alert([
                html.H5("✓ Modelo Carregado com Sucesso!", className="alert-heading"),
                html.Hr(),
                html.P(f"Tipo: Random Forest Classifier"),
                html.P(f"Acurácia no teste: {model_package['test_accuracy']:.4f}"),
                html.P(f"Classes: {', '.join(model_package['classes'])}"),
                html.P(f"Features: {len(model_package['feature_names'])}"),
                html.Details([
                    html.Summary("Ver melhores parâmetros"),
                    html.Pre(str(model_package['best_params']))
                ])
            ], color="success")
        ])
    else:
        return html.Div([
            dbc.Alert([
                html.H5("⚠ Modelo não carregado", className="alert-heading"),
                html.P("Execute o script de treinamento primeiro:"),
                html.Code("cd analises && python train_model.py", 
                         style={'display': 'block', 'padding': '10px', 'backgroundColor': '#f5f5f5'})
            ], color="warning")
        ])

@app.callback(
    [Output('classification-result', 'children'),
     Output('shap-force-plot', 'children')],
    Input('classify-button', 'n_clicks'),
    [State('input-danceability', 'value'),
     State('input-energy', 'value'),
     State('input-loudness', 'value'),
     State('input-speechiness', 'value'),
     State('input-acousticness', 'value'),
     State('input-instrumentalness', 'value'),
     State('input-liveness', 'value'),
     State('input-valence', 'value'),
     State('input-tempo', 'value'),
     State('input-duration', 'value')],
    prevent_initial_call=True
)
def classify_music(n_clicks, danceability, energy, loudness, speechiness, 
                   acousticness, instrumentalness, liveness, valence, tempo, duration):
    if not MODEL_LOADED or not model_package:
        return (html.Div([
            dbc.Alert("Modelo não carregado. Treine o modelo primeiro.", color="danger")
        ]), None)
    
    try:
        # Preparar input
        input_data = np.array([[
            danceability, energy, loudness, speechiness,
            acousticness, instrumentalness, liveness, valence, 
            tempo, duration
        ]])
        
        # Normalizar
        input_scaled = model_package['scaler'].transform(input_data)
        
        # Classificar
        prediction = model_package['model'].predict(input_scaled)[0]
        probabilities = model_package['model'].predict_proba(input_scaled)[0]
        
        # Resultado
        result_div = html.Div([
            html.H3(f"Predição: {prediction}", className="text-center mb-4"),
            html.Hr(),
            html.H5("Probabilidades por Classe:"),
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardBody([
                            html.H4(f"{prob*100:.1f}%", className="text-center"),
                            html.P(class_name, className="text-center text-muted")
                        ])
                    ], color="light" if class_name != prediction else "primary", 
                       inverse=class_name == prediction)
                ], width=4) for class_name, prob in zip(model_package['classes'], probabilities)
            ])
        ])
        
        # Gerar SHAP Force Plot
        if SHAP_LOADED and shap_package:
            try:
                explainer = shap_package['explainer']
                shap_values = explainer.shap_values(input_scaled)
                
                # Como é multiclasse, shap_values é uma lista
                # Vamos criar um force plot para a classe predita
                predicted_class_idx = list(model_package['classes']).index(prediction)
                
                # Force plot (salvar como HTML)
                shap.initjs()
                force_plot = shap.force_plot(
                    explainer.expected_value[predicted_class_idx],
                    shap_values[predicted_class_idx][0],
                    input_data[0],
                    feature_names=model_package['feature_names'],
                    matplotlib=True,
                    show=False
                )
                
                # Salvar como imagem
                plt.savefig('temp_force_plot.png', bbox_inches='tight', dpi=150)
                plt.close()
                
                # Codificar em base64
                with open('temp_force_plot.png', 'rb') as f:
                    encoded_image = base64.b64encode(f.read()).decode()
                
                force_plot_div = html.Div([
                    html.P(f"Explicação SHAP para a classe predita: {prediction}"),
                    html.Img(src=f'data:image/png;base64,{encoded_image}', 
                            style={'width': '100%'})
                ])
                
                return result_div, force_plot_div
                
            except Exception as e:
                print(f"Erro ao gerar force plot: {e}")
                return result_div, html.P(f"Erro ao gerar explicação: {str(e)}")
        
        return result_div, html.P("Análise SHAP não disponível")
        
    except Exception as e:
        return html.Div([
            dbc.Alert(f"Erro na classificação: {str(e)}", color="danger")
        ]), None

@app.callback(
    Output('shap-global-importance', 'src'),
    Input('shap-global-importance', 'id')
)
def load_shap_importance(_):
    try:
        with open('shap_feature_importance.png', 'rb') as f:
            encoded = base64.b64encode(f.read()).decode()
        return f'data:image/png;base64,{encoded}'
    except:
        return ""

@app.callback(
    Output('shap-beeswarm', 'src'),
    Input('shap-beeswarm', 'id')
)
def load_shap_beeswarm(_):
    try:
        with open('shap_beeswarm.png', 'rb') as f:
            encoded = base64.b64encode(f.read()).decode()
        return f'data:image/png;base64,{encoded}'
    except:
        return ""

@app.callback(
    Output('shap-multiclass', 'src'),
    Input('shap-multiclass', 'id')
)
def load_shap_multiclass(_):
    try:
        with open('shap_multiclass_bar.png', 'rb') as f:
            encoded = base64.b64encode(f.read()).decode()
        return f'data:image/png;base64,{encoded}'
    except:
        return ""

if __name__ == '__main__':
    app.run(debug=True)