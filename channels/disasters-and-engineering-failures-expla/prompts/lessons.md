# Lessons from our own videos

Each lesson is a mistake that cost viewers, written by the reviewer (agents/reviewer.md) from where viewers
left. The writer follows them and QA enforces them. A new channel starts with channel #1's general ones.

## 1. The first frame names the subject (general)
Seen in: channel #1's first month, 55–76% swiped away when the title and first second held the subject back.
Fix: the title and the first spoken sentence name who or what the video is about.

## 2. Only what is true (general)
Seen in: channel #1, invented examples lost to real, named stories.
Fix: a true channel tells sourced facts about real, named people or things; a fiction channel says so.

## 3. No reaction shots (general)
Seen in: channel #1, shots of a character reacting were where viewers left.
Fix: every picture shows the thing being said.

## 4. The payoff is the most surprising fact (general)
Fix: hold the most surprising figure or fact for the payoff, and make the last line loop into the first.

## 5. Realistic 3D, never grey boxes (owner review of the samples, 2026-11-21)
Seen in: samples L-20261121-41 and v-20261121-41 (Hyatt walkways). The atrium and walkways read as blocky grey
boxes, and the Short's 3D was washed-out pale blue with no subject. The hits (Fault Lines' Learjet 3D, 1.94M)
are smooth, lit and cinematic, and viewers judge the 3D in the first 3 seconds.
Fix: every 3D shot has proper materials (steel, concrete, glass, paint, with roughness and wear), a light
setup with a key light, shadows and a dark background, the real structure's detail (rails, bolts, beams,
windows, people-free crowd hints such as tables and chairs), the subject big in frame, and a smooth camera move
(push-in, orbit or drop). QA fails a 3D shot that is flat-lit, pale, empty or box-like.

## 6. Reconstruction first, diagrams as inserts (2026-11-21)
Seen in: the long sample spent most of its time on flat blue blueprint diagrams.
Fix: at least half of every video's runtime is in the lit 3D world (the place, the vehicle or structure, the
failure). Diagrams are quick inserts of 3–6 s that explain one thing and cut back to the 3D. The same look
never covers more than ~30 s in a row.

## 7. The failure moment is the hero shot (2026-11-21)
Seen in: the Short's failure was invisible, and the long's first cut was a small orange block.
Fix: the failing part fills the frame in 3D cutaway: stress grey to amber to red on the exact part, 0.6–1 s
silence, the part giving way (shear, hinge, tear) with metal debris and sparks, the sub-boom, then the wide
shot of the consequence (no bodies). The Short's first frame is this part a second before failure, already amber.

## 8. Nothing collides, nothing is cut (2026-11-21)
Seen in: the Short's captions sat on diagram labels ("hanger ran through" over "2ND FLOOR WALKWAY"), labels
were clipped ("ITS O", "DESIG"), and a callout overflowed its box.
Fix: diagrams and labels stay above the caption band (captions end 340 px above a Short's bottom edge); every
label box is sized to its text; labels ≥44 px in Shorts. QA checks every still for overlap and clipping.

## 9. Judge the real format (2026-11-21)
Seen in: the long sample was a 65 s cut, which can't show whether an 8–10 min story holds viewers.
Fix: the long video's first 60 s must work as a complete hook (the whole arc, the promise of the cause chain),
and every chapter opens with a new 3D place or angle. Retention is decided over minutes 1–3, so pace those as
carefully as the opening.

## 10. The voice must carry tension (2026-11-21)
Seen in: Kokoro's narration is clean but flatter than the references' human narrators.
Fix: short sentences, a pause after each, the speed slowed for the failure line and quickened for the
build-up, silence used as a tool, and the music rising in the gaps (the bed's duck). Never a long list read
in one breath.

## 11. Narration is never slow (general)
Seen in: the owner's notes on How Tech Works (Shorts), Disaster Desk (long) and Rise & Fall: "increase the pace".
Fix: no channel's narrator speaks under about 164 words a minute in a Short or 189 in a long video (generator/pack.py MIN_SPEED enforces it).

## 12. Show what happens, not only the count (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: "only showing death counts is not enough. Make that scenes."
Fix: when a line says what happened to people or things, the beat shows it happening in the place (the crowd under the walkway, the cars on the bridge), never gory (director.md).

## 13. Every picture once (general)
Seen in: Rise & Fall, 20 Nov: "the same 3 sneaker photos reused and almost no effects" (two Shorts marked stale).
Fix: a photo or picture is in one beat of a Short (the loop beat may repeat the first), two of a long video at most; the code check fails a repeat (renderer/remotion.py picture_once_problems).

## 14. A named place, company or person shows its real mark (general)
Seen in: Geography's Russia Short, 23 Nov: "Where is the flag of Russia??" (its area grew in plain red); earlier notes on the first finance channel's Shorts.
Fix: a country on the map shows its flag (the code check fails a map video whose named country never gets one), a company its logo, a person their photo head.

## 15. A long video's first sentence states the stakes (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: the hook was "good only for people who want to see the full video".
Fix: the first sentence says the small cause and how big it got, in plain words (agents/studio.md); the title stays free of it.
