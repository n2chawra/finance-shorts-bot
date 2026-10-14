"""money_leak_meter: a small regular expense is added up over the years on a gauge, then
compared with what the same money would have become as a monthly SIP. Seven scenes, 54 s.

Every figure on screen is computed here from the script inputs.
"""
import math

from renderer.engine import effects
from renderer.engine.audio import (Mixer, sfx_boom, sfx_clink, sfx_ding, sfx_fail, sfx_kaching, sfx_pop,
                                   sfx_riser, sfx_tick, sfx_whoosh)
from renderer.engine.canvas import MIN_TEXT, RGB, SAFE_W, W, Canvas
from renderer.engine.characters import person
from renderer.engine.easing import back, ease, ramp
from renderer.engine.finance import sip_series
from renderer.engine.formatting import axis_label, inr, inr_long, nice_axis, rupees, times
from renderer.engine.props import coin, vbar
from renderer.engine.video import Video

DUR = 54
S_HOOK, S_LEAK, S_METER, S_FLIP, S_GROW, S_CMP, S_END = 0, 5, 14, 23, 27, 40, 46
METER_T0, METER_DUR = 1.0, 5.0
GROW_T0, GROW_DUR = 0.8, 9.0
CMP_REVEAL = 1.9
DRIP_SPEED = 1.5      # coins per second


def wallet(c: Canvas, cx: float, cy: float, color: RGB, a: float = 1.0, t: float = 0.0) -> None:
    """Simple wallet, wobbling slightly."""
    if a <= 0.01:
        return
    cy += math.sin(t*3)*6
    w, h = 300, 210
    dark = tuple(int(v*0.7) for v in color)
    c.d.rounded_rectangle([cx - w/2, cy - h/2, cx + w/2, cy + h/2], radius=36, fill=c.mix(color, a))
    c.d.rounded_rectangle([cx - w/2, cy - h/2, cx + w/2, cy - h/2 + 70], radius=36, fill=c.mix(dark, a))
    c.d.rounded_rectangle([cx + w/2 - 110, cy - 30, cx + w/2 + 14, cy + 40], radius=24, fill=c.mix(dark, a))
    c.d.ellipse([cx + w/2 - 82, cy - 10, cx + w/2 - 52, cy + 20], fill=c.mix(c.pal.accent, a))


def drips(c: Canvas, cx: float, top: float, bottom: float, t: float, a: float = 1.0) -> None:
    """Coins falling out of the wallet and fading before they reach `bottom`."""
    for i in range(3):
        ph = (t*DRIP_SPEED/3 + i/3) % 1.0
        y = top + (ph**1.7)*(bottom - top)
        coin(c, cx + (i - 1)*70, y, 34, a*(1 - ph**3))


