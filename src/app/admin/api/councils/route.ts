// src/app/admin/api/councils/route.ts

import { NextResponse } from "next/server";
import { getCouncilsForDropdown } from "@/services/admin.service";

export async function GET() {
  try {
    const councils = await getCouncilsForDropdown();
    return NextResponse.json({ councils });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Unable to load councils." },
      { status: 500 }
    );
  }
}