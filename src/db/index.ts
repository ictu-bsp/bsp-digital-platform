import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleEdge } from 'drizzle-orm/neon-serverless';
import { Pool } from 'pg';
import { Pool as NeonPool } from '@neondatabase/serverless';
import * as schema from './schema';

let databaseClient;

if (process.env.NODE_ENV !== 'production' || !process.env.CF_PAGES) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  databaseClient = drizzle(pool, { schema });
} else {
  const pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
  });
  databaseClient = drizzleEdge(pool, { schema });
}
//
export const db = databaseClient;