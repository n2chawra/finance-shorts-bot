// "So why pump a lake uphill? Because now the whole mountain is a battery, full of water, waiting." Dusk over
// the valley: a question mark bounces over the high lake, the lake ripples; on "battery" the camera pulls
// back as a battery outline draws itself round the whole mountain; its charge bars fill on "full"; on
// "waiting" the camera closes on a worker by the gate at the low lake, nodding off.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { useAt } from "../../flat/map";
import { ELIDIR, Lake, MARCHLYN, Mountain, PERIS, QMark, Tunnel, Valley, ZAP } from "./props";

const Cell: React.FC<{ draw: number; fill: number }> = ({ draw, fill }) => {
  const xy = useAt()(ELIDIR);
  if (!xy || draw <= 0) return null;
  const w = 620, h = 760, x = xy[0] - 60 - w / 2, y = xy[1] + 20 - h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={60} fill="none" stroke={INK} strokeWidth={26} pathLength={1} strokeDasharray={`${draw} 1`} />
      <rect x={x} y={y} width={w} height={h} rx={60} fill="none" stroke="#f4efe4" strokeWidth={14} pathLength={1} strokeDasharray={`${draw} 1`} />
      {draw > 0.95 ? <rect x={x + w / 2 - 80} y={y - 50} width={160} height={50} rx={12} fill="#f4efe4" stroke={INK} strokeWidth={8} /> : null}
      {[0, 1, 2, 3].map((i) => {
        const k = Math.max(0, Math.min(1, fill * 4 - i));
        return k > 0 ? <rect key={i} x={x + w - 70} y={y + h - 60 - (i + 1) * 120} width={40} height={100 * k} rx={8} fill={ZAP} stroke={INK} strokeWidth={5} /> : null;
      })}
    </g>
  );
};

const Q: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(MARCHLYN);
  return xy ? <QMark x={Math.min(820, xy[0])} y={xy[1] - 170} k={k} t={t} size={220} /> : null;
};

const Worker: React.FC<{ k: number; t: number; nod: number }> = ({ k, t, nod }) => {
  const xy = useAt()(PERIS);
  if (!xy || k <= 0) return null;
  const x = Math.min(760, Math.max(320, xy[0] + 140)), y = Math.min(1300, xy[1] + 40);
  return (
    <g opacity={Math.min(1, k * 2)}>
      <rect x={x - 150} y={y - 170} width={26} height={170} fill="#9aa0ad" stroke={INK} strokeWidth={5} />
      <rect x={x - 150} y={y - 170} width={120} height={24} fill="#d9483b" stroke={INK} strokeWidth={5} />
      <Char x={x} y={y} s={95} face={nod > 0.5 ? "neutral" : "happy"} blink={nod > 0.5} tilt={8 * nod + Math.sin(t / 10) * 2} armL={[20, 40]} armR={[20, 40]} outfit="tee" hat="#f2b134" />
    </g>
  );
};

const Shine: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(MARCHLYN);
  if (!xy || k <= 0) return null;
  return <ellipse cx={xy[0]} cy={xy[1]} rx={140} ry={90} fill="#ffffff" opacity={0.45 * k} />;
};

const Battery: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const uh = m.at("uphill", 20), mt = m.at("mountain", 50), wa = m.at("water", 95);
  const wy = m.at("why", 2), lk = m.at("lake", 25), bt = m.at("battery", 55), fl = m.at("full", 85), wt = m.at("waiting", 110);
  const back = m.lerp([bt - 4, bt + 18], [0, 1]);
  const close = m.lerp([wt - 2, wt + 16], [0, 1]);
  const scale = 800000 * (1 - 0.3 * back) * (1 + 1.2 * close);
  const center: [number, number] = [-4.088 - 0.022 * close, 53.131 - 0.012 * close];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(80, 0.012)}>
        <Valley center={center} scale={scale}>
          <Mountain glow={Math.max(m.lerp([fl, fl + 20], [0, 0.6]), 0.7 * m.pulse(mt + 6, 10))} />
          <Lake at={MARCHLYN} rx={170} ry={100} level={1} seed={2} rot={-0.3} t={m.t * (m.t > lk ? 3 : 1)} />
          <Lake at={PERIS} rx={240} ry={60} level={0.55} seed={5} rot={-0.65} t={m.t} />
          <Tunnel k={1} flow={m.lerp([uh, uh + 8], [0, 1]) * (1 - m.lerp([bt, bt + 10], [0, 1]))} up t={m.t} />
          <Shine k={m.pulse(wa + 6, 12)} />
          <Cell draw={m.lerp([bt, bt + 22], [0, 1])} fill={m.lerp([fl, fl + 24], [0, 1])} />
          <Q k={m.pop(wy, 10) * (1 - m.lerp([bt, bt + 8], [0, 1]))} t={m.t} />
          <Worker k={m.lerp([wt - 10, wt], [0, 1])} t={m.t} nod={m.lerp([wt + 10, wt + 20], [0, 1])} />
        </Valley>
      </View>
    </Stage>
  );
};

export default Battery;
