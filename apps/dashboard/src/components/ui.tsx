/* eslint-disable @next/next/no-img-element */
"use client";

import { Check, ChevronDown, CircleAlert, CircleCheck, CircleX, Clock, ListOrdered, Loader, type LucideIcon } from "lucide-react";
import { animate, motion } from "motion/react";
import Link from "next/link";
import { AlertDialog, Progress, Select, Slider as RSlider, Switch, Tooltip } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { titleCase } from "@/lib/format";
import type { VideoStatus } from "@/lib/schemas";

// ---------------- layout ----------------

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink2">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

/** Staggers its direct `Card`/`Tile` children in on mount. */
export function Stagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
      {children}
    </motion.div>
  );
}

const rise = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export function Card({ title, action, children, className = "", icon: Icon }: {
  title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; icon?: LucideIcon;
}) {
  return (
    <motion.section variants={rise} className={`rounded-2xl border border-ring bg-surface p-4 shadow-card md:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              {Icon && <Icon aria-hidden className="size-4 text-brand-text" />}
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}

/** A number that counts up to its value when it appears or changes. */
export function Num({ value, fmt }: { value: number; fmt: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const fmtRef = useRef(fmt);
  fmtRef.current = fmt;
  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.9, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = fmtRef.current(v); },
    });
    from.current = value;
    return () => controls.stop();
  }, [value]);
  return <span ref={ref} className="tabular-nums">{fmt(value)}</span>;
}

const TONES = {
  brand: "bg-brand-soft text-brand-text",
  info: "bg-info-soft text-info-text",
  good: "bg-good-soft text-good-text",
  warning: "bg-warning-soft text-warning-text",
  critical: "bg-critical-soft text-critical-text",
  neutral: "bg-wash text-ink2",
};
export type Tone = keyof typeof TONES;

/** Headline number with a label; not a chart. */
export function Tile({ label, value, sub, icon: Icon, tone = "brand" }: { label: string; value: React.ReactNode; sub?: string; icon?: LucideIcon; tone?: Tone }) {
  return (
    <motion.div variants={rise} whileHover={{ y: -3 }} className="rounded-2xl border border-ring bg-surface p-3 shadow-card transition-shadow hover:shadow-lift md:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium text-ink2">{label}</div>
        {Icon && <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${TONES[tone]}`}><Icon aria-hidden className="size-4" /></span>}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </motion.div>
  );
}

// ---------------- badges ----------------

// state is carried by icon + label; colour only reinforces it
const STATUS: Record<VideoStatus, { icon: LucideIcon; tone: Tone }> = {
  planned: { icon: Loader, tone: "neutral" },
  scripted: { icon: Loader, tone: "neutral" },
  verified: { icon: Loader, tone: "neutral" },
  rendered: { icon: Loader, tone: "neutral" },
  qa_passed: { icon: Check, tone: "neutral" },
  queued: { icon: ListOrdered, tone: "neutral" },
  scheduled: { icon: Clock, tone: "info" },
  published: { icon: CircleCheck, tone: "good" },
  failed: { icon: CircleX, tone: "critical" },
};

export function Badge({ tone = "neutral", icon: Icon, children }: { tone?: Tone; icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {Icon && <Icon aria-hidden className="size-3.5" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: VideoStatus }) {
  return <Badge tone={STATUS[status].tone} icon={STATUS[status].icon}>{titleCase(status)}</Badge>;
}

export function ResultBadge({ ok, okLabel = "Passed", failLabel = "Failed" }: { ok: boolean; okLabel?: string; failLabel?: string }) {
  return <Badge tone={ok ? "good" : "critical"} icon={ok ? CircleCheck : CircleX}>{ok ? okLabel : failLabel}</Badge>;
}

/** 9:16 thumbnail. */
export function Thumb({ src, alt, className = "w-14" }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" className={`aspect-[9/16] shrink-0 rounded-lg border border-ring bg-wash object-cover ${className}`} />;
}

// ---------------- controls ----------------

const BUTTON_TONES = {
  default: "border-ring bg-surface text-ink hover:bg-wash",
  primary: "border-transparent brand-gradient text-brand-ink shadow-card hover:brightness-110",
  danger: "border-ring bg-surface text-critical-text hover:bg-critical-soft",
  ghost: "border-transparent text-ink2 hover:bg-wash hover:text-ink",
};

type ButtonProps = {
  children: React.ReactNode; onClick?: () => void; tone?: keyof typeof BUTTON_TONES; disabled?: boolean; title?: string;
  type?: "button" | "submit"; icon?: LucideIcon; iconOnly?: boolean;
};

export const buttonClass = (tone: keyof typeof BUTTON_TONES = "default", iconOnly = false) =>
  `inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-[background-color,filter,transform] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${iconOnly ? "w-9" : "px-3 py-1.5"} ${BUTTON_TONES[tone]}`;

export function Button({ children, onClick, tone = "default", disabled, title, type = "button", icon: Icon, iconOnly }: ButtonProps) {
  const button = (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={iconOnly ? title : undefined} className={buttonClass(tone, iconOnly)}>
      {Icon && <Icon aria-hidden className="size-4" />}
      {iconOnly ? null : children}
    </button>
  );
  if (!title) return button;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild><span className="inline-flex">{button}</span></Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content sideOffset={6} className="z-50 animate-fade rounded-md bg-ink px-2 py-1 text-xs text-surface shadow-lift">{title}</Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <Switch.Root checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label}
      className="relative h-7 w-12 shrink-0 rounded-full border border-ring bg-wash transition-colors disabled:opacity-40 data-[state=checked]:border-transparent data-[state=checked]:bg-brand">
      <Switch.Thumb className="block size-5.5 translate-x-0.5 rounded-full bg-surface shadow-card transition-transform duration-200 data-[state=checked]:translate-x-[22px]" />
    </Switch.Root>
  );
}

