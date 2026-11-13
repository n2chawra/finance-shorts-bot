import json, re
SRC = {"as_of": "2026-11-13", "source": "YouTube Studio", "url": "https://studio.youtube.com"}
FACTS = [  # fact1..: the channel's own numbers, 13 Oct - 13 Nov 2026
    ("videos the system made", 95, "count"), ("videos published", 59, "count"), ("views, all videos", 15430, "count"),
    ("subscribers", 14, "count"), ("hours watched", 32, "count"), ("views, best Short", 1192, "count"),
    ("views, median Short", 79, "count"), ("agent changes tried", 127, "count"), ("agent changes merged", 103, "count"),
    ("agent changes blocked", 24, "count"), ("videos failed and thrown away", 13, "count"), ("views from the Shorts feed", 93, "percent"),
    ("views on the best day", 1919, "count"), ("viewers who swiped away, worst Short", 76, "percent"),
    ("median views, big-money titles (Oct)", 773, "count"), ("median views, budget titles (Oct)", 118, "count"),
]
facts = [{"label": l, "value": v, "unit": u, **SRC} for l, v, u in FACTS]
LEVELS = ["Setup", "Week one", "The hit", "The crash", "The agents", "Scoreboard"]
beats = []
def ev(say, *words):
    out = {}
    for w in words:
        assert re.search(r"\b" + re.escape(w) + r"\b", say), (w, say)
        out[re.sub(r"[^a-z]", "", w.lower())] = {"word": w}
    return out
def k(w): return re.sub(r"[^a-z]", "", w.lower())
def sfx(*pairs): return [{"kind": a, "at": k(b) if b not in ("start",) else b} for a, b in pairs]
def beat(id, scene, say, words, params, lvl, sounds=(), transition="cut", **extra):
    p = dict(params); p.setdefault("hud", {"level": lvl, "noCounter": True})
    b = {"id": id, "scene": scene, "speaker": "narrator", "transition": transition, "say": say, "events": ev(say, *words), "params": p}
    if sounds: b["sfx"] = sfx(*sounds)
    b.update(extra); beats.append(b)
def build(id, say, words, world, items, actions, lvl, cam=None, sounds=(), transition="match", **extra):
    params = {"world": world, "items": items, "actions": actions,
              "camera": cam or [{"sec": 0, "size": "wide", "on": "all"}, {"at": k(words[-1]), "size": "medium", "on": items[0]["id"], "move": True}]}
    extra.setdefault("role", "build"); beat(id, "build", say, words, params, lvl, sounds, transition, **extra)
def chapter(n, title):
    say = f"Chapter {['one','two','three','four','five','six'][n-1]}. {title}."
    beat(f"ch{n}", "chapter", say, [title.split()[-1]], {"kicker": f"Chapter {['one','two','three','four','five','six'][n-1]}", "title": title}, n, [("whoosh", "start")], "fade")
def typ(id, say, words, lines, bg, prop, lvl, kicker=None, role=None):
    params = {"bg": bg, "prop": prop, "lines": [{"text": t, "at": k(a), "size": sz, **({"strike": k(st)} if st else {})} for t, a, sz, st in lines]}
    if kicker: params["kicker"] = kicker
    beat(id, "type", say, words, params, lvl, [("pop", words[0]), ("whoosh", words[-1])], "match", **({"role": role} if role else {}))
def stats(id, say, words, title, kicker, cards, bg, prop, lvl):
    params = {"title": title, "kicker": kicker, "bg": bg, "prop": prop, "at": k(words[0]),
              "cards": [{"label": l, "text": t, "at": k(a), "color": c} for l, t, a, c in cards]}
    beat(id, "stats", say, words, params, lvl, [("pop", words[0])] + [("pop-high", w) for w in words[1:3]], "cut", role="level")
def it(id, prop, x, size, label=None, hidden=False, **o):
    d = {"id": id, "prop": prop, "x": x, "size": size, **o}
    if label: d["label"] = label
    if hidden: d["hidden"] = True
    return d
