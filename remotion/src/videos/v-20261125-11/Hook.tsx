// Hook: "What is Australia's 5,614 kilometre fence keeping out?" The whole of Australia on the old map with its flag
// from frame 0 and the fence line across it; the border traces on "Australia's", a light runs along the fence,
// a post sign with the length pops up, the camera pushes in and question marks pop on both sides.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Board, Fence, Map, QMark, mix, mixLL, type LL, SeaMarks } from "./props";

type Params = { fig?: { length?: string } };

export const WIDE: { center: LL; scale: number } = { center: [134, -27.5], scale: 1350 };
export const PUSHED: { center: LL; scale: number } = { center: [138, -28.6], scale: 1650 };

const Pins: React.FC<{ k1: number; k2: number; t: number }> = ({ k1, k2, t }) => {
  const at = useAt();
  const a = at([128, -23]), b = at([146, -33]);
  return (
    <g>
      {a ? <QMark x={a[0]} y={a[1]} size={130} k={k1} t={t} /> : null}
      {b ? <QMark x={b[0]} y={b[1]} size={130} k={k2} t={t} /> : null}
    </g>
  );
};

const PostSign: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  const xy = useAt()([139.5, -29.0]);
  if (!xy) return null;
  return <Board x={xy[0]} y={xy[1]} w={440} title="DINGO FENCE" value={text} k={k} />;
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.length ?? "";
  const au = m.at("australia's", 3), km = m.at("kilometre", 22), fe = m.at("fence", 30), ke = m.at("keeping", 40), ou = m.at("out", 50);
  const push = m.lerp([ke, m.end], [0, 1]);
  return (
    <>
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(90, 0.01)}>
        <Map center={mixLL(WIDE.center, PUSHED.center, push)} scale={mix(WIDE.scale, PUSHED.scale, push)} flag={1} trace={m.lerp([au, au + 30], [0, 1])}>
          <SeaMarks t={m.t} />
          <Fence run={m.lerp([km, km + 40], [0, 1])} flash={m.pulse(fe, 12)} />
          <PostSign k={m.pop(fe)} text={`${len} KM`} />
          <Pins k1={m.pop(ou)} k2={m.pop(ou + 6)} t={m.t} />
        </Map>
      </View>
    </Stage>
    <SourceLine p={p} />
    </>
  );
};
export default Hook;
