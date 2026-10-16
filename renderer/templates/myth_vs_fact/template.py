"""myth_vs_fact: a money belief is stated, stamped MYTH, then tested by growing the same amount
at two yearly rates (e.g. a savings account vs rising prices). Six scenes, 50 s.

Every figure on screen is computed here from the script inputs.
"""
import math

from renderer.engine.audio import Mixer, sfx_boom, sfx_ding, sfx_fail, sfx_pop, sfx_riser, sfx_tick, sfx_whoosh
from renderer.engine.canvas import MIN_TEXT, SAFE_W, W, Canvas
from renderer.engine.characters import person
from renderer.engine.easing import back, ease, ramp
from renderer.engine.finance import lumpsum_at
from renderer.engine.formatting import inr, inr_long
from renderer.engine.props import bubble, jar, stamp, vbar
from renderer.engine.video import Video

DUR = 50
S_HOOK, S_SETUP, S_BUST, S_RACE, S_RES, S_END = 0, 5, 12, 16, 30, 40
BUST_AT = 0.4                    # seconds into the bust scene when FACT slams in
RACE_T0, RACE_DUR = 1.0, 10.0
COUNT_T0, COUNT_DUR = 0.6, 1.6   # result count-up


class MythVsFact(Video):
    duration = DUR
    thumbnail_time = 3.0
    key_times = [0.6, 3.0, 10.5, 14.5, 22.0, 28.5, 36.0, 48.0]
    # voiceover: silent before FACT slams in, and while the result counts up
    voice_offsets = {"bust": (BUST_AT + 0.4, None), "result": (COUNT_T0 + COUNT_DUR + 0.2, None)}

    def __init__(self, script: dict) -> None:
        super().__init__(script)
        self.amount: int = script["amount"]
        self.years: int = script["years"]
        a, b = script["tracks"]
        self.labels = [a["label"], b["label"]]
        self.rates = [a["rate_pct"], b["rate_pct"]]
        if self.rates[1] <= self.rates[0]:
            raise ValueError("the second track must grow faster than the first (that is what busts the myth)")
        self.final = [lumpsum_at(self.amount, r, self.years) for r in self.rates]
        self.gap = self.final[1] - self.final[0]
        real = self.amount*self.final[0]/self.final[1]    # the first track measured against the second
        lost_pct = (1 - real/self.amount)*100
        if inr(self.final[0]) == inr(self.final[1]):
            raise ValueError("the two tracks end at the same displayed value; widen the rates or the years")

        self.txt = self.fill({**script["text"], "label_a": self.labels[0], "label_b": self.labels[1]}, {
            "amount": inr(self.amount), "amount_long": inr_long(self.amount), "years": self.years,
            "a_label": self.labels[0], "b_label": self.labels[1],
            "a_rate": f"{self.rates[0]:g}%", "b_rate": f"{self.rates[1]:g}%",
            "a_final": inr(self.final[0]), "b_final": inr(self.final[1]),
            "gap": inr(self.gap), "real_value": inr(real), "lost_pct": f"{lost_pct:.0f}%",
        })

        self.reveal = S_RES + COUNT_T0 + COUNT_DUR
        self.impacts = [0.0, S_BUST + BUST_AT, self.reveal, S_END + 1.2]
        self.flashes = [S_BUST + BUST_AT]
        self.scenes = [(S_HOOK, S_SETUP, self._hook), (S_SETUP, S_BUST, self._setup), (S_BUST, S_RACE, self._bust),
                       (S_RACE, S_RES, self._race), (S_RES, S_END, self._result), (S_END, DUR, self._end)]

    # ---------------- scenes ----------------

    def _hook(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        stamp(c, W/2, 340, "MYTH", 150, P.danger, A, back(ramp(t, 0.0, 0.3)))
        ba = ramp(t, 0.8, 0.2)*A
        k = back(ramp(t, 0.8, 0.35))
        bubble(c, W/2, 800, 920*(0.8 + 0.2*k), 320*(0.8 + 0.2*k), ba)
        c.text(self.txt["myth_line1"], W/2, 745, 66, P.bg, ba*ramp(t, 0.9, 0.1), max_w=820)
        c.text(self.txt["myth_line2"], W/2, 855, 66, P.bg, ba*ramp(t, 1.3, 0.1), max_w=820)
        person(c, W/2, 1560, 1.3, P.cast[0], ramp(t, 0.5)*A, t, "happy", look=self.style.looks[0])

    def _setup(self, c: Canvas, t: float, A: float) -> None:
        P, col = self.pal, self.pal.cast[0]
        c.caption(self.txt["setup_title"], 0.15, t, 300, 76, P.text, A)
        cnt = ease(ramp(t, 0.7, 1.2))
        c.text(inr(self.amount*cnt), W/2, 440, 120, col, ramp(t, 0.7, 0.2)*A, max_w=SAFE_W)
        c.pill(W/2, 580, f"{self.labels[0]} · {self.rates[0]:g}% a year", 50, P.bg, P.text, ramp(t, 1.9)*A)
        person(c, 300, 1450, 1.15, col, A, t, "happy", look=self.style.looks[0])
        jar(c, 720, 1500, 300, 420, 0.25 + 0.6*ease(ramp(t, 1.0, 4.0)), col, A)
        na = ramp(t, 4.6, 0.2)*A
        c.pill(W/2, 1700, self.txt["setup_note"], 56*(0.7 + 0.3*back(ramp(t, 4.6, 0.35))), P.bg, col, na)

    def _bust(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["bust_line"], 0.0, t, 420, 84, P.text, A*(1 - ramp(t, BUST_AT - 0.1, 0.1)))
        fa = ramp(t, BUST_AT, 0.1)*A
        stamp(c, W/2, 640, "FACT", 210, P.accent, fa, back(ramp(t, BUST_AT, 0.3)))
        c.caption(self.txt["bust_sub"], BUST_AT + 0.7, t, 920, 72, P.text, A)
        person(c, W/2, 1560, 1.3, P.cast[0], A, t, "wow" if t > BUST_AT else "happy", look=self.style.looks[0])

    def _race(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["race_title"], 0.15, t, 290, 80, P.text, A)
        a = ramp(t, 0.3)*A
        p = ease(ramp(t, RACE_T0, RACE_DUR))
        yr = self.years*p
        whole = int(yr + 1e-9)
        base, full = 1380, 760
        c.d.line([120, base + 4, W - 120, base + 4], fill=c.mix(P.grid, a), width=4)
        for i, x in enumerate((W/2 - 230, W/2 + 230)):
            col = P.cast[i]
            h = full*lumpsum_at(self.amount, self.rates[i], yr)/self.final[1]   # bars grow smoothly
            vbar(c, x, base, 240, h, col, a)
            # the amount is for the whole year on the "Year N" pill, so the two always agree
            c.text(inr(lumpsum_at(self.amount, self.rates[i], whole)), x, base - h - 52, 64, col, a)
            c.text(self.labels[i], x, base + 56, 48, P.text, a, max_w=420)
            c.text(f"{self.rates[i]:g}% a year", x, base + 118, MIN_TEXT, P.muted, a, "Medium")
        c.pill(W/2, 1650, f"Year {whole}", 60, P.bg, P.text, a)

    def _result(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["result_line1"], 0.1, t, 330, 78, P.text, A)
        cnt = ease(ramp(t, COUNT_T0, COUNT_DUR))
        done = t > COUNT_T0 + COUNT_DUR
        sz = 150*(1 + 0.2*math.exp(-(t - COUNT_T0 - COUNT_DUR)*4)) if done else 150
        c.text(inr(self.gap*cnt), W/2, 510, sz, P.danger, ramp(t, COUNT_T0, 0.2)*A, max_w=SAFE_W)
        c.caption(self.txt["result_line2"], 3.0, t, 700, 60, P.accent, A)
        person(c, W/2, 1330, 1.2, P.cast[0], ramp(t, 0.3)*A, t, "sad" if done else "neutral", look=self.style.looks[0])
        for i, y in enumerate((1470, 1560)):
            c.text(f"{self.labels[i]}: {inr(self.final[i])}", W/2, y, 54, P.cast[i], ramp(t, 3.8 + i*0.4)*A, max_w=SAFE_W)

    def _end(self, c: Canvas, t: float, A: float) -> None:
        self.end_scene(c, t, A, f"Assumes {self.rates[0]:g}% and {self.rates[1]:g}% yearly growth.")

    # ---------------- audio ----------------

    def audio(self) -> Mixer:
        mx = self.mixer([(S_BUST - 0.3, S_BUST + BUST_AT, 0.0),             # silence before FACT
                         (S_BUST + BUST_AT, S_BUST + 1.2, 0.8),
                         (self.reveal - 0.3, self.reveal, 0.1)])
        r, place = mx.rng, mx.place
        place(sfx_boom(r), 0.0, 0.9)
        place(sfx_whoosh(r, 0.35), 0.0, 0.6)
        place(sfx_pop(1.0), 0.8, 0.8)
        place(sfx_pop(1.2), 1.3, 0.6)
        self.scene_whooshes(mx)
        place(sfx_pop(1.0), S_SETUP + 0.15, 0.6)
        for k in range(12):
            place(sfx_tick(r), S_SETUP + 0.7 + k*0.1, 0.4)
        place(sfx_pop(1.2), S_SETUP + 1.9, 0.6)
        place(sfx_ding(), S_SETUP + 4.6, 0.7)
        place(sfx_boom(r), S_BUST + BUST_AT, 1.0)
        place(sfx_fail(), S_BUST + BUST_AT + 0.1, 0.7)
        place(sfx_pop(1.1), S_BUST + BUST_AT + 0.7, 0.7)
        place(sfx_pop(1.0), S_RACE + 0.15, 0.6)
        place(sfx_riser(r, RACE_DUR), S_RACE + RACE_T0, 0.5)
        for k in range(self.years + 1):   # one tick per year on screen
            place(sfx_tick(r), S_RACE + RACE_T0 + self._year_time(k), 0.45)
        place(sfx_ding(1568), S_RACE + RACE_T0 + RACE_DUR, 0.7)
        place(sfx_pop(1.0), S_RES + 0.1, 0.6)
        for k in range(16):
            place(sfx_tick(r), S_RES + COUNT_T0 + k*0.1, 0.5)
        place(sfx_boom(r), self.reveal, 1.0)
        place(sfx_fail(), self.reveal + 0.05, 0.8)
        place(sfx_pop(1.3), S_RES + 3.0, 0.7)
        place(sfx_pop(1.0), S_RES + 3.8, 0.5)
        place(sfx_pop(1.1), S_RES + 4.2, 0.5)
        place(sfx_pop(1.0), S_END + 0.1, 0.5)
        place(sfx_pop(1.1), S_END + 0.5, 0.5)
        place(sfx_boom(r), S_END + 1.2, 0.8)
        place(sfx_pop(1.2), S_END + 2.6, 0.7)
        place(sfx_ding(), S_END + 3.4, 0.6)
        return mx

    def _year_time(self, k: int) -> float:
        """Seconds after the race starts at which the year counter reaches k (inverse of ease)."""
        p = k/self.years
        u = (p/4)**(1/3) if p < 0.5 else 1 - (2*(1 - p))**(1/3)/2
        return u*RACE_DUR


def build(script: dict) -> MythVsFact:
    return MythVsFact(script)
