# Lessons from our own videos

What was wrong in Shorts we already published, found by watching them frame by frame next to their
numbers. The writer reads this before every script and the QA reviewer rejects a video that repeats
one. Kept up to date by the reviewer agent (`agents/reviewer.md`, twice a week): new lessons go on
top, each with the video it came from, the number that shows it and the fix. At most 20 lessons; when
a new one would make 21, the oldest that no recent video repeats is dropped.

## 1. The second line widens or rescales the hook (2026-11-20, reviewer)
Seen in: "MrBeast made $300M in one year" (v-20261113-01) followed its hook with "Forbes' top creators
made $1.02B in all." at 3.6-7.0 s, on a full-frame text card with no picture, and 38 points of the
audience left at 5.3 s, the biggest single drop of the 12 Shorts the reviewer has watched; the
five other creators then dribbled out one by one (−8 at 9.6 s, −7 at 14.3 s). "The Las Vegas Strip
keeps $16,772 every minute" (v-20261114-03, directed) went on "How big does that get? Every hour, about
$1M." over a cashier in a cage beside an hourglass, with no figure in the 5 s frame, and lost 26 points
at 6.5 s, then 14 more at 10.5 s on "Every day, an armored truck's worth: $24.2M." Viewers can multiply
by 60 themselves; a total of a whole list is a different, bigger subject than the one they clicked.
Fix: the line after the hook tells the next, bigger fact about the same person or business ("And a
plastic card covered 64% of it", Costco, the best holder at 48% stayed to watch). Never a list's total,
never the hook's figure in bigger units, never the expected baseline (`story.second_line_problems`
fails these since 2026-11-16; both Shorts were made before it).

