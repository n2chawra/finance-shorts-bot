# The editor: rank the ready videos, name the best

On a promo channel (`state` has a `promo` block) the publisher sends each promo Short after its long video, newest
long first: your ranking only orders promos of the same long video.

Owner, 2026-10-30: "the best video should go out, not anything that day gives. Rate the videos
against each other and point out the best and why." One Short goes out every `shortEveryDays` days
(`config/settings.json`), so every slot should carry the strongest video we have.

Run this at the end of every video run (after shipping, and on idle runs too). It takes a few
minutes; keep it lean.

## 1. Scores from our data
```
python -m generator.run rank --channel <channel>                 # every ready Short, best first, with its score and parts
python -m generator.run state --channel <channel> | head -c 4000  # owner_feedback: the owner's notes, picks and stales
```
`rank` scores each ready video out of 10 from what our numbers say works: `tier` (big-money formats:
every 1K+ Short so far), `ours` (how its story, shape and hook style did for us), `taste` (the
owner's picks and stales of the same story or shape), `quality` (motion, craft problems, retries),
`length`, `fresh`. It is a starting point, not the answer.

## 2. Look at the top candidates
For the top 6 (or all, if fewer), open `channels/<channel>/videos/<id>/preview.png` and `channels/<channel>/videos/<id>/thumbnail.png`
(look at them) and read the first two beats of `channels/<channel>/videos/<id>/script.json`. Judge, in this order:
1. **The first second**: does frame 0 and the first line stop the thumb? With the sound off, do you know which
   person, business or everyday thing it is about, and is there a question you'd stay to have answered? The
   subject named with the answer held back ("Costco sells you a hot dog for $1.50. So how does it make any
   money?") beats a title or first line that gives the answer away, a tease, or a question about what the viewer
   thinks (owner, 2026-11-16: the Shorts whose title held the answer lost their biggest share at 5-6 s). Reach is
   decided by how many swipe away (stayed-to-watch: ours 24–51%, breakouts 70%+).
2. **The topic**: something the viewer buys, pays for or watches, gone behind to the real business, first
   (owner, 2026-11-16: "the thing in your hand"); then big money (billionaires, money at scale),
   and a surprise the viewer doesn't already know: a textbook topic ("banks lend your savings") ranks
   below a less obvious one even in a strong format (owner, 2026-11-09: "pretty basic").
3. **The picture follows the words**: the things being explained carry the frame; figures land on things.
4. **The payoff**: does it answer the hook clearly, in one line?
5. **The owner's taste**: what he picked and marked stale, and his open notes.
Never rank a video up for being newer; never down for a reason the owner overruled.

## 3. Write the ranking
`channels/<channel>/editor/ranking.json` (replace the file each time):
```json
{
  "rankedAt": "<ISO time>",
  "videos": [
    {"id": "v-20261102-01", "rank": 1, "score": 8.6,
     "why": "One line: why this is the best (or where it falls short of the one above)",
     "strengths": ["Curiosity hook that holds the answer back", "Big-money topic"],
     "risks": ["The payoff line is long"]}
  ]
}
```
Every ready Short gets a row, ranks 1..n with no gaps, scores 0–10 (yours, after looking; say in
`why` when you moved far from `rank`'s number). Then:
```
git add channels/<channel>/editor/ranking.json && git commit -q -m "Editor: rank the ready Shorts" && git push origin HEAD:main
```
The ingest workflow puts it on the dashboard: the queue follows your ranking, except the video the
owner picked and any order he set himself, which always come first.
