# YouTube API Services audit: answers

Form: https://support.google.com/youtube/contact/yt_api_form ("YouTube API Services - Audit and
Quota Extension Form"). Choose the option for an **audit** of an existing API client (no quota
increase is needed: one upload a day uses about 1,700 of the default 10,000 units).

Fields differ slightly over time; match each answer below to the closest field.

**Your name / organisation:** Naishadh Chawra (individual developer, no organisation)

**Contact email:** n2chawra@gmail.com

**Google Cloud project:** finance-shorts-bot. Give the **project number** (Google Cloud console →
project picker, or IAM & Admin → Settings) and the project ID.

**YouTube channel:** Money in 60, channel ID UCrRPx2PHGrTr0diYoAzvBRQ

**Website / homepage of the API client:** https://n2chawra.github.io/finance-shorts-site/

**Privacy policy:** https://n2chawra.github.io/finance-shorts-site/privacy.html

**Terms of service:** none of its own; the privacy policy links the YouTube Terms of Service.

**APIs used:** YouTube Data API v3 (videos.insert, videos.list, channels.list) and YouTube Analytics
API (reports.query).

**Scopes:** youtube.upload, youtube.readonly, yt-analytics.readonly

**Describe your API client and how it uses YouTube API Services:**

> A personal, internal tool used only by me to publish to my own YouTube channel, "Money in 60".
> It produces short, original, animated explainer videos about personal finance for an Indian
> audience. Every video is rendered by my own code: animated charts, on-screen text, and music and
> sound effects synthesised in code. No third-party footage or music is used.
>
> Once a day, a scheduled job uploads one finished video to my channel with videos.insert, as
> private with a publishAt time (7:07 PM IST), so YouTube makes it public at that time. It also
> uses videos.list to check whether a scheduled video has become public, and channels.list to
> confirm which channel is connected.
>
> Once a day it reads my own channel's YouTube Analytics (daily views, likes, comments, subscribers
> gained and average view percentage per video) and shows these numbers on a private dashboard that
> only I can access.

**Who are the users?**

> Only me, the channel owner. There is no public sign-up, and the tool does not access any other
> person's YouTube account or data.

**How is YouTube data stored and protected?**

> The OAuth refresh token is stored as an encrypted GitHub Actions secret in my private repository.
> Video metadata and my channel's analytics numbers are stored in a private Postgres database and
> shown on a private dashboard. No YouTube data is shared, sold or shown publicly. Analytics are
> refreshed daily and kept only for my own reporting.

**Does the client display YouTube data to anyone else?** No.

**Upload volume:** one video per day (at most 365 a year), each under 60 seconds.

**Why the audit is needed:**

> Videos uploaded through the API by my unverified project are locked to private. I would like my
> scheduled uploads to be published at their publishAt time as intended.

**Screenshots / demo (if asked):** screenshots of the dashboard (Overview, Queue and a video's
detail page) and of a scheduled upload in YouTube Studio. A screen recording of the sign-in
(`npm.cmd --prefix workers run auth`) followed by a publish run also works.

## Evidence uploads (screenshots in `docs/channel/evidence/`)

| Form item | Files |
|---|---|
| Privacy Policy screenshots (YouTube section, Google Privacy Policy link, deletion) | `02-privacy-policy.png` |
| Homepage screenshot (Privacy Policy link, YouTube visible) | `01-homepage.png` |
| Terms of Service documentation | `03-terms-of-service.png`, plus the link https://n2chawra.github.io/finance-shorts-site/terms.html |
| a) OAuth flow (consent screen, scopes, revocation) | take yourself: see below |
| b) Upload interface | `05-dashboard-upload-queue.png`, `06-dashboard-video-detail.png`, plus your YouTube Studio screenshot of the scheduled video |
| d) Dashboard / analytics | `04-dashboard-overview.png`, `07-dashboard-runs.png` |

OAuth screenshots to take yourself (they show your Google account, so only you can capture them):

1. **Scopes:** Google Cloud console → Google Auth Platform → **Data access** (the list of the three scopes).
2. **Consent screen:** run `npm.cmd --prefix workers run auth` and screenshot Google's permission page before
   clicking Continue (finishing it again just replaces the saved token, which is fine).
3. **Revocation:** https://myaccount.google.com/permissions → **Finance Shorts Uploader** (shows the access and the
   "Delete all connections" / remove access button). Do not click remove.
