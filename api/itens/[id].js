import sql, { initDB } from './_db.js';

export default async function handler(req, res) {
  await initDB();
  const id = parseInt(req.query.id);

  // PATCH /api/itens/[id] — atualiza campo(s)
  if (req.method === 'PATCH') {
    try {
      const { nome_produto, quantidade, unidade, minimo, codigo, nota } = req.body;
      const rows = await sql`
        UPDATE estoque SET
          nome_produto  = COALESCE(${nome_produto  ?? null}, nome_produto),
          quantidade    = COALESCE(${quantidade    ?? null}::int, quantidade),
          unidade       = COALESCE(${unidade       ?? null}, unidade),
          minimo        = COALESCE(${minimo        ?? null}::int, minimo),
          codigo        = COALESCE(${codigo        ?? null}, codigo),
          nota          = COALESCE(${nota          ?? null}, nota),
          atualizado_em = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return res.json(rows[0] ?? {});
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // DELETE /api/itens/[id] — remove item
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM estoque WHERE id = ${id}`;
      return res.json({ ok: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
