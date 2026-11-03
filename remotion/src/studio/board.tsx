/**
 * The board (owner, 2026-11-02, after The Curious Plot study: "literally everything which is said is
 * animated in a nice way; ours only the important things, you have to listen to know"; and "don't make
 * hardcoded animations, they should be dynamic to the scripts so that no video looks the same").
 *
 * A grammar, not a template. The code knows verbs and zones; every word, every thing and the look come
 * from the script and the video's own props (videos/<id>/props.tsx):
 *
 *   top      a thin progress bar, the HEADER stating the point of what is said (rewritten by `header`),
 *            the source line when the video has sourced facts
 *   holder   a sum written term by term (`equation`), and the named term under it (`term`)
 *   panel    one at a time, replacing the last: `bars`, `ring`, `grid`, `calendar`, `buttons` (+ `click`),
 *            `person`; the stage makes room for it
 *   stage    the build scene with a still camera: the video's own things on one ground line, the cast
 *            small, every build verb (enter, flow, swap, grow, multiply up to 400, count...) and the
 *            marks (stamp, cross, tick, strike, arrow, bubble, step)
 *
 * The look (`timeline.look`, chosen per video in the plan's style and rotated by generator/looks.py):
 * the stage kind, the header style, what the sum is written on, how things arrive. Mirrored in LOOKS.
 *
 * params: { header, sub?, bg?: section colour, stage?: world kind, cast?: actors, items, actions }
 * actions (each on a spoken word: at | sec):
 *   header   {text, sub?}
 *   equation {terms: [{text, at?}], result: {text, value?, at?}, label?}
 *   term     {name, line?, kicker?}
 *   bars     {items: [{label, text, value, at?, tone?: good|bad|accent, turn?: {at, tone}}], title?}
 *   ring     {value (percent), text, label?}
 *   grid     {n, share? (percent), text?, label?, lock?, prop?, cols?, markAt?}
 *   calendar {from, to, label?, flipAt?}
 *   buttons  {items: [{text, at?, prop?}]}        click {index}
 *   person   {name, kicker?, figure?, value?, prop?}
 *   doc      {title, rows: [{label, value, at?, strike?: {to, at}}], stamp?: {text, at}, tone?}   a document
 *            whose rows fill in on their words (a pay slip, a tax return, a bank statement)
 *   chip     {text, tone?}   a small label that joins the picture (PER YEAR, FOR DECADES)
 * Panels build up into one picture (2026-11-02, the owner comparing frame by frame: their cards are
 * labelled diagrams, a slip with real data, a calendar and two chips together; ours were one icon):
 * up to three stack in the middle, chips line up under them, `clear` (or a panel with `replace`)
 * starts over. A ring takes `callout` (a chip pointing at its slice), a calendar takes `steps`.
 */
import React from "react";
import { random } from "remotion";
import { at, clamp, type SceneProps, sec } from "../scenes/kit";
import { FONT } from "../design/fonts";
import { fitLine, fitWords, minText, safeBox, textWidth } from "../design/fit";
import { countUp } from "../fmt/inr";
import type { Cur } from "./money";
import { BuildScene } from "./build";
import { INK, PALETTE, type PropSet, shade } from "./draw";
import { SHARED_PROPS } from "./build";
import { VIDEOS } from "../videos/hooks";

/** The board's looks; generator/looks.py holds the same lists (a test keeps them in step). */
export const LOOKS = {
  stage: ["flat", "street", "city", "field", "kitchen", "office", "night", "desert", "studio", "space"],
  header: ["ribbon", "sticky", "neon", "strip", "chalk"],
  holder: ["box", "receipt", "phone", "blackboard", "sign"],
  entrance: ["pop", "drop", "slide", "draw", "stamp"],
} as const;
type Look = { stage: string; header: string; holder: string; entrance: string };

interface BoardAct {
  at?: string; sec?: number; do: string; text?: string; sub?: string; name?: string; line?: string; kicker?: string; label?: string; title?: string;
  terms?: { text: string; at?: string }[]; result?: { text: string; value?: number; at?: string };
  items?: { label?: string; text?: string; value?: number; at?: string; tone?: string; turn?: { at?: string; tone?: string }; prop?: string }[];
  value?: number; n?: number; share?: number; lock?: boolean; prop?: string; cols?: number; markAt?: string;
  from?: string; to?: string; flipAt?: string; index?: number; figure?: string; target?: string;
  rows?: { label: string; value?: string; at?: string; strike?: { to: string; at?: string } }[]; stamp?: { text: string; at?: string };
  callout?: string; steps?: string[]; replace?: boolean; tone?: string;
}
const PANELS = new Set(["bars", "ring", "grid", "calendar", "buttons", "person", "doc", "clear"]);   // clear: the panel goes, the stage comes back
const OVERLAY = new Set([...PANELS, "header", "equation", "term", "click", "chip"]);
const TONE: Record<string, string> = { good: PALETTE.green, bad: PALETTE.red, accent: PALETTE.yellow, muted: PALETTE.grey, blue: PALETTE.blue };
const ease = (x: number) => { const c = clamp(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };
const back = (x: number) => { const c = clamp(x), s = 1.7; return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2); };

