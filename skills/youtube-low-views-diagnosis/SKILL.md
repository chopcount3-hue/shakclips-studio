---
name: youtube-low-views-diagnosis
description: Triage why a Shak Clips video or the whole channel got low views by splitting impressions, CTR, retention, traffic mix and topic demand, with the Studio numbers to read and one fix per branch.
---

# YouTube Low-Views Diagnosis (Shak Clips)

Use when a video underperformed, when the owner asks "why did this get no views", or when the channel has been flat for two weeks or more.
Legend: **[V]** = checked on an official page (see Sources). **[H]** = heuristic, unverified label for a channel under 1,000 subscribers; our own Studio history overrides it.

Read this **before** changing anything. Most "low views" at 7 subscribers is a **distribution** problem (few impressions), not a packaging problem, and swapping a thumbnail there wastes the only data we have.

## 1. Collect five numbers first (owner, phone, about 3 minutes)
YouTube Studio app → **Content** → tap the video → tap the **Analytics** card → tap **Reach** in the top menu **[V]**. Read and send:
```
VIDEO [title] | age [h or d]
impressions ____  | impressions CTR ____%  | views ____  | unique viewers ____
traffic ("How viewers find this video"): Browse __% Search __% Suggested __% Shorts __% External __% Other __%
```
Then tap **Engagement** in the top menu and send: `avg view duration __:__ | avg % viewed ____% | Intro (past 30 s) ____%`.
Retention and key moments need the video to be **at least 60 seconds long with at least 100 views**, and the data takes **1–2 days** to process **[V]**. So at 2 h there is nothing to diagnose except whether the upload itself is broken.

Notes on what those words mean **[V]**:
- **Thumbnail impressions**: how many times YouTube showed your thumbnails. Not every sighting counts, and impressions on external sites and end screens are excluded.
- **Impressions CTR**: how often viewers watched after seeing a registered impression.
- **Views**: since **24 Aug 2026**, counted the moment a video starts to play, in every format.
- **Engaged views**: viewers who stayed past the initial seconds, loops excluded. Compare videos on this, not on raw views.
- **AVD / avg % viewed**: both are ranking signals; relative watch time weighs more for short videos, absolute watch time for long ones.
- **Intro**: the share still watching after the first 30 seconds.
- **Typical retention** compares the video with **your 10 latest videos of similar length**.

## 2. What "normal" looks like under 1,000 subscribers
All **[H]** except where marked. These are labels for triage, not targets.
| Number | Low | Normal-for-us | Good |
|---|---|---|---|
| Impressions in 48 h | under 300 | 300–3,000 | 3,000+ |
| Impressions CTR | under 2% | 2–6% | 6%+ — official: half of all channels and videos fall between **2% and 10%**, and new videos or videos with fewer than 100 views "can see an even wider range" **[V]** |
| Intro (past 30 s) | under 35% | 35–60% | 60%+ |
| Avg % viewed, 8–10 min video | under 20% | 20–35% | 35%+ |
| Short: stayed to watch | under 60% | 60–70% | 70%+ |
| Subscribers per video | 0 | 0–1 | 2+ |
Rules for using the table: **never read CTR below 500 impressions** (official advice is not to check CTR right after uploading and to compare over the long term, considering traffic sources **[V]**), and compare only videos of the same type, because "success looks different for each format" **[V]**.

## 3. The triage tree (walk it in order; stop at the first YES)
```
A. Is the video actually live, public, processed in HD, and not age-restricted or claimed?
   YES-problem -> fix the upload. Not a views problem.  (runbook step 9 + 13)
B. Impressions under 300 at 48 h?
   YES -> BRANCH 1: DISTRIBUTION (too few impressions)
C. Impressions OK but CTR under 2% with 500+ impressions?
   YES -> BRANCH 2: PACKAGING (title/thumbnail)
D. CTR OK but Intro under 35%, or avg % viewed under 20%?
   YES -> BRANCH 3: HOOK / RETENTION
E. All of the above OK but 80%+ of traffic from one source, or ~0 Browse and ~0 Suggested?
   YES -> BRANCH 4: TRAFFIC MIX
F. Everything looks fine in share terms and the absolute numbers are still tiny?
   YES -> BRANCH 5: TOPIC DEMAND
```

