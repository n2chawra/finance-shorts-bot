"""Variety rules. YouTube demonetises repetitive, mass-produced content, so these are enforced in
code against history, not just asked for in a prompt.

`check_plan` returns a list of violations; an empty list means the plan may go ahead.
"""
import math
import random
import re
from collections import Counter
from datetime import datetime, timedelta

from renderer.engine.music_constants import BPM_RANGE, GENRES, KEYS
from renderer.engine.style import PALETTES

from .history import now as utc_now

HOOK_STYLES = ("question", "shock_number", "myth", "challenge", "conflict", "secret")
CATEGORY_WINDOW = 3          # same topic category not in the last 3 videos
SHARE_WINDOW = 20            # template share is measured over the last 20 videos
DUPLICATE_DAYS = 60          # near-duplicate topics not within 60 days
DUPLICATE_SIMILARITY = 0.6   # word-overlap cosine; stand-in for embedding cosine > 0.85 until M4
OPENING_WINDOW = 20          # titles/descriptions must not reuse an opening from the last 20
OPENING_WORDS = 3

_STOP = frozenset("a an and are as at be by do does for from how in is it its of on or that the this to vs what "
                  "when which who why will with you your really much many".split())

# What story a video tells. The category (sip, retirement, spending…) says which money it is about;
# the story says what happens to that money. Up to 2026-10-17, 8 of 11 Shorts told one story —
# "what ₹X becomes in N years" — in different categories, which the category rule could not see.
STORIES = ("future_value", "early_vs_late", "cost_of_habit", "decision_duel", "myth_bust", "how_it_works",
           "trap_alert", "rule_change", "case_study", "checklist", "psychology", "history",
           # the formats with proven demand (improvement/research/formats.json; owner reset, 2026-10-21)
           "rich_vs_poor", "secret_of_rich", "how_they_make_money", "salary_breakdown", "which_one_are_you",
           "guess_the_number", "list_explained", "once_you_understand",
           # global formats anyone in the world relates to (owner, 2026-10-23)
           "billionaire_question", "money_scale")
PROJECTION = ("future_value", "early_vs_late", "cost_of_habit")   # the "₹X becomes ₹Y in N years" family
STORY_WINDOW = 1          # a winning format may come back after one other (owner reset, 2026-10-21; was 3)
# Projection stories may be at most this share of the last 20. 0.5 while three of the four evergreen
# Lowered from 0.5 when Shorts moved to Remotion story recipes, which can tell any story.
PROJECTION_SHARE = 0.35   # 0.25 until the reset: our best Short so far is a habit-cost one
SHAPE_WINDOW = 3          # proven title shapes may come back ("Rich vs Poor: …"); was 10 until the reset
# The stories the first engine's templates could tell. Only for reading old history entries that
# have no `story`; the story templates (short_story, long_story) can tell any story.
TEMPLATE_STORIES = {
    "quiz_countdown": ("future_value",), "two_friends_race": ("early_vs_late",),
    "money_leak_meter": ("cost_of_habit",), "myth_vs_fact": ("myth_bust", "decision_duel"),
    "money_news": ("rule_change",),
}
# words that make a title's shape: the question and the frame around the numbers, not its subject
_FRAME = frozenset("what how why when is are does do can should will become cost worth turn into grow over in year "
                   "vs versus if really much more less than".split())
_NUMBER = re.compile(r"₹?\s?\d[\d,.]*\s*(?:%|lakh|lakhs|crore|crores|cr|l|k)?\b|\b(?:one|two|three|four|five|six|seven|"
                     r"eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|hundred|thousand)\b", re.I)


def rotation_size(enabled: list[str]) -> int:
    return len(enabled)


def template_window(n_enabled: int) -> int:
    """How many recent videos a template must sit out. 6 needs eight templates; with fewer it
    scales down (four templates → 2) so the rule can be met."""
    return max(0, min(6, n_enabled - 2))   # 0 with one or two templates: the rule cannot be met otherwise


def share_limit(n_enabled: int) -> float:
    """Largest share of the last 20 videos one template may hold (30%, looser below five templates)."""
    return max(0.30, 1.5/n_enabled)


