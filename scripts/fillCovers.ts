import { albumCoverService } from '../services/albumCoverService';

/**
 * Script para preencher capas de álbuns faltantes
 * 
 * Como usar:
 * 1. No terminal: npx ts-node scripts/fillCovers.ts
 * 2. Ou adicione ao package.json: "fill-covers": "ts-node scripts/fillCovers.ts"
 */

async function main() {
  console.log('🚀 Iniciando preenchimento de capas...\n');
  
  await albumCoverService.fillAllMissingCovers();
  
  console.log('\n✅ Processo concluído!');
}

main().catch(console.error);
