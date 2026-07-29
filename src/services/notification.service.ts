"use server";

import { db } from "@/db";
import { notifications, councils, regions, users } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";

function notificationsWithAuthorAndScope() {
  return db
    .select({
      id: notifications.id,
      title: notifications.title,
      message: notifications.message,
      link: notifications.link,
      visibility: notifications.visibility,
      createdAt: notifications.createdAt,

      author: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      },

      council: {
        id: councils.id,
        name: councils.name,
      },

      region: {
        id: regions.id,
        name: regions.name,
      },
    })
    .from(notifications)
    .leftJoin(users, eq(users.id, notifications.authorId))
    .leftJoin(councils, eq(councils.id, notifications.councilId))
    .leftJoin(regions, eq(regions.id, notifications.regionId));
}

export async function getNotificationsForUser(user: {
  role: "VISITOR" | "SCOUT" | "COUNCIL_ADMIN" | "REGIONAL_ADMIN" | "NATIONAL_ADMIN" | "SUPER_ADMIN";
  councilId?: string | null;
  regionId?: string | null;
}) {
  if (user.role === "SUPER_ADMIN" || user.role === "NATIONAL_ADMIN") {
    return notificationsWithAuthorAndScope().orderBy(desc(notifications.createdAt));
  }

  if (user.role === "VISITOR") {
    return notificationsWithAuthorAndScope()
      .where(eq(notifications.visibility, "PUBLIC"))
      .orderBy(desc(notifications.createdAt));
  }

  return notificationsWithAuthorAndScope()
    .where(
      or(
        eq(notifications.visibility, "PUBLIC"),

        eq(notifications.visibility, "SCOUTS"),

        user.councilId
          ? and(
              eq(notifications.visibility, "COUNCIL"),
              eq(notifications.councilId, user.councilId)
            )
          : undefined,

        user.regionId
          ? and(
              eq(notifications.visibility, "REGIONAL"),
              eq(notifications.regionId, user.regionId)
            )
          : undefined
      )
    )
    .orderBy(desc(notifications.createdAt));
}

interface CreateNotificationInput {
  title: string;
  message: string;

  link?: string | null;

  visibility: "PUBLIC" | "SCOUTS" | "COUNCIL" | "REGIONAL";

  councilId?: string | null;
  regionId?: string | null;

  authorId: string;
}

export async function createNotification(data: CreateNotificationInput) {
  return db.insert(notifications).values({
    title: data.title,
    message: data.message,

    link: data.link ?? null,

    visibility: data.visibility,

    councilId: data.councilId ?? null,
    regionId: data.regionId ?? null,

    authorId: data.authorId,
  });
}
