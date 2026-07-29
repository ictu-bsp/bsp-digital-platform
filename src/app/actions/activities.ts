// src/app/actions/activities.ts
'use server';
import { revalidatePath } from "next/cache";
import {
  getActivities, getActivityById, createActivity,
  updateActivity, deleteActivity } from "@/services/activity.service";
import { 
  getScoutByUserId, isScoutRegistered, registerScoutForActivity,
  unregisterScoutFromActivity, getRegisteredCount } from "@/services/activity-registration.service";
import { meetsRankRequirement } from "@/lib/utils/rank";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { AdminScope } from "@/lib/utils/admin-scope";
import { activities } from "@/db/schema/activities";

const ACTIVITY_MANAGER_ROLES = ["CHIEF_EXECUTIVE", "REGISTRAR", "ACTIVITIES_OFFICER"] as const;
export type ActionResult<T = unknown> = {
  success: boolean; data?: T | null; error?: string | null; redirectTo?: string | null; };
// Authenticates current session and gets scout record
async function getAuthenticatedScout() {
  const user = await getCurrentUser();
  if (!user) return { user: null, scout: null, error: "You must be logged in." };
  const scout = await getScoutByUserId(user.id);
  if (!scout) return { user, scout: null, error: "No scout profile found." };
  return { user, scout, error: null };
}
// Fetches all activities
export async function getActivitiesAction():
Promise<ActionResult<Awaited<ReturnType<typeof getActivities>>>> {
  try {
    const data = await getActivities();
    return { success: true, data, error: null };
  } catch (error) {
    console.error("getActivitiesAction error:", error);
    return { success: false, data: null, error: "Failed to load activities." };
  }
}
// Fetches a single activity by ID
export async function getActivityByIdAction(id: string):
Promise<ActionResult<Awaited<ReturnType<typeof getActivityById>>>> {
  try {
    const data = await getActivityById(id);
    if (!data) return { success: false, data: null, error: "Activity not found." };
    return { success: true, data, error: null };
  } catch (error) {
    console.error("getActivityByIdAction error:", error);
    return { success: false, data: null, error: "Failed to load activity." };
  }
}
// Given a resolved admin scope and whatever council/region the client
// submitted, returns the council/region that should actually be saved.
// Non-super admins always get their own council/region forced onto the
// record, regardless of what the form sent -- a council officer cannot
// post an activity under a different council no matter what the client
// sends. SUPER_ADMIN is the only tier allowed to pass through whatever
// council/region it explicitly chose.
function enforceScope(
  scope: AdminScope,
  submitted: { councilId?: string | null; regionId?: string | null }
) {
  if (scope.tier === "SUPER") {
    return {
      councilId: submitted.councilId ?? null,
      regionId: submitted.regionId ?? null,
    };
  }

  if (scope.tier === "COUNCIL") {
    return { councilId: scope.councilId, regionId: null };
  }

  if (scope.tier === "REGIONAL") {
    return { councilId: null, regionId: scope.regionId };
  }

  // NATIONAL tier: unscoped, visible to everyone.
  return { councilId: null, regionId: null };
}

// Creates a new activity record
export async function createActivityAction(data: typeof activities.$inferInsert):
Promise<ActionResult<Awaited<ReturnType<typeof createActivity>>>> {
  const auth = await requireAdmin([...ACTIVITY_MANAGER_ROLES]);
  if (!auth.ok) return { success: false, data: null, error: auth.error };

  try {
    const { councilId, regionId } = enforceScope(auth.context.scope, data);
    const created = await createActivity({ ...data, councilId, regionId });
    revalidatePath("/scout/activities");
    return { success: true, data: created, error: null };
  } catch (error) {
    console.error("createActivityAction error:", error);
    return { success: false, data: null, error: "Failed to create activity." };
  }
}
// Updates an existing activity by ID
export async function updateActivityAction(id: string, data: Partial<typeof activities.$inferInsert>):
Promise<ActionResult<Awaited<ReturnType<typeof updateActivity>>>> {
  const auth = await requireAdmin([...ACTIVITY_MANAGER_ROLES]);
  if (!auth.ok) return { success: false, data: null, error: auth.error };

  try {
    const { councilId, regionId } = enforceScope(auth.context.scope, data);
    const updated = await updateActivity(id, { ...data, councilId, regionId });
    if (!updated) return { success: false, data: null, error: "Activity not found." };
    revalidatePath("/scout/activities");
    return { success: true, data: updated, error: null };
  } catch (error) {
    console.error("updateActivityAction error:", error);
    return { success: false, data: null, error: "Failed to update activity." };
  }
}
// Deletes an activity by ID
export async function deleteActivityAction(id: string):
Promise<ActionResult<null>> {
  const auth = await requireAdmin([...ACTIVITY_MANAGER_ROLES]);
  if (!auth.ok) return { success: false, data: null, error: auth.error };

  try {
    await deleteActivity(id);
    revalidatePath("/scout/activities");
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("deleteActivityAction error:", error);
    return { success: false, data: null, error: "Failed to delete activity." };
  }
}
// Registers the authenticated scout for an activity after eligibility checks
export async function joinActivityAction(activityId: string):
Promise<ActionResult> {
  try {
    const { scout, error: authError } = await getAuthenticatedScout();
    if (authError || !scout) return { success: false, error: authError, redirectTo: null };
    const [activity, alreadyRegistered] = await Promise.all([getActivityById(activityId),
      isScoutRegistered(scout.id, activityId)]);
    if (!activity) return { success: false, error: "Activity not found.", redirectTo: null };
    if (alreadyRegistered) return { success: true, error: null,
      redirectTo: `/scout/activities/${activityId}?joined=1` };
    if (activity.registrationDeadline && activity.registrationDeadline < new Date()) return {
      success: false, error: "Registration is closed for this activity.", redirectTo: null };
    if (!meetsRankRequirement(scout.rank, activity.minimumRank)) return {
      success: false, error: "You don't meet the rank requirement for this activity.", redirectTo: null };
    if (activity.maxParticipants != null) {
      const currentCount = await getRegisteredCount(activityId);
      if (currentCount >= activity.maxParticipants) return {
        success: false, error: "This activity is already full.", redirectTo: null };
    }
    await registerScoutForActivity(scout.id, activityId);
    return { success: true, error: null, redirectTo: `/scout/activities/${activityId}?joined=1` };
  } catch (error) {
    console.error("joinActivityAction error:", error);
    return { success: false, error: "Failed to join activity.", redirectTo: null };
  }
}
// Unregisters the authenticated scout from an activity
export async function leaveActivityAction(activityId: string):
Promise<ActionResult> {
  try {
    const { scout, error: authError } =
    await getAuthenticatedScout();
    if (authError || !scout) return { success: false, error: authError, redirectTo: null };
    const [activity, alreadyRegistered] =
    await Promise.all([getActivityById(activityId), isScoutRegistered(scout.id, activityId)]);
    if (!activity) return { success: false, error: "Activity not found.", redirectTo: null };
    if (!alreadyRegistered) return {
      success: false, error: "You are not registered for this activity.", redirectTo: null };
    await unregisterScoutFromActivity(scout.id, activityId);
    return { success: true, error: null, redirectTo: `/scout/activities/${activityId}?left=1` };
  } catch (error) {
    console.error("leaveActivityAction error:", error);
    return { success: false, error: "Failed to leave activity.", redirectTo: null };
  }
}