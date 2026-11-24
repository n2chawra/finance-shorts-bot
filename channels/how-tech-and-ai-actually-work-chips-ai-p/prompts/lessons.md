# Lessons from our own videos

Each lesson is a mistake that cost viewers, written by the reviewer (agents/reviewer.md) from where viewers
left. The writer follows them and QA enforces them. A new channel starts with channel #1's general ones.

## 1. The second line answers; it never asks again (How Tech Works)
Seen in: all four Shorts with a curve lost their biggest share at 5–8 s; in three, that line asked the question
again instead of showing the answer. Transistor v-20261121-21, 6.2 s: "The transistor. What did the very
first one look like?" over rows of generic purple blocks, 106% → 83% (−23 points). Hoover Dam v-20261120-01: "Why does
the height of a lake matter?" at 3.5 s, then "...So how does water make power?" at 7.5 s, 102% → 83% (−18.5 points);
stayed to watch 47.4%, 10.5 points under the channel's 57.9% median. Even Crossrail v-20261122-21 lost 15.4 points at
5.6 s on "How?" before the machine.
Fix: the hook asks the one question; the next line starts showing its answer with the real thing moving on screen
(the intake, the contacts on the germanium, the cutting wheel). No second question, no "So how…?", no "What did…?",
before 10 s; at most one bare word ("How?") said in the same breath as the answer.

## 2. The first frame names the subject (general)
Seen in: channel #1's first month, 55–76% swiped away when the title and first second held the subject back.
Fix: the title and the first spoken sentence name who or what the video is about.

## 3. Only what is true (general)
Seen in: channel #1, invented examples lost to real, named stories.
Fix: a true channel tells sourced facts about real, named people or things; a fiction channel says so.

## 4. No reaction shots (general)
Seen in: channel #1, shots of a character reacting were where viewers left.
Fix: every picture shows the thing being said.

## 5. The payoff is the most surprising fact (general)
Fix: hold the most surprising figure or fact for the payoff, and make the last line loop into the first.

## 6. Narration is never slow (general)
Seen in: the owner's notes on How Tech Works (Shorts), Disaster Desk (long) and Rise & Fall: "increase the pace".
Fix: no channel's narrator speaks under about 164 words a minute in a Short or 189 in a long video (generator/pack.py MIN_SPEED enforces it).

## 7. Show what happens, not only the count (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: "only showing death counts is not enough. Make that scenes."
Fix: when a line says what happened to people or things, the beat shows it happening in the place (the crowd under the walkway, the cars on the bridge), never gory (director.md).

## 8. Every picture once (general)
Seen in: Rise & Fall, 20 Nov: "the same 3 sneaker photos reused and almost no effects" (two Shorts marked stale).
Fix: a photo or picture is in one beat of a Short (the loop beat may repeat the first), two of a long video at most; the code check fails a repeat (renderer/remotion.py picture_once_problems).

## 9. A named place, company or person shows its real mark (general)
Seen in: Geography's Russia Short, 23 Nov: "Where is the flag of Russia??" (its area grew in plain red); earlier notes on the first finance channel's Shorts.
Fix: a country on the map shows its flag (the code check fails a map video whose named country never gets one), a company its logo, a person their photo head.

## 10. A long video's first sentence states the stakes (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: the hook was "good only for people who want to see the full video".
Fix: the first sentence says the small cause and how big it got, in plain words (agents/studio.md); the title stays free of it.
