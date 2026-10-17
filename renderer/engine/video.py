"""Base class for templates: style, backdrop, scene dispatch, camera, music bed, voiceover and the
shared text rules. A template subclass sets `duration`, fills `self.scenes` and implements `audio()`."""
import math
import random
import re
from collections.abc import Callable, Mapping, Sequence

import numpy as np
from PIL import Image

from . import camera, effects, voice
from .audio import Mixer, sfx_whoosh
from .canvas import DISCLAIMER, MIN_TEXT, SAFE_W, SHORT, W, Canvas, Drawn, Frame
from .characters import person
from .easing import back, clamp, env_since, ramp
from .music import gain_curve, make_bed
from .style import resolve_style

Scene = tuple[float, float, Callable[[Canvas, float, float], None]]
PUSH_IN = 0.025   # slow zoom over each scene
# Playback speed: templates write their timeline in story seconds; the video plays it this much
# faster (animations, cuts, sound effects and countdowns together). 1.35 turns a 48-60 s story
# into a 35-44 s Short (owner, 2026-10-16: "very slow paced"). Change it here for every template,
# per template with a class attribute, or per video in an experiment (self.tempo in __init__).
TEMPO = 1.35
VOICE_FLAG = "voiceover"   # A/B experiment: videos in its "on" group are narrated
VOICE_DUCK = 0.65          # music and effects drop by this much while the voice speaks


# Liveliness thresholds, calibrated against the Shorts (see Video.liveliness).
STILL = 0.5                 # mean pixel change below this is, to the eye, a frozen frame
LIVELY_MEDIAN = 1.2         # the Shorts sit at 1.5-2.3; the first long video scored 0.02
LIVELY_STILL_SHARE = 0.15
LIVELY_STILL_SEC = 4.0


def liveliness_problems(score: dict[str, float]) -> list[str]:
    """Why a video reads as a slideshow, in words a template author can act on. Shared by both
    renderers (renderer/gates.py scores a Remotion mp4 the same way)."""
    out = []
    if score["median"] < LIVELY_MEDIAN:
        out.append(f"median frame change {score['median']:.2f} is below {LIVELY_MEDIAN} — "
                   f"scenes finish animating and then hold a still picture")
    if score["still_share"] > LIVELY_STILL_SHARE:
        out.append(f"{score['still_share']*100:.0f}% of samples have no visible movement "
                   f"(limit {LIVELY_STILL_SHARE*100:.0f}%)")
    if score["longest_still_sec"] > LIVELY_STILL_SEC:
        out.append(f"{score['longest_still_sec']:g} s with nothing moving "
                   f"(limit {LIVELY_STILL_SEC:g} s)")
    return out


