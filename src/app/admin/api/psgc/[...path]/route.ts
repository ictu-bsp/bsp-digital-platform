// src/app/admin/api/psgc/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const PSGC_BASE = "https://psgc.gitlab.io/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  
  // Join the paths without forcing a trailing slash at the end
  const targetPath = path.join("/");
  const url = `${PSGC_BASE}/${targetPath}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    
    // Validate Content-Type before parsing JSON
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      const text = await res.text();
      console.error(`PSGC Fetch Error [${res.status}] for ${url}:`, text.slice(0, 150));
      return NextResponse.json(
        { error: `PSGC request failed or did not return JSON. Status: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("PSGC proxy error:", err);
    return NextResponse.json({ error: "Failed to reach PSGC API" }, { status: 502 });
  }
}