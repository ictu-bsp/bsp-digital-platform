// src/app/api/psgc/[...path]/route.ts
// Server-side proxy to the free PSGC (Philippine Standard Geographic Code)
// API (https://psgc.gitlab.io/api/). We proxy instead of calling it
// directly from the browser to avoid CORS issues and keep the third-party
// URL out of client bundles. Cached for 24h since PSGC data rarely changes.

import { NextRequest, NextResponse } from "next/server";

const PSGC_BASE = "https://psgc.gitlab.io/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join("/");
  const url = `${PSGC_BASE}/${targetPath}/`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: `PSGC API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("PSGC proxy error:", err);
    return NextResponse.json(
      { error: "Failed to reach PSGC API" },
      { status: 502 }
    );
  }
}