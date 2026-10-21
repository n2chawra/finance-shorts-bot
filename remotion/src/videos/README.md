# Custom hooks: `videos/<video id>/Hook.tsx`

Each video's first seconds are written for that video (owner, 2026-10-21). The hook is the richest
frame of the video: the topic's world at its most extreme, the conflict on screen, the cast big.
Reference: `v-showcase-raise/Hook.tsx` (a split screen: the poor and the rich life getting the same
raise at the same moment), approved by the owner.

## Contract

```tsx
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { SETS } from "../../studio/sets";

const Hook: React.FC<SceneProps> = (p) => {
  const t = sec(p);                       // seconds into the beat (story clock)
  const P = p.beat.params as { ... };     // the beat's params: every string already filled by Python
  const k = at(p, "same", 1.2);           // the second an event (a spoken word) happens
  ...
};
export default Hook;
```

- **Imports only from** `react`, `remotion`, `@remotion/paths|shapes|noise`, and the kit:
  `../../studio/*` (SETS, CashStack, MoneyFlow, PhoneApp, Note, camera), `../../cast/*`,
  `../../scenes/kit` (Actor, at, sec, pop, clamp, ease), `../../fx/*`, `../../design/*`,
  `../../fmt/*`, `../../contract/*`.
- **Deterministic:** everything is a function of `t` and `p.beat` (`random("seed")` from remotion
  is fine); no `Math.random`, `Date`, timers, `window`, `document`, `fetch`.
- **No numbers of your own:** figures come from the beat's params (`"toast": "+{rich_amount}"`),
  never typed into the component.
- **Readable:** text at least 44 px in a Short (the layout probe measures it), clear of the bottom
  120 px and the top-left logo, inside the frame.
- Must type-check: `renderer/remotion.py hook_problems` runs these checks and `tsc` before every
  render. If the hook fails twice, delete it and let the beat render as a plain shot.
