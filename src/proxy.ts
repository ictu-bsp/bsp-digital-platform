// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
//Publicly accessible route paths that bypass authentication checks.
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/admin/login", // Allows administrative users to reach secondary login step
  "/scout/membership/membership-registration/webhook", // Payment provider callback handler
];
/**
 * Next.js Edge Middleware proxy function handling access control enforcement
 * and cache header adjustments for protected application routes.
 * @param request - The incoming Next.js HTTP request object.
 * @returns A `NextResponse` redirect, JSON error response, or forwarded response.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = request.cookies.get("bsp_session");
  // Determines if current request path matches any entry in PUBLIC_ROUTES
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  // 1. Guard check: Unauthenticated access attempt on protected routes
  if (!session && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // 2. Guard check: Authenticated users attempting to visit auth pages (/login, /signup)
  if (
    session &&
    (pathname === "/login" || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/scout", request.url));
  }
  const response = NextResponse.next();
  // Disable back/forward browser caching (BFCache) for sensitive, non-public pages
  if (!isPublic) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }
  return response;
}
//Middleware matcher patterns dictating which path domains execute this proxy guard.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/scout/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};