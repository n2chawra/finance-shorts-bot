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
