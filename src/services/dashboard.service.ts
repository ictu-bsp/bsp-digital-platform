"use server";

import { getAnnouncementsForUser } from "./announcement.service";

export async function getDashboardData(user: {
  id: string;
  role: "VISITOR" | "SCOUT" | "COUNCIL_ADMIN" | "SUPER_ADMIN";
  councilId?: string | null;
}) {
  const announcements =
    await getAnnouncementsForUser(user);

  return {
    announcements,

    notifications: [],

    activities: [],

    progress: null,
  };
}