class MoneyLeakMeter(Video):
    duration = DUR
    thumbnail_time = 3.0
    key_times = [1.2, 3.5, 12.5, 21.5, 25.5, 36.0, 43.5, 52.0]

    def __init__(self, script: dict) -> None:
        super().__init__(script)
        self.item: str = script["item"]
        self.cost: int = script["cost"]
        self.per_month: int = script["times_per_month"]
        self.years: int = script["years"]
        self.rate: float = script["annual_return_pct"]
        self.monthly = self.cost*self.per_month
        self.yearly = self.monthly*12
        self.spent = self.yearly*self.years
        self.series = sip_series(self.monthly, self.rate, self.years*12)
        self.fv = self.series[-1]

        self.txt = self.fill({**script["text"], "item": self.item}, {
            "item": self.item, "cost": rupees(self.cost), "times": self.per_month, "years": self.years,
            "rate": f"{self.rate:g}%", "monthly": inr(self.monthly), "yearly": inr(self.yearly),
            "spent": inr(self.spent), "spent_long": inr_long(self.spent),
            "fv": inr(self.fv), "fv_long": inr_long(self.fv),
            "gains": inr(self.fv - self.spent), "ratio": times(self.fv/self.spent),
        })
        self.ticks = nice_axis(self.fv)

        self.impacts = [0.0, S_METER + METER_T0 + METER_DUR, S_CMP + CMP_REVEAL, S_END + 1.2]
        self.punches = [S_FLIP + 0.9]
        self.flashes = [S_CMP + CMP_REVEAL]
        self.scenes = [(S_HOOK, S_LEAK, self._hook), (S_LEAK, S_METER, self._leak), (S_METER, S_FLIP, self._meter),
                       (S_FLIP, S_GROW, self._flip), (S_GROW, S_CMP, self._grow), (S_CMP, S_END, self._compare),
                       (S_END, DUR, self._end)]

    # ---------------- scenes ----------------

    def _hook(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        k = back(ramp(t, 0.0, 0.35))
        c.text(self.txt["hook_title"], W/2, 330, 92*(0.6 + 0.4*k), P.text, A, max_w=SAFE_W)
        c.caption(self.txt["hook_sub"], 0.8, t, 455, 100, P.accent, A)
        wa = ramp(t, 1.3)*A
        wallet(c, W/2, 880, P.cast[1], wa, t)
        if t > 1.6:
            drips(c, W/2, 1020, 1520, t, wa)
        c.text(self.txt["hook_tease"], W/2, 1620, 50, P.muted, ramp(t, 2.8)*A, "Medium", max_w=SAFE_W)

    def _leak(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["leak_title"], 0.15, t, 300, 80, P.text, A)
        for i, (label, value, t0) in enumerate((("Every month", self.monthly, 1.0), ("Every year", self.yearly, 3.2))):
            a = ramp(t, t0, 0.2)*A
            y = 540 + i*230 + (1 - back(ramp(t, t0, 0.4)))*80
            c.d.rounded_rectangle([110, y - 95, W - 110, y + 95], radius=40, fill=c.mix(P.panel, a))
            c.text(label, 160, y, 50, P.muted, a, "Medium", "lm")
            c.text(inr(value*ease(ramp(t, t0 + 0.2, 1.2))), W - 160, y, 88, P.danger if i else P.accent, a, anchor="rm")
        wallet(c, W/2, 1130, P.cast[1], A, t)
        drips(c, W/2, 1270, 1600, t, A)
        na = ramp(t, 6.4, 0.2)*A
        c.pill(W/2, 1700, self.txt["leak_note"], 56*(0.7 + 0.3*back(ramp(t, 6.4, 0.35))), P.text, P.danger, na)

    def _meter(self, c: Canvas, t: float, A: float) -> None:
        P, d = self.pal, c.d
        c.caption(self.txt["meter_title"], 0.15, t, 300, 80, P.text, A)
        a = ramp(t, 0.3)*A
        p = ease(ramp(t, METER_T0, METER_DUR))
        cx, cy, r = W/2, 1010, 380
        for (a0, a1), col in zip(((180, 240), (240, 300), (300, 360)), (P.cast[0], P.accent, P.danger)):
            d.arc([cx - r, cy - r, cx + r, cy + r], a0 + 1.5, a1 - 1.5, fill=c.mix(col, a), width=70)
        ang = math.radians(180 + 180*p + (math.sin(t*40)*1.5 if 0 < p < 1 else 0))
        d.line([cx, cy, cx + math.cos(ang)*(r - 100), cy + math.sin(ang)*(r - 100)], fill=c.mix(P.text, a), width=16)
        d.ellipse([cx - 34, cy - 34, cx + 34, cy + 34], fill=c.mix(P.text, a))
        done = t > METER_T0 + METER_DUR
        sz = 130*(1 + 0.2*math.exp(-(t - METER_T0 - METER_DUR)*4)) if done else 130
        c.text(inr(self.spent*p), W/2, 1220, sz, P.danger, a, max_w=SAFE_W)
        c.text(self.txt["meter_label"], W/2, 1350, 54, P.text, a, "Medium", max_w=SAFE_W)
        c.pill(W/2, 1540, f"Year {int(self.years*p)}", 60, P.bg, P.text, a)

    def _flip(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["flip_line1"], 0.1, t, 620, 90, P.text, A)
        c.caption(self.txt["flip_line2"], 0.9, t, 760, 104, P.accent, A)
        person(c, W/2, 1500, 1.3, P.cast[0], ramp(t, 0.3)*A, t, "wow" if t > 0.9 else "neutral", look=self.style.looks[0])

    def _grow(self, c: Canvas, t: float, A: float) -> None:
        P, d = self.pal, c.d
        c.caption(self.txt["grow_title"], 0.15, t, 290, 80, P.text, A)
        L, R, T, B = 180, 980, 480, 1380
        a = ramp(t, 0.2)*A
        ymax = self.ticks[-1]
        months = self.years*12
        for v in self.ticks:
            y = B - (B - T)*v/ymax
            d.line([L, y, R, y], fill=c.mix(P.grid, a), width=2)
            c.text(axis_label(v), L - 16, y, MIN_TEXT, P.muted, a, "Medium", "rm")
        n = int(ease(ramp(t, GROW_T0, GROW_DUR))*months)
        step = max(1, months//140)
        put = [(L + (R - L)*m/months, B - (B - T)*self.monthly*m/ymax) for m in (*range(0, n + 1, step), n)]
        val = [(L + (R - L)*m/months, B - (B - T)*self.series[m]/ymax) for m in (*range(0, n + 1, step), n)]
        if n > 0:
            d.line(put, fill=c.mix(P.cast[1], A), width=10, joint="curve")
            d.line(val, fill=c.mix(P.cast[0], A*0.25), width=30, joint="curve")   # glow
            d.line(val, fill=c.mix(P.cast[0], A), width=12, joint="curve")
        for (x, y), col in ((put[-1], P.cast[1]), (val[-1], P.cast[0])):
            r = 16 + 4*math.sin(t*10)
            d.ellipse([x - r, y - r, x + r, y + r], fill=c.mix(col, A))
        c.pill(W/2, 1480, f"Year {n//12}", 56, P.bg, P.text, a)
        c.text("Put in", W/2 - 250, 1590, MIN_TEXT, P.muted, a, "Medium")
        c.text(inr(self.monthly*n), W/2 - 250, 1670, 68, P.cast[1], a)
        c.text("Worth", W/2 + 250, 1590, MIN_TEXT, P.muted, a, "Medium")
        c.text(inr(self.series[n]), W/2 + 250, 1670, 68, P.cast[0], a)

    def _compare(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        effects.draw_confetti(c, self.confetti, t - CMP_REVEAL, A)
        c.caption(self.txt["cmp_title"], 0.1, t, 300, 84, P.text, A)
        a = ramp(t, 0.3)*A
        cnt = ease(ramp(t, 0.5, 1.4))
        base, full = 1500, 760
        for i, (label, v, col, x) in enumerate((("Spent", self.spent, P.danger, W/2 - 230),
                                                ("If invested", self.fv, P.cast[0], W/2 + 230))):
            h = full*(v/self.fv)*cnt
            vbar(c, x, base, 240, h, col, a)
            c.text(inr(v*cnt), x, base - h - 60, 68, P.text, a)   # value in text colour: readable on any bar or confetti
            c.text(label, x, base + 60, 52, P.text, a)
        c.caption(self.txt["cmp_line"], CMP_REVEAL + 0.3, t, 440, 76, P.accent, A)

    def _end(self, c: Canvas, t: float, A: float) -> None:
        self.end_scene(c, t, A, f"Assumes {self.rate:g}% a year, invested monthly.")

    # ---------------- audio ----------------

    def audio(self) -> Mixer:
        peak = S_METER + METER_T0 + METER_DUR
        mx = self.mixer([(peak - 0.3, peak, 0.1), (S_FLIP, S_FLIP + 0.9, 0.15),
                         (S_CMP + CMP_REVEAL - 0.4, S_CMP + CMP_REVEAL, 0.0),
                         (S_CMP + CMP_REVEAL, S_CMP + CMP_REVEAL + 0.7, 0.8)])
        r, place = mx.rng, mx.place
        place(sfx_boom(r), 0.0, 0.9)
        place(sfx_whoosh(r, 0.35), 0.0, 0.6)
        place(sfx_pop(1.2), 0.8, 0.7)
        self.scene_whooshes(mx)
        for k in range(int((S_METER - 1.8)*DRIP_SPEED)):          # coins dripping through hook and leak
            place(sfx_clink(0.85 + 0.2*((k*7) % 5)/5), 1.8 + k/DRIP_SPEED, 0.4, ((k % 3) - 1)*0.3)
        place(sfx_pop(1.0), S_LEAK + 0.15, 0.6)
        for t0 in (1.2, 3.4):
            place(sfx_pop(1.1), S_LEAK + t0 - 0.2, 0.7)
            for k in range(12):
                place(sfx_tick(r), S_LEAK + t0 + k*0.1, 0.45)
        place(sfx_fail(), S_LEAK + 6.4, 0.8)
        place(sfx_pop(1.0), S_METER + 0.15, 0.6)
        place(sfx_riser(r, METER_DUR), S_METER + METER_T0, 0.55)
        for k in range(int(METER_DUR*5)):
            place(sfx_tick(r), S_METER + METER_T0 + k*0.2, 0.35)
        place(sfx_boom(r), peak, 1.0)
        place(sfx_fail(), peak + 0.1, 0.7)
        place(sfx_pop(1.0), S_FLIP + 0.1, 0.6)
        place(sfx_ding(1568), S_FLIP + 0.9, 0.8)
        place(sfx_pop(1.0), S_GROW + 0.15, 0.6)
        place(sfx_riser(r, GROW_DUR), S_GROW + GROW_T0, 0.5)
        for k in range(int(GROW_DUR*4)):
            place(sfx_tick(r), S_GROW + GROW_T0 + k*0.25, 0.35)
        place(sfx_ding(), S_GROW + GROW_T0 + GROW_DUR, 0.7)
        place(sfx_pop(1.0), S_CMP + 0.1, 0.6)
        for k in range(14):
            place(sfx_tick(r), S_CMP + 0.5 + k*0.1, 0.5)
        place(sfx_boom(r), S_CMP + CMP_REVEAL, 1.0)
        place(sfx_kaching(), S_CMP + CMP_REVEAL + 0.05, 0.9)
        place(sfx_pop(1.3), S_CMP + CMP_REVEAL + 0.3, 0.7)
        place(sfx_pop(1.0), S_END + 0.1, 0.5)
        place(sfx_pop(1.1), S_END + 0.5, 0.5)
        place(sfx_boom(r), S_END + 1.2, 0.8)
        place(sfx_pop(1.2), S_END + 2.6, 0.7)
        place(sfx_ding(), S_END + 3.4, 0.6)
        return mx


def build(script: dict) -> MoneyLeakMeter:
    return MoneyLeakMeter(script)