def _tokens(text: str) -> list[str]:
    words = [w for w in re.findall(r"[a-z]+", text.lower()) if w not in _STOP]
    words = [w[:-1] if len(w) > 3 and w.endswith("s") else w for w in words]
    return words + [f"{a} {b}" for a, b in zip(words, words[1:])]


def similarity(a: str, b: str) -> float:
    """Cosine similarity of the two texts' words and word pairs, 0–1."""
    ca, cb = Counter(_tokens(a)), Counter(_tokens(b))
    if not ca or not cb:
        return 0.0
    dot = sum(ca[t]*cb[t] for t in ca)
    return dot/math.sqrt(sum(v*v for v in ca.values())*sum(v*v for v in cb.values()))


def opening(text: str) -> str:
    """First few words, lower-cased, punctuation dropped."""
    return " ".join(re.findall(r"[a-z0-9₹%]+", text.lower())[:OPENING_WORDS])


def latest(history: list[dict], n: int) -> list[dict]:
    """The last `n` entries; none when n is 0 (`history[-0:]` would be the whole history)."""
    return history[-n:] if n > 0 else []


def allowed_templates(history: list[dict], enabled: list[str]) -> list[str]:
    """Enabled templates that pass both template rules right now."""
    n = rotation_size(enabled)
    recent = [e["template"] for e in latest(history, template_window(n))]
    others = [e["template"] for e in history[-(SHARE_WINDOW - 1):]]      # the new video makes it 20
    most = math.floor(share_limit(n)*SHARE_WINDOW)
    return [t for t in enabled if t not in recent and others.count(t) + 1 <= most]


def blocked_categories(history: list[dict]) -> list[str]:
    return sorted({e["topic"]["category"] for e in history[-CATEGORY_WINDOW:]})


def story_of(e: dict) -> str | None:
    """The story a history entry told. Entries from before stories were recorded get the only story
    their template could tell; ones whose template could tell several are unknown."""
    if e.get("story"):
        return e["story"]
    told = TEMPLATE_STORIES.get(e.get("template", ""), ())
    return told[0] if len(told) == 1 else None


def stories_for(template: str) -> tuple[str, ...]:
    return TEMPLATE_STORIES.get(template, STORIES)


def story_problems(story: str, history: list[dict]) -> list[str]:
    """Why this story can't be told next (empty when it can)."""
    if story not in STORIES:
        return [f"story must be one of {', '.join(STORIES)}"]
    out = []
    if story in [story_of(e) for e in history[-STORY_WINDOW:]]:
        out.append(f"story {story!r} was told in the last {STORY_WINDOW} videos")
    if story in PROJECTION:
        others = [story_of(e) for e in history[-(SHARE_WINDOW - 1):]]
        most = math.floor(PROJECTION_SHARE*SHARE_WINDOW)
        if sum(s in PROJECTION for s in others) + 1 > most:
            out.append(f"projection stories ({', '.join(PROJECTION)}) would be more than {PROJECTION_SHARE:.0%} of the "
                       f"last {SHARE_WINDOW} videos; tell a different kind of story")
    return out


def allowed_stories(history: list[dict], templates: list[str]) -> dict[str, list[str]]:
    """For each template, the stories it could tell next without breaking a story rule."""
    return {t: [s for s in stories_for(t) if not story_problems(s, history)] for t in templates}


def title_shape(text: str) -> str:
    """A title with its subject and numbers removed, leaving the frame around them: "What a ₹5,000
    SIP becomes in 25 years" and "What ₹8,000 a month for retirement becomes in 30 years" are both
    "what become in year"."""
    words = re.findall(r"[a-z]+", _NUMBER.sub(" ", text.lower()))
    words = [w[:-1] if w in ("becomes", "costs", "turns", "grows", "years") else w for w in words]
    return " ".join(w for w in words if w in _FRAME)


def shape_problems(plan: dict, history: list[dict]) -> list[str]:
    """A title (YouTube or topic) whose shape a recent video already used. Shapes of fewer than three
    frame words ("why", "how much") are too generic to judge."""
    out = []
    for field, get in (("title", lambda e: e["title"]), ("topic title", lambda e: e["topic"]["title"])):
        mine = title_shape(get(plan))
        if len(mine.split()) < 3:
            continue
        for e in reversed(history[-SHAPE_WINDOW:]):
            if title_shape(get(e)) == mine:
                out.append(f"{field} has the same shape as {e['id']} ({get(e)!r} → {mine!r}); frame it differently")
                break
    return out


