// src/db/seeds/adminUsers.seed.ts

import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { adminUsers } from "../schema/adminUsers";
import { users } from "../schema/users";

import { hashPassword } from "../../lib/auth/hash";

const SYSTEM_USER_TEMPLATE = [
  { suffix: "chief.executive", fullName: "Chief Executive", role: "CHIEF_EXECUTIVE" as const },
  { suffix: "membership", fullName: "Membership Officer", role: "MEMBERSHIP_OFFICER" as const },
  { suffix: "activities", fullName: "Activities Officer", role: "ACTIVITIES_OFFICER" as const },
  { suffix: "finance", fullName: "Finance Officer", role: "FINANCE_OFFICER" as const },
  { suffix: "registrar", fullName: "Registrar", role: "REGISTRAR" as const },
  { suffix: "reports", fullName: "Reports Officer", role: "REPORTS_OFFICER" as const },
];

// Only the legacy test admin (Andrei) gets a pre-seeded system user set,
// kept exactly as before for backwards compatibility. Every other
// council/regional/national admin creates their own system users
// on-demand through their dashboard (System Users > Add System User) --
// that's the whole point of scoping login by council/region, so we don't
// pre-seed hundreds of accounts nobody asked for.
export async function seedAdminUsers(
  db: NodePgDatabase<typeof schema>
) {
  const passwordHash = await hashPassword("Admin123!");

  const andrei = await db.query.users.findFirst({
    where: eq(users.email, "art.testadmin@bsp.ph"),
  });

  if (!andrei) {
    throw new Error(
      "Expected admin account not found. Seed users first."
    );
  }

  const rows: (typeof adminUsers.$inferInsert)[] = SYSTEM_USER_TEMPLATE.map(
    (systemUser) => ({
      scope: "COUNCIL" as const,
      councilId: andrei.councilId,
      createdBy: andrei.id,
      username: systemUser.suffix,
      passwordHash,
      fullName: systemUser.fullName,
      role: systemUser.role,
      active: true,
    })
  );

  await db.insert(adminUsers).values(rows);

  console.log(`✅ Seeded ${rows.length} system user account(s) for the legacy test admin.`);
}