def act(at, do, target, **o):
    d = {"do": do, "target": target, **o}
    if at == 0: d["sec"] = 0
    else: d["at"] = k(at)
    return d
OFFICE = {"kind": "office", "tint": "blue"}; NIGHT = {"kind": "night", "tint": "purple"}; CITY = {"kind": "city", "tint": "teal"}; STUDIO = {"kind": "studio", "tint": "gold"}

# ---------------- hook ----------------
s = "Thirty days ago, I gave Claude Code one job: run a YouTube channel for me. No face, no voice, no editing."
typ("hook", s, ["Thirty", "Claude", "YouTube", "face", "editing"],
    [("Thirty days", "Thirty", "small", None), ("Claude Code runs", "Claude", "big", None), ("my YouTube channel", "YouTube", "huge", None), ("No face · no voice", "face", "small", None), ("No editing", "editing", "small", None)],
    "night", "laptop", 1, kicker="An experiment", role="hook")
s = "It wrote the scripts, drew the animation, voiced every line and uploaded three Shorts a day, while I slept."
build("hook2", s, ["scripts", "animation", "voiced", "uploaded", "slept"], NIGHT,
      [it("laptop", "laptop", 0.25, 0.4, "Claude Code"), it("clap", "clapper", 0.55, 0.26, "Animation", True), it("phone", "phone", 0.8, 0.34, "Shorts", True), it("play", "play", 0.55, 0.22, None, True, y=0.3)],
      [act(0, "glow", "laptop"), act("scripts", "grow", "laptop", scale=1.1), act("animation", "enter", "clap"), act("voiced", "shake", "clap"), act("uploaded", "enter", "phone"), act("slept", "enter", "play", how="drop")], 1,
      sounds=[("pop", "scripts"), ("whoosh", "animation"), ("kaching", "uploaded")])
s = "After a month it had made {fact1} videos, earned {fact3} views and {fact4} subscribers."
stats("hook3", s, ["month", "videos", "views", "subscribers"], "Thirty days in", "The result", [("Videos made", "{fact1}", "videos", "blue"), ("Views", "{fact3}", "views", "green"), ("Subscribers", "{fact4}", "subscribers", "orange")], "slate", "chart", 1)
s = "Is that a win or a flop? Stay to the end, because the most useful part is everything that went wrong."
typ("hook4", s, ["win", "flop", "end", "useful", "wrong"],
    [("A win?", "win", "big", None), ("A flop?", "flop", "big", None), ("The useful part", "useful", "small", None), ("What went wrong", "wrong", "huge", None)], "plum", "bug", 1, kicker="Stay to the end", role="tease")
s = "I'll show you the setup, the first week, the hit, the crash, the robots that fix themselves, and the final scoreboard."
beat("promise", "framework", s, ["setup", "week", "hit", "crash", "robots", "scoreboard"],
     {"items": [{"prop": "laptop", "label": "Setup", "at": "setup"}, {"prop": "calendar", "label": "Week one", "at": "week"}, {"prop": "trophy", "label": "The hit", "at": "hit"},
                {"prop": "bug", "label": "The crash", "at": "crash"}, {"prop": "robot", "label": "The agents", "at": "robots"}, {"prop": "chart", "label": "Scoreboard", "at": "scoreboard"}],
      "layout": "steps", "open": 0, "title": "Thirty days", "bg": "night"}, 1, [("pop", "setup"), ("pop", "hit"), ("pop", "robots"), ("ding", "scoreboard")], "whip", role="promise")

# ---------------- 1 setup ----------------
chapter(1, "The setup")
s = "Day one. I opened Claude Code and described the channel I wanted: animated money stories, true facts only, and every number checked by code."
build("s1", s, ["Day", "opened", "described", "animated", "facts", "number"], OFFICE,
      [it("laptop", "laptop", 0.5, 0.42, "Day one"), it("phone", "phone", 0.15, 0.3, "Money stories", True), it("cash", "cash", 0.85, 0.24, "Real facts", True), it("gear", "gear", 0.5, 0.18, None, True, y=0.25)],
      [act(0, "glow", "laptop"), act("opened", "grow", "laptop", scale=1.1), act("animated", "enter", "phone"), act("facts", "enter", "cash"), act("number", "enter", "gear", how="drop")], 1,
      sounds=[("tick", "Day"), ("pop", "animated"), ("ding", "number")])
