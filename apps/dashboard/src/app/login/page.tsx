"use client";

import { ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { LogoMark } from "@/components/brand";
import { ErrorNote } from "@/components/ui";

const WORDS = ["Write", "Check", "Render", "Upload", "Learn", "Repeat"];
const FILLS = ["bg-lime", "bg-pink", "bg-sky", "bg-sun", "bg-grape", "bg-mint"];

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
    <div className="flex min-h-dvh flex-col">
      {/* masthead */}
      <div className="flex h-16 items-center justify-between border-b-2 border-edge bg-[#0b0b0b] px-4 text-[#f3eee1] md:px-8">
        <span className="flex items-center gap-3">
          <LogoMark className="size-9" />
          <span className="font-display text-lg uppercase">Paisa Panchayat</span>
        </span>
        <span className="nb-label hidden border-2 border-[#f3eee1]/30 px-2 py-1 sm:inline">Owner access only</span>
      </div>
      <div aria-hidden className="h-8 overflow-hidden border-b-2 border-edge bg-lime text-[#0b0b0b]">
        <div className="flex h-full w-max animate-marquee items-center whitespace-nowrap font-mono text-[11.5px] font-bold uppercase tracking-wider">
          {[0, 1].map((k) => <span key={k} className="flex">{Array.from({ length: 4 }, (_, i) => <span key={i} className="pr-6">True money stories ✦ 3 Shorts a day ✦ 1 long video a week ✦ every number computed by code ✦ </span>)}</span>)}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* the poster */}
        <div className="hidden lg:block">
          <p className="nb-label text-muted">The control room</p>
          <div aria-hidden className="mt-4 flex flex-wrap gap-3">
            {WORDS.map((w, i) => (
              <span key={w} className={`nb inline-block px-4 py-2 font-display text-[44px] uppercase leading-none text-on-accent ${FILLS[i]} ${i % 2 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]"}`}>{w}</span>
            ))}
          </div>
          <p className="mt-8 max-w-[500px] text-lg font-medium leading-snug text-ink2">
            The pipeline makes the videos while you sleep. This is where you see what it made, what went out, how it did,
            and what the agents changed overnight.
          </p>
        </div>

        {/* the form */}
        <form onSubmit={submit} className="w-full animate-pop border-2 border-edge bg-surface shadow-[10px_10px_0_0_var(--hard)] lg:max-w-[460px] lg:justify-self-end">
          <div className="flex items-center gap-3 border-b-2 border-edge bg-sun px-5 py-4 on-accent">
            <span className="grid size-10 place-items-center border-2 border-edge bg-surface text-ink"><KeyRound aria-hidden strokeWidth={2.5} className="size-5" /></span>
            <h1 className="font-display text-[26px] uppercase leading-none">Sign in</h1>
          </div>
          <div className="p-5 md:p-6">
            <p className="text-[15px] font-medium text-ink2">One password for the owner. Enter it to open the control room.</p>
            <label className="nb-label mt-6 block text-ink" htmlFor="password">Password</label>
            <div className="relative mt-2">
              <input id="password" type={show ? "text" : "password"} autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="h-14 w-full border-2 border-edge bg-surface pl-4 pr-14 font-mono text-lg font-bold outline-none transition-shadow placeholder:text-muted focus-visible:shadow-[4px_4px_0_0_var(--lime)] focus-visible:outline-none" />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-0 top-0 grid h-14 w-14 place-items-center border-l-2 border-edge text-ink hover:bg-wash-2">
                {show ? <EyeOff aria-hidden strokeWidth={2.5} className="size-5" /> : <Eye aria-hidden strokeWidth={2.5} className="size-5" />}
              </button>
            </div>
            {error && <div className="mt-4"><ErrorNote error={error} /></div>}
            <button type="submit" disabled={busy || !password}
              className="nb nb-press mt-5 flex h-14 w-full items-center justify-center gap-2 bg-lime font-display text-lg uppercase text-on-accent disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none">
              {busy ? "Opening…" : <>Enter <ArrowRight aria-hidden strokeWidth={3} className="size-5" /></>}
            </button>
            <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Stays signed in on this device</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
