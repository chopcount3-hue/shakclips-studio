---
name: youtube-title-lab
description: Write, score and test honest Shak Clips titles that earn clicks, with formulas per format, curiosity and specificity rules, mobile front-loading, banned words and rules for changing a live title.
---

# YouTube Title Lab (Shak Clips)

Use when writing the day's long-video and Short titles, when generating Test & Compare alternates, or when a video's CTR is low and the thumbnail has already been changed.
Legend: **[V]** = checked on an official page (see Sources). **[H]** = heuristic, unverified; our own Test & Compare results override it.

Scope split: `youtube-seo-metadata` owns descriptions, chapters, tags, hashtags and the upload package (and holds the honesty gate). `youtube-thumbnail-design` owns the image. **This skill owns only the title string**: generating it, scoring it, pairing it with the thumbnail, and changing it later.

## 1. The official constraints
| Rule | Detail |
|---|---|
| Hard limit | **100 characters** **[V]** |
| Succinctness | "Be succinct. Viewers may only see part of your title." **[V]** |
| Word order | "put the most important words near the beginning" **[V]** |
| Branding | "Save episode numbers and branding for the end" **[V]** |
| Two valid types | **Searchable** titles "clearly outline what to expect so you can easily reach viewers searching for similar content"; **intriguing** titles "spark curiosity and appeal to viewers who may not be looking for topic-specific content" **[V]** |
| Caps and emoji | "Limit ALL CAPS and emoji. Use them carefully, to emphasize emotion or special elements in the video." **[V]** |
| Accuracy | "Be accurate. Make sure your title accurately represents the video." **[V]** |
| Search relevance | Search estimates relevance from how well the **title**, tags, description and video content match the query, plus engagement and quality signals **[V]** |
| Consistency | A steady title and thumbnail style helps viewers recognise your videos quickly **[V]** |
Working targets **[H]**: **45–65 characters**, with the keyword and the hook inside the **first 40**, because mobile and sidebar placements truncate around there. Never go under 30 characters; there is not enough room to say anything specific.

## 2. Honesty and ad-safety limits (a title that breaks these is not a candidate)
- **Spam policy [V]:** malicious clickbait is "Using maliciously misleading titles, thumbnails, descriptions, or imagery to trick users into clicking" on content that does not deliver what was promised — the page's own example is a title offering a full match over a video with only a clip.
- **Egregious clickbait [V]:** Google said (18 Dec 2024) it would strengthen enforcement against titles and thumbnails making "promises or claims that aren't delivered within the video itself", with removal and, in the initial period, no strike; the focus is breaking news and current events, and the rollout started in India — which is where the owner lives.
- **Advertiser-friendly guidelines [V]:** profanity in a title or thumbnail limits ad earnings, and stronger profanity in a title or thumbnail earns none; highly sexualized titles or thumbnails are not suitable for advertising; promoting or glorifying controversial issues "in the content, title, or thumbnail" earns no ad revenue.
- **Clickbait costs reach anyway [V]:** high CTR with low average view duration is a clickbait signal, and such videos are less likely to be recommended.
- Our own house rules: allegations get "alleged" or "reportedly"; no invented numbers; no "real footage" wording for animation; no real person's name in a claim they did not make.

## 3. Formulas by format
Fill these in our own words; never reuse a template sentence verbatim two days running.
**Trending explained (Mon/Wed/Fri/Sun) — search-first**, because people search the named event.
- `[Named event], Explained: [the stake nobody names]`
- `Why [named event] Is Really About [mechanism]`
- `What Actually Happened at [place/company] (and What Is Next)`
- `[Named event]: The Part Everyone Skipped`
**True history (Tue) — browse-first**, keyword still early.
- `The [Weird/Forgotten] Story of [named person or place]`
- `How [person] [did the specific thing] With [constraint]`
- `The [Event] Nobody Got Right for [n] Years`
**What-if / science (Thu)**
- `What If [precise premise]? [first concrete consequence]`
- `[Quantity] Would Be Enough to [consequence]`
- `Why [familiar thing] Would [fail/change] in [time]`
**Top 5 (Sat)**
- `5 [specific category] That [surprising shared outcome]`
- `5 [things], Ranked by [explicit criterion]`
**Shorts** (title matters little in the feed, more in search **[H]**): 30–50 characters, the hook question with the keyword first; never paste the long title.

