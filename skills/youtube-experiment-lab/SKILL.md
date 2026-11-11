---
name: youtube-experiment-lab
description: Run Shak Clips growth experiments one variable at a time with a hypothesis, a metric, sample and wait rules, Studio A/B tests, a decision table and an experiments.csv log the daily run appends to.
---

# YouTube Experiment Lab (Shak Clips)

Use when deciding what to change next on the channel, when setting up a Studio A/B test, or when a format, length, title shape or upload time is in question.
Legend: **[V]** = checked on an official page (see Sources). **[H]** = heuristic, unverified; our own Studio data overrides it.

Channel state as of 2026-11-11: 7 subscribers, about 3,000 total views, 1 long video plus 1 Short a day at 22:00 UTC. At this size almost nothing is statistically readable in a week, so this skill is mostly about **not fooling ourselves**. `youtube-analytics-loop` reads the numbers; this skill decides what is being asked and when the answer counts.

## 1. One experiment at a time
- **One variable.** The daily run already changes topic, thumbnail layout, palette and opening line every day (runbook step 6). An experiment must hold everything else as close to normal as possible and change exactly one named thing.
- **Max 2 experiments open at once**, and never two that touch the same surface (two title experiments, or a title and a thumbnail experiment, cannot both be read).
- **Write it down before publishing.** An experiment that gets its hypothesis after the data is just a story. Official framing: YouTube says performance is evaluated per video, so one unsuccessful experiment should not seriously harm a channel, but "frequently sharing content that doesn't resonate, can, over time, affect your channel's overall performance" **[V]**. So experiment in one slot, not across all seven.

Pre-registration block (paste into `experiments.csv` as one row, and into `log.md`):
```
EXP-012 | opened 2026-11-14 | variable: long-video length | slot held fixed: Thursday
Hypothesis: 5-6 min videos win more watch time per impression than 8-10 min ones.
Arms: A = 8-10 min (current), B = 5-6 min. Everything else normal.
Metric: primary = watch time per 1,000 impressions; secondary = avg % viewed, Intro (30 s).
Sample: 4 videos per arm, alternating weeks, read at 7 d each. Kill rule: B's Intro below 25% twice.
```

## 2. Studio A/B tests (Test & Compare) — what it actually does
All **[V]** from the A/B test help page, as of 2026-11-11:
| Item | Fact |
|---|---|
| What can be tested | **Titles only, thumbnails only, or title and thumbnail together.** Title testing is supported today |
| Variants | Up to 3 titles and/or thumbnails |
| Winner judged on | **Watch time share**, not CTR ("tests are optimized for overall watch time") |
| Duration | "Your test should be completed within two weeks"; a few days to 2 weeks depending on impressions and how recently the video was published |
| Results | **Winner** (clearly outperformed, statistically significant) · **Performed Same** · **Inconclusive** (no strong statistical difference) |
| After the test | The highest-watch-time option is shown to everyone. With no clear winner, the **first** option uploaded is shown |
| Where | **Computers only, through YouTube Studio.** Needs **advanced features** |
| Not eligible | Shorts, made-for-kids, mature-audience and private videos; scheduled Lives and Premieres |
| Breaks the test | Changing the title or thumbnail while a test runs **stops it automatically** |
| Gotchas | A small control group sees only the default, and its data is excluded · thumbnails below 1280x720 force all variants down to 480p · very similar variants make tests run longer · a video 3 min or shorter that is square or vertical becomes a Short and loses its test |
| A/B testing is an **advanced feature** | Granted by sufficient channel history, or immediately by verifying identity with a valid ID or video **[V]** |

**Consequence for us:** the owner is on a phone, and A/B testing is desktop-only. So Test & Compare is a *when-at-a-computer* tool, and every experiment in section 6 also has a sequential fallback (section 4).