s = "And I didn't write the code myself. I described what I wanted, and Claude Code wrote it: the renderer, the uploader, the checks, tens of thousands of lines."
build("s1b", s, ["code", "described", "renderer", "uploader", "checks", "thousands"], OFFICE,
      [it("laptop", "laptop", 0.5, 0.42, "Claude Code"), it("clap", "clapper", 0.16, 0.24, "Renderer", True), it("cloud", "cloud", 0.84, 0.24, "Uploader", True), it("shield", "shield", 0.5, 0.16, "Checks", True, y=0.25)],
      [act(0, "glow", "laptop"), act("described", "grow", "laptop", scale=1.1), act("renderer", "enter", "clap"), act("uploader", "enter", "cloud"), act("checks", "enter", "shield", how="drop"), act("thousands", "shake", "laptop")], 1,
      sounds=[("pop", "renderer"), ("pop", "uploader"), ("ding", "checks")], transition="whip")
s = "It built a whole studio. A planner picks the topic, a writer storyboards it, code checks the maths, and a second AI checks every fact."
build("s2", s, ["studio", "planner", "writer", "code", "second"], OFFICE,
      [it("plan", "robot", 0.14, 0.26, "Planner"), it("write", "robot", 0.38, 0.26, "Writer", True), it("check", "gear", 0.62, 0.24, "Number check", True), it("fact", "shield", 0.86, 0.26, "Fact check", True)],
      [act(0, "glow", "plan"), act("planner", "grow", "plan", scale=1.15), act("writer", "enter", "write"), act("code", "enter", "check"), act("second", "enter", "fact", how="drop")], 1,
      sounds=[("pop", "planner"), ("pop", "writer"), ("pop-high", "code"), ("ding", "second")], transition="whip")
s = "Then it draws the animation and an offline voice reads it. No stock footage, no downloaded music. Every frame and every sound is made in code."
build("s3", s, ["draws", "voice", "footage", "music", "frame"], STUDIO,
      [it("clap", "clapper", 0.3, 0.34, "Drawn in code"), it("laptop", "laptop", 0.72, 0.36, "Offline voice", True), it("box", "box", 0.5, 0.18, "No stock", True, state="red")],
      [act(0, "glow", "clap"), act("draws", "shake", "clap"), act("voice", "enter", "laptop"), act("footage", "enter", "box"), act("music", "cross", "box"), act("frame", "grow", "clap", scale=1.12)], 1)
s = "It even invented a cast: Rohan, Priya, Sharma, and a coin called Sikka."
beat("s4", "stage", s, ["cast", "Rohan", "Priya", "Sharma", "Sikka"],
     {"set": "home", "actors": [{"who": "rohan", "x": 0.25, "enter": "left", "acting": [{"at": "rohan", "pose": "wave", "expression": "happy"}]},
                                {"who": "priya", "x": 0.5, "acting": [{"sec": 0, "pose": "stand"}, {"at": "priya", "pose": "point", "expression": "smirk"}]},
                                {"who": "sharma", "x": 0.75, "enter": "right", "acting": [{"at": "sharma", "pose": "hips", "expression": "proud"}]}],
      "sikka": {"x": 0.9, "at": "sikka", "expression": "happy", "cheer": True}}, 1, [("pop", "Rohan"), ("pop", "Priya"), ("pop", "Sharma"), ("ding", "Sikka")], "slide")
