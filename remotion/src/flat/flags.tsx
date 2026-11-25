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
 * `cover` fills a box (a country) with the flag at its own 3:2 shape, centred, never stretched.
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

/** The Union Jack in a box (the UK, and Australia's canton). */
const union: Draw = ({ x, y, w, h: hh }) => {
  const t = hh * 0.2, s = hh * 0.12, id = `u${Math.round(x)}${Math.round(y)}${Math.round(w)}`;
  return (
    <g>
      <defs><clipPath id={id}><rect x={x} y={y} width={w} height={hh} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={hh} fill="#012169" />
        <path d={`M${x},${y} L${x + w},${y + hh} M${x + w},${y} L${x},${y + hh}`} stroke={W} strokeWidth={s * 1.6} />
        <path d={`M${x},${y} L${x + w},${y + hh} M${x + w},${y} L${x},${y + hh}`} stroke="#c8102e" strokeWidth={s * 0.55} />
        <rect x={x} y={y + hh / 2 - t * 0.85} width={w} height={t * 1.7} fill={W} />
        <rect x={x + w / 2 - t * 0.85} y={y} width={t * 1.7} height={hh} fill={W} />
        <rect x={x} y={y + hh / 2 - t / 2} width={w} height={t} fill="#c8102e" />
        <rect x={x + w / 2 - t / 2} y={y} width={t} height={hh} fill="#c8102e" />
      </g>
    </g>
  );
};

/** Canada's maple leaf, simplified, centred at (cx, cy), `size` tall. */
const LEAF: [number, number][] = [[0, -50], [8, -35], [17, -38], [13, -14], [27, -28], [30, -20], [45, -24], [40, -8], [47, -4], [25, 14], [28, 24], [4, 20], [3, 45],
  [-3, 45], [-4, 20], [-28, 24], [-25, 14], [-47, -4], [-40, -8], [-45, -24], [-30, -20], [-27, -28], [-13, -14], [-17, -38], [-8, -35]];
