# India maps channel: niche notes (24 Nov 2026)

The owner's next channel idea, saved from a planning session so a new session can start from it. Status:
**idea, not started**. The next step is `/new-channel` (quick verdict) in the Claude desktop app.

## The idea

A Hindi channel of animated India map Shorts: how states and borders formed, maps that fill in every
state, India against the world. It runs on the map channel's flat kit, but with a different audience
(Hindi speakers in India) and different topics, so it doesn't compete with
`geography-maps-geopolitical-mysteries`.

## Why: the evidence

From the map channel's niche scan of 17 Nov (`channels/geography-maps-geopolitical-mysteries/research/`:
`families.json`, `report.md`; titles and views on the `niche-data` branch,
`git show origin/niche-data:geography-maps-geopolitical-mysteries.json`).

| Channel | Subs | Median Short | What they make | Length |
|---|---|---|---|---|
| Mihul Rawat | 53.6K | **395K** | how a region was divided, lost territories, border explainers, India vs other countries | 30–42 s |
| Gyano Trick | 25.7K | **143K** | what-ifs about India ("7 sister states became a country") | 25–36 s |
| Ankit map | 61.2K | **92K** | Hindi "every state's ___" maps (famous for, festivals) | 16–31 s |
| Sudarshan Gurjar (Unacademy) | 1.06M | 165K | India geography explainers: dams, rivers, projects (exam style) | 70–150 s |
| Adda247 Skills (Prashant Dhawan) | 1.8M | — | news commentary with a presenter's face: **not our model** | long |

For comparison, our map channel gets about 1K views a Short (24 Nov).

Top India videos in the scan:
- All Lost Territories of India: 3.9M
- How Punjab was Divided: 3.7M
- तुम्हारा State किस लिए फेमस है? ("What is your state famous for?"): 3.6M
- India–Pakistan border Explained: 2.9M
- 11 Border Countries of India Explained: 2.1M
- India's Most Powerful Dam Is Tilting?: 2.1M
- What If India's 7 Sister States Became a New Country?: 1.1M

**It's not an empty niche.** The "India's maps and states" family had 293 Shorts from 17 channels in 30
days, with a **median of 4,525 views**. A few channels win big and most flop. What separates them:
- **Topic:** Mihul's "Indian states Explained: ep1 Andhra Pradesh" got 32K; his "How Punjab was Divided" got 3.7M.
- **Length:** 20–40 s.
- **The first second:** an emotional question on screen at once.

Our edge is directed shots that look better than these one-person, phone-app channels, made daily.

**Long videos:** India long videos in the scan had a 330K median, with only 1 channel posting one in
30 days. This is a gap, but the sample is small (20 videos, 5% hit rate).

**Caveat:** this scan came from world-geography searches, so it saw only part of the India niche. The
quick verdict must search India terms, e.g. "how state was divided", "har state ka", "India border
explained", "Indian states map".

## Video types (ranked)

1. **How a state or region was formed or divided**: Punjab, Bengal, Assam, Andhra/Telangana, how Sikkim,
   Goa and Hyderabad joined India, the 7 sisters.
2. **"Har state ka ___" map fill**: each state lights up with its food, festival, river, old name or
   nickname. 20–30 s. Every viewer looks for their own state and comments ("mera state?").
3. **India and its neighbours**: border countries, why a border bends, enclaves, the Siliguri corridor.
4. **State vs country**: "UP has more people than Brazil". Numbers computed by code.
5. **India's big projects on a map**: dams, a sea dam (Kalpasar), rail lines, river links. Also good for long videos.
6. **What-ifs about India**: light ones only ("What if Bangladesh attacked India" got 2.3K).

**Skip:** IPL and cricket (the map is just decoration), rankings of gods or religions, news commentary,
taking sides between communities.

## Decisions so far (owner, 23–24 Nov)

- **Language:** everyday spoken Hindi, not pure (shuddh) Hindi. Keep common English words (बॉर्डर, स्टेट,
  मैप) but write them in Devanagari so Kokoro says them properly.
