/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDown, ArrowUp, Check, ChevronDown, CircleAlert, Inbox, MoreHorizontal, type LucideIcon } from "lucide-react";
import { animate, motion, type Variants } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertDialog, DropdownMenu, Progress, Select, Slider as RSlider, Switch, ToggleGroup, Tooltip } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { titleCase } from "@/lib/format";
import type { VideoStatus } from "@/lib/schemas";

import { pageTitle } from "./nav-items";

/*
 * The brutal kit. Every block is a 2 px ink outline with a hard offset shadow (`.nb` in globals.css),
 * corners are square, accents are flat fills with black text (`.on-accent`), and labels are mono caps.
 */

// ---------------- accents ----------------

export type Accent = "lime" | "pink" | "sun" | "sky" | "grape" | "tang" | "mint" | "red" | "surface" | "ink";

/** Background + text for a block filled with an accent. */
export const ACCENT: Record<Accent, string> = {
  lime: "bg-lime on-accent", pink: "bg-pink on-accent", sun: "bg-sun on-accent", sky: "bg-sky on-accent",
  grape: "bg-grape on-accent", tang: "bg-tang on-accent", mint: "bg-mint on-accent", red: "bg-red on-accent",
  surface: "bg-surface text-ink", ink: "bg-ink text-plane",
};

// ---------------- layout ----------------

/** The page title block: a mono kicker (the nav section), a huge title and a line under it. */
export function PageHeader({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  const path = usePathname();
  const { section } = pageTitle(path);
  return (
    <div className="mb-8 border-b-2 border-edge pb-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          {section && <span className="nb-label inline-block border-2 border-edge bg-lime px-2 py-0.5 text-on-accent">{section}</span>}
          <h1 className="mt-3 break-words font-display text-[40px] uppercase leading-[0.92] md:text-[60px]">{title}</h1>
          {sub && <p className="mt-3 max-w-3xl text-[15px] font-medium leading-snug text-ink2">{sub}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
      </div>
    </div>
  );
}

const rise: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 520, damping: 30 } } };

/** Staggers its direct `Card`/`Stat` children in on mount. */
export function Stagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.035 } } }}>
      {children}
    </motion.div>
  );
}

/**
 * A block with an optional title bar. The bar is a strip across the top with a thick rule under it;
 * `accent` fills the strip (default: paper).
 */
export function Card({ title, description, action, children, className = "", icon: Icon, flush, accent }: {
  title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string; icon?: LucideIcon;
  /** no inner padding: for tables and lists that run edge to edge */
  flush?: boolean;
  accent?: Accent;
}) {
  const head = accent ? ACCENT[accent] : "bg-surface-2 text-ink";
  return (
    <motion.section variants={rise} className={`nb min-w-0 bg-surface ${flush ? "overflow-hidden" : ""} ${className}`}>
      {(title || action) && (
        <div className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-2.5 border-b-2 border-edge px-4 py-3 md:px-5 ${head}`}>
          <div className="min-w-[200px] flex-1">
            {title && (
              <h2 className="flex items-center gap-2 font-display text-[15px] uppercase leading-tight tracking-tight">
                {Icon && <span className="grid size-6 shrink-0 place-items-center border-2 border-edge bg-surface text-ink"><Icon aria-hidden className="size-3.5" /></span>}
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-[12.5px] font-medium leading-snug text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={flush ? "" : "p-4 md:p-5"}>{children}</div>
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
      duration: 0.7, ease: [0.2, 1.2, 0.4, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = fmtRef.current(v); },
    });
    from.current = value;
    return () => controls.stop();
  }, [value]);
  return <span ref={ref} className="tabular-nums">{fmt(value)}</span>;
}

const TONES = {
  brand: "bg-lime on-accent",
  info: "bg-sky on-accent",
  good: "bg-mint on-accent",
  warning: "bg-sun on-accent",
  critical: "bg-red on-accent",
  neutral: "bg-surface text-ink2",
  violet: "bg-grape on-accent",
};
export type Tone = keyof typeof TONES;

const DOTS: Record<Tone, string> = {
  brand: "bg-lime", info: "bg-sky", good: "bg-mint", warning: "bg-sun", critical: "bg-red", neutral: "bg-surface-2", violet: "bg-grape",
};

/** "▲ 12.4%" tag. `upIsGood` says whether up is good (views) or bad (failures). */
export function Delta({ value, upIsGood = true }: { value: number | null; upIsGood?: boolean }) {
  if (value === null || !Number.isFinite(value)) return null;
  const up = value >= 0;
  const tone: Tone = Math.abs(value) < 0.5 ? "neutral" : up === upIsGood ? "good" : "critical";
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 border-2 border-edge px-1.5 py-px font-mono text-[11px] font-bold tabular-nums ${TONES[tone]}`}>
      <Icon aria-hidden strokeWidth={3} className="size-3" />{up ? "+" : ""}{value.toFixed(Math.abs(value) < 10 ? 1 : 0)}%
    </span>
  );
}

/** KPI: a block (optionally filled with an accent), mono label, huge number, a line and a small chart. */
export function Stat({ label, value, sub, delta, chart, icon: Icon, href, accent = "surface" }: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; delta?: React.ReactNode; chart?: React.ReactNode; icon?: LucideIcon; href?: string; accent?: Accent;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="nb-label flex min-w-0 items-center gap-1.5 text-ink2">{Icon && <Icon aria-hidden strokeWidth={2.5} className="size-3.5 shrink-0" />}<span className="truncate">{label}</span></span>
        {delta}
      </div>
      <div className="mt-3 font-display text-[34px] leading-none tracking-tight md:text-[40px]">{value}</div>
      {sub && <div className="mt-2 text-[12.5px] font-medium leading-snug text-muted">{sub}</div>}
      {chart && <div className="mt-auto pt-3">{chart}</div>}
    </>
  );
  const cls = `nb flex h-full min-w-0 flex-col p-4 md:p-5 ${ACCENT[accent]}`;
  return (
    <motion.div variants={rise} className="min-w-0">
      {href ? <Link href={href} className={`${cls} nb-press`}>{body}</Link> : <div className={cls}>{body}</div>}
    </motion.div>
  );
}

