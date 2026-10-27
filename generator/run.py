"""Code steps of a generation run. The agent steps (planner, writer, fact review, QA review) are
done by the Claude session following generator/prompts/*.md; this tool does everything else and
records every step in videos/<id>/run.json.

    python -m generator.run state [--format long]         what to do this run, and what the planner may pick
    python -m generator.run check-plan <id>               variety rules on videos/<id>/plan.json
    python -m generator.run number-check <id>             number check on videos/<id>/script.json
    python -m generator.run figures <id>                  every computed figure and on-screen line (for reviewers)
    python -m generator.run record <id> <agent> --passed|--failed --note "..."
    python -m generator.run render <id> [--preview]       video.mp4, thumbnail.png, preview.png, render.json
    python -m generator.run ship <id> [--commit] [--push] [--media-branch | --release]
    python -m generator.run media <id>                    push the mp4 as branch media/<id> (retry)
    python -m generator.run release <id> [--commit] [--push]   upload a video shipped without --release
    python -m generator.run fail <id> --reason "..."
    python -m generator.run template-work <template> <action> [--enabled]

Exit code 0 means the step passed; 1 means it failed and the reasons are printed.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from renderer import craft, remotion, thumbs
from renderer.engine.formatting import CURRENCIES
from renderer.timeline.build import CAST_VOICES, NARRATOR_VOICES, check_script, event_gaps

from . import experiments, formats, history, reach, story, topics, variety
from .numbers import number_check
from .settings import ROOT, load as load_settings

CHECKERS = ("number_check", "fact_review", "qa_review")
MIN_VOICE_FILL = 0.55   # a long section left more than ~half silent is a thin script
TEMPLATES = {"long_story": "long", "short_story": "short"}   # every template, with its format; drawn by Remotion
TREND_EXTRA_PER_DAY = 1  # extra Shorts a day for a breaking or trending topic, past the daily target
AGENTS = ("planner", "writer", *CHECKERS, "render", "ship")
PLAN_KEYS = ("template", "topic", "story", "hook_style", "cta", "title", "description", "hashtags", "seed", "style")


def _dir(vid: str, root: Path) -> Path:
    return root / "videos" / vid


def _read_script(vid: str, root: Path = ROOT) -> dict:
    f = root / "videos" / vid / "script.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.is_file() else {}


def _read(path: Path) -> dict:
    if not path.is_file():
        raise ValueError(f"{path.relative_to(path.parents[2])} does not exist")
    return json.loads(path.read_text(encoding="utf-8"))


def _write(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


def log_step(vid: str, agent: str, passed: bool, notes: list[str], root: Path = ROOT, started: str | None = None) -> None:
    """Append one AgentRun entry to videos/<id>/run.json."""
    path = _dir(vid, root) / "run.json"
    steps = json.loads(path.read_text(encoding="utf-8")) if path.is_file() else []
    at = history.now().isoformat()
    steps.append({"agent": agent, "status": "ok" if passed else "failed", "startedAt": started or at, "finishedAt": at, "notes": notes})
    _write(path, steps)


def enabled_templates(settings: dict, fmt: str | None = None, root: Path = ROOT) -> list[str]:
    """Templates a plan may use: those of the format that the dashboard hasn't disabled."""
    return [t for t, f in TEMPLATES.items() if fmt in (None, f) and settings["templates"].get(t, {}).get("enabled", True)]


def plan_format(plan_or_script: dict) -> str:
    """'short' or 'long', from the template the plan or script names."""
    name = plan_or_script.get("template")
    return TEMPLATES.get(name, "short")


def length_range(settings: dict, fmt: str) -> tuple[int, int]:
    if fmt == "long":
        return settings["longLengthMinSec"], settings["longLengthMaxSec"]
    return settings["lengthMinSec"], settings["lengthMaxSec"]


# ---------------- state ----------------

