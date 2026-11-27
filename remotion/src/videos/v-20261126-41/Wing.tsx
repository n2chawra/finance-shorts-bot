// Wing (flat engineering diagram on the night grid): the airliner's wing in cross-section, big, with the air
// flowing at it as travelling dashed streamlines. On "Tilt" the section rotates nose-up and the angle-of-attack arc
// draws on; on "tears" the flow over the top breaks away into red swirls and the lift arrow collapses (the stall);
// on "push" a green arrow tips the nose down, the section rotates back and the flow re-attaches. A drawing of the
// principle ("general principle" tag); no figures.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, ArrowSvg, GREEN, Grid, ICE, INK, moments, ramp, RED, TypeText } from "./ui";

const FOIL = "M -380 0 C -372 -64 -170 -118 40 -100 C 210 -86 330 -36 380 0 C 300 12 110 26 -90 30 C -250 32 -366 22 -380 0 Z";
const CX = 560, CY = 800;

const Wing: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => (ev[n] !== undefined ? ev[n]! : 1e9);
  const tilt = ramp(t, e("Raise"), 22), tear = ramp(t, e("tears"), 14), push = ramp(t, e("push"), 20);
  const aoa = 4 + 14 * tilt - 13 * push;              // degrees, nose up
  const broken = tear * (1 - push);                    // the flow over the top torn away
  const lift = 250 + 60 * tilt - 210 * broken;
  // the camera: medium, close on the torn flow, back to medium for the push
  const z = 1.04 + 0.22 * ramp(t, e("tears"), 16) - 0.2 * ramp(t, e("push"), 16) + 0.01 * Math.sin(t / 30);
  const cy = CY + 40 - 120 * ramp(t, e("tears"), 16) * (1 - ramp(t, e("push"), 16));
  const flow = (i: number) => {
    const y0 = CY - 330 + i * 95;
    const above = y0 < CY - 20;
    const bend = above ? -70 * (1 - Math.abs(y0 - (CY - 120)) / 300) : 40 * (1 - Math.abs(y0 - (CY + 60)) / 300);
    const tilted = -Math.tan((aoa * Math.PI) / 180) * 220;
    return { y0, above, d: `M -120 ${y0} C 160 ${y0} 300 ${y0 + bend + (above ? tilted * 0.3 : 0)} ${CX} ${y0 + bend + (above ? tilted * 0.5 : 0)} S 980 ${y0 + (above ? 10 : -10)} 1240 ${y0}` };
  };
  return (
    <Grid t={t} zoom={z} cx={CX} cy={cy}>
      {/* the oncoming air */}
      <TypeText x={170} y={CY - 420} t={t} at={-20} text="AIR" size={56} color={ICE} />
      {[0, 1, 2].map((i) => <ArrowSvg key={i} x1={40} y1={CY - 260 + i * 200} x2={150} y2={CY - 260 + i * 200} k={1} color={ICE} w={10} />)}
      {/* the streamlines, travelling */}
      {Array.from({ length: 8 }, (_, i) => {
        const f = flow(i);
        const hit = f.above && broken > 0 && f.y0 > CY - 260;
        return (
          <g key={i}>
            <path d={f.d} fill="none" stroke={hit ? `rgba(255,59,48,${0.25 + 0.4 * (1 - broken)})` : ICE} strokeWidth={6} strokeDasharray="34 22" strokeDashoffset={-t * 7} opacity={hit ? 1 - 0.6 * broken : 0.85} />
          </g>
        );
      })}
      {/* the swirls where the flow has torn off the top */}
      {broken > 0 && Array.from({ length: 9 }, (_, i) => {
        const life = ((t * 0.02 + i / 9) % 1);
        const x = CX - 40 + life * 640, y = CY - 150 - Math.sin(i * 1.7) * 60 - life * 40;
        const r = 26 + 30 * life;
        return (
          <g key={i} opacity={broken * (1 - life * 0.7)} transform={`rotate(${t * 9 + i * 40} ${x} ${y})`}>
            <path d={`M ${x + r} ${y} A ${r} ${r} 0 1 1 ${x} ${y - r} A ${r * 0.6} ${r * 0.6} 0 1 1 ${x + r * 0.3} ${y + r * 0.2}`} fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" />
          </g>
        );
      })}
      {/* the wing section */}
      <g transform={`translate(${CX} ${CY}) rotate(${-aoa})`}>
        <path d={FOIL} fill="#d8dee5" stroke="#0d1218" strokeWidth={8} />
        <path d="M -380 0 C -376 -40 -330 -66 -270 -84 L -270 26 C -330 26 -372 18 -380 0 Z" fill="#1d2228" />
        <path d={FOIL} fill={`rgba(255,59,48,${0.55 * broken})`} />
        <line x1={-420} y1={0} x2={420} y2={0} stroke={AMBER} strokeWidth={4} strokeDasharray="14 10" opacity={tilt * (1 - push * 0.5)} />
        {/* the lift arrow, standing on the wing */}
        <g transform={`rotate(${aoa})`}>
          <ArrowSvg x1={0} y1={-60} x2={0} y2={-60 - lift} k={ramp(t, 0, 10)} color={broken > 0.5 ? RED : GREEN} w={18} />
        </g>
      </g>
      <TypeText x={CX + 40} y={CY - 340 - 40 * tilt + 160 * broken} t={t} at={4} text="LIFT" size={56} color={broken > 0.5 ? RED : GREEN} />
      {/* the angle of attack */}
      {tilt > 0 && <path d={`M ${CX - 380} ${CY} L ${CX + 120} ${CY}`} stroke={AMBER} strokeWidth={5} strokeDasharray="14 10" opacity={tilt} />}
      {tilt > 0 && <path d={`M ${CX - 140} ${CY} A 240 240 0 0 0 ${CX - 380 + 240 * Math.cos((aoa * Math.PI) / 180)} ${CY - 240 * Math.sin((aoa * Math.PI) / 180)}`} fill="none" stroke={AMBER} strokeWidth={8} opacity={tilt} />}
      <TypeText x={170} y={CY + 230} t={t} at={e("steeply")} text="ANGLE OF ATTACK" size={52} color={AMBER} />
      <TypeText x={CX + 20} y={CY - 470} t={t} at={e("top")} text="FLOW BREAKS AWAY" size={50} color={RED} anchor="middle" />
      {/* the trained answer */}
      {push > 0 && <g transform={`translate(${CX + 330} ${CY - 120})`}>
        <path d={`M -40 -120 A 160 160 0 0 1 120 60`} fill="none" stroke={GREEN} strokeWidth={14} strokeDasharray={`${400 * push} 600`} />
        <ArrowSvg x1={110} y1={30} x2={124} y2={80} k={push > 0.8 ? 1 : 0} color={GREEN} w={14} />
      </g>}
      <TypeText x={CX} y={CY + 340} t={t} at={e("push")} text="PUSH: NOSE DOWN" size={60} color={GREEN} anchor="middle" />
      <TypeText x={CX} y={CY + 420} t={t} at={e("down")} text="FLOW RE-ATTACHES" size={46} color={INK} anchor="middle" />
    </Grid>
  );
};
export default Wing;