s = "Finished videos go up to GitHub, and a scheduler uploads them at three fixed times a day. It all runs in the cloud, on free tiers and one Claude subscription."
build("s5", s, ["GitHub", "scheduler", "three", "cloud", "subscription"], CITY,
      [it("cloud", "cloud", 0.5, 0.36, "The cloud"), it("cal", "calendar", 0.18, 0.28, "Three a day", True), it("play", "play", 0.82, 0.28, "YouTube", True), it("coin", "coin", 0.5, 0.16, "One subscription", True, y=0.3)],
      [act(0, "glow", "cloud"), act("GitHub", "grow", "cloud", scale=1.1), act("scheduler", "enter", "cal"), act("three", "enter", "play"), act("cloud", "flow", "cloud", to="play", n=4), act("subscription", "enter", "coin", how="drop")], 1,
      sounds=[("whoosh", "GitHub"), ("tick", "scheduler"), ("pop", "three"), ("kaching", "subscription")])
s = "It also built me a dashboard, so I can see every video, every upload and every robot's work from my phone."
build("s6", s, ["dashboard", "video", "upload", "robot's", "phone"], STUDIO,
      [it("phone", "phone", 0.5, 0.42, "My dashboard"), it("chart", "chart", 0.18, 0.26, "Every video", True), it("play", "play", 0.82, 0.24, "Every upload", True), it("robot", "robot", 0.5, 0.16, None, True, y=0.25)],
      [act(0, "glow", "phone"), act("video", "enter", "chart"), act("upload", "enter", "play"), act("robot's", "enter", "robot", how="drop"), act("phone", "grow", "phone", scale=1.12)], 1,
      sounds=[("pop", "dashboard"), ("pop", "upload"), ("ding", "phone")])
s = "So I pressed go and went to sleep. Would anyone actually watch?"
typ("t1", s, ["pressed", "sleep", "anyone", "watch"], [("Pressed go", "pressed", "big", None), ("Went to sleep", "sleep", "small", None), ("Would anyone", "anyone", "small", None), ("watch?", "watch", "huge", None)], "teal", "play", 1, kicker="Next · Week one", role="tease")

# ---------------- 2 week one ----------------
chapter(2, "Week one")
s = "Day one was a prototype. Day two, the first Short went live. By the end of the week, it was making videos every single day."
beat("w1", "journey", s, ["prototype", "Short", "week", "every"],
     {"stops": [{"name": "Day one", "note": "Prototype", "at": "prototype"}, {"name": "Day two", "note": "First upload", "at": "short"}, {"name": "Week one", "note": "Daily videos", "at": "week"}, {"name": "Every day", "note": "Three a day", "at": "every"}],
      "traveller": "robot", "bg": "sky"}, 2, [("tick", "prototype"), ("pop", "Short"), ("whoosh", "week")], "slide", role="build")
s = "The first Shorts were about savings, budgets and credit cards. And almost nobody watched them, a few dozen views each."
build("w2", s, ["savings", "budgets", "cards", "nobody", "dozen"], {"kind": "kitchen", "tint": "blue"},
      [it("phone", "phone", 0.5, 0.38, "Budget tips"), it("cash", "cash", 0.2, 0.22, "Savings", True), it("note", "note", 0.8, 0.22, "Credit cards", True), it("chart", "chart", 0.5, 0.18, None, True, y=0.25)],
      [act(0, "glow", "phone"), act("savings", "enter", "cash"), act("cards", "enter", "note"), act("nobody", "shrink", "phone", scale=0.8), act("dozen", "enter", "chart", how="drop")], 2,
      sounds=[("pop", "savings"), ("pop", "cards"), ("fail", "nobody")])
s = "Budget tips are what every channel already makes. Mine were just one more drop in the ocean."
typ("w3", s, ["Budget", "every", "drop", "ocean"], [("Budget tips?", "Budget", "big", None), ("Everyone makes them", "every", "small", None), ("One more drop", "drop", "huge", None)], "coral", "phone", 2)
s = "Then one topic broke through. Billionaires."
beat("w4", "case", s, ["topic", "Billionaires"], {"kicker": "The breakthrough", "name": "Billionaires", "line": "The topic that broke through", "prop": "trophy", "at": "billionaires", "lineAt": "billionaires", "bg": "night"}, 2, [("riser", "topic"), ("boom", "Billionaires")], "zoom")
s = "And that one topic changed the whole plan."
typ("t2", s, ["one", "changed", "plan"], [("One topic", "one", "big", None), ("changed", "changed", "small", None), ("the whole plan", "plan", "huge", None)], "plum", "trophy", 2, kicker="Next · The hit", role="tease")

