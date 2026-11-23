# Upload timing: when to post, per channel (2026-11-20)

Research only. No settings, code or crons were changed.

_Note (2026-11-23): channel #1, the finance channel, was deleted from the platform; its data stays
here as evidence for the slot findings, and its recommendation was removed._

**Question:** some videos get no push at certain upload times, even when they have a good audience and likes. When should each channel post its Shorts and long videos (IST)?

**Short answer:** for Shorts, the time of day is not what decides the push. In our own data no slot is
statistically better than another, and the Shorts that "got no push" despite good retention are spread
over every slot. YouTube and the large studies agree that the upload hour matters little for Shorts and
only somewhat for long videos (mostly the first day). Two things in our own pipeline do distort the
picture, and one may cost views: (1) the best-ranked video always takes the earliest open slot, and
(2) catch-up uploads go public 5 minutes apart. The recommended slots below are small moves plus a
two-week rotation test.

---

## 1. Current slots (live config, `config/channels.json`, read 2026-11-20)

| Channel | Shorts a day, slots (IST) | Long videos (IST) |
|---|---|---|
| Channel #1 (finance) | 2: 07:07, 19:07 (trend slots 16:07, 22:07) | 1 a week, Sat (`longUploadDays: [6]`) at 20:07 (base default) |
| The Why Atlas (geography) | 2: 09:37, 20:37 | none (`longPerWeek: 0`) |
| A Billion Switches (tech) | 1: 06:07 | 2 a week, Wed + Sat 06:37 |
| Craze & Crash (business docs) | 2: 17:47, 22:17 | 2 a week, Tue + Fri 21:17 |

`longUploadDays` uses 0 = Sunday (`workers/lib/settings.ts`), so 6 is Saturday.

What the slots mean in other time zones:

| IST | UTC | US Eastern (EST) | UK | Philippines/Indonesia |
|---|---|---|---|---|
| 06:07 | 00:37 | 19:37 prev. day | 00:37 | 08:37 / 07:37 |
| 07:07 | 01:37 | 20:37 prev. day | 01:37 | 09:37 / 08:37 |
| 09:37 | 04:07 | 23:07 prev. day | 04:07 | 12:07 |
| 12:37 | 07:07 | 02:07 | 07:07 | 15:07 |
| 17:47 | 12:17 | 07:17 | 12:17 | 20:17 |
| 19:07 | 13:37 | 08:37 | 13:37 | 21:37 |
| 20:37 | 15:07 | 10:07 | 15:07 | 23:07 |
| 21:17 | 15:47 | 10:47 | 15:47 | 23:47 |
| 22:17 | 16:47 | 11:47 | 16:47 | 00:47 |

## 2. Our own data

Source: `channels/<slug>/metrics/videos.json` (48 h and 7 day views, stayed to watch) and
`metrics/analytics.json` (countries, traffic sources, devices).

### Channel #1, finance (73 videos since 14 Oct)

**Audience** (28 days): US 37%, India 20%, UK 8%, Philippines 7%, Indonesia 6%, Netherlands 4%,
Germany 4%, Canada 3%. Phone 82%, tablet 12%. 93.5% of views come from the Shorts feed, 0.4% from
subscribers. The audience is spread from UTC−8 to UTC+8, so some of it is awake at any hour; no single
hour serves everyone. Studio's "When your viewers are on YouTube" chart isn't exported by our stats
jobs, so it isn't in this analysis; it is worth a look in Studio (Analytics → Audience).

**Shorts by slot**, from 21 Oct (the content reset; older Shorts were weaker everywhere), views at 48 h:

| Slot (IST) | n | Median | Mean | ≥400 views | Stayed (median) | 7 d ÷ 48 h |
|---|---|---|---|---|---|---|
| 07:07 | 11 | 412 | 378 | 7 of 11 | 35.8% | 1.01 |
| 12:37 | 18 | 274 | 463 | 8 of 18 | 33.1% | 1.03 |
| 19:07 | 19 | 123 | 241 | 4 of 19 | 33.2% | 1.15 |

- **Head-to-head on the same day** (17 days with 2–3 Shorts): 12:37 won 10 of the 17 days it ran, 07:07
  won 4 of 10, and 19:07 won 3 of 16.
- **From 2 Nov:** 07:07 median 477 (n=6), 12:37 median 150 (n=10), 19:07 median 71 (n=11).
- **None of these differences is statistically significant.** Mann–Whitney on 48 h views: 12:37 vs
  19:07 p = 0.19, 07:07 vs 19:07 p = 0.27, 07:07 vs 12:37 p = 0.74. With 11–19 Shorts a slot, a real
  difference would have to be about 3× to show. **Verdict: a weak lean against 19:07, nothing proven.**
