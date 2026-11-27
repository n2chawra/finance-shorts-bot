// North: "पंजाब का बाज़, हिमाचल जुजुराना, उत्तराखंड मोनाल, उत्तर प्रदेश सारस।" From all of India down onto the Himalayan
// north; Punjab, Himachal, Uttarakhand and Uttar Pradesh paint in on their names with their birds' tags, drifting south-east.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { FillBeat } from "./Fill";
import { F, NORTH } from "./props";

const North: React.FC<SceneProps> = (p) => (
  <FillBeat p={p} id="north" names={NORTH} events={["punjab", "himachal", "uttarakhand", "up"]} from={F.india} to={F.north}
    drift={{ center: [F.north.center[0] + 1.2, F.north.center[1] - 0.8], scale: F.north.scale }}
    tagAt={{ Punjab: [75.2, 30.8], "Himachal Pradesh": [77.2, 32.0], Uttarakhand: [79.2, 30.2], "Uttar Pradesh": [80.8, 26.8] }} />
);
export default North;
