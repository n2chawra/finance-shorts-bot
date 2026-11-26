// "Stay Russian, or join the neighbours: which would you pick? Because for now, this piece of Russia is on its own."
// A Russian flag pops on the piece, Poland's and Lithuania's beside it, a pointer swings between them; the camera
// settles back on the hook's framing, the piece's border traces round and the gap east flashes (loops to the hook).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Limb, Stage, View, motion } from "../../flat/kit";
import { HOOK_VIEW, HookMap } from "./Hook";
import { Map, On, PIECE_C, Piece, Pole } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const st = m.at("stay", 2), jo = m.at("join", 16), pi = m.at("pick", 40), be = m.at("because", 56), pc = m.at("piece", 76), ow = m.at("own", 96);
  const settle = m.lerp([be - 2, be + 24], [0, 1]);
  const swing = Math.sin(m.lerp([pi, be], [0, Math.PI * 2]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01)}>
        {settle < 1 ? (
          <g opacity={1 - settle}>
            <Map center={[21.6, 54.3]} scale={11500 - 2500 * settle} colors={{
              Poland: { fill: "#f1ecec", k: m.lerp([jo, jo + 12], [0, 1]) }, Lithuania: { fill: "#f4d76a", k: m.lerp([jo + 4, jo + 16], [0, 1]) }, Russia: { fill: "#e8d4a2", k: 0 },
            }}>
              <Piece k={1} flagK={1} trace={1} />
              <On at={[PIECE_C[0] - 0.3, PIECE_C[1] + 0.1]} draw={(x, y) => <Pole x={x} y={y} flag="Russia" k={m.pop(st, 12)} t={m.t} />} />
              <On at={[PIECE_C[0] + 1.6, PIECE_C[1] - 0.5]} draw={(x, y) => (
                <g>
                  <Pole x={x} y={y + 380} flag="Poland" k={m.pop(jo, 12)} t={m.t} />
                  <Pole x={x + 40} y={y - 80} flag="Lithuania" k={m.pop(jo + 6, 12)} t={m.t} />
                  {pi < m.t ? <Limb a={[x - 220, y + 120]} b={[x - 220 + 140 * Math.cos(swing), y + 120 - 140 * Math.sin(swing) * 0.8]} w={14} color="#f2b134" sw={3} /> : null}
                </g>
              )} />
            </Map>
          </g>
        ) : null}
        {settle > 0 ? (
          <g opacity={settle}>
            <HookMap t={m.t} pull={0} trace={m.lerp([pc, pc + 24], [0, 1])} label={0} sea={1} reach={0} rest={0} gap={m.pulse(ow + 2, 14)} />
          </g>
        ) : null}
      </View>
    </Stage>
  );
};
void HOOK_VIEW;
export default Loop;
