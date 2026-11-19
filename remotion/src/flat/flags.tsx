/**
 * National flags drawn in code (geography channel, owner 2026-11-19: "when talking about a country we can
 * cover the map of country with flag rather than color… test both"). Flat shapes only, in the house style;
 * each flag is a pure function of a box. Simplified (no coats of arms or fine emblems): stripes, crosses,
 * discs, stars and a canton, enough to read at phone size. A country not in the table has no flag (`null`),
 * and the map falls back to its colour.
 *
 *   <FlagArt name="Denmark" x y w h />   a flag filling a box (a planted flag, a sign, a country's fill)
 *   hasFlag("Denmark")                   whether the table has it
 *
 * Names are Natural Earth's (the map's own: "United States of America", "Faeroe Is.").
 */
import React from "react";

type Box = { x: number; y: number; w: number; h: number };
type Draw = (b: Box) => React.ReactNode;

const R = "#c8102e", W = "#ffffff", B = "#0b3a8c", G = "#11804a", Y = "#ffcd00", K = "#111111", O = "#ff8f1c";

/** Stripes across (top to bottom), equal unless `parts` weights them. */
const h = (colors: string[], parts?: number[]): Draw => ({ x, y, w, h: hh }) => {
  const ps = parts ?? colors.map(() => 1);
  const total = ps.reduce((a, b) => a + b, 0);
  let at = y;
  return colors.map((c, i) => {
    const sh = (hh * ps[i]!) / total;
    const r = <rect key={i} x={x} y={at} width={w} height={sh + 0.5} fill={c} />;
    at += sh;
    return r;
  });
};
/** Stripes down (left to right). */
const v = (colors: string[], parts?: number[]): Draw => ({ x, y, w, h: hh }) => {
  const ps = parts ?? colors.map(() => 1);
  const total = ps.reduce((a, b) => a + b, 0);
  let at = x;
  return colors.map((c, i) => {
    const sw = (w * ps[i]!) / total;
    const r = <rect key={i} x={at} y={y} width={sw + 0.5} height={hh} fill={c} />;
    at += sw;
    return r;
  });
};
/** A Nordic cross: the upright set towards the hoist; `inner` draws a second, narrower cross (Norway, Iceland). */
const nordic = (bg: string, cross: string, inner?: string): Draw => ({ x, y, w, h: hh }) => {
  const t = hh * 0.22, cx = x + w * 0.36, cy = y + hh / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={hh} fill={bg} />
      <rect x={x} y={cy - t / 2} width={w} height={t} fill={cross} />
      <rect x={cx - t / 2} y={y} width={t} height={hh} fill={cross} />
      {inner ? <rect x={x} y={cy - t / 4} width={w} height={t / 2} fill={inner} /> : null}
      {inner ? <rect x={cx - t / 4} y={y} width={t / 2} height={hh} fill={inner} /> : null}
    </g>
  );
};
/** A disc on a field (Japan, Bangladesh); `dx` moves it towards the hoist. */
const disc = (bg: string, c: string, dx = 0): Draw => ({ x, y, w, h: hh }) => (
  <g>
    <rect x={x} y={y} width={w} height={hh} fill={bg} />
    <circle cx={x + w * (0.5 - dx)} cy={y + hh / 2} r={Math.min(w, hh) * 0.3} fill={c} />
  </g>
);
/** A five-pointed star centred at (cx, cy). */
const star = (cx: number, cy: number, r: number, fill: string, key?: string | number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.4 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return <polygon key={key} points={pts} fill={fill} />;
};
const both = (...ds: Draw[]): Draw => (b) => ds.map((d, i) => <g key={i}>{d(b)}</g>);

