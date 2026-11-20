# Sound: the disaster references (measured 20 Nov 2026)

The yt-style `audio-probe.js` ran in the built-in browser while each reference played (nothing
recorded or downloaded; only numbers kept). Five spans measured. The probe reads levels after
YouTube's loudness normalisation, so trust differences more than absolute values. **Estimated**
marks a reading the probe flags as weak.

| | Fascinating Horror (long) | Plainly Difficult (long) | Fault Lines 3D (long) | Major Disasters 3D (long) | Athena 3D (Short) |
|---|---|---|---|---|---|
| Span measured | 3–148 s (cold open + context) | 240–288 s (animated section) | 0–65 s (cold open, chapter 2 start) | 0–59 s (warning, memorial, hook) | 0–49 s (whole Short) |
| Music under the voice (`voiceOverBedDb`) | 30.7 dB | 41.4 dB (no bed: bass at −67 dB) | **33.5 dB** | 37.2 dB (no continuous bed) | 35.4 dB (no bass at all) |
| Ducking | ~4.6 dB | none measurable | **16.5 dB** (music comes up 16 dB between lines) | none (silence between lines) | none |
| Tempo | 104 BPM (estimated, medium) | 137 (estimated; no real bed) | 131 (low confidence) → reads **beatless drone** | 77.5 (estimated; likely voice rhythm) | 126.5 (estimated) |
| Key | unclear | C# major / A# minor (estimated, under voice) | unclear | unclear (A# minor guess) | unclear |
| Brightness | 632 Hz | 355 Hz | **334 Hz, bass share 49%** | 560 Hz | 489 Hz |
| Effects a minute | not reliable (speech syllables counted) | ~1 (estimated by ear-free reading: hits were voice plosives) | ~3 (estimated) | ~2 (estimated) | 6.1 |
| Cuts a minute | 14.1 (13 cuts in 18–30 s, then ~5 s holds) | **2.5** (long animated holds) | **5.6** (~11 s per 3D move) | 4.1 | **28.1** (10 cuts in the first 10 s) |
| Silences / drops | silent 6.8 s on the opening date card | hard silence 0.5–0.9 s between sentences | **44 dB drop at 50.4 s, 0.5 s, right before the chapter-2 card** | silent 6.7 s on the warning card; 0.8 s hard silences between lines | 0.4–1.7 s hard silences between lines |

What it says:

- **The 3D reconstruction channels barely use music.** Fault Lines is the only one with a real bed:
  a dark, bass-heavy, beatless drone (334 Hz, half its energy under 150 Hz) sitting ~33 dB under
  the voice, rising 16 dB in the gaps between sentences and cut to nothing before a chapter card.
  Plainly Difficult, Major Disasters and Athena run voice only, with true silence between lines.
- **Silence is the main device.** Two of four long references open on 6–7 s of silence over a card
  (a date, a warning); the impact or the dive is a dip to black with no music (Fault Lines 362–372 s,
  Major Disasters 413 s).
- **Effects are sparse** in long videos (≤3 a minute; none of them stamp cuts). The Short is the
  busiest picture (28 cuts a minute) but still has only ~6 effects a minute.
- **Voice pace** from the transcript panels (counted, never saved): Fault Lines ~140 wpm, Major
  Disasters ~134, Plainly Difficult ~164. Short sentences, a pause after each one. Kokoro ≈164 wpm
  per unit speed → long voice speed **≈0.85–0.9**.

## Where we beat them (sound)

Their sound is the weakest part of every reference; this is cheap ground to win.

1. **A designed bed instead of none**: a beatless low drone that breathes up between sentences
   (Fault Lines' 16 dB duck, which the voice-only channels lack), rising in key moments.
2. **Mechanical foley on the picture**: structure groans and creaks under load, rivet pops, a
   cockpit chime, radio squelch, rail clatter, water rush: placed on things moving on screen,
   synthesized in code (`renderer/engine/audio.py`). None of the references does this.
3. **The silence before the failure, then one sub-boom** on the frame the part gives way; their
   dips to black are silent but land on nothing.
4. **A tick for the clock**: a soft click each time the reconstruction clock or telemetry panel
   steps, so time pressure is heard.

## Proposed `channel.json` `sound` block

```json
"sound": {
  "_why": "research/sound.md (20 Nov 2026): Fault Lines, the only reference with a bed, sits a beatless bass-heavy drone (334 Hz, 49% bass) ~33 dB under the voice with ~16 dB ducking and a 44 dB drop before a chapter card; the other references are voice-only with hard silences between lines; long videos <=3 effects a minute, none on cuts; the Short 28 cuts a minute, ~6 effects. We keep their restraint and add what none of them has: a breathing drone, mechanical foley on things moving, silence then one sub-boom at the failure, a clock tick. To check on a Kokoro build (music_under_voice_db).",
  "genres": ["drone-low", "pulse-tension"],
  "_genresWhy": "two new channel beds to add to renderer/engine/music.py (CHANNEL_GENRES): drone-low beatless or <=60 BPM, low pad + sub swell, brightness 300-400 Hz, bass 40-50%, for long videos; pulse-tension 66-76 BPM, a muted low pulse + rising pad for reconstruction stretches and Shorts. Never another channel's beds.",
  "musicUnderVoiceDb": { "long": 32, "short": 22 },
  "duckDb": { "long": 14, "short": 8 },
  "musicAlone": { "coldOpenSec": [4, 7], "chapterCardSec": [2, 3] },
  "sfxPerMinute": { "long": [3, 5], "short": [8, 12] },
  "sfxKinds": ["structure groan", "creak", "rivet pop", "cable twang", "radio squelch", "cockpit chime", "rail clatter", "water rush", "clock tick", "sub boom"],
  "sfxOnCuts": false,
  "failureMoment": { "silenceBeforeSec": [0.6, 1.0], "then": "one sub boom on the frame the part gives way, the drone returns 2 s later" },
  "dropBeforeChapterCard": true,
  "voiceSpeed": { "long": 0.88, "short": 1.0 }
}
```

Levels (`bedLevel`, `duck`) are set when the beds exist, by measuring a Kokoro build to hit 32 dB
(long) and 22 dB (Shorts) under the voice, as channel #2 did.
