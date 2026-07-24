//src/app/api/admin/activities/route.ts

import { NextResponse } from "next/server";

import { ActivitySchema } from "@/lib/validation/common/activity";
import { createActivity, getActivities } from "@/services/activity.service";

export async function GET() {
  const activities = await getActivities();

  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = ActivitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      parsed.error.flatten(),
      { status: 400 }
    );
  }

  const activity = await createActivity(parsed.data);

  return NextResponse.json(activity);
}