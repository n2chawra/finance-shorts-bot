import { NextRequest, NextResponse } from "next/server";

import { COOKIE, authConfigured, authDisabled, verifySession } from "@/lib/auth";
import { isPublicPage } from "@/lib/public-pages";

/** Where sign-in lands when nothing else was asked for: every channel side by side (owner, 2026-11-19). */
const LANDING = "/portfolio";

/** Every page and API route needs a valid session, except the sign-in page, its endpoint and the public pages (/about, /privacy, /terms). */
export async function middleware(req: NextRequest) {
  if (authDisabled()) return NextResponse.next();
  const { pathname } = req.nextUrl;
  // the sign-in page returns to `next`, else "/": with no `next` it lands on All channels
  if (pathname === "/login" && !req.nextUrl.searchParams.has("next")) {
    const to = req.nextUrl.clone();
    to.searchParams.set("next", LANDING);
    return NextResponse.redirect(to);
  }
  if (pathname === "/login" || pathname === "/api/login" || pathname === "/api/health" || isPublicPage(pathname)) return NextResponse.next();

  if (await verifySession(req.cookies.get(COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    const error = authConfigured() ? "Not signed in" : "Sign-in is not configured on the server";
    return NextResponse.json({ error }, { status: 401 });
  }
  const login = new URL("/login", req.url);
  login.searchParams.set("next", pathname === "/" ? LANDING : pathname + req.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  // everything except Next's own assets, the favicon and public sample files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sample/).*)"],
};
