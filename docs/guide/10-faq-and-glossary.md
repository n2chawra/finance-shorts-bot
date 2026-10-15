# 10. FAQ and glossary

## Questions people ask

**Is it really fully automatic?**
Generation, review, rendering, storage, queueing, stats and the dashboard are. Uploading is
automatic too, except that YouTube keeps API uploads private until the API audit is approved, so
for now you upload the day's video by hand (about two minutes with the dashboard's download and
copy buttons). After approval it's hands-off.

**Won't YouTube demonetise AI-made videos as "mass-produced"?**
That's the main design risk, so variety is enforced by code: templates can't repeat within a
window, topic categories rotate, near-duplicate topics are blocked for 60 days, and palette,
music (genre, key, tempo), hook style, call to action and the opening words of titles and
descriptions all change every video. The system also keeps building *new* templates. Each video
explains a specific, concrete idea with computed numbers, not generic filler.

**How do you stop the AI from getting numbers wrong?**
The AI never writes a result. It writes inputs (₹10,000 a month, 12%, 20 years) and text with
placeholders; code computes every figure, a separate number checker recomputes them with
closed-form formulas, and any number it can't trace to an input fails the video.

**How do you stop wrong financial claims?**
A separate fact-reviewer agent with fresh context checks Indian tax and product rules, SEBI/RBI
rules, realistic assumptions, misleading comparisons and advice-like wording. If unsure, it must
treat a claim as wrong. Every video and description ends with "Illustrative only. Not financial
advice."

**Where does the music come from?**
It's synthesized in code: oscillators, filters and noise build five genres in any key and tempo,
plus the sound effects. Nothing is downloaded, so no copyright claims.

**Why no voiceover?**
Most Shorts are watched muted, text-led videos are clearer for numbers, and it avoids
text-to-speech that sounds robotic or cloned voices with rights issues.

**What does it cost?**
A Claude Pro subscription for the routines. GitHub Actions, Netlify, Supabase and the YouTube API
are on free tiers.

**What if a run fails?**
The run first repairs itself (rewrites the script, or fixes a template bug if the tests pass),
then retries with a different template. One night run makes all three videos, and an afternoon spare
run makes up for failures or usage limits. Failed videos are saved with the reason and are never
uploaded.

**Could the AI do something harmful, like delete videos or spam uploads?**
No. The AI sessions hold no YouTube or database credentials; they can only push commits to the
repo, and they're told not to touch the workers, workflows or settings. Uploading is done by a
GitHub Action that uploads at most one video a day.

**Why GitHub as the middle layer?**
It's free, versioned, inspectable storage the AI can write to without secrets, and its Actions
can run the privileged jobs on a schedule. Large MP4s go into Releases, not the git history.

**Why is the database in Singapore but the API in Ohio?**
Supabase was created in Singapore (closest to India); Netlify's free plan runs functions in Ohio.
Switching the database driver cut each query to a single round trip (~220 ms), which made the
dashboard about 10× faster. Moving both to one region is possible later.

**How fresh are the numbers on the dashboard?**
Views, likes and comments are live (within about a minute). Subscribers gained and average %
viewed come from YouTube Analytics, which YouTube publishes 1–2 days late. Every page refreshes
every 30 seconds.

**How much of this did an AI write?**
The system was designed and built with Claude Code as a pair programmer; the running system uses
Claude (in scheduled routines) as the planner, writer and reviewers. Every number, render and
upload step is deterministic code with tests.

## Glossary

| Term | Meaning |
|---|---|
| **Routine** | A scheduled Claude Code session in the cloud that runs `generator/prompts/routine.md` |
| **Run** | One routine session: makes a video, does template work, or idles |
| **Template** | A Python class that animates one kind of story (e.g. a quiz countdown) |
| **Script** | The JSON a template renders: numeric inputs plus on-screen text with placeholders |
| **Plan** | The planner's choice of topic, template, style, title and description (`plan.json`) |
| **Manifest** | `videos/<id>/manifest.json`, the shipped video's summary that ingest reads |
| **Contact sheet** | `preview.png`: eight key frames in one image, what QA reviews |
| **Number check** | Code that recomputes every on-screen figure and rejects untraceable numbers |
| **Fact review / QA review** | Separate AI agents checking claims, and the rendered frames |
| **Backlog** | Videos ready to publish (`queued`); capped at 30 |
| **Daily target** | Videos the routines aim to make per IST day: 3 |
| **Template work** | A run that builds or improves a template instead of making a video |
| **Variety rules** | Code-enforced rotation of templates, topics, styles and wording |
| **Ingest** | The GitHub Action that copies manifests into the database and writes `config/settings.json` |
| **Publish** | The GitHub Action that uploads one video a day to YouTube |
| **Stats** | The GitHub Action that pulls YouTube Analytics into the database |
| **Release** | A GitHub Release `video-<id>` holding the MP4 |
| **Media branch** | Temporary `media/<id>` branch a routine pushes so a workflow can create the Release |
| **publishAt** | YouTube's scheduled-publish time: uploaded private, goes public at 12:37 or 19:07 IST |
| **Audit** | Google's review of the API project; until approved, API uploads stay private |
| **Live counts** | Public view/like/comment counters read from YouTube within about a minute |
| **IST** | India Standard Time, UTC+5:30; every schedule in this project is in IST |
| **L / Cr** | Lakh (100,000) and crore (10,000,000), used in on-screen numbers |