# ---------------- 3 the hit ----------------
chapter(3, "The hit")
s = "The best Short asked why billionaires can't just pay a small tax. It reached {fact6} views."
beat("h1", "headline", s, ["billionaires", "tax", "reached", "views"], {"kicker": "THE BEST SHORT", "title": "Why can't billionaires just pay a tax?", "figure": "{fact6}", "figureAt": "views", "label": "Views"}, 3,
     [("pop", "billionaires"), ("kaching", "views")], "zoom", role="build")
s = "And it wasn't alone. Why billionaires never sell their stock, what a billion looks like in hundred dollar bills: every Short past a thousand views was about huge sums of money."
build("h2", s, ["alone", "stock", "billion", "thousand", "money"], CITY,
      [it("trophy", "trophy", 0.5, 0.36, "Best Shorts"), it("cash", "cash", 0.2, 0.26, "Never sell", True), it("stack", "cash", 0.8, 0.26, "A billion", True), it("phone", "phone", 0.5, 0.18, None, True, y=0.25)],
      [act(0, "glow", "trophy"), act("stock", "enter", "cash"), act("billion", "enter", "stack"), act("thousand", "grow", "trophy", scale=1.15), act("money", "multiply", "stack", n=3)], 3,
      sounds=[("pop", "stock"), ("pop", "billion"), ("ding", "thousand"), ("kaching", "money")])
s = "The numbers were clear. Big money titles had a median of {fact15} views. Personal budget titles, just {fact16}."
stats("h3", s, ["numbers", "Big", "median", "budget"], "October, by topic", "Median views", [("Big money", "{fact15}", "Big", "green"), ("Personal budget", "{fact16}", "budget", "red")], "cream", "trophy", 3)
s = "The audience surprised me too. Stories about one country stayed small. Stories about famous people and companies travelled all over the world."
build("h3b", s, ["audience", "country", "small", "famous", "world"], CITY,
      [it("cloud", "cloud", 0.5, 0.36, "The whole world"), it("note", "note", 0.18, 0.22, "One country", True), it("trophy", "trophy", 0.82, 0.28, "Famous names", True)],
      [act(0, "glow", "cloud"), act("country", "enter", "note"), act("small", "shrink", "note", scale=0.7), act("famous", "enter", "trophy"), act("world", "grow", "cloud", scale=1.15)], 3,
      sounds=[("pop", "country"), ("fail", "small"), ("ding", "famous")], transition="whip")
s = "Its best day brought in {fact13} views. So the system rewrote its own rules: big money first, global stories, and Shorts under thirty five seconds."
build("h4", s, ["day", "views", "rewrote", "money", "global", "seconds"], OFFICE,
      [it("chart", "chart", 0.5, 0.4, "Best day"), it("robot", "robot", 0.18, 0.28, "New rules", True), it("cash", "cash", 0.82, 0.24, "Big money", True), it("cal", "calendar", 0.5, 0.18, "Short and fast", True, y=0.25)],
      [act(0, "glow", "chart"), act("views", "grow", "chart", scale=1.15), act("rewrote", "enter", "robot"), act("money", "enter", "cash"), act("seconds", "enter", "cal", how="drop")], 3,
      sounds=[("kaching", "views"), ("whoosh", "rewrote"), ("pop", "money")])
s = "It felt like the channel had found its thing. Then the views fell off a cliff."
typ("t3", s, ["felt", "thing", "fell", "cliff"], [("Found its thing", "thing", "big", None), ("Then", "fell", "small", None), ("off a cliff", "cliff", "huge", None)], "slate", "chart", 3, kicker="Next · The crash", role="tease")

