"""long_explainer: an 8–12 minute landscape explainer built from sections.

The script lists `maths` (named calculations) and `sections` (what the viewer sees, in order).
Every figure on screen comes from `maths`, computed here from the script's inputs, exactly as in
the Shorts templates; section text may only refer to them through `{placeholders}`.

Sections are named `s1`, `s2`, … for the voiceover. Each one is a scene, so the layout checks,
camera, music, ducking and narration windows all work unchanged.
"""
from collections.abc import Sequence

from renderer.engine import longform as lf
from renderer.engine.audio import Mixer, sfx_ding, sfx_pop, sfx_whoosh
from PIL import Image

from renderer.engine.canvas import DISCLAIMER, LONG, Canvas
from renderer.engine.easing import ramp
from renderer.engine.finance import lumpsum_series, sip_series
from renderer.engine.formatting import inr, inr_long, rupees, times
from renderer.engine.video import Video

FORMAT = "long"      # read by renderer.cli.template_format
MIN_SECTION, MAX_SECTION = 12.0, 90.0
MIN_TOTAL, MAX_TOTAL = 300.0, 900.0    # 5–15 minutes; the generator checks the settings range too
# text keys a section of each kind must provide (the schema allows them all; this says which are needed)
REQUIRED_TEXT = {
    "hook": ("heading",),
    "points": ("heading", "items"),
    "number": ("heading", "big", "label"),
    "compare": ("heading", "left_title", "left_value", "right_title", "right_value"),
    "bars": ("heading",),
    "chart": ("heading",),
    "steps": ("heading", "items"),
    "recap": ("heading", "items"),
    "end": ("items", "cta", "channel", "assumption"),
}
NEEDS_SERIES = ("bars", "chart")


def _sip(m: dict) -> dict[str, float]:
    months = m["years"]*12
    final = sip_series(m["monthly"], m["rate_pct"], months)[-1]
    invested = m["monthly"]*months
    return {"invested": invested, "final": final, "gains": final - invested, "ratio": final/invested}


def _lumpsum(m: dict) -> dict[str, float]:
    final = m["amount"]*(1 + m["rate_pct"]/100)**m["years"]
    return {"invested": m["amount"], "final": final, "gains": final - m["amount"], "ratio": final/m["amount"]}


def _fd(m: dict) -> dict[str, float]:
    final = m["amount"]*(1 + m["rate_pct"]/100/4)**(m["years"]*4)
    return {"invested": m["amount"], "final": final, "gains": final - m["amount"], "ratio": final/m["amount"]}


def _inflation(m: dict) -> dict[str, float]:
    real = m["amount"]/(1 + m["rate_pct"]/100)**m["years"]
    return {"invested": m["amount"], "final": real, "gains": m["amount"] - real, "ratio": real/m["amount"]}


def _emi(m: dict) -> dict[str, float]:
    r, n = m["rate_pct"]/100/12, round(m["years"]*12)
    pay = m["amount"]*r*(1 + r)**n/((1 + r)**n - 1)
    return {"invested": m["amount"], "emi": pay, "total_paid": pay*n, "gains": pay*n - m["amount"],
            "final": pay*n, "ratio": pay*n/m["amount"]}


MATHS = {"sip": _sip, "lumpsum": _lumpsum, "fd": _fd, "inflation": _inflation, "emi": _emi}
# which input field carries the money, per kind
AMOUNT_FIELD = {"sip": "monthly", "lumpsum": "amount", "fd": "amount", "inflation": "amount", "emi": "amount"}


def series_for(m: dict) -> list[float]:
    """Year-by-year values for a chart."""
    kind, years, rate = m["kind"], m["years"], m["rate_pct"]
    if kind == "sip":
        monthly = sip_series(m["monthly"], rate, years*12)
        return [monthly[y*12] for y in range(years + 1)]
    if kind == "inflation":
        return [m["amount"]/(1 + rate/100)**y for y in range(years + 1)]
    if kind == "fd":
        return [m["amount"]*(1 + rate/100/4)**(y*4) for y in range(years + 1)]
    return lumpsum_series(m["amount"], rate, years)


