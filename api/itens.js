import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.TESTE);

    if (req.method === 'GET') {
      const lista = decodeURIComponent(req.query.lista || '');
      const rows = await sql`
        SELECT * FROM estoque
        WHERE titulo_lista = ${lista}
        ORDER BY nome_produto
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { titulo_lista, nome_produto, quantidade, unidade, minimo, codigo, nota } = req.body;
      const rows = await sql`
        INSERT INTO estoque
          (titulo_lista, nome_produto, quantidade, unidade, minimo, codigo, nota, atualizado_em)
        VALUES
          (${titulo_lista}, ${nome_produto}, ${quantidade ?? 0}, ${unidade ?? 'un'},
           ${minimo ?? 0}, ${codigo ?? ''}, ${nota ?? ''}, NOW())
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('itens error:', e);
    res.status(500).json({ error: e.message });
  }
}
