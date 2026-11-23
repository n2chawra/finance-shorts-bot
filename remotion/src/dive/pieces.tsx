/**
 * The dive's layer pieces (README "Pieces"), drawn in world coordinates: x 0..1080 across the frame, y 0 at
 * street level growing down (`w.Y(ft)`). Each piece is a pure function of the story frame `g` and its layer;
 * figures come from the layer's params.fig, never typed here.
 */
import React, { createContext, useContext } from "react";
import { Ball, Block, Display, Glow, INK, Limb, STROKE, Tag, Txt, countText, rng, shade } from "../flat/kit";
import { ANCHOR_Y, depthText, ramp, type DiveWorld, type Layer } from "./world";

export interface PieceProps { L: Layer; w: DiveWorld; g: number }
const unitOf = (w: DiveWorld) => w.cfg.unit ?? "ft";
const depthLabel = (L: Layer, w: DiveWorld) => depthText(L.fig[L.spec.depth ?? "depth"], unitOf(w));

// ------------------------------------------------------------------ legible at every zoom

/** The camera this frame (Dive provides it), so world-space words can stay readable on screen. */
export interface DiveCam { z: number; camY: number; cx: number; W: number; H: number }
export const CamCtx = createContext<DiveCam>({ z: 1, camY: 0, cx: 540, W: 1080, H: 1920 });

/** 1 near the camera's point, 0 once a world y is far above or below it on screen: a neighbouring layer's sign or
 * tag fades out before it reaches the top note or the caption band (QA 2026-11-22: "the note is drawn across the
 * FLOODWATER sign", "the caption sits on the FLOODWATER sign"). */
export const useNear = (y: number, bandsOnly = false): number => {
  const c = useContext(CamCtx);
  const sy = ANCHOR_Y + (y - c.camY) * c.z;
  // `bandsOnly`: a landmark's name plate stays up at the opening framing, far above the camera's point; it only
  // keeps out of the top band and the captions (QA 2026-11-22: the plate vanished from the hook)
  if (bandsOnly) return Math.min(ramp(sy, 170, 230), 1 - ramp(sy, 1270, 1330));
  // and never in the caption band (from ~1330 px) or under the top note: a sign there reads as clutter on a camera
  // move (QA 2026-11-22, v-20261122-56: the TUNNEL sign under "Then giant pumps throw")
  return Math.min(1 - ramp(Math.abs(sy - ANCHOR_Y), 420, 500), ramp(sy, 170, 230), 1 - ramp(sy, 1270, 1330));
};
/** 1 for the whole video, falling to 0 over its last second, so whatever arrived on its word is gone again when
 * the ride up lands on the first frame (QA 2026-11-22: "the last frame shows the pillars, frame 0 has none"). */
export const outro = (w: DiveWorld, g: number): number => 1 - ramp(g, w.total - 32, w.total - 6);

const SHOWN = 48, GROW_MAX = 1.3, MIN_READ = 45, BOTTOM = 130;
/**
 * Words drawn in the world (a sign, a tag, the landmark's name) shrink with the camera: at the opening framing
 * (zoom 0.82) a 46 px sign read 37.7 px and failed the layout gate (2026-11-21, v-20261121-51). Legible grows
 * its box about its centre by up to 1.3x so the text shows at 48 px or more, and where it still can't be read
 * (the whole-stack pull-back, passing out of the frame or through the bottom 130 px on a camera move) it is
 * scenery that frame, not text to read: the layout probe skips it there.
 */
export const Legible: React.FC<{ x: number; y: number; w: number; h: number; size: number; children: React.ReactNode }> = ({ x, y, w, h, size, children }) => {
  const c = useContext(CamCtx);
  const s = Math.min(GROW_MAX, Math.max(1, SHOWN / (size * c.z)));
  const mx = x + w / 2, my = y + h / 2;
  const sx0 = c.cx + (mx - (w * s) / 2 - c.cx) * c.z, sx1 = c.cx + (mx + (w * s) / 2 - c.cx) * c.z;
  const sy0 = ANCHOR_Y + (my - (h * s) / 2 - c.camY) * c.z, sy1 = ANCHOR_Y + (my + (h * s) / 2 - c.camY) * c.z;
  const scenery = size * s * c.z < MIN_READ || sx0 < 0 || sx1 > c.W || sy0 < 0 || sy1 > c.H - BOTTOM;
  // far too small to read (a whole-stack pull-back): a smudge of letters is noise, so it isn't drawn (QA, 2026-11-21)
  if (size * s * c.z < 30) return null;
  // and not where the pull-back's name chips (Dive.tsx StackLegend, from zoom 0.62) take over: the sign under its
  // chip drew every name twice (QA 2026-11-23, v-20261123-51: "CITE and SAINT-MAUR each appear twice")
  if (c.z < 0.62) return null;
  return (
    <g data-probe={scenery ? "skip" : undefined} transform={s > 1 ? `translate(${mx} ${my}) scale(${s}) translate(${-mx} ${-my})` : undefined}>
      {children}
    </g>
  );
};

/** A figure carved on a stone tablet in the piece (`spec.tally`), counting up on its word, possibly in a later
 * beat: the payoff's figure on a thing in the place, not a card on the screen. */
