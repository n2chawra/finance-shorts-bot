/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, CircleAlert, Inbox, MoreHorizontal, type LucideIcon } from "lucide-react";
import { animate, motion, type Variants } from "motion/react";
import Link from "next/link";
import { AlertDialog, DropdownMenu, Progress, Select, Slider as RSlider, Switch, ToggleGroup, Tooltip } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { titleCase } from "@/lib/format";
import type { VideoStatus } from "@/lib/schemas";

// ---------------- layout ----------------

export function PageHeader({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] md:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink2">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

const rise: Variants = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] as const } } };

/** Staggers its direct `Card`/`Stat` children in on mount. */
export function Stagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }}>
      {children}
    </motion.div>
  );
}

export function Card({ title, description, action, children, className = "", icon: Icon, flush }: {
  title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string; icon?: LucideIcon;
  /** no inner padding: for tables and lists that run edge to edge */
  flush?: boolean;
}) {
  return (
    <motion.section variants={rise} className={`min-w-0 rounded-xl border border-ring bg-surface shadow-card ${flush ? "overflow-hidden" : "p-4 md:p-5"} ${className}`}>
      {(title || action) && (
        <div className={`flex items-start justify-between gap-3 ${flush ? "border-b border-line px-4 py-3 md:px-5" : "mb-4"}`}>
          <div className="min-w-0">
            {title && (
              <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                {Icon && <Icon aria-hidden className="size-4 text-muted" />}
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
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
      duration: 0.8, ease: [0.16, 1, 0.3, 1],
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
  neutral: "bg-wash-2 text-ink2",
};
export type Tone = keyof typeof TONES;

const DOTS: Record<Tone, string> = {
  brand: "bg-brand", info: "bg-series", good: "bg-good", warning: "bg-warning", critical: "bg-critical", neutral: "bg-muted",
};

/** "+12.4%" pill. `good` says whether up is good (views) or bad (failures). */
export function Delta({ value, upIsGood = true }: { value: number | null; upIsGood?: boolean }) {
  if (value === null || !Number.isFinite(value)) return null;
  const up = value >= 0;
  const tone: Tone = Math.abs(value) < 0.5 ? "neutral" : up === upIsGood ? "good" : "critical";
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${TONES[tone]}`}>
      <Icon aria-hidden className="size-3" />{up ? "+" : ""}{value.toFixed(Math.abs(value) < 10 ? 1 : 0)}%
    </span>
  );
}

/** KPI: label, big number, optional change and a small chart. Not a chart itself. */
export function Stat({ label, value, sub, delta, chart, icon: Icon, href }: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; delta?: React.ReactNode; chart?: React.ReactNode; icon?: LucideIcon; href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13px] text-ink2">{Icon && <Icon aria-hidden className="size-3.5 text-muted" />}{label}</span>
        {delta}
      </div>
      <div className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.02em] md:text-[28px]">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted">{sub}</div>}
      {chart && <div className="mt-3">{chart}</div>}
    </>
  );
  const cls = "block min-w-0 rounded-xl border border-ring bg-surface p-4 shadow-card transition-colors";
  return (
    <motion.div variants={rise} className="min-w-0">
      {href ? <Link href={href} className={`${cls} hover:border-ring-strong`}>{body}</Link> : <div className={cls}>{body}</div>}
    </motion.div>
  );
}

/** Old name, same thing. */
export function Tile({ label, value, sub, icon }: { label: string; value: React.ReactNode; sub?: string; icon?: LucideIcon; tone?: Tone }) {
  return <Stat label={label} value={value} sub={sub} icon={icon} />;
}

// ---------------- badges ----------------

// state is carried by the label; the dot only reinforces it
const STATUS: Record<VideoStatus, Tone> = {
  planned: "neutral", scripted: "neutral", verified: "neutral", rendered: "neutral", qa_passed: "neutral",
  queued: "brand", scheduled: "info", published: "good", failed: "critical",
};

export function Badge({ tone = "neutral", icon: Icon, children, dot }: { tone?: Tone; icon?: LucideIcon; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {dot && <span aria-hidden className={`size-1.5 rounded-full ${DOTS[tone]}`} />}
      {Icon && <Icon aria-hidden className="size-3.5" />}
      {children}
    </span>
  );
}

/** Outline pill with a coloured dot: quieter than a filled badge, for dense lists. */
export function StatusBadge({ status }: { status: VideoStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-ring bg-surface px-1.5 py-0.5 text-xs font-medium text-ink2">
      <span aria-hidden className={`size-1.5 rounded-full ${DOTS[STATUS[status]]}`} />
      {titleCase(status)}
    </span>
  );
}

export function ResultBadge({ ok, okLabel = "Passed", failLabel = "Failed" }: { ok: boolean; okLabel?: string; failLabel?: string }) {
  return <Badge tone={ok ? "good" : "critical"} dot>{ok ? okLabel : failLabel}</Badge>;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-ring bg-surface-2 px-1 font-sans text-[11px] font-medium text-muted">{children}</kbd>;
}

/** 9:16 thumbnail. */
export function Thumb({ src, alt, className = "w-14" }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" className={`aspect-[9/16] shrink-0 rounded-md border border-ring bg-surface-2 object-cover ${className}`} />;
}

// ---------------- controls ----------------

const BUTTON_TONES = {
  default: "border-ring bg-surface text-ink shadow-card hover:bg-surface-2",
  primary: "border-transparent bg-primary text-primary-ink shadow-card hover:opacity-90",
  danger: "border-ring bg-surface text-critical-text shadow-card hover:bg-critical-soft",
  ghost: "border-transparent text-ink2 hover:bg-wash-2 hover:text-ink",
};
export type ButtonTone = keyof typeof BUTTON_TONES;

type ButtonProps = {
  children: React.ReactNode; onClick?: () => void; tone?: ButtonTone; disabled?: boolean; title?: string;
  type?: "button" | "submit"; icon?: LucideIcon; iconOnly?: boolean; size?: "sm" | "md";
};

export const buttonClass = (tone: ButtonTone = "default", iconOnly = false, size: "sm" | "md" = "md") =>
  `inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border text-[13px] font-medium transition-[background-color,opacity,transform,border-color] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${
    size === "sm" ? (iconOnly ? "size-7" : "h-7 px-2") : iconOnly ? "size-8" : "h-8 px-3"} ${BUTTON_TONES[tone]}`;

export function Button({ children, onClick, tone = "default", disabled, title, type = "button", icon: Icon, iconOnly, size = "md" }: ButtonProps) {
  const button = (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={iconOnly ? title : undefined} className={buttonClass(tone, iconOnly, size)}>
      {Icon && <Icon aria-hidden className="size-4" />}
      {iconOnly ? null : children}
    </button>
  );
  if (!title) return button;
  return <Tip label={title}><span className="inline-flex">{button}</span></Tip>;
}

export function Tip({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content sideOffset={6} className="z-50 max-w-64 animate-fade rounded-md bg-primary px-2 py-1 text-xs text-primary-ink shadow-lift">{label}</Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/** Segmented control (one of a few options), e.g. a chart's time range or a list filter. */
export function Segmented<T extends string>({ value, onChange, options, label }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; label: string;
}) {
  return (
    <ToggleGroup.Root type="single" value={value} onValueChange={(v) => v && onChange(v as T)} aria-label={label}
      className="inline-flex h-8 items-center rounded-lg border border-ring bg-surface-2 p-0.5">
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value}
          className="relative h-full rounded-md px-2.5 text-[13px] font-medium text-ink2 transition-colors hover:text-ink data-[state=on]:text-ink">
          {value === o.value && <motion.span layoutId={`seg-${label}`} className="absolute inset-0 rounded-md border border-ring bg-surface shadow-card" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
          <span className="relative flex items-center gap-1.5">{o.label}</span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export type MenuItem = { label: string; icon?: LucideIcon; onSelect: () => void; danger?: boolean; disabled?: boolean } | "separator";

/** "⋯" button with a list of actions. */
export function ActionMenu({ items, label = "More actions" }: { items: MenuItem[]; label?: string }) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger aria-label={label} className={buttonClass("ghost", true)}>
        <MoreHorizontal aria-hidden className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={4} className="z-50 min-w-44 animate-pop rounded-lg border border-ring bg-surface p-1 shadow-lift">
          {items.map((it, i) => it === "separator" ? <DropdownMenu.Separator key={i} className="my-1 h-px bg-line" /> : (
            <DropdownMenu.Item key={it.label} disabled={it.disabled} onSelect={it.onSelect}
              className={`flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-wash-2 ${it.danger ? "text-critical-text" : "text-ink"}`}>
              {it.icon && <it.icon aria-hidden className="size-4 opacity-70" />}{it.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <Switch.Root checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label}
      className="relative h-5 w-9 shrink-0 rounded-full bg-wash-2 transition-colors disabled:opacity-40 data-[state=checked]:bg-brand">
      <Switch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-200 data-[state=checked]:translate-x-[18px]" />
    </Switch.Root>
  );
}

export const fieldClass = "h-8 w-full rounded-lg border border-ring bg-surface px-2.5 text-[13px] shadow-card outline-none transition-colors placeholder:text-muted hover:border-ring-strong focus-visible:border-brand disabled:opacity-40";

export function SelectField({ value, onChange, options, label, all }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string; all: string;
}) {
  // Radix Select items cannot have an empty value, so "all" stands in for "no filter"
  return (
    <Select.Root value={value || "__all"} onValueChange={(v) => onChange(v === "__all" ? "" : v)}>
      <Select.Trigger aria-label={label} className={`${fieldClass} flex items-center justify-between gap-2 text-left`}>
        <span className="truncate"><Select.Value /></span>
        <Select.Icon><ChevronDown aria-hidden className="size-3.5 text-muted" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={4} className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] animate-pop overflow-hidden rounded-lg border border-ring bg-surface p-1 shadow-lift">
          <Select.Viewport>
            {[{ value: "__all", label: all }, ...options].map((o) => (
              <Select.Item key={o.value} value={o.value} className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-wash-2">
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator><Check aria-hidden className="size-3.5" /></Select.ItemIndicator>
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
        <RSlider.Track className="relative h-1 flex-1 rounded-full bg-wash-2">
          <RSlider.Range className="absolute h-full rounded-full bg-brand" />
        </RSlider.Track>
        <RSlider.Thumb className="block size-4 rounded-full border border-ring-strong bg-white shadow-card transition-transform hover:scale-110 focus-visible:outline-offset-4" />
      </RSlider.Root>
      <span className="w-8 text-right text-[13px] font-medium tabular-nums">{local.toFixed(1)}</span>
    </div>
  );
}

export function Meter({ value, max, label, tone = "brand" }: { value: number; max: number; label: string; tone?: "brand" | "series" | "good" | "warning" | "critical" }) {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  const bg = { brand: "bg-brand", series: "bg-series", good: "bg-good", warning: "bg-warning", critical: "bg-critical" }[tone];
  return (
    <Progress.Root value={value} max={max} aria-label={label} className="h-1.5 overflow-hidden rounded-full bg-wash-2">
      <Progress.Indicator asChild>
        <motion.div className={`h-full rounded-full ${bg}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      </Progress.Indicator>
    </Progress.Root>
  );
}

/** Confirmation dialog. `trigger` replaces the default danger button (e.g. a menu item opens it). */
export function ConfirmButton({ label, title, description, confirmLabel, onConfirm, disabled, icon, open, onOpenChange, hideTrigger }: {
  label: string; title: string; description: string; confirmLabel: string; onConfirm: () => void; disabled?: boolean; icon?: LucideIcon;
  open?: boolean; onOpenChange?: (o: boolean) => void; hideTrigger?: boolean;
}) {
  const Icon = icon;
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <AlertDialog.Trigger disabled={disabled} className={buttonClass("danger")}>
          {Icon && <Icon aria-hidden className="size-4" />}
          {label}
        </AlertDialog.Trigger>
      )}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 animate-fade bg-black/40 backdrop-blur-[1px]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 animate-pop rounded-xl border border-ring bg-surface p-5 shadow-lift">
          <AlertDialog.Title className="text-[15px] font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-ink2">{description}</AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel className={buttonClass("default")}>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onClick={onConfirm} className="inline-flex h-8 items-center rounded-lg bg-critical px-3 text-[13px] font-medium text-white hover:opacity-90">{confirmLabel}</AlertDialog.Action>
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
      <div className="skeleton h-7 w-44 rounded-md" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[104px] rounded-xl" />)}
      </div>
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg border border-critical/25 bg-critical-soft p-3 text-sm text-ink">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" />
      {error instanceof Error ? error.message : "Something went wrong"}
    </p>
  );
}

export function Empty({ children, icon: Icon = Inbox, title }: { children?: React.ReactNode; icon?: LucideIcon; title?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <span className="grid size-10 place-items-center rounded-full border border-ring bg-surface-2"><Icon aria-hidden className="size-4.5 text-muted" /></span>
      {title && <p className="mt-3 text-sm font-medium">{title}</p>}
      {children && <p className="mt-1 max-w-sm text-[13px] text-muted">{children}</p>}
    </div>
  );
}

export function VideoLink({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return <Link href={`/videos/${id}`} className={`transition-colors hover:text-brand-text ${className}`}>{children}</Link>;
}
