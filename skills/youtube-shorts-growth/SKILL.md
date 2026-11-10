---
name: youtube-shorts-growth
description: Cut, package and review the daily Shak Clips Short for the Shorts feed (1–2 s hook, loop, captions, safe zones) and turn its viewers into long-form subscribers.
---

# YouTube Shorts Growth (Shak Clips)

Use when cutting the daily vertical Short from the long video's hook, writing its metadata, or reviewing its stats.
**[official]** = confirmed on a YouTube page (see Sources). **heuristic (unverified)** = a rule of thumb with no official source.

## 1. What the Short is for
- **Watch hours from the Shorts feed do not count toward the 4,000-hour YPP target [official].** Shorts count only toward the separate route of 10M Shorts views in 90 days **[official]**, which is not realistic for us by 31 Jan 2027.
- So the Short has two jobs: **(a)** win subscribers who then get the long video in Home/Subscriptions, and **(b)** send viewers to today's long video.
- A Short with many views and zero subscribers is a weak Short for us.

## 2. How the Shorts feed decides
- Shorts are ranked on performance plus each viewer's history **[official]**.
- The signals YouTube names **[official]**:
  - the share of viewers who *chose to view* rather than swipe away;
  - whether they watched, ignored it or clicked "not interested";
  - likes;
  - post-watch survey answers.
- The common model is: a small test audience first, wider pushes if it holds, and sometimes a pickup days later. That model is heuristic (unverified), so don't judge a Short before 48 h.
- Shares and loops are widely reported as strong signals; that is heuristic (unverified). Design for them anyway, because they are what viewers do when they enjoy a Short.

**Studio metrics to read** (Content → Shorts → Analytics):
| Metric | Meaning | Target, heuristic (unverified) |
|---|---|---|
| Stayed to watch (older Studio name: "Viewed vs swiped away") | % of times viewers stayed past the first seconds **[official]** | ≥70% good · 60–70% OK · <60% fix the hook |
| Engaged views | Views past the first seconds, not counting loops **[official]** | Use this to compare Shorts, not raw views |
| Average % viewed | Share of the Short watched; above 100% means rewatches | ≥80% for 30–50 s Shorts |
| Subscribers gained | Followers from this Short | ≥1 per 1,000 engaged views |

Since 24 Aug 2026, a view counts as soon as playback starts in every format **[official]**. Don't compare raw view counts with Shorts posted before that date; use engaged views.

## 3. The first 1–2 seconds
Checklist (heuristic, unverified, but it is how a "chose to view" decision is won):
- [ ] Frame 1 is already in motion, with the most striking image of the story. No logo, no title card, no fade-in.
- [ ] The first spoken words state the claim or question. Never "In this video" or "Did you know".
- [ ] On-screen text (≤6 words) restates the hook, so it works muted.
- [ ] Something changes on screen within the first 2 s: a cut, a zoom, or a character move.

Hook patterns by slot (write fresh each day, never reuse a line):
- News: "[Event] just happened, and the part nobody explains is [X]."
- History: "In [year], [person] did something so strange that [result]."
- What-if: "If [X] happened right now, [first shocking consequence] in [time]."
- Top-5: Start at #1's most visual moment, then "...and that's only number one."

## 4. Length, layout and sound
- Shorts can be up to 3 minutes long, in square or vertical format **[official]**.
- If a Short over 1 minute has an active Content ID claim, it is blocked worldwide **[official]**. Use only our own or Audio Library sound.
- Default: **30–50 s with one idea**. Use 20–30 s for one top-5 item, and 45–60 s for a history mini-story. These lengths are heuristic (unverified).
- 1080×1920, 9:16. Text-safe zone (heuristic, unverified, because the app UI covers the edges): keep text and faces out of the top 220 px, the bottom 480 px and the right 160 px.
- Captions are burned in, 2–4 words per chunk, in a band about 1,100–1,400 px from the top. Use a large bold sans, 72–90 px, with a dark outline, and highlight the key noun. Take the timings from the Kokoro sentence timings.
- Change the shot every 2–4 s (heuristic). The stick-figure engine can do this cheaply with a camera push, a new prop, or a map/zoom.