const leaf = (cx: number, cy: number, size: number, fill: string) => (
  <polygon points={LEAF.map(([a, b]) => `${(cx + (a * size) / 95).toFixed(1)},${(cy + (b * size) / 95).toFixed(1)}`).join(" ")} fill={fill} />
);

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
  Portugal: both(v(["#006600", "#ff0000"], [2, 3]), ({ x, y, w, h: hh }) => (
    <g>
      <circle cx={x + w * 0.4} cy={y + hh / 2} r={hh * 0.2} fill="none" stroke="#ffe900" strokeWidth={hh * 0.04} />
      <rect x={x + w * 0.4 - hh * 0.09} y={y + hh / 2 - hh * 0.11} width={hh * 0.18} height={hh * 0.2} rx={hh * 0.05} fill={W} stroke="#ff0000" strokeWidth={hh * 0.03} />
    </g>
  )),
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
  "United Kingdom": union,
  "United States of America": ({ x, y, w, h: hh }) => {
    const sh = hh / 13, cw = w * 0.4, ch = sh * 7;
    return (
      <g>
        {Array.from({ length: 13 }, (_, i) => <rect key={i} x={x} y={y + i * sh} width={w} height={sh + 0.5} fill={i % 2 ? W : "#b22234"} />)}
        <rect x={x} y={y} width={cw} height={ch} fill="#3c3b6e" />
        {Array.from({ length: 9 }, (_, r) => Array.from({ length: r % 2 ? 5 : 6 }, (_, c) =>
          star(x + (cw * (2 * c + (r % 2 ? 2 : 1))) / 12, y + (ch * (r + 1)) / 10, ch * 0.045, W, `s${r}-${c}`)))}
      </g>
    );
  },
  Canada: both(v(["#d80621", W, "#d80621"], [1, 2, 1]), ({ x, y, w, h: hh }) => leaf(x + w / 2, y + hh / 2, hh * 0.62, "#d80621")),
  Japan: disc(W, "#bc002d"),
  Bangladesh: disc("#006a4e", "#f42a41", 0.05),
  // Nepal, Bhutan and Myanmar added for v-20261125-62 (India's land borders), simplified like the rest
  Nepal: ({ x, y, w, h: hh }) => {
    const sw = hh * 0.06;
    const d = `M ${x + sw} ${y + sw} L ${x + w * 0.78} ${y + hh * 0.47} L ${x + w * 0.34} ${y + hh * 0.47} L ${x + w * 0.82} ${y + hh - sw} L ${x + sw} ${y + hh - sw} Z`;
    return (
      <g>
        <path d={d} fill="#dc143c" stroke="#003893" strokeWidth={sw} strokeLinejoin="miter" />
        <path d={`M ${x + w * 0.1} ${y + hh * 0.3} A ${hh * 0.11} ${hh * 0.11} 0 0 0 ${x + w * 0.32} ${y + hh * 0.3} A ${hh * 0.09} ${hh * 0.07} 0 0 1 ${x + w * 0.1} ${y + hh * 0.3} Z`} fill={W} />
        <circle cx={x + w * 0.21} cy={y + hh * 0.36} r={hh * 0.045} fill={W} />
        {star(x + w * 0.22, y + hh * 0.74, hh * 0.11, W, "np")}
        <circle cx={x + w * 0.22} cy={y + hh * 0.74} r={hh * 0.065} fill={W} />
      </g>
    );
  },
  Bhutan: ({ x, y, w, h: hh }) => (
    <g>
      <path d={`M ${x} ${y} L ${x + w} ${y} L ${x} ${y + hh} Z`} fill="#ffd520" />
      <path d={`M ${x + w} ${y} L ${x + w} ${y + hh} L ${x} ${y + hh} Z`} fill="#ff4e12" />
      <path d={`M ${x + w * 0.2} ${y + hh * 0.78} C ${x + w * 0.35} ${y + hh * 0.5}, ${x + w * 0.45} ${y + hh * 0.75}, ${x + w * 0.55} ${y + hh * 0.48} S ${x + w * 0.72} ${y + hh * 0.3}, ${x + w * 0.8} ${y + hh * 0.24}`}
        fill="none" stroke={W} strokeWidth={hh * 0.13} strokeLinecap="round" />
      <circle cx={x + w * 0.8} cy={y + hh * 0.24} r={hh * 0.09} fill={W} />
      {[0.32, 0.47, 0.62].map((k, i) => <circle key={i} cx={x + w * k} cy={y + hh * (0.62 - (k - 0.32) * 0.9) + hh * 0.1} r={hh * 0.05} fill={W} />)}
    </g>
  ),
  Myanmar: both(h(["#fecb00", "#34b233", "#ea2839"]), ({ x, y, w, h: hh }) => star(x + w / 2, y + hh * 0.55, hh * 0.42, W, "mm")),
  India: both(h(["#ff9933", W, "#138808"]), ({ x, y, w, h: hh }) => {
    const cx = x + w / 2, cy = y + hh / 2, r = hh * 0.13, sw = Math.max(1.5, hh * 0.018);
    return (
      <g stroke="#000080" strokeWidth={sw}>
        <circle cx={cx} cy={cy} r={r} fill="none" />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos((i * Math.PI) / 12)} y2={cy + r * Math.sin((i * Math.PI) / 12)} strokeWidth={sw * 0.5} />)}
        <circle cx={cx} cy={cy} r={r * 0.18} fill="#000080" />
      </g>
    );
  }),
  China: both(h(["#ee1c25"]), ({ x, y, w, h: hh }) => (
    <g>
      {star(x + w * (5 / 30), y + hh * (5 / 20), hh * 0.15, "#ffde00")}
      {([[10, 2], [12, 4], [12, 7], [10, 9]] as const).map(([a, b], i) => star(x + w * (a / 30), y + hh * (b / 20), hh * 0.05, "#ffde00", i))}
    </g>
  )),
  Vietnam: both(h(["#da251d"]), ({ x, y, w, h: hh }) => star(x + w / 2, y + hh / 2, hh * 0.32, "#ffff00")),
  Egypt: both(h(["#ce1126", W, K]), ({ x, y, w, h: hh }) => {
    const cx = x + w / 2, cy = y + hh / 2, s = hh * 0.12;   // the eagle of Saladin, as a gold shield and wings
    return <path d={`M${cx - s * 1.4},${cy - s * 0.5} L${cx - s * 0.5},${cy - s * 0.2} L${cx},${cy - s} L${cx + s * 0.5},${cy - s * 0.2} L${cx + s * 1.4},${cy - s * 0.5} L${cx + s * 0.5},${cy + s * 0.9} L${cx - s * 0.5},${cy + s * 0.9} Z`} fill="#c09300" />;
  }),
  Yemen: h(["#ce1126", W, K]),
  Sudan: both(h(["#d21034", W, K]), ({ x, y, w, h: hh }) => <polygon points={`${x},${y} ${x + w * 0.33},${y + hh / 2} ${x},${y + hh}`} fill="#007229" />),
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
        {/* the four trigrams, three bars each, on the diagonals */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => {
          const d = hh * 0.36, bx = cx + sx! * d * 1.2, by = cy + sy! * d * 0.8, ang = (Math.atan2(sy!, sx! * 1.5) * 180) / Math.PI + 90;
          return (
            <g key={i} transform={`translate(${bx} ${by}) rotate(${ang})`}>
              {[-1, 0, 1].map((k) => <rect key={k} x={-hh * 0.12} y={k * hh * 0.045 - hh * 0.015} width={hh * 0.24} height={hh * 0.03} fill={K} />)}
            </g>
          );
        })}
      </g>
    );
  }),
  Australia: both(h(["#012169"]), ({ x, y, w, h: hh }) => union({ x, y, w: w / 2, h: hh / 2 }), ({ x, y, w, h: hh }) => (
    <g>
      {star(x + w * 0.25, y + hh * 0.75, hh * 0.13, W)}
      {star(x + w * 0.75, y + hh * 0.25, hh * 0.06, W)}
      {star(x + w * 0.65, y + hh * 0.5, hh * 0.06, W)}
      {star(x + w * 0.85, y + hh * 0.45, hh * 0.06, W)}
      {star(x + w * 0.75, y + hh * 0.8, hh * 0.06, W)}
    </g>
  )),
  Mexico: both(v(["#006847", W, "#ce1126"]), ({ x, y, w, h: hh }) => <circle cx={x + w / 2} cy={y + hh / 2} r={hh * 0.1} fill="#8c5a2b" />),
  Argentina: both(h(["#74acdf", W, "#74acdf"]), ({ x, y, w, h: hh }) => <circle cx={x + w / 2} cy={y + hh / 2} r={hh * 0.09} fill="#f6b40e" />),
  // South Africa (for v-20261124-11): red over blue, the white-edged green Y from the hoist, the yellow-edged
  // black triangle in its fork; drawn on a 9:6 grid inside a nested svg, which clips the arms to the box
  "South Africa": ({ x, y, w, h: hh }) => (
    <svg x={x} y={y} width={w} height={hh} viewBox="0 0 9 6" preserveAspectRatio="none">
      <rect x={0} y={0} width={9} height={3} fill="#e03c31" />
      <rect x={0} y={3} width={9} height={3} fill="#001489" />
      <path d="M0,0 L4.5,3 L0,6 M4.5,3 H9" fill="none" stroke={W} strokeWidth={2} />
      <path d="M0,0 L4.5,3 L0,6 M4.5,3 H9" fill="none" stroke="#007749" strokeWidth={1.2} />
      <path d="M0,0.72 L3.41,3 L0,5.28 Z" fill="#ffb81c" />
      <path d="M0,1.5 L2.25,3 L0,4.5 Z" fill={K} />
    </svg>
  ),
  // Lesotho: blue, white and green bands (3:4:3) with the black mokorotlo hat in the middle
  Lesotho: both(h(["#00209f", W, "#009543"], [3, 4, 3]), ({ x, y, w, h: hh }) => {
    const cx = x + w / 2, cy = y + hh / 2, s = hh * 0.3;
    return (
      <g fill={K}>
        <path d={`M${cx - s * 0.62},${cy + s * 0.42} Q${cx},${cy + s * 0.62} ${cx + s * 0.62},${cy + s * 0.42} L${cx + s * 0.12},${cy - s * 0.38} L${cx - s * 0.12},${cy - s * 0.38} Z`} />
        <rect x={cx - s * 0.08} y={cy - s * 0.6} width={s * 0.16} height={s * 0.26} />
        <circle cx={cx} cy={cy - s * 0.62} r={s * 0.1} />
      </g>
    );
  }),
  // Panama (for v-20261124-12): quartered, white with a blue star, red; blue, white with a red star
  Panama: ({ x, y, w, h: hh }) => (
    <g>
      <rect x={x} y={y} width={w} height={hh} fill={W} />
      <rect x={x + w / 2} y={y} width={w / 2} height={hh / 2} fill="#da121a" />
      <rect x={x} y={y + hh / 2} width={w / 2} height={hh / 2} fill="#072357" />
      {star(x + w / 4, y + hh / 4, hh * 0.13, "#072357")}
      {star(x + (w * 3) / 4, y + (hh * 3) / 4, hh * 0.13, "#da121a")}
    </g>
  ),
  // Ethiopia (for v-20261125-12): green, yellow, red, the blue disc with a yellow star in the middle
  Ethiopia: both(h(["#078930", "#fcdd09", "#da121a"]), ({ x, y, w, h: hh }) => (
    <g>
      <circle cx={x + w / 2} cy={y + hh / 2} r={hh * 0.26} fill="#0f47af" />
      {star(x + w / 2, y + hh / 2, hh * 0.17, "#fcdd09")}
    </g>
  )),
  // Somalia: light blue with a white star
  Somalia: ({ x, y, w, h: hh }) => (
    <g>
      <rect x={x} y={y} width={w} height={hh} fill="#4189dd" />
      {star(x + w / 2, y + hh / 2, hh * 0.24, W)}
    </g>
  ),
  // Kenya: black, red, green with white edges and a red-and-black shield (simplified)
  Kenya: both(h([K, W, "#bb0000", W, "#006600"], [6, 1, 6, 1, 6]), ({ x, y, w, h: hh }) => (
    <g>
      <ellipse cx={x + w / 2} cy={y + hh / 2} rx={hh * 0.13} ry={hh * 0.36} fill="#bb0000" stroke={K} strokeWidth={Math.max(1, hh * 0.03)} />
      <ellipse cx={x + w / 2} cy={y + hh / 2} rx={hh * 0.04} ry={hh * 0.2} fill={W} />
    </g>
  )),
  // Tanzania: green over blue split by a yellow-edged black band from bottom-left to top-right
  Tanzania: ({ x, y, w, h: hh }) => (
    <g>
      <polygon points={`${x},${y} ${x + w},${y} ${x},${y + hh}`} fill="#1eb53a" />
      <polygon points={`${x + w},${y} ${x + w},${y + hh} ${x},${y + hh}`} fill="#00a3dd" />
      <line x1={x} y1={y + hh} x2={x + w} y2={y} stroke="#fcd116" strokeWidth={hh * 0.42} />
      <line x1={x} y1={y + hh} x2={x + w} y2={y} stroke={K} strokeWidth={hh * 0.3} />
    </g>
  ),
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
export const FlagArt: React.FC<{ name: string; x?: number; y?: number; w: number; h: number; opacity?: number; cover?: boolean }> = ({ name, x = 0, y = 0, w, h: hh, opacity = 1, cover = false }) => {
  const d = FLAGS[name];
  if (!d) return null;
  if (!cover) return <g opacity={opacity}>{d({ x, y, w, h: hh })}</g>;
  // cover a box (a country's outline) at the flag's own 3:2 shape, centred, never stretched. A tall, thin
  // country (Chile) gets the flag turned a quarter so its long side runs along the country, as map videos
  // do; otherwise only one stripe would show
  const tall = w / hh < 0.6;
  const [bw, bh] = tall ? [hh, w] : [w, hh];
  // a very long country (Chile, Gambia) takes the flag stretched along it, so every stripe shows; others keep 3:2
  const long = bw / bh > 3;
  const fw = long ? bw : bw / bh > RATIO ? bw : bh * RATIO, fh = long ? bh : fw / RATIO;
  const cx = x + w / 2, cy = y + hh / 2;
  return (
    <g opacity={opacity} transform={tall ? `rotate(-90 ${cx} ${cy})` : undefined}>
      {d({ x: cx - fw / 2, y: cy - fh / 2, w: fw, h: fh })}
    </g>
  );
};

/** Flags are drawn 3:2 (most national flags are 3:2 or near it). */
export const RATIO = 1.5;

/** Every country the table can draw. */
export const FLAG_NAMES: string[] = Object.keys(FLAGS);
