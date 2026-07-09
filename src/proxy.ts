import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
];

export function proxy(request: NextRequest) {

  const session =
    request.cookies.get("bsp_session");

  const pathname =
    request.nextUrl.pathname;

  const isPublic =
    PUBLIC_ROUTES.some(route =>
      pathname === route ||
      pathname.startsWith(route + "/")
    );

  if (!session && !isPublic) {

    return NextResponse.redirect(
      new URL("/login", request.url)
    );

  }

  if (
    session &&
    (
      pathname === "/login" ||
      pathname === "/signup"
    )
  ) {

    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

  }

  return NextResponse.next();
}

export const config = {

  matcher: [

    "/dashboard/:path*",

    "/profile/:path*",

    "/admin/:path*",

  ],

};