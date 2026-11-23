# Lessons from our own videos

Each lesson is a mistake that cost viewers, written by the reviewer (agents/reviewer.md) from where viewers
left. The writer follows them and QA enforces them. A new channel starts with channel #1's general ones.

## 1. The first frame names the subject (general)
Seen in: channel #1's first month, 55–76% swiped away when the title and first second held the subject back.
Fix: the title and the first spoken sentence name who or what the video is about.

## 2. Only what is true (general)
Seen in: channel #1, invented examples lost to real, named stories.
Fix: a true channel tells sourced facts about real, named people or things; a fiction channel says so.

## 3. No reaction shots (general)
Seen in: channel #1, shots of a character reacting were where viewers left.
Fix: every picture shows the thing being said.

## 4. The payoff is the most surprising fact (general)
Fix: hold the most surprising figure or fact for the payoff, and make the last line loop into the first.

## 5. Narration is never slow (general)
Seen in: the owner's notes on How Tech Works (Shorts), Disaster Desk (long) and Rise & Fall: "increase the pace".
Fix: no channel's narrator speaks under about 164 words a minute in a Short or 189 in a long video (generator/pack.py MIN_SPEED enforces it).

## 6. Show what happens, not only the count (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: "only showing death counts is not enough. Make that scenes."
Fix: when a line says what happened to people or things, the beat shows it happening in the place (the crowd under the walkway, the cars on the bridge), never gory (director.md).

## 7. Every picture once (general)
Seen in: Rise & Fall, 20 Nov: "the same 3 sneaker photos reused and almost no effects" (two Shorts marked stale).
Fix: a photo or picture is in one beat of a Short (the loop beat may repeat the first), two of a long video at most; the code check fails a repeat (renderer/remotion.py picture_once_problems).

## 8. A named place, company or person shows its real mark (general)
Seen in: Geography's Russia Short, 23 Nov: "Where is the flag of Russia??" (its area grew in plain red); earlier notes on the first finance channel's Shorts.
Fix: a country on the map shows its flag (the code check fails a map video whose named country never gets one), a company its logo, a person their photo head.

## 9. A long video's first sentence states the stakes (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: the hook was "good only for people who want to see the full video".
Fix: the first sentence says the small cause and how big it got, in plain words (agents/studio.md); the title stays free of it.
