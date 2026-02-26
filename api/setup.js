import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.TESTE);

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

    await sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS unidade VARCHAR(50) DEFAULT 'un'`.catch(()=>{});
    await sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS minimo INTEGER DEFAULT 0`.catch(()=>{});
    await sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS codigo VARCHAR(100) DEFAULT ''`.catch(()=>{});
    await sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS nota TEXT DEFAULT ''`.catch(()=>{});
    await sql`ALTER TABLE estoque ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.catch(()=>{});

    res.status(200).json({ ok: true, message: 'Tabela criada com sucesso!' });
  } catch (e) {
    console.error('setup error:', e);
    res.status(500).json({ error: e.message });
  }
}