export const Tally: React.FC<{ L: Layer; w: DiveWorld; g: number; x: number; y: number }> = ({ L, w, g, x, y: y0 }) => {
  let y = y0;
  // one tally, or a list that take turns: the latest whose word has come shows (a figure said in a later beat
  // replaces the last one on the same tablet)
  const list = [...(L.spec.tally ? [L.spec.tally] : []), ...(L.spec.tallies ?? [])].map((t) => {
    const t0 = t.beat ? w.ev(t.beat, t.on) : L.at(t.on);
    return { t, at: Number.isFinite(t0) ? t0 : L.land };
  }).sort((a, b) => a.at - b.at);
  const cur = list.filter((x) => g >= x.at - 3).pop() ?? list[0];
  if (!cur) return null;
  const { t, at } = cur;
  const figs = t.beat ? w.figs[t.beat] ?? {} : L.fig;
  const fig = figs[t.fig];
  if (!fig) return null;
  const near = useNear(y + 60);
  const k = ramp(g, at - 3, at + 20) * outro(w, g) * near;
  if (k <= 0) return null;
  // high on the back wall, above the people's heads (QA 2026-11-22: a 230 px tablet hid the whole crowd)
  // one line across the top of the vault, clear of the heads below (QA 2026-11-22, twice)
  // one line when the label and the figure fit side by side, else the label over the figure (QA-style check on
  // v-20261122-55: "UNDER THE SEA" ran into "37.9 km")
  const label = (t.label ?? "").toUpperCase(), shown = countText(fig, 1);
  // right of the depth meter's tag (QA 2026-11-22: the PILLARS tablet ran over "22 m")
  const W = 540, oneLine = label.length * 48 * 0.62 + shown.length * 72 * 0.6 + 110 < W;
  const H = oneLine ? 116 : 190;
  y -= H - 116;            // a taller tablet grows upward, clear of the piece under it
  return (
    <g opacity={Math.min(1, k * 3)} transform={`rotate(-2 ${x + W / 2} ${y + H / 2})`}>
      <Legible x={x} y={y} w={W} h={H} size={48}>
        <Block x={x} y={y} w={W} h={H} fill="#d9d2bf" r={18} shadow="bottom" />
        <rect x={x + 16} y={y + 16} width={W - 32} height={H - 32} rx={12} fill="none" stroke="#a89f88" strokeWidth={6} />
        {oneLine ? <>
          {label ? <Txt x={x + 36} y={y + 76} size={48} fill="#5a4a3a" weight={800} anchor="start">{label}</Txt> : null}
          <Txt x={x + W - 36} y={y + 82} size={72} fill={INK} weight={900} anchor="end">{countText(fig, k)}</Txt>
        </> : <>
          <Txt x={x + W / 2} y={y + 68} size={48} fill="#5a4a3a" weight={800}>{label}</Txt>
          <Txt x={x + W / 2} y={y + 152} size={72} fill={INK} weight={900}>{countText(fig, k)}</Txt>
        </>}
      </Legible>
    </g>
  );
};

// ------------------------------------------------------------------ shared bits

export const Bullet: React.FC<{ x: number; y: number; r: number; color: string; t: string }> = ({ x, y, r, color, t }) => (
  <g><circle cx={x} cy={y} r={r} fill={color} stroke={INK} strokeWidth={4} /><Txt x={x} y={y + 2} size={r * 1.25} fill="#fff" weight={800} deco>{t}</Txt></g>
);

/** A hanging station sign: line bullets, a name and the depth figure in the accent colour. */
export const Sign: React.FC<{ x: number; y: number; text: string; depth: string; bullets?: [string, string][]; accent: string; w?: number; k?: number }> = ({ x, y, text, depth, bullets = [], accent, w = 600, k = 1 }) => {
  const h = 96;
  const near = useNear(y + h / 2);
  if (k <= 0 || near <= 0) return null;
  return (
    <g opacity={Math.min(1, k) * near} transform={k < 1 ? `translate(0 ${(1 - k) * -40})` : undefined}>
    <Legible x={x} y={y} w={w} h={h} size={46}>
      <Limb a={[x + 120, y - 70]} b={[x + 120, y]} w={8} color="#2a2a33" sw={3} />
      <Limb a={[x + w - 120, y - 70]} b={[x + w - 120, y]} w={8} color="#2a2a33" sw={3} />
      <Block x={x} y={y} w={w} h={h} fill="#111318" r={8} shadow="bottom" />
      <rect x={x + 10} y={y + 10} width={w - 20} height={6} fill="#f4f1e8" />
      {bullets.map(([t, c], i) => <Bullet key={i} x={x + 56 + i * 74} y={y + h / 2 + 6} r={30} color={c} t={t} />)}
      <Txt x={x + 40 + bullets.length * 74} y={y + h / 2 + 6} size={46} fill="#f4f1e8" anchor="start" weight={700}>{text}</Txt>
      <Txt x={x + w - 26} y={y + h / 2 + 6} size={48} fill={accent} anchor="end" weight={800}>{depth}</Txt>
    </Legible>
    </g>
  );
};

export const Train: React.FC<{ x: number; y: number; color: string; stripe: string; bullet?: [string, string]; road?: boolean }> = ({ x, y, color, stripe, bullet, road }) => (
  <g>
    {(road ? [0, 1] : [0, 1, 2]).map((c) => {
      const cx = x + c * (road ? 520 : 430);
      if (road) return (
        <g key={c}>
          <Block x={cx} y={y - 110} w={300} h={80} fill={c ? stripe : color} r={18} shadow="bottom" />
          <Block x={cx + 60} y={y - 160} w={170} h={60} fill={c ? stripe : color} r={14} shadow={false} />
          <rect x={cx + 80} y={y - 150} width={130} height={36} rx={6} fill="#cfe8ff" stroke={INK} strokeWidth={4} />
          <Ball x={cx + 60} y={y - 26} r={26} fill="#22232b" sw={4} /><Ball x={cx + 240} y={y - 26} r={26} fill="#22232b" sw={4} />
          <Glow x={cx + 300} y={y - 80} r={70} color="#fff6c9" o={0.6} />
        </g>
      );
      return (
        <g key={c}>
          <Block x={cx} y={y - 150} w={410} h={150} fill={color} r={c === 2 ? 40 : 14} shadow="bottom" />
          <rect x={cx + 6} y={y - 52} width={398} height={14} fill={stripe} />
          {[0, 1, 2, 3].map((wv) => <Block key={wv} x={cx + 30 + wv * 92} y={y - 128} w={70} h={56} fill="#fff6c9" r={6} shadow={false} sw={4} />)}
          {bullet && c === 2 ? <Bullet x={cx + 360} y={y - 100} r={28} color={bullet[1]} t={bullet[0]} /> : null}
          <circle cx={cx + 80} cy={y + 4} r={16} fill="#22232b" /><circle cx={cx + 330} cy={y + 4} r={16} fill="#22232b" />
        </g>
      );
    })}
  </g>
);

/** The layer counters (a ride timer, a pump rate, a count): drawn on screen by Dive (`ScreenCounter`), so
 * they are never off the frame; the latest counter whose word has come shows, counting up on that word, until
 * its beat ends (so the loop's last frame matches the first). */
