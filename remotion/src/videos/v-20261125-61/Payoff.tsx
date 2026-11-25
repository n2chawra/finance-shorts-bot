// Payoff: "उसका नाम था उत्तरांचल। उत्तराखंड वो बना {fact5} में।" Close on the hills; a green road welcome board rises out
// of them on "नाम"; its name writes on, उत्तरांचल, on "उत्तरांचल"; on "उत्तराखंड" a brush paints the new name over it as
// the camera eases back; on "बना" a big year tag stamps above the board with a low hit.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { type StateFx } from "../../flat/india";
import { BI, CG, F, JH, MP, MapView, NEW, OLD, UK, UP, WelcomeBoard, lerpFrame } from "./props";

type Params = { fig?: { year?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const na = m.at("naam", 4), uc = m.at("uttaranchal", 12), ux = m.at("uttarakhand", 34), bn = m.at("bana", 50);
  const ease = m.lerp([ux, ux + 30], [0, 1]);
  const frame = lerpFrame(F.uk, lerpFrame(F.up, F.uk, 0.6), ease);
  const states: Record<string, StateFx> = {
    [MP]: { fill: OLD[MP]!, k: 0.4 }, [UP]: { fill: OLD[UP]!, k: 0.4 }, [BI]: { fill: OLD[BI]!, k: 0.4 },
    [CG]: { fill: NEW[CG]!, k: 0.4 }, [JH]: { fill: NEW[JH]!, k: 0.4 }, [UK]: { fill: NEW[UK]!, lift: 0.7 },
  };
  const yk = m.pop(bn, 10);
  const ys = 1 + (1 - Math.min(1, yk)) * 0.9;
  return (
    <Stage p={p} bg="#16354d" vignette={0.36}>
      <View zoom={1.04 + m.wave(80, 0.01) + 0.04 * m.pulse(bn + 2, 6)}>
        <MapView frame={frame} states={states} dim={0.6} />
        <WelcomeBoard x={540} y={1300 + m.wave(60, 3)} k={m.pop(na, 12)} name="उत्तरांचल" write={m.lerp([uc - 4, uc + 16], [0, 1])} next="उत्तराखंड"
          brush={m.lerp([ux, ux + 22], [0, 1])} t={m.t} />
        {yk > 0 ? (
          <g transform={`translate(540 430) scale(${ys}) rotate(-4)`} opacity={Math.min(1, yk * 2)}>
            <rect x={-230 + 10} y={-95 + 12} width={460} height={190} rx={40} fill={INK} opacity={0.4} />
            <Block x={-230} y={-95} w={460} h={190} r={40} fill="#ffc43d" sw={STROKE} shadow={false} />
            <Txt x={0} y={10} size={130} fill={INK} weight={900}>{year}</Txt>
          </g>
        ) : null}
      </View>
      <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={0.25 * m.pulse(bn + 1, 4)} data-probe="skip" />
    </Stage>
  );
};

export default Payoff;