export function SelectField({ value, onChange, options, label, all }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string; all: string;
}) {
  // Radix Select items cannot have an empty value, so "all" stands in for "no filter"
  return (
    <Select.Root value={value || "__all"} onValueChange={(v) => onChange(v === "__all" ? "" : v)}>
      <Select.Trigger aria-label={label} className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-ring bg-surface px-3 text-sm shadow-card hover:bg-wash data-[placeholder]:text-muted">
        <Select.Value />
        <Select.Icon><ChevronDown aria-hidden className="size-4 text-muted" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={6} className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] animate-pop overflow-hidden rounded-xl border border-ring bg-surface p-1 shadow-lift">
          <Select.Viewport>
            {[{ value: "__all", label: all }, ...options].map((o) => (
              <Select.Item key={o.value} value={o.value} className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-sm outline-none data-[highlighted]:bg-brand-soft data-[highlighted]:text-brand-text">
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator><Check aria-hidden className="size-4" /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function Slider({ value, onCommit, min, max, step, label, disabled }: {
  value: number; onCommit: (v: number) => void; min: number; max: number; step: number; label: string; disabled?: boolean;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <div className="flex items-center gap-3">
      <RSlider.Root value={[local]} min={min} max={max} step={step} disabled={disabled} aria-label={label}
        onValueChange={([v]) => setLocal(v)} onValueCommit={([v]) => onCommit(v)}
        className="relative flex h-5 flex-1 touch-none select-none items-center data-[disabled]:opacity-40">
        <RSlider.Track className="relative h-1.5 flex-1 rounded-full bg-wash">
          <RSlider.Range className="absolute h-full rounded-full bg-brand" />
        </RSlider.Track>
        <RSlider.Thumb className="block size-5 rounded-full border-2 border-brand bg-surface shadow-card transition-transform hover:scale-110 focus-visible:outline-offset-4" />
      </RSlider.Root>
      <span className="w-8 text-right text-sm font-semibold tabular-nums">{local.toFixed(1)}</span>
    </div>
  );
}

export function Meter({ value, max, label, tone = "brand" }: { value: number; max: number; label: string; tone?: "brand" | "series" }) {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <Progress.Root value={value} max={max} aria-label={label} className="h-2.5 overflow-hidden rounded-full bg-wash">
      <Progress.Indicator asChild>
        <motion.div className={`h-full rounded-full ${tone === "brand" ? "brand-gradient" : "bg-series"}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
      </Progress.Indicator>
    </Progress.Root>
  );
}

/** A button that asks for confirmation in a dialog before running `onConfirm`. */
export function ConfirmButton({ label, title, description, confirmLabel, onConfirm, disabled, icon }: {
  label: string; title: string; description: string; confirmLabel: string; onConfirm: () => void; disabled?: boolean; icon?: LucideIcon;
}) {
  const Icon = icon;
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger disabled={disabled} className={buttonClass("danger")}>
        {Icon && <Icon aria-hidden className="size-4" />}
        {label}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 animate-fade bg-black/45 backdrop-blur-[2px]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 animate-pop rounded-2xl border border-ring bg-surface p-5 shadow-lift">
          <AlertDialog.Title className="text-base font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-ink2">{description}</AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel className={buttonClass("default")}>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onClick={onConfirm} className="inline-flex min-h-9 items-center rounded-lg bg-critical px-3 py-1.5 text-sm font-medium text-white hover:brightness-110">{confirmLabel}</AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

// ---------------- states ----------------

export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-4">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-ring bg-critical-soft p-3 text-sm">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" />
      {error instanceof Error ? error.message : "Something went wrong"}
    </p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>;
}

export function VideoLink({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return <Link href={`/videos/${id}`} className={`transition-colors hover:text-brand-text ${className}`}>{children}</Link>;
}