## 5. Loop endings
- End on a line that leads straight back into the opening, e.g. the last line is "...which is exactly why" and the first frame answers it.
- Make the last frame's composition match frame 1, so the restart feels seamless.
- Don't end on a fade, a "subscribe" card or silence. Cut on the beat.
- The Short should feel complete on its own and leave one bigger question for the long video.

## 6. Metadata and cadence
- Title: up to 100 characters **[official]**. Aim for 30–50: the hook question, with the keyword first. Never just paste the long video's title.
- Description line 1: the hook plus `Full video: "[long title]"`. Then the same 3 hashtags as the long video. Up to 3 hashtags show by the title **[official]**.
- Cadence: YouTube says no minimum posting cadence is required **[official]**, and advises a schedule you can keep **[official]**.
- Our 1 Short a day at 22:00 UTC alongside the long video is fine. Publish time is "not known to impact" long-term performance **[official]**, so don't keep moving it.

## 7. Linking Shorts to the long video
- **Related video link (OWNER sets it every day):** Studio → Content → Shorts tab → click the Short → Related video → choose today's long video → Save **[official]**.
  - This needs advanced feature access, and the linked video must be public or unlisted **[official]**.
  - Viewers then see a clickable link under the channel handle **[official]**.
  - The daily automation can't set it, so add it to the owner's post-upload checklist.
- Keep the spoken loop line. For the last 2 s, put small on-screen text over it: "Full story on the channel" (heuristic). Never say "link below"; viewers in the feed don't see the description.
- Pin a comment naming the long video's title.
- Third-party figures put clicks through the related-video link below 1% of viewers (heuristic, unverified). The subscription is the real bridge, so judge Shorts on subscribers gained.

## 8. What to fix (review at 48 h and 7 d)
| Symptom | Likely cause | Next Short |
|---|---|---|
| Stayed to watch <60% | Weak first 2 s, slow start | Open on a later, more visual moment; cut the setup |
| Stayed ≥70%, avg % viewed <60% | The middle drags | Cut to one idea; trim 10–15 s |
| Avg % viewed ≥90%, ~0 subscribers | No reason to follow | Frame it as part of a series ("History's weirdest fixes, #4") |
| Good Short, long video gets no Shorts traffic | Link missing or Short "closes" the story | Check the related video; leave the bigger question open |
| Strong Short in one slot for 3 weeks running | The format works as short-form | Tell `youtube-topic-ideation` to give that slot more topics |

Log weekly per Short: date, slot, length, stayed-to-watch %, avg % viewed, engaged views, subscribers, related link set (Y/N).

## Sources
- Adapted from AgriciDaniel/claude-youtube `sub-skills/shorts.md` and `references/shorts-playbook.md` (MIT License, Copyright (c) 2025 Daniel Agrici), https://github.com/AgriciDaniel/claude-youtube. Rewritten; its unsourced benchmarks are labelled heuristic.
- YPP eligibility (Shorts-feed hours excluded): https://support.google.com/youtube/answer/72851
- Shorts discovery signals and cadence: https://support.google.com/youtube/answer/11914225
- Shorts metrics (stayed to watch, engaged views): https://support.google.com/youtube/answer/12220281
- View-counting update (24 Aug 2026): https://support.google.com/youtube/answer/2991785
- Three-minute Shorts and Content ID blocking: https://support.google.com/youtube/answer/15424877
- Shorts upload tips (consistency): https://support.google.com/youtube/answer/12921536
- Add a related video to Shorts: https://support.google.com/youtube/answer/14075157
- Hashtags: https://support.google.com/youtube/answer/6390658
- Publish time and cadence: https://support.google.com/youtube/answer/141805
