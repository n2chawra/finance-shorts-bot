// Leak: "With the engine off, the air holding its brakes slowly leaked away."
// Inside the brake cylinder in cross-section: the compressor's fan stops ("engine"); the pressure gauge
// needle starts to fall ("off"); air particles stream out past the seal ("air"); the piston backs off and
// the shoe lifts from the wheel ("leaked"); the needle reaches the red ("away").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View, rng } from "../../flat/kit";
import { MonoLabel } from "../../disaster/index";
import { AMBER, CREAM, Flat, RED } from "./World";

const INK = "#cfd8e6", STEEL = "#4a5568";

const Leak: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const engine = m.at("engine", 2), off = m.at("off", 14), air = m.at("brakes", 30), leaked = m.at("leaked", 46), away = m.at("away", 62);
  const fan = t < engine + 6 ? t * 0.5 : (engine + 6) * 0.5 + m.lerp([engine + 6, engine + 30], [0, 3]);
  const press = m.lerp([off, away + 8], [1, 0.06]);
  const back = m.lerp([leaked, away + 10], [0, 1]);
  const gap = back * 46;
  const r = rng("leak");
  const dots = Array.from({ length: 26 }, (_, i) => ({ ph: r() * 60, dy: (r() - 0.5) * 60, sp: 4 + r() * 4 }));
  const ang = (-210 + 240 * press) * (Math.PI / 180);
  const gx = 780, gy = 540, gr = 150;
  return (
    <Flat t={t} tag="general principle">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={m.lerp([0, m.end], [1.04, 1.12])} cx={540} cy={m.lerp([0, m.end], [820, 860])}>
          {/* the compressor (stops) */}
          <g transform="translate(220 520)">
            <circle r={110} fill="#1b2230" stroke={INK} strokeWidth={6} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-14} y={-96} width={28} height={92} rx={12} fill={STEEL} transform={`rotate(${fan * 40 + i * 90})`} />
            ))}
            <circle r={18} fill={INK} />
          </g>
          <MonoLabel t={t} at={0} x={110} y={380} text="COMPRESSOR" size={48} color={CREAM} />
          {/* the pressure gauge */}
          <circle cx={gx} cy={gy} r={gr} fill="#1b2230" stroke={INK} strokeWidth={6} />
          <path d={`M${gx + Math.cos(-210 * Math.PI / 180) * (gr - 22)},${gy + Math.sin(-210 * Math.PI / 180) * (gr - 22)} A${gr - 22},${gr - 22} 0 0 1 ${gx + Math.cos(-170 * Math.PI / 180) * (gr - 22)},${gy + Math.sin(-170 * Math.PI / 180) * (gr - 22)}`} stroke={RED} strokeWidth={18} fill="none" />
          <line x1={gx} y1={gy} x2={gx + Math.cos(ang) * (gr - 36)} y2={gy + Math.sin(ang) * (gr - 36)} stroke={press < 0.2 ? RED : AMBER} strokeWidth={10} strokeLinecap="round" />
          <circle cx={gx} cy={gy} r={16} fill={CREAM} />
          <MonoLabel t={t} at={0} x={gx} y={380} text="AIR PRESSURE" size={48} color={CREAM} anchor="middle" />
          {/* the pipe and the brake cylinder */}
          <rect x={300} y={700} width={60} height={160} fill={STEEL} />
          <rect x={150} y={850} width={420} height={200} rx={16} fill="#1b2230" stroke={INK} strokeWidth={6} />
          <rect x={160} y={860} width={360 - gap * 2} height={180} fill={`rgba(255,154,60,${0.12 + 0.5 * press})`} />
          {/* the piston and its rod to the shoe */}
          <rect x={520 - gap * 2} y={862} width={36} height={176} fill={INK} />
          <rect x={556 - gap * 2} y={932} width={180 + gap} height={36} fill={INK} />
          <MonoLabel t={t} at={0} x={170} y={820} text="BRAKE CYLINDER" size={48} color={CREAM} />
          {/* the wheel and the shoe */}
          <circle cx={850} cy={950} r={105} fill="#232a36" stroke={INK} strokeWidth={6} />
          <rect x={735 - gap} y={880} width={34} height={140} rx={6} fill={press > 0.35 ? AMBER : RED} />
          <MonoLabel t={t} at={leaked} x={880} y={1170} text="SHOE LIFTS" size={52} color={press > 0.35 ? AMBER : RED} anchor="end" />
          {/* air escaping */}
          {t >= air ? dots.map((d, i) => {
            const u = ((t - air + d.ph) * d.sp) % 260;
            return <circle key={i} cx={560 + u} cy={1060 + d.dy + u * 0.5} r={9} fill={CREAM} opacity={Math.max(0, 0.8 - u / 300) * (0.4 + press)} />;
          }) : null}
        </View>
      </svg>
    </Flat>
  );
};
export default Leak;
