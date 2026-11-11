---
name: youtube-suggested-browse-reach
description: "Get Shak Clips recommended on Home and in Suggested beside bigger videos: official signals, adjacent-topic targets, packaging that fits, session chains, Studio reading and a weekly routine."
---

# YouTube Suggested & Browse Reach (Shak Clips)

Use when choosing which big videos to sit next to, packaging an evergreen video for Home and Suggested, wiring end screens and playlists into chains, or running the Sunday reach review.
Legend: **[V]** = verified on an official YouTube page (see Sources, checked 2026-11-11). **[H]** = heuristic (unverified rule of thumb).
Scope: search-first work goes to `youtube-search-evergreen-engine` and finding outliers to `youtube-competitor-outliers`. Why one video flopped goes to `youtube-low-views-diagnosis`, title and hook variants to `youtube-title-lab` and `youtube-hook-lab`, and tests to `youtube-experiment-lab`.

## 1. What YouTube says about recommendations [V]
| Surface | How it ranks, in YouTube's words (as of 2026-11-11) |
|---|---|
| Home | By "how well they've satisfied similar viewers", plus each viewer's watch and search history. Repeat exposure of the same video is limited |
| Suggested / Up next | The video being watched is "the main signal". It shows what viewers are most likely to watch next, often related to the current video, sometimes personalised |
| All surfaces | Whether viewers "choose to watch it, ignore it, or click 'not interested'"; avg view duration **and** avg % viewed; likes and post-watch surveys |
- Personalisation draws on "what videos the viewer has enjoyed in the past", "videos that are often watched together", and how much of a channel or topic a viewer watches **[V]**.
- Satisfaction surveys ask for 1–5 stars. Only 4–5 star ratings count as "valued watchtime", and a model predicts answers for viewers who skip the survey **[V]** (YouTube blog, 2021).
- For long videos, absolute watch time matters more; for short ones, relative watch time does **[V]**.
- Monetisation status and the channel's country setting don't affect recommendations **[V]**.
- Home and Suggested traffic falls when the audience's attention shifts or a topic declines **[V]**. YouTube's advice: "Focus on what your audience likes... the recommendations will follow" **[V]**.

## 2. What that means at 7 subscribers [H]
- Home needs data on "similar viewers". With very few viewers, the realistic first door is **Suggested**, next to a popular video whose viewers then watch ours to the end.
- So every evergreen video is designed as the **natural next watch** for one specific, already-popular video (its "anchor").
- A viewer who watches 2–3 of our videos in one sitting is the clearest sign that the channel and topic pairing works. Chains (section 5) make that easy.

## 3. Adjacent-topic strategy (the main lever)
1. **Pick 3 anchors a week** from `youtube-competitor-outliers` or `youtube-free-research` **[H]**:
   - at least 3× its channel's median views;
   - published in the last 60 days, or still rising;
   - in our lanes (history and cons, space and science what-ifs, US tech/business backstory), in English for a US audience.
2. **Write the viewer's next question** for each anchor: what it raised but didn't answer **[H]**. Look for it in:
   - the anchor's chapter list and its most-liked comments (read the public page; if it's blocked, skip it);
   - autocomplete for the anchor's topic plus "why" or "how" (method in `youtube-search-evergreen-engine`).
3. **Answer that next question; never retell the anchor.** Test: someone who just watched the anchor learns 3+ new facts from ours **[H]**.
4. **Share the topic nouns, not the wording.** Use the anchor's main subject words in our title and description line 1. Never use their title phrasing, channel name, characters or brand (the fair-borrowing table in `youtube-competitor-outliers`).
5. **Publish within 7–21 days** in a Tue/Thu/Sat slot, while the anchor still gets traffic **[H]**. Add it to `topics.md` with `source=adjacent:[anchor URL]`.

| Anchor type (big channel) | Our adjacent "next watch" |
|---|---|
| A documentary on the fall of Rome | How Roman concrete outlasted the empire |
| "What if the Moon disappeared?" | Why the Moon is slowly drifting away from Earth |
| Coverage of a Starship launch | Why SpaceX catches rockets instead of landing them on legs (made 2026-11-10) |
| A famous heist documentary | 5 heists that used the same trick (Top 5 Saturday) |
| A big tech-news explainer | The backstory: how the company got here (`youtube-trend-speed-playbook`) |
- Once Studio has data, Analytics → Audience gives you "Channels your audience watches" (28 days) and "What your audience watches" (7 days) **[V]**. Those are proven anchors, so prefer them.

## 4. Packaging that fits beside them without copying
- [ ] **Same world:** the topic nouns match the anchor, so a viewer reads it as the same subject with a new angle **[H]**.
- [ ] **Different look:** a different dominant colour from the anchor's thumbnail, our stick-figure style, and one focal object (`youtube-thumbnail-design`) **[H]**.
  - Mock test: put ours in a column with the anchor and 2 other thumbnails at 168×94 px. Ours must stand out and still read **[H]**.
- [ ] **Different promise:** the title asks the *next* question, not the anchor's question **[H]**.
- [ ] **Clean:** none of the anchor creator's names, logos, frames or characters anywhere. "Don't add hashtags that are not directly related to the video", and misleading or unrelated hashtags "may result in the removal of your video" **[V]**.
- [ ] **Honest:** titles should "accurately represent the content" **[V]**. Maliciously misleading titles or thumbnails count as spam **[V]**.
- [ ] **Browse-ready:** an "intriguing" title type works for viewers "who may not be looking for topic-specific content" **[V]**. Keep the keyword in the first half, and get variants from `youtube-title-lab`.

