// Cockpit (flat): the airliner's flight deck at night, seen from behind the two pilots (roles only, never
// names): the windshield onto the snowy dark with the horizon, the glareshield with the STALL lights, the
// instrument screens, the two control columns, the centre pedestal (power levers, flap lever), the gear
// lever, the altimeter dial. Modes (params.mode): hookshake, cruise, shaker, pusher, switch (the overhead
// panel), tease, sterile, chat, tasks, pull, fight, flaps. Figures come only from params.fig.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { AMBER, ANTON, ArrowSvg, ChapterCard, DIM, figOf, FlatTag, GREEN, ICE, INK, MONO, moments, PilotBack, ramp, RED, Sheet, Stamp, TypeText } from "./ui";

type Params = { mode?: string; chapter?: string };

/** Speech marks bobbing between the pilots (talk shown, never its words). */
const Talk: React.FC<{ t: number; k: number; x?: number; y?: number; red?: boolean }> = ({ t, k, x = 960, y = 590, red }) => (k <= 0 ? null : (
  <g opacity={k}>
    {[0, 1, 2].map((i) => {
      const bob = Math.sin(t * 0.22 + i * 1.9) * 10;
      const on = (Math.floor(t / 14) + i) % 3 !== 0;
      return (
        <g key={i} transform={`translate(${x - 170 + i * 130 + (i === 1 ? 0 : 0)} ${y - 60 * (i % 2) + bob}) scale(${on ? 1 : 0.85})`} opacity={on ? 1 : 0.6}>
          <path d="M 0 0 h 100 a 18 18 0 0 1 18 18 v 44 a 18 18 0 0 1 -18 18 h -56 l -24 26 l 0 -26 h -20 a 18 18 0 0 1 -18 -18 v -44 a 18 18 0 0 1 18 -18 z" fill={red ? "rgba(255,59,48,0.18)" : "rgba(242,244,245,0.12)"} stroke={red ? RED : INK} strokeWidth={5} />
          {[0, 1, 2].map((d) => <circle key={d} cx={26 + d * 30} cy={40} r={7} fill={red ? RED : INK} opacity={(Math.floor(t / 5) + d) % 3 === 0 ? 1 : 0.4} />)}
        </g>
      );
    })}
  </g>
));

