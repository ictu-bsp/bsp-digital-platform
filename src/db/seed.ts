import { Pool } from "pg";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema";
import { hashPassword } from "../lib/auth/hash";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing from .env.local.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Tell TypeScript exactly what a new user looks like.
type NewUser = typeof users.$inferInsert;

async function main() {
  console.log("🌱 Seeding database...");

  // Seed councils (insert-if-missing — do NOT delete, scouts reference these)
  const councilNames = [
    "Laguna Council",
    "Quezon City Council",
    "Bulacan Council",
    "Cavite Council",
    "Manila Council",
  ];

  for (const name of councilNames) {
    await db.insert(councils).values({ name }).onConflictDoNothing();
  }

  // Reset database
  await db.execute(sql`
    TRUNCATE TABLE
      scouts,
      users,
      councils,
      sessions,
      scout_registrations
    RESTART IDENTITY CASCADE;
  `);

  //Seed Councils

  const councilNames = [
    "Abra Council",
    "Agusan Council",
    "Albay Council",
    "Baguio Council",
    "Batangas Council",
    "Benguet Council",
    "Bohol Council",
    "Bulacan Council",
    "Cagayan Council",
    "Camarines Norte Council",
    "Camarines Sur Council",
    "Cavite Council",
    "Cebu Council",
    "Davao Council",
    "Iloilo Council",
    "Laguna Council",
    "Leyte Council",
    "Manila Council",
    "Marikina Council",
    "Makati Council",
    "Negros Occidental Council",
    "Nueva Ecija Council",
    "Palawan Council",
    "Pampanga Council",
    "Pasig Council",
    "Quezon City Council",
    "Rizal Council",
    "Tacloban Council",
    "Taguig Council",
    "Zambales Council",
  ];

  await db.insert(councils).values(
    councilNames.map((name) => ({ name }))
  );

  console.log(`✅ Seeded ${councilNames.length} councils.`);

  // Seed Users

  const passwordHash = await hashPassword("Password123$");

  await db.insert(users).values([
    {
      email: "rjd.testscout1@bsp.ph",
      passwordHash: defaultPassword,
      firstName: "Reuben Jonn",
      middleName: null,
      lastName: "De Las Alas",
      birthdate: new Date("2003-06-02"),
    },
    {
      email: "mjs.testscout2@bsp.ph",
      passwordHash: defaultPassword,
      firstName: "Marc James",
      middleName: null,
      lastName: "Santos",
      birthdate: new Date("2004-05-29"),
    },
  ]);

  console.log("✅ Database seeded successfully.");

  await pool.end();
}

main().catch(async (error) => {
  console.error(error);

  await pool.end();

  process.exit(1);
});