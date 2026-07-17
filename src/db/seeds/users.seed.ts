//src/db/seeds/users.seeds.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { hashPassword } from "../../lib/auth/hash";

export async function seedUsers(
  db: NodePgDatabase<typeof schema>
) {
  const passwordHash = await hashPassword("Password123$");

  const users: typeof schema.users.$inferInsert[] = [
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
      birthdate: new Date("2004-10-12"),
      gender: "Male",
      role: "COUNCIL_ADMIN",
      avatarUrl:
        "/uploads/avatars/02685f3f-774c-4153-9409-6d988ecc126e.jpg",
      emailVerified: new Date(),
    },

    {
      email: "grd.testscout3@bsp.ph",
      passwordHash,
      firstName: "Giuliano",
      middleName: "Regis",
      lastName: "De Guzman",
      birthdate: new Date("2002-10-27"),
      gender: "Male",
      role: "SCOUT",
      avatarUrl:
        "/uploads/avatars/07d26f6d-12e7-406c-9404-152fb02fd1e9.jpg",
      emailVerified: new Date(),
    },

    {
      email: "rmd.testscout1@bsp.ph",
      passwordHash,
      firstName: "Reuben Jonn",
      middleName: "Magnaye",
      lastName: "De Las Alas",
      birthdate: new Date("2003-06-02"),
      gender: "Male",
      role: "VISITOR",
      avatarUrl:
        "/uploads/avatars/214899a4-13aa-40b0-84e9-e8f76688d047.jpg",
      emailVerified: new Date(),
    },

    {
      email: "mjs.testscout2@bsp.ph",
      passwordHash,
      firstName: "Marc James",
      lastName: "Santos",
      middleName: null,
      birthdate: new Date("2004-05-29"),
      gender: "Male",
      role: "SCOUT",
      avatarUrl:
        "/uploads/avatars/a9d46276-0e0a-409d-bd75-93cfbc9ece15.jpg",
      emailVerified: new Date(),
    },
  ];

  await db.insert(schema.users).values(users);

  console.log(`✅ Seeded ${users.length} users.`);
}