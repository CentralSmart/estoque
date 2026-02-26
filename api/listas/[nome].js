import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.TESTE);
    const nome = decodeURIComponent(req.query.nome);

    if (req.method === 'DELETE') {
      await sql`DELETE FROM estoque WHERE titulo_lista = ${nome}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PATCH') {
      const { novoNome } = req.body;
      await sql`UPDATE estoque SET titulo_lista = ${novoNome} WHERE titulo_lista = ${nome}`;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('listas/[nome] error:', e);
    res.status(500).json({ error: e.message });
  }
}
