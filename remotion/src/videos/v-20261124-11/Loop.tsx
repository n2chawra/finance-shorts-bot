// "Mountains or the British: which really saved it? Tell me. And next time someone asks you," A peak pops on the
// left and a British flag on the right of Lesotho, a comment bubble between them; then the camera pulls back over
// South Africa to the hook's first framing, Lesotho's flag fading to the plain gap, which flashes.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Stage, Txt, View, motion } from "../../flat/kit";
import { FlagArt } from "../../flat/flags";
import { HOOK_START, HookMap } from "./Hook";
import { LESOTHO_C, Peak } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mo = m.at("mountains", 2), br = m.at("british", 18), sa = m.at("saved", 34), te = m.at("tell", 50), ne = m.at("next", 66), as = m.at("asks", 84);
  const back = m.lerp([ne - 4, m.end - 4], [0, 1]);
  const pick = 1 - m.lerp([ne, ne + 12], [0, 1]);
  const glow = m.pulse(sa + 6, 14);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(90, 0.01) * (1 - back)}>
        <HookMap center={[LESOTHO_C[0] + (HOOK_START.center[0] - LESOTHO_C[0]) * back, LESOTHO_C[1] - 0.25 + (HOOK_START.center[1] - LESOTHO_C[1] + 0.25) * back]}
          scale={10000 - (10000 - HOOK_START.scale) * back} trace={1} hole={0.35 + m.pulse(as + 6, 12)} edge={1 - back} flag={1 - back} label={1 - m.lerp([ne, ne + 10], [0, 1])} sa={Math.max(0, Math.min(1, (back - 0.3) / 0.4))} />
        {pick > 0 ? (
          <g opacity={pick}>
            <g transform={`translate(0,${-40 * glow})`}>{m.t >= mo ? <Peak x={290} y={620} s={220 * Math.min(1, m.pop(mo, 12))} /> : null}</g>
            {m.t >= br ? (
              <g transform={`translate(${720},${420 - 40 * glow}) scale(${Math.min(1, m.pop(br, 12))})`}>
                <FlagArt name="United Kingdom" x={0} y={0} w={240} h={160} />
                <rect x={0} y={0} width={240} height={160} fill="none" stroke="#1d1a2b" strokeWidth={5} />
              </g>
            ) : null}
            {m.t >= te ? (
              <g transform={`translate(540,330) scale(${Math.min(1, m.pop(te, 12))})`}>
                <Ball x={0} y={0} r={110} ry={80} fill="#ffffff" />
                <Txt x={0} y={16} size={48} fill="#1d1a2b">YOU?</Txt>
              </g>
            ) : null}
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Loop;
