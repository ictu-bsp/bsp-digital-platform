"use server";

import { db } from "@/db";
import { announcements, councils, users } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";

export async function getLatestAnnouncements(
  limit = 10
) {
  return await db
    .select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      imageUrl: announcements.imageUrl,
      visibility: announcements.visibility,
      isPinned: announcements.isPinned,
      createdAt: announcements.createdAt,

      author: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      },

      council: {
        id: councils.id,
        name: councils.name,
      },
    })
    .from(announcements)

    .leftJoin(
      users,
      eq(users.id, announcements.authorId)
    )

    .leftJoin(
      councils,
      eq(
        councils.id,
        announcements.councilId
      )
    )

    .orderBy(
      desc(announcements.isPinned),
      desc(announcements.createdAt)
    )

    .limit(limit);
}

export async function getAnnouncementsForUser(user: {
  role: "VISITOR" | "SCOUT" | "COUNCIL_ADMIN" | "SUPER_ADMIN";
  councilId?: string | null;
}) {
  if (user.role === "SUPER_ADMIN") {
    return db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  if (user.role === "VISITOR") {
    return db
      .select()
      .from(announcements)
      .where(
        eq(
          announcements.visibility,
          "PUBLIC"
        )
      )
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  return db
    .select()
    .from(announcements)
    .where(
      or(
        eq(announcements.visibility, "PUBLIC"),

        eq(announcements.visibility, "SCOUTS"),

        user.councilId
          ? and(
              eq(
                announcements.visibility,
                "COUNCIL"
              ),
              eq(
                announcements.councilId,
                user.councilId
              )
            )
          : undefined
      )
    )
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
}

export async function getCarouselAnnouncements() {
  return db
    .select({
      id: announcements.id,
      title: announcements.title,
      imageUrl: announcements.imageUrl,
    })
    .from(announcements)
    .where(
      eq(announcements.visibility, "PUBLIC")
    )
    .orderBy(desc(announcements.createdAt))
    .limit(5);
}

interface CreateAnnouncementInput {
  title: string;
  content: string;

  imageUrl?: string | null;

  visibility:
    | "PUBLIC"
    | "SCOUTS"
    | "COUNCIL";

  councilId?: string | null;

  authorId: string;

  isPinned?: boolean;
}

export async function createAnnouncement(
  data: CreateAnnouncementInput
) {
  return db.insert(announcements).values({
    title: data.title,
    content: data.content,

    imageUrl: data.imageUrl ?? null,

    visibility: data.visibility,

    councilId: data.councilId ?? null,

    authorId: data.authorId,

    isPinned: data.isPinned ?? false,
  });
}