**Owner task — check access once (5 min, needs a computer):** studio.youtube.com → Settings → Channel → Feature eligibility → look for "Enabled" next to A/B testing **[V]**. Reply "A/B: enabled" or "A/B: not enabled".
**Owner task — start a test (computer):** Studio → Content → click the video → in the Title box or under Thumbnail click **A/B Testing** → choose Title only / Thumbnail only / Title and thumbnail → upload up to 3 → **Done** **[V]**.
**Owner task — read a test:** the video → Analytics → **Reach** tab → under "How your A/B test is going" (also on the video's Details page); **Manage test** stops it **[V]**.

## 3. Format experiments we can run without a computer
| Experiment | How it runs | Primary metric |
|---|---|---|
| Long-video length | Alternate target length by week in one fixed slot | watch time per 1,000 impressions |
| Hook style | Alternate cold-open type in one slot (see `youtube-hook-lab`) | Intro (% past 30 s) |
| Series branding | Add or drop the series tag at the end of the title for 4 weeks | impressions CTR, returning viewers |
| Upload time | Move the slot once, hold 4 weeks | views at 48 h, Browse share |
| Short length | 30 s vs 50 s, alternating days | stayed to watch, subscribers gained |
| Short-first test | Publish the hook line as a Short 1–3 days before the long video uses it | stayed to watch on the Short |
| Format swap | Replace one weekday format for 4 weeks | median 14-day engaged views |

**Upload time, honestly:** YouTube says "Publish time is not known to impact a video's long-term performance" **[V]** and that "growth in views across uploads is not correlated with time between uploads" **[V]**. Rank timing experiments **last** and never rerun one. **Short-first hook testing** is the cheapest experiment we have: a Short gets its own feed audience, so a hook line reads in 48 h instead of weeks. Treat the Short as the pilot and the long video as the rollout (`youtube-hook-lab`).

## 4. Minimum sample and wait rules (tiny channel)
These are **[H]** unless marked, and they exist because small numbers lie.
| Rule | Value |
|---|---|
| Never read CTR below | 500 impressions on the video (official: new channels and videos under a week old or with fewer than 100 views "can see an even wider range" of CTR, and don't check CTR right after uploading **[V]**) |
| Never read retention below | 100 views — Studio needs 60 s length and 100 views before it highlights key moments **[V]** |
| Retention data lag | 1–2 days to process **[V]** — so no retention reading at 2 h |
| Earliest per-video read | 48 h. Earliest decision | 7 d |
| Sequential test: videos per arm | **4** (so 8 videos, about 8 weeks in one weekday slot) |
| Sequential test: what to compare | the **median** of the 4, never the mean, never the best one |
| Call it a difference when | the medians differ by **≥35%** on the primary metric; under that, treat as Performed Same |
| A/B test: let it run | until Studio returns a label, up to 2 weeks **[V]**; never stop early to "see" a winner |
| Hard floor | If a test would need more traffic than 8 weeks in a slot can give, don't run it — pick a bigger variable instead |

Two more guards: **no peeking decisions** (looking daily is fine, deciding before the read date is not), and **log confounders** — an unusually strong topic, an over-performing Short, a tentpole date, a missed upload day. Any of those marks the video `confounded=yes` and excludes it from the median.

## 5. Decision rule table
| Signal | Decision | Action |
|---|---|---|
| A/B label **Winner** | Adopt | Keep the winning variant; write the pattern into `youtube-title-lab` or `youtube-thumbnail-design` as a house rule |
| A/B label **Performed Same** | No change | Keep the current style, and spend the next test on a bigger variable **[V]** (the page says pick the one you prefer) |
| A/B label **Inconclusive** | Rerun once, bolder | Make the variants more different; the official tips say similar variants are harder to measure **[V]** |
| Sequential: B ≥ 1.35× A on the primary metric, and secondary metric not worse | Adopt | Make B the default in that slot; propagate after one more confirming month |
| Sequential: 0.75–1.35× | Inconclusive | Drop the variable; it is not where the channel's problem is |
| Sequential: B ≤ 0.75× A | Reject | Revert to A and record why |
| Kill rule tripped (e.g. Intro <25% twice) | Abort | Revert immediately; the row's status is `aborted`, not `rejected` |
| Fewer than 500 impressions per arm at the read date | Extend once | Extend by 2 videos per arm, then close as `underpowered` |
| Any arm broke a house rule (misleading packaging, third-party photo) | Void | Delete the arm, not just the row |

Adopted rules get **two** homes: the relevant skill file, and an `## Adopted` list beside `experiments.csv`. A rule nobody wrote down gets re-tested by accident in six weeks.

## 6. Backlog: the 10 highest-value first experiments
Ranked for a 7-subscriber channel whose main problem is almost certainly **impressions**, not CTR. Run them in this order, no more than 2 open.
| # | Variable | A (current) | B (test) | Primary metric | Vehicle |
|---|---|---|---|---|---|
| 1 | Thumbnail style | flat cartoon scene | cinematic rendered scene, one huge emotion, data badge | watch time share | A/B (3 thumbs) or 4v4 sequential |
| 2 | Title shape | bold claim | curiosity question, keyword first 40 chars | watch time share | A/B (titles) |
| 3 | Cold-open type | narrator states the claim | mid-action scene, no setup | Intro (% past 30 s) | 4v4 in the Thursday slot |
| 4 | Long-video length | 8–10 min | 5–6 min tighter cut | watch time per 1,000 impressions | 4v4 alternating weeks |
| 5 | Evergreen vs trending weight | 4 trending / 3 evergreen | 2 trending / 5 evergreen | median 28-day engaged views | 4 weeks, whole week |
| 6 | Short hook line | hook as scripted | the Short's winning line rewritten into the long video | Intro on the long video | Short-first, 2–3 days ahead |
| 7 | Short length | 45–55 s | 28–35 s | stayed to watch, subs gained | alternating days, 14 days |
| 8 | Series tag in title | none | series name appended at the end, e.g. "True Story Tuesday" | returning viewers, CTR | 4 weeks, Tuesday only |
| 9 | Search-first titles on evergreen days | curiosity-first | exact search phrase first | YouTube search traffic share | 4v4 Tue/Thu/Sat |
| 10 | Upload time | 22:00 UTC | 16:00 UTC (US midday) | views at 48 h | 4 weeks, once only — lowest priority **[V]** |

Not on the backlog, deliberately: anything that needs fake engagement, buying views, comment pods, or packaging that overstates the video. Those are not experiments, they are policy violations (`youtube-seo-metadata` honesty gate).

## 7. experiments.csv (the daily run appends; one row per experiment, updated in place)
Header, exactly:
```
exp_id,status,variable,slot,hypothesis,metric_primary,metric_secondary,arm_a,arm_b,vehicle,date_opened,date_read,n_a_videos,n_b_videos,impr_a,impr_b,result_a,result_b,delta_pct,label,decision,confounds,note
```
Example rows:
```
EXP-001,running,thumbnail_style,all,"Rendered cinematic thumbs beat flat cartoon on watch time share",watch_time_share,ctr,"flat cartoon","cinematic render",ab_test,2026-11-14,2026-11-28,1,1,,,,,,,,,"3 variants uploaded, desktop"
EXP-003,closed,cold_open,thu,"Mid-action opens hold more viewers past 30s",intro_pct,avd,"narrator claim","mid-action",sequential_4v4,2026-11-12,2027-01-09,4,4,2140,2310,31,44,+41.9,winner,adopt,"none","adopted into youtube-hook-lab s3"
```
Rules for the run:
- `status`: `planned` · `running` · `closed` · `aborted` · `underpowered` · `void`. `vehicle`: `ab_test` · `sequential_4v4` · `short_first` · `calendar_4wk`.
- `label`: for A/B tests use Studio's own word (`winner` · `same` · `inconclusive`); for sequential tests fill it only on or after `date_read`.
- Leave a cell **blank** when the number is not in hand. Never estimate, never back-fill. `delta_pct` = (result_b − result_a) / result_a × 100, one decimal, only when both are present.
- One row per `exp_id`; the run edits that row instead of appending a duplicate. Before opening an experiment, grep the file: if the same `variable` + `slot` closed within 90 days, cite the old `exp_id` in `log.md` rather than rerunning it.
- Keep the file next to `channel_stats.csv` so the weekly report in `youtube-analytics-loop` can quote open experiments.

## 8. Weekly 3-line experiment report (goes into the weekly report)
```
EXPERIMENTS | week [start]–[end]
Open: EXP-0xx [variable] — day [n] of [n], impressions A __ / B __ , read date __
Closed: EXP-0xx → [label] → [decision] (rule applied: ...)
Next up: EXP-0xx [variable] from the backlog, opens [date]
```
If nothing is readable, write "nothing readable yet" and the reason. That line is a valid result.

## Sources
- A/B test titles & thumbnails (elements, 3 variants, watch time share, 2 weeks, Winner/Performed Same/Inconclusive, computer-only, advanced features, Shorts and made-for-kids excluded, edits stop a test, control group, 1280x720): https://support.google.com/youtube/answer/16391400
- Advanced features list (A/B testing) and Feature eligibility path: https://support.google.com/youtube/answer/9890437
- Impressions CTR FAQ (2%–10% half of channels, wider range for new videos, don't check right after upload): https://support.google.com/youtube/answer/7628154
- Audience retention (Intro, typical retention vs 10 latest videos, 60 s and 100 views, 1–2 day lag): https://support.google.com/youtube/answer/9314415
- Performance FAQ (publish time not known to impact long-term performance; upload frequency not correlated with view growth; don't change what's working): https://support.google.com/youtube/answer/141805
- Recommendation system (quality over frequency; per-video evaluation; repeated non-resonant content): https://support.google.com/youtube/answer/16533387
- Content performance metrics (engaged views, stayed to watch, AVD, thumbnail impressions; views counted at playback start from 24 Aug 2026): https://support.google.com/youtube/answer/12220281 · Reach tab, traffic sources and the Studio app path: https://support.google.com/youtube/answer/9314355 · Analytics tips (single metrics mislead; compare same-type videos): https://support.google.com/youtube/answer/11912632
- Experiment discipline and sample-size framing, rewritten from coreyhaines31/marketingskills `skills/ab-testing` (MIT, Copyright (c) 2025 Corey Haines) at /home/claude/untrusted/skills-research/; its web-conversion tables do not apply to YouTube impressions and are not reproduced. Pipeline facts: /home/claude/shakclips-studio/RUNBOOK.md and skills/youtube-analytics-loop/SKILL.md (read only).
