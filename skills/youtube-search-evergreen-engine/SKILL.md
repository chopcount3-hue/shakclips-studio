---
name: youtube-search-evergreen-engine
description: Build steady all-year search traffic for Shak Clips with evergreen questions, keyword clusters, query-matched titles and first lines, chapters, cluster playlists, refreshes and Studio checks.
---

# YouTube Search Evergreen Engine (Shak Clips)

Use when planning Tue/Thu/Sat evergreen videos, building a topic cluster, or refreshing an old evergreen video so it keeps earning search views.
Legend: **[V]** = verified on an official Google/YouTube page (see Sources, checked 2026-11-11). **[H]** = heuristic (unverified rule of thumb).
Scope: demand scoring and the backlog live in `youtube-topic-ideation`, the upload package in `youtube-seo-metadata`, title variants in `youtube-title-lab`, and A/B tests in `youtube-experiment-lab`. This skill decides **which queries we own** and **how each video and its cluster answer them**.

## 1. How YouTube search ranks [V]
| Element | YouTube's description | Our lever |
|---|---|---|
| Relevance | how well "the title, tags, description, and video content" match the query | Say the query in the title, description line 1, one chapter label and the first 20 s of narration |
| Engagement | e.g. viewers' watch time for that video on that query | Answer the query fast and fully, with no padding |
| Quality | channels showing "expertise, authoritativeness, and trustworthiness" on a topic | Sources in every description; several videos on one topic (a cluster) |
- Search results "are not a list of the most-viewed videos" for a query **[V]**, so a 7-subscriber channel can rank by being the best answer.
- Results are personalised by search and watch history **[V]**. Check rankings in a private tab, never on the owner's own signed-in app.
- Tags are "not important" except for spelling variants **[V]**. Spend under 1 minute on them.

## 2. Find questions people search all year
Use 2 or more sources per query, and record them in `topics.md` (format in `youtube-topic-ideation`).
1. **YouTube autocomplete.** Predictions come from "what other people have already searched for", using factors like popularity or similarity **[V]**. They can be personalised even signed out **[V]**, so use a private tab. No prediction can mean the term is unpopular or new **[V]**.
   - Seeds: `what if`, `why did`, `how did`, `what happened to`, `history of`, `how long`, `can humans`, each followed by the head term (e.g. "mars").
   - If the run can't reach an autocomplete source, use owner task 8.3. Never work around a block.
2. **Google Trends, YouTube Search.** The search-type menu above the chart says "Web Search" by default; choose "YouTube Search" **[V]** (Google News Initiative lesson). Set United States and "Past 5 years". Values are relative (0–100), and low volume shows as 0 **[V]**.
3. **"People also ask" and related searches.** Run WebSearch for `[head term] why`, `how`, `what if` and harvest the questions in result titles and FAQ blocks **[H]**.
4. **Studio Trends tab** (Analytics → Trends; it may look different during the Studio redesign rolling out from July 2026) **[V]**: your audience's top searches over 28 days, and content gaps, where "viewers can't find enough quality search results" **[V]**. It is usually empty for a tiny channel **[H]**, so check it monthly.
5. YouTube's description tips name "the Research tab in YouTube Analytics and Google Ads Keyword Planner" as keyword sources **[V]**.

**Evergreen test (all must be yes) [H]:**
- [ ] The question made sense 2 years ago and will in 2 years.
- [ ] The 5-year Trends line has no single spike above 3× its median.
- [ ] It autocompletes from 2 or more seeds.
- [ ] It can be answered in 8–10 min, with 2+ sources per claim.
- [ ] The top 5 results are over 12 months old or answer badly.

## 3. Keyword clusters: one query per video
- A cluster is 1 **hub** (the broad head term) plus 4–6 **spokes**, each answering one exact query **[H]**.
- Never aim two of our videos at the same query, because they compete with each other **[H]**.
- Publish 2 spokes first (long-tail queries are easier to win), and the hub once 3 or more spokes exist, so it can link to them **[H]**.
- Rhythm: Tue = history cluster, Thu = science/what-if or space cluster, Sat = a Top-5 that rolls up a cluster **[H]**.

