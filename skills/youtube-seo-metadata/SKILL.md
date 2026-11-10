---
name: youtube-seo-metadata
description: Write honest, search-ready titles, descriptions, chapters, tags, hashtags and SRT captions for each Shak Clips upload, output as one copy-paste upload package.
---

# YouTube SEO & Metadata (Shak Clips)

Use for every daily upload (8–10 min long video plus its Short), before the vidIQ draft/upload call.
Labels: **[official]** = confirmed on a YouTube/Google page in Sources. **heuristic (unverified)** = a rule of thumb with no official source.

## 1. Know which surface you are writing for
| Surface | What it ranks on | What the metadata must do |
|---|---|---|
| Search | Relevance: how well the title, tags, description and video content match the query. Engagement: watch time for that query. Quality: expertise, authority, trust **[official]** | Use the words people type, early in the title and the first description line |
| Browse (Home) and Suggested | Whether viewers choose to watch, ignore or dismiss a video, avg view duration and avg % viewed, likes, surveys **[official]** | Make people curious and keep the promise; the title and thumbnail have to do this together |
| Shorts feed | Whether viewers choose to watch or swipe, plus likes and surveys **[official]** | Title matters little in the feed and more in search |

The title type follows the slot:
- Mon/Wed/Fri/Sun news: **search-first**, because people search for the named event.
- Tue history, Thu what-if and Sat top-5: **browse-first** (curiosity), with the keyword still in the first half.

## 2. Titles
- Hard limit: 100 characters **[official]**. Target 45–65.
- Put the keyword and the hook in the first ~40 characters, because mobile cuts around 40–50 (heuristic, unverified).
- Put the most important words first; save episode numbers and branding for the end **[official]**.
- Limit ALL CAPS and emoji **[official]**. Use at most one capitalised word, and no emoji.
- YouTube names two title types **[official]**: *searchable* (says clearly what to expect) and *intriguing* (sparks curiosity).
- Write 3 variants (search, curiosity, hybrid), pick one, and keep the other two for Test & Compare (see `youtube-analytics-loop`).

Templates (fill the slots in our own words; numbers in titles are a heuristic, unverified):
- News: `[Named event] Explained: [the real stake]` / `Why [event] Matters More Than You Think`
- History: `How [person/place] Actually [did X]` / `The [Weird/Forgotten] Story of [X]`
- What-if: `What If [X]? [concrete consequence]`
- Top-5: `5 [things] That [surprising outcome]`

**Honesty gate (all must pass, or rewrite):**
1. The title's promise is paid off in the video, and its core is shown or stated within the first 60 s.
2. Unproven claims use "alleged", "accused" or "claims". Never state an allegation as fact.
3. No fake quotes, no "real footage" wording for animation, no invented numbers.
4. The thumbnail and title tell the same story.

The spam policy bans "maliciously misleading titles, thumbnails, descriptions" **[official]**. YouTube also warns that a title that doesn't match the video makes viewers stop watching, which hurts discoverability **[official]**.

## 3. Description (limit 5,000 characters **[official]**)
```
[≤150 chars: the question the video answers, with the main keyword, in plain words]
[1 line: our original take: "Our angle: ..."]

[chapters, see section 4]

Sources:
- [Publisher] – "[headline]" ([date]) [URL]
- ...
Credits: narration by AI voice (Kokoro TTS); original animation by Shak Clips.
[Images supplied by the channel owner: list, if any]

Watch next: [series playlist URL] · [related video title + URL]
#Topic #Format #Animation
```
- The ≤150-character preview is heuristic (unverified). It is the text shown before "more", so write it as an ad.
- A Sources list is required for news and history, and it backs the "allegations labelled" rule.
- Keep the body to 60–150 words of real summary. Never paste keyword lists: excessive tags in a description breaks spam policy **[official]**.

## 4. Chapters (also used by Google Key Moments)
- Rules **[official]**: the first timestamp is `00:00`, there are at least 3 timestamps in ascending order, and each chapter is at least 10 s. Your own timestamps override automatic chapters.
- Google Search may build key moments from YouTube description timestamps, and gives timestamps you set priority **[official]**.
- For an 8–10 min video, use 5–7 chapters of 60–120 s each, labelled as plain answers ("Why the dam failed"), never "Part 2".
- Build them from the Kokoro sentence-timing file: each chapter starts at the first sentence of a script act, rounded down to the second.
- Shorts get no chapters.