### Branch 1 — Distribution: impressions are too low
This is the default diagnosis for this channel. YouTube decides whether to show a video based on how viewers respond, and "aims to give as many videos as possible a chance to be discovered by audiences who are interested in them" **[V]**; with 7 subscribers there is almost no seed audience to respond.
Fix, in this order:
1. **Make videos findable instead of recommendable.** Put the search phrase in the first 40 characters of the title and in the first description line (`youtube-seo-metadata`). Search traffic does not need subscribers.
2. **Pick topics with existing demand.** Studio → Analytics → **Trends** (desktop) shows top searches from your audience over 28 days and an audience-interest level from very low to very high, based on videos watched over 1,000 times per week in the last 28 days **[V]**. Also use `youtube-free-research` and `youtube-topic-ideation`.
3. **Use the Short as the door.** Shorts get their own feed audience and need no subscribers (`youtube-shorts-growth`).
4. **Don't** swap the thumbnail. With under 500 impressions, CTR is noise.
5. **Don't** delete or re-upload. Uploading unlisted and later flipping public does not hurt performance; what matters is viewer response after publishing **[V]**.

### Branch 2 — Packaging: impressions fine, CTR low
- Confirm against the channel's own median CTR, not the table. Also check Home and Suggested CTR in the first 24 hours after publication, which is the official suggestion for general-audience content **[V]**.
- Fix: thumbnail first (`youtube-thumbnail-design`), then the title (`youtube-title-lab`), one at a time, 48 h apart. Use **Test & Compare** when at a computer: titles, thumbnails or both, up to 3 variants, judged on **watch time share**, result within two weeks **[V]**.
- Official caution: "Changing your video title and thumbnail can be an effective way to get more views, but don't change what's working" **[V]**. Any re-ranking comes from viewers reacting differently, not from the edit **[V]**.
- Warning sign: **high CTR with low average view duration** is a clickbait signal, and such videos are less likely to be recommended **[V]**. A CTR fix that breaks the promise is a loss.

### Branch 3 — Hook / retention
- Read the retention graph shape (flat line = watched start to finish; spikes = rewatched or shared; dips = skipped or left) **[V]**, then hand the fix to `youtube-hook-lab` for the first 30 s and `youtube-retention-scriptwriting` for the body.
- Intro below 35% with a good CTR means the opening does not pay the title's promise. Fix the **next** video; do not repackage this one.
- Avg % viewed under 20% on an 8–10 min video usually means length, not hook. Test a 5–6 min cut as EXP in `youtube-experiment-lab`.

### Branch 4 — Traffic mix
Traffic source types to read on the Reach tab **[V]**: Browse features (Home, Subscriptions, Watch Later, Trending/Explore), YouTube search, Suggested videos (beside or after other videos, plus description links), Shorts, Channel pages, Playlists, Notifications, End screens, External sources, Direct or unknown.
| Pattern | Reading | Fix |
|---|---|---|
| Almost all Browse, nothing else | only subscribers and a small Home test saw it **[H]** | add search intent to the title; build playlists so Suggested has somewhere to point |
| Almost all Search, no Suggested | findable but not engaging enough to be suggested next **[H]** | raise avg % viewed; end on the next video, not a recap |
| Almost all Shorts | the Short carried it; the long video is invisible **[H]** | check the Short's related-video link is set; leave the big question for the long video |
| Almost all External or Direct | off-platform pushes, which YouTube can't build on **[H]** | fine, but don't read it as a win; it does not teach the system who to show it to |
| 80%+ from any single source | fragile **[H]** | work the second-weakest source for a month |

### Branch 5 — Topic demand
- The topic may simply be declining: one listed cause of falling traffic is that "The topic your videos are focused on is declining in popularity", and YouTube advises continuing to test new topics and formats **[V]**.
- Check with `youtube-topic-ideation`'s demand signals before concluding the video failed. A good video on a topic nobody searches is a planning failure, not a production failure.
- Evergreen topics can take weeks: "It's common for viewers to start showing more interest in old videos" **[V]**. Do not bury an evergreen video after 7 days.

