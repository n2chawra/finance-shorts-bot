// Shared pieces for "What is Australia's 5,614 km fence keeping out?" (device: route and race). The channel's
// vintage map of Australia with the Dingo Fence drawn across it (simplified line): a patrol truck drives it end
// to end while an odometer counts, then the two sides tint: dingo country north-west, sheep country south-east.
import React, { useId } from "react";
import { Ball, Block, Display, Glow, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";
import { FlagArt } from "../../flat/flags";
import { MapLabel, WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";

export type LL = [number, number];

export const RED = "#d9662f", GREEN = "#7fae4a", WIRE = "#5a4330", GOLD = "#f2b134", DINGO = "#d98a3d", SEA = "#5f9fae";

/** The Dingo Fence, simplified: the Great Australian Bight cliffs, north through South Australia, east past the
 * corner of the three states, then north and east through Queensland to the Darling Downs. */
export const FENCE: LL[] = [
  [132.2, -31.9], [132.9, -31.0], [133.7, -30.1], [134.6, -29.2], [135.8, -28.7], [137.4, -28.9], [139.0, -29.0],
  [141.0, -29.0], [142.6, -29.0], [144.1, -29.0], [144.9, -28.2], [145.9, -27.4], [147.5, -26.95], [149.4, -26.8], [151.1, -26.75],
];
export const CORNER: LL = [141.0, -29.0];
export const END: LL = [151.1, -26.75];
export const START: LL = FENCE[0]!;

// cumulative lengths along the fence (lon scaled by cos(lat)), so a fraction 0..1 is a share of its length
const seg = FENCE.slice(1).map((p, i) => {
  const a = FENCE[i]!;
  const c = Math.cos(((a[1] + p[1]) / 2) * (Math.PI / 180));
  return Math.hypot((p[0] - a[0]) * c, p[1] - a[1]);
});
const total = seg.reduce((s, x) => s + x, 0);
/** the fraction of the fence's length at stop `i` */
export const fracAt = (i: number): number => seg.slice(0, i).reduce((s, x) => s + x, 0) / total;
export const CORNER_K = fracAt(7);

/** [lon, lat] at fraction k of the fence's length */
export const along = (k: number): LL => {
  let d = Math.max(0, Math.min(1, k)) * total;
  for (let i = 0; i < seg.length; i++) {
    const s = seg[i]!;
    if (d <= s || i === seg.length - 1) {
      const a = FENCE[i]!, b = FENCE[i + 1]!, q = s > 0 ? Math.min(1, d / s) : 0;
      return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
    }
    d -= s;
  }
  return END;
};

/** the fence's stops up to fraction k (the last one cut at k) */
const upTo = (k: number): LL[] => {
  const out: LL[] = [FENCE[0]!];
  for (let i = 1; i < FENCE.length; i++) {
    if (fracAt(i) <= k) out.push(FENCE[i]!);
    else { out.push(along(k)); break; }
  }
  return out;
};

const NEAR = ["Australia", "Papua New Guinea", "Indonesia", "New Zealand", "Timor-Leste"];

/** Australia on the old map; `center` and `scale` are the camera. `flag` puts Australia's flag in it. */
export const Map: React.FC<{ center: LL; scale: number; flag?: number; trace?: number; children?: React.ReactNode }> = ({ center, scale, flag = 0, trace, children }) => {
  const colors: Record<string, Fill> = { Australia: { fill: "#e2bd7a", k: 0.4 + 0.6 * flag, trace } };
  return (
    <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.35} detail="50m" only={NEAR} colors={colors}>
      <StateLines />
      <AuFlag k={flag} />
      {children}
    </WorldMap>
  );
};


// a crude outline of Australia (and New Guinea's south coast), so sea marks stay off the land
const LAND: LL[] = [[113, -22], [114, -26], [115, -34.5], [118, -35.5], [124, -34], [129, -32], [132, -32], [135.5, -35.3], [138, -36], [140.5, -38.5], [144, -39], [147, -39], [150.5, -37.5], [153.5, -28], [153.5, -24], [146, -18], [145.5, -13], [142.5, -10], [141.5, -13.5], [137, -16], [136.5, -11.8], [130.5, -11], [126, -13.8], [121.5, -18.5]];
const inside = (pt: LL, poly: LL[]): boolean => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!, b = poly[j]!;
    if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
const TAS: LL[] = [[144.5, -40.5], [148.5, -40.5], [148.5, -43.8], [145, -43.8]];
const MARKS: LL[] = [];
for (let lon = 96; lon <= 176; lon += 3.2) for (let lat = -12.5; lat >= -62; lat -= 2.6) {
  const pt: LL = [lon + ((Math.round(lat * 10) % 3) * 0.9), lat];
  const pad = [[0, 0], [1.2, 0], [-1.2, 0], [0, 1.1], [0, -1.1]].every(([dx, dy]) => !inside([pt[0] + dx!, pt[1] + dy!], LAND) && !inside([pt[0] + dx!, pt[1] + dy!], TAS));
  if (pad && !(pt[1] > -11)) MARKS.push(pt);
}

/** Wave strokes and ocean names in the sea around Australia (life in the water; they move with the map). */
export const SeaMarks: React.FC<{ t: number; names?: number }> = ({ t, names = 1 }) => {
  const at = useAt();
  return (
    <g>
      {MARKS.map((pt, i) => {
        const xy = at(pt);
        if (!xy || xy[0] < -100 || xy[0] > 1180 || xy[1] < -100 || xy[1] > 2020) return null;
        const ph = Math.sin(t / 14 + i * 1.7) * 10;
        return <path key={i} d={`M${xy[0] - 40 + ph},${xy[1]} q20,-16 40,0 q20,-16 40,0`} fill="none" stroke="#e6f2f0" strokeWidth={6} strokeLinecap="round" opacity={0.75} />;
      })}
      {names > 0 ? (
        <g>
          {([[[104, -30], "INDIAN OCEAN"], [[133, -44], "SOUTHERN OCEAN"], [[160, -36], "TASMAN SEA"]] as [LL, string][]).map(([ll, text]) => {
            const xy = at(ll);
            const half = text.length * 17 + 30;
            if (!xy || xy[0] - half < 60 || xy[0] + half > 920 || xy[1] < 300 || xy[1] > 1330) return null;
            return <MapLabel key={text} at={ll} text={text} size={46} fill="#e6f2f0" k={names} />;
          })}
        </g>
      ) : null}
    </g>
  );
};


/** The state borders (simplified): WA, the NT/SA line, SA/QLD/NSW meeting at the corner, NSW/QLD and NSW/VIC. */
const BORDERS: LL[][] = [
  [[129, -14.9], [129, -31.7]], [[129, -26], [141, -26]], [[138, -26], [138, -16.5]], [[141, -26], [141, -38.1]],
  [[141, -29], [148.9, -29], [150.5, -28.6], [152, -28.3], [153.5, -28.2]],
  [[141, -34], [144, -35.7], [146, -36], [148.2, -36.8], [150, -37.5]],
];
export const StateLines: React.FC = () => {
  const at = useAt();
  return (
    <g>
      {BORDERS.map((line, i) => {
        const xy = line.map((p) => at(p)).filter((p): p is [number, number] => !!p);
        if (xy.length < 2) return null;
        const d = xy.map((p, j) => `${j ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
        return <path key={i} d={d} fill="none" stroke="#6a4a26" strokeWidth={5} strokeDasharray="18 12" strokeLinecap="round" opacity={0.85} />;
      })}
    </g>
  );
};

/** Australia's flag on a pole planted in the north-west, clear of the fence; `k` raises it. */
export const AuFlag: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([121.5, -21.0]);
  if (!xy || k <= 0) return null;
  const q = Math.min(1, k);
  const w = 240, h = 160;
  const x = Math.max(80, xy[0] - 40), y = xy[1];
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y]} b={[x, y - (h + 120) * q]} w={10} color="#6b4a2a" sw={3} />
      <g transform={`translate(0,${(1 - q) * 120})`}>
        <FlagArt name="Australia" x={x} y={y - h - 120} w={w} h={h} />
        <rect x={x} y={y - h - 120} width={w} height={h} fill="none" stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};

/** The two sides of the fence tinted inside Australia's coast: `dingo` the north-west, `sheep` the south-east. */
export const Sides: React.FC<{ dingo: number; sheep: number }> = ({ dingo, sheep }) => {
  const { path } = useMap();
  const at = useAt();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = country("Australia");
  if (!c || (dingo <= 0 && sheep <= 0)) return null;
  const d = path(c) ?? "";
  const SE: LL[] = [...FENCE, [154.5, -26.6], [155, -41], [140, -41], [131, -36], [130.5, -32.2]];
  const xy = SE.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const se = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={-6000} y={-6000} width={14000} height={14000} fill={RED} opacity={0.36 * Math.min(1, dingo)} />
        <path d={se} fill={GREEN} opacity={0.42 * Math.min(1, sheep)} />
      </g>
    </g>
  );
};

/** The fence drawn up to `k`: a dark wire line with posts; `run` (0..1) sends a light along it; `flash` lights all of it. */
export const Fence: React.FC<{ k?: number; run?: number; flash?: number; w?: number; gaps?: { at: number; k: number }[] }> = ({ k = 1, run = -1, flash = 0, w = 10, gaps = [] }) => {
  const at = useAt();
  const xy = upTo(k).map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 2) return null;
  const d = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const r = run >= 0 && run <= 1 ? at(along(run)) : null;
  return (
    <g>
      <path d={d} fill="none" stroke="#fff4d0" strokeOpacity={0.25 + 0.6 * flash} strokeWidth={w * 3.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={flash > 0 ? shade(GOLD, -0.3 + 0.3 * flash) : WIRE} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#f1e2bf" strokeWidth={w * 2.2} strokeDasharray={`${w * 0.45} ${w * 2.4}`} />
      {gaps.map((g, i) => {
        const p = at(along(g.at));
        if (!p || g.k <= 0) return null;
        return <circle key={i} cx={p[0]} cy={p[1]} r={w * 2.4} fill={g.k > 1 ? "#ffffff" : "#e8453c"} stroke={INK} strokeWidth={3} opacity={Math.min(1, g.k) * (g.k > 1 ? Math.max(0, 2 - g.k) : 1)} />;
      })}
      {r ? (
        <g>
          <Glow x={r[0]} y={r[1]} r={w * 9} color="#fff3b0" o={0.9} />
          <circle cx={r[0]} cy={r[1]} r={w * 1.3} fill="#ffffff" />
        </g>
      ) : null}
    </g>
  );
};

/** A white patrol ute, facing right; `bump` bobs it. */
export const Truck: React.FC<{ x: number; y: number; s: number; bump?: number; flip?: boolean }> = ({ x, y, s, bump = 0, flip }) => (
  <g transform={`translate(${x},${y - Math.abs(bump) * s * 0.05}) scale(${flip ? -1 : 1},1)`}>
    <ellipse cx={0} cy={s * 0.02} rx={s * 0.62} ry={s * 0.07} fill="#000" opacity={0.25} />
    <Block x={-s * 0.6} y={-s * 0.38} w={s * 0.7} h={s * 0.24} fill="#f4f1ea" r={s * 0.04} sw={3} />
    <Block x={s * 0.05} y={-s * 0.6} w={s * 0.42} h={s * 0.46} fill="#f4f1ea" r={s * 0.08} sw={3} />
    <Block x={s * 0.15} y={-s * 0.54} w={s * 0.26} h={s * 0.18} fill="#8fc6e0" r={s * 0.03} shadow={false} sw={2} />
    <rect x={-s * 0.56} y={-s * 0.3} width={s * 0.58} height={s * 0.06} fill={RED} />
    <Limb a={[-s * 0.55, -s * 0.38]} b={[-s * 0.45, -s * 0.52]} w={s * 0.03} color="#555" sw={2} />
    {[-0.35, 0.3].map((dx, i) => (
      <g key={i}>
        <circle cx={dx * s} cy={-s * 0.1} r={s * 0.13} fill="#2a2a2a" stroke={INK} strokeWidth={3} />
        <circle cx={dx * s} cy={-s * 0.1} r={s * 0.05} fill="#bbb" />
      </g>
    ))}
  </g>
);

/** A dust trail behind the truck. */
export const Dust: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g opacity={0.6}>
    {[0, 1, 2, 3].map((i) => {
      const ph = ((t / 6 + i) % 4) / 4;
      return <circle key={i} cx={x - s * (0.7 + ph * 0.9)} cy={y - s * (0.1 + ph * 0.25)} r={s * (0.08 + ph * 0.16)} fill="#e6c49a" opacity={1 - ph} />;
    })}
  </g>
);

/** A sheep standing, facing right; `graze` lowers the head. */
export const Sheep: React.FC<{ x: number; y: number; s: number; k?: number; graze?: number; flip?: boolean }> = ({ x, y, s, k = 1, graze = 0, flip }) => {
  if (k <= 0) return null;
  const q = Math.min(1.15, k);
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * q},${q})`}>
      <ellipse cx={0} cy={0} rx={s * 0.5} ry={s * 0.08} fill="#000" opacity={0.2} />
      {[-0.22, 0.2].map((dx, i) => <Limb key={i} a={[dx * s, -s * 0.25]} b={[dx * s, 0]} w={s * 0.08} color="#2a2430" sw={2} />)}
      {[[-0.25, -0.42, 0.22], [0, -0.5, 0.26], [0.22, -0.42, 0.22], [-0.1, -0.32, 0.22], [0.12, -0.32, 0.22]].map(([dx, dy, r], i) => (
        <Ball key={i} x={dx! * s} y={dy! * s} r={r! * s} fill="#f7f3ea" sw={3} shadow={false} />
      ))}
      <g transform={`rotate(${graze * 40} ${s * 0.38} ${-s * 0.45})`}>
        <Ball x={s * 0.5} y={-s * 0.5} r={s * 0.14} ry={s * 0.18} fill="#2a2430" sw={2} shadow={false} />
        <circle cx={s * 0.54} cy={-s * 0.55} r={s * 0.025} fill="#fff" />
      </g>
    </g>
  );
};

/** A dingo, side on, facing right; `trot` swings the legs. */
export const Dingo: React.FC<{ x: number; y: number; s: number; k?: number; trot?: number; flip?: boolean; head?: number }> = ({ x, y, s, k = 1, trot = 0, flip, head = 0 }) => {
  if (k <= 0) return null;
  const q = Math.min(1.15, k);
  const sw = Math.sin(trot) * s * 0.08;
  const fur = DINGO, dark = shade(DINGO, -0.3);
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * q},${q})`}>
      <ellipse cx={0} cy={0} rx={s * 0.55} ry={s * 0.08} fill="#000" opacity={0.2} />
      <Limb a={[-s * 0.3, -s * 0.32]} b={[-s * 0.3 - sw, 0]} w={s * 0.09} color={dark} sw={2} />
      <Limb a={[s * 0.25, -s * 0.32]} b={[s * 0.25 + sw, 0]} w={s * 0.09} color={dark} sw={2} />
      <path d={`M${-s * 0.45},${-s * 0.5} Q${-s * 0.8},${-s * 0.62} ${-s * 0.78},${-s * 0.3}`} fill="none" stroke={INK} strokeWidth={s * 0.11} strokeLinecap="round" />
      <path d={`M${-s * 0.45},${-s * 0.5} Q${-s * 0.8},${-s * 0.62} ${-s * 0.78},${-s * 0.3}`} fill="none" stroke={fur} strokeWidth={s * 0.07} strokeLinecap="round" />
      <Ball x={0} y={-s * 0.45} r={s * 0.48} ry={s * 0.19} fill={fur} sw={3} />
      <Limb a={[-s * 0.2, -s * 0.32]} b={[-s * 0.2 + sw, 0]} w={s * 0.09} color={fur} sw={2} />
      <Limb a={[s * 0.32, -s * 0.32]} b={[s * 0.32 - sw, 0]} w={s * 0.09} color={fur} sw={2} />
      <circle cx={-s * 0.2 + sw} cy={-s * 0.02} r={s * 0.045} fill="#fff" />
      <circle cx={s * 0.32 - sw} cy={-s * 0.02} r={s * 0.045} fill="#fff" />
      <g transform={`rotate(${head} ${s * 0.4} ${-s * 0.6})`}>
        <path d={`M${s * 0.38},${-s * 0.8} L${s * 0.42},${-s * 1.0} L${s * 0.52},${-s * 0.82} Z`} fill={fur} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M${s * 0.52},${-s * 0.82} L${s * 0.6},${-s * 1.0} L${s * 0.66},${-s * 0.8} Z`} fill={fur} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <Ball x={s * 0.52} y={-s * 0.7} r={s * 0.18} fill={fur} sw={3} shadow={false} />
        <path d={`M${s * 0.6},${-s * 0.74} L${s * 0.86},${-s * 0.64} L${s * 0.64},${-s * 0.56} Z`} fill={fur} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={s * 0.86} cy={-s * 0.64} r={s * 0.035} fill={INK} />
        <circle cx={s * 0.56} cy={-s * 0.74} r={s * 0.03} fill={INK} />
      </g>
    </g>
  );
};

