// Column (flat, the support ship's sonar screen): the North Atlantic cut through from the ship on the surface to
// the seabed. A depth ruler draws down ("down"), the sub's green dot slides down to its depth tag leaving a dashed
// trail ("sinking"), the camera drops to the seabed where the Titanic's bow draws on ("wreck"), a gap bracket
// pulses ("Titanic"), then a push in on the dot: it greys and a question mark blinks ("happened").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { AMBER, DIM, figOf, GREEN, ICE, MONO, moments, ramp, RED, Screen, TypeText, ANTON } from "./ui";

const SURF = 430, BED = 1330, RX = 190;
const DOT_K = 0.78;              // where the dot sits on the ruler (drawn position only; the figure is the tag)

const Column: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const depth = figOf(p, "depth");
  const rule = 1;
  const slide = ramp(t, e("down"), 34);
  const dotY = SURF + 60 + (BED - SURF - 60) * DOT_K * (0.25 + 0.75 * slide);
  const wreck = 0.35 + 0.65 * ramp(t, e("titanic"), 22);
  const grey = ramp(t, e("happened"), 10);
  // camera: wide on the whole column, medium on the seabed, close on the dot
  const zMed = ramp(t, e("near"), 20), zClose = ramp(t, e("happened"), 18);
  const zoom = 1.06 + 0.1 * zMed + 0.16 * zClose + 0.01 * (t / Math.max(30, m.end));
  const cx = 540 - 60 * zClose;
  const cy = 860 + 220 * zMed + 40 * zClose;
  return (
    <Screen t={t} zoom={zoom} cx={cx} cy={cy} tag="reported" tagSub="positions as reported">
      {/* the sea, darkening with depth */}
      <defs>
        <linearGradient id="col-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d3a52" /><stop offset="1" stopColor="#010a10" /></linearGradient>
      </defs>
      <rect x={-200} y={SURF} width={1480} height={BED - SURF} fill="url(#col-sea)" />
      {/* the surface swell and the support ship */}
      <path d={`M -200 ${SURF} ${Array.from({ length: 30 }, (_, i) => `Q ${-150 + i * 50} ${SURF - 10 + 8 * Math.sin(t * 0.1 + i)} ${-100 + i * 50} ${SURF}`).join(" ")}`} fill="none" stroke={GREEN} strokeWidth={4} />
      <g transform={`translate(${RX - 20} ${SURF - 4}) rotate(${Math.sin(t * 0.05) * 2})`}>
        <path d="M -130 0 L 150 0 L 120 50 L -110 50 Z" fill="#0b1a12" stroke={GREEN} strokeWidth={4} />
        <rect x={-10} y={-70} width={90} height={70} fill="#0b1a12" stroke={GREEN} strokeWidth={4} />
        <rect x={-100} y={-26} width={70} height={26} fill="#0b1a12" stroke={GREEN} strokeWidth={3} />
      </g>
      <TypeText x={RX + 160} y={SURF - 30} t={t} at={-20} text="SUPPORT SHIP" size={48} color={GREEN} />
      {/* the seabed */}
      <path d={`M -200 ${BED} Q 200 ${BED - 30} 540 ${BED} T 1280 ${BED - 10} L 1280 ${BED + 300} L -200 ${BED + 300} Z`} fill="#0a1510" stroke={GREEN} strokeWidth={4} />
      {/* sonar range lines across the sea and hatching in the seabed */}
      {Array.from({ length: 22 }, (_, i) => <line key={`h${i}`} x1={-200} y1={SURF + 30 + i * 42} x2={1280} y2={SURF + 30 + i * 42} stroke={GREEN} strokeWidth={3} opacity={0.22} strokeDasharray="22 18" />)}
      {Array.from({ length: 40 }, (_, i) => <line key={`b${i}`} x1={-200 + i * 40} y1={BED + 20} x2={-140 + i * 40} y2={BED + 420} stroke={GREEN} strokeWidth={3} opacity={0.3} />)}
      {/* depth bands and drifting specks */}
      <rect x={-200} y={SURF + 60} width={1480} height={4} fill={GREEN} opacity={0.25 + 0.5 * ramp(t, e("metres"), 10)} />
      <rect x={-200} y={SURF + 200} width={1480} height={4} fill={GREEN} opacity={0.25 + 0.5 * ramp(t, e("metres") + 6, 10)} />
      <TypeText x={RX + 60} y={SURF + 120} t={t} at={-10} text="SUNLIGHT ENDS" size={44} color={GREEN} />
      <TypeText x={RX + 60} y={SURF + 270} t={t} at={-6} text="TOTAL DARKNESS" size={44} color={GREEN} />
      {Array.from({ length: 70 }, (_, i) => <circle key={`s${i}`} cx={(i * 137) % 1100 - 10} cy={SURF + 40 + ((i * 211 + t * 0.6) % (BED - SURF - 60))} r={3 + (i % 3)} fill={ICE} opacity={0.35} />)}
      {/* the depth ruler */}
      <line x1={RX} y1={SURF} x2={RX} y2={SURF + (BED - SURF) * rule} stroke={ICE} strokeWidth={5} />
      {Array.from({ length: 9 }, (_, i) => {
        const y = SURF + ((BED - SURF) * (i + 1)) / 9;
        return y <= SURF + (BED - SURF) * rule ? <line key={i} x1={RX - 22} y1={y} x2={RX + 22} y2={y} stroke={ICE} strokeWidth={4} /> : null;
      })}
      {/* the sub's trail and dot */}
      <line x1={RX} y1={SURF + 40} x2={RX} y2={dotY} stroke={GREEN} strokeWidth={6} strokeDasharray="14 14" opacity={ramp(t, e("down") + 10, 10)} />
      {[0, 1, 2].map((i) => { const k = ((t + i * 20) % 60) / 60; return <circle key={`p${i}`} cx={RX} cy={dotY} r={40 + 220 * k} fill="none" stroke={grey > 0.5 ? "#55665c" : GREEN} strokeWidth={5} opacity={(1 - k) * 0.7} />; })}
      <g transform={`translate(${RX} ${dotY - 70})`} opacity={0.95}>
        <rect x={-70} y={-24} width={140} height={48} rx={24} fill="#0b1a12" stroke={grey > 0.5 ? "#7d8d84" : GREEN} strokeWidth={5} />
        <circle cx={62} cy={0} r={16} fill={AMBER} opacity={0.8} />
      </g>
      <circle cx={RX} cy={dotY} r={30 + 4 * Math.sin(t * 0.3)} fill={grey > 0.5 ? "#55665c" : GREEN} opacity={0.35} />
      <circle cx={RX} cy={dotY} r={20} fill={grey > 0.5 ? "#7d8d84" : GREEN} stroke="#ffffff" strokeWidth={4} />
      {slide > 0.6 && (
        <g opacity={ramp(t, e("down") + 18, 10)}>
          <rect x={RX + 50} y={dotY - 62} width={430} height={110} rx={10} fill="rgba(2,12,6,0.92)" stroke={AMBER} strokeWidth={4} />
          <text x={RX + 76} y={dotY + 20} fontFamily={ANTON} fontSize={84} fill={AMBER}>{countText(depth, ramp(t, e("down") + 18, 22))}</text>
          <text x={RX + 330} y={dotY + 20} fontFamily={MONO} fontWeight={700} fontSize={48} fill={ICE}>M</text>
          <TypeText x={RX + 100} y={dotY - 84} t={t} at={e("down") + 18} text="TITAN" size={48} color={GREEN} />
        </g>
      )}
      {grey > 0 && <text x={RX - 18} y={dotY + 118} fontFamily={ANTON} fontSize={72} fill={RED} opacity={Math.floor(t / 7) % 2 ? 1 : 0.3}>?</text>}
      {/* the wreck of the Titanic's bow on the seabed */}
      <g opacity={wreck} transform={`translate(560 ${BED - 20}) scale(1.25)`}>
        <path d={`M 0 0 L 20 -110 L 300 -120 L 420 -40 L 440 0 Z`} fill="#13241a" stroke={GREEN} strokeWidth={5} strokeDasharray={`${1600 * wreck} 1600`} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={60 + i * 50} cy={-60} r={8} fill={DIM} />)}
      </g>
      <TypeText x={690} y={BED - 190} t={t} at={e("titanic") + 6} text="TITANIC" size={56} color={AMBER} />
      {/* the gap bracket between the dot and the bottom */}
      {t >= e("near") && (
        <g opacity={ramp(t, e("near"), 8) * (0.6 + 0.4 * Math.sin(t * 0.4))}>
          <line x1={RX + 60} y1={dotY + 30} x2={RX + 60} y2={BED - 20} stroke={AMBER} strokeWidth={5} />
          <line x1={RX + 40} y1={dotY + 30} x2={RX + 80} y2={dotY + 30} stroke={AMBER} strokeWidth={5} />
          <line x1={RX + 40} y1={BED - 20} x2={RX + 80} y2={BED - 20} stroke={AMBER} strokeWidth={5} />
        </g>
      )}
    </Screen>
  );
};

export default Column;