## 4. Curiosity-gap rules
A gap works when the viewer can **name the missing piece**. If they cannot, it is just vagueness.
| Do | Don't |
|---|---|
| Withhold **one** specific answer the video gives | Withhold the subject itself ("This Changed Everything") |
| Name the category and hide the member ("the only country that refused") | Hide both ("You won't believe what happened") |
| Imply a wrong belief the viewer may hold ("The date is wrong") | Accuse the viewer ("You've Been Lied To") |
| Use a real contradiction from the research | Manufacture a contradiction for the title |
| Let the thumbnail ask and the title answer, or the reverse | Let both ask, so nothing is known |
Banned openers, because they carry no information: "You won't believe", "This is insane", "Shocking truth", "Gone wrong", "Nobody is talking about this" (unless literally true and shown), "The truth about". Banned devices: all-caps words beyond one, more than one exclamation mark, any emoji, brackets stacked twice (`[2026] [Explained]`), and the word "MUST".

## 5. Specificity and numbers
- Swap every abstract noun for a thing: not "a huge fortune" but "forty tonnes of silver". Specificity is what makes a title checkable, and checkable is what keeps it honest.
- Numbers belong in a title when they are **load-bearing** and **verified** (2+ independent sources, runbook rule): a count for top-5, a duration, a scale, a year. Whether numbers lift CTR by themselves is unverified **[H]** — third-party guides claim it, and no YouTube page says so.
- Prefer odd, exact figures over rounded ones only when the exact figure is the sourced one. Never round up to sound better.
- One number per title. Two numbers read as a spreadsheet.
- Front-load: the keyword and the hook in the first 40 characters, the series tag last, matching the official "important words first, branding at the end" guidance **[V]**.

## 6. Generate and score 5–10 candidates
Generate **at least 5** (ideally 8) spread across mechanisms: searchable, curiosity gap, contradiction, number/scale, "you" scenario. Then score each out of 25; **the top 3 become the live title plus the two Test & Compare alternates**.
| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **Promise kept** | the video cannot deliver it | delivered late | delivered and visibly started in the first 30 s |
| **Front-load** | keyword past char 60 | keyword by char 55 | keyword and hook inside char 40 |
| **Specificity** | abstract nouns | one concrete thing | a thing plus a sourced number or name |
| **Curiosity** | states everything | mild gap | a gap the viewer can name, answered in the video |
| **Pairing** | repeats thumbnail words | overlaps in tone | adds what the image cannot say |
Decision **[H]**: 20+ ship · 15–19 rewrite the lowest criterion · under 15 discard. Reject outright, whatever the score, if the honesty gate in `youtube-seo-metadata` fails.

Output block for the upload package:
```
TITLE CANDIDATES · [date] · [slot]
1. [title] (chars __ , keyword at char __) score __/25  [mechanism]   <- LIVE
2. [title] (chars __) score __/25                      <- Test & Compare alt A
3. [title] (chars __) score __/25                      <- Test & Compare alt B
Rejected: [title] — [which criterion failed]
Thumbnail says: ____ | Title says: ____ | Together they ask: ____
```

## 7. Title and thumbnail pairing
- The title carries the **what** (topic, keyword, named thing). The thumbnail carries the **feeling or the visual question**. No word appears in both.
- Write them as one sentence before approving either: "Title says X, thumbnail adds Y, so the viewer wonders Z." If Z is empty, one of them is doing the other's job.
- Keep the house style stable (same font, palette family, title length band), because a steady style helps recognition **[V]**. Vary the mechanism, not the identity.
- A thumbnail that already shouts a number does not need the number in the title.

## 8. Changing and testing live titles
**Official position [V]:** "Changing your video title and thumbnail can be an effective way to get more views, but don't change what's working." Any re-ranking happens because viewers respond differently to the new version, not because the edit itself triggers anything. YouTube also recommends experimenting with updating older thumbnails to increase appeal to new viewers.

**Test & Compare, as of 2026-11-11 [V]:** titles **are** supported — you can test **title only, thumbnail only, or title and thumbnail together**, up to **3** variants, judged on **watch time share** (not CTR), with a result expected **within two weeks** and labelled **Winner**, **Performed Same** or **Inconclusive**. It runs on **computers only**, in YouTube Studio, needs **advanced features**, and is not available for Shorts, made-for-kids, mature-audience or private videos. **Editing the title during a test stops the test.** With no clear winner, the **first** option uploaded is the one shown.
- Owner task (computer): Studio → Content → click the video → in the Title box click **A/B Testing** → **Title only** → paste the 2 alternates → **Done** **[V]**.
- Owner task (read it): the video → Analytics → **Reach** tab → "How your A/B test is going" **[V]**.

