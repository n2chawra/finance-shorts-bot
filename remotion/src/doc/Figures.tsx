/**
 * Figure objects (style-study 2026-11-19 §2 and §8.5): a spoken figure becomes a designed object that
 * moves twice, never just big type. Every figure here is a string from `params.fig` (Python computed or
 * copied it from a sourced fact); this file only formats and animates it.
 *
 *   CountUp      the figure counts up over the picture under it, which dims and blurs; an italic unit line
 *                settles under it ("1.08 million yuan")
 *   ListingCard  a resale listing on a phone-style card; its price flips to the new price, then a red loss
 *                tag ("−88%") slams in at an angle
 *   Ticker       a split-flap board ("TICKER · EXCHANGE") whose digits roll down to the new price, with a
 *                label-maker tape under it ("−60% from peak")
 *   SinkBar      a bar that grows to its old height, then sinks and leaves a dashed ghost of where it was
 *   Donut        a ring filling to a share, the figure in the middle
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { countText } from "../flat/kit";
import { clamp01, DISPLAY, DOC, FilmGrain, fmtDate, fs, MONO, outBack, outCubic, SANS, SERIF, smooth, unit } from "./theme";

/** "{drop} from peak" → "−60% from peak": `{key}` in a text replaced by params.fig[key] (Python fills
 * placeholders before render; this covers a fig key named in a text the same way). */
export const fillFig = (text: string | undefined, fig: Record<string, string>): string =>
  (text ?? "").replace(/\{(\w+)\}/g, (all, k: string) => fig[k] ?? all);

/** The channel's charcoal backdrop with a soft key light: what figure objects sit on when nothing is
 * under them (one backdrop for the whole film, so objects read as one set). */
