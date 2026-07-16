import { Pool } from "pg";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { users, councils } from "./schema";
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

  const seedUsers: NewUser[] = [
    {
      email: "admin@bsp.ph",
      passwordHash,
      firstName: "System",
      middleName: null,
      lastName: "Administrator",
      suffix: null,
      birthdate: new Date("1990-01-01"),
      gender: "Other",
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
      avatarUrl: null,
    },

    {
      email: "art.testadmin@bsp.ph",
      passwordHash,
      firstName: "Andrei",
      middleName: "Ramos",
      lastName: "Tugaoen",
      suffix: null,
      birthdate: new Date("2004-10-12"),
      gender: "Male",
      avatarUrl: "/uploads/avatars/02685f3f-774c-4153-9409-6d988ecc126e.jpg",
      role: "COUNCIL_ADMIN",
      emailVerified: new Date(),
    },

    {
      email: "grd.testscout3@bsp.ph",
      passwordHash,
      firstName: "Giuliano",
      middleName: "Ramos",
      lastName: "De Guzman",
      suffix: null,
      birthdate: new Date("2002-10-27"),
      gender: "Male",
      avatarUrl: "/uploads/avatars/07d26f6d-12e7-406c-9404-152fb02fd1e9.jpg",
      role: "SCOUT",
      emailVerified: new Date(),
    },

    {
      email: "rmd.testscout1@bsp.ph",
      passwordHash,
      firstName: "Reuben Jonn",
      middleName: "Magnaye",
      lastName: "De Las Alas",
      suffix: null,
      birthdate: new Date("2003-06-02"),
      gender: "Male",
      avatarUrl: "/uploads/avatars/214899a4-13aa-40b0-84e9-e8f76688d047.jpg",
      role: "VISITOR",
      emailVerified: new Date(),
    },

    {
      email: "mjs.testscout2@bsp.ph",
      passwordHash,
      firstName: "Marc James",
      middleName: null,
      lastName: "Santos",
      suffix: null,
      birthdate: new Date("2004-05-29"),
      gender: "Male",
      avatarUrl: "/uploads/avatars/a9d46276-0e0a-409d-bd75-93cfbc9ece15.jpg",
      role: "VISITOR",
      emailVerified: new Date(),
    },
  ];

  await db.insert(users).values(seedUsers);

  console.log(`✅ Seeded ${seedUsers.length} users.`);
  console.log("🎉 Database seeded successfully.");

  await pool.end();
}

main().catch(async (error) => {
  console.error(error);

  await pool.end();

  process.exit(1);
});