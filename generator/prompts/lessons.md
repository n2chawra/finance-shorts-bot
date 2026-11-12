# Lessons from our own videos

What was wrong in Shorts we already published, found by watching them frame by frame next to their
numbers. The writer reads this before every script and the QA reviewer rejects a video that repeats
one. Kept up to date by the reviewer agent (`agents/reviewer.md`, twice a week): new lessons go on
top, each with the video it came from, the number that shows it and the fix. At most 20 lessons; when
a new one would make 21, the oldest that no recent video repeats is dropped.

## 1. The first frame names nobody (2026-11-12, owner review)
Seen in: "Why can't billionaires just pay a 5% tax?" (v-20261024-01), "Your $20,000 savings"
(v-20261023-01), "The $10 gym" (v-20261105-06). They opened on "Why can't they just pay?", "Rich people
never let cash sleep" and a building labelled "GYM": no real person, no real company. 55–76% of the
people shown them swiped away.
Fix: the first frame and the first sentence name the real person or business and the surprising figure.

## 2. The real story arrives at 5 seconds (2026-11-12, owner review)
Seen in: the 5% tax Short's hook (California's one-time 5% billionaire tax) came in its second line,
at 5.3 s, where 26% of the viewers still watching left. The five Shorts that stopped at about 1,150
views all lost 24–31% of their viewers at 5–6 s, on lines like "Four levels to get there…" and
"Making charges. An assumed 10% on top…".
Fix: the most specific, surprising fact is in the first sentence; the second sentence adds a bigger
surprise, never an explanation, a setup or a count of what is coming.

## 3. Made-up examples (2026-11-12, owner review)
Seen in: "On an illustrative billionaire" (v-20261024-01), "Say only 300 members ever walk through the
door" (v-20261105-06). 4 shares on 14,500 views across the channel: nobody passes on a story the video
admits it invented.
Fix: tell what really happened, from sourced facts (now a hard rule in `generator/story.py`).

## 4. Reaction shots (2026-11-12, owner review)
Seen in: full-frame cartoon faces saying "EASY." (18 s) and "HE'S SHORT" (24 s) in v-20261024-01, and
"WHAT?" at 2.5 s in v-20261023-01, inside the seconds the viewer decides in.
Fix: every beat shows the thing or the figure the line is about.

## 5. A textbook payoff (2026-11-12, owner review)
Seen in: "Your $20,000 savings" ended on $20,815 in a savings account against $29,605 at an assumed 4%:
a compound-interest lesson most viewers already know. Its viewers who stayed rewatched it (end hold
145%), but 73% had swiped at the start and nobody shared it.
Fix: end on the story's most surprising true figure, the one worth sending to a friend.

## 6. Empty and labelled-object frames (2026-11-12, owner review)
Seen in: v-20261105-06 at 11 s (a small figure beside a couch in a dark, empty scene) and 18 s (a door
labelled "The door").
Fix: one big thing filling the frame, drawn so it needs no label.
