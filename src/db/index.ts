//src/db/index.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleEdge } from 'drizzle-orm/neon-serverless';
import { Pool } from 'pg';
import { Pool as NeonPool } from '@neondatabase/serverless';
import * as schema from './schema';
import * as relations from './relations/index'; // 1. Import your relations barrel or files

let databaseClient;

// 2. Combine table schemas and relations together inside the schema option
const fullSchema = { ...schema, ...relations };

if (process.env.NODE_ENV !== 'production' || !process.env.CF_PAGES) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  databaseClient = drizzle(pool, { schema: fullSchema });
} else {
  const pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
  });
  databaseClient = drizzleEdge(pool, { schema: fullSchema });
}

export const db = databaseClient;