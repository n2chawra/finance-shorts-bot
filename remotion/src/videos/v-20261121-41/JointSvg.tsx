// The 4th-floor connection as a flat cutaway (Force and Double): the box beam section, the upper rod's
// nut under the bottom flange, the lower rod's nut inside on that flange (offset along the beam), and
// the force arrows. `bend` 0..1 bows the bottom flange round the upper nut, `stress` colours it.
import React from "react";
import { Arrow, MonoLabel } from "../../disaster/index";

const CREAM = "#e9e2d6", SHADE = "#bdb4a6", ROD = "#b9b2a8", NUT = "#8f897f", BLUE = "#ffffff", AMBER = "#ffb23e", RED = "#ff3b30";

export const BEAM = { x: 190, y: 560, w: 700, h: 300, t: 34 } as const;
export const UPPER_X = 470, LOWER_X = 610;

const ramp = (s: number) => (s < 0.5 ? CREAM : s < 0.8 ? AMBER : RED);

export const JointSvg: React.FC<{ t: number; open: number; stress?: number; bend?: number; arrows?: { own?: number; below?: number; merged?: number }; labels?: boolean; labelAt?: number }> = ({
  t, open, stress = 0, bend = 0, arrows = {}, labels = true, labelAt = 0,
}) => {
  const { x, y, w, h, t: th } = BEAM;
  const by = y + h;            // bottom flange top
  const sag = bend * 46;
  const flange = ramp(stress);
  const cut = open;            // 0: closed front web, 1: cut away
  return (
    <g>
      {/* rods: upper from above, down through the beam to its nut under the bottom flange */}
      <rect x={UPPER_X - 16} y={150} width={32} height={by + th + 40 + sag - 150} fill={ROD} />
      {/* lower rod from its nut inside, down out of the frame */}
      <rect x={LOWER_X - 16} y={by - 40} width={32} height={600} fill={ROD} />
      {/* the box: back web, top flange, bottom flange (bowing round the nut) */}
      <rect x={x} y={y} width={w} height={h + th} fill={SHADE} stroke="#1c1c20" strokeWidth={5} />
      <rect x={x - 20} y={y - th} width={w + 40} height={th} fill={CREAM} stroke="#1c1c20" strokeWidth={5} />
      <path d={`M ${x - 20} ${by} L ${UPPER_X - 120} ${by} Q ${UPPER_X} ${by + sag * 2} ${UPPER_X + 120} ${by} L ${x + w + 20} ${by} L ${x + w + 20} ${by + th} L ${UPPER_X + 120} ${by + th} Q ${UPPER_X} ${by + th + sag * 2} ${UPPER_X - 120} ${by + th} L ${x - 20} ${by + th} Z`}
        fill={flange} stroke="#1c1c20" strokeWidth={5} />
      {/* the front web, sliding away to show inside */}
      <rect x={x + w * cut} y={y} width={w * (1 - cut)} height={h} fill={CREAM} stroke="#1c1c20" strokeWidth={5} opacity={0.96} />
      {/* nuts and washers */}
      <rect x={UPPER_X - 50} y={by + th + sag} width={100} height={14} fill={NUT} stroke="#1c1c20" strokeWidth={3} />
      <rect x={UPPER_X - 36} y={by + th + 14 + sag} width={72} height={42} fill={NUT} stroke="#1c1c20" strokeWidth={4} />
      {cut > 0.5 && (
        <g>
          <rect x={LOWER_X - 50} y={by - 14} width={100} height={14} fill={NUT} stroke="#1c1c20" strokeWidth={3} />
          <rect x={LOWER_X - 36} y={by - 56} width={72} height={42} fill={NUT} stroke="#1c1c20" strokeWidth={4} />
        </g>
      )}
      {labels && (
        <g>
          <MonoLabel t={t} at={labelAt} x={UPPER_X + 40} y={300} text="UPPER ROD" sub="TO THE ROOF" size={58} />
          <MonoLabel t={t} at={labelAt + 6} x={x + w + 20} y={y - 70} text="4TH FLOOR BEAM" size={52} anchor="end" />
          <MonoLabel t={t} at={labelAt + 12} x={LOWER_X - 40} y={by + 260} text="LOWER ROD" sub="TO 2ND FLOOR" size={58} anchor="end" />
        </g>
      )}
      {/* forces on the upper nut */}
      {arrows.own !== undefined && <Arrow x1={UPPER_X - 150} y1={y + 40} x2={UPPER_X - 150} y2={y + 230} k={arrows.own} color={BLUE} w={18} />}
      {arrows.own !== undefined && arrows.own > 0.5 && <MonoLabel t={t} at={-60} x={x + 20} y={y + h - 30} text="ITS OWN" size={52} color={BLUE} />}
      {arrows.below !== undefined && <Arrow x1={LOWER_X + 120} y1={by + 80} x2={LOWER_X + 120} y2={by + 330} k={arrows.below} color={AMBER} w={18} />}
      {arrows.below !== undefined && arrows.below > 0.5 && <MonoLabel t={t} at={-60} x={LOWER_X - 60} y={by + 400} text="THE ONE BELOW" size={52} color={AMBER} anchor="end" />}
      {arrows.merged !== undefined && arrows.merged > 0 && (
        <Arrow x1={UPPER_X} y1={by + th + 90 + sag} x2={UPPER_X} y2={by + th + 360 + sag} k={arrows.merged} color={RED} w={44} />
      )}
    </g>
  );
};

export default JointSvg;
