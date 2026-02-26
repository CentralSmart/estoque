const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Banco de Dados ──
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_gOHBXl4eoD3P@ep-super-dream-ac7nenqt-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Inicializar tabela (adiciona colunas extras além do snippet base) ──
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS estoque (
      id SERIAL PRIMARY KEY,
      titulo_lista VARCHAR(255) NOT NULL,
      nome_produto VARCHAR(255) NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 0,
      unidade VARCHAR(50) DEFAULT 'un',
      minimo INTEGER DEFAULT 0,
      codigo VARCHAR(100) DEFAULT '',
      nota TEXT DEFAULT '',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Adicionar colunas se não existirem (migration segura)
  const cols = [
    `ALTER TABLE estoque ADD COLUMN IF NOT EXISTS unidade VARCHAR(50) DEFAULT 'un'`,
    `ALTER TABLE estoque ADD COLUMN IF NOT EXISTS minimo INTEGER DEFAULT 0`,
    `ALTER TABLE estoque ADD COLUMN IF NOT EXISTS codigo VARCHAR(100) DEFAULT ''`,
    `ALTER TABLE estoque ADD COLUMN IF NOT EXISTS nota TEXT DEFAULT ''`,
    `ALTER TABLE estoque ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  ];
  for (const sql of cols) {
    await pool.query(sql).catch(() => {});
  }

  console.log('✅ Banco de dados pronto');
}

// ════════════════════════════════
//  ROTAS DE LISTAS
// ════════════════════════════════

// GET /api/listas — todas as listas distintas com contagem
app.get('/api/listas', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        titulo_lista,
        COUNT(*) AS total,
        SUM(CASE WHEN quantidade = 0 THEN 1 ELSE 0 END) AS zerados,
        SUM(CASE WHEN minimo > 0 AND quantidade > 0 AND quantidade <= minimo THEN 1 ELSE 0 END) AS baixos,
        MAX(atualizado_em) AS atualizado_em
      FROM estoque
      GROUP BY titulo_lista
      ORDER BY titulo_lista
    `);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/listas/:nome — deletar lista inteira
app.delete('/api/listas/:nome', async (req, res) => {
  try {
    await pool.query('DELETE FROM estoque WHERE titulo_lista = $1', [req.params.nome]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/listas/:nome — renomear lista
app.patch('/api/listas/:nome', async (req, res) => {
  try {
    const { novoNome } = req.body;
    await pool.query('UPDATE estoque SET titulo_lista = $1 WHERE titulo_lista = $2', [novoNome, req.params.nome]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════
//  ROTAS DE ITENS
// ════════════════════════════════

// GET /api/itens/:lista — itens de uma lista
app.get('/api/itens/:lista', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM estoque WHERE titulo_lista = $1 ORDER BY nome_produto',
      [req.params.lista]
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/itens — criar item
app.post('/api/itens', async (req, res) => {
  try {
    const { titulo_lista, nome_produto, quantidade, unidade, minimo, codigo, nota } = req.body;
    const r = await pool.query(
      `INSERT INTO estoque (titulo_lista, nome_produto, quantidade, unidade, minimo, codigo, nota, atualizado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`,
      [titulo_lista, nome_produto, quantidade||0, unidade||'un', minimo||0, codigo||'', nota||'']
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/itens/:id — atualizar item
app.patch('/api/itens/:id', async (req, res) => {
  try {
    const { nome_produto, quantidade, unidade, minimo, codigo, nota } = req.body;
    const r = await pool.query(
      `UPDATE estoque
       SET nome_produto=COALESCE($1,nome_produto),
           quantidade=COALESCE($2,quantidade),
           unidade=COALESCE($3,unidade),
           minimo=COALESCE($4,minimo),
           codigo=COALESCE($5,codigo),
           nota=COALESCE($6,nota),
           atualizado_em=NOW()
       WHERE id=$7 RETURNING *`,
      [nome_produto, quantidade, unidade, minimo, codigo, nota, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/itens/:id — deletar item
app.delete('/api/itens/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM estoque WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Serve frontend ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
}).catch(e => {
  console.error('❌ Erro ao conectar banco:', e.message);
  process.exit(1);
});
