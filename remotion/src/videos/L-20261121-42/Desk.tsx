// Desk (flat/doc, top-down over desks under a lamp): the offices where the chain of decisions happened, and
// the investigators' and the board's tables. Every paper, stamp and phone lands on a spoken word.
// `params.shot`: phone-ring, call, never, who, detailer, assumed, review, seal, office, evidence, licences,
// gap, policy. "As reported" items carry the honesty tag.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { DisasterLookProvider, HonestyTag, Texture, useDisasterLook } from "../../disaster/index";
import { Phone, ramp, sm, Stamp } from "./elev";
import { ClearOfBadge, evs } from "./ui";

type Params = { shot?: string; fig?: Record<string, string> };
type E = Record<string, number>;
const W = 1920, H = 1080;
const MONO = "'Courier Prime', 'Courier New', monospace";

/** The desk: wood grain, a lamp pool, vignette; the camera zooms about (cx, cy), at most 1.3. */
const DeskStage: React.FC<{ t: number; zoom: number; cx: number; cy: number; lamp?: [number, number]; children: React.ReactNode; html?: React.ReactNode; wood?: string }> = ({ t, zoom, cx, cy, lamp = [960, 480], children, html, wood = "#3b2618" }) => (
  <DisasterLookProvider value="night-grid">
    <AbsoluteFill style={{ background: wood }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="lamp" cx={lamp[0] / W} cy={lamp[1] / H} r="0.62">
            <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.42" />
            <stop offset="0.55" stopColor="#ffb46a" stopOpacity="0.08" />
            <stop offset="1" stopColor="#000" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${Math.min(1.3, zoom * (1.012 + 0.012 * Math.sin(t / 70)))}) translate(${-cx - 18 * Math.sin(t / 55)} ${-cy - 10 * Math.sin(t / 80 + 1)})`}>
          {Array.from({ length: 120 }, (_, i) => (
            <path key={i} d={`M -400 ${i * 16 - 300} C 400 ${i * 16 - 280 + (i % 5) * 9}, 1400 ${i * 16 - 318 + (i % 7) * 5}, 2400 ${i * 16 - 300}`} stroke={i % 3 ? "#000" : "#c99a64"} strokeOpacity={i % 3 ? 0.22 + (i % 4) * 0.06 : 0.16} strokeWidth={2 + (i % 4)} fill="none" />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse key={`k${i}`} cx={(i * 397) % 2200 - 140} cy={(i * 263) % 1500 - 200} rx={40 + (i % 3) * 18} ry={12 + (i % 2) * 6} fill="none" stroke="#1a0f08" strokeOpacity={0.35} strokeWidth={4} />
          ))}
          <DeskThings />
          {children}
        </g>
        <rect width={W} height={H} fill="url(#lamp)" />
      </svg>
      <ClearOfBadge>{html}</ClearOfBadge>
      <Texture t={t} />
    </AbsoluteFill>
  </DisasterLookProvider>
);

/** What sits on an engineer's desk round the edges of every desk shot: a mug, pencils, a scale rule, a
 * calculator, a paper stack, a rolled drawing, clips. Drawn under the shot's own papers. */
const DeskThings: React.FC = () => (
  <g>
    <g transform="translate(170 170)"><circle r={92} fill="#e8e2d6" /><circle r={74} fill="#3a2414" /><circle r={74} fill="none" stroke="#c9b9a0" strokeWidth={6} /><rect x={86} y={-24} width={46} height={48} rx={20} fill="none" stroke="#e8e2d6" strokeWidth={16} /></g>
    <circle cx={420} cy={110} r={70} fill="none" stroke="#24150b" strokeOpacity={0.5} strokeWidth={8} />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${1560 + i * 26} ${90 + i * 18}) rotate(${-8 + i * 7})`}><rect width={300} height={22} fill={["#f2c230", "#e8e2d6", "#c0392b"][i]} /><polygon points="300,0 340,11 300,22" fill="#e8cfa0" /><polygon points="328,7 340,11 328,15" fill="#222" /></g>)}
    <g transform="translate(1720 420)"><rect width={190} height={290} rx={18} fill="#2a2c31" stroke="#111" strokeWidth={4} /><rect x={20} y={20} width={150} height={60} fill="#9fb28a" />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={22 + (i % 4) * 38} y={100 + Math.floor(i / 4) * 44} width={30} height={34} rx={5} fill={i % 4 === 3 ? "#c0392b" : "#55585f"} />)}</g>
    <g transform="translate(40 420)">{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={i * 4} y={i * -6} width={250} height={330} fill={i % 2 ? "#ece6d8" : "#f4efe4"} stroke="#9a9080" strokeWidth={2} transform={`rotate(${-3 + i} 125 165)`} />)}
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={40} y1={70 + i * 30} x2={210 - (i % 3) * 30} y2={70 + i * 30} stroke="#4a5666" strokeWidth={4} opacity={0.4} />)}</g>
    <g transform="translate(1380 930) rotate(-4)"><rect width={520} height={70} fill="#e9e4d2" stroke="#8a8270" strokeWidth={3} />{Array.from({ length: 40 }, (_, i) => <line key={i} x1={10 + i * 12.5} y1={0} x2={10 + i * 12.5} y2={i % 5 ? 18 : 34} stroke="#333" strokeWidth={2} />)}</g>
    <g transform="translate(60 900) rotate(6)"><rect width={560} height={90} rx={45} fill="#cfe0f4" /><ellipse cx={560} cy={45} rx={22} ry={45} fill="#a9c2de" /><line x1={40} y1={20} x2={520} y2={20} stroke="#7d9cc0" strokeWidth={4} /></g>
    {[[700, 70], [1240, 990], [1880, 300]].map(([x, y], i) => <path key={i} d={`M ${x} ${y} l 0 -30 a 12 12 0 0 1 24 0 l 0 44 a 8 8 0 0 1 -16 0 l 0 -36`} fill="none" stroke="#c9ccd2" strokeWidth={4} />)}
  </g>
);