export const ScreenCounter: React.FC<{ w: DiveWorld; g: number }> = ({ w, g }) => {
  const live = w.layers.filter((L) => L.spec.counter && L.fig[L.spec.counter.fig]).map((L) => ({ L, t0: L.at(L.spec.counter!.on) }))
    .filter(({ L, t0 }) => g >= t0 - 3 && g < L.until).sort((a, b) => b.t0 - a.t0)[0];
  if (!live) return null;
  const c = live.L.spec.counter!;
  const k = ramp(g, live.t0 - 3, live.t0 + 18);
  // a long unit word goes up into the label ("110,000 tonnes" ran off the display, 2026-11-21), and the number
  // is sized to fit the display's width
  const fig = live.L.fig[c.fig]!;
  const unit = fig.match(/\s+([A-Za-z]{4,})$/)?.[1];
  const value = unit ? fig.slice(0, fig.length - unit.length).trim() : fig;
  const label = unit ? `${c.label ?? ""} · ${unit.toUpperCase()}`.replace(/^ · /, "") : c.label ?? "";
  const W = 560, h = Math.min(300, (W - 60) / (0.62 * Math.max(1, value.length)) / 0.52);
  return <Display x={930 - W} y={c.y ?? 300} w={W} h={h} label={label} value={countText(value, k)} color={w.look.accent} k={k} />;
};

// ------------------------------------------------------------------ the ground

