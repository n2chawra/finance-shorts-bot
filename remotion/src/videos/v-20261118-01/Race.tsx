// "Race the two routes, and the long way costs about {fact6} more days at sea, on a trip from Asia to
// Europe." Two ships set off from Shanghai side by side on "Race"; on "routes" one takes the canal (the
// way it was) and one the Cape, both routes drawing behind them; the Cape ship falls behind on "long"; an
// extra-days counter climbs over it on "days"; on "Europe" more ships follow it round Africa.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, Txt, View, countText, motion } from "../../flat/kit";
import { MapPin, MapRoute } from "../../flat/map";
import { GOLD, ROTTERDAM, SHANGHAI, VIA_CAPE, VIA_SUEZ, World, rider } from "./props";

type Params = { fig?: { days?: string } };

const Race: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const days = (p.beat.params as Params).fig?.days ?? "";
  const race = m.at("race", 4), routes = m.at("routes", 24), long = m.at("long", 50), dd = m.at("days", 70), eu = m.at("europe", 110);
  // both leave Asia together; the canal ship reaches the Red Sea while the Cape ship is still off East Africa
  const fast = m.lerp([race, m.end], [0.12, 0.5]);
  const slow = m.lerp([race, m.end], [0.12, 0.42]);
  const count = m.lerp([dd - 2, dd + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <World center={[62, -4]} scale={640}>
          <MapPin at={SHANGHAI} k={1} r={22} color="#d9483b" />
          <MapPin at={ROTTERDAM} k={1} r={22} color="#3b7dd8" />
          <MapRoute via={VIA_SUEZ} k={fast} color={GOLD} width={9} mover={(x, y, a) => <g>{rider(120, "#1f6b4a")(x, y, a)}<Tag x={x - 95} y={y + 34} w={190} h={84} text="SUEZ" bg={GOLD} k={m.pop(routes, 12)} /></g>} />
          <MapRoute via={VIA_CAPE} k={slow} color="#ffffff" width={7} mover={(x, y, a) => (
            <g>
              {rider(120, "#7a2f3a")(x, y, a)}
              <Tag x={x - 95} y={y + 34} w={190} h={84} text="CAPE" bg="#ffffff" k={m.pop(routes + 6, 12)} />
              {count > 0 ? (() => {
                const bx = Math.max(190, Math.min(740, x)), by = Math.max(330, y - 60);   // the box stays inside the frame as the ship sails
                return <g>
                  <rect x={bx - 150} y={by - 150} width={300} height={96} rx={16} fill="#ffffff" stroke={INK} strokeWidth={5} />
                  <Txt x={bx} y={by - 102} size={52} fill={INK}>{`+${countText(days, count)} DAYS`}</Txt>
                </g>;
              })() : null}
            </g>
          )} />
          {[0, 1, 2].map((i) => {
            const k = m.lerp([eu + i * 6, m.end], [0.02, 0.3 - i * 0.07]);
            return m.t >= eu + i * 6 ? <MapRoute key={i} via={VIA_CAPE} k={k} color="rgba(0,0,0,0)" width={1} dash={false} mover={rider(80, "#5a3a28")} /> : null;
          })}
          {m.t >= routes && m.t < long ? <MapPin at={[32.4, 30.5]} k={m.pop(routes, 12)} r={20} color={GOLD} /> : null}
        </World>
      </View>
    </Stage>
  );
};

export default Race;
