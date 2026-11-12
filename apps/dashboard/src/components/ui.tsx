/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, CircleAlert, Inbox, MoreHorizontal, type LucideIcon } from "lucide-react";
import { animate, motion, type Variants } from "motion/react";
import Link from "next/link";
import { AlertDialog, DropdownMenu, Progress, Select, Slider as RSlider, Switch, ToggleGroup, Tooltip } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { titleCase } from "@/lib/format";
import type { VideoStatus } from "@/lib/schemas";

/*
 * The kit. Surfaces are white panels with a hairline border and a soft shadow (`.panel` in
 * globals.css); colour is used for meaning: one blue accent, status colours, and soft tints for icon
 * tiles. Pages build from these pieces, never from raw colours.
 */

// ---------------- accents ----------------

/** A colour family. Shows as a soft tint behind icons and highlighted blocks; text stays ink. */
export type Accent = "lime" | "pink" | "sun" | "sky" | "grape" | "tang" | "mint" | "red" | "surface" | "ink";

/** A soft fill for a block in that colour. */
export const ACCENT: Record<Accent, string> = {
  lime: "bg-tint-brand", pink: "bg-tint-pink", sun: "bg-tint-amber", sky: "bg-tint-blue", grape: "bg-tint-violet",
  tang: "bg-tint-orange", mint: "bg-tint-green", red: "bg-tint-red", surface: "bg-surface", ink: "bg-surface-3",
};

/** An icon tile: tint behind, the solid colour on the icon. */
export const ACCENT_TILE: Record<Accent, string> = {
  lime: "bg-tint-brand text-brand-text", pink: "bg-tint-pink text-likes", sun: "bg-tint-amber text-warning-text", sky: "bg-tint-blue text-info-text",
  grape: "bg-tint-violet text-violet-text", tang: "bg-tint-orange text-serious", mint: "bg-tint-green text-good-text", red: "bg-tint-red text-critical-text",
  surface: "bg-surface-3 text-ink2", ink: "bg-surface-3 text-ink",
};

/** The solid colour (for charts). */
export const ACCENT_COLOR: Record<Accent, string> = {
  lime: "var(--brand)", pink: "var(--likes)", sun: "var(--warning)", sky: "var(--c1)", grape: "var(--violet)",
  tang: "var(--serious)", mint: "var(--good)", red: "var(--critical)", surface: "var(--brand)", ink: "var(--ink2)",
};

export function IconTile({ icon: Icon, accent = "surface", size = "md" }: { icon: LucideIcon; accent?: Accent; size?: "sm" | "md" | "lg" }) {
  const box = size === "sm" ? "size-6 rounded-md" : size === "lg" ? "size-10 rounded-xl" : "size-8 rounded-lg";
  const ico = size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4";
  return <span className={`grid shrink-0 place-items-center ${box} ${ACCENT_TILE[accent]}`}><Icon aria-hidden className={ico} /></span>;
}

// ---------------- layout ----------------

/** The page title block: title, one line on what the page is for, and the page's actions. */
export function PageHeader({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 max-w-3xl">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] md:text-[28px]">{title}</h1>
        {sub && <p className="mt-1.5 text-[14px] leading-relaxed text-ink2">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

const rise: Variants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] as const } } };

/** Staggers its direct `Card`/`Stat` children in on mount. */
export function Stagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }}>
      {children}
    </motion.div>
  );
}

