// src/db/seeds/adminUsers.seed.ts

import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { adminUsers } from "../schema/adminUsers";

import { hashPassword } from "../../lib/auth/hash";

const OFFICER_TEMPLATE = [
  { suffix: "chief.executive", fullName: "Chief Executive", role: "CHIEF_EXECUTIVE" as const },
  { suffix: "membership", fullName: "Membership Officer", role: "MEMBERSHIP_OFFICER" as const },
  { suffix: "activities", fullName: "Activities Officer", role: "ACTIVITIES_OFFICER" as const },
  { suffix: "finance", fullName: "Finance Officer", role: "FINANCE_OFFICER" as const },
  { suffix: "registrar", fullName: "Registrar", role: "REGISTRAR" as const },
  { suffix: "reports", fullName: "Reports Officer", role: "REPORTS_OFFICER" as const },
];

interface SeedOfficerSetInput {
  db: NodePgDatabase<typeof schema>;
  passwordHash: string;
  createdBy: string;
  usernamePrefix: string | null;
  scope: "COUNCIL" | "REGIONAL" | "NATIONAL";
  councilId?: string | null;
  regionId?: string | null;
}

// Seeds the standard 6-officer set (chief executive, membership, activities,
// finance, registrar, reports) for one admin tier -- a specific council, a
// specific region, or the national office. usernamePrefix keeps usernames
// globally unique across tiers (e.g. "bulacan.membership" vs the legacy
// unprefixed "membership" kept for the original test admin).
async function seedOfficerSet({
  db,
  passwordHash,
  createdBy,
  usernamePrefix,
  scope,
  councilId = null,
  regionId = null,
}: SeedOfficerSetInput) {
  let created = 0;

  for (const officer of OFFICER_TEMPLATE) {
    const username = usernamePrefix
      ? `${usernamePrefix}.${officer.suffix}`
      : officer.suffix;

    const existing = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.username, username),
    });

    if (existing) continue;

    await db.insert(adminUsers).values({
      scope,
      councilId,
      regionId,
      createdBy,
      username,
      passwordHash,
      fullName: officer.fullName,
      role: officer.role,
      active: true,
    });

    created++;
  }

  return created;
}

export async function seedAdminUsers(
  db: NodePgDatabase<typeof schema>
) {
  const passwordHash = await hashPassword("Admin123!");

  const andrei = await db.query.users.findFirst({
    where: eq(schema.users.email, "art.testadmin@bsp.ph"),
  });

  const bulacanAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, "bulacan.counciladmin@bsp.ph"),
  });

  const regionalAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, "centralluzon.regionaladmin@bsp.ph"),
  });

  const nationalAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, "nationalcouncil.admin@bsp.ph"),
  });

  if (!andrei || !bulacanAdmin || !regionalAdmin || !nationalAdmin) {
    throw new Error(
      "Expected admin accounts not found. Seed users first."
    );
  }

  if (!andrei.councilId || !bulacanAdmin.councilId || !regionalAdmin.regionId) {
    throw new Error(
      "Expected admin accounts are missing their council/region assignment."
    );
  }

  let totalCreated = 0;

  // Legacy test admin (Andrei) -- kept as-is, usernames unprefixed so
  // anything already relying on "membership" / "activities" / etc. still
  // works exactly as before. Now explicitly council-scoped (Manila Council)
  // so the new scoped officer login actually recognizes these as his.
  totalCreated += await seedOfficerSet({
    db,
    passwordHash,
    createdBy: andrei.id,
    usernamePrefix: null,
    scope: "COUNCIL",
    councilId: andrei.councilId,
  });

  // Bulacan Council -- council-tier example.
  totalCreated += await seedOfficerSet({
    db,
    passwordHash,
    createdBy: bulacanAdmin.id,
    usernamePrefix: "bulacan",
    scope: "COUNCIL",
    councilId: bulacanAdmin.councilId,
  });

  // Central Luzon Region -- regional-tier example, covers every council
  // in that region rather than just one.
  totalCreated += await seedOfficerSet({
    db,
    passwordHash,
    createdBy: regionalAdmin.id,
    usernamePrefix: "centralluzon",
    scope: "REGIONAL",
    regionId: regionalAdmin.regionId,
  });

  // National Council -- top tier, no council/region scoping at all.
  totalCreated += await seedOfficerSet({
    db,
    passwordHash,
    createdBy: nationalAdmin.id,
    usernamePrefix: "national",
    scope: "NATIONAL",
  });

  console.log(`✅ Seeded ${totalCreated} admin officer account(s) across 4 admin tiers.`);
}
