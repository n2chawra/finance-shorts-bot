# Channel profile: Money in 60

Every agent reads this before its own instructions. It holds everything that is about **this
channel** rather than about the machine: who it's for, what it covers, where facts come from and
which rules of its field apply. A second channel is a copy of the repository with this file,
`config/market.json` and the cast changed (see `docs/guide/13-new-channel.md`).

## Who it's for
- **Audience:** salaried Indians, roughly 22–40, earning and starting to save; urban, English-first,
  comfortable with Hinglish. They want to know what a money choice really costs them, in rupees.
- **Promise:** every video turns one money decision into real, computed numbers, with a story.
- **Language and voice:** Indian English. Amounts in ₹ with Indian grouping (lakh, crore).
- **Tone:** a friend who did the maths, never an advisor. Nobody tells the viewer what to buy.

## What it covers
- **Topics:** SIPs and mutual funds, compounding, FDs, PPF, EPF, NPS, tax (old vs new regime, 80C,
  capital gains), credit cards, loans and EMIs, insurance basics, budgeting and spending habits,
  inflation, emergency funds, retirement, and the news that moves them (RBI, SEBI, Budget).
- **Never:** single stocks, tips, market predictions, crypto trading, F&O strategies, guaranteed
  returns, anything that reads as investment advice.
- **Formats:** Shorts (30–45 s) and long explainers (4–6 min) with the recurring cast: Rohan makes
  the mistake, Priya explains, Sharma has seen it all, Sikka cheers.

## Where facts come from
Official sources first; a news article may point to a story, but each figure needs the page where
it appears:
- RBI (rbi.org.in): repo rate, monetary policy, rules for banks and cards
- SEBI (sebi.gov.in): mutual fund, F&O and finfluencer rules
- AMFI (amfiindia.com): SIP inflows, folios, fund data
- Income Tax Department (incometax.gov.in) and the Budget (indiabudget.gov.in): slabs, deductions
- PIB (pib.gov.in): government announcements, small-savings rates
- MoSPI (mospi.gov.in): CPI inflation
- EPFO (epfindia.gov.in): EPF rate

## Calendar this channel lives by
Budget (1 Feb), new financial year (1 Apr), ITR deadline (31 Jul), advance tax (15 Jun, Sep, Dec,
Mar), 80C season (Jan–Mar), RBI MPC meetings (every two months, dates on rbi.org.in), Diwali and
Dhanteras spending, festive sales, appraisal season (Mar–Jun), monthly AMFI data (around the 10th).

## Rules of the field
- **SEBI finfluencer rules:** no investment advice and no stock or fund recommendations without
  registration; we are education only. Never name a fund to buy.
- **Disclaimer** on every video: "Illustrative only. Not financial advice." (a hard rule in
  `CLAUDE.md`, enforced by the guard).
- **Assumed returns** stay realistic and are stated as assumptions on screen: equity 10–12%, FDs
  6–7.5%, loans 9–16%, credit cards 3–3.75% a month.
- **YouTube:** finance is a sensitive ("your money or your life") topic; accuracy and sourcing
  protect the channel as much as the viewer.

## Where it is in the market
`config/market.json` holds the searches the daily market job runs for this niche. Change them
when the channel's focus changes.
