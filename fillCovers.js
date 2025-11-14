const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qxkfkthihhlajmbiahqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ZrdGhpaGhsYWptYmlhaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAwNjcsImV4cCI6MjA3NjU1NjA2N30.Uv573OkhjVTAl0kniltycnF1uQtqW32G4KTXX2nYnBU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LASTFM_API_KEY = '8b6ae954b532dde9a4567228240e5a68';

// Configurações ajustáveis via variáveis de ambiente
const MAX_TO_PROCESS = Number(process.env.MAX_COVERS || 50000); // alvo: 50k
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 500); // menor lote para evitar timeout
const CONCURRENCY = Number(process.env.COVER_CONCURRENCY || 2); // paralelismo seguro para a API do Last.fm
const DELAY_MS = Number(process.env.COVER_DELAY_MS || 450); // atraso entre requests por worker
const START_AFTER_ID = process.env.START_AFTER_ID || null; // permite retomar após um id

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getAlbumCover(artist, album) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.error) return null;
    
    const coverUrl = data.album?.image?.[2]?.['#text'];
    
    return coverUrl || null;
    
  } catch (error) {
    console.error('Erro na API do Last.fm:', error);
    return null;
  }
}

async function fillAllMissingCovers() {
  try {
    console.log('🔄 Iniciando preenchimento de capas com keyset pagination...');
    let lastId = START_AFTER_ID;
    let batchIndex = 0;
    let totalProcessed = 0;
    let totalSuccess = 0;

    while (totalProcessed < MAX_TO_PROCESS) {
      batchIndex++;
      console.log(`\n📦 Lote #${batchIndex} — after id: ${lastId || 'INÍCIO'}, tamanho ${BATCH_SIZE}`);

      let query = supabase
        .from('musicas')
        .select('id, title, artist, album, url_capa')
        .is('url_capa', null)
        .order('id', { ascending: true })
        .limit(BATCH_SIZE);

      if (lastId) {
        query = query.gt('id', lastId);
      }

      const { data: musicas, error } = await query;

      if (error) {
        console.log('❌ Erro ao buscar músicas:', error);
        break;
      }
      if (!musicas || musicas.length === 0) {
        console.log('✅ Sem mais registros com url_capa = null.');
        break;
      }

      console.log(`🔢 Recebidos: ${musicas.length}`);

      let successCount = 0;
      let indexShared = 0;

      const worker = async (workerId) => {
        while (indexShared < musicas.length) {
          const i = indexShared++;
          const m = musicas[i];
          const label = `${m.artist} - ${m.album || m.title}`;
          console.log(`  [#${workerId}] ${i + 1}/${musicas.length} ${label}`);
          try {
            const albumName = m.album || m.title;
            const coverUrl = await getAlbumCover(m.artist, albumName);
            if (coverUrl) {
              const { error: upErr } = await supabase
                .from('musicas')
                .update({ url_capa: coverUrl })
                .eq('id', m.id);
              if (!upErr) {
                successCount++;
              } else {
                console.log('    ❌ Erro ao salvar');
              }
            } else {
              console.log('    ⚠️  Capa não encontrada');
            }
          } catch (e) {
            console.log('    ❌ Erro registro:', e?.message || e);
          }
          await sleep(DELAY_MS);
        }
      };

      await Promise.all(Array.from({ length: CONCURRENCY }, (_, k) => worker(k + 1)));
      console.log(`✅ Lote #${batchIndex} — Sucessos: ${successCount}/${musicas.length}`);

      totalProcessed += musicas.length;
      totalSuccess += successCount;
      lastId = musicas[musicas.length - 1].id; // avança keyset

      if (totalProcessed >= MAX_TO_PROCESS) {
        console.log('🛑 Limite máximo atingido.');
        break;
      }
      if (musicas.length < BATCH_SIZE) {
        console.log('🏁 Último lote incompleto — fim dos dados.');
        break;
      }
    }

    console.log(`\n🎉 FINALIZADO! Sucessos totais: ${totalSuccess}, processados: ${totalProcessed}`);
    console.log(`🔁 Para retomar depois deste ponto use START_AFTER_ID=${lastId}`);
  } catch (error) {
    console.error('❌ Erro no processo:', error);
  }
}

fillAllMissingCovers();