/** The ground under the street: bands from the world's `strata` (soil, clay, sand, gravel, bedrock, chalk, water table). */
export const Strata: React.FC<{ w: DiveWorld }> = ({ w }) => {
  const L = w.look;
  const bands = w.cfg.strata?.length ? w.cfg.strata : [{ kind: "soil" as const, toFt: w.maxFt * 0.4 }, { kind: "bedrock" as const, toFt: w.maxFt * 3 }];
  const r = rng("strata");
  const bottom = w.Y(w.maxFt) + 4000;
  let top = 60;
  return (
    <g>
      <rect x={-2400} y={60} width={5900} height={bottom} fill={L.rock} />
      {bands.map((b, i) => {
        const y0 = top, y1 = i === bands.length - 1 ? bottom : Math.max(y0 + 40, w.Y(b.toFt) + 60);
        top = y1;
        const fill = b.kind === "bedrock" ? L.rock : L[b.kind === "water" ? "water" : b.kind];
        const stones = Array.from({ length: Math.min(220, Math.round((y1 - y0) / 25)) }, () => ({ x: -2200 + r() * 5400, y: y0 + 10 + r() * (y1 - y0 - 20), s: 8 + r() * 26, k: r() }));
        return (
          <g key={i}>
            <rect x={-2400} y={y0} width={5900} height={y1 - y0} fill={fill} />
            {b.kind === "bedrock"
              ? <>
                {Array.from({ length: Math.min(90, Math.round((y1 - y0) / 70)) }, (_, j) => <path key={j} d={`M -2400 ${y0 + 20 + j * 70} q 1400 ${j % 2 ? 40 : -40} 2950 0 t 2950 0`} stroke={L.rockLine} strokeWidth={10} fill="none" />)}
                {stones.map((s, j) => <path key={j} d={`M ${s.x} ${s.y} l ${s.s} ${-s.s / 3}`} stroke={s.k < 0.3 ? "#d8e6ff" : shade(L.rock, -0.25)} strokeWidth={s.k < 0.3 ? 3 : 6} />)}
              </>
              : b.kind === "water"
                ? stones.map((s, j) => <circle key={j} cx={s.x} cy={s.y} r={s.s * 0.35} fill={shade(L.water, 0.35)} opacity={0.6} />)
                : stones.map((s, j) => <ellipse key={j} cx={s.x} cy={s.y} rx={s.s * (b.kind === "sand" ? 0.4 : 1)} ry={s.s * 0.7 * (b.kind === "sand" ? 0.4 : 1)} fill={shade(fill, s.k < 0.5 ? -0.15 : 0.12)} />)}
            <line x1={-2400} x2={3500} y1={y0} y2={y0} stroke={shade(fill, -0.35)} strokeWidth={8} />
            {b.label ? <Txt x={1040} y={y0 + 46} size={34} fill={shade(fill, 0.55)} anchor="end" weight={700} deco>{b.label.toUpperCase()}</Txt> : null}
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ the surface

/** The street and the landmark the dive starts from. Presets: station, tower, stadium, monument, bridge, dam, street. */
export const Surface: React.FC<PieceProps> = ({ L, w, g }) => {
  const look = w.look, s = L.spec;
  const wall = s.wall ?? "#ead8b4", trim = s.trim ?? shade(wall, -0.1), glass = s.glass ?? "#7cb6e0";
  const preset = s.preset ?? "station";
  // traffic loops a whole number of times over the video, so the last frame matches the first
  const laps = Math.max(1, Math.round((w.total / 30) * 260 / 3600));
  const car = (i: number) => (((g / w.total) * laps + i / 5) % 1) * 3600 - 1500;
  const water = preset === "bridge" || preset === "dam";
  const tube = preset === "tube";
  const ny = preset === "station" ? -1040 : tube ? -545 : -120;
  const nsize = tube ? 60 : 46;
  const name = s.label ? <Legible x={90} y={ny - 35} w={900} h={70} size={nsize}><Txt x={540} y={ny} size={nsize} fill={tube ? look.paper : shade(wall, -0.6)} weight={800}>{s.label.toUpperCase()}</Txt></Legible> : null;
  return (
    <g>
      <rect x={-2400} y={-3200} width={5900} height={3200} fill={look.skyLow} />
      <rect x={-2400} y={-3200} width={5900} height={2300} fill={look.skyTop} />
      <Glow x={540} y={-1150} r={900} color={look.sun} o={0.5} />
      {[-900, -500, 1300, 1700, 2100, -1300].map((x, i) => <Block key={i} x={x} y={-1500 + (i % 3) * 200} w={340} h={1500 - (i % 3) * 200} fill={look.skyline} shadow={false} sw={4} />)}
      {preset === "station" ? (
        <g>
          <Block x={180} y={-2300} w={720} h={1100} fill={shade(look.skyline, 0.12)} shadow="right" />
          <Block x={60} y={-1020} w={960} h={1020} fill={wall} shadow="right" />
          <Block x={30} y={-1080} w={1020} h={80} fill={trim} shadow="bottom" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={140 + i * 290} y={-860} width={220} height={560} fill={glass} stroke={INK} strokeWidth={STROKE} />
              <path d={`M ${140 + i * 290} ${-860} a 110 110 0 0 1 220 0`} fill={glass} stroke={INK} strokeWidth={STROKE} />
              {[1, 2, 3].map((k) => <line key={k} x1={140 + i * 290} x2={360 + i * 290} y1={-860 + k * 140} y2={-860 + k * 140} stroke={shade(glass, -0.2)} strokeWidth={6} />)}
              <line x1={250 + i * 290} x2={250 + i * 290} y1={-960} y2={-300} stroke={shade(glass, -0.2)} strokeWidth={6} />
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => <Block key={i} x={100 + i * 290} y={-900} w={40} h={900} fill={shade(wall, -0.05)} shadow="right" sw={4} />)}
          <Ball x={540} y={-1200} r={120} fill={look.accent} />
          <Ball x={540} y={-1200} r={84} fill="#fff6dc" shadow={false} />
          <Limb a={[540, -1200]} b={[540, -1262]} w={10} color={INK} sw={0} />
          <Limb a={[540, -1200]} b={[586, -1200]} w={10} color={INK} sw={0} />
        </g>
      ) : tube ? (
        // a London Underground front (2026-11-21): two storeys of glazed tiles, arched first-floor windows,
        // the name on a dark frieze, three arched openings at street level, lit inside
        <g>
          <Block x={60} y={-1000} w={960} h={1000} fill={wall} shadow="right" />
          {Array.from({ length: 11 }, (_, r) => <line key={r} x1={64} x2={1016} y1={-1000 + (r + 1) * 84} y2={-1000 + (r + 1) * 84} stroke={shade(wall, -0.18)} strokeWidth={3} />)}
          <Block x={30} y={-1060} w={1020} h={70} fill={trim} shadow="bottom" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={130 + i * 300} y={-880} width={220} height={190} fill={glass} stroke={INK} strokeWidth={STROKE} />
              <path d={`M ${130 + i * 300} -880 a 110 110 0 0 1 220 0`} fill={glass} stroke={INK} strokeWidth={STROKE} />
              <line x1={240 + i * 300} x2={240 + i * 300} y1={-990} y2={-690} stroke={shade(glass, -0.2)} strokeWidth={6} />
            </g>
          ))}
          <Block x={40} y={-615} w={1000} h={140} fill={shade(wall, -0.5)} shadow="bottom" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d={`M ${110 + i * 300} 0 L ${110 + i * 300} -320 a 130 130 0 0 1 260 0 L ${370 + i * 300} 0 Z`} fill={shade(wall, -0.55)} stroke={INK} strokeWidth={STROKE} />
              <rect x={145 + i * 300} y={-290} width={190} height={290} fill={i === 1 ? look.light : shade(glass, -0.35)} stroke={INK} strokeWidth={5} />
            </g>
          ))}
        </g>
      ) : preset === "needle" ? (
        // a supertall needle (the Burj Khalifa, 2026-11-21): stepped tiers narrowing to a spire on a podium
        <g>
          {[[560, 300], [440, 260], [330, 230], [230, 200], [140, 170], [80, 150]].reduce<{ y: number; el: React.ReactNode[] }>((acc, [tw, th], i) => {
            const y = acc.y - th!;
            acc.el.push(
              <g key={i}>
                <Block x={540 - tw! / 2} y={y} w={tw!} h={th!} fill={i % 2 ? trim : wall} shadow="right" />
                {Array.from({ length: Math.floor(th! / 50) }, (_, r) => <line key={r} x1={540 - tw! / 2 + 14} x2={540 + tw! / 2 - 14} y1={y + 25 + r * 50} y2={y + 25 + r * 50} stroke={glass} strokeWidth={8} />)}
              </g>);
            acc.y = y;
            return acc;
          }, { y: -200, el: [] }).el}
          <Limb a={[540, -1500]} b={[540, -2300]} w={22} color={trim} />
          <Block x={160} y={-200} w={760} h={200} fill={trim} shadow="right" />
          <rect x={440} y={-170} width={200} height={170} fill={glass} stroke={INK} strokeWidth={STROKE} />
        </g>
      ) : preset === "tower" ? (
        <g>
          <Block x={250} y={-3000} w={580} h={3000} fill={wall} shadow="right" />
          {Array.from({ length: 26 }, (_, r) => Array.from({ length: 5 }, (_, c) => (
            <rect key={`${r}-${c}`} x={290 + c * 104} y={-2940 + r * 112} width={70} height={74} fill={(r * 5 + c) % 7 === 0 ? look.sun : glass} stroke={INK} strokeWidth={3} />)))}
          <Block x={210} y={-260} w={660} h={260} fill={trim} shadow="right" />
          <rect x={440} y={-200} width={200} height={200} fill={glass} stroke={INK} strokeWidth={STROKE} />
        </g>
      ) : preset === "stadium" ? (
        <g>
          <path d="M -120 0 L -40 -520 Q 540 -760 1120 -520 L 1200 0 Z" fill={wall} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-60 + i * 18} ${-120 - i * 110} Q 540 ${-330 - i * 120} ${1140 - i * 18} ${-120 - i * 110}`} fill="none" stroke={i % 2 ? trim : s.color ?? "#e8432f"} strokeWidth={26} />)}
          {[-40, 1120].map((x) => <g key={x}><Limb a={[x, 0]} b={[x, -1050]} w={22} color="#8a8f9c" /><Block x={x - 90} y={-1150} w={180} h={110} fill="#2a2f3d" r={10} /><Glow x={x} y={-1095} r={260} color={look.sun} o={0.6} /></g>)}
        </g>
      ) : preset === "monument" ? (
        <g>
          <Block x={120} y={-980} w={840} h={980} fill={wall} shadow="right" />
          <Block x={70} y={-1500} w={240} h={1500} fill={trim} shadow="right" />
          <Block x={770} y={-1500} w={240} h={1500} fill={trim} shadow="right" />
          {[190, 840].map((x) => <path key={x} d={`M ${x - 120} -1500 L ${x} -1880 L ${x + 120} -1500 Z`} fill={shade(trim, -0.15)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />)}
          <Ball x={540} y={-720} r={160} fill={glass} />
          {[0, 45, 90, 135].map((a) => <line key={a} x1={540 + 160 * Math.cos(a * Math.PI / 180)} y1={-720 + 160 * Math.sin(a * Math.PI / 180)} x2={540 - 160 * Math.cos(a * Math.PI / 180)} y2={-720 - 160 * Math.sin(a * Math.PI / 180)} stroke={INK} strokeWidth={5} />)}
          <path d="M 420 0 L 420 -300 a 120 120 0 0 1 240 0 L 660 0 Z" fill={shade(wall, -0.45)} stroke={INK} strokeWidth={STROKE} />
        </g>
      ) : preset === "bridge" ? (
        <g>
          {[200, 880].map((x) => <g key={x}><Block x={x - 50} y={-1400} w={100} h={1400} fill={wall} shadow="right" /><Block x={x - 80} y={-1150} w={160} h={50} fill={trim} shadow={false} /></g>)}
          <path d="M -600 -330 Q 200 -330 200 -1350 Q 540 -500 880 -1350 Q 880 -330 1680 -330" fill="none" stroke={INK} strokeWidth={18} />
          <path d="M -600 -330 Q 200 -330 200 -1350 Q 540 -500 880 -1350 Q 880 -330 1680 -330" fill="none" stroke={s.color ?? "#e8432f"} strokeWidth={10} />
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={240 + i * 50} x2={240 + i * 50} y1={-300} y2={-1250 + Math.abs(i - 6) * -0 + Math.pow(i - 6, 2) * 22} stroke={INK} strokeWidth={4} />)}
          <Block x={-2400} y={-340} w={5900} h={60} fill={trim} shadow="bottom" />
        </g>
      ) : preset === "dam" ? (
        <g>
          <rect x={-2400} y={-900} width={2700} height={900} fill={look.water} />
          <path d="M 260 -1000 L 560 -1000 L 1000 0 L 160 0 Z" fill={wall} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          {[1, 2, 3, 4].map((i) => <line key={i} x1={240 - i * 6} x2={560 + i * 110} y1={-1000 + i * 200} y2={-1000 + i * 200} stroke={shade(wall, -0.15)} strokeWidth={6} />)}
          <Block x={240} y={-1060} w={340} h={70} fill={trim} shadow="bottom" />
          <path d={`M 600 -700 Q 900 -500 960 0`} fill="none" stroke="#dff3ff" strokeWidth={40} opacity={0.8} strokeDasharray={`60 40`} strokeDashoffset={-((g * 9) % 100)} />
        </g>
      ) : (
        <g>
          {[0, 1, 2, 3].map((i) => {
            const hgt = 640 + (i % 2) * 220, c = [wall, trim, s.color ?? "#c96a4a", shade(wall, -0.2)][i]!;
            return (
              <g key={i}>
                <Block x={20 + i * 260} y={-hgt} w={250} h={hgt} fill={c} shadow="right" />
                {[0, 1, 2].map((r) => [0, 1].map((k) => <rect key={`${r}${k}`} x={55 + i * 260 + k * 100} y={-hgt + 60 + r * 170} width={70} height={110} fill={glass} stroke={INK} strokeWidth={4} />))}
                <Block x={40 + i * 260} y={-150} w={210} h={150} fill={shade(c, -0.3)} shadow={false} sw={4} />
              </g>
            );
          })}
        </g>
      )}
      {name}
      {water ? <rect x={-2400} y={-280} width={5900} height={340} fill={look.water} /> : null}
      <Block x={-2400} y={0} w={5900} h={64} fill={look.street} shadow={false} />
      {water ? null : [0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${car(i)} -60)`}>
          <Block x={0} y={0} w={190} h={56} fill={s.vehicle ?? look.accent} r={12} shadow={false} sw={5} />
          <Block x={40} y={-30} w={100} h={34} fill={s.vehicle ?? look.accent} r={10} shadow={false} sw={5} />
          <circle cx={40} cy={58} r={14} fill={INK} /><circle cx={150} cy={58} r={14} fill={INK} />
        </g>
      ))}
      {water ? [0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${car(i) * 0.5} ${-320})`}>
          <path d="M 0 0 L 260 0 L 220 50 L 30 50 Z" fill={s.vehicle ?? look.accent} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <Block x={70} y={-40} w={110} h={40} fill={look.paper} r={6} shadow={false} sw={4} />
        </g>
      )) : null}
    </g>
  );
};

// ------------------------------------------------------------------ underground

/** A cross-section tunnel: a lit box cut into the ground, a track or road, a sign with its depth, a vehicle that runs through on its word. */
export const Tunnel: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yb = w.Y(L.ft) + 150;
  const x0 = 90, x1 = 990, h = s.type === "utility" ? 240 : 320;
  const light = s.light ?? look.light;
  // the train pulls in on its word, stands at the platform while its line is said, and leaves before the
  // next layer (2026-11-21: one 2.4 s run-through left the tunnel empty in most frames, QA on Hampstead)
  const dir = s.dir ?? 1;
  const arrive = ramp(g, L.land - 6, L.land + 40);
  // `stay`: the train stays at the platform until the loop (a later beat still talks about this tunnel)
  const go = s.stay ? w.total - 40 : Math.max(L.land + 60, L.until - 26);
  const leave = ramp(g, go, go + 40);
  const ea = 1 - Math.pow(1 - arrive, 3), el = leave * leave;
  const STOP = -150;
  const tx = dir === 1 ? -1400 + (STOP + 1400) * ea + 1500 * el : 1100 - (1100 - STOP) * ea - 1500 * el;
  const id = `dive-tun-${Math.round(L.ft)}-${L.beat}`;
  const road = s.type === "road";
  return (
    <g>
      <clipPath id={id}><rect x={x0} y={yb - h} width={x1 - x0} height={h + 40} rx={26} /></clipPath>
      <rect x={x0 - 14} y={yb - h - 14} width={x1 - x0 + 28} height={h + 68} rx={34} fill={shade(look.deep, 0.08)} />
      <g clipPath={`url(#${id})`}>
        <rect x={x0} y={yb - h} width={x1 - x0} height={h + 40} fill={shade(light, -0.55)} />
        {[0, 1, 2, 3].map((i) => <Glow key={i} x={x0 + 110 + i * 240} y={yb - h + 30} r={120} color={light} o={0.55} />)}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={x0 + 70 + i * 240} y={yb - h + 18} width={80} height={10} fill="#fffbe6" />)}
        <rect x={x0} y={yb - 10} width={x1 - x0} height={50} fill="#3d3a44" />
        {road ? <line x1={x0} x2={x1} y1={yb + 14} y2={yb + 14} stroke="#ffd23f" strokeWidth={6} strokeDasharray="50 40" />
          : <rect x={x0} y={yb + 8} width={x1 - x0} height={6} fill="#a9a4b3" />}
        {s.type === "utility" ? (
          <g>
            {[0, 1, 2].map((i) => <Limb key={i} a={[x0, yb - 60 - i * 50]} b={[x1, yb - 60 - i * 50]} w={26} color={[s.color ?? "#3d8bfd", s.stripe ?? "#e8432f", "#9aa3b2"][i]!} sw={4} />)}
            <line x1={x0} x2={x1} y1={yb - 60} y2={yb - 60} stroke="#ffffff" strokeWidth={6} strokeDasharray="20 60" strokeDashoffset={-(g * 6) % 80} opacity={0.6} />
          </g>
        ) : <g transform={`translate(${tx} 0)`}><Train x={0} y={yb} color={s.color ?? "#c9ced8"} stripe={s.stripe ?? "#6d6e76"} bullet={s.bullets?.[0]} road={road} /></g>}
      </g>
      <rect x={x0} y={yb - h} width={x1 - x0} height={h + 40} rx={26} fill="none" stroke={INK} strokeWidth={STROKE} />
      <Sign x={240} y={yb - h + 52} text={s.label?.toUpperCase() ?? ""} depth={depthLabel(L, w)} bullets={s.bullets} accent={look.accent} k={ramp(g, L.land - 16, L.land) * outro(w, g)} />
      <Tally L={L} w={w} g={g} x={370} y={yb - h - 190} />
    </g>
  );
};