def state(root: Path = ROOT, fmt: str = "short") -> dict:
    """What this run should do, plus everything the planner needs to pick a passing plan.

    `fmt` picks the pipeline: "short" is the nightly Shorts run, "long" is the Studio agent's
    weekly long-form run. Each format has its own history, templates, backlog and target."""
    settings = load_settings(root)
    everything = history.load(root)
    entries = history.of_format(everything, fmt)
    enabled = enabled_templates(settings, fmt, root)
    backlog = history.ready_count(everything, settings, fmt)
    tw = settings["templateWork"]
    today = history.ist_day(history.now().isoformat())
    work_today = sum(1 for w in history.load_template_work(root) if history.ist_day(w["at"]) == today)
    may_build = work_today < tw["maxPerDay"]
    full = backlog >= settings["backlogCap"]
    # video runs only make videos; building and improving templates is the improver agent's job
    # (agents/improver.md), which reads the template_work block below
    target = settings["dailyVideoTarget"]
    made_today = sum(1 for e in entries if history.ist_day(e["created_at"]) == today)
    n_templates = len(TEMPLATES)
    room = n_templates < tw["maxTemplates"]

    week = history.ist_week(history.now().isoformat())
    made_week = sum(1 for e in entries if history.ist_week(e["created_at"]) == week)
    per_week, long_cap = settings["longPerWeek"], settings["longBacklogCap"]
    if settings["generationPaused"]:
        mode, why = "paused", "generation is paused in settings"
    elif fmt == "long":
        if per_week <= 0:
            mode, why = "paused", "longPerWeek is 0: long-form is switched off in settings"
        elif backlog >= long_cap:
            mode, why = "idle", f"{backlog} long videos are already waiting (cap {long_cap})"
        elif made_week < per_week:
            mode, why = "video", f"{made_week} of {per_week} long videos made this week ({week}); backlog {backlog}"
        else:
            mode, why = "idle", f"this week's {per_week} long videos are made"
    elif full:
        mode, why = "idle", f"backlog {backlog} has reached the cap of {settings['backlogCap']}"
    elif made_today < target:
        mode, why = "video", f"{made_today} of {target} videos made today; backlog {backlog} of {settings['backlogCap']}"
    else:
        mode, why = "idle", f"today's {target} videos are made"

    last = entries[-1] if entries else None
    allowed = variety.allowed_templates(entries, enabled)
    blocked = variety.blocked_categories(entries)
    feed = topics.for_state(entries, today, blocked, allowed, root, fmt)
    if fmt == "short" and mode == "idle" and feed["urgent"] and made_today < target + TREND_EXTRA_PER_DAY:
        level = (topics.get(feed["urgent"], root, fmt) or {}).get("priority", "breaking")
        mode, why = "video", f"{why}, but a {level} topic is waiting: one extra video for it"
    return {
        "format": fmt,
        "mode": mode, "reason": why, "backlog": backlog,
        "backlog_cap": long_cap if fmt == "long" else settings["backlogCap"],
        "videos_today": made_today, "daily_target": target,
        "videos_this_week": made_week, "weekly_target": per_week,
        "next_id": (next_id := history.next_id(everything, root=root, fmt=fmt)),
        "experiments": experiments.prompt_notes(next_id, root),
        "template_work": {"runs_today": work_today, "max_per_day": tw["maxPerDay"],
                          "may_add_template": room, "templates": n_templates, "max_templates": tw["maxTemplates"]},
        "templates": {t: {"weight": settings["templates"].get(t, {}).get("weight", 1.0)} for t in enabled},
        "allowed_templates": allowed,
        "template_window": variety.template_window(variety.rotation_size(enabled)),
        "allowed_stories": variety.allowed_stories(entries, allowed),
        "recent_stories": [variety.story_of(e) for e in entries[-variety.STORY_WINDOW:]],
        "blocked_categories": blocked,
        "topic_feed": feed,
        # global first (owner, 2026-10-23): about two in three videos anyone in the world can relate to
        "reach": reach.for_state(entries, today, fmt),
        # what to make: formats people already watch in the millions (improvement/research/formats.json)
        "formats": formats.for_state(root, fmt),
        "previous": last and {"palette": last["style"]["palette"], "genre": last["style"]["genre"], "key": last["style"]["key"],
                              "bpm": last["style"]["bpm"], "hook_style": last["hook_style"], "cta": last["cta"]},
        "hook_styles": list(variety.HOOK_STYLES),
        "recent_topics": [e["topic"]["title"] for e in entries[-40:]],
        "recent_openings": sorted({variety.opening(e[f]) for e in entries[-variety.OPENING_WINDOW:] for f in ("title", "description")}),
        "length_range_sec": list(length_range(settings, fmt)),
        "disclaimer": settings["disclaimer"],
    }


# ---------------- steps ----------------

def cast_voices(script: dict) -> set[str]:
    """The voices of the cast members who speak in this script."""
    return {CAST_VOICES[b["speaker"]] for b in script.get("beats") or [] if b.get("speaker") in CAST_VOICES}


