// Shared pieces for "What if Africa split in two?" (device: erase and redraw). The channel's vintage map of Africa
// with the East African Rift as a glowing crack (simplified line): the sea erases the Afar's coast and floods in,
// runs down the crack, a pen redraws the new coastline and the land east of it breaks away as an island.
import React, { useId } from "react";
import { Ball, Block, Glow, INK, Limb, Txt, shade } from "../../flat/kit";
import { MapLabel, WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";

export type LL = [number, number];
export const SEA = "#5f9fae", CRACK = "#ff7a2f", GOLD = "#f2b134", EASTC = "#8fbf6a", WESTC = "#e2a35a";

/** The eastern branch of the East African Rift, north to south (simplified): the Afar, the Main Ethiopian Rift,
 * Lake Turkana, the Kenya Rift and on into Tanzania. */
export const RIFT: LL[] = [[43.4, 12.6], [42.3, 11.9], [41.0, 11.0], [40.0, 9.3], [38.6, 7.6], [37.6, 5.8], [36.3, 3.8], [36.0, 1.5], [36.2, -0.8], [36.0, -3.2], [35.6, -5.8], [35.0, -8.5]];
/** the piece east of the rift (closed round the Horn's coast, generous out to sea; clipped to the land) */
export const EAST: LL[] = [...RIFT, [36.5, -11.5], [42, -11.5], [46, -2], [53, 8], [53, 13.5], [45, 13.0], [43.6, 12.9]];
/** the Afar lowland, flooded first */
export const AFAR: LL[] = [[39.6, 14.9], [41.0, 14.6], [42.8, 12.7], [43.3, 11.6], [42.2, 11.0], [40.6, 9.8], [39.9, 10.6], [39.7, 12.4]];
export const AFAR_C: LL = [41.0, 12.2];
export const DABBAHU: LL = [40.55, 12.55];
const LAND = ["Ethiopia", "Somalia", "Somaliland", "Kenya", "Tanzania", "Djibouti", "Eritrea"];

export const AFRICA = ["Morocco", "Algeria", "Tunisia", "Libya", "Egypt", "Sudan", "S. Sudan", "Chad", "Niger", "Mali", "Mauritania", "W. Sahara", "Senegal", "Gambia",
  "Guinea-Bissau", "Guinea", "Sierra Leone", "Liberia", "Côte d'Ivoire", "Ghana", "Togo", "Benin", "Burkina Faso", "Nigeria", "Cameroon", "Central African Rep.",
  "Eq. Guinea", "Gabon", "Congo", "Dem. Rep. Congo", "Uganda", "Kenya", "Rwanda", "Burundi", "Tanzania", "Ethiopia", "Eritrea", "Djibouti", "Somalia", "Somaliland",
  "Angola", "Zambia", "Malawi", "Mozambique", "Zimbabwe", "Botswana", "Namibia", "South Africa", "Lesotho", "eSwatini", "Madagascar", "Yemen", "Saudi Arabia", "Oman",
  "Israel", "Jordan", "Palestine", "Lebanon", "Syria", "Iraq", "Iran", "Kuwait", "Qatar", "United Arab Emirates", "Spain", "Portugal", "Italy", "Greece", "Turkey", "Cyprus", "France"];

export const WIDE: { center: LL; scale: number } = { center: [20, 4], scale: 780 };

/** Africa on the old map; `center` and `scale` are the camera. */
export const Map: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.35} detail="50m" only={AFRICA} colors={colors}>
    {children}
  </WorldMap>
);

const toD = (xy: [number, number][], close = false) => xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + (close ? " Z" : "");
const useXY = (pts: LL[]) => {
  const at = useAt();
  return pts.map((p) => at(p)).filter((p): p is [number, number] => !!p);
};
/** the rift's stops down to fraction k of them (the last cut part-way) */
const riftTo = (k: number): LL[] => {
  const n = RIFT.length - 1, f = Math.max(0, Math.min(1, k)) * n, i = Math.floor(f);
  const out = RIFT.slice(0, i + 1);
  if (i < n) {
    const a = RIFT[i]!, b = RIFT[i + 1]!, q = f - i;
    out.push([a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q]);
  }
  return out;
};
/** [lon, lat] at fraction k down the rift */
export const riftAt = (k: number): LL => riftTo(k)[riftTo(k).length - 1]!;