/** A room cut into the ground: secret (machines, lamp, blueprint), vault (safe, gold), bunker (bunks, crates), machine (machines, pipes). */
export const Chamber: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yb = w.Y(L.ft) + 160, x0 = 110, x1 = 970, h = 420;
  const type = s.type ?? "secret";
  const props = s.props ?? ({ secret: ["machines", "lamp", "blueprint"], vault: ["safe", "gold", "lamp"], bunker: ["bunks", "crates", "lamp"], machine: ["machines", "pipes"] } as Record<string, string[]>)[type] ?? ["machines"];
  const has = (k: string) => props.includes(k);
  const wallC = s.color ?? (type === "vault" ? "#3a3f52" : type === "bunker" ? "#4a4a3a" : "#2f3a34");
  const lamp = 0.5 + 0.5 * Math.sin(g * 0.3);
  const stampAt = L.at(s.stampOn), plansAt = L.at(s.plansOn);
  const stamp = ramp(g, stampAt, stampAt + 8) * outro(w, g);
  const plans = ramp(g, plansAt - 3, plansAt + 6) * outro(w, g);
  return (
    <g>
      <rect x={x0 - 14} y={yb - h - 14} width={x1 - x0 + 28} height={h + 40} rx={20} fill={shade(look.deep, 0.05)} />
      <rect x={x0} y={yb - h} width={x1 - x0} height={h + 12} rx={14} fill={wallC} stroke={INK} strokeWidth={STROKE} />
      {has("lamp") ? <><Glow x={840} y={yb - h + 60} r={200} color="#ff4b3a" o={0.25 + 0.35 * lamp} /><Ball x={840} y={yb - h + 50} r={24} fill={lamp > 0.5 ? "#ff5a4a" : "#a8352b"} shadow={false} /></> : null}
      {has("machines") ? [0, 1, 2].map((i) => (
        <g key={i}>
          <Block x={170 + i * 230} y={yb - 70} w={170} h={70} fill={shade(wallC, 0.25)} shadow="bottom" />
          <Ball x={255 + i * 230} y={yb - 160} r={92} fill={shade(wallC, 0.55)} />
          <Ball x={255 + i * 230} y={yb - 160} r={44} fill={shade(wallC, 0.1)} shadow={false} />
          <g transform={`rotate(${g * 7.3 + i * 40} ${255 + i * 230} ${yb - 160})`}><Limb a={[255 + i * 230 - 40, yb - 160]} b={[255 + i * 230 + 40, yb - 160]} w={12} color="#c9d6cc" sw={0} /></g>
        </g>
      )) : null}
      {has("pipes") ? [0, 1, 2].map((i) => <Limb key={i} a={[x0 + 10, yb - h + 150 + i * 40]} b={[x1 - 10, yb - h + 150 + i * 40]} w={18} color={["#c96a4a", "#9aa3b2", "#3d8bfd"][i]!} sw={4} />) : null}
      {has("safe") ? (
        <g>
          <Ball x={420} y={yb - 190} r={160} fill="#9aa3b2" />
          <Ball x={420} y={yb - 190} r={110} fill="#c9ced8" shadow={false} />
          <g transform={`rotate(${g * 2} 420 ${yb - 190})`}>{[0, 60, 120].map((a) => <g key={a} transform={`rotate(${a} 420 ${yb - 190})`}><Limb a={[330, yb - 190]} b={[510, yb - 190]} w={14} color="#5b6270" sw={3} /></g>)}</g>
        </g>
      ) : null}
      {has("gold") ? [0, 1, 2, 3, 4, 5].map((i) => <Block key={i} x={640 + (i % 3) * 90 - (i > 2 ? -45 : 0)} y={yb - 50 - (i > 2 ? 46 : 0)} w={84} h={44} fill="#f5c542" r={6} shadow="bottom" sw={4} />) : null}
      {has("crates") ? [0, 1, 2].map((i) => <Block key={i} x={600 + i * 110 - (i === 2 ? 55 : 0)} y={yb - (i === 2 ? 200 : 100)} w={100} h={100} fill="#b07a45" r={4} shadow="right" />) : null}
      {has("bunks") ? [0, 1].map((i) => <g key={i}><Block x={160} y={yb - 110 - i * 120} w={360} h={40} fill="#6b705c" shadow="bottom" /><Limb a={[170, yb]} b={[170, yb - 250]} w={10} color="#555" sw={3} /><Limb a={[510, yb]} b={[510, yb - 250]} w={10} color="#555" sw={3} /></g>) : null}
      {has("desk") ? <g><Block x={600} y={yb - 110} w={260} h={30} fill="#8a5a3a" shadow="bottom" /><Block x={620} y={yb - 80} w={20} h={80} fill="#6e4b35" shadow={false} sw={4} /><Block x={820} y={yb - 80} w={20} h={80} fill="#6e4b35" shadow={false} sw={4} /></g> : null}
      {s.stamp ? <Legible x={170} y={yb - h + 26} w={260} h={110} size={66}><Tag x={170} y={yb - h + 26} w={260} h={110} text={s.stamp} bg={look.accent} k={stamp} rot={-4} /></Legible> : null}
      {s.label ? <Sign x={240} y={yb - h - 150} w={600} text={s.label.toUpperCase()} depth={depthLabel(L, w)} accent={look.accent} k={ramp(g, L.land - 16, L.land) * outro(w, g)} /> : null}
      {!s.label && depthLabel(L, w) ? <Legible x={680} y={yb - h + 140} w={240} h={80} size={48}><Tag x={680} y={yb - h + 140} w={240} h={80} text={depthLabel(L, w)} bg={look.paper} k={ramp(g, L.land, L.land + 8) * outro(w, g)} rot={3} /></Legible> : null}
      {has("blueprint") && plans > 0 ? (
        // over the room's roof, or inside it when the room has a sign up there (it hid North End's depth, 2026-11-21)
        <g opacity={plans} transform={`${s.label ? "translate(-380 300) " : ""}rotate(6 760 ${yb - h - 60})`}>
          <Block x={600} y={yb - h - 170} w={330} h={220} fill="#2f6db3" r={6} shadow="bottom" />
          {[1, 2, 3, 4].map((k) => <line key={k} x1={600} x2={930} y1={yb - h - 170 + k * 44} y2={yb - h - 170 + k * 44} stroke="#5f97d6" strokeWidth={3} />)}
          <rect x={640} y={yb - h - 140} width={250} height={150} fill="none" stroke="#e8f2ff" strokeWidth={5} strokeDasharray="18 14" />
          <Legible x={715} y={yb - h - 125} w={100} h={120} size={110}><Txt x={765} y={yb - h - 65} size={110} fill="#ff5a4a" weight={900} stroke={INK}>?</Txt></Legible>
        </g>
      ) : null}
    </g>
  );
};