def heard(script: dict, narrator: str | None) -> dict:
    """What viewers hear: the voice of the first spoken line and the narrator's share of all words (%).
    The style's `voice` names only the narrator, though the cast may speak most of a video (research, 2026-10-27)."""
    lines = [(b.get("speaker") or "narrator", len((b.get("say") or "").split())) for b in script.get("beats") or []]
    lines = [(who, n) for who, n in lines if n]
    if not lines:
        return {}
    total = sum(n for _, n in lines)
    return {"hookVoice": CAST_VOICES.get(lines[0][0], narrator),
            "narratorShare": round(100 * sum(n for who, n in lines if who not in CAST_VOICES) / total)}


def next_narrator(entries: list[dict], taken: set[str] = frozenset()) -> str:
    """The narrator voice these videos used longest ago (a never-used one first), never one in `taken`."""
    last = {v: -1 for v in NARRATOR_VOICES if v not in taken} or {v: -1 for v in NARRATOR_VOICES}
    for i, e in enumerate(entries):
        voice = (e.get("style") or {}).get("voice")
        if voice in last:
            last[voice] = i
    return min(last, key=lambda v: last[v])


def check_plan(vid: str, root: Path = ROOT) -> list[str]:
    plan = _read(_dir(vid, root) / "plan.json")
    missing = [k for k in PLAN_KEYS if k not in plan]
    if missing:
        problems = [f"plan.json is missing {', '.join(missing)}"]
    else:
        fmt = plan_format(plan)
        entries = history.of_format(history.load(root), fmt)
        enabled = enabled_templates(load_settings(root), fmt, root)
        problems = variety.check_plan(plan, entries, enabled)
        problems += formats.check_plan(plan, root, fmt)
        problems += reach.check_plan(plan, entries, history.ist_day(history.now().isoformat()), fmt)
        problems += topics.check_plan(plan, entries, history.ist_day(history.now().isoformat()),
                                      variety.blocked_categories(entries), variety.allowed_templates(entries, enabled), root, fmt)
        if not 20 <= len(plan["title"]) <= 90:
            problems.append("title must be 20–90 characters")
        if fmt == "short" and "#shorts" not in [h.lower() for h in plan["hashtags"]]:
            problems.append("hashtags must include #Shorts")
        # global since 2026-10-18: every plan names its money (channel/profile.md)
        if plan.get("currency") not in CURRENCIES:
            problems.append(f"currency must be one of {', '.join(CURRENCIES)}: USD unless the story is about one country")
        # a Short has no end card any more, so the description always carries the disclaimer
        if load_settings(root)["disclaimer"] not in plan["description"]:
            problems.append(f"description must include the disclaimer: {load_settings(root)['disclaimer']}")
    log_step(vid, "planner", not problems, problems or ["Plan passes the variety rules."], root)
    return problems


def run_number_check(vid: str, root: Path = ROOT) -> list[str]:
    d = _dir(vid, root)
    script, plan = _read(d / "script.json"), _read(d / "plan.json")
    passed, notes = number_check(script, plan, topics.source_topic(plan, root))
    if passed:   # pacing warnings never fail the check, but the writer sees them and they are logged
        for w in check_script(script).get("warnings", []):
            print(f"WARN: {w}")
            notes.append(f"warning: {w}")
    # the story spine (generator/story.py): fixed before anything is voiced or drawn
    entries = [e for e in history.of_format(history.load(root), plan_format(script)) if e["id"] != vid]
    spine = story.script_problems(script, [_read_script(e["id"], root) for e in entries[-10:]])
    if spine:
        passed, notes = False, [*notes, *spine]
    log_step(vid, "number_check", passed, notes, root)
    return [] if passed else notes


def figures(vid: str, root: Path = ROOT) -> dict:
    """Computed figures and the final on-screen lines, as a reviewer needs to see them."""
    return check_script(_read(_dir(vid, root) / "script.json"))


def record(vid: str, agent: str, passed: bool, notes: list[str], root: Path = ROOT) -> None:
    if agent not in AGENTS:
        raise ValueError(f"agent must be one of {', '.join(AGENTS)}")
    _read(_dir(vid, root) / "plan.json")
    log_step(vid, agent, passed, notes, root)


LIVELY_BAR = {"short": 3.0, "long": 2.0}   # the shot system moves far more than the old layouts (gates.py floor: 1.2)