Example clusters (candidates only; run section 2 on each spoke and verify every number before scheduling):
| Lane | Cluster playlist | Hub (broad) | Spokes (one query each) |
|---|---|---|---|
| History | Ancient Rome, Explained | why did the roman empire fall | how was roman concrete made · what did romans eat · how did roman aqueducts work · why did rome split in two · who was the last roman emperor |
| History / Top-5 | History's Greatest Cons | 5 greatest cons in history (Sat) | who sold the eiffel tower (made 2026-11-08) · the man who sold the brooklyn bridge · the great diamond hoax of 1872 · how the first ponzi scheme worked |
| What-if | What If Earth... | what if earth stopped spinning | what if the moon disappeared · what if earth had rings · what if the sun disappeared · what if earth had two moons |
| Space | Mars, Explained | can humans live on mars | how long does it take to get to mars · why is mars red · what happened to the water on mars · how cold is mars |
| Space | Rockets, Explained | how do rockets work | how does spacex catch rockets (made 2026-11-10) · why do rockets have stages · how do rockets land |

## 4. Match the title to the query
- Use the "searchable" title type, which "clearly outline[s] what to expect" **[V]**, with the most important words near the beginning **[V]** and series branding at the end **[V]**.
- Shape: `[query, reworded as a title] + [? or :] + [a concrete, true payoff]` **[H]**.
  - Query "how long does it take to get to mars" → `How Long Does It Take to Get to Mars? The 26-Month Rule`.
  - Query "what if earth had rings" → `What If Earth Had Rings? Every Night Would Change`.
- Query-match check **[H]**: the title contains the query's 3+ key words in the first 45 characters, in natural order. No dates in evergreen titles.
- For 3 variants and scoring, hand off to `youtube-title-lab`. Keep the query-match check as a hard filter on every variant.

## 5. First 2 description lines, chapters, narration
- YouTube says to pick "1-2 main words" and "feature them prominently in both your description and title", to use the first few lines to describe the video "because it's what viewers will see first", and to keep every description unique **[V]**.
- **Line 1 (150 characters or fewer [H]):** the query as a question plus a one-line answer promise.
- **Line 2:** our angle plus a sibling spoke's query in natural words.
  - Example: `How long does it take to get to Mars? Between about 6 and 9 months, and it only works once every 26 months.` / `Our angle: the planets set the schedule, not the rocket. Also: can humans live on Mars?`
- These two lines form the first paragraph of the runbook's two-paragraph hook. Keep the runbook's sources block and the rest of `youtube-seo-metadata`'s layout.
- **Chapters [V]:** 00:00 first, at least 3 in ascending order, each at least 10 s. Google Search may build key moments from a YouTube description and will "prioritize key moments set by you" **[V]**.
  - Label 5–7 chapters as sub-questions people search ("Why the trip takes months", "The 26-month window"), never "Part 2" **[H]**.
- **Narration:** speak the query in the first 20 s, because relevance includes video content **[V]**. The exact SRT from `youtube-seo-metadata` puts it in text form too.
- Add one line, `More in this series: [cluster playlist URL]`. YouTube advises to "link out to playlists of related videos" **[V]**.

## 6. Search-friendly playlists
- Make one **normal** playlist per cluster, titled with the head term (e.g. `Mars Explained: Every Big Question`) **[H]**.
- A video can be in only one *series* playlist, and series playlists need a verified account **[V]**. Our format series playlists (True Story Tuesday and the rest, see `youtube-community-engagement`) use that slot, so cluster playlists stay normal playlists. A video can sit in both kinds.
- Playlist description: 2 plain sentences naming the head term and 3 spoke questions, never a keyword list **[H]**.
- Order: the hub first, then the spokes in the order a beginner would ask them **[H]**.
- Playlists are their own traffic source in Studio **[V]**, so you can see whether the cluster pulls viewers through.