- **19:07 Shorts grow the most after 48 h** (7 d ÷ 48 h of 1.15, up to 2.68×: the Diwali Short went from
  123 to 330, the TV Short from 211 to 325). Judging 19:07 on 48 h views understates it a little.
- **Weekday:** Friday (median 533, n=9) and Saturday (421, n=7) were best, Tuesday the worst (34,
  n=11). Weekdays are confounded with which videos went out that week, so treat this as weak.
- **Shorts with good retention but no push fall in every slot.** The AMC Short (07:07, 63% stayed, 108
  views, 68% of views from the Shorts feed), Larry Ellison (12:37, 43%, 197 views), the Saudi city
  (19:07, 41%, 52 views), and the $5,000 bonus (19:07, 43%, 25 views). A low share of views from the
  Shorts feed (57–69%, against the usual 90–98%) marks the no-push Shorts, and those are spread over
  07:07, 12:37 and 19:07. That points at the topic, the first second or the title, not the clock.
- **The confound:** publish fills a slot about 4.5 h ahead from the queue order (the owner's pick, then
  the editor's rank; `workers/publish.ts` `uploadOne`), so the earliest open slot of a day tends to take
  the best-ranked video. A slot comparison therefore partly measures the ranking. The test in section 5
  removes this.
- **Off-slot times** (catch-ups and manual uploads, n=7) had a median of 83. The pair 5 minutes apart on
  9 Nov (20:53 and 20:58) got 29 and 37 (see section 4).

**Long videos:** 4 so far, with 1–6 views at 48 h (Tue 20:07, Thu 17:00, Sat 20:17, Sat 20:07). Nothing
can be read about timing from these. A channel with very few subscribers whose long videos draw no
browse or suggested traffic gets no views at any hour, so the time isn't the problem.

### The Why Atlas (launched 18 Nov, 4 Shorts)

Lifetime views so far, all under 3 days old: 09:37 → 1,183 (Greenland) and 28 (power station, under a
day old); 20:37 → 579 (Sahara) and 14 (Suez). **n = 2 a slot: no conclusion possible.** The 90-day
country list is Mexico 65%, Venezuela 22%, Colombia 13%, from a handful of early views. That is too few
to plan around, but recheck it in 2 weeks: if Latin America stays large, its evening (UTC−5/−6, about
05:30–09:30 IST) matters.

### A Billion Switches (launched 19 Nov, 2 Shorts)

06:07 → 45 and 102 views. There's no country data yet, and too few videos to judge.

### Craze & Crash (launched 19 Nov)

None of its videos has been published yet (`metrics/videos.json` is empty). The research comments
(`research/comments.md`) describe a global English audience led by the US (many US cities named), with
the UK, Germany, Poland, the Nordics and the Netherlands, plus India, the Philippines and Southeast Asia.

## 3. Outside evidence

### What YouTube and the studies say

- **YouTube: waiting before publishing does nothing.** YouTube's Creator Liaison (Rene Ritchie, Nov
  2025) says recommendations learn only from audience behaviour, which starts when a video goes public.
  Private or scheduled time before that neither helps nor hurts, and scheduling is fine for reaching
  viewers at a convenient time.
  https://www.searchenginejournal.com/youtube-debunks-24-48-hour-upload-delay-recommendation/560613/
- **YouTube: over the long run the hour barely matters.** Creator Insider: "Long term, it doesn't really
  matter what time of day or night we post our videos"; topic, title and thumbnail matter far more.
  https://www.youtube.com/shorts/aLrV1wMC5CA (quoted in
  https://uppbeat.io/blog/creator-questions/when-is-the-best-time-to-post-your-videos).
  Ritchie has also said on X that posting in off hours can make the first boost slower, so the effect
  is on the first hours, not the total (reported by Search Engine Land,
  https://searchengineland.com/youtube-issues-guidance-on-when-to-post-content-for-maximum-reach-438774;
  that page refused our fetcher, so this rests on the search snippet).
- **YouTube hasn't said how recency counts in the Shorts feed.** Shorts are recommended to viewers
  scrolling the feed at any hour, and how a Short's first viewers respond decides whether the feed
  shows it to more people. That is why the topic, title and first second, not the clock, decide the push.
  https://www.shopify.com/blog/best-time-to-post-youtube-shorts
