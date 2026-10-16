"""Every routine prompt starts from GitHub's main and agents push to agent/ branches.

On 2026-10-16 the cloud clone's local main was unrelated to GitHub's, `git pull --ff-only` failed
in every routine, no videos were made and two agents pushed to branches nothing merges.
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
AGENTS = ["auditor", "research", "improver", "dashboard"]
PROMPTS = [REPO / "generator" / "prompts" / "routine.md", *(REPO / "agents" / f"{a}.md" for a in AGENTS)]


def first_command(text: str) -> str:
    block = re.search(r"```\n(.*?)```", text, re.S)
    assert block, "no code block"
    return block.group(1).strip().splitlines()[0]


def test_every_routine_syncs_main_first() -> None:
    for p in PROMPTS:
        text = p.read_text(encoding="utf-8")
        assert first_command(text).startswith("bash scripts/sync-main.sh"), p.name
        assert "pull --ff-only" not in text, p.name


def test_agents_push_to_their_agent_branch() -> None:
    for a in AGENTS:
        text = (REPO / "agents" / f"{a}.md").read_text(encoding="utf-8")
        pushes = re.findall(r"git push origin (\S+)", text)
        assert pushes, a
        assert all(p.startswith(f"HEAD:refs/heads/agent/{a}/") for p in pushes), (a, pushes)


def test_sync_script_resets_to_origin_main() -> None:
    script = (REPO / "scripts" / "sync-main.sh").read_text(encoding="utf-8")
    assert "git checkout -q -f -B main origin/main" in script
    assert "set -euo pipefail" in script