/** A control column: the yoke on its stem; `fwd` -1 (pulled back) .. 1 (pushed forward), `shake` px. */
const Column: React.FC<{ x: number; fwd: number; shake: number; ring?: number }> = ({ x, fwd, shake, ring = 0 }) => {
  const y = 690 + fwd * -46, s = 1 - fwd * 0.12;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`}>
      <rect x={-18} y={0} width={36} height={300} fill="#2c333b" stroke="#0e1216" strokeWidth={5} />
      <path d="M -120 -30 Q -130 40 -90 60 L 90 60 Q 130 40 120 -30 L 96 -30 Q 100 30 70 34 L -70 34 Q -100 30 -96 -30 Z" fill="#3a434c" stroke="#0e1216" strokeWidth={6} />
      <rect x={-34} y={24} width={68} height={50} rx={8} fill="#232a31" />
      {ring > 0 && <circle cx={0} cy={140} r={60 + 8 * Math.sin(ring * 6)} fill="none" stroke={AMBER} strokeWidth={7} opacity={Math.min(1, ring * 3)} />}
      {ring > 0 && <rect x={-26} y={118} width={52} height={44} rx={6} fill="#555f69" />}
    </g>
  );
};

const Cockpit: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "cruise";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  if (mode === "switch") return <Overhead p={p} t={t} e={e} end={end} />;
  // what moves
  const shakeOn = mode === "hookshake" ? t >= e("shook") : mode === "shaker" ? t >= e("rattles") : mode === "pusher" ? true : mode === "pull" ? true : mode === "fight" ? true : false;
  const jitter = shakeOn ? Math.sin(t * 3.3) * 6 : 0;
  let capFwd = 0, foFwd = 0;
  if (mode === "hookshake") capFwd = 0.6 * ramp(t, e("push"), 8) * (1 - ramp(t, e("pulled"), 6)) - 1 * ramp(t, e("pulled"), 8);
  if (mode === "pusher") { capFwd = ramp(t, e("forward"), 8); foFwd = capFwd; }
  if (mode === "pull") capFwd = -ramp(t, e("pulled"), 6);
  const pushes = mode === "fight" ? [e("pusher"), e("twice"), e("twice") + 22] : [];
  if (mode === "fight") {
    let f = 0;
    pushes.forEach((at) => { f = t >= at ? (t < at + 14 ? 1 : -0.9) : f; });
    if (t >= e("against") && t < pushes[1]!) f = -0.9;
    capFwd = f; foFwd = f > 0 ? f : 0;
  }
  if (mode === "pull" || mode === "hookshake" || mode === "fight") foFwd = mode === "fight" ? foFwd : capFwd;
  const pitchView = mode === "pusher" ? -ramp(t, e("flowing"), 20) * 60 : mode === "fight" ? (capFwd > 0 ? -50 : 40) * ramp(t, e("pusher"), 8) : mode === "pull" ? 50 * ramp(t, e("pulled"), 20) : mode === "hookshake" ? 40 * ramp(t, e("pulled"), 20) : 0;
  const bank = mode === "fight" ? Math.sin(t * 0.08) * 25 : mode === "pull" ? -10 * ramp(t, e("pulled"), 30) : 0;
  const stallLight = mode === "gearup" || (mode === "hookshake" && t >= e("shook")) || (mode === "shaker" && t >= e("warning")) || mode === "pull" || mode === "fight" || mode === "flaps" || (mode === "pusher");
  const ice = mode === "tease" || mode === "sterile" || mode === "chat" || mode === "tasks" ? 0.7 : mode === "cruise" ? 0 : 0.5;
  const talkK = mode === "cruise" ? ramp(t, e("talked"), 10) : mode === "chat" ? ramp(t, e("conversation"), 10) : mode === "tease" ? ramp(t, e("quiet"), 10) : mode === "sterile" ? 1 - 0.7 * ramp(t, e("talk"), 14) : 0;
  const foTurn = mode === "gearup" ? -16 * ramp(t, e("asked"), 12) : mode === "tasks" ? 18 * ramp(t, e("busy"), 12) : mode === "flaps" ? 14 * ramp(t, e("flaps"), 10) : 0;
  const foArm = mode === "tasks" ? 40 * ramp(t, e("gear"), 8) : mode === "flaps" ? 46 * ramp(t, e("flaps"), 8) : 0;
  const capArm = mode === "pull" ? 30 * ramp(t, e("power"), 8) : mode === "power" ? 26 * ramp(t, e("hand"), 10) : 0;
  // the camera
  const push = mode === "hookshake" ? ramp(t, e("push"), 16) : mode === "shaker" ? ramp(t, e("shaker"), 16) : mode === "pusher" ? ramp(t, e("pusher"), 16)
    : mode === "tease" ? ramp(t, e("speed"), 16) : mode === "sterile" ? ramp(t, e("sterile"), 16) : mode === "tasks" ? ramp(t, e("gear"), 16) : mode === "pull" ? 0.6 + 0.4 * ramp(t, e("pulled"), 16)
    : mode === "flaps" ? ramp(t, e("flaps"), 16) : mode === "power" ? ramp(t, e("controls"), 16) : mode === "gearup" ? ramp(t, e("gear"), 16) : mode === "cruise" ? ramp(t, e("allowed"), 16) : mode === "fight" ? ramp(t, e("pusher"), 16) : ramp(t, e("descent"), 16);
  const back = mode === "shaker" ? ramp(t, e("warning"), 16) : mode === "pusher" ? ramp(t, e("flowing"), 16) : mode === "tease" || mode === "flaps" ? ramp(t, e(mode === "tease" ? "quiet" : "fell"), 16)
    : mode === "sterile" ? ramp(t, e("flying"), 16) : mode === "gearup" ? ramp(t, e("procedure"), 16) : mode === "tasks" ? ramp(t, e("check"), 16) : mode === "pull" ? ramp(t, e("full"), 16) : mode === "fight" ? ramp(t, e("twice"), 16) : 0;
  const zoom = 1.02 + 0.24 * push - 0.18 * back + 0.02 * (t / end);
  const focus: [number, number] = mode === "power" ? [950, 860] : mode === "gearup" ? [1200, 640] : mode === "hookshake" ? [mode === "hookshake" && t >= e("pulled") ? 640 : 760, 640] : mode === "tease" ? [700, 560] : mode === "tasks" || mode === "flaps" ? [1150, 640] : mode === "pull" ? [800, 660]
    : mode === "sterile" || mode === "chat" ? [960, 420] : mode === "cruise" ? [1320, 520] : [960, 620];
  const cx = 960 + (focus[0] - 960) * push * 0.45, cy = 540 + (focus[1] - 540) * push * 0.45;
  // the altimeter (needle turns; the plate shows the beat's figure)
  const alt = figOf(p, "alt");
  const needle = mode === "sterile" ? 40 + 260 * ramp(t, e("Below"), end * 0.6) : mode === "chat" || mode === "tease" ? t * 3 : mode === "cruise" ? 120 : 0;
  return (
    <Sheet t={t} zoom={zoom} cx={cx} cy={cy} grid={false} html={<>
      <FlatTag t={t} tag="reconstruction" at={0} sub="the flight deck, drawn from the NTSB report" />
      {P.chapter && <ChapterCard t={t} text={P.chapter} />}
    </>}>
      {/* outside: the night, the snow streaks, the horizon */}
      <defs><clipPath id="cg-ws"><path d="M 140 90 L 1780 90 L 1700 430 L 220 430 Z" /></clipPath></defs>
      <g clipPath="url(#cg-ws)">
        <rect x={0} y={0} width={1920} height={500} fill="#141b23" />
        <g transform={`rotate(${bank} 960 260) translate(0 ${pitchView})`}>
          <rect x={-400} y={300} width={2800} height={800} fill="#0a0d11" />
          <line x1={-400} y1={300} x2={2400} y2={300} stroke="#3a4652" strokeWidth={4} />
          {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 137) % 1900} cy={330 + (i * 53) % 140} r={3} fill="#ffc46b" opacity={0.5} />)}
        </g>
        {Array.from({ length: 70 }, (_, i) => {
          const life = ((t * 0.9 + i * 13) % 40) / 40;
          const x0 = 960 + Math.cos(i * 2.39) * 40, y0 = 260 + Math.sin(i * 2.39) * 30;
          const dx = Math.cos(i * 2.39) * 900 * life, dy = Math.sin(i * 2.39) * 500 * life;
          return <line key={i} x1={x0 + dx} y1={y0 + dy} x2={x0 + dx * 1.08} y2={y0 + dy * 1.08} stroke="#e8eef4" strokeWidth={3} opacity={0.7 * life} />;
        })}
        {ice > 0 && <path d="M 140 90 L 520 90 L 470 160 L 380 140 L 300 200 L 220 180 L 180 260 Z M 1780 90 L 1400 90 L 1450 150 L 1540 140 L 1620 210 L 1700 190 L 1740 270 Z" fill="#dff3ff" opacity={0.55 * ice} />}
      </g>
      {/* window posts and frame */}
      <path d="M 140 90 L 1780 90 L 1700 430 L 220 430 Z" fill="none" stroke="#1d242b" strokeWidth={34} />
      <line x1={960} y1={90} x2={960} y2={430} stroke="#1d242b" strokeWidth={40} />
      <line x1={560} y1={90} x2={520} y2={430} stroke="#1d242b" strokeWidth={26} />
      <line x1={1360} y1={90} x2={1400} y2={430} stroke="#1d242b" strokeWidth={26} />
      {/* glareshield, stall lights, panel and screens */}
      <path d="M 120 430 L 1800 430 L 1760 500 L 160 500 Z" fill="#20262d" />
      {[620, 1300].map((x, i) => {
        const on = stallLight && Math.floor(t / 5) % 2 === 0;
        return <g key={i}><rect x={x - 80} y={442} width={160} height={48} rx={6} fill={on ? RED : "#3a1513"} /><text x={x} y={478} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={on ? "#fff" : "#6b2a26"}>STALL</text></g>;
      })}
      <rect x={100} y={500} width={1720} height={300} fill="#2a3138" />
      {[270, 630, 1130, 1490].map((x, i) => (
        <g key={i}>
          <rect x={x - 150} y={520} width={300} height={220} rx={10} fill="#05080c" stroke="#59636d" strokeWidth={6} />
          {(i === 0 || i === 3) && <g>
            <rect x={x - 130} y={540} width={60} height={180} fill="#1a2027" />
            {mode !== "cruise" && <rect x={x - 100} y={mode === "hookshake" && t >= e("stall") ? 600 : 690} width={26} height={mode === "hookshake" && t >= e("stall") ? 120 : 30} fill={RED} />}
            <rect x={x - 50} y={540} width={160} height={90} fill="#2f79c4" /><rect x={x - 50} y={630} width={160} height={90} fill="#7a4d2a" />
          </g>}
          {i === 1 && <g><circle cx={x} cy={630} r={90} fill="#0d1116" stroke="#8b96a1" strokeWidth={4} /><line x1={x} y1={630} x2={x + Math.sin((needle * Math.PI) / 180) * 76} y2={630 - Math.cos((needle * Math.PI) / 180) * 76} stroke={INK} strokeWidth={7} strokeLinecap="round" /><text x={x} y={700} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={DIM}>ALT</text></g>}
        </g>
      ))}
      {/* autopilot light */}
      <g transform="translate(905 520)"><rect x={0} y={0} width={110} height={56} rx={8} fill={mode === "cruise" || mode === "chat" || mode === "tease" || mode === "sterile" || mode === "tasks" ? "#0f3d22" : "#1c1c1c"} stroke={GREEN} strokeWidth={3} /><text x={55} y={40} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={mode === "cruise" || mode === "chat" || mode === "tease" || mode === "sterile" || mode === "tasks" ? GREEN : "#444"}>AP</text></g>
      {/* gear lever and its lights */}
      <g transform="translate(1290 600)">
        <rect x={0} y={0} width={90} height={150} rx={10} fill="#1b2026" />
        <rect x={34} y={mode === "tasks" && t >= e("gear") ? 70 : 14} width={22} height={70} rx={8} fill="#d8dde2" />
        {[0, 1, 2].map((i) => <circle key={i} cx={22 + i * 23} cy={-18} r={10} fill={(mode === "tasks" && t >= e("check")) || mode === "pull" || mode === "fight" || mode === "flaps" ? GREEN : "#20302a"} />)}
      </g>
      {/* the pedestal: power levers, flap lever, radio */}
      <path d="M 840 800 L 1080 800 L 1140 1080 L 780 1080 Z" fill="#262c33" stroke="#0e1216" strokeWidth={5} />
      <rect x={890} y={830} width={140} height={14} fill={AMBER} opacity={0.8} />
      {[910, 990].map((x, i) => {
        const lift = mode === "pull" ? 100 * ramp(t, e("power"), 14) : 0;
        return <g key={i}><rect x={x - 6} y={850 - lift} width={22} height={140} rx={6} fill="#6c7782" /><rect x={x - 16} y={840 - lift} width={42} height={26} rx={6} fill="#d8dde2" /></g>;
      })}
      {mode === "pull" && t >= e("full") && <g opacity={ramp(t, e("full"), 8)}><TypeText x={1050} y={842} t={t} at={e("full")} text="FULL POWER" size={30} color={AMBER} /><path d="M 1040 832 l -26 0" stroke={AMBER} strokeWidth={5} /></g>}
      <g transform="translate(1060 880)">
        <rect x={0} y={0} width={36} height={150} rx={8} fill="#1b2026" />
        <rect x={6} y={mode === "flaps" ? 100 - 90 * ramp(t, e("flaps"), 10) : 100} width={24} height={36} rx={6} fill="#e8edf2" />
      </g>
      {mode === "tasks" && <g transform="translate(860 1010)" opacity={ramp(t, e("radio"), 8)}>
        <rect x={0} y={0} width={200} height={50} rx={6} fill="#05080c" stroke="#59636d" strokeWidth={3} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={14 + i * 30} y={12 + (Math.floor((t - e("radio")) / 4) + i) % 2 * 4} width={20} height={22} fill={ICE} opacity={t >= e("radio") + 12 ? 1 : 0.5} />)}
      </g>}
      {mode === "tasks" && t >= e("chime") && <g transform="translate(1180 520)" opacity={1 - ramp(t, e("chime") + 30, 12)}><circle cx={0} cy={0} r={34} fill={AMBER} /><path d="M -14 10 q 14 -40 28 0 z" fill="#111" />{[1, 2].map((r) => <circle key={r} cx={0} cy={0} r={34 + r * 22 * ramp(t, e("chime"), 20)} fill="none" stroke={AMBER} strokeWidth={4} opacity={0.6} />)}</g>}
      {mode === "power" && <g>
        <circle cx={950} cy={900} r={110} fill="none" stroke={AMBER} strokeWidth={7} opacity={ramp(t, e("controls"), 10)} />
        <g transform="translate(1120 170)" opacity={ramp(t, e("autothrottle"), 10)}><rect x={0} y={0} width={420} height={80} rx={8} fill="rgba(8,12,18,0.9)" stroke={DIM} strokeWidth={4} /><text x={24} y={54} fontFamily={MONO} fontWeight={700} fontSize={36} fill={DIM}>AUTOTHROTTLE</text><line x1={14} y1={44} x2={14 + 390 * ramp(t, e("autothrottle") + 8, 10)} y2={44} stroke={RED} strokeWidth={8} /></g>
        <TypeText x={1120} y={320} t={t} at={e("hand")} text="POWER: BY HAND" size={36} color={AMBER} />
        {t >= e("short") && <ArrowSvg x1={270} y1={560} x2={270} y2={700} k={ramp(t, e("short"), 10)} color={RED} w={14} />}
      </g>}
      {mode === "gearup" && <g>
        <circle cx={1335} cy={660} r={110} fill="none" stroke={AMBER} strokeWidth={7} opacity={ramp(t, e("gear"), 10)} />
        {t >= e("Neither") && <g transform={`translate(1380 ${170 + 30 * (1 - ramp(t, e("Neither"), 12))})`} opacity={ramp(t, e("Neither"), 12)}>
          <rect x={0} y={0} width={380} height={250} rx={8} fill="#f4f1e8" stroke="#111" strokeWidth={4} />
          <text x={20} y={46} fontFamily={MONO} fontWeight={700} fontSize={28} fill="#111">STALL RECOVERY</text>
          {["FLAPS UP", "GEAR UP"].map((s, i) => <g key={s}><text x={20} y={110 + i * 70} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#333">{s}</text>{t >= e("procedure") + i * 8 && <path d={`M 270 ${80 + i * 70} l 50 40 m 0 -40 l -50 40`} stroke={RED} strokeWidth={9} opacity={ramp(t, e("procedure") + i * 8, 6)} />}</g>)}
        </g>}
      </g>}
      {/* the columns */}
      <Column x={700} fwd={capFwd} shake={jitter} ring={mode === "shaker" ? ramp(t, e("shaker"), 20) : mode === "pusher" ? 0 : 0} />
      <Column x={1220} fwd={foFwd} shake={-jitter} ring={mode === "shaker" ? ramp(t, e("shaker"), 20) : 0} />
      {mode === "pusher" && t >= e("pusher") && <g opacity={ramp(t, e("pusher"), 10)}><circle cx={960} cy={990} r={58} fill="none" stroke={AMBER} strokeWidth={7} /><TypeText x={960} y={915} t={t} at={e("pusher")} text="STICK PUSHER" size={30} color={AMBER} anchor="middle" /></g>}
      {/* the pilots (roles only) */}
      <PilotBack x={440} y={860} s={1.05} arm={capArm} turn={0} shirt="#e9edf1" />
      <PilotBack x={1480} y={860} s={1.05} arm={foArm} turn={foTurn} shirt="#e9edf1" />
      <TypeText x={440} y={870} t={t} at={0} text="CAPTAIN" size={32} color={INK} anchor="middle" />
      <TypeText x={1380} y={870} t={t} at={0} text="FIRST OFFICER" size={32} color={INK} anchor="middle" />
      {/* arrows on the columns */}
      {mode === "hookshake" && <ArrowSvg x1={700} y1={640} x2={700} y2={540} k={ramp(t, e("push"), 8) * (1 - ramp(t, e("pulled"), 4))} color={GREEN} w={14} />}
      {mode === "hookshake" && <ArrowSvg x1={700} y1={700} x2={700} y2={830} k={ramp(t, e("pulled"), 8)} color={RED} w={14} />}
      {mode === "pusher" && <ArrowSvg x1={700} y1={640} x2={700} y2={540} k={ramp(t, e("forward"), 8)} color={GREEN} w={14} />}
      {mode === "pull" && <ArrowSvg x1={700} y1={700} x2={700} y2={830} k={ramp(t, e("pulled"), 8)} color={RED} w={14} />}
      {mode === "fight" && <ArrowSvg x1={700} y1={capFwd > 0 ? 640 : 700} x2={700} y2={capFwd > 0 ? 540 : 830} k={1} color={capFwd > 0 ? GREEN : RED} w={14} />}
      {mode === "fight" && <g transform="translate(1560 160)">{pushes.map((at, i) => t >= at && <rect key={i} x={i * 50} y={0} width={30} height={110} rx={6} fill={GREEN} opacity={ramp(t, at, 6)} />)}<TypeText x={0} y={150} t={t} at={e("pusher")} text="PUSHES" size={30} color={GREEN} /></g>}
      {/* the beat's own plates */}
      {(mode === "cruise" || mode === "sterile") && alt && <g transform="translate(560 200)" opacity={ramp(t, mode === "cruise" ? e("height") : e("Below"), 10)}>
        <rect x={0} y={0} width={360} height={140} rx={10} fill="rgba(8,12,18,0.88)" stroke={ICE} strokeWidth={4} />
        <text x={20} y={44} fontFamily={MONO} fontWeight={700} fontSize={30} fill={ICE}>ALTITUDE · FT</text>
        <text x={20} y={118} fontFamily={ANTON} fontSize={70} fill={INK}>{countText(alt, ramp(t, mode === "cruise" ? e("height") : e("Below"), 18))}</text>
      </g>}
      {mode === "cruise" && <Stamp x={1080} y={300} t={t} at={e("allowed")} text="ALLOWED" color={GREEN} size={54} />}
      {(mode === "sterile" || mode === "chat") && <g transform="translate(1000 160)" opacity={mode === "sterile" ? ramp(t, e("sterile"), 10) : 1}>
        <rect x={0} y={0} width={480} height={84} rx={10} fill={mode === "chat" && t >= e("nothing") && Math.floor(t / 6) % 2 === 0 ? "#4a1410" : "#10202e"} stroke={mode === "chat" && t >= e("nothing") ? RED : ICE} strokeWidth={5} />
        <text x={240} y={56} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={38} fill={mode === "chat" && t >= e("nothing") ? RED : ICE}>STERILE COCKPIT</text>
      </g>}
      {mode === "sterile" && t >= e("flying") && <g transform={`translate(1500 290) rotate(4)`} opacity={ramp(t, e("flying"), 10)}>
        <rect x={0} y={0} width={300} height={160} rx={8} fill="#f4f1e8" stroke="#111" strokeWidth={4} />
        <text x={20} y={46} fontFamily={MONO} fontWeight={700} fontSize={28} fill="#111">ONLY FLYING:</text>
        {["CHECKLISTS", "RADIO", "CALLOUTS"].map((s, i) => <text key={i} x={20} y={84 + i * 30} fontFamily={MONO} fontWeight={700} fontSize={24} fill="#333">{`· ${s}`}</text>)}
      </g>}
      <Talk t={t} k={talkK} red={mode === "chat" || mode === "tease"} />
      {mode === "tasks" && <g>{(["gear", "radio", "chime", "check"] as const).map((w, i) => t >= e(w) && <g key={w} transform={`translate(${200 + i * 200} 190)`} opacity={ramp(t, e(w), 8)}><rect x={0} y={0} width={180} height={64} rx={8} fill="rgba(8,12,18,0.88)" stroke={AMBER} strokeWidth={4} /><text x={90} y={44} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={AMBER}>{["GEAR", "RADIO", "CHIME", "CHECK"][i]}</text></g>)}</g>}
      {mode === "flaps" && <g transform="translate(1340 170)">
        <rect x={0} y={0} width={340} height={210} rx={10} fill="rgba(8,12,18,0.88)" stroke={AMBER} strokeWidth={4} />
        <text x={20} y={44} fontFamily={MONO} fontWeight={700} fontSize={30} fill={AMBER}>FLAPS</text>
        <path d="M 60 170 A 110 110 0 0 1 280 170" stroke={DIM} strokeWidth={6} fill="none" />
        <line x1={170} y1={170} x2={170 + Math.cos(Math.PI * (0.25 + 0.75 * (1 - ramp(t, e("asked"), 24)))) * -100} y2={170 - Math.sin(Math.PI * (0.25 + 0.75 * (1 - ramp(t, e("asked"), 24)))) * 100} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <TypeText x={210} y={130} t={t} at={e("asked")} text="UP" size={40} color={RED} />
      </g>}
      {mode === "flaps" && <ArrowSvg x1={300} y1={330} x2={300} y2={330 - 160 * (1 - 0.6 * ramp(t, e("lift"), 16))} k={ramp(t, e("lift") - 20, 10)} color={ramp(t, e("lift"), 16) > 0.5 ? RED : ICE} w={16} />}
      {mode === "flaps" && t >= e("fell") && <g transform="translate(160 360)" opacity={ramp(t, e("fell"), 10)}><rect x={0} y={0} width={320} height={140} rx={10} fill="rgba(8,12,18,0.88)" stroke={RED} strokeWidth={4} /><text x={20} y={44} fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>AIRSPEED · KT</text><text x={20} y={118} fontFamily={ANTON} fontSize={70} fill={RED}>{countText(figOf(p, "speed"), ramp(t, e("fell"), 18))}</text></g>}
    </Sheet>
  );
};

/** The overhead panel above the captain's seat: rows of switches, the ref speeds switch flipping to INCREASE,
 * and the margin scale (the shaker's trigger moves earlier). */
const Overhead: React.FC<{ p: SceneProps; t: number; e: (n: string) => number; end: number }> = ({ p, t, e, end }) => {
  const flip = ramp(t, e("increase"), 8);
  const z = ramp(t, e("switch"), 16), b = ramp(t, e("margin"), 16);
  const trig = 0.62 - 0.2 * ramp(t, e("sooner"), 20);
  void p;
  return (
    <Sheet t={t} zoom={1.02 + 0.22 * z - 0.12 * b + 0.02 * (t / end)} cx={960 - 60 * z * (1 - b)} cy={500 - 20 * z} html={<FlatTag t={t} tag="reconstruction" at={0} sub="the ice protection panel, drawn from the NTSB report" />}>
      <rect x={160} y={120} width={1600} height={500} rx={24} fill="#2a3138" stroke="#0e1216" strokeWidth={8} />
      <TypeText x={220} y={190} t={t} at={e("ice") - 10} text="ICE PROTECTION" size={40} color={INK} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 260 + (i % 6) * 220, y = 280 + Math.floor(i / 6) * 190;
        const key = i === 2;
        const up = key ? flip : (i * 7) % 3 === 0 ? 1 : 0;
        return (
          <g key={i} opacity={key ? 1 : 0.55}>
            <circle cx={x} cy={y} r={46} fill="#1b2026" stroke={key && z > 0 ? AMBER : "#59636d"} strokeWidth={key && z > 0 ? 8 : 4} />
            <rect x={x - 12} y={y - 60 * up - 6} width={24} height={66} rx={10} fill="#d8dde2" transform={`rotate(${-30 + 60 * up} ${x} ${y})`} />
            {key && <text x={x} y={y + 100} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={AMBER}>REF SPEEDS</text>}
            {key && <text x={x} y={y - 70} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={flip > 0.5 ? AMBER : DIM}>INCR</text>}
            {key && <text x={x} y={y + 140} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={flip > 0.5 ? DIM : INK}>OFF</text>}
          </g>
        );
      })}
      {/* the margin scale: the wing's angle along a bar, the shaker's trigger and the stall */}
      <g transform="translate(260 700)" opacity={ramp(t, e("sooner") - 20, 12)}>
        <rect x={0} y={0} width={1400} height={30} rx={15} fill="#1b2026" stroke="#59636d" strokeWidth={3} />
        <rect x={1400 * 0.8} y={0} width={1400 * 0.2} height={30} rx={15} fill={RED} />
        <text x={1400 * 0.9} y={-14} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={RED}>STALL</text>
        <rect x={1400 * trig - 6} y={-26} width={12} height={82} fill={AMBER} />
        <text x={1400 * trig} y={96} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={AMBER}>SHAKER</text>
        {b > 0 && <g opacity={b}><path d={`M ${1400 * trig} 130 L ${1400 * trig} 150 L ${1400 * 0.8} 150 L ${1400 * 0.8} 130`} stroke={GREEN} strokeWidth={6} fill="none" /><text x={(1400 * trig + 1400 * 0.8) / 2} y={190} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={GREEN}>MARGIN</text></g>}
        <TypeText x={0} y={-14} t={t} at={e("sooner") - 20} text="WING ANGLE" size={30} color={DIM} />
      </g>
      <Stamp x={1380} y={240} t={t} at={e("increase")} text="INCREASE" color={AMBER} size={50} />
    </Sheet>
  );
};

export default Cockpit;
