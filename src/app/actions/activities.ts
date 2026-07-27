// src/app/actions/activities.ts
'use server';

import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from "@/services/activity.service";
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