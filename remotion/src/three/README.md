# The 3D kit (`remotion/src/three/`)

Real 3D for the tech channel (`channels/how-tech-and-ai-actually-work-chips-ai-p/`): Branch-Education-style
cutaways and dives, and 3D character skits. Built on `@remotion/three` (`ThreeCanvas`) + `three` 0.178 +
`@react-three/fiber` 8 + `@react-three/drei` 9 + `@react-three/postprocessing` 2 (the React 18 line;
Remotion 4.0.536).

Everything is a pure function of the frame: no clocks, no `useFrame` deltas, no `Math.random`
(seeded `random()` only), no network (no HDRI, fonts or models fetched), effects without history
between frames. The same frame renders the same pixels in any order (checked: 7 frames of
`Tech3DDemo2` rendered in two orders and sessions are pixel-identical).

Demos: `Tech3DDemo` (12 s: zoom, explode, cutaway, signals, character) and `Tech3DDemo2` (15 s:
the sample-1 kit: look pass, hero models, word-timed camera, places, figures, overlays, scale tools,
look morph). Stills in `channels/how-tech-and-ai-actually-work-chips-ai-p/samples/3d-demo/`.

## Render

WebGL needs a GL backend in headless Chrome:

```bash
npx remotion still src/index.ts Tech3DDemo2 out.png --frame=100 --gl=angle
npx remotion render src/index.ts Tech3DDemo2 out.mp4 --gl=angle --concurrency=4
```

`--gl=angle` uses the GPU (Windows/macOS); on a Linux box with no GPU (the cloud routines) use
`--gl=swangle` (software, much slower with the look pass on).

Measured on the owner's PC (GPU, `--gl=angle`, 1080×1920):

| | full render (concurrency 4, bundle included) | per frame | one still |
|---|---|---|---|
| `Tech3DDemo` (look pass on) | 360 frames in 2 m 17 s (before the look pass) | ~0.4 s | 2–4 s |
| `Tech3DDemo2` | 450 frames in 3 m 52 s | ~0.45 s (≈1.8 s per tab) | 2–5 s (12 s for the first, compiling shaders) |

**Pipeline wiring** (done): `scripts/render.ts` passes `chromiumOptions: { gl }` from `--gl` or
`REMOTION_GL` (set by `renderer/remotion.py` for a video whose own code imports this kit), and
`HOOK_IMPORTS` allows `"../../three/"`. Its `HOOK_BANNED` list bans `useFrame` in beat files; that is
fine (beats never need it, the kit does it inside).

## Thumbnails (`Thumb3D.tsx`, `../compositions/LongThumb3D.tsx`; 2026-11-20)

A long video's thumbnail can be a 3D scene: the spec says `"layout": "custom", "engine": "3d"` and the
video's own `Thumb3D.tsx` default-exports the scene (no camera moves, frame 0). LongThumb3D (1280×720)
mounts it in one `<Stage3D look="thumb">` and lays the 2D parts over it from the spec (`words` in
`studio/thumbType.tsx` `StackWords`: Anton, stacked left, one `*starred*` word yellow, a soft shadow, caps
≥ 11% of the height; `arrow`, `ring`, `badge`, `loupe`). `scripts/render.ts thumbnail` picks LongThumb3D
for `engine: "3d"` and turns WebGL on by itself (`angle`, `swangle` on Linux).

- `look="thumb"` (`THUMB_LOOK`): warm key, a strong cool rim and a warm kicker from behind (the
  warm/cool split), no fill (the shadow side falls to black), a dim environment, the void backdrop,
  bloom 1.35 from luminance 0.62, depth of field 5, vignette 0.72, no motion blur. Explicit props win.
- `<ThumbCamera target dist yaw pitch fov shift range/>`: a close 3/4 view that puts the focus on the
  target; `shift` 0.3–0.4 pushes the subject centre-right so the words sit left.
- `<Loupe x y r from>`: a magnifier, a second small stage in a ringed circle with a leader (a second
  WebGL context; one per thumbnail).

Demos (one still each, `--gl=angle`, 30–90 s on the PC with a cold bundle): `Thumb3DDemoInside` (P1),
`Thumb3DDemoHero` (P2), `Thumb3DDemoScale` (P3 with a loupe). Stills in
`channels/how-tech-and-ai-actually-work-chips-ai-p/samples/thumb3d/`.

## The disaster kit (`disaster/`, disasters channel; 2026-11-20)

For `channels/disasters-and-engineering-failures-expla/` (build spec: its
`style-study/2026-11-20-references.md` §3, §8, §9). Import from `../three` like the rest.

