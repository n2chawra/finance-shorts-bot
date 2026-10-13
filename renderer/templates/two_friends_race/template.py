"""two_friends_race: two people invest the same monthly amount; the one who starts early (and
invests less in total) ends up with more. Seven scenes, 60 s.

Every figure on screen is computed here from the script inputs. Script text may only refer to
numbers through {placeholders}.
"""
import math
import random
import re
from dataclasses import dataclass

from PIL import Image

from renderer.engine import camera, effects
from renderer.engine.audio import (SR, Mixer, sfx_beep, sfx_boom, sfx_clink, sfx_ding, sfx_fail,
                                   sfx_kaching, sfx_pop, sfx_riser, sfx_tick, sfx_whoosh)
from renderer.engine.canvas import DISCLAIMER, FPS, NIGHT, RGB, SAFE_W, W, Canvas
from renderer.engine.characters import person
from renderer.engine.easing import back, clamp, ease, env_since, ramp
from renderer.engine.formatting import axis_label, inr, inr_long, rupees, times
from renderer.engine.music import gain_curve, lofi_bed
from renderer.engine.props import coin, jar

DUR = 60
S_HOOK, S_A, S_B, S_Q, S_CHART, S_RES, S_END = 0, 5, 14, 23, 31, 44, 53
REVEAL = 2.3          # seconds into the result scene when the winner is revealed
NOTE_AT = 7.4         # seconds into a coins scene when the bottom note pops
COIN_T0, COIN_DUR, COIN_SPEED = 1.2, 6.0, 1.4
CHART_T0, CHART_DUR = 0.8, 10.0


@dataclass(frozen=True)
class Person:
    name: str
    tag: str
    color: RGB
    start: int
    stop: int


def simulate(monthly: float, annual_pct: float, origin_age: int, end_age: int, start_age: int,
             stop_age: int) -> list[float]:
    """Value at each month from origin_age to end_age. One contribution at the start of every
    month in [start_age, stop_age), monthly compounding."""
    r = annual_pct/100/12
    m0, m1 = (start_age - origin_age)*12, (stop_age - origin_age)*12
    out, v = [], 0.0
    for m in range((end_age - origin_age)*12 + 1):
        out.append(v)
        v = (v + monthly)*(1 + r) if m0 <= m < m1 else v*(1 + r)
    return out


def nice_axis(vmax: float, max_ticks: int = 5) -> list[float]:
    """Round tick values from 0 to just above vmax."""
    mag = 10**math.floor(math.log10(vmax))
    for m in (0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10):
        step = m*mag
        if vmax/step <= max_ticks:
            return [i*step for i in range(math.ceil(vmax/step) + 1)]
    raise AssertionError("unreachable")


def coin_landings(scene_start: float) -> list[float]:
    """Absolute times at which a falling coin reaches the jar (for clink sounds)."""
    out = []
    for i in range(3):
        k = math.ceil(COIN_T0*COIN_SPEED + i/3)
        while True:
            tt = (k - i/3)/COIN_SPEED
            if tt > COIN_T0 + COIN_DUR:
                break
            if tt > COIN_T0 + 0.2:
                out.append(scene_start + tt)
            k += 1
    return sorted(out)


