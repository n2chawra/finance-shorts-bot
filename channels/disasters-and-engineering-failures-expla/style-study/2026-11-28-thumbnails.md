# Disaster Desk thumbnail playbook (2026-11-28)

Why: our four long videos got 312, 275, 274 and ~0 impressions at 0.7–3.8% CTR and 0–16 views. Three of the four
covers were flat cartoon drawings (Titan, Colgan, Texas City) and none named the event ("ALREADY DAMAGED", "PULLED THE
WRONG WAY", "IT WAS FULL"). Our viewers are men 55+ (65+ is 30%): they click the real thing, not a cartoon. Studied:
the most viewed long videos on our own topics (YouTube search by views, 28 Nov), read at phone size.

| Video | Channel | Views | What the cover is |
|---|---|---|---|
| Implosion Titan Oceangate How it Happened | AiTelly | 17.0M | the real sub in realistic 3D, OceanGate on the hull, "IMPLOSION · HOW IT HAPPENED", a "3D ANIMATION" tag |
| Oceangate Submarine Disaster - What REALLY Happened | Two Bit da Vinci | 15.9M | the real sub huge, its logo readable, a yellow ring on the failing part, "WHAT REALLY HAPPENED?" |
| The CRASH that Changed US Aviation | Mentour Pilot | 2.3M | the Q400 in realistic 3D in Continental Connection livery, banking over a night town, "DEADLY REACTION!" |
| The Hyatt Regency Walkway Collapse | Fascinating Horror | 1.67M | the real aftermath photo, the event's name as the title |
| Hundreds Crushed to Death: The Hyatt Skywalk Tragedy | How to Survive | 1.46M | the walkways above the crowded atrium a moment before, an arrow, "MINUTES BEFORE DEATH" |
| Fast-Tracked Failure: The Hyatt Regency Walkway Collapse | Brick Immortar | 1.20M | "HYATT · WALKWAY COLLAPSE" huge over the realistic 3D atrium |
| Inside the Hyatt Regency Skywalk Collapse | Stewart Hicks | 1.20M | the walkway in 3D, the people under it in red, an arrow, "DESIGNED TO FAIL" |
| The Design Change That Took 114 Lives | Deconstructed | 1.13M | intended vs built split of the one connection, green tick / red cross, "ONE CHANGE, 114 LIVES LOST" |
| This Tiny Change KILLED 114 People | Mentour's Black Box | 586K | the connection cut out in 3D with the walkways behind, "FATAL BY DESIGN" |
| Updated BP Texas City Animation | USCSB | 2.27M | the real refinery in realistic 3D, the blast column rising |

## 1. What every hit shares

1. **The real subject, recognisable at 168 px**: the hull with its maker's name, the airliner in its livery, the
   atrium, the refinery. Never a generic plane, sub or tank.
2. **Realistic**: 3D with real materials and light, or a licensed real photo. No flat cartoon drawing in any hit.
3. **The event named**, in the words or on the subject itself (HYATT, IMPLOSION, the logo), or the human stakes
   shown (people under the walkway, "114 LIVES").
4. **One focal subject filling 40–70%**, a moment before or at the failure, dark or night setting, red only on what fails.
5. **0–5 words**, heavy sans, white plus one accent (yellow or red).

## 2. Patterns (`pattern_id`)

| Id | Pattern | Best for |
|---|---|---|
| P1 | THE REAL THING: the vehicle or structure in realistic 3D, its mark readable (livery, logo, name), a beat before the failure in its real setting | every story (default A) |
| P2 | THE PEOPLE AT RISK: the structure with the people under or inside it at true scale (red silhouettes, never injuries), an arrow to the failing part | buildings, bridges, rides, ferries |
| P3 | INTENDED vs BUILT: a split of the one changed part, as designed and as built, tick and cross | design changes, corner cuts |
| P4 | THE NAME AS TITLE: the event's name huge over its realistic place (3D or licensed photo) | famous names (Hyatt, Tacoma, Challenger) |
| P5 | THE PART THAT FAILED: a 3D cutaway of the failing part glowing red, one label, the whole machine behind | mechanical, air and space |
| P6 | THE SCALE OF IT: the aftermath's size in 3D (smoke column, the gap in the span), no bodies | explosions, collapses |

Pick A, B and C with three different patterns: a crash A = P1, B = P5, C = P4; a structure A = P2, B = P3, C = P4;
an explosion A = P1, B = P6, C = P4.

## 3. Hard rules

- Drawn with `remotion/src/three/` (and `disaster/`), or the doc kit with a licensed photo (`generator/media`). Never
  the flat kit alone: lint checks the thumbnail's imports (`thumbs.kits`).
- `mark` in each spec: what makes this subject recognisable ("Continental Connection livery on the tail", "OCEANGATE on
  the hull", "HYATT in the words"). Lint requires it. The livery or logo is the real one, used only to identify.
- Name or show the event: either its name in the words, or the mark on the subject that its fans know.
- At most 4 words. Never the answer or the twist ("THE PILOT PULLED UP" is the answer; "DEADLY REACTION" is the hook).
- Small "3D RECONSTRUCTION" tag allowed (AiTelly's "3D ANIMATION" shows it sells); keep it under 4% of the frame.
- No victim's face, no blood, no bodies. Bottom-right corner clear for the duration stamp.

## 4. Never

A flat cartoon vehicle; a generic stand-in for a named aircraft, ship or building; a phrase that could be any disaster
("IT WAS FULL"); a screen or gauge as the hero; more than one focal subject.

## 5. Checklist (score each, ship only at 8+)

1. The real subject fills 40–70% and reads at 168 px wide.
2. Realistic 3D or a real photo; no flat drawing.
3. Its mark (livery, logo, shape, name) is readable at phone size.
4. The event is named or its fans would know it at a glance.
5. 4 words or fewer, two colours, heavy sans.
6. The moment is a beat before or at the failure, with tension.
7. Red only on what fails; dark setting; one accent colour.
8. Promises what the title says, never the answer.
9. Bottom-right corner clear; no face, no gore.
10. Next to the topic's hits in `python -m renderer.thumbs feed`, it would win a click.
