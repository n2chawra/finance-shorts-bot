# Champion recipe: How Tech Works

The writer follows this over the shared prompts' defaults (which often use money stories, a 28–35 s
length and money figures as examples). The hard rules do not change: true, sourced facts; figures from code or from a
sourced `facts` entry; one narrator; captions of every word. Sources: `research/advice.md`,
`research/style.json`, `style-study/2026-11-18-references.md`.

## The story

- **One thing, all the way down.** Every video follows one real thing (a chip, a phone, a cable, a model)
  or one everyday action (tap to pay, ask an AI, send a message) down to the mechanism, never skipping a
  causal step. If a step can't be shown accurately, the video doesn't promise it.
- **Topic kinds (Shorts):** zoom inside (2 in 5, cut from the week's long video), how a thing you use was
  invented (2 in 5), how a tech machine works (1 in 5). Gadget-inside Shorts only for a strong topic; AI
  skits are a weekly-loop test.
- **Topic kinds (long):** what happens inside X when you Y (2 in 4), how AI actually works (1 in 4), how
  the internet's hidden machinery works (1 in 4).
- **True:** every figure is a sourced fact (transistor counts, sizes, speeds, energy, dates) or computed
  from one by code. Comparisons ("as many as the stars in 300 galaxies") are computed from sourced figures.

## The first second

- **The subject is on screen and already moving at frame 0** (84% of the references show it by 2 s):
  a phone splitting into its layers, a chip seen as a city at night, the machine running in cutaway.
- **At most 2–3 words on screen** in the first second. Never a calm object resting on a plain backdrop
  (the weakest reference, 48K).
- The first spoken line names the thing and asks the question or states the surprising fact ("Inside this
  chip are 92 billion switches. Here's how one of them flips.").
- **No figure in the first 3 s unless it is the picture** (11% of the references); the first figure lands
  by about 10 s in a Short and 16 s in a long video, felt at body or city scale.

## Length and pace

- **Shorts: 45–60 s**, about 150 words a minute (110–150 words), a new picture every 3–5 s (the references
  median 5.6 s; we run faster), the payoff at about half to two thirds, the last line looping into the
  first frame.
- **Long: 7–8 minutes** (owner, 2026-11-18), about 155 words a minute. A big comparison within 10 s; a route map of the
  video by 60 s; 7–10 chapters of 40–145 s, each one scale deeper or one new part; a surprise at about 70%;
  climb back out to the opening action and loop to the first line. Chapter cards between chapters.

## The look (3D)

- **A lit 3D object on a dark studio stage** (reflective floor, soft key and rim light, one accent colour,
  bloom on glowing parts, depth of field), drawn with the 3D engine (`remotion/src/three/`). Flat cards
  (`remotion/src/flat/tech/`) only for lists, charts and sourced documents.
- **Every change on a spoken word**: a part lifts out, a cutaway opens, the camera dives, a label writes
  on, a signal travels a glowing path. The camera never stops; at least three shot sizes a video.
- **Scale dives** through levels (device → board → chip → core → transistor), each level with a scale
  badge and a familiar comparison.
- **Labels on the parts** (leader lines that write on), figures on things in the scene, from
  `params.fig`. "Illustration", "not to scale" or "3D recreation" tags where they apply.
- **No recurring cast**; a 3D character only in the AI-skit test. No footage, presenters or real clips.

## Sound

- The channel's own beds and effects (`channel.json` `sound`): a dark, low ambient bed well under the
  voice, soft whooshes, ticks and swells on the moments, the music dropping before each reveal.

## Words

- Plain words; a technical term the first time it's used comes with what it is ("a transistor, a switch
  with no moving parts").
- No "Did you know", no "Watch this", no hype ("revolutionary", "mind-blowing", "game-changer"), no AI
  script tics ("delve", "in today's world", "let's dive in", "it's important to note").
- Talk to the viewer about their own device once ("the phone in your hand").

## Every video its own device (owner, 2026-11-18)

Each video picks one main device, different from the last three, and names it in the plan (`device`):
**scale dive**, **explode and label**, **cutaway run** (the machine working, sliced open), **follow the
signal** (one bit or photon's journey), **look morph** (textured → wireframe → clay), **build it up**
(assembled part by part, as invented), **side by side at true size**, **counter** (a number climbing as
the machine works). The look and sound stay the channel's.
