"""Every repository path an agent's instructions name must exist.

The agents follow their prompts to the letter. When the code moves on (the Pillow engine was removed
on 2026-10-17) and a prompt still points at the old file, the agent wastes its run or works from a
wrong picture of the pipeline. Placeholders (`videos/<id>/…`, `*`) and files the runs create are skipped.
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PROMPTS = sorted([*REPO.glob("agents/*.md"), *REPO.glob("generator/prompts/*.md")])
TOP = ("agents/", "channel/", "generator/", "renderer/", "remotion/", "config/", "metrics/", "scripts/", "workers/", "apps/",
       "examples/", "history/", "assets/", "docs/", ".github/")
# written by the runs themselves, so they may not exist yet in a fresh checkout
CREATED_BY_RUNS = {"history/template_work.json"}


def named_paths(text: str) -> set[str]:
    out = set()
    for m in re.finditer(r"`([^`\s]+)`", text):
        t = m.group(1).rstrip(".,:;)")
        if t.count(":") == 1:          # `file.py:42`
            t = t.split(":")[0]
        if t.startswith(TOP) and not re.search(r"[<>*${}|]", t):
            out.add(t)
    return out


def test_prompts_name_only_existing_files() -> None:
    missing = [f"{p.relative_to(REPO).as_posix()}: {t}" for p in PROMPTS
               for t in sorted(named_paths(p.read_text(encoding="utf-8"))) if t not in CREATED_BY_RUNS and not (REPO / t).exists()]
    assert not missing, "agent instructions name files that don't exist:\n" + "\n".join(missing)


def test_the_check_sees_paths() -> None:
    assert named_paths("read `renderer/engine/video.py`, then `videos/<id>/plan.json` and `generator/run.py:42`.") == \
        {"renderer/engine/video.py", "generator/run.py"}


# The kit and template docs name example videos and channel folders. Channels get deleted with their videos'
# code (Paisa Panchayat and Going Down, 2026-11-23); a doc still pointing at one sends the director to nothing.
DOCS = sorted([*REPO.glob("renderer/templates/**/*.md"),
               *(p for p in REPO.glob("remotion/src/**/README.md") if "node_modules" not in p.parts),
               *PROMPTS])
VIDEO_CODE = re.compile(r"remotion/src/videos/([A-Za-z0-9_-]+)(?![A-Za-z0-9_.-])")
CHANNEL_DIR = re.compile(r"channels/([A-Za-z0-9_-]+)/")
BARE_ID = re.compile(r"`((?:v|L)-[a-z0-9]+(?:-[a-z0-9]+)+)(?:/[^`]*)?`")   # `v-20261118-01/Hook.tsx`, `L-…`


def dead_video_and_channel_paths(text: str, doc: Path) -> list[str]:
    out = []
    for m in VIDEO_CODE.finditer(text):
        if not (REPO / "remotion/src/videos" / m.group(1)).exists():
            out.append(m.group(0))
    for m in CHANNEL_DIR.finditer(text):
        if not (REPO / "channels" / m.group(1)).is_dir():
            out.append(m.group(0))
    if doc.parent == REPO / "remotion/src/videos":   # this README names ids relative to its folder
        for m in BARE_ID.finditer(text):
            if not (REPO / "remotion/src/videos" / m.group(1)).exists():
                out.append(m.group(1))
    return out


def test_docs_name_only_existing_videos_and_channels() -> None:
    missing = [f"{d.relative_to(REPO).as_posix()}: {t}" for d in DOCS
               for t in dead_video_and_channel_paths(d.read_text(encoding="utf-8"), d)]
    assert not missing, "docs name video code or channel folders that don't exist:\n" + "\n".join(missing)


def test_the_dead_path_check_sees_them() -> None:
    doc = REPO / "renderer/templates/x.md"
    assert dead_video_and_channel_paths("`remotion/src/videos/v-gone-xyz/Hook.tsx` and `channels/gone-xyz/profile.md`, "
                                        "`remotion/src/videos/README.md`, `channels/<channel>/x`", doc) == \
        ["remotion/src/videos/v-gone-xyz", "channels/gone-xyz/"]
    assert dead_video_and_channel_paths("Reference: `v-gone-xyz/Thumb.tsx`.", REPO / "remotion/src/videos/README.md") == ["v-gone-xyz"]