/** The rift as a jagged glowing crack, drawn down to `k`; `glow` brightens it. */
export const Crack: React.FC<{ k?: number; glow?: number; w?: number }> = ({ k = 1, glow = 0.5, w = 8 }) => {
  const xy = useXY(riftTo(k));
  if (xy.length < 2) return null;
  // jag: a small zigzag between stops
  const jag: [number, number][] = [];
  xy.forEach((p, i) => {
    if (i) {
      const a = xy[i - 1]!, mx = (a[0] + p[0]) / 2, my = (a[1] + p[1]) / 2, dx = p[1] - a[1], dy = a[0] - p[0], l = Math.hypot(dx, dy) || 1;
      jag.push([mx + (dx / l) * w * (i % 2 ? 1.6 : -1.6), my + (dy / l) * w * (i % 2 ? 1.6 : -1.6)]);
    }
    jag.push(p);
  });
  const d = toD(jag);
  return (
    <g>
      <path d={d} fill="none" stroke="#ffd08a" strokeOpacity={0.25 + 0.5 * glow} strokeWidth={w * 4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={shade(CRACK, 0.2 * glow)} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** The sea running down the crack to fraction `k`, `w` pixels wide, with a white wave edge. */
export const RiftSea: React.FC<{ k: number; w: number }> = ({ k, w }) => {
  const xy = useXY(riftTo(k));
  if (xy.length < 2 || k <= 0 || w <= 0) return null;
  const d = toD(xy);
  return (
    <g>
      <path d={d} fill="none" stroke="#eef6f4" strokeWidth={w + 12} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={SEA} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** The Afar flooded as `k` goes 0 -> 1 (grows from the Red Sea's southern end). */
export const Flood: React.FC<{ k: number }> = ({ k }) => {
  const xy = useXY(AFAR);
  const o = useAt()([43.3, 12.6]);
  if (xy.length < 3 || k <= 0 || !o) return null;
  const q = Math.min(1, k);
  const pts = xy.map((p) => [o[0] + (p[0] - o[0]) * q, o[1] + (p[1] - o[1]) * q] as [number, number]);
  return <path d={toD(pts, true)} fill={SEA} stroke="#eef6f4" strokeWidth={8} strokeLinejoin="round" />;
};

/** The land east of the rift: `tint` lights it, `cover` paints its old place as sea, `drift` (px) moves a copy east. */
export const Island: React.FC<{ tint?: number; cover?: number; drift?: number; label?: number }> = ({ tint = 0, cover = 0, drift = 0, label = 0 }) => {
  const { path } = useMap();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const xy = useXY(EAST);
  if (xy.length < 3 || (tint <= 0 && cover <= 0 && drift <= 0)) return null;
  const land = LAND.map((n) => country(n)).filter((c): c is NonNullable<typeof c> => !!c).map((c) => path(c) ?? "").join(" ");
  const east = toD(xy, true);
  const piece = (fill: string, o: number) => (
    <g clipPath={`url(#e${id})`}><g clipPath={`url(#l${id})`}><rect x={-8000} y={-8000} width={16000} height={16000} fill={fill} opacity={o} /></g></g>
  );
  const dx = drift, dy = drift * 0.35;
  return (
    <g>
      <defs>
        <clipPath id={`e${id}`}><path d={east} /></clipPath>
        <clipPath id={`l${id}`}><path d={land} /></clipPath>
      </defs>
      {cover > 0 ? piece(SEA, Math.min(1, cover)) : null}
      {tint > 0 || drift > 0 ? (
        <g transform={`translate(${dx},${dy})`}>
          {drift > 0 ? <g opacity={0.35} transform="translate(14,18)">{piece("#000000", 1)}</g> : null}
          {drift > 0 ? piece("#e8d4a2", 1) : null}
          {piece(EASTC, 0.55 * Math.min(1, Math.max(tint, drift > 0 ? 1 : 0)))}
          <g clipPath={`url(#e${id})`}><path d={land} fill="none" stroke="#4a3218" strokeWidth={4} /></g>
          {label > 0 ? <MapLabel at={[44.5, 4.5]} text="ISLAND" size={70} k={label} /> : null}
        </g>
      ) : null}
    </g>
  );
};

/** A sign on a post (screen): a title over a big value; `k` drops it in. */
export const Sign: React.FC<{ x: number; y: number; w: number; title: string; value: string; k?: number; tone?: string }> = ({ x, y, w, title, value, k = 1, tone = "#f4e6c4" }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -90;
  return (
    <g transform={`translate(0,${drop})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y]} b={[x, y - 120]} w={16} color="#6b4a2a" sw={3} />
      <Block x={x - w / 2} y={y - 290} w={w} h={170} fill={tone} r={14} />
      <Txt x={x} y={y - 242} size={46} fill="#5a3a1a">{title}</Txt>
      <Txt x={x} y={y - 172} size={62} fill={INK}>{value}</Txt>
    </g>
  );
};

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

/** Wave strokes in the seas round the Horn and Africa (they move with the map). */
const MARKS: LL[] = [[46, -8], [50, -3], [55, 2], [58, 8], [60, -12], [52, -15], [45, -20], [62, 15], [38, 22], [-20, 5], [-22, 15], [-15, -5], [-5, -15], [5, -25], [-10, -30], [30, -40], [50, -35], [55, -25], [65, -5], [8, 0], [2, -8], [-25, 25], [15, 36], [25, 34], [48, 13.2], [51, 14.5], [57, 12], [45, -28], [65, 2]];
export const SeaMarks: React.FC<{ t: number }> = ({ t }) => {
  const at = useAt();
  return (
    <g>
      {MARKS.map((pt, i) => {
        const xy = at(pt);
        if (!xy || xy[0] < -100 || xy[0] > 1180 || xy[1] < -100 || xy[1] > 2020) return null;
        const ph = Math.sin(t / 14 + i * 1.7) * 10;
        return <path key={i} d={`M${xy[0] - 40 + ph},${xy[1]} q20,-16 40,0 q20,-16 40,0`} fill="none" stroke="#e6f2f0" strokeWidth={6} strokeLinecap="round" opacity={0.75} />;
      })}
    </g>
  );
};

/** A step sign at the top of the frame (screen): FIRST, THEN, FINALLY. */
export const Step: React.FC<{ text: string; k: number; flip?: number }> = ({ text, k, flip = 0 }) => {
  if (k <= 0) return null;
  const sy = Math.abs(Math.cos(flip * Math.PI));
  return (
    <g opacity={Math.min(1, k * 2)} transform={`translate(540,250) scale(1,${Math.max(0.05, sy)}) translate(-540,-250)`}>
      <Block x={330} y={190} w={420} h={120} fill="#1b1712" r={16} shadow={false} />
      <Txt x={540} y={252} size={64} fill="#ffd36a" glow="#ffd36a">{text}</Txt>
    </g>
  );
};

export const mix = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
export const mixLL = (a: LL, b: LL, k: number): LL => [mix(a[0], b[0], k), mix(a[1], b[1], k)];

export default Map;
