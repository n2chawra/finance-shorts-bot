# Many channels on one platform: a one-time setup per channel, start and pause any time

_Updated 2026-11-17 (owner, before moving to the Max plan). Four changes:_
- _Every channel sets its own Shorts and long-video counts, both for making and for posting._
- _Before any big research, a **quick verdict** says whether the niche is doable and worth it (money
  and public demand). This replaces the 12 Nov "no verdict" rule._
- _The full research studies YouTube in depth: niche topics, animation style, Shorts and long videos.
  It **advises** which kinds of topic to make and how many videos to post._
- _**Sample videos come last**, after the research is fully done and the channel is built: a sample
  Short and a sample long video, made by the channel's real pipeline, as close to the reference
  channel as the rules allow. They show exactly the kind of video that will go out, and the owner
  approves them before launch._

_Also brought up to date: directed 2D shots on the flat kit (13 Nov), two long videos a week on
channel #1 (16 Nov), the quota arithmetic, routine timings for many channels, and (owner, 17 Nov)
the setup's YouTube study done in the owner's own PC browser, not with Gemini._

_Kept from 12 Nov: every channel runs the weekly loop instead of the variant system, is judged on
stayed to watch instead of views, starts lean, picks its look from its niche, and has a stop rule.
The order of work is unchanged: the whole platform is built before any new channel starts._

## Context
The owner wants to run more YouTube channels on the same automation. For each new one they give a niche, a
short description and one or more reference channels; the system researches the niche (including
watching the reference videos), builds everything that channel needs, shows proof, and goes live.
Nothing that is already shared gets repeated: one dashboard, one database, one auditor and dashboard
agent, one Google project. Every channel can be started and paused independently, and each one's
videos-per-day can be turned down when Claude usage runs short (the owner manages the plan).

Today the system is one channel spread across the repo (`channel/profile.md`, `config/market.json`,
`improvement/research/*`, `history/`, `videos/`, one YouTube token, one settings row).
`docs/guide/13-new-channel.md` says to copy the whole repo per channel, which is what the owner doesn't want.

## Decisions (owner, 2026-11-05)
- **One platform, many channels**: one repo, dashboard, database, auditor and dashboard agents.
- **One Google project for all channels.** This works: each YouTube channel signs in once to the same
  OAuth app and gets its own refresh token. The limit is the project's shared **quota (10,000
  units a day)**.
  - One upload costs about 1,600 units, so 3 Shorts a day use about 4,800 per channel.
  - Two channels at 3 Shorts a day use 9,600 units. On top of that come the dashboard's live counters
    (up to ~1,450 a day) and, on a long-video day, 1,600 per long video. That is **over the limit from
    channel #2**.
  - Research adds to it. The Data API's `search.list` costs 100 units a call, while channel, playlist
    and video reads cost 1. So the niche scan reads channels and their upload playlists, keeps
    searches to about 20 a niche (~2,000 units), and runs on the quota keeper's budget.
  - So the free quota increase (YouTube API audit form, about 1–3 weeks) is applied for before
    channel #2 launches, not #3.
- **Any niche**: the research decides the format, look, voice, whether numbers and money appear, and
  the fact rules.
- **Usage is the owner's call**: each channel has its own Shorts and long-video counts (next section)
  and can be paused.

## Video counts per channel (owner, 2026-11-17)
Each channel has its own four numbers, set on its Channels page. Any of them can be 0, so a channel
can be Shorts-only or long-only:

| Setting | Means | Channel #1 today |
|---|---|---|
| `dailyVideoTarget` | Shorts **made** a day (the morning run) | 3 |
| `uploadTimes`, `shortEveryDays` | Shorts **posted**: the slots, and every how many days | 07:07, 12:37, 19:07 IST, daily |
| `longPerWeek` | long videos **made** a week (Studio) | 2 |
| `longUploadDays`, `longUploadTimes` | long videos **posted**: the days and time | Wed and Fri 20:07 IST |

Each channel also has its own backlog caps (`backlogCap`, `longBacklogCap`) and long length
(`longLengthMinSec`, `longLengthMaxSec`).
- **Starting values come from the research** (its recommendation, below). The owner accepts or
  changes them on the Launch review and can change them any time after.
- **Making may run ahead of posting.** Extra videos fill the backlog up to its cap, then generation
  stops. Posting never takes more than the queue holds: an empty slot stays empty rather than being
  filled with a weak video.
- **The dashboard checks every change against the totals across channels**: YouTube quota units a
  day and the share of the plan's Claude usage (from `usage.json`). It warns before a change that
  would go over.
- **The weekly loop needs volume.** A cycle judges 8 Shorts a side, so 16 in 7 days, about 2.3 a day.
  A channel posting fewer gets a longer cycle (for example 1 a day: about 16 days, one extension
  allowed instead of the usual one week plus one). The Channels page says so next to the setting.
