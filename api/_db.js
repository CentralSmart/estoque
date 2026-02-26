import { neon } from '@neondatabase/serverless';

// A variável de ambiente configurada na Vercel + Neon é "TESTE"
const sql = neon(process.env.TESTE);

export default sql;

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS estoque (
      id            SERIAL PRIMARY KEY,
      titulo_lista  VARCHAR(255) NOT NULL,
      nome_produto  VARCHAR(255) NOT NULL,
      quantidade    INTEGER      NOT NULL DEFAULT 0,
      unidade       VARCHAR(50)           DEFAULT 'un',
      minimo        INTEGER               DEFAULT 0,
      codigo        VARCHAR(100)          DEFAULT '',
      nota          TEXT                  DEFAULT '',
      criado_em     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
    )
  `;
  for (const q of [
    sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS unidade VARCHAR(50) DEFAULT 'un'`,
    sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS minimo INTEGER DEFAULT 0`,
    sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS codigo VARCHAR(100) DEFAULT ''`,
    sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS nota TEXT DEFAULT ''`,
    sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  ]) await q.catch(() => {});
}