## 7. Refresh an old evergreen video
YouTube's view: "Changing your video title and thumbnail can be an effective way to get more views, but don't change what's working" **[V]**. Updating older thumbnails can raise appeal to new viewers **[V]**.
| Check at 28 d, then every 90 d [H] | Action (one change per check) |
|---|---|
| A search term we didn't target brings 20%+ of the video's search views | Rewrite the title to lead with that term, keeping the same promise |
| Search impressions exist, but CTR is below the channel median at 2 checks | New thumbnail first; the title only if CTR is still low at the next check |
| No search terms at all after 60 d | Rewrite description line 1 and the chapter labels to the closest autocomplete query |
| A new spoke or hub in its cluster goes live | Point its end screen at the new video and add it to the cluster playlist |
- Never refresh while daily views are rising, or within 7 days of the last change **[H]**. Log the old and new values in `log.md`.
- Apply title and thumbnail changes free through runbook step 13b (`daily/updates.json`). Use `youtube-experiment-lab` for a proper test.
- Old videos take off when viewers binge a channel or follow a rising topic **[V]**. When that happens, publish that cluster's next spoke within 7 days **[H]**.

## 8. Judge search traffic in Studio (owner tasks, phone)
**8.1 Weekly, about 2 min per evergreen video aged 28 d or more:**
1. Open the YouTube Studio app → **Content** → tap the video → **Analytics** → **Reach** **[V]**.
2. In **Traffic source types**, note the % for YouTube search.
3. Open the **Traffic source: YouTube search** card **[V]**, then copy the top 5 terms.
4. Paste into chat: `video title | search % | term1, term2, term3, term4, term5`.

**8.2 How Claude reads it [H]:**
| At 28 d | Meaning | Next step |
|---|---|---|
| Search is 30%+ of views and the terms match the title | The cluster is working | Schedule the next spoke |
| Search is 30%+, but the terms differ from the title | We rank for a different query | Retitle toward the real term (section 7) |
| Search is under 10% | Not ranking | Recheck query match and competition, or fold the topic into a Top-5 |
| Views per day hold or rise from day 30 to 60 | It is evergreen | Give its cluster priority in `topics.md` |
- Under 100 views, read the terms and ignore the percentages **[H]**.
- External sources means "websites and apps that have your YouTube video embedded or linked to" **[V]**. Google Search visits should land there **[H]**, so check that card's detail for Google.

**8.3 Monthly, 3 min (only if the run can't read autocomplete):** in a private tab of phone Chrome, open m.youtube.com, type each of 3 seed phrases Claude names, and screenshot the suggestion list into chat.

## Sources
- How YouTube search works: https://support.google.com/youtube/answer/16090438
- Discovery and performance FAQs (search, title changes, old videos taking off): https://support.google.com/youtube/answer/141805
- Search predictions: https://support.google.com/youtube/answer/9872296
- Google Trends search types (Google News Initiative): https://newsinitiative.withgoogle.com/resources/trainings/advanced-google-trends/
- Trends data normalisation: https://support.google.com/trends/answer/4365533
- Studio Trends tab: https://support.google.com/youtube/answer/11962757
- Description tips: https://support.google.com/youtube/answer/12948449
- Title and thumbnail tips: https://support.google.com/youtube/answer/12340300
- Chapters: https://support.google.com/youtube/answer/9884579
- Key moments (last updated 2026-09-24): https://developers.google.com/search/docs/appearance/structured-data/video
- Series playlists: https://support.google.com/youtube/answer/6084043
- Traffic sources and the Reach tab: https://support.google.com/youtube/answer/9314355
- Raw material, rewritten: AgriciDaniel/claude-youtube `references/seo-playbook.md` (MIT License, Copyright (c) 2025 Daniel Agrici), https://github.com/AgriciDaniel/claude-youtube. Its unsourced percentages are not used.
