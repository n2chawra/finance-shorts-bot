"""Every agent that can fix an owner's note gets it (owner, 2026-11-10)."""
import json
from pathlib import Path

from generator import feedback


def put(root: Path, rel: str, data: dict) -> None:
    (root / rel).parent.mkdir(parents=True, exist_ok=True)
    (root / rel).write_text(json.dumps(data), encoding="utf-8")


NOTES = {"notes": [
    {"id": "n1", "kind": "general", "text": "make an impact tab", "status": "open"},
    {"id": "n2", "kind": "wrong", "text": "titles hide the name", "status": "open"},
    {"id": "n3", "kind": "choice", "text": "picked", "status": "open"},
    {"id": "n4", "kind": "improve", "text": "old", "status": "addressed"},
]}


def test_every_agent_sees_open_notes_until_someone_closes_them(tmp_path: Path) -> None:
    put(tmp_path, "metrics/feedback.json", NOTES)
    assert [n["id"] for n in feedback.for_agent("dashboard", tmp_path)] == ["n1", "n2"]   # no picks, nothing addressed
    put(tmp_path, "improvement/feedback-acks.json", {"acks": [{"id": "n2", "action": "fixed", "note": "names in descriptions"}]})
    assert [n["id"] for n in feedback.for_agent("dashboard", tmp_path)] == ["n1"]
    assert [n["id"] for n in feedback.for_agent("research", tmp_path)] == ["n1"]


def test_a_handed_note_goes_first_to_its_agent_and_leaves_once_answered(tmp_path: Path) -> None:
    put(tmp_path, "metrics/feedback.json", NOTES)
    put(tmp_path, "improvement/feedback-acks/improver.json",
        {"acks": [{"id": "n1", "action": "partly", "to": "dashboard", "note": "data ready"},
                  {"id": "n2", "action": "fixed", "note": "done"}]})
    first = feedback.for_agent("dashboard", tmp_path)[0]
    assert first["id"] == "n1" and first["handed_to_you"] and first["answers"][0]["agent"] == "improver"
    assert [n["id"] for n in feedback.for_agent("improver", tmp_path)] == []        # its part is done
    put(tmp_path, "improvement/feedback-acks/dashboard.json", {"acks": [{"id": "n1", "action": "fixed", "note": "built"}]})
    assert feedback.for_agent("dashboard", tmp_path) == []


def test_an_agent_that_does_its_part_of_a_handed_note_and_passes_on_the_rest_is_done(tmp_path: Path) -> None:
    """auditor partly → improver, improver partly → studio: improver answered; only studio still owes one."""
    put(tmp_path, "metrics/feedback.json", NOTES)
    put(tmp_path, "improvement/feedback-acks/auditor.json",
        {"acks": [{"id": "n1", "action": "partly", "to": "improver", "note": "data side fixed"},
                  {"id": "n2", "action": "fixed", "note": "done"}]})
    put(tmp_path, "improvement/feedback-acks/improver.json",
        {"acks": [{"id": "n1", "action": "partly", "to": "studio", "note": "short side fixed"}]})
    assert feedback.for_agent("improver", tmp_path) == []
    assert [(n["id"], n["handed_to_you"]) for n in feedback.for_agent("studio", tmp_path)] == [("n1", True)]


def test_a_note_handed_back_to_an_agent_that_had_handed_it_on_shows_again(tmp_path: Path) -> None:
    put(tmp_path, "metrics/feedback.json", NOTES)
    put(tmp_path, "improvement/feedback-acks/auditor.json", {"acks": [{"id": "n1", "action": "handed", "to": "improver", "note": "a look"}]})
    put(tmp_path, "improvement/feedback-acks/improver.json", {"acks": [{"id": "n1", "action": "handed", "to": "auditor", "note": "a crash"}]})
    assert [(n["id"], n["handed_to_you"]) for n in feedback.for_agent("auditor", tmp_path)][0] == ("n1", True)
