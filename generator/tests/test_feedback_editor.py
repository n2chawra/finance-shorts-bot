"""The owner's feedback reaching the routine, and the editor's scores (2026-10-30)."""
import json

from generator import editor, feedback


def write(path, body):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(body), encoding="utf-8")


NOTES = {"notes": [
    {"id": "1", "kind": "wrong", "area": "pace", "text": "Voice too fast in the middle", "status": "open", "at": "2026-11-01T10:00:00Z",
     "video": {"id": "v-1", "title": "Casino", "format": "short", "story": "how_they_make_money", "shape": "reveal"}},
    {"id": "2", "kind": "choice", "text": "Best hook of the week", "status": "open", "at": "2026-11-01T09:00:00Z",
     "video": {"id": "v-2", "title": "Billion", "format": "short", "story": "money_scale", "shape": "what-if"}},
    {"id": "3", "kind": "stale", "text": "Payday stories don't work", "status": "open", "at": "2026-11-01T08:00:00Z",
     "video": {"id": "v-3", "title": "Payday", "format": "short", "story": "salary_breakdown", "shape": "levels"}},
    {"id": "4", "kind": "improve", "text": "Old note", "status": "addressed", "at": "2026-10-20T08:00:00Z", "video": None},
]}


def test_state_hands_open_notes_and_taste(tmp_path):
    write(tmp_path / "metrics" / "feedback.json", NOTES)
    s = feedback.for_state(tmp_path)
    assert [n["text"] for n in s["open"]] == ["Voice too fast in the middle"]       # addressed and picks are not tasks
    assert [n["kind"] for n in s["taste"]] == ["choice", "stale"]
    assert "wrong" in s["rule"]
    assert "Voice too fast" in feedback.report(tmp_path)


def test_taste_scores_picks_up_and_stales_down(tmp_path):
    write(tmp_path / "metrics" / "feedback.json", NOTES)
    t = feedback.taste_of(tmp_path)
    assert t["story:money_scale"] == 1 and t["story:salary_breakdown"] == -1 and t["shape:levels"] == -1


def test_no_feedback_file_is_fine(tmp_path):
    assert feedback.for_state(tmp_path)["open"] == [] and feedback.report(tmp_path) == ""


def test_the_editor_prefers_big_money_and_the_owner_s_taste(tmp_path):
    write(tmp_path / "improvement" / "research" / "formats.json", {"formats": [
        {"id": "money_scale", "format": "short", "tier": "core", "examples": [{"views": 10**6}]},
        {"id": "salary_breakdown", "format": "short", "tier": "low", "examples": [{"views": 10**6}]}]})
    write(tmp_path / "metrics" / "feedback.json", NOTES)
    for vid, story, shape in (("v-a", "money_scale", "what-if"), ("v-b", "salary_breakdown", "levels")):
        write(tmp_path / "videos" / vid / "plan.json", {"story": story, "shape": shape, "title": vid})
        write(tmp_path / "videos" / vid / "script.json", {"format": "short", "shape": shape, "beats": [{"say": "Hook line here."}]})
        write(tmp_path / "videos" / vid / "render.json", {"duration_sec": 55, "liveliness": {"median": 8}})
    rows = editor.rank(tmp_path, ids=["v-b", "v-a"])
    assert [r["id"] for r in rows] == ["v-a", "v-b"]
    best = rows[0]
    assert best["parts"]["tier"] > 0 and best["parts"]["taste"] > 0 and best["hook"] == "Hook line here."
    assert rows[1]["parts"]["tier"] < 0 and rows[1]["parts"]["taste"] < 0