- **Titles:** English or Roman-script Hinglish, because people search in Roman script.
- **Voice:** Kokoro Hindi, at **1.5× speed** (the owner's choice after the samples). Voices: `hf_alpha`,
  `hf_beta` (female), `hm_omega`, `hm_psi` (male). **Which one is still the owner's choice.** At 1.5× the
  28-second test script ran 17–19 s. The test script (Telangana, regenerate with
  `kokoro_onnx`, `lang="hi"`, `speed=1.5`):
  > क्या आप जानते हैं, तेलंगाना भारत का सबसे नया राज्य क्यों है? साल उन्नीस सौ छप्पन में, भाषा के आधार पर
  > राज्य बनाए गए, और तेलुगु बोलने वाले इलाकों को मिलाकर आंध्र प्रदेश बना। लेकिन तेलंगाना के लोगों को लगता
  > था कि उनका हिस्सा पीछे छूट रहा है। करीब साठ साल तक आंदोलन चला। और फिर, दो जून दो हज़ार चौदह को, नक्शे
  > पर एक नई रेखा खिंची, और तेलंगाना भारत का उनतीसवाँ राज्य बन गया। अब बताइए, आपका राज्य कब बना था?
- **Captions:** the owner thinks Hindi audio doesn't need captions. CLAUDE.md requires captions on every
  video, so dropping them needs a per-channel setting and a rule change. **Still open.** The suggestion
  was to launch with captions and let the weekly loop test none. Hindi word timings for captions are
  untested (`renderer/engine/voice.py` `words_from_phonemes` was built on English).
- **Serious topics:** the owner wants serious and sensitive Indian topics because they get attention.
  - Allowed: Partition, divisions, lost territories, borders, all told as sourced history.
  - Not allowed: religion against religion, opinions on Kashmir, political parties, insulting
    neighbours, unsourced "hidden truth".
  - The owner **declined** a hold-for-approval flag on sensitive topics, so the profile and QA rules
    have to carry this.

## Risks to plan for

- **The map must be India's official map**, including all of Kashmir and Arunachal. Showing anything
  else brings legal trouble and angry comments in India. Natural Earth draws a different India border,
  so state shapes need another source, such as DataMeet's openly licensed shapes (licence to confirm).
- **Indian views pay much less per view**, but at 100K+ a Short the Shorts route to monetisation is
  realistic. YouTube raises that route to 20M Shorts views in 90 days for channels applying after 31 Jan 2027.
- **Kokoro's Hindi voices** are its weaker ones. The samples must sound natural, or fall back to English
  narration with Hinglish titles.
- **Usage:** this would be channel #5 on one Pro plan. The Launch review checks that its routines fit
  the 5-hour windows.
- **Variety:** own scripts, own look and own recipe. Never translations or re-voiced copies of the
  map channel's videos (YouTube's reused-content and inauthentic-content rules).

## Next step

In the Claude desktop app:

```
/new-channel India maps: how states and borders formed, every-state maps, India vs the world.
Everyday Hindi narration (Kokoro, 1.5×), Hinglish titles, 20–40 s Shorts.
References: Mihul Rawat, Ankit map, Gyano Trick.
Read docs/research/india-maps-niche-2026-11-24.md first.
```

## Also discussed (not chosen)

- **History on maps as its own channel:** weaker. The "empires and how maps changed" family has a 6,255
  median, and the history hits that work ("Why Chile is so long", "Why Cyprus is divided") overlap the
  map channel's core. Better tested as an event-first history challenger on the map channel
  (`channels/geography-maps-geopolitical-mysteries/cycle/backlog.json`) before any spin-off.
- **New map formats for the map channel:**
  1. Animated cartograms (countries resize by a number).
  2. "Walk straight from your city".
  3. Antipodes ("dig through the Earth").
  4. A word's journey on a map (chai or tea; the scan's "why cow became beef" got 9.5M).
  5. A product's passport.
  6. Same latitude, different world.

  The picks were #1 and #4, as weekly-loop challengers once research shows demand for each
  (`research/formats.json`). **Not queued yet.**
