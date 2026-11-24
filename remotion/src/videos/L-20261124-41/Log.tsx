// Log (flat, the expedition's dive log on the chart table): dive cards laid out on the sheet. Modes
// (params.mode): dives (the dives that reached the wreck, stamped), told (what the guests were told, on the
// deck), sensors (the hull's listening sensors and their chart on dive eighty), again (the reported words and
// three more dives), last (cold, towing, time; the last dive card turns), recs (the Coast Guard board's
// recommendations, pending), payoff (the bang card, the dives after it, the last one red). Card counts and
// numbers come from params.fig.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { FlatTag, ANTON, BLUE, ChapterCard, clamp, figOf, INK, MONO, moments, Person, ramp, RED, Sheet, sm, Stamp, TypeText } from "./ui";

type Params = { mode?: string; chapter?: string };

/** One dive card: a small card with a wreck icon, an optional figure, a stamp and an edge colour. */
const Card: React.FC<{ x: number; y: number; k: number; label?: string; stamp?: number; edge?: string; big?: boolean; flip?: number }> = ({ x, y, k, label, stamp = 0, edge = INK, big = false, flip = 1 }) => {
  if (k <= 0) return null;
  const w = big ? 260 : 150, h = big ? 340 : 200;
  return (
    <g transform={`translate(${x} ${y - (1 - sm(k)) * 60}) scale(${flip} 1)`} opacity={sm(k)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#ffffff" stroke={edge} strokeWidth={edge === INK ? 4 : 9} />
      <text x={0} y={-h / 2 + (big ? 56 : 40)} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={big ? 36 : 30} fill={INK}>DIVE</text>
      {label ? <text x={0} y={big ? 40 : 30} textAnchor="middle" fontFamily={ANTON} fontSize={big ? 110 : 64} fill={edge === INK ? INK : edge}>{label}</text>
        : <path d={`M ${-w * 0.3} ${h * 0.12} L ${w * 0.25} ${h * 0.08} L ${w * 0.32} ${h * 0.2} L ${-w * 0.3} ${h * 0.22} Z`} fill="#5b3420" />}
      {stamp > 0 && <circle cx={w * 0.25} cy={h * 0.32} r={22 * stamp} fill="none" stroke={BLUE} strokeWidth={5} />}
    </g>
  );
};

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; p: SceneProps; end: number }> = ({ t, e, mode, p, end }) => {
  const f = (n: string) => figOf(p, n);
  if (mode === "dives") {
    const n = Math.max(1, Math.round(Number(f("n").replace(/[^0-9.]/g, "")) || 1));
    const span = Math.max(20, e("times") - e("reached"));
    return (
      <g>
        <TypeText x={160} y={210} t={t} at={0} text={`${f("yfirst")} · ${f("ysecond")}`} size={44} />
        {Array.from({ length: n }, (_, i) => {
          const at = e("reached") + (i / n) * span;
          const col = i % 7, row = Math.floor(i / 7);
          return (
            <g key={i}>
              <rect x={250 + col * 190 - 75} y={420 + row * 250 - 100} width={150} height={200} rx={10} fill="none" stroke="#9aa3ad" strokeWidth={4} strokeDasharray="14 10" />
              <Card x={250 + col * 190} y={420 + row * 250} k={clamp((t - at) / 8)} stamp={ramp(t, Math.max(at + 6, e("wreck")), 6)} />
            </g>
          );
        })}
        {t >= e("times") && (
          <g opacity={ramp(t, e("times"), 10)}>
            <rect x={1520} y={300} width={300} height={220} rx={12} fill="#ffffff" stroke={RED} strokeWidth={6} />
            <text x={1670} y={350} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>TO THE WRECK</text>
            <text x={1670} y={470} textAnchor="middle" fontFamily={ANTON} fontSize={110} fill={RED}>{countText(f("n"), ramp(t, e("times"), 18))}</text>
          </g>
        )}
      </g>
    );
  }
  if (mode === "told") {
    return (
      <g>
        <line x1={0} y1={860} x2={1920} y2={860} stroke={INK} strokeWidth={5} />
        <rect x={200} y={700} width={1500} height={20} fill="#e3e5e8" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={240 + i * 200} y1={720} x2={240 + i * 200} y2={860} stroke={INK} strokeWidth={4} />)}
        {[0, 1, 2, 3].map((i) => <Person key={i} x={420 + i * 110} y={860} s={2.2} color={["#3e5a78", "#7a5a3a", "#5b6b82", "#8a7a68"][i]} k={ramp(t, i * 3, 8)} arm={i === 1 ? 30 : 0} />)}
        <g opacity={ramp(t, e("What"), 8)} transform={`translate(1100 ${330 + 10 * Math.sin(t * 0.15)})`}>
          <text x={0} y={0} fontFamily={ANTON} fontSize={160} fill={RED}>?</text>
        </g>
        <g opacity={ramp(t, e("told"), 10)}>
          <rect x={300} y={240} width={720} height={170} rx={20} fill="#ffffff" stroke={INK} strokeWidth={5} />
          <path d="M 520 410 L 560 480 L 600 410 Z" fill="#ffffff" stroke={INK} strokeWidth={5} />
          <TypeText x={330} y={310} t={t} at={e("told")} text="THE HULL SHIFTED" size={44} />
          <TypeText x={330} y={370} t={t} at={e("told") + 14} text="IN ITS CRADLE" size={44} />
        </g>
        <g transform={`translate(${1400 + 40 * Math.sin(Math.min(1, Math.max(0, (t - e("cradle")) / 20)) * Math.PI * 3)} 560)`} opacity={1}>
          <path d="M -220 60 Q 0 130 220 60" fill="none" stroke="#e8b21c" strokeWidth={14} />
          <rect x={-200} y={-50} width={400} height={110} rx={50} fill="#2a2e35" stroke={INK} strokeWidth={5} />
        </g>
      </g>
    );
  }
  if (mode === "sensors") {
    const draw = clamp((t - e("cracking")) / Math.max(20, end - e("cracking")));
    const spike = e("burst");
    const pts: string[] = [];
    for (let i = 0; i <= 120 * draw; i++) {
      const x = 760 + i * 8;
      const tt = e("cracking") + (i / 120) * (end - e("cracking"));
      const near = Math.abs(tt - spike) < 10 ? (1 - Math.abs(tt - spike) / 10) : 0;
      pts.push(`${x},${560 - 14 * Math.abs(Math.sin(i * 1.7)) - 200 * near}`);
    }
    const strainX = 760 + 960 * clamp((e("strain") - e("cracking")) / Math.max(20, end - e("cracking")));
    return (
      <g>
        <g transform="translate(380 520)">
          <rect x={-260} y={-110} width={520} height={220} rx={100} fill="#2a2e35" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-210 + i * 60} cy={i % 2 ? -60 : 60} r={16} fill={t >= e("sensors") + i * 3 ? "#ffd27a" : "#555"} stroke="#fff" strokeWidth={3} />)}
          <text x={0} y={180} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={INK}>SENSORS ON THE HULL</text>
        </g>
        <rect x={740} y={200} width={1000} height={620} rx={14} fill="#0a1a28" stroke={INK} strokeWidth={6} />
        <text x={770} y={250} fontFamily={MONO} fontWeight={700} fontSize={32} fill="#e8f4ff">ACOUSTIC HITS</text>
        <text x={770} y={720} fontFamily={MONO} fontWeight={700} fontSize={32} fill="#9fd8ff">STRAIN</text>
        <polyline points={pts.join(" ")} fill="none" stroke={t >= spike ? RED : "#ffd27a"} strokeWidth={5} />
        <path d={`M 760 770 L ${Math.min(strainX, 760 + 960 * draw)} 770 ${t >= e("strain") ? `L ${strainX} 680 L ${760 + 960 * draw} 680` : ""}`} fill="none" stroke="#9fd8ff" strokeWidth={6} />
        {t >= spike && <TypeText x={1250} y={300} t={t} at={spike} text="BURST" size={44} color={RED} />}
        {t >= e("strain") && <TypeText x={1250} y={660} t={t} at={e("strain")} text="JUMP" size={44} color="#9fd8ff" />}
      </g>
    );
  }
  if (mode === "again") {
    return (
      <g>
        <rect x={160} y={200} width={760} height={460} rx={14} fill="#0a1a28" stroke={INK} strokeWidth={6} opacity={1 - 0.6 * ramp(t, e("data"), 14)} />
        <polyline points={Array.from({ length: 60 }, (_, i) => `${190 + i * 12},${520 - 20 * Math.abs(Math.sin(i * 1.3)) - (i === 30 ? 160 : 0)}`).join(" ")} fill="none" stroke={RED} strokeWidth={4} opacity={1 - 0.6 * ramp(t, e("data"), 14)} />
        <g opacity={ramp(t, e("chief"), 10)}>
          <rect x={980} y={200} width={780} height={250} rx={12} fill="#ffffff" stroke={INK} strokeWidth={5} />
          <TypeText x={1010} y={270} t={t} at={e("chief")} text="AS REPORTED:" size={32} color={BLUE} />
          <TypeText x={1010} y={340} t={t} at={e("chief") + 8} text={"“LET'S DIVE AGAIN"} size={42} />
          <TypeText x={1010} y={400} t={t} at={e("chief") + 30} text={"AND SEE WHAT HAPPENS”"} size={42} />
        </g>
        {[0, 1, 2].map((i) => <Card key={i} x={1100 + i * 230} y={700} k={clamp((t - e("diving") - i * 8) / 8)} edge={t >= e("times") + i * 4 ? RED : INK} stamp={1} />)}
      </g>
    );
  }
  if (mode === "last") {
    const turn = ramp(t, e("show"), 16);
    return (
      <g>
        {[["COLD", "Cold"], ["TOWING", "towing"], ["TIME", "time"]].map(([txt, w], i) => (
          <g key={i} transform={`translate(${260 + i * 330} ${380 - 80 * (1 - ramp(t, e(w!), 10))})`} opacity={ramp(t, e(w!), 10)}>
            <rect x={-130} y={-60} width={260} height={120} rx={12} fill="#ffffff" stroke={INK} strokeWidth={5} />
            <text x={0} y={18} textAnchor="middle" fontFamily={ANTON} fontSize={58} fill={INK}>{txt}</text>
          </g>
        ))}
        <g opacity={ramp(t, e("tested"), 8)}>
          <rect x={160} y={560} width={900} height={200} rx={12} fill="none" stroke={RED} strokeWidth={6} strokeDasharray="20 14" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 0.2))} />
          <text x={610} y={680} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill={RED}>HULL EFFECT: UNTESTED</text>
        </g>
        <Card x={1450} y={540} k={ramp(t, e("Cold"), 10)} label={turn > 0.5 ? f("dive") : undefined} big edge={turn > 0.5 ? RED : INK} flip={Math.abs(1 - 2 * turn) || 0.02} />
      </g>
    );
  }
  if (mode === "recs") {
    const n = Math.max(1, Math.round(Number(f("recs").replace(/[^0-9.]/g, "")) || 1));
    return (
      <g>
        {Array.from({ length: n }, (_, i) => {
          const k = clamp((t - e("Coast") - i * 2) / 6);
          const col = i % 6, row = Math.floor(i / 6);
          return (
            <g key={i} opacity={k} transform={`translate(${360 + col * 150} ${320 + row * 180 - (1 - k) * 40})`}>
              <rect x={-70} y={-80} width={140} height={160} rx={8} fill="#ffffff" stroke={INK} strokeWidth={4} />
              {[0, 1, 2].map((j) => <rect key={j} x={-50} y={-55 + j * 28} width={100 - j * 20} height={10} fill="#c4c8cd" />)}
              {t >= e("proposals") + i * 1.5 && <rect x={-68} y={26} width={136} height={42} rx={6} fill="#ffe66d" stroke={INK} strokeWidth={3} />}
              {t >= e("proposals") + i * 1.5 && <text x={0} y={58} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>PENDING</text>}
            </g>
          );
        })}
        <g opacity={ramp(t, e("recommendations"), 10)}>
          <rect x={1300} y={240} width={420} height={230} rx={12} fill="#ffffff" stroke={BLUE} strokeWidth={6} />
          <text x={1510} y={290} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>COAST GUARD BOARD</text>
          <text x={1510} y={420} textAnchor="middle" fontFamily={ANTON} fontSize={110} fill={BLUE}>{countText(f("recs"), ramp(t, e("recommendations"), 18))}</text>
        </g>
        <g transform={`translate(1500 720) rotate(${-30 + 4 * Math.sin(t * 0.1)})`} opacity={ramp(t, e("law"), 12)}>
          <rect x={-30} y={-20} width={180} height={40} rx={8} fill="#7a5a3a" stroke={INK} strokeWidth={4} />
          <rect x={-90} y={-60} width={70} height={120} rx={10} fill="#7a5a3a" stroke={INK} strokeWidth={4} />
        </g>
        <TypeText x={1380} y={880} t={t} at={e("law")} text="NOT YET LAW" size={40} color={RED} />
      </g>
    );
  }
  // payoff: the bang card, the dives after it, the last one red
  const a = Number(f("bang").replace(/[^0-9.]/g, "")) || 0, b = Number(f("last").replace(/[^0-9.]/g, "")) || 0;
  const n = Math.max(2, Math.min(12, b - a + 1));
  const span = Math.max(20, e("failed") - e("kept"));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const first = i === 0, last = i === n - 1;
        const at = first ? e("bang") - 6 : last ? e("failed") - 4 : e("kept") + ((i - 1) / Math.max(1, n - 2)) * span;
        const flash = first && t >= e("bang") && t < e("bang") + 20 ? Math.abs(Math.sin(t * 0.5)) : 0;
        return <Card key={i} x={200 + i * (1520 / (n - 1))} y={first || last ? 520 : 560} k={clamp((t - at) / 8)} big={first || last}
          label={first ? f("bang") : last ? f("last") : undefined} edge={last && t >= e("failed") ? RED : first ? (flash > 0.5 ? "#f2a33a" : "#f2a33a") : INK} stamp={!first && !last && t >= e("diving") ? 1 : 0} />;
      })}
      <TypeText x={200} y={260} t={t} at={e("bang")} text="THE BANG" size={42} color="#c47a12" />
      <TypeText x={1720} y={260} t={t} at={e("failed")} text="THE LAST DIVE" size={42} color={RED} anchor="end" />
      {t >= e("failed") && <Stamp x={1720} y={830} t={t} at={e("failed")} text="FAILED" />}
    </g>
  );
};

const Log: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "dives";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  const cam = ((p.beat.params as { camera?: { at?: string; size?: string }[] }).camera ?? []);
  const close = cam.find((c) => c.size === "close" || c.size === "extreme");
  const zk = close?.at ? ramp(t, e(close.at), 18) : 0;
  const focus: Record<string, [number, number]> = { dives: [1300, 500], told: [700, 400], sensors: [1250, 520], again: [1300, 400], last: [960, 560], recs: [960, 520], payoff: [1300, 560] };
  const [fx, fy] = focus[mode] ?? [960, 540];
  const zoom = 1 + 0.03 * (t / end) + 0.22 * zk;
  return (
    <Sheet t={t} zoom={zoom} cx={960 + (fx - 960) * zk} cy={540 + (fy - 540) * zk} html={<>
      <FlatTag t={t} tag="as reported" at={0} sub="from the safety board's report" />
      {P.chapter && <ChapterCard t={t} text={P.chapter} dark={false} />}
    </>}>
      <Inner t={t} e={e} mode={mode} p={p} end={end} />
    </Sheet>
  );
};

export default Log;
