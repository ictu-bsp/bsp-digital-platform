// src/app/admin/api/psgc/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
const PSGC_BASE = "https://psgc.gitlab.io/api";
// Proxies incoming request paths to the PSGC API server-side with
// 24-hour response revalidation to avoid CORS errors
export async function GET(
  req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join("/");
  const url = `${PSGC_BASE}/${targetPath}/`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) 
      return NextResponse.json({ error: `PSGC API returned ${res.status}` }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("PSGC proxy error:", err);
    return NextResponse.json({ error: "Failed to reach PSGC API" }, { status: 502 });
  }
}