- **Looks** (`look.tsx`): `<DisasterStage look="nightGrid | blueprint | clay | chalk | storm | crossSection">`
  wraps Stage3D with the look's backdrop, floor, fog, lights and look pass, and gives every piece a
  painter (`useDLook().paint(role, colour)`): Clay Studio / Engineer's Cross-Section turn every role into
  warm clay with one accent (`clayMat()`: matte, sheen, a cheap sky-facing AO term). `RAMP` /
  `rampColor()`: grey → amber → red; red always means the failure.
- **Vehicles** (`Vehicles.tsx`): `Jet` (length, sweep, `engines` underWing / rear / tri, `perWing`, `tail`
  conventional / T, windows, girth, `span`, livery, gear; nose +x; `jetTailplaneAt()` gives the hinge). One
  `jetDims()` holds every proportion: drooped nose and upswept tail cone, a swept tapered fin on the
  top centreline with a rudder line, the stabiliser at its foot or (T) on its tip, airfoil-section
  wings thinning to the tip, root and belly fairings, nacelles with intake lip, fan, spinner and
  exhaust cone, cockpit glazing and window rows laid on the skin, a painted cheat line. `Train`
  + `Track` (power car `nose` loco / highSpeed / cab, n carriages, bogies with turning wheels, pantograph,
  per-car `poses` for a derailment), `Ship` (`hull` ferry / cargo / liner, decks, funnels, seeded
  containers, `bowDoors` 0–1 as clamshell or visor; waterline y=0, bow +x): a flared bow with an upright
  door face, a sheer line, painted deck, boot top and band; rounded deck houses with window rows, bridge
  wings, mast, lifeboats, a capped funnel.
- **Rotorcraft** (`Rotorcraft.tsx`, 2026-11-23): `Helicopter` (an S-76-shaped twin: drooped nose, tall cabin with big windows, roof engine fairing, four-blade main rotor, slim boom, swept fin, stabiliser, tail rotor on the left; `length`, `rotor`/`tail` blade angles, `blur` 0..1 to a spinning disc, `livery` body/band/belly/glass/rotor, `lights`, `wrap.body|rotor|tail`; nose +x, origin at the mast foot) and `Hills` (seeded rolling hill country with dry-grass tops, green gullies and chaparral bushes; `size`, `height`, `scale`, `ridge` along x at z = 0, `colors`; `hillHeight(x, z, opts)` gives the same surface in JS).
- **Structures** (`Structures.tsx`): `GirderBridge`, `TrussBridge` (spans, piers wall / columns),
  `Dam` (gravity / arch, `level` of the reservoir; a seeded valley terrain that frames a 9:16 shot
  from downstream; above 1 a streaming sheet pours over the crest and down the face, spray at the toe), `Building` (floors, bays,
  skin frame / glass / atrium, hung `walkways`), `Ride` (arm or coaster segment), `Member` (a strut a→b).
- **SuspensionBridge** (`Suspension.tsx`, 2026-11-24, for v-20261124-41 Tacoma Narrows): two lattice-braced steel towers, parabolic main cables, hangers per deck segment, anchorages and side spans; the main span is `segments` deck pieces whose height and roll follow `deckPose(s, {twist, bounce, waves, phase})` (the one-node torsional twist, the galloping wave), `girder` "plate" (solid side plates) or "truss" (open stiffening truss), `hot` paints the rolling parts along the ramp, `gap` + `fall` drop a stretch of deck (its hangers go), `sway` swings the stubs, `cars` puts cars on the deck. `DeckSection` is one slice of deck for close shots.
- **Every hero has `wrap` hooks** on the part that fails (`wrap.tailplane`, `wrapSpan[1]`,
  `wrapWalkway[4]`, `wrapArm`, `wrap[i]` per carriage…): put a `Failure3D` there.
- **Failure3D** (`Failure3D.tsx`): `stress` 0–1 recolours the part along the ramp (all of it, or a `hot`
  spot with `hotRadius`), glowing into bloom with a pulse near 1; `mode` + `progress`: `hinge` (pivot,
  axis, angle), `buckle` (sags and kinks between `span` x0..x1 in the vertex shader; plain boxes are
  re-tessellated automatically, other geometry needs its own segments), `shear` / `tear` (a `cut` plane
  splits the part with clipping planes; the far side slides and drops or peels about the cut; each cut
  face shows a solid cap a shade darker, lit as the cut plane). A buckled part's shadow bends with it.
  `debris`: seeded slow-motion pieces and amber sparks to a floor, `kind` metal (thin bent panels,
  metallic sheen) or concrete (sawn lumps with rebar stubs). Parts only, never people.
