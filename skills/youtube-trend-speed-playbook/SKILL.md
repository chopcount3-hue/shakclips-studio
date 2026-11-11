---
name: youtube-trend-speed-playbook
description: "The fast lane for US trending stories on Shak Clips: early detection, a go/no-go gate, an hour-by-hour production clock, news packaging, slot and notification rules, and backstory angles."
---

# YouTube Trend Speed Playbook (Shak Clips)

Use on the trending slots (Mon/Wed/Fri/Sun UTC) and any time a US story breaks that the channel should explain the same day.
Legend: **[V]** = verified on an official Google/YouTube page (see Sources, checked 2026-11-11). **[H]** = heuristic (unverified rule of thumb).
Scope: scoring and the backlog live in `youtube-topic-ideation`, titles in `youtube-title-lab`, hooks in `youtube-hook-lab`, metadata in `youtube-seo-metadata`. The runbook's hard rules always win.

## 1. Detect a rising story early (15 min, before 12:00 UTC)
| Source | What to read | Cost |
|---|---|---|
| **Google Trends → Trending now** | US trends, "Started trending: Past 24 hours", status **Active**. Data refreshes "on average every ten minutes" **[V]**. The Search volume column shows bucketed volume plus % growth against a predicted baseline **[V]** | free |
| Trending now, drill-down | Click a trend for the queries inside it, a 4 h / 24 h / 48 h / 7 d exact-match chart, and "In the news" articles **[V]**. Tick up to 5 trends and **Compare**, or export CSV **[V]** | free |
| **Trends → Explore, YouTube Search** | The same phrases on the YouTube Search type **[V]**, past 7 days, US. This is a separate dataset from Web Search **[V]** | free |
| **YouTube Charts** | "Trending Charts are updated roughly every 30 minutes" **[V]**, weighing view count, how fast views grow, and video age **[V]**. Only select categories exist: Trending Movie Trailers, Trending Music Videos, and Trending Gaming Videos via the Gaming Explore page **[V]** | free |
| **YouTube Explore menu / search filters** | Search the story, then Filter → **Type: Videos**, **Upload date: Today**, **Prioritize: Popularity** to see who already covered it. The Jan 2026 filter update renamed "Sort by" to "Prioritize" and "View count" to "Popularity", and dropped "Last hour" **[H]**, reported by 9to5Google | free |
| **Studio Trends tab** | The audience's top searches over 28 days; may look different during the Studio redesign from July 2026 **[V]** | free |
| **News velocity** | WebSearch the story: count US outlets publishing in the last 24 h, and check whether the newest article is under 6 h old **[H]** | free |

