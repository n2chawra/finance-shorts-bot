# Lessons from our own videos

Each lesson is a mistake that cost viewers, written by the reviewer (agents/reviewer.md) from where viewers
left. The writer follows them and QA enforces them. A new channel starts with channel #1's general ones.

## 1. The second line shows the machine: no second question, no date or backstory first (How Tech Works)
Seen in: six of seven Shorts with a curve lost their biggest share at 5–8 s, on the line after the hook, whenever
that line was not the thing working. Re-asked question: transistor v-20261121-21, 6.2 s, "The transistor. What did
the very first one look like?" over generic purple blocks, −23 points; Hoover Dam v-20261120-01, 7.5 s, "...So how does
water make power?", −18.5 points (stayed 47.4%). Date or backstory (added 27 Nov): microwave v-20261119-01, 7.5 s,
"In 1945, radar engineer Percy Spencer...", −29.6 points; Motorola brick v-20261123-21, 5.5 s, "Its engineers had just
6 weeks to build one, to show America's phone regulators." over an empty pegboard and a blank calendar, −19 points,
stayed 47.2% (10.4 under the 57.6% median); Paris Metro v-20261124-21, 6.1 s, "Paris first tried it in 1951. So what
keeps it on the track?" over a "1951" board on the platform, −20.9 points (a date and a re-asked question). NVIDIA
v-20261125-21 (made after this lesson) opened line 2 on a count, "Its chip packed about 250K transistors...", −13.9 points.
Even Crossrail v-20261122-21 lost 15.4 points at 5.6 s on "How?" before the machine.
Fix: the hook asks the one question or states the surprise; the next line, by about 6 s, shows its answer with the
real thing moving on screen (the intake, the contacts on the germanium, the cutting wheel, the tyre on its track).
Before 10 s: no second question ("So how…?", "What did…?", "So what keeps…?"), no year, deadline, inventor backstory,
record or count; those come after the mechanism. At most one bare word ("How?") said in the same breath as the answer.

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
