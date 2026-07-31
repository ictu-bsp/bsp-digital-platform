// src/app/actions/announcements.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementsForAdmin,
} from "@/services/announcement.service";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { AdminScope } from "@/lib/utils/admin-scope";

const ANNOUNCEMENT_MANAGER_ROLES = ["CHIEF_EXECUTIVE"] as const;

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

// Given a resolved admin scope and whatever the client submitted, returns
// the visibility/council/region that should actually be saved. Non-super
// tiers are locked to their own natural scope -- a council admin can only
// ever post COUNCIL-visibility announcements for their own council, a
// regional admin only REGIONAL for their own region, and a national admin
// only PUBLIC/SCOUTS (their choice) with no council/region attached at
// all. SUPER_ADMIN is the only tier allowed to pick freely, matching the
// same exception used for activities and system-user creation.
function enforceAnnouncementScope(
  scope: AdminScope,
  submitted: {
    visibility?: "PUBLIC" | "SCOUTS" | "COUNCIL" | "REGIONAL";
    councilId?: string | null;
    regionId?: string | null;
  }
) {
  if (scope.tier === "SUPER") {
    return {
      visibility: submitted.visibility ?? "PUBLIC",
      councilId: submitted.councilId ?? null,
      regionId: submitted.regionId ?? null,
    };
  }

  if (scope.tier === "COUNCIL") {
    return { visibility: "COUNCIL" as const, councilId: scope.councilId, regionId: null };
  }

  if (scope.tier === "REGIONAL") {
    return { visibility: "REGIONAL" as const, councilId: null, regionId: scope.regionId };
  }

  // NATIONAL tier: their choice of PUBLIC or SCOUTS, never council/region-scoped.
  const nationalVisibility =
    submitted.visibility === "SCOUTS" ? "SCOUTS" as const : "PUBLIC" as const;
  return { visibility: nationalVisibility, councilId: null, regionId: null };
}

export async function getAnnouncementsForAdminAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getAnnouncementsForAdmin>>>
> {
  const auth = await requireAdmin([...ANNOUNCEMENT_MANAGER_ROLES]);
  if (!auth.ok) return { success: false, data: null, error: auth.error };

  try {
    const data = await getAnnouncementsForAdmin(auth.context.scope);
    return { success: true, data, error: null };
  } catch (error) {
    console.error("getAnnouncementsForAdminAction error:", error);
    return { success: false, data: null, error: "Failed to load announcements." };
  }
}

export async function createAnnouncementAction(data: {
  title: string;
  content: string;
  imageUrl?: string | null;
  visibility?: "PUBLIC" | "SCOUTS" | "COUNCIL" | "REGIONAL";
  councilId?: string | null;
  regionId?: string | null;
  isPinned?: boolean;
}): Promise<ActionResult<Awaited<ReturnType<typeof createAnnouncement>>>> {
  const auth = await requireAdmin([...ANNOUNCEMENT_MANAGER_ROLES]);
  if (!auth.ok) return { success: false, data: null, error: auth.error };

  try {
    const { visibility, councilId, regionId } = enforceAnnouncementScope(auth.context.scope, data);
    const created = await createAnnouncement({
      ...data,
      visibility,
      councilId,
      regionId,
      authorId: auth.context.userId,
    });
    revalidatePath("/admin/announcements");
    revalidatePath("/scout");
    return { success: true, data: created, error: null };
  } catch (error) {
    console.error("createAnnouncementAction error:", error);
    return { success: false, data: null, error: "Failed to create announcement." };
  }
}

export async function updateAnnouncementAction(
  id: string,
  data: {
    title?: string;
    content?: string;
    imageUrl?: string | null;
    visibility?: "PUBLIC" | "SCOUTS" | "COUNCIL" | "REGIONAL";
    councilId?: string | null;
    regionId?: string | null;
    isPinned?: boolean;
  }
): Promise<ActionResult<Awaited<ReturnType<typeof updateAnnouncement>>>> {
  const auth = await requireAdmin([...ANNOUNCEMENT_MANAGER_ROLES]);
  if (!auth.ok) return { success: false, data: null, error: auth.error };

  try {
    const { visibility, councilId, regionId } = enforceAnnouncementScope(auth.context.scope, data);
    const updated = await updateAnnouncement(id, { ...data, visibility, councilId, regionId });
    if (!updated) return { success: false, data: null, error: "Announcement not found." };
    revalidatePath("/admin/announcements");
    revalidatePath("/scout");
    return { success: true, data: updated, error: null };
  } catch (error) {
    console.error("updateAnnouncementAction error:", error);
    return { success: false, data: null, error: "Failed to update announcement." };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult<null>> {
  const auth = await requireAdmin([...ANNOUNCEMENT_MANAGER_ROLES]);
  if (!auth.ok) return { success: false, data: null, error: auth.error };

  try {
    await deleteAnnouncement(id);
    revalidatePath("/admin/announcements");
    revalidatePath("/scout");
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("deleteAnnouncementAction error:", error);
    return { success: false, data: null, error: "Failed to delete announcement." };
  }
}
