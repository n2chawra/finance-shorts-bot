---
name: yt-style
description: Watch a YouTube video or Short the owner links (in the built-in browser, never downloaded) and break down how it is animated: pacing, camera, characters, text, colour, transitions, sound. Then map each technique onto our Remotion kit and say what we have, what we lack and what to change. Use when the owner says "analyze this video/channel style" or pastes a YouTube link to study.
argument-hint: <youtube url> [more urls]
---

# Study a YouTube video's animation style

The owner gives one or more YouTube links (videos or Shorts). Watch each one, describe how it is
made, and turn that into concrete changes for Paisa Panchayat's videos. **Analyze and propose
only**: change no code until the owner says go.

## Rules

- **Never download** the video, audio, thumbnail or transcript (no yt-dlp, no saving frames to the
  repo). Watch it in the built-in browser (`mcp__Claude_Browser__*`) and take screenshots there.
- **Ours stays original.** Describe techniques (timing, motion, layout, colour logic), never copy
  their characters, logos, art or words. Quote at most one line under 15 words.
- Keep it quick: about 15–25 screenshots per video, a single pass. Don't watch the whole long video in
  real time.

## 1. Open and read the basics

1. `preview_start` with the URL. For a Short (`/shorts/<id>`), open `https://www.youtube.com/watch?v=<id>`
   instead: the watch page lets you seek.
2. Dismiss the consent banner with the most privacy-preserving option. Skip or wait out ads.
3. `get_page_text`: note the channel, title, views, upload date and length. Read the thumbnail and
   title as a pair (the promise the video makes).

## 2. Sample frames

Pause the player and seek with `javascript_tool`, then screenshot:

```js
const v = document.querySelector("video"); v.pause(); v.currentTime = 12; await new Promise(r => setTimeout(r, 700)); v.currentTime
```

- **Opening:** 0, 0.5, 1, 2, 3, 5 s (the hook decides the first-second retention).
- **Body:** a Short every 2–3 s; a long video every ~20 s plus a 5-frame burst (every 0.5 s) at
  two moments, to see how motion and cuts behave up close.
- **Ending:** the last 5 s (CTA, loop, end screen).
- To measure the pace, play 10 s at normal speed in the body and count the picture changes
  (cuts, scene swaps, big camera moves) from screenshots taken every second.

Sound can't be heard here: note what the frames suggest (on-screen SFX words, music changes at
cuts) and say that the sound wasn't checked.

## 3. Write the breakdown

For each video, cover:

| Area | What to note |
|---|---|
| Hook | what is on screen in frame 0 and in the first 3 s; question, number, character, motion? |
| Pace | seconds per new picture; cuts vs continuous motion; how long a still lasts |
| Camera | zooms, pans, punch-ins, shake, parallax layers; on which words |
| Characters | style (line weight, proportions, faces), acting (poses, expressions, lip sync), how many on screen |
| Worlds | backgrounds: flat colour, set pieces, depth layers, props |
| Text | font, size, how much text, entrance animation, where it sits, highlight colour |
| Numbers / data | how figures and charts appear and move (count-up, bars growing, icons) |
| Colour | palette, contrast, what colour means (good/bad), texture or grain |
| Transitions | cut, whip, zoom, match-cut, wipe; how often |
| Ending | CTA, loop back to the start, disclaimer placement |
| Thumbnail + title | composition, face, words, figure |

Then the part that matters: **map it onto our kit.** Read the relevant files first:

- `renderer/templates/long_story/README.md` (scene table, acting, camera) and
  `renderer/templates/short_story/README.md` (the Short kit)
- `remotion/src/scenes/` (kit.tsx, world.tsx, stage.tsx, data.tsx), `remotion/src/worlds/`,
  `remotion/src/props/`, `remotion/src/fx/camera.tsx`, `remotion/src/design/`,
  `remotion/src/cast/`, `remotion/src/compositions/Thumbnail.tsx`

| Their technique | We have it? (file / scene) | Gap | Proposed change | Size (S/M/L) |

Close with the **top 3–5 changes ranked by expected effect on % viewed** and which existing
video or example (`examples/*.json`) would show each one. Note anything that would break a hard
rule in `CLAUDE.md` (captions, downloaded music, LLM-typed numbers) and leave it out.

## 4. Save and report

- Save the breakdown to `improvement/style-study/<YYYY-MM-DD>-<channel-slug>.md` (text only, with
  no screenshots or transcripts). Read earlier files in that folder first, and say what is new
  compared with them.
- Give the owner a short summary in chat: what makes this video work, the ranked changes, and
  the question "Which of these should I build?" If they pick some, build them in `remotion/src`
  with a demo render of an existing script (cache under `E:/cache/`), and run the layout and
  liveliness gates before showing it.