/** The video's look, or one picked from its seed (an older plan without `style.look`). */
export function lookOf(tl: SceneProps["tl"]): Look {
  const given = (tl as unknown as { look?: Partial<Look> | null }).look ?? {};
  const pick = <K extends keyof typeof LOOKS>(k: K) => {
    const opts = LOOKS[k] as readonly string[];
    const v = given[k];
    return typeof v === "string" && opts.includes(v) ? v : opts[Math.floor(random(`look-${k}-${tl.seed}`) * opts.length)]!;
  };
  return { stage: pick("stage"), header: pick("header"), holder: pick("holder"), entrance: pick("entrance") };
}

/** How a board element arrives, in the video's entrance style: 0..1 progress → CSS. Anything set for
 * the beat's first moment (sec 0) is already there: frame 0 is what the feed shows. */
function arrive(style: string, d: number, start = 1): React.CSSProperties {
  if (start <= 0.01) return {};
  if (d < 0) return { opacity: 0 };
  switch (style) {
    case "drop": { const e = back(d / 0.45); return { transform: `translateY(${(1 - e) * -160}px)`, opacity: clamp(d / 0.12) }; }
    case "slide": { const e = ease(d / 0.4); return { transform: `translateX(${(1 - e) * -110}%)`, opacity: clamp(d / 0.15) }; }
    case "draw": { const e = ease(d / 0.45); return { clipPath: `inset(0 ${(1 - e) * 100}% 0 0)` }; }
    case "stamp": { const k = d < 0.18 ? 1.6 - (d / 0.18) * 0.6 : 1; return { transform: `scale(${k}) rotate(${d < 0.18 ? -6 * (1 - d / 0.18) : 0}deg)`, opacity: clamp(d / 0.06) }; }
    default: return { transform: `scale(${back(d / 0.38)})`, opacity: clamp(d / 0.1) };
  }
}

const dark = (hex: string) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) < 140; };

/** The header line, drawn in the look's style. */
const Header: React.FC<{ text: string; sub?: string; style: string; size: number; maxW: number; enter: React.CSSProperties; t: number }> = ({ text, sub, style, size, maxW, enter, t }) => {
  const fs = Math.max(size * 0.62, Math.min(size, fitWords(text, size, maxW - size, { upper: true })));
  const base: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, fontSize: fs, lineHeight: 1.08, textTransform: "uppercase", textAlign: "center", letterSpacing: 1 };
  const box: Record<string, React.CSSProperties> = {
    ribbon: { background: INK, color: "#fff", padding: `${fs * 0.28}px ${fs * 0.7}px`, borderRadius: fs * 0.7, boxShadow: "0 10px 0 rgba(0,0,0,0.25)" },
    sticky: { background: "#ffe066", color: INK, padding: `${fs * 0.35}px ${fs * 0.6}px`, transform: "rotate(-2deg)", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" },
    neon: { background: "rgba(10,12,30,0.78)", color: "#7cf0ff", padding: `${fs * 0.3}px ${fs * 0.6}px`, borderRadius: fs * 0.3,
      textShadow: `0 0 ${fs * 0.25}px #38d7ff, 0 0 ${fs * 0.5}px #38d7ff`, border: `4px solid rgba(124,240,255,${0.6 + 0.3 * Math.sin(t * 6)})` },
    strip: { background: "#fff", color: INK, padding: `${fs * 0.25}px ${fs * 0.8}px`, borderTop: `8px solid ${INK}`, borderBottom: `8px solid ${INK}` },
    chalk: { color: "#fff", WebkitTextStroke: `${Math.max(6, fs * 0.12)}px ${INK}`, paintOrder: "stroke fill", filter: "drop-shadow(0 8px 0 rgba(0,0,0,0.35))" },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: fs * 0.2, ...enter }}>
      <div style={{ ...base, ...(box[style] ?? box.ribbon), maxWidth: maxW }}>{text}</div>
      {sub && <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: Math.max(size * 0.55, fitWords(sub, size * 0.62, maxW)), color: style === "chalk" || style === "neon" ? "#fff" : INK,
        background: style === "chalk" || style === "neon" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.85)", padding: "4px 18px", borderRadius: 999, maxWidth: maxW, textAlign: "center" }}>{sub}</div>}
    </div>
  );
};

/** What a sum is written on, in the look's style. */
const holderStyle = (style: string, fs: number): { box: React.CSSProperties; ink: string; accent: string } => {
  switch (style) {
    case "receipt": return { box: { background: "#fffdf5", padding: `${fs * 0.35}px ${fs * 0.7}px ${fs * 0.6}px`, boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
      clipPath: "polygon(0 0,100% 0,100% 88%,95% 100%,90% 88%,85% 100%,80% 88%,75% 100%,70% 88%,65% 100%,60% 88%,55% 100%,50% 88%,45% 100%,40% 88%,35% 100%,30% 88%,25% 100%,20% 88%,15% 100%,10% 88%,5% 100%,0 88%)" }, ink: INK, accent: PALETTE.green };
    case "phone": return { box: { background: "#111827", padding: `${fs * 0.4}px ${fs * 0.7}px`, borderRadius: fs * 0.6, border: `10px solid #2b3245`, boxShadow: "0 14px 24px rgba(0,0,0,0.35)" }, ink: "#e6f0ff", accent: PALETTE.mint };
    case "blackboard": return { box: { background: "#22483a", padding: `${fs * 0.35}px ${fs * 0.7}px`, borderRadius: 10, border: `14px solid #8a5a2b` }, ink: "#f4f1e6", accent: "#ffe066" };
    case "sign": return { box: { background: "#c98a4b", padding: `${fs * 0.35}px ${fs * 0.7}px`, borderRadius: 16, border: `8px solid #7a4a22`, boxShadow: "inset 0 -10px 0 rgba(0,0,0,0.12)" }, ink: "#2b1a0c", accent: "#fff3b0" };
    default: return { box: { background: "#fff", padding: `${fs * 0.3}px ${fs * 0.7}px`, borderRadius: fs * 0.35, border: `6px solid ${INK}`, boxShadow: "0 10px 0 rgba(0,0,0,0.18)" }, ink: INK, accent: PALETTE.green };
  }
};

