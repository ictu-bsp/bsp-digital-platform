//src/services/announcement.service.ts
"use server";

import { db } from "@/db";
import { announcements, councils, regions, users } from "@/db/schema";
import { and, desc, eq, isNull, or } from "drizzle-orm";

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  imageUrl?: string | null;
  visibility: "PUBLIC" | "SCOUTS" | "COUNCIL" | "REGIONAL";
  councilId?: string | null;
  regionId?: string | null;
  authorId: string;
  isPinned?: boolean;
}

const announcementSelect = {
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

  region: {
    id: regions.id,
    name: regions.name,
  },
};

function announcementsWithAuthorAndScope() {
  return db
    .select(announcementSelect)
    .from(announcements)
    .leftJoin(users, eq(users.id, announcements.authorId))
    .leftJoin(councils, eq(councils.id, announcements.councilId))
    .leftJoin(regions, eq(regions.id, announcements.regionId));
}

export async function getLatestAnnouncements(limit = 10) {
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

    .leftJoin(users, eq(users.id, announcements.authorId))

    .leftJoin(councils, eq(councils.id, announcements.councilId))

    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))

    .limit(limit);
}

export async function getAnnouncementsForUser(user: {
  role:
    | "VISITOR"
    | "SCOUT"
    | "COUNCIL_ADMIN"
    | "REGIONAL_ADMIN"
    | "NATIONAL_ADMIN"
    | "SUPER_ADMIN";
  councilId?: string | null;
  regionId?: string | null;
}) {
  if (user.role === "SUPER_ADMIN" || user.role === "NATIONAL_ADMIN") {
    return announcementsWithAuthorAndScope().orderBy(
      desc(announcements.isPinned),
      desc(announcements.createdAt)
    );
  }

  if (user.role === "VISITOR") {
    return announcementsWithAuthorAndScope()
      .where(eq(announcements.visibility, "PUBLIC"))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  return announcementsWithAuthorAndScope()
    .where(
      or(
        eq(announcements.visibility, "PUBLIC"),

        eq(announcements.visibility, "SCOUTS"),

        user.councilId
          ? and(
              eq(announcements.visibility, "COUNCIL"),
              eq(announcements.councilId, user.councilId)
            )
          : undefined,

        user.regionId
          ? and(
              eq(announcements.visibility, "REGIONAL"),
              eq(announcements.regionId, user.regionId)
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
    .where(eq(announcements.visibility, "PUBLIC"))
    .orderBy(desc(announcements.createdAt))
    .limit(5);
}

export async function getAnnouncementsForAdmin(scope: {
  tier: "COUNCIL" | "REGIONAL" | "NATIONAL" | "SUPER";
  councilId?: string;
  regionId?: string;
}) {
  if (scope.tier === "SUPER") {
    return announcementsWithAuthorAndScope().orderBy(
      desc(announcements.isPinned),
      desc(announcements.createdAt)
    );
  }

  if (scope.tier === "COUNCIL" && scope.councilId) {
    return announcementsWithAuthorAndScope()
      .where(eq(announcements.councilId, scope.councilId))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  if (scope.tier === "REGIONAL" && scope.regionId) {
    return announcementsWithAuthorAndScope()
      .where(eq(announcements.regionId, scope.regionId))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  // NATIONAL: their own posts have no council/region attached at all.
  return announcementsWithAuthorAndScope()
    .where(
      and(
        isNull(announcements.councilId),
        isNull(announcements.regionId)
      )
    )
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
}

export async function createAnnouncement(data: CreateAnnouncementInput) {
  return db.insert(announcements).values({
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl ?? null,
    visibility: data.visibility,
    councilId: data.councilId ?? null,
    regionId: data.regionId ?? null,
    authorId: data.authorId,
    isPinned: data.isPinned ?? false,
  });
}

export async function updateAnnouncement(
  id: string,
  data: Partial<CreateAnnouncementInput>
) {
  const [updated] = await db
    .update(announcements)
    .set({
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
      ...(data.councilId !== undefined ? { councilId: data.councilId } : {}),
      ...(data.regionId !== undefined ? { regionId: data.regionId } : {}),
      ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
      updatedAt: new Date(),
    })
    .where(eq(announcements.id, id))
    .returning();

  return updated ?? null;
}

export async function deleteAnnouncement(id: string) {
  await db.delete(announcements).where(eq(announcements.id, id));
}