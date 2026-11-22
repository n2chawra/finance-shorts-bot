// Drawing (flat, night-grid sheet): the engineering drawings and diagrams, quick inserts between the 3D
// (lessons.md 6). `params.shot`:
//  split / design / trace / two-loads   the side elevation of one hanger: one long rod, the light running
//      down it, a nut under each beam with equal loads; `split` cuts it in two with a revision cloud
//  gauge / gauge-peak / held   a strength gauge against the code line (figures from params.fig.pct)
//  longrod / thread / shop     the fabricator's problem: a very long rod, a nut wound up its length, two rods
//  paths    the load path in both versions side by side; `turn` the night's load on both joints
//  rope     a general principle: two climbers on one rope, then the lower tied to the upper's harness
//  lightload  people on the walkways against what the code expected
//  sums     a calculation sheet over the joint
//  loop     today's change loop: shop → engineer → checked → shop
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Arrow, HonestyTag, MonoLabel, useDisasterLook } from "../../disaster/index";
import { DrawBox, DrawLine, Elev, Nut, ramp, Sheet, sm, Stamp, LB_Y, ROOF_Y, UB_Y, BEAM_H } from "./elev";
import { ClearOfBadge, evs } from "./ui";

type Params = { shot?: string; fig?: { pct?: string; peak?: string }; tag?: string };
type E = Record<string, number>;
/** The share a percent figure stands for (from params.fig.pct, never typed). */
const share = (p: Params) => (parseFloat(p.fig?.pct ?? "0") || 0) / 100;

/** A horizontal strength gauge: a bar filling to `value` (0..1 of the frame's scale), the code line at `code`. */
const Gauge: React.FC<{ x: number; y: number; w: number; k: number; value: number; code: number; label: string; text: string; t: number; codeAt: number; good?: boolean }> = ({ x, y, w, k, value, code, label, text, t, codeAt, good }) => {
  const L = useDisasterLook();
  const fill = value * k;
  const flash = t >= codeAt ? 0.6 + 0.4 * Math.abs(Math.sin((t - codeAt) / 4)) : 0.5;
  return (
    <g>
      <text x={x} y={y - 30} fontFamily={L.fonts.mono} fontWeight={700} fontSize={40} letterSpacing={4} fill={L.ink}>{label}</text>
      <rect x={x} y={y} width={w} height={80} rx={8} fill={L.panel} stroke={L.line} strokeWidth={3} />
      <rect x={x + 6} y={y + 6} width={Math.max(0, (w - 12) * fill)} height={68} rx={5} fill={good ? "#3ddc84" : fill > 0 ? "#ffb23e" : L.line} />
      <line x1={x + w * code} y1={y - 22} x2={x + w * code} y2={y + 102} stroke={L.fail} strokeWidth={7} opacity={flash} />
      <text x={x + w * code} y={y + 146} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={34} fill={L.fail}>CODE</text>
      {k > 0.95 && <text x={x + (w - 12) * fill - 10} y={y + 60} textAnchor="end" fontFamily={L.fonts.value} fontSize={56} fill="#0b1420">{text}</text>}
    </g>
  );
};

/** A hanging climber, outlined: a figure with a harness ring at `harness`; `grip` glows the hands. */
const Climber: React.FC<{ x: number; y: number; grip: number; hot?: number; s?: number }> = ({ x, y, grip, hot = 0, s = 1 }) => {
  const L = useDisasterLook();
  const c = hot > 0.5 ? L.fail : hot > 0 ? "#ffb23e" : L.ink;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={L.ink} strokeWidth={6} fill="none" strokeLinecap="round">
      <circle cx={0} cy={60} r={28} />
      <line x1={0} y1={88} x2={0} y2={200} />
      <line x1={0} y1={110} x2={-10} y2={0} /><line x1={0} y1={110} x2={10} y2={0} />
      <line x1={0} y1={200} x2={-34} y2={290} /><line x1={0} y1={200} x2={34} y2={290} />
      <circle cx={0} cy={170} r={14} stroke={L.label} />
      {grip > 0 && <circle cx={0} cy={0} r={22} fill={c} stroke="none" opacity={0.35 + 0.4 * grip} />}
    </g>
  );
};