/** A sign on a post at (x, y) with a title and a big value; `k` drops it in. */
export const Board: React.FC<{ x: number; y: number; w: number; title: string; value: string; k?: number; tone?: string }> = ({ x, y, w, title, value, k = 1, tone = "#f4e6c4" }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -90;
  const h = 170;
  return (
    <g transform={`translate(0,${drop})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y]} b={[x, y - 130]} w={16} color="#6b4a2a" sw={3} />
      <Block x={x - w / 2} y={y - 130 - h} w={w} h={h} fill={tone} r={14} />
      <Txt x={x} y={y - 130 - h + 48} size={46} fill="#5a3a1a">{title}</Txt>
      <Txt x={x} y={y - 130 - h + 118} size={64} fill={INK}>{value}</Txt>
    </g>
  );
};

/** The odometer in the top of the frame (screen space): the length driven so far. */
export const Odo: React.FC<{ value: string; k?: number }> = ({ value, k = 1 }) => (
  <Display x={240} y={150} w={600} h={200} label="KM OF FENCE" value={`${value} KM`} color="#ffd36a" bg="#1b1712" k={k} />
);

/** A question mark sign, popping on `k`. */
export const QMark: React.FC<{ x: number; y: number; size: number; k: number; t: number }> = ({ x, y, size, k, t }) => {
  if (k <= 0) return null;
  const s = Math.min(1.1, k) * (1 + 0.05 * Math.sin(t / 6));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Glow x={0} y={0} r={size * 0.8} color="#ffe08a" o={0.45} />
      <Ball x={0} y={0} r={size * 0.45} fill={GOLD} />
      <Txt x={0} y={4} size={size * 0.6} fill={INK}>?</Txt>
    </g>
  );
};

/** Paw prints from a to b (screen), shown up to `k`. */
export const Paws: React.FC<{ a: [number, number]; b: [number, number]; k: number; n?: number; s?: number }> = ({ a, b, k, n = 8, s = 16 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const q = i / (n - 1);
      if (k <= 0 || q > k) return null;
      const x = a[0] + (b[0] - a[0]) * q + (i % 2 ? s * 0.8 : -s * 0.8), y = a[1] + (b[1] - a[1]) * q;
      return (
        <g key={i} opacity={0.85}>
          <ellipse cx={x} cy={y} rx={s * 0.55} ry={s * 0.45} fill="#4a2e1a" />
          {[-0.5, 0, 0.5].map((dx, j) => <circle key={j} cx={x + dx * s} cy={y - s * 0.7} r={s * 0.2} fill="#4a2e1a" />)}
        </g>
      );
    })}
  </g>
);

/** A small worker in a wide hat, holding a mallet (screen). */
export const Worker: React.FC<{ x: number; y: number; s: number; swing?: number; shirt?: string }> = ({ x, y, s, swing = 0, shirt = "#4f7fb0" }) => (
  <g>
    <Limb a={[x, y - s * 0.45]} b={[x - s * 0.12, y]} w={s * 0.12} color="#3b3046" sw={2} />
    <Limb a={[x, y - s * 0.45]} b={[x + s * 0.12, y]} w={s * 0.12} color="#3b3046" sw={2} />
    <Block x={x - s * 0.18} y={y - s * 0.98} w={s * 0.36} h={s * 0.56} fill={shirt} r={s * 0.1} sw={3} />
    <g transform={`rotate(${-60 + swing * 80} ${x + s * 0.12} ${y - s * 0.85})`}>
      <Limb a={[x + s * 0.12, y - s * 0.85]} b={[x + s * 0.5, y - s * 0.85]} w={s * 0.08} color="#c98652" sw={2} />
      <Limb a={[x + s * 0.45, y - s * 0.85]} b={[x + s * 0.75, y - s * 0.85]} w={s * 0.05} color="#7a4a2a" sw={2} />
      <Block x={x + s * 0.7} y={y - s * 0.97} w={s * 0.14} h={s * 0.24} fill="#555" r={4} sw={2} shadow={false} />
    </g>
    <Ball x={x} y={y - s * 1.18} r={s * 0.18} fill="#c98652" sw={3} />
    <ellipse cx={x} cy={y - s * 1.3} rx={s * 0.34} ry={s * 0.07} fill="#8a6a3a" stroke={INK} strokeWidth={2} />
    <rect x={x - s * 0.16} y={y - s * 1.46} width={s * 0.32} height={s * 0.16} rx={s * 0.05} fill="#8a6a3a" stroke={INK} strokeWidth={2} />
  </g>
);

/** One fence post with a panel of wire mesh to its right (screen): `h` tall, `k` raises it. */
export const Panel: React.FC<{ x: number; y: number; h: number; w: number; k?: number }> = ({ x, y, h, w, k = 1 }) => {
  if (k <= 0) return null;
  const hh = h * Math.min(1, k);
  const cells = 7;
  return (
    <g>
      <Block x={x - 10} y={y - hh - 10} w={20} h={hh + 10} fill="#7a5532" r={4} sw={3} />
      <Block x={x + w - 10} y={y - hh - 10} w={20} h={hh + 10} fill="#7a5532" r={4} sw={3} />
      {Array.from({ length: cells + 1 }, (_, i) => (
        <line key={`h${i}`} x1={x} y1={y - (hh * i) / cells} x2={x + w} y2={y - (hh * i) / cells} stroke="#d6d6d0" strokeWidth={3} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`v${i}`} x1={x + (w * i) / 9} y1={y} x2={x + (w * i) / 9} y2={y - hh} stroke="#c8c8c0" strokeWidth={2} />
      ))}
      <line x1={x} y1={y - hh} x2={x + w} y2={y - hh} stroke="#9a9a92" strokeWidth={5} />
    </g>
  );
};

export const mix = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
export const mixLL = (a: LL, b: LL, k: number): LL => [mix(a[0], b[0], k), mix(a[1], b[1], k)];
export const num = (s: string): number => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
export { STROKE };

/** The patrol truck at fraction `k` of the fence, with a dust trail. */
export const OnFence: React.FC<{ k: number; t: number; s?: number }> = ({ k, t, s = 120 }) => {
  const xy = useAt()(along(k));
  if (!xy) return null;
  const bump = Math.sin(t / 3);
  return (
    <g>
      <Dust x={xy[0]} y={xy[1] - 6} s={s} t={t} />
      <Truck x={xy[0]} y={xy[1] - 6} s={s} bump={bump} />
    </g>
  );
};

export default Map;

