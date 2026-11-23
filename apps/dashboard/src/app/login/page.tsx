"use client";

import { ArrowRight, Eye, EyeOff, LayoutGrid, Loader2, Lock, ShieldCheck } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { LogoMark } from "@/components/brand";
import { CHANNEL_BRAND } from "@/lib/channel-brand";
import { CHANNEL_COOKIE } from "@/lib/channels";

/**
 * The front door of the multi-channel studio. Static names and logos only (bundled with the page,
 * served from /_next/static): nothing about a channel is fetched before sign-in.
 */
const CHANNELS: { id: string; name: string; niche: string; logo: StaticImageData }[] =
  Object.entries(CHANNEL_BRAND).map(([id, b]) => ({ id, name: b.name, niche: b.niche, logo: b.logo }));

/** What sign-in opens first: "all" (every channel side by side) or one channel's own pages. Remembered on
 * this device (owner, 2026-11-19: "from login I set which channel I see first, so I don't switch after"). */
const OPEN_FIRST = "open-first";
const YEAR = 60 * 60 * 24 * 365;
const readCookie = (name: string) => document.cookie.split("; ").find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);
const ALL_CHANNELS = "/portfolio";

function Login() {
  const next = useSearchParams().get("next");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [first, setFirst] = useState("all");
  useEffect(() => {
    const saved = decodeURIComponent(readCookie(OPEN_FIRST) ?? "all");
    if (saved === "all" || CHANNELS.some((c) => c.id === saved)) setFirst(saved);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
      if (res.ok) {
        document.cookie = `${OPEN_FIRST}=${encodeURIComponent(first)}; path=/; max-age=${YEAR}; samesite=lax`;
        if (first !== "all") document.cookie = `${CHANNEL_COOKIE}=${encodeURIComponent(first)}; path=/; max-age=${YEAR}; samesite=lax`;
        // only same-site paths, never an absolute URL from the query string; the default landing follows the pick
        const asked = next && next.startsWith("/") && !next.startsWith("//") ? next : ALL_CHANNELS;
        // a full page load, not router.replace: the in-app data cache (60 s fresh) still held the channel open before
        // sign-in, so the dashboard showed the old channel until a manual refresh (owner, 2026-11-23)
        window.location.replace(asked === ALL_CHANNELS && first !== "all" ? "/" : asked);
        return;
      }
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Sign-in failed. Try again.");
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
    }
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-plane text-ink">
      {/* a soft wash in the brand colours, from the theme's own tokens so it follows light and dark */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,var(--brand-soft),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60 [mask-image:radial-gradient(55%_40%_at_50%_10%,#000,transparent)]" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center gap-2.5 px-4 pt-6 sm:px-8">
        <LogoMark className="size-8" />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">Channel Studio</span>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[560px] animate-slide-up">
          <div className="text-center">
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">Every channel, one studio</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink2">Videos, uploads, numbers and agents for all your channels, in one place.</p>
          </div>

          {/* the live channels: pick the one sign-in opens first */}
          <p id="open-first" className="mt-7 text-center text-[12.5px] font-medium text-ink2">Open first</p>
          <div role="radiogroup" aria-labelledby="open-first" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[{ id: "all", name: "All channels", niche: "Side by side", logo: null as StaticImageData | null }, ...CHANNELS].map(({ id, name, niche, logo }) => {
              const on = first === id;
              return (
                <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setFirst(id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center shadow-xs backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    on ? "border-brand bg-brand-soft" : "border-ring bg-surface/70 hover:border-ring-strong"}`}>
                  {logo
                    ? <Image src={logo} alt="" width={44} height={44} className="size-11 rounded-full ring-2 ring-surface" />
                    : <span className="grid size-11 place-items-center rounded-full bg-surface-3 ring-2 ring-surface"><LayoutGrid aria-hidden className="size-5 text-ink2" /></span>}
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-medium leading-tight">{name}</span>
                    <span className="mt-0.5 block text-[11.5px] text-muted">{niche}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* the password card */}
          <form onSubmit={submit} noValidate className="mx-auto mt-5 max-w-[420px] rounded-2xl border border-ring bg-surface p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-text"><Lock aria-hidden className="size-4" /></span>
              <div>
                <h2 className="text-[16px] font-semibold leading-tight">Sign in</h2>
                <p className="text-[13px] text-ink2">Enter the studio password to continue.</p>
              </div>
            </div>

            <label className="mt-6 block text-[13px] font-medium" htmlFor="password">Password</label>
            <div className="relative mt-2">
              <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required autoFocus
                value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                readOnly={busy} aria-invalid={error ? true : undefined} aria-describedby={error ? "password-error" : undefined}
                placeholder="Enter your password"
                className={`h-11 w-full rounded-lg border bg-surface pl-3.5 pr-11 text-[14px] shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted read-only:opacity-60 focus-visible:outline-none focus-visible:ring-4 ${
                  error ? "border-critical focus-visible:border-critical focus-visible:ring-critical-soft" : "border-ring hover:border-ring-strong focus-visible:border-brand focus-visible:ring-brand-soft"
                }`} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} aria-controls="password"
                className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                {show ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
              </button>
            </div>
            <p id="password-error" role="alert" aria-live="assertive" className={error ? "mt-2 animate-fade text-[13px] text-critical-text" : "sr-only"}>{error ?? ""}</p>

            <button type="submit" disabled={busy || !password} aria-busy={busy}
              className="group mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-medium text-primary-ink shadow-xs transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-45">
              {busy
                ? <><Loader2 aria-hidden className="size-4 animate-spin" />Signing in…</>
                : <>Continue <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></>}
            </button>
            <p className="mt-5 flex items-center gap-2 text-[12.5px] text-muted"><ShieldCheck aria-hidden className="size-4 shrink-0 text-good" />Owner access only. You stay signed in on this device.</p>
          </form>
        </div>
      </main>

      <footer className="relative mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pb-6 text-[12.5px] text-muted sm:px-8">
        <span>© 2026 Channel Studio</span>
        <nav aria-label="Legal" className="flex gap-5">
          <Link href="/about" className="rounded hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">About</Link>
          <Link href="/privacy" className="rounded hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Privacy</Link>
          <Link href="/terms" className="rounded hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
