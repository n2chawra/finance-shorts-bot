# Lessons from our own videos

Each lesson is a mistake that cost viewers, written by the reviewer (agents/reviewer.md) from where viewers
left. The writer follows them and QA enforces them. A new channel starts with channel #1's general ones.

## 1. The second beat gives the first answer, not a setup (new, 28 Nov 2026)
Seen in: all three Shorts with drop points lose their steepest share at the second beat (5.3-6.5 s), and each
second line made the viewer wait instead of telling them something:
- v-20261125-61 (MP, UP, Bihar; stayed 57.9%) 22.9% at 5.4 s: "नवंबर, सन दो हज़ार। हर एक के अंदर से एक नया स्टेट
  कटकर निकला। पर कैसे?" (restates the hook and asks again; on screen a calendar card saying only "नवंबर" over
  the same three states). The first real date and cut wait for 9.7 s, where 12.2% more left.
- v-20261124-61 (Telangana TS to TG; stayed 36.5%) 20.3% at 6.5 s: "पहले देखिए, हर राज्य और केंद्र शासित प्रदेश
  की गाड़ी पर उसका अपना कोड होता है, कुल 36।" (a "first, look" detour and a count of what's coming; the camera
  pulls back to a plain pale India with no plate on it at 5 s).
- v-20261125-62 (longest border; stayed 53.1%) 16.5% at 5.3 s: "जवाब, इन दोनों में से कोई नहीं।" (a "not these"
  with no new fact; the same map with crosses), then 13.9% more at 9.9 s on "...15,106.7 km। पर सबसे लंबा
  हिस्सा किसका?" (the question asked a second time).
- Also in v-20261128-62 (no numbers yet): "महाराष्ट्र को देखिए, ..." opens the second beat.
Fix: the second line is one short sentence (under 5 s) that gives the first real fact on its word: a state
with its plate, a date with the cut drawn, a neighbour with its length. Never "पहले देखिए", "...को देखिए",
"पर कैसे?", a count of what's coming, or the hook's question asked again. Director: the second beat stays on
the hook's object (the plate, the flags, the three states) and adds the new thing to it, never a pull-back to an
empty India.

## 2. The first frame shows the thing the question is about (new, 28 Nov 2026)
Seen in: v-20261124-61 (Telangana TS to TG) opens on a yellow Telangana with no plate on it, so with the sound
off the puzzle is invisible; stayed to watch 36.5%, 16.6 points under the channel's 53.1% median. The two whose
first frame showed what the question named held best: China and Pakistan filled with their flags
(v-20261125-62, 53.1%) and the three asked-about states in bold colours (v-20261125-61, 57.9%).
Fix: frame 0 shows the object of the question already on the map (the TS plate on Telangana, the two flags,
the coloured states), not only the lit state; the thumbnail's picture is a good guide.

## 3. The first frame names the subject (general)
Seen in: channel #1's first month, 55–76% swiped away when the title and first second held the subject back.
Fix: the title and the first spoken sentence name who or what the video is about.

## 4. Only what is true (general)
Seen in: channel #1, invented examples lost to real, named stories.
Fix: a true channel tells sourced facts about real, named people or things; a fiction channel says so.

## 5. No reaction shots (general)
Seen in: channel #1, shots of a character reacting were where viewers left.
Fix: every picture shows the thing being said.

## 6. The payoff is the most surprising fact (general)
Fix: hold the most surprising figure or fact for the payoff, and make the last line loop into the first.

## 7. Narration is never slow (general)
Seen in: the owner's notes on How Tech Works (Shorts), Disaster Desk (long) and Rise & Fall: "increase the pace".
Fix: no channel's narrator speaks under about 164 words a minute in a Short or 189 in a long video (generator/pack.py MIN_SPEED enforces it).

## 8. Show what happens, not only the count (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: "only showing death counts is not enough. Make that scenes."
Fix: when a line says what happened to people or things, the beat shows it happening in the place (the crowd under the walkway, the cars on the bridge), never gory (director.md).

## 9. Every picture once (general)
Seen in: Rise & Fall, 20 Nov: "the same 3 sneaker photos reused and almost no effects" (two Shorts marked stale).
Fix: a photo or picture is in one beat of a Short (the loop beat may repeat the first), two of a long video at most; the code check fails a repeat (renderer/remotion.py picture_once_problems).

## 10. A named place, company or person shows its real mark (general)
Seen in: Geography's Russia Short, 23 Nov: "Where is the flag of Russia??" (its area grew in plain red); channel #1's Squid Game and Apple/Google notes.
Fix: a country on the map shows its flag (the code check fails a map video whose named country never gets one), a company its logo, a person their photo head.

## 11. A long video's first sentence states the stakes (general)
Seen in: Disaster Desk's Hyatt long video, 22 Nov: the hook was "good only for people who want to see the full video".
Fix: the first sentence says the small cause and how big it got, in plain words (agents/studio.md); the title stays free of it.
