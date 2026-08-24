//src/db/seeds/users.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "../schema";
import { hashPassword } from "../../lib/auth/hash";

// Turns a council/region name into a short, unique, email/username-safe
// slug. Guaranteed-unique across the actual seeded names in practice, but
// disambiguateSlug() below still guards against any accidental collision.
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "");
}

function disambiguateSlug(base: string, used: Set<string>): string {
  let slug = base;
  let counter = 2;
  while (used.has(slug)) {
    slug = `${base}${counter}`;
    counter++;
  }
  used.add(slug);
  return slug;
}

// "Bulacan Council" -> { orgName: "Bulacan", orgSuffix: "Council" }
// "Bislig City Associate Council" -> { orgName: "Bislig City", orgSuffix: "Associate Council" }
// Falls back to using the whole name if no known suffix matches.
function splitCouncilName(name: string): { orgName: string; orgSuffix: string } {
  const suffixes = ["Associate Council", "Council"];
  for (const suffix of suffixes) {
    if (name.endsWith(suffix)) {
      return {
        orgName: name.slice(0, -suffix.length).trim() || name,
        orgSuffix: suffix,
      };
    }
  }
  return { orgName: name, orgSuffix: "Council" };
}

// "Central Luzon Region Coordination Office" -> "Central Luzon"
function splitRegionName(name: string): { orgName: string; orgSuffix: string } {
  const suffix = "Region Coordination Office";
  if (name.endsWith(suffix)) {
    return { orgName: name.slice(0, -suffix.length).trim() || name, orgSuffix: "Region" };
  }
  return { orgName: name, orgSuffix: "Region" };
}

export async function seedUsers(
  db: NodePgDatabase<typeof schema>
) {
  const passwordHash = await hashPassword("Password123$");

  const [manilaCouncil] = await db
    .select()
    .from(schema.councils)
    .where(eq(schema.councils.name, "Manila"));

  if (!manilaCouncil) {
    throw new Error(
      "Expected 'Manila Council' not found while seeding users. Seed regions and councils first."
    );
  }

  const allCouncils = await db.select().from(schema.councils);
  const allRegions = await db.select().from(schema.regions);

  const usedSlugs = new Set<string>();

  // One council admin account per council, except Manila Council -- that
  // one is Andrei's (the legacy test admin), seeded separately below so we
  // don't end up with two competing council admins for the same council.
  const councilAdminUsers: typeof schema.users.$inferInsert[] = allCouncils
    .filter((council) => council.id !== manilaCouncil.id)
    .map((council) => {
      const { orgName, orgSuffix } = splitCouncilName(council.name);
      const slug = disambiguateSlug(slugify(orgName), usedSlugs);

      return {
        email: `${slug}.counciladmin@bsp.ph`,
        passwordHash,
        firstName: orgName,
        middleName: null,
        lastName: orgSuffix,
        birthdate: new Date("1990-01-01"),
        sex: "Other",
        role: "COUNCIL_ADMIN",
        councilId: council.id,
        avatarUrl: null,
        emailVerified: new Date(),
      };
    });

  // One regional admin account per region, except the "National Office"
  // region row, which is a placeholder with no councils under it -- the
  // national tier is represented separately by NATIONAL_ADMIN below.
  const regionalAdminUsers: typeof schema.users.$inferInsert[] = allRegions
    .filter((region) => region.name !== "National Office")
    .map((region) => {
      const { orgName, orgSuffix } = splitRegionName(region.name);
      const slug = disambiguateSlug(slugify(orgName), usedSlugs);

      return {
        email: `${slug}.regionaladmin@bsp.ph`,
        passwordHash,
        firstName: orgName,
        middleName: null,
        lastName: orgSuffix,
        birthdate: new Date("1990-01-01"),
        sex: "Other",
        role: "REGIONAL_ADMIN",
        regionId: region.id,
        avatarUrl: null,
        emailVerified: new Date(),
      };
    });

  const users: typeof schema.users.$inferInsert[] = [
    {
      email: "admin@bsp.ph",
      passwordHash,
      firstName: "System",
      middleName: null,
      lastName: "Administrator",
      suffix: null,
      birthdate: new Date("1990-01-01"),
      sex: "Other",
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
      sex: "Male",
      role: "COUNCIL_ADMIN",
      councilId: manilaCouncil.id,
      avatarUrl:
        "/uploads/avatars/02685f3f-774c-4153-9409-6d988ecc126e.jpg",
      emailVerified: new Date(),
    },

    {
      email: "nationalcouncil.admin@bsp.ph",
      passwordHash,
      firstName: "National",
      middleName: null,
      lastName: "Council",
      birthdate: new Date("1990-01-01"),
      sex: "Other",
      role: "NATIONAL_ADMIN",
      avatarUrl: null,
      emailVerified: new Date(),
    },

    ...councilAdminUsers,
    ...regionalAdminUsers,

    {
      email: "grd.testscout3@bsp.ph",
      passwordHash,
      firstName: "Giuliano",
      middleName: "Regis",
      lastName: "De Guzman",
      birthdate: new Date("2002-10-27"),
      sex: "Male",
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
      sex: "Male",
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
      sex: "Male",
      role: "SCOUT",
      avatarUrl:
        "/uploads/avatars/748499266_1045264668022779_5816455208986934213_n.jpg",
      emailVerified: new Date(),
    },
  ];

  await db.insert(schema.users).values(users);

  console.log(
    `✅ Seeded ${users.length} users (${councilAdminUsers.length} council admins, ${regionalAdminUsers.length} regional admins, plus core test accounts).`
  );
}
