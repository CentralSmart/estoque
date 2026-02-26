import sql, { initDB } from './_db.js';

export default async function handler(req, res) {
  await initDB();
  const nome = decodeURIComponent(req.query.nome);

  // DELETE /api/listas/[nome] — apaga lista inteira
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM estoque WHERE titulo_lista = ${nome}`;
      return res.json({ ok: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // PATCH /api/listas/[nome] — renomeia lista
  if (req.method === 'PATCH') {
    try {
      const { novoNome } = req.body;
      await sql`UPDATE estoque SET titulo_lista = ${novoNome} WHERE titulo_lista = ${nome}`;
      return res.json({ ok: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
