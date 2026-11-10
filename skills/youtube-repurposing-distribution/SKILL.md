---
name: youtube-repurposing-distribution
description: "Cross-post each Shak Clips Short to TikTok, Reels and Facebook via vidIQ, turn long videos into posts, and win Google visibility without spam, watermarks or reused content."
---

# YouTube Repurposing & Distribution (Shak Clips)

Use after a video and its Short are rendered: to send the Short to other platforms, to write text posts from the long video, or to improve Google Search and Discover visibility.
Legend: **[V]** = checked on an official page (see Sources). **[H]** = heuristic (unverified).

## 0. Pre-flight (once)
- `vidiq_social_account_list` (free): note each platform's `platformAccountId` and check `canPublish: true`. Platforms without a connected account are skipped. Never connect an account unasked.
- **TikTok and India:** TikTok has been blocked in India since June 2020, and press reports in 2026 say the ban still stands.
  - The owner decides whether to run a TikTok account at all.
  - Never use workarounds that break local law. If no TikTok account is connected, skip it.
- X posts cost vidIQ credits (more with a link), and the balance is 0 until 2026-12-08. Keep X off until then; after that, use it once a week for the best video.

## 1. One clean master per Short
- Render a dedicated 1080×1920 master from the engine. No other app's watermark, no YouTube UI graphics. Upload it once with `vidiq_video_upload`.
- **Never download the published YouTube Short and re-post it** **[V]**:
  - Instagram shows watermarked or low-resolution Reels less.
  - Meta cuts distribution of duplicates and visibly recycled clips.
  - TikTok's API rules forbid apps adding watermarks or logos.
- Length: Instagram recommends only Reels of 3:00 or less, and YouTube Shorts max out at 3:00 **[V]**. The pipeline's Shorts are well under that.
- Outro: "full story on the channel" works on YouTube. Elsewhere, end on an on-screen card, "Full video: YouTube · Shak Clips", so the line makes sense off YouTube **[H]**.
- Captions: burned-in captions stay out of the bottom ~20% and right ~15% of the frame, where the app UI sits **[H]**. Platform auto-captions are an extra, turned on if the owner wants them.

## 2. Posting flow with vidIQ (free except X)
1. Create **one** `vidiq_social_post_draft_create` with every destination. Never split one post into several drafts; each destination carries its own `text` and `publishAt`.
2. **TikTok** **[V]**:
   - Privacy level, comments, duet/stitch and the Music Usage Confirmation are **the creator's choices**. TikTok requires the privacy level to be picked manually with no default, and the interaction boxes to start unchecked.
   - So never fill in `privacyLevel`, `allowComment` or `musicUsageConfirmed`.
   - In the unattended run, use **inbox delivery** (title only), and the owner finishes the post in the TikTok app. Or leave the draft for the owner.
3. **Instagram Reels**: use the shared master. For a Trial Reel or the AI label, use `vidiq_instagram_publish_reel`.
4. **Facebook Reels**: a `FACEBOOK_PAGES` destination on the Shak Clips Page.
5. Check `ready: true`. Fix any refusal with `vidiq_social_post_draft_update`, using the same postId.
6. Publish with `vidiq_social_post_publish` **only under an approval that covers that platform**. The runbook's standing approval covers YouTube, so ask the owner once before extending it to Instagram and Facebook.
7. Log each platform's post ID and time in `log.md`. Check `vidiq_social_post_list` first so nothing posts twice.
- Timing **[H]**: YouTube at 22:00 UTC; Instagram and Facebook Reels at 23:00 UTC (6 PM ET); TikTok whenever the owner completes it.

## 3. Platform-native copy (rewrite per platform, never paste one caption everywhere)
| Platform | Hook line | Hashtags | Notes |
|---|---|---|---|
| YouTube Short | the question the video answers | 2–3. The first 3 show above the title; **over 60 and all are ignored** **[V]** | related-video link to the long video |
| Instagram Reels | first 125 characters carry the hook **[H]** | 3–5 **[H]** | put search keywords in the caption **[V]** |
| Facebook Reels | a plain sentence, no all-caps | 5 or fewer, no link in the caption (Meta says these "reportedly" do best) **[V]** | Page voice, not personal |
| TikTok | spoken-style, under 150 characters **[H]** | 3–5 **[H]** | owner picks the settings |
| X (credits) | 1 punchy fact + native clip | 0–1 | weekly only |
- Template: `<surprising fact as a question>? <1-line payoff tease>. Full story on YouTube: Shak Clips. #<topic> #<series> #history`
- AI disclosure:
  - YouTube doesn't require a label for clearly unrealistic animation **[V]**.
  - TikTok requires labelling realistic AI images, audio or video **[V]**. The narration is a synthetic voice, so recommend the owner turns on `isAiGenerated` (TikTok) and the AI label (Instagram), and writes "AI narration" in captions.

