// The flat drawing of the hanger (shared by Drawing and Call): a sheet of drawing paper on the dark
// table, the roof beam at the top, the 4th- and 2nd-floor walkway sections, and the rods. `split` 0→1
// turns the one long rod into two offset rods (the as-built change); `slide` moves the lower rod over.
import React from "react";
import { MonoLabel } from "../../disaster/index";

const INK = "#1f2a3a", PAPER = "#efe9dc", BLUE = "#ffd84a", RED = "#ff3b30";

export const SHEET = { x: 120, y: 330, w: 840, h: 850 } as const;
const ROOF_Y = 430, W4 = 700, W2 = 980, BX = 540;

/** A walkway section as drawn: the deck and the box beam under it, the beam lit by `hot`. */
const Section: React.FC<{ y: number; hot?: number; label: string; t: number; at?: number }> = ({ y, hot = 0, label, t, at }) => (
  <g>
    <rect x={SHEET.x + 60} y={y - 46} width={SHEET.w - 120} height={30} fill="#d9d1c2" stroke={INK} strokeWidth={4} />
    <rect x={BX - 80} y={y - 16} width={160} height={70} fill={hot > 0 ? `rgba(255,216,74,${0.15 + 0.5 * hot})` : "#e2dbcd"} stroke={hot > 0 ? BLUE : INK} strokeWidth={5} />
    <line x1={BX - 80} y1={y + 19} x2={BX + 80} y2={y + 19} stroke={INK} strokeWidth={2} strokeDasharray="8 6" />
    <MonoLabel t={t} at={at} x={SHEET.x + 70} y={y - 62} text={label} size={44} color={INK} />
  </g>
);

export const HangerSheet: React.FC<{ t: number; draw: number; split?: number; slide?: number; hot4?: number; hot2?: number; labels?: { w4?: number; w2?: number; rod?: number } }> = ({
  t, draw, split = 0, slide = 0, hot4 = 0, hot2 = 0, labels = {},
}) => {
  const rodEnd = ROOF_Y + (W2 + 60 - ROOF_Y) * draw;
  const off = 70 * slide;
  return (
    <g>
      {/* the paper, a lamp's warm pool on it */}
      <rect x={SHEET.x + 14} y={SHEET.y + 18} width={SHEET.w} height={SHEET.h} fill="rgba(0,0,0,0.45)" rx={6} />
      <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill={PAPER} rx={6} />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={SHEET.x} y1={SHEET.y + 62 * i} x2={SHEET.x + SHEET.w} y2={SHEET.y + 62 * i} stroke="rgba(31,42,58,0.06)" strokeWidth={2} />
      ))}
      {/* roof beam */}
      <rect x={SHEET.x + 40} y={ROOF_Y - 40} width={SHEET.w - 80} height={40} fill="#cfc6b6" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={SHEET.x + 50 + i * 55} y1={ROOF_Y - 40} x2={SHEET.x + 80 + i * 55} y2={ROOF_Y} stroke={INK} strokeWidth={2} opacity={0.5} />
      ))}
      <MonoLabel t={t} at={0} x={SHEET.x + 50} y={ROOF_Y - 58} text="ROOF" size={44} color={INK} />
      <Section y={W4} hot={hot4} label="4TH FLOOR WALKWAY" t={t} at={labels.w4 ?? 0} />
      <Section y={W2} hot={hot2} label="2ND FLOOR WALKWAY" t={t} at={labels.w2 ?? 0} />
      {split < 0.5 ? (
        // the one long rod, drawn down from the roof
        <g>
          <line x1={BX} y1={ROOF_Y} x2={BX} y2={rodEnd} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          {draw > 0.5 && <rect x={BX - 26} y={W4 + 54} width={52} height={22} fill={INK} />}
          {draw > 0.98 && <rect x={BX - 26} y={W2 + 54} width={52} height={22} fill={INK} />}
        </g>
      ) : (
        // as changed: an upper rod roof → 4th-floor beam, and a lower rod 4th → 2nd beside it
        <g>
          <line x1={BX - 20} y1={ROOF_Y} x2={BX - 20} y2={W4 + 66} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          <rect x={BX - 46} y={W4 + 54} width={52} height={22} fill={RED} />
          <line x1={BX - 20 + off} y1={W4 - 10} x2={BX - 20 + off} y2={W2 + 66} stroke={BLUE} strokeWidth={14} strokeLinecap="round" />
          <rect x={BX - 46 + off} y={W4 - 26} width={52} height={22} fill={BLUE} />
          <rect x={BX - 46 + off} y={W2 + 54} width={52} height={22} fill={INK} />
        </g>
      )}
      {labels.rod !== undefined && (
        <g>
          <line x1={BX - 14} y1={ROOF_Y + 120} x2={BX - 40} y2={ROOF_Y + 140} stroke={BLUE} strokeWidth={4} />
          <MonoLabel t={t} at={labels.rod} x={BX - 40} y={ROOF_Y + 175} anchor="end" text={split < 0.5 ? "HANGER ROD" : "TWO RODS"} size={48} color={BLUE} />
        </g>
      )}
    </g>
  );
};

export default HangerSheet;