/** Old name, same thing. */
export function Tile({ label, value, sub, icon }: { label: string; value: React.ReactNode; sub?: string; icon?: LucideIcon; tone?: Tone }) {
  return <Stat label={label} value={value} sub={sub} icon={icon} />;
}

// ---------------- badges ----------------

// state is carried by the label; the square only reinforces it
const STATUS: Record<VideoStatus, Tone> = {
  planned: "neutral", scripted: "neutral", verified: "neutral", rendered: "neutral", qa_passed: "neutral",
  queued: "violet", scheduled: "info", published: "good", failed: "critical", rejected: "warning",
};

export function Badge({ tone = "neutral", icon: Icon, children, dot }: { tone?: Tone; icon?: LucideIcon; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap border-2 border-edge px-1.5 py-px text-[11.5px] font-bold uppercase tracking-wide ${TONES[tone]}`}>
      {dot && <span aria-hidden className="size-1.5 bg-current" />}
      {Icon && <Icon aria-hidden strokeWidth={2.5} className="size-3.5" />}
      {children}
    </span>
  );
}

/** Paper tag with a filled square in the status colour: quieter than a filled badge, for dense lists. */
export function StatusBadge({ status }: { status: VideoStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap border-2 border-edge bg-surface px-1.5 py-px text-[11.5px] font-bold uppercase tracking-wide text-ink">
      <span aria-hidden className={`size-2 border border-edge ${DOTS[STATUS[status]]}`} />
      {titleCase(status)}
    </span>
  );
}

export function ResultBadge({ ok, okLabel = "Passed", failLabel = "Failed" }: { ok: boolean; okLabel?: string; failLabel?: string }) {
  return <Badge tone={ok ? "good" : "critical"} dot>{ok ? okLabel : failLabel}</Badge>;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center border-2 border-edge bg-surface px-1 font-mono text-[10.5px] font-bold text-ink shadow-[1.5px_1.5px_0_0_var(--hard)]">{children}</kbd>;
}

/** 9:16 thumbnail in a hard frame. */
export function Thumb({ src, alt, className = "w-14" }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" className={`aspect-[9/16] shrink-0 border-2 border-edge bg-surface-2 object-cover shadow-[2px_2px_0_0_var(--hard)] ${className}`} />;
}

// ---------------- controls ----------------

const BUTTON_TONES = {
  default: "nb-sm nb-press bg-surface text-ink",
  primary: "nb-sm nb-press bg-lime text-on-accent",
  brand: "nb-sm nb-press bg-pink text-on-accent",
  danger: "nb-sm nb-press bg-red text-on-accent",
  ghost: "border-2 border-transparent text-ink2 hover:border-edge hover:bg-surface hover:text-ink",
};
export type ButtonTone = keyof typeof BUTTON_TONES;

type ButtonProps = {
  children: React.ReactNode; onClick?: () => void; tone?: ButtonTone; disabled?: boolean; title?: string;
  type?: "button" | "submit"; icon?: LucideIcon; iconOnly?: boolean; size?: "sm" | "md";
};

export const buttonClass = (tone: ButtonTone = "default", iconOnly = false, size: "sm" | "md" = "md") =>
  `inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-[12.5px] font-bold uppercase tracking-wide disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none ${
    size === "sm" ? (iconOnly ? "size-8" : "h-8 px-2.5") : iconOnly ? "size-10" : "h-10 px-4"} ${BUTTON_TONES[tone]}`;

export function Button({ children, onClick, tone = "default", disabled, title, type = "button", icon: Icon, iconOnly, size = "md" }: ButtonProps) {
  const button = (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={iconOnly ? title : undefined} className={buttonClass(tone, iconOnly, size)}>
      {Icon && <Icon aria-hidden strokeWidth={2.5} className="size-4" />}
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
        <Tooltip.Content sideOffset={8} className="z-50 max-w-64 animate-pop border-2 border-edge bg-ink px-2 py-1 text-xs font-semibold text-plane shadow-[3px_3px_0_0_var(--lime)]">{label}</Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/** Segmented control: boxes in a row, the chosen one inverted. */
export function Segmented<T extends string>({ value, onChange, options, label }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; label: string;
}) {
  return (
    <ToggleGroup.Root type="single" value={value} onValueChange={(v) => v && onChange(v as T)} aria-label={label}
      className="no-scrollbar inline-flex h-8 max-w-full items-stretch overflow-x-auto border-2 border-edge bg-surface shadow-[2px_2px_0_0_var(--hard)]">
      {options.map((o, i) => (
        <ToggleGroup.Item key={o.value} value={o.value}
          className={`relative shrink-0 whitespace-nowrap px-2.5 text-[12px] font-bold uppercase tracking-wide text-ink2 transition-colors hover:bg-wash-2 hover:text-ink data-[state=on]:bg-ink data-[state=on]:text-plane ${i ? "border-l-2 border-edge" : ""}`}>
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
      <DropdownMenu.Trigger aria-label={label} className={buttonClass("default", true, "sm")}>
        <MoreHorizontal aria-hidden strokeWidth={2.5} className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className="nb z-50 min-w-52 animate-pop bg-surface p-1">
          {items.map((it, i) => it === "separator" ? <DropdownMenu.Separator key={i} className="-mx-1 my-1 h-0.5 bg-edge" /> : (
            <DropdownMenu.Item key={it.label} disabled={it.disabled} onSelect={it.onSelect}
              className={`flex cursor-pointer select-none items-center gap-2 border-2 border-transparent px-2 py-1.5 text-[13px] font-semibold outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:border-edge ${it.danger ? "text-critical-text data-[highlighted]:bg-red data-[highlighted]:text-on-accent" : "text-ink data-[highlighted]:bg-lime data-[highlighted]:text-on-accent"}`}>
              {it.icon && <it.icon aria-hidden strokeWidth={2.5} className="size-4" />}{it.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** A square on/off switch: paper when off, lime when on, the knob a black block. */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <Switch.Root checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label}
      className="relative h-7 w-12 shrink-0 border-2 border-edge bg-surface-2 shadow-[2px_2px_0_0_var(--hard)] transition-colors disabled:opacity-40 data-[state=checked]:bg-lime">
      <Switch.Thumb className="block size-[18px] translate-x-[3px] border-2 border-edge bg-surface transition-transform duration-150 data-[state=checked]:translate-x-[23px] data-[state=checked]:bg-ink" />
    </Switch.Root>
  );
}

export const fieldClass = "h-10 w-full border-2 border-edge bg-surface px-3 text-[14px] font-medium text-ink outline-none transition-shadow placeholder:text-muted hover:shadow-[2px_2px_0_0_var(--hard)] focus-visible:shadow-[3px_3px_0_0_var(--lime)] focus-visible:outline-none disabled:opacity-40";

export function SelectField({ value, onChange, options, label, all }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string; all: string;
}) {
  // Radix Select items cannot have an empty value, so "all" stands in for "no filter"
  return (
    <Select.Root value={value || "__all"} onValueChange={(v) => onChange(v === "__all" ? "" : v)}>
      <Select.Trigger aria-label={label} className={`${fieldClass} flex items-center justify-between gap-2 text-left`}>
        <span className="truncate"><Select.Value /></span>
        <Select.Icon><ChevronDown aria-hidden strokeWidth={3} className="size-4" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={6} className="nb z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] animate-pop overflow-hidden bg-surface p-1">
          <Select.Viewport>
            {[{ value: "__all", label: all }, ...options].map((o) => (
              <Select.Item key={o.value} value={o.value} className="flex cursor-pointer select-none items-center justify-between gap-3 border-2 border-transparent px-2 py-1.5 text-[13px] font-semibold outline-none data-[highlighted]:border-edge data-[highlighted]:bg-lime data-[highlighted]:text-on-accent">
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator><Check aria-hidden strokeWidth={3} className="size-3.5" /></Select.ItemIndicator>
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
        className="relative flex h-6 flex-1 touch-none select-none items-center data-[disabled]:opacity-40">
        <RSlider.Track className="relative h-3 flex-1 border-2 border-edge bg-surface">
          <RSlider.Range className="absolute h-full bg-lime" />
        </RSlider.Track>
        <RSlider.Thumb className="block size-5 border-2 border-edge bg-ink shadow-[2px_2px_0_0_var(--lime)] focus-visible:outline-offset-4" />
      </RSlider.Root>
      <span className="w-10 border-2 border-edge bg-surface text-center font-mono text-[13px] font-bold tabular-nums">{local.toFixed(1)}</span>
    </div>
  );
}

/** A thick progress bar: an outlined trough filled with a flat colour. */
export function Meter({ value, max, label, tone = "brand" }: { value: number; max: number; label: string; tone?: "brand" | "series" | "good" | "warning" | "critical" }) {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  const bg = { brand: "bg-lime", series: "bg-sky", good: "bg-mint", warning: "bg-sun", critical: "bg-red" }[tone];
  return (
    <Progress.Root value={value} max={max} aria-label={label} className="nb-stripes h-4 overflow-hidden border-2 border-edge bg-surface">
      <Progress.Indicator asChild>
        <motion.div className={`h-full border-r-2 border-edge ${bg}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.2, 1.1, 0.4, 1] }} />
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
          {Icon && <Icon aria-hidden strokeWidth={2.5} className="size-4" />}
          {label}
        </AlertDialog.Trigger>
      )}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 animate-fade bg-ink/50" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(460px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 animate-pop border-2 border-edge bg-surface shadow-[8px_8px_0_0_var(--hard)]">
          <div className="border-b-2 border-edge bg-red px-5 py-3 on-accent">
            <AlertDialog.Title className="font-display text-lg uppercase leading-tight">{title}</AlertDialog.Title>
          </div>
          <AlertDialog.Description className="px-5 pt-4 text-[15px] font-medium text-ink2">{description}</AlertDialog.Description>
          <div className="flex justify-end gap-2.5 p-5">
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
    <div role="status" aria-label="Loading" className="flex flex-col gap-5">
      <div className="skeleton h-5 w-28" />
      <div className="skeleton h-14 w-72" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[132px]" />)}
      </div>
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton h-36" />)}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  return (
    <p role="alert" className="nb on-accent flex items-start gap-2.5 bg-red p-3.5 text-[14px] font-semibold">
      <CircleAlert aria-hidden strokeWidth={2.5} className="mt-0.5 size-4 shrink-0" />
      {error instanceof Error ? error.message : "Something went wrong"}
    </p>
  );
}