/** How high a room's things float above the ground in a Short, as a share of the frame height. The
 * cast stands at 0.86 scale with the head top about 0.225 of the frame above the ground, so 0.2 hung
 * every thing (and its label) at eye level (QA, v-20261103-02: labels across Rohan's eyes and Priya's
 * head, the cola bottle on his head); 0.27 keeps a thing and its label over the heads. */
export const ROOM_FLOAT_SHORT = 0.27;

export const BoardScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as { header?: string; sub?: string; bg?: string; stage?: string; cast?: unknown[]; actors?: unknown[]; items?: unknown[]; actions?: BoardAct[] };
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const look = lookOf(p.tl);
  const min = minText(w, h);
  const box = safeBox(w, h);
  const cur = (p.tl.currency ?? "USD") as Cur;
  const props: PropSet = { ...SHARED_PROPS, ...(VIDEOS[p.tl.id]?.props ?? {}) };
  const acts = (P.actions ?? []).map((a) => ({ ...a, start: a.sec ?? at(p, a.at, 0) })).sort((a, b) => a.start - b.start);
  const when = (ev: string | undefined, dflt: number) => (ev ? at(p, ev, dflt) : dflt);

  // the header now: the params' line, rewritten by each `header` action that has fired
  let header = { text: P.header ?? "", sub: P.sub, start: 0 };
  for (const a of acts) if (a.do === "header" && t >= a.start && a.text) header = { text: a.text, sub: a.sub, start: a.start };
  // the latest sum and term, and the panel on screen (a new one replaces the last)
  const eq = [...acts].reverse().find((a) => a.do === "equation" && t >= a.start - 0.05);
  const term = [...acts].reverse().find((a) => a.do === "term" && t >= a.start);
  // the panels on screen now: everything fired since the last `clear` (or a panel with `replace`), three at most
  const fired = acts.filter((a) => (PANELS.has(a.do) || a.do === "chip") && t >= a.start);
  let cut = -1;
  fired.forEach((a, i) => { if (a.do === "clear" || a.replace) cut = i; });
  const cutAct = cut >= 0 ? fired[cut] : undefined;
  const live = fired.slice(cutAct?.do === "clear" ? cut + 1 : Math.max(0, cut));
  const stack = live.filter((a) => PANELS.has(a.do) && a.do !== "clear").slice(-3);
  const chips = live.filter((a) => a.do === "chip" && a.text).slice(-4);
  const panelIn = stack.length ? (stack[0]!.start <= 0.01 ? 1 : ease((t - stack[0]!.start) / 0.4))
    : cutAct?.do === "clear" ? 1 - ease((t - cutAct.start) / 0.3) : 0;

  // figures the board itself shows: the stage's hero figures leave them alone
  const carried = new Set<string>();
  for (const a of acts) {
    a.terms?.forEach((x) => carried.add(x.text));
    if (a.result?.text) carried.add(a.result.text);
    a.items?.forEach((x) => x.text && carried.add(x.text));
    for (const k of ["text", "figure", "from", "to", "callout"] as const) if (typeof a[k] === "string") carried.add(a[k] as string);
    a.rows?.forEach((r) => { if (r.value) carried.add(r.value); if (r.strike?.to) carried.add(r.strike.to); });
    a.steps?.forEach((x) => carried.add(x));
  }

  // a room has the cast; a card has none (the answer fills the frame)
  const card = !((P.cast ?? P.actors ?? []) as unknown[]).length;
  // the stage: the build scene, camera still, the board's own verbs taken out
  const stageBeat = {
    ...p.beat,
    // the ground sits a little higher than a build world's, so the middle of the frame is the stage
    // (owner, 2026-11-02: "the animations are over the characters' heads while there's lots of space
    // below"): in a room the cast stands low and the picture floats big above them; a card (no cast:
    // the answer, as The Curious Plot shows it) is one flat colour with the picture in its middle
    params: { world: card ? { kind: "flat", tint: P.bg, ground: v ? 0.62 : 0.7, bare: true } : { kind: P.stage ?? look.stage, tint: P.bg, ground: v ? 0.735 : 0.8 },
      items: P.items ?? [], yieldAll: card,
      actors: ((P.cast ?? P.actors ?? []) as { scale?: number }[]).map((a) => ({ ...a, scale: a.scale ?? (v ? 0.86 : 0.8) })),
      actions: (P.actions ?? []).filter((a) => !OVERLAY.has(a.do)), locked: true, carried: [...carried], yieldTo: panelIn,
      attention: true, floatY: card ? 0 : v ? ROOM_FLOAT_SHORT : 0.22, heroY: card ? undefined : v ? 0.255 : 0.24 },
  };
  // a panel needs room: the stage shrinks toward its ground (a Short) or slides left (a long video)
  // (smoke test 2026-11-02: shrinking the whole stage in a Short framed it like a box; the Short's stage
  // stays put and its panel sits above the ground line instead. TODO: shrink only the things, not the world)
  const stageT = v ? "none" : `translate(${-w * 0.2 * panelIn}px, ${h * 0.1 * panelIn}px) scale(${1 - 0.2 * panelIn})`;

  // zones
  const hdrSize = v ? 70 : 50, hdrTop = v ? h * 0.075 : h * 0.05, maxW = box.x1 - box.x0 - 40;
  const holderTop = v ? h * 0.155 : h * 0.17;
  // a card has no cast, so its picture takes the whole middle of the frame (owner, 2026-11-02: the lower
  // third sat empty); a room keeps it above the cast's heads
  const hasChips = acts.some((a) => a.do === "chip");
  const panelBox = v ? { x0: w * 0.07, x1: w * 0.87, y0: h * 0.175, y1: h * (card ? (hasChips ? 0.63 : 0.69) : 0.5) } : { x0: w * 0.52, x1: w * 0.94, y0: h * 0.27, y1: h * 0.74 };
  if (v && (eq || term)) panelBox.y0 = h * 0.28;
  const progress = clamp((p.beat.from + p.frame / (p.tl.tempo || 1)) / p.tl.durationInFrames);
  const factFigures = Object.entries(p.tl.figures ?? {}).filter(([k]) => /^fact\d+$/.test(k)).map(([, x]) => x);
  const factSaid = factFigures.some((f) => (p.beat.say ?? "").includes(f));

  // ---- the sum: terms appear one by one on their words, the result counts up ----
  let eqNode: React.ReactNode = null;
  if (eq) {
    const fs = Math.max(min, v ? 64 : 46);
    const hs = holderStyle(look.holder, fs);
    const terms = (eq.terms ?? []).map((x, i) => ({ ...x, s: x.at ? when(x.at, eq.start + i * 0.35) : eq.start + i * 0.35 }));
    const rs = eq.result ? when(eq.result.at, (terms[terms.length - 1]?.s ?? eq.start) + 0.5) : Infinity;
    const all = [...terms.map((x) => x.text), "=", eq.result?.text ?? ""].join(" ");
    const size = fitLine(all, fs, maxW - fs * 1.6, { min });
    const resultText = eq.result && t >= rs ? (typeof eq.result.value === "number" && eq.result.value > 0 ? countUp(eq.result.value, ease((t - rs) / 0.7), eq.result.text, "inr", cur) : eq.result.text) : "";
    eqNode = (
      <div style={{ position: "absolute", left: 0, right: 0, top: holderTop, display: "flex", justifyContent: "center", ...arrive(look.entrance, t - eq.start) }}>
        <div style={{ ...hs.box, fontFamily: FONT, fontWeight: 900, fontSize: size, color: hs.ink, display: "flex", gap: size * 0.3, alignItems: "baseline", whiteSpace: "nowrap" }}>
          {terms.map((x, i) => <span key={i} style={{ opacity: clamp((t - x.s) / 0.12), transform: `scale(${t >= x.s ? back((t - x.s) / 0.3) : 0.6})`, display: "inline-block" }}>{x.text}</span>)}
          {eq.result && t >= rs - 0.05 && <span style={{ opacity: clamp((t - rs) / 0.1) }}>=</span>}
          {resultText && <span style={{ color: hs.accent, display: "inline-block", transform: `scale(${back((t - rs) / 0.35)})` }}>{resultText}</span>}
        </div>
      </div>
    );
  }

  // ---- the named term ----
  let termNode: React.ReactNode = null;
  if (term?.name) {
    const d = t - term.start, fs = Math.max(min, v ? 54 : 40);
    termNode = (
      <div style={{ position: "absolute", left: 0, right: 0, top: eq ? holderTop + (v ? 150 : 100) : holderTop, display: "flex", justifyContent: "center", ...arrive("stamp", d) }}>
        <div style={{ background: "#fff", border: `6px solid ${INK}`, borderRadius: 18, padding: `${fs * 0.25}px ${fs * 0.6}px`, textAlign: "center", boxShadow: "0 10px 0 rgba(0,0,0,0.2)", maxWidth: maxW }}>
          {term.kicker && <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: Math.max(min * 0.7, fs * 0.5), color: "#fff", background: PALETTE.red, borderRadius: 999, padding: "2px 16px", display: "inline-block", textTransform: "uppercase", letterSpacing: 2 }}>{term.kicker}</div>}
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fitLine(term.name.toUpperCase(), fs, maxW - fs * 1.4, { min, upper: true }), color: INK, textTransform: "uppercase" }}>{term.name}</div>
          {term.line && <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: Math.max(min * 0.8, fitWords(term.line, fs * 0.6, maxW - fs)), color: "#4a5268" }}>{term.line}</div>}
        </div>
      </div>
    );
  }

  // ---- the panel ----
  type Box4 = { x0: number; x1: number; y0: number; y1: number };
  const renderPanel = (panel: (typeof acts)[number], panelBox: Box4): React.ReactNode => {
    let panelNode: React.ReactNode = null;
    const pw = panelBox.x1 - panelBox.x0, ph = panelBox.y1 - panelBox.y0, d = t - panel.start;
    const wrap = (child: React.ReactNode) => (
      <div style={{ position: "absolute", left: panelBox.x0, top: panelBox.y0, width: pw, height: ph, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...arrive(look.entrance, d, panel.start) }}>{child}</div>
    );
    const label = (text: string, size = Math.max(min, v ? 48 : 36), color = INK) => (
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: fitLine(text, size, pw, { min }), color, textAlign: "center", background: "rgba(255,255,255,0.88)", borderRadius: 14, padding: "2px 16px" }}>{text}</div>
    );
    if (panel.do === "bars" && panel.items?.length) {
      const items = panel.items.slice(0, 5);
      const max = Math.max(1, ...items.map((x) => x.value ?? 0));
      const bw = Math.min(pw / items.length * 0.62, v ? 170 : 140), chartH = ph * 0.62;
      const fs = Math.max(min, Math.min(v ? 50 : 38, ...items.map((x) => fitLine(x.text ?? "", v ? 50 : 38, pw / items.length - 8, { min }))));
      panelNode = wrap(<>
        {panel.title && label(panel.title)}
        <svg width={pw} height={chartH + fs * 2.6} style={{ overflow: "visible" }}>
          {items.map((x, i) => {
            const s0 = x.at ? when(x.at, panel.start + i * 0.4) : panel.start + i * 0.4;
            const k = ease((t - s0) / 0.6), hgt = Math.max(6, chartH * ((x.value ?? 0) / max)) * k;
            const turned = x.turn && t >= when(x.turn.at, Infinity);
            const fill = TONE[(turned ? x.turn!.tone : x.tone) ?? "accent"] ?? PALETTE.yellow;
            const cx = (pw / items.length) * (i + 0.5), base = chartH + fs * 1.3;
            return <g key={i} opacity={t >= s0 ? 1 : 0}>
              <rect x={cx - bw / 2} y={base - hgt} width={bw} height={hgt} rx={10} fill={fill} stroke={INK} strokeWidth={6} />
              {x.text && <text x={cx} y={base - hgt - 16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={INK} stroke="#fff" strokeWidth={8} paintOrder="stroke">{k >= 1 || !x.value ? x.text : countUp(x.value, k, x.text, "inr", cur)}</text>}
              {x.label && <text x={cx} y={base + fs * 1.05} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={Math.max(min, fitLine(x.label, fs * 0.9, pw / items.length - 6, { min }))} fill={INK} stroke="#fff" strokeWidth={8} paintOrder="stroke">{x.label}</text>}
            </g>;
          })}
        </svg>
      </>);
    } else if (panel.do === "ring") {
      const share = clamp((panel.value ?? 0) / 100), k = ease((d - 0.2) / 0.9), R = Math.min(pw, ph) * 0.36;
      const fs = Math.max(min, fitLine(panel.text ?? "", v ? 96 : 70, R * 1.5, { min }));
      panelNode = wrap(<>
        <svg width={R * 2.6} height={R * 2.6} style={{ overflow: "visible" }}>
          <circle cx={R * 1.3} cy={R * 1.3} r={R} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={R * 0.34} />
          <circle cx={R * 1.3} cy={R * 1.3} r={R} fill="none" stroke={PALETTE.red} strokeWidth={R * 0.34} strokeDasharray={`${2 * Math.PI * R * share * k} ${2 * Math.PI * R}`} transform={`rotate(-90 ${R * 1.3} ${R * 1.3})`} />
          <circle cx={R * 1.3} cy={R * 1.3} r={R * 1.17} fill="none" stroke={INK} strokeWidth={5} />
          <circle cx={R * 1.3} cy={R * 1.3} r={R * 0.83} fill="#fff" stroke={INK} strokeWidth={5} />
          {panel.text && <text opacity={clamp((d - 0.9) / 0.2)} x={R * 1.3} y={R * 1.3 + fs * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={INK}>{panel.text}</text>}
          {panel.callout && k > 0.6 && (() => {
            const a = (-90 + 360 * share * k / 2) * Math.PI / 180, ox = R * 1.3 + Math.cos(a) * R * 1.17, oy = R * 1.3 + Math.sin(a) * R * 1.17;
            const cfs = Math.max(min, fitLine(panel.callout.toUpperCase(), v ? 46 : 34, R * 2.4, { min, upper: true })), cw2 = textWidth(panel.callout.toUpperCase(), cfs, true) + 40;
            const cx2 = Math.max(cw2 / 2, Math.min(R * 2.6 - cw2 / 2, ox - R * 0.5)), cy2 = Math.max(cfs, oy - R * 0.45);
            return <g opacity={clamp((k - 0.6) / 0.3)}>
              <line x1={ox} y1={oy} x2={cx2} y2={cy2 + cfs * 0.4} stroke={INK} strokeWidth={6} />
              <rect x={cx2 - cw2 / 2} y={cy2 - cfs * 0.8} width={cw2} height={cfs * 1.35} rx={14} fill={PALETTE.yellow} stroke={INK} strokeWidth={6} />
              <text x={cx2} y={cy2 + cfs * 0.25} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={cfs} fill={INK} style={{ textTransform: "uppercase" }}>{panel.callout}</text>
            </g>;
          })()}
        </svg>
        {panel.label && label(panel.label)}
      </>);
    } else if (panel.do === "grid") {
      const n = Math.max(1, Math.min(400, Math.round(panel.n ?? 100)));
      const cols = panel.cols ?? Math.ceil(Math.sqrt(n * (pw / ph)));
      const rows = Math.ceil(n / cols), cell = Math.min(pw / cols, (ph * 0.78) / rows), u = cell * 0.82;
      const marked = Math.round(n * clamp((panel.share ?? 0) / 100)), mk = panel.markAt ? ease((t - when(panel.markAt, panel.start + 1.2)) / 0.5) : ease((d - 1.0) / 0.5);
      const Prop = panel.prop ? props[panel.prop] : undefined;
      panelNode = wrap(<>
        {panel.text && label(panel.text, Math.max(min, v ? 60 : 44))}
        <svg width={cols * cell} height={rows * cell}>
          {Array.from({ length: n }, (_, i) => {
            const r = Math.floor(i / cols), c = i % cols, show = clamp((d * n / 0.9 - i) / Math.max(1, n / 25));
            if (show <= 0) return null;
            const on = i < marked && mk > 0, x = c * cell + cell / 2, y = r * cell + cell / 2;
            return <g key={i} transform={`translate(${x},${y}) scale(${back(show)})`}>
              {Prop ? <g transform={`translate(0,${u * 0.45})`} opacity={on ? 1 : 0.85}><Prop s={u * 0.9} t={t} seed={`g${i}`} /></g>
                : <rect x={-u / 2} y={-u / 2} width={u} height={u} rx={u * 0.18} fill={on ? shade(PALETTE.red, -0.1 * (1 - mk)) : "#ffffff"} stroke={INK} strokeWidth={Math.max(1.5, u * 0.07)} />}
              {on && panel.lock && <g transform={`scale(${mk})`}><rect x={-u * 0.28} y={-u * 0.06} width={u * 0.56} height={u * 0.42} rx={u * 0.06} fill={PALETTE.gold} stroke={INK} strokeWidth={Math.max(1, u * 0.05)} />
                <path d={`M${-u * 0.17},${-u * 0.06} v${-u * 0.12} a${u * 0.17},${u * 0.17} 0 0 1 ${u * 0.34},0 v${u * 0.12}`} fill="none" stroke={INK} strokeWidth={Math.max(1, u * 0.06)} /></g>}
            </g>;
          })}
        </svg>
        {panel.label && label(panel.label)}
      </>);
    } else if (panel.do === "calendar") {
      const flip = ease((t - when(panel.flipAt, panel.start + 1.0)) / 0.5), cw = Math.min(pw * 0.6, v ? 520 : 420), chh = cw * 0.92;
      const fs = (txt: string) => Math.max(min, fitLine(txt, cw * 0.36, cw * 0.86, { min }));
      const page = (txt: string, k: number, key: string) => (
        <div key={key} style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: 22, border: `8px solid ${INK}`, overflow: "hidden", transformOrigin: "50% 0%", transform: `rotateX(${k * 92}deg)`, display: "flex", flexDirection: "column" }}>
          <div style={{ height: chh * 0.24, background: PALETTE.red, borderBottom: `8px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, color: "#fff", fontSize: Math.max(min, fitLine(panel.label ?? " ", chh * 0.14, cw * 0.86, { min })) }}>{panel.label ?? ""}</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: fs(txt), color: INK }}>{txt}</div>
        </div>
      );
      const steps = panel.steps?.length ? panel.steps : [panel.from ?? "", panel.to ?? ""];
      const f0 = when(panel.flipAt, panel.start + 1.0), idx = Math.max(0, Math.min(steps.length - 1, Math.floor((t - f0) / 0.55) + 1));
      const turning = idx > 0 && idx < steps.length ? ease(((t - f0) % 0.55) / 0.35) : 1;
      panelNode = wrap(
        <div style={{ position: "relative", width: cw, height: chh, perspective: 1400 }}>
          {page(steps[idx] ?? "", 0, "to")}
          {panel.steps?.length ? (idx > 0 && turning < 1 && page(steps[idx - 1] ?? "", turning, "from")) : (flip < 1 && page(panel.from ?? "", flip, "from"))}
        </div>,
      );
    } else if (panel.do === "buttons" && panel.items?.length) {
      const items = panel.items.slice(0, 4);
      const bh = Math.min(ph / items.length * 0.78, v ? 150 : 110);
      const fs = Math.max(min, Math.min(...items.map((x) => fitLine((x.text ?? "").toUpperCase(), bh * 0.42, pw * 0.7, { min, upper: true }))));
      const click = [...acts].reverse().find((a) => a.do === "click" && t >= a.start - 0.8);
      const ci = click ? Math.max(0, Math.min(items.length - 1, click.index ?? 0)) : -1;
      const tones = [PALETTE.green, PALETTE.blue, PALETTE.dark, PALETTE.orange];
      panelNode = wrap(
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: bh * 0.22, width: pw * 0.82 }}>
          {items.map((x, i) => {
            const s0 = x.at ? when(x.at, panel.start + i * 0.5) : panel.start + i * 0.5;
            const pressed = click && i === ci && t >= click.start && t < click.start + 0.25;
            const Prop = x.prop ? props[x.prop] : undefined;
            return <div key={i} style={{ height: bh, borderRadius: bh * 0.25, background: tones[i % tones.length], border: `7px solid ${INK}`, boxShadow: pressed ? "0 2px 0 rgba(0,0,0,0.3)" : "0 12px 0 rgba(0,0,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: bh * 0.2, ...arrive(look.entrance, t - s0), transform: `${arrive(look.entrance, t - s0).transform ?? ""} translateY(${pressed ? 10 : 0}px)` }}>
              {Prop && <svg width={bh * 0.7} height={bh * 0.7} style={{ overflow: "visible" }}><g transform={`translate(${bh * 0.35},${bh * 0.62})`}><Prop s={bh * 0.55} t={t} seed={`b${i}`} /></g></svg>}
              <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: fs, color: "#fff", textTransform: "uppercase", WebkitTextStroke: `4px ${INK}`, paintOrder: "stroke fill" }}>{x.text}</span>
            </div>;
          })}
          {click && ci >= 0 && (() => {
            const k = ease((t - (click.start - 0.8)) / 0.7), ty = ci * (bh * 1.22) + bh * 0.5;
            return <svg width={120} height={140} style={{ position: "absolute", left: pw * 0.82 * (0.95 - 0.3 * k), top: ty + (1 - k) * 160 - 20, overflow: "visible" }} data-probe="skip">
              <path d="M20,10 L20,95 L42,75 L58,112 L74,104 L58,68 L90,68 Z" fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round" transform={`scale(${t >= click.start && t < click.start + 0.25 ? 0.88 : 1})`} />
            </svg>;
          })()}
        </div>,
      );
    } else if (panel.do === "person" && panel.name) {
      const cw = Math.min(pw * 0.95, v ? 820 : 700), Prop = panel.prop ? props[panel.prop] : undefined, av = v ? 190 : 150;
      const figK = ease((d - 0.4) / 0.8);
      panelNode = wrap(
        <div style={{ width: cw, background: "#fff", border: `8px solid ${INK}`, borderRadius: 28, padding: 26, display: "flex", gap: 26, alignItems: "center", boxShadow: "0 14px 0 rgba(0,0,0,0.22)" }}>
          <svg width={av} height={av} style={{ flex: "none" }}>
            <circle cx={av / 2} cy={av / 2} r={av / 2 - 6} fill={PALETTE.tan} stroke={INK} strokeWidth={6} />
            {Prop ? <g transform={`translate(${av / 2},${av * 0.86})`}><Prop s={av * 0.62} t={t} seed="person" /></g>
              : <g fill={shade(PALETTE.tan, -0.35)}><circle cx={av / 2} cy={av * 0.4} r={av * 0.17} /><path d={`M${av * 0.2},${av * 0.86} a${av * 0.3},${av * 0.26} 0 0 1 ${av * 0.6},0 Z`} /></g>}
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            {panel.kicker && <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: Math.max(min, fitLine(panel.kicker.toUpperCase(), 40, cw - av - 90, { min, upper: true })), color: "#6b7385", textTransform: "uppercase", letterSpacing: 1 }}>{panel.kicker}</div>}
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(panel.name, v ? 70 : 56, cw - av - 90, { min })), color: INK, lineHeight: 1.05 }}>{panel.name}</div>
            {panel.figure && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(panel.figure, v ? 64 : 50, cw - av - 90, { min })), color: "#fff", background: PALETTE.green,
              borderRadius: 14, padding: "2px 18px", alignSelf: "flex-start", opacity: clamp((d - 0.35) / 0.15) }}>{typeof panel.value === "number" && panel.value > 0 && figK < 1 ? countUp(panel.value, figK, panel.figure, "inr", cur) : panel.figure}</div>}
          </div>
        </div>,
      );
    } else if (panel.do === "doc" && panel.rows?.length) {
      // a document whose rows fill in on their words; a value can be struck out and replaced
      const dw = Math.min(pw * 0.96, v ? 860 : 720), fs = Math.max(min, v ? 54 : 38), title = panel.title ?? "";
      const stampAt = panel.stamp ? when(panel.stamp.at, panel.start + 1.5) : Infinity;
      panelNode = wrap(
        <div style={{ width: dw, background: "#fffdf7", border: `7px solid ${INK}`, borderRadius: 22, boxShadow: "0 12px 0 rgba(0,0,0,0.22)", position: "relative" }}>
          {title && <div style={{ background: TONE[panel.tone ?? "good"] ?? PALETTE.green, color: "#fff", fontFamily: FONT, fontWeight: 900, textAlign: "center", padding: "6px 16px", borderRadius: "15px 15px 0 0",
            borderBottom: `6px solid ${INK}`, textTransform: "uppercase", letterSpacing: 2, fontSize: Math.max(min, fitLine(title.toUpperCase(), fs * 0.9, dw - 40, { min, upper: true })) }}>{title}</div>}
          <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            {panel.rows.slice(0, 5).map((r, i) => {
              const s0 = r.at ? when(r.at, panel.start + 0.35 * i) : panel.start + 0.35 * i;
              const st = r.strike ? when(r.strike.at, Infinity) : Infinity, struck = t >= st;
              const val = r.value ?? "";
              return <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, opacity: panel.start <= 0.01 && !r.at ? 1 : clamp((t - s0) / 0.15) }}>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: min, color: "#5b6478", width: dw * 0.32, textTransform: "uppercase" }}>{r.label}</div>
                <div style={{ flex: 1, border: `5px solid ${INK}`, borderRadius: 12, background: "#fff", padding: "2px 12px", fontFamily: FONT, fontWeight: 900, color: INK, textAlign: "center",
                  fontSize: Math.max(min, fitLine(struck ? `${val} ${r.strike!.to}` : val, fs, dw * 0.56, { min })), transform: `scale(${t >= s0 ? back((t - s0) / 0.3) : 0.6})` }}>
                  <span style={{ opacity: struck ? 0.4 : 1, textDecoration: struck ? "line-through" : "none", textDecorationColor: PALETTE.red, textDecorationThickness: 6 }}>{val}</span>
                  {struck && <span style={{ color: PALETTE.red, marginLeft: 12, display: "inline-block", transform: `scale(${back((t - st) / 0.35)})` }}>{r.strike!.to}</span>}
                </div>
              </div>;
            })}
          </div>
          {panel.stamp && t >= stampAt && (
            <div style={{ position: "absolute", right: -dw * 0.03, top: -24, transform: `rotate(-12deg) scale(${t - stampAt < 0.18 ? 1.6 - ((t - stampAt) / 0.18) * 0.6 : 1})`,
              border: `7px solid ${PALETTE.red}`, borderRadius: 12, color: PALETTE.red, background: "rgba(255,255,255,0.85)", fontFamily: FONT, fontWeight: 900,
              fontSize: Math.max(min, fitLine(panel.stamp.text.toUpperCase(), fs * 1.1, dw * 0.6, { min, upper: true })), padding: "0 18px", textTransform: "uppercase" }}>{panel.stamp.text}</div>
          )}
        </div>,
      );
    }
    return panelNode;
  };
  // the panels stacked in the middle, the first one the biggest
  const slot = (i: number, n: number): Box4 => {
    if (n <= 1) return panelBox;
    const weights = n === 2 ? [0.56, 0.44] : [0.42, 0.29, 0.29];
    const H = panelBox.y1 - panelBox.y0, y0 = panelBox.y0 + H * weights.slice(0, i).reduce((a, b) => a + b, 0);
    return { ...panelBox, y0, y1: y0 + H * weights[i]! };
  };
  const panelNodes = stack.map((a, i) => <React.Fragment key={`${a.do}${i}`}>{renderPanel(a, slot(i, stack.length))}</React.Fragment>);
  // chips line up under the picture, each arriving on its word
  const chipTone = (tone?: string) => ({ bg: TONE[tone ?? "accent"] ?? PALETTE.yellow, ink: tone === "bad" || tone === "blue" ? "#fff" : INK });
  const chipNode = chips.length ? (
    <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: v ? h * (card ? (stack.length ? 0.645 : 0.665) : 0.52) : h * 0.76, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 }}>
      {chips.map((c, i) => { const cs = chipTone(c.tone); return (
        <div key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine((c.text ?? "").toUpperCase(), v ? 50 : 36, maxW * 0.9, { min, upper: true })), textTransform: "uppercase",
          background: cs.bg, color: cs.ink, border: `6px solid ${INK}`, borderRadius: 16, padding: "4px 20px", boxShadow: "0 8px 0 rgba(0,0,0,0.22)", ...arrive("stamp", t - c.start, c.start) }}>{c.text}</div>
      ); })}
    </div>
  ) : null;

  const headerEnter = arrive(look.entrance === "draw" ? "draw" : look.entrance === "slide" ? "slide" : "pop", t - header.start + (header.start === 0 ? 0.6 : 0));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: stageT, transformOrigin: "0 0" }}>
        <BuildScene {...p} beat={stageBeat} />
      </div>
      {/* how far through the story: a thin bar along the very top */}
      <div style={{ position: "absolute", left: 0, top: 0, height: v ? 12 : 8, width: w * progress, background: PALETTE.yellow, boxShadow: "0 2px 0 rgba(0,0,0,0.3)" }} data-probe="skip" />
      {header.text && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: hdrTop, display: "flex", justifyContent: "center" }}>
          <Header text={header.text} sub={header.sub} style={look.header} size={hdrSize} maxW={maxW} enter={headerEnter} t={t} />
        </div>
      )}
      {/* where the facts come from: on the ground band, only while a sourced figure is being said */}
      {p.tl.sources && factSaid && (
        <div style={{ position: "absolute", left: 0, right: 0, top: v ? h * 0.742 : h * 0.81, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: min, color: "#fff", background: "rgba(0,0,0,0.55)", borderRadius: 999, padding: "4px 22px", maxWidth: maxW,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{textWidth(p.tl.sources, min) > maxW ? p.tl.sources.split(" · ")[0] : p.tl.sources}</div>
        </div>
      )}
      {eqNode}
      {termNode}
      {panelNodes}
      {chipNode}
    </div>
  );
};
