// Rec (flat/doc): what the board asked for. A letter on the desk. Modes (params.mode): urgent (the letter
// slides in, URGENT stamps on), api (the addressee and the request highlight; a trailer icon slides away from
// a unit icon and a safe-distance ring draws), relief (the relief-system guide: its title and the hazard line
// highlight, an open stack icon is replaced by a flare).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { useDisasterLook } from "../../disaster/index";
import { ramp, Sheet, Stamp } from "./elev";
import { moments } from "./ui";

type Params = { mode?: string };

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string }> = ({ t, e, mode }) => {
  const L = useDisasterLook();
  const k = mode === "urgent" ? 0.35 + 0.65 * ramp(t, e("months"), 16) : 1;
  const hi = (at: number, y: number, w: number) => <rect x={250} y={y} width={w * ramp(t, at, 16)} height={62} fill="#ffe14d" opacity={0.7} />;
  const relief = mode === "relief";
  return (
    <g>
      <g opacity={k} transform={`translate(${(1 - k) * 300} 0)`}>
        <rect x={200} y={110} width={1000} height={860} rx={8} fill="#f1efe6" />
        <text x={250} y={190} fontFamily={L.fonts.mono} fontWeight={700} fontSize={38} fill="#1d2b2a">U.S. CHEMICAL SAFETY BOARD</text>
        <text x={250} y={250} fontFamily={L.fonts.title} fontWeight={700} fontSize={50} fill="#1d2b2a">{relief ? "Recommendation: relief systems" : "Urgent recommendation"}</text>
        {mode === "api" && hi(e("american"), 300, 900)}
        {relief && hi(e("revise"), 300, 900)}
        <text x={260} y={348} fontFamily={L.fonts.body} fontSize={44} fill="#1d2b2a">{relief ? "To API: revise its guide on relief systems" : "To the American Petroleum Institute"}</text>
        {mode === "api" && hi(e("guidelines"), 400, 900)}
        {relief && hi(e("hazards"), 400, 900)}
        <text x={260} y={448} fontFamily={L.fonts.body} fontSize={44} fill="#1d2b2a">{relief ? "Name the hazards of blowdown drums" : "Write new guidelines to keep occupied"}</text>
        <text x={260} y={508} fontFamily={L.fonts.body} fontSize={44} fill="#1d2b2a">{relief ? "and urge safer alternatives." : "trailers away from hazardous areas."}</text>
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={260} y={590 + i * 56} width={860 - (i % 2) * 220} height={16} fill="#c9c6bb" />)}
      </g>
      {mode === "urgent" && <Stamp x={900} y={260} t={t} at={e("urgent")} text="URGENT" color={L.fail} size={110} rot={-8} />}
      {mode === "api" && (
        <g>
          <rect x={1340} y={420} width={160} height={200} fill="#1d2226" stroke={L.line} strokeWidth={4} />
          <rect x={1560 + 120 * ramp(t, e("trailers"), 24)} y={560} width={130} height={60} fill="#d9d6cc" stroke={L.ink} strokeWidth={3} />
          <circle cx={1420} cy={520} r={260 * ramp(t, e("areas"), 20)} fill="none" stroke={L.ok} strokeWidth={6} strokeDasharray="16 10" />
        </g>
      )}
      {relief && (
        <g>
          <rect x={1460} y={330} width={60} height={420} fill="#2a1c10" stroke={L.label} strokeWidth={4} opacity={1 - 0.7 * ramp(t, e("alternatives"), 14)} />
          <path d="M 1490 320 C 1460 270 1500 240 1490 190 C 1530 240 1520 280 1490 320 Z" fill="#ff8a2a" opacity={ramp(t, e("alternatives"), 14)} />
          <rect x={1340} y={750} width={300} height={120} fill="#2a1c10" stroke={L.label} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

const Rec: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "urgent";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.04 * (t / Math.max(1, m.end))} cx={960} cy={540}>
      <Inner t={t} e={e} mode={mode} />
    </Sheet>
  );
};

export default Rec;
