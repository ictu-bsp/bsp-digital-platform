// src/app/actions/activities.ts
'use server';

import { revalidatePath } from "next/cache";
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from "@/services/activity.service";
import {
  getScoutByUserId,
  isScoutRegistered,
  registerScoutForActivity,
  unregisterScoutFromActivity,
  getRegisteredCount,
} from "@/services/activity-registration.service";
import { meetsRankRequirement } from "@/lib/utils/rank";
import { getCurrentUser } from "@/lib/auth/current-user";
import { activities } from "@/db/schema/activities";

// Shared Action Return Type
export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T | null;
  error?: string | null;
  redirectTo?: string | null;
};

// Helper: Authenticates current session and gets scout record
async function getAuthenticatedScout() {
  const user = await getCurrentUser();
  if (!user) return { user: null, scout: null, error: "You must be logged in." };

  const scout = await getScoutByUserId(user.id);
  if (!scout) return { user, scout: null, error: "No scout profile found." };

  return { user, scout, error: null };
}

export async function getActivitiesAction(): Promise<ActionResult<Awaited<ReturnType<typeof getActivities>>>> {
  try {
    const data = await getActivities();
    return { success: true, data, error: null };
  } catch (error) {
    console.error("getActivitiesAction error:", error);
    return { success: false, data: null, error: "Failed to load activities." };
  }
}

export async function getActivityByIdAction(id: string): Promise<ActionResult<Awaited<ReturnType<typeof getActivityById>>>> {
  try {
    const data = await getActivityById(id);
    if (!data) return { success: false, data: null, error: "Activity not found." };

    return { success: true, data, error: null };
  } catch (error) {
    console.error("getActivityByIdAction error:", error);
    return { success: false, data: null, error: "Failed to load activity." };
  }
}

export async function createActivityAction(
  data: typeof activities.$inferInsert
): Promise<ActionResult<Awaited<ReturnType<typeof createActivity>>>> {
  try {
    const created = await createActivity(data);
    revalidatePath("/scout/activities");
    return { success: true, data: created, error: null };
  } catch (error) {
    console.error("createActivityAction error:", error);
    return { success: false, data: null, error: "Failed to create activity." };
  }
}

export async function updateActivityAction(
  id: string,
  data: Partial<typeof activities.$inferInsert>
): Promise<ActionResult<Awaited<ReturnType<typeof updateActivity>>>> {
  try {
    const updated = await updateActivity(id, data);
    if (!updated) return { success: false, data: null, error: "Activity not found." };

    revalidatePath("/scout/activities");
    return { success: true, data: updated, error: null };
  } catch (error) {
    console.error("updateActivityAction error:", error);
    return { success: false, data: null, error: "Failed to update activity." };
  }
}

export async function deleteActivityAction(id: string): Promise<ActionResult<null>> {
  try {
    await deleteActivity(id);
    revalidatePath("/scout/activities");
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("deleteActivityAction error:", error);
    return { success: false, data: null, error: "Failed to delete activity." };
  }
}

export async function joinActivityAction(activityId: string): Promise<ActionResult> {
  try {
    const { scout, error: authError } = await getAuthenticatedScout();
    if (authError || !scout) {
      return { success: false, error: authError, redirectTo: null };
    }

    // Parallel fetch: activity details and registration check
    const [activity, alreadyRegistered] = await Promise.all([
      getActivityById(activityId),
      isScoutRegistered(scout.id, activityId),
    ]);

    if (!activity) {
      return { success: false, error: "Activity not found.", redirectTo: null };
    }

    if (alreadyRegistered) {
      return {
        success: true,
        error: null,
        redirectTo: `/scout/activities/${activityId}?joined=1`,
      };
    }

    if (
      activity.registrationDeadline &&
      activity.registrationDeadline < new Date()
    ) {
      return {
        success: false,
        error: "Registration is closed for this activity.",
        redirectTo: null,
      };
    }

    if (!meetsRankRequirement(scout.rank, activity.minimumRank)) {
      return {
        success: false,
        error: "You don't meet the rank requirement for this activity.",
        redirectTo: null,
      };
    }

    if (activity.maxParticipants != null) {
      const currentCount = await getRegisteredCount(activityId);
      if (currentCount >= activity.maxParticipants) {
        return {
          success: false,
          error: "This activity is already full.",
          redirectTo: null,
        };
      }
    }

    await registerScoutForActivity(scout.id, activityId);

    // Note: revalidatePath omitted here to prevent Next.js from prematurely unmounting 
    // client components showing animated success overlays. Revalidation will occur on client navigation.

    return {
      success: true,
      error: null,
      redirectTo: `/scout/activities/${activityId}?joined=1`,
    };
  } catch (error) {
    console.error("joinActivityAction error:", error);
    return {
      success: false,
      error: "Failed to join activity.",
      redirectTo: null,
    };
  }
}

export async function leaveActivityAction(activityId: string): Promise<ActionResult> {
  try {
    const { scout, error: authError } = await getAuthenticatedScout();
    if (authError || !scout) {
      return { success: false, error: authError, redirectTo: null };
    }

    const [activity, alreadyRegistered] = await Promise.all([
      getActivityById(activityId),
      isScoutRegistered(scout.id, activityId),
    ]);

    if (!activity) {
      return { success: false, error: "Activity not found.", redirectTo: null };
    }

    if (!alreadyRegistered) {
      return {
        success: false,
        error: "You are not registered for this activity.",
        redirectTo: null,
      };
    }

    await unregisterScoutFromActivity(scout.id, activityId);

    // Note: revalidatePath omitted here to prevent Next.js from prematurely unmounting 
    // client components showing animated success overlays. Revalidation will occur on client navigation.

    return {
      success: true,
      error: null,
      redirectTo: `/scout/activities/${activityId}?left=1`,
    };
  } catch (error) {
    console.error("leaveActivityAction error:", error);
    return {
      success: false,
      error: "Failed to leave activity.",
      redirectTo: null,
    };
  }
}