class LongExplainer(Video):
    frame_spec = LONG
    tempo = 1.0            # long-form is paced by its script, not sped up like a Short
    thumbnail_time = 6.0

    def __init__(self, script: dict) -> None:
        super().__init__(script)
        self.maths: list[dict] = script["maths"]
        self.sections: list[dict] = script["sections"]
        names = [m["name"] for m in self.maths]
        if len(set(names)) != len(names):
            raise ValueError(f"maths names must be unique: {names}")
        self.by_name = {m["name"]: m for m in self.maths}
        self._check(names)

        placeholders: dict[str, object] = {}
        for m in self.maths:
            out = MATHS[m["kind"]](m)
            n = m["name"]
            placeholders[f"{n}_amount"] = rupees(m[AMOUNT_FIELD[m["kind"]]])
            placeholders[f"{n}_rate"] = f"{m['rate_pct']:g}%"
            placeholders[f"{n}_years"] = m["years"]
            placeholders[f"{n}_final"] = inr(out["final"])
            placeholders[f"{n}_final_long"] = inr_long(out["final"])
            placeholders[f"{n}_invested"] = inr(out["invested"])
            placeholders[f"{n}_gains"] = inr(out["gains"])
            placeholders[f"{n}_ratio"] = times(out["ratio"])
            if m["kind"] == "emi":
                placeholders[f"{n}_emi"] = inr(out["emi"])
                placeholders[f"{n}_total_paid"] = inr(out["total_paid"])
            if m["kind"] == "inflation":
                placeholders[f"{n}_lost_pct"] = f"{(1 - out['ratio'])*100:.0f}%"
        self.values = {m["name"]: MATHS[m["kind"]](m) for m in self.maths}

        self.thumb = script.get("thumbnail") or {}
        flat: dict[str, str] = {f"thumb.{k}": v for k, v in self.thumb.items()}
        for i, sec in enumerate(self.sections, 1):
            for key, raw in sec.get("text", {}).items():
                if isinstance(raw, str):
                    flat[f"s{i}.{key}"] = raw
                else:
                    for j, item in enumerate(raw):
                        flat[f"s{i}.{key}.{j}"] = item
        self.txt = self.fill(flat, placeholders)

        t = 0.0
        self.scenes = []
        for i, sec in enumerate(self.sections, 1):
            secs = float(sec["seconds"])
            if not MIN_SECTION <= secs <= MAX_SECTION:
                raise ValueError(f"section {i} is {secs:g} s; keep each one between {MIN_SECTION:g} and {MAX_SECTION:g} s")
            self.scenes.append((t, t + secs, self._make(i, sec)))
            t += secs
        if not MIN_TOTAL <= t <= MAX_TOTAL:
            raise ValueError(f"the sections add up to {t/60:.1f} min; keep the video between "
                             f"{MIN_TOTAL/60:.0f} and {MAX_TOTAL/60:.0f} minutes")
        self.duration = t
        self.key_times = [s + min(6.0, (e - s)/2) for s, e, _ in self.scenes][:16]
        self.punches = [s + 0.1 for s, _, _ in self.scenes[1:]]

    def _check(self, names: Sequence[str]) -> None:
        """Everything the schema can't express, with a message the writer can act on."""
        for m in self.maths:
            field = AMOUNT_FIELD[m["kind"]]
            if field not in m:
                raise ValueError(f"maths {m['name']!r} is a {m['kind']}, so it needs {field!r}")
            extra = {"monthly", "amount"} - {field}
            if extra & set(m):
                raise ValueError(f"maths {m['name']!r} is a {m['kind']}: use {field!r}, not {', '.join(sorted(extra & set(m)))}")
        if self.sections[-1]["kind"] != "end":
            raise ValueError("the last section must be an 'end' section (it carries the disclaimer)")
        if sum(s["kind"] == "end" for s in self.sections) != 1:
            raise ValueError("exactly one 'end' section, at the end")
        for i, sec in enumerate(self.sections, 1):
            text = sec.get("text", {})
            missing = [k for k in REQUIRED_TEXT[sec["kind"]] if not text.get(k)]
            if missing:
                raise ValueError(f"section {i} ({sec['kind']}) needs text.{', text.'.join(missing)}")
            if sec["kind"] in NEEDS_SERIES:
                if not sec.get("series"):
                    raise ValueError(f"section {i} ({sec['kind']}) needs `series`: one to three maths names")
                unknown = [n for n in sec["series"] if n not in self.by_name]
                if unknown:
                    raise ValueError(f"section {i}: unknown maths name(s) {unknown}; defined: {', '.join(names)}")
            if sec["kind"] == "bars":
                field = sec.get("field", "final")
                bad = [n for n in sec["series"] if field not in MATHS[self.by_name[n]["kind"]](self.by_name[n])]
                if bad:
                    raise ValueError(f"section {i}: {bad} have no {field!r} value (it is only computed for some kinds)")
            if sec["kind"] == "chart":
                flat = [n for n in sec["series"] if self.by_name[n]["kind"] == "emi"]
                if flat:
                    raise ValueError(f"section {i}: {flat} are EMI calculations, which have no year-by-year line; use 'bars'")

    def thumbnail_image(self) -> Image.Image:
        """A designed thumbnail from the script's `thumbnail` block, or the hook's figure."""
        im = self.bg.copy()
        lf.thumbnail(Canvas(im, self.pal, None, self.frame_spec), self.txt.get("thumb.line1", ""),
                     self.txt.get("thumb.line2", ""), self.txt.get("thumb.big", ""), self.style.looks[0])
        return im

    # ---------------- text helpers ----------------

    def line(self, i: int, key: str, default: str = "") -> str:
        return self.txt.get(f"s{i}.{key}", default)

    def items(self, i: int, key: str) -> list[str]:
        out, j = [], 0
        while f"s{i}.{key}.{j}" in self.txt:
            out.append(self.txt[f"s{i}.{key}.{j}"])
            j += 1
        return out

    def figure(self, name: str, field: str = "final") -> str:
        return self.figures.get(f"{name}_{field}", "")

    # ---------------- sections ----------------

    def _make(self, i: int, sec: dict):
        """Build the drawing function for one section; its name is the voiceover scene name."""
        kind = sec["kind"]
        chapter = sec.get("chapter", "")
        total = len(self.sections)

        def draw(c: Canvas, t: float, A: float) -> None:
            if kind != "end":
                lf.heading(c, self.line(i, "heading"), t, A, self.line(i, "sub") or None)
            getattr(self, f"_{kind}")(c, t, A, i, sec)
            if kind != "end":
                lf.chapter_strip(c, chapter, i, total, ramp(t, 0.6, 0.5)*A)

        draw.__name__ = f"s{i}"
        return draw

    def _hook(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        if not self.line(i, "sub"):
            lf.rule(c, 252, t, A)
        big = self.line(i, "big")
        if big:
            lf.big_number(c, big, self.line(i, "label"), t, A, 0.8, note=self.line(i, "note") or None)
        else:
            lf.bullets(c, self.items(i, "items"), t, A, y0=lf.TOP + 150, size=58)

    def _points(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        lf.bullets(c, self.items(i, "items"), t, A)

    def _number(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        lf.big_number(c, self.line(i, "big"), self.line(i, "label"), t, A,
                      note=self.line(i, "note") or None, color=c.pal.cast[0])

    def _compare(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        left = {"title": self.line(i, "left_title"), "value": self.line(i, "left_value"),
                "lines": self.items(i, "left_lines")}
        right = {"title": self.line(i, "right_title"), "value": self.line(i, "right_value"),
                 "lines": self.items(i, "right_lines")}
        lf.columns(c, left, right, t, A)
        if verdict := self.line(i, "verdict"):
            c.text(verdict, c.w/2, lf.BOTTOM - 10, 52, c.pal.accent, ramp(t, 2.6, 0.4)*A,
                   "SemiBold", max_w=lf.CONTENT_W)

    def _bars(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        field = sec.get("field", "final")
        items = [(self.line(i, f"labels.{j}") or n, self.values[n][field], self.figure(n, field))
                 for j, n in enumerate(sec["series"])]
        lf.bars(c, items, t, A)

    def _chart(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        series = [(self.line(i, f"labels.{j}") or n, series_for(self.by_name[n]), c.pal.cast[j % 3])
                  for j, n in enumerate(sec["series"])]
        lf.line_chart(c, series, t, A, x_label=self.line(i, "x_label"))

    def _steps(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        lf.steps(c, self.items(i, "items"), t, A)

    def _recap(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        lf.takeaways(c, self.items(i, "items"), t, A)

    def _end(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        lf.end_card(c, t, A, self.items(i, "items"), self.line(i, "cta"), self.line(i, "channel"),
                    self.line(i, "assumption"), DISCLAIMER, self.style.looks[0])

    # ---------------- audio ----------------

    def audio(self) -> Mixer:
        mx = self.mixer()
        r, place = mx.rng, mx.place
        place(sfx_pop(1.0), 0.4, 0.5)
        for n, (s, _, _) in enumerate(self.scenes):
            if n:
                place(sfx_whoosh(r, 0.5), s - 0.2, 0.5)
            kind = self.sections[n]["kind"]
            if kind in ("hook", "number"):
                place(sfx_ding(1568, 1.1), s + 1.0, 0.45)
            elif kind in ("points", "steps", "recap"):
                for j in range(len(self.items(n + 1, "items"))):
                    place(sfx_pop(1.0 + j*0.08), s + 0.6 + j*(1.0 if kind != "points" else 0.9), 0.4)
            elif kind == "compare":
                place(sfx_pop(1.0), s + 0.5, 0.45)
                place(sfx_pop(1.15), s + 0.9, 0.45)
        place(sfx_ding(1760, 1.4), self.scenes[-1][0] + 1.2, 0.5)
        return mx


def build(script: dict) -> LongExplainer:
    return LongExplainer(script)
