import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.TESTE);
    const id = parseInt(req.query.id);

    if (req.method === 'PATCH') {
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
      return res.status(200).json(rows[0] ?? {});
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM estoque WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('itens/[id] error:', e);
    res.status(500).json({ error: e.message });
  }
}
