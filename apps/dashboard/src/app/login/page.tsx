"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import billionSwitches from "@/assets/channels/a-billion-switches.png";
import paisaPanchayat from "@/assets/channels/paisa-panchayat.png";
import whyAtlas from "@/assets/channels/the-why-atlas.png";
import { LogoMark } from "@/components/brand";

/**
 * The front door of the multi-channel studio. Static names and logos only (bundled with the page,
 * served from /_next/static): nothing about a channel is fetched before sign-in.
 */
const CHANNELS: { name: string; niche: string; logo: StaticImageData }[] = [
  { name: "Paisa Panchayat", niche: "Money", logo: paisaPanchayat },
  { name: "The Why Atlas", niche: "Maps", logo: whyAtlas },
  { name: "A Billion Switches", niche: "Tech", logo: billionSwitches },
];

function Login() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
      if (res.ok) {
        // only same-site paths, never an absolute URL from the query string
        router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
        router.refresh();
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
        <div className="w-full max-w-[420px] animate-slide-up">
          <div className="text-center">
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">Every channel, one studio</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink2">Videos, uploads, numbers and agents for all your channels, in one place.</p>
          </div>

          {/* the live channels */}
          <ul aria-label="Channels in this studio" className="mt-7 grid grid-cols-3 gap-2">
            {CHANNELS.map(({ name, niche, logo }) => (
              <li key={name} className="flex flex-col items-center gap-2 rounded-xl border border-ring bg-surface/70 px-2 py-3 text-center shadow-xs backdrop-blur-sm">
                <Image src={logo} alt="" width={44} height={44} className="size-11 rounded-full ring-2 ring-surface" />
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-medium leading-tight">{name}</span>
                  <span className="mt-0.5 block text-[11.5px] text-muted">{niche}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* the password card */}
          <form onSubmit={submit} noValidate className="mt-5 rounded-2xl border border-ring bg-surface p-6 shadow-sm sm:p-7">
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
