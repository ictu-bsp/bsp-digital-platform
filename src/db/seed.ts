//src/db/seed.ts

import { Pool } from "pg";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

import { seedCouncils } from "./seeds/councils.seed";
import { seedUsers } from "./seeds/users.seed";
import { seedActivities } from "./seeds/activities.seed";
import { seedScouts } from "./seeds/scouts.seed";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

async function main() {
  console.log("🌱 Seeding database...");

  await db.execute(sql`
    TRUNCATE TABLE
      activity_registrations,
      scouts,
      activities,
      users,
      councils,
      sessions,
      scout_registrations
    RESTART IDENTITY CASCADE;
  `);

  await seedCouncils(db);
  await seedUsers(db);
  await seedActivities(db);
  await seedScouts(db);

  console.log("🎉 Database seeded successfully.");

  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});