export function Empty({ children, icon: Icon = Inbox, title }: { children?: React.ReactNode; icon?: LucideIcon; title?: string }) {
  return (
    <div className="nb-stripes m-1 flex flex-col items-center border-2 border-dashed border-edge px-4 py-10 text-center">
      <span className="nb-sm grid size-12 place-items-center bg-sun text-on-accent"><Icon aria-hidden strokeWidth={2.5} className="size-5" /></span>
      {title && <p className="mt-4 font-display text-[15px] uppercase">{title}</p>}
      {children && <p className="mt-1.5 max-w-sm text-[13px] font-medium text-ink2">{children}</p>}
    </div>
  );
}

export function VideoLink({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return <Link href={`/videos/${id}`} className={`decoration-2 underline-offset-2 hover:bg-lime hover:text-on-accent hover:underline ${className}`}>{children}</Link>;
}

// ---------------- tabs ----------------

/** Tab row: chunky boxes; the active tab is inverted. Pair with `tabClass` on each trigger. */
export const tabListClass = "no-scrollbar scroll-fade-x mb-5 flex gap-2 overflow-x-auto pb-1.5 pr-1";
export const tabClass = "flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap border-2 border-edge bg-surface px-3 text-[12.5px] font-bold uppercase tracking-wide text-ink2 transition-transform hover:-translate-y-0.5 hover:text-ink data-[state=active]:translate-y-0 data-[state=active]:bg-ink data-[state=active]:text-plane data-[state=active]:shadow-[3px_3px_0_0_var(--lime)]";
