"""long_explainer: a character-led landscape explainer, 3–15 minutes.

The script lists `maths` (named calculations) and `sections` (what *happens*, in order). Every
figure on screen is computed here from the script's inputs, exactly as in the Shorts templates;
section text may only refer to figures through `{placeholders}`.

The thing that makes this not a slideshow: a section is a **verb**, not a layout. `drain` leaks
coins out of the hero's wallet for its whole length while a counter climbs; `pile` stacks them one
at a time; `grow` grows a tree; `chart` draws itself in front of the viewer. The same hero — same
colour, same face — is in every scene, so the video is one continuous story rather than a deck.

Sections are named `s1`, `s2`, … for the voiceover, so the layout checks, camera, music, ducking
and narration windows all work unchanged.
"""
import math
from collections.abc import Sequence

from PIL import Image

from renderer.engine import longform as lf
from renderer.engine.actor import actor, gait_for, hand
from renderer.engine.audio import Mixer, sfx_ding, sfx_pop, sfx_whoosh
from renderer.engine.canvas import DISCLAIMER, LONG, Canvas
from renderer.engine.easing import clamp, ease, ramp
from renderer.engine.finance import lumpsum_series, sip_series
from renderer.engine.formatting import inr, inr_long, rupees, times
from renderer.engine.motion import bezier, breathe, spring, stagger
from renderer.engine.video import Video

FORMAT = "long"      # read by renderer.cli.template_format
MIN_SECTION, MAX_SECTION = 10.0, 75.0
MIN_TOTAL, MAX_TOTAL = 150.0, 900.0    # 2.5–15 minutes; the generator checks the settings too

