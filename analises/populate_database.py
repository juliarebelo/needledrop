import pandas as pd
import numpy as np
from supabase import create_client
import asyncio
import time
from typing import List, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Config:
    SUPABASE_URL = "https://qxkfkthihhlajmbiahqq.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ZrdGhpaGhsYWptYmlhaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAwNjcsImV4cCI6MjA3NjU1NjA2N30.Uv573OkhjVTAl0kniltycnF1uQtqW32G4KTXX2nYnBU"
    BATCH_SIZE = 1000
    DELAY_BETWEEN_BATCHES = 1 

class DatabasePopulator:
    def __init__(self):
        self.supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        self.artist_cache = {}
        self.processed_count = 0
        
    def load_and_preprocess_data(self, parquet_path: str) -> pd.DataFrame:
        logger.info("Carregando dados do arquivo Parquet...")
        
        try:
            df = pd.read_parquet(parquet_path)
            logger.info(f"Dados carregados: {len(df)} registros")
            logger.info(f"Colunas disponíveis: {list(df.columns)}")
            
            df = self.clean_data(df)
            
            return df
            
        except Exception as e:
            logger.error(f"Erro ao carregar dados: {e}")
            raise
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        title_col = None
        artist_col = None
        
        for col in df.columns:
            col_lower = col.lower()
            if 'track' in col_lower or 'title' in col_lower:
                title_col = col
            if 'artist' in col_lower:
                artist_col = col
        
        if title_col and artist_col:
            df = df.drop_duplicates(subset=[title_col, artist_col], keep='first')
            # Renomeia para padronizar
            df = df.rename(columns={title_col: 'title', artist_col: 'artist'})
        else:
            logger.warning("Colunas de título ou artista não encontradas, continuando sem remover duplicatas")
        
        numeric_columns = ['danceability', 'energy', 'valence', 'tempo', 'loudness']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = df[col].fillna(0)

        if len(df) > 1000:
            df = df.head(1000)
            logger.info("Limitado a 1000 registros para teste")
        
        return df
    
    def get_or_create_artist(self, artist_name: str) -> str:
        if artist_name in self.artist_cache:
            return self.artist_cache[artist_name]
        
        try:
            response = self.supabase.table('artistas')\
                .select('id')\
                .eq('nome_artistico', artist_name)\
                .execute()
            
            if response.data and len(response.data) > 0:
                artist_id = response.data[0]['id']
                self.artist_cache[artist_name] = artist_id
                return artist_id
            
            new_artist = {
                'nome_artistico': artist_name,
                'created_at': self.get_current_timestamp()
            }
            
            response = self.supabase.table('artistas').insert(new_artist).execute()
            
            if response.data and len(response.data) > 0:
                artist_id = response.data[0]['id']
                self.artist_cache[artist_name] = artist_id
                logger.info(f"Artista criado: {artist_name}")
                return artist_id
            else:
                raise Exception(f"Falha ao criar artista: {artist_name}")
                
        except Exception as e:
            logger.error(f"Erro ao processar artista {artist_name}: {e}")
            return "00000000-0000-0000-0000-000000000000"
    
    def get_current_timestamp(self):
        from datetime import datetime
        return datetime.now().isoformat()
    
    def prepare_song_data(self, row: pd.Series) -> Dict[str, Any]:
        song_data = {}
        
        for col in row.index:
            if col != 'Unnamed: 0' and col != 'created_at':
                value = row[col]
                
                if col in ['Licensed', 'official_video']:
                    if pd.isna(value):
                        song_data[col.lower()] = False
                    else:
                        song_data[col.lower()] = bool(float(value) > 0) if pd.notna(value) else False
                elif pd.isna(value):
                    if col in ['Views', 'Likes', 'Comments', 'Stream', 'Duration_ms', 'Key']:
                        song_data[col.lower()] = 0
                    else:
                        song_data[col.lower()] = ''
                else:
                    song_data[col.lower()] = value
        
        return song_data
    
    def insert_songs_batch(self, songs_batch: List[Dict[str, Any]]):
        try:
            response = self.supabase.table('musicas').insert(songs_batch).execute()
            
            if hasattr(response, 'error') and response.error:
                logger.error(f"Erro ao inserir lote: {response.error}")
                return False
            else:
                self.processed_count += len(songs_batch)
                logger.info(f"Lote inserido com sucesso. Total: {self.processed_count}")
                return True
                
        except Exception as e:
            logger.error(f"Exceção ao inserir lote: {e}")
            return False
    
    def populate_database(self, parquet_path: str):
        logger.info("Iniciando população do banco de dados...")
        
        start_time = time.time()
        
        try:
            df = self.load_and_preprocess_data(parquet_path)
            
            songs_batch = []
            
            for index, row in df.iterrows():
                try:
                    song_data = self.prepare_song_data(row)
                    songs_batch.append(song_data)
                    
                    if len(songs_batch) >= Config.BATCH_SIZE:
                        success = self.insert_songs_batch(songs_batch)
                        songs_batch = []
                        
                        if not success:
                            logger.warning("Problema ao inserir lote, continuando...")
                        
                        time.sleep(Config.DELAY_BETWEEN_BATCHES)
                        
                except Exception as e:
                    logger.error(f"Erro ao processar linha {index}: {e}")
                    continue
            
            if songs_batch:
                self.insert_songs_batch(songs_batch)
            
            end_time = time.time()
            elapsed_time = end_time - start_time
            
            logger.info(f"Processo concluído!")
            logger.info(f"Total de registros processados: {self.processed_count}")
            logger.info(f"Tempo total: {elapsed_time:.2f} segundos")
            
        except Exception as e:
            logger.error(f"Erro no processo principal: {e}")
            raise

    def test_connection(self):
        try:
            response = self.supabase.table('artistas').select('*').limit(1).execute()
            logger.info("✅ Conexão com Supabase estabelecida com sucesso!")
            return True
        except Exception as e:
            logger.error(f"❌ Erro na conexão com Supabase: {e}")
            return False

def main():
    import os
    populator = DatabasePopulator()
    
    if not populator.test_connection():
        return
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parquet_path = os.path.join(script_dir, 'Spotify_Youtube.parquet')
    populator.populate_database(parquet_path)

if __name__ == "__main__":
    main()