"""Code steps of a generation run. The agent steps (planner, writer, fact review, QA review) are
done by the Claude session following generator/prompts/*.md; this tool does everything else and
records every step in videos/<id>/run.json.

    python -m generator.run state                         what to do this run, and what the planner may pick
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

from renderer import cli as renderer

from . import experiments, history, variety
from .numbers import number_check
from .settings import ROOT, load as load_settings

CHECKERS = ("number_check", "fact_review", "qa_review")
AGENTS = ("planner", "writer", *CHECKERS, "render", "ship")
PLAN_KEYS = ("template", "topic", "hook_style", "cta", "title", "description", "hashtags", "seed", "style")


def _dir(vid: str, root: Path) -> Path:
    return root / "videos" / vid


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


def enabled_templates(settings: dict) -> list[str]:
    return [t for t in renderer.template_names() if settings["templates"].get(t, {}).get("enabled", True)]


# ---------------- state ----------------

def state(root: Path = ROOT) -> dict:
    """What this run should do, plus everything the planner needs to pick a passing plan."""
    settings = load_settings(root)
    entries = history.load(root)
    enabled = enabled_templates(settings)
    backlog = history.ready_count(entries, settings)
    tw = settings["templateWork"]
    today = history.ist_day(history.now().isoformat())
    work_today = sum(1 for w in history.load_template_work(root) if history.ist_day(w["at"]) == today)
    may_build = work_today < tw["maxPerDay"]
    full = backlog >= settings["backlogCap"]
    # video runs only make videos; building and improving templates is the improver agent's job
    # (agents/improver.md), which reads the template_work block below
    target = settings["dailyVideoTarget"]
    made_today = sum(1 for e in entries if history.ist_day(e["created_at"]) == today)
    n_templates = len(renderer.template_names())
    room = n_templates < tw["maxTemplates"]

    if settings["generationPaused"]:
        mode, why = "paused", "generation is paused in settings"
    elif full:
        mode, why = "idle", f"backlog {backlog} has reached the cap of {settings['backlogCap']}"
    elif made_today < target:
        mode, why = "video", f"{made_today} of {target} videos made today; backlog {backlog} of {settings['backlogCap']}"
    else:
        mode, why = "idle", f"today's {target} videos are made"

    last = entries[-1] if entries else None
    return {
        "mode": mode, "reason": why, "backlog": backlog, "backlog_cap": settings["backlogCap"],
        "videos_today": made_today, "daily_target": target,
        "next_id": (next_id := history.next_id(entries, root=root)),
        "experiments": experiments.prompt_notes(next_id, root),
        "template_work": {"runs_today": work_today, "max_per_day": tw["maxPerDay"],
                          "may_add_template": room, "templates": n_templates, "max_templates": tw["maxTemplates"]},
        "templates": {t: {"weight": settings["templates"].get(t, {}).get("weight", 1.0)} for t in enabled},
        "allowed_templates": variety.allowed_templates(entries, enabled),
        "template_window": variety.template_window(len(enabled)),
        "blocked_categories": variety.blocked_categories(entries),
        "previous": last and {"palette": last["style"]["palette"], "genre": last["style"]["genre"], "key": last["style"]["key"],
                              "bpm": last["style"]["bpm"], "hook_style": last["hook_style"], "cta": last["cta"]},
        "hook_styles": list(variety.HOOK_STYLES),
        "recent_topics": [e["topic"]["title"] for e in entries[-40:]],
        "recent_openings": sorted({variety.opening(e[f]) for e in entries[-variety.OPENING_WINDOW:] for f in ("title", "description")}),
        "length_range_sec": [settings["lengthMinSec"], settings["lengthMaxSec"]],
        "disclaimer": settings["disclaimer"],
    }


# ---------------- steps ----------------

def check_plan(vid: str, root: Path = ROOT) -> list[str]:
    plan = _read(_dir(vid, root) / "plan.json")
    missing = [k for k in PLAN_KEYS if k not in plan]
    if missing:
        problems = [f"plan.json is missing {', '.join(missing)}"]
    else:
        problems = variety.check_plan(plan, history.load(root), enabled_templates(load_settings(root)))
        if not 20 <= len(plan["title"]) <= 90:
            problems.append("title must be 20–90 characters")
        if "#shorts" not in [h.lower() for h in plan["hashtags"]]:
            problems.append("hashtags must include #Shorts")
    log_step(vid, "planner", not problems, problems or ["Plan passes the variety rules."], root)
    return problems


def run_number_check(vid: str, root: Path = ROOT) -> list[str]:
    d = _dir(vid, root)
    passed, notes = number_check(_read(d / "script.json"), _read(d / "plan.json"))
    log_step(vid, "number_check", passed, notes, root)
    return [] if passed else notes


def figures(vid: str, root: Path = ROOT) -> dict:
    """Computed figures and the final on-screen lines, as a reviewer needs to see them."""
    video = renderer.build(_read(_dir(vid, root) / "script.json"))
    return {"duration_sec": video.duration, "figures": video.figures, "on_screen_text": video.txt}


def record(vid: str, agent: str, passed: bool, notes: list[str], root: Path = ROOT) -> None:
    if agent not in AGENTS:
        raise ValueError(f"agent must be one of {', '.join(AGENTS)}")
    _read(_dir(vid, root) / "plan.json")
    log_step(vid, agent, passed, notes, root)


def render(vid: str, preview: bool = False, root: Path = ROOT) -> list[str]:
    """Render into videos/<id>/ and apply the mechanical QA gates (layout, length, audio levels)."""
    d = _dir(vid, root)
    settings = load_settings(root)
    started = history.now().isoformat()
    try:
        script = _read(d / "script.json")
        flags = experiments.for_video(vid, script.get("template"), root)
        report = renderer.render(renderer.build(script, flags), d, preview)
    except (ValueError, RuntimeError) as e:
        log_step(vid, "render", False, [str(e)], root, started)
        return [str(e)]
    problems = list(report["layout_problems"])
    if not settings["lengthMinSec"] <= report["duration_sec"] <= settings["lengthMaxSec"]:
        problems.append(f"length {report['duration_sec']} s is outside {settings['lengthMinSec']}–{settings['lengthMaxSec']} s")
    audio = report.get("audio")
    if audio and not (-1.6 <= audio["peak_db"] <= -0.4 and -21 <= audio["mean_db"] <= -15):
        problems.append(f"audio levels off target: peak {audio['peak_db']} dB, mean {audio['mean_db']} dB")
    ok_note = f"{report['duration_sec']} s, {report['style']['palette']}/{report['style']['genre']}" + (f", peak {audio['peak_db']} dB, mean {audio['mean_db']} dB" if audio else " (preview only)")
    log_step(vid, "render", not problems, problems or [ok_note], root, started)
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
    tag = f"video-{vid}"
    log_step(vid, "ship", True, [f"Manifest written; release asset {'uploaded' if release else 'not uploaded (dry run)'}."], root)
    manifest = {
        "id": vid, "createdAt": created, "status": "qa_passed",
        "template": plan["template"], "topic": plan["topic"], "title": plan["title"], "description": plan["description"],
        "hashtags": plan["hashtags"], "hookStyle": plan["hook_style"], "cta": plan["cta"],
        "seed": script["seed"], "style": report["style"], "durationSec": report["duration_sec"], "audio": report.get("audio"),
        "experiments": report.get("experiments", {}),
        "checks": [{"checker": c, "passed": True, "notes": checks[c]["notes"]} for c in CHECKERS],
        "agentRuns": json.loads((d / "run.json").read_text(encoding="utf-8")),
        "files": {"thumbnail": "thumbnail.png", "preview": "preview.png", "script": "script.json"},
        "release": {"tag": tag, "asset": "video.mp4", "uploaded": False},
    }
    if media_branch:
        manifest["release"]["mediaBranch"] = f"media/{vid}"
    _write(d / "manifest.json", manifest)
    history.append({
        "id": vid, "created_at": created, "template": plan["template"], "topic": plan["topic"], "title": plan["title"],
        "description": plan["description"], "hook_style": plan["hook_style"], "cta": plan["cta"], "style": report["style"],
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
    subprocess.run(["git", "add", f"videos/{vid}", "history/history.json"], cwd=root, check=True)
    subprocess.run(["git", "commit", "-q", "-m", message], cwd=root, check=True)
    if push:
        subprocess.run(["git", "push", "-q", "origin", "HEAD:main"], cwd=root, check=True)


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

        blob = git("hash-object", "-w", str(mp4))
        git("read-tree", "HEAD")
        git("update-index", "--add", "--cacheinfo", f"100644,{blob},video.mp4")
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
    sub.add_parser("state")
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
    p = sub.add_parser("template-work")
    p.add_argument("template")
    p.add_argument("action")
    p.add_argument("--enabled", action="store_true")
    a = ap.parse_args(argv)

    try:
        if a.cmd == "state":
            print(json.dumps(state(), indent=2, ensure_ascii=False))
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
