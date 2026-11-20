// "Kettle or mountain: which one surprised you more? Tell me in the comments. And next time you boil one,
// think of that mountain in Wales." Britain on the old map by day: a kettle pin glows on London, a mountain
// pin on Wales, a question mark bounces between them, a comment bubble pops up; the kettle steams on "boil";
// on "Wales" night falls and the camera pulls back out to space, landing on the hook's first frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { Britain, Bubble, ELIDIR, GOLD, Kettle, LONDON, QMark, RED } from "./props";
import { HookMap } from "./Hook";

const KettleAt: React.FC<{ k: number; steam: number; t: number }> = ({ k, steam, t }) => {
  const xy = useAt()(LONDON);
  if (!xy || k <= 0) return null;
  return <g opacity={Math.min(1, k * 2)}><Kettle x={xy[0] + 20} y={xy[1] - 70} s={110} steam={steam} t={t} /></g>;
};

const Between: React.FC<{ q: number; b: number; t: number }> = ({ q, b, t }) => {
  const at = useAt();
  const a = at(LONDON), c = at(ELIDIR);
  if (!a || !c) return null;
  const x = (a[0] + c[0]) / 2, y = Math.min(a[1], c[1]) - 180;
  return (
    <g>
      <QMark x={x} y={y} k={q} t={t} size={200} />
      <Bubble x={Math.min(700, x + 60)} y={Math.max(380, y - 260)} k={b} text="KETTLE?" />
    </g>
  );
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ke = m.at("kettle", 4), mo = m.at("mountain", 20), su = m.at("surprised", 45), co = m.at("comments", 75), bo = m.at("boil", 110), wa = m.at("wales", 140);
  const space = m.t >= wa;
  const out = m.lerp([wa, m.end - 2], [0, 1]);
  const scale = 26000 * Math.pow(1500 / 26000, out);
  return (
    <Stage p={p} bg={space ? "#060a18" : "#5f9fae"} vignette={0.35}>
      {!space ? (
        <View zoom={1.02 + m.lerp([0, wa], [0, 0.06])}>
          <Britain center={[-2.4, 53.0]} scale={6000}>
            <MapPin at={LONDON} k={m.pop(ke, 11)} color={RED} r={30} />
            <KettleAt k={m.pop(ke + 4, 12)} steam={m.lerp([bo, bo + 10], [0, 1])} t={m.t} />
            <MapPin at={ELIDIR} k={m.pop(mo, 11)} color={GOLD} r={30} />
            <Between q={m.pop(su, 10)} b={m.pop(co, 12)} t={m.t} />
          </Britain>
        </View>
      ) : (
        <View zoom={1.02}>
          <HookMap t={m.t} scale={scale} center={[-4.1 + 0.9 * out, 53.0 - 3 * out]} trace={m.lerp([wa, m.end], [1, 0.35])} flag={1 - out} pin={1 - out} leak={1 - out} wales={1 - out} />
          <Flash k={m.pulse(wa, 5)} />
        </View>
      )}
    </Stage>
  );
};

export default Loop;
