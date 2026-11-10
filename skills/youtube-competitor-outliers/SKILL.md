---
name: youtube-competitor-outliers
description: Map 10–20 animated, history and news explainer channels, find their 3x+ outlier videos, extract packaging, format and gap patterns, and set fair-borrowing limits for Shak Clips.
---

# YouTube Competitor Outliers (Shak Clips)

Use monthly for a full scan of 10–20 channels, and weekly for a light check of 5 peers.
The output feeds `youtube-topic-ideation` (topics) and `youtube-seo-metadata` (packaging).
**[official]** = confirmed on a YouTube page (see Sources). **heuristic (unverified)** = a rule of thumb.

## 1. Build the channel set
Aim for a mix by size, because small peers show what works without a famous brand (heuristic):
- **3 aspirational** (1M+ subscribers): for format and quality bar.
- **7–10 peers** (10k–300k): our real competition.
- **3–5 risers** (<10k with at least one outlier): the most copyable *patterns*.

Seed candidates. Verify each is active, English and in our niche before adding it:
- **Animated explainers:** Kurzgesagt, The Infographics Show, Ridddle, What If (Underknown), Casually Explained.
- **Animated history:** OverSimplified, Simple History, History Matters, Sam O'Nella Academy, The Armchair Historian, Alternate History Hub.
- **News and geography explainers:** TLDR News, Johnny Harris, Wendover Productions, PolyMatter.

Find peers and risers with WebSearch, e.g.:
- `stick figure animated history explained youtube`
- `animated explainer "what if" channel`
- `[this week's news topic] explained animation`

Once credits return (2026-12-08), use `vidiq_similar_channels` (5 credits, niche mode: "2D animated history and news explainers", language en). Keep a list of channel IDs to reuse.

## 2. Collect video data (free first)
- Use `youtube-free-research` Workflow A, which uses WebSearch plus WebFetch of public pages.
- Record only numbers actually seen in a source, with the date. Mark guesses "est.".
- If a page is blocked, move on; never work around it.
- Paid (from 2026-12-08): `vidiq_channel_videos` (5 credits per channel and format) and `vidiq_outliers` with `channelIds` (5 credits per call, up to 50 channels). Prefer one `vidiq_outliers` call over many per-channel calls. Budget about 40 credits a month.

**Outlier maths (heuristic):**
- **Baseline** = the median views of the channel's last 10–20 *long-form* uploads that are older than 14 days. Never use the mean, because one hit skews it.
- **Outlier** = ≥3× baseline · **strong** = ≥5× · **extreme** = ≥10×. Don't lower 3× to fill the table.
- Compare videos of similar age. Since 24 Aug 2026, views count as soon as playback starts **[official]**, so videos published after that date read higher. Don't mix the two eras in one baseline.

## 3. What to extract from each outlier
| Field | Record |
|---|---|
| Title pattern | Abstract into slots, e.g. `What If [planet thing] for [time]?`. Never store their exact title as our draft |
| Thumbnail | Subject, emotion, number of words (0–4), main colours, background, whether it shows a "before/after" or "danger" cue |
| Topic class | News / history / what-if / list / biography / disaster / science mechanism |
| Angle | The question the video answers, in one sentence |
| Format and length | Narrated animation / list / timeline / map-led; minutes |
| Opening | What happens in the first 15–30 s, described in our words (watch it or read a transcript) |
| Why it popped | The likely reason (timely, a strong question, an evergreen search, an unusual angle). Mark it as our judgement |

## 4. Turn outliers into patterns
- **Packaging patterns:** the title templates and thumbnail traits that appear in 3 or more outliers across 2 or more channels. A trait seen once is luck.
- **Format and length patterns:** the median length of outliers vs non-outliers per channel, and which formats over-index.
- **Topic gaps:**
  - a topic that is an outlier elsewhere and that we haven't done;
  - a topic covered only by big channels more than 2 years ago (a "refresh" gap);
  - a question repeated in comments that the video didn't answer;
  - a news topic covered by non-animated explainers only.
- A gap becomes an idea only with **2 signals** (e.g. outlier plus autocomplete). Send it to topics.md with source `competitor-outlier`.

## 5. Fair to borrow vs not
| Fair (ideas and structures aren't owned) | Not fair, never do it |
|---|---|
| A topic or historical event; facts are free to explain | Copying or paraphrasing their script sentence by sentence |
| A general question form ("What if…", "Why did…", "5 times…") | Using their title word for word or near word for word |
| Format, length and pacing structure (cold open, 3 acts, list countdown) | Recreating their thumbnail layout, characters, mascot or art style |
| Thumbnail principles (one subject, ≤3 words, high contrast) | Using their footage, images, music, sound effects or voice clips |
| Following their cited *primary* sources and reading them ourselves | Re-uploading or compiling their clips. The reused-content rules apply even with permission **[official]** |
| Answering a question their comments asked | Their names or brands in our tags, titles or hashtags to borrow traffic (hashtags must relate directly to the video **[official]**) |
| Crediting them in Sources when we use their original analysis | Presenting their unique research, jokes or framing as ours |

- **Test:** would a viewer of both channels think we copied? If yes, change the angle, structure or packaging until the answer is no.
- Every borrowed idea still needs our own perspective line (the monetisation-safety rule).
- YouTube's monetisation policy excludes content "made from a template" or mass-produced **[official]**, so never clone one competitor's series beat for beat.

## 6. Output template (save as `competitors-YYYY-MM.md` next to topics.md)
```
## Competitor outliers: [month] (scan date [YYYY-MM-DD])
Sources: [n searches, n pages, vidIQ credits used: n]
### Channels (n)
| Channel | Tier | Subs (seen date) | Baseline views | Uploads/week | Typical length | Format |
### Outliers (≥3× baseline)
| Video (link) | Channel | Views | Baseline | × | Age | Length | Title pattern | Thumbnail traits | Why |
### Patterns
- Packaging: [pattern] (seen in n outliers, n channels)
- Format/length: ...
- Topic gaps: [gap] (signals: ..., ...)
### Ideas for topics.md (max 5)
| Idea | Our original angle | Gap type | Signals | Slot |
### Not to copy
- [anything distinctive we must avoid echoing]
```

## Sources
- Adapted from AgriciDaniel/claude-youtube `sub-skills/competitor.md` and `sub-skills/ideate.md` (MIT License, Copyright (c) 2025 Daniel Agrici), https://github.com/AgriciDaniel/claude-youtube. The honesty principles in coreyhaines31/marketingskills `skills/competitors/SKILL.md` (MIT License, Copyright (c) 2025 Corey Haines), https://github.com/coreyhaines31/marketingskills, also informed it. Both rewritten.
- Monetisation policies (inauthentic and reused content): https://support.google.com/youtube/answer/1311392
- Hashtag relevance rules: https://support.google.com/youtube/answer/6390658
- Spam and misleading metadata: https://support.google.com/youtube/answer/2801973
- View-counting update: https://support.google.com/youtube/answer/2991785
- The seed channel names are well-known public channels from general knowledge. Check each is current before use.
