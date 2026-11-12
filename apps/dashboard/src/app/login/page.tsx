"use client";

import { ArrowRight, Bot, Eye, EyeOff, LockKeyhole, Sparkles, TrendingUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { LogoMark, Wordmark } from "@/components/brand";
import { ErrorNote } from "@/components/ui";

function Login() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) {
      // only same-site paths, never an absolute URL from the query string
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setError(new Error(body?.error ?? "Sign-in failed"));
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />
      <div className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center gap-2.5 lg:hidden"><LogoMark className="size-9" /><Wordmark /></div>
        <div className="flex flex-1 items-center justify-center py-10">
          <form onSubmit={submit} className="w-full max-w-[380px] animate-slide-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ring bg-surface px-2.5 py-1 text-xs font-medium text-ink2 shadow-card">
              <LockKeyhole aria-hidden className="size-3.5 text-brand-text" />Owner access only
            </span>
            <h1 className="mt-5 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em]">Sign in to the studio</h1>
            <p className="mt-2.5 text-sm leading-relaxed text-ink2">Your channel&apos;s backlog, uploads, analytics and the agents that run it, in one place.</p>
            <label className="mt-8 block text-[13px] font-medium" htmlFor="password">Password</label>
            <div className="relative mt-2">
              <input id="password" type={show ? "text" : "password"} autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the dashboard password"
                className="h-12 w-full rounded-xl border border-ring bg-surface pl-4 pr-11 text-[15px] shadow-card outline-none transition placeholder:text-muted hover:border-ring-strong focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft" />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-wash-2 hover:text-ink">
                {show ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
              </button>
            </div>
            {error && <div className="mt-3"><ErrorNote error={error} /></div>}
            <button type="submit" disabled={busy || !password}
              className="group mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-primary-ink shadow-lift transition hover:opacity-90 disabled:opacity-40">
              {busy ? "Signing in…" : <>Sign in <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></>}
            </button>
            <p className="mt-6 text-center text-xs text-muted">Sessions stay signed in on this device. Sign out from the sidebar.</p>
          </form>
        </div>
        <p className="text-center text-[11px] text-muted lg:text-left">Paisa Panchayat · automated finance Shorts</p>
      </div>
    </div>
  );
}

/** The dark brand half of the sign-in page: logo, a line about the channel and a few drawn cards. Desktop only. */
function BrandPanel() {
  const bars = [28, 36, 31, 44, 40, 52, 49, 63, 58, 71, 69, 84];
  return (
    <div className="relative hidden overflow-hidden bg-rail p-10 text-rail-ink lg:flex lg:flex-col">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_10%,rgba(245,165,36,0.28),transparent_60%),radial-gradient(60%_50%_at_95%_95%,rgba(25,158,112,0.22),transparent_60%)]" />
      <div aria-hidden className="grain absolute inset-0 opacity-[0.07] mix-blend-overlay" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(70%_70%_at_40%_40%,#000,transparent)]" />

      <div className="relative flex items-center gap-3"><LogoMark className="size-10" /><Wordmark tone="rail" sub="Studio" /></div>

      <div className="relative mt-auto max-w-[520px]">
        <h2 className="text-[44px] font-semibold leading-[1.02] tracking-[-0.04em]">
          True money stories,<br /><span className="bg-gradient-to-r from-[#fcc964] to-[#f5a524] bg-clip-text text-transparent">made while you sleep.</span>
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-rail-ink2">Three Shorts a day and a long video a week, written, checked, rendered and uploaded by the pipeline. The agents test one change a week and keep what works.</p>
      </div>

      <div aria-hidden className="relative mt-10 grid grid-cols-[1.3fr_1fr] gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rail-ink2"><TrendingUp className="size-3.5 text-[#fcc964]" />Analytics</div>
          <div className="mt-2 font-display text-xl font-semibold tracking-[-0.02em]">Views, subscribers, retention</div>
          <div className="mt-3 flex h-16 items-end gap-1">
            {bars.map((h, i) => <span key={i} className="flex-1 rounded-t-[3px] bg-gradient-to-t from-[#f5a524]/30 to-[#fcc964]" style={{ height: `${h}%`, opacity: 0.45 + i * 0.045 }} />)}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rail-ink2"><Sparkles className="size-3.5 text-[#fcc964]" />Next upload</div>
            <div className="mt-2 font-mono text-lg font-medium tracking-tight">07:07 · 12:37 · 19:07</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rail-ink2"><Bot className="size-3.5 text-[#fcc964]" />Agents</div>
            <div className="mt-2 flex items-center gap-2 text-sm"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#22c07a] opacity-60" /><span className="relative size-2 rounded-full bg-[#22c07a]" /></span>Running nightly</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