The old YouTube Trending page and Trending Now list were retired in 2025, with category Charts and personalised recommendations taking over **[H]** (third-party: 9to5Google, TechCrunch, July 2025; YouTube's own announcement was a help-community post I could not open). So don't plan around a Trending page.

**Velocity score (pick the highest scorer) [H]:** 3 points if 3+ major US outlets published in the last 24 h · 2 if the Trends trend is still **Active** · 2 if the 7-day YouTube Search line is rising · 2 if the story is unresolved ("what happens next" is still open) · 1 if no animated explainer has covered it today. **Go at 6 or more.**

## 2. Go / no-go gate (every box, or pick another story)
- [ ] **Ads-safe.** A "sensitive event" creates significant risk to providing high-quality information (civil emergencies, natural disasters, conflict) and creators "may not monetize content that profits from or exploits a sensitive event" **[V]**. News reporting and documentary context can still earn ad revenue **[V]**.
- [ ] **No ongoing tragedy with victims.** Runbook rule: no shootings or disasters with deaths, no private individuals, no minors. Graphic or gruesome detail about multiple casualties limits ads **[V]**.
- [ ] **Verifiable.** 2+ independent reputable outlets for every key claim (runbook). Nothing from a single post or rumour.
- [ ] **Explainable.** There is a mechanism to draw: a why, a how, a chain of causes. If the whole story is "X said Y", skip it.
- [ ] **Allegations labelled.** Nothing unproven stated as fact; "alleged" or "reportedly" in narration, on screen and in the title. Accused people are silhouettes with a "?" (runbook).
- [ ] **Drawable with our engine, with no third-party images.** Owner-supplied photos only.
- [ ] **Not elections procedure, medical or financial advice** (runbook).
- [ ] **Policies cover every part:** "video, Short, or live stream, thumbnail, title, description, and tags" **[V]**, so the thumbnail passes the same test as the script.
Write the gate result in `log.md` as one line, including the stories rejected and why.

## 3. Production clock (same-day, UTC)
Targets, not laws. The runbook's quality gate (7.5–11 min, −14 LUFS, frame check) still has to pass, and a missed day beats a broken video.
| By | Step | Budget |
|---|---|---|
| 10:00 | Detect and score (section 1); gate (section 2); slug and `new_project.sh` | 20 min |
| 10:40 | Research: beats, dates, names, numbers, 2+ sources each, URLs kept | 40 min |
| 11:40 | Script 1,150–1,450 words with 2+ "Shak's take" moments (`youtube-retention-scriptwriting`, then `tts-script-writing`) | 60 min |
| 12:10 | Kokoro voice am_michael 1.0, QA 138–160 wpm | 15 min |
| 13:40 | `shots.js`, then the contact-sheet check (`explainer-video-direction`) | 90 min |
| 14:10 | Cues, audio, mix | 20 min |
| 14:45 | Render in the background (about 0.05 s/frame: a 9-minute video at 30 fps is roughly 13–15 min) **[H]**, then mux | 30 min |
| 15:10 | Short cut from the hook, 15–60 s (`youtube-shorts-growth`) | 20 min |
| 15:40 | Thumbnail plus its checklist (`youtube-thumbnail-design`) | 30 min |
| 16:10 | Quality checks (runbook step 9) | 25 min |
| 16:40 | Metadata, media branch, vidIQ drafts | 30 min |
| **17:10** | Publish or schedule. **Slack: 4 h 50 m before the 22:00 UTC slot** | — |
- **Triage when late:** at 18:00 UTC with no render, cut to the runbook's 7.5-minute floor by dropping one body section, never by dropping sourcing or the contact-sheet check **[H]**.
- **Abort at 20:00 UTC** if quality checks haven't passed. Move the topic to tomorrow with fresh research, and notify the owner.

## 4. Packaging for news
- **Title:** `[Named thing] Explained: [the stake]` or `Why [event] Happened`. Keyword first, under 70 characters (runbook), "searchable" type **[V]**, important words near the beginning **[V]**.
  - **Neutral wording:** no ALL CAPS (YouTube says limit it **[V]**), no "DESTROYED", "EXPOSED", "SHOCKING". Charts explicitly avoid videos that are "misleading, clickbaity, or sensational" **[V]**.
  - **Allegations:** "Alleged", "Accused" or "Reportedly" in the title itself when nothing is proven.
- **Date-stamping [H]:** add a date or sequence marker only where it helps a searcher (`... (November 2026)`), and never on a story we want evergreen (section 6). Date-stamps make a title age; the test is whether the title still makes sense in 6 months.
- **Thumbnail:** one focal object, 2–3 words, no real-person face unless the owner supplied the photo, never an edited expression (runbook). Non-graphic references to a controversial issue in the title and thumbnail can still earn ad revenue; graphic depictions in a thumbnail limit ads **[V]**.
- **Description:** line 1 answers "what happened and why it matters" in the words people search; then the chapters; then the sources block with publisher, headline, date and URL (`youtube-seo-metadata`).
- **Category 25 (News & Politics)** for trending days, per the runbook. Made for kids: No.
- **Honesty:** maliciously misleading titles, thumbnails or descriptions are spam **[V]**, and a video whose title doesn't match loses viewers anyway.
- News surfaces are not a plan: the Breaking News shelf and Top News shelf use "signals from Google News to identify news moments and top stories of the day" **[V]**. Our reach comes from search and Suggested, not from a news shelf **[H]**.

## 5. When to break the 22:00 UTC slot
Normally keep it: "Publish time is not known to impact a video's long-term performance" **[V]**, and the runbook requires `publishAt <run date>T22:00:00Z`.
| Situation | Action |
|---|---|
| The story will be old news by 22:00 UTC (a resolution, verdict or launch landing before then) | Publish the long video immediately, and hold the Short for 22:00 UTC **[H]** |
| The run finishes after 22:00 UTC | Publish immediately and log it (runbook rule 13.9) |
| The story breaks after 18:00 UTC | Keep the normal 22:00 UTC slot tomorrow; use today's slot for the planned topic **[H]** |
| A second big story lands the same day | Queue it for tomorrow. Never add a third upload (see below) |
**Notification arithmetic [V]:** viewers get "a maximum of 3 notifications from each channel in a 24 hour period", counting uploads, live streams and premieres; publishing more than 3 in a short time "may temporarily stop sending notifications for 24 hours". Our long video plus Short is 2, leaving **1 spare per rolling 24 h**. Only 1 community post notification is allowed per 3 days **[V]**.
- So: at most one extra breaking video per day, and it must be more than a few minutes apart from the daily pair. For batches, YouTube suggests uploading as Private first **[V]**.
- Never publish a third upload plus a community post on the same story in one day.

## 6. Follow-ups, updates and the backstory angle
| Angle | When | Shape |
|---|---|---|
| **Backstory (preferred)** | Any trending story with a history | "How we got here": the 10-year chain that led to today. Evergreen, no date-stamp, title that still reads in 2 years **[H]** |
| **Mechanism** | The story turns on a how | "How X actually works", using today's event as the cold open. Evergreen |
| **Update** | The story resolves, or major new facts land | A new video, not an edit. Open with what changed, then re-explain the mechanism in 60 s for new viewers **[H]** |
| **Aftermath** | 2–6 weeks later | "What actually happened after..." — the question the first wave of videos left open **[H]** |
| **Top-5 roll-up** | 3+ similar cases exist | Saturday's countdown, with this story as #1 |
- **Never edit a published video's claims silently.** If a fact changes, update the description, pin a correction, and log it (`youtube-community-engagement`).
- Old videos take off when viewers follow a rising topic **[V]**, so when a story returns to the news, the backstory video is the one that earns the search traffic.
- Point the trending video's end screen at its backstory video, and both into the same cluster playlist (`youtube-search-evergreen-engine`, `youtube-suggested-browse-reach`).
- **Balance rule** (from `youtube-topic-ideation`): at least 2 of the 4 weekly trending videos should be backstory or mechanism cuts, so they stay searchable for weeks.

## 7. Owner tasks (phone, exact)
- **Breaking-story tip (any time, 30 s):** message Claude `BREAKING: <story in 5 words> <link>`. Claude runs sections 1–2 and replies go or no-go with a reason.
- **Approve an off-slot publish (1 min):** Claude asks `Publish now instead of 22:00 UTC? reason: ...`. Reply `yes` or `no`. Without a reply by the time the render is ready, Claude keeps 22:00 UTC **[H]**.
- **Check a news video at 2 h (2 min):** Studio app → **Content** → the video → **Analytics** → **Reach** → note Impressions, CTR, and the Traffic source types split; paste it into chat.
- **Correction (within 24 h):** if a commenter shows a claim is wrong, forward the comment to Claude; Claude writes the corrected description line and the pinned reply.

## Sources
- Google Trends, Trending now: https://support.google.com/trends/answer/3076011
- Trends data normalisation and sampling: https://support.google.com/trends/answer/4365533
- Trends search types incl. YouTube Search (Google News Initiative): https://newsinitiative.withgoogle.com/resources/trainings/advanced-google-trends/
- YouTube Charts: https://support.google.com/youtube/answer/7239739
- Breaking News and Top News shelves: https://support.google.com/youtube/answer/9057101
- Studio Trends tab: https://support.google.com/youtube/answer/11962757
- Advertiser-friendly guidelines (sensitive events, controversial issues, titles and thumbnails): https://support.google.com/youtube/answer/6162278
- Spam and misleading metadata: https://support.google.com/youtube/answer/2801973
- Title and thumbnail tips: https://support.google.com/youtube/answer/12340300
- Discovery FAQs (publish time, old videos taking off): https://support.google.com/youtube/answer/141805
- Notification limits: https://support.google.com/youtube/answer/7389684
- Search filters: https://support.google.com/youtube/answer/111997 · Jan 2026 filter changes (third-party, [H]): https://9to5google.com/2026/01/08/youtube-search-filters/
- Trending page retirement (third-party, [H]): https://9to5google.com/2025/07/10/youtube-trending-page-removal/ and https://techcrunch.com/2025/07/10/youtube-is-getting-rid-of-its-trending-page-and-trending-now-list
- Pipeline timings: `/home/claude/shakclips-studio/RUNBOOK.md` (read only).
- Raw material, rewritten: AgriciDaniel/claude-youtube `sub-skills/ideate.md`, `references/algorithm-guide.md` (MIT License, Copyright (c) 2025 Daniel Agrici), https://github.com/AgriciDaniel/claude-youtube. Its third-party reach and cadence numbers are not used.
