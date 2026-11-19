/**
 * Headlines as evidence: a stack of newspaper or web headline cards that slide in one per spoken
 * moment, the outlet's name and the date on each. Drawn from text in our own typography (never a
 * screenshot or logo of a real site). The newest card sits on top; the ones under it step back.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, DOC, fmtDate, fs, outBack, outCubic, SANS, SERIF, smooth, unit } from "./theme";

export type HeadlineItem = { outlet: string; date?: string; title: string; deck?: string; style?: "paper" | "web"; hi?: string };

const Mark: React.FC<{ text: string; hi?: string; k: number; color?: string }> = ({ text, hi, k, color = DOC.marker }) => {
  const i = hi ? text.indexOf(hi) : -1;
  if (!hi || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      {/* a marker stroke behind the words that wraps with them across lines (it grows left to right) */}
      <span style={{ backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 88%",
        backgroundSize: `${k * 100}% 46%`, WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone", padding: "0 0.06em" }}>{hi}</span>
      {text.slice(i + hi.length)}
    </>
  );
};

const PaperCard: React.FC<{ it: HeadlineItem; cw: number; w: number; h: number; hk: number }> = ({ it, cw, w, h, hk }) => {
  const u = unit(w, h);
  const v = h > w;
  return (
    <div style={{ width: cw, background: "linear-gradient(175deg, #f3ecd9, #e6dcc2)", padding: `${34 * u}px ${46 * u}px ${40 * u}px`, color: DOC.paperInk, position: "relative" }}>
      <div style={{ textAlign: "center", fontFamily: SERIF, fontWeight: 800, fontSize: fs(w, h, v ? 50 : 44), letterSpacing: 1 }}>{it.outlet}</div>
      <div style={{ borderTop: `${3 * u}px solid ${DOC.paperInk}`, borderBottom: `${1.5 * u}px solid ${DOC.paperInk}`, height: 5 * u, margin: `${12 * u}px 0 ${8 * u}px` }} />
      <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: fs(w, h, 26), letterSpacing: 3, color: "#5a5143" }}>{fmtDate(it.date).toUpperCase()}</div>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: fs(w, h, v ? 84 : 72), lineHeight: 1.06, marginTop: 22 * u, letterSpacing: -0.5 }}>
        <Mark text={it.title} hi={it.hi} k={hk} />
      </div>
      {it.deck ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: fs(w, h, 34), lineHeight: 1.3, marginTop: 18 * u, color: "#3e372d" }}>{it.deck}</div> : null}
      {/* column rules and greyed body text: newsprint texture, not words to read */}
      <div data-probe="skip" style={{ display: "flex", gap: 22 * u, marginTop: 24 * u, opacity: 0.5 }}>
        {[0, 1, 2].map((c) => (
          <div key={c} style={{ flex: 1 }}>
            {Array.from({ length: 4 }, (_, i) => <div key={i} style={{ height: 7 * u, background: "#6d6455", marginTop: 9 * u, width: `${92 - ((i * 13 + c * 7) % 24)}%`, borderRadius: 2 }} />)}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.25), rgba(0,0,0,0) 50%, rgba(80,60,20,0.12))", pointerEvents: "none" }} />
    </div>
  );
};

const WebCard: React.FC<{ it: HeadlineItem; cw: number; w: number; h: number; hk: number }> = ({ it, cw, w, h, hk }) => {
  const u = unit(w, h);
  const v = h > w;
  return (
    <div style={{ width: cw, background: "#ffffff", borderRadius: 14 * u, overflow: "hidden", color: "#111418" }}>
      <div style={{ height: 10 * u, background: DOC.red }} />
      <div style={{ padding: `${28 * u}px ${40 * u}px ${36 * u}px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: SANS }}>
          <span style={{ fontWeight: 800, fontSize: fs(w, h, 36), letterSpacing: 0.5 }}>{it.outlet}</span>
          <span style={{ fontWeight: 500, fontSize: fs(w, h, 26), color: "#6b7280" }}>{fmtDate(it.date)}</span>
        </div>
        <div style={{ height: 1.5 * u, background: "#e5e7eb", margin: `${16 * u}px 0 ${20 * u}px` }} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fs(w, h, v ? 74 : 62), lineHeight: 1.12, letterSpacing: -1 }}>
          <Mark text={it.title} hi={it.hi} k={hk} color="rgba(224,72,62,0.35)" />
        </div>
        {it.deck ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: fs(w, h, 32), lineHeight: 1.35, marginTop: 16 * u, color: "#4b5563" }}>{it.deck}</div> : null}
      </div>
    </div>
  );
};

export const Headline: React.FC<{ items: HeadlineItem[]; on: number[]; hiAt?: number; t: number; end: number; w: number; h: number }> = ({ items, on, hiAt, t, end, w, h }) => {
  const v = h > w;
  const u = unit(w, h);
  const cw = v ? w * 0.86 : w * 0.56;
  const shown = items.map((_, i) => t >= (on[i] ?? 0));
  const top = shown.lastIndexOf(true);
  const push = 1 + 0.05 * smooth(t / Math.max(1, end));
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${push})` }}>
      {items.map((it, i) => {
        const at = on[i] ?? 0;
        if (t < at) return null;
        const k = outBack((t - at) / 16);
        const ke = outCubic((t - at) / 14);
        const depth = top - i;                         // 0 for the newest card
        const back = smooth((t - (on[i + 1] ?? Infinity)) / 12);   // steps back when the next lands
        const rot = (i % 2 ? 2.4 : -2.2) + (1 - k) * (i % 2 ? 8 : -8);
        // older cards step back up and to the side, so the pile reads as a pile
        const dd = back * Math.min(depth, 3);
        const dx = (1 - ke) * w * 0.6 + dd * (i % 2 ? 70 : -70) * u;
        const dy = (1 - ke) * 40 * u - dd * 70 * u;
        const s = 1 - dd * 0.07;
        const hk = i === top && hiAt !== undefined ? smooth((t - hiAt) / 26) : i < top ? 1 : 0;
        return (
          <div key={i} style={{ position: "absolute", transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${s})`, opacity: clamp01(ke * 2),
            filter: `brightness(${1 - back * 0.3 * Math.min(depth, 2)}) drop-shadow(0 ${26 * u}px ${50 * u}px rgba(0,0,0,0.55))` }}>
            {(it.style ?? "paper") === "web" ? <WebCard it={it} cw={cw} w={w} h={h} hk={hk} /> : <PaperCard it={it} cw={cw} w={w} h={h} hk={hk} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
