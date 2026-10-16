"""quiz_countdown: a "how much will you have?" question with three options, a five-second
countdown, the reveal, and a breakdown of money put in vs growth. Six scenes, 48 s.

The correct answer is computed from the inputs. Wrong options are the correct answer times the
script's `distractors` multipliers, so no option value is ever typed by hand.
"""
import math
import random

from renderer.engine import effects
from renderer.engine.audio import (Mixer, sfx_beep, sfx_boom, sfx_ding, sfx_fail, sfx_kaching, sfx_pop,
                                   sfx_tick, sfx_whoosh)
from renderer.engine.canvas import SAFE_W, W, Canvas
from renderer.engine.characters import person
from renderer.engine.easing import back, ease, ramp
from renderer.engine.finance import lumpsum_at, sip_series
from renderer.engine.formatting import inr, inr_long, rupees, times
from renderer.engine.props import stamp, vbar
from renderer.engine.video import Video

DUR = 48
S_HOOK, S_Q, S_OPT, S_REVEAL, S_WHY, S_END = 0, 4, 12, 22, 30, 40
COUNT_T0 = 4.0        # seconds into the options scene when the countdown starts
REVEAL_AT = 0.6
LETTERS = "ABC"
CARD_Y = (560, 800, 1040)


class QuizCountdown(Video):
    duration = DUR
    thumbnail_time = 2.5
    key_times = [0.6, 2.5, 10.0, 15.0, 18.5, 26.0, 36.0, 46.0]
    # voiceover: stop before the countdown, stay quiet until the answer lands
    voice_offsets = {"options": (0.25, COUNT_T0 - 0.2), "reveal": (REVEAL_AT + 0.5, None)}

    def __init__(self, script: dict) -> None:
        super().__init__(script)
        self.kind: str = script["kind"]
        self.amount: int = script["amount"]
        self.years: int = script["years"]
        self.rate: float = script["annual_return_pct"]
        if self.kind == "sip":
            self.answer = sip_series(self.amount, self.rate, self.years*12)[-1]
            self.invested = self.amount*12*self.years
            self.assumption = f"Assumes {self.rate:g}% a year, invested monthly."
        else:
            self.answer = lumpsum_at(self.amount, self.rate, self.years)
            self.invested = self.amount
            self.assumption = f"Assumes {self.rate:g}% a year, compounded yearly."
        self.gains = self.answer - self.invested

        self.slot = random.Random(f"quiz:{self.seed}").randrange(3)   # where the right answer sits
        wrong = [self.answer*m for m in script["distractors"]]
        self.options = wrong[:self.slot] + [self.answer] + wrong[self.slot:]
        if len({inr(v) for v in self.options}) < 3:
            raise ValueError(f"options are not distinct on screen: {[inr(v) for v in self.options]}")

        self.txt = self.fill(script["text"], {
            "amount": rupees(self.amount), "years": self.years, "rate": f"{self.rate:g}%",
            "answer": inr(self.answer), "answer_long": inr_long(self.answer),
            "invested": inr(self.invested), "gains": inr(self.gains),
            "ratio": times(self.answer/self.invested), "letter": LETTERS[self.slot],
        })

        self.impacts = [0.0, S_REVEAL + REVEAL_AT, S_END + 1.2]
        self.punches = [S_OPT + COUNT_T0 + i for i in range(5)]
        self.flashes = [S_REVEAL + REVEAL_AT]
        self.scenes = [(S_HOOK, S_Q, self._hook), (S_Q, S_OPT, self._question), (S_OPT, S_REVEAL, self._options),
                       (S_REVEAL, S_WHY, self._reveal), (S_WHY, S_END, self._why), (S_END, DUR, self._end)]

    # ---------------- scenes ----------------

    def _hook(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        stamp(c, W/2, 380, "QUIZ", 170, P.accent, A, back(ramp(t, 0.0, 0.3)))
        c.caption(self.txt["hook_line"], 0.7, t, 640, 72, P.text, A)
        person(c, W/2, 1520, 1.3, P.cast[0], ramp(t, 0.4)*A, t, "neutral", look=self.style.looks[0])
        for i, (dx, dy) in enumerate(((-250, -520), (0, -640), (250, -520))):
            qa = ramp(t, 1.2 + i*0.25, 0.2)*A
            k = back(ramp(t, 1.2 + i*0.25, 0.35))
            c.text("?", W/2 + dx, 1520 + dy + math.sin(t*3 + i)*14, 130*(0.5 + 0.5*k), P.cast[(i + 1) % 3], qa)

    def _question(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["q_title"], 0.1, t, 300, 76, P.muted, A)
        pa = ramp(t, 0.4, 0.2)*A
        c.d.rounded_rectangle([100, 430, W - 100, 930], radius=48, fill=c.mix(P.panel, pa))
        for i, key in enumerate(("q_line1", "q_line2", "q_line3")):
            t0 = 0.7 + i*0.7
            k = back(ramp(t, t0, 0.35))
            c.text(self.txt[key], W/2, 540 + i*140, 76*(0.6 + 0.4*k), P.cast[0] if i == 0 else P.text,
                   ramp(t, t0, 0.2)*A, max_w=800)
        c.caption(self.txt["question"], 3.2, t, 1120, 88, P.accent, A)
        c.pill(W/2, 1300, self.txt["q_cta"], 50, P.bg, P.text, ramp(t, 4.4)*A)

    def _cards(self, c: Canvas, t: float, A: float, appear: bool, revealed: bool) -> None:
        """The three option cards. `revealed` dims the wrong ones and lights up the right one."""
        P = self.pal
        for i, y in enumerate(CARD_Y):
            t0 = 0.3 + i*0.6
            a = (ramp(t, t0, 0.2) if appear else 1.0)*A
            x = W/2 + ((1 - back(ramp(t, t0, 0.4)))*300 if appear else 0)
            right = i == self.slot
            fill, ink, alpha = P.panel, P.text, a
            if revealed:
                if right:
                    fill, ink = P.cast[0], P.bg
                    x += math.sin(t*30)*10*math.exp(-(t - REVEAL_AT)*5)
                else:
                    alpha = a*0.35
            c.d.rounded_rectangle([x - 430, y - 95, x + 430, y + 95], radius=44, fill=c.mix(fill, alpha))
            c.d.ellipse([x - 390, y - 60, x - 270, y + 60], fill=c.mix(P.accent if not (revealed and right) else P.bg, alpha))
            c.text(LETTERS[i], x - 330, y, 72, P.bg if not (revealed and right) else P.cast[0], alpha)
            c.text(inr(self.options[i]), x + 60, y, 88, ink, alpha, max_w=560)

    def _options(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.text(self.txt["question"], W/2, 330, 66, P.accent, A, max_w=SAFE_W)
        self._cards(c, t, A, appear=True, revealed=False)
        cx, cy, r = W/2, 1440, 170
        lt = t - COUNT_T0
        if 0 <= lt < 5:
            n = 5 - int(lt)
            frac = lt - int(lt)
            col = P.danger if n <= 2 else P.text
            c.d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=c.mix(P.grid, A), width=18)
            c.d.arc([cx - r, cy - r, cx + r, cy + r], -90, -90 + 360*(1 - frac), fill=c.mix(col, A), width=18)
            c.text(str(n), cx, cy, 190*(0.6 + 0.4*back(ramp(frac, 0, 0.25))), col, A)
        elif lt >= 5:
            c.text("Time's up!", cx, cy, 96*(0.6 + 0.4*back(ramp(lt, 5, 0.3))), P.danger, A)
        else:
            c.pill(cx, cy, self.txt["opt_cta"], 54, P.bg, P.text, ramp(t, 2.4)*A*(1 - ramp(t, COUNT_T0 - 0.3, 0.3)))

    def _reveal(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        hit = t >= REVEAL_AT
        if hit:
            effects.draw_confetti(c, self.confetti, t - REVEAL_AT, A)
            c.caption(self.txt["reveal_line"], REVEAL_AT, t, 330, 104, P.accent, A)
        else:
            c.text(self.txt["question"], W/2, 330, 66, P.accent, A, max_w=SAFE_W)
        self._cards(c, t, A, appear=False, revealed=hit)
        c.caption(self.txt["reveal_note"], REVEAL_AT + 1.2, t, 1250, 64, P.text, A)
        jump = abs(math.sin((t - REVEAL_AT)*7))*40*hit
        person(c, W/2, 1700, 0.95, P.cast[0], A, t, "wow" if hit else "neutral", jump=jump, look=self.style.looks[0])

    def _why(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["why_title"], 0.1, t, 300, 80, P.text, A)
        a = ramp(t, 0.3)*A
        base, full = 1400, 700
        top = max(self.invested, self.gains)
        for i, (label, v, col, x) in enumerate((("You put in", self.invested, P.cast[1], W/2 - 230),
                                                ("Growth", self.gains, P.cast[0], W/2 + 230))):
            cnt = ease(ramp(t, 0.6 + i*1.4, 1.2))
            ba = a*ramp(t, 0.5 + i*1.4, 0.2)
            h = full*(v/top)*cnt
            vbar(c, x, base, 240, h, col, ba)
            c.text(inr(v*cnt), x, base - h - 60, 68, P.text, ba)   # value in text colour, not the bar colour
            c.text(label, x, base + 60, 52, P.text, ba)
        c.caption(self.txt["why_line"], 3.6, t, 440, 76, P.accent, A)
        c.text(f"Total {inr(self.answer)}", W/2, 1600, 72, P.text, ramp(t, 4.4)*A)

    def _end(self, c: Canvas, t: float, A: float) -> None:
        self.end_scene(c, t, A, self.assumption)

    # ---------------- audio ----------------

    def audio(self) -> Mixer:
        hit = S_REVEAL + REVEAL_AT
        mx = self.mixer([(S_OPT + COUNT_T0 - 0.1, S_OPT + COUNT_T0 + 5.0, 0.18),   # countdown suspense
                         (S_OPT + COUNT_T0 + 5.0, hit, 0.0),                       # silence before the answer
                         (hit, hit + 0.7, 0.8)])
        r, place = mx.rng, mx.place
        place(sfx_boom(r), 0.0, 0.9)
        place(sfx_whoosh(r, 0.35), 0.0, 0.6)
        place(sfx_pop(1.0), 0.7, 0.7)
        for i in range(3):
            place(sfx_pop(1.2 + i*0.15), 1.2 + i*0.25, 0.6, (i - 1)*0.5)
        self.scene_whooshes(mx)
        place(sfx_pop(1.0), S_Q + 0.1, 0.5)
        for i in range(3):
            place(sfx_pop(1.0 + i*0.12), S_Q + 0.7 + i*0.7, 0.7)
        place(sfx_ding(1568), S_Q + 3.2, 0.7)
        place(sfx_pop(1.0), S_Q + 4.4, 0.5)
        for i in range(3):
            place(sfx_pop(0.9 + i*0.15), S_OPT + 0.3 + i*0.6, 0.8, (i - 1)*0.3)
        for i in range(5):
            place(sfx_beep(1320 if i == 4 else 880), S_OPT + COUNT_T0 + i, 0.85)
            for k in range(1, 4):
                place(sfx_tick(r), S_OPT + COUNT_T0 + i + k*0.25, 0.4)
        place(sfx_fail()[:15000], S_OPT + COUNT_T0 + 5.0, 0.6)
        place(sfx_boom(r), hit, 1.0)
        place(sfx_kaching(), hit + 0.05, 0.9)
        place(sfx_pop(1.3), hit + 1.2, 0.7)
        place(sfx_pop(1.0), S_WHY + 0.1, 0.6)
        for i in range(2):
            for k in range(12):
                place(sfx_tick(r), S_WHY + 0.6 + i*1.4 + k*0.1, 0.45)
            place(sfx_pop(1.1 + i*0.2), S_WHY + 0.5 + i*1.4, 0.6)
        place(sfx_ding(1760, 1.0), S_WHY + 3.6, 0.7)
        place(sfx_pop(1.2), S_WHY + 4.4, 0.6)
        place(sfx_pop(1.0), S_END + 0.1, 0.5)
        place(sfx_pop(1.1), S_END + 0.5, 0.5)
        place(sfx_boom(r), S_END + 1.2, 0.8)
        place(sfx_pop(1.2), S_END + 2.6, 0.7)
        place(sfx_ding(), S_END + 3.4, 0.6)
        return mx


def build(script: dict) -> QuizCountdown:
    return QuizCountdown(script)
