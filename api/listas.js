import sql, { initDB } from './_db.js';

export default async function handler(req, res) {
  await initDB();

  // GET /api/listas — todas as listas com contagem
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT titulo_lista,
               COUNT(*)::int                                                           AS total,
               SUM(CASE WHEN quantidade <= 0 THEN 1 ELSE 0 END)::int                 AS zerados,
               SUM(CASE WHEN minimo > 0 AND quantidade > 0 AND quantidade <= minimo
                        THEN 1 ELSE 0 END)::int                                       AS baixos,
               MAX(atualizado_em)                                                      AS atualizado_em
        FROM estoque
        GROUP BY titulo_lista
        ORDER BY titulo_lista
      `;
      return res.json(rows);
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