/** A big hall in the rock (a deep station, a reservoir hall): one or two levels, each with a train, and a sign. */
export const Cavern: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const x0 = 60, x1 = 1020;
  const levels = s.levels ?? 2;
  const yLow = w.Y(L.ft) + 150, yUp = yLow - 720;
  const top = (levels === 2 ? yUp : yLow) - 500, bot = yLow + 20;
  const trains = s.trains ?? ["#d23b3b", "#1f5fbf"];
  const rails = levels === 2 ? [yUp, yLow] : [yLow];
  return (
    <g>
      <rect x={x0 - 16} y={top - 16} width={x1 - x0 + 32} height={bot - top + 32} rx={60} fill={shade(look.deep, 0.05)} />
      <rect x={x0} y={top} width={x1 - x0} height={bot - top} rx={48} fill={s.color ?? "#30343f"} stroke={INK} strokeWidth={STROKE} />
      <path d={`M ${x0} ${top + 220} Q 540 ${top - 140} ${x1} ${top + 220}`} fill="none" stroke={shade(s.color ?? "#30343f", 0.3)} strokeWidth={14} />
      {[0, 1, 2, 3, 4].map((i) => <Glow key={i} x={150 + i * 195} y={top + 120} r={140} color={s.light ?? "#bfe3ff"} o={0.5} />)}
      {rails.map((yb, i) => (
        <g key={i}>
          <rect x={x0} y={yb - 10} width={x1 - x0} height={44} fill="#4a4f5e" />
          <g transform={`translate(${(i ? -1 : 1) * ((g * 4) % 400) - 200} 0)`}><Train x={0} y={yb} color={s.stripe ?? "#d6dbe4"} stripe={trains[i % trains.length]!} /></g>
        </g>
      ))}
      <Sign x={240} y={yLow - 270} text={s.label?.toUpperCase() ?? ""} depth={depthLabel(L, w)} bullets={s.bullets} accent={look.accent} k={ramp(g, L.land - 16, L.land) * outro(w, g)} />
    </g>
  );
};