- **A long-only channel** has no Shorts to run the loop on. Its loop judges long videos on average
  view percentage, one change at a time, at 4 videos a side. It is slower, and the page says so.

## What the owner does per channel (everything else is automatic)
1. **Tell the niche:** "Add channel" on the dashboard (or `/new-channel` here): the niche, a few lines
   and 1–3 reference channels. Optionally, the reference video whose style you want most, and how many
   Shorts and long videos you have in mind.
2. **Read the quick verdict** (about 30 min later) and click **Continue** or **Stop**. Stop ends it,
   with nothing more spent.
3. **Wait for the full research and the build** (a few hours, automatic).
4. **Review the samples** (the Launch review): the sample Shorts and sample long video next to the
   reference videos they follow, with the research's advice (topic kinds and video counts, which you
   accept or change). Click **I like it**, leave notes (fixed and re-rendered), or **Stop**.
5. **Create the channel on YouTube from the branding kit.** The system gives a kit on the Channels
   page: 3 name ideas, the avatar and banner as files, the description and keywords. The owner creates
   the channel and pastes them in (about 5 minutes).
6. **Click "Connect YouTube"** on the Channels page and pick the new channel on Google's consent
   screen. That's one click: the token is stored for you, with no terminal and no secrets to copy.
7. **Click "Launch".** The approved samples go out first, and the rest of the pre-launch backlog
   follows.

Pause, resume and the video counts are on the same page.
Once for the whole platform (not per channel): fill in YouTube's quota-increase form before the
second channel launches (the system raises a notification with the steps).

## The flow for a new channel
1. **Ask:** in this app, `/new-channel` with the niche, a few lines of description and 1–3 reference
   channel links. A dashboard "Add channel" form creates the same request.
2. **Quick verdict (automatic, about 30 min, before any big research; owner, 2026-11-17: "so I don't
   waste time on bad niches"):** a small scan, about 1,000 quota units and one short Claude session.
   Every point is scored from public data, with the evidence linked:
   - **Public demand:**
     - **Views:** median views of the niche's Shorts and long videos in the last 90 days.
     - **Do strangers get shown it:** how many channels under 10K subscribers had a video at 5× their
       median or more in that time.
     - **Direction:** rising or fading (views a day now vs six months ago).
     - **Crowding:** how many channels posted the same topics this month.
   - **Money:**
     - **Can it be monetised:** whether the niche can join the YouTube Partner Program, and how fast.
       The bar is 1,000 subscribers and either 4,000 public watch hours in 12 months or 10M Shorts
       views in 90 days. The verdict estimates which path fits.
     - **Will advertisers pay for it:** whether the niche is advertiser-friendly. Health,
       kids-directed and violent-crime content lose ads.
     - **How much it earns:** the niche's RPM band (revenue per 1,000 views), Shorts vs long. Bands
       come from published creator reports and are labelled as estimates, never as facts.
     - **Other income:** affiliate links, sponsors, products.
   - **Doable by us:**
     - **The look:** can the flat kit, Kokoro voices, synthesized music and Commons photos make the
       reference look? A niche whose hits depend on real footage, gameplay, faces on camera or
       licensed music is marked "not doable".
     - **Voice and facts:** is the language voiced, and does the niche have true sources to cite?
     - **Policy:** reused content, AI-content labelling, medical or financial claims, kids content.
     - **Usage:** about how much of the plan one video takes.
   - **The verdict:** one of **Go**, **Go, with conditions** (listed), or **Don't**. It comes with a
     one-line reason, the three strongest points for and against, and a rough earnings range at 6
     and 12 months: low, likely and high, each with its assumptions. It is advice. The owner decides,
     and a Continue on a "Don't" is recorded with the reason in `channels/<slug>/decisions.json`.
   - It lands in `channels/<slug>/research/verdict.md` and on the Channels page. Nothing below runs
     until the owner clicks Continue.
3. **Full research (automatic, about 2–3 h; details in the next section). It runs in the Claude
   desktop app on the owner's PC, which must stay on and online for it.** It uses the PC's own
   browser (owner, 2026-11-17: not Gemini). It starts when the owner clicks Continue on the verdict,
   in the daytime gap free of routines (below). If the PC is off, the Channels page shows "waiting
   for your PC" and the research starts when the PC is back.
   - **Market:** with the YouTube Data API, read the reference channels and the niche's top
     searches: the videos that beat their channel's median (outliers), their titles, lengths,
     Shorts vs long, cadence, and the formats behind them. This produces the demand-first format list
     with reference videos, the same rule that saved our channel.
   - **Watch the references, in the PC's browser** (the `yt-style` method used on The Curious Plot):
     the top 5 Shorts and top 3 long videos of the reference channels are watched frame by frame and
     written into the same shot-sheet format the Study page uses (`workers/lib/sheets.ts`), so code
     can measure them. The owner's favourite reference, if named, is one of them. The method also
     measures the sound (tempo, key, levels, ducking, SFX). Nothing is downloaded. The Gemini Study
     worker stays only for the Study page after launch.
   - **Watch the wider niche, in the same browser:** 10 more top Shorts and 3–5 top long videos from
     other channels.
   - **Code measures the shot sheets:** shot length, cuts a minute, shot sizes, camera moves,
     on-screen text, caption style, palette, words a minute, music level. These become the
     channel's style targets.
   - **The picture language:** what the niche's hits show (real photos, maps, simple drawings,
     characters, objects). The channel's look follows it. If characters are not how the niche's hits
     look, the channel starts **without a cast** (narrator, places, objects, photos). The look is
     mapped onto the flat kit (`remotion/src/flat/`: what we have, what we need to draw).
   - **As close as allowed, never a copy:** the same technique, pacing, framing, camera, caption
     style, colour feel and sound feel as the references, with our own story, words, characters, art
     and voice. Copying another channel's characters, art, words or voice is copyright infringement,
     and YouTube demonetizes channels that look like reused or mass-produced copies, which would undo
     the money reason for the channel.
   - **The first second:** the openings of the niche's top 20 hits (title, first spoken line, what
     the first frame shows), from the shot sheets and transcripts. Do they state the subject and the number up front?
     They become the opening rules and examples in the channel's writer instructions: the lesson that
     cost channel #1 its first month (titles that held back the subject; 55–76% swiped away).
   - **Fit:** the language and region, whether there are numbers or money (and so whether the maths,
     the number check and money formatting switch on), the fact sources and the fact-review rules, the
     disclaimer the niche needs, and YouTube's monetisation rules for it.
   - **The advice to the owner** (owner, 2026-11-17): `channels/<slug>/research/advice.md`, shown on
     the Launch review next to the samples:
     - **Topic kinds to make:** ranked, each with 2–3 example titles, the niche hits it rests on, and
       its share of the first month (for example "how a famous business makes money: 2 in 3 Shorts").
     - **Kinds to avoid,** with the evidence.
     - **How many to post:** Shorts a day and long videos a week. The numbers follow what the niche's
       winning small channels post, what the weekly loop needs (about 2.3 Shorts a day for a one-week
       cycle), the quota left across channels, and the plan's usage, with the reason for each. The
       owner's own numbers from "Add channel" are shown next to the advice. Whichever the owner
       accepts on the Launch review becomes the channel's settings.
     - **Shorts, long or both:** long videos only where the niche's long hits show demand. Until one
       of the channel's own Shorts wins, the long-video topics come from this research, because
       channel #1's Scout rule (the full story of a Short with 1K+ views) has no Shorts to draw on yet.
