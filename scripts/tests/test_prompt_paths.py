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
