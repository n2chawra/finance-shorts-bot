import { NextResponse } from "next/server";
import { z } from "zod";

import { COOKIE, SESSION_DAYS, authConfigured, createSession, safeEqual } from "@/lib/auth";

const Body = z.object({ password: z.string().min(1).max(200) });

/** Sign in: checks the password and sets the session cookie. */
export async function POST(req: Request) {
  if (!authConfigured()) return NextResponse.json({ error: "Sign-in is not configured on the server" }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  const ok = parsed.success && safeEqual(parsed.data.password, process.env.DASHBOARD_PASSWORD!);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await createSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86_400,
  });
  return res;
}

/** Sign out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
