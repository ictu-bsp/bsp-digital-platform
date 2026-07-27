// src/db/seeds/activityRegistrations.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "../schema";

export async function seedActivityRegistrations(
  db: NodePgDatabase<typeof schema>
) {
  const marc = await db.query.users.findFirst({
    where: eq(schema.users.email, "mjs.testscout2@bsp.ph"),
  });

  if (!marc) {
    throw new Error(
      "Marc James could not be found while seeding activity registrations."
    );
  }

  const scout = await db.query.scouts.findFirst({
    where: eq(schema.scouts.userId, marc.id),
  });

  if (!scout) {
    throw new Error(
      "Marc James's scout profile could not be found while seeding activity registrations."
    );
  }

  // Only register Marc (rank BOY) for activities he actually qualifies for,
  // so the seeded data doubles as a sanity check for the rank gate:
  // - Summer Camping: no rank requirement -> qualifies
  // - Regional Scout Skills Competition: requires BOY -> exactly qualifies
  // He deliberately does NOT get registered for "Scout Leadership Training"
  // or "Council Monthly Meeting" (both require SENIOR) so those remain
  // good test cases for the "not eligible" state on /join.
  const targetTitles = [
    "2026 National Summer Camping",
    "Regional Scout Skills Competition",
  ];

  const targetActivities = await db.query.activities.findMany({
    where: (activities, { inArray }) =>
      inArray(activities.title, targetTitles),
  });

  if (targetActivities.length === 0) {
    console.log(
      "⚠️  No matching activities found to seed registrations for — skipping."
    );
    return;
  }

  await db.insert(schema.activityRegistrations).values(
    targetActivities.map((activity) => ({
      scoutId: scout.id,
      activityId: activity.id,
    }))
  );

  console.log(
    `✅ Seeded ${targetActivities.length} activity registration(s).`
  );
}