# ---------------- 4 the crash ----------------
chapter(4, "The crash")
s = "In early November, views dropped by about nine in ten. The median Short got just {fact7} views."
build("c1", s, ["November", "dropped", "nine", "median", "views"], NIGHT,
      [it("chart", "chart", 0.5, 0.4, "Views"), it("bug", "bug", 0.2, 0.24, "Something broke", True), it("phone", "phone", 0.8, 0.26, "The median Short", True)],
      [act(0, "glow", "chart"), act("dropped", "shrink", "chart", scale=0.6), act("nine", "shake", "chart"), act("median", "enter", "phone"), act("views", "enter", "bug", how="drop")], 4,
      sounds=[("fail", "dropped"), ("boom", "nine"), ("pop", "median")])
s = "YouTube Studio told me why. On the worst Short, {fact14} of the people it was shown to swiped away, most of them in the very first second."
stats("c2", s, ["YouTube", "worst", "swiped", "second"], "Why it dropped", "The first second", [("Swiped away", "{fact14}", "swiped", "red"), ("From the feed", "{fact12}", "second", "blue")], "coral", "phone", 4)
s = "And things broke. {fact11} videos failed the checks and were thrown away. One night GitHub skipped the uploads for nine hours, and a slot went empty."
build("c3", s, ["broke", "failed", "thrown", "GitHub", "hours", "empty"], NIGHT,
      [it("bug", "bug", 0.5, 0.36, "Bugs"), it("shield", "shield", 0.18, 0.28, "Failed checks", True, state="red"), it("cal", "calendar", 0.82, 0.28, "Empty slot", True), it("box", "box", 0.5, 0.16, None, True, y=0.25)],
      [act(0, "glow", "bug"), act("broke", "shake", "bug"), act("failed", "enter", "shield"), act("thrown", "enter", "box", how="drop"), act("GitHub", "enter", "cal"), act("empty", "shake", "cal")], 4,
      sounds=[("fail", "broke"), ("pop", "failed"), ("boom", "empty")])
s = "Long videos were even harder. One of them was shown to a hundred people, and only four clicked."
build("c3b", s, ["Long", "harder", "hundred", "four"], STUDIO,
      [it("laptop", "laptop", 0.5, 0.4, "A long video"), it("play", "play", 0.2, 0.22, "Shown", True), it("bug", "bug", 0.82, 0.2, "Few clicks", True)],
      [act(0, "glow", "laptop"), act("harder", "shake", "laptop"), act("hundred", "enter", "play"), act("four", "enter", "bug", how="drop")], 4,
      sounds=[("pop", "hundred"), ("fail", "four")])
s = "That's the thing about an automated channel. It doesn't fail loudly. It fails quietly, at three in the morning."
typ("c4", s, ["automated", "loudly", "quietly", "morning"], [("An automated channel", "automated", "small", None), ("fails loudly", "loudly", "big", "quietly"), ("fails quietly", "quietly", "huge", None), ("at three in the morning", "morning", "small", None)], "night", "bug", 4)
s = "So I gave it something most channels don't have: a team of robots that fixes itself."
typ("t4", s, ["gave", "channels", "robots", "itself"], [("Most channels don't have", "channels", "small", None), ("a team of robots", "robots", "big", None), ("that fixes itself", "itself", "huge", None)], "teal", "robot", 4, kicker="Next · The agents", role="tease")

# ---------------- 5 the agents ----------------
chapter(5, "The agents")
s = "Every night, eight AI agents wake up. An auditor checks every number against YouTube. A researcher finds what people are watching this week."
build("a1", s, ["night", "eight", "auditor", "researcher", "week"], NIGHT,
      [it("aud", "robot", 0.2, 0.3, "Auditor"), it("res", "robot", 0.5, 0.3, "Researcher", True, state="green"), it("lap", "laptop", 0.8, 0.28, "YouTube data", True), it("chart", "chart", 0.5, 0.16, None, True, y=0.25)],
      [act(0, "glow", "aud"), act("eight", "multiply", "aud", n=2), act("auditor", "grow", "aud", scale=1.12), act("researcher", "enter", "res"), act("week", "enter", "lap")], 5,
      sounds=[("tick", "night"), ("pop", "auditor"), ("pop", "researcher")])
