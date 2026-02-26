import sql, { initDB } from './_db.js';

export default async function handler(req, res) {
  await initDB();

  // GET /api/itens?lista=Nome — itens de uma lista
  if (req.method === 'GET') {
    try {
      const lista = decodeURIComponent(req.query.lista);
      const rows = await sql`
        SELECT * FROM estoque WHERE titulo_lista = ${lista} ORDER BY nome_produto
      `;
      return res.json(rows);
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // POST /api/itens — cria item
  if (req.method === 'POST') {
    try {
      const { titulo_lista, nome_produto, quantidade, unidade, minimo, codigo, nota } = req.body;
      const rows = await sql`
        INSERT INTO estoque (titulo_lista, nome_produto, quantidade, unidade, minimo, codigo, nota, atualizado_em)
        VALUES (${titulo_lista}, ${nome_produto}, ${quantidade ?? 0}, ${unidade ?? 'un'},
                ${minimo ?? 0}, ${codigo ?? ''}, ${nota ?? ''}, NOW())
        RETURNING *
      `;
      return res.json(rows[0]);
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
