"""money_news: a finance news story for one viewer. The headline figure lands in the first second,
then what happened (up to three sourced facts), why it matters, and what it means for you (a
worked example computed here), then the source and the disclaimer. Five scenes, 52 s.

Two kinds of numbers appear, and both reach the screen only through code:
- **Sourced facts** (`facts`): figures reported by an official source (AMFI, RBI, SEBI, ...),
  copied unchanged from the research topic feed (the number check compares them), formatted
  here, and verified against their source by the fact reviewer. The source is shown on screen.
- **Computed figures**: the "what it means for you" example (an SIP, a lump sum or inflation),
  calculated from the script's inputs like every other template.
"""
from renderer.engine.audio import Mixer, sfx_boom, sfx_ding, sfx_kaching, sfx_pop, sfx_riser, sfx_tick, sfx_whoosh
from renderer.engine.canvas import MIN_TEXT, SAFE_W, W, Canvas
from renderer.engine.characters import person
from renderer.engine.easing import back, ease, ramp
from renderer.engine.finance import lumpsum_at, sip_series
from renderer.engine.formatting import fact_value, inr, inr_long, month_year, rupees, times
from renderer.engine.props import stamp, vbar
from renderer.engine.video import Video

DUR = 52
S_HOOK, S_WHAT, S_WHY, S_YOU, S_END = 0, 5, 16, 26, 40
HIT = 0.45              # seconds into the hook when the headline figure slams in
CARD_Y = (500, 790, 1080)
BAR_T0 = 1.6            # seconds into the "you" scene when the bars start growing


