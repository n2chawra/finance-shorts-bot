// Hook: "Squid Game cost Netflix {fact2}. What was it worth?"
// A pink-and-green playground arena at night under a giant red traffic light, a film camera marked NETFLIX rolling
// (frame 0). A red price tag with the show's cost swings down from the camera on "cost", the light flips green and
// the camera pushes in on "make", the tag spins round to its blank side on "So", and a big question mark stamps on it
// on "worth", close.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Flash, Stage, Tag, Txt, View, motion, type Motion } from "../../flat/kit";
import { Arena, NetflixCamera } from "./props";

type Params = { fig?: { cost?: string } };

/** The arena with the camera, shared with the loop. */
export const ArenaShot: React.FC<{ m: Motion; green: number; children?: React.ReactNode }> = ({ m, green, children }) => (
  <g>
    <Arena t={m.t} green={green} />
    <NetflixCamera x={160} y={760} w={340} t={m.t} />
    {children}
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const cost = (p.beat.params as Params).fig?.cost ?? "";
  const c = m.at("cost", 8), make = m.at("what", 40), so = m.at("what", 40), worth = m.at("worth", 70);
  const tag = m.lerp([c - 2, c + 10], [0, 1], Easing.out(Easing.back(1.6)));
  const green = m.t >= make ? 1 : 0;
  const flip = m.lerp([so - 2, so + 8], [0, 1]);
  const q = m.pop(worth - 1, 8);
  const push = m.lerp([make - 4, worth + 6], [0, 1], Easing.inOut(Easing.cubic));
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const front = flip < 0.5;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#1b1030" vignette={0.4}>
        <View zoom={1.0 + 0.3 * push} cx={540 - 120 * push + m.wave(50, 8)} cy={900 - 40 * push + m.wave(64, 6)}>
          <ArenaShot m={m} green={green}>
            {/* the price tag on its string from the camera */}
            <g transform={`rotate(${(1 - tag) * -40 + Math.sin(m.t / 9) * 3} 330 760)`} opacity={tag > 0 ? 1 : 0}>
              <Block x={326} y={600} w={8} h={160} fill="#ffffff" shadow={false} />
              <g transform={`translate(330 0) scale(${Math.max(0.05, sx)} 1) translate(-330 0)`}>
                {front ? (
                  <Tag x={140} y={460} w={380} h={150} text={cost} size={76} bg="#e9473b" fg="#ffffff" k={tag} />
                ) : (
                  <g>
                    <Tag x={140} y={460} w={380} h={150} text="" bg="#ffffff" k={1} />
                    {q > 0 ? <g transform={`translate(330 535) scale(${q}) translate(-330 -535)`}><Txt x={330} y={540} size={120} fill="#e9473b">?</Txt></g> : null}
                  </g>
                )}
              </g>
            </g>
          </ArenaShot>
        </View>
        <Flash k={m.pulse(make, 5) * 0.6} color="#3dff8a" />
      </Stage>
    </AbsoluteFill>
  );
};

export default Hook;
