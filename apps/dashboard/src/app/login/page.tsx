"use client";

import { Clapperboard, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { ErrorNote } from "@/components/ui";

function Login() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [busy, setBusy] = useState(false);

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
    <div className="dot-grid relative grid min-h-dvh place-items-center px-4">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--plane)_70%)]" />
      <form onSubmit={submit} className="relative w-full max-w-[360px] animate-pop rounded-2xl border border-ring bg-surface p-6 shadow-lift">
        <span className="brand-gradient grid size-10 place-items-center rounded-xl text-white shadow-card"><Clapperboard aria-hidden className="size-5" /></span>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Sign in to Money in 60</h1>
        <p className="mt-1 text-[13px] text-muted">The Finance Shorts Bot dashboard. Owner access only.</p>
        <label className="mt-5 block text-[13px] font-medium" htmlFor="password">Password</label>
        <div className="relative mt-1.5">
          <LockKeyhole aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input id="password" type="password" autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-lg border border-ring bg-surface pl-9 pr-3 text-sm shadow-card outline-none transition-colors hover:border-ring-strong focus-visible:border-brand" />
        </div>
        {error && <div className="mt-3"><ErrorNote error={error} /></div>}
        <button type="submit" disabled={busy || !password}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-ink shadow-card transition-opacity hover:opacity-90 disabled:opacity-40">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
