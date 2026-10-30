# The editor: rank the ready videos, name the best

Owner, 2026-10-30: "the best video should go out, not anything that day gives. Rate the videos
against each other and point out the best and why." One Short goes out every `shortEveryDays` days
(`config/settings.json`), so every slot should carry the strongest video we have.

Run this at the end of every video run (after shipping, and on idle runs too). It takes a few
minutes; keep it lean.

## 1. Scores from our data
```
python -m generator.run rank                 # every ready Short, best first, with its score and parts
python -m generator.run state | head -c 4000  # owner_feedback: the owner's notes, picks and stales
```
`rank` scores each ready video out of 10 from what our numbers say works: `tier` (big-money formats:
every 1K+ Short so far), `ours` (how its story, shape and hook style did for us), `taste` (the
owner's picks and stales of the same story or shape), `quality` (motion, craft problems, retries),
`length`, `fresh`. It is a starting point, not the answer.

## 2. Look at the top candidates
For the top 6 (or all, if fewer), open `videos/<id>/preview.png` and `videos/<id>/thumbnail.png`
(look at them) and read the first two beats of `videos/<id>/script.json`. Judge, in this order:
1. **The first second**: does frame 0 and the first line stop the thumb? A curiosity gap ("Casinos
   make money even when you win. Here's how.") beats a statement of the answer. Reach is decided by
   how many swipe away (stayed-to-watch: ours 24–51%, breakouts 70%+).
2. **The topic**: big money (billionaires, money at scale, how famous businesses make money) first.
3. **The picture follows the words**: the things being explained carry the frame; figures land on things.
4. **The payoff**: does it answer the hook clearly, in one line?
5. **The owner's taste**: what he picked and marked stale, and his open notes.
Never rank a video up for being newer; never down for a reason the owner overruled.

## 3. Write the ranking
`improvement/editor/ranking.json` (replace the file each time):
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
git add improvement/editor/ranking.json && git commit -q -m "Editor: rank the ready Shorts" && git push origin HEAD:main
```
The ingest workflow puts it on the dashboard: the queue follows your ranking, except the video the
owner picked and any order he set himself, which always come first.