- **vidIQ, 40.2 M US long videos** (30-day views against each channel's own average): the gap between
  the best and worst upload hour shrinks to a few percent by day 30. The day of the week matters more:
  Sunday +3.5%, Saturday +2.2%, Wednesday −2.2%. Their advice is to post 2–4 h before your audience's
  peak, favour weekends for long videos and Friday evening for Shorts, and keep a consistent schedule.
  https://vidiq.com/blog/post/best-time-publish-video-youtube/
- **Buffer, about 1.8 M videos and Shorts** (each viewer's local time): long videos do best on Sunday
  around 10:00 and in mornings generally; Shorts on Friday at 16:00–19:00. The authors call timing "not a
  magic bullet" and say your own Studio data is the better guide.
  https://buffer.com/resources/best-time-to-post-on-youtube/
- **The common advice** is to use Studio's "When your viewers are on YouTube" chart (Analytics →
  Audience, last 28 days) and post 1–3 h before the peak. YouTube's help on scheduled publishing:
  https://support.google.com/youtube/answer/1270709

**Takeaway:** for Shorts the hour is a weak lever. For long videos it shapes the first 24 h (which feeds
early browse and suggested traffic) and fades by 30 days. Weekends are a small plus for long videos.

### What each niche does

Source: `origin/niche-data`, scanned 17 Nov: about 3,600–4,700 recent videos from 45 channels per
niche. A **hit** is a video whose views reached 3× its channel's subscribers. All times are IST.

| Niche | Shorts posted 18–21 IST | Shorts hit rate by IST window | Long videos posted 18–21 IST | Long hit rate by window |
|---|---|---|---|---|
| Finance (n 3,620 / 281) | 23% (busiest) | 15.7–24.4% everywhere; 18–24 lowest (16–17%), 06–09 and 12–15 highest (24%) | 42% | 21–24: 22.5%; 18–21: 17.6%; 09–12: 28.6% (small) |
| Geography (2,968 / 525) | 30% (busiest) | 06–09: 26.4%, 09–12: 20.8%, 18–21: 16.5%, 00–03: 11.6% | 35% | under 5% everywhere (long hits are rare in this niche) |
| Tech (3,528 / 316) | 33% (busiest) | 06–09: 30.2%, 15–18: 27.9%, 18–21: 20.0%, 00–03: 17.1% | 25% | 18–21 and 06–09: 19%; 03–06: 5% |
| Business docs (2,840 / 1,093) | 24% | 03–06: 30.3%, 06–09: 25.9%, 21–24: 21.6%, 12–15: 17.7% | 32% | 15–18: 32%; 09–12: 25%; 18–21: 17.5%; Mon and Sat best |

What this shows:

- **Shorts hit rates are nearly flat by hour.** In every niche, the 18–21 IST window (US morning,
  Europe afternoon, India evening) has the most uploads and one of the lowest hit rates. The
  early-morning IST windows (the US evening) do a bit better. That fits more competition at 18–21 and
  nothing else.
- **Most long videos go out 18–22 IST.** That is morning to midday in the US and afternoon in Europe,
  i.e. the "2–4 h before the US afternoon peak" advice.
- **Reference channels:**
  - Finance: Mark Tilbury posts Shorts at 19–21 IST and long videos Wed/Sat; INDmoney posts at 19–21.
  - Geography: GeoGlobeTales Shorts at 20 IST (Thu/Sun); Map & Myth Shorts at 18 and long at 17 IST.
  - Tech: ColdFusion long at 19–22 IST; Branch Education at about 19; Asianometry at 04 (Mon/Fri);
    Business Insider long at 18 (weekends); Zack D. Films Shorts at all hours.
  - Business docs: Modern MBA long at 21 IST Sat/Sun; Think School 19–21; ColdFusion as above.
- The last finance market scan (`origin/market-data`, 19 Nov) shows the same spread. The top Shorts this
  week went up at 22:43, 10:55, 13:15, 01:14 and 18:30 IST, i.e. anywhere. 11 of the 30 long videos went
  up at 18–21 IST.

## 4. Could our publish worker cause "no push"? (`workers/publish.ts`, `workers/lib/publishing.ts`)

- **Private + `publishAt` is fine.** YouTube says recommendations start when a video goes public, and
  nothing about a scheduled upload counts against it. Our videos sit private for at most about 4.5 h.
  Not a cause.
- **No two channels publish in the same minute.** Every channel has its own minutes (06:07/06:37,
  07:07/19:07, 09:37/20:37, 17:47/21:17/22:17). They are separate YouTube channels, and nothing
  suggests channels on one Google account affect each other's distribution. Not a cause.
- **Catch-ups go public 5 minutes apart. This is a likely, small cause.** A slot missed because GitHub
  started the cron late, and every extra "Upload now", goes public 15 min after the run, the next one 5
  min later (`soonSlot(now, i)`: 15 + 5·i minutes). On 9 Nov two channel #1 Shorts went public at 20:53 and
  20:58 and got 29 and 37 views. Two Shorts from one channel minutes apart are shown to the same early
  viewers at once, and the feed rarely pushes both. **Fix to consider (not made):** space catch-ups at
  least 2–3 h apart, or let a missed slot's video take the next free slot instead.
- **The best video always takes the earliest slot. This is a measurement problem, not a cause.**
  `uploadOne` takes the owner's pick, then the editor's rank, for whichever slot comes due first. Slot
  results therefore mix the clock with the ranking. Any slot test has to alternate which slot gets the
  editor's #1.
- **Late cron runs move videos to odd times.** GitHub's cron runs hours late on busy days (noted in the
  code on 9 and 12 Nov). The Netlify heartbeat and the 2 h catch-up window (`CATCH_UP_HOURS`) mostly
  cover this. Off-slot Shorts (n=7) had a median of 83, but they include the two catch-ups above.