/** A panel with an optional header: icon tile, title, a line of description, and an action on the right. */
export function Card({ title, description, action, children, className = "", icon: Icon, flush, accent }: {
  title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string; icon?: LucideIcon;
  /** no inner padding: for tables and lists that run edge to edge */
  flush?: boolean;
  /** the icon tile's colour */
  accent?: Accent;
}) {
  return (
    <motion.section variants={rise} className={`panel min-w-0 bg-surface ${flush ? "overflow-hidden" : ""} ${className}`}>
      {(title || action) && (
        <div className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-2.5 px-5 pt-4 ${flush ? "border-b border-line pb-4" : ""}`}>
          <div className="flex min-w-[200px] flex-1 items-start gap-3">
            {Icon && <IconTile icon={Icon} accent={accent ?? "surface"} />}
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ink">{title}</h2>}
              {description && <p className="mt-1 text-[12.5px] leading-snug text-muted">{description}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className={flush ? "" : `px-5 pb-5 ${title || action ? "pt-4" : "pt-5"}`}>{children}</div>
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
  neutral: "bg-surface-3 text-ink2",
  violet: "bg-violet-soft text-violet-text",
};
export type Tone = keyof typeof TONES;

const DOTS: Record<Tone, string> = {
  brand: "bg-brand", info: "bg-series", good: "bg-good", warning: "bg-warning", critical: "bg-critical", neutral: "bg-muted", violet: "bg-violet",
};

/** "+12.4%" pill. `upIsGood` says whether up is good (views) or bad (failures). */
export function Delta({ value, upIsGood = true }: { value: number | null; upIsGood?: boolean }) {
  if (value === null || !Number.isFinite(value)) return null;
  const up = value >= 0;
  const tone: Tone = Math.abs(value) < 0.5 ? "neutral" : up === upIsGood ? "good" : "critical";
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11.5px] font-medium tabular-nums ${TONES[tone]}`}>
      <Icon aria-hidden className="size-3" />{up ? "+" : ""}{value.toFixed(Math.abs(value) < 10 ? 1 : 0)}%
    </span>
  );
}

/** KPI: icon and label, a large figure, its change, a line under it and a small chart. */
export function Stat({ label, value, sub, delta, chart, icon: Icon, href, accent = "surface" }: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; delta?: React.ReactNode; chart?: React.ReactNode; icon?: LucideIcon; href?: string; accent?: Accent;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink2">
          {Icon && <IconTile icon={Icon} accent={accent} size="sm" />}
          <span className="truncate">{label}</span>
        </span>
        {delta}
      </div>
      <div className="mt-3.5 text-[28px] font-semibold leading-none tracking-[-0.03em] md:text-[30px]">{value}</div>
      {sub && <div className="mt-2 text-[12.5px] leading-snug text-muted">{sub}</div>}
      {chart && <div className="mt-auto pt-4">{chart}</div>}
    </>
  );
  const cls = "panel flex h-full min-w-0 flex-col bg-surface p-5";
  return (
    <motion.div variants={rise} className="min-w-0">
      {href ? <Link href={href} className={`${cls} hover-raise`}>{body}</Link> : <div className={cls}>{body}</div>}
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
  queued: "violet", scheduled: "info", published: "good", failed: "critical", rejected: "warning",
};

export function Badge({ tone = "neutral", icon: Icon, children, dot }: { tone?: Tone; icon?: LucideIcon; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {dot && <span aria-hidden className={`size-1.5 rounded-full ${DOTS[tone]}`} />}
      {Icon && <Icon aria-hidden className="size-3.5" />}
      {children}
    </span>
  );
}

/** Outlined pill with a coloured dot: quieter than a filled badge, for dense lists. */
export function StatusBadge({ status }: { status: VideoStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ring bg-surface px-2 py-0.5 text-xs font-medium text-ink2">
      <span aria-hidden className={`size-1.5 rounded-full ${DOTS[STATUS[status]]}`} />
      {titleCase(status)}
    </span>
  );
}

export function ResultBadge({ ok, okLabel = "Passed", failLabel = "Failed" }: { ok: boolean; okLabel?: string; failLabel?: string }) {
  return <Badge tone={ok ? "good" : "critical"} dot>{ok ? okLabel : failLabel}</Badge>;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-ring bg-surface-2 px-1.5 font-sans text-[11px] font-medium text-muted">{children}</kbd>;
}

/** 9:16 thumbnail. */
export function Thumb({ src, alt, className = "w-14" }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" className={`aspect-[9/16] shrink-0 rounded-lg border border-ring bg-surface-3 object-cover ${className}`} />;
}

// ---------------- controls ----------------

const BUTTON_TONES = {
  default: "border border-ring bg-surface text-ink shadow-xs hover:border-ring-strong hover:bg-surface-2",
  primary: "border border-transparent bg-primary text-primary-ink shadow-xs hover:bg-brand-hover",
  brand: "border border-transparent bg-primary text-primary-ink shadow-xs hover:bg-brand-hover",
  danger: "border border-transparent bg-critical text-white shadow-xs hover:opacity-90",
  ghost: "border border-transparent text-ink2 hover:bg-surface-3 hover:text-ink",
};
export type ButtonTone = keyof typeof BUTTON_TONES;

type ButtonProps = {
  children: React.ReactNode; onClick?: () => void; tone?: ButtonTone; disabled?: boolean; title?: string;
  type?: "button" | "submit"; icon?: LucideIcon; iconOnly?: boolean; size?: "sm" | "md";
};

export const buttonClass = (tone: ButtonTone = "default", iconOnly = false, size: "sm" | "md" = "md") =>
  `inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[13px] font-medium transition-[background-color,border-color,opacity,box-shadow] disabled:pointer-events-none disabled:opacity-45 ${
    size === "sm" ? (iconOnly ? "size-8" : "h-8 px-2.5") : iconOnly ? "size-9" : "h-9 px-3.5"} ${BUTTON_TONES[tone]}`;

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
        <Tooltip.Content sideOffset={6} className="z-50 max-w-64 animate-fade rounded-md bg-ink px-2 py-1 text-xs font-medium text-surface shadow-lift">{label}</Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/** Segmented control: options on a grey track, the chosen one a raised white chip. */
export function Segmented<T extends string>({ value, onChange, options, label }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; label: string;
}) {
  return (
    <ToggleGroup.Root type="single" value={value} onValueChange={(v) => v && onChange(v as T)} aria-label={label}
      className="no-scrollbar inline-flex h-8 max-w-full items-center overflow-x-auto rounded-lg bg-surface-3 p-0.5">
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value}
          className="relative h-full shrink-0 whitespace-nowrap rounded-md px-2.5 text-[12.5px] font-medium text-ink2 transition-colors hover:text-ink data-[state=on]:text-ink">
          {value === o.value && <motion.span layoutId={`seg-${label}`} className="absolute inset-0 rounded-md bg-surface shadow-xs ring-1 ring-ring/60" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
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
      <DropdownMenu.Trigger aria-label={label} className={buttonClass("default", true)}>
        <MoreHorizontal aria-hidden className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-52 animate-pop rounded-xl border border-ring bg-surface p-1 shadow-pop">
          {items.map((it, i) => it === "separator" ? <DropdownMenu.Separator key={i} className="-mx-1 my-1 h-px bg-line" /> : (
            <DropdownMenu.Item key={it.label} disabled={it.disabled} onSelect={it.onSelect}
              className={`flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-surface-3 ${it.danger ? "text-critical-text" : "text-ink"}`}>
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
      className="relative h-5 w-9 shrink-0 rounded-full bg-ring-strong/70 transition-colors disabled:opacity-40 data-[state=checked]:bg-primary">
      <Switch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-[0_1px_3px_rgba(16,24,40,0.25)] transition-transform duration-200 data-[state=checked]:translate-x-[18px]" />
    </Switch.Root>
  );
}

export const fieldClass = "h-9 w-full rounded-lg border border-ring bg-surface px-3 text-[13.5px] text-ink shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted hover:border-ring-strong focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft disabled:opacity-45";

export function SelectField({ value, onChange, options, label, all }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string; all: string;
}) {
  // Radix Select items cannot have an empty value, so "all" stands in for "no filter"
  return (
    <Select.Root value={value || "__all"} onValueChange={(v) => onChange(v === "__all" ? "" : v)}>
      <Select.Trigger aria-label={label} className={`${fieldClass} flex items-center justify-between gap-2 text-left`}>
        <span className="truncate"><Select.Value /></span>
        <Select.Icon><ChevronDown aria-hidden className="size-4 text-muted" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={6} className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] animate-pop overflow-hidden rounded-xl border border-ring bg-surface p-1 shadow-pop">
          <Select.Viewport>
            {[{ value: "__all", label: all }, ...options].map((o) => (
              <Select.Item key={o.value} value={o.value} className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-surface-3">
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator><Check aria-hidden className="size-3.5 text-brand" /></Select.ItemIndicator>
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
        <RSlider.Track className="relative h-1.5 flex-1 rounded-full bg-surface-3">
          <RSlider.Range className="absolute h-full rounded-full bg-primary" />
        </RSlider.Track>
        <RSlider.Thumb className="block size-4 rounded-full border border-ring-strong bg-white shadow-card transition-transform hover:scale-110 focus-visible:outline-offset-4" />
      </RSlider.Root>
      <span className="w-9 text-right text-[13px] font-medium tabular-nums">{local.toFixed(1)}</span>
    </div>
  );
}

export function Meter({ value, max, label, tone = "brand" }: { value: number; max: number; label: string; tone?: "brand" | "series" | "good" | "warning" | "critical" }) {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  const bg = { brand: "bg-brand", series: "bg-series", good: "bg-good", warning: "bg-warning", critical: "bg-critical" }[tone];
  return (
    <Progress.Root value={value} max={max} aria-label={label} className="h-1.5 overflow-hidden rounded-full bg-surface-3">
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
        <AlertDialog.Overlay className="fixed inset-0 z-40 animate-fade bg-[#0a0d13]/45 backdrop-blur-[2px]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 animate-pop rounded-2xl border border-ring bg-surface p-6 shadow-pop">
          <IconTile icon={CircleAlert} accent="red" size="lg" />
          <AlertDialog.Title className="mt-4 text-[16px] font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-[13.5px] leading-relaxed text-ink2">{description}</AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel className={buttonClass("default")}>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onClick={onConfirm} className={buttonClass("danger")}>{confirmLabel}</AlertDialog.Action>
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
      <div className="skeleton h-8 w-56" />
      <div className="skeleton h-4 w-96 max-w-full" />
      <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[132px]" />)}
      </div>
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton h-40" />)}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-critical/25 bg-critical-soft p-3.5 text-[13.5px] text-ink">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" />
      {error instanceof Error ? error.message : "Something went wrong"}
    </p>
  );
}

export function Empty({ children, icon: Icon = Inbox, title }: { children?: React.ReactNode; icon?: LucideIcon; title?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-ring bg-surface-2 shadow-xs"><Icon aria-hidden className="size-5 text-muted" /></span>
      {title && <p className="mt-3.5 text-[14px] font-semibold">{title}</p>}
      {children && <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

export function VideoLink({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return <Link href={`/videos/${id}`} className={`transition-colors hover:text-brand-text ${className}`}>{children}</Link>;
}

// ---------------- tabs ----------------

/** Tab row: options on a grey track, the active one a raised white chip. Pair with `tabClass`. */
export const tabListClass = "no-scrollbar scroll-fade-x mb-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-surface-3 p-1";
export const tabClass = "flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] font-medium text-ink2 transition-colors hover:text-ink data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-xs";