const FLAGS: Record<string, Draw> = {
  Denmark: nordic(R, W),
  Norway: nordic("#ba0c2f", W, "#00205b"),
  Sweden: nordic("#006aa7", "#fecc00"),
  Finland: nordic(W, "#002f6c"),
  Iceland: nordic("#02529c", W, "#dc1e35"),
  "Faeroe Is.": nordic(W, "#0065bd", "#ef303e"),
  Greenland: ({ x, y, w, h: hh }) => {
    const r = hh * 0.33, cx = x + w * 0.37, cy = y + hh / 2;
    return (
      <g>
        <rect x={x} y={y} width={w} height={hh / 2} fill={W} />
        <rect x={x} y={cy} width={w} height={hh / 2} fill={R} />
        <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy} Z`} fill={R} />
        <path d={`M${cx - r},${cy} A${r},${r} 0 0 0 ${cx + r},${cy} Z`} fill={W} />
      </g>
    );
  },
  Germany: h([K, "#dd0000", "#ffce00"]),
  France: v(["#002395", W, "#ed2939"]),
  Italy: v(["#009246", W, "#ce2b37"]),
  Ireland: v(["#169b62", W, O]),
  Belgium: v([K, "#fdda24", "#ef3340"]),
  Netherlands: h(["#ae1c28", W, "#21468b"]),
  Luxembourg: h(["#ed2939", W, "#00a1de"]),
  Austria: h(["#ed2939", W, "#ed2939"]),
  Hungary: h(["#ce2939", W, "#477050"]),
  Poland: h([W, "#dc143c"]),
  Ukraine: h(["#0057b7", "#ffd700"]),
  Russia: h([W, "#0039a6", "#d52b1e"]),
  Estonia: h(["#0072ce", K, W]),
  Lithuania: h(["#fdb913", "#006a44", "#c1272d"]),
  Latvia: h(["#9e3039", W, "#9e3039"], [2, 1, 2]),
  Spain: h(["#aa151b", "#f1bf00", "#aa151b"], [1, 2, 1]),
  Portugal: v(["#006600", "#ff0000"], [2, 3]),
  Switzerland: ({ x, y, w, h: hh }) => {
    const s = Math.min(w, hh), a = s * 0.2, l = s * 0.62, cx = x + w / 2, cy = y + hh / 2;
    return (
      <g>
        <rect x={x} y={y} width={w} height={hh} fill="#da291c" />
        <rect x={cx - a / 2} y={cy - l / 2} width={a} height={l} fill={W} />
        <rect x={cx - l / 2} y={cy - a / 2} width={l} height={a} fill={W} />
      </g>
    );
  },
  "United Kingdom": ({ x, y, w, h: hh }) => {
    const t = hh * 0.2, s = hh * 0.12;
    return (
      <g>
        <rect x={x} y={y} width={w} height={hh} fill="#012169" />
        <path d={`M${x},${y} L${x + w},${y + hh} M${x + w},${y} L${x},${y + hh}`} stroke={W} strokeWidth={s * 1.6} />
        <path d={`M${x},${y} L${x + w},${y + hh} M${x + w},${y} L${x},${y + hh}`} stroke="#c8102e" strokeWidth={s * 0.55} />
        <rect x={x} y={y + hh / 2 - t * 0.85} width={w} height={t * 1.7} fill={W} />
        <rect x={x + w / 2 - t * 0.85} y={y} width={t * 1.7} height={hh} fill={W} />
        <rect x={x} y={y + hh / 2 - t / 2} width={w} height={t} fill="#c8102e" />
        <rect x={x + w / 2 - t / 2} y={y} width={t} height={hh} fill="#c8102e" />
      </g>
    );
  },
  "United States of America": ({ x, y, w, h: hh }) => {
    const sh = hh / 13, cw = w * 0.4, ch = sh * 7;
    return (
      <g>
        {Array.from({ length: 13 }, (_, i) => <rect key={i} x={x} y={y + i * sh} width={w} height={sh + 0.5} fill={i % 2 ? W : "#b22234"} />)}
        <rect x={x} y={y} width={cw} height={ch} fill="#3c3b6e" />
        {Array.from({ length: 12 }, (_, i) => star(x + cw * (0.14 + (i % 4) * 0.24), y + ch * (0.2 + Math.floor(i / 4) * 0.3), ch * 0.1, W, `s${i}`))}
      </g>
    );
  },
  Canada: both(v(["#d80621", W, "#d80621"], [1, 2, 1]), ({ x, y, w, h: hh }) => star(x + w / 2, y + hh / 2, hh * 0.3, "#d80621")),
  Japan: disc(W, "#bc002d"),
  Bangladesh: disc("#006a4e", "#f42a41", 0.05),
  India: both(h(["#ff9933", W, "#138808"]), ({ x, y, w, h: hh }) => (
    <circle cx={x + w / 2} cy={y + hh / 2} r={hh * 0.12} fill="none" stroke="#000080" strokeWidth={Math.max(2, hh * 0.025)} />
  )),
  China: both(h(["#ee1c25"]), ({ x, y, h: hh }) => star(x + hh * 0.3, y + hh * 0.3, hh * 0.18, "#ffff00")),
  Vietnam: both(h(["#da251d"]), ({ x, y, w, h: hh }) => star(x + w / 2, y + hh / 2, hh * 0.32, "#ffff00")),
  Egypt: h(["#ce1126", W, K]),
  Yemen: h(["#ce1126", W, K]),
  Sudan: h(["#d21034", W, K]),
  Chad: v(["#002664", "#fecb00", "#c60c30"]),
  Mali: v(["#14b53a", "#fcd116", "#ce1126"]),
  Niger: both(h([O, W, G]), ({ x, y, w, h: hh }) => <circle cx={x + w / 2} cy={y + hh / 2} r={hh * 0.12} fill={O} />),
  Nigeria: v([G, W, G]),
  "Côte d'Ivoire": v([O, W, "#009e60"]),
  Guinea: v(["#ce1126", "#fcd116", "#009460"]),
  Senegal: both(v(["#00853f", "#fdef42", "#e31b23"]), ({ x, y, w, h: hh }) => star(x + w / 2, y + hh / 2, hh * 0.16, "#00853f")),
  Gambia: h(["#ce1126", W, "#0c1c8c", W, "#3a7728"], [6, 1, 4, 1, 6]),
  "Sierra Leone": h(["#1eb53a", W, "#0072c6"]),
  Gabon: h(["#009e60", "#fcd116", "#3a75c4"]),
  Mauritius: h(["#ea2839", "#1a206d", "#ffd500", "#00a551"]),
  Indonesia: h(["#ce1126", W]),
  Monaco: h(["#ce1126", W]),
  Thailand: h(["#a51931", W, "#2d2a4a", W, "#a51931"], [1, 1, 2, 1, 1]),
  Colombia: h(["#fcd116", "#003893", "#ce1126"], [2, 1, 1]),
  Armenia: h(["#d90012", "#0033a0", "#f2a800"]),
  Bolivia: h(["#d52b1e", "#f9e300", "#007934"]),
  Peru: v(["#d91023", W, "#d91023"]),
  Romania: v(["#002b7f", "#fcd116", "#ce1126"]),
  Bulgaria: h([W, "#00966e", "#d62612"]),
  Brazil: ({ x, y, w, h: hh }) => (
    <g>
      <rect x={x} y={y} width={w} height={hh} fill="#009c3b" />
      <polygon points={`${x + w * 0.08},${y + hh / 2} ${x + w / 2},${y + hh * 0.1} ${x + w * 0.92},${y + hh / 2} ${x + w / 2},${y + hh * 0.9}`} fill="#ffdf00" />
      <circle cx={x + w / 2} cy={y + hh / 2} r={hh * 0.21} fill="#002776" />
    </g>
  ),
  Turkey: both(h(["#e30a17"]), ({ x, y, h: hh }) => (
    <g>
      <circle cx={x + hh * 0.5} cy={y + hh / 2} r={hh * 0.25} fill={W} />
      <circle cx={x + hh * 0.56} cy={y + hh / 2} r={hh * 0.2} fill="#e30a17" />
      {star(x + hh * 0.85, y + hh / 2, hh * 0.12, W)}
    </g>
  )),
  Pakistan: both(v([W, "#01411c"], [1, 3]), ({ x, y, w, h: hh }) => (
    <g>
      <circle cx={x + w * 0.62} cy={y + hh / 2} r={hh * 0.27} fill={W} />
      <circle cx={x + w * 0.66} cy={y + hh * 0.46} r={hh * 0.23} fill="#01411c" />
      {star(x + w * 0.72, y + hh * 0.36, hh * 0.08, W)}
    </g>
  )),
  "South Korea": both(h([W]), ({ x, y, w, h: hh }) => {
    const r = hh * 0.25, cx = x + w / 2, cy = y + hh / 2;
    return (
      <g>
        <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy} Z`} fill="#cd2e3a" />
        <path d={`M${cx - r},${cy} A${r},${r} 0 0 0 ${cx + r},${cy} Z`} fill="#0047a0" />
      </g>
    );
  }),
  Australia: both(h(["#012169"]), ({ x, y, w, h: hh }) => (
    <g>
      {star(x + w * 0.25, y + hh * 0.72, hh * 0.13, W)}
      {star(x + w * 0.75, y + hh * 0.25, hh * 0.06, W)}
      {star(x + w * 0.65, y + hh * 0.5, hh * 0.06, W)}
      {star(x + w * 0.85, y + hh * 0.45, hh * 0.06, W)}
      {star(x + w * 0.75, y + hh * 0.8, hh * 0.06, W)}
    </g>
  )),
  Mexico: both(v(["#006847", W, "#ce1126"]), ({ x, y, w, h: hh }) => <circle cx={x + w / 2} cy={y + hh / 2} r={hh * 0.1} fill="#8c5a2b" />),
  Argentina: both(h(["#74acdf", W, "#74acdf"]), ({ x, y, w, h: hh }) => <circle cx={x + w / 2} cy={y + hh / 2} r={hh * 0.09} fill="#f6b40e" />),
  Chile: ({ x, y, w, h: hh }) => (
    <g>
      <rect x={x} y={y} width={w} height={hh / 2} fill={W} />
      <rect x={x} y={y + hh / 2} width={w} height={hh / 2} fill="#d52b1e" />
      <rect x={x} y={y} width={w / 3} height={hh / 2} fill="#0039a6" />
      {star(x + w / 6, y + hh / 4, hh * 0.13, W)}
    </g>
  ),
};

/** Whether the table can draw this country's flag. */
export const hasFlag = (name: string): boolean => !!FLAGS[name];

/** A country's flag filling a box (stretched to it). Nothing for a country the table doesn't have. */
export const FlagArt: React.FC<{ name: string; x?: number; y?: number; w: number; h: number; opacity?: number }> = ({ name, x = 0, y = 0, w, h: hh, opacity = 1 }) => {
  const d = FLAGS[name];
  if (!d) return null;
  return <g opacity={opacity}>{d({ x, y, w, h: hh })}</g>;
};