**Manual swap rules when no computer is available** (sequence and thresholds are **[H]**, and they match `youtube-analytics-loop`):
1. Never touch a title in the first 48 h, and never while views are rising day on day.
2. Change the **thumbnail** before the title. Only change the title if CTR is still below 60% of the channel's median 48 h after the thumbnail swap, with **≥500 impressions** (official: do not check CTR right after upload; new videos show a wider range **[V]**).
3. Do not swap when CTR is fine and Intro or AVD is low. That is a hook problem; fix the next video (`youtube-hook-lab`).
4. One change at a time, and log the date and the old string in `log.md` and in `experiments.csv`.
5. Keep the keyword. A rewrite that drops the search phrase can cost search traffic that was working.
6. Owner task (phone, free): YouTube Studio app → **Content** → tap the video → tap the pencil / **Edit details** → change the title → **Save** **[H]** (help pages document only the desktop path: Studio → Content → click the video's title or thumbnail → edit → save **[V]**). The repo's free GitHub "YouTube update" workflow can also apply a title change (runbook 13b) without spending vidIQ credits.
7. For an evergreen video older than 28 days with low CTR, a retitle is low-risk and officially encouraged for refreshing appeal **[V]**.

## 9. Pre-publish title checklist
- [ ] Under 100 characters, target 45–65, keyword and hook inside the first 40.
- [ ] One capitalised word at most, no emoji, one number at most, no stacked brackets.
- [ ] Promise is paid off in the video and visibly starts inside 30 s.
- [ ] Allegations labelled; no invented figure; every number sourced twice.
- [ ] No banned opener or device from section 4.
- [ ] No word shared with the thumbnail text; the pairing sentence is written down.
- [ ] Series or episode tag, if any, sits at the end.
- [ ] 5+ candidates generated and scored; alternates A and B saved for Test & Compare.
- [ ] Short's title written separately, 30–50 characters, not a copy of the long one.
- [ ] Nothing in the title would limit ad earnings (profanity, sexualized framing, glorified controversy).

## Sources
- Thumbnail & title tips (succinct, important words first, branding at the end, searchable vs intriguing, limit ALL CAPS and emoji, be accurate, experiment with older thumbnails, check Home and Suggested CTR in the first 24 h): https://support.google.com/youtube/answer/12340300
- Title 100-character limit, description 5,000: https://support.google.com/youtube/answer/57407
- A/B test titles & thumbnails (title testing supported, up to 3, watch time share, two weeks, Winner / Performed Same / Inconclusive, computer-only, advanced features, Shorts and made-for-kids excluded, edits stop the test, first option shown when no winner): https://support.google.com/youtube/answer/16391400
- Advanced features list including A/B testing; Settings → Channel → Feature eligibility: https://support.google.com/youtube/answer/9890437
- How YouTube search works (relevance from title, tags, description and content; engagement; quality): https://support.google.com/youtube/answer/16090438
- Performance and discovery FAQ ("don't change what's working"; re-ranking comes from viewer response; accurate titles, avoid clickbait and all-caps): https://support.google.com/youtube/answer/141805
- Impressions CTR FAQ (2–10% band, wider for new videos, don't check right after upload, high CTR with low AVD as a clickbait signal): https://support.google.com/youtube/answer/7628154
- Spam policy, malicious clickbait definition and example: https://support.google.com/youtube/answer/2801973
- Google blog, strengthening enforcement against egregious clickbait, 18 Dec 2024 (removal without a strike at first, news and current-events focus, India rollout): https://blog.google/intl/en-in/products/platforms/strengthening-enforcement-against-egregious-clickbait-on-youtube/
- Advertiser-friendly content guidelines (profanity, sexualized and controversial framing in titles and thumbnails): https://support.google.com/youtube/answer/6162278
- Recommendation system (consistent title and thumbnail style aids recognition; quality over frequency): https://support.google.com/youtube/answer/16533387
- Edit video settings, desktop path: https://support.google.com/youtube/answer/57404
- Curiosity-formula families and the thumbnail-complementarity rule were compared against kenneth-liao/ai-launchpad-marketplace `creator-stack/skills/title/references/youtube-title-formulas.md` (no licence file found in the clone, so nothing was copied) and AgriciDaniel/claude-youtube `references/seo-playbook.md` (MIT, Copyright (c) 2025 Daniel Agrici): /home/claude/untrusted/skills-research/. Their CTR lift figures ("+20–30% for numbers", "70–100 character titles outperform by 10–14%") are third-party and unsourced, so they are labelled [H] and not used as targets.