## 4. Channel-level version: flat for 2+ weeks
Run this when total views and subscribers barely move for 14 days or more.
1. **Owner, phone, 5 min.** Studio app → **Analytics** (channel) → Overview: send views, watch time, subscribers for **Last 28 days**. Then → **Audience**: send new / casual / regular viewer counts. New viewers watched for the first time; casual watched occasionally for a while; regular have watched consistently for a long time **[V]**.
2. Compute, from the stats CSV, the **median 14-day engaged views per format** (news, history, what-if, top-5). One weak format can hide behind a channel average.
3. Check the three channel-level causes YouTube names **[V]**: viewers stopped watching most of the channel's videos when recommended; the topic is declining; uploads became less frequent. Also note that a single underperforming video usually does not hurt the channel **[V]**, and that "views lower than subscriber count" is normal because the count "doesn't represent the number of viewers who watch your videos" **[V]**.
4. Check the self-inflicted list before blaming the algorithm: a repeated thumbnail layout, the same opening sentence pattern, allegations not labelled, a misleading title, missing captions, the Short's related video unset, uploads above the notification cap.
5. Pick **one** change for the next two weeks, from the highest branch that applies. Not three.
6. If the flat line is really the channel's whole-platform reach, prefer search-driven evergreen topics for 4 weeks. That is the only lever that does not depend on an audience we do not yet have.

## 5. When to stop a format
Decide only on a format's **last 4 videos**, using median 14-day engaged views against the channel median **[H]**:
| Condition | Decision |
|---|---|
| format median ≥1.5× channel median | keep and double down (`youtube-topic-ideation` spin-offs) |
| 0.5–1.5× | keep; it is noise at this size |
| below 0.5× **and** Intro at or above the channel median | packaging problem — 4 weeks of new title and thumbnail style first |
| below 0.5× after that packaging change | change the format's angle or length, one variable, as an EXP |
| still below 0.5× after both, over 12+ videos | retire the slot; replace with the strongest format's second theme |
| below 0.5× with fewer than 4 videos, or any arm confounded | **do not decide** — not enough data |
Never retire a format in its first 4 videos, never retire two formats in the same month, and tell the owner in one line before a slot changes. YouTube's own advice is to prioritize consistent quality over upload frequency **[V]**, so if stopping a format means fewer, better uploads, that is an acceptable outcome.

## 6. Three answers never to give
- "YouTube is suppressing the channel." No official page supports a shadowban; demonetization status does not affect discovery either — the search and recommendation system "doesn't know which videos are monetizing and which are not" **[V]**.
- "Post more and it will fix itself." Upload frequency is not correlated with view growth **[V]**.
- A number we do not have. If the owner has not sent impressions, say which screen to open; never estimate a metric into a diagnosis.

## Sources
- Reach tab, traffic source types, Studio app path (Content → video → Analytics → Reach): https://support.google.com/youtube/answer/9314355
- Impressions and CTR FAQ (2–10% for half of channels, wider for new videos, don't check right after upload, high CTR + low AVD = clickbait signal): https://support.google.com/youtube/answer/7628154
- Content performance metrics (thumbnail impressions, engaged views, stayed to watch, AVD, avg % viewed; views counted at playback start from 24 Aug 2026): https://support.google.com/youtube/answer/12220281
- How engagement metrics are counted (24 Aug 2026 change; YPP still on engaged views): https://support.google.com/youtube/answer/2991785
- Audience retention (Intro, typical retention vs 10 latest similar-length videos, flat line/spikes/dips, 60 s + 100 views, 1–2 day lag): https://support.google.com/youtube/answer/9314415
- Performance and discovery FAQ (declining topic, channel decline causes, breaks, frequency, publish time, views vs subscriber count, unlisted-to-public, old videos taking off, monetization status and discovery): https://support.google.com/youtube/answer/141805
- Search & discovery tips (avg view duration and avg % viewed as ranking signals; no format favoured): https://support.google.com/youtube/answer/11914225
- Recommendation system (quality over frequency; giving videos a chance to be discovered): https://support.google.com/youtube/answer/16533387
- Analytics tips (single metrics mislead; compare same-type videos): https://support.google.com/youtube/answer/11912632
- New, casual and regular viewers: https://support.google.com/youtube/answer/10246996
- Trends tab (top searches, audience interest levels, 1,000 views/week basis): https://support.google.com/youtube/answer/11962757
- Thumbnail & title tips (check Home and Suggested CTR in the first 24 h): https://support.google.com/youtube/answer/12340300
- Diagnostic-matrix idea adapted and rewritten from AgriciDaniel/claude-youtube `references/analytics-guide.md`, `sub-skills/analyze.md` (MIT, Copyright (c) 2025 Daniel Agrici): /home/claude/untrusted/skills-research/agricidaniel_claude-youtube/repo. Its CTR, AVD and RPM benchmarks are third-party and unsourced, so they are not reproduced here.
