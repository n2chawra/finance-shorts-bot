// West: "राजस्थान गोडावण, गुजरात फ्लेमिंगो, मध्य प्रदेश दूधराज, महाराष्ट्र हरियल।" The camera slides west and down over the
// Thar to the Deccan; Rajasthan, Gujarat, Madhya Pradesh and Maharashtra paint in with their birds, a push in on Maharashtra.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { FillBeat } from "./Fill";
import { F, WEST } from "./props";

const West: React.FC<SceneProps> = (p) => (
  <FillBeat p={p} id="west" names={WEST} events={["rajasthan", "gujarat", "madhya", "maharashtra"]} from={F.north} to={F.west}
    drift={{ center: [F.west.center[0] + 0.6, F.west.center[1] - 1.4], scale: F.west.scale * 1.25 }}
    tagAt={{ Rajasthan: [73.8, 26.8], Gujarat: [71.6, 22.6], "Madhya Pradesh": [78.2, 23.6], Maharashtra: [76.0, 19.4] }} />
);
export default West;
