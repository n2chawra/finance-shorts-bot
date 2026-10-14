"use client";

import { Clapperboard, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button, ErrorNote } from "@/components/ui";

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
    // the nav is hidden here, so cancel main's sidebar margin to centre the card
    <div className="grid min-h-[calc(100dvh-6rem)] place-items-center md:-ml-60">
      <form onSubmit={submit} className="w-full max-w-sm animate-pop rounded-2xl border border-ring bg-surface p-6 shadow-lift">
        <div className="mb-5 flex items-center gap-3">
          <span className="brand-gradient grid size-10 place-items-center rounded-xl text-brand-ink"><Clapperboard aria-hidden className="size-5" /></span>
          <div>
            <h1 className="text-lg font-semibold">Finance Shorts</h1>
            <p className="text-xs text-muted">Owner sign-in</p>
          </div>
        </div>
        <label className="block text-sm font-medium" htmlFor="password">Password</label>
        <div className="relative mt-1.5">
          <LockKeyhole aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input id="password" type="password" autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-ring bg-surface pl-9 pr-3 text-sm shadow-card" />
        </div>
        {error && <div className="mt-3"><ErrorNote error={error} /></div>}
        <div className="mt-5 flex justify-end">
          <Button type="submit" tone="primary" disabled={busy || !password}>{busy ? "Signing in…" : "Sign in"}</Button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
