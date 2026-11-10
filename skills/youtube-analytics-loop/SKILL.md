---
name: youtube-analytics-loop
description: Read Shak Clips YouTube Studio stats at 2 h, 24 h, 48 h, 7 d and 28 d, apply swap and double-down rules, log free vidIQ counts daily, and build the weekly report.
---

# YouTube Analytics Loop (Shak Clips)

Use after every upload, when the owner pastes Studio numbers, and once a week for the report.
**[official]** = confirmed on a YouTube page (see Sources). **heuristic (unverified)** = a threshold with no official source.

## 1. Data sources and their cost
| Source | Cost | What it gives |
|---|---|---|
| YouTube Studio (owner only) | Free | Everything below; Claude can't open it, so the owner pastes the numbers |
| `vidiq_user_channels` | 0 credits | `subscriberCount`, `viewCount`, `videoCount` for the channel |
| `vidiq_balance` | 0 credits | Remaining credits |
| `vidiq_channel_analytics` | 5 credits/call | Retention curve, traffic sources, Shorts vs long-form, engaged views |
| `vidiq_update_video` | 5 credits/call | Title or description changes. Until credits return, the owner swaps titles in Studio for free |

Credits are 0 until 2026-12-08, then 150 a month. Analytics may use up to **60 a month**: on the weekly report, call `traffic_sources` plus `audience_retention` for that week's best and worst long video. Leave 20 or more in reserve.

**Daily free log.** The automation does this after every upload run: call `vidiq_user_channels` once and append one row to its stats CSV (e.g. `logs/channel_stats.csv`):
```
date_utc,subs,total_views,video_count,d_subs,d_views,uploads_today,note
2026-11-10,7,...,...,+0,+...,2,"news: [title]"
```
- `d_*` is the change since yesterday's row.
- Never back-fill or estimate a missing day; leave it blank.
- Since 24 Aug 2026, views count from the moment playback starts **[official]**. So total views run higher than under the old method, and engaged views are the number to compare across that date.

## 2. Definitions **[official]**
- **Impressions:** thumbnails shown on YouTube. Some are left out, such as those on external sites and end screens.
- **Impressions CTR:** how often a thumbnail view became a watch. "Half of all channels and videos" fall between 2% and 10%. CTR naturally drops as impressions grow, for example from Home. A high CTR with low average view duration is a clickbait warning sign.
- **AVD / avg % viewed:** both are used as ranking signals.
- **Intro:** % still watching after the first 30 s.
- **Typical retention:** comparison with your 10 latest videos of similar length.
- **New viewers:** first-time watchers, or no watch in over a year.
- **Casual viewers:** watched in 1–5 months of the past year.
- **Regular viewers:** watched in 6 or more months of the past year.
- **Traffic sources:** Browse (Home, Subscriptions), YouTube search, Suggested (next to or after videos), Shorts, External, Channel pages, Playlists, Notifications, End screens.

## 3. Checkpoints after each upload (times after 22:00 UTC)
| When | Read | Decide |
|---|---|---|
| **2 h** | Realtime report (it compares 60-minute and 48-hour performance **[official]**) and a quick look at the watch page | Only whether something broke: HD processed, captions live, correct thumbnail, Short's related link set. Judge nothing else yet |
| **24 h** | Impressions, CTR, views, AVD, avg % viewed, Intro (30 s), and for the Short, stayed to watch | Note it against the last 10 videos. No changes yet |
| **48 h** | The same, plus traffic sources | Apply the swap rules (section 5) |
| **7 d** | Retention graph shape, traffic mix, subscribers gained, new vs returning | Fix the script or format for the next video in this slot |
| **28 d** | Per-format scoreboard, YPP progress | Double down or rework (section 6) |

**Small-channel caution** (heuristic): CTR on fewer than 500 impressions is mostly noise. Below that, judge the Intro and AVD only.

## 4. Retention graph shapes
| Shape | Meaning | Fix in our pipeline |
|---|---|---|
| Flat stretch | Viewers watch that part start to finish **[official]** | Do more of that kind of scene |
| Gradual decline | Interest fading over time; this is normal on YouTube **[official]** | Add a re-hook every 60–90 s (heuristic) |
| Spike | Rewatching or sharing at that point **[official]** | Put a similar visual or reveal earlier; use it as a Short |
| Dip | Viewers leave or skip here **[official]** | Cut or tighten that sentence range in the script |
| Cliff in first 30 s (Intro below typical) | Opening doesn't match the title and thumbnail, or starts slowly (heuristic) | Pay off the title's promise sooner; open on the strongest shot |
| Valley at 40–60% | Saggy middle act (heuristic) | Move the best fact into the middle; add an open loop |
| Drop at the outro | Viewers sense it is ending (heuristic) | End on the last payoff, not a recap |