# text keys a section of each kind must provide (the schema allows them all; this says which are
# needed). Deliberately short: on-screen words are a last resort, the action carries the meaning.
REQUIRED_TEXT = {
    "hook": ("heading",),
    "beat": ("heading",),
    "drain": ("heading", "label"),
    "pile": ("heading", "label"),
    "grow": ("heading", "label"),
    "compare": ("heading", "left_title", "right_title"),
    "chart": ("heading",),
    "steps": ("heading", "items"),
    "end": ("cta", "channel", "assumption"),
}
NEEDS_ONE = ("drain", "pile", "grow")      # one maths name, in `maths`
NEEDS_SERIES = ("compare", "chart")        # several, in `series`
KINDS = tuple(REQUIRED_TEXT)


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
    thumbnail_time = 5.0
    push_seconds = None    # keep pushing for the whole scene, however long it is
    push_amount = 0.055
    drift_px = 16.0

    def __init__(self, script: dict) -> None:
        super().__init__(script)
        self.maths: list[dict] = script["maths"]
        self.sections: list[dict] = script["sections"]
        names = [m["name"] for m in self.maths]
        if len(set(names)) != len(names):
            raise ValueError(f"maths names must be unique: {names}")
        self.by_name = {m["name"]: m for m in self.maths}
        self._check_maths()          # before computing: a missing input must read as a message
        self.values = {m["name"]: MATHS[m["kind"]](m) for m in self.maths}
        self._check_sections(names)

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

        # One hero, in every scene. Continuity of character is what makes it a story.
        self.hero = self.pal.cast[0]
        self.look = self.style.looks[0]

        t = 0.0
        self.scenes = []
        for i, sec in enumerate(self.sections, 1):
            secs = float(sec["seconds"])
            if not MIN_SECTION <= secs <= MAX_SECTION:
                raise ValueError(f"section {i} is {secs:g} s; keep each one between "
                                 f"{MIN_SECTION:g} and {MAX_SECTION:g} s")
            self.scenes.append((t, t + secs, self._make(i, sec)))
            t += secs
        if not MIN_TOTAL <= t <= MAX_TOTAL:
            raise ValueError(f"the sections add up to {t/60:.1f} min; keep the video between "
                             f"{MIN_TOTAL/60:.1f} and {MAX_TOTAL/60:.0f} minutes")
        self.duration = t
        # sample each scene three-quarters through, where its action has landed; sampling at
        # six seconds showed QA half-built scenes and told it nothing about the finished shot
        self.key_times = [s + (e - s)*0.75 for s, e, _ in self.scenes][:16]
        self.punches = [s + 0.1 for s, _, _ in self.scenes[1:]]
        self.impacts = [s + self._reveal(sec) for (s, _, _), sec in zip(self.scenes, self.sections)
                        if sec["kind"] in ("pile", "grow", "compare")]

    # ---------------- validation ----------------

    def _check_maths(self) -> None:
        """The calculation inputs, before anything is computed from them."""
        for m in self.maths:
            field = AMOUNT_FIELD[m["kind"]]
            if field not in m:
                raise ValueError(f"maths {m['name']!r} is a {m['kind']}, so it needs {field!r}")
            extra = {"monthly", "amount"} - {field}
            if extra & set(m):
                raise ValueError(f"maths {m['name']!r} is a {m['kind']}: use {field!r}, not "
                                 f"{', '.join(sorted(extra & set(m)))}")

    def _check_sections(self, names: Sequence[str]) -> None:
        """Everything else the schema can't express, with a message the writer can act on."""
        if self.sections[-1]["kind"] != "end":
            raise ValueError("the last section must be an 'end' section (it carries the disclaimer)")
        if sum(s["kind"] == "end" for s in self.sections) != 1:
            raise ValueError("exactly one 'end' section, at the end")
        for i, sec in enumerate(self.sections, 1):
            kind = sec["kind"]
            text = sec.get("text", {})
            missing = [k for k in REQUIRED_TEXT[kind] if not text.get(k)]
            if missing:
                raise ValueError(f"section {i} ({kind}) needs text.{', text.'.join(missing)}")
            if kind in NEEDS_ONE:
                name = sec.get("maths")
                if name not in self.by_name:
                    raise ValueError(f"section {i} ({kind}): unknown maths name {name!r}; "
                                     f"defined: {', '.join(names)}")
                if sec.get("field", "final") not in self.values[name]:
                    raise ValueError(f"section {i}: {name!r} has no {sec['field']!r} value")
            if kind in NEEDS_SERIES:
                picked = [self.ref(e, sec.get("field", "final")) for e in sec.get("series") or []]
                unknown = [n for n, _ in picked if n not in self.by_name]
                if unknown:
                    raise ValueError(f"section {i}: unknown maths name(s) {unknown}; "
                                     f"defined: {', '.join(names)}")
                if len(picked) < 2:
                    raise ValueError(f"section {i} ({kind}) needs `series`: two or three of "
                                     f"{', '.join(names)}")
                bad = [f"{n}.{f}" for n, f in picked if f not in self.values[n]]
                if bad:
                    raise ValueError(f"section {i}: no such computed value(s) {bad}")
                if kind == "chart":
                    flat = [n for n, _ in picked if self.by_name[n]["kind"] == "emi"]
                    if flat:
                        raise ValueError(f"section {i}: {flat} are EMI calculations with no "
                                         f"year-by-year line; use 'compare'")
            if kind == "steps" and not 2 <= len(self.items(i, "items", text)) <= 4:
                raise ValueError(f"section {i} (steps) needs two to four `items`")

    def thumbnail_image(self) -> Image.Image:
        """A designed thumbnail: the hero, the one number, and two short lines."""
        im = self.bg.copy()
        c = Canvas(im, self.pal, None, self.frame_spec)
        lf.backdrop(c, 1.6, seed=self.seed)
        actor(c, 1480, lf.GROUND, 1.7, self.hero, t=1.1, pose="point", mood="wow", facing=-1,
              look=self.look)
        lf.still_text(c, self.txt.get("thumb.line1", ""), 120, 300, 96, self.pal.text, 1.0,
                      weight="Bold", max_w=1080, max_lines=2, anchor="lm")
        lf.still_text(c, self.txt.get("thumb.big", ""), 120, 520, 150, self.pal.accent, 1.0,
                      weight="Bold", max_w=1080, max_lines=1, anchor="lm")
        lf.still_text(c, self.txt.get("thumb.line2", ""), 120, 660, 64, self.pal.muted, 1.0,
                      weight="Medium", max_w=1080, max_lines=1, anchor="lm")
        return im

    # ---------------- text helpers ----------------

    def line(self, i: int, key: str, default: str = "") -> str:
        return self.txt.get(f"s{i}.{key}", default)

    def items(self, i: int, key: str, raw: dict | None = None) -> list[str]:
        if raw is not None:                       # during validation, before self.txt is indexed
            got = raw.get(key) or []
            return list(got) if not isinstance(got, str) else [got]
        out, j = [], 0
        while f"s{i}.{key}.{j}" in self.txt:
            out.append(self.txt[f"s{i}.{key}.{j}"])
            j += 1
        return out

    def figure(self, name: str, field: str = "final") -> str:
        return self.figures.get(f"{name}_{field}", "")

    @staticmethod
    def ref(entry: str, default: str = "final") -> tuple[str, str]:
        """A `series` entry: "habit" is its final value, "habit.invested" names another field.
        Two sides of the same calculation are the most common comparison there is."""
        name, _, field = entry.partition(".")
        return name, field or default

    def amount(self, sec: dict) -> tuple[float, str]:
        """(target value, how it will be displayed) for a single-maths section."""
        name, field = sec["maths"], sec.get("field", "final")
        return self.values[name][field], self.figure(name, field)

    @staticmethod
    def _reveal(sec: dict) -> float:
        """When the section's number lands — the climb takes most of the scene, then it holds."""
        return float(sec["seconds"])*0.72

    def count(self, sec: dict, t: float) -> tuple[str, float]:
        """The counter's text at time t, and how far through the climb we are.

        It counts the *computed* value up, so the final frame reads exactly the figure the number
        check recomputes. A number that arrives already finished has nothing to watch.
        """
        value, shown = self.amount(sec)
        p = ease(clamp((t - 1.0)/max(0.1, self._reveal(sec) - 1.0)))
        return (shown if p >= 1 else inr(value*p)), p

    # ---------------- sections ----------------

    def _make(self, i: int, sec: dict):
        """Build the drawing function for one section; its name is the voiceover scene name."""
        kind = sec["kind"]

        def draw(c: Canvas, t: float, A: float) -> None:
            lf.backdrop(c, t, A, seed=self.seed + i, hills=kind != "chart")
            getattr(self, f"_{kind}")(c, t, A, i, sec)
            if kind != "end":
                lf.headline(c, self.line(i, "heading"), t, A, self.line(i, "sub") or None)

        draw.__name__ = f"s{i}"
        return draw

    def _hero(self, c: Canvas, t: float, A: float, x: float, *, s: float = lf.ACTOR_S,
              **kw) -> None:
        actor(c, x, lf.GROUND, s, self.hero, A, t, look=self.look, **kw)

    def _hook(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """The hero crosses the whole frame, left to right, for the whole scene.

        Not "walks in and stops": a hero who arrives and then stands there leaves the opening
        shot frozen, and the opening shot is the one that decides whether anyone keeps watching.
        """
        dur = float(sec["seconds"])
        dx = ease(clamp(t/(dur - 0.5)))*1240
        self._hero(c, t, A, 240 + dx, pose="walk", mood=sec.get("mood", "neutral"),
                   gait=gait_for(dx, lf.ACTOR_S))
        if big := self.line(i, "big"):
            lf.counter(c, big, 1420, 420, A*ramp(t, 2.0, 0.5), label=self.line(i, "label"),
                       t=t, burst=True)

    def _beat(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """One idea, the hero reacting to it. The stage keeps moving; nothing else is needed."""
        pace = math.sin(t*0.42)
        x = 560 + pace*170
        turning = abs(math.cos(t*0.42)) < 0.25
        self._hero(c, t, A, x, pose=sec.get("pose") or ("stand" if turning else "walk"),
                   mood=sec.get("mood", "worried"), facing=1 if math.cos(t*0.42) > 0 else -1,
                   gait=gait_for(x, lf.ACTOR_S))
        if note := self.line(i, "note"):
            lf.still_text(c, note, 1280, 540, 56, c.pal.text, t, 0.6, "SemiBold", 740, 3, A=A)

    def _drain(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """Money leaving, for the whole scene: coins out of the wallet, a counter climbing."""
        x = 520
        self._hero(c, t, A, x, pose="carry", mood=sec.get("mood", "neutral"))
        hx, hy = hand(x, lf.GROUND, lf.ACTOR_S, "carry", t)
        lf.wallet(c, hx, hy, lf.ACTOR_S*0.9, A, 1.0)
        lf.falling_coins(c, hx, hy + 50, t, A, n=6, period=1.25, seed=self.seed + i, fall=300)
        shown, _ = self.count(sec, t)
        lf.counter(c, shown, 1340, 500, A*ramp(t, 0.8, 0.4), label=self.line(i, "label"),
                   color=c.pal.danger, t=t)
        if foot := self.line(i, "foot"):
            lf.label_under(c, foot, 1340, t, 1.4, A)

    def _pile(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """The same money as a stack that grows past the hero's head, one coin at a time."""
        shown, p = self.count(sec, t)
        coins = int(sec.get("coins", 26))
        top = lf.coin_stack(c, 1180, lf.GROUND - 8, p*coins, A, t)
        if p >= 1:    # the habit did not stop when the counter did
            lf.falling_coins(c, 1210, top - 230, t, A*0.9, n=2, period=1.6, spread=120,
                             fall=200, seed=self.seed + i, r=26)
        self._hero(c, t, A, 560, pose="point" if p > 0.25 else "stand",
                   mood="wow" if p > 0.5 else "neutral")
        lf.counter(c, shown, 1330, min(top - 110, 470), A*ramp(t, 0.8, 0.4),
                   label=self.line(i, "label"), t=t, burst=p >= 1)

    def _grow(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """The same money invested: a tree growing while the sun crosses the sky."""
        shown, p = self.count(sec, t)
        lf.sun_arc(c, p, A, x=1280)
        top = lf.plant(c, 1300, lf.GROUND, p, lf.foliage(c), A, t)
        self._hero(c, t, A, 560, pose="cheer" if p > 0.8 else "stand",
                   mood="proud" if p > 0.8 else "happy")
        lf.counter(c, shown, 1300, min(top - 110, 430), A*ramp(t, 0.8, 0.4),
                   label=self.line(i, "label"), t=t, burst=p >= 1)

    def _compare(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """Both outcomes in one frame, rising together. A comparison across a cut is not one."""
        titles = (self.line(i, "left_title"), self.line(i, "right_title"))
        cols = (c.pal.danger, c.pal.cast[1])
        refs = [self.ref(e, sec.get("field", "final")) for e in sec["series"]]
        items = [(titles[j] if j < 2 else n, self.values[n][f], self.figure(n, f), cols[j % 2])
                 for j, (n, f) in enumerate(refs)]
        p = ease(clamp((t - 0.8)/max(1.0, self._reveal(sec))))
        tops = lf.towers(c, items, p, A, t, fmt=lambda v, g: inr(v*g))
        for j, top in enumerate(tops):    # coins keep raining in, during the climb and after it
            lf.falling_coins(c, lf.tower_x(c, j, len(tops)), top - 300, t, A*0.8, n=2,
                             period=1.5 + j*0.25, spread=130, fall=250, seed=self.seed + i + j,
                             r=24)

    def _chart(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """Drawn in front of the viewer, with the hero watching it happen."""
        series = [(self.line(i, f"labels.{j}") or n, series_for(self.by_name[n]),
                   (c.pal.danger, c.pal.cast[1], c.pal.cast[2])[j % 3])
                  for j, (n, _) in enumerate(self.ref(e) for e in sec["series"])]
        lf.built_chart(c, series, clamp((t - 0.8)/max(1.0, self._reveal(sec))), A, t,
                       x0=620, x1=1480, y0=330, y1=860)
        self._hero(c, t, A, 300, s=1.05, pose="think", mood="wow")

    def _steps(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """The hero walks the steps: one marker lands at each stop, in order."""
        items = self.items(i, "items")
        n = len(items)
        span = 1500.0/n
        dwell = (float(sec["seconds"]) - 1.5)/n
        at = clamp((t - 0.8)/dwell, 0, n - 1 + 0.999)
        x = 300 + span*at
        self._hero(c, t, A, x, s=1.15, pose="walk" if at % 1 < 0.72 else "stand",
                   mood="happy", gait=gait_for(span*at, 1.15))
        for j, s in enumerate(items):
            p = bezier(stagger(j, t, 0.8, dwell, 0.6))
            if p <= 0.01:
                continue
            mx = 300 + span*j
            r = 26*spring(p, 0.5)
            c.d.ellipse([mx - r, lf.GROUND - 14 - r, mx + r, lf.GROUND - 14 + r],
                        fill=c.mix(c.pal.accent, A*p))
            lf.label_under(c, s, mx, t, 0.8 + j*dwell, A*p)

    def _end(self, c: Canvas, t: float, A: float, i: int, sec: dict) -> None:
        """Hero celebrates on the right; the ask and the disclaimer sit still on the left."""
        self._hero(c, t, A, 1560, s=1.5, pose="cheer", mood="happy", facing=-1)
        lf.still_text(c, self.line(i, "cta"), 620, 330, 86, c.pal.text, t, 0.3, "Bold", 1060, 2, A=A)
        lf.still_text(c, self.line(i, "channel"), 620, 480, 54, c.pal.accent, t, 0.7, "SemiBold",
                      1060, 1, A=A)
        lf.still_text(c, self.line(i, "assumption"), 620, 620, 38, c.pal.muted, t, 1.1, "Regular",
                      1060, 2, A=A)
        lf.still_text(c, DISCLAIMER, 620, 730, 38, c.pal.muted, t, 1.4, "Regular", 1060, 1, A=A)

    # ---------------- audio ----------------

    def audio(self) -> Mixer:
        mx = self.mixer()
        r, place = mx.rng, mx.place
        place(sfx_pop(1.0), 0.4, 0.5)
        for n, (s, e, _) in enumerate(self.scenes):
            sec = self.sections[n]
            kind = sec["kind"]
            if n:
                place(sfx_whoosh(r, 0.5), s - 0.2, 0.5)
            reveal = self._reveal(sec)
            if kind == "drain":                       # a coin leaving, on the loop's period
                for k in range(int((e - s)/1.25)):
                    place(sfx_pop(0.8 + (k % 3)*0.05), s + 0.6 + k*1.25, 0.3)
            elif kind == "pile":                      # a coin landing, slowing as the climb eases
                coins = int(sec.get("coins", 26))
                for k in range(0, coins, max(1, coins//12)):
                    u = k/coins
                    place(sfx_pop(1.0 + u*0.5), s + 1.0 + math.sqrt(u)*(reveal - 1.0), 0.35)
            elif kind == "steps":
                dwell = (e - s - 1.5)/max(1, len(self.items(n + 1, "items")))
                for j in range(len(self.items(n + 1, "items"))):
                    place(sfx_ding(1318, 0.8), s + 0.8 + j*dwell, 0.4)
            elif kind == "compare":
                place(sfx_pop(1.0), s + 1.0, 0.45)
                place(sfx_pop(1.15), s + 1.3, 0.45)
            if kind in ("pile", "grow", "compare", "hook"):
                place(sfx_ding(1568, 1.2), s + reveal, 0.5)
        place(sfx_ding(1760, 1.4), self.scenes[-1][0] + 1.2, 0.5)
        return mx


def build(script: dict) -> LongExplainer:
    return LongExplainer(script)