class Video:
    # `frame` is the format: SHORT (vertical Shorts) or LONG (landscape long-form). It sets the
    # frame size and the layout rules; everything else in this class works the same either way.
    frame_spec: Frame = SHORT
    duration: float = 60          # story seconds; the video lasts `length` = duration / tempo
    tempo: float = TEMPO
    thumbnail_time: float = 3.0
    # Camera. The defaults are the Shorts': push in over 9 s, then hold, and never pan. A long
    # scene runs for half a minute, so holding still for twenty of those seconds is most of what
    # made the first long video feel like a slideshow — long-form pushes for the whole scene and
    # drifts continuously instead. See Video.liveliness.
    push_seconds: float | None = 9.0      # None = take the whole scene
    push_amount: float = PUSH_IN
    drift_px: float = 0.0                 # slow pan; clamped to whatever the zoom has cropped
    key_times: Sequence[float] = ()
    # per scene: (seconds into the scene the voice may start, seconds into the scene it must end by,
    # or None for the scene's end minus voice.TAIL); scenes not listed use the defaults
    voice_offsets: Mapping[str, tuple[float, float | None]] = {}

    def __init__(self, script: dict) -> None:
        self.seed: int = script["seed"]
        self.flags: dict[str, str] = dict(script.get("_flags", {}))   # A/B experiment variants
        self.style = resolve_style(script.get("style", {}), self.seed)
        self.pal = self.style.palette
        rng = random.Random(self.seed)
        size = self.frame_spec.size
        self.stars = effects.make_stars(rng, size=size)
        c = self.pal.cast
        self.confetti = effects.make_confetti(rng, [c[0], self.pal.accent, c[1], self.pal.text, c[2]], size=size)
        self.bg = effects.gradient(self.pal, size)
        self.scenes: list[Scene] = []
        self.impacts: list[float] = []    # zoom punch + shake
        self.punches: list[float] = []    # small zoom punch
        self.flashes: list[float] = []    # white flash
        self.txt: dict[str, str] = {}
        self.figures: dict[str, str] = {}   # every computed value a script may show, as displayed
        self.voice_script: dict[str, str] = dict(script.get("voice") or {})
        self.voice_name, self.voice_speed = voice.pick(self.seed, self.frame_spec.voice_speed)
        self.spoken: list[voice.Spoken] = []

    @property
    def length(self) -> float:
        """Output length in seconds."""
        return self.duration/self.tempo

    def secs(self, story: float) -> float:
        """Story seconds as output seconds (for sound lengths such as a riser over an animation)."""
        return story/self.tempo

    def frame_at(self, t: float) -> Image.Image:
        """The frame `t` output seconds into the finished video."""
        return self.frame(t*self.tempo)

    def flag(self, exp_id: str) -> bool:
        """True when this video is in the "on" group of experiment `exp_id`."""
        return self.flags.get(exp_id) == "on"

    # ---------------- text ----------------

    def fill(self, texts: Mapping[str, str], placeholders: Mapping[str, object]) -> dict[str, str]:
        """Substitute {placeholders} into script text. Typed digits or ₹ are rejected, so every
        number on screen comes from code. The placeholders are kept as `self.figures`."""
        self.figures = {k: str(v) for k, v in placeholders.items()}
        out = {}
        for key, raw in texts.items():
            if re.search(r"[0-9₹]", raw):
                raise ValueError(f"text.{key} contains a typed number; use a placeholder: {raw!r}")
            try:
                out[key] = raw.format_map(placeholders)
            except (KeyError, ValueError, IndexError) as e:
                raise ValueError(f"text.{key} has a bad placeholder ({e}). Allowed: {', '.join(placeholders)}") from e
        return out

    # ---------------- shared scenes ----------------

    def outro(self, c: Canvas, a: float, assumption: str) -> None:
        """Assumption line and the mandatory disclaimer, at the bottom of the last scene.
        Laid out for SHORT; long-form blocks draw their own (see renderer/engine/longform.py)."""
        c.text(assumption, W/2, 1670, MIN_TEXT, self.pal.muted, a, "Regular", max_w=SAFE_W)
        c.text(DISCLAIMER, W/2, 1740, MIN_TEXT, self.pal.muted, a, "Regular", max_w=SAFE_W)

    def end_scene(self, c: Canvas, t: float, A: float, assumption: str) -> None:
        """Standard closing: two lines, a punch word, a happy character, CTA, follow, disclaimer.
        Uses text keys end_line1, end_line2, end_punch, end_cta, end_follow."""
        P = self.pal
        c.caption(self.txt["end_line1"], 0.1, t, 380, 80, P.text, A)
        c.caption(self.txt["end_line2"], 0.5, t, 480, 80, P.text, A)
        a = ramp(t, 1.2, 0.2)*A
        k = back(ramp(t, 1.2, 0.4))
        c.text(self.txt["end_punch"], W/2, 690, 150*(0.5 + 0.5*k), P.accent, a, max_w=SAFE_W)
        person(c, W/2, 1240, 1.1, P.cast[0], ramp(t, 1.6)*A, t, "happy", jump=abs(math.sin(t*6))*18,
               look=self.style.looks[0])
        c.caption(self.txt["end_cta"], 2.6, t, 1400, 56, P.accent, A)
        c.text(self.txt["end_follow"], W/2, 1520, 46, P.text, ramp(t, 3.4)*A, "Medium", max_w=SAFE_W)
        self.outro(c, ramp(t, 0.5)*A, assumption)

    # ---------------- frame ----------------

    def frame(self, T: float, log: list[Drawn] | None = None) -> Image.Image:
        im = self.bg.copy()
        c = Canvas(im, self.pal, log, self.frame_spec)
        effects.draw_stars(c, self.stars, T)
        start, end = 0.0, self.duration
        for s, e, fn in self.scenes:
            if s <= T < e:
                start, end = s, e
                lt = T - s
                fn(c, lt, min(1.0 if s == 0 else ramp(lt, 0, 0.25), clamp((e - T)/0.25)))
        # camera: push-in per scene + drift + impact punch + shake
        span = (end - start) if self.push_seconds is None else self.push_seconds
        zoom = (1 + self.push_amount*clamp((T - start)/max(span, 0.1))
                + 0.07*env_since(T, self.impacts, 9) + 0.035*env_since(T, self.punches, 12))
        # the pan can only use what the zoom has already cropped, so it fades in with the push-in
        room = min(self.drift_px, (1 - 1/zoom)*self.frame_spec.w/2)
        pan = (math.sin(T*0.11)*room, math.cos(T*0.083)*room*0.4)
        im = camera.apply(im, T, zoom, 22*env_since(T, self.impacts, 10), pan)
        im = camera.flash(im, min(0.9, 0.7*env_since(T, self.flashes, 6)))
        camera.progress_bar(im, T/self.duration, self.pal.accent)
        return im

    def check_times(self) -> list[float]:
        """When to run the layout checks: every second of a Short, every fifth second of a long
        video (its scenes are minutes long, so a denser sweep only re-checks the same layouts)."""
        step = 1 if self.duration <= 120 else 5
        return [t + 0.5 for t in range(0, int(self.duration), step)]

    def liveliness(self, gap: float = 0.3, every: float = 2.0) -> dict[str, float]:
        """How much the picture actually changes, sampled across the whole video.

        Each sample is the mean absolute pixel difference between two frames `gap` apart. The
        Shorts are the calibration: two_friends_race scores a median of 2.25 and money_leak_meter
        1.56, while the first long_explainer scored 0.02 and was frozen for 82% of its runtime —
        which is exactly what "a PPT with a voiceover" means, as a number.

        Returns the median, the share of samples that are effectively still, and the longest
        stretch in seconds with no visible movement.
        """
        scores = []
        t = 0.0
        while t + gap < self.duration:
            a = np.asarray(self.frame(t), dtype=np.int16)
            b = np.asarray(self.frame(t + gap), dtype=np.int16)
            scores.append(float(np.abs(a - b).mean()))
            t += every
        if not scores:
            return {"median": 0.0, "still_share": 1.0, "longest_still_sec": self.duration}
        run = best = 0
        for s in scores:
            run = run + 1 if s < STILL else 0
            best = max(best, run)
        return {"median": round(float(np.median(scores)), 3),
                "still_share": round(sum(s < STILL for s in scores)/len(scores), 3),
                "longest_still_sec": round(best*every, 1)}

    def liveliness_problems(self, score: dict[str, float]) -> list[str]:
        return liveliness_problems(score)

    def thumbnail_image(self) -> Image.Image:
        """The image saved as thumbnail.png. A Short uses a frame of itself (it is never seen at
        thumbnail size); a long video draws a purpose-made card instead."""
        return self.frame(self.thumbnail_time)

    def layout_problems(self, T: float) -> list[str]:
        """Text at time T that breaks the layout rules (too small, off-screen, or in the bottom
        zone the Shorts UI covers, allowing for the scene push-in)."""
        log: list[Drawn] = []
        self.frame(T, log)
        f = self.frame_spec
        limit = f.h/2 + (f.h/2 - f.bottom_safe)/(1 + PUSH_IN)
        out = []
        for d in log:
            l, _, r, b = d.box
            if d.size < f.min_text - 0.5:
                out.append(f"{T:.1f}s {d.s!r}: {d.size:.0f}px is below {f.min_text}px")
            if b > limit:
                out.append(f"{T:.1f}s {d.s!r}: bottom at {b:.0f} is inside the bottom {f.bottom_safe}px zone")
            if l < 20 or r > f.w - 20:
                out.append(f"{T:.1f}s {d.s!r}: runs off the side ({l:.0f}–{r:.0f})")
        return out

    # ---------------- voiceover ----------------

    def scene_names(self) -> list[str]:
        return [fn.__name__.lstrip("_") for _, _, fn in self.scenes]

    def voice_windows(self) -> dict[str, tuple[float, float]]:
        """Each scene's speaking window, in output seconds."""
        out = {}
        for (s, e, _), name in zip(self.scenes, self.scene_names()):
            lead, until = self.voice_offsets.get(name, (voice.LEAD, None))
            out[name] = ((s + lead)/self.tempo, (e - voice.TAIL if until is None else s + until)/self.tempo)
        return out

    @property
    def narrated(self) -> bool:
        """Shorts are narrated only in the voiceover experiment's "on" group; a long explainer is
        unwatchable without a voice, so it always is."""
        if not self.voice_script:
            return False
        return self.frame_spec.name == "long" or self.flag(VOICE_FLAG)

    def narration(self) -> dict[str, str]:
        """The voice lines with spoken figures filled in (empty when the script has none)."""
        return (voice.fill_lines(self.voice_script, self.scene_names(), self.figures,
                                 self.frame_spec.max_voice_line) if self.voice_script else {})

    def check_voice(self) -> None:
        """Validate the voice lines; a video that must be narrated has to have them."""
        lines = self.narration()
        if self.frame_spec.name == "long" and not lines:
            raise ValueError(f"a long video must be narrated: add a `voice` line for each section "
                             f"({', '.join(self.scene_names())})")
        if self.flag(VOICE_FLAG) and not lines:
            raise ValueError(f"this video is in the {VOICE_FLAG} group: the script needs a `voice` object with a line "
                             f"for most scenes ({', '.join(self.scene_names())})")

    def soundtrack(self) -> Mixer:
        """The template's music and effects, plus the voiceover (with everything else ducked under it)."""
        mx = self.audio()
        if not self.narrated:
            return mx
        self.spoken = voice.speak(self.narration(), self.voice_windows(), self.voice_name, self.voice_speed)
        duck = 1 - VOICE_DUCK*voice.activity(mx.n, self.spoken)
        mx.left *= duck
        mx.right *= duck
        for p in self.spoken:
            peak = float(np.max(np.abs(p.samples))) or 1.0
            mx.place_out(p.samples/peak*0.9, p.start, 1.0)
        return mx

    # ---------------- audio ----------------

    def mixer(self, ducks: Sequence[tuple[float, float, float]] = ()) -> Mixer:
        """Mixer with the music bed already laid down. `ducks` are (start, end, gain) segments.
        Add SFX afterwards, always in the same order (they share the mixer's RNG)."""
        mx = Mixer(self.length, seed=self.seed + 4, tscale=self.tempo)
        bed = make_bed(mx.rng, self.length, self.style.genre, self.style.key, self.style.bpm)
        mx.add_bed(bed, gain_curve(self.length, 0.55, [(a/self.tempo, b/self.tempo, g) for a, b, g in ducks]))
        return mx

    def scene_whooshes(self, mx: Mixer) -> None:
        for s, _, _ in self.scenes[1:]:
            mx.place(sfx_whoosh(mx.rng, 0.4), s - 0.15, 0.7)

    def audio(self) -> Mixer:
        raise NotImplementedError
