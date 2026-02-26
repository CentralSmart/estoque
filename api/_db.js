import { neon } from '@neondatabase/serverless';

if (!process.env.TESTE) {
  throw new Error('Variável de ambiente TESTE não encontrada');
}

const sql = neon(process.env.TESTE);
export default sql;
