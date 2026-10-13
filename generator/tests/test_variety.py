from generator import variety

from .conftest import NOW, TEMPLATES, entry, make_plan


def check(plan: dict, history: list[dict]) -> list[str]:
    return variety.check_plan(plan, history, TEMPLATES, NOW)


def test_window_and_share_scale_with_template_count() -> None:
    assert [variety.template_window(n) for n in (2, 4, 6, 7, 12)] == [1, 2, 4, 5, 5]
    assert variety.share_limit(4) == 0.375
    assert variety.share_limit(8) == 0.30


def test_clean_plan_passes_on_empty_and_unrelated_history() -> None:
    assert check(make_plan(), []) == []
    history = [entry(1, "myth_vs_fact", "inflation"), entry(2, "two_friends_race", "retirement", palette="ocean")]
    assert check(make_plan(), history) == []


def test_template_used_too_recently() -> None:
    history = [entry(1, "quiz_countdown", "emi"), entry(2, "myth_vs_fact", "gold")]
    assert any("used in the last 2 videos" in p for p in check(make_plan(), history))
    history.append(entry(3, "two_friends_race", "tax"))          # now 3 back, outside the window of 2
    assert not any("template" in p for p in check(make_plan(), history))


def test_template_share_of_last_twenty() -> None:
    others = ["myth_vs_fact", "two_friends_race", "money_leak_meter"]

    def last19(quiz: int) -> list[dict]:
        """19 videos, `quiz` of them quiz_countdown, none in the two most recent."""
        return [entry(i, "quiz_countdown" if i < quiz else others[i % 3], f"cat{i}") for i in range(19)]

    # with four templates the limit is 37.5% of 20, i.e. 7 videos including the new one
    assert "quiz_countdown" in variety.allowed_templates(last19(6), TEMPLATES)
    assert "quiz_countdown" not in variety.allowed_templates(last19(7), TEMPLATES)
    assert any("would exceed 38% of the last 20" in p for p in check(make_plan(), last19(7)))


def test_disabled_or_unknown_template() -> None:
    assert any("not an enabled template" in p for p in variety.check_plan(make_plan(), [], ["myth_vs_fact"], NOW))


def test_category_in_last_three() -> None:
    history = [entry(1, "myth_vs_fact", "sip"), entry(2, "two_friends_race", "tax"), entry(3, "money_leak_meter", "gold")]
    assert any("category 'sip'" in p for p in check(make_plan(), history))
    history.append(entry(4, "myth_vs_fact", "fd"))
    assert not any("category" in p for p in check(make_plan(), history))


def test_near_duplicate_topic_within_sixty_days() -> None:
    twin = "How big a monthly SIP grows over two decades?"
    recent = [entry(1, "myth_vs_fact", "fd", title=twin, days_ago=30), *[entry(i, "two_friends_race", f"c{i}") for i in range(2, 6)]]
    assert any("too close to v-test-01" in p for p in check(make_plan(), recent))
    old = [entry(1, "myth_vs_fact", "fd", title=twin, days_ago=75), *[entry(i, "two_friends_race", f"c{i}") for i in range(2, 6)]]
    assert not any("too close" in p for p in check(make_plan(), old))


def test_similarity_behaves() -> None:
    assert variety.similarity("SIP vs FD returns", "SIP vs FD returns") > 0.99
    assert variety.similarity("What a monthly SIP grows into", "How a monthly SIP grows") > variety.DUPLICATE_SIMILARITY
    assert variety.similarity("Term insurance myths", "Food delivery costs") == 0


def test_style_must_rotate_from_previous_video() -> None:
    prev = entry(1, "myth_vs_fact", "gold", palette="forest", genre="acoustic", key="C", bpm=100)
    prev["hook_style"], prev["cta"] = "question", "Comment if you got it wrong, friend"
    problems = check(make_plan(), [prev])
    for expected in ("palette 'forest'", "genre 'acoustic'", "key and tempo", "hook style 'question'", "end CTA"):
        assert any(expected in p for p in problems), expected


def test_style_values_are_validated() -> None:
    bad = make_plan(style={"palette": "neon", "genre": "pop", "key": "C", "bpm": 90}, hook_style="rant")
    problems = check(bad, [])
    assert any("style.palette" in p for p in problems)
    assert any("style.bpm must be 104–120 for pop" in p for p in problems)
    assert any("hook_style" in p for p in problems)


def test_title_and_description_openings_are_not_reused() -> None:
    old = entry(1, "myth_vs_fact", "gold")
    old["title"], old["description"] = "Quiz: what does gold really return?", "A quick SIP reminder for everyone."
    filler = [entry(i, "two_friends_race", f"c{i}") for i in range(2, 5)]
    problems = check(make_plan(), [old, *filler])
    assert any("title opens with 'quiz what does'" in p for p in problems)
    assert any("description opens with 'a quick sip'" in p for p in problems)


def test_suggested_style_passes_the_rotation_rules() -> None:
    history = [entry(1, "myth_vs_fact", "gold", palette="ocean", genre="pop", key="D", bpm=110)]
    for seed in range(25):
        plan = make_plan(style=variety.suggest_style(history, seed), hook_style="question")
        assert not [p for p in check(plan, history) if "palette" in p or "genre" in p or "tempo" in p or "style." in p]
