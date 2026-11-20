# Same-topic study (20 Nov 2026): Stanley cup and Nike Swoosh

Why: the owner liked our first two Shorts (Stanley v-20261120-07, Nike v-20261120-08) but found the same
images used many times and too few effects in how things appear. Owner: study only videos made of images
with a voiceover. Watched in the built-in browser, nothing downloaded; techniques only.

## What we watched

| Video | Channel | Views | Made of | Used? |
|---|---|---|---|---|
| Gi7Vy_2B_D8 "The Rise of Nike" (8:13, 2018) | Business Casual (1.15M) | 3.8M | archival photos + stock + motion graphics, voiceover | **yes: owner's pick** |
| SwHAZsODRy4 "Nike Paid Her $35…" (34 s) | small | 1.2K | AI stills + kinetic words | one technique only (AI imagery is never ours) |
| Stanley Shorts (rpC8TbuP4Rw 53K, b7jYBoWFMJM 26K, d-vZnXUTCvY 11K) | small | — | host on camera | skipped (not images + voice) |

Side find: every Nike "$35 Swoosh" Short in search sits at 31–1.8K views. The topic is crowded and tired; the
Stanley "$73M to $750M" Shorts top out around 2–3K too. Retell these only with a new angle.

## Business Casual: how the picture is made

- **2.5D depth shots.** A real photo split into layers: the background greyed and blurred, the subject
  (a person, a shoe) cut out in front, moving faster than the background. The **name in big heavy caps
  sits between the layers**, so the person overlaps the type (Phil Knight over his university, 45–60 s).
  Dust particles drift in front of the opening shot of the HQ.
- **Kinetic type on the picture.** "50 YEARS" and "$100 BILLION" land on the opening composite at
  different depths, in one brand colour (purple/teal), never in a box.
- **Then and now.** An old B&W print of the first store held over a present-day photo of a store
  (19 s): the past sits inside the present.
- **Labelled cut-outs for comparisons.** Cut-out cameras (Nikon, Canon, Zeiss, Leica) and shoes (Puma,
  Adidas) on a B&W shelf, each with a brand-colour label tab that pops in on its spoken name (62–76 s).
- **Emblems stamp onto archival photos** (the university seal over the campus, 52 s).
- **Transitions with shape.** Brand-colour ring/target wipes and a colour wash between sections (76–80 s),
  not only hard cuts.
- **Grade tells time.** B&W for the history, colour for today.
- Pace: a picture holds 4–8 s in the long video, but something always arrives (a label, a layer, a word).

## SwHAZsODRy4 (technique only)

One picture per sentence, each with one big 3D-styled word ("1971", "SKETCHED") over it, and a framed
inset photo sliding in at an angle. The pictures are AI; never ours.

## Mapped onto our kit (`remotion/src/doc/`)

| Their technique | We had | Change (built 20 Nov) |
|---|---|---|
| 2.5D depth with type between layers | flat `photo` pans only | `depth` layer (`Depth.tsx`) + `python -m generator.media cutout` |
| Things arrive with motion | hard `cut` only (22 of 22 cuts in the long sample) | `enter`: whip, zoom, focus, glitch, drop, iris, shutter, slide-up; auto-chosen when unset (`Transitions.tsx`) |
| Marks on the picture | none | `circle`, `arrow`, `stamp`, `date` overlays (`Annotate.tsx`) |
| Many pictures fast | one photo per layer | `montage` layer: punch / stack / grid (`Montage.tsx`) |
| Labelled cut-outs | `products` stage with labels | use it: the director's device minimum |
| One picture per sentence, never repeated | Stanley: 6 photos for 17 pictures; Nike: 3 sneaker photos 5 times | gate: a source once per Short (the loop's last picture may repeat the first) |

Left out: AI imagery, a host on camera, their brand colours or art.