class TwoFriendsRace:
    duration = DUR
    thumbnail_time = 3.0
    key_times = [1.0, 3.0, 12.8, 21.8, 27.0, 38.0, 47.5, 58.0]

    def __init__(self, script: dict) -> None:
        self.pal = NIGHT
        self.seed: int = script["seed"]
        a, b = (Person(p["name"], p["name"].upper(), tuple(bytes.fromhex(p["color"][1:])), p["start_age"],
                       p["stop_age"]) for p in script["people"])
        self.a, self.b = a, b
        self.monthly: int = script["monthly"]
        self.rate: float = script["annual_return_pct"]
        self.end: int = script["end_age"]
        if not (a.start < a.stop <= self.end and b.start < b.stop <= self.end and a.start <= b.start):
            raise ValueError("ages must satisfy start < stop <= end_age, and the first person starts first")

        self.origin = a.start
        self.months = (self.end - self.origin)*12
        self.series = [simulate(self.monthly, self.rate, self.origin, self.end, p.start, p.stop) for p in (a, b)]
        self.final = [s[-1] for s in self.series]
        self.invested = [self.monthly*(p.stop - p.start)*12 for p in (a, b)]
        if not (self.invested[0] < self.invested[1] and self.final[0] > self.final[1]):
            raise ValueError("story does not hold: the first person must invest less and still end with more "
                             f"(invested {self.invested}, final {[round(v) for v in self.final]})")

        ph = {
            "a": a.name, "b": b.name, "monthly": rupees(self.monthly), "rate": f"{self.rate:g}%",
            "a_start": a.start, "a_stop": a.stop, "b_start": b.start, "b_stop": b.stop, "end_age": self.end,
            "a_years": a.stop - a.start, "b_years": b.stop - b.start,
            "a_invested": inr(self.invested[0]), "b_invested": inr(self.invested[1]),
            "a_invested_long": inr_long(self.invested[0]), "b_invested_long": inr_long(self.invested[1]),
            "a_final": inr(self.final[0]), "b_final": inr(self.final[1]),
            "invested_ratio": times(self.invested[1]/self.invested[0]),
            "final_ratio": times(self.final[0]/self.final[1]),
        }
        self.txt: dict[str, str] = {}
        for key, raw in script["text"].items():
            if re.search(r"[0-9₹]", raw):
                raise ValueError(f"text.{key} contains a typed number; use a placeholder: {raw!r}")
            try:
                self.txt[key] = raw.format_map(ph)
            except (KeyError, ValueError, IndexError) as e:
                raise ValueError(f"text.{key} has a bad placeholder ({e}). Allowed: {', '.join(ph)}") from e

        # chart: time (within the scene) at which the line passes the first person's stop age
        self.chart_stop: float | None = None
        if a.stop < self.end:
            for f in range(int((CHART_T0 + CHART_DUR + 1)*FPS)):
                tt = f/FPS
                if self.origin + int(ease(ramp(tt, CHART_T0, CHART_DUR))*self.months)/12 >= a.stop:
                    self.chart_stop = tt
                    break
        self.ticks = nice_axis(max(self.final))

        self.impacts = [0.0, S_RES + REVEAL, S_END + 1.2]     # zoom punch + shake + boom
        self.punches = [S_Q + 5, S_Q + 6, S_Q + 7]            # countdown small punches
        self.scenes = [(S_HOOK, S_A, self._hook), (S_A, S_B, self._coins_a), (S_B, S_Q, self._coins_b),
                       (S_Q, S_CHART, self._question), (S_CHART, S_RES, self._chart),
                       (S_RES, S_END, self._result), (S_END, DUR, self._end)]

        rng = random.Random(self.seed)
        self.stars = effects.make_stars(rng)
        self.confetti = effects.make_confetti(rng, [a.color, self.pal.accent, b.color, self.pal.text, (120, 160, 255)])
        self.bg = effects.gradient(self.pal)

    # ---------------- scenes ----------------

    def _hook(self, c: Canvas, t: float, A: float) -> None:
        P, a, b = self.pal, self.a, self.b
        k = back(ramp(t, 0.0, 0.35))
        c.text(self.txt["hook_title"], W/2, 330, 92*(0.6 + 0.4*k), P.text, A, max_w=SAFE_W)
        c.caption(self.txt["hook_sub"], 0.8, t, 455, 110, P.accent, A)
        sl = 1 - ease(ramp(t, 1.4, 0.5))
        ap = ramp(t, 1.4, 0.3)*A
        person(c, W/2 - 220 - sl*600, 1300, 1.3, a.color, ap, t, "happy", a.tag)
        person(c, W/2 + 220 + sl*600, 1300, 1.3, b.color, ap, t + 1, "happy", b.tag)
        va = ramp(t, 2.1, 0.2)*A
        if va > 0:
            r = 90*back(ramp(t, 2.1, 0.35))
            c.d.ellipse([W/2 - r, 1050 - r, W/2 + r, 1050 + r], fill=c.mix(P.danger, va))
            c.text("VS", W/2, 1050, 70*back(ramp(t, 2.1, 0.35)), P.text, va)
        c.text(self.txt["hook_tease"], W/2, 1620, 50, P.muted, ramp(t, 2.8)*A, "Medium", max_w=SAFE_W)

    def _coins(self, c: Canvas, t: float, A: float, i: int, key: str) -> None:
        P, p = self.pal, (self.a, self.b)[i]
        c.caption(self.txt[key + "_intro"], 0.15, t, 300, 76, P.text, A)
        c.caption(self.txt[key + "_amount"], 0.7, t, 410, 96, p.color, A)
        prog = ease(ramp(t, COIN_T0, COIN_DUR))
        age = p.start + (p.stop - p.start)*prog
        person(c, 300, 1450, 1.15, p.color, A, t, "happy", None, jump=abs(math.sin(t*6))*14*(0 < prog < 1))
        c.text(p.tag, 300, 1530, 54, p.color, A)
        jx, jb = 720, 1500
        jar(c, jx, jb, 300, 420, prog*0.9, p.color, A)
        if COIN_T0 < t < COIN_T0 + COIN_DUR:
            for n in range(3):
                ph = (t*COIN_SPEED + n/3) % 1.0
                y = 700 + (ph**1.6)*700
                if y < jb - 40:
                    coin(c, jx + (n - 1)*55, y, 36, A)
        c.pill(W/2, 1640, f"Age {int(age)}", 64, P.bg, P.text, A)
        c.text("Invested: " + inr(self.invested[i]*prog), W/2, 560, 66, P.text, A*ramp(t, COIN_T0))
        na = ramp(t, NOTE_AT, 0.2)*A
        if na > 0:
            k = back(ramp(t, NOTE_AT, 0.35))
            if p.stop < self.end:   # stops early: warning style
                c.pill(W/2, 1750, self.txt[key + "_note"], 56*(0.7 + 0.3*k), P.text, P.danger, na)
            else:
                c.pill(W/2, 1750, self.txt[key + "_note"], 52*(0.7 + 0.3*k), P.bg, self.a.color, na)

    def _coins_a(self, c: Canvas, t: float, A: float) -> None:
        self._coins(c, t, A, 0, "a")

    def _coins_b(self, c: Canvas, t: float, A: float) -> None:
        self._coins(c, t, A, 1, "b")

    def _question(self, c: Canvas, t: float, A: float) -> None:
        P, d = self.pal, c.d
        c.caption(self.txt["question_setup"], 0.15, t, 380, 80, P.text, A)
        for i, p in enumerate((self.a, self.b)):
            a = ramp(t, 0.8 + i*0.5, 0.2)*A
            x = W/2 + (-230 if i == 0 else 230)
            y = 860 + (1 - back(ramp(t, 0.8 + i*0.5, 0.4)))*120
            d.rounded_rectangle([x - 200, y - 210, x + 200, y + 210], radius=40, fill=c.mix(P.panel, a))
            d.rounded_rectangle([x - 200, y - 210, x + 200, y - 130], radius=40, fill=c.mix(p.color, a))
            d.rectangle([x - 200, y - 160, x + 200, y - 130], fill=c.mix(p.color, a))
            c.text(p.tag, x, y - 170, 52, P.bg, a)
            c.text("invests for", x, y - 60, 44, P.muted, a, "Medium")
            c.text(f"{p.stop - p.start} years", x, y, 62, P.text, a)
            c.text("Total put in", x, y + 80, 44, P.muted, a, "Medium")
            c.text(inr(self.invested[i]), x, y + 140, 62, p.color, a)
        c.caption(self.txt["question"], 2.4, t, 1260, 92, P.accent, A)
        c.pill(W/2, 1430, self.txt["question_cta"], 46, P.bg, P.text, ramp(t, 3.4)*A)
        for i, n in enumerate(("3", "2", "1")):
            t0 = 5 + i
            if t0 <= t < t0 + 1:
                lt = t - t0
                k = back(ramp(lt, 0, 0.25))
                c.text(n, W/2, 1660, 230*(0.5 + 0.5*k), P.danger if n == "1" else P.text, A*(1 - ramp(lt, 0.75, 0.25)))

    def _chart(self, c: Canvas, t: float, A: float) -> None:
        P, d = self.pal, c.d
        c.caption(self.txt["chart_title"], 0.15, t, 290, 80, P.text, A)
        L, R, T, B = 180, 980, 520, 1440
        a = ramp(t, 0.2)*A
        ymax = self.ticks[-1]
        span = self.end - self.origin
        for v in self.ticks:
            y = B - (B - T)*v/ymax
            d.line([L, y, R, y], fill=c.mix(P.grid, a), width=2)
            c.text(axis_label(v), L - 16, y, 44, P.muted, a, "Medium", "rm")
        for ag in sorted({self.a.start, self.a.stop, self.b.start, self.b.stop, self.end}):
            c.text(str(ag), L + (R - L)*(ag - self.origin)/span, B + 50, 44, P.muted, a, "Medium")
        c.text("AGE", (L + R)/2, B + 110, 44, P.muted, a, "Medium")
        n = int(ease(ramp(t, CHART_T0, CHART_DUR))*self.months)

        def pts(S: list[float]) -> list[tuple[float, float]]:
            out = [(L + (R - L)*m/self.months, B - (B - T)*S[m]/ymax) for m in range(0, n + 1, 3)]
            out.append((L + (R - L)*n/self.months, B - (B - T)*S[n]/ymax))
            return out

        for S, p in ((self.series[1], self.b), (self.series[0], self.a)):
            pp = pts(S)
            if len(pp) > 1:
                d.line(pp, fill=c.mix(p.color, A*0.25), width=30, joint="curve")   # glow
                d.line(pp, fill=c.mix(p.color, A), width=12, joint="curve")
            x, y = pp[-1]
            r = 16 + 4*math.sin(t*10)
            d.ellipse([x - r, y - r, x + r, y + r], fill=c.mix(p.color, A))
        age = self.origin + n/12
        if self.chart_stop is not None and age >= self.a.stop:
            x = L + (R - L)*(self.a.stop - self.origin)/span
            sa = ramp(t, self.chart_stop)*A
            d.line([x, T, x, B], fill=c.mix(P.muted, sa*0.6), width=3)
            c.text(self.txt["chart_stop_label"], x + 14, T + 34, 44, P.danger, sa, "Medium", "lm")
            c.caption(self.txt["chart_note"], self.chart_stop + 0.8, t, 400, 54, self.a.color, A*(1 - ramp(t, 7.5)))
        c.pill(W/2, 1640, f"Age {int(age)}", 56, P.bg, P.text, a)
        c.text(f"{self.a.name} {inr(self.series[0][n])}", W/2 - 250, 1750, 50, self.a.color, a)
        c.text(f"{self.b.name} {inr(self.series[1][n])}", W/2 + 250, 1750, 50, self.b.color, a)

    def _result(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        effects.draw_confetti(c, self.confetti, t - REVEAL, A)
        c.caption(self.txt["result_title"], 0.1, t, 300, 90, P.text, A)
        for i, (p, mood, x) in enumerate(((self.a, "wow", W/2 - 240), (self.b, "sad", W/2 + 240))):
            a = ramp(t, 0.3)*A
            cnt = ease(ramp(t, 0.6, 1.6))
            jump = abs(math.sin((t - REVEAL)*7))*40*(i == 0)*(t > REVEAL)
            person(c, x, 1080, 1.0, p.color, a, t + i, mood if t > REVEAL else "neutral", jump=jump)
            c.text(p.tag, x, 1150, 50, p.color, a)
            sz = 76 if t < REVEAL or i else 76*(1 + 0.25*math.exp(-(t - REVEAL)*4))
            c.text(inr(self.final[i]*cnt), x, 1260, sz, P.text, a)
            hh = 380*(self.final[i]/self.final[0])*cnt
            c.d.rounded_rectangle([x - 90, 1720 - hh, x + 90, 1720], radius=20, fill=c.mix(p.color, a))
        c.caption(self.txt["result_line1"], 2.6, t, 460, 78, P.accent, A)
        c.caption(self.txt["result_line2"], 3.3, t, 560, 84, self.a.color, A)

    def _end(self, c: Canvas, t: float, A: float) -> None:
        P, d = self.pal, c.d
        c.caption(self.txt["end_line1"], 0.1, t, 380, 80, P.text, A)
        c.caption(self.txt["end_line2"], 0.5, t, 480, 80, P.text, A)
        a = ramp(t, 1.2, 0.2)*A
        k = back(ramp(t, 1.2, 0.4))
        c.text(self.txt["end_punch"], W/2, 680, 160*(0.5 + 0.5*k), P.accent, a, max_w=SAFE_W)
        ca = ramp(t, 1.6)*A
        cx, cy, r = W/2, 990, 140
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=c.mix(P.text, ca), width=10)
        for h in range(12):
            an = h*math.pi/6
            d.line([cx + math.sin(an)*112, cy - math.cos(an)*112, cx + math.sin(an)*126, cy - math.cos(an)*126],
                   fill=c.mix(P.muted, ca), width=5)
        ang = math.floor(t*2)/2*math.pi*2/6*2
        d.line([cx, cy, cx + math.sin(ang)*105, cy - math.cos(ang)*105], fill=c.mix(P.accent, ca), width=10)
        d.line([cx, cy, cx + math.sin(ang/12)*65, cy - math.cos(ang/12)*65], fill=c.mix(P.text, ca), width=12)
        c.pill(W/2, 1250, self.txt["end_pill"], 62, P.bg, self.a.color, ramp(t, 2.4)*A)
        c.caption(self.txt["end_cta"], 3.2, t, 1400, 56, P.accent, A)
        c.text(self.txt["end_follow"], W/2, 1520, 46, P.text, ramp(t, 4.0)*A, "Medium", max_w=SAFE_W)
        da = ramp(t, 0.5)*A
        c.text(f"Assumes {self.rate:g}% a year, compounded monthly.", W/2, 1670, 44, P.muted, da, "Regular")
        c.text(DISCLAIMER, W/2, 1740, 44, P.muted, da, "Regular")

    # ---------------- frame ----------------

    def frame(self, T: float) -> Image.Image:
        im = self.bg.copy()
        c = Canvas(im, self.pal)
        effects.draw_stars(c, self.stars, T)
        start = 0.0
        for s, e, fn in self.scenes:
            if s <= T < e:
                start = s
                lt = T - s
                fn(c, lt, min(1.0 if s == 0 else ramp(lt, 0, 0.25), clamp((e - T)/0.25)))
        # camera: slow push-in per scene + impact punch + shake
        zoom = (1 + 0.025*clamp((T - start)/9) + 0.07*env_since(T, self.impacts, 9)
                + 0.035*env_since(T, self.punches, 12))
        im = camera.apply(im, T, zoom, 22*env_since(T, self.impacts, 10))
        flash_at = S_RES + REVEAL
        im = camera.flash(im, 0.7*math.exp(-(T - flash_at)*6) if T >= flash_at else 0)
        camera.progress_bar(im, T/DUR, self.pal.accent)
        return im

    # ---------------- audio ----------------

    def audio(self) -> Mixer:
        mx = Mixer(DUR, seed=self.seed + 4)
        r, place = mx.rng, mx.place
        # music first, then SFX in this fixed order: they share one RNG
        mx.add_bed(lofi_bed(r, DUR), gain_curve(DUR, 0.55, [
            (S_Q + 4.9, S_Q + 8.0, 0.18),                    # countdown suspense
            (S_RES + 1.9, S_RES + REVEAL, 0.0),              # drop before result
            (S_RES + REVEAL, S_RES + 3.0, 0.8)]))
        place(sfx_boom(r), 0.0, 0.9)
        place(sfx_whoosh(r, 0.35), 0.0, 0.6)
        place(sfx_pop(1.2), 0.8, 0.7)
        place(sfx_whoosh(r, 0.5), 1.35, 0.6, -0.5)
        place(sfx_whoosh(r, 0.5), 1.4, 0.6, 0.5)
        place(sfx_pop(0.8), 2.1, 0.9)
        for s in (S_A, S_B, S_Q, S_CHART, S_RES, S_END):
            place(sfx_whoosh(r, 0.4), s - 0.15, 0.7)
        for s in (S_A, S_B):
            place(sfx_pop(1.0), s + 0.15, 0.6)
            place(sfx_pop(1.3), s + 0.7, 0.7)
            for i, lt in enumerate(coin_landings(s)):
                place(sfx_clink(0.9 + 0.25*((i*7) % 5)/5), lt, 0.55, ((i % 3) - 1)*0.3)
        for s, p, g in ((S_A, self.a, 0.9), (S_B, self.b, 0.8)):
            place(sfx_fail() if p.stop < self.end else sfx_ding(), s + NOTE_AT, g)
        place(sfx_pop(1.0), S_Q + 0.15, 0.6)
        place(sfx_pop(1.1), S_Q + 0.8, 0.7, -0.4)
        place(sfx_pop(1.25), S_Q + 1.3, 0.7, 0.4)
        place(sfx_pop(1.4), S_Q + 2.4, 0.8)
        place(sfx_pop(1.0), S_Q + 3.4, 0.5)
        place(sfx_beep(880), S_Q + 5, 0.8)
        place(sfx_beep(880), S_Q + 6, 0.8)
        place(sfx_beep(1320), S_Q + 7, 0.9)
        place(sfx_pop(1.0), S_CHART + 0.15, 0.6)
        place(sfx_riser(r, CHART_DUR), S_CHART + CHART_T0, 0.55)
        for k in range(40):
            place(sfx_tick(r), S_CHART + CHART_T0 + k*0.25, 0.35)
        if self.chart_stop is not None:
            place(sfx_fail()[:int(0.35*SR)], S_CHART + self.chart_stop, 0.6)
            place(sfx_ding(1568), S_CHART + self.chart_stop + 0.8, 0.6)
        place(sfx_pop(1.0), S_RES + 0.1, 0.6)
        for k in range(16):  # counting ticks
            place(sfx_tick(r), S_RES + 0.6 + k*0.1, 0.5)
        place(sfx_boom(r), S_RES + REVEAL, 1.0)
        place(sfx_kaching(), S_RES + REVEAL + 0.05, 0.9)
        place(sfx_pop(1.3), S_RES + 2.6, 0.7)
        place(sfx_ding(1760, 1.0), S_RES + 3.3, 0.7)
        place(sfx_pop(1.0), S_END + 0.1, 0.5)
        place(sfx_pop(1.1), S_END + 0.5, 0.5)
        place(sfx_boom(r), S_END + 1.2, 0.8)
        for k in range(int((DUR - S_END - 1.6)*2)):
            place(sfx_tick(r), S_END + 1.6 + k*0.5, 0.45)
        place(sfx_pop(1.2), S_END + 2.4, 0.7)
        place(sfx_ding(), S_END + 3.2, 0.6)
        return mx


def build(script: dict) -> TwoFriendsRace:
    return TwoFriendsRace(script)
