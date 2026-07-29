// src/db/seeds/adminUsers.seed.ts
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { adminUsers, councils, regions, users } from "../schema";
import { hashPassword } from "../../lib/auth/hash";

const SYSTEM_USER_TEMPLATE = [
  { suffix: "chief.executive", fullName: "Chief Executive", role: "CHIEF_EXECUTIVE" as const },
  { suffix: "membership", fullName: "Membership Officer", role: "MEMBERSHIP_OFFICER" as const },
  { suffix: "activities", fullName: "Activities Officer", role: "ACTIVITIES_OFFICER" as const },
  { suffix: "finance", fullName: "Finance Officer", role: "FINANCE_OFFICER" as const },
  { suffix: "registrar", fullName: "Registrar", role: "REGISTRAR" as const },
  { suffix: "reports", fullName: "Reports Officer", role: "REPORTS_OFFICER" as const },
];

export async function seedAdminUsers(db: NodePgDatabase<typeof schema>) {
  const passwordHash = await hashPassword("Admin123!");

  const creator = await db.query.users.findFirst({
    where: eq(users.email, "art.testadmin@bsp.ph"),
  });

  if (!creator) {
    throw new Error("Admin account (art.testadmin@bsp.ph) not found. Seed users first.");
  }

  const creatorId = creator.id;
  const rows: (typeof adminUsers.$inferInsert)[] = [];

  const allCouncils = await db.query.councils.findMany();
  for (const council of allCouncils) {
    for (const systemUser of SYSTEM_USER_TEMPLATE) {
      rows.push({
        scope: "COUNCIL",
        councilId: council.id,
        createdBy: creatorId,
        username: systemUser.suffix, // Pure 'chief.executive', no prefix
        passwordHash,
        fullName: `${council.name} ${systemUser.fullName}`,
        role: systemUser.role,
        active: true,
      });
    }
  }

  if (rows.length > 0) {
    await db.insert(adminUsers).values(rows).onConflictDoNothing();
    console.log(`Seeded ${rows.length} system user account(s).`);
  }
}