## 5. Tags (under 1 minute of effort)
- Tags "play a minimal role" in discovery; they help when a topic is often misspelled; the title, thumbnail and description matter more **[official]**.
- Use 3–6 tags: the exact topic, 1–2 spellings or alternate names (e.g. `Chernobyl, Chornobyl`), and `Shak Clips`.
- Never add other creators' names or unrelated trending terms.

## 6. Hashtags
- Up to 3 hashtags from the description are shown near the title **[official]**. With more than 60, all are ignored **[official]**. They must relate directly to the video **[official]**.
- Use exactly 3: topic (`#Chernobyl`), format (`#History`, `#WhatIf`, `#Explained`), broad (`#Animation`). Give the Short the same 3. Whether `#Shorts` adds anything is heuristic (unverified), so it's optional.

## 7. Captions (SRT)
- The pipeline already has each sentence's start and end time from Kokoro, so write an `.srt` and upload it. YouTube accepts basic SubRip only, plain UTF-8, with no styling markup **[official]**.
- Automatic captions "might misrepresent the spoken content", and YouTube advises reviewing them **[official]**. Ours are exact, because they come from the script.
- Cue rules (heuristic, unverified): ≤42 characters per line, ≤2 lines, 1–7 s per cue, names spelled correctly, numbers written as spoken.

## 8. Upload settings
- Audience: **Not made for kids**. Notifications are turned off for made-for-kids content **[official]**.
- Altered/synthetic content: disclosure is required for realistic AI content; non-realistic, fully animated content doesn't need it **[official]**. A stick-figure video with a generic Kokoro voice is "No". Use "Yes" if any realistic image or voice of a real person or event appears.
- Notify subscribers: on. The cap is 3 new-video notifications per channel per 24 h, and publishing more than 3 in a short time can pause notifications for 24 h **[official]**. Our long video plus Short is 2, so never add a third same-day upload.
- Category: Education (history, what-if, top-5) or News & Politics (news). This is our choice, not an official rule.

## 9. Output: the upload package (paste this as the run's output)
```
=== UPLOAD PACKAGE · [YYYY-MM-DD] · [slot: news/history/what-if/top-5] ===
LONG
Title ([n] chars): ...
Test & Compare alternates: A) ...  B) ...
Description:
...
Tags: ...
Category: ... | Made for kids: No | Altered content: No | Captions: [file].srt
Thumbnail: [file] (from youtube-thumbnail-design) | Playlist: ...
SHORT
Title ([n] chars): ...
Description line 1: [hook question] · Full video: "[long title]"
Hashtags: #... #... #...
Related video (OWNER sets in Studio): "[long title]"
CHECKS
[ ] title promise paid off by 0:60   [ ] allegations labelled   [ ] sources listed
[ ] chapters: 00:00, ≥3, ≥10 s each   [ ] exactly 3 hashtags   [ ] SRT attached
[ ] no third-party images unless owner-supplied   [ ] original-angle line present
```

## Sources
- Adapted from AgriciDaniel/claude-youtube `sub-skills/seo.md`, `sub-skills/metadata.md`, `references/seo-playbook.md`, `references/algorithm-guide.md` (MIT License, Copyright (c) 2025 Daniel Agrici), https://github.com/AgriciDaniel/claude-youtube. Rewritten; its unsourced numbers are dropped or labelled heuristic. Its "15 hashtags" claim is replaced by YouTube's official 60.
- Title/description limits: https://support.google.com/youtube/answer/57407
- Title & thumbnail tips: https://support.google.com/youtube/answer/12340300
- How YouTube search works: https://support.google.com/youtube/answer/16090438
- Recommendation signals (avg view duration, avg % viewed): https://support.google.com/youtube/answer/11914225
- Chapters: https://support.google.com/youtube/answer/9884579
- Key moments from YouTube descriptions: https://developers.google.com/search/docs/appearance/structured-data/video
- Tags: https://support.google.com/youtube/answer/146402
- Hashtags: https://support.google.com/youtube/answer/6390658
- Caption file formats: https://support.google.com/youtube/answer/2734698 · Automatic captions: https://support.google.com/youtube/answer/6373554
- Spam/misleading metadata: https://support.google.com/youtube/answer/2801973
- Altered or synthetic content: https://support.google.com/youtube/answer/14328491
- Notification limits: https://support.google.com/youtube/answer/7389684
