"""Base class for templates: style, backdrop, scene dispatch, camera, music bed and the shared
text rules. A template subclass sets `duration`, fills `self.scenes` and implements `audio()`."""
import math
import random
import re
from collections.abc import Callable, Mapping, Sequence

from PIL import Image

from . import camera, effects
from .audio import Mixer, sfx_whoosh
from .canvas import BOTTOM_SAFE, DISCLAIMER, H, MIN_TEXT, SAFE_W, W, Canvas, Drawn
from .characters import person
from .easing import back, clamp, env_since, ramp
from .music import gain_curve, make_bed
from .style import resolve_style

Scene = tuple[float, float, Callable[[Canvas, float, float], None]]
PUSH_IN = 0.025   # slow zoom over each scene


class Video:
    duration: float = 60
    thumbnail_time: float = 3.0
    key_times: Sequence[float] = ()

    def __init__(self, script: dict) -> None:
        self.seed: int = script["seed"]
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

    # ---------------- text ----------------

    def fill(self, texts: Mapping[str, str], placeholders: Mapping[str, object]) -> dict[str, str]:
        """Substitute {placeholders} into script text. Typed digits or ₹ are rejected, so every
        number on screen comes from code."""
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

    # ---------------- audio ----------------

    def mixer(self, ducks: Sequence[tuple[float, float, float]] = ()) -> Mixer:
        """Mixer with the music bed already laid down. `ducks` are (start, end, gain) segments.
        Add SFX afterwards, always in the same order (they share the mixer's RNG)."""
        mx = Mixer(self.duration, seed=self.seed + 4)
        bed = make_bed(mx.rng, self.duration, self.style.genre, self.style.key, self.style.bpm)
        mx.add_bed(bed, gain_curve(self.duration, 0.55, ducks))
        return mx

    def scene_whooshes(self, mx: Mixer) -> None:
        for s, _, _ in self.scenes[1:]:
            mx.place(sfx_whoosh(mx.rng, 0.4), s - 0.15, 0.7)

    def audio(self) -> Mixer:
        raise NotImplementedError
