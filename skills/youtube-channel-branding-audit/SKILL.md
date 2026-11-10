---
name: youtube-channel-branding-audit
description: "Audit Shak Clips like a YPP reviewer and a new viewer (name, handle, art, About, trailer, playlists, defaults, brand system) with a scored quarterly checklist and red flags."
---

# YouTube Channel Branding Audit (Shak Clips)

Use before applying to YPP, once a quarter (first week of Feb, May, Aug and Nov), and after any rename or format change.
Legend: **[V]** = checked on an official page (see Sources). **[H]** = heuristic (unverified).

## 1. How a reviewer looks at the channel [V]
- Reviewers can't watch everything. They sample:
  - the main theme
  - the most-viewed, newest and biggest-watch-time videos
  - titles, thumbnails and descriptions
  - the About section
- **Inauthentic content** (renamed from "repetitious" on 15 Jul 2025) covers:
  - template-looking videos
  - the same situation with the same outcome
  - slideshows or scrolling text with minimal narrative
  - AI content built on generic templates
- **Reused content** is judged channel-wide, even when the original creator gave permission.
- So the audit samples: 5 newest + 5 most-viewed + 5 top watch-time long videos, plus the 5 newest Shorts.

## 2. Step 0: feature eligibility (blocker)
- Intermediate features (phone verification) give custom thumbnails **[V]**. vidIQ refused the thumbnail on 2026-11-10, so this isn't done yet.
- Advanced features (ID or video verification, or enough channel history) give **[V]**:
  - applying for monetization
  - chapters and pinned comments
  - a Short's related-video link
  - clickable links in descriptions and channel details
- Check Studio → Settings → Channel → Feature eligibility. Also turn on 2-Step Verification.

## 3. Name and handle: "Shak clips 3d" vs 2D content
The name promises 3D, but the videos are 2D stick-figure explainers. A reviewer reads that as an inconsistent theme. Searchers for "3d" bounce, which hurts satisfaction **[H]**.
| Option | Name | Handle | For | Against |
|---|---|---|---|---|
| **A (recommended)** | Shak Clips | @shakclips if free, else keep @shakclips3d | matches the content, short, already the brand in `topics.md` | old-handle links need updating |
| B | Shak Clips Explained | @shakclipsexplained | states the format | long, and ties the channel to one format |
| C | keep Shak clips 3d | — | no work | the mismatch stays, unless 3D-world Shorts (the `cartoon-3d-short` style) become the core |
- Limits **[V]**:
  - The name can change twice in 14 days, and so can the handle.
  - A name change removes a verification badge (the channel has none).
  - Handles are 3–30 characters.
- Do it **now**, at 7 subs, well before applying and never during a YPP review **[H]**.
- Redirects from the old handle aren't documented **[V]**, so after a change:
  - Update the description footer, banner, watermark, social bios and the runbook text (that's the owner's edit).
  - Use the permanent channel URL `youtube.com/channel/UCKDebyppwGYG3UpxWGrd3FQ` in automation.
- Write it "Shak Clips" (title case) everywhere: YouTube, Instagram, Facebook, X, TikTok.

## 4. Channel assets: specs [V] and content
| Asset | Spec | Content |
|---|---|---|
| Banner | ≥2048×1152 (16:9), text inside the 1235×338 safe area, 2560×1440 recommended, ≤6 MB | name + promise + "New explainer daily · 5 PM ET" |
| Avatar | shown at 98×98; JPG/PNG/BMP/GIF (not animated); ≤15 MB | Shak's stick-figure head on the brand colour, readable at 98 px |
| Watermark | square, ≥150×150, <1 MB; show at the end (last 15 s), from a custom time, or for the whole video | the Shak head; custom start at 0:30 so the hook stays clean **[H]** |
- About template (the official page sets no length; keep it to 4 short lines):
  > Shak Clips explains the stories everyone's talking about, true history and big what-ifs, in hand-coded stick-figure animation.
  > Daily at 5 PM ET: trending explained (Mon/Wed/Fri/Sun), True Story Tuesday, What If Thursday, Top 5 Saturday.
  > How it's made: every claim is checked against 2+ sources (listed under each video), the script carries Shak's own take, it's animated in our own engine, and it's narrated by an AI voice.
  > Business: <email>
- Home tab **[V]**:
  - The **channel trailer** is shown to non-subscribers and isn't shown again once watched.
  - **Spotlight** (featured video) is for returning subscribers.
  - There can be up to 12 sections.
  - Order: trailer → 4 series playlists → Shorts → Uploads.
- Playlists: one per series, named exactly like the title tag (Shak Explains, True Story Tuesday, What If Thursday, Top 5 Saturday), each with a 2-line keyword description. A series playlist needs a verified account **[V]**.

