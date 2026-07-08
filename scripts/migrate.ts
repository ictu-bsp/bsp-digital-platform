import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

console.log(process.env.DATABASE_URL);

import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log("Running migrations...");

  await migrate(db, {
    migrationsFolder: "./src/db/migrations",
  });

  console.log("Done");

  await pool.end();
}

main().catch(console.error);