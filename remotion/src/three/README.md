# The 3D kit (`remotion/src/three/`)

Real 3D for the tech channel (`channels/how-tech-and-ai-actually-work-chips-ai-p/`): Branch-Education-style
cutaways and dives, and 3D character skits. Built on `@remotion/three` (`ThreeCanvas`) + `three` +
`@react-three/fiber` 8 + `@react-three/drei` 9 (the React 18 line; Remotion 4.0.536).

Everything is a pure function of `useCurrentFrame()`: no clocks, no `useFrame` deltas, no
`Math.random` (seeded `random()` only), no network (no HDRI, fonts or models fetched). The same
frame renders the same pixels, in any chunk order.

The demo, `Tech3DDemo` (Short, 12 s), uses every piece: `demo/Tech3DDemo.tsx`.

## Render

WebGL needs a GL backend in headless Chrome:

```bash
npx remotion still src/index.ts Tech3DDemo out.png --frame=60 --gl=angle
npx remotion render src/index.ts Tech3DDemo out.mp4 --gl=angle --concurrency=4
```

`--gl=angle` uses the GPU (Windows/macOS); on a Linux box with no GPU (the cloud routines) use
`--gl=swangle` (software, slower). `scripts/render.ts` (which `renderer/remotion.py` drives) does not
pass a GL option yet: a 3D video through the pipeline needs `chromiumOptions: { gl }` added there
(one line, left for the step that first renders a 3D timeline).

## How a director codes a beat

One beat = one `<Stage3D>` (or one Stage per video with a `<Sequence layout="none">` per beat, as in
the demo: one WebGL context is cheaper than remounting a canvas each beat). Inside it:

1. **A camera** — `<Camera3D keys={[...]}/>`. Write the shot list with `moves`:
   - `moves.pushIn(f0, f1, look, dir, d0, d1, fov?)` — along the line of sight, d0 → d1 away
   - `moves.orbit(f0, f1, center, radius, height, a0, a1)` — swing around (radians, 0 = from +z)
   - `moves.dolly(f0, f1, from, to, lookDir)` — slide sideways
   - `moves.crane(f0, f1, look, base, y0, y1)` — rise or sink, keeping `look` in frame
   - `moves.hold(f, pos, look)`; concatenate moves, keys are sorted by frame. A key with
     `orbit: true` is reached by swinging around the look-at point. `drift` adds a seeded float.
   Change on a spoken word: put the key's frame on that word's frame.
2. **Things** — `Proc.tsx`: `Block` (rounded box), `Board` (PCB + seeded traces), `ChipPackage`
   (substrate, pins, die, optional lid), `Die` (cores grid), `Pins`, `FinFET` (fins + gate +
   contacts, `gateOn` lights the gate), `Wire`, `Glass`, `Phone` and `PhonePartModel`
   (`back | battery | board | frame | screen`). Materials: `mat(preset, color?)`, presets `pcb`,
   `copper`, `gold`, `silicon`, `aluminium`, `glass`, `screen`, `gate`, `fin`… Units: about a metre
   = 1, models sit on y = 0 (the shadow floor).
3. **Moves of the things**:
   - `<ScaleZoom at={[f0, f1, …]} levels={[{ key, node, focus, ratio }, …]}/>` — the dive. Each
     level is modelled at a normal size; `focus` is where the next level sits inside it and `ratio`
     how many times smaller it is. `at[i]` is the frame level i fills the frame.
   - `<Explode start parts={[{ key, node, at, to, label, sub, labelAt, labelOffset, align }]}/>` —
     parts fly out along `to` on a spring, staggered; each label writes on once its part lands.
   - `<Cutaway normal from to start dur cap sheet>{model}</Cutaway>` — a plane slides from `from`
     to `to` (keeps `dot(normal, p) + d ≥ 0`); cut faces show the `cap` colour; `sheet` draws the
     knife.
   - `<SignalPath points start draw pulses speed color straight/>` — the track draws on, then
     pulses run along it (`straight` for board traces, curves otherwise).
4. **Words on things** — `<Label3D at offset text sub start end px color align/>`: dot, leader line,
   then the label writes on, facing the camera, `px` = font size on screen in output pixels (44+
   on a Short; the kit keeps it that size at any distance). Labels draw on top and are never cut.
5. **The cast** — `<Character3D cues={[{ f, pose, face, look }]} talk={[[from, to]]}/>`: poses
   `idle | point | shrug | surprised | wave | think`, faces `neutral | happy | surprised | worried |
   smug | talk`, blended on a spring at each cue; blinks are seeded; `talk` flaps the mouth.
   About 2.2 units tall. Our own design ("Byte"); recolour with `color`, `skin`, `hair`.

`Stage3D` props: `backdrop` (`dark` | `light` | gradient), `light`, `keyFrom`, `rim` colour,
`floor` (shadow catcher), `shadowBox` (keep it close to the subject's size for crisp shadows),
`vignette`, `dof` (a cheap blurred-edge look; there is no real depth-of-field pass yet).

Rules that keep it clean:
- Per-frame changes happen in render or `useLayoutEffect` (R3F draws in `ThreeCanvas`'s effect,
  after layout effects); `useFrame` only for things that need the camera (label size, billboards).
- Never pass a new material per frame: `mat()` caches by its arguments, so quantise animated
  values (as `FinFET gateOn` does).
- Labels and pulses set `userData.noClip` / `noFade`; anything else inside a `Cutaway` or a fading
  `ScaleZoom` level gets its own cloned material once.
- Figures: a label showing a number takes it from the script's `params.fig`, like the flat kit;
  never type a figure into a beat file.

## Known gaps

The research (`channels/how-tech-and-ai-actually-work-chips-ai-p/style-study/2026-11-18-references.md`,
"Kit gaps") ranks what the channel needs beyond this foundation. Not covered here yet:

- **Look pass**: bloom and real depth of field (`@react-three/postprocessing`; glow here is additive
  sprites, `dof` is a blurred-edge cheat), a reflective floor with a faint grid, PCSS shadows; the
  research's single amber accent (`#FFB23E`) instead of this kit's cyan default (pass `color`).
- **Hero assets and places**: GPU card, wafer, server rack, data-centre aisle, `Place3D` fly-through
  sets with volumetric light. `Proc` has only board / chip / die / FinFET / phone.
- **Word-timed camera**: `Camera3D` keys from `timeline.json` word events, fast dives with motion blur.
- **Figures on the word**: a count-up `FigLabel3D` from `params.fig`, dimension brackets, honesty tags.
- **Scale tools and overlays**: `InstancedField`, a scale badge on `ScaleZoom`, `Pointer3D`,
  `Highlight`, scan dome, beam bounce on `SignalPath`; `LookMorph` (textured → wireframe → clay).
- **Cast**: the character has no fingers, walk, sit or crouch, no extras, and no phoneme lip-sync
  (the mouth flaps on ranges).
- **Fonts**: labels use Poppins; the research proposes Barlow Condensed + Inter (owner's OK needed).
- **Pipeline**: `scripts/render.ts` needs `chromiumOptions: { gl }` before it renders 3D (see Render).
