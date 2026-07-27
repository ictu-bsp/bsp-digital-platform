// src/app/actions/activities.ts
'use server';

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
  getRegisteredCount,
} from "@/services/activity-registration.service";
import { meetsRankRequirement } from "@/lib/utils/rank";
import { getCurrentUser } from "@/lib/auth/current-user";
import { activities } from "@/db/schema/activities";

export async function getActivitiesAction() {
  try {
    const data = await getActivities();
    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      error: "Failed to load activities.",
    };
  }
}

export async function getActivityByIdAction(id: string) {
  try {
    const data = await getActivityById(id);

    if (!data) {
      return {
        success: false,
        data: null,
        error: "Activity not found.",
      };
    }

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      error: "Failed to load activity.",
    };
  }
}

export async function createActivityAction(
  data: typeof activities.$inferInsert
) {
  try {
    const created = await createActivity(data);
    return {
      success: true,
      data: created,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      error: "Failed to create activity.",
    };
  }
}

export async function updateActivityAction(
  id: string,
  data: Partial<typeof activities.$inferInsert>
) {
  try {
    const updated = await updateActivity(id, data);

    if (!updated) {
      return {
        success: false,
        data: null,
        error: "Activity not found.",
      };
    }

    return {
      success: true,
      data: updated,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      error: "Failed to update activity.",
    };
  }
}

export async function deleteActivityAction(id: string) {
  try {
    await deleteActivity(id);
    return {
      success: true,
      data: null,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      error: "Failed to delete activity.",
    };
  }
}

// Confirms a scout's join request. Re-checks everything server-side
// (rank, deadline, capacity, duplicate registration) rather than trusting
// whatever the confirmation page rendered — that page's checks are for
// UX only, this is the actual gate.
export async function joinActivityAction(activityId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be logged in." };
    }

    const scout = await getScoutByUserId(user.id);
    if (!scout) {
      return { success: false, error: "No scout profile found." };
    }

    const activity = await getActivityById(activityId);
    if (!activity) {
      return { success: false, error: "Activity not found." };
    }

    if (
      activity.registrationDeadline &&
      activity.registrationDeadline < new Date()
    ) {
      return { success: false, error: "Registration is closed for this activity." };
    }

    if (!meetsRankRequirement(scout.rank, activity.minimumRank)) {
      return {
        success: false,
        error: "You don't meet the rank requirement for this activity.",
      };
    }

    const alreadyRegistered = await isScoutRegistered(scout.id, activityId);
    if (alreadyRegistered) {
      return { success: true, error: null };
    }

    if (activity.maxParticipants != null) {
      const currentCount = await getRegisteredCount(activityId);
      if (currentCount >= activity.maxParticipants) {
        return { success: false, error: "This activity is already full." };
      }
    }

    await registerScoutForActivity(scout.id, activityId);
    return { success: true, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to join activity." };
  }
}