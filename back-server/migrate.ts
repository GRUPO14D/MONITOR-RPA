import { initDb } from './db';

initDb()
  .then(() => {
    console.log('[OK] DB migrado com sucesso');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[ERRO] Falha na migração:', err.message);
    process.exit(1);
  });