- **People** (`People.tsx`, owner 2026-11-22: "only showing death counts is not enough. Make that scenes. Don't
  make it very cruel or bloody"): `Crowd3D` (seeded clay figures without faces on an `area`; `mood` stand /
  dance / lookUp; `scatterAt` + `from`: everyone turns and hurries away from the failing part; `goneAt` fades
  them out for the empty floor after a cut) and `Rescuers` (hi-vis figures with head lamps that walk in on
  `enterAt` and bend over the debris). The failure never touches a figure on screen: dip to dust or black
  before contact, then show the aftermath with rescuers and lights.
- **Path3D** (`Path3D.tsx`): samples `{t, x,y,z}` or `{t, lat,lon,alt}` (+ `geo` projection) → a tube
  coloured by `v` on the ramp, a drop curtain to the ground, a dashed ground trace, `events` as Label3D
  callouts that write on as the head passes, a `marker` (a Jet) carried along with `bank`, and a `gap`
  so the tube doesn't run through it. `buildPath` + `pathPose(path, t)` put a camera or model on it.
- **Atmos3D** (`Atmos3D.tsx`): `CloudDeck` (noise sheet + soft sprite puffs lit from above, drifting), `Ocean` (faceted
  vertex-shader waves; `oceanHeight` / `oceanTilt` give the same surface in JS so a ship floats and
  rolls on it), `Smoke` (sprites on a fixed life cycle, optional fire-light `glow` at the base), `Rain`.

Demo: `Disaster3DDemo` (12 s, one look per scene: jet tailplane hinge on a path over clouds, a
girder bridge buckling, a ferry listing with bow doors open in rain, a dam filling). Stills in
`channels/disasters-and-engineering-failures-expla/samples/3d-kit/`.
- **HonestyTag** (`HonestyTag.tsx`): the channel's wording (`HONESTY_TAGS`, from channel.json
  `look.honestyTags`: "3D reconstruction · not actual footage" …), Courier Prime, top left; pass it in
  the stage's `overlay`.

Weak so far: the ocean is faceted (flat-shaded), labels don't follow a sag, the Label3D leader can
overshoot its box, cap shading assumes closed meshes.

## How a director codes a beat

One video = one `<Stage3D>`, one `<Sequence layout="none">` per beat inside it (one WebGL context;
only the live beat is mounted, so every beat can sit at the origin and keep crisp shadows).

