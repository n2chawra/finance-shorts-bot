// "Spain once ruled Mexico as New Spain, from a whole ocean away." Spain at medium size with its flag; on "ruled" a
// galleon sets out from Seville and the camera rides along with it across the Atlantic, the route drawing behind;
// ATLANTIC writes on the sea; on "Mexico" Mexico comes into view in its colours; NEW SPAIN writes over it; on "away"
// the galleon arrives at Veracruz and a pin drops.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { ES_FILL, Galleon, GeoMap, MX_FILL, SEA, mix, type LL } from "./props";

const ROUTE: LL[] = [[-6.0, 37.4], [-8.5, 36.5], [-16, 28.3], [-40, 22], [-62, 18.5], [-75, 21], [-84, 22.5], [-96.1, 19.2]];
const LENS = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i]![0], p[1] - ROUTE[i]![1]));
const TOTAL = LENS.reduce((a, b) => a + b, 0);
/** [lon, lat] at fraction k of the route, and the stops passed. */
const along = (k: number): { at: LL; upTo: LL[] } => {
  let d = Math.max(0, Math.min(1, k)) * TOTAL;
  const upTo: LL[] = [ROUTE[0]!];
  for (let i = 0; i < LENS.length; i++) {
    const l = LENS[i]!;
    if (d <= l) {
      const a = ROUTE[i]!, b = ROUTE[i + 1]!, u = l ? d / l : 0;
      const at: LL = [mix(a[0], b[0], u), mix(a[1], b[1], u)];
      return { at, upTo: [...upTo, at] };
    }
    d -= l;
    upTo.push(ROUTE[i + 1]!);
  }
  return { at: ROUTE[ROUTE.length - 1]!, upTo: ROUTE };
};

const Track: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const { at: here, upTo } = along(k);
  const pts = upTo.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const xy = at(here);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <g>
      {pts.length > 1 ? <path d={d} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} /> : null}
      {pts.length > 1 ? <path d={d} fill="none" stroke="#fff4d0" strokeWidth={9} strokeDasharray="26 18" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {xy ? <Galleon x={xy[0]} y={xy[1] - 30} s={1.4} t={t} /> : null}
    </g>
  );
};

const Rule: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sp = m.at("spain", 2), ru = m.at("ruled", 12), mx = m.at("mexico", 24), ne = m.at("new", 34), oc = m.at("ocean", 50), aw = m.at("away", 62);
  const k = m.lerp([ru, aw + 4], [0, 1]);
  const ship = along(k).at;
  const cam = { center: [ship[0], ship[1] - 1.5] as LL, scale: 1700 };
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={980}>
        <GeoMap cam={cam} colors={{ Spain: { fill: ES_FILL, k: 1, flag: "Spain", trace: m.lerp([sp, sp + 20], [0, 1]) }, Mexico: { fill: MX_FILL, k: m.lerp([mx, mx + 12], [0.3, 1]), flag: "Mexico" } }}>
          <Track k={k} t={m.t} />
          <MapPin at={[-96.1, 19.2]} k={m.pop(aw)} />
          <MapLabel at={[-99, 24.5]} text="NEW SPAIN" size={60} type={m.lerp([ne, ne + 16], [0, 1])} />
          <MapLabel at={[ship[0] + 2, ship[1] + 5.5]} text="ATLANTIC" size={52} fill="#e8f4fa" type={m.lerp([oc, oc + 12], [0, 1])} />
        </GeoMap>
      </View>
    </Stage>
  );
};
export default Rule;
