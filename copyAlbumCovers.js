const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qxkfkthihhlajmbiahqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ZrdGhpaGhsYWptYmlhaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAwNjcsImV4cCI6MjA3NjU1NjA2N30.Uv573OkhjVTAl0kniltycnF1uQtqW32G4KTXX2nYnBU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const INITIAL_BATCH_SIZE = Number(process.env.BATCH_SIZE || 100); // menor para evitar timeout
const MAX_BATCH_SIZE = Number(process.env.MAX_BATCH_SIZE || 300);
let currentBatchSize = INITIAL_BATCH_SIZE;
const RETRY_LIMIT = Number(process.env.RETRY_LIMIT || 3);
const RETRY_DELAY_MS = Number(process.env.RETRY_DELAY_MS || 500);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const fs = require('fs');
const PROGRESS_FILE = 'copyAlbumCovers.progress.json';

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const raw = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) { console.error('⚠️ Falha ao ler progresso:', e.message); }
  return { lastId: process.env.START_AFTER_ID || null };
}

function saveProgress(obj) {
  try { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(obj)); } catch (e) { console.error('⚠️ Falha ao salvar progresso:', e.message); }
}

async function copyAlbumCoversToUrlCapa() {
  try {
    console.log('🔄 Iniciando cópia de album_cover para url_capa...');
    
    let totalProcessed = 0;
    let totalUpdated = 0;
    let { lastId } = loadProgress();
    console.log('▶️ Retomando a partir de lastId:', lastId || 'INÍCIO');

    while (true) {
      // Buscar registros com album_cover preenchido e url_capa null
      let query = supabase
        .from('musicas')
        .select('id, album_cover', { count: 'exact' })
        .not('album_cover', 'is', null)
        .is('url_capa', null)
        .order('id', { ascending: true })
        .limit(currentBatchSize);

      if (lastId) {
        query = query.gt('id', lastId);
      }

      const { data: musicas, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar músicas:', error);
        break;
      }

      if (!musicas || musicas.length === 0) {
        console.log('✅ Sem mais registros para processar.');
        break;
      }

      console.log(`\n📦 Lote: ${musicas.length} registros (batchSize=${currentBatchSize})`);

      // Atualizar em lote
      for (const musica of musicas) {
        let attempts = 0;
        while (attempts < RETRY_LIMIT) {
          attempts++;
          try {
            const { error: updateError } = await supabase
              .from('musicas')
              .update({ url_capa: musica.album_cover })
              .eq('id', musica.id);

            if (updateError) {
              console.error(`❌ Erro ao atualizar ${musica.id} (tentativa ${attempts}):`, updateError.message);
              if (attempts < RETRY_LIMIT) await sleep(RETRY_DELAY_MS);
            } else {
              totalUpdated++;
              break; // sucesso
            }
          } catch (e) {
            console.error(`❌ Exceção ao atualizar ${musica.id} (tentativa ${attempts}):`, e.message || e);
            if (attempts < RETRY_LIMIT) await sleep(RETRY_DELAY_MS);
          }
        }
      }

      totalProcessed += musicas.length;
      lastId = musicas[musicas.length - 1].id;
      saveProgress({ lastId });
      console.log(`🔁 Progresso salvo. START_AFTER_ID=${lastId}`);

      // Ajuste adaptativo: se sucesso alto e sem erros, aumenta batchSize até limite
      if (musicas.length === currentBatchSize && currentBatchSize < MAX_BATCH_SIZE) {
        currentBatchSize = Math.min(MAX_BATCH_SIZE, currentBatchSize + 50);
        console.log(`⬆️ Aumentando batchSize para ${currentBatchSize}`);
      }

      console.log(`✅ Lote concluído. Total processado: ${totalProcessed}, Total atualizado: ${totalUpdated}`);

      if (musicas.length < currentBatchSize) {
        console.log('🏁 Último lote concluído.');
        break;
      }
    }

    console.log(`\n🎉 FINALIZADO! Total de registros atualizados: ${totalUpdated}`);
    console.log('📄 Arquivo de progresso:', PROGRESS_FILE);
  } catch (error) {
    console.error('❌ Erro no processo:', error);
    if (error?.message?.includes('timeout')) {
      console.error('🛑 Timeout detectado. Tente reduzir BATCH_SIZE ou executar SQL direto no painel Supabase.');
    }
  }
}

copyAlbumCoversToUrlCapa();