## 5. Session continuation: keep them watching us
| Tool | Facts | Our setting |
|---|---|---|
| End screen | The last 5–20 s; up to 4 elements on 16:9; a video element can be "Best for viewer" **[V]**. Not shown on mobile web, except iPad **[V]** | 1) the next video in the same cluster or series, 2) its playlist, 3) subscribe |
| Series playlist | Marks "an official set of videos that should be viewed together", so the others can be "featured and recommended". One per video, verified account only **[V]** | One per format (`youtube-community-engagement`) |
| Cluster playlist | A normal playlist per topic (`youtube-search-evergreen-engine`) | Link it on description line 3 |
| Bridge line | The last 15–20 s of the script names the next video (`youtube-retention-scriptwriting`) | Spoken, and shown on the end card |
| Short → long | The related-video link (`youtube-shorts-growth`) | Owner, daily |
- Because end screens miss some mobile viewers, the spoken bridge line carries the chain **[H]**.
- **Chain rule [H]:** every new evergreen video names one older video in the same lane, and that older video's end screen gets updated to point at the new one (owner task, section 8).

## 6. Consistency that teaches the system who we're for
- YouTube: "growth in views across uploads is not correlated with time between uploads", and consistent quality matters more **[V]**. Here, consistency means **topic and audience** consistency, not more uploads **[H]**.
- Keep 70% or more of long videos in the 3 lanes from section 3 **[H]**. Topic whiplash is a red flag in `youtube-channel-branding-audit`.
- Keep series names, the colour system and the Shak head mark steady, so a returning viewer spots us in a grid **[H]**.
- Never add uploads to rescue a slow week. A channel can send at most 3 new-video notifications per 24 h **[V]**.

## 7. Read Suggested and Browse in Studio
**Owner, phone, about 2 min per video:**
1. Open the YouTube Studio app → **Content** → tap the video → **Analytics** → **Reach** **[V]**.
2. In **Traffic source types**, note the % for **Browse features** and **Suggested videos**.
3. Open the **Traffic source: Suggested videos** card, which lists the videos ours was suggested next to **[V]**. Copy the top 3 titles.
4. Note **Impressions** and **Impressions click-through rate**.
5. Paste into chat: `title | Browse x% | Suggested y% | next to: A, B, C | impr n | CTR z%`.

**How Claude reads it (at 7 d and 28 d):**
| Pattern | Meaning | Action |
|---|---|---|
| Suggested views come mostly from one outside video | We became its next watch | Make 1 more adjacent video for that anchor within 14 days **[H]** |
| Suggested views come mostly from our own videos | Chains work, but there's no outside door | Choose new outside anchors **[H]** |
| Browse impressions rise while CTR falls | Normal: CTR drops when impressions grow, e.g. from Home **[V]** | No thumbnail swap unless views per day also fall **[H]** |
| Many impressions, low avg % viewed | The packaging promise doesn't match the video | Hand off to `youtube-low-views-diagnosis` |
| Browse plus Suggested under 10% at 28 d | Not recommended yet | Keep adjacency and search; watch returning viewers **[H]** |
- Half of all channels and videos have an impressions CTR between 2% and 10% **[V]**. Compare over the long term, and only after substantial impressions **[V]**.

## 8. Weekly routine (Sunday: about 25 min for Claude, 8 min for the owner)
1. **Owner (5 min):** do section 7 for the week's 3 evergreen videos plus any video with rising views. Then Studio app → **Analytics** → **Audience**, and screenshot "Channels your audience watches" if it shows.
2. **Claude:** log the numbers in `log.md`, and mark each anchor that sent Suggested traffic.
3. **Claude:** pick 3 new anchors and write 3 adjacent ideas into `topics.md` (section 3).
4. **Claude:** write an end-screen list for the owner of at most 3 edits, each "old video → point at new video".
5. **Owner (3 min):** end screens can only be edited from a computer in the help steps **[V]**. On the phone, open Chrome → studio.youtube.com → ⋮ → tick **Desktop site** **[H]** → **Content** → the video → **Editor** → **End screen** → add the element → **SAVE** **[V]**.
6. **Claude:** check the lane ratio (70%+), and that the series and cluster playlists are up to date. Make at most 1 strategy change a week.

## Sources
- How YouTube recommendations work: https://support.google.com/youtube/answer/16089387
- Recommendation signals for creators: https://support.google.com/youtube/answer/11914225
- Discovery and performance FAQs (Home, Suggested, cadence, declines): https://support.google.com/youtube/answer/141805
- On YouTube's recommendation system (Cristos Goodrow, 15 Sep 2021): https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/
- Audience reports: https://support.google.com/youtube/answer/9314416
- Traffic sources and the Reach tab: https://support.google.com/youtube/answer/9314355
- Impressions and CTR: https://support.google.com/youtube/answer/7628154
- End screens: https://support.google.com/youtube/answer/6388789
- Series playlists: https://support.google.com/youtube/answer/6084043
- Title tips: https://support.google.com/youtube/answer/12340300
- Spam and misleading metadata: https://support.google.com/youtube/answer/2801973 · Hashtags: https://support.google.com/youtube/answer/6390658
- Notification limits: https://support.google.com/youtube/answer/7389684
- Raw material, rewritten: AgriciDaniel/claude-youtube `references/algorithm-guide.md` (MIT License, Copyright (c) 2025 Daniel Agrici), https://github.com/AgriciDaniel/claude-youtube. Its third-party CTR, AVD and reach numbers are not used.
