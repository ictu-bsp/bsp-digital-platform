import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { adminUsers } from "../schema/adminUsers";

import { hashPassword } from "@/lib/auth/hash";

export async function seedAdminUsers(
  db: NodePgDatabase<typeof schema>
) {
  const council = await db.query.councils.findFirst();

  if (!council) {
    throw new Error(
      "No council found. Seed councils first."
    );
  }

  const councilAdmin =
    await db.query.users.findFirst({
      where: eq(
        schema.users.role,
        "COUNCIL_ADMIN"
      ),
    });

  if (!councilAdmin) {
    throw new Error(
      "Council Admin account not found."
    );
  }

  const passwordHash =
    await hashPassword("Admin123!");

  const accounts = [
    {
      username: "chief.executive",
      fullName: "Chief Executive",
      role: "CHIEF_EXECUTIVE" as const,
    },
    {
      username: "membership",
      fullName: "Membership Officer",
      role: "MEMBERSHIP_OFFICER" as const,
    },
    {
      username: "activities",
      fullName: "Activities Officer",
      role: "ACTIVITIES_OFFICER" as const,
    },
    {
      username: "finance",
      fullName: "Finance Officer",
      role: "FINANCE_OFFICER" as const,
    },
    {
      username: "registrar",
      fullName: "Registrar",
      role: "REGISTRAR" as const,
    },
    {
      username: "reports",
      fullName: "Reports Officer",
      role: "REPORTS_OFFICER" as const,
    },
  ];

  for (const account of accounts) {
    const existing =
      await db.query.adminUsers.findFirst({
        where: eq(
          adminUsers.username,
          account.username
        ),
      });

    if (existing) continue;

    await db.insert(adminUsers).values({
      councilId: council.id,
      createdBy: councilAdmin.id,
      username: account.username,
      passwordHash,
      fullName: account.fullName,
      role: account.role,
      active: true,
    });
  }

  console.log(
    "✅ Admin Users seeded successfully."
  );
}