/** A sheet of paper with ruled lines and an optional title, sliding in from `from` at `at`. */
const Paper: React.FC<{ t: number; at: number; x: number; y: number; w: number; h: number; title?: string; rot?: number; from?: [number, number]; lines?: number; tint?: string; children?: React.ReactNode }> = ({
  t, at, x, y, w, h, title, rot = 0, from = [0, 500], lines = 10, tint = "#f1ede2", children,
}) => {
  const k = sm((t - at) / 12);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x + from[0] * (1 - k)} ${y + from[1] * (1 - k)}) rotate(${rot})`}>
      <rect x={6} y={10} width={w} height={h} fill="#000" opacity={0.35} />
      <rect width={w} height={h} fill={tint} />
      {title && <text x={28} y={58} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#1b2533">{title}</text>}
      {Array.from({ length: lines }, (_, i) => <line key={i} x1={28} y1={100 + i * ((h - 130) / lines)} x2={28 + (w - 56) * (0.5 + 0.5 * ((i * 37) % 10) / 10)} y2={100 + i * ((h - 130) / lines)} stroke="#4a5666" strokeWidth={4} opacity={0.35} />)}
      {children}
    </g>
  );
};

/** A drawing of the hanger joint on paper (the shop drawing's detail): two beams, rods, nuts. */
const JointSketch: React.FC<{ x: number; y: number; s?: number; two?: boolean; blank?: boolean; color?: string }> = ({ x, y, s = 1, two = true, blank, color = "#1d3f8f" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={4} fill="none">
    <rect x={-120} y={-30} width={240} height={50} />
    <rect x={-120} y={170} width={240} height={50} />
    <line x1={two ? -14 : 0} y1={-160} x2={two ? -14 : 0} y2={two ? 40 : 240} strokeWidth={7} />
    {two && <line x1={14} y1={-50} x2={14} y2={240} strokeWidth={7} />}
    {blank ? <circle cx={0} cy={22} r={70} strokeDasharray="12 10" stroke="#c0392b" /> : <rect x={-30} y={20} width={60} height={14} fill={color} />}
  </g>
);

const LicenceCard: React.FC<{ t: number; at: number; x: number; y: number; rot: number; stampAt: number }> = ({ t, at, x, y, rot, stampAt }) => {
  const L = useDisasterLook();
  const k = sm((t - at) / 10);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 400}) rotate(${rot})`}>
      <rect x={6} y={10} width={520} height={320} rx={12} fill="#000" opacity={0.35} />
      <rect width={520} height={320} rx={12} fill="#efe6cf" stroke="#9a8a64" strokeWidth={4} />
      <text x={30} y={60} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#3a3326">STATE OF MISSOURI</text>
      <text x={30} y={104} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#3a3326">PROFESSIONAL ENGINEER</text>
      <rect x={30} y={140} width={120} height={150} fill="#cfc4a6" />
      {[0, 1, 2].map((i) => <line key={i} x1={180} y1={170 + i * 44} x2={480 - i * 60} y2={170 + i * 44} stroke="#7a6a48" strokeWidth={6} opacity={0.5} />)}
      <Stamp x={300} y={200} t={t} at={stampAt} text="REVOKED" color={L.fail} size={70} />
    </g>
  );
};

