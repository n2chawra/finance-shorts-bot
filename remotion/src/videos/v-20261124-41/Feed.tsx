// Feed: "Each twist tipped an edge into the wind, and the wind pushed it further. The bridge was feeding its own motion."
// End-on down the deck from the west tower, it rolls to one side ("Each"); the raised edge tips into the wind
// ("tipped"); a wind arrow hits that edge ("wind"); the arrow turns red and the deck rolls further ("pushed"); a
// tilt gauge swings wider ("further"); then the loop diagram over the darkened shot: TWIST to WIND to BIGGER TWIST
// ("feeding"), spinning faster and going red ("motion").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Arrow } from "../../disaster/index";
import { AMBER, Cam, CREAM, DECK_Y, Gertie, k01, MONO, Narrows, RED, Shot3D, sm, SPAN, Tag } from "./World";

const Gauge: React.FC<{ deg: number; k: number }> = ({ deg, k }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: k, pointerEvents: "none" }}>
    <path d="M 690 560 A 170 170 0 0 1 1030 560" fill="rgba(16,18,16,0.8)" stroke={CREAM} strokeWidth={5} />
    <path d="M 880 400 A 170 170 0 0 1 1030 560" fill="none" stroke={RED} strokeWidth={14} />
    <line x1={860} y1={560} x2={860 + 150 * Math.sin((deg * Math.PI) / 180)} y2={560 - 150 * Math.cos((deg * Math.PI) / 180)} stroke={AMBER} strokeWidth={10} strokeLinecap="round" />
    <text x={860} y={620} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={44} fill={CREAM}>TILT</text>
  </svg>
);

const Loop: React.FC<{ t: number; at: number; hot: number }> = ({ t, at, hot }) => {
  const k = k01((t - at) / 10);
  const spin = (t - at) * (3 + 6 * hot);
  const col = hot > 0.5 ? RED : AMBER;
  const node = (x: number, y: number, label: string, d: number) => (
    <g opacity={k01((t - at - d) / 4)}>
      <rect x={x - 200} y={y - 50} width={400} height={100} rx={18} fill="#121412" stroke={col} strokeWidth={6} />
      <text x={x} y={y + 18} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={50} fill={CREAM}>{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <rect x={0} y={0} width={1080} height={1920} fill="rgba(14,16,14,0.55)" opacity={k} />
      <circle cx={540} cy={880} r={300} fill="none" stroke={col} strokeWidth={10} strokeDasharray="70 40" strokeDashoffset={-spin * 4} opacity={k} />
      {node(540, 580, "TWIST", 0)}
      {node(780, 1080, "WIND PUSH", 3)}
      {node(300, 1080, "BIGGER TWIST", 6)}
    </svg>
  );
};

const Feed: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const tipped = m.at("tipped", 20), wind = m.at("wind", 40), pushed = m.at("pushed", 60), further = m.at("further", 80), feeding = m.at("fed", 110), motionAt = m.at("itself", 125);
  const twist = 0.55 + 0.3 * sm((f - pushed) / 20);
  const phase = 0.5 * Math.PI + 0.9 * Math.sin((f * 2 * Math.PI) / 110);
  const roll = twist * Math.sin(phase);
  const hot = 0.3 + 0.4 * sm((f - pushed) / 20) + 0.3 * sm((f - motionAt) / 12);
  const pushK = k01((f - wind) / 8);
  const pos: [number, number, number] = [-SPAN / 2 + 0.6 - 0.006 * f, DECK_Y + 0.25, 0.02];
  const look: [number, number, number] = [-SPAN / 4, DECK_Y - 0.1, 0];
  return (
    <Shot3D f={f}
      overlay={
        <>
          {f < feeding ? <Tag t={f} at={tipped} top={360} text="EDGE TIPS UP" color={AMBER} size={50} /> : null}
          {f >= wind && f < feeding ? (
            <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <Arrow x1={60} y1={930 - 260 * roll} x2={330} y2={950 - 260 * roll} k={pushK} color={f >= pushed ? RED : "#bfe3dc"} w={f >= pushed ? 22 : 14} />
            </svg>
          ) : null}
          {f >= further && f < feeding ? <Gauge deg={-10 + 90 * Math.abs(roll)} k={k01((f - further) / 8)} /> : null}
          {f >= feeding ? <Loop t={f} at={feeding} hot={k01((f - motionAt) / 10)} /> : null}
        </>
      }>
      <Cam pos={pos} look={look} fov={48} seed="tac-feed" range={6} />
      <Narrows f={f} />
      <Gertie twist={twist} phase={phase} hot={hot} />
    </Shot3D>
  );
};
export default Feed;
