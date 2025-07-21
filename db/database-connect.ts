import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import Logger from "./configs/logger";

const databaseLogger = new Logger("database-connect");

const pool = new Pool({
  // host: process.env.POSTGRES_HOST,
  // port: Number(process.env.POSTGRES_PORT),
  // user: process.env.POSTGRES_USER,
  // database: process.env.POSTGRES_DB,
  // password: process.env.POSTGRES_PASSWORD,
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;

/**
 * Execute a SQL query using a pooled client.
 * @param text - The SQL query text.
 * @param params - The query parameters.
 * @returns The query result.
 */
export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    const res: QueryResult<T> = await client.query<T>(text, params);
    return res;
  } catch (err: any) {
    databaseLogger.error("Query failed", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Execute a SQL query using a specific client.
 * @param client - The client instance.
 * @param text - The SQL query text.
 * @param params - The query parameters.
 * @returns The query result.
 */
export async function queryWithClient<T extends QueryResultRow>(
  client: PoolClient,
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  try {
    const res: QueryResult<T> = await client.query<T>(text, params);
    return res;
  } catch (err: any) {
    databaseLogger.error("Query error:", err);
    throw err;
  }
}