4. **Build the channel pack (automatic)** in `channels/<slug>/`:
   - `profile.md`;
   - `formats.json` and `shapes.json` (starting from the shared library);
   - `market.json` (searches);
   - the champion recipe in the channel's writer instructions and `cycle/backlog.json` (the weekly
     loop's first challengers, from the research);
   - `topics.json` (15–20 first topics with sourced facts);
   - a look (palettes, places, captions) on the flat kit, with the director's instructions for the
     channel and the measured style targets;
   - voices (Kokoro voices for the language);
   - a cast: picked and restyled from a shared character library, new characters drawn when the niche
     needs them, or narrator-only;
   - the disclaimer;
   - channel name ideas, description, keywords, avatar and banner (drawn like `ChannelArt.tsx`).
5. **Sample videos, last (automatic, then the owner; owner, 2026-11-17: "so that I know what kind of
   video will go out"):**
   - Made only after the research is fully done and the pack is built, so they are exactly what the
     channel will publish, not a mock-up.
   - **Three sample Shorts and one sample long video** (the long one only if long videos are on, at
     the channel's long length) go through the channel's real pipeline: plan → script → number check
     → fact review → director → render → QA.
   - **The Launch review** shows each sample next to the reference video it follows, with the measures
     side by side (ours vs theirs), plus the research's advice, the video-count settings and the
     channel pack.
   - The owner clicks **I like it**, leaves notes (fixed and re-rendered; a note on the look changes
     the pack, so later videos follow it too), or clicks **Stop**. After 3 rounds of notes without an
     approval, the page asks whether the niche or the reference should change instead.
   - The approved samples become the channel's reference videos, as `v-directed-netflix` is for
     channel #1 (the director and QA work to them), and the first videos of the pre-launch backlog.
6. **Branding kit and connect (owner):**
   - the kit is shown on the Channels page: name ideas, avatar and banner PNGs to download, and the
     description and keywords to copy;
   - "Connect YouTube" runs Google's sign-in from the dashboard (Netlify) with the shared OAuth client;
   - the refresh token is stored encrypted in the database (keyed by `SESSION_SECRET`);
   - the system checks the token belongs to a new channel (`myChannel`) and links it.
7. **Activate (automatic, on "Launch"):**
   - the channel's routines are created (video run, research, reviewer, and Scout/Studio if long
     videos are on), at the times in "Routine timings";
   - its video counts and upload slots are set from the accepted advice;
   - status becomes `active`, and the first upload happens the next morning.

## Routine timings for many channels (IST)
Claude's usage resets in 5-hour windows on Pro and on Max; Max has more usage in each window, plus a
weekly cap. The rule from channel #1 stays: **each night's video runs open a fresh window**, so they
always have the full window to use. Channels are staggered so their runs never overlap, and
the shared agents run once a night for all channels.

| Time (IST) | Routine | Per channel or shared | Window |
|---|---|---|---|
| 23:00 | Auditor (all channels in one run) | shared | A |
| 23:47 | Research, channel #1 | per channel | A |
| +25 min each | Research, channel #2, #3… (00:12, 00:37…; all done by 02:30) | per channel | A |
| 04:07 | Video run, channel #1 (its Shorts for the day) | per channel | **B (fresh)** |
| +40 min each | Video run, channel #2, #3… (04:47, 05:27…) | per channel | B |
| after the last video run, at least 06:17 | Improver (one run; each channel's weekly loop judged on its own) | shared | B |
| +80 min after the improver | Dashboard agent (Sundays) | shared | B |
| 09:07 | Spare run: one run that makes up any channel's shortfall, worst buffer first, else idles | shared | **C (fresh)** |
| 08:05 Mon/Wed, +45 min each | Studio (long videos), channels with long videos on | per channel | B/C |
| 09:37 Mon/Thu, +30 min each | Scout (long-video topics) | per channel | C |
| 12:00–20:30 | **Free gap:** new-channel setup research on the owner's PC, owner's own sessions | — | D |
| 21:07 Tue/Fri, +30 min each | Reviewer | per channel | D |
| 12:07 on the 1st | Monthly review (all channels) | shared | C/D |

GitHub Actions (ingest, publish, stats, market, study) use no Claude usage and keep their own times.
Each channel's `market.yml` scan runs at 22:17 IST, the next channel 10 min later.

- **Upload slots are separate from routines.** Each channel has its own upload times (its video
  counts). Different channels' slots sit at least 20 min apart, so the quota keeper can see each
  upload land.
- **How many channels fit:** window B holds about 4 channels' video runs at 40 min each, with the
  improver after them. Past that, a fifth channel's video run moves to the 09:07 window C, and the
  spare run moves 40 min later for each channel added there. The per-channel usage records
  (`usage.json`) and the run-times card on the Agents page say when the windows are full. Adding a
  channel past that point is refused on the Channels page, with the reason.
- **On Pro** (until the move to Max): only channel #1's routines run. No new channel is added, and
  the setup research waits for Max.
- When a channel is paused, its routines still fire but exit in seconds, so its time slot stays
  reserved and resuming needs no rescheduling.

## Research that knows what works before the first upload (owner, 2026-11-05: "the system should know in the setup itself that what works")
Our channel learned "billionaire stories hit, news doesn't" and "≤35 s Shorts win" only after two weeks of
uploads. Both were visible in public data beforehand. The setup measures them:
1. **The whole niche, not just the references:**
   - **What to scan:** 30–50 channels found through niche searches and related channels, over their
     last 3–6 months.
   - **Outlier score:** each video's views ÷ its own channel's median.
   - **Weighting:** small and new channels (under ~10K subscribers) count most, because their hits show
     what the feed gives to strangers.
   - Shorts and long videos are scored separately.
2. **Topic families ranked:**
   - the outlier videos are clustered by topic and format, and each family is ranked by hit rate and
     median outlier score (for example "billionaire stories 8×, news explainers 0.6×");
   - the families to avoid are written down;
   - this becomes the channel's `formats.json` tiers (core / low / avoid) from day one.
3. **Format, measured the same way:**
   - the winning length range;
   - title patterns (a figure, a name, a question);
   - what the first second shows;
   - how the hook opens: transcripts of the top 20 hits, read in the PC's browser;
   - upload cadence and the times of day the hits went out.
4. **Comments of the top hits, mined** for what viewers ask for next. That gives the first topic list
   in the audience's own words, plus the language and countries.
5. **Gaps and saturation:** topics with high demand and few recent videos; families rising or fading
   (recent views per day vs six months ago).
6. **The verdict comes first, and it is short** (owner, 2026-11-17, replacing the 12 Nov "no
   verdict"): the quick verdict (flow, step 2) decides whether this deeper research runs at all. The
   deeper research turns the risks it finds (policy for AI-made content, medical or financial
   claims, kids content, reused footage) into setup rules. If it finds that the verdict was wrong
   (for example, the demand was one viral channel), it says so on the Launch review before any
   upload.
7. **The advice** (topic kinds, video counts, Shorts vs long; flow, step 3) is written from points 2–5.
8. Everything lands in `channels/<slug>/research/`: the verdict, the niche report, the outlier
   database, the shot sheets and style study, and the advice. The setup files are built from it.

## Launch already knowing roughly what works, then learn every week
- **The weekly loop, per channel** (the same as channel #1 since 2026-11-12; the variant system is
  not used):
  - the research writes the **champion recipe** (length, topic families, opening rules, look) into
    the channel's writer instructions;
  - it fills the channel's **challenger list** (`channels/<slug>/cycle/backlog.json`) with the things
    the research was unsure of, ranked, alternating first-second and look tests;
  - one challenger at a time, half the Shorts, judged by code on **stayed to watch** (engaged views ÷
    views, pooled) or, for the look, **held after the hook**; kept at +5 points, dropped at −5, from 8
    Shorts a side within a week; the improver applies it and starts the next, per channel;
  - the first cycle starts on launch day.
- **A predicted score before making a video:**
  - before a topic is planned, its title and topic are compared with the niche's outlier database;
  - topics predicted below the niche median are skipped, except as a challenger the loop assigns
    (this would have stopped our salary and payday Shorts).
- **Launch with a backlog:** 6–9 videos (at least 2 days of the channel's own Shorts count) are made
  before going live. The first week never depends on one
  morning run, and the pipeline is proven for the niche.
- **Start lean** (what channel #1 learned in its first month):
  - style checks are notes from day one (`renderer/advice.py`); only numbers, facts, layout, length,
    the disclaimer, liveliness and uniqueness fail a video; about ten steps a video;
  - three openings drafted per Short and one picked by a fresh reviewer (`generator/prompts/hook_judge.md`);
  - one narrator voice for the channel's Shorts;
  - captions clear of YouTube's bottom overlay (340 px on a Short).

## Hands-off after launch
- **Automatic drop diagnosis.** If a channel's stayed to watch falls 10 points or more below its
  previous two weeks (views alone swing too much to trust), a routine runs the analysis done for Paisa
  Panchayat on 2026-11-04 and 2026-11-11:
  - length, topic family, gaps, what changed, the upload method and category;
  - it fixes what the rules allow (revert the last default change, retire a losing family);
  - it notifies only for decisions.
- **A change log and one change at a time.**
  - Every default change per channel is logged with its date and reason (`channels/<slug>/changes.json`).
  - Only one default may change at a time (the guard enforces it).
  - This avoids the 2026-11 confusion, when length, style, cadence, upload method and category changed
    in one week.
- **Never a gap.**
  - Keep at least 2 days of ready videos per channel.
  - If the morning run fails, the publisher uses the buffer and the spare run refills it.
  - A notification fires only when the buffer falls under 1 day.
- **The animation tally, per channel:** every week the auditor ties each Short's drop-off points to the
  picture on screen, ranks the kinds of picture that lose viewers, retires the channel's worst look or
  palette, queues a look challenger for the worst kind, and names the channel's 3 best Shorts as the
  bar its writer and QA work to (`channels/<slug>/analysis/pictures.json`). Each channel learns its own
  look from its own viewers.
- **A stop rule, per channel:** three cycles in a row under 45% stayed to watch, the next challenger is
  a format change; six, one owner notification: change the niche or stop the channel. Until the owner
  answers, the channel drops to 1 Short a day so it doesn't use the plan another channel needs.
- **A reviewer per channel, twice a week** (`agents/reviewer.md`): watches the channel's recent Shorts
  frame by frame next to where viewers left and writes each mistake that cost viewers into the
  channel's own `lessons.md`, which its writer follows and its QA enforces. A new channel starts with
  channel #1's general lessons (the first frame names the subject; the story is true; no reaction
  shots; the payoff is the most surprising figure) and grows its own.
- **True stories by rule:** a niche that tells facts carries sourced `facts` on every Short and no
  invented example, as on channel #1; a niche whose format is fiction (a parable series, stories)
  declares it in its profile, and the rule switches to "never presented as true".
- **A weekly digest per channel** on the Notifications page: what was tested, the verdict, what starts
  next, stayed to watch this week vs last.
- **Usage per channel:** every routine run records how long it ran and its steps
  (`channels/<slug>/usage.json`); the All channels page shows each channel's share of the week's
  Claude usage, so the owner knows when to move to a bigger plan or turn a channel down.
- **Monthly re-research:** the niche-wide outlier scan runs again monthly per channel, to catch shifts
  (new families rising, old ones fading) and add challengers to the channel's list.
- **A health score per channel** on the dashboard (green, amber or red, with the one-line reason), so a
  glance on the phone says whether anything needs the owner.

## Setup details
- **Checked branding:**
  - each name idea's @handle is tested on YouTube (taken or free);
  - names are searched for clashes with existing channels and trademarks (LinkedIn showed a "Money
    Council ®" company for ours);
  - only clean names reach the kit.
- **Optional comment replies:** an extra permission (`youtube.force-ssl`) asked for at "Connect YouTube"
  lets the system answer viewers' comments in the channel's voice. Off by default, switched per channel.

## Risks designed for
- **Linked channels:**
  - all channels share one Google account and project, so a termination for policy on one can hit the others;
  - each niche gets a policy check in research, stricter QA rules where the niche is risky, and the
    channel's own disclaimer.
- **Channels that look alike (inauthentic, mass-produced content):**
  - every channel has its own cast or style, voices, palette family, title patterns and music genres;
  - a check across channels fails a video too close to another channel's recent ones.
- **AI-content disclosure:**
  - research decides per niche whether YouTube's "altered or synthetic content" label is needed (today
    every upload says no);
  - a channel that shows **real people's photos next to a synthetic voice** sets the label (a real
    person shown in a scene they were never in is what the label is for);
  - the publisher sets it per channel, and per video when only some videos use real photos.

## Start, pause and dial down any channel
- A `Channel` record holds: slug, name, YouTube channel id, `status` (`setup`, `review`, `active`,
  `paused`) and its own video counts and slots (the table in "Video counts per channel"), backlog
  caps and long length.
- **Pause or resume** is one button on the dashboard (a Channels page and a switch on each channel).
  - Ingest writes `config/channels.json` for the routines.
  - Every channel routine reads its status first and exits in seconds when paused, so it costs no
    real usage.
  - The publisher skips paused channels.
  - The ready queue is kept, so resuming continues where it stopped.
- **Dial down or up:** change a channel's Shorts a day or long videos a week (for example 3 → 1) when
  usage runs short or after the move to a bigger plan. The video run makes that many and the posting
  slots follow; the dashboard checks the quota and usage totals first.

## Platform changes (one-time; Paisa Panchayat becomes channel #1 with no change in behaviour)
1. **Repo layout:**
   - every per-channel file moves under `channels/<slug>/`: profile, market, formats, shapes
     and the weekly loop's challenger list, topic feeds, history, `videos/`, metrics, editor ranking, feedback acknowledgements and
     notifications;
   - shared code stays where it is;
   - `generator/settings.py` gains `channel_root(slug)`, and every command takes `--channel` (default
     `paisa-panchayat`);
   - video ids stay unique per folder.
2. **Database (one migration):**
   - a `Channel` table;
   - `channelId` on Video, Topic, Template weights, Setting (per-channel rows), Notification, Feedback,
     ChannelDay and Breakdown;
   - existing rows go to channel #1.
3. **Workers:**
   - ingest, publish, stats, stats-deep and snapshot loop over active channels, each with its own
     refresh token (stored encrypted in the database by "Connect YouTube"; channel #1's current
     secret is moved in) and the shared client id and secret;
   - a **quota keeper** counts the project's units per day, puts uploads first, then thumbnails,
     stats and counters, and raises a notification before the quota runs out.
4. **Dashboard:**
   - a channel switcher in the header (every page filters by channel) and an "All channels" overview
     (status, views, queue, usage per channel, start/pause);
   - a **Channels** page with Add channel, the setup progress, the Launch review and pause/resume;
   - Analytics, the variants card and notifications per channel.
5. **Agents:**
   - **shared once:** auditor, dashboard agent and monthly review (all channels in one run);
   - **per channel:** the video run, research, the reviewer, and Scout/Studio when long videos are on
     (the prompt names the channel);
   - the improver's code changes help every channel; each channel's weekly loop is judged on its own
     Shorts, one challenger per channel at a time (the guard checks it per channel);
   - the guard limits a channel's agents to its own folder.
6. **Niche-agnostic pipeline:**
   - the channel profile declares `numbers` (none, simple or finance) and `currency`; the number check,
     the maths and money formatting run only when needed;
   - the fact-review rules come from the profile;
   - the disclaimer is per channel, and the guard checks the channel's own one;
   - voices and language are per channel (Kokoro has English US and UK, Hindi, Spanish, French and more).
7. **Keeping channels apart** (YouTube's "inauthentic content" rule): every channel gets its own cast
   or style, palette family, voice set, title patterns and music genres, and a check fails a video
   that looks like another channel's recent ones (extending the existing cover and prop overlap gates
   across channels).

## Progress
- **2026-11-17: step 1 (platform refactor) done.** Generation and all agents were paused for it
  (`generationPaused`, `agents.paused`).
  - Paths: `config/channel-layout.json` maps every per-channel file into `channels/<slug>/`; code reads
    them through `generator/channels.py` and `workers/lib/channels.ts`; `generator.run --channel`.
    Paisa Panchayat's files moved to `channels/paisa-panchayat/` (git renames, history kept).
  - Database: `Channel` table (Paisa Panchayat, active), `channelId` on Video, Topic, ChannelDay,
    Breakdown, Notification, AgentActivity, Feedback and Study. `Setting` and `Template` stay
    platform-wide; per-channel overrides live in `Channel.settings`.
  - Workers: publish, stats, stats-deep and the snapshot loop over channels, each with its own token
    (`Channel.refreshTokenEnc`, AES-256-GCM keyed by `SESSION_SECRET`; channel #1 still uses the
    `YT_REFRESH_TOKEN` secret until "Connect YouTube" stores it). Quota keeper in `workers/lib/quota.ts`.
  - Guard: every per-channel rule also covers `channels/*/…`; one Shorts experiment per channel.
  - Not yet per channel: watchdog, data audit and market still use channel #1's secret (they are
    channel #1's today); the guard doesn't yet confine a channel's agents to its own folder (step 4).

- **2026-11-17: step 2 (dashboard) done.**
  - A channel switcher in the sidebar (cookie `channel`); every page's reads are scoped to it by a
    Prisma extension (`apps/dashboard/src/lib/channel-scope.ts`); platform-wide notifications,
    feedback and agent nights (channelId null) show on every channel.
  - A Channels page: status, counts, pause and resume, Shorts a day, upload times, Add channel
    (niche, description, 1–3 references; starts in `setup`, 1 Short a day), Connect YouTube.
  - Connect YouTube: Google sign-in with a *web* OAuth client (`YT_WEB_CLIENT_ID/SECRET`), the token
    sealed with `SESSION_SECRET` (same format as the workers, which refresh it with the web client),
    `channels.list mine=true` checked, a YouTube channel already linked elsewhere refused.
  - Routines: ingest writes `config/channels.json` (status, own settings, own backlog);
    `generator/settings.py` overlays the current channel and pauses generation for a channel that
    isn't active.
  - Owner, once: create the web OAuth client and add `YT_WEB_CLIENT_ID`, `YT_WEB_CLIENT_SECRET` (Netlify
    and GitHub) and `SESSION_SECRET` (GitHub).

- **2026-11-17: step 3a (niche scan and quick verdict) done.** `workers/niche-scan.ts` + `lib/niche.ts`
  (outliers per channel, small channels' hits, length bands, title features, direction, crowding;
  `families` ranks Claude's topic labels into core/low/avoid), `niche-scan.yml` (aggregates on main,
  titles only on the `niche-data` branch for 30 days; reads with channel #1's sign-in, ~1,400 units),
  setup stages with the verdict and Continue/Stop on the Channels page, `lib/setup-sync.ts`, and
  `.claude/skills/new-channel` (scan + verdict phases). Backtest: finds big money over budget tips;
  misses the news and length lessons (`channels/paisa-panchayat/research/backtest-2026-11-17.md`).
  Next: 3b full research and advice, 3c channel pack and the niche-agnostic pipeline, 3d samples and
  the Launch review, 3e routines for many channels.
- **2026-11-17: step 3b (full research numbers) done.** `lib/research.ts` + `niche-research.ts`: families
  with direction, crowding and gaps; style targets, picture language, cast or not and the first
  second from shot sheets (Study-page format, written by Claude in the browser); video-count advice
  with reasons fitted to the quota left; top-hit comments. The skill's research phase says how Claude
  labels, watches, and writes `advice.md` and `report.md`. Not yet run end to end on a real niche (it
  needs a channel past its verdict); the Claude-labelled re-check of the backtest's news result waits
  for that run.
- **2026-11-17: step 3c (channel pack) done.** `generator/pack.py` (`channels/<slug>/channel.json`: language,
  voices, currencies, numbers mode, disclaimer, true/fiction, look, upload category; `check`, `scaffold`).
  The pipeline reads it: Shorts narrator, check-plan currencies and disclaimer, the timeline's
  disclaimer and voice language, no maths on a numbers-none channel, thumbnail label, publish's
  category. Channel #1 proven identical (state, check-plan, built timeline). Not yet done: a
  non-English Kokoro voice is untested (it may need espeak-ng data); the flat kit doesn't yet read
  `look.cast`/palettes (the director picks components); the branding kit's avatar and banner are
  described in the skill, not drawn by code; `numbers: simple` behaves like finance.
- **2026-11-17: step 3d (samples and the Launch review) done, code only** (owner: no real videos; tested
  when the first niche is added). Samples mode in `generator.run state` (3 Shorts, 1 long when advised;
  manifest `sample: true`; nothing uploads before Launch), `generator/likeness.py` (±25% against
  `style.json`), the Launch review and Launch on the Channels page, long videos a week and the shared
  quota line. Checked with tests, sample data and the dashboard preview; no sample has been rendered.
- **2026-11-17: step 3e (routines for many channels) done — step 3 complete.** `apps/dashboard/src/lib/routine-plan.ts`
  (every routine's time, days, window, UTC cron and prompt; channel #1 alone reproduces today's
  schedule; fitCheck and the shared routines a new channel moves), Launch refuses a channel that
  doesn't fit, the Launch review shows its routines, `npm run routines -- --add <slug>`, and the
  skill's routines phase (owner's yes before creating). Change to the table: reviewers are three a
  night before the 23:00 auditor, then Wed/Sat and Thu/Sun (21:07 + 30 min per channel ran into the
  auditor from the fourth channel). Not done: `market.ts` still scans only channel #1's searches.
- **2026-11-17: step 4 (hands-off layer) done.** Ingest's agent and metrics steps per channel (`workers/lib/scoped.ts`;
  proven identical for channel #1 on the live database), the weekly-loop scoreboard per live channel,
  health per channel (`lib/health.ts`: buffer, drop → the auditor's diagnosis, the stop rule with 1 a day
  for new channels only, usage share, the Monday digest, green/amber/red on the Channels page),
  `channels/<slug>/changes.json` with one change per merge, per-channel agents kept in their folder
  (branch `agent/<name>/<date>/<slug>`), channel data no longer counted as code by the guard, the
  cross-channel similarity check in check-plan, and the monthly re-scan. First live ingest: channel #1
  amber, "making videos is paused". Left to the owner: step 5 (the first real niche) and step 6 (the
  quota-increase form before a second channel launches).

## Order of work
1. **Platform refactor** (layout, database, workers, quota keeper, `--channel`). Channel #1 keeps
   running unchanged, and the test suites prove it.
2. **Dashboard:** switcher, Channels page, pause and resume, per-channel video counts (with the
   quota and usage check).
3. **`/new-channel` setup skill:**
   - the quick verdict and its Continue / Stop;
   - the full research for the niche (outlier database, topic tiers, format, the first second, the
     style study and picture language, comments, gaps) and the advice (topic kinds, video counts);
   - the channel pack, the champion recipe and challenger list from the research, and the pre-launch backlog;
   - the sample Shorts and long video, last, with the side-by-side Launch review;
   - the routine schedule for many channels (staggered times, the shared spare run, the "channel
     won't fit" check);
   - auth and routines.
4. **Hands-off layer:** the weekly loop and the reviewer per channel, drop diagnosis on stayed to watch, the animation
   tally, the stop rule, the weekly digest, usage per channel, change log and one-change rule, the
   2-day buffer, monthly re-research, health score, and the cross-channel similarity check.
5. **First real launch** with the owner's first niche, end to end.
6. **Apply for the quota increase** now (owner, form with steps): two channels at 3 Shorts a day
   already go over the 10,000-unit limit.

## Verification
- Channel #1 after the refactor: all test suites pass, and a full dry-run video
  (`generator.run state/check-plan/render --channel paisa-panchayat`) matches today's output.
- Two test channels in sample mode: the dashboard switches and filters, and pause stops the
  publisher and the routines (a routine exits on a paused channel).
- A full setup run on a sample niche: the pack passes `check-plan`, and two sample Shorts render and
  pass the gates.
- **Verdict backtest:** run the quick verdict on Paisa Panchayat's niche (a Go is expected) and on a
  niche whose hits depend on real footage or faces on camera (a "not doable" is expected). Also run
  it on one with very low demand (a Don't is expected).
- **Sample likeness:** for each sample, the measured shot length, cuts a minute and words a minute are
  within 25% of the reference's, and the cross-channel similarity check finds none of the reference
  channel's words, characters or art.
- **Video counts:** a channel set to 0 Shorts or 0 long videos makes and posts none; making ahead of
  posting stops at the backlog cap; a change that would go over the quota is warned about.
- Quota keeper: unit tests for the budget and its priority order.
- **Research backtest on Paisa Panchayat:** run the niche research as if the channel were new and
  check that it ranks billionaire and money-at-scale stories above news and personal budget, and Shorts
  of 35 s or less above longer ones. If it doesn't find our own lessons, it isn't deep enough.
- Drop diagnosis replayed on the 28 Oct – 3 Nov data finds length, topic and the upload gap.
- The research backtest on Paisa Panchayat also finds the first-second lesson: hits state the subject
  and the number in the title and first line.
- Two test channels each run their own weekly loop: a challenger on one never counts toward the
  other's verdict, and the guard blocks a second challenger on either.
- Usage per channel adds up to the runs that actually happened.
- "Connect YouTube" on a test channel stores an encrypted token, `myChannel` returns the right channel
  for each token, and connecting a channel that's already linked is refused.
