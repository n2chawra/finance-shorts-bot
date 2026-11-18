// "It was dug through the desert and opened in {fact2}, so ships could skip the long way round Africa."
// The old map goes sepia: small diggers swing spades along the line on "dug", sand heaps up either side on
// "desert", the water floods in down the cut and the year writes on on "opened"; on "ships" the camera
// pulls out over the whole of Africa and the old long route round it draws, then is crossed out on "Africa".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { CANAL, Canal, Digger, RED, VIA_CAPE, World } from "./props";

type Params = { fig?: { year?: string } };

const Diggers: React.FC<{ k: number; swing: number; heaps: number }> = ({ k, swing, heaps }) => {
  const at = useAt();
  const pts = CANAL.map((c) => at(c)).filter((p): p is [number, number] => !!p);
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 3)}>
      {pts.slice(0, 4).map(([x, y], i) => (
        <g key={i}>
          {heaps > 0 ? <ellipse cx={x - 40} cy={y + 10} rx={30 * heaps} ry={12 * heaps} fill="#d9bf86" stroke={INK} strokeWidth={2} /> : null}
          {heaps > 0 ? <ellipse cx={x + 40} cy={y + 14} rx={26 * heaps} ry={10 * heaps} fill="#d9bf86" stroke={INK} strokeWidth={2} /> : null}
          <Digger x={x + (i % 2 ? 26 : -26)} y={y + 6} s={70} swing={(swing + i * 0.3) % 1} />
        </g>
      ))}
    </g>
  );
};

const YearAt: React.FC<{ k: number; year: string }> = ({ k, year }) => {
  const xy = useAt()(CANAL[2]!);
  return xy ? <Tag x={xy[0] + 70} y={xy[1] - 160} w={230} h={96} text={year} k={k} bg="#ffffff" rot={-2} /> : null;
};

const CrossOut: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([20, -36.5]);
  if (!xy || k <= 0) return null;
  const s = 70 * Math.min(1, k * 1.3);
  return (
    <g stroke={RED} strokeWidth={18} strokeLinecap="round">
      <line x1={xy[0] - s} y1={xy[1] - s} x2={xy[0] + s} y2={xy[1] + s} />
      <line x1={xy[0] + s} y1={xy[1] - s} x2={xy[0] - s} y2={xy[1] + s} />
    </g>
  );
};

const Dug: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const dug = m.at("dug", 8), desert = m.at("desert", 24), opened = m.at("opened", 44), ships = m.at("ships", 80), africa = m.at("africa", 110);
  const out = m.lerp([ships - 4, ships + 22], [0, 1]);
  const scale = 16000 - 15400 * out;
  const center: [number, number] = [32.4 + -10 * out, 30.4 - 32 * out];
  return (
    <Stage p={p} bg="#b8a57c" vignette={0.45}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <World center={center} scale={scale}>
          <rect x={-2000} y={-2000} width={5080} height={5920} fill="#c8a36a" opacity={0.18 * (1 - out)} />
          <Canal k={m.lerp([opened - 6, opened + 26], [0, 1])} width={12 + scale / 2000} />
          <Diggers k={m.lerp([dug - 2, dug + 6], [0, 1]) * (1 - out)} swing={m.t / 18} heaps={m.lerp([desert, desert + 14], [0, 1])} />
          <YearAt k={m.pop(opened + 4, 12) * (1 - out)} year={year} />
          <MapRoute via={VIA_CAPE.slice(2, 12)} k={m.lerp([ships + 6, africa], [0, 1])} color="#ffffff" width={8} />
          <CrossOut k={m.lerp([africa, africa + 8], [0, 1])} />
        </World>
      </View>
    </Stage>
  );
};

export default Dug;