## 4. Long video → text formats
- **Facebook Page post**: 3 lines (what happened, the surprising part, Shak's take) plus a link to the video.
- **X thread** (credits, weekly) **[H]**: a hook that stands alone, 4–6 facts that each stand alone, then the link post. Every fact comes from the video's source list.
- **Reddit** (manual, rare):
  - Reddit's content policy asks for genuine posts, following each community's rules, and no spamming or vote manipulation **[V]** (archived policy text).
  - Read the subreddit's own rules first; many history and science subs ban YouTube links.
  - Lead with a real text answer plus sources, and link the video only where allowed and relevant. Say "I made this".
  - Old "9:1" convention **[H]**: at most 1 self-link per subreddit every 2 weeks, plus at least 9 non-promotional contributions per link.
- **Community post on YouTube**: see `youtube-community-engagement`.

## 5. Google Search and Discover
- **Chapters** need advanced features.
  - Rules **[V]**: the first timestamp is 00:00, 3+ timestamps in ascending order, each chapter 10 s or longer. Description timestamps override automatic chapters.
  - Google uses timestamps from a YouTube description for "key moments" **[V]**.
  - Build them from the script's act boundaries and sentence timings (free). Use keyword-plain labels, e.g. "00:00 Why SpaceX catches rockets".
- **Description**:
  - First 2 lines: a plain-language answer containing the phrase people search.
  - Then the chapters, then the RESEARCH & SOURCES block (already required by the runbook).
  - Never add unrelated tags or hashtags; that's misleading metadata **[V]**.
- **Captions**: upload an SRT built from the exact script and timings, with names spelled right. It's good for accessibility; any ranking gain is **[H]**.
- **Embedding** (optional, later): a free site such as GitHub Pages with one watch page per evergreen video **[V]**:
  - The video must be the page's main content.
  - Add VideoObject markup with `name`, `description`, `thumbnailUrl`, `embedUrl`, plus `Clip` entries for chapters.
  - Discover is listed as one of the places Google can show videos.

## 6. What not to do
- Re-upload or compile other people's clips, even with permission. YouTube's reused-content rule applies to the whole channel **[V]**.
- Re-post a Reel already on Instagram (it's shown less) **[V]**, or repeatedly repost others' content on Facebook (loses reach and monetization) **[V]**.
- Engagement bait: "comment YES", "tag 3 friends", fake cliffhangers, rewards for likes. YouTube bans engagement incentives **[V]**; Meta demotes bait **[H]**.
- Post another app's watermark, low-resolution re-encodes, or the same caption on every platform.
- Mass-DM, use follow/unfollow, buy followers, or post the same link across many subreddits.
- Cross-post a video that hasn't passed the runbook's quality gate.

## Sources
- TikTok posting rules: https://developers.tiktok.com/docs/en/content-sharing-guidelines
- TikTok AI labels: https://newsroom.tiktok.com/new-labels-for-disclosing-ai-generated-content?lang=en
- TikTok blocked in India (press reports, not official pages; search results only, not opened):
  - https://www.businesstoday.in/india/story/no-comeback-for-tiktok-indian-govt-refutes-reports-of-ban-being-lifted-on-chinese-apps-490769-2025-08-23 (Aug 2025)
  - https://www.patrika.com/en/national-news/tiktok-ban-in-india-not-lifted-says-modi-government-19886142 (Feb 2026)
- Instagram:
  - https://about.instagram.com/blog/announcements/instagram-ranking-explained
  - https://creators.instagram.com/blog/tips-for-improving-your-reach
- Meta, unoriginal content (14 Jul 2025): https://creators.facebook.com/blog/combating-unoriginal-content
- YouTube:
  - Hashtags: https://support.google.com/youtube/answer/6390658
  - Chapters: https://support.google.com/youtube/answer/9884579
  - Three-minute Shorts: https://support.google.com/youtube/answer/15424877
  - Reused content: https://support.google.com/youtube/answer/1311392
  - AI disclosure: https://support.google.com/youtube/answer/14328491
  - Fake engagement: https://support.google.com/youtube/answer/3399767
  - Feature tiers: https://support.google.com/youtube/answer/9890437
- Google video SEO: https://developers.google.com/search/docs/appearance/video
- Reddit content policy (archived): https://webarchive.library.unt.edu/web/20201218091247/https://www.reddit.com/help/contentpolicy
- vidIQ tool rules: the vidIQ MCP tool descriptions (checked 2026-11-10).
- Distilled from MIT repos:
  - agricidaniel/claude-youtube: `sub-skills/repurpose.md`, `references/repurposing-guide.md`, `references/shorts-playbook.md`. Its "15 hashtags" limit is wrong (official: over 60).
  - coreyhaines31/marketingskills: `skills/social/references/platform-limits.md`, `short-form-video.md`. Its Instagram and TikTok hashtag caps are unverified.
