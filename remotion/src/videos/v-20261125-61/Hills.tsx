// "{fact2} नवंबर को उत्तर प्रदेश के पहाड़ अलग हुए, और बना देश का स्टेट नंबर {fact3}।" The camera pans north over Uttar
// Pradesh; a date pin drops on "नवंबर"; the old state pulses on "उत्तर"; snow peaks rise along the hills on "पहाड़" as
// the camera pushes in; the hills lift off in blue on "अलग"; the camera eases back on "देश"; a number badge stamps on
// "नंबर", the name still a question mark.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CutLine, StateTag, type StateFx } from "../../flat/india";
import { AT, Badge, BI, DatePin, F, MapView, NEW, OLD, Olds, OnMap, Peak, UK, UP, lerpFrame, splitFx, CG, MP } from "./props";

type Params = { fig?: { day?: string; rank?: string } };
const PEAKS: [number, number][] = [[77.9, 30.9], [78.7, 30.6], [79.5, 30.3], [80.2, 29.9], [78.3, 30.2], [79.9, 30.8]];

const Hills: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const nv = m.at("navambar", 6), up = m.at("up", 16), ph = m.at("pahad", 30), al = m.at("alag", 40), de = m.at("desh", 62), nb = m.at("number", 76);
  const pan = m.lerp([0, 22], [0, 1]);
  const push = m.lerp([ph, ph + 20], [0, 1]);
  const back = m.lerp([de, de + 20], [0, 1]);
  const frame = lerpFrame(lerpFrame(lerpFrame(F.cg, F.up, pan), F.uk, push), lerpFrame(F.up, F.uk, 0.45), back);
  const split = m.t >= al;
  const states: Record<string, StateFx> = { ...splitFx([[MP, CG]], 0.2) };
  if (split) {
    states[UP] = { fill: OLD[UP]! };
    states[UK] = { fill: NEW[UK]!, lift: m.lerp([al, al + 12], [0, 0.9]), paint: m.lerp([al + 4, al + 20], [0, 1]), from: AT[UK] };
  }
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(up + 2, 8) + 0.03 * m.pulse(nb + 3, 7)}>
        <MapView frame={frame} states={states} dim={0.5}>
          <Olds fx={{ ...(split ? {} : { [UP]: { lift: 0.15 + 0.35 * m.pulse(up + 6, 10) } }), [BI]: {} }} />
          {split ? null : <CutLine state={UK} parent={UP} k={m.lerp([ph, al + 4], [0, 1])} />}
          <g data-probe="skip">
            {PEAKS.map((ll, i) => <OnMap key={i} at={ll}>{(x, y) => <Peak x={x} y={y} s={70} k={m.pop(ph + i * 2, 12)} />}</OnMap>)}
          </g>
          <StateTag state={UK} text="?" k={m.pop(nb + 6, 12)} size={52} dy={-150} />
          <Badge at={[79.6, 29.0]} k={m.pop(nb, 10)} top="स्टेट नंबर" value={fig.rank ?? ""} glow={m.pulse(nb + 8, 12)} dy={170} color="#ffc43d" />
          <DatePin at={[81.0, 30.2]} k={m.pop(nv, 12)} day={fig.day ?? ""} month="नवंबर" t={m.t} dy={-40} />
        </MapView>
      </View>
    </Stage>
  );
};

export default Hills;
