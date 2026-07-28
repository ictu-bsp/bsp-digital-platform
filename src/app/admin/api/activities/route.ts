// src/app/admin/api/activities/route.ts
import { NextResponse } from "next/server";
import { ActivitySchema } from "@/lib/validation/common/activity";
import { createActivity, getActivities } from "@/services/activity.service";
// Handles GET requests to retrieve all activities
export async function GET() {
  const activities = await getActivities();
  return NextResponse.json(activities);
}
// Handles POST requests to create a new activity after validating the request body
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ActivitySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.flatten(), { status: 400 });
  const activity = await createActivity(parsed.data);
  return NextResponse.json(activity);
}