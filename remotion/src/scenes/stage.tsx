/**
 * Character scenes: the cast acting on a set, chapter cards, a checklist the cast presents, and
 * the end card. Parameters come from the storyboard, already resolved by Python.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Sikka } from "../cast/Sikka";
import type { Expression } from "../cast/face";
import { blinkAt, settle } from "../cast/acting";
import { FONT } from "../design/fonts";
import { Actor, type ActorSpec, at, Chip, clamp, DataSet, ease, easeOut, Kinetic, pop, type SceneProps, sec, SETS, str } from "./kit";

interface SikkaSpec { x: number; at?: string; expression?: Expression; cheer?: boolean; drop?: boolean }

export const StageScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const params = p.beat.params as { set?: string; actors?: ActorSpec[]; chip?: { text: string; at?: string }; sikka?: SikkaSpec };
  const Set = SETS[(params.set ?? "home") as keyof typeof SETS] ?? SETS.home;
  const ground = h * 0.9;
  const t = sec(p);
  const sk = params.sikka;
  const skStart = sk ? at(p, sk.at, 0.3) : 0;
  const drop = sk?.drop ? settle((t - skStart) / 0.7) : 1;
  return (
    <AbsoluteFill>
      <Set w={w} h={h} ground={ground} t={t} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {(params.actors ?? []).map((a, i) => <Actor key={a.who + i} p={p} spec={a} ground={ground} index={i} />)}
        {sk && t >= skStart - 0.01 && (
          <Sikka x={sk.x * w} y={ground - 120 - (1 - drop) * 700 + (sk.cheer ? -Math.abs(Math.sin(t * 6)) * 30 : 0)} size={130}
            expression={sk.expression ?? "happy"} armsUp={sk.cheer} blink={blinkAt(t, 9)} spin={sk.cheer ? Math.sin(t * 3) * 0.4 : 0} />
        )}
      </svg>
      {params.chip && (
        <div style={{ position: "absolute", top: 60, width: w, textAlign: "center" }}>
          {/* the video's first beat shows its stake on frame 0: the first frame is the hook */}
          <Chip text={params.chip.text} k={p.beat.from === 0 ? 1 : pop(p, at(p, params.chip.at, 0.4))} bg={p.tl.palette.accent} fg="#1b1b1b" size={42} />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const ChapterScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const kicker = str(p.beat.params.kicker), title = str(p.beat.params.title);
  const t = sec(p);
  const bar = easeOut(t / 0.5);
  const out = clamp((t - (p.beat.frames / p.fps - 0.35)) / 0.35);
  // where we are in the video: one segment per chapter, this one filling in (no numerals on screen)
  const chapters = p.tl.beats.filter((b) => b.scene === "chapter");
  const index = chapters.findIndex((b) => b.id === p.beat.id);
  const seg = 150, gap = 18, row = chapters.length * seg + (chapters.length - 1) * gap;
  const drift = 1 + 0.035 * ease(t / (p.beat.frames / p.fps));
  return (
    <AbsoluteFill style={{ background: pal.bg, overflow: "hidden" }}>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w * bar, height: h, background: pal.accent, transform: `translateX(${out * w}px)` }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w * ease((t - 0.12) / 0.5), height: h, background: pal.bg, transform: `translateX(${out * w}px)` }} />
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <Kinetic text={kicker.toUpperCase()} p={p} start={0.35} size={44} color={pal.accent} weight={700} y={h * 0.34} />
        <Kinetic text={title} p={p} start={0.5} size={120} color={pal.text} y={h * 0.42} stagger={0.08} />
      </AbsoluteFill>
      {index >= 0 && chapters.length > 1 && (
        <div style={{ position: "absolute", left: (w - row) / 2, top: h * 0.7, display: "flex", gap, opacity: easeOut((t - 0.6) / 0.4) * (1 - out) }}>
          {chapters.map((c, i) => {
            const fill = i < index ? 1 : i === index ? easeOut((t - 0.8) / 0.8) : 0;
            return (
              <div key={c.id} style={{ width: seg, height: 12, borderRadius: 6, background: pal.panel, overflow: "hidden" }}>
                <div style={{ width: seg * fill, height: 12, background: i === index ? pal.accent : pal.muted }} />
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

const ICONS: Record<string, (c: string) => React.ReactNode> = {
  autopay: (c) => (<g><rect x={-34} y={-30} width={68} height={60} rx={10} fill="none" stroke={c} strokeWidth={7} /><path d="M-18,0 l12,12 l24,-26" stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" /></g>),
  emi: (c) => (<g>{[-22, 0, 22].map((x, i) => <rect key={i} x={x - 8} y={-30 + i * 12} width={16} height={60 - i * 12} rx={4} fill={c} />)}</g>),
  debit: (c) => (<g><rect x={-38} y={-24} width={76} height={48} rx={8} fill="none" stroke={c} strokeWidth={7} /><rect x={-38} y={-10} width={76} height={9} fill={c} /></g>),
  check: (c) => (<path d="M-22,0 l14,14 l30,-32" stroke={c} strokeWidth={10} fill="none" strokeLinecap="round" />),
};

export const ChecklistScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const v = h > w;                  // a Short: full-width rows, text at 44 px and up
  const items = (p.beat.params.items as { text: string; icon?: string }[]) ?? [];
  const active = Number(p.beat.params.active ?? 0);
  const actor = p.beat.params.actor as ActorSpec | undefined;
  const t = sec(p);
  const ground = h * 0.95;
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <Kinetic text={str(p.beat.params.title, "What to do")} p={p} start={0.1} size={v ? 72 : 64} color={pal.text} x={v ? 70 : 120} y={90} width={v ? w - 140 : w * 0.6} align="left" />
      {items.map((it, i) => {
        const done = i < active, now = i === active, later = i > active;
        const k = now ? pop(p, 0.15) : 1;
        const y = (v ? 300 : 230) + i * (v ? 250 : 210);
        const bg = now ? pal.accent : done ? pal.panel : pal.panel;
        const fg = now ? "#1b1b1b" : pal.text;
        return (
          <div key={i} style={{
            position: "absolute", left: v ? 70 : 120, top: y, width: v ? w - 140 : w * 0.55, height: v ? 210 : 170, borderRadius: 28, background: bg,
            opacity: later ? 0.35 : 1, transform: `translateX(${(1 - k) * -80}px) scale(${now ? 1 + 0.03 * Math.sin(t * 3) : 0.97})`,
            boxShadow: now ? `0 20px 50px rgba(0,0,0,0.35)` : "none", display: "flex", alignItems: "center",
          }}>
            <svg width={150} height={170} style={{ flexShrink: 0 }}>
              <g transform={`translate(75,85) scale(${now ? 1 + 0.08 * Math.sin(t * 5) : 1})`}>{(done ? ICONS.check! : ICONS[it.icon ?? "check"] ?? ICONS.check!)(done ? pal.cast[0]! : fg)}</g>
            </svg>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: v ? 48 : 40, color: fg, lineHeight: 1.2, paddingRight: 30, textDecoration: done ? "none" : "none" }}>{it.text}</div>
          </div>
        );
      })}
      {actor && (
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <Actor p={p} spec={actor} ground={ground} index={0} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

export const EndScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const t = sec(p);
  const v = h > w;                  // a Short: text stacked on top, at Shorts sizes (44 px and up)
  const ground = h * (v ? 0.9 : 0.93);
  const xs = v ? [0.24, 0.5, 0.76] : [0.58, 0.74, 0.9];
  const cast: ActorSpec[] = [
    { who: "rohan", x: xs[0]!, scale: 1.0, acting: [{ sec: 0, pose: "celebrate", expression: "laugh" }] },
    { who: "priya", x: xs[1]!, scale: 1.0, acting: [{ sec: 0, pose: "thumbsUp", expression: "happy", turn: -0.2 }] },
    { who: "sharma", x: xs[2]!, scale: 1.0, acting: [{ sec: 0, pose: "stand", expression: "proud", turn: -0.35 }] },
  ];
  const left = v ? 80 : 110, width = v ? w - 160 : w * 0.5;
  const y = v ? { cta: 150, follow: 420, note: 560, disc: 740 } : { cta: 180, follow: 470, note: 620, disc: 760 };
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <Kinetic text={str(p.beat.params.cta)} p={p} start={0.2} size={v ? 96 : 78} color={pal.text} x={left} y={y.cta} width={width} align="left" />
      <Kinetic text={str(p.beat.params.follow)} p={p} start={0.9} size={v ? 56 : 46} color={pal.accent} weight={700} x={left} y={y.follow} width={width} align="left" />
      <div style={{ position: "absolute", left, top: y.note, width: v ? width : w * 0.46, fontFamily: FONT, fontWeight: 500, fontSize: v ? 44 : 32, color: pal.muted, opacity: clamp((t - 1.4) / 0.4), lineHeight: 1.3 }}>
        {str(p.beat.params.assumption)}
      </div>
      <div style={{ position: "absolute", left, top: y.disc, width, fontFamily: FONT, fontWeight: 600, fontSize: v ? 46 : 34, color: pal.text, opacity: clamp((t - 1.6) / 0.4) }}>
        {p.tl.disclaimer}
      </div>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {cast.map((a, i) => <Actor key={a.who} p={p} spec={a} ground={ground - 40} index={i} />)}
        <Sikka x={w * (v ? 0.37 : 0.66)} y={ground - 360 - Math.abs(Math.sin(t * 5)) * 40} size={110} expression="laugh" armsUp blink={blinkAt(t, 7)} spin={Math.sin(t * 2) * 0.5} />
      </svg>
    </AbsoluteFill>
  );
};