s = "An improver tests one change at a time on half the Shorts, and keeps it only if viewers stay longer. A reviewer watches our own videos frame by frame and writes down every mistake."
build("a2", s, ["improver", "half", "keeps", "reviewer", "frame", "mistake"], OFFICE,
      [it("imp", "robot", 0.25, 0.32, "Improver", state="green"), it("phone", "phone", 0.5, 0.28, "Half the Shorts", True), it("rev", "robot", 0.78, 0.3, "Reviewer", True), it("clap", "clapper", 0.5, 0.16, None, True, y=0.25)],
      [act(0, "glow", "imp"), act("half", "enter", "phone"), act("keeps", "tick", "phone"), act("reviewer", "enter", "rev"), act("frame", "enter", "clap", how="drop"), act("mistake", "stamp", "clap")], 5,
      sounds=[("pop", "improver"), ("ding", "keeps"), ("pop", "reviewer")], transition="whip")
s = "And no agent can change anything on its own. A guard checks every edit first, and runs the tests."
build("a3", s, ["agent", "own", "guard", "edit", "tests"], CITY,
      [it("shield", "shield", 0.5, 0.4, "The guard"), it("robot", "robot", 0.2, 0.28, "An agent"), it("bug", "bug", 0.82, 0.22, "A bad edit", True)],
      [act(0, "glow", "shield"), act("own", "shake", "robot"), act("guard", "grow", "shield", scale=1.15), act("edit", "enter", "bug"), act("tests", "cross", "bug")], 5,
      sounds=[("pop", "guard"), ("fail", "tests")])
s = "In thirty days the agents tried {fact8} changes to their own system. The guard let {fact9} through and blocked {fact10}."
stats("a4", s, ["thirty", "tried", "through", "blocked"], "Agents fixing the system", "Thirty days", [("Changes tried", "{fact8}", "tried", "blue"), ("Merged", "{fact9}", "through", "green"), ("Blocked", "{fact10}", "blocked", "red")], "sand", "shield", 5)
s = "So after thirty days, here's the honest scoreboard."
typ("t5", s, ["after", "honest", "scoreboard"], [("Thirty days later", "after", "small", None), ("The honest", "honest", "big", None), ("scoreboard", "scoreboard", "huge", None)], "plum", "chart", 5, kicker="Next · Scoreboard", role="tease")

# ---------------- 6 scoreboard ----------------
chapter(6, "Scoreboard")
s = "Altogether, my faceless channel got {fact3} views."
beat("r1", "headline", s, ["Altogether", "faceless", "views"], {"kicker": "THIRTY DAYS", "title": "Total views, every video", "figure": "{fact3}", "figureAt": "views", "label": "Views"}, 6,
     [("riser", "Altogether"), ("kaching", "views")], "zoom", role="turn")
s = "The system made {fact1} videos and published {fact2}. They were watched for {fact5} hours and brought in {fact4} subscribers."
stats("r2", s, ["made", "published", "watched", "subscribers"], "The scoreboard", "Thirty days", [("Made", "{fact1}", "made", "blue"), ("Published", "{fact2}", "published", "green"), ("Hours watched", "{fact5}", "watched", "orange"), ("Subscribers", "{fact4}", "subscribers", "purple")], "night", "trophy", 6)
s = "So, a win or a flop? Honestly, both. As a channel, it is still tiny. As a machine that makes, checks and improves its own videos every single day, it is the most interesting thing I have ever built."
typ("verdict", s, ["win", "flop", "both", "tiny", "machine", "built"], [("A win or a flop?", "win", "small", None), ("Both", "both", "huge", None), ("A tiny channel", "tiny", "small", "machine"), ("An amazing machine", "machine", "big", None)], "night", "robot", 6, kicker="The verdict")
s = "Lesson one: automation makes videos. It does not make people care."
typ("l1", s, ["automation", "videos", "care"], [("Lesson one", "automation", "small", None), ("Automation makes videos", "videos", "big", None), ("not people care", "care", "huge", None)], "coral", "gear", 6, kicker="What I learned")
s = "Lesson two: the topic is the whole game. Big money beat budget tips every single time."
build("l2", s, ["topic", "game", "money", "budget", "time"], CITY,
      [it("trophy", "trophy", 0.3, 0.34, "Big money"), it("phone", "phone", 0.72, 0.28, "Budget tips", True), it("cash", "cash", 0.3, 0.18, None, True, y=0.25)],
      [act(0, "glow", "trophy"), act("game", "grow", "trophy", scale=1.12), act("money", "enter", "cash"), act("budget", "enter", "phone"), act("time", "shrink", "phone", scale=0.8)], 6,
      sounds=[("pop", "topic"), ("kaching", "money"), ("fail", "budget")])
