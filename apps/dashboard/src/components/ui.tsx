/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { titleCase } from "@/lib/format";
import type { VideoStatus } from "@/lib/schemas";

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink2">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-ring bg-surface p-4 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Headline number with a label; not a chart. */
export function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-ring bg-surface p-3 md:p-4">
      <div className="text-xs font-medium text-ink2">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

// state is carried by glyph + label; colour only reinforces it
const STATUS: Record<VideoStatus, { glyph: string; color: string }> = {
  planned: { glyph: "…", color: "text-muted" },
  scripted: { glyph: "…", color: "text-muted" },
  verified: { glyph: "…", color: "text-muted" },
  rendered: { glyph: "…", color: "text-muted" },
  qa_passed: { glyph: "…", color: "text-muted" },
  queued: { glyph: "≡", color: "text-ink2" },
  scheduled: { glyph: "◷", color: "text-series" },
  published: { glyph: "✓", color: "text-good" },
  failed: { glyph: "✕", color: "text-critical" },
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-ring px-2 py-0.5 text-xs font-medium text-ink">
      <span aria-hidden className={`font-bold ${s.color}`}>{s.glyph}</span>
      {titleCase(status)}
    </span>
  );
}

export function ResultBadge({ ok, okLabel = "Passed", failLabel = "Failed" }: { ok: boolean; okLabel?: string; failLabel?: string }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-ring px-2 py-0.5 text-xs font-medium text-ink">
      <span aria-hidden className={`font-bold ${ok ? "text-good" : "text-critical"}`}>{ok ? "✓" : "✕"}</span>
      {ok ? okLabel : failLabel}
    </span>
  );
}

/** 9:16 thumbnail. */
export function Thumb({ src, alt, className = "w-14" }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" className={`aspect-[9/16] shrink-0 rounded-lg border border-ring bg-wash object-cover ${className}`} />;
}

export function Button({ children, onClick, tone = "default", disabled, title, type = "button" }: {
  children: React.ReactNode; onClick?: () => void; tone?: "default" | "primary" | "danger"; disabled?: boolean; title?: string; type?: "button" | "submit";
}) {
  const tones = {
    default: "border-ring bg-surface text-ink hover:bg-wash",
    primary: "border-transparent bg-ink text-surface hover:opacity-90",
    danger: "border-ring bg-surface text-critical hover:bg-wash",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}>
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border border-ring transition-colors disabled:opacity-40 ${checked ? "bg-ink" : "bg-wash"}`}>
      <span className={`absolute top-0.5 h-5.5 w-5.5 rounded-full transition-all ${checked ? "left-6 bg-surface" : "left-0.5 bg-muted"}`} />
    </button>
  );
}

export function Loading({ what = "Loading" }: { what?: string }) {
  return <p className="py-10 text-center text-sm text-muted">{what}…</p>;
}

export function ErrorNote({ error }: { error: unknown }) {
  return (
    <p role="alert" className="rounded-xl border border-ring bg-surface p-3 text-sm">
      <span aria-hidden className="font-bold text-critical">✕ </span>
      {error instanceof Error ? error.message : "Something went wrong"}
    </p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>;
}

export function VideoLink({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return <Link href={`/videos/${id}`} className={`hover:underline ${className}`}>{children}</Link>;
}