## 2. The real story arrives at 5 seconds (2026-11-12, owner review)
Seen in: the 5% tax Short's hook (California's one-time 5% billionaire tax) came in its second line,
at 5.3 s, where 26% of the viewers still watching left. The five Shorts that stopped at about 1,150
views all lost 24–31% of their viewers at 5–6 s, on lines like "Four levels to get there…" and
"Making charges. An assumed 10% on top…".
Fix: the most specific, surprising fact is in the first sentence; the second sentence adds a bigger
surprise, never an explanation, a setup or a count of what is coming.
Also seen in (2026-11-13, reviewer; all made before this lesson was written): v-20261109-02 lost 29%
at 5.0 s, v-20261104-01 lost 21% at 5.3 s and v-20261105-06 lost 25% at 5.3 s, each on a setup line
in the second beat ("His 13 NBA seasons paid him…", "Saudi Arabia planned The Line…", "Rohan pays $10
a month, like 6,000 gym members."). The one Short of the six that opened on a name and put a surprise
in its second line (v-20261110-02, MrBeast: "his video business lost almost $80M") had the best
stayed to watch, 60% (on only 10 analytics views so far).
Repeated after this lesson was written (2026-11-20, reviewer): v-20261113-01 (made 13 Nov) lost 38
points at 5.3 s on a wider total, v-20261114-03 (made 14 Nov) 26 points at 6.5 s on the hook rescaled
(lesson 1). The code check that now blocks both shapes landed on 16 Nov, so no owner notification;
the 17 Nov Shorts still lost 19-33 points at 5.3-5.4 s on second lines that pass it (gas stations,
Disneyland, the Powerball winner), so watch this beat in the next review.

## 3. The title gave the answer away (2026-11-16, owner review)
Seen in: "Netflix spent $17.1B on new shows and still kept $11B" (v-20261113-03) put its first two lines
in the title, and 33% of the viewers still watching left at 5.9 s, on the second line ("And it still
kept $11B"): they had already read it. "Costco's profit was $9.23B. The card paid 64% of it"
(v-20261114-02) said its 64% payoff at 2.4 s. Of 20 money Shorts at 160K-9.6M views this week, none
stated its answer in the title; 13 asked a question ("Why Costco's hotdog is only $1.50", 624K).
Fix: the title and the first line name the subject and ask the question; the payoff's figure is said
only in the payoff. One figure in a title at most, and never the payoff's (`story.title_reveal_problems`).

## 4. A finance word at 5 seconds (2026-11-16, owner review)
Seen in: "Apple keeps 76% of every dollar you pay for its services" (v-20261112-01) lost 27% at 5.1 s on
"services" and 18% more at 9.2 s on its revenue line (76 views). The US-debt Short (v-20261114-01) said
"Treasury bills and bonds"; the Elon pay-deal Short "Shareholders voted him…" (v-20261110-01, 14 views).
Fix: plain words a stranger uses: keeps, takes home, pays, owes, owns. Never "revenue", "operating
income", "Treasury", "net worth", "margin" (`number-check` fails one on the second line).

## 5. The ordinary figure before the big one (2026-11-13, reviewer)
Seen in: "The basketball star who got rich off the court" (v-20261109-02): its second line, at 3.8–5.0 s,
was "His 13 NBA seasons paid him about $40M" over a card with a blank grey avatar where Magic Johnson's
face should be, and 29% of the viewers still watching left at 5.0 s, the biggest single drop of the
six Shorts reviewed. The figure people came for ($1.6B) arrived only at 8 s. "Saudi Arabia planned a
170 km city" (v-20261104-01) did the same: "planned The Line, one straight city 170 kilometres long"
at 5.3 s lost 21%, and the twist (only 2.4 km, 1.4%, then on hold) waited until 22.9 s.
Fix: the second sentence is never the expected baseline (a salary, a plan, a budget); it is the twist
figure or a bigger surprise, and the baseline comes later only as the contrast.

## 6. Empty and labelled-object frames (2026-11-12, owner review; raised 2026-11-20)
Seen in: v-20261105-06 at 11 s (a small figure beside a couch in a dark, empty scene) and 18 s (a door
labelled "The door").
Fix: one big thing filling the frame, drawn so it needs no label.
Also seen in (2026-11-20, reviewer): "Costco's profit was $9.23B" (v-20261114-02, made after this
lesson) lost 18 points at 7.1 s on "Not the groceries. So where does all the cart money go?" while the
picture was a shopping cart under a name sign reading "ROHAN" above a parking lot of blank coloured
rectangles: a label and a cast member's name instead of the thing. Its other places (the warehouse with
the $9.23B pallet, the 64% painted on that pallet at the payoff) held.

## 7. The first frame names nobody (2026-11-12, owner review)
Seen in: "Why can't billionaires just pay a 5% tax?" (v-20261024-01), "Your $20,000 savings"
(v-20261023-01), "The $10 gym" (v-20261105-06). They opened on "Why can't they just pay?", "Rich people
never let cash sleep" and a building labelled "GYM": no real person, no real company. 55–76% of the
people shown them swiped away.
Fix: the first frame and the first sentence name the real person or business and the surprising figure.
Also seen in (2026-11-13, reviewer): "You think splitting one fortune makes everyone rich?"
(v-20261110-03) lost 27% at 1.2 s and "You think money builds any city?" (v-20261104-01) lost 13% at
1.4 s, while "Basketball made Magic Johnson a billionaire?" (v-20261109-02), the one of the three
that named a person, lost 10%.

## 8. Made-up examples (2026-11-12, owner review)
Seen in: "On an illustrative billionaire" (v-20261024-01), "Say only 300 members ever walk through the
door" (v-20261105-06). 4 shares on 14,500 views across the channel: nobody passes on a story the video
admits it invented.
Fix: tell what really happened, from sourced facts (now a hard rule in `generator/story.py`).
Also seen in (2026-11-13, reviewer): "Say a billionaire has $200.00B" (v-20261110-03, a billionaire
with no name; 27% gone in the first 1.2 s and stayed to watch 35%, at the channel median, with 0
shares on 922 views); "At an assumed rate, it earns $15.10B a year" (v-20261111-02, no numbers yet).

## 9. Reaction shots (2026-11-12, owner review)
Seen in: full-frame cartoon faces saying "EASY." (18 s) and "HE'S SHORT" (24 s) in v-20261024-01, and
"WHAT?" at 2.5 s in v-20261023-01, inside the seconds the viewer decides in.
Fix: every beat shows the thing or the figure the line is about.

## 10. A textbook payoff (2026-11-12, owner review)
Seen in: "Your $20,000 savings" ended on $20,815 in a savings account against $29,605 at an assumed 4%:
a compound-interest lesson most viewers already know. Its viewers who stayed rewatched it (end hold
145%), but 73% had swiped at the start and nobody shared it.
Fix: end on the story's most surprising true figure, the one worth sending to a friend.

## 11. Narration is never slow (general)
Seen in: the owner's notes on How Tech Works (Shorts), Disaster Desk (long) and Rise & Fall: "increase the pace".
Fix: no channel's narrator speaks under about 164 words a minute in a Short or 189 in a long video (generator/pack.py MIN_SPEED enforces it).

## 12. Show what happens, not only the count (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: "only showing death counts is not enough. Make that scenes."
Fix: when a line says what happened to people or things, the beat shows it happening in the place (the crowd under the walkway, the cars on the bridge), never gory (director.md).

## 13. Every picture once (general)
Seen in: Rise & Fall, 20 Nov: "the same 3 sneaker photos reused and almost no effects" (two Shorts marked stale).
Fix: a photo or picture is in one beat of a Short (the loop beat may repeat the first), two of a long video at most; the code check fails a repeat (renderer/remotion.py picture_once_problems).

## 14. A named place, company or person shows its real mark (general)
Seen in: Geography's Russia Short, 23 Nov: "Where is the flag of Russia??" (its area grew in plain red); Paisa Panchayat's Squid Game and Apple/Google notes.
Fix: a country on the map shows its flag (the code check fails a map video whose named country never gets one), a company its logo, a person their photo head.

## 15. A long video's first sentence states the stakes (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: the hook was "good only for people who want to see the full video".
Fix: the first sentence says the small cause and how big it got, in plain words (agents/studio.md); the title stays free of it.
