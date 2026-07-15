import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, councils } from "./schema";
import { hashPassword } from "../lib/auth/hash";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing from .env.local.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

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

  // Clear existing users
  await db.delete(users);

  const defaultPassword = await hashPassword("Password123!");

  await db.insert(users).values({
    email: "rjd.testscout1@bsp.ph",
    passwordHash: defaultPassword,
    firstName: "Reuben Jonn",
    middleName: null,
    lastName: "De Las Alas",
    gender: "male",
    birthdate: new Date("2003-06-02"),
  });

  await db.insert(users).values({
    email: "mjs.testscout2@bsp.ph",
    passwordHash: defaultPassword,
    firstName: "Marc James",
    middleName: null,
    lastName: "Santos",
    gender: "male",
    birthdate: new Date("2004-05-29"),
  });

  console.log("Database seeded successfully.");

  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});