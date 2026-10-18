# Channel profile: Paisa Panchayat

Every agent reads this before its own instructions. It holds everything that is about **this
channel** rather than about the machine: who it's for, what it covers, where facts come from and
which rules of its field apply. A second channel is a copy of the repository with this file,
`config/market.json` and the cast changed (see `docs/guide/13-new-channel.md`).

**Name:** Paisa Panchayat (renamed from "Money in 60" on 2026-10-18, a widely reused name). The idea:
the cast sits like a council and settles one money question per video, with real maths and a clear
verdict. Channel art: `assets/channel/` (drawn by `remotion/src/sheets/ChannelArt.tsx`).

**Global since 2026-10-18** (owner): the channel was for Indian viewers only; Indian audiences reward
animated finance videos less, so it now speaks to English-speaking viewers anywhere, India
included. The name and the cast (Rohan, Priya, Sharma Uncle, Sikka) stay: they are the brand.

## Who it's for
- **Audience:** English-speaking adults, roughly 20–40, anywhere: the US, UK, Canada, Australia,
  Europe, India and the rest. Earning, starting to save and invest, often carrying some debt. They
  want to know what a money choice really costs them.
- **Promise:** every video turns one money decision into real, computed numbers, with a story.
- **Language and voice:** plain international English. No jargon a newcomer can't follow, no slang
  only one country uses, no Hinglish.
- **Tone:** a friend who did the maths, never an advisor. Nobody tells the viewer what to buy.

## Money in every video (`currency` in the script)
- **US dollars by default** (`"currency": "USD"`): global stories, universal ideas (compounding,
  debt, inflation, index investing) are told in dollars, the money most of the audience thinks in.
- **A country's own currency for a story about that country:** a Fed decision in dollars, a Bank of
  England or UK budget story in pounds (`GBP`), an ECB story in euros (`EUR`), an RBI, SEBI or Indian
  budget story in rupees (`INR`, with lakh and crore).
- Keep the story true to its currency: US credit cards charge around 20–25% a year, Indian cards
  around 3.5% a month; a US savings account pays a few percent, an Indian FD 6–7.5%.
- **About one video in five** may be an India story; the rest are global or about the US, UK or
  Europe. Variety across countries matters as much as variety across topics.

## What it covers
- **Topics (global):** compound interest, investing basics and index funds, retirement saving
  (401(k)s, IRAs, pensions, ISAs: explained, never recommended), credit cards and debt payoff,
  loans and mortgages, inflation and what it does to savings, emergency funds, budgeting and spending
  habits, buying vs renting, interest rates, taxes in general terms, and the news that moves them
  (central bank decisions, inflation releases, big rule changes).
- **India stories:** SIPs and mutual funds, FDs, PPF, EPF, NPS, Indian tax regimes, RBI and SEBI news.
- **Never:** single stocks, tips, market predictions, crypto trading, options or F&O strategies,
  guaranteed returns, anything that reads as investment advice.
- **Formats:** Shorts (30–45 s) and long explainers (4–6 min) with the recurring cast: Rohan makes
  the mistake, Priya explains, Sharma has seen it all, Sikka cheers.

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
Fed (FOMC) meetings, about every six weeks; US CPI release (mid-month); ECB and Bank of England rate
decisions; US tax day (15 April) and the UK tax year (6 April); Black Friday and holiday spending
(Nov–Dec); New Year money resolutions (January); back-to-school costs (Aug–Sep). For India stories:
the Budget (1 Feb), RBI MPC meetings, ITR deadline (31 Jul), Diwali spending, monthly AMFI data.

## Rules of the field
- **Education, not advice:** no product, fund or stock recommendations anywhere. Name account types
  only to explain them. Different countries regulate advice (SEC/FINRA, FCA, SEBI); we stay on the
  education side of all of them.
- **Disclaimer** on every video: "Illustrative only. Not financial advice." (a hard rule in
  `CLAUDE.md`, enforced by the guard). Descriptions add: speak to a licensed financial adviser in your
  country before making financial decisions.
- **Assumed returns** stay realistic and are stated as assumptions on screen: broad stock market
  7–10% a year, savings and deposits 3–5% (US/UK/EU) or 6–7.5% (India), loans and mortgages at
  current local rates, credit cards 20–25% a year (US) or 3–3.75% a month (India).
- **YouTube:** finance is a sensitive ("your money or your life") topic; accuracy and sourcing
  protect the channel as much as the viewer.

## Where it is in the market
`config/market.json` holds the searches the daily market job runs for this niche. Change them
when the channel's focus changes.
