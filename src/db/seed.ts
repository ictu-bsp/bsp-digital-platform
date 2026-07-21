//src/db/seed.ts

import { Pool } from "pg";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { seedUsers } from "./seeds/users.seed";
import { seedScouts } from "./seeds/scouts.seed";
import { seedRegions } from "./seeds/regions.seed";
import { drizzle } from "drizzle-orm/node-postgres";
import { seedCouncils } from "./seeds/councils.seed";
import { seedAdminUsers} from "./seeds/adminUsers.seed";
import { seedActivities } from "./seeds/activities.seed";
import { seedScoutApplications } from "./seeds/scoutApplications.seed";

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
      scout_applications,
      scouts,
      activities,
      admin_users,
      sessions,
      users,
      councils,
      regions
    RESTART IDENTITY CASCADE;
  `);

  await seedRegions(db);
  await seedCouncils(db);
  await seedUsers(db);

  await seedAdminUsers(db);

  await seedScouts(db);
  await seedScoutApplications(db);
  await seedActivities(db);

  console.log("🎉 Database seeded successfully.");

  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});