def gate_problems(report: dict, settings: dict, fmt: str) -> list[str]:
    """The gates a render report can fail before or after the video: length, thin narration (long
    videos) and sound levels."""
    out = []
    lo, hi = length_range(settings, fmt)
    if not lo <= report["duration_sec"] <= hi:
        out.append(f"length {report['duration_sec']} s is outside {lo}–{hi} s")
    voice = report.get("voice")
    if voice and fmt == "long":
        for l in [l for l in voice.get("lines", []) if l["fill"] < MIN_VOICE_FILL]:
            out.append(f"section {l['scene']}: the narration fills only {l['fill']*100:.0f}% of its "
                       f"{l['window']:.0f} s ({l['seconds']:.0f} s spoken). Write more, or shorten the section.")
    lively = report.get("liveliness")
    bar = LIVELY_BAR[fmt]
    if lively and lively.get("median", 99) < bar:
        out.append(f"motion median {lively['median']:.2f} is under {bar} for a {fmt} video in the shot system: "
                   f"more camera moves, money in motion, set changes (the showcase scored 9.3)")
    audio = report.get("audio")
    if audio and not (-1.6 <= audio["peak_db"] <= -0.4 and -21 <= audio["mean_db"] <= -15):
        out.append(f"audio levels off target: peak {audio['peak_db']} dB, mean {audio['mean_db']} dB")
    return out


def render(vid: str, preview: bool = False, root: Path = ROOT) -> list[str]:
    """Render into videos/<id>/ and apply the mechanical QA gates (layout, length, audio levels)."""
    d = _dir(vid, root)
    settings = load_settings(root)
    started = history.now().isoformat()
    try:
        script = _read(d / "script.json")
        if script.get("template") not in TEMPLATES:
            raise ValueError(f"template must be one of {', '.join(TEMPLATES)}")
        # voices rotate per video (CLAUDE.md): a missing narrator, or the previous video's, gives way to the
        # one used longest ago; it is saved in the script so a re-render keeps the same voice. The narrator
        # never shares a voice with a cast member who speaks in the same video (Sharma, Sikka)
        earlier = [e for e in history.of_format(history.load(root), plan_format(script)) if e["id"] != vid]
        previous = (earlier[-1].get("style") or {}).get("voice") if earlier else None
        taken = cast_voices(script)
        if not script.get("narrator") or script["narrator"] == previous or script["narrator"] in taken:
            script["narrator"] = next_narrator(earlier, taken)
            _write(d / "script.json", script)
        # the video's A/B variants travel in the timeline, so scenes can read them and ship records them
        script["experiments"] = experiments.for_video(vid, script.get("template"), root)
        # length, narration and sound are known before the video is drawn: a render that would fail
        # on them stops after the stills instead of after the whole video
        gate = lambda r: gate_problems(r, settings, plan_format(script))
        report = remotion.render_story(script, d, preview=preview, stop_if=gate)
    except (ValueError, RuntimeError) as e:
        log_step(vid, "render", False, [str(e)], root, started)
        return [str(e)]
    problems = (list(report["layout_problems"]) + list(report.get("craft_problems", [])) + list(report.get("liveliness_problems", []))
                + gate_problems(report, settings, plan_format(script)))
    # a Short's cover is designed, never a frame grabbed from the middle of the video (owner, 2026-10-21:
    # the first two new-style Shorts got a half-cut caption as their cover)
    if plan_format(script) == "short" and not script.get("thumbnail"):
        problems.append("a Short needs a `thumbnail` (its cover): `scene` (a frame of the video under the words: the default), "
                        "`versus`, `secret` or `story` (renderer/templates/short_story/README.md)")
    # a long video's thumbnails sell the whole promise, in words that add to the title (renderer/thumbs.py)
    plan_ = _read(d / "plan.json") if (d / "plan.json").is_file() else {}
    problems += thumbs.problems({**script, "title": plan_.get("title", script.get("title", "")), "story": script.get("story") or plan_.get("story")}, d)
    # the story's own things, not the last videos' (build beats; 2026-10-26)
    tl_now = _read(d / "timeline.json") if (d / "timeline.json").is_file() else {"beats": []}
    def _tl(e: dict) -> dict:
        f = root / "videos" / e["id"] / "timeline.json"
        return json.loads(f.read_text(encoding="utf-8")) if f.is_file() else {"beats": []}
    problems += craft.prop_problems(tl_now, [(e["id"], _tl(e)) for e in earlier[-craft.PROP_WINDOW:]])
    problems += story.timeline_problems(script, tl_now, [_read_script(e["id"], root) for e in earlier[-10:]])
    # every cover a different picture: not like the last covers of this format
    problems += craft.cover_problems(d / "thumbnail.png", [(e["id"], root / "videos" / e["id"] / "thumbnail.png") for e in earlier])
    audio = report.get("audio")
    rendered = "liveliness" in report
    ok_note = f"{report['duration_sec']} s, {report['style']['palette']}/{report['style']['genre']}" + (f", peak {audio['peak_db']} dB, mean {audio['mean_db']} dB" if audio and rendered else " (preview only)")
    warnings = []
    if plan_format(script) == "short" and (d / "timeline.json").exists():   # measured on the real voice timing
        warnings = [f"warning: {w}" for w in event_gaps(_read(d / "timeline.json")["beats"])]
    log_step(vid, "render", not problems, (problems or [ok_note]) + warnings, root, started)
    return problems


