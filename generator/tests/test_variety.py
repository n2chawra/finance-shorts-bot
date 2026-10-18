from generator import variety

from .conftest import NOW, TEMPLATES, entry, make_plan


def check(plan: dict, history: list[dict]) -> list[str]:
    return variety.check_plan(plan, history, TEMPLATES, NOW)


def test_window_and_share_scale_with_template_count() -> None:
    assert [variety.template_window(n) for n in (1, 2, 4, 6, 7, 8, 12)] == [0, 0, 2, 4, 5, 6, 6]
    assert variety.share_limit(4) == 0.375
    assert variety.share_limit(8) == 0.30


def test_clean_plan_passes_on_empty_and_unrelated_history() -> None:
    assert check(make_plan(), []) == []
    history = [entry(1, "myth_vs_fact", "inflation"), entry(2, "two_friends_race", "retirement", palette="ocean")]
    assert check(make_plan(), history) == []


def test_a_single_template_is_always_allowed() -> None:
    """One template per format (short_story, long_story) means a window of 0. On 2026-10-18 the
    slice history[-0:] read as the whole history, and every plan after the first short_story was
    rejected: one Short made instead of three."""
    history = [entry(i, "short_story", f"cat{i}") for i in range(5)]
    assert variety.allowed_templates(history, ["short_story"]) == ["short_story"]
    assert not any("template" in p for p in variety.check_plan(make_plan(), history, ["short_story"], NOW))
    assert variety.latest(history, 0) == [] and variety.latest(history, 2) == history[-2:]


def test_template_used_too_recently() -> None:
    history = [entry(1, "short_story", "emi"), entry(2, "myth_vs_fact", "gold")]
    assert any("used in the last 2 videos" in p for p in check(make_plan(), history))
    history.append(entry(3, "two_friends_race", "tax"))          # now 3 back, outside the window of 2
    assert not any("template" in p for p in check(make_plan(), history))


def test_template_share_of_last_twenty() -> None:
    others = ["myth_vs_fact", "two_friends_race", "money_leak_meter"]

    def last19(quiz: int) -> list[dict]:
        """19 videos, `quiz` of them short_story, none in the two most recent."""
        return [entry(i, "short_story" if i < quiz else others[i % 3], f"cat{i}") for i in range(19)]

    # with four templates the limit is 37.5% of 20, i.e. 7 videos including the new one
    assert "short_story" in variety.allowed_templates(last19(6), TEMPLATES)
    assert "short_story" not in variety.allowed_templates(last19(7), TEMPLATES)
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


# ---------------- stories and title shapes ----------------

def test_story_is_required_and_must_suit_the_template() -> None:
    plan = make_plan()
    del plan["story"]
    assert any("plan needs a story" in p for p in check(plan, []))
    assert any("can't tell a 'myth_bust' story" in p for p in check(make_plan(template="money_leak_meter", story="myth_bust"), []))
    assert not any("story" in p for p in check(make_plan(story="myth_bust"), []))      # short_story tells any story
    assert any("story must be one of" in p for p in check(make_plan(story="vibes"), []))


def test_same_story_not_in_last_three() -> None:
    history = [entry(1, "myth_vs_fact", "gold"), entry(2, "quiz_countdown", "emi"), entry(3, "two_friends_race", "tax")]
    history[1]["template"] = "money_leak_meter"           # template window passes; the story is what repeats
    history[1]["story"] = "future_value"
    assert any("story 'future_value' was told in the last 3" in p for p in check(make_plan(), history))
    history.append(entry(4, "myth_vs_fact", "fd"))
    history.append(entry(5, "money_leak_meter", "gold"))
    assert not any("story" in p for p in check(make_plan(), history))


def test_older_entries_get_the_story_their_template_tells() -> None:
    assert variety.story_of(entry(1, "money_leak_meter")) == "cost_of_habit"
    assert variety.story_of(entry(1, "myth_vs_fact")) is None           # could have been either of two
    assert variety.story_of({**entry(1, "myth_vs_fact"), "story": "decision_duel"}) == "decision_duel"


def test_projection_stories_are_capped_at_a_quarter_of_the_last_twenty() -> None:
    # 19 earlier videos: `n` projection stories (none of them the plan's), the rest myth busts
    def last19(n: int) -> list[dict]:
        rows = [entry(i, "money_leak_meter" if i % 2 else "two_friends_race", f"c{i}") for i in range(n)]
        rows += [{**entry(i, "myth_vs_fact", f"c{i}"), "story": "myth_bust"} for i in range(n, 19)]
        return rows[::-1]                                    # projection ones oldest, out of the story window
    assert not any("projection" in p for p in check(make_plan(), last19(4)))
    assert any("projection stories" in p for p in check(make_plan(), last19(5)))


def test_the_october_history_would_have_been_stopped() -> None:
    """The 11 Shorts up to 2026-10-17: 8 of them 'what ₹X becomes/costs in N years'."""
    titles = [("myth_vs_fact", "Is an FD really the safest place for ₹5 lakh over 10 years"),
              ("money_leak_meter", "What forgotten OTT and app subscriptions cost over 15 years"),
              ("quiz_countdown", "What a ₹5,000 monthly SIP becomes in 25 years"),
              ("myth_vs_fact", "Is PPF alone enough to build a big retirement fund over 20 years"),
              ("money_leak_meter", "What a daily chai and snack stop costs over 20 years"),
              ("quiz_countdown", "What a one-time ₹2 lakh index fund investment becomes in 15 years"),
              ("two_friends_race", "Neha starts a ₹3,000 SIP at 22 and stops at 32"),
              ("myth_vs_fact", "Does a ₹3 lakh emergency fund in a savings account fall behind"),
              ("money_news", "RBI raises the repo rate: what it means for a fixed deposit saver"),
              ("quiz_countdown", "What ₹8,000 a month put away for retirement becomes in 30 years"),
              ("money_leak_meter", "What three impulse online orders a month cost over 15 years")]
    history = [entry(i, t, f"c{i}", title=title, days_ago=11 - i) for i, (t, title) in enumerate(titles)]
    # another quiz on the same shape: blocked by story (told 2 videos ago) and by shape
    plan = make_plan(topic={"title": "What a ₹12,000 SIP becomes in 18 years", "category": "new_cat"})
    problems = check(plan, history)
    assert any("story 'future_value'" in p for p in problems)
    assert any("topic title has the same shape" in p for p in problems)
    assert variety.allowed_stories(history, TEMPLATES)["money_leak_meter"] == []


def test_title_shape_ignores_numbers_and_subject() -> None:
    a = variety.title_shape("What a ₹5,000 monthly SIP becomes in 25 years")
    b = variety.title_shape("What a one-time ₹2 lakh index fund investment becomes in 15 years")
    assert a == b == "what become in year"
    assert variety.title_shape("What three impulse orders a month cost over 15 years") == "what cost over year"
    # two-word shapes are too generic to judge
    history = [{**entry(1), "title": "Why your SIP feels slow"}]
    assert not any("shape" in p for p in check(make_plan(title="Why your EMI feels heavy right now"), history))