/** Something running between two depths: an escalator, an elevator, stairs or a pipe, with riders. */
export const Shaft: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const y0 = w.Y(s.fromFt ?? 0) + 120, y1 = w.Y(s.toFt ?? L.ft) + 60;
  const right = (s.side ?? "right") === "right";
  const type = s.type ?? "escalator";
  const glowAt = L.at(s.glowOn);
  const glow = ramp(g, glowAt - 3, glowAt + 12);
  const r = rng(`riders-${L.beat}`);
  const riders = Array.from({ length: s.riders ?? 9 }, () => r());
  const colors = ["#e85d75", "#3d8bfd", "#2fbf71", look.accent];
  if (type === "elevator" || type === "pipe") {
    const x = right ? 1000 : 80;
    const u = 0.5 + 0.5 * Math.sin((g / w.total) * Math.PI * 2 * 2);
    return (
      <g>
        <Limb a={[x, y0]} b={[x, y1]} w={type === "pipe" ? 60 : 130} color={type === "pipe" ? (s.color ?? "#8a95a8") : "#2a2530"} sw={STROKE} />
        {type === "pipe"
          ? <line x1={x} x2={x} y1={y0} y2={y1} stroke={s.stripe ?? look.water} strokeWidth={24} strokeDasharray="40 50" strokeDashoffset={-((g * 8) % 90)} />
          : <Block x={x - 55} y={y0 + (y1 - y0 - 160) * u} w={110} h={160} fill={s.color ?? look.accent} r={10} shadow="right" />}
        {glow > 0 ? <Limb a={[x, y0]} b={[x, y1]} w={40} color={`rgba(255,196,61,${0.5 * glow})`} sw={0} /> : null}
      </g>
    );
  }
  const a: [number, number] = right ? [1010, y0] : [70, y0], b: [number, number] = right ? [300, y1] : [780, y1];
  return (
    <g>
      <Limb a={a} b={b} w={150} color="#2a2530" sw={0} />
      <Limb a={a} b={b} w={110} color={s.color ?? "#c9c2b4"} sw={STROKE} />
      {type === "stairs"
        ? Array.from({ length: 24 }, (_, i) => { const u = i / 24; return <line key={i} x1={a[0] + (b[0] - a[0]) * u - 50} x2={a[0] + (b[0] - a[0]) * u + 50} y1={a[1] + (b[1] - a[1]) * u} y2={a[1] + (b[1] - a[1]) * u} stroke={INK} strokeWidth={5} />; })
        : <Limb a={a} b={b} w={20} color={s.stripe ?? look.accent} sw={0} />}
      {glow > 0 ? <Limb a={a} b={b} w={40} color={`rgba(255,196,61,${0.6 * glow})`} sw={0} /> : null}
      {riders.map((ph, i) => {
        const u = (ph + (g / w.total) * 2) % 1;
        const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
        return <g key={i}><Ball x={x} y={y - 70} r={20} fill="#f2c9a0" shadow={false} sw={4} /><Block x={x - 18} y={y - 52} w={36} h={50} fill={colors[i % colors.length]!} r={10} shadow={false} sw={4} /></g>;
      })}
    </g>
  );
};

