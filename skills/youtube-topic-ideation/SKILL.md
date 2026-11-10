---
name: youtube-topic-ideation
description: Find and rank Shak Clips video topics with real demand (Trends YouTube Search, autocomplete, outliers, news velocity) and keep topics.md as a scored backlog.
---

# YouTube Topic Ideation (Shak Clips)

Use for weekly planning of the 7 slots, and every news morning (Mon/Wed/Fri/Sun) before 12:00 UTC so the 22:00 UTC upload is on time.
**[official]** = confirmed on an official page (see Sources). **heuristic (unverified)** = a rule of thumb.

## 1. Weekly slots
| Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|---|---|---|---|---|---|---|
| News | True history | News | What-if/science | News | Top-5 | News |

Four news slots decay fast, and three evergreen slots build up over time.
**Balance rule** (heuristic): at least 2 of the 4 weekly news videos should explain an *ongoing* story, so they stay searchable for weeks. Never fill an evergreen slot with news.

## 2. Free demand signals (use at least 2 per idea)
1. **Google Trends, YouTube Search**
   - On trends.google.com, set the search-type menu (it defaults to "Web Search") to **YouTube Search**, and set the country to United States.
   - Use the past 7 days for news, and the past 5 years for evergreen topics to spot seasonality.
   - Compare up to 5 phrasings and note the "Rising" related queries.
   - Values are *relative* (0–100) and come from a sample, and very low volumes show as 0 **[official]**. A 0 doesn't prove there is no demand.
2. **YouTube autocomplete**
   - Type the seed into YouTube search (signed out), then seed + a…z, plus "what if", "why did", "history of", "what happened to".
   - Phrases that autocomplete are being searched (heuristic). If WebFetch can't reach a suggestion source, the owner reads them off the app. Never work around a block.
3. **Studio Trends/Research tab (owner pastes it weekly)**
   - It shows top searches from your audience over the last 28 days, "content gaps" (searches with too few good results; shown for Shorts), and interest from very low to very high **[official]**.
   - It may be limited by country, language or device **[official]**.
4. **Outlier method**
   - A video at **≥3× its channel's median** views (median of the last 10–20 long uploads) shows the *topic* or angle has pull beyond that channel's audience. This threshold is a heuristic, and we don't lower it.
   - Use `youtube-free-research` (free) or `youtube-competitor-outliers`.
   - From 2026-12-08, `vidiq_outliers` costs 5 credits a call; budget about 30 credits a month for ideation.
5. **News velocity (news slots only)**
   - Count the major US outlets with new stories in the last 24 h (≥3 is high) and check the 7-day YouTube Search curve is rising.
   - Check the story is still unresolved; explainers do best while people are still asking "why".
   - Publish within 24–72 h (heuristic).

**Reused-content rule [official]:** content that only reads out other material, such as website text or news feeds, isn't eligible for monetisation. Every news idea needs its own explanatory angle, written into the backlog *before* scripting.

## 3. Score: Demand × Gap × Fit (1–5 each, max 125)
| Score | Demand | Gap (competition) | Fit |
|---|---|---|---|
| 5 | Rising in Trends **and** autocompletes **and** an outlier exists | No good video in the last 12 months, or only big channels with old videos | Strong visual metaphor, our own angle is obvious, US interest, ad-safe |
| 3 | Two signals, flat trend | Some coverage, but small channels still rank | Drawable; angle needs work |
| 1 | One weak signal | Many strong, fresh videos | Hard to draw, or needs footage we don't have |

- **Decision:** ≥60 make this week · 30–59 backlog · <30 drop (heuristic).
- **News urgency:** multiply by 1.0 within 24 h, 0.7 at 48 h and 0.4 at 72 h or more.

**Vetoes (score = 0):**
- needs third-party photos or footage the owner hasn't supplied;
- unverifiable allegations that can't be labelled clearly;
- tragedy where the angle would exploit the victims;
- aimed at children (it would have to be set "made for kids");
- medical or financial advice;
- copying another creator's video concept one-to-one.

## 4. Series and spin-offs
- Series with distinct storylines are explicitly fine; mass-produced or templated videos, and characters "put in the same situation over and over", are not **[official]**. Every episode needs a new question and its own conclusion.
- When a video beats 1.5× the channel median (engaged views, at 7 d), spawn **one** of these:
  - **Sequel:** "What happened next" or the other side of the story.
  - **Same question, new subject:** what-if X becomes what-if Y, with a new mechanism.
  - **Top-5 roll-up:** five related cases, with the original as #1.
  - **Short series:** 3 facts that didn't make the cut, each as a standalone Short.
- Give each series a playlist, and put the series name at the *end* of titles (YouTube advises putting branding last **[official]**).
- Series seeds: "History's Weirdest Fixes", "What If Earth...", "Explained in 9 Minutes: [news story]", "5 Times [X]".

## 5. topics.md backlog format
Keep one table per slot type. Re-score weekly, because trends move. Delete ideas older than 8 weeks below 30.
```
# topics.md (updated YYYY-MM-DD)
## News (re-check daily)
| Score | Topic | Our angle (one sentence, original) | Demand signals | Gap | Fit | Urgency | Added | Status |
|---|---|---|---|---|---|---|---|---|
| 80 | [event] | Why [mechanism], not [common take] | Trends↑, 5 outlets, autocomplete | 4 | 5 | ×1.0 | 11-10 | scripting |
## True history (Tue)
| Score | Topic | Our angle | Demand signals | Gap | Fit | Evergreen? | Added | Status |
## What-if / science (Thu)
## Top-5 (Sat)
## Series & spin-offs
| Parent video | Spin-off type | Working title | Score | Status |
## Done (last 30)
| Date | Topic | 7-day engaged views | ×median | Lesson |
```
- Status values: idea · researched · scripting · made · dropped.
- Every row names its demand signals; never write "high demand" without them.

## 6. Weekly output (paste into chat, then update topics.md)
```
## Plan for week of [date]
| Day | Slot | Topic | Score | Angle | Search-first or browse-first |
Spares (2 news, 1 evergreen): ...
New series/spin-offs: ...
Signals checked: [n Trends comparisons, n autocomplete seeds, outliers from ..., Studio Research: yes/no]
```

## Sources
- Adapted from AgriciDaniel/claude-youtube `sub-skills/ideate.md`, `references/seo-playbook.md` (MIT License, Copyright (c) 2025 Daniel Agrici), https://github.com/AgriciDaniel/claude-youtube. Also draws on the content-scoring idea in coreyhaines31/marketingskills `skills/content-strategy/SKILL.md` (MIT License, Copyright (c) 2025 Corey Haines), https://github.com/coreyhaines31/marketingskills. Both rewritten.
- Google Trends data FAQ (relative 0–100, sampled): https://support.google.com/trends/answer/4365533
- Studio Trends/Research tab: https://support.google.com/youtube/answer/11962757
- Monetisation policies (inauthentic and reused content): https://support.google.com/youtube/answer/1311392
- Title tips (branding at end): https://support.google.com/youtube/answer/12340300
- Declining topics and older videos gaining interest: https://support.google.com/youtube/answer/141805
- The Trends "YouTube Search" menu is a UI step I couldn't find on a help page; treat its exact label as unverified.
