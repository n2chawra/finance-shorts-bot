// Loop: "Montreal built its whole metro this way in {fact2}, and it has carried over {fact3} trips. Back in
// Paris, the tyres keep rolling."
// A bare-concrete Montreal station (wide): a blue-banded train glides in. "built": a plaque on the wall
// writes on the year; "whole": the network's coloured lines draw on along the wall; "metro": they finish;
// "way": the train's tyres glow under it; "carried": the camera moves to a departures board counting up the
// trips (medium); "trips": the figure lands and the train pulls out. "Back": cut to the dark Paris tunnel,
// headlights far off (wide); "Paris": the M sign lights; "tyres": the train comes on, its tyres turning;
// "rolling": the camera settles on the hook's first frame, so the Short runs straight back into it.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, cue, direct, FigLabel3D, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { CAR_LEN, MetroCar, MontrealStation, MTL_LIVERY, TYRE_R, Track, k01 } from "./Parts";
import { TUNNEL_DIR, TUNNEL_LOOK, TunnelShot } from "./Hook";

type Params = { fig?: { year?: string; trips?: string } };
const PLAQUE: [number, number, number] = [-3.4, 4.6, -4.95];
const BOARD: [number, number, number] = [2.6, 3.0, -4.9];

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const built = m.at("built", 12);
  const whole = m.at("whole", 22);
  const metro = m.at("metro", 30);
  const way = m.at("way", 44);
  const inW = m.at("in", 50);
  const yearW = m.at("year", 112);
  const andW = m.at("and", 58);
  const has = m.at("has", 64);
  const carried = m.at("carried", 70);
  const trips = m.at("trips", 104);
  const back = m.at("back", 124);
  const paris = m.at("paris", 134);
  const tyres = m.at("tyres", 146);
  const end = Math.max(m.end, back + 40);
  const fig = (p.beat.params as Params).fig ?? {};
  const inParis = f >= back;
  const arrive = cue(f, 0, Math.max(20, built + 20), Easing.out(Easing.cubic));
  const leave = cue(f, trips + 4, 40, Easing.in(Easing.quad));
  const tx = -9 * (1 - arrive) + 10 * leave;
  const keys = direct({}, [
    { at: 0, move: "push", look: [-0.6, 2.4, -1.8], dir: [0.3, 0.18, 1], from: 15, to: 13.5, dur: Math.max(8, carried), fov: 35 },
    { at: carried, move: "push", look: [BOARD[0] - 0.6, BOARD[1] - 0.9, BOARD[2]], dir: [0.25, 0.1, 1], to: 8.0, dur: Math.max(8, back - carried) },
    { at: back, move: "push", look: TUNNEL_LOOK, dir: TUNNEL_DIR, from: 16, to: 13.5, dur: Math.max(10, end - back), ease: Easing.out(Easing.cubic) },
  ]);
  // the tunnel clock: the hook's frame 0 is this beat's last frame, so the train meets the first frame
  const tf = f - end;
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={inParis ? { top: "#0b1226", bottom: "#030409", glow: "rgba(120,160,255,0.10)" } : { top: "#1d1c22", bottom: "#07070a", glow: "rgba(255,230,190,0.10)" }}
        floor={false} bloom={1.05} dof={0} blur={1} shadowBox={inParis ? 5 : 7}>
        <Camera3D keys={keys} seed="v2421-loop" />
        {!inParis && (
          <group>
            <MontrealStation f={f} map={k01(f, whole, Math.max(10, metro - whole + 6))} flash={m.pulse(andW + 3, 8)} />
            <Track length={30} />
            <MetroCar position={[tx, 0, 0]} livery={MTL_LIVERY} spin={tx / TYRE_R} bogie={{ tyreLit: Math.min(1, 0.6 * k01(f, way, 8) + 0.5 * m.pulse(yearW + 3, 10)) * (1 - k01(f, carried, 10)) }} />
            <MetroCar position={[tx - CAR_LEN - 0.3, 0, 0]} livery={MTL_LIVERY} cab={false} spin={tx / TYRE_R} />
            {/* the station sign */}
            <Block size={[2.6, 0.55, 0.06]} radius={0.05} material={m.pulse(yearW + 3, 10) > 0.4 ? mat("screen", "#1c6fd1") : mat("glossy", "#1c6fd1")} position={[-0.6, 5.6, -4.95]} />
            <Label3D at={[-0.6, 5.6, -4.9]} offset={[0, 0.0, 0.05]} text="Montréal" start={2} px={60} color={TECH.white} align="center" />
            {/* the year plaque */}
            <Block size={[1.6, 0.8, 0.06]} radius={0.05} material={mat("brushed", "#8a8f98")} position={PLAQUE} scale={[1, Math.max(0.02, k01(f, built - 2, 8)), 1]} visible={f >= built - 2} />
            <FigLabel3D fig={fig.year ?? ""} at={[PLAQUE[0], PLAQUE[1], PLAQUE[2] + 0.06]} face="front" height={0.5 + 0.08 * m.pulse(inW + 3, 8)} start={built} count={0} plate={false} color={m.pulse(inW + 3, 8) > 0.4 ? TECH.amber : "#14213d"} />
            {/* the departures board */}
            <Block size={[2.4, 1.3, 0.1]} radius={0.04} material={f >= has ? mat("screen", "#05070f") : mat("glossy", "#0b0f18")} position={BOARD} />
            <FigLabel3D fig={fig.trips ?? ""} caption="trips" at={[BOARD[0], BOARD[1] + 0.05, BOARD[2] + 0.07]} face="front" height={0.62} start={carried} count={Math.max(10, trips - carried)} plate={false} />
          </group>
        )}
        {inParis && <TunnelShot f={tf} m={m} flare={m.pulse(tyres + 3, 8) * 0.5} sign={k01(f, paris, 8)} />}
      </Stage3D>
    </Freeze>
  );
};
export default Loop;
