"use client";

import { ArrowRight, Bot, CalendarClock, Eye, EyeOff, LineChart, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { LogoMark, Wordmark } from "@/components/brand";
import { ErrorNote } from "@/components/ui";

const POINTS = [
  { icon: CalendarClock, title: "Every upload, on schedule", body: "Three Shorts a day and a long video a week, queued and posted for you." },
  { icon: LineChart, title: "Numbers you can trust", body: "Views, retention and reach from YouTube, checked against the source every night." },
  { icon: Bot, title: "Agents that improve the channel", body: "One tested change a week, kept only when the numbers say it works." },
];

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
    <div className="grid min-h-dvh bg-surface lg:grid-cols-2">
      {/* the form */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center gap-2.5"><LogoMark className="size-8" /><Wordmark sub="Channel studio" /></div>
        <div className="flex flex-1 items-center justify-center py-12">
          <form onSubmit={submit} className="w-full max-w-[380px] animate-slide-up">
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em]">Sign in</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-ink2">Welcome back. Enter the dashboard password to continue.</p>

            <label className="mt-8 block text-[13px] font-medium text-ink" htmlFor="password">Password</label>
            <div className="relative mt-2">
              <input id="password" type={show ? "text" : "password"} autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11 w-full rounded-lg border border-ring bg-surface pl-3.5 pr-11 text-[14px] shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted hover:border-ring-strong focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft" />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-ink">
                {show ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
              </button>
            </div>
            {error && <div className="mt-3"><ErrorNote error={error} /></div>}
            <button type="submit" disabled={busy || !password}
              className="group mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-medium text-primary-ink shadow-xs transition-colors hover:bg-brand-hover disabled:opacity-45">
              {busy ? "Signing in…" : <>Continue <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></>}
            </button>
            <p className="mt-6 flex items-center gap-2 text-[12.5px] text-muted"><ShieldCheck aria-hidden className="size-4 text-good" />Owner access only. You stay signed in on this device.</p>
          </form>
        </div>
        <p className="text-[12px] text-muted">© Paisa Panchayat · Finance Shorts automation</p>
      </div>

      {/* the brand panel */}
      <div className="relative hidden overflow-hidden bg-[#0b1020] p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(79,117,255,0.35),transparent_60%),radial-gradient(60%_50%_at_10%_95%,rgba(124,92,245,0.28),transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(60%_60%_at_50%_45%,#000,transparent)]" />
        <div className="relative mx-auto w-full max-w-[460px]">
          <p className="text-[13px] font-medium text-[#a9b8ff]">Your channel, run end to end</p>
          <h2 className="mt-3 text-[34px] font-semibold leading-[1.12] tracking-[-0.03em]">The control room for every Short you publish.</h2>
          <ul className="mt-10 flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#c3cdff]"><Icon aria-hidden className="size-5" /></span>
                <span>
                  <span className="block text-[14.5px] font-medium">{title}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-white/60">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