def check_plan(plan: dict, history: list[dict], enabled: list[str], at: datetime | None = None) -> list[str]:
    """Every variety rule the plan breaks."""
    at = at or utc_now()
    out: list[str] = []
    last = history[-1] if history else None

    template = plan["template"]
    if template not in enabled:
        out.append(f"template {template!r} is not an enabled template")
    elif template not in allowed_templates(history, enabled):
        window = template_window(rotation_size(enabled))
        if template in [e["template"] for e in latest(history, window)]:
            out.append(f"template {template!r} was used in the last {window} videos")
        else:
            out.append(f"template {template!r} would exceed {share_limit(rotation_size(enabled)):.0%} of the last {SHARE_WINDOW} videos")

    category = plan["topic"]["category"]
    if category in blocked_categories(history):
        out.append(f"topic category {category!r} was used in the last {CATEGORY_WINDOW} videos")

    story = plan.get("story")
    if not story:
        out.append(f"plan needs a story: one of {', '.join(stories_for(template))}")
    else:
        out += story_problems(story, history)
        if story in STORIES and story not in stories_for(template):
            out.append(f"template {template!r} can't tell a {story!r} story; it tells {', '.join(stories_for(template))}")
    out += shape_problems(plan, history)

    cutoff = (at - timedelta(days=DUPLICATE_DAYS)).isoformat()
    for e in history:
        if e["created_at"] >= cutoff:
            s = similarity(plan["topic"]["title"], e["topic"]["title"])
            if s > DUPLICATE_SIMILARITY:
                out.append(f"topic is too close to {e['id']} ({e['topic']['title']!r}, similarity {s:.2f}) within {DUPLICATE_DAYS} days")

    if plan["hook_style"] not in HOOK_STYLES:
        out.append(f"hook_style must be one of {', '.join(HOOK_STYLES)}")
    style = plan["style"]
    if style.get("palette") not in PALETTES:
        out.append(f"style.palette must be one of {', '.join(sorted(PALETTES))}")
    if style.get("genre") not in GENRES:
        out.append(f"style.genre must be one of {', '.join(GENRES)}")
    elif not BPM_RANGE[style["genre"]][0] <= style.get("bpm", 0) <= BPM_RANGE[style["genre"]][1]:
        lo, hi = BPM_RANGE[style["genre"]]
        out.append(f"style.bpm must be {lo}–{hi} for {style['genre']}")
    if style.get("key") not in KEYS:
        out.append(f"style.key must be one of {', '.join(KEYS)}")

    if last:
        if style.get("palette") == last["style"]["palette"]:
            out.append(f"palette {style.get('palette')!r} was used by the previous video")
        if style.get("genre") == last["style"]["genre"]:
            out.append(f"music genre {style.get('genre')!r} was used by the previous video")
        if (style.get("key"), style.get("bpm")) == (last["style"]["key"], last["style"]["bpm"]):
            out.append("music key and tempo are identical to the previous video")
        if plan["hook_style"] == last["hook_style"]:
            out.append(f"hook style {plan['hook_style']!r} was used by the previous video")
        if opening(plan["cta"]) == opening(last["cta"]):
            out.append("end CTA opens the same way as the previous video's")

    for field in ("title", "description"):
        mine = opening(plan[field])
        for e in history[-OPENING_WINDOW:]:
            if mine and mine == opening(e[field]):
                out.append(f"{field} opens with {mine!r}, already used by {e['id']}")
                break
    return out


def suggest_style(history: list[dict], seed: int) -> dict:
    """A palette, genre, key and tempo that pass the rotation rules, picked from the seed."""
    r = random.Random(f"suggest:{seed}")
    last = history[-1]["style"] if history else {}
    recent_palettes = [e["style"]["palette"] for e in history[-2:]]
    palette = r.choice([p for p in sorted(PALETTES) if p not in recent_palettes])
    genre = r.choice([g for g in GENRES if g != last.get("genre")])
    lo, hi = BPM_RANGE[genre]
    return {"palette": palette, "genre": genre, "key": r.choice([k for k in KEYS if k != last.get("key")]), "bpm": r.randint(lo, hi)}