s = "Lesson three: the first second decides everything. {fact12} of my views came from the Shorts feed, where people swipe in a heartbeat."
build("l3", s, ["second", "everything", "feed", "swipe", "heartbeat"], STUDIO,
      [it("phone", "phone", 0.5, 0.4, "The Shorts feed"), it("play", "play", 0.2, 0.22, "First second", True), it("bug", "bug", 0.8, 0.2, "Swipe", True)],
      [act(0, "glow", "phone"), act("second", "enter", "play"), act("feed", "grow", "phone", scale=1.12), act("swipe", "enter", "bug"), act("heartbeat", "shake", "phone")], 6,
      sounds=[("tick", "second"), ("whoosh", "swipe")])
s = "And lesson four: measure, don't guess. Every rule this channel follows today came from its own numbers."
typ("l4", s, ["measure", "guess", "rule", "numbers"], [("Measure", "measure", "huge", None), ("don't guess", "guess", "big", None), ("Every rule came from", "rule", "small", None), ("its own numbers", "numbers", "big", None)], "teal", "chart", 6)
s = "Next, it learns from videos I pick myself, and tests one change a week. I'll show you how that goes."
build("n1", s, ["learns", "pick", "tests", "week", "show"], OFFICE,
      [it("laptop", "laptop", 0.5, 0.38, "Next month"), it("robot", "robot", 0.2, 0.28, "Learns", True, state="green"), it("cal", "calendar", 0.8, 0.26, "One change a week", True)],
      [act(0, "glow", "laptop"), act("learns", "enter", "robot"), act("tests", "enter", "cal"), act("week", "tick", "cal"), act("show", "grow", "laptop", scale=1.1)], 6,
      sounds=[("pop", "learns"), ("ding", "week")], role="payoff")
s = "And if you want to try this yourself, start with the topic, not the tools. The tools are the easy part now."
typ("advice", s, ["try", "topic", "tools", "easy"], [("Try it yourself?", "try", "small", None), ("Start with the topic", "topic", "big", None), ("not the tools", "tools", "small", None), ("The tools are easy now", "easy", "huge", None)], "teal", "laptop", 6, kicker="My advice")
s = "Would you let AI run your channel? Tell me in the comments."
beat("end", "end", s, ["AI", "channel", "comments"], {"cta": "Would you let AI run your channel? Comment below", "follow": "Follow for the next thirty days",
     "assumption": "Numbers from YouTube Studio and my own dashboard, mid November"}, 6, [("ding", "comments")], "fade", role="end")

script = {"id": "P-30days", "format": "long", "template": "long_story", "seed": 3030, "narrator": "am_michael", "currency": "USD",
          "style": {"palette": "night", "genre": "synthwave", "key": "D", "bpm": 104},
          "structure": {"levels": LEVELS}, "facts": facts, "maths": [], "beats": beats,
          "thumbnail": {"layout": "scene", "at": "hook3", "sec": 3.0, "words": "*Claude* ran my channel", "figure": "{fact3}", "tag": "Views in thirty days", "angle": "number", "who": "rohan"}}
json.dump(script, open("/home/user/finance-shorts-bot/videos/P-30days/script.json", "w"), indent=1, ensure_ascii=False)
words = sum(len(b["say"].split()) for b in beats)
print(len(beats), "beats,", words, "words, ~", round(words / 180 * 60), "s at 180 wpm")
