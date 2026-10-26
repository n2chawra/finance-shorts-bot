# Channel profile: Paisa Panchayat

Every agent reads this before its own instructions. It holds everything that is about **this
channel** rather than about the machine: who it's for, what it covers, where facts come from and
which rules of its field apply. A second channel is a copy of the repository with this file,
`config/market.json` and the cast changed (see `docs/guide/13-new-channel.md`).

**Name:** Paisa Panchayat (renamed from "Money in 60" on 2026-10-18, a widely reused name). The idea:
the cast sits like a council and settles one money question per video, with real maths and a clear
verdict. Channel art: `assets/channel/` (drawn by `remotion/src/sheets/ChannelArt.tsx`).

**Demand first since 2026-10-21** (owner reset): "We have to make videos that people want to see,
not what we want to create." After a week of news-led videos (17 videos, 1-60 views, viewers
watching 20-35% of each Short), the channel makes only what people already watch in the millions
in personal finance: rich vs poor, what the rich know, the traps, how companies really make money,
what a salary really leaves you, which money level you are on. The formats, with their reference
videos and views, are in `improvement/research/formats.json`. The name and the cast (Rohan,
Priya, Sharma Uncle, Sikka) stay: they are the brand, and they act the skits.

## Who it's for
- **Audience:** English-speaking adults, roughly 18-35, **around the world** (most views so far from
  India and the US). **Global first** (owner, 2026-10-23): about two in three videos are ones anyone
  anywhere can relate to (`topic.reach: "global"`), like "Why billionaires never sell their stock".
  Earning their first salaries, carrying an EMI or a credit card, wondering why they're not rich
  yet and how the rich do it.
- **Promise:** the money secrets, traps and rich-vs-poor truths people actually want, with real,
  computed numbers.
- **Language and voice:** plain English. Global videos use names and situations known everywhere; India Shorts use Indian life and simple Indian English (no
  Hinglish); US Shorts use US life. No jargon a newcomer can't follow.
- **Tone:** entertaining first: a skit with a punchline, characters who react, a friend who did the
  maths. Never an advisor; nobody tells the viewer what to buy.

## Money in every video (`currency` in the script)
- **US dollars by default** (`"currency": "USD"`): global stories, universal ideas (compounding,
  debt, inflation, index investing) are told in dollars, the money most of the audience thinks in.
- **A country's own currency for a story about that country:** a Fed decision in dollars, a Bank of
  England or UK budget story in pounds (`GBP`), an ECB story in euros (`EUR`), an RBI, SEBI or Indian
  budget story in rupees (`INR`, with lakh and crore).
- Keep the story true to its currency: US credit cards charge around 20–25% a year, Indian cards
  around 3.5% a month; a US savings account pays a few percent, an Indian FD 6–7.5%.
- **Global videos are in dollars** and need no country: famous people and companies, how the rich
  think, money at scale, compounding and debt. **Local videos** (India in `INR`, US in `USD`) are for an
  occasion (Diwali, Black Friday, tax day) or a local format with 1M+ views: at most one Short a day
  and about one in three overall (`generator/reach.py`). UK and Europe only when the story is about them.

## What it covers
- **Topics (global):** compound interest, investing basics and index funds, retirement saving
  (401(k)s, IRAs, pensions, ISAs: explained, never recommended), credit cards and debt payoff,
  loans and mortgages, inflation and what it does to savings, emergency funds, budgeting and spending
  habits, buying vs renting, salaries and raises, cars and EMIs, how the rich build and keep wealth,
  how banks, cards and apps make money, taxes in general terms. News only when everyone is already
  talking about it, told in a format, never as a bulletin.
- **India stories:** SIPs and mutual funds, FDs, PPF, EPF, NPS, Indian tax regimes, RBI and SEBI news.
- **Never:** single stocks, tips, market predictions, crypto trading, options or F&O strategies,
  guaranteed returns, anything that reads as investment advice.
- **Formats:** Shorts (45–75 s story skits with levels, that loop) and long videos (8–12 min, list and "explained"
  formats) with the recurring cast: Rohan makes the mistake (the "poor" move), Priya explains,
  Sharma Uncle is the rich one who has seen it all, Sikka cheers.

## Where facts come from
Official sources first; a news article may point to a story, but each figure needs the page where
it appears. The fact carries the currency it was published in.
- **Global:** IMF (imf.org), World Bank (worldbank.org), OECD (oecd.org), BIS (bis.org)
- **US:** Federal Reserve (federalreserve.gov): rates; BLS (bls.gov): CPI, jobs; BEA (bea.gov);
  Treasury (treasury.gov); SEC (sec.gov) and FINRA (finra.org): investor rules; CFPB
  (consumerfinance.gov): credit cards and loans; New York Fed (newyorkfed.org): household debt
- **UK:** Bank of England (bankofengland.co.uk), ONS (ons.gov.uk), HMRC and gov.uk, FCA (fca.org.uk)
- **Euro area:** ECB (ecb.europa.eu), Eurostat (ec.europa.eu/eurostat)
- **India:** RBI (rbi.org.in), SEBI (sebi.gov.in), AMFI (amfiindia.com), Income Tax Department
  (incometax.gov.in), the Budget (indiabudget.gov.in), PIB (pib.gov.in), MoSPI (mospi.gov.in)

## Calendar this channel lives by
Spending moments people talk about, each told in a format: Diwali and festive sales, Black Friday
and holiday spending (Nov–Dec), New Year money resolutions (January), salary-hike and bonus season
(India: April; US: year end), US tax day (15 April), the Indian Budget (1 Feb) and ITR deadline
(31 Jul), back-to-school costs (Aug–Sep).

## Rules of the field
- **Education, not advice:** no product, fund or stock recommendations anywhere. Name account types
  only to explain them. Different countries regulate advice (SEC/FINRA, FCA, SEBI); we stay on the
  education side of all of them.
- **Disclaimer** on every video: "Illustrative only. Not financial advice." (a hard rule in
  `CLAUDE.md`, enforced by the guard): a small line over a Short's last moments and in every
  description; the end card in long videos. Descriptions add: speak to a licensed financial adviser in your
  country before making financial decisions.
- **Assumed returns** stay realistic and are stated as assumptions on screen: broad stock market
  7–10% a year, savings and deposits 3–5% (US/UK/EU) or 6–7.5% (India), loans and mortgages at
  current local rates, credit cards 20–25% a year (US) or 3–3.75% a month (India).
- **YouTube:** finance is a sensitive ("your money or your life") topic; accuracy and sourcing
  protect the channel as much as the viewer.

## Where it is in the market
`config/market.json` holds the searches the daily market job runs for this niche. Change them
when the channel's focus changes.
