// Verificar se há capas no banco
import { supabase } from './services/supabase.ts';

async function checkCovers() {
  const { data, error } = await supabase
    .from('musicas')
    .select('id, artist, album, url_capa')
    .not('url_capa', 'is', null)
    .limit(10);

  if (error) {
    console.error('Erro:', error);
  } else {
    console.log(`Total com capas: ${data?.length || 0}`);
    console.log('Exemplos:', data);
  }
}

checkCovers();