## 5. Swap rules (48 h, long-form only)
YouTube says changing the title and thumbnail can work, "but don't change what's working" **[official]**.
1. Use **Test & Compare** where possible. It tests up to 3 titles, thumbnails or both, picks the winner by watch time, should finish within 2 weeks, runs in desktop Studio, needs advanced features, and isn't available for Shorts **[official]**. Load the two alternate titles from the upload package.
2. Manual swap: change the **thumbnail first** only if all of these hold (heuristic):
   - there are ≥500 impressions;
   - CTR is below 60% of the channel's median CTR;
   - the Intro is at or above typical.
   That pattern means good content with weak packaging.
3. Change the **title** only if CTR is still low 48 h after the thumbnail swap. Change one thing at a time and log the date and old value.
4. **Don't swap** when CTR is fine but the Intro or AVD is low. That is a hook or content problem, so fix the next video.
5. **Never swap** a video that is in its first 48 h, or one whose views are rising day on day.

## 6. Format rules (28 d, per slot: news, history, what-if, top-5)
Use a format's **last 4 videos**, with engaged views, against the channel median (heuristic):
- **Double down** when the format median is ≥1.5× the channel median and avg % viewed is at or above the channel median. Make a series in that slot, spin off a Short series, and ask ideation for more topics of the same type.
- **Rework packaging** when the format is below 0.5× the median but its Intro is OK. Change title and thumbnail style for 2 weeks.
- **Rework the format** when it is still below 0.5× after the packaging change. Change the angle or length, or swap the slot with the strongest format. Tell the owner first.

Quality comes before frequency: YouTube advises "consistent quality content over a high frequency of uploads" **[official]**. If quality slips, recommend fewer uploads.

**YPP pace check:** the target is 4,000 public long-form hours in 12 months plus 1,000 subscribers **[official]**. From 2026-11-10 to 2027-01-31 is 82 days. That needs about **49 watch hours a day** (≈2,930 min). At a 3-minute AVD, that is about 980 long-form views a day, plus about 12 new subscribers a day. Report the gap honestly every week.

## 7. Weekly report (owner pastes in; Claude fills the rest)
```
WEEK [start]–[end] | Studio → Analytics → Last 7 days
Channel: views __ | engaged views __ | watch time (h) __ | subs +__ | impressions __ | CTR __%
YPP: public watch hours (12 mo) __ / 4,000 | subs __ / 1,000 | needed per day __
Traffic: Browse __% Search __% Suggested __% Shorts __% External __% Other __%
Audience: new __ | casual __ | regular __
| Date | Slot | Title | Impr | CTR | Views | AVD | %viewed | Intro | Subs | Short stayed % |
Best video + why: ...
Worst video + why: ...
Retention shapes seen: ...
Decisions (max 3, one change each): 1) ... 2) ... 3) ...
```
Rules:
- Every claim cites a number from the table. If a number is missing, say so; never guess.
- Save the week's decisions to the Animation project notes.

## Sources
- Adapted from AgriciDaniel/claude-youtube `sub-skills/analyze.md`, `references/analytics-guide.md`, `references/retention-scripting-guide.md` (MIT License, Copyright (c) 2025 Daniel Agrici), https://github.com/AgriciDaniel/claude-youtube. Rewritten; its unsourced thresholds are labelled heuristic.
- Impressions and CTR FAQ: https://support.google.com/youtube/answer/7628154
- Content metrics (impressions, engaged views): https://support.google.com/youtube/answer/12220281
- View-counting update: https://support.google.com/youtube/answer/2991785
- Retention moments, intro, typical retention: https://support.google.com/youtube/answer/9314415
- Ranking uses avg view duration and avg % viewed: https://support.google.com/youtube/answer/11914225
- Traffic sources: https://support.google.com/youtube/answer/9314355
- New, casual and regular viewers: https://support.google.com/youtube/answer/10246996
- Realtime report: https://support.google.com/youtube/answer/9314414
- A/B test titles and thumbnails: https://support.google.com/youtube/answer/16391400
- Changing titles and thumbnails, cadence: https://support.google.com/youtube/answer/141805
- Quality over frequency: https://support.google.com/youtube/answer/16533387
- YPP eligibility: https://support.google.com/youtube/answer/72851