def _latest_checks(steps: list[dict]) -> dict[str, dict]:
    return {s["agent"]: s for s in steps if s["agent"] in CHECKERS}


def ship(vid: str, commit: bool = False, release: bool = False, root: Path = ROOT, push: bool = False, media_branch: bool = False) -> dict:
    """Write manifest.json and append to history. Refuses unless all three checks passed and the
    video is rendered. `release` uploads the mp4 with gh, then `commit` makes a git commit (so the
    commit records the upload) and `push` pushes it."""
    d = _dir(vid, root)
    plan, script, report = _read(d / "plan.json"), _read(d / "script.json"), _read(d / "render.json")
    steps = json.loads((d / "run.json").read_text(encoding="utf-8"))
    checks = _latest_checks(steps)
    blockers = [f"{c} has not passed" for c in CHECKERS if checks.get(c, {}).get("status") != "ok"]
    if not (d / "video.mp4").is_file():
        blockers.append("video.mp4 is missing (render without --preview)")
    if (d / "manifest.json").is_file():
        blockers.append("already shipped (manifest.json exists)")
    if blockers:
        raise ValueError("cannot ship: " + "; ".join(blockers))

    created = history.now().isoformat()
    fmt = plan_format(plan)
    tag = f"video-{vid}"
    voice = report.get("voice")
    style = {**report["style"], "voice": voice["name"] if voice else None}
    log_step(vid, "ship", True, [f"Manifest written; release asset {'uploaded' if release else 'not uploaded (dry run)'}."], root)
    manifest = {
        "id": vid, "createdAt": created, "status": "qa_passed", "format": fmt,
        "template": plan["template"], "topic": plan["topic"], "title": plan["title"], "description": plan["description"],
        "hashtags": plan["hashtags"], "hookStyle": plan["hook_style"], "cta": plan["cta"],
        "seed": script["seed"], "style": style, "voice": voice, "durationSec": report["duration_sec"], "audio": report.get("audio"),
        "experiments": report.get("experiments", {}),
        # who speaks, for the evaluator's voice ranking: the hook's voice and the narrator's share of the words
        "heard": heard(script, voice["name"] if voice else script.get("narrator")),
        "checks": [{"checker": c, "passed": True, "notes": checks[c]["notes"]} for c in CHECKERS],
        "agentRuns": json.loads((d / "run.json").read_text(encoding="utf-8")),
        "files": {"thumbnail": "thumbnail.png", "preview": "preview.png", "script": "script.json"},
        "release": {"tag": tag, "asset": "video.mp4", "uploaded": False},
    }
    if media_branch:
        manifest["release"]["mediaBranch"] = f"media/{vid}"
    if (urgent := topics.urgency(plan, root)) is not None:
        manifest["priority"] = urgent   # ingest puts it at the front of the upload queue
    if script.get("thumbnails"):   # three thumbnails for YouTube's Test & Compare, with what each leads with
        manifest["thumbnails"] = [{"file": f, "angle": t.get("angle"), "layout": t.get("layout")} for f, t in
                                  zip(("thumbnail.png", "thumbnail-b.png", "thumbnail-c.png"), [script["thumbnail"], *script["thumbnails"]])]
    _write(d / "manifest.json", manifest)
    history.append({
        "id": vid, "created_at": created, "template": plan["template"], "topic": plan["topic"], "title": plan["title"],
        "description": plan["description"], "hook_style": plan["hook_style"], "cta": plan["cta"], "style": style, "format": fmt,
        "story": plan.get("story"),
    }, root)

    if release:
        manifest = upload_release(vid, root)
    if commit:
        commit_video(vid, f"Add video {vid}: {plan['title']}", push, root)
    if media_branch:   # after the push to main, so the workflow can read the manifest
        try:
            push_media_branch(vid, root)
        except subprocess.CalledProcessError as e:
            raise ValueError(f"manifest and history are saved, but pushing media/{vid} failed: {(e.stderr or b'').decode(errors='replace').strip() or e}") from e
    return manifest