## 5. Upload defaults (Studio → Settings → Upload defaults)
- Description footer: the schedule line, a "Narration: AI voice (Kokoro). Research, script and animation: Shak Clips." line, and the RESEARCH & SOURCES header.
- **Category: Education (ID 27).** vidIQ's draft uses 22 (People & Blogs) when `categoryId` is left out, so the owner should add `categoryId: 27` to the runbook's YouTube destination.
- Language: English. "Allow automatic chapters": on.
- Audience: "No, it's not made for kids". Made for Kids turns off notifications, end screens, cards and posts **[V]**.
- AI label: not needed for clearly unrealistic animation **[V]**. Add it only if a scene is ever made to look real.

## 6. Visual brand system (shared by thumbnails and videos)
- **Constants** (the same every time, 25% of the thumbnail area or less **[H]**):
  - the Shak head mark in the same corner
  - Inter Black for thumbnail words, Inter for on-screen text
  - stick-figure stroke weight
  - the real-person name-tag style and the source-card style
- **Series accents** (proposed; check contrast against `youtube-thumbnail-design`):
  - Shak Explains: red #E63946
  - True Story Tuesday: amber #F4A261
  - What If Thursday: teal #2A9D8F
  - Top 5 Saturday: gold #FFD166 with a big numeral
  - Base colours: navy #1D3557 / off-white #F1FAEE
- **Variables** (the runbook requires these to change daily): layout, focal pose, composition, palette within the series, cold-open style. Never reuse yesterday's layout.
- The same accent appears in the video's title card and lower thirds, so the thumbnail and the video feel like one product.
- Every thumbnail element must appear in the video. Misleading or clickbait videos lose Hype and risk limited ads **[V]**.

## 7. Quarterly audit: score each item 0 (fail), 1 (partial) or 2 (pass)
1. Name, handle, avatar, banner and watermark are consistent with the 2D explainer content and across platforms.
2. Advanced features and 2-Step Verification are on; no active strikes.
3. About, trailer and Spotlight are set and current (the trailer is under 90 days old).
4. Every public long video is in exactly one series playlist; the Home tab sections are in order.
5. Upload defaults: category 27, footer, Made for Kids = No.
6. **Reviewer sample:** each sampled video has 2+ "Shak's take" moments, a distinct structure and an original angle.
7. **Metadata honesty:** titles and thumbnails match the content, allegations are labelled, there's no profanity in titles or thumbnails, and the hashtags are relevant.
8. **Originality:** no third-party photos, footage or music (owner-supplied excepted), and no open Content ID claims (Studio → Content → Copyright).
9. Visual system: constants present, and no 2 consecutive thumbnails share a layout.
10. Ads suitability: no unresolved yellow icons, and long videos are at least 8:00 (8:30+ is the target).
- **18–20:** ready to apply or keep going. **14–17:** fix before applying. **13 or less:** pause new formats and fix first.
- **Any 0 on items 6, 7 or 8 blocks applying**, whatever the total.
- Write the score, the date and the fixes into `log.md`.

## 8. Red flags reviewers and viewers notice
- The same title shape, cold open or thumbnail layout day after day: it looks mass-produced.
- Narration that only reads the news with no take; scenes that are really slideshows.
- A name or banner that promises something the videos aren't ("3d").
- A title promise the video doesn't deliver; ALL-CAPS "EXPOSED".
- Unlabelled allegations, or real people drawn as anything other than neutral figures.
- Third-party photos or reused clips anywhere, including Shorts and thumbnails.
- Topic whiplash with no visible thread. Fix it with the series names, the About promise and the playlists.
- Mass deleting or privatizing videos: their watch hours stop counting **[V]**. Fix the metadata instead.

## Sources
- YouTube:
  - Monetization policies: https://support.google.com/youtube/answer/1311392
  - Feature tiers: https://support.google.com/youtube/answer/9890437 and https://support.google.com/youtube/answer/9891124
  - Name and handle: https://support.google.com/youtube/answer/2657964 and https://support.google.com/youtube/answer/11585688
  - Branding specs: https://support.google.com/youtube/answer/10456525
  - Layout / series playlists: https://support.google.com/youtube/answer/3219384 and https://support.google.com/youtube/answer/6084043
  - Notifications (Made for Kids): https://support.google.com/youtube/answer/7389684
  - End screens / cards: https://support.google.com/youtube/answer/6388789 and https://support.google.com/youtube/answer/6140493
  - Posts: https://support.google.com/youtube/answer/9409631
  - AI disclosure: https://support.google.com/youtube/answer/14328491
  - Hype: https://support.google.com/youtube/answer/15509925
  - YPP: https://support.google.com/youtube/answer/72851
- vidIQ `categoryId` default: vidIQ MCP tool description (checked 2026-11-10).
- Distilled from MIT repos:
  - agricidaniel/claude-youtube: `sub-skills/audit.md`, `sub-skills/strategy.md`, `references/analytics-guide.md`. Its "JI Digital 76+ score grows 3.2x" claim is heuristic and not used.
  - coreyhaines31/marketingskills: `skills/community-marketing` (identity-first branding).