export const Plate: React.FC<{ t: number; light?: [number, number] }> = ({ t, light = [0.5, 0.4] }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 65% at ${light[0] * 100}% ${light[1] * 100}%, #2b2f37 0%, #181b21 55%, #0b0d11 100%)` }}>
    <AbsoluteFill style={{ opacity: 0.5, backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1.6px)", backgroundSize: "7px 7px" }} />
    <FilmGrain t={t} o={0.22} moving={false} />
  </AbsoluteFill>
);

/** Dim and blur whatever is under this layer (the footage behind a figure: a rack focus to the number). */
const Backdrop: React.FC<{ k: number; dim: number; blur: number }> = ({ k, dim, blur }) =>
  k <= 0 ? null : (
    <AbsoluteFill style={{ backdropFilter: `blur(${blur * k}px) brightness(${1 - dim * k})`, WebkitBackdropFilter: `blur(${blur * k}px) brightness(${1 - dim * k})`,
      background: `rgba(6,8,12,${0.18 * k})` }} />
  );

/** A rough width of `text` in Anton at `size` (digits and caps are ~0.5 em). */
const antonW = (text: string, size: number) => [...text].reduce((a, c) => a + (/[.,:]/.test(c) ? 0.24 : /[ ]/.test(c) ? 0.25 : 0.52), 0) * size;
/** A size that fits `text` in `maxW`, at most `size`. */
export const fitAnton = (text: string, size: number, maxW: number) => Math.min(size, maxW / Math.max(1, antonW(text, 1)));

export type FigTone = "gold" | "white" | "red" | "mint";
const TONE: Record<FigTone, string> = { gold: DOC.gold, white: "#ffffff", red: DOC.red, mint: "#5fe0b0" };
export const isTone = (x: unknown): x is FigTone => typeof x === "string" && x in TONE;

// ------------------------------------------------------------------ count-up

export const CountUp: React.FC<{
  t: number; end: number; w: number; h: number;
  figure: string; unit?: string; eyebrow?: string; countAt: number; countLen?: number;
  tone?: FigTone; dim?: number; blur?: number; plate?: boolean; pos?: "center" | "low";
}> = ({ t, end, w, h, figure, unit: unitLine, eyebrow, countAt, countLen = 54, tone = "gold", dim = 0.45, blur = 10, plate = false, pos = "center" }) => {
  const v = h > w;
  const u = unit(w, h);
  const bk = smooth((t - countAt + 8) / 14);                      // the picture dims as the figure arrives
  const ck = 1 - Math.pow(1 - clamp01((t - countAt) / countLen), 3.2);
  const done = t >= countAt + countLen;
  const settle = done ? 1 + 0.06 * Math.max(0, 1 - (t - countAt - countLen) / 8) : 1;   // the second move: a small kick on landing
  const uk = outCubic((t - countAt - countLen * 0.7) / 14);
  const ek = outCubic((t - countAt + 6) / 12);
  const drift = 1 + 0.025 * (t / Math.max(1, end));
  const size = fitAnton(figure, fs(w, h, v ? 250 : 260), w * (v ? 0.84 : 0.7));
  const shown = countText(figure, ck);
  const color = TONE[tone];
  if (t < countAt - 10) return plate ? <Plate t={t} /> : null;
  return (
    <AbsoluteFill>
      {plate ? <Plate t={t} /> : <Backdrop k={bk} dim={dim} blur={blur} />}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: pos === "low" ? "flex-end" : "center",
        paddingBottom: pos === "low" ? h * (v ? 0.42 : 0.16) : 0, paddingTop: v && pos === "center" ? 0 : 0, transform: `scale(${drift})`, marginTop: v && pos === "center" ? -h * 0.08 : 0 }}>
        {eyebrow ? (
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fs(w, h, 34), letterSpacing: 9 * u, color: "rgba(243,239,230,0.85)", textTransform: "uppercase",
            opacity: ek, transform: `translateY(${(1 - ek) * 16 * u}px)`, marginBottom: 6 * u, textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>{eyebrow}</div>
        ) : null}
        <div style={{ position: "relative", fontFamily: DISPLAY, fontSize: size, lineHeight: 1, color, fontVariantNumeric: "tabular-nums", letterSpacing: 1 * u,
          transform: `scale(${settle})`, textShadow: `0 ${8 * u}px ${40 * u}px rgba(0,0,0,0.55), 0 0 ${60 * u}px ${tone === "gold" ? "rgba(232,176,74,0.28)" : "rgba(0,0,0,0)"}`,
          opacity: clamp01((t - countAt + 4) / 6) }}>
          {/* the final figure holds the width, so the line never jumps while it counts */}
          <span style={{ visibility: "hidden" }}>{figure}</span>
          <span style={{ position: "absolute", inset: 0, textAlign: "center" }}>{shown}</span>
        </div>
        {unitLine ? (
          <div style={{ display: "flex", alignItems: "center", gap: 22 * u, marginTop: 14 * u, opacity: uk, transform: `translateY(${(1 - uk) * 22 * u}px)` }}>
            <div style={{ width: 70 * u * uk, height: 2 * u, background: color, opacity: 0.8 }} />
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: fs(w, h, v ? 64 : 58), color: DOC.text, textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>{unitLine}</div>
            <div style={{ width: 70 * u * uk, height: 2 * u, background: color, opacity: 0.8 }} />
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ resale listing card

/** A price that flips over (top half falls away) from `from` to `to` at frame `at`. */
const FlipPrice: React.FC<{ from: string; to: string; t: number; at: number; size: number; color: string; toColor: string }> = ({ from, to, t, at, size, color, toColor }) => {
  const k = clamp01((t - at) / 10);
  const showNew = k >= 0.5;
  const rot = showNew ? -90 * (1 - (k - 0.5) * 2) : 90 * (k * 2);
  return (
    <div style={{ position: "relative", perspective: size * 8 }}>
      <span style={{ visibility: "hidden", fontFamily: SANS, fontWeight: 800, fontSize: size }}>{from.length > to.length ? from : to}</span>
      <div style={{ position: "absolute", left: 0, top: 0, fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: "inherit", color: showNew ? toColor : color,
        transform: `rotateX(${rot}deg)`, transformOrigin: "50% 55%", whiteSpace: "nowrap" }}>{showNew ? to : from}</div>
    </div>
  );
};

export const ListingCard: React.FC<{
  t: number; end: number; w: number; h: number;
  src?: string; aspect?: number; title: string; platform?: string; date?: string; seller?: string;
  was: string; now?: string; tag?: string; flipAt: number; tagAt: number; plate?: boolean;
}> = ({ t, end, w, h, src, aspect = 1, title, platform, date, seller, was, now, tag, flipAt, tagAt, plate = true }) => {
  const v = h > w;
  const u = unit(w, h);
  const cardW = v ? w * 0.74 : Math.min(h * 0.6, w * 0.34);
  const imgH = cardW * (v ? 0.86 : 0.78);
  const ik = outBack(t / 14);
  const drift = 1 + 0.03 * (t / Math.max(1, end));
  const flipped = now !== undefined && t >= flipAt + 5;
  const tk = tag ? clamp01((t - tagAt) / 7) : 0;
  const slam = tk > 0 ? 1 + 1.2 * Math.pow(1 - tk, 2) : 1;
  const shake = tk > 0 && tk < 1 ? 0 : t >= tagAt && t < tagAt + 9 ? Math.sin((t - tagAt) * 2.4) * 5 * u * (1 - (t - tagAt) / 9) : 0;
  const priceSize = fs(w, h, v ? 92 : 76);
  const meta = [platform, fmtDate(date)].filter(Boolean).join(" · ");
  return (
    <AbsoluteFill>
      {plate ? <Plate t={t} light={[0.5, v ? 0.42 : 0.45]} /> : null}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${drift}) translateX(${shake}px)`, marginTop: v ? -h * 0.07 : 0 }}>
        <div style={{ position: "relative", width: cardW, transform: `translateY(${(1 - ik) * 160 * u}px) rotate(${(1 - ik) * 6 - 1.5}deg)`, opacity: clamp01(t / 5) }}>
          <div style={{ background: "#ffffff", borderRadius: 34 * u, overflow: "hidden", boxShadow: `0 ${40 * u}px ${90 * u}px rgba(0,0,0,0.6), 0 0 0 ${2 * u}px rgba(255,255,255,0.08)` }}>
            <div style={{ position: "relative", height: imgH, background: "radial-gradient(ellipse 70% 70% at 50% 45%, #f6f4f0, #dedad2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {src ? <Img src={staticFile(src)} style={{ height: aspect >= 1 ? undefined : "84%", width: aspect >= 1 ? "78%" : undefined, objectFit: "contain", filter: "drop-shadow(0 18px 18px rgba(0,0,0,0.25))" }} /> : null}
              {meta ? <div style={{ position: "absolute", left: 22 * u, top: 22 * u, background: "rgba(20,22,28,0.85)", color: "#fff", fontFamily: SANS, fontWeight: 700,
                fontSize: fs(w, h, 26) * (v ? 1 : 0.9), letterSpacing: 3 * u, padding: `${6 * u}px ${16 * u}px`, borderRadius: 999, textTransform: "uppercase" }}>{meta}</div> : null}
            </div>
            <div style={{ padding: `${24 * u}px ${32 * u}px ${30 * u}px` }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fs(w, h, v ? 44 : 34), lineHeight: 1.2, color: "#1b1d22" }}>{title}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18 * u, marginTop: 10 * u, lineHeight: 1.1 }}>
                <FlipPrice from={was} to={now ?? was} t={t} at={now !== undefined ? flipAt : Infinity} size={priceSize} color="#1b1d22" toColor={DOC.red} />
                {flipped ? <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: priceSize * 0.5, color: "#8b8f98", textDecoration: "line-through", textDecorationThickness: 3 * u }}>{was}</span> : null}
              </div>
              {seller ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: fs(w, h, v ? 30 : 24), color: "#7a7f8a", marginTop: 8 * u }}>{seller}</div> : null}
            </div>
          </div>
          {tag && tk > 0 ? (
            <div style={{ position: "absolute", right: -34 * u, top: imgH * 0.5, transform: `rotate(-9deg) scale(${slam})`, opacity: clamp01(tk * 2),
              background: DOC.red, color: "#fff", fontFamily: DISPLAY, fontSize: fs(w, h, v ? 120 : 100), lineHeight: 1, padding: `${14 * u}px ${26 * u}px ${10 * u}px`,
              borderRadius: 10 * u, boxShadow: `0 ${16 * u}px ${36 * u}px rgba(0,0,0,0.5)`, letterSpacing: 1 * u }}>{tag}</div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ split-flap ticker

const DIGITS = "0123456789";
/** The characters a flap shows going from a to b: digits roll down through every digit in between. */
function flapSeq(a: string, b: string): string[] {
  if (a === b) return [a];
  const ia = DIGITS.indexOf(a), ib = DIGITS.indexOf(b);
  if (ia >= 0 && ib >= 0) {
    const out = [a];
    for (let d = ia; d !== ib;) { d = (d + 9) % 10; out.push(DIGITS[d]!); }
    return out;
  }
  return [a, b];
}

const Half: React.FC<{ ch: string; top: boolean; tileH: number; style?: React.CSSProperties }> = ({ ch, top, tileH, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: top ? 0 : "50%", height: "50%", overflow: "hidden",
    background: top ? "linear-gradient(180deg, #2c2f36, #1f2228)" : "linear-gradient(180deg, #1a1c21, #24272d)",
    borderRadius: top ? `${tileH * 0.08}px ${tileH * 0.08}px 0 0` : `0 0 ${tileH * 0.08}px ${tileH * 0.08}px`, backfaceVisibility: "hidden", ...style }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: top ? 0 : -tileH / 2, height: tileH, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: DISPLAY, fontSize: tileH * 0.74, color: "#f4efe3", lineHeight: 1, paddingTop: tileH * 0.02 }}>{ch === " " ? "" : ch}</div>
  </div>
);

const FlapTile: React.FC<{ seq: string[]; t: number; start: number; step: number; tileW: number; tileH: number }> = ({ seq, t, start, step, tileW: tw, tileH }) => {
  const tileW = seq.every((c) => /[.,]/.test(c)) ? tw * 0.42 : tw;
  const steps = seq.length - 1;
  const i = steps <= 0 ? 0 : Math.floor((t - start) / step);
  const settled = steps <= 0 || t < start || i >= steps;
  const cur = steps <= 0 ? seq[0]! : t < start ? seq[0]! : seq[Math.min(steps, i)]!;
  const k = settled ? 0 : ((t - start) % step) / step;
  const prev = seq[i] ?? cur, next = seq[i + 1] ?? cur;
  return (
    <div style={{ position: "relative", width: tileW, height: tileH, perspective: tileH * 4, boxShadow: `0 ${tileH * 0.06}px ${tileH * 0.12}px rgba(0,0,0,0.5)`, borderRadius: tileH * 0.08 }}>
      {settled ? (
        <>
          <Half ch={cur} top tileH={tileH} />
          <Half ch={cur} top={false} tileH={tileH} />
        </>
      ) : (
        <>
          <Half ch={next} top tileH={tileH} />
          <Half ch={prev} top={false} tileH={tileH} />
          {k < 0.5 ? <Half ch={prev} top tileH={tileH} style={{ transformOrigin: "50% 100%", transform: `rotateX(${-180 * k}deg)`, filter: `brightness(${1 - k})` }} />
            : <Half ch={next} top={false} tileH={tileH} style={{ transformOrigin: "50% 0%", transform: `rotateX(${90 * (1 - (k - 0.5) * 2)}deg)`, filter: `brightness(${0.5 + k * 0.5})` }} />}
        </>
      )}
      {/* the hinge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: Math.max(2, tileH * 0.012), marginTop: -tileH * 0.006, background: "#0a0b0e" }} />
    </div>
  );
};

export const Ticker: React.FC<{
  t: number; end: number; w: number; h: number;
  label: string; from: string; to: string; flipAt: number; tape?: string; tapeAt?: number; plate?: boolean;
}> = ({ t, end, w, h, label, from, to, flipAt, tape, tapeAt, plate = true }) => {
  const v = h > w;
  const u = unit(w, h);
  const n = Math.max(from.length, to.length);
  const a = from.padStart(n, " "), b = to.padStart(n, " ");
  const gap = 10 * u;
  const narrow = [...b].filter((c) => /[.,]/.test(c)).length;
  const tileW = Math.min(150 * u, ((v ? w * 0.74 : w * 0.6) - gap * (n - 1)) / (n - narrow * 0.58));
  const tileH = tileW * 1.5;
  const boardK = outCubic(t / 12);
  const drift = 1 + 0.03 * (t / Math.max(1, end));
  const done = t >= flipAt + 3 * 10 + n * 2;
  const tk = tape && tapeAt !== undefined ? clamp01((t - tapeAt) / 14) : 0;
  const typed = tape ? Math.floor(tape.length * tk) : 0;
  return (
    <AbsoluteFill>
      {plate ? <Plate t={t} /> : null}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${drift})`, marginTop: v ? -h * 0.08 : 0, paddingRight: v ? 50 * u : 0 }}>
        <div style={{ opacity: boardK, transform: `translateY(${(1 - boardK) * 40 * u}px)`, background: "linear-gradient(180deg, #121419, #0b0c10)", padding: `${30 * u}px ${34 * u}px ${36 * u}px`,
          borderRadius: 22 * u, boxShadow: `0 ${30 * u}px ${80 * u}px rgba(0,0,0,0.6), inset 0 ${2 * u}px 0 rgba(255,255,255,0.05)`, border: `${2 * u}px solid #2a2d34` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 * u }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs(w, h, 38), letterSpacing: 6 * u, color: DOC.gold }}>{label.toUpperCase()}</div>
            <div style={{ display: "flex", gap: 10 * u }}>
              {[0, 1, 2].map((i) => <div key={i} style={{ width: 14 * u, height: 14 * u, borderRadius: 99, background: i === 0 && done ? DOC.red : "#33363d",
                boxShadow: i === 0 && done ? `0 0 ${16 * u}px ${DOC.red}` : undefined }} />)}
            </div>
          </div>
          <div style={{ display: "flex", gap, alignItems: "center" }}>
            {[...b].map((ch, i) => <FlapTile key={i} seq={flapSeq(a[i]!, ch)} t={t} start={flipAt + i * 2} step={3} tileW={tileW} tileH={tileH} />)}
          </div>
        </div>
        {tape && tk > 0 ? (
          <div style={{ marginTop: 44 * u, transform: "rotate(-2.5deg)", background: "linear-gradient(180deg, #2a2a2e, #141416 60%, #232327)", padding: `${12 * u}px ${28 * u}px`,
            borderRadius: 6 * u, boxShadow: `0 ${10 * u}px ${24 * u}px rgba(0,0,0,0.45)` }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs(w, h, 56), letterSpacing: 6 * u, color: "#f4f1ea", textTransform: "uppercase",
              textShadow: `0 ${1 * u}px 0 rgba(0,0,0,0.9), 0 ${-1 * u}px 0 rgba(255,255,255,0.25)` }}>
              {tape.slice(0, typed)}<span style={{ opacity: 0 }}>{tape.slice(typed)}</span>
            </span>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ sinking bar with a ghost

export type SinkOther = { name: string; value: number; fig?: string };

export const SinkBar: React.FC<{
  t: number; end: number; w: number; h: number;
  name: string; before: number; after: number; beforeFig: string; afterFig: string; tag?: string;
  title?: string; sub?: string; others?: SinkOther[]; drawAt: number; sinkAt: number; color?: string; plate?: boolean;
}> = ({ t, end, w, h, name, before, after, beforeFig, afterFig, tag, title, sub, others = [], drawAt, sinkAt, color = DOC.gold, plate = true }) => {
  const v = h > w;
  const u = unit(w, h);
  const max = Math.max(before, after, ...others.map((o) => o.value), 1e-9);
  // vertical: the chart ends above a Short's caption band (64% height; QA v-20261125-31)
  const areaH = v ? h * 0.3 : h * 0.5;
  const areaTop = v ? h * 0.2 : h * 0.22;
  const barW = v ? Math.min(220, (w * 0.8) / (others.length + 1) - 40) : Math.min(220, (w * 0.5) / (others.length + 1) - 50);
  const gk = outCubic((t - drawAt) / 24);
  const sk = t < sinkAt ? 0 : (() => { const x = clamp01((t - sinkAt) / 26); return 1 - Math.pow(1 - x, 3) + Math.sin(x * Math.PI) * 0.06; })();
  const val = before * gk + (after - before) * sk;
  const hNow = (val / max) * areaH;
  const hOld = (before / max) * areaH;
  const ghostK = t >= sinkAt ? clamp01((t - sinkAt) / 6) : 0;
  const tagK = tag ? outBack((t - sinkAt - 18) / 10) : 0;
  const drift = 1 + 0.025 * (t / Math.max(1, end));
  const label = (txt: string, c: string, k = 1) => (
    <div style={{ position: "absolute", left: "50%", bottom: "100%", transform: `translate(-50%, ${-10 * u}px)`, fontFamily: DISPLAY, fontSize: fs(w, h, v ? 84 : 72), color: c, lineHeight: 1,
      whiteSpace: "nowrap", opacity: k, textShadow: "0 4px 16px rgba(0,0,0,0.6)" }}>{txt}</div>
  );
  return (
    <AbsoluteFill>
      {plate ? <Plate t={t} light={[0.5, 0.5]} /> : null}
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        {title ? (
          <div style={{ position: "absolute", left: v ? 70 : w * 0.08, top: v ? h * 0.09 : h * 0.1, right: v ? 150 : w * 0.08 }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fs(w, h, v ? 60 : 56), color: DOC.text, lineHeight: 1.1 }}>{title}</div>
            {sub ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: fs(w, h, v ? 44 : 38), color: DOC.muted, marginTop: 8 * u }}>{sub}</div> : null}
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: areaTop + areaH * 0.12, height: areaH, display: "flex", justifyContent: "center", alignItems: "flex-end",
          gap: v ? 60 * u : 90 * u }}>
          <div style={{ position: "relative", width: barW, height: areaH }}>
            {/* the ghost: a dashed outline where the bar used to reach */}
            {ghostK > 0 ? (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: hOld, border: `${4 * u}px dashed rgba(243,239,230,${0.55 * ghostK})`, borderRadius: `${8 * u}px ${8 * u}px 0 0`,
                boxSizing: "border-box" }}>
                {label(beforeFig, `rgba(243,239,230,${0.5 * ghostK})`)}
              </div>
            ) : null}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: Math.max(0, hNow), background: sk > 0 ? `linear-gradient(180deg, ${DOC.red}, #8f231c)` : `linear-gradient(180deg, ${color}, #a3741f)`,
              borderRadius: `${8 * u}px ${8 * u}px 0 0`, boxShadow: `0 0 ${40 * u}px rgba(0,0,0,0.4)` }}>
              {t >= sinkAt + 10 ? label(afterFig, "#ffffff") : ghostK > 0 ? null : label(beforeFig, DOC.text, clamp01((t - drawAt - 10) / 8))}
            </div>
            {tag && tagK > 0 ? (
              <div style={{ position: "absolute", right: barW + 22 * u, bottom: (hOld + hNow) / 2, transform: `translateY(50%) scale(${tagK}) rotate(-4deg)`, transformOrigin: "100% 50%",
                background: DOC.red, color: "#fff", fontFamily: DISPLAY, fontSize: fs(w, h, v ? 70 : 60), lineHeight: 1, padding: `${10 * u}px ${18 * u}px ${6 * u}px`, borderRadius: 8 * u,
                whiteSpace: "nowrap", boxShadow: `0 ${10 * u}px ${24 * u}px rgba(0,0,0,0.45)` }}>{tag}</div>
            ) : null}
            <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 18 * u, fontFamily: SANS, fontWeight: 700, fontSize: fs(w, h, v ? 44 : 38),
              color: DOC.text, textShadow: "0 3px 12px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>{name}</div>
          </div>
          {others.map((o, i) => {
            const ok = outCubic((t - drawAt - 6 - i * 5) / 22);
            return (
              <div key={i} style={{ position: "relative", width: barW, height: areaH }}>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: (o.value / max) * areaH * ok, background: "linear-gradient(180deg, #5d636e, #3a3f48)", borderRadius: `${8 * u}px ${8 * u}px 0 0` }}>
                  {o.fig ? label(o.fig, DOC.text, clamp01((t - drawAt - 16) / 8)) : null}
                </div>
                <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 18 * u, fontFamily: SANS, fontWeight: 700, fontSize: fs(w, h, v ? 44 : 38),
                  color: DOC.text, textShadow: "0 3px 12px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>{o.name}</div>
              </div>
            );
          })}
        </div>
        {/* the baseline */}
        <div style={{ position: "absolute", left: v ? 70 : w * 0.2, right: v ? 70 : w * 0.2, top: areaTop + areaH * 1.12, height: 3 * u, background: "rgba(243,239,230,0.35)" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ donut

export const Donut: React.FC<{
  t: number; end: number; w: number; h: number;
  values: number[]; figure?: string; label?: string; title?: string; sub?: string; legend?: string[]; fillAt: number; tone?: FigTone; plate?: boolean;
}> = ({ t, end, w, h, values, figure, label, title, sub, legend = [], fillAt, tone = "gold", plate = true }) => {
  const v = h > w;
  const u = unit(w, h);
  const total = values.reduce((a, b) => a + Math.max(0, b), 0) || 1;
  const fk = smooth((t - fillAt) / 40);
  const R = v ? w * 0.3 : h * 0.23;
  const sw = R * 0.3;
  const C = 2 * Math.PI * R;
  const drift = 1 + 0.025 * (t / Math.max(1, end));
  const fig = figure ? countText(figure, clamp01((t - fillAt) / 40)) : "";
  const colors = [TONE[tone], "#6b717d", "#4a4f59", "#3a3e46", "#2e3138"];
  let acc = 0;
  const cx = R + sw, size = 2 * (R + sw);
  return (
    <AbsoluteFill>
      {plate ? <Plate t={t} /> : null}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${drift})`, marginTop: v ? -h * 0.08 : 0 }}>
        {title ? (
          <div style={{ textAlign: "center", marginBottom: 40 * u, opacity: outCubic(t / 10) }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fs(w, h, v ? 60 : 54), color: DOC.text }}>{title}</div>
            {sub ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: fs(w, h, v ? 44 : 36), color: DOC.muted, marginTop: 6 * u }}>{sub}</div> : null}
          </div>
        ) : null}
        <div style={{ position: "relative", width: size, height: size }}>
          <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)", overflow: "visible" }}>
            <circle cx={cx} cy={cx} r={R} fill="none" stroke="#1d2027" strokeWidth={sw} />
            {values.map((val, i) => {
              const frac = Math.max(0, val) / total;
              // the first share fills first, the rest follow after it
              const kk = i === 0 ? fk : smooth((t - fillAt - 20 - i * 4) / 30);
              const seg = C * frac * kk;
              const off = -C * acc;
              acc += frac;
              return <circle key={i} cx={cx} cy={cx} r={R} fill="none" stroke={colors[Math.min(i, colors.length - 1)]} strokeWidth={i === 0 ? sw * 1.08 : sw * 0.92}
                strokeDasharray={`${Math.max(0, seg - (i === 0 ? 0 : 4 * u))} ${C}`} strokeDashoffset={off} style={i === 0 ? { filter: `drop-shadow(0 0 ${18 * u}px rgba(232,176,74,0.35))` } : undefined} />;
            })}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {figure ? (
              <div style={{ position: "relative", fontFamily: DISPLAY, fontSize: fitAnton(figure, R * 0.62, R * 1.3), lineHeight: 1, color: TONE[tone], fontVariantNumeric: "tabular-nums" }}>
                <span style={{ visibility: "hidden" }}>{figure}</span>
                <span style={{ position: "absolute", inset: 0, textAlign: "center" }}>{fig}</span>
              </div>
            ) : null}
            {label ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: fs(w, h, v ? 46 : 38), color: DOC.text, marginTop: 6 * u, maxWidth: R * 1.3, textAlign: "center", lineHeight: 1.15 }}>{label}</div> : null}
          </div>
        </div>
        {legend.length ? (
          <div style={{ display: "flex", gap: 36 * u, marginTop: 40 * u, flexWrap: "wrap", justifyContent: "center", maxWidth: w * 0.84 }}>
            {legend.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 * u, opacity: clamp01((t - fillAt - 10 - i * 6) / 10) }}>
                <div style={{ width: 22 * u, height: 22 * u, borderRadius: 4 * u, background: colors[Math.min(i, colors.length - 1)] }} />
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fs(w, h, v ? 40 : 32), color: i === 0 ? DOC.text : DOC.muted }}>{l}</div>
              </div>
            ))}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