def gh_exe() -> str:
    """Path to the GitHub CLI (PATH first, then the default Windows install location)."""
    found = shutil.which("gh") or next((str(p) for p in (Path(r"C:\Program Files\GitHub CLI\gh.exe"),) if p.is_file()), None)
    if not found:
        raise ValueError("gh CLI is not installed")
    return found


def commit_video(vid: str, message: str, push: bool = False, root: Path = ROOT) -> None:
    paths = [f"videos/{vid}", "history/history.json"]
    if (root / "remotion" / "src" / "videos" / vid / "Hook.tsx").is_file():   # the video's own hook ships with it
        paths.append(f"remotion/src/videos/{vid}")
    subprocess.run(["git", "add", *paths], cwd=root, check=True)
    subprocess.run(["git", "commit", "-q", "-m", message], cwd=root, check=True)
    if push:
        subprocess.run(["git", "push", "-q", "origin", "HEAD:main"], cwd=root, check=True)


MEDIA_PART_BYTES = 90 * 1024 * 1024   # under GitHub's 100 MB limit for one file in a push


def push_media_branch(vid: str, root: Path = ROOT) -> str:
    """Push a branch media/<id> that is the current commit plus video.mp4 at the repo root.

    Cloud sessions are not allowed to create GitHub Releases, but they can push branches. The
    release-video workflow turns this branch into Release video-<id> and deletes the branch.
    The branch is built on HEAD (not as an orphan) because GitHub only runs a workflow if its
    file is in the pushed commit. A throwaway index is used, so the working tree and the real
    index are untouched. HEAD should already be pushed, so the push carries only the mp4."""
    mp4 = _dir(vid, root) / "video.mp4"
    if not mp4.is_file():
        raise ValueError("video.mp4 is missing")
    with tempfile.TemporaryDirectory() as tmp:
        env = {**os.environ, "GIT_INDEX_FILE": str(Path(tmp) / "index")}

        def git(*args: str) -> str:
            return subprocess.run(["git", *args], cwd=root, check=True, capture_output=True, env=env).stdout.decode().strip()

        git("read-tree", "HEAD")
        # GitHub refuses a file over 100 MB in a push, and a long video is 200 MB+: it goes in parts
        # (video.mp4.part-000, -001, ...), which release-video.yml joins back byte for byte
        data = mp4.read_bytes()
        if len(data) <= MEDIA_PART_BYTES:
            parts = [("video.mp4", mp4)]
        else:
            parts = []
            for i in range(0, len(data), MEDIA_PART_BYTES):
                part = Path(tmp) / f"video.mp4.part-{i // MEDIA_PART_BYTES:03d}"
                part.write_bytes(data[i:i + MEDIA_PART_BYTES])
                parts.append((part.name, part))
        for name, path in parts:
            git("update-index", "--add", "--cacheinfo", f"100644,{git('hash-object', '-w', str(path))},{name}")
        commit = git("commit-tree", git("write-tree"), "-p", "HEAD", "-m", f"Video {vid}")
        branch = f"media/{vid}"
        git("push", "-q", "origin", f"{commit}:refs/heads/{branch}")
    return branch

def upload_release(vid: str, root: Path = ROOT) -> dict:
    """Upload videos/<id>/video.mp4 as the asset of GitHub Release video-<id> and record it in the
    manifest. Works on a video shipped earlier without --release."""
    d = _dir(vid, root)
    manifest = _read(d / "manifest.json")
    if manifest.get("status") != "qa_passed":
        raise ValueError(f"{vid} has status {manifest.get('status')!r}; only qa_passed videos are released")
    if manifest["release"]["uploaded"]:
        raise ValueError(f"{vid} is already uploaded as {manifest['release']['tag']}")
    if not (d / "video.mp4").is_file():
        raise ValueError("video.mp4 is missing")
    subprocess.run([gh_exe(), "release", "create", manifest["release"]["tag"], str(d / "video.mp4"),
                    "--title", manifest["title"], "--notes", f"Video {vid}"], cwd=root, check=True)
    manifest["release"].update(uploaded=True, uploadedAt=history.now().isoformat())
    _write(d / "manifest.json", manifest)
    return manifest

