// Tape (flat): the news crew's videotape. Modes (params.mode): camera (a shoulder news camera swings round on
// the terrace, the REC light blinks and the viewfinder fills the frame with the walkways in outline),
// count (the tape goes into a deck, the frame freezes, both walkways are outlined and a count tag ticks up).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { HonestyTag, MonoLabel, useDisasterLook } from "../../disaster/index";
import { ramp, Sheet } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };

/** The walkways as a video frame sees them: two stacked decks, rods, the floor glow. */
const Frame: React.FC<{ x: number; y: number; w: number; h: number; t: number; outline: number; frozen: boolean }> = ({ x, y, w, h, t, outline, frozen }) => {
  const L = useDisasterLook();
  const jit = frozen ? 0 : Math.sin(t / 2) * 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#141a1f" />
      <rect x={x} y={y + h * 0.78} width={w} height={h * 0.22} fill="#3a2a1c" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={x + 40 + i * (w - 80) / 13} cy={y + h * 0.86 + (i % 3) * 8} r={10} fill="#ffb46a" opacity={0.6} />)}
      {[0.3, 0.6].map((fy, i) => (
        <g key={fy} transform={`translate(0 ${jit})`}>
          <rect x={x + w * 0.08} y={y + h * fy} width={w * 0.84} height={18} fill="#8d8a84" />
          <rect x={x + w * 0.08} y={y + h * fy - 26} width={w * 0.84} height={26} fill="none" stroke="#c9a46a" strokeWidth={3} />
          {outline > 0 && <rect x={x + w * 0.08 - 10} y={y + h * fy - 36} width={w * 0.84 + 20} height={64} fill="none" stroke={L.label} strokeWidth={6} opacity={outline} strokeDasharray={i ? "16 10" : undefined} />}
        </g>
      ))}
      {[0.25, 0.5, 0.75].map((fx) => <line key={fx} x1={x + w * fx} y1={y} x2={x + w * fx} y2={y + h * 0.6} stroke="#b9c0c7" strokeWidth={3} />)}
      <rect x={x} y={y} width={w} height={h} fill="url(#scan)" opacity={0.25} />
    </g>
  );
};

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; people: string }> = ({ t, e, mode, people }) => {
  const L = useDisasterLook();
  const defs = (
    <defs>
      <pattern id="scan" width="4" height="6" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" /></pattern>
    </defs>
  );
  if (mode === "camera") {
    const swing = ramp(t, e("television"), 20), vf = ramp(t, e("filming"), 20);
    return (
      <g>
        {defs}
        <g transform={`translate(${960 - 500 * (1 - vf)} ${560}) scale(${0.45 + 0.55 * vf})`}>
          <rect x={-760} y={-420} width={1520} height={840} rx={30} fill="#0b0f0c" stroke={L.line} strokeWidth={6} />
          <Frame x={-720} y={-380} w={1440} h={760} t={t} outline={0} frozen={false} />
          <circle cx={-640} cy={-320} r={22} fill={L.fail} opacity={Math.floor(t / 15) % 2 ? 1 : 0.2} />
          <text x={-600} y={-306} fontFamily={L.fonts.mono} fontWeight={700} fontSize={44} fill={L.ink}>REC</text>
        </g>
        {vf < 0.95 && (
          <g transform={`translate(1500 620) rotate(${-30 + 30 * swing})`} opacity={1 - vf}>
            <rect x={-200} y={-90} width={360} height={180} rx={20} fill="#1d2226" stroke={L.line} strokeWidth={4} />
            <circle cx={-230} cy={0} r={80} fill="#0b0f0c" stroke={L.line} strokeWidth={6} />
            <circle cx={-230} cy={0} r={44} fill="#1d4f6a" />
          </g>
        )}
      </g>
    );
  }
  const deck = ramp(t, e("tape"), 16), frz = t >= e("estimated");
  return (
    <g>
      {defs}
      <rect x={260} y={90} width={1400} height={760} rx={24} fill="#0b0f0c" stroke={L.line} strokeWidth={5} />
      <Frame x={300} y={130} w={1320} h={680} t={t} outline={ramp(t, e("walkways"), 12)} frozen={frz} />
      {frz && <text x={330} y={190} fontFamily={L.fonts.mono} fontWeight={700} fontSize={40} fill={L.label}>❚❚ FROZEN FRAME</text>}
      <rect x={620} y={900 + (1 - deck) * 120} width={680} height={90} rx={10} fill="#1d2226" stroke={L.line} strokeWidth={4} />
      <rect x={760} y={925 + (1 - deck) * 120} width={400} height={40} rx={6} fill="#0b0f0c" />
      {frz && (
        <g>
          <rect x={1250} y={170} width={360} height={170} rx={10} fill="rgba(4,8,6,0.9)" stroke={L.label} strokeWidth={4} />
          <MonoLabel x={1280} y={220} t={t} at={e("estimated")} text="UP TO" size={34} />
          <text x={1280} y={310} fontFamily={L.fonts.value} fontSize={90} fill={L.label}>{countText(people, ramp(t, e("estimated"), 20))}</text>
        </g>
      )}
    </g>
  );
};

const Tape: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "camera";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.05 * (t / Math.max(1, m.end))} cx={960} cy={540} html={<HonestyTag t={t} tag={mode === "count" ? "as reported" : "general principle"} at={0} sub={mode === "count" ? "NBS estimate from the news tape" : "illustration, not the tape"} />}>
      <Inner t={t} e={e} mode={mode} people={figOf(p, "people")} />
    </Sheet>
  );
};

export default Tape;
