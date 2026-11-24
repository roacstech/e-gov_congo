import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable";

const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined;
};

export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
