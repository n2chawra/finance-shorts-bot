# Many channels on one platform: a one-time setup per channel, start and pause any time

_Updated 2026-11-12 after the one-month review of channel #1 (`docs/plans/2026-11-11-review.md`) and
the weekly loop (CLAUDE.md, first hard constraint): every channel runs the weekly loop instead of the
variant system, is judged on stayed to watch instead of views, starts lean, picks its look from its
niche, and has a stop rule. The niche itself is the owner's choice: research builds the channel from
it and gives no go / no-go verdict. The order of work is unchanged: the whole platform is built
before any new channel starts._

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
  units a day)**. One upload costs about 1,600, so 3 Shorts a day uses about 4,800 per channel. Two
  channels at 3 Shorts a day are 9,600 units before the dashboard's live counters (up to ~1,450) and a
  weekly long video (1,600 more): **over the limit from channel #2**. So the free quota increase
  (YouTube API audit form, about 1–3 weeks) is applied for before channel #2 launches, not #3.
- **Any niche**: the research decides the format, look, voice, whether numbers and money appear, and
  the fact rules.
- **Usage is the owner's call**: each channel has its own `dailyVideoTarget` and can be paused.

## What the owner does per channel (everything else is automatic)
1. **Tell the niche:** "Add channel" on the dashboard (or `/new-channel` here): the niche, a few lines
   and 1–3 reference channels.
2. **Create the channel on YouTube from the branding kit.** The system gives a kit on the Channels
   page: 3 name ideas, the avatar and banner as files, the description and keywords. The owner creates
   the channel and pastes them in (about 5 minutes).
3. **Click "Connect YouTube"** on the Channels page, pick the new channel on Google's consent screen.
   That's one click: the token is stored for you, with no terminal and no secrets to copy.
4. **Click "Launch"** after looking at the 3 sample Shorts (or leave notes; they get fixed and come back).

Pause, resume and "fewer videos a day" are buttons on the same page.
Once for the whole platform (not per channel): fill in YouTube's quota-increase form before the
second channel launches (the system raises a notification with the steps).

## The flow for a new channel
1. **Ask:** in this app, `/new-channel` with the niche, a few lines of description and 1–3 reference
   channel links. A dashboard "Add channel" form creates the same request.
2. **Research (automatic, about 1–2 h, run here in the desktop app, which has the browser):**
   - **Market:** with the YouTube Data API, read the reference channels and the niche's top
     searches: the videos that beat their channel's median (outliers), their titles, lengths,
     Shorts vs long, cadence, and the formats behind them. This produces the demand-first format list
     with reference videos, the same rule that saved our channel.
   - **Style, and it decides the look:** watch 3–5 of the reference channel's top Shorts in the browser,
     frame by frame (the `yt-style` method we used on The Curious Plot): hook, pacing, length, visuals,
     captions, sound. Record the niche's **picture language**, what its hits show: real photos,
     footage, maps, simple drawings, characters. The channel's look follows it: if characters are not
     how the niche's hits look, the channel starts **without a cast** (narrator, objects, photos), not
     with our cartoon kit by default. It maps the look onto our Remotion kit (what we have, what we
     need) and never copies their characters, art or words.
   - **The first second:** the openings of the niche's top 20 hits (title, first spoken line, what
     the first frame shows), read in the browser. Do they state the subject and the number up front?
     They become the opening rules and examples in the channel's writer instructions: the lesson that
     cost channel #1 its first month (titles that held back the subject; 55–76% swiped away).
   - **Fit:** the language and region, whether there are numbers or money (and so whether the maths,
     the number check and money formatting switch on), the fact sources and the fact-review rules, the
     disclaimer the niche needs, and YouTube's monetisation rules for it.
3. **Build the channel pack (automatic)** in `channels/<slug>/`:
   - `profile.md`;
   - `formats.json` and `shapes.json` (starting from the shared library);
   - `market.json` (searches);
   - the champion recipe in the channel's writer instructions and `cycle/backlog.json` (the weekly
     loop's first challengers, from the research);
   - `topics.json` (15–20 first topics with sourced facts);
   - a look (palettes, stage, captions);
   - voices (Kokoro voices for the language);
   - a cast: picked and restyled from a shared character library, new characters drawn when the niche
     needs them, or narrator-only;
   - the disclaimer;
   - channel name ideas, description, keywords, avatar and banner (drawn like `ChannelArt.tsx`).
4. **Proof (automatic, then the owner):** three sample Shorts go through the normal pipeline
   (plan → script → checks → render). The dashboard shows them with the channel pack in a **Launch
   review**. The owner approves or leaves notes, and notes are fixed and re-rendered.
5. **Branding kit and connect (owner):**
   - the kit is shown on the Channels page: name ideas, avatar and banner PNGs to download, and the
     description and keywords to copy;
   - "Connect YouTube" runs Google's sign-in from the dashboard (Netlify) with the shared OAuth client;
   - the refresh token is stored encrypted in the database (keyed by `SESSION_SECRET`);
   - the system checks the token belongs to a new channel (`myChannel`) and links it.
6. **Activate (automatic, on "Launch"):**
   - the channel's routines are created (video run, research, and Scout/Studio if long videos are on),
     in free usage windows;
   - its upload slots are set;
   - status becomes `active`, and the first upload happens the next morning.

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
   - how the hook opens: transcripts of the top 20 hits, read in the browser;
   - upload cadence and the times of day the hits went out.
4. **Comments of the top hits, mined** for what viewers ask for next. That gives the first topic list
   in the audience's own words, plus the language and countries.
5. **Gaps and saturation:** topics with high demand and few recent videos; families rising or fading
   (recent views per day vs six months ago).
6. **No verdict on the niche** (owner, 2026-11-12): the owner chooses the niche from their own
   research. This research only builds the channel well for it; it reports risks it finds (policy for
   AI-made content, medical or financial claims, kids content, reused footage) as setup rules, not as
   a reason not to launch.
7. Everything lands in `channels/<slug>/research/`: the niche report, the outlier database and the
   style study. The setup files are built from it.

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
- **Launch with a backlog:** 6–9 videos are made before going live. The first week never depends on one
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
  `paused`) and its own settings (`dailyVideoTarget`, `uploadTimes`, long videos on or off,
  `longPerWeek`).
- **Pause or resume** is one button on the dashboard (a Channels page and a switch on each channel).
  - Ingest writes `config/channels.json` for the routines.
  - Every channel routine reads its status first and exits in seconds when paused, so it costs no
    real usage.
  - The publisher skips paused channels.
  - The ready queue is kept, so resuming continues where it stopped.
- **Dial down:** lower a channel's `dailyVideoTarget` (for example 3 → 1) when usage runs short; the
  video run makes fewer and the slots follow.

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
   - **per channel:** the video run, research, and Scout/Studio when long videos are on (the prompt
     names the channel);
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

## Order of work
1. **Platform refactor** (layout, database, workers, quota keeper, `--channel`). Channel #1 keeps
   running unchanged, and the test suites prove it.
2. **Dashboard:** switcher, Channels page, pause and resume, per-channel settings.
3. **`/new-channel` setup skill:**
   - the niche-wide research for the owner's chosen niche (outlier database, topic tiers, format, the
     first second, the picture language, comments, gaps; no verdict);
   - the channel pack, the champion recipe and challenger list from the research, and the pre-launch backlog;
   - the Launch review, auth and routines.
4. **Hands-off layer:** the weekly loop per channel, drop diagnosis on stayed to watch, the animation
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
- A full setup run on a sample niche: the pack passes `check-plan`, and three sample Shorts render and
  pass the gates.
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