def fail(vid: str, reason: str, root: Path = ROOT) -> dict:
    """Mark a video failed. It is not added to history, so its topic can be tried again."""
    d = _dir(vid, root)
    plan = _read(d / "plan.json")
    run = d / "run.json"
    manifest = {"id": vid, "createdAt": history.now().isoformat(), "status": "failed", "failReason": reason,
                "template": plan["template"], "topic": plan["topic"], "title": plan["title"],
                "agentRuns": json.loads(run.read_text(encoding="utf-8")) if run.is_file() else []}
    _write(d / "manifest.json", manifest)
    return manifest


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="generator.run", description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("state").add_argument("--format", choices=("short", "long"), default="short")
    for name in ("check-plan", "number-check", "figures"):
        sub.add_parser(name).add_argument("id")
    p = sub.add_parser("record")
    p.add_argument("id")
    p.add_argument("agent", choices=AGENTS)
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--passed", action="store_true")
    g.add_argument("--failed", action="store_true")
    p.add_argument("--note", action="append", default=[])
    p = sub.add_parser("render")
    p.add_argument("id")
    p.add_argument("--preview", action="store_true")
    p = sub.add_parser("ship")
    p.add_argument("id")
    p.add_argument("--commit", action="store_true")
    p.add_argument("--release", action="store_true")
    p.add_argument("--push", action="store_true")
    p.add_argument("--media-branch", action="store_true")
    sub.add_parser("media").add_argument("id")
    p = sub.add_parser("release")
    p.add_argument("id")
    p.add_argument("--commit", action="store_true")
    p.add_argument("--push", action="store_true")
    p = sub.add_parser("fail")
    p.add_argument("id")
    p.add_argument("--reason", required=True)
    # research and Scout run this before writing new topics: stale, expired and weak unused topics go
    sub.add_parser("prune-feed").add_argument("--format", choices=("short", "long"), default="short")
    p = sub.add_parser("template-work")
    p.add_argument("template")
    p.add_argument("action")
    p.add_argument("--enabled", action="store_true")
    a = ap.parse_args(argv)

    try:
        if a.cmd == "state":
            print(json.dumps(state(fmt=a.format), indent=2, ensure_ascii=False))
            return 0
        if a.cmd == "figures":
            print(json.dumps(figures(a.id), indent=2, ensure_ascii=False))
            return 0
        if a.cmd == "record":
            record(a.id, a.agent, a.passed, a.note)
            print(f"recorded {a.agent}: {'passed' if a.passed else 'failed'}")
            return 0
        if a.cmd == "ship":
            m = ship(a.id, a.commit, a.release, push=a.push, media_branch=a.media_branch)
            print(f"shipped {m['id']}: {m['title']} (release uploaded: {m['release']['uploaded']}, media branch: {m['release'].get('mediaBranch', 'none')})")
            return 0
        if a.cmd == "media":
            print(f"pushed {push_media_branch(a.id)}")
            return 0
        if a.cmd == "release":
            m = upload_release(a.id)
            if a.commit:
                commit_video(a.id, f"Release video {a.id}", a.push)
            print(f"uploaded {m['release']['tag']}")
            return 0
        if a.cmd == "fail":
            fail(a.id, a.reason)
            print(f"marked {a.id} failed")
            return 0
        if a.cmd == "prune-feed":
            gone = topics.prune_file(history.of_format(history.load(), a.format), history.ist_day(history.now().isoformat()), fmt=a.format)
            print("\n".join(f"dropped {g}" for g in gone) or "nothing to drop")
            return 0
        if a.cmd == "template-work":
            print(json.dumps(history.append_template_work(a.template, a.action, a.enabled)))
            return 0
        problems = {"check-plan": check_plan, "number-check": run_number_check}[a.cmd](a.id) if a.cmd != "render" else render(a.id, a.preview)
    except (ValueError, subprocess.CalledProcessError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    for p in problems:
        print(f"FAIL: {p}")
    if not problems:
        print("ok")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
