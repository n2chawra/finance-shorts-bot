// Synthetic 5-minute landscape video for the feasibility spike: the expensive parts a real
// long-form video will use, running for the whole length — parallax stage, an SVG character,
// a chart drawn with evolvePath, a Lottie effect and a 3D coin (Three.js in headless Chrome).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath } from "@remotion/paths";
import { Lottie } from "@remotion/lottie";
import { ThreeCanvas } from "@remotion/three";
import props from "./props.json";
import { Person } from "./Short";

const P = props.palette;
const [A_, B_] = props.people;

const LOTTIE = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 200, h: 200, nm: "pulse", ddd: 0, assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "bar", sr: 1, ao: 0, ip: 0, op: 60, st: 0, bm: 0,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 1, k: [{ t: 0, s: [0], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, { t: 60, s: [360] }] },
      p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ t: 0, s: [60, 60, 100], i: { x: [0.5, 0.5, 0.5], y: [1, 1, 1] }, o: { x: [0.5, 0.5, 0.5], y: [0, 0, 0] } },
                     { t: 30, s: [100, 100, 100], i: { x: [0.5, 0.5, 0.5], y: [1, 1, 1] }, o: { x: [0.5, 0.5, 0.5], y: [0, 0, 0] } },
                     { t: 60, s: [60, 60, 100] }] },
    },
    shapes: [{ ty: "gr", it: [
      { ty: "rc", d: 1, s: { a: 0, k: [120, 40] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 12 } },
      { ty: "fl", c: { a: 0, k: [1, 0.85, 0.35, 1] }, o: { a: 0, k: 100 } },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
    ] }],
  }],
};

const Coin3D: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width / 3} height={height / 2} style={{ position: "absolute", right: 60, top: 80 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 5]} intensity={60} />
      <mesh rotation={[Math.PI / 2 + Math.sin(t) * 0.3, t * 2, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.22, 64]} />
        <meshStandardMaterial color="#ffd34d" metalness={0.7} roughness={0.25} />
      </mesh>
    </ThreeCanvas>
  );
};

export const SpikeLong: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const series = props.series[0];
  const L = 120, R = 1000, T = 520, B = 960;
  const ymax = Math.max(...series);
  const d = series.map((v, i) => `${i ? "L" : "M"}${(L + ((R - L) * i) / (series.length - 1)).toFixed(1)},${(B - ((B - T) * v) / ymax).toFixed(1)}`).join(" ");
  const cycle = (t % 12) / 10;                                   // the chart redraws every 12 s
  const ev = evolvePath(Math.min(1, cycle), d);
  const walk = (t * 90) % 2400 - 240;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${P.bg}, ${P.bg_bottom})`, overflow: "hidden" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {[0, 1, 2].map((k) => {
          const off = (t * (10 + k * 25)) % 1920;
          const y = 760 + k * 90;
          const hill = Array.from({ length: 9 }, (_, i) => `${i * 300 - off},${y - 80 * Math.abs(Math.sin(i * 1.7 + k))}`).join(" ");
          return <polygon key={k} points={`${-off},1080 ${hill} ${2400 - off},1080`} fill={P.panel} opacity={0.35 + k * 0.2} />;
        })}
        <path d={d} fill="none" stroke={A_.color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} style={{ filter: `drop-shadow(0 0 12px ${A_.color})` }} />
      </svg>
      <Person p={A_} x={walk} y={1040} s={1.1} t={t} />
      <Person p={B_} x={1700 - ((t * 40) % 600)} y={1040} s={1.0} t={t + 1} mood="wow" />
      <div style={{ position: "absolute", left: 1280, top: 640, width: 240, height: 240 }}>
        <Lottie animationData={LOTTIE as never} loop />
      </div>
      <Coin3D t={t} />
      <div style={{ position: "absolute", left: 80, top: 60, fontFamily: "Poppins", fontWeight: 800, fontSize: 64, color: P.text }}>
        Spike: minute {Math.floor(t / 60) + 1}
      </div>
    </AbsoluteFill>
  );
};
