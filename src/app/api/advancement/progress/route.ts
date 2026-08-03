import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getScoutByUserId } from "@/services/scout.service";
import { getScoutAdvancementProgress, saveScoutAdvancementProgress, type AdvancementProgressState } from "@/services/advancement.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scout = user.id ? await getScoutByUserId(user.id) : null;
  if (!scout) {
    return NextResponse.json({ error: "Scout profile not found" }, { status: 404 });
  }

  const progress = await getScoutAdvancementProgress(scout.id);
  return NextResponse.json(progress);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scout = user.id ? await getScoutByUserId(user.id) : null;
  if (!scout) {
    return NextResponse.json({ error: "Scout profile not found" }, { status: 404 });
  }

  const payload = await request.json();
  const progressState = payload && typeof payload === "object" ? (payload as AdvancementProgressState) : {};
  const saved = await saveScoutAdvancementProgress(scout.id, progressState, scout.advancementRank ?? "MEMBERSHIP");

  return NextResponse.json(saved);
}
