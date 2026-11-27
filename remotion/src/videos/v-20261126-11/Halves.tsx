// "Poland got the south. The Soviet Union took the north, with its ice-free port." The south half paints in with
// Poland's flag; the north half paints Soviet red and a star stamps on it; ice floes creep in along the far coast
// while the port's water stays open (an ICE-FREE sign); a warship and a cargo ship sail into the port.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { BALTIYSK, Dial, Map, On, PIECE_C, Piece, SOVIET, Ship, Signpost, Star, Waves } from "./props";

const FLOES: [number, number][] = [[18.2, 55.9], [18.9, 56.4], [19.9, 56.2], [17.6, 55.4], [20.6, 56.6], [17.9, 56.8]];

const Halves: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const po = m.at("poland", 4), so = m.at("soviet", 30), no = m.at("north", 50), ic = m.at("ice-free", 64), pt = m.at("port", 80);
  const close = m.lerp([pt - 6, pt + 16], [0, 1]);
  const sail = m.lerp([pt - 4, m.end], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[21.0 - 1.0 * close, 54.0 + 0.55 * close]} scale={9500 + 2500 * close} colors={{
          Poland: { fill: "#f1ecec", paint: m.lerp([po, po + 20], [0, 1]), from: [21.0, 53.9] },
          Russia: { fill: "#e8d4a2", k: 0 },
        }}>
          <Piece k={m.lerp([so, so + 14], [0, 1])} fill={SOVIET} trace={m.lerp([so, so + 24], [0, 1])} />
          <MapLabel at={[20.8, 53.55]} text="POLAND" size={56} k={m.pop(po + 8, 12)} />
          <On at={[21.3, 53.95]} draw={(x, y) => { const k = m.pop(po + 4, 12); return k > 0 ? <g transform={`translate(${x},${y}) scale(${k})`}><rect x={-6} y={-150} width={12} height={150} fill="#6b4a2a" /><FlagArt name="Poland" x={6} y={-150} w={120} h={80} /><rect x={6} y={-150} width={120} height={80} fill="none" stroke="#1d1a2b" strokeWidth={3} /></g> : null; }} />
          <On at={[PIECE_C[0] + 0.3, PIECE_C[1] + 0.05]} draw={(x, y) => <Star x={x} y={y} r={70} k={m.pop(no, 12)} />} />
          {FLOES.map((f, i) => <On key={i} at={[f[0] + 0.25 * m.lerp([ic, m.end], [0, 1]), f[1]]} draw={(x, y) => <Ball x={x} y={y} r={46 + (i % 3) * 14} ry={28} fill="#f4fbff" sw={3} shadow={false} />} />).slice(0, Math.round(6 * m.lerp([ic - 2, ic + 14], [0, 1])))}
          <On at={[BALTIYSK[0] - 0.35, BALTIYSK[1]]} draw={(x, y) => <Waves x={x} y={y} t={m.t} n={3} />} />
          <On at={[BALTIYSK[0] + 0.1, BALTIYSK[1] - 0.05]} draw={(x, y) => <Signpost x={x} y={y} w={340} text="ICE-FREE" size={52} k={m.pop(ic + 4, 12)} />} />
          <On at={[BALTIYSK[0] - 1.1 + 0.85 * sail, BALTIYSK[1] + 0.05]} draw={(x, y) => <Ship x={x} y={y} s={120} war rock={m.wave(40, 3)} />} />
          <On at={[BALTIYSK[0] - 1.5 + 0.9 * sail, BALTIYSK[1] - 0.12]} draw={(x, y) => <Ship x={x} y={y} s={110} rock={m.wave(46, 3)} />} />
        </Map>
      </View>
      <Dial pos={0.5} />
    </Stage>
  );
};
export default Halves;
