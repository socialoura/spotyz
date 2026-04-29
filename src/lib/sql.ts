import { neon, Pool } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;

const neonSql = neon(DATABASE_URL);
const pool = new Pool({ connectionString: DATABASE_URL });

type QueryResult = { rows: Record<string, unknown>[]; rowCount: number };

type SqlTaggedTemplate = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<QueryResult>;
  query: (text: string, params?: unknown[]) => Promise<QueryResult>;
};

const taggedSql: SqlTaggedTemplate = Object.assign(
  async (strings: TemplateStringsArray, ...values: unknown[]): Promise<QueryResult> => {
    const rows = await neonSql(strings, ...values);
    return { rows: rows as Record<string, unknown>[], rowCount: rows.length };
  },
  {
    query: async (text: string, params?: unknown[]): Promise<QueryResult> => {
      const result = await pool.query(text, params);
      return { rows: result.rows as Record<string, unknown>[], rowCount: result.rowCount ?? 0 };
    },
  }
);

export { taggedSql as sql };
