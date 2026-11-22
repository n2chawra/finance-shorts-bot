# Directing a Going Down Short

Every beat is `"scene": "directed"` on the dive kit, `remotion/src/dive/` (read its README first). The whole Short is
one continuous world, and each beat only moves the camera:
- **hook:** the landmark at depth 0;
- **one beat per layer:** dive on the word that names it;
- **payoff:** pull back to show the whole stack, with the payoff figure on a thing;
- **loop:** ride up, and the last frame equals frame 1.

Draw every layer from the topic's sourced `layers` (kind, depth, name). Depth figures come from `params.fig`
placeholders, never typed. Each video gets a palette from the channel's look rotation, never one of the last 3.
Something moves in every layer (a train, a rider, a lamp, water).

The approved reference is the Grand Central sample, whose params example is in the kit README.

## The kit grows with the video (owner, 2026-11-22)

A layer the kit can't draw yet is added to it in this run, never a reason to skip or fail the topic
(`generator/prompts/routine.md` section 3c). Since 2026-11-22 the kit also has (README "Pieces", `more.tsx`):
- `room`: a carved room. Types: `living`, `stable` (animals), `press` (someone treading grapes), `storage` (jars),
  `church`, `kitchen`, `door` (a round stone door rolling shut on its word) and `tombs`.
- `hall`: a pillared hall (a flood tank, a cistern or a crypt).
- `passage`: `walk` (people with lamps) or `water` (a rushing channel).
- `pumps`: impellers, with water rising up the pipes.
- `pour`: floodwater pouring in.
- New surface presets, each with a readable name plate: `town`, `field`, `sea`, `mountain`, `pyramid`, `dome`
  and `arena`.

One piece per beat. A second layer in the same beat lands a full gap away at the frame's edge, so give the line
one piece that shows it all, and add a piece when none does. Signs fade when the camera is away from them, the
"not to scale" note shows only at the street, and pieces leave again in the last second so the loop matches.