- **The upload quota isn't touched.** Four channels make about 9 uploads a day against 95 allowed.

## 5. Recommendation per channel

The general rule: for Shorts, don't expect a time change to fix a Short that isn't getting pushed.
Retention in the first seconds, the title and the topic decide that. Pick slots that cover the
audience's day, keep them consistent, and test.

### The Why Atlas

- **Shorts: keep 09:37 IST, and move 20:37 to 16:37 IST.** 09:37 IST is late evening in the US (23:07 ET)
  and morning in Asia; 16:37 IST is midday in Europe and early morning in the US. 16:37 also stays out of
  the crowded 18–21 IST window, where the niche's hit rate is lowest (16.5% against 21–26%). **Confidence:
  low** (2 Shorts a slot; country data is too thin). Recheck the countries on about 4 Dec: if Mexico,
  Venezuela and Colombia stay above 30%, try 06:37 IST (their evening) in place of 16:37.
- **Long:** none planned. If they start, use 20:07–21:07 IST (GeoGlobeTales, Map & Myth, Sudarshan
  Gurjar), on a Thursday or a weekend.

### A Billion Switches

- **Shorts: keep 06:07 IST** (19:37 ET, the US evening). It sits in the 06–09 IST window, which has the
  niche's highest Shorts hit rate (30.2%). **Confidence: low to medium** (niche data only).
- **Long: keep Wed and Sat, but move 06:37 to 19:37 IST** (09:07 ET, Europe afternoon, India evening).
  ColdFusion, Branch Education and Business Insider post long videos in that window, and 18–21 IST has
  a 19.2% long hit rate. Our current 06:37 publishes at 20:07 ET the evening before. That is also a
  decent window (19.4%), so this is a small change, not a fix. **Confidence: low.** Changing only the
  time leaves the Studio routine's days and crons as they are.

### Craze & Crash

- **Shorts: keep 22:17 IST, and move 17:47 to 05:47 IST.** 22:17 IST is midday in the US (11:47 ET) and
  evening in Europe; 05:47 IST is the US evening (19:17 ET). The audience is US-led, and the niche's
  Shorts hit rate is highest at 03–06 IST (30.3%) and 21–24 IST (21.6%). 17:47 is the start of the
  crowded window (US 07:17 ET). **Confidence: low** (niche data only, no Shorts published yet).
- **Long: keep 21:17 IST, and consider Saturday in place of Friday.** 21:17 IST is the US late morning
  (10:47 ET) and the European evening; Modern MBA posts at 21 IST on weekends, and the niche's long hit
  rate is best on Monday (29%) and Saturday (21%), against Friday's 20%. **Confidence: low.** Changing the
  days would also mean moving the Studio routine's crons, so it isn't worth doing before the test.

### The test (same for every channel)

1. **Rotate the slots for 2 weeks.** With 2 Shorts a day, alternate between the current pair and the
   proposed pair every other day, or run 3 candidate slots in turn so each gets about 9 Shorts.
2. **Remove the ranking confound.** Alternate which slot gets the editor's #1 each day, or assign the
   slot by coin flip. Without this, the result measures the ranking again.
3. **Judge each slot on:**
   - 48 h views ÷ the channel's 14-day median;
   - the share of views from the Shorts feed (a no-push Short is under ~80%);
   - stayed to watch.

   Keep a slot that is ≥1.5× another with ≥8 Shorts a slot. Otherwise there is no difference: keep the
   current slots, and look at content for the no-push problem.
4. **Long videos come too slowly** (1–2 a week) for a 2-week test. Keep one time for 6–8 videos and
   judge on 7-day views against the channel's own median. Check Studio's "When your viewers are on
   YouTube" chart once each channel has about 1K views in 28 days.

## Method notes

- Times are publish times (`publishAt`), converted to IST. 48 h views come from the hourly public
  snapshots, so they are not affected by the Analytics lag.
- The scripts were throwaway analyses in the session scratchpad (not committed). They read
  `channels/*/metrics/videos.json`, `metrics/analytics.json`, `origin/niche-data` and
  `origin/market-data`.
- The niche hit rate counts videos at least 2 days old, using views ÷ channel subscribers (`outlier`) as
  scanned. It shows what the niche does, not what caused it.
