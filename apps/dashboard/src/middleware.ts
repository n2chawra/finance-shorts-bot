import { NextRequest, NextResponse } from "next/server";

import { COOKIE, authConfigured, authDisabled, verifySession } from "@/lib/auth";

/** Every page and API route needs a valid session, except the sign-in page and its endpoint. */
export async function middleware(req: NextRequest) {
  if (authDisabled()) return NextResponse.next();
  const { pathname } = req.nextUrl;
  if (pathname === "/login" || pathname === "/api/login") return NextResponse.next();

  if (await verifySession(req.cookies.get(COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    const error = authConfigured() ? "Not signed in" : "Sign-in is not configured on the server";
    return NextResponse.json({ error }, { status: 401 });
  }
  const login = new URL("/login", req.url);
  if (pathname !== "/") login.searchParams.set("next", pathname + req.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  // everything except Next's own assets, the favicon and public sample files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sample/).*)"],
};