/** What holds a tower up: piles, a raft slab or caissons from the street to the layer's depth. */
export const Foundation: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yTop = 64, yBot = w.Y(L.ft) + 60;
  const type = s.type ?? "piles";
  const n = s.count ?? (type === "caissons" ? 3 : 7);
  const c = s.color ?? "#b9b4a8";
  const k = ramp(g, L.land - 10, L.land + 20) * outro(w, g);
  const yb = yTop + (yBot - yTop) * k;
  const near = useNear(yBot + 60);
  return (
    <g>
      {type === "raft" ? (
        // poured from the street down to its depth (it slid down from above the street before, 2026-11-21)
        k > 0 ? <Block x={140} y={yTop} w={800} h={Math.max(12, (Math.max(yBot, yTop + 160) - yTop) * k)} fill={c} shadow="bottom" /> : null
      ) : Array.from({ length: n }, (_, i) => {
        const x = 170 + (i * 740) / Math.max(1, n - 1);
        const wd = type === "caissons" ? 150 : 46;
        return <Block key={i} x={x - wd / 2} y={yTop} w={wd} h={Math.max(10, yb - yTop)} fill={c} r={type === "caissons" ? 20 : 4} shadow="right" sw={5} />;
      })}
      {depthLabel(L, w) && near > 0 ? <g opacity={near}><Legible x={330} y={yBot + 20} w={420} h={96} size={57}><Tag x={330} y={yBot + 20} w={420} h={96} text={depthLabel(L, w)} bg={look.paper} k={k} rot={-2} /></Legible></g> : null}
      {s.label && k > 0 ? <g opacity={k}><Legible x={140} y={yBot + 140} w={800} h={60} size={46}><Txt x={540} y={yBot + 170} size={46} fill={look.paper} weight={800}>{s.label.toUpperCase()}</Txt></Legible></g> : null}
    </g>
  );
};

/** Water in the section: a river or sea (waves on top, a bed below) or an aquifer (wet rock with droplets). */
export const Water: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const y0 = w.Y(L.ft) - 220, y1 = s.toFt !== undefined ? Math.max(y0 + 200, w.Y(s.toFt) + 200) : y0 + 440;
  const c = s.color ?? look.water;
  const r = rng(`water-${L.beat}`);
  const drops = Array.from({ length: 30 }, () => [r() * 1080, r(), 6 + r() * 10] as const);
  const aquifer = s.type === "aquifer";
  return (
    <g>
      <rect x={-2400} y={y0} width={5900} height={y1 - y0} fill={aquifer ? shade(c, -0.2) : c} opacity={aquifer ? 0.85 : 1} />
      {!aquifer ? [0, 1, 2].map((i) => <path key={i} transform={`translate(${((g * (2 + i)) % 160) - 160} 0)`} d={`M -2400 ${y0 + 30 + i * 50} ${Array.from({ length: 40 }, () => "q 40 -16 80 0 t 80 0").join(" ")}`} fill="none" stroke={shade(c, 0.35)} strokeWidth={6} opacity={0.7} />) : null}
      {/* an aquifer is water held in sand and gravel: draw the grains it soaks through */}
      {aquifer ? Array.from({ length: 70 }, (_, i) => { const gx = -200 + r() * 1480, gy = y0 + 20 + r() * (y1 - y0 - 40), gs = 14 + r() * 34; return <ellipse key={`g${i}`} cx={gx} cy={gy} rx={gs} ry={gs * 0.7} fill={i % 3 ? look.sand : look.gravel} stroke={INK} strokeWidth={4} opacity={0.9} />; }) : null}
      {drops.map(([x, ph, sz], i) => <circle key={i} cx={x} cy={y0 + ((ph + g / 90) % 1) * (y1 - y0)} r={sz} fill={shade(c, 0.5)} opacity={0.6} />)}
      {s.type === "sea" ? <rect x={-2400} y={y1 - 60} width={5900} height={60} fill={look.sand} stroke={INK} strokeWidth={STROKE} /> : null}
      <Sign x={240} y={y0 + 120} text={s.label?.toUpperCase() ?? ""} depth={depthLabel(L, w)} accent={look.accent} k={ramp(g, L.land - 16, L.land) * outro(w, g)} />
    </g>
  );
};

/** The payoff marker: a beacon at the deepest point with its words and depth, stamped in on its word. */
export const Deepest: React.FC<PieceProps> = ({ L, w, g }) => {
  const look = w.look;
  const y = w.Y(L.ft) + 210;
  const k = ramp(g, L.land - 2, L.land + 10) * outro(w, g);
  if (k <= 0) return null;
  const pulse = 0.5 + 0.5 * Math.sin(g * 0.25);
  return (
    <g>
      <Glow x={540} y={y} r={520 + 120 * pulse} color={look.accent} o={0.55 * k} ry={140} />
      <ellipse cx={540} cy={y} rx={460 * k} ry={60 * k} fill="none" stroke={look.accent} strokeWidth={14} />
      <Limb a={[900, y]} b={[900, y - 330]} w={12} color="#d6dbe4" sw={4} />
      <path d={`M 906 ${y - 330} L 1060 ${y - 290} L 906 ${y - 250} Z`} fill={look.accent} stroke={INK} strokeWidth={5} />
      <Legible x={250} y={y + 60} w={580} h={110} size={48}><Tag x={250} y={y + 60} w={580} h={110} text={`${(L.spec.text ?? "deepest point").toUpperCase()} · ${depthLabel(L, w)}`} size={48} bg={look.accent} k={k} rot={-2} /></Legible>
    </g>
  );
};

export const PIECES: Record<string, React.FC<PieceProps>> = { surface: Surface, tunnel: Tunnel, chamber: Chamber, cavern: Cavern, shaft: Shaft, foundation: Foundation, water: Water, deepest: Deepest };
