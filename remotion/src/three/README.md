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

**Pipeline wiring, not done here** (outside `src/three`): `scripts/render.ts` needs
`chromiumOptions: { gl }`, and `renderer/remotion.py` `HOOK_IMPORTS` needs `"../../three/"` before a
video's own beat files may import this kit. Its `HOOK_BANNED` list bans `useFrame` in beat files;
that is fine (beats never need it, the kit does it inside).

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
- **Pipeline**: the two `renderer/remotion.py` / `scripts/render.ts` changes above.
- **Fonts**: Poppins; the research proposes Barlow Condensed + Inter (owner's OK needed).
- **Later list** (not sample 1): skit cast (walk, crouch, sit, hold phone, extras crowd),
  `Inset3D` magnifier, analogy machines, diagram space, globe props.
