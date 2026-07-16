// src/db/seeds/activities.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";

export async function seedActivities(
  db: NodePgDatabase<typeof schema>
) {
  const councils = await db.query.councils.findMany();

  const councilMap = Object.fromEntries(
    councils.map((c) => [c.name, c.id])
  );

  const users = await db.query.users.findMany();

  const superAdmin = users.find(
    (u) => u.role === "SUPER_ADMIN"
  );

  if (!superAdmin) {
    throw new Error("Super Admin user not found.");
  }

  const activitySeeds: (typeof schema.activities.$inferInsert)[] = [
    {
      title: "2026 National Summer Camping",
      description:
        "A week-long outdoor camping experience focusing on survival skills, teamwork, and leadership.",
      category: "CAMPING",
      scope: "NATIONAL",
      councilId: null,
      location: "Mt. Makiling, Laguna",
      startDate: new Date("2026-05-04T08:00:00"),
      endDate: new Date("2026-05-10T17:00:00"),
      registrationDeadline: new Date("2026-04-20T23:59:59"),
      maxParticipants: 200,
      isPublished: true,
      imageUrl: null,
      createdBy: superAdmin.id,
    },

    {
      title: "Scout Leadership Training",
      description:
        "Leadership and troop management training for aspiring patrol leaders and senior scouts.",
      category: "TRAINING",
      scope: "NATIONAL",
      councilId: null,
      location: "BSP National Office, Manila",
      startDate: new Date("2026-06-06T09:00:00"),
      endDate: new Date("2026-06-07T16:00:00"),
      registrationDeadline: new Date("2026-05-30T23:59:59"),
      maxParticipants: 100,
      isPublished: true,
      imageUrl: null,
      createdBy: superAdmin.id,
    },

    {
      title: "Community Tree Planting Drive",
      description:
        "Join fellow scouts in restoring local forests through tree planting and environmental conservation.",
      category: "COMMUNITY_SERVICE",
      scope: "COUNCIL",
      councilId: councilMap["Quezon City Council"],
      location: "Quezon Memorial Circle",
      startDate: new Date("2026-07-18T07:00:00"),
      endDate: new Date("2026-07-18T15:00:00"),
      registrationDeadline: new Date("2026-07-10T23:59:59"),
      maxParticipants: 300,
      isPublished: true,
      imageUrl: null,
      createdBy: superAdmin.id,
    },

    {
      title: "Youth Development Seminar",
      description:
        "Guest speakers discuss youth leadership, ethics, and civic responsibility.",
      category: "SEMINAR",
      scope: "NATIONAL",
      councilId: null,
      location: "SMX Convention Center",
      startDate: new Date("2026-08-15T09:00:00"),
      endDate: new Date("2026-08-15T16:30:00"),
      registrationDeadline: new Date("2026-08-05T23:59:59"),
      maxParticipants: 500,
      isPublished: true,
      imageUrl: null,
      createdBy: superAdmin.id,
    },

    {
      title: "Regional Scout Skills Competition",
      description:
        "Compete in pioneering, knot tying, first aid, navigation, and emergency preparedness.",
      category: "COMPETITION",
      scope: "REGIONAL",
      councilId: null,
      location: "Clark Parade Grounds",
      startDate: new Date("2026-09-05T08:00:00"),
      endDate: new Date("2026-09-06T17:00:00"),
      registrationDeadline: new Date("2026-08-25T23:59:59"),
      maxParticipants: 250,
      isPublished: true,
      imageUrl: null,
      createdBy: superAdmin.id,
    },

    {
      title: "Scout Investiture Ceremony",
      description:
        "Formal ceremony welcoming newly registered scouts into the organization.",
      category: "CEREMONY",
      scope: "NATIONAL",
      councilId: null,
      location: "BSP Headquarters",
      startDate: new Date("2026-10-03T14:00:00"),
      endDate: new Date("2026-10-03T17:00:00"),
      registrationDeadline: new Date("2026-09-28T23:59:59"),
      maxParticipants: 400,
      isPublished: true,
      imageUrl: null,
      createdBy: superAdmin.id,
    },

    {
      title: "Council Monthly Meeting",
      description:
        "Monthly planning meeting for council officers and troop leaders.",
      category: "MEETING",
      scope: "COUNCIL",
      councilId: councilMap["Manila Council"],
      location: "Manila Council Office",
      startDate: new Date("2026-11-14T09:00:00"),
      endDate: new Date("2026-11-14T12:00:00"),
      registrationDeadline: null,
      maxParticipants: 60,
      isPublished: true,
      imageUrl: null,
      createdBy: superAdmin.id,
    },

    {
      title: "Scout Fellowship Day",
      description:
        "A day of games, fellowship, exhibitions, and cultural performances for all scouts.",
      category: "OTHER",
      scope: "COUNCIL",
      councilId: councilMap["Rizal Council"],
      location: "Rizal Park",
      startDate: new Date("2026-12-12T08:00:00"),
      endDate: new Date("2026-12-12T18:00:00"),
      registrationDeadline: new Date("2026-12-05T23:59:59"),
      maxParticipants: 1000,
      isPublished: true,
      imageUrl: null,
      createdBy: superAdmin.id,
    },
  ];

  await db.insert(schema.activities).values(activitySeeds);

  console.log(`✅ Seeded ${activitySeeds.length} activities.`);
}