const draw: Record<string, { names: string[]; zoom?: (t: number, e: E, end: number) => [number, number, number]; body: (t: number, e: E, p: Params) => React.ReactNode }> = {
  split: {
    names: ["change", "drawing", "doubled", "nobody"],
    zoom: (t, e) => [1 + 0.15 * ramp(t, e.doubled!, 20), 960, 540 - 40 * ramp(t, e.doubled!, 20)],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <Elev t={t} cx={760} split={ramp(t, e.change!, 16)} hot={ramp(t, e.doubled!, 10)} />
          {t >= e.drawing! && <ellipse cx={760} cy={UB_Y + 30} rx={130 * sm((t - e.drawing!) / 12)} ry={100 * sm((t - e.drawing!) / 12)} fill="none" stroke={L.label} strokeWidth={6} strokeDasharray="22 14" />}
          <Arrow x1={720} y1={UB_Y - 210} x2={720} y2={UB_Y + 40} k={ramp(t, e.doubled!, 10)} color={L.fail} w={18} />
          <rect x={1420} y={760} width={420} height={220} fill={L.panel} stroke={L.line} strokeWidth={3} />
          <MonoLabel x={1450} y={810} t={t} at={e.drawing} text="revision" size={36} />
          <MonoLabel x={1440} y={880} t={t} at={e.nobody} text="connection calcs [ ]" size={30} color={L.fail} />
          {t >= e.nobody! && <rect x={1440} y={840} width={360} height={60} fill="none" stroke={L.fail} strokeWidth={5} opacity={0.5 + 0.5 * Math.abs(Math.sin(t / 5))} />}
        </g>
      );
    },
  },
  design: {
    names: ["draw", "long", "both"],
    zoom: (t) => [1 + 0.0006 * t, 960, 520],
    body: (t, e) => (
      <g>
        <Elev t={t} cx={760} at={{ roof: e.draw!, upper: e.draw! + 8, lower: e.draw! + 16, rod: e.long!, nuts: e.both! }} labels={e.both! + 6} />
        <MonoLabel x={1300} y={160} t={t} at={e.draw} text="contract drawing" sub="the engineers' design" size={44} />
      </g>
    ),
  },
  trace: {
    names: ["roof", "fourth-floor", "straight", "second-floor"],
    zoom: (t, e) => [1.05 + 0.15 * ramp(t, e["second-floor"]!, 20), 760, 480 + 160 * ramp(t, e["second-floor"]!, 20)],
    body: (t, e) => {
      const L = useDisasterLook();
      const k = ramp(t, e.roof!, Math.max(20, e["second-floor"]! - e.roof!));
      const y = ROOF_Y + (LB_Y + BEAM_H + 30 - ROOF_Y) * k;
      return (
        <g>
          <Elev t={t} cx={760} rodColor={L.ok} />
          <DrawLine x1={760} y1={ROOF_Y} x2={760} y2={y} k={1} color={L.label} w={15} />
          <circle cx={760} cy={y} r={26} fill={L.label} opacity={0.9} />
          <MonoLabel x={1000} y={UB_Y + 40} t={t} at={e["fourth-floor"]} text="through the upper beam" size={38} />
          <MonoLabel x={1000} y={LB_Y + 40} t={t} at={e["second-floor"]} text="on to the lower beam" size={38} color={L.label} />
        </g>
      );
    },
  },
  "two-loads": {
    names: ["each", "nut", "carried"],
    zoom: (t, e) => [1.3 - 0.3 * ramp(t, e.carried!, 20), 640, 640],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <Elev t={t} cx={760} />
          <Arrow x1={600} y1={UB_Y - 200} x2={600} y2={UB_Y + 50} k={ramp(t, e.each!, 10)} color={L.label} w={12} />
          <Arrow x1={600} y1={LB_Y - 200} x2={600} y2={LB_Y + 50} k={ramp(t, e.nut!, 10)} color={L.label} w={12} />
          <MonoLabel x={1000} y={UB_Y + 40} t={t} at={e.carried} text="one walkway" size={44} color={L.label} />
          <MonoLabel x={1000} y={LB_Y + 40} t={t} at={e.carried! + 6} text="one walkway" size={44} color={L.label} />
        </g>
      );
    },
  },
  gauge: {
    names: ["safe", "investigators", "only", "strength", "code"],
    body: (t, e, p) => (
      <g>
        <g transform="translate(-260 0) scale(0.8) translate(240 120)"><Elev t={t} cx={760} /></g>
        <Gauge x={900} y={480} w={860} k={ramp(t, e.investigators!, Math.max(16, e.strength! - e.investigators!))} value={share(p) * 0.83} code={0.83} label="STRENGTH, ORIGINAL DESIGN" text={p.fig?.pct ?? ""} t={t} codeAt={e.code!} />
        <MonoLabel x={900} y={760} t={t} at={e.code} text="kansas city building code" size={34} />
        <MonoLabel x={900} y={360} t={t} at={e.only} text="original design · one rod" size={34} />
      </g>
    ),
  },
  "gauge-peak": {
    names: ["most", "joint", "code", "held"],
    body: (t, e, p) => {
      const L = useDisasterLook();
      return (
        <g>
          <Gauge x={360} y={460} w={1200} k={ramp(t, e.most!, 20)} value={share(p) * 0.83} code={0.83} label="LOAD ON THE NIGHT · SHARE OF A CODE JOINT" text={p.fig?.pct ?? ""} t={t} codeAt={e.code!} />
          {t >= e.held! && <rect x={366 + 1188 * share(p) * 0.83} y={466} width={Math.max(0, 1200 * 0.83 - 1188 * share(p) * 0.83) * ramp(t, e.held!, 12)} height={68} fill={L.fail} opacity={0.3} />}
          <MonoLabel x={360 + 1200 * 0.83} y={330} t={t} at={e.joint} text="a joint built to code" size={34} anchor="middle" color={L.fail} />
        </g>
      );
    },
  },
  held: {
    names: ["original", "short", "held"],
    body: (t, e, p) => {
      const L = useDisasterLook();
      return (
        <g>
          <g transform="translate(-300 20) scale(0.85) translate(200 0)"><Elev t={t} cx={760} rodColor={t >= e.held! ? "#3ddc84" : L.label} /></g>
          <Gauge x={940} y={360} w={820} k={ramp(t, e.short!, 16)} value={share(p) * 0.83} code={0.83} label="THE ORIGINAL DESIGN" text={p.fig?.pct ?? ""} t={t} codeAt={e.short! + 10} />
          <Gauge x={940} y={700} w={820} k={ramp(t, e.held!, 16)} value={((parseFloat(p.fig?.peak ?? "0") || 0) / 100) * 0.83} code={0.83} label="THAT NIGHT'S LOAD" text="" t={t} codeAt={1e9} good />
          <MonoLabel x={940} y={960} t={t} at={e.held! + 10} text="below code · but it holds" size={38} color="#3ddc84" />
        </g>
      );
    },
  },
  longrod: {
    names: ["fabricator", "rod", "problem"],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <rect x={80} y={600} width={1760} height={8} fill={L.line} opacity={0.4} />
          <DrawLine x1={140} y1={560} x2={1780} y2={560} k={ramp(t, e.rod!, 24)} color={t >= e.rod! + 10 ? L.label : L.ink} w={18} />
          <MonoLabel x={140} y={500} t={t} at={e.rod} text="one rod · roof to second floor" size={38} />
          {t >= e.problem! && <text x={960} y={480} textAnchor="middle" fontFamily={L.fonts.value} fontSize={200 * sm((t - e.problem!) / 8)} fill={L.label}>?</text>}
          <MonoLabel x={140} y={200} t={t} at={e.fabricator} text="the fabricator's shop" size={52} />
        </g>
      );
    },
  },
  thread: {
    names: ["nut", "halfway", "thread", "wound"],
    body: (t, e) => {
      const L = useDisasterLook();
      const k = ramp(t, e.wound!, 50);
      const nx = 160 + (960 - 160) * k;
      return (
        <g>
          <line x1={140} y1={560} x2={1780} y2={560} stroke={L.label} strokeWidth={18} strokeLinecap="round" />
          {t >= e.thread! && Array.from({ length: 60 }, (_, i) => {
            const x = 150 + i * 27; if ((x - 150) / 1630 > ramp(t, e.thread!, 24)) return null;
            return <line key={i} x1={x} y1={548} x2={x + 10} y2={572} stroke={L.bg[1]} strokeWidth={3} />;
          })}
          {t >= e.halfway! && <g><line x1={960} y1={480} x2={960} y2={640} stroke={L.fail} strokeWidth={5} strokeDasharray="12 8" /><MonoLabel x={960} y={460} t={t} at={e.halfway} text="the fourth floor" size={36} anchor="middle" color={L.fail} /></g>}
          {t >= e.nut! && <g transform={`translate(${nx} 560) rotate(90)`}><Nut x={0} y={-12} s={1.6} /></g>}
          {t >= e.wound! && <text x={960} y={800} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={44} fill={L.ink}>{"⟳ ".repeat(Math.min(12, Math.floor((t - e.wound!) / 3)))}</text>}
        </g>
      );
    },
  },
  shop: {
    names: ["two", "simpler", "roof", "second"],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <Elev t={t} cx={760} split={ramp(t, e.two!, 16)} />
          <MonoLabel x={1150} y={160} t={t} at={e.two} text="shop drawing" sub="the fabricator's version" size={44} />
          <MonoLabel x={1260} y={UB_Y - 90} t={t} at={e.roof} text="upper rod" sub="roof to the fourth floor" size={36} color={L.label} />
          <MonoLabel x={1260} y={LB_Y - 90} t={t} at={e.second} text="lower rod" sub="fourth floor to second" size={36} color={L.label} />
          {t >= e.simpler! && <text x={1700} y={330} fontFamily={L.fonts.value} fontSize={90} fill="#3ddc84" opacity={sm((t - e.simpler!) / 8)}>✓</text>}
        </g>
      );
    },
  },
  paths: {
    names: ["one", "roof", "two", "upper"],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <g transform="translate(20 40) scale(0.76)"><Elev t={t} cx={560} /></g>
          <g transform="translate(560 20) scale(0.8)"><Elev t={t} cx={960} split={1} hot={ramp(t, e.upper!, 10)} /></g>
          <DrawLine x1={446} y1={LB_Y * 0.76 + 40} x2={446} y2={ROOF_Y * 0.76 + 40} k={ramp(t, e.one!, 24)} color="#3ddc84" w={10} />
          <DrawLine x1={1364} y1={LB_Y * 0.8 + 20} x2={1364} y2={UB_Y * 0.8 + 50} k={ramp(t, e.two!, 18)} color={L.fail} w={10} />
          <MonoLabel x={160} y={860} t={t} at={e.one} text="one rod: to the roof" size={36} color="#3ddc84" />
          <MonoLabel x={1060} y={860} t={t} at={e.two} text="two rods: to the upper beam" size={36} color={L.fail} />
        </g>
      );
    },
  },
  rope: {
    names: ["climbers", "rope", "hands", "tie", "harness"],
    body: (t, e) => {
      const L = useDisasterLook();
      const k = ramp(t, e.tie!, 16);
      return (
        <g>
          <rect x={200} y={90} width={1520} height={30} fill={L.solid} stroke={L.line} strokeWidth={3} />
          {/* the rope: one line to the bottom climber before the tie; after, it ends at the upper's hands */}
          <line x1={960} y1={120} x2={960} y2={120 + 160 * Math.max(0.2, ramp(t, e.rope!, 8))} stroke={L.label} strokeWidth={8} />
          <line x1={960} y1={280} x2={960} y2={560} stroke={L.label} strokeWidth={8} opacity={1 - k} />
          {k > 0 && <path d={`M 960 450 Q ${1040} 520 960 ${560}`} stroke={L.fail} strokeWidth={8} fill="none" opacity={k} />}
          <Climber x={960} y={280} grip={ramp(t, e.hands!, 8)} hot={ramp(t, e.harness!, 10)} />
          <Climber x={960} y={560} grip={ramp(t, e.hands!, 8) * (1 - k)} />
          <MonoLabel x={1200} y={330} t={t} at={e.hands} text="holds itself" size={38} />
          <MonoLabel x={1200} y={400} t={t} at={e.harness} text="now holds both" size={38} color={L.fail} />
        </g>
      );
    },
  },
  lightload: {
    names: ["heavy", "code", "far"],
    body: (t, e) => {
      const L = useDisasterLook();
      const a = ramp(t, e.heavy!, 14), b = ramp(t, e.code!, 20);
      return (
        <g>
          <rect x={300} y={760} width={1320} height={10} fill={L.line} opacity={0.6} />
          <rect x={520} y={760 - 140 * a} width={260} height={140 * a} fill={L.label} />
          <rect x={1140} y={760 - 560 * b} width={260} height={560 * b} fill="none" stroke={L.ink} strokeWidth={6} strokeDasharray="20 12" />
          {t >= e.far! && <rect x={1140} y={200} width={260} height={420} fill={L.ok} opacity={0.18} />}
          <MonoLabel x={650} y={830} t={t} at={e.heavy} text="on the walkways" size={36} anchor="middle" />
          <MonoLabel x={1270} y={830} t={t} at={e.code} text="what the code expects" size={36} anchor="middle" />
        </g>
      );
    },
  },
  sums: {
    names: ["sums", "carrying", "night"],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <g transform="translate(-300 0)"><Elev t={t} cx={760} split={1} hot={ramp(t, e.carrying!, 10) * 0.6} /></g>
          <g opacity={ramp(t, e.sums!, 10)} transform={`translate(${(1 - ramp(t, e.sums!, 12)) * 300} 0)`}>
            <rect x={980} y={150} width={760} height={700} fill="#f1eee6" stroke={L.line} strokeWidth={3} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={1020} y1={230 + i * 50} x2={1020 + 200 + ((i * 97) % 400)} y2={230 + i * 50} stroke="#3a4656" strokeWidth={5} opacity={0.6} />)}
            <text x={1020} y={210} fontFamily={L.fonts.mono} fontWeight={700} fontSize={38} fill="#1b2533">LOAD ON THE CONNECTION</text>
          </g>
          <Arrow x1={460} y1={UB_Y - 240} x2={460} y2={UB_Y + 30} k={ramp(t, e.carrying!, 10)} color={L.label} w={14} />
          {t >= e.night! && <rect x={1020} y={700} width={680} height={80} fill="none" stroke={L.fail} strokeWidth={5} strokeDasharray="14 10" />}
        </g>
      );
    },
  },
  turn: {
    names: ["turn", "original", "joints", "survived"],
    body: (t, e) => {
      const L = useDisasterLook();
      const surv = t >= e.survived!;
      return (
        <g>
          {t >= e.turn! && <line x1={960} y1={60} x2={960} y2={60 + 960 * ramp(t, e.turn!, 14)} stroke={L.ink} strokeWidth={4} />}
          <g transform="translate(20 40) scale(0.76)" opacity={0.4 + 0.6 * ramp(t, e.original!, 10)}><Elev t={t} cx={560} rodColor={surv ? "#3ddc84" : undefined} /></g>
          <g transform="translate(560 20) scale(0.8)"><Elev t={t} cx={960} split={1} hot={surv ? 1 : ramp(t, e.joints!, 20) * 0.6} /></g>
          <Arrow x1={360} y1={120} x2={360} y2={UB_Y * 0.76 + 40} k={ramp(t, e.joints!, 12)} color={L.label} w={12} />
          <Arrow x1={1320} y1={120} x2={1320} y2={UB_Y * 0.8 + 20} k={ramp(t, e.joints!, 12)} color={L.label} w={12} />
          <MonoLabel x={160} y={860} t={t} at={e.original} text="the original design" size={36} />
          <MonoLabel x={1060} y={860} t={t} at={e.original! + 6} text="as built" size={36} />
          {surv && <text x={520} y={560} fontFamily={L.fonts.value} fontSize={170} fill="#3ddc84" opacity={sm((t - e.survived!) / 6)}>✓</text>}
          {surv && <text x={1560} y={560} fontFamily={L.fonts.value} fontSize={170} fill={L.fail} opacity={0.5 + 0.5 * Math.abs(Math.sin((t - e.survived!) / 4))}>✗</text>}
        </g>
      );
    },
  },
  loop: {
    names: ["change", "engineer", "checked", "built"],
    body: (t, e) => {
      const L = useDisasterLook();
      const node = (x: number, y: number, at: number, text: string) => (
        <g opacity={ramp(t, at - 4, 10)}>
          <rect x={x - 230} y={y - 70} width={460} height={140} rx={14} fill={L.panel} stroke={L.line} strokeWidth={4} />
          <text x={x} y={y + 16} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={40} fill={L.ink}>{text}</text>
        </g>
      );
      return (
        <g>
          {node(480, 260, 4, "FABRICATOR")}
          {node(1440, 260, e.engineer!, "ENGINEER OF RECORD")}
          {node(1440, 680, 10, "CALCULATED")}
          {node(480, 680, 14, "BUILT")}
          <Arrow x1={720} y1={260} x2={1200} y2={260} k={ramp(t, e.change!, 14)} color={L.label} w={10} />
          <Arrow x1={1440} y1={340} x2={1440} y2={600} k={ramp(t, e.checked! - 10, 14)} color={L.label} w={10} />
          <Arrow x1={1200} y1={680} x2={720} y2={680} k={ramp(t, e.built!, 14)} color={L.label} w={10} />
          <MonoLabel x={960} y={220} t={t} at={e.change} text="a change · in writing" size={32} anchor="middle" />
          <Stamp x={1440} y={480} t={t} at={e.checked!} text="CHECKED" color="#3ddc84" size={64} />
        </g>
      );
    },
  },
};

const Drawing: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const params = p.beat.params as Params;
  const d = draw[params.shot ?? "design"] ?? draw.design!;
  const e = evs(m, d.names);
  const [zoom, cx, cy0] = d.zoom ? d.zoom(t, e, m.end) : [1 + 0.0004 * t, 960, 540];
  const cy = cy0 + 70;   // the drawing sits higher, clear of the captions
  return (
    <Sheet t={t} zoom={zoom} cx={cx} cy={cy} html={params.tag === "principle" ? <ClearOfBadge><HonestyTag t={t} tag="principle" at={0} /></ClearOfBadge> : undefined}>
      {d.body(t, e, params)}
    </Sheet>
  );
};

export default Drawing;