1. **The stage** — `<Stage3D backdrop="void" floor="reflect" bloom dof blur fog overlay>`:
   - `backdrop`: `void` (near-black navy, the research's base), `dark`, `light`, or a gradient.
   - `floor`: `true` (shadows only), `"reflect"` (dark glossy blurred mirror + faint grid), or an object.
   - the look pass (on by default): `bloom` (only parts brighter than white glow: emissive > ~1,
     `glow()` materials, LEDs, pulses), `dof` (bokeh size; put the focus with `<Focus at range/>` in
     the beat, no Focus = all sharp), `blur` (motion blur from the camera's own speed), `vignette`,
     ACES tone mapping. `fog: { near, far }` for places.
   - `overlay`: DOM over the 3D (tags, lower thirds, pills, badges; below).
2. **The camera on the words** — `direct(p.beat.events, shots)` → `<Camera3D keys/>`
   (`Director.ts`). Each shot starts on a word: `hold`, `cut`, `push` / `pullback`, `dive` (3–10×
   closer in ~1 s, hard ease, it streaks), `orbit`, `crane`, `fly` (a smooth path through points,
   looking ahead), and `cuts` (one hard cut per listed word: a list read out). A move without a
   start continues from where the camera is. Lower level: `moves.*` keyframe builders and
   `cameraPose`. Motion blur follows automatically (never across a cut).
3. **Places** — `<Place3D kind="studio" | "serverHall" | "cleanRoom" | "desk"/>`: dark sets built
   around their origin, lit by glowing panels and a few lights; pair with `fog`.
4. **Things** — `Proc.tsx` (blocks, boards with routed traces/vias/pads and SMD parts, chip packages
   with brushed lids and caps, dies with a seeded floorplan that can glow, pins, FinFET, wires,
   glass, a phone and its parts) and `Hero.tsx` (`GPUCard` with spinning fans, fin stack, board,
   VRAM and an `open` explode; `Wafer` of iridescent dies with `pick` and `waferDieAt`;
   `ServerRack` with blinking LEDs; `LogicBoard` with stacked SoC, RF shields, connectors).
   Materials `mat(preset)`: `clay`, `glossy`, `brushed`, `silicon` (iridescent), `gold`, `copper`,
   `glass`…; `xray(color)` (fresnel see-through shell); `glow(color)` (blooms). Detail textures in
   `textures.ts` (`pcbTexture`, `dieTexture`), drawn from a seed.
5. **Moves of the things** — `ScaleZoom` (nested dive; streaks with blur), `Explode`, `Cutaway`,
   `SignalPath`, `LookMorph` (cues `textured → wire → clay → xray`, a glowing wipe between looks).
6. **Scale** — `InstancedField` (thousands of transistors / cells in one draw call: reveal from the
   centre, a travelling glow wave, `pick` cells; `fieldCellAt`), `ScaleCompare` (your thing beside a
   coin / card / hair / rice grain / person / blood cell at true relative size; `needsNotToScale`
   says when to add the tag), `<ScaleBadge>` overlay.
7. **Pointing at the answer** — `Pointer3D` (arrow lands, bobs, ring pulse), `Highlight` (wrap a
   thing: it tints and pulses amber), `ScanDome` (wire dome, sweeping band, radar rings).
8. **Words and figures** — `Label3D` (leader line + label, fixed screen size, kept inside the safe
   frame), `FigLabel3D` (a figure counting up on a thing; billboard or painted on a surface),
   `Bracket3D` (dimension bracket with its figure); overlays `LowerThird` (long videos),
   `TopPill` (Shorts), `Tag` (`recreation` "3D RECREATION", `illustration`, `notToScale`).
   **Every figure is a string from `p.beat.params.fig`** (Python formats it); the kit only counts it
   up (`countText`). `renderer/remotion.py` fails a beat file with a typed figure.
8b. **Air** — `Aero.tsx` (2026-11-26): `Airfoil` (a NACA 4-digit wing section extruded along z, flow
   toward +x, `aoa` tilts it nose-up), `foilSurface`, `streamlines(ys, {aoa, lift})` (flow lines that follow the
   section, rise ahead and bend down behind it with the tilt; an illustration, tag it so), `alongLine`/`lineU`
   (a parcel riding a line), `GlowLine` (a polyline that draws on, dashed and flowing), `PaperPlane`.
8c. **Show it working** — `Operation.tsx` (2026-11-28, owner note on L-20261127-21: "I have to hear things
   properly to understand rather than seeing"; director.md rule 13): `Operation3D` (input → the part that acts
   → output in one frame: `from`, `at`, `to`, frames `inAt` / `actAt` / `outAt`; the input travels in and is
   swallowed, `machine(act)` draws the part with `act` 0→1→0 on the verb, the output springs out and stays, a
   faint `ghost` of the input stays where it began, a track joins them), `Press3D` (a ready `machine`), and
   `GearTrain` (gears that push each other in order: each `r` and the `angle` from the one before; the next
   turns the other way at the teeth ratio, tooth in gap, `gearPoses` gives the same in JS; `hot` glows the one
   the line names). Demo `Operation3DDemo`. Use them on every line that says something acts on something.
9. **The cast** — `Character3D` "Byte" (poses `idle | point | pointLeft | shrug | surprised | wave |
   think`, faces, seeded blinks, `talk` ranges).

Rules that keep it clean:
- Per-frame changes in render or `useLayoutEffect` (R3F draws in `ThreeCanvas`'s effect, after
  layout effects); `useFrame` only for camera-dependent things inside the kit.
- Per-frame values shared with the effect pass (focus, blur) are stamped with the stage's absolute
  frame (`post.tsx`), so a beat inside a Sequence can't leave a stale one behind.
- Never pass a new material per frame: `mat()` caches by its arguments; quantise animated values.
- `userData.noClip` / `noFade` keep labels and pulses out of cutaways, fades, highlights and morphs.

## Known gaps (after the sample-1 round)

Covered: research gaps 1–8 (look pass, hero models, word-timed camera, places, figures and tags,
scale tools, overlays, look morph). Still open:

- **Look**: no PCSS contact-hardening shadows, no volumetric light shafts (fog + glowing panels
  stand in), metal close to a strong light can blow out (the coin in demo 2); colours are the kit's
  cyan + the research's amber (`#FFB23E`) for figures and highlights.
- **Hero models**: procedural and stylised; a GPU card or rack seen very close is cleaner than real
  (no screws, stickers or cable runs). No data-centre campus exterior, fibre bundle, atom lattice.
- **Camera**: motion blur is a screen-space streak (radial for dives, directional for pans), not
  per-object; very fast orbits show it as a smear.
- **Places**: four sets; no wiring tunnel, campus at dusk, fin hall or volumetric shafts.
- **Fonts**: Poppins; the research proposes Barlow Condensed + Inter (owner's OK needed).
- **Later list** (not sample 1): skit cast (walk, crouch, sit, hold phone, extras crowd),
  `Inset3D` magnifier, analogy machines, diagram space, globe props.