class MoneyNews(Video):
    duration = DUR
    thumbnail_time = 2.2
    key_times = [0.8, 2.2, 8.5, 14.5, 21.0, 32.0, 38.0, 49.0]
    voice_offsets = {"hook": (HIT + 0.3, None)}   # voiceover: let the headline figure land first

    def __init__(self, script: dict) -> None:
        super().__init__(script)
        self.facts: list[dict] = script["facts"]
        self.shown = [fact_value(f["value"], f["unit"]) for f in self.facts]
        sources = []
        for f in self.facts:
            if f["source"] not in sources:
                sources.append(f["source"])
        latest = max(f["as_of"] for f in self.facts)
        self.source_line = f"Data: {' · '.join(sources)} · {month_year(latest)}"

        ex = script["example"]
        self.kind: str = ex["kind"]
        self.amount: int = ex["amount"]
        self.years: int = ex["years"]
        self.rate: float = ex["rate_pct"]
        if self.kind == "sip":
            self.result = sip_series(self.amount, self.rate, self.years*12)[-1]
            self.base = self.amount*12*self.years
            self.bar_labels = ("You put in", "It becomes")
            self.example_pill = f"{rupees(self.amount)} a month · {self.years} years · {self.rate:g}% a year"
            self.assumption = f"Assumes {self.rate:g}% a year, invested monthly."
        elif self.kind == "lumpsum":
            self.result = lumpsum_at(self.amount, self.rate, self.years)
            self.base = self.amount
            self.bar_labels = ("You put in", "It becomes")
            self.example_pill = f"{rupees(self.amount)} once · {self.years} years · {self.rate:g}% a year"
            self.assumption = f"Assumes {self.rate:g}% a year, compounded yearly."
        else:   # inflation: what an amount buys after years of rising prices
            self.result = self.amount/(1 + self.rate/100)**self.years
            self.base = self.amount
            self.bar_labels = ("Today", f"In {self.years} years")
            self.example_pill = f"{rupees(self.amount)} · {self.years} years · {self.rate:g}% inflation"
            self.assumption = f"Assumes {self.rate:g}% inflation a year."
        if inr(self.result) == inr(self.base):
            raise ValueError("the example's two values look the same on screen; change the amount, years or rate")

        placeholders: dict[str, object] = {
            "amount": rupees(self.amount), "amount_long": inr_long(self.amount), "years": self.years, "rate": f"{self.rate:g}%",
            "result": inr(self.result), "result_long": inr_long(self.result),
        }
        if self.kind == "inflation":
            placeholders["lost_pct"] = f"{(1 - self.result/self.amount)*100:.0f}%"
        else:
            placeholders.update(invested=inr(self.base), gains=inr(self.result - self.base), ratio=times(self.result/self.base))
        for letter, f, shown in zip("abc", self.facts, self.shown):   # letters: placeholder names can't hold digits
            placeholders[f"fact_{letter}"] = shown
            placeholders[f"fact_{letter}_label"] = f["label"]
        self.txt = self.fill(script["text"], placeholders)

        self.impacts = [HIT, S_YOU + BAR_T0 + 2.4, S_END + 1.2]
        self.punches = [S_WHAT + 0.5 + i*1.3 for i in range(len(self.facts))]
        self.flashes = [HIT]
        self.scenes = [(S_HOOK, S_WHAT, self._hook), (S_WHAT, S_WHY, self._what), (S_WHY, S_YOU, self._why),
                       (S_YOU, S_END, self._you), (S_END, DUR, self._end)]

    # ---------------- scenes ----------------

    def _hook(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        stamp(c, W/2, 300, "MONEY NEWS", 92, P.danger, A, back(ramp(t, 0.0, 0.3)))
        k = back(ramp(t, HIT, 0.35))
        c.text(self.shown[0], W/2, 610, 180*(0.55 + 0.45*k), P.accent, ramp(t, HIT, 0.1)*A, max_w=SAFE_W)
        c.text(self.facts[0]["label"], W/2, 760, 60, P.text, ramp(t, HIT + 0.4, 0.2)*A, "SemiBold", max_w=SAFE_W)
        c.caption(self.txt["headline1"], 1.3, t, 960, 80, P.text, A)
        person(c, W/2, 1600, 1.2, P.cast[0], ramp(t, 0.6)*A, t, "wow" if t > HIT else "neutral", look=self.style.looks[0])

    def _what(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["what_title"], 0.1, t, 300, 78, P.text, A)
        for i, (f, shown) in enumerate(zip(self.facts, self.shown)):
            t0 = 0.5 + i*1.3
            a = ramp(t, t0, 0.2)*A
            x = W/2 + (1 - back(ramp(t, t0, 0.4)))*260
            y = CARD_Y[i]
            c.d.rounded_rectangle([x - 450, y - 115, x + 450, y + 115], radius=44, fill=c.mix(P.panel, a))
            c.text(shown, x, y - 30, 96, P.cast[i], a, max_w=820)
            c.text(f["label"], x, y + 62, 48, P.text, a, "Medium", max_w=820)
        last = CARD_Y[len(self.facts) - 1] + 115
        c.caption(self.txt["headline2"], 0.9 + len(self.facts)*1.3, t, last + 130, 66, P.accent, A)
        c.pill(W/2, 1640, self.source_line, MIN_TEXT, P.text, P.panel, ramp(t, 1.0 + len(self.facts)*1.3)*A)
        if len(self.facts) <= 2:   # fill the space the missing cards leave
            person(c, W/2, 1520, 1.0, P.cast[2], ramp(t, 1.2)*A, t, "wow", look=self.style.looks[1])

    def _why(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["why_title"], 0.1, t, 300, 80, P.text, A)
        for i, key in enumerate(("why_line1", "why_line2", "why_line3")):
            t0 = 0.8 + i*1.8
            a = ramp(t, t0, 0.2)*A
            y = 520 + i*170
            c.d.ellipse([110, y - 22, 154, y + 22], fill=c.mix(P.cast[i], a))
            c.text(self.txt[key], 190, y, 60, P.text, a, "SemiBold", anchor="lm", max_w=W - 270)
        person(c, W/2, 1560, 1.15, P.cast[1], ramp(t, 0.4)*A, t, "happy" if t > 4.4 else "neutral", look=self.style.looks[1])

    def _you(self, c: Canvas, t: float, A: float) -> None:
        P = self.pal
        c.caption(self.txt["you_title"], 0.1, t, 290, 80, P.accent, A)
        c.pill(W/2, 420, self.example_pill, 48, P.bg, P.text, ramp(t, 0.7)*A)
        a = ramp(t, BAR_T0 - 0.4)*A
        base, full = 1300, 640
        top = max(self.base, self.result)
        for i, (label, v, col, x) in enumerate(((self.bar_labels[0], self.base, P.cast[1], W/2 - 220),
                                                (self.bar_labels[1], self.result, P.cast[0], W/2 + 220))):
            cnt = ease(ramp(t, BAR_T0 + i*1.2, 1.2))
            ba = a*ramp(t, BAR_T0 - 0.2 + i*1.2, 0.2)
            h = full*(v/top)*cnt
            vbar(c, x, base, 230, h, col, ba)
            c.text(inr(v*cnt), x, base - h - 56, 66, P.text, ba)
            c.text(label, x, base + 56, 50, P.text, ba, max_w=400)
        c.caption(self.txt["you_line"], BAR_T0 + 3.4, t, 1500, 66, P.accent, A)

    def _end(self, c: Canvas, t: float, A: float) -> None:
        self.end_scene(c, t, A, self.assumption)
        c.text(self.source_line, W/2, 1600, MIN_TEXT, self.pal.muted, ramp(t, 0.5)*A, "Regular", max_w=SAFE_W)

    # ---------------- audio ----------------

    def audio(self) -> Mixer:
        mx = self.mixer([(0.0, HIT, 0.15), (HIT, HIT + 0.8, 0.8)])
        r, place = mx.rng, mx.place
        place(sfx_riser(r, self.secs(HIT)), 0.0, 0.5)
        place(sfx_boom(r), HIT, 1.0)
        place(sfx_kaching(), HIT + 0.05, 0.7)
        place(sfx_pop(1.1), 1.3, 0.6)
        self.scene_whooshes(mx)
        place(sfx_pop(1.0), S_WHAT + 0.1, 0.5)
        for i in range(len(self.facts)):
            place(sfx_whoosh(r, 0.3), S_WHAT + 0.4 + i*1.3, 0.5, (i - 1)*0.4)
            place(sfx_pop(1.0 + i*0.15), S_WHAT + 0.6 + i*1.3, 0.7)
        place(sfx_ding(1568), S_WHAT + 0.9 + len(self.facts)*1.3, 0.6)
        place(sfx_pop(1.0), S_WHY + 0.1, 0.5)
        for i in range(3):
            place(sfx_pop(1.1 + i*0.12), S_WHY + 0.8 + i*1.8, 0.6)
        place(sfx_pop(1.0), S_YOU + 0.1, 0.5)
        place(sfx_pop(1.2), S_YOU + 0.7, 0.5)
        for i in range(2):
            for k in range(12):
                place(sfx_tick(r), S_YOU + BAR_T0 + i*1.2 + k*0.1, 0.4)
        place(sfx_boom(r), S_YOU + BAR_T0 + 2.4, 0.8)
        place(sfx_ding(1760, 1.0), S_YOU + BAR_T0 + 3.4, 0.7)
        place(sfx_pop(1.0), S_END + 0.1, 0.5)
        place(sfx_pop(1.1), S_END + 0.5, 0.5)
        place(sfx_boom(r), S_END + 1.2, 0.8)
        place(sfx_pop(1.2), S_END + 2.6, 0.7)
        place(sfx_ding(), S_END + 3.4, 0.6)
        return mx


def build(script: dict) -> MoneyNews:
    return MoneyNews(script)
