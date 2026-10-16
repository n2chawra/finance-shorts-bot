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
from .canvas import BOTTOM_SAFE, DISCLAIMER, H, MIN_TEXT, SAFE_W, W, Canvas, Drawn
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


class Video:
    duration: float = 60          # story seconds; the video lasts `length` = duration / tempo
    tempo: float = TEMPO
    thumbnail_time: float = 3.0
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
        self.stars = effects.make_stars(rng)
        c = self.pal.cast
        self.confetti = effects.make_confetti(rng, [c[0], self.pal.accent, c[1], self.pal.text, c[2]])
        self.bg = effects.gradient(self.pal)
        self.scenes: list[Scene] = []
        self.impacts: list[float] = []    # zoom punch + shake
        self.punches: list[float] = []    # small zoom punch
        self.flashes: list[float] = []    # white flash
        self.txt: dict[str, str] = {}
        self.figures: dict[str, str] = {}   # every computed value a script may show, as displayed
        self.voice_script: dict[str, str] = dict(script.get("voice") or {})
        self.voice_name, self.voice_speed = voice.pick(self.seed)
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
        """Assumption line and the mandatory disclaimer, at the bottom of the last scene."""
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
        c = Canvas(im, self.pal, log)
        effects.draw_stars(c, self.stars, T)
        start = 0.0
        for s, e, fn in self.scenes:
            if s <= T < e:
                start = s
                lt = T - s
                fn(c, lt, min(1.0 if s == 0 else ramp(lt, 0, 0.25), clamp((e - T)/0.25)))
        # camera: slow push-in per scene + impact punch + shake
        zoom = (1 + PUSH_IN*clamp((T - start)/9) + 0.07*env_since(T, self.impacts, 9)
                + 0.035*env_since(T, self.punches, 12))
        im = camera.apply(im, T, zoom, 22*env_since(T, self.impacts, 10))
        im = camera.flash(im, min(0.9, 0.7*env_since(T, self.flashes, 6)))
        camera.progress_bar(im, T/self.duration, self.pal.accent)
        return im

    def layout_problems(self, T: float) -> list[str]:
        """Text at time T that breaks the layout rules (too small, off-screen, or in the bottom
        zone the Shorts UI covers, allowing for the scene push-in)."""
        log: list[Drawn] = []
        self.frame(T, log)
        limit = H/2 + (H/2 - BOTTOM_SAFE)/(1 + PUSH_IN)
        out = []
        for d in log:
            l, _, r, b = d.box
            if d.size < MIN_TEXT - 0.5:
                out.append(f"{T:.1f}s {d.s!r}: {d.size:.0f}px is below {MIN_TEXT}px")
            if b > limit:
                out.append(f"{T:.1f}s {d.s!r}: bottom at {b:.0f} is inside the bottom {BOTTOM_SAFE}px zone")
            if l < 20 or r > W - 20:
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
        return self.flag(VOICE_FLAG) and bool(self.voice_script)

    def narration(self) -> dict[str, str]:
        """The voice lines with spoken figures filled in (empty when the script has none)."""
        return voice.fill_lines(self.voice_script, self.scene_names(), self.figures) if self.voice_script else {}

    def check_voice(self) -> None:
        """Validate the voice lines; a video in the voiceover group must have them."""
        lines = self.narration()
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