type Shot = { names: string[]; cam: (t: number, e: E, end: number) => [number, number, number]; body: (t: number, e: E, p: Params) => React.ReactNode; html?: (t: number, e: E) => React.ReactNode; lamp?: [number, number] };

const S: Record<string, Shot> = {
  "phone-ring": {
    names: ["drawing", "construction", "question"],
    cam: (t, e) => [1 + 0.2 * ramp(t, e.question!, 30), 960, 540 + 40 * ramp(t, e.question!, 30)],
    body: (t, e) => (
      <g>
        <Paper t={t} at={-20} x={360} y={200} w={720} h={560} title="CONTRACT DRAWING · WALKWAY HANGER" rot={-4} lines={2}>
          <JointSketch x={360} y={330} two={false} />
        </Paper>
        <Paper t={t} at={e.construction!} x={1180} y={180} w={460} h={340} rot={6} tint="#d8d2c2" title="SITE · STEEL GOING UP" lines={0}>
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={40 + i * 60} y1={300} x2={40 + i * 60} y2={110} stroke="#4a5666" strokeWidth={6} />)}
          <line x1={30} y1={130} x2={430} y2={130} stroke="#4a5666" strokeWidth={8} />
        </Paper>
        <Phone x={1360} y={760} t={t} k={1} ring={e.question} s={1.6} />
      </g>
    ),
  },
  call: {
    names: ["reported", "fabricator", "telephone", "agreed", "written"],
    cam: (t, e) => [1.05 + 0.1 * ramp(t, e.telephone!, 20), 900, 520],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <Paper t={t} at={-20} x={260} y={240} w={640} h={520} title="SHOP DRAWING · TWO RODS" rot={-3} lines={2}><JointSketch x={320} y={300} two /></Paper>
          <Phone x={1200} y={460} t={t} k={1} ring={e.telephone} s={1.7} />
          {t >= e.fabricator! && <g transform={`translate(300 ${170 - (1 - sm((t - e.fabricator!) / 8)) * 120}) rotate(-3)`}><rect width={330} height={64} fill="#ffd84a" /><text x={18} y={44} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#1b2533">FABRICATOR</text></g>}
          {t >= e.agreed! && (
            <g transform={`translate(1060 ${640 + (1 - sm((t - e.agreed!) / 10)) * 300}) rotate(-5)`}>
              <rect width={300} height={180} fill="#ffe680" /><text x={30} y={100} fontFamily={MONO} fontWeight={700} fontSize={64} fill="#2a2a2a">OK ✓</text>
            </g>
          )}
          <Paper t={t} at={e.written!} x={1460} y={560} w={380} h={420} title="REQUEST FORM" rot={4} lines={6} />
          {t >= e.written! + 14 && <text x={1650} y={860} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={L.fail} transform="rotate(4 1650 860)">BLANK</text>}
        </g>
      );
    },
    html: (t, e) => <HonestyTag t={t} tag="reported" at={e.reported} />,
  },
  never: {
    names: ["written", "never"],
    html: (t) => <HonestyTag t={t} tag="reported" at={0} />,
    cam: (t) => [1.15 + 0.0008 * t, 960, 560],
    body: (t, e) => {
      const L = useDisasterLook();
      const day = Math.max(0, Math.floor((t - e.never!) / 5));
      return (
        <g>
          <g transform="translate(420 300)">
            <rect x={6} y={10} width={560} height={420} fill="#000" opacity={0.35} />
            <rect width={560} height={420} fill="#5a5a5e" stroke="#2a2a2e" strokeWidth={8} />
            <rect x={30} y={30} width={500} height={360} fill="#3a3a3e" />
            <text x={280} y={230} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill="#c9c9cc">IN</text>
            {t >= e.never! + 10 && <text x={280} y={300} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={L.fail}>EMPTY</text>}
          </g>
          <g transform="translate(1180 300)">
            <rect x={6} y={10} width={360} height={420} fill="#000" opacity={0.35} />
            <rect width={360} height={420} fill="#f1ede2" />
            <rect width={360} height={90} fill={L.fail} />
            <text x={180} y={62} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill="#fff">DAYS PASS</text>
            {Array.from({ length: 28 }, (_, i) => (
              <rect key={i} x={20 + (i % 7) * 47} y={120 + Math.floor(i / 7) * 70} width={38} height={50} fill={i < day ? "#c0392b" : "#d8d2c2"} opacity={i < day ? 0.75 : 1} />
            ))}
          </g>
        </g>
      );
    },
  },
  who: {
    names: ["who", "calculated", "nobody"],
    cam: (t, e) => [1 + 0.25 * ramp(t, e.calculated!, 30), 960 + 300 * ramp(t, e.calculated!, 30), 540 + 200 * ramp(t, e.calculated!, 30)],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          {[0, 1, 2, 3].map((i) => <Paper key={i} t={t} at={e.who! + i * 3} x={420 + i * 14} y={150 + i * 10} w={1000} h={700} rot={-2 + i} lines={3} title={i === 3 ? "SHOP DRAWINGS · ATRIUM WALKWAYS" : undefined}>{i === 3 ? <JointSketch x={420} y={350} two s={1.1} /> : null}</Paper>)}
          {t >= e.calculated! && (
            <g transform="translate(1100 700)">
              <rect width={360} height={160} fill="#f8f5ec" stroke="#1b2533" strokeWidth={4} />
              <text x={24} y={60} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#1b2533">CONNECTION CALCS</text>
              <rect x={24} y={86} width={310} height={50} fill="none" stroke={t >= e.nobody! ? L.fail : "#1b2533"} strokeWidth={t >= e.nobody! ? 7 : 3} />
            </g>
          )}
        </g>
      );
    },
  },
  detailer: {
    names: ["busy", "passed", "detailer"],
    cam: (t, e) => [1.1, 700 + 460 * ramp(t, e.passed!, 30), 560],
    lamp: [960, 500],
    body: (t, e) => (
      <g>
        {Array.from({ length: 9 }, (_, i) => i / 9 < ramp(t, e.busy!, 24) ? (
          <rect key={i} x={360 + (i % 2) * 8} y={760 - i * 46} width={420} height={40} fill={["#c9a25a", "#b28a4a", "#d8b56a"][i % 3]} stroke="#3a2a14" strokeWidth={3} />
        ) : null)}
        <text x={570} y={860} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill="#f4f8ff" opacity={1 - ramp(t, e.passed!, 10)}>FABRICATOR · JOB FOLDERS</text>
        <Paper t={t} at={e.passed!} x={1300} y={300} w={560} h={420} rot={3} from={[-900, 0]} title="SHOP DRAWINGS" lines={4} />
        {t >= e.detailer! && <g transform="translate(1340 760) rotate(-4)"><rect width={480} height={70} fill="#ffd84a" /><text x={20} y={48} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#1b2533">OUTSIDE DETAILER</text></g>}
      </g>
    ),
  },
  assumed: {
    names: ["reported", "believed", "designed", "calculations"],
    cam: (t, e) => [1.05 + 0.1 * ramp(t, e.calculations!, 20), 960, 540],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <Paper t={t} at={-20} x={300} y={200} w={720} h={600} title="SHOP DRAWING · DETAIL" rot={-2} lines={1}><JointSketch x={360} y={330} two s={1.1} /></Paper>
          {t >= e.believed! && <g transform={`translate(700 ${240 + (1 - sm((t - e.believed!) / 8)) * -200}) rotate(5)`}><rect width={330} height={190} fill="#ffe680" /><text x={22} y={80} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#2a2a2a">ALREADY</text><text x={22} y={130} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#2a2a2a">DESIGNED?</text>{t >= e.designed! && <text x={230} y={130} fontFamily={MONO} fontWeight={700} fontSize={60} fill="#2e8b57">✓</text>}</g>}
          <Paper t={t} at={e.reported! + 6} x={1160} y={260} w={520} h={620} title="CALCULATIONS" lines={0} tint="#eef2e6">
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={20} y1={110 + i * 40} x2={500} y2={110 + i * 40} stroke="#9ab" strokeWidth={2} />)}
            {t >= e.calculations! && <line x1={40} y1={580} x2={480} y2={100} stroke={L.fail} strokeWidth={10} opacity={sm((t - e.calculations!) / 8)} />}
          </Paper>
        </g>
      );
    },
    html: (t, e) => <HonestyTag t={t} tag="reported" at={e.reported} />,
  },
  review: {
    names: ["office", "technician", "detailed", "calculated"],
    cam: (t, e) => [1 + 0.08 * ramp(t, e.detailed!, 24), 960, 520],
    body: (t, e) => {
      const L = useDisasterLook();
      return (
        <g>
          <Paper t={t} at={e.office! - 6} x={260} y={180} w={880} h={680} title="SHOP DRAWINGS · RETURNED FOR APPROVAL" rot={-2} lines={2}>
            <JointSketch x={440} y={380} two blank={t >= e.detailed!} s={1.15} />
          </Paper>
          <Paper t={t} at={e.technician!} x={1240} y={220} w={500} h={620} title="REVIEW CHECKLIST" lines={0} tint="#f8f5ec">
            {["DIMENSIONS", "MEMBER SIZES", "MATERIALS", "CONNECTIONS"].map((s, i) => (
              <g key={s} transform={`translate(30 ${140 + i * 110})`}>
                <rect width={50} height={50} fill="none" stroke="#1b2533" strokeWidth={4} />
                {i < 3 && t >= e.technician! + 10 + i * 6 && <text x={6} y={44} fontFamily={MONO} fontSize={52} fill="#2e8b57">✓</text>}
                {i === 3 && t >= e.calculated! && <rect width={50} height={50} fill="none" stroke={L.fail} strokeWidth={8} />}
                <text x={76} y={38} fontFamily={MONO} fontWeight={700} fontSize={32} fill={i === 3 && t >= e.calculated! ? L.fail : "#1b2533"}>{s}</text>
              </g>
            ))}
          </Paper>
        </g>
      );
    },
  },
  seal: {
    names: ["spot", "seal"],
    cam: (t, e) => [1.04 + 0.08 * ramp(t, e.seal!, 16), 960 + 80 * ramp(t, e.seal!, 16), 540],
    body: (t, e) => {
      const k = sm((t - e.seal!) / 5);
      return (
        <g>
          <Paper t={t} at={-20} x={300} y={140} w={1300} h={660} title="SHOP DRAWINGS · ATRIUM WALKWAYS" rot={-1} lines={4}>
            {[[300, 300], [720, 420], [980, 260]].map(([x, y], i) => t >= e.spot! + i * 6 ? <text key={i} x={x} y={y} fontFamily={MONO} fontSize={60} fill="#c0392b">✓</text> : null)}
            <rect x={860} y={440} width={400} height={180} fill="none" stroke="#1b2533" strokeWidth={4} />
          </Paper>
          {t >= e.seal! - 10 && (
            <g transform={`translate(1360 ${670 - 300 * (1 - k)})`} opacity={Math.min(1, (t - e.seal! + 10) / 6)}>
              {k >= 1 && <circle r={110} fill="none" stroke="#7a1f1f" strokeWidth={10} opacity={0.85} />}
              {k >= 1 && <circle r={80} fill="none" stroke="#7a1f1f" strokeWidth={4} opacity={0.85} />}
              {k >= 1 && <text y={12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill="#7a1f1f">P.E. SEAL</text>}
              {k < 1 && <rect x={-90} y={-200} width={180} height={160} rx={20} fill="#2a2a2e" />}
            </g>
          )}
        </g>
      );
    },
  },
  office: {
    names: ["happen", "associate", "several"],
    cam: (t) => [Math.max(1, 1.2 - 0.0012 * t), 960, 520],
    lamp: [960, 300],
    body: (t, e, p) => {
      const L = useDisasterLook();
      return (
        <g>
          {Array.from({ length: 10 }, (_, i) => {
            const x = 260 + (i % 5) * 340, y = 380 + Math.floor(i / 5) * 330;
            const lit = t >= e.associate! + i * 2;
            const files = Math.min(6, Math.max(0, Math.floor((t - e.several!) / 3) - (i % 3)));
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect x={-130} y={-80} width={260} height={160} fill="#5a3a22" stroke="#2a1a0e" strokeWidth={4} />
                {lit && <circle cx={90} cy={-50} r={60} fill="#ffd9a0" opacity={0.25} />}
                <circle cx={90} cy={-50} r={18} fill={lit ? "#ffe6b0" : "#3a3a3e"} />
                {Array.from({ length: files }, (_, f) => <rect key={f} x={-100 + f * 4} y={-30 - f * 14} width={130} height={12} fill={["#c9a25a", "#e8e2d2", "#b28a4a"][f % 3]} />)}
                <rect x={-120} y={34} width={240} height={40} fill="#efe6cf" />
                <text x={0} y={64} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill="#1b2533">ENGINEER</text>
                {files > 0 && <text x={-30} y={-40 - files * 14} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill="#ffd84a">PROJECTS</text>}
              </g>
            );
          })}
          {t >= e.associate! && (
            <g transform="translate(760 70)">
              <rect width={400} height={170} fill={L.panel} stroke={L.line} strokeWidth={3} />
              <text x={200} y={56} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={L.ink}>ASSOCIATES, ABOUT</text>
              <text x={200} y={146} textAnchor="middle" fontFamily={L.fonts.value} fontSize={84} fill={L.label}>{p.fig?.assoc ?? ""}</text>
            </g>
          )}
        </g>
      );
    },
  },
  evidence: {
    names: ["investigators", "question", "change", "weak"],
    cam: (t, e) => [1 + 0.1 * ramp(t, e.weak!, 20), 960, 540],
    lamp: [960, 520],
    body: (t, e) => (
      <g>
        {t >= e.investigators! && (
          <g transform={`translate(780 ${380 + (1 - sm((t - e.investigators!) / 10)) * 300}) rotate(${t >= e.question! ? Math.sin((t - e.question!) / 4) * 4 * Math.exp(-(t - e.question!) / 30) : 0} 180 0)`}>
            <rect x={6} y={10} width={360} height={420} fill="#000" opacity={0.3} />
            <rect width={360} height={420} fill="rgba(220,230,240,0.55)" stroke="#e8eef4" strokeWidth={4} />
            <rect x={-20} width={420} height={60} fill="#c0392b" /><text x={0} y={42} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#fff">EVIDENCE · THE JOINT</text>
            {Array.from({ length: 6 }, (_, k) => <line key={k} x1={30} y1={90 + k * 20} x2={330 - k * 30} y2={90 + k * 20} stroke="#33404e" strokeWidth={5} opacity={0.6} />)}
            <ellipse cx={180} cy={250} rx={90} ry={40} fill="none" stroke="#9aa3ad" strokeWidth={14} transform="rotate(-12 180 250)" />
            <polygon points="150,300 210,300 230,335 210,370 150,370 130,335" fill="#6b737c" transform="rotate(20 180 335)" />
          </g>
        )}
        <Paper t={t} at={e.change!} x={1220} y={260} w={520} h={560} title="AS BUILT" from={[600, 0]} lines={1}><JointSketch x={260} y={300} two /></Paper>
        <Paper t={t} at={e.weak!} x={180} y={260} w={520} h={560} title="AS DESIGNED" from={[-600, 0]} lines={1}><JointSketch x={260} y={300} two={false} /></Paper>
        {t >= e.weak! + 12 && <text x={960} y={960} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={120} fill="#ffd84a">?</text>}
      </g>
    ),
  },
  licences: {
    names: ["missouri", "revoked", "engineers", "negligence"],
    cam: (t, e) => [1 + 0.1 * ramp(t, e.revoked!, 20), 960, 520],
    body: (t, e, p) => (
      <g>
        <Paper t={t} at={e.negligence!} x={620} y={600} w={700} h={270} title="BOARD RULING" lines={0}><text x={28} y={130} fontFamily={MONO} fontWeight={700} fontSize={36} fill="#c0392b">GROSS NEGLIGENCE</text><text x={28} y={190} fontFamily={MONO} fontWeight={700} fontSize={36} fill="#c0392b">AND MISCONDUCT</text></Paper>
        <LicenceCard t={t} at={e.missouri!} x={360} y={160} rot={-6} stampAt={e.revoked!} />
        <LicenceCard t={t} at={e.missouri! + 6} x={1040} y={180} rot={5} stampAt={e.engineers!} />
      </g>
    ),
  },
  gap: {
    names: ["argued", "connections", "joint"],
    cam: (t) => [1 + 0.0004 * t, 960, 540],
    lamp: [960, 540],
    body: (t, e) => (
      <g>
        {[[200, "ENGINEER OF RECORD"], [1260, "FABRICATOR"]].map(([x, label]) => (
          <g key={label as string} transform={`translate(${x as number} 300)`} opacity={sm((t - e.argued!) / 10)}>
            <rect width={460} height={420} fill="#5a3a22" stroke="#2a1a0e" strokeWidth={6} />
            {[0, 1, 2].map((k) => <g key={k} transform={`translate(${30 + k * 120} ${40 + (k % 2) * 30}) rotate(${k * 5 - 5})`}><rect width={150} height={200} fill="#f1ede2" />{[0, 1, 2, 3, 4].map((j) => <line key={j} x1={14} y1={30 + j * 32} x2={130 - (j % 2) * 30} y2={30 + j * 32} stroke="#4a5666" strokeWidth={4} opacity={0.45} />)}</g>)}
            <circle cx={380} cy={330} r={50} fill="#2a2c31" /><circle cx={380} cy={330} r={30} fill="#ffe6b0" opacity={0.8} />
            <rect x={40} y={300} width={220} height={80} rx={10} fill="#2a2c31" />{[0, 1, 2, 3, 4, 5, 6, 7].map((j) => <rect key={j} x={52 + j * 25} y={316} width={18} height={18} fill="#55585f" />)}
            <text x={230} y={470} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill="#f4f8ff">{label as string}</text>
          </g>
        ))}
        {t >= e.connections! && (
          <g transform={`translate(${720 + (1 - sm((t - e.connections!) / 14)) * -400} 340)`}>
            <rect width={480} height={340} fill="#f1ede2" /><JointSketch x={240} y={170} two s={0.7} />
          </g>
        )}
        {t >= e.joint! && <text x={960} y={300} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={140} fill="#ffd84a" opacity={sm((t - e.joint!) / 8)}>?</text>}
      </g>
    ),
  },
  policy: {
    names: ["american", "answered", "responsible", "connection"],
    cam: (t, e) => [1 + 0.15 * ramp(t, e.responsible!, 20), 960, 500],
    body: (t, e, p) => (
      <g>
        <g transform={`translate(${200 + 300 * sm((t - e.answered!) / 16)} 560)`}><rect width={400} height={220} fill="#f1ede2" /><JointSketch x={200} y={110} two s={0.5} color={t >= e.connection! ? "#2e8b57" : "#1d3f8f"} /></g>
        <Paper t={t} at={e.american!} x={700} y={100} w={940} h={460} title="POLICY STATEMENT · ASCE" lines={0} tint="#f8f5ec">
          <text x={40} y={150} fontFamily={MONO} fontWeight={700} fontSize={36} fill="#1b2533">AUTHORITY AND RESPONSIBILITY</text>
          <text x={40} y={200} fontFamily={MONO} fontWeight={700} fontSize={36} fill="#1b2533">FOR DESIGN OF STEEL STRUCTURES</text>
          <text x={40} y={330} fontFamily="Anton, Poppins, sans-serif" fontSize={110} fill="#c99a12">{p.fig?.year ?? ""}</text>
          {t >= e.responsible! && <text x={420} y={320} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#c0392b">{"ENGINEER OF RECORD".slice(0, Math.floor((t - e.responsible!) * 1.4))}</text>}
          {t >= e.connection! && <text x={420} y={380} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#2e8b57">✓ EVERY CONNECTION</text>}
        </Paper>
      </g>
    ),
  },
};

const Desk: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const params = p.beat.params as Params;
  const s = S[params.shot ?? "call"] ?? S.call!;
  const e = evs(m, s.names);
  const [zoom, cx, cy] = s.cam(t, e, m.end);
  return (
    <DeskStage t={t} zoom={zoom} cx={cx} cy={cy} lamp={s.lamp} html={s.html?.(t, e)}>
      {s.body(t, e, params)}
    </DeskStage>
  );
};

export default Desk;
